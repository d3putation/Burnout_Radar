import { NextResponse } from "next/server";
import { sampleTeamDatasets } from "@/data/sample-data";
import { deriveDayMetrics } from "@/lib/derivations";
import { computeScores } from "@/lib/scoring";
import { TeamAggregateResponse } from "@/lib/types";
import { average } from "@/lib/utils";

export async function POST() {
  try {
    const scored = sampleTeamDatasets.map((dataset) => {
      const dailySignals = [...dataset.dailySignals].sort((a, b) => a.date.localeCompare(b.date));
      const derived = deriveDayMetrics({ dailySignals, meetings: dataset.meetings, tasks: dataset.tasks });
      return computeScores({ dailySignals, derived });
    });

    const latest = scored.map((s) => s.daily[s.daily.length - 1]);
    const averageRisk = Math.round(average(latest.map((d) => d.totalScore)));
    const distribution = {
      low: latest.filter((d) => d.label === "Low").length,
      medium: latest.filter((d) => d.label === "Medium").length,
      high: latest.filter((d) => d.label === "High").length
    };

    const topDriverMap = new Map<string, number>();
    latest.forEach((d) => {
      d.topDrivers.forEach((driver) => {
        topDriverMap.set(driver.split(":")[0], (topDriverMap.get(driver.split(":")[0]) ?? 0) + 1);
      });
    });

    const topDrivers = [...topDriverMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([driver, count]) => ({ driver, count }));

    const trendDays = scored[0].daily.map((d) => d.date);
    const trend = trendDays.slice(-14).map((date) => {
      const vals = scored.map((s) => s.daily.find((d) => d.date === date)?.totalScore ?? 0);
      return { date, avgRisk: Number(average(vals).toFixed(1)) };
    });

    const response: TeamAggregateResponse = {
      averageRisk,
      riskDistribution: distribution,
      topDrivers,
      trend,
      note: "Aggregated anonymized view only. No individual drill-down in MVP."
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to compute aggregate", detail: (error as Error).message },
      { status: 400 }
    );
  }
}
