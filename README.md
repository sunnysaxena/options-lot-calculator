# Options Lot Calculator — Modular v1

Your Options Lot Calculator is a personal options-trading calculation toolkit designed to help you plan position sizes, estimate profit and loss, calculate stop-loss risk, and evaluate trading performance before placing a trade.

The project has evolved from a simple lot calculator into a modular, multi-calculator web application, with standalone applications for different platforms.

## Start the app

**Windows:** double-click `run-local.bat`, then open `http://localhost:8000`.

**Linux/macOS:** run `./run-local.sh`, then open `http://localhost:8000`

Python 3 is required to run the local static server. No build step or paid tools are required for the browser app.

<img width="1919" height="1032" alt="Screenshot 2026-10-29 171358" src="https://github.com/user-attachments/assets/635a8733-7a9a-447b-a786-55d32cc872ef" />

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
