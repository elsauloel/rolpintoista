# Clases — borrador de trabajo

Transcripción de `00-clases.pdf` (skills de clases prearmadas) para
revisarlas **clase por clase, skill por skill** y dejarlas en el sistema
actual (Nitros/No2 y SP). Cuando una skill queda cerrada se marca ✅ y se
reescribe con los costos nuevos; lo que sigue con ⏳ está tal cual venía
del PDF, mezcla de iteraciones viejas.

## Reglas de clase (decididas)

- Al armar el personaje se elige **una clase**.
- Skill **de tu clase**: cuesta **1 punto de Job**.
- Skill **de otra clase**: cuesta **2 puntos de Job**.
- Skill **inventada de cero**: cuesta **3 puntos de Job**.
- Cuando el pool esté cargado, **+ Habilidad** en la ficha deja elegir
  de las skills cargadas (además de crear una propia).

Hoy la ficha tiene Clase como texto libre y cada habilidad/pasiva con Job
cuesta siempre 1 (`jobBudget`, 3 puntos + 3 por nivel).

## Cómo leer el PDF viejo

- **Acciones** → hoy serían **Nitros (No2)**. "Ataque" = lo que cuesta
  atacar (Tipo ÷ 2 el primero del turno, Tipo después). "Ataque +1" =
  eso más 1.
- **Bonos** → hoy serían **SP**. Contexto: antes 1 Int = 1 Bono que se
  recargaba entero cada turno; ahora 1 Int = 3 SP y el SP va a tener una
  regeneración base por turno, también según Int (en definición).
  **Provisorio: 1 Bono = 1 SP**, lo mismo que ya usa la ficha para el
  equipo viejo (`IT2.spPorBono`). Se revisa cuando esté definida la
  regeneración: si es generosa (cerca de Int por turno), los costos
  convienen subirlos.
- Shooter y Debuffer traen además **SP: Liviano / Normal / Pesado**, de
  otra iteración.
- Las tarjetas del Debuffer (con número en azul) son de una iteración
  más nueva: el número azul parece ser el costo en SP (Maldición
  debilitante dice "SP: (5)" y tiene un 5).

## Términos a confirmar (no existen hoy en la ficha)

| Término | Qué parece ser | Duda |
|---|---|---|
| Spammeable | Se puede usar varias veces por turno | La ficha ya tiene Espameable / No espameable: ¿las que no dicen nada son No espameables? |
| Flash | Se usa fuera de tu turno / como reacción | ¿Sigue existiendo? ¿Tiene costo distinto? |
| Causa fatiga | Penalidad después de usarla | No existe mecánica de fatiga hoy |
| En flor de 1 | Área: los 6 hexágonos alrededor | Confirmar |
| XdT4, dT8… | Dados del tipo indicado (d4, d8) | ¿"T" = Tipo de arma? |
| PG | Probabilidad de golpe (hoy PdG) | Confirmar |
| Peso del ataque | ¿Tipo del arma? | Confirmar |
| Crítico mejorado | ¿Crítico con un número menor? | No existe hoy |
| Res.Crit | Hoy es Resistencia a crítico por Tipo (Tipo 2…Tipo 10) | ¿A cuál suma? |
| Res.M / ESP | Hoy Res.Mg (Con) o Res.Mt (Int); ESP ya no es stat | ¿Cuál corresponde? |
| True damage / Holy / wicked / sónico | Tipos de daño | No hay tipos de daño en la ficha |
| Stacks de veneno | El preset Veneno de la ficha | ¿Cuánto hace cada stack? |

## Cerrado en la revisión

- **Peso** del arma = cantidad de dados de daño; **Tipo** = caras. "+X al
  peso" = +X dados; "dT8" = dados de Tipo 8.
- **Espameable**: se puede repetir en el turno; el límite lo ponen los
  Nitros.
