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
  del Tipo de su arma por cada golpe recibido**, **hasta su nivel + 1 dados** (tope, dueño 2026-10-23), **1 SP por dado** (si no le alcanza, los que pueda pagar; en modo cooldown, +1 turno de cooldown a
  Aguante por dado) más los No2 del ataque, y se pasa al duelo. Si no ataca en ese turno, lo pierde. `vtt-hexgrid/js/56-aguante.js`. **Para probar.**

- ✅ **Barrido** (humanoide) y **Coletazo** (bestia) (2026-10-21, «barrido»): le pega a todos los rivales de al lado (flor de diámetro 3, sin contarse);
  su PdG **una vez** contra la **Evasión** de cada uno (solo Evasión: sin Parry, Bloqueo ni Fuerza del golpe) y **el daño de su arma** (dados + Dmg) menos la
  Defensa a quien no le gana; sin dodge roll. El Coletazo además **empuja 1** (con daño de colisión si choca). Los No2 de un ataque y **2 SP**, o cooldown 3;
  es su ataque del turno. Es una cascada de duelos (como el Daño en área del Tanque): el daño **se tira en cada duelo** (dueño: «así como está»; la otra
  opción era un solo daño para todos). **Para probar.**

- ✅ **Romper armadura** (humanoide) y **Arrancar la coraza** (bestia): un ataque con su arma que, si pega, deja **Armadura rota 1**; lo de un ataque y
  **2 SP**, o cooldown 3. **Golpe demoledor** (humanoide) y **Mandíbula trituradora** (bestia), la versión fuerte: **+1 dado** y **Armadura rota doble**;
  **4 SP**, o cooldown 4 (2026-10-21, dueño, «partir la armadura»). Un crítico también rompe armadura (2026-10-23, dueño: se borró la regla de que no); entra aunque la armadura frene todo el daño. **Para probar.**

- ✅ **El que avisa no traiciona** (humanoides) / **Zarpazo erguido** (bestias) (2026-10-21, «golpe anunciado»; era el «Golpe cargado» sin auditar): cargarlo, 1 No2 y
  1 SP o cooldown 3; es su ataque del turno. Queda **Golpe anunciado** y el GM marca a quién apunta (la Mesa y la Crónica lo anuncian). En su próximo turno
  (puede caminar antes), el Atacar lo descarga: ataque con su arma +3 dados del Tipo, **sin Parry**, y si pega **empuja 2**; paga los No2 de un ataque y **3 SP más**
  (en modo cooldown, +3 turnos de cooldown; o «un ataque común» y se pierde). Si el objetivo pegado se aleja, sale **de oportunidad: los No2 de una oportunidad y los 3 SP** (dueño, 2026-10-21).
  Se le cae si **le entran 10 de daño o más mientras lo carga, sumando** (dueño: «que no se corte con cualquier daño»); si no ataca, se pierde.
  (Dueño: el Crítico potente suelto, sin frecuente, no; en su lugar, el empujón de 2.) **Para probar.**
