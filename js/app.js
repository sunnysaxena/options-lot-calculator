/**
 * Application entry point.
 *
 * Migration strategy: keep the proven implementation running while feature
 * modules are extracted one at a time. Do not load the legacy app and a
 * migrated replacement for the same feature simultaneously.
 */
(function loadApplication() {
  'use strict';

  const script = document.createElement('script');
  script.src = 'js/legacy/app.js';
  script.defer = false;
  script.onload = () => {
    document.documentElement.dataset.appReady = 'true';
    window.dispatchEvent(new CustomEvent('options-calculator:ready'));
  };
  script.onerror = () => {
    const message = document.createElement('p');
    message.className = 'status';
    message.textContent = 'The calculator could not load. Check that js/legacy/app.js exists.';
    document.querySelector('main')?.prepend(message);
  };
  document.head.appendChild(script);
})();
