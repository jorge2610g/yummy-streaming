/* YummyPro Streaming · centro de control v1.0.0 */
let streamingControlQuery='';

function streamingControlText(value){return String(value??'').trim()}
function streamingControlNorm(value){return streamingControlText(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function streamingControlDownload(name,mime,content){
 const blob=new Blob([content],{type:mime});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function streamingControlSafeSnapshot(){
 const now=new Date().toISOString();
 const platforms=streamingPlatforms.map(x=>({id:x.id,name:x.name,duration_days:x.duration_days,active:x.active,sort_order:x.sort_order}));
 const customers=streamingCustomers.map(x=>({id:x.id,full_name:x.full_name,phone:x.phone,email:x.email,notes:x.notes,active:x.active,created_at:x.created_at}));
 const accounts=streamingAccounts.map(x=>({id:x.id,platform_id:x.platform_id,label:x.label,max_slots:x.max_slots,active:x.active,notes:x.notes,created_at:x.created_at}));
 const subscriptions=streamingSubscriptions.map(x=>({id:x.id,customer_id:x.customer_id,platform_id:x.platform_id,account_id:x.account_id,profile_label:x.profile_label,starts_at:x.starts_at,expires_at:x.expires_at,status:x.status,payment_status:x.payment_status,payment_method:x.payment_method,payment_date:x.payment_date,delivery_status:x.delivery_status,delivered_at:x.delivered_at,created_at:x.created_at}));
 const renewals=streamingRenewals.map(x=>({id:x.id,subscription_id:x.subscription_id,previous_expires_at:x.previous_expires_at,new_expires_at:x.new_expires_at,payment_method:x.payment_method,created_at:x.created_at}));
 return {product:'YummyPro Streaming',version:'1.0.0',generated_at:now,restaurant_id:currentRestaurant||null,platforms,customers,accounts,subscriptions,renewals};
}
function streamingControlExportBackup(){
 try{
  const data=streamingControlSafeSnapshot();
  const stamp=new Date().toISOString().slice(0,10);
  streamingControlDownload(`yummypro-streaming-respaldo-${stamp}.json`,'application/json;charset=utf-8',JSON.stringify(data,null,2));
  streamingToast('Respaldo descargado sin contraseñas');
 }catch(e){console.error(e);streamingToast('No se pudo generar el respaldo')}
}
function streamingControlCsvCell(value){const s=streamingControlText(value);return `"${s.replace(/"/g,'""')}"`}
function streamingControlExportCsv(){
 try{
  const rows=[['cliente','telefono','correo','plataforma','cuenta','perfil','inicio','vencimiento','estado','cobro','entrega']];
  streamingSubscriptions.forEach(s=>{
   const c=streamingCustomer(s.customer_id)||{},p=streamingPlatform(s.platform_id)||{},a=streamingAccount(s.account_id)||{};
   rows.push([c.full_name,c.phone,c.email,p.name,a.label,s.profile_label,s.starts_at,s.expires_at,streamingDerivedStatus(s),s.payment_status||'',s.delivery_status||'']);
  });
  const csv='\ufeff'+rows.map(r=>r.map(streamingControlCsvCell).join(',')).join('\n');
  const stamp=new Date().toISOString().slice(0,10);
  streamingControlDownload(`yummypro-streaming-suscripciones-${stamp}.csv`,'text/csv;charset=utf-8',csv);
  streamingToast('CSV de suscripciones descargado');
 }catch(e){console.error(e);streamingToast('No se pudo generar el CSV')}
}
function streamingControlResults(query){
 const q=streamingControlNorm(query);if(!q)return [];
 const out=[];
 streamingCustomers.forEach(c=>{
  const hay=[c.full_name,c.phone,c.email].map(streamingControlNorm).join(' ');
  if(hay.includes(q))out.push({kind:'customer',id:c.id,title:c.full_name||'Cliente',meta:[c.phone,c.email].filter(Boolean).join(' · ')});
 });
 streamingSubscriptions.forEach(s=>{
  const c=streamingCustomer(s.customer_id)||{},p=streamingPlatform(s.platform_id)||{},a=streamingAccount(s.account_id)||{};
  const hay=[c.full_name,c.phone,p.name,a.label,s.profile_label,streamingStatusLabel(s)].map(streamingControlNorm).join(' ');
  if(hay.includes(q))out.push({kind:'subscription',id:s.id,title:`${c.full_name||'Cliente'} · ${p.name||'Plataforma'}`,meta:`${a.label||'Sin cuenta'} · ${streamingStatusLabel(s)}`});
 });
 streamingAccounts.forEach(a=>{
  const p=streamingPlatform(a.platform_id)||{};
  const hay=[a.label,p.name,a.notes].map(streamingControlNorm).join(' ');
  if(hay.includes(q))out.push({kind:'account',id:a.id,title:a.label||'Cuenta',meta:`${p.name||'Plataforma'} · ${streamingAccountUsed(a.id)}/${Number(a.max_slots||1)} cupos`});
 });
 streamingPlatforms.forEach(p=>{
  if([p.name].map(streamingControlNorm).join(' ').includes(q))out.push({kind:'platform',id:p.id,title:p.name||'Plataforma',meta:`${Number(p.duration_days||30)} días predeterminados`});
 });
 return out.slice(0,30);
}
function streamingControlOpen(kind,id){
 const tabs={customer:'streaming_customers',subscription:'streaming_subscriptions',account:'streaming_accounts',platform:'streaming_platforms'};
 const tab=tabs[kind];if(!tab)return;
 document.querySelector(`.tab[data-tab="${tab}"]`)?.click();
 setTimeout(()=>{
  if(kind==='customer'){
   const c=streamingCustomer(id);const el=document.getElementById('streamingCustomerSearch');if(el){el.value=c?.full_name||'';renderStreamingCustomers(el.value)}
  }else if(kind==='subscription'){
   const s=streamingSubscription(id),c=streamingCustomer(s?.customer_id);streamingSubscriptionView='all';const el=document.getElementById('streamingSubscriptionSearch');if(el){el.value=c?.full_name||'';streamingSubscriptionSearch=el.value;renderStreamingSubscriptions()}
  }else if(kind==='account'){
   const a=streamingAccount(id);const el=document.getElementById('streamingAccountSearch');if(el){el.value=a?.label||'';renderStreamingAccounts(el.value)}
  }
 },80);
}
function renderStreamingControl(){
 const root=document.getElementById('streamingControlResults');if(!root)return;
 const rows=streamingControlResults(streamingControlQuery);
 if(!streamingControlQuery){root.innerHTML='<p class="mut" style="margin:0">Busca por cliente, teléfono, plataforma, cuenta o perfil.</p>';return}
 if(!rows.length){root.innerHTML='<p class="mut" style="margin:0">No encontré coincidencias.</p>';return}
 root.innerHTML=rows.map(r=>`<button class="streaming-control-result" type="button" onclick="streamingControlOpen('${streamingEsc(r.kind)}',${Number(r.id)})"><span><b>${streamingEsc(r.title)}</b><small>${streamingEsc(r.meta||'')}</small></span><i>→</i></button>`).join('');
}
function installStreamingControl(){
 const shell=document.querySelector('#streaming_subscriptions .streaming-shell');if(!shell||document.getElementById('streamingControl'))return;
 if(!document.getElementById('streaming-control-style')){
  const style=document.createElement('style');style.id='streaming-control-style';style.textContent=`
  .streaming-control{margin-bottom:14px;padding:14px;border:1px solid var(--line,#2b2b2b);border-radius:14px;background:var(--soft,#151515)}
  .streaming-control-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap}.streaming-control-head h3{margin:0;font-size:16px}.streaming-control-head p{margin:4px 0 0;font-size:12px;color:var(--mut,#aaa)}
  .streaming-control-tools{display:flex;gap:7px;flex-wrap:wrap}.streaming-control-search{width:100%;margin-top:10px}.streaming-control-results{display:grid;gap:6px;margin-top:8px;max-height:320px;overflow:auto}
  .streaming-control-result{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;padding:10px;border:1px solid var(--line,#2b2b2b);border-radius:10px;background:transparent;color:inherit}.streaming-control-result span{min-width:0}.streaming-control-result b,.streaming-control-result small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.streaming-control-result small{margin-top:3px;color:var(--mut,#aaa)}.streaming-control-result i{font-style:normal;font-size:18px}
  @media(max-width:700px){.streaming-control-tools{width:100%}.streaming-control-tools button{flex:1}.streaming-control-results{max-height:240px}}
  `;document.head.appendChild(style);
 }
 const box=document.createElement('section');box.id='streamingControl';box.className='streaming-control';box.innerHTML=`<div class="streaming-control-head"><div><h3>Centro de control <span class="streaming-badge muted">v1.0.0</span></h3><p>Búsqueda global y respaldos operativos. Los archivos exportados no incluyen contraseñas.</p></div><div class="streaming-control-tools"><button class="ghost" type="button" onclick="streamingControlExportCsv()">Exportar CSV</button><button class="ghost" type="button" onclick="streamingControlExportBackup()">Respaldo JSON</button></div></div><input class="streaming-control-search" type="search" placeholder="Buscar cliente, teléfono, plataforma, cuenta o perfil" oninput="streamingControlQuery=this.value;renderStreamingControl()"><div id="streamingControlResults" class="streaming-control-results"></div>`;
 shell.prepend(box);renderStreamingControl();
}
window.addEventListener('streaming:data-loaded',()=>{installStreamingControl();renderStreamingControl()});
const streamingControlObserver=new MutationObserver(()=>installStreamingControl());streamingControlObserver.observe(document.documentElement,{childList:true,subtree:true});
installStreamingControl();
