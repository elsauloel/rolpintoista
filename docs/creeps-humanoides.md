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
- **Repetir habilidades entre creeps no importa** (dueño, 2026-11-03): «lo prioritario es que cada creep esencial tenga su propia identidad y su
  propia estrategia entre los skills, los stats y el equipo… siempre que tengan una identidad y una estrategia que valga la pena su existencia y
  explote las mecánicas y las distintas posibilidades de estrategias que te propone el juego». Las «superposiciones» ya no son un problema a
  marcar: lo que se cuida es la identidad y la estrategia de cada uno.
- **SP o turnos de espera** (dueño, 2026-11-03: «todos los que son con énfasis en especial van a trabajar con SP en vez de con cooldown»): los
  que tienen el Especial como atributo principal (magos, debuffers, el Sanador) juegan **con SP** (SP = Esp × 3 + equipo; recupera Esp ÷ 2 por
  turno, mínimo 1); los demás, con turnos de espera. **Programado** en el pool esencial (`comun/creeps-esenciales.js`: modo SP si el Esp es el
  atributo más alto); en GM Tools se puede cambiar a mano en cada creep.
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
> ✅ **Programados también el 2026-11-03 (segunda tanda)**: R1, T2 (nivel 1 rehecho), M2, M3, M4, H1, H2, W2 (con las dos armas puestas; atacar con la segunda en creeps, hecho el 2026-11-03), L2, L3, R2, S2, S3, S4, D2, D3, D4 — 23 en total. Los de Especial más alto (magos, debuffers, Sanador, Protector) arrancan con SP. **L4 sumado el mismo día** (nivel 1 aprobado): 24 en total.

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
  - **Provocar tira PdG.Esp + su nivel, como el Taunt de clase** (dueño, 2026-11-03: «al revés, quiero que el de creep tire PdG.Esp + nivel»; por unas horas fue Ef.Esp + 2).
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
  - **Nivel 1 rehecho y boceto de 1 a 5** (dueño, 2026-11-03: «el creep va así»), con el criterio de tanques (Agi ≥ 5 para poder atacar):
    Con/Des/Agi/Fue/Esp → vida, No2: **nv1 12/6/5/7/3 → 60, 5** (antes 13/3/3/8/6) · nv2 13/6/6/8/3 → 65, 6 · nv3 14/7/6/9/3 → 70, 6 · nv4
    15/7/7/10/3 → 90, 7 · nv5 16/8/7/11/3 → 95, 7. Nivel 1: Def 5, Def.Esp 0; el hachazo cuesta 4 No2.
    | Nivel | Habilidad nueva | Pasiva | Equipo |
    |---|---|---|---|
    | 1 | Coraza de púas (rápida) · Aguante (lenta) | — | Hacha con garfio · Puerta de granero · Coraza de cuero hervido |
    | 2 | **Velo espejado** (Espejo: castiga la magia) | **Piel curtida** (+1 Def) | + 2 Comunes (cofia, botas) |
    | 3 | **Blindaje** (rápida) | — | el escudo: **Escudo de pinchos** (Buena, Espinas) |
    | 4 | **Segundo aliento** | **Robustez** (+5 de vida) | la coraza: **Pieles erizadas del berserker** (Buena, Espinas) |
    | 5 | **Escudo humano** | — | el hacha: **Hacha de abordaje** (Buena) |
    Pendiente de diseño: si las Espinas de varias fuentes se suman (ver `pendientes.md`); si no, en el nivel 4 va la Coraza de bronce con runas.
  - **nv2 aprobado y cargado (2026-11-07):** Con 13 · Fue 8 · Agi 6 · Des 6 · Esp 3. Equipo: Hacha con garfio · Puerta de granero · Coraza de
    cuero hervido · + **Cofia de anillas sueltas** · + **Botas de cuero de vaca**. Habilidades: Coraza de púas · Aguante · + **Velo espejado**.
    Pasiva: **Piel curtida**. Consumible: Poción de Cuero Duro. Vida 65 · No2 6 · Def 8 · Def.Esp 1 · Bloqueo 11 · PdG 6. **Dueño: del nivel 3 en
    adelante, subirle la Probabilidad de Golpe** (PdG 6 es poco).
  - **nv3 aprobado y cargado (2026-11-08):** Con 14 · Fue 8 · Agi 6 · **Des 8** · Esp 3 (los dos puntos de Destreza van a la PdG, decisión del
    dueño). **Las Espinas no se suman** (dueño, 2026-11-08): la Coraza de púas queda como su única fuente de Espinas, así que el **Escudo de pinchos**
    del plan se cambia por el **Mantelete de asedio** (Buena: Defensa +2 · Bloqueo +1 · Defensa contra armas a distancia +4), y en el nv4 también
    se reemplazan las Pieles erizadas. Equipo: Hacha con garfio · **Mantelete de asedio** · Coraza de cuero hervido · Cofia de anillas sueltas ·
    Botas de cuero de vaca. Habilidades: … · + **Blindaje**. Pasiva: Piel curtida. Consumible: Poción de Cuero Duro. Vida 70 · No2 6 · PdG 8 ·
    Parry 8 · Def 8 (12 contra armas a distancia) · Eva 6 · **Bloqueo con el escudo 9** (Fue 8 + 1 del Mantelete; el +1 de Bloqueo del hacha ya
    no cuenta al bloquear con el escudo, por la regla de los bonos por arma del 2026-11-07).
  - **nv4 aprobado y cargado (2026-11-08):** Con 15 · Fue 8 · Agi 7 · **Des 9** · Esp 3 (el punto va a Destreza y no a Fuerza, para seguir subiendo
    la PdG). Como las Espinas no se suman, la coraza del plan (**Pieles erizadas del berserker**) se cambia por la **Coraza de bronce con runas**
    (Buena: Defensa +3 · Defensa especial +3 · Res. rayo +1 · Vida +10). Equipo: Hacha con garfio · Mantelete de asedio · **Coraza de bronce con
    runas** · Cofia de anillas sueltas · Botas de cuero de vaca. Habilidades: … · + **Segundo aliento**. Pasivas: Piel curtida · + **Robustez**.
    Consumible: Poción de Cuero Duro. Vida 90 · No2 7 · PdG 9 · Def 8 (12 contra armas a distancia) · Def.Esp 4 · Bloqueo con el escudo 9 · Eva 7.
  - **Orden nuevo de habilidades y T2 completa (dueño, 2026-11-08: «espinas y provocar van muy bien para un tanque»):** nv1 Coraza de púas +
    Aguante · nv2 + Velo espejado · nv3 + **Provocar** · nv4 + **Blindaje** · nv5 + **Escudo humano**. **Sale Segundo aliento** (queda tanque puro:
    aguanta, provoca y castiga, no se cura). **Del nv3 en adelante, un punto de Fuerza pasa a Especial** (Provocar tira PdG.Esp + nivel contra la
    Res.Mt; dueño: «un puntito más de especial», sacado de Fuerza a sugerencia). El daño que se lleva por Escudo humano no activa sus Espinas (regla
    del dueño, 2026-11-08). Los nv3 y nv4 de arriba quedan reemplazados por estos (Con/Fue/Agi/Des/Esp):
    | Nivel | Atributos | Habilidad nueva | Equipo nuevo | Vida | No2 | PdG | PdG.Esp | Daño | Def (a distancia) | Def.Esp | Bloqueo escudo / hacha | Eva | Res.CC | Res.Mt |
    |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
    | 3 | 14/7/6/8/4 | Provocar | Mantelete de asedio | 70 | 6 | 8 | 4 | 7 | 8 (12) | 1 | 12 / 9 | 6 | 14 | 4 |
    | 4 | 15/7/7/9/4 | Blindaje | Coraza de bronce con runas | 90 | 7 | 9 | 4 | 7 | 8 (12) | 4 | 12 / 9 | 7 | 15 | 4 |
    | 5 | 16/8/7/10/4 | Escudo humano | **Hacha de abordaje** (Buena: Bloqueo +2, Derribar 33 %, Resistente ×2) | 95 | 7 | 10 | 4 | 8 | 8 (12) | 4 | 13 / 11 | 7 | 16 | 4 |
    (Bloqueo con el peso de la pieza incluido, como lo calcula `CreepCalculo.bloqueoValor`.) Provocar en el nv3 tira 4 + 3 = 7 contra la Res.Mt.

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
| W2 | Berserker: cuanto más herido, más peligroso | Furia, Golpe desesperado, Aguante, Pegar fuerte |
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
| S4 | Protector: escudos y empuje | Envión, Coraza de púas, Velo espejado, Potencia |
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
  - **Nivel 2 aprobado y cargado** (dueño, 2026-11-09: «el mago de escarcha está bien»): Esp 13 · Con 9 · Agi 5 · Des 6 · Fue 2, vida 50 (con la capa),
    5 No2, **SP 39** (modo SP: «los magos van a usar SP, no cooldown»), PdG.Esp 13, Ef.Esp 14, Def 3, Def.Esp 1, Eva 6. Suma **Parpadeo** (Flash, 4 SP: se
    teletransporta hasta 3 casillas, sin oportunidad) y la pasiva **Potencia especial** (+1 Ef.Esp, igual que el Piromante nv2: el dueño la dejó así).
    Equipo + Polainas de cuero remendado (Def +1, Res.CC +1) y Escarpines de fieltro (Eva +1). Costos con SP: Dardo helado y Hálito polar, tanto SP como su
    Especial (13). El Parpadeo, desde el mismo día, se ve como un televisor viejo que se apaga en la salida y se prende en la llegada (vtt-hexgrid/js/111).
  - **Nivel 3 aprobado y cargado** (dueño, 2026-11-09: «va con esto»): Esp 15 · Con 9 · Agi 6 · Des 6 · Fue 2, vida 50 (con la capa), 6 No2,
    **SP 45** (+7 por turno), PdG.Esp 15, Ef.Esp 16, Def 1, Def.Esp 2, Eva 7. Suma **Prisión de hielo** (2 No2, 3 SP: su PdG.Esp contra la Evasión;
    2d4 de hielo e Inmovilizado hasta 2 turnos; se rompe con Fuerza contra su Ef.Esp). **La mano del escudo pasa a un talismán Bueno, el Orbe de
    resguardo mayor** (Def.Esp +1, Luz +1; una vez por turno, al ganar una tirada de PdG.Esp, un Escudo especial de 3 hasta su próximo turno), en lugar
    del Escudo de cuero mojado y del Escudo de bronce con runas del boceto (dueño, 2026-11-09: «quizás en el nivel 3 podemos pensar en algún talismán
    que le sea útil»). **La varita sigue siendo la de la ventisca**: la de la ráfaga helada se descartó porque repite la Ráfaga de viento del nivel 4.
    Pierde Defensa (de 3 a 1) al soltar el escudo; lo compensa el escudo de 3 del orbe en cada hechizo que pega.
  - **Nivel 4 aprobado y cargado** (dueño, 2026-11-09: «va con kevlar»): Esp 17 · Con 10 · Agi 6 · Des 7 · Fue 2, vida 55 (50 + 5 del chaleco), 6 No2,
    **SP 51** (+8 por turno), PdG.Esp 17, Ef.Esp 18, **Def 4 (6 contra armas a distancia)**, Def.Esp 1, Eva 7, Res.Esp 11, Res.Mt 17. Suma **Ráfaga de
    viento** (2 No2, 3 SP: cono de 16, PdG.Esp contra la Evasión de cada rival; 1d6 arcano, lo empuja 3 y queda Sentado; sin fuego amigo) y la pasiva
    **Temple mágico** (+1 Res.Esp). **El torso Bueno es el Chaleco de kevlar** (Def +3, +2 contra armas a distancia, Vida +5, Res. crít. T4 +1, Res.
    fuego +1) en lugar de la Túnica del archivista del boceto, por la regla del dueño de que a los magos se los protege contra el rango; sale la
    Capa de viajero.
  - **Nivel 5 aprobado y cargado — M2 completa** (dueño, 2026-11-09): Esp 19 · Con 10 · Agi 7 · Des 7 · Fue 2, vida 55, 7 No2, **SP 57** (+9 por
    turno), PdG.Esp 19, Ef.Esp 20, **Def 5 (7 contra armas a distancia)**, Def.Esp 3, Eva 8, Res.Esp 12, Res.Mt 19, Res.CC 11. Suma **Lluvia de
    escarcha** (4 No2 y tanto SP como su Especial: área de diámetro 5, 19 casillas; 2d4 + ¼ Ef.Esp de hielo; suelo congelado 2 turnos y después
    charco; con fuego amigo) y la tercera Buena en la cabeza: el **Yelmo de bronce con runas** (Def +1, Def.Esp +2, Res. fuego +1, Res.Esp +1).
  - **Atributos del boceto, rehechos** (Esp/Con/Agi/Des/Fue → vida, con la capa): nv1 12/8/5/6/2 → 45 · nv2 14/9/5/6/2 → 50 · nv3 16/9/6/6/2 → 50 ·
    nv4 17/10/6/7/2 → 55 · nv5 19/10/7/7/2 → 55 (el Especial sube más desde el nivel 2).
  - **Boceto nivel por nivel** (dueño, 2026-11-03: «me cierra»): nv2 Parpadeo + pasiva Potencia especial; + Polainas de cuero remendado y Botas de
    caña alta (Def 4, Def.Esp 2) · nv3 Prisión de hielo; el escudo pasa a **Escudo de bronce con runas** (Buena: Def +2, Def.Esp +2, Res. hielo +1)
    (Def 4, Def.Esp 4) · nv4 Ráfaga de viento + pasiva Temple mágico; la capa pasa a **Túnica del archivista** (Buena: SP +3, Def.Esp +2, Res.Mt +2,
    Res.Esp +1, Percepción +2) (Def 4, Def.Esp 5; vida 50) · nv5 Lluvia de escarcha; + **Yelmo de bronce con runas** (Buena) (Def 5, Def.Esp 7). La
    varita sigue siendo la de la ventisca (no hay una de hielo Buena que la mejore: la de la ráfaga helada repite la Ráfaga de viento). Vida 50 desde
    el nivel 2 (frágil a propósito; alternativa: Coraza de bronce con runas en vez de la túnica).

- **Regla (dueño, 2026-11-03): los creeps esenciales se diseñan para jugar con turnos de espera (cooldown)**, no en modo SP. En modo SP el SP sale del
  Especial (× 3, recarga la mitad por turno, mínimo 1): los físicos, con Especial bajo, se quedarían sin habilidades. Por eso en los físicos el Especial
  puede quedar bajo; el modo SP queda para magos y supports con mucho Especial.
- **H1 · Embestidor · Híbrido** (boceto y nivel 1, 2026-11-03). Estrategia: cruza el campo y se lleva puesto a uno: corre, derriba y empuja; le
  rompe la línea al grupo y llega a los de atrás. Atributos (dueño: «tengo miedo que con destreza tan baja me cueste pegar»; Con/Fue/Agi/Des/Esp →
  vida, No2): **nv1 10/7/7/7/2 → 50, 7** (antes 10/8/6/7/2 → 6 No2: no le alcanzaba para atacar —4— y correr 3 —3—; dueño, 2026-11-09:
  «bajale la fuerza»: Fue −1, Agi +1) · nv2 11/9/7/7/2 → 55, 8 (con Impulso) · nv3 12/10/7/8/2 → 60, 8 · nv4 13/11/8/8/2 → 80, 9 · nv5
  14/12/8/9/2 → 90, 9. Nada de lo que usa tira Especial.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Carga que derriba** (rápida, Flash: onda en cono, Fue +2 contra Con; 1 + la diferencia en No2 y la diferencia de daño; sin No2, Sentado) · **Takle** (lenta) | — | Hacha de verdugo de pueblo (Tipo 8, Derribar 50 %) · Chaleco de cuero · Anillo de Paso Fantasma (Def 2, Def.Esp 0) |
  | 2 | **Golpe fuerte** (rápida: +1 dado) | **Impulso** (+1 No2) | + Cofia de anillas sueltas y Botas de cuero de vaca (Def 4, Def.Esp 1) |
  | 3 | **Salto aplastante** (salta 3, Sentado a los pegados con Res.CC contra su Fuerza, ataque +2 de daño) | — | el hacha: Hacha del verdugo de la capital (Buena: 2 dados, Derribar 50 %) |
  | 4 | **Aguante** | **Robustez** (+5 de vida) | el chaleco: Jubón de cuero tachonado (Buena) (Def 4, Def.Esp 3) |
  | 5 | **Furia** | — | la cofia: Casco de bandas remachadas (Buena) + guantes Comunes (Def 5, Def.Esp 2) |
  **Salto aplastante** (2026-11-09, dueño): cooldown 4, pero **arranca el combate disponible** (`disponibleAlInicio`; los creeps guardados se ponen
  al día solos).
  Consumible: Pergamino grupal de Paso Fantasma. Ojo: «Carga que derriba» no es una carga (es una onda en cono). Sin cargar hasta que el dueño diga.

