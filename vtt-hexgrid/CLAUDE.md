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
  dorado = tuyos, verde = personajes de otros jugadores, rojo = vinculados a
  un creep de gm-tools, gris = NPC (token del GM sin creep vinculado).
- **Modo narrativo / combate** (switch en la cabecera, `modoMapa`, doc
  `campanas/{id}/mapa/modo` = `{modo}`): lo cambia el GM y lo ven todos.
  Narrativo (verde): la estela se ve pero mover no gasta No2
  (`costoMoverDe` devuelve null). Combate (rojo): mover gasta No2 y la
  confirmación solo aparece si el movimiento se pasa de los No2 que quedan;
  si alcanzan, se descuenta directo.
  Varios en la misma casilla se acomodan en ronda.
- Se mueven arrastrando; se escribe **una sola vez al soltar** (no durante
  el arrastre) por el tope de escrituras del plan gratis. Los demás ven el
  token deslizarse a la casilla nueva.
- **Ruta y estela** (`extenderRuta`, `lineaHex`): al arrastrar, la ruta
  sigue al token casilla por casilla (volver sobre una casilla la recorta;
  los saltos del mouse se completan en línea recta). Los otros tokens no
  bloquean. Se guarda en `ruta` del token y todos ven la estela
  `ESTELA_MS` (4 s). Un PJ vinculado a su ficha (no invocación) gasta
  Nitros: pasarse se permite (quedan en negativo), pero avisa y los
  casilleros de más se pintan en rojo (`resumen.nitros`,
  `resumen.costoMover`: 2 con Rengo, 0 con Inmovilizado), al soltar pide
  Confirmar/Cancelar (`rutaPendiente`) y `gastarNitros` descuenta en la
  ficha con una transacción. Sin las reglas nuevas publicadas, se mueve
  igual pero sin estela para los demás.
- **Creeps gastan No2 al moverse** (solo el GM): el mapa escucha la parte
  privada de cada creep con token (`creepsPriv`, `actualizarEscuchasCreeps`)
  y cobra con las mismas reglas (`costoMoverCreep`: 1 por casillero, 2 con
  Rengo, 0 con Inmovilizado). `gastarNitrosCreep` descuenta `sc.nitros`
  vía `modificarCreep` (transacción sobre `privado/ficha` + resumen +
  firma, la misma que usa `cambiarVidaCreep`). El panel del creep le
  muestra al GM sus No2.
- Panel del costado: crear token (jugador: siempre PJ propio; GM: creep/NPC
  o PJ). Al seleccionar un token se ven nombre, vida/SP y estados; "✎ Editar"
  abre vínculo, nombre, color, dueño (GM) y "Sacar del mapa". Los PJ (y sus
  invocaciones) vinculados tienen "📄 Ficha", que abre la ficha en otra
  pestaña (`ficha.html?partida=…#<fichaId>`; la de otro jugador, en solo
  lectura, sin pasar a ser "la tuya" en ese navegador).
- **Vida y SP desde el mapa** (`cambiarVidaPj`, `cambiarVidaCreep`): el
  dueño de un PJ (o invocación) y el GM en sus creeps escriben un valor o
  +N/-N. Se guarda en una transacción sobre la parte de la ficha
  (`general` o `invocaciones`) + su resumen, o sobre
  `creeps/{id}/privado/ficha` + `resumen.hpPct` + `firma` (con el mismo hash
  que gm-tools, así la otra herramienta se entera y lo trae). Topes: vida
  entre 0 y el máximo; SP hasta el máximo. El GM ve los números de sus
  creeps escuchando la parte privada del seleccionado.
- **⚔ Acciones** (solo GM, en un creep vinculado): la misma capa carga
  `gm-tools.html?modo=acciones&creep=<id>`, que muestra solo la ventana de
  Acciones del creep (mensajes `acciones-lista`, `acciones-cerrada`,
  `abrir-acciones`). El botón de edición del panel se llama "✎ Editar token".
- **⚡ Botonera** (solo en tu propio personaje): abre la ficha en un iframe
  a pantalla completa con `?modo=botonera`, que muestra solo la Botonera.
  Se hablan con `postMessage` (`botonera-lista`, `botonera-cerrada`,
  `abrir-botonera`); el iframe queda cargado para reabrir al instante.
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

- **Dados 3D** (`../comun/dados3d.js`, también en gm-tools): cada tirada
  nueva de la Mesa rueda encima del mapa y cae en el resultado real. En la
  cabecera de la Mesa, 🎲 prende o apaga la animación y "⚙ dados" abre
  `../comun/prueba-dados.html` para elegir el estilo (por navegador, en
  `localStorage` 'dados3d'). No escribe nada en Firebase.

## Pendiente (más adelante)

Alcance y movimiento; niebla; ocultar tokens; tiradas desde el token.

## Dependencias con otras carpetas

- `../firebase/firestore.rules` — reglas de `tokens` y `tiradas`.
- `../comun/sesion.js` — cuenta y partida (`?partida=<id>`); sin sesión o
  sin ser miembro vuelve al inicio (`../index.html`). El botón ⌂ vuelve a
  la partida. La Mesa de tiradas está copiada de la ficha y gm-tools.
