# Trampas como consumibles — 2026-09-25

> Pedido del dueño: convertir las trampas prediseñadas en **ítems consumibles**, con variantes menos y más poderosas de área flor de radio 1, 2 y 3, con las distintas mecánicas; y que **las trampas iguales se apilen sin límite** en la mochila (una sola ranura para muchas).
> Datos: `datos/trampas-consumibles.json` (generado por `python herramientas/generar_trampas_consumibles.py` desde `comun/trampas-base.js`), publicado en el catálogo (72 ítems).

## Qué hay
- **24 mecánicas × 3 potencias = 72 ítems**: *menor* (radio 1), *común* (radio 2) y *mayor* (radio 3). Las tres trampas en línea (dardos, cuchillas, cable) van en largo 3 / 5 / 7.
- **Nombres:** «Trampa de oso menor», «Trampa de oso», «Trampa de oso mayor»…
- **Daño:** el de la trampa base en la potencia común; **±1 dado** en menor y mayor. **Dificultades y duraciones:** ±2 (va escrito en el texto; a mano).
- **Precio:** (10 + 12 × nivel) × [0,7 · 1 · 1,5], redondeado a 5 → desde $15 (Red de caza menor) hasta ~$105 (Cuchillas de guadaña mayor). Tier según precio: hasta $40 Común, hasta $100 Buena Calidad, más Raro.
- **Apilado sin límite:** campo `pilaInfinita` en el ítem; `stackMaxDe(item)` en `ficha.html` (las demás pilas de consumibles siguen con tope 5). Vale al comprar, al tomar botín y con los botones + / − de la mochila.
- El ítem lleva `trampaDatos` (lo que el mapa carga: forma, radio, daño, estado…), listo para automatizar.

## Automatización (regla ⚙ / ✋)
- ✋ **Hoy se coloca a mano**: con 📚 Catálogo de trampas del mapa (la misma trampa, en el radio elegido). Ver pendiente "Trampas para jugadores".
- Pendiente: **que usar la trampa desde la mochila la coloque sola en el mapa** (pide la casilla, descuenta 1 unidad, arma la trampa con `trampaDatos`, del bando del jugador; los aliados nunca la disparan). Teleport y Portal cósmico quedan afuera por ahora (necesitan destino).
