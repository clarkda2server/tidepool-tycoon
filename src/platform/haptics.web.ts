import type { Haptics } from './types';

/** iOS Safari has no navigator.vibrate; this is a no-op there. Capacitor Haptics replaces it later. */
export const webHaptics: Haptics = {
  impact(style) {
    try {
      navigator.vibrate?.(style === 'light' ? 8 : style === 'medium' ? 15 : [10, 40, 10]);
    } catch {
      /* unsupported */
    }
  },
};
