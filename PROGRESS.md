# Progress

| Milestone | Status |
|---|---|
| M1 Install pipeline | ✅ Done (pending first deploy) |
| M2 Core fishing and economy | ⏳ Next |
| M3 Aquarium, boats | |
| M4 Lab and expeditions | |
| M5 Breeding and collection | |
| M6 Prestige | |
| M7 Polish | |
| M8 Balance and README | |

## M1 notes
- Vite + TS (strict) + Preact scaffold, folder layout per spec (`core`, `data`, `render`, `ui`, `audio`, `platform`, `tools`, `tests`).
- PWA: manifest (standalone, portrait, dark), procedural icons (`npm run icons`), Workbox precache, update toast, offline-ready toast.
- All iOS meta tags, safe areas, `100dvh`, no rubber-band/zoom/select/callout.
- Platform layer: storage (IndexedDB/localStorage), wake lock (+ video fallback), haptics (no-op on iOS), notifications (no-op), audio unlock, file export, environment.
- Placeholder Dock: night scene on canvas (30 fps, paused when hidden), CAST button (tap / hold 2/s), floating +N numbers, coin counter.
- Save: autosave every 10 s, on hide and pagehide; versioned with migrations; backup slot; export/import; reset with confirm.
- Debug panel: Settings, tap the version number 7 times.
- Tests: 30 unit tests (formatting, save/load, backup recovery, migrations, export/import, IndexedDB, clock rollback) + Playwright iPhone smoke test.