- ✅ **Desarmar** (2026-10-21, «desarmar», humanoides y bestias): **Flash** en el paso del **Bloqueo** (hubo Parry), atacando (en vez de la Fuerza del
  golpe) o defendiendo (en vez del Bloqueo). La tirada es la misma; si gana, el otro pierde lo que tenía en la mano (arma o escudo), que **vuela 2 casillas**
  en una dirección al azar —una **ruleta de casillas** en el mapa— y queda en el piso (el arma: Desarmado hasta levantarla). Reemplaza el resultado de
  siempre. Lo natural no se cae (dueño: una bestia desarma pero no la desarman). **3 SP** (6 en turno ajeno) o cooldown 3. Botón instantáneo 🤺 del GM.
  **Cambio del 2026-10-22 (dueño):** no se declara en el turno («como quien tira pegar fuerte»); la ocasión se da solo con un Parry ganado, y se
  quien defiende solo desarma si paró con el arma, no con el escudo. Le puede sacar al otro un arma o un escudo. **Una bestia con garras sigue
  desarmando** (dueño: «el mecanismo debe existir como posible; cuándo sí o no lo define la mesa»); lo único, su arma natural no se le cae. La opción se elige **adentro del paso 3 del duelo** («🤺 Desarmar a X», al lado de la tirada: cobra, marca
  y tira); el paso 3 dice «🤺 Desarmar» y qué se le cae a quién. La ruleta gira en círculo alrededor del desarmado y frena parejo (3 vueltas, 4,3 s).
  **La comunicación (dueño, 2026-10-22):** quien ataca elige «⚔ Pegar: pasar el bloqueo» o «🤺 Desarmar»; quien defiende, «🛡 Bloquear el golpe» o
  «🤺 Desarmar». Al otro, si todavía no tiró, le aparece «🤺 X intenta desarmarte» / «…intenta quitarte el arma» (solo para que lo sepa; la tirada es
  la misma: «🛡 Bloquear el desarme» / «⚔ Pegar (contra el desarme)»). Si gana el desarme: el cartel «¡X desarmó a Y!» con **✔ Aceptar** (quien
  desarmó, o el GM por él; el otro ve «esperando que X acepte…») → el duelo se achica, la ruleta, el duelo vuelve con «¡DESARMADO!» y «Terminar
  duelo». Si falla: «X intentó desarmar a Y, pero falló» y lo de siempre (atacando: ¡BLOQUEADO!, con contraataque; defendiendo: pasa la mitad y el
  arma con que paró pierde 1 de durabilidad). Los cuatro caminos, probados en el mapa por Claude (Ladrón contra juan).
  **Para probar.** También es skill de clase del **Warrior** (dueño, 2026-10-21: 3 SP, 6 en turno ajeno, sin No2; el mismo botón 🤺). Desde el mismo día (P217) un arma natural también parrea (con su peso; 1 si no tiene): una bestia desarma atacando o defendiendo.

### Choque liviano (desde el 2026-10-21)

- ✅ **Patotear** (humanoides) / **Jauría** (bestias) (2026-10-21, «manada»): un ataque con su arma con **+1 dado** del Tipo por cada aliado suyo pegado al
  objetivo, **hasta +3** (él no se cuenta; tampoco un aliado caído o bajo tierra). Lo de un ataque y 2 SP, o cooldown 3. Sin aliados al lado, avisa y va
  como un ataque común. **Para probar.**
- ✅ **Sal en la herida** (humanoides) / **Morder la herida** (bestias) (2026-10-21, «abrir la herida»; dueño: «si no está sangrando, provoca sangrado; y si
  está sangrando, hace más daño y amplifica el sangrado»): un ataque con su arma; si el objetivo ya sangra, **+2 dados** del Tipo; si pega, **Sangrado** (si
  ya sangraba, +1 al daño por turno). Lo de un ataque y 2 SP, o cooldown 3. Solo el Sangrado (el Veneno no cuenta).
  **Para probar.**

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

- ✅ **Remate** (humanoides) / **Ir por el herido** (bestias) (2026-10-23, choque pesado, «remate»; dueño: «la versión escalonada» y el nombre de la
  bestia). Original: «Un golpe de gracia contra alguien herido: si el objetivo tiene menos de la mitad de HP, +1 dado (a mano).» Ahora: un ataque con su
  arma; al elegir el objetivo el mapa mira su vida (`vtt-hexgrid/js/69-remate.js`, `Combatiente.remateDados`): **la mitad o menos, +2 dados** del Tipo
  de su arma; **un cuarto o menos, +3**; si no, un ataque común. Mesa y Crónica. Lo de un ataque y **2 SP**, o cooldown 3. **Golpe de gracia** («el golpe
  más fuerte que sabe dar») queda aparte, a revisar con el concepto 1. **Para probar.**

- ✅ **¡A la carga!** y **Arenga** (Support, «grito de guerra», 2026-10-23, dueño: «vamos a hacer dos: uno +2 a todo lo ofensivo, cuatro casilleros, dos
  turnos; y uno +1 a todo, ofensivo y defensivo, como el Bendecido, cuatro casilleros, tres turnos»). Síntesis de los cuatro gritos de los creeps de «El
  origen» — Aullido de la manada, ¡Por el amo! y ¡A laburar! (los tres: Bendecido 2 turnos a 3 casillas) y Marca del amo (+1 PdG y Crítico frecuente +1, a 4)
  — y de los dos de fábrica a mano (Aullido de manada, Grito de ánimo: +2 de daño). Los seis salieron del pool; en la partida los creeps conservan sus
  copias. **¡A la carga!**: a sus aliados a 4 o menos (no él), +2 a la PdG, PdG.Esp, daño y Ef.Esp, 2 turnos; **2 No2 y 3 SP**, o cooldown 3. **Arenga**:
  Bendecido 3 turnos a los mismos; **1 No2 y 2 SP**, o cooldown 3. No se apilan (otro igual renueva los turnos). Los costos los propuso Claude. **Para probar.**

