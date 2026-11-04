import {SCENES,SAVE_KEY,ACTIVITY_SEALS,JOURNEY,TERRITORIES} from './game-data.js';
import {newGame,restoreGame,redeemSeal,travel,openTemple,solveForest,turnMirror,solveMemory,recoverMedallion,currentQuest,movePlayer,nearestEntity,walkable,prepareDemo,findWalkingPath} from './engine.js';
import {createRenderer} from './art.js';
import {AuraliaAudio} from './audio.js';

const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 bell:'M6 16h12l-2-3V9a4 4 0 0 0-8 0v4l-2 3Zm4 4h4M12 2v3',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
 leaf:'M20 3C10 2 3 6 4 13c1 9 14 9 16-10ZM5 19 16 8M9 14l-1-5m4 2 5 1',
 sword:'m15 3 6 0 0 6-11 10-5-5L15 3ZM3 21l5-5m-4-4 8 8',
 hand:'M8 13V7a2 2 0 0 1 4 0v5-8a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v8c0 5-3 7-7 7-3 0-4-2-6-5L4 13c-2-3 1-5 3-2l1 2Z',
 wind:'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3',
 echo:'M12 6v12M8 9v6m8-6v6M4 7a9 9 0 0 0 0 10m16-10a9 9 0 0 1 0 10',
 compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-16-2 8-8 4 4-8 6-4Z',
 seal:'m12 2 3 3 4 1 1 4 2 3-3 3-1 4-4 1-3 2-3-3-4-1-1-4-2-3 3-3 1-4 4-1 3-2Zm-4 10 3 3 5-6',
 volume:'M11 4 6 8H2v8h4l5 4V4Zm4 4a5 5 0 0 1 0 8m3-11a9 9 0 0 1 0 14',
 volumeOff:'M11 4 6 8H2v8h4l5 4V4Zm5 5 6 6m0-6-6 6',
 expand:'M3 9V3h6m6 0h6v6m0 6v6h-6m-6 0H3v-6',
 menu:'M4 6h16M4 12h16M4 18h16',
 move:'M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4m12-8 4 4-4 4',
 water:'M12 2C8 8 4 12 4 16a8 8 0 0 0 16 0c0-4-4-8-8-14ZM8 16a4 4 0 0 0 4 4',
 root:'M12 2v16M4 7c2 6 12 6 16 0M5 22l7-7 7 7m-7-7v7',
 sun:'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-14v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
 moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
 heart:'M12 21 3 12C-3 5 7-1 12 6 17-1 27 5 21 12L12 21Z',
 book:'M12 5C7 2 3 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v15',
 arrow:'M4 12h16m-6-6 6 6-6 6',
 check:'m5 12 4 4L19 6',
 person:'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 22c0-10 18-10 18 0'
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.spark}"/></svg>`;
function hydrateIcons(root=document){root.querySelectorAll('[data-icon]').forEach(e=>e.innerHTML=icon(e.dataset.icon));}
hydrateIcons();

let saved=null,storageAvailable=true;
try{saved=restoreGame(JSON.parse(localStorage.getItem(SAVE_KEY)));}catch{storageAvailable=false;}
let state=saved||newGame();
const renderer=createRenderer($('world')),audio=new AuraliaAudio();
const rt={time:0,moving:false,facing:{x:0,y:1},attack:0,dash:0,hurt:0,echo:false,echoLeft:0,title:true,enemies:[],boss:null,effects:[]};
let started=false,modalOpen=false,modalReturn=null,keys=new Set(),stick={x:0,y:0},nearest=null,lastFrame=0,lastSave=0,lastHUD='',attackCooldown=0,dashCooldown=0,toastTimer,bannerTimer,autoSaveDirty=false,screenHidden=false,walkingPath=[],walkToEntity=null;
const reduceQuery=window.matchMedia('(prefers-reduced-motion: reduce)');
state.settings.reducedMotion ||= reduceQuery.matches;
if(saved)$('startLabel').textContent='Continuar mi aventura';
// The landing uses Valdeluz even when a save belongs to another territory.
const titleState=newGame();

function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageAvailable=true;$('saveStatus').textContent='Tu historia se guarda en este dispositivo';}catch{storageAvailable=false;$('saveStatus').textContent='Guardado no disponible en este navegador';}
  autoSaveDirty=false;lastSave=rt.time;
}
function changed(){autoSaveDirty=true;save();updateHUD(true);}
function toast(message,duration=3500){clearTimeout(toastTimer);$('toast').textContent=message;$('toast').classList.remove('hidden');toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),duration);}
function showBanner(){const scene=SCENES[state.scene];$('bannerSub').textContent=scene.subtitle;$('bannerTitle').textContent=scene.name;$('sceneBanner').classList.add('hidden');requestAnimationFrame(()=>$('sceneBanner').classList.remove('hidden'));clearTimeout(bannerTimer);bannerTimer=setTimeout(()=>$('sceneBanner').classList.add('hidden'),3700);}
function setModal(html,{wide=false,onMount}={}){
  if(!modalOpen)modalReturn=document.activeElement;
  modalOpen=true;keys.clear();stick={x:0,y:0};walkingPath=[];walkToEntity=null;rt.destination=null;$('joystickKnob').style.transform='';
  $('modalContent').innerHTML=html;$('modal').classList.toggle('wide',wide);$('modalBackdrop').classList.remove('hidden');hydrateIcons($('modalContent'));
  $('modal').scrollTop=0;onMount?.();
  requestAnimationFrame(()=>{const target=$('modalContent').querySelector('input:not([type=checkbox]),button');(target||$('modalClose')).focus();});
}
function closeModal(){modalOpen=false;$('modalBackdrop').classList.add('hidden');keys.clear();if(started)$('world').focus({preventScroll:true});else modalReturn?.focus({preventScroll:true});}
$('modalClose').onclick=closeModal;
$('modalBackdrop').onclick=e=>{if(e.target===$('modalBackdrop'))closeModal();};

