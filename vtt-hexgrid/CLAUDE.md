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
  color con la inicial y el nombre debajo. Borde dorado = lo podés mover;
  borde de guiones = creep. Varios en la misma casilla se acomodan en ronda.
- Se mueven arrastrando; se escribe **una sola vez al soltar** (no durante
  el arrastre) por el tope de escrituras del plan gratis. Los demás ven el
  token deslizarse a la casilla nueva.
- Panel del costado: crear token (jugador: siempre PJ propio; GM: creep o
  PJ), editar nombre/color, sacar del mapa, y el GM puede reasignar el dueño
  de un PJ.
- Mesa al costado: mismas tiradas en vivo que ficha y gm-tools, más una
  "tirada libre" por fórmula (`desde: 'mapa'`).

Los permisos los imponen las reglas (`../firebase/firestore.rules`), no solo
la interfaz: el GM **no** mueve tokens de PJ (solo reasigna el dueño).

## Pendiente (Paso 3 y después)

Barras de vida/SP y estados en los tokens conectados a las fichas; imagen
de fondo; alcance y movimiento; niebla; ocultar tokens.

## Dependencias con otras carpetas

- `../firebase/firestore.rules` — reglas de `tokens` y `tiradas`.
- El bloque `fb*` (entrada con código) y la Mesa están copiados de
  `ficha-personaje/ficha.html` y `gm-toolset/gm-tools.html`; si se cambia
  la forma de entrar, cambiarlo en los tres.
