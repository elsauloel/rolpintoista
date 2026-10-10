# Clases — borrador de trabajo

**Cada skill que queda ✅ se carga también en `comun/skills-clase.js`** (el pool que la ficha ofrece en "+ Habilidad → De clase"); el resto sigue acá.

Transcripción de `00-clases.pdf` (**segunda versión**, la iteración más
parecida al sistema actual) para revisarla **clase por clase, skill por
skill**. Cuando una skill queda cerrada se marca ✅ y se reescribe con los
costos nuevos; lo que sigue con ⏳ está tal cual venía del PDF.

La primera versión del PDF (Acciones/Bonos) se descartó; de ella solo
quedan las reglas generales de abajo y las tarjetas del Debuffer, que ya
estaban en este mismo formato.

## Reglas de clase (decididas)

- Al armar el personaje se elige **una clase**.
- Skill **prefabricada de cualquier clase** (la tuya o de otra): cuesta **1 punto de Job**.
- Skill **custom** (inventada de cero): cuesta **2 puntos de Job**.
- (Cambio 2026-09-19: antes era 1 de tu clase / 2 de otra / 3 custom.)
- **+ Habilidad** en la ficha pregunta primero "De clase" o "Custom" (2 de Job); "De clase" deja elegir la clase y agregar las skills ya cargadas, siempre con Job 1. Además del pool, se puede crear una propia (Custom).

Hoy la ficha tiene Clase como texto libre (se compara con el nombre de la clase, sin tildes ni mayúsculas) y cada pasiva con Job
cuesta 1 por defecto (`jobBudget`, 3 puntos + 3 por nivel).

## Reglas generales (decididas)

- **SP**: 1 Esp = 3 SP. Va a tener una regeneración base por turno según
  Esp (en definición). Los costos se revisan cuando esté definida.
- **Peso** del arma = cantidad de dados de daño; **Tipo** = caras.
  "T4 P1" = Tipo 4, Peso 1 (1d4). **Amplificar** el daño = dados de más
  (en la ficha, `danoAmplificado` ya suma dados).
- **Flash** = no cuesta Nitros y se puede usar durante el turno de
  cualquier jugador. Se declara cuando el que tiene el turno anuncia una
  acción, **antes** de que tire los dados (nunca después de ver el
  resultado).
- **Espameable**: se puede repetir en el turno; el límite lo ponen los
  Nitros.
- **Costo en No2 por defecto** (2026-09-20): si el texto de una skill no dice cuántos No2 cuesta, cuesta **1**; si está vinculada a un ataque, cuesta lo que cuesta ese ataque (Tipo ÷ 2 el primero del turno con el arma, Tipo completo después). "Flash" o un "No2: 0" explícito son la excepción.
- **Costo "Ataque"**: la skill cuesta los Nitros del ataque que
  corresponda en ese turno con esa arma (Tipo ÷ 2 si es el primero, Tipo
  completo después) y cuenta como ataque del turno. En la ficha se usa con
  **Ejecutar**, y hace lo mismo que el botón Atacar (cobra los Nitros y
  tira PdG) más el efecto de la skill.
- **A definir en mesa**: si una duda no se cierra en la revisión, la skill
  lleva una nota "⚖ A definir en mesa" que tiene que verse en su tarjeta
  para todos, así se decide entre todxs la próxima vez que aparezca en
  una partida.
- **Causa fatiga**: pendiente, el usuario lo define con el grupo.

## Cómo leer esta versión (a confirmar)

- **Número azul** de cada tarjeta = costo en **SP**.
- **NO2: (N)** = costo en Nitros. Las que no lo dicen: si son un ataque,
  costo "Ataque"; si no, sin definir.
- En Mago aparece "NO2: (3) / (1 + 1B)": lo segundo es la notación vieja
  (Acciones + Bonos); vale lo primero.
- **Flash (SP x 2)**: Flash que cuesta el doble de SP. Choca con la regla
  de Flash en un caso: **Parry** dice "NO2: 1" y Flash.
- **Tipo de efecto (stat del que lo usa / stat del que resiste)**:
  Hechizo (PG: Esp · Daño: Esp), Onda expansiva (Fuerza / Constitución),
  Maldición (Esp / Res.M).
