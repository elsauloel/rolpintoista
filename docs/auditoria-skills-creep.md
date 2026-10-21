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
- ✅ **La versión fuerte del Sangrado** (2026-10-21, dueño: «una versión fuerte, que salga más cara… con el sangrado como eje identitario, 4 SP»;
  eligió la B): un ataque con su arma con **Perfora 1 y Crítico frecuente +1**; si pega, **Sangrado fuerte: 3 de daño por turno durante 3 turnos**
  (se acumula; con crítico, permanente). Costo de un ataque, más **4 SP** o cooldown 4. **Tajo de carnicero** (humanoides) y **Destripar** (bestias),
  las dos nuevas. **Para probar en el mapa.**

### Movilidad (desde el 2026-10-21)

- ✅ **El Rengo** (2026-10-21, dueño, con sus nombres): un ataque con su arma; si pega, **Rengo 2 turnos** (moverse le cuesta 2 No2 por casillero).
  Costo de un ataque, más **2 SP** o cooldown 3. **Golpe a la rodilla** (humanoides; antes «Romper la rodilla», que solo ponía el Rengo a mano),
  **Tarascón al tobillo** (bestias; antes «Mordisco que lisia») y **Tiro a la rodilla** (humanoides, a distancia; antes «Disparo a la rodilla»).
  **Para probar en el mapa.**
- ✅ **Las redes** (2026-10-21, dueño: «las redes sí me interesan… alguna criatura puede escupir una red»): tira su Probabilidad de Golpe contra la
  Evasión, dentro de su Rango; si gana, **Inmovilizado** (hasta 3 turnos). Al empezar su turno tira Fuerza para soltarse, gratis; un aliado pegado
  puede ayudarlo (1 No2). Cuesta 2 No2 y cooldown 4, o **3 SP**. **Red** (humanoides: Fuerza contra la Destreza de quien la lanzó) y **Tela de
  araña** (bestias, la escupen: Fuerza contra su Efecto especial). Como la Red Nerubian. **Para probar en el mapa.**
- ✅ **Los agarres de las bestias** (2026-10-21, dueño: «con y sin daño»): el estado **Agarrado** (no se mueve; quien agarra queda **Agarrando** y
  tampoco se mueve). Al empezar su turno tira Fuerza contra la Fuerza de quien lo agarra, gratis; lo suelta al empezar el siguiente turno de quien lo
  agarró, o antes si se zafa. **Agarrón** (sin daño: su Probabilidad de Golpe contra la Evasión, pegado; 2 No2 y cooldown 3, o 2 SP) y **Abrazo
  aplastante** (con daño: un ataque con su arma; si no se suelta, el apretón le vuelve a hacer el mismo daño; costo de un ataque, más 3 SP o
  cooldown 3). El mismo mecanismo que el Mordisco feroz (`vtt-hexgrid/js/54`). **Para probar en el mapa.**
### Choque pesado (tanques y warriors, desde el 2026-10-21)

- ✅ **Aguante** (2026-10-21, dueño; uno solo para bestias y humanoides): cuesta 1 No2 y 1 SP (o cooldown 3). Se anuncia «‹creep› se pone en modo
  aguante.» y queda con **+2 a la Defensa y +2 a la Defensa especial** hasta que empiece su próximo turno, contando cada golpe que le pega (aunque la
  armadura lo frene todo; trampas y zonas no cuentan). En su próximo turno, al apretar Atacar, sale el cartel de modo aguante: su ataque suma **+1 dado
  del Tipo de su arma por cada golpe recibido**, **1 SP por dado** (si no le alcanza, los que pueda pagar; en modo cooldown, +1 turno de cooldown a
  Aguante por dado) más los No2 del ataque, y se pasa al duelo. Si no ataca en ese turno, lo pierde. `vtt-hexgrid/js/56-aguante.js`. **Para probar.**

