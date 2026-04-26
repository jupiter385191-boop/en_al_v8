import { describe, expect, it } from "vitest";
import { MODELS } from "./models.generated.js";

describe("MODELS fallback entries", () => {
	it("keeps compatibility aliases for important generated models", () => {
		expect(MODELS.google["gemma-4-26b-it"]).toMatchObject({
			id: "gemma-4-26b-it",
			provider: "google",
		});

		expect(MODELS.anthropic["claude-sonnet-4-6"]).toMatchObject({
			id: "claude-sonnet-4-6",
			provider: "anthropic",
			contextWindow: 1000000,
		});

		expect(MODELS.openai["gpt-5.4"]).toMatchObject({
			id: "gpt-5.4",
			provider: "openai",
			maxTokens: 128000,
		});

		expect(MODELS.openrouter["openai/gpt-5-image"]).toMatchObject({
			id: "openai/gpt-5-image",
			provider: "openrouter",
			maxTokens: 128000,
		});

		expect(MODELS.openrouter["openai/gpt-5-image-mini"].input).toContain("image");

		expect(MODELS.openrouter["arcee-ai/trinity-large-preview:free"]).toMatchObject({
			id: "arcee-ai/trinity-large-preview:free",
			maxTokens: 4096,
		});
	});
});
