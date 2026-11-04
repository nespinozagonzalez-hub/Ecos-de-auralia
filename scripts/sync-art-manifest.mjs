import {readFile,writeFile,access} from 'node:fs/promises';
const root=new URL('../dist/',import.meta.url);
const data=JSON.parse(await readFile(new URL('visual-assets.json',root),'utf8'));
const ids=new Set();
for(const a of data.assets){
 if(ids.has(a.id))throw Error('ID repetido: '+a.id);ids.add(a.id);
 if(!['planned','ready'].includes(a.status)||!Number.isInteger(a.width)||!Number.isInteger(a.height)||!a.path.startsWith('assets/atlas/'))throw Error('Ficha inválida: '+a.id);
 if(a.status==='ready'){
  await access(new URL(a.path,root));
  const bytes=await readFile(new URL(a.path,root));
  if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.readUInt32BE(16)!==a.width||bytes.readUInt32BE(20)!==a.height)throw Error('PNG o dimensiones incorrectas: '+a.id);
 }
}
await writeFile(new URL('visual-assets.js',root),'export const VISUAL_ASSETS = '+JSON.stringify(data,null,2)+';\n');
console.log('Catálogo sincronizado: '+ids.size+' recursos.');
