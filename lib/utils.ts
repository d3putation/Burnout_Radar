export const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export const average = (values: number[]) => {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
};

export const movingAverage = (values: number[], window: number) =>
  values.map((_, idx) => {
    const start = Math.max(0, idx - window + 1);
    return average(values.slice(start, idx + 1));
  });

export const minutesBetween = (startIso: string, endIso: string) => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
};

export const dateOnly = (iso: string) => iso.slice(0, 10);

export const toTimeHHMM = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
