# Reporte de auditoría del catálogo (2026-09-30)

> Pedido del dueño: una auditoría a fondo del catálogo de fábrica (`comun/catalogo.js`, 889 ítems) contra los criterios
> de diseño acordados, con una lista de todo lo que amerita una observación, un chequeo de duplicados y una reflexión
> sobre efectos que ningún ítem usa. Hoja de decisiones: [`auditoria-catalogo-2026-09.md`](auditoria-catalogo-2026-09.md).
> Criterios usados: [`rework-armas.md`](rework-armas.md), [`rework-defensa.md`](rework-defensa.md),
> [`guia-de-diseno.md`](guia-de-diseno.md) y la calculadora de armas (`herramientas/calculadora_armas.py`, v0 en calibración).

## Resumen

- **295 de 889 ítems tienen alguna observación.** La mayoría no son errores sueltos: son **reglas que se aprobaron el
  25/09 y nunca se aplicaron al catálogo** (las pantallas de auditoría de armas y defensa quedaron sin decisiones).
- **88 quedaron marcados con ⚠️ adelante del nombre** (se ven así en las tiendas): los que tienen un problema de juego
  real — crítico por encima del tope, efectos que ya no existen, «Ignora» fuera de lugar, resistencia a crítico por encima
  del tope, Defensa desproporcionada, muchos Nitros, tier muy distinto al que valen, texto que no coincide con los bonos.
  Al corregir uno, se le saca el ⚠️. (Las búsquedas por nombre del código ignoran el ⚠️.)
- **Sin ⚠️ a propósito:** ~120 piezas con la resistencia a crítico en un lugar que la regla ya no permite (es un reajuste
  en masa: marcarlas llenaría las tiendas), y cosas de criterio (precios según la calculadora, bonos apenas por encima
  del tier, variaciones pendientes).
- **Duplicados:** ningún id repetido; **3 nombres repetidos** en ítems distintos y **64 grupos** de ítems con la misma
  mecánica y distinto nombre (la mayoría a propósito, pero con variaciones ya aprobadas que falta aplicar).
- **Consumibles:** sin observaciones de peso (precios coherentes entre pares, ninguna "trampa" que no sea trampa).

### Lo que más pesa en la mesa
1. **Nitros de más:** Botas de siete leguas (+6 Nitros por turno), Zapatillas de maratón (+3, siendo Buena calidad),
   Botas de Hermes, Botas de unicornio y Zapatillas Nike (+3). Con la regla de que Movimiento = Nitros, son de lo más
   fuerte del catálogo.
2. **Defensa desproporcionada:** Perneras de hueso de coloso menor (Def 15, lo común en su lugar y tier es 6), Armadura
   pesada de hierro (Común con Def 10, lo común es 4), Coraza (Buena calidad con Def 10), Gran yelmo (Raro con Def 9, lo
   común es 3).
3. **Crítico:** las armas Tipo 4 de las tandas nuevas con Crítico potente +3/+4 (si el potente cuenta para el tope), los
   anillos Ojo del Verdugo (+1/+2/+3 frecuente) y los Guanteletes de garra de lobizón (+2 frecuente en guantes).
4. **Armas que valen mucho menos que su tier:** Garra de Fafner (Legendaria, la calculadora la valora Común una vez que
   se le sacan los efectos descartados), Espada de Nosferatu y Reflejo de Acero (Legendarias que valen Raro), Colmillo
   dientes de sable (Excepcional que vale Buena calidad). Y al revés: Maza, Martillo de bola y garrote de hueso, Comunes
   que valen Raro por la cantidad de dados.

## Reflexión: efectos y mecánicas que existen en el juego y ningún ítem usa

Lo que el juego ya sabe hacer (automatizado o a mano) y el catálogo no aprovecha. Son **invitaciones**, no faltantes
obligatorios:

**Stats que ningún ítem da**
- **Armadura mágica** (`armadmg`, creada el 27/09 para reducir el daño mágico): **0 ítems**. Es el hueco más grande: el
  daño mágico hoy va directo a la vida y no hay ninguna pieza que lo frene. Candidatos: túnicas, capas y amuletos de
  Raro para arriba (la regla de casteo sugiere reservarla para Raro+).
- **SP y SP Regen**: 0 ítems con el stat nuevo (16 viejos con "Bonos", que se convierten a SP al cargar). Los magos no
  tienen equipo que les dé reserva o regeneración: báculos, grimorios, túnicas.
- **Percepción** (0) y **Luz** (0): la luz hoy vive solo en consumibles (antorchas, faroles). Un casco de minero o una
  lámpara de cinturón darían Luz permanente; unas gafas o un amuleto, Percepción.
- **PdG.Esp** (5 ítems) y **Res.Esp** (14): pocos para el peso que tiene el casteo.

**Efectos de arma poco o nada usados**
- **Escarcha** (hielo) y **Parálisis** (rayo): existen como estados y **ningún arma los aplica**. Armas elementales de
  tier alto (con probabilidad, como pide la guía: son debuffs muy fuertes).
- **Derribar** (2 armas), **Prende fuego** (2), **Drena vida** (4), **Aturdir** (4): muy poco para ser efectos "de casa"
  o habilitados de varias familias.

**Estados que ningún equipo da al equiparse** (hoy solo existen como consumible o habilidad)
- **Espinas** (una armadura de púas), **Blindado**, **Sigilo** (las Botas de Hobbit lo dicen en el texto pero no lo
  dan), **Excedente de vida**, **Escudo especial / Barrera** (un escudo mágico que se recarga), **Afortunado** (hay un solo
  anillo).

**Mecánicas del mapa sin consumible**
- **Zonas persistentes** (nubes, gas, humo): hay 72 trampas consumibles y **ninguna deja una zona** al dispararse,
  aunque el mapa ya lo sabe hacer desde el 28/09. Una bomba de humo o una granada de gas saldrían casi solas.
- **Teleport** (piedra de retorno, pergamino de salto): el mapa lo hace en trampas; ningún consumible.
- **Iniciativa** (subir o bajar en la tabla) y **niebla/visión** (revelar un área, cegar): casi sin ítems.

**Cosas pensadas que todavía no tienen soporte** (para el futuro)
- **Durabilidad** como elemento de diseño (escudos resistentes, armas para Parry).
- **Aceites y venenos para hoja**: un consumible que le da a tu arma un efecto al golpear por N golpes.
- **Explosivos Tipo 12** (en pausa por decisión del dueño).

## Preguntas para decidir
1. **Tope de crítico por tier:** ¿cuenta el Crítico potente igual que el frecuente? (define 7 de los 8 marcados por
   crítico).
2. **Crítico en anillos y guantes** (Ojo del Verdugo, Guanteletes de garra de lobizón): ¿sí o no?
3. **Martillo de Aurelius Risus** (copia vieja con Crítico +10 en su mochila): ¿se corrige o se resuelve en la mesa?
4. **Reajuste en masa de la resistencia a crítico por lugar** (~120 piezas, sección 2): ¿lo aplico automático y te dejo
   la lista para auditar, o lo vemos por partes?
