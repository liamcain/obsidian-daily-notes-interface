import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: {
    format: "cjs",
    file: "dist/main.js",
    name: pkg.name,
  },
  external: ["obsidian", "fs", "os", "path"],
  plugins: [
    typescript(),
    resolve({
      browser: true,
    }),
    commonjs({
      include: "node_modules/**",
    }),
  ],
};
