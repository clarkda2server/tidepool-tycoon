import { useEffect, useState } from 'preact/hooks';

/** Minimal observable value for UI-only state (toasts, sheets). */
export function signalish<T>(initial: T) {
  let value = initial;
  const subs = new Set<(v: T) => void>();
  return {
    get: () => value,
    set(v: T) {
      value = v;
      for (const s of subs) s(v);
    },
    subscribe(fn: (v: T) => void) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
  };
}

export function useSignalish<T>(s: ReturnType<typeof signalish<T>>): T {
  const [v, setV] = useState(s.get());
  useEffect(() => s.subscribe(setV), [s]);
  return v;
}
