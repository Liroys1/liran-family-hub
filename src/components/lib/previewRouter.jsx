// Preview Router - handles hash-based routing for preview environment
export function isPreviewHost() {
  return location.hostname.startsWith('preview--');
}

export function getRoute() {
  if (!isPreviewHost()) return location.pathname || '/';
  return (location.hash || '#/boot').slice(1); // מסיר את ה-#
}

export function navigateTo(path) {
  if (isPreviewHost()) {
    location.hash = path.startsWith('#') ? path : `#${path}`;
  } else {
    history.pushState({}, '', path);
    window.dispatchEvent(new Event('popstate'));
  }
}

export function listenToRouteChanges(callback) {
  if (isPreviewHost()) {
    const handler = () => callback(getRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  } else {
    const handler = () => callback(getRoute());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }
}