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
- **Cabecera en una línea** (2026-09-19): para que entre, salieron de la
  cabecera el **switch de modo y el zoom −/+** (ahora flotan sobre el mapa, arriba a
  la derecha, `#flotantes-mapa`; los carteles del token y del elemento
  seleccionado bajaron debajo de ellos) y **+ Token** (que después de pasar por una
  barra del costado volvió a la cabecera, con el (?) de la guía de colores adentro del botón, `#ayuda-token`; y "Personalización 🎲" de los dados pasó al pie de la grilla de dados);
  y la niebla y el ojo pasaron al menú 👁. La cabecera quedó con: ☰, título y
  estado, Mapas, + Token (?), GM Tools/Mi ficha, Personajes, Fondo y Centrar (Dados pasó al borde izquierdo del mapa).
  📋 Tablero se sumó después, junto a GM Tools/Mi ficha (ver más abajo).
- **⌨ Lista de atajos** (2026-09-19): un ícono a la derecha de todo de la
  cabecera (`#ayuda-atajos`) que al pasar el mouse muestra el globo con todos
  los atajos de teclado y del mouse (D, H, L, F, M, B, Ctrl+B, Enter, Esc,
  Supr; clic derecho, rueda, arrastrar). **Es texto fijo en el HTML: al
  sumar, sacar o cambiar un atajo, hay que actualizar esa lista.**
- **👁 Menú del ojo (GM)** (2026-09-19; ahora entre el zoom y el switch de modo, en el grupito flotante `#flotantes-mapa`, antes en la cabecera): un botón cuadrado con el ícono 👁 en
  ese grupo (`#btn-ojo-menu`, solo para el GM) abre hacia abajo un
  desplegable (`#ojo-menu`, `abrirMenuOjo`; se cierra al elegir algo, al tocar
  afuera o con Esc) con: **🌫 Niebla: sí/no**, **👁 Como jugador** (solo con la
  niebla prendida), **👁 Revelar lo oculto** y **↺ Restablecer niebla**
  (`nieblaReiniciar`: vuelve a tapar todo lo descubierto, con confirmación, y **borra también las marcas de "última posición vista"** de personajes y creeps en todas las pantallas).
  El botón cuadrado se resalta si la niebla está prendida o en "Como
  jugador", y va en rojo mientras se está revelando lo oculto. Reemplaza a
  los tres botones sueltos que había, para que la cabecera entre en una línea.
- **🌫 Niebla de guerra** (2026-09-19, primer paso; diseño en `../docs/preguntas-abiertas.md`
  P47–P54). Doc `campanas/{id}/mapa/niebla` (o `mapas/{id}/estado/niebla`) =
  `{activa, descubiertas:[celdas empaquetadas con nbPack], actualizado}`.
  **Doble niebla**: negra (nunca vista: no se ve ni mapa ni tokens) y gris
  semitransparente (ya descubierta, fuera de la visión de ahora: se ve el
  mapa, no los tokens que no sean aliados). Se dibuja en `dibujar` entre los
  trazos y los pings (evenodd: cuadro entero menos casillas descubiertas o
  a la vista). **Campo de visión por defecto** (`offsetsVision`,
  `celdasVisionDe`): radio `VISION_RADIO` = 6 menos una cuña ciega de 120°
  hacia atrás (las diagonales traseras sí se ven); gira con el frente del
  token. Todos los tokens `pj` — **incluidas las invocaciones mientras estén invocadas y vivas** (`daVision`) — salvo los ocultos, dan visión y
  cada jugador ve la **unión** de todos; los tokens `pj` se ven siempre, el
  resto solo dentro de esa unión (`tokenVisiblePorNiebla`, usado en
  `calcularDisposicion`, auras y estelas). Lo descubierto es **del grupo y
  persiste**: `nieblaActualizar` (al empezar a dibujar, solo si algo se
  movió) anota las casillas nuevas de los tokens que cada uno puede mover
  (el GM, todas) y `nieblaProgramarGuardado` las sube con `arrayUnion`
  (400 ms de espera). **Última posición vista**: `nieblaFantasmas`, una
  marca "?" atenuada donde se vio por última vez a un token no aliado que
  salió de la visión (solo en memoria de cada navegador). **GM**: botón
  `🌫 Niebla: sí/no` en la cabecera (prende/apaga por mapa) y, con la niebla
  prendida, `👁 Como jugador` (por navegador, `niebla-como-jugador`); sin él,
  la niebla se le insinúa (negra al 40 %, gris al 25 %), **pintada por debajo de las estelas, las auras y los tokens** (`pintarNiebla`, 2026-09-21) para que se lean bien los nombres y las estelas aunque estén en zona tapada; a los jugadores y con "Como jugador" tapa todo, encima de los tokens. Herramienta
  `🌫 Niebla` (solo GM) en la caja de herramientas: pincel de radio 0–5 para
  **destapar o tapar a mano** (`nieblaPintar`, `arrayUnion`/`arrayRemove`) y
  "Reiniciar (tapar todo)". Pendiente: obstáculos que tapen la vista (P52),
  filtrar el orden de turnos y otras listas que nombran tokens fuera de la
  visión, y ocultar de verdad (hoy es solo visual, P54).
