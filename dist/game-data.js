export const SAVE_KEY = 'auralia.adventure.v1';
export const GAME_VERSION = 1;

// Demonstration codes are intentionally public. They are progression triggers,
// not authentication or proof of completing an assessment.
export const ACTIVITY_SEALS = [
  { id:'exploration', code:'AURALIA-INICIO', title:'Sello de exploración', activity:'Una actividad de observación, lectura o investigación.', unlock:'El acceso al Bosque de los Susurros.' },
  { id:'sanctuary', code:'AURALIA-RAICES', title:'Sello del santuario', activity:'Una actividad de aplicación, creación o resolución de problemas.', unlock:'Los mecanismos del Santuario de la Raíz.' }
];

export const SCENES = {
  village: { id:'village', name:'Aldea de Valdeluz', subtitle:'DONDE COMIENZAN LOS RECUERDOS', width:1600, height:1000, spawn:{x:795,y:735}, ambient:'village',
    paths:[[[60,580],[450,580],[795,580],[1150,580],[1510,580]],[[795,960],[795,580],[795,290]],[[450,580],[450,420]],[[250,580],[250,370]]],
    buildings:[{x:350,y:200,w:230,h:200,roof:'#9c654b',name:'Casa de Elia'},{x:1000,y:210,w:240,h:200,roof:'#617c61',name:'Archivo de Valdeluz'},{x:1040,y:720,w:200,h:170,roof:'#8b7653',name:'La posada'}],
    solids:[{x:355,y:270,w:220,h:130},{x:1005,y:285,w:230,h:125},{x:1045,y:785,w:190,h:105},{x:738,y:366,w:125,h:93},{x:70,y:95,w:36,h:280},{x:106,y:95,w:290,h:32},{x:360,y:125,w:36,h:250},{x:105,y:345,w:110,h:32},{x:285,y:345,w:75,h:32},{x:80,y:780,w:330,h:150}],
    entities:[
      {id:'elia',type:'npc',name:'Elia',x:450,y:470,action:'Hablar con Elia',style:'elder'},
      {id:'nara',type:'npc',name:'Nara',x:1070,y:475,action:'Hablar con Nara',style:'scout'},
      {id:'fountain',type:'fountain',name:'Fuente del Recuerdo',x:800,y:417,action:'Escuchar la fuente'},
      {id:'forestGate',type:'gate',name:'Camino del bosque',x:1460,y:580,action:'Entrar al bosque'},
      {id:'villageRoots',type:'roots',name:'Raíces antiguas',x:250,y:363,action:'Despejar las raíces',flag:'secretOpen'},
      {id:'secretChest',type:'chest',name:'El recuerdo escondido',x:245,y:220,action:'Abrir el cofre',flag:'secretFound'},
      {id:'signVillage',type:'sign',name:'La senda del este',x:1210,y:535,action:'Leer el letrero'}
    ]
  },
  forest: { id:'forest',name:'Bosque de los Susurros',subtitle:'DONDE LA TIERRA TODAVÍA ESCUCHA',width:1600,height:1000,spawn:{x:140,y:760},ambient:'forest',
    paths:[[[70,760],[430,760],[600,610],[600,390],[600,290]],[[600,610],[830,690],[1070,690],[1330,690],[1330,470],[1330,260],[1460,220]]],
    buildings:[],
    solids:[{x:950,y:0,w:140,h:620},{x:950,y:760,w:140,h:240},{x:365,y:350,w:95,h:75},{x:450,y:880,w:170,h:60},{x:730,y:160,w:130,h:80},{x:1120,y:120,w:80,h:110}],
    entities:[
      {id:'backVillage',type:'gate',name:'Regresar a Valdeluz',x:90,y:760,action:'Volver a la aldea'},
      {id:'forestStone',type:'runeStone',name:'El orden de la vida',x:600,y:405,action:'Examinar el altar'},
      {id:'relicChest',type:'chest',name:'Cofre de la exploradora',x:600,y:260,action:'Examinar el cofre',flag:'gauntlet'},
      {id:'naraMemory',type:'memory',name:'El recuerdo de Nara',x:760,y:380,action:'Escuchar el recuerdo'},
      {id:'forestRoots',type:'roots',name:'La raíz dormida',x:1330,y:445,action:'Usar el Guante de Raíces',flag:'rootsCleared'},
      {id:'templeGate',type:'templeGate',name:'Santuario de la Raíz',x:1450,y:200,action:'Entrar al santuario'},
      {id:'signForest',type:'sign',name:'Una advertencia tallada',x:860,y:650,action:'Leer la advertencia'}
    ],
    shadows:[{id:'shade1',x:465,y:650},{id:'shade2',x:1195,y:650}]
  },
  sanctuary: {id:'sanctuary',name:'Santuario de la Raíz',subtitle:'CUATRO SALAS. UN RECUERDO POR DESPERTAR.',width:1200,height:980,spawn:{x:300,y:745},ambient:'sanctuary',paths:[],buildings:[],solids:[],
    rooms:[{x:90,y:540,w:460,h:350,label:'Vestíbulo del sello'},{x:650,y:540,w:460,h:350,label:'Sala de los cristales'},{x:90,y:90,w:460,h:350,label:'Cámara del eco'},{x:650,y:90,w:460,h:350,label:'Corazón de la raíz'}],
    corridors:[{x:275,y:420,w:80,h:140},{x:530,y:680,w:140,h:80},{x:530,y:240,w:140,h:80},{x:855,y:420,w:80,h:140}],
    entities:[
      {id:'templeExit',type:'gate',name:'Regresar al bosque',x:300,y:845,action:'Salir del santuario'},
      {id:'sealPedestal',type:'sealStone',name:'El sello del umbral',x:300,y:640,action:'Activar el sello'},
      {id:'mirrorPuzzle',type:'crystal',name:'Cristales del alba',x:880,y:690,action:'Alinear los cristales'},
      {id:'memoryPuzzle',type:'statue',name:'La memoria del guardián',x:310,y:260,action:'Interpretar el recuerdo'},
      {id:'forestMedallion',type:'medallion',name:'Eco del Bosque',x:880,y:150,action:'Recuperar el Eco del Bosque'}
    ]
  }
};

