"use client";

import { ResponsiveContainer, LineChart, Line, YAxis, Tooltip } from "recharts";

export function Sparkline({ data }: { data: Array<{ date: string; score: number }> }) {
  return (
    <section className="card p-5 h-[220px]">
      <p className="text-sm text-slate-500 mb-4">Daily Risk (sparkline)</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <YAxis domain={[0, 100]} hide />
          <Tooltip formatter={(value: number) => [`${value}`, "Risk"]} labelFormatter={(label) => `Date: ${label}`} />
          <Line type="monotone" dataKey="score" stroke="#1d4ed8" strokeWidth={2.4} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
