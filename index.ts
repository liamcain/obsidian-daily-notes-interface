import type { Moment } from "moment";
import { join } from "path";
import { normalizePath, App, Notice, TFile } from "obsidian";

export const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

declare global {
  interface Window {
    app: App;
    moment: () => Moment;
  }
}

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
    // XXX: Access private API for internal plugins
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
    console.error(`Failed to read daily note template '${templatePath}'`, err);
    new Notice("Failed to read the daily note template");
    return "";
  }
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
          (_, timeOrDate, momentFormat) => {
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
