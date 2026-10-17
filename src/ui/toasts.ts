import { signalish } from './signalish';

export interface Toast { id: number; text: string; action?: { label: string; run: () => void }; sticky?: boolean }

let nextId = 1;
export const toasts = signalish<Toast[]>([]);

export function showToast(text: string, opts: { action?: Toast['action']; sticky?: boolean; ms?: number } = {}) {
  const t: Toast = { id: nextId++, text, action: opts.action, sticky: opts.sticky };
  toasts.set([...toasts.get().slice(-2), t]);
  if (!opts.sticky) setTimeout(() => dismissToast(t.id), opts.ms ?? 2800);
  return t.id;
}

export function dismissToast(id: number) {
  toasts.set(toasts.get().filter((t) => t.id !== id));
}
