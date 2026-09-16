# ficha-personaje/

## Qué es

`ficha.html` — la ficha de personaje interactiva. Un único archivo HTML
standalone (~1.3 MB, ~6700 líneas de JS) con todo: atributos, combate,
inventario, catálogo de compra, habilidades, bitácora.

## Estado actual

En desarrollo activo, es la herramienta principal del proyecto y la que
más cambia sesión a sesión.

## Lógica principal

- **`S`** es el estado completo del personaje en memoria (ver `DEFAULT`
  para la forma completa, y [`datos/esquema.md`](../datos/esquema.md)
  para el resumen). Todo lo que se guarda/sincroniza sale de acá.
- **`compute()`** es el punto central donde los atributos base + los mods
  de equipo/efectos activos se combinan en los stats finales (PdG,
  Defensa, HP máx., etc.). Cualquier cambio que afecte cómo se calcula un
  stat pasa por acá.
- **Patrón `SCHEMA`-driven**: los editores de ítem/efecto/habilidad
  (`openEditor`/`drawEditor`) son genéricos — el array `campos` de cada
  entrada en `SCHEMA` decide qué inputs se dibujan. Agregar un campo nuevo
  a un tipo de entidad casi siempre es: sumarlo a `campos`, a `CAMPO_LABEL`,
  y si es numérico a `CAMPO_NUM` — no hay que tocar el HTML del formulario.
- **Contenedores colapsables**: cada caja del home (Atributos, Combate,
  Mochila, etc.) tiene su propio botón 👁/🙈 con estado en `localStorage`,
  y su propia tonalidad de borde (`.card--<nombre>`) para reconocerlas
  colapsadas. La Botonera (modal de acciones rápidas) tiene el mismo
  patrón en sus propias cajas internas.
- **Iteración 2 — Nitros (No2) y SP** (bloque `IT2` al lado de
  `DADOS_ARMA`): Acciones + Movimiento se fundieron en Nitros (substat
  `nitros` de Agilidad, fórmula `agl`; `S.nitros` es lo que queda en el
  turno, se recarga en `mantenimiento()`). Bonos pasó a SP (substat `sp`
  de Inteligencia, fórmula `int*3`; `S.spGastado`, **no** se recarga entero
  al pasar turno: `mantenimiento()` resta de `spGastado` el substat
  `spregen` "SP Regen", fórmula base `0` (las fichas con la vieja `floor(int/2)` se pasan a 0) + mods de equipo/estados/
  habilidades, sin pasar del máximo). Costos: mover 1/casillero (`moverCasilleros`), consumir
  cinturón 1 / mochila 2, habilidad `nitrosCosto` (1 por defecto), atacar
  Tipo ÷ 2 el primer ataque del turno y Tipo completo después
  (`atacar`/`costoAtaqueNitros`, `S.ataquesTurno`). **Cada arma paga su propio
  primer ataque** (`S.ataquesArma` = {idArma: n}, se vacía en el Mantenimiento) y
  el PdG de cada arma no suma los mods de PdG de la otra (`pdgParaArma`; los
  mods de equipo traen `itemId` desde `collectMods`). En la Botonera, con dos
  armas, Atacar y Daño se desdoblan (uno por arma, `data-arma`). Lo no
  confirmado está en `IT2` marcado PLACEHOLDER y se ve con ⚠
  (`IT2_PENDIENTE`). Las fichas y el catálogo viejos se convierten al abrir
  (`migrarEstadoIt2`, corre en `renderAll`). Las invocaciones siguen con sus
  propias Acciones.
- **🔍 Lupa de la Botonera** (`lupaHtml`, `abrirLupa`, `#lupa-pop`): cada botón
  (combate, stats, habilidades, consumibles) trae un 🔍 (`data-lupa`) que muestra
  de qué stat sale la tirada, sus modificadores con origen, cómo se reparte en
  dados y el costo en No2/SP con su motivo. No tira nada.
- **Editor de habilidades paso a paso** (`PASOS_HABILIDAD`, `drawEditorHabilidad`):
  `drawEditor` deriva ahí para `habilidades`. Pasos: qué es (nombre y
  descripción) → costo (SP, No2, categoría) → tirada (stat y/o fórmula) →
  estado alterado (`htmlEstadoAlUsar`, compartido con los consumibles) →
  origen (Job o de dónde salió, imagen) → resumen. Al crear, Guardar aparece
  en el último paso; al editar, siempre, y los pasos se pueden saltar.
