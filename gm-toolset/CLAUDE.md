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
- **El atributo Inteligencia se renombró a Especial** (id `int` → `esp`,
  2026-09-18, mismo cambio que en la ficha): sigue siendo PdG.Mg/Res.Mt/
  Rango de Casteo de un creep, solo cambió el nombre. Creeps con datos
  viejos se convierten solos en `normalizarCreep` (`migrarCreepEspecial`/
  `migrarObjEspecial`, mismo criterio que `migrarCreepTipos`).
- **Percepción de un creep sale de Destreza** (2026-09-22, mismo cambio
  que en la ficha): quinto stat derivado de Destreza junto a Rango/PdG/
  Crítico/Parry (`CREEP_DERIVADOS_POR_ATTR.des`, `CREEP_DERIVED_STATS`).
  A diferencia de la ficha, acá no tiene botón propio — no hay pasiva de
  creep que le suba el dado — así que va como cualquier otro stat tirable
  en Acciones (`CREEP_STATS_TIRADA_IDS`) y como opción de tirada en el
  editor de habilidades de creep (`HC_STATS_SECUNDARIOS`).
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
- El panel Tablero arma tarjetas con los creeps abiertos (con números) +
  las fichas de los jugadores en vivo desde Firebase, pero **solo de
  quien tiene token puesto en el mapa publicado** (2026-09-22, a pedido
  del dueño — antes mostraba todo lo abierto, aunque no estuviera en el
  mapa todavía o fuera de otro escenario): `tableroEscucharMapaPublicado()`
  sigue `mapa/activo` y la colección de tokens que corresponda
  (`tokens` o `mapas/{id}/tokens`, mismo esquema que `vtt-hexgrid/mapa.html`)
  y arma `tableroTokensMapa` (los `fichaId` con token ahí); `renderTablero`
  filtra por eso. Acá no hace falta filtrar oculto/sigilo: el Tablero de
  gm-tools lo ve solo el GM, que ve todo. El mapa tiene su propio botón
  📋 Tablero — ver [`../vtt-hexgrid/CLAUDE.md`](../vtt-hexgrid/CLAUDE.md),
  código no compartido (duplicado a propósito, como el resto de esta
  sección).

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
  generales, con el tamaño elegido normalmente por el GM pero con tope de
  rareza en Raro — nunca Excepcional ni Legendario. El tope se aplica en
  el índice del catálogo (`indexarCatalogo(tierMax)`, vía `dentroDeTope`) y
  en los pesos de sorteo (`pesosConTope`), así que ni generar, ni
  regenerar, ni "🎲 Otro" de un ítem puntual (`rerollItem`), ni agregar a
  mano desde "+ Agregar ítems" se lo saltan — ni siquiera como último
  recurso si el rubro/tier pedido no tiene stock. `CATEGORIA_TAMANO_FIJO`
  (bloquear el select de tamaño en un valor fijo, `aplicarTamanoFijo`)
  queda armado pero sin ninguna categoría usándolo hoy.
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

**`?editar=<creep>`** (2026-09-19): al cargar, abre la ventana "Editar creep" de ese
creep. Lo usa el botón 📜 del token de un creep vinculado en el mapa.

- **Habilidades a mano en la tarjeta** (2026-09-20): la tarjeta compacta del creep
  lista sus habilidades debajo de ⚡ Acciones (`habsMiniHtml`), cada una con su
  nombre, **Ver** y **Ejecutar** (los mismos botones y reglas que las Acciones).
- **Habilidad lenta** (2026-09-20): en el paso de costo del asistente de habilidad
  de un creep, la casilla "Habilidad lenta" (`cdArranca`) hace que arranque con el
  cooldown ya activo (`cdActual = cd`, como si la hubiera usado el turno anterior):
  al crearla o marcarla, al agregar el creep desde la biblioteca y al
  **Reiniciar combate** (Turno 0). Las que no están marcadas no se tocan.

