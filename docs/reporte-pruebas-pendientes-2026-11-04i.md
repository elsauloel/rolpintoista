# Pruebas pendientes en el mapa (tanda i)

Arreglé 3 de los 4 problemas y los probé con clics en «Claude · pruebas». El cuarto, el de la góndola, no lo pude hacer pasar, así que no cambié nada ahí. También arreglé de paso un problema nuevo que apareció en la prueba de Piel de hierro. Probé Arma elemental de creep a creep y la vida en 0 desde el mapa, y anduvieron bien. Lo que no llegué a probar está más abajo.

Al final volví la partida a como estaba (Prueba Uno, Prueba Dos, el Goblin picapiedras, el Goblin Scout, los tokens y el orden de turnos). También devolví el borrador de la tienda al que tenía. «El origen de las especies» no se tocó. Los cambios están subidos a `nueva-version`, en dos tandas: 339ad634 y 0a0a1803.

## Los 4 arreglos
1. ✅ **Arma elemental cobraba antes de elegir a quién.** Ahora, si después de elegir el elemento apretás Esc o cancelás, se devuelve lo cobrado:
   - **Personaje:** Prueba Uno usó Fuego y le cobró 1 No2 y 3 SP. Al cancelar se los devolvió y salió el aviso «↩ Prueba Uno: canceló Arma elemental: Fuego — se le devolvió 1 No2 y 3 SP» (captura 04).
   - **Creep:** el Goblin picapiedras usó Fuego y los No2 bajaron de 6 a 4. Al cancelar volvieron a 6, con el aviso «↩ Goblin picapiedras: canceló Arma elemental — se le devolvió 2 SP y 2 No2» (capturas 05 y 06).
   - Cancelar Provocar también devuelve lo cobrado.
   - Agregué una prueba en `comun/pruebas.html`, que da 770 en verde.
2. ✅ **Piel de hierro decía +6 y sumaba +4.** La explicación ahora dice «+(3 + su nivel)… nivel 1: +4; nivel 3: +6». Debajo, el globo muestra lo que suma de verdad, por ejemplo «En este: Defensa +6 · Defensa especial +6 · …» (captura 08).
   - **Arreglado de paso:** en el mapa, el GM no veía ni la descripción propia ni los números de los estados de un creep, porque lo que se publica del creep no los trae. Ahora el GM los ve; los jugadores siguen sin verlos.
3. ✅ **El +2 de «recién arrastrado» se sumaba al robo.** Ahora un robo no lo usa y el +2 queda guardado para el siguiente ataque. Un ataque con habilidad suma +2 y uno con el arma también.
   - Esto lo comprobé corriendo la función en la página, no con un arrastre real.
   - Esa comprobación dejó en la Mesa dos renglones de prueba: «🪝 Goblin picapiedras ataca a Basilio recién arrastrado».
4. ⚠ **La góndola que se rearmaba con solo abrir el generador.** No pude hacer que pasara:
   - Abrí y recargué el generador con la tienda de pueblito: las 20 cosas de la góndola quedaron iguales.
   - Generé la tienda de inicio sin publicarla y recargué: siguió sin góndola y con 62 ítems.
   - Leyendo el código, al abrir el generador no se rearma nada.
   - No cambié nada. Si vuelve a pasar, hace falta saber qué se había hecho justo antes.

## Pruebas nuevas
- ✅ **Arma elemental de creep a creep:** el Goblin picapiedras se la puso al Goblin Scout. Le apareció «🔥 Arma ígnea: Espada de la colimba» por 3 turnos y la Mesa lo anotó (captura 10).
- ✅ **💔 Vida en 0 desde el mapa, sin pacto:** Prueba Uno tenía 6 de vida. Se la puse en 0 con «2 · HP directo» y quedó inconsciente: pantalla roja, «turnos hasta morir 5», botón «✚ Revivir» y en la Mesa «💔 Prueba Uno quedó en 0 de vida: inconsciente» (captura 11).
- **Los avisos «Empieza el turno de…» de la tanda h:** ya no queda ninguno. Al volver la partida a como estaba se borraron los avisos sobrantes, y quedaron solo 3 avisos viejos de otro tipo (de una onda de golpe).

## No llegué
- Arma elemental en una invocación.
- Vida en 0 con pacto, y con el dueño desconectado.

Las mejores capturas están en `/tmp/claude-0/-home-user/edeb9ab8-ceef-5963-b361-ad76b93d7e79/scratchpad/pend-i/` y todas en `/home/user/capturas/pend-1104i-*`. Las dos tandas quedaron anotadas en `docs/pruebas-en-el-mapa.md`.
