# CLAUDE.md

Guide for AI assistants working on **La roue de la servitude** — a French-language, installable
PWA that presents the 371 French taxes and mandatory levies as a spinnable wheel.

> The codebase, comments, UI strings and commit messages are **in French**. Keep writing them in
> French. This file is in English because it is tooling documentation, not product content.

## 0. Branching: `main` only

**The owner works directly on `main` and wants every change committed and pushed there.** Do not
create a feature branch, and do not open a pull request, unless explicitly asked in that session —
even when the session's default instructions name a `claude/…` branch to develop on. This
preference overrides that default: check out `main`, commit on `main`, push `main`.

The practical consequence: `main` is what both deploy targets serve, so `npm run ci` has to pass
_before_ the push, not after a review round. Same for the §10 checklist — it is the only gate.

## 1. What this project is (and is not)

- **Static site, no build step.** `index.html` is served as-is and loads `./js/app.js` as a native
  ES module. There is no bundler, no transpiler, no framework, no TypeScript. What you write is
  what the browser runs.
- **Two pages.** `index.html` is the wheel (the game); `donnees.html` is the « Données & analyse »
  page of the advanced mode (§4), same data, same service worker, no game. Anything that "the app"
  does now has to hold for both.
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
npm ci                  # install tooling (first time)

npm run check           # check:imports + check:data + check:precache + check:stamp — the fast gate
npm run check:imports   # scripts/check-imports.mjs: every relative import/script src resolves
npm run check:data      # scripts/validate-data.mjs: light/full JSON invariants
npm run check:precache  # scripts/check-precache.mjs: offline coverage (see §7)
npm run check:stamp     # scripts/stamp-assets.mjs --check: the repo matches its stamps (see §7)
npm run stamp           # scripts/stamp-assets.mjs: re-stamp after touching a precached asset
npm run lint            # eslint .
npm test                # node --test (runs tests/*.test.mjs)

