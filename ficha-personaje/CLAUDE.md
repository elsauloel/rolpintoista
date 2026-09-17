# ficha-personaje/

## Qué es

`ficha.html` — la ficha de personaje interactiva. Un único archivo HTML
standalone (~650 KB, ~8500 líneas) con todo: atributos, combate,
inventario, catálogo de compra, habilidades, bitácora.

## Estado actual

En desarrollo activo, es la herramienta principal del proyecto y la que
más cambia sesión a sesión. Por eso mismo, es la que más riesgo tiene de
que dos conversaciones la editen a la vez — antes de un cambio grande acá,
`git status`/`git log` para ver si hay trabajo reciente o en curso (ver
[`../CLAUDE.md`](../CLAUDE.md)).

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
- **Escala de Tipos +2** (bloque al lado de `migrarEstadoIt2`): los Tipos de
  arma son 4/6/8/10/12 (`DADOS_ARMA`; default 8; sin arma sigue en
  `IT2.tipoSinArma` = 4). Los stats `tipo1..tipo5` son ahora la resistencia
  a Tipo 4..12 (solo cambió la etiqueta). Una ficha sin `escalaTipos: 2` es
  de antes: `aplicarFicha` la corre +2 una sola vez (`migrarEstadoTipos`:
  `tipoDado`, `armaTipo` de invocaciones y los textos) y
  `tiposGuardarJunto` hace que `fichaGuardarTick` guarde todas las partes
  en el mismo lote (si la marca, que va en "otros", llegara sin los ítems,
  la próxima carga los correría otra vez). Los ítems del GM en la tienda
  (`itemsDatos`) llevan la marca cada uno.
- **Compartido con gm-tools y el mapa**: la Mesa (`../comun/mesa.js`; acá
  solo `MESA_DESDE`, `mesaQuien()` y `mesaIniciar(fbAlEntrar)`), las
  fórmulas de dados (`../comun/tiradas.js`) y el cuadro de la 🔍
  (`../comun/lupa.js`). No volver a copiarlos acá.
- **🔍 Lupa de la Botonera** (contenido: `lupaContenido` → `lupaHtml`; cuadro en `../comun/lupa.js`): cada botón
  (combate, stats, habilidades, consumibles) trae un 🔍 (`data-lupa`) que muestra
  de qué stat sale la tirada, sus modificadores con origen, cómo se reparte en
  dados y el costo en No2/SP con su motivo. No tira nada. En las habilidades la 🔍 va dentro del botón Ejecutar (`habx:`) y muestra
  solo cuánto cuesta, cuánto hay de ese recurso y qué tira ("PdG = 1d6+1");
  sin No2 el botón queda apagado con `.sin-recursos` (no `disabled`, para que
  la 🔍 siga abriendo).
- **Editor de habilidades paso a paso** (`PASOS_HABILIDAD`, `drawEditorHabilidad`):
  `drawEditor` deriva ahí para `habilidades`. Pasos: qué es (nombre y
  descripción) → costo (SP y No2; No2 puede ser un número, X o "ATAQUE" = lo que cuesta atacar con el arma elegida al ejecutar, `nitrosAtaque`/`registrarAtaqueDeHabilidad`, y cuenta como ese ataque; cada uno puede ser X: `spVariable`/`nitrosVariable`, se eligen en `#scrim-costox` y lo fijo queda bloqueado; categoría) → tirada (stat y/o fórmula) →
  estado alterado (`htmlEstadoAlUsar`, compartido con los consumibles) →
  origen (Job con cuántos puntos costó — `jobCosto`, 1 por defecto, lo suma `jobBudget` vía `jobCostoDe` —, o de dónde salió; imagen) → resumen. Al crear, Guardar aparece
  en el último paso; al editar, siempre, y los pasos se pueden saltar.
- **Ítems paso a paso** (`abrirAsistenteItem`, asistente compartido
  `comun/asistente-item.js`): `openEditor` manda ahí todo ítem de
  inventario o catálogo que no sea consumible (nuevo o existente). Paso 1:
  categoría, nombre y descripción en palabras; después solo lo práctico
  según la categoría (armas: Tipo, empuñadura, peso y daño, bonos, efectos
  al golpear; defensa: Defensa y resistencias a crítico; todos: bonos,
  estado al equipar, precio/lugar) y resumen. Los números del personaje
  salen de `portadorFicha`. Elegir "Consumible" o "formulario completo"
  vuelve a `openEditor` con `{formulario: true, draft}`; el cinturón usa
  siempre el formulario.
- **Efectos al golpear** (`efectosAlPegar`, `comun/efectos-golpe.js`):
  `tirarDanoDeArma` los dispara después del daño. Sin tiradas, va directo
  a la Mesa una línea resaltada (`desde: 'efecto'`); con porcentaje, abre el
  pop-up para tirar (50% = 1d2, 25% = 1d4…) y publica al cerrarlo.
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

- `comun/` — `sesion.js` (cuenta y partida), `menu-sitio.js` (☰),
  `mesa.js`/`tiradas.js`/`lupa.js` (Mesa, dados y 🔍, compartidos con
  gm-tools y el mapa; acá la ficha solo define `MESA_DESDE`, `mesaQuien()`
  y el contenido de la lupa), `mesa-historial.js`, `grilla-dados.js`,
  `dados3d.js`, `respaldo.js`, `efectos-golpe.js` y `asistente-item.js` —
  ver [`../comun/CLAUDE.md`](../comun/CLAUDE.md).
- `datos/` — el catálogo de ítems (indirectamente, vía el pipeline de
  `herramientas/`); el estado de partida (personajes, mapa, tokens) ya no
  vive acá, está en Firebase (ver
  [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)).
- `gm-toolset/gm-tools.html` — mismo formato de tarjeta de estado/efecto,
  pero cada uno con su propia lista de presets (`EFECTOS_PRESET` acá,
  `ESTADOS_PRESET_GM` en gm-tools) — duplicado a propósito, no importado.
- `vtt-hexgrid/mapa.html` — el menú ☰ (`comun/menu-sitio.js`) es la
  navegación principal entre partida, mapa y fichas; el mapa además carga
  la ficha adentro en un iframe (`?modo=botonera`) para la Botonera de
  cada jugador.
