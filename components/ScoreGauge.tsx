import { RiskLabel } from "@/lib/types";

const colorByLabel: Record<RiskLabel, string> = {
  Low: "text-low",
  Medium: "text-med",
  High: "text-high"
};

export function ScoreGauge({ score, label, trend7, trend30, confidence }: { score: number; label: RiskLabel; trend7: number; trend30: number; confidence: string }) {
  return (
    <section className="card p-5">
      <p className="text-sm text-slate-500">Burnout Risk Score</p>
      <div className="flex items-end gap-3">
        <p className={`kpi ${colorByLabel[label]}`}>{score}</p>
        <p className="text-sm font-medium pb-1">{label}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">7-day trend</p>
          <p className={trend7 > 0 ? "text-high" : "text-low"}>{trend7 > 0 ? `+${trend7}` : trend7}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-slate-500">30-day trend</p>
          <p className={trend30 > 0 ? "text-high" : "text-low"}>{trend30 > 0 ? `+${trend30}` : trend30}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-500">Confidence: {confidence}. Add sleep/work-hours signals to improve certainty.</p>
    </section>
  );
}