npm run ci              # check + lint + test — mirrors .github/workflows/ci.yml exactly
```

Run `npm run ci` before committing. CI (`.github/workflows/ci.yml`, Node 20) runs on every push to
every branch and on every PR, and runs exactly those three steps.

### Prettier: the repo is clean, keep it that way

`npm run format` (`prettier --check .`) **passes on every file**. It stayed red on ~20 files for a
long time, which is why it is still not part of `npm run ci` — the normalization was done in one
dedicated commit rather than smuggled into unrelated diffs. Run `npm run format:write` on the files
you touch before committing, and check `npm run format` if in doubt. Do not let a new file land
unformatted: that is how the old backlog started.

## 3. Layout

```
index.html              Wheel page: PWA/social meta, all app-shell CSS inline, DOM, loads js/app.js
donnees.html            « Données & analyse » page (advanced mode), loads js/data-explorer.js
js/app.js               Wheel rendering, physics, spin cadence, result card, sharing, SW registration
js/entries.js           Two-tier data loading (light → full) + IndexedDB cache
js/audio.js             WebAudio, offline-first sound decoding + IndexedDB cache
js/menu.js              Bottom tab bar, panels, history, settings; builds its own DOM at runtime
js/settings.js          Reads the sound setting (data-attribute first, localStorage fallback)
js/sw-update.js         SW registration, update checks, served version (see §7)
js/focus-trap.js        Focus stack shared by the modals (app.js) and the menu surfaces (menu.js)
js/constants.js         SETTINGS_KEY and BASE_PATH — shared by front-end modules
js/data-explorer.js     Table, filters, multi-key sort, export, URL state for donnees.html
js/stats.js             Pure descriptive statistics (no DOM) — the only unit-tested front-end module
js/charts.js            Hand-written SVG charts, themed through CSS variables, no dependency
bills.js                Banknote particle effect (repo root, lazy-imported by app.js)
buttons.css             Shared button/switch system — the only place buttons are styled (both pages)
bills.css / menu.css    Styles for those two features (all other index.html CSS is inline)
donnees.css             Styles + theme tokens for donnees.html (a separate document)
service-worker.js       PWA atomic precache; network-first documents, cache-first stamps (§7)
data/entries-*.json     The data (see §5)
netlify/functions/      Serverless endpoints (see §6)
scripts/                Stamping (stamp-assets.mjs) + validation + one-off data conversion
tests/                  node:test suites (Netlify handlers, data, precache, stats, theme tokens)
shares/                 Runtime artifacts only; share-*.html is gitignored
```

### Module graph

`index.html` → `js/app.js` → `js/entries.js`, `js/audio.js`, `js/menu.js`, `js/sw-update.js`
`donnees.html` → `js/data-explorer.js` → `js/entries.js`, `js/menu.js`, `js/sw-update.js`,
`js/stats.js`, `js/charts.js`
`js/audio.js` → `js/settings.js` → `js/constants.js` ← `js/entries.js`; `js/menu.js` → `js/sw-update.js`
`js/app.js`, `js/menu.js` → `js/focus-trap.js` (piled surfaces: share sheet, feedback form, panels)
`js/app.js` → `import('../bills.js')` (dynamic, on first spin) → `js/settings.js`, and
`bills.js` → `import('./js/audio.js')` (dynamic, inside `initBills()`)

Two documents, one shell. `donnees.html` reuses `js/menu.js` only for the settings API (never
`initMenu()`), which keeps `localStorage` writes in a single place. `BASE_PATH` is derived from
`import.meta.url` in `js/constants.js` precisely because there is now more than one page — deriving
it from `location.pathname` would resolve `/donnees.html/data/…`.

`bills.js` lives at the repo root but imports from `./js/`. Keep it there — `service-worker.js`,
`eslint.config.js` and the dynamic import in `app.js` all reference that path.

## 4. Architecture notes that matter when editing

**Everything is lazy on purpose.** Startup only loads the light data and draws the wheel. The menu
is built during `requestIdleCallback` (2–3 s fallback), audio initializes on the first user gesture,
the full dataset loads on first boost or when the wheel starts slowing, and `bills.js` is imported
on the first spin. Do not move work back into the initial path without a reason.

**The app has no third-party runtime code, and sharing must not reintroduce any.** `captureWheelArea()`
in `js/app.js` redraws the wheel area by hand — background, the wheel `<canvas>`, the pointer
triangle — onto a fresh canvas. It replaced html2canvas, pulled from a CDN on the first share: the
library never loaded offline, so sharing failed in exactly the situation this PWA advertises. Any
new capture need belongs in that function, not in a script tag.

**Canvas rendering is layered.** `js/app.js` pre-renders sectors and labels into two offscreen
canvases (`sectorLayer`, `labelLayer`) and each frame only composites them with a rotation. Call
`buildWheelLayers()` whenever `ENTRIES` or the canvas size changes; never draw per-sector inside
`animate()`. Labels are skipped entirely when a slice is narrower than `LABEL_MIN_ARC_PX`.

**The animation loop is self-parking.** `scheduleAnimationFrame()` / `stopAnimationFrame()` guard a
single rAF handle, and `animate()` reschedules only while `shouldAnimate()` is true. Time is
expressed in "frames of 16.67 ms" (`deltaTime`), so any damping must be applied as
`Math.pow(factor, deltaTime)`, not a bare multiply — the same convention is used in `bills.js`.

**Spin sound is a rate, not an event.** The wheel crosses thousands of sectors per second, so
`updateSectorClick()` derives a click _cadence_ from the angular velocity (see the `SPIN_CLICK`
object and its comments). It deliberately does not catch up on missed clicks. `window.__SPIN_CLICK__`
exposes the tuning object for live tweaking from the console.

**Settings propagate through the DOM and events, not imports.** `js/menu.js` writes `data-theme`,
`data-sound-enabled` and `data-infinite-mode` onto `<html>` and dispatches `soundModeChange` /
`infiniteModeChange`. `js/settings.js` reads the attribute first, `localStorage` second. This keeps
`audio.js` and `bills.js` from importing `menu.js`. Preserve that decoupling.

**Theming is CSS-variable only.** Light tokens live in `:root` inside `index.html`, dark ones in
`:root[data-theme="dark"]`. `menu.css` and `bills.css` consume those variables with fallbacks —
never hardcode a colour in the CSS files.

**Buttons live in exactly one file.** `buttons.css` is loaded by _both_ pages and is the only place
a button is styled. Never restyle a button in `index.html`'s inline CSS, `menu.css` or `donnees.css`
— that is precisely what produced two incompatible `.btn` / `.btn-secondary` definitions (one per
page) before it existed. Compose the existing classes instead: a base `.btn`, a variant
(`.btn-accent` for the page's main action, `.btn-primary`, `.btn-secondary`, `.btn-quiet`,
`.btn-inverse` for anything sitting on an already-inverted surface), then modifiers (`.btn-sm` / `.btn-lg`,
`.btn-pill`, `.btn-icon`, `.btn-block`, `.btn-tip` for an icon-only button whose `aria-label`
doubles as its tooltip). Layout-only rules (position, margin) stay with the feature; `.btn-row`
covers the common "row of buttons" case. Its `--btn-*` tokens are self-contained so the file works
in both documents.

**Buttons are signalled by a fill, never by a 1px outline.** `.btn-secondary` is a flat tint with no
border, and it is the default for anything that has to read as a button. An outlined variant existed
and was removed: it inherited `--ring`, the card-border token, which lands at 1.2:1 against the
site's light surfaces — well under the 3:1 that WCAG 1.4.11 asks of an interactive component's
boundary — so the buttons simply were not visible. `.btn-quiet` has no chrome at all _at rest_ and
only reveals itself on hover: reserve it for incidental controls inside an already-delimited frame,
and never for a control that must look like a button (there is no hover on a touchscreen).

**Icon buttons are rounded squares; the circle is opt-in.** `.btn-icon` keeps `.btn`'s radius,
because the rounded square is the shape of the whole interface (tabs, settings rows, buttons); add
`.btn-pill` where a circle is actually wanted — the share dots on the result card. Two glyphs are
drawn in CSS rather than typed as characters, `.btn-close` (the cross) and `.btn-back` (the
chevron): `✕` and `←` render at wildly different weights across system fonts, and both were
duplicated in several files. Those buttons carry no text — their name comes from `aria-label`.

**The result is a card under the wheel, not a modal.** `showResult()` in `js/app.js` fills
`#resultCard` (the title and the two facts come from `formatEntryForDisplay()` in `js/entries.js`,
the random kicker from `app.js` itself) and sets `data-result="open"` on `<html>`, which tightens
the column's spacing. The card takes no focus and no focus trap: it covers nothing, so `Space` and
the spin button keep working while it is read, and the next draw replaces its contents. The entry
is kept in `currentEntry` — sharing, the clipboard and the feedback form go through
`formatEntryAsText()`, never through the card's `innerText`.

