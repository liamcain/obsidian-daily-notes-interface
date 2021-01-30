import type { Moment } from "moment";
import { normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import { DEFAULT_WEEKLY_NOTE_FORMAT } from "./constants";
import { getDateFromFile, getDateUID } from "./parse";
import { getNotePath, getTemplateContents } from "./vault";

export class WeeklyNotesFolderMissingError extends Error {}

export interface IWeeklyNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getWeeklyNoteSettings(): IWeeklyNoteSettings {
  try {
    const settings =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>window.app).plugins.getPlugin("calendar")?.options || {};
    return {
      format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
      folder: settings.weeklyNoteFolder?.trim() || "",
      template: settings.weeklyNoteTemplate?.trim() || "",
    };
  } catch (err) {
    console.info("No custom weekly note settings found!", err);
  }
}

function getDaysOfWeek(): string[] {
  const { moment } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let weekStart = (<any>moment.localeData())._week.dow;
  const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  while (weekStart) {
    daysOfWeek.push(daysOfWeek.shift());
    weekStart--;
  }
  return daysOfWeek;
}

export function getDayOfWeekNumericalValue(dayOfWeekName: string): number {
  return getDaysOfWeek().indexOf(dayOfWeekName.toLowerCase());
}

export async function createWeeklyNote(date: Moment): Promise<TFile> {
  const { vault } = window.app;
  const { template, format, folder } = getWeeklyNoteSettings();
  const templateContents = await getTemplateContents(template);
  const filename = date.format(format);
  const normalizedPath = getNotePath(folder, filename);

  try {
    const createdFile = await vault.create(
      normalizedPath,
      templateContents
        .replace(
          /{{\s*(date|time)\s*:(.*?)}}/gi,
          (_, _timeOrDate, momentFormat) => {
            return date.format(momentFormat.trim());
          }
        )
        .replace(/{{\s*title\s*}}/gi, filename)
        .replace(
          /{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi,
          (_, dayOfWeek, momentFormat) => {
            const day = getDayOfWeekNumericalValue(dayOfWeek);
            return date.weekday(day).format(momentFormat.trim());
          }
        )
    );
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}

export function getWeeklyNote(
  date: Moment,
  weeklyNotes: Record<string, TFile>
): TFile {
  return weeklyNotes[getDateUID(date, "week")] ?? null;
}

export function getAllWeeklyNotes(): Record<string, TFile> {
  const { vault } = window.app;
  const { folder } = getWeeklyNoteSettings();

  const weeklyNotesFolder = vault.getAbstractFileByPath(
    normalizePath(folder)
  ) as TFolder;

  if (!weeklyNotesFolder) {
    throw new WeeklyNotesFolderMissingError(
      "Failed to find weekly notes folder"
    );
  }

  const weeklyNotes: Record<string, TFile> = {};
  Vault.recurseChildren(weeklyNotesFolder, (note) => {
    if (note instanceof TFile) {
      const date = getDateFromFile(note, "week");
      if (date) {
        const dateString = getDateUID(date, "week");
        weeklyNotes[dateString] = note;
      }
    }
  });

  return weeklyNotes;
}
