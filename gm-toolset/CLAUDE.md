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

En desarrollo activo, las dos — `gm-tools.html` es de los archivos que más
cambia; antes de un cambio grande ahí, `git status`/`git log` para ver si
hay trabajo reciente o en curso de otra conversación (ver
[`../CLAUDE.md`](../CLAUDE.md)).

## Lógica principal

### gm-tools.html
- Estado en memoria: `S.creeps[]`, cada uno con la forma de `nuevoCreep()`
  (ver [`datos/esquema.md`](../datos/esquema.md), sección "Creep").
- `creepStatValor()`/`mantenimiento()` son el equivalente de `compute()`
  de la ficha: ahí se aplican los mods de equipo/estados a los stats
  finales de cada creep, incluyendo las mismas inmunidades/interceptores
  de daño (Invulnerable, Escudo mágico, etc.) espejados desde la ficha.
- **En vivo con Firebase** (rama `nueva-version`, bloque "CREEPS EN VIVO"
  al final del script): si se entró a la mesa como GM, los creeps y el
  turno se cargan de `campanas/{id}/creeps` y se guardan solos (ver
  [`docs/workflow-firebase.md`](../docs/workflow-firebase.md)). Ya no hay
  "Subir datos". Si entra un jugador, no se guarda nada. Los "personajes
  del GM" (PNJ aliados, etc.) se manejan como creeps.
- **Nitros (No2)** en lugar de Acciones (bloque `IT2_CREEP`, mismas reglas
  que el `IT2` de la ficha): máximo = Agilidad efectiva + mods de `nitros`
  (los viejos `mov`/`accionesmax` cuentan como No2), topeado por
  `forzarNitros` de Stun/Exhausto (`creepNitrosMax`). `sc.nitros` es lo que
  queda y se recarga en `mantenimiento()`. El botón ⚡ Acciones cobra: atacar
  Tipo ÷ 2 el primer ataque del turno y Tipo completo después
  (`sc.ataquesTurno`), habilidades `nitrosCosto` (1 por defecto) + su CD.
  **🔍 Lupa en las Acciones** (cuadro y estilos en `../comun/lupa.js`; acá
  solo el contenido: `lupaContenido` → `lupaHtmlCreep`, claves `data-lupa="creep|tipo|ref"`):
  cada botón muestra el desglose de la tirada (atributo, mods con origen,
  Lisiado, dados) y su costo en No2; Atacar sin No2 no se deshabilita (avisa
  al tocarlo) para que la 🔍 siga abriendo. Los creeps tienen una sola arma.
  Moverse lo cobra el mapa al arrastrar el token del creep (ya no hay
  habilidad Movimiento). Los creeps viejos se convierten solos en
  `normalizarCreep` (Acciones → No2; toda habilidad llamada Movimiento se
  saca siempre).
- **No2 sigue a la Agilidad** (`actualizarNo2PorAgl`, mismo criterio que
  `actualizarHpMaxPorCon` para Con→Hp): al cambiar Agilidad en el editor de
  un creep, si No2 estaba lleno sube con el nuevo máximo; si no, solo se
  recorta si ahora pasa el nuevo (menor) máximo. Si `sc.nitros` todavía es
  `null` (no solidificado) no se toca, sigue el máximo solo.
- **Escala de Tipos +2**: Tipos de arma 4/6/8/10/12 (`DADOS_ARMA`, default
  8); `crit[0..4]` y `tipo1..tipo5` son la resistencia a Tipo 4..12. Un
  creep sin `escalaTipos: 2` es de antes y `normalizarCreep` lo corre +2
  una vez (`migrarCreepTipos`: `armaTipo`, equipo y textos). `nuevoCreep()`
  trae la marca, así que los creeps guardados se vuelcan sobre
  `creepBaseGuardado()` (sin marca) para no heredarla. En
  vendor-generator.html, `migrarItemTipos` hace lo mismo con los ítems
  creados a mano que vienen en `itemsDatos`.
