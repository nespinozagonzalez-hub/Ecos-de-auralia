import {SCENES} from './game-data.js';
import {seededRandom,dynamicSolids} from './engine.js';

const TAU=Math.PI*2;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function distanceToSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a[0]-t*dx,p.y-a[1]-t*dy);}
export function createLandscape(sceneId){
  const scene=SCENES[sceneId],rand=seededRandom(sceneId==='village'?932:1208),trees=[];
  if(sceneId==='sanctuary')return trees;
  for(let i=0;i<(sceneId==='forest'?420:260);i++){
    const x=30+rand()*(scene.width-60),y=40+rand()*(scene.height-70);
    if(scene.paths.some(path=>path.slice(1).some((p,j)=>distanceToSegment({x,y},path[j],p)<90)))continue;
    if(scene.entities.some(e=>Math.hypot(e.x-x,e.y-y)<100))continue;
    if(scene.solids.some(r=>x>r.x-45&&x<r.x+r.w+45&&y>r.y-40&&y<r.y+r.h+65))continue;
    if(sceneId==='village'&&x>60&&x<410&&y<410)continue;
    if(sceneId==='forest'&&x>910&&x<1135)continue;
    if(sceneId==='forest'&&x>1090&&y>365&&y<510)continue;
    if(trees.some(t=>Math.hypot(t.x-x,t.y-y)<50))continue;
    trees.push({x,y,size:65+rand()*45,variant:rand(),radius:14});
  }return trees;
}

