import { all, byId } from '../core/dom.js';

/** Generic dialog wiring. Feature-specific copy can be injected as a map. */
export function initContextualHelp(contentByKey = {}) {
  const backdrop = byId('helpBackdrop'), title = byId('helpTitle'), body = byId('helpBody'), close = byId('helpClose');
  if (!backdrop || !title || !body || !close) return;
  let lastTrigger = null;
  const closeDialog = () => { backdrop.classList.remove('open'); lastTrigger?.focus(); };
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-help], [data-context-help]');
    if (!trigger) return;
    const content = contentByKey[trigger.dataset.help || trigger.dataset.contextHelp];
    if (!content) return;
    lastTrigger = trigger; title.textContent = content.title; body.textContent = content.body;
    backdrop.classList.add('open'); close.focus();
  });
  close.addEventListener('click', closeDialog);
  backdrop.addEventListener('click', event => { if (event.target === backdrop) closeDialog(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && backdrop.classList.contains('open')) closeDialog(); });
}
