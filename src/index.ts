import type { Moment } from "moment";
import type moment from "moment";
import { join } from "path";
import { normalizePath, App, Notice, TFile, TFolder, Vault } from "obsidian";

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

declare global {
  interface Window {
    app: App;
    moment: typeof moment;
  }
}

type IGranularity = "day" | "week" | "month";

export class DailyNotesFolderMissingError extends Error {}

export interface IDailyNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

function getNotePath(directory: string, filename: string): string {
  if (!filename.endsWith(".md")) {
    filename += ".md";
  }
  return normalizePath(join(directory, filename));
}

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getDailyNoteSettings(): IDailyNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const settings = (<any>window.app).internalPlugins.plugins["daily-notes"]
      .instance.options;
    return {
      format: settings.format || DEFAULT_DATE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom daily note settings found!", err);
  }
}

export function appHasDailyNotesPluginLoaded(): boolean {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dailyNotesPlugin = (<any>app).internalPlugins.plugins["daily-notes"];
  return dailyNotesPlugin && dailyNotesPlugin.enabled;
}

export async function getTemplateContents(template: string): Promise<string> {
  const app = window.app as App;
  const { metadataCache, vault } = app;

  const templatePath = normalizePath(template);
  if (templatePath === "/") {
    return Promise.resolve("");
  }

  try {
    const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
    const contents = await vault.cachedRead(templateFile);
    return contents;
  } catch (err) {
    console.error(
      `Failed to read the daily note template '${templatePath}'`,
      err
    );
    new Notice("Failed to read the daily note template");
    return "";
  }
}

export function getDateFromFile(file: TFile): Moment | null {
  const { format } = getDailyNoteSettings();
  const noteDate = window.moment(file.basename, format, true);
  return noteDate.isValid() ? noteDate : null;
}

export function getDateUID(
  date: Moment,
  granularity: IGranularity = "day"
): string {
  const ts = date.clone().startOf(granularity).format();
  return `${granularity}-${ts}`;
}

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
  return dailyNotes[getDateUID(date)] ?? null;
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
      const date = getDateFromFile(note);
      if (date) {
        const dateString = getDateUID(date);
        dailyNotes[dateString] = note;
      }
    }
  });

  return dailyNotes;
}
