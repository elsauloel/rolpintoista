# Durabilidad de armas, escudos y armaduras

> Mecánica nueva del dueño, 2026-09-26, nacida del duelo paso a paso (Parry → Bloqueo). **Estado: diseño, sin implementar.** Las preguntas están al final y en `preguntas-abiertas.md` (P-Durabilidad).

## Lo decidido
- **Armas y escudos:** durabilidad = **2 por cada punto de Peso** (un escudo de peso 3 tiene 6 puntos). Sale del Peso del ítem, así que **no hace falta cargarla a mano en el catálogo**: se calcula.
- **Armaduras (y toda la defensa):** también llevan durabilidad, porque **se rompen**; es un elemento a contabilizar **en todo el catálogo**. La fórmula está por definir (pregunta 1).
- **Cuándo se gasta (regla del duelo):** si el defensor **gana el Parry pero pierde el Bloqueo**, **pasa la mitad del daño** y **se consume 1 punto de durabilidad del objeto con el que bloqueó** (el arma o el escudo).
- **Contexto del duelo (etapa 2):** el defensor elige la defensa **a ciegas**, antes de ver el PdG (✅ pregunta 1 del dueño). Ver [`ataque-paso-a-paso.md`](ataque-paso-a-paso.md).

## Qué implica (sin decidir todavía)
- **Cada ítem del inventario lleva su durabilidad actual** (además del máximo calculado): «4/6». Se ve en la ficha y en el cuadro del duelo cuando se gasta un punto.
- Ya existe el estado **Armadura rota** (acumulable, lo aplica el efecto **Rompe armadura**) y el pendiente «armadura rota atada al ítem» (`pendientes.md`): la durabilidad de la armadura es el lugar natural para unirlos.
- Ya existe el consumible **Óleo reparador**: es candidato natural para **reparar** puntos.
- Los ítems del catálogo (hoy 890) no cambian de datos si el máximo se calcula; sí cambia el inventario guardado (campo de durabilidad actual, con valor por defecto = máximo).

## Preguntas abiertas (propuesta entre paréntesis)
1. **¿Cuánta durabilidad tiene una armadura o pieza defensiva?** (igual: 2 por punto de Peso; para las piezas sin peso —anillos, amuletos—, sin durabilidad.)
2. **¿Qué pasa al llegar a 0?** (el ítem queda **roto**: un arma rota no da sus bonos y pega con penalización; un escudo roto no bloquea; una armadura rota no da Defensa. No se destruye: se repara.)
3. **¿Cómo se repara?** (Óleo reparador y un herrero con precio en oro; a definir cuántos puntos por uso.)
4. **¿Las armaduras gastan durabilidad solo con Rompe armadura o también cuando un golpe las atraviesa?** (con Rompe armadura, y un punto cuando un golpe crítico pega; a decidir.)
5. **La mitad del daño, ¿redondea para arriba o para abajo?** (para arriba: el defensor nunca queda con 0 si le pegaron.)
6. **¿Los creeps también llevan durabilidad?** (no: es una simplificación del GM; solo personajes e invocaciones.)
7. **¿Un arma que bloquea (Parry con arma) también se desgasta?** (sí, con la misma regla: 1 punto cuando pierde el Bloqueo.)
8. **¿Se avisa antes de que se rompa?** (sí: aviso al quedar en 1 punto, según «avisar y dejar seguir».)
