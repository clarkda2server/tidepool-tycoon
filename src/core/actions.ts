import { D, sanitize } from './num';
import type { GameState } from './state';

/** M1 placeholder: each cast earns 1 coin. Replaced by the catch table in M2. */
export function cast(state: GameState): number {
  const earned = 1;
  state.coins = sanitize(state.coins.add(earned));
  state.lifetimeCoins = sanitize(state.lifetimeCoins.add(earned));
  state.stats.casts += 1;
  return earned;
}

/** Advance the simulation to `now`. Pure timestamp math: safe across suspends and clock changes. */
export function tick(state: GameState, now: number): void {
  // Clock rolled back: re-anchor rather than produce negative time.
  if (now < state.lastTickAt) state.lastTickAt = now;
  state.lastTickAt = now;
}

export function addCoins(state: GameState, amount: number): void {
  state.coins = sanitize(state.coins.add(D(amount)));
  state.lifetimeCoins = sanitize(state.lifetimeCoins.add(D(amount)));
}
