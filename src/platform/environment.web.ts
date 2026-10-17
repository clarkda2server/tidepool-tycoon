import type { AppEnvironment } from './types';

export const webEnvironment: AppEnvironment = {
  isStandalone() {
    return (
      window.matchMedia?.('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  },
  isIOS() {
    const ua = navigator.userAgent;
    // iPadOS reports as Mac; detect touch to catch it.
    return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  },
  onVisibilityChange(cb) {
    const h = () => cb(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  },
  onPageHide(cb) {
    window.addEventListener('pagehide', cb);
    return () => window.removeEventListener('pagehide', cb);
  },
};
