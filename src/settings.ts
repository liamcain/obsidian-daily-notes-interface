import { DEFAULT_FORMAT } from "./constants";
import {IGranularity, IPeriodicity, IPeriodicNoteSettings} from "./types";

function getPeriodicNotesPlugin() {
  const { app } = window;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (<any>app).plugins.getPlugin("periodic-notes");
}

export function hasPeriodicNotesPlugin(): boolean {
  return Boolean(getPeriodicNotesPlugin());
}

export function hasNewPeriodicNotesPlugin(): boolean {
  const periodicNotes = getPeriodicNotesPlugin();
  // The CalenderSetManager is not available in the old version (0.0.17) of the Periodic Notes plugin
  return periodicNotes && Object.hasOwn(periodicNotes, "calendarSetManager");
}

export function shouldUsePeriodicNotesPluginSettings(
  granularity: IGranularity
): boolean {
  if(!hasPeriodicNotesPlugin()) return false; // no Periodic Notes Plugin
  return (getPeriodicNotesPluginRawSettings(granularity))?.enabled;
}

function getPeriodicNotesPluginRawSettings(granularity: IGranularity){
  const periodicNotes = getPeriodicNotesPlugin();
  if(!periodicNotes) return {}; // no Periodic Notes Plugin
  if(hasNewPeriodicNotesPlugin()) {
        // New Periodic Notes uses CalendarSetManager
        return periodicNotes?.calendarSetManager?.getActiveSet?.()?.[granularity] || {} ;
  }
  // Legacy settings
  return periodicNotes?.settings?.[IPeriodicity[granularity]] || {} ;
}

export function getPeriodicNotesPluginSettings(granularity: IGranularity) : IPeriodicNoteSettings {
  const settings = getPeriodicNotesPluginRawSettings(granularity);
  return {
    format: settings.format || DEFAULT_FORMAT[granularity],
    folder: settings.folder?.trim() || "",
    template: (settings.templatePath ?? settings.template)?.trim() || "",
  };
}


export function getPeriodicNoteSettings(granularity: IGranularity): IPeriodicNoteSettings {
  try {
    // First try Periodic Notes Plugin
    if (shouldUsePeriodicNotesPluginSettings(granularity)) {
      return getPeriodicNotesPluginSettings(granularity);
    }

    // For daily notes also check the Daily Notes plugin
    if(granularity == "day") {
      const { folder, format, template } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (<any>window.app).internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
      return {
        format: format || DEFAULT_FORMAT["day"],
        folder: folder?.trim() || "",
        template: template?.trim() || "",
      };
    }

    // For weekly notes also check the Calendar plugin
    if (granularity == "week") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const calendarSettings = (<any>window.app).plugins.getPlugin("calendar")?.options || {};
      return {
        format: calendarSettings.weeklyNoteFormat || DEFAULT_FORMAT["week"],
        folder: calendarSettings.weeklyNoteFolder?.trim() || "",
        template: calendarSettings.weeklyNoteTemplate?.trim() || "",
      };
    }

  } catch (err) {
    console.info("No custom", IPeriodicity[granularity], "note settings found!", err);
  }
}

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getDailyNoteSettings(): IPeriodicNoteSettings {
  return getPeriodicNoteSettings("day");
}
export function getWeeklyNoteSettings(): IPeriodicNoteSettings {
  return getPeriodicNoteSettings("week");
}
export function getMonthlyNoteSettings(): IPeriodicNoteSettings {
  return getPeriodicNoteSettings("month");
}
export function getQuarterlyNoteSettings(): IPeriodicNoteSettings {
  return getPeriodicNoteSettings("quarter");
}
export function getYearlyNoteSettings(): IPeriodicNoteSettings {
  return getPeriodicNoteSettings("year");
}
