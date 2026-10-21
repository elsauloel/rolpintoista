# Auditoría de las habilidades de creep (las de fábrica)

> Arrancada el 2026-10-20 (dueño: «vamos a ver las habilidades de creeps que ya están cargadas… clasificarlas por utilidad… auditando, partiendo
> de lo que sería útil para un warrior, alguien de choque frente a frente»). Las habilidades están en `comun/skills-creep-base.js` (321, con la
> receta `{sp, cd, lenta}` que `armarHab` de `comun/creeps-base.js` calcula con el nivel del creep). Método: **una por una** — el texto original,
> cómo está hoy, la propuesta; el dueño decide; se aplica, se prueba en el mapa y se marca acá.

## Criterios (decididos al auditar)

- **Los golpes usan el arma del creep y van al duelo** (2026-10-20): como los kobolds y goblins auditados (la Picada del Kobold Rabioso): «un
  ataque con su arma» con arreglos (`aA(detalle, arma, ataqueTxt, spCosto)` en la receta → `duelo: {modo: 'arma', arma: {…}}`), con PdG contra
  Evasión o Parry, Bloqueo y crítico. Antes tiraban un daño fijo (2d6 + nivel) sin arma ni duelo.
- **La misma escala que los jugadores**: se compara cada una con la habilidad de clase más parecida y se cobra lo mismo. Referencias:
  Amplificar daño (Warrior: +X dados del Tipo del arma, X SP), Carga (Warrior: +X PdG y +X de daño, X SP), Takle (Tanque: +1 PdG y no se
  puede parrear, 3 SP), Tajear (Asalto: Crítico frecuente +1, Perfora 1 y Sangrado, 3 SP), Lisiar (Asalto: crítico +1/+2 y Lesión, 2 SP).
- **Cada golpe con su identidad** (dueño, 2026-10-20: «me gusta que les des identidad a cada uno»): los golpes simples que hoy son el mismo con
  otro nombre pasan a tener cada uno su toque.
- **Habilidades paralelas entre razas** (dueño, 2026-10-21: «no está mal que existan habilidades paralelas entre bestias y humanoides»): la misma
  mecánica puede estar dos veces, una con sabor de bestia y otra de humanoide (Golpe que sangra ↔ Zarpazo desgarrador). Lo que sí se diferencia es
  dentro de una misma raza.
- **SP**: cada receta trae su `spCosto` (lo que cuesta en modo SP, ver «Creeps con SP» en `comun/CLAUDE.md`); el cooldown queda para el modo
  de siempre.

## Clasificación: las de choque («melee», 70 de las 321)

- **Golpes simples (8):** Golpe fuerte ✅, Tajo veloz ✅, Estocada ✅, Zarpazo ✅, Mordisco feroz ✅, Cornada ✅, Puño de roca ✅, ~~Golpe de pomo~~ (quitado,
  dueño 2026-10-21).
- **Golpes con efecto (~14):** Golpe que sangra, Mordisco que lisia, Golpe atontador, Corte profundo, Zarpazo desgarrador, Zarpa oxidante, Golpe
  glacial, Toque abrasador, Mordisco vampírico, Golpe vigorizante, Golpe brutal y guardia, Golpe de escudo, Golpe doble, Ráfaga de golpes, Aplastar,
  Golpe de mano.
- **Golpes en área (6):** Barrido, Torbellino de acero, Pisotón, Pisoteo múltiple, Golpe sísmico, Coletazo (+ Aura de calor).
- **Golpes lentos y fuertes (6):** Golpe aplastante, Golpe cargado, Remate, Golpe de gracia, Ataque de furia, Devorar.
- **Carga y empuje (5):** Cargar, Embestida, Tackle, Empujón, Empujar a la trampa.
- **Buffs propios (15):** Furia, Grito de guerra, Frenesí, Afilar, Sed de sangre, Coraje, Modo turbo, Rabia ancestral, Fortalecerse, Hambre
  insaciable, Pelaje erizado, Despertar de la piedra, Adrenalina, Saqueo, Furia del jefe.
