import type { Moment } from "moment";
import { TFile } from "obsidian";

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

function parseDateFormatToRegExp(format: string): RegExp {
  // https://momentjs.com/docs/#/displaying/
  const source = format.replace(/\[([^\]]+)\]|(\.)|(YYYYYY|YYYY|GGGG|gggg|DDDD|DDD|MM|DD|WW|ww|M|D|W|w|Q|d|E|e)/g, function($0, plaintext, dot, token) {
    if (plaintext) return plaintext;
    if (dot) return '\\.';
    switch(token) {
      case 'YYYYYY':
        return '[+-]\\d{6}'
      case 'YYYY':
      case 'GGGG':
      case 'gggg':
        return '\\d{4}';
      case 'DDDD':
        return '\\d{3}';
      case 'DDD':
        return '\\d{1,3}';
      case 'MM':
      case 'DD':
      case 'WW':
      case 'ww':
        return '\\d{2}';
      case 'M':
      case 'D':
      case 'W':
      case 'w':
        return '\\d{1,2}';
      case 'Q':
      case 'd':
      case 'E':
      case 'e':
        return '\\d';
    }
    return $0;
  });
  return new RegExp(source, '');
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

  const format = getSettings[granularity]().format;
  const noteDate = window.moment(file.path.match(parseDateFormatToRegExp(format)), format, true);

    
  if (!noteDate.isValid()) {
    return null;
  }

  if (isFormatAmbiguous(format, granularity)) {
    if (granularity === "week") {
      const cleanFormat = removeEscapedCharacters(format);
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
