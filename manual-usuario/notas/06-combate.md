+++
capitulo: Combate
icono: ⚔️
resumen: Cómo se pelea: turnos, ataque y defensa, daño, críticos, muerte, sigilo, trampas e invocaciones.
+++

+++
titulo: Estructura de un combate
alias: [Combate, Turno, Ronda, Turnos, Estructura del turno, Orden de turnos]
tags: [combate, reglas-base]
estado: borrador
+++
Un combate se juega en **rondas**. Dentro de cada ronda, todos actúan de a uno, en un orden fijo.

## Cómo arranca
1. El GM pasa el mapa a [[Modo narrativo y modo combate|modo combate]].
2. **Todos tiran [[Iniciativa]]** (un stat de [[Agilidad]]). El resultado define el **orden**, que se intercala libremente entre aliados y enemigos: es personaje por personaje, no por bando.
3. Ese orden aparece como una lista flotante en el mapa (**Orden de turnos**, arriba a la izquierda), y el GM avanza con **▶ Siguiente**.

## La ronda
1. Cada uno actúa **en su turno**, en orden.
2. Cuando actuó el último, viene el [[Mantenimiento]] (se recargan los [[Nitros (No2)|Nitros]], corren los estados, etc.).
3. Empieza una **ronda nueva** desde el primero.

## Tu turno
En tu turno gastás tus **Nitros** en lo que quieras: moverte, [[Atacar|atacar]], usar [[Habilidades|habilidades]] o ítems. No hay "fase de movimiento" separada: es todo del mismo bolsillo. Ver [[Costos en Nitros]].

> [!tip] Tu turno, en tres preguntas
> ¿Cuántos Nitros tengo? ¿Qué quiero lograr este turno? ¿Cómo lo pago?

> [!info] Turnos de los enemigos
> El GM maneja a los [[Creeps]] con las mismas reglas de recursos que vos. Puede **ocultar** filas del orden de turnos (por ejemplo, un enemigo sorpresa): ver [[Ocultar y revelar]].

> [!question] Detalles de la iniciativa
> - ¿Se **vuelve a tirar** la Iniciativa en cada ronda o el orden queda fijo todo el combate? (Hoy el valor de cada fila se puede editar a mano en cualquier momento.)
> - ¿Cómo se resuelve un **empate**? (Hoy: queda el orden en que ya estaban.)

+++
titulo: Iniciativa
alias: [Ini, Orden de iniciativa]
tags: [combate, stats]
estado: borrador
+++
La **Iniciativa** es un stat derivado de [[Agilidad]]. **Se tira al iniciar el combate** y define **el orden** en que actúa cada uno en las rondas ([[Estructura de un combate]]). El de mayor resultado actúa primero.

- Se tira con el dado que le toca a tu stat: [[Cómo se tira un stat]].
- Aparece en la lista **Orden de turnos** del mapa. Podés corregir tu propio valor si algo lo cambia a mitad de combate; el GM puede editar cualquier fila.
- Algunos ítems dan Iniciativa (+1, +2…), y otros la restan.

> [!warning] Ojo: es "Ini", no "Nitros"
> La Iniciativa decide **cuándo** actuás. Los Nitros deciden **cuánto** podés hacer cuando te toca.

+++
titulo: Modo narrativo y modo combate
alias: [Modo combate, Modo narrativo, Narrativo, Switch de modo]
tags: [combate, mapa]
estado: confirmado
+++
El [[El mapa|mapa]] tiene dos modos, que el **GM** cambia con un switch arriba a la derecha y que **ven todos**:

| Modo | Color | Qué cambia |
|---|---|---|
| **Narrativo** | 🟢 verde | Explorás y hablás. **Moverte, equiparte y girar no cuestan Nitros.** Las [[Inteligencia y habilidades sociales\|habilidades sociales]] van arriba en tu [[La Botonera\|Botonera]]. |
| **Combate** | 🔴 rojo | Todo cuesta [[Nitros (No2)]]. Aparece el **Orden de turnos**. Las habilidades sociales pasan al final de la Botonera. |

