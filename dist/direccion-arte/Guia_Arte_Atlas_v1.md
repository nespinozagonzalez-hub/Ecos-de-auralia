# Atlas de Ecos / Guía de arte y sustitución
Versión 1.0 · 4 de noviembre de 2026 · Fase: integración narrativa, arte pendiente.

## 1. Alcance aprobado
RPG antiguo en pixel art detallado, cálido, luminoso y de autoría propia. La interfaz actual se conserva como soporte funcional. No se han producido los PNG finales. Las expresiones, ilustraciones y animaciones aquí definidas son encargos concretos para la siguiente etapa. La expedición se conserva aparte y el movimiento de mundo no se requiere para el Atlas.

## 2. Dirección de arte
Pixel visible y deliberado, siluetas limpias, agrupación de píxeles, luz ambiental suave sin degradado borroso. Fondos de640x360 y retratos de96x96 permiten detalle sin perder lectura. Evocar los RPG de16/32 bits con mayor riqueza ambiental; crear vestuario, arquitectura, símbolos y personajes originales. No reproducir personajes o interfaz de Zelda.
Paleta común: tinta #153A36, sombra #203B48, piedra #738779, pergamino #E6D7 AE, oro envejecido #C6A46A, terracota #B97760, luz #D9E5B1. Acentos: bosque salvia, ciudad petróleo, cumbres azul gris, cristal ámbar/ciruela y eclipse violeta. Ninguna ruta tiene verde de correcta y rojo de incorrecta.

## 3. Pantallas y zonas reemplazables
- Inicio: base y capas del mapa, emblema, avatar, imagen de capítulo.
- Lector: fondo640x360, retrato96x96, marco de retrato, caja de diálogo, burbuja de retorno, alternativas y foco. Nombres, texto, botones y cifras se dibujan en HTML; nunca se incrustan en una imagen.
- Resultado: mismo fondo con capa de rama, texto de consecuencia y marca de restauración.
- Crónica: tarjetas de capítulo, decisiones previas, retornos y registro de compromisos.
- Colección:20 motivos de memorias y5 reliquias, con sus variantes narrativas por texto.
- Perfil: guardián, compañero, juramento y símbolos de promesas.
- Epílogo:3 fondos de gobierno y resumen de5 territorios con huellas conservadas.
- Ingreso, cuerpo entero, caminar y efectos extendidos quedan reservados. No implican que ya existan cuentas, combate o desplazamiento en este Atlas.

## 4. Contrato de reemplazo
El catálogo JSON es la fuente de verdad. Cada fila proporciona un ID, una ruta exacta y medidas. El renderer está en dist/asset-slots.js; la integración narrativa, en dist/narrative-ui.js. El mapa y la colección se conectan desde dist/atlas.js.
Para activar un archivo: entregar PNG en su ruta, comprobar dimensiones, cambiar status a ready en dist/visual-assets.json y ejecutar node scripts/sync-art-manifest.mjs. El catálogo JavaScript y la guía web se sincronizan desde ese JSON. No se cambia el ID ni se sustituye texto narrativo dentro del dibujo.
Los recursos conectados disponen de un punto de uso actual. Los reservados tienen contrato y ruta pero requieren implementar su consumidor futuro. No basta marcar ready para añadir desplazamiento o una nueva animación.
El modo /?arte=1 muestra contornos y etiquetas de ID; el alumnado no ve estos datos en la lectura normal. /direccion-arte/ permite filtrar prioridades, medidas, estado y uso.

## 5. Fondos y composición narrativa
640x360, relación16:9. Horizonte en tercio superior; evitar objetos esenciales en el20% inferior, que puede recortarse en tarjetas. Personajes futuros ocupan tercio izquierdo/derecho, nunca el centro del conflicto. La caja de texto se coloca fuera de la ilustración en móvil. Mantener primer plano, escena y fondo separados cuando aporte valor; no generar tres capas vacías por obligación.
El mismo lugar conserva geometría entre variantes. Las15 capas de rama muestran pérdidas y cambios concretos. Una restauración no elimina la huella de documentos perdidos, dispersión, mantenimiento o disenso.

