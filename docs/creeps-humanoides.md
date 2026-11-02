# Creeps humanoides nuevos, rol por rol y nivel por nivel

> Hoja de trabajo (dueño, 2026-10-26: «un set de creeps nuevos basados enteramente en las nuevas habilidades y con un nuevo criterio. Los viejos los
> vamos a dejar para reworkearlos manteniendo los conceptos»). Se retoma desde acá en cualquier conversación. Las habilidades salen del catálogo
> auditado ([`diseno-roles-creep.md`](diseno-roles-creep.md), los «20 por rol»); los creeps base viejos (`comun/creeps-base.js`) y sus skills
> **no son referencia**.

## ▶ Actualización 2026-11-02 (dueño) — se retoma con este plan, unificado

> Dueño, 2026-11-02: «crear un pool de creeps genéricos… de cada rol una variedad, nivel 1 a 5, con un equipo acorde… todos humanoides, para
> poder crear creeps rápidamente y cambiarles el nombre de acuerdo a su circunstancia». Al ver este plan de octubre: «vamos a seguir tu
> recomendación. Dejémosla asentada». (Reemplaza a `plan-creeps-esenciales.md`, armado ese mismo día sin ver este.)

- **Dos pools** (nombres del dueño, 2026-11-02): el **pool esencial** (estas líneas humanoides, las más genéricas: la base para armar una pelea
  rápido) y el **pool de campaña** (los que van saliendo al jugar —goblins, mineros, el culto…—, de referencia; se va agrandando con el juego).
  Al crear un creep o elegirlo de la biblioteca, se elige de uno de los dos.
- **Cuántas por rol: 4 es una referencia, no una regla** («en tanto podamos pensar en estrategias puntuales que valgan la pena, ampliar o reducir
  el número de variantes por rol; no me caso con ese número»). Cada línea = **una estrategia distinta dentro del rol**.
- **Orden**: **rol por rol**; al cerrar la ronda se ve cómo seguir según las estrategias posibles con las skills de cada rol. **Primero las
  esencias puras del rol**; después, hibridar y cruzar funciones donde tenga sentido de diseño.
- **Orden de la ronda** (dueño, 2026-11-02, «por disfrute a la hora de diseñar»: alternar físico y mágico): 1 Tanque (hecho: Escudero) ·
  2 Mago · 3 Choque liviano · 4 Support · 5 Warrior · 6 Debuffer · y los que restan, alternando (de Claude): 7 Rango · 8 Mago · 9 Híbrido ·
  10 Support · 11 Choque liviano · 12 Debuffer. Cada uno **a fondo** (todo el texto: atributos, equipo, skills, consumible) antes de pasar al
  siguiente; no en horizontal («en la dispersión se terminan escapando detalles de diseño»).
- **Rápidas, lentas y muy lentas** (dueño, 2026-11-02): **rápidas** = cooldown 2 · **lentas** = cooldown 3 o 4 · **muy lentas** = cooldown 3 o 4
  que **arrancan la pelea en cooldown**. El costo y el cooldown van juntos: lo caro es lento o muy lento.
- **Pasivas en los niveles pares**: la primera en el **nivel 2** y una más en el **nivel 4** (dueño, 2026-11-02: «pueden aparecer a partir de nivel 2 y vuelven a aparecer una habilidad pasiva más en cada nivel par»; antes había dicho desde el 3). Refuerzan su estrategia.
- **Consumible fijo, vinculado al rol** (además de «que le sirva y lo use»). Propuesta por rol, a confirmar con cada línea: Tanque → poción de
  defensa (Cuero duro) · Warrior → fuerza o furia · Choque liviano → óleo venenoso · Rango → flecha o virote especial · Hunter → una trampa ·
  Mago → poción de SP · Support → poción de curación · Debuffer → un polvo o una bombucha.
- **Rango = Shooter** (Shooter es el nombre de la clase de jugador); el Hunter es una de sus líneas.
- Lo demás de este documento sigue: habilidades (2 en nivel 1, +1 por nivel), equipo por nivel (tope Buena calidad), atributos, forma de trabajo.

### Aprobados

> ✅ **Programados el 2026-11-03** en `comun/creeps-esenciales.js` (el pool esencial: «+ Creep» de GM Tools → pestaña «⭐ Pool esencial»): T1, M1, L1, S1, W1 (con los atributos revisados), D1. Equipo del catálogo por nombre, habilidades de fábrica con su costo y cooldown, consumibles en el cinturón.

