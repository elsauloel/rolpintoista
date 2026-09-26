# Ataque paso a paso (duelo en vivo entre atacante y defensor)

> Idea del dueño, 2026-09-26. **Estado: etapa 1 hecha (2026-09-26, sin probar en mesa): pasos 1 a 3 — declarar, aviso al defensor y PdG contra Evasión con veredicto.** Código en `comun/duelo.js`; falta pegar las reglas de Firestore (`duelos`). Las preguntas están al final y también en `preguntas-abiertas.md` (P-Duelo).

## La idea
Al tocar **Atacar** se elige el **token objetivo** en el mapa y se abre un **menú paso a paso compartido**: los dos involucrados ven el mismo duelo, en vivo. Al defensor le llega un aviso («te están atacando · abrir menú») y ve **las botoneras que le tocan**. Cada paso se muestra en pantalla con su resultado, para que se sienta que **está sucediendo ahora** y no sea solo hacer clics y tramitar.

## Los pasos (propuesta)
1. **Declarar.** Atacante: qué ataque es (normal / oportunidad / contraataque) y con qué arma. Se descuentan los No2 solos. Se ve cuál es el objetivo. *(Reemplaza al menú actual de Atacar.)*
2. **Aviso al defensor.** Cartel «⚔ X te ataca con Y — Abrir». Puede abrirlo o no; si es un creep, lo maneja el GM.
3. **Tiradas de contacto.** Atacante: **PdG** (suma solo el `pdgcontra`/`pdgopor` que corresponda). Defensor: **Evasión**. Cada uno tira su dado; se muestran **lado a lado** con animación de dados y el veredicto grande: **«PEGÓ»** / **«FALLÓ»**. Si el defensor puede **Parry**, aparece su botón (con el costo en No2); si lo usa: Parry vs PdG.
4. **Bloqueo.** Si el defensor ganó el Parry: **Fuerza del golpe** (Fue + peso del arma) contra su **Bloqueo** (Bloqueo + peso). Veredicto: el golpe entra o se frena. Si el Parry salió bien, se ofrece **⚔ Contraatacar** ahí mismo (abre un duelo nuevo, con el rol invertido).
5. **Crítico.** Si PdG − Evasión alcanza el rango del crítico del arma: se ve «¡CRÍTICO!»; el defensor tira su **Resistencia a crítico** y se muestra el resultado (solo golpes físicos).
6. **Daño.** Atacante: **Daño** del arma. Se ve el dado, el daño fijo y los bonos. Defensor: su **Defensa** resta (con armadura rota si corresponde). Se muestra la cuenta completa: `daño − defensa = HP perdidos`.
7. **Efectos del golpe.** Los `efectosGolpe` del arma (Sangrado, Envenenar, Rompe armadura…) se tiran en pantalla y **se aplican al defensor** (hoy es a mano a propósito; en el duelo se propone aplicarlos con botón «Aplicar» o solos).
8. **Resumen.** Una tarjeta final con todo lo que pasó (queda en la Mesa/bitácora): quién, con qué, cada tirada, HP antes y después.

## Cómo se muestra (la parte clave)
- Pantalla dividida: **atacante a la izquierda, defensor a la derecha**, con el paso actual resaltado y los anteriores apilados arriba como «historial del duelo».
- Cada tirada: dado que rueda (ya está `dados3d.js`), el número final grande, y el cálculo desglosado (dado + bonos = total).
- Cada veredicto entra con un cartel y color propio: verde/rojo, «PEGÓ / FALLÓ», «PARRY», «BLOQUEADO», «CRÍTICO», «−7 HP».
- Espera visible: «esperando que Ana tire su Evasión…», para dar la sensación de duelo real.
- El GM puede **saltear, forzar o corregir** cualquier paso (regla sandbox: ayudar, no encerrar).

