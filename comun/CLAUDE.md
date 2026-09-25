# comun/

## Qué es

Código JS compartido por la ficha, gm-tools, el generador de tiendas, el
mapa, el editor de catálogo y el inicio (`index.html`). Cada archivo se
suma con `<script src="../comun/archivo.js">` (o `comun/archivo.js` desde
la raíz) — **nunca se copia adentro de un HTML**: si algo se repite en dos
herramientas, va acá. No hay build step ni módulos: son scripts clásicos
que dependen de que cada herramienta ya haya definido lo que usan (`$`,
`esc`, `fmt`, `num`, `toast`, y para los que hablan con Firebase, las
globals de `sesion.js`).

## Estado actual

En uso activo. Antes de escribir algo nuevo acá, `grep` el nombre en las
tres herramientas de juego (ficha, gm-tools, mapa) — si ya existe una
versión parecida en más de una, es candidato a juntar.

## Contenido

- **`biblioteca.js`** — biblioteca global de creeps, pasivas y trampas (y luego skills): ventana
  para elegir con buscador y etiquetas, guardar como propuesta (o directo si
  es el dueño del proyecto) y auditar propuestas. `Biblioteca.abrir({tipo,
  titulo, alElegir, alCrearDeCero})` y `Biblioteca.guardar({tipo, datos,
  nombre, nivel})`; `Biblioteca.abrir` acepta `base` (entradas del código que siempre están, aunque Firebase falle) y `subtitulo(entrada)`. Crea su propio HTML. Depende de `sesion.js`. La usan `ficha.html` (pasivas) y
  `gm-tools.html` (creeps).
- **`creeps-base.js`** — `CREEPS_BASE`: 173 creeps (60 por escenario + 20 goblins + 14 kobolds + 15 hombres cabra + 20 debuffers + 30 humanos + tramperos/sigilosos, a auditar), en la biblioteca de creeps de gm-tools.
- **`pasivas.js`** — `PASIVAS_BASE`: catálogo base de pasivas de Job (bonos a stats con escalones y regeneración de HP). La ficha lo ofrece en "+ Pasiva → catálogo"; se suma a las aprobadas desde Firebase (`biblioteca_pasivas`).
- **`sesion.js`** — configuración de Firebase, la cuenta (`fbUsuario`), la
  partida elegida (`FB_CAMPANA`, `localStorage`) y el miembro/partida
  actuales (`fbMiembro`, `fbPartida`). `fbEntrarAPartida()` es lo que cada
  herramienta llama al arrancar (y, ya adentro, pone en la pestaña "Herramienta — Nombre de la partida"): si falta sesión, partida o ser miembro,
  manda sola al inicio (`fbUrlInicio`). Lo carga primero cualquier página
  que use Firebase. Ver [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md).
- **`menu-sitio.js`** — (orden desde 2026-09-19: ⌂ Home → la partida abierta con todo su menú → otras partidas → Manual → Cerrar sesión) el botón ☰ fijo arriba a la izquierda, igual en
  todas las páginas: abre el árbol del sitio (partida abierta primero,
  Mapa, personajes propios y ajenos, GM Tools, Generador de tiendas,
  Manual, Cerrar sesión). Lee partidas y fichas de Firebase con caché de
  1 minuto; no aparece dentro de los iframes del mapa (Botonera,
  Acciones, Mantenimiento).
- **`barra.js`** — `barraTexto(personaje, usuario)`: arma el texto de
  identidad de la cabecera de cada herramienta ("Partida · Usuario", o
  "Partida · Personaje (Usuario)" — la ficha es la única que pasa
  personaje). Es solo el texto; cada herramienta lo mete en su propio
  layout (el mapa lo usa tal cual en `#estado`; ficha, gm-tools y el
  generador de tiendas le agregan su propio nombre de herramienta
  delante). Depende de `sesion.js` (`fbPartida`, `fbMiembro`).