- **T1 · Escudero · Tanque · nivel 1** (aprobado 2026-11-02; **atributos y arma rehechos el 2026-11-03**, dueño: «dejarlo así»). Referencia: un grupo
  de nivel 1, no los personajes actuales. Estrategia: se planta adelante, provoca y aguanta; con el hacha le rompe la armadura al que lo ignora.
  - **Criterio del dueño para tanques (2026-11-03)**: «en el primer nivel suele tener un problema de que puede hacer pocas cosas»: en nivel 1, **al
    menos Agi 5** (los No2 de un creep salen de su Agilidad: un ataque con un arma de Tipo 8–10 y algo de movimiento; con un hacha de Tipo 8, 4 No2
    de un ataque y 1 de movimiento). Orden de atributos: **Con > Des > Agi > Fue** (el Esp, lo que sobra). Al subir de nivel: bastante Con y Fue,
    un poquito de Agi y de Des.
  - Atributos (33): **Con 12 · Des 7 · Agi 5 · Fue 5 · Esp 4**. Vida 60. Antes (2026-11-02): Con 11 · Fue 8 · Esp 6 · Des 5 · Agi 3; el mismo día
    pasó un rato por Agi 5 · Des 4 · Esp 5.
  - **Boceto de atributos, nivel 1 a 5** (+3 por nivel; Con / Des / Agi / Fue / Esp → vida): nv1 12/7/5/5/4 → 60 · nv2 13/7/6/6/4 → 65 · nv3
    14/8/6/7/4 → 70 · nv4 15/8/7/8/4 → 75 · nv5 16/9/7/9/4 → 80. En nivel 5, 7 No2: un ataque (4) y 3 para moverse o defenderse.
  - **Boceto completo, nivel 1 a 5** (aprobado como boceto, dueño 2026-11-03: «me cierra ese camino, como boceto está bien»; se ajusta al definir
    cada nivel). Identidad: el **escudo** y **cubrir el frente**; Desarmar y Pisotón quedan para el T4 (Peleador de control).
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Provocar · Piel de hierro | — | Hacha de piedra, Escudo de tortuga, Peto de hierro, Cofia (2 Comunes) |
    | 2 | **Golpe de escudo** (ambigua, falta diseñarla) | **Guardia firme** (+1 Bloqueo) | + 2 Comunes (piernas, manos) |
    | 3 | **Plantarse** (sin moverse en su turno: +3 Def, +2 Res.CC y una oportunidad de más) | — | el escudo pasa a Buena calidad |
    | 4 | **Interponerse** (recibe los golpes por un aliado) | **Cortar el paso** (su oportunidad, si pega, frena al que se movía) | + el peto de Buena |
    | 5 | **Muro de escudos** (los aliados detrás de su escudo: −3 al PdG de rango contra ellos) | — | + el hacha de Buena |
    Consumibles: Cuero Duro y Piel de Cristal; desde nivel 3, quizás las versiones más fuertes. El equipo puntual se elige del catálogo al definir
    cada nivel.
  - Equipo (Común): **Hacha de piedra** (Tipo 8, +1 de daño, Bloqueo +1, Rompe armadura 33 %; 1d8 + 6) · Escudo de caparazón de tortuga gigante
    (Def +1, Def. esp. +1, Bloqueo +1) · Peto de hierro (Def +3) · Cofia de anillas sueltas (Def +1, Def. esp. +1, Res. crít. T4 +1). Total Def +5,
    Def. esp. +2 (dueño: «principalmente defensa física, pero algún tipo de defensa especial como plan secundario»). Antes llevaba el Garrote de
    pastor (Tipo 10: el ataque costaba 5 y no le alcanzaba). Puede hacer Parry con el hacha o con el escudo (2026-11-03, para todos).
  - **Provocar tira Ef.Esp + 2** (dueño, 2026-11-03: «para que pegue, lo que tiene que tirar es efecto especial más 2 como parte de la habilidad»;
    antes PdG.Esp + su nivel). Con Esp 4: 6 contra la Res.Mt del rival.
  - Skills: Provocar (rápida, 1 No2 + 2 SP, cd 2) · Piel de hierro (lenta, 1 No2 + 4 SP, cd 3).
  - Consumibles: Poción de Cuero duro (escudo 15 contra daño físico) y Poción de Piel de Cristal (escudo 15 contra daño especial) (dueño: «así,
    circunstancialmente, puede defenderse de alguien que le haga daño mágico y ser una verdadera molestia»).
  - El T4 Peleador de control se queda con Desarmar y Pisotón.
- **W1 · Hachero · Warrior · nivel 1** (aprobado 2026-11-02, con la Cofia de anillas sueltas en lugar del casco de cuero: Def +5, Def. esp. +1). Estrategia: rompe la armadura del que más se defiende y lo
  castiga. Atributos (33, revisados el mismo día: «me da cosa que tenga pocos No2»): Fue 9 · Con 8 · Des 6 · Agi 6 · Esp 4. Vida 40, No2 6. Equipo (Común): Hacha (Tipo 8, Rompe armadura 50 %) · Cota de malla
  de hierro (Def +4, Res. crít. T6 +1, Eva −1) · Casco de cuero endurecido (Def +1, Res. crít. T4 +1); Def +5, sin Def. especial (su punto débil,
  con la Esp baja). Skills: Golpe fuerte (rápida, 1 SP, cd 2) · Romper armadura (lenta, 2 SP, cd 3). Consumible: Pergamino grupal de Furia de
  Combate (+1 Daño a él y su grupo, 3 turnos).
  - **Atributos de nivel 1 rehechos** (dueño, 2026-11-03: «fue 9, con 7, agi 6, des 7, esp 4, para empezar»): **Fue 9 · Con 7 · Agi 6 · Des 7 ·
    Esp 4** (vida 35). **Cargado en el pool esencial el 2026-11-03.**
  - **Boceto completo, nivel 1 a 5** (2026-11-03). Atributos (Fue/Con/Agi/Des/Esp → vida): nv1 9/7/6/7/4 → 35 · nv2 10/8/7/7/4 → 40 · nv3
    11/9/7/8/4 → 45 · nv4 12/10/8/8/4 → 50 · nv5 13/11/8/9/4 → 55.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Golpe fuerte · Romper armadura | — | Hacha, Cota de malla de hierro, Cofia |
    | 2 | **Barrido** | **Hachazo que abre** 🆕 (+2 al daño contra quien tiene Armadura rota) | + 2 Comunes (grebas, brazales) |
    | 3 | **Golpe demoledor** | — | el hacha, de Buena calidad |
    | 4 | **Remate** | **Sed de batalla** 🆕 (cuando cae un rival, recupera 2 No2) | + la cota de Buena |
    | 5 | **Partir en dos** 🆕 (con 3+ de Armadura rota, ignora toda la Defensa) | — | + la cofia de Buena |
    Consumible: Pergamino grupal de Furia de Combate. Ojo: pega fuerte desde el nivel 1; medirlo contra un grupo real de cada nivel.
