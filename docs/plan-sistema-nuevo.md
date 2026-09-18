# Plan del sistema nuevo — Rol Pintoísta en vivo

Documento vivo: decisiones tomadas con el usuario y estado de cada paso.
Leerlo antes de trabajar en esta rama. Cómo está armado Firebase:
[`workflow-firebase.md`](workflow-firebase.md).

## Objetivo

Un "Roll20 propio" con solo lo que el grupo usaba, jugando cada uno desde
su casa:

- Mapa de hexágonos compartido. El GM puede ponerle una imagen de fondo
  (opcional, solo si sale simple).
- Tokens: cada jugador mueve los suyos, el GM mueve los de los creeps.
  Todos ven los movimientos al instante.
- Cada token conectado a su ficha: barra de vida, barra de SP (hoy
  "Bonos" en la ficha, ya renombrado en la Iteración 2) e íconos de estados alterados.
- Chat de tiradas compartido desde los botones de ficha y gm-tools.
- Fichas y herramienta del GM en vivo: nada de "Subir datos"/"Bajar datos".

## Contexto y alcance

- **Rol Pintoísta** es el sistema/proyecto. **Piratas en el espacio** es
  la campaña que se juega hoy con la versión vieja (carpeta `rol`, rama
  `main`, sync por GitHub) y queda como archivo histórico. **No se migran
  sus personajes ni sus datos** y no hace falta convivir con ella.
- Trabajo en la carpeta `rol-nueva-version` (git worktree, rama
  `nueva-version`). **La plataforma vieja (sync de datos de partida por
  GitHub) ya no se usa ni hace falta preservarla**: no quedan botones ni
  código de "Traer última versión"/Subir/Bajar datos para personajes,
  tablero, tienda o creeps — todo eso es Firebase. Lo único que sigue por
  GitHub es el catálogo de ítems (compartido entre campañas, siempre
  contra `main`) y `gestor.html` (actualiza el *código* de las
  herramientas, no datos).
- Sin backend propio ni build step: cada herramienta sigue siendo un
  `.html` que se abre con doble clic. Firebase (proyecto `rol-pintoista`,
  plan Spark gratis, sin tarjeta) es el backend en vivo.
- **Imágenes: solo las necesarias, y siempre que no compliquen**: retrato
  en la cabecera de la ficha, imagen propia de cada creep, miniatura de
  esas en el token vinculado, e imagen de fondo del mapa. Las de ítems,
  habilidades y catálogo quedan afuera por ahora.
- Catálogo, manual y `herramientas/*.py` quedan como están por ahora. La
  tienda pasó a Firebase (Paso 5).
- El usuario no es técnico: explicarle en palabras simples y con pasos
  concretos en la consola de Firebase.

## Decisiones tomadas

- **Firestore** (no Realtime Database). SDK compat por `<script>`.
- **Entrada** (desde el Paso 4): cuenta de Google, o email y contraseña con
  confirmación por link. El sitio arranca pidiendo iniciar sesión; después
  muestra **todas las partidas** (grupo cerrado de 4 amigos: cualquiera ve
  todas y se une con un clic) y permite crear una. **Quien crea la partida
  es su GM**; los que se unen son jugadores. **El nombre se elige al entrar
  a cada partida.** Se arrancó de cero: los datos de prueba anteriores
  (identidades anónimas) no se migran. Antes: sesión anónima + código de
  campaña (Pasos 0–3).
- **Datos agrupados por campaña**: `campanas/{id}/...`.
  `piratas-en-el-espacio` es por ahora solo espacio de pruebas.
