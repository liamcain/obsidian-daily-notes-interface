import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

export default {
  input: "src/index.ts",
  output: {
    sourcemap: "inline",
    format: "cjs",
    file: "dist/main.js",
  },
  external: ["obsidian", "fs", "os", "path"],
  plugins: [
    typescript(),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    commonjs({
      include: "node_modules/**",
    }),
  ],
};
