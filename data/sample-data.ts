import { AppDataset, DailySignal, Meeting, TaskDay } from "@/lib/types";

const today = new Date();

const toDate = (offset: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

export const sampleDailySignals: DailySignal[] = Array.from({ length: 30 }, (_, i) => {
  const date = toDate(29 - i);
  const stress = 2 + ((i + 1) % 4);
  const workHours = 7.5 + ((i + 2) % 5) * 0.8;
  return {
    date,
    sleepHours: 6.2 + ((i + 3) % 5) * 0.35,
    moodEnergy: Math.max(1, 5 - (stress - 2)),
    workHours,
    focusBlocks: 1 + (i % 4),
    stress,
    afterHoursMessages: i % 3,
    lateNightActivity: i % 5 === 0 ? 1 : 0
  };
});

const meetingTemplate = (date: string, hour: number, durationMins: number, title: string, type?: Meeting["type"]): Meeting => {
  const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
  const end = new Date(start.getTime() + durationMins * 60000);
  return {
    id: `${date}-${hour}-${title.replace(/\s+/g, "-").toLowerCase()}`,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    type
  };
};

export const sampleMeetings: Meeting[] = sampleDailySignals.flatMap((d, i) => {
  const base: Meeting[] = [meetingTemplate(d.date, 9, 45, "Standup", "required")];
  if (i % 2 === 0) base.push(meetingTemplate(d.date, 10, 60, "Planning", "required"));
  if (i % 3 === 0) base.push(meetingTemplate(d.date, 11, 30, "1:1", "optional"));
  if (i % 4 === 0) base.push(meetingTemplate(d.date, 14, 90, "Cross-team Sync", "required"));
  return base;
});

export const sampleTasks: TaskDay[] = sampleDailySignals.map((d, i) => ({
  date: d.date,
  completed: 4 + (i % 4),
  created: 5 + ((i + 2) % 5),
  overdue: i % 3,
  avgCycleHours: 20 + (i % 6) * 4
}));

export const sampleDataset: AppDataset = {
  dailySignals: sampleDailySignals,
  meetings: sampleMeetings,
  tasks: sampleTasks
};

export const sampleTeamDatasets: AppDataset[] = [
  sampleDataset,
  {
    dailySignals: sampleDailySignals.map((d) => ({ ...d, stress: Math.min(5, (d.stress ?? 3) + 1), sleepHours: (d.sleepHours ?? 7) - 0.4 })),
    meetings: sampleMeetings,
    tasks: sampleTasks.map((t) => ({ ...t, overdue: t.overdue + 1, created: t.created + 1 }))
  },
  {
    dailySignals: sampleDailySignals.map((d) => ({ ...d, stress: Math.max(1, (d.stress ?? 3) - 1), sleepHours: (d.sleepHours ?? 7) + 0.5 })),
    meetings: sampleMeetings.filter((_, i) => i % 3 !== 0),
    tasks: sampleTasks.map((t) => ({ ...t, completed: t.completed + 1, overdue: Math.max(0, t.overdue - 1) }))
  }
];
