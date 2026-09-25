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
- En cada [[Mantenimiento]] **bajan los turnos**; los que llegan a 0 se van.
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
| [[Pajaritos]] | debuff | PdG y Evasión a la mitad |
| [[Lisiado]] | debuff | PdG y Parry a la mitad |
| [[Stun]] | debuff (CC) | Sin Nitros |
| [[Cansado y Exhausto\|Cansado / Exhausto]] | debuff | Menos Nitros |
| [[Rengo]] | debuff | Moverse cuesta el doble |
| [[Inmovilizado]] | debuff | No te podés mover |
| [[Sentado]] | debuff (CC) | Evasión a la mitad, sin dodge roll; levantarte cuesta 1 No2 |
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
**Pajaritos** es un debuff (típico del [[Tanque]] y de golpes fuertes en la cabeza): **tu PdG y tu Evasión quedan a la mitad** (redondeado hacia abajo) mientras dure.

> [!question] Definición de clase
> El *Tanque* lo define como "reduce a la mitad todas las tiradas de DES, ESP y AGI". ¿Cuál vale: solo PdG y Evasión (lo que hace la ficha) o todos los stats de esos atributos?

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
**Sentado** es un debuff de control: estás en el piso. Tu **Evasión se parte a la mitad** (se tira el dado completo y al resultado se lo divide por 2, para abajo, mínimo 1) y **no podés hacer dodge roll** (a mano, hasta que exista esa tirada). No vence solo: **levantarte cuesta 1 No2** (botón *Levantarse* de la Botonera, o de las Acciones de un creep), y con eso se saca el estado.

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
**Armadura rota** castiga tu armadura: **−1 Defensa por cada acumulación** (×N). Es **permanente y acumulable**: cada vez que te rompen la armadura ([[Romper armadura]]) suma una. Solo se cura con un ítem (el *Óleo reparador* la quita entera) o una habilidad especial.

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
titulo: Invulnerable
alias: [Inmunidad, Blindado, Inmunidad a CC, Inmune]
tags: [estado]
estado: borrador
+++
**Invulnerable** es un buff: **no recibís daño de ninguna fuente** (golpes, veneno, sangrado…) y no te pueden aplicar ningún debuff.

Parientes más limitados:
- **Blindado:** inmune a [[Golpe crítico|golpes críticos]]. **A mano**: la herramienta solo recuerda que está activo y cuántos turnos dura; el que lleva la mesa anula el crítico.
- **Espinas:** devuelven un 50 % del daño de un golpe físico cuerpo a cuerpo al atacante. **A mano**, igual que Blindado.
- **Inmunidad a CC:** inmune a los estados de control: [[Stun]], Exhausto, [[Inmovilizado]], Rengo, Lisiado y Pajaritos (Veneno y Sangrado no cuentan como control).
- **Sangre pura:** inmune a [[Veneno]]. **Coagulación extrema:** inmune a [[Sangrado]].

> [!info] Inmunidades sin mecanismo
> Algunos ítems dicen "inmunidad a X" pero **casi todos son un recordatorio**: el jugador y el GM lo tienen en cuenta a mano. Solo unos pocos están cableados a un estado real.

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
alias: [Res.Mg, Res.CC, Res.M, Res.Mt, Resistencia mágica, Resistencia mental, Resistencia a CC]
tags: [stats, estado]
estado: pendiente
+++
Hay tres resistencias que se tiran **contra** hechizos, maldiciones y efectos:

| Resistencia | Sale de | Se usa contra |
|---|---|---|
| **Res. Mágica** (Res.Mg) | [[Constitución]] | Daño y efectos mágicos |
| **Res. CC** | Constitución | Estados de [[Crowd Control]] |
| **Res. Mental** (Res.Mt) | [[Especial]] | Control mental, maldiciones de mente |

> [!question] En pausa: están mezcladas
> Las tres todavía están en **terreno ambiguo** entre sí (incluso si "Res.M" de las cartas de clase se refiere a una, a otra o a ambas). **Se amplía cuando el dueño termine de definirlo**: no hace falta seguir preguntando por ahora.
