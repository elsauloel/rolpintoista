# Clon de una partida (para pruebas)

Copia una partida real a otra partida **de pruebas**, para probar ahí sin tocar la de verdad. Hoy se usa para «El origen · CLON de pruebas»,
que es copia de «El origen de las especies» (ver `docs/memoria-claude.md`, «El clon de El origen»).

**La regla de oro: la partida original solo se lee. Nunca al revés.**

## Cómo está armado (para que no pueda escribir en la original ni por error)

- **Etapa 1 — leer** (`leer.js`): abre `pagina-lectura.html`, una página propia con **todas** las escrituras a Firestore apagadas, entra con la
  cuenta GM de pruebas, lee toda la partida original y la guarda en un archivo (`volcado-<etiqueta>.json`) junto con una «foto»
  (`foto-<etiqueta>.json`: cuántos documentos y una huella por colección). No se abren el mapa, la ficha ni GM Tools de la original (esas
  páginas escriben solas).
- **Etapa 2 — escribir** (`escribir.js`): trabaja desde el archivo, sin volver a leer la original. Abre `pagina-escritura.html`, que
  rechaza cualquier escritura cuya ruta no sea de adentro de la partida clon, y aborta si el destino es la original, si su nombre no dice
  «CLON» o si su GM no es la cuenta de pruebas. Antes de la primera escritura muestra el nombre del destino. Primero vacía el clon y después
  lo llena.
- **Comprobar** (`comparar.js`): compara la foto de la original de antes y de después. Tienen que ser iguales.
- `actualizar-clon.sh` hace todo en orden: foto → leer → vaciar y escribir → otra foto → comparar.

## Qué copia y qué no

Copia: mapas (fondo, niebla, paredes y dibujos, terreno, zonas, trampas), tokens, cuál es el mapa publicado, creeps (lo público y lo privado
del GM, con imágenes), las fichas de los personajes elegidos con todas sus partes e invocaciones, tienda (borrador, publicada, stock) y
tiendas guardadas, bitácoras (jugadores y GM), baúl, lo del GM (`gm/*`) y los ajustes de la partida.

No copia: los otros personajes ni sus tokens, tiradas de la Mesa, historial, duelos, áreas, momentos, estados en cola, paquetes, botín,
recompensas, piedra-papel-tijera, registro del baúl, la pausa, el orden de turnos (el clon queda en narrativo) ni quién «tomó el control» de
un personaje. Los miembros del clon son sus propias cuentas.

Cambios obligados por los permisos: las fichas las crea una cuenta de jugador (el GM no puede crear fichas) y la del personaje sin jugador
queda a nombre del GM; tokens, dibujos y elementos quedan con fecha de creación de hoy y a nombre del GM de pruebas (los tokens de
personaje, de su jugador de pruebas); la bitácora compartida queda firmada por el GM de pruebas, con el nombre del autor original.

## Cómo se usa

La partida clon se crea una sola vez, a mano desde el sitio (con la cuenta GM de pruebas, «+ Crear partida», con «CLON» en el nombre) y los
jugadores de prueba entran con «Unirme como jugador». Después:

```bash
export CLON_DIR=/ruta/fuera/del/repo          # ahí quedan los volcados: tienen ids, NO van al repo
export CLON_ORIGEN="nombre exacto de la partida original"
export CLON_DESTINO="nombre exacto del clon"  # tiene que decir CLON
export CLON_PERSONAJES="Fulano,Mengano,Zutano" # un pedazo del nombre de cada personaje que va
export CLON_ASIGNAR="Fulano=J1,Mengano=J2"     # quién maneja a quién; el que no figura queda sin jugador (a nombre del GM)
# y las cuentas de prueba: ROL_GM_EMAIL/ROL_GM_CLAVE, ROL_J1_…, ROL_J2_…
bash herramientas/clon-de-partida/actualizar-clon.sh
```

Necesita Node con Playwright y un Chrome/Chromium. No hace falta servidor local. Acá no hay ids, emails ni claves: las partidas se buscan por
nombre y las cuentas salen del entorno. **No guardar los volcados en el repo** (es público).
