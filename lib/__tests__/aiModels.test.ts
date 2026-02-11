import { describe, expect, it } from "vitest";
import { SUPPORTED_AI_MODELS, isValidModel } from "../aiModels";
import { AI_CREDIT_COSTS, getAICreditCost } from "../planConfig";

describe("lib/aiModels", () => {
  describe("SUPPORTED_AI_MODELS", () => {
    it("should export 4 models", () => {
      expect(SUPPORTED_AI_MODELS).toHaveLength(4);
    });

    it("should include both OpenAI and Anthropic providers", () => {
      const providers = [
        ...new Set(SUPPORTED_AI_MODELS.map((m) => m.provider)),
      ];
      expect(providers).toContain("openai");
      expect(providers).toContain("anthropic");
    });

    it("each model should have all required fields", () => {
      for (const model of SUPPORTED_AI_MODELS) {
        expect(typeof model.id).toBe("string");
        expect(typeof model.label).toBe("string");
        expect(typeof model.credits).toBe("number");
        expect(model.credits).toBeGreaterThan(0);
        expect(["openai", "anthropic"]).toContain(model.provider);
      }
    });

    it("credit costs should match planConfig", () => {
      for (const model of SUPPORTED_AI_MODELS) {
        expect(model.credits).toBe(getAICreditCost(model.id));
      }
    });

    it("should cover all models defined in AI_CREDIT_COSTS", () => {
      const modelIds = SUPPORTED_AI_MODELS.map((m) => m.id);
      for (const costModelId of Object.keys(AI_CREDIT_COSTS)) {
        expect(modelIds).toContain(costModelId);
      }
    });
  });

  describe("isValidModel", () => {
    it("should return true for supported models", () => {
      expect(isValidModel("gpt-4o")).toBe(true);
      expect(isValidModel("gpt-4o-mini")).toBe(true);
      expect(isValidModel("claude-sonnet-4-5-20250929")).toBe(true);
      expect(isValidModel("claude-haiku-4-5-20251001")).toBe(true);
    });

    it("should return false for unsupported models", () => {
      expect(isValidModel("gpt-3.5-turbo")).toBe(false);
      expect(isValidModel("unknown-model")).toBe(false);
      expect(isValidModel("")).toBe(false);
    });
  });
});
