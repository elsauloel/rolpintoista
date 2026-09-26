# Durabilidad de armas, escudos y armaduras

> Mecánica nueva del dueño, 2026-09-26, nacida del duelo paso a paso (Parry → Bloqueo). **Estado: reglas definidas casi todas, sin implementar.** Lo que falta decidir está al final y en `preguntas-abiertas.md` (P-Durabilidad).

## Reglas decididas (dueño, 2026-09-26)
1. **Cuánta durabilidad:** **3 puntos por cada punto de Peso** (armas, escudos y armaduras). Un escudo de peso 3 tiene 9. Sale del Peso del ítem, así que **se calcula: no hace falta cargarla a mano en el catálogo** (el inventario sí guarda la durabilidad actual de cada ítem, por defecto = el máximo). **Las armaduras de Peso 0 tienen un mínimo de 3.**
2. **Cuándo se gasta 1 punto de un arma o escudo:** cuando el defensor **gana el Parry pero pierde el Bloqueo** (el golpe pasa a **mitad de daño**, redondeada **para arriba**) — el punto lo pierde el objeto con el que bloqueó (arma o escudo).
3. **Cuándo se gasta 1 punto de una armadura:** **solo con el efecto Rompe armadura.** Un golpe crítico **no** rompe armadura, ni siquiera de un arma con Rompe armadura: el crítico justamente evita la armadura. (No se rompe por recibir daño común ni por críticos.)
4. **Si el personaje lleva más de una pieza defensiva equipada** y le impacta Rompe armadura, **el sistema elige la pieza al azar**.
5. **Aviso:** al quedar en **1 punto**, se avisa que la armadura, el arma o el escudo está a punto de romperse.
6. **Reparar:** **no se puede reparar durante el combate.** Formas de reparar: **Óleo reparador**, **un herrero** (con precio) y **habilidades por talento que reparan usando despojos** (loot). Como es solo fuera de combate, **el Óleo reparador deja de ser un consumible de cinturón** (hoy es un consumible común "Repara armadura", Común $25).
7. **Creeps:** **no llevan durabilidad.** Pero Rompe armadura **sí les baja la Defensa** (con el estado Armadura rota que ya existe).

## Cómo encaja con lo que ya hay
- El estado **Armadura rota** (acumulable) que aplica Rompe armadura ya baja la Defensa: se mantiene para creeps y hay que definir cómo convive con la durabilidad de la pieza en los personajes (pregunta 2).
- Pendiente viejo «armadura rota atada al ítem» (`pendientes.md`): la durabilidad de la pieza es la forma de resolverlo.
- Los ítems del catálogo (890) no cambian de datos; sí cambia el inventario guardado y la ficha (mostrar «6/9», avisos, botón de reparar fuera de combate).

## Preguntas abiertas (propuesta entre paréntesis)
1. **¿Qué pasa al llegar a 0?** (el ítem queda **roto**: un arma rota no da sus bonos y pega con penalización; un escudo roto no bloquea; una armadura rota no da Defensa. No se destruye: se repara.)
2. **¿Cómo se relaciona la durabilidad de la pieza con la Defensa y con el estado Armadura rota?** (cada punto de durabilidad que pierde una armadura por Rompe armadura baja **1 su Defensa**, hasta llegar a 0 de durabilidad = pieza rota; el estado Armadura rota queda solo para creeps.)
3. **¿Cuántos puntos repara cada forma?** (Óleo: 3 puntos de una pieza, solo fuera de combate; herrero: repara todo, con precio por punto; talento con despojos: 1 punto por despojo gastado.)
4. **¿Un arma o escudo de Peso 0 tiene el mínimo de 3, como las armaduras?** (sí, mínimo 3 para todo.)
5. **¿Qué es exactamente el Óleo reparador ahora?** (un ítem de uso fuera de combate, no de cinturón; a definir si va a la mochila o es un "kit de reparación" con usos.)
6. **¿La pieza que elige el sistema al azar tiene peso según su Defensa** (más probable la armadura pesada) **o es pareja?** (pareja entre las piezas equipadas que dan Defensa.)
7. **¿Las armas y escudos también avisan y se rompen con Parry** (no solo con Bloqueo perdido)? (no: solo cuando se pierde el Bloqueo, como está decidido.)
