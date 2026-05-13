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
      // This is a library consumed by Obsidian plugins, not a plugin itself.
      // `activeDocument` is a plugin-runtime API; the moment package is a
      // legitimate devDep here (consumers get moment transitively via
      // obsidian at runtime).
      "obsidianmd/prefer-active-doc": "off",
      // The obsidianmd `rule-custom-message` rule wraps no-console with
      // plugin-targeted advice; this library logs from catch blocks
      // when probing optional plugin settings, which is fine.
      "obsidianmd/rule-custom-message": "off",
      "depend/ban-dependencies": "off",
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
    // Test and test-utility code reaches into mocked internals where
    // `any` is unavoidable. Relax the unsafe-* and unbound-method
    // checks; production source still enforces them.
    files: ["src/__tests__/**/*.ts", "src/testUtils/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/unbound-method": "off",
    },
  },
  {
    // moment is a devDep used for tests; runtime consumers get moment
    // transitively via obsidian. The ban-dependencies rule's blanket
    // "replace moment" advice doesn't apply to a library's devDeps.
    files: ["package.json"],
    rules: {
      "depend/ban-dependencies": "off",
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
