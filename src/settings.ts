import {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";
import { IPeriodicNoteSettings } from "./types";

function validateString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function shouldUsePeriodicNotesSettings(
  periodicity: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
): boolean {
  const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
  return !!periodicNotes?.settings?.[periodicity]?.enabled;
}

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getDailyNoteSettings(): IPeriodicNoteSettings {
  try {
    const { internalPlugins, plugins } = window.app;

    if (shouldUsePeriodicNotesSettings("daily")) {
      const { format, folder, template } =
        plugins.getPlugin("periodic-notes")?.settings?.daily || {};
      return {
        format: format || DEFAULT_DAILY_NOTE_FORMAT,
        folder: validateString(folder).trim(),
        template: validateString(template).trim(),
      };
    }

    const { folder, format, template } =
      internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    return {
      format: format || DEFAULT_DAILY_NOTE_FORMAT,
      folder: validateString(folder).trim(),
      template: validateString(template).trim(),
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
    const pluginManager = window.app.plugins;

    const calendarSettings = pluginManager.getPlugin("calendar")?.options;
    const periodicNotesSettings =
      pluginManager.getPlugin("periodic-notes")?.settings?.weekly;

    if (shouldUsePeriodicNotesSettings("weekly") && periodicNotesSettings) {
      return {
        format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
        folder: validateString(periodicNotesSettings.folder).trim(),
        template: validateString(periodicNotesSettings.template).trim(),
      };
    }

    const settings = calendarSettings || {};
    return {
      format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
      folder: validateString(settings.weeklyNoteFolder).trim(),
      template: validateString(settings.weeklyNoteTemplate).trim(),
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
  const pluginManager = window.app.plugins;

  try {
    const settings =
      (shouldUsePeriodicNotesSettings("monthly") &&
        pluginManager.getPlugin("periodic-notes")?.settings?.monthly) ||
      {};

    return {
      format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
      folder: validateString(settings.folder).trim(),
      template: validateString(settings.template).trim(),
    };
  } catch (err) {
    console.info("No custom monthly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getQuarterlyNoteSettings(): IPeriodicNoteSettings {
  const pluginManager = window.app.plugins;

  try {
    const settings =
      (shouldUsePeriodicNotesSettings("quarterly") &&
        pluginManager.getPlugin("periodic-notes")?.settings?.quarterly) ||
      {};

    return {
      format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
      folder: validateString(settings.folder).trim(),
      template: validateString(settings.template).trim(),
    };
  } catch (err) {
    console.info("No custom quarterly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getYearlyNoteSettings(): IPeriodicNoteSettings {
  const pluginManager = window.app.plugins;

  try {
    const settings =
      (shouldUsePeriodicNotesSettings("yearly") &&
        pluginManager.getPlugin("periodic-notes")?.settings?.yearly) ||
      {};

    return {
      format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
      folder: validateString(settings.folder).trim(),
      template: validateString(settings.template).trim(),
    };
  } catch (err) {
    console.info("No custom yearly note settings found!", err);
  }
}
