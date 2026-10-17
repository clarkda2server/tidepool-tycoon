import { dismissToast, toasts } from './toasts';
import { useSignalish } from './signalish';

export function Toasts() {
  const list = useSignalish(toasts);
  return (
    <div class="toast-stack" aria-live="polite">
      {list.map((t) => (
        <button
          key={t.id}
          class="toast"
          onClick={() => {
            t.action?.run();
            dismissToast(t.id);
          }}
        >
          {t.text}
          {t.action && <b style={{ color: 'var(--accent)', marginLeft: '8px' }}>{t.action.label}</b>}
        </button>
      ))}
    </div>
  );
}