- **Aguantar y curarse (6):** Segundo aliento, Regeneración rápida, Frenesí de curación, Devorar cadáver, Segunda fase, Escudo de espinas.
- **Control (8):** Aturdir, Agarrón, Romper la rodilla, Desarmar, Lisiar, Romper armadura, Herida sangrante (y Golpe atontador).

## Auditadas

- ✅ **Golpe fuerte** (2026-10-20). Original: «Un golpe cargado con todo el peso.» Antes: 2d6 + nivel de daño fijo, sin arma ni duelo; costo de un
  ataque, cooldown 2. **Ahora** (como el Amplificar daño del Warrior con X = 1): un ataque con su arma que suma **+1 dado del Tipo de su arma**; va
  al duelo; costo de un ataque, cooldown 2 o **1 SP**. Probado en el mapa (creep con Daga: «Daño · Daga · 2d4 + 1 + 1d4»).
- De paso, **Golpe brutal** (Warrior, habilidad de clase): el −2 a la Evasión hasta su próximo turno quedó automático (estado «Guardia baja»).
  Probado en el mapa (Silvia: Evasión 6 → 4, 3 SP).

- ✅ **Tajo veloz** (2026-10-20). Original: «Un corte rápido y certero.» Antes: 1d6 + nivel fijo, sin arma ni duelo. **Ahora** (como la Carga del
  Warrior con X = 1, sin la carrera): +1 PdG y +1 al daño, 1 SP (probado en el mapa). **Subido el mismo día** (dueño: «medio poca cosa… la
  versión más afilada»): **+2 PdG, +2 al daño y Crítico frecuente +1**, costo de un ataque, cooldown 3 o **3 SP** (la Carga con X = 2 más el
  crítico del Tajear). Probado en el mapa (PdG 1d1 → 1d3, +2 de daño fijo, rango del crítico 4 → 3).

- ✅ **Estocada** (2026-10-21). Original: «Una punzada directa al punto débil.» **Ahora**: un ataque con su arma con **Perfora 2 y +1 al daño**,
  costo de un ataque, cooldown 2 o **2 SP** (la que atraviesa armadura). Probado en el mapa (declara «+1 de daño fijo · perfora 2»).
- ✅ **Zarpazo** (bestias, 2026-10-21). Original: «Un zarpazo salvaje.» **Ahora** (dueño): un ataque con su arma con **Crítico potente +2 y +1 al
  daño**, costo de un ataque, cooldown 2 o **2 SP** (como el Lisiar del Asalto sin la Lesión). No sangra: eso es del Zarpazo desgarrador.
  Probado en el mapa (creep con Garras Tipo 4: la declaración dice «+1 de daño fijo · Crítico potente +2»; con crítico, la tabla baja a doble
  con 5 o más y triple con 16 o más). De paso, la declaración del duelo muestra ahora los arreglos de crítico de cualquier habilidad
  (Crítico frecuente, potente, ignora Res. a crítico).

- ✅ **Mordisco feroz** (bestias, 2026-10-21). Original: «Una mordida profunda.» Antes: 2d6 + nivel fijo, sin arma ni duelo. **Ahora** (dueño: «la
  que no suelta»): un ataque con su arma con **+1 dado del Tipo de su arma**; costo de un ataque, cooldown 3 o **3 SP**. Si pega, el objetivo queda
  **Mordido** (no se mueve) y la bestia **Mordiendo** (tampoco se mueve). Al empezar su turno, el mordido tira **Fuerza contra la Fuerza de la
  bestia**, gratis; si no se suelta, el mordisco le vuelve a hacer **el mismo daño** (su arma + 1 dado, restando la Defensa). La bestia lo suelta
  **al empezar su siguiente turno** (o antes, si el otro se zafa). Automatizado en el mapa (`vtt-hexgrid/js/54`). Probado en el mapa (Silvia mordida:
  al empezar su turno, Fuerza 1 contra 6 → sigue atrapada y el mordisco le hace 3d4+6 = 12 − Defensa 3 → 9; al empezar el turno del creep, la
  suelta y se van los dos estados). De paso: en las habilidades auditadas que van al duelo, la descripción ya no manda a «✋ A mano» lo que el
  mapa hace solo (`frasesDe` de `comun/creeps-base.js`).

