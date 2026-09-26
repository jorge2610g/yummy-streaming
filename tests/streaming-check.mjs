// Validación final YummyPro Streaming v1.2.3
import {existsSync, readFileSync} from 'node:fs';
import {Script} from 'node:vm';

if (!existsSync('index.html')) throw new Error('Streaming debe tener una portada raíz mínima que redirija a la demo');
const rootIndex = readFileSync('index.html','utf8');
if (!rootIndex.includes('new URL("demo/",location.href)') || !rootIndex.includes('noindex,nofollow')) throw new Error('index.html raíz debe redirigir únicamente a la tienda demo pública con ruta relativa');
if (/location\.replace\('\/panel\/'\)|href="\/panel\/"|Landing comercial|Planes y precios|Mercado Pago|restaurante\/manager\/editor/i.test(rootIndex)) throw new Error('index.html raíz expone el panel real, documentación o contenido heredado');

const panel = readFileSync('panel/index.html','utf8');
const streaming = readFileSync('panel/streaming.js','utf8');
const delivery = readFileSync('panel/streaming-delivery.js','utf8');
const reminders = readFileSync('panel/streaming-reminders.js','utf8');
const agenda = readFileSync('panel/streaming-agenda.js','utf8');
const control = readFileSync('panel/streaming-control.js','utf8');
const adminTools = readFileSync('panel/streaming-admin-tools.js','utf8');
const demo = readFileSync('panel/demo.html','utf8');
const storeDemo = readFileSync('demo/index.html','utf8');
const catalog = readFileSync('catalogo/index.html','utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest','utf8'));
const catalogManifest = JSON.parse(readFileSync('catalogo/manifest.webmanifest','utf8'));
const catalogSw = readFileSync('catalogo/sw.js','utf8');
const cname = readFileSync('CNAME','utf8').trim();

const panelInlineScripts=[...panel.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m=>!/\bsrc\s*=/i.test(m[1]||'')&&!/application\/ld\+json/i.test(m[1]||''));
for (const [index,match] of panelInlineScripts.entries()) {
  try { new Script(match[2],{filename:`panel-inline-${index+1}.js`}); }
  catch (error) { throw new Error(`panel/index.html contiene JavaScript inline inválido: ${error.message}`); }
}

try { new Script(adminTools,{filename:'panel/streaming-admin-tools.js'}); } catch (error) { throw new Error(`streaming-admin-tools.js inválido: ${error.message}`); }

for (const [file,html] of [['panel/index.html',panel],['panel/demo.html',demo],['demo/index.html',storeDemo],['catalogo/index.html',catalog]]) {
  if (!/<!doctype html>/i.test(html) || !/<\/html>/i.test(html)) throw new Error(`${file}: HTML incompleto`);
}

for (const marker of [
  'YummyPro Streaming','isStreamingBusiness()','streaming:{','streaming_subscriptions','streaming_customers','streaming_accounts','streaming_platforms','streaming_renewals','QR / Enlace','Streaming · Versión v1.2.12','create_my_trial_restaurant_v3','manifest.webmanifest','/panel/streaming.js?v=1201','/panel/streaming-admin-tools.js?v=1200','/panel/streaming-delivery.js?v=0600','/panel/streaming-reminders.js?v=0800','/panel/streaming-agenda.js?v=0900'
]) if (!panel.includes(marker)) throw new Error(`panel/index.html: falta ${marker}`);
const reminderScriptCount=(panel.match(/\/panel\/streaming-reminders\.js\?v=0800/g)||[]).length;
if(reminderScriptCount!==1) throw new Error(`panel/index.html debe cargar streaming-reminders.js exactamente una vez; encontró ${reminderScriptCount}`);
const agendaScriptCount=(panel.match(/\/panel\/streaming-agenda\.js\?v=0900/g)||[]).length;
if(agendaScriptCount!==1) throw new Error(`panel/index.html debe cargar streaming-agenda.js exactamente una vez; encontró ${agendaScriptCount}`);

