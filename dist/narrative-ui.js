import {CAMPAIGN,NODES,nodeById,nextNode,nodeAccess,optionAvailable,commitDecision,choiceConflicts,crossedConsequences,callbacksAt,markCallbacks,visibleCallbacks,chapterByRegion,chapterDecisions,createEcho,epilogue} from './narrative-core.js';
import {assetSlot,assetFrame,assetById} from './asset-slots.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={elia:'Elia',nara:'Nara',lua:'Lúa',oren:'Oren',sira:'Sira',iria:'Iria',dara:'Dara',aren:'Aren'};
const button=(action,label,id='',extra='')=>'<button class="secondary-button" data-action="'+action+'" data-id="'+esc(id)+'" '+extra+'>'+label+'</button>';
export function createNarrativeUI(api){
 let echo=null,echoRegion=null,lastNode=null;
 const active=()=>echo||api.state();
 const persist=()=>echo?true:api.save();
 function backdrop(n,branch=null){
  const c=CAMPAIGN.chapters.find(c=>c.nodes.some(x=>x.id===n.id)),r=c?.region_id||'bosque',i=n.id.startsWith('P.')?'prologo':r+'-'+n.id.split('.')[1];
  return '<div class="narrative-scene">'+assetSlot('bg-'+i,api.sceneArt(r,branch?2:0),'narrative-background')+(branch?assetSlot('scene-'+r+'-rama-'+branch,'','narrative-overlay'):'')+'</div>';
 }
 function portrait(n,expression='neutral'){
  const actor=n.speaker||'elia',id='portrait-'+actor+'-'+expression,a=assetById(id),use=a?.status==='ready'?id:'portrait-'+actor+'-neutral';
  return '<div class="dialogue-speaker">'+assetFrame('ui-portrait',assetSlot(use,api.icon('person')),'speaker-portrait')+'<div><span class="story-speaker">'+esc(names[actor]||actor)+'</span><p class="subtle">Las voces del Velo</p></div></div>';
 }
 function playerText(text){return String(text).replace(/C([1-5])\.[1-4]/g,(_,i)=>CAMPAIGN.chapters[Number(i)-1].region).replace(/\bC([1-5])\b/g,(_,i)=>CAMPAIGN.chapters[Number(i)-1].region);}
 function controls(s,n){
  const chapter=CAMPAIGN.chapters.find(c=>c.nodes.some(x=>x.id===n?.id)),list=chapter?.nodes||CAMPAIGN.prologue,current=nextNode(s);
  return '<div class="chapter-nav">'+list.map(x=>button('narrative-node','Escena '+x.id.split('.')[1],x.id,s.narrative.decisions[x.id]||current?.id===x.id?'':'disabled')).join('')+'</div>';
 }
 function show(id=null){
  const s=active();let n=id?nodeById(id):nextNode(s);
  if(!n){showEnding();return;}
  const access=nodeAccess(s,n.id);
  if(!access.ok&&nextNode(s)?.id!==n.id){api.toast(access.message);return;}
  lastNode=n.id;markCallbacks(s,n.id);persist();
  const old=s.narrative.decisions[n.id],o=old?n.options.find(x=>x.id===old.optionId):null;
  const callbacks=callbacksAt(s,n.id);
  const body=portrait(n,({'1':'neutral','2':'preocupacion','3':'duda','4':'firme'})[n.id.split('.')[1]]||'neutral')+'<span class="eyebrow">'+esc(n.id.startsWith('P.')?'PRÓLOGO':CAMPAIGN.chapters.find(c=>c.nodes.includes(n)).region)+'</span><h2 id="modalHeading">'+esc(n.title)+'</h2>'+
   (n.id==='P.1'?'<details><summary>Leer la apertura</summary>'+CAMPAIGN.intro_panels.map(p=>'<h3>'+esc(p[0])+'</h3><p>'+esc(p[1])+'</p>').join('')+'</details>':'')+
   '<p class="story-text">'+esc(n.scene)+'</p><p class="notice">'+esc(n.player_hint||n.foreshadow)+'</p>'+
   callbacks.slice(0,2).map(c=>assetFrame('ui-bubble','<small>UNA HUELLA DE '+esc(playerText(c.source))+'</small><p>'+esc(playerText(c.text))+'</p>','dialogue-bubble story-trace')).join('')+
   (callbacks.length>2?'<p class="subtle">Hay '+(callbacks.length-2)+' huellas más en tu crónica.</p>':'')+
   (old?'<div class="chosen-path"><div><h3>Tu decisión permanece</h3><p>'+esc(o.label)+'</p><p>'+esc(o.immediate)+'</p></div></div>':
    !access.ok?'<p class="notice">'+esc('Esta página despertará con la memoria '+n.id.split('.')[1]+' de este lugar. Puedes registrar el sello ahora y continuar después.')+'</p><div class="narrative-controls">'+button('code','Canjear un sello')+'</div>':
    '<h3>'+esc(n.question)+'</h3><div class="narrative-options">'+n.options.map(o=>'<button class="story-choice narrative-option asset-frame" data-asset-id="ui-choice" '+(assetById('ui-choice').status==='ready'?'style="border-image-source:url(/'+assetById('ui-choice').path+')"':'')+' data-action="narrative-preview" data-id="'+esc(n.id)+'" data-option="'+o.id+'" '+(optionAvailable(s,o)?'':'disabled')+'><strong>'+esc(o.label)+'</strong>'+(!optionAvailable(s,o)?'<small>Esta vía requiere información o acuerdos que no reuniste.</small>':'')+'</button>').join('')+'</div>')+
   controls(s,n)+'<div class="narrative-controls">'+(old?button('narrative-next','Continuar la historia'):'')+button('close','Volver al Atlas')+(echo?button('echo-close','Salir del eco alterno'):'')+'</div>';
  api.open(backdrop(n)+(echo?'<div class="echo-notice">ECO ALTERNO · simulación sin cambios en tu partida ni recompensas.</div>':'')+assetFrame('ui-dialogue',body,'dialogue-box'),{wide:true});
 }
 function preview(id,optionId){
  const s=active(),n=nodeById(id),o=n?.options.find(o=>o.id===optionId);
  if(!o||!nodeAccess(s,id).ok||s.narrative.decisions[id]||!optionAvailable(s,o)){api.toast('Esta alternativa no está disponible.');return;}
  const conflicts=choiceConflicts(s,id,optionId);
  let content='<span class="eyebrow">ANTES DE DEJAR UNA HUELLA</span><h2 id="modalHeading">'+esc(o.label)+'</h2><p><strong>Lo que intentas proteger:</strong> '+esc(o.motive)+'</p><p><strong>Lo que puede costar:</strong> '+esc(o.forecast_cost)+'</p>';
  if(conflicts.length){
   content+='<div class="narrative-confirm"><h3>Una palabra anterior vuelve contigo</h3>'+conflicts.map(k=>'<p>'+esc(k.subject)+'</p>').join('')+'<p>Esta acción cambia el alcance del acuerdo. Pedir una revisión conserva las objeciones; no garantiza que todos acepten.</p></div><div class="narrative-controls">'+button('narrative-confirm','Proceder y registrar la excepción',id,'data-option="'+optionId+'" data-gate="exception"')+button('narrative-confirm','Pedir revisión y registrar el disenso',id,'data-option="'+optionId+'" data-gate="review"')+'</div>';
  }else content+='<div class="narrative-controls">'+button('narrative-confirm','Confirmar esta decisión',id,'data-option="'+optionId+'"')+'</div>';
  content+='<div class="narrative-controls">'+button('narrative-node','Volver a las alternativas',id)+'</div><p class="subtle">Al confirmar, esta decisión permanece en la partida. Podrás releerla cuando quieras.</p>';
  api.open('<div class="modal-pad">'+content+'</div>');
 }
 function confirm(id,optionId,gate){
  const s=active(),result=commitDecision(s,id,optionId,gate||null);
  if(!result.ok){api.toast(result.message);return;}
  if(!persist()){echo=null;api.toast('No se confirmó el guardado. Conserva una copia y vuelve a intentarlo.');return;}
  api.render();const n=nodeById(id),c=CAMPAIGN.chapters.find(c=>c.nodes.includes(n));
  const branch=c?.branch_scenes.find(b=>b.when===id+'='+optionId);
  api.open(backdrop(n,branch?optionId:null)+assetFrame('ui-dialogue',portrait(n,n.id.endsWith('.4')?'alivio':'atento')+'<span class="eyebrow">'+(echo?'ECO ALTERNO':'UNA HUELLA CONFIRMADA')+'</span><h2 id="modalHeading">El Atlas conserva tu decisión.</h2><p class="story-text">'+esc(result.option.immediate)+'</p>'+(branch?'<p class="story-text">'+esc(branch.text)+'</p>':'')+(result.chapterComplete?'<p class="notice">El capítulo recuperó su color. Las pérdidas y acuerdos siguen en la crónica.</p>':'')+'<div class="narrative-controls">'+button('narrative-next','Continuar')+button('close','Volver al Atlas')+(echo?button('echo-close','Cerrar simulación'):'')+'</div>','dialogue-box'),{wide:true});
 }
 function openRegion(regionId){
  echo=null;const s=active(),next=nextNode(s);
  if(next?.id.startsWith('P.'))return show(next.id);
  const c=chapterByRegion(regionId);if(!c)return show();
  const node=c.nodes.find(n=>!s.narrative.decisions[n.id]);
  if(!node)return show(c.nodes.at(-1).id);
  if(next?.id!==node.id){api.toast('Esta historia espera a que cierres el capítulo anterior.');return;}
  return show(node.id);
 }
 function record(){
  const s=api.state(),ns=s.narrative;
  const decisions=NODES.filter(n=>ns.decisions[n.id]);
  const cb=visibleCallbacks(s);
  return '<div class="section-heading"><h2>La palabra y sus huellas</h2><p>'+decisions.length+' / 22 decisiones</p></div>'+
   (ns.flags.oath?'<p class="notice">'+assetSlot('oath-'+ns.flags.oath,api.icon('feather'))+' Juramento de '+esc(ns.flags.oath)+'. El Atlas recuerda lo que prometiste y qué cambió después.</p>':'<p class="notice">El prólogo te invita a elegir un juramento. Cada principio tiene límites.</p>')+
   '<div class="narrative-journal">'+ns.commitments.map(k=>'<article><div class="narrative-marks">'+assetSlot('commitment-'+k.state,api.icon('feather'))+'<small>'+esc(k.state.replaceAll('_',' '))+'</small></div><h3>'+esc(k.subject)+'</h3><p>Nació en '+esc(k.origin)+'. Revisión en '+esc(k.review_at)+'.</p>'+k.history.slice(1).map(h=>'<p>'+esc(h.disagreement||h.note||'Se conserva el acuerdo original y su revisión.')+'</p>').join('')+'</article>').join('')+'</div>'+
   (s.legacyArchive?'<p class="migration-note">Conservamos tus memorias, recompensas y elecciones del prototipo anterior en un archivo. La novela comienza desde el prólogo para que puedas elegir con el nuevo contexto.</p>':'')+
   '<div class="narrative-journal">'+decisions.map(n=>{const o=n.options.find(x=>x.id===ns.decisions[n.id].optionId);return '<article><small>'+esc(n.id)+'</small><h3>'+esc(o.label)+'</h3><p>'+esc(o.immediate)+'</p>'+button('narrative-node','Releer la escena',n.id)+'</article>';}).join('')+'</div>'+
   (cb.length?'<div class="section-heading"><h2>Lo que volvió más adelante</h2></div><div class="narrative-journal">'+cb.map(c=>'<article><small>Desde '+esc(playerText(c.source))+' · al llegar a '+esc(playerText(c.anchor))+'</small><p>'+esc(playerText(c.text))+'</p></article>').join('')+'</div>':'')+
   (crossedConsequences(s).length?'<h3>Cuando dos decisiones se encuentran</h3><div class="narrative-journal">'+crossedConsequences(s).map(t=>'<article><p>'+esc(t)+'</p></article>').join('')+'</div>':'')+
   (epilogue(s)?'<div class="narrative-controls">'+button('narrative-ending','Leer mi epílogo')+'</div>':'');
 }
 function showEnding(){
  const s=active(),e=epilogue(s);if(!e)return show();
  markCallbacks(s,'EPI');persist();
  const voices=e.places.slice(-2);
  api.open(assetSlot('bg-final-'+e.regime,api.sceneArt('eclipse',2),'narrative-background')+'<div class="modal-pad"><span class="eyebrow">EL LEGADO DE '+esc(s.name)+'</span><h2 id="modalHeading">'+esc(e.title)+'</h2><p class="story-text">'+esc(e.text)+'</p>'+e.places.map(p=>'<div class="story-trace"><h3>'+esc(p.title)+'</h3><p>'+esc(p.intervention.immediate)+'</p><p>'+esc(p.institution.immediate)+'</p><p>Lo que sigue pesando: '+esc(p.intervention.forecast_cost)+'</p></div>').join('')+'<h3>Dos voces que quedan</h3><p>Iria reconoce un avance: «'+esc(voices[0].institution.immediate)+'»</p><p>Aren conserva una objeción: «'+esc(voices[1].institution.forecast_cost)+'»</p><p class="notice">Tu juramento de '+esc(s.narrative.flags.oath)+' permanece junto a '+s.narrative.commitments.length+' compromisos. Revisa en la crónica cuáles siguen pendientes.</p><p class="story-text">'+esc(e.question)+'</p><div class="narrative-controls">'+button('close','Conservar mi legado')+'</div></div>',{wide:true});
 }
 function handle(b){
  const {action,id,option,gate}=b.dataset;
  if(action==='narrative-node'){show(id);return true;}
  if(action==='narrative-preview'){preview(id,option);return true;}
  if(action==='narrative-confirm'){confirm(id,option,gate);return true;}
  if(action==='narrative-next'){
   if(echo&&chapterDecisions(echo,echoRegion)===4){api.open('<div class="modal-pad"><h2 id="modalHeading">Este eco termina aquí.</h2><p>La variante queda fuera de tu partida principal y no emite recompensas.</p>'+button('echo-close','Volver a mi Atlas')+'</div>');}
   else show();return true;
  }
  if(action==='narrative-ending'){echo=null;showEnding();return true;}
  if(action==='echo-start'){echo=createEcho(api.state(),id);if(!echo){api.toast('Cierra primero este capítulo para explorar sus ecos.');return true;}echoRegion=id;show();return true;}
  if(action==='echo-close'){echo=null;echoRegion=null;api.close();api.render();return true;}
  return false;
 }
 return {show,openRegion,record,handle,showEnding,resetEcho:()=>{echo=null;echoRegion=null;}};
}
