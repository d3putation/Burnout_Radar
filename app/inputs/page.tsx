"use client";

import { useMemo, useState } from "react";
import { sampleDataset } from "@/data/sample-data";
import { useBurnoutData } from "@/lib/hooks/useBurnoutData";
import { DailySignal, Meeting, TaskDay } from "@/lib/types";

const emptySignal: DailySignal = {
  date: new Date().toISOString().slice(0, 10),
  sleepHours: 7,
  moodEnergy: 3,
  workHours: 8,
  focusBlocks: 2,
  stress: 3,
  afterHoursMessages: 0,
  lateNightActivity: 0
};

export default function InputsPage() {
  const { dataset, setDataset, loadDemo, loadBlank } = useBurnoutData();
  const [signal, setSignal] = useState<DailySignal>(emptySignal);
  const [meetingsJson, setMeetingsJson] = useState<string>("[]");
  const [tasksJson, setTasksJson] = useState<string>("[]");
  const [status, setStatus] = useState<string>("");

  const latestSignal = useMemo(() => dataset.dailySignals[dataset.dailySignals.length - 1], [dataset.dailySignals]);

  const addSignal = () => {
    const withoutSameDate = dataset.dailySignals.filter((d) => d.date !== signal.date);
    const next = {
      ...dataset,
      dailySignals: [...withoutSameDate, signal].sort((a, b) => a.date.localeCompare(b.date))
    };
    setDataset(next);
    setStatus("Daily signal saved.");
  };

  const importJson = () => {
    try {
      const meetings = JSON.parse(meetingsJson) as Meeting[];
      const tasks = JSON.parse(tasksJson) as TaskDay[];
      setDataset({ ...dataset, meetings, tasks });
      setStatus("Meetings and tasks imported.");
    } catch {
      setStatus("Import failed. Check JSON format.");
    }
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <h2 className="font-semibold">Manual Daily Input</h2>
        <p className="text-sm text-slate-500">Required inputs: sleep, mood/energy, work hours, focus blocks, stress.</p>
        <div className="grid md:grid-cols-4 gap-3 mt-4 text-sm">
          <label className="flex flex-col gap-1">Date<input className="border rounded p-2" type="date" value={signal.date} onChange={(e) => setSignal({ ...signal, date: e.target.value })} /></label>
          <label className="flex flex-col gap-1">Sleep hours<input className="border rounded p-2" type="number" step="0.1" value={signal.sleepHours} onChange={(e) => setSignal({ ...signal, sleepHours: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Mood/Energy (1-5)<input className="border rounded p-2" type="number" min={1} max={5} value={signal.moodEnergy} onChange={(e) => setSignal({ ...signal, moodEnergy: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Work hours<input className="border rounded p-2" type="number" step="0.1" value={signal.workHours} onChange={(e) => setSignal({ ...signal, workHours: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Focus blocks<input className="border rounded p-2" type="number" min={0} value={signal.focusBlocks} onChange={(e) => setSignal({ ...signal, focusBlocks: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Stress (1-5)<input className="border rounded p-2" type="number" min={1} max={5} value={signal.stress} onChange={(e) => setSignal({ ...signal, stress: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">After-hours messages<input className="border rounded p-2" type="number" min={0} value={signal.afterHoursMessages} onChange={(e) => setSignal({ ...signal, afterHoursMessages: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Late-night activity count<input className="border rounded p-2" type="number" min={0} value={signal.lateNightActivity} onChange={(e) => setSignal({ ...signal, lateNightActivity: Number(e.target.value) })} /></label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={addSignal} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Save Daily Signal</button>
          <button onClick={loadDemo} className="px-4 py-2 rounded border text-sm">Load Demo Mode</button>
          <button
            onClick={() => {
              loadBlank();
              setStatus("Reset to blank dataset.");
            }}
            className="px-4 py-2 rounded border text-sm"
          >
            Start Blank
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">Latest saved date: {latestSignal?.date ?? "none"}</p>
      </section>

      <section className="card p-5">
        <h2 className="font-semibold">Import Meetings + Tasks JSON</h2>
        <p className="text-sm text-slate-500">Use samples in `data/import-meetings.json` and `data/import-tasks.json`.</p>
        <div className="grid lg:grid-cols-2 gap-3 mt-4">
          <label className="text-sm">Meetings JSON<textarea className="border rounded p-2 w-full min-h-48 font-mono text-xs" value={meetingsJson} onChange={(e) => setMeetingsJson(e.target.value)} /></label>
          <label className="text-sm">Tasks JSON<textarea className="border rounded p-2 w-full min-h-48 font-mono text-xs" value={tasksJson} onChange={(e) => setTasksJson(e.target.value)} /></label>
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={importJson} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Import JSON</button>
          <button
            onClick={() => {
              setMeetingsJson(JSON.stringify(sampleDataset.meetings.slice(0, 10), null, 2));
              setTasksJson(JSON.stringify(sampleDataset.tasks.slice(0, 10), null, 2));
            }}
            className="px-4 py-2 rounded border text-sm"
          >
            Paste Sample
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">{status}</p>
      </section>
    </div>
  );
}
