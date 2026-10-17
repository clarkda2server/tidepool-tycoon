import { describe, expect, it } from 'vitest';
import { D, Decimal, formatNum, sanitize } from '../src/core/num';

describe('formatNum', () => {
  it.each([
    [0, '0'],
    [7, '7'],
    [0.5, '0.5'],
    [999, '999'],
    [1000, '1K'],
    [1234, '1.23K'],
    [45_600, '45.6K'],
    [999_999, '999K'],
    [4.5e6, '4.5M'],
    [7.8e9, '7.8B'],
    [9.1e12, '9.1T'],
    [1e15, '1Qa'],
    [1e18, '1Qi'],
    [1e36, '1aa'],
    [1e39, '1ab'],
  ])('%s -> %s', (n, out) => expect(formatNum(n)).toBe(out));

  it('handles numbers beyond float range', () => {
    expect(formatNum(new Decimal('1e400'))).toMatch(/^[\d.]+[a-z]{2}$/);
  });

  it('scientific mode', () => expect(formatNum(1.234e45, 'scientific')).toBe('1.23e45'));
});

describe('sanitize', () => {
  it('clamps negatives and NaN to zero', () => {
    expect(sanitize(D(-5)).toNumber()).toBe(0);
    expect(sanitize(D(NaN)).toNumber()).toBe(0);
    expect(sanitize(D(12)).toNumber()).toBe(12);
  });
});
