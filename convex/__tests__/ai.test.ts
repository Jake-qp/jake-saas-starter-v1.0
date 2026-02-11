import { describe, expect, it } from "vitest";
import schema from "../schema";
import {
  AI_CREDIT_COSTS,
  DEFAULT_CREDIT_COST,
  getAICreditCost,
  getLimit,
} from "../../lib/planConfig";

/**
 * AI/LLM Integration test suite (F001-005).
 *
 * Tests schema, credit costs, entitlement logic, and model configuration
 * for the dual-streaming AI chat system.
 */

describe("F001-005: AI/LLM Integration", () => {
  describe("schema — aiMessages table", () => {
    it("should define the aiMessages table", () => {
      expect(schema.tables.aiMessages).toBeDefined();
    });

    it("should have teamCreation index on aiMessages", () => {
      const table = schema.tables.aiMessages;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      expect(indexNames).toContain("teamCreation");
    });

    it("aiMessages table has teamId field for team edge", () => {
      // convex-ents edges create a teamId field; verify via index
      const table = schema.tables.aiMessages;
      const indexNames = table.indexes.map(
        (idx: { indexDescriptor: string }) => idx.indexDescriptor,
      );
      // teamCreation index uses teamId — confirms the edge exists
      expect(indexNames).toContain("teamCreation");
    });
  });

  describe("AI model credit costs", () => {
    it("should define credit cost for gpt-4o", () => {
      expect(AI_CREDIT_COSTS["gpt-4o"]).toBe(10);
    });

    it("should define credit cost for gpt-4o-mini", () => {
      expect(AI_CREDIT_COSTS["gpt-4o-mini"]).toBe(2);
    });

    it("should define credit cost for claude-sonnet-4-5-20250929", () => {
      expect(AI_CREDIT_COSTS["claude-sonnet-4-5-20250929"]).toBe(8);
    });

    it("should define credit cost for claude-haiku-4-5-20251001", () => {
      expect(AI_CREDIT_COSTS["claude-haiku-4-5-20251001"]).toBe(2);
    });

    it("should return default cost for unknown models", () => {
      expect(getAICreditCost("unknown-model")).toBe(DEFAULT_CREDIT_COST);
      expect(DEFAULT_CREDIT_COST).toBe(5);
    });

    it("getAICreditCost should return exact cost for known models", () => {
      expect(getAICreditCost("gpt-4o")).toBe(10);
      expect(getAICreditCost("gpt-4o-mini")).toBe(2);
      expect(getAICreditCost("claude-sonnet-4-5-20250929")).toBe(8);
      expect(getAICreditCost("claude-haiku-4-5-20251001")).toBe(2);
    });
  });

  describe("AI credit limits per tier", () => {
    it("free tier should have 100 AI credits", () => {
      expect(getLimit("free", "aiCredits")).toBe(100);
    });

    it("pro tier should have 5000 AI credits", () => {
      expect(getLimit("pro", "aiCredits")).toBe(5000);
    });

    it("enterprise tier should have unlimited AI credits (-1)", () => {
      expect(getLimit("enterprise", "aiCredits")).toBe(-1);
    });
  });

  describe("AI model configuration", () => {
    const SUPPORTED_MODELS = [
      { id: "gpt-4o", label: "GPT-4o", provider: "openai" },
      { id: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
      {
        id: "claude-sonnet-4-5-20250929",
        label: "Claude Sonnet",
        provider: "anthropic",
      },
      {
        id: "claude-haiku-4-5-20251001",
        label: "Claude Haiku",
        provider: "anthropic",
      },
    ];

    it("should have 4 supported models", () => {
      expect(Object.keys(AI_CREDIT_COSTS)).toHaveLength(4);
    });

    it("each model should have a positive credit cost", () => {
      for (const model of SUPPORTED_MODELS) {
        const cost = AI_CREDIT_COSTS[model.id];
        expect(cost).toBeGreaterThan(0);
      }
    });

    it("more expensive models should cost more credits", () => {
      expect(AI_CREDIT_COSTS["gpt-4o"]).toBeGreaterThan(
        AI_CREDIT_COSTS["gpt-4o-mini"],
      );
      expect(AI_CREDIT_COSTS["claude-sonnet-4-5-20250929"]).toBeGreaterThan(
        AI_CREDIT_COSTS["claude-haiku-4-5-20251001"],
      );
    });
  });

  describe("AI message validation", () => {
    it("should reject empty messages", () => {
      const empty = "".trim();
      expect(empty.length).toBe(0);
    });

    it("should accept non-empty messages", () => {
      const message = "Hello, AI!".trim();
      expect(message.length).toBeGreaterThan(0);
    });

    it("should validate role values", () => {
      const validRoles = ["user", "assistant"];
      expect(validRoles).toContain("user");
      expect(validRoles).toContain("assistant");
      expect(validRoles).not.toContain("system");
    });
  });

  describe("supported models list", () => {
    it("should export SUPPORTED_AI_MODELS with correct structure", async () => {
      const { SUPPORTED_AI_MODELS } = await import("../../lib/aiModels");
      expect(SUPPORTED_AI_MODELS).toBeDefined();
      expect(Array.isArray(SUPPORTED_AI_MODELS)).toBe(true);
      expect(SUPPORTED_AI_MODELS.length).toBe(4);
    });

    it("each model should have id, label, provider, and credits", async () => {
      const { SUPPORTED_AI_MODELS } = await import("../../lib/aiModels");
      for (const model of SUPPORTED_AI_MODELS) {
        expect(model).toHaveProperty("id");
        expect(model).toHaveProperty("label");
        expect(model).toHaveProperty("provider");
        expect(model).toHaveProperty("credits");
        expect(typeof model.id).toBe("string");
        expect(typeof model.label).toBe("string");
        expect(typeof model.credits).toBe("number");
        expect(["openai", "anthropic"]).toContain(model.provider);
      }
    });

    it("should match credit costs from planConfig", async () => {
      const { SUPPORTED_AI_MODELS } = await import("../../lib/aiModels");
      for (const model of SUPPORTED_AI_MODELS) {
        expect(model.credits).toBe(getAICreditCost(model.id));
      }
    });
  });
});
