const globals = require("globals");
const pluginJs = require("@eslint/js");
const pluginTs = require("@typescript-eslint/eslint-plugin");
const parserTs = require("@typescript-eslint/parser");
const pluginImport = require("eslint-plugin-import");

module.exports = [
  {
    files: ["src/**/*.ts"],
    ignores: ["lib/**/*", "generated/**/*"],
    languageOptions: {
      ecmaVersion: 12,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      parser: parserTs,
      parserOptions: {
        project: ["./tsconfig.json"],
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      import: pluginImport,
    },
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...pluginTs.configs.recommended.rules,
      quotes: ["error", "double"],
      "import/no-unresolved": "off",
      indent: ["error", 2],
    },
  },
];