- **L1 · Sangrador · Choque liviano · nivel 1** (aprobado 2026-11-02, cambiando las Calzas de cuero flexible por las Zapatillas de lona). Estrategia: abre heridas y las agranda; crece cuanto más dura la pelea.
  Atributos (33): Agi 10 · Des 8 · Con 6 · Fue 6 · Esp 3. Vida 30. Equipo (Común): Cuchilla del frigorífico (Tipo 6, +2 daño, Sangrado 25 %) ·
  Chaleco de cuero (Def +2) · Zapatillas de lona (Eva +1, Def. esp. +1, Ini −1). Skills: Golpe que sangra (rápida, 1 SP, cd 2) · Sal en la herida (lenta, 2 SP,
  cd 3). Consumible: Óleo venenoso. Punto débil: vida 30 y Esp 3.
  - **Boceto completo, nivel 1 a 5** (aprobado como ruta conceptual, dueño 2026-11-03: «me cierra como ruta conceptual, con algunas observaciones
    que iré ajustando a medida que vayamos definiendo cada paso»). Atributos (Agi > Des > Con = Fue > Esp; Agi/Des/Con/Fue/Esp → vida): nv1
    10/8/6/6/3 → 30 · nv2 11/9/7/6/3 → 35 · nv3 12/10/7/7/3 → 35 · nv4 13/11/8/7/3 → 40 · nv5 14/12/8/8/3 → 40.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Golpe que sangra · Sal en la herida | — | Cuchilla del frigorífico, Chaleco de cuero, Zapatillas de lona |
    | 2 | **Corte profundo** (el sangrado fuerte) | **Olfato de sangre** 🆕 (+1 PdG contra quien sangra) | + 2 Comunes (guantes, capucha) |
    | 3 | **Ráfaga de cortes** (+2 dados, efectos del arma ×3) | — | la cuchilla, de Buena calidad |
    | 4 | **Reflejos** 🆕 (un dodge roll gratis cuando lo atacan) | **Herida que no cierra** 🆕 (su Sangrado suma 1 stack más) | + el chaleco de Buena |
    | 5 | **Hemorragia** 🆕 (hace estallar el sangrado: todo el daño que le quedaba, de golpe) | — | + las zapatillas de Buena |
    🆕 = idea nueva, se diseña al llegar a ese nivel. Consumible: Óleo venenoso.
  - **Nota del dueño (2026-11-03)**: pensó que el choque liviano tuviera acento en la **Destreza**; queda para **otra línea de liviano, más enfocada
    en críticos** (candidata: una de las que faltan, L2–L4 o la segunda vuelta).
- **M1 · Piromante · Mago · nivel 1** (aprobado 2026-11-02). Estrategia: controla el terreno con fuego (muro que corta el paso) y quema de a
  uno. Atributos (33): Esp 14 · Con 7 · Agi 5 · Des 5 · Fue 2. Vida 40 (con la campera). Equipo (Común): Varita de la bola de fuego · Botella con
  un diablito (+2 daño especial; se cambia por el Brasero de mano cuando existan los talismanes elementales) · Campera de cuero con tachas (Def +1,
  Def. esp. +1, Res. crít. T4 +1, Vida +5) · Gorro de piel de salamandra (Def. esp. +1, Res. fuego +1, Res.Mt +1): Def +1 secundaria (dueño: «algo
  de defensa física, aunque sea secundaria»). Skills: Lengua de fuego (lenta; 2 No2 + SP = su Especial; cooldown 4, por programar: «costo alto ⇒
  cooldown alto») · Muro de fuego (lenta, 1 No2 + 3 SP, cd 3). Consumible: Poción de SP menor.
- **Piromante: se queda con el nombre y solo fuego** (dueño, 2026-11-02, «sostengámoslo así»). Escalado propuesto: nv1 Lengua de fuego + Muro de
  fuego · nv2 + Toque abrasador (+ pasiva de fuego) · nv3 + Bola de fuego · nv4 + Zona en llamas (+ 2.ª pasiva) · nv5 + Meteoro. Los otros
  elementos van con los otros magos (Escarcha, Rayo, Arcano).
