import "obsidian";
import type { IPeriodicNoteSettings } from "./types";

declare module "obsidian" {
  export interface FoldPosition {
    from: number;
    to: number;
  }

  export interface FoldInfo {
    folds: FoldPosition[];
  }

  /**
   * Obsidian's internal `app.foldManager`. Used to persist a file's fold
   * state when creating notes from a template.
   */
  export interface FoldManager {
    load(file: TFile): FoldInfo | null;
    save(file: TFile, foldInfo: FoldInfo | null): Promise<void>;
  }

  /**
   * Periodic-notes-style plugin instance: each granularity has its own
   * sub-settings, with `enabled` driving which plugin owns the surface.
   */
  export interface PeriodicNotesPlugin {
    settings?: {
      daily?: IPeriodicNoteSettings & { enabled?: boolean };
      weekly?: IPeriodicNoteSettings & { enabled?: boolean };
      monthly?: IPeriodicNoteSettings & { enabled?: boolean };
      quarterly?: IPeriodicNoteSettings & { enabled?: boolean };
      yearly?: IPeriodicNoteSettings & { enabled?: boolean };
    };
  }

  /**
   * The Calendar community plugin's weekly-note settings live on its
   * `options` property. The library reads them as a fallback for users
   * who haven't moved to periodic-notes yet.
   */
  export interface CalendarPlugin {
    options?: {
      weeklyNoteFolder?: string;
      weeklyNoteFormat?: string;
      weeklyNoteTemplate?: string;
    };
  }

  type KnownCommunityPlugin = "periodic-notes" | "calendar";

  /**
   * Obsidian's `app.plugins` registry of community plugins. Returns
   * different shapes for different plugin IDs, so the overloads make
   * the call sites type-safe.
   */
  export interface CommunityPluginManager {
    getPlugin(id: "periodic-notes"): PeriodicNotesPlugin | undefined;
    getPlugin(id: "calendar"): CalendarPlugin | undefined;
    getPlugin(id: string): Plugin | undefined;
    plugins: Record<string, Plugin | undefined>;
  }

  /**
   * Obsidian's `app.internalPlugins` registry. The library only reads
   * the "daily-notes" instance options to fall back to the core plugin
   * when periodic-notes isn't installed.
   */
  export interface DailyNotesInstance {
    options?: IPeriodicNoteSettings;
  }

  export interface InternalPluginEntry {
    enabled: boolean;
    instance: DailyNotesInstance;
  }

  export interface InternalPlugins {
    plugins: Record<string, InternalPluginEntry | undefined>;
    getPluginById(id: "daily-notes"): InternalPluginEntry | undefined;
    getPluginById(id: string): InternalPluginEntry | undefined;
  }

  export interface App {
    foldManager: FoldManager;
    internalPlugins: InternalPlugins;
    plugins: CommunityPluginManager;
  }
}