> [!tip] Cuándo cambiar
> El GM cambia a combate cuando empieza la pelea y vuelve a narrativo cuando termina, para no andar contando Nitros mientras se explora o se charla.

+++
titulo: Atacar
alias: [Ataque, Ataque cuerpo a cuerpo, PdG, Probabilidad de golpe, Golpear]
tags: [combate, reglas-base]
estado: borrador
+++
Así se resuelve un ataque cuerpo a cuerpo estándar:

1. **El atacante** paga los [[Nitros (No2)|Nitros]] del ataque ([[Costos en Nitros]]) y tira **PdG** (Probabilidad de Golpe, de [[Destreza]]).
2. **El defensor elige** cómo defenderse: [[Evasión]] o [[Parry]] ([[Defenderse de un ataque]]).
3. Es una [[Tirada enfrentada]]: si el atacante gana, **conecta**.
4. El atacante tira el **daño**: los dados de su arma ([[Daño y Tipo de arma]]) **+ su stat Daño** ([[Fuerza]]).
5. Al resultado se le **resta la [[Defensa]]** del objetivo. La diferencia se descuenta de su [[HP]].
6. Si el golpe fue [[Golpe crítico|crítico]], se ignora la Defensa: el daño pasa entero.
7. Si el arma tiene [[Efectos al golpear]], aparecen resaltados en la Mesa (y se tiran, si tienen porcentaje).

> [!example] Con números
> Lía ataca con una espada (1d6) y tiene Daño 3. Tira el dado: sale 4 → 4 + 3 = **7**. El goblin tiene Defensa 2 → pierde **5 HP**.

## En la Botonera
El botón **Atacar** cobra los Nitros y tira PdG; **Daño** tira el daño del arma. Con dos armas, se **desdoblan** (uno por arma; cada una con su propio PdG si tiene modificador propio).

> [!question] Detalles abiertos
> - Si la Defensa es igual o mayor al daño, ¿no se pierde HP o hay un mínimo que siempre pasa (por ejemplo, 1)?
> - Con daño Tipo 10/12 (explosivo) o ataques a varios objetivos, ¿cambia algo de esta secuencia?

+++
titulo: Defenderse de un ataque
alias: [Defensa activa, Defensa cuerpo a cuerpo, Evasión o Parry]
tags: [combate, reglas-base]
estado: borrador
+++
Cuando te atacan cuerpo a cuerpo **elegís cómo defenderte**:

1. **[[Evasión]]:** esquivás por completo. Tirás Evasión contra el PdG del atacante.
2. **[[Parry]]:** desviás el golpe con tu arma. Tirás Parry contra el PdG del atacante.

Si elegiste Parry **y ganás**, se dispara una **segunda tirada** con tu [[Bloqueo]]. Si la ganás también, **el golpe queda anulado**.

> [!warning] "Defensa" son dos cosas
> - **Defensa** (el stat): lo que se resta del daño → [[Defensa]].
> - **Defensa activa** (esta nota): la elección Evasión / Parry.

> [!question] Cadena Parry → Bloqueo
> Hoy cada tirada es suelta y la resuelve la mesa. Falta definir: ¿el Bloqueo es *tu Bloqueo contra el del atacante*? ¿Qué pasa si ganás el Parry pero **perdés** el Bloqueo (¿pasa el golpe entero, reducido, algo intermedio)?

> [!question] Otras dudas
> - ¿Elegir Evasión o Parry es libre en cada ataque, o Parry exige tener un arma equipada?
> - ¿Esto aplica también a ataques a distancia?
> - Los **escudos**, ¿suman a Parry, a Bloqueo o a ninguno? (El Parry *con escudo* todavía no está definido.)

+++
titulo: Evasión
alias: [Eva, Esquivar, Esquiva]
tags: [combate, stats]
estado: confirmado
+++
La **Evasión** es un stat de [[Agilidad]]. Cuando te atacan, podés **esquivar por completo**: tirás tu Evasión contra el PdG del atacante ([[Tirada enfrentada]]). Si ganás, **no te toca**.

