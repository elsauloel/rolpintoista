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

# Segunda tanda (2026-11-05, con clics desde el mapa)

Cuentas Jugador 1, Jugador 2 y GM en «Claude · pruebas». Lo tocado se respaldó antes y se restauró al final. El origen no se tocó.

## Anduvo
- **Toque de carga** desde la Botonera: cuesta 3 → 5 → 7 y el aliado sube un lugar (Prueba Dos, 13.º → 12.º), aplicado por la pantalla del GM.
- **Cambio de guardia** con dos clics: el cambio se hace al empezar la ronda siguiente (Prueba Dos 8, Prueba Uno 11).
- **Sed de sangre**: Prueba Uno mató a Basilio en la ronda 3 y subió 2 (11 → 9). En la ronda 2 no se pudo, porque ya había usado un efecto esa ronda (la regla de uno por ronda).
- **Echar la mufa** a un aliado (directo) y a un rival (se resiste con Res.Mt). Al empezar la ronda se tira Res.Mt contra el Efecto especial: el picapiedras perdió y bajó 8.º → 9.º, con la animación de la lista.
- **Duelo real** con **Punto débil 💢** + **Golpe brutal**: crítico ×3 con el cuadro nuevo.
- **Grasa de carpincho** y **Ungüento del herrero** desde la Botonera. El Ungüento repara 1 de Armadura rota.
- Un **creep** con el Ungüento desde ⚡ Acciones.
- **Ficha lite**: Mañas / Contra las cuerdas con poca vida.

## Falló y quedó arreglado
- Una pestaña vieja del mapa del GM en otro mapa tomaba el Toque, el daño, la Mufa y el Cambio de guardia. Dejaba «el token ya no está…» o anotaba el cambio en su mapa. Ahora esos pedidos tienen nombres nuevos y solo los toma una pantalla que ve a los dos tokens (70090bb3, bdb2a5d8, 60a067bf, f84f540a).
- La tirada de la Mufa salía con un valor fijo y la Mesa decía «[object Object]» (04de2e1b).
- La ficha lite mostraba el Tipo 12, y con poca vida no sumaba Mañas ni Contra las cuerdas (ce68d298).
- La Mesa no decía cuánta Armadura rota reparó el Ungüento (60f16a54).
- **Remolino / áreas**: una pantalla del GM en otro mapa salteaba a los objetivos y el giro terminaba sin pegarle a nadie. Ahora el área guarda su mapa (c625f261). **Hay que recargar las pestañas del mapa.**

## Sin probar
- El Remolino después del arreglo: el pulso, el cuadro que se despliega y se pliega, y el siguiente rival.
- Apuntar y Marcar con el potente nuevo.
- El cuadro del duelo encima de la animación del gancho (`Duelo.apartar`).

## Para el dueño
- El Tipo 12 sigue apareciendo en el panel ⚡ Acciones de los creeps, en la lupa del creep y en la Botonera. Solo se sacó de la ficha lite. ¿Lo sacamos de todos lados?
- Invocaciones: anotado lo que decidiste (al morir desaparece del mapa y quien la invocó la puede volver a invocar).
