import { spawn } from "child_process";
import { createInterface } from "readline";
import type { BackendProvider } from "./backend.js";
import type { QueryAgentOptions } from "./agent.js";
import { workspacePath, clineConfig } from "./config.js";

/** Cline NDJSON `say` types that carry actual response text. */
const TEXT_SAY_TYPES = new Set(["text", "reasoning", "completion_result"]);

export class ClineBackend implements BackendProvider {
  readonly name = "cline";

  async *textStream(opts: QueryAgentOptions): AsyncGenerator<string> {
    const args = buildArgs(opts.prompt, opts.model);
    const child = spawn(clineConfig.bin, args, {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: workspacePath,
    });

    // Wire up abort support
    const onAbort = () => child.kill("SIGTERM");
    opts.abortController?.signal.addEventListener("abort", onAbort, { once: true });

    // Set up timeout
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
    }, clineConfig.timeout * 1000);

    try {
      const rl = createInterface({ input: child.stdout! });

      for await (const line of rl) {
        if (opts.abortController?.signal.aborted) break;
        if (!line.trim()) continue;

        try {
          const obj = JSON.parse(line);

          // Only yield actual content lines from Cline NDJSON:
          //   say=text          — regular text output
          //   say=reasoning     — model reasoning/thinking
          //   say=completion_result — final answer
          // Skip everything else (task, api_req_started, error_retry, etc.)
          if (obj.type === "say" && TEXT_SAY_TYPES.has(obj.say) && typeof obj.text === "string" && obj.text) {
            yield obj.text;
          }

          // Surface errors to the caller
          if (obj.type === "error" && typeof obj.message === "string") {
            throw new Error(`Cline error: ${obj.message}`);
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith("Cline error:")) throw e;
          // Skip non-JSON lines
        }
      }

      // Wait for process to exit
      const exitCode = await new Promise<number | null>((resolve) => {
        if (child.exitCode !== null) {
          resolve(child.exitCode);
        } else {
          child.on("exit", (code) => resolve(code));
        }
      });

      if (exitCode && exitCode !== 0) {
        throw new Error(`Cline process exited with code ${exitCode}`);
      }
    } catch (err: any) {
      if (err?.code === "ENOENT") {
        throw new Error(
          `Cline binary not found: "${clineConfig.bin}". Install Cline or set CLINE_BIN.`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timer);
      opts.abortController?.signal.removeEventListener("abort", onAbort);
    }
  }
}

function buildArgs(prompt: string, modelOverride?: string): string[] {
  const args = ["--json", "-y", "-c", workspacePath];

  const effectiveModel = modelOverride ?? clineConfig.model;
  if (effectiveModel) {
    args.push("-m", effectiveModel);
  }
  if (clineConfig.timeout) {
    args.push("--timeout", String(clineConfig.timeout));
  }
  if (clineConfig.configDir) {
    args.push("--config", clineConfig.configDir);
  }

  args.push(prompt);
  return args;
}