function dialogue(name,title,text,actions=[]){
  setModal(`<div class="speaker"><div class="portrait">${icon(name==='Elia'?'person':name==='Auralia'?'bell':'leaf')}</div>${escapeHTML(name.toUpperCase())}</div><h2 id="modalTitle">${title}</h2><p class="dialogue-line">${text}</p><div class="modal-actions">${actions.map((a,i)=>`<button id="dialogueAction${i}" class="${i?'secondary-button':'gold-button'}">${a.label}</button>`).join('')}</div>`,{onMount:()=>actions.forEach((a,i)=>$('dialogueAction'+i).onclick=a.action)});
}
function initializeScene(){
  rt.enemies=(SCENES[state.scene].shadows||[]).filter(e=>!state.defeatedShadows.includes(e.id)).map(e=>({...e,hp:2,hurt:0,homeX:e.x,homeY:e.y}));
  rt.boss={x:880,y:275,hp:6,maxHp:6,phase:'idle',timer:1.2,dx:0,dy:1,hurt:0,active:false};rt.attack=0;rt.hurt=0;rt.dash=0;rt.echo=false;rt.effects=[];walkingPath=[];walkToEntity=null;rt.destination=null;keys.clear();stick={x:0,y:0};
}
function startGame(fresh=false,name){
  if(fresh)state=newGame(name);
  started=true;rt.title=false;$('titleScreen').classList.add('hidden');$('gameUI').classList.remove('hidden');closeModal();initializeScene();updateHUD(true);save();showBanner();
  if(state.settings.sound)audio.setEnabled(true).then(updateSoundButton);
  if(!storageAvailable)toast('El navegador no permite guardar. Mantén esta ventana abierta.',5500);
}
$('startBtn').onclick=()=>{
  if(saved){startGame();return;}
  setModal(`<span class="eyebrow">✦ PRÓLOGO · EL PRIMER RECUERDO</span><h2 id="modalTitle">Alguien pronunció tu nombre.</h2><p>Anoche las campanas de Valdeluz dejaron de sonar. Esta mañana, una voz te llamó desde el bosque. Elia te espera junto a su casa.</p><form id="nameForm"><label class="input-label" for="guardianName">¿Cómo te llamas, guardián?</label><input id="guardianName" class="name-input" placeholder="Tu nombre o apodo" maxlength="24" autocomplete="off"><p class="subtle">Tu partida se guarda automáticamente en este navegador.</p><div class="modal-actions"><button class="gold-button" type="submit">Entrar a Valdeluz ${icon('arrow')}</button></div></form>`,{onMount:()=>{$('nameForm').onsubmit=e=>{e.preventDefault();startGame(true,$('guardianName').value);};}});
};
$('proposalBtn').onclick=()=>showJournal('classroom');

function transition(scene,position){
  const result=travel(state,scene,position);if(!result.ok){toast(result.message);return false;}
  initializeScene();changed();showBanner();audio.next=0;return true;
}
function burst(x,y,color='#e3d7a0',count=18){if(state.settings.reducedMotion)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,speed=30+Math.random()*80;rt.effects.push({x,y:y-25,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed-15,life:.8,max:.8,size:2+Math.random()*2,color});}}
function echo(){
  if(!started||modalOpen)return;
  rt.echo=!rt.echo;rt.echoLeft=12;audio.chime('echo');updateHUD(true);
  if(rt.echo){const hint=state.scene==='forest'?'El pasado muestra el orden: agua, raíz, sol.':state.scene==='sanctuary'?'En el pasado, la estatua señala hacia el este.':'Escucha la fuente y busca las raíces del jardín al oeste.';toast(hint,4300);}
}
function attack(){
  if(!started||modalOpen||attackCooldown>0)return;
  rt.attack=.28;attackCooldown=.36;audio.tone(180,.12,.12,'triangle');
  for(const enemy of rt.enemies){if(enemy.hp<=0||enemy.hurt>0)continue;const dx=enemy.x-state.x,dy=enemy.y-state.y,d=Math.hypot(dx,dy);if(d<95&&(d<43||(dx*rt.facing.x+dy*rt.facing.y)/d>-.15)){enemy.hp--;enemy.hurt=.45;burst(enemy.x,enemy.y,'#cbd9a3',9);if(enemy.hp<=0){state.defeatedShadows.push(enemy.id);changed();audio.chime('success');}}}
  const b=rt.boss;
  if(state.scene==='sanctuary'&&b.active&&b.hp>0&&Math.hypot(b.x-state.x,b.y-state.y)<110){
    if(b.phase==='recover'&&b.hurt<=0){b.hp--;b.hurt=.65;burst(b.x,b.y-30,'#ecdf9f',20);audio.chime('hit');if(b.hp<=0){state.flags.bossDefeated=true;state.hp=6;changed();audio.chime('relic');toast('El guardián recuerda. Recupera el Eco que apareció al norte.',6000);}}
    else if(b.phase!=='recover')toast('Su coraza está cerrada. Espera a que el núcleo brille.',2000);
  }
}
function dash(){if(!started||modalOpen||dashCooldown>0)return;rt.dash=.22;dashCooldown=.9;audio.tone(130,.15,.08);}
function hurt(amount=1){
  if(rt.hurt>0||rt.dash>0)return;state.hp-=amount;rt.hurt=1.5;audio.chime('hit');
  if(state.hp<=0){state.hp=6;Object.assign(state,SCENES[state.scene].spawn);initializeScene();toast('La campana te trae de vuelta. Conservas todos tus hallazgos.',5000);}
  changed();
}

