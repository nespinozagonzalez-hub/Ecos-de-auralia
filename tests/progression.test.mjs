import test from 'node:test';
import assert from 'node:assert/strict';
import {newGame,restoreGame,redeemSeal,travel,openTemple,solveForest,turnMirror,solveMemory,recoverMedallion,walkable,movePlayer,nearestEntity,prepareDemo,findWalkingPath} from '../dist/engine.js';
import {SCENES} from '../dist/game-data.js';
import {createLandscape} from '../dist/art.js';

test('A classroom seal unlocks the forest only after the narrative introduction',()=>{
  const s=newGame('Nicolás');
  assert.equal(travel(s,'forest').ok,false);
  assert.equal(redeemSeal(s,'incorrecto').ok,false);
  assert.equal(redeemSeal(s,' auralia-inicio ').ok,true);
  assert.equal(redeemSeal(s,'AURALIA-INICIO').ok,false);
  assert.equal(travel(s,'forest').ok,false);
  s.flags.metElia=true;
  assert.equal(travel(s,'forest').ok,true);
  assert.equal(s.flags.enteredForest,true);
});
test('The reliquary, second classroom seal and two distinct puzzles connect to restoration',()=>{
  const s=newGame();
  assert.equal(solveForest(s,['root','water','sun']),false);
  assert.equal(solveForest(s,['water','root','sun']),true);
  assert.equal(openTemple(s).ok,false);
  s.flags.gauntlet=true;s.flags.rootsCleared=true;
  assert.equal(travel(s,'sanctuary').ok,true);
  assert.equal(openTemple(s).ok,false);
  redeemSeal(s,'AURALIA-RAICES');assert.equal(openTemple(s).ok,true);
  for(const [i,times] of [[0,3],[1,2],[2,1]])for(let n=0;n<times;n++)turnMirror(s,i);
  assert.equal(s.flags.mirrorsLit,true);assert.equal(s.flags.chambersLit,false);
  assert.equal(solveMemory(s,'west'),false);assert.equal(solveMemory(s,'east'),true);
  assert.equal(s.flags.chambersLit,true);
  assert.equal(recoverMedallion(s),false);s.flags.bossDefeated=true;
  assert.equal(recoverMedallion(s),true);assert.equal(s.flags.restored,true);
});
test('Saved progress is sanitized, preserves discoveries and recovers invalid positions',()=>{
  const s=newGame('Nicolás');prepareDemo(s,'sanctuary');s.x=880;s.y=690;s.flags.memoryLit=true;
  const restored=restoreGame(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.flags.gauntlet,true);assert.equal(restored.name,'Nicolás');assert.equal(restored.x,880);
  assert.equal(restoreGame({version:99,scene:'village'}),null);
  s.x=-300;s.y=-100;s.hp=900;s.seals.push('fake');s.flags.gauntlet='yes';
  const safe=restoreGame(s);assert.equal(safe.hp,6);assert.equal(safe.flags.gauntlet,false);assert.ok(!safe.seals.includes('fake'));assert.ok(walkable(safe,safe.x,safe.y));
});
test('Dashes cannot cross the forest barrier before earning the gauntlet',()=>{
  const s=newGame();s.scene='forest';s.x=1330;s.y=510;
  movePlayer(s,0,-1,.22,[],620);assert.ok(s.y>478);
  s.flags.rootsCleared=true;movePlayer(s,0,-1,.22,[],620);assert.ok(s.y<420);
});
test('The garden secret cannot be collected through its wall',()=>{
  const s=newGame();s.x=245;s.y=290;
  assert.notEqual(nearestEntity(s)?.id,'secretChest');
  s.flags.secretOpen=true;s.y=270;assert.equal(nearestEntity(s)?.id,'secretChest');
});
test('Click-to-walk routes really reach their destination and respect a sealed door',()=>{
  const s=newGame(),trees=createLandscape('village'),path=findWalkingPath(s,{x:450,y:470},trees);
  assert.ok(path.length>0);
  for(const p of path){let attempts=0;while(Math.hypot(p.x-s.x,p.y-s.y)>8&&attempts++<40)movePlayer(s,p.x-s.x,p.y-s.y,.025,trees);assert.ok(attempts<40,'each waypoint is reachable');}
  assert.ok(Math.hypot(s.x-450,s.y-470)<45);
  prepareDemo(s,'sanctuary');
  assert.equal(findWalkingPath(s,{x:880,y:275}).length,0);
  s.flags.chambersLit=true;assert.ok(findWalkingPath(s,{x:880,y:275}).length>0);
});

function reachable(s,start,target,maxDistance=75){
  const grid=16,trees=createLandscape(s.scene),queue=[[Math.round(start.x/grid)*grid,Math.round(start.y/grid)*grid]],seen=new Set();
  for(let index=0;index<queue.length;index++){
    const [x,y]=queue[index],key=x+','+y;if(seen.has(key))continue;seen.add(key);
    if(!walkable(s,x,y,13,trees))continue;
    if(Math.hypot(x-target.x,y-target.y)<maxDistance)return true;
    for(const [dx,dy] of [[grid,0],[-grid,0],[0,grid],[0,-grid]])if(!seen.has((x+dx)+','+(y+dy)))queue.push([x+dx,y+dy]);
  }return false;
}
test('Every required landmark is reachable on foot with the real landscape collisions',()=>{
  const s=newGame();
  for(const id of ['elia','forestGate','fountain','villageRoots']){const target=SCENES.village.entities.find(e=>e.id===id);assert.ok(reachable(s,SCENES.village.spawn,target),`village ${id}`);}
  prepareDemo(s,'forest');
  for(const id of ['forestStone','relicChest','forestRoots','backVillage'])assert.ok(reachable(s,SCENES.forest.spawn,SCENES.forest.entities.find(e=>e.id===id)),`forest ${id}`);
  assert.equal(reachable(s,SCENES.forest.spawn,{x:1450,y:200}),false);
  s.flags.rootsCleared=true;assert.ok(reachable(s,SCENES.forest.spawn,{x:1450,y:200}));
  prepareDemo(s,'sanctuary');
  for(const id of ['sealPedestal','mirrorPuzzle','memoryPuzzle'])assert.ok(reachable(s,SCENES.sanctuary.spawn,SCENES.sanctuary.entities.find(e=>e.id===id)),`sanctuary ${id}`);
  assert.equal(reachable(s,SCENES.sanctuary.spawn,{x:880,y:275}),false);
  s.flags.chambersLit=true;assert.ok(reachable(s,SCENES.sanctuary.spawn,{x:880,y:275}));
});