- **`mesa.js`** — la cajita "Mesa" de tiradas compartidas: publicar
  (`mesaPublicar`), dibujar (`mesaRender`), escuchar en vivo
  (`mesaEscuchar`) y, en la ficha/gm-tools, armar la cajita flotante
  arrastrable (`mesaIniciar(alEntrar)`). Cada herramienta solo define
  `MESA_DESDE` (`'ficha'|'gm'|'mapa'`) y `mesaQuien(origen)` (quién tira);
  el mapa además define `MESA_AVISAR_SIN_SESION`. Achicada (`.colapsada`),
  la ficha y gm-tools muestran igual la última tirada real (no las líneas
  de sistema) en `#mesa-resumen`, con su detalle completo — mismo
  contenido que la fila verde de `#mesa-cuerpo` (`mesaFilaContenido`,
  compartido entre las dos); clic ahí también agranda la cajita. El CSS de
  `#mesa-resumen` va en cada herramienta (no en este archivo, que es solo
  JS); el mapa no lo tiene, su Mesa no es la flotante. Depende de
  `comun/tiradas.js` (fórmulas), `comun/efectos-golpe.js` (líneas
  resaltadas) y `comun/dados3d.js`/`comun/grilla-dados.js` (botones de la
  cabecera).
- **`tiradas.js`** — fórmulas de dados puras, sin Firebase:
  `parseDados`/`tirarDados` (parsear y tirar "2d6+3"), `horaTxt`, y
  `formulaParaValor` (reparte un valor de stat en dados reales — la usan
  la ficha, gm-tools y la lupa para "tirar un stat").
- **`lupa.js`** — el cuadro 🔍 "cómo se calcula" que cuelga de un botón
  (`lupaBotonHtml(clave)` con `data-lupa="clave"`; `abrirLupa`/`cerrarLupa`
  arman y ubican `#lupa-pop`, con los ladrillos `lupaFila`/`lupaSeccion`/
  `lupaNota`/`lupaSigno`/`lupaTirada`). El cuadro y los estilos son
  compartidos; **cada herramienta define `lupaContenido(clave)`**, que arma
  el desglose puntual (en la ficha delega a `lupaHtml`, en gm-tools a
  `lupaHtmlCreep`). El clic en el 🔍 se intercepta en fase de captura, así
  que nunca dispara el botón que lo contiene.
- **`mesa-historial.js`** — el GM ve 🗑 en la cabecera de la Mesa para
  borrar todo el historial de tiradas; además, cada vez que el GM entra a
  una herramienta se borran solas las de más de 48 h (como mucho una vez
  por hora por navegador). Nadie más puede borrar.
- **`grilla-dados.js`** — la grilla de dados estilo Roll20 (D4…D100 × 1–6)
  que se abre al costado del botón "🎲 Dados"; cada clic es una tirada
  libre que se publica en la Mesa.
- **`dados3d.js`** — (2026-09-19: las tiradas de varios jugadores se superponen —una caja por estilo, dados quietos 4,5 s— y cada tirada viaja con el estilo de dados de quien la hizo, campo `estilo` de la Mesa; el botón de prender/apagar en el mapa está en el pie de la grilla de dados, junto a "Personalización") animación 3D (dice-box-threejs, cargada recién con la
  primera tirada) que rueda sobre la herramienta cuando llega una tirada
  nueva a la Mesa. Prender/apagar y elegir estilo es por navegador
  (`localStorage`); no escribe nada en Firebase.
- **`respaldo.js`** — arma y baja un `.json` con todo lo que un jugador (o,
  con más detalle, el GM) puede leer de la partida, ya que el plan gratis
  de Firebase no hace copias de seguridad. `fbBajarRespaldo()` es el punto
  de entrada; lo usan el botón 💾 de la ficha, "Respaldo partida" de
  gm-tools y "Borrar la partida" del inicio (para ofrecerlo antes).
- **`efectos-golpe.js`** (`EfectosGolpe`) — los efectos de un arma que se
  aplican al **golpear** (Envenenar, Rompe armadura…): al tirar el Daño,
  los de probabilidad abren un pop-up para tirar (50 % = moneda, 25 % =
  d4…) y todo queda en la Mesa en una línea resaltada. Aplicarlos sobre el
  rival sigue siendo manual a propósito — la herramienta solo recuerda y
  tira, no toca el estado del objetivo.
