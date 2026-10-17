# Tidepool Tycoon

A cozy, dark, late-night fishing + aquarium idle tycoon for iPhone, built as an installable PWA. No ads, no purchases, fully offline once installed.

## Install on your iPhone

1. Open the game URL in **Safari** (it must be Safari; other iOS browsers can't install web apps).
2. Tap the **Share** button (square with an arrow).
3. Scroll down and tap **Add to Home Screen**, then **Add**.
4. Launch it from the new home-screen icon. It runs full-screen and works offline from then on.

### Keeping the screen on while you play in bed
The game has a **Keep screen awake** setting. The most reliable method on iOS is still: **Settings → Display & Brightness → Auto-Lock → Never** (remember to set it back).

## Updating
Every push to `main` builds, tests, and deploys automatically. On the phone, the game checks for updates on launch, on resume, and hourly. When one is ready you'll see **"New version ready. Tap to refresh"**. Tap it (your game saves first).

## Backing up your save
iOS can clear web-app storage if the phone runs very low on space or the app goes unused for weeks. Back up now and then:
**Settings → Export save** opens the share sheet (save to Files or Notes) or copies the text. To restore: **Settings → Import save**, paste, **Load this save**.

## Development

Requires Node 22+.

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (Vitest)
npm run typecheck
npm run build      # icons + typecheck + production build into dist/
npm run preview    # serve the production build on your LAN
npm run e2e        # Playwright, iPhone viewport (needs `npm run build` first)
```

### Testing on your iPhone over Wi-Fi (fast UI iteration)
1. `npm run dev` (it already listens on all interfaces). Vite prints a `Network:` URL like `http://192.168.0.234:5173/`.
2. On Windows, the first time, a **Windows Defender Firewall** prompt appears for Node.js: allow it on **Private networks**. If you missed it, allow Node.js in *Windows Security → Firewall → Allow an app through firewall*.
3. On the iPhone (same Wi-Fi), open that URL in Safari.

LAN testing is plain HTTP, so the service worker, offline mode, and installing don't work there. Use the deployed HTTPS URL for those.

### Hidden debug panel
Settings → tap the version number 7 times: add coins, skip time (+1h/+8h), copy raw state.

### Project layout
```
src/core      pure TS game logic: state, numbers, save, migrations (no DOM)
src/data      game content (data-driven; tune balance here)
src/render    canvas scene renderers and the render loop
src/ui        Preact components
src/audio     Web Audio synth (M7)
src/platform  interfaces + web implementations (swap for Capacitor later)
tools/        icon generator, economy simulator (M8)
tests/        Vitest unit tests; tests/e2e Playwright
```

## Hosting
GitHub Pages via `.github/workflows/deploy.yml`. In the repo: **Settings → Pages → Source: GitHub Actions**. Pages on a free account requires a **public** repo; for a private repo use Cloudflare Pages or Netlify (build command `npm run build`, output `dist`). The build uses relative paths, so no base-path config is needed on any host.

## Wrapping with Capacitor later
The game never calls browser-only APIs directly; everything platform-specific lives behind interfaces in `src/platform`. To ship to the App Store:

1. `npm i @capacitor/core @capacitor/ios && npm i -D @capacitor/cli`, then `npx cap init "Tidepool Tycoon" com.yourname.tidepool --web-dir dist` and `npx cap add ios`.
2. Add `*.capacitor.ts` implementations next to the web ones and choose them in `src/platform/index.ts` when `Capacitor.isNativePlatform()`:
   - **Storage** → `@capacitor/preferences` (or `@capacitor/filesystem` for large saves).
   - **Notifications** → `@capacitor/local-notifications` for expedition, egg, and research timers.
   - **Haptics** → `@capacitor/haptics`.
   - **Wake lock** → `@capacitor-community/keep-awake`.
   - **Export** → `@capacitor/share` + `@capacitor/filesystem`.
3. **No Mac needed for builds:** use **Codemagic** (free tier, Capacitor template) or a **GitHub Actions `macos-latest` runner** with `xcodebuild` + fastlane to build and sign.
4. **Apple Developer Program** account ($99/yr) for signing certificates, provisioning profiles, and App Store Connect.
5. Upload to **TestFlight**, test on your phone, then submit.
6. **App Store assets:** 1024×1024 icon (no transparency; `tools/gen-icons.ts` can render it), screenshots for 6.9" and 6.5" iPhones, a privacy policy URL, and App Privacy details ("Data Not Collected": the game stores everything on-device).
