# Clases — borrador de trabajo

Transcripción de `00-clases.pdf` (**segunda versión**, la iteración más
parecida al sistema actual) para revisarla **clase por clase, skill por
skill**. Cuando una skill queda cerrada se marca ✅ y se reescribe con los
costos nuevos; lo que sigue con ⏳ está tal cual venía del PDF.

La primera versión del PDF (Acciones/Bonos) se descartó; de ella solo
quedan las reglas generales de abajo y las tarjetas del Debuffer, que ya
estaban en este mismo formato.

## Reglas de clase (decididas)

- Al armar el personaje se elige **una clase**.
- Skill **de tu clase**: cuesta **1 punto de Job**.
- Skill **de otra clase**: cuesta **2 puntos de Job**.
- Skill **inventada de cero**: cuesta **3 puntos de Job**.
- Cuando el pool esté cargado, **+ Habilidad** en la ficha deja elegir
  de las skills cargadas (además de crear una propia).

Hoy la ficha tiene Clase como texto libre y cada habilidad/pasiva con Job
cuesta siempre 1 (`jobBudget`, 3 puntos + 3 por nivel).

## Reglas generales (decididas)

- **SP**: 1 Int = 3 SP. Va a tener una regeneración base por turno según
  Int (en definición). Los costos se revisan cuando esté definida.
- **Peso** del arma = cantidad de dados de daño; **Tipo** = caras.
  "T4 P1" = Tipo 4, Peso 1 (1d4). **Amplificar** el daño = dados de más
  (en la ficha, `danoAmplificado` ya suma dados).
- **Flash** = no cuesta Nitros y se puede usar durante el turno de
  cualquier jugador. Se declara cuando el que tiene el turno anuncia una
  acción, **antes** de que tire los dados (nunca después de ver el
  resultado).
- **Espameable**: se puede repetir en el turno; el límite lo ponen los
  Nitros.
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
  Hechizo (PG: Int · Daño: Esp), Onda expansiva (Fuerza / Constitución),
  Maldición (Esp / Res.M).
- **Esp / Especial**: stat viejo que hoy no existe.
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
6. **Estoicismo** [2] — NO2: (0). Flash. +2 Def por cada enemigo
   adyacente. +1 Res.Crit *.
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

1. **Dash** [3] — NO2: (1 + Ataque). Avanza 3 casilleros en línea recta
   atravesando hasta 1 enemigo. Ataca a los enemigos que atraviesa. +2
   fijo al parry. Se cancela si pierde una tirada de parry o bloqueo. Si
   atraviesa un enemigo de esta forma, se desplaza un casillero adicional.
2. **Lisiar** [2] — Ataque con +1 al crítico. Causa lesión de -1 de PG al
   objetivo durante 2 turnos. *Critical Matters:* si es crítico, cambia
   el efecto a -2 fijo a la PG por 2 turnos.
3. **Tajear** [3] — Ataque con +1 al crítico. Deja heridas de 3 de daño
   por 3 turnos. *Critical Matters:* si es crítico, cambia el efecto a 5
   de daño hasta curarse.
4. **Invi** [5] — Invi × 2 turnos. Se detecta con Percepción (INT). El
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
- **Pajaritos**: reduce a la mitad todas las tiradas de DES, INT y AGI.
- **Sentado**: -2 a la evasión. No puede atacar. En cualquier momento
  puede gastar 1 No2 para pararse.

1. **Blindaje** [1] — Flash (SP x 2). NO2: (0). Otorga un blindaje que
   absorbe 8 de daño de la próxima fuente de daño este turno.
2. **Shockwave** [4] — Onda expansiva (Fuerza / Constitución). Flash (SP
   x 2). Todos los personajes adyacentes al tanque quedan en Pajaritos
   hasta el final de su próximo turno.
3. **Aura de espinas** [1] — Devuelve 1/4 del daño del ataque como true
   damage hasta el comienzo del próximo turno.
4. **Recuperación** [1] — NO2: (2). Recupera 9 HP.
5. **Sonic Boom** [2] — Onda expansiva (Fuerza / Constitución). Flash (SP
   x 2). Golpea el piso creando una onda de choque en un cono al frente,
   que hace perder una cantidad de No2 igual a 1 + la diferencia en la
   tirada. Si perdiera todos los No2 de este modo, queda Sentado.
