import {CAMPAIGN} from './narrative-data.js';
export {CAMPAIGN};
export const NODES=[...CAMPAIGN.prologue,...CAMPAIGN.chapters.flatMap(c=>c.nodes)];
export const nodeById=id=>NODES.find(n=>n.id===id);
export const chapterByRegion=id=>CAMPAIGN.chapters.find(c=>c.region_id===id);
const copy=x=>JSON.parse(JSON.stringify(x));
export function freshNarrative(){return {version:CAMPAIGN.version,runId:globalThis.crypto?.randomUUID?.()||'run-'+Date.now()+'-'+Math.random(),decisions:{},flags:{},trust:{},knowledge:{},commitments:[],callbacks:[],seenCallbacks:[],events:[]};}
export function nextNode(s){return NODES.find(n=>!s.narrative.decisions[n.id])||null;}
export function chapterDecisions(s,id){return chapterByRegion(id)?.nodes.filter(n=>s.narrative.decisions[n.id]).length||0;}
export function optionAvailable(s,o){const f=s.narrative.flags;const has=t=>{const [k,v]=t.split('=');return f[k]===v;};return (!o.requires.all||o.requires.all.every(has))&&(!o.requires.any||o.requires.any.some(has));}
export function nodeAccess(s,id){
  const node=nodeById(id);if(!node)return {ok:false,message:'Esta escena no existe.'};
  if(s.narrative.decisions[id])return {ok:true,readOnly:true};
  if(nextNode(s)?.id!==id)return {ok:false,message:'Continúa primero la escena anterior.'};
  if(id.startsWith('P.'))return {ok:true};
  const c=CAMPAIGN.chapters.find(c=>c.nodes.some(n=>n.id===id));
  const memory=c.region_id+'-'+id.split('.')[1];
  return s.completed.includes(memory)?{ok:true}:{ok:false,message:'Esta escena espera la memoria '+memory+'. Puedes guardar códigos adelantados y continuar luego.'};
}
const conflicts={K_TESTIGOS:{'C4.2':['A','C']},K_CAPAS:{'C4.2':['A']},K_COMUN:{'C5.1':['A']},K_RESERVA:{'C1.3':['A'],'C4.2':['A']},K_MANTENIMIENTO:{'C3.2':['A']},K_DISPUTA:{'C5.1':['A']}};
export function choiceConflicts(s,nodeId,optionId){return s.narrative.commitments.filter(k=>['vigente','pendiente','en_tension'].includes(k.state)&&conflicts[k.id]?.[nodeId]?.includes(optionId));}
export function callbacksAt(s,id){return s.narrative.callbacks.filter(c=>c.anchor===id);}
export function visibleCallbacks(s){const n=nextNode(s),past=NODES.findIndex(x=>x.id===n?.id);return s.narrative.callbacks.filter(c=>c.anchor==='EPI'?n===null:(!n||NODES.findIndex(x=>x.id===c.anchor)<=past));}
export function markCallbacks(s,id){for(const cb of callbacksAt(s,id))if(!s.narrative.seenCallbacks.includes(cb.id))s.narrative.seenCallbacks.push(cb.id);}
export function commitDecision(s,id,optionId,gate=null){
  const old=s.narrative.decisions[id];
  if(old)return old.optionId===optionId?{ok:true,duplicate:true}:{ok:false,message:'La escena ya conserva otra decisión. Puedes explorar variantes en Ecos alternos.'};
  const access=nodeAccess(s,id);if(!access.ok)return access;
  const node=nodeById(id),o=node.options.find(o=>o.id===optionId);
  if(!o||!optionAvailable(s,o))return {ok:false,message:'Esa alternativa necesita información que aún no forma parte de tu recorrido.'};
  const affected=choiceConflicts(s,id,optionId);
  if(affected.length&&!['exception','review'].includes(gate))return {ok:false,needsGate:true,message:'Revisa el compromiso antes de confirmar.',commitments:affected};
  const ns=s.narrative,time=Date.now();
  ns.decisions[id]={nodeId:id,optionId,eventId:o.event_id,gate:affected.length?gate:null,time};
  const [key,value]=o.set_flag.split('=');ns.flags[key]=value;
  ns.events.push({type:'decision',id:o.event_id,nodeId:id,optionId,gate:affected.length?gate:null,time});
  for(const actor of node.witnesses){
    ns.knowledge[actor]??=[];ns.knowledge[actor].push(o.event_id);
    const delta=o.trust_if_known[actor];if(Number.isFinite(delta))ns.trust[actor]=Math.max(-2,Math.min(2,(ns.trust[actor]||0)+delta));
  }
  for(const k of affected){k.state=gate==='exception'?'en_tension':'renegociado';k.history.push({at:id,state:k.state,action:gate,disagreement:gate==='review'?'La revisión conserva objeciones; no hay aprobación universal.':null});}
  for(const k of ns.commitments.filter(k=>k.review_at===id&&!affected.includes(k))){
    const sustained=(k.id==='K_TESTIGOS'&&optionId==='B')||(k.id==='K_CAPAS'&&optionId==='C');
    k.state=sustained?'sostenido':'pendiente';
    k.history.push({at:id,state:k.state,action:sustained?'observed_fulfillment':'review_due',note:sustained?'El protocolo acordado se sostuvo en esta publicación. Sus costes y objeciones permanecen.':'La revisión ha llegado; todavía hay acuerdos o tareas que atender.'});
  }
  for(const def of CAMPAIGN.commitments.filter(k=>k.origin===id+'='+optionId))ns.commitments.push({...copy(def),state:'vigente',history:[{at:id,state:'vigente',action:'created'}]});
  ns.callbacks.push({...copy(o.callback),source:id,optionId});
  markCallbacks(s,id);s.updatedAt=time;
  return {ok:true,option:o,chapterComplete:id.endsWith('.4'),finished:nextNode(s)===null};
}
export function reviewCommitment(s,id,action){
  const k=s.narrative.commitments.find(k=>k.id===id);if(!k||!['pending','renegotiate','repair','sustain'].includes(action))return false;
  const current=nextNode(s),reviewIndex=NODES.findIndex(n=>n.id===k.review_at),currentIndex=current?NODES.indexOf(current):NODES.length;
  if(currentIndex<=reviewIndex)return false;
  if(k.history.some(h=>h.action===action&&h.at===k.review_at))return false;
  k.state=({pending:'pendiente',renegotiate:'renegociado',repair:'reparado',sustain:'sostenido'})[action];
  k.history.push({at:k.review_at,state:k.state,action,kind:'guardian_record',note:'Registro de responsabilidad del guardián; no acredita consentimiento ajeno ni borra pérdidas.'});return true;
}
export function restoreNarrative(s,raw){
  if(!raw||raw.version!==CAMPAIGN.version||!raw.decisions||typeof raw.decisions!=='object')return null;
  const expected=Object.keys(raw.decisions);s.narrative=freshNarrative();
  if(typeof raw.runId==='string'&&raw.runId.length<100)s.narrative.runId=raw.runId;
  for(const n of NODES){const choice=raw.decisions[n.id];if(!choice)break;const result=commitDecision(s,n.id,choice.optionId,choice.gate);if(!result.ok)return null;}
  if(expected.length!==Object.keys(s.narrative.decisions).length)return null;
  for(const k of Array.isArray(raw.commitments)?raw.commitments:[]){
    const legit=s.narrative.commitments.find(x=>x.id===k.id);if(!legit)continue;
    for(const h of Array.isArray(k.history)?k.history:[])if(h.kind==='guardian_record')reviewCommitment(s,k.id,h.action);
  }
  s.narrative.seenCallbacks=(Array.isArray(raw.seenCallbacks)?raw.seenCallbacks:[]).filter(id=>s.narrative.callbacks.some(c=>c.id===id));return s.narrative;
}
export function createEcho(s,regionId){
  const chapter=chapterByRegion(regionId);if(!chapter||chapterDecisions(s,regionId)!==4)return null;
  const sandbox=copy(s),old=s.narrative.decisions,cut=NODES.findIndex(n=>n.id===chapter.nodes[0].id);
  sandbox.narrative=freshNarrative();sandbox.echo=true;
  for(const n of NODES.slice(0,cut)){const choice=old[n.id];commitDecision(sandbox,n.id,choice.optionId,choice.gate);}
  return sandbox;
}
export function epilogue(s){
  if(nextNode(s))return null;
  const ending=CAMPAIGN.endings.find(e=>e[0]===s.narrative.flags.final_regime);
  return {title:ending[1],text:ending[2],question:ending[4],regime:ending[0],places:CAMPAIGN.chapters.map(c=>({region:c.region_id,title:c.region,intervention:nodeById(c.id+'.2').options.find(o=>o.id===s.narrative.decisions[c.id+'.2'].optionId),institution:nodeById(c.id+'.4').options.find(o=>o.id===s.narrative.decisions[c.id+'.4'].optionId)}))};
}
export function crossedConsequences(s){
  const f=s.narrative.flags,d=s.narrative.decisions,items=[];
  if(d['C4.1']&&f.forest_priority==='refugio'&&f.desert_evidence==='cadena')items.push('Elia certifica los documentos que sobrevivieron al bosque. La cadena es firme, pero no devuelve los originales perdidos: ahora distingue una prueba verificable de una historia completa.');
  if(d['C4.2']&&f.forest_account==='reserva'&&f.desert_disclosure==='abierta')items.push('La reserva de Valdeluz reaparece junto a los cristales publicados. El registro conserva la excepción o revisión y las voces que todavía no pudieron responder.');
  if(d['C5.4']&&f.city_distribution==='turnos'&&f.mountain_custody==='rotativa'&&f.final_regime==='relevo')items.push('Los turnos del canal, el faro y la custodia final se encuentran en una misma página. Una familia pide formación y cuidados para poder participar sin sostener tres turnos a la vez.');
  if(d['C5.4']&&f.mountain_signal==='reservar'&&f.final_regime==='llaves')items.push('Sira celebra conservar la llave de su región. Desde la orilla vecina llega una petición de ayuda: la autonomía también necesitará aprender a responder a esa dependencia.');
  if(d['C5.1']&&f.desert_disclosure==='resumen'&&f.final_voice==='afectados')items.push('Dara pide hablar con su propia voz. Respalda tener un lugar en la deliberación y cuestiona el resumen que la representó antes: ambas cosas quedan escritas.');
  if(d['C4.4']&&f.forest_account==='custodia'&&f.desert_institution==='camara')items.push('La custodia externa devuelve lo acordado y mantiene otra pieza bajo la reserva original. El mandato que protegió el archivo también limita lo que puedes ofrecer ahora.');
  return items;
}
