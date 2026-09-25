// Validación E2E final YummyPro Streaming v0.9.0
const { test, expect } = require('@playwright/test');

test('demo Streaming carga como vista de solo lectura', async ({ page }) => {
  await page.goto('/panel/demo.html');
  await expect(page).toHaveTitle(/Demo · YummyPro Streaming/);
  await expect(page.getByText('Panel Streaming')).toBeVisible();
  await expect(page.getByText('DEMOSTRACIÓN · SOLO LECTURA')).toBeVisible();
  await expect(page.getByText('Versión demo · v0.5.0')).toBeVisible();
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

test('modulo operativo Streaming v0.6.0 esta publicado', async ({ request }) => {
  const response = await request.get('/panel/streaming-delivery.js?v=0600');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('entrega, activación y centro de acciones v0.6.0');
  expect(body).toContain('Centro de acciones');
  expect(body).toContain('Cobros pendientes');
  expect(body).toContain('Entregas pendientes');
  expect(body).toContain('Vencen en 3 días');
  expect(body).toContain('Suscripciones vencidas');
});

test('recordatorios Streaming v0.8.0 estan publicados y persistentes', async ({ request }) => {
  const response = await request.get('/panel/streaming-reminders.js?v=0800');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('recordatorios persistentes v0.8.0');
  expect(body).toContain('Recordatorios automáticos');
  expect(body).toContain('WhatsApp · siguiente');
  expect(body).toContain('streamingReminderTasks');
  expect(body).toContain('streamingReminderWhatsApp');
  expect(body).toContain('streaming_reminder_logs');
  expect(body).toContain('streamingLoadReminderLogs');
  expect(body).toContain('Gestionado hoy');
  expect(body).not.toContain('localStorage');
});

test('panel carga recordatorios una sola vez', async ({ request }) => {
  const response = await request.get('/panel/');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('Streaming · Versión v0.9.0');
  const matches=body.match(/\/panel\/streaming-reminders\.js\?v=0800/g)||[];
  expect(matches).toHaveLength(1);
});

test('agenda diaria Streaming v0.9.0 esta disponible', async ({ request }) => {
  const response = await request.get('/panel/streaming-agenda.js?v=0900');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('agenda diaria v0.9.0');
  expect(body).toContain('Agenda de hoy');
  expect(body).toContain('Gestionar siguiente');
  expect(body).toContain('streamingAgendaPending');
});

test('panel carga agenda una sola vez', async ({ request }) => {
  const response = await request.get('/panel/');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('Streaming · Versión v0.9.0');
  const matches=body.match(/\/panel\/streaming-agenda\.js\?v=0900/g)||[];
  expect(matches).toHaveLength(1);
});
