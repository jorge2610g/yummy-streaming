/* YummyPro Streaming · entrega, activación y centro de acciones v0.6.0 */
function streamingDeliveryStatus(row){return row?.delivery_status==='delivered'?'delivered':'pending'}
function streamingDeliveryLabel(row){return streamingDeliveryStatus(row)==='delivered'?'Entregada':'Por entregar'}
function streamingDeliveryClass(row){return streamingDeliveryStatus(row)==='delivered'?'streaming-badge good':'streaming-badge warning'}
function installStreamingDeliveryFilters(){
 const filters=document.querySelector('#streaming_subscriptions .streaming-filters');
 if(!filters||filters.querySelector('[data-streaming-filter="delivery_pending"]'))return;
 const pending=document.createElement('button');pending.className='ghost';pending.dataset.streamingFilter='delivery_pending';pending.textContent='Por entregar';pending.onclick=()=>setStreamingSubscriptionView('delivery_pending',pending);
 const delivered=document.createElement('button');delivered.className='ghost';delivered.dataset.streamingFilter='delivery_delivered';delivered.textContent='Entregadas';delivered.onclick=()=>setStreamingSubscriptionView('delivery_delivered',delivered);
 filters.append(pending,delivered);
}

function streamingActionFilter(view){
 streamingSubscriptionView=view;
 const btn=document.querySelector(`[data-streaming-filter="${view}"]`);
 document.querySelectorAll('[data-streaming-filter]').forEach(x=>x.classList.toggle('active',x===btn));
 renderStreamingSubscriptions();
 document.getElementById('streamingSubscriptionList')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function installStreamingActionCenter(){
 const shell=document.querySelector('#streaming_subscriptions .streaming-shell');if(!shell)return;
 let box=document.getElementById('streamingActionCenter');
 if(!box){
  const style=document.createElement('style');style.id='streaming-action-center-style';style.textContent=`
  #streamingActionCenter{margin:16px 0 2px;padding:16px;border:1px solid var(--line,#2b2b2b);border-radius:18px;background:linear-gradient(145deg,#8b5cf610,transparent)}
  .streaming-action-title{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}.streaming-action-title b{font-size:16px}.streaming-action-title span{font-size:12px;color:var(--mut,#aaa)}
  .streaming-action-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.streaming-action-card{border:1px solid var(--line,#2b2b2b);background:var(--soft,#151515);border-radius:14px;padding:13px;text-align:left;color:inherit;cursor:pointer;min-height:92px}.streaming-action-card:hover{border-color:#8b5cf680}.streaming-action-card strong{display:block;font-size:28px;line-height:1;margin-bottom:8px}.streaming-action-card small{display:block;color:var(--mut,#aaa);line-height:1.25}.streaming-action-card.danger strong{color:#fb7185}.streaming-action-card.warn strong{color:#fbbf24}.streaming-action-card.good strong{color:#34d399}
  @media(max-width:760px){.streaming-action-grid{grid-template-columns:1fr 1fr}}@media(max-width:430px){.streaming-action-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(style);
  box=document.createElement('section');box.id='streamingActionCenter';
  const head=shell.querySelector('.streaming-head');head?.after(box);
 }
 const active=streamingSubscriptions.filter(s=>streamingDerivedStatus(s)==='active');
 const pendingPayment=streamingSubscriptions.filter(s=>streamingPaymentStatus(s)==='pending'&&streamingDerivedStatus(s)!=='cancelled').length;
 const pendingDelivery=streamingSubscriptions.filter(s=>streamingDeliveryStatus(s)==='pending'&&!['cancelled','paused'].includes(streamingDerivedStatus(s))).length;
 const urgent=active.filter(s=>{const d=streamingDaysLeft(s.expires_at);return d!=null&&d>=0&&d<=3}).length;
 const expired=streamingSubscriptions.filter(s=>streamingDerivedStatus(s)==='expired').length;
 box.innerHTML=`<div class="streaming-action-title"><div><b>Centro de acciones</b><span> · lo que requiere atención ahora</span></div><span>v0.6.0</span></div><div class="streaming-action-grid"><button class="streaming-action-card warn" type="button" onclick="streamingActionFilter('payment_pending')"><strong>${pendingPayment}</strong><small>Cobros pendientes</small></button><button class="streaming-action-card warn" type="button" onclick="streamingActionFilter('delivery_pending')"><strong>${pendingDelivery}</strong><small>Entregas pendientes</small></button><button class="streaming-action-card" type="button" onclick="streamingActionFilter('urgent')"><strong>${urgent}</strong><small>Vencen en 3 días</small></button><button class="streaming-action-card danger" type="button" onclick="streamingActionFilter('expired')"><strong>${expired}</strong><small>Suscripciones vencidas</small></button></div>`;
}

renderStreamingSubscriptions=function(){
 const root=document.getElementById('streamingSubscriptionList');if(!root)return;
 installStreamingPaymentUi?.();installStreamingDeliveryFilters();
 const q=String(streamingSubscriptionSearch||document.getElementById('streamingSubscriptionSearch')?.value||'').trim().toLowerCase();
 const active=streamingSubscriptions.filter(s=>streamingDerivedStatus(s)==='active'),expiring=active.filter(s=>{const d=streamingDaysLeft(s.expires_at);return d!=null&&d>=0&&d<=7}),expired=streamingSubscriptions.filter(s=>streamingDerivedStatus(s)==='expired'),pendingPayments=streamingSubscriptions.filter(s=>streamingPaymentStatus(s)==='pending'&&streamingDerivedStatus(s)!=='cancelled');
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v)};set('streamingActiveCount',active.length);set('streamingExpiringCount',expiring.length);set('streamingExpiredCount',expired.length);set('streamingFreeSlotsCount',pendingPayments.length);
 const pendingLabel=document.getElementById('streamingFreeSlotsCount')?.parentElement?.querySelector('span');if(pendingLabel)pendingLabel.textContent='Pendientes de cobro';
 installStreamingActionCenter();
 let rows=streamingSubscriptions.filter(s=>{const st=streamingDerivedStatus(s),d=streamingDaysLeft(s.expires_at),pay=streamingPaymentStatus(s),delivery=streamingDeliveryStatus(s);if(streamingSubscriptionView==='active'&&st!=='active')return false;if(streamingSubscriptionView==='today'&&!(st==='active'&&d===0))return false;if(streamingSubscriptionView==='urgent'&&!(st==='active'&&d!=null&&d>=0&&d<=3))return false;if(streamingSubscriptionView==='expiring'&&!(st==='active'&&d!=null&&d>=0&&d<=7))return false;if(streamingSubscriptionView==='expired'&&st!=='expired')return false;if(streamingSubscriptionView==='payment_pending'&&pay!=='pending')return false;if(streamingSubscriptionView==='payment_paid'&&pay!=='paid')return false;if(streamingSubscriptionView==='delivery_pending'&&delivery!=='pending')return false;if(streamingSubscriptionView==='delivery_delivered'&&delivery!=='delivered')return false;const c=streamingCustomer(s.customer_id),p=streamingPlatform(s.platform_id),a=streamingAccount(s.account_id);return !q||[c?.full_name,c?.phone,p?.name,a?.label,s.profile_label,s.payment_method,pay,delivery].some(v=>String(v||'').toLowerCase().includes(q))});
 rows.sort((a,b)=>new Date(a.expires_at)-new Date(b.expires_at));
 root.innerHTML=rows.map(s=>{const c=streamingCustomer(s.customer_id)||{},p=streamingPlatform(s.platform_id)||{},a=streamingAccount(s.account_id),days=streamingDaysLeft(s.expires_at),paid=streamingPaymentStatus(s)==='paid',delivered=streamingDeliveryStatus(s)==='delivered';return `<article class="streaming-row"><div class="streaming-row-main"><div class="streaming-row-title"><b>${streamingEsc(c.full_name||'Cliente')}</b><span class="${streamingStatusClass(s)}">${streamingEsc(streamingStatusLabel(s))}</span><span class="${streamingPaymentClass(s)}">${streamingPaymentLabel(s)}</span><span class="${streamingDeliveryClass(s)}">${streamingDeliveryLabel(s)}</span></div><div class="streaming-row-meta"><span>▶ ${streamingEsc(p.name||'Plataforma')}</span>${a?`<span>▣ ${streamingEsc(a.label)}</span>`:''}${s.profile_label?`<span>Perfil: ${streamingEsc(s.profile_label)}</span>`:''}<span>${paid?`Cobrado: ${streamingMoney(s.paid_amount||s.price,s.currency_code)}${s.payment_method?` · ${streamingEsc(s.payment_method)}`:''}`:`Por cobrar: ${streamingMoney(s.price,s.currency_code)}`}</span></div><div class="streaming-dates"><span>Inicio <b>${streamingDate(s.starts_at)}</b></span><span>Vence <b>${streamingDate(s.expires_at)}</b></span>${days!=null?`<span>${days<0?`${Math.abs(days)} días vencida`:days===0?'Vence hoy':`${days} días restantes`}</span>`:''}${paid&&s.paid_at?`<span>Pagada <b>${streamingDate(s.paid_at,true)}</b></span>`:''}${delivered&&s.delivered_at?`<span>Entregada <b>${streamingDate(s.delivered_at,true)}</b></span>`:''}</div></div><div class="streaming-row-actions"><button class="ghost" type="button" onclick="streamingOpenWhatsApp(${s.id})">WhatsApp</button><button class="ghost" type="button" onclick="streamingOpenPayment(${s.id})">Cobro</button><button class="ghost" type="button" onclick="streamingOpenDelivery(${s.id})">Entrega</button>${delivered&&c.phone?`<button class="ghost" type="button" onclick="streamingDeliveryWhatsApp(${s.id})">Avisar activación</button>`:''}<button class="ghost" type="button" onclick="streamingOpenSubscription(${s.id})">Editar</button><button class="primary" type="button" onclick="streamingOpenRenewal(${s.id})">Renovar</button></div></article>`}).join('')||'<div class="streaming-empty">No hay suscripciones que coincidan con este filtro.</div>';
}

function streamingOpenDelivery(id){
 if(!streamingWritable())return;const s=streamingSubscription(id);if(!s)return;const c=streamingCustomer(s.customer_id),p=streamingPlatform(s.platform_id),delivered=streamingDeliveryStatus(s)==='delivered';
 streamingShowModal('Entrega / activación',`<input id="streamingDeliverySubId" type="hidden" value="${s.id}"><div class="streaming-renew-summary"><b>${streamingEsc(c?.full_name||'Cliente')}</b><span>${streamingEsc(p?.name||'Plataforma')}</span><span>Vence: ${streamingDate(s.expires_at)}</span></div><label>Estado de entrega<select id="streamingDeliveryState"><option value="pending" ${delivered?'':'selected'}>Pendiente</option><option value="delivered" ${delivered?'selected':''}>Entregada / activada</option></select></label>${s.delivered_at?`<p class="mut">Última entrega: ${streamingDate(s.delivered_at,true)}</p>`:''}<p class="mut">Este control solo registra el estado de entrega. No almacena contraseñas del servicio.</p>`,saveStreamingDelivery)
}
async function saveStreamingDelivery(){
 const id=Number(document.getElementById('streamingDeliverySubId')?.value),state=document.getElementById('streamingDeliveryState')?.value==='delivered'?'delivered':'pending',s=streamingSubscription(id);if(!id||!s)return streamingToast('Suscripción no encontrada');
 const row={delivery_status:state,delivered_at:state==='delivered'?(s.delivered_at||new Date().toISOString()):null,updated_at:new Date().toISOString()};
 const {error}=await sb.from('streaming_subscriptions').update(row).eq('id',id).eq('restaurant_id',currentRestaurant);if(error)return streamingToast(error.message);streamingCloseModal();await streamingFetchAll();renderStreamingSubscriptions();streamingToast(state==='delivered'?'Suscripción marcada como entregada':'Entrega marcada como pendiente')
}
function streamingDeliveryWhatsApp(id){
 const s=streamingSubscription(id),c=s&&streamingCustomer(s.customer_id),p=s&&streamingPlatform(s.platform_id);if(!c?.phone)return streamingToast('Este cliente no tiene WhatsApp registrado');
 const profile=s.profile_label?` Tu perfil/cupo es ${s.profile_label}.`:'';const message=`Hola ${c.full_name}, tu acceso de ${p?.name||'streaming'} ya quedó activado.${profile} El servicio queda vigente hasta el ${streamingDate(s.expires_at)}.`;window.open(streamingPhoneUrl(c.phone,message),'_blank','noopener')
}
installStreamingDeliveryFilters();
