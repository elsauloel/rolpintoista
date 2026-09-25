+++
capitulo: Recursos
icono: ⚡
resumen: Tres barras que dominan el combate: vida, poder especial y nitros. Cómo se ganan, se gastan y se recuperan.
+++

+++
titulo: HP
alias: [Vida, Puntos de vida, Hp.Max, Salud, Hit points]
tags: [recursos, combate]
estado: confirmado
+++
**HP** (*Health Points*) es tu vida. La barra **roja** de tu ficha y de tu token en el mapa.

- **HP máximo = [[Constitución]] × 5.**
- Cuando te pegan, el daño **se resta de tu HP** (después de restar tu [[Defensa]]).
- Cuando llegás a **0**, quedás **inconsciente** ([[Muerte|inconsciente y muerte]]).
- Podés recuperar HP con consumibles, habilidades que curan (como la *Recuperación* del [[Tanque]]) y la [[Pasivas|pasiva]] *Regeneración*, que cura algo en cada [[Mantenimiento]].

## Cómo se toca tu vida en la mesa
En la ficha (y desde el círculo rojo del token en [[El mapa|el mapa]]) escribís un número para fijarla, o **+5 / −3** para sumar o restar. **El daño recibido lo aplicás vos en tu propia ficha.** No pasa de tu máximo ni baja de 0.

> [!info] Los jugadores no ven los números de los enemigos
> De un [[Creeps|creep]] los jugadores solo ven **cuán llena está la barra** (un porcentaje), no los HP exactos. El GM sí los ve.

> [!question] Descanso
> ¿Cómo se recupera HP fuera de combate? ¿Existe un "descanso largo/corto" formal, o queda a criterio narrativo del GM?

+++
titulo: SP
alias: [Special Power, Poder especial, Bonos, Mana, Regen de SP, SP Regen]
tags: [recursos, habilidades]
estado: confirmado
+++
**SP** (*Special Power*) es el recurso de tus **habilidades**: funciona como el *mana* clásico de los JRPG. La barra **azul** de tu ficha y de tu token.

- **SP máximo = [[Especial]] × 3.**
- Cada [[Habilidades|habilidad]] cuesta cierta cantidad de SP (algunas, un costo variable *X*).
- **No se recarga entero cada turno**: se va consumiendo a lo largo de la pelea.
- **Todos los personajes regeneran SP solos:** al **principio** de cada [[Mantenimiento]] recuperás tu **SP Regen**, que por defecto es **la mitad de tu Especial, redondeada hacia abajo** (Especial 7 → 3 SP). Habilidades, la [[Pasivas|pasiva]] *Recuperación mental*, consumibles y ciertos ítems te suman más.
- También se recupera con **descanso**.

> [!warning] SP no es "Esp"
> **Especial** (ESP) es el atributo; **SP** es este recurso. Siempre "SP".

> [!info] Antes se llamaba "Bonos"
> Hasta la Iteración 2 este recurso se llamaba **Bonos**. Si lo ves en material viejo, es lo mismo que SP. → [[Historial de versiones]]

## El sobrepeso lo baja
Si el peso de tu equipo supera tu [[Carga máxima]], tenés el estado alterado **Sobrepeso**: **por cada punto que te pasás restás 1 a la Evasión** cuando la tirás. Antes de tirar, el juego te pregunta si querés **pagar 1 No2** para evitar esa penalidad en esa tirada. *(Regla en prueba, 2026-09-24; antes se perdía SP máximo.)*

> [!question] Piso del sobrepeso
> ¿Se puede llegar a 0 de SP por sobrepeso? ¿La penalidad afecta solo al SP, o también al movimiento?

+++
titulo: Nitros (No2)
alias: [No2, Nitro, Nitros, Acciones, Movimiento]
tags: [recursos, combate, reglas-base]
estado: confirmado
+++
**Nitros** (se abrevia **No2**) es tu **energía de turno**: lo que gastás para *moverte* y *hacer cosas* durante tu turno.

- **Nitros máximos = [[Agilidad]]** (más o menos lo que den el equipo, las habilidades o los estados).
- **Se recargan al máximo en cada [[Mantenimiento]].**
- No hay un tope absoluto: solo tu Agilidad y sus modificadores.
- Reemplazan a las viejas "3 acciones por turno" y al stat Movimiento: hoy **mover y actuar salen del mismo bolsillo**.