- ✅ **Barrido** (humanoide) y **Coletazo** (bestia) (2026-10-21, «barrido»): le pega a todos los rivales de al lado (flor de diámetro 3, sin contarse);
  su PdG **una vez** contra la **Evasión** de cada uno (solo Evasión: sin Parry, Bloqueo ni Fuerza del golpe) y **el daño de su arma** (dados + Dmg) menos la
  Defensa a quien no le gana; sin dodge roll. El Coletazo además **empuja 1** (con daño de colisión si choca). Los No2 de un ataque y **2 SP**, o cooldown 3;
  es su ataque del turno. Es una cascada de duelos (como el Daño en área del Tanque): el daño **se tira en cada duelo** (dueño: «así como está»; la otra
  opción era un solo daño para todos). **Para probar.**

- ✅ **Romper armadura** (humanoide) y **Arrancar la coraza** (bestia): un ataque con su arma que, si pega, deja **Armadura rota 1**; lo de un ataque y
  **2 SP**, o cooldown 3. **Golpe demoledor** (humanoide) y **Mandíbula trituradora** (bestia), la versión fuerte: **+1 dado** y **Armadura rota doble**;
  **4 SP**, o cooldown 4 (2026-10-21, dueño, «partir la armadura»). Un crítico no rompe armadura; entra aunque la armadura frene todo el daño. **Para probar.**

- ✅ **Desarmar** (2026-10-21, «desarmar», humanoides y bestias): **Flash** en el paso del **Bloqueo** (hubo Parry), atacando (en vez de la Fuerza del
  golpe) o defendiendo (en vez del Bloqueo). La tirada es la misma; si gana, el otro pierde lo que tenía en la mano (arma o escudo), que **vuela 2 casillas**
  en una dirección al azar —una **ruleta de casillas** en el mapa— y queda en el piso (el arma: Desarmado hasta levantarla). Reemplaza el resultado de
  siempre. Lo natural no se cae (dueño: una bestia desarma pero no la desarman). **3 SP** (6 en turno ajeno) o cooldown 3. Botón instantáneo 🤺 del GM.
  **Para probar.** Desde el mismo día (P217) un arma natural también parrea (con su peso; 1 si no tiene): una bestia desarma atacando o defendiendo.

### Choque liviano (desde el 2026-10-21)

- ✅ **Hit and run** (2026-10-21, dueño: «picar y alejarse»; nombre en inglés; una sola para bestias y humanoides): un ataque con su arma; pegue o no,
  después se aleja hasta 2 casilleros, gratis (sin No2) y sin dar ataque de oportunidad (el cartel del movimiento libre del dodge roll). Costo de un ataque, más 2 SP o cooldown 3.
  `vtt-hexgrid/js/57-alejarse.js`. **Para probar.**

- ✅ **Salto** y **Salto aplastante** (2026-10-21, dueño: «se saltea hasta dos casilleros, es decir, que se desplaza tres»): al elegir el objetivo, salta
  por encima de lo que haya (no paredes ni Sólidos) hasta una casilla libre pegada al objetivo, a 3 casilleros o menos, sin No2 ni ataque de
  oportunidad, y ataca con su arma. Es un salto de **1,5 metros de altura**: si pasa por encima de algo con colisión, pregunta si puede saltarlo (lo
  decide la mesa). **Salto** (choque liviano): +1 a la Probabilidad de Golpe y Crítico frecuente +1; costo de un ataque, más 2 SP o cooldown 3.
  **Salto aplastante** (choque pesado): al caer, los rivales pegados tiran **Res.CC contra su Fuerza** (dueño: «en vez de Agilidad, Res.CC»); quien no
  llega queda **Sentado**; después, el ataque con **+2 al daño**. Costo de un ataque, más 3 SP o cooldown 4. Si ya está al lado, ataca sin saltar
  (el aplastante igual sienta a los de al lado); si no llega o no hay dónde caer, avisa y deja atacar igual. `vtt-hexgrid/js/55-carrera.js`
  (`saltoHab`, `saltoAplastar`). **Para probar.**

- ✅ **Puñalada por la espalda** (humanoide), **Mordida a traición** (bestia) y **Puñalada trapera** (la fuerte) (2026-10-21, «por la espalda»): un ataque
  con su arma; si está en el **punto ciego** del objetivo, **+1 dado de su arma** y **Crítico frecuente +1** (más el +1 PdG de todo ataque por la espalda).
  La trapera, si además viene **en sigilo**, **duplica los dados del arma** en lugar del +1. A la espalda se llega en sigilo, con **Paso ligero** o con el
  objetivo **flanqueado** (si no, el objetivo se da vuelta: la regla del oído). Si no está en la espalda, avisa y deja atacar igual, sin el bono. Lo de un
  ataque y **2 SP** (trapera **4 SP**), o cooldown 3 (trapera 4). Junto con esto, la pasiva **Pasos silenciosos** pasó a llamarse **Paso ligero** (dueño).
  **Para probar.**