- **S1 · Sanador · Support · nivel 1** (aprobado 2026-11-02). Estrategia: mantiene vivos a los suyos; cura, limpia estados, estira la pelea.
  Atributos (33): Esp 12 · Con 8 · Agi 6 · Des 4 · Fue 3. Vida 45 (con el peto). Equipo (Común): Varita de cura (1d10, 1 No2 + 2 SP) · Orbe de luz
  (Def. esp. +2, Res. eléc. +1, Luz +1) · Peto de cuero de lampalagua (Def +1, Def. esp. +2, Vida +5, Res. ácido +1) · Botas de caña alta de
  estanciero (Def +1, Def. esp. +1): Def +2, Def. esp. +5. Skills: Sanar (rápida, 1 No2 + 2 SP, cd 2: 1d6+4) · Purificar (lenta, Flash, 2 SP, cd 3).
  Consumible: Pergamino de Regeneración menor (grupo: 5 por turno, 3 turnos).
  - **Boceto completo, nivel 1 a 5** (aprobado como ruta, dueño 2026-11-03: «cierra»). Atributos (Esp > Con > Agi > Des > Fue; Esp/Con/Agi/Des/Fue
    → vida, con el +5 del peto): nv1 12/8/6/4/3 → 45 · nv2 13/9/7/4/3 → 50 · nv3 15/10/7/4/3 → 55 · nv4 16/11/8/4/3 → 60 · nv5 18/12/8/4/3 → 65.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Sanar · Purificar | — | Varita de cura, Orbe de luz, Peto de lampalagua, Botas de estanciero |
    | 2 | **Oleada sanadora** (cura en área a los aliados) | **Manos de curandero** 🆕 (+1 a cada cura que da) | + 2 Comunes (capucha, guantes) |
    | 3 | **Luz para los suyos** | — | la varita, de Buena calidad |
    | 4 | **Levantar al caído** 🆕 (reanima a un aliado caído con poca vida) | **Fe inquebrantable** 🆕 (+2 Res.Mt) | + el orbe de Buena |
    | 5 | **Milagro** 🆕 (cura grande en área y saca un estado malo a cada aliado; muy lenta, arranca en espera) | — | + el peto de Buena |
    🆕 = idea nueva, se diseña al llegar a ese nivel. Consumible: Pergamino de Regeneración menor.
- **D1 · Maldito · Debuffer · nivel 1** (aprobado 2026-11-02). Estrategia: les baja las defensas a los rivales para que todos peguen más. Atributos
  (33): Esp 13 · Con 8 · Agi 6 · Des 4 · Fue 2. Vida 40. Equipo (Común): Varita del susurro (1d6 arcano que no se esquiva, Silencio 25 %) ·
  Atrapasueños (Def. esp. +2, Res.Mt +3) · Casaca curtida de salteador (Def +1, Def. esp. +1, Ini +1, Percep. +2) · Capucha de lana del culto
  (Def. esp. +1, Res.Esp +1): Def +1, Def. esp. +4. Skills: Maldición de la coraza (lenta, 2 No2 + 3 SP, cd 3) · Aguja siniestra (lenta, 2 No2 +
  3 SP, cd 3). Consumible: Runa de debilidad (trampa). Falta una rápida de Debuffer (pendiente).
- ✅ **Programado el 2026-11-03** (antes «Por programar»): **Piel de hierro escala con el nivel: +(3 + nivel)** a la Defensa y a la Def. especial (nivel 1: +4,
  nivel 3: +6 como hoy, nivel 5: +8); sigue +1 Res. a crítico y 2 turnos. Hoy es +6 fijo (de la tanda del 2026-10-27).
  - **Aguja siniestra pasa a rápida** (dueño, 2026-11-03, «vamos con esto»; **programado el 2026-11-03**: los creeps guardados se ponen al día solos): cooldown 2 y más barata (1 No2 + 2 SP), mismo
    efecto (1d6 siniestro directo, −1 a todas las resistencias a crítico 2 turnos). Así el nivel 1 tiene una lenta fuerte (Maldición de la coraza)
    y una rápida que acompaña. Ninguna habilidad de Debuffer era rápida: se diseña además una rápida nueva (en curso).
  - **Rápidas de Debuffer al pool** (dueño, 2026-11-03): **Escalofrío** (siniestro + −2 PdG) y **Espina tóxica** (tóxica + Veneno 2), definidas en
    `diseno-roles-creep.md` (Debuffer, conceptos 2 y 17), **programadas el 2026-11-03**. Candidatas: Escalofrío para el Maldito, Espina tóxica para el D2 Tóxico.
  - **Boceto completo, nivel 1 a 5** (2026-11-03, todo con lo que ya existe). Atributos (Esp/Con/Agi/Des/Fue → vida): nv1 13/8/6/4/2 → 40 ·
    nv2 14/9/7/4/2 → 45 · nv3 16/9/7/5/2 → 45 · nv4 17/10/8/5/2 → 50 · nv5 19/10/8/6/2 → 50.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Maldición de la coraza · Aguja siniestra (rápida) | — | Varita del susurro, Atrapasueños, Casaca de salteador, Capucha del culto |
    | 2 | **Aguja del desamparo** | **Puntería arcana** (+1 PdG.Esp) | + 2 Comunes |
    | 3 | **Maldición debilitante** | — | la varita, de Buena calidad |
    | 4 | **Extenuar** | **Potencia especial** (+1 Ef.Esp) | + el atrapasueños de Buena |
    | 5 | **Anulación** | — | + la casaca de Buena |
    Consumible: Runa de debilidad.
- **T2 · Muralla con púas · Tanque · nivel 1** (aprobado 2026-11-02): Con 13 · Fue 8 · Esp 6 · Agi 3 · Des 3 (33), vida 65. Hacha con garfio
  (Tipo 8, Bloqueo +1, Derribar 25 %) · Puerta de granero (Def +2, Bloqueo +2, Eva −1) · Coraza de cuero hervido (Def +3, Res. crít. T4 +1,
  Res.CC +1). Skills: Coraza de púas (rápida) · Aguante (lenta). Consumible: poción de Cuero duro. Estrategia: castiga al que le pega; no persigue.

## La idea

Un pool de **creeps humanoides predeterminados**, listos para usar, pensados de a uno: cada creep es una **línea** que va del nivel 1 al 5, y en
cada nivel se optimizan juntos el equipo, las habilidades y cómo interactúan (sinergias).

