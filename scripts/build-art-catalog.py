from pathlib import Path
import json,csv,io,re
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'dist'; assets=[]
def add(id,category,title,size,use,priority='P1',mounted=True,transparent=False,frames=1,cols=1,rows=1,fps=0,notes=''):
 w,h=size
 assets.append(dict(id=id,category=category,title=title,width=w,height=h,path='assets/atlas/'+category+'/'+id+'.png',status='planned',priority=priority,integration='conectado' if mounted else 'reservado',transparent=transparent,frames=frames,columns=cols,rows=rows,fps=fps,frameWidth=w//cols,frameHeight=h//rows,use=use,notes=notes))
regions=['bosque','marea','cumbres','cristal','eclipse']
add('map-base','mapa','Geografía de Auralia',(1000,700),'atlas.js / mapa del inicio; debajo de capas y controles SVG',priority='P0')
for r in regions:
 for phase in ['dormido','trazas','intervenido','restaurado']:
  add('map-'+r+'-'+phase,'mapa',r+' / '+phase,(1000,700),'Mapa / fase derivada de memoria y decisiones. Transparencia fuera de región.',transparent=True,priority='P0' if r=='bosque' else 'P1')
 for family in ['intervencion','institucion']:
  for option in ['A','B','C']:
   add('map-'+r+'-'+family+'-'+option,'mapa',r+' / '+family+' '+option,(1000,700),'Mapa / nodo '+r+' .2 o .4; misma alineación global.',transparent=True)
 for option in ['A','B','C']:
  add('map-'+r+'-huella-'+option,'mapa',r+' / pérdida y trabajo pendiente '+option,(1000,700),'Mapa / conserva el coste de .2 incluso al restaurar.',transparent=True)
add('bg-prologo','fondos','Plaza de Valdeluz, pedestal y tableta',(640,360),'Prólogo P.1 y P.2; arte sin texto integrado',priority='P0')
locales={
 'bosque':['Fila de hogares y mesa de planos','Los tres sellos bajo la tormenta','Sala provisional para las voces','Obras y dos orillas'],
 'marea':['Ventanas, hogares y lista incompleta','Red hidráulica y alojamiento común','Mesa de reparto entre distritos','Sala de apelación sobre el canal'],
 'cumbres':['Poblado, viejo mandato y faro','Señal que también revela un hogar','Mesa de revisión del acuerdo','Custodia y estación de relevos'],
 'cristal':['Testigos y cristales documentales','Archivo de registros identificables','Dos versiones sobre una mesa','Observatorio, taller y cámara'],
 'eclipse':['Puerta de las cinco rutas','Redes de luz durante la transición','Primera apelación del nuevo pacto','Plaza y mesa de las tres llaves']}
for r,loc in locales.items():
 for i,title in enumerate(loc,1):add('bg-'+r+'-'+str(i),'fondos',title,(640,360),'Escena C'+str(regions.index(r)+1)+'.'+str(i)+' y memoria '+r+'-'+str(i),priority='P0' if r=='bosque' else 'P1')
 for opt in ['A','B','C']:add('scene-'+r+'-rama-'+opt,'capas',r+' / variante posterior a intervención '+opt,(640,360),'Lector: capa transparente sobre fondo .2, para escena de rama.',transparent=True)
for regime,title in [('custodia','Casa de custodia y apelaciones'),('llaves','Cinco archivos y un camino en reparación'),('relevo','Estación de relevos, formación y cuidados')]:
 add('bg-final-'+regime,'fondos',title,(640,360),'Epílogo / familia '+regime)
characters={
 'elia':('Archivista de Valdeluz','Cabello gris corto, lentes redondos, abrigo verde pino, carpeta de latón. No caricaturizar como autoridad fría.'),
 'nara':('Organizadora de los hogares','Piel morena, trenza castaña, pañuelo terracota, abrigo de viaje, libreta de rutas.'),
 'lua':('Cuidadora de canales','Cabello oscuro ondulado, impermeable azul petróleo, botas de canal, brazalete de cobre.'),
 'oren':('Técnico de señales','Cabello cobrizo, gafas de trabajo levantadas, chaqueta ocre, herramientas pequeñas.'),
 'sira':('Habitante y portavoz de las cumbres','Cabello negro recogido, manto azul gris, bordados geométricos y cuerda de montaña.'),
 'iria':('Investigadora de cristales','Cabello negro corto, capa ciruela, lentes protectoras, estuche para fragmentos.'),
 'dara':('Testigo y autora de su memoria','Cabello rizado oscuro, vestido arena, chal verde salvia, cristal envuelto en tela.'),
 'aren':('Antiguo custodio del pacto','Cabello blanco largo atado, ropa violeta desgastada, llave de bronce y manos visibles. Sin aura de villano.')}
for actor,(role,brief) in characters.items():
 for exp in ['neutral','atento','duda','preocupacion','firme','alivio']:
  add('portrait-'+actor+'-'+exp,'retratos',actor.title()+' / '+exp,(96,96),'Lector: retrato contextual; neutral funciona como reemplazo de expresiones faltantes.',priority='P0' if actor in ['elia','nara'] and exp in ['neutral','duda','preocupacion'] else 'P1',transparent=True,notes=role+'. '+brief+' Plano de busto, ojos a y=35; misma pose, escala y luz entre expresiones.')
 add('actor-'+actor+'-gestos','actores',actor.title()+' / respiración y gesto',(192,128),'Escenario narrativo; reservado para futura composición con personajes de cuerpo entero.',priority='P2',mounted=False,transparent=True,frames=8,cols=4,rows=2,fps=4,notes='Celdas 48x64. Fila0: idle 4 cuadros; fila1: gesto 4 cuadros. Pies en x24,y60 de cada celda.')
for look in ['bosque','marea','sol']:
 add('guardian-'+look,'guardian','Guardián / '+look,(96,160),'Perfil, avatar de cabecera y retrato propio',priority='P0',transparent=True)
 add('guardian-'+look+'-caminar','actores','Guardián '+look+' / caminar',(192,256),'Reservado para futura expedición; no requerido para leer ni decidir.',priority='P2',mounted=False,transparent=True,frames=16,cols=4,rows=4,fps=6,notes='Celdas48x64, filas abajo/izquierda/derecha/arriba. Cuadros reposo/pasoA/centro/pasoB. Pies x24,y60; sin equipo que salga de la celda.')
for phase in ['chispa','lumen','astral']:
 add('companion-'+phase,'companero','Compañero / '+phase,(128,32),'Perfil / compañero con animación optativa',transparent=True,frames=4,cols=4,rows=1,fps=4,notes='Celdas32x32, pivote16,16. Reposo por defecto, sin flashes.')
for r in regions:
 for i in range(1,5):add('memory-'+r+'-'+str(i),'memorias',r+' / memoria '+str(i),(64,64),'Colección y recompensa; motivo simbólico sin texto',priority='P0' if r=='bosque' else 'P1',transparent=True)
 add('relic-'+r,'reliquias','Reliquia / '+r,(48,48),'Colección de reliquias',transparent=True)
for oath in ['amparo','memoria','vinculo']:add('oath-'+oath,'simbolos','Juramento / '+oath,(32,32),'Registro de palabra / ninguna jerarquía cromática',transparent=True)
for state in ['vigente','sostenido','en_tension','renegociado','pendiente','reparado']:add('commitment-'+state,'simbolos','Compromiso / '+state,(24,24),'Registro de promesas; icono más etiqueta de texto',transparent=True)
for id,title,size,use in [
 ('ui-emblem','Emblema del Atlas',(64,64),'Cabecera y navegación'),
 ('ui-dialogue','Marco de diálogo',(48,48),'Lector, borde por CSS border-image con corte de12px'),
 ('ui-bubble','Burbuja contextual',(32,32),'Lector / respuesta y recuerdo de consecuencia; corte8px'),
 ('ui-choice','Marco de alternativa',(48,48),'Lector / alternativas; corte12px'),
 ('ui-memory','Marco de memoria',(32,32),'Colección / corte8px'),
 ('ui-portrait','Marco de retrato',(112,112),'Lector / corte8px; área central transparente'),
 ('ui-cursor','Cursor de selección',(16,16),'Reservado / foco por teclado, mantener contorno accesible'),
 ('ui-tooltip','Marco de ayuda',(24,24),'Reservado / corte6px'),
 ('ui-toast','Aviso de recuerdo',(32,32),'Reservado / corte8px'),
 ('ui-tabs','Pestañas del Atlas',(24,24),'Reservado / corte6px'),
 ('ui-seal','Sello de actividad',(32,32),'Reservado / canje'),
 ('ui-cover','Portada del Atlas',(320,400),'Reservado / futura pantalla de ingreso')]:
 add(id,'interfaz',title,size,use,priority='P0' if id in ['ui-dialogue','ui-bubble','ui-choice','ui-portrait'] else 'P1',mounted=id not in ['ui-cursor','ui-tooltip','ui-toast','ui-tabs','ui-seal','ui-cover'],transparent=True)
for fx in ['page','seal','memory','restore','echo','light']:
 add('fx-'+fx,'efectos','Efecto / '+fx,(256,32),'Reservado / transición optativa. Ningún efecto indica acierto o error moral.',priority='P2',mounted=False,transparent=True,frames=8,cols=8,rows=1,fps=8,notes='Celdas32x32. Sin movimiento reducido: reproducir una vez; reducido: cuadro0 estático.')
icon_source=(OUT/'atlas-art.js').read_text().split('export const icon=')[0]
for name in re.findall(r"^\s+(\w+):",icon_source,re.M):
 add('icon-'+name,'iconos','Icono / '+name,(24,24),'atlas-art.js / iconos de navegación, acciones y recompensas',transparent=True)
previous=OUT/'visual-assets.json'
if previous.exists():
 old={a['id']:a for a in json.loads(previous.read_text())['assets']}
 for a in assets:
  if a['id'] in old:a['status']=old[a['id']]['status']
manifest=dict(version=1,style='RPG clásico pixel art detallado',assets=assets)
(OUT/'visual-assets.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
(OUT/'visual-assets.js').write_text("export const VISUAL_ASSETS = "+json.dumps(manifest,ensure_ascii=False,indent=2)+";\n")
fields=['id','category','title','priority','integration','width','height','frameWidth','frameHeight','frames','columns','rows','fps','transparent','status','path','use','notes']
with (OUT/'direccion-arte/catalogo-recursos.csv').open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(assets)
brief="""# Atlas de Ecos / Guía de arte y sustitución
Versión1.0 · 4 de noviembre de 2026 · Fase: integración narrativa, arte pendiente.

## 1. Alcance aprobado
RPG antiguo en pixel art detallado, cálido, luminoso y de autoría propia. La interfaz actual se conserva como soporte funcional. No se han producido los PNG finales. Las expresiones, ilustraciones y animaciones aquí definidas son encargos concretos para la siguiente etapa. La expedición se conserva aparte y el movimiento de mundo no se requiere para el Atlas.

## 2. Dirección de arte
Pixel visible y deliberado, siluetas limpias, agrupación de píxeles, luz ambiental suave sin degradado borroso. Fondos de640x360 y retratos de96x96 permiten detalle sin perder lectura. Evocar los RPG de16/32bits con mayor riqueza ambiental; crear vestuario, arquitectura, símbolos y personajes originales. No reproducir personajes o interfaz de Zelda.
Paleta común: tinta #153A36, sombra #203B48, piedra #738779, pergamino #E6D7AE, oro envejecido #C6A46A, terracota #B97760, luz #D9E5B1. Acentos: bosque salvia, ciudad petróleo, cumbres azul gris, cristal ámbar/ciruela y eclipse violeta. Ninguna ruta tiene verde de correcta y rojo de incorrecta.

## 3. Pantallas y zonas reemplazables
- Inicio: base y capas del mapa, emblema, avatar, imagen de capítulo.
- Lector: fondo640x360, retrato96x96, marco de retrato, caja de diálogo, burbuja de retorno, alternativas y foco. Nombres, texto, botones y cifras se dibujan en HTML; nunca se incrustan en una imagen.
- Resultado: mismo fondo con capa de rama, texto de consecuencia y marca de restauración.
- Crónica: tarjetas de capítulo, decisiones previas, retornos y registro de compromisos.
- Colección:20 motivos de memorias y5 reliquias, con sus variantes narrativas por texto.
- Perfil: guardián, compañero, juramento y símbolos de promesas.
- Epílogo:3 fondos de gobierno y resumen de5territorios con huellas conservadas.
- Ingreso, cuerpo entero, caminar y efectos extendidos quedan reservados. No implican que ya existan cuentas, combate o desplazamiento en este Atlas.

## 4. Contrato de reemplazo
El catálogo JSON es la fuente de verdad. Cada fila proporciona un ID, una ruta exacta y medidas. El renderer está en dist/asset-slots.js; la integración narrativa, en dist/narrative-ui.js. El mapa y la colección se conectan desde dist/atlas.js.
Para activar un archivo: entregar PNG en su ruta, comprobar dimensiones, cambiar status a ready en dist/visual-assets.json y ejecutar node scripts/sync-art-manifest.mjs. El catálogo JavaScript y la guía web se sincronizan desde ese JSON. No se cambia el ID ni se sustituye texto narrativo dentro del dibujo.
Los recursos conectados disponen de un punto de uso actual. Los reservados tienen contrato y ruta pero requieren implementar su consumidor futuro. No basta marcar ready para añadir desplazamiento o una nueva animación.
El modo /?arte=1 muestra contornos y etiquetas de ID; el alumnado no ve estos datos en la lectura normal. /direccion-arte/ permite filtrar prioridades, medidas, estado y uso.

## 5. Fondos y composición narrativa
640x360, relación16:9. Horizonte en tercio superior; evitar objetos esenciales en el20% inferior, que puede recortarse en tarjetas. Personajes futuros ocupan tercio izquierdo/derecho, nunca el centro del conflicto. La caja de texto se coloca fuera de la ilustración en móvil. Mantener primer plano, escena y fondo separados cuando aporte valor; no generar tres capas vacías por obligación.
El mismo lugar conserva geometría entre variantes. Las15capas de rama muestran pérdidas y cambios concretos. Una restauración no elimina la huella de documentos perdidos, dispersión, mantenimiento o disenso.

## 6. Mapa por capas
Lienzo global1000x700 para todos los PNG del mapa, con origen0,0 y sin recorte automático.
Orden: base → fase regional → intervención elegida → institución elegida → huella de coste → controles, rutas y etiquetas HTML/SVG.
Cada región tiene4fases: dormido, trazas, intervenido, restaurado. .1 produce trazas; .2 produce intervención; .4 completa restauración. Los códigos adelantados aumentan recompensas pero no simulan decisiones ni eliminan niebla de capítulos sin leer.
Posiciones centrales de referencia: bosque250,442; ciudad582,473; cumbres522,192; cristal801,306; eclipse228,187. Respetar las siluetas existentes de atlas-data.js. No dibujar nombres ni botones en las capas.
Las3intervenciones y3instituciones por territorio se componen como piezas. No pintar una campaña completa por cada combinación. La huella de .2 permanece sobre el mapa restaurado.

## 7. Personajes, retratos y expresiones
8personajes: Elia, Nara, Lúa, Oren, Sira, Iria, Dara y Aren. El catálogo incluye ropa, pelo y objeto reconocible por personaje. Estas son propuestas visuales para validar en la primera hoja de modelos.
6expresiones por personaje: neutral, atento, duda, preocupación, firmeza y alivio. Misma cara, encuadre, escala y vestuario en todas. No asignar sonrisa a respuesta correcta o ceño a respuesta incorrecta. El estado se elige por contexto dramático.
Retratos PNG96x96 RGBA. Ojos a y35 aproximada. Luz desde arriba a izquierda. Margen exterior4px, sin recortar cabello o accesorios. No generar hojas mezcladas con fondos opacos.
El guardián usa3apariencias iniciales de96x160. Nombre y juramento son independientes de su aspecto. La personalización modular extensa se reserva para después de validar estos tres modelos.

## 8. Burbujas y diálogos
Caja principal48x48 con corte12px por lado; centro discreto o transparente, borde de piedra/madera y oro desgastado. Burbuja32x32 con corte8px. Proporcionar colas arriba/izquierda/derecha solo si el encuadre lo requiere; el texto permanece en HTML.
Marcos de retrato112x112 con interior transparente; no tapar ojos y boca. Alternativas48x48 con corte12px y estados CSS normal, hover y foco; usar un solo recurso neutro. La confirmación muestra motivo y coste, permite volver y no revela efectos futuros.
Diálogo de unos2–3bloques cortos por pantalla. Relectura libre, tamaño legible, pausa sin temporizador, sonido voluntario. No implementar escritura letra a letra obligatoria.

## 9. Sprites y animación
Cuerpo de NPC: celda48x64, hoja192x128,4columnas×2filas. Fila0 idle; fila1 gesto.4cuadros cada animación,4fps. Pies x24,y60. No se mueve un personaje recortando una tira con anchos aproximados.
Guardián caminando: hoja192x256,4columnas×4filas; direcciones abajo, izquierda, derecha, arriba.4cuadros por dirección,6fps. Pivote de pies24,60. La caminata es P2reservada, no parte del lector actual.
Compañero: hoja128x32,4celdas32x32,4fps. Pivote16,16, sin sacudidas. Se reproduce solo este idle si hay PNG listo; con movimiento reducido, primer cuadro.
Efectos: hoja256x32,8celdas32x32,8fps, una repetición. Reservados. No usar flashes, vibraciones intensas ni un efecto distinto para catalogar moralmente elecciones.
Sin padding dentro de hojas. Exportación PNG sin suavizado, misma caja por cuadro. Mantener brazos, capa y objeto enteros dentro de cada celda. El catálogo detalla columnas, filas, FPS y pivotes.

## 10. Iconos, memorias y reliquias
Memorias64x64 con símbolo central y fondo transparente; el marco se entrega aparte. Reliquias48x48. Juramentos32x32. Compromisos24x24 junto a su etiqueta escrita. Mantener densidad similar entre rutas.
Los20motivos tienen igual nivel de acabado. La diferencia de elección se cuenta con texto y capas; no entregar una memoria bella a un camino y una silueta pobre al otro.
Experiencia, luz y amistad no son honor. Ningún símbolo significa “estudiante bueno”. La paleta y la música no sugieren una respuesta premiada.

## 11. Escalado, móvil y accesibilidad
Usar image-rendering:pixelated en imágenes, sin aplicarlo al texto. Evitar fracciones al ampliar retratos y sprites; preferir1x,2x,3x cuando el espacio lo permite. Los fondos pueden ajustarse al contenedor manteniendo proporción.
Móvil: retrato al lado del nombre o encima del diálogo, opciones en una columna, botones de44px como mínimo. Escena y texto no deben pelear por altura. Contraste de lectura mínimo4.5:1 como criterio de diseño a verificar en los PNG finales.
No representar información solo por color. Reduced motion congela hojas en cuadro0 y elimina transiciones. Alt de imágenes con contenido; decoración y duplicados con alt vacío.

## 12. Flujo de producción
P0: hoja modelo de Elia/Nara/guardián → fondo del prólogo →4fondos de bosque → marco de diálogo y retrato →4memorias de bosque → capas del mapa del bosque. Validar una escena en tablet y móvil antes de producir el resto.
P1: terminar personajes y expresiones, fondosC2–C5, memorias/reliquias, todos los desenlaces y capas. No posponer la ruta menos elegida.
P2: cuerpos completos, caminatas, efectos, ingreso y expansión de exploración. Cada recurso reservado necesita su propia integración y prueba.
La entrega incluye PNG, archivo editable fuente si existe, nombre estable y hoja de contacto para cotejar continuidad. No llamar final a un boceto ampliado con píxeles borrosos.

## 13. Plantillas de encargo
Fondo: “Pixel art original de RPG clásico detallado,640x360, [lugar], [objetos que anticipan el coste], paleta de Auralia, luz desde arriba a izquierda, horizonte alto, sin texto ni interfaz. Mantener composición compatible con [fondo anterior]”.
Retrato: “Busto original de [personaje],96x96 RGBA, [rasgos y ropa del catálogo], expresión [estado], misma pose y escala que referencia aprobada, ojos a y35, pixel art sin suavizado, sin marco ni texto”.
Hoja: crear desde el modelo aprobado, no regenerar caras en cada celda. Comprobar tamaño exacto y orden de cuadros; el generador de imágenes puede requerir edición manual para conseguir una hoja exacta.

## 14. Qué está aplicado y qué falta
Aplicado: contenido narrativo, decisiones, condiciones, retornos, registro de palabra, desenlaces, relectura, ecos aislados, puntos de reemplazo y catálogo.
Pendiente: producir y aprobar ilustraciones, conectar cuerpos completos o caminatas reservadas, ajustar diálogos con lectores del nivel elegido y construir cuentas/guardado remoto. El guardado actual es automático en este navegador con exportación/importación.
La guía narrativa permanece como documento de diseño original; este inventario especifica su traducción visual e integración.

## 15. Revisión antes de activar cada recurso
- [ ] ID, ruta y dimensiones coinciden con el catálogo.
- [ ] Alpha correcto, sin halo o fondo de tablero pintado.
- [ ] No hay texto horneado ni caras distintas entre expresiones.
- [ ] Pivote, encuadre y celda son constantes.
- [ ] Tres alternativas conservan calidad visual equivalente.
- [ ] La huella de pérdida sigue visible después de restaurar.
- [ ] Diálogo, foco y botones funcionan a390px, tablet y escritorio.
- [ ] Movimiento reducido muestra una imagen estable.
- [ ] Archivo ausente conserva el dibujo provisional y no rompe la lectura.
- [ ] Marcar ready solo después de revisar el PNG real.

## 16. Inventario exacto
"""
brief=brief.replace('Versión1','Versión 1').replace('4 de noviembre','4 de noviembre')
brief+='\nTotal: '+str(len(assets))+' archivos propuestos. Conectados: '+str(sum(a['integration']=='conectado' for a in assets))+'. Reservados: '+str(sum(a['integration']=='reservado' for a in assets))+'. Ningún PNG final producido en esta fase.\n\n'
brief+='| ID | Prioridad | Integración | Tamaño | Cuadros | Ruta |\n| --- | --- | --- | --- | --- | --- |\n'
for a in assets:brief+='| '+a['id']+' | '+a['priority']+' | '+a['integration']+' | '+str(a['width'])+'×'+str(a['height'])+' | '+str(a['frames'])+' | '+a['path']+' |\n'
head,table=brief.split('## 16. Inventario exacto',1)
brief=re.sub(r'(\d)([A-Za-zÁÉÍÓÚáéíóúñÑ]{2,})',r'\1 \2',head)+'## 16. Inventario exacto'+table
(ROOT/'docs/GUIA_ARTE_ATLAS.md').write_text(brief)
(OUT/'direccion-arte/Guia_Arte_Atlas_v1.md').write_text(brief)
(ROOT/'docs/CATALOGO_ARTE.csv').write_text((OUT/'direccion-arte/catalogo-recursos.csv').read_text())
print(json.dumps({'assets':len(assets),'connected':sum(a['integration']=='conectado' for a in assets),'reserved':sum(a['integration']=='reservado' for a in assets)}))
