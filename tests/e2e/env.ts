import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

// Imported by both configs, so it runs at config load, before any server starts.
// Reads .env only: .env.production.local is never opened.
const fromFile = parseEnv(readFileSync('.env', 'utf8'));

function required(name: string): string {
  const fileValue = fromFile[name];
  if (!fileValue) {
    throw new Error(`e2e guard: ${name} is missing from .env`);
  }
  // A shell value beats .env in Next and Prisma, so a different one would
  // silently point the suite at another database.
  const shellValue = process.env[name];
  if (shellValue !== undefined && shellValue !== fileValue) {
    throw new Error(
      `e2e guard: ${name} is set in the shell and differs from .env; unset it`,
    );
  }
  return fileValue;
}

export const PORT = 3100;
export const BASE_URL = `http://localhost:${PORT}`;
export const DATABASE_URL = required('DATABASE_URL');
export const RESET_TOKEN = required('RESET_TOKEN');
// Only the admin tests (S3) need it, so it may be absent here.
export const E2E_ADMIN_PASSWORD = fromFile.E2E_ADMIN_PASSWORD;
