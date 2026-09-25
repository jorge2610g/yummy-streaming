# YummyPro Streaming

Base inicial derivada del módulo Restaurante.

## Objetivo
- Catálogo de servicios/plataformas
- Clientes
- Pedidos
- Inventario/disponibilidad
- Fechas de inicio y vencimiento
- Renovaciones y alertas
- WhatsApp
- PWA, modo oscuro, notificaciones y versión visible

## Estado de la copia
La estructura base de `yummy-restaurante` ya está copiada en `yummy-streaming`.
Se mantiene fuera el `CNAME` del módulo Restaurante para no enlazar accidentalmente el nuevo repositorio al dominio anterior.
También se completó `.github/workflows/quality.yml`, que faltaba en la primera copia.

## Conservar y adaptar
- Dashboard
- Pedidos/ventas
- Productos y categorías, transformándolos en plataformas/planes
- Usuarios/clientes
- Planes y suscripciones de YummyPro
- Configuración del negocio
- QR general del negocio
- PWA, tema oscuro y notificaciones
- Autenticación y permisos base

## Eliminar progresivamente
- Meseros / POS
- Cocina
- QR de Mesa
- Delivery/repartidores
- Comandas e impresión de cocina
- Reservas/citas profesionales
- Roles `kitchen`, `waiter` y `courier`
- Lógica específica de mesas y flujo de preparación de alimentos
- Funciones de análisis de foto de restaurante que no sean reutilizadas

## Regla de limpieza
No eliminar código compartido de autenticación, suscripciones, navegación o configuración hasta verificar sus dependencias. Primero se quita la interfaz del módulo; luego se limpia la lógica y finalmente las funciones/archivos sin referencias.

## Versión inicial del módulo
v0.1.0

El panel heredado todavía muestra temporalmente la versión de Restaurante (`v2.5.64`) hasta el primer corte funcional de Streaming; en ese corte se cambiará a la serie propia `v0.1.x`.
