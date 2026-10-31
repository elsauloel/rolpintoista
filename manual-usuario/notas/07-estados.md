+++

capitulo: Estados alterados

icono: 🌀

resumen: Los efectos temporales (buffs y debuffs) que te cambian los números: veneno, sigilo, escudos, control…

+++



+++

titulo: Estados alterados

alias: [Estados, Estado, Buffs, Debuffs, Efectos, Buff, Debuff]

tags: [estado, reglas-base]

estado: borrador

+++

Un **estado alterado** es un efecto **temporal** (o permanente hasta que se cure) que cambia cómo funciona tu personaje. Puede ser bueno (**buff**) o malo (**debuff**).



## Cómo se ven y cómo duran

- Aparecen como **chips** en la ficha y como íconos en tu token del mapa. Pasá el mouse: te dicen qué hacen.

- Tienen **turnos restantes** (o son *permanentes*), y a veces **stacks** (acumulaciones).

- En cada [[Mantenimiento]] **bajan los turnos**; los que llegan a 0 se van. Con orden de turnos, bajan **al empezar el turno** de quien los tiene.

- **Turnos completos para lo que pesa en tus acciones.** Un estado que cambia lo que hacés al actuar —más o menos Probabilidad de Golpe, daño, Efecto especial o crítico; algo que se suma a tus golpes; o Pajaritos, Lisiado, Ceguera, Silencio, Confusión, Extenuado, Atormentado, Maldito— te dura **turnos completos**: el turno en que te lo ponen no cuenta, aunque sea el tuyo. Uno de 2 turnos lo tenés durante tus 2 turnos siguientes enteros. Los que cambian algo pasivo (más o menos Defensa, Evasión, resistencias, Espinas…) valen desde que te los ponen y cuentan como siempre.

- Pueden dar bonos o penalidades a stats (por ejemplo, +5 Defensa), o tener reglas propias (por ejemplo, "no podés moverte").



## Cómo se aplican

- Una **habilidad** o un **consumible** puede aplicarse un estado a sí mismo (esto sí se automatiza).

- Los estados que un ataque aplica a un **rival** ([[Efectos al golpear]]) **los pone la mesa a mano**: el GM elige el estado en la ficha del creep, o el jugador en la suya.

- Podés crear estados propios (personalizados) para lo que se te ocurra.



> [!tip] Regla de redondeo (2026-09-22)

> Cuando un debuff o un buff tiene que redondear un número: **los debuffs redondean hacia abajo** (menos favorable) y **los buffs redondean hacia arriba** (más favorable), salvo que se diga lo contrario en ese estado puntual. Por eso Cansado, Exhausto, Pajaritos y Lisiado usan `floor` — son debuffs.



## Los estados base

| Estado | Tipo | En una línea |

|---|---|---|

| [[Veneno]] | debuff | Pierde HP por stack cada turno |

| [[Sangrado]] | debuff | Pierde 2 HP por turno hasta curarse |

| [[Regeneración]] | buff | Cura HP cada turno |

| [[Pajaritos]] | debuff | PdG, PdG.Esp y Evasión a la mitad |

| [[Lisiado]] | debuff | PdG y Parry a la mitad |

| [[Stun]] | debuff (CC) | Sin Nitros |

| [[Cansado y Exhausto\|Cansado / Exhausto]] | debuff | Menos Nitros |

| [[Rengo]] | debuff | Moverse cuesta el doble |

| [[Inmovilizado]] | debuff | No te podés mover |

| Escarcha | debuff | −1 a los No2 máximos **por stack** (se acumula: cada aplicación suma uno y renueva la duración) |

| Parálisis | debuff (CC) | PdG, Parry y Evasión a la mitad (una sola vez por stat; no se suma a Lisiado ni a Pajaritos) |

| [[Sentado]] | debuff (CC) | Evasión a la mitad, no podés atacar ni hacer dodge roll; levantarte cuesta 1 No2 |

| [[Armadura rota]] | debuff | −1 Defensa por acumulación |

| [[Escudo mágico]] | buff | Barra extra de HP |

| [[Invulnerable]] | buff | No recibís daño |

