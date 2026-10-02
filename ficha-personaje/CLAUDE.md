# ficha-personaje/

## Qué es

La ficha de personaje interactiva: atributos, combate, inventario, catálogo de compra, habilidades, bitácora.

**Desde el 2026-09-30 está partida en archivos** (paso 5 nivel A, `../docs/plan-paso5.md`): `ficha.html` es solo la
pantalla (~900 líneas) y carga, en este orden, `ficha.css` (los estilos) y los 14 tramos de su código en `js/`:
`01-modelo-y-reglas` (DEFAULT, No2/SP, escala de Tipos, cálculo, durabilidad) · `02-recompensas-estados-y-atributos`
(recompensas, estados recibidos, atributos, sigilo, sentado, habilidades en el duelo, Re-Roll) · `03-tiradas` (tiradas,
polilla, percepción) · `04-invocaciones` · `05-estados-y-botonera` (estados alterados, inventario, `renderBotonera`,
`renderAll`) · `06-cajas-y-carga` (cajas de vida/SP/DDE/XP, colapsables, `aplicarFicha`) · `07-editor-y-catalogo` (editor
genérico, presets, `toast`) · `08-equipo-botin-y-mesa-comun` · `09-inventario-y-tienda` (sin No2, slot lleno, tienda,
vender, reparar) · `10-habilidades-pasivas-e-items` (+ Habilidad, + Pasiva, editores, trampa, asistente de ítems) ·
`11-combate` (Mantenimiento, atacar, Parry/Bloqueo, lupa, ejecutar habilidades, revivir) · `12-en-vivo` (Firebase:
guardado, control, abrir, personajes) · `13-bitacora` · `14-modo-botonera` (dentro del mapa, Mantenimiento del GM y el
arranque). **Son el mismo programa de antes, en el mismo orden**: comparten las variables globales (`S`, `fichaVivo`…).
Cuidados: una línea que se ejecuta **al cargar** (no adentro de una función) solo puede usar funciones de su archivo o de
los anteriores — por eso el primer `renderAll()` está al final de `14-modo-botonera.js`; cada archivo lleva su `?v=` en
`ficha.html` y se sube solo el del que cambia. Para una copia de prueba sin sesión: copiar `js/14-modo-botonera.js` sin la
línea `mesaIniciar(fbAlEntrar);` y apuntar a esa copia desde una copia de `ficha.html`.

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
  de Especial, fórmula `esp*3`; `S.spGastado`, **no** se recarga entero
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
  (`migrarEstadoIt2`, corre en `renderAll`). Las invocaciones tienen su
  propio No2 (ver "Invocaciones" más abajo).
- **El atributo Inteligencia se renombró a Especial** (id `int` → `esp`,
  2026-09-18): mismo stat de siempre (SP, PdG.Mg, Res.Mt, Rango de Casteo),
  solo cambió el nombre — para liberarlo y reusarlo en otra cosa. Fichas,
  catálogo (propio y compartido) y creeps de gm-tools con datos viejos se
  convierten solos al abrir (`migrarEstadoEspecial`/`migrarObjEspecial` acá,
  `migrarCreepEspecial`/`migrarObjEspecial` en gm-tools — mismo criterio que
  `migrarEstadoIt2`: corre en cada `renderAll`, no hace nada si ya está
  migrado).
- **Inteligencia (el nombre nuevo) — presupuesto para habilidades
  sociales**: no es de los cinco atributos que se reparten — se calcula
  sola (`inteligenciaValor`): 6 al crear el personaje, +3 por nivel. Ocupa
  en la ficha el lugar donde antes estaba el contador "WildCards" (que se
  sacó del todo). Funciona como el presupuesto de Job (`jobBudget`): el
  total no baja, `inteligenciaBudget()` resta lo ya invertido
  (`resto = total - gastado`); el contador (`#c-inteligencia`) muestra el
  `resto` y, al pasar el mouse, en qué habilidad social se invirtió cada
  punto (`renderInteligencia`).
- **Habilidades sociales con nivel**: cada una tiene `puntosInt`
  (Inteligencia invertida) y `nivelExtra` (subidas por sacar una tirada
  máxima, sin costo) — `nivel = puntosInt + nivelExtra`
  (`nivelSocial`), dado = nivel × 2 caras (`dadoCarasSocial`; nivel 0 =
  sin dado). La tirada es siempre `1d(nivel×2) + Inteligencia sin
  invertir` —`inteligenciaBudget().resto`, no el total— (`formulaSocial`,
  `tirarSocial`); ya no se escribe un dado a mano (se sacó `dado` de
  `SCHEMA.sociales.campos`).
  El botón "+ Nivel" de cada una (`abrirNivelSocial`, modal
  `#scrim-nivel-social`) ofrece "por Inteligencia" (elegís cuántos puntos,
  se descuentan del presupuesto — `nivelarSocialPorInteligencia`) o "por
  tirada máxima" (+1 nivel gratis — `nivelarSocialPorTiradaMaxima`). Con
  nivel están también en la Botonera (`filaSocialBotonera`, con su 🔍
  `social:<id>`): en modo combate van al final, en modo narrativo arriba
  de todo (`modoMapa`, escuchado en vivo de `mapa/modo` con
  `modoMapaEscuchar` — mismo dato que usa el mapa para su switch
  narrativo/combate).
- **Percepción sale de Destreza** (2026-09-22, antes salía directo del
  Especial): es un stat derivado más de Destreza (`GRUPOS`, junto a
  Rng/PdG/Crit/Parry, fórmula por defecto `des`), pero con su propio botón
  dedicado en vez del genérico — `tirarPercepcion()` usa
  `compute().final.percepcion` y no aparece con 🎲 en la tarjeta de
  Atributos (no está en `STATS_SIN_TIRADA`, simplemente su fila de
  Destreza es una más; el botón vive aparte, arriba de Combate en la
  Botonera). La pasiva "Percepción aumentada" sigue subiendo un escalón
  cada dado (`PERCEPCION_DADO_SUBE`) sin importar de qué atributo salga el
  valor. Mismo cambio en gm-tools (`CREEP_DERIVADOS_POR_ATTR`/
  `CREEP_DERIVED_STATS`, ver [`../gm-toolset/CLAUDE.md`](../gm-toolset/CLAUDE.md))
  y en el catálogo (`percepcion` es un stat de ítem válido más, como
  `parry` o `rng`). Ningún dato viejo necesita migrarse: es un stat nuevo,
  no un renombre — una ficha sin `formulas.percepcion` guardado
  simplemente hereda el `'des'` por defecto al mezclarse con `DEFAULT`.
- **Parry ahora cuesta Peso ÷ 2 (para arriba) y se puede parar con escudo**
  (2026-09-22; antes era Tipo ÷ 2, y solo con arma): `costoParryNitros`
  pasó de `IT2.redondeoPrimerAtaque(tipoAtaque(arma)/2)` a
  `Math.ceil(num(arma ? arma.peso : 0)/2)` — sin nada equipado, Peso 0,
  Parry gratis (ya no hace falta el "provisorio" de antes). El selector
  de arma del botón 🎲 Parry (`elegirArmaDefensa('parry')`) usa una lista
  nueva, `armasYEscudosParaParry()`: a diferencia de
  `armasEquipadasConDano()` (Atacar/Daño Arma/Bloqueo), entra cualquier
  arma **o escudo** equipado en mano (`ES_MANO`), tenga o no daño — un
  escudo no ataca pero sí para. El Bloqueo que sigue a un Parry (mismo
  arma o escudo, no vuelve a preguntar) no cambió. Resuelve la pregunta
  abierta del manual ("Parry con escudo todavía no está definido" en
  [`../manual-usuario/notas/06-combate.md`](../manual-usuario/notas/06-combate.md)).
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
- **Los recursos siguen a su atributo** (handler de `data-attr` en el input
  de Atributos): al cambiar Con o Agi, Hp y Nitros recalculan su máximo con
  `compute()` antes/después y, si el recurso estaba lleno, sube con el
  nuevo máximo; si no estaba lleno, solo se recorta si ahora pasa el nuevo
  (menor) máximo — nunca se cura de más. Nitros respeta además el estado
  "todavía null" (no solidificado, sigue el máximo solo): mientras no se
  haya solidificado, este handler no lo toca. Mismo criterio que ya usaban
  invocaciones y creeps.
