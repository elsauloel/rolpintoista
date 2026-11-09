# Cola de pruebas en el mapa

Pedido del dueño (2026-11-08): «Pone esto en la cola de pruebas y a medida que vas haciendo una prueba, me mandas los resultados y vas avanzando
con la programación de la siguiente en la cola.» Mientras el dueño diseña, las pruebas en el mapa no se hacen en el momento: se anotan acá y se
corren **de a una**, en orden, en segundo plano. Al terminar cada una se le pasa el resultado al dueño y se arranca la siguiente.

Reglas de cada prueba (las de siempre, ver `pruebas-en-el-mapa.md`): en «Claude · pruebas» / «Encuentro 2», **nunca «Mapa 1»**; respaldo antes y
restauración después; sin servidores ni navegadores viejos conectados; capturas para el dueño. Si aparece un error, se arregla, se prueba y se sube
(con el commit de siempre) y se anota en el resultado.

Estado: `[ ]` en cola · `[~]` corriendo · `[x]` hecha (con el resultado en una línea).

## En cola

28. [ ] (en espera: hasta que el dueño pegue las reglas de Firestore) **Paso Fantasma guardado en la partida: mismo estado en todas las pantallas, se gasta una sola vez, sobrevive a recargar la página** (2026-11-09; antes, pegar las reglas nuevas de Firestore del campo `pf`).

Cada línea nueva que se termine de diseñar se suma al final.
30. [ ] **Red: se dispara al pisar cualquiera de las 7 casillas** (2026-11-09, dueño: «que el trigger y el efecto sean igual»): la Red de caza (consumible) y la Red tendida (habilidad de creep) ahora son una trampa en flor de 7 casillas que se dispara al pisar cualquiera; ver que se dibuje en las 7, que la Percepción la descubra y que la red caiga sobre todos los que estén encima.
31. [ ] **Trampas de área: se disparan al pisar cualquier casilla de su área** (2026-11-09): Mina del cazador, Polvo cegador, Gas adormecedor, Gas somnífero, Nube de veneno, Petardo trampa, Mina explosiva, Cartucho enterrado, Barril de pólvora, Lluvia de cascotes, Géiser de fuego, Niebla de confusión y Espejo de discordia (flor de 7; disparo y efecto en las mismas casillas; el dibujo y la Percepción en las 7).
32. [ ] **Línea L4 · Hostigador con trampas, niveles 1 a 5.**
33. [ ] **Atacar saca del Sigilo (después de aplicar el bono de atacar desde el sigilo)** (2026-11-09, dueño: «claro, atacar lo saca del sigilo»): un personaje y un creep en sigilo atacan (arma, habilidad de ataque, disparo, hechizo o varita a un rival): el duelo tiene el bono de atacar desde el sigilo y, apenas se declara, el atacante sale del sigilo (aviso en la Mesa, sin Marcado). El robo en sigilo no lo saca. Un giro: solo el primer rival lleva el bono.
34. [ ] **Percepción aumentada: sin punto ciego en la espalda para el sigilo** (2026-11-09): un token en sigilo pegado a la espalda de alguien con la pasiva le da la tirada de detección (la casilla de atrás cuenta como zona de alerta); sin la pasiva, sigue siendo punto ciego. Probar con un personaje, un creep y una invocación.

## Hechas

- [x] **Línea L3 · Asesino de las sombras, niveles 1 a 5** (2026-11-09): números iguales a la prueba de niveles (vida 30/35/35/40/45, PdG 11/13/15/16/17);
  Ojo de asesino (crítico ×3), Bomba de humo (Sigilo con rivales mirando, 3 casillas gratis arrastrando, sin No2), Puñalada por la espalda desde el
  sigilo (Evasión del rival vale 1, +2 PdG y +2 de daño del Puñal: PdG 7 contra 1, 1d4+1d4+8+2 = 15 ×3 = 45), Degollar (arranca en cooldown 4;
  Expuesto), Dash a través de Larry, Paso ligero (+2 por la espalda), Finta sin Parry, Retirada limpia de la Bombacha (cartel 1d2) y el pergamino.
  Sin errores de juego. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Trampas a la vista de un rival al arrastrarlas y botón de visión en sigilo** (2026-11-09): GM (trampa de un creep) y J1 (trampa de su
  personaje): mientras se arrastra se ven los conos de los rivales; al soltar en un cono, Avanzar (queda descubierta, la ven todos, línea en la
  Mesa) o Rechazar (vuelve a su casilla). El botón «👁 Ver campo de visión de los rivales (Ctrl + L)» aparece latiendo con un token propio en
  sigilo (GM: un creep; J1: Rockardo), prende/apaga con clic y con Ctrl + L, y se va al salir del sigilo. **Arreglado:** el botón quedaba encima
  de «Pasar de día» del panel derecho; ahora va debajo de los lentes, dentro del mapa.

