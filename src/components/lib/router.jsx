
// Hash-only router to avoid server 404s in Base44 preview.
// It also normalizes any stray path after /editor/preview/* to the hash.

export function normalizePreviewUrl() {
  if (typeof window === 'undefined') return;

  const { pathname, search, hash } = window.location;
  // match "/apps/<id>/editor/preview" OR "/apps/<id>/editor/preview/<garbage>"
  const m = pathname.match(/^(.*\/editor\/preview)(\/.*)?$/);
  if (!m) return; // not in preview

  const previewRoot = m[1];        // ".../editor/preview"
  const hasGarbage = !!m[2];        // "/%D6%BF" וכד'
  const finalHash = hash && hash.startsWith('#/') ? hash : '#/boot';

  // אם יש זבל ב-path או אין hash – נעשה redirect "נקי" לאותו origin + root + hash
  if (hasGarbage || !hash || !hash.startsWith('#/')) {
    // שמור את ה-query string אם יש
    const qs = search || '';
    const url = `${previewRoot}${qs}${finalHash}`;
    // החלפה שקטה כדי לא לשבור Back
    window.history.replaceState({}, '', url);
  }
}

const listeners = new Set();

export function getRoute() {
  const h = (typeof window !== 'undefined' && window.location.hash) || '#/boot';
  const raw = h.replace(/^#/, '');
  const [path, queryString=''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));
  return { path: path || '/boot', query };
}

export function onRouteChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() { listeners.forEach(cb => cb(getRoute())); }

export function initRouter() {
  if (typeof window === 'undefined') return;
  normalizePreviewUrl();
  window.addEventListener('hashchange', () => {
    normalizePreviewUrl();
    notify();
  });
  // on first load
  notify();
}

export function push(href) {
  if (typeof window === 'undefined') return;
  if (!href.startsWith('#')) href = `#${href}`;
  window.location.hash = href;
}

export function replace(href) {
  if (typeof window === 'undefined') return;
  if (!href.startsWith('#')) href = `#${href}`;
  const url = window.location.href.replace(/#.*/, '') + href;
  window.history.replaceState({}, '', url);
  notify();
}
