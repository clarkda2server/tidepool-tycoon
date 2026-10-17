import { D, type Num, type NumberFormat } from './num';

/** Bump when the shape changes and add a migration in migrations.ts. */
export const SAVE_VERSION = 1;

export interface Settings {
  volume: number; // 0..1
  muted: boolean;
  dim: number; // 0..0.7 black overlay
  cinemaDelaySec: number;
  reduceMotion: boolean;
  keepAwake: boolean;
  numberFormat: NumberFormat;
}

export interface GameState {
  version: number;
  createdAt: number;
  /** Wall-clock ms of the last simulated moment; offline progress is computed from this. */
  lastTickAt: number;
  coins: Num;
  lifetimeCoins: Num;
  stats: { casts: number };
  flags: { installBannerDismissed: boolean };
  settings: Settings;
}

export const defaultSettings = (): Settings => ({
  volume: 0.3,
  muted: true,
  dim: 0,
  cinemaDelaySec: 45,
  reduceMotion: false,
  keepAwake: false,
  numberFormat: 'suffix',
});

export function newGame(now: number): GameState {
  return {
    version: SAVE_VERSION,
    createdAt: now,
    lastTickAt: now,
    coins: D(0),
    lifetimeCoins: D(0),
    stats: { casts: 0 },
    flags: { installBannerDismissed: false },
    settings: defaultSettings(),
  };
}
