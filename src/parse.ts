import type { Moment } from "moment";
import { TFile } from "obsidian";

import {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
} from "./settings";

import { IGranularity } from "./types";

/**
 * dateUID is a way of weekly identifying daily/weekly/monthly notes.
 * They are prefixed with the granularity to avoid ambiguity.
 */
export function getDateUID(
  date: Moment,
  granularity: IGranularity = "day"
): string {
  const ts = date.clone().startOf(granularity).format();
  return `${granularity}-${ts}`;
}

/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
export function formatWithoutMonth(format: string): string {
  return format.replace(/M{1,4}/g, "");
}

export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
  };

  const format = getSettings[granularity]().format.split("/").pop();

  if (granularity === "week") {
    const weeklyFormat = formatWithoutMonth(format);
    const noteDate = window.moment(file.basename, weeklyFormat); // forgiving mode
    return noteDate.isValid() ? noteDate : null;
  }

  const noteDate = window.moment(file.basename, format, true);
  return noteDate.isValid() ? noteDate : null;
}
