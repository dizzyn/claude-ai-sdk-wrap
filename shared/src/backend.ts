import type { QueryAgentOptions } from "./agent.js";

export interface BackendProvider {
  readonly name: string;
  textStream(opts: QueryAgentOptions): AsyncGenerator<string>;
}
