# Workflow de Firebase

Base del sistema nuevo de Rol Pintoísta (mapa, tokens, tiradas en vivo).
Convive con [`workflow-github.md`](workflow-github.md): GitHub sigue
distribuyendo el código de las herramientas; Firebase guarda lo que tiene
que verse en vivo entre jugadores.

## Proyecto

- Proyecto Firebase: `rol-pintoista`, plan Spark (gratis, sin tarjeta).
- Authentication: proveedores **Google** y **Correo electrónico/contraseña**
  (con confirmación del email por link). Solo se usan desde el sitio web
  (GitHub Pages): no funcionan abriendo los HTML con doble clic. El
  proveedor Anónimo ya no se usa (se puede desactivar).
- **Dominios autorizados** (Authentication → Configuración → Dominios
  autorizados): además de los que vienen (`localhost`, los de Firebase),
  `elsauloel.github.io` para el sitio de GitHub Pages.
- Firestore: reglas versionadas en [`../firebase/firestore.rules`](../firebase/firestore.rules).
  Para aplicarlas: consola → Firestore Database → Reglas → pegar todo →
  Publicar. El archivo del repo y la consola tienen que quedar iguales.
- SDK: versión *compat* cargada por `<script>` desde
  `https://www.gstatic.com/firebasejs/12.3.0/…`, sin build step.
- **Sesión compartida**: [`../comun/sesion.js`](../comun/sesion.js) tiene la
  configuración, la cuenta y la partida actual (`FB_CAMPANA`, `fbUsuario`,
  `fbMiembro`, `fbPartida`, `fbEntrarAPartida()`). Lo cargan `index.html` y
  las herramientas; ya no hay un bloque copiado en cada una.

## Cómo se entra

1. `index.html`: iniciar sesión con Google, o con email y contraseña (al
   crear la cuenta llega un mail con el link de confirmación; sin
   confirmar no se ve nada).
2. Lista de partidas: todas las del sitio (grupo cerrado de amigos). Se
   entra a una donde ya estás, te unís a otra eligiendo tu nombre en esa
   partida, o creás una nueva (quedás como su GM).
   **Menú del sitio** ([`../comun/menu-sitio.js`](../comun/menu-sitio.js)): botón ☰ fijo arriba a
   la izquierda en el inicio y en todas las herramientas. Abre las ramas del
   sitio: Partidas (y las tuyas), la partida abierta con Mapa, personajes
   (propios y de los demás; el GM, GM Tools y Generador de tiendas),
   Manual y Cerrar sesión. Lee partidas y fichas al abrirse (caché 1 min);
   no aparece en los iframes del mapa.
   Arriba, "✎ Mi nombre" permite cambiar el nombre en cada partida donde
   estás (y, si sos el GM, también el `gmNombre` de la partida).
   Al pie de la página de la partida:
   - **GM, "⚙ Partida"**: jugadores con sus personajes y botón Sacar
     (borra su `miembros/{uid}`; puede volver a unirse); "Pasar un
     personaje a otro jugador" (cambia `duenoUid` de la ficha y de sus
     tokens de PJ, incluidas las invocaciones `<fichaId>~…`; los personajes
     de quien se fue aparecen "sin jugador") con un botón **Borrar** al
     lado de cada uno; renombrar; y borrar la partida (ofrece bajar el
     respaldo y pide escribir el nombre). Borrar recorre cada colección
     (fichas/partes, creeps/privado, tokens, tiradas, mapa, gm, tienda,
     tiendas, miembros) y al final borra la partida y el miembro del GM.
     Si se corta, se vuelve a tocar.
   - **Jugador, "Irme de esta partida"**: borra su miembro; sus personajes
     quedan a nombre de su cuenta.
   - **Borrar un personaje puntual** (`borrarPersonajeGM`, misma lógica
     duplicada en `index.html`, `gm-toolset/gm-tools.html` y
     `vtt-hexgrid/mapa.html`): confirmar + escribir el nombre exacto, borra
     `fichas/{id}` con sus `partes` y los tokens que la usan (el propio y
     los de sus invocaciones `<fichaId>~…`). El GM lo tiene en "⚙ Partida"
     (junto al selector de "Pasar un personaje") y en el desplegable
     "👥 Personajes" del mapa y de gm-tools (botón ✕ junto a cada uno, solo
     visible para el GM). El jugador sigue teniendo su propio "Borrar
     personaje" (✕ en "👥 Personajes" de la ficha), pero solo sobre los
     suyos — ver [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md).
