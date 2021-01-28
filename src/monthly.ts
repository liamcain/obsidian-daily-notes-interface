import type { Moment } from "moment";
import { normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import { DEFAULT_MONTHLY_NOTE_FORMAT } from "./constants";
import { getDateFromFile, getDateUID } from "./parse";
import { getNotePath, getTemplateContents } from "./vault";

export class DailyNotesFolderMissingError extends Error {}

export interface IDailyNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getMonthlyNoteSettings(): IDailyNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (<any>window.app).plugins.plugins["monthly-notes"]
      ?.instance.options;
    return {
      format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom daily note settings found!", err);
  }
}

/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
export async function createWeeklyNote(date: Moment): Promise<TFile> {
  const { vault } = window.app;
  const { template, format, folder } = getMonthlyNoteSettings();
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
    );
    return createdFile;
  } catch (err) {
    console.error(`Failed to create file: '${normalizedPath}'`, err);
    new Notice("Unable to create new file.");
  }
}

export function getDailyNote(
  date: Moment,
  weeklyNotes: Record<string, TFile>
): TFile {
  return weeklyNotes[getDateUID(date, "week")] ?? null;
}

export function getAllWeeklyNotes(): Record<string, TFile> {
  const { vault } = window.app;
  const { folder } = getMonthlyNoteSettings();

  const dailyNotesFolder = vault.getAbstractFileByPath(
    normalizePath(folder)
  ) as TFolder;

  if (!dailyNotesFolder) {
    throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
  }

  const dailyNotes: Record<string, TFile> = {};
  Vault.recurseChildren(dailyNotesFolder, (note) => {
    if (note instanceof TFile) {
      const date = getDateFromFile(note, "month");
      if (date) {
        const dateString = getDateUID(date, "week");
        dailyNotes[dateString] = note;
      }
    }
  });

  return dailyNotes;
}