- Se tira con el dado que le toca: Evasión 6 → 1d6.
- Tenerla alta te hace difícil de golpear, pero no te protege si te alcanzan: para eso está la [[Defensa]].
- Algunos estados la cambian (por ejemplo, el estado [[Pajaritos]] la reduce a la mitad).
- El estado [[Afortunado]] te deja tirarla dos veces y quedarte con la mejor.

Alternativa: [[Parry]].

+++
titulo: Parry
alias: [Parada, Parar, Parry con arma]
tags: [combate, stats]
estado: borrador
+++
El **Parry** (de [[Destreza]]) es la alternativa a la [[Evasión]]: en vez de esquivar, **desviás el golpe con tu arma**. Tirás Parry contra el PdG del atacante.

- **Cuesta [[Nitros (No2)|Nitros]] siempre:** lo mismo que un *primer ataque* con esa arma (Tipo ÷ 2), sin importar cuántos ataques hiciste en tu turno.
- Con **dos armas** equipadas, elegís con cuál parar.
- Si ganás el Parry, pasás a una segunda tirada de [[Bloqueo]].
- **Sin arma:** el Parry cuesta lo que un ataque sin arma (valor provisorio).
- Estados como [[Lisiado]] te bajan el Parry a la mitad.

> [!question] Parry con escudo
> Es distinto al Parry con arma y todavía no está definido su paso a paso: costo, qué se tira y con qué se suma.

+++
titulo: Bloqueo
alias: [Bloque, Bloquear, Bloqueo con arma]
tags: [combate, stats]
estado: borrador
+++
El **Bloqueo** (de [[Fuerza]]) es la **segunda tirada** de una defensa con [[Parry]]: si ganaste el Parry, tirás Bloqueo; si ganás también esa, **el golpe queda completamente anulado**.

- Se tira con tu stat Bloqueo **más el peso del arma** con la que hiciste el Parry.
- Si tenés dos armas, se usa **la misma con la que hiciste el Parry** (no vuelve a preguntarte).
- Sin arma, el Bloqueo no suma peso.

> [!question] ¿Contra qué se tira?
> La regla original dice "bloque vs. bloqueo": ¿es tu Bloqueo contra el Bloqueo del atacante, o contra otra cosa? Hoy la mesa lo resuelve a mano.

+++
titulo: Defensa
alias: [Def, Defensa (stat), Armadura, Reducción de daño]
tags: [combate, stats]
estado: confirmado
+++
La **Defensa** (Def) es el stat que **reduce el daño físico** que recibís: al recibir un golpe se **resta tu Defensa del daño**, y la diferencia es lo que baja tu [[HP]].

> [!example] Con números
> Te pegan 7 y tenés Defensa 3 → recibís **4** de daño.

- **No sale de ningún atributo**: la dan objetos equipables (armaduras, cascos, escudos…), pero también habilidades y estados (por ejemplo, la *Piel resistente* del [[Tanque]]).
- **Los [[Golpe crítico|golpes críticos]] la ignoran por completo.**
- Se reduce con [[Armadura rota|Romper armadura]] (−1 por acumulación).
- Por eso no hace falta una tirada: es "solo un número".

> [!warning] No confundir con la defensa activa
> El stat **Defensa** resta daño. La *elección* de esquivar o parar es la [[Defenderse de un ataque|defensa activa]].

+++
titulo: Daño y Tipo de arma
alias: [Tipo, Tipo de arma, Tipo de dado, Tipo de daño, Peso, Dado de daño, Dmg, Daño]
tags: [combate, equipo, reglas-base]
estado: confirmado
+++
Cada arma tiene un **Tipo** y un **Peso**. Con esos dos números sabés cuánto pega.

