# Esquema de datos compartido

Documenta los formatos JSON que más de una herramienta lee o escribe.
No es exhaustivo: para el detalle completo de un campo, la fuente de verdad
siempre es el código (`SCHEMA`/`DEFAULT` en `ficha-personaje/ficha.html`,
`nuevoCreep()` en `gm-toolset/gm-tools.html`).

## Ítem de catálogo — `datos/catalogo.json`

El formato central: lo produce `datos/catalogo-editor.html` o
`assets/catalogo.xlsx`, y de ahí lo consumen (con distinto recorte cada
una) `ficha-personaje/ficha.html`, `gm-toolset/gm-tools.html` y
`gm-toolset/vendor-generator.html`. Ver [`herramientas/catalogo_comun.py`](../herramientas/catalogo_comun.py)
para la lógica de corrección/escritura.

```jsonc
{
  "id": "cat-espada-larga",       // estable; si cambia, se trata como ítem nuevo
  "nombre": "Espada larga",
  "tier": "Buena Calidad",        // Común · Buena Calidad · Raro · Excepcional · Legendario
  "imagen": "data:image/...",     // base64, opcional — solo ficha.html la conserva
  "tipoItem": "arma_1m",          // ver lista de categorías más abajo
  "peso": 1,                      // en armas, además: cantidad de dados de daño
  "ranuras": 1,                   // ranuras que ocupa en la mochila si no está equipado
  "precioCompra": 90,

  // Solo si tipoItem empieza con "arma_":
  "tipoDado": 4,                  // 2, 4, 6, 8 o 10
  "danoFijo": 0,
  "danoAmplificado": 0,           // dados extra sin sumar peso (2 + amplificado = dados totales)
  "armaDeRango": false,           // si true, el botón Daño Arma no le suma el stat Dmg

  // Solo si tipoItem === "consumibles":
  "consumible": true,
  "unidades": 1,
  "cargaMax": 0,                  // usos por unidad, si aplica
  "curahp": 0,                    // HP al consumir (negativo = daña)
  "curabonosPct": 0,
  "efectoNombre": "",             // si tiene nombre, consumirlo activa/refresca ese estado
  "efectoTurnos": 0, "efectoHpTurno": 0, "efectoPermanente": false,
  "efectoDetalle": "", "efectoMods": [],

  // Si NO es consumible (equipo que se puede llevar puesto):
  "equipoEstadoNombre": "",       // estado que se activa solo al equiparlo
  "equipoEstadoHpTurno": 0, "equipoEstadoDetalle": "",
  "equipoEstadoPreset": "",       // opcional: nombre EXACTO de un preset de EFECTOS_PRESET
                                   // (Afortunado, Sangre pura, etc.) cuya mecánica real hereda
                                   // el estado de equipo, sin importar qué diga equipoEstadoNombre.
                                   // Vacío = el estado es solo un cartel (recordatorio manual).

  "legacy": false,                // cuenta para el piso de ítems clásicos del Alquimista
  "mods": [{"stat": "pdg", "val": 1}],  // se suman al stat mientras esté equipado
  "detalle": "Texto que lee el jugador"
}
```

**Categorías válidas de `tipoItem`**: `arma_1m`, `arma_2m`, `escudo_1m`,
`escudo_2m`, `armadura_blanda`, `armadura_rigida`, `cabeza`, `manos`,
`piernas`, `pies`, `cinturon`, `anillos`, `otros`, `consumibles`.
Armadura sigue separada en blanda/rígida (dos slots de equipo
distintos); cabeza/manos/piernas/pies fusionaron sus versiones
"blanda" y "rígida" en una sola categoría con un solo slot de equipo
cada una (ver `SLOT_DEFS` en ficha.html).

**Stats válidos en `mods`/`efectoMods`** (si no está en esta lista, el
importador lo descarta): `con`, `fue`, `agl`, `des`, `int`, `def`, `dmg`,
`bloqueo`, `eva`, `ini`, `mov`, `rng`, `pdg`, `crit`, `parry`, `pdgmg`,
`resm`, `bonos`, `rangocasteo`, `rescc`, `hpmax`, `crgmax`, `accionesmax`,
`tipo1`..`tipo5` (resistencia a crítico por tipo de dado de arma).

**Qué recorta cada consumidor:**
- `ficha-personaje/ficha.html` — copia completa, con imagen.
- `gm-toolset/vendor-generator.html` — igual, sin imagen (pesa demasiado
  para un catálogo de tienda).
- `gm-toolset/gm-tools.html` — solo equipo (no consumibles no
  equipables), formato propio (`CATALOGO_EQUIPO`) con la `def` de los
  mods separada del resto.

## Efecto / estado alterado

