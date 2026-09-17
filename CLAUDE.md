# Rol Pintoísta — herramientas de campaña (rama `nueva-version`)

> Esta rama (carpeta `rol-nueva-version`) es el sistema nuevo: herramientas
> de campaña en vivo con Firebase. **Antes de tocar código acá**, leer
> [`docs/plan-sistema-nuevo.md`](docs/plan-sistema-nuevo.md) (qué se
> decidió y en qué estado está cada paso) y
> [`docs/workflow-firebase.md`](docs/workflow-firebase.md) (cómo está
> armado Firebase: estructura de datos, permisos, cómo se prueba).
>
> **Preguntas de diseño abiertas → [`docs/preguntas-abiertas.md`](docs/preguntas-abiertas.md).**
> Regla para todas las conversaciones: cada pregunta de diseño o regla que
> quede sin decidir (y cada `PLACEHOLDER` nuevo en el código) se agrega ahí,
> con número, contexto y fecha; al decidirla se aplica, se documenta y se
> marca ✅ ahí. Antes de preguntarle algo de diseño al usuario, mirar si ya
> está en esa lista.
>
> El repo tiene otra rama, `main`: la versión vieja de la campaña "Piratas
> en el espacio", con sincronización manual por GitHub en vez de Firebase.
> Queda congelada como archivo histórico — no se migran sus personajes ni
> sus datos, y no hace falta convivir con ella.

Conjunto de herramientas HTML standalone para jugar Rol Pintoísta en vivo,
cada uno desde su casa: mapa de hexágonos con tokens, fichas de personaje,
panel de combate del GM, generador de tiendas. Un "Roll20 propio" con solo
lo que el grupo usa.

## Stack

- **HTML/CSS/JS puro, sin build step.** Cada herramienta (`ficha.html`,
  `gm-tools.html`, `vendor-generator.html`, `mapa.html`, `index.html`) es
  una página completa y se abre con doble clic o por el sitio publicado;
  lo que comparten entre sí vive en `comun/` y se suma con
  `<script src="../comun/archivo.js">` — **nunca se copia adentro del
  HTML** (ver [`comun/CLAUDE.md`](comun/CLAUDE.md)).
- **Firebase (Firestore) es el backend en vivo**: cuentas, partidas,
  fichas, creeps, mapa, tokens, tiradas, tienda y bitácora se leen y
  escriben ahí en tiempo real, sin "Subir datos"/"Bajar datos". SDK
  *compat* cargado por `<script>` desde `gstatic.com`. Ver
  [`docs/workflow-firebase.md`](docs/workflow-firebase.md) para la
  estructura completa y [`firebase/firestore.rules`](firebase/firestore.rules)
  para los permisos (hay que pegarlos a mano en la consola cada vez que
  cambian).
- **El catálogo de ítems es la excepción**: sigue viviendo en
  `datos/catalogo.json` y sincronizándose por **GitHub** (API de
  contenidos, con un token personal en `localStorage`, nunca en el repo),
  siempre contra la rama **`main`** — es infraestructura compartida entre
  campañas, no estado de una partida puntual. Ver
  [`docs/workflow-github.md`](docs/workflow-github.md) y
  [`datos/CLAUDE.md`](datos/CLAUDE.md).
- **Python** (`herramientas/`) mantiene ese catálogo sincronizado entre
  Excel, el editor HTML y las herramientas de juego. No es parte del
  runtime de ninguna herramienta.
- **`gestor.html`** (raíz) actualiza el *código* de las herramientas desde
  GitHub — nunca datos de partida — usando la File System Access API
  sobre la carpeta que elige el usuario, y apunta a la rama `main`. La
  plataforma vieja de sync de datos por GitHub (Subir/Bajar datos, Traer
  última versión de personajes/tablero/tienda) ya no se usa: en
  `nueva-version` ese código y esas pantallas se sacaron por completo de
  la ficha y de gm-tools, no solo se desactivaron.
- **Sitio publicado**: la rama `nueva-version` se publica sola en GitHub
  Pages, en `https://elsauloel.github.io/rolpintoista/` — cada push se
  publica en 1–2 minutos, así que solo se sube lo ya probado.

## Convenciones de nombres

- Carpetas del repo en español, `kebab-case` cuando tienen más de una
  palabra (`ficha-personaje/`, `gm-toolset/`, `manual-usuario/`,
  `vtt-hexgrid/`).
- Dentro del JS de cada herramienta: identificadores y comentarios en
  español, `camelCase` para variables/funciones (`aplicarFicha`,
  `renderBotonera`, `mesaPublicar`). Los nombres de conceptos del juego
  (PdG, Bloqueo, Res.Mt, No2) se usan tal cual, sin traducir a inglés.
- IDs de ítems de catálogo: `cat-<slug>` para los originales, `new-<slug>`
  para los agregados por el importador cuando no traían id.
- Rutas de sincronización con GitHub del catálogo (los strings que ven
  `ghSubir`/`ghLeerJson`) son siempre relativas a la raíz del repo, no al
  archivo HTML que las usa.