## El crítico como momento de festejo (dueño, 2026-09-26)
- Cuando el golpe **es crítico**, el paso se **destaca a pantalla completa** en el duelo: cartel **«¡CRÍTICO!»** con animación y color propios, para que el jugador se ponga contento. Lo ven los dos.
- La **calculadora de crítico** corre sola: rango (PdG − Evasión contra el Tipo), Resistencia a crítico del defensor, y el **multiplicador** que sale del d20 (doble, triple o cuádruple; ya está en `06-combate.md`).
- El resultado se muestra **enorme y destacado**: el multiplicador («×3 · TRIPLE DAÑO») y, debajo, el número final grande (**35**) con la leyenda **«derecho a la vida»** en rojo. Coincide con la regla actual: el crítico **ignora la Defensa**, así que ese número es exactamente lo que baja de HP.
- Además del crítico, se muestran con festejo propio los otros momentos altos: Parry exitoso, golpe bloqueado, muerte del defensor.

## Efectos del golpe: se tiran solos, se aplican con un botón (dueño, 2026-09-26)
Al pegar, los `efectosGolpe` del arma se **tiran en pantalla** (con su probabilidad) y, si entran, aparece un botón **«Aplicar»** para cargarlos al defensor (Envenenar, Sangrado, Rompe armadura, Lisiado, Aturdir…), con su estado ya armado y una línea en el resumen. **Aplicar es un gesto del jugador, a propósito**: la automatización ayuda pero no le quita la sensación de estar jugando un rol de mesa. Deshacer y salida manual del GM, como siempre.

### Cada efecto con probabilidad es un momento propio (dueño, 2026-09-26)
Si el arma **o la habilidad** tiene un efecto con porcentaje (por ejemplo **Lisiado 25 %**), al impactar **no se resuelve en silencio**: el paso de efectos le dedica **un momento a cada uno**, a la vista de todos:
1. Un cartel con el efecto y su chance: **«🦵 Lisiado · 25 %»** (con lo que hace, en una línea).
2. Un botón **«🎲 Tirar»** (lo toca el atacante; el GM puede tirar por él): **el dado aparece y rueda** (el mismo dado 3D de la Mesa, con la moneda/d4 que corresponda a la probabilidad).
3. El veredicto grande: **«✔ ¡FUNCIONÓ!»** (y aparece el botón **«Aplicar»** sobre el defensor) o **«✘ No funcionó»**. Si el efecto necesita daño y el golpe no lo hizo, en lugar de tirar se muestra tachado con el motivo.
Un efecto sin porcentaje (100 %) no pide tirada: muestra directamente «Aplicar». Cada tirada queda también en la Mesa y en el resumen final. (Reutiliza la lógica de `comun/efectos-golpe.js`, que ya sabe qué dado tirar para cada porcentaje.)

### Distinción nueva: efectos que necesitan daño y efectos que no (dueño, 2026-09-26)
Hay efectos que **solo se aplican si el golpe hace daño** (ej.: una cuchilla envenenada acierta el PdG, pero si la armadura absorbe todo, no hay veneno) y otros que **se aplican aunque no pase el daño**. Cada efecto de golpe, en un ítem o en una habilidad, lleva un dato **«Se aplica: ☑ solo si hace daño / ☐ aunque no pase el daño»**, que se elige en el asistente paso a paso (con un valor por defecto según el efecto, editable).
*Propuesta de valores por defecto (a confirmar):*
- **Solo si hace daño** (tiene que entrar en la carne): Envenenar, Veneno severo, Sangrado, Drena vida, Lisiado.
- **Aunque no pase el daño** (fuerza del impacto, fuego o daño a la armadura): Demora, Aturdir, Derribar, Prende fuego, Rompe armadura.
En el duelo, el paso de efectos solo ofrece «Aplicar» a los que corresponden y muestra los otros tachados con el motivo («la armadura absorbió el golpe: el veneno no entra»).

## Qué automatiza
Costo de No2 del ataque, elección de bono de PdG según el tipo de ataque, comparación PdG vs Evasión, Parry vs PdG, Fuerza vs Bloqueo, rango de crítico, resistencia a crítico, resta de Defensa, descuento de HP en la ficha o en el creep, efectos del golpe, y la oferta de contraataque. Hoy todo eso es manual o va en pasos sueltos.

