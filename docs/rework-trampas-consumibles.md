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

## Trampas sin disparar: se desarman solas y vuelven a su dueño (2026-09-26, pedido del dueño)
Dueño: *«si un jugador aplica una trampa y no se activa, al final del combate, al repartir experiencia y despojar lo que no se agarró, esas trampas se desarman automáticamente y vuelven a la mochila; si no hay lugar en la mochila, al cinturón»*.
- **Marca:** al consumir una trampa, el elemento del mapa guarda el ítem del que salió (`trampaItem`) y de qué ficha (`trampaFicha`) — campos nuevos en `elementoValido` de `firestore.rules` (**hay que volver a pegar las reglas**).
- **Cuándo:** al apretar **🏁 Despojar / Cerrar botín** en gm-tools (`despojarBotin`), después de repartir XP y despojos: `TokensAuto.desarmarTrampasConsumibles()` recorre las trampas del mapa que mira el GM y, por cada una **de consumible, armada y sin disparar**, **borra el elemento** y deja un aviso en `recompensas` (`estado: 'trampas'`, ítem en `devolver`). Las trampas ya **disparadas** (y las de creep) no se tocan. Queda una línea verde en la Mesa («🪤 Trampas desarmadas»).
- **Adónde vuelven** (`devolverTrampasAlJugador`, en la ficha del dueño, apenas está abierta): (1) **a la mochila**, apilándose con las iguales (no ocupa ranura nueva) o en una ranura libre; (2) **si la mochila no tiene lugar, al cinturón** (apilándose o en un lugar libre); (3) si tampoco hay lugar allá, **se deja igual en la mochila** (que quede de más) antes que perderla. La ficha avisa: «🪤 N trampas sin disparar se desarmaron y volvieron a tu mochila / a tu cinturón».
- **Límite:** desarma las trampas del **mapa que el GM está mirando** al cerrar el botín (no recorre los demás mapas guardados).
- Probado con una base simulada (2 armadas sin disparar → borradas y devueltas juntas en un aviso; una disparada y una de creep intactas; los cuatro casos de destino). **Falta probarlo en mesa** con las reglas nuevas.
