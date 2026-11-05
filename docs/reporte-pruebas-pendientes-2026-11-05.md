# Pruebas pendientes del mapa — 2026-11-05

Tanda en «Claude · pruebas» con las cuentas GM / Jugador 1 / Jugador 2 (nunca El origen). Al terminar, la partida quedó como estaba (solo cambió la
fecha de creación de dos tokens que hubo que volver a crear). Pruebas automáticas: 786/786.

## Cambio pedido: Marcar el ritmo con elección (commit 57192dcc)
Un solo aliado pegado: sube solo. Varios: al dueño de quien tiene la pasiva le sale «🥁 … marca el ritmo: ¿a cuál de los aliados pegados sube 1
lugar?» (un botón por aliado y «No subir a nadie»); si es un creep, elige el GM; si el jugador no contesta en 30 s, le sale al GM; si nadie elige, no
sube nadie. Probado con tres pantallas: Jugador 1 eligió a Larry (12.º → 11.º) y las otras vieron la animación de la lista.

## Anduvo
- Revivir: el GM revivió un creep (Goblin Scout) al 50 %, Titilando; Jugador 2 revivió a su invocación con el ✚.
- Arrastrar: el gancho trae al personaje 2 casillas y lo deja Desequilibrado.
- Tokens ↔ GM Tools: «Dejarlo en este mapa» deja el creep sin token; Ctrl+V pregunta si crear la ficha o solo el token; «Eliminarlo» pide confirmación.
- GM Tools: «Poner en el tablero los que faltan» y «Ver en el tablero ↗».
- Toque de carga: el costo pasa a 5 SP la segunda vez. Cambio de guardia, Sed de sangre y Mufa, llamados desde la pantalla del GM (sin clics): bien.
- Animación de la lista de turnos: vista en las otras pantallas al subir alguien.

## Falló y quedó arreglado
- Una pestaña del mapa del GM mirando OTRO mapa tomaba los avisos internos (son de toda la partida) y contestaba «no está en el mapa / en el orden»
  (gancho de Arrastrar, Toque de carga, Marcar el ritmo). Ahora cada pantalla del GM solo toma lo de los tokens de su mapa (5d18c8b8, 4d7f7fa1).
  **Hay que recargar las pestañas del mapa del GM que estén abiertas.**
- Desequilibrado se iba al empezar la ronda, antes de terminar el turno de quien arrastró: ahora dura hasta ese fin de turno (dd44de31).

## No anduvo, sin arreglar
- El GM no puede revivir una invocación desde el anillo: al morir, su token desaparece del mapa (su dueño sí la revive). Pregunta para el dueño.
- Durante la animación del gancho, el cuadro del duelo de Jugador 1 queda abierto encima del mapa (visual).

## Sin probar
Cambio de guardia con clics y la tirada de la Mufa en una ronda real; el duelo real con Punto débil 💢, Golpe brutal / Apuntar / marca, Mañas de
sobreviviente y Contra las cuerdas, Grasa y Ungüento (y un creep con el Ungüento); el pulso y la espada del Remolino.
