import { DailySignal, RecommendResponse, ScoreBreakdown } from "@/lib/types";

export type LLMRecommendInput = {
  history: DailySignal[];
  latest: ScoreBreakdown;
  prompt?: string;
};

export interface LLMProvider {
  generateRecommendation(input: LLMRecommendInput): Promise<Pick<RecommendResponse, "explanation" | "prioritizedActions" | "weeklyPlanIntent">>;
}
