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

  return shouldUsePeriodicNotesPluginSettings("day");
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

  return shouldUsePeriodicNotesPluginSettings("week");
}

export function appHasMonthlyNotesPluginLoaded(): boolean {
  return shouldUsePeriodicNotesPluginSettings("month");
}

export function appHasQuarterlyNotesPluginLoaded(): boolean {
  return shouldUsePeriodicNotesPluginSettings("quarter");
}

export function appHasYearlyNotesPluginLoaded(): boolean {
  return shouldUsePeriodicNotesPluginSettings("year");
}

export {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";

import type { IGranularity, IPeriodicNoteSettings } from "./types";
import {
  getPeriodicNoteSettings,
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
  getQuarterlyNoteSettings,
  getYearlyNoteSettings,
  shouldUsePeriodicNotesPluginSettings,
} from "./settings";
import { createDailyNote, getDailyNote, getAllDailyNotes } from "./daily";
import { createWeeklyNote, getAllWeeklyNotes, getWeeklyNote } from "./weekly";
import {
  createMonthlyNote,
  getAllMonthlyNotes,
  getMonthlyNote,
} from "./monthly";
import {
  createQuarterlyNote,
  getAllQuarterlyNotes,
  getQuarterlyNote,
} from "./quarterly";
import { createYearlyNote, getAllYearlyNotes, getYearlyNote } from "./yearly";

export { getDateUID, getDateFromFile, getDateFromPath } from "./parse";
export { getTemplateInfo } from "./vault";

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
  createQuarterlyNote,
  createYearlyNote,
  createPeriodicNote,
  getAllDailyNotes,
  getAllMonthlyNotes,
  getAllWeeklyNotes,
  getAllQuarterlyNotes,
  getAllYearlyNotes,
  getDailyNote,
  getDailyNoteSettings,
  getMonthlyNote,
  getMonthlyNoteSettings,
  getPeriodicNoteSettings,
  getWeeklyNote,
  getWeeklyNoteSettings,
  getQuarterlyNote,
  getQuarterlyNoteSettings,
  getYearlyNote,
  getYearlyNoteSettings,
};
