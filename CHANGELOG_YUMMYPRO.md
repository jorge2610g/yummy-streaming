# Changelog YummyPro — Streaming

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