- **Catálogo base de creeps por escenario** (2026-09-20, `comun/creeps-base.js`,
  `CREEPS_BASE`): 60 creeps (más la tribu de goblins del bosque, 10 con la etiqueta `goblin`, y 20 **debuffers**, uno por escenario y nivel, con la etiqueta `debuffer`: maldiciones de Especial contra Res. Mental, veneno, confusión y control, casi todo "a mano") y **30 humanos** de seis facciones (bandidos, bárbaros, guardia de la ciudad, piratas espaciales, cultistas, mercenarios; etiqueta `humano` + la facción) con **equipo del catálogo con nombre propio** (cada arma y pieza es un clon del ítem original —mismos efectos, peso, tier y precio— renombrado según el creep que lo lleva, y existe también como ítem del catálogo: `new-<nombre>`, así que si el creep lo "suelta" se vende y se usa igual que el original; nivel 1: arma Común; 2: arma + pieza Comunes; 3: Común + Buena Calidad; 4: dos Buena Calidad; 5: Buena Calidad + Raro; el arma cuenta como un ítem). **Cada habilidad de la biblioteca trae en su descripción "⚙ Automatizado: …" (costo, cooldown, daño, cura, estado propio, con los números) y "✋ A mano: …"** (`armarDetalle` en `creeps-base.js`) — Minas, Bosques, Montañas y Templo antiguo con
  influencia alienígena × niveles 1 a 5 × 3 — todos con "(auditar)" en el nombre y
  la etiqueta `auditar`. Aparecen en "+ Creep" → biblioteca junto a lo que apruebe
  el dueño (opción `base` de `Biblioteca.abrir`), con etiquetas de escenario, nivel,
  rol y tipo. Atributos = 33 + 3 por nivel (mismo presupuesto que gm-tools) repartidos
  por rol; HP = Con × 5. Cada uno lleva **una skill rápida** (cooldown 2) y **una
  lenta** (cooldown 3 a 6, `cdArranca`: arranca el combate en cooldown). Automatizado
  por skill: costo en No2 (o "lo de un ataque"), tirada de daño (`tiradaExtra`),
  estados con bonos a sí mismo (Def, Dmg, No2, Eva, Res.Mg) y cura (`curaHp`, que
  ahora también funciona en los creeps). Los efectos sobre otros quedan escritos en la
  descripción, a mano. Se corrigió además que los **bonos de Defensa de un estado**
  cuenten en la Defensa del creep (`creepDefensaEfectiva`, y `creepDefensaMapa`).

- **Recompensas del creep y asistente paso a paso** (2026-09-20, tanda 2 de P91/P92): campos nuevos del creep
  `tipoCriatura` (+ `tipoCriaturaOtro`), `jefe`, `oroBase`, `armaNatural` y `trofeoEspecial {nombre, precio}` (defaults en
  `nuevoCreep`/`normalizarCreep`). Sección **Recompensas** en la ficha completa del creep (`recompensasHtml`) con ayudas "?"
  (oro, arma natural, trofeo) y el resumen "Al morir suelta: …" (`dropsResumenCreep`); también se ve en **Ver**.
  Reglas: oro sugerido `oroSugeridoCreep` (humano 5n²+10n = 15/40/75/120/175; humanoide la mitad a múltiplos de 5; jefe ×2;
  resto 0); trofeo `trofeoDeCreep` (arma natural → trofeo con el nombre del arma + " de " + creep, o el especial;
  precio por nivel 16/30/50/75/110, jefe ×2; despojos = ⌈precio/4⌉). Cambiar el tipo sugiere `armaNatural` y el oro.
  **🧭 Asistente** (`abrirAsistenteCreep`, estado `asist`): "+ Creep → Crear paso a paso" y "🧭 Paso a paso" en la ficha del
  creep (edita). 7 pasos (qué es, atributos con preset por rol y nivel, arma, armadura, habilidades, recompensas, resumen),
  se puede saltar a cualquier paso sin perder nada; trabaja sobre el creep real (crear lo agrega y **Cancelar** lo quita).
  Los creeps base (`creeps-base.js`) ya traen tipo, jefe, oro, arma natural y nombre de trofeo (51 con arma natural).
  Todavía **no** se usan al finalizar el combate (tandas 3 y 4).

