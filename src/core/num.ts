import Decimal, { type DecimalSource } from 'break_infinity.js';

export { Decimal };
export type Num = Decimal;

export const D = (v: DecimalSource): Decimal => new Decimal(v);

/** Guard against NaN/Infinity/negatives ever entering state. */
export function sanitize(v: Decimal): Decimal {
  if (!Number.isFinite(v.mantissa) || !Number.isFinite(v.exponent) || v.lt(0)) return new Decimal(0);
  return v;
}

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/** Letter suffix after the named ones: aa, ab, ... az, ba, ... */
function letterSuffix(i: number): string {
  const a = 'abcdefghijklmnopqrstuvwxyz';
  return a[Math.floor(i / 26) % 26]! + a[i % 26]!;
}

export type NumberFormat = 'suffix' | 'scientific';

/** 1.23K, 4.5M, 7.8B, 9.1T, Qa, Qi... then aa, ab... ; or scientific 1.23e45. */
export function formatNum(value: DecimalSource, fmt: NumberFormat = 'suffix'): string {
  const v = value instanceof Decimal ? value : new Decimal(value);
  if (!Number.isFinite(v.mantissa)) return '0';
  if (v.lt(1000)) {
    const n = v.toNumber();
    if (n < 10 && n % 1 !== 0) return n.toFixed(n < 1 ? 2 : 1).replace(/\.?0+$/, '') || '0';
    return Math.floor(n).toString();
  }
  const e = v.exponent;
  if (fmt === 'scientific') return `${v.mantissa.toFixed(2)}e${e}`;
  const tier = Math.floor(e / 3);
  const scaled = v.mantissa * 10 ** (e - tier * 3);
  const suffix = tier < SUFFIXES.length ? SUFFIXES[tier]! : letterSuffix(tier - SUFFIXES.length);
  const digits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2;
  // Truncate (not round) so 999.99K never shows as "1000K".
  const p = 10 ** digits;
  const shown = (Math.floor(scaled * p + 1e-9) / p).toFixed(digits).replace(/\.?0+$/, '');
  return shown + suffix;
}