- **Botones**: barra superior `.accesos` con botones chicos, como la ficha
  (Mapa, Vendedor, 👥 Personajes, Tablero, Historial, Reiniciar combate,
  Catálogo, Respaldo partida, Cargar respaldo); la cabecera deja
  Mantenimiento, + Creep, + Creep con IA y Finalizar Combate. Ya no hay
  botón Inicio (lo reemplaza el menú ☰, `../comun/menu-sitio.js`).
  Personajes (`renderListaPersonajes`) lee `fichas` y `miembros` al abrir
  la lista y abre cada ficha en otra pestaña; cada fila tiene un ✕ para
  que el GM borre ese personaje (`borrarPersonajeGM`: confirmar + escribir
  el nombre, borra la ficha con sus partes y los tokens que la usan, tanto
  en el mapa de siempre como en cualquier otro mapa guardado — ver
  [`../docs/workflow-firebase.md`](../docs/workflow-firebase.md)). Sin
  botón Dados (la tirada libre está en la Mesa), token de GitHub ni
  Guardar copia (lo cubre
  Respaldo partida, que incluye los creeps completos). "Cargar respaldo" usa
  `#file-input`: acepta un respaldo de la partida o un `gm-creeps.json`.
- **Barra superior unificada** (`../comun/barra.js`, `barraTexto()`, sin
  personaje acá): la etiqueta `#gm-identidad` ("⚔ GM Tools · Partida ·
  Usuario · GM") reemplaza al "GM Tools" fijo de antes, se actualiza en
  `gmAlEntrar()`. El link a Vendedor ahora sí lleva `?partida=` (antes no
  la llevaba).
- **Habilidades de creeps paso a paso** (`PASOS_HAB_CREEP`, `hcMostrarPaso`,
  `#scrim-hab-creep`): "+ Habilidad" y el ✎ abren el mismo asistente que la
  ficha, adaptado: qué es → costo (No2: un número o `nitrosCosto: "ATAQUE"`,
  lo mismo que un ataque del creep — `habCreepAtaque`, `costoHabCreepTxt` —,
  que cuenta como ese ataque en `sc.ataquesTurno` y deja PdG como tirada por
  defecto; cooldown, otro costo) → tirada
  (stat del creep con `creepStatValor` y/o fórmula; `habCreepTira`, `tirarExtraDeHab`) → estado (preset o a mano) → resumen. La habilidad nueva recién
  se agrega al creep al guardar.
- **Ítems paso a paso** (`comun/asistente-item.js`): el ✎ del arma de un
  creep (`abrirEditorArmaCreep`, categoría fija) y "✎ Ítem custom"
  (`abrirItemCustomGM`: cualquier categoría menos consumibles, a qué creep,
  tier y precio; "Crear y equipar" y/o "📦 Agregar al catálogo" vía
  `publicarEnCatalogoGM`) usan el asistente compartido, con los números del
  creep (`portadorCreep`). Un arma reemplaza la del creep
  (`ponerArmaEnCreep`); el resto va a `sc.equipo` (`ponerEquipoEnCreep`).
  Los bonos del arma van en `sc.armaMods` y cuentan con los del equipo
  (`fuentesEquipoCreep`); sus efectos al golpear, en `sc.armaEfectos`.
- **Efectos al golpear** (`efectosAlPegarCreep`): el Daño del creep los
  dispara (pop-up si tienen porcentaje) y la Mesa los muestra resaltados
  (`desde: 'efecto-gm'`, nombre del creep en rojo).
- **Stats secundarios** (`CREEP_DERIVADOS_POR_ATTR`, `derivadosHtml`): los
  mismos que un PJ salvo Hp.Max/No2 (ya se ven arriba) y Crg.Max/SP (no
  aplican), debajo de cada atributo en el editor y en Ver, con el origen al
  pasar el mouse (`statOrigenTxt`). Se calculan con `creepStatValor`.
- **Tarjetas y edición**: la grilla muestra siempre la tarjeta compacta
  (`cardCompactoHtml`). El lápiz abre la ficha completa (`cardHtml`) en la
  ventana `#scrim-editar-creep` (`abrirEditarCreep`/`renderEditarCreep`,
  que se redibuja en cada `renderAll` conservando scroll y foco). Esa
  ventana va una capa debajo (z-index 79) de las que se abren desde ella;
  Escape cierra solo la de más arriba.
- "Cargar respaldo" reemplaza todos los creeps de la mesa por los del
  archivo (con confirmación).
- El panel Tablero (mismo diseño que en la ficha, código duplicado)
  arma tarjetas con los creeps abiertos (con números) + las fichas de los
  jugadores en vivo desde Firebase.

### vendor-generator.html
- **Barra superior unificada** (`../comun/barra.js`): `#tienda-identidad`
  ("🏪 Generador de tiendas · Partida · Usuario · GM") reemplaza al
  "Rol Pintoísta" fijo de antes. A la derecha, links a 🗺 Mapa y ⚔ GM
  Tools (ya no hay "⌂ Partida", lo reemplaza el menú ☰).
- `generarTienda(tamano, categoria)` sortea el stock según los pesos de
  rareza de cada tamaño (`TAMANOS`) y el reparto por categoría
  (`REPARTO_POR_CATEGORIA`: Ramos generales / Alquimista / Herrero / Inicio
  de partida). Alquimista tiene un piso de 40% de ítems "legacy", con el
  tamaño topeado si no hay suficientes legacy disponibles para sostenerlo.
- **Categorías con reglas fijas** (`CATEGORIA_TAMANO_FIJO`,
  `CATEGORIA_TIER_MAX`): Inicio de partida usa el reparto de Ramos
  generales pero con tamaño fijo en Aldea (el select se bloquea ahí,
  `aplicarTamanoFijo`) y tope de rareza en Raro — nunca Excepcional ni
  Legendario. El tope se aplica en el índice del catálogo
  (`indexarCatalogo(tierMax)`, vía `dentroDeTope`) y en los pesos de
  sorteo (`pesosConTope`), así que ni generar, ni regenerar, ni "🎲 Otro"
  de un ítem puntual (`rerollItem`) se lo saltan — ni siquiera como último
  recurso si el rubro/tier pedido no tiene stock.
- "+ Crear ítem nuevo" abre el asistente compartido `comun/asistente-item.js`
  (`abrirItemNuevo`), con tier, descripción narrativa, precio (con el ajuste
  de la tienda), ranuras y estado al equipar; guarda con `agregarItemCreado`.
  Los consumibles van al formulario (`abrirItemNuevoFormulario`); si ahí se
  elige otra categoría, vuelve al asistente.
- "🎲 Otro" en cada tarjeta (`rerollItem()`) cambia ese ítem por otro del
  mismo rubro que no esté en la tienda, tirando la rareza con la tabla del
  tamaño (en una tienda personalizada, misma rareza). El stock fijo no se
  rerolea.
- **En vivo con Firebase** (bloque "Tienda en vivo" al final del script):
  solo para el GM. La tienda que se arma se guarda sola en
  `campanas/{id}/tienda/borrador`; "Publicar tienda" la copia a
  `tienda/publicada`, que es la que abren los jugadores desde la ficha, y
  "Cerrar tienda" la borra. Los ítems creados a mano viajan dentro de la
  tienda (`itemsDatos`): ya no se suben a `datos/catalogo.json`. Ver
  [`docs/workflow-firebase.md`](../docs/workflow-firebase.md). Ya no hay
  token ni botones de GitHub.
- **Tiendas guardadas** (bloque "Tiendas guardadas"): `campanas/{id}/tiendas`,
  una por lugar al que se vuelve. La tienda abierta recuerda de cuál salió
  (`tiendaActual.guardadaId`); guardar es a mano y, si hay cambios sin
  guardar, se pide confirmación antes de reemplazarla. "Generar tienda"
  arma una nueva (sin nombre ni lugar en la lista); "Regenerar" vuelve a
  sortear el stock de la abierta conservando nombre, ajuste de precios y
  lugar en la lista.

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
- **vendor-generator.html** produce `campanas/{id}/tienda/publicada` en
  Firebase, que después lee `ficha-personaje/ficha.html` (botón Vendedor).
  `datos/tienda-publica.json` es de la versión vieja y ya no se usa.

## Dependencias con otras carpetas

- `datos/` — catálogo (indirecto, vía `herramientas/`) y todo el estado
  público de partida que estas dos herramientas leen o escriben.
- `ficha-personaje/ficha.html` — comparte el formato de tarjeta de
  tablero y de efecto/estado con gm-tools.html (código duplicado, no
  importado); lee lo que publica vendor-generator.html.