- **Tipo** = las **caras del dado** que tira. Tipo 6 = d6. ("Tipo de dado" y "Tipo de daño" son **la misma cosa**.)
- **Peso** = la **cantidad de dados**. Peso 3 con Tipo 6 = **3d6**.
- A la tirada se le **suma tu stat Daño** ([[Fuerza]]), salvo en armas de rango.
- También puede tener **daño fijo** (un +N que se suma siempre) y **daño amplificado** (dados extra que no suman peso).

## Los cinco Tipos
| Tipo | Es… | Ejemplos |
|---|---|---|
| **4** | Perforante | Daga, cuchillo, honda |
| **6** | Cortante | Espada corta, katana, arco |
| **8** | Cortante pesado / contundente liviano | Hacha, lanza, ballesta |
| **10** | Contundente pesado | Maza, martillo |
| **12** | Explosivo (excepcional) | Lanzallamas, martillo del Titán |

> [!info] El piso es Tipo 4
> Sin arma, se ataca como Tipo 4. (Antes la escala arrancaba en Tipo 2; hoy va **4, 6, 8, 10, 12**.)

## Por qué importa el Tipo
1. **Cuesta [[Costos en Nitros|Nitros]]**: el primer ataque cuesta Tipo ÷ 2; los siguientes, el Tipo completo. Armas pesadas = ataques caros.
2. **Define la [[Resistencia a crítico]] que se aplica.**

Ver también: [[Armas]], [[Atacar]].

+++
titulo: Ataques a distancia
alias: [Rango, Rng, Alcance, Arma de rango, Disparar, Reglas del tiro]
tags: [combate, reglas-base]
estado: borrador
+++
Hay dos conceptos parecidos que comparten el mismo stat (**Rng**, de [[Destreza]]) pero **no son lo mismo**:

| | Qué es | Ejemplo |
|---|---|---|
| **Rango** | La distancia de disparo de un arma **de rango** (arco, pistola, lanzallamas). Su daño **no suma** tu stat Daño. | Arco largo: Rango +5 |
| **Alcance** | Un bono que puede tener un arma **cuerpo a cuerpo** para pegar *más allá* del casillero de al lado, **sin dejar de ser cuerpo a cuerpo** (sí suma Daño). | Lanza: Alcance +1 = pega a 2 casilleros |

## Cómo se ataca a distancia
Funciona **igual que un ataque normal** ([[Atacar]]): PdG contra la defensa del objetivo, y después el daño.

## Distancia certera
Un tirador dispara con certeza hasta una distancia igual a su **Destreza** (en casilleros). Más lejos, puede fallar: se tira **1d20** y hay que sacar:
- hasta Destreza × 2: **7 o más**;
- hasta Destreza × 3: **17 o más**;
- más allá de Destreza × 3: **20**.

> [!question] Confirmar
> - ¿Esta regla del tiro sigue vigente con el stat Rng de la ficha, o Rng ya reemplaza la distancia certera?
> - ¿Aplica Parry a distancia, o es solo cuerpo a cuerpo?

+++
titulo: Efectos al golpear
alias: [Efectos de arma, Efectos de golpe, Envenenar, Sangrado (arma)]
tags: [combate, equipo]
estado: confirmado
+++
Algunas armas tienen **efectos que se aplican al golpeado**: Envenenar, Rompe armadura, Sangrado, Aturdir, Derribar…

## Cómo funcionan en la mesa
Al **tirar el daño** del arma:
- Los efectos **sin porcentaje** aparecen enseguida **resaltados** en la [[La Mesa|Mesa]] ("Envenenar: aplicale Veneno al objetivo").
- Los que tienen porcentaje **abren un pop-up para tirar**: un 50% es una moneda (1d2), un 25% es 1d4, etc. El resultado también queda en la Mesa.

> [!warning] Aplicarlo lo hace el grupo
> La herramienta **recuerda y tira**, pero **no toca el estado del rival**: aplicar el Veneno, romper la armadura o aturdir lo hace la mesa a mano. Es a propósito: ver [[La esencia del Rol Pintoísta]].

> [!example] Espada de Nosferatu
> Tiene dos efectos: "Ignora armadura" (50%: si entra, el golpe ignora la Defensa) y "Drena vida" (siempre: te curás tanto como el daño). Cada uno se anuncia y se tira cuando toca.

