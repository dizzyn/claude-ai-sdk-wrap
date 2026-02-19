import type { QueryAgentOptions } from "./agent.js";
import { getBackend } from "./backend-factory.js";

/**
 * Runs the agent and yields plain text chunks as they appear.
 * Delegates to the active backend (Claude SDK or Cline CLI).
 */
export async function* agentTextStream(
  opts: QueryAgentOptions,
): AsyncGenerator<string> {
  yield* getBackend(opts.backend).textStream(opts);
}

/**
 * Writes SDK messages into a UI message stream writer (AI SDK v6).
 * The writer.write() accepts UIMessageChunk objects.
 */
export async function writeAgentToUIStream(
  opts: QueryAgentOptions,
  writer: {
    write: (chunk: any) => void;
  },
): Promise<void> {
  const partId = "part-0";
  let started = false;

  for await (const chunk of agentTextStream(opts)) {
    if (!started) {
      writer.write({ type: "text-start", id: partId });
      started = true;
    }
    writer.write({ type: "text-delta", id: partId, delta: chunk });
  }
  if (started) {
    writer.write({ type: "text-end", id: partId });
  }
}
