export function PrivacyNotice() {
  return (
    <section className="card p-5">
      <h2 className="font-semibold">Data Privacy</h2>
      <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-1">
        <li>MVP stores local demo signals in browser localStorage unless you replace storage.</li>
        <li>Message content is never stored. Only derived counts (after-hours and late-night activity) are kept.</li>
        <li>Team screen shows only anonymized aggregates; no individual drill-down in this MVP.</li>
      </ul>
      <p className="mt-3 text-xs text-slate-500">
        Burnout Radar is not a medical device and does not diagnose or treat. If symptoms are severe or persistent, consult a professional.
      </p>
    </section>
  );
}