- **Compartido con gm-tools y el mapa**: la Mesa (`../comun/mesa.js`; acá
  solo `MESA_DESDE`, `mesaQuien()` y `mesaIniciar(fbAlEntrar)`), las
  fórmulas de dados (`../comun/tiradas.js`) y el cuadro de la 🔍
  (`../comun/lupa.js`). No volver a copiarlos acá.
- **Barra superior unificada** (`../comun/barra.js`, `barraTexto()`):
  igual estructura en las cuatro herramientas — ☰, nombre de la
  herramienta, partida, y acá además el personaje ("Personaje (Usuario)").
  `fichaIdentidadRender()` arma el texto de `#barra-partida`: sin
  personaje abierto usa `barraTexto()` sola; con uno, le pasa el nombre
  del personaje y, si es de otro (solo lectura), el nombre de su dueño
  (`fichaIdentidadUsuario`, cacheado por `fichaMostrarLectura` para no
  reconsultar Firebase en cada tecla). Se llama al abrir/soltar un
  personaje, al cambiar de dueño y en cada `renderAll()` (por si se
  renombra el personaje abierto). Ya no hay botón "⌂ Inicio": lo
  reemplaza el menú ☰.
- **🔍 Lupa de la Botonera** (contenido: `lupaContenido` → `lupaHtml`; cuadro en `../comun/lupa.js`): cada botón
  (combate, stats, habilidades, consumibles) trae un 🔍 (`data-lupa`) que muestra
  de qué stat sale la tirada, sus modificadores con origen, cómo se reparte en
  dados y el costo en No2/SP con su motivo. No tira nada. En las habilidades la 🔍 va dentro del botón Ejecutar (`habx:`) y muestra
  solo cuánto cuesta, cuánto hay de ese recurso y qué tira ("PdG = 1d6+1");
  sin No2 el botón queda apagado con `.sin-recursos` (no `disabled`, para que
  la 🔍 siga abriendo).
- **Editor de habilidades paso a paso** (`PASOS_HABILIDAD`, `drawEditorHabilidad`):
  `drawEditor` deriva ahí para `habilidades`. Pasos: qué es (nombre y
  descripción) → costo (SP y No2; No2 puede ser un número, X o "ATAQUE" = lo que cuesta atacar con el arma elegida al ejecutar, `nitrosAtaque`/`registrarAtaqueDeHabilidad`, y cuenta como ese ataque; cada uno puede ser X: `spVariable`/`nitrosVariable`, se eligen en `#scrim-costox` y lo fijo queda bloqueado) → tirada (stat y/o fórmula) →
  estado alterado (`htmlEstadoAlUsar`, compartido con los consumibles) →
  origen (Job con cuántos puntos costó — `jobCosto`, 1 por defecto, lo suma `jobBudget` vía `jobCostoDe` —, o de dónde salió; imagen) → resumen. Al crear, Guardar aparece
  en el último paso; al editar, siempre, y los pasos se pueden saltar.
  **Las categorías "Espameable"/"No espameable" ya no existen** (2026-09-19): se sacó el campo, el aviso de "ya usada este turno", la nota de la lupa y el reinicio en el Mantenimiento; las habilidades viejas que traían `categoria` la ignoran.
  **Actualización 2026-09-19 — primero, ¿automatizarla?** El primer paso
  del asistente (`PASOS_HAB`, `pasosHabilidad(draft)`) pregunta Sí/No
  (`automatizada`; una habilidad nueva arranca en `null` y no deja avanzar
  sin responder; las viejas, sin el dato, cuentan como automatizadas —
  `habAutomatizada`). **Sí**: pasos Costo (SP, No2 y ahora **HP**,
  `hpCosto`, que se descuenta solo con `fijarHp` y no deja usarla si no
  sobra vida) y **Efecto** (la tirada y el estado sobre uno mismo, que antes
  eran dos pasos, Tirada y Estado, ahora juntos). **No**: solo Qué es,
  Origen y Listo; el botón pasa a **Anunciar** (publica la descripción en la
  Mesa, sin costo, sin tirada y sin estado). "Otro recurso" (más allá de
  No2, SP y HP) todavía no existe: ver P55.
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
- **Estados alterados**: `EFECTOS_PRESET` son los presets (Veneno,
  Lisiado, Invulnerable, etc.) — desde el 2026-09-29 salen de la lista única
  `comun/estados-presets.js` (`estadosPresetFicha()`), no se editan acá — con sus tags de inmunidad (`esCC`,
  `esVeneno`, `esSangrado`). Ya no hay "Daño entrante": el HP se edita a
  mano (número o +N/-N), así que Invulnerable, Blindado, Escudo mágico y
  Espinas frente a golpes quedan como recordatorio manual (en el
  Mantenimiento siguen bloqueando veneno y sangrado).
- **Invocaciones — mismas funciones que un creep de gm-tools, pero las
  maneja el jugador que invoca** (bloque "INVOCACIONES", funciones `inv*`
  duplicadas a propósito de las de gm-tools, no importadas — mismo
  criterio que el formato de efecto/estado): atributos con secundarios
  derivados (`invStatValor`, tabla `GRUPOS` reutilizada), No2 propio
  (`invNitrosMax`, `IT2_INV`, cuesta atacar Tipo÷2/Tipo completo como un
  PJ o un creep), arma y armadura por el asistente compartido
  (`abrirEditorArmaInv`/`abrirItemNuevoInv`, `cfgItemInv`), resistencia a
  críticos, estados alterados propios (mismos presets `EFECTOS_PRESET`,
  vía `abrirPresetsEfectoInv` — sin editor genérico, se activan directo o
  se sacan con ×) y habilidades con el mismo asistente paso a paso que un
  creep (`PASOS_HAB_INV`/`abrirEditorHabInv`, campos fijos del modal
  `#scrim-hab-inv`, no el editor genérico `openEditor`). Cada invocación
  tiene su propia Botonera (`abrirBotoneraInv`, `#scrim-botonera-inv`):
  Combate, tiradas de stats y habilidades, con su 🔍
  (`lupaHtmlInv`/`lupaContenido`). Se abre con "▶ Usar" en la tarjeta
  (`✎ Editar` abre el resto: atributos, arma, armadura, habilidades,
  estados) o desde el mapa igual que la Botonera del propio personaje,
  pasando `&inv=<id>` (`MODO_BOTONERA`/`modoBotoneraInv`). Las tiradas se
  publican en la Mesa a nombre de la invocación (`mesaQuien` reconoce el
  prefijo "‹invocación› · ", igual que gm-tools con sus creeps).
  `migrarInvocacion` convierte las invocaciones viejas (Acciones/Movimiento
  → No2, como ya se hizo con la ficha y los creeps).

## Formato de datos

- **Consume** (desde 2026-09-29): el catálogo de fábrica `comun/catalogo.js`
  (`DEFAULT.catalogo = structuredClone(CATALOGO_BASE)`; antes estaba copiado
  adentro de este archivo) **más lo que subió el grupo** (`itemsSubidos`,
  `cargarItemsSubidos`/`mezclarItemsSubidos`, `comun/items-subidos.js`): una
  corrección reemplaza al ítem de fábrica con el mismo id, lo nuevo entra como
  `usr-<id>`; la fila del catálogo muestra "🔶 sin auditar · subido por X". De
  `S.catalogo` solo se guardan los ítems propios de la ficha (ni los de fábrica
  ni los subidos, que llevan `_bib`).