- **`asistente-item.js`** (`AsistenteItem`) — crear o editar un ítem de
  equipo (no consumibles) paso a paso: categoría y descripción → lo
  práctico según la categoría (armas: Tipo, empuñadura, peso/daño, bonos,
  efectos al golpear; defensa: Defensa y resistencias a crítico; el resto:
  bonos) → estado al equipar, precio/lugar → resumen. Lo usan
  `ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html`,
  `gm-toolset/vendor-generator.html` y `datos/catalogo-editor.html`, cada
  una pasándole sus propios números de personaje/creep vía `cfg`. En
  "Empuñadura", **Rango** (arma de rango: su propia mecánica, no suma Dmg)
  y **Alcance** (arma cuerpo a cuerpo: bono para pegar a más de un
  casillero sin dejar de sumar Dmg) comparten el mismo mod (`rng`), pero se
  etiquetan y explican distinto según `armaDeRango` — no son lo mismo, ver
  "Rango vs. Alcance" en el Glosario del manual (`datos/reglas.json`).
- **`prueba-dados.html`** — página aparte (no un script) para elegir estilo
  y sonido de los dados 3D; el ⚙ de la Mesa la abre en una pestaña.
- **`recorte-imagen.js`** (`recortarImagen(fuente, {lado, tope})`) — antes
  de guardar una imagen chica y cuadrada (el token de un NPC en
  `vtt-hexgrid/mapa.html`, la miniatura del token de un personaje en
  `ficha-personaje/ficha.html`), abre un cuadro para arrastrar y hacer
  zoom (rueda del mouse o una barra) y elegir qué parte de la foto se ve,
  en vez de recortar siempre el centro. `fuente` es un `File` recién
  elegido o, para volver a recortar algo ya guardado, directamente un
  data URL. Devuelve una promesa con el data URL final (jpeg, tratando
  de quedar bajo `tope` bytes) o rechaza con `Error('cancelado')` si se
  cierra sin elegir. Como `lupa.js`: el marcado y la lógica van acá, el
  CSS (`.recorte-scrim`/`.recorte-caja`/etc., con las variables de color
  de cada herramienta) en cada HTML que lo use.

## Dependencias con otras carpetas

- Todas las herramientas de juego (`ficha-personaje/`, `gm-toolset/`,
  `vtt-hexgrid/`, `index.html`) cargan de acá lo que necesitan; ver el
  `CLAUDE.md` de cada una para qué usa de qué archivo.
- `firebase/firestore.rules` — los permisos que `sesion.js`, `mesa.js` y
  `respaldo.js` dan por sentado (leer/escribir `tiradas`, `miembros`, etc.).

- **Alerta del ojo 👁 del GM** (`mesa.js`, `mesaAlertaOjo`, 2026-09-19): una
  línea de la Mesa con `desde: 'alerta'` se dibuja como fila roja y, si llega
  nueva (no al cargar el historial), dispara en esa pantalla un destello rojo
  con el ojo (`comun/ojo.png`) grande que a ~1 s se apaga con fade. Lo publica el botón "👁
  Revelar lo oculto" del mapa; lo ven todos los que tengan la Mesa (mapa,
  ficha, gm-tools). Su CSS se inyecta solo (no va en cada HTML).

- **`grilla-dados.js`, pie opcional** (2026-09-19): `grillaConectar(boton, {…, pie})` acepta
  un HTML que se muestra debajo de la grilla (el mapa pone ahí el link
  "Personalización 🎲" a `prueba-dados.html`); sin `pie` no aparece nada.

