import { createOpenAICompatible } from "@ai-sdk/openai-compatible-v5";
import type { LanguageModelV2 } from "@ai-sdk/provider-v5";
import { MastraModelGateway, type ProviderConfig } from "@mastra/core/llm";

class SuperviseGateway extends MastraModelGateway {
  // Required: Unique identifier for the gateway
  // This ID is used as the prefix for all providers from this gateway
  readonly id = "private";

  // Required: Human-readable name
  readonly name = "My Private Gateway";

  /** Fetch provider configurations from your gateway Returns a record of provider configurations */
  async fetchProviders(): Promise<Record<string, ProviderConfig>> {
    return {
      "my-provider": {
        name: "My Provider",
        models: ["model-1", "model-2", "model-3"],
        apiKeyEnvVar: "MY_API_KEY",
        gateway: this.id,
        url: "https://api.myprovider.com/v1",
      },
    };
  }

  /**
   * Build the API URL for a model
   *
   * @param modelId - Full model ID (e.g., "private/my-provider/model-1")
   * @param envVars - Environment variables (optional)
   */
  buildUrl(modelId: string, envVars?: Record<string, string>): string {
    return "https://api.myprovider.com/v1";
  }

  /**
   * Get the API key for authentication
   *
   * @param modelId - Full model ID
   */
  async getApiKey(modelId: string): Promise<string> {
    const apiKey = process.env.MY_API_KEY;
    if (!apiKey) {
      throw new Error(`Missing MY_API_KEY environment variable`);
    }
    return apiKey;
  }

  /**
   * Create a language model instance
   *
   * @param args - Model ID, provider ID, and API key
   */
  async resolveLanguageModel({
    modelId,
    providerId,
    apiKey,
  }: {
    modelId: string;
    providerId: string;
    apiKey: string;
  }): Promise<LanguageModelV2> {
    const baseURL = this.buildUrl(`${providerId}/${modelId}`);
    return createOpenAICompatible({
      name: providerId,
      apiKey,
      baseURL,
      supportsStructuredOutputs: true,
    }).chatModel(modelId);
  }
}