3. Página de la partida: links a las herramientas con `?partida=<id>`
   (GM Tools y el generador de tiendas solo para el GM; la ficha para
   jugadores, y para el GM en solo lectura).
4. Cada herramienta, sin sesión confirmada, sin partida o sin ser miembro,
   vuelve sola al inicio. El botón ⌂ vuelve a la partida.

## Estructura de datos

Todo cuelga de `campanas/{idCampana}`, para que cada campaña tenga lo suyo:

- `campanas/{id}` — `{nombre, gmUid, gmNombre, creado}`. Una partida. La ve
  cualquier cuenta confirmada; la crea cualquiera (en el mismo lote que su
  miembro con `gm: true`); solo el GM la renombra o la borra. Las que no
  tienen `gmUid` (anteriores a las cuentas) no aparecen en el inicio.
- `campanas/{id}/miembros/{uid}` — `{nombre, gm, creado}`. Uno por cuenta en
  cada partida; `nombre` es el apodo elegido al unirse. `gm: true` solo lo
  puede tener quien creó la partida; nadie cambia `gm` después. Cada uno
  cambia su nombre o se va; el GM puede sacar a alguien.
- `campanas/{id}/tiradas/{auto}` — `{uid, jugador, quien, origen, formula,
  rolls[], mod, total, desde: 'ficha'|'gm', cuando}`. Una por tirada. La
  publica `registrarTirada()` (ficha.html y gm-tools.html, vía
  `mesaPublicar()`) y la cajita "Mesa" escucha las últimas 30. Nadie las
  edita; el GM puede borrarlas. `quien` es el personaje (ficha) o el creep
  (gm-tools lo separa del origen "<creep> · <qué tiró>"); la Mesa lo muestra
  en color con `(jugador)` al lado, y la última tirada con fondo verde. La Mesa vive en
  [`../comun/mesa.js`](../comun/mesa.js) (publicar, dibujar, escuchar y la
  cajita flotante) y las fórmulas de dados en [`../comun/tiradas.js`](../comun/tiradas.js);
  cada herramienta solo define `MESA_DESDE` y `mesaQuien(origen)`.
  El mapa (`vtt-hexgrid/mapa.html`) muestra la misma Mesa y publica
  tiradas libres con `desde: 'mapa'`. Ejecutar una habilidad publica su
  descripción: si tira dados va en la misma tirada (campo `texto`), y si no
  tira va en su propia línea con `desde: 'habilidad'` (⚡, sin números).
  **Historial solo de la sesión** ([`../comun/mesa-historial.js`](../comun/mesa-historial.js),
  en las tres herramientas): el GM ve 🗑 en la cabecera de la Mesa, que
  borra todas las tiradas de la partida; y cada vez que el GM entra a
  cualquiera de las tres se borran solas las de más de 48 h (como mucho
  una vez por hora por navegador). Para guardar una sesión, bajar antes el
  respaldo 💾.
  **Grilla de dados** ([`../comun/grilla-dados.js`](../comun/grilla-dados.js)):
  botón 🎲 Dados (al pie de la Mesa flotante; en el mapa, en la barra de
  arriba) que despliega D4…D100 × 1–6; cada clic es una "Tirada libre"
  común (no escribe nada distinto).
- `campanas/{id}/fichas/{auto}` — `{duenoUid, nombre, resumen: {nivel, hp,
  hpMax, sp, spMax, nitros, nitrosMax, costoMover (0 = no puede moverse), muerto, estados[{nombre, turnos, permanente, detalle,
  polaridad}], invocaciones[{id, nombre, hp, hpMax, nitros, nitrosMax,
  activa, miniatura, estados[{nombre, turnos, permanente, detalle,
  polaridad}]}]}, miniatura, creado, actualizado}`. Una invocación tiene
  las mismas funciones que un creep de gm-tools (No2, arma, habilidades
  paso a paso, estados) pero la maneja su dueño — ver
  [`../ficha-personaje/CLAUDE.md`](../ficha-personaje/CLAUDE.md). Las fichas guardadas antes de la
  Iteración 2 publican `bonos`/`bonosMax` hasta que se vuelven a abrir (el
  mapa y gm-tools leen los dos). Una por personaje
  (`ficha-personaje/ficha.html`, bloque "FICHA EN VIVO"). El contenido va
  en `fichas/{id}/partes/{parte}` — `{json, actualizado}`, con `parte` en
  `general`, `notas`, `inventario`, `cinturon`, `habilidades`, `efectos`,
  `invocaciones`, `imgInvocaciones` (imagen de cada invocación, por id), `otros`, `catalogo` (solo ítems propios que no están en
  el catálogo compartido) y `retrato` (la imagen de la cabecera). Cada
  parte es el JSON de esas claves de `S`; las imágenes embebidas de ítems,
  habilidades, etc. se guardan vacías a propósito. `miniatura` es el
  retrato achicado a 96 px para el token del mapa. Todos los miembros leen
  todo; solo el dueño escribe. Son fichas de jugadores: el GM no crea ni edita (en la ficha las ve en solo lectura; lo suyo va en gm-tools); solo puede cambiar `duenoUid` y borrarlas con sus partes (para "Borrar la partida"). La ficha
  escribe cada parte cuando deja de cambiar ~1,2 s (o cada 5 s si no para).