export function createRenderer(canvas){
  const ctx=canvas.getContext('2d',{alpha:false});
  let width=1,height=1,dpr=1,camera={x:0,y:0,scale:1},cacheKey='',ground=null,trees=[],lastScene='';
  function resize(){width=canvas.clientWidth;height=canvas.clientHeight;dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  resize();
  function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();}
  function round(c,x,y,w,h,r,color){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function line(c,points,color,w){c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();}
  function groundFor(state){
    const scene=SCENES[state.scene],key=state.scene+state.flags.restored;
    if(cacheKey===key)return;
    cacheKey=key;ground=document.createElement('canvas');ground.width=scene.width;ground.height=scene.height;
    const c=ground.getContext('2d'),rand=seededRandom(8005),restored=state.flags.restored;
    if(state.scene==='sanctuary'){
      c.fillStyle='#102922';c.fillRect(0,0,scene.width,scene.height);
      const spaces=[...scene.rooms,...scene.corridors];
      for(const r of spaces){c.shadowColor='#020c0988';c.shadowBlur=25;c.shadowOffsetY=10;round(c,r.x-17,r.y-17,r.w+34,r.h+34,9,'#425645');}
      c.shadowBlur=0;c.shadowOffsetY=0;
      for(const r of spaces)round(c,r.x,r.y,r.w,r.h,2,'#59644d');
      for(let x=40;x<scene.width;x+=46)for(let y=40;y<scene.height;y+=46){
        if(!spaces.some(r=>x>r.x+3&&x<r.x+r.w-42&&y>r.y+3&&y<r.y+r.h-42))continue;
        round(c,x,y,42,42,2,['#606b53','#58634d','#667056','#626e51'][Math.floor(rand()*4)]);
        c.fillStyle='#9da27630';c.fillRect(x+3,y+3,36,1);
        if(rand()<.13)line(c,[[x+5,y+15],[x+16,y+22],[x+19,y+36]],'#273f303f',1);
      }
      for(const r of scene.rooms){
        c.strokeStyle='#a5a06d55';c.lineWidth=1;c.strokeRect(r.x+21,r.y+21,r.w-42,r.h-42);
        for(let x=r.x+30;x<r.x+r.w;x+=55){ellipse(c,x,r.y+10,rand()*11+3,5,'#71805b');ellipse(c,x,r.y+r.h-4,rand()*9+4,4,'#354b35');}
      }
      return;
    }
    const g=c.createLinearGradient(0,0,scene.width,scene.height);g.addColorStop(0,restored?'#70825a':'#526b50');g.addColorStop(.55,restored?'#708b5c':'#657b53');g.addColorStop(1,'#3e6147');c.fillStyle=g;c.fillRect(0,0,scene.width,scene.height);
    for(let i=0;i<6000;i++){const x=rand()*scene.width,y=rand()*scene.height;c.fillStyle=['#afaf6828','#b9b98624','#244b3635','#b1ba7e25'][i%4];c.fillRect(x,y,rand()*6+1,rand()*3+1);}
    for(let i=0;i<90;i++){const x=rand()*scene.width,y=rand()*scene.height;const glow=c.createRadialGradient(x,y,0,x,y,rand()*95+30);glow.addColorStop(0,i%2?'#c8bd5620':'#16452b22');glow.addColorStop(1,'#83945200');c.fillStyle=glow;c.fillRect(x-140,y-140,280,280);}
    for(const path of scene.paths){line(c,path,'#3b583a66',83);line(c,path,'#9b9b6e',70);line(c,path,'#afaa7e',57);line(c,path,'#b3ae803d',43);
      for(let j=1;j<path.length;j++){const a=path[j-1],b=path[j],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let n=0;n<len;n+=15){const t=n/len,x=a[0]+(b[0]-a[0])*t+(rand()-.5)*45,y=a[1]+(b[1]-a[1])*t+(rand()-.5)*45;ellipse(c,x,y,rand()*3+1,rand()*2+1,'#766f4235');}}
    }
    if(state.scene==='forest'){
      c.fillStyle='#3c5c40';c.fillRect(931,0,181,1000);c.fillStyle='#6e8560';c.fillRect(942,0,158,1000);
      const water=c.createLinearGradient(950,0,1090,0);water.addColorStop(0,'#416d62');water.addColorStop(.4,restored?'#5f9c8a':'#4c8275');water.addColorStop(1,'#295a53');c.fillStyle=water;c.fillRect(950,0,140,1000);
      c.fillStyle='#293d2d55';c.fillRect(926,627,190,141);
      round(c,924,627,196,128,3,'#6c6448');for(let x=928;x<1115;x+=16){round(c,x,630,13,122,1,x%3?'#a19a71':'#958860');c.fillStyle='#d6c89b55';c.fillRect(x+2,633,2,115);}
      line(c,[[921,628],[1120,628]],'#d0bd8b',7);line(c,[[921,756],[1120,756]],'#736747',7);
      for(const x of [924,1118])for(const y of [622,754])round(c,x-5,y-10,12,21,2,'#80764f');
      // The broad root barrier separates the upper sanctuary approach.
      line(c,[[1100,443],[1200,431],[1290,448],[1400,427],[1590,445]],'#436446',28);
    }else{
      const water=c.createRadialGradient(240,860,10,240,860,180);water.addColorStop(0,'#4f8274');water.addColorStop(1,'#365f53');round(c,73,778,340,157,70,'#859474');round(c,85,787,316,140,65,water);
      for(let i=0;i<17;i++){const x=100+rand()*280,y=805+rand()*100;line(c,[[x,y],[x+20,y]],'#adc8a449',1);}
      for(const wall of scene.solids.slice(4,9)){round(c,wall.x,wall.y,wall.w,wall.h,4,'#738365');line(c,[[wall.x+3,wall.y+4],[wall.x+wall.w-4,wall.y+4]],'#a4a782',3);}
      for(let i=0;i<25;i++){const x=120+rand()*220,y=140+rand()*185;ellipse(c,x,y,5,2,restored?'#e5c182':'#939b5b');}
    }
    // Wildflowers and tufts are reproducible, so scenery never jumps on reload.
    for(let i=0;i<(restored?650:240);i++){const x=rand()*scene.width,y=rand()*scene.height;if(scene.paths.some(path=>path.slice(1).some((p,j)=>distanceToSegment({x,y},path[j],p)<40)))continue;if(state.scene==='forest'&&x>930&&x<1120)continue;line(c,[[x,y],[x-1,y-5]],'#375e3b',1);ellipse(c,x-1,y-6,2.2,1.7,restored?['#e6cd95','#d6a497','#cfdfbd'][i%3]:'#b3b77d');}
  }

  function tree(t,restored){
    const {x,y,size:s,variant:v}=t;
    ellipse(ctx,x+13,y+7,s*.48,s*.2,'#123d2a38');
    line(ctx,[[x,y+1],[x-1,y-s*.54]],'#4f5033',s*.11);line(ctx,[[x-1,y-s*.3],[x+s*.2,y-s*.5]],'#6f6945',s*.06);
    const palettes=restored?['#315f40','#48764a','#5d8853','#8aa466']:v>.55?['#274d39','#376442','#4d764a','#789258']:['#2c543c','#3e6742','#587d4d','#889962'];
    const clusters=[[-.25,-.44,.3], [.25,-.46,.31],[-.4,-.66,.29],[.36,-.73,.32],[0,-.92,.34],[-.13,-.67,.39],[.15,-.61,.31]];
    clusters.forEach(([dx,dy,r],i)=>{ellipse(ctx,x+dx*s,y+dy*s,s*r,s*r*.73,palettes[i<2?0:i<4?1:2]);ellipse(ctx,x+dx*s-5,y+dy*s-8,s*r*.65,s*r*.33,palettes[i<4?1:3]+'55');});
    ctx.strokeStyle='#c3ca8222';ctx.lineWidth=1;
    for(let i=0;i<9;i++){const a=i*2.39+v*3,rx=x+Math.cos(a)*s*.3,ry=y-s*.67+Math.sin(a)*s*.2;ctx.beginPath();ctx.arc(rx,ry,s*.08,3.5,5.4);ctx.stroke();}
    if(restored&&v>.65)for(let i=0;i<6;i++)ellipse(ctx,x+Math.cos(i*2.2)*s*.36,y-s*.7+Math.sin(i*2.2)*s*.2,3,2,'#dbbba2');
  }
  function house(b){
    const {x,y,w,h}=b;
    round(ctx,x+12,y+h-25,w+10,44,15,'#21412a44');round(ctx,x+5,y+75,w-10,h-71,4,'#a0a17a');round(ctx,x+17,y+87,w-34,h-89,2,'#c4ba8e');
    for(let yy=y+102;yy<y+h;yy+=23)line(ctx,[[x+18,yy],[x+w-18,yy]],'#8c8b6255',1);
    round(ctx,x+w*.42,y+h-73,w*.2,73,14,'#46513b');round(ctx,x+w*.45,y+h-62,w*.14,62,9,'#5f6647');ellipse(ctx,x+w*.55,y+h-26,2.5,2.5,'#dbc98d');
    for(const xx of [x+w*.18,x+w*.72]){round(ctx,xx-4,y+h-98,34,38,9,'#6e7250');round(ctx,xx,y+h-95,26,31,7,'#e4d39a');line(ctx,[[xx+13,y+h-95],[xx+13,y+h-65]],'#777a54',3);line(ctx,[[xx,y+h-80],[xx+26,y+h-80]],'#777a54',3);}
    ctx.fillStyle='#253c2c55';ctx.beginPath();ctx.moveTo(x-15,y+110);ctx.lineTo(x+w*.5,y+5);ctx.lineTo(x+w+25,y+110);ctx.closePath();ctx.fill();
    ctx.fillStyle=b.roof;ctx.beginPath();ctx.moveTo(x-18,y+92);ctx.lineTo(x+w*.5,y-9);ctx.lineTo(x+w+18,y+92);ctx.closePath();ctx.fill();
    ctx.save();ctx.beginPath();ctx.moveTo(x-18,y+92);ctx.lineTo(x+w*.5,y-9);ctx.lineTo(x+w+18,y+92);ctx.closePath();ctx.clip();
    for(let yy=y+8;yy<y+94;yy+=13){line(ctx,[[x-10,yy],[x+w+10,yy]],'#dec69b22',2);for(let xx=x;xx<x+w;xx+=27)line(ctx,[[xx+(Math.floor(yy/13)%2?13:0),yy],[xx-8,yy+13]],'#333c2d25',1);}
    ctx.restore();line(ctx,[[x-18,y+92],[x+w*.5,y-9],[x+w+18,y+92]],'#ccb48355',3);line(ctx,[[x-18,y+94],[x+w+18,y+94]],'#565d3d',6);
    round(ctx,x+w*.72,y-4,24,47,2,'#9b9b76');ctx.fillStyle='#566c48';ctx.fillRect(x+w*.72-3,y-7,30,9);
    for(const xx of [x+8,x+w-8]){round(ctx,xx-13,y+h-18,26,16,5,'#656943');for(let i=0;i<5;i++)ellipse(ctx,xx+(i-2)*5,y+h-20-(i%2)*4,4,4,'#768d4c');}
  }
  function rune(c,x,y,kind,size=18,color='#e3cc8c'){
    c.save();c.translate(x,y);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.7;c.lineCap='round';c.lineJoin='round';c.beginPath();
    if(kind==='water'){c.moveTo(0,-size*.7);c.bezierCurveTo(-size,size*.3,-size*.5,size*.7,0,size*.7);c.bezierCurveTo(size*.6,size*.7,size,size*.3,0,-size*.7);}
    else if(kind==='sun'){c.arc(0,0,size*.35,0,TAU);for(let i=0;i<8;i++){const a=i*TAU/8;c.moveTo(Math.cos(a)*size*.52,Math.sin(a)*size*.52);c.lineTo(Math.cos(a)*size*.8,Math.sin(a)*size*.8);}}
    else if(kind==='root'){c.moveTo(0,-size*.7);c.lineTo(0,size*.6);c.moveTo(-size*.6,-size*.2);c.quadraticCurveTo(0,size*.1,size*.6,-size*.3);c.moveTo(-size*.5,size*.7);c.lineTo(0,size*.25);c.lineTo(size*.5,size*.7);}
    else{c.moveTo(0,-size*.8);c.lineTo(size*.6,0);c.lineTo(0,size*.8);c.lineTo(-size*.6,0);c.closePath();c.moveTo(0,-size*.4);c.lineTo(0,size*.4);}
    c.stroke();c.restore();
  }
  function chest(e,state){const open=state.flags[e.flag];ellipse(ctx,e.x+4,e.y+6,32,12,'#143c2a55');round(ctx,e.x-24,e.y-27,48,34,4,'#5b5032');round(ctx,e.x-21,e.y-24,42,27,3,'#9e8450');round(ctx,e.x-25,e.y-(open?49:35),50,open?18:22,7,open?'#6f613d':'#bc9b5b');line(ctx,[[e.x-16,e.y-28],[e.x-16,e.y+1]],'#dec58b',4);line(ctx,[[e.x+16,e.y-28],[e.x+16,e.y+1]],'#dec58b',4);round(ctx,e.x-4,e.y-21,8,11,2,'#e6d18f');if(!open){rune(ctx,e.x,e.y-52,'spark',10,'#e3d59a');}}
  function roots(e,state,time){
    const wide=e.id==='forestRoots',start=wide?1100:e.x-40,end=wide?1590:e.x+40;
    if(state.flags[e.flag])return;
    ctx.strokeStyle='#384e2e';ctx.lineCap='round';ctx.lineWidth=18;
    for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(start,e.y+7*j);ctx.bezierCurveTo(start+(end-start)*.33,e.y-42+j*12,start+(end-start)*.65,e.y+32-j*9,end,e.y-3+j*5);ctx.stroke();}
    ctx.strokeStyle='#8b8f4d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(start,e.y-4);ctx.bezierCurveTo(start+(end-start)*.33,e.y-50,start+(end-start)*.65,e.y+25,end,e.y-9);ctx.stroke();
    for(let x=start+10;x<end;x+=25){const y=e.y-15+Math.sin(x*.07)*13;ellipse(ctx,x,y,8,3,'#6f8d4a');ellipse(ctx,x+5,y-7,3,8,'#8ba657');}
    if(state.flags.gauntlet)rune(ctx,e.x,e.y-48,'root',13,'#d8e3a4'+(Math.sin(time*2)>0?'dd':'88'));
  }
  function gate(e,state,time){
    const temple=e.type==='templeGate';ellipse(ctx,e.x,e.y+12,temple?82:53,temple?23:14,'#153c2e55');
    for(const sign of [-1,1]){round(ctx,e.x+sign*(temple?66:37)-9,e.y-(temple?100:77),18,temple?117:91,3,'#718269');round(ctx,e.x+sign*(temple?66:37)-12,e.y-10,24,25,3,'#9fa27c');round(ctx,e.x+sign*(temple?66:37)-13,e.y-(temple?102:79),26,13,3,'#a3a37a');}
    line(ctx,[[e.x-(temple?74:46),e.y-(temple?101:80)],[e.x,e.y-(temple?134:94)],[e.x+(temple?74:46),e.y-(temple?101:80)]],'#8c9876',temple?23:15);
    line(ctx,[[e.x-(temple?74:46),e.y-(temple?110:86)],[e.x,e.y-(temple?143:100)],[e.x+(temple?74:46),e.y-(temple?110:86)]],'#b6b28a',3);
    if(temple){const g=ctx.createRadialGradient(e.x,e.y-38,0,e.x,e.y-38,60);g.addColorStop(0,'#d4e3a544');g.addColorStop(1,'#c7dfb100');ctx.fillStyle=g;ctx.fillRect(e.x-80,e.y-115,160,140);rune(ctx,e.x,e.y-104,'root',14);}
    else if(e.id==='forestGate'&&!state.seals.includes('exploration'))rune(ctx,e.x,e.y-37,'spark',15,'#e6d2a7');
    if(e.id==='backVillage'||e.id==='templeExit'){ctx.fillStyle='#d6d4a7';ctx.font='19px Georgia';ctx.textAlign='center';ctx.fillText('‹',e.x,e.y-29);}
  }
  function npc(e,time){
    const x=e.x,y=e.y,bob=Math.sin(time*1.7+e.x)*1.1,elder=e.style==='elder';ellipse(ctx,x+3,y+3,17,7,'#153d2b55');
    round(ctx,x-9,y-10,7,13,3,'#4d4b35');round(ctx,x+3,y-10,7,13,3,'#4d4b35');
    ctx.fillStyle=elder?'#a5a482':'#6e8b67';ctx.beginPath();ctx.moveTo(x-14,y-12);ctx.lineTo(x-11,y-35+bob);ctx.quadraticCurveTo(x,y-44+bob,x+11,y-35+bob);ctx.lineTo(x+15,y-12);ctx.closePath();ctx.fill();
    line(ctx,[[x-14,y-30+bob],[x-19,y-15]],'#cab58b',6);line(ctx,[[x+13,y-30+bob],[x+19,y-17]],'#cab58b',6);
    ellipse(ctx,x,y-44+bob,10,12,'#c9b68b');ellipse(ctx,x,y-51+bob,11,7,elder?'#d5d2b6':'#63543a');
    if(elder){ellipse(ctx,x-10,y-46+bob,4,7,'#d5d2b6');line(ctx,[[x+20,y-30],[x+22,y+4]],'#756c48',3);}else{line(ctx,[[x-9,y-57],[x+13,y-51]],'#638561',6);}
    line(ctx,[[x-9,y-32],[x+10,y-32]],elder?'#8b7154':'#cbb677',4);rune(ctx,x,y-82+Math.sin(time*2)*3,'spark',8,'#e4d29c');
  }
  function fountain(e,state,time){
    const x=e.x,y=e.y;ellipse(ctx,x+4,y+9,70,43,'#1e44324d');ellipse(ctx,x,y,64,40,'#a7aa85');ellipse(ctx,x,y-4,54,31,'#516b55');ellipse(ctx,x,y-8,48,26,state.flags.restored?'#76a591':'#698578');
    ctx.strokeStyle='#c5d5ae55';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,y-9,25+Math.sin(time)*5,12,0,0,TAU);ctx.stroke();
    round(ctx,x-11,y-60,22,53,4,'#989e77');ellipse(ctx,x,y-61,32,15,'#b4b38b');ellipse(ctx,x,y-66,27,11,'#678b76');line(ctx,[[x,y-94],[x,y-69]],'#d4d8ad99',2);ellipse(ctx,x,y-94,3,4,'#d5e6b8');
    for(let i=0;i<6;i++){const a=time*1.2+i*TAU/6;ellipse(ctx,x+Math.cos(a)*20,y-49+(time*40+i*17)%37,1.3,3,'#b5d0a999');}
    if(state.flags.restored)for(let i=0;i<8;i++){const a=i*TAU/8;ellipse(ctx,x+Math.cos(a)*61,y+Math.sin(a)*35-4,6,3,'#e4c896');}
  }
  function monument(e,state,echo,time){
    const x=e.x,y=e.y;ellipse(ctx,x+5,y+7,45,19,'#0f32254d');round(ctx,x-37,y-5,74,15,5,'#8d9470');round(ctx,x-30,y-17,60,16,3,'#a2a580');
    if(e.type==='runeStone'||e.type==='sealStone'){
      round(ctx,x-28,y-74,56,61,9,'#7f8b69');round(ctx,x-22,y-70,44,50,5,'#929b74');rune(ctx,x,y-47,e.type==='runeStone'?'root':'spark',18,state.flags.templeOpen&&e.type==='sealStone'?'#d5f0b1':'#d9cc94');
      if(e.type==='runeStone')for(let i=0;i<3;i++)rune(ctx,x+(i-1)*27,y+28,['water','root','sun'][i],9,echo?'#dbf9bd':'#73885b');
    }else if(e.type==='crystal'){
      for(let i=0;i<3;i++){const xx=x+(i-1)*37,yy=y-40+(i%2)*-13,col=state.flags.mirrorsLit?'#e5e1a2':'#7bab92';ctx.save();ctx.translate(xx,yy);ctx.rotate((state.mirrors[i]*Math.PI)/2);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,-24);ctx.lineTo(12,0);ctx.lineTo(0,18);ctx.lineTo(-12,0);ctx.closePath();ctx.fill();line(ctx,[[0,-18],[0,12]],'#f3edbb88',1);ctx.restore();}
      if(state.flags.mirrorsLit){const g=ctx.createRadialGradient(x,y-43,0,x,y-43,90);g.addColorStop(0,'#e6e9ab33');g.addColorStop(1,'#d0e4b000');ctx.fillStyle=g;ctx.fillRect(x-100,y-130,200,180);}
    }else if(e.type==='statue'){
      round(ctx,x-15,y-60,30,48,5,'#929e79');ellipse(ctx,x,y-75,18,21,'#a3ac87');line(ctx,[[x-13,y-47],[x-29,y-42],[x-31,y-59]],'#929e79',12);
      line(ctx,[[x+13,y-48],[x+(echo?60:29),y-(echo?48:35)]],echo?'#d5e6b1':'#929e79',11);rune(ctx,x,y-43,'spark',10);
      if(echo){line(ctx,[[x+40,y-50],[x+95,y-50]],'#d5e6b1',2);line(ctx,[[x+85,y-58],[x+95,y-50],[x+85,y-42]],'#d5e6b1',2);}
    }
  }
  function player(state,rt){
    const x=state.x,y=state.y,bob=rt.moving?Math.sin(rt.time*13)*1.5:Math.sin(rt.time*2)*.6,step=rt.moving?Math.sin(rt.time*13)*4:0;
    if(rt.hurt>0&&Math.floor(rt.time*16)%2===0)return;
    ellipse(ctx,x+3,y+4,17,7,'#14392b66');
    round(ctx,x-9,y-9+step,7,14,3,'#3c4631');round(ctx,x+2,y-9-step,7,14,3,'#3c4631');
    ctx.fillStyle='#365d4b';ctx.beginPath();ctx.moveTo(x-15,y-8);ctx.lineTo(x-11,y-31+bob);ctx.lineTo(x+10,y-31+bob);ctx.lineTo(x+15,y-9);ctx.quadraticCurveTo(x,y-3,x-15,y-8);ctx.fill();
    line(ctx,[[x-10,y-26+bob],[x-17,y-13+step*.4]],state.flags.gauntlet?'#d3b56e':'#b3a684',6);line(ctx,[[x+11,y-26+bob],[x+17,y-13-step*.4]],'#b3a684',6);
    ellipse(ctx,x,y-40+bob,11,12,'#ceb994');
    ctx.fillStyle='#46694f';ctx.beginPath();ctx.moveTo(x-14,y-37+bob);ctx.quadraticCurveTo(x-18,y-56+bob,x-2,y-59+bob);ctx.lineTo(x+13,y-44+bob);ctx.lineTo(x+11,y-37+bob);ctx.quadraticCurveTo(x,y-49+bob,x-14,y-37+bob);ctx.fill();
    line(ctx,[[x-11,y-31+bob],[x+10,y-31+bob]],'#ccab68',5);line(ctx,[[x-10,y-30+bob],[x-15-Math.sin(rt.time*5)*2,y-17+bob]],'#c9a665',5);
    if(rt.facing.y<-.4){ellipse(ctx,x,y-42+bob,11,10,'#46694f');line(ctx,[[x+11,y-7],[x+17,y-45]],'#8c9273',3);}else{const eye=rt.facing.x<-.4?-4:rt.facing.x>.4?5:3;ellipse(ctx,x+eye,y-40+bob,1,1.4,'#3b4933');}
    if(rt.dash>0){for(let i=0;i<3;i++)ellipse(ctx,x-rt.facing.x*(20+i*12),y-rt.facing.y*(20+i*12)-18,12-i*3,18-i*4,'#d5e3a0'+['55','33','22'][i]);}
    if(rt.attack>0){const a=Math.atan2(rt.facing.y,rt.facing.x),s=1-rt.attack/.28;ctx.save();ctx.translate(x,y-13);ctx.rotate(a-.9+s*1.8);line(ctx,[[15,0],[69,0]],'#f3e2ae',5);line(ctx,[[25,-9],[25,9]],'#cfab68',4);ctx.restore();ctx.strokeStyle='#e5db9a99';ctx.lineWidth=7;ctx.beginPath();ctx.arc(x,y-13,57,a-.8,a+.8);ctx.stroke();}
  }
  function guardian(boss,time){
    if(boss.hp<=0)return;
    const x=boss.x,y=boss.y,bob=Math.sin(time*1.4)*2,recover=boss.phase==='recover',windup=boss.phase==='windup';
    ellipse(ctx,x+5,y+8,43,18,'#081d17aa');
    if(windup){ctx.strokeStyle='#e9bc7680';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,53+Math.sin(time*8)*4,0,TAU);ctx.stroke();line(ctx,[[x,y],[x+boss.dx*230,y+boss.dy*230]],'#e0af5b55',28);}
    for(const s of [-1,1]){round(ctx,x+s*19-11,y-18,23,28,6,'#677b5b');round(ctx,x+s*39-10,y-59+bob,24,40,9,'#798a67');round(ctx,x+s*39-12,y-30+bob,27,17,5,'#a5aa7b');}
    round(ctx,x-32,y-72+bob,64,63,11,'#7c8a65');round(ctx,x-25,y-66+bob,50,47,8,'#96a078');
    ellipse(ctx,x,y-93+bob,25,25,'#879875');line(ctx,[[x-28,y-104+bob],[x,y-115+bob],[x+28,y-104+bob]],'#b7b78a',8);
    line(ctx,[[x-15,y-92+bob],[x-5,y-92+bob]],recover?'#dbf4bc':'#e7cb89',3);line(ctx,[[x+6,y-92+bob],[x+16,y-92+bob]],recover?'#dbf4bc':'#e7cb89',3);
    for(let i=0;i<7;i++)ellipse(ctx,x-30+Math.sin(i*5)*8,y-92+i*11,7,4,'#567348');
    const g=ctx.createRadialGradient(x,y-42,0,x,y-42,recover?65:25);g.addColorStop(0,recover?'#e9ffd199':'#ddcf6e22');g.addColorStop(1,'#c3d87d00');ctx.fillStyle=g;ctx.fillRect(x-75,y-110,150,130);rune(ctx,x,y-44+bob,'root',19,recover?'#e5ffbb':'#c9c28d');
  }
  function shadow(e,time){const y=e.y-15+Math.sin(time*3+e.x)*3;ellipse(ctx,e.x,e.y+3,23,8,'#16312466');ctx.fillStyle=e.hurt>0?'#b2bd8b':'#273f35';ctx.beginPath();ctx.moveTo(e.x-20,y+13);ctx.bezierCurveTo(e.x-28,y-32,e.x+27,y-32,e.x+20,y+13);ctx.quadraticCurveTo(e.x,y+4,e.x-20,y+13);ctx.fill();for(const sign of [-1,1])ellipse(ctx,e.x+sign*7,y-3,2,2.5,'#ded4a0');if(e.hp===1){round(ctx,e.x-15,y-35,30,3,1,'#1a3128');round(ctx,e.x-15,y-35,15,3,1,'#cdbb84');}}

  function entity(e,state,rt){
    if(e.type==='roots'){roots(e,state,rt.time);return;}
    if(e.type==='npc')npc(e,rt.time);
    else if(e.type==='chest')chest(e,state);
    else if(e.type==='gate'||e.type==='templeGate')gate(e,state,rt.time);
    else if(e.type==='fountain')fountain(e,state,rt.time);
    else if(['runeStone','sealStone','crystal','statue'].includes(e.type))monument(e,state,rt.echo,rt.time);
    else if(e.type==='memory'){
      if(rt.echo){ctx.globalAlpha=.55+Math.sin(rt.time*2)*.1;npc({...e,style:'scout'},rt.time);ctx.globalAlpha=1;}else{for(let i=0;i<4;i++)ellipse(ctx,e.x+Math.sin(rt.time+i)*14,e.y-20-i*8,1.7,2.5,'#b8d4a388');}
    }else if(e.type==='sign'){line(ctx,[[e.x,e.y],[e.x,e.y-34]],'#675e3e',6);round(ctx,e.x-25,e.y-51,50,24,3,'#b7aa76');line(ctx,[[e.x-15,e.y-43],[e.x+16,e.y-43]],'#6f7250',2);line(ctx,[[e.x-12,e.y-36],[e.x+8,e.y-36]],'#6f7250',2);}
    else if(e.type==='medallion'&&state.flags.bossDefeated&&!state.flags.restored){const g=ctx.createRadialGradient(e.x,e.y-30,0,e.x,e.y-30,70);g.addColorStop(0,'#ebf5b966');g.addColorStop(1,'#badd8c00');ctx.fillStyle=g;ctx.fillRect(e.x-80,e.y-110,160,160);ellipse(ctx,e.x,e.y+5,29,12,'#133a2a66');rune(ctx,e.x,e.y-34+Math.sin(rt.time*2)*5,'root',28,'#f2e5a9');}
  }
  function draw(state,rt){
    if(width!==canvas.clientWidth||height!==canvas.clientHeight)resize();
    if(lastScene!==state.scene){trees=createLandscape(state.scene);lastScene=state.scene;camera.x=NaN;}
    groundFor(state);const scene=SCENES[state.scene];
    camera.scale=rt.title?Math.max(.75,Math.min(1.2,width/1100,height/650)):clamp(Math.min(width/1000,height/720),.68,1.2);
    const vw=width/camera.scale,vh=height/camera.scale;
    const targetX=clamp((rt.title?1040:state.x)-vw*.5,Math.min(0,(scene.width-vw)/2),Math.max(0,scene.width-vw));
    const targetY=clamp((rt.title?440:state.y)-vh*(rt.title?.52:.57),Math.min(0,(scene.height-vh)/2),Math.max(0,scene.height-vh));
    camera.x=Number.isFinite(camera.x)?camera.x+(targetX-camera.x)*.09:targetX;camera.y=Number.isFinite(camera.y)?camera.y+(targetY-camera.y)*.09:targetY;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#102d24';ctx.fillRect(0,0,width,height);
    ctx.save();ctx.scale(camera.scale,camera.scale);ctx.translate(-camera.x,-camera.y);
    ctx.drawImage(ground,0,0);
    if(rt.destination&&!rt.title){ctx.strokeStyle='#e4db9a88';ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(rt.destination.x,rt.destination.y,16,9,0,0,TAU);ctx.stroke();line(ctx,[[rt.destination.x-4,rt.destination.y],[rt.destination.x+4,rt.destination.y]],'#ece0ac',1);line(ctx,[[rt.destination.x,rt.destination.y-4],[rt.destination.x,rt.destination.y+4]],'#ece0ac',1);}
    if(state.scene==='forest'){
      ctx.save();ctx.beginPath();ctx.rect(951,0,138,618);ctx.rect(951,762,138,238);ctx.clip();
      for(let i=0;i<32;i++){const y=((i*47+rt.time*14)%1100)-50,x=967+(i%4)*28;line(ctx,[[x,y],[x+17,y-3],[x+28,y]],'#acd0b33b',1);}
      ctx.restore();
    }
    if(state.scene==='sanctuary'){
      for(const r of scene.rooms){ctx.textAlign='center';ctx.font='10px Georgia';ctx.fillStyle='#d7d5ab5c';ctx.fillText(r.label.toUpperCase(),r.x+r.w/2,r.y+r.h-30);}
      for(const bar of dynamicSolids(state)){round(ctx,bar.x,bar.y,bar.w,bar.h,2,'#293e2b');for(let p=0;p<(bar.w>bar.h?bar.w:bar.h);p+=12)line(ctx,bar.w>bar.h?[[bar.x+p,bar.y],[bar.x+p,bar.y+bar.h]]:[[bar.x,bar.y+p],[bar.x+bar.w,bar.y+p]],'#d3c083',4);}
      for(const [x,y,lit] of [[157,140,state.flags.memoryLit],[1050,810,state.flags.mirrorsLit],[160,810,state.flags.templeOpen],[1040,140,state.flags.bossDefeated]]){
        round(ctx,x-6,y-19,12,27,3,'#6d754e');if(lit){const g=ctx.createRadialGradient(x,y-24,0,x,y-24,140);g.addColorStop(0,'#f5db893d');g.addColorStop(1,'#bedd7300');ctx.fillStyle=g;ctx.fillRect(x-150,y-174,300,300);ellipse(ctx,x,y-24+Math.sin(rt.time*5),5,11,'#e5d298');}}
    }
    const objects=[];
    for(const t of trees)if(t.x>camera.x-130&&t.x<camera.x+vw+130&&t.y>camera.y-30&&t.y<camera.y+vh+140)objects.push({y:t.y,draw:()=>{ctx.save();if(!rt.title&&t.y>state.y&&Math.abs(t.x-state.x)<t.size*.7&&state.y>t.y-t.size*1.3)ctx.globalAlpha=.4;tree(t,state.flags.restored);ctx.restore();}});
    for(const b of scene.buildings)objects.push({y:b.y+b.h,draw:()=>house(b)});
    for(const e of scene.entities)objects.push({y:e.y,draw:()=>entity(e,state,rt)});
    for(const e of rt.enemies||[])if(e.hp>0)objects.push({y:e.y,draw:()=>shadow(e,rt.time)});
    if(state.scene==='sanctuary'&&rt.boss&& !state.flags.bossDefeated)objects.push({y:rt.boss.y,draw:()=>guardian(rt.boss,rt.time)});
    if(!rt.title)objects.push({y:state.y,draw:()=>player(state,rt)});
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    for(const f of rt.effects||[]){ctx.globalAlpha=clamp(f.life/f.max,0,1);ellipse(ctx,f.x,f.y,f.size,f.size*.65,f.color);ctx.globalAlpha=1;}
    if(rt.echo){ctx.fillStyle='#caebbb0d';ctx.fillRect(camera.x,camera.y,vw,vh);ctx.strokeStyle='#d0e8ac44';ctx.lineWidth=1;for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse(state.x,state.y,70+(rt.time*35+i*60)%180,(70+(rt.time*35+i*60)%180)*.6,0,0,TAU);ctx.stroke();}
      if(state.scene==='forest'){for(const [i,kind] of ['water','root','sun'].entries()){const x=state.x<900?520+i*80:1280+i*45,y=state.x<900?330:380;rune(ctx,x,y,kind,16,'#dbf2b3');ctx.font='13px Georgia';ctx.fillStyle='#edf6c9';ctx.textAlign='center';ctx.fillText(String(i+1),x,y-31);}}
    }
    // Sparse drifting motes and warm shafts keep the world alive without assets.
    const motion=state.settings.reducedMotion?0:rt.time;
    for(let i=0;i<34;i++){const x=(i*277+Math.sin(motion*.23+i)*33)%scene.width,y=(i*163+motion*5)%scene.height;ellipse(ctx,x,y,1.5+(i%2)*.6,1.5,'#e2e5ae'+(i%3?'55':'99'));}
    if(state.scene!=='sanctuary'){
      ctx.save();ctx.globalCompositeOperation='screen';
      const light=ctx.createLinearGradient(0,0,scene.width,scene.height);light.addColorStop(0,'#e2ce7515');light.addColorStop(.5,'#e2ce7500');light.addColorStop(1,'#c7d58a08');ctx.fillStyle=light;ctx.fillRect(0,0,scene.width,scene.height);ctx.restore();
    }
    ctx.restore();
    if(state.scene==='sanctuary'){
      const p=toScreen(state.x,state.y-30),g=ctx.createRadialGradient(p.x,p.y,60,p.x,p.y,Math.max(width,height)*.66);g.addColorStop(0,'#061b1200');g.addColorStop(1,'#061b1277');ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
    }
  }
  function toScreen(x,y){return {x:(x-camera.x)*camera.scale,y:(y-camera.y)*camera.scale};}
  return {draw,resize,toScreen,getTrees:()=>trees,getCamera:()=>camera};
}