- **`skills-clase.js`** — `CLASES_SKILLS`: el pool de habilidades de las 7 clases (las auditadas van automatizadas; el resto, con `skillSA`, solo se anuncia y su descripción empieza con "(Sin auditar)")
  ya cerradas (las 7 clases, la mayoría todavía vacía). La ficha lo ofrece en
  "+ Habilidad → De clase" (`abrirHabClase`/`agregarHabClase`) y copia la skill
  al personaje con `habClaseId` (para no duplicarla) y Job 1 si es de su clase,
  2 si es de otra (Custom: 3). Una skill se agrega acá recién cuando queda ✅
  en [`../docs/clases-borrador.md`](../docs/clases-borrador.md).

- **`biblioteca.js`, filtros agrupados y Ver** (2026-09-20): `opts.grupos = [{nombre, tags}]` muestra las etiquetas en menús desplegables por criterio (dentro de un grupo alcanza con una etiqueta, entre grupos se piden todos; lo que no está en ningún grupo va a "Otros"); sin `grupos` quedan los chips sueltos. `opts.alVer(datos, entrada)` agrega el botón 👁 Ver junto a Agregar (gm-tools lo usa para ver un creep completo, `verCreepDeBiblioteca`).

- **`skills-creep-base.js`** (2026-09-20) — `HABILIDADES_CREEP_BASE`: 190 habilidades generales para creeps (no atadas a un creep puntual: "Golpe fuerte", "Piel de piedra", "Grito de guerra"…), con etiquetas de función (daño, defensa, buff, debuff, curación, control, movilidad, invocación, área), velocidad (rápida CD 2 / lenta CD 3–6), rol, raza y automatización (toda automatizada / con parte a mano). Cada entrada guarda la receta `{sp, cd, lenta}` y `armarHabilidadDeCreep(datos, nivel)` la calcula con el nivel del creep (usa `window.CreepsBaseUtil` de `creeps-base.js`, que debe cargarse antes). Se abre desde gm-tools con "+ Habilidad" (`abrirCatalogoHabilidades`, biblioteca `tipo: 'habs_creep'`, solo base, sin Firebase).

- **`skills-creep-base.js`, ampliado** (2026-09-20): ahora **321 habilidades** con las mecánicas del juego — **sigilo** (entrar en sigilo es automático: la habilidad aplica el estado real `Sigilo`), **trampas** (26: cobran No2 y cooldown solas y traen el daño de la trampa escalado al nivel, `{T}`; se colocan con Terreno y Formas → Trampa, cuyo "daño automático" tira y aplica el mapa), terreno y formas, niebla y visión, iniciativa, auras, estados alterados (sobre sí mismo, **todo automatizado** con los presets reales: Invulnerable, Inmunidad a CC, Espinas, Escudo mágico, Afortunado, Regeneración, Blindado…; sobre otros, a mano), orientación (punto ciego), movimiento, botín y jefe. Filtros: función, mecánica del juego, a quién apunta, velocidad (rápida CD 2–3 / lenta CD 4–6), rol, raza y automatización. `armarHab` (creeps-base) ahora acepta `efecto.nombre/polaridad/hp` (estado real) y `trampa` (`{T}` en la descripción).
- **`armas-naturales-base.js`** (2026-09-20, P94) — `ARMAS_NATURALES_BASE`: 66 armas naturales generales (garras, colmillos, aguijones, cuernos, cola, puños, tentáculos, pinzas, pico, toque, aliento, escupitajos, energía…) con efectos al golpear (Envenenar, Sangrado, Rompe armadura, Aturdir, Derribar, Agarrar, Prende fuego, Drena vida…). `armarArmaNatural(datos, nivel)` la calcula con el nivel del creep y la potencia (ligera/media/pesada). Se abre con **🐾** en el arma del creep o en el paso del arma del asistente (`abrirCatalogoArmasNaturales`); filtros por parte del cuerpo, efecto, alcance, potencia y tipo de daño.

