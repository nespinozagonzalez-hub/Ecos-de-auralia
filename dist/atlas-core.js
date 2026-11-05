import {ATLAS_VERSION,REGIONS,MISSIONS,CODE_ALIASES,LEVELS,THEMES,EXPEDITION_EVENTS} from './atlas-data.js';
import {freshNarrative,restoreNarrative,chapterDecisions,chapterByRegion} from './narrative-core.js';
import {copyClassroom,missionForCode,canonicalCode} from './classroom.js';
const clean=(s,max)=>String(s||'').trim().slice(0,max);
const unique=a=>[...new Set(Array.isArray(a)?a:[])];
export function newAtlas(name='Guardián'){
 return {version:ATLAS_VERSION,revision:0,name:clean(name,24)||'Guardián',look:'bosque',completed:[],choices:{},purchases:[],theme:'verdigris',expeditionEvents:[],read:[],plans:{},reducedMotion:false,classroom:null,claims:{},narrative:freshNarrative(),legacyArchive:null,createdAt:Date.now(),updatedAt:Date.now()};
}
export function regionState(s,id){
 const region=REGIONS.find(r=>r.id===id);if(!region)return null;
 const count=MISSIONS.filter(m=>m.region===id&&s.completed.includes(m.id)).length;
 const chapter=chapterByRegion(id),decisionCount=chapterDecisions(s,id);
 const index=REGIONS.indexOf(region),unlocked=!!s.narrative.decisions['P.2']&&(index===0||chapterDecisions(s,REGIONS[index-1].id)===4);
 const intervention=chapter.nodes[1],chosen=s.narrative.decisions[intervention.id];
 const option=chosen?intervention.options.find(o=>o.id===chosen.optionId):null;
 const kinds=({bosque:['refugio','archivo','puentes'],marea:['jardines','puentes','puentes'],cumbres:['faro','abrigo','faro'],cristal:['observatorio','taller','taller'],eclipse:['voces','caminos','caminos']})[id];
 const choice=option?{id:kinds[['A','B','C'].indexOf(option.id)],title:option.label,effect:option.immediate,icon:region.icon}:null;
 const restored=unlocked&&count===4&&decisionCount===4;
 return {region,count,choice,unlocked,restored,decisionCount,progress:Math.round(count*12.5+decisionCount*12.5)};
}
export function atlasStats(s){
 const completed=MISSIONS.filter(m=>s.completed.includes(m.id));
 const restored=REGIONS.filter(r=>regionState(s,r.id).restored);
 const bonus=new Set([...restored.map(r=>r.id),...(s.legacyArchive?.restored||[])]);
 const events=Object.entries(EXPEDITION_EVENTS).filter(([id])=>s.expeditionEvents.includes(id));
 const xp=completed.reduce((n,m)=>n+m.xp,0)+bonus.size*50+events.reduce((n,[,e])=>n+e.xp,0);
 const earned=completed.reduce((n,m)=>n+m.light,0)+bonus.size*25+events.reduce((n,[,e])=>n+e.light,0);
 const spent=THEMES.filter(t=>s.purchases.includes(t.id)).reduce((n,t)=>n+t.cost,0);
 let level=0;for(let i=0;i<LEVELS.length;i++)if(xp>=LEVELS[i])level=i;
 return {xp,light:earned-spent,earned,spent,level:level+1,levelStart:LEVELS[level],nextLevel:LEVELS[level+1]||null,memories:completed.length,restored:restored.length,rank:level<2?'Viajero del Alba':level<4?'Guardián de Ecos':level<6?'Tejedor de Historias':'Custodio de Auralia',companion:xp>=760?'Astral':xp>=300?'Lumen':'Chispa'};
}
export function currentRegion(s){return REGIONS.find(r=>!regionState(s,r.id).restored)||REGIONS.at(-1);}
export function nextMission(s){const r=currentRegion(s);return MISSIONS.find(m=>m.region===r.id&&!s.completed.includes(m.id))||null;}
export function missionInfo(s,id){const mission=MISSIONS.find(m=>m.id===id);return mission?{...mission,title:s.plans[id]?.title||mission.title,prompt:s.plans[id]?.prompt||mission.prompt}:null;}
const demoMission=code=>MISSIONS.find(m=>m.code===code||m.id===CODE_ALIASES[code]);
export function claimCode(s,input){
 const code=clean(input,50).toUpperCase();let m,proof=null;
 if(s.classroom){
  const found=missionForCode(s.classroom,code);
  if(!found){
   const demo=demoMission(code)||MISSIONS.find(m=>canonicalCode(m.code)===canonicalCode(code));
   return {ok:false,message:demo?'Ese es un código de demostración. Tu curso usa sus propios sellos: pídeselo a tu docente.':'Ese sello no pertenece a '+s.classroom.name+'. Revisa letras y números.'};
  }
  m=found.mission;proof=found.code;
 }else m=demoMission(code);
 if(!m)return {ok:false,message:'El Atlas no reconoce ese código. Revisa el sello que recibiste.'};
 if(s.completed.includes(m.id))return {ok:false,duplicate:true,message:'Este recuerdo ya forma parte de tu Atlas.'};
 s.completed.push(m.id);if(proof)s.claims[m.id]=proof;s.updatedAt=Date.now();
 return {ok:true,mission:m,newlyRestored:false,message:m.memory+' · +'+m.xp+' experiencia · +'+m.light+' luz'};
}
export function choosePath(){return {ok:false,message:'Las decisiones ahora se confirman una a una dentro de la crónica.'};}
export function buyTheme(s,id){
 const theme=THEMES.find(t=>t.id===id);if(!theme)return {ok:false,message:'Ese acabado no existe.'};
 if(theme.cost===0||s.purchases.includes(id)){s.theme=id;return {ok:true,equipped:true};}
 if(atlasStats(s).light<theme.cost)return {ok:false,message:'Todavía necesitas más luz para tejer este acabado.'};
 s.purchases.push(id);s.theme=id;s.updatedAt=Date.now();return {ok:true,purchased:true};
}
export function configureMission(s,id,title,prompt){
 if(!MISSIONS.some(m=>m.id===id))return false;const t=clean(title,90),p=clean(prompt,600);
 if(!t&&!p)delete s.plans[id];else s.plans[id]={title:t,prompt:p};s.updatedAt=Date.now();return true;
}
export function syncExpedition(){return [];}
export function availableStoryPages(s,regionId){const c=chapterByRegion(regionId);return c?.nodes.filter(n=>s.narrative.decisions[n.id]).map(n=>n.id)||[];}
/** Atlas nuevo vinculado a un curso. Conserva nombre y apariencia; el progreso empieza de cero. */
export function joinClassroom(s,classroom){
 const c=copyClassroom(classroom);if(!c)return null;
 const next=newAtlas(s?.name);next.look=s?.look||'bosque';next.reducedMotion=!!s?.reducedMotion;next.classroom=c;return next;
}
export const hasProgress=s=>s.completed.length>0||Object.keys(s.narrative.decisions).length>0;
export function restoreAtlas(raw){
 if(!raw||![1,ATLAS_VERSION].includes(raw.version)||!Array.isArray(raw.completed))return null;
 const s=newAtlas(raw.name);s.look=['bosque','marea','sol'].includes(raw.look)?raw.look:'bosque';
 s.classroom=raw.version===ATLAS_VERSION?copyClassroom(raw.classroom):null;
 if(raw.classroom&&!s.classroom)return null;
 if(s.classroom){
  // En un curso, cada memoria debe venir acompañada del sello válido que la entregó.
  const claims=raw.claims&&typeof raw.claims==='object'?raw.claims:{};
  for(const id of unique(raw.completed)){const found=typeof claims[id]==='string'&&missionForCode(s.classroom,claims[id]);if(found&&found.mission.id===id){s.completed.push(id);s.claims[id]=found.code;}}
 }else s.completed=unique(raw.completed).filter(id=>MISSIONS.some(m=>m.id===id));
 s.expeditionEvents=s.classroom?[]:unique(raw.expeditionEvents).filter(id=>Object.hasOwn(EXPEDITION_EVENTS,id));
 if(raw.version===1){
  const choices=raw.choices&&typeof raw.choices==='object'?raw.choices:{};
  s.legacyArchive={choices:Object.fromEntries(REGIONS.filter(r=>r.choices.some(c=>c.id===choices[r.id])).map(r=>[r.id,choices[r.id]])),restored:REGIONS.filter(r=>MISSIONS.filter(m=>m.region===r.id).every(m=>s.completed.includes(m.id))&&r.choices.some(c=>c.id===choices[r.id])).map(r=>r.id)};
 }else{
  if(raw.legacyArchive&&typeof raw.legacyArchive==='object')s.legacyArchive={choices:Object.fromEntries(REGIONS.filter(r=>r.choices.some(c=>c.id===raw.legacyArchive.choices?.[r.id])).map(r=>[r.id,raw.legacyArchive.choices[r.id]])),restored:unique(raw.legacyArchive.restored).filter(id=>REGIONS.some(r=>r.id===id)&&MISSIONS.filter(m=>m.region===id).every(m=>s.completed.includes(m.id)))};
  if(!restoreNarrative(s,raw.narrative))return null;
 }
 for(const id of unique(raw.purchases))if(THEMES.some(t=>t.id===id&&t.cost>0)&&atlasStats(s).light>=THEMES.find(t=>t.id===id).cost)s.purchases.push(id);
 s.theme=raw.theme==='verdigris'||s.purchases.includes(raw.theme)?raw.theme:'verdigris';
 for(const m of MISSIONS)if(raw.plans?.[m.id])configureMission(s,m.id,raw.plans[m.id].title,raw.plans[m.id].prompt);
 s.reducedMotion=raw.reducedMotion===true;s.createdAt=Number.isFinite(raw.createdAt)?raw.createdAt:Date.now();s.updatedAt=Date.now();s.revision=Number.isSafeInteger(raw.revision)&&raw.revision>=0?raw.revision:0;
 return s;
}
