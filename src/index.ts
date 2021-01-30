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
 * XXX: Currently "Weekly Notes" live in the calendar plugin.
 * For now, check for either Calendar plugin and Weekly Notes plugin plugin
 */
export function appHasWeeklyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (<any>app).plugins.plugins["calendar"]?.enabled ?? false;
}

export function appHasMonthlyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (<any>app).plugins.plugins["monthly-notes"]?.enabled ?? false;
}

export type { IDailyNoteSettings } from "./daily";
export {
  createDailyNote,
  getDailyNote,
  getDailyNoteSettings,
  getAllDailyNotes,
} from "./daily";

export type { IWeeklyNoteSettings } from "./weekly";
export {
  createWeeklyNote,
  getAllWeeklyNotes,
  getWeeklyNote,
  getWeeklyNoteSettings,
} from "./weekly";

export type { IMonthlyNoteSettings } from "./monthly";
export {
  createMonthlyNote,
  getAllMonthlyNotes,
  getMonthlyNote,
  getMonthlyNoteSettings,
} from "./monthly";

export { getDateUID, getDateFromFile } from "./parse";
export { getTemplateContents } from "./vault";
