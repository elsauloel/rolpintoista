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