> [!example] Cuántas cosas hacés por turno
> Con Agilidad 6 tenés 6 Nitros. Podés, por ejemplo: moverte 2 casilleros (2) + un ataque con arma Tipo 6 (3) + usar una poción del cinturón (1). Total: 6. Ni una cosa más.

## Qué pasa si no te alcanza
La ficha **te avisa** y te da a elegir: cancelar, o "**realizar de cualquier modo**" (queda una línea roja en la [[La Mesa|Mesa]] para que todos lo sepan). En el mapa, moverte sin Nitros suficientes se bloquea con un aviso; para eso existe el botón **🦶 Mover libre** (para movimientos que el GM decide que no cuestan).

## Tabla de costos
Todo lo que cuesta Nitros: [[Costos en Nitros]].

> [!info] Los enemigos también gastan Nitros
> Los [[Creeps|creeps]] y las [[Invocaciones]] tienen su propio No2 y pagan igual.

+++
titulo: Costos en Nitros
alias: [Tabla de costos, Costo de acciones, Cuánto cuesta]
tags: [recursos, combate, tabla]
estado: confirmado
+++
Todo lo que se paga con [[Nitros (No2)|Nitros]] en combate:

| Actividad | Costo |
|---|---|
| Mover 1 casillero | **1** (2 con [[Rengo]]; no se puede con [[Inmovilizado]]) |
| Ejecutar una [[Habilidades\|habilidad]] | **1** por defecto; algunas cuestan más o tienen costo variable (X) |
| Una habilidad "de ataque" | Lo que cuesta atacar con ese arma |
| **Primer ataque con un arma en el turno** | **Tipo ÷ 2** (redondeado para arriba) |
| **Segundo ataque en adelante, con la misma arma** | **Tipo** completo |
| Usar un consumible del **cinturón** | **1** |
| Usar un consumible de la **mochila** | **2** |
| Equipar o desequipar un ítem (solo combate) | **1** (reemplazar uno por otro: 2) |

> [!example] Ataques con distintas armas
> Un arma de **Tipo 4**: primer ataque 2, segundo 4, tercero 4… Un arma de **Tipo 8**: primer ataque 4, los siguientes 8 cada uno. Con **dos armas** equipadas, **cada una tiene su propio primer ataque barato**.

## Detalles útiles
- El "primer ataque barato" **se recalcula cada turno nuevo**.
- En [[Modo narrativo y modo combate|modo narrativo]] moverte, equiparte y girar **no cuestan nada**.
- Flash ([[Habilidades]]) es la excepción: no cuesta Nitros y se puede usar en el turno de otro.
- Si una habilidad no dice cuánto cuesta, cuesta **1** (o lo de un ataque, si está atada a uno).

> [!question] Costo variable (X)
> ¿El "X" de algunas habilidades tiene un tope (por ejemplo X ≤ Especial) o es libre según cada habilidad?

+++
titulo: Mantenimiento
alias: [Fase de mantenimiento, Fin de ronda, Mantenimiento general]
tags: [recursos, combate, reglas-base]
estado: borrador
+++
El **mantenimiento** es la fase que ocurre **cuando ya actuó el último del orden de turnos**, antes de que empiece una nueva ronda. Es **igual para todos**: jugadores, aliados y enemigos.

## Qué pasa en el mantenimiento
- **Tus [[Nitros (No2)|Nitros]] se recargan** al máximo, y vuelve tu "primer ataque barato".
- **Recuperás SP** igual a tu *SP Regen* (por defecto, la mitad de tu Especial, para abajo), **al principio** del Mantenimiento y sin pasar del máximo. Ver [[SP]].
- **Regeneración** y curación por turno ([[Regeneración]], pasivas).
- **Veneno**, sangrado y otros daños por turno ([[Veneno]], [[Sangrado]]).
- **Se descuentan los turnos** de cada [[Estados alterados|estado alterado]]: los que llegan a 0 se van.
- Cuenta el plazo de la [[Muerte]] (5 mantenimientos).

En la ficha hay un botón de **Mantenimiento** y, en el mapa, el GM lo aplica para todos los tokens. La ficha **no cobra el mantenimiento dos veces**: si el GM mira tu ficha, no se aplica desde su lado.

> [!question] Qué más pasa acá
> - ¿Los turnos de los estados bajan en el mantenimiento general, o cuando le toca actuar a cada personaje?
> - ¿Los cooldowns de habilidades bajan acá?
