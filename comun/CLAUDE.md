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

- **`sesion.js`** — configuración de Firebase, la cuenta (`fbUsuario`), la
  partida elegida (`FB_CAMPANA`, `localStorage`) y el miembro/partida
  actuales (`fbMiembro`, `fbPartida`). `fbEntrarAPartida()` es lo que cada
  herramienta llama al arrancar: si falta sesión, partida o ser miembro,
  manda sola al inicio (`fbUrlInicio`). Lo carga primero cualquier página
  que use Firebase. Ver [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md).
- **`menu-sitio.js`** — el botón ☰ fijo arriba a la izquierda, igual en
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
  el mapa además define `MESA_AVISAR_SIN_SESION`. Depende de
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
- **`dados3d.js`** — animación 3D (dice-box-threejs, cargada recién con la
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

## Dependencias con otras carpetas

- Todas las herramientas de juego (`ficha-personaje/`, `gm-toolset/`,
  `vtt-hexgrid/`, `index.html`) cargan de acá lo que necesitan; ver el
  `CLAUDE.md` de cada una para qué usa de qué archivo.
- `firebase/firestore.rules` — los permisos que `sesion.js`, `mesa.js` y
  `respaldo.js` dan por sentado (leer/escribir `tiradas`, `miembros`, etc.).
