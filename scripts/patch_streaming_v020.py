from pathlib import Path
import re

p=Path('panel/index.html')
s=p.read_text(encoding='utf-8')

def rep(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'No se encontró ancla: {label}')
    s=s.replace(old,new,1)

def reg(pattern,repl,label):
    global s
    s2,n=re.subn(pattern,repl,s,count=1,flags=re.S)
    if n!=1:
        raise SystemExit(f'No se encontró patrón: {label} ({n})')
    s=s2

rep('<script src="/panel/professional.js?v=2532"></script>',
    '<script src="/panel/professional.js?v=2532"></script>\n<script src="/panel/streaming.js?v=0200"></script>',
    'carga streaming.js')
rep('const PANEL_ALLOWED_BUSINESS_TYPES=["restaurant"];','const PANEL_ALLOWED_BUSINESS_TYPES=["streaming"];','business types permitidos')
rep('const PANEL_DEFAULT_BUSINESS_TYPE="restaurant";','const PANEL_DEFAULT_BUSINESS_TYPE="streaming";','business type por defecto')
rep('function panelBusinessTypeLabel(type){return type==="restaurant"?"Streaming":type==="supermarket"?"Supermercado":type==="minimarket"?"Minimarket / Tienda":type==="professional"?"Profesional / Servicios":"Negocio"}',
    'function panelBusinessTypeLabel(type){return type==="streaming"?"Streaming":type==="restaurant"?"Restaurante":type==="supermarket"?"Supermercado":type==="minimarket"?"Minimarket / Tienda":type==="professional"?"Profesional / Servicios":"Negocio"}',
    'etiqueta de vertical')

reg(r''' streaming:\{\n  restaurant:\["dashboard","orders","products","categories","qr","plans","settings"\],\n  manager:\["dashboard","orders","products","categories","qr","settings"\],\n  editor:\["orders","products","categories"\]\n \}''',
''' streaming:{
  restaurant:["dashboard","streaming_subscriptions","streaming_customers","streaming_accounts","streaming_platforms","streaming_renewals","qr","plans","settings"],
  manager:["dashboard","streaming_subscriptions","streaming_customers","streaming_accounts","streaming_platforms","streaming_renewals","qr","settings"],
  editor:["streaming_subscriptions","streaming_customers","streaming_accounts","streaming_platforms","streaming_renewals"]
 }''','mapa de pestañas Streaming')

rep('if(currentBusinessIsDemo())return [...raw];\n if(currentRole!=="restaurant"&&currentRole!=="manager")return raw;',
    'if(currentBusinessIsDemo())return [...raw];\n if(businessKey==="streaming")return [...raw];\n if(currentRole!=="restaurant"&&currentRole!=="manager")return raw;',
    'acceso de módulos Streaming')

rep('function applyRoleAccess(){\n const allowed=effectiveTabs(),tabs=[...document.querySelectorAll(".tab")],activeTab=document.querySelector(".tab.active")?.dataset.tab;',
    'function applyRoleAccess(){\n document.body.classList.toggle("streaming-business",isStreamingBusiness());\n const allowed=effectiveTabs(),tabs=[...document.querySelectorAll(".tab")],activeTab=document.querySelector(".tab.active")?.dataset.tab;',
    'clase visual Streaming')

reg(r''' if\(isStreamingBusiness\(\)\)\{\n  setNavTabLabel\("orders","Ventas / Entregas","Ventas / Entregas"\);\n  setNavTabLabel\("products","Suscripciones","Suscripciones"\);\n  setNavTabLabel\("categories","Plataformas","Plataformas"\);\n  setNavTabLabel\("qr","QR / Enlace","QR / Enlace"\);\n \}''',
''' if(isStreamingBusiness()){
  setNavTabLabel("qr","QR / Enlace","QR / Enlace");
 }''','renombrado heredado')

rep('else if(b.dataset.tab==="orders")await loadOrders();',
    'else if(b.dataset.tab==="streaming_subscriptions")await loadStreamingSubscriptions();else if(b.dataset.tab==="streaming_customers")await loadStreamingCustomers();else if(b.dataset.tab==="streaming_accounts")await loadStreamingAccounts();else if(b.dataset.tab==="streaming_platforms")await loadStreamingPlatforms();else if(b.dataset.tab==="streaming_renewals")await loadStreamingRenewals();else if(b.dataset.tab==="orders")await loadOrders();',
    'carga de pestañas Streaming')

rep('reports:()=>Promise.allSettled([loadRestaurants(),loadProfessionalAppointments()]),orders:()=>Promise.allSettled([loadRestaurants(),loadOrders()])',
    'reports:()=>Promise.allSettled([loadRestaurants(),loadProfessionalAppointments()]),streaming_subscriptions:()=>Promise.allSettled([loadRestaurants(),loadStreamingSubscriptions()]),streaming_customers:()=>Promise.allSettled([loadRestaurants(),loadStreamingCustomers()]),streaming_accounts:()=>Promise.allSettled([loadRestaurants(),loadStreamingAccounts()]),streaming_platforms:()=>Promise.allSettled([loadRestaurants(),loadStreamingPlatforms()]),streaming_renewals:()=>Promise.allSettled([loadRestaurants(),loadStreamingRenewals()]),orders:()=>Promise.allSettled([loadRestaurants(),loadOrders()])',
    'loaders iniciales Streaming')

rep('if(isRetailBusiness())await refreshRetailDashboard();else if(isProfessionalBusiness())await refreshProfessionalDashboard();else renderStats();',
    'if(isStreamingBusiness())await refreshStreamingDashboard();else if(isRetailBusiness())await refreshRetailDashboard();else if(isProfessionalBusiness())await refreshProfessionalDashboard();else renderStats();',
    'dashboard inicial Streaming')

rep('async function refreshRestaurantDashboard(){if(isRetailBusiness())return refreshRetailDashboard();if(isProfessionalBusiness())return refreshProfessionalDashboard();await Promise.allSettled([loadProducts(),loadDashboardOrders()]);renderStats()}',
    'async function refreshRestaurantDashboard(){if(isStreamingBusiness())return refreshStreamingDashboard();if(isRetailBusiness())return refreshRetailDashboard();if(isProfessionalBusiness())return refreshProfessionalDashboard();await Promise.allSettled([loadProducts(),loadDashboardOrders()]);renderStats()}',
    'refresh dashboard Streaming')

s=s.replace('Cargando tu restaurante…','Cargando tu panel…')
s=s.replace('Gestiona menú, precios, disponibilidad y datos del negocio.','Gestiona clientes, suscripciones, cuentas, vencimientos y renovaciones.')
s=s.replace('Streaming · Versión v0.1.1','Streaming · Versión v0.2.0')

p.write_text(s,encoding='utf-8')
print('Panel Streaming v0.2.0 integrado')