- **Fin del combate: reporte y publicación** (2026-09-20, tanda 3 de P91): "🏁 Finalizar Combate" (`renderReporteCombate`, estado `combateRep`)
  lista **quiénes cobran** (las fichas de la partida con su estado: en pie / inconsciente / muerto según `resumen.hp` y
  `resumen.muertoDef`; el GM destilda a quien no estuvo), **XP** (por creep; escapados al 20% opcional; ajuste del GM +/−; base por jugador =
  ⌈total ÷ jugadores incluidos⌉; inconsciente ⌊25%⌋, muerto 0), **oro** (`oroDeCreep`: ±20% sobre `oroBase`, tirado UNA sola vez por creep;
  ajuste del GM; ⌈total ÷ jugadores⌉ para todos los incluidos) y **botín** (ítems que suelta cada creep derrotado con casilla para
  destildar: arma si no es natural, equipo, trofeo; más "ítem extra" a mano). Los ítems que no están en el catálogo se convierten
  a la forma de un ítem de la ficha con **precio estimado** por comparación con el catálogo (`precioEstimadoArma/Equipo`, pool de la
  rareza del nivel, + 8 por punto de bono y 40 por efecto al golpear). **🎁 Publicar recompensas** (`publicarRecompensas`) escribe
  `campanas/<id>/recompensas/{auto}` (una por personaje: `fichaId`, `duenoUid`, `xp`, `dde`, `aplicada`) y `campanas/<id>/botin/{auto}`
  (un doc por ítem: `json` con la plantilla, `tomadoPor`), deja una **línea verde** en la Mesa (`desde: 'recompensa'`, `comun/mesa.js`) y marca
  los creeps `recompensado` (no cuentan en el próximo reporte hasta "Reiniciar combate"). La **ficha** aplica cada recompensa una sola
  vez (`recompensasRevisar`, transacción sobre el doc) cuando el personaje está abierto y editable; si sube de nivel, pop-up de
  felicitación (`mostrarSubidaNivel`; el mapa lo muestra mirando el nivel del resumen de la ficha propia, `mostrarSubidaNivelMapa`).
  Reglas nuevas: `recompensas` y `botin` (hay que pegarlas). Tanda 4 hecha: el botín en la ficha ("Sumar a la mochila",
  Comparar, ranuras libres) y "Despojar".

- **Grupos de creeps, tokens automáticos y botín** (2026-09-20, tanda 4): campo `grupo` del creep (pestañas `#grupos-barra`, `grupoActivo`, `pasaGrupo`; los creeps nuevos van al grupo abierto; cambiar de grupo desde su ficha, `grupoSelectHtml`). Con un grupo abierto, **🎯 Crear tokens** (`crearTokensDelGrupo`, `comun/tokens-auto.js`) pone un token oculto por creep en fila al centro de la vista del mapa que mira el GM, salteando los que ya tienen. **🎁 Botín** (`#scrim-botin-gm`, `abrirBotinGM`): lo que nadie tomó; **🧰 Despojar** lo convierte en despojos, los reparte (hacia arriba) como recompensas y borra el botín. Modos de iframe `?modo=finalizar|botin` para abrirlos desde el mapa.

- **Catálogo de habilidades para creeps** (2026-09-20): "+ Habilidad" de un creep abre la biblioteca de `comun/skills-creep-base.js` (190 habilidades, filtros por función, velocidad, rol, raza y automatización); elegir una la agrega calculada con el nivel del creep. "+ Crear de cero" abre el asistente paso a paso de siempre.

