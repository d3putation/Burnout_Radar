import { buildICS } from "@/lib/ics";
import { Meeting, PlanResponse, ScheduleSlot, WorkPreferences } from "@/lib/types";
import { dateOnly, toTimeHHMM } from "@/lib/utils";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const nextMonday = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = (8 - day) % 7 || 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(d.getDate() + n);
  return x;
};

const getWeekDates = () => {
  const mon = nextMonday();
  return weekdays.map((_, i) => addDays(mon, i).toISOString().slice(0, 10));
};

export const generateWeeklyPlan = ({
  meetings,
  preferences
}: {
  meetings: Meeting[];
  preferences: WorkPreferences;
}): PlanResponse => {
  const weekDates = getWeekDates();
  const suggestions: string[] = [];
  const slots: ScheduleSlot[] = [];

  const byDay = new Map<string, Meeting[]>();
  for (const date of weekDates) byDay.set(date, []);
  for (const m of meetings) {
    const day = dateOnly(m.start);
    if (byDay.has(day)) byDay.get(day)?.push(m);
  }

  weekDates.forEach((day, idx) => {
    const dayMeetings = (byDay.get(day) ?? []).sort((a, b) => +new Date(a.start) - +new Date(b.start));

    dayMeetings.forEach((m) => {
      slots.push({
        id: `meeting-${m.id}`,
        day,
        start: toTimeHHMM(m.start),
        end: toTimeHHMM(m.end),
        title: m.title,
        kind: "meeting"
      });
    });

    for (let i = 1; i < dayMeetings.length; i++) {
      const prev = dayMeetings[i - 1];
      const next = dayMeetings[i];
      const prevEnd = new Date(prev.end);
      const nextStart = new Date(next.start);
      const gapMins = (nextStart.getTime() - prevEnd.getTime()) / 60000;
      if (gapMins < 15) {
        const breakStart = new Date(prevEnd);
        const breakEnd = new Date(prevEnd.getTime() + 20 * 60000);
        slots.push({
          id: `break-${day}-${i}`,
          day,
          start: toTimeHHMM(breakStart.toISOString()),
          end: toTimeHHMM(breakEnd.toISOString()),
          title: "Recovery Break",
          kind: "break",
          conflict: breakEnd > nextStart
        });
        suggestions.push(`${weekdays[idx]}: add a 20-min recovery break after ${prev.title}.`);
      }
    }

    const deepWorkStart = `${String(preferences.startHour + 1).padStart(2, "0")}:30`;
    const deepWorkEnd = `${String(preferences.startHour + 3).padStart(2, "0")}:00`;

    const conflict = dayMeetings.some((m) => {
      const ms = toTimeHHMM(m.start);
      const me = toTimeHHMM(m.end);
      return !(me <= deepWorkStart || ms >= deepWorkEnd);
    });

    if (!conflict) {
      slots.push({
        id: `deep-${day}`,
        day,
        start: deepWorkStart,
        end: deepWorkEnd,
        title: "Deep Work Block",
        kind: "deep-work"
      });
    } else {
      suggestions.push(`${weekdays[idx]}: move one optional meeting to protect a 90-min deep-work block.`);
      slots.push({
        id: `suggested-${day}`,
        day,
        start: deepWorkStart,
        end: deepWorkEnd,
        title: "Suggested Deep Work (conflict)",
        kind: "suggested-move",
        conflict: true
      });
    }
  });

  if (!suggestions.length) {
    suggestions.push("Week looks balanced. Keep recovery breaks and deep-work blocks protected.");
  }

  return {
    slots,
    suggestions: [...new Set(suggestions)],
    ics: buildICS(slots)
  };
};