- **Acciones → Nitros**: "Acciones: N" del PDF pasa a costar N No2.
- **Flash** = no cuesta Nitros y se puede usar durante el turno de
  cualquier jugador. "Acciones: 0" es siempre Flash, lo diga o no (ej.
  Estoicismo). Se declara cuando el que tiene el turno anuncia una
  acción, **antes** de que tire los dados (nunca después de ver el
  resultado).
- **A definir en mesa**: si una duda no se cierra en la revisión, la skill
  lleva una nota "⚖ A definir en mesa" que tiene que verse en su tarjeta
  para todos, así se decide entre todxs la próxima vez que aparezca en
  una partida.
- **Costo "Ataque"**: la skill cuesta los Nitros del ataque que
  corresponda en ese turno con esa arma (Tipo ÷ 2 si es el primero, Tipo
  completo después) y cuenta como ataque del turno.

## Warrior ⏳

1. ✅ **Turboimpacto** (Pegar fuerte) — **No2:** ataque. **SP:** X (máx.
   3). **Espameable.** Ataque con +X dados de daño del Tipo del arma.
2. ✅ **Arte de la guerra** — **Flash.** **SP:** 1. +2 a una sola tirada
   de PdG o de Parry.
   ⚖ A definir en mesa: ¿se puede usar varias veces sobre la misma tirada
   (con 3 SP, +6), una vez por tirada, o una vez por turno?
3. **Sacadito** — Acciones: Ataque. Bonos: 3.
   1+1d4 auto-ataques consecutivos. Causa fatiga.
4. **Cañón vasco** — Acciones: 1 / Ataque. Bonos: X ≤ Fue.
   Salta X casillas a X altura. Tira FUE para hacer esa cantidad de daño
   sónico en flor de 1. Tiene +X daño para atacar a un objetivo al caer.
5. **Remolino** — Acciones: X. Bonos: X.
   Ataque en flor. Causa fatiga.
6. **Estoicismo** — Acciones: 0. Bonos: 1.
   +3 Def. para el siguiente ataque. +2 Def. extra y +1 Res.Crit por cada
   enemigo adyacente.
7. **Megaguachazo** — Acciones: Ataque + 1. Bonos: 3.
   Ataque con +3 PG, +3 FUE y +50% DMG. Anula la próxima recarga de
   Bonos. Causa fatiga.
8. **Carga** — Acciones: Ataque + 1. Bonos: X ≤ AGI.
   Se mueve X en línea recta. Ataca con +X a PG y daño. Tira FUE para
   empujar X. Daño de colisión T8 igual a la distancia restante. Causa
   fatiga.
9. **Doble ataque** — Acciones: Ataque. Bonos: 1.
   Realiza un ataque adicional.

## Asalto ⏳

1. **Tajear** — Acciones: Ataque. Bonos: 1.
   Crítico mejorado. Deja heridas de 2 de daño por 2 turnos. Si es
   crítico, en vez de eso deja heridas permanentes de 3 de daño.
2. **Lisiar** — Acciones: Ataque. Bonos: 1.
   Crítico mejorado. Reduce las tiradas de DES y AGI en 1 por 2 turnos.
   Si es crítico, en vez de eso reduce en 2 por 3 turnos.
3. **Backstab** — Acciones: Ataque. Bonos: 2.
   Spammeable. Únicamente por la espalda. Máx. 1 vez por turno. +5 DMG.
   *(Dice Spammeable y a la vez máx. 1 por turno.)*
4. **Dash** — Acciones: 0. Bonos: 1.
   Se desplaza hasta 4 casillas en línea recta atravesando a los
   enemigos. Puede atacar a los enemigos atravesados gastando las
   acciones correspondientes.
5. **Sprint** — Acciones: Movimiento. Bonos: X ≤ Agi.
   Spammeable. +X movimiento adicional.
