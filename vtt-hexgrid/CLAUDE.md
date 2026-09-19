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
  Varios en la misma casilla se acomodan en ronda. La ficha también
  escucha este mismo doc (`modoMapaEscuchar`, su propio `modoMapa`) para
  reordenar la Botonera: habilidades sociales al final en combate, arriba
  de todo en narrativo — ver [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md).
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
  token, ⚡ Botonera (PJ propio o su invocación) o Acciones (creep del GM).
  Las invocaciones ya tienen las mismas funciones que un creep (No2,
  estados, habilidades — ver [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md)):
  su dueño ve el mismo ⚡ que en su propio personaje (`propio` en
  `hudHtml` ya no excluye tokens de invocación) y abre la Botonera de esa
  invocación puntual (`abrirBotonera(fichaId, mensaje, invId)`, que suma
  `&inv=<id>` a la URL del iframe o lo manda por `postMessage` si ya
  estaba cargado — `ficha-personaje/ficha.html` lo lee con
  `modoBotoneraInv`). Vida/SP/No2 se
  guardan en la ficha o en la parte privada del creep; barras y aura, en el
  propio token (`barras {hp,sp,no2}`, `aura {radio, forma, color}`: radio en casilleros enteros, forma `hex` (casillas a ≤ radio pasos, `dibujarAuraHex`; por defecto) o `circulo`). La ronda de botones va por fuera de las casillas vecinas (1,5 casilleros, tope 200 px). Un token sin ficha ni creep
  vinculado puede llevar su propia `imagen` (cuadrada, 96 px, < 60 KB;
  `prepararImagenToken`), que se elige en ese mismo panel o ya al crearlo
  (panel "Nuevo token": el selector de imagen aparece sin vincular, se
  esconde al elegir un vínculo). El panel se
  acomoda para no salirse del mapa (`hudAcomodarGlobo`). Ojo: lo que
  `escucharTokens` no copie del documento se pierde al volver de Firebase.
- **"+ Token" abre una ventana propia** (`#nuevo-token-capa`/
  `#nuevo-token-ventana`, centrada con el fondo oscurecido; antes se armaba
  en la barra lateral, decidido 2026-09-19), ordenada por campos (tipo,
  vínculo, dueño, nombre, imagen, color) con Cancelar / Poner en el mapa
  al pie. Se cierra sin crear con la ✕, Cancelar, **Esc** o **clic
  derecho** (fuera de un campo de texto) — `cancelarNuevoToken`. La barra
  lateral queda con su panel de siempre mientras tanto.