- **S2 · Abanderado · Support** (boceto y nivel 1 aprobados, dueño 2026-11-03: «me copa»). Estrategia: el soldado que lleva la bandera; no cura,
  hace pegar más a los suyos (grita, toca el tambor, planta el estandarte) y pelea con lanza al lado del grupo. Como juega con turnos de espera y
  nada tira Especial, es soldado, no mago. Atributos (Con/Des/Fue/Agi/Esp → vida, No2): **nv1 10/7/7/6/3 → 50, 6** · nv2 11/8/7/7/3 → 55, 7 ·
  nv3 12/8/8/7/4 → 60, 7 · nv4 13/9/8/8/4 → 70, 8 · nv5 14/9/9/8/5 → 75, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Potencia** (antes «Empuje»; rápida, Flash: +3 a la próxima tirada de un aliado) · **¡A la carga!** (lenta: aliados a 4, +2 PdG, PdG.Esp, daño y Ef.Esp 2 turnos) | — | **Lanza corta** (Tipo 4, +1 daño, Alcance +1) + **Estandarte del muro** (aliados pegados +1 Defensa) · Chaleco de cuero · Botas de caña alta (Def 3, Def.Esp 1) |
  | 2 | **Bendecir el arma** (rápida, Flash) | **Marcar el ritmo** (al empezar la ronda, sube 1 a un aliado pegado; dueño, 2026-11-05) | + 2 Comunes |
  | 3 | **Redoble de tambores** | — | el estandarte, de Buena calidad |
  | 4 | **Arenga** | **Voluntad de hierro** (+2 Res.CC; pasó del 2 al 4, sale Robustez — dueño, 2026-11-05) | + el chaleco de Buena |
  | 5 | **Estandarte de guerra** (aliados a 3: +3 PdG y +5 de daño mientras siga en pie) | — | + la lanza de Buena |
  Consumible: Pergamino grupal de Furia de Combate. Piezas Buenas a elegir al definir cada nivel. Sin cargar hasta que el dueño diga.
  - **Nivel 2 aprobado y cargado** (dueño, 2026-11-09: «me cierra»): Con 11 · Des 8 · Agi 7 · Fue 7 · Esp 3; + Cofia de anillas sueltas y Guantes de
    agarre; Bendecir el arma (Flash) y la pasiva Marcar el ritmo. Vida 55, No2 7, PdG 9, Daño 7, Def 4, Def.Esp 2, Eva 7 (con cooldown, no SP).
  - **Nivel 3 aprobado y cargado** (dueño, 2026-11-10): Con 12 · Fue 8 · Des 8 · Agi 7 · Esp 4; Redoble de tambores. El plan pedía el estandarte de
    Buena y no había ninguno (los cuatro estandartes son Comunes): el dueño creó el **Estandarte de la vanguardia** (Buena, 150: a los aliados a 2
    casillas o menos, +1 Defensa y +1 PdG, mientras sigan cerca), que reemplaza al del muro. Vida 60, No2 7, PdG 9, Daño 8, Def 4.
  - **Nivel 4 aprobado y cargado** (dueño, 2026-11-10: «va con el peto»): Con 13 · Fue 8 · Des 9 · Agi 8 · Esp 4; Arenga y la pasiva Voluntad
    de hierro; el chaleco pasa a **Peto de cuero de oficial** (Buena: Def +3, Vida +15, Res. ácido +1, Percepción +1), elegido sobre la Coraza de
    primera línea (ya la lleva el Saltador). Vida 80, No2 8, PdG 10, Daño 8, Def 5, Def.Esp 2, Eva 8, Res.CC 15, Res.Esp 13.
  - **Nivel 5 aprobado y cargado — línea S2 completa** (dueño, 2026-11-10): Con 14 · Fue 9 · Des 9 · Agi 8 · Esp 5; Estandarte de guerra. El
    plan pedía la lanza de Buena y no había ninguna lanza Buena de una mano (las Buenas son todas a dos manos, y soltaría el estandarte): el dueño
    creó la **Lanza del abanderado** (Buena, una mano, 130: Tipo 4, 1 dado, +1 de daño, Alcance +1, PdG +1; la Lanza corta mejorada), que la
    reemplaza. Vida 85, No2 8, PdG 11, Daño 9, Def 5, Def.Esp 2, Eva 8, Res.CC 16, Res.Esp 14.

- **L3 · Asesino de las sombras · Choque liviano** (boceto aprobado 2026-11-03, dueño: «reemplazá la trapera por el tajo, resto ok»). Acento en
  **Destreza y críticos** (la idea del dueño). Estrategia: desaparece, aparece por la espalda y busca el crítico; va al golpe único (el Sangrador gana
  desangrando). Atributos (Des/Agi/Con/Fue/Esp → vida, No2): nv1 11/9/6/5/2 → 30, 9 · nv2 12/9/7/6/2 → 35, 9 · nv3 13/10/7/7/2 → 35, 10 · nv4
  14/10/8/8/2 → 40, 10 · nv5 15/11/9/8/2 → 45, 11.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Ojo de asesino** (rápida) · **Bomba de humo** (lenta: Sigilo aunque lo miren, 3 casillas gratis) | — | **Punzón de hielo** (Tipo 4, +1 daño, Crítico potente +2) · Chaleco de cuero · Botas de suela de goma (Def 2, Def.Esp 1, Sigilo +1) |
  | 2 | **Finta** (rápida: no se puede parar) | **Ojo crítico** (+1 Crítico frecuente) | + 2 Comunes (guantes, capucha) |
  | 3 | **Puñalada por la espalda** | — | el arma, de Buena calidad |
  | 4 | **Tajo veloz** (+2 PdG, +2 de daño, Crítico frecuente +1) | **Paso ligero** | + **Ropas de sombra finas** (Buena: Def.Esp +2, Sigilo +2, Evasión +1) |
  | 5 | **Degollar** (+4 PdG, +7 de daño, +1/+1 a los críticos; termina su turno) | — | + una tercera pieza Buena |
  Consumible: Pergamino grupal de Paso Fantasma. Ojo: puede ser muy letal (críticos contra Evasión baja, como las ratas de la simulación del
  Encuentro 2): medirlo al definir cada nivel. **Nivel 1 en detalle** (2026-11-03): Punzón de hielo 1d4 + 6, ataque 2 No2; Ojo de asesino (rápida, cd 2, lo de un ataque) y Bomba de humo (lenta, cd 3, 3 No2); vida 30, 9 No2; Def 2, Def.Esp 1, Sigilo +1.
  **Nivel 2 aprobado** (dueño, 2026-11-09): Des 12 · Agi 9 · Con 7 · Fue 6 · Esp 2 → vida 35, 9 No2, PdG 13, Daño 6, Def 3, Def.Esp 1, Evasión 9; + Guantes
  de agarre y Capucha de emboscada (Sigilo +1); Finta y la pasiva Ojo crítico. **La Finta pierde los bonos de crítico** (dueño, 2026-11-09: se pisaba con el
  Ojo de asesino): queda +2 al daño y no se puede parar; es el golpe contra el que ataja bien, y el Ojo de asesino el que busca el crítico (también la
  usan L5 Duelista y L6 Patotero en su nivel 1). **Ajuste** (dueño, 2026-11-09, «+2 a la pdg, +1 al daño»): la Finta queda **+2 a la
  Probabilidad de Golpe y +1 al daño**, sin Parry ni Bloqueo, sin bonos de crítico (vale también para el Duelista y el Patotero). Ojo: el **Punzón de hielo** tiene en el catálogo **Crítico frecuente +1** (el plan decía Crítico potente +2).
  **Nivel 3 aprobado** (dueño, 2026-11-09: «me cierra»): Des 13 · Agi 10 · Con 7 · Fue 7 · Esp 2 → vida 35, 10 No2, PdG 15, Daño 7, Def 3,
  Def.Esp 1, Evasión 10; el arma pasa a Buena: **Puñal de sombra** (Tipo 4, PdG +1, Crítico potente +4, por la espalda en sigilo +2 PdG y +2 de daño)
  en lugar del Punzón de hielo; habilidad nueva **Puñalada por la espalda**; sin pasiva nueva. Combo: Bomba de humo → Puñalada desde el sigilo
  (PdG 19, 2 dados + 9, Crítico frecuente +2 y potente +4). Muy letal contra Evasión baja: medirlo en la ronda de balance.
  **Nivel 4 aprobado** (dueño, 2026-11-09: «me gusta con Dash»): Des 14 · Agi 10 · Con 8 · Fue 8 · Esp 2 → vida 40, 10 No2, PdG 16, Daño 8,
  Def 1, Def.Esp 3, Evasión 11, Sigilo +4; **Ropas de sombra finas** (Buena: Def.Esp +2, Sigilo +2, Evasión +1) en lugar del Chaleco de cuero;
  pasiva **Paso ligero**. Habilidad nueva: **Dash** en lugar del Tajo veloz del plan, que se pisaba con la Finta nueva (+2 PdG, +1 al daño): el Dash
  atraviesa a un rival y lo deja del otro lado, a su espalda, y también le sirve para escapar.
  **Nivel 5 aprobado — línea L3 completa** (dueño, 2026-11-09: «me cierra el asesino nivel 5»): Des 15 · Agi 11 · Con 9 · Fue 8 · Esp 2 → vida 45,
  11 No2, PdG 17, Daño 8, Def 1, Def.Esp 3, Evasión 12, Sigilo +5; tercera Buena: **Bombacha de cuatrero** (piernas: Retirada limpia 50 %, Sigilo +1);
  habilidad nueva **Degollar** (lenta, cd 4: +4 PdG, +7 de daño, Crítico frecuente +1 y potente +3; termina su turno, pasa al final del orden y
  queda Expuesto). **Muy letal, para estudiar en la ronda de balance:** Degollar por la espalda saliendo del sigilo llega a PdG 25 y 1 dado + 17
  de daño (ver `pendientes.md`).

- **D2 · Tóxico · Debuffer** (boceto aprobado 2026-11-03, dueño: «el tóxico va bien»). Estrategia: envenena el aire (nubes, espinas, miasma): el
  grupo se tiene que mover o se pudre adentro, y no se cura del todo. Atributos (Esp/Con/Agi/Des/Fue → vida; algo de Des por el Rango): nv1
  12/8/6/5/2 → 40 · nv2 14/9/6/5/2 → 45 · nv3 15/9/7/6/2 → 45 · nv4 17/10/7/6/2 → 50 · nv5 18/10/8/7/2 → 50.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Espina tóxica** (rápida) · **Nube tóxica** (lenta) | — | **Varita de miasma** (alcanza también a sus aliados) + **Piedra bezoar** (Res. tóxico +2, Veneno −1 stack) · Chaleco de cuero · Escarpines de piel de cururú (Def 2, Def.Esp 1, Res. tóxico +3) |
  | 2 | **Corroer** | **Puntería arcana** | + 2 Comunes |
  | 3 | **Maldición de la sequía** | — | la varita, de Buena calidad |
  | 4 | **Maldición tormentosa** | **Potencia especial** | + una Buena |
  | 5 | **Polen somnífero** (muy lenta) | — | + otra Buena |
  **Nivel 1 aprobado** (dueño, 2026-11-03): Esp 12 · Con 8 · Agi 6 · Des 5 · Fue 2, vida 40, 6 No2; Varita de miasma + Piedra bezoar · Chaleco de
  cuero · Escarpines de piel de cururú (Def 2, Def.Esp 1, Res. tóxico +3); Espina tóxica (rápida, cd 2, 1 No2) y Nube tóxica (lenta, cd 3, 1 No2).
  Consumible: **Polvo de adormidera** (en vez del Óleo venenoso, que no usaba: casi no ataca con arma). Sin cargar hasta que el dueño diga.
  **Nivel 2 aprobado y cargado** (dueño, 2026-11-10: «me cierra»): Esp 14 · Con 9 · Agi 6 · Des 5 · Fue 2; + Corroer y la pasiva Puntería arcana;
  + Polainas de cuero remendado y Casco de cuero endurecido (las 2 Comunes; protegerse de los golpes, como los magos). Con SP: vida 45, SP 42 (+7),
  PdG.Esp 15, Ef.Esp 14, Defensa 4, Def.Esp 1, Evasión 6, Res.CC 10, Res.Mt 14.
  **Nivel 3 aprobado y cargado** (dueño, 2026-11-10: «me cierra»): Esp 15 · Con 9 · Agi 7 · Des 6 · Fue 2 → vida 45, 7 No2, SP 45;
    + Maldición de la sequía; **la Varita de la ponzoña (Buena) reemplaza a la Varita de miasma** (un solo objetivo, no se esquiva y no alcanza a
    sus aliados; el área ya la da la Nube tóxica). PdG.Esp 16, Ef.Esp 15, Def 4, Evasión 7.
  **Nivel 4 aprobado y cargado** (dueño, 2026-11-10: «sí»): Esp 17 · Con 10 · Agi 7 · Des 6 · Fue 2; + Maldición tormentosa y la pasiva Potencia
    especial; **el Chaleco de kevlar (Buena) reemplaza al Chaleco de cuero**, por la regla del dueño para los magos: protegerlos del rango. Con SP:
    vida 55 (5 del chaleco), SP 51 (+8), PdG.Esp 18, Ef.Esp 18, Defensa 5 (7 contra armas a distancia), Evasión 7.
  **Nivel 5 aprobado y cargado** (dueño, 2026-11-10: «ok»): Esp 18 · Con 10 · Agi 8 · Des 7 · Fue 2; + Polen somnífero; **el Orbe de eco (Buena)
    reemplaza a la Piedra bezoar** (Ef.Esp +2: todo lo suyo se resiste contra su Ef.Esp). Con SP: vida 55, SP 56, PdG.Esp 19, Ef.Esp 21, Defensa 5
    (7 contra armas a distancia), Def.Esp 2, 8 No2, Evasión 8. **Línea D2 completa** (2026-11-10).
  **Dos reglas confirmadas por el dueño al probar la línea en el mapa** (cola 40, 2026-11-10, las dos con «SÍ»):
  - **Nube tóxica y el que ya está envenenado por otra cosa**: igual tira la resistencia cuando aparece la nube y, si pierde, recibe +3 stacks.
    El «+1 stack sin tirar» es solo para quien envenenó la misma nube.
  - **Las varitas** aplican el Veneno común de 4 stacks, **sumado** a los que el objetivo ya tiene (por ejemplo, 6 → 10).
- **Primera vuelta de la ronda (boceto de 1 a 5) completa** (2026-11-03): los 12 lugares tienen boceto; con nivel 1 aprobado en detalle: Escudero,
  Piromante, Sangrador, Sanador, Hachero, Maldito, Tirador, Mago de escarcha, Embestidor y Abanderado; con el nivel 1 en detalle también el Asesino de las sombras y el Tóxico (2026-11-03). Sigue la segunda vuelta (T2 Muralla con púas, …) según el orden de la ronda.

- **M3 · Mago del rayo · Mago** (boceto aprobado 2026-11-03, dueño: «me cierra como ruta»). Estrategia: el rayo salta (castiga al grupo que se
  junta) y paraliza: corta turnos. Atributos como el Mago de escarcha (Esp/Con/Agi/Des/Fue → vida): nv1 12/8/5/6/2 → 40 · nv2 14/9/5/6/2 → 45 ·
  nv3 16/9/6/6/2 → 45 · nv4 17/10/6/7/2 → 50 · nv5 19/10/7/7/2 → 50.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Centella** · **Zap** (las dos lentas: no hay rayo rápido) | — | Varita de chispa eléctrica + Escudo de escamas de lagarto · Chaleco de cuero · Anillo de chispa |
  | 2 | **Parpadeo** (rápida) | **Potencia especial** | + 2 Comunes |
  | 3 | **Cadena de rayos** | — | la varita: **Varita del relámpago** (Buena) |
  | 4 | **Descarga arcana** | **Temple mágico** | el escudo: **Escudo de lenga del monasterio** (Buena) |
  | 5 | **Tormenta arcana** (arcana, a revisar) | — | + una Buena de torso |
  Consumible: Poción de SP menor.
  - **Zap y Centella: la Parálisis se resiste con Res.CC** (programado 2026-11-03; dueño: «el 1d4 no se esquiva, pero la parálisis sí se resiste con resistencia al crowd
    control»; antes Res.Esp). Los creeps que ya la tienen se ponen al día solos.

- **M3 · Mago del rayo, nivel 1 aprobado** (2026-11-03): Esp 12 · Con 8 · Agi 5 · Des 6 · Fue 2, vida 40, 5 No2; Varita de chispa eléctrica +
  Escudo de escamas de lagarto · Chaleco de cuero · Anillo de chispa (Def 3, Def.Esp 1, +2 eléctrico); Centella (lenta, cd 4, 2 No2) y Zap (lenta,
  cd 3, 2 No2), las dos con la Parálisis contra Res.CC. Consumible: Poción de SP menor.
  **Nivel 2 aprobado** (dueño, 2026-11-12: «dejalo así»): Esp 14 · Con 9 · Agi 5 · Des 6 · Fue 2, vida 45, SP 42 (regen 7); + Capucha de lana del culto y
  Guantes de goma: Def 3, Def. especial 3, Ef.Esp 15. **Parpadeo** (Flash) y la pasiva **Potencia especial**. **Cargado** (2026-11-12). Pedido para la cola:
  la **Varita de chispa eléctrica** pasa a **20 % de Parálisis a todos los que toca** (el primero y los saltos).
  **Nivel 3 aprobado** (dueño, 2026-11-12: «me cierra»): Esp 16 · Con 9 · Agi 6 · Des 6 · Fue 2, vida 45, 6 No2, SP 48 (regen 8); la varita pasa a Buena:
  **Varita del relámpago** (1d8 que se esquiva, salta, 33 % de Parálisis a cada uno). PdG.Esp 16, Ef.Esp 17. Habilidad nueva: **Cadena de rayos**.
  **Cargado** (2026-11-12).
  **Nivel 4 aprobado** (dueño, 2026-11-12: «sí»): Esp 17 · Con 10 · Agi 6 · Des 7 · Fue 2, vida 50, SP 51; el escudo pasa a Buena: **Escudo de lenga del
  monasterio** (Res. eléctrica +2, Res. hielo +2). **Descarga arcana** y la pasiva **Temple mágico**. **Cargado** (2026-11-12).
  **Nivel 5 aprobado** (dueño, 2026-11-13: «me cierra así»): Esp 19 · Con 10 · Agi 7 · Des 7 · Fue 2, vida 60, 7 No2, SP 57; **Jubón de cuero tachonado**
  en lugar del Chaleco: Def 3, Def. especial 5. Habilidad nueva: **Tormenta arcana** (se queda la arcana como gran final). **Cargado** (2026-11-13).
  La línea M3 queda completa.
