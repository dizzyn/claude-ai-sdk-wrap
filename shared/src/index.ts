export { workspacePath, claudeMdPath, allowedTools, defaultMaxTurns, model, agentBackend, clineConfig } from "./config.js";
export { queryAgent, type QueryAgentOptions } from "./agent.js";
export { agentTextStream, writeAgentToUIStream } from "./stream-utils.js";
export type { BackendProvider } from "./backend.js";
export { getBackend } from "./backend-factory.js";
