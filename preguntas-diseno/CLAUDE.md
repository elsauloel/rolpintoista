# preguntas-diseno/

## Qué es

`preguntas.html` — un log compartido con **tres pestañas** para definir
las reglas, seguir el desarrollo y probar el Rol Pintoísta entre el dueño
del proyecto y los amigos con los que arma el sistema (hoy dos: Enro y
Seba), sin depender de coincidir en el chat de WhatsApp:

- **💬 Preguntas**: preguntas de diseño y sus respuestas/sugerencias. El
  dueño va tirando preguntas de a poco; cada uno responde o sugiere cuando
  tiene tiempo y ganas, y queda un historial.
- **🎨 Desarrollo creativo** (sumada 2026-09-22): el log de lo que falta
  construir. El dueño anota ahí lo que va pensando que falta, pero
  **cualquiera puede proponer su propia idea de desarrollo también** — no
  es solo del dueño. Arriba de las propuestas hay un resumen plegable
  ("📜 Resumen de lo ya incorporado") de solo lectura con las mecánicas y
  reglas ya incorporadas en los últimos días, para que Enro y Seba puedan
  seguir el proceso de desarrollo sin tener que pedirlo.
- **🧪 Falta testear** (sumada 2026-09-22, reemplaza a `testeos/testeos.html`):
  checklist de mecánicas nuevas para probar en mesa. El dueño (o cualquiera)
  suma algo por probar; al probarlo, se tilda "✓ Marcar probado" y queda
  escondido salvo que se pida ver el historial. A diferencia de la versión
  vieja (personal, en `localStorage`), esta es compartida: Enro y Seba
  también pueden ver qué falta probar y tildar lo que ellos mismos probaron.

Es la puesta en práctica de que la creación colectiva es del grupo, no
solo del GM/dueño — ver "La creación colectiva es del grupo, no solo del
GM" en el [`CLAUDE.md`](../CLAUDE.md) de la raíz.

## Estado actual

Primera versión (2026-09-22, preguntas), con Desarrollo creativo y Falta
testear sumadas el mismo día. Sin propuesta de aprobación como
`comun/biblioteca.js` — acá no hace falta: es solo el dueño y sus dos
amigos, así que cualquiera lee y escribe.

## Excepción a "solo compu, no celular"

**Esta herramienta sí está pensada para el celular, a propósito** (decidido
2026-09-22, al revés de la regla general del resto del sitio): una sola
columna, botones grandes, nada que dependa de hover. La idea es que se
pueda abrir, sumar una pregunta, una propuesta o algo para testear, y
cerrar, en el celular, sin fricción. **No tocar esto para "unificarlo" con
el resto de las herramientas** — es intencional.

## El asistente puede escribir acá directamente (2026-09-22)

El dueño dicta ideas sueltas por voz/control remoto en pleno "rush
creativo" y quiere que el asistente las sume él mismo, sin que el dueño
tenga que tipearlas. Como la colección vive en Firestore y el asistente no
tiene cuenta propia (ni debe entrar con la del dueño — ver la regla de
credenciales), el mecanismo es: **el dueño se loguea una vez con su Google
en el navegador que controla el asistente** (el "Browser pane" de Claude
Code/Claude en la app); esa sesión de Firebase Auth queda recordada sola
en ese navegador (comportamiento por defecto), y de ahí en más el
asistente puede escribir con esa sesión ya iniciada cuando el dueño se lo
pide en la conversación (cada pedido puntual es la autorización — no hace
falta volver a preguntar "¿lo subo?" por cada ítem dictado). Si esa sesión
se pierde (logout, otro navegador, otra máquina), el dueño tiene que
volver a loguearse ahí una vez. Ver la memoria del asistente
`pendientes-desarrollo-creativo.md`.

## Cómo funciona

- **Entrar es liviano**: no pasa por `comun/sesion.js` → `fbEntrarAPartida()`
  (que exige elegir una partida y ser miembro). Solo usa `fbIniciar()` +
  `firebase.auth().onAuthStateChanged` de esa misma sesión de Firebase —
  cualquier cuenta confirmada (Google o email verificado) entra, sin
  partida de por medio. El login de Google usa el mismo patrón que
  `index.html` (`signInWithPopup`, con `signInWithRedirect` de respaldo si
  el navegador bloquea la ventanita — común en celulares). La sesión queda
  recordada sola en ese navegador: entrar una vez alcanza.
- **Datos**: una sola colección `preguntas_diseno` **fuera de cualquier
  `campanas/{id}`** a propósito — es sobre el sistema en general, no sobre
  una partida puntual. Cada doc: `{tipo:'pregunta'|'pendiente'|'testeo'|
  'respuesta', texto, padreId (vacío si no es una respuesta), resuelta
  (solo relevante en pregunta/pendiente/testeo, no en respuesta),
  autorUid, autorNombre, creado}`. Las tres pestañas viven en la misma
  colección, filtradas por `tipo` en el cliente; una respuesta apunta a su
  entrada por `padreId`, no hay hilos anidados más profundos. `resuelta`
  cambia de sentido según la pestaña ("resuelta" / "ya está hecho" / "ya
  está probado") — mismo campo, texto distinto (`TABS` en el JS).
- **Reglas**: `verificado()` (cuenta confirmada, sin pedir membresía de
  ninguna partida) lee y crea; cualquiera puede tildar/destildar
  `resuelta` de cualquier entrada (sin tocar el resto); cada quien edita
  o borra solo lo suyo. Ver `firebase/firestore.rules`,
  `match /preguntas_diseno/{id}`, función `entradaPregunta`.
- **La UI**: dentro de cada pestaña, lo abierto primero (lo resuelto/hecho/
  probado queda escondido salvo que se tilde "Mostrar las…"), cada entrada
  con sus respuestas anidadas debajo. Marcar resuelto no borra nada — solo
  lo saca de la vista por defecto, para no perder el historial.
- **El resumen de "ya incorporado"** (`CAMBIOS_RECIENTES` en el JS, visible
  solo en la pestaña Desarrollo creativo): es **texto fijo en el HTML, de
  solo lectura** — no vive en Firestore, no se puede sumar ni borrar desde
  la página. Es un resumen histórico que el asistente arma a mano cuando
  el dueño lo pide (no automático por cada commit); cada entrada es una
  frase corta en lenguaje llano ("se incorporó tal cosa, que sirve para
  tal cosa"), sin jerga técnica. Se actualiza editando el array
  directamente en `preguntas.html`.

## Dependencias con otras carpetas

- `comun/sesion.js` — solo `fbIniciar`/`fbCuentaConfirmada`, no el resto
  del flujo de partida.
- `comun/menu-sitio.js` — tiene un link a esta herramienta ("💬 Preguntas
  de diseño"), sin pasarle partida.
- `firebase/firestore.rules` — colección `preguntas_diseno`, función
  `entradaPregunta` (acepta `tipo` en
  `['pregunta','respuesta','pendiente','testeo']`).

## Pendiente

Las entradas resueltas/hechas/probadas no se sincronizan solas con
`docs/preguntas-abiertas.md` ni `docs/pendientes.md` — cuando algo se
resuelve o se construye acá y vale la pena que quede en el repo (una regla
del juego, una tarea real), el dueño lo pasa a mano al documento
correspondiente, igual que siempre.
