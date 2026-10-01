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

- **`estados-aplicar.js`** (`EstadosAplicar`, 2026-09-20) — estados alterados sobre OTROS, automáticos. `componer`/`aplicarACreep(sc, spec)` (creeps, respetando Invulnerable / Inmunidad a CC / Sangre pura / Coagulación) y `encolarPj({fichaId, duenoUid, spec, origen})`: a un personaje no se le escribe la ficha desde afuera; se deja un aviso en `campanas/<id>/estados` y **la ficha del dueño lo aplica sola, una vez** (`estadosEscuchar`/`aplicarEstadoRecibido` en ficha.html, mismo mecanismo que las recompensas). `spec = {nombre, turnos?, mods?, hp?}`: con el nombre de un preset (cualquiera de `estados-presets.js`, buffs incluidos desde el 2026-09-29) usa ese preset; si no, es un estado propio ("Debilitado: −2 Daño 3 turnos"). En `creeps-base.js`, `APLICA` (nombre de la habilidad → estado) conecta 57 habilidades y trampas: al usar la habilidad, gm-tools abre "¿A quién le pegó?" (tokens del mapa que mira el GM, o "Nadie" si falló) y aplica el estado (`elegirObjetivoDeHab`); una trampa lleva `trampaEstado` en su elemento y el mapa se lo aplica a quien la pisa (y a los de adentro si es de área) con `trampaAplicarEstado`. Reglas nuevas: colección `estados` y el campo `trampaEstado` de los elementos (hay que pegarlas).

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

- **`duelo.js`** (`Duelo`, 2026-09-26, pedido del dueño) — **ataque paso a paso en vivo** entre atacante y defensor (etapa 1: contacto, 1 contra 1; diseño en [`../docs/ataque-paso-a-paso.md`](../docs/ataque-paso-a-paso.md)). Un duelo es un documento de `campanas/<id>/duelos`. **El cuadro del duelo se le abre solo a TODOS los conectados** (mapa, ficha suelta, gm-tools suelto); se puede minimizar (queda el botón «⚔ Ver duelo») y cada uno solo ve los botones que le tocan. **El objetivo se elige con un clic en el token del mapa**: la Botonera/Acciones (iframe) le manda al mapa `duelo-elegir-objetivo` y el mapa (que reutiliza `elegirDestino`) crea el duelo con `Duelo.crear`; en una página suelta se elige de una lista. **En el mapa no hay hooks**: `Duelo.escuchar({tirar})` recibe la función que le pide la tirada al iframe del dueño (mensaje `duelo-tirar`, sin mostrarlo salvo que aparezca un cartelito de Nitros/sobrepeso: `duelo-ui-visible`), y el iframe la anota él mismo en Firestore. Cada página con datos define `window.DUELO_HOOKS = {soy, atacar, opcionesDefensa, defender, fuerza, bloquear, armaContra}` (etapa 2: el defensor elige Evasión o Parry, después Bloqueo y contraataque; los pedidos del mapa viajan por `relay` a los iframes) (ficha: personaje **e invocaciones** `fichaId~invId`; gm-tools: creeps) y `registrarTirada` dispara `'tirada-registrada'` (`detail: {origen, r}`): de ahí el duelo recoge el PdG y la Evasión de siempre. El GM (o el dueño) puede tirar «a mano» por quien no responde. **Empate** (regla del dueño): gana la tirada sin «+» fijo si solo una lo lleva; si no, par o impar entre los dos (`Duelo.elegirParidad`, estado `empate`). Necesita las reglas nuevas de `duelos` (hay que pegarlas). Los duelos de más de un día los borra el GM al entrar.

- **Primero los dados, después el resultado (2026-09-26, dueño, para todo el juego):** cuando llega una tirada a la Mesa que se va a animar en 3D, `mesaProcesar` (`mesa.js`) **lanza los dados enseguida y no muestra la línea hasta que quedan quietos** (`dados3d.js` avisa con los eventos `dados-inicio` / `dados-quietos`; máximo 7 s, sin espera con las animaciones apagadas, la pestaña oculta o dentro de los iframes del mapa). `dadosAnimara(t)` dice si una tirada se va a animar. El **dado más alto puede destacar** (`destacar: 'max'` en la tirada: crece, sube, brilla y suelta ondas; lo usan los d20 del crítico). El cuadro del duelo espera igual antes de revelar contacto, Bloqueo y crítico.

- **Espinas devueltas en el duelo** (2026-09-27, regla del dueño): 1/4 (para arriba) del daño INFLIGIDO —con el multiplicador del crítico, antes de la Defensa: lo resista o no la armadura—, directo a la vida del atacante, si el defensor tiene Espinas y el golpe pegó (o pasó la mitad) cuerpo a cuerpo. `dueloEspinas` en el mapa; `dano.espinas` en el duelo; campo `ataque.rango` (lo mandan ficha, invocaciones y GM Tools). Ver `../docs/skills-clase-y-duelo.md` §7.

- **Duelo de habilidades dirigidas y `asistente-duelo-hab.js`** (2026-09-27, pedido del dueño): `duelo.js` acepta `ataque.tipo: 'habilidad'` con `hab` = {nombre, objetivo, tira, contra[], dano, efectos[], sinOposicion} (ver el comentario de `limpiarHab`): la misma contienda que un ataque (tirada contra tirada, empate, dados 3D), con daño mágico que ignora la Defensa y no critica, y efectos que son estados o cura; sin oposición se abre directo en los efectos. Las páginas definen los hooks `habTirar(d, quien, modo)` y `habValor(d, quien, stat)`. `AsistenteDueloHab.abrir({nombre, inicial, tieneFormula, alGuardar})` es la ventanita 🎯 que configura `habilidad.duelo`. Diseño en `../docs/duelo-de-habilidades.md`. La regla de Firestore de `duelos` necesita el campo `hab`.

- **Re-roll (Moneda Re-Roll)** (2026-09-27, regla del dueño; `../docs/reroll.md`): botón 🪙 de la Botonera (repite la última tirada, cobra No2 y tira la moneda: par se conserva, impar se rompe) y botón flotante 🪙 del cuadro del duelo, que **reabre** tu última tirada (`Duelo.reabrir`, `puedeReabrir`; hooks de la página `rerollInfo` / `rerollUsar`; mensajes `duelo-reroll-info` y `duelo-reroll`).
- **Re-roll: sin costo, cualquier tirada, una moneda por tirada** (2026-09-27, correcciones del dueño): usar la Moneda Re-Roll ya **no cuesta No2**; se abre una **ventana** (`#scrim-reroll`, `abrirReroll`/`renderReroll`) con las últimas tiradas del jugador para elegir **cuál** repetir (no solo "la última"); **una moneda por tirada** (marca `rerollId`/`rerollUsados` fuera del duelo, campo `rerollUsado` del documento del duelo adentro). El botón 🪙 vive **siempre visible** en el mapa (grupo de arriba a la derecha, junto a lentes y rango; solo jugadores) además de en la cabecera de la Botonera. Ver `../docs/reroll.md`.
- **Polilla mística: botón flotante siempre visible** (2026-09-27, pedido del dueño): el consumible ya creaba, al usarlo, el estado permanente «Polilla revoloteando» (`efectoNombre` del ítem). Ahora, mientras ese estado esté activo, un botón flotante 🦋 (`renderPolillaBoton`, esquina inferior izquierda, z-index por encima de cualquier ventana o del duelo) queda siempre visible; al tocarlo (`usarPolilla`) suma **+2 a la última tirada propia del log** (no vuelve a tirar nada — la Mesa ya publicada no se reescribe, se anuncia con `publicarRecordatorios`) y el estado se saca solo. Sin ninguna tirada en el log, no hace nada y avisa. Vale solo en `ficha-personaje/ficha.html` (personaje, no invocaciones ni creeps).
- **PdG.Mg → PdG.Esp, Res.Mg → Res.Esp** (2026-09-27, pedido del dueño): son los mismos dos stats de siempre (PdG y resistencia derivados del atributo **Especial**), solo cambió la **etiqueta** — los ids **no cambiaron** (`pdgmg`, `resmg`). Se renombró en las tres herramientas (`STAT_LABEL`/`CREEP_DERIVED_STATS`), en `datos/catalogo.json` (texto de ítems), en `comun/creeps-base.js`/`skills-creep-base.js`/`pasivas.js`/`duelo.js`/`asistente-duelo-hab.js`/`asistente-trampa.js`/`trampas-base.js`, en `datos/catalogo-editor.html`/`auditoria-creeps.html`/`auditoria-defensa.html` y en el manual (`manual-usuario/notas/`, recompilado). Las entradas históricas fechadas (preguntas-abiertas.md, CLAUDE.md de otras carpetas) **no** se reescribieron a propósito — un "PdG.Mg" en una nota vieja es el "PdG.Esp" de hoy. Motivo: **Taunt** (Tanque) pasó de tirar Especial puro a tirar **PdG.Esp** contra el **Res.Esp** del objetivo, y "mágico" ya no describía bien un efecto que no siempre es magia.

- **`duelo.js`, hook opcional `dueloParesActivos`** (2026-09-27, pedido del dueño): cada vez que `dibujarChips()` recalcula qué duelos quedan minimizados/de fondo para esta pantalla (no el que está con el cuadro grande abierto acá mismo), llama a `dueloParesActivos([{id, atacanteTokenId, defensorTokenId}, …])` si esa función existe (`typeof === 'function'`) — no rompe ficha ni gm-tools, que no la definen. La usa `vtt-hexgrid/mapa.html` para hacer latir en el lienzo a los dos tokens involucrados (ver su `CLAUDE.md`), así se entiende entre quiénes hay acción sin reabrir el cuadro.

- **`asistente-duelo-hab.js`, "Ignora la Defensa" independiente del tipo** (2026-09-27, Paso 6 de las reglas de casteo — el tipo de daño de una habilidad ya lo cubría este asistente, construido el mismo día): antes, el tipo (Arcano/Fuego/Hielo/Rayo/Físico) ataba siempre "ignora armadura" (mágico = sí, físico = no), lo que contradice el Paso 1 de `docs/reglas-casteo.md` (lo que ignora la armadura es cómo se narra, no el elemento — una "aguja de hielo" física no ignora, aunque sea "Hielo"). Ahora hay un tilde aparte, **"Ignora la Defensa"**, que arranca según el tipo elegido pero se puede destildar a mano para esa excepción (`st.ignoraDano`, se resetea al cambiar el tipo). `habDueloDe` (ficha) y `habDueloCreep` (gm-tools) leen `c.ignoraDano` si está definido; si una habilidad vieja no lo tiene, siguen infiriéndolo del tipo como antes (compatible hacia atrás).

- **`asistente-item.js`, bono "Armadura mágica"** (2026-09-27, Paso 7 de las reglas de casteo): el stat nuevo `armadmg` (ver `docs/reglas-casteo.md` §1.4) se puede dar como bono de ítem desde el paso "Bonos" de siempre — acceso rápido en la categoría Defensa (`RAPIDOS.defensa`) y disponible como "+ Otro stat" en cualquier categoría (ya estaba en la lista de stats de la ficha por venir de `EXTRA`; se sumó a mano a `cfgItemGM` de gm-tools, que arma su lista de stats aparte). El asistente no impone ninguna rareza mínima — es la mesa la que decide reservarlo para ítems Raros o mejores, como dice 3e.

- **`asistente-duelo-hab.js`, daño que escala con X** (2026-09-27, P119, `docs/preguntas-abiertas.md`): mismo criterio que
  ya usaba "ataque con mi arma, con arreglos" para su X (`dadosPorX`/`fijoPorX`, resuelta ANTES de armar el duelo, al pagar
  el costo). El paso "Daño" del 🎯 suma `danoFijoPorX` (cuánto se suma a la fórmula por cada punto de X), **visible solo si
  la habilidad ya tiene costo "X"** (`cfg.costoVariable: 'sp'|'nitros'|''`, nuevo parámetro de `AsistenteDueloHab.abrir`,
  derivado de `spVariable(it)`/`nitrosVariable(it)` — los creeps de gm-tools no tienen costo variable, así que ahí siempre
  es `''` y la opción no aparece). `habDueloDe(it, xSp, xNitros)` (antes sin esos dos parámetros) arma la fórmula final
  (`base + danoFijoPorX * X`, con la X ya elegida en `#scrim-costox`) justo antes de crear el duelo; `terminarEjecucionHab`
  le pasa la X que recibió. **Rayo Mágico** (Mago) quedó auditada con esto — primera skill del juego con daño variable por
  X en el duelo. Simplificación consciente: sin tope de X por habilidad (el "X ≤ Especial" de Rayo Mágico queda ✋ a mano;
  el placeholder general `IT2.limiteXSp` sigue sin confirmar) y sin dados extra por X (`danoDadosPorX`), solo el caso fijo.