- **Esp / Especial**: el atributo Especial de la ficha (ex Inteligencia,
  renombrado — ver `ficha-personaje/CLAUDE.md`). Todo lo que decía "Int"/
  "Inteligencia" en el PDF viejo pasó a "Esp"/"Especial" acá. **SP**
  (Special Power) es otra cosa, siempre se abrevia "SP", nunca "Esp".
- **Critical Matters**: si el ataque es crítico, el efecto cambia.
- Sin mecánica hoy: Lento, Acumulable, crítico mejorado, true damage,
  holy, dodge roll, cooldown del arma, Percepción, stacks de veneno.

## Warrior ⏳

1. ✅ **Arte de la guerra** — **Flash (a confirmar).** **SP:** 2. +2 a una
   sola tirada de PdG, Parry, Bloqueo o Daño. No se puede usar más de una
   vez sobre la misma tirada.
   ⚖ A definir en mesa: ¿se puede usar en todas las tiradas que quieras
   dentro del mismo turno, o una sola vez por turno?
2. ✅ **Amplificar daño** — **No2:** ataque. **SP:** X (máx. 3).
   **Espameable.** Ataque con +X dados de daño del Tipo del arma.
3. ⏸ **Sacadito** [3] **(a definir)** — Recibe 10 Nitros que puede
   utilizar en ataques consecutivos iguales. Acumulable con otros skills
   con la condición de que todos los ataques sean idénticos.
   Dudas abiertas: ¿los Nitros que sobran se pierden al terminar el turno
   o al hacer algo que no sea atacar? ¿"Iguales" = misma arma, mismo
   objetivo o ambas? Combinado con otra skill (ej. Amplificar daño), ¿todos
   los ataques la llevan y el SP se paga por ataque o una vez?
4. ✅ **Cañón Vasco** — **No2:** 1 (salto y onda). **SP:** 2 + X (X hasta
   Fue). Salta X casillas; si cae sobre un enemigo, lo empuja 1 casillero.
   Al caer, los enemigos adyacentes (flor de 1, no afecta aliados) reciben
   X + una tirada de Fuerza de daño de onda expansiva; se defienden con
   Constitución (a confirmar). Puede además atacar a un objetivo al caer
   (pagando ese ataque) con +X de daño fijo.
5. ✅ **Carga** — **No2:** X (1 por casillero) + los del ataque del final.
   **SP:** X, sin tope (a confirmar si X tiene tope). Avanza X casilleros en
   línea recta y al final ataca con +X de daño fijo y +X a la PdG.
6. ✅ **Estoicismo** — SP 2, No2 0, Flash (dueño, 2026-09-27: se puede usar en el turno de cualquiera, sin costo de No2; ese es el punto de Flash). **+1 a cada Resistencia a crítico** (todos los Tipos) durante **2 turnos** (automático, `efectoMods`). **+2 a la Defensa por cada enemigo adyacente**, sin tope (✋ a mano: no hay forma de que la ficha sepa cuántos enemigos tenés al lado sin el mapa, así que se ajusta a mano en el estado al usarla; no se recalcula si se mueven).
7. **Remolino** [3] — Ataque que daña a todos los objetivos adyacentes.
   Puede desplazarse una casilla; si lo hace, cuenta las áreas de efecto
   de ambas posiciones. Repetirlo de inmediato ignora el cooldown del
   arma.
8. **Parry** [2] — NO2: 1. Cooldown: 1. Flash. Reemplaza la EV por PG en
   una tirada de evasión. El que tenga el arma más pesada tiene una
   bonificación igual a la diferencia en el peso de las armas.
9. **Contraataque** [2] — Permite realizar un ataque de oportunidad
   después de esquivar un ataque.

## Asalto ⏳

1. ✅ **Dash** — SP 3, No2 1 (fijo: cubre todo el desplazamiento, no por
   casillero — la gracia de la skill, confirmado por el dueño 2026-09-27).
   Avanza 3 casilleros en línea recta (4 si atraviesa a un enemigo, a
   mano); como el mapa no tiene un modo "varios casilleros por un No2
   fijo", el desplazamiento se hace con 🦶 Mover libre (gratis) — el 1 No2
   ya lo cobra la skill al ejecutarla. Automático: **+2 fijo a Parry**
   hasta el comienzo de su próximo turno (`efectoMods`, 1 turno). A mano:
   atacar a quien atravesó cuesta aparte con Atacar de siempre (los No2
   del ataque van separados, "más los del ataque" — no están incluidos en
   el 1 No2 de la skill); se cancela si pierde una tirada de Parry o
   Bloqueo en el camino.
