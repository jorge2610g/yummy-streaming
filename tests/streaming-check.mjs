import {existsSync, readFileSync} from 'node:fs';

if (existsSync('index.html')) throw new Error('Streaming no debe contener una landing propia en index.html');

const panel = readFileSync('panel/index.html','utf8');
const streaming = readFileSync('panel/streaming.js','utf8');
const demo = readFileSync('panel/demo.html','utf8');
const manifest = JSON.parse(readFileSync('manifest.webmanifest','utf8'));
const cname = readFileSync('CNAME','utf8').trim();

for (const [file,html] of [['panel/index.html',panel],['panel/demo.html',demo]]) {
  if (!/<!doctype html>/i.test(html) || !/<\/html>/i.test(html)) throw new Error(`${file}: HTML incompleto`);
}

for (const marker of [
  'YummyPro Streaming',
  'isStreamingBusiness()',
  'streaming:{',
  'streaming_subscriptions',
  'streaming_customers',
  'streaming_accounts',
  'streaming_platforms',
  'streaming_renewals',
  'QR / Enlace',
  'Streaming · Versión v0.3.1',
  'create_my_trial_restaurant_v3',
  'manifest.webmanifest',
  '/panel/streaming.js?v=0301'
]) if (!panel.includes(marker)) throw new Error(`panel/index.html: falta ${marker}`);

for (const marker of [
  'núcleo operativo v0.3.1',
  'Suscripciones de clientes',
  'Directorio de clientes',
  'Cuentas y cupos',
  'Plataformas',
  'Renovaciones',
  'streamingOpenSubscription',
  'streamingOpenCustomer',
  'streamingOpenAccount',
  'streamingOpenPlatform',
  'streaming_renew_subscription',
  'YummyPro no guarda contraseñas',
  'Sin cupos · asignación actual',
  'Próx. 3 días',
  'te escribo para recordarte que tu suscripción',
  'WhatsApp confirmación',
  'tu renovación de'
]) if (!streaming.includes(marker)) throw new Error(`panel/streaming.js: falta ${marker}`);

for (const marker of [
  'selectedId=Number(selected)||null',
  'return isSelected||(a.active&&free>0)'
]) if (!streaming.includes(marker)) throw new Error(`Filtro de cupos incompleto: falta ${marker}`);

const streamingMap = panel.match(/streaming:\{\s*restaurant:\[(.*?)\],\s*manager:/s)?.[1] || '';
for (const required of ['streaming_subscriptions','streaming_customers','streaming_accounts','streaming_platforms','streaming_renewals']) {
  if (!streamingMap.includes(`"${required}"`)) throw new Error(`Navegación Streaming no incluye ${required}`);
}
for (const forbidden of ['orders','products','categories','pos','kitchen','cash','table_qr','appointments','services','professionals']) {
  if (streamingMap.includes(`"${forbidden}"`)) throw new Error(`Navegación Streaming aún expone ${forbidden}`);
}

if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v0.3.1')) throw new Error('Demo Streaming v0.3.0 incompleta');
for (const marker of ['Suscripciones','Clientes','Cuentas / Cupos','Plataformas','Renovaciones']) {
  if (!demo.includes(marker)) throw new Error(`Demo Streaming: falta ${marker}`);
}
if (manifest.name !== 'YummyPro Streaming' || manifest.start_url !== '/panel/' || manifest.scope !== '/panel/') throw new Error('Manifest PWA Streaming incorrecto');
if (cname !== 'streaming.yummypro.online') throw new Error('CNAME Streaming incorrecto');

console.log('Panel Streaming v0.3.1 validado con confirmación de renovación por WhatsApp');
