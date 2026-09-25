/* YummyPro Streaming · herramientas de administración v1.1.5 */
(function(){
 const PLAN_MODULES=[
  ["dashboard","Dashboard"],
  ["streaming_subscriptions","Suscripciones"],
  ["streaming_customers","Clientes"],
  ["streaming_accounts","Cuentas / Cupos"],
  ["streaming_platforms","Plataformas"],
  ["streaming_renewals","Renovaciones"],
  ["qr","Código QR"],
  ["settings","Configuración"]
 ];

 function isAdminPreview(){
  try{return !!adminPreviewMode}catch(_){return false}
 }
 function catalogUrl(){
  try{
   if(!currentRestaurant)return "";
   return "/catalogo/?business="+encodeURIComponent(currentRestaurant);
  }catch(_){return ""}
 }
 function syncCatalogHeader(){
  const link=document.getElementById("viewMenuLink");
  if(!link)return;
  const url=catalogUrl();
  let type="";
  try{type=String(currentRestaurantConfig?.business_type||restaurants.find(x=>Number(x.id)===Number(currentRestaurant))?.business_type||"").toLowerCase()}catch(_){}
  if(!url||type!=="streaming"){link.style.display="none";return}
  link.href=url;
  link.target="_blank";
  link.rel="noopener";
  link.style.display=(isAdminPreview()||currentRole==="restaurant"||currentRole==="manager")?"":"none";
  link.title="Previsualizar catálogo";
  link.setAttribute("aria-label","Previsualizar catálogo");
  const label=link.querySelector(".action-label");if(label)label.textContent="Ver catálogo";
 }

 const originalLoadRestaurants=window.loadRestaurants;
 if(typeof originalLoadRestaurants==="function"){
  window.loadRestaurants=async function(...args){
   const result=await originalLoadRestaurants.apply(this,args);
   syncCatalogHeader();
   return result;
  };
 }

 const originalLoadSubscriptionPlans=window.loadSubscriptionPlans;
 if(typeof originalLoadSubscriptionPlans==="function"){
  window.loadSubscriptionPlans=async function(...args){
   if(!isAdminPreview())return originalLoadSubscriptionPlans.apply(this,args);
   const businessType=String(currentRestaurantConfig?.business_type||"streaming").toLowerCase();
   const {data,error}=await sb.from("subscription_plans")
    .select("*")
    .eq("business_type",businessType)
    .order("is_default_trial",{ascending:false})
    .order("amount",{ascending:true});
   if(error){console.error("No se pudieron cargar los planes para administración",error);toast("No se pudieron cargar los planes Streaming");return}
   subscriptionPlans=data||[];
   renderRestaurantPlans();
   try{renderBillingSummary()}catch(_){}
   try{renderBillingPaymentMethods()}catch(_){}
  };
 }

 const originalRenderRestaurantPlans=window.renderRestaurantPlans;
 if(typeof originalRenderRestaurantPlans==="function"){
  window.renderRestaurantPlans=function(){
   if(!isAdminPreview())return originalRenderRestaurantPlans.apply(this,arguments);
   const box=document.getElementById("restaurantPlans");if(!box)return;
   const labels=Object.fromEntries(PLAN_MODULES);
   box.innerHTML=(subscriptionPlans||[]).map(p=>{
    const modules=Array.isArray(p.modules)?p.modules:[],trial=p.is_default_trial===true;
    const moduleList=modules.length
      ?'<div class="plan-features-title">Módulos incluidos</div><div class="plan-features">'+modules.map(m=>'<div><span aria-hidden="true">✓</span><span>'+esc(labels[m]||m)+'</span></div>').join("")+'</div>'
      :'<div class="mut plan-empty-features">Sin módulos configurados.</div>';
    const state=p.active===false?"Inactivo":"Activo";
    return '<article class="item plan-card" data-plan-id="'+Number(p.id)+'"><div class="plan-card-body">'
      +'<div class="plan-card-top"><div><span class="plan-duration">'+Number(p.days||0)+' días</span><h3 class="plan-name">'+esc(p.name||"Plan")+'</h3>'
      +'<div class="plan-price">'+(trial?"Gratis":esc(money(Number(p.amount||0))))+'</div>'
      +'<div class="plan-reference">'+esc(state)+(trial?" · Prueba predeterminada":"")+'</div></div></div>'
      +moduleList+'<div class="plan-card-spacer"></div>'
      +'<div class="plan-actions"><button class="primary plan-action-btn" type="button" onclick="openStreamingAdminPlanEditor('+Number(p.id)+')">Editar plan</button></div>'
      +'</div></article>';
   }).join("")||'<p class="mut">No hay planes Streaming configurados.</p>';
  };
 }

 function ensureDialog(){
  let dialog=document.getElementById("streamingAdminPlanDialog");
  if(dialog)return dialog;
  dialog=document.createElement("dialog");
  dialog.id="streamingAdminPlanDialog";
  dialog.className="streaming-dialog";
  dialog.innerHTML='<div class="streaming-dialog-head"><div><span class="eyebrow">ADMINISTRACIÓN</span><h2>Editar plan Streaming</h2></div><button class="ghost" type="button" onclick="closeStreamingAdminPlanEditor()">✕</button></div>'
   +'<div id="streamingAdminPlanBody"></div>'
   +'<div class="streaming-dialog-actions"><button class="ghost" type="button" onclick="closeStreamingAdminPlanEditor()">Cancelar</button><button class="primary" type="button" onclick="saveStreamingAdminPlanEditor()">Guardar cambios</button></div>';
  document.body.appendChild(dialog);
  dialog.addEventListener("click",e=>{if(e.target===dialog)closeStreamingAdminPlanEditor()});
  return dialog;
 }

 window.openStreamingAdminPlanEditor=function(id){
  if(!isAdminPreview())return toast("Esta edición es exclusiva del administrador");
  const p=(subscriptionPlans||[]).find(x=>Number(x.id)===Number(id));if(!p)return toast("Plan no encontrado");
  const trial=p.is_default_trial===true,selected=new Set(Array.isArray(p.modules)?p.modules:[]);
  const dialog=ensureDialog(),body=dialog.querySelector("#streamingAdminPlanBody");
  body.innerHTML='<input id="streamingAdminPlanId" type="hidden" value="'+Number(p.id)+'">'
   +'<label>Nombre del plan<input id="streamingAdminPlanName" value="'+esc(p.name||"")+'"></label>'
   +'<div class="two"><label>Monto<input id="streamingAdminPlanAmount" type="number" min="0" step="0.01" value="'+Number(p.amount||0)+'" '+(trial?"disabled":"")+'></label>'
   +'<label>Duración (días)<input id="streamingAdminPlanDays" type="number" min="1" max="3650" value="'+Number(p.days||30)+'"></label></div>'
   +'<div class="two"><label>Estado<select id="streamingAdminPlanActive" '+(trial?"disabled":"")+'><option value="true" '+(p.active!==false?"selected":"")+'>Activo</option><option value="false" '+(p.active===false?"selected":"")+'>Inactivo</option></select></label>'
   +'<label class="streaming-check"><input id="streamingAdminPlanAnnual" type="checkbox" '+(!trial&&p.annual_enabled?"checked":"")+' '+(trial?"disabled":"")+'> Plan anual disponible</label></div>'
   +'<div class="two"><label>Monto anual<input id="streamingAdminPlanAnnualAmount" type="number" min="0" step="0.01" value="'+(p.annual_amount==null?"":Number(p.annual_amount))+'" '+(trial?"disabled":"")+'></label>'
   +'<label>Duración anual (días)<input id="streamingAdminPlanAnnualDays" type="number" min="1" value="'+Number(p.annual_days||365)+'" '+(trial?"disabled":"")+'></label></div>'
   +'<label>Meses de regalo<input id="streamingAdminPlanAnnualBonus" type="number" min="0" max="11" value="'+Number(p.annual_bonus_months||0)+'" '+(trial?"disabled":"")+'></label>'
   +'<div style="margin-top:14px"><b>Módulos incluidos</b><div class="list" style="margin-top:8px">'
   +PLAN_MODULES.map(([key,label])=>'<label class="item" style="display:flex;align-items:center;gap:9px;padding:9px 11px"><input type="checkbox" data-streaming-plan-module value="'+key+'" '+(selected.has(key)?"checked":"")+' style="width:auto"> <span>'+esc(label)+'</span></label>').join("")
   +'</div></div>'
   +(trial?'<p class="mut" style="margin-top:12px">La prueba predeterminada se mantiene gratis y activa.</p>':'');
  dialog.showModal?.();
 };

 window.closeStreamingAdminPlanEditor=function(){
  document.getElementById("streamingAdminPlanDialog")?.close?.();
 };

 window.saveStreamingAdminPlanEditor=async function(){
  if(!isAdminPreview())return toast("Esta edición es exclusiva del administrador");
  const id=Number(document.getElementById("streamingAdminPlanId")?.value),p=(subscriptionPlans||[]).find(x=>Number(x.id)===id);
  if(!p)return toast("Plan no encontrado");
  const trial=p.is_default_trial===true,name=document.getElementById("streamingAdminPlanName")?.value.trim()||"";
  const amount=trial?0:Number(document.getElementById("streamingAdminPlanAmount")?.value||0);
  const days=Number(document.getElementById("streamingAdminPlanDays")?.value||0);
  const annualEnabled=!trial&&!!document.getElementById("streamingAdminPlanAnnual")?.checked;
  const annualRaw=String(document.getElementById("streamingAdminPlanAnnualAmount")?.value||"").trim();
  const annualAmount=annualRaw===""?null:Number(annualRaw);
  const annualDays=Number(document.getElementById("streamingAdminPlanAnnualDays")?.value||365);
  const annualBonus=Number(document.getElementById("streamingAdminPlanAnnualBonus")?.value||0);
  const active=trial?true:document.getElementById("streamingAdminPlanActive")?.value!=="false";
  const modules=[...document.querySelectorAll("[data-streaming-plan-module]:checked")].map(x=>x.value);
  if(!name||!Number.isFinite(amount)||amount<0||!Number.isInteger(days)||days<1)return toast("Revisa nombre, monto y duración");
  if(!modules.length)return toast("Selecciona al menos un módulo");
  if(annualEnabled&&((annualAmount!==null&&(!Number.isFinite(annualAmount)||annualAmount<0))||!Number.isInteger(annualDays)||annualDays<1||!Number.isInteger(annualBonus)||annualBonus<0||annualBonus>11))return toast("Revisa la configuración anual");
  const row={
   name,amount,days,active,modules,business_type:"streaming",
   annual_enabled:annualEnabled,
   annual_amount:annualEnabled?annualAmount:null,
   annual_days:annualEnabled?annualDays:365,
   annual_bonus_months:annualEnabled?annualBonus:0,
   updated_at:new Date().toISOString()
  };
  const {error}=await sb.from("subscription_plans").update(row).eq("id",id).eq("business_type","streaming");
  if(error)return toast("No se pudo guardar el plan: "+error.message);
  closeStreamingAdminPlanEditor();
  toast("Plan Streaming actualizado");
  await loadSubscriptionPlans();
 };

 function refreshAdminPreviewTools(){
  syncCatalogHeader();
  if(isAdminPreview()&&currentRestaurant){
   const key=String(currentRestaurant);
   if(refreshAdminPreviewTools.lastPlanRestaurant!==key){
    refreshAdminPreviewTools.lastPlanRestaurant=key;
    Promise.resolve().then(()=>loadSubscriptionPlans()).catch(e=>console.error("Planes admin Streaming",e));
   }
  }
 }
 window.addEventListener("streaming:data-loaded",refreshAdminPreviewTools);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)refreshAdminPreviewTools()});
 setInterval(refreshAdminPreviewTools,1200);
 setTimeout(refreshAdminPreviewTools,0);
})();