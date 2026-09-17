# vtt-hexgrid/

## Qué es

Mapa de hexágonos compartido en vivo (VTT — virtual tabletop) del sistema
nuevo de Rol Pintoísta. Paso 2 de
[`../docs/plan-sistema-nuevo.md`](../docs/plan-sistema-nuevo.md).

## Estado actual

`mapa.html`: un solo archivo, se abre con doble clic.

- Grilla de hexágonos "de lado arriba" (un lado horizontal, no una punta;
  `ESQUINAS`, `hexCentro`, `mundoAHex`, `hexACubo` — girada 30° contra la
  vieja grilla "de punta arriba" para que el frente por defecto, mirando
  abajo, caiga en un lado y no en un vértice; ver más abajo), sin bordes (se
  desplaza y hace zoom libremente). Columnas impares corridas medio
  hexágono; cada token guarda su casilla como `{col, fila}`. La vista
  (desplazamiento y zoom) se recuerda por navegador en `localStorage`
  (`mapa-vista`).
- Dibujado en un `<canvas>`, solo las casillas visibles.
- Tokens en Firestore `campanas/{id}/tokens` (esquema en
  [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)): hexágono
  del mismo tamaño y orientación que la casilla (calza con la grilla; no
  rota con el frente), con la ilustración adentro (o la inicial) y el
  nombre debajo. Borde (`BORDE`/`claseToken()`): dorado = tuyos, verde =
  personajes de otros jugadores, rojo = vinculados a un creep de gm-tools,
  gris = NPC (token del GM sin creep vinculado).
- **Frente y rotación** (`rotacion` en grados: 0/60/120/180/240/300, 0 =
  abajo, que es como vienen casi todas las ilustraciones de token): el lado
  que mira la ilustración se resalta en celeste (`FRENTE_COLOR`, distinto
  de dorado/verde/rojo/gris para no confundirse con el dueño). Se rota
  arrastrando el handle celeste ↻ del HUD (aparece al lado del anillo,
  mismo permiso que 🦶 Mover libre — el dueño en su PJ, el GM en cualquier
  token); el arrastre snapea a esas 6 direcciones, que son las 6 casillas
  vecinas del hexágono (`hudAcomodarRotar`, `rotando`). Por ahora es solo
  visual — todavía no hay cono de visión ni sigilo que lo use (ver
  "Sigilo (en diseño)" en `../docs/plan-sistema-nuevo.md`); cuando se
  construya, el lado opuesto al frente es el punto ciego.
- **Barra superior unificada** (`../comun/barra.js`, `barraTexto()`, sin
  personaje acá): `#estado` muestra "Partida · Usuario · GM"; ya no hay
  botón "⌂" (lo reemplaza el menú ☰, `../comun/menu-sitio.js`). Es la que
  copian las otras tres herramientas.
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
- Panel del costado: solo Mantenimiento (GM), "Token (?)" con la ayuda y la
  leyenda de colores, y el botón de configuración de los dados 3D. Los datos
  del token van en el HUD flotante (no se repiten acá). "✎ Editar token"
  está en el globo del ⚙ del HUD: abre en el panel el vínculo, nombre,
  color, dueño (GM) y "Sacar del mapa" (`editandoToken`).
- **Vida y SP desde el mapa** (`cambiarVidaPj`, `cambiarVidaCreep`): el
  dueño de un PJ (o invocación) y el GM en sus creeps escriben un valor o
  +N/-N. Se guarda en una transacción sobre la parte de la ficha
  (`general` o `invocaciones`) + su resumen, o sobre
  `creeps/{id}/privado/ficha` + `resumen.hpPct` + `firma` (con el mismo hash
  que gm-tools, así la otra herramienta se entera y lo trae). Topes: vida
  entre 0 y el máximo; SP hasta el máximo. El GM ve los números de sus
  creeps escuchando la parte privada del seleccionado.
- **Orden de turnos (iniciativa)**: tablero flotante y plegable arriba a la
  izquierda del mapa (`#iniciativa`, estilo "Turn Order" de Roll20), visible
  **solo en modo combate**. Vive en `campanas/{id}/mapa/iniciativa`
  (`{orden: [{id, valor}], turno, ronda}`): lo ven todos. El GM tiene
  "Traer tokens" (suma todos los del mapa conservando valores), carga la
  tirada de cada uno, "Ordenar" (de mayor a menor, empates en el orden
  previo), "▶ Siguiente" (avanza y suma una ronda al dar la vuelta) y
  "Limpiar" — eso sigue siendo solo del GM. **El valor de cada fila** (algo
  puede cambiarlo a mitad de combate) lo edita el GM en cualquier fila, o
  cada jugador en la propia (`puedeEditarIniciativa`; reglas de
  `mapa/{doc}`: cualquier miembro puede escribir `mapa/iniciativa` mientras
  no toque `turno`/`ronda` ni el largo de `orden` — eso lo sigue rechazando
  la regla salvo que sea el GM). Cada cambio de valor se anuncia en la Mesa
  (`publicarCambioIniciativa`, `desde: 'recordatorio'`). Tocar una fila
  selecciona y centra ese token. Plegado por navegador en `localStorage`
  (`mapa-iniciativa-plegada`).
