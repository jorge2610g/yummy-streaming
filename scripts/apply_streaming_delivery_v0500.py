from pathlib import Path

p=Path('panel/index.html')
s=p.read_text()
assert 'Streaming · Versión v0.4.0' in s
assert '/panel/streaming.js?v=0400' in s
s=s.replace('Streaming · Versión v0.4.0','Streaming · Versión v0.5.0')
s=s.replace('/panel/streaming.js?v=0400','/panel/streaming.js?v=0400"></script><script src="/panel/streaming-delivery.js?v=0500',1)
p.write_text(s)

p=Path('panel/demo.html')
s=p.read_text().replace('Versión demo · v0.4.0','Versión demo · v0.5.0')
s=s.replace('clientes, cupos, vencimientos y renovaciones','clientes, cupos, cobros, entregas, vencimientos y renovaciones')
p.write_text(s)

p=Path('tests/streaming-check.mjs')
s=p.read_text()
s=s.replace("const streaming = readFileSync('panel/streaming.js','utf8');","const streaming = readFileSync('panel/streaming.js','utf8');\nconst delivery = readFileSync('panel/streaming-delivery.js','utf8');")
s=s.replace('Streaming · Versión v0.4.0','Streaming · Versión v0.5.0')
s=s.replace("'/panel/streaming.js?v=0400'","'/panel/streaming.js?v=0400',\n  '/panel/streaming-delivery.js?v=0500'")
s=s.replace("if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v0.4.0')) throw new Error('Demo Streaming v0.3.1 incompleta');","if (!demo.includes('DEMOSTRACIÓN · SOLO LECTURA') || !demo.includes('Versión demo · v0.5.0')) throw new Error('Demo Streaming v0.5.0 incompleta');")
s=s.replace("console.log('Panel Streaming v0.4.0 validado con redirección raíz segura y confirmación de renovación por WhatsApp');","for (const marker of ['entrega y activación v0.5.0','delivery_status','delivered_at','streamingOpenDelivery','Por entregar','Avisar activación']) if (!delivery.includes(marker)) throw new Error(`panel/streaming-delivery.js: falta ${marker}`);\n\nconsole.log('Panel Streaming v0.5.0 validado con cobros, entrega/activación y WhatsApp');")
p.write_text(s)

p=Path('tests/streaming.spec.js')
s=p.read_text().replace('Versión demo · v0.3.1','Versión demo · v0.5.0')
p.write_text(s)

p=Path('package.json')
s=p.read_text().replace('"version":"0.3.1"','"version":"0.5.0"')
s=s.replace('node --check panel/streaming.js &&','node --check panel/streaming.js && node --check panel/streaming-delivery.js &&')
p.write_text(s)

p=Path('package-lock.json')
s=p.read_text().replace('"version": "0.4.0"','"version": "0.5.0"')
p.write_text(s)