## Cómo se construiría
Un documento de Firestore por duelo (`duelos/{id}`) con el estado del paso, las tiradas de cada lado y el resultado; las dos pantallas lo escuchan en vivo (mismo mecanismo que la Mesa y el mapa). La lógica de cada paso vive en `comun/` (un solo código para ficha, GM y mapa). Se puede hacer **por etapas**: primero pasos 1–3 (contacto), después Parry/Bloqueo, crítico y daño, y al final los efectos.

## Preguntas abiertas
1. ✅ (dueño, 2026-09-26) **Defensor ausente: el GM puede tirar por él** (botón «tirar por él»).
2. **¿Los creeps defienden con el mismo menú?** Propuesta: sí, en la pantalla del GM, con las mismas botoneras.
3. **¿El daño se descuenta solo del HP?** Propuesta: sí, con «deshacer» de un toque.
4. ✅ (dueño, 2026-09-26) **Los efectos del golpe se tiran solos pero se aplican con un botón «Aplicar»** (para no perder la sensación de mesa), y hay una distinción nueva: solo si hace daño / aunque no pase.
5. **¿Se puede reaccionar más de una vez?** (Parry, Bloqueo, contraataque encadenado, ataque de oportunidad). Propuesta: cada respuesta abre un duelo hijo dentro del mismo.
6. ✅ (dueño, 2026-09-26) **Se empieza en 1 contra 1**; los efectos de área y los ataques de un creep a varios quedan para después.
7. **¿Se puede usar la tirada suelta de siempre?** Propuesta: sí, los botones actuales siguen para tiradas sueltas y para mesas sin mapa.
8. ✅ (dueño, 2026-09-26) **Se hace ya**, por etapas. El dueño lo va definiendo conceptualmente y lo revisa cuando esté en la compu.

## Estado de la implementación (2026-09-26)
**Etapa 1 hecha** (y ajustada el mismo día por pedido del dueño):
- **Objetivo con un clic en el mapa:** Atacar (de la ficha, de una invocación o de las Acciones de un creep) esconde la Botonera y el mapa pide «elegí a quién atacás — clic sobre el token» (Esc o clic derecho cancelan; hay un botón «Sin objetivo · tirada suelta»). En una ficha suelta (sin mapa) se elige de una lista.
- **El cuadro del duelo es de todos:** al crearse, **se abre solo en la pantalla de todos los conectados** (ocupa la pantalla). Cualquiera lo puede **minimizar** (—) y queda un botón **«⚔ Ver duelo: A → B»** para volver a abrirlo; al resolverse queda un botón con el resultado un par de minutos. Cerrar (✕) lo descarta.
- **Solo los botones que corresponden:** el atacante ve «Pagar y tirar PdG»; el defensor, «Tirar Evasión»; los demás miran («esperando que X tire…»). No se abre la Botonera: la tirada se le pide al iframe del dueño por detrás (si hace falta un cartelito, por ejemplo de Nitros o de sobrepeso, ahí sí aparece).
- **Suspenso:** los números quedan escondidos («✔ Ya tiró») hasta que tiran los dos; después se revelan con animación y el veredicto grande **¡PEGÓ!** / **FALLÓ**.
- **Invocaciones** atacan y defienden igual que el personaje. Si el defensor no responde, el GM (o el dueño) tira «a mano» escribiendo el valor del stat.
**Empate (regla del dueño, 2026-09-26, hecho):** si empatan PdG y Evasión y solo una de las dos tiradas lleva un «+» fijo, gana la que no lo lleva; si las dos lo llevan (o ninguna), el cuadro dice «⚖ ¡EMPATE!» y **cualquiera de los dos elige par o impar** (el primero que elige decide): se tira un d6 y gana el que acierta. Todo a la vista de todos. **Cuando el empate se resuelve se comunica:** el cuadro muestra una línea destacada («⚖ Se resolvió el empate: …» con el motivo) y **se anuncia también en la Mesa** (línea de sistema), para que quede escrito por qué ganó cada uno.
**Falta de la etapa 1:** nada más que probarla. **Sin probar en mesa** (solo con un Firestore simulado): pegar las reglas y probar con dos personas.
**Hechizos (pedido del dueño, sin hacer):** un hechizo también abre el duelo, con **solo lo que corresponde**: el lanzador tira su Especial y el objetivo ve **solo su Resistencia mágica (o mental) si corresponde**. El documento del duelo se va a generalizar con un `modo` (`ataque` | `hechizo`) que cambia las etiquetas y los botones. Falta ver cómo salen hoy los hechizos de las habilidades (tirada con stat + objetivo) para engancharlos.
**Próximas etapas:** Parry y Bloqueo → crítico (con `critico.js`) y su festejo → daño y defensa (baja de HP) → efectos del golpe con «Aplicar» (y la distinción «solo si hace daño») → hechizos.