5. **Variaciones aprobadas para ítems idénticos** (sección 4): ¿las aplico? (cada copia recibe un +1 distinto).
6. **Nombres repetidos** (Hacha de doble filo, Mangual, Escudo triangular): ¿renombro uno de cada par?
7. **Armas que valen muy distinto a su tier:** ¿subo o bajo el tier, o se ajustan los números para que calcen?

## 1. Los 88 marcados con ⚠️ (problema de juego real)

Cada ítem aparece una vez, bajo su motivo principal, con **todas** sus observaciones. Al corregir uno, se le saca el ⚠️ del nombre.


### Crítico sobre el tope (8)

- **Aguijón de la Reina Avispa** — Excepcional, arma 1 mano: frecuente +1 y potente +4: pasan el tope de Excepcional (+3) si el potente cuenta
- **Daga de duelo** — Buena Calidad, arma 1 mano: frecuente +0 y potente +2: pasan el tope de Buena Calidad (+1) si el potente cuenta
- **Estileto común** — Común, arma 1 mano: Crítico frecuente +1 y un Común admite hasta +0; $50; la calculadora sugiere ~$120
- **Estileto ritual del acólito** — Común, arma 1 mano: Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.; Crítico frecuente +1 y un Común admite hasta +0; $50; la calculadora sugiere ~$140
- **Estoque de esgrima** — Raro, arma 1 mano: frecuente +1 y potente +3: pasan el tope de Raro (+2) si el potente cuenta
- **Puñal del sereno** — Raro, arma 1 mano: frecuente +1 y potente +3: pasan el tope de Raro (+2) si el potente cuenta
- **Puñal envenenado** — Raro, arma 1 mano: frecuente +0 y potente +3: pasan el tope de Raro (+2) si el potente cuenta
- **Lanza de lisiar** — Raro, arma 2 manos: frecuente +0 y potente +3: pasan el tope de Raro (+2) si el potente cuenta

### Crítico desperdiciado (1)

- **Facón de Martín Fierro** — Legendario, arma 1 mano: «Primera sangre» pasa a «Sangrado»; «Sangrado» estaba repetido: queda uno solo; Crítico frecuente +4 → +2 (el rango del crítico no baja de 2: un Tipo 4 aprovecha 2 puntos)

### Crítico en algo que no es arma (4)

- **Anillo de Ojo del Verdugo** — Común, anillo: frecuente +1, potente +0
- **Anillo de Ojo del Verdugo mayor** — Raro, anillo: frecuente +2, potente +0
- **Anillo de Ojo del Verdugo superior** — Legendario, anillo: frecuente +3, potente +0
- **Guanteletes de garra de lobizón** — Excepcional, manos: frecuente +2, potente +0; Res. crítico Tipo 4 +3 y un Excepcional admite +2; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 8; lo común en manos Excepcional es 4

### «Ignora» fuera de lugar (6)

- **Daga de guardia** — Buena Calidad, arma 1 mano: Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- **Daga de la viuda verde** — Buena Calidad, arma 1 mano: Variación para que no sea idéntica a otra arma del catálogo: Envenenar 25 %.; Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- **Falchion** — Buena Calidad, arma 1 mano: Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- **Hacha con pico** — Buena Calidad, arma 1 mano: Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- **Hacha de doble filo** — Raro, arma 1 mano: Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro; $120; la calculadora sugiere ~$350
- **Lucero del alba** — Raro, arma 1 mano: Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro

### Efecto descartado (9)

- **Espada de Nosferatu** — Legendario, arma 1 mano: Quitar «Ignora armadura» (ya no existe en el diseño nuevo); la calculadora la valora Raro (14.3 PC) y está como Legendario; $1300; la calculadora sugiere ~$260
- **Garra de Fafner** — Legendario, arma 1 mano: Quitar «Ignora armadura» (ya no existe en el diseño nuevo); Quitar «Golpes seguidos» (ya no existe en el diseño nuevo); la calculadora la valora Común (5.3 PC) y está como Legendario; $1100; la calculadora sugiere ~$60
- **Hacha de Durin** — Legendario, arma 1 mano: «Arruina armadura» pasa a «Rompe armadura»; «Lisiado» ya no es 100 %: 75 % (Legendario); «Lisiado» está fuera del universo de la familia (hacha): caso excepcional, solo si es puntual
- **Hacha de guerra pesada** — Raro, arma 1 mano: «Arruina armadura» pasa a «Rompe armadura»
- **Hacha filo de diamante** — Excepcional, arma 1 mano: «Arruina armadura» pasa a «Rompe armadura»
- **Martillo de guerra rúnico** — Excepcional, arma 1 mano: «Pajaritos» pasa a «Lisiado»; «Lisiado» ya no es 100 %: 50 % (Excepcional); «Lisiado» está fuera del universo de la familia (contundente): caso excepcional, solo si es puntual
- **Maza de vibranium** — Legendario, arma 1 mano: «Media armadura» pasa a «Rompe armadura»
- **Pistola de chispa** — Raro, arma 1 mano: Quitar «Estruendo» (ya no existe en el diseño nuevo); Rango +4: un arma de rango Raro tiene entre +5 y +6
- **Rompefilas** — Excepcional, arma 1 mano: «Empuje» pasa a «Demora»

### Explosión fuera del Tipo 12 (1)

- **Martillo de Vulcano** — Legendario, arma 1 mano: «Explosión» está fuera del universo de la familia (contundente): caso excepcional, solo si es puntual; Explosión en un Tipo 10: la Explosión es exclusiva del Tipo 12

### Tier muy distinto al que vale (5)

- **Colmillo dientes de sable** — Excepcional, arma 1 mano: la calculadora la valora Buena Calidad (9.1 PC) y está como Excepcional; $900; la calculadora sugiere ~$120
- **Martillo de bola** — Común, arma 1 mano: la calculadora la valora Raro (11.6 PC) y está como Común; $115; la calculadora sugiere ~$400
- **Maza** — Común, arma 1 mano: Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.; la calculadora la valora Raro (11.6 PC) y está como Común; $50; la calculadora sugiere ~$400
- **Reflejo de Acero** — Legendario, arma 1 mano: la calculadora la valora Raro (12.8 PC) y está como Legendario; $1400; la calculadora sugiere ~$210
- **garrote de hueso** — Común, arma 1 mano: Variación para que no sea idéntica a otra arma del catálogo: bloqueo +1.; Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier; la calculadora la valora Raro (12.6 PC) y está como Común; $120; la calculadora sugiere ~$450

### Muchos bonos para su tier (6)

- **Báculo mágico** — Excepcional, arma 1 mano: rangocasteo +5 → +3 (máximo +3 por stat); Tiene 7 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- **Estoque de guardia** — Común, arma 1 mano: Tiene 3 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- **Katana de maestro** — Raro, arma 1 mano: Tiene 6 puntos de bonos y un Raro admite hasta 3: recortar o subir de tier
- **Katana del viento** — Excepcional, arma 1 mano: Tiene 7 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- **Lanza del Paso de las Tres Puertas** — Legendario, arma 2 manos: Tiene 8 puntos de bonos y un Legendario admite hasta 6: recortar o subir de tier
- **Pica del Muro Eterno** — Excepcional, arma 2 manos: Tiene 6 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier

