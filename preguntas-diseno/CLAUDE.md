# preguntas-diseno/

## Qué es

`preguntas.html` — un log compartido de **preguntas de diseño y sus
respuestas/sugerencias**, para definir las reglas del Rol Pintoísta entre
el dueño del proyecto y los amigos con los que arma el sistema (hoy dos:
Enro y Seba), sin depender de coincidir en el chat de WhatsApp. El dueño
va tirando preguntas de a poco; cada uno responde o sugiere cuando tiene
tiempo y ganas, y queda un historial.

Es la puesta en práctica de que la creación colectiva es del grupo, no
solo del GM/dueño — ver "La creación colectiva es del grupo, no solo del
GM" en el [`CLAUDE.md`](../CLAUDE.md) de la raíz.

## Estado actual

Primera versión (2026-09-22). Sin propuesta de aprobación como
`comun/biblioteca.js` — acá no hace falta: es solo el dueño y sus dos
amigos, así que cualquiera lee y escribe.

## Excepción a "solo compu, no celular"

**Esta herramienta sí está pensada para el celular, a propósito** (decidido
2026-09-22, al revés de la regla general del resto del sitio): una sola
columna, botones grandes, nada que dependa de hover. La idea es que se
pueda abrir, sumar una pregunta o una respuesta, y cerrar, en el celular,
sin fricción. **No tocar esto para "unificarlo" con el resto de las
herramientas** — es intencional.

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
- **Datos**: colección `preguntas_diseno` **fuera de cualquier
  `campanas/{id}`** a propósito — es sobre el sistema en general, no sobre
  una partida puntual. Cada doc: `{tipo:'pregunta'|'respuesta', texto,
  padreId (vacío si es pregunta), resuelta (solo relevante en preguntas),
  autorUid, autorNombre, creado}`. Una respuesta apunta a su pregunta por
  `padreId`; no hay hilos anidados más profundos.
- **Reglas**: `verificado()` (cuenta confirmada, sin pedir membresía de
  ninguna partida) lee y crea; cualquiera puede tildar/destildar
  `resuelta` de cualquier pregunta (sin tocar el resto); cada quien edita
  o borra solo lo suyo. Ver `firebase/firestore.rules`,
  `match /preguntas_diseno/{id}`.
- **La UI**: preguntas primero (las resueltas quedan escondidas salvo que
  se tilde "Mostrar las resueltas"), cada una con sus respuestas anidadas
  debajo. "✓ Marcar resuelta" no borra nada — solo la saca de la vista por
  defecto, para no perder el historial.

## Dependencias con otras carpetas

- `comun/sesion.js` — solo `fbIniciar`/`fbCuentaConfirmada`, no el resto
  del flujo de partida.
- `comun/menu-sitio.js` — tiene un link a esta herramienta ("💬 Preguntas
  de diseño"), sin pasarle partida.
- `firebase/firestore.rules` — colección `preguntas_diseno`.

## Pendiente

Nada de esto se sincroniza con `docs/preguntas-abiertas.md` — cuando algo
se resuelve acá y vale la pena que quede en el repo (una regla del juego,
no solo una charla), el dueño lo pasa a mano al documento correspondiente,
igual que siempre.
