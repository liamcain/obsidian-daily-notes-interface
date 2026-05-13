import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // `obsidian` is provided by consumers; never bundle it.
  deps: {
    neverBundle: ["obsidian"],
  },
});
