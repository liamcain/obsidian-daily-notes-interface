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

function removeEscapedCharacters(format: string): string {
  return format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets
}

/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
function isFormatAmbiguous(format: string, granularity: IGranularity) {
  if (granularity === "week") {
    return /w/i.test(removeEscapedCharacters(format));
  }
  return false;
}

export function getUnambigouosFormat(granularity: IGranularity): string {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
  };

  const format = getSettings[granularity]().format.split("/").pop();
  if (!isFormatAmbiguous(format, granularity)) {
    return format;
  }

  const cleanFormat = removeEscapedCharacters(format);
  if (/w/i.test(cleanFormat)) {
    // If format contains week, remove month formatting
    return format.replace(/M{1,4}/g, "");
  }
  return format;
}

export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null {
  const format = getUnambigouosFormat(granularity);
  const useStrictMode = !isFormatAmbiguous(format, granularity);

  const noteDate = window.moment(file.basename, format, useStrictMode);
  return noteDate.isValid() ? noteDate : null;
}