Mismo concepto, dos implementaciones paralelas — el efecto que la ficha
aplica a un personaje (`S.efectos`, en `ficha-personaje/ficha.html`) y el
que el GM aplica a un creep (`estados` en `gm-toolset/gm-tools.html`) usan
la misma forma:

```jsonc
{
  "id": "...", "nombre": "Veneno",
  "activo": true, "permanente": false,
  "turnos": 4, "stacks": 4, "stacksturno": -1, "hpturno": -1,
  "polaridad": "debuff",           // "buff" | "debuff" — heredado del preset al aplicarse
  "esCC": false, "esVeneno": true, "esSangrado": false,  // tags de inmunidad
  "mods": [{"stat": "fue", "val": -1}],
  "detalle": "Pierde 1 HP por stack cada turno.",
  "popup": false
}
```

Los presets (`EFECTOS_PRESET` en ficha.html, `ESTADOS_PRESET_GM` en
gm-tools.html) están duplicados a mano entre los dos archivos — no hay
sincronización automática entre ellos todavía. Si agregás un estado nuevo,
sumalo en los dos lados.

## Tarjeta de tablero — lo que arma cada uno para el panel de combate

`ficha-personaje/ficha.html` (`armarTarjetaTablero()`, sube a
`datos/tablero/<slug>.json`) y `gm-toolset/gm-tools.html` (arma la lista de
creeps al vuelo, no la sube a ningún lado) producen la misma forma, que
`tableroCardHtml()` — duplicada en ambos archivos — sabe renderizar:

```jsonc
{
  "tipo": "pj",                    // "pj" | "creep"
  "nombre": "Aurelio Tinto", "nivel": 4, "imagen": "data:...",
  "hp": 12, "hpMax": 20,
  "muerto": false,                 // o "derrotado" para creeps
  "estados": [{"nombre": "Veneno", "turnos": 3, "permanente": false, "detalle": "..."}],
  "actualizado": "2026-08-14T..."
}
```

## Personaje — `datos/personajes/*.json`

Formato completo de `S` en `ficha-personaje/ficha.html`: `meta` (nombre,
raza, clase, nivel...), `attrs` (con/fue/agl/des/int base), `formulas`
(cómo se derivan los stats secundarios desde los atributos), `inventario`/
`cinturon`/`equipo` (ítems propios del personaje — no confundir con el
catálogo: estos son instancias, cada uno puede tener mods propios, estar
equipado, etc.), `efectos` (ver arriba), `habilidades`/`pasivas`/
`sociales`, `bitacora`, `log`. Ver `DEFAULT` en el código para la lista
completa — es el único lugar que no se desactualiza solo.

## Creep — estado en memoria de `gm-toolset/gm-tools.html`

Estructuralmente análogo al personaje pero más simple: `attrs` planos
(con/fue/agl/des/int), un arma única (`armaTipo`/`armaPeso`/`armaFijo`/
`armaAmplificado`/`armaDeRango`, mismo significado que en el catálogo),
`equipo` (ítems tomados del catálogo), `estados` (ver arriba),
`habilidades`. No se persiste como archivo individual — vive en el
`gm-creeps.json` que baja "Guardar todo" (nunca se sube al repo) y en el
`datos/creeps-publico.json` recortado que sí se publica.

## Tienda publicada — `datos/tienda-publica.json`

La arma `gm-toolset/vendor-generator.html`, la lee
`ficha-personaje/ficha.html` (botón Vendedor):

```jsonc
{
  "nombre": "Vendedor ambulante",   // editable, con default automático por tamaño/rubro
  "tamano": "ambulante", "tamanoLabel": "Vendedor ambulante",
  "categoria": "ramos", "categoriaLabel": "Ramos generales",
  "ajustePrecio": 0,                // % de descuento/recargo sobre el catálogo
  "garantizados": ["cat-ankh", ...],// ids del stock fijo
  "items": ["cat-ankh", "new-daga", ...],  // ids de todo lo que se vende, catálogo incluido
  "generado": "2026-08-14T..."
}
```

Solo guarda ids — el nombre, la imagen y los stats de cada ítem salen del
catálogo embebido en la ficha, no viajan en este archivo.

## Manual del jugador — `datos/reglas.json`

Estructura independiente, no comparte forma con lo anterior (es contenido
de texto, no datos de partida):

```jsonc
{
  "titulo": "Manual del jugador — Piratas en el espacio",
  "actualizado": "2026-08-14T...",
  "capitulos": [
    {"id": "...", "titulo": "Combate", "secciones": [
      {"id": "...", "titulo": "Cómo funciona el daño", "contenido": "texto plano..."}
    ]}
  ]
}
```

`contenido` es texto plano: línea en blanco separa párrafos, una línea que
empieza con `"- "` se renderiza como ítem de lista. Ver
`manual-usuario/CLAUDE.md`.
