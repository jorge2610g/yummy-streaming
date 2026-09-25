// Validación E2E final YummyPro Streaming v1.0.0
const { test, expect } = require('@playwright/test');

test('demo Streaming carga como vista navegable de solo lectura', async ({ page }) => {
  await page.goto('/panel/demo.html');
  await expect(page).toHaveTitle(/Demo · YummyPro Streaming/);
  await expect(page.getByText('Panel Streaming', { exact: true })).toBeVisible();
  await expect(page.getByText('DEMOSTRACIÓN · SOLO LECTURA')).toBeVisible();
  await expect(page.getByText('Versión demo · v1.0.0')).toBeVisible();

  await page.getByRole('button', { name: /Suscripciones/ }).click();
  await expect(page.getByRole('heading', { name: 'Suscripciones' })).toBeVisible();
  await expect(page.getByText('Control de accesos activos')).toBeVisible();

  await page.getByRole('button', { name: /Clientes/ }).click();
  await expect(page.getByRole('heading', { name: 'Clientes' })).toBeVisible();
  await expect(page.getByText('DIRECTORIO', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Cuentas \/ Cupos/ }).click();
  await expect(page.getByRole('heading', { name: 'Cuentas / Cupos' })).toBeVisible();
  await expect(page.getByText('Cuentas activas')).toBeVisible();

  await page.getByRole('button', { name: /Plataformas/ }).click();
  await expect(page.getByRole('heading', { name: 'Plataformas' })).toBeVisible();
  await expect(page.getByText('CATÁLOGO')).toBeVisible();

  await page.getByRole('button', { name: /Renovaciones/ }).click();
  await expect(page.getByRole('heading', { name: 'Renovaciones' })).toBeVisible();
  await expect(page.getByText('HISTORIAL RECIENTE')).toBeVisible();

  await expect(page.getByRole('link', { name: /Ingresar a mi panel/i })).toHaveAttribute('href', 'https://streaming.yummypro.online/panel/');
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
  expect(body).toContain('streaming-control.js?v=1000');
});

test('panel carga agenda una sola vez', async ({ request }) => {
  const response = await request.get('/panel/');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('Streaming · Versión v0.9.0');
  const matches=body.match(/\/panel\/streaming-agenda\.js\?v=0900/g)||[];
  expect(matches).toHaveLength(1);
});

test('centro de control Streaming v1.0.0 esta disponible y no exporta secretos', async ({ request }) => {
  const response = await request.get('/panel/streaming-control.js?v=1000');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('centro de control v1.0.0');
  expect(body).toContain('Centro de control');
  expect(body).toContain('Exportar CSV');
  expect(body).toContain('Respaldo JSON');
  expect(body).toContain('streamingControlResults');
  expect(body).toContain('streamingControlSafeSnapshot');
  expect(body).not.toContain('access_token');
  expect(body).not.toContain('client_secret');
});