- **L2 · Envenenador · Choque liviano** (boceto y nivel 1 aprobados 2026-11-03, dueño: «me cierra como concepto… algunas cuestiones se superponen,
  lo vamos a ajustar nivel por nivel»; «va así»). Estrategia: cuerpo a cuerpo con una daga untada, acumula veneno, pega y se aleja. Atributos
  (Des/Agi/Con/Fue/Esp → vida, No2): **nv1 10/9/7/5/2 → 35, 9** · nv2 11/9/8/6/2 → 40, 9 · nv3 12/10/8/7/2 → 40, 10 · nv4 13/10/9/8/2 → 45, 10 ·
  nv4 13/11/9/7/2 → 45, 11 · nv5 14/12/10/7/2 → 50, 12 (dueño, 2026-11-07: sube Agilidad en vez de Fuerza).
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Estocada** (rápida: Perfora 2, +1 daño) · **Hoja envenenada** (lenta: Perfora 2, Veneno 3) | — | **Daga ritual** (Tipo 4, Veneno 2 siempre, Perfora 1; 1d4 + 5) · Chaleco de cuero · Guantes de agarre (Def 2, PdG +1) |
  | 2 | **Tajo veloz** | **Escurridizo** (dueño, 2026-11-07: en lugar de Perforante, que se pisaba con la Estocada) | + Zuecos de boticario · Calzas de escapista |
  | 3 | **Golpe a la rodilla** | — | la daga: **Daga de la viuda verde** (Buena, Veneno 3 siempre) |
  | 4 | **Hit and run** | **Pies ligeros** | + **Chaqueta del corredor** (Buena) |
  | 5 | **Ráfaga de cortes** (efectos del arma ×3) | — | + **Anillo del pantano** (Buena) |
  Consumible: Óleo venenoso. Ojo: Larry es inmune al veneno.
  **nv2 aprobado y cargado (2026-11-07):** Des 11 · Agi 9 · Con 8 · Fue 6 · Esp 2. Equipo: Daga ritual · Chaleco de cuero · Guantes de agarre ·
  **Zuecos de boticario** · **Calzas de escapista** (Evasión +2 solo contra el ataque de oportunidad, automatizado: el mismo stat que las Botas de
  mensajero). Habilidades: Estocada · Hoja envenenada · **Tajo veloz**. Pasiva: **Escurridizo**. Consumible: Óleo venenoso.

- **Regla nueva (dueño, 2026-11-03): el Flash de un creep en turno ajeno cuesta un 50 % más de cooldown** (para abajo, mínimo +1), no el doble; el
  SP y la vida siguen al doble. Programado.
- **S3 · Armero · Support** (boceto y nivel 1 aprobados 2026-11-03). Estrategia: el herrero del grupo: les mejora las armas a los suyos (elementos,
  bendición, perforar, crítico) y pelea al lado. Atributos (Con/Fue/Des/Agi/Esp → vida, No2): **nv1 10/8/6/6/3 → 50, 6** · nv2 11/9/7/6/3 → 55, 6 ·
  nv3 12/9/7/7/4 → 60, 7 · nv4 13/10/8/7/4 → 65, 7 · nv5 14/11/8/8/4 → 70, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Bendecir el arma** (rápida, Flash, 0 No2) · **Arma elemental** (lenta, 2 No2, su ataque del turno) | — | **Hacha del herrero de pueblo** (Tipo 8, Parry +1, Rompe armadura 33 %; 1d8 + 8) · Chaleco de cuero · Cofia de anillas sueltas (Def 3, Def.Esp 1) |
  | 2 | **Armas perforantes** | **Piel curtida** | + 2 Comunes |
  | 3 | **Ojo certero** | — | el arma: **Martillo de herrero** (Buena) |
  | 4 | **Potencia** (rápida, Flash) | **Desvío hábil** (+1 Parry) | + un torso Bueno |
  | 5 | **Señalar la presa** | — | + un yelmo Bueno |
  Consumible: Pergamino grupal de Furia de Combate. Ojo: el Arma elemental sobre un aliado que ya pega fuerte puede ser mucho en nivel 1.
  - **Nivel 2 aprobado (dueño, 2026-11-13: «va»)**: atrib [11, 9, 6, 7, 3] (con, fue, agi, des, esp); + Botas de caña alta de estanciero y Guantes de
    cuero grueso; Armas perforantes; Piel curtida. Vida 55, No2 6, Defensa 6, Def.Esp 2, PdG 7, Dmg 9, Parry 8, Bloqueo 9, Evasión 6. Sin SP (espera de turnos).
  - **Nivel 3 aprobado (dueño, 2026-11-14: «el armero nivel 3 está ok»)**: atrib [12, 9, 7, 7, 4]; el Martillo de herrero (Buena) en lugar del
    hacha; Ojo certero. Vida 60, No2 7, Defensa 6, Def.Esp 2, PdG 7, daño 1d10 + 10, Parry 8, Bloqueo 10, Evasión 7.
  - **Nivel 4 aprobado (dueño, 2026-11-14: «va así»)**: atrib [13, 10, 7, 8, 4]; la Coraza de hierro batido (Buena) en lugar del Chaleco de cuero;
    Potencia; Desvío hábil. Vida 65, No2 7, Defensa 9, Def.Esp 2, PdG 8, daño 1d10 + 11, Parry 10, Bloqueo 11, Evasión 7.
  - **Niveles 2, 3 y 4: falta cargarlos** en `comun/creeps-esenciales.js` (con su prueba en `comun/pruebas.html`), cuando no haya un ayudante tocando esos archivos.

- **W2 · Berserker · Warrior** (boceto aprobado 2026-11-03; dueño: «me cierra como ruta», con Fue −2 y Des +2, espadas en vez del hacha y la
  poción de regeneración chica). Estrategia: cuanto más herido, más peligroso; espadachín de dos armas que busca el crítico. Atributos
  (Fue/Con/Agi/Des/Esp → vida, No2): **nv1 8/9/6/8/2 → 45, 6** · nv2 9/10/6/9/2 → 55 (con Robustez), 6 · nv3 10/11/7/9/2 → 60, 7 ·
  nv4 11/12/7/10/2 → 75, 7 · nv5 12/13/8/10/2 → 80, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Golpe desesperado** (cd 2) · **Furia** (cd 3) | — | **Sable del tahúr** (Crítico frecuente +1) + **Facón de paisano** (Sangrado 25 %) · Chaleco de cuero · Botas de cuero de vaca |
  | 2 | **Pegar fuerte** (la habilidad que antes se llamaba «Golpe fuerte») | **Robustez** (+5 de vida) | + 2 Comunes |
  | 3 | **Aguante** | — | el sable: **Espada del Jefe de los Mil Caminos** (Buena: Crítico potente +3, Sangrado 33 %) + el Facón |
  | 4 | **Golpe brutal** | ~~Voluntad de hierro~~ → **Regeneración** (dueño, 2026-11-07) | + una pieza Buena |
  | 5 | **Barrido** | — | el facón: **Espada larga** (Buena: PdG +1, Crítico potente +2) |
  Consumible: **Poción de Regeneración menor** (nueva en el catálogo, 2026-11-03: 5 de vida por turno, 3 turnos). Dos armas (dueño): el primer
  ataque con cada arma cuesta la mitad, como un primer ataque del turno, y una puede ser mejor para atajar y la otra para pegar. **En los creeps
  eso no estaba programado**; **hecho el 2026-11-03** (eligen con qué arma atacan), y desde el 2026-11-07 los bonos de cada arma cuentan solo con
  esa arma (el PdG, el crítico, el daño; el Parry y el Bloqueo, con la pieza que ataja; la Iniciativa, siempre), como los personajes.
  **Nivel 1 aprobado** (dueño, 2026-11-03: «me cierra»): Fue 8 · Con 9 · Agi 6 · Des 8 · Esp 2, vida 45, 6 No2; Sable del tahúr (1d6 + 8,
  Crítico frecuente +1) + **Facón de paisano, que pasa a Tipo 4** en el catálogo (1d4 + 8; y Sangrado 50 %, 55 de oro, dueño 2026-11-03) · Chaleco de cuero · Botas de cuero de
  vaca: Def 3, Def.Esp 0. Golpe desesperado (cd 2, con el sable) y Furia (cd 3, 2 No2). Consumible: Poción de Regeneración menor. Espada y facón
  (6 + 4) del nivel 1 al 4: con las dos gasta 5 y le sobra 1; dos espadas (6 + 6) en el 5, con 8 No2. Sin cargar hasta que el dueño diga.
  **nv2 aprobado y cargado (2026-11-07):** Fue 9 · Con 10 · Agi 6 · Des 9 · Esp 2. Equipo: Sable del tahúr + Facón de paisano · Chaleco de cuero ·
  Botas de cuero de vaca · + **Casco de cuero endurecido** · + **Anillo maldito del berserker** (Daño +2 · Vida −5). Habilidades: Golpe desesperado ·
  Furia · + **Pegar fuerte**. Pasiva: **Robustez** (+5 de vida). Consumible: Poción de Regeneración menor. Vida **50** (no 55 como decía el plan:
  la Robustez compensa el −5 del Anillo maldito) · No2 6 · Def 4 · PdG 9 · Daño 11.
  **nv3 aprobado y cargado (2026-11-07):** Fue 10 · Con 11 · Agi 7 · Des 9 · Esp 2. Sube Agilidad y no Destreza (dueño: «más allá de la evasión
  y la iniciativa, me importan los nitros de la agilidad»; en el nv4 le sube un punto de Destreza). Equipo: el sable sale y entra la **Espada del
  Jefe de los Mil Caminos** (Buena: Tipo 6, 1 dado, +2 de daño, **Crítico potente +6** —en el catálogo es +6, no +3 como decía el plan—, Sangrado
  33 %) · Facón de paisano · Chaleco de cuero · Botas de cuero de vaca · Casco de cuero endurecido · Anillo maldito del berserker. Habilidades:
  Golpe desesperado · Furia · Pegar fuerte · + **Aguante**. Pasiva: Robustez. Consumible: Poción de Regeneración menor. Vida 55 · No2 7 · Def 4 ·
  PdG 9 · Daño 12 · Eva 7 · Ini 7 · Mov 7.
  **nv4 aprobado y cargado (2026-11-07):** Fue 11 · Con 12 · Agi 7 · Des 10 · Esp 2 (el punto de Destreza prometido). Equipo: el Chaleco sale y
  entran las **Pieles erizadas del berserker** (Buena: Def +2 · Def.Esp +1 · Vida +10 · Res. hielo +1 · Espinas, ¼ del golpe cuerpo a cuerpo) ·
  Espada del Jefe de los Mil Caminos · Facón de paisano · Botas de cuero de vaca · Casco de cuero endurecido · Anillo maldito del berserker.
  Habilidades: … · + **Golpe brutal**. Pasivas: Robustez · + **Regeneración** (3 de vida por turno) **en lugar de Voluntad de hierro**, elección del
  dueño (2026-11-07: «la nueva pasiva quiero que sea regeneración»). Consumible: Poción de Regeneración menor. Vida 70 · No2 7 · Def 4 ·
  Def.Esp 1 · PdG 10 · Daño 13 · Res.CC 12. La Regeneración de una pasiva ya la cobraban los creeps al empezar su turno
  (`comun/creep-acciones.js`, «Pasivas: +3 HP»); probado en el mapa.
  **nv5 aprobado y cargado (2026-11-08) — W2 completo:** Fue 12 · Con 13 · Agi 8 · Des 10 · Esp 2. Equipo: el Facón sale y entra la **Espada larga**
  (Buena: Tipo 6, 1 dado, PdG +1, Crítico potente +6) como segunda arma, ya con los bonos por arma (dueño: «va la espada del berserker»):
  Espada del Jefe de los Mil Caminos · Espada larga · Pieles erizadas del berserker · Botas de cuero de vaca · Casco de cuero endurecido · Anillo
  maldito del berserker. Habilidades: … · + **Barrido**. Pasivas: Robustez · Regeneración. Consumible: Poción de Regeneración menor. Vida 75 ·
  No2 8 · Def 4 · Daño 14 · Eva 8 · **PdG 10 con la Espada del Jefe, 11 con la Espada larga** (probado en el mapa: «Atacar con…» 1d10 y 1d10+1).

- **D3 · Ladrón de fuerzas · Debuffer** (boceto aprobado 2026-11-03, dueño: «lo apruebo así»). Estrategia: le saca al rival lo que necesita para
  pelear (los No2, la puntería, las curas, las bendiciones) y se queda con parte; elige al que más hace y lo deja sin aire. Atributos
  (Esp/Con/Agi/Des/Fue → vida, No2; un punto más de Agi que los otros debuffers, por los No2): **nv1 12/8/7/4/2 → 40, 7** · nv2 14/9/7/4/2 → 45, 7 ·
  nv3 15/9/8/5/2 → 45, 8 · nv4 17/10/8/5/2 → 50, 8 · nv5 18/10/9/6/2 → 50, 9.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Escalofrío** (rápida) · **Robar el aliento** (lenta) | — | **Varita arcana** · 2 piezas Comunes de Def. especial |
  | 2 | **Sanguijuela** | **Puntería arcana** | + 2 Comunes |
  | 3 | **Mal de ojo** (Flash, 5 SP, el doble en turno ajeno; reemplaza a Extenuar, dueño 2026-11-03) | — | la varita, de Buena calidad |
  | 4 | **Disipar** | **Largo alcance arcano** | + una Buena |
  | 5 | **Maldición tormentosa** (también la tiene el Tóxico en nv4) | — | + otra Buena |
  Consumible: **Gas adormecedor** (Cansado 2 turnos, nube de 3 turnos). **Sanguijuela con regla nueva** (dueño, 2026-11-03): ya no bloquea la
  cura: toda cura que recibe el portador se la lleva quien la lanzó (con la vida llena, como vida extra); también pasa al Debuffer de clase; si quien la lanzó está caído o no está en el mapa, la cura se pierde (dueño).
  **Nivel 1 aprobado** (dueño, 2026-11-03), **con SP**: Esp 12 · Con 8 · Agi 7 · Des 4 · Fue 2, vida 40, 7 No2, 38 SP (recupera 6 por turno);
  Varita arcana + Grimorio gastado (PdG.Esp +1, SP +2) · Chaleco de cuero · Vincha de cuero de mula ánima: Def 2, Def.Esp 1. Escalofrío (1 No2,
  1 SP) y Robar el aliento (2 No2, 3 SP), que **pasa a sacar 1 No2 + la diferencia** (dueño, mismo día; programado). Con SP puede repetir
  habilidades en el turno: «lo dejamos así». Consumible: Gas adormecedor. Sin cargar hasta que el dueño diga.

- **R2 · Hostigador a distancia · Rango** (boceto aprobado 2026-11-03, dueño: «me cierra la ruta», con Agi 9 · Des 10). Estrategia: dispara y se
  va; nunca está donde lo dejaste; al que lo persigue lo empuja, lo frena o lo deja rengo. Atributos (Agi/Des/Con/Fue/Esp → vida, No2):
  **nv1 9/10/7/5/2 → 35, 9** · nv2 9/11/8/6/2 → 40, 9 · nv3 10/12/8/7/2 → 40, 10 · nv4 10/13/9/8/2 → 45, 10 · nv5 11/14/10/8/2 → 50, 11.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Tiro certero** (rápida; también la tiene el Tirador) · **Disparo y repliegue** (lenta) | — | **Arco de tiro ligero** (Encadenar, Racha) · 2 Comunes livianas |
  | 2 | **Mantener a raya** | **Pies ligeros** (+1 Eva) | + 2 Comunes |
  | 3 | **Tiro a la rodilla** (de la línea del Trabador) | — | el arco: **Arco de la sombra** (Buena) |
  | 4 | **Disparo señalador** (también el Tirador, nv4) | **Prisa** | + una Buena |
  | 5 | **Ráfaga encadenada** | — | + otra Buena |
  Consumible: **Flecha silbadora** (lo baja 1 lugar en el orden de turnos).
  **Nivel 1 aprobado** (dueño, 2026-11-03): Agi 9 · Des 10 · Con 7 · Fue 5 · Esp 2, vida 35, 9 No2; Arco de tiro ligero · Chaleco de cuero ·
  Escarpines de fieltro (Eva +1): Def 2, Def.Esp 0. Tiro certero (rápida, cd 2) y **Disparo y repliegue con el orden al revés: primero se mueve
  hasta 2 casilleros gratis y sin oportunidad, después dispara con +2 al daño** (dueño, mismo día; en programación). Consumible: Flecha silbadora.
  Sin cargar hasta que el dueño diga.
  **Nivel 2 aprobado** (dueño, 2026-11-09: «me cierra el hostigador»): Des 11 · Agi 9 · Con 8 · Fue 6 · Esp 2; + Guantes de agarre (PdG +1) y Cofia
  de anillas sueltas (Def +1, Def.Esp +1, Res. crít. T4 +1); Mantener a raya (empuja 2 y Lento 2 turnos) y Pies ligeros. Vida 40, No2 9, PdG 12,
  Daño 6, Def 3, Def.Esp 1, Eva 11. Programado (R22 en la prueba de niveles).
  **Nivel 3 aprobado** (dueño, 2026-11-09: «me cierra»): Des 12 · Agi 10 · Con 8 · Fue 7 · Esp 2; el arco pasa a **Arco de la sombra** (Buena:
  1 dado + 1 amplificado, Rango +4, Emboscada: Crítico frecuente +1, Espalda a distancia: +2 PdG y +1 de daño); habilidad nueva **Tiro a la
  rodilla** (Rengo 2 turnos). Vida 40, No2 10, PdG 13, Daño 7, Def 3, Def.Esp 1, Eva 12. Programado (R23 en la prueba de niveles).
  **Nivel 4 aprobado** (dueño, 2026-11-09, con dos cambios sobre la propuesta: «el punto que le pusiste a constitución, yo se lo pondría a
  agilidad» y «la pasiva que sea escurridizo», en lugar de Prisa): Des 13 · Agi 11 · Con 8 · Fue 8 · Esp 2; el torso pasa a **Chaleco de kevlar**
  (Buena: Def +3, +2 contra armas a distancia, Res. crít. T4 +1, Vida +5, Res. fuego +1); habilidad nueva **Disparo señalador** (Presa y
  Marcado 2 turnos); pasiva **Escurridizo**. Vida 45, No2 11, PdG 14, Daño 8, Def 4 (6 contra armas a distancia), Def.Esp 1, Eva 13, Ini 11,
  Mov 11. Programado (R24 en la prueba de niveles).
  **Nivel 5 aprobado** (dueño, 2026-11-09: «me cierra el nivel cinco»): Des 14 · Agi 12 · Con 9 · Fue 8 · Esp 2 (otra vez Agilidad antes que
  Constitución); los guantes pasan a **Guantes de cetrero** (Buena: PdG a distancia +2, Percepción +1); habilidad nueva **Ráfaga encadenada**.
  Vida 50, No2 12, PdG 14 (16 con el arco), Daño 8, Def 4 (6 contra armas a distancia), Eva 14, Ini 12, Mov 12. Programado (R25 en la prueba de
  niveles). **Línea R2 completa.**