**The wheel has one size, decided in CSS, and it never changes.** `--wheel-cap` is
`100svh` minus `--card-room` (the height reserved for the result card) minus `--column-room`
(masthead, margins, tab bar): the card's place is held from the very first paint, so the wheel is
exactly as big before a draw as after one. `--card-room` is 264 px, measured over all 371 names at
phone width — 224 px covers half of them, 244 nine tenths, 264 nineteen twentieths. The last five
percent make the card's text scroll instead (silently, see below); covering the longest name would
have cost every draw 40 px of wheel. The only thing that moves the wheel is the install banner,
which adds its own `--install-room` to `--column-room` — otherwise the card would lose a third of
its content while the banner is up.

An earlier version measured the overflow in JS and shrank the wheel by exactly that much
(`--wheel-fit`). It was optimal per draw and unpleasant to use: the wheel changed size on almost
every spin. Don't bring it back.

**Inside the card, only the text scrolls.** `.result__head` (kicker + close button) and
`.result__actions` sit outside `.result__scroll`, which alone carries `overflow-y: auto` and
`touch-action: pan-y` (`body` kills touch scrolling). A card that scrolled as a whole was sliced by
the tab bar, and a cut edge reads as a bug rather than as something to scroll. The head also exists
to keep the close button out of the title's way: reserving its width on every line cost nearly a
line of text per long name.

