export const ATLAS_KEY = 'auralia.atlas.v2';
export const LEGACY_ATLAS_KEY = 'auralia.atlas.v1';
export const ATLAS_VERSION = 2;
export const ADVENTURE_KEY = 'auralia.adventure.v1';

export const REGIONS = [
  {
    id:'bosque',short:'El bosque',name:'Bosque de los Susurros',chapter:'El bosque que olvidó su nombre',number:'I',code:'BOS',icon:'leaf',color:'#638f65',light:'#b9d38b',position:[250,442],label:[244,548],
    path:'M73 370Q108 320 174 333L280 310Q351 317 408 371L441 444 404 535Q375 600 304 615L189 598 101 540 57 458Z',
    description:'Entre raíces y hojas dormidas, Valdeluz espera que alguien recuerde por qué fue construida.',
    relic:'Guante de Raíces',relicDescription:'Lo que parecía un obstáculo puede convertirse en un camino. Conserva la primera habilidad de tu aventura.',
    missions:['Leer las huellas','Escuchar otras voces','Cruzar el umbral','Dejar una nueva historia'],
    memories:['La campana agrietada','Una voz entre las hojas','El puente de Nara','La semilla de Valdeluz'],
    story:[
      {title:'Una luz bajo el polvo',speaker:'Elia',text:'«Esta tableta no dibuja lugares: conserva lo que hacemos en ellos». Elia pone el Atlas entre tus manos. Una pequeña luz despierta en su centro. En el mapa aparece un bosque sin color y, entre sus árboles, una aldea que nadie recuerda haber fundado.'},
      {title:'Dos formas de volver a casa',speaker:'Nara',text:'Bajo las raíces encuentras las ruinas de un antiguo edificio. Los habitantes necesitan un lugar para reunirse y también un lugar para conservar sus historias. Puedes recuperar primero uno de los dos. La decisión quedará escrita en Valdeluz.'},
      {title:'El primer lugar que recuerda',speaker:'Elia',text:'Las campanas vuelven a sonar y los senderos recuperan su color. En la tierra recién despierta encuentras una inscripción: «Una historia vive mientras alguien decide continuarla». Al otro lado del río, una ciudad emerge entre la niebla.'}
    ],
    choices:[{id:'refugio',title:'El Refugio de las Raíces',description:'Reconstruir un espacio de encuentro y colaboración.',effect:'En Valdeluz aparece un refugio iluminado. Nara reúne allí a los viajeros.',icon:'home'},{id:'archivo',title:'El Archivo de las Hojas',description:'Recuperar un lugar para guardar las historias del bosque.',effect:'En Valdeluz aparece un archivo. Elia conserva allí las voces recuperadas.',icon:'book'}]
  },
  {
    id:'marea',short:'La ciudad',name:'Ciudad Sumergida',chapter:'Las voces bajo la marea',number:'II',code:'MAR',icon:'water',color:'#4b9290',light:'#a4d8cf',position:[582,473],label:[604,596],
    path:'M441 399 522 364Q580 350 634 389L702 402 760 472 739 548Q713 608 632 636L521 617 443 549 411 472Z',
    description:'Bajo canales silenciosos aparecen balcones, escaleras y las voces de quienes aprendieron a vivir con el agua.',
    relic:'Manto de la Corriente',relicDescription:'Sigue el movimiento del agua y encuentra conexiones donde antes solo veías distancias.',
    missions:['Buscar lo que permanece','Contrastar las señales','Trazar una solución','Construir una conexión'],
    memories:['La plaza bajo el agua','La carta de Lúa','Un puente entre dos orillas','Los jardines que flotan'],
    story:[
      {title:'Una ciudad debajo del reflejo',speaker:'Lúa',text:'El Atlas muestra una calle donde solo ves agua. Al escuchar su eco aparecen ventanas encendidas bajo la superficie. Lúa, la guardiana de los canales, te entrega una carta sin destinatario: «Quizás una ciudad sea la manera en que decidimos encontrarnos».'},
      {title:'Lo que une a las orillas',speaker:'Lúa',text:'La marea ha descendido, pero dos barrios siguen separados. Puedes levantar puentes que recuperen los caminos o cultivar jardines flotantes donde sus habitantes se encuentren. Ambos futuros son posibles; el tuyo necesita una decisión.'},
      {title:'El agua vuelve a tener nombre',speaker:'Lúa',text:'Las ventanas dejan de ser reflejos. Entre las luces del canal, una corriente dibuja una ruta nueva en el Atlas. Al norte, alguien ha encendido una señal entre las nubes. La ciudad queda atrás, pero sus voces viajan contigo.'}
    ],
    choices:[{id:'puentes',title:'Los Puentes del Encuentro',description:'Volver a conectar los barrios mediante caminos compartidos.',effect:'La ciudad recupera sus puentes y las luces se encuentran sobre el canal.',icon:'bridge'},{id:'jardines',title:'Los Jardines de la Marea',description:'Crear espacios flotantes donde nazcan nuevos encuentros.',effect:'Jardines y pequeñas embarcaciones llenan de vida el agua de la ciudad.',icon:'leaf'}]
  },
  {
    id:'cumbres',short:'Las cumbres',name:'Cumbres del Viento',chapter:'La señal al otro lado de las nubes',number:'III',code:'CUM',icon:'wind',color:'#7e9a98',light:'#d4e6d6',position:[522,192],label:[529,282],
    path:'M352 172 401 103 468 75Q531 50 584 89L638 145 691 206 650 286 581 324 509 311 437 336 373 287 329 229Z',
    description:'Los caminos se confunden con las nubes. Una señal antigua aún espera respuesta en la cima.',
    relic:'Báculo del Viento',relicDescription:'Escucha, cambia de perspectiva y vuelve a intentarlo. Incluso el viento puede abrir una ruta.',
    missions:['Observar desde otro lugar','Relacionar los indicios','Ensayar una estrategia','Compartir lo aprendido'],
    memories:['El faro sin luz','Un mensaje de Oren','La escalera en las nubes','El viento que responde'],
    story:[
      {title:'La señal que nadie respondió',speaker:'Oren',text:'El viento arrastra una nota hasta tus manos. Solo dice: «Sigo aquí». En lo alto de una torre, Oren mantiene una señal que nadie ha visto en años. El Atlas vibra: la luz de un lugar despierto puede alcanzar otro que todavía duerme.'},
      {title:'Una luz para quien viene',speaker:'Oren',text:'La antigua torre puede volver a ser un faro para orientar a quienes cruzan las montañas o convertirse en un refugio para quienes necesitan detenerse. Oren te pide que elijas qué promesa tendrá el edificio cuando vuelva a encenderse.'},
      {title:'Alguien responde',speaker:'Oren',text:'Por primera vez, una segunda luz responde desde el horizonte. El viento ya no parece una voz solitaria. Tu Atlas conserva el sonido de aquella respuesta y revela un desierto donde los cristales guardan fragmentos del cielo.'}
    ],
    choices:[{id:'faro',title:'El Faro de las Cumbres',description:'Guiar con una señal a quienes todavía buscan el camino.',effect:'Un faro dibuja haces de luz sobre las montañas del Atlas.',icon:'spark'},{id:'abrigo',title:'El Refugio del Viento',description:'Ofrecer un lugar para descansar antes de continuar.',effect:'Un refugio cálido aparece entre las cumbres y las rutas nevadas.',icon:'home'}]
  },
  {
    id:'cristal',short:'El desierto',name:'Desierto de Cristal',chapter:'El cielo hecho pedazos',number:'IV',code:'CRI',icon:'crystal',color:'#b68f66',light:'#edcb93',position:[801,306],label:[807,419],
    path:'M687 166 757 139Q819 138 855 191L910 221 942 287 918 358 943 407 870 445 785 415 724 430 670 376 649 298 685 241Z',
    description:'Cada cristal refleja una posibilidad. Iria intenta reunir una imagen que nadie ha visto completa.',
    relic:'Lente de Ecos',relicDescription:'Reconoce lo que falta, compara las huellas y descubre nuevos significados en lugares conocidos.',
    missions:['Distinguir los fragmentos','Reunir las evidencias','Proponer una interpretación','Dar forma a una idea'],
    memories:['El cristal sin reflejo','La pregunta de Iria','Un cielo entre las manos','El observatorio dormido'],
    story:[
      {title:'Un cielo entre la arena',speaker:'Iria',text:'Los cristales no reflejan tu rostro. En ellos aparecen instantes de un cielo que aún no existe. Iria lleva años reuniéndolos: «Tal vez no estamos recuperando el pasado. Tal vez estamos aprendiendo a imaginar lo que viene».'},
      {title:'Mirar o transformar',speaker:'Iria',text:'Los fragmentos pueden volver a formar un observatorio para mirar juntos el horizonte o un taller donde cada viajero construya algo con lo que encontró. Iria deja el último cristal en tu mano. El edificio espera su nueva historia.'},
      {title:'El reflejo que faltaba',speaker:'Iria',text:'Al unir el último fragmento, el cielo del cristal y el cielo real coinciden por un instante. En el Atlas aparece la silueta de una ciudad alrededor de un eclipse. En sus puertas se reúnen todas las rutas que has abierto.'}
    ],
    choices:[{id:'observatorio',title:'El Observatorio de Cristal',description:'Reunir las miradas para comprender el horizonte.',effect:'Una cúpula abierta y su lente iluminan las dunas del desierto.',icon:'compass'},{id:'taller',title:'El Taller de los Reflejos',description:'Dar herramientas para transformar las ideas en creaciones.',effect:'Un taller de cristales y ventanas luminosas aparece en el Atlas.',icon:'crystal'}]
  },
  {
    id:'eclipse',short:'El eclipse',name:'Ciudad del Eclipse',chapter:'El reino que decidimos recordar',number:'V',code:'ECL',icon:'moon',color:'#807493',light:'#d4bde9',position:[228,187],label:[225,286],
    path:'M98 116 159 77Q208 56 260 92L318 104 350 169 328 237 353 286 300 331 231 309 173 331 107 287 68 213Z',
    description:'El centro del reino conserva un lugar para cada historia que has recuperado. La última página sigue en blanco.',
    relic:'Campana del Alba',relicDescription:'Cada decisión deja una huella. Reúne las historias del reino y reconoce el camino que construiste.',
    missions:['Recuperar el recorrido','Conectar las historias','Crear una nueva posibilidad','Compartir tu legado'],
    memories:['La puerta de las cinco rutas','La voz de Aren','La página que faltaba','Un reino por continuar'],
    story:[
      {title:'Todas las rutas llegan hasta aquí',speaker:'Aren',text:'Aren te espera junto a una puerta con cinco marcas. No te pregunta cuántos enemigos venciste: te pide que cuentes lo que decidiste conservar. Al abrir el Atlas, las voces de tus compañeros llenan la plaza de la ciudad.'},
      {title:'La última página',speaker:'Aren',text:'El reino puede guardar sus voces en un gran lugar de encuentro o abrir caminos para que sus historias sigan viajando. No existe una respuesta que borre las anteriores. Elige cómo quieres que Auralia continúe después de esta aventura.'},
      {title:'Lo que hacemos deja un eco',speaker:'Auralia',text:'La Campana del Alba suena una sola vez. En su eco escuchas las hojas, la marea, el viento y los cristales. El reino recupera sus colores. La última página del Atlas ya no está vacía: lleva tu nombre y las decisiones que tomaste para llegar hasta aquí.'}
    ],
    choices:[{id:'voces',title:'El Reino de las Voces',description:'Conservar una plaza donde todas las historias puedan encontrarse.',effect:'La plaza central se llena de luces que representan las voces recuperadas.',icon:'echo'},{id:'caminos',title:'El Reino de los Caminos',description:'Abrir rutas para que las historias sigan cambiando y viajando.',effect:'Cinco caminos luminosos atraviesan el Atlas y continúan más allá del mapa.',icon:'compass'}]
  }
];

