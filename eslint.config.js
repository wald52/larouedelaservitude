const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "shares/**", "data/**"]
  },
  js.configs.recommended,
  prettier,
  {
    // Modules front-end (chargés en <script type="module"> ou import dynamique)
    files: ["js/**/*.js", "bills.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.browser }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off"
    }
  },
  {
    // Service worker (script classique enregistré sans type="module")
    files: ["service-worker.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: { ...globals.serviceworker, ...globals.browser }
    }
  },
  {
    // Fonctions serverless Netlify (CommonJS, runtime Node)
    files: ["netlify/functions/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node }
    }
  },
  {
    // Scripts d'outillage et de test (ESM Node)
    files: ["scripts/**/*.mjs", "tests/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node }
    }
  },
  {
    // Ce fichier de config lui-même (CommonJS)
    files: ["eslint.config.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { ...globals.node }
    }
  }
];
