# Plan de consolidación: un solo motor, varias ventanas

> **Estado: en curso** (escrita y empezada el 2026-09-30 a pedido del dueño — "vamos empezando poco a poco… si hace falta
> pausarlo para encarar otra tarea, lo pausamos"). **Hechos: pasos 0, 1, 2 y 3** (2026-09-30). Siguiente: paso 4 (la Botonera y las Acciones como piezas compartidas). Cada paso se decide, se hace y se prueba por separado; ninguno obliga al
> siguiente. Relacionado: "A desarrollar" n.º 51 (integrar todo en un solo sitio) y
> [`plan-subida-unificada.md`](plan-subida-unificada.md) (el mismo espíritu, ya hecho, para subir elementos).

## Por qué

El proyecto creció por descubrimiento: primero la ficha, después el mapa, después GM Tools, la tienda, el duelo… Cada pieza
nació como una página propia y se fue conectando con las demás. Lo esencial está bien resuelto — **Firebase es la única fuente
de verdad** y todas las páginas leen y escriben ahí en vivo; `comun/` (38 archivos) ya junta mucho de lo compartido —, pero el
crecimiento por partes dejó tres costos que se sienten cada vez que se toca algo:

1. **La misma regla escrita varias veces.** Un personaje, una invocación y un creep son lo mismo en el fondo (un combatiente:
   stats, estados, No2, HP, habilidades), pero cada uno tiene su propio código. Hoy están repetidas, entre otras:
   `mantenimiento` (ficha, GM Tools y mapa), `escudoParsear` (las tres), `tirarValorStat`, `mitadesDeTirada`,
   `acumularVeneno`/`acumularSangrado`, `estaBloqueadoElDebuff`, `costoParry`, `bloqueoValor` (ficha y GM Tools), y la
   ejecución de habilidades en tres versiones (personaje, invocación, creep). Los tres modos de ejecución (2026-09-30) hubo que
   escribirlos tres veces. Cada copia puede quedar distinta de las otras sin que nadie lo note.
2. **Las "puertas" entre páginas son frágiles.** El mapa mete adentro la ficha (`?modo=botonera`, `?modo=mantenimiento`) y
   GM Tools (`?modo=acciones`, `finalizar`, `botin`) y se hablan con mensajes (unos 30 tipos distintos entre las tres). De
   ahí salieron algunos de los bugs más raros: el cartel "¿Es tu turno?" invisible dentro del mapa (la ficha escondía lo que
   no conocía), clics que no llegan, ventanas que se tapan.
3. **Archivos gigantes.** `ficha.html` ~12.700 renglones, `mapa.html` ~10.700, `gm-tools.html` ~8.000. Cuanto más grande,
   más cuesta cambiar algo sin romper otra cosa y más fácil es que dos conversaciones se pisen.

## La idea: un motor de reglas, varias ventanas

Lo que más rinde **no es juntar todo en una sola página**, sino tener **un solo motor de reglas**: un lugar que sepa qué es un
combatiente y qué significa cobrar un costo, tirar, aplicar un estado, pasar el turno o ejecutar una habilidad. La ficha, GM
Tools y el mapa pasan a ser **ventanas** que miran y usan ese motor. Una regla nueva se escribe una vez y vale para todos.

Juntar todo en una sola pantalla (la ficha y GM Tools como paneles del mapa) es un paso aparte y opcional; con el motor común
hecho, sería un cambio chico. Sin él, sería una casa más grande con los mismos problemas adentro.

## Lo que NO cambia

- **Los datos**: la estructura de Firebase, las fichas, los creeps, los mapas y las partidas en curso siguen igual. Nada de
  esto obliga a migrar datos de jugadores (si algún paso lo necesitara, se convierte solo al abrir, como siempre).
- **Sin "build step"**: todo sigue siendo HTML y JS que se abre directo y se publica solo en GitHub Pages.
- **Las reglas del juego**: esto reordena cómo está escrito el código, no qué hace. Si en el camino aparece una diferencia
  entre copias (una regla que en la ficha hace una cosa y en GM Tools otra), se le pregunta al dueño cuál vale.

## Los pasos

Cada paso: qué es, qué se gana, qué se arriesga, cómo se prueba. Se pueden espaciar semanas entre uno y otro.

### Paso 0 — Red de seguridad (antes de tocar nada) — ✅ 2026-09-30
- **Qué**: una lista de pruebas de humo por herramienta (qué tocar y qué tiene que pasar: atacar, defenderse, ejecutar una
  habilidad de cada modo, pasar el turno, comprar, colocar una trampa…) y, si conviene, una página de pruebas
  (`comun/pruebas.html`) que carga el motor y verifica resultados solos (ej.: "Sangrado 2 stacks + otro → 3").
  Usar la partida **"Claude · pruebas"** (creeps y mapas ya armados) y **"Test"** para fichas de jugador.
- **Se gana**: poder mover código con la tranquilidad de detectar enseguida si algo se rompió.
- **Riesgo**: ninguno (no toca el juego).
- **Cómo quedó**: [`../comun/pruebas.html`](../comun/pruebas.html) — 38 pruebas automáticas de lo que ya vive en `comun/`
  (dados, crítico y supercrítico, estados y su acumulación, inmunidades, plantillas, catálogo, ítems subidos, la marca ⚠️),
  sin sesión ni Firebase; cada función que se mueva al motor suma las suyas. [`pruebas-de-humo.md`](pruebas-de-humo.md) — la
  lista de qué tocar y qué tiene que pasar en cada herramienta (ficha, mapa, GM Tools, tienda, biblioteca), con un registro.

### Paso 1 — El combatiente único (`comun/combatiente.js`)
- **Qué**: una sola forma de leer y escribir a "alguien que pelea", con tres adaptadores (personaje, invocación, creep):
  valor de un stat con sus modificadores, estados activos, No2, HP, escudo. Y mover ahí primero las funciones **puras**
  repetidas (`mitadesDeTirada`, `escudoParsear`, `acumularVeneno`/`Sangrado`, `bloqueoValor`, `costoParry`,
  `estaBloqueadoElDebuff`…), una por una, comparando que den lo mismo que antes.
- **Se gana**: el cimiento de todo lo demás; cada función movida deja de poder divergir.
- **Riesgo**: bajo, si se mueve de a una y con el paso 0.
- **Cómo va** (empezado el 2026-09-30):
  - **Inventario**: 59 funciones con el mismo nombre en 2+ herramientas (28 idénticas, 31 distintas). Las de combate
    que importan están listadas abajo.
  - **Tanda 1 ✅** — [`../comun/combatiente.js`](../comun/combatiente.js) (`Combatiente`) con `mitadesDeTirada`,
    `aplicarMitades`, `estadosQueParten`, `escudoParsear`, `acumularVeneno`, `acumularSangrado` (incluye Escarcha) e
    `inmunidad` (Invulnerable, Inmunidad a CC, Sangre pura, Coagulación extrema, protección de jefe). Antes vivían en
    hasta **cuatro** copias (ficha, GM Tools, mapa y `estados-aplicar.js`). Las herramientas conservan los nombres de
    siempre (`estaBloqueadoElDebuffCreep`, `acumularVenenoCreep`…) como atajos de una línea al motor, así nada más
    cambió. Antes de reemplazar se compararon las copias viejas contra el motor en 3000 casos al azar: idénticas.
  - **Diferencia encontrada y corregida**: los botones de colores de la Botonera (`modificadores-tirada.js`) decían
    "Parálisis ÷2" aunque ya partiera Lisiado o Pajaritos (la tirada partía una sola vez, el cartel decía dos). Ahora el
    cartel sale del motor y muestra exactamente lo que se aplica.
  - **Pruebas**: `comun/pruebas.html` 38 → 56.
  - **Repaso en mesa** (2026-09-30, "Claude · pruebas" y "Test"): todo bien, y apareció otra diferencia entre copias — un
    estado estándar que llega de una habilidad, trampa o zona respetaba sus números (stacks del Veneno, bonos, daño por
    turno) en un creep pero no en un personaje (Nube tóxica: Veneno ×3 al creep, ×4 al personaje). Ahora es una sola
    regla: `Combatiente.ajustarPreset`.
  - **Tanda 2 ✅** — **tirar un stat** (`Combatiente.tirarStat`): Afortunado (dos veces, queda la mejor), mitades,
    Evasión mínimo 1 y los estados que se pintan en la Mesa (`estadosQueAfectan`). Antes había tres copias (personaje,
    invocación, creep) y otras tres tiradas sueltas (quien coloca una zona, en ficha y GM Tools, y la resistencia al
    entrar en una zona, en el mapa). Comparada contra la versión vieja en 4790 casos con los mismos dados: mismos
    totales. Diferencias corregidas: las invocaciones no tiraban dos veces con Afortunado (**P100**, ya anotada como bug)
    y el cartel de la Mesa mostraba "Parálisis" aunque no partiera la tirada. **Costo del Parry** (`costoParry`, 1 No2)
    en un solo lugar. Pruebas: 65.
  - **Regla nueva del dueño, aplicada en el motor** (2026-09-30, resuelve P127): **Parry y Bloqueo solo con un arma o un
    escudo**; sin nada no hay opción, y un arma natural tampoco, por ahora (`Combatiente.armaParaDefensa`). Antes: el
    personaje podía tirar Bloqueo sin nada y no podía elegir un escudo para bloquear; creeps e invocaciones bloqueaban
    siempre y parriaban con garras; y el mapa tenía **su propia copia** de las defensas de un creep que ofrecía Parry aunque
    no tuviera arma. Ahora las cuatro vías usan la misma regla. Las invocaciones suman el tilde "arma natural" (como los
    creeps). Pruebas: 66.
  - **No hay Bloqueo sin Parry** (concepto del dueño, 2026-09-30, P128): los botones de Bloqueo sueltos de personaje,
    invocación y creep pasan a verse apagados con lo que tirarían, y se habilitan solo después de un Parry.
  - **Tanda 3 ✅** (2026-09-30): **costo de atacar** (`costoAtaque`, `costoPrimerAtaque`, `ataquesPosibles`: Tipo ÷ 2 para
    arriba el primero, Tipo completo después; oportunidad y contraataque siempre lo de un primer ataque) — estaba en la ficha,
    las invocaciones, los creeps y el asistente de ítems. **Máximo de No2 con los estados** (`nitrosMax`: Cansado, Hypeado,
    Exhausto y Stun/forzados) — tres copias. Diferencia encontrada y decidida (**P130**): "Forzar Nitros máx." es un tope,
    nunca sube el máximo (el personaje lo tomaba como "fijar"). Comparado contra la versión vieja en 5000 casos: igual.
    Pruebas: 72.
  - **Sobre los "adaptadores"** (leer stat, estados, No2, HP y escudo con la misma forma): al hacer las tandas quedó claro
    que no hace falta una capa aparte — el motor recibe los datos crudos (la lista de estados, el valor natural) y cada
    herramienta se los pasa. Lo que sigue repetido de verdad son el **Mantenimiento** (paso 2) y la **ejecución de
    habilidades** con su costo en No2/SP (paso 3). **El paso 1 queda cerrado.**

### Paso 2 — Estados y Mantenimiento únicos — en curso (2026-09-30)
- **Cómo va — tanda 1 ✅**: **el pase de turno de los estados** (`Combatiente.pasarTurnoEstados` + `reporteTurno`): escudo
  que se recarga, daño/cura por turno × stacks con inmunidades, stacks por turno, turnos que vencen y el reporte (Mesa del
  personaje, 📜 Historial del GM). Lo usan el personaje, las invocaciones y los creeps; lo propio de cada uno queda en su
  herramienta (SP Regen, pasivas y cuenta de muerte del personaje; cooldowns de creeps e invocaciones; cómo se aplica la vida:
  `fijarHp` en la ficha, tope 0–máximo en creeps e invocaciones). Comparado con las versiones viejas en 4000 casos: igual.
  Diferencias corregidas: **las invocaciones** tenían una copia recortada (no respetaban inmunidades, no recargaban el escudo,
  la vida no tenía tope); **un estado sin turnos ni "permanente"** ahora hace su efecto una vez y se va (**P131**, antes el
  personaje lo dejaba para siempre y el creep lo borraba); **0 stacks = se terminó** en los tres; en los creeps la vida del
  turno se suma toda junta antes del tope (antes, estado por estado: una cura y un daño en el mismo turno podían dar distinto
  según el orden). Pruebas: 78.
  Probado en "Claude · pruebas" con 3 Mantenimientos seguidos.
- **Tanda 2 ✅** (2026-09-30): **ponerle un estado a alguien** (`Combatiente.agregarEstado`): inmunidades, Armadura rota
  +1, Veneno/Sangrado/Escarcha que se acumulan y **renovar uno igual** (**P132**). Lo usan el "+ Estado" del personaje, el de
  las invocaciones y el de los creeps, los dos formularios completos (ficha y GM Tools), lo que le llega al personaje desde
  afuera y `EstadosAplicar.aplicarACreep` — antes eran seis copias. Corregido de paso: el "+ Estado" de las invocaciones no
  revisaba inmunidades, y la ficha acumulaba Veneno y Sangrado por adelantado al recibir un estado aunque no correspondiera.
  Pruebas: 83. **El paso 2 queda cerrado** (lo que se pone uno mismo con una habilidad o un consumible ya renovaba y pasa
  al paso 3, junto con la ejecución de habilidades).
- **Qué**: aplicar, acumular, vencer y recalcular estados, y el Mantenimiento (pasar el turno), en un solo lugar para los
  tres tipos de combatiente. Hoy `mantenimiento` existe en tres versiones.
- **Se gana**: un estado nuevo o una regla de turno nueva se escribe una vez.
- **Riesgo**: medio (el Mantenimiento toca todo); probar con una partida de prueba varios turnos seguidos.

### Paso 3 — Ejecución de habilidades única — ✅ 2026-09-30
- **Cómo va — tanda 1 ✅** (2026-09-30): **usar una habilidad** en `comun/combatiente.js`: el modo (`modoHab`), el costo en
  No2 (`costoNitrosHab`: número, "ATAQUE", X), si se puede usar ahora (`bloqueoHab`: cooldown, No2 y vida), el alcance
  (`alcanceHab`), lo que el cuadro del duelo necesita de la ✨ Ejecución (`habEjecucion`, con `efectoDeEjecucion` y
  `sustituirX`) y el atajo "solo sobre sí y sin tiradas" (`sobreSiSinTiradas`). Lo usan el personaje, la invocación y el
  creep (antes, tres copias de cada una). Comparado contra las versiones viejas: personaje 3013 casos e invocación 2596, igual;
  en el creep solo cambia lo buscado. Decisiones: **P133** (se cobra lo que la habilidad tenga, sea de quien sea: creeps e
  invocaciones ahora pueden costar vida y curar) y **P134** (ataque con arma, Flash y zona de invocación: se avisa y va como
  semiautomática; sumarlos queda en pendientes). Corregido de paso: el creep perdía la tirada personalizada y los textos "a
  mano" de su Ejecución (y su duelo no sabía tirar una fórmula); los estados que una invocación se pone a sí misma no
  revisaban inmunidades y se duplicaban en vez de renovarse; una ✨ de creep sin la Ejecución armada no avisaba. Pruebas: 92.
- **Tanda 2 ✅** (2026-09-30): **zonas y trampas** — el mensaje que recibe el mapa para dejar una zona persistente
  (`zonaDeHab`, con `formulaDanoHab`) y la trampa de una habilidad (`trampaDeHab`) salen del motor, iguales para personaje y
  creep (cada uno sigue decidiendo lo suyo: el personaje la anuncia sin la ubicación, el creep en secreto). **El estado que uno
  se pone con el sistema anterior** (habilidades y consumibles: `aplicarEfectoDeConsumo` en la ficha,
  `aplicarEfectoDeConsumoCreep`) pasa por `agregarEstado`: inmunidades, Veneno que se acumula y renovar uno igual, como todo
  lo demás (el personaje renovaba también el de un ítem equipado y no acumulaba Veneno; el Excedente de vida del creep se
  sigue sumando). Pruebas: 94. **El paso 3 queda cerrado**; lo que falta para creeps e invocaciones (ataque con arma, Flash,
  zona y trampas de invocación) quedó en `pendientes.md` (P134).
- **Qué**: cobrar el costo, los tres modos (📣 manual, 💰 semi, ✨ auto), lo del sistema anterior mientras dure, trampas y
  zonas: una sola implementación que usan personaje, invocación y creep.
- **Se gana**: se terminan las tres versiones; las invocaciones reciben lo que hoy les falta (zonas, ataque con arma desde
  una habilidad, Flash).
- **Riesgo**: medio.

### Paso 4 — La Botonera y las Acciones como piezas compartidas
- **Qué**: que el mapa **dibuje él mismo** la Botonera del personaje y las Acciones del creep (usando el motor), en vez de
  meter la ficha o GM Tools enteras adentro. Menos puertas y menos mensajes.
- **Se gana**: se van los bugs de "invisible dentro del mapa", el mapa carga más rápido, un clic hace lo que dice.
- **Riesgo**: medio-alto (es lo que más se usa en mesa). Conviene hacerlo en una **rama aparte** (no en `nueva-version`,
  que se publica sola) y juntarlo cuando esté probado en "Claude · pruebas" y "Test".

### Paso 5 — Partir los archivos gigantes
- **Qué**: separar cada herramienta en piezas con nombre (`comun/…`: inventario, habilidades, invocaciones, niebla, tokens,
  tienda…), cada una más chica y con una sola responsabilidad.
- **Se gana**: cambios más seguros, menos choques entre conversaciones, más fácil de entender.
- **Riesgo**: bajo por pieza, pero es mucho trabajo; se puede hacer de a una cuando se toque cada parte.

### Paso 6 (opcional) — Una sola pantalla
- **Qué**: la ficha y GM Tools como paneles que se abren al lado del mapa (con la opción de abrirlas aparte), como pide "A
  desarrollar" n.º 51.
- **Se gana**: la experiencia de "todo en un lugar".
- **Riesgo**: con los pasos 1–4 hechos, bajo; sin ellos, alto (no conviene hacerlo primero).

## Cómo trabajarlo
- **De a un paso**, cada uno con su propio plan detallado antes de empezar (como `plan-subida-unificada.md`), preguntas de
  diseño primero y código después.
- **Nada a medias en el sitio público**: los pasos 1–3 y 5 se pueden subir de a poco (cada función movida, probada); el 4 y
  el 6, en una rama aparte hasta que estén probados.
- **Aprovechar el envión**: cuando haya que tocar una parte por otro motivo (una regla nueva, un bug), ese es el mejor
  momento para mover esa parte al motor común.

## Para decidir antes de empezar
1. ¿Arrancamos por el paso 0 + 1 (bajo riesgo, mucho beneficio) y vemos?
2. ¿Una ventana de tiempo sin partidas (o con partidas de prueba) para el paso 4?
3. ¿El paso 6 (una sola pantalla) es un objetivo, o alcanza con que las piezas estén bien conectadas?
