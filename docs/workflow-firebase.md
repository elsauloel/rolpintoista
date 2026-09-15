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
  edita; el GM puede borrarlas. El bloque "MESA" está copiado igual en las
  dos herramientas (solo cambian `MESA_DESDE` y `mesaQuien()`).
  El mapa (`vtt-hexgrid/mapa.html`) muestra la misma Mesa y publica
  tiradas libres con `desde: 'mapa'`.
- `campanas/{id}/fichas/{auto}` — `{duenoUid, nombre, resumen: {nivel, hp,
  hpMax, sp, spMax, nitros, nitrosMax, costoMover (0 = no puede moverse), muerto, estados[{nombre, turnos, permanente,
  polaridad}], invocaciones[{id, nombre, hp, hpMax, activa, miniatura}]},
  miniatura, creado, actualizado}`. Las fichas guardadas antes de la
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
  todo; solo el dueño escribe. Son fichas de jugadores: el GM no crea ni edita (en la ficha las ve en solo lectura; lo suyo va en gm-tools) y solo puede cambiar `duenoUid`. La ficha
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
- `campanas/{id}/gm/estado` — `{turno, actualizado}`. Contador de turno de
  gm-tools. Solo el GM.
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

`campanas/piratas-en-el-espacio` es el espacio de pruebas de antes de las
cuentas (identidades anónimas, sin `gmUid`): no aparece en el inicio y se
puede borrar desde la consola.

## Respaldo de la partida

Firebase gratis no hace copias de seguridad. En la página de la partida,
el GM tiene **💾 Respaldo de la partida**, que baja
`respaldo-<partida>-<fecha>.json` con `{tipo: 'respaldo-partida', version,
creado, partida, miembros, fichas[{id, nombre, duenoUid, dueno, ficha}],
gmCreeps{turno, creeps}, tokens, mapa, tiradas}` (fechas en texto ISO).
`ficha` tiene la forma de "Guardar copia" de la ficha (con retrato e
imágenes de invocaciones) y `gmCreeps` la de `gm-creeps.json` (con
imágenes). Para recuperar: en la ficha, "Cargar archivo" con el respaldo
pregunta qué personaje cargar; en gm-tools, "Cargar archivo" toma todos
los creeps. Tokens, mapa y tiradas quedan en el archivo pero no tienen
todavía un botón para restaurarlos.

## Tareas de mantenimiento (en la consola)

- **Activar los métodos de acceso**: Authentication → Método de acceso →
  Google (elegir el email de soporte) y Correo electrónico/contraseña
  (solo la primera opción, no "vínculo de correo electrónico").
- **Dominios autorizados**: Authentication → Configuración → Dominios
  autorizados → `elsauloel.github.io`.
- **Sacar a alguien de una partida**: borrar su documento en
  `campanas/{id}/miembros` (más adelante, desde la página de la partida).
- **Borrar una partida entera**: en Firestore, sobre el documento de la
  partida, "Eliminar documento" marcando también las subcolecciones.

## Cómo probar

Dos perfiles de Chrome (o una ventana normal y una de incógnito) con
cuentas distintas: uno crea la partida (GM) y el otro se une (jugador).