Ver también: [[Romper armadura]], [[Veneno]], [[Sangrado]].

+++
titulo: Romper armadura
alias: [Rompe armadura, Armadura rota (efecto)]
tags: [combate, equipo]
estado: borrador
+++
**Romper armadura** es un [[Efectos al golpear|efecto de arma]] (típico de hachas y armas pesadas) con una probabilidad de activarse por golpe (por ejemplo, 50%).

Cada vez que se activa, **baja en 1 la [[Defensa]] que da el equipo** del objetivo. Lo modela el estado [[Armadura rota]]: se acumula (×N) y **es permanente hasta que se repara**.

## Cómo se repara
- Con una **habilidad**, o
- Con el consumible **Óleo reparador** (Común, 25 DDE), que quita la armadura rota entera.

> [!question] Detalles abiertos
> - ¿La reducción tiene piso (puede llegar a Defensa 0 o negativa)?
> - ¿Qué habilidades de clase reparan armadura?

+++
titulo: Inconsciente y muerte
alias: [Muerte, Muerto, Inconsciente, Permadeath, Morir, Revivir, HP 0]
tags: [combate, reglas-base]
estado: borrador
+++
Cuando tu [[HP]] llega a **0**, quedás **inconsciente**. Todavía no estás muerto.

- Tenés una ventana de **5 [[Mantenimiento|mantenimientos]]** para que te revivan.
- Dentro de esa ventana se puede revivir con **objetos o efectos** (por ejemplo, el consumible *Ankh de Reencarnación*, que si estaba en tu cinturón te revive con el 25% del HP).
- Si pasan los 5 mantenimientos sin que te revivan, **morís**: quedás **muerto** para siempre (lo que antes se llamaba *permadeath*).

## Qué pasa con la experiencia
Al terminar un combate, un personaje **inconsciente** recibe solo el **25%** de la experiencia que le tocaba (redondeado hacia abajo). Uno **muerto** no recibe nada. Ver [[Experiencia y despojos]].

> [!tip] Un aliado puede salvarte
> Aunque el Ankh no esté en tu cinturón, **un aliado puede usarlo sobre tu cuerpo** para revivirte.

> [!question] Estando inconsciente
> - ¿Podés hacer algo estando inconsciente, o quedás fuera de juego hasta que te revivan?
> - ¿Cuánto HP devuelve un revivir (1, la mitad, el máximo, depende del objeto)?
> - ¿Los 5 mantenimientos cuentan desde el que sigue al HP 0?
> - ¿Cambia algo fuera de combate (por ejemplo, caer inconsciente por veneno sin pelea activa)?

+++
titulo: Sigilo
alias: [Sigilo, Ocultarse, Esconderse, Invi, Estar oculto]
tags: [sigilo, combate, mapa]
estado: borrador
+++
Un personaje o un creep puede **entrar en sigilo desde el mapa**: queda oculto para el bando rival.

## Cómo se entra
- Es una **habilidad estándar** ("Sigilo") que aplica el estado [[Sigilo (estado)|Sigilo]] sobre uno mismo. Quien la tenga cargada la ve como botón directo en la [[La Botonera|Botonera]].
- Cuesta **1 No2** (a revisar). Moverte en sigilo cuesta lo mismo que moverte normal.

## Quién ve qué
| En sigilo | Lo ven | No lo ve |
|---|---|---|
| Un **personaje** | Su dueño y los demás jugadores (semitransparente) | El **GM** |
| Un **creep** | El **GM** (semitransparente) | Los jugadores |

Cuando estás en sigilo ves el mapa con un **filtro violáceo tenue**, y tus tiradas se siguen viendo en la [[La Mesa|Mesa]].

