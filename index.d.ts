import type { Moment } from "moment";
import { TFile } from "obsidian";

export interface IPeriodicNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

// Errors
export class DailyNotesFolderMissingError extends Error {}
export class WeeklyNotesFolderMissingError extends Error {}

// Constants
export const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
export const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";

// Utils
export type IGranularity = "day" | "week" | "month";
export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null;
export function getDateUID(date: Moment, granularity: IGranularity): string;
export function getTemplateContents(template: string): Promise<string>;

// Daily
export function appHasDailyNotesPluginLoaded(): boolean;
export function createDailyNote(date: Moment): Promise<TFile>;
export function getDailyNote(
  date: Moment,
  dailyNotes: Record<string, TFile>
): TFile;
export function getAllDailyNotes(): Record<string, TFile>;
export function getDailyNoteSettings(): IPeriodicNoteSettings;

// Weekly
export function appHasWeeklyNotesPluginLoaded(): boolean;
export function createWeeklyNote(date: Moment): Promise<TFile>;
export function getWeeklyNote(
  date: Moment,
  weeklyNotes: Record<string, TFile>
): TFile;
export function getAllWeeklyNotes(): Record<string, TFile>;
export function getWeeklyNoteSettings(): IPeriodicNoteSettings;

// Monthly
export function appHasMonthlyNotesPluginLoaded(): boolean;
export function createMonthlyNote(date: Moment): Promise<TFile>;
export function getMonthlyNote(
  date: Moment,
  monthlyNotes: Record<string, TFile>
): TFile;
export function getAllMonthlyNotes(): Record<string, TFile>;
export function getMonthlyNoteSettings(): IPeriodicNoteSettings;
