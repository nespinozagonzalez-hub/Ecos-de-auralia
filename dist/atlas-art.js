import {REGIONS} from './atlas-data.js';
import {regionState} from './atlas-core.js';
import {assetSlot} from './asset-slots.js';

const symbols={
 compass:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-16-2 8-8 4 4-8 6-4Z',
 book:'M12 5C7 2 3 3 2 4v16c3-2 7-2 10 0 3-2 7-2 10 0V4c-3-2-7-2-10 1Zm0 0v15',
 leaf:'M20 3C10 2 3 6 4 13c1 9 14 9 16-10ZM5 19 16 8M9 14l-1-5m4 2 5 1',
 seal:'m12 2 3 3 4 1 1 4 2 3-3 3-1 4-4 1-3 2-3-3-4-1-1-4-2-3 3-3 1-4 4-1 3-2Zm-4 10 3 3 5-6',
 spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z',
 grid:'M3 3h7v8H3V3Zm11 0h7v8h-7V3ZM3 15h7v6H3v-6Zm11 0h7v6h-7v-6Z',
 person:'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 22c0-10 18-10 18 0Z',
 sword:'m15 3 6 0 0 6-11 10-5-5L15 3ZM3 21l5-5m-4-4 8 8',
 arrow:'M4 12h16m-6-6 6 6-6 6',
 back:'M20 12H4m6-6-6 6 6 6',
 light:'M12 2v4m0 12v4M2 12h4m12 0h4M5 5l3 3m8 8 3 3M5 19l3-3m8-8 3-3M12 8l4 4-4 4-4-4 4-4Z',
 water:'M12 2C8 8 4 12 4 16a8 8 0 0 0 16 0c0-4-4-8-8-14ZM8 16a4 4 0 0 0 4 4',
 wind:'M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h5a3 3 0 1 1-3 3',
 crystal:'m12 2 8 9-8 11-8-11 8-9Zm0 0v20M4 11h16',
 moon:'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
 home:'m2 11 10-8 10 8M5 9v12h14V9M9 21v-8h6v8',
 bridge:'M2 20h20M4 20V4m16 16V4M4 8c4 7 12 7 16 0M8 13v7m8-7v7m-4-5v5',
 echo:'M12 6v12M8 9v6m8-6v6M4 7a9 9 0 0 0 0 10m16-10a9 9 0 0 1 0 10',
 lock:'M5 10h14v11H5V10Zm3 0V6a4 4 0 0 1 8 0v4m-4 4v3',
 check:'m5 12 4 4L19 6',
 close:'m6 6 12 12M6 18 18 6',
 help:'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM9 9c0-4 7-4 6 0-1 3-3 2-3 5m0 3v1',
 feather:'M4 20 17 7M6 17C0 6 10 0 21 3c0 9-3 16-12 14m3-6 1-7m-1 7 6-1',
 download:'M12 2v13m-5-5 5 5 5-5M3 16v5h18v-5',
 upload:'M12 16V3m-5 5 5-5 5 5M3 16v5h18v-5',
 settings:'M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-7 0v6',
 bell:'M6 16h12l-2-3V9a4 4 0 0 0-8 0v4l-2 3Zm4 4h4M12 2v3',
 root:'M12 2v16M4 7c2 6 12 6 16 0M5 22l7-7 7 7m-7-7v7'
};
export const icon=(name,cls='')=>assetSlot('icon-'+name,`<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${symbols[name]||symbols.spark}"/></svg>`,'icon-slot');
export function atlasEmblem(){return `<svg viewBox="0 0 70 76" fill="none" aria-hidden="true"><path d="M35 3 64 20v35L35 72 6 55V20Z"/><path d="m35 13 20 12v25L35 62 15 50V25Z"/><path d="M35 24v29m-10-24 10 8 10-8m-20 18 10-8 10 8"/><circle cx="35" cy="38" r="5"/></svg>`;}
let serial=0;
const ellipse=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
function littleTree(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0v-19" stroke="#45583d" stroke-width="4"/>${ellipse(1,1,15,5,'#253e3625')}${ellipse(-7,-16,13,10,'#486b4b')}${ellipse(8,-20,13,11,'#5a8052')}${ellipse(0,-29,14,12,'#79935c')}${ellipse(-3,-32,8,5,'#abc17a44')}</g>`;}
function mountain(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><path d="m-28 0 27-58 32 58Z" fill="#8caaa0"/><path d="m-1-58 32 58H5Z" fill="#617f7a"/><path d="m-1-58-12 25 11-4 10 6 3-10Z" fill="#dae5ce"/><path d="m-25 3 22-37 20 37Z" fill="#76958a"/></g>`;}
function tinyBuilding(x,y,kind='home',s=1){const library=kind==='archivo'||kind==='observatorio';return `<g transform="translate(${x} ${y}) scale(${s})">${ellipse(3,8,35,11,'#233f342f')}<rect x="-26" y="-24" width="52" height="34" rx="3" fill="#b5b28a"/><path d="m-34-23 34-27 34 27Z" fill="${library?'#6f9290':'#9f7956'}"/><path d="m-34-25 34-27 34 27" stroke="#d7c596" fill="none" stroke-width="2"/><path d="M-6 10V-9q6-8 12 0v19" fill="#3e5c49"/><path d="M-20-14h8v12h-8Zm33 0h8v12h-8Z" fill="#ead294"/>${library?'<path d="M-21 3h10m1-8h-11m32 8h10" stroke="#63785b"/>':''}</g>`;}
function landmark(x,y,kind,s=1){
  let shape='';
  if(kind==='puentes')shape='<path d="M-43 10h86M-39 8q39-50 78 0m-59-15v18m40-18v18" stroke="#d4cfaa" stroke-width="7" fill="none"/><path d="M-38 18q38 14 76 0" stroke="#99cfbd" stroke-width="3" fill="none"/>';
  else if(kind==='jardines')shape='<ellipse cy="8" rx="43" ry="14" fill="#acd4b7"/><ellipse cy="6" rx="33" ry="10" fill="#71935c"/>'+littleTree(-15,3,.8)+littleTree(16,5,.62);
  else if(kind==='faro')shape='<path d="m-15 12 6-66H9l8 66Z" fill="#c6c4a0"/><path d="M-19-54 0-67l19 13Z" fill="#669786"/><path d="M-7-49H7v12H-7Z" fill="#f6e9b0"/><path d="m0-44 65-24v48Z" fill="#f4e6a1" opacity=".26"/>';
  else if(kind==='voces')shape='<ellipse cy="6" rx="41" ry="19" fill="#a69ab4"/><ellipse cy="2" rx="31" ry="12" fill="#766e91"/>'+Array.from({length:7},(_,i)=>`<circle cx="${Math.cos(i*6.28/7)*30}" cy="${Math.sin(i*6.28/7)*12-6}" r="4" fill="#eee0ad"/>`).join('');
  else if(kind==='caminos')shape='<path d="M0 9v-53M0 9l-43 14M0 9l43 14M0 9l-34-28M0 9l34-28" fill="none" stroke="#eddba3" stroke-width="4"/><path d="M-12 9v-30q12-17 24 0V9" stroke="#bfaccb" stroke-width="8" fill="none"/>';
  else if(kind==='observatorio')shape='<rect x="-29" y="-20" width="58" height="31" fill="#b5b28a"/><path d="M-33-20a33 33 0 0 1 66 0Z" fill="#7aa79c"/><path d="m0-47 21-17" stroke="#dfd7ac" stroke-width="5"/><path d="M-8 11v-20H8v20" fill="#456d60"/>';
  else shape=tinyBuilding(0,0,kind,1)+(kind==='taller'?'<path d="m-35 6 5-20 7 20-7 4Zm67 2 6-24 6 24-6 4Z" fill="#dfd6a3"/>':'');
  return `<g data-landmark="${kind}" transform="translate(${x} ${y}) scale(${s})">${shape}</g>`;
}

export function worldMap(state,selected){
  const uid='world-'+serial++;
  const detail={
    bosque:Array.from({length:20},(_,i)=>littleTree(112+(i*61)%285,387+(i*37)%170,.58+(i%3)*.15)).join('')+`<path d="M88 497q90-30 137-13t160-10" fill="none" stroke="#bad4ae" stroke-width="7" opacity=".6"/>`,
    marea:`<path d="M451 462q58-41 111 9t124-4m-214 51q55-29 109 4t114-15" fill="none" stroke="#c5e1ca" stroke-width="3" opacity=".5"/>`+Array.from({length:7},(_,i)=>tinyBuilding(490+(i%4)*53,439+Math.floor(i/4)*72,'home',.6)).join('')+`<path d="M532 485h100m-95-8v21m90-21v21" stroke="#a6b791" stroke-width="7"/>`,
    cumbres:Array.from({length:9},(_,i)=>mountain(394+(i*53)%253,173+(i*43)%120,.65+(i%3)*.25)).join('')+`<path d="M410 256q94-30 213-19m-195-13q70-24 140-18" fill="none" stroke="#e1ead0" stroke-width="2" opacity=".4"/>`,
    cristal:Array.from({length:16},(_,i)=>{const x=711+(i*37)%182,y=226+(i*47)%156;return `<path d="m${x} ${y} 8-25 8 25-8 8Z" fill="${i%2?'#e0c291':'#b8bc9c'}" stroke="#f2deb3" stroke-width=".8"/>`;}).join('')+`<path d="M735 353q60-25 130 5m-158-40q48-19 91-8" fill="none" stroke="#e5c496" stroke-width="2"/>`,
    eclipse:`<circle cx="226" cy="159" r="46" fill="#bfb5c8" opacity=".45"/><circle cx="241" cy="147" r="40" fill="#6c7080"/>`+Array.from({length:7},(_,i)=>tinyBuilding(141+(i*43)%180,223+(i%3)*27,'archivo',.55)).join('')
  };
  const regions=REGIONS.map(r=>{
    const status=regionState(state,r.id),active=r.id===selected,lit=status.unlocked,progress=status.progress/100,choice=status.choice;
    return `<g class="map-territory ${lit?'available':'sleeping'} ${status.restored?'restored':''} ${active?'selected':''}" data-region="${r.id}" role="button" tabindex="0" aria-label="${r.name}, ${lit?`${status.progress}% recuperado`:'por despertar'}" aria-pressed="${active}"><title>${r.name}</title><path d="${r.path}" fill="${r.color}" fill-opacity="${lit?.38+progress*.52:.2}" stroke="${active?'#ebd8a0':lit?'#bec59177':'#a1bca344'}" stroke-width="${active?2.5:1}" filter="url(#${uid}-shadow)"/><g clip-path="url(#${uid}-${r.id})" opacity="${lit?.55+progress*.45:.18}" class="region-details">${detail[r.id]}</g>${lit?`<g class="map-landmark">${landmark(r.position[0],r.position[1]+28,choice?.id||'home',status.restored?1.1:.8)}${status.restored?`<circle cx="${r.position[0]}" cy="${r.position[1]+20}" r="51" fill="url(#${uid}-glow)"/>`:''}</g>`:`<path d="M${r.position[0]-13} ${r.position[1]-3}q13-18 26 0v23h-26Zm6-2v-8a7 7 0 0 1 14 0v8" fill="#132f2d88" stroke="#c2c6ac66" stroke-width="1.5"/>`}<text class="map-label" x="${r.label[0]}" y="${r.label[1]}" text-anchor="middle">${r.name.toUpperCase()}</text>${lit?`<g class="map-marker" transform="translate(${r.position[0]+34} ${r.position[1]-47})"><circle r="14" fill="${status.restored?'#d6d29a':'#193f34'}" stroke="#d4c994"/>${status.restored?'<path d="m-5 0 3 3 7-7" stroke="#345d42" stroke-width="2" fill="none"/>':`<text y="4" text-anchor="middle" fill="#e1d7af" font-size="10">${status.count}/4</text>`}</g>`:''}${!lit?`<g class="map-fog" opacity=".36"><ellipse cx="${r.position[0]-55}" cy="${r.position[1]+15}" rx="84" ry="35"/><ellipse cx="${r.position[0]+35}" cy="${r.position[1]-24}" rx="78" ry="30"/></g>`:''}</g>`;
  }).join('');
  const routes=REGIONS.slice(1).map((r,i)=>{const prev=REGIONS[i],on=regionState(state,r.id).unlocked;return `<path d="M${prev.position[0]} ${prev.position[1]+20}Q500 370 ${r.position[0]} ${r.position[1]+20}" class="map-route ${on?'lit':''}"/>`;}).join('');
  return `<svg class="world-map" viewBox="0 0 1000 700" role="group" aria-label="Atlas de Auralia. Selecciona un territorio para consultar su historia."><defs><filter id="${uid}-shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="1" dy="8" stdDeviation="9" flood-color="#041e19" flood-opacity=".25"/></filter><radialGradient id="${uid}-glow"><stop stop-color="#f1df9d" stop-opacity=".28"/><stop offset="1" stop-color="#f1df9d" stop-opacity="0"/></radialGradient><pattern id="${uid}-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M50 0H0v50" stroke="#d3dec2" opacity=".035" fill="none"/></pattern>${REGIONS.map(r=>`<clipPath id="${uid}-${r.id}"><path d="${r.path}"/></clipPath>`).join('')}</defs><rect width="1000" height="700" fill="url(#${uid}-grid)"/><g class="ocean-lines" fill="none" stroke="#a6c6b3" opacity=".1">${Array.from({length:19},(_,i)=>`<path d="M${28+(i*149)%930} ${65+(i*73)%590}q20-7 40 0t40 0"/>`).join('')}<ellipse cx="500" cy="350" rx="456" ry="288" stroke-dasharray="3 11"/></g>${routes}${regions}<path d="M304 531q20-22 42 0m-42-3q20-22 42 0" fill="none" stroke="#dde0b255"/><g class="map-compass" transform="translate(875 574)"><circle r="38"/><circle r="31" stroke-dasharray="1 5"/><path d="m0-29 8 21 21 8-21 8-8 21-8-21-21-8 21-8Z"/><path d="M0-29V29M-29 0h58"/><text y="-48" text-anchor="middle">N</text></g><text class="map-small" x="71" y="645">AURALIA · CARTOGRAFÍA DE LOS RECUERDOS</text><path d="M71 659h75m-75-3v6m25-6v6m25-6v6m25-6v6" stroke="#bac9ac55"/><g transform="translate(494 350)" opacity=".8"><path d="m0-13 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z" fill="#d3cda0"/><circle r="22" fill="none" stroke="#d3cda044"/></g></svg>`;
}

export function sceneArt(regionId,page=0,choice=null){
  const r=REGIONS.find(r=>r.id===regionId)||REGIONS[0],uid='scene-'+serial++,late=page===2,scene=regionId;
  const colors={bosque:['#102f31','#63866a','#c3c591'],marea:['#183e4a','#6baba7','#d4dab3'],cumbres:['#334e5d','#b6c6b3','#e2d9b7'],cristal:['#5e5858','#c2a278','#f5dbad'],eclipse:['#292f49','#8e8da3','#d5c4a3']}[scene];
  let shapes='';
  if(scene==='bosque'){
    shapes=`<path d="M0 250Q220 195 380 244T800 220V380H0Z" fill="#466d53"/><path d="M270 360Q350 260 440 220L490 222Q401 290 399 360" fill="#acaa7a" opacity=".75"/>`;
    for(let i=0;i<16;i++){const x=(i*117)%850-30,y=250+(i*31)%100,s=1.4+(i%4)*.4;shapes+=littleTree(x,y,s);}
    shapes+=`<g transform="translate(473 188)"><path d="M-38 75V-3Q0-68 38-3v78" fill="#8b9c7b"/><path d="M-22 75V1q22-37 44 0v74" fill="#183d32"/><path d="M-43 74h86M-40-4Q0-66 40-4" stroke="#c6c39b" stroke-width="6" fill="none"/><path d="m0-29 7 14-7 14-7-14Z" fill="#e1d69d"/></g>`;
    if(choice)shapes+=tinyBuilding(600,290,choice,1.6);
    shapes+=`<path d="M47 360 70 34Q83 5 102 8l-3 352m585 0 5-291q15-49 38-38l29 329" fill="#123c32" opacity=".65"/><path d="M82 68Q240 12 337 48M712 77Q614 21 551 43" fill="none" stroke="#163d31" stroke-width="28"/>`;
  }else if(scene==='marea'){
    shapes=`<path d="M0 205Q210 174 420 210T800 198V360H0Z" fill="#3a7a7a"/>`;
    for(let i=0;i<9;i++)shapes+=tinyBuilding(45+i*90,210+(i%3)*16,'archivo',1.6+(i%2)*.3);
    shapes+=`<path d="M190 360 340 230h74l166 130" fill="#91a387"/><path d="M212 360 345 239m52 0 158 121" fill="none" stroke="#d7d7af" stroke-width="4"/><path d="M310 235q75-107 150 0" fill="none" stroke="#a9ba9e" stroke-width="18"/>`;
    for(let i=0;i<8;i++)shapes+=`<path d="M${i*117-70} ${260+(i%4)*26}q40-9 95 0" fill="none" stroke="#d7e3b2" opacity=".2"/>`;
    if(choice==='jardines')for(let i=0;i<7;i++)shapes+=`<g transform="translate(${70+i*105} ${280+(i%2)*42})"><ellipse rx="37" ry="8" fill="#bfcf9d"/>${littleTree(0,-2,.75)}</g>`;
  }else if(scene==='cumbres'){
    shapes=`<path d="M0 300 120 70 222 200 359 40 480 170 610 47 800 295V360H0Z" fill="#6d8e8a"/><path d="m120 70-36 68 35-11 29 13Zm239-30-52 89 53-24 29 14Zm251 7-39 88 42-24 35 20Z" fill="#dae1cb"/><path d="M0 360 170 226 321 320 493 216 800 338V360" fill="#406a68"/><path d="M258 360q52-67 148-76" fill="none" stroke="#d3d9b4" stroke-width="17"/>`;
    shapes+=`<g transform="translate(495 190)"><path d="m-25 90 9-133h36l10 133Z" fill="#9cac91"/><path d="m-30-43 31-23 30 23Z" fill="#3b6762"/><path d="M-11-36h25v27h-25Z" fill="#f3dfa4"/><path d="m1-30-190-45v84Z" fill="#ebdf9e" opacity="${choice==='faro'?.18:.06}"/></g>`;
    if(choice==='abrigo')shapes+=tinyBuilding(390,310,'home',1.7);
    shapes+=`<path d="M0 253q160-40 300 0t500 0M-50 295q150-33 350 0t550-9" fill="none" stroke="#dde4cf" stroke-width="21" opacity=".17"/>`;
  }else if(scene==='cristal'){
    shapes=`<path d="M0 260Q140 156 340 250T800 227V360H0Z" fill="#b99b73"/><path d="M0 328Q240 211 430 300T800 289V360H0Z" fill="#9d8566"/><path d="M264 360q102-108 282-98" fill="none" stroke="#e5c99a" stroke-width="24" opacity=".65"/>`;
    for(let i=0;i<14;i++){const x=(i*127)%840-20,y=280+(i*43)%80,s=30+(i%4)*15;shapes+=`<path d="m${x} ${y} ${s*.4}-${s*1.5} ${s*.5} ${s*1.5}-${s*.5} ${s*.35}Z" fill="${i%2?'#b8c4b0':'#d6c49b'}" stroke="#ebdfb3" stroke-width="1"/>`;}
    shapes+=`<g transform="translate(545 193)"><rect x="-51" y="12" width="102" height="75" fill="#c2b18a"/><path d="M-57 13a57 57 0 0 1 114 0Z" fill="#789b91"/><path d="m-9-43 23 24M0-32l47-39" stroke="#d6d5ae" stroke-width="7"/><path d="M-22 87V41q22-27 44 0v46" fill="#6c7769"/></g>`;
    if(choice==='taller')shapes+=tinyBuilding(404,300,'home',1.3);
  }else{
    shapes=`<circle cx="435" cy="100" r="66" fill="#d2c8ad" opacity=".9"/><circle cx="455" cy="84" r="59" fill="#3d435b"/><path d="M0 270 90 216l98 35 121-40 131 47 138-40 222 55v87H0Z" fill="#6d7480"/>`;
    for(let i=0;i<11;i++)shapes+=tinyBuilding(12+i*80,290-(i%3)*24,'archivo',1.1+(i%2)*.35);
    shapes+=`<g transform="translate(424 205)"><path d="M-52 137V8q52-90 104 0v129" fill="#b8b39d"/><path d="M-31 137V11q31-50 62 0v126" fill="#434c59"/><path d="m-62 13 62-84 62 84" fill="none" stroke="#d3c5a2" stroke-width="7"/><path d="m0-28 9 20-9 20-9-20Z" fill="#ead6a2"/></g>`;
    if(late&&choice==='caminos')shapes+=`<path d="M424 360V232m0 45L91 360m333-83 342 83m-342-83-98 83m98-83 100 83" stroke="#efdaa5" stroke-width="2" opacity=".65"/>`;
  }
  if(scene==='eclipse'&&late&&choice==='voces')shapes+=`<ellipse cx="425" cy="322" rx="150" ry="32" fill="#b9a8c4" opacity=".35"/>`+Array.from({length:13},(_,i)=>`<circle cx="${425+Math.cos(i*6.28/13)*130}" cy="${310+Math.sin(i*6.28/13)*25}" r="5" fill="#f2dfa5"/>`).join('');
  const stars=Array.from({length:24},(_,i)=>`<circle cx="${(i*137+71)%800}" cy="${(i*53+19)%230}" r="${i%3?1:2}" fill="#f1e4b4" opacity="${.15+(i%4)*.13}"/>`).join('');
  return `<svg class="scene-art" viewBox="0 0 800 360" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Ilustración de ${r.name}"><defs><linearGradient id="${uid}-sky" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient><radialGradient id="${uid}-sun"><stop stop-color="${colors[2]}" stop-opacity=".5"/><stop offset="1" stop-color="${colors[2]}" stop-opacity="0"/></radialGradient><linearGradient id="${uid}-shade" x2="0" y2="1"><stop offset=".5" stop-color="#071d22" stop-opacity="0"/><stop offset="1" stop-color="#071d22" stop-opacity=".5"/></linearGradient></defs><rect width="800" height="360" fill="url(#${uid}-sky)"/><circle cx="${scene==='eclipse'?430:550}" cy="100" r="220" fill="url(#${uid}-sun)"/>${stars}${shapes}<g opacity=".6">${Array.from({length:16},(_,i)=>`<circle cx="${(i*147+32)%800}" cy="${190+(i*37)%150}" r="${i%3?1:2}" fill="#f1e7b0"/>`).join('')}</g><rect width="800" height="360" fill="url(#${uid}-shade)"/></svg>`;
}

export function guardianArt(look='bosque',companion='Chispa'){
  const coat={bosque:'#547866',marea:'#587d8b',sol:'#a47e56'}[look]||'#547866';
  return `<svg class="guardian-art" viewBox="0 0 260 300" aria-label="Tu guardián y su compañero de luz" role="img"><ellipse cx="128" cy="274" rx="64" ry="14" fill="#051f2355"/><circle cx="130" cy="132" r="93" fill="none" stroke="#ddce9c22"/><circle cx="130" cy="132" r="110" fill="none" stroke="#ddce9c11" stroke-dasharray="2 9"/><path d="m97 213 1 53h22l9-47 8 47h22l-1-53" fill="#344a46"/><path d="M79 209q4-80 21-95h57q20 18 29 95l-31 22-29-12-26 12Z" fill="${coat}"/><path d="M104 121 79 205l-15-5 20-80m71 2 22 76 16-6-20-79" fill="${coat}"/><path d="m66 198-1 17q5 10 15 0l-1-15m100-3 1 16q-6 9-13 1l-2-14" fill="#ceb69a"/><ellipse cx="130" cy="94" rx="28" ry="34" fill="#d3bfa0"/><path d="M97 103q-9-57 31-72l36 35 2 38q-20-50-69-1Z" fill="${coat}"/><path d="m100 116 56-4 6 13-30 15-36-10Z" fill="#d2b274"/><path d="m104 126-14 50 21-10 14-30" fill="#b99862"/><path d="M101 184h57" stroke="#c8b38b" stroke-width="7"/><circle cx="132" cy="184" r="7" fill="#e4d29d"/><path d="m121 93 3 1m16-1 3-1" stroke="#535b4a" stroke-width="2" stroke-linecap="round"/><g class="companion" transform="translate(208 91)"><circle r="30" fill="#d7df9c" opacity=".08"/><circle r="18" fill="#d7df9c" opacity=".12"/>${companion==='Chispa'?'<path d="m0-10 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z" fill="#e5dfa5"/>':`<ellipse cx="-11" cy="-5" rx="11" ry="5" transform="rotate(25)" fill="#dae5ac" opacity=".8"/><ellipse cx="11" cy="-5" rx="11" ry="5" transform="rotate(-25)" fill="#dae5ac" opacity=".8"/><ellipse rx="6" ry="10" fill="#ece4a5"/>${companion==='Astral'?'<path d="m-17 1-12 13 23-7M17 1l12 13-23-7" fill="#bddec3"/>':''}`}</g></svg>`;
}
