/**
 * AI Chat Streaming API Route (Default Pattern)
 *
 * This is the primary streaming endpoint, running on Vercel Edge.
 * It uses the Vercel AI SDK's streamText to stream responses from
 * OpenAI or Anthropic models.
 *
 * Messages are saved to Convex via the shared mutations in convex/ai.ts.
 * Credit tracking happens when the assistant message is saved.
 *
 * Alternative: Convex HTTP action pattern (see convex/http.ts)
 *
 * @see ADR-004 Dual AI Streaming Patterns
 */

import { streamText, UIMessage, convertToModelMessages } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { isValidModel } from "@/lib/aiModels";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const {
    messages,
    model: modelId = "gpt-4o",
    teamId,
  }: {
    messages: UIMessage[];
    model?: string;
    teamId?: string;
  } = body;

  // Validate model ID
  if (!isValidModel(modelId)) {
    return new Response(
      JSON.stringify({ error: `Unsupported model: ${modelId}` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate messages present
  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: "Messages are required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Select provider based on model ID
  const model = modelId.startsWith("claude")
    ? anthropic(modelId)
    : openai(modelId);

  const result = streamText({
    model,
    system:
      "You are a helpful AI assistant. Be concise and clear in your responses.",
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 2048,
    temperature: 0.7,
    onFinish: ({ usage }) => {
      // Credit tracking is done client-side via saveAssistantMessage mutation
      // because this Edge route doesn't have Convex server context.
      // The client calls saveAssistantMessage after streaming completes.
      // We log here for debugging.
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[AI Chat] Model: ${modelId}, Team: ${teamId ?? "unknown"}, Tokens: ${usage.totalTokens}`,
        );
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