- **Controles flotantes sobre el token seleccionado** (`hudUbicar`,
  `hudHtml`): tres círculos editables con Vida (rojo), SP (azul) y No2
  (verde) repartidos en ronda alrededor del token (`hudAcomodarAnillo`), 📜 abrir la ficha en otra pestaña, ◎ estados alterados (ver con su descripción al pasar el mouse, ±turnos, sacar y "+ Estado", que abre el selector de presets de la ficha o de gm-tools en el iframe del mapa), ⚙ barras y aura del
  token, ⚡ Botonera (PJ propio) o Acciones (creep del GM). Vida/SP/No2 se
  guardan en la ficha o en la parte privada del creep; barras y aura, en el
  propio token (`barras {hp,sp,no2}`, `aura {radio, forma, color}`: radio en casilleros enteros, forma `hex` (casillas a ≤ radio pasos, `dibujarAuraHex`; por defecto) o `circulo`). La ronda de botones va por fuera de las casillas vecinas (1,5 casilleros, tope 200 px). Un token sin ficha ni creep
  vinculado puede llevar su propia `imagen` (cuadrada, 96 px, < 60 KB;
  `prepararImagenToken`), que se elige en ese mismo panel o ya al crearlo
  (panel "Nuevo token": el selector de imagen aparece sin vincular, se
  esconde al elegir un vínculo). El panel se
  acomoda para no salirse del mapa (`hudAcomodarGlobo`). Ojo: lo que
  `escucharTokens` no copie del documento se pierde al volver de Firebase.
- **🦶 Mover libre** (`moverLibre`, `moverTokenLibre`): botón del HUD que
  lleva el token a otra casilla sin reglas (sin No2, sin estela, ignora
  Inmovilizado): se arrastra el token o se toca la casilla destino; Esc
  cancela. Lo ve el dueño en su PJ y el GM en cualquier token. Borra `ruta`
  del documento; las reglas dejan al GM tocar `col`, `fila` y `ruta` de un PJ.
- **🧰 Caja de herramientas** (`#toolkit`, `HERRAMIENTAS`, `renderToolkit`):
  barra vertical escondida a la izquierda del mapa; la pestaña del borde la
  abre y cierra deslizándola (abierta o no se recuerda en `localStorage`
  `mapa-toolkit-abierto`; abierta, corre el orden de turnos). Lápiz, Formas
  y Terreno figuran como "Pronto" hasta diseñarlas (una herramienta lista
  lleva `lista: true` y se activa en `herramientaActiva`). Preguntas en
  `docs/preguntas-abiertas.md` (P38–P41).
- **⚔ Acciones** (solo GM, en un creep vinculado): la misma capa carga
  `gm-tools.html?modo=acciones&creep=<id>`, que muestra solo la ventana de
  Acciones del creep (mensajes `acciones-lista`, `acciones-cerrada`,
  `abrir-acciones`). El botón de edición del panel se llama "✎ Editar token".
  Como la Botonera y el Mantenimiento en segundo plano, este iframe carga
  con `sinCache()` (agrega `_v=Date.now()` a la URL, antes del `#` si trae
  uno) para que el sitio publicado no sirva una ficha o gm-tools vieja
  desde la caché de 10 minutos de GitHub Pages.
- **👥 Personajes** (cabecera, azul, todos los miembros): despliega las
  fichas de la partida (`fichasPub`, `renderListaPersonajes`); cada una abre
  `ficha.html?partida=…#<fichaId>` en otra pestaña. El GM además ve un ✕
  por fila para borrar ese personaje (`borrarPersonajeGM`: confirmar +
  escribir el nombre, borra la ficha con sus partes y los tokens que la
  usan — ver [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)).
  **⟳ Mantenimiento** (solo GM) va en verde arriba de todo en la barra lateral
  (`#caja-mantenimiento`).
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
- **Ocultar tokens** (`oculto` en el token, botón 👁/🙈 del HUD, solo GM):
  para armar creeps/tokens antes de que entren en la partida y mostrarlos
  cuando corresponda. Un token oculto no aparece para los jugadores (ni se
  dibuja ni se puede tocar, `calcularDisposicion`/aura filtran por
  `soyGM`); el GM lo sigue viendo, más transparente para acordarse y con
  🙈 antes del nombre en el orden de turnos, que a los jugadores
  directamente no les muestra esa fila (`renderIniciativa`; el turno pasa
  igual cuando le toca, solo que no se nota que estuvo ahí). Es solo una
  comodidad para preparar la mesa, no un sistema de sigilo (eso es aparte,
  ver "Sigilo (en diseño)" en `../docs/plan-sistema-nuevo.md`) — un
  jugador que mire la base de datos directamente podría ver el token
  igual, las reglas no lo esconden a ese nivel.
- Fondo (botón 🖼 Fondo, solo GM): imagen en `mapa/fondo`, achicada sola;
  el GM ajusta el ancho en casillas y puede arrastrarla para alinearla con
  la grilla.
- Mesa al costado: mismas tiradas en vivo que ficha y gm-tools, más una
  "tirada libre" por fórmula (`desde: 'mapa'`). El GM ve 🗑 para borrar el
  historial y al entrar se limpian las de más de 48 h
  (`../comun/mesa-historial.js`, igual que en ficha y gm-tools).
- **Grilla de dados** (`../comun/grilla-dados.js`, como la de Roll20): botón
  🎲 Dados en la barra de arriba; se despliega debajo con D4…D100 × 1–6 y
  cada clic publica la tirada en la Mesa. En ficha y gm-tools el botón está
  al pie de la Mesa flotante y la grilla se abre al costado.

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
  la partida.
- `../comun/mesa.js` y `../comun/tiradas.js` — la Mesa y las fórmulas de
  dados, compartidas con la ficha y gm-tools (el mapa define
  `MESA_DESDE = 'mapa'` y `mesaQuien()`, y tiene su propio HTML de Mesa).