- **Habilidades por nivel**: nivel 1 con **2**, y **+1 por nivel** (nivel 5 con 6). Subir de nivel = actualizar los atributos y sumar una habilidad.
- **Atributos**: el presupuesto de siempre, **33 en nivel 1 y +3 por nivel** (45 en nivel 5). La vida sale sola de la Constitución (Con × 5 + bonos).
- **Equipo**: «buenos equipos en general». En cada nivel se suma una pieza o se mejora la calidad de alguna (tabla de abajo). Con la regla nueva del
  botín, el GM elige qué ofrece y lo que no ofrece pasa a despojos. **Tope: Buena calidad** (dueño, 2026-10-26: «por ahora no vamos a usar armas
  raras… las raras que están cargadas todavía no están del todo auditadas»).
- **Se diseñan armas y armaduras nuevas** cuando hagan falta (dueño, 2026-10-26: «aprovechemos para diseñar distintos tipos de armas y de
  armaduras, pero todo pensando en sinergia interna, que se aprovechen las mecánicas y los potenciales de cada rol»): si el catálogo no tiene la
  pieza que le sirve al creep, se diseña (Común o Buena calidad, con el criterio del rework del catálogo) y entra al catálogo.
- **Humanoides**: tipo humano o humanoide (oro sugerido y consumible al azar como siempre).
- Lo que se suma en cada nivel se piensa con lo anterior: la habilidad nueva tiene que **combinar** con las que ya tiene o con su equipo.

## Las líneas (36)

| Rol | Cuántos | Qué los define |
|---|---|---|
| ⚔ **Warrior** | 4 | Pegar fuerte: daño, romper la defensa, rematar |
| 🛡 **Tanque** | 4 | Aguantar y controlar: Defensa alta, frenar, desarmar, cuidar al de al lado |
| 🪓 **Choque pesado híbrido** | 4 | Entre warrior y tanque: aguanta y pega |
| 🗡 **Choque liviano** | 8 | Rápidos, cada uno con un estilo distinto, para probar combinaciones de skills |
| 🏹 **Rango y Hunter** | 4 | Daño concentrado a distancia, crítico, trabar; el Hunter pasa al toque y pone trampas |
| ✨ **Mago** | 4 | Daño mágico directo y en área (arcano, fuego, hielo, rayo, ácido) |
| 💚 **Support** | 4 | Potenciar y curar a los suyos (luz) |
| 🧿 **Debuffer** | 4 | Maldecir, cegar, drenar, envenenar (siniestro y tóxico) |

(Los roles que faltaban, sumados por el dueño el 2026-10-26: «te faltaron los roles de casters y de rango y support, todos los roles que ya
estuvimos trabajando para los skills». 4 de cada uno, como el resto, salvo que el dueño pida otra cantidad.)

### Estilos propuestos (punto de partida: cada uno se confirma cuando le toca)

| Línea | Estilo | Skills candidatas (del catálogo auditado) |
|---|---|---|
| W1 | Hachero: romper la armadura y castigarla | Romper armadura, Golpe fuerte, Golpe demoledor, Remate, Barrido |
| W2 | Berserker: cuanto más herido, más peligroso | Furia, Golpe desesperado, Aguante, Golpe fuerte |
| W3 | Martillero: golpes que atontan y derriban | Puño de roca, Pisotón, Salto aplastante, Golpe fuerte |
| W4 | Verdugo: el golpe anunciado y el remate | El que avisa no traiciona, Remate, Golpe demoledor, Furia |
| T1 | Escudero: escudo, aguantar y desarmar | Aguante, Desarmar, Pisotón |
| T2 | Muralla con púas: castiga al que le pega | Aguante, Coraza de púas, Envión |
| T3 | Guardaespaldas: cuida a los suyos | Envión, ¡Al frente!, Desarmar, Tirar la bronca |
| T4 | Peleador de control: empujar, tirar, demorar | Takle, Pisotón, Puño de roca |
| H1 | Embestidor: entra corriendo y pega | Takle, Golpe fuerte, Salto aplastante |
| H2 | Saltador: cae en el medio y barre | Salto aplastante, Barrido, Aguante |
| H3 | Duelista pesado: desarma y remata | Desarmar, Remate, Romper armadura |
| H4 | Bruto que aguanta: se la banca y devuelve | Aguante, Golpe desesperado, Furia |
| L1 | Sangrador | Golpe que sangra, Sal en la herida, Corte profundo |
| L2 | Envenenador | Hoja envenenada, Tajo veloz, Corte certero |
| L3 | Asesino de las sombras | Bomba de humo, Puñalada por la espalda, Puñalada trapera |
| L4 | Hostigador: pica y se va | Hit and run, Tajo veloz, Dash |
| L5 | Duelista: finta y estocada | Finta, Estocada, Ojo de asesino |
| L6 | Patotero: pelea en grupo | Patotear, Golpe a la rodilla, Tajo de carnicero |
| L7 | Degollador: busca al herido | Ojo de asesino, Degollar, Remate |
| L8 | Acróbata: se mueve y corta | Dash, Salto, Ráfaga de cortes |
| R1 | Tirador de precisión | Tiro certero, Tiro a la cabeza, Vigilancia |
| R2 | Hostigador a distancia: dispara y se va | Disparo y repliegue, Ráfaga encadenada, Mantener a raya |
| R3 | Trabador: frena y clava | Tiro a la rodilla, Clavar a la pared, Red |
| R4 | Hunter: trampas y toque | Tiro que derriba, Abanico, trampas (a definir) |
| M1 | Piromante | Misiles elementales, Meteoro, muro de fuego |
| M2 | Mago de escarcha | Hálito polar, Lluvia de escarcha, Prisión de hielo |
| M3 | Mago del rayo | Zap, rayo en cadena, Descarga arcana |
| M4 | Arcano: control y movilidad | Tormenta arcana, Nova arcana, Parpadeo, Cascotazo |
| S1 | Sanador | Sanar, Oleada sanadora, Purificar, Luz para los suyos |
| S2 | Abanderado: potencia al grupo | Estandarte de guerra, ¡A la carga!, Redoble de tambores |
| S3 | Armero: arma elemental y bendiciones | Arma ígnea / helada / eléctrica, Bendecir el arma, Armas perforantes |
| S4 | Protector: escudos y empuje | Envión, Coraza de púas, Velo espejado, Empuje |
| D1 | Maldito: bajar defensas | Maldición de la coraza, Maldición debilitante, Aguja siniestra |
| D2 | Tóxico | Nube tóxica, Corroer, Maldición de la sequía |
| D3 | Ladrón de fuerzas | Robar el aliento, Extenuar, sanguijuela |
| D4 | Control mental y ceguera | Confusión, Cegar, Grito de pánico, Tótem de silencio |

