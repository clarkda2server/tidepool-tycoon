import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { cast, tick } from '../src/core/actions';
import { migrate } from '../src/core/migrations';
import { D } from '../src/core/num';
import { BACKUP_KEY, SAVE_KEY, loadGame, saveGame } from '../src/core/save';
import { deserialize, fromExportString, serialize, toExportString } from '../src/core/serialize';
import { newGame, SAVE_VERSION } from '../src/core/state';
import { IdbStorage } from '../src/platform/storage.web';
import type { KeyValueStorage } from '../src/platform/types';

class MemStorage implements KeyValueStorage {
  map = new Map<string, string>();
  async get(k: string) { return this.map.get(k) ?? null; }
  async set(k: string, v: string) { this.map.set(k, v); }
  async remove(k: string) { this.map.delete(k); }
  async requestPersistence() { return false; }
}

describe('serialize', () => {
  it('round-trips Decimals including huge values', () => {
    const s = newGame(1000);
    s.coins = D('1.5e300');
    s.lifetimeCoins = D(42);
    const back = deserialize(serialize(s));
    expect(back.coins.eq(s.coins)).toBe(true);
    expect(back.lifetimeCoins.toNumber()).toBe(42);
  });

  it('fills missing fields from defaults', () => {
    const back = deserialize(JSON.stringify({ version: 1, coins: '$d:5' }));
    expect(back.coins.toNumber()).toBe(5);
    expect(back.settings.cinemaDelaySec).toBe(45);
    expect(back.stats.casts).toBe(0);
  });

  it('never loads NaN or negative coins', () => {
    const back = deserialize(JSON.stringify({ version: 1, coins: '$d:-100', lifetimeCoins: '$d:NaN' }));
    expect(back.coins.toNumber()).toBe(0);
    expect(back.lifetimeCoins.toNumber()).toBe(0);
  });

  it('export string round-trips', () => {
    const s = newGame(1);
    cast(s);
    cast(s);
    const back = fromExportString(toExportString(s));
    expect(back.coins.toNumber()).toBe(2);
    expect(back.stats.casts).toBe(2);
  });

  it('rejects garbage imports', () => {
    expect(() => fromExportString('not a save')).toThrow();
  });
});

describe('migrations', () => {
  it('treats unversioned saves as v1 and reaches current', () => {
    expect(migrate({ coins: '$d:1' }).version).toBe(SAVE_VERSION);
  });
  it('refuses saves from the future', () => {
    expect(() => migrate({ version: SAVE_VERSION + 1 })).toThrow(/newer/);
  });
});

describe('saveGame/loadGame', () => {
  it('starts new when empty', async () => {
    const r = await loadGame(new MemStorage(), 5);
    expect(r.source).toBe('new');
    expect(r.state.createdAt).toBe(5);
  });

  it('persists and keeps a backup of the previous good save', async () => {
    const st = new MemStorage();
    const s = newGame(0);
    cast(s);
    await saveGame(st, s);
    cast(s);
    await saveGame(st, s);
    expect((await loadGame(st)).state.stats.casts).toBe(2);
    expect(deserialize(st.map.get(BACKUP_KEY)!).stats.casts).toBe(1);
  });

  it('falls back to the backup when the main slot is corrupt', async () => {
    const st = new MemStorage();
    const s = newGame(0);
    cast(s);
    await saveGame(st, s);
    cast(s);
    await saveGame(st, s);
    st.map.set(SAVE_KEY, '{"broken":');
    const r = await loadGame(st);
    expect(r.source).toBe('backup');
    expect(r.state.stats.casts).toBe(1);
    expect(r.error).toBeTruthy();
  });

  it('works against IndexedDB', async () => {
    const st = new IdbStorage();
    const s = newGame(0);
    cast(s);
    await saveGame(st, s);
    expect((await loadGame(st)).state.coins.toNumber()).toBe(1);
  });
});

describe('tick', () => {
  it('survives clock rollback without negative time', () => {
    const s = newGame(10_000);
    tick(s, 5_000);
    expect(s.lastTickAt).toBe(5_000);
    tick(s, 6_000);
    expect(s.lastTickAt).toBe(6_000);
  });
});