## 6. Mapa por capas
Lienzo global1000x700 para todos los PNG del mapa, con origen0,0 y sin recorte automático.
Orden: base → fase regional → intervención elegida → institución elegida → huella de coste → controles, rutas y etiquetas HTML/SVG.
Cada región tiene4 fases: dormido, trazas, intervenido, restaurado. .1 produce trazas; .2 produce intervención; .4 completa restauración. Los códigos adelantados aumentan recompensas pero no simulan decisiones ni eliminan niebla de capítulos sin leer.
Posiciones centrales de referencia: bosque250,442; ciudad582,473; cumbres522,192; cristal801,306; eclipse228,187. Respetar las siluetas existentes de atlas-data.js. No dibujar nombres ni botones en las capas.
Las3 intervenciones y3 instituciones por territorio se componen como piezas. No pintar una campaña completa por cada combinación. La huella de .2 permanece sobre el mapa restaurado.

## 7. Personajes, retratos y expresiones
8 personajes: Elia, Nara, Lúa, Oren, Sira, Iria, Dara y Aren. El catálogo incluye ropa, pelo y objeto reconocible por personaje. Estas son propuestas visuales para validar en la primera hoja de modelos.
6 expresiones por personaje: neutral, atento, duda, preocupación, firmeza y alivio. Misma cara, encuadre, escala y vestuario en todas. No asignar sonrisa a respuesta correcta o ceño a respuesta incorrecta. El estado se elige por contexto dramático.
Retratos PNG96x96 RGBA. Ojos a y35 aproximada. Luz desde arriba a izquierda. Margen exterior4 px, sin recortar cabello o accesorios. No generar hojas mezcladas con fondos opacos.
El guardián usa3 apariencias iniciales de96x160. Nombre y juramento son independientes de su aspecto. La personalización modular extensa se reserva para después de validar estos tres modelos.

## 8. Burbujas y diálogos
Caja principal48x48 con corte12 px por lado; centro discreto o transparente, borde de piedra/madera y oro desgastado. Burbuja32x32 con corte8 px. Proporcionar colas arriba/izquierda/derecha solo si el encuadre lo requiere; el texto permanece en HTML.
Marcos de retrato112x112 con interior transparente; no tapar ojos y boca. Alternativas48x48 con corte12 px y estados CSS normal, hover y foco; usar un solo recurso neutro. La confirmación muestra motivo y coste, permite volver y no revela efectos futuros.
Diálogo de unos2–3 bloques cortos por pantalla. Relectura libre, tamaño legible, pausa sin temporizador, sonido voluntario. No implementar escritura letra a letra obligatoria.

## 9. Sprites y animación
Cuerpo de NPC: celda48x64, hoja192x128,4 columnas×2 filas. Fila0 idle; fila1 gesto.4 cuadros cada animación,4 fps. Pies x24,y60. No se mueve un personaje recortando una tira con anchos aproximados.
Guardián caminando: hoja192x256,4 columnas×4 filas; direcciones abajo, izquierda, derecha, arriba.4 cuadros por dirección,6 fps. Pivote de pies24,60. La caminata es P2 reservada, no parte del lector actual.
Compañero: hoja128x32,4 celdas32x32,4 fps. Pivote16,16, sin sacudidas. Se reproduce solo este idle si hay PNG listo; con movimiento reducido, primer cuadro.
Efectos: hoja256x32,8 celdas32x32,8 fps, una repetición. Reservados. No usar flashes, vibraciones intensas ni un efecto distinto para catalogar moralmente elecciones.
Sin padding dentro de hojas. Exportación PNG sin suavizado, misma caja por cuadro. Mantener brazos, capa y objeto enteros dentro de cada celda. El catálogo detalla columnas, filas, FPS y pivotes.

## 10. Iconos, memorias y reliquias
Memorias64x64 con símbolo central y fondo transparente; el marco se entrega aparte. Reliquias48x48. Juramentos32x32. Compromisos24x24 junto a su etiqueta escrita. Mantener densidad similar entre rutas.
Los20 motivos tienen igual nivel de acabado. La diferencia de elección se cuenta con texto y capas; no entregar una memoria bella a un camino y una silueta pobre al otro.
Experiencia, luz y amistad no son honor. Ningún símbolo significa “estudiante bueno”. La paleta y la música no sugieren una respuesta premiada.