2. **Lisiar** [2] — Ataque con +1 al crítico. Causa lesión de -1 de PG al
   objetivo durante 2 turnos. *Critical Matters:* si es crítico, cambia
   el efecto a -2 fijo a la PG por 2 turnos.
3. ✅ **Tajear** — **No2:** ataque. **SP:** 3. Ataque con tu arma con +1 al
   Crítico frecuente (solo ese golpe). Si pega: Sangrado de 3 por turno, 3
   turnos. *Critical Matters:* si es crítico, en vez de eso Sangrado de 5 por
   turno, permanente hasta curarse. Se acumula como cualquier Sangrado.
   *(Auditada 2026-10-10 con el dueño: las «heridas» son Sangrado; números
   del original. De paso: un efecto de Critical Matters con el mismo nombre
   que uno de siempre lo reemplaza — antes se sumaban.)*
4. **Invi** [5] — Invi × 2 turnos. Se detecta con Percepción (DES). El
   rango para esta tirada depende de a qué velocidad se mueva: a
   velocidad normal (1 No2 por casillero) el rango es una flor de 3; a
   velocidad lenta (2 No2 por casillero), una flor de 2.
5. **Envenenar arma** [2] — Mejora el arma con veneno que le otorga +3
   fijo al daño y aplica 3 stacks de veneno. Duración: 2 ataques.
6. **Backstab** [2] — Únicamente por la espalda. +5 daño fijo. Ignora 1
   de resistencia a crítico.
7. **Degollar** [7] — Ataque devastador con +4 de PG, +7 de daño y +1 al
   crítico. Interrumpe su turno y se pasa al final de la tabla de
   iniciativa. Hasta su próximo turno pierde 50% de evasión y no puede
   usar No2 para responder a acciones enemigas.
8. **Sprint** [1] — 2 No2: avanza 3 casillas.
9. **Tronco de huída** [2] — +2 fijo a una tirada de evasión con giro.
10. **Robar SP** [1] — Gana 2 SP por cada crítico obtenido.

## Tanque ⏳

Estados que define la clase:
- **Pajaritos**: reduce a la mitad todas las tiradas de DES, ESP y AGI.
- **Sentado** (definición del 2026-09-24, de Sonic Boom): la Evasión se parte a la mitad, no puede atacar y no puede hacer dodge roll. No vence solo: levantarse cuesta 1 No2.

1. ✅ **Blindaje** — **Flash (SP x 2:** cargada con SP 1; en turno ajeno
   cuesta el doble, 2 SP, a mano). **No2:** 0. **SP:** 1. Solo sobre sí mismo. Aplica
   el estado **Barrera** (barra 🛡 de 8, como el Escudo mágico, hasta el
   próximo Mantenimiento): absorbe 8 de la próxima fuente de daño; si hace
   más, el resto entra normal.
2. ✅ **Shockwave** — SP 3, No2 0 (Flash: SP x 2 = el doble, 6 SP en turno ajeno, a mano). Onda expansiva alrededor de quien la usa
   (radio 1, sin marcar centro): tira **Fuerza** una sola vez; cada **enemigo** adyacente tira **Constitución** por
   separado y **quien pierde** queda en **Pajaritos** (PdG y Evasión a la mitad) por **2 turnos**. *(Auditada
   2026-09-28 — primera skill con el objetivo "onda alrededor de quien la usa" del 🎯 (`duelo: {objetivo:'onda',
   radio:1, tira:'fue', contra:['con'], efectos:[Pajaritos 2t]}`, ver `comun/CLAUDE.md`): reusa la cascada de los
   hechizos de área pero sin marcar centro y sin dodge roll — la tirada, la resistencia de cada enemigo y el
   Pajaritos quedan del todo automatizados en el duelo; solo el costo extra de usarla en turno ajeno (Flash) sigue
   a mano.)*