- [x] **Finta: +2 PdG y +1 al daño, sin Parry** (2026-11-09): el Goblin con la Finta contra Rockardo (copia): la declaración dice «+2 PdG · +1 de
  daño fijo · no se puede parrear»; los dos Parry de Rockardo (escudo y mazo) apagados («Finta no se deja parrear (sí esquivar)»); el daño
  «1d10 + 11 + 1»; el rango del crítico, 11 (Tipo 10 + 1 de resistencia), sin bonos de la Finta. Sin errores.
- [x] **Paso Fantasma: pasos seguidos aunque sean en varios movimientos** (2026-11-09): 1 casilla y después 2 → +3 listo (Capataz, en las tres
  pantallas); 1, una tirada suya (Fuerza del golpe) y 2 → nada (la tirada corta). **Había un error y está arreglado:** la tirada de Evasión de las
  Acciones y la Botonera se llama «Esquivar (Eva)» y cortaba la cadena (solo se excluía «Evasión»); ahora no corta: 1, «Esquivar» y 2 → +3 listo.
- [x] **Escudos gastados desaparecen al llegar a 0** (2026-11-09): Blindaje (Barrera 12), el Escudo especial de 5 del Escudo humano y la Poción de
  Cuero Duro (15): al vaciarse cada uno, se va de la lista en la pantalla del GM y en la del jugador, y el aviso dice «el escudo absorbió … · se
  gastó …». Sin errores.
- [x] **Paso Fantasma con Carga y Takle (y no con Salto ni Dash)** (2026-11-09): en «Encuentro 2», el Goblin con el anillo: la **Carga**
  corrió 3 → +3 listo en las tres pantallas (GM, J1, J2); el **Takle** corre 2 (su receta): no llega a 3 y no lo carga (las 2 casillas sí se cuentan
  como movidas); con la carrera llevada a 3 en la copia de prueba, sí lo carga. **Salto** de 3 y **Dash** de 3: no lo cargan. Caminar 6 da **+3**,
  no +6 (la Evasión del Goblin salió «1d6+3»). Sin errores en esto.
- [x] **Paso Fantasma: una vez por ronda, 3 pasos seguidos, se vence al empezar su turno** (2026-11-09): con orden de turnos (Larry, Goblin,
  Capataz, Rockardo). **2 + 1 casillas no lo dan**; 3 seguidas sí (Larry, jugador 1, y el Goblin); **una vez por ronda**: después de gastarlo, otro
  movimiento de 3 en la misma ronda no lo vuelve a dar; **se vence**: sin usarlo, al empezar el turno del Goblin en la ronda siguiente quedó en nada.
  **Había un error y está arreglado:** contra una **habilidad que se esquiva con Evasión** (una varita, un hechizo dirigido) el +3 no se sumaba: la
  Evasión de Larry contra la Varita del relámpago salía «1d4+1». Ahora sale «1d4+1+3», la tirada dice «Evasión (+3 Paso fantasma)» y se gasta;
  igual para creeps e invocaciones (`Combatiente.fantasmaEvaHab`, en `habTirar`, `habValor` y la vista «contra» de ficha-duelo, creep-duelo e
  inv-duelo; prueba automática nueva).
- [x] **Inamovible (Botas de estibador)** (2026-11-09): el Capataz con las botas (33 %) recibió una Cornada (Empujón 1). **Había un error:** la chance
  se tiraba en silencio (si salía, una línea en la Crónica; si no, nada). **Arreglado** (commit `0794daa2`): ahora sale el cartel «🦶 Inamovible» con
  el botón «🎲 Tirar 1d6», la tirada en la Mesa y la Crónica, también en Arrastrar, el gancho que atrae y Cambiar de lugar. Probado las dos veces:
  6 en el d6 → «¡NO SE MUEVE!» (se quedó en su casilla); 1 → «LO MUEVEN» (14,21 → 14,20).
