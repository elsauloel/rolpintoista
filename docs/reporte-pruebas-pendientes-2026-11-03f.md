# Pruebas pendientes en el mapa (tanda f) — 2026-11-03

Primero arreglé los tres detalles chicos de la tanda e y después pasé, con clics, las pruebas que faltaban. Todo en «Claude · pruebas», a 1920×1080, con las cuentas GM, Jugador 1 (Prueba Uno) y Jugador 2 (Prueba Dos), contra el código nuevo (servidor local).

**Por código solo preparé:**
- **Goblin picapiedras:**
  - le di habilidades de prueba: Salto, Takle, Hit and run, Bomba de humo, ¡Al frente!, Contraataque y un «Robo de prueba»;
  - le di el Sable del tahúr, el Facón de paisano y nitros;
  - lo pasé un rato a turnos de espera.
- **Prueba Uno:** le puse Sentado.
- **Prueba Dos:** le di pociones, el Relicario de sangre, la Daga en la mano y dos «Vida extra» viejas.
- Moví tokens.

Al final restauré la partida y la comparé con la copia de antes. Solo quedan distintos unos momentos viejos de la Crónica, que el mapa vence solo, y la niebla descubierta, que se vuelve a descubrir al abrir el mapa. «El origen de las especies» no la toqué. El combate de prueba lo abrí hasta el paso «Publicar» y lo cerré **sin publicar**: nadie recibió experiencia ni oro. Capturas en `/home/user/capturas/`, con el prefijo `pend-1103f-`.

## 🐞 Los tres arreglos chicos (commit `8f318df5`)

### 1. El aviso de oportunidad negada le salía a quien no podía atacar
- **El arreglo:** ahora la oportunidad, y su aviso, no cuentan a un rival **Sentado, con Stun o Sueño, caído o muerto** (`vtt-hexgrid/js/17-oportunidad.js`). Ya no contaban antes el que solo tiene arco, el que no tiene nitros ni el Expuesto.
- **Probado:** el Goblin saltó con Salto desde al lado de Prueba Uno, que estaba Sentado. A Prueba Uno no le apareció nada y no quedó línea en la Mesa. ✅

### 2. Al cancelar con «No cuenta» la habilidad de un creep con turnos de espera, la Mesa decía «se le devuelve … SP»
- **La causa:** el cobro anotaba como «SP» la diferencia del SP calculado, que en un creep sin SP sale del máximo.
- **El arreglo:** el SP solo se anota y se devuelve en modo SP (`vtt-hexgrid/js/12-acciones-nuevas.js` y `comun/creep-acciones.js`), con prueba automática.
- **Probado:** el Takle del Goblin, con turnos de espera, dice «No cuenta · se le devuelve 2 No2, su cooldown». Volvió a 6 nitros y el Takle a 0. ✅ Con SP, el Salto dice «4 No2, 2 SP», como debe.

### 3. El movimiento libre que se pasaba de los nitros cerraba el cartel y se perdían los casilleros gratis
- **El arreglo:** si no alcanza, el token no se mueve, sale un aviso y **el cartel sigue abierto** para probar más corto (`vtt-hexgrid/js/06-mouse.js`).
- **Probado:** con la Bomba de humo y 3 nitros:
  - Arrastré 10 casilleros: no se movió y salió «💨 Te pasaste: 3 casilleros son gratis y lo demás cuesta 9 No2 (tenés 3). Probá más corto: el cartel sigue abierto.».
  - Arrastré 3: se movió gratis y el cartel se cerró. ✅

Las pruebas automáticas dan **758 de 758** (sumé una).

## Lo que faltaba

### 🫳 La huida de un robo, con el aviso de oportunidad negada — ✅
1. El Goblin, pegado a Prueba Dos, le robó con una habilidad de prueba que tiene el efecto «Robo».
2. Prueba Dos defendió con Evasión (4 contra 6) y el GM aplicó el Robo: «le robó Poción de HP».
3. Se abrió el cartel de la huida y el Goblin se alejó 2 casilleros.
4. A Prueba Dos le salió «💨 Goblin picapiedras se alejó de Prueba Dos con la huida del robo: no permite ataque de oportunidad», con «Entendido», y quedó la línea en la Mesa.

