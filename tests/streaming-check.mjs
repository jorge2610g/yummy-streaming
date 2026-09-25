import {existsSync, readFileSync} from 'node:fs';

if (existsSync('index.html')) throw new Error('Streaming no debe contener una landing propia en index.html');

const panel = readFileSync('panel/index.html','utf8');
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
  'Ventas / Entregas',
  'Suscripciones',
  'Plataformas',
  'QR / Enlace',
  'Streaming · Versión v0.1.1',
  'create_my_trial_restaurant_v3',
  'manifest.webmanifest'
]) if (!panel.includes(marker)) throw new Error(`panel/index.html: falta ${marker}`);

const streamingMap = panel.match(/streaming:\{\s*restaurant:\[(.*?)\],\s*manager:/s)?.[1] || '';
for (const forbidden of ['pos','kitchen','cash','table_qr','appointments','services','professionals']) {
  if (streamingMap.includes(`"${forbidden}"`)) throw new Error(`Navegación Streaming aún expone ${forbidden}`);
}

if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v0.1.1')) throw new Error('Demo Streaming incompleta');
if (manifest.name !== 'YummyPro Streaming' || manifest.start_url !== '/panel/' || manifest.scope !== '/panel/') throw new Error('Manifest PWA Streaming incorrecto');
if (cname !== 'streaming.yummypro.online') throw new Error('CNAME Streaming incorrecto');

console.log('Panel Streaming v0.1.1 validado sin landing propia');