## Resumen final en la Mesa (confirmado por el dueño, 2026-09-26)
Cuando el duelo termina (se resolvieron todos los pasos y efectos), **se arma un texto resumen y se vuelca a la Mesa como una sola línea** (paso 8): quién atacó a quién y con qué, PdG contra Evasión (y cómo se resolvió un empate), Parry/Bloqueo si hubo, si fue crítico y con qué multiplicador, el daño y la Defensa, cuánta vida perdió y de cuánto quedó, y los efectos aplicados. Las tiradas sueltas (los dados que ruedan) **siguen apareciendo en la Mesa mientras pasan**, como siempre; el resumen es el cierre. Hoy (etapa 1) solo se anuncia el desempate; el resumen completo se agrega cuando estén hechas las etapas de daño y efectos.

## Etapa 2 (propuesta, 2026-09-26): la defensa desde el punto de vista del defensor
**Paso 2 se abre en dos: el atacante tira su PdG y el defensor ELIGE cómo se defiende, a ciegas** (el PdG sigue escondido, como en la mesa real):
- **🏃 Evasión** (sin costo; con el aviso de sobrepeso si corresponde).
- **🗡 Parry con arma / 🛡 Parry con escudo** (uno por cada arma o escudo equipado, cada uno con su costo en No2 = su Peso). Si no le alcanzan los No2, el botón sale apagado con el motivo.
- Si el defensor está Sentado, sin No2, etc., el cuadro **apaga solo lo que no puede** y lo dice.
Solo aparecen esos botones (no la Botonera).

**Camino A · Evasión:** PdG contra Evasión → «¡PEGÓ!» (sigue a crítico y daño) o «FALLÓ» (fin del duelo).
**Camino B · Parry:** PdG contra Parry.
1. Si **gana el atacante**: el Parry falló y el golpe **entra** (los No2 del Parry ya se gastaron). Sigue a crítico y daño.
2. Si **gana el defensor**: se abre el **paso 3 · Bloqueo**: el atacante tira su **Fuerza del golpe** (Fue + peso de su arma) y el defensor su **Bloqueo** (Bloqueo + peso de su arma o escudo), las dos como suma. Si gana el defensor: **«🛡 ¡BLOQUEADO!»**, el golpe queda anulado. Si gana el atacante: el golpe entra (propuesta: completo).
3. Después de **ganar el Bloqueo**, el cuadro le **ofrece al defensor «⚔ Contraatacar»** (decidido: solo si se gana el Bloqueo), que abre un **duelo nuevo con los roles invertidos** (cuesta lo de un primer ataque, Tipo ÷ 2, y suma su `pdgcontra`).
Cada tirada usa la misma regla de empate (gana la que no lleva «+»; si no, par o impar), y todo se anuncia con su veredicto grande y en la Mesa.

**Preguntas abiertas (propuesta entre paréntesis):**
1. ✅ (dueño, 2026-09-26) El defensor elige la defensa **antes** de ver el PdG (a ciegas).
2. ✅ (dueño, 2026-09-26) Gana el Parry pero **pierde el Bloqueo**: **pasa la mitad del daño y se consume 1 punto de durabilidad** del arma o escudo con el que bloqueó. Nace la mecánica de **durabilidad** (armas y escudos = 2 por punto de Peso; las armaduras también se rompen): ver [`durabilidad.md`](durabilidad.md).
3. ✅ (dueño, 2026-09-26) **Crítico contra Parry: se calcula igual, solo que con el Parry en lugar de la Evasión** (PdG − Parry).
4. ✅ (dueño, 2026-09-26) **El contraataque solo se ofrece si se gana el Bloqueo** (no basta con ganar el Parry).
5. ✅ (dueño, 2026-09-26) **No hay tiempo límite** para elegir la defensa (el GM igual puede tirar por el defensor si no está).

