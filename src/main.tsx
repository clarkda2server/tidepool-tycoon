import { render } from 'preact';
import { registerSW } from 'virtual:pwa-register';
import './styles/global.css';
import { createPlatform } from './platform';
import { App } from './ui/App';
import { GameStore } from './ui/store';
import { showToast } from './ui/toasts';

async function boot() {
  const platform = await createPlatform();
  platform.audio.install();
  void platform.storage.requestPersistence();

  const { store, source, error } = await GameStore.create(platform);
  if (error) showToast(source === 'backup' ? 'Recovered your game from the backup save.' : 'Save could not be read; starting fresh.');
  store.start();
  if (store.state.settings.keepAwake) void platform.wakeLock.enable();

  render(<App store={store} />, document.getElementById('app')!);

  // Service worker: precache everything; when a new version lands, offer a gentle refresh.
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        showToast('New version ready.', {
          sticky: true,
          action: {
            label: 'Tap to refresh',
            run: () => void store.save().then(() => updateSW(true)),
          },
        });
      },
      onOfflineReady() {
        showToast('Ready to play offline.');
      },
      onRegisteredSW(_url, reg) {
        // iOS rarely checks for updates on its own; check hourly and on resume.
        if (!reg) return;
        setInterval(() => void reg.update(), 60 * 60 * 1000);
        platform.env.onVisibilityChange((visible) => visible && void reg.update());
      },
    });
  }
}

void boot();
