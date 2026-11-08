# Cola de pruebas en el mapa

Pedido del dueño (2026-11-08): «Pone esto en la cola de pruebas y a medida que vas haciendo una prueba, me mandas los resultados y vas avanzando
con la programación de la siguiente en la cola.» Mientras el dueño diseña, las pruebas en el mapa no se hacen en el momento: se anotan acá y se
corren **de a una**, en orden, en segundo plano. Al terminar cada una se le pasa el resultado al dueño y se arranca la siguiente.

Reglas de cada prueba (las de siempre, ver `pruebas-en-el-mapa.md`): en «Claude · pruebas» / «Encuentro 2», **nunca «Mapa 1»**; respaldo antes y
restauración después; sin servidores ni navegadores viejos conectados; capturas para el dueño. Si aparece un error, se arregla, se prueba y se sube
(con el commit de siempre) y se anota en el resultado.

Estado: `[ ]` en cola · `[~]` corriendo · `[x]` hecha (con el resultado en una línea).

## En cola

3. [ ] **Milagro, versión de clase** (jugador): nunca se probó en el mapa.
4. [ ] **Línea W1 · Hachero, niveles 1 a 5**: ponerlos en el mapa y hacerlos pelear un poco; que cada habilidad y pasiva funcione en juego.
5. [ ] **Línea T1 · Escudero, niveles 1 a 5** (igual).
6. [ ] **Línea H1 · Embestidor, niveles 1 a 4** (el 5 está en pausa).
7. [ ] **Línea L1 · Sangrador, niveles 1 a 5.**
8. [ ] **Línea L2 · Envenenador, niveles 1 a 5.**
9. [ ] **Línea R1, niveles 1 a 5.**
10. [ ] **Línea M1, niveles 1 a 5.**
11. [ ] **Línea S1, niveles 1 a 5.**
12. [ ] **Línea D1, niveles 1 a 5.**
13. [ ] **Línea W2 · Berserker, niveles 1 a 5** (con las dos espadas en el 5 y las Pieles erizadas).
14. [ ] **Línea T2 · Muralla con púas, niveles 1 a 5** (Provocar, Velo espejado, Mantelete contra disparos, Escudo humano sin Espinas).
15. [ ] **Línea H2 · Saltador** (cuando esté completa).

Cada línea nueva que se termine de diseñar se suma al final.

## Hechas

- [x] **Barrido hecho por una invocación** (2026-11-08): la Abeja Gorda de Bizzante (J2), con un hacha y el Barrido, contra tres creeps:
  se cobró una vez, eligió el primero, orden en el sentido de las agujas del reloj (el aliado al lado no entra), un duelo entero por rival (crítico
  con Rompe armadura, Parry + Bloqueo, esquive). Sin errores. Falta en el editor de habilidades de la invocación una forma de armarle un giro
  (se le copió el Barrido de creep). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Coletazo de una bestia** (2026-11-08): un ataque entero por rival en el sentido de las agujas del reloj, pulso y cuadro desde cada token,
  críticos, Veneno y Empujón al que pega, nada al que esquiva; el empujón contra un token choca una sola vez. Sin errores. Detalle en `pruebas-en-el-mapa.md`.
