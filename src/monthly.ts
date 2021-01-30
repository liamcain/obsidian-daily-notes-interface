import type { Moment } from "moment";
import { normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import { DEFAULT_MONTHLY_NOTE_FORMAT } from "./constants";
import { getDateFromFile, getDateUID } from "./parse";
import { IPeriodicNoteSettings } from "./types";
import { getNotePath, getTemplateContents } from "./vault";

export class MonthlyNotesFolderMissingError extends Error {}

/**
 * Read the user settings for the `monthly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getMonthlyNoteSettings(): IPeriodicNoteSettings {
  try {
    const settings =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>window.app).plugins.getPlugin("monthly-notes")?.options || {};
    return {
      format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom monthly note settings found!", err);
  }
}

/**
 * This function mimics the behavior of the monthly-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
export async function createMonthlyNote(date: Moment): Promise<TFile> {
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

export function getMonthlyNote(
  date: Moment,
  monthlyNotes: Record<string, TFile>
): TFile {
  return monthlyNotes[getDateUID(date, "month")] ?? null;
}

export function getAllMonthlyNotes(): Record<string, TFile> {
  const { vault } = window.app;
  const { folder } = getMonthlyNoteSettings();

  const monthlyNotesFolder = vault.getAbstractFileByPath(
    normalizePath(folder)
  ) as TFolder;

  if (!monthlyNotesFolder) {
    throw new MonthlyNotesFolderMissingError(
      "Failed to find monthly notes folder"
    );
  }

  const monthlyNotes: Record<string, TFile> = {};
  Vault.recurseChildren(monthlyNotesFolder, (note) => {
    if (note instanceof TFile) {
      const date = getDateFromFile(note, "month");
      if (date) {
        const dateString = getDateUID(date, "month");
        monthlyNotes[dateString] = note;
      }
    }
  });

  return monthlyNotes;
}
