from pathlib import Path

p = Path("panel/index.html")
s = p.read_text(encoding="utf-8")


def rep(old, new, label, required=True):
    global s
    if old not in s:
        if required:
            raise SystemExit(f"No se encontró ancla: {label}")
        return False
    s = s.replace(old, new, 1)
    return True

professional = ''' professional:{
  restaurant:["dashboard","appointments","services","professionals","clients","cash","staff","reports","qr","plans","settings"],
  manager:["dashboard","appointments","services","professionals","clients","cash","staff","reports","qr","settings"],
  professional:["dashboard","appointments","clients"],
  receptionist:["dashboard","appointments","clients","cash"],
  editor:["services","professionals"]
 }
};
const retailTabModule='''
streaming = ''' professional:{
  restaurant:["dashboard","appointments","services","professionals","clients","cash","staff","reports","qr","plans","settings"],
  manager:["dashboard","appointments","services","professionals","clients","cash","staff","reports","qr","settings"],
  professional:["dashboard","appointments","clients"],
  receptionist:["dashboard","appointments","clients","cash"],
  editor:["services","professionals"]
 },
 streaming:{
  restaurant:["dashboard","orders","products","categories","qr","plans","settings"],
  manager:["dashboard","orders","products","categories","qr","settings"],
  editor:["orders","products","categories"]
 }
};
const retailTabModule='''
rep(professional, streaming, "mapa de pestañas streaming")

old = '''function isRetailBusiness(){return ["supermarket","minimarket"].includes(currentBusinessType())}
function isProfessionalBusiness(){return currentBusinessType()==="professional"}
function currentBusinessLabel(){const type=currentBusinessType();return type==="supermarket"?"Supermercado":type==="minimarket"?"Minimarket":type==="professional"?"Profesional / Servicios":"Streaming"}'''
new = '''function isRetailBusiness(){return ["supermarket","minimarket"].includes(currentBusinessType())}
function isProfessionalBusiness(){return currentBusinessType()==="professional"}
function isStreamingBusiness(){return currentBusinessType()==="streaming"}
function currentBusinessLabel(){const type=currentBusinessType();return type==="supermarket"?"Supermercado":type==="minimarket"?"Minimarket":type==="professional"?"Profesional / Servicios":type==="streaming"?"Streaming":"Restaurante"}'''
rep(old, new, "helpers de tipo de negocio")

rep(
    'const businessKey=isRetailBusiness()?"retail":isProfessionalBusiness()?"professional":"restaurant",roleKey=adminPreviewMode?"restaurant":currentRole;',
    'const businessKey=isStreamingBusiness()?"streaming":isRetailBusiness()?"retail":isProfessionalBusiness()?"professional":"restaurant",roleKey=adminPreviewMode?"restaurant":currentRole;',
    "selección de mapa de acceso",
)

marker = ''' const button=document.querySelector('.tab[data-tab="'+selected+'"]');if(button)button.classList.add("active");if(selected)document.getElementById(selected)?.classList.add("active");
 syncSubscriptionBannerForActiveTab();'''
replacement = ''' const button=document.querySelector('.tab[data-tab="'+selected+'"]');if(button)button.classList.add("active");if(selected)document.getElementById(selected)?.classList.add("active");
 if(isStreamingBusiness()){
  setNavTabLabel("orders","Ventas / Entregas","Ventas / Entregas");
  setNavTabLabel("products","Suscripciones","Suscripciones");
  setNavTabLabel("categories","Plataformas","Plataformas");
  setNavTabLabel("qr","QR / Enlace","QR / Enlace");
 }
 syncSubscriptionBannerForActiveTab();'''
rep(marker, replacement, "etiquetas streaming")

rep(
    'document.getElementById("viewMenuLink")?.style.setProperty("display",currentRole==="restaurant"?"":"none",currentRole==="restaurant"?"":"important");',
    'document.getElementById("viewMenuLink")?.style.setProperty("display",currentRole==="restaurant"&&!isStreamingBusiness()?"":"none",currentRole==="restaurant"&&!isStreamingBusiness()?"":"important");',
    "ocultar ver menú",
)

old_header = ' if(menuLink){menuLink.href="https://menu.yummypro.online/?r="+encodeURIComponent(slug);menuLink.title=retail?"Ver tienda online":"Ver menú";menuLink.style.removeProperty("display")}'
new_header = ' if(menuLink){if(type==="streaming"){menuLink.style.setProperty("display","none","important")}else{menuLink.href="https://menu.yummypro.online/?r="+encodeURIComponent(slug);menuLink.title=retail?"Ver tienda online":"Ver menú";menuLink.style.removeProperty("display")}}'
rep(old_header, new_header, "enlace público del negocio")

s = s.replace(
    'window.location.replace("https://web.yummypro.online/?logout=1")',
    'window.location.replace("https://web.yummypro.online/?logout=1#streaming")',
)
s = s.replace(
    'window.location.replace("https://web.yummypro.online/")',
    'window.location.replace("https://web.yummypro.online/#streaming")',
)
rep("Streaming · Versión v2.5.64", "Streaming · Versión v0.1.1", "versión visible")

p.write_text(s, encoding="utf-8")
print("Panel Streaming v0.1.1 preparado")