**The wheel page is a stack of three things and nothing else**: the masthead, the wheel, and the
result card. « Tourner la roue » is not a fourth — it is absolutely positioned inside `.wheel-area`
and overlaps the bottom of the disc, so the command sits on its own effect and the column reserves
no row for it (`--spin-overhang` is the few pixels it hangs below, given back as the area's bottom
margin). It follows the wheel when the card makes it give ground. The white
`.board` that framed the wheel and the « N éléments restants » counter are both gone: the frame cost
height without saying anything, and the count now lives only in the canvas's `aria-label`
(`updateWheelLabel()`), where a screen reader still gets it. The card is therefore the only surface
on the page, hence the only thing the eye looks for.

**Heights come from `svh`, never `vh`.** `.wrap` is `100svh`, the wheel's cap and the card's
`max-height` too. On Chrome Android `100vh` is the viewport with the address bar _retracted_ — some
70 px taller than what is actually on screen — and since the body never scrolls here, that bar never
retracts. With `vh`, the column sized itself inside a window taller than the phone's and the bottom
of the result card sat under the tab bar. Each such declaration keeps a `vh` line before it as the
fallback for browsers without `svh`.

**Nothing above the wheel ever moves.** The column's top spacing is the same before and after a
draw — the masthead and the button are at their final position on first paint. Only the wheel
yields height to the card. Do not reintroduce a `data-result` rule that shifts the top of the page.

**Two actions, and only two** (`Partager`, `Signaler`): they must hold on one row down to a 320 px
screen, or the card folds on a short phone. The nine share pills moved into `#shareModal`, a
surface that _is_ allowed to cover the page, and the feedback form carries the info/error choice
itself — it used to be two card buttons opening a form whose title said "complément" either way.

The modal this card replaced covered the wheel it commented on and had to be dismissed before
spinning again. One consequence to keep in mind: the install banner — which floats over the same
bottom strip — waits for the card to be closed.

**Navigation is a bottom tab bar, not a hamburger.** `js/menu.js` builds a fixed bar at the bottom
of `index.html` from two tables: `MENU_TABS` (the four tabs, in display order) and `MENU_PANELS`
(the surfaces they open — one entry produces the panel, its header, its close button and the render
call). A tab's nature is read off the keys it carries: neither `panel` nor `href` is Accueil, which
just closes what is open; `panel` opens the matching entry of `MENU_PANELS`; `href` is an ordinary
link out of the page (Données). Keep it at four — beyond that the labels no longer fit on a phone,
and the labels stay written out, an icon alone is guessed rather than read.

The active tab is marked by `aria-current="page"` and **nothing else**: the CSS keys off that same
attribute, so what is shown can't drift from what is announced. `updateTabState()` is the only
writer.

**The panels are bottom sheets, and they obey the same three rules the drawer did.** (1) They slide
in **from the bottom** via `transform`, never `top`/`bottom` — a surface arrives from the control
that summons it (the drawer's panels came from the left for the same reason), and animating layout
properties janked. (2) A closed surface is `visibility: hidden`, which is what keeps its controls
out of the tab order; twelve menu controls used to stay reachable by `Tab` with the menu shut. The
`visibility` transition must stay at duration `0s` (delayed on close, immediate on open) — a real
transition on it leaves the surface still hidden when the focus trap fires, and `focus()` is then
silently ignored. (3) Opening and closing go through `openSurface()` / `closeSurface()`, which push
and pop `js/focus-trap.js`; `Escape` closes only the topmost surface. Only one panel is open at a
time — `openPanel()` closes the others first, since two sheets risen from the same edge would
overlap with nothing to say which is which.

**The bar's height is a token declared in `index.html`, not in `menu.css`.** `--tabbar-h` (and
`--tabbar-room`, which adds the iOS home-indicator inset) sits in the blocking inline CSS because
`menu.css` is loaded with `media="print"` and the bar itself is built during `requestIdleCallback`:
the page has to reserve the space at first paint, or « Tourner la roue » jumps when the bar lands.
`.wrap` and `.install-banner` both consume `--tabbar-room`. The wheel `<canvas>` is bounded by
height as well as width (`min(clamp(250px, 80vw, 540px), 52svh)`) for the same reason — the body
does not scroll, so on a wide-but-short window the 540px wheel pushed the button and the counter
under the bar. `svh`, not `dvh`: the dynamic viewport changes when a phone's address bar retracts,
which would resize the wheel mid-spin.

