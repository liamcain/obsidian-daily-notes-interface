import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

export default {
  input: "index.ts",
  output: {
    format: "cjs",
    file: "main.js",
  },
  external: ["obsidian", "fs", "path"],
  plugins: [typescript(), nodeResolve({ browser: true }), commonjs()],
};