- ✅ **Sanar**, **Bálsamo**, **Círculo de sanación** y **Aura sanadora** (Support, «curar», 2026-10-23, dueño: «una sea de regeneración y la otra sintetizamos el
  heal como un heal»; «el área de diámetro 5, durar 4 turnos… se tira el dado de 6 por la zona… se active 4 veces… cura a todos los aliados»; «un aura de
  curación de diámetro 11 alrededor del propio caster… 4 turnos un dado de 6 por turno»). Síntesis de las de «El origen» (Savia que cierra heridas 2d6,
  Esporas curativas 2d4+2, Regeneración 5 × 3) y de las de fábrica a mano (Curación menor y mayor, Canto revitalizante, Polen sanador, Zona sagrada, Aura
  sanadora), que salieron del pool; referencia: el Heal de los personajes (1d6+4). **Sanar**: él o un aliado en su Rango, 1d6+4 (no levanta a un caído);
  1 No2 y 2 SP, o cooldown 2. **Bálsamo** (no «Regeneración»: ya hay una de fábrica, la del tanque sobre sí): Regeneración 4 por turno, 3 turnos; 1 No2 y
  2 SP, o cooldown 3. **Círculo de sanación**: zona de diámetro 5 (19 casillas) en su Rango, 4 turnos; al ponerla y en cada ronda nueva (4 veces) una
  tirada de 1d6 cura a todos sus aliados adentro; 2 No2 y 4 SP, o cooldown 4. **Aura sanadora**: estado de 4 turnos; al activarla y en cada ronda nueva
  (4 veces), 1d6 a sus aliados a 5 o menos (diámetro 11), él incluido; el token muestra el aura verde; 2 No2 y 4 SP, o cooldown 4. El motor de los
  pulsos: `vtt-hexgrid/js/70-curacion.js`. Los costos los propuso Claude. **Ajuste del dueño (el mismo día)**: «que sea un número fijo en lugar de un dado,
  para no tener que tirar dados: que al empezar el turno… cure a los que estén ahí» → el Círculo y el Aura curan **4 fijos**, al ponerlos y **al empezar cada
  turno de quien los creó** (sin orden de turnos, cada ronda), 4 veces; con **burbujitas verdes** mientras duran y sobre cada uno que se cura. Y una quinta,
  **Oleada sanadora**: el Sanar (1d6+4) a cada aliado de una flor de 7 en su Rango (él incluido), 2 No2 y 4 SP, o cooldown 4. Probadas en el mapa el
  2026-10-23; las burbujitas pasaron a chispitas con un borde ondulado que sigue el área. **Ajuste del dueño (el mismo día, al ver el reporte)**: el Aura
  cubría más que el Círculo por lo mismo → **el Aura cuesta 3 No2 y 5 SP** (cooldown 4).

- ✅ **Hálito polar** (Mago, «cono de frío», 2026-10-23, dueño: «un cono de frío… algo así como hálito polar»): reemplaza al viejo **Aliento gélido** del pool
  (a mano). El cono de 16 casillas al frente (el de Sonic Boom: sin dodge roll); PdG.Esp contra la Evasión de cada rival del cono; **2d4 de hielo** (lo frenan
  la Defensa especial y la resistencia al hielo) y **Escarcha** (−1 No2 máximos, 2 turnos). **Con dodge roll** (dueño, 2026-10-24: «tirar solo Evasión no
  tiene sentido; sí o sí con dodge roll: hay que salir de la superficie»): quien gana la Evasión puede salir del cono moviéndose; si sigue adentro, le pega. **Con el Ef.Esp** (dueño, 2026-10-24: «con Ef»): **2d4 + ¼ de su Efecto especial**, y por P216 (2026-10-23: una skill que suma el Ef.Esp
  cuesta en proporción a él) **cuesta su Especial en SP**, o cooldown 3; 3 No2. Costos propuestos por Claude. **Para probar.**