- **Hechizos de área: la misma cascada del duelo, no una herramienta aparte** (2026-09-27, Paso 7b del casteo, pedido explícito del dueño — "quiero que tenga el mismo espíritu del paso a paso... que se vea en la mesa"): `duelo.js` suma un objetivo `'area'` a `hab` (con `radio`, configurado en `asistente-duelo-hab.js`) y una **fase nueva, `dodge`**: si el defensor gana el contacto Y el duelo tiene `d.grupo` (ver más abajo), en vez de "SE RESISTIÓ" se abre el derecho a un dodge roll (`resolverDodge(id, logroSalir)` decide el fin). Dos hooks nuevos de `escuchar(cfg)`, ambos solo para el mapa/GM: `chequearDodge(d)` (¿el defensor sigue adentro del área?) y `grupoResuelto(d)` (avanzar la cascada de `vtt-hexgrid/mapa.html`, colección nueva `campanas/<id>/areas/<id>`, ver su `CLAUDE.md`). `Duelo.crear` ahora exporta `limpiarHab` (lo usa el mapa al crear el documento del área) y acepta `cfg.yo.uid` explícito (si no se pasa, sigue usando `yo()` como siempre) — hacía falta porque, en la cascada, del 2do objetivo en adelante es el mapa del GM el que llama a `crear()`, no el casteador. **El casteador tira su PdG.Esp/PdG una sola vez para toda la cascada** (corrección del dueño probando en mesa, 2026-09-27): `crear()` acepta `cfg.pdgCompartido` (una tirada ya resuelta, saneada por `limpiarTiro`) y la precarga en `inicial.pdg` — el mapa la captura del primer objetivo resuelto (`dueloGrupoResuelto`, guardada en `areas/<id>.pdgCompartido`) y se la pasa a cada sub-duelo siguiente, que entonces solo pide la Evasión de ese objetivo. Reglas nuevas: campos `grupo` y `pdgCompartido` en `duelos`/`areas`, colección `areas` completa — hay que pegarlas.
  Dos hooks más de `escuchar(cfg)`, `dodgeEmpieza(d)`/`dodgeTermina(d)` (2026-09-27, pedido del dueño probando en
  mesa): avisan, con edge-detection propio (`dodgeActivos`, un Set — una sola vez al entrar y una sola vez al salir
  de la fase `dodge`, sin importar cuántos snapshots pasen mientras dura), para que el mapa minimice el cuadro solo
  en la pantalla de quien tiene que decidir el dodge roll (y lo reabra al terminar) — ver `../vtt-hexgrid/CLAUDE.md`
  para el detalle. No usan Firestore: es puramente local a cada pantalla.

- **`asistente-duelo-hab.js` paso a paso** (2026-09-27, pedido del dueño — mismo criterio que `asistente-item.js`,
  `asistente-estado.js` y `asistente-trampa.js`): el 🎯 (ahora ⚔) ya no es un formulario largo de una sola pantalla —
  cada pregunta es su propio paso, con chips arriba (`pasos()`, dinámica según `st.activo`/`st.modo`/`st.objetivo`/
  `st.tira`), un título y una explicación por paso, y Atrás/Siguiente. Reusa la paleta oscura que ya tenía el archivo
  (`#adh-fondo`/`.adh`, azul `#2d6cdf`) en vez de la de pergamino de `asistente-item.js`. Guardar queda siempre
  visible en el pie (se está editando siempre, nunca "creando" un ítem nuevo de cero como si pasa en el de ítems).
  El resumen final ("Listo") repite en una línea lo que quedó configurado. Ninguna validación ni el payload final
  cambiaron — solo la presentación.
- **Íconos del duelo: ⚔ en vez de 🎯** (2026-09-27, pedido del dueño): el 🎯 (apuntar/objetivo) se usa en todo el
  código para varias cosas de "elegir objetivo" que no son el duelo — se cambió solo lo que representa
  específicamente "el duelo de esta habilidad": el encabezado del asistente, sus botones disparadores y la
  etiqueta "duelo" del ítem, en `ficha-personaje/ficha.html` y `gm-toolset/gm-tools.html`. El resto de los 🎯 del
  juego (Crear tokens, ¿A quién le pegó?, etc.) no se tocó.
- **Botón "🎲 Dados" de la Mesa: visible achicada o agrandada** (2026-09-27, pedido del dueño): antes
  `#mesa.colapsada #mesa-grilla{display:none}` lo escondía del todo con la Mesa achicada — se sacó esa regla
  (`ficha-personaje/ficha.html` y `gm-toolset/gm-tools.html`) para que se vea igual en los dos estados.
- **Áreas: seguro contra que se queden pegadas para siempre** (2026-09-27, bug real reportado por el dueño —
  "el área no debería dejar ninguna marca en el terreno" — quedó el círculo violeta en el mapa después de que Orbe
  arcano ya había terminado): la causa más probable es un sub-duelo en fase `dodge` que nadie llegó a resolver
  (el cartel «✋ No me quiero mover» solo lo ve el defensor o el GM — si ninguno lo toca, la cascada nunca avanza y
  `areas/<id>.estado` se queda en `'en-curso'` para siempre). `escucharAreas()` (`vtt-hexgrid/mapa.html`) ahora,
  además de la autocuración de siempre, cierra sola (`estado:'terminado'`) cualquier área que siga `'en-curso'`
  pasados `AREA_ATASCADA_MS` (5 minutos) desde que se creó — sin importar la causa puntual del bloqueo, la marca en
  el mapa nunca queda para siempre.
- **La moneda de un empate rueda en 3D** (2026-09-27, pedido del dueño): `elegirParidad` (desempate por par o impar)
  publicaba el resultado del d6 directo, sin pasar por la Mesa ni por los dados 3D — el cuadro mostraba quién ganó
  al instante. Ahora publica la tirada con `mesaPublicar` (mismo camino que el d20 del crítico, `tirarCritico`) y
  `nReveal` (`comun/duelo.js`) suma un paso propio cuando `d.contacto.moneda`/`d.bloq.moneda` aparece (aparte del que
  ya contaba `pdg`+`eva`), así el cuadro espera a que el dado de la moneda quede quieto antes de revelar quién ganó
  el empate — mismo mecanismo que ya usaban contacto, Bloqueo y crítico ("Primero los dados, después el resultado").

- **`estado-preguntas.js`, tope opcional del Excedente de vida** (2026-09-27, pedido del dueño): al activar el
  preset «Excedente de vida», el cartelito paso a paso suma una pregunta más, «¿Tiene un tope máximo de
  excedente?», con el mismo checkbox «Sin límite» que ya usaba la pregunta de turnos (generalizado: cualquier
  pregunta con `q.sinLimite` lo tiene, no solo `q.turnos`) — se guarda en `excedenteTope` (`null` = sin tope,
  nada lo hace cumplir solo, es un recordatorio). El chip ❤+N lo muestra como ❤+N/tope cuando hay uno cargado
  (ficha, gm-tools y el HUD del mapa — se agregó `tope` al resumen público que arma cada uno). **El estado nunca
  se borra solo al llegar a 0** (confirmado revisando el código: ni `escudoParsear` ni el handler de los botones
  −/+/escribir tocan la lista de efectos, solo el valor — ya funcionaba así antes de este cambio, sin necesitar
  nada nuevo).

- **`asistente-duelo-hab.js`/`duelo.js`: tirada personalizada y "efecto a mano" (2026-09-27, pedido del dueño,
  auditando Drenar vida)** — herramienta GENERAL, no a medida de una skill puntual: el 🎯 sigue siendo el mismo
  duelo compartido de siempre (elige objetivo en el mapa, cuadro visible a toda la mesa, minimizable), pero dos
  de sus pasos ahora aceptan "no automatizar del todo":
  - **Paso "Tirada"**: en vez de elegir un stat de la ficha, "Personalizada" deja escribir tu propia fórmula
    (`tiraFormula`, admite **`X`**) con tu propio texto (`tiraEtiqueta`). `habDueloDe` (ficha) arma
    `hab.tira = {formula, etq}` con la X ya sustituida (mismo momento que `danoFijoPorX`, antes de crear el
    duelo) en vez de `{stat, etq, bono}`; `DUELO_HOOKS.habTirar` tira esa fórmula igual que cualquier stat
    (`if(c.formula){ tirarDados(c.formula); ...; return; }`) — el resto del duelo (contienda, empate, dados 3D,
    Mesa) no sabe ni le importa si la tirada vino de un stat o de una fórmula, porque siempre lee `c.etq`/el
    resultado ya tirado. `sustituirX(formula, X)` (reemplaza el token `X` por un número) es el mismo helper para
    esto y para `efectoLibre`.
  - **Paso "Daño"**: una casilla nueva "Tiene un efecto que no se puede automatizar del todo" abre un texto
    libre (`efectoLibre`) que el cuadro del duelo muestra en el veredicto junto a la **diferencia numérica**
    entre las dos tiradas (`d.contacto.dif`, que ya calculaba el duelo pero no se mostraba en ningún lado) —
    para que se resuelva a mano con el número a la vista, sin tener que abrir la consola ni adivinar.
  - `limpiarHab` (usado por los hechizos de área) reconoce ambas formas de `tira` y pasa `efectoLibre`, así que
    un hechizo de área también podría usar tirada personalizada si hiciera falta (no probado todavía).
  - **Descartado en el camino**: una primera versión metía esto en una ventanita aparte de la ficha
    (`pasosCustom`, con su propio popup fuera del duelo) — el dueño pidió que se mantuviera la dinámica real del
    duelo compartido en vez de una herramienta paralela, así que se sacó esa versión por completo (no queda
    ningún resto en el código) y se rehizo como está acá.
  - **El sistema de ejecución simple (`tiradaStat`/`tiradaExtra`, sin `duelo`) sigue existiendo a propósito** —
    el dueño lo va a testear en paralelo con el grupo antes de decidir si lo reemplaza del todo; el checkbox
    "¿Se juega en el duelo?" del primer paso del 🎯 ya permite desactivar el duelo por habilidad para quien
    prefiera la ejecución de siempre.
  - **Drenar vida** (Debuffer) es la primera skill auditada así: tira personalizada "X + 1dX" (etiqueta
    "Drenaje") contra Res.Esp (un stat normal, sin necesitar personalizar la Resistencia); el efecto a mano
    explica que se drena la diferencia, con Excedente de vida si pasa el máximo. No2 = 2 (dicho por el dueño,
    no estaba en el texto original).

