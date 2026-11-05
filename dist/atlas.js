import {ATLAS_KEY,LEGACY_ATLAS_KEY,ADVENTURE_KEY,REGIONS,MISSIONS,THEMES,FEATS} from './atlas-data.js';
import {equipTitle,titleOf,recordEcho,joinClassroom,hasProgress,newAtlas,restoreAtlas,regionState,atlasStats,currentRegion,nextMission,missionInfo,claimCode,choosePath,buyTheme,configureMission,syncExpedition,availableStoryPages} from './atlas-core.js';
import {createNarrativeUI} from './narrative-ui.js';
import {CAMPAIGN,nextNode,chapterByRegion,chapterDecisions,nodeById} from './narrative-core.js';
import {assetSlot,assetFrame,mapLayers,assetById} from './asset-slots.js';
import {restoreGame} from './engine.js';
import {icon,atlasEmblem,worldMap,sceneArt,guardianArt} from './atlas-art.js';
import {createClassroom,unlockClassroom,encodeClassroom,decodeClassroom,MIN_SECRET} from './classroom.js';

const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const views=[['atlas','compass','Atlas'],['historia','book','Crónica'],['misiones','seal','Misiones'],['memorias','grid','Memorias'],['guardian','person','Guardián']];
let state,legacy=null,saveOK=true;
try{legacy=restoreGame(JSON.parse(localStorage.getItem(ADVENTURE_KEY)));}catch{}
try{state=restoreAtlas(JSON.parse(localStorage.getItem(ATLAS_KEY)||localStorage.getItem(LEGACY_ATLAS_KEY)));}catch{saveOK=false;}
state??=newAtlas(legacy?.name);
state.reducedMotion ||= window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let view=views.some(v=>v[0]===location.hash.slice(1))?location.hash.slice(1):'atlas';
let selected=currentRegion(state).id,missionFilter='all',memoryFilter='all',collection='memories',modalOpen=false,returnFocus=null,toastTimer;
const imported=[];
REGIONS.forEach((r,i)=>{r.chapter=CAMPAIGN.chapters[i].title;r.description=CAMPAIGN.chapters[i].premise;});
const narrative=createNarrativeUI({state:()=>state,save,render,open:openModal,close:closeModal,toast,sceneArt,icon});
function persistConflict(){try{const raw=JSON.parse(localStorage.getItem(ATLAS_KEY));return raw&&raw.narrative?.runId===state.narrative.runId&&raw.revision>state.revision?restoreAtlas(raw):null;}catch{return null;}}


function hydrate(root=document){
 root.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));
 for(const e of root.querySelectorAll('.memory-card')){
  const a=assetById('ui-memory');e.dataset.assetId=a.id;
  if(a.status==='ready'){e.style.borderImageSource='url('+a.path+')';e.style.borderImageSlice='8';e.style.borderImageWidth='8px';}
 }
 for(const e of root.querySelectorAll('[data-asset-id^="companion-"]')){
  const a=assetById(e.dataset.assetId);
  if(a?.status==='ready'){e.classList.add('companion-sprite');e.style.backgroundImage='url('+a.path+')';e.style.animationDuration=(a.frames/a.fps)+'s';}
 }
}
function save(){
 const newer=persistConflict();if(newer){state=newer;saveOK=true;updateSaveLabel();toast('Otra pestaña guardó una decisión antes. Se recuperó esa versión.');return false;}
 try{state.revision=(state.revision||0)+1;localStorage.setItem(ATLAS_KEY,JSON.stringify(state));saveOK=true;}catch{saveOK=false;}
 updateSaveLabel();return saveOK;
}

function updateSaveLabel(){$('storageStatus').innerHTML=saveOK?'<b></b> Guardado en este dispositivo':'Guardado no disponible · exporta tu Atlas';}
function toast(message){clearTimeout(toastTimer);$('atlasToast').textContent=message;$('atlasToast').classList.remove('hidden');toastTimer=setTimeout(()=>$('atlasToast').classList.add('hidden'),4800);}
function levelPercent(stats){return stats.nextLevel?Math.min(100,(stats.xp-stats.levelStart)/(stats.nextLevel-stats.levelStart)*100):100;}
function renderHeader(){
  const stats=atlasStats(state);$('atlasApp').dataset.theme=state.theme;
  document.body.style.backgroundColor=({verdigris:'#102b2a',ambar:'#302d27',lunar:'#242d38',aurora:'#143435'})[state.theme];
  document.documentElement.classList.toggle('reduced-motion',state.reducedMotion);
  $('railEmblem').innerHTML=assetSlot('ui-emblem',atlasEmblem());
  $('mainNav').innerHTML=views.map(([id,i,label])=>`<button class="rail-button ${view===id?'active':''}" data-view="${id}" ${view===id?'aria-current="page"':''}>${icon(i)}<small>${label}</small></button>`).join('');
  $('lightBalance').innerHTML=`${icon('light')} ${stats.light}<small>luz</small>`;
  $('profileBtn').innerHTML=`<span class="avatar-mini">${assetSlot('guardian-'+state.look,guardianArt(state.look,stats.companion))}</span><span><strong>${esc(state.name)}</strong><small>Nv. ${stats.level} · ${esc(titleOf(state)||stats.rank)}</small><span class="mini-xp"><i style="width:${levelPercent(stats)}%"></i></span></span>`;
  updateSaveLabel();hydrate();
}
function intro(eyebrow,title,text,extra=''){return `<div class="page-intro"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${text}</p></div>${extra}</div>`;}
function counter(){return `<div class="chapter-counter"><strong>${String(atlasStats(state).restored).padStart(2,'0')}</strong><small>DE CINCO<br>TERRITORIOS DESPIERTOS</small></div>`;}
function rewardLine(m){return `<div class="rewards-inline"><span>${icon('spark')} ${m.xp} experiencia</span><span>${icon('light')} ${m.light} luz</span></div>`;}
function regionTabs(){return `<div class="region-tabs">${REGIONS.map(r=>`<button class="region-tab ${selected===r.id?'active':''} ${regionState(state,r.id).unlocked?'':'locked'}" data-action="select-region" data-id="${r.id}">${icon(r.icon)}${r.short}</button>`).join('')}</div>`;}
function storyButton(r,status){return status.restored?'Releer este capítulo':nextNode(state)?.id.startsWith('P.')?'Abrir el prólogo':'Continuar la crónica';}