### ❤ Relicario de sangre y Vida extra — ✅
- **Relicario:** Prueba Dos, con la vida llena (30/30) y el Relicario puesto, tomó una Poción de HP y quedó con **un solo «Vida extra 15»**, que es el tope: 50 % de 30. Con otra poción siguió en 15.
- **Dos «Vida extra» guardadas de antes** (de 5 y de 4, puestas por código): con la siguiente cura de más se juntaron en **una sola**, de 15 por el tope. No lo probé al empezar el turno, que es el otro momento en que se juntan.

### 🎯 ¡Al frente! cancelado con Esc — ✅
El Goblin, con turnos de espera, lo usó. Al pedir «¿a quién?» toqué Esc y salió «↩ Goblin picapiedras: canceló ¡Al frente! — se le devolvió el cooldown y 2 No2». Quedó con 6 nitros y la espera en 0.

### ⚔⚔ El contraataque con la segunda arma — ✅
1. El Goblin tenía el Sable y el Facón, con el facón en la mano, y la habilidad Contraataque.
2. Prueba Dos lo atacó con la Daga. El Goblin defendió con Evasión (9, a mano) y ganó.
3. Salió «¿contraatacás a Prueba Dos?» y toqué «Sí, contraatacar».
4. El duelo nuevo dice «con **Facón de paisano · Tipo 4**». Lo cancelé con «No cuenta».

### 💰 Valor del botín y 📋 Ver el grupo — ✅
GM → 🏁 Finalizar combate → «Batalla terminada».
- **📋 Ver el grupo:** abre «El grupo, para elegir el botín», con a quién le sirve cada pieza y, por personaje, sus lugares vacíos, stats, resistencias y debilidades.
- **5. Publicar:** muestra «💰 Valor del botín: si venden todo ~417 DDE · ~42 c/u entre 10 · si nadie toma nada y se despoja ~215 · en una tienda costaría 835 DDE», y la experiencia y el oro por personaje.
- Cerré **sin publicar**.

## Cosas que vi
- **El cartel del Contraataque de un creep** dice «Cuesta su Contraataque (Flash, el doble en turno ajeno)…». Con turnos de espera ya no es el doble sino un 50 % más. Es solo el texto de ese cartel.
- **La huida del robo cobra el movimiento:** el Goblin pasó de 5 a 3 nitros al huir 2 casilleros, porque el cartel de la huida es el del dodge roll, que paga el movimiento. No sé si la idea era que fuera gratis («se aleja hasta 3 casilleros»), así que no lo toqué.
- **Errores en la consola de las tres cuentas:** son de red del servidor local (la librería de los dados 3D, alguna conexión cortada). Son del entorno de prueba, no del juego.

## No llegué
- Que las Vida extra viejas se junten **al empezar el turno**. Se probó al recibir otra cura.

## Commits
- `8f318df5`: 🐞 los tres arreglos.
  - Código: `vtt-hexgrid/js/17-oportunidad.js`, `vtt-hexgrid/js/12-acciones-nuevas.js`, `vtt-hexgrid/js/06-mouse.js` y `comun/creep-acciones.js`.
  - Pruebas: `comun/pruebas.html`, con una prueba nueva.
  - Los `?v=` de `mapa.html`, `gm-tools.html` y `simulador-encuentro.html`.
- `3259840d`: lo tildado en `docs/pruebas-en-el-mapa.md`.

## Capturas (las mejores)
1. `pend-1103f-01-sentado-sin-aviso-j1.png`: Prueba Uno Sentado, sin el aviso.
2. `pend-1103f-03-cancelar-takle-cd.png`: «No cuenta · se le devuelve 2 No2, su cooldown».
3. `pend-1103f-05-humo-te-pasaste.png`: «Te pasaste…: el cartel sigue abierto».
4. `pend-1103f-09-robo-huida-aviso-j2.png`: el aviso por la huida del robo.
5. `pend-1103f-14-contra-con-facon.png`: el contraataque «con Facón de paisano».
6. `pend-1103f-16-ver-el-grupo.png`: «El grupo, para elegir el botín».
7. `pend-1103f-17-publicar-valor-botin.png`: el valor del botín.