- **Trampas y sigilo en los creeps base** (2026-09-20): se sumaron 14 creeps (ahora 134) y se cambiaron 5 habilidades lentas por trampas reales. Creeps con trampas: Goblin recolector, Kobold dinamitero/artificiero, Zapador demente, Cazador de las cumbres, Guardián de sellos y de runas, Trampero silvano/de caminos/a sueldo, Saboteador de la banda, Cazador de fosos, Vigía de patrulla, Minador de cubierta, Ballestero emboscado, Cazador bárbaro; con sigilo: Cazador furtivo, Vigía sombrío, Sicario de las sombras. Etiquetas nuevas `trampas` y `sigilo` (filtro "Mecánica").
- **Arma natural del catálogo** (2026-09-20): botón 🐾 (`data-armanat`) — ver `comun/armas-naturales-base.js`.

- **Estados sobre otros, automáticos** (2026-09-20): las habilidades con `estadoObjetivo` (57 del catálogo y varias trampas de creeps) abren, al ejecutarse, "🎯 ¿A quién le pegó?" con los tokens del mapa que mira el GM; el estado se aplica solo (creeps directo, personajes por aviso en `estados` que su ficha aplica). Ver `comun/estados-aplicar.js`.

- **Protección de jefe** (2026-09-21, P95 versión inicial): un creep marcado **Jefe** (`sc.jefe`) es **inmune a Stun** (`estaBloqueadoElDebuffCreep`, y `EstadosAplicar.bloqueadoCreep` para habilidades y trampas) y tiene **+1 Res.Mg** (`creepStatValor`, con línea en la lupa): la tirada contra los debuffs. Automático; para apagarlo, se desmarca "Jefe". No cubre Exhausto ni otros controles.

- **Grupo ↔ mapa** (2026-09-21): en la barra de grupos, un selector "🗺" vincula el grupo abierto a un mapa guardado (`gruposMapas`, `gruposMapasEscuchar`); "🎯 Crear tokens" usa ese mapa si el grupo lo tiene (si no, el que el GM está viendo). Renombrar o quitar el grupo mueve o borra el vínculo. Mismo dato que el panel de Mapas del mapa (ver `vtt-hexgrid/CLAUDE.md`). Va en `gm/gruposMapas`, que las reglas ya permiten al GM.

- **Flujo del fin de combate** (2026-09-21): **🏁 Finalizar Combate** abre el reporte que solo ve el GM ("Fin del combate — ajustá lo que van a ver los jugadores": XP, oro, ítems y trofeos). El botón **✔ Confirmar** (antes "Publicar recompensas") carga la XP y el oro en las fichas y **abre solo, a cada jugador, la ventana del botín en el mapa**. Ya no se abre el panel de Despojar después de confirmar. El botón **🧰 Despojar** (antes "🎁 Botín") queda aparte y se usa después, cuando los jugadores ya eligieron: lo que nadie tomó se convierte en despojos y se reparte.

- **"Batalla terminada"** (2026-09-21, reemplaza el flujo de arriba): **🏁 Finalizar Combate** abre, como ventana grande al centro, el reporte "⚔ Batalla terminada" que solo ve el GM: primero **lo que recibe cada jugador** (XP y DDE), después el cálculo de los creeps y los **despojos** (equipos y trofeos) para ajustar. **📢 Publicar despojos** (antes "Confirmar"; el GM revisa todo antes y recién ahí se abre a los jugadores) carga la XP y el oro y escribe `campanas/<id>/combate/actual` = `{numero, estado: 'publicado' | 'cerrado', jugadores: [{fichaId, nombre, estado, xp, dde}], items}` (`cerrado` directo si no hay ítems). Con el botín **publicado**, el botón **🎁 Despojos** (`#btn-botin`, deshabilitado el resto del tiempo) abre la misma ventana para ver qué tomó cada uno y **convertir en despojos lo que nadie tomó**; eso marca el combate como `cerrado`, cierra la ventana de todos y apaga los botones. Reglas nuevas: `combate/{doc}` (hay que pegarlas).

