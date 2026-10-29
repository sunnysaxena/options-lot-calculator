# Options Lot Calculator — Modular v2

This version introduces a recommended feature-oriented folder structure and reusable calculation modules while preserving the current working calculator in `js/legacy/app.js`.

## Start the app

**Windows:** double-click `run-local.bat`, then open `http://localhost:8000`.

**Linux/macOS:** run `./run-local.sh`, then open `http://localhost:8000`.

Python 3 is required to run the local static server. No build step or paid tools are required for the browser app.

## Project layout

- `index.html` — page markup
- `css/styles.css` — styles
- `js/app.js` — compatibility loader
- `js/legacy/app.js` — original working behavior preserved during migration
- `js/core/` — reusable DOM, formatting and preset helpers
- `js/features/` — feature-specific modules and pure calculations
- `js/main.js` — future ES-module entry point
- `tests/` — automated calculation tests
- `docs/ARCHITECTURE.md` — migration and extension guide

## Run tests

Install Node.js, then run:

```bash
npm test
```

## Important migration note

The feature files are separated and usable, but the existing UI is still bootstrapped by the legacy implementation so existing behavior does not break. Migrate each feature by removing its legacy handlers before enabling its new initializer. This avoids duplicate event handlers and incorrect double updates.

No live market data, broker connection, or automatic order placement is added.