- ✅ **Coraza de púas** y **Velo espejado** (Support, «devolver el daño», 2026-10-24, dueño: «un buff que le da a un aliado Espinas y otro que le da
  Espejo»): los presets de siempre, ya automatizados en el duelo, a él o a un aliado dentro de su Rango, sin tirada (como el Bálsamo). **Coraza de púas**:
  Espinas 3 turnos (cada golpe cuerpo a cuerpo que recibe le devuelve al atacante ¼ del golpe, directo a la vida). **Velo espejado**: Espejo 3 turnos (lo
  mismo con el daño especial, a cualquier distancia). 1 No2 y 2 SP, o cooldown 3 (los propuso Claude). **Para probar.**

- ✅ **Maldición de la coraza** (Debuffer, «bajar la armadura», 2026-10-24, dueño: «vamos con el 4»): reemplaza a la vieja **Maldición** del pool (a mano:
  «pierde 2 de Res.Esp y 1 de Defensa»). Su PdG.Esp contra la Res.Esp de un rival dentro de su Rango; si gana, el estado nuevo **Coraza maldita**
  (`comun/estados-presets.js`): −2 Defensa y −2 Defensa especial durante 3 turnos, contra todos (no se apila: renueva). 2 No2 y 3 SP, o cooldown 3 (los
  propuso Claude). **Para probar.**

- ✅ **Bendecir el arma** (Support, 2026-10-24, dueño: «vamos con bendecir el arma, que tenga flash»): **Flash** — se usa en cualquier momento y en turno
  ajeno cuesta el doble (el cooldown o el SP; la marca nueva `flash` de una habilidad de creep: `Combatiente.esFlash`, el cobro en `CreepAcciones.ejecutarHab`
  con `{doble}`, que decide el mapa en js/12) y sin No2 (P136). A él o a un aliado en su Rango, el estado nuevo **Arma bendecida**: una carga (como el Arma
  envenenada) que suma **+1 dado del Tipo de su arma** al daño de su próximo ataque con arma (`golpe.dados`, nuevo en las cargas); si no ataca, se va a los 2
  turnos. 2 SP o cooldown 2 (los propuso Claude). Queda en el pool la **Bendición** vieja (a mano: +1 Daño y +2 Defensa 3 turnos), otra cosa. **Para probar.**

- ✅ **Muro de fuego** (Mago, 2026-10-24, dueño: «que tenga un mínimo de 3, pero que se pueda ampliar por un costo adicional en SP, y cada 2 casilleros
  también un nitro; uno castea muro, te pregunta de qué largo, ahí te confirma el costo y ahí se ejecuta»): reemplaza a la vieja **Llamarada** (a mano). La
  zona en línea de la Varita del muro de fuego, de **3 a 8 casillas** (`largoVariable`; el cartel del largo y la confirmación: `muroLargo`, vtt-hexgrid/js/12;
  lo de más, `CreepAcciones.ejecutarHab(…, {extra})`), empieza dentro de su Rango, dura 3 turnos: **1d6 de fuego y Quemadura** a quien la cruza (cada paso
  adentro) o empieza su turno adentro. **Ajuste del dueño (2026-10-24)**: «1d6 me parece muy poco, sobre todo si se reduce con Def.Esp» → **3d4 de fuego
  directo** (no lo frena la Defensa especial; sí la resistencia al fuego). Costo (**ajuste del dueño, 2026-10-24**: «1 No2 por 4 casilleros, y cada casillero adicional +1 No2 y +1 SP»): **4 casillas** (el mínimo), 1 No2 y 3 SP (o
  cooldown 3); cada casilla de más +1 No2 y +1 SP (en modo cooldown, +1 al cooldown cada 2); 8 casillas: 5 No2 y 7 SP. Daño fijo: no suma el Ef.Esp. Los números los propuso Claude. **Para probar.**

