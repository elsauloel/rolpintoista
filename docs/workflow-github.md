# Workflow de GitHub / Gestor

Cómo se mantienen sincronizadas las herramientas entre sí y con el repo,
sin backend y sin que nadie tenga que usar `git` a mano durante una
sesión de juego.

## Dos sincronizaciones distintas, no las confundas

1. **Sincronizar los datos de la partida** (personajes, tablero, creeps,
   tienda, catálogo, manual) — cada herramienta lo hace por su cuenta,
   con sus propios botones (Subir datos / Traer última versión / Bajar
   datos). Esto es lo que se usa constantemente, en vivo, durante una
   sesión.
2. **Sincronizar las herramientas mismas** (cuando se les agrega una
   función nueva) — eso es trabajo de `gestor.html`, y solo hace falta
   cuando alguien actualizó el código de una herramienta.

Nunca se debe intentar arreglar la sincronización de datos usando
`gestor.html`, ni al revés.

## El patrón de sincronización de datos (repetido en cada herramienta)

Todas las herramientas que sincronizan datos (`ficha-personaje/ficha.html`,
`gm-toolset/gm-tools.html`, `gm-toolset/vendor-generator.html`,
`manual-usuario/manual.html`, `datos/catalogo-editor.html`) implementan el
mismo bloque de código, copiado y adaptado en cada una (no hay una
librería compartida — son HTML standalone, no pueden importarse entre
sí):

- **Token de GitHub**: un fine-grained personal access token, con acceso
  solo a este repo y permiso *Contents: Read and write*. Se pide la
  primera vez con un cartel propio (no `prompt()` nativo, para que no se
  pierda el foco al volver de la pestaña de GitHub) y se guarda en
  `localStorage['gh-token']` — **es el mismo token en las cinco
  herramientas**, generarlo en una alcanza para todas.
- **Lectura**: `GET https://api.github.com/repos/elsauloel/rolpintoista/contents/<ruta>?ref=main`,
  con header `Accept: application/vnd.github.raw+json` para traer el
  contenido crudo, o `application/vnd.github.object+json` para traer
  metadata (el `sha`, para poder compararlo o para el PUT de abajo).
- **Escritura**: `PUT` al mismo endpoint, con el contenido en base64 y el
  `sha` actual (si existe) para no pisar una escritura concurrente sin
  darse cuenta. 401/403 se interpreta como token vencido o sin permisos:
  se borra de `localStorage` y se vuelve a pedir la próxima vez.
- **Sin token** funciona igual para lectura (60 consultas/hora por IP,
  compartidas entre todos si juegan desde la misma red) — alcanza para
  jugadores que solo necesitan ver el tablero o comprar en la tienda, no
  para publicar nada.

Las rutas que usa cada `ghSubir`/`ghLeerJson` son siempre relativas a la
raíz del repo (no al archivo HTML que las llama), así que mover una
herramienta de carpeta nunca rompe estos strings — solo hay que tocarlos
si se mueve el *dato* que apuntan (ver [`../datos/CLAUDE.md`](../datos/CLAUDE.md)).

## `gestor.html`: actualizar las herramientas mismas

Vive en la raíz del repo a propósito — usa la File System Access API del
navegador sobre una carpeta local elegida una sola vez (debe ser la raíz
del repo clonado), y necesita reconocerse a sí mismo (`gestor.html`) como
ancla para saber que la carpeta elegida es la correcta.

- **Traer última versión**: compara el SHA de blob de cada archivo local
  contra el del repo (sin bajar nada si ya coinciden) y sobreescribe los
  que difieren. Los archivos que gestiona (`ARCHIVOS_APP` en el código)
  son los HTML de las herramientas + `README.md` — **no** los datos de
  partida.
- **Subir al repo**: lo mismo al revés, con confirmación antes de
  sobreescribir GitHub.
- **Advertencia al abrir**: un cartel recuerda traer la última versión
  antes de tocar nada — por el incidente conocido de perder trabajo local
  sin commitear si alguien más publicó una versión más nueva mientras
  tanto.

Si una herramienta se agrega o se mueve de carpeta, `ARCHIVOS_APP` en
`gestor.html` tiene que reflejar la ruta nueva (relativa a la raíz del
repo, tanto para GitHub como para la carpeta local — ver `resolverDir()`
en el código, que navega subcarpetas si la ruta las tiene).
