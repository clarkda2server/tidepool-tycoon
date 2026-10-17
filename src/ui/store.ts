import { useEffect, useState } from 'preact/hooks';
import { tick } from '../core/actions';
import { loadGame, saveGame } from '../core/save';
import { newGame, type GameState } from '../core/state';
import type { Platform } from '../platform';

const TICK_MS = 100; // 10 Hz logic
const AUTOSAVE_MS = 10_000;

type Listener = () => void;

/** Owns the live GameState, the logic tick, and saving. UI subscribes for re-renders. */
export class GameStore {
  state: GameState;
  private listeners = new Set<Listener>();
  private tickTimer: ReturnType<typeof setInterval> | undefined;
  private saveTimer: ReturnType<typeof setInterval> | undefined;
  private saving = Promise.resolve();
  revision = 0;

  constructor(
    readonly platform: Platform,
    initial: GameState,
  ) {
    this.state = initial;
  }

  static async create(platform: Platform): Promise<{ store: GameStore; source: string; error?: string }> {
    const { state, source, error } = await loadGame(platform.storage);
    return { store: new GameStore(platform, state), source, error };
  }

  start() {
    this.tickTimer = setInterval(() => this.update((s) => tick(s, Date.now())), TICK_MS);
    this.saveTimer = setInterval(() => void this.save(), AUTOSAVE_MS);
    this.platform.env.onVisibilityChange((visible) => {
      if (!visible) void this.save();
      else this.update((s) => tick(s, Date.now()));
    });
    this.platform.env.onPageHide(() => void this.save());
  }

  stop() {
    clearInterval(this.tickTimer);
    clearInterval(this.saveTimer);
  }

  update(fn: (s: GameState) => void) {
    fn(this.state);
    this.revision++;
    for (const l of this.listeners) l();
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  save(): Promise<void> {
    // Serialize writes so two saves never interleave.
    this.saving = this.saving.then(() => saveGame(this.platform.storage, this.state)).catch((e) => console.error('save failed', e));
    return this.saving;
  }

  async replaceState(next: GameState) {
    this.update((s) => Object.assign(s, next));
    await this.save();
  }

  async reset() {
    await this.replaceState(newGame(Date.now()));
  }
}

/** Re-render the calling component whenever the store changes. */
export function useStore(store: GameStore): GameState {
  const [, setRev] = useState(store.revision);
  useEffect(() => store.subscribe(() => setRev(store.revision)), [store]);
  return store.state;
}