| [[Afortunado]] | buff | Tirás dos veces y te quedás con la mejor |

| [[Sigilo (estado)\|Sigilo]] | buff | Estás oculto |



> [!warning] Provisorios

> Varios valores de la lista (Cansado, Exhausto, Rengo, Inmovilizado) están marcados en la ficha como **provisorios** (ex Acciones/Movimiento pasados a Nitros 1 a 1 sin recalibrar).



> [!question] Repaso pendiente

> Falta revisar **uno por uno** todos los buffs y debuffs (qué hace cada uno exactamente, duración, si es acumulable). Esta lista es lo que hoy hace la ficha.



+++

titulo: Veneno

alias: [Envenenado, Veneno severo, Stacks de veneno]

tags: [estado]

estado: borrador

+++

**Veneno** es un debuff de daño por turno: **pierde 1 HP por stack cada turno**, en el [[Mantenimiento]]. Los stacks y los turnos arrancan igualados y se van agotando juntos.



- **Se acumula:** si te envenenan estando envenenado, los stacks nuevos **se suman** a los que ya tenés (4 + 4 = 8) en un solo estado, y los turnos pasan a valer el total de stacks para que se agoten juntos. No hay tope de stacks.

- **Veneno severo** es un estado aparte: hace 1 de daño el primer turno y **aumenta 1 con cada mantenimiento**. No caduca y **no se acumula** (si ya lo tenés, una segunda aplicación no hace nada). Comparte con el Veneno común la idea de "veneno": un antídoto cura **ambos**.

- Se **cura** con consumibles (por ejemplo, un antídoto) o habilidades.

- Lo bloquean [[Invulnerable]] y el estado **Sangre pura** (inmunidad a veneno).



> [!question] Cura automática

> Hoy quitar el veneno con un antídoto es a mano (se saca el estado). Falta una mecánica de "cura estados" para consumibles y habilidades, que quite los dos venenos de una vez.



> [!question] Nube tóxica

> La *Nube tóxica* del [[Debuffer]] "solo aplica 1 stack a personajes ya envenenados": ¿se mantiene así o pasa a aplicar los stacks normales?



+++

titulo: Sangrado

alias: [Sangrando, Herida]

tags: [estado]

estado: borrador

+++

**Sangrado** es un debuff **permanente** que hace perder **2 HP por turno** hasta que se cura.



- **Se acumula (2026-09-22): si te vuelven a sangrar mientras ya sangrás, no se duplica el estado — suma +1 al daño por turno** (2 → 3 → 4…). Mismo criterio que Armadura rota: un stack más en el mismo estado, no una tirada nueva.
- **Sangrado de un arma (2026-10-03, regla del dueño):** salvo que el arma diga otra cosa, deja **2 de daño por turno durante 2 turnos**. **Si ya estaba sangrando:** +1 stack (un punto más de daño por turno) y los turnos vuelven a empezar. Con un golpe crítico, queda permanente (abajo).
- **Sangrado por unos turnos (2026-10-03):** algunas armas y habilidades dejan un Sangrado que dura solo unos turnos (por ejemplo, 2). **Pero si entra con un golpe crítico de arma, queda permanente**, como el de siempre — venga del arma o de la habilidad con la que se atacó. Es una característica del Sangrado (regla del dueño). El duelo lo hace solo.

- Lo cura una habilidad o un ítem (por ejemplo, *Vendas*).

- Lo bloquea el estado **Coagulación extrema** (inmunidad a sangrado) e [[Invulnerable]].



+++

titulo: Regeneración

alias: [Regen, Regen de HP, Regenerar]

tags: [estado, recursos]

estado: confirmado

+++

**Regeneración** es un buff que **cura HP cada turno** (5 por defecto, durante unos turnos). En el [[Mantenimiento]], cada estado de regeneración te suma su cura.



Además existe la [[Pasivas|pasiva]] *Regeneración* (+3 HP por turno) que funciona sin turnos, siempre.



+++

titulo: Pajaritos

alias: []

tags: [estado]

estado: borrador

+++

