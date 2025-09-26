export function getRuntimeFlags() {
  const host = (typeof window !== 'undefined' && window.location?.host) || '';
  const href = (typeof window !== 'undefined' && window.location?.href) || '';
  const isPreview = /(^|\.)preview--/.test(host) || /\/editor\/preview\//.test(href);
  const isProd = !isPreview;
  const isDev = false;
  return { isPreview, isProd, isDev, host, href };
}