- **Trampas automáticas** (2026-09-20): las habilidades de creep con trampa (`sp.trampa` con daño o `sp.colocar` sin daño; `h.trampaColocar` en la habilidad) **se colocan solas**: al ejecutarlas, `TokensAuto.colocarTrampas` (`tokens-auto.js`) crea el elemento-trampa (Terreno y Formas, `trampa: true`, oculto a los jugadores hasta que se dispara, con `trampaDano` para que el mapa tire y aplique el daño) en la casilla libre más cercana al frente del token del creep, en el mapa que el GM está viendo (una flor de 1 si la descripción dice "flor de 1"; "3 minas/trampas" pone 3, "dos trampas" pone 2). La habilidad no se anuncia en la Mesa. Si el creep no tiene token en ese mapa avisa y no coloca nada. Los estados sobre quien la pisa (Inmovilizado, Rengo…) siguen a mano.

- **`estados-aplicar.js`** (`EstadosAplicar`, 2026-09-20) — estados alterados sobre OTROS, automáticos. `componer`/`aplicarACreep(sc, spec)` (creeps, respetando Invulnerable / Inmunidad a CC / Sangre pura / Coagulación) y `encolarPj({fichaId, duenoUid, spec, origen})`: a un personaje no se le escribe la ficha desde afuera; se deja un aviso en `campanas/<id>/estados` y **la ficha del dueño lo aplica sola, una vez** (`estadosEscuchar`/`aplicarEstadoRecibido` en ficha.html, mismo mecanismo que las recompensas). `spec = {nombre, turnos?, mods?, hp?}`: con el nombre de un preset (Veneno, Sangrado, Stun, Exhausto, Cansado, Lisiado, Inmovilizado, Rengo, Pajaritos, Armadura rota/arruinada, Veneno severo) usa ese preset; si no, es un estado propio ("Debilitado: −2 Daño 3 turnos"). En `creeps-base.js`, `APLICA` (nombre de la habilidad → estado) conecta 57 habilidades y trampas: al usar la habilidad, gm-tools abre "¿A quién le pegó?" (tokens del mapa que mira el GM, o "Nadie" si falló) y aplica el estado (`elegirObjetivoDeHab`); una trampa lleva `trampaEstado` en su elemento y el mapa se lo aplica a quien la pisa (y a los de adentro si es de área) con `trampaAplicarEstado`. Reglas nuevas: colección `estados` y el campo `trampaEstado` de los elementos (hay que pegarlas).

- **`biblioteca.js`, etiquetas al guardar** (2026-09-21): "Guardar en la biblioteca" ya no pide escribir las etiquetas a ciegas: muestra **todas las disponibles como desplegables con chips** (mismo estilo que los filtros), que escriben en el campo de texto (que sigue aceptando etiquetas propias, separadas por coma). Salen de `opts.grupos` (los mismos grupos del filtro), las sugeridas del tipo (`SUGERENCIAS`) y las que ya usan las entradas de la biblioteca (base + oficial + propuestas, si se pueden leer); lo que no está en ningún grupo va a "Otros". `Biblioteca.guardar` acepta `grupos` y `base` como `abrir`; gm-tools los pasa desde `CREEPS_GRUPOS` y `HABS_CREEP_GRUPOS`.

- **Sangrado se acumula (2026-09-22)**: a diferencia de Veneno (suma sus stacks enteros), reaplicar Sangrado suma **+1 stack** nada más — el daño por turno sube de a 1 (2 → 3 → 4…), mismo mecanismo que Armadura rota. Se guarda como `stacks:2, hpTurno:-1` (antes `stacks:1, hpTurno:-2`, mismo resultado la primera vez). `acumularSangrado`/`acumularSangradoCreep` (ficha, gm-tools) y la rama `esSangrado` en `EstadosAplicar.aplicarACreep` (comun/estados-aplicar.js), mismo patrón que sus pares de Veneno/Armadura rota.

- **`mesa.js` — línea `desde: 'reporte'`** (2026-09-24): reporte del Mantenimiento de un personaje (`mesaPublicarReporte` en la ficha); `formula` lleva un renglón por cosa que pasó. Cuenta como línea del sistema (no es una tirada ni una acción: no cierra el giro libre del mapa).

