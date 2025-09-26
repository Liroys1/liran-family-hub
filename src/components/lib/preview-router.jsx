// lib/preview-router.js
export function ensurePreviewHashRoute() {
  // כל דבר שאינו hash-routing → מעבירים ל-#/boot
  if (!location.hash || location.hash === '#/' || location.hash === '#') {
    const weird = decodeURIComponent(location.pathname.split('/editor/preview/')[1] || '');
    if (weird && weird !== 'index' && weird !== 'preview') {
      // נחיתה על /%D6%BF / רענונים – נתקן ל־#/boot
      location.replace(location.pathname.replace(/\/editor\/preview\/.*/, '/editor/preview/') + '#/boot');
      return true;
    }
  }
  return false;
}

export function go(path) {
  // ניווט אחיד
  location.hash = path.startsWith('#') ? path : '#' + path;
}