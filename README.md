# Ecos de Auralia

**Prototipo 0.1 · El primer recuerdo**

Una aventura educativa original de exploración, acertijos y descubrimiento. Cada estudiante recupera los recuerdos de un reino y obtiene herramientas que le permiten abrir caminos nuevos, incluso en lugares que ya conoce.

Creado para Nicolás Espinoza / GamiAula. La dirección visual combina bosques ilustrados, piedra antigua, verdes profundos y detalles dorados. Los escenarios y personajes se dibujan en Canvas; el sonido se sintetiza en el navegador. No requiere recursos externos para funcionar.

## Jugar y revisar

- [Abrir el prototipo](https://ecos-de-auralia.nico-ergo.chatgpt.site)
- Desde la portada: **Descubrir la propuesta para el aula**.
- Durante la partida: menú → **El aula**.
- El panel incluye el vínculo pedagógico, los códigos y dos accesos rápidos para revisar escenas. Los accesos rápidos adelantan el progreso de la partida local.

## Qué se puede jugar

1. Recorrer la aldea de Valdeluz y conversar con Elia y Nara.
2. Obtener la Campana Agrietada y escuchar pistas del pasado.
3. Canjear un sello para acceder al Bosque de los Susurros.
4. Interpretar el altar y encontrar el Guante de Raíces.
5. Usar esa habilidad para abrir el camino al santuario.
6. Activar el segundo sello y recorrer cuatro salas conectadas.
7. Alinear tres cristales e interpretar el recuerdo de una estatua.
8. Enfrentar a un guardián con embestida anticipada y un núcleo vulnerable.
9. Recuperar el Eco del Bosque, ver el paisaje restaurado y volver a escuchar la fuente.
10. Regresar al jardín bloqueado de la aldea para descubrir una carta secreta.

Los otros cuatro territorios aparecen en el atlas como una propuesta futura; no son zonas jugables en esta versión.

## Puente con el aula

**Actividad presencial o virtual → sello entregado por el docente → acceso a una expedición → exploración y acertijos → reliquia / restauración del mundo.**

| Sello de prueba | Qué habilita | Ejemplo de actividad previa |
| --- | --- | --- |
| `AURALIA-INICIO` | Acceso al bosque, después de conversar con Elia | Observación, lectura, investigación o argumentación |
| `AURALIA-RAICES` | Activación del pedestal del santuario | Aplicación, creación o resolución de un desafío |

Los códigos son públicos y tienen un propósito de demostración. No autentican personas, no verifican una entrega y no impiden que se compartan. El docente decide los criterios pedagógicos; un registro real requeriría una segunda etapa con servidor y cuentas.

## Controles

| Acción | Computador | Pantalla táctil |
| --- | --- | --- |
| Caminar | WASD / flechas / clic en el suelo | Palanca o toque en el suelo |
| Interactuar | E / clic en el objeto | Botón Interactuar / toque en el objeto |
| Escuchar el pasado | Q | Botón Eco |
| Atacar | J | Botón Atacar |
| Esquivar | Espacio | Botón Esquivar |
| Atlas | M / botón Atlas | Botón Atlas |
| Pausa y opciones | Esc / menú | Menú |

El sonido se activa de forma voluntaria. Las opciones permiten reducir las partículas y el movimiento ambiental. La navegación por menús admite teclado y los diálogos contienen el foco. El mundo jugable en Canvas requiere visión e interacción motora; todavía no dispone de una alternativa completa para lector de pantalla.

## Guardado y alcance

- Una partida por navegador/origen, almacenada en `localStorage` bajo `auralia.adventure.v1`.
- Guarda posición, salud, sellos, reliquias, acertijos, enemigos menores derrotados y restauración.
- El guardado ocurre al progresar, cada pocos segundos de movimiento y al ocultar/salir de la página.
- Si se agota la salud, se vuelve al inicio de la zona conservando los hallazgos.
- La batalla del guardián reinicia su salud al recargar; su derrota sí queda guardada.
- El menú permite empezar otra historia y avisa que reemplaza la partida local.
- No hay cuentas, sincronización, Google Sheets, datos de evaluación ni panel de seguimiento conectados.
- Los datos locales del enlace de revisión y de una futura publicación en otro dominio son partidas separadas.

## Archivos

| Archivo | Función |
| --- | --- |
| `dist/index.html` | Interfaz, portada y controles |
| `dist/styles.css` | Diseño y adaptación a pantallas |
| `dist/game-data.js` | Territorios, escenas, códigos, textos y misiones |
| `dist/engine.js` | Reglas, colisiones, movimiento, rutas, progresión y recuperación del guardado |
| `dist/art.js` | Escenarios, personajes, efectos y cámara |
| `dist/audio.js` | Ambiente y sonidos originales sintetizados |
| `dist/game.js` | Interacciones, menús, combate y bucle de juego |
| `docs/PROPUESTA.md` | Propuesta pedagógica, narrativa y próximas decisiones |
| `tests/progression.test.mjs` | Pruebas de reglas, guardado, bloqueos y conectividad |

## Ejecutar y comprobar

No hay dependencias ni compilación.

```sh
python3 -m http.server 8000 --directory dist
```

Abrir `http://localhost:8000`. Los módulos requieren servir los archivos mediante HTTP; abrir el HTML con `file://` no es el flujo soportado.

```sh
npm run check
npm test
```

El `index.html` de la raíz redirige a `dist/` para que también se pueda servir la raíz del repositorio. La configuración de publicación de Sites se encuentra en `.openai/hosting.json`. Se entrega un prototipo para revisión; una implementación con estudiantes requiere decidir autenticación, registro docente y acceso de publicación.
