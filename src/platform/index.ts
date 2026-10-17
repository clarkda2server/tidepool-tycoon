/**
 * The single place that picks platform implementations.
 * To go native: add *.capacitor.ts siblings and choose them here when Capacitor.isNativePlatform().
 */
import type { AppEnvironment, AudioUnlock, FileExport, Haptics, KeyValueStorage, Notifications, WakeLock } from './types';
import { createWebStorage } from './storage.web';
import { WebWakeLock } from './wakeLock.web';
import { webHaptics } from './haptics.web';
import { webNotifications } from './notifications.web';
import { WebAudioUnlock } from './audioUnlock.web';
import { webFileExport } from './exportFile.web';
import { webEnvironment } from './environment.web';

export interface Platform {
  storage: KeyValueStorage;
  wakeLock: WakeLock;
  haptics: Haptics;
  notifications: Notifications;
  audio: AudioUnlock;
  files: FileExport;
  env: AppEnvironment;
}

export async function createPlatform(): Promise<Platform> {
  return {
    storage: await createWebStorage(),
    wakeLock: new WebWakeLock(),
    haptics: webHaptics,
    notifications: webNotifications,
    audio: new WebAudioUnlock(),
    files: webFileExport,
    env: webEnvironment,
  };
}

export type * from './types';
