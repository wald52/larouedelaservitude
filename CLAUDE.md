# CLAUDE.md

Guide for AI assistants working on **La roue de la servitude** — a French-language, installable
PWA that presents the 371 French taxes and mandatory levies as a spinnable wheel.

> The codebase, comments, UI strings and commit messages are **in French**. Keep writing them in
> French. This file is in English because it is tooling documentation, not product content.

## 1. What this project is (and is not)

- **Static site, no build step.** `index.html` is served as-is and loads `./js/app.js` as a native
  ES module. There is no bundler, no transpiler, no framework, no TypeScript. What you write is
  what the browser runs.
- **No dev server script.** Serve the repo root over HTTP to test (`python3 -m http.server 8000`
  or `npx serve .`). Opening `index.html` via `file://` breaks ES modules, `fetch` and the service
  worker.
- **npm is only for tooling.** `package.json` has zero runtime dependencies — only eslint/prettier
  as devDependencies. Nothing in `node_modules/` ever ships to the browser.
- **Two deploy targets**, which is why paths are computed rather than hardcoded:
  - Netlify (`https://larouedelaservitude.netlify.app`) — the only target where the serverless
    functions exist.
  - GitHub Pages (`https://wald52.github.io/larouedelaservitude/`) — a sub-folder deploy, which is
    the reason `BASE_PATH` exists.

## 2. Commands

```bash
npm ci                 # install tooling (first time)

npm run check          # check:imports + check:data — the cheap, fast gate
npm run check:imports  # scripts/check-imports.mjs: every relative import/script src resolves
npm run check:data     # scripts/validate-data.mjs: light/full JSON invariants
npm run lint           # eslint .
npm test               # node --test (runs tests/*.test.mjs)

npm run ci             # check + lint + test — mirrors .github/workflows/ci.yml exactly
```

Run `npm run ci` before committing. CI (`.github/workflows/ci.yml`, Node 20) runs on every push to
every branch and on every PR, and runs exactly those three steps.

### Prettier: check it, do not bulk-fix it

`npm run format` (`prettier --check .`) **currently fails on 20 pre-existing files** and is
deliberately *not* part of `npm run ci` or the CI workflow. Do **not** run `npm run format:write`
across the repo — it would produce a several-thousand-line diff unrelated to your change. Match the
style of the file you are editing instead. Only reformat a file if reformatting that file *is* the
task.

## 3. Layout

```
index.html              Single page: PWA/social meta, all app-shell CSS inline, DOM, loads js/app.js
js/app.js               Wheel rendering, physics, spin sound cadence, overlay, sharing, SW registration
js/entries.js           Two-tier data loading (light → full) + IndexedDB cache
js/audio.js             WebAudio, offline-first sound decoding + IndexedDB cache
js/menu.js              Sidebar, panels, history, settings; builds its own DOM at runtime
js/settings.js          Reads the sound setting (data-attribute first, localStorage fallback)
js/constants.js         SETTINGS_KEY and BASE_PATH — shared by front-end modules
bills.js                Banknote particle effect (repo root, lazy-imported by app.js)
bills.css / menu.css    Styles for those two features (all other CSS is inline in index.html)
service-worker.js       PWA precache + per-type fetch strategies
data/entries-*.json     The data (see §5)
netlify/functions/      Serverless endpoints (see §6)
scripts/                Validation + one-off data conversion tooling
tests/                  node:test suites (Netlify function handlers + data invariants)
shares/                 Runtime artifacts only; share-*.html is gitignored
```

### Module graph

`index.html` → `js/app.js` → `js/entries.js`, `js/audio.js`, `js/menu.js`
`js/audio.js` → `js/settings.js` → `js/constants.js`
`js/app.js` → `import('../bills.js')` (dynamic, on first spin) → `js/settings.js`, and
`bills.js` → `import('./js/audio.js')` (dynamic, inside `initBills()`)

`bills.js` lives at the repo root but imports from `./js/`. Keep it there — `service-worker.js`,
`eslint.config.js` and the dynamic import in `app.js` all reference that path.

## 4. Architecture notes that matter when editing

**Everything is lazy on purpose.** Startup only loads the light data and draws the wheel. The menu
is built during `requestIdleCallback` (2–3 s fallback), audio initializes on the first user gesture,
the full dataset loads on first boost or when the wheel starts slowing, `bills.js` is imported on
the first spin, and `html2canvas` is injected from a CDN only when a share button is clicked. Do not
move work back into the initial path without a reason.

