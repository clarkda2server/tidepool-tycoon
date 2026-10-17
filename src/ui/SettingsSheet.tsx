import { useState } from 'preact/hooks';
import { fromExportString, toExportString } from '../core/serialize';
import { Sheet } from './Sheet';
import type { GameStore } from './store';
import { showToast } from './toasts';

export function SettingsSheet({ store, onClose, onVersionTap }: { store: GameStore; onClose: () => void; onVersionTap: () => void }) {
  const [importing, setImporting] = useState(false);
  const [importText, setImportText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const s = store.state.settings;

  const exportSave = async () => {
    await store.save();
    const res = await store.platform.files.exportText(`tidepool-save-${new Date().toISOString().slice(0, 10)}.txt`, toExportString(store.state));
    showToast(res === 'copied' ? 'Save copied to clipboard' : res === 'failed' ? 'Export cancelled' : 'Save exported');
  };

  const doImport = async () => {
    try {
      await store.replaceState(fromExportString(importText));
      showToast('Save imported');
      setImporting(false);
      onClose();
    } catch (e) {
      showToast(`That save didn't load: ${(e as Error).message}`);
    }
  };

  const toggleAwake = async () => {
    const on = !s.keepAwake;
    store.update((st) => (st.settings.keepAwake = on));
    if (on) await store.platform.wakeLock.enable();
    else await store.platform.wakeLock.disable();
    if (on && store.platform.wakeLock.supported === 'none') showToast('Not supported here. Use iOS Auto-Lock: Never.');
  };

  return (
    <Sheet title="Settings" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button class="btn" onClick={toggleAwake}>
          Keep screen awake: {s.keepAwake ? 'On' : 'Off'}
        </button>
        <div class="row">
          <button class="btn" style={{ flex: 1 }} onClick={exportSave}>
            Export save
          </button>
          <button class="btn" style={{ flex: 1 }} onClick={() => setImporting((v) => !v)}>
            Import save
          </button>
        </div>
        {importing && (
          <>
            <textarea
              value={importText}
              onInput={(e) => setImportText((e.target as HTMLTextAreaElement).value)}
              placeholder="Paste your save text here"
              style={{ minHeight: '96px', borderRadius: '12px', background: 'var(--panel)', color: 'var(--text)', border: '1px solid var(--line)', padding: '10px', fontSize: '16px', userSelect: 'text', WebkitUserSelect: 'text' }}
            />
            <button class="btn primary" onClick={doImport} disabled={!importText.trim()}>
              Load this save
            </button>
          </>
        )}
        {!confirmReset ? (
          <button class="btn" style={{ color: 'var(--danger)' }} onClick={() => setConfirmReset(true)}>
            Reset game
          </button>
        ) : (
          <div class="row">
            <button class="btn" style={{ flex: 1 }} onClick={() => setConfirmReset(false)}>
              Keep playing
            </button>
            <button
              class="btn"
              style={{ flex: 1, color: 'var(--danger)' }}
              onClick={async () => {
                await store.reset();
                showToast('Fresh start!');
                onClose();
              }}
            >
              Yes, erase everything
            </button>
          </div>
        )}
        <button class="version" onClick={onVersionTap}>
          v{__APP_VERSION__}
        </button>
      </div>
    </Sheet>
  );
}
