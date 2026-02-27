import { ScoreBreakdown } from "@/lib/types";

const labels: Record<keyof ScoreBreakdown["factors"], string> = {
  sleep: "Sleep",
  overtime: "Overtime",
  meetings: "Meeting Density",
  nowindow: "No-Window Blocks",
  tasks: "Task Pace/Load",
  selfReport: "Stress & Energy"
};

export function DriversCards({ factors }: { factors: ScoreBreakdown["factors"] }) {
  return (
    <section className="card p-5">
      <h2 className="font-semibold mb-3">Risk Drivers</h2>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {Object.entries(factors).map(([key, factor]) => (
          <article key={key} className="rounded-lg border border-slate-200 p-3 bg-slate-50">
            <p className="text-sm text-slate-500">{labels[key as keyof ScoreBreakdown["factors"]]}</p>
            <p className="text-lg font-semibold">+{factor.contribution.toFixed(1)}</p>
            <p className="text-xs text-slate-600 mt-1">{factor.notes}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