**Pajaritos** es un debuff (típico del [[Tanque]] y de golpes fuertes en la cabeza): **tu PdG, tu PdG.Esp y tu Evasión quedan a la mitad** (redondeado hacia abajo) mientras dure.



> [!question] Definición de clase

> El *Tanque* lo define como "reduce a la mitad todas las tiradas de DES, ESP y AGI". ¿Cuál vale: solo PdG y Evasión (lo que hace la ficha) o todos los stats de esos atributos?



+++

titulo: Escarcha y Parálisis

alias: [Escarcha, Parálisis, Congelado]

tags: [estado, elemental]

estado: borrador

+++

Los estados del **hielo** y del **rayo** (elementos de la magia, todavía en definición).



- **Escarcha** (hielo): **−1 a tus No2 máximos por cada stack.** Se **acumula**: si te la vuelven a poner mientras la tenés, suma un stack (×2, ×3…) y renueva la duración. **Fuego y hielo se cancelan entre sí** (a mano, por ahora).

- **Parálisis** (rayo): **PdG, [[Parry]] y [[Evasión]] a la mitad** (redondeado hacia abajo). Es una mezcla de [[Lisiado]] y [[Pajaritos]], más suave que un [[Stun]]. Cada stat se parte **una sola vez**: no se suma a Lisiado ni a Pajaritos sobre el mismo stat.



Los dos están en el menú de estados alterados (debuffs) de la ficha y de las herramientas del GM.



El **rayo** además puede **saltar en cadena**: hasta **4 casillas** de distancia, **una sola vez por objetivo**, y cada salto hace la **mitad del daño** del anterior (redondeado hacia arriba). Es daño mágico, así que va **directo a la vida**. En el mapa, el menú de vida de un token tiene el botón **⚡ Rayo en cadena**.



+++

titulo: Terreno incendiado

alias: [Fuego, Incendio, Terreno en llamas]

tags: [estado, mapa, elemental]

estado: borrador

+++

El **fuego** trabaja en **área** y deja el terreno **incendiado**: en el mapa, en *Terreno y Formas*, se marca la forma como **🔥 Terreno incendiado** (una flor para una bola de fuego, una forma libre para una llamarada). Tiene un **daño de fuego** (valor inicial **5**, se puede cambiar al crearla y después desde el ⚙).



- **Al entrar** en el terreno incendiado (viniendo de afuera) recibís el daño. Si el recorrido cruza el fuego más de una vez, cuenta cada entrada.

- **En cada ⟳ Mantenimiento**, todo el que **siga adentro** lo recibe de nuevo.

- El daño es **directo a la vida** (el fuego es daño mágico elemental: no hay defensa mágica).

- Con **"Turnos que dura"** el fuego se apaga solo.



Lo aplica solo el que maneja al token (cada jugador a sus personajes, el GM a los creeps); las invocaciones se avisan en la Mesa para aplicarlas a mano. [[Escarcha y Parálisis|Fuego y hielo se cancelan entre sí]] (a mano, por ahora).



+++

titulo: Lisiado

alias: [Lisiar]

tags: [estado]

estado: borrador

+++

**Lisiado** es un debuff: **PdG y [[Parry]] a la mitad** (redondeado hacia abajo) mientras dure. Lo aplican habilidades como *Lisiar* del [[Asalto]] y lo cura, por ejemplo, un ítem de vendas.



+++

titulo: Stun

alias: [Aturdido, Aturdir, Stun (estado)]

tags: [estado, control]

estado: borrador

+++

**Stun** es un debuff de control ([[Crowd Control]]): **no tenés Nitros** mientras dura. Podés pensar pero no actuar.



- **Dura 2 turnos** (no 1): si durara solo 1, el Mantenimiento podría gastarlo antes de que te toque jugar y no perderías nada de verdad. Con 2, siempre te agarra en tu próximo turno.

- **Cualquier tirada de Evasión falla directo** mientras dura: ni hace falta tirar el dado. Es a mano — no lo calcula la herramienta.

- Lo evita el estado **Inmunidad a CC**.

- Tu resistencia a esto es [[Resistencias|Res. CC]].



+++

titulo: Cansado y Exhausto

alias: [Cansado, Exhausto, Hypeado, Fatiga]

