const STORAGE_KEY = 'optionsCalculatorAppearance';

export const TRADING_GREEN_THEME = Object.freeze({
  primary: '#55d6a3',
  header: '#0b1220',
  background: '#080e19',
  text: '#e8eef7'
});

export function initAppearance() {
  const button = document.getElementById('tradingGreenTheme');
  const root = document.documentElement;

  function applyTradingGreen() {
    const colors = TRADING_GREEN_THEME;
    root.style.setProperty('--site-primary', colors.primary);
    root.style.setProperty('--site-secondary', colors.header);
    root.style.setProperty('--site-background', colors.background);
    root.style.setProperty('--site-on-background', colors.text);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--surface', '#111c2c');
    root.style.setProperty('--surface-soft', '#172438');
    root.style.setProperty('--muted', '#91a1b7');
    root.style.setProperty('--border', '#26364b');
    root.style.setProperty('--good', '#5ce0a8');
    root.style.setProperty('--bad', '#ff7f88');
    root.style.setProperty('--site-on-primary', '#071a16');
    root.style.setProperty('--site-on-secondary', '#f4f7fb');
    button?.setAttribute('aria-pressed', 'true');
  }

  try { localStorage.removeItem(STORAGE_KEY); } catch {}
  applyTradingGreen();
  button?.addEventListener('click', applyTradingGreen);
}