- **M4 · Arcano · Mago, con SP** (boceto aprobado 2026-11-03, dueño: «me cierra como ruta»). Estrategia: control y movilidad: decide dónde
  está cada uno (aparece, empuja, atrae, manda por un portal, atraviesa en línea); en nv5, la Tormenta arcana. Atributos (Esp/Con/Agi/Des/Fue →
  vida, No2, SP): **nv1 12/8/6/5/2 → 40, 6, 36** · nv2 14/9/6/5/2 → 45, 6, 42 · nv3 15/9/7/6/2 → 45, 7, 45 · nv4 17/10/7/6/2 → 50, 7, 51 ·
  nv5 18/10/8/7/2 → 50, 8, 54.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Parpadeo** (Flash, 4 SP; dueño 2026-11-03) · **Nova arcana** | — | **Varita del gancho** + un talismán Común · 2 Comunes |
  | 2 | **Lanza arcana** | **Largo alcance arcano** | + 2 Comunes |
  | 3 | **Portal trampa** | — | la varita o el talismán, de Buena calidad |
  | 4 | **Andanada arcana** | **Puntería arcana** | + una Buena |
  | 5 | **Tormenta arcana** | — | + otra Buena |
  Consumible: Poción de SP menor. Parpadeo también lo tienen M2 y M3 (nv2).
  **Nivel 1** (2026-11-03, dueño: «no hay que cambiar nada»): Esp 12 · Con 8 · Agi 6 · Des 5 · Fue 2, vida 40, 6 No2, 36 SP (recupera 6);
  Varita del gancho + **Brújula del baqueano** (Ini +2 desde el 2026-11-03, sin lo de la niebla; primer casillero gratis) · Chaleco de cuero ·
  Zapatillas de lona (Eva +1, Def.Esp +1, Ini −1): Def 2, Def.Esp 1, Eva +1, Ini +1. Parpadeo (4 SP) y Nova arcana (2 No2, 3 SP). Consumible:
  Poción de SP menor. Dos maneras de jugarlo, sin cambiar nada: «entra, explota y sale» (Parpadeo + Nova + Parpadeo, 11 SP) o «gancho al que
  está lejos» (lo trae y Nova). Sin cargar hasta que el dueño diga.

- **H2 · Saltador · Híbrido** (boceto aprobado 2026-11-03, dueño: «me cierra como ruta»). Estrategia: cae en el medio y barre: salta por encima de
  la primera línea, se planta entre los de atrás y le pega a todos los que lo rodean. Atributos (Fue/Con/Des/Agi/Esp → vida, No2): **nv1 9/9/7/6/2 →
  45, 6** · nv2 10/10/7/7/2 → 50, 7 · nv3 11/11/8/7/2 → 55, 7 · nv4 12/12/8/8/2 → 65 (Robustez), 8 · nv5 13/13/9/8/2 → 65, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Salto** (lenta) · **Golpe fuerte** (rápida) | — | **Hacha de vikingo** (renombrada, era «de cotillón vikingo») + escudo Común · 2 Comunes |
  | 2 | **Barrido** | **Piel curtida** | + 2 Comunes |
  | 3 | **Pisotón** | — | el hacha: **Hacha del aserrador** (Buena) |
  | 4 | **Aguante** | **Robustez** | + una Buena |
  | 5 | **Salto aplastante** | — | + otra Buena |
  Consumible: Poción de Cuero Duro. Dos al hilo no entra: con Tipo 8 el segundo golpe no le alcanza con 6 No2. (Ya no vale desde el 2026-11-10: el segundo golpe no cobra No2.)
  **Nivel 1 aprobado** (dueño, 2026-11-03: «va»): Fue 9 · Con 9 · Des 7 · Agi 6 · Esp 2, vida 45, 6 No2, con turnos de espera; Hacha de vikingo
  (Tipo 8, 1d8 + 9; desde el 2026-11-03: +1 de daño y Rompe armadura 50 %, sin Derribar) + Rodela tachonada · Chaleco de cuero · Botas de cuero de vaca: Def 4, Def.Esp 1, Res.
  crít. T4 +2. Salto (lenta, cd 3) y Golpe fuerte (rápida, cd 2). Consumible: Poción de Cuero Duro. Sin cargar hasta que el dueño diga.
  **Nivel 2 aprobado y cargado** (dueño, 2026-11-08: «lo del saltador me parece bien»): Fue 9 · Con 10 · Des 8 · Agi 7 · Esp 2 (un punto de Fuerza
  pasó a Destreza; dueño: «le subiría un poco de destreza… pero no agilidad»), vida 50, 7 No2, PdG 8, Daño 9, Def 7, Def.Esp 1, Eva 7, Res.CC 11.
  + **Casco de cuero endurecido** y **Polainas de cuero remendado** (Def +1, Res.CC +1). Habilidad nueva: **Barrido** (rehecho el mismo día: un
  ataque completo por rival, ver `guia-de-diseno.md`). Pasiva: **Piel curtida**. «Golpe fuerte» del plan es hoy «Pegar fuerte».
  **Nivel 3 aprobado y cargado** (dueño, 2026-11-08): Fue 10 · Con 11 · Des 9 · Agi 7 · Esp 2, vida 55, 7 No2, PdG 9, Daño 10 con 2 dados.
  El hacha pasa a la **Hacha del aserrador** (Buena: Tipo 8, 2 dados, Rompe armadura 33 %, Derribar 25 %). Habilidad nueva: **Pisotón** (Flash).
  **Nivel 4 aprobado y cargado** (dueño, 2026-11-08: «vamos con la coraza»): Fue 11 · Con 12 · Des 9 · Agi 8 · Esp 2, vida 75, 8 No2, PdG 9, Daño 11,
  Def 9 (+3 contra el primer golpe de cada turno), Eva 8, Res.CC 14. El torso Bueno es la **Coraza de primera línea** (Def +4, +3 contra el primer
  golpe del turno, Res.CC +1, Vida +10) en lugar del Chaleco de cuero; las Pieles erizadas se descartaron para que no se parezca al Berserker.
  Habilidad nueva: **Aguante** (los dados se descargan también con las habilidades de ataque; en el Barrido, solo al primer rival). Pasiva: **Robustez**.
  **✅ Línea completa (2026-11-08). Orden nuevo de las habilidades** (dueño, 2026-11-08: «nivel 2 va a entrar pisotón. Nivel 3 aguante. Nivel 4
  dash. Nivel 5 barrido»): nv1 **Salto** y **Pegar fuerte** · nv2 **Pisotón** · nv3 **Aguante** · nv4 **Dash** · nv5 **Barrido** (el Salto aplastante
  del plan no entra: el Dash le da la salida). Los niveles 2 a 4 se recargaron con ese orden; atributos, equipo y pasivas, como estaban.
  Estrategia: entra saltando por encima de la primera línea, pisotea y aguanta si lo rodean, sale con el Dash o saltando (el Salto puede caer en
  cualquier casilla libre y no atacar: paga 1 No2), y en el nv5 barre a todos los que lo rodean.
  **Nivel 5 aprobado y cargado** (dueño, 2026-11-08): Fue 12 · Con 13 · Des 10 · Agi 8 · Esp 2, vida 80, 8 No2, PdG 10, Daño 12 con 2 dados, Def 9,
  Res.CC 15. La tercera Buena: **Grebas del carnero** (en lugar de las Polainas: Def +1, Res.CC +1 y Embestida +2 —+2 PdG al primer ataque del turno
  si los últimos 2 pasos fueron en línea recta hasta el rival; regla del dueño: **el Salto y el Dash no cuentan como pasos**; en la cola de pruebas).
  Habilidad nueva: **Barrido**.

- **S4 · Protector · Support, con SP** (boceto aprobado 2026-11-03, dueño: «la ruta me cierra, me resulta interesante»). Estrategia: juega en el
  turno de los demás: protege a sus aliados con Flash en el momento justo (escudo, +3 a la defensa, sacar un estado) y desvía los golpes. Atributos
  (Esp/Con/Agi/Des/Fue → vida, No2, SP): **nv1 12/9/6/4/2 → 45, 6, 36** · nv2 13/10/6/5/2 → 50, 6, 39 · nv3 15/10/7/5/2 → 50, 7, 45 ·
  nv4 16/11/7/6/2 → 55, 7, 48 · nv5 18/11/8/6/2 → 55, 8, 54.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Potencia** (Flash; la ex «Empuje», renombrada por el dueño: el Empower) · **Arrojo** (Flash) | — | una varita + escudo Común · 2 Comunes |
  | 2 | **Coraza de púas** (también la Muralla T2) | **Largo alcance arcano** | + 2 Comunes |
  | 3 | **Velo espejado** (también la Muralla T2) | — | el escudo, de Buena |
  | 4 | **Purificar** (Flash) | **Potencia especial** | + una Buena |
  | 5 | **Tirar la bronca** | — | + otra Buena |
  Consumible: Poción de HP. **Sin Transfusión sanguínea** (dueño eligió la opción A, 2026-11-03); la Transfusión quedó en el pool de creep del
  Support y del Debuffer para otros.
  **Nivel 1 aprobado** (dueño, 2026-11-03: «vamos así»): Esp 12 · Con 9 · Agi 6 · Des 4 · Fue 2, vida 45, 6 No2, 36 SP (recupera 6); Varita de
  los pilares + Escudo de madera forrado en lienzo · Chaleco de cuero · Escarpines de piel de cururú: Def 3, Def.Esp 2. Potencia (Flash, 2 SP) y
  Arrojo (Flash, 3 SP). Consumible: Poción de HP. Sin cargar hasta que el dueño diga.

- **L4 · Hostigador con trampas · Choque liviano** (boceto aprobado 2026-11-03, dueño: «me cierra como ruta, después lo vamos a ir viendo en detalle
  uno a uno»). Estrategia: pica, se va y te hace pisar algo: deja una trampa en el camino, pega y se aleja por arriba de ella; el que lo persigue
  cae. (Se le sumaron las trampas para no repetir al R2 Hostigador a distancia.) Atributos (Des/Agi/Con/Fue/Esp → vida, No2): **nv1 10/8/7/6/2 →
  35, 8** · nv2 11/8/8/7/2 → 40, 8 · nv3 12/9/8/8/2 → 40, 9 · nv4 13/9/9/9/2 → 45, 9 · nv5 14/10/10/9/2 → 50, 10.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Cordón oculto** (rápida; desde el 2026-11-03: tropieza y avanza una, Agilidad contra su Destreza, si pierde Sentado y sin moverse el resto del turno) · **Hit and run** (lenta; también el Envenenador nv4) | — | **Cortaplumas** (Tipo 4, +1 daño, Ini +2) · 2 Comunes livianas |
  | 2 | **Tajo veloz** (también Envenenador nv2 y Asesino nv4) | **Pies ligeros** | + 2 Comunes |
  | 3 | **Abrojos** | — | el arma, de Buena |
  | 4 | **Polvo cegador** | **Puntería** | + una Buena |
  | 5 | **Dash** | — | + otra Buena |
  Consumible: Red de caza.
  **Nivel 1 aprobado** (dueño, 2026-11-03: «ya terminamos el L4»): Des 10 · Agi 8 · Con 7 · Fue 6 · Esp 2, vida 35, 8 No2, turnos de espera;
  Cortaplumas (Tipo 4, 1d4 + 7, Ini +2) · Chaleco de cuero · Calzas de cuero flexible: Def 2, Def.Esp 0, Eva +1. Cordón oculto (rápida, con la
  regla nueva: tropieza, avanza 1 y tira Agilidad contra su Destreza; si pierde, Sentado y Tropezado: no se mueve más ese turno) y Hit and run
  (lenta). Consumible: Red de caza. **Programado** en el pool esencial el 2026-11-03.
  **Nivel 2 aprobado** (dueño, 2026-11-09: «el hostigador con trampas me cierra»): Des 11 · Agi 8 · Con 8 · Fue 7 · Esp 2 → vida 40, 8 No2,
  PdG 11, Daño 7, Def 3, Eva 11; + Escarpines de fieltro (Eva +1) y Capucha de emboscada (Def +1, Sigilo +1); Tajo veloz (acá no se pisa con nada:
  el L4 no tiene la Finta); pasiva Pies ligeros. Cargado (`const L4`).
  **Nivel 3 aprobado y cargado** (dueño, 2026-11-09: «va así»): Des 12 · Agi 9 · Con 8 · Fue 8 · Esp 2 → vida 40, 9 No2, PdG 13, Daño 8 + 2 dados,
  Def 3, Eva 12, Ini 9 (pierde el Ini +2 del Cortaplumas); el arma Buena: **Aguja de corsario** (Tipo 4, 2 dados, PdG +1, Perfora 1; elegida sobre
  la Daga de Capitán por los 2 dados); habilidad nueva **Abrojos** (7 casillas, 2d6+2 y Rengo, quedan 3 turnos).
  **Nivel 4 aprobado y cargado** (dueño, 2026-11-09: «el hostigador va con los guantes»): Des 13 · Agi 9 · Con 9 · Fue 9 · Esp 2 → vida 45, 9 No2,
  PdG 15 (16 con la Aguja: los Guantes suman con punzantes, Tipo 4), Daño 9 + 2 dados, Def 3, Def.Esp 0, Eva 12, Ini 9. La Buena va en las manos
  (**Guantes del estoque**: PdG con punzantes +1, PdG en oportunidad +1) y se queda el Chaleco (la Capa del explorador bajaba la Defensa a 1).
  Habilidad nueva **Polvo cegador** (desde el 2026-11-09 se dispara en cualquiera de sus 7 casillas); pasiva **Puntería** (+1 PdG).
  **Nivel 5 aprobado y cargado — L4 completa** (dueño, 2026-11-09): Des 14 · Agi 9 · Con 10 · Fue 10 · Esp 2 → vida 50, 10 No2, PdG 16 (17 con
  la Aguja), Daño 9 + 2 dados, Def 4, Eva 12, Ini 10. La tercera Buena en los pies: **Botas del desertor** (Retirada limpia 50 %, Defensa +1)
  en lugar de los Escarpines; habilidad nueva **Dash**.

- **D4 · Control mental y ceguera · Debuffer, con SP** (boceto y nivel 1 aprobados 2026-11-03, dueño: «lo confirmo como ruta»; «va»). Estrategia:
  te saca el control: te ciega o te encandila (Destello, Cegar), te abre la mente (Punzada mental, −2 Res.Mt) y ahí te confunde, te asusta o te
  duerme (todo eso se resiste con Res.Mt). Con daño (dueño: «yo le pondría algún tipo de daño»). Atributos (Esp/Con/Agi/Des/Fue → vida, No2, SP):
  **nv1 12/9/6/4/2 → 45, 6, 36** · nv2 14/9/7/4/2 → 45, 7, 42 · nv3 15/10/7/5/2 → 50, 7, 45 · nv4 17/10/8/5/2 → 50, 8, 51 · nv5 18/11/8/6/2 → 55, 8, 54.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Punzada mental** (rápida, nueva: 1d4 arcano directo y Mente abierta) · **Cegar** (lenta) | — | **Varita del destello** + **Botella con un diablito** · Chaleco de cuero · Capucha de lana del culto |
  | 2 | **Confusión** | **Puntería arcana** | + 2 Comunes |
  | 3 | **Grito espeluznante** | — | la varita, de Buena |
  | 4 | **Tótem de silencio** | **Potencia especial** | + una Buena |
  | 5 | **Polen somnífero** | — | + otra Buena |
  **Nivel 1:** Esp 12 · Con 9 · Agi 6 · Des 4 · Fue 2, vida 45, 6 No2, 36 SP (recupera 6); Def 2, Def.Esp 1; todo su daño especial +2 (la
  Botella; si sale un 1 en los dados, se quema 2). Consumible: Polvo de adormidera. Sin cargar hasta que el dueño diga.

