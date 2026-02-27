export type RiskLabel = "Low" | "Medium" | "High";
export type ConfidenceLabel = "High" | "Medium" | "Low";

export type DailySignal = {
  date: string;
  sleepHours?: number;
  moodEnergy?: number;
  workHours?: number;
  focusBlocks?: number;
  stress?: number;
  afterHoursMessages?: number;
  lateNightActivity?: number;
};

export type Meeting = {
  id: string;
  title: string;
  start: string;
  end: string;
  type?: "required" | "optional" | "focus" | "other";
};

export type TaskDay = {
  date: string;
  completed: number;
  created: number;
  overdue: number;
  avgCycleHours?: number;
};

export type WorkPreferences = {
  startHour: number;
  endHour: number;
};

export type DerivedDayMetrics = {
  date: string;
  meetingHours: number;
  meetingCount: number;
  backToBackStreak: number;
  noWindowMinutes: number;
  noBreakBlocks: number;
  tasksCompleted: number;
  tasksCreated: number;
  overdueTasks: number;
  backlogGrowth: number;
  afterHoursMessages: number;
  lateNightActivity: number;
};

export type FactorDetail = {
  score: number;
  weight: number;
  contribution: number;
  notes: string;
};

export type ScoreBreakdown = {
  date: string;
  totalScore: number;
  label: RiskLabel;
  confidence: ConfidenceLabel;
  factors: {
    sleep: FactorDetail;
    overtime: FactorDetail;
    meetings: FactorDetail;
    nowindow: FactorDetail;
    tasks: FactorDetail;
    selfReport: FactorDetail;
  };
  topDrivers: string[];
};

export type ScoreResponse = {
  daily: ScoreBreakdown[];
  trend7: number;
  trend30: number;
  sparkline: Array<{ date: string; score: number }>;
};

export type RecommendResponse = {
  ruleBased: string[];
  explanation: string;
  prioritizedActions: string[];
  weeklyPlanIntent: string;
  disclaimer: string;
};

export type ScheduleSlot = {
  id: string;
  day: string;
  start: string;
  end: string;
  title: string;
  kind: "meeting" | "break" | "deep-work" | "suggested-move";
  conflict?: boolean;
};

export type PlanResponse = {
  slots: ScheduleSlot[];
  suggestions: string[];
  ics: string;
};

export type TeamAggregateResponse = {
  averageRisk: number;
  riskDistribution: { low: number; medium: number; high: number };
  topDrivers: Array<{ driver: string; count: number }>;
  trend: Array<{ date: string; avgRisk: number }>;
  note: string;
};

export type AppDataset = {
  dailySignals: DailySignal[];
  meetings: Meeting[];
  tasks: TaskDay[];
};