tags: [estado, recursos]

estado: pendiente

+++

Tres estados que modifican tus [[Nitros (No2)|Nitros]]:



| Estado | Efecto |

|---|---|

| **Cansado** (debuff) | Corta los Nitros máximos a 2/3 (pierde un tercio, redondeado hacia abajo) |

| **Exhausto** (debuff, CC) | Corta los Nitros máximos a un tercio del natural (redondeado hacia abajo) |

| **Hypeado** (buff) | Suma a los Nitros máximos un tercio del natural (redondeado hacia arriba): con 9 llegás a 12, con 7 a 10 |



> [!info] Cansado y Exhausto ya recalibrados (2026-09-21)

> Los dos eran "−1 Acción / 1 Acción fijo" de la época en que las Acciones iban de 1 a 3 por turno (así que 1 Acción era, más o menos, un tercio de la capacidad del turno). Se recalibraron con esa misma lógica: Cansado te deja con 2/3 de tus Nitros (perdés un tercio) y Exhausto te deja con un tercio (perdés dos tercios). Si los dos están activos a la vez, gana el más restrictivo (Exhausto) — no se suman.



> [!info] Hypeado recalibrado (2026-09-24)

> Antes era "+1 Acción", que en la época de las Acciones (de 1 a 3 por turno) era más o menos un tercio del turno. Con la misma lógica que Cansado y Exhausto, ahora suma un tercio de tus Nitros naturales, redondeado hacia arriba (es un buff). Si tenés Cansado y Hypeado a la vez, se compensan; Stun y Exhausto siguen poniendo su tope.



> [!question] Causa fatiga

> Existe una condición "Causa fatiga" pendiente que el dueño va a definir con el grupo.



+++

titulo: Rengo

alias: [Rengo (estado)]

tags: [estado]

estado: pendiente

+++

**Rengo** es un debuff de movimiento: **moverte cuesta 2 Nitros por casillero** mientras dure (antes era "Movimiento a la mitad").



+++

titulo: Sentado

tags: [estado, control]

estado: pendiente

+++

**Sentado** es un debuff de control: estás en el piso. Tu **Evasión se parte a la mitad** (se tira el dado completo y al resultado se lo divide por 2, para abajo, mínimo 1) **no podés atacar** (la ficha te avisa y te deja seguir si querés) y **no podés hacer dodge roll** (a mano, hasta que exista esa tirada). No vence solo: **levantarte cuesta 1 No2** (botón *Levantarse* de la Botonera, o de las Acciones de un creep), y con eso se saca el estado.



+++

titulo: Inmovilizado

alias: [Enraizado, Atrapado, Inmovilizar]

tags: [estado, control]

estado: pendiente

+++

**Inmovilizado** es un debuff de control: **no te podés mover** mientras dure. Los Nitros siguen sirviendo para todo lo demás (atacar, habilidades…).



> [!warning] Regla provisoria

> Está marcada como provisoria en la ficha. En el mapa, un personaje inmovilizado no gasta Nitros al arrastrar porque no debería poder moverse.



+++

titulo: Armadura rota

alias: [Armadura rota (estado)]

tags: [estado, equipo]

estado: borrador

+++

**Armadura rota** castiga la armadura: **−1 Defensa por cada acumulación** (×N). Es **permanente y acumulable**: cada vez que le rompen la armadura ([[Romper armadura]]) suma una. **En un personaje no queda como estado**: la rotura cae en una pieza de armadura equipada al azar y se arregla reparando esa pieza. En creeps e invocaciones es este estado (los − del chip lo bajan).



> [!info] Armadura arruinada se sacó (2026-09-21)

> Existía un segundo estado, Armadura arruinada, que anulaba al 100% lo que daba la armadura. Se eliminó del repaso de debuffs; lo que la aplicaba (algunas hachas, un par de armas naturales y una habilidad de creep) ahora suma stacks de Armadura rota en su lugar.



+++

titulo: Escudo mágico

alias: [Barrera, Escudo, Blindaje, Absorber daño]

tags: [estado, recursos]

estado: borrador

+++

