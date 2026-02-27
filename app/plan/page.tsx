"use client";

import { useEffect, useState } from "react";
import { useBurnoutData } from "@/lib/hooks/useBurnoutData";
import { getSettings } from "@/lib/storage/local";
import { PlanResponse } from "@/lib/types";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function PlanPage() {
  const { dataset } = useBurnoutData();
  const [plan, setPlan] = useState<PlanResponse | null>(null);

  useEffect(() => {
    const settings = getSettings();
    void fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meetings: dataset.meetings,
        preferences: { startHour: settings.startHour, endHour: settings.endHour }
      })
    })
      .then((r) => r.json())
      .then((d) => setPlan(d as PlanResponse));
  }, [dataset.meetings]);

  const downloadIcs = () => {
    if (!plan) return;
    const blob = new Blob([plan.ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "burnout-radar-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <h2 className="font-semibold">Weekly Plan Generator</h2>
        <p className="text-sm text-slate-600">Heuristic scheduler inserts recovery slots, proposes deep-work blocks, and highlights conflicts.</p>
        <button onClick={downloadIcs} className="mt-3 px-4 py-2 rounded bg-blue-600 text-white text-sm">Export Plan as ICS</button>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-3">Proposed Weekly Grid</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {dayOrder.map((day) => (
            <div key={day} className="rounded-lg border border-slate-200 p-2">
              <p className="font-medium text-sm mb-2">{day}</p>
              <div className="space-y-2">
                {(plan?.slots ?? [])
                  .filter((s) => s.day && new Date(s.day).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }) === day)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className={`rounded p-2 text-xs ${
                        slot.kind === "meeting"
                          ? "bg-slate-100"
                          : slot.kind === "break"
                            ? "bg-emerald-50"
                            : slot.kind === "deep-work"
                              ? "bg-blue-50"
                              : "bg-amber-50"
                      }`}
                    >
                      <p className="font-medium">{slot.title}</p>
                      <p>
                        {slot.start} - {slot.end}
                      </p>
                      {slot.conflict ? <p className="text-high">Conflict</p> : null}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-2">Suggested Changes</h3>
        <ul className="list-disc pl-5 text-sm space-y-1">
          {(plan?.suggestions ?? []).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