- ✅ **Ráfaga de cortes** (humanoide) y **Ráfaga de zarpazos** (bestia) (2026-10-21): un solo duelo (dueño: la opción 2, «el golpe vale por tres»): un ataque
  con su arma con **+2 dados** (la Defensa se resta una vez); **los efectos al golpear del arma se tiran tres veces** y **su Perfora vale en cada corte** (dueño: «perfora
  cada uno de los tres golpes»: con Perfora 1, cada corte asegura 1 que pasa la Defensa, así que pasan al menos 3). Lo de un ataque y **3 SP**, o cooldown 3. (Se descartó: tres duelos seguidos, con tres Evasiones.) **Para probar.**

### Rango (desde el 2026-10-21)

- ✅ **Vigilancia** (2026-10-21, dueño; una sola para bestias y humanoides, y sumada al **Shooter** como habilidad de clase): 1 No2 y 2 SP (o cooldown 3);
  para un creep es su ataque del turno. Se anuncia «‹creep› se pone en vigilancia». Hasta que empiece su próximo turno, el primer rival que se mueva
  dentro del alcance de su arma, a la vista y con línea de tiro libre, se frena ahí (como con la oportunidad) y quien maneja al vigilante ve «¿Dispara?»:
  sí → un duelo normal con su arma, con **+2 a la Probabilidad de Golpe** (dueño: «para justificar los 2 SP»; paga los No2 de un ataque) y se le va
  la vigilancia; «Dejarlo pasar» → sigue vigilando. Sin No2 para el disparo,
  avisa y el rival sigue. Quien ya estaba adentro, solo si se mueve; un rival en sigilo que no se ve, no. El alcance se dibuja en el mapa para todos.
  `vtt-hexgrid/js/58-vigilancia.js` (+ js/17). **Para probar.**

- ✅ **Tiro a la cabeza** (2026-10-21, «tiro apuntado»): un turno apunta (anuncio «{nombre} apunta con calma…»; es su ataque del turno) y queda **Apuntando
  a la cabeza**: su próximo disparo **+2 PdG, Crítico frecuente +1 y Crítico potente +1** (dueño: «+1 a cada uno de los bonos de crítico», en vez de potente
  +2); se gasta al disparar. **Si le hacen daño** antes (que le llegue a la vida; si la armadura lo frena todo, no), **pierde la puntería**. 1 No2 y 2 SP, o
  cooldown 3. **Para probar.**

- ✅ **Disparo señalador** (2026-10-21, «señalar para todos»): un ataque con su arma que, si pega, deja al objetivo **Presa** 2 turnos (**Evasión −1** —dueño:
  en vez de +1 PdG a cada uno, más fácil y vale contra todo— y **+2 al daño** de todos sus rivales, con arma o habilidad) y **Marcado** 2 turnos. Lo de un
  ataque y **2 SP**, o cooldown 3. El Support va a reusar la Presa («Señalar la presa»). **Para probar.**

### Casters (desde el 2026-10-21)

- ✅ **Bola de fuego** (Mago, 2026-10-21, dueño, tras una simulación de 20.000 lanzamientos contra un grupo con equipo común): flor de diámetro 3 con
  el centro dentro de su Rango; su PdG.Esp contra la Evasión de cada uno (dodge roll); **2d6 + ¼ de su Efecto especial** de fuego (lo frenan la Defensa
  especial y la resistencia al fuego; ¼ para abajo, como toda habilidad) y **Quemadura**. Cuesta **tanto SP como su Especial** (`spCosto: 'esp'`,
  P216: uno sí, uno no) o cooldown 2, y **4 No2**. En la simulación: sin Ef.Esp ~6 por lanzamiento, con ¼ ~12, con ½ ~18 (demasiado). **Para probar.**