6. **Invi** — Acciones: 1. Bonos: 1.
   Permanece invisible mientras no realice una acción de combate. El
   efecto finaliza al quedarse sin acciones o sin bonos. No puede
   activarse si ya se desactivó este turno.
7. **Veneno** — Acciones: 1. Bonos: 2.
   Modifica un arma para que aplique 2 stacks de veneno en los próximos 2
   ataques. *(El Debuffer tiene otro Veneno.)*
8. **Asesinar** — Acciones: Ataque + 1. Bonos: 3.
   No recupera SP ni Bonos en el próximo mantenimiento. Crítico mejorado.
   +2 Crit. +3 PG. +6 daño. Tiene chances de asesinar si es crítico
   (6-: 10%, 7+: 25%, 17+: 50%, 20 natural: 100%). Causa fatiga.
9. **Robar SP** — Acciones: Ataque. Bonos: 3.
   Spammeable. Crítico mejorado. Si es crítico, recupera SP y el objetivo
   pierde SP.

## Tanque ⏳

1. **Blindaje** — Acciones: 0. Bonos: 1.
   Flash. La próxima vez que reciba daño lo reduce en 5.
2. **Caer al rescate** — Acciones: 1. Bonos: X ≤ 3.
   Flash. Se mueve X casillas hacia un objetivo. Tira FUE para empujarlo
   la misma distancia. Si hay un aliado en flor de 1, este puede moverse a
   cualquier casillero en el área.
3. **Miti Miti** — Acciones: 1. Bonos: 1.
   Designa un objetivo para absorber la mitad del daño que reciba durante
   2 turnos.
4. **Shockwave** — Acciones: 1. Bonos: 1.
   Tira FUE vs Res.CC para causar pajaritos en flor de 1 por 1 turno.
   Causa fatiga.
5. **Provocar** — Acciones: 1. Bonos: 1.
   Tira INT para obligar a un objetivo a atacarlo.
6. **Sonic boom** — Acciones: 1. Bonos: 2.
   Tira FUE vs Res.CC. En cono al frente, hace daño sónico igual a la
   diferencia. Los objetivos afectados pierden 1 acción y la mitad del
   movimiento por 1 turno.
7. **Curarse** — Acciones: 1. Bonos: 1.
   Tira CON. Se cura el doble del resultado.
8. **Espinas** — Acciones: 1. Bonos: 1.
   Por 2 turnos devuelve como true damage 1/4 del daño de ataque que
   reciba.
9. **Piel resistente** — Acciones: 1. Bonos: 2.
   Por 2 turnos gana 3 Def, 3 Res.M, 1 Res.CC, 1 Res.Crit. Causa fatiga.

## Mago ⏳

1. **Chispazo** (Proyectil mágico) — Acciones: 1. Bonos: 1.
   Spammeable. Hechizo. Daño a un objetivo. 1dT4 + INT.
2. **Rayo mágico** — Acciones: 1. Bonos: X ≤ INT.
   Spammeable. Hechizo. Daño a un objetivo. XdT2 + INT.
3. **Bola explosiva** — Acciones: 2. Bonos: 3.
   Hechizo. 4dT10 + INT en flor de 1.
4. **Ráfaga arcana** — Acciones: 1. Bonos: 1.
   Hechizo. 3dT6 + INT en cono al frente.
5. **Tormenta** — Acciones: 2. Bonos: 3.
   Hechizo. 1d4 chispazos a todos los enemigos. Causa fatiga.
6. **Toque mágico** — Acciones: 1. Bonos: 1.
   Hechizo. Toque meleé. Si acierta, 3dT8 + INT. Causa fatiga.
7. **Carga elemental** — Acciones: gratis con efecto mágico. Bonos: 1.
   +2d daño. Añade efecto elemental. El efecto se multiplica con el
   crítico. Fuego: stackea -1 HP máx./turno. Hielo: stackea 1 acción para
   actuar. Rayo: pierde 1 bono o stackea -1 bono el próximo turno.
   Tierra: +1d daño.