for (const marker of ['núcleo operativo v0.4.1','Suscripciones de clientes','Directorio de clientes','Cuentas y cupos','Plataformas','Renovaciones','streamingOpenSubscription','streamingOpenCustomer','streamingOpenAccount','streamingOpenPlatform','streaming_renew_subscription','YummyPro no guarda contraseñas','Sin cupos · asignación actual','Próx. 3 días','te escribo para recordarte que tu suscripción','WhatsApp confirmación','tu renovación de','Control de cobros v0.4.0','streamingOpenPayment','payment_status','Pendientes de cobro']) if (!streaming.includes(marker)) throw new Error(`panel/streaming.js: falta ${marker}`);
for (const marker of ['selectedId=Number(selected)||null','return isSelected||(a.active&&free>0)']) if (!streaming.includes(marker)) throw new Error(`Filtro de cupos incompleto: falta ${marker}`);
if (!streaming.includes('if(adminPreviewMode)return true')) throw new Error('panel/streaming.js debe permitir escritura al superadministrador en negocios demo');
for (const marker of ['herramientas de administración v1.2.0','YUMMY_STREAMING_CATALOG_BASE','Ver catálogo','openStreamingAdminPlanEditor','saveStreamingAdminPlanEditor','subscription_plans','is_default_trial','annual_bonus_months']) if (!adminTools.includes(marker)) throw new Error(`streaming-admin-tools.js: falta ${marker}`);
for (const forbidden of ['password','access_token','refresh_token','client_secret']) if (adminTools.includes(forbidden)) throw new Error(`streaming-admin-tools.js contiene secreto/campo sensible prohibido: ${forbidden}`);

