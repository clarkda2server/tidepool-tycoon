import { useRef, useState } from 'preact/hooks';
import { formatNum } from '../core/num';
import { DebugSheet } from './DebugSheet';
import { DockScreen } from './DockScreen';
import { InstallBanner } from './InstallBanner';
import { SettingsSheet } from './SettingsSheet';
import { useStore, type GameStore } from './store';
import { Toasts } from './Toasts';

export function App({ store }: { store: GameStore }) {
  const state = useStore(store);
  const [sheet, setSheet] = useState<'settings' | 'debug' | null>(null);
  const versionTaps = useRef({ n: 0, at: 0 });

  const onVersionTap = () => {
    const now = Date.now();
    const v = versionTaps.current;
    v.n = now - v.at < 1500 ? v.n + 1 : 1;
    v.at = now;
    if (v.n >= 7) {
      v.n = 0;
      setSheet('debug');
    }
  };

  return (
    <>
      <header class="hud">
        <div>
          <div class="coins" data-testid="coins">🪙 {formatNum(state.coins, state.settings.numberFormat)}</div>
          <div class="rate">{state.stats.casts} casts</div>
        </div>
        <div class="spacer" />
        <button class="icon-btn" aria-label="Settings" onClick={() => setSheet('settings')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
          </svg>
        </button>
      </header>
      <DockScreen store={store} banner={<InstallBanner store={store} />} />
      {sheet === 'settings' && <SettingsSheet store={store} onClose={() => setSheet(null)} onVersionTap={onVersionTap} />}
      {sheet === 'debug' && <DebugSheet store={store} onClose={() => setSheet(null)} />}
      {state.settings.dim > 0 && <div class="dim-overlay" style={{ opacity: state.settings.dim }} />}
      <Toasts />
    </>
  );
}
