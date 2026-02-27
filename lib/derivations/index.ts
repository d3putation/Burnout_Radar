import { DailySignal, DerivedDayMetrics, Meeting, TaskDay } from "@/lib/types";
import { dateOnly, minutesBetween } from "@/lib/utils";

const buildMeetingMetrics = (meetings: Meeting[]) => {
  const byDay = new Map<string, Meeting[]>();
  for (const m of meetings) {
    const day = dateOnly(m.start);
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)?.push(m);
  }

  const output = new Map<string, Omit<DerivedDayMetrics, "tasksCompleted" | "tasksCreated" | "overdueTasks" | "backlogGrowth" | "afterHoursMessages" | "lateNightActivity">>();

  byDay.forEach((dayMeetings, day) => {
    const sorted = [...dayMeetings].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const meetingMinutes = sorted.reduce((sum, m) => sum + minutesBetween(m.start, m.end), 0);

    let backToBackStreak = 0;
    let currentStreak = 0;
    let noWindowMinutes = 0;
    let noBreakBlocks = 0;
    let blockStart = sorted[0]?.start;
    let blockEnd = sorted[0]?.end;

    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const next = sorted[i];
      const gap = minutesBetween(prev.end, next.start);
      if (gap < 15) {
        currentStreak += 1;
        backToBackStreak = Math.max(backToBackStreak, currentStreak);
        if (blockEnd && new Date(next.end) > new Date(blockEnd)) blockEnd = next.end;
      } else {
        currentStreak = 0;
        if (blockStart && blockEnd && minutesBetween(blockStart, blockEnd) >= 180) {
          noWindowMinutes += minutesBetween(blockStart, blockEnd);
          noBreakBlocks += 1;
        }
        blockStart = next.start;
        blockEnd = next.end;
      }
    }

    if (blockStart && blockEnd && minutesBetween(blockStart, blockEnd) >= 180) {
      noWindowMinutes += minutesBetween(blockStart, blockEnd);
      noBreakBlocks += 1;
    }

    output.set(day, {
      date: day,
      meetingHours: Number((meetingMinutes / 60).toFixed(2)),
      meetingCount: sorted.length,
      backToBackStreak,
      noWindowMinutes,
      noBreakBlocks
    });
  });

  return output;
};

export const deriveDayMetrics = ({
  dailySignals,
  meetings,
  tasks
}: {
  dailySignals: DailySignal[];
  meetings: Meeting[];
  tasks: TaskDay[];
}): DerivedDayMetrics[] => {
  const meetingMap = buildMeetingMetrics(meetings);
  const taskMap = new Map(tasks.map((t) => [t.date, t]));

  return dailySignals.map((signal) => {
    const meeting = meetingMap.get(signal.date);
    const task = taskMap.get(signal.date);

    return {
      date: signal.date,
      meetingHours: meeting?.meetingHours ?? 0,
      meetingCount: meeting?.meetingCount ?? 0,
      backToBackStreak: meeting?.backToBackStreak ?? 0,
      noWindowMinutes: meeting?.noWindowMinutes ?? 0,
      noBreakBlocks: meeting?.noBreakBlocks ?? 0,
      tasksCompleted: task?.completed ?? 0,
      tasksCreated: task?.created ?? 0,
      overdueTasks: task?.overdue ?? 0,
      backlogGrowth: (task?.created ?? 0) - (task?.completed ?? 0),
      afterHoursMessages: signal.afterHoursMessages ?? 0,
      lateNightActivity: signal.lateNightActivity ?? 0
    };
  });
};
