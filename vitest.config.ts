import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    clearMocks: true,
    globals: false,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/__tests__/**/*.spec.ts"],
  },
  resolve: {
    alias: {
      // Match the legacy jest moduleNameMapper so imports like
      // `from "src/testUtils/..."` keep working without rewriting them.
      src: fileURLToPath(new URL("./src", import.meta.url)),
      // The published `obsidian` package has no resolvable entry point
      // (it's a types-only API stub). Redirect imports of `obsidian` to
      // the local mock so vite's resolver doesn't choke.
      obsidian: fileURLToPath(
        new URL("./src/__mocks__/obsidian.ts", import.meta.url)
      ),
      path: fileURLToPath(
        new URL("./src/__mocks__/path.ts", import.meta.url)
      ),
    },
  },
});