function interact(targetId){
  if(!started||modalOpen)return;
  const targeted=typeof targetId==='string'?SCENES[state.scene].entities.find(e=>e.id===targetId&&Math.hypot(e.x-state.x,e.y-state.y)<115):null;
  const e=targeted||nearestEntity(state,115);if(!e){toast('Acércate a un personaje, un altar o un objeto para interactuar.',2500);return;}
  const f=state.flags;
  switch(e.id){
    case 'elia':
      if(!f.metElia){f.metElia=true;changed();audio.chime('relic');dialogue('Elia','La campana que recuerda.',`«${escapeHTML(state.name)}, el bosque no se ha quedado en silencio. Está esperando que alguien lo escuche. Lleva esta campana agrietada. Sus ecos revelan lo que nuestros ojos ya no ven».<br><br>Recibes la <strong>Campana Agrietada</strong>. Usa <strong>Eco</strong> para escuchar el pasado. Un Sello de Exploración abrirá el arco del este.`,[{label:'Guardar la campana',action:()=>{closeModal();burst(e.x,e.y);toast('Campana obtenida. Abre «Sellos» y prueba AURALIA-INICIO.',5500);}},{label:'Canjear mi sello',action:()=>showRedeem('exploration')}]);}
      else if(f.restored)dialogue('Elia','Vuelvo a recordar.',`«El árbol del jardín… lo plantamos cuando Nara era pequeña. Ahora lo recuerdo. Has devuelto mucho más que el sonido de una campana».<br><br>Busca las raíces al oeste de la aldea: tu guante todavía tiene una historia por descubrir.`,[{label:'Seguir explorando',action:closeModal}]);
      else dialogue('Elia','Escucha antes de avanzar.',`«El cofre de la exploradora espera al norte del claro del bosque. Si te pierdes, escucha un eco. El pasado siempre deja señales».`,[{label:'Seguir el camino',action:closeModal},{label:'Ver mi diario',action:()=>showJournal('journal')}]);
      break;
    case 'nara':dialogue('Nara',f.restored?'El camino vuelve a existir.':'Una exploradora sin mapa.',f.restored?'«Durante años creí que esa historia era un sueño. Ahora recuerdo el santuario y el puente. Auralia está despertando».':'«Al cruzar el bosque, busca un altar antes del río. Mi abuela decía: primero bebe la tierra, después despierta la raíz, y al final busca el sol».',[{label:'Recordaré tus palabras',action:closeModal}]);break;
    case 'fountain':
      if(f.restored){f.epilogue=true;changed();showEpilogue();}else dialogue('Auralia','El agua guarda una voz.','Por un instante, oyes campanas bajo el agua. Después, silencio.<br><br>Un recuerdo espera en el santuario del bosque. Elia puede ayudarte a dar el primer paso.',[{label:'Escuchar el mundo',action:()=>{closeModal();echo();}}]);break;
    case 'forestGate':
      if(!f.metElia){toast('Elia te espera junto a la casa de techo rojo, al oeste.');break;}
      if(!state.seals.includes('exploration')){showRedeem('exploration');break;}
      transition('forest');break;
    case 'backVillage':transition('village',{x:1360,y:580});break;
    case 'templeGate':transition('sanctuary');break;
    case 'templeExit':transition('forest',{x:1430,y:290});break;
    case 'forestStone':if(f.forestPuzzle)toast('El altar ha despertado. El cofre al norte está abierto para ti.');else showForestPuzzle();break;
    case 'relicChest':
      if(f.gauntlet){toast('La reliquia ya viaja contigo.');break;}
      if(!f.forestPuzzle){dialogue('Auralia','Tres símbolos protegen el cofre.','Agua. Raíz. Sol.<br><br>Un altar al sur y un recuerdo cercano conservan el orden que necesitas. Escucha con tu campana.',[{label:'Buscar el altar',action:closeModal}]);break;}
      f.gauntlet=true;changed();audio.chime('relic');burst(e.x,e.y);dialogue('Auralia','Guante de Raíces',`La tierra responde a tu mano. Puedes apartar las raíces antiguas que antes bloqueaban el camino.<br><br><strong>Tu nueva habilidad permanece contigo.</strong> Cruza el puente hacia el este y busca la entrada del santuario.`,[{label:'Equipar la reliquia',action:closeModal},{label:'Ver mis reliquias',action:()=>showJournal('relics')}]);break;
    case 'forestRoots':case 'villageRoots':
      if(!f.gauntlet){toast('Estas raíces responden a una reliquia que todavía no has encontrado.');break;}
      f[e.flag]=true;burst(e.x,e.y,'#c5dd9b',30);changed();audio.chime('success');toast(e.id==='villageRoots'?'El guante abre un camino en un lugar que ya conocías.':'Las raíces se apartan. El santuario te espera al norte.');break;
    case 'secretChest':
      if(f.secretFound){toast('El recuerdo de este cofre ya forma parte de tu diario.');break;}
      f.secretFound=true;changed();audio.chime('relic');dialogue('Auralia','Un jardín para Nara.','Dentro del cofre encuentras una carta de Elia y una pequeña semilla.<br><br>«Cuando olvidemos por qué plantamos este jardín, que alguien encuentre esta carta: fue por ti, Nara. Para que siempre tuvieras un lugar al que volver».<br><br><strong>Secreto descubierto: la semilla de Valdeluz.</strong>',[{label:'Guardar este recuerdo',action:closeModal}]);break;
    case 'naraMemory':dialogue('El recuerdo de Nara','Lo que el bosque conserva.','Una figura translúcida recorre el claro. Escuchas sus palabras:<br><br>«Primero el agua. Después la raíz. Al final, el sol. Así despertamos el altar».',[{label:'Conservar la pista',action:closeModal}]);break;
    case 'signVillage':dialogue('Auralia','La senda del este.','→ Bosque de los Susurros.<br><br>Los sellos que recibes en tus actividades abren nuevos capítulos. Puedes canjearlos con el botón <strong>Sellos</strong>.',[{label:'Seguir explorando',action:closeModal},{label:'Canjear un sello',action:()=>showRedeem()}]);break;
    case 'signForest':dialogue('Auralia','Una advertencia tallada.','«El guardián no escucha a quien golpea su coraza. Espera a que termine de embestir: su corazón de luz revelará el momento».<br><br><strong>J / Atacar</strong> · <strong>Espacio / Esquivar</strong>',[{label:'Seguir el camino',action:closeModal}]);break;
    case 'sealPedestal':
      if(f.templeOpen){toast('El sello está activo. Explora la cámara del norte y la sala del este.');break;}
      if(!state.seals.includes('sanctuary')){showRedeem('sanctuary',true);break;}
      activateTemple();break;
    case 'mirrorPuzzle':if(!f.templeOpen)toast('Activa primero el pedestal del vestíbulo.');else if(f.mirrorsLit)toast('Los cristales ya iluminan el corazón del santuario.');else showMirrors();break;
    case 'memoryPuzzle':if(!f.templeOpen)toast('Activa primero el pedestal del vestíbulo.');else if(f.memoryLit)toast('La estatua ya ha recuperado su recuerdo.');else showMemory();break;
    case 'forestMedallion':if(recoverMedallion(state)){changed();audio.chime('relic');burst(e.x,e.y,'#f3e8b1',40);showVictory();}break;
  }
}
function activateTemple(){const r=openTemple(state);if(!r.ok){toast(r.message);return;}changed();audio.chime('success');burst(300,640);toast('Dos salas han despertado. Enciende sus luces para llegar al guardián.',5000);}

