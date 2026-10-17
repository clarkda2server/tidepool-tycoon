/**
 * Save migrations operate on the plain JSON (already-parsed, Decimals still strings).
 * migrations[n] upgrades a version-n save to version n+1. Never edit an old migration;
 * add a new one and bump SAVE_VERSION.
 */
import { SAVE_VERSION } from './state';

type Json = Record<string, unknown>;

export const migrations: Record<number, (s: Json) => Json> = {
  // 1 -> 2: example for the future
  // 1: (s) => ({ ...s, newField: 0, version: 2 }),
};

export function migrate(raw: Json): Json {
  let s = raw;
  let v = typeof s.version === 'number' ? s.version : 0;
  if (v === 0) {
    // Pre-release / unversioned: treat as v1.
    s = { ...s, version: 1 };
    v = 1;
  }
  while (v < SAVE_VERSION) {
    const step = migrations[v];
    if (!step) throw new Error(`Missing migration from v${v}`);
    s = step(s);
    v = s.version as number;
  }
  if (v > SAVE_VERSION) throw new Error(`Save is from a newer version (v${v})`);
  return s;
}
