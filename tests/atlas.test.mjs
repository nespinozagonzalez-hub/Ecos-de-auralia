import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REGIONS,MISSIONS,ATLAS_KEY,ADVENTURE_KEY} from '../dist/atlas-data.js';
import {newAtlas,restoreAtlas,atlasStats,regionState,claimCode,buyTheme,syncExpedition,configureMission,missionInfo} from '../dist/atlas-core.js';
import {NODES,commitDecision,optionAvailable,nextNode,createEcho,epilogue,choiceConflicts,visibleCallbacks} from '../dist/narrative-core.js';
import {VISUAL_ASSETS} from '../dist/visual-assets.js';
const baseLight=s=>{const st=atlasStats(s);return st.light-st.feats.reduce((n,f)=>n+f.light,0);};
function allCodes(s){for(const m of MISSIONS)claimCode(s,m.code);}
function step(s,n,option='A'){return commitDecision(s,n.id,option,'review');}
function through(s,to,prefer='A'){for(const n of NODES){if(s.narrative.decisions[n.id])continue;const o=n.options.find(o=>o.id===prefer&&optionAvailable(s,o))||n.options.find(o=>optionAvailable(s,o));assert.equal(step(s,n,o.id).ok,true,n.id);if(n.id===to)break;}}
test('22 choices and all three endings retain identical academic rewards',()=>{
 for(const final of ['A','B','C']){
  const s=newAtlas('Nicolás');allCodes(s);through(s,'C5.3');assert.equal(commitDecision(s,'C5.4',final).ok,true);
  assert.equal(nextNode(s),null);assert.equal(epilogue(s).places.length,5);
  const stats=atlasStats(s);assert.equal(stats.xp,1500);assert.equal(baseLight(s),525);assert.equal(stats.light,785,'feats add the same light on every route');assert.equal(stats.restored,5);
  assert.equal(Object.keys(s.narrative.decisions).length,22);
  const restored=restoreAtlas(JSON.parse(JSON.stringify(s)));assert.ok(restored);assert.deepEqual(restored.narrative.flags,s.narrative.flags);assert.deepEqual(atlasStats(restored),stats);
 }
});
test('Classroom codes bank across territories, but scenes require the exact memory and prior choice',()=>{
 const s=newAtlas();assert.equal(claimCode(s,'AUR-ECL-04').ok,true);assert.equal(atlasStats(s).memories,1);
 assert.equal(commitDecision(s,'C5.4','A').ok,false);
 assert.equal(commitDecision(s,'P.1','A').ok,true);assert.equal(commitDecision(s,'P.2','C').ok,true);
 assert.equal(commitDecision(s,'C1.1','A').ok,false);
 claimCode(s,'AUR-BOS-02');assert.equal(commitDecision(s,'C1.2','A').ok,false);
 claimCode(s,'AUR-BOS-01');assert.equal(commitDecision(s,'C1.1','A').ok,true);
 assert.equal(commitDecision(s,'C1.2','C').ok,false);assert.equal(commitDecision(s,'C1.2','B').ok,true);
 assert.equal(regionState(s,'marea').unlocked,false);
});
test('Confirmed choices and codes are idempotent and cannot be changed',()=>{
 const s=newAtlas();allCodes(s);through(s,'C1.2');
 const original=JSON.stringify(s),stats=atlasStats(s);
 assert.equal(commitDecision(s,'C1.2','A').duplicate,true);assert.equal(JSON.stringify(s),original);
 assert.equal(commitDecision(s,'C1.2','B').ok,false);
 assert.equal(claimCode(s,'AUR-BOS-01').duplicate,true);assert.deepEqual(atlasStats(s),stats);
});
test('A broken reservation requires an explicit exception or review; hidden actors do not gain knowledge',()=>{
 const s=newAtlas();allCodes(s);
 for(const n of NODES){
  if(n.id==='C4.2')break;
  const option=n.id==='P.2'?'A':n.id==='C1.3'?'B':'A';
  assert.equal(step(s,n,option).ok,true);
 }
 assert.ok(choiceConflicts(s,'C4.2','A').some(k=>k.id==='K_TESTIGOS'));
 assert.equal(commitDecision(s,'C4.2','A').needsGate,true);
 assert.equal(commitDecision(s,'C4.2','A','exception').ok,true);
 assert.equal(s.narrative.commitments.find(k=>k.id==='K_TESTIGOS').state,'en_tension');
 assert.equal(s.narrative.knowledge.aren,undefined);
 assert.ok(visibleCallbacks(s).some(c=>c.source.startsWith('C1.')));
});
test('Old saves preserve memories, purchases, bonuses and archive without inventing new choices',()=>{
 const raw={version:1,name:'Antiguo',completed:MISSIONS.filter(m=>m.region==='bosque').map(m=>m.id),choices:{bosque:'archivo'},purchases:['ambar'],theme:'ambar'};
 const s=restoreAtlas(raw);assert.ok(s);assert.equal(s.version,2);assert.equal(atlasStats(s).xp,300);assert.equal(baseLight(s),45);
 assert.equal(nextNode(s).id,'P.1');assert.equal(s.legacyArchive.choices.bosque,'archivo');assert.equal(regionState(s,'bosque').restored,false);
 through(s,'C1.4');assert.equal(atlasStats(s).xp,300);assert.equal(baseLight(s),45);
 assert.ok(restoreAtlas(JSON.parse(JSON.stringify(s))));
});
test('Backup reconstruction rejects forged routes and totals',()=>{
 const s=newAtlas();allCodes(s);through(s,'C1.1');
 const raw=JSON.parse(JSON.stringify(s));raw.narrative.decisions['C1.2']={optionId:'C'};assert.equal(restoreAtlas(raw),null);
 const forged=JSON.parse(JSON.stringify(s));forged.narrative.flags.final_regime='custodia';forged.xp=99999;
 assert.equal(restoreAtlas(forged).narrative.flags.final_regime,undefined);assert.equal(atlasStats(restoreAtlas(forged)).xp,1250);
});
test('Alternate echoes branch from the chapter start and never mutate the main run',()=>{
 const s=newAtlas();allCodes(s);through(s,'C1.4');const before=JSON.stringify(s);
 const echo=createEcho(s,'bosque');assert.ok(echo);assert.equal(nextNode(echo).id,'C1.1');
 assert.equal(commitDecision(echo,'C1.1','C').ok,true);assert.equal(commitDecision(echo,'C1.2','C').ok,true);
 assert.equal(JSON.stringify(s),before);assert.equal(createEcho(s,'marea'),null);
});
test('Production manifest contains unique assets and exact sprite geometry',()=>{
 assert.equal(VISUAL_ASSETS.assets.length,250);const ids=new Set();
 for(const a of VISUAL_ASSETS.assets){assert.ok(!ids.has(a.id));ids.add(a.id);assert.equal(a.width,a.frameWidth*a.columns);assert.equal(a.height,a.frameHeight*a.rows);assert.equal(a.frames,a.columns*a.rows);assert.match(a.path,/^assets\/atlas\//);}
 assert.ok(ids.has('bg-prologo'));assert.ok(ids.has('portrait-nara-preocupacion'));assert.ok(ids.has('map-bosque-huella-C'));
});
test('Consignments and cosmetics preserve identifiers and expedition stays separate',()=>{
 const s=newAtlas();allCodes(s);through(s,'C1.4');assert.equal(buyTheme(s,'ambar').ok,true);const light=atlasStats(s).light;buyTheme(s,'ambar');assert.equal(atlasStats(s).light,light);
 configureMission(s,'bosque-1','Investigar','Contrasta fuentes.');assert.equal(missionInfo(restoreAtlas(JSON.parse(JSON.stringify(s))),'bosque-1').title,'Investigar');
 const before=JSON.stringify(s);assert.deepEqual(syncExpedition(s,{version:1,flags:{restored:true}}),[]);assert.equal(JSON.stringify(s),before);
 const html=readFileSync(new URL('../dist/expedicion/index.html',import.meta.url),'utf8');assert.match(html,/<base href="\.\.\/">/);assert.notEqual(ATLAS_KEY,ADVENTURE_KEY);
});
test('Legal randomized campaigns reach every alternative and round-trip their consequences',()=>{
 let seed=20261104;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},seen=new Set(),finals=new Set();
 for(let i=0;i<300;i++){
  const s=newAtlas();allCodes(s);
  for(const n of NODES){const options=n.options.filter(o=>optionAvailable(s,o));assert.ok(options.length>=2,n.id);const o=options[Math.floor(rnd()*options.length)];assert.equal(step(s,n,o.id).ok,true);seen.add(o.event_id);}
  const restored=restoreAtlas(JSON.parse(JSON.stringify(s)));assert.ok(restored);assert.deepEqual(restored.narrative.flags,s.narrative.flags);assert.deepEqual(restored.narrative.commitments,s.narrative.commitments);finals.add(epilogue(restored).regime);
 }
 assert.equal(seen.size,66);assert.equal(finals.size,3);
});
