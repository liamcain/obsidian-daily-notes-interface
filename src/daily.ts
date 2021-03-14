import type { Moment } from "moment";
import { App, normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import { getDateFromFile, getDateUID } from "./parse";
import { getDailyNoteSettings } from "./settings";
import { getTemplateContents, getNotePath } from "./vault";

export class DailyNotesFolderMissingError extends Error {}

/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
export async function createDailyNote(date: Moment): Promise<TFile> {
  const app = window.app as App;
  const { vault } = app;
  const moment = window.moment;

  const { template, format, folder } = getDailyNoteSettings();

  const templateContents = await getTemplateContents(template);
  const filename = date.format(format);
  const normalizedPath = await getNotePath(folder, filename);

  try {
    const createdFile = await vault.create(
      normalizedPath,
      templateContents
        .replace(
          /{{\s*(date|time)\s*:(.*?)}}/gi,
          (_, _timeOrDate, momentFormat) => {
            const now = moment();
            return date
              .set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
              })
              .format(momentFormat.trim());
          }
        )
        .replace(/{{\s*date\s*}}/gi, filename)
        .replace(/{{\s*time\s*}}/gi, moment().format("HH:mm"))
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
  dailyNotes: Record<string, TFile>
): TFile {
  return dailyNotes[getDateUID(date, "day")] ?? null;
}

export function getAllDailyNotes(): Record<string, TFile> {
  /**
   * Find all daily notes in the daily note folder
   */
  const { vault } = window.app;
  const { folder } = getDailyNoteSettings();

  const dailyNotesFolder = vault.getAbstractFileByPath(
    normalizePath(folder)
  ) as TFolder;

  if (!dailyNotesFolder) {
    throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
  }

  const dailyNotes: Record<string, TFile> = {};
  Vault.recurseChildren(dailyNotesFolder, (note) => {
    if (note instanceof TFile) {
      const date = getDateFromFile(note, "day");
      if (date) {
        const dateString = getDateUID(date, "day");
        dailyNotes[dateString] = note;
      }
    }
  });

  return dailyNotes;
}
