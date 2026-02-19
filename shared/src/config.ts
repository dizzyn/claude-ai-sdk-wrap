import { resolve, dirname } from "path";
import { existsSync } from "fs";

function findProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== dirname(dir)) {
    if (existsSync(resolve(dir, "CLAUDE.md"))) return dir;
    dir = dirname(dir);
  }
  throw new Error("Could not find project root (CLAUDE.md not found)");
}

const root = findProjectRoot();

/** Absolute path to the workspace/ directory containing legal data */
export const workspacePath = resolve(root, "workspace");

/** Absolute path to CLAUDE.md */
export const claudeMdPath = resolve(root, "CLAUDE.md");

/** Tools the agent is allowed to use */
export const allowedTools: string[] = [
  "Read",
  "Glob",
  "Grep",
  "Bash",
  "WebSearch",
  "WebFetch",
];

/** Model to use */
export const model = "claude-haiku-4-5";

/** Default max turns for the agent */
export const defaultMaxTurns = 30;

/** Which backend to use: "claude" (Agent SDK) or "cline" (Cline CLI) */
export const agentBackend = (process.env.AGENT_BACKEND ?? "claude") as "claude" | "cline";

/** Cline CLI configuration (only used when agentBackend === "cline") */
export const clineConfig = {
  bin: process.env.CLINE_BIN ?? "cline",
  model: process.env.CLINE_MODEL as string | undefined,
  timeout: Number(process.env.CLINE_TIMEOUT) || 300,
  configDir: process.env.CLINE_CONFIG as string | undefined,
};
