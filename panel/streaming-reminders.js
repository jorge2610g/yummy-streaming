/* YummyPro Streaming · recordatorios operativos v0.7.0 */
let streamingReminderView='all';

function streamingReminderKey(id,kind){return `yummypro:streaming:reminder:${currentRestaurant||'0'}:${id}:${kind}`}
function streamingReminderLastSent(id,kind){
 try{return localStorage.getItem(streamingReminderKey(id,kind))||''}catch(_){return ''}
}
function streamingReminderSentToday(id,kind){
 const raw=streamingReminderLastSent(id,kind);if(!raw)return false;
 const d=new Date(raw),n=new Date();
 return d.getFullYear()===n.getFullYear()&&d.getMonth()===n.getMonth()&&d.getDate()===n.getDate();
}
function streamingReminderMarkSent(id,kind){
 try{localStorage.setItem(streamingReminderKey(id,kind),new Date().toISOString())}catch(_){}
}
function streamingReminderTasks(){
 const tasks=[];
 for(const s of streamingSubscriptions){
  const st=streamingDerivedStatus(s),days=streamingDaysLeft(s.expires_at),c=streamingCustomer(s.customer_id)||{},p=streamingPlatform(s.platform_id)||{};
  if(st!=='cancelled'&&streamingPaymentStatus(s)==='pending')tasks.push({id:s.id,kind:'payment',priority:1,label:'Cobro pendiente',customer:c,platform:p,sub:s});
  if(!['cancelled','paused'].includes(st)&&streamingDeliveryStatus(s)==='pending')tasks.push({id:s.id,kind:'delivery',priority:2,label:'Entrega pendiente',customer:c,platform:p,sub:s});
  if(st==='expired')tasks.push({id:s.id,kind:'expired',priority:0,label:'Suscripción vencida',customer:c,platform:p,sub:s});
  else if(st==='active'&&days!=null&&days>=0&&days<=3)tasks.push({id:s.id,kind:'urgent',priority:0,label:days===0?'Vence hoy':`Vence en ${days} día${days===1?'':'s'}`,customer:c,platform:p,sub:s});
 }
 return tasks.sort((a,b)=>a.priority-b.priority||new Date(a.sub.expires_at)-new Date(b.sub.expires_at)||String(a.customer.full_name||'').localeCompare(String(b.customer.full_name||'')));
}
function streamingReminderMessage(task){
 const c=task.customer||{},p=task.platform||{},s=task.sub||{},name=c.full_name||'cliente',platform=p.name||'tu servicio',date=streamingDate(s.expires_at);
 if(task.kind==='payment')return `Hola ${name}, te recordamos que tienes pendiente el pago de ${platform} por ${streamingMoney(s.price,s.currency_code)}. Si ya realizaste el pago, puedes ignorar este mensaje.`;
 if(task.kind==='delivery')return `Hola ${name}, tu acceso de ${platform} está pendiente de entrega o activación. Te avisaremos apenas quede activado.`;
 if(task.kind==='expired')return `Hola ${name}, tu suscripción de ${platform} venció el ${date}. Si deseas renovarla, respóndeme por aquí y la activamos.`;
 return `Hola ${name}, te recordamos que tu suscripción de ${platform} vence el ${date}. Si deseas renovarla, respóndeme por aquí.`;
}
function streamingReminderWhatsApp(id,kind){
 const task=streamingReminderTasks().find(x=>Number(x.id)===Number(id)&&x.kind===kind);if(!task)return streamingToast('Recordatorio no encontrado');
 if(!task.customer?.phone)return streamingToast('Este cliente no tiene WhatsApp registrado');
 streamingReminderMarkSent(id,kind);
 window.open(streamingPhoneUrl(task.customer.phone,streamingReminderMessage(task)),'_blank','noopener');
 renderStreamingReminderQueue();
}
function streamingReminderManage(id,kind){
 if(kind==='delivery')return streamingOpenDelivery(id);
 if(kind==='payment')return streamingOpenPayment(id);
 return streamingOpenRenewal(id);
}
function streamingReminderOpenNext(){
 const task=streamingReminderTasks().find(x=>x.customer?.phone&&!streamingReminderSentToday(x.id,x.kind));
 if(!task)return streamingToast('No hay recordatorios pendientes por enviar hoy');
 streamingReminderWhatsApp(task.id,task.kind);
}
function streamingReminderSetView(view,btn){
 streamingReminderView=view;
 document.querySelectorAll('[data-streaming-reminder-filter]').forEach(x=>x.classList.toggle('active',x===btn));
 renderStreamingReminderQueue();
}
function streamingReminderKindLabel(kind){return ({payment:'Cobro',delivery:'Entrega',urgent:'Vence pronto',expired:'Vencida'})[kind]||kind}
function streamingReminderClass(kind){return kind==='expired'?'danger':kind==='urgent'||kind==='payment'||kind==='delivery'?'warning':'muted'}
function installStreamingReminderCenter(){
 const action=document.getElementById('streamingActionCenter');if(!action)return;
 if(!document.getElementById('streaming-reminders-style')){
  const style=document.createElement('style');style.id='streaming-reminders-style';style.textContent=`
  .streaming-reminders{margin-top:14px;padding-top:14px;border-top:1px solid var(--line,#2b2b2b)}
  .streaming-reminder-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}.streaming-reminder-head h3{margin:0;font-size:15px}.streaming-reminder-head p{margin:3px 0 0;font-size:12px;color:var(--mut,#aaa)}
  .streaming-reminder-tools{display:flex;gap:7px;flex-wrap:wrap}.streaming-reminder-tools button{padding:8px 10px;font-size:12px}
  .streaming-reminder-list{display:grid;gap:8px}.streaming-reminder-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line,#2b2b2b);border-radius:12px;padding:11px;background:var(--soft,#151515)}
  .streaming-reminder-main{min-width:0}.streaming-reminder-main b{display:block;margin-bottom:4px}.streaming-reminder-meta{display:flex;gap:7px;flex-wrap:wrap;font-size:12px;color:var(--mut,#aaa)}.streaming-reminder-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.streaming-reminder-actions button{padding:8px 10px;font-size:12px}
  .streaming-reminder-sent{font-size:11px;color:#34d399;font-weight:800}.streaming-reminder-empty{padding:14px;text-align:center;color:var(--mut,#aaa);font-size:13px}
  @media(max-width:620px){.streaming-reminder-row{grid-template-columns:1fr}.streaming-reminder-actions{justify-content:flex-start}.streaming-reminder-actions button{flex:1 1 120px}}
  `;document.head.appendChild(style);
 }
 let box=document.getElementById('streamingReminderCenter');
 if(!box){box=document.createElement('section');box.id='streamingReminderCenter';box.className='streaming-reminders';action.appendChild(box)}
 renderStreamingReminderQueue();
}
function renderStreamingReminderQueue(){
 const box=document.getElementById('streamingReminderCenter');if(!box)return;
 const tasks=streamingReminderTasks();
 const counts={payment:0,delivery:0,urgent:0,expired:0};tasks.forEach(t=>counts[t.kind]=(counts[t.kind]||0)+1);
 const rows=tasks.filter(t=>streamingReminderView==='all'||t.kind===streamingReminderView).slice(0,30);
 box.innerHTML=`<div class="streaming-reminder-head"><div><h3>Recordatorios automáticos <span class="streaming-badge muted">v0.7.0</span></h3><p>La cola se calcula sola según cobros, entregas y vencimientos. WhatsApp se confirma con un toque.</p></div><button class="primary" type="button" onclick="streamingReminderOpenNext()">WhatsApp · siguiente</button></div><div class="streaming-reminder-tools"><button class="ghost ${streamingReminderView==='all'?'active':''}" data-streaming-reminder-filter="all" onclick="streamingReminderSetView('all',this)">Todos ${tasks.length}</button><button class="ghost ${streamingReminderView==='payment'?'active':''}" data-streaming-reminder-filter="payment" onclick="streamingReminderSetView('payment',this)">Cobros ${counts.payment}</button><button class="ghost ${streamingReminderView==='delivery'?'active':''}" data-streaming-reminder-filter="delivery" onclick="streamingReminderSetView('delivery',this)">Entregas ${counts.delivery}</button><button class="ghost ${streamingReminderView==='urgent'?'active':''}" data-streaming-reminder-filter="urgent" onclick="streamingReminderSetView('urgent',this)">Próximos ${counts.urgent}</button><button class="ghost ${streamingReminderView==='expired'?'active':''}" data-streaming-reminder-filter="expired" onclick="streamingReminderSetView('expired',this)">Vencidas ${counts.expired}</button></div><div class="streaming-reminder-list">${rows.map(t=>{const sent=streamingReminderSentToday(t.id,t.kind),phone=!!t.customer?.phone;return `<article class="streaming-reminder-row"><div class="streaming-reminder-main"><b>${streamingEsc(t.customer?.full_name||'Cliente')} · ${streamingEsc(t.platform?.name||'Plataforma')}</b><div class="streaming-reminder-meta"><span class="streaming-badge ${streamingReminderClass(t.kind)}">${streamingEsc(t.label)}</span><span>${streamingDate(t.sub.expires_at)}</span>${sent?'<span class="streaming-reminder-sent">Enviado hoy</span>':''}${!phone?'<span>Sin WhatsApp</span>':''}</div></div><div class="streaming-reminder-actions"><button class="ghost" type="button" onclick="streamingReminderManage(${t.id},'${t.kind}')">Gestionar</button><button class="ghost" type="button" ${phone?'':'disabled'} onclick="streamingReminderWhatsApp(${t.id},'${t.kind}')">WhatsApp</button></div></article>`}).join('')||'<div class="streaming-reminder-empty">No hay recordatorios en este filtro.</div>'}</div>`;
}

const streamingRenderBeforeReminders=renderStreamingSubscriptions;
renderStreamingSubscriptions=function(){streamingRenderBeforeReminders();installStreamingReminderCenter()};
setTimeout(()=>{try{installStreamingReminderCenter()}catch(e){console.error(e)}},0);
