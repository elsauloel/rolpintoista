# Re-roll: la Moneda Re-Roll (2026-09-27, regla del dueño)

> Por ahora **solo con la Moneda Re-Roll** (consumible del catálogo, `cat-moneda-reroll`). Más adelante se suman las **wildcards** (el dueño todavía no tiene definidas sus reglas).

## La regla
- Si tenés una **Moneda Re-Roll equipada en el cinturón**, podés gastar **1 No2** para usarla, **después de cualquier tirada**. Si no está en el cinturón (la tenés en la mochila), cuesta **2 No2** (igual que cualquier consumible).
- Usarla te da derecho a **volver a hacer la última tirada que hiciste** antes de consumirla.
- **Siempre después de usarla se tira una moneda:** **par** → la moneda **se conserva**; **impar** → **se rompe** (gasta una unidad, como un consumible).

## Cómo está armado
- **Fuera del duelo:** el botón **🪙** de la cabecera de la Botonera (al lado del 🎲). Repite tu última tirada con los **mismos dados y bonos** (Lisiado/Pajaritos ÷2 incluidos; sale en la Mesa como «… (re-roll)»), cobra los No2 (usa la moneda del cinturón primero; si faltan No2 avisa y deja seguir) y **después tira la moneda** (línea «🪙 Moneda Re-Roll · par: se conserva / impar: se rompe»). La moneda no cuenta como «última tirada». Funciona con la última tirada de cualquier tipo (PdG, daño, stats, dados libres…). Código: `ultimaTirada`, `monedaReroll`, `repetirTirada`, `rerollFuera` en `ficha.html`.
- **Dentro del duelo:** un **botón flotante 🪙 Re-roll** (arriba de todo, late en dorado) que aparece en el cuadro del duelo cuando **tenés una moneda** y **tenés una tirada que se puede reabrir**: dice cuál («volver a tirar PdG · 1 No2»). Reabrir es **borrar esa tirada y devolverte el botón para tirarla de nuevo** (dados 3D, mismo empate); se recalcula todo lo que dependía de ella. Al apretarlo se cobran los No2, se reabre y se tira la moneda. Código: `puedeReabrir`, `reabrir`, `rerollBtnHtml` en `comun/duelo.js`; hooks `rerollInfo`/`rerollUsar` de la ficha.
- **Qué tiradas del duelo se pueden reabrir** (la más avanzada tuya primero): atacante → los d20 del crítico, Fuerza del golpe, PdG; defensor → Bloqueo, Evasión/Parry. **Solo mientras no pasó a una etapa posterior con tiradas** (Bloqueo, crítico o daño) **y no se aplicó daño ni efectos**. Si el defensor reabre su Evasión/Parry, **elige de nuevo** cómo defenderse (los No2 de un Parry ya pagado no se devuelven). El daño **no** se puede reabrir (el mapa del GM lo aplica al instante).
- Creeps e invocaciones no usan monedas.
- El catálogo: la moneda ahora lo explica en su detalle y lleva `rerollMoneda: true`.

## Pendiente / a decidir
- **Wildcards:** cuando el dueño defina sus reglas, mismo botón y mismas piezas (cambia solo de dónde sale el permiso y qué cuesta).
- ¿Se puede usar la moneda **dos veces seguidas** sobre la misma tirada (con dos monedas)? Hoy sí: la tirada repetida pasa a ser «la última».
- ¿Reabrir el daño con un margen de tiempo antes de que el GM lo aplique? Hoy no.
- Falta probarlo en mesa (el flujo de No2 insuficientes, la moneda y el botón flotante en el mapa con el iframe).
