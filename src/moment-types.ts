import type { moment } from "obsidian";

// Re-derive the Moment instance type from the value Obsidian exports.
// This keeps the library off of the standalone `moment` package: the
// runtime always comes from `window.moment` (Obsidian-bundled), and the
// types follow the same source of truth.
export type Moment = ReturnType<typeof moment>;
