"use client";

import { useEffect, useState } from "react";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { AppSettings, getSettings, saveSettings } from "@/lib/storage/local";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    startHour: 9,
    endHour: 18,
    lowThreshold: 40,
    highThreshold: 70,
    demoMode: true
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const persist = () => {
    saveSettings(settings);
  };

  return (
    <div className="space-y-5">
      <section className="card p-5">
        <h2 className="font-semibold">Preferences</h2>
        <p className="text-sm text-slate-600">Adjust working hours and score labels used in UI.</p>
        <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
          <label className="flex flex-col gap-1">Workday Start Hour<input className="border rounded p-2" type="number" value={settings.startHour} onChange={(e) => setSettings({ ...settings, startHour: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Workday End Hour<input className="border rounded p-2" type="number" value={settings.endHour} onChange={(e) => setSettings({ ...settings, endHour: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Low/Medium Threshold<input className="border rounded p-2" type="number" value={settings.lowThreshold} onChange={(e) => setSettings({ ...settings, lowThreshold: Number(e.target.value) })} /></label>
          <label className="flex flex-col gap-1">Medium/High Threshold<input className="border rounded p-2" type="number" value={settings.highThreshold} onChange={(e) => setSettings({ ...settings, highThreshold: Number(e.target.value) })} /></label>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.demoMode} onChange={(e) => setSettings({ ...settings, demoMode: e.target.checked })} />
          Demo mode enabled
        </label>
        <button onClick={persist} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white text-sm">Save Settings</button>
      </section>

      <PrivacyNotice />
    </div>
  );
}