3. ✅ **Aura de espinas** — SP 1, No2 1 (regla general: sin dato, 1). Deja sobre uno mismo el estado **Espinas** por 1 turno (hasta el comienzo del próximo turno). Espinas (2026-09-24): devuelve al atacante **1/4 (25 %) del daño CRUDO** del golpe (antes de Defensa y escudos), **solo cuerpo a cuerpo**, **redondeado hacia arriba**, como daño directo (true damage); aplicarlo es **a mano**. Reemplaza al 50 % que tenía el estado.
4. ✅ **Recuperación** — SP 1, No2 2. Cura **9 HP fijos** sobre uno mismo, sin pasar el HP máximo; se puede usar con el HP lleno (gasta igual). Automatizada con el campo `curaHp` de la habilidad (2026-09-20).
5. ✅ **Sonic Boom** — SP 2, No2 0 (Flash: SP x 2 = el doble, 4 SP en turno ajeno, a mano; ¿tiene sentido en turno ajeno? → pregunta P109). Golpea el piso: al ejecutar tira **Fuerza** (automático) y el mapa **dibuja 3 segundos el cono al frente** (el mismo de 16 casillas de la detección del sigilo, `zonaMapa: 'cono'`). Cada **enemigo** del cono tira **Constitución** (a mano); si el atacante gana, el defensor pierde **1 + la diferencia** en No2 (a mano) y, si se queda sin No2, queda **Sentado**. Empate o pérdida: no pasa nada. (2026-09-24)
6. ✅ **Piel resistente** — SP 5, No2 1 (regla general). Estado de 2 turnos sobre uno mismo: Defensa +5, Res. Mágica +5 y +1 a cada resistencia a crítico (Tipo 4 a 12). Confirmado por el dueño el 2026-09-24 (el +1 a los críticos y los 2 turnos).
7. ✅ **Daño en área** — SP 2, No2 = **un ataque** (`ATAQUE`, cuenta como ese ataque). Ataque con el arma que golpea a **todos los enemigos adyacentes al tanque** (flor de radio 1 centrada en quien la ejecuta; el ejecutor no se afecta; solo enemigos). Automático: costo, tirada de PdG y el mapa dibuja la flor 3 segundos (`zonaMapa: 'flor'`, `zonaRadio: 1`); el daño va con el 🎲 (a mano). Los afectados pueden **esquivar con dodge roll** (a mano). ¿Se esquiva normal o exige dodge roll? ¿Se puede parrear? → P110. (2026-09-24)
8. ✅ **Takle** — SP 3, No2 0 en el ataque (Flash; el desplazamiento **sí gasta** los No2 normales: 1 por casillero, hasta 2). Automático: cobra el SP y tira **PdG +1** (`tiradaStat: 'pdg'`, `tiradaBono: 1`). Ataque normal: el objetivo puede **esquivar pero no parrear**. Si conecta y el tanque gana **Constitución vs Constitución** (a mano): el objetivo pierde 2 No2 y es empujado 2 casillas; si Takle se usó **durante el turno del enemigo**, además se interrumpe su turno y pasa al final de la iniciativa (si ya era el último, lo pierde). Lo demás, a mano. (2026-09-24; el 'si conecta' es interpretación, confirmar)
9. ✅ **Taunt** — SP 1, No2 1 (dueño, 2026-09-27: cuesta un Nitro). Duelo de habilidad (`comun/skills-clase.js`, `duelo: {objetivo:'enemigo', tira:'pdgmg', contra:['resmg'], alcance:'rango'}`): tira **PdG.Esp +1** contra el **Res.Esp** del objetivo (cambiado el mismo día de Especial vs Especial a PdG.Esp vs Res.Esp), dentro de su **Rango** (Destreza — no cuerpo a cuerpo). Empate: la regla general del juego. Si gana, aplica el estado **Provocado** (2 turnos, control — lo reducen Resistencia a CC e Inmunidad a CC): mientras dure, si el objetivo ataca, tiene que elegir a quien lo provocó, si puede llegar (✋ a mano — es conceptual, no se automatiza). Se juega igual que un ataque: cuadro del duelo visible para toda la mesa, con su botón «Aplicar» en el paso de efectos. **PdG.Esp / Res.Esp** son los nombres nuevos (2026-09-27) de **PdG.Mg / Res.Mg** — los ids no cambiaron (`pdgmg`, `resmg`).
10. **Miti-Miti** [2] — Marca un personaje como protegido. El protegido
    comparte con el tanque la mitad del daño que recibe. Duración: 1
    turno.