- ✅ **Confusión** (Debuffer, control mental, 2026-10-21, dueño: «arrancaría con alguna de las mentales»): su PdG.Esp contra la **Res.Mt** de un
  rival dentro de su Rango; si gana, **Confusión 1 turno** (no los 2 del estado: la mitad de sus resultados son malos). Cuesta **2 No2** y **3 SP**, o
  cooldown 4. La Confusión la tira el mapa (js/20). Siguen en la familia: Susurros de locura (área), Grito de pánico (Miedo alrededor), Palabra de
  silencio. **Para probar.**
- ✅ **Mal de ojo** (Debuffer, «maleficios», 2026-10-21): el Enyetar de los personajes para creeps: después de que un personaje tira, su PdG.Esp contra la
  Res.Esp (a su Rango y a la vista); si gana, esa tirada se repite y queda la peor. **Flash** (dueño): en turno ajeno cuesta el doble. **5 SP** sin No2, o
  cooldown 3 (los números del Enyetar). El GM la usa desde el **botón 🧿** (dueño: «el botoncito arriba donde los jugadores tienen la moneda… y con el duelo
  abierto, en el menú paralelo»): `vtt-hexgrid/js/60-mal-de-ojo.js`. **Para probar.**
- ✅ **Cadena de rayos** (Mago, 2026-10-21): PdG.Esp contra la Evasión de un rival a su Rango; **2d4 eléctrico** (sin el Ef.Esp: P216 en pausa; lo frenan la
  Defensa especial y la resistencia eléctrica) que **salta** con la regla general del rayo (al más cercano a 4 o menos, la mitad de lo que entró, sin repetir,
  hasta 1; por el agua en un charco) y **20 % de Parálisis** 1 turno al primero. **3 No2** y **3 SP**, o cooldown 3. **Para probar.**
- ✅ **Arma ígnea, Arma helada, Arma eléctrica, Arma ácida, Arma venenosa** (Support, «arma elemental», 2026-10-21, dueño: «que cada creep tenga
  uno… y el daño especial se sume al daño habitual del ataque»): le encanta el arma a un aliado a su Rango (o la propia) **3 turnos de ese aliado**: cada
  golpe con arma que pega suma **+1d4 del elemento**, daño directo (solo lo frena la resistencia a ese elemento; no se multiplica con el crítico), y lo
  de la Carga Elemental sobre esa parte: fuego ×1,5; hielo Escarcha 1 (+1 cada 5); rayo salta (la mitad de lo que entró) y 20 % de Parálisis 1 turno;
  ácido Armadura rota 1 (+1 cada 5); tóxico Veneno, 1 stack cada 3 (mínimo 1). **Una sola a la vez** (la nueva reemplaza). Es su acción de ataque del
  turno (como la Vigilancia). Cuesta **2 No2** y **2 SP**, o cooldown 3. Decidido: 1d4 fijo (no el Ef.Esp: P216 en pausa) y la Escarcha y la Armadura
  rota en cada golpe (no con probabilidad: son el atractivo del buff). Sirven igual con armas naturales. **Para probar.**

- ⏸ **Clavar al suelo** (dueño, 2026-10-21: «no me cierra de forma narrativa»): queda aparte, sin auditar.

## Etiquetas

- Cada habilidad ya trae etiquetas de función, velocidad, raza (tipo de criatura), rol, a quién apunta, mecánicas y automatización. Desde el
  2026-10-21 (dueño: «vamos poniéndoles tags para después poder filtrarlos») también **«auditada» / «sin auditar»** (grupo «Auditoría» del
  filtro de la biblioteca: `HABS_CREEP_GRUPOS` en `comun/creep-editor.js`). Una receta auditada lleva `auditada: true` (las `aA` ya la traen).

## Sigue

- **Desde el 2026-10-21 (dueño):** foco en los de **choque pesado (tanques y warriors)**, explorando las posibilidades de diseño del rol
  más que estado por estado.

- **Forma de trabajo desde el 2026-10-21:** lo definido se programa y se anota en «Auditoría de creeps: para probar» (`docs/pruebas-en-el-mapa.md`);
  las pruebas en el mapa se corren todas juntas cuando el dueño lo pide.

- Los golpes con efecto (Golpe que sangra, Mordisco que lisia, Golpe atontador…).
