// The library accesses Obsidian globals via `window.app` and `window.moment`
// at runtime. Tests assign to those before each case. In a Node test env
// there's no `window`, so provide a minimal stand-in here. Each spec
// overwrites the contents in its own beforeEach.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = globalThis;
