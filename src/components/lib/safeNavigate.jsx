/**
 * safeNavigate.js - פונקציית עזר למניעת ניווטים כפולים ומיותרים
 * שומרת את הניווט האחרון ומונעת ניווט זהה תוך 500ms
 */
let lastNav = { path: '', ts: 0 };

/**
 * מנווט בבטחה לדף חדש, מונע לופים
 * @param {import('react-router-dom').NavigateFunction} nav - פונקציית הניווט של React Router
 * @param {string} path - הנתיב לניווט
 * @param {object} opts - אפשרויות ניווט (כמו state, replace)
 */
export function safeNavigate(nav, path, opts) {
  const now = Date.now();
  if (path === lastNav.path && now - lastNav.ts < 500) {
    console.warn('[safeNavigate] suppressed duplicate nav to', path);
    return;
  }
  lastNav = { path, ts: now };
  nav(path, opts);
}