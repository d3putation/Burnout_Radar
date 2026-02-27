import { LLMProvider, LLMRecommendInput } from "@/lib/llm/types";

export class RealLLMProvider implements LLMProvider {
  constructor(private readonly apiKey: string, private readonly baseUrl: string) {}

  async generateRecommendation(input: LLMRecommendInput) {
    const payload = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive burnout-risk coach. Never diagnose or provide medical advice. Explain drivers and provide actionable work-habit changes."
        },
        {
          role: "user",
          content: JSON.stringify(input)
        }
      ],
      temperature: 0.3
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`LLM provider request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content ?? "";

    return {
      explanation: `Model response: ${text}`,
      prioritizedActions: [
        "Parse model output into structured action bullets in a production integration.",
        "Validate non-medical framing before display."
      ],
      weeklyPlanIntent: "model-generated intent"
    };
  }
}