- **Cerrar la ventana no despoja** (2026-09-21): tras "📢 Publicar despojos" al GM se le abre la ventana de despojos (qué tomó cada uno). Cerrarla (Cerrar, ✕ o clic afuera) **no cambia nada**: el botín sigue abierto y se reabre con 🎁 Despojos. Solo el botón **🧰 Despojar lo que nadie tomó** convierte lo que quedó en despojos, marca `combate/actual` como `cerrado` y apaga los botones.

- **La XP y el oro se pagan al cerrar el botín** (2026-09-21): "📢 Publicar despojos" ya **no** carga la XP ni el DDE en las fichas si hay ítems: los deja anotados en `combate/actual.jugadores` (con `duenoUid`) y muestra la ventana a los jugadores. El último paso, el botón de la ventana de despojos del GM (**🏁 Despojar lo que nadie tomó y repartir XP y oro**, o **🏁 Cerrar botín y repartir XP y oro** si no queda nada sin tomar), crea **un solo pago por personaje** en `recompensas` con XP + DDE + su parte de los despojos, y la ficha del dueño lo aplica sola (con el pop-up de nivel si sube). Sin ítems en el botín, se paga al publicar como antes. No se puede publicar otro combate mientras haya uno sin cerrar.

- **XP y DDE por jugador, editables** (2026-09-21): en "Lo que recibe cada jugador" del reporte de la batalla, cada fila tiene su XP y su DDE como **campos numéricos**: el GM cambia directo lo que recibe ese jugador (`combateRep.manual[fichaId] = {xp?, dde?}`; `calcularReparto` usa lo fijado y, si no, el valor calculado). El campo editado se marca y **↺** vuelve al calculado. Se sacaron los "ajustes al total" de XP y de oro; el cálculo (creeps, total, base por jugador) queda como información. El diálogo de publicar lista lo de cada jugador.

- **XP y oro: un valor para todos + un extra por jugador** (2026-09-21, reemplaza la edición campo por campo de arriba): en "Lo que recibe cada jugador" hay un recuadro **Experiencia por jugador** y otro **Oro por jugador** (`combateRep.xpPorJugador` / `ddePorJugador`; vacíos = lo calculado, ↺ vuelve a eso) que se aplican a **todos** los incluidos, y cada jugador tiene sus casillas de **extra** XP y DDE (`combateRep.extra[fichaId]`, pueden ser negativos) por circunstancias particulares. Resultado por jugador = `floor(valor × factor de su estado)` + extra (el inconsciente cobra el 25% del valor, el muerto nada; el extra se suma encima; mínimo 0), mostrado como "= +N XP · +M DDE".

- **Bitácora del GM** (2026-09-21): botón **📖 Bitácora GM** en la barra superior (`#btn-gbit`, ventana `#scrim-gbit`, bloque "BITÁCORA DEL GM" antes de `toast`, prefijo `gbit`). Mismo formato que la de los jugadores (páginas con pestañas, entradas en el color de su autor con "(autor · fecha · editado por …)", Ctrl+Enter para sumar) pero **privada**: vive en `campanas/<id>/gmBitacora/<página>/entradas/<id>` y solo el GM la lee y escribe. Va en el respaldo del GM (`bitacoraGM`) y se borra con la partida. Regla nueva `gmBitacora` (hay que pegarla). El código está duplicado de `ficha.html` (bloque BITÁCORA DE LA PARTIDA), con `gbit*` en vez de `bitacora*`.

- **Mover creeps entre grupos arrastrando** (2026-09-21): cada tarjeta compacta tiene un asa **⠿** (`data-arrastrar-creep`) que se arrastra hasta la pestaña de otro grupo, o hasta **Sin grupo** (que ahora se ve siempre que haya grupos), y el creep cambia de contenedor (`sc.grupo`). "Todos" no recibe. En la vista "Todos" cada tarjeta muestra una etiqueta con su grupo (`.grupo-tag`). El selector "Grupo (escenario)" de la ficha completa sigue funcionando.

