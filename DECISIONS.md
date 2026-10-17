# Decisions

Choices made without asking, with the reason. Newest at the bottom of each milestone.

## M1
- **Relative Vite `base` (`./`) everywhere** instead of `/<repo>/`. The same build then works on GitHub Pages under any repo name, on Netlify/Cloudflare at the root, and inside a Capacitor webview. Override with the `BASE_PATH` env var if ever needed.
- **Service worker in "prompt" mode, not auto-reload.** The new SW precaches in the background and the game shows "New version ready. Tap to refresh". Tapping saves first, then activates. This avoids reloading mid-session (and losing a few seconds of progress) while still updating promptly. Update checks run hourly and on every resume, since iOS rarely checks on its own.
- **Decimal (break_infinity.js) for all currencies.** Saved as tagged strings (`"$d:1.5e300"`), so saves are plain JSON.
- **Save = IndexedDB, fallback localStorage**, with a `save.backup` slot holding the previous good save. If the main save is corrupt, the backup loads automatically and a toast says so.
- **Export format:** `TPT1.` + base64(JSON). Short prefix makes it obvious what the text is and lets the format evolve.
- **Canvas DPR capped at 2.** iPhones are 3x; 2x looks the same for soft procedural art and is far cheaper on battery.
- **Hold-to-auto-cast starts after 350 ms** so a normal tap never double-casts.
- **Install banner sits just above the CAST button** (thumb zone) rather than at the top, so toasts never cover it.
- **Wake lock fallback** uses a muted looping video built from a canvas stream (no media file shipped).
- **TypeScript 7 + Vite 8 + Vitest 5 + Preact 11** (current versions at time of writing). Note: Preact 11 does not add `px` to numeric inline styles, so always write `'12px'`.
- **WebKit e2e on Linux** needs `sudo npx playwright install-deps webkit` (missing `libavif16`). Chromium with the iPhone 15 Pro profile is used as the fallback self-check.
