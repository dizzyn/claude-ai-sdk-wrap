import { query } from "@anthropic-ai/claude-agent-sdk";
import { readFileSync } from "fs";
import {
  workspacePath,
  claudeMdPath,
  allowedTools,
  defaultMaxTurns,
  model,
} from "./config.js";

export interface QueryAgentOptions {
  prompt: string;
  abortController?: AbortController;
  maxTurns?: number;
  /** Override which backend to use ("claude" | "cline"). */
  backend?: "claude" | "cline";
  /** Override the model (passed to the active backend). */
  model?: string;
}

/**
 * Wraps the Claude Agent SDK query() with project-specific config.
 * Yields raw SDK messages — callers decide how to consume them.
 */
export async function* queryAgent(opts: QueryAgentOptions) {
  const systemPrompt = readFileSync(claudeMdPath, "utf-8");

  const stream = query({
    prompt: opts.prompt,
    options: {
      cwd: workspacePath,
      allowedTools,
      permissionMode: "bypassPermissions",
      systemPrompt,
      model: opts.model ?? model,
      maxTurns: opts.maxTurns ?? defaultMaxTurns,
    },
  });

  for await (const message of stream) {
    if (opts.abortController?.signal.aborted) break;
    yield message;
  }
}