export const MISSION_KINDS = [
  {label:'Exploración',prompt:'Observa, investiga o lee el material propuesto. Comparte una huella o una pregunta que consideres importante.',xp:40,light:12},
  {label:'Comprensión',prompt:'Relaciona ideas y contrasta las pistas. Explica tu interpretación usando evidencias de la actividad.',xp:50,light:16},
  {label:'Aplicación',prompt:'Pon a prueba una idea o resuelve el desafío de la actividad. Explica qué decisiones tomaste.',xp:70,light:22},
  {label:'Creación',prompt:'Crea una respuesta propia y comparte lo que aprendiste. Incorpora una reflexión sobre tu recorrido.',xp:90,light:30}
];
export const MISSIONS=REGIONS.flatMap(r=>r.missions.map((title,i)=>({id:`${r.id}-${i+1}`,region:r.id,index:i,title,code:`AUR-${r.code}-0${i+1}`,memory:r.memories[i],...MISSION_KINDS[i]})));
export const CODE_ALIASES={'AURALIA-INICIO':'bosque-1','AURALIA-RAICES':'bosque-2'};
export const LEVELS=[0,60,160,300,500,760,1080,1450];
export const THEMES=[
  {id:'verdigris',name:'Piedra del bosque',description:'La superficie original de tu Atlas.',cost:0,color:'#82ab87'},
  {id:'ambar',name:'Ámbar del alba',description:'Un marco cálido para las historias que merecen luz.',cost:60,color:'#d1a773'},
  {id:'lunar',name:'Piedra de luna',description:'Una superficie teñida por el cielo del eclipse.',cost:110,color:'#b2a0d0'},
  {id:'aurora',name:'Cristal de aurora',description:'El Atlas conserva los colores de un nuevo amanecer.',cost:180,color:'#80cbb9'}
];
export const EXPEDITION_EVENTS={
  gauntlet:{xp:20,light:10,title:'La expedición recuperó el Guante de Raíces'},
  seed:{xp:20,light:8,title:'La expedición encontró la semilla de Valdeluz'}
};