## Estado de la etapa 2 (2026-09-26, hecha, sin probar en mesa)
**Hecho en `comun/duelo.js`:** el defensor **elige su defensa a ciegas** (botones en el cuadro: 🏃 Evasión, 🗡/🛡 Parry con cada arma o escudo equipado con su costo en No2, apagados con el motivo si no le alcanzan); si el **Parry** gana el contacto se abre el **paso 3 · Bloqueo** (Fuerza del golpe contra Bloqueo del arma o escudo del Parry); resultados: **¡PEGÓ!** (Evasión perdida, o Parry perdido), **FALLÓ** (Evasión ganada), **¡BLOQUEADO!** (Parry y Bloqueo ganados → botón **⚔ Contraatacar**, que abre un duelo nuevo con los roles invertidos) y **PASA LA MITAD** (Parry ganado, Bloqueo perdido: mitad del daño redondeada para arriba y el aviso de que el arma o escudo pierde 1 de durabilidad). El **empate** vale para los dos pares de tiradas (contacto y Bloqueo). Las invocaciones y los creeps defienden igual (los creeps con Evasión o Parry con su arma). Cada paso tiene su cartel y todo se ve en la pantalla de todos.
**Todavía no:** la **durabilidad** (el cuadro solo avisa que hay que descontarla a mano), el **crítico** (etapa 3), el **daño** y la **defensa**, y los **efectos** (etapas siguientes). Reglas de Firestore: cambiaron los campos del duelo, **hay que volver a pegarlas**.

## Estado de la etapa 3 · Crítico (2026-09-26, hecha, sin probar en mesa)
**Hecho en `comun/duelo.js`** (usa `comun/critico.js`): cuando el golpe **pega** (Evasión perdida, o Parry perdido), el cuadro abre el **paso 4 · Crítico**: muestra la cuenta completa (PdG − la defensa usada = diferencia; rango del crítico = Tipo del arma − Crítico frecuente; nivel; menos la Resistencia a crítico del defensor) y, si queda algo, **«🎲 Tirar N d20»** (lo toca el atacante o el GM; los dados salen en la Mesa). El mejor d20 da el multiplicador (7+ doble, 17+ triple, 20 cuádruple; el Crítico potente los baja) y sale el cartel dorado y brillante **«¡CRÍTICO! ×3 · TRIPLE DAÑO»** para todos, con su aviso en la Mesa. Si no hay crítico (diferencia chica o la Resistencia lo anuló) queda una línea con el motivo y el golpe pega normal. Los datos salen de cada ficha (Crítico frecuente y potente del arma que usa, y su Resistencia a crítico al Tipo) y de los creeps, y viajan en el propio duelo. **Falta** (etapa 4): el número del daño en grande —«**35** derecho a la vida» en rojo—, que necesita la tirada de daño. Hay que volver a pegar las reglas de Firestore (campos `critDatos` y `crit`).

**Regla general (dueño, 2026-09-26): las reglas de combate se aplican a las invocaciones del mismo modo que a los creeps** (Parry a 1 No2, crítico con su Crítico frecuente/potente y su Resistencia a crítico, sin durabilidad, Rompe armadura les baja la Defensa). Al programar, una invocación se trata como un creep.

**Tabla del d20 a la vista (dueño, 2026-09-26, hecho):** antes de tirar el crítico el cuadro muestra la **tabla de valores** (×2 con 7 o más, ×3 con 17 o más, ×4 con 20) y, si el atacante tiene **Crítico potente**, la tabla **modificada** con los números resaltados (✎), la columna «Base» al lado y la explicación de **cómo y por qué** cambió (cada punto baja 1 el doble, 1 cada 2 el triple y 1 cada 3 el cuádruple, con mínimo 1). Después de tirar, la fila que salió queda resaltada.

