/**
 * Platform seams. Game code talks only to these interfaces, never to browser APIs
 * directly, so Capacitor implementations can be swapped in later (see README).
 */
export interface KeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  /** Ask the OS not to evict our data. Resolves true if granted. */
  requestPersistence(): Promise<boolean>;
}

export interface WakeLock {
  readonly supported: 'native' | 'fallback' | 'none';
  enable(): Promise<void>;
  disable(): Promise<void>;
  readonly active: boolean;
}

export type HapticStyle = 'light' | 'medium' | 'success';
export interface Haptics {
  impact(style: HapticStyle): void;
}

export interface Notifications {
  /** Schedule a local notification at an absolute epoch-ms time. No-op on web. */
  schedule(id: string, atMs: number, title: string, body: string): Promise<void>;
  cancel(id: string): Promise<void>;
}

export interface AudioUnlock {
  /** Returns a shared AudioContext once a user gesture has unlocked it. */
  getContext(): AudioContext | null;
  /** Call once at startup; wires first-tap unlock + resume on visibility change. */
  install(): void;
}

export interface FileExport {
  /** Hand a text blob to the user (share sheet / download / clipboard). */
  exportText(filename: string, text: string): Promise<'shared' | 'downloaded' | 'copied' | 'failed'>;
}

export interface AppEnvironment {
  isStandalone(): boolean;
  isIOS(): boolean;
  /** Subscribe to app going to background / foreground. Returns unsubscribe. */
  onVisibilityChange(cb: (visible: boolean) => void): () => void;
  /** Fired when the page is being torn down (last chance to save). */
  onPageHide(cb: () => void): () => void;
}
