# preguntas-diseno/

## Qué es

`preguntas.html` — un log compartido con **dos pestañas** para definir las
reglas y seguir el desarrollo del Rol Pintoísta entre el dueño del
proyecto y los amigos con los que arma el sistema (hoy dos: Enro y Seba),
sin depender de coincidir en el chat de WhatsApp:

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

Es la puesta en práctica de que la creación colectiva es del grupo, no
solo del GM/dueño — ver "La creación colectiva es del grupo, no solo del
GM" en el [`CLAUDE.md`](../CLAUDE.md) de la raíz.

## Estado actual

Primera versión (2026-09-22), pestaña de Desarrollo creativo sumada el
mismo día. Sin propuesta de aprobación como `comun/biblioteca.js` — acá no
hace falta: es solo el dueño y sus dos amigos, así que cualquiera lee y
escribe.

## Excepción a "solo compu, no celular"

**Esta herramienta sí está pensada para el celular, a propósito** (decidido
2026-09-22, al revés de la regla general del resto del sitio): una sola
columna, botones grandes, nada que dependa de hover. La idea es que se
pueda abrir, sumar una pregunta, una respuesta o una propuesta, y cerrar,
en el celular, sin fricción. **No tocar esto para "unificarlo" con el
resto de las herramientas** — es intencional.

## Cómo funciona

- **Entrar es liviano**: no pasa por `comun/sesion.js` → `fbEntrarAPartida()`
  (que exige elegir una partida y ser miembro). Solo usa `fbIniciar()` +
  `firebase.auth().onAuthStateChanged` de esa misma sesión de Firebase —
  cualquier cuenta confirmada (Google o email verificado) entra, sin
  partida de por medio. El login de Google usa el mismo patrón que
  `index.html` (`signInWithPopup`, con `signInWithRedirect` de respaldo si
  el navegador bloquea la ventanita — común en celulares). La sesión queda
  recordada sola en ese navegador (comportamiento por defecto de Firebase
  Auth): entrar una vez alcanza.
- **Datos**: una sola colección `preguntas_diseno` **fuera de cualquier
  `campanas/{id}`** a propósito — es sobre el sistema en general, no sobre
  una partida puntual. Cada doc: `{tipo:'pregunta'|'pendiente'|'respuesta',
  texto, padreId (vacío si no es una respuesta), resuelta (solo relevante
  en preguntas/pendientes, no en respuestas), autorUid, autorNombre,
  creado}`. Las dos pestañas viven en la misma colección, filtradas por
  `tipo` en el cliente (`pregunta` vs `pendiente`); una respuesta apunta a
  su pregunta o pendiente por `padreId`, no hay hilos anidados más
  profundos. `resuelta` significa "resuelta" en Preguntas y "ya está
  hecho/incorporado" en Desarrollo creativo — mismo campo, texto distinto
  según la pestaña (`TABS` en el JS).
- **Reglas**: `verificado()` (cuenta confirmada, sin pedir membresía de
  ninguna partida) lee y crea; cualquiera puede tildar/destildar
  `resuelta` de cualquier entrada (sin tocar el resto); cada quien edita
  o borra solo lo suyo. Ver `firebase/firestore.rules`,
  `match /preguntas_diseno/{id}`, función `entradaPregunta`.
- **La UI**: dentro de cada pestaña, lo abierto primero (lo resuelto/hecho
  queda escondido salvo que se tilde "Mostrar las resueltas"/"Mostrar las
  ya hechas"), cada entrada con sus respuestas anidadas debajo. Marcar
  resuelta/hecho no borra nada — solo lo saca de la vista por defecto,
  para no perder el historial.
- **El resumen de "ya incorporado"** (`CAMBIOS_RECIENTES` en el JS, visible
  solo en la pestaña Desarrollo creativo): es **texto fijo en el HTML, de
  solo lectura** — no vive en Firestore, no se puede sumar ni borrar desde
  la página. Es un resumen histórico que el asistente arma a mano cuando
  el dueño lo pide (no automático por cada commit); cada entrada es una
  frase corta en lenguaje llano ("se incorporó tal cosa, que sirve para
  tal cosa"), sin jerga técnica — pensado para que Enro y Seba entiendan
  qué cambió sin tener que leer código. Se actualiza editando el array
  directamente en `preguntas.html`.

## Dependencias con otras carpetas

- `comun/sesion.js` — solo `fbIniciar`/`fbCuentaConfirmada`, no el resto
  del flujo de partida.
- `comun/menu-sitio.js` — tiene un link a esta herramienta ("💬 Preguntas
  de diseño"), sin pasarle partida.
- `firebase/firestore.rules` — colección `preguntas_diseno`, función
  `entradaPregunta` (acepta `tipo` en `['pregunta','respuesta','pendiente']`).
- `../testeos/` — herramienta hermana pero **separada a propósito**: acá
  (Desarrollo creativo) es el log compartido de qué falta construir y qué
  ya se incorporó; `testeos/testeos.html` es el checklist personal del
  dueño para probar mecánicas en mesa, sin Firebase ni login. No mezclar.

## Pendiente

Las preguntas resueltas y las propuestas ya incorporadas no se sincronizan
solas con `docs/preguntas-abiertas.md` ni `docs/pendientes.md` — cuando
algo se resuelve o se construye acá y vale la pena que quede en el repo
(una regla del juego, una tarea real), el dueño lo pasa a mano al
documento correspondiente, igual que siempre.