**Settings switches are `<button role="switch">`**, built from the `SETTING_SWITCHES` table in
`js/menu.js` — the markup, the click handler and the redraw all derive from that one array, so
adding a setting means adding an entry. State lives only in `aria-checked` (read by the CSS _and_
by screen readers); do not mirror it into a class. They used to be `<div>`s, unreachable by
keyboard.

**Anything global that swallows a key must let focused controls through.** The `Space` handler in
`js/app.js` boosts the wheel, so it returns early when the event target is a button, link or field
— otherwise its `preventDefault()` cancels the browser's native activation and every control on the
page stops responding to `Space`.

**Data freshness runs on `version`, not on time.** `js/entries.js` serves the IndexedDB copy
immediately (fast first paint) and revalidates against the network in the background. When the
fetched `version` differs from the cached one it swaps the data, rewrites the cache and dispatches
`entriesUpdated` on `window`; `js/app.js` listens and rebuilds the wheel — deferred while the wheel
is still spinning, and skipped outright once a spin has completed in normal mode (the drawn entries
have been removed from `ENTRIES`, so rebuilding would undo the game). There is **no TTL**: bumping
`version` in the two JSON files is the only thing that propagates a data fix.

The revalidation fetch appends `?fresh=<timestamp>`. That is load-bearing: `index.html` preloads
`data/entries-light.json`, and a fetch to that exact URL silently reuses the preloaded response
without touching the network — `{cache: 'reload'}` alone does not defeat it. The service worker
skips any request carrying `fresh` so those URLs never enter the cache.

**The data page is one of the four tabs, and nothing gates it.** It is the only tab rendered as a
real `<a>` (middle-click and "open in a new tab" have to keep working) — hence the
`.tabbar-item[data-panel]` selector when wiring panel clicks, which skips it. There is no setting
behind it: an earlier version hid it behind an `advancedMode` toggle in Réglages, and that was
removed because a feature nobody can find is a feature nobody uses. Keep the tab visible; the
separation between game and data is the _page_, not a switch. `donnees.html` has no tab bar of its
own (it never calls `initMenu()`) — its own « Retour à la roue » link is the way back.

**One colour for one series.** Every chart on the data page plots a single series, so they all take
`--chart-1` and the section reads as one system; `colorIndex` stays at its default. Each chart used
to pick a different slot, which put a blue histogram next to a green curve, an orange histogram and
a fuchsia ranking. The six `--chart-*` tokens are a harmonised categorical ramp (equal lightness,
hues in wheel order, the site's red first) and exist for the day a chart carries several series —
not to give each chart its own colour. `.charts-grid` and `.stats-grid` use fixed column counts
rather than `auto-fit`: the auto layouts landed on 6+2 stat cards and a lone fourth chart.

**The table's widest columns are dropped below 760px**, not shrunk: `col-nom_complet` (which largely
repeats `col-nom`) and `col-id` pushed the recette column off-screen on a phone, so the one figure
worth coming for needed a horizontal scroll. Both stay in the detail card and in the exports.
`col-id` is also truncated on one line at every width — that slug reaches fifty characters and used
to set the height of its whole row.

**The data page computes nothing on its own.** Every figure it displays comes from `js/stats.js`,
which has no DOM access and is covered by `tests/stats.test.mjs` — that is the whole reason it is a
separate module. Watch out for missing values: 222 of 371 entries have no `recette`, and
`Number(null)` is `0`, so any new aggregate must go through `finiteNumbers()` rather than a bare
`Number()` cast. Sorting keeps unknown values last in both directions (`compareValues` applies the
direction only between present values).

