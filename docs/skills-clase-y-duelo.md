# Skills de clase auditadas y el duelo — qué se puede automatizar ahora (2026-09-27)

> Pedido del dueño (2026-09-27): *«repasar todos los skills de clase que ya estén auditados para ver cuáles se pueden automatizar ahora con el nuevo sistema de duelo; y después seguir auditando los skills de clase»*.
> Fuente: `comun/skills-clase.js` (62 skills, **17 auditadas**, 45 «Sin auditar» que solo se anuncian). Duelo: [`ataque-paso-a-paso.md`](ataque-paso-a-paso.md), `comun/duelo.js`.

## 1. Cómo funciona hoy la conexión skill ↔ duelo
- **Atacar** (botón de la ficha, Botonera, creeps y token) abre el **duelo**: elegir objetivo en el mapa → PdG contra defensa → Parry/Bloqueo → crítico → daño → efectos del golpe.
- **Ejecutar una skill de ataque** (las de `nitrosCosto: 'ATAQUE'` y `tiradaStat: 'pdg'`) **no abre el duelo**: cobra los No2, aplica el estado propio (por ejemplo −2 Evasión) y tira el PdG suelto en la Mesa; el resto sigue a mano. Es el hueco principal.
- Lo que **ya se aplica solo** dentro del duelo porque el duelo lee los stats vivos de la ficha (estados y equipo incluidos): **Crítico frecuente / potente** (Ojo de asesino, Golpe brutal), **Resistencia a crítico** (Temple, Piel resistente), **Defensa** (Piel resistente), **Escudo especial** (Blindaje: absorbe en «Recibe daño»).

## 2. Las 17 skills auditadas, una por una
| Skill (clase) | Qué hace | Hoy | Con el duelo | Esfuerzo |
|---|---|---|---|---|
| **Golpe brutal** (Warrior) | Ataque con Crítico potente ×1 y −2 Evasión hasta tu próximo turno | Estado propio automático; el ataque, suelto | **Ejecutar abre el duelo** con la skill: el crítico potente ya lo lee del estado | Bajo (depende del punto 3.1) |
| **Amplificar daño** (Warrior) | Ataque con +X dados de daño del Tipo del arma (X ≤ 3) | Solo anuncia; el +X va a mano | El duelo suma **+X dados** en el paso Daño; el X se elige al ejecutar (ya se pregunta) | Bajo-medio |
| **Carga** (Warrior) | Avanza X casilleros en línea recta (1 No2 c/u) y ataca con **+X daño fijo y +X PdG** | Cobra los No2; el ataque a mano | El duelo aplica **+X PdG y +X daño fijo**; el movimiento lo hace el jugador en el mapa | Medio |
| **Cañón Vasco** (Warrior) | Salta X casillas, empuja 1; onda de X + Fuerza a los adyacentes; puede atacar al caer con +X daño fijo | A mano | Solo la parte **ataque al caer** (+X daño fijo) entra en el duelo; la **onda** es un área (ver 3.3) | Medio (parte) |
| **Arte de la guerra** (Warrior, Flash) | +2 a **una** tirada de PdG, Parry, Bloqueo o Daño | Cobra 2 SP; el +2 a mano | Botón **«Arte de la guerra +2»** en cada paso de tirada del duelo, **antes de tirar** (justo como manda la regla de Flash) | Medio |
| **Ojo de asesino** (Asalto) | Crítico frecuente ×1 hasta tu próximo turno | ✅ automático (estado) | ✅ el duelo ya lo usa | — |
| **Temple** (Tanque) | +1 Resistencia a crítico de todo Tipo, 2 turnos | ✅ automático | ✅ el duelo ya lo usa | — |
| **Piel resistente** (Tanque) | +5 Def, +5 Res.Mg, +1 Resistencia a crítico, 2 turnos | ✅ automático | ✅ el duelo ya lo usa | — |
| **Blindaje** (Tanque, Flash) | Escudo especial de 8 | ✅ automático | ✅ absorbe en el daño del duelo | — |
| **Recuperación** (Tanque) | +9 HP | ✅ automático | — | — |
| **Aura de espinas** (Tanque) | Cada golpe cuerpo a cuerpo recibido devuelve **1/4 del daño crudo** (para arriba) al atacante | Estado propio; la devolución **a mano** | **El paso Daño del duelo puede devolverlo solo** (el defensor con Espinas: el atacante recibe el 25 %, directo a la vida). También sirve al preset Espinas | **Bajo, mucho valor** |
| **Takle** (Tanque, Flash) | Desplaza hasta 2 casillas y ataca con **+1 PdG; no se puede parrear**; si conecta y gana Con vs Con: −2 No2 y empuja 2 | Solo anuncia | Duelo con **+1 PdG y solo Evasión** (sin Parry); el resto (Constitución vs Constitución, −2 No2, empuje) como **efecto del golpe** («Aplicar»), más el empuje a mano | Medio |
| **Shockwave** (Tanque, Flash) | Fuerza + cada adyacente tira Con; el que pierde queda Pajaritos 2 turnos | Tira Fuerza; el resto a mano | **Área** (ver 3.3) | Alto |
| **Sonic Boom** (Tanque, Flash) | Cono: Fuerza vs Con; pierden No2 o quedan Sentados | Tira Fuerza, dibuja el cono | **Área** (ver 3.3) | Alto |
| **Daño en área** (Tanque) | PdG en flor de 1 (adyacentes) | Tira PdG y dibuja la zona | **Área** (ver 3.3) | Alto |
| **Invocar portal** (Mago) | Dos portales aliados 3 turnos | ✅ automático (mapa) | — | — |