- [x] **Salto aplastante sin atacar** (2026-11-09): el Goblin con el Salto aplastante: **arranca disponible** (cooldown 4, cdActual 0, sin
  «arranca en cooldown»); cayó al lado de Rockardo, que tiró Res.CC (1) contra la Fuerza (8) y quedó **Sentado**; «No, solo saltar» → No2
  7 → 2 → **6: pagó 1** (le devolvieron 4) y el cooldown quedó cobrado. Sin errores.
- [x] **Finta sin crítico** (2026-11-09): el Goblin con la Finta contra Rockardo (copia): la declaración dice «+2 de daño fijo · no se puede
  parrear», los dos Parry (escudo y mazo) salen apagados con «Finta no se deja parrear (sí esquivar)», solo Evasión; con PdG 14 contra 3 el
  rango del crítico fue 11 (Tipo 10 + 1 de resistencia), **sin Crítico frecuente ni potente de la Finta**. Sin errores.
- [x] **De paso** (2026-11-09, commit `d82afbdc`): en la Ejecución de un ataque con el arma con «🌀 Giro», el resumen y la declaración ahora lo
  nombran («ataque con tu arma · 🌀 giro: a cada rival que tenés al lado, uno por uno»).

- [x] **Milagro con 3d8** (2026-11-09): Larry (copia), del J1, con el Milagro del Support, sobre él, Bizzante y Rockardo (heridos, con
  Debilitado / Sangrado / Debilitado): **una sola tirada «Cura 3d8: [6, 1, 7] = 14» para los tres** (15 → 29, 12 → 26, 20 → 34) y a cada uno le sacó
  su estado malo; el Goblin (rival) adentro del área, nada; el texto dice «cura 3d8… una sola tirada para todos». Costó 2 No2 y 10 SP. Sin errores.
- [x] **Barrido armado por un jugador para su invocación** (2026-11-09): el J2, en la ficha de Bizzante (copia), ✎ Editar la Abeja Gorda →
  Habilidades → «+ Habilidad» → ✨ Automático → «Giro de aguijón», No2 como un ataque, cooldown 3 → Ejecución: «Ataque con mi arma» → la
  tarjeta de la PdG → tildó **«🌀 Giro (como el Barrido)»** → Crear y Guardar (queda `barrido: true`). En el mapa, la Botonera de la abeja la
  muestra («2 No2 (como un ataque) · CD 3»); al Ejecutar se cobró una vez (4 → 2 No2), brillaron los tres creeps de al lado y no Rockardo (aliado);
  elegido el Capataz, el orden fue **Capataz → Rata → Goblin** (agujas del reloj), con el cuadro desplegado desde cada uno: el Capataz esquivó, la
  Rata atajó con Parry pero perdió el Bloqueo (pasa la mitad: 30 → 27) y al Goblin le pegó con crítico ×2 (85 → 71). Sin errores.

- [x] **Línea H2 · Saltador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 45/50/55/75/80, No2 6/7/7/8/8, PdG 7/8/9/9/10, Daño 9/9/10/11/12, Def 4/7/7/9/9). Salto (elige casilla; atacando, +1 PdG y Crítico
  frecuente +1; **sin atacar, para salir: 6 → 2 → 5 No2, cobró 1** y el cooldown quedó), Pisotón (Flash; Larry eligió Evasión y perdió: 5 directo
  y Pajaritos; Bizzante resistió con Res.CC tras un empate), Aguante (un golpe contado → Pegar fuerte «con el aguante» +2 dados), Dash (atravesó a
  Rockardo, que esquivó, y terminó detrás), Barrido (tres rivales en orden, una tirada por rival, efectos del hacha en cada uno), Coraza de primera
  línea («22 − Defensa 9 − 3 contra el primer golpe = 10») y la Poción de Cuero Duro. Sin errores. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Grebas del carnero: la Embestida** (2026-11-09, con la línea H2): caminando 2 pasos en línea recta hasta Larry, el ataque declaró
  «🐂 embestida: +2 PdG» y la tirada salió «1d10 +2 embestida». **Caminando 2 en línea y después Dash** hasta quedar pegado: 0, sin embestida en
  la declaración; **caminando 2 en línea y después Salto**: 0. Ya funcionaba con la regla del dueño (el Salto y el Dash no dejan ruta); no hubo que tocar código.
