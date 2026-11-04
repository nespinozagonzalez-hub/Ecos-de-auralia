import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {REGIONS,MISSIONS,ATLAS_KEY,ADVENTURE_KEY} from '../dist/atlas-data.js';
import {newAtlas,restoreAtlas,atlasStats,regionState,currentRegion,claimCode,choosePath,buyTheme,syncExpedition,configureMission,missionInfo,availableStoryPages} from '../dist/atlas-core.js';

function finish(s,r){for(const m of MISSIONS.filter(m=>m.region===r.id))assert.equal(claimCode(s,m.code).ok,true);assert.equal(choosePath(s,r.id,r.choices[0].id).ok,true);}
test('Twenty classroom rewards form a complete five-chapter year',()=>{
  const s=newAtlas('Nicolás');assert.equal(new Set(MISSIONS.map(m=>m.code)).size,20);
  for(const r of REGIONS){assert.equal(regionState(s,r.id).unlocked,true);finish(s,r);assert.equal(regionState(s,r.id).restored,true);}
  const stats=atlasStats(s);assert.equal(stats.memories,20);assert.equal(stats.restored,5);assert.equal(stats.xp,1500);assert.equal(stats.light,525);assert.equal(stats.level,8);assert.equal(stats.companion,'Astral');
  assert.deepEqual(restoreAtlas(JSON.parse(JSON.stringify(s))).choices,s.choices);
});
test('Rewards and decisions have prerequisites and cannot be farmed',()=>{
  const s=newAtlas(),initial=atlasStats(s);
  assert.equal(claimCode(s,'AUR-MAR-01').ok,false);assert.deepEqual(atlasStats(s),initial);
  assert.equal(choosePath(s,'bosque','archivo').ok,false);
  assert.equal(claimCode(s,' auralia-inicio ').ok,true);
  const earned=atlasStats(s);assert.equal(claimCode(s,'AUR-BOS-01').ok,false);assert.deepEqual(atlasStats(s),earned);
  claimCode(s,'AUR-BOS-02');assert.equal(choosePath(s,'bosque','archivo').ok,true);
  assert.equal(choosePath(s,'bosque','refugio').ok,false);assert.equal(s.choices.bosque,'archivo');
  assert.equal(regionState(s,'bosque').restored,false);
  claimCode(s,'AUR-BOS-04');assert.equal(claimCode(s,'AUR-BOS-03').newlyRestored,true);
  assert.equal(currentRegion(s).id,'marea');assert.equal(claimCode(s,'AUR-MAR-01').ok,true);
});
test('Expedition discoveries contribute once and preserve the original adventure',()=>{
  const s=newAtlas(),adventure={version:1,flags:{gauntlet:true,restored:true,secretFound:true}},original=JSON.stringify(adventure);
  assert.equal(syncExpedition(s,adventure).length,3);const stats=atlasStats(s);assert.equal(stats.xp,110);assert.equal(stats.light,40);assert.equal(stats.memories,1);
  assert.equal(syncExpedition(s,adventure).length,0);assert.deepEqual(atlasStats(s),stats);assert.equal(claimCode(s,'AUR-BOS-03').ok,false);assert.equal(JSON.stringify(adventure),original);
  assert.notEqual(ATLAS_KEY,ADVENTURE_KEY);
});
test('Optional tablet finishes spend earned light once and never block restoration',()=>{
  const s=newAtlas();assert.equal(buyTheme(s,'ambar').ok,false);finish(s,REGIONS[0]);
  assert.equal(buyTheme(s,'ambar').ok,true);assert.equal(atlasStats(s).light,45);
  assert.equal(buyTheme(s,'ambar').ok,true);assert.equal(atlasStats(s).light,45);assert.deepEqual(s.purchases,['ambar']);
  assert.equal(buyTheme(s,'lunar').ok,false);assert.equal(regionState(s,'marea').unlocked,true);
  assert.equal(buyTheme(s,'verdigris').ok,true);assert.equal(atlasStats(s).light,45);
});
test('Backup import rebuilds totals and rejects inconsistent progression and purchases',()=>{
  assert.equal(restoreAtlas({version:99,completed:[]}),null);assert.equal(restoreAtlas({version:1,completed:{}}),null);
  const s=newAtlas();claimCode(s,'AUR-BOS-01');
  const raw={...s,xp:99999,light:99999,completed:['bosque-1','bosque-1','marea-1','unknown'],choices:{bosque:'archivo'},purchases:['ambar','ambar','lunar','unknown'],theme:'lunar'};
  const clean=restoreAtlas(raw);assert.deepEqual(clean.completed,['bosque-1']);assert.deepEqual(clean.purchases,[]);assert.deepEqual(clean.choices,{});assert.equal(clean.theme,'verdigris');assert.equal(atlasStats(clean).xp,40);
});
test('Story pages follow earned memories; a meaningful choice changes the territory',()=>{
  const s=newAtlas();assert.deepEqual(availableStoryPages(s,'bosque'),[0]);assert.deepEqual(availableStoryPages(s,'marea'),[]);
  claimCode(s,'AUR-BOS-01');claimCode(s,'AUR-BOS-02');assert.deepEqual(availableStoryPages(s,'bosque'),[0,1]);
  claimCode(s,'AUR-BOS-03');claimCode(s,'AUR-BOS-04');assert.equal(regionState(s,'bosque').restored,false);
  assert.equal(choosePath(s,'bosque','archivo').newlyRestored,true);assert.deepEqual(availableStoryPages(s,'bosque'),[0,1,2]);assert.match(regionState(s,'bosque').choice.effect,/archivo/);
});
test('Teacher consignments survive export, reset independently and keep stable reward codes',()=>{
  const s=newAtlas();configureMission(s,'bosque-1','Investigar el entorno','Compara tres fuentes y presenta una conclusión.');const copy=restoreAtlas(JSON.parse(JSON.stringify(s)));
  assert.equal(missionInfo(copy,'bosque-1').title,'Investigar el entorno');assert.equal(missionInfo(copy,'bosque-1').code,'AUR-BOS-01');
  configureMission(copy,'bosque-1','','');assert.equal(missionInfo(copy,'bosque-1').title,'Leer las huellas');
});
test('The original expedition retains its module base and has a route back to the hub',()=>{
  const html=readFileSync(new URL('../dist/expedicion/index.html',import.meta.url),'utf8');assert.match(html,/<base href="\.\.\/">/);assert.match(html,/src="game.js"/);assert.match(html,/Volver al Atlas de Ecos/);
  const root=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.match(root,/src="atlas.js"/);assert.doesNotMatch(root,/id="world"/);
});
