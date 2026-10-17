import type { KeyValueStorage } from '../platform/types';
import { deserialize, serialize } from './serialize';
import { newGame, type GameState } from './state';

export const SAVE_KEY = 'save';
export const BACKUP_KEY = 'save.backup';

export interface LoadResult {
  state: GameState;
  source: 'main' | 'backup' | 'new';
  error?: string;
}

/**
 * Writes the save, after first promoting the previous good save to the backup slot.
 * If the main slot is ever corrupt, load() falls back to the backup.
 */
export async function saveGame(storage: KeyValueStorage, state: GameState): Promise<void> {
  const json = serialize(state);
  const prev = await storage.get(SAVE_KEY);
  if (prev && prev !== json && isValid(prev)) await storage.set(BACKUP_KEY, prev);
  await storage.set(SAVE_KEY, json);
}

function isValid(json: string): boolean {
  try {
    deserialize(json);
    return true;
  } catch {
    return false;
  }
}

export async function loadGame(storage: KeyValueStorage, now = Date.now()): Promise<LoadResult> {
  let error: string | undefined;
  for (const [key, source] of [
    [SAVE_KEY, 'main'],
    [BACKUP_KEY, 'backup'],
  ] as const) {
    const json = await storage.get(key);
    if (!json) continue;
    try {
      return { state: deserialize(json, now), source, error };
    } catch (e) {
      error = `${key}: ${(e as Error).message}`;
    }
  }
  return { state: newGame(now), source: 'new', error };
}
