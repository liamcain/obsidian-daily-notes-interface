import type { Moment } from "moment";
import { TFile } from "obsidian";

export as namespace dailyNotes;

export interface IDailyNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}

export interface IDailyNote {
  file: TFile;
  date: Moment;
}

export function appHasDailyNotesPluginLoaded(): IDailyNoteSettings;
export function createDailyNote(date: Moment): Promise<TFile>;
export function getDailyNote(date: Moment, dailyNotes: IDailyNote[]): TFile;
export function getAllDailyNotes(): IDailyNote[];
export function getDailyNoteSettings(): IDailyNoteSettings;
export function getTemplateContents(template: string): Promise<string>;
