import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  use: { baseURL: 'http://localhost:4173/', ...devices['iPhone 15 Pro'] },
  // WebKit is the real target. On Linux it needs `sudo npx playwright install-deps webkit`;
  // run `npm run e2e -- --project=chromium-iphone` where that isn't possible.
  projects: [
    { name: 'webkit-iphone', use: { browserName: 'webkit' } },
    { name: 'chromium-iphone', use: { browserName: 'chromium' } },
  ],
  webServer: { command: 'npx vite preview --port 4173 --strictPort', url: 'http://localhost:4173/', reuseExistingServer: true },
});