- **Más kobolds, goblins y hombres cabra** (2026-09-21, `comun/creeps-base.js`, sección "TRIBUS Y CLANES"): +14 kobolds de las minas (3/3/3/3/2 por nivel, etiquetas `kobold` y `tribu kobold`), +10 goblins del bosque (2 por nivel) y una raza nueva de **15 hombres cabra** de las montañas (3 por nivel, etiquetas `hombre cabra` y `clan cabruno`; el **Patriarca cabruno** es jefe). Cada uno con un rol distinto y mecánicas del juego distintas (sigilo, trampas con y sin daño, Espinas, Regeneración, Blindado, Escudo mágico, Inmunidad a CC, Hypeado, Afortunado, y estados sobre otros automáticos: Quemado, Veneno, Rengo, Cegado, Pajaritos, Inmovilizado, Stun, Armadura rota, Maldito). Helper nuevo `ap(sp, estado)`: una habilidad o trampa que deja un estado sobre el objetivo sin depender del nombre en `APLICA`. El filtro "Tribu" de la biblioteca de gm-tools suma las tres razas. Todos con "(auditar)", como el resto: los números son un primer borrador.

- **Ver, editar y proponer una habilidad de la biblioteca** (2026-09-21): en "+ Habilidad" cada fila tiene **👁 Ver** junto a Agregar (`alVer` → `verHabBiblioteca`, ventana `#scrim-ver-hab`): muestra la habilidad calculada con el nivel del creep (costo, cooldown, tirada, cura, estados, trampa, descripción con ⚙/✋). Desde ahí: **Agregar**, **✎ Editar** (el asistente paso a paso de siempre sobre una copia: `abrirEditorHabCreep(scId, null, {borrador, alGuardar})`, no toca al creep hasta Agregar) y **📚 Biblioteca**, que se habilita una vez editada y propone esa versión (`Biblioteca.guardar({tipo: 'habs_creep', datos: {habilidad}})`; el dueño la aprueba en la pestaña Propuestas). Una propuesta guarda la habilidad ya calculada (`datos.habilidad`, valores fijos: `armarHabilidadDeCreep` la copia sin escalar). Reglas: se sumó `habs_creep` a las listas de `biblioteca_*`/`propuestas_*` (hay que pegarlas).

- **El aviso ⚙/✋ no va a la Mesa** (2026-09-21): la descripción de las habilidades del catálogo termina con "⚙ Automatizado: … ✋ A mano: …", que es información para el GM. `habPartes(h)` separa la descripción, lo automatizado y lo que se resuelve a mano, y `habTextoMesa(h)` arma lo que se publica en la Mesa al ejecutar una habilidad (`mesaConTexto` y `mesaPublicarHabilidadCreep`): solo lo que hace la habilidad (descripción + lo que va a mano, que también es efecto), sin el aviso. Funciona sobre el texto, así que cubre también los creeps ya guardados. En Ver (`#scrim-ver-hab`) el aviso sale en secciones aparte solo para el GM; el editor y las otras tarjetas siguen mostrando el texto completo.

