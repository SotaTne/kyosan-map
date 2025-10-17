import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboConfig from 'eslint-config-turbo/flat';
import onlyWarn from "eslint-plugin-only-warn";
import tseslint from "typescript-eslint";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...turboConfig,
  ...tseslint.configs.recommended,
  {
    // plugins: {
    //   turbo: turboPlugin,
    // },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
]