- `campanas/{id}/creeps/{creepId}` — `{nombre, orden, color, resumen: {hpPct,
  muerto, estados[]}, miniatura, firma, actualizado}`. De la vida solo se
  publica el porcentaje (`hpPct`, 0–100): los jugadores ven la barra sin
  números. Lo público de
  cada creep de `gm-toolset/gm-tools.html` (bloque "CREEPS EN VIVO"); lo
  leen todos. El creep completo va en `creeps/{id}/privado/ficha` (`{json}`,
  sin imagen) y su imagen en `creeps/{id}/privado/imagen` (`{dato}`): eso
  solo lo lee el GM. `firma` es un hash del contenido para que otra pestaña
  del GM note el cambio. Solo el GM escribe. Los "personajes del GM" (PNJ
  aliados, comerciantes…) también son creeps.
- `campanas/{id}/bitacora/{página}` — `{nombre, creado, creadoUid, creadoPor}` y
  `bitacora/{página}/entradas/{auto}` — `{texto, uid, autor, creado, editado?,
  editadoUid?, editadoPor?}`. Bitácora compartida de la partida (la ficha).
  Todos leen, suman páginas y entradas, y corrigen cualquier entrada; borra
  el autor (o quien creó la página) o el GM. Va en el respaldo y se borra con
  la partida.
- `campanas/{id}/gm/estado` — `{turno, actualizado}`. Contador de turno de
  gm-tools. Solo el GM.