function showRedeem(expected,activate=false){
  const seal=ACTIVITY_SEALS.find(s=>s.id===expected);
  setModal(`<span class="eyebrow">✦ ACTIVIDADES QUE ABREN CAMINOS</span><h2 id="modalTitle">Un sello, un nuevo capítulo.</h2><p>${seal?`${escapeHTML(seal.title)}: ${escapeHTML(seal.unlock)}`:'Cada sello recibido en tus actividades puede abrir un nuevo camino en Auralia.'}</p><form id="sealForm"><label class="input-label" for="sealCode">Código del sello</label><input id="sealCode" class="code-input" placeholder="AURALIA-…" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="40"><p id="sealError" class="input-error" role="status"></p><div class="modal-actions"><button type="submit" class="gold-button">Canjear sello ${icon('seal')}</button><button id="sampleSeal" type="button" class="secondary-button">Usar sello de prueba</button></div></form><p class="subtle">Prototipo: los códigos de prueba están disponibles en Diario → El aula. Estos códigos muestran la progresión y no verifican una evaluación.</p>`,{onMount:()=>{
    $('sampleSeal').onclick=()=>{$('sealCode').value=seal?.code||ACTIVITY_SEALS.find(s=>!state.seals.includes(s.id))?.code||ACTIVITY_SEALS[0].code;$('sealCode').focus();};
    $('sealForm').onsubmit=e=>{e.preventDefault();const result=redeemSeal(state,$('sealCode').value);if(!result.ok){$('sealError').textContent=result.message;return;}changed();audio.chime('success');closeModal();if(activate&&result.seal.id==='sanctuary')activateTemple();else toast(result.message,5000);};
  }});
}

function showForestPuzzle(){
  let sequence=[];
  setModal(`<span class="eyebrow">✦ ALTAR DEL BOSQUE</span><h2 id="modalTitle">El orden de la vida.</h2><p>«Primero bebe la tierra. Después despierta la raíz. Al final, busca el sol».</p><p class="subtle">Toca los tres símbolos en orden. Puedes escuchar un eco para recuperar la pista.</p><div id="puzzleSlots" class="puzzle-slots"><span class="puzzle-slot">·</span><span class="puzzle-slot">·</span><span class="puzzle-slot">·</span></div><div class="rune-choices">${[['water','Agua'],['root','Raíz'],['sun','Sol']].map(([id,label])=>`<button class="rune-button" data-rune="${id}">${icon(id)}<small>${label}</small></button>`).join('')}</div><p id="puzzleMessage" class="notice" role="status">El altar espera una secuencia.</p><div class="modal-actions"><button id="forestHint" class="secondary-button">${icon('echo')} Escuchar la pista</button><button id="forestReset" class="secondary-button">Reiniciar secuencia</button></div>`,{onMount:()=>{
    const refresh=()=>{$('puzzleSlots').innerHTML=[0,1,2].map(i=>`<span class="puzzle-slot">${sequence[i]?icon(sequence[i]):'·'}</span>`).join('');};
    $('forestHint').onclick=()=>{$('puzzleMessage').textContent='El eco susurra: agua → raíz → sol.';audio.chime('echo');};
    $('forestReset').onclick=()=>{sequence=[];refresh();$('puzzleMessage').textContent='El altar espera una nueva secuencia.';};
    document.querySelectorAll('[data-rune]').forEach(b=>b.onclick=()=>{
      if(state.flags.forestPuzzle)return;sequence.push(b.dataset.rune);audio.tone({water:293.66,root:392,sun:493.88}[b.dataset.rune],.5,.2);refresh();
      if(sequence.length===3){if(solveForest(state,sequence)){changed();audio.chime('success');document.querySelectorAll('[data-rune]').forEach(el=>el.disabled=true);$('puzzleMessage').textContent='El altar despierta. El cofre al norte ha liberado su cierre.';const button=document.createElement('button');button.className='gold-button';button.textContent='Ir en busca de la reliquia';button.onclick=closeModal;$('modalContent').append(button);}else{sequence=[];$('puzzleMessage').textContent='Los símbolos se apagan. Escucha la pista e inténtalo otra vez.';}}
    });
  }});
}
function showMirrors(){
  const draw=()=>{
    $('mirrorButtons').innerHTML=state.mirrors.map((n,i)=>`<button class="rune-button mirror-button" data-mirror="${i}" aria-label="Girar cristal ${i+1}"><span style="display:block;transform:rotate(${n*90}deg)">↑</span><small>Cristal ${i+1}</small></button>`).join('');
    document.querySelectorAll('[data-mirror]').forEach(b=>b.onclick=()=>{const solved=turnMirror(state,Number(b.dataset.mirror));changed();audio.tone(392+Number(b.dataset.mirror)*98,.4,.13);draw();if(solved){$('mirrorMessage').textContent='La luz vuelve a fluir. La sala de los cristales ha despertado.';audio.chime('success');document.querySelectorAll('[data-mirror]').forEach(el=>el.disabled=true);}});
  };
  setModal(`<span class="eyebrow">✦ SALA DE LOS CRISTALES</span><h2 id="modalTitle">Una misma dirección.</h2><p>Los tres cristales deben apuntar al <strong>norte ↑</strong> para conducir la luz hacia el corazón del santuario. Cada toque gira un cristal un cuarto de vuelta.</p><div id="mirrorButtons" class="rune-choices"></div><p id="mirrorMessage" class="notice" role="status">Orienta las tres puntas hacia arriba.</p><div class="modal-actions"><button id="leaveMirrors" class="secondary-button">Volver a explorar</button></div>`,{onMount:()=>{draw();$('leaveMirrors').onclick=closeModal;}});
}
function showMemory(){
  setModal(`<span class="eyebrow">✦ CÁMARA DEL ECO</span><h2 id="modalTitle">La piedra también recuerda.</h2><p>La estatua ha perdido parte de su brazo. La inscripción pregunta: <strong>«¿Hacia dónde señalaba antes de que llegara el silencio?»</strong></p><div class="modal-actions"><button id="listenMemory" class="secondary-button">${icon('echo')} Escuchar un eco</button></div><p id="memoryClue" class="notice" role="status">La campana puede revelar lo que falta.</p><div class="rune-choices" style="flex-wrap:wrap">${[['north','Norte ↑'],['east','Este →'],['south','Sur ↓'],['west','Oeste ←']].map(([id,label])=>`<button data-direction="${id}" class="secondary-button">${label}</button>`).join('')}</div>`,{onMount:()=>{
    $('listenMemory').onclick=()=>{$('memoryClue').textContent='En el pasado, el brazo de la estatua se extiende hacia el este, donde nace el sol.';rt.echo=true;rt.echoLeft=12;audio.chime('echo');};
    document.querySelectorAll('[data-direction]').forEach(b=>b.onclick=()=>{if(solveMemory(state,b.dataset.direction)){changed();audio.chime('success');closeModal();toast(state.flags.chambersLit?'Las dos luces están encendidas. El corazón del santuario se abre.':'La cámara del eco despierta. Falta la luz de los cristales.',5000);}else $('memoryClue').textContent='El recuerdo no coincide. Escucha el eco e inténtalo de nuevo.';});
  }});
}
function showVictory(){
  setModal(`<div class="victory-content"><span class="eyebrow">✦ UN TERRITORIO VUELVE A RECORDAR</span><div class="victory-emblem">${icon('root')}</div><h2 id="modalTitle">El primer eco<br>ha despertado.</h2><p>Las raíces se iluminan. Al otro lado del río, Valdeluz vuelve a escuchar sus campanas. Has recuperado el <strong>Eco del Bosque</strong>.</p><p class="subtle">Conservas el Guante de Raíces. Los lugares que ya conoces pueden guardar nuevos caminos.</p><div class="modal-actions"><button id="returnVillage" class="gold-button">Volver a Valdeluz ${icon('arrow')}</button><button id="stayTemple" class="secondary-button">Permanecer aquí</button></div></div>`,{onMount:()=>{$('returnVillage').onclick=()=>{closeModal();transition('village',{x:795,y:580});};$('stayTemple').onclick=closeModal;}});
}
function showEpilogue(){
  dialogue('Auralia','Lo que hacemos deja un eco.',`El agua refleja un bosque lleno de luz. Escuchas la voz de Elia, la risa de Nara y una campana que vuelve a sonar.<br><br>«No todo lo que se pierde desaparece. Algunas cosas esperan a que alguien vuelva a buscarlas».<br><br><strong>Prólogo completado, ${escapeHTML(state.name)}.</strong> Puedes seguir explorando el jardín de Valdeluz. Más allá del bosque, otros cuatro territorios esperan su historia.`,[{label:'Seguir explorando',action:closeModal},{label:'Ver la propuesta completa',action:()=>showJournal('classroom')}]);
}

