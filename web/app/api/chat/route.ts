import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { writeAgentToUIStream } from "@laws/shared";

export const maxDuration = 300;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: UIMessage[];
    backend?: "claude" | "cline";
    model?: string;
  };
  const { messages, backend, model } = body;

  // Extract the last user message text
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const prompt = extractText(lastUserMsg);

  if (!prompt) {
    return new Response("No user message found", { status: 400 });
  }

  const abortController = new AbortController();
  req.signal.addEventListener("abort", () => abortController.abort());

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      await writeAgentToUIStream({ prompt, abortController, backend, model }, writer);
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function extractText(message: UIMessage | undefined): string {
  if (!message) return "";

  if (message.parts) {
    return message.parts
      .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
      .map((p) => p.text)
      .join("\n");
  }

  return "";
}
