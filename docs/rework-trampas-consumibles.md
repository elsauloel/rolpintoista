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
- ⚙ **Automático (2026-09-25, pedido del dueño):** al **consumir** la trampa desde la mochila o el cinturón, la ficha llama a `TokensAuto.colocarTrampas` (`colocarTrampaDeItem`, `ficha.html`): aparece **junto a tu token** (la casilla libre al frente) el elemento-trampa con sus cifras (forma y radio/largo, daño, estado, fuego amigo, color) y **la arrastrás en el mapa a donde quieras** (owner o GM pueden moverla; solo la ven vos y el GM; la disparan los rivales, los aliados nunca). **Si no hay token en el mapa en juego o no hay lugar libre, no se gasta la unidad ni los Nitros.** Las líneas (dardos, cuchillas, cable) se extienden hacia afuera del token (`forma: 'linea'`, `largo`).
- ✋ A mano quedan los estados, las tiradas para evitarla y lo demás que dice el texto de cada trampa (como en las trampas de creep). Teleport y Portal cósmico quedan afuera por ahora (necesitan destino).