- **Permisos** (impuestos en `firebase/firestore.rules`, no solo en la UI):
  - Cada ficha de PJ tiene dueño (`duenoUid`). Solo el dueño la modifica;
    todos los miembros la ven. Un jugador puede tener **varios personajes**.
  - El GM ve todas las fichas de PJ pero **no las modifica**; solo puede
    reasignar el dueño (para cuando alguien cambia de compu).
  - **La ficha de personaje es solo de jugadores.** El GM usa gm-tools para
    sus creeps y sus propios personajes (que son creeps con otro nombre:
    PNJ aliados, comerciantes…). Si el GM abre la ficha, solo mira.
  - **Stats iniciales en 1** (Con, Fue, Agi, Des, Int) para personajes,
    creeps e invocaciones nuevos; la vida arranca llena. En creeps y en
    invocaciones, Hp.Max = Con×5 + mods de Hp.Max (equipo y estados),
    igual que en la ficha (se recalcula al terminar de editar Con).
  - Rol visible en la cajita Mesa ("· GM" / "· jugador"). Es por navegador.
  - Fichas de creeps: solo el GM las ve y modifica. Los jugadores ven de
    cada creep solo el token, la barra de vida y los estados.
  - El daño recibido lo aplica el dueño en su propia ficha.
  - Tiradas del GM: visibles para todos (tiradas secretas, más adelante).
  - **Historial de tiradas solo de la sesión**: el GM lo borra a mano (🗑
    en la Mesa) y se borra solo lo de más de 48 h cuando el GM entra a
    una herramienta (no hay servidor que lo haga a hora fija).
  - **Vida de los creeps**: los jugadores solo ven cuán llena está la barra
    (se publica el porcentaje, no los números). Los creeps no tienen SP.
  - Barras: **vida roja, SP azul** (en tokens y Tablero).
- **Fichas en vivo, guardadas por partes** (recursos, estados, inventario,
  atributos…), con escrituras espaciadas (~1 s) por el tope diario del
  plan gratis.
- **Solo compu, no celular** (decidido 2026-09-17): no se adapta ni se
  prueba nada para pantallas de celular, ni en programación ni en diseño.
  Queda como pendiente: si el usuario lo pide más adelante, se trabaja
  aparte (hoy no está bien resuelto). Lo que ya existe para pantallas
  angostas se deja como está, pero no se sigue sumando.
- **Dados en el navegador de cada uno** (sin servidor que tire): aceptado
  entre amigos.
- **Sitio web con GitHub Pages** (gratis, repo público): se publica la rama
  `nueva-version` desde la raíz, en `https://elsauloel.github.io/rolpintoista/`
  (`index.html` con links a cada herramienta; `.nojekyll` para que GitHub
  sirva los archivos tal cual). Cada push a `nueva-version` se publica solo
  en 1–2 minutos, así que **solo se sube lo ya probado**. Cuando empiecen
  las partidas de verdad se puede pasar a publicar desde otra rama. Abrir
  por la web y abrir con doble clic son identidades distintas en Firebase:
  al pasar a la web cada uno vuelve a entrar con el código (el GM se
  remarca en la consola y reasigna los personajes si hace falta). La ficha
  ya no tiene el menú ⚙ Ajustes (Cambiar token, Actualizar gestor): la
  navegación es el menú ☰ (`comun/menu-sitio.js`). Abrir con doble clic
  sigue funcionando.
- **Botones y código de GitHub para datos de partida: eliminados**, no
  solo desactivados (2026-09-17) — el modal "Antes de arrancar…" con
  "Traer última versión" nunca se abría en `nueva-version`, así que se
  sacó entero de la ficha y gm-tools, junto con las funciones que solo
  servían para eso. `gestor.html` sigue existiendo para actualizar el
  *código* de las herramientas desde `main`, y el catálogo sigue
  publicándose por GitHub (ver `docs/workflow-github.md`) — eso no cambia.
  "Guardar ficha"/"Cargar archivo" local se conserva como respaldo.

## Pasos

