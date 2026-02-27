import { LLMProvider, LLMRecommendInput } from "@/lib/llm/types";

export class MockLLMProvider implements LLMProvider {
  async generateRecommendation(input: LLMRecommendInput) {
    const drivers = input.latest.topDrivers.join(", ");
    return {
      explanation: `Risk changed because contributions increased in ${drivers}. This is an early warning summary, not medical advice.`,
      prioritizedActions: [
        "Quick win: add two 20-minute breaks after heavy meeting blocks.",
        "Quick win: choose one day with no work after 6pm.",
        "Deeper change: rebalance recurring meetings and protect one deep-work block daily.",
        "Deeper change: reduce backlog growth by limiting new task intake.",
        "Review impact in 7 days and keep what improves energy."
      ],
      weeklyPlanIntent: "reduce meeting fatigue while increasing recovery and focused work"
    };
  }
}
