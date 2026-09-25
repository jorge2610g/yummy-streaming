const { test, expect } = require('@playwright/test');

test('Streaming Pruebas carga desde GitHub Pages', async ({ page }) => {
  test.skip(!process.env.PAGES_TEST_URL,'PAGES_TEST_URL solo existe en el smoke externo');
  const errors=[];
  page.on('pageerror', e=>errors.push(String(e.message||e)));
  const res=await page.goto(process.env.PAGES_TEST_URL,{waitUntil:'domcontentloaded'});
  expect(res?.ok()).toBeTruthy();
  await expect(page.locator('body')).not.toBeEmpty();
  expect(errors).toEqual([]);
  const html=await page.content();
  expect(html).toContain('YummyPlay');
  expect(page.url()).toContain('/yummy-streaming-pruebas/demo/');
  const panel=await page.request.get(new URL('../panel/',page.url()).href);
  expect(panel.ok()).toBeTruthy();
  expect(await panel.text()).toContain('wodqqheeesrelsbacmgx');
});