export const JOURNEY = [
  { title:'Una campana agrietada', text:'Habla con Elia, junto a la casa de techo rojo.', flag:'metElia' },
  { title:'El primer sello', text:'Canjea el sello de exploración y entra al bosque por el arco del este.', flag:'enteredForest' },
  { title:'El orden de la vida', text:'Explora el bosque. Escucha el eco del altar y abre el cofre del norte.', flag:'gauntlet' },
  { title:'Una nueva forma de explorar', text:'Cruza el puente hacia el este y despeja las raíces con tu nueva reliquia.', flag:'rootsCleared' },
  { title:'El umbral del santuario', text:'Entra al santuario y activa su pedestal con el segundo sello.', flag:'templeOpen' },
  { title:'Dos luces en la oscuridad', text:'Alinea los cristales y descubre hacia dónde mira la estatua en el pasado.', flag:'chambersLit' },
  { title:'El que custodia lo olvidado', text:'Esquiva al guardián. Ataca su núcleo cuando quede expuesto y recupera el Eco.', flag:'restored' },
  { title:'La aldea recuerda', text:'Regresa a Valdeluz y escucha su fuente. Tu guante también abre un secreto al oeste.', flag:'epilogue' }
];

export const TERRITORIES = [
  {name:'Bosque de los Susurros',detail:'Primer capítulo · explorable',icon:'leaf',active:true},
  {name:'Ciudad Sumergida',detail:'Próximo territorio · Manto de la Corriente',icon:'water'},
  {name:'Cumbres del Viento',detail:'Próximo territorio · Báculo del Viento',icon:'wind'},
  {name:'Desierto de Cristal',detail:'Próximo territorio · Lente de Ecos',icon:'spark'},
  {name:'Ciudad del Eclipse',detail:'Desenlace proyectado · Campana del Alba',icon:'moon'}
];
