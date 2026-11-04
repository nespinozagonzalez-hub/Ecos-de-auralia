import {ATLAS_VERSION,REGIONS,MISSIONS,CODE_ALIASES,LEVELS,THEMES,EXPEDITION_EVENTS} from './atlas-data.js';

const clean=(s,max)=>String(s||'').trim().slice(0,max);
const unique=a=>[...new Set(Array.isArray(a)?a:[])];
export function newAtlas(name='Guardián'){
  return {version:ATLAS_VERSION,name:clean(name,24)||'Guardián',look:'bosque',completed:[],choices:{},purchases:[],theme:'verdigris',expeditionEvents:[],read:[],plans:{},reducedMotion:false,createdAt:Date.now(),updatedAt:Date.now()};
}
export function regionState(s,id){
  const region=REGIONS.find(r=>r.id===id);if(!region)return null;
  const count=MISSIONS.filter(m=>m.region===id&&s.completed.includes(m.id)).length;
  const choice=region.choices.find(c=>c.id===s.choices[id])||null;
  const index=REGIONS.indexOf(region),unlocked=index===0||regionState(s,REGIONS[index-1].id).restored;
  const restored=unlocked&&count===4&&!!choice;
  return {region,count,choice,unlocked,restored,progress:Math.round((count*20)+(choice?20:0))};
}
export function atlasStats(s){
  const completed=MISSIONS.filter(m=>s.completed.includes(m.id));
  const restored=REGIONS.filter(r=>regionState(s,r.id).restored);
  const events=Object.entries(EXPEDITION_EVENTS).filter(([id])=>s.expeditionEvents.includes(id));
  const xp=completed.reduce((n,m)=>n+m.xp,0)+restored.length*50+events.reduce((n,[,e])=>n+e.xp,0);
  const earned=completed.reduce((n,m)=>n+m.light,0)+restored.length*25+events.reduce((n,[,e])=>n+e.light,0);
  const spent=THEMES.filter(t=>s.purchases.includes(t.id)).reduce((n,t)=>n+t.cost,0);
  let level=0;for(let i=0;i<LEVELS.length;i++)if(xp>=LEVELS[i])level=i;
  return {xp,light:earned-spent,earned,spent,level:level+1,levelStart:LEVELS[level],nextLevel:LEVELS[level+1]||null,memories:completed.length,restored:restored.length,rank:level<2?'Viajero del Alba':level<4?'Guardián de Ecos':level<6?'Tejedor de Historias':'Custodio de Auralia',companion:xp>=760?'Astral':xp>=300?'Lumen':'Chispa'};
}
export function currentRegion(s){return REGIONS.find(r=>!regionState(s,r.id).restored)||REGIONS.at(-1);}
export function nextMission(s){const r=currentRegion(s);return MISSIONS.find(m=>m.region===r.id&&!s.completed.includes(m.id))||null;}
export function missionInfo(s,id){const mission=MISSIONS.find(m=>m.id===id);return mission?{...mission,title:s.plans[id]?.title||mission.title,prompt:s.plans[id]?.prompt||mission.prompt}:null;}
export function claimCode(s,input){
  const code=clean(input,50).toUpperCase();
  const m=MISSIONS.find(m=>m.code===code||m.id===CODE_ALIASES[code]);
  if(!m)return {ok:false,message:'El Atlas no reconoce ese código. Revisa el sello que recibiste.'};
  if(s.completed.includes(m.id))return {ok:false,duplicate:true,message:'Este recuerdo ya forma parte de tu Atlas.'};
  if(!regionState(s,m.region).unlocked){const prev=REGIONS[REGIONS.findIndex(r=>r.id===m.region)-1];return {ok:false,message:`Primero completa la historia de ${prev.name}. El código no se ha consumido.`};}
  const was=regionState(s,m.region).restored;s.completed.push(m.id);s.updatedAt=Date.now();
  return {ok:true,mission:m,newlyRestored:!was&&regionState(s,m.region).restored,message:`${m.memory} · +${m.xp} experiencia · +${m.light} luz`};
}
export function choosePath(s,regionId,choiceId){
  const r=REGIONS.find(r=>r.id===regionId),status=regionState(s,regionId);
  if(!r||!status.unlocked||status.count<2)return {ok:false,message:'Recupera dos memorias de este territorio para tomar esta decisión.'};
  if(!r.choices.some(c=>c.id===choiceId))return {ok:false,message:'Esa ruta no pertenece a este capítulo.'};
  if(status.choice)return {ok:false,message:'Esta decisión ya forma parte de tu historia.'};
  s.choices[regionId]=choiceId;s.updatedAt=Date.now();
  return {ok:true,choice:regionState(s,regionId).choice,newlyRestored:regionState(s,regionId).restored};
}
export function buyTheme(s,id){
  const theme=THEMES.find(t=>t.id===id);if(!theme)return {ok:false,message:'Ese acabado no existe.'};
  if(theme.cost===0||s.purchases.includes(id)){s.theme=id;return {ok:true,equipped:true};}
  if(atlasStats(s).light<theme.cost)return {ok:false,message:'Todavía necesitas más luz para tejer este acabado.'};
  s.purchases.push(id);s.theme=id;s.updatedAt=Date.now();return {ok:true,purchased:true};
}
export function configureMission(s,id,title,prompt){
  if(!MISSIONS.some(m=>m.id===id))return false;
  const t=clean(title,90),p=clean(prompt,600);
  if(!t&&!p)delete s.plans[id];else s.plans[id]={title:t,prompt:p};
  s.updatedAt=Date.now();return true;
}
export function syncExpedition(s,adventure){
  const f=adventure?.flags;if(!f||adventure.version!==1)return [];
  const messages=[];
  for(const [flag,id] of [['gauntlet','gauntlet'],['secretFound','seed']]){
    if(f[flag]===true&&!s.expeditionEvents.includes(id)){s.expeditionEvents.push(id);messages.push(EXPEDITION_EVENTS[id].title);}
  }
  if(f.restored===true&&!s.completed.includes('bosque-3')){s.completed.push('bosque-3');messages.push('La expedición completó «Cruzar el umbral» y añadió una memoria al Atlas');}
  if(messages.length)s.updatedAt=Date.now();return messages;
}
export function availableStoryPages(s,regionId){const status=regionState(s,regionId);if(!status?.unlocked)return [];return [0,...(status.count>=2?[1]:[]),...(status.count===4&&status.choice?[2]:[])];}
export function restoreAtlas(raw){
  if(!raw||raw.version!==ATLAS_VERSION||!Array.isArray(raw.completed))return null;
  const s=newAtlas(raw.name);s.look=['bosque','marea','sol'].includes(raw.look)?raw.look:'bosque';
  const completed=unique(raw.completed),choices=raw.choices&&typeof raw.choices==='object'?raw.choices:{};
  for(const r of REGIONS){
    if(!regionState(s,r.id).unlocked)break;
    s.completed.push(...MISSIONS.filter(m=>m.region===r.id&&completed.includes(m.id)).map(m=>m.id));
    if(regionState(s,r.id).count>=2&&r.choices.some(c=>c.id===choices[r.id]))s.choices[r.id]=choices[r.id];
  }
  s.expeditionEvents=unique(raw.expeditionEvents).filter(id=>Object.hasOwn(EXPEDITION_EVENTS,id));
  for(const id of unique(raw.purchases))if(THEMES.some(t=>t.id===id&&t.cost>0)&&atlasStats(s).light>=THEMES.find(t=>t.id===id).cost)s.purchases.push(id);
  s.theme=raw.theme==='verdigris'||s.purchases.includes(raw.theme)?raw.theme:'verdigris';
  s.read=unique(raw.read).filter(id=>REGIONS.some(r=>[0,1,2].some(i=>id===`${r.id}-${i}`)));
  for(const m of MISSIONS)if(raw.plans?.[m.id])configureMission(s,m.id,raw.plans[m.id].title,raw.plans[m.id].prompt);
  s.reducedMotion=raw.reducedMotion===true;s.createdAt=Number.isFinite(raw.createdAt)?raw.createdAt:Date.now();s.updatedAt=Date.now();
  return s;
}