- [x] **Línea T2 · Muralla con púas, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la
  prueba de niveles (vida 60/65/70/90/95, Def 5/8/8/8/8, PdG 6/6/8/9/10, PdG.Esp 3/3/4/4/4). Coraza de púas (sobre sí y sobre un aliado; Rockardo le
  pegó 25 y **le volvieron 7**), Escudo humano (crítico de 48 a la Muralla 4: 24 a ella y 24 a la Muralla 5 —5 del escudo—, y **las Espinas de la 5
  no devolvieron nada**), Velo espejado (Lengua de fuego de 8 → **el Espejo devolvió 2**; con la Bola de fuego, en área, **nada**), Provocar (nv3:
  4 + 3; resistido una vez, la otra Bizzante quedó Provocado y la Muralla Desafiante), Blindaje (Barrera 12: un crítico de 44 entró 32), Aguante
  (+2/+2; un golpe contado → el ataque siguiente con +1d8), el Mantelete (Defensa +4 solo contra la varita de granizo, no cuerpo a cuerpo), el
  Bloqueo por pieza (escudo 1d12, hacha 1d8+1), Derribar 25 % del hacha y la Poción de Cuero Duro (escudo de 15 físico). **Dos arreglos:** el
  cartel «Tenés sobrepeso» (y cualquier cartel de la Botonera que pide el duelo) salía sin estilo y con todos los demás carteles sueltos (los
  «carteles sueltos de la ficha» de la prueba 10); y si una habilidad de un creep esperaba su objetivo y se empezaba otra elección (por ejemplo,
  Atacar con un personaje), la primera se perdía sin devolver lo cobrado. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea W2 · Berserker, niveles 1 a 5** (2026-11-09): números iguales a la prueba de niveles (vida 45/50/55/70/75); Golpe desesperado por franja de vida, Furia, Pegar fuerte, Aguante descargado con Pegar fuerte (+3 dados) y con el Barrido (+2d6 solo al primero), Golpe brutal (Guardia baja), Regeneración +3, Espinas de las Pieles erizadas (devolvió 22), las dos espadas del nv5 (PdG 1d10 / 1d10+1, primer ataque de cada una a 3 No2), el Facón y la Poción de Regeneración menor. Sin errores.