## Mago ⏳

Salvo Carga Elemental, todas son **Hechizo (PG: Esp · Daño: Esp)**.

1. ✅ **Chispazo** [1] — NO2: (1). Tira PdG.Esp contra la Evasión del objetivo (no se parrea ni se bloquea); si gana, 1d6 de
   daño arcano directo a la vida. *(Rebalanceado 2026-09-25 por el dueño: antes NO2 3 y T4; equiparado a la Varita de
   proyectil mágico de buena calidad, 1d6 por 1 Nitro. Auditada 2026-09-27 con `duelo` cargado, para probar el sistema de
   duelo de habilidades. ⚖ Balance a revisar con el grupo.)*
2. ✅ **Rayo Mágico** [X] — NO2: (5). Tira PdG.Esp contra la Evasión del objetivo (proyectil mágico); si gana, 1d4 + el
   doble de X de daño arcano directo a la vida (X = el SP pagado, elegido al ejecutar). *(Auditada 2026-09-27, P119: primera
   skill con daño que escala por X en el duelo de habilidades — `duelo.danoFijoPorX`, ver `docs/preguntas-abiertas.md` P119
   y `docs/duelo-de-habilidades.md`. "Tipo 1" del texto original se tomó como Tipo 4 (1d4). X ≤ Especial queda ✋ a mano.)*
