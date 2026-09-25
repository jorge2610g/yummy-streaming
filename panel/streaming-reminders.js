/* YummyPro Streaming · recordatorios persistentes v0.8.0 */
let streamingReminderView='all';
let streamingReminderLogs=[];

function streamingReminderToday(){
 try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
 catch(_){const d=new Date(),z=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${z(d.getMonth()+1)}-${z(d.getDate())}`}
}
async function streamingLoadReminderLogs(){
 if(!currentRestaurant){streamingReminderLogs=[];return}
 const {data,error}=await sb.from('streaming_reminder_logs').select('subscription_id,reminder_type,opened_at,opened_date').eq('restaurant_id',currentRestaurant).eq('opened_date',streamingReminderToday()).order('opened_at',{ascending:false});
 if(error)throw error;streamingReminderLogs=data||[];
}
function streamingReminderOpenedToday(id,kind){return streamingReminderLogs.some(x=>Number(x.subscription_id)===Number(id)&&x.reminder_type===kind&&x.opened_date===streamingReminderToday())}
function streamingReminderOpenedAt(id,kind){return streamingReminderLogs.find(x=>Number(x.subscription_id)===Number(id)&&x.reminder_type===kind)?.opened_at||null}
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
async function streamingReminderWhatsApp(id,kind){
 if(!streamingWritable())return;
 const task=streamingReminderTasks().find(x=>Number(x.id)===Number(id)&&x.kind===kind);if(!task)return streamingToast('Recordatorio no encontrado');
 if(!task.customer?.phone)return streamingToast('Este cliente no tiene WhatsApp registrado');
 if(streamingReminderOpenedToday(id,kind))return streamingToast('Este recordatorio ya fue gestionado hoy');
 const win=window.open('about:blank','_blank');if(!win)return streamingToast('Permite ventanas emergentes para abrir WhatsApp');
 const row={restaurant_id:Number(currentRestaurant),subscription_id:Number(id),reminder_type:kind,channel:'whatsapp'};
 const {data,error}=await sb.from('streaming_reminder_logs').insert(row).select('subscription_id,reminder_type,opened_at,opened_date').single();
 if(error){try{win.close()}catch(_){};if(error.code==='23505'){await streamingLoadReminderLogs().catch(()=>{});renderStreamingReminderQueue();return streamingToast('Este recordatorio ya fue gestionado hoy')}return streamingToast(error.message||'No se pudo registrar el recordatorio')}
 streamingReminderLogs.unshift(data);
 try{win.opener=null;win.location.replace(streamingPhoneUrl(task.customer.phone,streamingReminderMessage(task)))}catch(_){win.location.href=streamingPhoneUrl(task.customer.phone,streamingReminderMessage(task))}
 renderStreamingReminderQueue();
}
function streamingReminderManage(id,kind){if(kind==='delivery')return streamingOpenDelivery(id);if(kind==='payment')return streamingOpenPayment(id);return streamingOpenRenewal(id)}
function streamingReminderOpenNext(){const task=streamingReminderTasks().find(x=>x.customer?.phone&&!streamingReminderOpenedToday(x.id,x.kind));if(!task)return streamingToast('No hay recordatorios pendientes por gestionar hoy');streamingReminderWhatsApp(task.id,task.kind)}
function streamingReminderSetView(view,btn){streamingReminderView=view;document.querySelectorAll('[data-streaming-reminder-filter]').forEach(x=>x.classList.toggle('active',x===btn));renderStreamingReminderQueue()}
function streamingReminderClass(kind){return kind==='expired'?'danger':kind==='urgent'||kind==='payment'||kind==='delivery'?'warning':'muted'}
function installStreamingReminderCenter(){
 const action=document.getElementById('streamingActionCenter');if(!action)return;
 if(!document.getElementById('streaming-reminders-style')){const style=document.createElement('style');style.id='streaming-reminders-style';style.textContent=`.streaming-reminders{margin-top:14px;padding-top:14px;border-top:1px solid var(--line,#2b2b2b)}.streaming-reminder-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px}.streaming-reminder-head h3{margin:0;font-size:15px}.streaming-reminder-head p{margin:3px 0 0;font-size:12px;color:var(--mut,#aaa)}.streaming-reminder-tools{display:flex;gap:7px;flex-wrap:wrap}.streaming-reminder-tools button{padding:8px 10px;font-size:12px}.streaming-reminder-list{display:grid;gap:8px}.streaming-reminder-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line,#2b2b2b);border-radius:12px;padding:11px;background:var(--soft,#151515)}.streaming-reminder-main{min-width:0}.streaming-reminder-main b{display:block;margin-bottom:4px}.streaming-reminder-meta{display:flex;gap:7px;flex-wrap:wrap;font-size:12px;color:var(--mut,#aaa)}.streaming-reminder-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.streaming-reminder-actions button{padding:8px 10px;font-size:12px}.streaming-reminder-done{font-size:11px;color:#34d399;font-weight:800}.streaming-reminder-empty{padding:14px;text-align:center;color:var(--mut,#aaa);font-size:13px}@media(max-width:620px){.streaming-reminder-row{grid-template-columns:1fr}.streaming-reminder-actions{justify-content:flex-start}.streaming-reminder-actions button{flex:1 1 120px}}`;document.head.appendChild(style)}
 let box=document.getElementById('streamingReminderCenter');if(!box){box=document.createElement('section');box.id='streamingReminderCenter';box.className='streaming-reminders';action.appendChild(box)}renderStreamingReminderQueue();
}
function renderStreamingReminderQueue(){
 const box=document.getElementById('streamingReminderCenter');if(!box)return;
 const tasks=streamingReminderTasks(),counts={payment:0,delivery:0,urgent:0,expired:0};tasks.forEach(t=>counts[t.kind]=(counts[t.kind]||0)+1);
 const rows=tasks.filter(t=>streamingReminderView==='all'||t.kind===streamingReminderView).slice(0,30);
 box.innerHTML=`<div class="streaming-reminder-head"><div><h3>Recordatorios automáticos <span class="streaming-badge muted">v0.8.0</span></h3><p>La cola se calcula sola y el historial queda sincronizado entre dispositivos. WhatsApp se abre con un toque; no se marca como “recibido” sin API oficial.</p></div><button class="primary" type="button" onclick="streamingReminderOpenNext()">WhatsApp · siguiente</button></div><div class="streaming-reminder-tools"><button class="ghost ${streamingReminderView==='all'?'active':''}" data-streaming-reminder-filter="all" onclick="streamingReminderSetView('all',this)">Todos ${tasks.length}</button><button class="ghost ${streamingReminderView==='payment'?'active':''}" data-streaming-reminder-filter="payment" onclick="streamingReminderSetView('payment',this)">Cobros ${counts.payment}</button><button class="ghost ${streamingReminderView==='delivery'?'active':''}" data-streaming-reminder-filter="delivery" onclick="streamingReminderSetView('delivery',this)">Entregas ${counts.delivery}</button><button class="ghost ${streamingReminderView==='urgent'?'active':''}" data-streaming-reminder-filter="urgent" onclick="streamingReminderSetView('urgent',this)">Próximos ${counts.urgent}</button><button class="ghost ${streamingReminderView==='expired'?'active':''}" data-streaming-reminder-filter="expired" onclick="streamingReminderSetView('expired',this)">Vencidas ${counts.expired}</button></div><div class="streaming-reminder-list">${rows.map(t=>{const done=streamingReminderOpenedToday(t.id,t.kind),opened=streamingReminderOpenedAt(t.id,t.kind),phone=!!t.customer?.phone;return `<article class="streaming-reminder-row"><div class="streaming-reminder-main"><b>${streamingEsc(t.customer?.full_name||'Cliente')} · ${streamingEsc(t.platform?.name||'Plataforma')}</b><div class="streaming-reminder-meta"><span class="streaming-badge ${streamingReminderClass(t.kind)}">${streamingEsc(t.label)}</span><span>${streamingDate(t.sub.expires_at)}</span>${done?`<span class="streaming-reminder-done">Gestionado hoy${opened?` · ${streamingDate(opened,true)}`:''}</span>`:''}${!phone?'<span>Sin WhatsApp</span>':''}</div></div><div class="streaming-reminder-actions"><button class="ghost" type="button" onclick="streamingReminderManage(${t.id},'${t.kind}')">Gestionar</button><button class="ghost" type="button" ${(phone&&!done)?'':'disabled'} onclick="streamingReminderWhatsApp(${t.id},'${t.kind}')">${done?'Gestionado':'WhatsApp'}</button></div></article>`}).join('')||'<div class="streaming-reminder-empty">No hay recordatorios en este filtro.</div>'}</div>`;
}

const streamingFetchAllBeforeReminderLogs=streamingFetchAll;
streamingFetchAll=async function(){await streamingFetchAllBeforeReminderLogs();await streamingLoadReminderLogs()};
const streamingRenderBeforeReminders=renderStreamingSubscriptions;
renderStreamingSubscriptions=function(){streamingRenderBeforeReminders();installStreamingReminderCenter()};
setTimeout(async()=>{try{await streamingLoadReminderLogs();installStreamingReminderCenter()}catch(e){console.error(e);streamingToast('No se pudo cargar el historial de recordatorios')}},0);
