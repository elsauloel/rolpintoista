# Cola de pruebas en el mapa

Pedido del dueño (2026-11-08): «Pone esto en la cola de pruebas y a medida que vas haciendo una prueba, me mandas los resultados y vas avanzando
con la programación de la siguiente en la cola.» Mientras el dueño diseña, las pruebas en el mapa no se hacen en el momento: se anotan acá y se
corren **de a una**, en orden, en segundo plano. Al terminar cada una se le pasa el resultado al dueño y se arranca la siguiente.

Reglas de cada prueba (las de siempre, ver `pruebas-en-el-mapa.md`): en «Claude · pruebas» / «Encuentro 2», **nunca «Mapa 1»**; respaldo antes y
restauración después; sin servidores ni navegadores viejos conectados; capturas para el dueño. Si aparece un error, se arregla, se prueba y se sube
(con el commit de siempre) y se anota en el resultado.

Estado: `[ ]` en cola · `[~]` corriendo · `[x]` hecha (con el resultado en una línea).

## En cola

7. [ ] **Línea L1 · Sangrador, niveles 1 a 5.**
8. [ ] **Línea L2 · Envenenador, niveles 1 a 5.**
9. [ ] **Línea R1, niveles 1 a 5.**
10. [ ] **Línea M1, niveles 1 a 5.**
11. [ ] **Línea S1, niveles 1 a 5.**
12. [ ] **Línea D1, niveles 1 a 5.**
13. [ ] **Línea W2 · Berserker, niveles 1 a 5** (con las dos espadas en el 5 y las Pieles erizadas).
14. [ ] **Línea T2 · Muralla con púas, niveles 1 a 5** (Provocar, Velo espejado, Mantelete contra disparos, Escudo humano sin Espinas).
15. [ ] **Línea H2 · Saltador** (cuando esté completa).
16. [ ] **Milagro con 3d8** (2026-11-08): la cura pasó de 2d8 a 3d8, una sola tirada para todos los aliados del área; ver que la tirada y el texto digan 3d8.
17. [ ] **Barrido armado por un jugador para su invocación** (2026-11-08): en el armado de la habilidad de la invocación (✨ Ejecución → «Ataque con mi arma» → la tarjeta de la PdG) tildar «🌀 Giro (como el Barrido)»; usarlo en el mapa: elegir el primero, el orden, el pulso y el duelo de cada rival.
18. [ ] **Grebas del carnero: la Embestida** (2026-11-08): caminando 2 pasos en línea recta hasta el rival, el primer ataque del turno suma +2 PdG; regla del dueño: **el Salto y el Dash no cuentan como pasos en línea recta** (si cuentan, arreglarlo).
19. [ ] **Inamovible (Botas de estibador)**: que un empujón tire su 33 % (no se pudo probar en las líneas W1 y T1: no hubo empujones).
20. [ ] **Salto sin atacar cobra 1 No2** (2026-11-08): al caer, «No, solo saltar» (o caer sin rival pegado) devuelve los No2 del ataque menos 1; el cooldown o el SP quedan cobrados. También el Salto aplastante (mismo código). Y el Saltador H2 con el orden nuevo (nv2 Pisotón, nv3 Aguante, nv4 Dash, nv5 Barrido) en la línea 15.
21. [ ] **Finta sin crítico** (2026-11-09): un ataque con +2 al daño que no se puede parar (solo esquivar), sin Crítico frecuente ni potente de más; probarla con el Asesino de las sombras nivel 2.
22. [ ] **Paso Fantasma con Carga y Takle (y no con Salto ni Dash)** (2026-11-09): con el Anillo de Paso Fantasma, una Carga o un Takle de 3 casillas o más carga el +3 a la próxima Evasión (en la pantalla del que corre y en la del que defiende); un Salto o un Dash, no; moverse 6 no da más que +3.

Cada línea nueva que se termine de diseñar se suma al final.

## Hechas

