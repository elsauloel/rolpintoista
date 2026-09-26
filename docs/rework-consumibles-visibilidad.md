# Consumibles de visibilidad (niebla y lo oculto) — borrador 2026-09-25

> Pedido del dueño: "un universo de consumibles que jueguen con la visibilidad: que revelen la niebla durante un flash (baratos según la superficie), otros que mantengan iluminada la niebla con distintos radios durante X turnos, algunos que revelen elementos ocultos y otros que no (esos, más caros)… y un anillo de percepción aumentada, con el mismo efecto que la pasiva del Job."
> Datos: `datos/consumibles-nuevos.json` (15 consumibles) y el anillo en `datos/defensa-nuevos.json`. Se auditan en `datos/auditoria-defensa.html` (filtro *Consumibles*).

## Regla de precios (propuesta)
- **Superficie:** un radio *r* cubre 3·r·(r+1)+1 casilleros (r2 = 19 · r3 = 37 · r4 = 61 · r5 = 91 · r6 = 127 · r8 = 217).
- **Destello** (destapa una vez): ~**$0,7 por casillero** → r2 $15 · r3 $30 · r5 $65 · r8 $140.
- **Luz sostenida** (mantiene iluminado *X* turnos): ~$0,16–0,25 por casillero por turno → vela r2/5 t $15 · antorcha r3/3 t $20 · farol r3/5 t $30 · lámpara de minero r4/6 t $70 · esfera de luz fría r6/5 t $160.
- **Revelar lo oculto multiplica el precio ×3 (aprox.)**: polvo de revelación r2 $45 · luz de la verdad r4 $140 · lámpara del inquisidor r3/4 t $75 · faro de la revelación r6/4 t $350. Personales: gotas de ojo de gato (ve lo oculto r2, 3 t) $60 · colirio del vidente (Percepción aumentada 5 t) $120.
- **Anillo de percepción aumentada:** Raro, **$2000** (misma escala que los otros anillos del catálogo). Al equiparlo da el estado *Percepción aumentada*; la ficha lo cuenta como la pasiva del Job (dado de percepción más alto y aviso de trampas ocultas cercanas) — `tienePercepcionAumentada()` en `ficha.html`.

## Automatización (regla ⚙ / ✋)
- ⚙ Las luces sostenidas y los personales aplican un **estado con turnos** a quien los usa (`efectoNombre` / `efectoTurnos`).
- ✋ **Destapar la niebla y revelar lo oculto sigue siendo a mano** (herramienta 🌫 Niebla y 👁 Revelar lo oculto del GM): **todavía no hay un consumible que actúe sobre el mapa solo**. Pendiente: que usar el consumible desde la ficha publique un evento que el mapa convierta en "destapar radio r alrededor del token" (y, para las luces sostenidas, en una visión con radio que dure X turnos).

## Automatización hecha (2026-09-26)
Dos stats nuevos de la ficha (`luz` = «Luz portada» y `veoculto` = «Ve lo oculto», radios; la ficha los publica en `resumen`) y el mapa los lee:
- **`luz` (radio):** el token **ilumina un disco completo** alrededor (sin punto ciego, tapado por los Sólidos) además de su campo de visión; lo iluminado se ve en vivo (creeps incluidos) y **queda destapado en la niebla**. Lo dan los estados de los consumibles: **destellos** = estado de **1 turno** con `luz` = radio (Pólvora de destello r2, Bengala de mano r3, Bengala de señales r5, Cohete de luz r8); **luces sostenidas** = estado de **X turnos** (Vela r2/5 t, Antorcha r3/3 t, Farol r3/5 t, Lámpara de minero r4/6 t, Esfera de luz fría r6/5 t). Los turnos los descuenta el Mantenimiento como cualquier estado.
- **`veoculto` (radio):** dentro de su campo de visión (con la luz que lleve) y hasta ese radio, el personaje **ve a los creeps en sigilo y las trampas escondidas**; lo ven **todos los jugadores** (una trampa descubierta queda como «vista», igual que con la percepción). Lo dan: Polvo de revelación (r2, destello), Luz de la verdad (r4, destello), Lámpara del inquisidor (r3, 4 t), Faro de la revelación (r6, 4 t), Gotas de ojo de gato (r2, 3 t) y el **Yelmo del Ojo Que Todo Lo Ve** equipado (`veoculto` 30 = todo su campo de visión). Lo que el GM oculta a propósito (token `oculto`) **no** se revela.
- **Colirio del vidente:** aplica el estado «Percepción aumentada» (5 turnos); `tienePercepcionAumentada()` ahora también lo cuenta.
- Las descripciones de los ítems ya dicen ⚙ Automático. Ya no queda nada «a mano» de este bloque.
**Corrección de un bug:** el importador del catálogo (`STATS_OK` en `catalogo_comun.py`) **descartaba en silencio el stat `vision`**: las 11 piezas de visión (gafas, yelmos, anillos…) se habían publicado sin su Visión. Corregido (`vision`, `luz` y `veoculto` ya se aceptan) y verificado que todas las piezas nuevas conservan sus bonos.
