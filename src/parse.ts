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
  const noteDate = window.moment(file.basename, format, true);
  return noteDate.isValid() ? noteDate : null;
}