- ✅ **Cornada** (bestias, 2026-10-21). Original: «Embiste con los cuernos.» Antes: 2d6 + nivel fijo, sin arma ni duelo. **Ahora** (dueño): un ataque
  con su arma con **+1 a la Probabilidad de Golpe y +1 al daño; si pega, lo empuja 1 casilla** lejos de la bestia. Costo de un ataque, cooldown 2 o
  **2 SP**. **Toma carrera**: si se ejecuta de lejos, corre en línea recta hasta quedar al lado (lo que cuesta moverse: 1 No2 por casillero) y suma
  **+1 a la Probabilidad de Golpe, +1 al daño y +1 casilla de empuje por cada casillero que corrió** (al lado +1/+1/1, con uno en el medio +2/+2/2,
  con dos +3/+3/3…). Sin línea recta libre, avisa y deja atacar igual sin la carrera. Automatizado en el mapa (`vtt-hexgrid/js/55-carrera.js`).
  Probado en el mapa (corrió 2 casilleros: «+3 PdG · +3 de daño fijo», pegó y empujó a Silvia 3 casilleros). Si el empujón choca: el daño de colisión
  (P178 ✅: una Constitución por casillero que le faltó, menos la Defensa; contra otro token, cada uno la del otro).

- ✅ **Puño de roca** (constructos y elementales, 2026-10-21). Original: «Un puñetazo que rompe huesos.» Antes: 2d6 + nivel fijo, sin arma ni duelo.
  **Ahora** (dueño: «que sume daño y demora», «+2 al daño»): un ataque con su arma con **+2 al daño; si pega, Demora** (baja 1 lugar en el orden de
  turnos). Costo de un ataque, cooldown 2 o **2 SP**. Probado en el mapa.

- ✅ **Las cuatro variantes del Sangrado** (2026-10-21, dueño: «un golpe simple que solamente añade sangrado; uno que añade perfora y sangrado; uno que
  añade daño y sangrado; uno que añade crítico frecuente y sangrado»; «hacé todas», en versión de humanoide y de bestia). Todas: un ataque con su
  arma; si pega, **Sangrado** (2 de daño por turno durante 2 turnos; se acumula y, con crítico, queda permanente). Costo de un ataque, más:
  - Solo Sangrado — 1 SP o cooldown 2: **Golpe que sangra** (humanoides) y **Zarpazo desgarrador** (bestias).
  - Perfora 1 + Sangrado — 2 SP o cooldown 3: **Corte profundo** (humanoides) y **Colmillos que perforan** (bestias, nueva).
  - +2 al daño + Sangrado — 2 SP o cooldown 3: **Tajo brutal** (humanoides, nueva) y **Desgarro** (bestias, nueva).
  - Crítico frecuente +1 + Sangrado — 2 SP o cooldown 3: **Corte certero** (humanoides, nueva) y **Zarpa certera** (bestias, nueva).
  Antes, las tres que existían tiraban un daño fijo y el Sangrado iba a mano. **Para probar en el mapa.**

## Etiquetas

- Cada habilidad ya trae etiquetas de función, velocidad, raza (tipo de criatura), rol, a quién apunta, mecánicas y automatización. Desde el
  2026-10-21 (dueño: «vamos poniéndoles tags para después poder filtrarlos») también **«auditada» / «sin auditar»** (grupo «Auditoría» del
  filtro de la biblioteca: `HABS_CREEP_GRUPOS` en `comun/creep-editor.js`). Una receta auditada lleva `auditada: true` (las `aA` ya la traen).

## Sigue

- **Forma de trabajo desde el 2026-10-21:** lo definido se programa y se anota en «Auditoría de creeps: para probar» (`docs/pruebas-en-el-mapa.md`);
  las pruebas en el mapa se corren todas juntas cuando el dueño lo pide.

- Los golpes con efecto (Golpe que sangra, Mordisco que lisia, Golpe atontador…).
