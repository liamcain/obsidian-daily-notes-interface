import {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
} from "./constants";
import { IPeriodicNoteSettings } from "./types";

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getDailyNoteSettings(): IPeriodicNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { internalPlugins, plugins } = <any>window.app;

    const dailyNoteSettings = internalPlugins.getPluginById("daily-notes")
      ?.instance?.options;
    const periodicNotesSettings = plugins.getPlugin("periodic-notes")?.settings
      ?.daily;

    const settings = periodicNotesSettings || dailyNoteSettings || {};
    return {
      format: settings.format || DEFAULT_DAILY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom daily note settings found!", err);
  }
}

/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getWeeklyNoteSettings(): IPeriodicNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = (<any>window.app).plugins;

    const calendarSettings = pluginManager.getPlugin("calendar")?.options;
    const periodicNotesSettings = pluginManager.getPlugin("periodic-notes")
      ?.settings?.weekly;

    if (periodicNotesSettings) {
      return {
        format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
        folder: periodicNotesSettings.folder?.trim() || "",
        template: periodicNotesSettings.template?.trim() || "",
      };
    }

    const settings = calendarSettings || {};
    return {
      format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
      folder: settings.weeklyNoteFolder?.trim() || "",
      template: settings.weeklyNoteTemplate?.trim() || "",
    };
  } catch (err) {
    console.info("No custom weekly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getMonthlyNoteSettings(): IPeriodicNoteSettings {
  try {
    const settings =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (<any>window.app).plugins.getPlugin("periodic-notes")?.settings
        ?.monthly || {};

    return {
      format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom monthly note settings found!", err);
  }
}