function showJournal(tab='journal'){
  const tabs=[['journal','Diario'],['atlas','Atlas'],['relics','Reliquias'],['classroom','El aula'],['settings','Opciones']];
  const header=`<span class="eyebrow">✦ CUADERNO DEL GUARDIÁN</span><h2 id="modalTitle">${({journal:'Cada paso deja una historia.',atlas:'Un reino por despertar.',relics:'Objetos que abren caminos.',classroom:'Del aula a la aventura.',settings:'Tu forma de explorar.'})[tab]}</h2><nav class="tab-bar" aria-label="Secciones del cuaderno">${tabs.map(([id,label])=>`<button data-tab="${id}" class="tab-button ${id===tab?'active':''}" ${id===tab?'aria-current="page"':''}>${label}</button>`).join('')}</nav>`;
  let content='';
  if(tab==='journal')content=`<p>Tu historia, ${escapeHTML(state.name)}. Los recuerdos y las reliquias permanecen contigo al volver a explorar.</p><ol class="journal-steps">${JOURNEY.map((s,i)=>`<li class="${state.flags[s.flag]?'done':currentQuest(state).index<i?'locked':''}"><span class="step-marker">${state.flags[s.flag]?'✓':String(i+1).padStart(2,'0')}</span><div><strong>${s.title}</strong><p>${s.text}</p></div></li>`).join('')}</ol>${state.flags.secretFound?'<p class="notice">✦ Secreto encontrado: la semilla de Valdeluz. Una carta conserva el recuerdo de Elia y Nara.</p>':''}`;
  if(tab==='atlas')content=atlasHTML();
  if(tab==='relics')content=`<div class="inventory-grid">${[
    ['bell','Campana Agrietada','Escucha ecos del pasado y descubre pistas en el mundo.',state.flags.metElia],
    ['hand','Guante de Raíces','Aparta raíces antiguas. Abre rutas nuevas también en lugares que ya visitaste.',state.flags.gauntlet],
    ['root','Eco del Bosque','Restaura los recuerdos de Valdeluz y devuelve la vida al primer territorio.',state.flags.restored]
  ].map(([id,name,text,has])=>`<article class="item-card ${has?'':'locked'}">${icon(id)}<h3>${name}</h3><p>${text}</p><span class="item-tag">${has?'EN TU AVENTURA':'POR DESCUBRIR'}</span></article>`).join('')}</div><h3>Tus sellos</h3>${ACTIVITY_SEALS.map(s=>`<p class="notice">${state.seals.includes(s.id)?'✓':'◇'} ${s.title} · ${state.seals.includes(s.id)?'Recibido':'Pendiente'}</p>`).join('')}<div class="modal-actions"><button id="journalRedeem" class="secondary-button">${icon('seal')} Canjear un sello</button></div>`;
  if(tab==='classroom')content=classroomHTML();
  if(tab==='settings')content=`<div class="settings-row"><label>Ambiente sonoro<small>Música original sintetizada y sonidos de acciones.</small></label><button id="settingSound" class="secondary-button">${audio.enabled?'Desactivar':'Activar'}</button></div><div class="settings-row"><label for="reducedMotion">Reducir movimiento<small>Reduce partículas y animaciones ambientales.</small></label><input type="checkbox" id="reducedMotion" ${state.settings.reducedMotion?'checked':''}></div><h3>Controles</h3><p><strong>Caminar:</strong> WASD, flechas, palanca táctil o clic/toque en el suelo.<br><strong>Interactuar:</strong> E o toca el objeto para acercarte.<br><strong>Eco:</strong> Q · <strong>Atacar:</strong> J · <strong>Esquivar:</strong> Espacio.<br><strong>Atlas:</strong> M · <strong>Pausa:</strong> Esc.</p><p class="notice">Guardado automático en este navegador. No hay cuentas ni sincronización entre dispositivos en este prototipo. Si borras los datos del navegador, se borra esta partida.</p><div class="modal-actions"><button id="resetGame" class="secondary-button danger-button">Comenzar otra historia</button><button id="returnTitle" class="secondary-button">Volver a la portada</button></div>`;
  setModal(header+content,{wide:tab==='classroom'||tab==='atlas',onMount:()=>{
    document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>showJournal(b.dataset.tab));
    $('journalRedeem')?.addEventListener('click',()=>showRedeem());
    if(tab==='classroom')bindClassroom();
    if(tab==='settings'){
      $('settingSound').onclick=async()=>{await toggleSound();showJournal('settings');};
      $('reducedMotion').onchange=e=>{state.settings.reducedMotion=e.target.checked;changed();};
      $('resetGame').onclick=showReset;
      $('returnTitle').onclick=()=>{if(started)save();closeModal();started=false;rt.title=true;$('titleScreen').classList.remove('hidden');$('gameUI').classList.add('hidden');saved=state;$('startLabel').textContent='Continuar mi aventura';};
    }
  }});
}
function atlasHTML(){return `<div class="atlas-map"><svg viewBox="0 0 680 260" role="img" aria-label="Mapa conceptual de los cinco territorios de Auralia. El bosque es el único territorio jugable en este prototipo."><defs><radialGradient id="mapGlow"><stop stop-color="#acc474" stop-opacity=".3"/><stop offset="1" stop-color="#acc474" stop-opacity="0"/></radialGradient></defs><path d="M130 236 78 187 113 146 92 105 170 74 200 24 273 41 329 22 385 64 458 25 506 76 598 103 572 157 605 201 521 226 465 214 385 241 306 222 229 245Z" fill="#4a6846" stroke="#b4bb7e66"/><path d="m122 181 65-58 100 44 74-56 93 23 72-10m-239 43 62 45m-162-89 46-59m128 47 66-46" fill="none" stroke="#c1bd7866" stroke-dasharray="4 5"/><circle cx="187" cy="123" r="85" fill="url(#mapGlow)"/><path d="m110 156 15-28 13 28m-2-10 17-33 17 33m-52 18 18-31 18 31" fill="#244c35" stroke="#92a26a"/><g fill="#dccb91" stroke="#c4bd82"><circle cx="187" cy="123" r="7"/><circle cx="287" cy="167" r="4"/><circle cx="361" cy="111" r="4"/><circle cx="454" cy="134" r="4"/><circle cx="526" cy="124" r="4"/></g><text x="187" y="105" text-anchor="middle">BOSQUE DE LOS SUSURROS</text><text x="187" y="146" text-anchor="middle">✦ Valdeluz</text><text x="280" y="194" text-anchor="middle">CIUDAD SUMERGIDA</text><text x="361" y="90" text-anchor="middle">CUMBRES</text><text x="452" y="158" text-anchor="middle">DESIERTO</text><text x="534" y="100" text-anchor="middle">ECLIPSE</text><text x="631" y="231" text-anchor="middle" style="font-size:17px">✧</text><text x="630" y="213" text-anchor="middle" style="font-size:8px">N</text></svg></div><div class="territory-grid">${TERRITORIES.map(t=>`<div class="territory ${t.active?'':'future'}">${icon(t.icon)}<div><strong>${t.name}</strong><small>${t.active&&state.flags.restored?'Primer eco restaurado · explorable':t.detail}</small></div></div>`).join('')}</div><p class="subtle">Este atlas presenta la propuesta del reino. En el prólogo se pueden recorrer Valdeluz, el bosque y las cuatro salas del santuario.</p>`;}
function classroomHTML(){return `<p>Una aventura individual que puede acompañar una unidad o un año escolar. El docente decide cuándo entregar los sellos según sus propias actividades; cada estudiante conserva su recorrido y sus descubrimientos.</p><div class="flow-grid"><div class="flow-card"><span>01 · EN CLASE</span><strong>Una actividad</strong><p>Investigar, argumentar, crear o resolver un desafío de cualquier asignatura.</p></div><div class="flow-card"><span>02 · EL PUENTE</span><strong>Un sello</strong><p>El docente entrega un código cuando se cumple el criterio acordado.</p></div><div class="flow-card"><span>03 · EN AURALIA</span><strong>Una expedición</strong><p>Se abre un acceso. El estudiante explora, interpreta pistas y resuelve acertijos.</p></div><div class="flow-card"><span>04 · LA HUELLA</span><strong>Un mundo distinto</strong><p>Una reliquia abre nuevos caminos y el territorio recupera su historia.</p></div></div><h3>Dos conexiones listas para probar</h3><table class="code-table"><thead><tr><th>ACTIVIDAD SUGERIDA</th><th>SELLO DE PRUEBA</th><th>QUÉ ABRE</th></tr></thead><tbody>${ACTIVITY_SEALS.map(s=>`<tr><td>${s.activity}</td><td><code>${s.code}</code></td><td>${s.unlock}</td></tr>`).join('')}</tbody></table><h3>Lo que podrás comprobar</h3><p>Caminar libremente, conversar con personajes, escuchar pistas del pasado, conseguir una habilidad permanente, volver a un lugar conocido, resolver dos salas, esquivar al guardián y ver cómo cambia el paisaje al recuperar el primer eco.</p><p class="notice"><strong>Alcance del prototipo:</strong> guardado local y códigos públicos de demostración. No hay verificación de entregas, registro docente, Google Sheets ni cuentas conectadas. Los otros cuatro territorios se presentan como expansión futura.</p><div class="demo-tools"><h3>Recorrido rápido de revisión</h3><p class="subtle">Estos accesos adelantan el progreso de esta partida para probar escenas concretas. Puedes jugar la historia completa desde la portada.</p><div class="modal-actions"><button id="demoForest" class="secondary-button">${icon('leaf')} Probar el bosque</button><button id="demoTemple" class="secondary-button">${icon('root')} Probar el santuario</button><button id="demoEnding" class="secondary-button">${icon('sun')} Revisar el desenlace</button><button id="demoStart" class="gold-button">${started?'Volver a mi aventura':'Jugar desde el inicio'} ${icon('arrow')}</button></div></div><h3>Una posible siguiente etapa</h3><p>Vincular la entrega de sellos a un registro docente, guardar la partida con una cuenta, personalizar los desafíos y añadir un encuentro especial mediante un QR en el colegio. Esta primera aventura permite decidir qué conexiones vale la pena desarrollar.</p>`;}
function bindClassroom(){
  const demo=stage=>{prepareDemo(state,stage);if(!started)startGame();else{closeModal();initializeScene();changed();showBanner();}toast('Recorrido de revisión preparado. Puedes explorar con normalidad.',4000);};
  $('demoForest').onclick=()=>demo('forest');$('demoTemple').onclick=()=>demo('sanctuary');$('demoEnding').onclick=()=>demo('ending');$('demoStart').onclick=()=>{closeModal();if(!started)$('startBtn').click();};
}
function showReset(){setModal(`<span class="eyebrow">✦ OTRA HISTORIA</span><h2 id="modalTitle">Volver al primer amanecer.</h2><p>Se reemplazará la partida guardada en este navegador. Las reliquias y los recuerdos actuales se perderán.</p><div class="modal-actions"><button id="confirmReset" class="gold-button">Empezar desde el inicio</button><button id="cancelReset" class="secondary-button">Conservar mi aventura</button></div>`,{onMount:()=>{$('confirmReset').onclick=()=>{saved=null;state=newGame();startGame(true);};$('cancelReset').onclick=()=>showJournal('settings');}});}