- **Ver un creep de la biblioteca: Agregar, ✎ Editar y 📚 Biblioteca; y lo mismo en cada habilidad** (2026-09-21): la ventana "Ver" de un creep del pool (`verCreepDeBiblioteca`, `#scrim-view`) tiene pie con **Agregar** (lo suma a la mesa, como antes desde la lista), **✎ Editar** (la ficha completa de siempre sobre una copia) y **📚 Biblioteca** (propone esa versión con `guardarCreepEnBiblioteca`; se habilita recién cuando se editó algo). La copia es un **borrador**: vive en `S.creeps` marcada `_borrador` mientras la ventana está abierta, para reusar los editores, y se descarta al cerrar; `creepsReales()` la deja afuera de la grilla, el Tablero, el Mantenimiento, el conteo de grupos y el guardado en Firebase (usar `creepsReales()` y no `S.creeps` en todo lo que muestre o guarde creeps de la mesa). Mientras se edita el creep, la ventana Ver y la lista de la biblioteca se esconden y vuelven al cerrar la ficha (`volverAVerCreepBib`). Cada habilidad de la lista tiene **👁 Ver** (`verHabDeCreep`, la misma tarjeta que en "+ Habilidad" pero sin Agregar), **✎ Editar** (`editarHabDeCreepBib`, el editor de habilidad por encima: `opc.encima`) y **📚 Biblioteca** (`proponerHabilidadABiblioteca`, habilitado tras editarla). Capas: lista 80, Ver creep 93, Ver habilidad `#scrim-ver-habbib` 94, editor de habilidad 96, toast 120. Ojo: `#scrim-ver-hab` / `verhab-*` son de las Acciones del creep; la tarjeta de la biblioteca usa `verhabbib-*`.

- **Pajaritos ya afecta a los creeps** (2026-09-22, arreglo de P101): `mitadPdgEva:true` en el preset (`ESTADOS_PRESET_GM` y `comun/estados-aplicar.js`) y en `FLAGS_ESTADO_CREEP`; `creepStatValor` lo aplica a PdG y Evasión (mismo `floor(v/2)` que Lisiado a PdG/Parry — independientes, se pueden apilar). Se refleja en `statOrigenTxt` y en la lupa de las Acciones.

- **Arreglo: los grupos de creeps se filtraban entre partidas** (2026-09-22, bug real reportado por el dueño): `gm-grupo-activo` y `gm-grupos-extra` (la pestaña abierta y los grupos vacíos creados con "＋ Grupo") vivían en `localStorage` **sin el sufijo de partida** — un grupo vacío armado en una partida aparecía como pestaña en cualquier otra partida abierta en el mismo navegador (los creeps en sí nunca se mezclaron: `sc.grupo` es un campo del creep, que ya vive correctamente bajo `campanas/{id}/creeps`). Ahora las claves llevan `-${FB_CAMPANA}`, mismo patrón que `gbit-activa-`/`bitacora-activa-`. Efecto secundario esperado: un grupo vacío armado *antes* de este arreglo no aparece más (la clave vieja queda huérfana a propósito, para no seguir arrastrando la mezcla) — se recrea con un clic en "＋ Grupo". Se revisó también `mapa-viendo` (vtt-hexgrid/mapa.html): ese sí es seguro, `recalcularMapaMostrado` descarta cualquier id que no esté en la lista de mapas de la partida actual.

- **Qué pasa al "↺ Reiniciar combate"** (2026-09-22, regla dicha por el dueño; `reiniciarCombate()`): además de volver el contador a Turno 0, para cada creep de la mesa — **los cooldowns de sus habilidades vuelven a 0**, salvo las marcadas **"habilidad lenta"** (`cdArranca`), que arrancan el combate nuevo con el cooldown ya activo (`cdActual = cd`, como si la hubieran usado el turno anterior — antes esto era lo único que tocaba el reinicio; las no-lenta con un cooldown a mitad de cuenta se quedaban así, sin resetear, hasta ahora); **los Nitros se recargan a full** (`sc.nitros = creepNitrosMax(sc)`, mismo cálculo que Mantenimiento); y se **restablece la niebla de guerra del mapa publicado** (`nieblaReiniciarDesdeGM`, mismo dato que "↺ Restablecer niebla" del mapa — `mapa/niebla` o `mapas/{id}/estado/niebla` según cuál esté publicado en `mapa/activo`, `descubiertas: []`; mejor esfuerzo, si falla solo queda en la consola, no corta el resto). No toca los Nitros de los personajes de los jugadores — eso lo sigue cubriendo Mantenimiento, que el GM dispara aparte.