| Paso | Qué | Estado |
|---|---|---|
| 0 | Firebase: proyecto, auth anónima, código, reglas, página de prueba | ✅ Hecho y probado |
| 1 | Mesa: tiradas compartidas en vivo (cajita flotante en ficha y gm-tools) | ✅ Hecho y probado |
| 2 | Mapa de hexágonos (`vtt-hexgrid/mapa.html`) con tokens movibles en vivo y la Mesa al costado | ✅ Hecho y probado |
| 3 | Fichas y creeps en vivo: barras y estados en los tokens; se eliminan Subir/Bajar datos, Personajes y Tablero vía GitHub | ✅ Hecho y probado |
| 3a | Ficha guardada sola en Firebase por partes; Personajes lista los de la mesa (propios / de otros en solo lectura); se van Subir/Bajar datos | ✅ Hecho y probado |
| 3b | Creeps de gm-tools en vivo (con su imagen); se va "Subir datos" de gm-tools | ✅ Hecho y probado |
| 3c | Mapa: token vinculado a ficha/creep con barras de HP y SP, estados y miniatura; imagen de fondo del mapa; Tablero en vivo | ✅ Hecho y probado |
| 4 | Cuentas y partidas: login con Google o email confirmado, inicio con la lista de partidas, crear (GM) o unirse (jugador), herramientas por partida (`?partida=`), sesión compartida en `comun/sesion.js` | Hecho, falta probar |
| 4c | Manejo de la partida para el GM: ver jugadores (con sus personajes), sacar a alguien, renombrar o borrar la partida (escribiendo el nombre, ofreciendo antes el respaldo); "Irme de esta partida" para jugadores. Decidido: los personajes del que se va quedan y el GM los reasigna; sacar no bloquea volver a unirse; borrar es de verdad (hay que cambiar reglas para que el GM borre fichas); el GM no se va ni pasa el rol | Hecho, falta probar (y pegar las reglas nuevas en la consola) |
| 5 | Tienda en vivo: el GM arma la tienda en el generador (se guarda sola), rerolea ítems sueltos, la publica o la cierra; guarda tiendas con nombre (una por lugar) para reabrirlas, modificarlas o regenerarlas; los jugadores la abren con 🏪 Vendedor en la ficha. Se van el token y los botones de GitHub del generador | Hecho, falta probar (y pegar las reglas nuevas en la consola) |

**Sitio web:** https://elsauloel.github.io/rolpintoista/ (GitHub Pages desde
`nueva-version`, activo desde el 14/9/2026).

**Más adelante:** versión para celular (solo si se pide), GM oculta tokens/tiradas, tiradas secretas, alcance y
movimiento en el mapa, niebla de guerra, imágenes (retratos, fondo),
publicar en una web, pasar catálogo/tienda/manual a Firebase.

**Hecho aparte (2026-09-15):** respaldo de la partida para todos (💾 en la ficha y en
gm-tools; un .json que se recarga con "Cargar archivo"); imagen de fondo
del mapa separada de su posición. **Siguiente:** dados 3D en el mapa
(animación con el resultado real de cada tirada, sin escrituras extra;
con opción de apagarla y tope de dados).

## Sigilo (en diseño)

Un personaje o un creep entra en sigilo desde el mapa.

**Quién ve qué:**

| Token en sigilo | Lo ven | No lo ve |
|---|---|---|
| Personaje | su dueño y los demás jugadores (semitransparente) | el GM |
| Creep | el GM (semitransparente) | los jugadores |

Ocultarlo de verdad: la posición (y la estela) del que está en sigilo no
le llega al otro bando (ver "Antes de abrirlo al público"). Reemplaza al
pendiente "GM oculta tokens".

**Reglas decididas:**
- **Sigilo es una habilidad estándar**: se tiene por la clase u otros
  mecanismos y aparece en el campo de habilidades con su texto.
- **Entrar cuesta 1 No2** *(a revisar)*.
- **Se rompe** al entrar en el campo de visión de un personaje/creep del
  otro bando, o al realizar una acción hostil.

**Orientación y campo de visión (decidido, en discusión):**
- ✅ **Hecho en el mapa**: la grilla se giró a "de lado arriba" y cada
  token es un hexágono que calza con su casilla y mira hacia **uno de los
  6 lados** (nunca a un vértice); por defecto mira abajo, como casi toda
  ilustración de token. Se gira arrastrando un handle celeste que sale del
  token (no un palito ocre — el color se eligió para no confundirse con
  dorado/verde/rojo/gris, que ya dicen de quién es el token); **girar no
  cuesta No2**. Ver `vtt-hexgrid/CLAUDE.md`. Falta todo lo de abajo (cono
  de visión, zona de alerta, sigilo de verdad).
