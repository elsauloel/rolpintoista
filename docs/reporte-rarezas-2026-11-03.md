# Reporte de las cosas raras — 2026-11-03

Las tres rarezas que aparecieron en la tanda nocturna de pruebas. Commit `19d97cfe` en `nueva-version`; pruebas automáticas en verde (717, dos nuevas).

## 1. A Rockardo se le aplicó el inicio de su turno al mover el orden

- **Causa**: la tanda de la noche cambió el orden de turnos por código y después tocó «▶ Siguiente» varias veces; el turno pasó por Rockardo y su
  inicio se aplicó solo. Además había dos agujeros: el «✔ Aplicar» (del jugador) y el «▶ Aplicar por él» (del GM) seguían andando aunque ya no fuera
  su turno, y «se aplica solo al pasar el turno» buscaba el cartel pendiente solo por el paso del orden, sin mirar de quién era.
- **Arreglo** (`vtt-hexgrid/js/04-mantenimiento-e-iniciativa.js`, `js/16-momentos.js`): el inicio solo vale mientras siga siendo el turno de ese token;
  si no, el cartel se cierra con «⏱ Ya no es su turno: el inicio no se aplicó» y la ficha no se toca. El automático busca el cartel de ese token.
- **Cómo se probó**: en el mapa, leyendo el estado (el otro fork estaba usando el orden de turnos): con el turno de Rockardo el cartel vale; uno de
  un paso viejo o de otro token, no.

## 2. La PdG de un creep salía en la Mesa como «Jugador 1»

- **Causa**: en un duelo, las dos tiradas se publican desde la pantalla de quien tira segundo; si defendía un jugador, la PdG del creep salía sin
  nombre y la Mesa le ponía el de la cuenta.
- **Arreglo** (`comun/duelo.js`): cada tirada del duelo viaja con el nombre de su lado (el creep en rojo, como en GM Tools). Vale también para
  Fuerza del golpe, Bloqueo, crítico y efectos al golpear.
- **Cómo se probó**: con clics, publicando por ese camino desde la pantalla de Jugador 1: en la Mesa del jugador y del GM salió «Goblin ballestero»
  en rojo. Capturas `raro-1103-mesa-creep-J1.png`, `raro-1103-mesa-creep-GM.png` (después) y `raro-1103-mesa-creep-J1-recorte.png` (antes).

## 3. «Armadura rota ×2 ×2»

- **Causa**: el texto del efecto ya traía el ×2 y el duelo le pegaba otro.
- **Arreglo** (`comun/duelo.js`): sale una sola vez. Lo cubre una prueba automática nueva.
