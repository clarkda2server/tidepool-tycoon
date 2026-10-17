import type { GameStore } from './store';

/** One-time hint for iOS Safari users who haven't installed yet. */
export function InstallBanner({ store }: { store: GameStore }) {
  const { env } = store.platform;
  if (store.state.flags.installBannerDismissed || env.isStandalone() || !env.isIOS()) return null;
  const dismiss = () => {
    store.update((s) => (s.flags.installBannerDismissed = true));
    void store.save();
  };
  return (
    <div class="banner" role="note">
      <span style={{ flex: 1 }}>
        To install: tap <b>Share</b>, then <b>Add to Home Screen</b>.
      </span>
      <button class="icon-btn" aria-label="Dismiss" onClick={dismiss}>
        ✕
      </button>
    </div>
  );
}
