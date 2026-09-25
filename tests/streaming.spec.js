// Validación E2E final YummyPro Streaming v1.2.3
const { test, expect } = require('@playwright/test');

test('tienda Streaming muestra la experiencia de compra del cliente sin etiquetas demo', async ({ page }) => {
  await page.goto('/demo/');
  await expect(page).toHaveTitle(/YummyPlay · Streaming/);
  await expect(page.getByText('STREAMING · ENTRETENIMIENTO')).toBeVisible();
  await expect(page.getByText('Powered by YummyPro · v1.1.5')).toBeVisible();
  await expect(page.getByText(/TIENDA DEMO|Demo comercial|DEMOSTRACIÓN DEL NEGOCIO/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Tus plataformas favoritas/ })).toBeVisible();
  await expect(page.getByText('Servicios disponibles')).toBeVisible();
  await expect(page.getByText('Netflix Premium', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Comprar' }).first().click();
  await expect(page.getByRole('heading', { name: 'Completa tu pedido', exact: true })).toBeVisible();
  await page.locator('#buyerName').fill('Cliente Demo');
  await page.locator('#buyerPhone').fill('+56 9 1111 2222');
  await page.getByRole('button', { name: 'Finalizar pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Pedido recibido' })).toBeVisible();
});

test('raíz Streaming redirige a la tienda demo comercial', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/demo\/$/);
});

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
  expect(body).toContain('Streaming · Versión v1.2.7');
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
  expect(body).toContain('Streaming · Versión v1.2.7');
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


test('vista administrativa valida negocio y tiene timeout de arranque', async ({ request }) => {
  const response = await request.get('/panel/');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('adminPreviewTimed');
  expect(body).toContain('clearAdminPreviewSessionHash');
  expect(body).toContain('La verificación del negocio');
  expect(body).toContain('ya no existe');
  expect(body).toContain('maybeSingle()');
});


test('catálogo real Streaming y preview están publicados', async ({ request }) => {
  const catalog = await request.get('/catalogo/?business=14');
  expect(catalog.ok()).toBeTruthy();
  const catalogBody = await catalog.text();
  expect(catalogBody).toContain('streaming_public_catalog');
  expect(catalogBody).toContain('CATÁLOGO DE STREAMING');
  expect(catalogBody).toContain('Powered by YummyPro · Streaming tienda v1.3.2');
  expect(catalogBody).toContain('streaming_create_order');
  expect(catalogBody).toContain('create-streaming-payment');
  expect(catalogBody).toContain('Mis pedidos');
  expect(catalogBody).toContain('Mis accesos');
  expect(catalogBody).toContain('Esta es una cuenta demo');
  expect(catalogBody).toContain('effective_demo');

  const module = await request.get('/panel/streaming.js?v=1140');
  expect(module.ok()).toBeTruthy();
  const moduleBody = await module.text();
  expect(moduleBody).toContain('Previsualizar catálogo');
  expect(moduleBody).toContain('streamingPreviewCatalog');
  expect(moduleBody).toContain('streamingPlatformPrice');
  expect(moduleBody).toContain('sale_price');
});


test('panel publica catálogo global y herramientas administrativas v1.2.0', async ({ request }) => {
  const panelResponse = await request.get('/panel/');
  expect(panelResponse.ok()).toBeTruthy();
  const panel = await panelResponse.text();
  expect(panel).toContain('Streaming · Versión v1.2.7');
  expect(panel).toContain('/panel/streaming.js?v=1200');
  expect(panel).toContain('/panel/streaming-admin-tools.js?v=1200');

  const toolsResponse = await request.get('/panel/streaming-admin-tools.js?v=1200');
  expect(toolsResponse.ok()).toBeTruthy();
  const adminTools = await toolsResponse.text();
  expect(adminTools).toContain('/catalogo/?business=');
  expect(adminTools).toContain('Ver catálogo');
  expect(adminTools).toContain('openStreamingAdminPlanEditor');
  expect(adminTools).toContain('saveStreamingAdminPlanEditor');
  expect(adminTools).toContain('is_default_trial');

  const coreResponse = await request.get('/panel/streaming.js?v=1200');
  expect(coreResponse.ok()).toBeTruthy();
  const core = await coreResponse.text();
  expect(core).toContain('if(adminPreviewMode)return true');

  const catalogResponse = await request.get('/catalogo/?business=14');
  expect(catalogResponse.ok()).toBeTruthy();
  const catalog = await catalogResponse.text();
  expect(catalog).toContain('streaming_public_catalog');
  expect(catalog).toContain('CATÁLOGO DE STREAMING');
  expect(catalog).toContain('Powered by YummyPro · Streaming tienda v1.3.2');
  expect(catalog).toContain('streaming_create_order');
  expect(catalog).toContain('create-streaming-payment');
  expect(catalog).toContain('Mis pedidos');
});


test('catálogo Streaming tiene PWA cliente propia', async ({ request }) => {
  const response = await request.get('/catalogo/manifest.webmanifest');
  expect(response.ok()).toBeTruthy();
  const manifest = await response.json();
  expect(manifest.start_url).toBe('/catalogo/?source=pwa');
  expect(manifest.scope).toBe('/catalogo/');
});


test('panel Streaming acepta ticket administrativo aislado', async ({ request }) => {
  const response = await request.get('/panel/');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('admin_token_hash');
  expect(body).toContain('verifyOtp({token_hash:payload.token_hash,type:"email"})');
});


test('catálogo Streaming soporta sesión admin automática aislada', async ({ request }) => {
  const response=await request.get('/catalogo/?business=14');
  expect(response.ok()).toBeTruthy();
  const body=await response.text();
  expect(body).toContain('yummypro_streaming_client_auth_v1');
  expect(body).toContain('activate_admin_client_preview');
  expect(body).toContain('admin_client_token_hash');
  expect(body).toContain('Admin prueba');
});
