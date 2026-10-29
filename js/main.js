/** ES-module entry for the next migration stage.
 * Currently the stable legacy implementation is started by js/app.js.
 * Migrate a feature by removing its legacy wiring, then import and initialise
 * that feature here. This avoids double event listeners and duplicate output.
 */
import { initAppearance } from './features/appearance.js';

// Safe to enable independently: appearance customization has its own controls.
// It is intentionally not called yet because the legacy app currently owns it.
export const featureModules = { initAppearance };