### Resistencia a crítico sobre el tope (10)

- **Coraza de placa de anquilosaurio** — Excepcional, torso rígido: Movimiento -1 = -1 Nitros por turno (drawback muy grande); Res. crítico Tipo 4 +3 y un Excepcional admite +2; Res. crítico Tipo 10 +1: el Tipo 10 solo va en la cabeza y los escudos
- **Peto rúnico** — Raro, torso rígido: Res. crítico Tipo 6 +2 y un Raro admite +1
- **Bacinete de recluta** — Común, cabeza: Res. crítico Tipo 4 +2 y un Común admite +1
- **Capacete de aprendiz de herrero** — Común, cabeza: Res. crítico Tipo 4 +2 y un Común admite +1
- **Yelmo de asta de unicornio** — Excepcional, cabeza: Res. crítico Tipo 4 +3 y un Excepcional admite +2
- **Grebas de piel de hipogrifo** — Excepcional, piernas: Res. crítico Tipo 4 +3 y un Excepcional admite +2; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Pantalón de cuero de rinoceronte** — Raro, piernas: Res. crítico Tipo 6 +2 y un Raro admite +1; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Perneras de acero de meteorito** — Raro, piernas: Res. crítico Tipo 6 +2 y un Raro admite +1; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Perneras de escamas** — Buena Calidad, piernas: Res. crítico Tipo 6 +2 y un Buena Calidad admite +1; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Botas de pezuña de yastay** — Excepcional, pies: Movimiento +2 = +2 Nitros por turno (el recurso más preciado); Res. crítico Tipo 4 +3 y un Excepcional admite +2

### Defensa muy alta para su tier (24)

- **Armadura compuesta** — Buena Calidad, torso rígido: Def 8; lo común en torso Buena Calidad es 4
- **Armadura de placas** — Buena Calidad, torso rígido: Def 7; lo común en torso Buena Calidad es 4
- **Armadura pesada de hierro** — Común, torso rígido: Def 10; lo común en torso Común es 4
- **Coraza** — Buena Calidad, torso rígido: Def 10; lo común en torso Buena Calidad es 4
- **Coraza de bandas remachadas** — Buena Calidad, torso rígido: Movimiento -2 = -2 Nitros por turno (drawback muy grande); Def 7; lo común en torso Buena Calidad es 4
- **Coraza de guardia de cuartel** — Común, torso rígido: Def 7; lo común en torso Común es 4
- **Coraza de puerta** — Común, torso rígido: Def 7; lo común en torso Común es 4
- **Casco de acero de meteorito** — Raro, cabeza: Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 7; lo común en cabeza Raro es 3
- **Gran yelmo** — Raro, cabeza: Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 9; lo común en cabeza Raro es 3
- **Gran yelmo del torneo** — Raro, cabeza: Res. crítico Tipo 6 +2: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 8; lo común en cabeza Raro es 3
- **Yelmo con cresta de comandante** — Raro, cabeza: Def 9; lo común en cabeza Raro es 3
- **Yelmo con cuerno de rinoceronte** — Raro, cabeza: Movimiento -1 = -1 Nitros por turno (drawback muy grande); Res. crítico Tipo 6 +2: el Tipo 6 solo va en torso rígido, manos y piernas; Def 6; lo común en cabeza Raro es 3
- **Yelmo del centinela insomne** — Raro, cabeza: Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 6; lo común en cabeza Raro es 3
- **Escudo torre del Guardián** — Excepcional, escudo 2 manos: Movimiento -2 = -2 Nitros por turno (drawback muy grande); Res. crítico Tipo 6 +2: el Tipo 6 solo va en torso rígido, manos y piernas; más de +3: bloqueo +4; Def 14; lo común en escudo Excepcional es 7
- **Guanteletes de adamantium** — Legendario, manos: Res. crítico Tipo 8 +2: el Tipo 8 solo va en torso rígido y escudo; Res. crítico Tipo 10 +2: el Tipo 10 solo va en la cabeza y los escudos; Res. crítico Tipo 12 +2: el Tipo 12 solo va en cinturón y anillos; Def 10; lo común en manos Legendario es 5
- **Guanteletes de la Mano de Dios** — Legendario, manos: Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; más de +3: pdg +5; Def 10; lo común en manos Legendario es 5
- **Guanteletes del herrero real** — Raro, manos: Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 8; lo común en manos Raro es 4
- **Manoplas de hueso de espinosaurio** — Excepcional, manos: Movimiento -1 = -1 Nitros por turno (drawback muy grande); Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Res. crítico Tipo 10 +1: el Tipo 10 solo va en la cabeza y los escudos; Def 10; lo común en manos Excepcional es 4
- **Perneras articuladas** — Buena Calidad, piernas: Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 7; lo común en piernas Buena Calidad es 4
- **Perneras de hueso de coloso menor** — Excepcional, piernas: Movimiento -1 = -1 Nitros por turno (drawback muy grande); Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Res. crítico Tipo 10 +1: el Tipo 10 solo va en la cabeza y los escudos; Def 15; lo común en piernas Excepcional es 6
- **Botas de cuero** — Común, pies: Def 6; lo común en pies Común es 2.5
- **Botas de hierro pesadas** — Raro, pies: Res. crítico Tipo 10 +1: el Tipo 10 solo va en la cabeza y los escudos; Def 10; lo común en pies Raro es 5.5
- **Botas de placas del guardia de avanzada** — Buena Calidad, pies: Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Def 7; lo común en pies Buena Calidad es 4
- **Sabatones de hueso de troll** — Excepcional, pies: Movimiento -1 = -1 Nitros por turno (drawback muy grande); Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo; Res. crítico Tipo 10 +1: el Tipo 10 solo va en la cabeza y los escudos; Def 10; lo común en pies Excepcional es 5

### Muchos Nitros (13)

- **Anillo de Piernas de Viento mayor** — Raro, anillo: Movimiento +2 = +2 Nitros por turno (el recurso más preciado)
- **Anillo de Piernas de Viento superior** — Legendario, anillo: Movimiento +3 = +3 Nitros por turno (el recurso más preciado)
- **Calzas del runner** — Raro, piernas: Movimiento +2 = +2 Nitros por turno (el recurso más preciado)
- **Grebas de casco de unicornio** — Excepcional, piernas: Movimiento +2 = +2 Nitros por turno (el recurso más preciado); Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Pantalón de Elvis** — Legendario, piernas: Movimiento +2 = +2 Nitros por turno (el recurso más preciado); más de +3: eva +4
- **Pantalón de lana de yastay** — Excepcional, piernas: Movimiento +2 = +2 Nitros por turno (el recurso más preciado); Res. crítico Tipo 8 +1: el Tipo 8 solo va en torso rígido y escudo
- **Botas de Hermes** — Legendario, pies: Movimiento +3 = +3 Nitros por turno (el recurso más preciado); más de +3: ini +4
- **Botas de siete leguas** — Legendario, pies: Movimiento +6 = +6 Nitros por turno (el recurso más preciado); Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; más de +3: mov +6
- **Botas de unicornio** — Excepcional, pies: Movimiento +3 = +3 Nitros por turno (el recurso más preciado); Res. crítico Tipo 6 +2: el Tipo 6 solo va en torso rígido, manos y piernas
- **Botas del mensajero veloz** — Raro, pies: Movimiento +2 = +2 Nitros por turno (el recurso más preciado)
- **Medias de Pelo de Unicornio** — Legendario, pies: Movimiento +2 = +2 Nitros por turno (el recurso más preciado); más de +3: resm +5, rescc +5, resmg +5
- **Zapatillas Nike** — Excepcional, pies: Movimiento +3 = +3 Nitros por turno (el recurso más preciado)
- **Zapatillas de maratón** — Buena Calidad, pies: Movimiento +3 = +3 Nitros por turno (el recurso más preciado)