- **T3 · Guardaespaldas · Tanque** (boceto y nivel 1 aprobados 2026-11-03, dueño: «me cierra como ruta»; «me gusta, sí»). Estrategia: cuida a los
  suyos: marca a un protegido (mago, jefe, Sanador) y se come la mitad de lo que le pegan, salta a interponerse, provoca y voltea con el escudo.
  Atributos (Con/Des/Agi/Fue/Esp → vida, No2): **nv1 12/7/6/5/3 → 60, 6** · nv2 13/7/6/6/4 → 65, 6 · nv3 14/8/6/7/4 → 70, 6 · nv4 15/8/7/8/4 → 80
  (Robustez), 7 · nv5 16/9/7/9/4 → 85, 7.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Provocar** (rápida) · **Escudo humano** (lenta) | — | **Espada del comisario** (Tipo 6, PdG en contraataque +3) + **Escudo de hierro macizo** · **Coraza de cuero hervido** · **Capucha de lana del culto** |
  | 2 | **Golpe de escudo** (rápida) | **Guardia firme** | + 2 Comunes |
  | 3 | **Interponerse** (Flash) | — | el escudo, de Buena |
  | 4 | **Tirar la bronca** | **Robustez** | + una Buena |
  | 5 | **Desarmar** (Flash) | — | + otra Buena |
  **Nivel 1:** vida 60, 6 No2, turnos de espera; Def 5, Def.Esp 1, Res. crít. T4 +2, Bloqueo +1. Consumible: Poción de Cuero Duro. **Cargado** en el pool esencial (2026-11-03).
  Pedido del dueño: una animación del Escudo humano que muestre que el daño se reparte entre los dos (en diseño).
  **Nivel 2 aprobado** (dueño, 2026-11-10: «sí»): Con 13 · Des 7 · Agi 6 · Fue 6 · Esp 4, vida 65, 6 No2; + Botas de cuero de vaca y Guantes de
  pelea callejera: Def 7, Def. especial 1, Bloqueo 8, Parry 7, Res.CC 13. **Golpe de escudo** (rehecho el mismo día: 1d10 + el peso del escudo
  + Dmg, nunca crítico, cooldown 3 o 3 SP; con el Escudo de hierro macizo, 1d10 + 4 + 6) y la pasiva **Guardia firme**. **Cargado** (2026-11-10).
  **Nivel 3 aprobado** (dueño, 2026-11-10: «me cierra así»): Con 14 · Des 8 · Agi 6 · Fue 7 · Esp 4, vida 70, 6 No2; el escudo pasa a Buena:
  **Escudo de la guardia** (Guardián +1, Def +2, Bloqueo +1, peso 3): Def 7, Bloqueo 9, Parry 8, Res.CC 14. Habilidad nueva: **Interponerse**
  (Flash). **Cargado** (2026-11-10).
  **Nivel 4 aprobado** (dueño, 2026-11-11: «la consagrada va ok»): Con 15 · Des 8 · Agi 7 · Fue 8 · Esp 4, vida 80 (Robustez), 7 No2;
  **Coraza consagrada** (Buena) en lugar de la de cuero hervido: Def 6, Def. especial 3, Res.Esp 19, Res.Mt 8, Bloqueo 10. Habilidad nueva:
  **Tirar la bronca**. **Cargado** (2026-11-11).
  **Nivel 5 aprobado** (dueño, 2026-11-11: «sí»): Con 16 · Des 9 · Agi 7 · Fue 9 · Esp 4, vida 85, 7 No2; **Espada del herrero** (Buena, Tipo 6,
  2 dados, +1, Bloqueo +1, Romper armadura 20 %) en lugar de la del comisario: Bloqueo 12, Parry 9. Habilidad nueva: **Desarmar** (Flash).
  **Cargado** (2026-11-11). La línea T3 queda completa.

- **L5 · Duelista · Choque liviano** (boceto aprobado 2026-11-03, dueño: «me gusta»). Estrategia: el esgrimista del mano a mano: busca a uno, ataja y
  devuelve, amaga y entra por donde no ataja; gana el uno contra uno. Atributos (Des/Agi/Con/Fue/Esp → vida, No2): **nv1 11/8/7/5/2 → 35, 8** · nv2
  12/8/8/6/2 → 40, 8 · nv3 13/9/8/7/2 → 40, 9 · nv4 14/9/9/8/2 → 45, 9 · nv5 15/10/10/8/2 → 50, 10.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Finta** (rápida) · **Golpe a la rodilla** (lenta) | — | **Sable del club de barrio** + **Broquel de esgrima** · 2 Comunes livianas |
  | 2 | **Contraataque** (Flash) | **Guardia firme** (+1 Bloqueo) | + 2 Comunes |
  | 3 | **Estocada** | — | el sable, de Buena |
  | 4 | **Arte de la guerra** (Flash) | **Ojo crítico** | **Escudo triangular** (Buena) en lugar del broquel |
  | 5 | **Ráfaga de cortes** | — | + otra Buena |
  Consumible: Óleo venenoso.
  **Nivel 1 aprobado** (dueño, 2026-11-03): Des 11 · Agi 8 · Con 7 · Fue 5 · Esp 2, vida 35, 8 No2, turnos de espera; Sable del club de barrio
  (Tipo 6, 1d6 + 5, Parry +1, PdG en contraataque +1, Sangrado 25 %) + Broquel de esgrima (Parry +2) · Chaleco de cuero · Escarpines de fieltro:
  Def 2, Parry +3, Eva +1. **Más Bloqueo en la evolución** (dueño: «si tiene un Parry exitoso pero después no puede bloquear, baja su
  efectividad»): nv2 la pasiva es **Guardia firme** (+1 Bloqueo, en vez de Desvío hábil) y nv4 la pieza Buena es el **Escudo triangular** (Def +2,
  Res. crít. T4 +1, Bloqueo +1, Parry +1) en lugar del broquel. **Cargado** en el pool esencial (2026-11-03).
  **Nivel 2 aprobado** (dueño, 2026-11-11: «sí»): Des 12 · Agi 8 · Con 8 · Fue 6 · Esp 2, vida 40, 8 No2; + Guantes de esgrimista y Casco de
  cuero endurecido: Def 3, Parry 16, Bloqueo 7. **Contraataque** (Flash) y la pasiva **Guardia firme**. **Cargado** (2026-11-11).
  **Nivel 3 aprobado** (dueño, 2026-11-11: «sí»): Des 13 · Agi 9 · Con 8 · Fue 7 · Esp 2, vida 40, 9 No2; el sable pasa a Buena: **Sable del
  sargento** (Tipo 6, 2 dados, PdG en contraataque +2, Sangrado 25 %, Perfora 1): Parry 16, Bloqueo 8, Eva 10. Habilidad nueva: **Estocada**.
  **Cargado** (2026-11-11).
  **Nivel 4 aprobado** (dueño, 2026-11-11): Des 14 · Agi 9 · Con 9 · Fue 8 · Esp 2, vida 45, 9 No2; **Escudo triangular** en lugar del broquel: Def 5,
  Parry 16, Bloqueo 10. **Arte de la guerra** (Flash) y la pasiva **Ojo crítico**. Regla confirmada: puede atajar y bloquear con el escudo y
  contraatacar con el sable (dueño: «está bien»); el Bloqueo del escudo cuenta solo cuando ataja con el escudo. **Cargado** (2026-11-11).
  **Nivel 5 aprobado** (dueño, 2026-11-11: «sí»): Des 15 · Agi 10 · Con 10 · Fue 8 · Esp 2, vida 55, 10 No2; **Cota de malla fina** (Buena) en
  lugar del Chaleco: Def 8, Parry 17, Bloqueo 10. Habilidad nueva: **Ráfaga de cortes**. **Cargado** (2026-11-11). La línea L5 queda completa.

- **W3 · Martillero · Warrior** (boceto aprobado 2026-11-03, dueño: «me gusta», con un punto de Con a Des en cada nivel). Estrategia: golpes que
  atontan y derriban: te deja sin turno (Demora, Pajaritos, Sentado); desordena la pelea. Atributos (Fue/Con/Des/Agi/Esp → vida, No2): **nv1
  10/8/7/6/2 → 40, 6** · nv2 11/9/8/6/2 → 50 (Robustez), 6 · nv3 12/10/8/7/2 → 50, 7 · nv4 13/11/9/7/2 → 55, 7 · nv5 14/12/9/8/2 → 60, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Puño de roca** (rápida) · **Pisotón** (Flash, lenta) | — | **Martillo del herrero de pueblo** + escudo Común · 2 Comunes |
  | 2 | **Golpe fuerte** | **Robustez** | + 2 Comunes |
  | 3 | **Salto aplastante** | — | **Martillo de bola** (Buena, dos manos) |
  | 4 | **Golpe brutal** | **Voluntad de hierro** | + una Buena |
  | 5 | **Golpe demoledor** | — | + otra Buena |
  Consumible: Pergamino grupal de Furia de Combate.
  **Nivel 1 aprobado** (dueño, 2026-11-03: «sí»): Fue 10 · Con 8 · Des 7 · Agi 6 · Esp 2, vida 40, 6 No2, turnos de espera; Martillo del herrero de
  pueblo (Tipo 10, 1d10 + 10, Parry +1, Pajaritos 33 %) + Escudo de cuero endurecido · Chaleco de cuero · Botas de cuero de vaca: Def 5, Res. crít.
  T4 +2. Puño de roca (rápida) y Pisotón (Flash, lenta). **Cargado** en el pool esencial (2026-11-03).
  **Nivel 2 aprobado** (dueño, 2026-11-10: «para el martillero vamos con golpe que sigue»): **Dos al hilo** en lugar de Pegar fuerte (que ya
  tenían el Saltador, el Berserker y el Embestidor). Fue 11 · Con 9 · Des 8 · Agi 6 · Esp 2, vida 50 (con Robustez), 6 No2; + Casco de cuero
  endurecido y Pantalón acolchado de aprendiz: Def 7, Res. crít. T4 +4. El segundo golpe no cobra No2 (dueño, 2026-11-10: toda la habilidad
  cuesta lo de un solo ataque, como el Barrido): con el martillo de Tipo 10, 5 No2 por los dos golpes. **Cargado** en el pool esencial (2026-11-10).
  **Nivel 3 aprobado** (dueño, 2026-11-10: «al nivel 3 cargarlos con el guantelete»): Fue 12 · Con 10 · Des 8 · Agi 7 · Esp 2, vida 55, 7 No2;
  **Martillo de bola** (Buena, dos manos, 2 dados, Derribar 25 %) en lugar del martillo y el escudo; + **Guanteletes de cuero tachonado** (Def +1,
  Def. especial +1): Def 6, Def. especial 1, Bloqueo 12, Parry 8. Habilidad nueva: **Salto aplastante**. **Cargado** (2026-11-10).
  (**Golpe que sigue pasa a llamarse «Dos al hilo»**, dueño 2026-11-10.)
  Martillo de bola: Parry +1 y Bloqueo +1 (dueño, 2026-11-10): el nv3 queda con Parry 9 y Bloqueo 13.
  **Nivel 4 aprobado** (dueño, 2026-11-10: «golpe en la sien me gusta»): **Golpe en la sien** en lugar de Golpe brutal («apostar al crítico con el
  martillo es una mala inversión… con destreza 9 es prácticamente imposible hacer crítico»). Fue 13 · Con 11 · Des 9 · Agi 7 · Esp 2, vida 60, 7 No2;
  **Capellina de hierro** (Buena) en lugar del Casco de cuero endurecido; pasiva **Voluntad de hierro** (+2 Res.CC): Def 7, Def. especial 1, PdG 9,
  Dmg 13, Bloqueo 14, Parry 10, Res.CC 14. Golpe en la sien (cooldown 4, lenta): un ataque con su arma; si pega, su Fuerza contra la Res.CC del
  golpeado → Stun 1 turno (el jefe es inmune). **Cargado** (2026-11-10).
  **Nivel 5 aprobado** (dueño, 2026-11-10: «el personaje nivel 5 me parece bien»): Fue 14 · Con 12 · Des 9 · Agi 8 · Esp 2, vida 75, 8 No2;
  **Coraza de bronce con runas** (Buena) en lugar del Chaleco: Def 8, Def. especial 4, Bloqueo 15, Parry 10, Res.CC 15. Habilidad nueva:
  **Golpe demoledor**. **Cargado** (2026-11-10). La línea W3 queda completa.

- **R3 · Trabador · Rango** (boceto aprobado 2026-11-03, dueño: «la ruta del trabador me gusta»). Estrategia: frena y clava: no busca matar,
  busca que no te muevas (Rengo, red, clavado contra la pared, Vigilancia); sus aliados te alcanzan. Atributos (Des/Con/Agi/Fue/Esp → vida, No2):
  **nv1 11/8/6/6/2 → 40, 6** · nv2 12/9/6/7/2 → 45, 6 · nv3 13/9/7/8/2 → 45, 7 · nv4 14/10/7/9/2 → 50, 7 · nv5 15/11/8/9/2 → 55, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Tiro certero** (rápida) · **Tiro a la rodilla** (lenta) | — | **Ballesta del baqueano** (Lisiado 25 %, Perfora 1, Recarga 2) · 2 Comunes |
  | 2 | **Red tendida** | **Puntería** | + 2 Comunes |
  | 3 | **Clavar a la pared** | — | el arma, de Buena |
  | 4 | **Mantener a raya** | **Vista de halcón** | + una Buena |
  | 5 | **Vigilancia** | — | + otra Buena |
  Consumible: Virote de red.
  **Nivel 1 aprobado** (dueño, 2026-11-03: «vamos a probarlo con la ballesta»): Des 11 · Con 8 · Agi 6 · Fue 6 · Esp 2, vida 40, 6 No2, turnos de
  espera; Ballesta del baqueano (1d4 + 2 —las ballestas no suman la Fuerza—, Perfora 1, Lisiado 25 %, Recarga 2) · Chaleco de cuero · Botas de
  cuero de vaca: Def 3. Tiro certero (rápida) y Tiro a la rodilla (lenta). Alternativa anotada: un arco (Arco de cazador de pájaros) si pega poco.
  **Cargado** en el pool esencial (2026-11-03).
  **Nivel 2 aprobado** (dueño, 2026-11-11: «👍»): Des 12 · Con 9 · Agi 6 · Fue 7 · Esp 2, vida 45, 6 No2; + Casco de cuero endurecido y Guantes de
  agarre: PdG 14, Def 4. **Red tendida** y la pasiva **Puntería**. **Cargado** (2026-11-11).
  **Nivel 3 aprobado** (dueño, 2026-11-11: «creemos alguna ballesta buena y listo»): Des 13 · Con 9 · Agi 7 · Fue 8 · Esp 2, vida 45, 7 No2. No había
  ballestas Buenas fuera del archivo: se creó la **Ballesta del pialador** (Buena, 150 de oro; Tipo 4, 2 manos, peso 2, 2 dados + 4, Perfora 2, Lisiado
  33 %, Recarga 2). PdG 15. Habilidad nueva: **Clavar a la pared**. **Cargado** (2026-11-11).
  **Nivel 4 aprobado** (dueño, 2026-11-11: «vamos con el escurridizo; con la destreza que tiene, el rango me parece suficiente»): Des 14 · Con 10 ·
  Agi 7 · Fue 9 · Esp 2, vida 50, 7 No2; **Guantes de cetrero** (Buena, PdG a distancia +2) en lugar de los de agarre: PdG con la ballesta 17.
  **Mantener a raya** y la pasiva **Escurridizo** (en lugar de Vista de halcón). **Cargado** (2026-11-11).
  **Nivel 5 aprobado** (dueño, 2026-11-11: «el trabador me parece bien»): Des 15 · Con 11 · Agi 8 · Fue 9 · Esp 2, vida 60, 8 No2; **Chaleco de kevlar**
  (Buena) en lugar del de cuero: Def 5 (7 contra disparos). Habilidad nueva: **Vigilancia**. **Cargado** (2026-11-11). La línea R3 queda completa.