- **El GM crea un token de "pj" a nombre de otro jugador** (ventana "Nuevo
  token", solo si `soyGM`): la lista de "Vincular a" muestra las fichas de
  todos los jugadores (no solo las del GM, que normalmente no tiene) con
  el dueño al lado (`opcionesVinculo(tipo, elegido, todasLasFichas)`), y
  aparece un selector "Dueño" (`opcionesDueno`, mismo formato que "Cambiar
  dueño" del panel de edición) que arranca en el dueño de la ficha
  elegida y se puede cambiar a mano. Sirve para armar de antemano el token
  de cada jugador en un mapa guardado que todavía no se publicó (ver
  "Varios mapas guardados" más abajo) — el jugador después ya lo puede
  mover, no hace falta reasignarlo aparte. Las reglas lo permiten: crear
  un token "pj" con `duenoUid` de otro solo si `esGM(c)`.
- **Cartel del token seleccionado** (`#token-etiqueta`, `actualizarEtiquetaToken`,
  llamada desde `hudUbicar`): fijo arriba a la derecha del mapa, con el
  nombre y, entre paréntesis, el dueño (el jugador, o "GM" en un creep o
  NPC) — no se achica con el zoom, a diferencia del nombre que se dibuja
  en el canvas debajo del token.
- **🦶 Mover libre** (`moverLibre`, `moverTokenLibre`): botón del HUD que
  prende un "modo" (no una acción de una vez — decidido 2026-09-19): con
  el botón activo, se arrastra el token o se toca la casilla destino
  tantas veces como haga falta, sin No2, sin estela, ignorando
  Inmovilizado, y el modo sigue prendido después de cada movimiento — ya
  no hay que volver a tocar 🦶 para el siguiente. Lo apaga el mismo
  botón (toggle), Esc, clic derecho en el mapa (en vez del ping), o cambiar la selección a otro token. Lo ve el
  dueño en su PJ y el GM en cualquier token. Borra `ruta` del documento;
  las reglas dejan al GM tocar `col`, `fila` y `ruta` de un PJ.
- **🧰 Caja de herramientas** (`#toolkit`, `HERRAMIENTAS`, `renderToolkit`):
  barra vertical escondida a la izquierda del mapa; la pestaña del borde la
  abre y cierra deslizándola (abierta o no se recuerda en `localStorage`
  `mapa-toolkit-abierto`; abierta, corre el orden de turnos). La barra
  solo lista los botones (icono + nombre + detalle) — Lápiz y Terreno y
  Formas ya están armadas (una herramienta lista lleva `lista: true` y se
  activa en `herramientaActiva`). Preguntas en `docs/preguntas-abiertas.md`
  (P41 sigue abierta: los efectos mecánicos del Terreno al pisarlo, más
  allá de lo visual). **📖 Bitácora** es la excepción: no es un modo de
  dibujo, así que su clic no toca `herramientaActiva` — abre o cierra del
  todo `#bitacora-flotante` (`abrirBitacoraFlotante`, recordado en
  `localStorage` `mapa-bitacora-abierta`).
  - **Ventanita propia por herramienta** (decidido 2026-09-19: antes las
    opciones se desplegaban adentro de la barra lateral, una debajo de la
    otra — incómodo y sin límite de alto): la herramienta activa (Lápiz o
    Terreno y Formas — nunca las dos a la vez) muestra sus controles en
    `#herramienta-flotante` (`renderHerramientaFlotante`), una ventanita
    aparte a la derecha de la barra (no tapa `#elem-edit`, que vive del
    otro lado del mapa). Tiene su propia ✕ para salir.
  - **Salir de la herramienta activa**: la ✕ de su ventanita, tocar el
    mismo botón de nuevo, **Esc**, o **clic derecho en el mapa**
    (`desactivarHerramienta`) — decidido 2026-09-19, porque no quedaba
    claro cómo volver al cursor normal sin ir a buscar el botón. Con
    ninguna herramienta activa, el clic derecho hace otra cosa: mandar un
    ping (ver más abajo) — nunca las dos a la vez, se decide por si
    `herramientaActiva` tiene algo.
- **✏️ Lápiz** (cualquier miembro): dibuja a mano sobre el lienzo mientras
  `herramientaActiva === 'lapiz'` (arrastrar el mouse/dedo con el botón
  primario). El trazo se suaviza y se achica con **Douglas-Peucker**
  (`simplificarTrazo`, tolerancia `2.5/zoom`, en unidades del mapa — saca
  puntos de más sin cambiar la forma, así el temblor del pulso no queda)
  y se dibuja con curvas cuadráticas por los puntos medios (`trazarSuave`,
  no polígono recto). Vive en `campanas/{id}/trazos` (o
  `mapas/{id}/trazos` — mismo patrón de mapa principal/guardado que
  tokens) como `{puntos:[x1,y1,…] relativos a origen, origen:{x,y},
  rotacion, color, grosor, permanente, duenoUid, creado}`.
  - **Por defecto (`lapizPermanente=false`)**: es una estela más — se ve
    `TRAZO_MS` (3 s) y se borra sola. El que la ve programa su propio
    borrado al llegar el snapshot (`escucharTrazos`); las reglas dejan
    borrar un trazo no permanente a cualquier miembro, así no importa si
    el que la dibujó ya se fue.
  - **"Dibujo permanente" tildado**: queda como un objeto que se
    selecciona (clic sobre la línea, `trazoEn`, hit-test contra cada
    segmento en el sistema propio del trazo — deshace traslación y
    rotación), se arrastra para moverlo (traslada `origen`) y se rota
    con un handle celeste a `HEX*0.9` de su centro
    (`trazoManijaMundo`/`rotandoTrazo`, mismo criterio 0°=abajo/sentido
    horario que el de los tokens, pero rotación libre, sin encajar en 60°).
    Delete/Backspace lo borra. Lo mueven, rotan o borran su dueño o el GM
    (`puedeManipularTrazo`); cualquiera lo ve.
  - Color (paleta `COLORES`) y el tilde de permanente están en su
    ventanita (`#herramienta-flotante`) mientras está activo, se recuerdan
    por navegador (`lapiz-color`, `lapiz-permanente`).
  - `trazoSeleccionado` y la selección de token (`seleccion`) son
    mutuamente excluyentes (`trazoSeleccionar`/`seleccionar` se limpian
    entre sí).
  - **Atajos** (2026-09-19; no andan mientras se escribe en un campo; los botones lo avisan en su cartel al pasar el mouse): **`H`** abre y cierra la caja de herramientas. **`L` o `Ctrl+L`** prende o apaga el Lápiz (2026-09-19; no
    anda mientras se escribe en un campo). Ojo: en algunos navegadores
    Ctrl+L no se deja interceptar y salta a la barra de direcciones; la `L`
    sola anda siempre.
  - **Dos estilos** (`lapizEstilo`, `localStorage` `lapiz-estilo`, selector
    en su ventanita, decidido 2026-09-19): **Libre** (lo de arriba) y **Por
    casilleros**, un marcador de trayectoria como la estela de movimiento
    de un token pero sin token, sin costo de No2 y sin que los sólidos lo
    frenen: se arrastra casillero por casillero (`extenderRuta` con
    `marcador: true`; volver sobre una casilla recorta) y se dibuja con
    `dibujarRutaHex` en el color elegido. Mismo tilde: sin tildar se borra
    solo (`TRAZO_MS`); tildado ("Trayectoria fija") queda atado a la
    grilla. Vive en la misma colección `trazos` con `hex: true` y `puntos`
    = `[col,fila,col,fila,…]` (tope `RUTA_MAX_CELDAS`); en memoria se lee
    como `celdas`. Un fijo se selecciona (clic sobre cualquiera de sus
    casillas, saliendo de la herramienta) para borrarlo con Suprimir; **no
    se mueve ni se rota** (sigue a la grilla). Reglas: `hex` opcional, y
    con `hex` alcanzan 2 números (una casilla).
- **⬡ Terreno y Formas** (cualquier miembro; una sola herramienta desde
  2026-09-19 — antes eran dos separadas, con el mismo dato y mecanismo
  por debajo, así que quedó un solo botón con un tilde de "Sólido" en vez
  de duplicar todo el panel): crea elementos atados a la grilla
  hexagonal — nubes, humo, charcos, fuego, muros, cajas, lo que haga
  falta narrativamente — transitables o sólidos según ese tilde, con
  color o imagen y transparencia. Vive en `campanas/{id}/elementos` (o
  `mapas/{id}/elementos`, mismo patrón que tokens/trazos) como
  `{tipo:'flor'|'linea'|'libre', origen:{col,fila}, celdas:[dq1,dr1,…]
  (offsets en cubo desde origen, sin rotar), rotacion (0/60/…/300),
  color, alfa (10-100), solido, invisible, imagen, imgZoom/imgDX/imgDY,
  fijado, duenoUid, creado}`. Estado del panel en `elemTipo`/`elemTamano`/
  `elemColor`/`elemAlfa`/`elemSolido`/`elemInvisible`/`elemImagen`
  (`localStorage` `elem-*`, menos la imagen que no se recuerda entre
  sesiones a propósito).
  - **Actualización 2026-09-19 — ni la Línea ni la Flor llevan número:**
    el tamaño lo da el arrastre y no hay campo `#elem-tamano-input`. Línea:
    casilleros hasta donde está el mouse, en la dirección de las 6 más
    cercana (tope `LINEA_MAX_CELDAS` = 100). Flor: el clic fija el centro
    y el radio es la distancia hasta el mouse (tope `TAMANO_ELEMENTO_MAX`
    = 30); un clic sin arrastrar deja una sola casilla. Lo de "radio/largo
    en un `<input type=number>`" más abajo quedó viejo.
  - **3 formas al crear**: **Flor** (radio, mismo cálculo de anillos que
    `dibujarAuraHex`, `celdasFlor`) se crea de un solo clic; **Línea**
    (largo, `celdasLinea`) y **Forma libre** (`dibujandoElemento`, agrega
    cada casilla que el mouse pisa) se arman arrastrando desde el primer
    clic hasta soltar. El radio/largo se escribe en un
    `<input type=number>` (`#elem-tamano-input`, `TAMANO_ELEMENTO_MAX` =
    30, decidido 2026-09-19 sobre los botones 1/2/3 de antes — se puede
    pedir uno mucho más grande). El `input` actualiza en vivo sin
    recortar (para no pelear con lo que se está tipeando); el `change`
    (al salir del campo) sí lo encaja entre 1 y 30 y lo guarda en
    `localStorage`. El tope real de casilleros lo pone Firestore
    (`celdas.size() <= 6000`, ver `docs/workflow-firebase.md`) — a radio
    30 una Flor usa ~2800.
  - Una vez creado: se selecciona (clic sobre cualquiera de sus casillas,
    `elementoEn`, hit-test exacto por casillero — no por geometría como
    el trazo libre), se arrastra para reubicarlo (traslada `origen`,
    sigue atado a la grilla) y se rota de a 60° con un handle celeste a
    `HEX*1.6` de su casillero origen (`elementoManijaMundo`/
    `rotandoElemento`, mismo criterio 0°=abajo/sentido horario que
    tokens y trazos, pero encajado a 60° como un token). Delete/Backspace
    lo borra. Lo mueven, rotan o borran su dueño o el GM
    (`puedeManipularElemento`); cualquiera lo ve y lo selecciona (para
    mirarlo), aunque no lo pueda mover.
  - `celdasDeElemento(el)` calcula las casillas absolutas que ocupa ahora
    (origen + cada offset, rotado con `rotarCubo`) — ahí se apoya
    selección, arrastre, hit-test y la colisión de un sólido
    (`elementoSolidoEn`, ver abajo). **`cuboACol`/`cuboAFila`** son la
    inversa de `hexACubo` (col es literalmente `q`; fila hay que
    reconstruirla con el mismo ajuste de paridad que usa `hexACubo`, pero
    sobre `col`, no sobre `r`) — antes de este arreglo (2026-09-18) la
    fórmula vieja de `cuboACol` desplazaba mal las casillas rotadas o
    vecinas, bug que ya traía `dibujarAuraHex` desde antes (las auras de
    radio > 0 podían quedar corridas) y que se coló acá al compartir la
    función; se corrigieron los dos usos.
  - `elementoSeleccionado` es mutuamente excluyente con `seleccion` y
    `trazoSeleccionado` (`elementoSeleccionar` limpia los otros dos).
  - Se dibuja en el piso, debajo de los tokens y encima del fondo.
  - **Sólido** (`elem-solido-check`): bloquea ese casillero para cualquier
    token y cualquier ruta que lo cruce (`elementoSolidoEn(col, fila)`,
    recorre `elementos` filtrando por `solido`) — **"avisa y bloquea"**
    (decidido 2026-09-18, sobre pathfinding automático — ver
    `docs/preguntas-abiertas.md` P46): al soltar un arrastre de token con
    `pasos > 0`, si algún casillero de la ruta (menos el de partida)
    tiene un sólido encima, no se mueve — toast avisando y listo, el
    jugador vuelve a arrastrar a mano por otro lado. No hay rodeo
    automático. Por ahora la colisión es contra sólidos nomás, para
    cualquier token sea o no aliado — la colisión token-contra-token
    (aliado/enemigo/neutral) y el "no compartir hexágono en combate"
    quedan para cuando se sume el concepto de bando, ver "Pendiente" más
    abajo. Sin tildar, es transitable (Terreno de siempre) sin efecto
    mecánico todavía más allá de lo visual (P41 sigue abierta).
    Destildarlo después de crear el elemento no se puede — es de las
    cosas fijas al crear (junto con tipo/celdas), para eso se borra y se
    crea uno nuevo (ver ⚙️ más abajo).
  - **Actualización 2026-09-19 — el token se choca:** en vez de dejar
    cruzar el obstáculo y cancelar recién al soltar, `extenderRuta`
    corta el avance en la última casilla libre (devuelve `chocado`) y el
    token se queda apoyado ahí (a lo sumo `HEX*0.3` hacia el mouse, cursor
    "no permitido") mientras el mouse siga del otro lado; volver hacia
    atrás lo suelta. Al soltar chocado, se mueve hasta esa casilla libre y
    avisa con un toast. Lo de "no se mueve, toast y listo" de arriba ya no
    aplica; queda el chequeo viejo solo como resguardo. Sigue sin haber
    rodeo automático (P46).
  - **Actualización 2026-09-19:** "Invisible para jugadores" ya no
    depende de Sólido: el GM lo tilda al crear o después desde el ⚙️
    (`elem-edit-invisible`, en vivo como el resto), y lo ven el GM **y el
    creador** (`puedeVerElemento`), no solo el GM. La transparencia puede
    ser 0: el GM y el creador ven el contorno punteado igual; el resto no
    ve nada (salvo un sólido, que siempre muestra su borde rojo). Lo de
    abajo quedó desactualizado en esos puntos.
  - **Invisible para jugadores** (checkbox que solo aparece con Sólido
    tildado y siendo GM): pensado para marcar sobre el fondo ya dibujado
    del mapa qué zonas son intransitables sin agregar un dibujo de más —
    el GM ve el contorno punteado violeta (bien distinto del rojo de un
    sólido visible), los jugadores no ven nada ahí (`elementos.forEach`
    se la salta del todo si `el.invisible && !soyGM`), pero la colisión
    sigue aplicando igual (`elementoSolidoEn` no mira `invisible`). Solo
    se puede activar siendo `soyGM` (cliente: el checkbox ni aparece si
    no; reglas: `invisible: true` exige `esGM(c)` al crear). No se puede
    seleccionar (`elementoEn` se lo salta) si no se ve. Destildar Sólido
    no borra el tilde de Invisible por debajo (`elemInvisible` sigue en
    memoria), pero no importa: `guardarElemento` solo lo manda si
    `elemSolido` también está tildado, así que nunca se filtra un
    invisible sin sólido.
  - Un sólido visible (no invisible) se dibuja con un borde de
    advertencia fijo (rojo) además de su color elegido, para que se note
    que bloquea el paso más allá de qué color tenga.
  - **Imagen de fondo** (opcional): bajo la transparencia, "Elegir
    imagen"/"Cambiar"/"Quitar" (`imagenElementoOpcionHtml`,
    `#elemento-imagen-archivo`) sube una textura que queda guardada en
    `elemImagen` (data URL, **no** se recuerda entre sesiones a
    propósito — a diferencia de color/tipo/tamaño/sólido) y se pega al
    próximo elemento que se cree. `prepararImagenElemento` la achica
    preservando el alto/ancho (no la recorta cuadrada — no tiene sentido
    para una figura larga como una Línea) con tope ~120 KB
    (`ELEMENTO_IMG_LADO`/`ELEMENTO_IMG_MAX`). Al dibujar, la imagen cubre
    ("cover", `cajaCeldas` calcula la caja que envuelve todas las
    casillas) el área del elemento, clipeada a su forma real (igual que
    la imagen de un token); si no tiene imagen, sigue siendo el color
    plano de siempre. **La imagen gira con el elemento** (arreglado
    2026-09-19): se calcula sobre las casillas sin rotar
    (`celdasDeElemento(el, true)`) y el canvas se rota alrededor de la
    casilla origen; `imgDX`/`imgDY` están en ese marco sin rotar, y el
    visor del ⚙️ también lo muestra sin rotar.
  - **📌 Pinear / 🔓 despinear** (botón que aparece junto a la manija de
    rotar al seleccionar un elemento que se puede manipular,
    `elementoPinMundo` — mismo radio que la manija pero siempre del lado
    opuesto, así nunca se pisan): un elemento pineado (`fijado: true`)
    pasa a comportarse como el terreno de abajo — no se puede mover ni
    rotar (la manija ni aparece) y clickear-y-arrastrar sobre él mueve
    el mapa (paneo) en vez de arrastrarlo. Sigue siendo seleccionable
    con un clic (sin arrastrar) para poder despinearlo después. Lo
    pinea/despinea su dueño o el GM, igual que mover/rotar (reglas:
    `fijado` sumado a los campos que se pueden tocar en un `update`).
    Pensado para "asentar" un elemento ya bien puesto y no volver a
    tocarlo por accidente al arrastrar el mapa alrededor.
  - **⚙️ Editar un elemento ya creado** (botón que aparece junto a rotar
    y pinear al seleccionarlo, a 90° de la manija de rotar —
    `elementoGearMundo`, `abrirEditorElemento`/`renderEditorElemento` en
    `#elem-edit`, panel flotante a la derecha del mapa, sin tapar la
    Mesa): deja cambiar color, transparencia e imagen (elegirla,
    cambiarla, quitarla, y si tiene, arrastrarla/hacerle zoom dentro de
    su forma — mismo mecanismo de cover que al dibujarla, con
    `imgZoom`/`imgDX`/`imgDY` guardados en el elemento). Todo se aplica
    **en vivo** sobre el elemento de verdad apenas se toca un control
    (`vivo()` muta el objeto en memoria y llama `pedirDibujo()`), así se
    ve cómo queda en el mapa de una, sin adivinar — recién se guarda de
    verdad en Firestore al tocar "Guardar"; "Cancelar", la ✕ o Esc
    reponen los valores de antes de abrir el editor
    (`editandoElemento.original`). `tipo`/`celdas`/`solido` no se pueden
    tocar ahí — para eso hay que borrar el elemento y crear uno nuevo.
    Cambiar de elemento seleccionado, o que lo borren mientras se edita,
    cierra el editor solo (cancelando lo que no se había guardado).
- **Bitácora flotante** (`#bitacora-flotante`): mismo dato y mismos
  permisos que la de la ficha (`campanas/{id}/bitacora/{página}` +
  `entradas/{id}`, todos leen, cualquiera suma/corrige, borra el autor o
  quien creó la página o el GM — ver
  [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md)), pero
  acá vive en una cajita arrastrable en vez de una tarjeta fija, con el
  mismo patrón que `#mesa` en `comun/mesa.js`: se arrastra desde la
  cabecera, un clic la achica o la agranda (`localStorage`
  `bitacora-colapsada` y `bitacora-posicion`, sin el prefijo `mapa-`) y ✕
  la cierra del todo (vuelve a abrirse con 📖 en la caja de
  herramientas). Se conecta a Firestore recién al abrirla la
  primera vez (`bitacoraEscuchar`, con guarda para no duplicar
  suscripción), no de arranque como la Mesa. **🎚️ en la cabecera** abre un
  desplegable con la transparencia (30–100 %, `localStorage`
  `bitacora-opacidad`): solo cambia el fondo de la cajita
  (`colorConAlfa(--panel, …)`, la misma función que usan las auras), el
  texto y los botones quedan siempre nítidos.
- **Páginas de la Bitácora, de una por vez** (arreglado 2026-09-19: antes
  se listaban todas juntas en una fila que se agrandaba sin límite a
  medida que se sumaban páginas): en vez de una pestaña por página,
  `#bitacora-tabs` muestra solo la activa con flechas ◀/▶ a los costados
  (`bitacoraIrPagina(±1)`, según el orden de `bitacoraPaginas` —
  `orderBy('creado')`) y un contador "2/4". Deshabilitadas en las puntas
  (no da la vuelta). Renombrar (el input) y borrar (×) siguen igual,
  ahora sobre la página activa nomás.
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
  la invocación (`<fichaId>~<idInvocación>`, sale del resumen de la ficha —
  vida, No2 y estados, apagada si no está invocada) o el creep, y dibuja debajo la barra de vida (roja), en PJ la de SP
  (azul), y en cualquiera la de No2 (verde, si su dueño la prende); arriba, circulitos con la inicial de cada estado (verde
  beneficio, violeta perjuicio). Caído/derrotado: oscurecido con una ✕.
  Lee `fichas` y `creeps` (solo lo público). De los creeps solo llega el
  porcentaje de vida.
- **Imagen propia de un token sin vincular** (NPC, objeto, etc.; `t.imagen`,
  botón "Elegir imagen"/"Cambiar" del HUD, `elegirImagenToken`): se recorta
  a un cuadrado chico (`TOKEN_IMG_PX` 96px, tope `TOKEN_IMG_MAX` 60 KB) con
  `comun/recorte-imagen.js`, que antes de achicarla deja arrastrar y hacer
  zoom para elegir qué parte de la foto se ve — no siempre el centro. Igual
  al crear un token nuevo con imagen desde el formulario "+ Token". Dibujada
  en el canvas, la imagen queda recortada al hexágono del token
  (`ctx.clip()` sobre sus vértices), no a un círculo — el recuadro del
  recorte es cuadrado nomás, alcanza para elegir la zona sin tener que
  calcar el hexágono exacto.
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
- **🗺 Varios mapas guardados** (botón de la cabecera, con el nombre del
  mapa que se está mostrando; solo el GM puede abrirlo y hacer algo,
  jugadores lo ven pero deshabilitado): el GM arma de antemano escenarios
  con su propio fondo, sus tokens, su modo narrativo/combate y su orden de
  turnos (`MAPA_PRINCIPAL`, `mapaActivo`, `mapaMostrado`,
  `mapaEligiendoGM`, `mapasLista`, `cambiarMapaMostrado`,
  `recalcularMapaMostrado` — esquema completo en
  [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)). "Ver"
  cambia lo que el GM está mirando (y armando) en su propia pantalla;
  "Publicar" cambia lo que ven los jugadores — pueden ser mapas distintos
  a la vez, así el GM arma el escenario 2 sin que nadie lo vea todavía. El
  botón de la cabecera se resalta cuando el GM está viendo un mapa
  distinto del publicado. Sin límite de mapas guardados; se renombran y se
  borran (salvo el primero, `MAPA_PRINCIPAL`, que sigue siendo el que
  había antes de esta función — no se le movió ningún dato).
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
- **Ping (clic derecho en el mapa)**: un anillo que se expande y se apaga
  solo (`PING_MS` 1,8 s), con el nombre de quién lo mandó — "miren acá",
  para todos, sin tener que ir a buscar ningún botón (decidido
  2026-09-19: clic derecho, no doble clic — hoy no hace nada en el
  lienzo, así que no choca con nada; `contextmenu` se cancela ahí para
  que no salga el menú del navegador). Anda con cualquier herramienta
  activa, sin tocar selección ni arrastre. Vive en `campanas/{id}/pings`
  (o `mapas/{id}/pings`, mismo patrón que trazos/elementos): `{x, y,
  duenoUid, creado}`, siempre efímero — nadie lo edita ni lo borra a
  mano, se borra solo (`escucharPings`, mismo mecanismo de auto-borrado
  que un trazo no permanente).

Los permisos los imponen las reglas (`../firebase/firestore.rules`), no solo
la interfaz: el GM **no** mueve un token de PJ ya creado (solo reasigna el
dueño); sí puede crear uno nuevo a nombre de otro jugador (ver arriba).

- **Dados 3D** (`../comun/dados3d.js`, también en gm-tools): cada tirada
  nueva de la Mesa rueda encima del mapa y cae en el resultado real. En la
  cabecera de la Mesa, 🎲 prende o apaga la animación y "⚙ dados" abre
  `../comun/prueba-dados.html` para elegir el estilo (por navegador, en
  `localStorage` 'dados3d'). No escribe nada en Firebase.

## Pendiente (más adelante)

Alcance y movimiento; niebla; tiradas desde el token.

**Colisión token-contra-token de Formas** (decidido 2026-09-18: "Todos
los PJ aliados, creeps enemigos por default" — ver
`docs/preguntas-abiertas.md` P40): falta sumar un campo `bando` al creep
(`enemigo` default | `aliado` | `neutral`, editable por el GM en
gm-tools.html) y, en mapa.html, el chequeo simétrico al de
`elementoSolidoEn` pero entre tokens (un PJ colisiona con un creep salvo
que sea `aliado`; un creep colisiona con todo lo que no sea de su mismo
bando; `neutral` colisiona con cualquiera, incluso otro neutral) más la
regla aparte de que, en modo combate, ningún personaje comparte
hexágono con otro sin importar bando. Todavía no está construido.

## Dependencias con otras carpetas

- `../firebase/firestore.rules` — reglas de `tokens` y `tiradas`.
- `../comun/sesion.js` — cuenta y partida (`?partida=<id>`); sin sesión o
  sin ser miembro vuelve al inicio (`../index.html`). El botón ⌂ vuelve a
  la partida.
- `../comun/mesa.js` y `../comun/tiradas.js` — la Mesa y las fórmulas de
  dados, compartidas con la ficha y gm-tools (el mapa define
  `MESA_DESDE = 'mapa'` y `mesaQuien()`, y tiene su propio HTML de Mesa).
