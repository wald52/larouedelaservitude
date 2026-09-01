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
    // Fonctions Netlify historiques au format CommonJS.
    files: ["netlify/functions/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: { ...globals.node }
    }
  },
  {
    // Fonctions Netlify modernes, scripts d'outillage et tests ESM Node.
    files: ["netlify/functions/**/*.mjs", "scripts/**/*.mjs", "tests/**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: { ...globals.node }
    },
    rules: {
      "no-console": "off"
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
