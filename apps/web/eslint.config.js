import { nextJsConfig } from "@starter/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    ignores: [
      "e2e/**",
      "playwright.config.ts",
      "playwright-report/**",
      "test-results/**",
      ".next/**",
    ],
  },
];