**Huecos del pool**: el Tanque tenía pocas skills propias auditadas (Aguante, Desarmar, Pisotón, Takle). ✅ **Tanda Choque pesado definida el
2026-10-27**: 14 nuevas para quedar en 10 warrior · 10 tanque · 10 ambiguas («Tanda Choque pesado 10 · 10 · 10» en `diseno-roles-creep.md`);
falta programarlas. Los estilos de abajo se repasan con ellas al llegar a cada línea. Si otra línea necesita una
skill que no existe, se diseña en el momento con el método de siempre.

Los Casters (Mago, Support, Debuffer) usan armas especiales (varitas, báculos) y orbes o talismanes; el Rango, arcos, ballestas y hondas, con sus
flechas o virotes en el cinturón. Su equipo se elige por lo que potencia sus skills (Ef.Esp, PdG.Esp, Res., distancia ideal, flechas especiales).

## Atributos de partida (reparto sugerido, se ajusta a mano)

Con los repartos por rol del asistente de creeps (`Combatiente.PESOS_ROL`), en el orden Con · Fue · Agl · Des · Esp:

| Rol | Nivel 1 (33) | Nivel 5 (45) |
|---|---|---|
| Warrior (brutal) | 9 · 10 · 4 · 6 · 4 | 12 · 14 · 6 · 7 · 6 |
| Tanque | 12 · 9 · 3 · 3 · 6 | 17 · 12 · 4 · 5 · 7 |
| Choque liviano (rápido) | 6 · 6 · 10 · 8 · 3 | 7 · 8 · 14 · 11 · 5 |
| Híbrido | entre warrior y tanque, a mano | |
| Rango, Mago, Support, Debuffer | con su reparto (`rango`, `mago`, `apoyo`, `debuffer`) | |

Si una skill tira un atributo (el Takle tira Constitución, el Pisotón Fuerza, una habilidad mágica Especial), ese atributo se sube un poco.

- **R1 · Tirador de precisión · Rango** (boceto aprobado 2026-11-03, dueño: «bien, seguimos»; nivel 1 en definición). Estrategia: el francotirador;
  se queda lejos, apunta y cada disparo busca el crítico o pasar la armadura. Acento en **Destreza y críticos** (la idea del dueño para un liviano,
  2026-11-03, le calza a esta línea). Todo con lo que ya existe.
  - Atributos (Des > Agi = Con > Fue > Esp; Des/Agi/Con/Fue/Esp → vida): nv1 11/7/7/5/3 → 35 · nv2 12/7/8/6/3 → 40 · nv3 13/8/8/7/3 → 40 · nv4
    14/8/9/8/3 → 45 · nv5 15/9/10/8/3 → 50. Con Agi 7 (7 No2) y arco Tipo 4 (primer disparo 2): en nivel 1 dispara dos veces o dispara y se mueve.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | **Tiro certero** (rápida) · **Tiro a la cabeza** (lenta) | — | Arco de la espera · Chaleco de cuero · botas |
    | 2 | **Vigilancia** | **Puntería** (+1 PdG) | + 2 Comunes (capucha, guantes) |
    | 3 | **Tiro al arma** | — | el arco, de Buena calidad |
    | 4 | **Disparo señalador** | **Ojo crítico** (+1 Crítico frecuente) | + el chaleco de Buena |
    | 5 | **Flecha que atraviesa** | — | + las botas de Buena |
    Consumible: Flecha perforante (Común).
  - **Nivel 1 aprobado** (dueño, 2026-11-03: «le pondría las botas de cuero de vaca. El resto ok»): Des 11 · Agi 7 · Con 7 · Fue 5 · Esp 3 (33),
    vida 35, 7 No2. Equipo (Común): **Arco de la espera** (Tipo 4, 1 dado +1 de daño, Rango +3, Distancia ideal lejos: PdG +1, Respiración
    contenida) · **Chaleco de cuero** (Def +2) · **Botas de cuero de vaca** (Def +1, Res. crít. T4 +1): Def +3, Def. esp. 0. Skills: **Tiro certero**
    (rápida, cd 2: +1 PdG, Perfora 3, ignora 2 de Res. a crítico; lo de un disparo) · **Tiro a la cabeza** (lenta, cd 3: apunta; el próximo
    disparo +2 PdG, Crítico frecuente +1 y potente +1; lo pierde si le hacen daño). Consumible: Flecha perforante. Juego: apunta, dispara con todo y
    con lo que sobra el Tiro certero; si le llegan, se aleja (7 No2) y vuelve a disparar. **Cargado en el pool esencial el 2026-11-03.**