**Local storage keys** (`SETTINGS_KEY` in `js/constants.js`,
`larouedelaservitude_history` in `js/menu.js`) and the two IndexedDB databases
(`LaRoueDeLaServitude` for data, `LaRoueAudio` for decoded sounds) are user-facing state. Changing a
key or bumping a DB version orphans existing users' data.

**`requireElement()` in `app.js` throws on a missing id.** If you rename an id in `index.html`, the
app fails loudly at startup — update both sides.

**Accessibility has load-bearing pieces — don't strip them.** The wheel is a `<canvas>`, so it
carries `role="img"` plus an `aria-label` that `updateCountInfo()` rewrites on every change; without
it a screen reader sees nothing there — and that label is also the only place the number of
remaining entries is written. The result (`#resultText`) and the feedback status are
`role="status" aria-live="polite"` regions — that is the only way a spin
result gets announced, since the result card never takes focus. Every surface that _covers_ the
page — the share sheet, the feedback form and the menu panels — goes through `js/focus-trap.js`: it moves focus in,
traps `Tab` inside, and hands focus back on close. `prefers-reduced-motion`
is honoured for real — the wheel damps
much faster (`REDUCED_MOTION_DAMPING`) and `bills.js` is never invoked — on top of its older use as
a "constrained device" hint in `getCanvasScale()`. The global `@media (prefers-reduced-motion)`
block and the `:focus-visible` ring live in `index.html`'s inline CSS and cover `menu.css` and
`bills.css` too, since it is all one document.

## 5. Data: `data/entries-light.json` + `data/entries-full.json`

Two files, kept in lockstep, **both** shaped `{version, entries: [...]}`. The light file
(`entries: [{id, nom}]`) loads first so the wheel can draw; the full file
(`entries: [{id, nom, nom_complet, recette, recette_meur, annee}]`) loads later and feeds the
result card. The two `version` strings must match — that value is what invalidates the
IndexedDB cache (see §4), so **bumping it is what actually ships a data fix**.

Two fields are **derived** and must not be hand-edited:

- `recette_meur` (number | null) — the numeric value parsed out of the `recette` string, in
  millions of euros. `recette` stays the editorial source; `recette_meur` is what the UI formats
  via `formatRecette()` in `js/entries.js` (handles the singular — `1 million`, not
  `1 millions` — and switches to billions past 1000).
- `nom` in **both** files — the short wheel label, derived from `nom_complet`.

Regenerate both with:

```bash
node scripts/rebuild-derived-data.mjs           # writes both files
node scripts/rebuild-derived-data.mjs --check   # reports without writing
```

It is idempotent (re-running changes nothing) and never adds or removes an entry. It abbreviates
common tax vocabulary, strips linking words, cuts on word boundaries, and disambiguates collisions
by pulling in the rarest words of the full name — `Taxe spéciale d'équipement…` ×12 became
`TSE EPF de Normandie`, `TSE agence Guadeloupe`, and so on.

Invariants enforced by `npm run check:data` **and** `tests/data.test.mjs` — both must keep passing:

- same number of entries in both files, and the same `version` string;
- every `id` in one file exists in the other;
- no duplicate `id` within a file;
- `id`, `nom` non-empty strings in light; `id`, `nom`, `nom_complet` non-empty strings in full;
- the same `nom` in both files for a given `id`;
- no duplicate `nom` in the light file, and none longer than 30 characters;
- `recette`, `recette_meur` and `annee` keys present in every full entry (`null` is allowed);
- `recette` and `recette_meur` are both null or both set.

To edit data: change `nom_complet` / `recette` / `annee` in `data/entries-full.json`, add the entry
to `data/entries-light.json` with any placeholder `nom`, bump `version` in **both** files, then run
`node scripts/rebuild-derived-data.mjs && npm run check:data && npm test`.

