import { RecommendResponse, ScoreBreakdown } from "@/lib/types";

const DISCLAIMER =
  "Burnout Radar is not a medical device and does not provide diagnosis or treatment. If symptoms feel severe or persistent, consult a qualified professional.";

const toAction = (key: string) => {
  if (key.includes("sleep")) return "Protect a 7.5h sleep window for the next 3 nights and set a hard stop for work.";
  if (key.includes("overtime")) return "Cap two workdays this week at 8 hours and move low-priority tasks to next sprint.";
  if (key.includes("meetings")) return "Cluster optional meetings into two blocks and keep one meeting-free half day.";
  if (key.includes("nowindow")) return "Insert 20-minute recovery slots between meeting clusters and honor them as blocked time.";
  if (key.includes("tasks")) return "Cut backlog growth by limiting new intake until overdue tasks drop by 20%.";
  if (key.includes("selfReport")) return "Use a 10-minute reset ritual after lunch and end-day decompression before evening.";
  return "Pick one high-impact habit and track completion daily for this week.";
};

export const ruleBasedRecommendations = (latest: ScoreBreakdown): RecommendResponse => {
  const sorted = Object.entries(latest.factors).sort((a, b) => b[1].contribution - a[1].contribution);
  const top = sorted.slice(0, 3);

  const ruleBased = [
    ...top.map(([k]) => toAction(k)),
    "Set one no-meeting deep-work block (60-90 min) on at least 4 days this week.",
    "Reduce after-hours messages by batching communications before your workday ends.",
    "Review risk trend every Friday and adjust only one lever at a time."
  ].slice(0, 7);

  const topNames = top.map(([k]) => k).join(", ");

  return {
    ruleBased,
    explanation: `Risk is currently ${latest.label.toLowerCase()} and moved due to ${topNames}.`,
    prioritizedActions: ruleBased.slice(0, 5),
    weeklyPlanIntent: top.some(([k]) => k.includes("meet"))
      ? "reduce meeting load and protect recovery slots"
      : "reduce sustained overload and stabilize recovery rhythms",
    disclaimer: DISCLAIMER
  };
};

export const recommendationDisclaimer = DISCLAIMER;