## Estado de la etapa 4 · Daño (2026-09-26, hecha, sin probar en mesa)
**Hecho:** cuando el golpe pega (con o sin crítico) o pasa la mitad, el cuadro abre el **paso 5 · Daño**: el atacante toca **«🎲 Tirar el daño · arma»** (el daño del arma **sin** los efectos del golpe, que son la etapa 5) y el **GM aplica el daño al HP** desde el mapa (`dueloAplicarDano`, que reutiliza el «Recibe daño» de siempre: **Invulnerable** y **Escudo mágico** valen). Reglas: **crítico** = daño × multiplicador, **derecho a la vida** (sin restar la Defensa); **sin crítico** = daño − Defensa; **pasa la mitad** = (daño − Defensa) ÷ 2 redondeado para arriba. El resultado sale con el **número grande**: por ejemplo **«36 · DERECHO A LA VIDA»** en rojo (con «12 × 3 · el crítico ignora la Defensa»), o «8 de daño (12 − Defensa 4)», y debajo la vida del defensor («30 → 22 HP», y cuánto absorbió el escudo). Todo se anuncia también en la Mesa. Solo el mapa del GM aplica el daño (solo el GM puede escribir el HP de otros); si no hay un GM conectado, el cuadro dice «El GM aplica el daño al HP». Si no se puede aplicar solo (**invocaciones**, un token que ya no está, una ficha sin Defensa publicada) el cuadro muestra el número y pide **aplicarlo a mano** (el GM tiene el botón «Ya lo apliqué a mano»). Hay que **volver a pegar las reglas de Firestore** (campo `dano`).
**Todavía no:** **deshacer** el daño aplicado: **Ctrl+Z no aplica al daño de combate, solo a los cambios de HP hechos a mano** (regla del dueño, 2026-09-26; el daño del duelo no entra en esa pila de deshacer). Si hubo un error, se corrige a mano con el HP directo del mapa, la **durabilidad** (el arma o escudo que bloqueó y la armadura rota por ítem) y los **efectos del golpe** (etapa 5, con los momentos de dado y «Aplicar»).

## Estado de la etapa 5 · Efectos del golpe (2026-09-26, hecha, sin probar en mesa)
**Hecho:** cuando el daño ya se aplicó, el cuadro abre el **paso 6 · Efectos del golpe** con **una tarjeta por cada efecto** del arma (los `efectosGolpe` del arma o `armaEfectos` del creep o de la invocación). Cada tarjeta es **su propio momento**: el nombre y la chance («Lisiado · 25 %»), lo que hace, y el botón **«🎲 Tirar 1d4»** (lo toca el atacante o el GM; el dado sale en la Mesa); después el cartel grande **«✔ ¡FUNCIONÓ!»** (con lo que salió, y la tirada extra si el efecto la trae, por ejemplo «1d4 = 3») o **«✘ No funcionó»**. Si funcionó aparece **«✔ Aplicar Lisiado (3 turnos) sobre el Goblin»**: al tocarlo, **el mapa del GM lo aplica** (a un creep le escribe el estado; a un personaje le llega a su ficha, como las trampas) y la tarjeta dice «✔ Aplicado». **Los efectos que necesitan daño** (Envenenar, Veneno severo, Sangrado, Drena vida, Lisiado) **quedan tachados con el motivo** si el golpe no hizo daño («el golpe no hizo daño (la armadura lo absorbió)») o si el defensor era Invulnerable; **Demora, Aturdir, Derribar, Prende fuego y Rompe armadura entran igual**. Los efectos sin estado automático (Demora, Prende fuego, Drena vida…) dicen **«✋ A mano»** con lo que hay que hacer y un botón «Listo, lo apliqué a mano». Cuando no queda nada por resolver, el duelo termina (hay un botón para terminarlo antes). Mapeo a estados: Rompe armadura → Armadura rota (×stacks) · Sangrado · Envenenar → Veneno (con sus stacks) o Veneno severo · Lisiado · Aturdir → Stun · Derribar → Sentado · Pajaritos. Reglas de Firestore: campo `efectos` (**hay que volver a pegarlas**).
**Todavía no:** los efectos de las **habilidades** (hoy solo los del arma); el dato «se aplica solo si hace daño / aunque no pase» **editable por efecto en el asistente de ítems y habilidades** (hoy sale de una tabla por nombre, con la propuesta aprobada); **Armadura rota por ítem** y la **durabilidad** (por ahora Rompe armadura pone el estado de siempre); **Demora** (mover en la tabla de iniciativa) y **Prende fuego** automáticos; y el **resumen final** en la Mesa.