- **M2 · Mago de escarcha · Mago** (boceto aprobado 2026-11-03, dueño: «me cierra»; nivel 1 por definir). Estrategia: el mago de control: no
  quema, **frena** (encierra, empuja, deja el campo congelado y Escarcha). Todo con lo que ya existe. Atributos (Esp/Con/Agi/Des/Fue → vida, con
  el +5 de la capa): nv1 14/8/5/4/2 → 45 · nv2 15/9/5/5/2 → 50 · nv3 17/9/6/5/2 → 50 · nv4 18/10/6/6/2 → 55 · nv5 20/10/7/6/2 → 55.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Dardo helado** · **Hálito polar** | — | Varita de la ventisca + Escudo de cuero mojado · Capa de viajero · Anillo de escarcha |
  | 2 | **Parpadeo** (rápida, escape) | **Potencia especial** (+1 Ef.Esp) | + 2 Comunes (Polainas de cuero remendado, botas) |
  | 3 | **Prisión de hielo** | — | la varita, de Buena calidad |
  | 4 | **Ráfaga de viento** | **Temple mágico** (+1 Res.Esp) | + la capa de Buena |
  | 5 | **Lluvia de escarcha** | — | + el escudo de Buena |
  Consumible: Poción de SP menor (en modo cooldown, le baja 1 turno a una habilidad). Ojo: no hay ninguna habilidad de hielo rápida (como con el
  Piromante): en nivel 1, dos lentas y la varita.
  - **Nivel 1 aprobado** (dueño, 2026-11-03: «le bajaría 2 de especial y le subiría 2 de destreza… si no tiene muy poco rango y queda muy vulnerable;
    después, con los niveles, le vamos subiendo más el especial»): **Esp 12 · Con 8 · Agi 5 · Des 6 · Fue 2** (33), vida 45 (con la capa), 5 No2.
    Equipo (las manos + 2 Comunes): **Varita de la ventisca** (flor 2d4 de hielo directo con dodge roll; suelo congelado 1 turno: Agilidad contra su
    Ef.Esp o Sentado; charco vulnerable al rayo; 1 No2 + 4 SP o 5 No2) · **Escudo de cuero mojado** (Def +2, Res. hielo +1) · **Capa de viajero**
    (Def.Esp +1, Res.Esp +1, Res. hielo +1, Vida +5) · **Anillo de escarcha** (+2 al daño de hielo): Defensa 2, Def.Esp 1. Skills: **Dardo helado**
    (lenta, cd 4: 2d6 + ¼ Ef.Esp de hielo +2, Escarcha 1 y una más cada 5) · **Hálito polar** (lenta, cd 3: cono de 16, 2d4 + ¼ Ef.Esp +2 y
    Escarcha). Consumible: Poción de SP menor. Sin cargar hasta que el dueño diga.
  - **Atributos del boceto, rehechos** (Esp/Con/Agi/Des/Fue → vida, con la capa): nv1 12/8/5/6/2 → 45 · nv2 14/9/5/6/2 → 50 · nv3 16/9/6/6/2 → 50 ·
    nv4 17/10/6/7/2 → 55 · nv5 19/10/7/7/2 → 55 (el Especial sube más desde el nivel 2).
  - **Boceto nivel por nivel** (dueño, 2026-11-03: «me cierra»): nv2 Parpadeo + pasiva Potencia especial; + Polainas de cuero remendado y Botas de
    caña alta (Def 4, Def.Esp 2) · nv3 Prisión de hielo; el escudo pasa a **Escudo de bronce con runas** (Buena: Def +2, Def.Esp +2, Res. hielo +1)
    (Def 4, Def.Esp 4) · nv4 Ráfaga de viento + pasiva Temple mágico; la capa pasa a **Túnica del archivista** (Buena: SP +3, Def.Esp +2, Res.Mt +2,
    Res.Esp +1, Percepción +2) (Def 4, Def.Esp 5; vida 50) · nv5 Lluvia de escarcha; + **Yelmo de bronce con runas** (Buena) (Def 5, Def.Esp 7). La
    varita sigue siendo la de la ventisca (no hay una de hielo Buena que la mejore: la de la ráfaga helada repite la Ráfaga de viento). Vida 50 desde
    el nivel 2 (frágil a propósito; alternativa: Coraza de bronce con runas en vez de la túnica).

## Equipo por nivel — criterio del dueño (2026-10-27, reemplaza la propuesta de abajo)

«El nivel 1 puede ser un arma, o un arma y un escudo, o un arma y un talismán, o algo de dos manos. Y dos piezas equipables comunes. En nivel 2, 4
piezas equipables comunes. En nivel 3, a eso sumarle una de buena calidad. En nivel 4, 2 de buena calidad y 3 comunes. En nivel 5, 3 de buena calidad
y 3 comunes. Así, a grandes rasgos, como criterio.»

| Nivel | Las manos + las piezas |
|---|---|
| 1 | arma / arma + escudo / arma + talismán / de dos manos · 2 piezas Comunes |
| 2 | las manos · 4 piezas Comunes |
| 3 | las manos · 4 Comunes + 1 de Buena calidad |
| 4 | las manos · 3 Comunes + 2 de Buena calidad |
| 5 | las manos · 3 Comunes + 3 de Buena calidad |