- **`historial.js`** — el botón **📜 Historial** (solo el GM, fijo arriba al lado del ☰, 2026-09-24): abre una lista con las acciones chicas que no van a la Mesa — cambios de HP y SP de personajes y creeps, estados que aparecen o se terminan y el reporte del Mantenimiento de los creeps —, para que el GM chequee sin ir token por token. Lo escribe la página del GM **mirando los datos**: el `resumen` público de cada ficha (`campanas/<id>/fichas`) y los creeps que le pasan gm-tools y el mapa cada segundo con `historialObservarCreeps(lista)`; no sabe quién hizo el cambio. Si hay varias pestañas del GM, una sola registra (`historialEsLider`, turno en `localStorage`). `historialReporteMantenimiento(quien, lineas)` lo usa gm-tools. Colección `campanas/<id>/historial` (solo GM), se limpia sola pasadas 48 h. Lo arranca `mesaHistorialAlEntrar()` (`mesa-historial.js`) vía `historialAlEntrar()`; no aparece en los iframes del mapa. Reserva lugar para su botón con `html.hist-on header / .accesos / .hero` (CSS propio, si una herramienta cambia esas barras hay que ajustarlo). Se carga después de `mesa-historial.js` en ficha, gm-tools y mapa (el generador de tiendas y el inicio no lo tienen).

- **Afortunado visible y estados de "mitad" (2026-09-24)**: con Afortunado se tiran dos veces y la descartada viaja en `r.ventaja = {rolls, total, elegido}` (campo `ventaja` de la tirada, con regla nueva en `firestore.rules`): la Mesa muestra las dos (✔ elegida verde, ✘ descartada tachada) y los dados 3D ruedan los dos juegos con un cartel (`dadosCartelAfortunado`). Sin la regla pegada, la tirada sale igual pero sin la descartada. **Pajaritos y Lisiado ya no achican el dado**: se tira el dado completo y al resultado se lo divide por 2, para abajo, mínimo 1 (`mitadesDeTirada`/`aplicarMitades`, duplicadas en ficha y gm-tools); la fórmula se muestra con ` ÷2`.

- **`asistente-estado.js`** (`AsistenteEstado`, 2026-09-25, pedido del dueño) — menú **paso a paso para crear un estado alterado de cero**: 1) nombre, bueno/malo/otro y descripción opcional; 2) **¿qué hace?** (daña o cura por turno, suma o resta a números, da un escudo, reglas especiales ya automatizadas —las mismas marcas de los presets: mitades de tirada, inmovilizado, rengo, cansado, exhausto, hypeado, sin No2, sentado, invulnerable, inmunidades, afortunado, control—, o solo un recordatorio); 3) las cantidades de cada cosa elegida (los pasos se arman según lo que se marcó); 4) cuánto dura (turnos o sin límite); 5) un resumen en palabras llanas con "guardar en Mis presets" y un atajo al formulario completo. No conoce ni la ficha ni gm-tools: `AsistenteEstado.abrir({stats, para, guardable, alTerminar(res), alFormulario(res)})` devuelve un resultado neutro `{nombre, polaridad, detalle, hp, mods, escudo, flags, forzarNitros, turnos, permanente, guardar}` y cada herramienta lo convierte (`armarPresetDeAsistente` en la ficha, `armarPresetDeAsistenteGM` en gm-tools). Reemplaza al botón "Estado personalizado" del selector de presets (ahora "＋ Crear estado nuevo (paso a paso)"), en la ficha (personaje e invocaciones) y en los creeps; desde el mapa se llega igual, porque el ＋ Estado abre esos mismos selectores. `#ae-fondo` cuenta como ventana abierta en los modos del iframe del mapa (Botonera y Acciones).

