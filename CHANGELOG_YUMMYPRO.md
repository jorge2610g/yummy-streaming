# Changelog YummyPro — Streaming

## 2026-09-28 — 1.2.16 — Pruebas

- Tras verificar DNS, el panel inicia el aprovisionamiento seguro del hostname y SSL en backend.
- Producción no fue modificada.

## 2026-09-27 — 1.2.15 — Pruebas

- Marca Blanca PLUS queda vinculada a la capacidad `white_label` del plan Streaming Pro, con bloqueo visual y validación de base de datos.
- Una baja de plan, suspensión o vencimiento deja de exponer Marca Blanca en el catálogo público.
- Streaming fuerza `delivery_enabled=false` y mantiene Delivery fuera de la configuración visible.
- Mercado Pago se oculta del selector cuando el país no lo admite; en países compatibles conserva el flujo de credenciales y verificación.
- El Dashboard Streaming usa accesos e iconos propios del nicho: Suscripciones, Clientes, Plataformas, Cuentas/Cupos y Renovaciones.
- El catálogo inicia con el footer YummyPro oculto hasta conocer la configuración del negocio, evitando el destello de marca al cargar White Label.
- La barra superior y el carrito comparten el mismo sistema visual y se añadió contraste automático para el color principal del negocio.
- Catálogo público actualizado a v1.3.7.
- Se versionaron las migraciones de Marca Blanca Pro y Streaming sin Delivery para poder promoverlas a Producción de forma controlada.
- Streaming ahora respeta los módulos de su plan: Básico, Standard y Pro dejan de compartir automáticamente todos los accesos; la prueba de 30 días mantiene las funciones operativas para evaluación, pero no incluye Marca Blanca PLUS.
- Producción no fue modificada.

## 2026-09-27 — 1.2.14 — Pruebas

- Streaming deja de mostrar Delivery en Configuración; los campos heredados quedan ocultos para mantener compatibilidad sin exponerlos al negocio.
- Se ajustaron textos de Marca para hablar del negocio/catálogo digital y no de restaurante.
- El catálogo público incorpora selector real de modo claro/oscuro con persistencia y respeto por la preferencia del sistema.
- La barra superior del catálogo unifica controles y el tema claro adapta tarjetas, formularios y modales.
- Producción no fue modificada.

## 2026-09-26 — 1.2.13 — Pruebas

- Se corrigió el modo claro/oscuro del panel Streaming.
- Las superficies auxiliares de Centro de control, Agenda, Centro de acciones y Recordatorios ya no caen al fondo negro por una variable de tema faltante.
- Se añadió la variable `--soft` para ambos temas y una prueba de regresión para evitar que vuelva a ocurrir.
- Producción no fue modificada.

## 2026-09-26 — 1.2.10 — Pruebas

- Se añadió el switch **Marca blanca / White Label** dentro de Marca/Apariencia.
- Al activarlo, la web pública oculta referencias visibles a YummyPro y conserva únicamente nombre, logo y colores del negocio.
- La opción queda marcada como **PLUS** para poder ofrecerla como adicional comercial.
- La configuración se guarda por negocio en `white_label_enabled`.
- Producción no fue modificada.

## 2026-09-25/26 — 1.2.9 — Pruebas

- Se corrigió el botón Ver catálogo en Pruebas para abrir /yummy-streaming-pruebas/catalogo y no una ruta raíz inexistente.
- El QR público de Streaming ahora apunta al catálogo del ambiente correcto.
- Los enlaces auxiliares a Cliente y Admin también respetan Pruebas/Producción.
- Se corrigieron manifest y service worker del catálogo para funcionar bajo el subdirectorio de GitHub Pages.
- Se copiaron a Staging las plataformas demo de Producción sin copiar cuentas ni credenciales.
- Producción no fue modificada.

## 2026-09-25/26 — 1.2.8 — Pruebas

- Se formalizó el flujo **Pruebas → Release → Producción**.
- Se prohibieron cambios directos en `main` durante el desarrollo normal.
- Se documentó separación de Supabase entre Pruebas y Producción.
- Se añadió selección segura del backend por hostname: Producción usa `gulctljitzlwokqydigx`; Pruebas usa `wodqqheeesrelsbacmgx`.
- Se reforzó el control de versión y la obligación de documentar cambios.
- Este cambio permanece en `staging` hasta que el propietario autorice el próximo release.

### Nota operativa
El primer release permitió validar el mecanismo de promoción. La revisión posterior detectó que el código promovido conservaba el endpoint de Supabase Staging. La corrección de enrutamiento por ambiente se hizo únicamente en Pruebas y deberá llegar a Producción mediante un release explícito.
