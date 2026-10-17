import type { Notifications } from './types';

/** Web: no reliable background local notifications on iOS PWAs. Capacitor LocalNotifications later. */
export const webNotifications: Notifications = {
  async schedule() {},
  async cancel() {},
};