3. ✅ **Orbe arcano** [4] — NO2: (5). Hechizo de área (Paso 4/7 del casteo, flor de 1): tira PdG.Esp contra la Evasión de
   cada uno, en cascada; a quien gane le toca un dodge roll, si no logra salir hace 1d12+4 de daño arcano directo a la vida.
   *(Auditada 2026-09-27 con `duelo` de objetivo "área", para probar la cascada de hechizos de área. ⚖ El "amplifica el
   daño en 4" del texto original se tomó como +4 fijo sobre 1d12 (Tipo 12) — a revisar el balance con el grupo.)*
4. **Tormenta arcana** [15] — NO2: (5). Provoca una lluvia de 1d20
   proyectiles arcanos T4 P1 en flor de 2. Caen aleatoriamente sobre todos
   los objetivos posibles. Esquivable solo con dodge roll.
5. ✅ **Ráfaga arcana** — **No2:** 3. **SP:** 2. Hechizo. 2d4 de daño arcano
   a cada rival en el cono al frente (el de 16 casillas de la detección); no
   afecta a aliados. PdG.Esp una vez contra la Evasión de cada uno; quien
   gana tiene dodge roll (si sale del cono la esquiva, si queda adentro le
   pega igual). Daño directo (ignora la Defensa especial). *(Auditada
   2026-10-10 con el dueño: «tipo 3» no existía → 2d4; costo del original;
   solo rivales; dodge roll como un área, no «ganar = esquivar». Antes:
   «daño en área tipo 3, cono de 3 al frente».)*
6. **Toque mágico** [3] — NO2: (4). Requiere un toque físico con la mano o
   el arma, usando PG contra Evasión. No se puede bloquear. A distancia
   melé, hace 3d T6 + ESP de daño mágico.
7. **Carga Elemental** [X] — Modifica un skill de daño mágico para que
   tenga propiedades elementales. Cada nivel en este skill otorga nuevos
   elementos. X es la mitad del coste del skill. Elementos: **Fuego** +50%
   de daño. **Frío** -1 No2 cada 5 de daño (mínimo 1). **Eléctrico** el
   daño se propaga a enemigos hasta 5 de distancia.
8. **Armadura arcana** [5] — NO2: (3). *(Renombrada 2026-09-27, antes
   "Armadura Mágica" — para no confundirla con la Armadura mágica, el
   stat nuevo del Paso 3 de las reglas de casteo.)* Crea una armadura que
   reduce el daño recibido en un 50% (máximo 10). Cuando termina el
   efecto, hace daño mágico en área de flor igual al daño absorbido. Duración: 2
   turnos.
9. **Telekinesis** [15] — NO2: (3). Mueve y controla un objeto con la
   mente. Puede usarse para arrebatar el arma a un enemigo con Esp/Fue, y
   usarla para atacar: atacar así usa ESP como PG y ESP como daño. Paga 1
   SP por cada No2 que use para atacar o mover el objeto. El objeto queda
   controlado el resto del turno; puede gastar 1 SP para contrarrestar con
   ESP cualquier intento de otro personaje de quitarle el control. En cada
   mantenimiento puede pagar 1 SP para conservar el control durante el
   turno.
10. **Control Mental** [7] — NO2: (3). Tira Esp contra (Esp + Res.M) de
    otro personaje. Si gana, puede controlarlo y obligarlo a realizar
    cualquier acción que no implique dañarse a sí mismo. Paga 1 SP y 1 No2
    por cada No2 que gaste el personaje controlado. El efecto concluye
    inmediatamente.

## Shooter ⏳

1. **Apuntar** [X] — X No2: +X a la PG y al crítico en el próximo ataque a
   distancia (X ≤ 3).
2. **Acelerado** [1] — Reduce el cooldown de un ataque. Repetible (+1 SP
   por repetición).
3. **Enfocado** [1] — +2 de daño al próximo ataque. Repetible (+1 SP por
   repetición).
4. **Parry a distancia** [2] — Flash. Realiza un ataque de rango como
   instantáneo. Si se hace como respuesta a un ataque, tira Agilidad para
   cancelarlo.
5. **Headshot** [4] — Ataque con +1 al crítico y crítico mejorado. Daño
   +5. +2 fijo a PG. Falla si no es crítico.
6. **Proyectil perforante** [2] — Ataque que continúa hasta alcanzar un
   segundo objetivo. Todos los efectos especiales se pierden después del
   primer objetivo.
7. **Marcar** [3] — Designa un objetivo como marcado; sigue marcado hasta
   que ataque a un objetivo diferente. Obtiene +1 PG, +1 Daño y +1 Crítico
   contra el objetivo marcado.
8. **Repetición** [X] — Realiza X ataques consecutivos idénticos entre sí
   (los ataques gastan No2 normalmente). Por cada ataque adicional al
   primero suma +1 a la PG y amplifica +1 el daño.
9. **Disparo múltiple** [X] — Ataca simultáneamente a múltiples objetivos
   en línea directa en un área de cono ancho. X es igual al doble del
   número de objetivos adicionales.
10. **Tiro con comba** [1] — Altera la trayectoria de un ataque de rango
    para esquivar obstáculos entre el tirador y el objetivo. Desvío máximo:
    2 casillas en una dirección. Cada casilla de desvío cuenta como +1 de
    distancia.

**Reglas del tiro** (no es skill, va al manual): el ataque a distancia
funciona igual a un ataque normal. Con mecanismos, la FUE del ataque la da
el ítem. Distancia máxima de tiro certero = DES. Más allá puede fallar, se
verifica con 1d20: hasta DES×2 → 7+; hasta DES×3 → 17+; más de DES×3 → 20.
*(Hoy la ficha tiene el stat Rng.)*

## Support ⏳

1. **Empower** [2] — NO2: (0). +3 a cualquier tirada propia o de un
   aliado.
2. **Blessing** [5] — +1 fijo en todas las tiradas por 2 turnos.
3. **Heal** [2] — NO2: (1). Cura 4 + 1d6 HP.
4. **Shield** [2] — Flash (SP x 2). Otorga un blindaje temporal que
   absorbe 14 de HP hasta el final del turno.
5. **Acelerador** [1] — Marca una casilla con flechitas para adelante
   (>>). Cada aliado que la pisa obtiene +2 No2 (máximo una vez por
   turno). Duración: 10 turnos.
6. **Endurecimiento** [5] — Otorga una armadura temporal: Defensa 3, Res.
   Mágica 3, reduce críticos de todo tipo. Duración: 2 turnos.
7. **Re-roll** [2] — Flash. Permite rerolear tiradas aliadas. Lento.
8. **Smite** [1] — NO2: (1). Rayo de daño holy inesquivable que causa 1d4
   de daño.
9. **Transferir SP** [1] — Transfiere 1d6 SP entre sí mismo y un aliado.
10. **Adrenalina** [5] — Otorga +1 a Destreza, Fuerza y Agilidad durante 2
    turnos. Acumulable. Lento.

## Debuffer ⏳

En el PDF nuevo la página del Debuffer repite las tarjetas del Support.
**A confirmar:** usar las tarjetas del Debuffer de la versión anterior, que
ya tenían este mismo formato (número azul, Maldición Esp / Res.M):

1. **Enyetar** [5] — Maldición (Esp / Res.M). Flash. Obliga a repetir una
   tirada y quedarse con el valor más bajo.
2. **Confusión** [5] — Maldición (Esp / Res.M). Antes de realizar un
   ataque o habilidad con objetivo, tira 1d4: 1) el debuffer elige el
   objetivo; 2) gasta los No2 pero no realiza la acción; 3) elige el
   objetivo al azar; 4) actúa normalmente. Los objetivos alternativos
   deben estar en un radio de 3 No2; si la acción requiere moverse, deberá
   hacerlo. Duración: 2 turnos.