8. **Control mental** — Acciones: X. Bonos: X.
   Tira INT vs Res.M para comandar a un objetivo por X acciones. No puede
   dañarse a sí mismo.
9. **Mirror image** — Acciones: 1. Bonos: 2.
   Crean espejismos que confunden a cualquier atacante por 2 turnos. 4 en
   6 chances de fallar el ataque. Se desactiva si el ataque resulta
   exitoso. Causa fatiga.

## Shooter ⏳

1. **Apuntar** — Acciones: X. SP: Normal. Bonos: 1.
   +2 PG. +1 Crit. × X.
2. **Apuntar +** — Acciones: X. SP: Pesado. Bonos: 1.
   +4 PG. +1 Crit. × X. *(¿Versión mejorada de Apuntar o skill aparte?)*
3. **Marcar** — Acciones: 1. SP: Normal. Bonos: 1.
   Designa un objetivo como marcado por 2 turnos. Obtiene +1 PG, +1 Daño
   y +1 Crítico contra el objetivo marcado.
4. **Perforante** — Acciones: Ataque. SP: Normal. Bonos: 1.
   Ataque a distancia que atraviesa el primer objetivo y puede alcanzar a
   un objetivo adicional.
5. **Multiobjetivo** — Acciones: Ataque + 1. SP: Pesado. Bonos: X ≤ 5.
   Ataque a distancia que puede alcanzar hasta X objetivos posicionados al
   frente.
6. **Longshot** — Acciones: Ataque. SP: Liviano. Bonos: X ≤ DES.
   Incrementa el rango en X.
7. **Ricochet** — Acciones: Ataque. SP: Liviano. Bonos: 2.
   El ataque puede rebotar contra el escenario para alcanzar objetivos que
   no estén al alcance en línea directa.
8. **Headshot** — Acciones: Ataque. SP: Pesado. Bonos: 1.
   Ataque con +1 al crítico y crítico mejorado. Daño +5. +2 fijo a PG.
   Falla si no es crítico.
9. **Enlazar** — Acciones: 1. SP: Normal. Bonos: 1.
   DES vs AGI para dejar enlazado a un objetivo, impidiéndole alejarse y
   reduciendo su AGI a la mitad. Cada turno puede tirar DES para anular el
   efecto.
10. **Trampa** — Acciones: 1. SP: Normal. Bonos: 2.
    Deja una trampa invisible. Stun por 1 turno al que la pise.

**Reglas del tiro** (no es skill, va al manual): el ataque a distancia
funciona igual a un ataque normal. Con mecanismos, la FUE del ataque la da
el ítem. Distancia máxima de tiro certero = DES. Más allá puede fallar, se
verifica con 1d20: hasta DES×2 → 7+; hasta DES×3 → 17+; más de DES×3 → 20.
*(Hoy la ficha tiene el stat Rng.)*

## Support ⏳

1. **Toque sanador** — Acciones: 1. Bonos: 1.
   Spammeable. Toque directo que cura 1 + 1d8 HP.
2. **Empower** — Acciones: 1. Bonos: 1.
   Spammeable. Flash. +3 a cualquier tirada propia o de un aliado.
3. **Blessing** — Acciones: 1. Bonos: 2.
   +1 fijo en todas las tiradas por 2 turnos.
4. **Shield** — Acciones: 1. Bonos: 1.
   Flash. Otorga un blindaje temporal que absorbe 14 de HP hasta el final
   del turno.
5. **Re-Roll** — Acciones: 2. Bonos: 3.
   Flash. Permite rerolear tiradas aliadas.
6. **Transferir SP** — Acciones: 1. Bonos: 1.
   Recarga el SP de un aliado.
7. **Gran curación** — Acciones: 1. Bonos: 1.
   Cura 4d6+4 distribuidos entre cualquier número de objetivos.
