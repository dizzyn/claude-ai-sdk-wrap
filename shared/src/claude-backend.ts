import type { BackendProvider } from "./backend.js";
import type { QueryAgentOptions } from "./agent.js";
import { queryAgent } from "./agent.js";

export class ClaudeBackend implements BackendProvider {
  readonly name = "claude";

  async *textStream(opts: QueryAgentOptions): AsyncGenerator<string> {
    let lastText = "";

    for await (const message of queryAgent(opts)) {
      if ("result" in message && typeof message.result === "string") {
        const delta = message.result.slice(lastText.length);
        if (delta) {
          yield delta;
          lastText = message.result;
        }
      }

      if (
        "content" in message &&
        Array.isArray((message as any).content)
      ) {
        const content = (message as any).content as any[];
        const textBlocks = content.filter(
          (b: any) => b.type === "text" && typeof b.text === "string",
        );
        const fullText = textBlocks.map((b: any) => b.text).join("");
        if (fullText && fullText.length > lastText.length) {
          const delta = fullText.slice(lastText.length);
          yield delta;
          lastText = fullText;
        }
      }
    }
  }
}