Estado que funciona como una **barra de HP secundaria**: absorbe el daño que fuera a recibir —incluso el daño verdadero— **antes de que te toque el HP**.



| Estado | Cuánto absorbe | Duración |

|---|---|---|

| **Escudo mágico** | 10 (editable) | 3 turnos; se **recarga entero en cada Mantenimiento** mientras dure |

| **Barrera** (el *Blindaje* del [[Tanque]]) | 8 | Hasta el próximo Mantenimiento; si el golpe es mayor, **el resto entra normal** |



Se ve como una barra 🛡 sobre tu token.



+++
titulo: Maldito
alias: [Maldición de la sangre, Maldición]
tags: [estado, debuff, sp]
estado: confirmado
+++
**Maldito** es un debuff de 2 turnos (lo pone la **Maldición de la sangre** del Kobold maldiciente): **cada punto de SP que gastes te saca 1 de vida**, directo, **en el momento de pagar**, antes de que salga el efecto. Puede dejarte caído.

- Antes de pagar te aparece un aviso: «Estás Maldito: usar tal cosa cuesta N SP y te va a bajar N de vida (de A a B)», con **Aceptar** o **Cancelar**. Si cancelás, no se cobra nada.
- Vale para todo lo que pagás con SP: habilidades (también las de costo X, como Drenar Vida), armas especiales, Flash, Carga Elemental, Empower y Re-roll.
- A un creep no le hace nada: los creeps no usan SP.

⚙ Automatizado.

+++
titulo: Etéreo
alias: [Etérea, Etereo]
tags: [estado, buff, mapa]
estado: confirmado
+++
**Etéreo** (dueño, 2026-10-20): quien lo tiene **solo observa** hasta que se le va el estado.

- **Nadie le puede hacer nada**: no es objetivo de ataques, habilidades, áreas ni del salto del rayo (tampoco de los aliados: no se lo cura ni se lo bufea).
- **Él tampoco actúa**: no ataca ni usa habilidades o consumibles. Si lo intenta, el mapa avisa y deja «Hacerlo igual» (lo decide la mesa).
- **Puede moverse**, y atraviesa todo: personajes, objetos sólidos y paredes. No pisa trampas ni zonas, y no da ni recibe ataques de oportunidad.
- Todos lo ven, medio transparente.

Lo lleva puesto el **Ojo de Kicillof** (pergamino y habilidad del Support). Lo único que podría afectarlo sería una Disipación de magia, que todavía no existe.

⚙ Automatizado en el mapa.

+++

titulo: Invulnerable

alias: [Inmunidad, Blindado, Inmunidad a CC, Inmune]

tags: [estado]

estado: borrador

+++

**Invulnerable** es un buff: **no recibís daño de ninguna fuente** (golpes, veneno, sangrado…) y no te pueden aplicar ningún debuff.



Parientes más limitados:

- **Blindado:** inmune a [[Golpe crítico|golpes críticos]]. **A mano**: la herramienta solo recuerda que está activo y cuántos turnos dura; el que lleva la mesa anula el crítico.

- **Espinas:** devuelven al atacante **1/4 (25 %) del daño crudo** de cada golpe **cuerpo a cuerpo** (antes de Defensa y escudos, redondeado hacia arriba, directo a la vida). Solo el daño físico. ⚙ El duelo lo aplica solo.
- **Espejo** (la pareja de las Espinas, 2026-10-07): devuelve al que lo tiró **1/4 del daño especial** que recibís (varita, báculo, habilidad o el daño elemental de un arma), **a cualquier distancia** y también en un área; antes de la Defensa especial, redondeado hacia arriba, directo a la vida. Las zonas que quedan en el piso y los saltos del rayo no cuentan. ⚙ El duelo lo aplica solo.

- **Inmunidad a CC:** inmune a los estados de control: [[Stun]], Exhausto, [[Inmovilizado]], Rengo, Lisiado y Pajaritos (Veneno y Sangrado no cuentan como control).

- **Sangre pura:** inmune a [[Veneno]]. **Coagulación extrema:** inmune a [[Sangrado]].



> [!info] Inmunidades sin mecanismo

