# vtt-hexgrid/

## Qué es

Mapa de hexágonos compartido en vivo (VTT — virtual tabletop) del sistema
nuevo de Rol Pintoísta. Paso 2 de
[`../docs/plan-sistema-nuevo.md`](../docs/plan-sistema-nuevo.md).

## Estado actual

`mapa.html`: un solo archivo, se abre con doble clic.

- Grilla de hexágonos "de punta arriba", sin bordes (se desplaza y hace
  zoom libremente). Filas impares corridas medio hexágono; cada token guarda
  su casilla como `{col, fila}`. La vista (desplazamiento y zoom) se
  recuerda por navegador en `localStorage` (`mapa-vista`).
- Dibujado en un `<canvas>`, solo las casillas visibles.
- Tokens en Firestore `campanas/{id}/tokens` (esquema en
  [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)): círculo de
  color con la inicial y el nombre debajo. Borde (`BORDE`/`claseToken()`):
  blanco = tuyos, verde = personajes de otros jugadores, rojo = vinculados a
  un creep de gm-tools, ocre = NPC (token del GM sin creep vinculado).
  Varios en la misma casilla se acomodan en ronda.
- Se mueven arrastrando; se escribe **una sola vez al soltar** (no durante
  el arrastre) por el tope de escrituras del plan gratis. Los demás ven el
  token deslizarse a la casilla nueva.
- Panel del costado: crear token (jugador: siempre PJ propio; GM: creep o
  PJ), vincularlo a una ficha propia o a un creep, editar nombre/color,
  sacar del mapa, y el GM puede reasignar el dueño de un PJ.
- Token vinculado (`fichaId`): usa el nombre y la miniatura de la ficha,
  la invocación (`<fichaId>~<idInvocación>`, sale del resumen de la ficha;
  solo barra de vida, apagada si no está invocada) o el creep, y dibuja debajo la barra de vida (roja) y, en PJ, la de SP
  (azul); arriba, circulitos con la inicial de cada estado (verde
  beneficio, violeta perjuicio). Caído/derrotado: oscurecido con una ✕.
  Lee `fichas` y `creeps` (solo lo público). De los creeps solo llega el
  porcentaje de vida.
- Fondo (botón 🖼 Fondo, solo GM): imagen en `mapa/fondo`, achicada sola;
  el GM ajusta el ancho en casillas y puede arrastrarla para alinearla con
  la grilla.
- Mesa al costado: mismas tiradas en vivo que ficha y gm-tools, más una
  "tirada libre" por fórmula (`desde: 'mapa'`).

Los permisos los imponen las reglas (`../firebase/firestore.rules`), no solo
la interfaz: el GM **no** mueve tokens de PJ (solo reasigna el dueño).

## Pendiente (más adelante)

Alcance y movimiento; niebla; ocultar tokens; tiradas desde el token.

## Dependencias con otras carpetas

- `../firebase/firestore.rules` — reglas de `tokens` y `tiradas`.
- `../comun/sesion.js` — cuenta y partida (`?partida=<id>`); sin sesión o
  sin ser miembro vuelve al inicio (`../index.html`). El botón ⌂ vuelve a
  la partida. La Mesa de tiradas está copiada de la ficha y gm-tools.