- **🕶 Sigilo, pasos 1 y 2** (2026-09-19; diseño en `../docs/plan-sistema-nuevo.md`,
  "Sigilo"). Todo visual. **Estado:** preset de estado alterado **"Sigilo"**
  (no vence) en la ficha (`EFECTOS_PRESET`) y en gm-tools
  (`ESTADOS_PRESET_GM`); el mapa lo detecta por el nombre en el resumen de la
  ficha o del creep (`enSigilo`). Un token en sigilo se dibuja
  semitransparente; **un creep en sigilo no lo ven los jugadores** y **un
  personaje en sigilo no lo ve el GM** (`tokenVisiblePorNiebla`); quien tiene
  un personaje suyo en sigilo ve el mapa con un **filtro violáceo tenue**
  (`yoEnSigilo`, al final de `dibujar`). **Ojo del GM:** botón
  `👁 Revelar lo oculto` en la cabecera (`ojoRevelando`, `#btn-ojo`, se apaga
  al recargar): al prenderlo se publica en la Mesa una línea
  `desde: 'alerta'` que en **todas las pantallas** de la partida (mapa,
  ficha, gm-tools; `comun/mesa.js`, `mesaAlertaOjo`) sale como fila roja y
  dispara un destello rojo con un ojo 👁 grande que aparece de golpe y a ~1 s
  se apaga con fade (el ojo es el PNG `comun/ojo.png`, con fondo transparente; si no carga, queda el emoji 👁).
  Al volver a la visión normal (apagar el 👁) también queda una línea común en la Mesa: "El GM dejó de revelar lo oculto", sin destello. Si no se puede publicar el aviso de revelar,
  no se revela nada. Un token seleccionado que deja de verse (niebla o
  sigilo) se suelta solo. **Botón directo en la ficha:** quien tiene la
  habilidad "Sigilo" ve arriba de la Botonera `🕶 Entrar en sigilo · 1 No2`
  (`alternarSigilo`, `IT2.nitrosSigilo`, a revisar) que aplica el estado sobre
  uno mismo, y `🕶 Salir del sigilo` (gratis) — sin pasar por "+ Estado", y
  sin aviso en la Mesa. (Que el GM abra la ficha del que está en sigilo está bien: no dice dónde está.) Todavía falta:
  la ruptura automática y el aviso de tiradas (ver el paso 3).
