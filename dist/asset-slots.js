import {VISUAL_ASSETS} from './visual-assets.js';
export {VISUAL_ASSETS};
export const assetById=id=>VISUAL_ASSETS.assets.find(a=>a.id===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function assetSlot(id,fallback='',className='',alt=''){
 const a=assetById(id),ready=a?.status==='ready';
 return '<span class="asset-slot '+esc(className)+'" data-asset-id="'+esc(id)+'">'+(ready?'<img class="pixel-art asset-image" src="'+esc(a.path)+'" alt="'+esc(alt||a.title)+'" data-ready-asset="'+esc(id)+'">':'')+'<span class="asset-fallback" '+(ready?'hidden':'')+'>'+fallback+'</span></span>';
}
export function assetFrame(id,fallback='',className=''){
 const a=assetById(id);
 return '<div class="'+className+' asset-frame" data-asset-id="'+esc(id)+'"'+(a?.status==='ready'?' style="border-image-source:url('+esc(a.path)+')"':'')+'>'+fallback+'</div>';
}
export function mapLayers(s,svg){
 const regions=['bosque','marea','cumbres','cristal','eclipse'],ns=s.narrative;
 let ids=['map-base'];
 for(let i=0;i<regions.length;i++){
  const r=regions[i],prefix='C'+(i+1),count=[1,2,3,4].filter(j=>ns.decisions[prefix+'.'+j]).length;
  ids.push('map-'+r+'-'+(count===4?'restaurado':count>=2?'intervenido':count?'trazas':'dormido'));
  for(const [n,kind] of [[2,'intervencion'],[4,'institucion']]){const d=ns.decisions[prefix+'.'+n];if(d)ids.push('map-'+r+'-'+kind+'-'+d.optionId);}
  const d=ns.decisions[prefix+'.2'];if(d)ids.push('map-'+r+'-huella-'+d.optionId);
 }
 return '<div class="asset-map">'+assetSlot('map-base',svg,'map-base')+ids.slice(1).map(id=>assetSlot(id,'','map-layer')).join('')+'</div>';
}
document.addEventListener('error',e=>{
 const img=e.target;if(!img.matches?.('[data-ready-asset]'))return;
 img.hidden=true;const fallback=img.parentElement.querySelector('.asset-fallback');if(fallback)fallback.hidden=false;
},true);
if(new URLSearchParams(location.search).get('arte')==='1')document.documentElement.classList.add('art-review');