- **H3 · Duelista pesado · Híbrido** (boceto aprobado 2026-11-03, dueño: «me cierra así»). Estrategia: te desarma (Desarmar, al ganar un Parry),
  te rompe la armadura y te remata. Atributos (Fue/Con/Des/Agi/Esp → vida, No2): **nv1 9/9/8/5/2 → 45, 5** · nv2 10/10/8/6/2 → 50, 6 · nv3
  11/10/9/7/2 → 50, 7 · nv4 12/11/9/8/2 → 55, 8 · nv5 13/12/10/8/2 → 60, 8.
  | Nivel | Habilidad nueva | Pasiva | Equipo |
  |---|---|---|---|
  | 1 | **Romper armadura** (lenta) · **Desarmar** (Flash) | — | **Facón largo** (Tipo 6, Parry +1; ex «Caronero», renombrado por el dueño) + escudo Común · 2 Comunes |
  | 2 | **Remate** | **Guardia firme** | + 2 Comunes |
  | 3 | **Dos al hilo** | — | **Espada del herrero** (Buena, Tipo 6) |
  | 4 | **Arte de la guerra** (Flash) | **Desvío hábil** | + una Buena |
  | 5 | **Golpe demoledor** | — | + otra Buena |
  Arma de Tipo 6, no hacha: el Dos al hilo son dos ataques (Tipo 6: 3 + 3 = 6 No2; Tipo 8: 8, no le alcanza). (Ya no vale desde el 2026-11-10: el segundo golpe no cobra No2.)
  **Nivel 1 aprobado** (dueño, 2026-11-03: «va así»), con la ruta ajustada (Romper armadura y Desarmar eran las dos lentas): **nv1 Estocada
  (rápida) · Desarmar (Flash)**; nv2 Romper armadura + Guardia firme; nv3 Dos al hilo; nv4 Remate + Desvío hábil; nv5 Golpe demoledor (sale el
  Arte de la guerra). Fue 9 · Con 9 · Des 8 · Agi 5 · Esp 2, vida 45, 5 No2; Facón largo (Tipo 6, 1d6 + 9, Parry +1) + Escudo de asalto (Def 2,
  Parry +1) · Coraza de cuero hervido · Botas de cuero de vaca: Def 6, Parry +2. Consumible: **Pergamino grupal de Reflejo de Acero** (+1 Parry 3
  turnos, para desarmar más). **Cargado** en el pool esencial (2026-11-03).
  **Nivel 2 aprobado** (dueño, 2026-11-11: «sí»): Fue 10 · Con 10 · Des 8 · Agi 6 · Esp 2, vida 50, 6 No2; + Casco de cuero endurecido y Guantes
  de esgrimista (Parry +1): Def 7, Bloqueo 11, Parry 11. **Romper armadura** y la pasiva **Guardia firme**. **Cargado** (2026-11-11).
  **Nivel 3 aprobado** (dueño, 2026-11-11: «me gusta»): Fue 11 · Con 10 · Des 9 · Agi 7 · Esp 2, vida 50, 7 No2; el arma pasa a Buena: **Espada
  del herrero** (Tipo 6, 2 dados, +1, Bloqueo +1, Romper armadura 20 %): Bloqueo 13, Parry 11. Habilidad nueva: **Dos al hilo**. **Cargado** (2026-11-11).
  **Nivel 4 aprobado** (dueño, 2026-11-11: «sí»): Fue 12 · Con 11 · Des 9 · Agi 8 · Esp 2, vida 65, 8 No2; **Coraza de primera línea** (Buena,
  Def +4, +3 contra el primer golpe del turno, vida +10) en lugar de la de cuero hervido: Def 8, Bloqueo 14, Parry 12, Res.CC 12. **Remate** y la
  pasiva **Desvío hábil**. **Cargado** (2026-11-11).
  **Nivel 5 aprobado** (dueño, 2026-11-11: «sí»): Fue 13 · Con 12 · Des 10 · Agi 8 · Esp 2, vida 70, 8 No2; **Escudo triangular** (Buena) en
  lugar del de asalto: Bloqueo 16, Parry 13. Habilidad nueva: **Golpe demoledor**. **Cargado** (2026-11-11). La línea H3 queda completa.

- **⏸ EN PAUSA desde el 2026-11-04** (dueño: «vamos a pausar el tema de los creeps esenciales. Cuando te diga que retomemos, me volvés a mandar lo
  del Patotero para continuar»). Quedó presentado, sin respuesta, el boceto del **L6 · Patotero · Choque liviano**: la patota (pelea cuando tiene a
  los suyos alrededor). Atributos (Des/Agi/Con/Fue/Esp → vida, No2): nv1 9/8/8/6/2 → 40, 8 · nv2 10/8/9/7/2 → 45, 8 · nv3 11/9/9/8/2 → 45, 9 · nv4
  12/10/9/9/2 → 45, 10 · nv5 13/10/10/10/2 → 50, 10. Habilidades: nv1 **Finta** (rápida) · **Patotear** (lenta: +1 dado por aliado pegado al
  rival, hasta +3); nv2 Golpe a la rodilla + Pies ligeros; nv3 Tajo de carnicero; nv4 Hit and run + Ojo crítico; nv5 Ráfaga de cortes. Equipo:
  **Navaja del compadrito** (Tipo 6, Ini +3, Sangrado 25 %) · 2 Comunes livianas. Consumible: Pergamino grupal de Puntería Certera. Al retomar:
  mandarle esto y preguntar si le cierra como ruta. Después quedan T4, W4, R4, H4, L7 y L8.
- **▶ Retomado (2026-11-05, dueño)** — **L6 Patotero**: ruta aprobada con un cambio («intercambiaría golpe a la rodilla y hit and run»): nv1 Finta
  (rápida) · Patotear (lenta); **nv2 Hit and run** + Pies ligeros; nv3 Tajo de carnicero; **nv4 Golpe a la rodilla** + Ojo crítico; nv5 Ráfaga de cortes.
  **Nivel 1 aprobado**: Des 9 · Agi 8 · Con 8 · Fue 6 · Esp 2, vida 40, 8 No2; **Navaja del compadrito** (Común, Tipo 6, Ini +3, Sangrado 25 %) ·
  **Jubón de cuero curtido** (Def +3, Res. crít. T4 +1; el dueño lo prefirió al Chaleco de cuero) · **Calzas de cuero flexible** (Eva +1). Consumible:
  **Pergamino grupal de Puntería Certera**. **Patotear y Jauría cambian** (dueño: «+1 a la Probabilidad de Golpe fijo si hay al menos un aliado pegado,
  y +1 al daño, pero sin tope»): +1 PdG si hay al menos un aliado pegado al rival, y +1 dado de daño por cada aliado pegado, **sin el tope de +3**.
  **Sin programar** (dueño: «vamos dejándolos definidos»): se programa con el resto de los esenciales cuando el dueño lo pida.
  **Nivel 2 aprobado** (dueño, 2026-11-11: «va bien el patotero»): Des 10 · Agi 8 · Con 9 · Fue 7 · Esp 2, vida 45, 8 No2; + Escarpines de fieltro
  y Guantes de agarre: PdG 11, Eva 11, Ini 11. **Hit and run** y la pasiva **Pies ligeros**. **Cargado** (2026-11-11).
  **Nivel 3 aprobado** (dueño, 2026-11-11: «👌»): Des 11 · Agi 9 · Con 9 · Fue 8 · Esp 2, vida 45, 9 No2; el arma pasa a Buena: **Facón de plata**
  (+2 de daño, Ini +2, Sangrado 50 %): PdG 12, Eva 12. Habilidad nueva: **Tajo de carnicero**. **Cargado** (2026-11-11).
  **Nivel 4 aprobado** (dueño, 2026-11-11: «ok»): Des 12 · Agi 10 · Con 9 · Fue 9 · Esp 2, vida 55, 10 No2; **Jubón de cuero tachonado** (Buena,
  vida +10) en lugar del curtido: Def 2, Def. especial 2, Eva 13. **Golpe a la rodilla** y la pasiva **Ojo crítico**. **Cargado** (2026-11-11).
  **Nivel 5 aprobado** (dueño, 2026-11-11: «ok»): Des 13 · Agi 10 · Con 10 · Fue 10 · Esp 2, vida 60, 10 No2; + **Capellina de hierro** (Buena): Def 4,
  Res.CC 11. Habilidad nueva: **Ráfaga de cortes**. **Cargado** (2026-11-11). La línea L6 queda completa.
- **T4 · Peleador de control · Tanque** (2026-11-05): empuja, tira y demora; desordena al grupo rival. **Ruta aprobada**: nv1 Takle · Pisotón; nv2
  Desarmar + Guardia firme; nv3 Puño de roca; nv4 Arrastrar + **Marcar el ritmo** (dueño: «le vamos a poner marcar el ritmo a nivel 4»); nv5 Barrido.
  **Nivel 1 (en revisión)**: Con 9 · Fue 7 · Agi 7 · Des 6 · Esp 4 (dueño: «le bajaría un punto de constitución y le subiría uno de agilidad») → vida
  45, 7 No2 (Takle 2 + el ataque del mazo 5 en el mismo turno). Mazo de carnicero (Común, Tipo 10, +1 de daño, frecuente +1, Demora 33 %) · Peto de
  hierro (Def +3) · Botas de cuero de vaca (Def +1, Res. crít. T4 +1). Consumible: Grasa de carpincho. Takle: automatizado y probado en el mapa
  (2026-10-26), pero su texto no lo dice: al programar, sumarle «⚙ Automatizado: …». Pisotón: Fuerza contra la Res.CC o la Evasión de cada rival
  pegado (elige el rival).
  **Nivel 1 aprobado** (dueño, 2026-11-05: «lo probamos así»; sin el texto «⚙ Automatizado» en el Takle: «vamos a confiar en que lo está»).
- **W4 · Verdugo · Warrior** (2026-11-05): avisa a quién va a ejecutar y lo remata. **Ruta aprobada** (dueño: «me cierra la ruta»): **nv1 El que avisa no traiciona · Golpe fuerte** (dueño: «vamos con avisa y golpe fuerte»); **nv2 Remate** + pasiva **Sed de sangre**;
  nv3 Furia (Hacha del verdugo de la capital, Buena); nv4 Golpe demoledor + **Robustez** (Guantes del verdugo, Buena); nv5 Golpe brutal. Nivel 1
  propuesto: Fue 10 · Con 8 · Des 7 · Agi 6 · Esp 2 → vida 40, 6 No2 (dueño: «le bajaría un punto en constitución y le subiría uno en destreza, a
  partir de nivel 1»: vale para toda la ruta); Hacha de verdugo de pueblo (Común, Tipo 8, Derribar 50 %) · Peto de hierro ·
  Casco de cuero endurecido; consumible **Poción de Puntería Certera** (dueño: «el consumible, más de crítico frecuente le pondría uno de más de
  probabilidad de golpe»). Turnos de espera (Esp 2). **Nivel 1 aprobado** (2026-11-05).
- **R4 · Hunter · Rango** (2026-11-05, dueño: «me cierra la ruta y el nivel 1»): trampas y marcar a la presa; prepara el terreno y deja que el grupo
  cace. Ruta: nv1 **Disparo señalador** (rápida) · **Cepo del cazador** (lenta); nv2 Tiro que derriba + **Percepción aumentada**; nv3 Mina del
  cazador (el arco, de Buena); nv4 Cebo + **Puntería**; nv5 Abanico. **Nivel 1 aprobado**: Des 10 · Con 8 · Agi 7 · Fue 6 · Esp 2 → vida 40, 7 No2,
  turnos de espera; **Arco del rastreador** (Común, Tipo 4, Rango +3, 1d4 + 1 amplificado) · **Chaleco de cuero** (Def +2) · **Sandalias de baqueano**
  (Pisada atenta, Res.CC +1). Consumible: **Trampa de oso**. Sin programar.
- **H4 · Bruto que aguanta · Híbrido** (2026-11-05, dueño: «tanto la ruta como el nivel 1 me copan»): se la banca y devuelve; busca que le peguen.
  Ruta: nv1 **Aguante** (lenta) · **Contraataque** (Flash); nv2 Golpe desesperado + **Robustez**; nv3 Piel de hierro (el arma, de Buena); nv4 Furia +
  **Mañas de sobreviviente**; nv5 Golpe brutal. **Nivel 1 aprobado**: Con 10 · Fue 9 · Des 6 · Agi 6 · Esp 2 → vida 50, 6 No2, turnos de espera;
  **Hachuela de camping** (Común, Tipo 8, Parry +1, Bloqueo +1) · **Pechera de hierro** (Def +4) · **Botas de cuero de vaca** (Def +1, Res. crít.
  T4 +1): Def 5. Consumible: **Sales aromáticas**. Sin programar. Su Contraataque sigue las reglas nuevas (ver docs/pendientes.md, «⚔ Contraataque»).
- **L7 · Degollador · Choque liviano** (2026-11-05, dueño: «me cierra la ruta y el nivel 1»): abre la herida y la termina; va por el más golpeado.
  Ruta: nv1 **Golpe que sangra** (rápida) · **Remate**; nv2 Ojo de asesino + **Ojo crítico**; nv3 Corte profundo (el arma, de Buena); nv4 Degollar +
  **Sed de sangre**; nv5 Puñalada trapera. **Nivel 1 aprobado**: Des 10 · Agi 9 · Con 7 · Fue 5 · Esp 2 → vida 35, 9 No2, turnos de espera; **Facón de
  paisano** (Común, Tipo 4, Sangrado 50 %) · **Chaleco de cuero** (Def +2) · **Calzas de cuero flexible** (Eva +1). Consumible: **Aceite del punto
  débil** (Buena). Sin programar.
- **L8 · Acróbata · Choque liviano** (2026-11-05, dueño: «me cierra la ruta y el nivel 1»): se mueve y corta; nunca se queda quieto. Ruta: nv1 **Salto**
  (rápida) · **Tajo veloz**; nv2 Dash + **Pies ligeros**; nv3 Ráfaga de cortes (el arma, de Buena); nv4 Hit and run + **Paso ligero**; nv5 Puñalada por
  la espalda. **Nivel 1 aprobado**: Agi 10 · Des 9 · Con 7 · Fue 5 · Esp 2 → vida 35, 10 No2, turnos de espera; **Sable del tahúr** (Común, Tipo 6,
  +1 de daño, frecuente +1) · **Chaleco de cuero** (Def +2) · **Escarpines de fieltro** (Eva +1). Consumible: **Mate cebado**. Sin programar.
  **Con esto se cierra la ronda de nivel 1** de las líneas que quedaban (T4, W4, R4, H4, L6, L7, L8).

## ▶ Ronda de niveles 2 a 5 (2026-11-05, dueño)
«Los que ya están, vamos a ir agarrando uno por uno y a definir los niveles que siguen; uno dentro de cada rol (primero el W1, después el L1, después
el R1, así) hasta completar todo lo que ya tenemos. Una vez completado, una ronda de diseño de cero para ampliar horizontalmente con nuevas tácticas y
variantes, si quedan ideas con potencial.» Orden (la rotación de siempre): W1 → T1 → H1 → L1 → L2 → R1 → M1 → S1 → D1 → W2 → T2 → … Por cada uno:
los niveles 2 a 5 completos (atributos, habilidad, pasiva, equipo concreto, consumible), primero con lo que ya existe; una 🆕 solo si no hay nada.

### W1 Hachero · nivel 2 (aprobado 2026-11-05)
- 🔤 **Cambio de nombre** (dueño, 2026-11-05): la habilidad de creep «Golpe fuerte» (+1 dado del Tipo del arma) pasa a llamarse **«Pegar
  fuerte»**, con los mismos efectos, en todo el pool (skills-creep-base.js; la usan W1, W4 y R4/H4 del pool esencial). La pasiva sigue siendo
  **«Golpe fuerte»** (+1 Dmg). Los creeps ya guardados en las partidas conservan su copia con el nombre viejo.
- Atributos Fue 10 · Con 8 · Agi 7 · Des 7 · Esp 4 → vida 40, No2 7. Equipo (Común): Hacha · Cota de malla de hierro · Cofia de anillas sueltas ·
  **Grebas de cuero**. Habilidades: Pegar fuerte (cd 2) · Romper armadura (cd 3) · **Barrido** (cd 3). Pasiva: **Golpe fuerte** (+1 Dmg).
  Consumible: Pergamino grupal de Furia de Combate.
- Números del juego (nv1 → nv2): Dmg 9 → 11 · Def 5 → 6 · Eva/Ini/Mov 5/6/6 → 6/7/7 · Res.Esp/Res.CC 7/7 → 8/8 · Res. crít. T4/T6 1/1 → 2/1 ·
  PdG 7 = 7 · Def. esp. 1 y Res.Mt 4 sin cambio (su punto débil, la magia).

### W1 Hachero · nivel 3 (aprobado 2026-11-05)
- ⏳ **Golpe demoledor, en el pool** (dueño): 3 turnos de espera (antes 4) y **arranca el combate esperando** (`arrancaEnCooldown`); el SP queda en 4.
- 🔨 Regla (dueño): la Armadura rota de una habilidad es independiente de la del arma — si las dos se dan en el mismo golpe, **se suman**
  (el motor ya acumula las acumulaciones en un solo estado).
- Atributos Fue 11 · Con 9 · Agi 7 · Des 8 · Esp 4 → vida 45, No2 7. Equipo: **Hacha de guerra ligera** (Buena: Tipo 8, +2 daño, Rompe armadura
  50 %; elegida en lugar de la Hacha de doble filo del boceto) · Cota de malla de hierro · Cofia de anillas sueltas · Grebas de cuero.
  Habilidades: Pegar fuerte (cd 2) · Romper armadura (cd 3) · Barrido (cd 3) · **Golpe demoledor** (cd 3, lenta). Pasiva: Golpe fuerte (+1 Dmg).
  Consumible: Pergamino grupal de Furia de Combate.
- Números (nv2 → nv3): daño fijo 11 → 14 (Fue + hacha) · PdG/Parry 7/7 → 8/8 · Bloqueo 10 → 11 · Res.Esp/Res.CC 8/8 → 9/9 · Def 6 = 6.

### W1 Hachero · nivel 4 (aprobado 2026-11-05; ⚠ reordenado, ver «Ruta final» abajo)
- ⚔ **Sed de batalla, nueva pasiva en el pool** (dueño: «le dejamos Sed de sangre y sumamos Sed de batalla como pasiva, que la puedan elegir los
  jugadores también»): cuando un rival cae por tu golpe, ganás **3 No2, aunque pases del máximo**, y
  te llega un aviso (dueño: «2 me parece muy poco para un punto de Job, y que suceda tan poco»). 1 Job. Automatizada en el mapa (vtt-hexgrid/js/102). El W1 nivel 4 se queda con **Sed de sangre**.