function featsStrip(){const got=atlasStats(state).feats.length;return '<div class="feats-strip"><span>'+icon('spark')+' <strong>'+got+' / '+FEATS.length+'</strong> hazañas</span><button class="quiet-button" data-view="guardian">Ver hazañas y títulos</button></div>';}
function featsSection(stats){
 const got=new Set(stats.feats.map(f=>f.id));
 return '<div class="section-heading"><h2>Hazañas</h2><p>'+got.size+' de '+FEATS.length+' conseguidas.<br>Algunas conceden un título.</p></div><div class="feats-grid">'+FEATS.map(f=>{const on=got.has(f.id),eq=state.title===f.id;return '<article class="feat-card '+(on?'earned':'locked')+'"><div class="feat-icon">'+icon(on?'spark':'seal')+'</div><div><h3>'+esc(f.name)+'</h3><p>'+esc(on?f.text:'Una hazaña por descubrir.')+'</p><span class="feat-reward">'+(f.light?icon('light')+' '+f.light+' luz':'')+(f.title?' · Título: «'+esc(f.title)+'»':'')+'</span>'+(on&&f.title?'<button class="table-action" data-action="equip-title" data-id="'+(eq?'none':f.id)+'">'+(eq?'Quitar título':'Usar título')+'</button>':'')+'</div></article>';}).join('')+'</div>';
}
function levelUp(before,after){
 if(!before)return '';let html='';
 if(after.level>before.level)html+='<div class="level-up">✦ ¡Nivel '+after.level+'! · '+esc(after.rank)+'</div>';
 if(after.companion!==before.companion)html+='<div class="level-up companion-up">'+esc(before.companion)+' se transformó en <strong>'+esc(after.companion)+'</strong></div>';
 const fresh=after.feats.filter(f=>!before.feats.some(b=>b.id===f.id));
 if(fresh.length){html+='<div class="level-up feat-up">'+fresh.map(f=>'Hazaña: <strong>'+esc(f.name)+'</strong>'+(f.light?' · +'+f.light+' luz':'')).join('<br>')+'</div>';for(const f of fresh)if(!state.featsSeen.includes(f.id))state.featsSeen.push(f.id);save();}
 return html;
}
function announceFeats(){
 const fresh=atlasStats(state).feats.filter(f=>!state.featsSeen.includes(f.id));if(!fresh.length)return;
 for(const f of fresh)state.featsSeen.push(f.id);save();
 toast(fresh.length===1?'✦ Hazaña: '+fresh[0].name+(fresh[0].light?' · +'+fresh[0].light+' luz':''):'✦ '+fresh.length+' hazañas nuevas · revisa tu perfil de guardián');
}
function chapterCard(r){
 const status=regionState(state,r.id),chapter=chapterByRegion(r.id);
 return '<article class="chapter-card"><div class="chapter-image">'+assetSlot('bg-'+r.id+'-1',sceneArt(r.id,status.restored?2:0,status.choice?.id),'narrative-background')+'</div><div class="chapter-card-body"><span class="eyebrow">CAPÍTULO '+r.number+'</span><h2>'+esc(chapter.title)+'</h2><p>'+esc(chapter.ethical_question)+'</p><div class="chapter-progress">'+[0,1,2,3].map(i=>'<i class="'+(i<status.count?'filled':'')+'"></i>').join('')+'</div><span class="chapter-progress-label">'+status.count+' / 4 memorias · '+status.decisionCount+' / 4 decisiones</span>'+(status.choice?'<div class="choice-note">'+icon(r.icon)+'<span>'+esc(status.choice.effect)+'</span></div>':'')+'<button class="primary-button" data-action="story" data-id="'+r.id+'">'+storyButton(r,status)+'</button></div></article>';
}

function home(){
 const r=REGIONS.find(r=>r.id===selected),active=currentRegion(state),next=nextMission(state),stats=atlasStats(state),node=nextNode(state);
 return intro('LAS VOCES DEL VELO','El mundo recuerda contigo.','Las memorias despiertan lugares. Tus decisiones conservan lo que cambió.',counter())+
 '<div class="hero-layout"><section class="map-panel" aria-label="Mapa del reino"><div class="map-panel-top"><span class="map-top-label">'+icon('compass')+' EL REINO DE AURALIA</span><span class="eyebrow">'+stats.memories+' / 20 MEMORIAS</span></div>'+mapLayers(state,worldMap(state,selected))+'<div class="map-pin-legend"><span>Memorias, decisiones y huellas</span><span>'+Object.keys(state.narrative.decisions).length+' / 22 decisiones</span></div></section>'+chapterCard(r)+'</div>'+
 (state.legacyArchive?'<p class="migration-note">Tu viaje anterior está conservado. La nueva crónica comienza en el prólogo; los sellos y recompensas que ya obtuviste permanecen.</p>':'')+
 '<div class="section-heading"><h2>Tus próximas huellas</h2></div><div class="trail-grid"><article class="trail-card"><div class="trail-icon">'+icon('book')+'</div><div class="trail-card-copy"><span class="eyebrow">TU HISTORIA</span><h3>'+esc(node?node.title:'El legado que construiste')+'</h3><p>'+esc(node?'Continúa, relee y reconoce los costes de cada elección.':'El reino conserva tus decisiones y sus asuntos pendientes.')+'</p><button class="quiet-button" data-action="'+(node?'story':'narrative-ending')+'" data-id="'+active.id+'">Abrir la crónica</button></div></article><article class="trail-card"><div class="trail-icon">'+icon('seal')+'</div><div class="trail-card-copy"><span class="eyebrow">SELLOS DEL VELO</span><h3>'+esc(next?missionInfo(state,next.id).title:'Memorias reunidas')+'</h3><p>Cada sello roto libera una memoria y abre la siguiente escena.</p><button class="quiet-button" data-view="misiones">Ver misiones</button></div></article><article class="trail-card"><div class="trail-icon">'+icon('feather')+'</div><div class="trail-card-copy"><span class="eyebrow">LA PALABRA</span><h3>Lo que prometiste</h3><p>Compromisos y relaciones que conservan su propia historia.</p><button class="quiet-button" data-view="historia">Ver mis huellas</button></div></article></div>'+featsStrip()+'<div class="button-row"><span class="subtle">Tu aventura se guarda sola en este dispositivo.</span></div>';
}