function updateHUD(force=false){
  const quest=currentQuest(state),signature=JSON.stringify([state.scene,state.hp,state.flags,rt.echo,quest.index]);
  if(!force&&signature===lastHUD)return;lastHUD=signature;
  $('sceneName').textContent=SCENES[state.scene].name;$('sceneSub').textContent=state.flags.restored?'EL PRIMER ECO HA DESPERTADO':'TIERRAS DEL PRIMER ECO';
  $('questTitle').textContent=quest.step.title;$('questText').textContent=quest.step.text;
  if(quest.index===1&&!state.seals.includes('exploration'))$('questText').textContent='Canjea AURALIA-INICIO en «Sellos». Después, busca el arco del este.';
  if(quest.index===4&&state.scene==='sanctuary'&&!state.seals.includes('sanctuary'))$('questText').textContent='Canjea AURALIA-RAICES y activa el pedestal del vestíbulo.';
  $('questStep').textContent=String(Math.min(8,quest.index+1)).padStart(2,'0')+' / 08';$('questProgress').style.width=(quest.index/JOURNEY.length*100)+'%';
  $('hearts').innerHTML=[0,1,2].map(i=>icon('heart',state.hp>=i*2+2?'':state.hp===i*2+1?'half':'empty')).join('');$('hearts').setAttribute('aria-label',`${state.hp} de 6 puntos de salud`);
  $('echoBtn').classList.toggle('active',rt.echo);$('echoIndicator').classList.toggle('hidden',!rt.echo);
}
function updateSoundButton(){$('soundBtn').innerHTML=icon(audio.enabled?'volume':'volumeOff');$('soundBtn').setAttribute('aria-label',audio.enabled?'Desactivar sonido':'Activar sonido');}
async function toggleSound(){const on=await audio.setEnabled(!audio.enabled);state.settings.sound=on;updateSoundButton();if(started)changed();if(on)audio.chime('echo');else if(!window.AudioContext&&!window.webkitAudioContext)toast('Este navegador no admite el ambiente sonoro.');}
$('soundBtn').onclick=toggleSound;
$('fullscreenBtn').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('Puedes ampliar la vista usando el menú de tu navegador.');}catch{toast('Puedes ampliar la vista usando el menú de tu navegador.');}};
for(const id of ['menuBtn','brandBtn','journalBtn'])$(id).onclick=()=>showJournal();
$('atlasBtn').onclick=()=>showJournal('atlas');$('redeemBtn').onclick=()=>showRedeem();
$('echoBtn').onclick=echo;$('attackBtn').onclick=attack;$('dashBtn').onclick=dash;$('interactBtn').onclick=interact;
$('questToggle').onclick=()=>{const hidden=$('questBody').classList.toggle('hidden');$('questToggle').textContent=hidden?'+':'−';};

