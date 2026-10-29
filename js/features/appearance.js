import { all, byId } from '../core/dom.js';

const STORAGE_KEY = 'optionsCalculatorAppearance';
export const DEFAULT_THEME = Object.freeze({
  primary: '#1457d9', header: '#102344', background: '#f3f6fb', text: '#172033'
});
export const THEMES = Object.freeze({
  blue: DEFAULT_THEME,
  green: { primary: '#16805d', header: '#12382f', background: '#f1f8f4', text: '#172b25' },
  purple: { primary: '#7047d1', header: '#2d2050', background: '#f6f3fc', text: '#241d35' },
  dark: { primary: '#42d392', header: '#101a24', background: '#0b1118', text: '#e7f0fa' }
});

export function initAppearance() {
  const inputs = {
    primary: byId('colorPrimary'), header: byId('colorHeader'),
    background: byId('colorBackground'), text: byId('colorText')
  };
  if (Object.values(inputs).some(input => !input)) return;

  function apply(colors) {
    const root = document.documentElement;
    const dark = colors.background.toLowerCase() === '#0b1118';
    root.style.setProperty('--site-primary', colors.primary);
    root.style.setProperty('--site-secondary', colors.header);
    root.style.setProperty('--site-background', colors.background);
    root.style.setProperty('--site-on-background', colors.text);
    root.style.setProperty('--text', colors.text);
    root.style.setProperty('--surface', dark ? '#17212d' : '#ffffff');
    root.style.setProperty('--surface-soft', dark ? '#202d3b' : '#f7f9fd');
    root.style.setProperty('--muted', dark ? '#c0ccda' : '#65728a');
    root.style.setProperty('--border', dark ? '#526174' : '#dce3ef');
    root.style.setProperty('--good', dark ? '#72edb5' : '#087f5b');
    root.style.setProperty('--bad', dark ? '#ffaaa3' : '#b42318');
    root.style.setProperty('--site-on-primary', dark ? '#07130f' : '#ffffff');
    root.style.setProperty('--site-on-secondary', dark ? '#f4f8ff' : '#ffffff');
    Object.entries(inputs).forEach(([key, input]) => { input.value = colors[key]; });
  }

  const save = colors => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(colors)); } catch {} };
  Object.entries(inputs).forEach(([key, input]) => input.addEventListener('input', () => {
    const colors = Object.fromEntries(Object.entries(inputs).map(([name, node]) => [name, node.value]));
    apply(colors); save(colors);
  }));
  all('[data-theme]').forEach(button => button.addEventListener('click', () => {
    const colors = THEMES[button.dataset.theme]; if (colors) { apply(colors); save(colors); }
  }));
  byId('resetAppearance')?.addEventListener('click', () => {
    apply(DEFAULT_THEME); try { localStorage.removeItem(STORAGE_KEY); } catch {}
  });
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && Object.keys(DEFAULT_THEME).every(key => /^#[0-9a-f]{6}$/i.test(saved[key] || ''))) apply(saved);
  } catch {}
}