### El texto no coincide con los bonos (1)

- **Escudo pequeño** — Común, escudo: Res. crítico Tipo 6 +1: el Tipo 6 solo va en torso rígido, manos y piernas; el detalle dice Res. crítico Tipo 8 +1 y el bono es +0

## 2. Resistencia a crítico en un lugar que la regla no permite (sin ⚠️)

La regla de lugares se aprobó el 25/09 pero nunca se aplicó al catálogo. No los marqué para no llenar las tiendas de ⚠️: es un reajuste en masa que conviene hacer de una vez, con la herramienta de auditoría de defensa. Resumen por regla:

- **Tipo 10** (el Tipo 10 solo va en la cabeza y los escudos) — 17: Anillo de blindaje (Excepcional), Armadura compuesta revestida de acero (Raro), Botas de hierro pesadas (Raro), Botas de vibranium (Legendario), Coraza de Mithril (Legendario), Coraza de hierro (Raro), Coraza de placa de anquilosaurio (Excepcional), Coraza de titanio (Excepcional), Coraza del Endoesqueleto (Legendario), Coraza del capitán de la ciudad (Raro), Cota de placas (Raro), Grebas del Coloso de Rodas (Legendario), Guanteletes de adamantium (Legendario), Guantes de piel de unicornio (Legendario), Manoplas de hueso de espinosaurio (Excepcional), Perneras de hueso de coloso menor (Excepcional), Sabatones de hueso de troll (Excepcional)
- **Tipo 12** (el Tipo 12 solo va en cinturón y anillos) — 7: Botas de vibranium (Legendario), Casco de Magnetto (Legendario), Casco de Xavier (Legendario), Coraza de Mithril (Legendario), Grebas del Coloso de Rodas (Legendario), Guanteletes de adamantium (Legendario), Guantes de piel de unicornio (Legendario)
- **Tipo 4** (el Tipo 4 no va en anillo) — 1: Anillo de blindaje (Excepcional)
- **Tipo 6** (el Tipo 6 solo va en torso rígido, manos y piernas) — 81: Anillo de blindaje (Excepcional), Armadura con tachas (Común), Armadura de cuero reforzado (Buena Calidad), Baluarte del Último Bastión (Legendario), Botas con espolones de gallo de riña (Raro), Botas de Hobbit (Legendario), Botas de cuero de rinoceronte (Raro), Botas de esquí sin los esquís (Común), Botas de hierro del coloso menor (Raro), Botas de lona de recluta (Común), Botas de piel de chupacabras (Excepcional), Botas de placas del guardia de avanzada (Buena Calidad), Botas de siete leguas (Legendario), Botas de suela claveteada (Común), Botas de unicornio (Excepcional), Botas de vibranium (Legendario), Botines de soldado raso (Común), Botines tachonados de correo (Buena Calidad), Broquel de acero (Raro), Broquel de hierro (Buena Calidad), Broquel de titanio (Excepcional), Campera de cuero de motociclista con tachas (Común), Campera de marinero espacial (Común), Capacete de hojalata (Común), Capuz de cuero curtido (Buena Calidad), Capuz de lana de yacumama (Excepcional), Casco (Común), Casco de Magnetto (Legendario), Casco de Xavier (Legendario), Casco de acero de meteorito (Raro), Casco de artillero pintado a mano (Común), Casco de bandas remachadas (Buena Calidad), Casco de cuero endurecido (Común), Casco de escamas superpuestas (Buena Calidad), Casco de moto vintage pintado a mano (Común), Casco de muralla (Común), Casco de obra abollado (Común), Chaleco de Kevlar (Raro), Chaleco de escamas del envenenador (Buena Calidad), Cota de escamas de cuero (Buena Calidad), Cota de escamas del jefe de guerra (Buena Calidad), Cota de malla de Bilbo (Legendario), Cota de malla de acero (Buena Calidad), Cota de malla de aluminio reforzado (Raro), Cota de malla de contramaestre (Buena Calidad), Cota de malla de hierro (Común), Cota de malla de titanio (Excepcional), Cota del cazarrecompensas (Buena Calidad), Escudo de cuero endurecido (Común), Escudo de madera (Común), Escudo de taberna (Común), Escudo pequeño (Común), Escudo torre del Guardián (Excepcional), Escudo triangular (Raro), Gambesón acolchado de doble capa (Buena Calidad), Gambesón de mando del jefe bandido (Raro), Gambesón del capitán del Espectro (Buena Calidad), Gambesón del veterano de frontera (Raro), Gorro de fieltro de feria (Común), Gran yelmo (Raro), Gran yelmo del torneo (Raro), Muralla de acero (Raro), Máscara samurai (Raro), Pavés de madera reforzada (Buena Calidad), Pieles del berserker (Buena Calidad), Polainas de malla (Raro), Rodela de madera (Común), Sabatones de anillas (Común), Sabatones de escamas (Buena Calidad), Sabatones de hojalata (Común), Sabatones de hueso de troll (Excepcional), Sabatón (Buena Calidad), Tapa de tacho de basura (Común), Yelmo con cuerno de rinoceronte (Raro), Yelmo de caparazón de peuchen (Excepcional), Yelmo de nasal (Buena Calidad), Yelmo de visera (Buena Calidad), Yelmo del centinela insomne (Raro), alpargatas de cuero (Común), Égida de Gladiador (Excepcional), Égida menor (Raro)
- **Tipo 8** (el Tipo 8 solo va en torso rígido y escudo) — 63: Anillo de blindaje (Excepcional), Borceguíes de punta de acero (Buena Calidad), Botas de cabalgata (Buena Calidad), Botas de cuero de rinoceronte (Raro), Botas de hierro del coloso menor (Raro), Botas de piel de carpincho (Buena Calidad), Botas de placas del guardia de avanzada (Buena Calidad), Botas de vibranium (Legendario), Botas del expedicioón (Raro), Capuz de lana de yacumama (Excepcional), Casco de Magnetto (Legendario), Casco de Xavier (Legendario), Casco de acero de meteorito (Raro), Casco de paquicefalosaurio (Excepcional), Chaleco de escamas del envenenador (Buena Calidad), Cota de escamas de cuero (Buena Calidad), Cota de escamas del jefe de guerra (Buena Calidad), Cota de malla de Bilbo (Legendario), Cota de malla de acero (Buena Calidad), Cota de malla de aluminio reforzado (Raro), Cota de malla de contramaestre (Buena Calidad), Cota de malla de titanio (Excepcional), Cota del cazarrecompensas (Buena Calidad), Gran yelmo (Raro), Gran yelmo del torneo (Raro), Grebas de acero templado (Buena Calidad), Grebas de bandas articuladas (Buena Calidad), Grebas de casco de unicornio (Excepcional), Grebas de piel de hipogrifo (Excepcional), Grebas del Coloso de Rodas (Legendario), Grebas del centinela de hierro (Raro), Grebas del rastreador (Buena Calidad), Grebas mixtas de escudero (Buena Calidad), Guanteletes (Buena Calidad), Guanteletes de acero templado (Buena Calidad), Guanteletes de adamantium (Legendario), Guanteletes de combate (Raro), Guanteletes de garra de lobizón (Excepcional), Guanteletes de la Mano de Dios (Legendario), Guanteletes del herrero real (Raro), Guantes de cuero Tachonado (Buena Calidad), Guantes de piel de unicornio (Legendario), Manoplas de escamas (Buena Calidad), Manoplas de hueso de espinosaurio (Excepcional), Manoplas laminadas (Raro), Manoplas mixtas de guardia (Buena Calidad), Mitones de piel de owl-bear (Raro), Pantalón de cuero de rinoceronte (Raro), Pantalón de lana de yastay (Excepcional), Perneras articuladas (Buena Calidad), Perneras de acero de meteorito (Raro), Perneras de escamas (Buena Calidad), Perneras de hueso de coloso menor (Excepcional), Sabatones de acero de meteorito (Raro), Sabatones de acero templado (Buena Calidad), Sabatones de caparazón de tatú carreta (Excepcional), Sabatones de escamas (Buena Calidad), Sabatones de hueso de troll (Excepcional), Sabatones del centinela de hierro (Raro), Sabatones mixtos de escudero (Buena Calidad), Sabatón (Buena Calidad), Yelmo de caparazón de peuchen (Excepcional), Yelmo del centinela insomne (Raro)