## 11. Escalado, móvil y accesibilidad
Usar image-rendering:pixelated en imágenes, sin aplicarlo al texto. Evitar fracciones al ampliar retratos y sprites; preferir1x,2x,3x cuando el espacio lo permite. Los fondos pueden ajustarse al contenedor manteniendo proporción.
Móvil: retrato al lado del nombre o encima del diálogo, opciones en una columna, botones de44 px como mínimo. Escena y texto no deben pelear por altura. Contraste de lectura mínimo4.5:1 como criterio de diseño a verificar en los PNG finales.
No representar información solo por color. Reduced motion congela hojas en cuadro0 y elimina transiciones. Alt de imágenes con contenido; decoración y duplicados con alt vacío.

## 12. Flujo de producción
P0: hoja modelo de Elia/Nara/guardián → fondo del prólogo →4 fondos de bosque → marco de diálogo y retrato →4 memorias de bosque → capas del mapa del bosque. Validar una escena en tablet y móvil antes de producir el resto.
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
- [ ] Diálogo, foco y botones funcionan a390 px, tablet y escritorio.
- [ ] Movimiento reducido muestra una imagen estable.
- [ ] Archivo ausente conserva el dibujo provisional y no rompe la lectura.
- [ ] Marcar ready solo después de revisar el PNG real.

## 16. Inventario exacto

Total: 250 archivos propuestos. Conectados: 227. Reservados: 23. Ningún PNG final producido en esta fase.

