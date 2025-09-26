export const IS_PREVIEW =
  typeof window !== 'undefined' &&
  (location.hostname.startsWith('preview--') || location.href.includes('/editor/preview'));