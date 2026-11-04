import {readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
for(const f of readdirSync('dist',{recursive:true}).filter(f=>/\.(js|mjs)$/.test(f)))execFileSync(process.execPath,['--check','dist/'+f],{stdio:'inherit'});
console.log('Sintaxis de todos los módulos comprobada.');
