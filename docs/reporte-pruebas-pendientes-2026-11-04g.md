# Pruebas pendientes en el mapa (tanda g)

2026-11-04 · partida «Claude · pruebas» · tres pantallas a 1920×1080 (GM, Jugador 1 con Prueba Uno, Jugador 2 con Prueba Dos), todo con clics.
Capturas en `capturas/` con el prefijo `pend-1104g-`.

## Qué probé

**🔥 Arma elemental a un aliado** — anda.
- Prueba Uno abrió «Arma elemental» en la Botonera, eligió «Elegir» (1 No2 + 3 SP), Fuego, a Prueba Dos como objetivo y «¿A qué arma…?» → Lanza corta (`01`…`05`).
- A Prueba Dos le llegó el aviso al instante (`07`) y el estado apareció en el mapa a los ~8 segundos (`06`).
- Detalle: los No2 y SP se cobran apenas se toca «Elegir», antes de elegir a quién. Si se cancela a mitad, ya se pagó.

**⚔ Ataque con el arma encendida + «🧮 La cuenta del daño»** — anda. Este renglón quedó tildado.
- El botón de daño decía «1d4 + 4 + 🔥 +1d6 fuego ×1,5 (Arma elemental)».
- La cuenta mostró el renglón «+ 🔥 Daño de Fuego» y «= el fuego, a la vida».
- La Mesa del GM dijo «7 − Defensa 9 = 0 a la vida · 🔥 + 0 de fuego directo = 0 en total (18 → 18 HP)» (`11`, `12`).
- El fuego no entró a la vida porque el escudo del goblin absorbió 2. Eso lo dice el cartelito de abajo, pero la cuenta no lo muestra. Lo dejo anotado por si el dueño quiere que la cuenta lo diga.

**⚔ «¿Con qué arma?» (la tecla A)** — había un error y lo arreglé.
- El error: la lista mostraba las armas, pero la Lanza encendida aparecía sin el 🔥 (`08`). La ficha no le pasaba al mapa los datos del Arma elemental cuando publicaba su resumen.
- El arreglo: el resumen ahora lleva el elemento, a qué arma va y el dado (`comun/ficha-resumen.js`). Se le agregó una prueba automática en `comun/pruebas.html`, que quedó en verde con 769 de 769.
- Probado de nuevo con clics: ahora dice «⚔ Lanza corta · Tipo 4 · 4 No2 · 🔥 +1d6 fuego ×1,5 (Arma elemental)» (`13`).

## No llegué
- 💔 Vida en 0 desde el mapa (con Pacto y sin pacto).
- 🔥🐝 Arma elemental en una invocación, y de un creep a otro creep.
- Arrastrar de creep con la versión vieja guardada (el flujo nuevo de Arrastrar ya estaba tildado de antes).
- El «Agregar» destacado, el globo de Estados alterados (Piel de hierro), la tarjeta de manos del Cultista, la Tienda de inicio, el robo en sigilo con oro y el personaje con robo propio, que se junten las Vida extra viejas, y el error de permisos con el mapa y la ficha abiertos a la vez.

## Cómo quedó la partida
- Dejé todo como estaba antes, salvo dos cosas. Comparé el antes y el después y solo quedaron estas dos diferencias:
  - **Prueba Uno** tenía 8 No2 y su máximo es 3. Lo dejé en **3**, como pidió el dueño.
  - Se borraron tres duelos viejos que ya estaban terminados. Esos ya no se usan.
- No toqué «El origen de las especies».