function missionsPage(){
  const r=REGIONS.find(r=>r.id===selected),status=regionState(state,r.id);
  const list=MISSIONS.filter(m=>m.region===selected&&(missionFilter==='all'||(missionFilter==='done')===state.completed.includes(m.id)));
  return intro('CADA SELLO GUARDA UNA MEMORIA','Misiones que despiertan lugares.','Supera las pruebas del Velo y rompe sus sellos. Cada memoria liberada permanecerá contigo.')+regionTabs()+(!status.unlocked?`<p class="notice">${r.name} todavía duerme. Puedes romper sus sellos por adelantado; el relato continúa al cerrar el capítulo anterior.</p>`:'')+`<div class="section-heading"><h2>${r.name}</h2><div class="filters">${[['all','Todas'],['pending','Pendientes'],['done','Recuperadas']].map(([id,label])=>`<button class="filter-button ${missionFilter===id?'active':''}" data-action="mission-filter" data-id="${id}">${label}</button>`).join('')}</div></div><div class="mission-grid">${list.map(m=>{const info=missionInfo(state,m.id),done=state.completed.includes(m.id);return `<article class="mission-card ${done?'done':''}"><div class="mission-card-top"><span class="mission-number">${r.number} · 0${m.index+1}</span><span class="pill ${done?'complete':''}">${done?icon('check'):icon(r.icon)} ${done?'Recuerdo recuperado':m.label}</span></div><h3>${esc(info.title)}</h3><p>${esc(info.prompt)}</p>${rewardLine(m)}<div class="button-row"><button class="${done?'secondary-button':'primary-button'}" data-action="${done?'memory':'mission'}" data-id="${m.id}">${done?'Ver mi memoria':'Ver misión'} ${icon(done?'book':'arrow')}</button></div></article>`;}).join('')}</div>${!list.length?'<div class="empty-state"><h3>Todavía no hay huellas aquí.</h3><p>Cuando recuperes una memoria, aparecerá en esta sección.</p></div>':''}`;
}
function chroniclePage(){
 return intro('LAS VOCES DEL VELO','La crónica de tu Auralia.','Cinco capítulos. Cuatro decisiones por lugar. Las consecuencias viajan contigo.')+
 '<div class="chronicle-grid">'+REGIONS.map(r=>{const status=regionState(state,r.id);return '<article class="chronicle-card">'+assetSlot('bg-'+r.id+'-1',sceneArt(r.id,status.restored?2:0,status.choice?.id),'narrative-background')+'<div class="chronicle-body"><span class="eyebrow">CAPÍTULO '+r.number+' · '+status.decisionCount+' / 4 DECISIONES</span><h3>'+esc(r.chapter)+'</h3><p>'+esc(chapterByRegion(r.id).ethical_question)+'</p><button class="secondary-button" data-action="story" data-id="'+r.id+'">Abrir capítulo</button>'+(status.restored?'<div class="button-row"><button class="quiet-button" data-action="echo-start" data-id="'+r.id+'">Explorar un eco alterno</button></div>':'')+'</div></article>';}).join('')+'</div>'+narrative.record();
}