6. **Piel resistente** [5] — Otorga una armadura temporal: Defensa 5, Res.
   Mágica 5, reduce críticos de todo tipo. Duración: 2 turnos.
7. **Daño en área** [2] — Ataque con daño en área de flor. No afecta al
   tanque.
8. **Takle** [3] — Flash (SP x 2). Se desplaza hasta 2 casillas. Ataque
   con +1 a PG. Si gana una tirada de Constitución, el objetivo pierde 2
   Nitros, lo empuja 2 casillas, interrumpe su turno y lo manda al final
   de la tabla de iniciativa. Si ya era último en iniciativa, en vez de
   eso pierde el turno.
9. **Taunt** [1] — Tira Especial + 1 contra Inteligencia para obligar a
   un enemigo a atacarlo hasta el final de su próximo turno.
10. **Miti-Miti** [2] — Marca un personaje como protegido. El protegido
    comparte con el tanque la mitad del daño que recibe. Duración: 1
    turno.

## Mago ⏳

Salvo Carga Elemental, todas son **Hechizo (PG: Int · Daño: Esp)**.

1. **Chispazo** [1] — NO2: (3). Dispara un proyectil T4 P1 que ignora
   armadura.
2. **Rayo Mágico** [X] — NO2: (5). Ataca con un rayo arcano que hace daño
   tipo 1. Amplifica el daño en el doble de X. X no puede ser mayor a
   Inteligencia.
3. **Orbe arcano** [4] — NO2: (5). Dispara un orbe arcano que hace daño en
   área tipo 5. Amplifica el daño en 4. Área: flor de 1.
4. **Tormenta arcana** [15] — NO2: (5). Provoca una lluvia de 1d20
   proyectiles arcanos T4 P1 en flor de 2. Caen aleatoriamente sobre todos
   los objetivos posibles. Esquivable solo con dodge roll.
5. **Ráfaga arcana** [2] — NO2: (3). Dispara una ráfaga arcana que hace
   daño en área tipo 3. Área: cono de 3 al frente.
6. **Toque mágico** [3] — NO2: (4). Requiere un toque físico con la mano o
   el arma, usando PG contra Evasión. No se puede bloquear. A distancia
   melé, hace 3d T6 + ESP de daño mágico.
7. **Carga Elemental** [X] — Modifica un skill de daño mágico para que
   tenga propiedades elementales. Cada nivel en este skill otorga nuevos
   elementos. X es la mitad del coste del skill. Elementos: **Fuego** +50%
   de daño. **Frío** -1 No2 cada 5 de daño (mínimo 1). **Eléctrico** el
   daño se propaga a enemigos hasta 5 de distancia.
8. **Armadura Mágica** [5] — NO2: (3). Crea una armadura mágica que reduce
   el daño recibido en un 50% (máximo 10). Cuando termina el efecto, hace
   daño mágico en área de flor igual al daño absorbido. Duración: 2
   turnos.
9. **Telekinesis** [15] — NO2: (3). Mueve y controla un objeto con la
   mente. Puede usarse para arrebatar el arma a un enemigo con Int/Fue, y
   usarla para atacar: atacar así usa INT como PG y ESP como daño. Paga 1
   SP por cada No2 que use para atacar o mover el objeto. El objeto queda
   controlado el resto del turno; puede gastar 1 SP para contrarrestar con
   INT cualquier intento de otro personaje de quitarle el control. En cada
   mantenimiento puede pagar 1 SP para conservar el control durante el
   turno.
10. **Control Mental** [7] — NO2: (3). Tira Int contra (Int + Res.M) de
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
6. **Drenar vida** [X] — Tira X + 1dX. X no puede ser mayor a ESP. El
   objetivo tira resistencia mágica. Drena HP igual a la diferencia. El HP
   obtenido así puede acumularse hasta 50% por encima del máximo.
7. **Balas de sangre** [1] — Gasta X HP (máximo ESP). Dispara un proyectil
   tipo 1. El peso del proyectil es igual a la vida gastada.
8. **Transfusión sanguínea** [1] — Transfiere hasta 20 de HP de un
   personaje aliado a otro.
9. **Veneno** [2] — Maldición (Esp / Res.M). Aplica 3 stacks de veneno.
10. **Nube tóxica** [3] — Crea un área de flor que aplica 3 stacks de
    veneno al que entre en ella o esté en su interior durante el
    mantenimiento. Solo aplica 1 stack a personajes ya envenenados.
    Duración: 3 turnos.
