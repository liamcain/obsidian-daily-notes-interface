import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  // `obsidian` is provided by consumers; never bundle it.
  // `moment` is only referenced for types; consumers get it transitively
  // through obsidian, so the generated .d.ts can import it externally
  // instead of inlining moment's full type surface.
  deps: {
    neverBundle: ["obsidian", "moment"],
  },
});