function memoriesPage(){
  const stats=atlasStats(state);
  let content='';
  if(collection==='memories'){
    const list=MISSIONS.filter(m=>memoryFilter==='all'||(memoryFilter==='found')===state.completed.includes(m.id));
    content=`<div class="section-heading"><h2>${stats.memories} / 20 memorias</h2><div class="filters">${[['all','Todas'],['found','Reveladas'],['missing','Por revelar']].map(([id,label])=>`<button class="filter-button ${memoryFilter===id?'active':''}" data-action="memory-filter" data-id="${id}">${label}</button>`).join('')}</div></div><div class="memory-grid">${list.map(m=>{const found=state.completed.includes(m.id),r=REGIONS.find(r=>r.id===m.region);return `<button class="memory-card ${found?'':'locked'}" data-action="memory" data-id="${m.id}"><div class="memory-illustration">${found?assetSlot('memory-'+m.id,sceneArt(r.id,m.index===3?2:0,regionState(state,r.id).choice?.id)):icon(r.icon)}<span class="memory-no">${r.number} · 0${m.index+1}</span></div><div class="memory-card-body"><span class="eyebrow">${r.name.toUpperCase()}</span><h3>${found?m.memory:'Un recuerdo por revelar'}</h3></div></button>`;}).join('')}</div>${!list.length?'<div class="empty-state"><h3>Esta página espera su primer recuerdo.</h3><p>Un sello o una expedición pueden dejar aquí su huella.</p></div>':''}`;
  }else content=`<div class="relic-grid">${REGIONS.map(r=>{const found=regionState(state,r.id).restored||(r.id==='bosque'&&state.expeditionEvents.includes('gauntlet'));return `<article class="relic-card ${found?'':'locked'}"><div class="relic-icon">${assetSlot('relic-'+r.id,icon(r.id==='bosque'?'root':r.icon))}</div><h3>${r.relic}</h3><p>${r.relicDescription}</p><span class="pill ${found?'complete':''}">${found?'Registrada en tu Atlas':'Por recuperar'}</span></article>`;}).join('')}</div><p class="notice" style="margin-top:20px">Cada territorio restaurado conserva su reliquia. Algunas habilidades solo se obtienen recorriendo sus expediciones.</p>`;
  return intro('LO QUE ENCONTRASTE VIAJA CONTIGO','Tu archivo de lo imposible.','Una colección de memorias y reliquias que hace visible todo lo que has construido.')+`<div class="collection-toggle"><button class="region-tab ${collection==='memories'?'active':''}" data-action="collection" data-id="memories">${icon('grid')} Memorias</button><button class="region-tab ${collection==='relics'?'active':''}" data-action="collection" data-id="relics">${icon('root')} Reliquias</button></div>${content}`;
}
function guardianPage(){
  const stats=atlasStats(state);
  return intro('QUIEN LLEVA EL ATLAS','Tu historia también te transforma.','La experiencia reconoce tu recorrido. La luz te permite dar una identidad propia a tu Atlas.')+`<div class="profile-layout"><section class="guardian-panel"><span class="eyebrow">EL GUARDIÁN DEL ATLAS</span>${assetSlot('guardian-'+state.look,guardianArt(state.look,stats.companion))}<h2>${esc(state.name)}</h2><p>${esc(titleOf(state)||stats.rank)}</p>${classBadge()}<span class="level-lozenge">NIVEL ${stats.level}</span></section><section class="profile-content"><h2>El nombre de tu aventura</h2><form id="profileForm" class="profile-form"><div><label for="guardianName">Nombre o apodo</label><input id="guardianName" class="text-input" value="${esc(state.name)}" maxlength="24" autocomplete="off"></div><button class="primary-button" type="submit">Guardar nombre</button></form><div class="look-options">${[['bosque','Bosque','#719279'],['marea','Marea','#6d96a2'],['sol','Alba','#bfa073']].map(([id,label,color])=>`<button class="look-button ${state.look===id?'active':''}" data-action="look" data-id="${id}"><span class="look-dot" style="background:${color}"></span>${label}</button>`).join('')}</div><div class="profile-stats"><div class="profile-stat"><strong>${stats.xp}</strong><small>EXPERIENCIA</small></div><div class="profile-stat"><strong>${stats.memories}</strong><small>MEMORIAS</small></div><div class="profile-stat"><strong>${stats.light}</strong><small>LUZ DISPONIBLE</small></div></div><div class="level-progress"><span style="width:${levelPercent(stats)}%"></span></div><p class="level-progress-caption">${stats.nextLevel?`${stats.nextLevel-stats.xp} de experiencia hasta el nivel ${stats.level+1}`:'Has alcanzado el nivel más alto del Atlas.'}</p><div class="companion-panel">${assetSlot('companion-'+stats.companion.toLowerCase(),icon('spark'))}<div><h3>${stats.companion}, tu compañero de luz</h3><p>${stats.companion==='Chispa'?'Una pequeña presencia que crece contigo. Al reunir 300 de experiencia, despertará una nueva forma.':stats.companion==='Lumen'?'La chispa aprendió a volar. Al reunir 760 de experiencia, conservará una forma astral.':'Tu compañero conserva la luz de todas las historias que has recuperado.'}</p></div></div></section></div>${featsSection(stats)}<div class="section-heading"><h2>La forja del Atlas</h2><p>La luz cambia su aspecto.<br>Tu historia conserva su valor.</p></div><div class="shop-grid">${THEMES.map(t=>{const owned=t.cost===0||state.purchases.includes(t.id),equipped=state.theme===t.id;return `<article class="theme-card"><div class="theme-sample" style="color:${t.color}">${icon('compass')}</div><h3>${t.name}</h3><p>${t.description}</p><span class="theme-cost">${icon('light')} ${owned?'En tu colección':t.cost+' de luz'}</span><button class="secondary-button" data-action="theme" data-id="${t.id}" ${equipped?'disabled':''}>${equipped?'Equipado':owned?'Equipar':'Tejer acabado'}</button></article>`;}).join('')}</div><div class="settings-box"><div><h3>Conserva tu recorrido.</h3><p>El Atlas se guarda en este navegador. Exporta una copia para trasladar tu historia a otro dispositivo.</p></div><div class="button-row"><button class="secondary-button" data-action="export">${icon('download')} Exportar Atlas</button><button class="secondary-button" data-action="import">${icon('upload')} Importar copia</button></div></div><div class="button-row"><button class="quiet-button" data-action="help">${icon('settings')} Ayuda y opciones</button></div>`;
}
function expeditionsPage(){return intro('OTRA PUERTA AL MISMO UNIVERSO','Hay historias que se recorren.','El Atlas conserva el progreso. Las expediciones te invitan a salir, explorar y encontrarlo.')+`<section class="expedition-feature">${sceneArt('bosque',0)}<div class="expedition-details"><span class="eyebrow">EXPEDICIÓN 01 · EL BOSQUE</span><h2>El primer recuerdo</h2><p>Vuelve a Valdeluz, entra en el bosque y encuentra el Santuario de la Raíz. Los acertijos, la exploración y el guardián pertenecen a esta aventura.</p><div class="expedition-tags"><span class="pill">Vista cenital</span><span class="pill">Exploración y combate</span><span class="pill">10–15 minutos</span></div><a class="primary-button" href="expedicion/">Entrar a la expedición ${icon('arrow')}</a><p class="subtle" style="margin:16px 0 0">Al volver, el Atlas registra tus hallazgos automáticamente en este mismo navegador. La partida de exploración conserva su propio guardado.</p></div></section><div class="section-heading"><h2>Lo que vuelve contigo</h2><p>Una recompensa por hallazgo.<br>Sin duplicaciones al regresar.</p></div><div class="expedition-rewards"><article class="expedition-reward">${icon('root')}<h3>Guante de Raíces</h3><p>La reliquia se registra en tu colección. Recibes 20 de experiencia y 10 de luz.</p><span class="pill ${state.expeditionEvents.includes('gauntlet')?'complete':''}">${state.expeditionEvents.includes('gauntlet')?'Registrado en el Atlas':'Encuéntralo en el bosque'}</span></article><article class="expedition-reward">${icon('seal')}<h3>La misión del umbral</h3><p>Recuperar el Eco completa la tercera misión del bosque: 70 de experiencia, 22 de luz y una memoria.</p><span class="pill ${state.completed.includes('bosque-3')?'complete':''}">${state.completed.includes('bosque-3')?'Misión ya registrada':'Recupera el Eco del Bosque'}</span></article><article class="expedition-reward">${icon('leaf')}<h3>La semilla de Valdeluz</h3><p>El secreto del jardín añade un hallazgo especial, 20 de experiencia y 8 de luz.</p><span class="pill ${state.expeditionEvents.includes('seed')?'complete':''}">${state.expeditionEvents.includes('seed')?'Secreto registrado':'Un jardín espera tu regreso'}</span></article></div><div class="future-expedition">${icon('compass')}<p><strong>Más encuentros, un mismo Atlas.</strong>El núcleo admite nuevas expediciones y misiones. Los otros cuatro territorios ya tienen crónica y recompensas; sus mundos de exploración quedan para una siguiente etapa.</p></div>`;}
function render(){renderHeader();$('content').innerHTML=({atlas:home,historia:chroniclePage,misiones:missionsPage,memorias:memoriesPage,guardian:guardianPage,expediciones:expeditionsPage})[view]();hydrate($('content'));setTimeout(announceFeats,600);document.title=`${views.find(v=>v[0]===view)[2]} · Atlas de Ecos`;const form=$('profileForm');if(form)form.onsubmit=e=>{e.preventDefault();state.name=$('guardianName').value.trim().slice(0,24)||'Guardián';save();render();toast('El Atlas conserva tu nombre.');};}
function navigate(id){if(!views.some(v=>v[0]===id))return;view=id;history.replaceState(null,'','#'+id);render();window.scrollTo({top:0,behavior:'instant'});}
function openModal(html,{wide=false,focusId}={}){
  if(!modalOpen)returnFocus=document.activeElement;modalOpen=true;
  $('atlasModal').classList.toggle('wide',wide);$('modalBody').innerHTML=html;$('atlasModalBackdrop').classList.remove('hidden');$('content').inert=true;document.querySelector('.rail').inert=true;document.querySelector('.topbar').inert=true;document.body.style.overflow='hidden';$('atlasModal').scrollTop=0;hydrate($('modalBody'));
  requestAnimationFrame(()=>($(focusId)||$('closeModal')).focus({preventScroll:true}));
}
function closeModal(){modalOpen=false;$('atlasModalBackdrop').classList.add('hidden');$('content').inert=false;document.querySelector('.rail').inert=false;document.querySelector('.topbar').inert=false;document.body.style.overflow='';if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});else $('content').focus({preventScroll:true});}
function showCode(){
  openModal(`<div class="modal-pad"><span class="eyebrow">UN SELLO. UNA MEMORIA.</span><h2 id="modalHeading">Rompe el sello del Velo.</h2><p>Escribe la inscripción del sello que ganaste. Liberarás una memoria, experiencia y luz.</p><form id="codeForm"><label class="modal-input-label" for="atlasCode">Inscripción del sello</label><input id="atlasCode" class="text-input code-input" placeholder="${state.classroom?'BOS1-XXXXXX':'AUR-BOS-01'}" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="50"><div id="codeError" class="form-error" role="status"></div><div class="modal-actions"><button type="submit" class="primary-button">${icon('seal')} Romper el sello</button></div></form><p class="subtle" style="margin:20px 0 0">${state.classroom?'Compañía: <strong>'+esc(state.classroom.name)+'</strong>. Cada sello se gana superando una prueba del Velo.':'Viajas sin compañía. Los sellos se ganan superando las pruebas del Velo.'}</p></div>`,{focusId:'atlasCode'});
  $('codeForm').onsubmit=e=>{e.preventDefault();const before=atlasStats(state),result=claimCode(state,$('atlasCode').value);if(!result.ok){$('codeError').textContent=result.message;return;}selected=result.mission.region;save();render();showReward(result,before);};
}
function showReward(result,before=null){
  const m=result.mission,r=REGIONS.find(r=>r.id===m.region),status=regionState(state,r.id),after=atlasStats(state);
  openModal(`<div class="modal-pad reward-pad"><span class="eyebrow">EL SELLO SE ROMPE · UNA MEMORIA VUELVE A VIVIR</span><h2 id="modalHeading">Tu huella cambia el mapa.</h2><div class="reward-card seal-break"><span class="seal-burst" aria-hidden="true">${icon('seal')}</span>${sceneArt(r.id,m.index===3?2:0,status.choice?.id)}<h3>${m.memory}</h3></div>${rewardLine(m)}${levelUp(before,after)}<p class="reward-lore">${r.name} conserva una nueva parte de su historia.</p>${result.newlyRestored?`<div class="reward-bonus">✦ Territorio restaurado · reliquia recuperada · +50 experiencia · +25 luz</div>`:''}<div class="modal-actions"><button class="primary-button" data-action="story" data-id="${r.id}">Continuar la crónica ${icon('arrow')}</button><button class="secondary-button" data-action="reward-map">Ver el mapa</button></div></div>`);
}
function showMission(id){const m=missionInfo(state,id);if(!m)return;const r=REGIONS.find(r=>r.id===m.region),done=state.completed.includes(id),status=regionState(state,r.id);openModal(`<div class="modal-pad"><span class="eyebrow">${r.name.toUpperCase()} · ${m.label.toUpperCase()}</span><h2 id="modalHeading">${esc(m.title)}</h2><p>${esc(m.prompt)}</p>${rewardLine(m)}<p class="notice">${done?'Este sello ya liberó su memoria en tu Atlas.':status.unlocked?'Supera esta prueba del Velo. Quien la supera recibe un sello con su inscripción: escríbela aquí para liberar la memoria.':'Este territorio todavía duerme. Puedes romper su sello ahora y leer esta región cuando avances hasta ella.'}</p><div class="modal-actions"><button class="primary-button" data-action="${done?'memory':'code'}" data-id="${id}" >${done?'Abrir memoria':'Tengo el sello'} ${icon('arrow')}</button><button class="secondary-button" data-action="close">Volver al Atlas</button></div></div>`);}
function showMemory(id){
 const m=MISSIONS.find(m=>m.id===id);if(!m)return;if(!state.completed.includes(id)){showMission(id);return;}
 const chapter=chapterByRegion(m.region),n=chapter.nodes[m.index],choice=state.narrative.decisions[n.id],o=choice?n.options.find(o=>o.id===choice.optionId):null;
 openModal(assetSlot('bg-'+m.region+'-'+(m.index+1),sceneArt(m.region,0),'narrative-background')+'<div class="modal-pad"><span class="eyebrow">'+esc(chapter.region)+'</span><h2 id="modalHeading">'+esc(m.memory)+'</h2>'+assetSlot('memory-'+id,icon('grid'))+'<p class="story-text">'+esc(o?o.immediate:'El recuerdo ya está en tu colección. Su interpretación se escribirá al leer la escena correspondiente.')+'</p><div class="narrative-controls"><button class="primary-button" data-action="story" data-id="'+m.region+'">Abrir su capítulo</button><button class="secondary-button" data-action="close">Conservar mi memoria</button></div></div>');
}