8. **Smite** — Acciones: 1. Bonos: 1.
   Spammeable. 1d6+1 daño Holy inesquivable. ×2 daño vs wicked.
9. **Acelerador** — Acciones: 1. Bonos: 1.
   Marca una casilla con flechitas para adelante (>>). Si un aliado la
   pisa gana +1 Acción.

## Debuffer ⏳

El PDF trae **dos versiones**: una lista (Acciones/SP/Bonos) y tarjetas
más nuevas (número azul = costo, "Maldición (Esp / Res.M)" = se resiste
con Res.M). Van juntas por nombre.

1. **Enyetar** — Lista: Acciones 1, SP Normal, Bonos 1.
   Tarjeta: 5. Maldición (Esp / Res.M). Flash. Obliga a repetir una tirada
   y quedarse con el valor más bajo.
2. **Confusión** — Lista: Acciones 1, SP Normal, Bonos 2.
   Tarjeta: 5. Maldición (Esp / Res.M). Antes de realizar un ataque o
   habilidad con objetivo, tira 1d4: 1) el debuffer elige el objetivo;
   2) gasta los No2 pero no realiza la acción; 3) elige el objetivo al
   azar; 4) actúa normalmente. Los objetivos alternativos deben estar en
   un radio de 3 No2; si la acción requiere moverse, deberá hacerlo.
   Duración: 2 turnos.
3. **Miedo** — Lista: Acciones 1, SP Normal, Bonos 2. *(Sin descripción.)*
4. **Debilidad** — Lista: Acciones 1, SP Pesado, Bonos 2. *(Sin
   descripción. ¿Es la Maldición debilitante?)*
5. **Maldición debilitante** — Tarjeta: 5. Maldición (ESP / Res.M).
   SP: (5). -1 a todas las tiradas. Duración: 2 turnos. Acumulable. Lento.
6. **Maldición extenuante** — Tarjeta: 3. Maldición (Esp / Res.M).
   Incrementa en 1 los nitros de todas las acciones. Debe pagar 1 nitro
   para moverse cada 2 casillas. Duración: 1 turno. Acumulable. Lento.
7. **Maldición tormentosa** — Tarjeta: 5. Maldición (Esp / Res.M).
   Por cada acción recibe daño igual a No2 -1. Debe pagar 1 HP para
   moverse cada 2 casillas. Duración: 3 turnos. Acumulable. Lento.
8. **Drenar vida** — Lista: Acciones 1, SP Normal, Bonos X.
   Tarjeta: X. Tira X + 1dX. X no puede ser mayor a ESP. El objetivo tira
   resistencia mágica. Drena una cantidad de HP igual a la diferencia. El
   HP obtenido así puede acumularse hasta 50% por encima del máximo.
9. **Balas de sangre** — Lista: Acciones 1, SP Liviano, Bonos 1.
   Tarjeta: 1. Gasta X HP (máximo ESP). Dispara un proyectil tipo 1. El
   peso del proyectil es igual a la cantidad de vida gastada.
10. **Transferencia de HP / Transfusión sanguínea** — Lista: Acciones 1,
    SP Liviano, Bonos 1. Tarjeta: 1. Transfiere hasta 20 de HP de un
    personaje aliado a otro.
11. **Veneno** — Lista: Acciones 1, SP Liviano, Bonos 1.
    Tarjeta: 2. Maldición (Esp / Res.M). Aplica 3 stacks de veneno.
12. **Parálisis** — Lista: Acciones 2, SP Pesado, Bonos 3. *(Sin
    descripción.)*
13. **Nube tóxica** — Lista: Acciones 1, SP Normal, Bonos 3.
    Tarjeta: 3. Crea un área de flor que aplica 3 stacks de veneno al que
    entre en ella o esté en su interior durante el mantenimiento. Solo
    aplica 1 stack a personajes ya envenenados. Duración: 3 turnos.
    *("Lento" en las maldiciones: sin definir.)*
