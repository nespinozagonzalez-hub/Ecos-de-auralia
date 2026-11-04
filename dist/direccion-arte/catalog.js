import {VISUAL_ASSETS} from '../visual-assets.js';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const assets=VISUAL_ASSETS.assets;
$('category').innerHTML+=[...new Set(assets.map(a=>a.category))].map(c=>'<option>'+c+'</option>').join('');
$('summary').innerHTML=[[assets.length,'Recursos definidos'],[assets.filter(a=>a.integration==='conectado').length,'Puntos conectados'],[assets.filter(a=>a.integration==='reservado').length,'Recursos reservados'],[assets.filter(a=>a.status==='ready').length,'Archivos finales listos']].map(([n,t])=>'<article><strong>'+n+'</strong><small>'+t+'</small></article>').join('');
function render(){
 const q=$('query').value.trim().toLowerCase(),cat=$('category').value,p=$('priority').value,mode=$('integration').value;
 const list=assets.filter(a=>(!cat||a.category===cat)&&(!p||a.priority===p)&&(!mode||a.integration===mode)&&(!q||JSON.stringify(a).toLowerCase().includes(q)));
 $('count').textContent=list.length+' recursos · P0: primer capítulo · P1: campaña · P2: expansión';
 $('assets').innerHTML=list.map(a=>'<article class="asset-entry"><span class="status">'+esc(a.priority)+' · '+esc(a.status==='ready'?'Listo':'Pendiente')+'</span><small>'+esc(a.category)+'</small><h3>'+esc(a.title)+'</h3><code>'+esc(a.id)+'</code><div class="asset-geometry">'+(a.status==='ready'?'<img src="../'+esc(a.path)+'" alt="'+esc(a.title)+'" style="max-height:130px;max-width:100%;image-rendering:pixelated">':a.width+' × '+a.height+' · '+(a.frames>1?a.columns+' × '+a.rows+' celdas':'PNG'))+'</div><dl><dt>Integración: </dt><dd>'+esc(a.integration)+'</dd><dt>Alpha: </dt><dd>'+(a.transparent?'Transparente':'Fondo opaco')+'</dd><dt>Animación: </dt><dd>'+(a.frames>1?a.frames+' cuadros · '+a.frameWidth+'×'+a.frameHeight+' · '+a.fps+' fps':'Estático')+'</dd></dl><p>'+esc(a.use)+'</p><code>'+esc(a.path)+'</code>'+(a.notes?'<details><summary>Brief y continuidad</summary><p>'+esc(a.notes)+'</p></details>':'')+'</article>').join('');
}
$('filters').addEventListener('input',render);render();