| ID | Prioridad | Integración | Tamaño | Cuadros | Ruta |
| --- | --- | --- | --- | --- | --- |
| map-base | P0 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-base.png |
| map-bosque-dormido | P0 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-dormido.png |
| map-bosque-trazas | P0 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-trazas.png |
| map-bosque-intervenido | P0 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-intervenido.png |
| map-bosque-restaurado | P0 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-restaurado.png |
| map-bosque-intervencion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-intervencion-A.png |
| map-bosque-intervencion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-intervencion-B.png |
| map-bosque-intervencion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-intervencion-C.png |
| map-bosque-institucion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-institucion-A.png |
| map-bosque-institucion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-institucion-B.png |
| map-bosque-institucion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-institucion-C.png |
| map-bosque-huella-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-huella-A.png |
| map-bosque-huella-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-huella-B.png |
| map-bosque-huella-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-bosque-huella-C.png |
| map-marea-dormido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-dormido.png |
| map-marea-trazas | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-trazas.png |
| map-marea-intervenido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-intervenido.png |
| map-marea-restaurado | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-restaurado.png |
| map-marea-intervencion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-intervencion-A.png |
| map-marea-intervencion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-intervencion-B.png |
| map-marea-intervencion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-intervencion-C.png |
| map-marea-institucion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-institucion-A.png |
| map-marea-institucion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-institucion-B.png |
| map-marea-institucion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-institucion-C.png |
| map-marea-huella-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-huella-A.png |
| map-marea-huella-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-huella-B.png |
| map-marea-huella-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-marea-huella-C.png |
| map-cumbres-dormido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-dormido.png |
| map-cumbres-trazas | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-trazas.png |
| map-cumbres-intervenido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-intervenido.png |
| map-cumbres-restaurado | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-restaurado.png |
| map-cumbres-intervencion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-intervencion-A.png |
| map-cumbres-intervencion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-intervencion-B.png |
| map-cumbres-intervencion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-intervencion-C.png |
| map-cumbres-institucion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-institucion-A.png |
| map-cumbres-institucion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-institucion-B.png |
| map-cumbres-institucion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-institucion-C.png |
| map-cumbres-huella-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-huella-A.png |
| map-cumbres-huella-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-huella-B.png |
| map-cumbres-huella-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cumbres-huella-C.png |
| map-cristal-dormido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-dormido.png |
| map-cristal-trazas | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-trazas.png |
| map-cristal-intervenido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-intervenido.png |
| map-cristal-restaurado | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-restaurado.png |
| map-cristal-intervencion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-intervencion-A.png |
| map-cristal-intervencion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-intervencion-B.png |
| map-cristal-intervencion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-intervencion-C.png |
| map-cristal-institucion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-institucion-A.png |
| map-cristal-institucion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-institucion-B.png |
| map-cristal-institucion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-institucion-C.png |
| map-cristal-huella-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-huella-A.png |
| map-cristal-huella-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-huella-B.png |
| map-cristal-huella-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-cristal-huella-C.png |
| map-eclipse-dormido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-dormido.png |
| map-eclipse-trazas | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-trazas.png |
| map-eclipse-intervenido | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-intervenido.png |
| map-eclipse-restaurado | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-restaurado.png |
| map-eclipse-intervencion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-intervencion-A.png |
| map-eclipse-intervencion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-intervencion-B.png |
| map-eclipse-intervencion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-intervencion-C.png |
| map-eclipse-institucion-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-institucion-A.png |
| map-eclipse-institucion-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-institucion-B.png |
| map-eclipse-institucion-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-institucion-C.png |
| map-eclipse-huella-A | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-huella-A.png |
| map-eclipse-huella-B | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-huella-B.png |
| map-eclipse-huella-C | P1 | conectado | 1000×700 | 1 | assets/atlas/mapa/map-eclipse-huella-C.png |
| bg-prologo | P0 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-prologo.png |
| bg-bosque-1 | P0 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-bosque-1.png |
| bg-bosque-2 | P0 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-bosque-2.png |
| bg-bosque-3 | P0 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-bosque-3.png |
| bg-bosque-4 | P0 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-bosque-4.png |
| scene-bosque-rama-A | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-bosque-rama-A.png |
| scene-bosque-rama-B | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-bosque-rama-B.png |
| scene-bosque-rama-C | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-bosque-rama-C.png |
| bg-marea-1 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-marea-1.png |
| bg-marea-2 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-marea-2.png |
| bg-marea-3 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-marea-3.png |
| bg-marea-4 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-marea-4.png |
| scene-marea-rama-A | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-marea-rama-A.png |
| scene-marea-rama-B | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-marea-rama-B.png |
| scene-marea-rama-C | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-marea-rama-C.png |
| bg-cumbres-1 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cumbres-1.png |
| bg-cumbres-2 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cumbres-2.png |
| bg-cumbres-3 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cumbres-3.png |
| bg-cumbres-4 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cumbres-4.png |
| scene-cumbres-rama-A | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cumbres-rama-A.png |
| scene-cumbres-rama-B | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cumbres-rama-B.png |
| scene-cumbres-rama-C | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cumbres-rama-C.png |
| bg-cristal-1 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cristal-1.png |
| bg-cristal-2 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cristal-2.png |
| bg-cristal-3 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cristal-3.png |
| bg-cristal-4 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-cristal-4.png |
| scene-cristal-rama-A | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cristal-rama-A.png |
| scene-cristal-rama-B | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cristal-rama-B.png |
| scene-cristal-rama-C | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-cristal-rama-C.png |
| bg-eclipse-1 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-eclipse-1.png |
| bg-eclipse-2 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-eclipse-2.png |
| bg-eclipse-3 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-eclipse-3.png |
| bg-eclipse-4 | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-eclipse-4.png |
| scene-eclipse-rama-A | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-eclipse-rama-A.png |
| scene-eclipse-rama-B | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-eclipse-rama-B.png |
| scene-eclipse-rama-C | P1 | conectado | 640×360 | 1 | assets/atlas/capas/scene-eclipse-rama-C.png |
| bg-final-custodia | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-final-custodia.png |
| bg-final-llaves | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-final-llaves.png |
| bg-final-relevo | P1 | conectado | 640×360 | 1 | assets/atlas/fondos/bg-final-relevo.png |
| portrait-elia-neutral | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-neutral.png |
| portrait-elia-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-atento.png |
| portrait-elia-duda | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-duda.png |
| portrait-elia-preocupacion | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-preocupacion.png |
| portrait-elia-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-firme.png |
| portrait-elia-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-elia-alivio.png |
| actor-elia-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-elia-gestos.png |
| portrait-nara-neutral | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-neutral.png |
| portrait-nara-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-atento.png |
| portrait-nara-duda | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-duda.png |
| portrait-nara-preocupacion | P0 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-preocupacion.png |
| portrait-nara-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-firme.png |
| portrait-nara-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-nara-alivio.png |
| actor-nara-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-nara-gestos.png |
| portrait-lua-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-neutral.png |
| portrait-lua-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-atento.png |
| portrait-lua-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-duda.png |
| portrait-lua-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-preocupacion.png |
| portrait-lua-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-firme.png |
| portrait-lua-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-lua-alivio.png |
| actor-lua-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-lua-gestos.png |
| portrait-oren-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-neutral.png |
| portrait-oren-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-atento.png |
| portrait-oren-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-duda.png |
| portrait-oren-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-preocupacion.png |
| portrait-oren-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-firme.png |
| portrait-oren-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-oren-alivio.png |
| actor-oren-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-oren-gestos.png |
| portrait-sira-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-neutral.png |
| portrait-sira-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-atento.png |
| portrait-sira-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-duda.png |
| portrait-sira-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-preocupacion.png |
| portrait-sira-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-firme.png |
| portrait-sira-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-sira-alivio.png |
| actor-sira-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-sira-gestos.png |
| portrait-iria-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-neutral.png |
| portrait-iria-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-atento.png |
| portrait-iria-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-duda.png |
| portrait-iria-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-preocupacion.png |
| portrait-iria-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-firme.png |
| portrait-iria-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-iria-alivio.png |
| actor-iria-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-iria-gestos.png |
| portrait-dara-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-neutral.png |
| portrait-dara-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-atento.png |
| portrait-dara-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-duda.png |
| portrait-dara-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-preocupacion.png |
| portrait-dara-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-firme.png |
| portrait-dara-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-dara-alivio.png |
| actor-dara-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-dara-gestos.png |
| portrait-aren-neutral | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-neutral.png |
| portrait-aren-atento | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-atento.png |
| portrait-aren-duda | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-duda.png |
| portrait-aren-preocupacion | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-preocupacion.png |
| portrait-aren-firme | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-firme.png |
| portrait-aren-alivio | P1 | conectado | 96×96 | 1 | assets/atlas/retratos/portrait-aren-alivio.png |
| actor-aren-gestos | P2 | reservado | 192×128 | 8 | assets/atlas/actores/actor-aren-gestos.png |
| guardian-bosque | P0 | conectado | 96×160 | 1 | assets/atlas/guardian/guardian-bosque.png |
| guardian-bosque-caminar | P2 | reservado | 192×256 | 16 | assets/atlas/actores/guardian-bosque-caminar.png |
| guardian-marea | P0 | conectado | 96×160 | 1 | assets/atlas/guardian/guardian-marea.png |
| guardian-marea-caminar | P2 | reservado | 192×256 | 16 | assets/atlas/actores/guardian-marea-caminar.png |
| guardian-sol | P0 | conectado | 96×160 | 1 | assets/atlas/guardian/guardian-sol.png |
| guardian-sol-caminar | P2 | reservado | 192×256 | 16 | assets/atlas/actores/guardian-sol-caminar.png |
| companion-chispa | P1 | conectado | 128×32 | 4 | assets/atlas/companero/companion-chispa.png |
| companion-lumen | P1 | conectado | 128×32 | 4 | assets/atlas/companero/companion-lumen.png |
| companion-astral | P1 | conectado | 128×32 | 4 | assets/atlas/companero/companion-astral.png |
| memory-bosque-1 | P0 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-bosque-1.png |
| memory-bosque-2 | P0 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-bosque-2.png |
| memory-bosque-3 | P0 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-bosque-3.png |
| memory-bosque-4 | P0 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-bosque-4.png |
| relic-bosque | P1 | conectado | 48×48 | 1 | assets/atlas/reliquias/relic-bosque.png |
| memory-marea-1 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-marea-1.png |
| memory-marea-2 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-marea-2.png |
| memory-marea-3 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-marea-3.png |
| memory-marea-4 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-marea-4.png |
| relic-marea | P1 | conectado | 48×48 | 1 | assets/atlas/reliquias/relic-marea.png |
| memory-cumbres-1 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cumbres-1.png |
| memory-cumbres-2 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cumbres-2.png |
| memory-cumbres-3 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cumbres-3.png |
| memory-cumbres-4 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cumbres-4.png |
| relic-cumbres | P1 | conectado | 48×48 | 1 | assets/atlas/reliquias/relic-cumbres.png |
| memory-cristal-1 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cristal-1.png |
| memory-cristal-2 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cristal-2.png |
| memory-cristal-3 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cristal-3.png |
| memory-cristal-4 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-cristal-4.png |
| relic-cristal | P1 | conectado | 48×48 | 1 | assets/atlas/reliquias/relic-cristal.png |
| memory-eclipse-1 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-eclipse-1.png |
| memory-eclipse-2 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-eclipse-2.png |
| memory-eclipse-3 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-eclipse-3.png |
| memory-eclipse-4 | P1 | conectado | 64×64 | 1 | assets/atlas/memorias/memory-eclipse-4.png |
| relic-eclipse | P1 | conectado | 48×48 | 1 | assets/atlas/reliquias/relic-eclipse.png |
| oath-amparo | P1 | conectado | 32×32 | 1 | assets/atlas/simbolos/oath-amparo.png |
| oath-memoria | P1 | conectado | 32×32 | 1 | assets/atlas/simbolos/oath-memoria.png |
| oath-vinculo | P1 | conectado | 32×32 | 1 | assets/atlas/simbolos/oath-vinculo.png |
| commitment-vigente | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-vigente.png |
| commitment-sostenido | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-sostenido.png |
| commitment-en_tension | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-en_tension.png |
| commitment-renegociado | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-renegociado.png |
| commitment-pendiente | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-pendiente.png |
| commitment-reparado | P1 | conectado | 24×24 | 1 | assets/atlas/simbolos/commitment-reparado.png |
| ui-emblem | P1 | conectado | 64×64 | 1 | assets/atlas/interfaz/ui-emblem.png |
| ui-dialogue | P0 | conectado | 48×48 | 1 | assets/atlas/interfaz/ui-dialogue.png |
| ui-bubble | P0 | conectado | 32×32 | 1 | assets/atlas/interfaz/ui-bubble.png |
| ui-choice | P0 | conectado | 48×48 | 1 | assets/atlas/interfaz/ui-choice.png |
| ui-memory | P1 | conectado | 32×32 | 1 | assets/atlas/interfaz/ui-memory.png |
| ui-portrait | P0 | conectado | 112×112 | 1 | assets/atlas/interfaz/ui-portrait.png |
| ui-cursor | P1 | reservado | 16×16 | 1 | assets/atlas/interfaz/ui-cursor.png |
| ui-tooltip | P1 | reservado | 24×24 | 1 | assets/atlas/interfaz/ui-tooltip.png |
| ui-toast | P1 | reservado | 32×32 | 1 | assets/atlas/interfaz/ui-toast.png |
| ui-tabs | P1 | reservado | 24×24 | 1 | assets/atlas/interfaz/ui-tabs.png |
| ui-seal | P1 | reservado | 32×32 | 1 | assets/atlas/interfaz/ui-seal.png |
| ui-cover | P1 | reservado | 320×400 | 1 | assets/atlas/interfaz/ui-cover.png |
| fx-page | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-page.png |
| fx-seal | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-seal.png |
| fx-memory | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-memory.png |
| fx-restore | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-restore.png |
| fx-echo | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-echo.png |
| fx-light | P2 | reservado | 256×32 | 8 | assets/atlas/efectos/fx-light.png |
| icon-compass | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-compass.png |
| icon-book | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-book.png |
| icon-leaf | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-leaf.png |
| icon-seal | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-seal.png |
| icon-spark | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-spark.png |
| icon-grid | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-grid.png |
| icon-person | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-person.png |
| icon-sword | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-sword.png |
| icon-arrow | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-arrow.png |
| icon-back | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-back.png |
| icon-light | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-light.png |
| icon-water | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-water.png |
| icon-wind | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-wind.png |
| icon-crystal | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-crystal.png |
| icon-moon | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-moon.png |
| icon-home | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-home.png |
| icon-bridge | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-bridge.png |
| icon-echo | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-echo.png |
| icon-lock | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-lock.png |
| icon-check | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-check.png |
| icon-close | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-close.png |
| icon-help | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-help.png |
| icon-feather | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-feather.png |
| icon-download | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-download.png |
| icon-upload | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-upload.png |
| icon-settings | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-settings.png |
| icon-bell | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-bell.png |
| icon-root | P1 | conectado | 24×24 | 1 | assets/atlas/iconos/icon-root.png |
