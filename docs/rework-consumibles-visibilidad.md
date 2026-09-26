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