window.addEventListener('keydown',e=>{
  if(modalOpen){
    if(e.key==='Escape'){e.preventDefault();closeModal();return;}
    if(e.key==='Tab'){const focusable=[...$('modal').querySelectorAll('button:not(:disabled),input:not(:disabled),[tabindex="0"]')],first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
    return;
  }
  if(!started)return;
  const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();keys.add(k);
  if(e.repeat)return;
  if(k==='e')interact();if(k==='q')echo();if(k==='j')attack();if(k===' ')dash();if(k==='m')showJournal('atlas');if(k==='escape')showJournal('settings');
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();stick={x:0,y:0};});
document.addEventListener('visibilitychange',()=>{screenHidden=document.hidden;keys.clear();stick={x:0,y:0};if(started)save();});
window.addEventListener('pagehide',()=>{if(started)save();});
$('world').addEventListener('pointerdown',e=>{
  if(!started||modalOpen||e.button!==0)return;
  const rect=$('world').getBoundingClientRect(),camera=renderer.getCamera(),target={x:(e.clientX-rect.left)/camera.scale+camera.x,y:(e.clientY-rect.top)/camera.scale+camera.y};
  const entity=SCENES[state.scene].entities.filter(v=>!(v.type==='roots'&&state.flags[v.flag])&&!(v.id==='secretChest'&&!state.flags.secretOpen)&&!(v.id==='forestMedallion'&&(!state.flags.bossDefeated||state.flags.restored))).map(v=>({v,d:Math.hypot(target.x-v.x,target.y-(v.y-25))})).filter(v=>v.d<65).sort((a,b)=>a.d-b.d)[0]?.v;
  if(entity&&Math.hypot(state.x-entity.x,state.y-entity.y)<110){interact(entity.id);return;}
  walkingPath=findWalkingPath(state,entity||target,renderer.getTrees());walkToEntity=entity?.id||null;
  if(!walkingPath.length){toast('Busca un paso libre para llegar hasta allí.',2000);return;}
  rt.destination=walkingPath.at(-1);$('world').focus({preventScroll:true});
});
let stickPointer=null;
$('joystick').addEventListener('pointerdown',e=>{if(modalOpen)return;stickPointer=e.pointerId;$('joystick').setPointerCapture(e.pointerId);updateStick(e);e.preventDefault();});
$('joystick').addEventListener('pointermove',e=>{if(e.pointerId===stickPointer){updateStick(e);e.preventDefault();}});
function updateStick(e){const rect=$('joystick').getBoundingClientRect(),max=rect.width*.33,dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2,len=Math.hypot(dx,dy),ratio=Math.min(1,max/Math.max(1,len));stick={x:dx*ratio/max,y:dy*ratio/max};$('joystickKnob').style.transform=`translate(${dx*ratio}px,${dy*ratio}px)`;}
function releaseStick(){stickPointer=null;stick={x:0,y:0};$('joystickKnob').style.transform='';}
for(const type of ['pointerup','pointercancel','lostpointercapture'])$('joystick').addEventListener(type,releaseStick);

function updateEnemies(dt){
  for(const e of rt.enemies){
    if(e.hp<=0)continue;e.hurt=Math.max(0,e.hurt-dt);const dx=state.x-e.x,dy=state.y-e.y,d=Math.hypot(dx,dy);
    if(d<220&&d>25){const nx=e.x+dx/d*62*dt,ny=e.y+dy/d*62*dt;if(walkable(state,nx,ny,16,renderer.getTrees())){e.x=nx;e.y=ny;}}
    if(d<35)hurt();
  }
  const b=rt.boss;if(state.scene!=='sanctuary'||state.flags.bossDefeated)return;
  if(state.x>660&&state.y<440){if(!b.active){b.active=true;toast('Esquiva su embestida. Ataca cuando su núcleo brille.',4500);}}
  if(!b.active)return;
  if(state.x<625||state.y>480){b.active=false;b.phase='idle';b.timer=1.2;b.x=880;b.y=275;return;}
  b.hurt=Math.max(0,b.hurt-dt);b.timer-=dt;
  if(b.phase==='idle'&&b.timer<=0){const d=Math.hypot(state.x-b.x,state.y-b.y)||1;b.dx=(state.x-b.x)/d;b.dy=(state.y-b.y)/d;b.phase='windup';b.timer=1.1;}
  else if(b.phase==='windup'&&b.timer<=0){b.phase='charge';b.timer=.62;audio.tone(80,.4,.16);}
  else if(b.phase==='charge'){
    b.x=Math.max(695,Math.min(1065,b.x+b.dx*365*dt));b.y=Math.max(150,Math.min(397,b.y+b.dy*365*dt));if(Math.hypot(state.x-b.x,state.y-b.y)<54)hurt(1);
    if(b.timer<=0){b.phase='recover';b.timer=2.6;burst(b.x,b.y-25,'#ddec9e',10);}
  }else if(b.phase==='recover'&&b.timer<=0){b.phase='idle';b.timer=.55;}
}
function update(dt){
  rt.time+=dt;
  if(started&&!modalOpen&&!screenHidden){
    state.played+=dt;rt.attack=Math.max(0,rt.attack-dt);rt.dash=Math.max(0,rt.dash-dt);rt.hurt=Math.max(0,rt.hurt-dt);attackCooldown=Math.max(0,attackCooldown-dt);dashCooldown=Math.max(0,dashCooldown-dt);
    let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+stick.x,dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+stick.y;
    if(Math.hypot(dx,dy)>.15){walkingPath=[];walkToEntity=null;rt.destination=null;}else{
      dx=dy=0;
      while(walkingPath.length&&Math.hypot(walkingPath[0].x-state.x,walkingPath[0].y-state.y)<9)walkingPath.shift();
      if(walkToEntity){const target=SCENES[state.scene].entities.find(e=>e.id===walkToEntity);if(target&&Math.hypot(target.x-state.x,target.y-state.y)<88){const id=walkToEntity;walkingPath=[];walkToEntity=null;rt.destination=null;interact(id);}}
      if(walkingPath.length&&!modalOpen){dx=walkingPath[0].x-state.x;dy=walkingPath[0].y-state.y;const len=Math.hypot(dx,dy);dx/=len;dy/=len;}else rt.destination=null;
    }
    if(Math.hypot(dx,dy)>.15){const len=Math.hypot(dx,dy);rt.facing={x:dx/len,y:dy/len};}else dx=dy=0;
    if(rt.dash>0){dx=rt.facing.x;dy=rt.facing.y;}
    rt.moving=movePlayer(state,dx,dy,dt,renderer.getTrees(),rt.dash>0?620:205);
    if(rt.moving)autoSaveDirty=true;
    if(rt.echo){rt.echoLeft-=dt;if(rt.echoLeft<=0){rt.echo=false;updateHUD(true);}}
    updateEnemies(dt);nearest=nearestEntity(state,115);
    $('interactPrompt').classList.toggle('hidden',!nearest);
    if(nearest){$('interactText').textContent=nearest.action;const p=renderer.toScreen(state.x,state.y+36);$('interactPrompt').style.left=p.x+'px';$('interactPrompt').style.top=p.y+'px';}
    const inBoss=state.scene==='sanctuary'&&rt.boss.active&&!state.flags.bossDefeated;$('bossHUD').classList.toggle('hidden',!inBoss);
    if(inBoss){$('bossBar').style.width=(rt.boss.hp/rt.boss.maxHp*100)+'%';$('bossHint').textContent=rt.boss.phase==='recover'?'¡Su núcleo está expuesto! Acércate y ataca.':'Esquiva su embestida. Espera a que el núcleo brille.';}
    if(autoSaveDirty&&rt.time-lastSave>3)save();
    updateHUD();
  }else{rt.moving=false;$('interactPrompt').classList.add('hidden');}
  for(const f of rt.effects){f.life-=dt;f.x+=f.vx*dt;f.y+=f.vy*dt;}rt.effects=rt.effects.filter(f=>f.life>0);
  audio.update(started?state.scene:'village',rt.time,screenHidden);
}
function frame(now){
  let remaining=Math.min(.25,(now-lastFrame)/1000||.016);lastFrame=now;
  // Preserve walking/combat speed on slower tablets. Small simulation steps
  // keep collisions stable without tying the game speed to the frame rate.
  while(remaining>0){const dt=Math.min(.033,remaining);update(dt);remaining-=dt;}
  renderer.draw(started?state:titleState,rt);requestAnimationFrame(frame);
}
initializeScene();requestAnimationFrame(frame);
