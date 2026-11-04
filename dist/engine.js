import { GAME_VERSION, ACTIVITY_SEALS, SCENES, JOURNEY } from './game-data.js';

const FLAG_NAMES=['metElia','enteredForest','forestPuzzle','gauntlet','rootsCleared','templeOpen','mirrorsLit','memoryLit','chambersLit','bossDefeated','restored','secretOpen','secretFound','epilogue'];
export function newGame(name='Guardián') {
  return {version:GAME_VERSION,name:normalizeName(name),scene:'village',x:795,y:735,hp:6,maxHp:6,flags:Object.fromEntries(FLAG_NAMES.map(k=>[k,false])),seals:[],mirrors:[1,2,3],defeatedShadows:[],settings:{sound:false,reducedMotion:false},played:0};
}
export function normalizeName(value){return String(value||'Guardián').trim().slice(0,24)||'Guardián';}
export function restoreGame(raw){
  if(!raw || raw.version!==GAME_VERSION || !SCENES[raw.scene]) return null;
  const state=newGame(raw.name);
  state.scene=raw.scene;
  const scene=SCENES[state.scene];
  state.x=Number.isFinite(raw.x)?Math.max(32,Math.min(scene.width-32,raw.x)):scene.spawn.x;
  state.y=Number.isFinite(raw.y)?Math.max(32,Math.min(scene.height-32,raw.y)):scene.spawn.y;
  state.hp=Number.isFinite(raw.hp)?Math.max(1,Math.min(6,raw.hp)):6;
  for(const k of FLAG_NAMES) state.flags[k]=raw.flags?.[k]===true;
  state.seals=ACTIVITY_SEALS.filter(s=>raw.seals?.includes(s.id)).map(s=>s.id);
  state.mirrors=Array.isArray(raw.mirrors)&&raw.mirrors.length===3?raw.mirrors.map(n=>Number.isInteger(n)?((n%4)+4)%4:0):[1,2,3];
  state.defeatedShadows=Array.isArray(raw.defeatedShadows)?raw.defeatedShadows.filter(x=>['shade1','shade2'].includes(x)):[];
  state.settings={sound:raw.settings?.sound===true,reducedMotion:raw.settings?.reducedMotion===true};
  state.played=Number.isFinite(raw.played)?Math.max(0,raw.played):0;
  if(!walkable(state,state.x,state.y)) Object.assign(state,scene.spawn);
  return state;
}
export function redeemSeal(state, input){
  const code=String(input||'').trim().toUpperCase();
  const seal=ACTIVITY_SEALS.find(s=>s.code===code);
  if(!seal)return {ok:false,message:'La campana no reconoce este sello. Revisa el código.'};
  if(state.seals.includes(seal.id))return {ok:false,message:'Este sello ya forma parte de tu aventura.'};
  state.seals.push(seal.id);
  return {ok:true,seal,message:seal.title+' recibido. '+seal.unlock};
}
export function travel(state,sceneId,position){
  if(!SCENES[sceneId]) return {ok:false,message:'Ese territorio aún no se puede explorar.'};
  if(sceneId==='forest'&&(!state.flags.metElia||!state.seals.includes('exploration')))return {ok:false,message:!state.flags.metElia?'Habla con Elia antes de abandonar Valdeluz.':'Necesitas el Sello de Exploración. Abre «Sellos» para canjearlo.'};
  if(sceneId==='sanctuary'&&!state.flags.rootsCleared)return {ok:false,message:'Las raíces todavía protegen el santuario.'};
  state.scene=sceneId;Object.assign(state,position||SCENES[sceneId].spawn);state.hp=Math.max(4,state.hp);
  if(sceneId==='forest')state.flags.enteredForest=true;
  return {ok:true};
}
export function openTemple(state){
  if(!state.flags.gauntlet)return {ok:false,message:'La reliquia del bosque debe acompañarte hasta aquí.'};
  if(!state.seals.includes('sanctuary'))return {ok:false,message:'El pedestal necesita el Sello del Santuario.'};
  state.flags.templeOpen=true;return {ok:true};
}
export function solveForest(state,sequence){
  if(sequence.join(',')!=='water,root,sun')return false;
  state.flags.forestPuzzle=true;return true;
}
export function turnMirror(state,index){
  if(!state.flags.templeOpen||!Number.isInteger(index)||index<0||index>2)return false;
  state.mirrors[index]=(state.mirrors[index]+1)%4;
  if(state.mirrors.every(v=>v===0))state.flags.mirrorsLit=true;
  updateChambers(state);return state.flags.mirrorsLit;
}
export function solveMemory(state,direction){
  if(!state.flags.templeOpen||direction!=='east')return false;
  state.flags.memoryLit=true;updateChambers(state);return true;
}
function updateChambers(state){state.flags.chambersLit=state.flags.mirrorsLit&&state.flags.memoryLit;}
export function recoverMedallion(state){if(!state.flags.bossDefeated)return false;state.flags.restored=true;state.hp=6;return true;}
export function currentQuest(state){const index=JOURNEY.findIndex(s=>!state.flags[s.flag]);return {index:index<0?JOURNEY.length:index,step:index<0?{title:'Auralia vuelve a recordar',text:state.flags.secretFound?'El primer eco está a salvo. Otros territorios esperan su historia.':'El primer eco está a salvo. Busca las raíces del jardín al oeste de Valdeluz.'}:JOURNEY[index]};}
export function pointInRect(x,y,r,pad=0){return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad;}
export function dynamicSolids(state){
  if(state.scene==='village'&&!state.flags.secretOpen)return [{x:214,y:345,w:72,h:35}];
  if(state.scene==='forest'&&!state.flags.rootsCleared)return [{x:1090,y:420,w:510,h:45}];
  if(state.scene==='sanctuary'){
    const bars=[];
    if(!state.flags.templeOpen)bars.push({x:275,y:470,w:80,h:30},{x:575,y:680,w:30,h:80});
    if(!state.flags.chambersLit)bars.push({x:575,y:240,w:30,h:80},{x:855,y:470,w:80,h:30});
    return bars;
  }return [];
}
export function walkable(state,x,y,radius=13,trees=[]){
  const scene=SCENES[state.scene];
  if(x<radius+25||x>scene.width-radius-25||y<radius+25||y>scene.height-radius-25)return false;
  if(state.scene==='sanctuary'){
    const floor=[...scene.rooms,...scene.corridors];
    // Test the player's footprint against the UNION of rooms and corridors.
    // Shrinking each rectangle individually creates invisible gaps at doors.
    if(![[x,y],[x-radius,y],[x+radius,y],[x,y-radius],[x,y+radius]].every(([px,py])=>floor.some(r=>pointInRect(px,py,r))))return false;
  }
  if([...scene.solids,...dynamicSolids(state)].some(r=>pointInRect(x,y,r,radius)))return false;
  return !trees.some(t=>Math.hypot(x-t.x,y-t.y)<(t.radius||16)+radius);
}
export function movePlayer(state,dx,dy,dt,trees=[],speed=205){
  const len=Math.hypot(dx,dy);if(!len)return false;
  dx/=Math.max(1,len);dy/=Math.max(1,len);
  // Substeps keep a dash from crossing narrow collision barriers.
  const steps=Math.max(1,Math.ceil(speed*dt/7));
  let moved=false;
  for(let i=0;i<steps;i++){
    const nx=state.x+dx*speed*dt/steps,ny=state.y+dy*speed*dt/steps;
    if(walkable(state,nx,state.y,13,trees)){state.x=nx;moved=true;}
    if(walkable(state,state.x,ny,13,trees)){state.y=ny;moved=true;}
  }return moved;
}
export function nearestEntity(state,maxDistance=100){
  const list=SCENES[state.scene].entities.filter(e=>{
    if(e.type==='roots'&&state.flags[e.flag])return false;
    if(e.id==='secretChest'&&!state.flags.secretOpen)return false;
    if(e.id==='forestMedallion'&&(!state.flags.bossDefeated||state.flags.restored))return false;
    return true;
  });
  return list.map(e=>({entity:e,distance:Math.hypot(state.x-e.x,state.y-e.y)})).filter(e=>e.distance<maxDistance).sort((a,b)=>a.distance-b.distance)[0]?.entity||null;
}
export function findWalkingPath(state,target,trees=[]){
  const grid=24,scene=SCENES[state.scene];
  const snap=p=>({x:Math.round(p.x/grid)*grid,y:Math.round(p.y/grid)*grid});
  const closest=p=>{
    const base=snap(p),choices=[];
    for(let ox=-2;ox<=2;ox++)for(let oy=-2;oy<=2;oy++){const q={x:base.x+ox*grid,y:base.y+oy*grid};if(walkable(state,q.x,q.y,13,trees))choices.push(q);}
    return choices.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  };
  const start=closest(state),end=closest(target);if(!start||!end)return [];
  const key=p=>p.x+','+p.y,queue=[start],visited=new Map([[key(start),null]]),points=new Map([[key(start),start]]);
  for(let index=0;index<queue.length;index++){
    const p=queue[index];
    if(key(p)===key(end)){
      const path=[];let k=key(p);while(k){path.push(points.get(k));k=visited.get(k);}return path.reverse();
    }
    for(const [dx,dy] of [[grid,0],[-grid,0],[0,grid],[0,-grid]]){
      const q={x:p.x+dx,y:p.y+dy},k=key(q);
      if(q.x<0||q.y<0||q.x>scene.width||q.y>scene.height||visited.has(k))continue;
      if(!walkable(state,q.x,q.y,13,trees)||!walkable(state,p.x+dx/2,p.y+dy/2,13,trees))continue;
      visited.set(k,key(p));points.set(k,q);queue.push(q);
    }
  }return [];
}
export function seededRandom(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function prepareDemo(state,stage){
  state.hp=6;
  state.flags.metElia=true;if(!state.seals.includes('exploration'))state.seals.push('exploration');
  if(stage==='forest'){state.flags.enteredForest=true;return travel(state,'forest');}
  state.flags.enteredForest=true;state.flags.forestPuzzle=true;state.flags.gauntlet=true;state.flags.rootsCleared=true;
  if(!state.seals.includes('sanctuary'))state.seals.push('sanctuary');
  state.flags.templeOpen=true;
  if(stage==='ending'){
    state.flags.mirrorsLit=true;state.flags.memoryLit=true;state.flags.chambersLit=true;state.flags.bossDefeated=true;state.mirrors=[0,0,0];
    return travel(state,'sanctuary',{x:880,y:240});
  }
  return travel(state,'sanctuary');
}
