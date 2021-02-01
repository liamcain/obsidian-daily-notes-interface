import type moment from "moment";
import { App } from "obsidian";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

export function appHasDailyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyNotesPlugin = (<any>app).internalPlugins.plugins["daily-notes"];
  return dailyNotesPlugin && dailyNotesPlugin.enabled;
}

/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the weekly-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
export function appHasWeeklyNotesPluginLoaded(): boolean {
  const { app } = window;
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(<any>app).plugins.getPlugin("calendar") ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    !!(<any>app).plugins.getPlugin("weekly-notes")
  );
}

export function appHasMonthlyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(<any>app).plugins.getPlugin("monthly-notes");
}

export {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
} from "./constants";

export type { IGranularity, IPeriodicNoteSettings } from "./types";
export {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
} from "./settings";
export { createDailyNote, getDailyNote, getAllDailyNotes } from "./daily";
export { createWeeklyNote, getAllWeeklyNotes, getWeeklyNote } from "./weekly";
export {
  createMonthlyNote,
  getAllMonthlyNotes,
  getMonthlyNote,
} from "./monthly";

export { getDateUID, getDateFromFile } from "./parse";
export { getTemplateContents } from "./vault";
