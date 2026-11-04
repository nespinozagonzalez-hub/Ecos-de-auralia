# Integración narrativa / Atlas 0.3

## Aplicado
Campaña v1: prólogo, cinco capítulos, 22 decisiones, 66 alternativas,15 escenas tras intervención y tres epílogos. Se conserva el soporte visual anterior. No se han creado PNG finales, cuentas o integración de Google Sheets.

## Contratos
- Cada nodo de capítulo exige su memoria específica y todas las decisiones anteriores.
- Las opciones condicionadas consultan hechos previos. Cada nodo mantiene al menos dos alternativas sin requisitos adicionales.
- Confirmar es único por partida y nodo; repetir no ejecuta otra vez efectos.
- Cada retorno conserva origen y ancla. Dos como máximo se muestran en primer plano y el resto queda en la crónica cuando corresponde.
- Seis intersecciones conectan hechos de distintos territorios y conservan costes después de restaurar.
- Solo los testigos definidos conocen la elección. La confianza de ausentes no se altera. Mensajes futuros deberán indicar cuándo un actor recibe información.
- G.1 exige excepción o revisión cuando se cambia una reserva/mandato especificado. Revisar conserva disenso; no implica aprobación universal.
- Las promesas tienen origen, escena de revisión e historial. Se registra cumplimiento observado de protocolos representados por las opciones. Lo restante puede quedar pendiente: no hay un botón de virtud o premio por disculparse.
- Las recompensas se derivan de identificadores únicos. Las elecciones no cambian cantidades.
- Los ecos copian la entrada al capítulo, reconstruyen lo anterior y no llaman al guardado principal ni emiten premios.
- El epílogo compone gobierno, cinco intervenciones e instituciones, reconocimiento, objeción y juramento. La crónica conserva los compromisos y cruces.

## Guardado y límites
localStorage v2 conserva campaña y runId. Importar reconstruye hechos desde decisiones. La revisión entre pestañas no garantiza atomicidad simultánea o entre dispositivos. Las cuentas futuras requieren servidor, transacciones y claves idempotentes.

La clave v1 queda como respaldo. La migración conserva elecciones en legacyArchive sin interpretarlas como decisiones nuevas. Los bonos de restauración previos se mantienen y no se duplican.

## Arte
250 fichas:227 conectadas y23 reservadas. Activar PNG requiere actualizar el manifiesto. Los recursos reservados necesitan además su consumidor. Los textos se dibujan en HTML y los datos técnicos quedan en el catálogo o modo de inspección.

La guía narrativa original es una referencia histórica previa a construcción. La fuente vigente de ejecución es narrative-data.js y su copia documental campana-v1.json. Actualizar ambas al cambiar contenido y comprobar recorridos y guardado.

## Verificación
Pruebas: tres finales, orden y condiciones, códigos adelantados, no duplicación, reservas, conocimiento, migración, importación y ecos. La expedición conserva su suite.

La revisión en navegador cubre prólogo, memorias de prueba, vía del puente, confirmación y consecuencia. El encuadre exacto de sprites y contraste final se probará al producir PNGs. El vocabulario y duración requieren lectores del nivel elegido.
