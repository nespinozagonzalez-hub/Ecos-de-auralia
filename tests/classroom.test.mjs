import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {MISSIONS} from '../dist/atlas-data.js';
import {newAtlas,restoreAtlas,claimCode,atlasStats,joinClassroom,hasProgress} from '../dist/atlas-core.js';
import {commitDecision} from '../dist/narrative-core.js';
import {sha256,createClassroom,unlockClassroom,missionForCode,encodeClassroom,decodeClassroom,canonicalCode} from '../dist/classroom.js';
import {CAMPAIGN} from '../dist/narrative-data.js';

const course=createClassroom('7°B · Lenguaje','clave-del-curso');
const roundTrip=s=>restoreAtlas(JSON.parse(JSON.stringify(s)));

test('SHA-256 matches the reference implementation',()=>{
 for(const text of ['','abc','ñandú y campana','x'.repeat(200)])assert.equal(sha256(text),createHash('sha256').update(text).digest('hex'));
});

test('A course produces 20 unique, deterministic private seals that only the teacher key recovers',()=>{
 assert.equal(course.ok,true);assert.equal(course.codes.length,MISSIONS.length);
 assert.equal(new Set(course.codes.map(c=>c.code)).size,MISSIONS.length);
 assert.ok(course.codes.every(c=>/^[A-Z]{3}[1-4]-[A-Z2-9]{6}$/.test(c.code)));
 assert.deepEqual(createClassroom('7°B · Lenguaje','clave-del-curso').codes,course.codes);
 assert.notDeepEqual(createClassroom('7°C · Lenguaje','clave-del-curso').codes,course.codes);
 assert.deepEqual(unlockClassroom(course.classroom,'clave-del-curso'),course.codes);
 assert.equal(unlockClassroom(course.classroom,'otra-clave-x'),null);
 assert.equal(createClassroom('Curso','corta').ok,false);
 const shared=JSON.stringify(course.classroom);
 for(const c of course.codes)assert.equal(shared.includes(canonicalCode(c.code)),false,'the student link never contains a code');
 assert.equal(shared.includes('clave-del-curso'),false);
});

test('The course link survives encoding and rejects damaged payloads',()=>{
 assert.deepEqual(decodeClassroom(encodeClassroom(course.classroom)),course.classroom);
 assert.equal(decodeClassroom('basura'),null);
 assert.equal(decodeClassroom(encodeClassroom(course.classroom).slice(0,-12)),null);
});

test('In a course only its own seals are accepted; demo and foreign codes are rejected',()=>{
 const s=joinClassroom(newAtlas('Ana'),course.classroom);
 assert.equal(claimCode(s,'AUR-BOS-01').ok,false);
 assert.match(claimCode(s,'AUR-BOS-01').message,/demostración/);
 const other=createClassroom('8°A','clave-del-curso');
 assert.equal(claimCode(s,other.codes[0].code).ok,false);
 const first=course.codes[0].code;
 assert.equal(claimCode(s,' '+first.toLowerCase().replace('-',' ')).ok,true,'typing is forgiving');
 assert.equal(claimCode(s,first).duplicate,true);
 assert.equal(atlasStats(s).memories,1);
 assert.equal(missionForCode(course.classroom,first.slice(0,-1)+(first.endsWith('A')?'B':'A')),null);
});

test('A course save keeps verified seals and drops memories added by editing the file',()=>{
 const s=joinClassroom(newAtlas('Ana'),course.classroom);
 for(const c of course.codes.slice(0,4))assert.equal(claimCode(s,c.code).ok,true);
 assert.equal(commitDecision(s,'P.1','A').ok,true);assert.equal(commitDecision(s,'P.2','A').ok,true);
 assert.equal(commitDecision(s,'C1.1','A').ok,true);
 const restored=roundTrip(s);
 assert.deepEqual(restored.completed,s.completed);assert.deepEqual(atlasStats(restored),atlasStats(s));
 assert.equal(restored.classroom.name,'7°B · Lenguaje');

 const forged=JSON.parse(JSON.stringify(s));forged.completed=MISSIONS.map(m=>m.id);
 assert.equal(restoreAtlas(forged).completed.length,4,'memories without a seal are discarded');
 const fakeProof=JSON.parse(JSON.stringify(s));fakeProof.completed.push('marea-1');fakeProof.claims['marea-1']='MAR1-AAAAAA';
 assert.equal(restoreAtlas(fakeProof).completed.length,4);
 const swapped=JSON.parse(JSON.stringify(s));swapped.completed.push('bosque-1x');swapped.claims['marea-1']=s.claims['bosque-1'];swapped.completed.push('marea-1');
 assert.equal(restoreAtlas(swapped).completed.includes('marea-1'),false,'a seal only proves its own mission');
 const brokenClass=JSON.parse(JSON.stringify(s));brokenClass.classroom.hashes[0]='0'.repeat(24);brokenClass.classroom.hashes.pop();
 assert.equal(restoreAtlas(brokenClass),null);
});

test('Joining a course or resetting inside it starts clean and keeps the course',()=>{
 const demo=newAtlas('Leo');claimCode(demo,'AUR-BOS-01');assert.equal(hasProgress(demo),true);
 const joined=joinClassroom(demo,course.classroom);
 assert.equal(joined.name,'Leo');assert.equal(joined.completed.length,0);assert.equal(hasProgress(joined),false);
 assert.equal(joined.classroom.id,course.classroom.id);
 assert.equal(joinClassroom(demo,{id:'x'}),null);
});

test('Demo mode keeps working with public codes',()=>{
 const s=newAtlas();assert.equal(claimCode(s,'AUR-BOS-01').ok,true);assert.equal(claimCode(s,'AURALIA-RAICES').ok,true);
 assert.equal(roundTrip(s).completed.length,2);assert.equal(roundTrip(s).classroom,null);
});

test('The documentary copy of the campaign matches the runtime data',()=>{
 assert.deepEqual(JSON.parse(readFileSync(new URL('../docs/narrativa/campana-v1.json',import.meta.url),'utf8')),JSON.parse(JSON.stringify(CAMPAIGN)));
});
