import { ScheduleSlot } from "@/lib/types";

const formatDate = (iso: string) =>
  iso.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export const buildICS = (slots: ScheduleSlot[]) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Burnout Radar//EN",
    "CALSCALE:GREGORIAN"
  ];

  slots
    .filter((s) => s.kind !== "suggested-move")
    .forEach((slot) => {
      const start = new Date(`${slot.day}T${slot.start}:00.000Z`).toISOString();
      const end = new Date(`${slot.day}T${slot.end}:00.000Z`).toISOString();
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${slot.id}@burnout-radar`);
      lines.push(`DTSTAMP:${formatDate(new Date().toISOString())}`);
      lines.push(`DTSTART:${formatDate(start)}`);
      lines.push(`DTEND:${formatDate(end)}`);
      lines.push(`SUMMARY:${slot.title}`);
      lines.push("END:VEVENT");
    });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
};