## Qué hay en cada carpeta

| Carpeta | Contenido | Estado |
|---|---|---|
| [`ficha-personaje/`](ficha-personaje/CLAUDE.md) | Ficha de personaje interactiva (`ficha.html`), en vivo con Firebase | En desarrollo activo |
| [`gm-toolset/`](gm-toolset/CLAUDE.md) | Panel de combate del GM y generador de tiendas, en vivo con Firebase | En desarrollo activo |
| [`vtt-hexgrid/`](vtt-hexgrid/CLAUDE.md) | Mapa de hexágonos en vivo con tokens (`mapa.html`, Firebase) | En desarrollo activo |
| [`comun/`](comun/CLAUDE.md) | Código JS compartido entre las herramientas (sesión, menú, Mesa, dados, lupa, asistente de ítems…) | En uso activo |
| [`datos/`](datos/CLAUDE.md) | Catálogo de ítems (`catalogo.json`, sincronizado por GitHub contra `main`) + su editor | En uso activo |
| [`manual-usuario/`](manual-usuario/CLAUDE.md) | Manual de reglas de la campaña | En construcción, cargándose de a poco |
| [`docs/`](docs/CLAUDE.md) | Plan del sistema nuevo, workflow de Firebase/GitHub, preguntas de diseño abiertas | Con contenido activo |
| `herramientas/` | Scripts Python que sincronizan el catálogo (Excel ↔ `datos/catalogo.json` ↔ los HTML) | Ver `herramientas/LEEME.md` |
| `assets/` | Arte de referencia e insumos del catálogo (no se cargan en runtime) | Sin tocar |
| `firebase/` | `firestore.rules`, la copia versionada de los permisos | En uso activo |
| `gestor.html` (raíz) | Actualiza el código de las herramientas desde `main` | Legado — no toca datos de partida en `nueva-version` |

Esquema de datos de Firebase: [`docs/workflow-firebase.md`](docs/workflow-firebase.md).
Esquema del catálogo y del respaldo local: [`datos/esquema.md`](datos/esquema.md).

## Cosas que hay que saber antes de tocar código acá

- **Evitar dos conversaciones tocando el mismo archivo grande a la vez**
  (sobre todo `ficha-personaje/ficha.html` y `gm-toolset/gm-tools.html`,
  los que más cambian). Antes de un cambio grande ahí: `git status` y
  `git log --oneline -5` para ver si hay trabajo de otra conversación en
  curso o recién subido, y avisar si el archivo cambió de abajo mientras
  se estaba editando (el propio Edit ya avisa "el archivo había sido
  modificado" — no ignorarlo, releer y seguir desde ese estado). Subir en
  bloques chicos (ver el punto siguiente) para que la ventana de choque
  entre conversaciones sea corta.
- **Subir el trabajo apenas queda probado.** No hay "Traer última
  versión" que pueda pisar nada en esta carpeta (ni el botón ni el código
  existen), pero cada push a `nueva-version` se publica solo en GitHub
  Pages — no dejar trabajo grande sin subir ni a medio probar en el sitio
  público.
- **Código compartido en `comun/`** (se carga con `<script src>` en cada
  herramienta; no copiarlo adentro de los HTML): `sesion.js` (cuenta y
  partida), `menu-sitio.js` (☰), `mesa.js` (Mesa de tiradas),
  `tiradas.js` (fórmulas de dados), `lupa.js` (cuadro 🔍),
  `mesa-historial.js`, `grilla-dados.js`, `dados3d.js`, `respaldo.js`,
  `efectos-golpe.js`, `asistente-item.js`. Si algo se repite en dos
  herramientas, va ahí — ver [`comun/CLAUDE.md`](comun/CLAUDE.md).
- Crear o editar ítems (menos consumibles) en la ficha, gm-tools, el
  generador de tiendas y el editor de catálogo pasa por un solo asistente
  paso a paso compartido: `comun/asistente-item.js`.
- Los efectos de arma que se aplican al personaje **golpeado** (Rompe
  armadura, Envenenar, Sangrado…) van en `efectosGolpe` del arma: al tirar
  el Daño se **recuerdan** resaltados en la Mesa y, si tienen porcentaje,
  se **tiran** en un pop-up (`comun/efectos-golpe.js`). Aplicarlos sobre el
  rival sigue siendo manual, a propósito: no hay que automatizar el estado
  en el objetivo salvo que se pida.
- **El catálogo va sin imágenes mientras dura el desarrollo** (decidido
  2026-09-17): no cargar imágenes de ítems ni volver a ponerlas. La
  función de cargar imagen sigue en las herramientas, a propósito. Para
  tocar el catálogo está `datos/catalogo.json` + `datos/catalogo-editor.html`
  — nunca a mano.
- **Solo compu, no celular** (decidido 2026-09-17): no adaptar ni probar
  nada para pantallas de celular salvo que se pida explícitamente — ver
  [`docs/plan-sistema-nuevo.md`](docs/plan-sistema-nuevo.md).
