"use client";

import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from "recharts";
import { TeamAggregateResponse } from "@/lib/types";

export default function TeamPage() {
  const [data, setData] = useState<TeamAggregateResponse | null>(null);

  useEffect(() => {
    void fetch("/api/team/aggregate", { method: "POST" })
      .then((r) => r.json())
      .then((d) => setData(d as TeamAggregateResponse));
  }, []);

  if (!data) return <p className="text-sm text-slate-500">Loading team aggregate...</p>;

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <h2 className="font-semibold">Team/HR View (Anonymized)</h2>
        <p className="text-sm text-slate-600 mt-1">{data.note}</p>
      </section>

      <section className="grid md:grid-cols-4 gap-3">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Average Risk</p>
          <p className="kpi">{data.averageRisk}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Low</p>
          <p className="kpi text-low">{data.riskDistribution.low}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Medium</p>
          <p className="kpi text-med">{data.riskDistribution.medium}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">High</p>
          <p className="kpi text-high">{data.riskDistribution.high}</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5 h-[280px]">
          <h3 className="font-semibold mb-2">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={[
                { name: "Low", count: data.riskDistribution.low },
                { name: "Medium", count: data.riskDistribution.medium },
                { name: "High", count: data.riskDistribution.high }
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5 h-[280px]">
          <h3 className="font-semibold mb-2">Team Trend</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={data.trend}>
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="avgRisk" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card p-5">
        <h3 className="font-semibold mb-2">Top Drivers</h3>
        <div className="flex flex-wrap gap-2">
          {data.topDrivers.map((d) => (
            <div key={d.driver} className="rounded-full border px-3 py-1 text-sm bg-slate-50">
              {d.driver} ({d.count})
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