function showStory(id){narrative.openRegion(id);}

let teacherCodes=null,teacherClass=null,pendingClass=null;
function classBadge(){return state.classroom?'<p class="class-badge">'+icon('seal')+' Compañía: <strong>'+esc(state.classroom.name)+'</strong> · '+state.completed.length+(state.completed.length===1?' sello verificado':' sellos verificados')+'</p>':'<p class="class-badge demo">Viajero sin compañía</p>';}
const classLink=c=>location.origin+location.pathname+'?curso='+encodeClassroom(c);
function codeTable(r,codes){
 const byId=codes?Object.fromEntries(codes.map(c=>[c.missionId,c.code])):null;
 return '<div class="teacher-select-row"><label for="teacherRegion">Territorio</label><select id="teacherRegion" class="select-input">'+REGIONS.map(t=>'<option value="'+t.id+'" '+(r.id===t.id?'selected':'')+'>'+t.name+'</option>').join('')+'</select></div><table class="teacher-code-table"><thead><tr><th>MISIÓN</th><th>SELLO</th><th>AJUSTAR</th></tr></thead><tbody>'+MISSIONS.filter(m=>m.region===r.id).map(m=>'<tr><td>'+esc(missionInfo(state,m.id).title)+'<small>'+m.xp+' experiencia · '+m.light+' luz</small></td><td><code>'+esc(byId?byId[m.id]:m.code)+'</code></td><td><button class="table-action" data-action="configure" data-id="'+m.id+'">Editar</button></td></tr>').join('')+'</tbody></table>';
}
function classShare(c,codes){
 return '<div class="review-box"><h3>Grupo '+esc(c.name)+'</h3><p>Comparte este enlace con las personas del grupo (por ejemplo, en un QR). Al abrirlo, su Atlas se une a la compañía y solo acepta estos sellos. En el juego, el grupo aparece como su compañía.</p><label class="modal-input-label" for="classLink">Enlace del grupo</label><input id="classLink" class="text-input" readonly value="'+esc(classLink(c))+'"><div class="narrative-controls"><button class="primary-button" data-action="class-copy">Copiar enlace</button><button class="secondary-button" data-action="class-print">Imprimir los 20 sellos</button></div><p class="subtle">Entrega cada sello cuando el desafío esté logrado. Con el mismo nombre de grupo y clave vuelves a generar los mismos sellos en cualquier equipo.</p></div>';
}
function showTeacher(regionId=selected){
 const r=REGIONS.find(r=>r.id===regionId)||REGIONS[0];let body;
 if(state.classroom&&!teacherCodes){
  body='<p>Este Atlas pertenece al grupo <strong>'+esc(state.classroom.name)+'</strong>. Los sellos y la edición de misiones requieren la clave del guía.</p><form id="teacherUnlock"><label class="modal-input-label" for="teacherSecret">Clave del guía</label><input id="teacherSecret" class="text-input" type="password" autocomplete="current-password"><div id="teacherError" class="form-error" role="status"></div><div class="modal-actions"><button class="primary-button" type="submit">Ver sellos del grupo</button><button type="button" class="secondary-button" data-action="close">Volver</button></div></form>';
 }else if(state.classroom){
  body=classShare(state.classroom,teacherCodes)+codeTable(r,teacherCodes)+'<div class="modal-actions"><button class="secondary-button" data-action="class-lock">Cerrar sesión docente</button><button class="secondary-button" data-action="export">Exportar esta copia</button></div>';
 }else{
  body='<div class="review-box"><h3>Crear un grupo</h3><p>Elige un nombre y una clave de guía (mínimo '+MIN_SECRET+' caracteres). Se generan 20 sellos privados y un enlace para las personas del grupo. La clave no se guarda: anótala para volver a ver los sellos.</p><form id="classCreate"><label class="modal-input-label" for="className">Nombre del grupo (en el juego: la compañía)</label><input id="className" class="text-input" maxlength="40" placeholder="Compañía del Alba" autocomplete="off"><label class="modal-input-label" for="classSecret" style="margin-top:15px">Clave del guía</label><input id="classSecret" class="text-input" type="password" autocomplete="new-password"><div id="classError" class="form-error" role="status"></div><div class="modal-actions"><button class="primary-button" type="submit">Generar sellos del grupo</button></div></form></div>'+
   (teacherClass?classShare(teacherClass.classroom,teacherClass.codes)+codeTable(r,teacherClass.codes):'<div class="section-heading"><h3>Sellos de muestra</h3></div><p class="notice">Sin grupo, estos sellos son públicos y sirven para probar la aventura.</p>'+codeTable(r,null)+'<div class="review-box"><h3>Revisión en esta partida</h3><p>Registran sellos de muestra en este dispositivo. Solo existen sin grupo.</p><div class="narrative-controls"><button class="primary-button" data-action="demo-one">Añadir una memoria</button><button class="secondary-button" data-action="demo-chapter">Preparar las cuatro memorias</button></div></div>')+
   '<div class="section-heading"><h3>Producción gráfica</h3></div><p>Los recursos pendientes conservan el dibujo provisional. El catálogo indica rutas, tamaños y puntos de sustitución.</p><div class="narrative-controls"><a class="secondary-button" href="direccion-arte/" target="_blank" rel="noopener">Abrir catálogo de arte</a><a class="secondary-button" href="?arte=1" target="_blank" rel="noopener">Inspeccionar espacios gráficos</a><a class="secondary-button" href="direccion-arte/Guia_Arte_Atlas_v1.md" download>Descargar guía de arte</a></div><div class="modal-actions"><button class="secondary-button" data-action="close">Volver</button><button class="secondary-button" data-action="export">Exportar esta copia</button></div>';
 }
 openModal('<div class="modal-pad"><span class="eyebrow">HERRAMIENTAS DEL GUÍA</span><h2 id="modalHeading">Tú decides cuándo se rompe cada sello.</h2><p>Cada desafío logrado entrega un sello: memoria, experiencia, luz y la siguiente escena de la crónica. En el juego solo se habla de pruebas del Velo; el vínculo con tus objetivos lo pones tú.</p>'+body+'</div>',{wide:true,focusId:state.classroom&&!teacherCodes?'teacherSecret':undefined});
 $('teacherRegion')&&($('teacherRegion').onchange=e=>showTeacher(e.target.value));
 $('teacherUnlock')&&($('teacherUnlock').onsubmit=e=>{e.preventDefault();unlockTeacher();});
 $('classCreate')&&($('classCreate').onsubmit=e=>{e.preventDefault();createClass();});
}
function unlockTeacher(){const codes=unlockClassroom(state.classroom,$('teacherSecret')?.value||'');if(!codes){$('teacherError').textContent='La clave no corresponde a este grupo.';return;}teacherCodes=codes;showTeacher();}
function createClass(){const result=createClassroom($('className').value,$('classSecret').value);if(!result.ok){$('classError').textContent=result.message;return;}teacherClass=result;showTeacher();}
function activeClass(){return state.classroom&&teacherCodes?{classroom:state.classroom,codes:teacherCodes}:teacherClass;}
async function copyClassLink(){const c=activeClass();if(!c)return;try{await navigator.clipboard.writeText(classLink(c.classroom));toast('Enlace del grupo copiado.');}catch{$('classLink')?.select();toast('Selecciona y copia el enlace manualmente.');}}
function printSeals(){
 const c=activeClass();if(!c)return;const w=window.open('','_blank');if(!w){toast('Permite ventanas emergentes para imprimir los sellos.');return;}
 w.document.write('<!doctype html><html lang="es"><meta charset="utf-8"><title>Sellos · '+esc(c.classroom.name)+'</title><style>body{font:14px system-ui,sans-serif;margin:24px;color:#173}h1{font-size:20px}.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.seal{border:2px dashed #476;border-radius:10px;padding:12px;break-inside:avoid}.seal b{display:block;font:700 22px ui-monospace,monospace;letter-spacing:2px;margin:6px 0}small{color:#567}</style><h1>Atlas de Ecos · '+esc(c.classroom.name)+'</h1><p>Recorta y entrega cada sello cuando el desafío esté logrado. Cada sello vale una vez por Atlas.</p><div class="grid">'+c.codes.map(x=>'<div class="seal"><small>'+esc(REGIONS.find(r=>r.id===x.region).name)+'</small><div>'+esc(missionInfo(state,x.missionId).title)+'</div><b>'+esc(x.code)+'</b></div>').join('')+'</div><script>print()<\/script></html>');
 w.document.close();
}
function offerClass(c){
 if(state.classroom?.id===c.id){toast('Tu Atlas ya viaja con '+c.name+'.');return;}
 pendingClass=c;
 openModal('<div class="modal-pad"><span class="eyebrow">UNA COMPAÑÍA TE ESPERA</span><h2 id="modalHeading">Unirte a '+esc(c.name)+'.</h2><p>Viajarás con esta compañía por Auralia. Tu Atlas reconocerá solo los sellos de sus pruebas.</p>'+(hasProgress(state)?'<p class="notice">Este dispositivo ya guarda un Atlas con progreso'+(state.classroom?' de la compañía '+esc(state.classroom.name):'')+'. Al unirte comenzará una nueva aventura; puedes exportar primero una copia.</p>':'')+'<div class="modal-actions"><button class="primary-button" data-action="class-join">Unirme a la compañía</button>'+(hasProgress(state)?'<button class="secondary-button" data-action="export">Exportar antes</button>':'')+'<button class="secondary-button" data-action="close">Ahora no</button></div></div>');
}
function acceptClass(){if(!pendingClass)return;narrative.resetEcho();state=joinClassroom(state,pendingClass);pendingClass=null;teacherCodes=null;save();selected='bosque';closeModal();navigate('atlas');toast('Ahora viajas con '+state.classroom.name+'.');}