- **`modificadores-tirada.js`** (`ModTirada`, 2026-09-25, pedido del dueño) — en las botoneras (ficha, invocaciones y Acciones de creeps) los botones de **Atacar (PdG), Esquivar, Parry y Bloqueo** se pintan de **verde** si los modifica un estado alterado a favor (buff), de **rojo** si es en contra (debuff) y de **ámbar** si hay de los dos, y muestran ahí mismo cuál es ("Pajaritos ÷2 · Afortunado ×2 · Bendición +2"; en el `title` va completo). Lee los estados activos: `mods` del stat, `mitadPdgEva`, `lisiado`, `sentado` (Evasión) y `afortunado`. `ModTirada.tile(estados, statId)` → `{clase, html, titulo}`. La 🔍 del botón sigue mostrando el desglose completo. Se sumó también Sentado a `estadosQueAfectanStat*` (el color de la Mesa).

- **`historial.js` para jugadores** (2026-09-25, pedido del dueño): los jugadores también tienen su botón **📜 Historial**, que lee `campanas/<id>/historial_jugadores` (regla nueva: lee cualquier miembro, escribe y borra solo el GM). Lo escribe la página del GM mirando los datos (igual que el del GM): de los **personajes** lo mismo (HP, SP, estados); de los **creeps** solo lo que ya se ve en el mapa, sin HP actual ni máximo ("recibió 5 de daño", "se curó 3", "+ Veneno") y solo de los que no están ocultos ni en sigilo (`publico` lo calcula el mapa en `historialObservarCreeps`; gm-tools no lo manda, así que las líneas públicas de creeps salen solo si el mapa está abierto en la pestaña del GM). Los cambios que hace **Ctrl+Z** (HP/SP) quedan en los dos historiales porque se anotan mirando los datos, sin saber si fue un deshacer; los movimientos deshechos no se anotan. Hay que publicar las reglas.

- **`asistente-trampa.js`** (`AsistenteTrampa`, 2026-09-25, pedido del dueño) — menú **paso a paso para crear o editar una trampa**, el mismo en todos lados: nombre y efecto, superficie (forma/radio/cantidad), quién la dispara (fuego amigo), daño (con "contempla la armadura"), estado que deja (**cuadrícula** con mini descripción de cada debuff), tirada para evitarla, cuánto dura la trampa (solo en el mapa) y resumen (con "guardar como recurrente"). `AsistenteTrampa.abrir({contexto:'mapa'|'habilidad', editando, inicial, estados, colores, alTerminar(res), alCancelar})` y `detalleFinal(res)`. Se usa en: el mapa (al tildar Trampa en Terreno y Formas, botón "🪄 Armar la trampa paso a paso", el "crear custom" del catálogo y el ⚙ de una trampa ya colocada, en modo edición: los cambios se ven en vivo y se guardan con Guardar), el editor de habilidades de creep de gm-tools (los campos `#hc-trampa-*` quedan escondidos y se llenan desde el menú) y el de habilidades de personaje de la ficha. `trampaColocar` ahora guarda también `amiga` (fuego amigo) y `estado` ({nombre, turnos}). El viejo asistente `abrirAsistenteTrampa` (`wt`) del mapa quedó sin usar. Las reglas de Firestore suman `trampaIgnoraDef` a los `update` de elementos: hay que publicarlas.

- **`guia-diseno.js`** (`GuiaDiseno`, 2026-09-25, pedido del dueño) — **guía educativa y visual de diseño**: `GuiaDiseno.abrir(seccion?)` abre una ventana que lleva de la mano ("¿qué querés diseñar?" → skill / arma / estado / algo del mapa) con grillas de tarjetas: para una **skill**, las 7 clases (Warrior, **Asalto**, Tanque, Mago, Shooter, Support, Debuffer) y el abanico de mecánicas de cada una con skills de ejemplo; para un **arma**, qué la define, las familias (hachas → Rompe armadura, contundentes → Knockdown, punzantes → Lisiado, cortantes → Sangrado…) y la grilla de efectos con filtro (🏠 de casa / ✨ excepcional); además los estados existentes y las mecánicas del mapa. Siempre aclara que son **guías, no reglas**. Los datos están al principio del archivo (`DATOS`: `CLASES`, `FAMILIAS`, `EFECTOS_ARMA`, `ESTADOS`, `MAPA`) y espejan `docs/guia-de-diseno.md` y `docs/clases-borrador.md`: al sumar una mecánica, tocar los tres. Se abre desde el **☰ → 📐 Guía de diseño** (aparece en las páginas que cargan el script: mapa, gm-tools y ficha). Sin Firebase. **La clase se llama Asalto** (no "emboscador"): el rol de creep `emboscador` pasó a `asalto` en las etiquetas de la biblioteca de creeps y habilidades (los creeps ya guardados en Firebase con la etiqueta vieja la conservan hasta que se editen).

