import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
export default defineConfig({
  files: [
    "src/**/*.{ts,tsx}",
    "server/**/*.ts",
    "api/**/*.ts",
    "scripts/cloud-inspect.mjs",
  ],
  languageOptions: {
    globals: {
      process: "readonly",
      Buffer: "readonly",
      fetch: "readonly",
      AbortSignal: "readonly",
      console: "readonly",
    },
  },
  extends: [js.configs.recommended, tseslint.configs.recommended],
});
