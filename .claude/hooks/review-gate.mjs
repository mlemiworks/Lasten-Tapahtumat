#!/usr/bin/env node
// Commit gate (C03, D12): see docs/workflow.md, "Commit gate".
// Hook mode (no args): PreToolUse JSON on stdin; exit 2 blocks the tool call.
// CLI mode: approve|reject <CNN-Sn> (allowed only inside /sdd-review's subagent), hash, status.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const VERDICT = ['.claude', 'state', 'review.json'];
const VALUE_FLAGS = new Set(['-m', '--message', '-F', '--file']);
const PLAIN_FLAGS = new Set(['-q', '--quiet', '-s', '--signoff']);
const SEP = '\u0000';

function git(args, cwd) {
  return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
}
function repoRoot(cwd) {
  return git(['rev-parse', '--show-toplevel'], cwd).toString('utf8').trim();
}
function stagedHash(root) {
  const diff = git(['diff', '--cached', '--binary', '--no-color', '--no-ext-diff'], root);
  return diff.length === 0 ? null : createHash('sha256').update(diff).digest('hex');
}
function block(reason) {
  process.stderr.write(`Commit gate: ${reason}\n`);
  process.exit(2);
}

// Quote-aware split; shell separators and $( ) ` become SEP so chained and nested commands are seen.
function tokenize(s) {
  const out = [];
  let cur = '', quote = null, started = false;
  const flush = () => { if (started) out.push(cur); cur = ''; started = false; };
  for (const ch of s) {
    if (quote) { if (ch === quote) quote = null; else cur += ch; continue; }
    if (ch === '"' || ch === "'") { quote = ch; started = true; continue; }
    if (';&|\n()`'.includes(ch)) { flush(); out.push(SEP); continue; }
    if (/\s/.test(ch)) { flush(); continue; }
    cur += ch; started = true;
  }
  flush();
  return out;
}

function gitCommits(tokens) {
  const found = [];
  let seg = [];
  for (const t of [...tokens, SEP]) {
    if (t !== SEP) { seg.push(t); continue; }
    const i = seg.findIndex((x) => /(^|[\\/])git(\.exe)?$/i.test(x));
    if (i >= 0) {
      let j = i + 1, dir = null;
      while (j < seg.length && seg[j].startsWith('-')) {
        if (seg[j] === '-C') { dir = seg[j + 1]; j += 2; }
        else if (['-c', '--git-dir', '--work-tree', '--namespace'].includes(seg[j])) j += 2;
        else j += 1;
      }
      if (seg[j] === 'commit') found.push({ args: seg.slice(j + 1), dir });
    }
    seg = [];
  }
  return found;
}

function disallowedArg(args) {
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (VALUE_FLAGS.has(a)) { k++; continue; }
    if (/^--(message|file)=/.test(a) || /^-[mF]./.test(a) || PLAIN_FLAGS.has(a)) continue;
    return a;
  }
  return null;
}

function hookMode(raw) {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const tokens = tokenize(String(input?.tool_input?.command ?? ''));
  const recordsVerdict = tokens.some((t, k) => /review-gate\.mjs$/.test(t) && ['approve', 'reject'].includes(tokens[k + 1]));
  if (recordsVerdict && !input.agent_id) block('only /sdd-review (a forked subagent) may record a verdict.');
  const commits = gitCommits(tokens);
  if (commits.length === 0) process.exit(0);
  try {
    for (const c of commits) {
      const bad = disallowedArg(c.args);
      if (bad) block(`"${bad}" is not allowed. Stage paths with git add, then run git commit -m "<message>".`);
      const base = input.cwd || process.cwd();
      const root = repoRoot(c.dir ? resolve(base, c.dir) : base);
      const hash = stagedHash(root);
      if (!hash) block('nothing is staged.');
      const file = join(root, ...VERDICT);
      if (!existsSync(file)) block('no review verdict. Run /sdd-review on the staged diff first.');
      const v = JSON.parse(readFileSync(file, 'utf8'));
      if (v.verdict !== 'approved') block(`review ${v.id} requested changes.`);
      if (v.hash !== hash) block(`the staged diff changed after review ${v.id}. Run /sdd-review again.`);
    }
  } catch (e) {
    block(`internal error, commit blocked: ${e.message}`);
  }
  process.exit(0);
}

function cliMode([cmd, id]) {
  const root = repoRoot(process.cwd());
  const file = join(root, ...VERDICT);
  const hash = stagedHash(root);
  if (cmd === 'hash') { console.log(hash ?? 'nothing staged'); return; }
  if (cmd === 'status') {
    console.log(existsSync(file) ? readFileSync(file, 'utf8').trim() : 'no verdict');
    console.log(`staged: ${hash ?? 'nothing'}`);
    return;
  }
  if (cmd === 'approve' || cmd === 'reject') {
    if (!id) { console.error('usage: review-gate.mjs approve|reject <CNN-Sn>'); process.exit(1); }
    if (!hash) { console.error('nothing staged'); process.exit(1); }
    mkdirSync(join(root, '.claude', 'state'), { recursive: true });
    const v = { id, verdict: cmd === 'approve' ? 'approved' : 'changes', hash, at: new Date().toISOString() };
    writeFileSync(file, JSON.stringify(v, null, 2) + '\n');
    console.log(`${v.verdict}: ${id} ${hash.slice(0, 12)}`);
    return;
  }
  console.error('usage: review-gate.mjs [approve|reject <CNN-Sn> | hash | status]');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length) cliMode(args);
else {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { raw += d; });
  process.stdin.on('end', () => hookMode(raw));
}
