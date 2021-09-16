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
export class MonthlyNotesFolderMissingError extends Error {}
export class QuarterlyNotesFolderMissingError extends Error {}
export class YearlyNotesFolderMissingError extends Error {}

// Constants
export const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
export const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
export const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
export const DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
export const DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";

export type IGranularity = "day" | "week" | "month" | "quarter" | "year";

interface IFold {
  from: number;
  to: number;
}

interface IFoldInfo {
  folds: IFold[];
}

// Utils
export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null;
export function getDateFromPath(
  path: string,
  granularity: IGranularity
): Moment | null;
export function getDateUID(date: Moment, granularity: IGranularity): string;
export function getTemplateInfo(template: string): Promise<[string, IFoldInfo]>;

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

// Quarterly
export function appHasQuarterlyNotesPluginLoaded(): boolean;
export function createQuarterlyNote(date: Moment): Promise<TFile>;
export function getQuarterlyNote(
  date: Moment,
  quarterlyNotes: Record<string, TFile>
): TFile;
export function getAllQuarterlyNotes(): Record<string, TFile>;
export function getQuarterlyNoteSettings(): IPeriodicNoteSettings;

// Yearly
export function appHasYearlyNotesPluginLoaded(): boolean;
export function createYearlyNote(date: Moment): Promise<TFile>;
export function getYearlyNote(
  date: Moment,
  yearlyNotes: Record<string, TFile>
): TFile;
export function getAllYearlyNotes(): Record<string, TFile>;
export function getYearlyNoteSettings(): IPeriodicNoteSettings;

// Generic
export function getPeriodicNoteSettings(
  granularity: IGranularity
): IPeriodicNoteSettings;
export function createPeriodicNote(
  granularity: IGranularity,
  date: Moment
): Promise<TFile>;
