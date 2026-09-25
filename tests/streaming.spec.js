const { test, expect } = require('@playwright/test');

test('demo Streaming carga como vista de solo lectura', async ({ page }) => {
  await page.goto('/panel/demo.html');
  await expect(page).toHaveTitle(/Demo · YummyPro Streaming/);
  await expect(page.getByText('Panel Streaming')).toBeVisible();
  await expect(page.getByText('DEMOSTRACIÓN · SOLO LECTURA')).toBeVisible();
  await expect(page.getByText('Versión demo · v0.2.1')).toBeVisible();
  await expect(page.getByRole('button', { name: /Suscripciones/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Clientes/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Cuentas \/ Cupos/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Plataformas/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Renovaciones/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Crear cuenta · 30 días gratis/i })).toHaveAttribute('href', /web\.yummypro\.online\/#streaming/);
});

test('manifest identifica la PWA Streaming', async ({ request }) => {
  const response = await request.get('/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.name).toBe('YummyPro Streaming');
  expect(manifest.start_url).toBe('/panel/');
  expect(manifest.scope).toBe('/panel/');
});