const streamingMap = panel.match(/streaming:\{\s*restaurant:\[(.*?)\],\s*manager:/s)?.[1] || '';
for (const required of ['streaming_subscriptions','streaming_customers','streaming_accounts','streaming_platforms','streaming_renewals']) if (!streamingMap.includes(`"${required}"`)) throw new Error(`Navegación Streaming no incluye ${required}`);
for (const forbidden of ['orders','products','categories','pos','kitchen','cash','table_qr','appointments','services','professionals']) if (streamingMap.includes(`"${forbidden}"`)) throw new Error(`Navegación Streaming aún expone ${forbidden}`);

if (!storeDemo.includes('STREAMING · ENTRETENIMIENTO') || !storeDemo.includes('Powered by YummyPro · v1.1.5')) throw new Error('Tienda demo Streaming v1.1.5 incompleta');
for (const marker of ['Servicios disponibles','Netflix Premium','Disney+ Premium','Prime Video','Spotify Premium','Comprar','Finalizar pedido','Iniciar sesión','Mis cuentas','whatsappBtn','themeBtn']) if (!storeDemo.includes(marker)) throw new Error(`Tienda Streaming: falta ${marker}`);
for (const forbidden of ['Panel Streaming','DEMOSTRACIÓN · SOLO LECTURA','DEMOSTRACIÓN DEL NEGOCIO','TIENDA DEMO','Demo comercial','Precio demo','Finalizar pedido demo','No se realizará ningún cobro real.','streamingOpenSubscription','streamingOpenPayment','supabase-js','SB_URL']) if (storeDemo.includes(forbidden)) throw new Error(`Tienda Streaming expone texto demo, panel o integración interna: ${forbidden}`);

for (const marker of ['streaming_public_catalog','CATÁLOGO DE STREAMING','sale_price','free_slots','Powered by YummyPro · Streaming tienda v1.3.4']) if (!catalog.includes(marker)) throw new Error(`catalogo/index.html: falta ${marker}`);
for (const marker of ['Carrito','Iniciar sesión','Mis pedidos','Mis accesos','create-streaming-payment','streaming_create_order','Seguimiento del pedido','Recordatorios de renovación','Esta es una cuenta demo','effective_demo','./manifest.webmanifest','navigator.serviceWorker.register("./sw.js"']) if (!catalog.includes(marker)) throw new Error(`catalogo/index.html: falta flujo cliente ${marker}`);
for (const marker of ['streamingPreviewCatalog','Previsualizar catálogo','streamingPlatformPrice','sale_price']) if (!streaming.includes(marker)) throw new Error(`panel/streaming.js: falta vista previa de catálogo ${marker}`);

if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v1.0.0')) throw new Error('Demo Streaming v1.0.0 incompleta');
for (const marker of ['data-section="dashboard"','data-section="subscriptions"','data-section="customers"','data-section="accounts"','data-section="platforms"','data-section="renewals"','Ingresar a mi panel','https://streaming.yummypro.online/panel/','Crear cuenta · 30 días gratis']) if (!demo.includes(marker)) throw new Error(`Demo Streaming navegable: falta ${marker}`);
for (const forbidden of ['supabase-js','SB_URL','streamingOpenSubscription','streamingOpenPayment','href="/panel/"',"location.replace('/panel/')"]) if (demo.includes(forbidden)) throw new Error(`Demo Streaming no está aislada del panel real: ${forbidden}`);
if (manifest.name !== 'YummyPro Streaming' || manifest.start_url !== '/panel/' || manifest.scope !== '/panel/') throw new Error('Manifest PWA Streaming incorrecto');
if (catalogManifest.start_url !== './?source=pwa' || catalogManifest.scope !== './') throw new Error('Manifest PWA catálogo Streaming incorrecto');
if (!catalogSw.includes('yummypro-streaming-catalog-v134-white-label')) throw new Error('Service worker catálogo Streaming v1.3.0 incorrecto');
if (cname !== 'streaming.yummypro.online') throw new Error('CNAME Streaming incorrecto');

for (const marker of ['entrega, activación y centro de acciones v0.6.0','delivery_status','delivered_at','streamingOpenDelivery','Por entregar','Avisar activación','streamingActionCenter','Centro de acciones','Cobros pendientes','Entregas pendientes','Vencen en 3 días','Suscripciones vencidas',"streamingActionFilter('payment_pending')","streamingActionFilter('delivery_pending')"]) if (!delivery.includes(marker)) throw new Error(`panel/streaming-delivery.js: falta ${marker}`);

for (const marker of ['recordatorios persistentes v0.8.0','streaming_reminder_logs','streamingLoadReminderLogs','streamingReminderOpenedToday','streamingReminderWhatsApp','streamingReminderOpenNext','Recordatorios automáticos','WhatsApp · siguiente','Gestionado hoy','historial queda sincronizado entre dispositivos']) if (!reminders.includes(marker)) throw new Error(`panel/streaming-reminders.js: falta ${marker}`);
for (const forbidden of ['localStorage','Enviado hoy']) if (reminders.includes(forbidden)) throw new Error(`panel/streaming-reminders.js conserva estado local o etiqueta engañosa: ${forbidden}`);
for (const marker of ['agenda diaria v0.9.0','Agenda de hoy','Gestionar siguiente','Avance','streamingAgendaPending','streamingAgendaRefresh','streamingReminderOpenNext','streaming-control.js?v=1000','Streaming · Versión v1.2.12']) if (!agenda.includes(marker)) throw new Error(`panel/streaming-agenda.js: falta ${marker}`);

for (const marker of ['centro de control v1.0.0','Centro de control','Exportar CSV','Respaldo JSON','streamingControlSafeSnapshot','streamingControlResults','streamingControlExportBackup','streamingControlExportCsv','no incluyen contraseñas']) if (!control.includes(marker)) throw new Error(`panel/streaming-control.js: falta ${marker}`);
for (const forbidden of ['password','access_token','refresh_token','client_secret']) if (control.includes(forbidden)) throw new Error(`panel/streaming-control.js contiene un campo sensible prohibido: ${forbidden}`);

console.log('Streaming v1.2.0 validado con tienda cliente limpia, panel operativo y demo administrativa aislada');

for(const marker of ['clearAdminPreviewSessionHash','adminPreviewTimed','La verificación del negocio','El negocio #','ya no existe','maybeSingle()'])if(!panel.includes(marker))throw new Error('panel/index.html: falta hotfix de vista administrativa '+marker);

for(const marker of ['yummypro_streaming_client_auth_v1','activate_admin_client_preview','has_admin_client_preview','admin_client_token_hash','Admin prueba'])if(!catalog.includes(marker))throw new Error('catalogo/index.html: falta sesión automática de administrador '+marker);

const root=readFileSync('index.html','utf8');
for(const marker of ['new URL("demo/",location.href)','href="./demo/"'])if(!root.includes(marker))throw new Error('index.html: falta ruta relativa GitHub Pages '+marker);
if(root.includes('url=/demo/'))throw new Error('index.html: redirect absoluto /demo/ rompe GitHub Pages');

for (const marker of ['YUMMY_STREAMING_CATALOG_BASE','yummy-streaming-pruebas/catalogo','YUMMY_CLIENT_BASE','YUMMY_ADMIN_BASE']) if (!panel.includes(marker)) throw new Error(`panel/index.html: falta ruta de Pruebas ${marker}`);
for (const marker of ['./manifest.webmanifest','../icon-192.png','navigator.serviceWorker.register("./sw.js"']) if (!catalog.includes(marker)) throw new Error(`catalogo/index.html: falta ruta GitHub Pages ${marker}`);

for(const marker of ['id="swhiteLabel"','white_label_enabled','Marca blanca','PLUS'])if(!panel.includes(marker))throw new Error('panel/index.html: falta Marca blanca '+marker);
