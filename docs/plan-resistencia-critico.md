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

## Criterios decididos (paso 3, en curso)
Respuestas del dueño a la medición (2026-11-04):
1. **Crítico sin resistencia:** «que sin resistencia, el crítico con armas Tipo 4 sea así de frecuente, está bien» (≈ 46 % a nivel 3 contra Evasión media).
2. *(Pendiente: cuánto debe quitar cada punto de resistencia — se le volvió a explicar.)*
3. **Los máximos del catálogo no son un parámetro:** «el catálogo es enorme y los personajes no tienen el dinero para comprarse todos esos ítems,
   ni les aparecen en simultáneo». Para acotar el estaqueo: **ciertos slots del inventario para ciertos Tipos de resistencia** (P114).
4. **Armas grandes casi sin crítico:** «es parte del balance propio del juego».
5. **El crítico ignora la armadura:** «esa es la gracia». No se toca.
6. **Grupo y creeps juntos**, porque el catálogo es el mismo para los dos. **Orden: primero el catálogo**; después armas, resistencias y
   habilidades — «todo lo vamos a tener que rebalancear y evaluar su peso real».
7. **Más lugares para los Tipos altos** (dueño, 2026-11-04, «lo estoy parafraseando, después lo definimos bien»): ampliar un poco la P114 para que
   la resistencia contra Tipos altos no sea tan rara (con la regla nueva ya no es OP). Que Tipo 8 y Tipo 10 aparezcan también en algunos ítems
   Comunes. Borrador de cantidades de slots: **Tipo 10 en 3 lugares**, **Tipo 8 en 5**, **Tipo 6 en 7**, **Tipo 4 en (casi) todos**; Tipo 12 por
   definir. Slots que hoy pueden dar resistencia: cabeza, torso (blanda / rígida), manos, piernas, pies, escudo, anillos, cinturón, talismán.
8. **Slots por Tipo (decidido, dueño 2026-11-04):** **Tipo 4 en 8 slots · Tipo 6 en 6 · Tipo 8 en 4 · Tipo 10 en 2** (Tipo 12 sin definir). Un
   **+2 de resistencia en un solo ítem es muy, muy infrecuente** y solo desde **Buena calidad**: para acumular resistencia hay que ocupar muchos
   slots. Pocos ítems con más de +1; la aparición, más frecuente en los Tipos bajos y mucho más rara en los altos.
9. **Precio:** «mantener el precio y ajustar los efectos para que el precio siga pagando un volumen de efectos similar». Res ×1 debería pesar
   **un poco menos que Defensa +1** (de acuerdo con Claude); «+1 a todos los Tipos» también. Falta calcular cuánto pesaba antes y cuánto ahora,
   proporcionalmente, por Tipo (en curso).
10. **El mapa de lugares por Tipo (cerrado, dueño 2026-11-04).** Cinturones y talismanes **no** dan resistencia a crítico (cinturón: gestión de
    ítems, a lo sumo Defensa o resistencia elemental; talismán: otros efectos). Los anillos tampoco. Quedan 7 lugares:
    | Tipo | Lugares |
    |---|---|
    | Tipo 4 | cabeza, torso blando, torso rígido, manos, piernas, pies, escudo (todos) |
    | Tipo 6 | torso blando, torso rígido, manos, piernas, pies, escudo |
    | Tipo 8 | torso rígido, manos, piernas, escudo |
    | Tipo 10 | cabeza, escudo |
    | Tipo 12 | **no existe** por ahora (a lo sumo, algún legendario excepcional; no se contempla al diseñar) |
    Cada pieza da +1 contra un Tipo; el +2 en una pieza, muy raro y desde Buena; las de Tipos altos, más raras que las de Tipos bajos.
    **Cambio (dueño, 2026-11-04, al revisar el torso rígido):** desde **Común**, una misma pieza puede dar +1 contra **hasta dos Tipos distintos**
    a la vez (cada Tipo en su lugar permitido). El +2 contra un mismo Tipo sigue siendo muy raro y desde Buena.
11. **Pesos para el catálogo** (docs/peso-resistencia-critico.md, a confirmar con el dueño al revisar las piezas): Defensa +1 = 1; Res. T4 ×1 = 1;
    T6 = ½; T8 = ¼; T10 = ¼; +1 a todos los Tipos = 2. Los precios se mantienen y se ajustan los efectos.
12. **Bloqueo +1 = ¾** (dueño, 2026-11-04; Parry +1 y Def. especial +1 = 1). **Escudos: aprobados y cargados en el catálogo (24 escudos).**
    Cascos → [propuesta-res-critico-cascos.md](propuesta-res-critico-cascos.md): **aprobados y cargados** (6 cascos; el Bacinete de recluta queda con ×2 como
    excepción; «morrión» renombrado). Torso blando → [propuesta-res-critico-torso-blando.md](propuesta-res-critico-torso-blando.md), **aprobado y cargado** (2026-11-04: Res. T6 +1 en 4 piezas acolchadas; el Gambesón de doble capa pasa a Def. especial +5 · Res. T6 ×2, opción B). Torso rígido → [propuesta-res-critico-torso-rigido.md](propuesta-res-critico-torso-rigido.md), **aprobado y cargado** (versión 2: 4 piezas; se permiten dos Tipos por pieza). Manos → [propuesta-res-critico-manos.md](propuesta-res-critico-manos.md), **aprobado y cargado** (3 guantes; Tipo 8 en uno Común y uno Bueno). Piernas → [propuesta-res-critico-piernas.md](propuesta-res-critico-piernas.md), **aprobado y cargado** (4 piezas; Tipo 8 en una Común y una Buena). **Criterio nuevo (dueño, 2026-11-04): al compensar una pieza, preferir resistencias elementales antes que Res.CC, para que la Res.CC no se acumule** (ya se cambiaron 4 Res.CC agregadas antes: Yelmo de cubo, Yelmo cerrado de torneo, Brigantina remachada, Manoplas de cota). Pies → [propuesta-res-critico-pies.md](propuesta-res-critico-pies.md), a revisar.
13. **Paso 4, primera familia: escudos** → propuesta en [propuesta-res-critico-escudos.md](propuesta-res-critico-escudos.md) (2026-11-04), a revisar con el dueño.

## Al terminar todo el catálogo: actualizar El origen
Dueño, 2026-11-04: «cuando terminemos de actualizar todo el catálogo, sí, te voy a pedir que actualices el origen en lo que venga al caso». Las copias
de ítems que ya tienen los personajes y los creeps de «El origen de las especies» no cambian solas (ej.: el Guardaespaldas con el Escudo de hierro
macizo viejo, Res. T4). **No tocar El origen antes de que lo pida**; cuando lo pida, pasar sus copias a los valores nuevos del catálogo.

## ▶ Dónde quedó (2026-11-04)
Escudos, cascos, torso blando, torso rígido, manos y piernas aprobados y cargados. Siguen **pies**, después armas, habilidades,
estados, pasivas y creeps. Ojo: el texto de la pasiva Temple todavía explica la regla vieja.