- ✅ **Maldición de la sequía** (Debuffer, «cortar la regeneración», 2026-10-24, idea y decisiones del dueño: «una maldición que anule regeneración de HP y
  SP»; «se resiste con Resistencia Especial; sólo corta las regeneraciones de SP y HP propias, no las externas»): su PdG.Esp contra la Res.Esp de un rival en
  su Rango; si gana, el estado nuevo **Sequía** 3 turnos (`Combatiente.sequia`): al empezar el turno no recupera la vida de sus pasivas ni la de su equipo, ni
  su SP Regen (personaje, invocación y creep, también en modo SP); la Regeneración que le da otro, una cura o una zona entran igual. 2 No2 y 3 SP, o cooldown
  3 (como la Maldición de la coraza). **Para probar.**

- ✅ **Ojo certero** (Support, 2026-10-24, dueño: «+2 al crítico potente, +2 al crítico frecuente durante 2 turnos; hacer el conteo de turnos de manera tal
  que el personaje afectado por el skill inicie y termine 2 turnos completos con ese efecto»): a él o a un aliado en su Rango, sin tirada; el estado nuevo **Ojo
  certero** (Crítico frecuente +2 y potente +2, 2 turnos) con la marca nueva **`turnosCompletos`** (`Combatiente.terminarTurnoEstados`): el turno en que se lo
  dan no cuenta nunca. Antes, un estado puesto en el propio turno de quien lo recibe perdía un turno completo (ese turno a medias contaba). 1 No2 y 3 SP, o
  cooldown 3 (los propuso Claude). **Para probar.**

- ✅ **Descarga arcana** (Mago, 2026-10-24; primero «Rayo cargado», dueño: «vamos con el rayo cargado, con la añadidura de que si el creep lo empieza a cargar estando cubierto por la
  niebla, se revela su ubicación: una luz recubre al creep, como si quedara marcado»): el golpe anunciado (vtt-hexgrid/js/63) con un **hechizo** (lo nuevo:
  `golpeAnunciado.duelo` puede ser una Ejecución de habilidad; descarga con `no2Golpe` y `spGolpe`; no sale de oportunidad). Un turno junta energía mirando
  a un rival (su ataque del turno, 1 No2 y 2 SP) y queda con **Carga arcana** (estado nuevo, con `marcado`: brilla y se lo ve en la niebla; lo público del creep
  ahora lleva la marca); 10 de daño se lo cortan. En su próximo turno, al apretar Atacar: «Descargar», su PdG.Esp contra la Evasión del que anunció, **4d6
  arcano** (2 No2 y 3 SP; dueño: «si no va a tener ningún efecto vinculado al eléctrico, que el daño sea arcano»). Los números los propuso Claude. **Para probar.**

- ✅ **Aguja del desamparo** (Debuffer, «exponer», 2026-10-24, dueño: «algo de expuesto, pero un proyectil mágico que si pega deja expuesto: un poquito de
  daño con un poquito de debuff»; «un dado de 6 de daño directo, se esquiva con evasión»; el nombre lo eligió el dueño): su PdG.Esp contra la Evasión de un
  rival en su Rango; si pega, **1d6 arcano directo** (no lo frena la Defensa especial) y **Expuesto** hasta que empiece el próximo turno del objetivo (el
  estado de Degollar: Evasión a la mitad, sin reacciones que cuesten No2). Es la primera que se lo pone a un rival. 2 No2 y 3 SP, o cooldown 3 (como la
  Maldición de la coraza; daño fijo, P216). **Para probar.**

- ✅ **Estandarte de guerra** (Support, «estandarte», 2026-10-24, dueño: «+3 a la probabilidad de golpe, +5 al daño, 10 por nivel de HP, sin ningún tipo
  de defensa ni resistencia»; «permanente hasta que se rompa»; «el diámetro tiene que ser de 7»; el aura, «algún estilo marcial, después te digo»; «en cualquier lugar dentro de su rango»; «con cooldown, de 4 pero
  disponible desde el inicio del combate»): clava un estandarte en una casilla libre dentro de su Rango (un creep nuevo de su bando, quieto, sin ataques, con su imagen de bandera; no entra al orden de turnos ni da
  experiencia ni botín). Sus aliados a 3 casillas o menos (él incluido) suman **+3 al PdG (o PdG.Esp) y +5 al daño** mientras siga en pie, con arma o con
  habilidad (`cfg.estandarte` del duelo; también en el ataque de oportunidad); con 0 de vida se rompe y se va. Uno por creep. El aura: la línea punteada dorada
  sobre las casillas, un velo carmesí y, por fuera, un anillo con banderines que flamean (`vtt-hexgrid/js/73`). 2 No2 y 4 SP, o cooldown 4 (sin arrancar el combate en cooldown: `disponibleAlInicio`). El anillo sigue la forma del área con las puntas redondeadas. **Para probar.**

