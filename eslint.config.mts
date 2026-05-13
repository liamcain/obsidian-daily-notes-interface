import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";
import globals from "globals";

declare global {
  interface ImportMeta {
    dirname: string;
  }
}

export default tseslint.config(
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
    },
  },
  {
    // src/moment-types.ts bridges Moment in from the moment package
    // intentionally (consumers get moment transitively via obsidian).
    // Tests run outside Obsidian and need a real moment-timezone import.
    files: ["src/moment-types.ts", "src/__tests__/**/*.ts"],
    rules: {
      "no-restricted-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules",
      "dist",
      "tsdown.config.ts",
      "vitest.config.ts",
    ],
  },
);