- **🕶 Sigilo, paso 3: cono, alerta y girar** (2026-09-19). **Cono** de 16
  hexágonos (`zonasSigilo`, `CONO_LADO`): rombo de 4 × 4 que arranca delante
  del token (filas de 1, 2, 3, 4, 3, 2 y 1) y **zona de alerta**: el anillo
  alrededor del cono más los vecinos del token salvo el de atrás. Entrar en
  sigilo prende el modo lentes para poder verlos (ver "Entrar en sigilo ya
  no muestra todas las zonas de una", 2026-09-22, más abajo). Los elementos
  **Sólidos tapan la vista** (`solidosSet`, `lineaLibre`): lo que queda detrás de uno
  no cuenta ni para las zonas ni para la visión de la niebla. **Al caminar el
  token queda mirando hacia donde fue** (último paso de la ruta, gratis;
  `moverToken`). **Girar con el handle ↻ NO cuesta No2** (2026-09-24: se sacó la regla
  anterior de 1 No2 por giro de 60° en combate; `COSTO_GIRO_NO2 = 0`, el código
  de cobro quedó por si se quisiera volver a poner). Todavía falta: la ruptura automática del
  sigilo al entrar en un cono, el aviso de tiradas por pasos en la alerta y
  que el sigilo tenga en cuenta las invocaciones.
  **(Ya sin efecto desde 2026-09-24, girar es gratis siempre; `abrirGiroLibre` no hace nada con `COSTO_GIRO_NO2 = 0`.) Giro gratis después de moverse** (2026-09-19, en combate): al soltar un
  movimiento el token (personaje, creep o invocación) tiene **derecho a elegir
  hacia dónde queda mirando sin gastar No2** — su primer giro con el ↻ es
  gratis (`giroLibre`, `abrirGiroLibre`); una vez establecida esa dirección,
  cada giro cuesta 1 No2 por giro de 60°. **Si decide quedarse mirando hacia
  donde llegó, esa es su elección (el giro gratis se gastó sin girar)**: la
  ventana se cierra con **cualquier acción que venga después, propia o ajena**
  (`cerrarGirosLibres`): que ese u otro token se mueva, que avance el turno de
  la iniciativa, o que llegue una tirada nueva a la Mesa que no sea un aviso
  del sistema (ataque, habilidad, tirada libre: `mesaAlAccionNueva`, avisado por
  `comun/mesa.js`); también con el próximo Mantenimiento o al cambiar de mapa.
  **Con 🦶 Mover libre prendido el HUD se limpia** (2026-09-19): solo queda el pie, en rojo y pulsando, y el ↻ (`libreActivo` en `hudHtml`); desaparecen los demás botones del anillo y los globos abiertos, para que se note que el modo está activo. **Girar no cuesta nada** con 🦶 Mover libre prendido, ni cuando el GM gira el token de un jugador (no puede tocar su ficha, así que antes fallaba con "No se pudo cobrar el giro"); en esos casos tampoco se gasta el giro gratis.
  Vive en cada navegador (recargar la página la pierde).
- **Entrar en sigilo ya no muestra todas las zonas de una** (2026-09-22, a pedido del dueño; reemplaza el párrafo de "quien está en sigilo ve las zonas..." de más abajo): antes, apenas un jugador (o el GM con un creep) entraba en sigilo, se dibujaban automáticamente **todas** las zonas de los rivales visibles (`zonasParaVer()`, ya eliminada). Ahora eso solo **prende el modo lentes** (`verZonas = true`, `revisarAutoLentes()`, disparado desde `escucharVinculables` al detectar la transición false→true de `huboAlguienEnSigilo()` — jugador: `yoEnSigilo()`; GM: algún creep suyo en sigilo) y las zonas se ven igual que con 👓 Ver conos normal: tocando un token puntual, o con "👁 Ver todas las zonas" si se quiere ver todo junto. **Acceso directo al 👁** (mismo pedido): con el modo lentes prendido y el menú del 👓 cerrado, un botón cuadrado 👁 queda flotando justo debajo del 👓 (`#btn-zonas-todas`, mismo dato que "Ver todas las zonas" del menú) para no tener que abrir el desplegable cada vez.
- **🕶 Sigilo, paso 4: detección** (2026-09-19). **Ruptura automática**: un
  token en sigilo que queda dentro del **cono** de un rival (creep si es
  personaje; personaje si es creep) pierde el sigilo solo —
  `sigiloRevisar`, en cada `dibujar` pero solo si algo cambió; lo hace el que
  maneja ese token (el dueño, o el GM con sus creeps) sacando el estado con
  `hudEstadoCambiar` — y sale una línea en la Mesa ("perdió el sigilo · lo
  detectó X"). **Al soltar** el token (no mientras se arrastra para evaluar
  rutas: P18), `sigiloEvaluarRuta` **corta la ruta en la primera casilla
  que cae en un cono**: aparece donde lo detectaron (P9). **Tiradas**: cada paso
  que da dentro de la **zona de alerta** de un rival cuenta como una tirada
  de detección; el mapa solo cuenta y publica en la Mesa "X dio N pasos en la
  zona de alerta de Y → N tiradas de detección" cuando el movimiento se guarda
  (`sigiloPublicarAvisos`); la tirada es manual (en principio Destreza contra
  Especial, P3). Caminar de espaldas al rival no cuenta (su punto ciego).
  **Marca de última posición** (P8): quien se esconde a la vista deja un "?" atenuado en su última posición vista por 2 turnos (`sigiloFantasmas`, `SIGILO_MARCA_TURNOS`, cuenta los Mantenimientos; solo en cada navegador). Pendiente de probar: las invocaciones.
- **Miniatura de reserva de los tokens** (2026-09-19): si una ficha no tiene
  `miniatura` publicada (el token se vería con la inicial), el mapa arma una
  desde su retrato (`fichas/{id}/partes/retrato`) una vez por sesión y la usa
  en memoria (`miniaturaDesdeRetrato`, `miniaturasLocales`); no escribe nada. También se usa si la miniatura publicada está rota o vacía (`verificarMiniatura`), y busca la foto en la parte `retrato` y, si no, en `general` (fichas viejas).
- **📜 en un creep vinculado** (solo GM): el HUD suma un botón que abre en otra
  pestaña **GM Tools con la ficha completa de ese creep** (`gm-tools.html?partida=…&editar=<creep>`;
  gm-tools abre su ventana "Editar creep" al cargar). Los tokens de personaje ya
  tenían su 📜 a la ficha.
- **Barra superior unificada** (`../comun/barra.js`, `barraTexto()`, sin
  personaje acá): `#estado` muestra "Partida · Usuario · GM"; ya no hay
  botón "⌂" (lo reemplaza el menú ☰, `../comun/menu-sitio.js`). Es la que
  copian las otras tres herramientas.
- **Modo narrativo / combate** (switch flotante arriba a la derecha del mapa, junto al zoom −/+ — `#flotantes-mapa`, 2026-09-19; antes estaba en la cabecera —, `modoMapa`, doc
  `campanas/{id}/mapa/modo` = `{modo}`): lo cambia el GM y lo ven todos.
  Narrativo (verde): la estela se ve pero mover no gasta No2
  (`costoMoverDe` devuelve null). Combate (rojo): mover gasta No2 y la
  confirmación solo aparece si el movimiento se pasa de los No2 que quedan;
  si alcanzan, se descuenta directo.
  Varios en la misma casilla se acomodan en ronda. La ficha también
  escucha este mismo doc (`modoMapaEscuchar`, su propio `modoMapa`) para
  reordenar la Botonera: habilidades sociales al final en combate, arriba
  de todo en narrativo — ver [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md).
- **Clic derecho mientras arrastrás un token cancela el movimiento** y vuelve a su casilla (`cancelarArrastreToken`, 2026-09-19).
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
- Panel del costado: Mantenimiento (GM) y, cuando hace falta, el panel de Editar token / Mapas / Fondo (2026-09-19: ya no hay barra de arriba con + Token, el (?) y Personalización). Los datos
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
  izquierda del mapa (`#iniciativa`, estilo "Turn Order" de Roll20) — **de
  siempre** (decidido 2026-09-22: antes visible solo en modo combate y
  quedaba escondido sin avisar; ahora aparece solo con cualquier miembro
  conectado, en narrativo también — vacío, muestra "Sin orden todavía").
  Vive en `campanas/{id}/mapa/iniciativa`
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
- **El GM puede ocultar cualquier fila del orden de turnos** (2026-09-19): en
  cada fila el GM tiene un botón 👁/🙈 (`data-ini-ocultar`) que la oculta o la
  muestra a los jugadores, sin importar el token (guarda `oculto: true` en esa
  entrada de `mapa/iniciativa`; antes solo se escondían las de tokens ocultos).
  Los jugadores no ven esa fila (el turno pasa igual cuando le toca, sin que se
  note que estuvo); el GM la ve marcada con 🙈. Hoy es solo visual: los datos
  llegan a todos, como el resto de lo oculto.
  **Flotante y arrastrable** (2026-09-19): el orden de turnos ya no queda tapado
  por los botones del dock de la izquierda — arranca a la derecha del dock y se
  **arrastra desde la cabecera** (`iniciativaEncuadrar`, posición relativa al
  mapa guardada por navegador en `mapa-iniciativa-posicion`, como la Bitácora);
  un clic sin arrastrar la achica o agranda, y **achicada se ve medio
  transparente** (55 %, se opaca al pasar el mouse).
  **Sigilo y orden de turnos** (2026-09-19): quien está en sigilo desaparece
  solo de la lista para el bando rival mientras dure — los jugadores no ven
  a los creeps en sigilo; el GM no ve a los personajes en sigilo salvo con su 👁
  (`ocultoPorSigiloParaMi` en `renderIniciativa`). El turno pasa igual cuando le toca.
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
  **🪪 Tarjeta del creep** (2026-09-22, `hudTarjetaHtml`): en cualquier
  token de creep (no en los de PJ), sin importar quién lo tenga
  seleccionado — su miniatura más grande, el equipo (solo nombres, sin
  DEF/mods/detalle) y los estados alterados (de solo lectura, sin los
  botones de editar de ◎), más la Nota narrativa si tiene una. Todo de
  solo lectura, pensado para que un jugador la abra desde el mapa sin
  preguntarle al GM. No hace falta ningún cambio de reglas: el documento
  del creep ya se lee entero con `esMiembro` (`equipoNombres`/`notas` se
  arman client-side en `escucharVinculables`, filtrando `equipo` a solo
  `nombre`); la imagen en detalle sigue siendo la `miniatura` pública de
  96 px — la imagen original de mayor resolución sigue siendo del GM
  (`creeps/<id>/privado/imagen`), a propósito.
- **"+ Token" abre una ventana propia** (`#nuevo-token-capa`/
  `#nuevo-token-ventana`, centrada con el fondo oscurecido; antes se armaba
  en la barra lateral, decidido 2026-09-19), ordenada por campos (tipo,
  vínculo, dueño, nombre, imagen, color) con Cancelar / Poner en el mapa
  al pie. Se cierra sin crear con la ✕, Cancelar, **Esc** o **clic
  derecho** (fuera de un campo de texto) — `cancelarNuevoToken`. La barra
  lateral queda con su panel de siempre mientras tanto.
- **Elegir lugar y orientación al crear un token** (2026-09-19): "Poner en el
  mapa" ya no lo tira en el centro de la vista. Cierra la ventana y entra en
  `colocando` (`iniciarColocacion`): **1)** se elige la casilla con un clic
  (vista previa del token siguiendo al mouse) y **2)** se elige hacia dónde
  mira moviendo el mouse (queda a uno de los 6 lados, con una flecha) y un clic
  que lo crea (`crearToken` recibe `col`, `fila` y `rotacion`). Un cartel fijo
  (`#colocando-aviso`) dice qué paso toca; **Esc o clic derecho cancelan** y no
  se crea nada.
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
  - **Atajos** (2026-09-19; no andan mientras se escribe en un campo; los botones lo avisan en su cartel al pasar el mouse): **`H`** abre y cierra la caja de herramientas, **`F`** Terreno y Formas, **`M`** 🦶 Mover libre del token seleccionado (el mismo botón del HUD; con el modo prendido, otra `M` lo apaga), **`B`** la Botonera del personaje principal (solo jugadores; el primer token de personaje suyo en el mapa, o su primera ficha; se cierra con Esc o con otra `B`, tanto con el foco en el mapa como adentro de la Botonera — la ficha en `?modo=botonera` lo maneja igual que Escape). **`Ctrl+B`** abre y cierra la bitácora (anda incluso escribiendo en ella). **`Ctrl+Z`** (2026-09-19) deshace solo el último movimiento o giro propio: vuelve el token a su casilla y orientación, devuelve los No2 que costó y vuelve a tapar la niebla que ese paso descubrió; no anda después de un Mantenimiento (`deshacerUltimoMovimiento`). **`L`** prende o apaga el Lápiz (2026-09-19; no
    anda mientras se escribe en un campo). `Ctrl+L` se sacó (2026-09-19): el navegador lo usa para la barra de direcciones.
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
  - **Borrador antes de crear** (2026-09-19): al soltar el dibujo, el
    elemento no se guarda: queda como `borradorElemento`, pintado igual
    que uno de verdad (mismo código, con `ID_BORRADOR`; color, opacidad,
    imagen, Sólido e Invisible del panel se ven en vivo) y con contorno
    blanco punteado. Se crea con un clic en otro lado del mapa (ese clic no
    empieza otro dibujo), Enter, "✔ Crear", o al salir de la herramienta o
    cambiar a otra; se tira con Esc, clic derecho (el siguiente ya sale de
    la herramienta) o "Descartar", y al cambiar de forma en el selector.
    `consolidarBorradorElemento`/`descartarBorradorElemento`.
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
  - **Cartel del elemento seleccionado** (`#elemento-etiqueta`, `actualizarEtiquetaElemento`, 2026-09-19): arriba a la derecha, igual que el del token, dice la forma, su creador y en grande si es **🧱 SÓLIDO (bloquea el paso, borde rojo)** o **🚶 TRANSITABLE (borde verde)**, más si es invisible o está fijado.
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
- **🗺 Varios mapas guardados** (botón de la cabecera, con el nombre del (2026-09-21: "+ Nuevo mapa" está ARRIBA del panel, con Cerrar, porque con muchos mapas abajo quedaba fuera de la vista; el panel del costado se desplaza si es largo, y el botón de la cabecera lleva una ▾)
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
- **📋 Tablero de combate** (botón de la cabecera, `#btn-tablero`, junto a
  "⚔ GM Tools"/"📜 Mi ficha" — para cualquiera: GM o jugador, no se
  esconde; **no** está en la pila de botones del borde izquierdo, ver
  abajo): tarjetas con HP/SP y estados de todo lo que tiene token en el
  mapa **publicado** (`mapaActivo`, no `mapaMostrado` — sigue mostrando el
  mismo tablero aunque el GM esté mirando/armando otro escenario,
  `tableroTokensEscuchar`). Los datos salen de `fichasPub`/`creepsPub`
  (ya en vivo); lo nuevo es solo saber quién tiene token ahí. A los
  jugadores no les aparecen los personajes/creeps ocultos (`oculto`) ni
  los que están en sigilo (`enSigilo`) — el GM los ve igual
  (`tableroFichaIds`/`tableroCreepIds`); las invocaciones no entran (el
  Tablero es de personajes y creeps). Mismo propósito que el panel
  Tablero de `gm-toolset/gm-tools.html`, pero sin código compartido (ver
  [`../gm-toolset/CLAUDE.md`](../gm-toolset/CLAUDE.md)) — acá además hace
  falta el filtro de oculto/sigilo porque lo ve cualquiera, no solo el GM.
- **Botones apilados del borde izquierdo** (🧰 pestaña, 🎲 Dados, 🎭
  Tokens, 🎁 Despojos, 🗺 Mapas — cada uno `position:absolute` con
  `bottom:calc(24px + Npx)`, ancladas al borde de ABAJO de la pantalla, no
  al centro vertical): si se suma un botón más al stack, va arriba del
  último (`bottom` más grande) manteniendo los 77px de separación entre
  uno y el siguiente. **Ancladas abajo a propósito** (2026-09-22): con el
  centro vertical, cada botón nuevo necesitaba más alto libre arriba del
  centro, y en una ventana de ~720px de alto (común) el de más arriba
  terminaba tapado por la cabecera. Antes de agregar otro botón al stack,
  probar con `resize_window` a una altura chica (~700px) que el de más
  arriba siga visible — y si un botón es para cualquiera (no solo GM),
  mejor ponerlo en la cabecera como 📋 Tablero, no acá: el stack ya está
  bastante lleno y la cabecera tiene de sobra.
  - **`#tokens-menu`/`#mapas-menu`** (los desplegables de 🎭/🗺, al costado
    del stack): van con `top` Y `bottom` puestos (sin `height`) para que
    el navegador les dé el alto que entra justo entre la cabecera y el
    piso, con scroll propio si el contenido no entra — **no** están
    pegadas a la altura de su botón. Antes colgaban del mismo `bottom`
    que su botón y con contenido largo (muchos mapas guardados) crecían
    para arriba y se cortaban con el borde de la ventana (2026-09-22).
- Fondo (botón 🖼 Fondo, solo GM): imagen en `mapa/fondo`, achicada sola;
  el GM ajusta el ancho en casillas y puede arrastrarla para alinearla con
  la grilla.
- Mesa al costado: mismas tiradas en vivo que ficha y gm-tools, más una
  "tirada libre" por fórmula (`desde: 'mapa'`). El GM ve 🗑 para borrar el
  historial y al entrar se limpian las de más de 48 h
  (`../comun/mesa-historial.js`, igual que en ficha y gm-tools).
- **Grilla de dados** (`../comun/grilla-dados.js`, como la de Roll20): botón
  🎲 (`#toolkit-dados`, 2026-09-19: antes era "🎲 Dados" en la cabecera; atajo **`D`**) en el borde izquierdo del mapa, justo arriba de la pestaña de la caja de herramientas y del mismo tamaño y forma — lo ven jugadores y GM por igual; se despliega al costado con D4…D100 × 1–6 y
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

- **Vida desde el círculo rojo del HUD** (2026-09-19): el clic abre un mini
  menú (`hudHpHtml`) con dos modos que se cambian ahí mismo: **1 · Recibe
  daño** (por defecto: se escribe el daño del golpe, se le resta la Defensa,
  con Invulnerable y Escudo mágico — `resolverGolpe`, `danioCreep`,
  `danioPj`) y **2 · HP directo** (el de siempre: valor, +5, −3). Explica lo
  que va a pasar y muestra una vista previa en vivo. Para un PJ la Defensa
  sale de `resumen.def` que publica la ficha (`fichaResumen`; una ficha que
  no se guardó desde entonces no la tiene y avisa); para un creep, del
  creep privado (solo GM, `creepDefensaMapa`). Las invocaciones siguen con
  el campo simple.

- **Alertas rojas y sin No2** (2026-09-19; reemplaza a la primera versión): ya no hay No2 negativos. Mover o girar sin No2 suficientes se bloquea con un aviso (para eso está 🦶 Mover libre); en la ficha, atacar, usar una habilidad, consumir o entrar en sigilo sin No2 abren un pop-up con Cancelar o "Realizar de cualquier modo" (`avisarSinNitros`), que gasta los No2 que haya (hasta 0) y deja una línea roja en la Mesa (`desde: 'alerta-roja'`, `gastoNitrosForzado`). Además, si un personaje **en sigilo** entra en
  🦶 Mover libre, o se pasa de sus No2 al moverse o girar, se publica una línea
  roja en la Mesa (`desde: 'sigilo-alerta'`, `sigiloAlertaRoja`; se dibuja en
  `comun/mesa.js` sin el destello del ojo) — "⚠ X (en sigilo) entró en Mover
  libre". Solo avisa, no impide nada; sirve para que la mesa vea las reglas que
  se salen de lo normal. Las acciones de la ficha (atacar, habilidades) ya se
  frenan solas sin No2, así que no hacen falta.

- **Detección inmediata al caminar** (2026-09-19, escenario 2, P85): quien camina (sin estar en sigilo) y en algún casillero de su ruta deja a un rival en sigilo dentro de su **cono** (`percepcionEvaluarRuta`): el movimiento **se corta ahí**, el oculto **pierde el sigilo solo** (`sigiloRevisar`, lo hace su dueño o el GM) y su token aparece para todos. **Sin tirada** (se ve de manera directa). La zona de alerta no interrumpe a quien camina. Igual para personajes y creeps. (Se sacó el cartel de tirada de percepción de la primera versión.)

- **Movimiento y zona de alerta** (2026-09-19, escenario 1: se mueve el oculto):
  entrar en la zona de alerta (roja) da **una tirada de detección por paso**,
  anunciada en **rojo** en la Mesa, anónima: "Hace falta una tirada de percepción" (`sigiloEvaluarRuta` cuenta los pasos,
  `sigiloPublicarAvisos` la publica). **No se interrumpe** el movimiento: el
  oculto ve las zonas y decide cuándo entrar, y cada paso es consciente. Solo el
  cono (azul) corta. Falta el escenario 2 (se mueve el que ve al oculto: hoy
  solo cuenta el cono).

- **👓 Ver conos** (2026-09-19): botón cuadrado en el grupo flotante `#flotantes-mapa`
  (junto al zoom, antes del 👁 y del switch de modo) que prende y apaga el dibujo de
  los **conos de detección (azul) y zonas de alerta (naranja)** de **todos** los
  tokens que se ven (`verZonas`, en `dibujar`; se recuerda por navegador en
  `localStorage` `mapa-ver-zonas`). Colores más opacos que los de sigilo para que se
  vean bien. Un token oculto, en sigilo que no ves o muerto no muestra sus zonas
  (no delata nada).

- **👓 Lentes con menú** (2026-09-19; reemplaza al botón simple): el 👓 abre hacia
  abajo un menú (`#lentes-menu`) con **Modo lentes: sí/no** y, cuando está prendido,
  un filtro **Todos / Aliados / Rivales / NPC** (`lentesCategoria`: personajes,
  creeps vinculados, tokens grises) o una lista de **tokens para marcar** y ver solo
  sus zonas (la selección manda sobre el filtro; "quitar selección" la limpia).  Apagado, el mapa funciona como siempre. Se recuerdan por navegador el modo
  (`mapa-ver-zonas`) y el filtro (`mapa-lentes-filtro`).
  **Actualización 2026-09-19:** el menú quedó solo con **Modo lentes** y el filtro
  (Todos / Aliados / Rivales / NPC); ya no tiene lista de tokens. Para ver solo un
  token se lo **selecciona en el mapa** (`seleccion`): con un token seleccionado se
  muestran solo sus zonas; al soltar la selección vuelve al filtro.
  **Atajo `Ctrl+L`** (2026-09-19): prende y apaga el modo lentes (`alternarLentes`);
  la `L` sola sigue siendo el Lápiz. Está en la lista de atajos del mapa.
  **Actualización 2026-09-22 — se sacó el filtro Todos/Aliados/Rivales/NPC:**
  "👁 Ver todas las zonas" ya no es configurable por categoría — ahora siempre
  muestra solo las de **riesgo** (nunca las de tus propios aliados): para un
  jugador, las de los creeps; para el GM, las de los personajes de los
  jugadores (`lentesMuestra`, ver más abajo). Seleccionar un token puntual
  sigue funcionando para cualquiera (aliado, rival o NPC), sin este límite.

- **Lápiz por casilleros numerado** (2026-09-20): cada casillero de una
  trayectoria del lápiz lleva su número (1, 2, 3…) en un círculo del color del
  trazo, para contar recorridos (`dibujarRutaHex`).
- **Arreglo del ping** (2026-09-20): con la hora de la compu atrasada respecto del
  servidor, la confirmación del servidor dejaba la hora del ping en el futuro, el
  radio de la animación daba negativo y `ctx.arc` fallaba, cortando el dibujo (el ping
  aparecía recién con el siguiente, "en eco"). Ahora el ping se anota una sola vez
  con la hora local, ignora el 'modified' y la edad nunca es negativa
  (`escucharPings`).

- **Trampas ocultas** (2026-09-20, P78–P84): un elemento de Terreno y Formas con
  la casilla **"Trampa (oculta a los rivales)"** (nombre y "qué hace") — al crearlo
  (panel de la herramienta) o desde el ⚙ de uno ya creado. Campos del elemento:
  `trampa`, `trampaNombre`, `trampaDetalle`, `disparada`. La ven solo su dueño y el
  GM hasta que se dispara (`puedeVerElemento`); armada se dibuja ámbar con ⚠,
  disparada roja con ✖ para todos. **Quién la dispara** (`trampaDispara`): los
  creeps si la puso un jugador, los personajes si la puso el GM; los aliados nunca.
  Al soltar una ruta (`trampasEvaluarRuta`), si algún casillero pisa la trampa el
  movimiento se corta ahí, se marca `disparada: true` (las reglas dejan que
  cualquier miembro cambie solo ese campo) y sale una línea roja en la Mesa:
  "⚠ Trampa de *dueño*: *nombre* — *token* la activó — *qué hace*". Los efectos se
  resuelven a mano. **Percepción aumentada** (pasiva de `comun/pasivas.js`,
  `resumen.percepcionAumentada`): además, al quedar justo **al lado** de una trampa
  (una vez por trampa) el movimiento se interrumpe y aparece "corresponde una tirada
  de percepción" (aviso propio + línea roja anónima en la Mesa). Tirada:
  🔎 **Tirar percepción** en la Botonera (`tirarPercepcion`: Destreza, con un dado más
  alto por escalón si tiene la pasiva). Pendiente: tiradas para detectar/desarmar y
  límites para crearlas.

- **Trampas: fuego amigo y recurrentes** (2026-09-20): la trampa lleva `fuegoAmigo`
  (casilla "Fuego amigo: SÍ/NO" al crearla y en el ⚙): con SÍ la disparan también
  los aliados y su dueño (`trampaDispara`). **💾 Guardar como recurrente** deja la
  trampa (nombre, qué hace, fuego amigo, forma, tamaño, color y transparencia)
  en la lista "Trampas guardadas" del panel; tocar su nombre la carga para
  colocarla, ✕ la borra. Se guardan **por navegador** (`localStorage`
  `mapa-trampas-guardadas`), no en la nube.
  **Catálogo de trampas** (2026-09-20): cada trampa guardada tiene 📤 para
  **proponerla** al catálogo (`Biblioteca.guardar`, tipo `trampas`, colección
  `propuestas_trampas`); el dueño del proyecto las audita desde la pestaña
  Propuestas y pasan a `biblioteca_trampas`. El botón **📚 Catálogo de trampas**
  del panel abre la lista oficial (con buscador y etiquetas) y carga la elegida
  para colocarla (`abrirCatalogoTrampas`, `cargarTrampaEnPanel`). Usa
  `comun/biblioteca.js`, que ahora también carga el mapa (con sus propios
  estilos de ventana).

- **Catálogo base de trampas y asistente** (2026-09-20, `comun/trampas-base.js`, `TRAMPAS_BASE`): 24 trampas
  inventadas (oso, foso, red, brea, dardos, mina, barril de pólvora, nube de veneno, runas, escarcha, portal…) con
  nivel 1–5, todas marcadas "(Trampa creada automáticamente: requiere auditar.)" en su descripción y con la etiqueta
  `auditar`. Aparecen en **📚 Catálogo de trampas** (opción `base` de `Biblioteca.abrir`, con filtros agrupados).
  Ahí mismo, **"+ Crear una trampa custom (paso a paso)"** abre `abrirAsistenteTrampa` (`wt`): 1 clase de trampa,
  2 qué hace (daño, estado, tirada para evitarla, extra), 3 forma y tamaño, 4 nombre y aspecto, 5 resumen editable
  → "Cargar para colocarla" o "💾 Guardar como recurrente".
  **Daño automático** (`trampaDano`, campo nuevo del elemento, tirada tipo `2d6`, ≤12 letras; hace falta publicar
  las reglas): al dispararse el mapa tira el daño (`trampaAplicarDano`), lo aplica con `danioPj`/`danioCreep` a quien
  la activó (restando su Defensa) y, si es de área, a los creeps de adentro cuando mueve el GM; a los demás se les
  avisa en la Mesa. Los estados y las tiradas para evitarla siguen a mano y el texto lo aclara.

- **Tokens automáticos y fin de combate en el mapa** (2026-09-20, solo GM, en `#caja-mantenimiento`): **📥 Importar tokens** (elige un grupo de creeps de GM Tools; crea sus tokens ocultos), **👥 Tokens de jugadores** (los personajes de la partida, visibles) — ambos en fila al centro de lo que se ve (`mapa-centro` en `localStorage`, `guardarVista`), en el mapa mostrado y salteando los que ya tienen token (`comun/tokens-auto.js`); **🏁 Finalizar combate** y **🎁 Botín** abren GM Tools en un iframe (`abrirModoGM`).

- **Tokens: botón 🎭 del borde izquierdo** (2026-09-21): la gestión de tokens salió de la cabecera (el "+ Token" quedó oculto, lo sigue usando el código; el (?) de la guía de colores quedó suelto en la cabecera) y de la barra lateral (ya no están "Importar tokens" ni "Tokens de jugadores"). Ahora hay un tercer botón junto a los dados y la caja de herramientas (`#toolkit-tokens`, `#tokens-menu`): **jugador** → abre directo la ventana de "Nuevo token"; **GM** → menú con "＋ Token nuevo", "👥 Traer tokens de jugadores" y "👹 Traer tokens de creeps" (submenú de grupos; los grupos vinculados a este mapa van marcados ★ y hay un botón para traerlos todos juntos). **Grupos ↔ mapas** (`campanas/<id>/gm/gruposMapas = {enlaces: [{grupo, mapaId}]}`, `TokensAuto.enlacesEscuchar/enlacesGuardar/vincular`): en el panel **🗺 Mapas** cada mapa muestra sus grupos vinculados (chips con ✕ y "＋ vincular grupo…"), y en GM Tools cada grupo tiene su selector "🗺 mapa"; ambos editan el mismo dato. Un grupo tiene a lo sumo un mapa; un mapa puede tener varios grupos. "Finalizar combate" y "Botín" siguen en la barra lateral.

- **Ventana del botín para los jugadores** (2026-09-21): cuando el GM confirma el fin del combate y aparece botín nuevo (`escucharBotinParaJugador`, solo jugadores; ignora el botín que ya estaba al entrar), se abre sola la ventana del botín de la ficha propia (`fichaPrincipalId`, mismo iframe de la Botonera con el mensaje `abrir-botin`): lista de equipos y trofeos para "Sumar a la mochila" o Comparar. En la barra lateral del GM, **🧰 Despojar** reemplaza al viejo "🎁 Botín".

- **Batalla terminada y botón 🎁 Despojos** (2026-09-21): el borde izquierdo tiene ahora **🎁** (arriba de 🎭 y 🎲, mismo formato, `#toolkit-botin`), para jugadores y GM, **apagado salvo con el botín publicado** (late cuando lo está). La ventana de la batalla (la del GM y la de los jugadores, en el iframe de la Botonera) ocupa **todo el centro** (`botonera.completa`). A los jugadores se les abre sola al llegar un combate nuevo (`escucharBotinParaJugador`, lee `combate/actual`; no reabre el que ya estaba al entrar) y se cierra sola cuando el GM despoja. Se sacó "🧰 Despojar" de la barra lateral (queda "🏁 Finalizar combate").

- **🗺 Mapas y Fondo en el borde izquierdo** (2026-09-21; reemplaza al botón de la cabecera y a los paneles de la barra lateral): un cuarto botón cuadrado del dock (`#toolkit-mapas`, arriba de 🎁, solo GM) abre un menú al costado (`#mapas-menu`, `renderMapasMenu`, `abrirMapasMenu`, mismo estilo que el de 🎭) con **+ Nuevo mapa**, la lista de mapas (Ver / Publicar / ✎ / ✕ y los grupos de creeps vinculados) y, abajo, **🖼 Fondo de este mapa** (cargar, quitar, ancho, arrastrar). Se cierra con el mismo botón o con Esc (no con un clic afuera, para poder acomodar el fondo con el menú abierto); el botón late cuando el GM mira un mapa distinto del publicado. Se sacaron el botón "🗺 Mapa ▾" y "🖼 Fondo" de la cabecera y las variables `panelMapas`/`panelFondo`. **Regla del dueño (2026-09-21): el espacio de la barra lateral donde está la Mesa no se usa para menús de otras funciones**; ahí solo quedan Mantenimiento y Finalizar combate (el panel "Editar token" todavía vive ahí: candidato a mudarse).
- **Editar token en ventana emergente** (2026-09-21): "✎ Editar token" ya no usa la barra lateral; abre una ventana centrada (`#editar-token-capa`/`#editar-token-ventana`, mismo estilo que "Nuevo token") que se cierra con Volver, clic en el fondo, clic derecho fuera de un campo o Esc (`cerrarEditarToken`). La barra lateral queda solo con Mantenimiento y Finalizar combate.

- **📏🔮 Visualizador de rango** (2026-09-22): dos botones cuadrados junto a 👓 lentes (`#btn-rango`, `#btn-rango-magico`), para cualquier jugador: muestran, con la misma superficie hexagonal que usan las auras (`dibujarAuraHex`), el área de **Rango** (de Destreza, azul) o **Rango de casteo** (de Especial, violeta) alrededor de **tu propio token** en el mapa. Los números salen de `resumen.rng`/`resumen.rangocasteo`, que la ficha ya calculaba pero no publicaba (`fichaResumen()`). Atajos: **R** prende/apaga el normal, **Shift+R** el mágico (Ctrl+R se descartó: el navegador lo usa para recargar la página). Es local a cada navegador, no se sincroniza ni queda guardado. Por ahora solo para el propio PJ del jugador — no hay botón equivalente para que el GM lo vea en un creep.

- **Aviso de ataque de oportunidad** (2026-09-22): cuando un token deja de estar adyacente a un rival (`rivalesDe`) durante un movimiento, se publica una línea roja en la Mesa ("Fulano se alejó de Mengano: posible ataque de oportunidad", `oportunidadEvaluarRuta`/`oportunidadPublicarAvisos`) — no corta el movimiento ni resuelve nada, es solo el aviso; la tirada sigue siendo a mano. No aplica con 🦶 Mover libre (que ya ignora sigilo/trampas por igual). Regla completa en el manual, nota "Ataque de oportunidad".
- **Zona de alerta, escenario 2: falta el aviso cuando camina el que detecta** (2026-09-22, corrige el "Falta el escenario 2" de más abajo): antes, si un personaje en sigilo se quedaba quieto y era el RIVAL el que caminaba hasta dejarlo dentro de su zona de alerta, no pasaba nada (solo el cono cortaba el paso e inmediata detección); ahora `percepcionEvaluarRuta` también cuenta, paso a paso de la ruta de quien camina, cada casillero que cae en la zona de alerta de un oculto (antes de llegar a su cono, si llega) y `percepcionPublicarAvisos` (llamada desde `moverToken` al confirmarse el movimiento, igual que `sigiloPublicarAvisos`) publica la misma línea roja anónima "Hace falta una tirada de percepción" — así da lo mismo quién de los dos camina.
- **👓 Lentes: aviso en vez de mostrar todo de una** (2026-09-22, reemplaza el comportamiento de arriba): con el modo prendido y nada seleccionado, ya no se dibujan todas las zonas de una — es un cartel fijo arriba del mapa (`#lentes-aviso`) que recuerda "Seleccioná un token…". El menú suma **👁 Ver todas las zonas** (`lentesTodos`, recordado por navegador en `mapa-lentes-todos`): con eso prendido sí se ven todas, filtradas por Todos/Aliados/Rivales/NPC como antes. Seleccionar un token sigue mostrando solo las suyas, con o sin "Ver todas".

- **Arreglo: la ruptura de sigilo dependía de que se estuviera dibujando** (2026-09-22, reportado por el dueño — "pasa mucho tiempo entre el anuncio y que el token se vea"): `sigiloRevisar()` (la que detecta y saca el estado Sigilo) solo corría adentro de `dibujar()`, programado con `requestAnimationFrame` — en una pestaña de fondo el navegador frena esos frames, así que la detección podía demorar mucho aunque el token ya se hubiera movido en Firebase. Ahora `sigiloRevisar()` también se llama directo desde `escucharTokens`/`escucharVinculables` (la llegada del dato por Firebase), sin depender de que el canvas esté dibujando.
- **Zona de alerta del escenario 2: solo cuenta si te quedás parado** (2026-09-22, P105 resuelta): `percepcionEvaluarRuta` (quien camina, sin estar en sigilo, detecta a un oculto) sigue chequeando la **zona propia del que camina**, no la fija del oculto que dibuja 👓 (eso es a propósito: importa hacia dónde presta atención quien camina). Lo que cambió: el **cono** (visión directa) se mira en cada paso de la ruta — cruzarlo delata igual, de paso o no; la **zona de alerta**, en cambio, ya no acumula pasos — pasar de largo sin quedarse ahí no dispara nada, se mira solo en la casilla **donde termina la ruta**, orientada hacia el último paso dado. `rotacionDePaso(pa, pb)` (nueva, compartida entre el chequeo del cono y el de la alerta final).

- **📜 Historial** (2026-09-24): el mapa le pasa cada segundo a `historialObservarCreeps` los creeps con token (`creepsPriv`, solo GM) y arma el botón del historial (`comun/historial.js`); si gm-tools está abierto en otra pestaña, solo una de las dos registra.

- **Estela: color, numeritos y quién la ve** (2026-09-24, pedido del dueño): (1) la estela es **roja saturada** con contorno oscuro (se perdía con la niebla) y los casilleros que **no alcanzan los No2** van en **magenta** (antes eran rojos); (2) cada casillero lleva su **numerito** = los No2 que suma hasta ahí (`porCasillero × pasos`; en narrativo o en la estela de otro, la cuenta de pasos); (3) `estelaVisibleDe(t)` decide al dibujar: un token **oculto** por el GM no deja estela para los jugadores, y uno **en sigilo** solo la deja ver al propio usuario y sus aliados (los demás personajes; nunca los creeps); el GM ve la de sus creeps y la de un personaje en sigilo solo con el 👁; (4) mientras se **arrastra un token en combate** queda pegada al token una **esferita de No2** con los que le quedarían al llegar al mouse (verde; magenta si se pasa), independiente del anillo del HUD.

- **🧱 Colisión del mapa** (2026-09-24, pedido del dueño): en el desplegable **Forma** de Terreno y Formas, el GM tiene una opción más, **"🧱 Colisión del mapa"**, ya configurada como *forma libre + Sólida + visible para todos + fijada* (`colision: true`, `solido: true`, `tipo: 'libre'`, `fijado: true`). Se pinta arrastrando o con clic de a uno (`pintandoColision`, sin borrador ni confirmación; completa los casilleros del medio con `lineaHex`); **Shift** al empezar el arrastre **borra** casilleros. Los casilleros pegados se **fusionan solos**: `colisionPintar` junta lo nuevo con todas las formas de colisión vecinas, crea UNA forma con la unión y borra las viejas; `colisionBorrar` reemplaza cada forma tocada por las partes que quedan (`componentesConexos`, una por grupo pegado). `colisionInfo()` (cacheada) da todas las casillas de colisión juntas: con ella se dibuja **un único contorno** alrededor de todo lo fusionado (rojo con borde oscuro, visible para todos) y se **saltea la grilla** adentro (`dibujar`, el `continue` de `sinGrilla`), así el fondo se ve sin líneas. Como es sólida, bloquea el paso y la vista igual que cualquier Sólido. Se puede seleccionar (clic fuera de la herramienta, se panea porque está fijada) y borrar entera con Suprimir. Las formas de colisión no se dibujan por el camino común de elementos (solo su selección). **Requiere reglas nuevas** (campo `colision` en `elementoValido`, solo el GM lo crea): sin publicarlas avisa "faltan publicar las reglas". El resto de sólidos invisibles que el GM ya tenía siguen igual.

- **El GM maneja los estados de TODOS los personajes** (2026-09-24, pedido del dueño): en el globo de estados del HUD (`puedoCambiarEstados`), el GM ve y usa **+ Estado**, **⚙**, **✕** y los **±** de turnos de cualquier personaje o invocación (antes solo su dueño; la vida de un personaje sigue siendo solo de su dueño). Sacar o cambiar turnos escribe en la parte `efectos` de la ficha y su resumen (`hudEstadoCambiar`, las reglas ya dejan al GM escribir fichas); **+ Estado** y **⚙** abren la ficha del personaje en la Botonera y la ficha pasa sola a "editar como GM" (`fichaEditarComoGMSilencioso`) y sube los cambios al cerrarse.
