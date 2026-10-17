import type { ComponentChildren } from 'preact';

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ComponentChildren }) {
  return (
    <>
      <div class="sheet-backdrop" onClick={onClose} />
      <div class="sheet" role="dialog" aria-label={title}>
        <div class="grab" />
        <h2>{title}</h2>
        {children}
      </div>
    </>
  );
}
