"use client";

import { useState } from "react";
import { AppDataset, RecommendResponse } from "@/lib/types";

const prompts = [
  "Why did my risk increase today?",
  "What should I change this week?",
  "How can I reduce meeting fatigue?"
];

export function MicroCoach({ dataset, recommendation }: { dataset: AppDataset; recommendation: RecommendResponse | null }) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; text: string }>>([]);
  const [loading, setLoading] = useState(false);

  const ask = async (prompt: string) => {
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setLoading(true);
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataset, prompt })
      });
      const data = (await res.json()) as RecommendResponse & { topDrivers?: string[] };
      const reply = `${data.explanation}\nTop drivers: ${data.topDrivers?.join(", ") ?? "n/a"}\nNext: ${data.prioritizedActions.slice(0, 3).join(" ")}`;
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Micro-Coach</h2>
        <span className="text-xs text-slate-500">Supportive, non-medical guidance</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => ask(p)}
            className="text-xs px-3 py-1.5 rounded-full border border-slate-300 hover:bg-slate-50"
          >
            {p}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-2 max-h-72 overflow-auto pr-1">
        {!messages.length && recommendation ? (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{recommendation.explanation}</div>
        ) : null}
        {messages.map((m, idx) => (
          <div
            key={`${m.role}-${idx}`}
            className={`rounded-lg p-3 text-sm ${m.role === "assistant" ? "bg-blue-50" : "bg-slate-100"}`}
          >
            <p className="text-xs uppercase text-slate-500 mb-1">{m.role}</p>
            <p className="whitespace-pre-line">{m.text}</p>
          </div>
        ))}
        {loading ? <p className="text-xs text-slate-500">Thinking...</p> : null}
      </div>
    </section>
  );
}
