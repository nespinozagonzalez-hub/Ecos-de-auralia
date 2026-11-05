# Ecos de Auralia · Atlas de Ecos
Prototipo 0.3 · Las voces del Velo. Integración narrativa previa a producir el arte final.

[Abrir el Atlas](https://ecos-de-auralia.nico-ergo.chatgpt.site) · [Catálogo de arte](https://ecos-de-auralia.nico-ergo.chatgpt.site/direccion-arte/)

## Recorrido aplicado
Dos decisiones de prólogo, cinco capítulos de cuatro decisiones, 66 alternativas y tres familias de epílogo. La novela conserva motivos, costes, hechos, compromisos, conocimiento por actor y retornos posteriores. Las decisiones confirmadas no se reescriben; al cerrar un capítulo se puede explorar un eco alterno aislado.

Los veinte sellos conceden memoria, experiencia y luz. Se pueden registrar por adelantado; la lectura sigue su orden y requiere la memoria correspondiente. Todas las rutas conservan 1.500 experiencia y 525 luz base. No hay puntuación universal de bondad ni recompensas académicas por una elección moral.

El honor conserva compromisos concretos. Las revisiones registran excepciones y disenso; no borran documentos perdidos, reservas o costes. La confianza cambia para actores presentes que conocen el hecho. La crónica conserva retornos y seis cruces de consecuencias.

## Aventura primero
Dentro del juego todo es aventura: misiones del Velo (Rastro, Enigma, Travesía, Ofrenda), sellos que se rompen, una compañía, hazañas y títulos. No aparecen clases, cursos ni actividades: la parte formativa la conecta el guía fuera del juego, para cualquier edad o contexto.

## Usar con un grupo
**Ayuda → Herramientas del guía** (o `?guia`) → **Crear un grupo** genera 20 sellos privados y un enlace. Un Atlas unido a la compañía solo acepta esos sellos, verifica cada memoria guardada y oculta los accesos rápidos. Detalles, hazañas y límites en [Sellos del Atlas](docs/CODIGOS_ATLAS.md).

## Revisar (sellos de muestra)
1. Abre el prólogo.
2. En **Herramientas del guía** (`?guia`), pulsa **Preparar las cuatro memorias** para reunir los sellos del capítulo actual.
3. Vuelve a la crónica, elige y confirma cada escena. Revisa la intervención y las consecuencias al llegar al siguiente capítulo.
4. Abre **Crónica** para releer o explorar ecos de capítulos cerrados.
5. En **Herramientas del guía → Catálogo de arte** revisa las fichas; **Inspeccionar espacios gráficos** abre `/?arte=1`.

Los accesos rápidos alteran la copia local de revisión; no eligen opciones ni validan tareas.

## Arte y sustitución
RPG clásico en pixel art detallado, cálido y original. Se mantienen los SVG provisionales; los PNG finales están pendientes.

- [Guía de arte](docs/GUIA_ARTE_ATLAS.md)
- [Inventario CSV](docs/CATALOGO_ARTE.csv)
- [Guía narrativa original](docs/narrativa/GUIA_NARRATIVA.md)
- [Especificación integrada](docs/narrativa/campana-v1.json)
- [Contrato de implementación](docs/IMPLEMENTACION_NARRATIVA.md)

250 recursos: 227 conectados a consumidores actuales y 23 reservados. Fondos, capas del mapa, retratos, expresiones, guardianes, compañero, memorias, reliquias, juramentos, compromisos, iconos y marcos. Cuerpos completos, caminatas y efectos extendidos quedan reservados.

`dist/visual-assets.json` es la fuente del contrato: ID, ruta, tamaño, celdas, FPS, prioridad y estado. Para activar un PNG, guárdalo en su ruta, cambia `status` a `ready` y ejecuta `node scripts/sync-art-manifest.mjs`. Un archivo ausente conserva el arte provisional.

## Datos y migración
Guardado automático en `auralia.atlas.v2`. Si existe `auralia.atlas.v1` se migra sin borrar la clave anterior. Se conservan memorias, personalización, consignas, premios de restauraciones previas y un archivo de elecciones antiguas. La nueva novela comienza en el prólogo porque antes no existían estas decisiones. Reconstruir un capítulo no vuelve a emitir una restauración ya premiada.

La importación reconstruye hechos desde las decisiones confirmadas, verificando orden, condiciones y códigos. Una revisión reduce conflictos entre pestañas; no es una transacción de servidor ni sincroniza dispositivos. Exportar/importar incluye narrativa y configuración.

Todavía no hay cuentas ni seguimiento remoto. Sin curso, los códigos son públicos y el panel docente es una herramienta local de revisión. Con curso, los sellos son privados y se verifican localmente; no reemplazan una validación en servidor.

## Expedición
El prototipo cenital sigue en `/expedicion/` con sus archivos y guardado. Se pausa la sincronización automática de nuevos hallazgos mientras se centra el trabajo en la novela. Los hallazgos y premios anteriores se conservan al migrar. No se ha añadido combate ni desplazamiento al lector.

## Módulos
| Archivo | Responsabilidad |
| --- | --- |
| `atlas.js`, `atlas-core.js` | Interfaz, recompensas, colección, migración |
| `classroom.js` | Grupos (compañías), sellos privados, enlace y verificación |
| `narrative-data.js` | Prólogo, 22 nodos, 66 opciones, escenas y finales |
| `narrative-core.js` | Condiciones, decisiones, honor, retornos y ecos |
| `narrative-ui.js` | Lectura, confirmación, resultados y epílogo |
| `asset-slots.js`, `visual-assets.json` | Sustitución de arte con respaldo |
| `direccion-arte/` | Catálogo filtrable, guía y CSV |
| `atlas-art.js` | Mapa y dibujos SVG provisionales |
| `scripts/`, `tests/` | Catálogo, comprobación y pruebas |

Sin dependencias ni compilación. Servir `dist` por HTTP; las rutas de arte son relativas, así que también funciona en una subcarpeta (por ejemplo GitHub Pages). Las pruebas corren en GitHub Actions en cada cambio.

```sh
python3 -m http.server 8000 --directory dist
npm run check
npm test
```

La ambigüedad moral, duración y vocabulario necesitan un piloto con lectores del nivel elegido. Las pruebas automáticas no sustituyen esa revisión.
