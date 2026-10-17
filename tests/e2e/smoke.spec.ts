import { expect, test } from '@playwright/test';

test('dock loads, casting earns coins, and the save survives a reload', async ({ page }) => {
  await page.goto('./');
  const coins = page.getByTestId('coins');
  await expect(coins).toContainText('0');
  const cast = page.getByRole('button', { name: 'CAST' });
  for (let i = 0; i < 5; i++) await cast.tap();
  await expect(coins).toContainText('5');

  // Layout: CAST button sits fully inside the bottom 40% and is a big tap target.
  const vp = page.viewportSize()!;
  const box = (await cast.boundingBox())!;
  expect(box.y).toBeGreaterThan(vp.height * 0.6);
  expect(box.y + box.height).toBeLessThanOrEqual(vp.height);
  expect(box.height).toBeGreaterThanOrEqual(44);
  // No horizontal overflow.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vp.width);

  await page.screenshot({ path: 'test-results/dock.png' });
  // Force a save via pagehide then reload.
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
  await page.waitForTimeout(300);
  await page.reload();
  await expect(page.getByTestId('coins')).toContainText('5');
});

test('manifest and icons are served', async ({ request }) => {
  const m = await (await request.get('manifest.webmanifest')).json();
  expect(m.display).toBe('standalone');
  expect(m.orientation).toBe('portrait');
  for (const icon of m.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  expect((await request.get('icons/apple-touch-icon-180.png')).ok()).toBe(true);
});
