import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16.3+ `next dev` otherwise writes AGENTS.md and CLAUDE.md into the repo root (D6).
  agentRules: false,
};

export default nextConfig;
