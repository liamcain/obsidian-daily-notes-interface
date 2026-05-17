import { TFile } from "obsidian";

import type { Moment } from "./moment-types";
import {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
  getQuarterlyNoteSettings,
  getYearlyNoteSettings,
} from "./settings";

import { IGranularity } from "./types";
import { basename } from "./vault";

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
    const cleanFormat = removeEscapedCharacters(format);
    return (
      /w{1,2}/i.test(cleanFormat) &&
      (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat))
    );
  }
  return false;
}

export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null {
  return getDateFromFilename(file.basename, granularity);
}

export function getDateFromPath(
  path: string,
  granularity: IGranularity
): Moment | null {
  return getDateFromFilename(basename(path), granularity);
}

function getDateFromFilename(
  filename: string,
  granularity: IGranularity
): Moment | null {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
    quarter: getQuarterlyNoteSettings,
    year: getYearlyNoteSettings,
  };

  const format = getSettings[granularity]().format.split("/").pop();
  const noteDate = window.moment(filename, format, true);

  if (!noteDate.isValid()) {
    return null;
  }

  if (isFormatAmbiguous(format, granularity)) {
    if (granularity === "week") {
      // If weekly note format contains full date, some ISO week 1 dates fall 
      // in the previous year.
      // Parsing by year+week alone would fail, so try parsing with full date first.
      const cleanFormat = removeEscapedCharacters(format);
      const weekMatch = filename.match(/W?(\d{1,2})/i);
      const weekNumber = weekMatch ? parseInt(weekMatch[1], 10) : 0;
      
      if ((weekNumber === 1) && /[YMD]/.test(cleanFormat)) {
        // For week 1, if the parsed date is valid and contains date components, use it
        if (noteDate.isValid()) {
          return noteDate;
        }
      }


      if (/w{1,2}/i.test(cleanFormat)) {
        return window.moment(
          filename,
          // If format contains week, remove day & month formatting
          format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""),
          false
        );
      }
    }
  }

  return noteDate;
}
