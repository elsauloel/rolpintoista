# gm-toolset/

## Qué es

Herramientas del GM: dos HTML standalone independientes entre sí (no se
abren uno al otro, solo comparten catálogo y algunos formatos de datos).

- **`gm-tools.html`** — panel de combate: maneja los creeps del GM (HP,
  atributos, arma, habilidades, estados alterados), y arma el panel de
  Tablero que junta el estado de creeps + personajes para que todos vean
  el combate en vivo.
- **`vendor-generator.html`** — "Generador de Tiendas": arma catálogos de
  venta (aleatorios o curados a mano) y los publica para que los
  jugadores compren desde su ficha.

## Estado actual

En desarrollo activo, las dos.

## Lógica principal

### gm-tools.html
- Estado en memoria: `S.creeps[]`, cada uno con la forma de `nuevoCreep()`
  (ver [`datos/esquema.md`](../datos/esquema.md), sección "Creep").
- `creepStatValor()`/`mantenimiento()` son el equivalente de `compute()`
  de la ficha: ahí se aplican los mods de equipo/estados a los stats
  finales de cada creep, incluyendo las mismas inmunidades/interceptores
  de daño (Invulnerable, Escudo mágico, etc.) espejados desde la ficha.
- El botón "Guardar" baja `gm-creeps.json` (respaldo completo, **nunca**
  se sube al repo) y opcionalmente `datos/creeps-publico.json` (recorte
  público: id, nombre, imagen, HP, estados). El botón "Subir datos" sube
  directamente ese recorte.
- El panel Tablero (mismo diseño que en la ficha, código duplicado)
  arma tarjetas a partir de sus creeps en vivo + lo que bajó de
  `datos/tablero/*.json`.

### vendor-generator.html
- `generarTienda(tamano, categoria)` sortea el stock según los pesos de
  rareza de cada tamaño (`TAMANOS`) y el reparto por categoría
  (`REPARTO_POR_CATEGORIA`: Ramos generales / Alquimista / Herrero).
  Alquimista tiene un piso de 40% de ítems "legacy", con el tamaño
  topeado si no hay suficientes legacy disponibles para sostenerlo.
- El botón "Subir datos" publica el resultado en `datos/tienda-publica.json`.

## Formato de datos

- **Consumen** el catálogo (`CATALOGO_EQUIPO` en gm-tools.html, sin
  consumibles no equipables; `CATALOGO` en vendor-generator.html, sin
  imágenes) — se sincroniza desde `datos/catalogo.json`, **no se edita a
  mano acá**. Ver [`datos/CLAUDE.md`](../datos/CLAUDE.md).
- **gm-tools.html produce, opcionalmente**: el modal de Ítem custom tiene
  un botón "📦 Agregar al catálogo" (`agregarItemCustomAlCatalogo()`) que
  arma la entrada de catálogo directo desde el formulario (funciona con o
  sin creep elegido) y la sube a `datos/catalogo.json`, con confirmación
  explícita. No corre `importar_json.py` sola.
- **gm-tools.html** produce/consume `datos/creeps-publico.json` y lee
  `datos/tablero/*.json`.
- **vendor-generator.html** produce `datos/tienda-publica.json` (formato
  en `datos/esquema.md`), que después lee `ficha-personaje/ficha.html`.

## Dependencias con otras carpetas

- `datos/` — catálogo (indirecto, vía `herramientas/`) y todo el estado
  público de partida que estas dos herramientas leen o escriben.
- `ficha-personaje/ficha.html` — comparte el formato de tarjeta de
  tablero y de efecto/estado con gm-tools.html (código duplicado, no
  importado); lee lo que publica vendor-generator.html.
