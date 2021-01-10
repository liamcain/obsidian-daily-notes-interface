import type { Moment } from "moment";
import { TFile } from "obsidian";

export interface IDailyNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

export function getDateFromFile(file: TFile): Moment | null;
export function getDateUID(
  date: Moment,
  granularity: "day" | "week" | "month"
): string;

export function appHasDailyNotesPluginLoaded(): boolean;
export function createDailyNote(date: Moment): Promise<TFile>;
export function getDailyNote(
  date: Moment,
  dailyNotes: Record<string, TFile>
): TFile;
export function getAllDailyNotes(): Record<string, TFile>;
export function getDailyNoteSettings(): IDailyNoteSettings;
export function getTemplateContents(template: string): Promise<string>;

export class DailyNotesFolderMissingError extends Error {}
