# Re-roll: la Moneda Re-Roll (2026-09-27, regla del dueño)

> Por ahora **solo con la Moneda Re-Roll** (consumible del catálogo, `cat-moneda-reroll`). Más adelante se suman las **wildcards** (el dueño todavía no tiene definidas sus reglas).

## La regla
- Con una **Moneda Re-Roll equipada** (cinturón o mochila) podés volver a hacer **cualquier tirada tuya del juego**, **sin costo de No2**.
- Se abre una **ventana con tus últimas tiradas** y elegís cuál repetir — no hace falta que sea la última.
- **Una moneda por tirada:** cada tirada solo se puede re-rolear una vez. La tirada que sale de repetirla es una tirada **nueva**, que se puede volver a re-rolear con otra moneda.
- **Siempre después de usarla se tira una moneda:** **par** → la moneda **se conserva**; **impar** → **se rompe** (gasta una unidad, como un consumible).

## Cómo está armado
- **Botón fijo en el mapa** (🪙, solo jugadores): vive en el grupo de arriba a la derecha, junto a los lentes 👓 y los botones de rango 📏🔮 — siempre visible, no hace falta abrir la Botonera. Al tocarlo abre la ficha en el iframe de siempre y muestra la ventana de re-roll.
- **Botón en la cabecera de la Botonera** (🪙, al lado del 🎲): mismo destino, para cuando la ficha se usa suelta (sin el mapa).
- **La ventana** lista tus últimas tiradas (hasta 20, las de `dadosHistorial`: PdG, daño, stats, dados libres…), cada una con su fórmula y su total, y un botón **🪙 Re-roll** por fila (apagado si ya usó su moneda esta sesión, o si no tenés una moneda). Al elegir una: se repite con los mismos dados y bonos (Lisiado/Pajaritos ÷2, «+2 ⚡» de un Flash… se conservan), sale en la Mesa como «… (re-roll)», y después se tira la moneda. Código: `dadosHistorial` (cada entrada con un `rerollId`), `monedaReroll`, `repetirTirada`, `renderReroll`/`abrirReroll`, `rerollUsados` (Set en memoria, no se guarda: dura lo que dura la sesión) en `ficha.html`.
- **Dentro del duelo:** un botón flotante **🪙 Re-roll** (arriba de todo, late en dorado) que aparece cuando tenés una tirada tuya del duelo que se puede reabrir: dice cuál («volver a tirar PdG»). Reabrir borra esa tirada y te devuelve el botón para tirarla de nuevo (dados 3D, mismo empate); se recalcula lo que dependía de ella. **Qué se puede reabrir** (la más avanzada tuya primero): atacante → los d20 del crítico, Fuerza del golpe, PdG; defensor → Bloqueo, Evasión/Parry. Solo mientras no pasó a una etapa posterior con tiradas (Bloqueo, crítico o daño) y no se aplicó daño ni efectos. El daño no se puede reabrir (el mapa del GM lo aplica al instante). **Una moneda por tirada, dentro del duelo:** el documento del duelo guarda `rerollUsado: {pdg: true, …}` por cada tirada ya reabierta; una segunda moneda no puede volver a reabrir esa misma tirada (si el defensor reabre su Evasión/Parry y vuelve a fallar, esa tirada puntual ya no se puede reabrir de nuevo — la tirada nueva sí podría, con otra moneda). Código: `puedeReabrir`, `reabrir`, `rerollBtnHtml` en `comun/duelo.js`; hooks `rerollInfo`/`rerollUsar` de la ficha; regla `rerollUsado` sumada a `duelos` en `firestore.rules`.
- Creeps e invocaciones no usan monedas.
- El catálogo: la moneda explica esta regla en su detalle y lleva `rerollMoneda: true`.

## Pendiente / a decidir
- **Wildcards:** cuando el dueño defina sus reglas, mismo botón y mismas piezas (cambia solo de dónde sale el permiso).
- ¿Reabrir el daño con un margen de tiempo antes de que el GM lo aplique? Hoy no.
- Falta probarlo en mesa (el botón fijo del mapa abriendo el iframe, la ventana con varias tiradas, y «una moneda por tirada» en un duelo real).