- **`critico.js`** (`Critico`, 2026-09-25, pedido del dueño) — el **golpe crítico nuevo** (P113 y P115): funciones puras `rango(tipo, frecuente)` (el Tipo del arma menos los puntos de Crítico frecuente, mínimo 2), `umbrales(potente)` (doble daño 7 − P con piso 1, triple 17 − P÷2, cuádruple 20 − P÷3), `evaluar({pdg, eva, tipo, frecuente, potente, resistencia})` (nivel N = diferencia ÷ rango; se tiran N − R d20), `multiplicador(mejorD20, potente)` y `resolverDano` (con crítico: todo el daño × multiplicador y la Defensa NO se resta), más una **ventana** `Critico.abrir()` (☰ → 🎯 Calculadora de crítico) donde se ponen PdG, Evasión, Tipo del arma, frecuente, potente, resistencia y daño; tira los d20 y publica en la Mesa. **Las tiradas de PdG contra Evasión se siguen comparando a mano**: esto solo hace la cuenta del crítico. Pendiente (en `docs/pendientes.md` §8): usarlo dentro de "Recibe daño" del mapa, y decidir qué pasa con el stat Crit de la ficha y los ítems con "crítico +N".

- **Calculadora de crítico: panel flotante** (2026-09-25, pedido del dueño): ya no es una ventana modal con fondo oscuro sino un **panel flotante** (a la derecha, se arrastra desde su cabecera, ✕ cierra; Esc solo cierra si el foco está adentro) que se puede dejar abierto **junto a la Botonera**. Si la Botonera (en el mapa, un iframe `#botonera-marco`; en la ficha, `.botonera-modal`) queda debajo, la calculadora se **reubica sola** al espacio libre de un costado (achicándose hasta 300 px); si no hay lugar libre, se queda a la derecha y se puede mover a mano (moverla a mano desactiva la reubicación).
- **🎲 Dados libres dentro de la Botonera** (2026-09-25, pedido del dueño): la cabecera de la Botonera (y la de la Botonera de una invocación) tiene un botón 🎲 al lado de "Cerrar" que abre la grilla de dados (`grilla-dados.js`) y publica la tirada libre en la Mesa (en modo botonera la Mesa flotante estaba tapada).

- **Calculadora de crítico, paso a paso y autocompletada** (2026-09-25, pedido del dueño): la ventana ahora es un asistente de 5 pasos **en el orden de las tiradas**: 1 el arma del atacante (Tipo, Crítico frecuente y potente), 2 su PdG, 3 la Evasión del defensor (y su Resistencia a crítico a ese Tipo), 4 ¿hay crítico? (nivel, cuántos d20 y el botón de tirarlos), 5 el daño y el resultado (con "Publicar en la Mesa" y "Otro golpe"). Se **completa sola**: la herramienta puede definir `criticoDatosIniciales()` (la ficha: su Crítico frecuente y potente —con equipo, habilidades y estados ya sumados— y el Tipo de su arma equipada) y/o `criticoFuentes()` (el mapa: la lista de tokens con `{id, nombre, tipo, frecuente, potente, resistencias[5], defensa}`; se elige "¿Quién ataca?" y "¿Quién defiende?" y se cargan el arma, los críticos, la Resistencia correspondiente al Tipo y la Defensa). La ficha publica para eso `resumen.crit`, `critpot`, `armaTipo` y `rescrit` (hay que abrir/guardar cada ficha una vez con la versión nueva); para los creeps (solo el GM) se usa su parte privada. Desde el 🎯 del menú de vida de un token, ese token viene elegido como defensor.
