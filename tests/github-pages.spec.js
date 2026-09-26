const { test, expect } = require('@playwright/test');

test('RELEASE GATE: Streaming Pruebas carga correctamente desde GitHub Pages', async ({ page }) => {
  test.skip(!process.env.PAGES_TEST_URL, 'PAGES_TEST_URL solo existe en el smoke externo');

  const pageErrors = [];
  const serverErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error?.message || error)));
  page.on('response', (response) => {
    if (response.status() >= 500 && response.url().startsWith(process.env.PAGES_TEST_URL)) {
      serverErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  const response = await page.goto(process.env.PAGES_TEST_URL, { waitUntil: 'domcontentloaded' });
  expect(response?.ok(), 'Streaming Pruebas no respondió correctamente').toBeTruthy();
  await expect(page.locator('body')).not.toBeEmpty();

  const html = await page.content();
  expect(html).toContain('YummyPlay');
  expect(page.url()).toContain('/yummy-streaming-pruebas/demo/');

  const panel = await page.request.get(new URL('../panel/', page.url()).href);
  expect(panel.ok(), 'El panel de Streaming Pruebas no respondió correctamente').toBeTruthy();
  expect(await panel.text()).toContain('wodqqheeesrelsbacmgx');

  expect(pageErrors, `Errores JavaScript detectados: ${pageErrors.join(' | ')}`).toEqual([]);
  expect(serverErrors, `Errores 5xx detectados: ${serverErrors.join(' | ')}`).toEqual([]);
});
