# Workflow de Firebase

Base del sistema nuevo de Rol Pintoísta (mapa, tokens, tiradas en vivo).
Convive con [`workflow-github.md`](workflow-github.md): GitHub sigue
distribuyendo el código de las herramientas; Firebase guarda lo que tiene
que verse en vivo entre jugadores.

## Proyecto

- Proyecto Firebase: `rol-pintoista`, plan Spark (gratis, sin tarjeta).
- Authentication: solo el proveedor **Anónimo**. No se usa "Acceder con
  Google" porque no funciona abriendo los HTML con doble clic (`file://`);
  queda como opción si algún día las herramientas se publican en una web.
- Firestore: reglas versionadas en [`../firebase/firestore.rules`](../firebase/firestore.rules).
  Para aplicarlas: consola → Firestore Database → Reglas → pegar todo →
  Publicar. El archivo del repo y la consola tienen que quedar iguales.
- SDK: versión *compat* cargada por `<script>` desde
  `https://www.gstatic.com/firebasejs/12.3.0/…`, sin build step.

## Estructura de datos

Todo cuelga de `campanas/{idCampana}`, para que cada campaña tenga lo suyo:

- `campanas/{id}` — `{nombre}`.
- `campanas/{id}/privado/acceso` — `{codigo}`. El código de campaña. Nadie
  lo lee desde el navegador; se carga y se cambia a mano en la consola.
- `campanas/{id}/miembros/{uid}` — `{nombre, codigo, gm, creado}`. Uno por
  navegador que entró con el código. `gm` arranca en `false`.
- `campanas/{id}/tiradas/{auto}` — `{uid, jugador, quien, origen, formula,
  rolls[], mod, total, desde: 'ficha'|'gm', cuando}`. Una por tirada. La
  publica `registrarTirada()` (ficha.html y gm-tools.html, vía
  `mesaPublicar()`) y la cajita "Mesa" escucha las últimas 30. Nadie las
  edita; el GM puede borrarlas. El bloque "MESA" está copiado igual en las
  dos herramientas (solo cambian `MESA_DESDE` y `mesaQuien()`).
  El mapa (`vtt-hexgrid/mapa.html`) muestra la misma Mesa y publica
  tiradas libres con `desde: 'mapa'`.
- `campanas/{id}/fichas/{auto}` — `{duenoUid, nombre, resumen: {nivel, hp,
  hpMax, bonos, bonosMax, muerto, estados[{nombre, turnos, permanente,
  polaridad}], invocaciones[{id, nombre, hp, hpMax, activa, miniatura}]},
  miniatura, creado, actualizado}`. Una por personaje
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
- `campanas/{id}/mapa/fondo` — `{dato, x, y, ancho, actualizado}`. Imagen de
  fondo del mapa (data URL achicada a < 900 KB), con su posición y ancho en
  unidades del mapa. La ven todos; solo el GM la escribe.
- `campanas/{id}/tokens/{auto}` — `{nombre, color: '#rrggbb', tipo:
  'pj'|'creep', duenoUid, col, fila, creado, fichaId?}`. `fichaId` vincula
  el token a una ficha (pj), a una invocación de una ficha
  (`<fichaId>~<idInvocación>`, tipo pj) o a un creep: el mapa toma de ahí nombre,
  miniatura, barras (vida roja; SP azul, solo PJ) y estados. Tokens del mapa de
  hexágonos. Un PJ lo crea, mueve, edita y saca solo su dueño; los creeps,
  solo el GM. El GM además puede cambiar el `duenoUid` de un PJ (y nada más
  de ese token) y sacar cualquier token. Mover = un `update` de `col`/`fila`
  al soltar.
- `campanas/{id}/prueba/{auto}` — mensajes de
  [`../firebase/prueba-conexion.html`](../firebase/prueba-conexion.html),
  solo para verificar la conexión.

`piratas-en-el-espacio` es por ahora solo el espacio de pruebas: la campaña
real de ese nombre se sigue jugando con las herramientas de GitHub (rama
`main`) y no se migra.

## Tareas de mantenimiento (en la consola)

- **Marcar al GM**: Datos → `campanas/{id}/miembros` → el documento del GM
  (se reconoce por el campo `nombre`) → editar `gm` a `true` (tipo boolean).
- **Cambiar el código**: editar `codigo` en `campanas/{id}/privado/acceso`.
  Los que ya entraron siguen adentro; solo afecta a los nuevos.
- **Sacar a alguien**: borrar su documento en `miembros`.
- **Alguien borró los datos del navegador**: vuelve a poner nombre y código
  (queda un documento viejo suyo en `miembros`, se puede borrar).

## Cómo probar

Abrir `firebase/prueba-conexion.html` con doble clic en una ventana normal y
en una de incógnito (dos "jugadores" distintos), entrar con el código en
ambas y escribir: el mensaje aparece al instante en la otra.
