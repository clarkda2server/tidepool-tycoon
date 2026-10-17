import { addCoins } from '../core/actions';
import { serialize } from '../core/serialize';
import { Sheet } from './Sheet';
import type { GameStore } from './store';
import { showToast } from './toasts';

const HOUR = 3_600_000;

/** Hidden tools: tap the version number 7 times in Settings. */
export function DebugSheet({ store, onClose }: { store: GameStore; onClose: () => void }) {
  const skip = (ms: number) => {
    // Simulate time away by moving the last-tick anchor into the past.
    store.update((s) => (s.lastTickAt -= ms));
    showToast(`Skipped ${ms / HOUR}h`);
  };
  return (
    <Sheet title="Debug" onClose={onClose}>
      <div class="row">
        <button class="btn" onClick={() => store.update((s) => addCoins(s, 1000))}>+1K coins</button>
        <button class="btn" onClick={() => store.update((s) => addCoins(s, 1e9))}>+1B coins</button>
        <button class="btn" onClick={() => skip(HOUR)}>+1h</button>
        <button class="btn" onClick={() => skip(8 * HOUR)}>+8h</button>
        <button
          class="btn"
          onClick={async () => {
            await navigator.clipboard?.writeText(serialize(store.state)).catch(() => undefined);
            showToast('Raw state copied');
          }}
        >
          Copy state JSON
        </button>
      </div>
      <p class="hint" style={{ marginTop: '12px' }}>Built {__BUILD_TIME__}</p>
    </Sheet>
  );
}
