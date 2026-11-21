# Segunda tanda de pruebas — 2026-11-03

Todo en «Claude · pruebas», a 1920×1080, con clics. El GM usó a Larry y a Bizzante, dos personajes del GM, tomando 🎮 el control. Jugador 1, con Prueba Uno, se usó solo para lo que necesitaba las reglas nuevas.

Por código solo preparé lo necesario:
- agregar cinco creeps esenciales de prueba («T2») y llevarlos a una zona libre;
- devolverle No2 o cooldown a un creep para repetir una tirada;
- crear dos portales y dos nubes del GM;
- poner el orden de turnos con los cinco creeps.

Las capturas están en `/home/user/capturas/`, con el prefijo `t2p-1103-`.

## 1. ⏳ Los cooldowns bajan al pasar los turnos — ✅

Orden de turnos con Escudero, Piromante, Sangrador, Sanador y Maldito, avanzando con «▶ Siguiente».

- **El cooldown baja 1 al empezar el turno de cada creep**, y solo el suyo. Lengua de fuego bajó 4 → 3 → 2. Golpe que sangra y Sanar bajaron 2 → 1 → 0 y quedaron disponibles otra vez. Maldición de la coraza y Aguja siniestra bajaron 3 → 2 → 1.
- **Piel de hierro venció a los 2 turnos**: se usó en la ronda 1; al empezar la ronda 2 quedaba 1 turno; al empezar la ronda 3 se fue y la Defensa del Escudero volvió de 9 a 5.

## 2. ⚔ Sangrador, Sanador y Maldito peleando — ✅

**Sangrador:**
- **Golpe que sangra** contra Bizzante: hubo empate y se resolvió con par. El golpe hizo 12 de daño; con la Defensa 5, entraron 7. Además dejó Sangrado, que entró siempre, más el 25 % del arma, que también salió.
- **Sal en la herida** contra Bizzante, que ya sangraba: sumó «+2d6» al daño. Le entraron 16 y lo tiró, y el sangrado subió. Al ser el segundo ataque del turno, costó 6 No2.

**Sanador:**
- **Sanar** al Sangrador: 9 de vida (12 → 21).
- **Purificar** le sacó el Veneno y lo curó 5.
- **Varita de cura**: 9 de vida.
- **Pergamino de Regeneración menor**: 5 por turno durante 3 turnos.

**Maldito** contra Larry:
- **Maldición de la coraza**: PdG.Esp 6 contra Res.Esp 4 → Coraza maldita por 3 turnos (Defensa 2 → 0, Def. especial 0 → −2).
- **Aguja siniestra**: 1 de daño siniestro directo, más Punto débil y Herida sombría.
- **Varita del susurro**: 3 de daño arcano directo; el 25 % de Silencio no salió.
- **Runa de debilidad**: se colocó en una casilla con un clic. Larry la pisó, tiró Res.Esp 2 contra 13 y le quedó Debilidad por 2 turnos.

### Bugs arreglados

- **🩸 El Sangrado de 2 turnos le llegaba al personaje como permanente.** Al viajar al personaje, el estado tomaba el «permanente» de la lista aunque trajera turnos. Pasaba con todo golpe que sangra contra un personaje.
  - Arreglo en `comun/estados-aplicar.js` (`conDatosDelPreset`).
  - Prueba automática nueva.
  - Commit `d0f1b505`.
- **📜 El Pergamino de Regeneración menor de un creep le quedaba solo a él.** Lo mismo pasaba con el pergamino grupal de Furia de Combate del Hachero. Ahora les llega también a los creeps aliados del mapa (el mismo estado que un personaje les pasa a sus aliados).
  - Probado en el mapa: el Sangrador herido subió 5.
  - Arreglo en `vtt-hexgrid/js/12-acciones-nuevas.js`.
  - Commit `ae4c6829`.
  - En GM Tools todavía no está.

## 3. Lo que esperaba las reglas de Firebase — ✅

- **🚫 La Anulación sobre un portal ajeno, leída por un jugador.** Prueba Uno leyó el Pergamino de anulación sobre el portal del GM y el portal se fue. La Mesa dice «anuló 1 portal». Su pareja quedó, porque estaba fuera del área.
- **💨 El viento de un jugador sobre la nube del GM.** Prueba Uno, con la Varita del vendaval:
  - con una nube chica, la borró entera (7 casillas);
  - con una de 19 casillas, la recortó y quedó de 15.
- **🖼 «👁 Ver completa» desde un jugador.** Prueba Uno abrió la tarjeta 🪪 del Arquero del culto y vio la imagen completa (353×480).

## Para que decida el dueño

- **La Coraza maldita puede dejar la Def. especial en negativo** (Larry quedó en −2). Ese −2 después suma daño: la Lengua de fuego le hizo 9 más 2 del diablito, y la Mesa contó 13. Además, el texto de la Mesa salió mezclado: «no se resta la Defensa (si la Defensa especial)».
- **El pergamino grupal de un creep les llega a todos los creeps del mapa**, también a los que no están en esa pelea. Con el pergamino de un personaje pasa lo mismo.

## Restauración

- Borré los cinco creeps de prueba, sus tokens, las nubes y los portales.
- Devolví el orden de turnos a como estaba.
- Larry y Bizzante: devolví el control, las partes de la ficha y su lugar.
- Prueba Uno: saqué la varita, y los No2 y la SP quedaron como estaban.

**Lo que no se pudo deshacer:** al pasar de ronda en la prueba de los cooldowns corrió dos veces el «Mantenimiento de la ronda». Eso le pasa el turno a los que no están en el orden: Larry, Bizzante, la Abeja Gorda y los personajes de los jugadores, si sus pantallas estaban abiertas.

Además, el pergamino grupal tocó a cuatro creeps de la otra tanda: Basilio, el Arquero del culto, el Goblin picapiedras y el Goblin scout. Les saqué la Regeneración y les devolví la vida que tenían. «El origen de las especies» no lo toqué.

## Commits

- `d0f1b505`: 🩸 el Sangrado de 2 turnos (`comun/estados-aplicar.js`, `comun/pruebas.html` y las versiones `?v=` de los HTML).
- `ae4c6829`: 📜 el pergamino grupal de un creep (`vtt-hexgrid/js/12-acciones-nuevas.js` y `vtt-hexgrid/mapa.html`).