**Canvas rendering is layered.** `js/app.js` pre-renders sectors and labels into two offscreen
canvases (`sectorLayer`, `labelLayer`) and each frame only composites them with a rotation. Call
`buildWheelLayers()` whenever `ENTRIES` or the canvas size changes; never draw per-sector inside
`animate()`. Labels are skipped entirely when a slice is narrower than `LABEL_MIN_ARC_PX`.

**The animation loop is self-parking.** `scheduleAnimationFrame()` / `stopAnimationFrame()` guard a
single rAF handle, and `animate()` reschedules only while `shouldAnimate()` is true. Time is
expressed in "frames of 16.67 ms" (`deltaTime`), so any damping must be applied as
`Math.pow(factor, deltaTime)`, not a bare multiply — the same convention is used in `bills.js`.

**Spin sound is a rate, not an event.** The wheel crosses thousands of sectors per second, so
`updateSectorClick()` derives a click *cadence* from the angular velocity (see the `SPIN_CLICK`
object and its comments). It deliberately does not catch up on missed clicks. `window.__SPIN_CLICK__`
exposes the tuning object for live tweaking from the console.

**Settings propagate through the DOM and events, not imports.** `js/menu.js` writes `data-theme`,
`data-sound-enabled` and `data-infinite-mode` onto `<html>` and dispatches `soundModeChange` /
`infiniteModeChange`. `js/settings.js` reads the attribute first, `localStorage` second. This keeps
`audio.js` and `bills.js` from importing `menu.js`. Preserve that decoupling.

**Theming is CSS-variable only.** Light tokens live in `:root` inside `index.html`, dark ones in
`:root[data-theme="dark"]`. `menu.css` and `bills.css` consume those variables with fallbacks —
never hardcode a colour in the CSS files.

**Local storage keys** (`SETTINGS_KEY` in `js/constants.js`,
`larouedelaservitude_history` in `js/menu.js`) and the two IndexedDB databases
(`LaRoueDeLaServitude` for data, `LaRoueAudio` for decoded sounds) are user-facing state. Changing a
key or bumping a DB version orphans existing users' data.

**`requireElement()` in `app.js` throws on a missing id.** If you rename an id in `index.html`, the
app fails loudly at startup — update both sides.

## 5. Data: `data/entries-light.json` + `data/entries-full.json`

Two files, kept in lockstep. The light file (`[{id, nom}]`) loads first so the wheel can draw; the
full file (`{version, entries: [{id, nom, nom_complet, recette, annee}]}`) loads later and feeds the
result overlay.

Invariants enforced by `npm run check:data` **and** `tests/data.test.mjs` — both must keep passing:

- same number of entries in both files;
- every `id` in one file exists in the other;
- no duplicate `id` within a file;
- `id`, `nom` non-empty strings in light; `id`, `nom`, `nom_complet` non-empty strings in full;
- `recette` and `annee` keys present in every full entry (`null` is allowed).

To edit data: change `data/entries-full.json` first, mirror the entry into
`data/entries-light.json` with a short `nom` (~25 chars — it has to fit in a wheel slice), bump
`version` in the full file, then run `npm run check:data && npm test`.

`scripts/convert-entries.mjs` is legacy: it parses an `ENTRIES` array out of an older `js/entries.js`
that no longer exists, and **running it would overwrite both data files**. Treat it as reference
material, not tooling.

## 6. Netlify functions

CommonJS, Node 20 runtime (`netlify.toml` pins `NODE_VERSION = "20"` for native `fetch`).

| File | Method | Purpose | Env var |
| --- | --- | --- | --- |
| `shareImage.js` | POST | Uploads a base64 image to ImgBB, returns `{imageUrl, sharePageUrl}` | `IMGBB_API_KEY` |
| `sharePage.js` | GET/HEAD | Renders the Open Graph / Twitter Card HTML, then redirects home | — |
| `sendFeedback.js` | POST | Creates a GitHub Discussion from user feedback (GraphQL) | `GITHUB_TOKEN` |
| `_shared/cors.js` | — | CORS allow-list helper (`_`-prefixed ⇒ not deployed as a function) | — |

Hardening already in place — keep it when editing:

- CORS is applied **per function**, not at the CDN. `netlify.toml` intentionally sets no
  `Access-Control-Allow-Origin` header; a wildcard there would override the allow-list in
  `_shared/cors.js`. Unknown origins get the literal string `"null"`.
- `shareImage` caps the base64 payload (8 MB → 413), validates it is really base64 (→ 400),
  aborts the ImgBB upload after 8 s, and only accepts `i.ibb.co` / `ibb.co` over https.
