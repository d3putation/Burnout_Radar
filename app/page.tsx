"use client";

import Link from "next/link";
import { DriversCards } from "@/components/DriversCards";
import { MicroCoach } from "@/components/MicroCoach";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { ScoreGauge } from "@/components/ScoreGauge";
import { Sparkline } from "@/components/Sparkline";
import { useBurnoutData } from "@/lib/hooks/useBurnoutData";

export default function DashboardPage() {
  const { dataset, latest, scores, recommendation, loading, error } = useBurnoutData();

  if (loading && !scores) return <p className="text-sm text-slate-500">Loading dashboard...</p>;
  if (error) return <p className="text-sm text-high">{error}</p>;
  if (!latest || !scores) return <p>No data available.</p>;

  return (
    <div className="space-y-5">
      <section className="grid lg:grid-cols-3 gap-4">
        <ScoreGauge
          score={latest.totalScore}
          label={latest.label}
          trend7={scores.trend7}
          trend30={scores.trend30}
          confidence={latest.confidence}
        />
        <div className="lg:col-span-2">
          <Sparkline data={scores.sparkline} />
        </div>
      </section>

      <DriversCards factors={latest.factors} />

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <h2 className="font-semibold">Weekly Plan</h2>
          <p className="text-sm text-slate-600 mt-2">
            Generate a schedule proposal with recovery slots, deep-work blocks, and meeting clustering suggestions.
          </p>
          <Link href="/plan" className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
            Generate Weekly Plan
          </Link>
        </div>
        <div className="lg:col-span-2">
          <MicroCoach dataset={dataset} recommendation={recommendation} />
        </div>
      </section>

      <PrivacyNotice />
    </div>
  );
}
