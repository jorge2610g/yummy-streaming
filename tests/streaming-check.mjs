// Validación final YummyPro Streaming v1.0.0
import {existsSync, readFileSync} from 'node:fs';

if (!existsSync('index.html')) throw new Error('Streaming debe tener una portada raíz mínima que redirija a la demo');
const rootIndex = readFileSync('index.html','utf8');
if (!rootIndex.includes("location.replace('/panel/demo.html')") || !rootIndex.includes('noindex,nofollow')) throw new Error('index.html raíz debe redirigir únicamente a la demo pública');
if (/location\.replace\('\/panel\/'\)|href="\/panel\/"|Landing comercial|Planes y precios|Mercado Pago|restaurante\/manager\/editor/i.test(rootIndex)) throw new Error('index.html raíz expone el panel real, documentación o contenido heredado');

const panel = readFileSync('panel/index.html','utf8');
const streaming = readFileSync('panel/streaming.js','utf8');
const delivery = readFileSync('panel/streaming-delivery.js','utf8');
const reminders = readFileSync('panel/streaming-reminders.js','utf8');
const agenda = readFileSync('panel/streaming-agenda.js','utf8');
const control = readFileSync('panel/streaming-control.js','utf8');
const demo = readFileSync('panel/demo.html','utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest','utf8'));
const cname = readFileSync('CNAME','utf8').trim();

for (const [file,html] of [['panel/index.html',panel],['panel/demo.html',demo]]) {
  if (!/<!doctype html>/i.test(html) || !/<\/html>/i.test(html)) throw new Error(`${file}: HTML incompleto`);
}

for (const marker of [
  'YummyPro Streaming','isStreamingBusiness()','streaming:{','streaming_subscriptions','streaming_customers','streaming_accounts','streaming_platforms','streaming_renewals','QR / Enlace','Streaming · Versión v0.9.0','create_my_trial_restaurant_v3','manifest.webmanifest','/panel/streaming.js?v=0400','/panel/streaming-delivery.js?v=0600','/panel/streaming-reminders.js?v=0800','/panel/streaming-agenda.js?v=0900'
]) if (!panel.includes(marker)) throw new Error(`panel/index.html: falta ${marker}`);
const reminderScriptCount=(panel.match(/\/panel\/streaming-reminders\.js\?v=0800/g)||[]).length;
if(reminderScriptCount!==1) throw new Error(`panel/index.html debe cargar streaming-reminders.js exactamente una vez; encontró ${reminderScriptCount}`);
const agendaScriptCount=(panel.match(/\/panel\/streaming-agenda\.js\?v=0900/g)||[]).length;
if(agendaScriptCount!==1) throw new Error(`panel/index.html debe cargar streaming-agenda.js exactamente una vez; encontró ${agendaScriptCount}`);

for (const marker of ['núcleo operativo v0.4.0','Suscripciones de clientes','Directorio de clientes','Cuentas y cupos','Plataformas','Renovaciones','streamingOpenSubscription','streamingOpenCustomer','streamingOpenAccount','streamingOpenPlatform','streaming_renew_subscription','YummyPro no guarda contraseñas','Sin cupos · asignación actual','Próx. 3 días','te escribo para recordarte que tu suscripción','WhatsApp confirmación','tu renovación de','Control de cobros v0.4.0','streamingOpenPayment','payment_status','Pendientes de cobro']) if (!streaming.includes(marker)) throw new Error(`panel/streaming.js: falta ${marker}`);
for (const marker of ['selectedId=Number(selected)||null','return isSelected||(a.active&&free>0)']) if (!streaming.includes(marker)) throw new Error(`Filtro de cupos incompleto: falta ${marker}`);

const streamingMap = panel.match(/streaming:\{\s*restaurant:\[(.*?)\],\s*manager:/s)?.[1] || '';
for (const required of ['streaming_subscriptions','streaming_customers','streaming_accounts','streaming_platforms','streaming_renewals']) if (!streamingMap.includes(`"${required}"`)) throw new Error(`Navegación Streaming no incluye ${required}`);
for (const forbidden of ['orders','products','categories','pos','kitchen','cash','table_qr','appointments','services','professionals']) if (streamingMap.includes(`"${forbidden}"`)) throw new Error(`Navegación Streaming aún expone ${forbidden}`);

if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v0.5.0')) throw new Error('Demo Streaming v0.5.0 incompleta');
for (const marker of ['Suscripciones','Clientes','Cuentas / Cupos','Plataformas','Renovaciones']) if (!demo.includes(marker)) throw new Error(`Demo Streaming: falta ${marker}`);
for (const forbidden of ['supabase-js','SB_URL','streamingOpenSubscription','streamingOpenPayment','href="/panel/"',"location.replace('/panel/')"]) if (demo.includes(forbidden)) throw new Error(`Demo Streaming no está aislada del panel real: ${forbidden}`);
if (manifest.name !== 'YummyPro Streaming' || manifest.start_url !== '/panel/' || manifest.scope !== '/panel/') throw new Error('Manifest PWA Streaming incorrecto');
if (cname !== 'streaming.yummypro.online') throw new Error('CNAME Streaming incorrecto');

for (const marker of ['entrega, activación y centro de acciones v0.6.0','delivery_status','delivered_at','streamingOpenDelivery','Por entregar','Avisar activación','streamingActionCenter','Centro de acciones','Cobros pendientes','Entregas pendientes','Vencen en 3 días','Suscripciones vencidas',"streamingActionFilter('payment_pending')","streamingActionFilter('delivery_pending')"]) if (!delivery.includes(marker)) throw new Error(`panel/streaming-delivery.js: falta ${marker}`);

for (const marker of ['recordatorios persistentes v0.8.0','streaming_reminder_logs','streamingLoadReminderLogs','streamingReminderOpenedToday','streamingReminderWhatsApp','streamingReminderOpenNext','Recordatorios automáticos','WhatsApp · siguiente','Gestionado hoy','historial queda sincronizado entre dispositivos']) if (!reminders.includes(marker)) throw new Error(`panel/streaming-reminders.js: falta ${marker}`);
for (const forbidden of ['localStorage','Enviado hoy']) if (reminders.includes(forbidden)) throw new Error(`panel/streaming-reminders.js conserva estado local o etiqueta engañosa: ${forbidden}`);
for (const marker of ['agenda diaria v0.9.0','Agenda de hoy','Gestionar siguiente','Avance','streamingAgendaPending','streamingAgendaRefresh','streamingReminderOpenNext','streaming-control.js?v=1000','Streaming · Versión v1.0.0']) if (!agenda.includes(marker)) throw new Error(`panel/streaming-agenda.js: falta ${marker}`);

for (const marker of ['centro de control v1.0.0','Centro de control','Exportar CSV','Respaldo JSON','streamingControlSafeSnapshot','streamingControlResults','streamingControlExportBackup','streamingControlExportCsv','no incluyen contraseñas']) if (!control.includes(marker)) throw new Error(`panel/streaming-control.js: falta ${marker}`);
for (const forbidden of ['password','access_token','refresh_token','client_secret']) if (control.includes(forbidden)) throw new Error(`panel/streaming-control.js contiene un campo sensible prohibido: ${forbidden}`);

console.log('Panel Streaming v1.0.0 validado con centro de control, agenda diaria, recordatorios persistentes y demo aislada');
