import { isProd } from './runtimeFlags';

export function initAnalytics() {
  if (!isProd) {
    console.log('[analytics] disabled (non-prod)');
    return;
  }
  // initGA(); initPixel();
}