`scripts/convert-entries.mjs` is legacy: it parses an `ENTRIES` array out of an older `js/entries.js`
that no longer exists, and **running it would overwrite both data files**. Treat it as reference
material, not tooling. (`rebuild-derived-data.mjs` also writes both files, but derives everything
from the files themselves, so it is safe to re-run.)

### Known data gaps

Not bugs, but worth knowing before trusting the numbers: 222 of 371 entries have no `recette` and
200 have no `annee`; the year the `recette` figures refer to is not recorded anywhere; and a handful
of entries share an identical `nom_complet` (`Cotisation obligatoire`, `CSG`,
`Taxe d'apprentissage`…), which is why a few labels carry a numeric suffix.

## 6. Netlify functions

CommonJS, Node 20 runtime (`netlify.toml` pins `NODE_VERSION = "20"` for native `fetch`).

| File              | Method   | Purpose                                                             | Env var         |
| ----------------- | -------- | ------------------------------------------------------------------- | --------------- |
| `shareImage.js`   | POST     | Uploads a base64 image to ImgBB, returns `{imageUrl, sharePageUrl}` | `IMGBB_API_KEY` |
| `sharePage.js`    | GET/HEAD | Renders the Open Graph / Twitter Card HTML, then redirects home     | —               |
| `sendFeedback.js` | POST     | Creates a GitHub Discussion from user feedback (GraphQL)            | `GITHUB_TOKEN`  |
| `_shared/cors.js` | —        | CORS allow-list helper (`_`-prefixed ⇒ not deployed as a function)  | —               |

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

## 7. Service worker — freshness comes from the URLs

Three guarantees, and everything in `service-worker.js` + `scripts/stamp-assets.mjs` exists to hold
them: **(1)** one load with zero interaction is enough to work fully offline, **(2)** reloading while
online always lands on the latest version — in that very load, with **no automatic reload ever**, and
**(3)** a page never mixes files from two generations.

**(3) is not solved in the service worker. It is solved in the URLs.** Code and styles are stamped
with a content hash (`./js/app.js?v=beac5b9e`), so a stamped URL names an _immutable_ content. The
HTML of generation N only ever references N URLs, so a page is coherent by construction — no matter
whether each file came from the network or from a cache. That is what makes it safe to serve
documents network-first (always fresh) _and_ assets cache-first (instant, offline) at the same time.

**Three fetch rules**, and they follow from that:

1. **Documents → network-first**, falling back to the cache. Reloading online gives the newest HTML,
   hence the newest set of stamped URLs. Offline, the cache serves the last complete generation's
   HTML, which references only that generation's URLs — all present.
2. **Stamped assets (`?v=`) → cache-first, across _all_ generations.** `caches.match` without a cache
   name searches every generation; since the URL fixes the content, serving from an older cache is
   exact — and avoids re-downloading what a new generation did not change.
3. **Everything else → network-first** (data, sounds, images, icons, manifest). Not stamped, but
   mismatched they cannot break the site — that is precisely the criterion for not stamping. Data
   additionally has its own freshness (the `version` field + revalidation in `js/entries.js`).

Skipped entirely: `/.netlify/functions/*`, cross-origin, and any URL carrying `fresh`.

**No `skipWaiting()`, and nothing ever reloads the page.** A tab that stays open keeps being served
by its own service worker and its own cache, including for what it loads late (the full dataset, the
sounds). The new service worker precaches its generation as soon as it installs — so the offline
snapshot is ready well before it takes over — and only activates, purging old caches, once no page
from the previous generation is open. The visitor reloads when they want to.

This replaced a handshake (`SKIP_WAITING` → `controllerchange` → silent `location.reload()`) whose
premise was that the page had to be _told_ when to switch. Two things were wrong with it. It reloaded
the page under the visitor, which is what this design set out to stop; and every reason to refuse a
reload (wheel spinning, panel open, game started) was a reason the visitor could keep an old version
indefinitely — the bug behind "I have to clear the cache".