- [x] **Línea D1 · Maldito, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 40/45/45/55/55, PdG.Esp 13/15/17/18/21, en modo SP). Maldición de la coraza (Coraza maldita −2/−2, 3 turnos), Aguja siniestra (1d6
  directo, Herida sombría y Punto débil), la Varita del susurro contra Larry del J1 (no se esquiva: Res.Esp; salió el Silencio 25 %), Maldición
  debilitante (1d6 que frena la Defensa especial, Debilitado y Lento), Escalofrío (Res.Mt, 1d4 y −2 PdG), la Varita de la grieta (−2 Defensa), Aguja
  del desamparo (5 SP; Larry quedó Expuesto y su Evasión salió «÷2» sin Parry), la Capa de escamas de pez espejo (**el Espejo devolvió 1** de un
  Escalofrío directo), el Muñeco vudú (Debilitado 1 turno al primer daño especial), Anulación (elige qué sacar: le sacó el Escudo especial y le dejó
  la Bendición) y la Runa de debilidad (la trampa, con el aviso del cono de visión). **Arreglado:** volver a apretar «Ejecutar» con una habilidad
  esperando el objetivo cobraba dos veces y al cancelar devolvía una. También se sacó del mapa el Mazo del juez que había quedado tirado de la
  prueba 9 (Rockardo lo tenía en su ficha). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea S1 · Sanador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 45/50/55/60/65, PdG.Esp 12/13/15/16/18, en modo SP). Sanar (1d6+4; con Manos de curandero +5), Purificar (saca el Veneno y cura 5 + 5),
  Oleada sanadora (una tirada para todos, +2 a cada uno), la Varita de cura (1d10) y la de cura mayor (2d8 + 5), Smite (2d4 directo, Marcado y la Luz
  sanadora +2 al Sanador), Cambio de guardia (el Capataz y el Goblin cambian de lugar al empezar la ronda), Círculo de sanación (+4 + 2 al ponerlo y
  otra vez en la ronda siguiente) y el Pergamino de Regeneración menor (+5 al que lo usa; con Manos, +7). **Arreglado:** los avisos del pergamino
  a los creeps aliados llegaban todos juntos y se veía solo el último; ahora salen en fila. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea M1 · Piromante, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba de
  niveles (vida 40/45/50/55/65, PdG.Esp 14/15/16/18/19, en modo SP). Lengua de fuego (2d6+3 y Quemadura), Muro de fuego (el largo, 4 casillas; al
  cruzarlo, 3d4 directo y Quemadura), Parpadeo (3 casillas, sin oportunidad), Bola de fuego (una tirada para todos; **el Espejo de Rockardo no
  devolvió nada**), la Botella con un diablito (+2; con un 1 en los dados, «¡te quemó!» 2), la Varita del chorro de lava (4 casillas; quien entra, 1d4),
  los Mitones (la varita costó 2 SP en vez de 3), Escudo elemental (el rodillo, el anillo eléctrico y el salto del rayo), Meteoro (la sombra, cae y
  cada uno con su dodge), el Chaleco de kevlar (Defensa 3 + 2 contra armas a distancia) y la Poción de SP menor. **Arreglado:** el Escudo elemental
  no se podía poner sobre sí mismo (el texto lo dice). Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea R1 · Tirador de precisión, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con
  la prueba de niveles (vida 35/40/40/50/55, PdG 11/14/15/16/17). Tiro certero (crítico, ignora la Defensa), Tiro a la cabeza (Apuntando: el disparo
  siguiente +2 PdG con la respiración contenida, se gasta), Vigilancia (Bizzante se movió en la mira → «¿Dispara?» → disparo con +2), Tiro al arma (el
  Mazo de Rockardo voló 2 casillas), Disparo señalador (Presa y Marcado; con la Presa, el siguiente le hizo +2), Ojo crítico (Crítico frecuente 1 en el
  rango), Flecha que atraviesa (segundo objetivo con la misma tirada y **sin Espinas de vuelta**), Botas de mensajero («Evasión (+2 contra
  oportunidad)»), Flecha perforante (se gasta al disparar; la común no). **Tres arreglos:** cerrar el «¿Qué flecha?» de una habilidad no devolvía
  lo cobrado; la Mesa decía «Quedó con Presa, Marcado» aunque el Invulnerable los frenó; el segundo objetivo de la Flecha que atraviesa perdía el
  Ojo crítico. Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea L2 · Envenenador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba
  de niveles (vida 35/40/40/45/50, Evasión 9/9/10/14/15). Estocada (perfora 3, +1, Veneno ×2 de la daga), Hoja envenenada (Veneno ×2 + ×3 = 5),
  Tajo veloz (+2 PdG, +2, Crítico frecuente +1), Golpe a la rodilla (Rengo 2), la Daga de la viuda verde (Veneno ×3 siempre, sin perforar: contra
  Defensa 15 no entra), Hit and run (el cartel «se aleja», 1 casilla gratis y sin oportunidad), Escurridizo, la Chaqueta del corredor (Evasión «con +2
  contra oportunidad», esquivó), Zuecos (Res. tóxico y ácido +1), Ráfaga de cortes con el Anillo del pantano (tres «Veneno ×4 (3 + 1 del
  envenenador)»), el Óleo venenoso (+2 y Veneno ×3, la carga se gasta) y el veneno que se suma entero (2 → 5 → 8; 5 → 10). **Arreglado:** el duelo
  del GM decía «le llegó a su ficha» aunque el personaje estaba Invulnerable (lo pedido en la prueba 7): ahora dice «no entró: está Invulnerable».
  Detalle en `pruebas-en-el-mapa.md`.
- [x] **Línea L1 · Sangrador, niveles 1 a 5** (2026-11-09): agregados desde el Pool esencial; los números en el mapa coinciden con la prueba
  de niveles (vida 30/35/35/40/40). Golpe que sangra (con crítico, Sangrado permanente), Sal en la herida (+2 dados contra uno que sangra), Tajo al
  tendón (cada casilla que se mueve, 1 de vida directo), Ráfaga de cortes (el Sangrado de la Hoz se tiró 3 veces y se acumuló), Corte en la arteria
  (Crítico frecuente +2 y, con el crítico, Sangrado permanente), Ojo crítico y Ojo de carancho (+1 a la PdG contra uno con estado malo), Paso atrás
  (+2 a la Evasión y el paso gratis), Escurridizo (el paso pagando 1 No2), las Botas de mensajero (+2 contra oportunidad y Levitar 2) y el Óleo
  venenoso. Sin errores. Una cosa para el dueño (el aviso del duelo cuando el Invulnerable frena el Sangrado). Detalle en `pruebas-en-el-mapa.md`.
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