- [x] **Línea H1 · Embestidor, niveles 1 a 4** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 50/55/60/80). Carga que derriba (corrió 3: +3 PdG y daño, Fuerza + 3 contra la Res.CC), Takle (resistido y ganado: −3 No2, empujón
  que chocó, al final del orden), Salto aplastante (elegir dónde caer, el aplastamiento, ¿atacar?, crítico), Aguante con 2 golpes descargado en
  Pegar fuerte (+3 dados), el Derribar 50 % de las dos hachas, el Pergamino grupal de Paso Fantasma. Sin errores; dos cosas para el dueño (el nivel 1
  no llega a la carga de 3 con sus No2; la carrera no carga el Anillo de Paso Fantasma). Detalle en `pruebas-en-el-mapa.md`.
- [x] **🐞 «Podés usar» adentro del cuadro del duelo** (2026-11-09, la captura del Escudo humano de la prueba 5): la columna de Flash (🛡 ✨) se ubicaba
  con el cuadro achicado por la animación (al desplegarse desde su token o al volver de apartarse: Demora, Cambiar de lugar, el gancho) y quedaba ~1 s
  en el medio, sobre «14 contra 3» y el Crítico. **Arreglado** (`comun/flotantes.js`): toma el lugar final del cuadro y espera escondida a que termine
  de desplegarse. Probado con `Duelo.apartar`: siempre afuera, a la derecha. Capturas `cola-06b-*`.

- [x] **Línea T1 · Escudero, niveles 1 a 5** (2026-11-08): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles. Golpe de escudo (2d10 del escudo, Sentado y Demora), Piel de hierro (+4/+4 y +1 a la Res. a crítico), Provocar (falla y funciona, con
  Desafiante), la poción de Cuero duro, el Parry y el Bloqueo por pieza (hacha 1d10 / escudo 1d12), Aguante descargado con Golpe de escudo (+1d10 y
  +1 de cooldown), Devolver gentileza (ganó Parry y Bloqueo → «¿contraatacás?» → contraataque con el hacha), Interponerse con Espinas (devolvió 5),
  Escudo humano (mitad al Escudero, sin Espinas de vuelta) y el Hacha del forjador (tiró su 50 %). Sin errores. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea W1 · Hachero, niveles 1 a 5** (2026-11-08): agregados desde el Pool esencial de GM Tools; los números en el mapa coinciden con
  la prueba de niveles; Pegar fuerte, Romper armadura + el arma (se suman), Golpe demoledor (arranca en cooldown, ×2 + el arma), Barrido, Arte de la
  guerra, Remate (+2 dados) y el pergamino, bien. **Error arreglado:** un Flash marcado no valía con la tirada escrita a mano. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Milagro, versión de clase** (2026-11-08): Larry (J1) con el Milagro del Support: flor de diámetro 5, cura 2d8 y saca el estado malo
  más reciente a los tres aliados de adentro (él incluido), no toca al caído ni al creep de adentro; cobra 2 No2 y 10 SP; la segunda vez avisa «una vez
  por combate» y deja seguir; se libera al terminar el combate. Sin errores. Una sola tirada de 2d8 para todos (a confirmar). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Barrido hecho por una invocación** (2026-11-08): la Abeja Gorda de Bizzante (J2), con un hacha y el Barrido, contra tres creeps:
  se cobró una vez, eligió el primero, orden en el sentido de las agujas del reloj (el aliado al lado no entra), un duelo entero por rival (crítico
  con Rompe armadura, Parry + Bloqueo, esquive). Sin errores. Falta en el editor de habilidades de la invocación una forma de armarle un giro
  (se le copió el Barrido de creep). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Coletazo de una bestia** (2026-11-08): un ataque entero por rival en el sentido de las agujas del reloj, pulso y cuadro desde cada token,
  críticos, Veneno y Empujón al que pega, nada al que esquiva; el empujón contra un token choca una sola vez. Sin errores. Detalle en `pruebas-en-el-mapa.md`.