## 3. Otras observaciones (sin ⚠️: a revisar con calma)


### Armas: reglas del rework que faltan aplicar (incluye las variaciones aprobadas para armas idénticas) (74)

- Arco del rastreador (Común): Variación para que no sea idéntica a otra arma del catálogo: Envenenar 25 %.
- Ballesta de almenara (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: pdg +1.
- Ballesta de mano (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Envenenar 25 %.
- Ballesta del arbusto (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: rng +1.
- Bastón del trueno (Común): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Báculo del Sumo Profeta (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: rng +1.
- Báculo del inquisidor (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.
- Báculo mágico (Excepcional): rangocasteo +5 → +3 (máximo +3 por stat)
- Cimitarra del contramaestre (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Cuchillo de cocina reconvertido (Común): Variación para que no sea idéntica a otra arma del catálogo: pdg +1.
- Cuchillo del grumete polizón (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Daga de guardia (Buena Calidad): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Daga de la viuda verde (Buena Calidad): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Daga de la viuda verde (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Envenenar 25 %.
- Daga del sacrificio (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 33 %.
- Espada bastarda del Espectro (Raro): Variación para que no sea idéntica a otra arma del catálogo: Lisiado 25 %.
- Espada de Nosferatu (Legendario): Quitar «Ignora armadura» (ya no existe en el diseño nuevo)
- Espada de alquiler oxidada (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Espada de entrenamiento (Común): Variación para que no sea idéntica a otra arma del catálogo: Lisiado 25 %.
- Espada de entrenamiento (Común): «Lisiado» estaba repetido: queda uno solo
- Espada de recluta de la guardia (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Espada de taberna (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Espada del Jefe de los Mil Caminos (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: parry +1.
- Espada del veterano de mil batallas (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: crit +1.
- Estilete de práctica (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: pdg +1.
- Estileto ritual del acólito (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Facón de Martín Fierro (Legendario): Crítico frecuente +4 → +2 (el rango del crítico no baja de 2: un Tipo 4 aprovecha 2 puntos)
- Facón de Martín Fierro (Legendario): «Primera sangre» pasa a «Sangrado»
- Facón de Martín Fierro (Legendario): «Sangrado» estaba repetido: queda uno solo
- Falchion (Buena Calidad): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Garra de Fafner (Legendario): Quitar «Golpes seguidos» (ya no existe en el diseño nuevo)
- Garra de Fafner (Legendario): Quitar «Ignora armadura» (ya no existe en el diseño nuevo)
- Garrote de pastor (Común): Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.
- Garrote de pastor (Común): «Demora» estaba repetido: queda uno solo
- Hacha (Común): «Rompe armadura» con porcentaje (25 %) en tier Común
- Hacha con pico (Buena Calidad): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Hacha de Durin (Legendario): «Arruina armadura» pasa a «Rompe armadura»
- Hacha de Durin (Legendario): «Lisiado» ya no es 100 %: 75 % (Legendario)
- Hacha de batalla (Buena Calidad): «Rompe armadura» con porcentaje (33 %) en tier Buena Calidad
- Hacha de constructor (Común): «Rompe armadura» con porcentaje (25 %) en tier Común
- Hacha de doble filo (Buena Calidad): «Rompe armadura» con porcentaje (33 %) en tier Buena Calidad
- Hacha de doble filo (Raro): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Hacha de guerra pesada (Raro): «Arruina armadura» pasa a «Rompe armadura»
- Hacha de la furia roja (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Hacha de la furia roja (Buena Calidad): «Rompe armadura» con porcentaje (33 %) en tier Buena Calidad
- Hacha del Jefe de Guerra (Raro): Variación para que no sea idéntica a otra arma del catálogo: bloqueo +1.
- Hacha del clan (Común): Variación para que no sea idéntica a otra arma del catálogo: bloqueo +1.
- Hacha del clan (Común): «Rompe armadura» con porcentaje (25 %) en tier Común
- Hacha filo de diamante (Excepcional): «Arruina armadura» pasa a «Rompe armadura»
- Hachuela de leñador (Común): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Honda del cazador de jabalíes (Común): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Hoz ceremonial (Común): Variación para que no sea idéntica a otra arma del catálogo: Lisiado 25 %.
- Katana del cazarrecompensas (Raro): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 33 %.
- Lanza de guardia de puerta (Común): Variación para que no sea idéntica a otra arma del catálogo: rng +1.
- Lucero del alba (Raro): Quitar «Ignora 1 de Res. crítico»: solo va en armas de Tipo 4 y 6 desde Raro
- Machete de chacarero (Común): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Martillo de Vulcano (Legendario): Explosión en un Tipo 10: la Explosión es exclusiva del Tipo 12
- Martillo de guerra rúnico (Excepcional): «Lisiado» ya no es 100 %: 50 % (Excepcional)
- Martillo de guerra rúnico (Excepcional): «Pajaritos» pasa a «Lisiado»
- Maza (Común): Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.
- Maza de guardia (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: parry +1.
- Maza de vibranium (Legendario): «Media armadura» pasa a «Rompe armadura»
- Mazo de carnicero (Común): Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.
- Mazo de carnicero (Común): «Demora» estaba repetido: queda uno solo
- Pistola de chispa (Raro): Quitar «Estruendo» (ya no existe en el diseño nuevo)
- Porra de guardia (Común): Variación para que no sea idéntica a otra arma del catálogo: Demora 25 %.
- Porra de guardia (Común): «Demora» estaba repetido: queda uno solo
- Punzón del ladronzuelo (Común): Variación para que no sea idéntica a otra arma del catálogo: Lisiado 25 %.
- Rompefilas (Excepcional): «Empuje» pasa a «Demora»
- Sable de abordaje (Común): Variación para que no sea idéntica a otra arma del catálogo: ini +1.
- Sable de mando del capitán (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: parry +1.
- Sable del sargento (Buena Calidad): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- Sable mellado del camino real (Común): Variación para que no sea idéntica a otra arma del catálogo: Sangrado 25 %.
- garrote de hueso (Común): Variación para que no sea idéntica a otra arma del catálogo: bloqueo +1.

### Armas: a decidir (55)

- Aguja de la vigilia (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Arcabuz de cubierta (Buena Calidad): Rango +3: un arma de rango Buena Calidad tiene entre +4 y +5
- Arco del cazador de eclipses (Legendario): «Sangrado» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- Arco del Último Halcón (Legendario): «Sangrado» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- Ballesta de almenara (Buena Calidad): Rango +3: un arma de rango Buena Calidad tiene entre +4 y +5
- Ballesta de asedio (Raro): «Rompe armadura» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- Ballesta de mano (Buena Calidad): Rango +3: un arma de rango Buena Calidad tiene entre +4 y +5
- Ballesta pesada (Raro): «Rompe armadura» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- Bastón del trueno (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Báculo del Sumo Profeta (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Báculo mágico (Excepcional): Tiene 7 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Cimitarra del contramaestre (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Cuchilla de carnicero (Raro): «Rompe armadura» está fuera del universo de la familia (cortante): caso excepcional, solo si es puntual
- Cuchillo de cocina reconvertido (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Espada de alquiler oxidada (Común): Lleva 2 efectos y un Común admite 1
- Espada del Jefe de los Mil Caminos (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Espadón (Excepcional): Tiene 5 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Espadón de acero de Toledo (Excepcional): Tiene 5 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Estilete de centinela (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Estoque de guardia (Común): Tiene 3 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Filo del Capitán Sin Nombre (Legendario): Tiene 7 puntos de bonos y un Legendario admite hasta 6: recortar o subir de tier
- Guadaña del segador (Excepcional): «Sangrado» está fuera del universo de la familia (contundente): caso excepcional, solo si es puntual
- Hacha de Durin (Legendario): «Lisiado» está fuera del universo de la familia (hacha): caso excepcional, solo si es puntual
- Hacha de guardia real (Excepcional): Tiene 5 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Hacha de la furia roja (Buena Calidad): Lleva 2 efectos y un Buena Calidad admite 1
- Hacha de madera mística (Excepcional): «Drena vida» está fuera del universo de la familia (hacha): caso excepcional, solo si es puntual
- Hachuela de leñador (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Hoz ceremonial (Común): Lleva 2 efectos y un Común admite 1
- Katana de maestro (Raro): Tiene 6 puntos de bonos y un Raro admite hasta 3: recortar o subir de tier
- Katana del viento (Excepcional): Tiene 7 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Lanza de guardia de puerta (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Lanza del Paso de las Tres Puertas (Legendario): Tiene 8 puntos de bonos y un Legendario admite hasta 6: recortar o subir de tier
- Lanza del guardián del paso (Raro): Tiene 4 puntos de bonos y un Raro admite hasta 3: recortar o subir de tier
- Lanza del portón (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Lanzallamas (Excepcional): Tipo 12 = efecto Explosión (regla del dueño 2026-09-26): un arma T12 sin Explosión no corresponde; rediseñar o pasarla a otro Tipo. Muy rara y circunstancial.
- Machete (Común): «Rompe armadura» está fuera del universo de la familia (cortante): caso excepcional, solo si es puntual
- Machete de chacarero (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Martillo de Vulcano (Legendario): «Explosión» está fuera del universo de la familia (contundente): caso excepcional, solo si es puntual
- Martillo de guerra rúnico (Excepcional): «Lisiado» está fuera del universo de la familia (contundente): caso excepcional, solo si es puntual
- Martillo ergonómico (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Pica de retaguardia (Raro): Tiene 4 puntos de bonos y un Raro admite hasta 3: recortar o subir de tier
- Pica del Muro Eterno (Excepcional): Tiene 6 puntos de bonos y un Excepcional admite hasta 4: recortar o subir de tier
- Pico de guerra (Buena Calidad): «Rompe armadura» está fuera del universo de la familia (punzante): caso excepcional, solo si es puntual
- Pistola de chispa (Raro): Rango +4: un arma de rango Raro tiene entre +5 y +6
- Pistola de duelo de plata (Excepcional): Rango +5: un arma de rango Excepcional tiene entre +6 y +7
- Puñal aserrado (Raro): «Rompe armadura» está fuera del universo de la familia (punzante): caso excepcional, solo si es puntual
- Revólver del pistolero (Legendario): Rango +5: un arma de rango Legendario tiene entre +8 y +8
- Revólver del pistolero (Legendario): «Aturdir» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- Rompemalla (Raro): «Rompe armadura» está fuera del universo de la familia (punzante): caso excepcional, solo si es puntual
- Sable de abordaje (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier
- Sable de mando del capitán (Buena Calidad): Tiene 3 puntos de bonos y un Buena Calidad admite hasta 2: recortar o subir de tier
- Sagaris (Raro): Lleva 2 efectos y un Raro admite 1
- Trabuco del contrabandista (Raro): Rango +4: un arma de rango Raro tiene entre +5 y +6
- Trabuco del contrabandista (Raro): «Derribar» está fuera del universo de la familia (rango): caso excepcional, solo si es puntual
- garrote de hueso (Común): Tiene 2 puntos de bonos y un Común admite hasta 1: recortar o subir de tier

### Más de +3 en un stat (piezas que no son armas) (22)

- Baluarte del Último Bastión (Legendario): más de +3: bloqueo +5
- Bata de Sandro (Legendario): más de +3: resmg +5
- Boina de Martín Fierro (Legendario): más de +3: resm +4
- Botas de Hermes (Legendario): más de +3: ini +4
- Botas de siete leguas (Legendario): más de +3: mov +6
- Botas de vibranium (Legendario): más de +3: resm +4
- Camisa de pelo de unicornio (Excepcional): más de +3: resm +5, rescc +5, resmg +5
- Camisón de Galadriel (Legendario): más de +3: resmg +5
- Casco de Magnetto (Legendario): más de +3: resmg +10
- Coraza del Endoesqueleto (Legendario): más de +3: resm +4
- Escudo de ShiRyu (Legendario): más de +3: parry +4, bloqueo +4
- Escudo torre del Guardián (Excepcional): más de +3: bloqueo +4
- Gorra de Marty McFly (Legendario): más de +3: ini +5
- Grebas del Coloso de Rodas (Legendario): más de +3: resm +4
- Guanteletes de la Mano de Dios (Legendario): más de +3: pdg +5
- Guantes de piel de unicornio (Legendario): más de +3: resmg +5
- Medias de Pelo de Unicornio (Legendario): más de +3: resm +5, rescc +5, resmg +5
- Máscara de diablada boliviana (Excepcional): más de +3: resmg +4
- Pantalón de Elvis (Legendario): más de +3: eva +4
- Peluca de Moria (Legendario): más de +3: resm +4
- Poncho de Martín Fierro (Legendario): más de +3: eva +4
- Égida de Gladiador (Excepcional): más de +3: bloqueo +4

### Movimiento negativo (= −Nitros por turno: drawback muy grande) (22)

- Baluarte del Último Bastión (Legendario): Movimiento -2 = -2 Nitros por turno (drawback muy grande)
- Botas de cuero de rinoceronte (Raro): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Botas de esquí sin los esquís (Común): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Botas de vibranium (Legendario): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Coraza de bandas remachadas (Buena Calidad): Movimiento -2 = -2 Nitros por turno (drawback muy grande)
- Coraza de placa de anquilosaurio (Excepcional): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Coraza del Titán caído (Legendario): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Escudo torre del Guardián (Excepcional): Movimiento -2 = -2 Nitros por turno (drawback muy grande)
- Grebas de anillas cosidas (Común): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Grebas de bandas articuladas (Buena Calidad): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Grebas del Coloso de Rodas (Legendario): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Grebas del centinela de hierro (Raro): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Manoplas de hueso de espinosaurio (Excepcional): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Mochila del buhonero (Excepcional): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Muralla de acero (Raro): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Pavés de madera reforzada (Buena Calidad): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Perneras de hueso de coloso menor (Excepcional): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Sabatones de anillas (Común): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Sabatones de hueso de troll (Excepcional): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Sabatones del centinela de hierro (Raro): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Sabatón (Buena Calidad): Movimiento -1 = -1 Nitros por turno (drawback muy grande)
- Yelmo con cuerno de rinoceronte (Raro): Movimiento -1 = -1 Nitros por turno (drawback muy grande)

### Defensa muy baja para su tier (4)

- Gorro chato de comerciante (terciopelo rojo) (Raro): solo Def 1, menos que lo común en cabeza Buena Calidad (4)
- Guantes finos de señor (Raro): solo Def 1, menos que lo común en manos Buena Calidad (4)
- Túnica de sanador (Buena Calidad): solo Def 1, menos que lo común en torso Común (4)
- Túnica del sacerdote oscuro (Buena Calidad): solo Def 1, menos que lo común en torso Común (4)

### Armas a dos manos con 1 solo dado (5)

- Arco corto (Común): a dos manos con Peso 1 (1 dado de daño)
- Arco de rama (Común): a dos manos con Peso 1 (1 dado de daño)
- Arco del rastreador (Común): a dos manos con Peso 1 (1 dado de daño)
- Bastón ferrado (Común): a dos manos con Peso 1 (1 dado de daño)
- Lanza de caza (Común): a dos manos con Peso 1 (1 dado de daño)

### Precio muy lejos de lo que sugiere la calculadora o de la banda de su tier (41)

- Bastón de monje (Común): $90; la calculadora sugiere ~$200
- Bastón del trueno (Común): $90; la calculadora sugiere ~$220
- Báculo de batalla (Buena Calidad): $140; la calculadora sugiere ~$450
- Báculo del Sumo Profeta (Buena Calidad): $140; la calculadora sugiere ~$500
- Báculo del inquisidor (Buena Calidad): $140; la calculadora sugiere ~$500
- Colmillo dientes de sable (Excepcional): $900; la calculadora sugiere ~$120
- Cuchillo de cocina reconvertido (Común): $65; la calculadora sugiere ~$180
- Espada de Nosferatu (Legendario): $1300; la calculadora sugiere ~$260
- Espada del Jefe de los Mil Caminos (Buena Calidad): $90; la calculadora sugiere ~$350
- Espada del veterano de mil batallas (Buena Calidad): $90; la calculadora sugiere ~$450
- Espada larga (Buena Calidad): $90; la calculadora sugiere ~$280
- Estilete de práctica (Buena Calidad): $85; la calculadora sugiere ~$240
- Estileto común (Común): $50; la calculadora sugiere ~$120
- Estileto ritual del acólito (Común): $50; la calculadora sugiere ~$140
- Estoque de duelista (Raro): $80; la calculadora sugiere ~$350
- Flamberge (Excepcional): $550; la calculadora sugiere ~$190
- Garra de Fafner (Legendario): $1100; la calculadora sugiere ~$60
- Garrote (Común): $60; la calculadora sugiere ~$230
- Hacha danesa (Raro): $130; la calculadora sugiere ~$300
- Hacha de doble filo (Raro): $120; la calculadora sugiere ~$350
- Hacha de la furia roja (Buena Calidad): $110; la calculadora sugiere ~$250
- Hacha de leñador (Común): $60; la calculadora sugiere ~$160
- Hacha del Jefe de Guerra (Raro): $130; la calculadora sugiere ~$350
- Katana (Raro): $120; la calculadora sugiere ~$700
- Katana del cazarrecompensas (Raro): $120; la calculadora sugiere ~$750
- Lanzallamas (Excepcional): $700; la calculadora sugiere ~$2000
- Mangual (Raro): $150; la calculadora sugiere ~$1300
- Martillo (Buena Calidad): $100; la calculadora sugiere ~$450
- Martillo de bola (Común): $115; la calculadora sugiere ~$400
- Martillo de cabeza plana (Buena Calidad): $135; la calculadora sugiere ~$300
- Martillo de cantero (Común): $70; la calculadora sugiere ~$170
- Martillo de sargento (Raro): $140; la calculadora sugiere ~$1000
- Maza (Común): $50; la calculadora sugiere ~$400
- Maza de acero (Raro): $160; la calculadora sugiere ~$750
- Maza de guardia (Buena Calidad): $90; la calculadora sugiere ~$500
- Pistola de duelo de plata (Excepcional): $780; la calculadora sugiere ~$350
- Puñal de Dorne (Excepcional): $850; la calculadora sugiere ~$150
- Reflejo de Acero (Legendario): $1400; la calculadora sugiere ~$210
- Sable del sargento (Buena Calidad): $80; la calculadora sugiere ~$250
- Sagaris (Raro): $130; la calculadora sugiere ~$300
- garrote de hueso (Común): $120; la calculadora sugiere ~$450

### Texto (1)

- Hacha de mano (Común): sin descripción narrativa

## 4. Duplicados

**Mismo id:** ninguno.

**Mismo nombre** (dos ítems distintos que se llaman igual — confunde en tiendas y al buscar por nombre):

- Hacha de doble filo (Buena Calidad, $100, id `new-hacha-de-doble-filo`) / Hacha de doble filo (Raro, $120, id `cat-hacha-de-mano`)
- Mangual (Raro, $160, id `cat-mangual`) / Mangual (Raro, $150, id `new-mangual`)
- Escudo triangular (Buena Calidad, $110, id `cat-escudo-triangular`) / Escudo triangular (Raro, $160, id `new-escudo-triangular`)

**Misma mecánica con otro nombre** (mismos números y efectos: solo cambia el nombre). Muchos son a propósito (el equipo con nombre propio de los creeps humanos, 2026-09-20), y para la mayoría ya hay **variaciones aprobadas el 25/09 que nunca se aplicaron** (un +1 distinto a cada uno, en `herramientas/variaciones_armas.py` y `reajuste_defensa.py`). Grupos:

- (anillo, Común) Anillo de Inmutabilidad = Anillo de Sangre limpia = Anillo de armadura indestructible = Anillo de cáscara protectora = Anillo de mente certera = Anillo de superlinfocitos = Anillo de tendones firmes = Anillo de vigor
- (arma 1 mano, Buena Calidad) Arcabuz de cubierta = Ballesta de almenara = Ballesta de mano = Ballesta del arbusto
- (arma 1 mano, Común) Bastón de monje = Bastón del trueno
- (arma 1 mano, Buena Calidad) Báculo de batalla = Báculo del Sumo Profeta = Báculo del inquisidor
- (arma 1 mano, Buena Calidad) Cimitarra de guardia = Cimitarra del contramaestre
- (arma 1 mano, Común) Cuchillo de cazador = Cuchillo del grumete polizón
- (arma 1 mano, Común) Daga = Punzón del ladronzuelo
- (arma 1 mano, Buena Calidad) Daga de Capitán = Daga del sacrificio
- (arma 1 mano, Buena Calidad) Daga de guardia = Daga de la viuda verde
- (arma 1 mano, Común) Espada ancha = Espada de taberna
- (arma 1 mano, Raro) Espada bastarda = Espada bastarda del Espectro
- (arma 1 mano, Común) Espada corta de instrucción = Espada de recluta de la guardia
- (arma 1 mano, Común) Espada corta oxidada = Espada de alquiler oxidada
- (arma 1 mano, Buena Calidad) Espada del Jefe de los Mil Caminos = Espada del veterano de mil batallas = Espada larga
- (arma 1 mano, Común) Estileto común = Estileto ritual del acólito
- (arma 1 mano, Común) Garrote = Maza
- (arma 1 mano, Común) Hacha = Hacha del clan
- (arma 1 mano, Raro) Hacha danesa = Hacha del Jefe de Guerra
- (arma 1 mano, Buena Calidad) Hacha de batalla = Hacha de la furia roja
- (arma 1 mano, Común) Honda de cuero = Honda del cazador de jabalíes
- (arma 1 mano, Común) Hoz = Hoz ceremonial
- (arma 1 mano, Raro) Katana = Katana del cazarrecompensas
- (arma 1 mano, Común) Lanza corta = Lanza de guardia de puerta
- (arma 1 mano, Buena Calidad) Martillo = Maza de guardia
- (arma 1 mano, Común) Martillo de bola = garrote de hueso
- (arma 1 mano, Común) Sable común = Sable de abordaje = Sable mellado del camino real
- (arma 1 mano, Buena Calidad) Sable de caballería = Sable de mando del capitán
- (arma 1 mano, Buena Calidad) Sable del sargento = Sable militar
- (arma 2 manos, Común) Arco corto = Arco del rastreador
- (torso blando, Buena Calidad) Armadura de cuero reforzado = Pieles del berserker
- (torso blando, Común) Campera de cuero de motociclista con tachas = Campera de marinero espacial
- (torso blando, Común) Casaca curtida de salteador = Peto de cuero curtido
- (torso blando, Buena Calidad) Chaleco de escamas del envenenador = Cota de escamas de cuero = Cota de escamas del jefe de guerra
- (torso blando, Buena Calidad) Cota de malla de acero = Cota de malla de contramaestre = Cota del cazarrecompensas
- (torso blando, Buena Calidad) Gambesón acolchado de doble capa = Gambesón del capitán del Espectro
- (torso blando, Raro) Gambesón de mando del jefe bandido = Gambesón del veterano de frontera
- (torso blando, Buena Calidad) Túnica de acólito = Túnica de nubarrón
- (torso blando, Buena Calidad) Túnica de sanador = Túnica del sacerdote oscuro
- (torso rígido, Común) Armadura de cuero rígido = Coraza de cuero del clan
- (torso rígido, Común) Coraza de guardia de cuartel = Coraza de puerta
- (torso rígido, Raro) Coraza de hierro = Coraza del capitán de la ciudad
- (torso rígido, Buena Calidad) Media armadura de escudero = Media armadura de sargento
- (cabeza, Común) Capucha de cuero acolchada = Capucha de emboscada
- (cabeza, Común) Capucha de lana cruda = Capucha de lana del culto
- (cabeza, Raro) Capuz de vidente de feria = Capuz del Sumo Profeta
- (cabeza, Común) Casco = Casco de cuero endurecido = Casco de muralla
- (cabeza, Común) Casco de artillero pintado a mano = Casco de moto vintage pintado a mano
- (cabeza, Común) Gorro acolchado = Pasamontañas de inquisidor = Pasamontañas de tejido basto
- (cabeza, Común) Sombrero de paja trenzada = Sombrero humectante
- (cinturón, Común) Bandolera de lona = Correa con bolsitas
- (cinturón, Común) Cinto de cuero remachado = Cinto de hebilla ancha
- (cinturón, Común) Cinturón +1 = Faja de tela cruda
- (cinturón, Buena Calidad) Cinturón de aprendiz de boticario = Cinturón de utilidad
- (escudo, Común) Escudo de madera = Escudo de taberna
- (manos, Buena Calidad) Guantes de cuero reforzado = Manoplas de cota
- (piernas, Común) Bombachas de campo = Jogging de gimnasia con rayas laterales
- (piernas, Común) Calzas de cuero flexible = Canilleras de milicia = Grebas de cuero = Polainas de cuero remendado
- (piernas, Buena Calidad) Grebas = Perneras de malla = Polainas tachonadas de taller
- (piernas, Buena Calidad) Grebas de acero templado = Grebas del rastreador
- (piernas, Común) Grebas de hojalata = Pantalón acolchado de aprendiz
- (piernas, Excepcional) Miriñaque = Polainas de seda valyria
- (pies, Común) Alpargatas de yute = soquetes de lona
- (pies, Común) Botas de lona de recluta = Botines de soldado raso
- (pies, Común) Sabatones de hojalata = alpargatas de cuero