- **`asistente-duelo-hab.js`: paso "Costo" (2026-09-27, pedido del dueño — "al principio te tiene que preguntar
  qué se cobra al ejecutar")**: segundo paso del 🎯 (justo después de "¿Se juega?"), con SP (texto, admite "X"),
  No2 (Un número / X / Lo mismo que un ataque) y HP. **No es un dato nuevo**: lee y escribe el mismo
  `it.costo`/`it.nitrosCosto`/`it.hpCosto` de siempre — el paso "Costo" del editor de la habilidad sigue
  existiendo y editando lo mismo; ahora se puede tocar desde cualquiera de los dos lugares. `AsistenteDueloHab.abrir`
  necesita `cfg.costoInicial = {sp, nitrosCosto, hpCosto}` para arrancar con los valores actuales, y su
  `alGuardar` ahora recibe `{duelo, costo}` en vez del `duelo` pelado (o sigue siendo `null` para "sin duelo"/
  "sacar el duelo", que no toca el costo) — **los dos call sites existentes** (`ficha-personaje/ficha.html` y
  `gm-toolset/gm-tools.html`, el ✎ de una habilidad de creep) se actualizaron para el nuevo contrato; los creeps
  no tienen costo en HP todavía, así que ahí `costoInicial.hpCosto` queda sin pasar y `r.costo.hpCosto` no se
  guarda (el campo igual aparece en el paso, pensando en el día que haga falta).

- **`duelo.js`: la cuenta del crítico en cuadraditos** (2026-09-27, pedido del dueño — antes era una probeta,
  hecha con la herramienta de visualización para acordar el diseño; ahora vive en el duelo de verdad):
  `criticoVizHtml(d)`, dentro del paso "4. Crítico", en las tres situaciones (no es crítico, es crítico
  esperando tirar los d20, y ya tirados). Arriba, **"Rango del crítico"**: el Tipo del arma en cuadraditos, con
  los que resta el Crítico frecuente tachados y atenuados (queda el rango real entero). Abajo, **"Tu tirada"**:
  la tirada de PdG **completa** (no la diferencia — el dueño pidió ver el total real de la tirada), con lo que
  se come la Evasión/Parry en rojo con una «E», y el resto agrupado de a "rango": cada grupo entero es un nivel
  de crítico (azul); los grupos que anula la Resistencia a crítico quedan con una raya dorada encima (`.anulado`);
  lo que sobra sin llegar a completar un grupo queda gris, suelto. Mismos colores que ya usaba el resto del
  cuadro (`#2d6cdf` azul, `#d95a6e`/`#3b1820` rojo, `#ffd25a` dorado, `#39435c` bordes) — no se inventó paleta
  nueva.

- **`opcionesDefensa`: mostrar la fórmula ANTES de elegir, también para los creeps** (2026-09-27, pedido del
  dueño — "uno debe saber cuánto tira antes de apretar el botón"): la ficha (personajes e invocaciones) ya
  mostraba "Evasión 🎲 1d8+2" / "Parry 🎲 …" al lado de cada botón del menú "Elegí cómo te defendés" (campo
  `info` de cada opción, que el cuadro del duelo ya sabía dibujar — `comun/duelo.js` línea de `Elegí cómo te
  defendés`); a `gm-toolset/gm-tools.html` (creeps) le faltaba, mismo `fx()` que ya usaba la ficha
  (`formulaParaValor` + `mitadesDeTirada` para Pajaritos/Lisiado/Parálisis).

- **Cuadraditos del crítico: de a 5 y con leyenda (2026-09-27, ajuste del dueño a lo recién agregado)**: dos
  correcciones sobre `criticoVizHtml`. (1) **Tachado por cuadradito, no por grupo**: un grupo de "rango" que anula
  la Resistencia a crítico ya no lleva una línea sobre todo el grupo (`.duelo-crit-grupo.anulado::after`, sacado)
  — cada cuadradito de ese grupo lleva su propia franja diagonal dorada (`.duelo-crit-cuad.anulado::after`, un
  degradé sobre el cuadradito individual), así el tachado no se pierde al reordenar. (2) **Agrupado de a 5**
  (`deA5`, en las dos filas): un hueco un poco más grande cada 5 cuadraditos, solo para poder contar de un
  vistazo sin tener que ir de a uno — no tiene ningún significado de juego, es aparte del agrupado por "rango"
  (que sigue existiendo, solo por color: azul = cuenta, tachado = anulado, gris = no llega a un nivel entero).
  Se sumó una **leyenda** (`.duelo-crit-leyenda`) debajo de las dos filas con un cuadradito de ejemplo de cada
  color/símbolo y su significado (incluye el Tipo del arma en el texto de "anulado por Resistencia a crítico").

- **"Ignora Resistencia a crítico" en "Ataque con mi arma, con arreglos" (2026-09-27, pedido del dueño)**: nuevo
  campo del paso "Tu ataque" del 🎯 (`comun/asistente-duelo-hab.js`, checkbox + cuántos puntos,
  `duelo.arma.ignoraResistCrit`) para skills como Golpe brutal que ignoran parte de la Resistencia a crítico del
  objetivo. `ataqueDeHabArma` (ficha.html) lo pasa en `mods.ignoraResistCrit`; `entrarCritico` (`comun/duelo.js`)
  le resta esos puntos a la Resistencia ANTES de `Critico.evaluar`, así se ve reflejado en la cuenta, en los
  cuadraditos y en cuántos d20 se tiran — con una línea extra en la explicación cuando corresponde ("Golpe brutal
  ignora 2 de Resistencia a crítico del defensor."). Solo para modo `'arma'` (el único donde hoy hay crítico —
  las habilidades dirigidas con daño mágico no critican). No se conectó todavía del lado de gm-tools (los creeps
  no tienen un `ataqueDeHabArma` propio hoy — ver "A desarrollar" si hiciera falta).
  **Corregido el mismo día**: `Duelo.crear()` armaba `ataque.mods` con una lista fija de campos (`pdg`, `dados`,
  `fijo`) que no incluía `ignoraResistCrit` — se guardaba en el objeto que llegaba, pero `crear()` lo descartaba
  al sanear el doc antes de escribirlo en Firestore, así que el checkbox no hacía nada en la partida real (sí se
  veía bien en el resumen del asistente, por eso no se notó antes). Ya está en la lista.

- **+Crítico frecuente/potente "solo esta tirada" en "Ataque con mi arma, con arreglos" (2026-09-29, pedido del
  dueño, auditando Lisiar)**: mismo espíritu que "Ignora Resistencia a crítico" de arriba, pero para el rango del
  crítico en vez de la resistencia — dos campos nuevos del paso "Tu ataque", `duelo.arma.critBono`/`critpotBono`.
  La diferencia con darle el bono como un "Efecto sobre uno mismo" (`efectoMods` con `crit`/`critpot`) es a
  propósito: un efecto **dura al menos 1 turno** (mínimo del asistente de estados) y por lo tanto podría alcanzar
  a un ataque posterior dentro del mismo turno — Lisiar necesita que el bono cuente **solo para el ataque de esta
  habilidad puntual**, sin dejar ningún estado. `ataqueDeHabArma` (ficha.html) los pasa en
  `mods.critBono`/`mods.critpotBono`; `Duelo.crear()` los suma a la lista blanca de `ataque.mods` que sí persiste
  (mismo bug real que ya tuvo `ignoraResistCrit`: sin sumarlos ahí, el checkbox se ve bien en el asistente pero no
  hace nada en la partida); `entrarCritico` (`comun/duelo.js`) los suma a `frecuente`/`potente` ANTES de
  `Critico.evaluar` (no después: así también corrigen el rango del crítico y no solo el multiplicador), con su
  propia línea en la explicación ("Lisiar suma +1 a tu Crítico frecuente, solo en esta tirada."). No toca `S.efectos`
  ni ninguna ficha — vive solo dentro de la cuenta de ese golpe. Mismas limitaciones que `ignoraResistCrit`: solo
  modo `'arma'`, sin conectar del lado de gm-tools todavía.

- **⚡ Critical Matters: efectos que solo pasan si el golpe es crítico (2026-09-29, pedido del dueño, auditando
  Lisiar — "un efecto que es de una manera si no es crítico, y de una manera más intensa si el golpe sí es
  crítico")**: en el paso "Al pegar" del 🎯/✨, solo para modo `'arma'` (el único que puede critear), un checkbox
  nuevo **⚡ Critical Matters** destapa una segunda tanda de ◎ Estado / 💚 Cura / Personalizar — **el mismo
  andamiaje de siempre, duplicado**, que se guarda en `duelo.critico = {efectos, efectosNota}` (top-level, al
  lado de `duelo.efectos`/`efectosNota`, no adentro de `duelo.arma`: es "qué pasa si pega", no un arreglo del
  ataque en sí). Se **suma** a los efectos de siempre, no los reemplaza — Lisiar por ejemplo lleva la Lesión
  −1 PG de siempre en `efectos`, y en `critico.efectos` un texto libre aclarando que pasa a −2 fijo.
  - **Generalización del paso "Efectos" para no duplicar código**: `filaEstadoPresetHtml`/`filaEstadoManualHtml`
    ya tomaban `(e, i)` con `i` como clave de fila en los `data-ef-*`; ahora `i` puede ser un número (lista de
    siempre) o `'c'+número` (lista de Critical Matters) — `efRef(clave)` (nuevo, en el bloque de handlers)
    resuelve la clave al array real (`st.efectos` o `st.efectosCritico`) y al índice adentro, así **una sola
    fila de handlers sirve para las dos listas** (`data-ef-nombre`, `-stat`, `-val`, `-turnos`, `-escudo`,
    `-cura`, `-x`, `-recambiar`). `data-ef-mas` distingue con un prefijo (`"estado"`/`"cura"` vs
    `"c:estado"`/`"c:cura"`) a cuál de las dos empuja.
  - **`comun/duelo.js`**: `Duelo.crear()` sanea `cfg.ataque.critico` igual que `cfg.ataque.efectos`/`efectosNota`
    (mismo `limpiarEfectos`, mismo tope de 8 y de 200 caracteres) y lo guarda en `inicial.ataque.critico` — sin
    esto, mismo bug real que ya tuvieron `ignoraResistCrit` y `critBono`/`critpotBono` (se ve bien en el
    asistente, no persiste). `entrarCritico` ya resuelve `d.crit` ANTES de la fase de daño, así que al tirar el
    daño (`campo === 'dano'`, donde ya se arma `extra.efectos` con lo de la propia arma + `d.ataque.efectos`) se
    suma también `d.ataque.critico.efectos` **si y solo si** `d.crit.critico` es `true` — mismo mecanismo de
    "recordar y tirar, no aplicar" que ya usan `efectosArma`/`d.ataque.efectos` (el estado se muestra con su
    botón «Aplicar», no se escribe solo). `efectosHtml` agrega una tarjeta aparte **"⚡ Crítico: …"** con
    `d.ataque.critico.efectosNota`, con la misma condición (`d.crit && d.crit.critico`) — no aparece si el golpe
    no fue crítico, aunque la habilidad tenga el texto cargado.
  - **`ficha-personaje/ficha.html`**: `ataqueDeHabArma` mapea `c.critico.efectos` con el mismo `mapEf` que ya
    usaba para `c.efectos` (mismo shape `{nombre, caras, exitos, spec, cura, detalle}`) y pasa `c.critico.efectosNota`
    por `sustituirX` igual que `c.efectosNota` (por si el texto usa «X»).
  - **Verificado de punta a punta** (no solo por sintaxis): la ventana del asistente arma el `duelo.critico`
    esperado; `Duelo.crear()` contra un Firestore simulado lo persiste saneado; un doc de duelo armado a mano
    con `d.crit.critico: true` muestra la tarjeta del estado y la nota "⚡ Crítico: …" (con `d.crit.critico:
    false` no aparece ninguna de las dos, confirmando que la condición realmente filtra y no que siempre se
    muestre). Sin conectar del lado de gm-tools (mismo alcance que `critBono`/`ignoraResistCrit`: los creeps no
    tienen `ataqueDeHabArma` propio todavía).

- **Paso "Efectos": mismo "Personalizar" que Tirada y Daño (2026-09-27, pedido del dueño)**: además de los
  ◎ Estado/💚 Cura de siempre, un checkbox "Personalizar: tiene otro efecto que no está en la lista" abre un
  texto libre (`efectosNota`) — para algo que no encaja como estado ni como cura (ej. "invertí el orden de
  turno"). Existe tanto en modo `'hab'` como en modo `'arma'` (los dos usan `cuerpoEfectos`). Se muestra en
  `efectosHtml` (`comun/duelo.js`) como una tarjeta más, sin tirada ni botón «Aplicar» — a diferencia de
  `efectoLibre` (que sale en el veredicto, con la diferencia numérica), esta nota no depende de que haya una
  tirada de por medio, así que `efectosHtml` ya no se corta si `d.efectos` viene vacío: se dibuja igual cuando
  hay nota, en cualquier fase del duelo (no hizo falta tocar `entrarHab`/`guardarAplicacion`: alcanza con que el
  render la muestre, sin importar a qué fase saltó el duelo por no tener efectos automáticos).

- **Bug real encontrado jugando: `sustituirX` no tocaba la X pegada a una «d» (2026-09-28, Drenar vida en
  partida real)**: el dueño reportó que el botón "🎲 Tirar Drenaje" del duelo se quedaba tirando sin resultado
  (se prende de nuevo el brillo, nada pasa). Causa: `sustituirX` (`ficha-personaje/ficha.html`) usaba
  `/\bx\b/gi` — en «X+1dX» eso reemplaza la primera X (con borde de palabra a los dos lados) pero NO la
  segunda, porque «d» y «X» son las dos `\w` y no hay borde de palabra entre ellas. La fórmula quedaba
  «3+1dX», con una X literal, y `tirarDados` la rechaza en silencio (`parseDados` devuelve `null`, y el hook
  `habTirar` solo llama a `registrarTirada` `if(r)` — sin `else`, no avisaba nada). Arreglado con una segunda
  pasada para `dx`/`xd` (dado de X caras / X dados) además de la de siempre — sigue sin tocar el resto de un
  texto libre (`efectoLibre`/`efectosNota`) porque una palabra normal no trae "dx"/"xd" pegados. De paso,
  `DUELO_HOOKS.habTirar` ahora avisa con un toast si la fórmula personalizada no es válida, en vez de quedarse
  callado — para que la próxima vez que pase algo así se note enseguida, no después de 8 segundos de brillo.

- **Cuadraditos del crítico, ajuste (2026-09-28, pedido del dueño)**: (1) la barra de "Tu tirada" vuelve a agruparse por el **rango** (cada grupo = un nivel de crítico; lo que se come la Evasión/Parry, las «E», va aparte de a 5) en vez de a 5 parejo; la fila de arriba (Rango) sigue de a 5. (2) Los cuadraditos que resta el **Crítico frecuente** van en **verde con una «F»** (`.duelo-crit-cuad.frec`, antes atenuados) y la leyenda suma su línea "F = Crítico frecuente (N)…" cuando hay alguno.
- **La tirada de Evasión nunca baja de 1** (2026-09-28, regla del dueño): se corrige a mínimo 1 al tirarla (`tirarValorStat` y `tirarValorStatInv` en `ficha.html`, `tirarValorStat` en `gm-tools.html`: cubre sobrepeso, mitades de Pajaritos/Sentado y modificadores negativos) y, como red de seguridad, al guardarla en el duelo (`guardarTiro`, `comun/duelo.js`, campo `eva`).

- **Objetivo "Onda alrededor de quien la usa" (`objetivo: 'onda'`, 2026-09-28, pedido del dueño; primera skill: Shockwave del Tanque)**: nueva opción en el paso "Objetivo" del 🎯 (`asistente-duelo-hab.js`), con su radio (1 = los adyacentes). Reusa por completo la cascada de los hechizos de área (`vtt-hexgrid/mapa.html`, `dueloElegirAreaMapa` → doc `areas`, un sub-duelo por rival, quien la usa tira **una sola vez** y cada uno se resiste por separado) con tres diferencias: (1) **no hay que marcar el centro**: es el propio token de quien la usa (si no está en el mapa avisa y no lanza); (2) **no hay dodge roll** (`cerrarPar` en `duelo.js`: ganar la resistencia termina el duelo como "se resistió", no abre la fase `dodge`, porque no hay a dónde salir); (3) se saltea el paso "Alcance" (queda en 8 pasos). Igual que en el área: solo rivales, sin el propio ejecutor ni ocultos. `habDueloDe` (ficha) y `habDueloCreep` (gm-tools) mandan `radio` también para la onda, y `limpiarHab` acepta el objetivo. Sin ficha/mapa abierto avisa "se lanzan desde el mapa". No hacen falta reglas nuevas de Firestore. **Shockwave** (`comun/skills-clase.js`): `duelo: {objetivo:'onda', radio:1, tira:'fue', contra:['con'], efectos:[Pajaritos 2 turnos]}`; SP 3 (Flash ×2 = el doble, 6 SP en turno ajeno, a mano). Si el objetivo gana la Constitución no pasa nada (mismo criterio que Sonic Boom).

- **Objetivo "Zona persistente" (`objetivo: 'zona'`, 2026-09-28, pedido del dueño — "que la automatización no
  quite el momento de esto está pasando"; primera skill: Nube tóxica del Debuffer)**: nueva opción del paso
  "Objetivo" del 🎯 (`comun/asistente-duelo-hab.js`), con radio, duración en turnos, si también afecta a los
  aliados, y qué estado deja (con stacks si es Veneno/Veneno severo). A diferencia de área/onda **no se resuelve
  al ejecutar**: crea un elemento de Terreno y Formas que queda puesto varios turnos y se chequea de a uno —
  generaliza 🔥 Terreno incendiado (que sigue existiendo tal cual, sin tocar) para que además pueda dejar un
  estado, con o sin resistencia, y lo pueda colocar una habilidad de jugador o de creep, no solo el GM a mano.
  - **No pasa por `comun/duelo.js`** (no hay contienda instantánea, así que no hay dodge ni cascada de
    sub-duelos): `ficha.html`/`gm-tools.html` interceptan el objetivo `'zona'` ANTES de armar el duelo normal
    (`colocarZonaDeHab`/`colocarZonaDeHabCreep`) — si la habilidad tiene tirada (paso "Tirada"), la tira UNA
    vez ahí mismo (con `compute().final[stat]` en la ficha, `creepStatValor` en gm-tools) y le manda al mapa,
    por `postMessage({tipo:'zona-persistente-habilidad', …})`, el radio, la duración, el estado, el daño (si
    el paso "Daño" está tildado, la fórmula sale de `it.tiradaExtra` como cualquier duelo) y esa tirada ya
    resuelta. El mapa (`zonaPersistenteDeHabilidad`, `vtt-hexgrid/mapa.html`) pide el centro con un clic (como
    un hechizo de área) y crea el elemento. Sin el mapa abierto, avisa que hace falta para colocarla.
  - **El elemento** lleva `zona`, `zonaNombre`, `zonaDano?`, `zonaIgnoraDef?`, `zonaEstado?` (JSON
    `{nombre,turnos,stacks?}`), `zonaAmiga?`, `zonaResistStat?`, `zonaResistValor?` (la tirada del casteador),
    `zonaCasteadorRef`/`zonaCasteadorTipo` (quién la creó, para saber quién es rival) y `zonaResueltos` (a
    quién ya se le aplicó el estado — no se lo vuelve a chequear). Mismo `turnos`/`venceMant` de siempre
    (Formas con turnos) para que se borre sola. **Reglas de Firestore nuevas: hay que publicarlas** (los
    campos `zona*` en `elementoValido` y en el `update` de `elementos`, con una rama nueva que deja a
    cualquier afectado sumarse solo a `zonaResueltos`, uno a la vez).
  - **El motor** (`vtt-hexgrid/mapa.html`, junto a `fuegoMantenimiento`): `zonaRevisarEntrada`/
    `zonaRevisarMantenimiento` — mismo momento que ya usa el fuego (al mover un token, y en cada ⟳
    Mantenimiento) — revisan, **cada pantalla lo suyo** (el dueño sus personajes, el GM sus creeps), si algún
    token propio está parado en una zona que le falte algo: el daño se vuelve a chequear siempre (como el
    fuego); el estado, solo si ese token no está ya en `zonaResueltos`.
  - **El cartelito, no el silencio** (el pedido explícito del dueño): en vez de resolver todo solo, se encola
    y se muestra `#zona-banner` — "🌫 *Nube tóxica*: *Fulano* entró — tirá Res.Esp para resistir" con un botón
    🎲, o "le toca a *Fulano*" con un botón "Aplicar" si no hay nada que tirar (una zona de puro daño, tipo un
    fuego armado por skill). Al resolver (`zonaResolverBanner`): si hay resistencia, tira el stat del afectado
    (de `resumen.<stat>` publicado por la ficha para un PJ — se sumó `resumen.resmg`, Res.Esp, para esto — o
    `zonaStatCreep` para un creep) contra la tirada guardada del casteador (empate = gana quien creó la zona);
    si no resistió, aplica el daño (`danioPj`/`danioCreep`, como el fuego) y el estado (`EstadosAplicar`,
    mismo mecanismo que "Estados sobre otros, automáticos" de gm-tools — a un creep directo, a un PJ con
    `encolarPj`: la ficha del dueño lo aplica sola, aunque no esté mirando el mapa en ese momento) — y recién
    ahí anota `zonaResueltos`. El resultado se muestra un momento más en el mismo cartelito antes de cerrarse.
    Todo publicado a la Mesa (`mesaPublicar` para la tirada de resistencia; el daño ya se anuncia solo).
  - **Nube tóxica** (`comun/skills-clase.js`): SP 3, No2 1, radio 1 (diámetro 3), dura 3 turnos, tira Especial
    contra Res.Esp (una sola vez), Veneno ×3 al que pierde, no afecta a los aliados.
  - **Etapa 2, pendiente** (lo cosmético, no construido todavía): partir el botón ⬡ del toolkit en tres —
    Formas libres / Trampas / Zonas con efectos persistentes — para poder colocar una zona directo en el mapa
    sin pasar por una habilidad, y sumar la misma opción al asistente de trampas (una trampa que, en vez de
    dispararse una sola vez, deja puesta una zona). Ver el hilo de diseño de esta fecha.

- **Etapa 2 — el ⬡ despliega tres modos, y "Zonas con efectos persistentes" tiene su asistente paso a paso**
  (2026-09-28, pedido del dueño, sigue a la etapa 1 de arriba). El botón ⬡ Terreno y Formas del toolkit
  (`vtt-hexgrid/mapa.html`, `HERRAMIENTAS`) ya no entra directo a un modo: el clic despliega dos filas más debajo
  (`elementoSubmenuAbierto`) — **Formas libres** (lo de siempre: color, transparencia, imagen, Sólido, Invisible,
  Turnos, 🧱 Colisión del GM — pero ya sin la casilla "Trampa" ni "🔥 Terreno incendiado", que se sacaron de acá) y
  **Trampas** (mismo panel de dibujo, ahora con los campos de trampa siempre visibles — el modo ya implica que
  es una trampa, no hace falta tildar nada; al entrar sin nombre se abre solo el asistente de siempre). **🔥
  Terreno incendiado no se puede crear más desde acá** — lo reemplaza una zona con solo daño (sin estado); el
  mecanismo viejo (`fuego`/`fuegoDano`, `fuegoEntrada`/`fuegoMantenimiento`) queda intacto para lo que ya estaba
  colocado, sin tocar una línea.
  - **Zonas con efectos persistentes** es la tercera opción y NO usa el panel de dibujo: abre de una
    `comun/asistente-zona.js` (`AsistenteZona.abrir`), un asistente paso a paso nuevo (mismo estilo visual que
    `asistente-trampa.js`, con su propio prefijo de clases `az-` para no compartir CSS por las dudas) con 7
    pasos: **tamaño** (radio; por ahora solo Flor — Línea y Forma libre se siguen armando a mano por "Formas
    libres") **+ turnos que dura** en el mismo paso, **daño** (fórmula, tipo, ignora Defensa), **estado** (de
    `EstadosAplicar.DEBUFFS`, con stacks si es Veneno/Veneno severo), **resistencia** (opcional: como quien la
    pone es el GM y no hay nadie que tire, en vez de una tirada compartida se le pone un **número fijo** de
    dificultad — mismo criterio que ya usan las trampas en su texto), **disparo** (dos preguntas independientes:
    ¿sigue afectando en cada Mantenimiento a quien se queda adentro?, y ¿se dispara con cada paso caminado
    adentro o alcanza con entrar?) y **nombre + color**. Al terminar, pide marcar el centro con un clic (como un
    hechizo de área) y crea el elemento — `crearElementoZona(centro, cfg)`, la misma función que ahora también
    usa `zonaPersistenteDeHabilidad` (la de la Etapa 1, sin duplicar código). Cualquier miembro puede usarlo,
    igual que Formas libres y Trampas; el "bando" de una zona puesta así es el de quien la coloca (el GM =
    rival de los PJ, un jugador = rival de los creeps), sin un token puntual de casteador.
  - **Motor: dos disparadores nuevos, independientes** (`zonaEnMantenimiento`, default `true`; `zonaCadaPaso`,
    default `false`) que generalizan cómo y cuándo se chequea una zona — pensados para poder armar un piso de
    púas (duele al caminar, no por quedarse parado) además de una nube que sigue afectando a quien se queda
    quieto: `zonaRevisarMantenimiento()` salta las zonas con `zonaEnMantenimiento === false`;
    `zonaRevisarEntrada(id, celdas)` sigue mirando dónde terminó el movimiento para el caso normal, y ADEMÁS,
    para las zonas con `zonaCadaPaso`, cuenta cualquier casillero cruzado que sea suyo y venga de uno que no lo
    era (mismo conteo que ya usa 🔥, una vez por movimiento, no por casillero — ver el comentario en el código).
  - **Bug real encontrado probando el asistente**: si se elegía Veneno sin poner stacks a mano, los dos
    asistentes (`asistente-zona.js` y el paso "Objetivo" de `asistente-duelo-hab.js`) mandaban igual un `turnos`
    fijo (0 o 2) junto al nombre — `EstadosAplicar.componer` lo toma tal cual y el Veneno quedaba con los stacks
    de siempre (4) pero vencido antes de tiempo. Arreglado: sin stacks a mano, no se manda `turnos` en absoluto,
    así el preset se aplica entero. Nube tóxica (Etapa 1) no lo sufría porque siempre manda sus 3 stacks a mano.
  - **Reglas de Firestore nuevas** (además de las de la Etapa 1, todavía sin publicar): `zonaEnMantenimiento` y
    `zonaCadaPaso` sumadas a `elementoValido`.
  - **Pendiente**: sumar la misma opción de "queda como zona" al asistente de trampas (una trampa que en vez de
    dispararse una vez deja puesta una zona), y que el asistente de zonas también sepa armar Línea/Forma libre.

- **Trampas persistentes (2026-09-28, pedido del dueño, sigue a las dos etapas de arriba)**: en el asistente
  paso a paso de una trampa del mapa (`comun/asistente-trampa.js`, no en las que coloca una habilidad) hay un
  paso nuevo, justo después de "Estado": **"¿Al dispararse, queda además como una zona?"**. Marcado, además del
  golpe de siempre (una vez, a quien la pisó), la trampa deja puesta una zona con el **mismo daño y/o estado**
  que ya se configuró — como una trampa de gas que, al saltar, deja la nube ahí un rato. Se pregunta cuántos
  turnos dura esa zona, si sigue afectando en cada Mantenimiento y si se dispara con cada paso o alcanza con
  entrar (mismos dos disparadores de la Etapa 2), y si la zona se resiste con algo (dificultad fija, como el
  asistente de zonas — aparte del "se evita" de la trampa, que sigue siendo a mano y es solo para el golpe inicial).
  - **Cómo se guarda**: la trampa dormida lleva `trampaDejaZona` + `zonaTurnos` (la duración de la zona
    resultante — distinto de `turnos`/`venceMant`, que mientras la trampa no se disparó puede significar "se
    borra sola si nadie la pisa") + `zonaEnMantenimiento`/`zonaCadaPaso`/`zonaResistStat`/`zonaResistValor`.
    Nada de esto activa nada todavía: son datos a la espera.
  - **Al dispararse** (`trampaResolver`, `vtt-hexgrid/mapa.html`): después del golpe de siempre, si
    `trampaDejaZona`, una segunda escritura convierte el MISMO elemento (mismas celdas) en una zona de verdad
    — `zona: true`, copiando `trampaDano`→`zonaDano`, `trampaEstado`→`zonaEstado` (ya es el mismo formato JSON,
    se copia tal cual), `trampaIgnoraDef`→`zonaIgnoraDef`, `fuegoAmigo`→`zonaAmiga`, y recalculando
    `turnos`/`venceMant` con `zonaTurnos` desde ese momento (no desde que se colocó la trampa). El "bando" de la
    zona resultante es el mismo que ya definía `trampaDispara` (dueño GM → rivales los PJ; dueño jugador →
    rivales los creeps), sin un token de casteador puntual — mismo criterio que una zona puesta a mano.
  - **Regla de Firestore nueva**: quien dispara la trampa no es necesariamente su dueño, así que hace falta una
    rama de permiso aparte para esa segunda escritura — "una trampa con `trampaDejaZona` ya disparada, cualquiera
    completa su conversión a zona" (los campos vienen pre-armados por quien puso la trampa, no se inventan).
  - **Pendiente**: "Trampas guardadas" (recurrentes) todavía no recuerda esta configuración — una trampa
    persistente guardada y vuelta a cargar pierde el "deja zona" (hay que rearmarlo). Tampoco está en las
    trampas que coloca una habilidad (`trampaColocar`), solo en las del mapa.

- **El menú «Duelo» de una habilidad pasa a llamarse «Ejecución» (2026-09-28, pedido del dueño)**: probando
  configurar Blindaje (un escudo sobre uno mismo) desde el 🎯/⚔ de `comun/asistente-duelo-hab.js`, quedó claro
  que el nombre "Duelo" quedaba chico — el menú sirve para automatizar CUALQUIER tipo de habilidad (ataques,
  pero también buffs y curas sobre uno mismo o un aliado), y "unifica el efecto visual de ejecutar" cualquiera
  de ellas con el mismo cuadro compartido. Cambio solo de **etiqueta visible** (título del asistente `✨
  Ejecución · <nombre>`, el botón `✨`/tag de la lista de habilidades en ficha y gm-tools, y —dentro de
  `comun/duelo.js`— la cabecera, el tooltip de minimizar y el chip pendiente cuando el duelo es de una habilidad,
  `d.hab` truthy) — el motor real de combate cuerpo a cuerpo (`Duelo`, `duelo.js`, PdG contra Evasión) sigue
  siendo un duelo de verdad y conserva su nombre y su ⚔ en todo lo demás (un ataque con arma normal, sin `d.hab`).
  - **Tres obstáculos reales encontrados en el ejercicio, los tres corregidos el mismo día:**
    1. **Paso "Tirada": "Nada" vivía escondido** adentro del `<select>` de stats y no existía en modo
       Personalizada — un buff con tirada personalizada (propia, de sabor) no tenía forma de decir "no hay
       nada que resistir". Ahora es un tilde propio (`tiraNinguna`) que tapa el resto del paso sea cual sea
       el modo.
    2. **Paso "Resistencia" exigía siempre un stat** en cuanto había cualquier tirada — bloqueaba a Blindaje
       (una tirada propia sin nada que la resista). Suma **"Nadie"** (se aplica directo igual, `contraModo:
       'ninguna'`) y **"Otro"** (`contraOtro`, texto libre que se muestra en el cuadro del duelo como
       recordatorio para resolverlo a mano) al lado de "Con un stat de la lista"; el layout de la lista de
       checkboxes quedó además más prolijo (`.adh-check-list`, `align-items:flex-start`, ancho explícito —
       el dueño lo reportó "desprolijo" en una captura; no se pudo reproducir el desalineado exacto en una
       prueba aislada, así que el endurecimiento del CSS es preventivo).
    3. **Paso "Efectos" solo ofrecía debuffs**: `EstadosAplicar` solo tenía `DEBUFFS` (Veneno, Sangrado…) —
       nada de escudo ni de ningún buff, así que "Escudo especial" (lo que Blindaje necesita) no aparecía ni
       se podía dar un valor de escudo. `EstadosAplicar` suma **`BUFFS`** (Escudo especial, Barrera — mismos
       presets que `EFECTOS_PRESET`/`ESTADOS_PRESET_GM`, ver `ficha-personaje/CLAUDE.md`) y `presetPorNombre`
       busca en los dos; `componer`/`limpiarSpec`/`texto` ahora saben de `escudoMagico` (con un valor a mano
       ganándole al del preset), y el paso "Efectos" del 🎯 suma un campo propio "o un escudo de (opcional)"
       por cada ◎ Estado, con **autocompletado** al elegir "Escudo especial"/"Barrera" (carga su escudo y
       turnos de siempre, editable igual). `escudoMagico` tuvo que sumarse a CUATRO saneos separados que
       hasta ahora solo conocían campos de debuff — el mismo tipo de bug que ya pasó antes con
       `ignoraResistCrit` (ver la entrada del Paso "Ignora Resistencia a crítico" más arriba): el `limpiarSpec`
       **local** de `comun/duelo.js` (no el de `EstadosAplicar`, son dos funciones separadas con el mismo
       nombre), `EstadosAplicar.limpiarSpec`, y `aplicarEstadoRecibido` de la ficha (que arma el draft del
       estado recién llegado a mano, sin pasar por `EstadosAplicar.componer`).
  - **Blindaje en sí no se tocó** — sigue siendo una habilidad del sistema simple de siempre (sin duelo, paso
    "Efecto" del editor, `efectoEscudo: 8`, ver `ficha-personaje/CLAUDE.md`), que ya funcionaba. Este trabajo
    solo abre la puerta a que, si alguna vez se quiere migrarla (u otra parecida) al cuadro de Ejecución
    compartido, el paso "Efectos" ya la sepa representar.

- **Bug real: el checkbox del cuadro de Ejecución se estiraba a todo el ancho (2026-09-28, reportado por el
  dueño con capturas de los pasos Resistencia y Daño)**: `#adh-fondo` (`comun/asistente-duelo-hab.js`) resetea
  el ancho de `select`/`input[type=text]`/`input[type=number]`, pero nunca lo hacía para `input[type=checkbox]`
  ni `input[type=radio]` — ambas herramientas (`ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html`) tienen
  una regla global `input,textarea,select{width:100%}` para sus propios formularios, que sin ese reset se colaba
  también en los checkboxes/radios del cuadro: el checkbox se estiraba a ~600px (toda la fila, con el tilde
  real pintado en una esquina) y el texto de la etiqueta quedaba empujado a una columna de ~60px, una palabra
  por línea — exactamente lo que se veía en las capturas. **No se pudo reproducir en un harness aislado** (sin
  el CSS del host no aparece) — se diagnosticó recién al reproducirlo contra el stylesheet real de gm-tools.html
  (extraído a un archivo aparte para una prueba, después borrado). Fix: `width:16px;min-width:16px;max-width:16px`
  fijo para esos dos tipos de input dentro de `#adh-fondo label.op`. Afecta a TODOS los checkboxes/radios del
  cuadro (existían desde el 27, no solo los nuevos del 28), así que corrige de una: "¿Se juega?", Resistencia,
  Daño y el "Personalizar" de Efectos.
- **Paso "Daño": "No hace daño" pasa a ser una opción explícita** (mismo pedido, 2026-09-28): el único checkbox
  "Esta habilidad hace daño" (con "no hace daño" implícito al dejarlo destildado) se reemplaza por un radio
  No/Sí — mismo criterio que "Nadie"/"Otro" de Resistencia, para que ningún paso del cuadro dependa de leer un
  estado por omisión.
- **Paso "Efectos": el selector de "◎ Estado" reusa el selector real en vez de reinventar uno propio (2026-09-28,
  pedido del dueño — "el selector de estado no debería ser un desplegable... sino un botón de +ESTADO que
  despliegue el menú de estados alterados... siguiendo el mismo andamiaje")**: antes, cada fila de estado era un
  campo de texto libre (con un `<datalist>` de sugerencias) + turnos + un bono + un escudo, todo a mano — una
  versión pobre del selector de "+ Estado" que ya existe en toda la mesa (la grilla con Ver/Activar de siempre +
  el cartelito de `EstadoPreguntas` que pregunta las cantidades una por una). Ahora el botón "＋ Estado" (y el
  "✎ Cambiar" de una fila ya elegida) llama a `cfg.elegirEstado()`, una función opcional que **cada página define
  con SU propio catálogo** — `comun/asistente-duelo-hab.js` no sabe nada de `EFECTOS_PRESET` ni
  `ESTADOS_PRESET_GM`, solo espera una Promise que resuelve `null` (canceló), `{modo:'manual'}` ("Empezar en
  blanco": cae en los campos de texto de siempre, para algo que no está en ningún catálogo) o
  `{modo:'preset', nombre, turnos, permanente, hp, mods, stacks, escudoMagico, polaridad, detalle}` (un preset
  real, ya con sus cantidades respondidas). Sin `elegirEstado` (compatibilidad), el botón sigue con el
  comportamiento viejo.
  - **`ficha-personaje/ficha.html`**: `elegirEstadoDuelo()` reutiliza `abrirPresetsEfecto`/`aplicarPresetEfecto`
    con un destino nuevo, `'duelo'` — mismo mecanismo que ya distinguía `'directo'`/`'inv'`/`'item'`/`'efecto'`,
    sin tocar ninguno de esos. Como la elección llega por un clic asincrónico (no hay `editing.draft` que llenar:
    el resultado tiene que volver como el valor de una Promise), se guarda un resolver (`presetDueloResolver`) y
    `cerrarPresetsDuelo(valor)` lo resuelve y cierra el panel — hay que llamarlo desde los TRES lugares que antes
    solo hacían `$('#scrim-presets').classList.remove('open')` a mano: el botón ✕, el clic afuera del panel y el
    handler global de Escape (este último se comparte con un montón de otros scrims: si se agrega uno más ahí,
    hay que revisar si también necesita este tratamiento). El panel usa `z-index:60` de fondo — se sube a 99600
    al abrirse para 'duelo' (el cuadro de Ejecución está en 99500) y se repone al cerrar.
  - **`gm-toolset/gm-tools.html`**: mismo patrón (`presetsCreepDestino`, `presetDueloResolverGM`,
    `cerrarPresetsDuelo`) sobre `abrirPresetsEstadoCreep`/`aplicarPresetEstadoCreep` (el selector de aplicar un
    estado directo a un creep abierto) — con una diferencia real: ese selector nunca tuvo "— Empezar en blanco —"
    (siempre se aplica un preset real a un creep), así que `elegirEstadoDuelo()` arma su propio HTML con ese
    botón agregado en vez de llamar a `abrirPresetsEstadoCreep` tal cual.
  - **Verificado en vivo, no solo por sintaxis**: se probó el flujo completo (abrir el cuadro, ＋ Estado, elegir
    "Escudo especial"/"Barrera" de la grilla real, responder el cartelito de HP del escudo y turnos, ver la
    tarjeta de resumen en el paso Efectos, Guardar) en las dos páginas reales — no en un harness aislado —
    cargando cada una con su propio arranque de sesión desactivado a propósito para la prueba (archivo aparte,
    después borrado) porque `mesaIniciar(gmAlEntrar)`/`mesaIniciar(fbAlEntrar)` redirigen solos al no encontrar
    sesión.

- **`comun/confirmar-turno.js` — costo distinto en turno ajeno (2026-09-28, pedido del dueño, paso intermedio
  hasta tener al mapa avisando solo de quién es el turno — ver `docs/pendientes.md`)**: el paso "Costo" del
  🎯/✨ (`comun/asistente-duelo-hab.js`) suma un tilde "El costo en SP es distinto si no es tu turno" + un campo
  con el SP que se cobra en ese caso (`turnoAjenoSp`; al tildarlo por primera vez se autocompleta con el doble
  del SP de arriba — el mismo criterio que ya usa Shockwave en su texto, editable igual). Solo guarda el dato;
  vacío = no aplica. `ConfirmarTurno.pedir(nombre, costoPropio, costoAjeno)` (mismo patrón de Promise que
  `EstadoPreguntas.preguntar`: `null` si se cancela) es quien pregunta «¿es tu turno?» — lo usa
  `ficha-personaje/ficha.html` en `ejecutarHabilidad` (ahora `async`), justo antes de cobrar el SP (después del
  gate de No2 insuficiente, antes de `S.spGastado += costoSp`): si `it.turnoAjenoSp` tiene algo y el SP no es
  «X» (`!spVariable(it)`), se pregunta y el SP a cobrar es la respuesta — cancelar no cobra ni ejecuta nada.
  **Solo en la ficha por ahora**: `gm-toolset/gm-tools.html` no toca el archivo ni el flujo de Ejecutar de un
  creep — los creeps no tienen un concepto de SP gastado (`h.costo` ahí es solo para mostrar/duelo, ver la nota
  de la investigación de este mismo día en el hilo de diseño), así que no hay nada que cobrar distinto todavía;
  el checkbox del 🎯 igual se puede tildar y guardar en `h.turnoAjenoSp` para cuando haga falta. **No se combina
  con costo variable "X"** (`confirmarCostoVariable`, el modal de X): a propósito, sin precedente real que lo
  necesite. Verificado en vivo (no solo por sintaxis): el pop-up, las tres respuestas (Sí/No/Cancelar) y que
  cobran exactamente lo que dicen, con Shockwave de prueba (3 SP propio, 6 SP ajeno).

- **Bug real: una habilidad "a uno mismo" pedía objetivo igual, y nunca podía aplicarse sin el GM (2026-09-29,
  reportado por el dueño probando Blindaje en una partida real — "el origen de las especies")**. Dos fallas
  separadas, encontradas siguiendo el reporte:
  1. **`Duelo.elegirObjetivo` (`comun/duelo.js`) solo tenía el atajo "sin objetivo: uno mismo" del lado del
     mapa** (`dueloElegirObjetivoMapa`, `vtt-hexgrid/mapa.html`, agregado el 2026-09-28 junto con Shockwave).
     Cuando la habilidad se ejecuta **fuera del mapa** (ficha suelta, sin iframe — `elegirObjetivoLista`), no
     existía el mismo atajo: se mostraba "¿A quién atacás?" con la lista de TODOS los demás tokens — ni
     siquiera incluía el propio, porque la lista se arma filtrando `!propio(t)` — así que una habilidad "a uno
     mismo" no tenía forma de aplicarse sobre quien la usó, solo sobre quien se eligiera por error. Fix: nueva
     `elegirObjetivoUnoMismo(cfg)`, mismo criterio que el mapa (busca el propio token con `tokensDelMapa()` y
     llama a `crear()` directo), enganchada en `elegirObjetivo` antes de caer en `elegirObjetivoLista`.
  2. **Aunque el objetivo fuera correcto, aplicar el efecto (el botón «✔ Aplicar» del cuadro) dependía SIEMPRE
     de que el GM tuviera el mapa abierto y conectado** — `cfgEscuchar.aplicarEfecto` (el hook que realmente
     escribe el estado) estaba gateado a `soyGM()` sin excepción, porque hasta ahora la única función que lo
     definía era la del mapa (`dueloAplicarEfecto`, pensada para aplicar sobre un RIVAL, algo que solo el GM
     puede hacer). Un buff sobre uno mismo escribe la PROPIA ficha, que no necesita el permiso de nadie más.
     Fix: el gate pasó a `soyGM() || esMio(d.defensor)` (por duelo, no global), y `ficha-personaje/ficha.html`
     define su propio hook, `dueloAplicarEfectoPropio(d, ef)` (reusa `aplicarEstadoRecibido`, el mismo camino
     ya probado para estados que llegan de afuera; cura se aplica con `fijarHp`), enganchado en su
     `Duelo.escuchar({aplicarEfecto: dueloAplicarEfectoPropio})` de cuando corre **suelta** (`fbAlEntrar`,
     `window.parent === window`). **Corriendo dentro del mapa** (Botonera embebida, el modo normal de jugar) no
     hizo falta tocar la ficha: el propio `Duelo.escuchar` del mapa ya usa `dueloAplicarEfecto`, que sabe
     aplicar a un PJ vía `EstadosAplicar.encolarPj` — con el gate relajado, alcanza con que CUALQUIER miembro
     (no solo el GM) tenga el mapa abierto para que su propio buff se aplique solo.
  **No verificado en vivo con Firebase real** (solo por trazado de código + sintaxis: no hay forma de simular
  un duelo completo con Firestore real sin credenciales) — pedido al dueño reprobar en su partida.

- **Bug real encontrado: `#ct-fondo` (¿Es tu turno?) quedaba invisible dentro de la Botonera del mapa
  (2026-09-29, siguiendo el mismo reporte de Blindaje "no pasa nada" — el dueño confirmó que Shockwave SÍ
  funciona embebido, lo que descartó las dos causas de arriba como explicación completa)**. `ficha-personaje/ficha.html`
  tiene una regla CSS que en modo Botonera (`?modo=botonera`, la ficha corre en un iframe dentro del mapa) oculta
  TODO hijo directo de `<body>` salvo una lista puntual de excepciones (`:not(.scrim):not(.toast):not(#ep-fondo)…`)
  — pensada para que solo se vea la Botonera y sus ventanitas, con fondo transparente. Al sumar
  `comun/confirmar-turno.js` (el cartelito "¿Es tu turno?" del paso Costo, `turnoAjenoSp`) se cargó el script pero
  se olvidó agregar su `#ct-fondo` a esa lista — así que una habilidad con "el costo en SP es distinto si no es tu
  turno" tildado, ejecutada desde la Botonera del mapa, queda **esperando un clic en un cartelito invisible**: sin
  ningún error, sin ningún toast, "no pasa nada" para quien la usa (el `await ConfirmarTurno.pedir(...)` de
  `ejecutarHabilidad` nunca se resuelve). Arreglado sumando `:not(#ct-fondo)` a la regla de `ficha-personaje/ficha.html`
  (línea de `html.modo-botonera body > :not(...)`). Verificado con una prueba de CSS aislada (no con Firebase real):
  con el fix, `#ct-fondo` computa `display:block`; sin él, `display:none`. **Pedido al dueño**: confirmar si
  Blindaje tenía tildado ese checkbox (parece la explicación más probable dado que no daba ningún error) y reprobar
  ejecutándolo desde la Botonera del mapa. **Confirmado por el dueño: arregló el problema.**

- **Parry como caja individual en «¿Con qué se resiste el objetivo?» (2026-09-29, pedido del dueño)**: el paso
  Resistencia del 🎯/✨ (`comun/asistente-duelo-hab.js`, `CONTRA`) tenía Evasión y varios stats pasivos, pero no
  Parry — el dueño pidió que apareciera como una caja más (no mezclada con el texto de Evasión), "ante el posible
  caso de algún skill que no se pueda parriar" (o sea: que sea el diseño de CADA habilidad, tildando o no la
  caja, el que decida si se puede parriar — no una regla fija del sistema). Se sumó `['parry', 'Parry (bloquear
  con un arma o escudo — solo si el objetivo tiene uno equipado)']` a `CONTRA`; al marcarla aparece un aviso
  (re-renderiza sola al tocar esa caja puntual, algo que las demás cajas de esta lista no hacían — no hacía falta
  antes porque no dependían de ningún otro texto en pantalla) explicando que igual no se ofrece si el objetivo no
  tiene arma ni escudo equipado.
  - **Por qué no hacía falta más código en el motor**: para una habilidad dirigida (`d.hab`), la tirada de cada
    stat de `contra` (Evasión, Res.Esp, Parry, lo que sea) ya se resuelve genéricamente por `DUELO_HOOKS.habTirar`
    (busca el stat en `d.hab.contra` por `modo` y tira `compute().final[stat]`/`creepStatValor(sc, stat)`, ver
    `comun/duelo.js` línea ~1671) — el hook `defender` (con su lógica hardcodeada de Evasión/Parry de un ataque
    normal) **nunca se llama** para un duelo de habilidad, solo para uno de arma. Así que Parry como stat de
    `contra` ya "andaba" en el sentido de tirar el número correcto; lo único que faltaba era la opción en la
    lista y la regla de "sin arma no hay Parry".
  - **La regla "sin arma ni escudo no se puede parriar" (P121) se respeta con un hook nuevo, opcional**:
    `comun/duelo.js`'s `opcionesHab(d, h)` (arma una caja por cada stat de `contra` para que el objetivo elija
    a ciegas) ahora filtra la caja de Parry si `h.puedeParry` existe y devuelve `false` — sin el hook (compatibilidad
    hacia atrás), se sigue ofreciendo igual. `ficha-personaje/ficha.html` y `gm-toolset/gm-tools.html` suman
    `puedeParry: d => …` a `DUELO_HOOKS`, reusando `armasYEscudosParaParry()`/`sc.armaNombre`/`inv.armaNombre` —
    los mismos criterios que ya usa `opcionesDefensa` para un ataque normal.
  - **No verificado en vivo con Firebase real** (el checkbox y el aviso sí, con una prueba aislada del asistente
    en el navegador — ver el bug de arriba para la técnica) — el flujo completo (crear una habilidad con Parry
    marcado, ejecutarla contra alguien con y sin arma) queda para probar en mesa.

- **`estados-presets.js`** (`ESTADOS_PRESET`, 2026-09-29, paso 0d de `../docs/plan-subida-unificada.md`) — **la lista única de
  estados alterados estándar** (Veneno, Sangrado, Stun, Escudo especial, Barrera, Sigilo…, 31). Antes había tres copias que se
  habían ido separando: `EFECTOS_PRESET` (ficha), `ESTADOS_PRESET_GM` (gm-tools) y `DEBUFFS`/`BUFFS` (`estados-aplicar.js`).
  Ahora las tres salen de acá: `estadosPresetFicha()` (nombres de campo de la ficha, `hpturno`/`stacksturno`, y Armadura rota
  con su −1 Defensa como mod) y `estadosPresetCreep()` (forma de creep, con `stacks: 1, hpTurno: 0` por defecto; Armadura rota
  sin mod porque el creep la resta aparte, por acumulación — si se le pusiera el mod, se descontaría dos veces).
  `EstadosAplicar.DEBUFFS`/`BUFFS` son esa misma lista partida por polaridad (BUFFS pasó de 2 a 15: ahora una Ejecución que
  da, por ejemplo, Invulnerable a un aliado le llega con su marca real). Se carga **antes** de `estados-aplicar.js` (ficha,
  gm-tools, mapa y `datos/auditoria-skills.html`). Al juntarlas se reconciliaron: **Sangrado** en todos lados como
  `stacks: 2, hpTurno: −1` (la regla del 2026-09-22; la ficha seguía con la forma vieja y sumaba de a 2 al reaplicarse) —
  y `estado-preguntas.js` ya no le pregunta "¿Cuántos stacks?" aparte (salen del daño); **Afortunado** 3 turnos (gm-tools
  tenía 2; igual se pregunta al activarlo); los textos viejos de Inmovilizado y Rengo en gm-tools (hablaban de Movimiento);
  **Barrera**, que faltaba en gm-tools; y los textos, en tercera persona para que sirvan a personajes y creeps.

- **`plantillas.js`** (`Plantillas`, 2026-09-29, paso 1 de `../docs/plan-subida-unificada.md`) — qué datos viajan al
  subir cada tipo de elemento: `Plantillas.limpiar(tipo, datos)` para `skills`, `habs_creep`, `creeps`, `pasivas`,
  `trampas`, `estados`, `items` (copia limpia, no toca el original; saca también `bibOrigen`). Se carga antes que
  `biblioteca.js` (ficha, gm-tools, mapa) y en `datos/auditoria-skills.html`, que usa `Plantillas.habilidad` para
  escribir `skills-clase.js`.
- **`biblioteca.js`, subida unificada** (2026-09-29): lo que sube cualquiera queda al instante en la biblioteca, con
  🔶 sin auditar hasta que el dueño lo marca ✅; "¿corrección de X o algo nuevo?" con `opts.basadoEn`; `alElegir(datos,
  meta)` con `{tipo, id, version}`; `Biblioteca.entrada(tipo, id)` para el aviso de versión nueva. Detalle en el
  comentario de cabecera y en `../docs/plan-subida-unificada.md` ("Paso 1: cómo quedó"). Reglas nuevas: hay que pegarlas.
- **`biblioteca.js`, para herramientas con pantalla propia** (2026-09-29, paso 2): `Biblioteca.lista(tipo)` devuelve lo
  subido (sin lo de fábrica) sin abrir la ventana; `guardar` acepta `datosPara(modo)` (datos distintos si es corrección
  o algo nuevo) y `alSubir({id, version, modo})` (la entrada que quedó). La ficha los usa para las habilidades.
- **`biblioteca.js`, colección vieja a la vista** (2026-09-29, paso 3): `opts.legado = {tipo, convertir(datos)}` en
  `abrir`/`guardar` lee además `biblioteca_<legado>` (y sus propuestas) convertidas a la forma nueva, con su colección
  en `ent.col` para auditar/borrar; corregir una entrada vieja crea una nueva con `reemplaza`. Lo usa gm-tools para las
  habilidades de creep (`biblioteca_habs_creep` → `biblioteca_skills`). `Plantillas.limpiar('skills', {para:'creep'})`
  limpia como habilidad de creep.
- **`biblioteca.js`, cartel único de versión nueva** (2026-09-29, paso 4): `Biblioteca.versionNueva(subidas, origen,
  ignorada)` (¿hay una versión más nueva que la de la copia?) y `Biblioteca.avisoVersion(opts)` (el cartel "🔔 hay una
  versión nueva" con Actualizar / Dejar la mía / Ahora no). Todas las herramientas lo usan en vez de un cartel propio.
- **Una sola forma de trampa (P123, 2026-09-29, decidido por el dueño)**: la trampa que coloca una habilidad
  (`trampaColocar`, ficha y gm-tools) pasó a tener la misma forma que las del mapa y el catálogo — `tipo`/`tamano` (flor:
  su radio, 0 = una casilla, como en el mapa y en las trampas consumibles; línea: largo), color, alfa, daño, `estado` (nombre) + `estadoTurnos` (+ `estadoMods` si es un estado
  propio), zona que deja al dispararse, `turnos` (cuánto dura puesta) y `cant` (cuántas deja por ejecución).
  `Plantillas.trampaDesde(t)` traduce cualquier trampa (también las viejas `{radio, cant, estado: {nombre, turnos}}` de
  `creeps-base.js` y de las habilidades ya guardadas, que no se tocaron) y `Plantillas.radioDeTrampa(t)` da el radio de la
  flor. `TokensAuto.colocarTrampas({fichaId, tipoToken, trampa})` coloca esa forma (color, alfa, estado, zona que deja
  —mismos campos `trampaDejaZona`/`zona*` que pone el mapa— y vencimiento con `turnos`/`venceMant`); sigue aceptando los
  parámetros sueltos de antes. `AsistenteTrampa` en contexto `'habilidad'` suma forma (flor/línea), color, "deja zona" y
  duración (9 pasos; el teleport y la forma libre siguen siendo solo del mapa) y exporta `aTrampa(res)`, `inicialDe(t)` y
  `resumenTexto(t)`, que usan la ficha y gm-tools (gm-tools guarda la trampa en edición en `hcTrampa`; los campos
  `#hc-trampa-*` quedaron sin uso). (Una primera versión de este cambio tomó `tamano` como "radio + 1" y achicaba las
  trampas consumibles —"flor de radio 2 (19 casillas)" salía de 7—; se corrigió el mismo día: `tamano` ES el radio.)
- **`catalogo.js`** (`CATALOGO_BASE`, 2026-09-29, paso 5 de `../docs/plan-subida-unificada.md`) — **el catálogo de ítems
  de fábrica**, la única copia: la cargan la ficha (`DEFAULT.catalogo`), GM Tools (`CATALOGO_EQUIPO` vía `itemParaCreep`),
  el generador de tiendas (`CATALOGO`) y `datos/catalogo-editor.html`, que lo escribe directo en `nueva-version` (un ítem
  por renglón, JSON compacto, conserva la cabecera). Reemplaza a las tres copias que había adentro de esos HTML, a
  `datos/catalogo.json` y al Excel + scripts de Python (retirados). Formato: `../datos/esquema.md`.
- **`items-subidos.js`** (`ItemsSubidos`, 2026-09-29, P124) — suma al catálogo de fábrica lo que subió el grupo
  (`biblioteca_items`): `mezclar(lista, subidas, base)` (una corrección reemplaza al de fábrica con el mismo id; lo nuevo
  entra como `usr-<id>`; cada uno lleva `_bib` con de dónde salió), `cargar()`, `basadoEn(item, catalogo)` (para
  "¿corrección o algo nuevo?" al subir) y `etiqueta(item)` ("🔶 sin auditar · subido por X"). Lo usan ficha, gm-tools y el
  generador de tiendas; el botón de todos es **⬆ Subir al catálogo** (`Biblioteca.guardar({tipo: 'items'})`).
  **Solicitar eliminar un ítem** (2026-09-30, pedido del dueño): `solicitarBaja(item)` — pide confirmación y una
  justificación escrita obligatoria, y sube una entrada más a `biblioteca_items` marcada `datos.baja = true` (mismo
  esquema de siempre, sin reglas de Firestore nuevas); si la pide el dueño entra auditada (se saca al instante), si no
  queda 🔶 sin auditar hasta que el dueño la revise en `datos/auditoria.html` (✅ Auditado confirma la baja, 🗑 Descartar
  la rechaza y el ítem vuelve). `mezclar` la lee aparte de los ítems de verdad y filtra del catálogo a cualquier ítem (de
  fábrica o subido) que tenga una baja auditada apuntándole — no borra nada, así que revertir es gratis. Botón
  **🗑 Solicitar eliminar** en el "Ver" de un ítem del catálogo (ficha, gm-tools, generador de tiendas); no aparece para
  ítems que no son del catálogo (mochila propia, arma/pieza de un creep, plantilla de botín).
- **`biblioteca.js`, operaciones para la auditoría** (2026-09-29, paso 6): `auditar(tipo, id, col?)`,
  `descartar(tipo, id, col?)`, `corregirComoDueno(tipo, id, datos, col?)` (versión + 1, queda auditada),
  `propuestasViejas(tipo)`, `aprobarPropuesta(tipo, ent)`, `rechazarPropuesta(tipo, id)`, y `fecha` en cada entrada. Las usa
  `datos/auditoria.html`. El menú ☰ (`menu-sitio.js`) suma el link "🔍 Auditoría de lo subido".
- **`editar-item.js`** (`EditarItem`, 2026-09-30, pedido del dueño): desde **cualquier "Ver" de un ítem** —tienda, catálogo,
  mochila de otro jugador, botín, arma o pieza de un creep— el botón **✎ Editar y subir** arma una COPIA, la edita con el
  asistente de siempre (consumibles: formulario corto propio) y la sube con `Biblioteca.guardar({tipo:'items'})`
  (corrección del ítem del catálogo o algo nuevo). No toca lo que se estaba mirando. Si la copia tiene otros bonos que el
  ítem del catálogo actual (una copia vieja, como el Martillo de sargento con Crítico +10), pregunta cuál editar. Lo que la
  copia no trae (rareza, precio, narrativa) se completa del ítem del catálogo. `EditarItem.subir(item, {catalogo})` sube
  directo (lo usa el ⬆ del editor del arma de un creep). En la ficha, los ítems propios editables siguen con su "Editar"
  de siempre; el de "Editar y subir" aparece para el catálogo/tienda/botín y en fichas de solo lectura.
- **Supercrítico** (2026-09-30, regla del dueño): `Critico.resultadoD20(rolls, potente)` → `{mejor, mult, veintes,
  supercritico}`: con dos o más 20 NATURALES en los d20 del crítico, cada 20 vale ×4 y se suman (dos = ×8, tres = ×12),
  sin importar umbrales ni Crítico potente; si no, el mejor d20 como siempre. `Critico.nombreMult(mult)`. Lo usan la
  calculadora de crítico y el duelo (`tirarCritico` guarda `crit.supercritico` = cuántos 20; el cuadro muestra
  «¡SUPERCRÍTICO!», resalta todos los 20 y explica la suma). No hace falta regla nueva de Firestore (va dentro de `crit`).
- **`pruebas.html`** (2026-09-30, paso 0 de `../docs/plan-consolidacion.md`) — **pruebas automáticas del motor**: carga los scripts
  de `comun/` (sin sesión ni Firebase) y verifica resultados conocidos (dados, crítico y supercrítico, estados y su
  acumulación, inmunidades, plantillas, catálogo, ítems subidos). Todo en verde = se puede seguir. **Cada función que se mueva
  al motor común suma acá sus pruebas.** `window.PRUEBAS = {total, fallas}` para leerlo desde el navegador. La lista manual
  complementaria es `../docs/pruebas-de-humo.md`.
- **`combatiente.js`** (`Combatiente`, 2026-09-30, paso 1 de `../docs/plan-consolidacion.md`) — **el motor de reglas común**
  de personajes, invocaciones y creeps. Funciones puras (reciben la lista de estados o el valor y devuelven el resultado, sin
  tocar pantalla ni Firebase): `mitadesDeTirada`/`aplicarMitades`/`estadosQueParten` (Pajaritos, Lisiado, Parálisis,
  Sentado), `escudoParsear`, `acumularVeneno`/`acumularSangrado` (+ Escarcha), `inmunidad(estados, est, {jefe})`
  (devuelve el motivo o false), `ajustarPreset(base, spec, campoHp)` (los números que manda una habilidad pisan los del
  preset), `tirarStat(valor, estados, statId, {extra, azar})` (LA tirada de un stat: Afortunado, mitades, Evasión mínimo 1;
  devuelve lo que se publica en la Mesa, no publica), `estadosQueAfectan` (los estados que se pintan en la Mesa),
  `nitrosMax(natural, estados)` (Cansado, Hypeado, Exhausto y Stun/"forzar" como topes, P130),
  `agregarEstado(estados, nuevo, {jefe})` (ponerle un estado a alguien: inmunidades, acumular o renovar uno igual, P132 —
  lo usan todos los "+ Estado", los formularios completos, lo recibido y `EstadosAplicar.aplicarACreep`),
  `pasarTurnoEstados(estados, {hp, stacks})` + `reporteTurno(eventos)` (lo que hacen los estados en el Mantenimiento, paso 2 —
  lo usan `mantenimiento()` de la ficha, el de sus invocaciones y el de gm-tools; P131: sin turnos ni permanente = 1 turno), `costoAtaque(tipo,
  ataquesPrevios)` / `costoPrimerAtaque` / `ataquesPosibles` (Tipo ÷ 2 el primero, completo después),
  `costoParry()` y `armaParaDefensa({arma, natural, escudos})` (**Parry y Bloqueo solo con un arma o un escudo; un arma
  natural no alcanza, por ahora** — regla del dueño 2026-09-30; lo usan `armasYEscudosParaParry` de la ficha,
  `defensaInv`, `defensaCreep` de GM Tools y `defensaCreepMapa` del mapa). **No hay Bloqueo sin Parry**
  (`BLOQUEO_SOLO_TRAS_PARRY`, concepto del dueño 2026-09-30: el Parry intercepta el arma, el Bloqueo aguanta el golpe): cada
  herramienta recuerda el Parry que espera su Bloqueo (`parryArmaPendiente` en la ficha, `parryPendienteInv`,
  `parryPendienteCreep`); el botón de Bloqueo se ve siempre, apagado, mostrando lo que tiraría, para decidir entre Parry y
  Evasión.
  **Usar una habilidad** (paso 3, 2026-09-30): `modoHab(h, duelo)` (📣/💰/✨; `duelo` = la Ejecución que tenga armada),
  `costoNitrosHab(h, costoAtaque, porDefecto)`, `bloqueoHab(h, {modo, nitros, costo, hp})` (cooldown, No2 y vida — P133: se
  cobra lo que la habilidad tenga, sea de quien sea), `alcanceHab(c, statTira, stat)`, `habEjecucion(h, c, {stat, etq, X})`
  (lo que el cuadro del duelo necesita: tirada o fórmula propia, resistencias, daño, efectos, radio, textos a mano; sin `X`
  no se toca ninguna «X»), `efectoDeEjecucion(e)`, `sustituirX`, `sobreSiSinTiradas(hab)` (el atajo de Blindaje) y
  `ejecucionNoDisponible(c, 'pj'|'inv'|'creep')` (P134: ataque con arma y Flash todavía solo en personajes, zona no en
  invocaciones → aviso y 💰), `zonaDeHab(h, c, {fichaId, tipo, X, resistValor})` (el mensaje 'zona-persistente-habilidad'
  al mapa), `formulaDanoHab(h, c, X)` y `trampaDeHab(h)` (la trampa lista para el mapa), `ataqueConArreglos(h, c, {arma,
  alcance, X})` (el ataque 'habilidad-arma' que va al duelo: lo usan `ataqueDeHabArma` de la ficha y `ataqueDeHabCreep` de GM
  Tools) y `flashPara(c, campo, modo)` (¿este ⚡ Flash vale para esa tirada?). **Flash de creeps** (P135, solo cooldown):
  `comun/duelo.js` ya les pregunta (antes los salteaba); el mapa contesta solo si el creep no tiene ninguno
  (`cfgEscuchar.flashLocal` = `dueloFlashLocal`) y si tiene, contesta GM Tools; una opción puede traer `costoTxt` en vez de
  `costoSp`. **Todo Flash cuesta el doble en turno ajeno** (P136, regla del juego: `costoFlash({sp, cd, hp}, turnoPropio,
  {spAjeno})`), en el duelo o con el botón: `ConfirmarTurno.flash(nombre, costo, {quien, spAjeno})` pregunta y devuelve lo
  que se cobra (`textoFlash`/`textoCosto` para mostrarlo). `flashUsar` puede devolver una Promise; el duelo la espera, y
  dentro del mapa el cartel (`#ct-fondo`) cuenta como ventana abierta para que se muestre la página que lo abrió. En la ficha,
  `pagarFlash`/`usarFlashFueraDelDuelo`; en GM Tools, `pagarFlashCreep`/`usarFlashFueraDelDueloCreep`. Lo usan `habDueloDatos`/`modoHab`/`costoNitrosHab` de la ficha, `habDueloInv`/`invEjecutarHab`
  de las invocaciones y `habEjecucionCreep`/`aplicarHabCreepSobreSi`/`modoHabCreep` de GM Tools.
- **`ficha-calculo.js`** (`FichaCalculo`, 2026-09-30, paso 5 nivel B área 1, `../docs/plan-paso5.md`) — **el cálculo de un
  personaje, fuera de la ficha**: la lista de atributos y stats (`GRUPOS`, `EXTRA`, `STAT_LIST`, `ATTR_LIST`, `MOD_TARGETS`,
  `STAT_LABEL`, `STAT_FULL`), las ranuras (`slotDe`), la durabilidad de los ítems (`durableItem`, `itemRoto`, `armRotaDe`…),
  `pasivaCompras`, `jobTotal(nivel)`, los bonos con su origen (`modsDe(S)`) y los stats finales (`calcular(S)`, el viejo
  `compute()`: base + equipo + pasivas + estados, fórmulas de la ficha, No2 máximo). Recibe la ficha (`S`) en vez de leerla
  de una variable global, así que lo puede usar cualquier pantalla que tenga los datos de un personaje. La ficha usa los mismos
  nombres de siempre como alias (`compute()` = `FichaCalculo.calcular(S)`). Comparado contra el cálculo viejo en 1 500 fichas
  al azar: igual. Ojo: las fórmulas de stats de cada ficha se evalúan como código (`evalFormula`), igual que siempre.
- **`ficha-combate.js`** (`FichaCombate`, 2026-10-01, paso 5 nivel B área 2) — **el combate de un personaje, fuera de la
  ficha**: qué tiene en cada mano (`asignarManos`), con qué ataca (`armasEquipadasConDano`) y con qué parría
  (`armasYEscudosParaParry`), el PdG y los stats de cada arma sin los bonos de la otra (`pdgParaArma`, `statParaArma`, P129),
  el Bloqueo (`bloqueoValor`: Bloqueo + peso), el alcance, el daño (`armaDanoTxt`), las fórmulas de los botones
  (`formulasCombate`), el costo de atacar (`costoAtaque`, `costoAtaqueEspecial`) y el conteo de ataques del turno
  (`registrarAtaque`). Reciben la ficha (`S`); la ficha conserva sus nombres de siempre como alias y sigue haciendo lo que se
  ve (carteles, Mesa, Botonera). Comparado contra lo viejo en 1 200 fichas al azar: igual.
- **`embebido.js`** (`Embebido`, 2026-09-30, paso 4 etapa 1, `../docs/plan-paso4.md`) — **una herramienta dentro del mapa**
  (la ficha con `?modo=botonera`, GM Tools con `?modo=acciones|finalizar|botin`). `Embebido.iniciar({clase, pagina,
  noCuenta})`: esconde SOLO la página de la herramienta (`pagina`) y las piezas comunes que el mapa ya muestra (`COMUNES`:
  Mesa flotante, menú ☰, historial, cuadro del duelo, dados 3D); **cualquier otra ventana o cartel se ve** (antes era al revés:
  una lista fija de ventanas permitidas, y cada cartel nuevo desaparecía). Mira la página y le avisa al mapa solo en los
  cambios: `embebido-abierto` (el mapa muestra la capa del marco, encima del duelo si hay uno a la vista) y `embebido-cerrado`
  (la saca, para que el marco transparente no tape el mapa). `noCuenta`: lo que se ve pero no es una ventana (la Polilla
  mística). **Un cartel nuevo no necesita registrarse en ningún lado**; una parte nueva de la PÁGINA que se agregue al
  `<body>` sí va en `pagina` (si no, se vería dentro del mapa y dejaría la capa abierta).
- **`mensajes-mapa.js`** (`MensajesMapa`, 2026-09-30, paso 4 etapa 1) — **la lista de TODOS los mensajes** entre el mapa y la
  ficha / GM Tools de su marco (`TIPOS`: quién lo manda, quién lo recibe y para qué), con `alMapa(tipo, datos)` (desde el
  marco) y `alMarco(marco, tipo|mensaje, datos)` (desde el mapa). Un mensaje sin registrar se manda igual pero avisa en la
  consola, y el mapa avisa si le llega uno que no conoce. **Un mensaje nuevo se agrega acá.** `duelo.js` y `embebido.js`
  siguen con su `postMessage` propio (sus tipos están en la lista).
  **`?precarga=1`** (ficha `modo=botonera`, GM Tools `modo=acciones`): la herramienta carga **sin abrir nada** y avisa que
  está lista; la usan el reenvío del duelo (si no, la Botonera o las Acciones aparecían encima del duelo) y
  `precargarMarco()` del mapa (6 s después de entrar carga la ficha propia o GM Tools para que la primera apertura no espere).
- **Durabilidad, variable de diseño** (2026-09-30, dueño): `Combatiente.durMax(item)` / `durPorPeso` / `durTexto` /
  `esDurable` — 3 puntos por punto de Peso salvo que el ítem traiga `durPorPeso` (4–5 = más resistente, 2 = frágil), mínimo
  3. `asistente-item.js` lo pregunta (paso Peso y daño / Peso-Precio) y lo muestra en el resumen; los "Ver" de ficha, GM Tools,
  tienda y editor del catálogo muestran «Durabilidad N (X por punto de Peso)». `Plantillas.limpiar('items')` ya no sube `dur`
  ni `armRota` (desgaste de la copia). El motor ahora también se carga en `vendor-generator.html` y `catalogo-editor.html`.
- **`modificadores-tirada.js`, el «?» de las defensas** (2026-09-30, pedido del dueño — "que el sistema sea un poco
  autoexplicativo"): `ModTirada.ayuda('eva'|'parry'|'bloqueo')` pone un circulito «?» en el botón; al pasar el mouse explica
  el concepto (textos en `AYUDA`, siguen las notas Parry/Bloqueo/Evasión del manual: si cambia una regla, cambiar los dos).
  Tocarlo no dispara el botón. Está en la Botonera del personaje, la de las invocaciones, las Acciones de los creeps y en
  "Elegí cómo te defendés" / "Tirar Bloqueo" del duelo (el mapa ahora también carga este archivo). **Una regla de combate nueva o corregida va acá, no en una herramienta.** La ficha, GM Tools
  y el mapa conservan los nombres de siempre como atajos de una línea (`escudoParsear`, `mitadesDeTirada`, etc.);
  `estados-aplicar.js` y `modificadores-tirada.js` también lo usan. Se carga **antes** de `estados-presets.js` en ficha,
  gm-tools, mapa y `datos/auditoria-skills.html`.

- **`ficha-habilidades.js`** (`FichaHabilidades`, 2026-10-01, paso 5 nivel B área 3) — el costo en SP/No2 de una habilidad de personaje (fijo, "X", "como un ataque") y el estado "del sistema anterior" que una habilidad o un ítem pone al ejecutarse/consumirse (`aplicarEfectoDeConsumo(S, it, presets)`, con `configEfectoDe` y `flagsDePreset`). gm-tools e invocaciones tienen su propia versión, con diferencias de verdad (P137).
- **`ficha-guardado.js`** (`FichaGuardado`, 2026-10-01, paso 5 nivel B área 4) — **la forma de un personaje y cómo se guarda y se lee de Firebase**, sin la ficha: `DEFAULT` (el personaje en blanco), las migraciones de fichas viejas, `normalizar(datos, {mezclarCatalogo})` (mezcla con el personaje en blanco; devuelve `{S, tiposMigrados}`), `completar(S)` (migraciones repetibles y No2 llenos; usa `FichaCalculo`), las partes (`PARTES`, `partes(S)`, `leerParte`, `armarDatos(docs)`, `aplicarParte(S, parte, datos, o)`) y **`leer(db, ruta)` / `cargar(db, ruta)`**: traen un personaje UNA vez (`ruta` = `fbRutaCampana('fichas/<id>')`), con `cargar` devolviendo además `S` listo para `FichaCalculo`/`FichaCombate`/`FichaHabilidades` — así el mapa puede leer un personaje sin cargar la ficha. Necesita `catalogo.js` antes; `completar`/`cargar`, `ficha-calculo.js`.
- **`ficha-sesion.js`** (`FichaSesion`, 2026-10-01, paso 4 etapa 3a, `../docs/plan-paso4-etapa3.md`) — **tener abierto un personaje en vivo**, para cualquier pantalla: `nueva(id, duenoUid, cargada, soloLectura)` (el objeto de la sesión: `fichaVivo` en la ficha), `escuchar(f, o)` (lo arma la primera vez y aplica lo que cambia desde otra ventana; `o` trae qué hacer en cada momento: `alDoc`, `alCargar` —que tiene que poner `f.cargada = true`—, `alControl`, `aplicarParte`, `alCambiar`, `alErrorPartes`, y `vigente()`), `guardar(f, forzar, o)` (solo las partes que cambiaron, cuando quedan quietas 1,2 s o cada 5 s; reintenta a los 8 s y avisa solo la primera vez: `o.alError(err, primeraVez)`), `pendiente(f, partes)` y `cortar(f)`. Dos pantallas con el mismo personaje se comportan como dos ventanas de la ficha (en cada parte gana la última que guarda). La ficha (`js/12`) lo usa con sus carteles; el mapa lo va a usar para la Botonera nueva. Necesita `ficha-guardado.js`.
- **`ficha-botonera.js`** (`FichaBotonera`, 2026-10-01, paso 4 etapa 3b) — **el dibujo de la Botonera de un personaje**: `html(S, {modoMapa, parryArmaPendiente, lupa})` → `{html, nitros, sp, def}` y sus ayudantes (`costoHabilidadTxt`, `sinNitrosPara`, `costoNitrosHab`, `consumeButton`, `habAutomatizada`/`modoHab`/`dueloDe`, Inteligencia y Talentos, sigilo/sentado, Percepción aumentada…), todos con `S` como parámetro. Lo usan la ficha (`renderBotonera` y los mismos nombres como atajos) y el mapa (⚗ Botonera nueva). Desde la 3c también arma tiradas sin publicarlas: `tiradaStat(S, statId)` y `tiradaPercepcion(S, azar)` → `{origen, r}` o `{error}` (la ficha usa la de Percepción; el mapa, las dos). `IT2` (los costos en No2/SP) vive ahora en `ficha-calculo.js` (`FichaCalculo.IT2`). **Al cambiar un archivo de `comun/` que la ficha carga con `?v=`, subir su versión** (si no, el navegador usa la copia vieja: pasó con `ficha-calculo.js`).
