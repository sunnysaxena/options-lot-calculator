/** Mode-state helper. Call from the page controller after legacy mode wiring is removed. */
export function setCalculatorMode(app, buttons, description, mode, copy) {
  const simple = mode === 'simple', pnl = mode === 'pnl', toolkit = mode === 'toolkit';
  app.classList.toggle('simple-mode', simple);
  app.classList.toggle('pnl-mode', pnl);
  app.classList.toggle('toolkit-mode', toolkit);
  buttons.simple?.setAttribute('aria-pressed', String(simple));
  buttons.advanced?.setAttribute('aria-pressed', String(mode === 'advanced'));
  buttons.pnl?.setAttribute('aria-pressed', String(pnl));
  buttons.toolkit?.setAttribute('aria-pressed', String(toolkit));
  if (description) description.textContent = copy[mode] || '';
}