## Estado del resumen final (2026-09-26, hecho, sin probar en mesa)
Cuando el duelo termina, **quien lo creó (el atacante) publica en la Mesa una línea de resumen** (un renglón por cosa que pasó): quién ataca a quién y con qué, el contacto (PdG contra Evasión o Parry, y si hubo desempate), el Bloqueo, el crítico con sus d20, el daño (con la cuenta y la vida antes y después), la durabilidad que se gasta, cada efecto (✔ aplicado / ✘ no funcionó / no entró) y el resultado. Se publica una sola vez por duelo. **Hay que volver a pegar las reglas de Firestore** (campo `resumido`).

## Ajustes por la primera prueba en el mapa (2026-09-26)
- **Suspenso de verdad:** el PdG, la Evasión o el Parry, la Fuerza del golpe y el Bloqueo **ya no van a la Mesa apenas se tiran**: se guardan en el duelo y **las dos tiradas de cada par se publican juntas en la Mesa (con sus dados) cuando tiraron los dos**. Antes el PdG aparecía en la Mesa aunque el cuadro lo escondiera, lo que rompía elegir la defensa a ciegas y hacía parecer que el cuadro «no mostraba» un resultado que la Mesa sí. (Mecanismo: `window.DUELO_RETENER` frena `mesaPublicar` mientras el duelo espera esa tirada.)
- **Opciones de defensa de un creep**: el mapa del GM las calcula solo (`opcionesLocal`), sin cargar las Acciones en un iframe (era lento y a veces no respondía). Si igual no llegan (o la ficha/Acciones no responden en 12 segundos) el cuadro ofrece **↻ Reintentar** y **🎲 Tirar a mano** en vez de quedarse cargando.

**Los botones de defensa muestran cuánto tirarías (dueño, 2026-09-26, hecho para personajes e invocaciones):** cada opción trae su fórmula de dados —«Evasión 🎲 1d6+1»— y cada Parry, además, el **Bloqueo que tirarías si ganás** con esa arma o escudo («Parry 🎲 1d6 · si ganás, Bloqueo 🎲 1d8+1»), con las mitades de Lisiado/Pajaritos/Sentado y el aviso de sobrepeso. Así se elige la defensa sabiendo qué conviene. **Falta** para los **creeps** (el mapa calcula sus opciones sin cargar gm-tools y hoy no trae los números).

**Dados siempre arriba (dueño, 2026-09-26):** la capa de los dados 3D (`comun/dados3d.js`) pasó a `z-index: 100000`, por encima de cualquier menú (el cuadro del duelo usa 99000). **Vincular solo (2026-09-26):** si el GM ataca a un token de creep que no está vinculado a ninguna ficha de GM Tools (se creó con «Nuevo token»), el mapa lo vincula solo al creep del mismo nombre (prefiere uno que todavía no tenga token) y avisa; si no hay ninguno con ese nombre, avisa que faltan sus datos.

**Sobrepeso en la Evasión, dentro del cuadro (dueño, 2026-09-26):** con el equipo pasado de Crg.Max, en vez de un popup escondido en la ficha, el cuadro ofrece **dos botones de Evasión**: «🏃 Evasión · pagando 1 No2» (sin penalidad) y «🏃 Evasión · con penalidad −N» (sin gastar No2), cada uno con su fórmula de dados.
