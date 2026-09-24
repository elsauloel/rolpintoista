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
- **Estados alterados**: `EFECTOS_PRESET` define los presets (Veneno,
  Lisiado, Invulnerable, etc.) con sus tags de inmunidad (`esCC`,
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
  pero cada uno con su propia lista de presets (`EFECTOS_PRESET` acá,
  `ESTADOS_PRESET_GM` en gm-tools) — duplicado a propósito, no importado.
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
