# El mapa «Prueba · General» y su vuelta

El mapa fijo para las pruebas generales, en la partida de pruebas «Claude · pruebas 2» (ver `docs/memoria-claude.md`, «Dónde probar»).
Dos scripts: **`foto.js`** guarda cómo está el mapa y **`restaurar.js`** lo vuelve a dejar así. Se usan al terminar cada prueba.

## Qué guarda la foto

Del mapa: el nombre, sus tokens (posición, giro, oculto, revelado, Paso fantasma…), sus elementos (sólidos, terreno, trampas, zonas), los dibujos
del lápiz y su estado (modo narrativo o combate, orden de turnos, niebla, luz, delatados…); y cuál es el mapa publicado. De quienes están en
el mapa: cada ficha de personaje con todas sus partes (vida, SP, No2, estados, equipo, mochila, cinturón, habilidades, pasivas, talentos y sus
invocaciones) y cada creep con su ficha privada (vida, No2, estados, cooldowns, equipo, habilidades, pasivas).

## Qué hace la vuelta

- Saca lo que se agregó en el mapa (tokens, elementos, dibujos, el orden de turnos…) y los creeps nuevos que quedaron en ese mapa.
- Vuelve a poner lo que se sacó (con el mismo id) y deja como estaba lo que cambió.
- Descarta los estados que quedaron en cola para esos personajes sin aplicar.
- Al final vuelve a leer todo y lo compara con la foto: «✔ quedó igual» o la lista de lo que quedó distinto.
- `node restaurar.js --ver` solo dice qué cambiaría, sin escribir nada.

No toca la Mesa, el historial, los duelos ni las áreas (las pruebas tienen que terminar los duelos con «Terminar duelo», como siempre).
Al comparar no cuenta la hora de cada cambio ni qué pantalla guardó la ficha por última vez. Un elemento que había puesto un jugador y que hubo
que volver a crear queda a nombre del GM (las reglas no dejan crearlo a nombre de otro). Si en la prueba se borró una ficha, la vuelta avisa: el
GM no puede crearla, la tiene que volver a armar su jugador.

**Antes de restaurar, cerrar el mapa, las fichas y GM Tools de esa partida** (si quedan abiertas pueden volver a guardar lo de la prueba encima).

## Cómo se usa

```bash
export MAPA_FOTO_DIR=/ruta/fuera/del/repo   # ahí queda la foto: tiene ids, NO va al repo
# (la cuenta GM de pruebas: ROL_GM_EMAIL / ROL_GM_CLAVE)
node herramientas/mapa-general/restaurar.js           # al terminar cada prueba
node herramientas/mapa-general/foto.js                # solo si se cambia a propósito el punto de partida
```

Por defecto es el mapa «Prueba · General» de «Claude · pruebas 2»; `MAPA_PARTIDA` y `MAPA_NOMBRE` cambian eso (solo partidas que digan «prueba»
en el nombre). Se le puede pasar otro archivo: `node foto.js /ruta/otra-foto.json`. Necesita Node con Playwright y un Chrome/Chromium; no hace
falta servidor local. Acá no hay ids, emails ni claves: la partida y el mapa se buscan por nombre y la cuenta sale del entorno.
