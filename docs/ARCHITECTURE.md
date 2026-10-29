# Recommended modular architecture

```text
options-lot-calculator/
├── index.html
├── css/styles.css
├── js/
│   ├── app.js                    # Compatibility loader for the stable app
│   ├── main.js                   # ES-module migration entry
│   ├── legacy/app.js             # Original working behavior, preserved
│   ├── core/
│   │   ├── dom.js                # DOM lookup and event helpers
│   │   ├── format.js             # INR/number formatting and numeric input
│   │   └── presets.js            # Editable index lot-size presets
│   └── features/
│       ├── appearance.js
│       ├── mode-switcher.js
│       ├── simple-calculator.js
│       ├── advanced-calculator.js
│       ├── trade-pnl.js
│       ├── trading-toolkit.js
│       ├── contextual-help.js
│       └── trade-journal.js
├── tests/calculations.test.mjs
├── docs/ARCHITECTURE.md
├── run-local.bat
└── run-local.sh
```

## What works now

- The existing application still runs through `js/app.js` -> `js/legacy/app.js`; this avoids breaking features while extracting them.
- New feature modules contain reusable functions and independent logic. The simple calculator, advanced sizing, P&L, toolkit calculations, appearance module and journal model are separated into files.
- Pure calculations have Node.js tests (`npm test`). Node.js is needed for tests; the browser app itself still needs only a browser and Python for the local server.

## Plug-in rule

A feature must have one owner. Do not initialise a new feature module until its corresponding event handlers and DOM updates have been removed from `legacy/app.js`; otherwise listeners and calculations will run twice. The next safe migration is to move appearance handling first, then simple calculator, then P&L, advanced sizing, toolkit, contextual help, and journal.

## Add a feature

1. Create `js/features/my-feature.js` and export `initMyFeature()`.
2. Keep calculation functions pure (inputs in, result object out) where possible.
3. Add a unit test under `tests/` for the calculation.
4. Remove the same feature's handlers from `js/legacy/app.js`.
5. Import and initialise the new module from `js/main.js` and switch `index.html` to the module entry only when the migration is complete.

## Run

- Windows: double-click `run-local.bat`, then visit `http://localhost:8000`.
- Linux/macOS: `./run-local.sh`, then visit `http://localhost:8000`.
- Tests: install Node.js, run `npm test` in the project directory.

## Scope and safety

This is a local calculator, not an exchange feed or broker integration. Preset lot sizes and transaction costs are editable estimates. Verify contract specifications and actual broker charges before trading.