- Propuesta: Fue 12 · Con 10 · Agi 8 · Des 8 · Esp 4 → vida 55 (50 + 5 de la cota), No2 8. Equipo: Hacha de guerra ligera (B) · **Cota de malla
  fina** (B) · Cofia de anillas sueltas · Grebas de cuero · **Guanteletes de hierro**. Habilidades: + **Remate** (cd 3). Pasivas: Golpe fuerte ·
  **Sed de sangre**. Números (nv3 → nv4): Def 6 → 8 · Eva 6 → 8 · Bloqueo 11 → 13 · daño fijo 14 → 15 · Res. crít. T4/T6/T8 2/1/0 → 2/2/1.

### ✅ W1 Hachero · ruta final, niveles 1 a 5 (aprobada 2026-11-05)
- 🔄 (2026-11-06, dueño) Las pasivas que se activan cuando cae un rival (Sed de sangre, Sed de batalla) **no van para creeps**: «está bueno para
  jugadores, pero no para creeps». En el nivel 4 del Hachero, en lugar de Sed de sangre, **Piel curtida** (+1 Defensa; dueño: «si ya tenía Golpe fuerte… la que
  da más defensa»; por un rato fue un segundo Golpe fuerte): Defensa 9 en el nivel 4 y 11 en el 5.
- Dueño: «Partir en dos, reemplazarlo por alguna que sea del pool» → **Arte de la guerra**; «lo pondría en un nivel anterior» → opción A: Arte
  de la guerra en el nivel 4 y Remate en el nivel 5; **Sed de sangre se queda en el nivel 4** (dueño: «Sed de sangre dejalo en nivel 4»). Casco del nivel 5: **Casco de bandas remachadas** (Def. esp. queda en 0:
  su punto débil, la magia, a propósito).
| Nv | Fue/Con/Agi/Des/Esp · vida · No2 | Habilidad nueva | Pasiva nueva | Equipo |
|---|---|---|---|---|
| 1 | 9/7/6/7/4 · 35 · 6 | Pegar fuerte (cd 2) · Romper armadura (cd 3) | — | Hacha · Cota de malla de hierro · Cofia de anillas sueltas |
| 2 | 10/8/7/7/4 · 40 · 7 | Barrido (cd 3) | Golpe fuerte (+1 Dmg) | + Grebas de cuero |
| 3 | 11/9/7/8/4 · 45 · 7 | Golpe demoledor (cd 3, lenta) | — | Hacha → **Hacha de guerra ligera** (B) |
| 4 | 12/10/8/8/4 · 55 · 8 | **Arte de la guerra** (Flash +3, cd 2) | **Piel curtida** (+1 Defensa; antes Sed de sangre) | Cota de hierro → **Cota de malla fina** (B) · + Guanteletes de hierro |
| 5 | 13/11/8/9/4 · 65 · 8 | **Remate** (cd 3) | — | Cofia → **Casco de bandas remachadas** (B) · + Botas de estibador |
Consumible en todos: Pergamino grupal de Furia de Combate. Nv5 (números del juego): Def 10 · daño fijo 16 · PdG/Parry 9/9 · Bloqueo 14 · Res.CC 12 ·
Res. crít. T4/T6/T8 3/2/1 · Def. esp. 0 · Res.Mt 4. ✅ **Cargado en el pool esencial (niveles 2 a 5) el 2026-11-06** (`comun/creeps-esenciales.js`; la vida suma
la del equipo desde el nivel 2; las pasivas salen de `comun/pasivas.js`).

### T1 Escudero · nivel 2 (aprobado 2026-11-05)
- Atributos Con 13 · Fue 6 · Agi 6 · Des 7 · Esp 4 → vida 65, No2 6. Equipo: Hacha de piedra · Escudo de caparazón de tortuga gigante · Peto de
  hierro · Cofia de anillas sueltas · **Grebas de cuero** (dueño: «solo con las grebas»). Habilidades: Provocar · Piel de hierro · **Golpe de
  escudo** (cd 2, 5 No2). Pasiva: **Guardia firme** (+1 Bloqueo). Consumibles: Cuero Duro y Piel de Cristal.
- Números (nv1 → nv2): Def 5 → 6 · Def. esp. 2 · Bloqueo 7 → 9 · Dmg 5 → 6 · Eva/Ini/Mov 5 → 6 · Res.Esp/Res.CC 12 → 13 · Res. crít. T4 1 → 2.

### T1 Escudero · nivel 3 (aprobado 2026-11-06)
- Atributos Con 14 · Fue 7 · Agi 6 · Des 8 · Esp 4 → vida 70, No2 6. Equipo: Hacha de piedra · **Escudo de escamas** (B: Def +3, Bloqueo +1,
  crít. T6 +1, Def. esp. +1, peso 3 → Golpe de escudo 3d10; desde el 2026-11-10, 1d10 + 3 + Dmg, sin crítico) · Peto de hierro · Cofia de anillas sueltas · Grebas de cuero. Habilidades: Provocar ·
  Piel de hierro · Golpe de escudo · **Aguante** (en lugar de «Plantarse» 🆕 del boceto, que no existe). Pasiva: Guardia firme.
- Números (nv2 → nv3): Def 6 → 8 · Bloqueo 9 → 10 · PdG/Parry 7 → 8 · Dmg 6 → 7 · Res.Esp/Res.CC 13 → 14 · Res. crít. T6 0 → 1.
- ✅ **T1 niveles 2 y 3 cargados en el pool esencial el 2026-11-06** (`comun/creeps-esenciales.js`).

### T1 Escudero · nivel 4 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 15 · Fue 8 · Agi 7 · Des 8 · Esp 4 → vida 80 (75 + 5 de la armadura), No2 7. Equipo: Hacha de piedra · Escudo de escamas (B) ·
  **Media armadura de escudero** (B: Def +5, crít. T4 +1, Bloqueo +1, Res.CC +1, Vida +5) · Cofia de anillas sueltas · Grebas de cuero. Habilidades:
  + **Interponerse**. Pasivas: Guardia firme · **Devolver gentileza** (en lugar de «Cortar el paso» 🆕, que no existe).
- Números (nv3 → nv4): Def 8 → 10 · Bloqueo 10 → 12 · Dmg 7 → 8 · Eva/Ini/Mov 6 → 7 · Res.CC 14 → 16 · Res.Esp 14 → 15 · crít. T4 2 → 3.

### T1 Escudero · nivel 5 (aprobado 2026-11-06, cargado en el pool) — ✅ línea T1 completa
- Atributos Con 16 · Fue 9 · Agi 7 · Des 9 · Esp 4 → vida 85, No2 7. Equipo: **Hacha del forjador** (B: Tipo 8, Bloqueo +1, Rompe armadura 50 %) ·
  Escudo de escamas (B) · Media armadura de escudero (B) · Cofia de anillas sueltas · Grebas de cuero · **Botas de estibador**. Habilidades: + **Escudo
  humano** (en lugar de «Muro de escudos» del boceto; el del pool con ese nombre está sin auditar y es otra cosa). Pasivas: Guardia firme · Devolver gentileza.
- Números (nv4 → nv5): Def 10 → 11 · Bloqueo 12 → 13 · PdG/Parry 8 → 9 · Res.CC 16 → 17 · Res.Esp 15 → 16 · crít. T4 3 → 4 · daño fijo 9 = 9.

### H1 Embestidor · nivel 2 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 11 · Fue 9 · Agi 7 · Des 7 · Esp 2 → vida 55, No2 8 (con Impulso). Equipo: Hacha de verdugo de pueblo · Chaleco de cuero · Anillo de
  Paso Fantasma · **Cofia de anillas sueltas** · **Botas de cuero de vaca**. Habilidades: Carga que derriba · Takle · **Pegar fuerte**. Pasiva: **Impulso**.
- Números (nv1 → nv2): No2 6 → 8 · Def 2 → 4 · Def. esp. 0 → 1 · Dmg 8 → 9 · Bloqueo 8 → 9 · Eva/Ini/Mov 6 → 7 · crít. T4 0 → 2. (La Carga que
  derriba ya no es una onda en cono: es una carrera de hasta 4 casillas, +1 PdG y +1 daño por casilla.)

### H1 Embestidor · nivel 3 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 12 · Fue 10 · Agi 7 · Des 8 · Esp 2 → vida 60, No2 8. Equipo: **Hacha del verdugo de la capital** (B: Tipo 8, 2 dados, Derribar 50 %)
  · Chaleco de cuero · Anillo de Paso Fantasma · Cofia de anillas sueltas · Botas de cuero de vaca. Habilidades: + **Salto aplastante** (cd 4, lenta).
- Números (nv2 → nv3): dados del hacha 1 → 2 · Dmg 9 → 10 · PdG/Parry 7 → 8 · Bloqueo 9 → 10 · Res.Esp/Res.CC 11 → 12.

### H1 Embestidor · nivel 4 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 13 · Fue 11 · Agi 8 · Des 8 · Esp 2 → vida 80 (65 + jubón 10 + Robustez 5), No2 9. Equipo: Hacha del verdugo de la capital (B) ·
  **Jubón de cuero tachonado** (B: Def +2, Def. esp. +2, crít. T4 +2, Vida +10) · Anillo de Paso Fantasma · Cofia · Botas de cuero de vaca.
  Habilidades: + **Aguante**. Pasivas: Impulso · **Robustez**.
- Números (nv3 → nv4): vida 60 → 80 · No2 8 → 9 · Def 4 = 4 · Def. esp. 1 → 3 · Dmg 10 → 11 · Bloqueo 10 → 11 · Eva/Ini/Mov 7 → 8 · crít. T4 2 → 4.

### H1 Embestidor · nivel 5 (aprobado 2026-11-11, cargado en el pool; estuvo en pausa desde el 2026-11-06)
- Con 14 · Fue 12 · Agi 8 · Des 9 · Esp 2 → vida 90, No2 9; + **Furia**; Cofia → **Casco de bandas remachadas** (B) · + **Guanteletes de cuero tachonado**
  (en lugar de los de hierro, que restan Iniciativa). Def 6 · Def. esp. 3 · PdG 9 · Bloqueo 12 · Res.CC 15. La línea H1 queda completa.
- (La propuesta que había quedado en pausa:)
- Propuesta pendiente: Con 14 · Fue 12 · Agi 8 · Des 9 · Esp 2 → vida 90; + **Furia**; Cofia → **Casco de bandas remachadas** (B) · + **Guanteletes de
  hierro** (Ini −1: ofrecer otra pieza de manos si molesta). Def 6 · Def. esp. 2 · PdG 9 · Bloqueo 13.

### M1 Piromante · nivel 2 (aprobado 2026-11-06, cargado en el pool)
- Ruta nueva (dueño, 2026-11-06): nv2 **Parpadeo** + Potencia especial (en lugar de «Toque abrasador», sin auditar) · nv3 **Bola de fuego** · nv4 una
  2.ª pasiva + Misil elemental o Arma elemental · nv5 **Meteoro**. Atributos (Con/Fue/Agi/Des/Esp): nv2 8/2/6/5/15.
- Nv2: vida 45 (40 + campera), No2 6, SP 45 (regen 7). Equipo: Varita de la bola de fuego · Botella con un diablito · Campera de cuero con tachas ·
  Gorro de piel de salamandra · **Babuchas bordadas del adivino**. Habilidades: Lengua de fuego · Muro de fuego · **Parpadeo** (Flash, 4 SP; en turno
  ajeno, el doble). Pasiva: **Potencia especial** (+1 Ef.Esp). Números (nv1 → nv2): PdG.Esp 14 → 15 · Ef.Esp 14 → 16 · Def. esp. 2 → 3 · Res.Mt 15 → 17.

### M1 Piromante · nivel 3 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 9 · Fue 2 · Agi 6 · Des 6 · Esp 16 → vida 50, No2 6, SP 48 (regen 8). Equipo: **Varita del chorro de lava** (B: camino de 4 casillas,
  1d4 de fuego y arde 2 turnos, aliados incluidos; 1 No2 + 3 SP) en lugar de la de la bola de fuego · Botella con un diablito · Campera · Gorro de piel
  de salamandra · Babuchas del adivino. Habilidades: + **Bola de fuego**. Números (nv2 → nv3): PdG.Esp 15 → 16 · Ef.Esp 16 → 17 · Res.Mt 17 → 18.
- ⏸ El costo y el daño de sus hechizos (¼ Ef.Esp, SP = Especial) quedan abiertos: ver «🔥 Cómo costear el daño mágico de los creeps» en pendientes.

### M1 Piromante · nivel 4 — preparado, SIN cargar (2026-11-06)
- En `comun/creeps-esenciales.js`, comentado («⏸ PREPARADO y sin cargar»): se carga cuando el dueño lo apruebe. Atributos Con 10 · Fue 2 · Agi 7 ·
  Des 6 · Esp 17. Equipo: Varita del chorro de lava · Botella con un diablito · Poncho de espejitos · Gorro de piel de salamandra · Babuchas del
  adivino. Habilidades: Lengua de fuego · Muro de fuego · Parpadeo · Bola de fuego · **Escudo elemental**. Pasivas: Potencia especial · Puntería arcana.
- **🛡 Escudo elemental** (dueño, 2026-11-06; empezó como «Escudo de fuego»): sobre un aliado, sobre sí mismo o sobre un rival a Rango; entra
  directo, sin tirada (como el Arma elemental). Al azar 2 No2 + 4 SP; eligiendo el elemento, +1 SP; cooldown 3 (+1 eligiendo). Un anillo en las 6
  casillas de al lado que **sigue al portador** 2 turnos: quema con 1d6 del elemento (con lo de cada elemento: los mismos presets del Arma elemental)
  a quien entra, a quien le llega el anillo o a quien empieza su turno pegado. Una vez por ronda por víctima y por anillo; nunca al portador. Estados:
  Escudo ígneo / helado / eléctrico / ácido / venenoso / luminoso / siniestro; uno nuevo reemplaza al anterior.
  - **Resistir** (dueño): el daño es directo (solo la resistencia elemental lo frena); los **efectos** del elemento se resisten con la Res.Esp de la
    víctima contra el Ef.Esp del lanzador (guardado en el estado al ponerlo). Si resiste, solo el daño. Es un dato por elemento (`resiste`): por
    ahora sí en todos **salvo el ácido** (la Armadura rota entra siempre). **El resto se revisa elemento por elemento con el dueño.**
  - Dibujo: el elemento gira alrededor del portador (fuego = las llamitas del Muro de fuego, eléctrico = rayos en zigzag, hielo = ventisca,
    ácido y tóxico = líquido como la Transfusión). **Luz y siniestro: propuesta de Claude, a confirmar por el dueño.**

### M1 Piromante · nivel 4 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 10 · Fue 2 · Agi 7 · Des 6 · Esp 17 → vida 55 (50 + kevlar 5), No2 7, SP 51. Equipo: Varita del chorro de lava (B) · Botella con un
  diablito · **Chaleco de kevlar** (B: Def +3, +2 a distancia, crít. T4 +1, Vida +5, Res. fuego +1) · Gorro de piel de salamandra · **Escarpines de
  fieltro** (Eva +1). Dueño: «no me enfocaría en ponerle Defensa especial a un mago… protección contra rango» (antes, Poncho de espejitos y Babuchas).
  Habilidades: + **Escudo elemental** (nueva, vtt-hexgrid/js/106; en lugar de Misil/Arma elemental). Pasivas: Potencia especial · **Puntería arcana**.
- Números (nv3 → nv4): Def 1 → 3 (5 a distancia) · Eva 6 → 8 · PdG.Esp 16 → 18 · Ef.Esp 17 → 18 · Def. esp. 3 → 1 · Res. fuego 1 → 2.

### M1 Piromante · nivel 5 (aprobado 2026-11-06, cargado en el pool) — ✅ línea M1 completa
- Atributos Con 11 · Fue 2 · Agi 7 · Des 7 · Esp 18 → vida 65 (55 + kevlar 5 + casco 5), No2 7, SP 54 (regen 9). Equipo: Varita del chorro de lava (B) ·
  Chaleco de kevlar (B) · **Casco de bandas remachadas** (B; dueño: el Turbante no, «la visión al creep no le da ninguna ventaja», el GM ve todo el mapa; la Percepción sí le sirve: descubre a los jugadores en sigilo, dueño 2026-11-09)
  · Botella con un diablito · Escarpines de fieltro · **Mitones del primer conjuro** (−1 SP al primer uso de la varita en el turno). Habilidades: +
  **Meteoro**. Pasivas: Potencia especial · Puntería arcana.
- Números (nv4 → nv5): Def 3 → 5 (7 a distancia) · crít. T4 1 → 2 · PdG.Esp 18 → 19 · Ef.Esp 18 → 19 · SP 51 → 54 · Res. fuego 2 → 1.

### S1 Sanador · nivel 2 (aprobado 2026-11-06, cargado en el pool)
- Atributos Con 9 · Fue 3 · Agi 7 · Des 4 · Esp 13 → vida 50 (45 + peto 5), No2 7, SP 39. Equipo: Varita de cura · Orbe de luz · Peto de cuero de
  lampalagua · Botas de caña alta de estanciero · **Casco de cuero endurecido** (Def +1, crít. T4 +1: contra las flechas). Habilidades: Sanar ·
  Purificar · **Oleada sanadora**. Pasiva: **Manos de curandero** (nueva, 2026-11-06: +5 a cada cura a uno; +2 en área y por turno; también pociones y
  pergaminos). Ideas del dueño para los niveles 3 y 4: «algo más de support, que pueda cambiar el orden de turnos, o daño de luz que se sostenga con la
  sanación; el 4, algo un poquito mejor».