3. **Maldición debilitante** [5] — Maldición (Esp / Res.M). -1 a todas las
   tiradas. Duración: 2 turnos. Acumulable. Lento.
4. **Maldición extenuante** [3] — Maldición (Esp / Res.M). Incrementa en 1
   los Nitros de todas las acciones. Debe pagar 1 Nitro para moverse cada 2
   casillas. Duración: 1 turno. Acumulable. Lento.
5. **Maldición tormentosa** [5] — Maldición (Esp / Res.M). Por cada acción
   recibe daño igual a No2 - 1. Debe pagar 1 HP para moverse cada 2
   casillas. Duración: 3 turnos. Acumulable. Lento.
6. ✅ **Drenar vida** — SP X (X ≤ tu Especial), No2 2 (dicho por el dueño: no está en el texto original). Le drenás
   HP al objetivo igual a la diferencia entre tu tirada y su Res.Esp, y te la sumás vos (Excedente de vida si pasa
   tu máximo). *(Auditada 2026-09-27 — primera skill con "tirada personalizada" del 🎯 (`comun/asistente-duelo-hab.js`,
   ver `comun/CLAUDE.md`): se juega como un duelo de verdad (elegís objetivo en el mapa, cuadro compartido), pero en
   el paso "Tirada" en vez de un stat fijo escribís tu propia fórmula — "X + 1dX" — con tu propio texto ("Drenaje"),
   y en el paso "Daño" un texto libre ("efecto a mano") que el cuadro muestra junto a la diferencia numérica entre
   las dos tiradas al resolverse. El drenaje en sí sigue siendo a mano, mismo criterio que Shockwave y Sonic Boom —
   la diferencia entre "Pasos personalizados" (una ventanita aparte, descartada) y esto es que la tirada, el
   objetivo y la contienda SÍ quedan automatizados, solo lo que de verdad no se puede calcular queda a mano.)*
7. **Balas de sangre** [1] — Gasta X HP (máximo ESP). Dispara un proyectil
   tipo 1. El peso del proyectil es igual a la vida gastada.
8. **Transfusión sanguínea** [1] — Transfiere hasta 20 de HP de un
   personaje aliado a otro.
9. **Veneno** [2] — Maldición (Esp / Res.M). Aplica 3 stacks de veneno.
10. ✅ **Nube tóxica** [3] — SP 3, No2 1. Marcás el centro en el mapa; queda una nube de diámetro 3 (radio 1)
    durante 3 turnos. Cada rival que entra, o que sigue adentro en el Mantenimiento, resiste con Res.Esp contra
    tu Especial (tirado una sola vez, al lanzarla); quien pierde queda con 3 stacks de Veneno — una vez
    envenenado no se le vuelve a tirar la resistencia. No afecta a los aliados. *(Auditada 2026-09-28 —
    primera skill con el objetivo "Zona persistente" del 🎯: `duelo: {objetivo:'zona', radio:1, tira:'esp',
    contra:['resmg'], zonaTurnos:3, zonaEstado:{nombre:'Veneno', turnos:3, stacks:3}}`, ver `comun/CLAUDE.md`.
    La pregunta pendiente de `manual-usuario/notas/07-estados.md` — si reingresar ya envenenado suma 1 stack
    o los normales — sigue abierta; hoy, una vez envenenado, la zona ya no vuelve a tirar nada para esa
    persona, así que no llega a probarse.)*
