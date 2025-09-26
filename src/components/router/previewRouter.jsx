// previewRouter.js
// Hash-only router for Base44 Preview. Any bad path → #/boot

let listeners = [];

export function isPreviewHost() {
  return location.hostname.startsWith('preview--') || location.pathname.includes('/editor/preview');
}

export function currentRoute() {
  if (!isPreviewHost()) return location.pathname || '/';
  const h = location.hash || '';
  const route = h.startsWith('#') ? h.slice(1) : h;
  return route || '/boot';
}

export function navigateTo(route, { replace = false } = {}) {
  if (!route.startsWith('/')) route = '/' + route;
  const url = location.pathname + location.search + '#' + route;
  if (replace) history.replaceState({}, '', url);
  else history.pushState({}, '', url);
  emit();
}

export function goBackFallback(fallback = '/boot') {
  const before = currentRoute();
  history.back();
  setTimeout(() => {
    // אם נשארנו באותו מסך (אין היסטוריה), נלך לפולבאק
    if (currentRoute() === before) navigateTo(fallback);
  }, 180);
}

export function installPreviewRouter() {
  if (!isPreviewHost()) return;

  // 1) נירמול: אם אין hash או שיש נתיב זבל – נעבור ל-#/boot
  const badPath =
    !location.hash ||
    location.hash === '#' ||
    /[^ -~]/.test(decodeURIComponent(location.pathname)); // תווים לא-ASCII = ג׳יבריש כמו %D6%BF

  if (badPath) {
    navigateTo('/boot', { replace: true });
  }

  // 2) האזן לשינויים
  window.addEventListener('hashchange', emit);
  window.addEventListener('popstate', emit);
}

function emit() {
  const r = currentRoute();
  for (const l of listeners) l(r);
}

export function onRouteChange(cb) {
  listeners.push(cb);
  return () => { listeners = listeners.filter(x => x !== cb); };
}
