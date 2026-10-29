/** Small DOM helpers for new feature modules. */
export const byId = (id, root = document) => root.getElementById(id);
export const one = (selector, root = document) => root.querySelector(selector);
export const all = (selector, root = document) => [...root.querySelectorAll(selector)];

export function on(element, eventName, handler, options) {
  if (!element) return () => {};
  element.addEventListener(eventName, handler, options);
  return () => element.removeEventListener(eventName, handler, options);
}