- ✅ **Meteoro** (Mago, «área anunciada», 2026-10-24, dueño: «se esquiva con dodge roll; se anuncia como una sombra, viene del cielo»; se llamó Lluvia de
  meteoros hasta el ajuste del mismo día: «cooldown 3, pero que empiece activado el cooldown, tipo lento; 4d6 físicos, 2d6 de fuego directo; de nombre, Meteoro»): marca el centro dentro de su Rango y queda una **sombra** (diámetro 5) que todos ven, con la Mesa y la Crónica. Al
  empezar su próximo turno (con orden de turnos; sin orden, en el próximo cambio de ronda) cae: la explosión en todas las pantallas y un área con el centro
  fijo donde **cada uno arranca en el dodge roll** (sin tirada, como la Tormenta arcana); quien no sale recibe **4d6 físico** (lo frena la Defensa) y **2d6
  de fuego** (lo nuevo: `hab.dano.extra` → `dano.magico` del duelo; directo, menos la resistencia al fuego). Le cae a todos los de adentro menos él, también a
  sus aliados; no a los caídos. Si él cae antes, la sombra se disipa. Es su ataque del turno. 2 No2 y 5 SP (propuesta de Claude), o **cooldown 3 que arranca
  el combate activo**, como una lenta (`arrancaEnCooldown`). Probado en el mapa el 2026-10-24 (con 4d6 de fuego; falta verlo desde un jugador).

- ✅ **Disipar** (Debuffer, «romper lo que lo protege», 2026-10-25, dueño: «el usuario de disipar elige cuál quitar»): su PdG.Esp contra la Res.Esp de un
  rival en su Rango; si gana, la pantalla del GM muestra los estados buenos del objetivo (no los que salen del equipo o las pasivas) y elige cuál sacarle
  (`disipar: true` en el efecto; js/13). Sin estados buenos, no pasa nada. 2 No2 y 3 SP, o cooldown 3 (costo propuesto por Claude, como las maldiciones). Probado en el mapa el 2026-10-25 (GM, «Claude · pruebas»): ganó contra juan, el menú mostró
  sus tres estados buenos con la duración y el detalle, se eligió Escudo especial y se lo sacó (la Mesa: «le sacó Escudo especial»). Falta: que lo vea un jugador.
- ✅ **Señalar la presa** (Support, «concentrar el fuego», 2026-10-25, dueño: «menos 2 a Evasión y más 4 al daño»): su PdG.Esp contra la Res.Esp de un
  rival en su Rango; si gana, **Presa señalada** 2 turnos (preset nuevo: Evasión −2, `presa: 4`; `presaContra` de js/13 suma ese daño a todo el que lo
  ataca y, con dos Presas encima, vale la más fuerte) y **Marcado** los mismos 2 turnos (dueño, el mismo día: «que quede como marca visible, que no se
  pueda ocultar y que se vea a pesar de la niebla de guerra»). 1 No2 y 2 SP, o cooldown 3 (costo propuesto por Claude). Probado en el mapa el 2026-10-25 (GM): ganó contra juan, le llegó la Presa señalada
  2 turnos, su Evasión pasó de 8 a 6 y el ataque siguiente del Escarabajo declaró «🎯 contra la presa: +4 al daño». Falta: que lo vea un jugador.
- ✅ **Lanza de luz** (Mago, «daño concentrado», 2026-10-25, dueño: la línea que atraviesa «y que además deje un estado de −2 a la resistencia especial»,
  2 turnos): línea de 6 casillas desde él (la de la Varita láser, con fuego amigo); tira su PdG.Esp una vez y cada uno se defiende con su Evasión; al que no
  esquiva, 3d6 arcano (lo frena la Defensa especial) y **Deslumbrado** 2 turnos (preset nuevo: Res.Esp −2). 2 No2 y 4 SP, o cooldown 3 (costo y daño
  propuestos por Claude). **Para probar.**
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
