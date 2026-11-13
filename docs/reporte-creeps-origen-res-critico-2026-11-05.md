# Creeps esenciales y de campaña con el rebalanceo del crítico (2026-11-05)

> **✅ Aplicado en la partida (2026-11-05, dueño: «sí, aplicá los cambios en El origen»)**: los 10 cambios, verificados releyendo. Respaldo previo en el scratchpad de la sesión. Las dos dudas quedan como están (dueño, 2026-11-05: «la pechera acolchada queda como está y el tiro certero queda como está»).

Pedido del dueño: «Sobre los creeps de referencia no vamos a gastar tiempo ni créditos… Vamos a trabajar sobre los creeps esenciales y los creeps de
campaña. En esos aplicá los cambios que hagan falta de acuerdo a todos los cálculos y rediseños que hicimos hasta hoy.» Los de referencia
(`comun/creeps-base.js`) no se tocan: se van a borrar.

## A. Creeps esenciales (29): ya están al día, no hubo que cambiar nada
Se arman **en vivo** al cargar la página: el equipo sale del catálogo por nombre y las habilidades de la biblioteca de habilidades de creep (las
auditadas), así que todo el rebalanceo (equipo, armas, potente, frecuente, Tiro certero…) ya les llega solo. No tienen números propios de crítico
(su resistencia innata es 0 en todos los Tipos) ni piezas que no sean del catálogo. Verificado cargándolos: no falta ninguna pieza ni habilidad.
Ojo: un creep esencial que ya se haya **puesto en una partida** guarda su copia, y esa no se actualiza sola (es el caso B).

## B. Creeps de «El origen de las especies»: lista de cambios, **todavía sin aplicar**
Solo lectura: no se escribió nada en la partida. **38 creeps** revisados; **10 cambian** (10 cambios). Respaldo completo de los 38 (públicos y
privados) tomado antes, fuera del repo. El script que los aplica está listo y probado en simulado; espera la confirmación del dueño.

**Equipo** (copias del catálogo con los valores de antes del rebalanceo; se conservan el desgaste y la durabilidad de cada copia):
- **Botas de minero** — Goblin tunelero, Goblin tunelero (copia), Goblin picapiedras, Goblin ballestero: + Res. crítico Tipo 6 +1.
- **Yelmo de cubo** — Capataz del culto: Defensa +2 → +3 y + Res. tóxico +1 (como quedó el casco).
- **Poncho de espejitos** — Goblin rompehuesos: Res.CC +1 → Res. rayo +1 (el reparto mitad y mitad).

**Habilidades** (copias de la biblioteca):
- **Ojo de asesino** — Rata de la grieta, Rata de la grieta. 2, Goblin scout: Crítico potente +1 → **+3** (y el texto).
- **Golpe doble** (la de El origen) — Ladron del monte: «ignora 1 de Resistencia a crítico» → **Crítico frecuente +1**.

**Sin piezas propias ni resistencia innata**: ningún creep de El origen tiene armaduras o armas naturales con resistencia a crítico, ni resistencia
a crítico propia (todo sale del equipo y las habilidades).

## Preguntas
1. **Pechera acolchada del Goblin del bosque 1**: su copia es de una versión mucho más vieja del catálogo (Defensa +2 · Res. crítico Tipo 4 +1). La
   de hoy es otra cosa (Defensa especial +2 · Res.CC +2 · Res. crítico Tipo 6 +1). ¿La pasamos a la de hoy o la dejamos como está? (No va en el script.)
2. **Tiro certero del Goblin arquero del claro**: es una versión vieja propia de El origen (+2 PdG y Crítico frecuente +1, sin Ignora); la de la
   biblioteca de hoy es otra habilidad (+1 PdG, Perfora 3, frecuente +2). No es un cambio del rebalanceo: se dejó como está. ¿Te parece?
3. ¿Aplico los 10 cambios en la partida?
