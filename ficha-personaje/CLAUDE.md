# ficha-personaje/

## Qué es

`ficha.html` — la ficha de personaje interactiva. Un único archivo HTML
standalone (~1.3 MB, ~6700 líneas de JS) con todo: atributos, combate,
inventario, catálogo de compra, habilidades, bitácora, tablero de combate.

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
- **Estados alterados**: `EFECTOS_PRESET` define los presets (Veneno,
  Lisiado, Invulnerable, etc.) con sus tags de inmunidad (`esCC`,
  `esVeneno`, `esSangrado`). `aplicarDanioEntrante()` es donde
  Invulnerable/Blindado/Escudo mágico interceptan el daño antes de que
  llegue al HP.

## Formato de datos

- **Consume**: el catálogo de ítems, embebido como `S.catalogo` (con
  imágenes) — se sincroniza desde `datos/catalogo.json` corriendo
  `herramientas/importar_json.py` (o `importar.py` si se editó el Excel).
  **No se edita a mano acá** — ver [`datos/CLAUDE.md`](../datos/CLAUDE.md).
- **Produce/consume vía GitHub** (botones Personajes/Subir datos/Bajar
  datos/Tablero/Vendedor): `datos/personajes/*.json`,
  `datos/personajes/backups/*.json`, `datos/tablero/*.json`,
  `datos/creeps-publico.json` (solo lectura, lo publica gm-tools),
  `datos/tienda-publica.json` (solo lectura, lo publica vendor-generator).
- **Exporta/importa localmente**: el personaje completo a un `.json`
  (botón Guardar ficha / Cargar archivo), ver `datos/esquema.md`.

## Dependencias con otras carpetas

- `datos/` — todo el estado de partida (personajes, tablero) y el
  catálogo (indirectamente, vía el pipeline de `herramientas/`).
- `gm-toolset/gm-tools.html` — comparten el formato de tarjeta de tablero
  y el de efecto/estado (duplicados en el código de cada uno, no
  importados).
- `gestor.html` (en la raíz) — lo actualiza a él y viceversa (el botón
  "Actualizar gestor" de la ficha trae la última versión de `gestor.html`).