> Algunos ítems dicen "inmunidad a X" pero **casi todos son un recordatorio**: el jugador y el GM lo tienen en cuenta a mano. Solo unos pocos están cableados a un estado real.



+++
titulo: Vuela
alias: [Volador, Vuelo, Volar]
tags: [estado, movimiento]
estado: confirmado
+++
**Vuela** es un buff, casi siempre **permanente** (lo llevan de nacimiento las criaturas que vuelan, como las abejas de Bizzante). Quien vuela **va bajo, pero nunca toca el piso**:

- No lo frena el terreno lento, **no pisa ni detecta trampas** y no lo tocan las zonas del piso (púas, brea, brasas). Las zonas del aire (gas, nube, humo) sí lo alcanzan. Es como Levitar, pero sin límite de casilleros y sin aterrizar al terminar el turno.
- **Pasa por encima de los tokens**, aliados y rivales, pero no de las paredes ni de los Sólidos, y no puede terminar su movimiento encima de nadie.
- Si cruza por encima de un **rival**, **antes** de pasar ese rival tiene su [[Ataque de oportunidad]] (el mapa lo frena al lado y pregunta, como cuando alguien se aleja). Del otro lado ya no hay otro.
- **No le entran Sentado ni Rengo**: no se lo puede tirar al piso ni dejar rengo.
- Cuerpo a cuerpo **se le pega normal**: vuela bajo. Y a los **disparos** (arco, ballesta, honda, arrojadiza) se expone más: **−1 a la Evasión** contra ellos.
- También es una **pasiva** («+ Pasiva → Vuela»): mientras la tenga, lleva puesto el estado. Así la tienen las abejas de Bizzante.

⚙ Automatizado: todo lo de arriba lo hace el mapa solo.

+++

titulo: Sigilo (estado)

alias: [Estado de sigilo]

tags: [estado, sigilo]

estado: borrador

+++

El estado **Sigilo** (buff, permanente hasta que se rompe) marca que **estás oculto**: los enemigos no te ven en el mapa. Se rompe si entrás en el cono de detección de un enemigo o si hacés una acción hostil. Todo el detalle está en [[Sigilo]] y en [[Campo de visión]].



+++

titulo: Crowd Control

alias: [CC, Control, Estados de control, Res.CC]

tags: [estado, control]

estado: borrador

+++

**Crowd Control (CC)** agrupa a los estados que **te quitan control sobre lo que hacés**: [[Stun]], Exhausto, [[Inmovilizado]], Rengo, Lisiado y Pajaritos — todo lo que te imposibilita actuar. Veneno y Sangrado no cuentan. Los identifica una marca especial en la ficha.



- Tu defensa contra ellos es la [[Resistencias|Res. CC]] (de [[Constitución]]).

- **Inmunidad a CC** los bloquea.



+++

titulo: Resistencias

alias: [Res.Esp, Res.Mg, Res.CC, Res.M, Res.Mt, Resistencia especial, Resistencia mágica, Resistencia mental, Resistencia a CC]

tags: [stats, estado]

estado: pendiente

+++

Hay tres resistencias que se tiran **contra** hechizos, maldiciones y efectos:



| Resistencia | Sale de | Se usa contra |

|---|---|---|

| **Res. Especial** (Res.Esp; antes Res.Mg) | [[Constitución]] | Daño y efectos mágicos |

| **Res. CC** | Constitución | Estados de [[Crowd Control]] |

| **Res. Mental** (Res.Mt) | [[Especial]] | Control mental, maldiciones de mente |



> [!question] En pausa: están mezcladas

> Las tres todavía están en **terreno ambiguo** entre sí (incluso si "Res.M" de las cartas de clase se refiere a una, a otra o a ambas). **Se amplía cuando el dueño termine de definirlo**: no hace falta seguir preguntando por ahora.



## Excedente de vida



Estado para una habilidad excepcional que deja tener **más vida que el máximo** (por ejemplo, drenar vida). Es un valor neto: **sin tope y sin recarga**; se sube o baja a mano desde el chip del estado o desde el token, y absorbe el daño antes que la vida (después de los escudos). No vence por turnos salvo que se le pongan.

