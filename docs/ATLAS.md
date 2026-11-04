# Atlas de Ecos · Modelo del núcleo

## Dos experiencias con propósitos propios

El Atlas es el lugar al que el estudiante puede volver a lo largo de una unidad o de un año. Conserva su colección, las recompensas, las decisiones y la transformación del mundo. Las expediciones son aventuras concretas: explorar, enfrentar enemigos o resolver misiones añade hallazgos al Atlas.

La distinción se refleja en rutas, interfaces y guardados separados. El Atlas funciona con las actividades del aula aunque no se juegue el prototipo cenital. La expedición puede explorarse y conservar su partida sin depender de haber completado los cinco capítulos del Atlas.

## Reglas de progresión

Cada territorio contiene cuatro misiones, asociables a actividades de exploración, comprensión, aplicación y creación. Son sugerencias transversales; el docente debe alinearlas a los objetivos curriculares que decida trabajar.

| Misión | Experiencia | Luz | Colección |
| --- | --- | --- | --- |
| 1 | 40 | 12 | Una memoria |
| 2 | 50 | 16 | Una memoria |
| 3 | 70 | 22 | Una memoria |
| 4 | 90 | 30 | Una memoria |
| Restaurar territorio | 50 adicionales | 25 adicionales | Reliquia y capítulo restaurado |

Dos memorias permiten elegir uno de dos futuros. Cuatro memorias y esa decisión restauran el territorio y abren el siguiente. Las misiones pueden completarse en cualquier orden dentro del territorio abierto. Un código de una región dormida se rechaza sin consumirlo. No hay recompensa por repetir códigos o releer escenas.

Los totales de experiencia y luz se calculan a partir de hechos únicos registrados, no de incrementos que puedan repetirse al volver a abrir una pantalla. Las compras cosméticas descuentan luz una sola vez. No hay objetos obligatorios de pago para avanzar.

## Decisiones y huellas

| Territorio | Futuro A | Futuro B |
| --- | --- | --- |
| Bosque de los Susurros | Refugio de las Raíces | Archivo de las Hojas |
| Ciudad Sumergida | Puentes del Encuentro | Jardines de la Marea |
| Cumbres del Viento | Faro de las Cumbres | Refugio del Viento |
| Desierto de Cristal | Observatorio de Cristal | Taller de los Reflejos |
| Ciudad del Eclipse | Reino de las Voces | Reino de los Caminos |

Las elecciones tienen igual valor de recompensa. Cambian el hito del mapa, la ilustración y el desenlace, quedan registradas en la crónica y se mencionan al llegar al siguiente capítulo. Una vez tomadas, no se sustituyen desde el juego normal.

La versión implementada contiene una bifurcación local por capítulo. No simula todavía todas las combinaciones posibles en una trama global distinta: las consecuencias son lugares, imágenes, recuerdos y referencias persistentes. Esto permite evaluar si la toma de decisiones resulta significativa antes de ampliar el árbol narrativo.

## Personalización

La experiencia abre ocho niveles y tres formas de un compañero de luz. El nombre y las tres apariencias del guardián se pueden cambiar sin gastar recursos. Tres acabados adicionales de la tableta cuestan 60, 110 y 180 de luz. Son recompensas visuales y no modifican la evaluación académica ni la dificultad de la expedición.

## Integración de expediciones

El puente inicial lee el guardado local existente mediante la validación del motor original. El Guante de Raíces y la semilla producen eventos únicos; recuperar el Eco completa la misión `bosque-3`. Si esa misión ya se consiguió con un código de actividad, no se duplica.

La integración es de expedición a Atlas y requiere el mismo navegador y origen. Una futura expedición debería entregar identificadores estables de hallazgo y misión. Para cuentas compartidas o distintos dispositivos, el registro debe realizarse en un servidor asociado al estudiante; un código en el cliente no ofrece esa verificación.

## Consignas y copias

La guía docente permite adaptar el nombre y la consigna de cada misión sin cambiar su identificador, código ni recompensa. Es una configuración local, no una herramienta compartida de gestión de curso. Una exportación JSON conserva progreso y configuración del Atlas; no incluye la partida cenital.

Al importar, se reconstruyen los totales, se filtran identificadores desconocidos y se descartan compras o progresos incoherentes con los territorios abiertos. Esto evita errores de formato; no convierte un archivo local en prueba de aprendizaje.

## Siguiente etapa de producto

Probar la relación entre actividades, códigos y decisiones con una unidad concreta. A partir del piloto, decidir cuentas, guardado remoto, panel docente por curso, distribución de consignas y un segundo encuentro de exploración. La versión actual permite revisar el núcleo completo sin comprometer esas decisiones de infraestructura.