**Resumen:** 7 ya están automáticas; **5 (Golpe brutal, Amplificar daño, Carga, Arte de la guerra, Aura de espinas) se resuelven casi enteras con una sola pieza nueva** (ver 3.1 y 3.2); **Takle y Cañón Vasco (la parte del ataque) se apoyan en lo mismo** con efectos extra; **3 son de área** y necesitan que el duelo aprenda a tener varios defensores.

## 3. Las piezas que faltan (propuesta)
1. **«Ataque con habilidad» en el duelo.** Al ejecutar una skill de ataque, en vez de tirar el PdG suelto se abre el duelo con la skill: el ataque lleva **modificadores de la skill** (`pdg +N`, `dado de daño +N dados`, `daño fijo +N`, `no se puede parrear`, `efecto extra al golpear`) y el título del cuadro muestra el nombre de la skill («⚔ Golpe brutal»). Los modificadores son un campo nuevo de la skill (`duelo: {...}`) y se **editan en el asistente de habilidades** (sandbox: el grupo puede diseñar las suyas).
2. **Reacciones Flash dentro del duelo** (Arte de la guerra, y a futuro Re-roll, Parry a distancia, Enyetar…): en cada paso de tirada, botón por cada Flash disponible, **antes de tirar** (regla de Flash). Cobra el SP y aplica el +2.
3. **Áreas (más adelante):** un duelo con **varios defensores** (cada uno defiende a ciegas, se resuelven en paralelo) para Shockwave, Sonic Boom, Daño en área y la onda del Cañón Vasco. Es la pieza grande; conviene hacerla junto con el **duelo de hechizos** (Especial contra Res.Mágica), que ya está anotado.
4. **Devolver Espinas** (independiente de lo anterior): en el paso Daño, si el defensor tiene el estado Espinas y el golpe fue cuerpo a cuerpo, **el atacante recibe el 25 % del daño crudo** (aplicado por el mapa del GM como el resto del daño).

## 4. Orden que propongo (de menos a más trabajo, sin necesidad de probar en partida en la etapa 1)
1. **Devolver Espinas** (3.4): chico y sin decisiones abiertas.
2. **Ataque con habilidad** (3.1) + los modificadores de Golpe brutal, Amplificar daño, Carga y Takle (+1 PdG, sin Parry).
3. **Reacciones Flash** (3.2) con Arte de la guerra.
4. **Áreas y hechizos** (3.3), cuando se decida el duelo de hechizos.

## 5. Preguntas para el dueño
1. ¿Te cierra el orden de arriba? ¿O arrancamos por el **ataque con habilidad** (que arregla 5 skills a la vez) y dejamos Espinas para después?
2. **Arte de la guerra:** hay una duda ya anotada («⚖ ¿todas las veces que quieras en el turno o una sola por turno?»). Para automatizarlo hay que decidirla. Propuesta: **una sola vez por turno** (cuesta 2 SP cada uso, así que igual se frena por SP).
3. **Amplificar daño:** ¿el tope X ≤ 3 lo pone la herramienta (no deja elegir más) o queda como aviso? Propuesta: **aviso, no bloqueo** (esencia sandbox).
4. **Espinas:** ¿el 25 % se calcula sobre el **daño crudo antes de la Defensa** (como dice la skill) también cuando hay crítico (daño ya multiplicado)? Propuesta: sí, sobre el daño final del golpe antes de restar Defensa.

## 6. Después: seguir auditando (45 skills sin auditar)
Método de siempre (una por vez: cómo está → cómo se adapta → decisiones → se carga en `comun/skills-clase.js`). Con lo de arriba, cada skill que se audite desde ahora **nace con su campo `duelo`** cuando sea de ataque. Las que hoy ya están adaptadas a la mecánica nueva del crítico (Lisiar, Tajear, Degollar, Backstab del Asalto) son las candidatas naturales para seguir: usan Crítico frecuente/potente, efectos al golpear (Lisiado, Sangrado) y «Ignora 1 de resistencia a crítico», que el duelo ya maneja.