- `campanas/{id}/tienda/borrador` y `campanas/{id}/tienda/publicada` —
  `{json, actualizado}`. La tienda del vendedor de
  `gm-toolset/vendor-generator.html`. `json` es la tienda (`{nombre, tamano,
  tamanoLabel, categoria, categoriaLabel, generado, ajustePrecio,
  garantizados[], items[], itemsDatos[]}`); `itemsDatos` son los ítems
  completos sin imagen, para que la ficha muestre y venda también los
  creados a mano por el GM. `borrador` es la que el GM está armando: se
  guarda sola ~1,2 s después de cada cambio y solo la ve el GM.
  `publicada` cambia solo con "Publicar tienda" (o se borra con "Cerrar
  tienda"); la leen todos y la abre el botón 🏪 Vendedor de la ficha, que
  además escucha los cambios mientras el jugador está en la tienda. Solo el
  GM escribe. El json puede traer `guardadaId`: de qué tienda guardada salió.
- `campanas/{id}/tiendas/{auto}` — `{nombre, json, actualizado}`. Tiendas
  guardadas con nombre, una por lugar o vendedor al que se vuelve (ej. el
  pueblito Zapallo); `json` con la misma forma que `tienda/*`. Se guardan a
  mano ("💾 Guardar tienda" / "Guardar cambios"), se abren tal cual y se
  pueden modificar o regenerar. Solo el GM las ve y escribe.
- `campanas/{id}/mapa/fondo` — `{x, y, ancho, actualizado}`: posición y ancho
  del fondo del mapa, en unidades del mapa. `campanas/{id}/mapa/fondoImagen`
  — `{dato, actualizado}`: la imagen (data URL achicada a < 900 KB). Van
  separadas para que acomodar el fondo no haga descargar la imagen a
  todos. Los fondos cargados antes tenían `dato` dentro de `mapa/fondo`: se
  siguen leyendo y se limpian al cargar otra imagen.
- `campanas/{id}/mapa/modo` — `{modo: 'narrativo'|'combate'}`. Lo cambia el
  GM. Todos los `mapa/*` los ven todos y solo los escribe el GM.
- `campanas/{id}/tokens/{auto}` — `{nombre, color: '#rrggbb', tipo:
  'pj'|'creep', duenoUid, col, fila, creado, fichaId?, ruta?}`. `ruta` es el
  recorrido del último movimiento, `[col, fila, col, fila…]` (hasta 100
  casillas): los demás lo ven como estela unos segundos. `fichaId` vincula
  el token a una ficha (pj), a una invocación de una ficha
  (`<fichaId>~<idInvocación>`, tipo pj) o a un creep: el mapa toma de ahí nombre,
  miniatura, barras (vida roja; SP azul, solo PJ) y estados. Tokens del mapa de
  hexágonos. Un PJ lo crea, mueve, edita y saca solo su dueño; los creeps,
  solo el GM. El GM además puede cambiar el `duenoUid` de un PJ (y nada más
  de ese token) y sacar cualquier token. Mover = un `update` de `col`/`fila`
  (+ `ruta`) al soltar. Un PJ vinculado a su ficha gasta Nitros: el mapa pide
  confirmar y descuenta `nitros` en `partes/general` + `resumen.nitros` en
  una transacción.
- `campanas/{id}/mapa/activo` — `{mapaId, actualizado}`: cuál de los mapas
  guardados ven los jugadores ahora mismo. Ausente = el de siempre
  (`MAPA_PRINCIPAL`, ver abajo). Todos lo ven, solo el GM lo cambia
  ("Publicar" en el panel "🗺 Mapas").
- `campanas/{id}/mapas/{mapaId}` — `{nombre, creado}`: metadatos de cada
  mapa guardado además del de siempre. El GM los crea, renombra y borra
  desde "🗺 Mapas" en `vtt-hexgrid/mapa.html`. El mapa de siempre (el único
  que había antes de esto) sigue viviendo tal cual en `mapa/*` y
  `tokens/*` de más arriba, con el id especial `MAPA_PRINCIPAL`
  (`'_principal'`) — no se movió ni un dato para agregar esta función; su
  entrada en `mapas/{id}` es solo metadato (nombre), para poder
  renombrarlo igual que a los demás. Cada mapa nuevo tiene, un nivel
  adentro:
  - `mapas/{mapaId}/estado/{fondo|fondoImagen|modo|iniciativa}` — mismo
    esquema que `mapa/*`.
  - `mapas/{mapaId}/tokens/{auto}` — mismo esquema que `tokens/{auto}`.
  - `mapas/{mapaId}/trazos/{auto}` — mismo esquema que `trazos/{auto}`.
  - `mapas/{mapaId}/elementos/{auto}` — mismo esquema que
    `elementos/{auto}`.
  El GM puede estar mirando (y armando) un mapa distinto del que está
  publicado; los jugadores siempre ven el publicado. Borrar un mapa borra
  sus `estado/*`, `tokens/*`, `trazos/*` y `elementos/*` primero
  (Firestore no lo hace solo) y, si era el publicado o el que el GM
  estaba mirando, vuelve al principal.
- `campanas/{id}/trazos/{auto}` — `{puntos: [x1,y1,x2,y2,…] (ya suavizado
  y simplificado, relativos a origen), origen: {x,y}, rotacion, color,
  grosor, permanente, duenoUid, creado}`. El lápiz del mapa
  (`vtt-hexgrid/mapa.html`, caja de herramientas ✏️). Cualquiera dibuja el
  suyo. `permanente: false` (default): se ve `ESTELA_MS` (4 s) y se borra
  sola — cualquiera puede borrar uno así, no solo su dueño, para que no
  quede huérfano si el que lo dibujó se desconectó. `permanente: true`:
  queda como un objeto que se mueve (`origen`) y se rota (`rotacion`,
  libre, no a los 60°) — eso, y borrarlo del todo, solo su dueño o el GM.
- `campanas/{id}/elementos/{auto}` — `{tipo:'flor'|'linea'|'libre',
  origen:{col,fila}, celdas:[dq1,dr1,…] (offsets en cubo desde origen,
  sin rotar), rotacion (0/60/…/300), color, alfa (10-100), solido
  (false por ahora — lo usa Formas, todavía sin construir), duenoUid,
  creado}`. Terreno y Formas del mapa (caja de herramientas ☣️/⬡),
  atados a la grilla hexagonal a diferencia del lápiz. Cualquiera crea el
  suyo; moverlo (`origen`), rotarlo (`rotacion`, a los 60°, como un
  token) o borrarlo del todo: su dueño o el GM. Terreno son marcas
  transitables (color + transparencia, sin efecto mecánico todavía);
  Formas (sin construir) va a usar `solido: true` para bloquear casillero
  y trayectoria.

`campanas/piratas-en-el-espacio` es el espacio de pruebas de antes de las
cuentas (identidades anónimas, sin `gmUid`): no aparece en el inicio y se
puede borrar desde la consola.

## Mantenimiento del GM

El GM pasa el turno para toda la mesa con "⟳ Mantenimiento" en el mapa (o
"Mantenimiento · toda la mesa" en gm-tools). Eso sube
`campanas/{id}/mapa/mantenimiento` = `{numero, cuando}`. El GM no puede
escribir las fichas, así que cada una aplica su propio `mantenimiento()`
(la lógica de siempre) una vez por número que le falte, hasta 10 seguidos:
- **Ficha**: `fichas/{id}/partes/mantenimiento` = `{json: número aplicado}`,
  tomado en una transacción (si hay varias pestañas, aplica una sola).
  Una ficha sin ese documento arranca desde el número actual.
- **Creeps**: `gm/mantenimiento` = `{aplicado}`, igual, desde gm-tools.
- Para que se note enseguida aunque la ficha o gm-tools estén cerradas,
  el mapa de cada jugador corre sus fichas en un iframe oculto
  (`ficha.html?modo=mantenimiento#id`, uno por vez) y el del GM corre
  `gm-tools.html?modo=mantenimiento`. Avisan `mantenimiento-listo` por
  `postMessage` cuando guardaron. Si nadie las abre, se ponen al día al
  abrirse. La ficha ya no tiene botón de Mantenimiento. Estos iframes (y
  los de Botonera y Acciones) cargan siempre con `sinCache()`: el sitio
  publicado cachea cada archivo hasta 10 minutos, y sin esto un iframe
  podía quedar con la ficha o gm-tools de antes de la última actualización
  mientras dura la sesión.

## Respaldo de la partida

Firebase gratis no hace copias de seguridad. Cualquiera baja un respaldo:
el jugador con el botón 💾 de la ficha (arriba, junto a 🗺 Mapa) y el GM
con "💾 Respaldo partida" en gm-tools. El código está en
[`../comun/respaldo.js`](../comun/respaldo.js). Baja
`respaldo-<partida>-<fecha>.json` con `{tipo: 'respaldo-partida', version,
creado, hechoPor{nombre, gm}, partida, miembros, fichas[{id, nombre,
duenoUid, dueno, ficha}], creepsPublicos, tokens, mapa, tiradas,
tienda{publicada}}` y, solo si lo baja el GM, `gmCreeps{turno, creeps}` y
`tienda.borrador` y `tienda.guardadas[{id, nombre, tienda}]` (los jugadores
no pueden leer los creeps completos, el borrador ni las tiendas guardadas). Fechas en texto ISO. `ficha` tiene la forma de
"Guardar copia" de la ficha (con retrato e imágenes de invocaciones) y
`gmCreeps` la de `gm-creeps.json`. Para recuperar: en la ficha, "Cargar
archivo" con el respaldo pregunta qué personaje cargar; en gm-tools,
"Cargar archivo" toma los creeps (solo de un respaldo del GM). Tokens,
mapa y tiradas quedan en el archivo pero todavía no tienen botón para
restaurarlos.

## Tareas de mantenimiento (en la consola)

- **Activar los métodos de acceso**: Authentication → Método de acceso →
  Google (elegir el email de soporte) y Correo electrónico/contraseña
  (solo la primera opción, no "vínculo de correo electrónico").
- **Dominios autorizados**: Authentication → Configuración → Dominios
  autorizados → `elsauloel.github.io`.
- **Sacar a alguien o borrar una partida**: desde "⚙ Partida" en la página
  de la partida (ver arriba). Por consola sigue funcionando: borrar su
  documento en `campanas/{id}/miembros`, o "Eliminar documento" sobre la
  partida marcando también las subcolecciones.

## Cómo probar

Dos perfiles de Chrome (o una ventana normal y una de incógnito) con
cuentas distintas: uno crea la partida (GM) y el otro se une (jugador).