- **Ejecutar una habilidad tira la primera tirada; la segunda va con 🎲** (2026-09-24, pedido del dueño): al apretar Ejecutar se tira **solo el stat vinculado** (`tiradaStat`: PdG, PdG.Mg u otro) o, si la habilidad no tiene stat, la fórmula (`tiradaExtra`). Si tiene las dos, la fórmula (el daño o el efecto) queda para un botón **🎲 <fórmula>** al lado de Ejecutar, como Atacar → Daño en las armas (`tirarPrimeraDeHab`/`tirarSegundaDeHab`; en gm-tools `tirarExtraDeHab`/`tirarSegundaDeHab` y `botonSegundaHabCreep`; en invocaciones `tirarExtraDeHabInv`/`tirarSegundaDeHabInv`). Las habilidades de creep armadas por el programa que tiran daño ahora traen `tiradaStat` = `'pdg'` (o `'pdgmg'` si son mágicas: rol mágico de la biblioteca o palabras como mágico/arcano/rayo/fuego/hielo en el nombre o la descripción, `esHabMagica` en `comun/creeps-base.js`); a las ya guardadas se les agrega al cargar el creep (`migrarHabPdg`, solo las que dicen "tira … de daño" y no tienen stat). Es un punto de partida: se puede cambiar el stat en el editor de la habilidad.

- **📜 Historial y reporte del Mantenimiento de creeps** (2026-09-24): `mantenimiento()` arma por cada creep un reporte (daño/cura de cada estado, turnos "3 → 2", estados que se terminan, escudo mágico recargado) y lo manda al 📜 Historial del GM (`historialReporteMantenimiento`, `comun/historial.js`) — a la Mesa NO, porque el HP de los creeps es secreto. Además un `setInterval` de 1 s le pasa a `historialObservarCreeps` la lista de creeps (`creepsReales()`) para que anote cambios de HP y de estados.

- **Los presets de estados alterados preguntan sus cantidades** (2026-09-24, pedido del dueño): al activar un preset estándar (ficha: "+ Estado" y estado de una invocación; gm-tools: estado de un creep, y desde el mapa que abre esas mismas ventanas), en vez de crear el estado con números fijos aparece un cartelito que pregunta de a una: **cuánto HP** (cura o daña por turno), **cuántos HP tiene el escudo**, **cuántos stacks**, **cuánto suma o resta cada bono** y por último **cuántos turnos dura** — con un tilde **"Sin límite (no vence)"** (viene tildado en los que eran permanentes, como Veneno severo o Sigilo, y se destilda para poner turnos). Lo hace `comun/estado-preguntas.js` (`EstadoPreguntas.pedir(preset, cfg)`; `cfg.hp` es `hpturno` en la ficha y `hpTurno` en gm-tools). Los presets siguen definiendo el efecto; los detalles ya no llevan números. Sangrado guarda "N de daño" como N stacks de 1 HP (así sigue sumando de a 1). Armadura rota no pregunta el bono (−1 por acumulación es la regla). Los "Mis presets" (propios) se aplican directo con sus números. Las tarjetas del selector muestran "HP: a elegir", "Turnos: a elegir", etc.
- **"Escudo mágico" pasó a llamarse "Escudo especial"** (2026-09-24): preset, habilidades de creep que lo aplican y textos del editor y de la Mesa. Los estados viejos con el nombre anterior siguen andando (`alias: ['Escudo mágico']` en el preset, `presetPorNombre`). Los ítems del catálogo (Pergamino/Poción de Escudo Mágico) conservan su nombre por ahora.

- **Cooldowns a mano** (2026-09-24, pedido del dueño): al lado de Ejecutar, en las tres vistas de las habilidades de un creep (tarjeta `habsMiniHtml`, ventana de Acciones `filaHab`, editor de habilidades), el GM ve **− CD n +** y, con cooldown activo, **↺**: sube o baja los turnos que le quedan a esa habilidad (`h.cdActual`, 0 a 99) o lo resetea (`cdControlesHtml`, `data-cdmod`). Sirve para deshacer una ejecución de prueba o forzar un cooldown. No devuelve los No2 gastados.
