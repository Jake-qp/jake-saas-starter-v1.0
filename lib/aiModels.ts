/**
 * AI model configuration — shared between client and server.
 * Credit costs are derived from planConfig.ts (single source of truth).
 *
 * @see ADR-004 Dual AI Streaming Patterns
 * @see lib/planConfig.ts for credit costs
 */

import { getAICreditCost } from "./planConfig";

export interface AIModel {
  id: string;
  label: string;
  provider: "openai" | "anthropic";
  credits: number;
}

/**
 * List of supported AI models.
 * Used by the model selector on the AI chat page and the API route for validation.
 */
export const SUPPORTED_AI_MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    label: "GPT-4o",
    provider: "openai",
    credits: getAICreditCost("gpt-4o"),
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    credits: getAICreditCost("gpt-4o-mini"),
  },
  {
    id: "claude-sonnet-4-5-20250929",
    label: "Claude Sonnet",
    provider: "anthropic",
    credits: getAICreditCost("claude-sonnet-4-5-20250929"),
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku",
    provider: "anthropic",
    credits: getAICreditCost("claude-haiku-4-5-20251001"),
  },
];

/**
 * Validate that a model ID is supported.
 */
export function isValidModel(modelId: string): boolean {
  return SUPPORTED_AI_MODELS.some((m) => m.id === modelId);
}