## Cuándo se rompe
1. **Automáticamente:** si entrás en el **cono de detección** de un enemigo ([[Campo de visión]]).
2. **Por una acción hostil:** cualquier acción con efecto directo sobre un enemigo (un ataque, una skill individual). Esto lo hace saber **el jugador a mano** (botón de la Botonera); el GM quita el estado del creep.
3. Cuando te detectan, **aparecés donde te detectaron** y dejás una marca de tu última posición por **dos turnos**.

## Detección
Cada **paso que das dentro de la zona de alerta** de un enemigo provoca una **tirada de detección** ([[Campo de visión]]). Es manual: el mapa cuenta los pasos y avisa; la resuelve la mesa (en principio **Destreza del que se esconde contra Especial del que vigila**). También se puede **buscar a propósito**, igual de manual.

> [!info] Todo el ocultamiento es visual
> El juego asume amigos de confianza: el mapa oculta lo que no debés ver, pero no hay un candado técnico.

> [!question] A revisar
> - Costo de entrar en sigilo: 1 No2 (a revisar con el grupo).
> - ¿Qué cuenta como "acción hostil"? (Por ejemplo, invocar una nube tóxica en área: ¿rompe el sigilo?)
> - Las invocaciones en sigilo: falta probarlas.

+++
titulo: Campo de visión
alias: [Cono, Cono de detección, Zona de alerta, Detección, Punto ciego, Visión, Orientación, Rotación]
tags: [sigilo, mapa]
estado: borrador
+++
Cada token del mapa **mira hacia uno de los 6 lados** de su hexágono (por defecto, hacia abajo). Se gira arrastrando el asa celeste ↻. **Girar cuesta 1 No2 por cada giro de 60°** (solo en combate), y al moverte quedás mirando hacia donde caminaste.

## Las tres zonas
| Zona | Qué es | Qué pasa |
|---|---|---|
| **Cono** (azul) | Los **16 hexágonos** de un rombo de 4 × 4 justo delante del token | Si alguien en [[Sigilo]] **entra acá**, **es detectado automáticamente**. |
| **Zona de alerta** (naranja y roja) | El anillo alrededor del cono más los vecinos del token, menos el de atrás | **Cada paso** dentro provoca una **tirada de detección** (manual). |
| **Punto ciego** | Atrás del token | Ahí no te ve. |

Los tienen **personajes, creeps e invocaciones** por igual. Los sólidos del mapa (paredes, rocas) **tapan la vista**.

## Verlos en el mapa
Cuando estás en sigilo se te dibujan el cono y la alerta (semitransparentes). El botón **👓 Ver conos** los muestra u oculta, con opciones (lentes) para filtrar cuáles.

> [!info] También se puede evaluar sin comprometerse
> Podés **arrastrar tu token para probar rutas**: nada se efectiviza (ni se rompe el sigilo) hasta que lo soltás en un lugar.

> [!question] Modificadores
> Se prevé que el cono y la superficie de visión puedan **modificarse** con efectos de ítems, skills o estados (por ejemplo, la pasiva *Percepción aumentada*). Falta definir cuáles y cuánto.

+++
titulo: Niebla de guerra
alias: [Niebla, Visión del grupo, Fog of war]
tags: [mapa, sigilo]
estado: borrador
+++
Con la **niebla de guerra** prendida (la activa el GM por mapa), **solo ves lo que tu grupo ve o vio**:

- **Negro**: nunca visto. No se ve ni el mapa ni los tokens.
- **Gris semitransparente**: ya descubierto pero fuera de la visión de ahora. Se ve el mapa, pero **no los tokens** que no sean aliados.
- **Visión por defecto:** un radio de **6 casilleros** menos una **cuña ciega de 120° hacia atrás**. Gira con el frente del token.
- Cada jugador ve la **unión** de lo que ven todos los personajes (incluidas las [[Invocaciones]] mientras estén invocadas y vivas).
- **Lo descubierto es del grupo y persiste.**
- Cuando un enemigo sale de tu visión queda una marca **"?"** donde lo viste por última vez.

El GM puede **destapar o tapar a mano** con un pincel, "ver como jugador" y reiniciar. El stat **Visión** de la ficha permite cambiar el radio.

