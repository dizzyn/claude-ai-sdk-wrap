import type { BackendProvider } from "./backend.js";
import { agentBackend } from "./config.js";
import { ClaudeBackend } from "./claude-backend.js";
import { ClineBackend } from "./cline-backend.js";

const instances: Record<string, BackendProvider> = {};

function resolve(name: string): BackendProvider {
  if (instances[name]) return instances[name];

  switch (name) {
    case "cline":
      instances[name] = new ClineBackend();
      break;
    case "claude":
    default:
      instances[name] = new ClaudeBackend();
      break;
  }

  return instances[name];
}

/**
 * Returns a BackendProvider. If `override` is provided it takes precedence
 * over the AGENT_BACKEND env var.
 */
export function getBackend(override?: "claude" | "cline"): BackendProvider {
  return resolve(override ?? agentBackend);
}
