export type IGranularity = "day" | "week" | "month" | "quarter" | "year";

/**
 * The shape returned by `get*NoteSettings()`. Fields are typed as
 * optional because `folder` and `template` may be empty strings rather
 * than meaningful values — and historically callers handle both cases.
 * In practice the resolver always populates each field (defaults fill
 * in for missing plugin settings).
 */
export interface IPeriodicNoteSettings {
  folder?: string;
  format?: string;
  template?: string;
}