- **Produce, opcionalmente**: **⬆ Subir al catálogo** (antes "📦 Agregar al
  catálogo", que escribía `datos/catalogo.json` por GitHub): en el asistente de
  un ítem de la mochila y en el editor de un ítem del catálogo
  (`subirItemAlCatalogo`) → `Biblioteca.guardar({tipo: 'items'})`, disponible al
  instante; si el ítem salió del catálogo (mismo id o nombre) se puede subir
  como corrección.
- **En vivo con Firebase** (rama `nueva-version`, bloque "FICHA EN VIVO"
  al final del script): el personaje abierto se guarda solo en
  `campanas/{id}/fichas/{fichaId}` por partes (ver
  [`docs/workflow-firebase.md`](../docs/workflow-firebase.md)). El botón
  👥 Personajes lista los de la mesa; los de otros jugadores se abren en
  solo lectura. El personaje abierto se recuerda en el `#id` de la URL y en
  `localStorage` (`ficha-actual`). Ya no hay Subir/Bajar datos.
- **Foto del personaje** (`S.meta.imagen`, botón "portrait-box"/cuadro
  "Foto del personaje"): el retrato completo, tal cual se sube (achicado
  a 480px con `fileToDataURL`, sin recortar — se ve entero con
  `object-fit:contain`). De ahí sale **la miniatura cuadrada que usa el
  token del personaje en el mapa** (`fichas/{id}.miniatura`, lo que lee
  `vtt-hexgrid/mapa.html` como `vin.miniatura`): al subir una foto nueva
  se abre de una `comun/recorte-imagen.js` para elegir con zoom y
  arrastre qué parte se ve (`elegirRecorteRetrato`, guarda en
  `S.meta.miniatura`); "Editar recorte del token" en el cuadro de la foto
  vuelve a abrir ese mismo recorte sobre la foto ya puesta, sin tener que
  resubirla. Si `S.meta.miniatura` está vacío (fichas viejas, o se
  canceló el recorte al subir), `fichaMiniaturaActual()` cae en el
  recorte automático de siempre (centro de la foto, `fichaMiniatura`) —
  mismo mecanismo que usan las invocaciones (`fichaMiniaturaInvocacion`),
  que por ahora no tienen el recorte manual. La parte `retrato` guarda
  `{imagen, miniatura}` juntos (`fichaPartesActuales`/`fichaLeerParte`,
  compatible con fichas viejas donde era solo el string de la imagen).
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
  y la misma lista de presets de estados (`comun/estados-presets.js`: acá
  `EFECTOS_PRESET`, en gm-tools `ESTADOS_PRESET_GM`, cada uno con sus nombres de
  campo; hasta el 2026-09-29 eran dos copias separadas).
- `vtt-hexgrid/mapa.html` — el menú ☰ (`comun/menu-sitio.js`) es la
  navegación principal entre partida, mapa y fichas; el mapa además carga
  la ficha adentro en un iframe (`?modo=botonera`) para la Botonera de
  cada jugador.

## El GM puede editar la ficha de un jugador (2026-09-19)

Para ayudar a un jugador nuevo o al que le cuesta (configurar habilidades,
automatizarlas, etc.): el GM abre la ficha de cualquiera (en solo lectura,
como siempre) y en el cartel de arriba toca **"✎ Editar como GM"**
(`fichaAlternarEdicionGM`, `f.editaGM`); el cartel pasa a ámbar ("Editando
como GM el personaje de X…") y lo que cambie se guarda en la ficha del
personaje, con el mismo guardado en vivo de siempre. "Volver a solo lectura"
sube lo pendiente y lo suelta. Entrar en modo edición es una decisión
explícita del GM, no el estado por defecto, para no tocar una ficha sin querer.
**El Mantenimiento no se aplica desde la vista del GM** (lo hace el dueño,
`mantenimientoRevisar`), para no cobrarlo dos veces. Necesita las reglas de
`firebase/firestore.rules` publicadas (el GM escribe `fichas/{id}` y
`fichas/{id}/partes/*`). Si el dueño y el GM editan a la vez, gana el último
que guarda cada parte (igual que con dos ventanas del mismo jugador).

- **Bug real: el GM abría en solo lectura hasta su PROPIO personaje (2026-09-29,
  reportado por el dueño: Blindaje "no pasaba nada" ejecutado desde la Botonera
  del mapa, pero sí andaba abriendo la ficha suelta)**. `fichaSoloLecturaPara(duenoUid, f)`
  decidía solo lectura con `if(fbMiembro.gm) return !(f && f.editaGM)` — es decir,
  **cualquier ficha, sin excepción, si quien la abre es GM** — sin comparar
  `duenoUid` contra el propio uid. El dueño juega con su propia cuenta de GM Y
  con su propio personaje en la misma partida (no es el caso de "múltiples
  cuentas, mismo dueño": acá es la MISMA cuenta con los dos roles a la vez), así
  que su PJ se abría en solo lectura por defecto como si fuera de otro
  jugador — y como las habilidades con duelo chequean `fichaVivo.soloLectura`
  (`habDueloDe`) y cortan en silencio si es `true`, Ejecutar no hacía nada, sin
  ningún toast ni error en consola (el camino viejo, `tirarPrimeraDeHab`, al que
  cae de rebote, tampoco avisa si la habilidad no tiene stat ni fórmula, como
  Blindaje). Fix: `fichaSoloLecturaPara` primero chequea `duenoUid ===
  fbUsuario.uid` — tu propio personaje nunca arranca en solo lectura, seas GM o
  no — y deja el resto de las reglas de GM sin cambios (fichas ajenas siguen en
  solo lectura salvo "Editar como GM"). Por qué la ficha suelta SÍ funcionaba:
  ahí el dueño probablemente estaba con otra sesión/cuenta (jugador, no GM) —
  ver `multiples-cuentas-mismo-dueno` en la memoria del asistente.

**🎮 Tomar / devolver el control (2026-09-30, pedido del dueño)** — distinto de "✎ Editar como GM" (que es para *configurar*):
con el control, el GM **usa** el personaje como si fuera su dueño — Botonera, duelos y habilidades (también cuando lo atacan:
`comun/duelo.js` pregunta `controlDe(lado)`), token en el mapa pagando No2, vida desde el HUD, botín, estados y recompensas
que le llegan (el GM los aplica y **borra** el aviso, porque las reglas solo dejan al dueño marcarlo como aplicado) y el
Mantenimiento (el mapa del GM le encola la ficha). El dueño la ve en solo lectura con un cartel ("El GM tiene el control…")
y la Mesa avisa al tomar y al devolver. No pide permiso (anotado en "Antes de abrirlo al público"). La marca vive en la parte
`fichas/{id}/partes/control` (`{uid, nombre, desde}`; `"null"` = la tiene su dueño; se lee aparte, no es un dato del
personaje) y, para el mapa, en `resumen.control` (uid del GM, `controloFicha()` en el mapa). Funciones:
`fichaTomarControl`, `fichaDevolverControl`, `fichaControlCambio`, `fichaControloYo`; `fichaSoloLecturaPara` la mira
primero. No hicieron falta reglas nuevas: el GM ya podía escribir fichas y partes y mover tokens de personajes
(col/fila/ruta/rotación). Sirve también para probar el lado jugador con una sola cuenta de GM.

**Título de la pestaña** (2026-09-19): "Ficha — <personaje> · <partida>" con un
personaje abierto, y "Ficha de personaje — <partida>" sin ninguno
(`fichaIdentidadRender`, que se llama al abrir, soltar y renombrar).

**Reposición de la miniatura** (2026-09-19): al abrir su ficha, si el dueño
tiene retrato pero `fichas/{id}.miniatura` está vacía (el token del mapa se
ve sin foto), la ficha la vuelve a publicar sola (`f.miniaturaDoc`,
`f.reponerMiniatura`, en `fichaGuardarTick`).

**+ Habilidad: de clase o custom** (2026-09-19): `data-add="habilidades"` abre
`#scrim-hab-clase` (`abrirHabClase`) en vez del editor. Custom → el asistente
de siempre, con Job 2 por defecto (`HAB_JOB_CUSTOM`). De clase → elegir clase
y "Agregar" (`agregarHabClase`): copia la skill de `CLASES_SKILLS`
(`comun/skills-clase.js`) al personaje, siempre con Job 1 (`HAB_JOB_CLASE`,
sea o no de su clase; cambio 2026-09-19), y `habClaseId` para no repetirla.

**📤 Publicar una habilidad desde la ficha — retirado** (hecho y retirado el 2026-09-29): escribía directo en `comun/skills-clase.js` por GitHub, con token; era un tercer camino de "subir", en paralelo a la Biblioteca, con caché de 10 minutos, campos basura y duplicados. Se reemplaza por el mecanismo único de [`../docs/plan-subida-unificada.md`](../docs/plan-subida-unificada.md) (pasos 1 y 2). Hasta entonces, las habilidades de clase y del pool custom se editan con [`../datos/auditoria-skills.html`](../datos/auditoria-skills.html).

**"+ Habilidad" ya ofrece el pool custom** (2026-09-29, pedido del dueño):
`abrirHabClase()` (sin argumento, el menú de siempre) suma un tercer botón **🧩 Pool custom** junto a "Habilidad
custom" y la grilla de clases — deshabilitado con "sin cargar" mientras `SKILLS_CUSTOM` esté vacío. Es un
pseudo-`claseId` (`'_custom'`, no está en `CLASES_SKILLS`) que `abrirHabClase(claseId)`/`agregarHabClase(claseId,
habId)` reconocen antes de buscar en `CLASES_SKILLS`, así que reusan la misma grilla, el mismo botón "Agregar" y
la misma detección de "Ya la tenés" (`claveHabClase`, por `habClaseId`) que las habilidades de clase — **la única
diferencia real es el costo**: **2 de Job** (`HAB_JOB_CUSTOM`, la misma constante que ya usaba "Habilidad custom"
para armar una de cero — coherente: del pool sin auditar del todo por la mesa cuesta lo mismo que crear la tuya)
en vez de 1 (`HAB_JOB_CLASE`). **Filtro por función y tipo de daño** (mismo día, mismo pedido): con el pool abierto aparecen dos
`<select>` (Función / Tipo de daño, `FUNCION_TAGS`/`TIPODANO_TAGS` — mismo vocabulario que
`datos/auditoria-skills.html`, ver su comentario y el de `datos/CLAUDE.md`) que filtran la lista por `h.etiquetas`;
el estado de los filtros (`poolFiltroFuncion`/`poolFiltroTipoDano`) se resetea al salir del pool ("← Volver" o
elegir otra clase), para no dejarlo pegado la próxima vez que se abre.

- **Nueva disposición** (2026-09-19): bajo la cabecera va **Atributos a todo el
  ancho** (los cinco en horizontal, `#attrs` en grilla; el cuadro de **Campo de
  visión** quedó ahí abajo) y después **dos columnas**: Mochila, Cinturón y
  Equipado a la izquierda; Habilidades, Pasivas, Sociales y Bitácora a la
  derecha; al final Invocaciones. La tarjeta **Combate** se sacó de la vista
  (redundante con la Botonera): sus elementos siguen en `#combate-oculto`
  (con `hidden`) porque el código todavía los actualiza; sacarlos del todo
  pide limpiar esas referencias.

- **Cabecera más compacta** (2026-09-19): se sacaron los botones **Historial** y
  **Guardar copia** (el 💾 de la barra ya baja el respaldo; "Cargar archivo"
  sigue por `#file-input`), y **⚡ Botonera** y **⬡ Mapa** pasaron a un dock
  pegado al borde izquierdo (`#dock-izq`, se abre con el mouse encima; no
  aparece dentro de los iframes del mapa). `registrarEvento` y el historial de
  sesión en memoria quedan, pero sin pantalla.

- **Estados alterados sin crecer** (2026-09-19): el cuadro de estados de la
  cabecera fija muestra los chips que entran en 1 fila (`ESTADOS_FILAS`,
  `ajustarEstados`); si sobran, un botón "＋N · Ver todos" abre la lista completa
  en una ventana (`#scrim-todos-estados`, mismos chips y botones).
- **Encabezado compacto** (2026-09-19): menos alto (foto y nombre más chicos,
  menos márgenes) y el **Loot** en una sola fila; los tipos de loot especial
  viven en un desplegable (`#loot-esp-pop`, se abre con "Especial N ▾" o con
  "+"), así que agregar más tipos ya no estira el encabezado.

- **Encabezado solo con identidad** (2026-09-19): quedan la foto (cuadrada, 84 px,
  muestra el recorte que se elige al subirla; al tocarla se ve la foto entera con
  Cambiar / Editar recorte / Eliminar) y nombre, raza, clase, subclase y nivel.
  Lo demás pasó al **dock izquierdo** (`#dock-izq`), cada botón abre un panel al
  lado: ⭐ **Exp y Job**, 💰 **DDE y loot** (con el desplegable de loot especial) y
  📖 **Bitácora** (así las dos columnas quedan de 3 y 3). **Inteligencia** pasó a
  Atributos, junto al Campo de visión. El recuadro de **SP** del encabezado se
  eliminó (la barra azul ya lo muestra).

- **Todos los botones de la barra de arriba pasaron al dock** (2026-09-19): en
  orden ⚡ Botonera, 👥 Personajes, 🏪 Vendedor, ⭐ Exp y Job, 💰 DDE y loot, 📖
  Bitácora, 🗺 Mapa y 💾 Respaldo (el ＋ Personaje nuevo está en el menú de Personajes). La barra de arriba
  queda solo con el texto (partida y estado de guardado). Mismos ids, así que
  el código no cambió.

- **Turno** (2026-09-19): se sacaron de la tarjeta de Estados el "Turno N", el
  botón ↺ Turno y el registro del Mantenimiento. El número de turno se ve como
  "T5" en la cabecera de la Mesa flotante (`mesaPonerTurno` en `comun/mesa.js`,
  lo llaman la ficha y gm-tools).

- **Equipar cuesta No2 en combate** (2026-09-20): con el mapa en modo combate,
  cada equipar y cada desequipar cuesta 1 No2 (`IT2.nitrosEquipar`,
  `conCostoEquipar`); reemplazar un ítem por otro (menú "Slot equipado" →
  Reemplazar) son 2. En narrativo no cuesta nada, ni mientras no se haya leído el
  modo del mapa. Sin No2 suficientes: el pop-up de siempre (cancelar o "realizar
  de cualquier modo", con la línea roja en la Mesa). Solo la ficha; los creeps de
  gm-tools no lo aplican.

- **Equipado → botón 🛡 Equipo** (2026-09-20): la tarjeta "Equipado" salió de las
  columnas (queda oculta en `#equipo-oculto` porque el código todavía la actualiza)
  y en el dock hay un botón **🛡 Equipo** (`#btn-equipo`) que abre el mismo panel que
  el 🛡 del token en el mapa (`renderEquipo`, `#scrim-equipo`): equipado por slot y
  mochila con Sacar / Equipar / Cambiar…, ahora también con **Ver** y **Editar** y el
  **peso equipado** arriba. Columnas: Mochila y Cinturón a la izquierda; Habilidades,
  Pasivas y Sociales a la derecha.

- **Habilidades que curan** (2026-09-20): campo `curaHp` de la habilidad (asistente:
  "Vida (HP) que cura"): al ejecutarla se suma a la vida propia sin pasar del máximo.
  La usa Recuperación del Tanque (`comun/skills-clase.js`).

- **Botín del combate** (2026-09-20, tanda 4): botón 🎁 del dock (`#btn-botin-loot`, aparece si hay botín) → `#scrim-botin-loot`: lo que soltaron los creeps y nadie tomó (`botinLootEscuchar`, colección `botin`). Nombre con hover de características, "≈ N despojos", **Sumar a la mochila** (`botinTomar`: transacción sobre el doc, el primero se lo lleva; mochila llena = no entra; trofeos iguales se apilan en una ranura; línea verde en la Mesa), **Comparar** (`itemCatalogo` conoce los `botin-<id>`), ranuras libres y "Abrir mochila". Los ítems con `trofeo: true` no se pueden equipar.

- **El botín se abre solo** (2026-09-21): al llegar botín nuevo (no el que ya estaba al abrir la ficha) se abre la ventana 🎁 (`botinLootEscuchar`); dentro del mapa la abre el mapa con el mensaje `abrir-botin` (`botinModoAbrir`). El botón 🎁 del dock sigue sirviendo para volver a abrirla.

- **Ventana "⚔ Batalla terminada"** (2026-09-21): arriba, **lo que recibe cada jugador** (XP y DDE, con la propia fila resaltada); abajo, los **despojos** para "Sumar a la mochila" o Comparar. Se abre sola con un combate nuevo (`combateEscuchar`, `combate/actual`; en el mapa la abre el mapa); el botón del dock **🎁 Despojos** solo se habilita con el botín publicado (`combatePublicado`) y sirve para reabrirla si se la cerró; cuando el GM cierra el botín, la ventana se cierra y el botón se apaga.

- **Wildcards de vuelta (2026-09-22)**: contador libre en el dock ⭐ Exp y Job, junto a Job (`#c-wildcards`, `S.meta.wildcards`/`wildcardsMax`). Los dos valores se escriben a mano, sin fórmula ni tope — mismo lugar donde vivía antes de sacarse el 2026-09-18 (ese hueco ahora lo ocupa Inteligencia, que sigue en Atributos). Sin mecánica de juego todavía: ver P102.

- **`resumen.rng`/`resumen.rangocasteo` publicados** (2026-09-22): la ficha ya calculaba estos dos stats (Rango, de Destreza; Rango de casteo, de Especial) pero no los mandaba a Firebase. Ahora sí, en `fichaResumen()`, para que el mapa los use en el visualizador de rango (📏🔮, ver `vtt-hexgrid/CLAUDE.md`).

- **Ejecutar una habilidad tira la primera tirada; la segunda va con 🎲** (2026-09-24, pedido del dueño): al apretar Ejecutar se tira **solo el stat vinculado** (`tiradaStat`: PdG, PdG.Mg u otro) o, si la habilidad no tiene stat, la fórmula (`tiradaExtra`). Si tiene las dos, la fórmula (el daño o el efecto) queda para un botón **🎲 <fórmula>** al lado de Ejecutar, como Atacar → Daño en las armas (`tirarPrimeraDeHab`/`tirarSegundaDeHab` (en la ficha: `botonSegundaHab`); en gm-tools `tirarExtraDeHab`/`tirarSegundaDeHab` y `botonSegundaHabCreep`; en invocaciones `tirarExtraDeHabInv`/`tirarSegundaDeHabInv`). Las habilidades de creep armadas por el programa que tiran daño ahora traen `tiradaStat` = `'pdg'` (o `'pdgmg'` si son mágicas: rol mágico de la biblioteca o palabras como mágico/arcano/rayo/fuego/hielo en el nombre o la descripción, `esHabMagica` en `comun/creeps-base.js`); a las ya guardadas se les agrega al cargar el creep (`migrarHabPdg`, solo las que dicen "tira … de daño" y no tienen stat). Es un punto de partida: se puede cambiar el stat en el editor de la habilidad.

- **Reporte del Mantenimiento en la Mesa** (2026-09-24, pedido del dueño): al aplicarse el Mantenimiento a un personaje, `mantenimiento()` arma además un reporte en texto llano (`rep`) con el antes y el después — daño o cura de cada estado (con stacks), turnos que le quedan ("Veneno: 3 → 2 turnos"), estados que se terminan, escudo mágico recargado, regeneración de pasivas, HP total ("20 → 16"), cuenta de Inconsciente y SP Regen — y lo publica con `mesaPublicarReporte` (`desde: 'reporte'`, `quien` = el personaje, `origen` = "Turno N", `formula` = un renglón por cosa; `comun/mesa.js` lo dibuja como línea lila con ⟳). Todos lo ven; si no pasó nada que contar, no se publica. Lo publica la ficha del dueño (o su copia en segundo plano desde el mapa), no el GM. Los creeps no publican reporte a la Mesa a propósito (su HP es secreto).

- **Los presets de estados alterados preguntan sus cantidades** (2026-09-24, pedido del dueño): al activar un preset estándar (ficha: "+ Estado" y estado de una invocación; gm-tools: estado de un creep, y desde el mapa que abre esas mismas ventanas), en vez de crear el estado con números fijos aparece un cartelito que pregunta de a una: **cuánto HP** (cura o daña por turno), **cuántos HP tiene el escudo**, **cuántos stacks**, **cuánto suma o resta cada bono** y por último **cuántos turnos dura** — con un tilde **"Sin límite (no vence)"** (viene tildado en los que eran permanentes, como Veneno severo o Sigilo, y se destilda para poner turnos). Lo hace `comun/estado-preguntas.js` (`EstadoPreguntas.pedir(preset, cfg)`; `cfg.hp` es `hpturno` en la ficha y `hpTurno` en gm-tools). Los presets siguen definiendo el efecto; los detalles ya no llevan números. Sangrado guarda "N de daño" como N stacks de 1 HP (así sigue sumando de a 1). Armadura rota no pregunta el bono (−1 por acumulación es la regla). Los "Mis presets" (propios) se aplican directo con sus números. Las tarjetas del selector muestran "HP: a elegir", "Turnos: a elegir", etc.
- **"Escudo mágico" pasó a llamarse "Escudo especial"** (2026-09-24): preset, habilidades de creep que lo aplican y textos del editor y de la Mesa. Los estados viejos con el nombre anterior siguen andando (`alias: ['Escudo mágico']` en el preset, `presetPorNombre`). Los ítems del catálogo también se renombraron (Pergamino/Poción de Escudo Especial, en `datos/catalogo.json`, el Excel y los tres HTML; los ids `new-…-escudo-magico` no cambian); los que ya estaban en una mochila conservan el nombre con el que se copiaron.

- **Regeneración pasiva entre los estados alterados** (2026-09-24, pedido del dueño; criterio general abierto en P106): las pasivas con `regenHp` aparecen en la lista de estados como un chip de solo lectura con ✦ (`estadosDePasivas`, no se guarda: se arma de las pasivas; también entra en `fichaResumen().estados` con `derivado: true`, y el mapa no le muestra ✕, ± ni ⚙). El Mantenimiento sigue aplicando la regeneración por el camino de las pasivas, así que no se cuenta dos veces.

- **Estado al ejecutar/consumir con asistente (2026-09-24)**: al elegir un preset estándar en "Estado alterado al ejecutar/consumir" del editor de habilidad/ítem, se abre el mismo asistente paso a paso que "+ Estado" (`EstadoPreguntas.pedir`) y las respuestas se guardan en la habilidad: `efectoTurnos`, `efectoHpTurno`, `efectoPermanente` ("sin límite"), `efectoMods`, y los nuevos `efectoEscudo` (HP del escudo) y `efectoStacks`. `aplicarEfectoDeConsumo` los usa por sobre los del preset. El Blindaje del Tanque ahora es `Escudo especial` con `efectoEscudo: 8` (1 turno).

- **🪤 Habilidades que colocan trampa (2026-09-24)**: en el paso "Efecto" del editor de habilidades hay un tilde "Esta habilidad coloca una trampa" (nombre, qué hace, daño automático, radio, cantidad, "ignora la Defensa" y 📚 Trampas preconstruidas). Se guarda en `h.trampaColocar` y, al ejecutar (`ejecutarHabilidad`/`confirmarCostoVariable` → `colocarTrampaDeHab`), `TokensAuto.colocarTrampas` la deja oculta al lado del token del personaje (`tipoToken: 'pj'`) en el mapa en juego. Sin token en el mapa avisa y no coloca nada.

- **Sobrepeso (2026-09-24, regla en prueba, P108)**: con `compute().sobrecarga > 0` aparece el estado derivado "Sobrepeso" (`estadoSobrepeso`, no se guarda). La penalidad (−1 Eva por punto) no se suma al stat: se decide al tirar Evasión — `tirarValorStat` abre el pop-up `#scrim-sobrepeso` (pagar 1 No2 y tirar limpio, o tirar con la penalidad).

- **Escudo especial editable desde el chip** (2026-09-24, pedido del dueño): el chip del estado (en la ficha, y en la tarjeta del creep de gm-tools) trae **− 🛡a/m +** cuando el estado tiene escudo: − y + restan o suman 1 al valor actual, y tocar el **🛡a/m** abre un cuadrito donde se escribe el valor nuevo, **+N / −N**, o **`max N`** para cambiar el máximo (`escudoParsear`, duplicado en ficha y gm-tools; el actual nunca pasa del máximo ni baja de 0). No hace falta abrir el editor de estados. **También en el globo de estados del mapa** (quien puede cambiar los estados ve − 🛡a/m +; el resto ve solo el texto 🛡a/m, y de un creep los jugadores no ven el escudo): para eso el `resumen.estados` público de personajes, invocaciones y creeps lleva ahora `escudo` (actual) y `escudoMax` cuando el estado tiene escudo; una ficha lo publica en su próximo guardado.

- **Inteligencia editable a mano** (2026-09-24, pedido del dueño): el contador de Inteligencia (Atributos, junto al Campo de visión) se toca y abre un cuadrito para fijar el **total** libremente: un número, **+N / −N**, o **`auto`** para volver al cálculo automático (6 + 3 por nivel). Se guarda en `S.meta.inteligenciaManual` (`null` = automático; `inteligenciaValor()` devuelve ese valor si existe, si no `inteligenciaAuto()`). Lo invertido en habilidades sociales no se toca; "sin invertir" = total − invertido (puede quedar negativo si se baja el total por debajo de lo invertido). Un personaje ajeno (solo lectura) no se puede editar.

- **Parry cuesta el Peso entero** (2026-09-24, pedido del dueño; reemplaza lo de "Peso ÷ 2" del 2026-09-22): `costoParryNitros(arma)` = Peso del arma o escudo con el que se para (sin nada equipado, 0). Sigue sin depender de cuántos ataques se hicieron ni se puede parar con escudo. Actualizados los textos del botón, del selector de arma y del manual.

- **Bloqueo: la suma es el dado** (2026-09-24, pedido del dueño): `bloqueoValorConArma(arma)` = substat Bloqueo (Fuerza + lo que suma el equipo, sin los bonos de la otra arma) + Peso del arma elegida, y esa **suma** pasa a dados con `formulaParaValor` (Bloqueo 6 + Peso 4 = 10 → 1d10). Antes el peso se sumaba después como número fijo (`1d6+4`).

- **Parry y Bloqueo de las invocaciones (y de los creeps de gm-tools)** (2026-09-24, pedido del dueño; igual que la ficha): el **Parry cuesta tantos No2 como el Peso de su arma** (`costoParryCreep` / `pesoArmaInv`; `armaPeso`, mínimo 1; sin No2 suficientes avisa y no tira, como Atacar) y el **Bloqueo** suma su Bloqueo + el Peso de su arma y **esa suma es el dado** (`bloqueoValorCreep`; Bloqueo 6 + Peso 3 = 9 → 1d8+1). Los botones muestran el costo y el motivo.

- **SP máximo editable a mano desde el token** (2026-09-24, pedido de los jugadores): en el globo ⚙ del token de un personaje, el máximo del SP (la parte de "/ 12") ahora es un campo: se escribe el máximo nuevo, **+N / −N** o **`auto`** y Enter (`hudAplicarMax`, `cambiarSpMaxPj`). No toca la fórmula de la ficha: se guarda como un **ajuste** `S.meta.spMaxExtra` (puede ser negativo) que `spMaximo()` de la ficha suma al máximo calculado (Especial × 3 + bonos); `auto` lo deja en 0. El SP ya gastado se conserva: subir el máximo suma SP disponible, bajarlo lo resta (sin pasar de 0). Solo personajes (no invocaciones ni creeps); pide que la ficha se haya abierto una vez con la versión nueva (`resumen.spMax`).

- **SP Regen por defecto** (2026-09-24, regla del dueño): la base del substat `spregen` pasó de `0` a **`floor(esp/2)`** (la mitad del Especial, para abajo) para TODOS los personajes, y `mantenimiento()` lo aplica **al principio** (antes de tocar estados), sin pasar del máximo; sigue sumando lo que den habilidades, equipo, pasivas o estados. Las fichas existentes con la base vieja pasan a la nueva **una sola vez** (`migrarEstadoIt2`, marca `S.spRegenAuto`); si después alguien la fija a mano en `0`, se respeta. (Ojo con el texto viejo de más arriba: "fórmula base 0" ya no es así.)

- **Crear un estado desde cero, paso a paso** (2026-09-25): ver `asistente-estado.js` en [`../comun/CLAUDE.md`](../comun/CLAUDE.md). En el selector de estados (＋ Estado) el botón ahora es "＋ Crear estado nuevo (paso a paso)"; el formulario completo sigue accesible desde el último paso (y desde el editor de siempre).

- **Escudo especial es un valor neto** (2026-09-25, pedido del dueño): un solo número, **sin tope y sin recarga automática en el Mantenimiento** (antes: actual/máximo que se recargaba). Baja al absorber daño y se sube o baja a mano desde el chip, la tarjeta del creep o el token. Internamente sigue en `escudoMagico` (+ `escudoMagicoActual`, siempre iguales); un estado con escudo en 0 sigue siendo un escudo (`escudoMagicoActual !== undefined`) y se puede volver a subir. Ver también `vtt-hexgrid/CLAUDE.md`.

- **Armadura mágica (Paso 7 de las reglas de casteo, 2026-09-27, `docs/reglas-casteo.md` §1.4)**: stat nuevo `armadmg`
  ("Armadura mágica"), agregado a `EXTRA` igual que Defensa (`def`) — fijo, sin fórmula de atributo (`formulas.armadmg:'0'`
  en `DEFAULT`), así que `compute()` lo calcula solo, sin tocar nada más. Se publica en `fichaResumen()` como
  `resumen.armadmg` para que el mapa lo lea. Se da como bono de ítem desde el asistente compartido (paso "Bonos"), no
  tiene un campo propio como el `def` de una pieza de armadura.

- **Hechizos de área** (Paso 7b del casteo, 2026-09-27): `habDueloDe(it, xSp, xNitros)` suma `radio: num(c.radio)` cuando
  el 🎯 de la habilidad tiene objetivo `'area'` (nuevo en `comun/asistente-duelo-hab.js`); el resto (marcar el centro, la
  cascada, la fase de dodge) vive en `comun/duelo.js` y `vtt-hexgrid/mapa.html` — ver `../comun/CLAUDE.md` y
  `../vtt-hexgrid/CLAUDE.md`. Ejecutar una habilidad de área **fuera del mapa** (ficha suelta, sin iframe) no funciona —
  avisa que hay que abrir el mapa.

- **Daño que escala con X** (P119, 2026-09-27, `docs/preguntas-abiertas.md`, ver `../comun/CLAUDE.md` para el detalle):
  `habDueloDe` ahora recibe `xSp`/`xNitros` (`terminarEjecucionHab` se los pasa) para armar la fórmula final de daño
  cuando el 🎯 tiene `duelo.danoFijoPorX` cargado — Rayo Mágico es la primera skill auditada así.

- **Vender ítems solo en las tiendas (regla del dueño, 2026-09-26):** la única forma de vender un ítem, del cinturón o despojos es el botón **💰 Vender** de la tienda abierta (`abrirVender`, exige `tiendaCargada`). No debe haber un botón de vender en la mochila, en la ventana del ítem ni en ningún otro lado. (Revisado el 2026-09-26: no queda ningún otro camino; el «Precio de venta» del editor de ítems es solo un dato.)

- **Tirada personalizada del 🎯 (2026-09-27, pedido del dueño, auditando Drenar vida)**: reemplaza al intento
  anterior de esta misma nota ("Pasos personalizados", una ventanita aparte en la ficha — descartada: el dueño
  pidió que la dinámica de duelo compartido no se pierda). La solución final vive en el 🎯 de verdad
  (`comun/asistente-duelo-hab.js`/`comun/duelo.js`, ver `../comun/CLAUDE.md`): el paso "Tirada" admite una fórmula
  propia en vez de un stat, y el paso "Daño" un texto libre para lo que no se puede automatizar. Acá en la ficha,
  `habDueloDe` arma `hab.tira = {formula, etq}` (con la X ya sustituida) y `DUELO_HOOKS.habTirar` la tira igual
  que cualquier stat — sin ventanas nuevas ni cambios al flujo de Ejecutar.

- **El Crítico frecuente/potente de un arma vale solo para esa arma** (2026-09-28, regla del dueño): con dos armas equipadas, lo que da una no mejora las tiradas de la otra (los anillos, pasivas y estados sí valen para las dos). El duelo ya lo hacía (`statsCritico` → `statParaArma`); se corrigió además la Calculadora de crítico (`criticoDatosIniciales`) y lo que la ficha publica al mapa (`resumen.crit`/`critpot`), que sumaban el de ambas armas: ahora usan `statParaArma` con la misma arma de `armaTipo`. El número "Crít.Frec." de la tarjeta de stats sigue siendo el total de la ficha (no es de un arma puntual).

- **Sin arma ni escudo no se puede parriar (2026-09-28, regla del dueño, reportado con una captura del duelo en
  vivo — reemplaza la opción gratis "Parry (sin arma ni escudo)" que existía desde el 2026-09-24, ver la nota de
  arriba "Parry cuesta el Peso entero")**: `DUELO_HOOKS.opcionesDefensa` ya no ofrece Parry en el menú "Elegí
  cómo te defendés" si `armasYEscudosParaParry()` viene vacío (antes agregaba una opción a costo 0). El botón
  🎲 Parry de la Botonera (`elegirArmaDefensa('parry')`) tampoco lo ejecuta más en ese caso — avisa con un toast
  ("No podés parriar sin un arma o escudo equipado") en vez de llamar a `parryConArma(null)`; `costoParryTxt()`
  (el texto del tooltip del botón) dice lo mismo en vez de mostrar un costo que ya no aplica. La fórmula de
  costo (`costoParryNitros`, Peso del arma, 0 sin nada) no cambió — lo que cambió es que ahora, sin arma ni
  escudo, no hay ninguna opción de Parry para elegir, ni desde el duelo ni desde el botón suelto.
  **Misma regla para invocaciones y creeps (P121, `docs/preguntas-abiertas.md`, resuelta el mismo día — "invocaciones
  y GM Tools van a seguir las mismas reglas")**: la fila de combate de una invocación (`ficha.html`) y de un creep
  (`gm-toolset/gm-tools.html`) ya no ofrecen Parry si `!inv.armaNombre`/`!sc.armaNombre`, ni en su propia lista de
  tiradas ni en el `DUELO_HOOKS.opcionesDefensa` de cada archivo — mismo criterio (nombre de arma vacío = sin
  arma). Un arma natural (garras, colmillos…) puesta en `armaNombre` sigue contando como arma, así que un creep
  con arma natural no pierde Parry.

- **Subida unificada de habilidades** (2026-09-29, paso 2 de `../docs/plan-subida-unificada.md`): cada habilidad tiene
  **⬆** (`subirHabilidad`) que la sube con toda su configuración a la biblioteca compartida (`comun/biblioteca.js`,
  tipo `skills`, `para: 'jugador'`), preguntando si es una corrección de la original o algo nuevo. "+ Habilidad" arma
  cada clase y el 🧩 Pool custom con `habsDelPool` (fábrica de `comun/skills-clase.js` + lo subido, releído al abrir;
  `skillsSubidas`, `cargarSkillsSubidas`). Cada copia guarda `bibOrigen` y, si la original se corrige, aparece
  **🔔 versión nueva** (`versionNuevaDeHab`/`abrirVersionNuevaHab`: Actualizar / Dejar la mía (`bibIgnorada`) / Ahora no).
  Reemplaza al 📤 retirado.
- **Pasivas en la subida unificada** (2026-09-29, paso 4): "📚 Proponer" pasó a **⬆ Subir** (corrección / nueva);
  las pasivas guardan `bibOrigen` y muestran 🔔 versión nueva si el original se corrige (`origenDePasiva`,
  `versionNuevaDePasiva`, `abrirVersionNuevaPasiva`). El 🔔 de habilidades usa ahora el cartel compartido
  (`Biblioteca.avisoVersion`).

- **Talentos (antes "habilidades sociales") — regla fijada, mecanismo libre** (2026-09-30, P126): en pantalla se llaman
  **Talentos** (tarjeta, botón "+ Talento", Botonera, lupa); los datos siguen en `S.sociales`. Regla: 1 punto de
  Inteligencia = +1 nivel = +2 caras del dado; Inteligencia 6 + 3 por nivel. Mientras se define el mecanismo, **± Nivel**
  (`abrirNivelSocial`) suma **✎ A mano** (`nivelarSocialAMano`): fija `puntosInt` y `nivelExtra` para arriba o para abajo;
  si se invierte más Inteligencia de la que hay, avisa (toast) pero no bloquea.

- **Tres modos de ejecución de una habilidad** (2026-09-30, pedido del dueño; reemplaza "¿automatizarla?" + el tilde "¿se
  juega en el duelo?"): `h.modo` = `'manual'` (📣 Anunciar), `'semi'` (💰 cobra el costo y tira la tirada inicial —
  `tirarPrimeraDeHab`—, los efectos van a mano) o `'auto'` (✨ la Ejecución paso a paso, `dueloDe(h)`). `modoHab(h)`
  deduce el de las viejas (automatizada === false → manual; con `duelo` → auto; resto → semi); `habAutomatizada(h)` es
  ahora `modoHab(h) !== 'manual'`. El editor arranca en "¿Cómo se ejecuta?" (`MODOS_HAB`); semi = costo + tiradas;
  auto = paso "Ejecución" (`abrirEjecucionHab`, abre `AsistenteDueloHab` con `siempreActivo`: guardarla deja
  `modo: 'auto'`, sacarla lo pasa a semi). Lo del sistema anterior (estado sobre uno mismo, cura, trampa, zona/portal:
  `habLegado`) se sigue aplicando en semi y auto y se edita en el paso "Del sistema anterior" hasta adaptarla.
  **Atajo:** auto + objetivo "uno mismo" + sin tirada, sin daño y sin resistencia (Blindaje) → `aplicarHabSobreMiDirecto`
  aplica los efectos sin abrir el cuadro y anuncia en la Mesa (usa `habDueloDatos`, que no pide el duelo conectado).
  `modo` viaja al subir (`Plantillas.HAB`). Pendiente: colocar trampa como opción del automático (anuncio solo al bando y
  elegir la casilla en el mapa) y los mismos tres modos en creeps (gm-tools) e invocaciones.
- **Invocaciones: los mismos tres modos** (2026-09-30): el editor de habilidades de invocación (`PASOS_HAB_INV` + pasos 6
  "Cómo se ejecuta" y 7 "Ejecución", `hiOrden`) e `invEjecutarHab`: manual solo anuncia; semi cobra No2 y cooldown y tira
  la primera; auto abre la Ejecución a nombre de la invocación (`habDueloInv`, ref `fichaId~invId`, igual que su ataque) o,
  si es solo sobre ella y sin tiradas, la aplica directo (`aplicarSpecAInv`). **Ataque con arma con arreglos y ⚡ Flash**
  (2026-09-30): `lanzarAtaqueDeHabInv` → `ataqueDeHabInv` (el gancho `atacar` tira su PdG con lo que suma y `dano` —
  `invDanio(id, true, mods)` — le suma dados y fijo); el Flash de una invocación cuesta como el de un creep (cooldown y vida,
  el doble en turno ajeno: `pagarFlashInv`, `usarFlashFueraDelDueloInv`) y aparece en las tiradas del duelo. La zona
  persistente todavía no va para invocaciones (se ejecuta como semiautomática).

- **`ficha-habilidades.js` (paso 5, nivel B, área 3, 2026-10-01)**: el costo en SP/No2 de una habilidad (fijo, "X" o "como un ataque": `parseCostoSp`/`spVariable`/`nitrosVariable`/`nitrosAtaque`/`habCostoVariable`) y el "estado del sistema anterior" al ejecutar/consumir (`aplicarEfectoDeConsumo`, `configEfectoDe`, `flagsDePreset`, `presetPorNombre`) salieron a `comun/ficha-habilidades.js` (`FichaHabilidades`), recibiendo `S` y la lista de presets en vez de leerlos de variables globales — mismo criterio que `ficha-calculo.js`/`ficha-combate.js`. La ficha conserva los mismos nombres de siempre como alias finos. **gm-tools e invocaciones tienen su propia versión, con diferencias de verdad (no solo de nombre de campo) — ver P137 en `docs/preguntas-abiertas.md`**: no se tocaron, a propósito, hasta que el dueño decida cuál vale.


- **`ficha-guardado.js` (paso 5, nivel B, área 4, 2026-10-01)**: el personaje en blanco (`DEFAULT`), las migraciones de fichas viejas (`migrarEstadoIt2`, `migrarEstadoEspecial`, `migrarEstadoTipos` y sus `migrarObj*`), la mezcla con el personaje en blanco (`FichaGuardado.normalizar`, lo que hacía `aplicarFicha` antes de dibujar) y las partes de Firebase (`PARTES_FICHA`, `fichaPartesActuales`, `fichaLeerParte`, `fichaAplicarParte` y el armado de la primera carga en `fichaEscuchar`: `FichaGuardado.armarDatos`) viven en `comun/ficha-guardado.js`. Acá quedan los mismos nombres como alias; `aplicarFicha` sigue dibujando y avisando, y el guardado en vivo (`fichaGuardarTick`) y la escucha (`fichaEscuchar`) siguen en `js/12`. **Un campo nuevo de la ficha** va en `DEFAULT` de ese archivo (y, si es de una parte, en `PARTES`). **Ojo con los `?v=`**: al cambiar un tramo de `js/`, subir su versión en `ficha.html`.
- **Los ganchos del duelo, compartidos (paso 4, etapa 3c-4c, 2026-10-01)**: lo que el duelo le pide a un personaje (atacar,
  defender, daño, Bloqueo, crítico, Flash, Moneda Re-Roll, habilidad dirigida, contraataque) vive en `comun/ficha-duelo.js`;
  `js/11` arma `window.DUELO_HOOKS` con `FichaDuelo.hooks(() => S, dueloUi)` y deja adentro solo lo de las **invocaciones**
  (`dueloInvDe`). `monedaReroll`/`tirarMonedaReroll` (`js/02`) y `pagarFlash`/`costoFlashDe` (`js/11`) son atajos a la misma
  pieza. `combateUi.cambio` suma `'vitals'`, `'inventario'` y `'cinturon'`.
- **Ejecutar una habilidad, compartido (paso 4, etapa 3c-5a, 2026-10-01)**: `ejecutarHabilidad`, `confirmarCostoVariable`,
  `anunciarHabilidad`, `tirarPrimeraDeHab`/`tirarSegundaDeHab`, `registrarAtaqueDeHabilidad` y `limiteCostoX` son atajos a
  `comun/ficha-acciones.js` (y `usarFlashFueraDelDuelo` a `comun/ficha-duelo.js`); los carteles de "¿con qué arma?" y del costo X
  y lo que todavía hace solo la ficha (trampa, zona) van en `habUi` (`js/11`). Desde el 5b, también `terminarEjecucionHab`,
  `ataqueDeHabArma`, `habDueloDatos`, `xDeHab`, `aplicarHabSobreMiDirecto`, `dueloAplicarEfectoPropio`, `aplicarEstadoRecibido`,
  `estadoDeSpec`, `durAviso`, `desgastarItem` y `rompeArmaduraAlAzar` son atajos a `comun/ficha-acciones.js` (habUi suma `yo`,
  `dueloDisponible`, `puedeEscribir`, `elegirObjetivo` → `Duelo.elegirObjetivo`, `colocarZona` → `colocarZonaDeHab`, `presets`
  y `recordatorios`). Desde el 5c, también `avisarZonaAlMapa` (`js/10`), `colocarTrampaDeHab` (`js/10`) y `colocarZonaDeHab`
  (`js/02`): habUi suma `enMapa` (¿estoy dentro del mapa?) y `alMapa` (→ `MensajesMapa.alMapa`).
- **La 🔍 y el "Ver", compartidos (paso 4, etapa 3c-6, 2026-10-01)**: `lupaHtml` (`js/11`) es un atajo a
  `FichaLupa.contenido(S, clave)` y `openViewer` (`js/07`) arma su tarjeta con `FichaLupa.ver(S, key, it)` (los botones del Ver
  siguen acá); `jobCostoDe` y `formulaSocial` (`js/05`) también son atajos (`comun/ficha-lupa.js`). Las 🔍 de las invocaciones
  (`lupaHtmlInv`) siguen acá. En modo Botonera, `js/14` atiende `editar-en-ficha` (el "Editar" del Ver de la Botonera nueva del
  mapa): toca el Editar de su propio Ver.
- **Talentos, trampas consumibles y Ankh a mano, compartidos (paso 4, etapa 3c-7, 2026-10-01)**: `tirarSocial` (`js/05`) y
  `colocarTrampaDeItem` (`js/10`) son atajos a `comun/ficha-acciones.js`, y el botón del Ankh a mano (`js/06`, `data-consumirankh`)
  usa `FichaAcciones.ankhAMano`.
- **La sesión en vivo, compartida (paso 4, etapa 3a, 2026-10-01)**: escuchar el personaje, aplicar cambios de otra ventana y el guardado (`fichaEscuchar`, `fichaGuardarTick`, `fichaHayPendiente`, `fichaNuevoEstado`) pasan por `comun/ficha-sesion.js`; acá queda lo que la ficha hace en cada momento (armarse y dibujarse, avisos, solo lectura, control del GM, `fichaOpcionesGuardado`). El objeto `fichaVivo` tiene los mismos campos de siempre.

- **Las reglas de una invocación, compartidas (paso 4, etapa 4e, tanda 1, 2026-10-01)**: el motor de stats de `js/04` (`invStatValor`,
  `invDefensaEfectiva`, `defensaInv`, `costoAtaqueInv`, `migrarInvocacion`…) son atajos a `comun/inv-calculo.js`. **La Defensa de
  una invocación ahora suma los estados que la cambian** (antes los ignoraba), igual que un creep o un personaje.
- **La Botonera de una invocación, compartida (paso 4, etapa 4e, tanda 2, 2026-10-01)**: `renderBotoneraInv` y `botonSegundaHabInv`
  (`js/04`) usan `comun/inv-botonera.js`. En modo Botonera, `js/14` atiende `botonera-delegar` con `inv`: abre la Botonera de esa
  invocación y toca el mismo botón (la dibuja el mapa con ⚗). **`comun/ficha-sesion.js`**: la primera carga del personaje ahora
  espera al servidor (antes podía armarse con partes sueltas de la memoria local y correr +2 los Tipos).
- **Los botones de una invocación, compartidos (paso 4, etapa 4e, tanda 3, 2026-10-01)**: `tirarValorStatInv`, `invTirarStat`,
  `invAtacar(Suelto)` e `invDanio` (`js/04`) usan `comun/inv-acciones.js` (`publicarTiradaInv` publica lo que devuelve).
- **El duelo de una invocación, compartido (paso 4, etapa 4e, tanda 4, 2026-10-01)**: las ramas de invocación de `window.DUELO_HOOKS`
  (`js/11`) llaman a `dueloInv = InvDuelo.hooks(dueloInvUi)` (`comun/inv-duelo.js`); `pagarFlashInv`/`costoFlashInv` (`js/04`) son atajos.
- **Las habilidades de una invocación, compartidas (paso 4, etapa 4e, tanda 5, 2026-10-01)**: `invEjecutarHab` y sus ayudantes
  (`js/04`) usan `comun/inv-habilidades.js`; `invHabUi` es lo que hace la ficha (publicar, redibujar, el duelo).
- **La 🔍 y el Ver de una invocación, compartidos (paso 4, etapa 4e, tanda 6, 2026-10-01)**: `lupaStatInv`/`lupaHtmlInv` (`js/11`) y
  `verHabInv` (`js/04`) usan `comun/inv-lupa.js`.
- **Zonas y trampas de las invocaciones (paso 4, etapa 4f, 2026-10-02, P134)**: la ✨ de zona persistente de una invocación ya anda
  (`invHabUi.colocarZona` → 'zona-persistente-habilidad' al mapa), y el editor de sus habilidades suma el paso 8 "🪤 Trampa" (`hiTrampa`,
  `hiTrampaRender`, `hiAbrirAsistenteTrampa`: el mismo asistente y la misma forma de trampa que el personaje). Al ejecutar, la trampa se
  coloca como la del personaje (`invHabUi.colocarTrampa` → `FichaAcciones.colocarTrampaDeHab`).
- **Ficha lite (2026-10-02)**: el 📜 del token y la F ya no abren la ficha liviana de acá (`fichaMapaAbrir`, `#scrim-ficha-mapa`,
  mensaje `abrir-ficha-mapa`, sin uso: candidatos a sacar); la dibuja el mapa (`comun/ficha-lite.js`). Su botón 📊 Stats manda el
  mensaje nuevo `abrir-stats` (`js/14`: abre `#scrim-stats-mapa`).
