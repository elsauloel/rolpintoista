# testeos/

## Qué es

`testeos.html` — un checklist personal de **mecánicas nuevas que ameritan
probarse en mesa**, para que el dueño del proyecto las vaya tildando a
medida que las prueba. Sin login, sin Firebase: es una herramienta de uso
personal, no compartida.

## Estado actual

Primera versión (2026-09-22), sembrada con 28 mecánicas sustanciales de
los últimos días (2026-09-19 a 2026-09-22), a criterio del asistente
(pedido explícito del dueño: "quiero que incluyas a tu criterio todas las
propuestas de los últimos cuatro días que necesiten o ameriten ser
testeadas"). Quedaron afuera los cambios puramente cosméticos o de
ubicación (mover un botón, cambiar un color), tal como pidió.

## Regla de uso — importante

**Esta lista NO se completa sola.** El dueño fue explícito (2026-09-22):
*"Que cada cambio que te pida, si yo te pido que lo incluyas en la lista
de testear, lo hagas, y si no te lo pido, no."* Es decir: en cualquier
conversación futura, un ítem nuevo se agrega a `TESTEOS_BASE` **solo**
cuando el dueño lo pide en ese momento — nunca de manera automática o
proactiva por cada feature que se construye, aunque sea una mecánica
compleja. Ver la memoria del asistente (`solo-agregar-testeos-si-se-pide.md`).

## Cómo funciona

- **`TESTEOS_BASE`** (array en el `<script>` del HTML) es la fuente de la
  verdad: cada ítem es `{id, area, fecha, texto}`. Se edita a mano en el
  archivo — no hay panel para crear ítems desde la página. `id` tiene que
  ser único y estable (no cambiarlo una vez creado: ahí vive el tildado de
  cada navegador).
- **El tildado ("probado") vive en `localStorage`** de cada navegador
  (clave `testeos-probados`, un array de `id`s). No se sincroniza entre
  dispositivos ni se sube a ningún lado — es personal. "↺ Destildar todo"
  limpia el progreso (con confirmación) sin tocar la lista.
- Agrupado por `area` (orden fijo en `AREA_ORDEN`, las áreas más
  relevantes primero, no alfabético); dentro de cada área, más nuevo
  primero. Por defecto se esconden los ya tildados (tildar "Mostrar los ya
  probados" para verlos, igual que en `preguntas-diseno/`).

## Cómo agregar un ítem (cuando el dueño lo pide)

Sumar un objeto a `TESTEOS_BASE` con `id` nuevo (kebab-case, corto),
`area` (una de `AREA_ORDEN` si encaja, o una nueva — sumarla también a
`AREA_ORDEN`), `fecha` (`AAAA-MM-DD` de hoy) y `texto` (una frase que
explique qué probar, no solo qué se hizo).

## Dependencias con otras carpetas

Ninguna en runtime — es un archivo HTML independiente, sin `<script src>`
a `comun/` ni a Firebase. No tiene link desde `comun/menu-sitio.js` a
propósito (es personal del dueño, no algo que Enro o Seba necesiten ver);
se abre por su URL directa.