**Run `npm run stamp` whenever you change any precached asset**, and commit what it rewrites. It
hashes each JS/CSS file, rewrites the references to it (in import specifiers, `src=`/`href=`
attributes and CSS `url()` — never in prose, the repo quotes its own filenames constantly), and
regenerates the `VERSION` + `ASSETS` block in `service-worker.js`. It is idempotent, and
`npm run check:stamp` (part of `npm run check`, so of CI) fails if the repo has drifted from what it
would produce. **There is no version number to bump by hand any more** — `CACHE_VERSION` and
`APP_VERSION` are gone, and the generation is a hash of the published content.

Because it walks the graph from the two documents, **a new module or stylesheet needs no
registration anywhere**: it is discovered, stamped and precached automatically. What still needs a
hand is a new _unstamped_ asset (a sound, an image, an icon) — add it to `UNSTAMPED` in
`scripts/stamp-assets.mjs`, or it will not be precached and the first offline launch will miss it.
`npm run check:precache` catches exactly that: it fails on any local resource referenced by the
pages, the manifest, the modules or the stylesheets that is absent from `ASSETS`.

Hashing order matters and is handled: a module that imports others has its own references rewritten
**before** it is hashed, otherwise the hash would not describe what is actually served. The stamper
topologically sorts the module graph and fails loudly on a cycle.

**One cache entry per page.** `PAGE_KEYS_BY_PATH` maps every URL form of a page (`/`, `/index`,
`/index.html`, `/donnees`, `/donnees.html`) onto a single cache key, so the same page can never exist
twice depending on the URL taken. Query strings (share parameters, the data page's filters) map onto
the same key.

**Install is atomic.** Each URL is fetched with `cache: 'reload'`, retried twice, and one failure
aborts the whole install and deletes the half-filled cache. A typo'd path costs you the update, not
offline support: the previous generation keeps serving, intact, and the browser retries later.

**The version shown in Réglages comes from the service worker**, asked over the `GET_VERSION` message
(`getServedVersion()` in `js/sw-update.js`). It cannot be a constant in a module: the generation is a
hash of the published content, so writing it into a stamped module would change that module's hash,
hence the generation — a snake eating its tail.

`js/sw-update.js` is now only registration + update checks (on load, on tab focus, on `online`) with
`updateViaCache: 'none'` so the SW script is never read from the HTTP cache. Those checks are what
make the _next_ reload instant: the next generation precaches itself in the background while the
visitor reads the current one. They never change what the open page is running.

Verify a change in a browser over HTTP: load once without touching anything, kill the server, reload
(the app must be complete), then publish a new generation (`npm run stamp`) and confirm that a single
manual reload lands on it — and that nothing reloads on its own before that.

## 8. Tests and linting

`npm test` runs Node's built-in test runner over `tests/*.test.mjs`: the data invariants, the
precache + stamping invariants (`tests/precache.test.mjs`, which runs both §7 checkers), the
statistics engine (`tests/stats.test.mjs` — pure functions plus a coherence pass over the real
dataset), the theme-token invariant (`tests/theme-tokens.test.mjs`: a `:root[…]` rule may only
_redefine_ a token, never introduce one — a rule accidentally inserted mid-block once split `:root`
in two and left the background pattern, the serif and the red rule conditional on the install
banner, in CSS that stayed perfectly valid), plus the three Netlify handlers exercised directly via
`createRequire` (CORS behaviour,
status codes, HTML escaping, redirect normalization). **There are no browser/DOM tests** —
front-end changes in `js/` and `bills.js` must be verified manually in a browser. `js/stats.js` is
the exception and should stay that way: keep new calculations there, DOM-free and tested.

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
2. Changed a precached asset? Ran `npm run stamp` and committed what it rewrote. A new _unstamped_
   asset (sound, image, icon) also needs its line in `UNSTAMPED` (`scripts/stamp-assets.mjs`).
   There is no version number to bump by hand — see §7.
3. Data edits touched both JSON files and bumped `version`.
4. No repo-wide Prettier reformat in the diff.
5. New/renamed modules resolve under `npm run check:imports` and are covered by an
   `eslint.config.js` block.
6. Front-end changes were exercised in a browser over HTTP, including one offline reload from a
   cold start and one version bump applied to an already-open tab (§7) — on **both** pages.