function showConfigure(id){const m=missionInfo(state,id);if(!m)return;openModal(`<div class="modal-pad"><span class="eyebrow">ACTIVIDAD ${state.classroom?esc(m.label.toUpperCase()):m.code}</span><h2 id="modalHeading">Tu desafío, dentro de Auralia.</h2><p>Puedes reescribir la misión con tu propio desafío, en lenguaje de aventura. El sello y la recompensa se conservan. El cambio queda en este dispositivo.</p><form id="missionConfig"><label class="modal-input-label" for="missionTitle">Nombre de la misión</label><input id="missionTitle" class="text-input" maxlength="90" value="${esc(m.title)}"><label class="modal-input-label" for="missionPrompt" style="margin-top:15px">Texto de la misión</label><textarea id="missionPrompt" class="text-area" maxlength="600">${esc(m.prompt)}</textarea><div class="modal-actions"><button class="primary-button" type="submit">Guardar misión</button><button class="secondary-button" type="button" data-action="config-reset" data-id="${id}">Recuperar texto original</button></div></form></div>`);$('missionConfig').onsubmit=e=>{e.preventDefault();configureMission(state,id,$('missionTitle').value,$('missionPrompt').value);save();render();showTeacher(m.region);toast('La misión quedó guardada en este dispositivo.');};}
function showHelp(){
 openModal('<div class="modal-pad"><span class="eyebrow">EL ATLAS TE ACOMPAÑA</span><h2 id="modalHeading">Memorias, decisiones y huellas.</h2><p>Cada sello que rompes libera una memoria, experiencia y luz. Puedes romperlos por adelantado. La crónica se lee en orden: prólogo, cuatro escenas por territorio y un epílogo personal.</p><p>Las hazañas recompensan tu recorrido con luz y títulos. La luz teje nuevos acabados para tu Atlas.</p><p>Antes de confirmar puedes volver al menú. Después, tu decisión permanece. Al cerrar un capítulo se habilitan sus ecos alternos para explorar sin cambiar la partida.</p><p>El honor conserva compromisos y revisiones. No hay una barra de bondad: ninguna ruta da más premios que otra.</p><div class="settings-line"><div><label for="reduceMotion">Reducir movimiento</label><p>Desactiva animaciones y transiciones.</p></div><input id="reduceMotion" type="checkbox" '+(state.reducedMotion?'checked':'')+'></div><p class="notice">Guardado automático en este navegador. Exporta para conservar una copia o llevarla a otro dispositivo. Todavía no hay cuentas ni sincronización remota.</p><div class="narrative-controls"><button class="secondary-button" data-action="export">Exportar Atlas</button><button class="secondary-button" data-action="import">Importar copia</button><button class="secondary-button danger-button" data-action="reset">Comenzar otro Atlas</button></div><p class="subtle guide-link"><button class="quiet-button" data-action="teacher">Herramientas del guía</button></p></div>');
 $('reduceMotion').onchange=e=>{state.reducedMotion=e.target.checked;save();renderHeader();};
}

