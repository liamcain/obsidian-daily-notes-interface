import type moment from "moment";
import type { Moment } from "moment";
import { App, TFile } from "obsidian";

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
  if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodicNotes = (<any>app).plugins.getPlugin("periodic-notes");
  return periodicNotes && periodicNotes.settings?.daily?.enabled;
}

/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the periodic-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
export function appHasWeeklyNotesPluginLoaded(): boolean {
  const { app } = window;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((<any>app).plugins.getPlugin("calendar")) {
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodicNotes = (<any>app).plugins.getPlugin("periodic-notes");
  return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}

export function appHasMonthlyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodicNotes = (<any>app).plugins.getPlugin("periodic-notes");
  return periodicNotes && periodicNotes.settings?.monthly?.enabled;
}

export {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
} from "./constants";

import type { IGranularity, IPeriodicNoteSettings } from "./types";
import {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
} from "./settings";
import { createDailyNote, getDailyNote, getAllDailyNotes } from "./daily";
import { createWeeklyNote, getAllWeeklyNotes, getWeeklyNote } from "./weekly";
import {
  createMonthlyNote,
  getAllMonthlyNotes,
  getMonthlyNote,
} from "./monthly";

export { getDateUID, getDateFromFile, getDateFromPath } from "./parse";
export { getTemplateInfo } from "./vault";

function getPeriodicNoteSettings(
  granularity: IGranularity
): IPeriodicNoteSettings {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
  }[granularity];

  return getSettings();
}

function createPeriodicNote(
  granularity: IGranularity,
  date: Moment
): Promise<TFile> {
  const createFn = {
    day: createDailyNote,
    month: createMonthlyNote,
    week: createWeeklyNote,
  };
  return createFn[granularity](date);
}

export type { IGranularity, IPeriodicNoteSettings };
export {
  createDailyNote,
  createMonthlyNote,
  createWeeklyNote,
  createPeriodicNote,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllWeeklyNotes,
  getDailyNote,
  getDailyNoteSettings,
  getMonthlyNote,
  getMonthlyNoteSettings,
  getPeriodicNoteSettings,
  getWeeklyNote,
  getWeeklyNoteSettings,
};
