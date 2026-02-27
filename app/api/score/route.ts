import { NextRequest, NextResponse } from "next/server";
import { sampleDataset } from "@/data/sample-data";
import { deriveDayMetrics } from "@/lib/derivations";
import { computeScores } from "@/lib/scoring";
import { AppDataset } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json().catch(() => null)) as AppDataset | null;
    const dataset = payload ?? sampleDataset;

    const dailySignals = [...dataset.dailySignals].sort((a, b) => a.date.localeCompare(b.date));
    const derived = deriveDayMetrics({
      dailySignals,
      meetings: dataset.meetings,
      tasks: dataset.tasks
    });
    const scores = computeScores({ dailySignals, derived });

    return NextResponse.json(scores);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute scores", detail: (error as Error).message },
      { status: 400 }
    );
  }
}
