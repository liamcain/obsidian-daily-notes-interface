export type IGranularity = "day" | "week" | "month" | "quarter" | "year";

export const IPeriodicity: Record<IGranularity, string> = {
  day: "daily",
  week: "weekly",
  month: "monthly",
  quarter: "quarterly",
  year: "yearly",
};

export interface IPeriodicNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}
