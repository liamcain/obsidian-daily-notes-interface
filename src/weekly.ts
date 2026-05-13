import { normalizePath, Notice, TFile, TFolder, Vault } from "obsidian";

import { appHasWeeklyNotesPluginLoaded } from "./index";
import type { DurationConstructor, Moment } from "./moment-types";
import { getDateFromFile, getDateUID } from "./parse";
import { getWeeklyNoteSettings } from "./settings";
import { getNotePath, getTemplateInfo } from "./vault";

export class WeeklyNotesFolderMissingError extends Error {}

function getDaysOfWeek(): string[] {
  const { moment } = window;
  let weekStart = moment.localeData().firstDayOfWeek();
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

export async function createWeeklyNote(
  date: Moment
): Promise<TFile | undefined> {
  const { vault } = window.app;
  const {
    template = "",
    format = "",
    folder = "",
  } = getWeeklyNoteSettings() ?? {};
  const [templateContents, IFoldInfo] = await getTemplateInfo(template);
  const filename = date.format(format);
  const normalizedPath = await getNotePath(folder, filename);

  try {
    const createdFile = await vault.create(
      normalizedPath,
      templateContents
        .replace(
          /{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi,
          (
            _: string,
            _timeOrDate: string,
            calc: string,
            timeDelta: string,
            unit: DurationConstructor,
            momentFormat: string
          ) => {
            const now = window.moment();
            const currentDate = date.clone().set({
              hour: now.get("hour"),
              minute: now.get("minute"),
              second: now.get("second"),
            });
            if (calc) {
              currentDate.add(parseInt(timeDelta, 10), unit);
            }

            if (momentFormat) {
              return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
          }
        )
        .replace(/{{\s*title\s*}}/gi, filename)
        .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
        .replace(
          /{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi,
          (_: string, dayOfWeek: string, momentFormat: string) => {
            const day = getDayOfWeekNumericalValue(dayOfWeek);
            return date.weekday(day).format(momentFormat.trim());
          }
        )
    );

    void window.app.foldManager.save(createdFile, IFoldInfo);

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
  const weeklyNotes: Record<string, TFile> = {};

  if (!appHasWeeklyNotesPluginLoaded()) {
    return weeklyNotes;
  }

  const { vault } = window.app;
  const { folder = "" } = getWeeklyNoteSettings() ?? {};
  const weeklyNotesFolder = vault.getAbstractFileByPath(normalizePath(folder));

  if (!(weeklyNotesFolder instanceof TFolder)) {
    throw new WeeklyNotesFolderMissingError(
      "Failed to find weekly notes folder"
    );
  }

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