- **Estados alterados**: `EFECTOS_PRESET` define los presets (Veneno,
  Lisiado, Invulnerable, etc.) con sus tags de inmunidad (`esCC`,
  `esVeneno`, `esSangrado`). Ya no hay "Daño entrante": el HP se edita a
  mano (número o +N/-N), así que Invulnerable, Blindado, Escudo mágico y
  Espinas frente a golpes quedan como recordatorio manual (en el
  Mantenimiento siguen bloqueando veneno y sangrado).

## Formato de datos

- **Consume**: el catálogo de ítems, embebido como `S.catalogo` (con
  imágenes) — se sincroniza desde `datos/catalogo.json` corriendo
  `herramientas/importar_json.py` (o `importar.py` si se editó el Excel).
  **No se edita a mano acá** — ver [`datos/CLAUDE.md`](../datos/CLAUDE.md).
- **Produce, opcionalmente**: el editor de ítems de Mochila/Equipo/Cinturón
  tiene un botón "📦 Agregar al catálogo" (`agregarAlCatalogoDelFabricante()`)
  que convierte el ítem del jugador en una entrada de catálogo (descarta
  campos de instancia como `equipado`/`cargaActual`, le pone tier "Común"
  por default) y la sube directo a `datos/catalogo.json`, con confirmación
  explícita antes de publicar. No corre `importar_json.py` sola — eso
  sigue siendo un paso aparte.
- **En vivo con Firebase** (rama `nueva-version`, bloque "FICHA EN VIVO"
  al final del script): el personaje abierto se guarda solo en
  `campanas/{id}/fichas/{fichaId}` por partes (ver
  [`docs/workflow-firebase.md`](../docs/workflow-firebase.md)). El botón
  👥 Personajes lista los de la mesa; los de otros jugadores se abren en
  solo lectura. El personaje abierto se recuerda en el `#id` de la URL y en
  `localStorage` (`ficha-actual`). Ya no hay Subir/Bajar datos.
- **Modo botonera** (`?modo=botonera`, bloque al final del script): lo usa
  el mapa en un iframe. Oculta todo menos las ventanitas (`.scrim`) con
  fondo transparente, abre la Botonera al cargar el personaje y le avisa
  al mapa cuando no queda ninguna ventanita abierta.
- **Bitácora de la partida** (bloque "BITÁCORA DE LA PARTIDA"): compartida en
  `campanas/{id}/bitacora/{página}/entradas/{id}`, no en la ficha (el viejo
  `S.bitacora` quedó sin uso). Páginas que cualquiera crea y renombra;
  entradas en el color de su autor (`bitacoraColor(uid)`) con
  "(autor · fecha · editado por X fecha)". Cualquiera corrige; borra el autor
  (o quien creó la página) o el GM. Funciona también en solo lectura.
- **Sin Tablero**: el botón 📋 Tablero se quitó de la ficha porque las
  barras y estados de todos ya se ven en los tokens del mapa
  (`vtt-hexgrid/mapa.html`). gm-tools conserva el suyo.
- **Vendedor en vivo**: 🏪 Vendedor lee `campanas/{id}/tienda/publicada`
  (la publica el GM desde `gm-toolset/vendor-generator.html`) y la escucha
  mientras el jugador está en la tienda. Los ítems se buscan con
  `itemCatalogo(id)`: primero en `S.catalogo` y, si no está (ítem creado
  por el GM), en `tiendaCargada.itemsDatos`.
- **Todavía vía GitHub**: "Agregar al catálogo".
- **Exporta/importa localmente**: el personaje completo a un `.json`
  (botón Guardar copia / Cargar archivo), ver `datos/esquema.md`. Con un
  personaje abierto, cargar un archivo reemplaza su contenido en la mesa;
  sin ninguno, lo crea como personaje nuevo.

## Dependencias con otras carpetas

- `datos/` — todo el estado de partida (personajes, tablero) y el
  catálogo (indirectamente, vía el pipeline de `herramientas/`).
- `gm-toolset/gm-tools.html` — comparten el formato de efecto/estado (duplicados en el código de cada uno, no
  importados).
- `vtt-hexgrid/mapa.html` e `index.html` — accesos directos arriba a la
  derecha (🗺 Mapa, ⌂ Inicio), con `?partida=` de la partida abierta. El
  menú ⚙ Ajustes (Cambiar token, Actualizar gestor) se quitó.