function exportAtlas(){const file=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download='Mi_Atlas_de_Ecos.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Tu copia incluye toda tu aventura.');}
function sync(){}

document.addEventListener('click',e=>{
  const nav=e.target.closest('[data-view]');if(nav){if(modalOpen)closeModal();navigate(nav.dataset.view);return;}
  const target=e.target.closest('[data-region]');if(target){selected=target.dataset.region;render();return;}
  const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const {action,id}=b.dataset;
  if(action==='echo-start'&&regionState(state,id)?.decisionCount===4&&recordEcho(state,id))save();
  if(narrative.handle(b))return;
  switch(action){
    case 'close':closeModal();break;
    case 'reward-map':closeModal();navigate('atlas');break;
    case 'code':showCode();break;
    case 'story':showStory(id);break;
    case 'story-page':showStory(id);break;
    case 'choose':showStory(id);break;
    case 'mission':showMission(id);break;
    case 'memory':showMemory(id);break;
    case 'select-region':selected=id;render();break;
    case 'mission-filter':missionFilter=id;render();break;
    case 'memory-filter':memoryFilter=id;render();break;
    case 'collection':collection=id;render();break;
    case 'look':if(['bosque','marea','sol'].includes(id)){state.look=id;save();render();}break;
    case 'theme':{const result=buyTheme(state,id);if(!result.ok){toast(result.message);break;}save();render();toast(result.purchased?'La luz tejió un nuevo acabado para tu Atlas.':'Tu Atlas ya lleva este acabado.');break;}
    case 'teacher':showTeacher();break;
    case 'configure':if(!state.classroom||teacherCodes)showConfigure(id);break;
    case 'class-create':createClass();break;
    case 'class-unlock':unlockTeacher();break;
    case 'class-lock':teacherCodes=null;showTeacher();break;
    case 'class-print':printSeals();break;
    case 'class-copy':copyClassLink();break;
    case 'class-join':acceptClass();break;
    case 'equip-title':if(equipTitle(state,id==='none'?null:id)){save();render();toast(id==='none'?'Vuelves a usar tu rango.':'Ahora te conocen como '+titleOf(state)+'.');}break;
    case 'config-reset':configureMission(state,id,'','');save();render();showConfigure(id);break;
    case 'demo-one':{if(state.classroom)break;const m=nextMission(state);if(!m){toast('Este capítulo espera tu decisión. Abre su crónica.');break;}const result=claimCode(state,m.code);if(result.ok){selected=m.region;save();render();showReward(result);}break;}
    case 'demo-chapter':{if(state.classroom)break;const r=currentRegion(state);for(const m of MISSIONS.filter(m=>m.region===r.id&&!state.completed.includes(m.id)))claimCode(state,m.code);selected=r.id;save();render();showStory(r.id);break;}
    case 'help':showHelp();break;
    case 'export':exportAtlas();break;
    case 'import':$('importFile').click();break;
    case 'reset':openModal(`<div class="modal-pad"><span class="eyebrow">VOLVER A LA PRIMERA PÁGINA</span><h2 id="modalHeading">¿Comenzar otro Atlas?</h2><p>Se reemplazará el progreso y la configuración local del Atlas. La partida de la expedición se conserva aparte. Puedes exportar primero una copia.</p><div class="modal-actions"><button class="secondary-button" data-action="export">Exportar antes</button><button class="primary-button" data-action="reset-confirm">Comenzar otro Atlas</button></div></div>`);break;
    case 'reset-confirm':narrative.resetEcho();state=state.classroom?joinClassroom(state,state.classroom):newAtlas();save();selected='bosque';closeModal();navigate('atlas');toast('El Atlas abre una nueva página.');break;
  }
});
$('closeModal').onclick=closeModal;$('atlasModalBackdrop').onclick=e=>{if(e.target===$('atlasModalBackdrop'))closeModal();};$('codeBtn').onclick=showCode;$('profileBtn').onclick=()=>navigate('guardian');$('helpBtn').onclick=showHelp;
document.addEventListener('keydown',e=>{
  if(modalOpen){if(e.key==='Escape'){e.preventDefault();closeModal();return;}if(e.key==='Tab'){const f=[...$('atlasModal').querySelectorAll('button:not(:disabled),input:not(:disabled),textarea,select,a[href]')].filter(x=>!x.hidden),first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}return;}
  const target=e.target.closest('[data-region]');if(target&&['Enter',' '].includes(e.key)){e.preventDefault();selected=target.dataset.region;render();}
});
$('importFile').onchange=async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>1000000){toast('La copia es demasiado grande para un Atlas.');return;}
  let restored;try{restored=restoreAtlas(JSON.parse(await file.text()));}catch{}
  if(!restored){toast('El archivo no contiene una copia válida de este Atlas.');return;}
  openModal(`<div class="modal-pad"><span class="eyebrow">UNA HISTORIA QUE REGRESA</span><h2 id="modalHeading">Recuperar el Atlas de ${esc(restored.name)}.</h2><p>La copia contiene ${atlasStats(restored).memories} memorias y ${atlasStats(restored).restored} territorios restaurados. Reemplazará el Atlas de este navegador. La partida de la expedición se conserva aparte.</p><div class="modal-actions"><button id="confirmImport" class="primary-button">Recuperar esta historia</button><button class="secondary-button" data-action="close">Conservar mi Atlas actual</button></div></div>`);
  $('confirmImport').onclick=()=>{narrative.resetEcho();state=restored;save();selected=currentRegion(state).id;closeModal();navigate('atlas');toast('Tu historia vuelve a estar contigo.');};
};
window.addEventListener('hashchange',()=>{const v=location.hash.slice(1);if(views.some(x=>x[0]===v)){view=v;render();}});
window.addEventListener('storage',e=>{if(e.key===ADVENTURE_KEY)sync();else if(e.key===ATLAS_KEY){try{const updated=restoreAtlas(JSON.parse(e.newValue));if(updated){state=updated;render();}}catch{}}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});window.addEventListener('pageshow',sync);
save();render();
{const params=new URLSearchParams(location.search),raw=params.get('curso');if(raw!==null){params.delete('curso');history.replaceState(null,'',location.pathname+(params.toString()?'?'+params:'')+location.hash);const c=decodeClassroom(raw);if(c)offerClass(c);else toast('El enlace de la compañía está incompleto o dañado.');}else if(params.has('guia'))showTeacher();}
if(imported.length)toast(imported.length===1?'Tu expedición dejó un nuevo hallazgo en el Atlas.':'Tu expedición dejó '+imported.length+' hallazgos en el Atlas.');
