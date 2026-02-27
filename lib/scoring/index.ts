import { DailySignal, DerivedDayMetrics, ScoreBreakdown, ScoreResponse } from "@/lib/types";
import { average, clamp, movingAverage } from "@/lib/utils";

const WEIGHTS = {
  sleep: 0.2,
  overtime: 0.2,
  meetings: 0.18,
  nowindow: 0.12,
  tasks: 0.15,
  selfReport: 0.15
};

const riskLabel = (score: number) => {
  if (score >= 70) return "High" as const;
  if (score >= 40) return "Medium" as const;
  return "Low" as const;
};

const calcSleepScore = (today: DailySignal, trailing: DailySignal[]) => {
  const sevenAvg = average(trailing.map((d) => d.sleepHours ?? 7));
  const todaySleep = today.sleepHours ?? sevenAvg;
  let score = 0;
  if (sevenAvg < 7) score += (7 - sevenAvg) * 12;
  if (todaySleep < 7) score += (7 - todaySleep) * 12;
  if (todaySleep < 6) score += 18;
  return clamp(score);
};

const calcOvertimeScore = (today: DailySignal, trailing: DailySignal[]) => {
  const todayHours = today.workHours ?? 8;
  let score = 0;
  if (todayHours > 8) score += (todayHours - 8) * 14;
  if (todayHours > 10) score += 20;

  const recent = trailing.slice(-5);
  let overtimeStreak = 0;
  for (let i = recent.length - 1; i >= 0; i--) {
    if ((recent[i].workHours ?? 0) > 8) overtimeStreak += 1;
    else break;
  }
  score += overtimeStreak * 6;
  return clamp(score);
};

const calcMeetingsScore = (metric: DerivedDayMetrics) => {
  let score = 0;
  if (metric.meetingHours > 3) score += (metric.meetingHours - 3) * 12;
  if (metric.meetingHours > 5) score += 10;
  if (metric.meetingCount > 5) score += (metric.meetingCount - 5) * 5;
  score += metric.backToBackStreak * 6;
  return clamp(score);
};

const calcNoWindowScore = (metric: DerivedDayMetrics) => {
  let score = 0;
  score += metric.noBreakBlocks * 18;
  score += (metric.noWindowMinutes / 60) * 8;
  return clamp(score);
};

const calcTasksScore = (metric: DerivedDayMetrics) => {
  let score = 0;
  if (metric.backlogGrowth > 0) score += metric.backlogGrowth * 8;
  score += metric.overdueTasks * 10;
  return clamp(score);
};

const calcSelfScore = (today: DailySignal, metric: DerivedDayMetrics) => {
  const stress = today.stress ?? 3;
  const energy = today.moodEnergy ?? 3;
  let score = (stress - 1) * 18 + (5 - energy) * 12;
  score += metric.afterHoursMessages * 2;
  score += metric.lateNightActivity * 8;
  return clamp(score);
};

const confidence = (today: DailySignal, metric: DerivedDayMetrics) => {
  const key = [today.sleepHours, today.workHours, today.stress, today.moodEnergy];
  const missing = key.filter((x) => x === undefined || x === null).length;
  const hasMeetings = metric.meetingCount > 0;
  if (missing <= 1 && hasMeetings) return "High" as const;
  if (missing <= 2) return "Medium" as const;
  return "Low" as const;
};

const topDriversFromFactors = (factors: ScoreBreakdown["factors"]) => {
  return Object.entries(factors)
    .sort((a, b) => b[1].contribution - a[1].contribution)
    .slice(0, 3)
    .map(([k, v]) => `${k}: +${v.contribution.toFixed(1)}`);
};

export const computeScores = ({
  dailySignals,
  derived
}: {
  dailySignals: DailySignal[];
  derived: DerivedDayMetrics[];
}): ScoreResponse => {
  const baseScores = dailySignals.map((today, idx) => {
    const trailing = dailySignals.slice(Math.max(0, idx - 6), idx + 1);
    const metric = derived[idx];

    const sleepScore = calcSleepScore(today, trailing);
    const overtimeScore = calcOvertimeScore(today, trailing);
    const meetingsScore = calcMeetingsScore(metric);
    const nowindowScore = calcNoWindowScore(metric);
    const tasksScore = calcTasksScore(metric);
    const selfScore = calcSelfScore(today, metric);

    const weighted = {
      sleep: sleepScore * WEIGHTS.sleep,
      overtime: overtimeScore * WEIGHTS.overtime,
      meetings: meetingsScore * WEIGHTS.meetings,
      nowindow: nowindowScore * WEIGHTS.nowindow,
      tasks: tasksScore * WEIGHTS.tasks,
      selfReport: selfScore * WEIGHTS.selfReport
    };

    const totalRaw = Object.values(weighted).reduce((a, b) => a + b, 0);

    const factors: ScoreBreakdown["factors"] = {
      sleep: {
        score: Math.round(sleepScore),
        weight: WEIGHTS.sleep,
        contribution: Number(weighted.sleep.toFixed(1)),
        notes: "Sleep debt uses 7-day average and today's deficit."
      },
      overtime: {
        score: Math.round(overtimeScore),
        weight: WEIGHTS.overtime,
        contribution: Number(weighted.overtime.toFixed(1)),
        notes: "Overtime reflects >8h work, >10h spikes, and streaks."
      },
      meetings: {
        score: Math.round(meetingsScore),
        weight: WEIGHTS.meetings,
        contribution: Number(weighted.meetings.toFixed(1)),
        notes: "Meeting load combines hours, count, and back-to-back streaks."
      },
      nowindow: {
        score: Math.round(nowindowScore),
        weight: WEIGHTS.nowindow,
        contribution: Number(weighted.nowindow.toFixed(1)),
        notes: "No-window blocks flag long stretches without 15+ min gaps."
      },
      tasks: {
        score: Math.round(tasksScore),
        weight: WEIGHTS.tasks,
        contribution: Number(weighted.tasks.toFixed(1)),
        notes: "Task pressure increases when backlog grows and overdue items rise."
      },
      selfReport: {
        score: Math.round(selfScore),
        weight: WEIGHTS.selfReport,
        contribution: Number(weighted.selfReport.toFixed(1)),
        notes: "Stress, low energy, and after-hours activity raise score."
      }
    };

    return {
      date: today.date,
      totalRaw,
      factors,
      confidence: confidence(today, metric)
    };
  });

  const smoothed = movingAverage(
    baseScores.map((s) => clamp(s.totalRaw)),
    3
  );

  const daily: ScoreBreakdown[] = baseScores.map((s, i) => {
    const totalScore = Math.round(smoothed[i]);
    return {
      date: s.date,
      totalScore,
      label: riskLabel(totalScore),
      confidence: s.confidence,
      factors: s.factors,
      topDrivers: topDriversFromFactors(s.factors)
    };
  });

  const last7 = daily.slice(-7).map((d) => d.totalScore);
  const prev7 = daily.slice(-14, -7).map((d) => d.totalScore);
  const last30 = daily.slice(-30).map((d) => d.totalScore);
  const prev30 = daily.slice(-60, -30).map((d) => d.totalScore);

  const trend7 = Number((average(last7) - average(prev7 || [0])).toFixed(1));
  const trend30 = Number((average(last30) - average(prev30 || [0])).toFixed(1));

  return {
    daily,
    trend7,
    trend30,
    sparkline: daily.map((d) => ({ date: d.date, score: d.totalScore }))
  };
};
