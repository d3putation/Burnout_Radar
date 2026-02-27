import { sampleDataset } from "@/data/sample-data";
import { AppDataset } from "@/lib/types";

const KEY = "burnout-radar-data-v1";
const SETTINGS_KEY = "burnout-radar-settings-v1";
export const emptyDataset: AppDataset = {
  dailySignals: [],
  meetings: [],
  tasks: []
};

export const getDataset = (): AppDataset => {
  if (typeof window === "undefined") return sampleDataset;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return emptyDataset;
  try {
    return JSON.parse(raw) as AppDataset;
  } catch {
    return emptyDataset;
  }
};

export const saveDataset = (dataset: AppDataset) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(dataset));
};

export const resetToDemo = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(sampleDataset));
};

export const resetToBlank = () => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(emptyDataset));
};

export type AppSettings = {
  startHour: number;
  endHour: number;
  lowThreshold: number;
  highThreshold: number;
  demoMode: boolean;
};

const defaultSettings: AppSettings = {
  startHour: 9,
  endHour: 18,
  lowThreshold: 40,
  highThreshold: 70,
  demoMode: true
};

export const getSettings = (): AppSettings => {
  if (typeof window === "undefined") return defaultSettings;
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: AppSettings) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