(Lectura de Claude, a confirmar: lo de las manos va aparte de las piezas; las de Buena calidad pueden ser el arma.)

**El consumible** (dueño, 2026-10-27): el consumible que lleva cada creep (el que después cae en el botín) se elige para que **le sirva a él en la
pelea** (y lo use), no al azar.

## Equipo por nivel (propuesta vieja, reemplazada)

| Nivel | Equipo |
|---|---|
| 1 | Arma Común + 3 piezas Comunes (torso, cabeza y una más según el estilo: escudo, piernas, manos) |
| 2 | + 1 pieza Común (5 en total) |
| 3 | El arma pasa a Buena calidad + 1 pieza de Buena calidad |
| 4 | 2 piezas más pasan a Buena calidad; puede sumar un anillo o un talismán |
| 5 | Todo de Buena calidad (sin Raro por ahora: las Raras no están del todo auditadas) |

Cada pieza se elige porque hace algo con sus skills (un hacha con Rompe armadura para el Hachero, un escudo con Parada fácil para el Escudero).

## Forma de trabajo

> **Forma de trabajo, ajustada por el dueño (2026-11-03): boceto de 1 a 5, y después rondas por nivel.** Una línea es un solo creep con un solo
> nombre en todos los niveles (el Escudero es Escudero en el 1 y en el 5); T2 Muralla con púas, T3 Guardaespaldas… son otras variedades, no niveles.
> 1. **Al empezar cada línea, el boceto**: imaginarlo en nivel 5 (todas sus habilidades, pasivas, equipo y su estrategia completa) y bajar: qué tiene
>    sentido que tenga primero y qué suma en cada nivel. Queda anotado.
> 2. **Y se define su nivel 1** (atributos, equipo, habilidades, consumible). Se pasa a la siguiente línea de la rotación (boceto + nivel 1), y así.
> 3. Terminada la **ronda de nivel 1** de todas las líneas, se vuelve a la primera (el Escudero) y se define su **nivel 2**, repasando y ajustando el
>    boceto sobre la marcha; después la ronda de nivel 2, la de 3…
> **Las ideas nuevas (🆕) de los bocetos son para evaluar** (dueño, 2026-11-03: «tomo las ideas de pasivas y habilidades nuevas para evaluar, pero
> voy a intentar diseñarlos con lo que ya está diseñado. En cada paso iré evaluando»): al definir cada nivel, primero se busca entre las habilidades
> y pasivas que ya existen; una 🆕 se diseña solo si no hay nada que sirva.
> Al crearlo en GM Tools se elige el nivel y aparece solo con lo de ese nivel (pendiente de programar). Las 6 líneas con el nivel 1 aprobado sin
> boceto completo (todas hechas el 2026-11-03: el Escudero, el Sangrador, el Sanador, el Hachero y el Maldito; el Piromante ya tiene su escalado; el Escudero, hecho el 2026-11-03) necesitan el suyo.

0. **Antes**: la tanda de skills de Tanque (`diseno-roles-creep.md`).
1. **Rotación**: un creep de un rol, después uno del siguiente: Warrior → Tanque → Híbrido → Liviano → Liviano → Rango → Mago → Support → Debuffer →
   (de nuevo) Warrior… Así, en cada vuelta salen 9 (dos livianos). Con 4 vueltas quedan los 36 de nivel 1.
2. **Por cada creep**: concepto y nombre → atributos → arma y equipo → las 2 skills de nivel 1 y por qué combinan → botín (oro, qué ofrecer) → OK del
   dueño → queda anotado acá.
3. **Nivel 2 en adelante**: se recorren las mismas 20 líneas en el mismo orden: +3 atributos, +1 skill, la mejora de equipo del nivel.
4. **Se diseña primero y se programa después** (el mismo método que con las skills): se programa cuando el dueño lo pida (por ejemplo, al cerrar
   los 20 de nivel 1), se prueba en el mapa y se sigue.

## Estado

| Línea | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|---|---|---|---|---|---|
| W1 | ✅ (2026-11-02) | | | | |
| T1 | ✅ (2026-11-02) | | | | |
| T2 | ✅ (2026-11-02) | | | | |
| H1 | | | | | |
| L1 | ✅ (2026-11-02) | | | | |
| L2 | | | | | |
| R1 | ✅ (2026-11-03) | | | | |
| M1 | ✅ (2026-11-02) | | | | |
| S1 | ✅ (2026-11-02) | | | | |
| D1 | ✅ (2026-11-02) | | | | |
| W2 | | | | | |
| T2 | | | | | |
| H2 | | | | | |
| L3 | | | | | |
| L4 | | | | | |
| R2 | | | | | |
| M2 | ✅ (2026-11-03) | | | | |
| S2 | | | | | |
| D2 | | | | | |
| W3 | | | | | |
| T3 | | | | | |
| H3 | | | | | |
| L5 | | | | | |
| L6 | | | | | |
| R3 | | | | | |
| M3 | | | | | |
| S3 | | | | | |
| D3 | | | | | |
| W4 | | | | | |
| T4 | | | | | |
| H4 | | | | | |
| L7 | | | | | |
| L8 | | | | | |
| R4 | | | | | |
| M4 | | | | | |
| S4 | | | | | |
| D4 | | | | | |

## Los creeps (cada uno se completa al diseñarlo)

_(vacío: el primero es W1, nivel 1)_
