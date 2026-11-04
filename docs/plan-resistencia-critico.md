# Plan: rebalancear la Resistencia a crítico (prioridad, desde 2026-11-04)

> Dueño, 2026-11-04: «ayer jugando con mis compas me di cuenta de que estaba entendiendo mal la resistencia a los golpes críticos por tipo…
> si te atacan con un arma Tipo 4 y tenés resistencia a crítico Tipo 4 ×1, te tienen que hacer 5, no 8… eso es una bola de nieve de diseño. Gran
> parte de lo que diseña el catálogo está mal pensado.» — «Ahora balancear este tema va a ser la prioridad. Hagamos un plan metódico, paso a paso,
> porque es algo muy clave del juego como para ignorar.»

## La regla (ya programada, commit 970ca52e, 2026-11-04)
- **Rango del crítico = Tipo del arma − Crítico frecuente + Resistencia a crítico de ese Tipo, mínimo 2, en cada nivel.**
  Ej.: Tipo 4 sin resistencia → niveles en 4, 8, 12; con Res ×1 → 5, 10, 15; con ×2 → 6, 12, 18.
- **Antes** cada punto de Resistencia restaba **un nivel entero** (con Tipo 4 ×1 hacía falta 8 para el primer crítico). Todo el catálogo, las
  skills, los estados y los creeps se diseñaron con esa regla vieja: cada punto valía mucho más que ahora.
- Lo demás del crítico no cambia (comun/critico.js): N d20, vale el mejor; 7+ ×2, 17+ ×3, 20 ×4; Crítico potente baja esos umbrales; el crítico
  ignora la Defensa; dos o más 20 naturales = supercrítico.

## Los pasos (de a uno; cada uno se cierra con el dueño antes de pasar al siguiente)
1. **Inventario (sin cambiar nada).** Todo lo que toca el crítico: Resistencia a crítico por Tipo (mods `tipo1`…`tipo5` y equivalentes), «Ignora N
   de Res. a crítico», Crítico frecuente, Crítico potente, Punto débil y otros estados que suben o bajan la resistencia, pasivas, habilidades de
   clase y de creep, ítems del catálogo (por slot, calidad y precio), creeps (esenciales, de campaña) y los personajes del grupo. Para cada cosa:
   cuánto valía con la regla vieja y cuánto vale ahora.
2. **Medición.** Probabilidad de crítico (y de cada nivel) por Tipo de arma según la diferencia PdG − Evasión típica, con 0, 1, 2, 3… de
   resistencia y de frecuente; cuánta resistencia junta hoy un personaje armado con lo Común / Bueno; y peleas simuladas (regla vieja vs nueva)
   para ver cuántos críticos salen y cuánto pesan en el daño.
3. **Criterios, con el dueño.** Cuánta resistencia es «poca / normal / mucha» por nivel y calidad; cuánto vale un punto de resistencia frente a
   uno de Crítico frecuente o de «Ignora»; cuánto cuesta en oro; qué slots dan resistencia y de qué Tipos; qué identidad tiene cada familia de
   arma con el crítico (P112, P114, guía de diseño).
4. **Propuesta de ajustes por familia** (armaduras, escudos, cascos, botas…, anillos, armas con Crítico frecuente/potente/Ignora, habilidades,
   estados y pasivas), con números y precios, para aprobar de a una familia.
5. **Aplicar por tandas**, con pruebas automáticas y en el mapa, y los textos (detalle, manual, glosario).
6. **Revisar los creeps** (esenciales y de campaña) y **los personajes del grupo** con lo nuevo.
7. **Documentar** en docs/guia-de-diseno.md y el manual el criterio final.

## Estado
- [x] Paso 0: la regla nueva, programada (2026-11-04, 970ca52e).
- [x] Paso 1: inventario (2026-11-04) → [`inventario-resistencia-critico.md`](inventario-resistencia-critico.md).
- [x] Paso 2: medición (2026-11-04) → [`medicion-resistencia-critico.md`](medicion-resistencia-critico.md).
