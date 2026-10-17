import { Decimal, sanitize } from './num';
import { migrate } from './migrations';
import { defaultSettings, newGame, type GameState } from './state';

const DEC_TAG = '$d:';

/** JSON with Decimals encoded as tagged strings. */
export function serialize(state: GameState): string {
  // Decimal defines toJSON, which runs before the replacer, so inspect the raw holder value.
  return JSON.stringify(state, function (this: Record<string, unknown>, k, v) {
    const raw = this[k];
    return raw instanceof Decimal ? DEC_TAG + raw.toString() : v;
  });
}

export function deserialize(json: string, now = Date.now()): GameState {
  const parsed = JSON.parse(json, (_k, v) => (typeof v === 'string' && v.startsWith(DEC_TAG) ? sanitize(new Decimal(v.slice(DEC_TAG.length))) : v));
  if (!parsed || typeof parsed !== 'object') throw new Error('Save is not an object');
  const migrated = migrate(parsed) as unknown as GameState;
  return normalize(migrated, now);
}

/** Fill any missing fields from defaults so partial/old saves never crash the game. */
function normalize(s: GameState, now: number): GameState {
  const base = newGame(now);
  const out: GameState = {
    ...base,
    ...s,
    stats: { ...base.stats, ...s.stats },
    flags: { ...base.flags, ...s.flags },
    settings: { ...defaultSettings(), ...s.settings },
  };
  if (!(out.coins instanceof Decimal)) out.coins = base.coins;
  if (!(out.lifetimeCoins instanceof Decimal)) out.lifetimeCoins = base.lifetimeCoins;
  if (!Number.isFinite(out.lastTickAt)) out.lastTickAt = now;
  return out;
}

/** Portable backup string: base64 of the JSON (UTF-8 safe). */
export function toExportString(state: GameState): string {
  const bytes = new TextEncoder().encode(serialize(state));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return 'TPT1.' + btoa(bin);
}

export function fromExportString(text: string, now = Date.now()): GameState {
  const trimmed = text.trim().replace(/\s+/g, '');
  const body = trimmed.startsWith('TPT1.') ? trimmed.slice(5) : trimmed;
  const bin = atob(body);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return deserialize(new TextDecoder().decode(bytes), now);
}
