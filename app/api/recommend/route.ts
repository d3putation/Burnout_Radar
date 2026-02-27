import { NextRequest, NextResponse } from "next/server";
import { sampleDataset } from "@/data/sample-data";
import { deriveDayMetrics } from "@/lib/derivations";
import { getLLMProvider } from "@/lib/llm";
import { ruleBasedRecommendations } from "@/lib/recommendations";
import { computeScores } from "@/lib/scoring";
import { AppDataset } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { dataset?: AppDataset; prompt?: string };
    const dataset = body.dataset ?? sampleDataset;

    const dailySignals = [...dataset.dailySignals].sort((a, b) => a.date.localeCompare(b.date));
    const derived = deriveDayMetrics({ dailySignals, meetings: dataset.meetings, tasks: dataset.tasks });
    const scores = computeScores({ dailySignals, derived });
    const latest = scores.daily[scores.daily.length - 1];

    const rule = ruleBasedRecommendations(latest);

    const provider = getLLMProvider();
    const llm = await provider.generateRecommendation({ history: dailySignals.slice(-30), latest, prompt: body.prompt });

    return NextResponse.json({
      ...rule,
      explanation: llm.explanation,
      prioritizedActions: llm.prioritizedActions,
      weeklyPlanIntent: llm.weeklyPlanIntent,
      topDrivers: latest.topDrivers
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate recommendations", detail: (error as Error).message },
      { status: 400 }
    );
  }
}
