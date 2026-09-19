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
