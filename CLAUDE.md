# Piratas en el espacio — herramientas de campaña

Conjunto de herramientas HTML standalone para una campaña de rol homebrew.
No hay backend ni base de datos: cada herramienta es un único archivo
`.html` que se abre haciendo doble clic (o arrastrándolo a una pestaña del
navegador), y el estado de la partida vive en archivos `.json` — ya sea
local, en descargas/cargas manuales, o sincronizado con este repo de
GitHub vía la API de contenidos (con un token personal guardado en
`localStorage`, nunca en el repo).

## Stack

- **HTML/CSS/JS puro**, sin build step, sin dependencias externas más que
  Google Fonts. Cada archivo `.html` es una app completa y autocontenida.
- **Guardado/carga en JSON**: cada herramienta puede descargar su estado a
  un `.json`, cargar uno local, y (la mayoría) sincronizarlo con GitHub
  directamente desde el navegador — mismo patrón de token en las tres.
- **Python** (`herramientas/`) solo para mantener el catálogo de ítems
  sincronizado entre Excel, el editor HTML y las tres apps de juego. No
  es parte del runtime de ninguna herramienta.
- **Sin CORS entre archivos locales**: por eso todo lo que una herramienta
  necesita en vivo de otra (personajes, catálogo, tablero, tienda) se lee
  vía la API de GitHub (`https://api.github.com/repos/.../contents/...`),
  no leyendo el archivo del disco directamente.

## Convenciones de nombres

- Carpetas del repo en español, `kebab-case` cuando tienen más de una
  palabra (`ficha-personaje/`, `gm-toolset/`, `manual-usuario/`,
  `vtt-hexgrid/`).
- Dentro del JS de cada herramienta: identificadores y comentarios en
  español, `camelCase` para variables/funciones (`aplicarDatos`,
  `ghSubir`, `renderLista`). Los nombres de conceptos del juego (PdG,
  Bloqueo, Res.Mt) se usan tal cual, sin traducir a inglés.
- IDs de ítems de catálogo: `cat-<slug>` para los originales, `new-<slug>`
  para los agregados por el importador cuando no traían id.
- Rutas de sincronización con GitHub (los strings que ven `ghSubir`/
  `ghLeerJson`) son siempre relativas a la raíz del repo, no al archivo
  HTML que las usa — por eso no cambian aunque una herramienta se mueva de
  carpeta.

## Qué hay en cada carpeta

| Carpeta | Contenido | Estado |
|---|---|---|
| [`ficha-personaje/`](ficha-personaje/CLAUDE.md) | Ficha de personaje interactiva (`ficha.html`) | En desarrollo activo |
| [`gm-toolset/`](gm-toolset/CLAUDE.md) | Panel de combate del GM y generador de tiendas | En desarrollo activo |
| [`datos/`](datos/CLAUDE.md) | JSONs de la partida (personajes, tablero, catálogo) + el editor de catálogo | En uso activo |
| [`manual-usuario/`](manual-usuario/CLAUDE.md) | Manual de reglas de la campaña | **En construcción, sin contenido todavía** — solo el esqueleto |
| [`vtt-hexgrid/`](vtt-hexgrid/CLAUDE.md) | Mapa hexagonal virtual | **En pausa** — sin spec ni código todavía |
| [`docs/`](docs/CLAUDE.md) | Workflow de GitHub/Gestor, notas generales | Con contenido básico |
| `herramientas/` | Scripts Python que sincronizan el catálogo (Excel ↔ `datos/catalogo.json` ↔ los HTML) | Fuera del alcance de esta reorganización de carpetas — ver `herramientas/LEEME.md` |
| `assets/` | Arte de referencia e insumos del catálogo (no se cargan en runtime) | Sin tocar |
| `gestor.html` (raíz) | Actualiza las herramientas desde GitHub o publica cambios locales | Se queda en la raíz a propósito: usa la File System Access API sobre la carpeta elegida por el usuario, y necesita encontrar `gestor.html` mismo como ancla |

Esquema de datos compartido entre las herramientas: [`datos/esquema.md`](datos/esquema.md).

## Cosas que hay que saber antes de tocar código acá

- **"Traer última versión" (en `gestor.html` y en el botón ⚙ de la ficha)
  sobreescribe el archivo local sin avisar si hay cambios sin commitear.**
  Ya pasó una vez que esto pisó trabajo en curso. Regla operativa: commitear
  y pushear cada bloque de cambios apenas queda probado, no dejar trabajo
  grande sin subir.
- Las rutas de sincronización con GitHub embebidas en cada HTML
  (`personajes/...`, `tablero/...`, `creeps-publico.json`,
  `tienda-publica.json`) son independientes de dónde vive el archivo HTML
  en el repo — apuntan a `datos/...` porque ahí es donde están los datos
  ahora, no porque el HTML esté cerca.
- Los efectos de arma que se aplican al personaje **golpeado** (Rompe
  armadura, Sangrado como texto de arma, etc.) son intencionalmente
  manuales — no hay sistema de "efecto al golpear sobre el rival" y no es
  un hueco a rellenar salvo que se pida construir eso específicamente.
- `ficha-personaje/ficha.html` pesa ~1.3 MB, la mayoría son imágenes del
  catálogo embebidas en base64. Es liviano para el navegador; lo único que
  vuelve pesado es tocarlo a mano — para eso está `datos/catalogo.json` +
  `datos/catalogo-editor.html`.