- `sharePage` re-validates the image URL, normalizes/truncates title and description, and only
  redirects to the request's own host.
- `sendFeedback` uses a honeypot field (silent 200), a 10-character minimum, a 3-link maximum, and
  passes user text through **GraphQL variables** — never string-interpolate into the mutation.
- No server-side rate limiting exists; the client throttles feedback to one per minute. Adding real
  rate limiting would need shared state (Netlify Blobs).

The repository/category IDs in `sendFeedback.js` are hardcoded GitHub node IDs. `query.graphql` is
the GraphQL query used to re-discover the discussion category IDs if the repo is recreated.

Shares are **not** committed. `shares/share-*.html` is gitignored; the flow is ImgBB + a dynamic
`sharePage` route, deliberately avoiding commits to the repo on user action. Do not reintroduce a
commit-based share flow.

## 7. Service worker — the rule you will forget

**Bump `CACHE_VERSION` in `service-worker.js` (currently `v18`) whenever you change a precached
asset.** Activation deletes every cache whose name doesn't match, so the bump is what actually ships
your change to returning users.

**Add any new precached file to `urlsToCache`.** Note the current list does not include
`js/constants.js` or `js/settings.js`; they still work offline because the `.js`
stale-while-revalidate branch caches them after first fetch, but they are not guaranteed present
after install. Add new modules to the list explicitly.

Strategies, by path: `/.netlify/functions/*` and cross-origin requests are skipped entirely;
`index.html` is network-first; `data/*.json`, `site.webmanifest`, `.js` and `.css` are
stale-while-revalidate; images/icons/audio are cache-first. The SW does `skipWaiting()` +
`clients.claim()`, so a new version takes over immediately and posts `SW_UPDATED` to open clients.
It also handles `SKIP_WAITING`, `CLEAR_CACHE` and `REFRESH_DATA` messages.

## 8. Tests and linting

`npm test` runs Node's built-in test runner over `tests/*.test.mjs`: the data invariants, plus the
three Netlify handlers exercised directly via `createRequire` (CORS behaviour, status codes,
HTML escaping, redirect normalization). **There are no browser/DOM tests** — front-end changes in
`js/` and `bills.js` must be verified manually in a browser.

When adding a Netlify function or changing a handler's contract, add cases to the matching
`tests/*.test.mjs`. Export the pure helpers you want to test (`shareImage.js` exports `escapeHtml`
and `validateImgBbHttpsUrl` for exactly this reason).

`eslint.config.js` uses flat config with one block per environment — browser ESM for `js/**` and
`bills.js`, service-worker globals for `service-worker.js`, CommonJS + Node for
`netlify/functions/**`, Node ESM for `scripts/**` and `tests/**`. A new file in a new location
probably needs a new block. `node_modules/`, `shares/` and `data/` are ignored.

`scripts/check-imports.mjs` walks every `.js`/`.mjs` plus `index.html` and fails on any relative
import, dynamic import or `<script src>` that doesn't resolve. It is the closest thing to a compiler
this project has — moving or renaming a module will be caught here.

## 9. Conventions

- **French** for comments, UI strings, console messages and commit subjects. Existing commits read
  like `Adoucir la gravité des billets pour un vol réaliste` — imperative, no prefix, no ticket id.
- Two-space indent, LF, final newline, trimmed trailing whitespace (`.editorconfig`). Prettier
  config is `printWidth: 100`, double quotes, no trailing commas — but see §3 before reformatting.
- Section banner comments (`// ===============================`) are the house style at the top of
  each module and between major sections. Follow it in files that already use it.
- `console.log`/`warn`/`error` with a bracketed tag (`[APP]`, `[SW]`, `[AUDIO]`, `[MENU]`, `[BILLS]`)
  are intentional and lint-allowed; keep the tagging.
- Debug hooks exposed on `window` (`__AUDIO_STATUS__`, `__SPIN_CLICK__`, `__MENU_SETTINGS__`) are
  deliberate. Don't add new implicit globals beyond these.

## 10. Checklist before you finish

1. `npm run ci` passes.
2. Bumped `CACHE_VERSION` if a precached asset changed; added new assets to `urlsToCache`.
3. Data edits touched both JSON files and bumped `version`.
4. No repo-wide Prettier reformat in the diff.
5. New/renamed modules resolve under `npm run check:imports` and are covered by an
   `eslint.config.js` block.
6. Front-end changes were exercised in a browser over HTTP, including one offline reload.
