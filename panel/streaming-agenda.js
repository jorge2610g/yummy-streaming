/* YummyPro Streaming · agenda diaria v0.9.0 */
let streamingAgendaMode='pending';

function streamingAgendaTasks(){
 return streamingReminderTasks().map(t=>({...t,done:streamingReminderOpenedToday(t.id,t.kind),hasPhone:!!t.customer?.phone}));
}
function streamingAgendaPriority(task){
 if(task.kind==='expired')return 0;
 if(task.kind==='urgent')return 1;
 if(task.kind==='payment')return 2;
 if(task.kind==='delivery')return 3;
 return 9;
}
function streamingAgendaPending(){return streamingAgendaTasks().filter(t=>!t.done).sort((a,b)=>streamingAgendaPriority(a)-streamingAgendaPriority(b)||new Date(a.sub.expires_at)-new Date(b.sub.expires_at))}
function streamingAgendaLabel(task){
 if(!task)return 'Sin tareas pendientes';
 const name=task.customer?.full_name||'Cliente',platform=task.platform?.name||'Plataforma';
 return `${name} · ${platform} · ${task.label}`;
}
function streamingAgendaFocus(kind){
 streamingReminderView=kind||'all';
 renderStreamingReminderQueue();
 document.getElementById('streamingReminderCenter')?.scrollIntoView({behavior:'smooth',block:'start'});
}
async function streamingAgendaRefresh(){
 try{
  await streamingFetchAll();
  renderStreamingSubscriptions();
  window.dispatchEvent(new Event('streaming:data-loaded'));
  streamingToast('Agenda actualizada');
 }catch(e){console.error(e);streamingToast('No se pudo actualizar la agenda')}
}
function streamingAgendaSetMode(mode,btn){
 streamingAgendaMode=mode;
 document.querySelectorAll('[data-streaming-agenda-mode]').forEach(x=>x.classList.toggle('active',x===btn));
 renderStreamingAgenda();
}
function installStreamingAgenda(){
 const action=document.getElementById('streamingActionCenter');if(!action)return;
 if(!document.getElementById('streaming-agenda-style')){
  const style=document.createElement('style');style.id='streaming-agenda-style';style.textContent=`
  .streaming-agenda{margin-bottom:14px;padding:14px;border:1px solid var(--line,#2b2b2b);border-radius:14px;background:var(--soft,#151515)}
  .streaming-agenda-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;flex-wrap:wrap}.streaming-agenda-head h3{margin:0;font-size:16px}.streaming-agenda-head p{margin:4px 0 0;font-size:12px;color:var(--mut,#aaa)}
  .streaming-agenda-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:12px 0}.streaming-agenda-stat{padding:10px;border:1px solid var(--line,#2b2b2b);border-radius:11px}.streaming-agenda-stat b{display:block;font-size:20px}.streaming-agenda-stat span{font-size:11px;color:var(--mut,#aaa)}
  .streaming-agenda-progress{height:8px;border-radius:999px;background:var(--ghost,#222);overflow:hidden}.streaming-agenda-progress i{display:block;height:100%;background:var(--a,#ffb703)}
  .streaming-agenda-next{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:10px;padding:10px;border:1px dashed var(--line,#2b2b2b);border-radius:11px}.streaming-agenda-next div{min-width:0}.streaming-agenda-next b{display:block;font-size:13px}.streaming-agenda-next span{font-size:12px;color:var(--mut,#aaa)}
  .streaming-agenda-tools{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.streaming-agenda-tools button{padding:8px 10px;font-size:12px}
  @media(max-width:700px){.streaming-agenda-stats{grid-template-columns:1fr 1fr}.streaming-agenda-next{align-items:stretch;flex-direction:column}.streaming-agenda-next button{width:100%}}
  `;document.head.appendChild(style)
 }
 let box=document.getElementById('streamingAgenda');
 if(!box){box=document.createElement('section');box.id='streamingAgenda';box.className='streaming-agenda';action.prepend(box)}
 renderStreamingAgenda();
}
function renderStreamingAgenda(){
 const box=document.getElementById('streamingAgenda');if(!box)return;
 const tasks=streamingAgendaTasks(),pending=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done),urgent=pending.filter(t=>['expired','urgent'].includes(t.kind)),noPhone=pending.filter(t=>!t.hasPhone),total=tasks.length,progress=total?Math.round((done.length/total)*100):100;
 const next=streamingAgendaPending()[0]||null;
 const visible=streamingAgendaMode==='done'?done:pending;
 const label=streamingAgendaMode==='done'?'Gestionadas hoy':'Pendientes ahora';
 box.innerHTML=`<div class="streaming-agenda-head"><div><h3>Agenda de hoy <span class="streaming-badge muted">v0.9.0</span></h3><p>Prioriza vencidas, próximas, cobros y entregas. El progreso se calcula con el historial sincronizado.</p></div><button class="ghost" type="button" onclick="streamingAgendaRefresh()">Actualizar</button></div><div class="streaming-agenda-stats"><button class="streaming-agenda-stat ghost" type="button" onclick="streamingAgendaSetMode('pending',this)" data-streaming-agenda-mode="pending"><b>${pending.length}</b><span>Pendientes</span></button><button class="streaming-agenda-stat ghost" type="button" onclick="streamingAgendaSetMode('done',this)" data-streaming-agenda-mode="done"><b>${done.length}</b><span>Gestionadas hoy</span></button><button class="streaming-agenda-stat ghost" type="button" onclick="streamingAgendaFocus('expired')"><b>${urgent.length}</b><span>Urgentes</span></button><button class="streaming-agenda-stat ghost" type="button" onclick="streamingAgendaFocus('all')"><b>${noPhone.length}</b><span>Sin WhatsApp</span></button></div><div class="streaming-agenda-progress"><i style="width:${Math.max(0,Math.min(100,progress))}%"></i></div><div class="streaming-agenda-next"><div><b>${streamingEsc(label)} · ${visible.length}</b><span>${streamingEsc(next?streamingAgendaLabel(next):'No queda ninguna tarea prioritaria por gestionar')}</span></div><button class="primary" type="button" ${next&&next.hasPhone?'':'disabled'} onclick="streamingReminderOpenNext()">Gestionar siguiente</button></div><div class="streaming-agenda-tools"><button class="ghost" type="button" onclick="streamingAgendaFocus('payment')">Cobros</button><button class="ghost" type="button" onclick="streamingAgendaFocus('delivery')">Entregas</button><button class="ghost" type="button" onclick="streamingAgendaFocus('urgent')">Próximas</button><button class="ghost" type="button" onclick="streamingAgendaFocus('expired')">Vencidas</button><span class="streaming-badge muted">Avance ${progress}%</span></div>`;
 document.querySelectorAll('[data-streaming-agenda-mode]').forEach(x=>x.classList.toggle('active',x.dataset.streamingAgendaMode===streamingAgendaMode));
}
function installStreamingControlV100(){
 const footer=document.querySelector('.admin-version');if(footer)footer.textContent='Streaming · Versión v1.2.7';
 if(document.getElementById('streaming-control-script-v1000'))return;
 const script=document.createElement('script');script.id='streaming-control-script-v1000';script.src='/panel/streaming-control.js?v=1000';document.body.appendChild(script);
}

const streamingReminderRenderBeforeAgenda=renderStreamingReminderQueue;
renderStreamingReminderQueue=function(){streamingReminderRenderBeforeAgenda();installStreamingAgenda()};
setTimeout(()=>{try{installStreamingAgenda();installStreamingControlV100()}catch(e){console.error(e)}},0);