- **Cono de visión**: filas de 1, 2, 3 y 4 hexágonos hacia el frente (10
  en total); cada fila, medio hexágono más adelante y uno más ancha.
- **Zona de alerta**: los hexágonos pegados al cono y los que rodean al
  token, **salvo el de atrás**.
- Sigilo frente a un enemigo: pasar o pararse **en su cono** rompe el
  sigilo solo; pasar o pararse **en su zona de alerta** provoca una
  **tirada de detección** (no es automática).

**Falta definir** (las preguntas completas, numeradas, están en
[`preguntas-abiertas.md`](preguntas-abiertas.md)):
- Si al moverse el token queda mirando hacia donde caminó.
- Qué tapa la vista (obstáculos) y cómo se marcan en el mapa.
- La tirada de detección: qué stats, quién tira, una por hexágono o una
  por movimiento.
- Si se detecta de otra forma (tirada de percepción, etc.).
- Costo de moverse en sigilo, "última posición conocida".
- Qué pasa con la ficha, las tiradas en la Mesa y los estados del que está
  en sigilo.

## Antes de abrirlo al público

Hoy el sistema es para jugar **entre amigos de confianza**: nadie va a
tocar el código ni la base para hacer trampa. Por eso algunas decisiones
se toman de forma relajada para avanzar con el diseño. **Si algún día se
decide lanzarlo al público, hay que revisar esta lista antes** (y cada
decisión relajada nueva se agrega acá al tomarla).

| Decisión relajada hoy | Qué habría que resolver para el público |
|---|---|
| Los dados se tiran en el navegador de cada uno | Un servidor que tire (o que verifique las tiradas); hoy cualquiera podría publicar el resultado que quiera |
| Cualquier cuenta ve todas las partidas y se une con un clic | Partidas privadas: invitación, código o aprobación del GM |
| "Sacar" a alguien no le impide volver a unirse | Lista de bloqueados o partida cerrada a nuevos jugadores |
| El GM puede borrar las fichas de los jugadores (lo usa "Borrar la partida") | Limitarlo a ese caso, o que las fichas no se borren sin el dueño |
| El dueño del proyecto de Firebase ve todo desde la consola (incluido lo oculto: vida de creeps, sigilo, tiradas secretas) | Separar el rol de administrador del de GM |
| Plan Spark gratis, sin límites por usuario (partidas, tiradas, escrituras) | Plan pago y topes/controles contra abuso |
| El borrado de tiradas viejas corre cuando el GM entra a una herramienta | Borrado del lado del servidor (TTL o función programada) |
| Lo que cada uno escribe en su ficha (vida, SP, No2, stats) no se valida | Validar en el servidor lo que afecta a los demás |
| **Sigilo** (en diseño): el bando contrario no ve el token, pero el resto de la info (ficha, tiradas) queda a decidir | Revisar que ningún dato filtre la posición o las acciones del que está en sigilo |
| **Ocultar tokens** (GM, ya en el mapa): un jugador que mire la base de datos directamente podría ver igual el token oculto — el filtro es del lado del cliente, no de las reglas | Mover los tokens ocultos a una subcolección que solo lea el GM |
| **Orden de turnos**: cualquier miembro puede reescribir el `orden` entero de `mapa/iniciativa` (no solo el valor de su propia fila) — las reglas no pueden revisar un elemento suelto de una lista | Partir `orden` en un documento por token, para que las reglas sí puedan limitar cada uno a su dueño |

## Pendientes chicos

- En `miembros` quedan documentos repetidos de pruebas en incógnito
  ("Pepe"): se pueden borrar desde la consola.
- Borrar desde la consola `campanas/piratas-en-el-espacio` (datos de prueba
  anónimos) y desactivar el proveedor Anónimo en Authentication.

## Cómo se prueba cada paso

Desde el sitio web, con dos cuentas distintas (dos perfiles de Chrome, o
una ventana normal y una de incógnito): una como GM y otra como jugador.
Cada push a `nueva-version` se publica solo.