### S1 Sanador · niveles 3 y 4 (aprobados 2026-11-07)
- Nv3 (cargado): Con 10 · Fue 3 · Agi 7 · Des 4 · Esp 15 → vida 55, No2 7, SP 45. Equipo: **Varita de cura mayor** (B: 2d8) · Orbe de luz · Peto de
  cuero de lampalagua · **Escarpines de fieltro** (en lugar de las Botas de caña alta) · Casco de cuero endurecido. Habilidades: + **Smite** (luz, no se
  esquiva, Marcado, Luz sanadora 50 %). Def 2 · Def. esp. 4 · Eva 8 · PdG.Esp/Ef.Esp 15.
- Nv4: Con 11 · Fue 3 · Agi 8 · Des 4 · Esp 16 → vida 60, No2 8, SP 48. Equipo: el Peto → **Chaleco de kevlar** (B). Habilidades: + **Cambio de
  guardia** (versión de creep, programada 2026-11-07: 1 No2 + 4 SP o cooldown 3; el GM elige los dos creeps con un clic, vtt-hexgrid/js/102). Def 4
  (6 a distancia) · Def. esp. 2 · Eva 9 · crít. T4 2. **Cargado en el pool (2026-11-07).**

### D1 Maldito · ruta nueva y nivel 2 (aprobados 2026-11-07, nivel 2 cargado)
- Ruta (dueño): nv2 **Maldición debilitante** · nv3 **Escalofrío** · nv4 **Aguja del desamparo** + Potencia especial · nv5 Anulación. **Extenuar**, afuera.
  La **Aguja del desamparo** sube a **5 SP** (antes 3; con turnos de espera, 4 y lenta), en el pool para todos los creeps.
- Nv2: Con 9 · Fue 2 · Agi 7 · Des 4 · Esp 14 → vida 45, No2 7, SP 42. Equipo: Varita del susurro · Atrapasueños · Casaca de salteador · Capucha del
  culto · **Casco de cuero endurecido**. Habilidades: Maldición de la coraza · Aguja siniestra · **Maldición debilitante**. Pasiva: **Puntería arcana**.
  PdG.Esp 13 → 15 · Ef.Esp 13 → 14 · Def 1 → 2 · crít. T4 0 → 1.

### D1 Maldito · nivel 3 (aprobado 2026-11-07, cargado)
- Con 9 · Fue 2 · Agi 7 · Des 5 · Esp 16 → vida 45, No2 7, SP 48. Equipo: **Varita de la grieta** (B: 1d6 arcano y −2 Def 2 turnos; se esquiva) en lugar
  de la del susurro · Atrapasueños · Casaca de salteador · Capucha del culto · Casco de cuero endurecido. Habilidades: + **Escalofrío**. PdG.Esp 17 · Ef.Esp 16.

### S1 Sanador · nivel 5 (aprobado 2026-11-07, cargado en el pool) — ✅ línea S1 completa
- Atributos Con 12 · Fue 3 · Agi 8 · Des 4 · Esp 18 → vida 65, SP con el **Orbe de la reserva** (SP +5). Equipo: Varita de cura mayor (B) · **Orbe de la
  reserva** (B) · Chaleco de kevlar (B) · Escarpines de fieltro · Casco de cuero endurecido · **Guantes de cuero grueso** (Def +1). Habilidades: + **Círculo
  de sanación** (en lugar del «Milagro» del boceto). Pasiva: Manos de curandero.
- ✨ **Milagro** (nueva, 2026-11-07, dueño: «me gusta la terminología… la sumaría como skill de creep y de support»): diámetro 5 (19 casillas) en su
  Rango; cada aliado adentro (él incluido) se cura **3d8, una sola tirada para todos** (dueño, 2026-11-08: «que cure 3 dados de 8… es una
  tirada para todos»; antes 2d8) y se saca el estado malo más reciente; caídos, nada. Creep: 2 No2 + 10 SP, o espera 5 y lenta.
  Clase (Support de los jugadores): 2 No2 + 10 SP, **una vez por combate** (avisa y deja usarla igual; se libera con «Finalizar combate»). No la lleva
  el Sanador del pool (el nivel 5 quedó con el Círculo de sanación).

### D1 Maldito · nivel 4 (aprobado 2026-11-07, cargado)
- Con 10 · Fue 2 · Agi 8 · Des 5 · Esp 17 → vida 55 (50 + capa 5), No2 8, SP 51. Equipo: Varita de la grieta (B) · **Capa de escamas de pez espejo** (B:
  Def +2, Def. esp. +1, Res.CC +1, crít. T4 +1, Vida +5, Espejo) en lugar de la Casaca · Atrapasueños · Capucha del culto · Casco. Habilidades: + **Aguja
  del desamparo** (5 SP). Pasivas: Puntería arcana · **Potencia especial**. PdG.Esp 18 · Ef.Esp 18 · Def 3 · Eva 8.

### D1 Maldito · nivel 5 (aprobado 2026-11-07, cargado) — ✅ línea D1 completa
- Con 10 · Fue 2 · Agi 8 · Des 6 · Esp 19 → vida 55, No2 8, SP 57. Equipo: Varita de la grieta (B) · **Muñeco vudú** (B: PdG.Esp +1 y Debilitado 1 turno
  al primer daño especial de cada turno) en lugar del Atrapasueños · Capa de escamas de pez espejo (B) · Capucha del culto · Casco · **Guantes de cuero
  grueso**. Habilidades: + **Anulación**. PdG.Esp 21 · Ef.Esp 20 · Def 4 · Def. esp. 2.

### R1 Tirador de precisión · nivel 2 (aprobado 2026-11-07, cargado)
- Des 12 · Con 8 · Agi 7 · Fue 6 · Esp 3 → vida 40, No2 7. Equipo: Arco de la espera · Chaleco de cuero · Botas de cuero de vaca · **Casco de cuero
  endurecido** · **Guantes de agarre** (PdG +1; dueño: «los de agarre»). Habilidades: + **Vigilancia**. Pasiva: **Puntería**. PdG 11 → 14 · Def 3 → 4 ·
  crít. T4 1 → 2.

### R1 Tirador de precisión · nivel 3 (aprobado 2026-11-07, cargado)
- Des 13 · Agi 8 · Con 8 · Fue 7 · Esp 3 → vida 40, No2 8. Equipo: **Arco de puntería** (B: Rango +5, Crítico potente +2) en lugar del Arco de la espera ·
  Chaleco · Botas de cuero de vaca · Casco · Guantes de agarre. Habilidades: + **Tiro al arma**. PdG 15 · Eva/Ini/Mov 8.

### R1 Tirador de precisión · nivel 4 (aprobado 2026-11-07, cargado)
- Des 14 · Con 9 · Agi 8 · Fue 8 · Esp 3 → vida 50 (45 + kevlar 5), No2 8. Equipo: Arco de puntería (B) · **Chaleco de kevlar** (B) · Botas de cuero de
  vaca · Casco · Guantes de agarre. Habilidades: + **Disparo señalador**. Pasivas: Puntería · **Ojo crítico**. Def 5 (7 a distancia) · PdG 16 · crít. T4 3.

### R1 Tirador de precisión · nivel 5 (aprobado 2026-11-07, cargado) — ✅ línea R1 completa
- Des 15 · Con 10 · Agi 9 · Fue 8 · Esp 3 → vida 55, No2 9. Equipo: Arco de puntería (B) · Chaleco de kevlar (B) · **Botas de mensajero** (B: Eva +2 contra
  oportunidad, Levitar 2) · **Cofia de anillas sueltas** · Guantes de agarre · **Rodilleras de caparazón de tatú carreta** (dueño: «¿y algo de Def. esp.?»;
  el carcaj no: los creeps no llevan cuenta de flechas). Habilidades: + **Flecha que atraviesa**. Def 5 (7 a distancia) · Def. esp. 2 · PdG 17 · Eva 9.

### L1 Sangrador · nivel 2 (aprobado 2026-11-07, cargado)
- Agi 11 · Des 9 · Con 7 · Fue 6 · Esp 3 → vida 35, No2 11. Equipo: Cuchilla del frigorífico · Chaleco de cuero · Zapatillas de lona · **Cofia de anillas
  sueltas**. Habilidades: Golpe que sangra · Sal en la herida · **Tajo al tendón** (nueva, en lugar de Corte profundo, que salió del pool). Pasiva:
  **Escurridizo** (nueva, en lugar de «Olfato de sangre»). PdG 9 · Eva 12 · Def 3 · Def. esp. 2. En el boceto, **Paso atrás** reemplaza a «Reflejos» (nv4).

### L1 Sangrador · nivel 3 (aprobado 2026-11-07, cargado)
- Agi 12 · Des 10 · Fue 7 · Con 7 · Esp 3 → vida 35, No2 12. Equipo: **Hoz de cosecha** (B: Tipo 6, +1 daño, Ini +2, Sangrado 75 %) en lugar de la
  Cuchilla · Chaleco · Zapatillas de lona · Cofia. Habilidades: + **Ráfaga de cortes**. Ini 13 · Eva 13 · PdG 10.

### L1 Sangrador · nivel 4 (aprobado 2026-11-07, cargado)
- Agi 13 · Des 11 · Con 8 · Fue 7 · Esp 3 → vida 40. Equipo: Hoz de cosecha · **Chaqueta del acróbata** (en lugar del Chaleco; la Def. esp. queda
  como su punto débil) · Zapatillas de lona · Cofia. Habilidades: + **Paso atrás**. Pasivas: **Ojo crítico** y **Ojo de carancho** (las dos nuevas;
  sale Escurridizo). PdG 11 · Eva 16 · Def 1 · Crítico frecuente en 1 (de la tabla del duelo, índice 0).
- **Ojo de carancho** (pasiva nueva, 1 Job, también para jugadores): +1 a la Probabilidad de Golpe contra cualquier rival que tenga algún estado
  malo encima. Corrección del dueño el mismo día: vale para **cualquier tirada de Probabilidad de Golpe, armas y hechizos** (PdG y PdG.Esp). En un
  hechizo de área cuenta objetivo por objetivo (la tirada compartida no arrastra el +1 del primero). No cuentan los estados que arma la ficha sola
  (Sobrepeso). En el cuadro del duelo se ve «🦅 +1 Ojo de carancho» en la declaración y en la tirada.
  **La Armadura rota tampoco cuenta** (dueño, 2026-11-07: «técnicamente es un efecto sobre la armadura y no sobre el jugador»; el comportamiento
  ya la dejaba afuera).

### L1 Sangrador · nivel 5 (aprobado 2026-11-07, cargado) — ✅ línea L1 completa
- Agi 14 · Des 12 · Con 8 · Fue 8 · Esp 3 → vida 40, No2 14. Equipo: Hoz de cosecha · Chaqueta del acróbata · **Botas de mensajero** (B: Eva +2
  contra oportunidad, Levitar 2; en lugar de las Zapatillas de lona) · Cofia · **Grebas de cuero** (Def +1, Res. crítico Tipo 4 +1) · **Guantes de
  agarre** (PdG +1). Habilidades: + **Corte en la arteria** (contra uno que ya sangra, Crítico frecuente +2 y con crítico el Sangrado queda
  permanente). Pasivas: Ojo crítico · Ojo de carancho. PdG 13 (14 con Ojo de carancho) · Daño 8 · Def 2 · Def. esp. 4 (baja de 5: se van las
  Zapatillas; el dueño lo acepta) · Eva 16 · Ini 16 · Mov 14. La Evasión +2 contra oportunidad de las botas está automatizada (probada en el mapa).

### L2 Envenenador · nivel 3 (aprobado 2026-11-07, cargado)
- Des 12 · Agi 10 · Con 8 · Fue 7 · Esp 2 → vida 40, No2 10. Equipo: **Daga de la viuda verde** (B: Tipo 4, Veneno 3 siempre, sin Perfora; en
  lugar de la Daga ritual) · Chaleco de cuero · Guantes de agarre · Zuecos de boticario · Calzas de escapista. Habilidades: Estocada · Hoja
  envenenada · Tajo veloz · + **Golpe a la rodilla** (si pega, Rengo 2 turnos). Pasiva: Escurridizo. Consumible: Óleo venenoso. PdG 13 · Daño 7 ·
  Def 3 · Eva 10 (12 contra oportunidad) · Ini 10 · Mov 10. Ojo: sin la Perfora 1 de la daga ritual, contra mucha Defensa el veneno de la daga a
  veces no entra (el dueño lo acepta).

### L2 Envenenador · nivel 4 (aprobado 2026-11-07, cargado)
- Des 13 · Agi 11 · Con 9 · Fue 7 · Esp 2 → vida 45, No2 11 (dueño: la Fuerza queda en 7 y sube la Agilidad). Equipo: Daga de la viuda verde ·
  **Chaqueta del corredor** (B) · Guantes de agarre · Zuecos de boticario · **Perneras de cuero hervido** (en lugar de las Calzas de escapista: la
  Chaqueta del corredor ya da Evasión +2 contra oportunidad). Habilidades: + **Hit and run**. Pasivas: Escurridizo · + **Pies ligeros** (Eva +1).
  Consumible: Óleo venenoso. Vida 45 · No2 11 · Def 2 · Def. esp. 2 · PdG 14 · Daño 7 · Eva 14 · Ini 11 · Mov 11.

### L2 Envenenador · nivel 5 (aprobado 2026-11-07, cargado) — ✅ línea L2 completa · ⚠ fuerte a propósito
- Des 14 · Agi 12 · Con 10 · Fue 7 · Esp 2 → vida 50, No2 12. Equipo: Daga de la viuda verde · Chaqueta del corredor · Guantes de agarre ·
  Zuecos de boticario · Perneras de cuero hervido · + **Anillo del pantano** (B: cada Veneno que pone entra con 1 stack más). Habilidades: + **Ráfaga
  de cortes** (los efectos del arma ×3). Pasivas: Escurridizo · Pies ligeros. Consumible: Óleo venenoso. PdG 15 · Daño 7 · Eva 15 (17 contra
  oportunidad) · Ini 12 · Mov 12.
- **El Veneno se suma entero** (probado en el mapa 2026-11-07) y dura tantos turnos como stacks, perdiendo uno por turno: con el anillo, un golpe
  común deja 4 (≈ 10 de daño en el tiempo), la Hoja envenenada 8 (≈ 36) y **una Ráfaga de cortes 12 (≈ 78)**, encima de lo que ya tuviera.
  **Queda así a propósito** (dueño, 2026-11-07: «así probamos cómo balancear algo que se puede llegar a romper por balance»): a estudiar en la ronda de
  balance (`pendientes.md`).

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
| W1 | ✅ (2026-11-02) | ✅ (2026-11-05) | ✅ (2026-11-05) | ✅ (2026-11-05) | ✅ (2026-11-05) |
| T1 | ✅ (2026-11-02) | ✅ (2026-11-05) | ✅ (2026-11-06) | ✅ (2026-11-06) | ✅ (2026-11-06) |
| T2 | ✅ (2026-11-02; rehecho 2026-11-03) | ✅ (2026-11-07) | ✅ (2026-11-08; rehecho con Provocar) | ✅ (2026-11-08; rehecho con Blindaje) | ✅ (2026-11-08) |
| H1 | ✅ (2026-11-03) | | | | |
| L1 | ✅ (2026-11-02) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) |
| L2 | ✅ (2026-11-03) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) |
| R1 | ✅ (2026-11-03) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) |
| M1 | ✅ (2026-11-02) | ✅ (2026-11-06) | ✅ (2026-11-06) | ✅ (2026-11-06) | ✅ (2026-11-06) |
| S1 | ✅ (2026-11-02) | ✅ (2026-11-06) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) |
| D1 | ✅ (2026-11-02) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) |
| W2 | ✅ (2026-11-03) | ✅ (2026-11-07) | ✅ (2026-11-07) | ✅ (2026-11-07) | |
| H2 | ✅ (2026-11-03) | | | | |
| L3 | ✅ (2026-11-03) | ✅ (2026-11-09) | | | |
| L4 | ✅ (2026-11-03) | | | | |
| R2 | ✅ (2026-11-03) | | | | |
| M2 | ✅ (2026-11-03) | | | | |
| S2 | ✅ (2026-11-03) | | | | |
| D2 | ✅ (2026-11-03) | | | | |
| W3 | ✅ (2026-11-03) | | | | |
| T3 | ✅ (2026-11-03) | | | | |
| H3 | ✅ (2026-11-03) | | | | |
| L5 | ✅ (2026-11-03) | | | | |
| L6 | ✅ (2026-11-05, cargado) | | | | |
| R3 | ✅ (2026-11-03) | | | | |
| M3 | ✅ (2026-11-03) | | | | |
| S3 | ✅ (2026-11-03) | ✅ aprobado (2026-11-13), a cargar | ✅ aprobado (2026-11-14), a cargar | ✅ aprobado (2026-11-14), a cargar | |
| D3 | ✅ (2026-11-03) | | | | |
| W4 | ✅ (2026-11-05, cargado) | | | | |
| T4 | ✅ (2026-11-05, cargado) | | | | |
| H4 | ✅ (2026-11-05, cargado) | | | | |
| L7 | ✅ (2026-11-05, cargado) | | | | |
| L8 | ✅ (2026-11-05, cargado) | | | | |
| R4 | ✅ (2026-11-05, cargado) | | | | |
| M4 | ✅ (2026-11-03) | | | | |
| S4 | ✅ (2026-11-03) | | | | |
| D4 | ✅ (2026-11-03) | | | | |

## Los creeps (cada uno se completa al diseñarlo)

_(vacío: el primero es W1, nivel 1)_
