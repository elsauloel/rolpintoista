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
