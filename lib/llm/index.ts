import { MockLLMProvider } from "@/lib/llm/mock-provider";
import { RealLLMProvider } from "@/lib/llm/real-provider";
import { LLMProvider } from "@/lib/llm/types";

export const getLLMProvider = (): LLMProvider => {
  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL;

  if (apiKey && baseUrl) {
    return new RealLLMProvider(apiKey, baseUrl);
  }

  return new MockLLMProvider();
};
