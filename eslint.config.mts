import tseslint from "typescript-eslint";
import globals from "globals";

declare global {
  interface ImportMeta {
    dirname: string;
  }
}

export default tseslint.config(
  ...tseslint.configs.recommendedTypeChecked,
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
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
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
    ignores: [
      "node_modules",
      "dist",
      "tsdown.config.ts",
      "vitest.config.ts",
    ],
  },
);
