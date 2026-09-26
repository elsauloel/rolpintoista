# Ataque paso a paso (duelo en vivo entre atacante y defensor)

> Idea del dueño, 2026-09-26. **Estado: propuesta, sin implementar.** Las preguntas están al final y también en `preguntas-abiertas.md` (P-Duelo).

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

## Efectos que ahora se aplican solos
Con el duelo, «si pega, envenena» deja de ser un recordatorio: al pegar, los `efectosGolpe` se tiran en pantalla (con su probabilidad) y, si entran, **se aplican al defensor** (Envenenar, Sangrado, Rompe armadura, Lisiado, Aturdir…) con su estado ya cargado y una línea en el resumen final. Queda el botón «deshacer» y la salida manual del GM, como siempre. *(Esto responde a la pregunta 4: aplicar solos, con deshacer.)*

## Qué automatiza
Costo de No2 del ataque, elección de bono de PdG según el tipo de ataque, comparación PdG vs Evasión, Parry vs PdG, Fuerza vs Bloqueo, rango de crítico, resistencia a crítico, resta de Defensa, descuento de HP en la ficha o en el creep, efectos del golpe, y la oferta de contraataque. Hoy todo eso es manual o va en pasos sueltos.

## Cómo se construiría (para más adelante)
Un documento de Firestore por duelo (`duelos/{id}`) con el estado del paso, las tiradas de cada lado y el resultado; las dos pantallas lo escuchan en vivo (mismo mecanismo que la Mesa y el mapa). La lógica de cada paso vive en `comun/` (un solo código para ficha, GM y mapa). Se puede hacer **por etapas**: primero pasos 1–3 (contacto), después Parry/Bloqueo, crítico y daño, y al final los efectos.

## Preguntas abiertas
1. **¿Qué pasa si el defensor no responde?** Propuesta: el GM puede tirar por él, o el duelo espera con un botón «tirar por él / seguir sin defensa».
2. **¿Los creeps defienden con el mismo menú?** Propuesta: sí, en la pantalla del GM, con las mismas botoneras.
3. **¿El daño se descuenta solo del HP?** Propuesta: sí, con «deshacer» de un toque.
4. ✅ (dueño, 2026-09-26) **Los efectos del golpe se aplican solos al defensor** («si pega, envenena»), con deshacer. *(Cambia la regla anterior de dejarlos a mano.)*
5. **¿Se puede reaccionar más de una vez?** (Parry, Bloqueo, contraataque encadenado, ataque de oportunidad). Propuesta: cada respuesta abre un duelo hijo dentro del mismo.
6. **¿Ataques de área, varios objetivos y trampas?** Propuesta: primero 1 contra 1; después uno por objetivo.
7. **¿Se puede usar la tirada suelta de siempre?** Propuesta: sí, los botones actuales siguen para tiradas sueltas y para mesas sin mapa.
8. **Cuándo:** ¿va antes que el resto del rework o después de consolidar catálogo y creeps?