> [!question] Pendientes de diseño
> Obstáculos que tapen la vista, y ocultar de verdad (hoy es solo visual) las listas que nombran tokens fuera de la visión.

+++
titulo: Trampas
alias: [Trampa, Trampas ocultas, Fuego amigo, Catálogo de trampas]
tags: [mapa, combate]
estado: borrador
+++
Jugadores y GM pueden **poner trampas en el mapa**. Una trampa es un objeto de **Terreno y Formas** con la casilla **"Trampa (oculta a los rivales)"**, un nombre y un texto de "qué hace".

## Cómo funcionan
- **Los rivales no la ven.** La ven solo su dueño y el GM hasta que se dispara. Armada se dibuja **ámbar con ⚠**; disparada, **roja con ✖** para todos.
- **Quién la dispara:** los creeps, si la puso un jugador; los personajes, si la puso el GM. **Los aliados nunca**, salvo que tenga **"Fuego amigo: SÍ"**: entonces la disparan también los aliados y su dueño.
- Al soltar un movimiento, si algún casillero de la ruta pisa la trampa, **el movimiento se corta ahí** y aparece una línea roja en la [[La Mesa|Mesa]] con el nombre, quién la activó y qué hace.
- **Daño automático:** si la trampa tiene una tirada de daño (por ejemplo, 2d6), el mapa la tira solo y se la aplica a quien la activó, restando su [[Defensa]]. En un área también daña a los creeps de adentro cuando mueve el GM; a los demás se les avisa en la Mesa. **Estados y tiradas para evitarla siguen a mano**, y el texto de cada trampa lo aclara.

## Detectarlas
La pasiva **Percepción aumentada** ([[Pasivas]]) te interrumpe el movimiento al quedar justo al lado de una trampa y avisa que corresponde una **tirada de percepción** (botón 🔎 en la Botonera: [[Especial]], con dado más alto por escalón).

## Guardarlas y compartirlas
- **💾 Guardar como recurrente:** deja la trampa (nombre, efecto, forma, tamaño, color) en tu lista "Trampas guardadas" (por navegador).
- **📤 Proponer** al catálogo de trampas: el dueño del proyecto las revisa y pasan a ser oficiales.
- **📚 Catálogo de trampas:** 24 trampas de ejemplo (oso, foso, mina, nube de veneno, runas…), todas "creadas automáticamente: requieren auditar", con buscador y filtros. → [[Biblioteca de la comunidad]]
- **Crear una trampa custom:** en el mismo catálogo, un asistente paso a paso te guía: clase, qué hace, forma, nombre y aspecto, resumen.

> [!question] Todavía sin decidir
> ¿Hay tirada para **detectar o desarmar** una trampa? ¿Hay límite para crearlas (cantidad, costo de No2, solo en combate)? ¿Habrá **trampas como consumibles** del catálogo?

+++
titulo: Invocaciones
alias: [Invocación, Invocar, Mascotas, Summons]
tags: [combate, personaje]
estado: borrador
+++
Una **invocación** es una criatura o aliado que **traés a la pelea con una habilidad** (un espíritu, un robot, una mascota). **La maneja el jugador que la invoca**, no el GM, con las mismas funciones que un [[Creeps|creep]].

Cada invocación tiene:
- **Atributos** con sus stats derivados y **HP** propios.
- Su **propio No2** (paga mover y atacar igual que un personaje: [[Costos en Nitros]]).
- **Arma y armadura** propias (con el mismo asistente de ítems), **resistencia a críticos** y [[Estados alterados|estados]].
- **Habilidades** propias.
- Su **propia Botonera** ("▶ Usar" en la tarjeta) y su token en el mapa.

Mientras están **invocadas y vivas**, dan **visión** al grupo ([[Niebla de guerra]]) y tienen [[Campo de visión|cono y alerta]] como cualquier token.

> [!tip] Ficha aparte
> En la ficha están en la sección **Invocaciones**, al final. "✎ Editar" abre atributos, arma, armadura, habilidades y estados.
