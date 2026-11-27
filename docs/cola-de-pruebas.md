# Cola de pruebas en el mapa

> **Las tres listas (dueño, 2026-11-24):** esta cola es la **lista general de desarrollo**; lo que el dueño tiene que ver en la compu va a
> [`pendientes.md`](pendientes.md) «🖥 Para recordarle al dueño cuando esté en la compu»; los temas de diseño que necesitan tiempo van a
> [`lista-de-diseno.md`](lista-de-diseno.md).

Pedido del dueño (2026-11-08): «Pone esto en la cola de pruebas y a medida que vas haciendo una prueba, me mandas los resultados y vas avanzando
con la programación de la siguiente en la cola.» Mientras el dueño diseña, las pruebas en el mapa no se hacen en el momento: se anotan acá y se
corren **de a una**, en orden, en segundo plano. Al terminar cada una se le pasa el resultado al dueño y se arranca la siguiente.

Reglas de cada prueba (las de siempre, ver `pruebas-en-el-mapa.md`): en «Claude · pruebas» / «Encuentro 2», **nunca «Mapa 1»**; respaldo antes y
restauración después; sin servidores ni navegadores viejos conectados; capturas para el dueño. Si aparece un error, se arregla, se prueba y se sube
(con el commit de siempre) y se anota en el resultado.

Estado: `[ ]` en cola · `[~]` corriendo · `[x]` hecha (con el resultado en una línea).

## 🛠 Cola de programación (de a una por vez; dueño, 2026-11-10)

> **Cómo se avanza (dueño, 2026-11-22):** una tarea por vez y **solo cuando el dueño dice «avanzá»**. Al terminarla se le pasan los
> resultados y se espera; sus comentarios que correspondan se agregan al final de esta cola. Ya no se encadena sola (ver `memoria-claude.md`).

### 📝 Notas de la sesión con los jugadores en «El origen» (dueño, 2026-11-27: «anotalas primeras en la cola… de a una»)

- **⬜ en cola (primero) — 🏹 Mover una flecha silbadora puesta en el mapa** (dueño, 2026-11-27, notas de la sesión): «había una flecha silbadora en un mapa, quise moverla y no encontré cómo, debería poder hacerse con mover libre».
- **⬜ en cola (primero) — ⚡ Un ataque de Rockardo no le bajó los No2** (dueño, 2026-11-27, notas de la sesión): «recién en el origen de las especies un ataque de rockardo no le bajó los nitros». Investigar por qué no cobró los No2 del ataque.
- **⬜ en cola (primero) — 🚩 El Estandarte de guerra no tira resistencia a Shockwave** (dueño, 2026-11-27, notas de la sesión): «el estandarte de guerra no debe tirar resistencia a shockwave» (un estandarte/tótem no es un rival que se resista: que la onda no lo cuente como objetivo).
- **⬜ en cola (primero) — 🔥 El Arma elemental no se va al cambiar el arma** (dueño, 2026-11-27, notas de la sesión): «un pj le tiró arma elemental a una de sus armas, después la cambió y no se le fue el estado». El estado tiene que ir con el arma (o irse al sacarla).
- **⬜ en cola (primero) — 🔥 El Muro de fuego, que se vea mejor** (dueño, 2026-11-27, notas de la sesión): «corregir el muro de fuego para que se vea mejor…» (proponerle al dueño cómo, con captura).
- **⬜ en cola (primero) — 💨 Pedos Tóxicos: no se tienen que disparar al caminar dentro de la nube** (dueño, 2026-11-27, notas de la sesión): «en el origen el pedo tóxico se triggerea cuando caminan dentro de las nubes» y «el pedo tóxico está programado raro… al dar un paso se triggerea y eso no debería pasar. Solamente una tirada al principio del mantenimiento, al principio de la ronda» (ya estaba decidido así el 2026-11-24: una tanda en el Mantenimiento, una sola tirada del dueño).
- **⬜ en cola (primero) — ⚔ Que los duelos no se cierren solos, para poder usar Enyetar** (dueño, 2026-11-27, notas de la sesión): «que los duelos no se cierren solos, para poder usar enyetar» (dar tiempo / un botón para cerrarlo, para que entre un Flash como Enyetar).
- **⬜ en cola (primero) — ⏳ Ponerle un contador de turnos a las formas colocadas a mano** (dueño, 2026-11-27, notas de la sesión): «poder programarle contador a las formas colocadas manualmente» (Terreno y Formas: que se pueda poner o editar cuántos turnos dura, también después de colocarla).
- **⬜ en cola (primero) — 🕊️ Que el GM pueda mandar mensajes privados a los jugadores** (dueño, 2026-11-27, notas de la sesión): «que el gm pueda mandar mensajes privados a los jugadores» (revisar si hoy puede y por qué no anduvo).
- **⬜ en cola (primero) — ❤ La barra de vida del token no coincidía con la de la ficha (vida máxima)** (dueño, 2026-11-27, notas de la sesión): «revisar que la barra de hp del token no estaba sincronizada con el hp de la ficha… pasó algo raro con el hp máximo».
- **⬜ en cola (primero) — ☠ Que al morir se borren los estados alterados** (dueño, 2026-11-27, notas de la sesión): «que cuando mueran se le borren los estados alterados» (hoy se van al volver de la muerte, 2026-11-20; el dueño lo quiere al morir: revisar con él qué queda, como en `quedaAlVolver`).


- **✅ hecho (2026-11-20) — 💰 «Pasar a un aliado» en el menú de DDE y despojos** (dueño, 2026-11-20, con captura: «este menú de DDE y despojos debería tener un
  botón para poder pasarle a un aliado»). La ventanita «💰 DDE y despojos» de la ficha tiene abajo el botón **🤝 Pasar a un aliado**: cierra la ventanita y abre
  la misma ventana de siempre («Pasarle algo a otro personaje», la del 🤝 Pasar de la Mochila; `comun/intercambio.js`, sin tocar): a quién, cuántos DDE, qué
  despojos y cuántos. Las reglas son las que ya había: lo ofrecido queda apartado hasta que el otro acepta, al otro le sale «Te ofrecen algo — Aceptar /
  Rechazar», queda la línea en la Mesa, y en combate esa ventana solo deja pasar ítems (con sus No2). Esa ventanita existe solo en la ficha (el mapa y la
  ficha lite no la tienen; ahí se pasa con el 🤝 de arriba de la Mochila). Probado con clics en «Claude · pruebas 2»: Blanco J1 le pasó 20 DDE y 2 despojos
  normales a Blanco J1 b (50 → 30 y 3 → 1 en uno; 0 → 20 y 0 → 2 en el otro), y todo volvió a 0 al terminar. Aceptó la misma cuenta del Jugador 1 con su otro
  personaje: el Jugador 2 no es parte de esa partida. Pruebas automáticas 893/893. Sin ver: el botón con el mapa en Combate (`docs/pruebas-en-el-mapa.md`).
- **✅ hecho (2026-11-20) — 🏁 Al terminar «Finalizar combate», el mapa vuelve solo a modo narrativo** (dueño, 2026-11-20: «al poner finalizar combate y terminar
  con todo ese proceso, el mapa automáticamente se vuelva a poner en modo narrativo»).
  *Resultado:* cuando el proceso termina de verdad —al apretar «🏁 Despojar lo que nadie tomó y repartir XP y oro» (o «Cerrar botín y repartir…») y
  confirmar, o al publicar cuando no hay ítems— el mapa publicado pasa solo de Combate a Narrativo en todas las pantallas, con la misma escritura que
  usa el interruptor del mapa. Al GM se lo dice el cartelito de abajo: «Botín cerrado ✓ — … · 🌿 El mapa volvió a modo narrativo» (a los jugadores les
  sale el aviso de siempre, «🌿 Modo narrativo: moverse no gasta No2»). Vale igual desde el mapa y desde GM Tools. En «🔮 Simular» no cambia nada, y si
  el mapa ya estaba en narrativo tampoco. Pasar a narrativo no abre ningún cartel ni pregunta nada (los carteles del interruptor son los de pasar a
  combate), así que no se sumó ninguno. El orden de turnos no se toca, igual que con el interruptor (queda preguntado en P252). Probado con clics en
  «Claude · pruebas 2» («Prueba · R4 M4», GM y Jugador 1): desde el mapa y desde GM Tools, con un ítem en el botín y sin ítems; y Simular. Todo quedó
  como estaba (XP, despojos, creeps, sin combate abierto, narrativo). Pruebas automáticas 895/895. Sin ver: `docs/pruebas-en-el-mapa.md`.
- **✅ hecho (2026-11-20) — 👥 Sumar al Jugador 2 a «Claude · pruebas 2»** (dueño, 2026-11-20: «podría sumar al jugador 2 a la partida de pruebas, así tenemos
  en la partida de pruebas todas las opciones posibles»).
  *Resultado:* todo con clics, sin escribir nada por detrás. El Jugador 2 entró con «Unirme como jugador» (no hizo falta que el GM lo acepte). Con el
  asistente «＋ Personaje nuevo» se le creó **«Blanco J2»**, igual a Blanco J1 / Blanco J1 b: nivel 1, sin raza ni clase, Constitución 10 · Fuerza 6 ·
  Agilidad 6 · Destreza 6 · Especial 8 (36 puntos, 3 de más, como ellos), vida 50, SP 24, No2 6, 0 DDE, sin habilidades, pasivas ni talentos, y un
  Cuchillo de cazador equipado (comprado del catálogo: se le cargaron 85 DDE y quedó otra vez en 0). Su token está en «Prueba · R4 M4», en la casilla
  libre justo debajo de Blanco J1 (🎭 → «Traer a Blanco J2 ya»); no se movió nada de lo que había. **Prueba de dos personas:** el Jugador 1 le ofreció
  1 DDE a Blanco J2 desde «💰 DDE y despojos → 🤝 Pasar a un aliado»; al Jugador 2 le saltó «🤝 Te ofrecen algo» en su pantalla, aceptó, y los números
  cambiaron bien en las dos (la Mesa: «Blanco J1 le pasó 1 DDE a Blanco J2»). Después los dos quedaron en 0 DDE, sin ofertas pendientes; el mapa en
  narrativo y sin orden de turnos. No apareció ningún error del programa. Desde ahora, lo de dos personas se prueba con J1 y J2
  (`docs/memoria-claude.md`, «Probar»).
- **✅ hecho (2026-11-20) — 🌿 El aviso «el mapa volvió a modo narrativo», dentro del cartel «🩺 Cómo quedó el grupo»** (dueño, 2026-11-20: «lo del cambio en
  modo narrativo me gusta, pero quiero que lo pongas integrado al mismo mensaje de cómo quedó el grupo, porque el cartelito verde ese pasa bastante
  desapercibido»).
  **Qué quedó**: cuando el fin del combate pasa el mapa a narrativo, el cartel «🩺 Cómo quedó el grupo» del GM abre con una franja verde arriba de
  todo: «🌿 **Terminó el combate**: el mapa volvió a **modo narrativo**» (y abajo, en chico: «Moverse ya no gasta No2. Si hace falta, lo volvés a
  combate con el interruptor de arriba»). Sale solo si ese fin de combate lo cambió de verdad: si el mapa ya estaba en narrativo, o cuando el cartel
  aparece al pasar a combate, no va. **A los jugadores** no se les agregó ningún cartel: su «🎁 Botín concluido» de siempre suma un renglón
  «🌿 Modo narrativo — Terminó el combate: el mapa volvió a modo narrativo (moverse ya no gasta No2)». El cartelito verde de abajo quedó como estaba
  (es lo único que ve el GM si cierra el combate desde GM Tools, donde ese cartel no existe).
  **Probado con clics** en «Claude · pruebas 2» («Prueba · R4 M4», GM y Jugador 1): con botín (1 ítem) y sin ítems, la franja sale en el cartel del GM
  y el renglón en el del jugador; con el mapa ya en narrativo, ninguno de los dos. La partida quedó como estaba (XP, creeps, sin combate abierto,
  narrativo). Pruebas automáticas 896/896. Sin ver: `docs/pruebas-en-el-mapa.md`.
- **✅ hecho (2026-11-20) — 🐞 Desequilibrado (Arrastrar) se muestra como si no tuviera fin** (dueño, 2026-11-20, jugando El origen: «el personaje arrastrado
  apareció con el debuff Desequilibrado, y cuando me fijé cuánto duraba, parecía como que no tenía fin. Sin embargo, cuando pasó el tiempo
  correspondiente, se fue solo… quiero que pases una prueba en el mapa, corrobores esta información, y si es solamente un error de comunicación,
  simplemente corrijas eso»). Leído el código (Claude): es a propósito que se guarde `permanente: true` cuando quien arrastró está en el orden de
  turnos (`desequilibradoPoner`, vtt-hexgrid/js/78-choque-pesado.js): no vence por turnos, lo saca `desequilibradosFinTurno` al terminar el turno de
  quien arrastró. Por eso se ve «sin límite / ∞». Hay que (1) confirmarlo en el mapa (Arrastrar con orden de turnos: aparece, se ve sin fin, y se
  va al terminar el turno de quien arrastró) y (2) arreglar SOLO lo que se muestra: en todos los lugares donde se ve la duración de un estado (token,
  tarjeta, ficha, ficha lite, Botonera, lupa, Tablero, GM Tools) que diga «hasta el fin del turno de <quien arrastró>» en vez de sin límite. Mejor
  con un dato genérico en el estado (p. ej. `hasta: 'el fin del turno de X'`) que otros estados parecidos puedan usar, y revisar si hay otros estados
  que se guardan permanentes pero se sacan solos (decir cuáles en el informe; no cambiarlos sin avisar). No tocar cuándo se va.
  **Y en la misma prueba (dueño, 2026-11-20, El origen):** «Rocardo empezó su turno, el primer turno del combate. Tiró Arrastrar y después cuando
  quiso atacar le aparecía como que ya había atacado una vez, que le costaba 10 nitros. Pero él no había atacado… no me quedó claro si fue el
  arrastre o si había quedado desde la partida anterior… lo observaría». Arma de Tipo 10: 10 No2 = ya figura un ataque con esa arma
  (`S.ataquesArma`, `FichaCombate.registrarAtaque`). Dos sospechas a comprobar con clics: (a) Arrastrar pasa por el duelo tirando PdG y alguna parte
  lo cuenta como ataque con el arma (no debería: «cuesta 2 No2 fijos, no lo de un ataque»); (b) la cuenta de ataques solo se vacía en el
  Mantenimiento de inicio de turno (`comun/ficha-mantenimiento.js`), así que si el combate anterior terminó después de que atacara y en el primer
  turno del combate nuevo no se aplicó ese inicio de turno (o se aplica después de abrir la Botonera), queda la cuenta vieja. Reproducir las dos:
  Arrastrar y después Atacar en el mismo turno; y atacar, cerrar el combate (Finalizar / pasar a narrativo), abrir otro y mirar el costo del
  primer ataque. Arreglar la causa que aparezca (si es la (b): que al empezar un combate —pasar a Combate / tirar iniciativa / Finalizar combate— la
  cuenta de ataques arranque en cero para todos, personajes, invocaciones y creeps). Si no se reproduce ninguna, decirlo tal cual.
  **Hecho (Claude, 2026-11-20), las dos partes:**
  **1 · Desequilibrado.** Confirmado con clics: era solo cómo se mostraba. Con orden de turnos, el arrastrado quedaba con «∞» en el globo de estados
  y «no vence» al pasarle el mouse, y se iba solo cuando quien lo arrastró terminaba su turno. Ahora dice **«hasta el fin del turno de <quien
  arrastró>»** en: el globo de estados del token (GM y jugadores, en un renglón «⏳ Dura hasta…»), el cartelito al pasar el mouse, la ficha lite,
  el Tablero, la ficha (el chip y su 🔍), «Cómo quedó el grupo» («No vencen: Desequilibrado (se va solo: hasta…)»), y por código también en GM
  Tools (chip, «Ver» del estado, Tablero), el registro del combate y las listas de Anular, Disipar y el Anillo del curandero. Cuándo se va no cambió. El dato es
  genérico: cualquier estado «no vence» puede llevar `hasta: '…'` (`Combatiente.hastaTxt` / `hastaPub`; viaja en el spec por
  `EstadosAplicar` y `FichaAcciones.estadoDeSpec` y en los resúmenes públicos). Sin orden de turnos sigue saliendo «1 turno», como antes.
  Otros estados que se guardan «no vence» y se van solos (leído en el código, sin cambiar): Vigilancia y Aguante (al empezar su próximo turno);
  Marcado / Marcando (cuando quien marcó ataca a otro); Mordido / Mordiendo y Agarrado / Agarrando (al soltarse); Sentado (al levantarse);
  Desarmado (al recuperar el arma); Sigilo (cuando lo descubren); Toques de carga, los pergaminos «de todo el combate», la Sangre de dragón y la
  Vida extra del Relicario (al Finalizar combate); Shield, Arrojo, Vida extra, Escudo especial y la Cáscara protectora (al gastarse); Empower,
  Paso atrás, Enfocado, Apuntando, Carga arcana / Golpe anunciado, Arma envenenada y los Óleos (al usarlos); la Bronca; el Estandarte / Tótem y
  las auras de talismán (mientras estén); el Veneno severo y el Sangrado sin turnos (por stacks o cura).
  **2 · El primer ataque que figuraba como segundo.** La sospecha (a) **no se reprodujo**: después de un Arrastrar que engancha, Atacar sigue
  diciendo «5 No2 · 1.º ataque» (Cachiporra, Tipo 10) y Arrastrar no anota ningún ataque. La (b) **sí**: Blanco J1 atacó (pasó a «10 No2»), el GM
  pasó a narrativo, vació el orden, volvió a Combate, Traer tokens y Ordenar con J1 primero → en el primer turno del combate nuevo Atacar seguía
  en «10 No2». La causa: esa cuenta la vacía el inicio del turno de cada uno, y al primero del orden de un combate nuevo nadie le empieza el
  turno. **Arreglo:** al pasar el mapa a Combate, la pantalla del GM pone en cero la cuenta de ataques «de este turno» de los personajes (con sus
  invocaciones) y los creeps con token en ese mapa (`ataquesACeroAlEmpezar`, vtt-hexgrid/js/04; `Combatiente.ataquesACeroPj / Inv / Creep`), junto
  con las demás marcas «una vez por turno» que viven con ella (Parada fácil, el primer golpe, las armas especiales, el Saque rápido, «disparó el
  turno pasado»). No toca No2, vida, SP, estados ni cooldowns. Probado con clics: con el arreglo, el mismo recorrido deja «5 No2 · 1.º ataque»
  (los No2 siguieron en 15); y un creep que atacó (8 No2 el segundo) vuelve a «4 No2» en el combate nuevo, con su estado y sus No2 intactos.
  **Para saber:** al primero del orden de un combate nuevo tampoco se le recargan los No2 ni se le cuentan los estados al empezar (nadie le
  «empieza» ese turno): no se tocó, porque es otra cosa y lo decide el dueño.
  Pruebas automáticas 898/898 (2 nuevas). «Claude · pruebas 2» («Prueba · R4 M4», GM, J1 y J2) quedó como estaba. Sin ver: `docs/pruebas-en-el-mapa.md`.
- **✅ hecho (2026-11-20) — 👥 En la partida de pruebas, un solo personaje por jugador** (dueño, 2026-11-20: «yo dejaría en la partida de pruebas que cada
  jugador tenga asignado un solo personaje para que sea más claro, porque rara vez un jugador va a tener más de un personaje en su control, salvo
  que sea una invocación… para las pruebas me gustaría mantenerlo así»). **Hecho:** en «Claude · pruebas 2» se sacó a «Blanco J1 b» con los
  botones de GM Tools (👥 Personajes → ✕ → «Borrar» → escribir el nombre): se fue su ficha y su token. Quedan **Blanco J1** (Jugador 1) y
  **Blanco J2** (Jugador 2), los dos con token en «Prueba · R4 M4». `docs/memoria-claude.md` ya lo dice así (y que no se le vuelva a dar un
  segundo personaje a un jugador). Lo que nombra a Blanco J1 b en `docs/pruebas-en-el-mapa.md` y más abajo en esta cola son pruebas ya hechas:
  queda como registro.
- **✅ hecho (2026-11-20) — 👁 Revelar a mano lo que está oculto (trampas y demás)** (dueño, 2026-11-20, El origen: «un personaje tiró para detectar una
  trampa, pasó algo raro con las tiradas, el sistema entendió que la trampa no fue detectada, pero en realidad sí fue detectada… y yo como GM no
  tenía una forma de revelar lo que estaba oculto, entonces eso también tendría que existir en las cosas que están ocultas. Tanto para GMs como para
  jugadores, uno tiene que poder hacerles clic y revelarlas»). Primero relevar qué cosas pueden estar ocultas en el mapa (trampas, zonas, tokens
  ocultos / en sigilo / bajo tierra, lo que haya) y qué formas de revelar ya existen para cada una. Después, que **cada cosa oculta tenga, al
  hacerle clic, una opción «👁 Revelar»**: el **GM** con cualquiera (a todos, o —si ya existe la idea de «detectada por tal bando/personaje»—
  eligiendo a quién); el **jugador** con las suyas (las que él puso o controla y por eso ve: su trampa, su token escondido). Interpretación de
  Claude, a confirmar con el dueño (anotar en preguntas-abiertas): un jugador no puede revelar lo que no ve. Que quede línea en la Mesa («👁 El GM
  reveló la trampa…») y, si aplica, la contraria («volver a ocultar») para el GM. De paso, mirar por qué la tirada de detectar pudo dar «no
  detectada» por un malentendido: que el cuadro de detectar ofrezca al GM «Resolver a mano» (detectada / no detectada), como el resto de lo automático.
  **Hecho:** (1) **Clic en una trampa oculta** → en el cartel de la casilla, arriba, «👁 Revelar «nombre»»: el GM con cualquiera que vea; un
  jugador con las suyas. Pasa a verse para todos (es la misma marca de cuando la detectan) y sigue armada. El GM después tiene «🙈 Volver a
  ocultar». Lo «Invisible para jugadores» también tiene su «👁 Revelar a los jugadores» (GM). (2) **Clic en un token** oculto o en sigilo → un «👁»
  entre sus botones: el GM con cualquiera; un jugador con el suyo en sigilo (sale del sigilo, sin tirada y sin quedar Marcado). (3) **La tirada
  de detectar una trampa**: al GM le queda «✋ Resolver a mano» en la tarjeta de la Crónica (3 minutos) y en su propio cartel si tiró él → «👁 La
  detectó» / «🙈 No la detectó». Línea en la Mesa en todos los casos («👁 El GM reveló una trampa: «…»», «🙈 El GM volvió a ocultar una trampa»,
  «✋ El GM resolvió a mano: Fulano detectó una trampa»).
  **Qué puede estar oculto y cómo se revela:** trampa armada → ahora con «👁 Revelar» (antes: solo pisándola, detectándola con Percepción o con una
  luz) · algo «Invisible para jugadores» → «👁 Revelar» (antes: la casilla del ⚙) · token oculto por el GM → «👁» a la vista (antes: el 🙈 dentro del
  ⋯) · token en sigilo → «👁» (antes: «Salir del sigilo» en la Botonera, sacarle el estado, o que lo detecten) · bajo tierra → no se tocó (se ve el
  montículo; sale con su habilidad) · una fila oculta del orden de turnos → su 👁/🙈 de siempre.
  **Por qué pudo quedar «no detectada» por un malentendido** (mirando el código, sin poder saber cuál fue): la tirada que vale es la del cartel
  «tirá Percepción» (una Percepción tirada desde la Botonera no cuenta); la dificultad es de la trampa (6 si no tiene) y hay que igualarla; en combate
  un fallo con esa trampa no deja volver a intentar; y lo decide sola la pantalla de quien tira, sin que el GM pudiera corregir. Eso último es lo
  que se arregló.
  **Ojo:** hay una **regla nueva de Firestore para pegar** (el GM puede apagar «detectada»); mientras tanto «volver a ocultar» anda por un camino
  de respaldo (`docs/pendientes.md`, 🖥). Dudas anotadas en **P254** (un jugador revela solo lo suyo; revelar a mano no marca; el GM no ve las
  trampas de los jugadores). Probado con clics en «Claude · pruebas 2» («Prueba · R4 M4», GM, J1 y J2): `docs/pruebas-en-el-mapa.md`. Pruebas
  automáticas 904/904 (6 nuevas). La partida quedó limpia.
- **✅ hecho (2026-11-20) — 🐀 Un creep en sigilo no puede quedar delatado por la Mesa ni por la Crónica** (dueño, 2026-11-20, El origen: «las
  ratas tiraron su polvareda y quedaron en sigilo. Sin embargo, después realizaron un par de acciones… que aparecían en la Mesa, en la Crónica… no
  puede suceder que la rata haga algo y se revele»; y antes: «la rata, estando detrás de la niebla de guerra, tiró la Polvareda… y eso ya reveló la
  existencia de la rata»; criterio confirmado: «si la rata está bajo la niebla, la polvareda se ve. Solo que no tiene que decir "la rata usó
  Polvareda". Si la rata está a la vista… ahí sí»).
  **Qué pasaba** (reproducido con clics en «El origen · CLON de pruebas», mirando la pantalla de Bizzante y la de Rockardo): la rata en la niebla,
  que nunca habían visto, usaba la Polvareda y a los jugadores les salían cuatro mensajes con su nombre (dos en la Mesa y dos tarjetas en la Crónica:
  «actúa fuera de su turno: Polvareda» y «revienta una bomba de humo»); al empezar el combate, «sus anillos despiertan» de cada rata escondida; en
  sigilo, cada cosa que hacía dejaba «🎭 Rata de la grieta. 2 está realizando una acción incierta»; y en el 📜 Historial de los jugadores, los
  movimientos (con las casillas) y los estados de ratas que estaban en la niebla.
  **El criterio que faltaba:** la Mesa solo escondía las líneas que venían «a nombre de» un creep, y casi ningún anuncio del mapa viene así (lo
  nombran adentro del texto); la Crónica no miraba nada; y el Historial miraba «oculto o en sigilo» pero no la niebla.
  **Qué quedó:** un solo criterio para todo lo que le llega a un jugador (Mesa, Crónica, Avisos): se mira a quién NOMBRA el texto. Si nombra a un
  creep que ese jugador no ve (niebla, sigilo, oculto por el GM, tapado por una nube): no aparece; si ya lo conocen, queda «🎭 Alguien está
  realizando una acción incierta» (sin el nombre; varias seguidas son una sola); y si el texto también habla de un personaje, sale con «Alguien» en
  lugar del escondido («El GM canceló el duelo: Alguien → Bizzante»). El GM sigue viendo todo. Si la rata está a la vista y usa la Polvareda, sale
  con su nombre (el anuncio ahora va antes que la nube). La nube se dibuja como antes. El Historial de los jugadores ahora mira también la niebla.
  **Lo que queda igual, por regla:** atacar saca del sigilo y abre el cuadro del duelo con el nombre; un creep conocido conserva su lugar en el orden
  de turnos; «Pasos a tu espalda» solo de quien no está en sigilo. Dudas y la **propuesta de «percibís algo raro → Percepción»** (sin programar):
  **P255**. Lo que no se llegó a ver en pantalla: `docs/pruebas-en-el-mapa.md`. Pruebas automáticas 913/913 (9 nuevas). El clon quedó limpio.
  Código: `comun/no-visto.js`, `vtt-hexgrid/js/29`, `16`, `57`, `99`, `09`.
- **✅ hecho (2026-11-20) — 🏷 Que los jugadores de prueba se llamen como su cuenta** (dueño, 2026-11-20: «los nombres jugador 1 de prueba, jugador 2 de
  prueba, ¿se pueden cambiar y ponerles el nombre que sea igual al email asociado a esa cuenta?»). En «Claude · pruebas 2» y en «El origen · CLON de
  pruebas», el nombre visible de cada cuenta de jugador de pruebas pasa a ser la parte de su email anterior a la arroba (tomada de la variable de
  entorno, sin imprimirla). Cambiarlo con la interfaz si hay dónde (⚙ Partida / el nombre con que se unió); si no, contarlo. **Esos nombres NO van
  al repo** (ni en docs, ni en commits, ni en nombres de capturas): en la documentación se sigue diciendo «Jugador 1 / Jugador 2». Tarea chica: se
  puede hacer junto con otra. **El GM de pruebas también** (dueño, 2026-11-20: «quiero lo mismo para la cuenta del GM de pruebas»).
  **Resultado:** hecho con la interfaz del sitio, sin tocar datos por detrás: cada jugador de pruebas entró con su cuenta, abrió **«✎ Mis nombres»**
  (arriba, en la página de inicio) y se cambió el nombre en «Claude · pruebas 2» y en «El origen · CLON de pruebas»; se releyó después de recargar y
  quedó guardado en las dos. No se tocaron las otras partidas de esas cuentas. **El GM de pruebas, también** (dueño, después: «quiero lo mismo
  para la cuenta del GM de pruebas»): hecho igual, en las mismas dos partidas (el script del clon no se rompe: comprueba la cuenta y el nombre de
  la partida, no el nombre visible del GM). Lo ya escrito en
  la Mesa y el Historial conserva el nombre viejo. **Ojo con las capturas desde ahora:** en pantalla se ve el nombre nuevo; las capturas quedan
  fuera del repo, y en el repo y los docs se sigue diciendo «Jugador 1 / Jugador 2». Actualizar el clon no los cambia (los miembros no se copian).
- **✅ hecho (2026-11-20) — 👁 Ajustes a «Revelar»: circulito en la trampa, el ojo del token oculto adentro del «⋯», y que «Revelar lo oculto» muestre las
  trampas de los jugadores** (dueño, 2026-11-20, sobre lo hecho en 0dda1bcb, `vtt-hexgrid/js/122-revelar.js`): (1) «para las trampas también debería
  aparecer un botón que se despliegue desde el propio token, al igual que los botones que se despliegan de los tokens de personajes, los circulitos
  de alrededor… un botón de esa misma forma para revelarlas»: al hacer clic en una trampa oculta que uno puede revelar, un **circulito 👁** que sale
  de la trampa (mismo estilo que los botones del token), además del botón del cartel (o en su lugar si queda redundante: contarlo); el GM, también el
  de volver a ocultar. (2) «Para revelar un token oculto por el GM, está bien que el botón del ojito aparezca detrás del menú de los tres puntitos, o
  sea, en el menú secundario»: el 👁 del token **oculto por el GM** vuelve adentro del «⋯» (sacarlo de los botones a la vista); el del token en
  sigilo queda como está. (3) «El GM no ve las trampas que ponen los jugadores [correcto]. Revelar lo oculto, sin embargo, sí debe mostrarlas»: con el
  **👁 «Revelar lo oculto» del menú del ojo** prendido, el GM ve también las trampas de los jugadores (solo mientras está prendido; es su visión, no
  las revela a nadie). (4) Corroborar y decir en el informe: el cartel de Percepción al caminar al lado de una trampa existe SOLO para quien tiene la
  pasiva que permite detectar trampas (dueño: «ese cartel solo debe existir cuando uno tiene la habilidad pasiva que le permite detectar trampas»);
  si le sale a alguien sin la pasiva, es un error a arreglar.
  **Resultado (probado con clics en «Claude · pruebas 2», GM + J1 + J2):** (1) al hacer clic en una trampa que uno puede revelar sale un
  **circulito 👁** arriba a la derecha de la casilla, igual a los botones de un token; el GM lo usó en la suya (los dos jugadores la vieron aparecer
  y salió la línea en la Mesa), el circulito pasó a **🙈** y con él la volvió a ocultar; el Jugador 1 lo tiene en su propia trampa, el Jugador 2
  (compañero, no es suya) no, y nadie lo tiene en una trampa ajena ya revelada. **El botón del cartel queda** (decisión de Claude): hace lo mismo,
  pero dice con palabras qué trampa es, y sirve si hay dos cosas en la misma casilla; si al dueño le sobra, se saca fácil. (2) Con un creep oculto por
  el GM, entre los botones a la vista ya no está el ojo: está adentro del «⋯» (el 🙈 «Oculto: mostrarlo a los jugadores»), y desde ahí se lo mostró;
  el 👁 del token en sigilo sigue a la vista (visto con el Jugador 1). (3) El GM no veía la trampa del Jugador 1; con «👁 Revelar lo oculto»
  prendido la vio (y pudo hacerle clic), sin que quede marcada como descubierta; al apagarlo dejó de verla. (4) **El cartel de Percepción está
  bien:** el Jugador 1, sin la pasiva, caminó a una casilla pegada a una trampa oculta del GM y no le salió nada; al Jugador 2 se le dio
  Percepción aumentada, hizo lo mismo y le salió «A Blanco J2 algo le parece inusual… tirá Percepción» (solo a él: ni el otro jugador ni el GM
  vieron cartel). No hubo nada que arreglar. Sale con Percepción aumentada (la pasiva o el anillo que la da) o con Pisada atenta (los pies que la
  dan, o saber desarmar trampas). Después se le sacó la pasiva. Sin ver: tirar esa Percepción hasta el final (ya probado en la tarea anterior) y la
  Pisada atenta de un creep o una invocación. Sin cambios en las reglas de Firestore. Pruebas automáticas 913/913.
- **✅ hecho (2026-11-20) — ☥ Al resucitar se borran todos los estados temporales, buenos y malos** (dueño, 2026-11-20: «algo que debe pasar cuando un
  personaje muere y resucita, de cualquier forma, ya sea resurrección automática con un Pacto, con un Ankh, con la poción de Fénix, o que lo
  resuciten con un Revive. Al resucitar se le borran todos los estados alterados, los temporales, circunstanciales, los de alguna habilidad o alguna
  poción o algún pergamino. Tanto los buenos como los malos»). En UN solo lugar por donde pasen todas las formas de volver (Pacto, Ankh, Llama /
  poción de Fénix, Revive de un aliado o consumible, revivir del GM): al volver, se sacan los estados puestos por habilidades, pociones, pergaminos,
  zonas, trampas y golpes (buffs y debuffs, con o sin turnos). **NO se sacan**: lo que viene del equipo puesto, de pasivas / talentos / raza, las auras
  mientras su fuente siga, y lo que la propia resurrección pone (el Invulnerable / Titilando del Pacto, etc.). Antes de programar, listar en el
  informe todos los estados posibles en tres columnas (se borra / queda / dudoso) y lo dudoso (Pacto activo sin gastar, Marcado, Veneno severo
  «permanente», Mala sombra, Bronca, estados de invocaciones propias, cooldowns) a preguntas-abiertas, eligiendo mientras tanto lo más fiel a la frase
  del dueño. Aviso al jugador y línea en la Mesa («☥ X volvió: se le fueron N estados»). Vale para personajes, y ver creeps / invocaciones que revivan.
  Probar las cuatro formas en el mapa.
  **Resultado:** al volver de la muerte, del modo que sea, se van todos los estados puestos por habilidades, pociones, pergaminos, zonas, trampas y
  golpes, buenos y malos, tengan turnos o no. Quedan: lo del equipo puesto y los anillos, lo de las pasivas, «Inmune a …», Vuela, la Armadura rota,
  Desarmado, la Bronca de un creep, los Toques de carga, la Llama de Fénix que no se usó y el Titilando que pone la propia resurrección. Caer no saca
  nada: se van al volver. Todas las formas pasan por un solo lugar (`Combatiente.volverLimpio`) y el mapa lo cuenta en otro
  (`resurreccionAnunciar`, vtt-hexgrid/js/123-al-volver.js: **ahí se enganchan las animaciones de resurrección**): cartelito, línea en la Mesa
  («☥ Blanco J1 volvió: se le fueron 2 estados (Bendecido, Veneno)») y el Aviso al centro para el jugador («Volviste: se te fueron los estados»).
  Vale para personajes, creeps (✚ del GM, el Revive, la Llama) e invocaciones (✚ de su token). **Probado con clics en «Claude · pruebas 2»**, siempre
  con Bendecido y Veneno puestos antes de morir: el Pacto, el Ankh del cinturón, la Llama de Fénix (los tres al recibir un golpe de 999), el Revive
  que usó el Jugador 2 sobre el Jugador 1 caído, el ✚ del GM sobre el personaje caído y el ✚ del GM sobre un creep caído. En los seis quedó solo
  «Invulnerable» (el Titilando), con el aviso y la línea. **Sin ver:** «¿Con qué volvés?» con dos formas a la vez (pasa por el mismo lugar; lo
  cubren las pruebas automáticas), un creep con la Llama, una invocación, GM Tools suelto y la ficha suelta. Dudas: P256. Sin cambios en las reglas
  de Firestore. Pruebas automáticas 917/917 (3 nuevas).
- **✅ hecho (2026-11-20) — 🕵 En sigilo: ver SOLO los conos de visión de los rivales (zonas de riesgo y zonas libres)** (dueño, 2026-11-20, jugando con la
  rata en sigilo: «apretaba Control L para ver las superficies de visión de los rivales, pero me mostraba el cono de visión propio de la rata. Quedó
  medio entreverado eso. Cuando uno está en sigilo tiene que haber algún comando, puede ser ese o puede ser otro, que le permita ver exclusivamente
  los conos de visión de los rivales. Es decir, uno tiene que ver claramente cuáles son las zonas de riesgo y cuáles son las zonas liberadas para
  poder caminar sin perder el sigilo»). Relevar qué hace hoy Ctrl+L (y los otros modos de visión del menú del ojo: «👹 Visión de los creeps», etc.)
  para el GM y para un jugador. Después: con un token propio (o seleccionado, para el GM) **en sigilo**, un modo —Ctrl+L mismo o un botón «🕵 Zonas
  de riesgo» en el token / la Botonera— que pinta SOLO lo que ven los RIVALES de ese token (la unión de sus conos / alertas, con la misma cuenta que
  usa la detección de verdad: `celdasVisionDe`, punto ciego, luz, «Ve lo oculto», alcance), en un color de peligro, y deja limpio lo demás; sin su
  propio cono mezclado. Para un JUGADOR en sigilo: solo los rivales que su personaje ve / conoce (no puede delatar creeps ocultos o en la niebla;
  mismo criterio que `comun/no-visto.js`). Que se entienda de un vistazo: rojo = te ven si entrás, sin color = libre. Decir en el informe qué pasa
  con lo que NO es visión pero igual descubre (percepción por cercanía, zonas de alerta, oído) y si se puede pintar distinto. No inventar reglas de
  detección: solo mostrar las que ya existen.
  **Qué quedó:** el modo **«🕵 Zonas de riesgo»** (`vtt-hexgrid/js/124-zonas-riesgo.js` + las cuentas en `comun/zonas-riesgo.js`). Con alguien propio en
  sigilo aparece latiendo arriba a la derecha el botón «🕵 Ver zonas de riesgo (Ctrl + L)»; se prende y se apaga con ese botón, con Ctrl + L o con el 🕵
  del anillo del token. Pinta SOLO lo que miran los rivales de ese token: **rojo** = te descubren al entrar (el cono), **naranja rayado** = cada paso
  pide una tirada de Percepción (la zona de alerta), **sin color** = libre; arriba queda un cartel con la leyenda. Es la misma cuenta que la detección
  de verdad (`zonasSigilo`). El cono propio ya no se mezcla (mientras está prendido no se dibujan los 👓 lentes) y acompaña mientras se arrastra el
  token. Un jugador ve solo las zonas de los rivales que ve (un creep oculto, en sigilo o en la niebla no pinta: el cartel lo aclara).
  **Por qué pasaba:** Ctrl + L prendía los lentes con «ver todas», pero con un token seleccionado los lentes muestran solo las zonas de ESE token: con
  la rata seleccionada, su propio cono. Además, entrar en sigilo ya no prende los lentes solos (el botón nuevo los reemplaza).
  **Probado con clics** en «Claude · pruebas 2» (GM con un creep en sigilo junto a los dos personajes y la abeja; Jugador 1 con su personaje en sigilo
  entre 18 creeps, uno oculto por el GM y después uno en sigilo): a casilla libre sigue escondido; a naranja, salió el pedido de Percepción; a roja, lo
  descubrieron y el camino se cortó ahí. Lo que no es visión y lo que quedó sin probar: `vtt-hexgrid/CLAUDE.md` («🕵 Zonas de riesgo») y
  `docs/pruebas-en-el-mapa.md`.
- **✅ hecho (2026-11-20) — ✨ Animaciones de resurrección (Ankh, Fénix, Revive, Pacto)** (dueño, 2026-11-20: «me encantan tus propuestas de animación»).
  Aprobadas tal cual las propuso Claude; duran 2–3 s, las ven todas las pantallas, el token caído se ve apagado antes de empezar. Dibujadas con el
  mecanismo de animaciones del mapa (formas, brillos, partículas; sin ilustraciones). **☥ Ankh:** aparece un ankh dorado flotando y girando sobre el
  caído → se raja con un destello y se parte → los pedazos se vuelven polvo dorado que baja en espiral y entra al token → el token se enciende de
  dorado y vuelve a su color. **🔥 Fénix:** el token se consume en una llamarada y queda un montoncito de cenizas → sube una silueta de ave de fuego
  con las alas abiertas, se eleva y se deshace en chispas → las chispas caen y el token reaparece con un borde de brasa que se apaga. **💉 Revive:**
  un frasquito viaja desde quien lo usa hasta el caído → se rompe y un líquido brillante llena el token de abajo hacia arriba, como un vaso →
  **al llegar arriba, un latido de dos pulsos que «efectivamente parezca un corazón que late y arranca» (dueño): la forma de un corazón (o el
  token mismo) haciendo «tu-tum», y con el segundo latido termina la animación y el personaje queda de pie.** **😇 Pacto:** un círculo con símbolos se
  dibuja en el piso, trazo por trazo → una columna de luz oscura (violeta / roja) sube desde el círculo → el token se levanta y el círculo se quema
  de afuera hacia adentro como papel; queda titilando (lo de hoy). Mandar un VIDEO de cada una para que el dueño las revise en la compu (anotarlo en
  docs/pendientes.md 🖥). Va después de la tarea «al resucitar se borran los estados» (mismo punto del código).
  **Hecho:** `vtt-hexgrid/js/125-resurreccion-fx.js`. Las cuatro duran ~3 s (Ankh 3,0 · Fénix 3,3 · Revive 2,95 · Pacto 2,95) y las ven todas las
  pantallas (la que revive la publica; a las demás les llega alrededor de 1 s después). El token arranca apagado y con la ✕; el Fénix lo hace
  desaparecer y volver, el Revive lo hace latir (un corazón, tu-tum, con una onda en cada latido) y el Pacto lo levanta. El frasquito del Revive sale
  del token de quien lo usó; con el ✚ del GM, el líquido cae desde arriba. Un creep o una invocación usan la misma. Quien vuelve por otra vía (la vida
  escrita a mano, la ficha, GM Tools) y con «reducir movimiento»: un resplandor corto de ~1 s. Los carteles («Zafaste…», «Volviste…», «vuelve a pie»),
  el toast y la línea de la Mesa de los estados salen DESPUÉS de la animación. **Probado con clics** en «Claude · pruebas 2» (GM + Jugador 1 +
  Jugador 2, mapa «Prueba · R4 M4»): Pacto, Ankh, Fénix, Revive de un aliado, ✚ del GM a un personaje y a un creep, y la vida de un creep puesta a
  mano: una sola animación por pantalla en las tres, y el cartel siempre después. Sin probar: una invocación que revive, el Fénix de un creep, un
  duelo abierto en el momento de volver y un token que esa pantalla no ve. Falta que el dueño mire los videos (`docs/pendientes.md` 🖥).
- **✅ hecho (2026-11-20) — 🏷 Tokens con otro nombre que su ficha: que se corrija solo, y que el GM pueda cambiarlo** (visto al clonar El origen: la ficha se
  llama «Rockardo Pedruscko» y sus tokens «Petro EskanderSon» / «Rockardo Petroshvnick Son»; `tokensSincronizarNombres`,
  vtt-hexgrid/js/09-colocar-y-panel.js, falla en la pantalla del GM por permisos y deja un error en la consola). Dueño, 2026-11-20: «estaría bueno
  que lo solucione la pantalla del jugador y que además el GM tenga permiso para modificarlo». (1) La pantalla del jugador DUEÑO pone al día el nombre
  de sus tokens (en todos los mapas donde tenga permiso) al abrir el mapa o la ficha. (2) En firebase/firestore.rules, permitir al GM cambiar el
  `nombre` de un token de personaje (solo ese campo): **avisar al dueño que hay que pegar las reglas**; mientras no estén pegadas, que la pantalla
  del GM no deje el error (intenta y, si no puede, calla). Probar en el clon (Rockardo → Jugador 2).
  **Qué quedó:** (1) la pantalla del jugador DUEÑO pone al día el nombre de los tokens de sus personajes en TODOS los mapas de la partida: al abrir
  el mapa, al abrir su ficha y cuando le cambia el nombre al personaje (`TokensAuto.nombresPonerAlDia`, comun/tokens-auto.js; las invocaciones
  conservan el suyo). (2) Las reglas dejan al GM cambiar SOLO el `nombre` de un token de personaje: **hay que pegarlas** (anotado en
  docs/pendientes.md 🖥). Mientras tanto la pantalla del GM intenta y calla (ya no deja el error en la consola).
  **Probado en el clon:** Rockardo tenía la ficha «Rockardo Pedruscko» y seis tokens (uno por mapa) con «Petro EskanderSon» o «Rockardo Petroshvnick
  Son». GM con el código nuevo y las reglas sin pegar: no cambió nada y la consola quedó limpia. Jugador 2 abre el mapa: a los pocos segundos los seis
  dicen «Rockardo Pedruscko». Poniéndole a mano un nombre viejo a uno y abriendo la ficha suelta: también lo corrigió. **Sin probar:** el GM
  corrigiéndolo con las reglas ya pegadas (falta pegarlas). Ojo: el nombre guardado en el token casi no se ve en pantalla (el mapa ya dibujaba el de
  la ficha); lo usan los buscadores, los scripts y los respaldos.
- **✅ hecho (2026-11-20) — ▶ Botón «Iniciar combate» en el orden de turnos** (dueño, 2026-11-20, a raíz de lo que se vio con Arrastrar: al primero del orden
  de un combate nuevo nadie le «empieza» el turno; «al empezar un combate todos empiezan con los nitros llenos y el primero en la lista de iniciativa
  es como si fuera su turno. Podríamos hacer que se tira iniciativa y al apretar Ordenar al GM le aparezca un botón ahí en el menú de iniciativa que
  diga Iniciar combate, y ahí se inicia con el primer turno del primero de la lista con sus regeneraciones pertinentes, recarga de nitros, etc.»).
  En el panel «Orden de turnos» del GM, después de Ordenar, un botón destacado **«▶ Iniciar combate»**. Al apretarlo: (1) **todos** los del orden
  (personajes, invocaciones, creeps) quedan con los **No2 llenos** y la cuenta de ataques del turno en cero (esto último ya lo hace el paso a Combate,
  commit 96edd265: no duplicar); (2) al **primero** de la lista se le **empieza el turno** como a cualquiera cuando le toca: su inicio de turno de
  siempre (regeneraciones, estados que cuentan, recarga), por el MISMO camino que usa «Siguiente» (el cartel «Empezá tu turno → Aplicar» del jugador o
  el Mantenimiento del creep), sin lógica nueva; (3) línea en la Mesa / Crónica: «▶ Empieza el combate: turno de X». Mientras no se apriete, que se
  note que el combate no empezó (el botón pulsando; «Siguiente» avisa o lo ofrece). Ver cómo convive con lo que ya hace el paso a Combate (carteles
  «Registro del combate», etc.) y con Prisa / Ordenar. Si el mapa no está en Combate, ofrecer pasarlo. Dudas (¿los estados del primero pierden un
  turno al iniciar?, ¿cooldowns?) → resolver como un inicio de turno normal y anotarlas en preguntas-abiertas.
  **Confirmado por el dueño (2026-11-20):** «al apretarlo le tiene que aparecer el cartelito clásico de "empieza tu turno": se regenera tal cosa,
  pasa tal cosa, aceptar». O sea: al primero del orden le sale EL MISMO cartel de inicio de turno de siempre (con su detalle y su Aceptar/Aplicar),
  en su pantalla si es de un jugador, o al GM si es un creep; no un aviso distinto.
  **Resultado:** en el «Orden de turnos» del GM, al apretar **Ordenar** aparece abajo un botón verde, ancho y que pulsa: **«▶ Iniciar combate»**. Al
  apretarlo: (1) si el mapa está en narrativo, pregunta «⚔ Pasar a Combate e iniciar» / «Iniciar sin cambiar el modo» / Cancelar (pasar a Combate hace
  lo mismo que el interruptor: registro del combate, cuentas de ataques en cero, estado del grupo); (2) todos los del orden —personajes, invocaciones
  y creeps— quedan con los **No2 llenos**; (3) al **primero** de la lista que puede jugar (saltea a los caídos) le empieza el turno por el mismo
  camino que «▶ Siguiente»: a su jugador le sale el cartel de siempre «▶ Empieza tu turno … ✔ Aplicar»; si es un creep, su inicio de turno se aplica
  directo, como siempre; (4) la ronda vuelve a 1 y nadie «ya jugó»; (5) línea en la Mesa y tarjeta en la Crónica: «▶ Empieza el combate: turno de X ·
  todos arrancan con los No2 llenos». El botón desaparece y **no se vuelve a ofrecer en ese combate** (ni reordenando ni sumando tokens con «Traer
  tokens»): vuelve a aparecer en el próximo, después de que el mapa pase a narrativo (o de Limpiar) y de apretar Ordenar otra vez. **«▶ Siguiente»
  sin haber iniciado** avisa: «El combate todavía no se inició» → «▶ Iniciar combate» / «⏭ Pasar el turno sin iniciar» (como antes; no vuelve a
  preguntar) / Cancelar. Un combate que ya venía andando de antes de este botón no lo muestra. Los estados con turnos del primero cuentan como en
  cualquier turno (bajan al terminar su turno, como siempre). **Probado con clics en «Claude · pruebas 2»** (GM + Jugador 1 + Jugador 2, con los No2
  gastados a propósito: 2, 1 y 1): con **Blanco J1 primero** → el botón después de Ordenar, «Siguiente» avisando, la pregunta de pasar a Combate,
  todos con los No2 llenos (6, 6 y 5), el cartel «▶ Empieza tu turno · No2 recargados a 6 · ✔ Aplicar» solo en la pantalla del Jugador 1, la línea de
  la Mesa, «Siguiente» pasando normal al creep y Ordenar a mitad de combate sin volver a ofrecerlo; con **el creep primero** → lo mismo, sin cartel
  para nadie (el del creep se aplica solo) y, con «Siguiente», el cartel de siempre para el Jugador 1. **Sin ver:** una invocación en el orden, un
  caído primero en la lista, «Iniciar sin cambiar el modo» y «Pasar el turno sin iniciar» (cubiertos en parte por las pruebas automáticas). Dudas:
  P257. Sin cambios en las reglas de Firestore (lo escribe el GM). Pruebas automáticas 918/918 (1 nueva).
- **✅ hecho (2026-11-20) — ⏳ Vigilancia y Aguante: que digan «se va al empezar tu próximo turno» en vez de ∞** (dueño, 2026-11-20: «en Vigilancia y Aguante
  estaría bien que en lugar de infinito dijera se van al empezar tu próximo turno. El resto está bien porque se entiende que se van con acciones o
  situaciones específicas»). Con el dato genérico `hasta` que se agregó para Desequilibrado (commit 96edd265): al poner esos dos estados, `hasta:
  'el comienzo de tu próximo turno'` (o «del próximo turno de <nombre>» donde lo lee otro). Solo esos dos. Tarea chica.
  **Resultado:** los dos estados llevan el dato `hasta` en su definición (`comun/estados-presets.js`), así que lo dicen los ponga quien los ponga
  (la habilidad de un creep, la de un personaje o el GM a mano): **«hasta que empiece su próximo turno»** en vez de «∞ / no vence». Se eligió
  «su» y no «tu» porque el mismo texto lo leen el dueño, los compañeros y el GM (y coincide con la descripción de las dos habilidades). No cambia
  cuándo se van. **Probado con clics en «Claude · pruebas 2»:** el GM le puso Aguante a un creep y Vigilancia a otro creep y al personaje del
  Jugador 1 (con «+ Estado»); se leyó bien en el globo de estados del GM y del jugador («⏳ Dura hasta que empiece su próximo turno»), al pasar el
  mouse por el creep desde la pantalla del jugador y en la ficha lite. **Sin ver:** usando la habilidad de verdad (ningún creep ni personaje de
  esa partida las tiene; pasa por el mismo lugar) y que se vayan al empezar el turno (eso no se tocó). Pruebas automáticas 914/914 (1 nueva).
- **✅ hecho (2026-11-20) — 🧬 Partida clon de «El origen de las especies», solo para pruebas** (dueño, 2026-11-20). Quedó creada
  **«El origen · CLON de pruebas»** (con la interfaz del sitio; los dos jugadores entraron con «Unirme como jugador»). GM: la cuenta GM de
  pruebas (es la cuenta de Rol Pintoísta). **Bizzante → Jugador 1, Rockardo → Jugador 2, Larry sin jugador** (a nombre del GM, hasta que el
  dueño sume una tercera cuenta). Sin Aurelius ni la Estrella culona, ni sus tokens.
  · **Se copió** (385 documentos, sin ninguna falla de permisos): los 7 mapas con fondo, niebla, paredes y dibujos, terreno, zonas y trampas;
    43 de los 44 tokens (el que falta es el de la Estrella culona); el mapa publicado; los 40 creeps con lo privado del GM y sus imágenes;
    las tres fichas con todas sus partes e invocaciones; la tienda (borrador y stock) y la tienda guardada; la bitácora; el baúl; lo del GM.
  · **No se copió** (a propósito): tiradas, historial, duelos, áreas, momentos, estados en cola, recompensas, botín, registro del baúl, la
    pausa, el orden de turnos (el clon queda en narrativo) y que el GM tenía «tomado el control» de Bizzante. Cambios obligados por los
    permisos: tokens, dibujos y elementos quedan con fecha de hoy y a nombre del GM de pruebas; la bitácora, firmada por el GM de pruebas
    con el nombre del autor original.
  · **El origen no se tocó**: se leyó con una página con las escrituras apagadas; foto de antes, de después de copiar y de después de las
    pruebas: iguales (24 colecciones, 1843 documentos, mismas huellas).
  · **Para actualizarlo**: `herramientas/clon-de-partida/` (LEEME ahí; qué es y las reglas, en docs/memoria-claude.md). Probado abriendo el
    clon como GM, J1 y J2 (mapa, GM Tools y fichas). De paso: al abrir el mapa como GM la consola dice «No se pudo poner al día el nombre
    del token» (el mapa quiere igualar el nombre de un token de personaje al de su ficha y los permisos no dejan al GM cambiar eso); no
    rompe nada, queda anotado sin arreglar.
- **✅ hecho (2026-11-20) — 💍 Anillo de Puntería Certera: el +2 aparece aunque te hayas movido; y que avise cuando se activa y cuando lo vas a perder**
  (dueño, 2026-11-20, El origen, lo lleva Bizzante: «le aparecía el bono a la probabilidad de golpe independientemente de si se había cumplido la
  condición o no… correr los testeos pertinentes para que funcione bien. Y estaría bueno que cuando se active el bono aparezca algún tipo de cartel
  flotante que diga "Puntería certera", y que una vez que la tenés activada, si te vas a mover, te aparezca una notificación: tenés Puntería certera,
  si te movés la vas a perder. Aceptar, cancelar»). El ítem: `new-anillo-de-punteria-certera` (comun/catalogo.js), stat `pulso` +2, «Pulso quieto:
  si no te moviste ni en esta ronda ni en la anterior, PdG +2». Lo calcula el mapa: `quietoDe` (vtt-hexgrid/js/13-tokens-portal-duelo.js) con
  `seMovioEsteTurno` / `seMovioTurnoAnterior`. (1) Reproducir con clics en la partida de pruebas: equipado, moverse y atacar (no debe sumar);
  moverse la ronda anterior y atacar (no debe sumar); dos rondas quieto (suma +2). Sospechas a mirar: que «no se movió» se recuerde solo en la
  memoria de una pantalla (se pierde al recargar, o la pantalla que abre el duelo no es la que vio el movimiento: jugador / GM / GM con el control),
  que en la primera ronda del combate cuente como «quieto» sin haberlo estado, que no cuenten los movimientos que no son arrastrar el token
  (empujones, Dash, Salto, Parpadeo, portal, que lo mueva el GM), o que el bono se muestre en la lupa / la ficha / el cuadro antes de saber si
  corresponde. Arreglar la causa; mirar que el **Anillo de Foco Arcano** (`foco`, mismo mecanismo, PdG.Esp) quede igual de bien. (2) **Cartel
  flotante** desde el token cuando se cumple la condición y el bono queda activo («🎯 Puntería certera» / «Foco»), visible para su dueño y el GM
  (definir y contar si lo ven todos). (3) **Aviso antes de moverse** con el bono activo, en combate: «Tenés Puntería certera activa (+2 a PdG). Si
  te movés, la perdés. [Moverme igual] [Cancelar]»; Cancelar deja el token donde estaba. Solo al jugador dueño (o al GM si lo mueve él), una vez
  por activación. No inventar reglas: qué cuenta como «moverse» y cualquier duda, a preguntas-abiertas.
  **Resultado (2026-11-20).** *Qué pasaba* (visto con clics en «El origen · CLON de pruebas»): «quién se movió» lo recordaba solo la pantalla
  que había movido al token. Si Bizzante se movía en la pantalla de su jugador y el ataque salía de otra (el GM con 🎮 el control, otra compu u
  otro navegador), esa no sabía nada y sumaba el +2. Además el bono salía ya en la ronda 1 del combate, sin ninguna ronda quieta antes. En la
  misma pantalla, moverse y atacar ya daba bien (sin bono). La lupa y la ficha no muestran el bono: solo el cuadro del duelo.
  *Qué se arregló:* con orden de turnos, cada movimiento se anota en la partida (al lado del orden de turnos), así lo ven todas las pantallas y
  no se pierde al recargar; el bono se activa recién desde la ronda 2; y ahora también cuentan el Dash, el Parpadeo e interponerse (antes solo
  caminar, el Salto, la Carga y el Takle). El Anillo de Foco Arcano usa lo mismo. Sin reglas nuevas de Firestore.
  *Lo nuevo:* el cartel dorado «🎯 Puntería certera» (o «🔮 Foco») que sale del token cuando el bono queda activo (lo ven quien lo maneja y el
  GM), y el aviso antes de caminar con el bono activo: «Tenés Puntería certera activa (+2 a PdG). Si te movés, la perdés.» [Moverme igual]
  [Cancelar] (al GM que lo mueve, «Bizzante tiene…»). Cancelar deja el token donde estaba.
  *Probado con clics* (Jugador 1 y GM): ronda 1 sin bono; moverse y atacar, sin bono en las dos pantallas; la ronda siguiente, sin bono (también
  desde el GM con el control); dos rondas quieto, +2 y el cartel; recargar la página no lo cambia; el aviso con Cancelar y con Moverme igual; el
  aviso al GM; Ctrl+Z devuelve el bono; 🦶 Mover libre no lo saca. 10 pruebas automáticas nuevas. *Sin probar con clics:* el Foco, el Dash y
  demás (nadie los tiene en el clon): `docs/pruebas-en-el-mapa.md`. Lo elegido «mientras tanto» (la ronda 1, qué cuenta como moverse, quién ve
  el cartel): **P258**. Archivos: `comun/quieto.js`, `vtt-hexgrid/js/126-quieto.js`.
- **✅ hecho (2026-11-20) — 🐝 Las abejas de Bizzante aparecen con menos vida que su máximo (~75 %)** (dueño, 2026-11-20, El origen: «al invocar sus abejas,
  aparecían con menos HP que el máximo. Algo así como el 75 %… copialo a la partida de pruebas para hacer el testeo»). (1) Leer a Bizzante de El
  origen en SOLO LECTURA (la página con las escrituras a Firestore bloqueadas de scratchpad/simfin/; nunca abrir ahí el mapa, la ficha ni GM Tools) y
  **usar el Bizzante de la partida clon de El origen** (tarea anterior; ya no hace falta copiarlo a «Claude · pruebas 2»). [Texto viejo:] una copia a nombre del Jugador 1 o del GM; es temporal: al terminar se saca (la partida de pruebas queda con un personaje por jugador), salvo
  que sirva para la tarea del anillo, que también es de Bizzante: avisar. Ningún id ni email al repo. (2) Invocar las abejas con clics y mirar con
  cuánta vida aparecen contra su máximo: en el token, la tarjeta, la ficha de la invocación y la Botonera. Buscar la causa: ¿la vida se fija antes
  de sumar bonos al máximo (equipo, pasivas, nivel de la habilidad, Constitución del invocador)? ¿la plantilla trae una vida vieja y el máximo se
  recalcula después? ¿se copia la vida de la invocación anterior? ¿cambia entre la primera invocación y las siguientes? (3) Arreglar la causa: una
  invocación nueva aparece con la vida llena, salvo que una regla escrita diga otra cosa (si la hay, mostrarla y no tocar). Probar también otra
  invocación distinta para ver si es general.
  **Resultado (2026-11-20).** *Qué pasaba* (visto con clics en «El origen · CLON de pruebas», Jugador 1, en la ficha de Bizzante): el botón
  **«Invocar»** de la tarjeta de cada abeja la despertaba con sus turnos y sus No2, pero **no le tocaba la vida**: volvía con la que le había
  quedado la última vez. Una Abeja Gorda que se fue con 34 de 45 volvía con 34 de 45 (el 75 %); la Abeja Ágil, que había muerto, volvía con 0 de
  20. No es una regla: el «Mareo de invocación» solo le saca el primer turno, no vida, y la otra forma de invocar (una habilidad con «invoca»
  armado) ya la traía llena. La habilidad «Invocar Abeja Mejorada» de Bizzante no tiene eso armado: paga el costo y las abejas se despiertan con
  el botón de la ficha. No tenía que ver con el equipo, las pasivas ni la Constitución.
  *Qué se arregló:* invocar pasa por un solo lugar (`InvCalculo.invocar`, comun/inv-calculo.js), que usan el botón de la ficha y la habilidad
  que invoca: la invocación aparece nueva, con la vida y los No2 llenos, sus turnos completos y los cooldowns de sus habilidades en cero. Los
  estados que tuviera no se tocan.
  *Probado con clics:* la Abeja Ágil (muerta) vuelve con 20 de 20; la Gorda (34 de 45) con 45 de 45, y puesta en el mapa se ve 45/45 en el
  token, en su menú y en la pantalla del GM; la Diestra (otra invocación, bajada a 4) vuelve con 10 de 10. 3 pruebas automáticas nuevas.
  *Para mirar* (no se tocó): la Abeja Diestra tiene máximo 10 con Constitución 4 (por la cuenta de siempre serían 20); el máximo es un número que
  se puede escribir a mano en la tarjeta, así que quedó como está. El clon quedó con las tres abejas dormidas y llenas.
- **✅ hecho (2026-11-20) — 🔥 «Ver detalle» de una zona puesta en el mapa (Muro de fuego y todas las demás)** (dueño, 2026-11-20: «invoqué el Muro de fuego
  y después, cuando quería recordar bien qué hacía, tenía que ir a la ficha del personaje que lo invocó, ir a su lista de skills y ver el detalle. Me
  gustaría que skills como el muro de fuego, al seleccionarlo, arriba, donde aparece el título, a la derecha, aparezca un botoncito que diga "ver
  detalle". Y en ese detalle te diga específicamente el efecto de esa zona: quien ingresa o quien está parado recibe X de daño. Y también en qué
  momento de la ronda o del turno se triggerea ese efecto. Y a quién le pertenece, y si tiene friendly fire o no»). Al seleccionar una zona en el
  mapa (y lo mismo una trampa visible, un tótem / estandarte / objeto puesto por una habilidad, si comparten el cuadro), en la cabecera del cuadro,
  a la derecha del título, un botón **«🔍 Ver detalle»** que abre una tarjeta con, armado desde los DATOS de la zona (no texto escrito a mano):
  · **Qué hace**: daño (fórmula y tipo / elemento), estado que deja (con chance y turnos), cura, lo que sea; y la descripción de la habilidad.
  · **A quién le pega**: al entrar, al estar parado, al salir, al atravesarla; **fuego amigo sí / no** (aliados del dueño, el propio dueño).
  · **Cuándo se dispara**: al entrar; al empezar el turno de quien está adentro; al empezar el turno de quien la creó; cada ronda… lo que diga el dato.
  · **De quién es** y con qué habilidad se puso; **cuánto le queda** (turnos / rondas, o «hasta que…»).
  · Si hay tirada para evitarla (qué tira cada uno).
  **Orden (dueño, 2026-11-20: «siempre primero el detalle de cuánto daño hace y en qué contexto, y después todo lo demás»):** arriba de todo y
  destacado, UNA frase con lo esencial: cuánto daño (o qué efecto), a quién y cuándo (ej. «🔥 2d6 de fuego a quien entra o empieza su turno adentro»).
  Debajo, el resto: fuego amigo, de quién es, cuánto le queda, tirada para evitarla, descripción.
  Lo ven el GM y los jugadores que ven la zona (a un jugador no se le muestra lo que no debería saber: p. ej. el dueño si quien la puso está oculto,
  con el mismo criterio de la tarea del sigilo). Si algún dato no existe en la zona, decir «a mano» en vez de inventarlo.
  **Hecho:** al seleccionar una zona, una trampa a la vista, un terreno en llamas, una nube o un portal, el cartel de arriba a la derecha trae el
  botón «🔍 Ver detalle»; abre una tarjeta con la frase destacada arriba (cuánto daño o qué efecto, a quién y cuándo) y debajo fuego amigo, de quién
  es, con qué se puso, cuánto le queda, cuándo se dispara, tirada para evitarla, estado que deja, qué frena el daño y la descripción. Todo sale de
  los datos de la zona; lo que la zona no guarda dice «a mano». Al jugador no se le nombra a quien la puso si no lo ve, ni se le muestra la
  descripción de la habilidad de un creep. **Probado con clics** («Claude · pruebas 2», GM y Jugador 1): Muro de fuego (la tarjeta decía 3d4 de
  fuego directo y Quemadura al entrar y al pasar de ronda, sin tirada: el jugador entró, «no hay nada que tirar», el GM tiró 3d4, entraron los 5
  y quedó con Quemadura; al pasar de ronda le volvió a saltar), Nube tóxica (Ef.Esp contra Res.Esp en el cuadro del duelo, 2d4 tóxico y Veneno ×3:
  pasó eso) y Bomba de humo; con el creep oculto, al jugador le dijo «No se sabe: quien la puso no está a la vista». En el clon de El origen, la
  Polvareda de la rata (la nube no guarda quién la puso: «a mano»). **Para que lo sepas:** la tarjeta dice «cada vez que se pasa de ronda» porque
  es lo que el mapa hace; el texto del Muro de fuego dice «empieza su turno adentro» (queda anotado en `docs/preguntas-abiertas.md`). Los tótems y
  estandartes son tokens, no comparten ese cartel: no llevan el botón. Sin probar con clics: una trampa, una zona puesta por un personaje (para
  ver su descripción leída de la ficha) y una curación (`docs/pruebas-en-el-mapa.md`). 946 pruebas automáticas en verde (6 nuevas).
- **✅ hecho (2026-11-20) — 🎁 El botín: que se pueda minimizar y que quede clarísimo que cerrarlo no lo pierde** (dueño, 2026-11-20: «un jugador tenía que
  ir a ver algo a su ficha y dijo: tengo miedo de cerrar el botín y después no poder volver a abrirlo. Eso tiene que estar bien comunicado y tiene
  que ser súper claro. El botín se tiene que poder minimizar y, si un jugador aprieta cerrar botín, le tiene que aparecer una notificación: estás
  cerrando el botín, pero lo podés volver a abrir. El botín no desaparece hasta que el máster no ejecuta… comunicáselo en un lenguaje adecuado,
  simple y amigable»). En la ventana del botín del jugador (mapa y ficha, la misma pieza): (1) un botón **«— Minimizar»** bien visible: la ventana
  se achica a una pastilla fija («🎁 Botín abierto · tocá para volver») que no tapa nada y la reabre con un clic; (2) al tocar **Cerrar / ✕ / afuera**,
  un cartel amable, del estilo: «Tranqui: el botín no se pierde. Sigue abierto para todos hasta que el GM lo cierre. Lo volvés a abrir cuando quieras
  con el botón 🎁 de <dónde esté>» con [Entendido, cerrar] y [Mejor minimizar]; que no canse (p. ej. «No mostrar de nuevo» o solo la primera vez por
  combate); (3) una línea fija dentro de la ventana que diga lo mismo en corto («Podés cerrar o minimizar esta ventana: el botín sigue acá hasta que
  el GM lo cierre»); (4) que el botón para reabrirlo se note mientras haya botín abierto (pulso / color). Textos en rioplatense, simples, sin jerga.
  Verificar de paso que de verdad se puede reabrir siempre (también recargando la página) mientras el GM no lo cerró.
  **Textos aprobados por el dueño (2026-11-20):** cartel al cerrar: «**Tranqui: el botín no se pierde.** Sigue abierto para todos hasta que el GM lo
  cierre. Lo volvés a abrir cuando quieras con el botón 🎁.» [Entendido, cerrar] · [Mejor minimizar]; sale la primera vez en cada combate.
  **Hecho** (mapa y ficha, la misma pieza): (1) botón «— Minimizar» en la cabecera de la ventana → queda una pastilla abajo al centro, «🎁 Botín
  abierto · tocá para volver», que la reabre con un clic; (2) al tocar Cerrar, Esc o afuera, el cartel con el texto aprobado y [Entendido, cerrar]
  · [Mejor minimizar], la primera vez en cada combate (después cierra directo); (3) arriba de todo en la ventana, en verde: «Podés cerrar o
  minimizar esta ventana: el botín sigue acá hasta que el GM lo cierre»; (4) el 🎁 ya latía con el botín publicado: ahora dice «🎁 Botín abierto ·
  tocá para verlo», y en la ficha el botón 🎁 Despojos también late. **Probado con clics** («Claude · pruebas 2», GM y Jugador 1, con un botín de
  verdad publicado): todo lo anterior en el mapa y en la ficha; **se puede reabrir siempre** mientras el GM no lo cerró: con el 🎁, con la
  pastilla, y también recargando la página (minimizado: la pastilla vuelve sola; cerrado: el 🎁 sigue latiendo y abre). Cuando el GM despoja, la
  pastilla se va y el 🎁 se apaga. La XP que repartió la prueba se repuso (la partida quedó como estaba). **La ventana del GM («🎁 Despojos»)** no
  se tocó: ya se cierra y se reabre con su 🎁; un «Minimizar» ahí sería solo por comodidad (propuesta, sin hacer). Sin probar: con el Jugador 2 a
  la vez y en medio de una disputa de piedra, papel o tijera. 950 pruebas automáticas en verde (4 nuevas).
- **✅ hecho (2026-11-20) — 🎭 Que sea claro cómo poner tu personaje en el mapa** (dueño, 2026-11-20, sobre la observación de un ayudante: «lo del botón de
  personajes y el botón de tokens es poco claro… vamos con tu sugerencia, hacer las 2 y 3 juntas»). (2) En la lista de **👥 Personajes** del mapa, al
  lado de cada personaje PROPIO que no tiene token en el mapa que se está viendo, un botón **«🎭 Ponerlo en el mapa»** que hace lo mismo que el 🎭
  («Traer a <personaje> ya» / el asistente de token nuevo, lo que ya exista). (3) Si un jugador entra al mapa y su personaje no tiene token en ese
  mapa, un cartel: «<Personaje> todavía no está en este mapa. [🎭 Ponerlo ahora] [Ahora no]»; sale solo cuando falta el token, una vez por entrada
  (no insistir si dijo «Ahora no»), y no le sale al GM. Con más de un personaje propio, que deje elegir. Respetar lo que ya limite al jugador para
  poner tokens (si hay mapas donde no puede, no ofrecerlo).
  **Qué quedó**: (2) en **👥 Personajes**, al lado de tu personaje sin token en el mapa que estás viendo, el botón «🎭 Ponerlo en el mapa»; (3) al
  entrar a un mapa donde tu personaje no tiene token, el cartel «Blanco J2 todavía no está en este mapa. [🎭 Ponerlo ahora] [Ahora no]». Los dos
  hacen lo mismo que el 🎭 → «Traer a … ya» (un solo camino por dentro): elegís la casilla con un clic y hacia dónde mira. El cartel se fija una
  sola vez al entrar: con «Ahora no» no vuelve hasta que recargues (y te recuerda dónde está el botón); si el GM te saca el token con el mapa
  abierto no aparece de la nada; al GM no le sale nunca. Con más de un personaje propio muestra un botón por cada uno. Hoy un jugador puede poner
  su token en cualquier mapa que esté viendo (no hay mapas vedados), así que no hubo nada que esconder.
  **Probado con clics** («Claude · pruebas 2», mapa «Prueba · R4 M4», GM y Jugador 2, sacándole el token a Blanco J2): el cartel al entrar; «Ahora
  no» (se va y no vuelve aunque cambien cosas en el mapa); el botón de la lista → casilla → orientación → token puesto, y el botón desaparece de la
  lista; «Ponerlo ahora» del cartel → token puesto; entrar con el token ya puesto (sin cartel); el GM (sin cartel); el 🎭 de siempre sigue andando.
  El token de Blanco J2 quedó como estaba. **Sin probar**: un jugador con dos personajes propios (las partidas de prueba tienen uno por jugador,
  a pedido; lo cubren las pruebas automáticas y queda anotado en `pruebas-en-el-mapa.md`). 954 pruebas automáticas en verde (4 nuevas).
- **✅ hecho (2026-11-20) — 🏹 El recuadro del carcaj: arriba qué carcaj tenés, abajo «Proyectiles especiales»** (dueño, 2026-11-20, aclarando el pedido
  anterior: «te lo pedí porque lo estaba entendiendo mal… Que aparezca un recuadro donde diga Carcaj y una descripción de qué carcaj tenés equipado
  con sus características y cuántos slots tiene ocupados, y dentro de ese mismo recuadro abajo que diga Proyectiles especiales, que valga tanto para
  virotes como para flechas, y ahí el listado de proyectiles especiales que están dentro del carcaj. Al equiparse una ballesta o un arco,
  automáticamente te aparece el carcaj en el equipo, el básico, con la descripción "carcaj elemental", y desde la mochila puede equiparse un carcaj
  mejor y ahí cambia la descripción con sus características»). Sobre el recuadro único que ya quedó (commit b31433a8, `comun/ficha-equipo.js`):
  · **Arriba, el carcaj equipado, como una pieza**: su nombre, su descripción y características (capacidad, peso, lo que dé) y «N / capacidad».
    Con arco o ballesta y sin otro carcaj: el **«Carcaj básico»** que viene incluido (nombre confirmado por el dueño, 2026-11-20: «es el carcaj básico»),
    con su texto: 5 lugares, no pesa ni ocupa lugar, viene con el arco o la ballesta). Con uno mejor equipado desde la mochila
    (Carcaj de cuero…), esa fila pasa a ser la de ese carcaj, con Ver / Editar / Sacar.
  · **Abajo, el subtítulo «Proyectiles especiales»** (no «flechas y virotes»): lo que hay ADENTRO del carcaj, con sus botones «→ Mochila» y su costo;
    y, aparte y bien distinguido, los que están en la mochila para cargar («→ Carcaj», «Cargar todo lo que entre»).
  · Se mantiene lo ya hecho: un solo recuadro y el costo en No2 en cada botón.
  **Qué quedó**: un solo recuadro «🏹 Carcaj» con el «N / capacidad» arriba a la derecha, en dos partes. **Arriba**, el carcaj que tenés: con arco
  o ballesta y sin otro, «Carcaj básico · 5 lugares · no pesa ni ocupa lugar · Viene con tu arco o tu ballesta. Para llevar más, equipá un carcaj
  mejor desde la mochila · N / 5 ocupados»; con el Carcaj de cuero equipado, su fila con Ver / Editar / Sacar, su descripción y «10 lugares ·
  N / 10 ocupados» (si el arma suma lugares, lo dice: «8 lugares (5 del carcaj + 3 de tu arma)»). **Abajo**, «✨ Proyectiles especiales»: «🏹 Adentro
  del carcaj» con «→ Mochila» y «Vaciar a la mochila», y separado por una línea punteada «🎒 En la mochila, para cargar» con «→ Carcaj» y «Cargar
  todo lo que entre»; cada botón con su costo. Todo lo que decía «carcaj incluido» ahora dice «Carcaj básico» (avisos, el «¿Qué flecha?» del mapa
  y el detalle del Carcaj de cuero).
  **Probado con clics** (ficha de Blanco J1 en «Claude · pruebas 2», con un Arco corto, flechas de fuego, virotes perforantes y un Carcaj de cuero
  prestados): sin arco («Sin carcaj…»), al equipar el arco aparece solo el Carcaj básico 0 / 5, «→ Carcaj», «→ Mochila», «Cargar todo lo que
  entre» (5 / 5 y avisa las que no entran), equipar el Carcaj de cuero (la fila cambia, pasan las 5 solas, 5 / 10), cargar el resto (7 / 10), Ver,
  y Sacar (vuelve el básico). Blanco J1 quedó exactamente como estaba. **Sin probar con clics en esta pasada**: el mismo recuadro adentro del mapa
  (🛡 Equipo), los precios en combate y el cartel «¿Qué flecha?» con el nombre nuevo (usan la misma pieza y estaban probados antes del cambio de
  textos; anotado en `pruebas-en-el-mapa.md`). 955 pruebas automáticas en verde (1 nueva, 2 ajustadas).
  **Para que lo sepas**: al sacar un carcaj mejor con proyectiles adentro, esos proyectiles se quedan guardados adentro de ese carcaj en la mochila
  (ya era así): no pasan solos al básico.
- **✅ hecho (2026-11-20) — ⚔ Cinco maestrías nuevas: punzantes (Tipo 4 melee), cortantes (Tipo 6), hachas (Tipo 8), arcos y ballestas** (dueño, 2026-11-20, conversación de
  diseño; mismo molde que «Maestría en armas pesadas», `comun/pasivas.js`; valen para jugadores y para creeps). Cierra P248.
  · **Maestría en armas punzantes** (1 Job): con un arma de **Tipo 4 cuerpo a cuerpo** (NO las de rango / proyectiles: «vamos a hacer una distinción
    en las armas punzantes melee y las de rango… esta sería para tipo 4 melee»), **+1 al daño** y **+2 al PdG en ataque de oportunidad**.
  · **Maestría en armas cortantes** (1 Job): con un arma de **Tipo 6**, **+1 al Parry**, **+1 al Bloqueo** y **+1 al PdG en contraataque**.
  · **Maestría en hachas** (Tipo 8; dueño: «tipo 8 son hachas. Su casa es romper armadura»): el **segundo ataque del turno (y los siguientes) con
    un arma de Tipo 8 cuesta 2 No2 menos** (6 en vez de 8). Job: **1** (dueño, 2026-11-20: «cuesta un punto de Job, como el resto»).
  Cada bono vale SOLO con un arma de ese Tipo (como `pdgt10`/`parryt10`): se tiene que ver en la 🔍 de la tirada y en el costo del botón Atacar.
  · **Maestría en arcos** (1 Job; dueño, 2026-11-20: «para arcos le daría +1 la probabilidad de golpe y +2 al crítico potente»): con un **arco**,
    **+1 a PdG** y **+2 al Crítico potente** (`critpot`). (Descartado por el dueño: +1 Rango, «ya tienen un rango zarpado»; +1 PdG solo en el primer
    tiro, «objetivamente peor que la pasiva que da +1 PdG siempre».)
  · **Maestría en ballestas** (1 Job; dueño: «+1 a la probabilidad de golpe y +1 a Perfora, me parece bien»): con una **ballesta**, **+1 a PdG** y
    **Perfora +1** (sumado al Perfora que ya traiga el arma, con la regla de Perfora que ya existe: no inventar otra). (Descartado: Recarga −1 No2,
    «demasiado poderoso».)
  Arco / ballesta se distinguen como ya lo hace el código (el carcaj incluido, las flechas / virotes), no por el Tipo.
  **Ajustes del dueño (2026-11-20, pisan lo de arriba):** «en la maestría en hachas también le daría +1 al bloqueo, siempre. Para las punzantes también
  le pondría un +1 adicional en golpe por la espalda. Y +1 solamente en probabilidad de golpe de oportunidad».
  · **Punzantes** queda: **+1 al daño**, **+1 a PdG en ataque de oportunidad** (ya no +2) y **+1 a PdG al pegar por la espalda** (con la regla de
    «por la espalda» que ya use el mapa; si no hay un stat para eso, crearlo como se hizo con `pdgt10`).
  · **Hachas** queda: el segundo ataque del turno y los siguientes cuestan 2 No2 menos, **y +1 al Bloqueo** (con el hacha en la mano; «siempre» =
    no depende de qué ataque sea: interpretación de Claude, a confirmar).
  **Cómo quedó (2026-11-20):** las cinco están en el catálogo de pasivas (1 Job cada una, jugadores y creeps). **Punzantes** (arma de Tipo 4 cuerpo a
  cuerpo): +1 al daño, +1 PdG en ataque de oportunidad, +1 PdG por la espalda. **Cortantes** (arma de mano de Tipo 6): +1 Parry y +1 Bloqueo al parar
  y bloquear con ella, +1 PdG en contraataque. **Hachas** (Tipo 8 cuerpo a cuerpo): desde el segundo ataque del turno con el hacha, 2 No2 menos (6 en
  vez de 8), y +1 Bloqueo al bloquear con el hacha. **Arcos**: +1 PdG y +2 Crítico potente. **Ballestas**: +1 PdG y Perfora +1 (sumada a la del arma y
  el virote). Con otra arma no suman nada. Se ve en la 🔍 de Atacar (renglón propio «Maestría con esta arma»), de Daño, de Parry y de Bloqueo, en el
  botón Atacar (el costo ya rebajado) y en el cuadro del duelo («⚔ Maestría en …: +1 PdG, …»).
  **Probado con clics** en «Claude · pruebas 2» (Jugador 1 con cada pasiva y el arma del catálogo, y con el arma equivocada): la daga por la espalda
  («+2 PdG (1 por la Maestría)», daño 1d4+7 en vez de +6), el ataque de oportunidad con la daga (1d6+1), la espada parando y bloqueando (1d6+1 y
  1d8+1) y contraatacando (1d6+1), el hacha (4 No2 el primero, 6 el segundo; con un bastón de Tipo 10, 5 y 10), el arco (1d6+1 y la tabla del crítico
  con «Crítico potente 2») y la ballesta (1d6+1, «perfora 2» con una de Perfora 1); un creep con hacha (4 y 6 No2). Con el arma equivocada, nada.
  **Sin probar con clics:** una invocación con una maestría; el daño de la Perfora de más aplicado hasta el final; una habilidad «con tu arma».
  **Decidido por Claude mientras tanto (P260):** el Bloqueo de cortantes y de hachas vale al bloquear CON esa arma (no con un escudo teniendo el arma
  en la otra mano); «ballesta» = el arma de rango con Recarga (entran los arcabuces); una ballesta de Tipo 6 no es un arma cortante; las armas
  naturales (garras, colmillos) no cuentan para ninguna maestría. 956 pruebas automáticas en verde (1 nueva).
- **✅ hecho (2026-11-20) — 🛡 Pasiva nueva «Aguante de trinchera»** (dueño, 2026-11-20: «un skill pasiva por 2 puntos de Job que te dé +1 la
  defensa y +1 la defensa especial por cada enemigo adyacente. Busquémosle un nombre y publiquémosla»). 2 Job; **+1 Defensa y +1 Defensa especial por
  cada enemigo pegado** al que la tiene. Es el espejo de «Táctica de enjambre» (`comun/pasivas.js`, stat `enjambre`, `Combatiente.aliadosPegados`):
  misma forma de contar (del lado del mapa, al abrirse el duelo / al recibir el daño), pero contando rivales. Para jugadores y creeps. Se tiene que
  ver en el cuadro del duelo y en la 🔍. Mismas dudas que P249 (¿tope?, ¿cuentan tótems y objetos inertes?, ¿rivales escondidos?): resolver igual que
  en el enjambre y anotar lo provisorio en preguntas-abiertas. Nombre elegido por el dueño (2026-11-20): «Aguante de trinchera».
  **Cómo quedó (2026-11-20):** está en el catálogo de pasivas (2 Job, jugadores y creeps; también las invocaciones). Cuando le llega un golpe, el
  mapa cuenta los enemigos que tiene pegados y le suma +1 por cada uno a la Defensa (o a la Defensa especial, si el daño es especial). Se ve en el
  cuadro del duelo («🛡 Aguante de trinchera +2: 2 enemigos pegados — Fulano suma eso a su Defensa y a su Defensa especial»), en la cuenta del daño
  renglón por renglón, en la 🔍 de Defensa y de Defensa especial («En el mapa, ahora») y en la cabecera de la Botonera (Def y Def.Esp de ese momento).
  **Probado con clics** en «Claude · pruebas 2» (Jugador 1 con la pasiva): con 0, 1 y 2 enemigos pegados la cabecera pasó de «Def 1 · Def.Esp 0» a
  «2 · 1» y «3 · 2»; un golpe del creep con dos pegados: 10 − Defensa 1 − Aguante 2 = 7 (y se aplicó: vida 50 → 43); con uno, 8 − 1 − 1 = 6; un
  hechizo (Andanada arcana) con dos pegados: 7 − 2 a la Defensa especial = 5; y un creep con la pasiva golpeado por el jugador: 10 − 5 − 1 = 4.
  **Sin probar con clics:** una invocación con la pasiva; un crítico (ignora la Defensa: no tendría que sumar); el daño de una trampa o una zona.
  **Decidido por Claude mientras tanto (P261):** sin tope; cuentan los enemigos que se ven y están en pie (ni escondidos, ni bajo tierra, ni caídos,
  ni tótems o estandartes): la misma cuenta que ya usa el Estoicismo para «enemigo pegado», y no la del enjambre, que sí cuenta escondidos y tótems.
  957 pruebas automáticas en verde (1 nueva).
- **✅ hecho (2026-11-21) — 🎁 El GM le da un ítem (o DDE, o despojos) a un jugador, fácil, desde el mapa y desde GM Tools** (dueño, 2026-11-20: «me gustaría
  que el GM pueda darle un ítem del catálogo muy fácilmente a un jugador… tanto desde el mapa como desde GM Tools»; y «que sea directo a la mochila,
  pero que sí le aparezca una notificación, que uno ponga aceptar, que no aparezca simplemente en la Mesa, porque eso pasa un poco desapercibido.
  También doblones del espacio, despojos y ítems custom, ítems que uno puede crear en el momento»). UNA sola ventana común «🎁 Dar a un jugador»:
  · **A quién**: los personajes de la partida, uno o varios (si se entró desde un token, ya marcado).
  · **Qué**: ítem del catálogo (el buscador que ya usan las tiendas, con Ver; incluye lo subido por el grupo) y cuántos; **DDE**; **despojos**
    (normales, mágicos, especiales); o un **ítem custom creado en el momento** con el asistente de ítems que ya existe (`comun/asistente-item.js`).
  · **Puertas**: en el mapa, «🎁 Dar un ítem» en el menú «⋯» del token de un personaje; en GM Tools, un 🎁 en cada fila de 👥 Personajes y un
    «🎁 Dar a un jugador» en el Ver de un ítem del catálogo.
  · **Cómo llega**: entra **directo** a la mochila (o al DDE / despojos), sin poder rechazarlo, y al jugador le salta un **cartel al centro** «🎁 El GM
    te dio: …» con un botón **Aceptar** que solo lo cierra (es un «enterado»). Además queda la línea en la Mesa. Si no entra por ranuras o peso, se da
    igual y avisa (ADN: avisar, no bloquear). Tiene que funcionar con el jugador desconectado (lo recibe y ve el cartel al entrar) y aplicarse desde el
    mapa o desde la ficha (como `comun/recibidos.js`). Reglas de Firebase: si hace falta una colección nueva, avisar que hay que pegarlas.
  · Sin definir (anotar como pregunta): ¿una casilla «en secreto» para que la línea de la Mesa no la vean los demás?
  **Cómo quedó (2026-11-21):** una sola ventana «🎁 Dar a un jugador» (`comun/dar-jugador.js`), la misma en el mapa y en GM Tools. Arriba, **a quién**
  (los personajes de la partida con casillas y «Todos»); en el medio, **qué**, en cuatro pestañas: 📦 Ítem del catálogo (el buscador y los filtros
  de las tiendas, con «Ver» y «+ Agregar»; incluye lo subido por el grupo), 💰 DDE, 🦴 Despojos (normales, mágicos y especiales con nombre) y ✎ Ítem
  nuevo (el asistente de ítems de siempre); abajo, **«Lo que vas a dar»** con la cantidad de cada ítem (− / número / +) y el botón «🎁 Dar».
  **Puertas:** en el mapa, 🎁 en el «⋯» del token de un personaje (ya viene marcado); en GM Tools, 🎁 en cada fila de 👥 Personajes y «🎁 Dar a un
  jugador» en el Ver de un ítem del catálogo (ya viene en la lista). **Cómo llega:** por el mismo camino que las recompensas del fin del combate
  (**sin reglas nuevas de Firebase**): entra directo a la mochila / DDE / despojos, una sola vez, lo aplique el mapa o la ficha, y al jugador le salta
  el cartel al centro «🎁 El GM te dio algo» con «✔ Aceptar» (solo lo cierra). Queda la línea en la Mesa. Si la mochila queda pasada de ranuras se da
  igual: lo avisa el cartel y una línea en la Mesa.
  **Probado con clics** («Claude · pruebas 2», mapa «Prueba · R4 M4», GM + Jugador 1 + Jugador 2): desde el token (Misericordia ×1 a Blanco J1,
  conectado: cartel al instante, la Mesa y la mochila); a los dos a la vez (Yelmo de hierro ×3 + 25 DDE + 4 despojos + 2 mágicos + 2 «Escama de
  dragón»), con el Jugador 1 con el mapa y la ficha abiertos a la vez (entró una sola vez: lo tomó el mapa, la ficha quedó igual) y el Jugador 2
  desconectado (al entrar a su **ficha suelta** vio el cartel y tenía todo); desde la fila de Personajes de GM Tools, un **ítem nuevo** («Anillo de
  prueba del GM») al Jugador 2 desconectado (al entrar al **mapa** vio el cartel); desde el Ver de un ítem de GM Tools, Facón de paisano ×25 a Blanco
  J1 (**mochila pasada**, 29 de 20: lo recibió igual, con el aviso rojo en el cartel y la línea en la Mesa). Los dos personajes quedaron como estaban.
  **Sin probar con clics:** con el GM teniendo 🎮 el control del personaje; un consumible ×N que se apila (sí en las automáticas); dos regalos seguidos
  sin aceptar el primero; un personaje del propio GM (anotado en `docs/pruebas-en-el-mapa.md`). 963 pruebas automáticas en verde (5 nuevas).
  **Para que lo sepas:** la casilla «en secreto» no se programó (P262, con otras cinco cosas chicas que elegí «mientras tanto»). El «✎ Ítem nuevo»
  no arma consumibles. De paso: en el Ver de un ítem del ⚔ Catálogo de GM Tools el botón «🗑 Solicitar eliminar» no aparece (los ítems llegan ahí sin
  su id; ya pasaba antes): no lo toqué.
- **✅ hecho (2026-11-20) — 💨 Prisa pasa a ser +5 a la tirada de iniciativa** (dueño, 2026-11-20: «cambiar la habilidad Prisa para que en lugar de que te
  mande siempre primero a la lista de iniciativas, te dé +5 a la tirada de iniciativa. En El origen de las especies, el personaje Rocardo la tiene,
  así que habría que cambiársela a él también»). La pasiva `prisa` de `comun/pasivas.js` deja de poner primero en el orden de turnos y da **+5 a
  Iniciativa** (stat `ini`), con el texto nuevo. Sacar lo de «va primero» (el orden en `ordenarIniciativa`, js/04; el cartel de `vtt-hexgrid/js/86-prisa.js`;
  el stat `prisa` en ficha-calculo / ficha-resumen) o dejarlo sin efecto, sin romper nada. **Quien ya la tiene** (personajes y creeps guardados, con
  la copia vieja: `mods: [{stat: 'prisa', val: 1}]`) tiene que pasar solo a la versión nueva al cargarse (una conversión por `poolId: 'prisa'`, como
  las otras migraciones): así Rocardo queda cambiado sin que nadie toque a mano la partida del dueño (que NO se abre ni se escribe para probar).
  Revisar también los creeps esenciales / de fábrica y los ítems que den `prisa`. Mismo costo de Job (1) salvo que el dueño diga otra cosa.
  **Cómo quedó (2026-11-20):** la pasiva Prisa (1 Job) dice «+5 a la tirada de Iniciativa» y suma 5 a la Iniciativa; ya no pone primero a nadie. El
  botón Ordenar ordena solo por la tirada, sin el cartel «Aplicar / Resolver a mano» de la Prisa, y sigue ofreciendo «▶ Iniciar combate» como antes;
  se fue la 🏃 de la lista de turnos. **Quien ya la tenía** pasa solo a la versión nueva al cargarse (personajes, invocaciones y creeps), y mientras su
  ficha no se vuelva a guardar el mapa igual le suma el +5 al tirar la iniciativa. No había creeps de fábrica ni ítems con Prisa.
  **Probado con clics:** en «El origen · CLON de pruebas», Rockardo (Jugador 2) tenía guardada la Prisa vieja: al abrir su Botonera en el mapa quedó
  «Prisa: +5 a la tirada de Iniciativa», Iniciativa 11 (7 de Agilidad − 1 del peto + 5 de Prisa) y su tirada de iniciativa fue 1d10+1 (antes, 1d6);
  al Ordenar, sin cartel de Prisa y con «▶ Iniciar combate». En «Claude · pruebas 2», Blanco J1 con la Prisa nueva del catálogo: Iniciativa 6 → 11,
  tirada 1d10+1. **Sin probar con clics:** un creep y una invocación con la Prisa vieja (sí en las pruebas automáticas); la ficha suelta de Rockardo
  (se probó desde el mapa). En la partida real no se entró: allá se convierte sola. 958 pruebas automáticas en verde (1 nueva).
  **Para que lo sepas:** con +5, quien tiene Prisa ya no va primero seguro; contra alguien de Iniciativa parecida gana casi siempre, pero puede perder.
- **🟡 a medias (2026-11-21: hecha la parte que puede romper una partida, lo del clon y la tanda 5; falta parte de lo visual — ver el resultado y las partes segunda y tercera, abajo) — 🧪 Pasada de pruebas: lo que quedó sin probar en el mapa de las tareas del 2026-11-20** (dueño, 2026-11-20: «lo que me dijiste
  que no se probó, anotalo en la cola»). Sin programar nada nuevo: probar con clics en «Claude · pruebas 2» (GM, J1, J2) lo que cada informe dejó
  sin ver (también está en docs/pruebas-en-el-mapa.md; tachar ahí lo que se vea) y arreglar solo lo que falle:
  · **Arrastrar / Desequilibrado / primer ataque** (96edd265): una invocación arrastrada; un creep arrastrando a un personaje; cerrar con
    «Finalizar combate → Publicar» y abrir otro combate (costo del primer ataque); una ballesta «que llega cargada» en el primer turno del combate
    nuevo; el «hasta el fin del turno de…» en GM Tools (chip, Ver, Tablero) y en la 🔍 del estado en la ficha.
  · **Cartel «INVULNERABLE / INMUNE A…»** (56a48f10): golpe a un creep invulnerable; Protección de jefe; inmune a un elemento desde una zona, una
    trampa, el Escudo elemental, el rayo en cadena y el elemental de un arma; «INMUNE A LO SINIESTRO»; dos carteles a la vez; token que esa pantalla no ve.
  · **Debuffs que no entraban tras el Pacto** (79ef20c7): el GM con 🎮 el control tomando los avisos; origen zona o trampa; ficha suelta en pestaña dormida.
  · **Carcaj** (b31433a8): costo con Extenuado; ballesta con carcaj integrado; «Realizar de cualquier modo» sin No2; abrir el Equipo con el 🛡 del token.
  · **Pasar DDE y despojos** (c2ee6fb5): despojos e ítems entre J1 y J2; Rechazar / Cancelar; despojos especiales; con el mapa en Combate.
  · **Vuelta a narrativo** (d592fa7b, c5b24399): el GM mirando otro mapa que el publicado; con orden de turnos armado; que se libere lo «una vez por
    combate»; cerrar desde GM Tools; la pantalla del Jugador 2.
  · De antes: enjambre en contraataque / oportunidad / habilidad con arma; Llama de Fénix como tercera opción de «¿Con qué volvés?»; el camino
    Avanzar de la XP en «Batalla terminada».
  Informe: tabla caso → visto / falló / no se pudo, con capturas.
  *Resultado (2026-11-21):* con clics en «Claude · pruebas 2» (GM, Jugador 1 y Jugador 2 en tres pantallas), en orden de importancia. El detalle,
  caso por caso, en `pruebas-en-el-mapa.md` («🧪 Pasada de pruebas del 2026-11-21», tres tandas). **Visto y anda (unos 45 casos):** Iniciar
  combate (invocación primera, sin cambiar el modo, «Pasar el turno sin iniciar», un caído primero); la Táctica de enjambre en oportunidad,
  contraataque y habilidad con arma; Arrastrar hecho por un creep a una invocación y a un personaje; Finalizar combate → Avanzar → Publicar con
  el GM mirando otro mapa y con orden armado (XP en «Batalla terminada», vuelta a narrativo, la pantalla del Jugador 2), y otro combate después
  (costo del primer ataque, ballesta que llega cargada); el botín minimizado con dos jugadores y en medio de una disputa; «¿Con qué volvés?» con
  la Llama de Fénix como tercera opción; un creep con la Llama de Fénix; el cartel INVULNERABLE en un creep, la Protección de jefe y un token
  oculto; debuffs tras el Pacto con el GM teniendo el control; pasar ítems (Rechazar / Cancelar / aceptar en combate), DDE, despojos y un
  despojo especial entre J1 y J2; Dar a un jugador (con el control, apilando un consumible, dos regalos seguidos); el carcaj adentro del mapa
  (precios en combate, Extenuado, «Realizar de cualquier modo», «¿Qué flecha?»). **Fallaron tres cosas chicas, las tres arregladas y vueltas a
  probar:** (1) al cerrar el combate con el GM mirando otro mapa, a los creeps no se les liberaba lo de «una vez por combate»; (2) al tomar o
  devolver el control con el token ya seleccionado, los círculos de vida / SP / No2 quedaban apagados para el GM y prendidos para el jugador;
  (3) con el Equipo abierto, si llegaba un Extenuado los botones del carcaj decían el precio viejo. **Una cosa rara vista una sola vez**, sin
  poder repetirla: quedó como entrada nueva al final de esta cola. **No se pudo:** revivir una invocación con su ✚ (al morir, su token se va) y
  dar a un personaje del propio GM (no hay). **Falta (no se llegó):** todo lo del clon de El origen (sigilo y lo que no se nombra, niebla,
  Puntería certera / Foco, Prisa vieja de un creep), «Ver detalle» de una zona, Revelar por el camino nuevo de las reglas, las animaciones de
  resurrección con el duelo abierto, maestrías y Aguante de trinchera en casos raros, cerrar desde GM Tools, la ficha suelta dormida y el
  cartel de inmunidad por elemento. La partida quedó como estaba (comparada contra la foto del principio; a la Abeja de prueba hubo que
  volver a ponerle el token). 963 pruebas automáticas en verde.
  *Segunda parte (2026-11-21, tanda 4; el detalle en `pruebas-en-el-mapa.md`, «Tanda 4»):* **visto y anda**, en el clon de El origen: lo que
  no se nombra (el Shockwave a una rata en sigilo, el Ojo de asesino jugado hasta el final, el inicio de turno de una rata escondida y
  envenenada, el Muro de fuego desde la niebla, un personaje en sigilo visto por el GM), las Zonas de riesgo con la niebla prendida (jugador y
  GM con 🎮 el control), Puntería certera (el cartel con el duelo abierto, el arrastre que no la apaga, sin orden de turnos) y la Prisa vieja
  en un creep (+5); en «Claude · pruebas 2»: «Ver detalle» de una trampa a la vista (armada y disparada), del Portal trampa y del hielo de una
  varita con orden de turnos; el cartel «INMUNE AL FUEGO» por una trampa y por el Escudo ígneo; y, con las reglas de Firebase ya pegadas,
  «Volver a ocultar» una trampa y el nombre de un token corregido por el GM. **Fallaron cuatro cosas chicas de textos, arregladas y vueltas a
  mirar:** el cartel de una trampa mecánica decía que la dispara cualquiera; el cartel de una zona contaba los turnos distinto que su tarjeta;
  la tarjeta del Portal trampa no decía que teletransporta; la de la Mina del cazador no decía que solo se dispara pisando el centro.
  **Dos dudas de reglas nuevas:** P263 (el cuadro del duelo nombra a un escondido cuando un jugador le pega con un área) y P264 (un creep que
  pone una zona desde la niebla queda delatado, y la Mesa lo nombra en una pantalla y en otra no). **Sigue sin ver** (no se llegó): una
  invocación en sigilo, el Anillo de Foco Arcano, el cartel de inmunidad desde una zona / un arma / lo siniestro / dos a la vez, maestrías y
  Aguante de trinchera en casos raros, cerrar el combate desde GM Tools, la ballesta con carcaj integrado, el «hasta el fin del turno de…» en
  GM Tools y en la ficha, la ficha suelta dormida y las animaciones de resurrección. Las dos partidas quedaron como estaban (en el clon venció
  sola una zona temporal que ya estaba puesta, al pasar rondas). 965 pruebas automáticas en verde (2 nuevas).
  *Tercera parte (2026-11-21, tanda 5; el detalle en `pruebas-en-el-mapa.md`, «Tanda 5»):* **visto y anda:** cerrar el combate desde GM
  Tools (el jugador ve su «🎁 Botín concluido» con el renglón «🌿 Modo narrativo»; el mapa del GM vuelve a narrativo) y un jugador que entra 11
  minutos después (ve su Botín concluido, sin hablar del modo del mapa); una invocación con una maestría y con Aguante de trinchera; un crítico
  contra alguien con Aguante (no suma); el renglón en la ficha lite; la declaración de un hechizo y la de un contraataque con cortantes; el
  «hasta el fin del turno de…» en la ficha suelta (chip y «Ver») y en el Tablero de GM Tools; la ballesta con carcaj integrado (8 lugares);
  los carteles «INMUNE AL FUEGO» e «INMUNE A LO SINIESTRO» desde una zona. **Fallaron tres cosas, arregladas y vueltas a probar:** el Aguante de
  trinchera no sumaba contra el daño de una trampa (la Mina) que frena la Defensa especial; una zona hecha a mano «de fuego» se guardaba sin
  elemento (P268); el cartel de arriba de una zona decía siempre lo mismo. **Dudas nuevas:** P265 (los arcabuces no tienen Recarga: la
  Maestría en ballestas no les suma). **Sigue sin ver:** Pegar fuerte con una maestría y el golpe de ballesta con Perfora hasta el final; dos
  carteles de inmunidad a la vez y el elemental de un arma; la ficha suelta dormida; «Ver detalle» de una trampa que deja zona, una zona de
  curación, un portal común y el Acelerador; «✋ No la detectó»; las Zonas de riesgo que faltaban; las animaciones de resurrección. La tanda se
  cortó ahí porque entraron cuatro encargos del dueño (las cuatro entradas del final de esta cola). La partida quedó como estaba. 966 pruebas.
- **✅ hecho (2026-11-20) — 🛡 Cartel flotante desde el token cuando algo no le entra por una inmunidad** (dueño, 2026-11-20: «me gustaría que también salte
  el cartel flotante desde el token, en un azul-plateado que diga "INVULNERABLE"… o también "INMUNE A TÓXICO", por ejemplo»).
  *Resultado:* además de la línea «🛡 … no le hizo nada (motivo)» de la Mesa, del token sale un cartel que flota ~2 s, en azul-plateado, y lo ven todas las
  pantallas (es el mismo texto flotante del «−2 EVA», con otro color). Dice **«INVULNERABLE»** si lo frena la invulnerabilidad (Invulnerable / Titilando),
  sea un estado o un golpe; **«INMUNE A <ESTADO>»** con cualquier otra inmunidad a un estado («INMUNE A MIEDO», «INMUNE A CEGUERA», «INMUNE A VENENO»,
  «INMUNE A STUN»…); e **«INMUNE A LO TÓXICO / AL FUEGO / A LO ELÉCTRICO…»** cuando un daño de ese elemento no le hace nada (las mismas palabras de la
  etiqueta que ya sale al apuntar). Vale para personajes, creeps e invocaciones. Si la pantalla tiene el cuadro del duelo o un aviso tapando el mapa, el
  cartel espera a que se cierre (como la Transfusión; como mucho 25 s). Si el jugador tiene solo la ficha abierta (sin el mapa), el cartel sale igual en
  los mapas de los demás. **Probado con clics en «Claude · pruebas 2» / «Prueba · R4 M4», GM y Jugador 1** (capturas de las dos pantallas): golpe de
  Blanco creep a Blanco J1 Titilando → «INVULNERABLE»; Cegar de Control mental 2 a Blanco J1 con Inmunidad a CC → «INMUNE A CEGUERA»; Punzada mental
  (puesta como daño tóxico para la prueba) a Blanco J1 inmune a lo tóxico → «INMUNE A LO TÓXICO»; Veneno y Miedo que le llegan con Sangre pura e
  Inmunidad mental → «INMUNE A VENENO» e «INMUNE A MIEDO»; Miedo a la Abeja de prueba (invocación) Titilando y «Recibe daño» a mano sobre ella →
  «INVULNERABLE»; «+ Estado» a mano del GM (Stun) sobre Blanco creep con Inmunidad a CC → «INMUNE A STUN»; y con el jugador solo en la ficha, el cartel
  en el mapa del GM. 892 pruebas automáticas en verde. **No lo cubre:** el Veneno o el Sangrado que ya tenía puesto y no le hace daño en el Mantenimiento
  (hoy solo lo dice el texto del Mantenimiento) y la Maldición tormentosa sobre un invulnerable. Lo que no se vio en el mapa (la Protección de jefe, las
  zonas, trampas, el Escudo elemental y el rayo en cadena con un inmune al elemento, un golpe a un creep invulnerable) quedó anotado en
  `pruebas-en-el-mapa.md`. La partida quedó como estaba (comparada contra una foto de antes).
- **✅ hecho (2026-11-20) — 🏹 El carcaj se ve dos veces en el Equipo, y los botones no dicen cuántos No2 cuestan** (dueño, 2026-11-20, con captura: «en este menú
  del equipo se ve duplicado el carcaj. También me gustaría que los botones de cargar o descargar te digan cuántos No2 va a costar la acción»). Hoy,
  con un arco o ballesta y sin Carcaj de cuero, salen dos recuadros: «CARCAJ 0 / 1 · Vacío» (el lugar para equipar un carcaj) y «🏹 CARCAJ INCLUIDO
  0 / 5». Que quede UN solo recuadro de carcaj: el incluido (5) si no hay uno equipado, o el equipado (con su capacidad) si lo hay; sin perder la
  forma de equipar/sacar un Carcaj de cuero. Y cada botón («→ Carcaj (N)», «→ Mochila (N)», «Cargar todo lo que entre», «Vaciar a la mochila») dice
  cuántos No2 cuesta en ese momento (en combate; fuera de combate, que diga que no cuesta), con el costo real que ya cobra el código: no inventar uno.
  *Resultado:* en «Equipo y mochila» (ficha y 🛡 del mapa) queda UN solo recuadro «🏹 Carcaj», al final de lo equipado: sin carcaj puesto y con arco o
  ballesta, «Carcaj incluido · N / 5»; con uno puesto, «Carcaj · N / 10» con la fila del Carcaj de cuero (Ver, Editar, **Sacar**) y sus flechas; sin
  arco, ni ballesta ni carcaj, «Vacío» y cómo conseguir uno (antes decía «Carcaj 0 / 1 · Vacío»). El carcaj se sigue equipando desde la mochila
  (columna de la derecha, «Equipar»). Cada botón dice lo que cuesta: fuera de combate «· gratis»; en combate «→ Carcaj (N) · 1 No2», «→ Mochila (N) ·
  1 No2», y «Cargar todo lo que entre» / «Vaciar a la mochila» con el total (1 No2 por cada clase de flecha que pasa: con dos clases, «· 2 No2»). Es
  el costo que ya cobraba (el de equipar, 1 No2 por acción, más lo que sume Extenuado): no se agregó ninguno. Abajo, una línea lo explica. Con el
  Equipo abierto, si el GM cambia de modo los botones se actualizan solos. Probado con clics en «Claude · pruebas 2» (Jugador 1, ficha y 🛡 del mapa):
  fuera de combate no cobró nada; en combate cobró exactamente lo que decía cada botón (6 → 5 → 4 → 2 No2, sacar el carcaj 1 más) y, sin No2
  suficientes, salió el cartel de siempre «cuesta 2 No2 y tenés 1». 1 prueba automática nueva (893 en verde). Detalle en `pruebas-en-el-mapa.md`.
  (La entrada «en cola» se había borrado sin querer al cerrar la tarea anterior: se repuso acá.)

- **✅ hecho (2026-11-20; el caso exacto de la partida no se pudo reproducir: ver el resultado) — 🐞 Después de revivir con el Pacto, al personaje dejan de entrarle los debuffs automáticos** (dueño, 2026-11-20, jugando El origen:
  «no funcionaba el aplicarle debuffs automatizados a Bizzante… murió y quedó invulnerable por el pacto pero dejó de recibirlos aún después de terminado
  invulnerable»). Lo que se vio leyendo la partida (solo lectura, 2026-11-20): la ficha guardada de Bizzante NO tiene ningún Invulnerable/Titilando
  (efectos: Regeneración, Arma ígnea, Parálisis; el Pacto ya gastado); en la cola `estados` sus avisos figuran todos `aplicada: true`, pero al menos uno
  (un Miedo, ~1 min después de la última vez que se guardó su parte `efectos`) fue tomado y NUNCA quedó en sus estados: la parte `efectos` no se volvió
  a guardar, aunque `general` sí (después). O sea: el aviso se marca tomado (`Recibidos.tomar`) y después el estado se pierde: o lo rechaza
  `Combatiente.inmunidad` contra una copia en memoria que sigue con el Titilando (el Titilando ya sacado en Firebase por otra pantalla), o no se guarda.
  Sospechosos: la copia del personaje en la pantalla que aplica (`bn.S` de la Botonera / la sesión temporal de `editarPersonajeMapa`, js/11; la ficha
  suelta), quién saca el Titilando al empezar el turno y si esa quita le llega a las otras pantallas (FichaSesion, partes), y que `tomar` va ANTES de
  aplicar (si no se aplica, se pierde sin rastro). Reproducir en «Claude · pruebas 2»: Blanco J1 con Pacto, cae por un golpe, revive Titilando, pasa su
  turno (se va el Titilando) y un creep le aplica un debuff automático (Cegar, Parálisis, Miedo…) con el jugador con la Botonera abierta y cerrada, y
  con el GM pasando el turno. Arreglar la causa y, además, que un aviso tomado que no se pudo aplicar no se pierda en silencio (aviso al jugador y al GM
  con el motivo, p. ej. «no te hizo nada (Invulnerable)» también en la Mesa).
  *Resultado:* el recorrido normal anda bien y **no se logró repetir tal cual lo de Bizzante** en «Claude · pruebas 2» (Blanco J1 con el Pacto, cae por
  un golpe de Blanco creep, revive Titilando; el Titilando se va con el ⟳ Mantenimiento, con «✔ Aplicar» del jugador al empezar su turno y con el GM
  pasando el turno sin que nadie aplique; después Miedo, Ceguera, Parálisis, Pajaritos y el Provocado de «¡Tu vieeeeja!» entran y quedan guardados;
  probado con la Botonera abierta, cerrada y con la ficha suelta en otra pestaña). Lo que **sí se encontró y se repitió con Firebase de verdad**, en el
  mismo camino y con el mismo síntoma (aviso tomado, estado que no queda en la ficha guardada): si en la pantalla del jugador el aviso llega justo
  mientras otra cosa está guardando a ese personaje, el estado no se escribía — con la Botonera (queda abierta desde el primer duelo) quedaba solo en
  la memoria de esa pantalla y marcado como guardado; sin ella, lo borraba el otro guardado. Y dos agujeros más del mismo guardado: un guardado que
  fallaba no se reintentaba nunca desde el mapa, y un error al armar lo que se escribe dejaba a esa pantalla sin guardar más a ese personaje hasta
  recargar (esto último encaja con «dejó de recibirlos» de ahí en adelante, pero no se pudo confirmar que haya sido eso). **Arreglado** (comun/ficha-sesion.js,
  vtt-hexgrid/js/11, comun/recibidos.js, comun/ficha-acciones.js, ficha js/02): los cambios simultáneos comparten una sola copia y cada uno queda como
  deuda hasta que se escribe; el guardado se reintenta solo; y **un aviso tomado ya no se pierde en silencio**: si lo frena una inmunidad, toast al
  jugador y línea en la Mesa con el motivo («🛡 Blanco J1: Miedo no le hizo nada (Invulnerable) · Blanco creep · Grito espeluznante»); si falla al
  aplicarse o no se puede guardar la ficha, vuelve a la cola y se reintenta solo, con una línea roja en la Mesa (a la tercera, «aplicáselo a mano»).
  5 pruebas automáticas nuevas (890 en verde). **Hipótesis que quedan** si vuelve a pasar: una carrera entre DOS pantallas distintas (el GM aplicando
  «por él» el inicio del turno en el mismo instante en que el jugador aplica el aviso: en cada parte gana la última que guarda) y la pestaña de la ficha
  suelta dormida en segundo plano; ahora, si pasa, tiene que quedar una línea en la Mesa o un error en la consola del jugador (F12). Capturas en `cola18/`.
- **✅ hecho (2026-11-20) — ⭐ En el reporte «Batalla terminada» del GM, la XP que tiene cada jugador y cuánto le falta para subir** (dueño, 2026-11-20: «que en la
  gestión del loot, previo a publicar, que el gm pueda ver cuánta exp tiene cada jugador, y cuánto falta para subir de nivel»). En el paso de la
  experiencia de `CombateFin.vista` (comun/combate-fin.js; lo usan el mapa del GM y GM Tools, en Simular y en Avanzar), al lado de cada personaje:
  nivel, XP actual / la que pide el próximo nivel, cuánto le falta, y qué pasa con lo que va a cobrar («con estos 191 sube a nivel 4» / «le quedan
  faltando 35»). La cuenta de niveles ya existe (`Recibidos.aplicarExp` / `expParaNivel`, comun/recibidos.js): usar esa, sin inventar otra. Si la XP de
  la ficha no está en el resumen público, leerla como GM (solo lectura).
  *Resultado:* en el paso «4. Experiencia» del reporte (Avanzar y Simular, en el mapa del GM y en GM Tools), debajo del nombre de cada personaje:
  «⭐ Nv 1 · 65 / 100 XP · le faltan 35» y, si cobra, «⬆ con estos 35 sube a nivel 2 · queda en 0 / 200 XP» (verde) o «→ con estos 20 le quedan
  faltando 15 para el nivel 2» (amarillo); cambia al tocar «Experiencia por jugador» o el extra de uno. En «5. Publicar», «⬆ sube a nivel N» al lado
  del que sube. La XP se lee de la ficha (solo lectura); la cuenta es la de siempre (nivel × 100). Probado con clics en «Claude · pruebas 2»
  (Simular, mapa y GM Tools): nada se escribió. 1 prueba automática nueva (885 en verde). Capturas en `cola17/`.
- **✅ hecho (2026-11-20) — 🏹 El Carcaj de cuero ya no se regala con cada arco o ballesta** (dueño, 2026-11-20, P250: «NO» a «¿se sigue regalando…, ahora que hay
  un carcaj incluido de 5?»). Sacar el regalo al comprar (y donde más se entregue solo: tienda, personaje nuevo, etc.; grep) y corregir el texto del
  Carcaj de cuero del catálogo («Viene con cada arco o ballesta que se compra» → ya no; es la mejora de 10 lugares que se compra aparte) y el aviso
  «viene uno con cada arco» de `comun/ficha-equipo.js`. No sacarle el carcaj a quien ya lo tiene. Marcar la P250.
  *Resultado:* comprar un arco o una ballesta (tienda, personaje nuevo, «agregar gratis») ya no suma el Carcaj de cuero; el que ya lo tenía lo conserva.
  El Carcaj de cuero dice ahora «Lugar para 10 flechas o virotes especiales: el doble que el carcaj incluido de 5 que trae cualquier arco o ballesta.
  Se compra aparte.» El aviso «viene uno con cada arco» de Equipo ya no existía (se había cambiado con el carcaj incluido). Probado con clics en
  «Claude · pruebas 2»: Jugador 1 compró un Arco de caña en una Tienda de inicio (95 DDE), llegó solo el arco, y al equiparlo se ve «Carcaj incluido
  0 / 5». P250 marcada ✅. Pruebas automáticas al día (885 en verde). Capturas en `cola17/`.
- **✅ hecho (2026-11-20) — 🏹 Carcaj incluido de 5 lugares con cualquier arco o ballesta** (dueño, 2026-11-20: «programá que cualquier jugador tenga por default un
  carcaj de 5 slot para virotes/flechas especiales incluído, sin peso adicional, por cargar cualquier arco o ballesta»). Hoy las flechas y virotes
  especiales solo se llevan en un carcaj equipado (`tipoItem: 'carcaj'`, `capFlechas`; `carcajDe`, `capCarcaj`, `flechasDelCarcaj` en
  comun/ficha-equipo.js): sin carcaj, «Equipá un carcaj…». Cambio: un personaje con un arco o una ballesta equipados (un arma de rango que dispara
  flechas o virotes) y SIN carcaj puesto tiene un **carcaj incluido** de 5 lugares, sin peso, sin ocupar el lugar de Carcaj ni la mochila: se le pueden
  pasar flechas/virotes especiales, se disparan desde ahí y se ve en Equipo y en la Botonera como «Carcaj incluido (N / 5)». Con un carcaj de verdad
  puesto, vale ese (su capacidad, como hoy; el `carcajExtra` de una ballesta sigue sumando como hoy). Decidir lo más simple para guardar las flechas
  (que no se pierdan al equipar un carcaj de verdad, al sacarlo o al desequipar el arco: pasan al carcaj nuevo o vuelven a la mochila, avisando).
  Solo personajes (los creeps llevan su munición aparte). Dudas → `preguntas-abiertas.md`.
  *Resultado:* con un arco o una ballesta equipados y sin carcaj puesto, el personaje tiene un «Carcaj incluido» de 5 lugares (no pesa, no ocupa el
  lugar de Carcaj ni la mochila): se ve en Equipo (ficha y 🛡 del mapa) como «🏹 Carcaj incluido · N / 5», y «¿Qué flecha?» dice «N en el carcaj
  incluido». Con un carcaj de verdad puesto vale ese: al ponérselo, las flechas pasan solas (las que no entran, a la mochila) y avisa; al sacar el arco
  sin carcaj, vuelven a la mochila y avisa. Agregado del dueño el mismo día («cargar y descargar fácilmente»): cada clase de flecha con su botón
  «→ Carcaj (N)» / «→ Mochila (N)» y, con más de una, «Cargar todo lo que entre» / «Vaciar a la mochila» (mismos costos de siempre). Probado en
  «Claude · pruebas 2» con Blanco J1 (Jugador 1) y un Arco corto prestado: cargó 3 Flechas de fuego, disparó una (3 → 2, +1 No2), cargó virotes hasta
  llenar, se puso el Carcaj de cuero (pasaron las 5), vació, y al sacar el arco volvieron a la mochila. 2 pruebas automáticas nuevas (881 en verde).
  Detalles elegidos mientras tanto: P250. Capturas en `cola15/`.
- **✅ hecho (2026-11-20) — 😇☥ Pacto activo y Ankh en el cinturón: el jugador elige cuál usar** (dueño, 2026-11-20: «quisiera asegurarme de que si un jugador
  tiene un pacto activo y un ankh en el cinturón, al jugador le debe aparecer la opción de qué usar»). Hoy NO pregunta: `FichaAcciones.revisarAnkh`
  (comun/ficha-acciones.js) usa solo, en orden fijo, la Llama de Fénix, después el Pacto y recién después el Ankh. Cambio: cuando la vida llega a 0 y
  hay más de una forma de volver (Pacto activo y Ankh de Reencarnación en el cinturón; también la Llama de Fénix si la tiene), al jugador le aparece
  «¿Con qué volvés?» con cada opción y lo que hace (el Pacto: revive con un cuarto, se gasta hasta que la historia dé otro; el Ankh: revive con un
  cuarto, se gasta uno; la Llama: toda la vida y el SP), y se usa solo la que elige. Con una sola, automática como hoy. Si quien resuelve no es el
  jugador (el GM con el control, o el jugador no está), el GM elige por él. Que no quede colgado: mientras no elige, el personaje está caído. Probar en
  el mapa con Jugador 1 (las dos elecciones) y con el GM manejándolo.
  *Resultado:* con más de una forma de volver (Pacto, Ankh en el cinturón, Llama de Fénix) el personaje ya no revive solo: queda caído y a quien lo
  maneja le sale «☥ ¿Con qué volvés?» con cada opción y lo que hace; se usa solo la elegida y las otras quedan. Si cierra el cartel sigue caído y lo
  reabre con el botón «☥ ¿Con qué volvés? Elegí» de la pantalla roja o el ☥ de su token; si recarga, el cartel vuelve a salir. Con el GM en 🎮 control le
  pregunta al GM (no al jugador), y si el jugador no está el GM elige por él con el ☥ del token. Con una sola forma, automático como siempre. Igual en la
  ficha suelta. Probado en «Claude · pruebas 2» (Blanco J1 contra un golpe de Blanco creep en un duelo): Jugador 1 eligió el Ankh (quedó el Pacto), después
  el Pacto (quedó el Ankh, cerrando y recargando antes), el GM con el control, el GM sin el jugador, y con solo el Pacto (automático). 884 pruebas en
  verde. Lo que quedó elegido «mientras tanto»: P251. Capturas en `cola16/`.
- **✅ hecho (2026-11-20) — 🐝 Pasiva nueva «Táctica de enjambre»** (dueño, 2026-11-20: «sumá una pasiva más: táctica de enjambre. tenés +1 a la pdg por cada
  aliado adyacente. cuesta 2 puntos de job»). En `comun/pasivas.js` (PASIVAS_BASE, jobCosto 2), para personajes, creeps e invocaciones. +1 a la
  Probabilidad de Golpe por cada aliado pegado a QUIEN ATACA (a 1 casilla de él), contado en el momento del ataque. Depende de la posición: lo suma el
  mapa al atacar (mirar cómo lo hace la Patota, vtt-hexgrid/js/65, y el Guardián, js/10: «aliado» = del mismo bando, con ficha, en el mapa, ni caído
  ni bajo tierra; quien ataca no se cuenta), con su línea en la tirada/el duelo («Táctica de enjambre +2: 2 aliados al lado») y un estado o indicador
  derivado a la vista mientras tenga aliados pegados, si sale natural. Fuera del mapa (ficha suelta) no suma: aclararlo en la descripción.
  Dudas de alcance (¿también la PdG especial?, ¿tope?) → como lo dijo el dueño: la PdG, sin tope; lo demás a `preguntas-abiertas.md`.
  *Resultado:* la pasiva está en la lista (2 puntos de job), para personajes, creeps e invocaciones. Al atacar con el arma en el mapa, cuenta los
  aliados pegados a quien ataca y suma +1 PdG por cada uno, sin tope; se ve en el cuadro del duelo («🐝 Táctica de enjambre +2: 2 aliados al lado») y
  en la tirada («+2 enjambre»). Vale también para el contraataque y el de oportunidad (nacen en el mismo lugar). Fuera del mapa no suma (lo dice la
  descripción). Sin indicador sobre el token. Probado en «Claude · pruebas 2»: creep con 0, 1 y 2 aliados; personaje de Jugador 1 con 2; invocación
  con 1. Prueba automática nueva (879 en verde). Alcance mientras tanto (solo PdG común y ataques con arma): P249. Capturas en `cola14/`.
- **✅ hecho (2026-11-20) — 🌀 Un creep que se va por un Town portal cuenta como «Escapó» al finalizar el combate** (dueño, 2026-11-20, jugando El origen: «un
  creep escapó con un portal, y ahora en la simulación no aparece como que escapó, ni lo contabiliza para la experiencia»). Causa: al pisar el Town
  portal el token se borra del mapa (js/84, `townPortalRevisar` desde moverToken js/07) y el fin del combate solo cuenta los creeps con token en el mapa
  publicado (`CombateFin.creepsEnMapa`, comun/combate-fin.js). Arreglo: cuando un creep se va por el portal durante un combate, que quede anotado (en el
  creep o en el combate en curso) y que el reporte lo sume como «Escapó» (el 20 % de su XP si «contar a los que escaparon» está tildado; sin oro ni
  ítems), igual en Simular y en Avanzar. Probar en «Claude · pruebas 2»: un creep vivo pisa un Town portal en combate → Finalizar → aparece «Escapó».
  *Resultado:* si el mapa está en combate, al entrar un creep por el portal la pantalla del GM lo anota en una lista de la partida (`gm/escapados`, solo
  el GM: no hacen falta reglas nuevas); el fin del combate lo suma y lo muestra «Escapó 🌀» con sus reglas de siempre (20 % de la XP si está tildado
  contar a los que escaparon; sin oro ni ítems), en Simular y en Avanzar. La lista se vacía al publicar las recompensas y con «↺ Reiniciar combate»; el
  Ctrl+Z de la entrada al portal lo saca. Probado en «Claude · pruebas 2» con GM y Jugador 1 (Blanco creep caído, Protector 2 vivo por el portal):
  Simular y Avanzar dieron «Escapó 🌀 +19 XP», publicar vació la lista y el combate siguiente ya no lo mostró. Partida restaurada. 877 pruebas en verde.
- **✅ hecho (2026-11-20) — 🔨 Pasiva nueva «Maestría en armas pesadas»** (dueño, 2026-11-20: «quiero sumar una habilidad pasiva para jugadores (y creeps):
  Maestría en armas pesadas. da +2 a pdg en armas de tipo 10, y además da +1 al parry con ese tipo de armas»). En `comun/pasivas.js` (PASIVAS_BASE,
  la ofrecen la ficha y los creeps). El +2 al PdG con Tipo 10 ya existe como stat (`pdgt10`, «PdG con contundentes», lo suma
  `Combatiente.pdgExtraArma`). El +1 al Parry solo con un arma de Tipo 10 NO existe: sumar un stat `parryt10` (y, si sale natural, `parryt4/6/8`) que
  se sume al Parry cuando se para con un arma de ese Tipo (no con escudo), en personajes (FichaCombate.statParaArma / el Parry de la Botonera y del
  duelo), creeps (CreepCalculo) e invocaciones, con su 🔍 («Maestría en armas pesadas +1»). Job: 1 (propuesto por Claude, a confirmar con el dueño).
  Prueba automática y probar en el mapa: un personaje y un creep con un arma de Tipo 10 (y otra de otro Tipo para ver que ahí no suma).
  *Resultado:* en `comun/pasivas.js`, Job 1 (confirmado por el dueño): pdgt10 +2 y el stat nuevo `parryt10` +1 («Parry con contundentes»), que se suma al
  Parry solo al parar con un arma de Tipo 10 (no con escudo ni otra arma), en personajes, creeps e invocaciones (`Combatiente.parryExtraArma`), con su línea
  en la 🔍 de Parry y de Atacar y en la ficha lite. Probado en «Claude · pruebas 2» (GM + Jugador 1): Blanco J1 con Cachiporra y Cuchillo (Atacar 1d8 / 1d6,
  Parry 1d6+1 / 1d6) y el Blanco creep con Cachiporra (Atacar 1d8+1, Parry 1d8; con el escudo, 1d6+1) y con su hacha Tipo 8 (sin nada de más); también en
  el «Elegí cómo te defendés» de un duelo real. Lo prestado, sacado. 878 pruebas en verde. Abierta: P248 (las maestrías de otras familias).
- **✅ hecho (2026-11-20) — 🔮 «Finalizar combate»: Avanzar o Simular** (dueño, 2026-11-20: «me gustaría poder hacer esa simulación que al poner finalizar combate
  como GM tenga la opción de avanzar o de simulación»). Al tocar «Finalizar combate», el GM elige: **Avanzar** (lo de siempre: reporte, publicar
  recompensas, botín) o **Simular**: la misma ventana «Batalla terminada» con la XP de cada personaje, el oro y el botín (despojos y drop al azar, con
  «otra tirada»), pero **sin escribir nada** (ni recompensas, ni botín, ni Mesa, ni marcar creeps) y sin cerrar el combate; con un cartel bien claro
  «Simulación: no se guarda nada» y un botón para pasar a Avanzar. Usar `comun/combate-fin.js` (sus funciones de cálculo; nada de lo que publica).
  Probar en «Claude · pruebas 2» y verificar que la simulación no dejó nada escrito.
  *Resultado:* al tocar «🏁 Finalizar combate» (mapa del GM y GM Tools) sale «¿Qué querés hacer con el combate?» con **▶ Avanzar** (lo de siempre) y
  **🔮 Simular**: la misma ventana «Batalla terminada», paso a paso, con un cartel violeta arriba «🔮 Simulación: no se guarda nada» y el botón
  **▶ Pasar a Avanzar** (sigue con lo ajustado y recién ahí aparece 📢 Publicar); en simulación no hay Publicar y, por las dudas, publicar se niega
  (`rep.simulacion` en `comun/combate-fin.js`). Tildar, destildar, 🎲 otro consumible y sacar a alguien del reparto quedan en memoria (el reparto no pasa
  por `fueraCambiar`; `darConsumiblesAlAzar` no lo llama esta ventana). Probado en «Claude · pruebas 2» con GM y Jugador 1 (un mapa chico con el Blanco
  creep caído y el Protector 2 en pie): leída la partida antes y después de simular (recompensas, botín, combate, Mesa, historiales, momentos, creeps,
  fichas, `gm/personajes`, ajustes): **nada cambió**; lo mismo desde GM Tools. Después, «Pasar a Avanzar» → Publicar → Jugador 1 vio el botín → Cerrar
  botín: todo como siempre. Partida restaurada. 876 pruebas en verde.
- **✅ hecho (2026-11-19) — 📣 El daño fijo de una zona (sin dados) se aplica directo, pero con aviso al afectado** (dueño, 2026-11-19, P245 ✅: «igual tiene que
  comunicarse, sobre todo la persona afectada. Si te entra un daño directo, te tiene que aparecer una notificación que diga, te ingresó tanto de daño
  por tal razón»). En las zonas con cartel cuyo daño es un número fijo (lo dejó así el #9, `vtt-hexgrid/js/08`): al afectado (quien lo maneja: su
  jugador, o el GM para un creep) le aparece el aviso «Te entraron N de daño por <nombre de la zona>» (con la cuenta si la Defensa frenó algo), y queda
  en la Mesa y la Crónica. Revisar de paso si hay otros daños fijos o directos que entren sin aviso al afectado (anotarlos en el resultado, sin
  cambiarlos todos sin preguntar). Probar en el mapa con una zona del GM de daño fijo sobre un personaje de Jugador 1.
  *Resultado:* lo que el cartel de la zona aplica solo (el número fijo, «la diferencia» sola o el daño de un token oculto) ahora se avisa a quien maneja
  al que lo recibe: si lo resolvió su propia pantalla, en el mismo cartel de la zona, un recuadro rojo «💔 −3 · Te entraron 3 de daño por Brasas del GM
  (4 − Defensa 1 = 3)»; si lo resolvió otra (el GM con 🎮 el control del personaje), al jugador le sale al centro el Aviso con lo mismo y «Entendido».
  A un creep, al GM: «A Blanco creep le entraron 3…». Queda en la Mesa («💔 Blanco J1 · Brasas del GM: le entraron 3 de daño (4 − Defensa 1 = 3)») y en
  la Crónica (`zonaDanoCuenta` / `zonaDanoAvisar`, `vtt-hexgrid/js/08`). Probado en «Claude · pruebas 2» con GM y Jugador 1: zona fija del GM sobre
  Blanco J1 (la resolvió Jugador 1), lo mismo con el GM con el control, y sobre el Blanco creep. Otros daños directos sin aviso al afectado: P246 (sin
  tocar). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 📣 El mismo aviso al afectado para los otros daños directos** (dueño, 2026-11-19, P246 ✅: «ponele a todos el mismo aviso»). Los seis
  que encontró la tarea del daño fijo de las zonas (ver P246 en `preguntas-abiertas.md`): 🔥 Terreno incendiado (al entrar y en cada Mantenimiento),
  ⛈ Maldición tormentosa (al moverse), 🦵 Tendón cortado (al caminar sangrando), 🛡 Miti-Miti / Escudo humano (lo que se lleva quien protege), ⚡ los
  saltos del Relámpago en cadena, y 🪞🔮 el Espejito y el Orbe salvaje con 1 (le pegan a quien atacó). Mismo aviso que el del daño fijo de una zona
  (`vtt-hexgrid/js/08`): al afectado (su jugador, o el GM para un creep) «Te entraron N de daño por <qué>» con la cuenta, y la línea en la Mesa y la
  Crónica. Reusar esa misma función, no armar otra. Probar en el mapa los que se puedan.
  *Resultado:* una sola función para todos (`danoDirectoAvisar`, la del daño fijo de las zonas, js/08): a quien maneja al afectado, el Aviso al centro
  con la cuenta y «Entendido» (al GM en tercera persona para un creep), la línea en la Mesa y la Crónica. Si llegan dos avisos juntos, el segundo espera
  al primero (también el reporte del rayo). Probado en «Claude · pruebas 2» con GM y Jugador 1: 🔥 al entrar Blanco J1 («Te entraron 3 de daño de fuego
  por el Terreno incendiado (directo a la vida)») y el Blanco creep (al GM), y en el Mantenimiento los dos; ⛈ Blanco J1 al caminar 2 casillas
  Atormentado; 🦵 el Blanco creep caminando 2 con el tendón cortado y sangrando; 🛡 el Escudo humano del Protector 3 (−3) y 🪞 el Espejito del Blanco
  creep (−1 a Blanco J1) en un golpe de varita; ⚡ el salto por el agua al Blanco creep. **Sin probar en el mapa**: el Orbe salvaje con 1 (el d6 sale al
  azar), anotado en `pruebas-en-el-mapa.md`. Los saltos de una varita o del Relámpago van cada uno en su cuadro del duelo (ya se veían). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🛡 Cargar el Protector (S4) niveles 2 a 5 y verlos en el mapa** (dueño, 2026-11-19: los cuatro aprobados, «va»). Cargar en
  `comun/creeps-esenciales.js` tal como están en `docs/creeps-humanoides.md` (sección S4: atributos, equipo, habilidades, pasivas, modo SP), con su prueba
  de números en `comun/pruebas.html`, y cambiar sus «Falta cargarlo» por «Cargado». En el mapa ver: Coraza de púas (Espinas a un aliado), Velo espejado
  (Espejo), el Guardián +1 del Escudo de la guardia a un aliado al lado, Purificar como Flash en turno ajeno (4 SP), y Tirar la bronca (Res.Mt contra su
  Ef.Esp, Provocados por el aliado).
  *Resultado:* cargados los cuatro (`const S4` en `comun/creeps-esenciales.js`) con su prueba de números: todos coinciden con el diseño (vida, No2, SP y
  lo que recupera, Def, Def.Esp, PdG.Esp, Ef.Esp, Eva, Parry, Bloqueo, Ini, Mov, Rango, Percepción, resistencias, Guardián). En «Claude · pruebas 2» con
  GM y Jugador 1: la Coraza de púas le devolvió 3 a Blanco J1 al pegarle al Blanco creep, y en ese golpe el Guardián del Protector 3 restó 1; el Velo
  espejado devolvió 2 de una varita; Purificar en el turno de Blanco J1 costó 4 SP, sacó Rengo y curó 5; Tirar la bronca dejó a Blanco J1 Provocado por
  el Blanco creep, con su aviso al empezar el turno. **Arreglado**: la línea del duelo de Purificar decía «Quedó con Purga, Curación» (ahora «Le sacó
  Rengo. Lo curó +5 HP»). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 📺 El Parpadeo marca las casillas a las que puede saltar** (dueño, 2026-11-19, en la compu, después de probarlo: «me gusta como
  funciona, sólo le agregaría un detalle. cuando apretás "ejecutar", te debería marcar el area de casilleros disponibles para el efecto»). Al ejecutar
  un blink (todo lo que pasa por `blinkDeHabilidad`, js/13: el Parpadeo de los creeps, la Varita del blink, el blink de una habilidad de personaje o de
  invocación, ¡Al frente!), mientras se elige el destino se pintan las casillas válidas (libres y a su alcance), como el Salto (`saltoCasillaDibujar`,
  js/105: reusar ese dibujo, no armar otro). Probar en el mapa con el Parpadeo de un creep y con la Varita del blink de un personaje.
  *Resultado:* al llegar a «¿adónde salta?», quedan pintadas (con el dibujo del Salto, todas en celeste fuerte) las casillas libres a su alcance; con
  ¡Al frente!, solo las pegadas a un rival. Se borran al saltar o al cancelar (Esc). Solo las ve quien elige; un token que esa pantalla no ve (oculto,
  en la niebla) no se descuenta, para no delatarlo (si se hace clic ahí, «Esa casilla no está libre»). Probado en «Claude · pruebas 2»: el Parpadeo del
  Arcano 4 (31 casillas; clic en una ocupada → «no está libre» y siguen marcadas; Esc → se borran y se le devolvieron los 4 SP; después saltó a 3), y la
  Varita del blink de Blanco J1 desde Jugador 1 (a sí mismo, 30 casillas, saltó; a Blanco J1 b, marcadas alrededor de él). 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 😇 Quitar el Pacto desde el menú del token** (dueño, 2026-11-19, en la compu, P244 ✅: «renovarlo desde el token como gm me gustó cómo
  quedó. Técnicamente también debería poderse quitar. Desde el mismo lugar no estaría mal»). En el menú «⋯» del token de un personaje, con el Pacto
  **activo**, un botón para quitarlo (con el Pacto gastado sigue el 😇 de renovar). Lo pueden usar los mismos que renovarlo (el GM y el jugador dueño),
  pide confirmar, deja la línea en la Mesa («😇 El GM le quitó el Pacto a Fulano» / «Fulano dejó su Pacto») y al jugador le avisa. Probar en el mapa.
  *Resultado:* en el «⋯» del token de un personaje con el Pacto activo aparece 🕊 «Quitar el Pacto» (con el Pacto gastado sigue el 😇 de renovar, nunca
  los dos). Pide confirmar («¿Le quitás el Pacto a Blanco J1? Sin el Pacto, si su vida llega a 0 no revive solo…»; el jugador: «¿Dejás el Pacto…?»),
  deja la línea en la Mesa («😇 El GM le quitó el Pacto a Blanco J1» / «😇 Blanco J1 dejó su Pacto») y a Jugador 1 le sale «🕊 Sin el Pacto · El GM te
  quitó el Pacto: si tu vida llega a 0, no revivís solo» (`pactoQuitar`, `vtt-hexgrid/js/83`). Probado en «Claude · pruebas 2» con GM y Jugador 1: el GM
  renovó y quitó, Jugador 1 renovó y dejó el suyo, y Cancelar no cambia nada. Blanco J1 quedó sin Pacto, como estaba. 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 👁 Cargar el D4 Control mental y ceguera niveles 2 a 5 y verlos en el mapa** (dueño, 2026-11-19: los cuatro aprobados, «va»). Cargar
  en `comun/creeps-esenciales.js` tal como están en `docs/creeps-humanoides.md` (sección D4), con su prueba de números en `comun/pruebas.html`, y cambiar
  sus «Falta cargarlo» por «Cargado». En el mapa ver: Confusión (PdG.Esp contra Res.Mt, el 1d4 al actuar), el combo Punzada mental → Confusión con la
  Res.Mt bajada, la Varita del eclipse (25 % de Ceguera), el Grito espeluznante (onda de 3, Pánico), el Tótem de silencio (los rivales a 3 sin
  habilidades de SP; romperlo), el Polen somnífero (Sueño; se despierta con daño o si lo sacuden) y el Espejo del Poncho de espejitos.
  *Resultado:* cargados los cuatro (`const D4` en `comun/creeps-esenciales.js`; el Grito con `Combatiente.GRITO_ESPELUZNANTE.nombre`) con su prueba de
  números: **todos coinciden con el diseño** (vida, No2, SP y lo que recupera, Def, Def.Esp, PdG.Esp, Ef.Esp, Eva, Parry, Ini, Mov, Rango, Percepción,
  Res.CC / Res.Esp / Res.Mt y los costos). En «Claude · pruebas 2» con GM y Jugador 1: Confusión (PdG.Esp contra Res.Mt) dejó a Blanco J1 Confundido y en
  su turno, al moverse, «Estás confundido: tirá antes» → 1d4 = 1, decide el GM; Punzada mental (−5, Mente abierta) y después Confusión: su Res.Mt bajó de
  1d8 a 1d6; la Varita del eclipse a la segunda le dejó Ceguera (salió 4 en el d4); el Grito espeluznante dejó con Pánico a Blanco J1 b y a la Abeja de
  prueba; el Tótem de silencio (40 de vida a nivel 4) frenó «Arma elemental» de Blanco J1 («Usarla igual / Cancelar») y se rompió de un cuchillazo («Rompieron
  … se termina el silencio»; se le bajó la vida a 6 antes, para no pegarle cuatro veces); el Polen somnífero lo durmió y lo despertaron el sacudón de
  Blanco J1 b (1 No2) y, otra vez, la Punzada mental; el Espejo del Poncho le devolvió 1 a Blanco J1 de una varita de chispa. **Arreglado**: el tótem recién
  clavado le daba a Blanco J1 b «👂 Pasos a tu espalda» (un objeto no camina; duda chica en P247). 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 🔮 El d6 del Orbe salvaje, a la vista y con «Elegir manualmente»** (dueño, 2026-11-19: «la solución sería que esta tirada no fuera
  automática»). Hoy el d6 se tira por atrás junto con el daño (`talSalvajeRodar`, vtt-hexgrid/js/53, desde el gancho `orbeSalvaje` de comun/duelo.js) y
  el «Elegir manualmente» del daño no lo toca. Que sea su propio paso en el cuadro del duelo, como las otras chances (`chanceDuelo` de js/78): después
  de tirar el daño, si quien atacó lleva el Orbe (común o domado), «🔮 Orbe salvaje · 🎲 Tirar 1d6» para quien maneja al atacante (el GM por un creep o
  por quien no está), con su «✍ Elegir manualmente», el dado rodando y el resultado (6: ×2, el domado ×3; 1: le entra también a quien atacó; 2–5:
  nada); recién ahí se aplica el daño. Probarlo en el mapa eligiendo a mano el 1 y el 6, con el común y con el domado (el aviso del 1 ya existe).
  *Resultado:* al tirar el daño especial, en el paso Daño del mismo cuadro aparece el recuadro «🔮 Orbe salvaje» (qué hace cada número) y el botón
  violeta «🔮 Orbe salvaje · 🎲 Tirar 1d6» para quien maneja al atacante (al GM, «por Blanco J1»; con un creep, solo el GM), con «✍ Elegir manualmente»
  (un número del 1 al 6: el dado rueda igual y cae ahí). El d6 rueda en todas las pantallas, queda en la Mesa, y recién después sale la cuenta y
  «💔 Aplicar el daño» («🔮 Orbe salvaje ×2: 6 → 12»). Mismo camino que el daño de elemento pendiente (`comun/duelo.js`, `tirarSalvaje`). Probado en
  «Claude · pruebas 2» con GM y Jugador 1, a mano, con la Varita arcana: Blanco J1 con el común (6: 6 → 12; 1: 5 al creep y «Te entraron 5…» a Blanco
  J1) y el domado (6: 6 → 18; 1: lo mismo), y el Blanco creep (tira el GM) con el común (1: «A Blanco creep le entró 1…»; 6: 1 → 2) y el domado (6: 5 → 15;
  1). Orbes y varita devueltos. 875 pruebas en verde.
- **✅ hecho (2026-11-19) — 🎲 El daño de las zonas sin tirada de quien la creó lo tira el dueño de quien la creó** (dueño, 2026-11-19, bloque 4 de
  `auditoria-tiradas.md`, #9: «prefiero que lo tire el propietario de quien creó la zona»). Hoy, en el cartel de las zonas sin tirada de quien la creó
  (las del GM, de trampas con número fijo, el hielo por pasos, la que solo se «Aplica»), si el que entra no resiste, el dado del daño sale solo. Que lo
  tire, con su botón y los dados a la vista, quien maneja a quien creó la zona: el GM si la creó él, un creep o una trampa del GM; el jugador (o quien
  tenga 🎮 el control) si la creó su personaje o la trampa de su personaje. Si no está conectado, el GM puede tirar por él (como en el resto de las
  tiradas). Probar en el mapa con una zona del GM y con una de un personaje.
  *Resultado:* si el que entra no resiste (o toca «Aplicar»), el daño se abre en el cuadro del duelo de siempre (`danoDuelo`): «🎲 Tirar el daño ·
  1d6» le sale a quien maneja a quien creó la zona (el GM por las suyas, sus creeps y sus trampas; el jugador, o quien tenga 🎮 el control, por su
  personaje o su trampa), con los dados 3D en todas las pantallas; el GM puede «Tirar a mano» por el ausente, y el que lo recibe toca «💔 Aplicar el
  daño» con la cuenta a la vista. El cartel de la zona vuelve con «4 de daño de fuego (lo tiró GM; entraron 3)» (`zonaDanoQuien`, `vtt-hexgrid/js/08`).
  Se mantiene la Suela gruesa (ahora también en el duelo). Probado en «Claude · pruebas 2» con GM y Jugador 1: una zona del GM sobre Blanco J1 (tiró el
  GM) y una de Blanco J1 sobre el Blanco creep (tiró Jugador 1). Videos del dado rodando. Casos raros en P245. 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🎲 La chance del estado de una zona, a la vista** (dueño, 2026-11-19, bloque 4 de `auditoria-tiradas.md`, #19: «aunque se
  tire sola, debe aparecer la instancia de chance de que salga, se debe ver el dado rodando y el resultado, en el menú que sea»). *Resultado:* sigue saliendo
  sola, pero ahora en el cartel de la zona: «Chance de que entre Veneno · 50 %: sale con 4, 5 o 6 en 1d6», «El dado: rodando…» mientras ruedan los dados
  3D (en todas las pantallas, por la Mesa), y cuando quedan quietos «Salió 4 → ¡Entra Veneno!» o «No entra» (`zonaChanceAVista`, `vtt-hexgrid/js/08`). La
  Crónica de los demás lo cuenta («Veneno 50 %: salió 1 → no entra»). El daño de esas zonas no se tocó (#9, espera respuesta). Probado en «Claude · pruebas
  2» con una zona del GM (Veneno 50 %) y Blanco J1 entrando: salió y no salió. Video para el dueño. 873 pruebas en verde.
- **✅ hecho (2026-11-19) — 😇 Renovar el Pacto desde el mapa** (dueño, 2026-11-19: «me gustaría que el jugador también pueda reactivar su pacto desde el
  mismo botón del mapa»). *Resultado:* (1) en el menú del token de un personaje (el ⋯), con el Pacto gastado, un 😇 «Renovar el Pacto» para el GM y para el
  jugador dueño: pide confirmar, marca el Pacto en su ficha, deja la línea en la Mesa («😇 El GM le renovó el Pacto a Blanco J1» / «😇 Blanco J1 renovó su
  Pacto») y al jugador le sale al centro «Un nuevo Pacto: Una entidad espiritual te brindó un nuevo Pacto…» (`pactoRenovar`, `vtt-hexgrid/js/83-pacto.js`).
  (2) En la ficha, pasar «😇 Pacto» de No a Sí abre «El Pacto lo renueva el GM cuando la historia lo da. ¿Lo cambiás igual?»; Cancelar lo deja en No, «Sí,
  cambiarlo» lo activa con la misma línea en la Mesa (`pactoCambioAMano`, `ficha-personaje/js/06`). Gastarlo sigue automático. Los textos, en
  `Combatiente` (`pactoRenovadoTxt`, `PACTO_AVISO`, `PACTO_A_MANO`). Probado en «Claude · pruebas 2» con GM y Jugador 1 (las dos renovaciones desde el
  mapa y el cartel de la ficha). Dudas chicas en P244. 874 pruebas en verde.
- **✅ hecho (2026-11-19) — 🪧 Andanada arcana: el cartel «¿a quién va el siguiente misil?» queda tapado** (dueño, 2026-11-19: «habría que
  corregirlo»). *Resultado:* el cartel ahora espera a que el cuadro del misil anterior se cierre (solo a los 10 s, con «Listo, cerrar» o
  minimizándolo) y recién ahí sale, con el mapa a la vista (`misilSiguiente`, `vtt-hexgrid/js/13-tokens-portal-duelo.js`; vale también para las
  Varitas de misiles). Probado en «Claude · pruebas 2» con el Arcano 4: tres misiles (dos a Blanco J1, uno al Blanco creep), los carteles «misil 2 de
  3» y «misil 3 de 3» salieron limpios. 873 pruebas en verde.
- **✅ hecho (2026-11-19) — 🦶 Intercambio arcano contra un rival Inamovible: el recordatorio** (dueño, 2026-11-19, P243 ✅: «con un rival debe
  aparecer el recordatorio de que el rival es inamovible (no debería poder moverlo)»). *Resultado:* **ya cumplía, sin cambios de código.** Arcano 5 →
  Blanco J1 (Botas de estibador): ganó el PdG.Esp (3 contra la Res.Esp 1, a mano) y a Jugador 1 le salió el cuadro «Inamovible: Intercambio arcano:
  Arcano 5 y Blanco J1» con «Inamovible 33 % · funciona con 5–6 · 🎲 Tirar el efecto (1d6)». Con el Inamovible que aguanta (✍ «Funcionó»): «¡Inamovible!
  No lo mueven» y «Blanco J1 es Inamovible (33 %): no se mueve nadie» en la Mesa y la Crónica; los dos quedaron en su casilla. Con un 1 (prueba del
  2026-11-19) los cambió. Con un aliado no se tira (como antes). Para mirar (no es de esta tarea): el cartel verde grande del cuadro dice «no hay nada
  que resistir: se aplica» antes de tirar la chance, y puede confundir.
- **✅ hecho (2026-11-19) — 📺 Animación del Intercambio arcano** (dueño, 2026-11-19: «me gustaría la animación en ambos tokens de old time tv turn
  on/off»). *Resultado:* los dos tokens se apagan como un televisor viejo y se prenden cada uno en la casilla del otro, a la vez y en todas las pantallas
  (un solo momento con los dos: `blinkTvPublicarVarios`, `vtt-hexgrid/js/111-parpadeo-tv.js`; lo usa `cambiarLugarResuelto` de js/107 solo para el
  Intercambio: «Cambiar de lugar» sigue con su cruce en arco). Sin estela (no caminan); si el cuadro del duelo está abierto, se repliega mientras dura y
  vuelve. Probado en «Claude · pruebas 2» (GM + Jugador 1): a un aliado (el Blanco creep) y a un rival (Blanco J1 b). Video para el dueño. 873 pruebas
  en verde.
- **✅ hecho (2026-11-19) — ✨ Animación de la Lanza arcana** (dueño, 2026-11-19: «me gusta así»). *Resultado:* `vtt-hexgrid/js/120-lanza-fx.js`, en todas
  las pantallas: la carga (brillo violeta que crece en el Arcano, medio segundo), la lanza de luz que recorre la línea hasta el final del alcance con su
  estela que se apaga, y un estallido de chispas violetas en cada token que atraviesa (sin frenarse); la cascada de duelos arranca cuando ya se vio. Al
  que no la esquivó, un destello blanco de un segundo (Deslumbrado; si el cuadro del duelo está abierto, se aparta mientras dura); al que la esquivó,
  nada. Probado en «Claude · pruebas 2» con el Arcano 2 y en la línea Blanco J1, el Blanco creep (su aliado) y Blanco J1 b: los dos primeros no la
  esquivaron (destello y Deslumbrado); Blanco J1 b ganó la Evasión, se corrió de la línea y no tuvo destello. Video para el dueño. 873 pruebas en verde.
- **✅ hecho (2026-11-18) — 🏹✨ Lo que quedó sin ver en el mapa del Hunter (R4 nv2–5) y el Arcano (M4 nv2–3)** («Claude · pruebas 2», mapa
  «Prueba · R4 M4», GM + Jugador 1; Jugador 1 tiene ahora un segundo personaje, «Blanco J1 b», para tener dos rivales):
  - [x] ✨ Lanza arcana atravesando a varios: Arcano 2 en línea recta con Blanco J1, el Blanco creep (su aliado) y Blanco J1 b: un solo PdG.Esp y un
    solo daño (8, «el mismo para todos»), los tres tiraron Evasión, el aliado también entró, y los tres quedaron Deslumbrados.
  - [x] 🏹 Abanico (Hunter 5) con el Hunter 4 (aliado) adentro del cono y dos rivales: el área tomó solo a Blanco J1 y Blanco J1 b (el aliado, nada);
    un PdG para los dos (1d6+1d8+1) y el mismo daño (11).
  - [x] 📏 Largo alcance arcano: la Lanza del Arcano 2 llegó a Blanco J1 b a 6 casillas (sin la pasiva, el Rango es 5).
  - [x] 🎯 Puntería: el PdG del Hunter 4 es 14 con Destreza 13 (el Hunter 3, sin la pasiva, 12 con Destreza 12). **Arreglado de paso:** la 🔍 decía
    «Sin modificadores» (la cuenta sí la sumaba); ahora dice «Puntería (pasiva · PdG) +1» (`CreepCalculo.aportesMod` suma las pasivas).
- **✅ hecho (2026-11-18) — 🏹✨ Hunter (R4) niveles 2 a 5 y Arcano (M4) niveles 2 y 3, cargados y vistos en el mapa** («Claude · pruebas 2», mapa
  «Prueba · R4 M4», GM + Jugador 1 con clics en las dos pantallas). 871 pruebas en verde.
  - [x] Tiro que derriba (Hunter 2): pegó, «Empujón» 1 casilla y Sentado en el personaje.
  - [x] Mina del cazador (Hunter 3): el aviso «trampa a la vista de un rival» si la pone en su cono; Jugador 1 pisó el centro: 2d6+2 = 9 directo a
    la vida y Res.CC 2 contra 12 (la Destreza del Hunter 3) → Pajaritos 2 turnos.
  - [x] Cebo (Hunter 4): «Algo brilla…»; Res.Mt contra 13 (su Destreza), perdió, caminó 2 hacia el brillo y lo dio vuelta («puto el que lee»).
  - [x] Abanico (Hunter 5, mirando al personaje): PdG 1d6+1d8+1 contra la Evasión, el daño de su arma (2d4 + 4).
  - [x] Percepción aumentada (Hunter 2): el personaje, en Sigilo, se acercó por la espalda y el GM recibió «Hunter 2 tiene la sensación de que lo
    observan… Tirá la Percepción» (sin la pasiva, la espalda es punto ciego).
  - [x] Lanza arcana (Arcano 2): la línea hasta el personaje, PdG.Esp contra Evasión, 3d6 arcano y Deslumbrado 2 turnos.
  - [x] Portal trampa (Arcano 3): Jugador 1 no lo veía; al pisarlo, Res.Esp 8 contra 16 (su Ef.Esp) → «Atravesar el portal», llegó a la casilla
    marcada (4 más allá) y Expuesto 1 turno.

- **✅ hecho (2026-11-18) — 🔀 Intercambio arcano programado y el Arcano niveles 4 y 5 cargados** (dueño, 2026-11-18: «me gusta esta. habría que
  programarla»). *Resultado:* la habilidad está en `comun/skills-creep-base.js` (Mago, auditada): a cualquiera en su Rango; a un aliado le entra directo
  (como la Mala sombra), a un rival su PdG.Esp contra la Res.Esp; si entra, el mapa del GM los cambia de lugar con el mismo mecanismo y la misma
  animación que «Cambiar de lugar» (sin ataques de oportunidad). 5 SP fijos y 2 No2, o cooldown 3. M4 nv4 y nv5 cargados como en `creeps-humanoides.md`
  (los números del diseño, en la prueba automática). Probado en «Claude · pruebas 2» (GM + Jugador 1): a un aliado (el Blanco creep) cambiaron de lugar
  sin tirada; a Blanco J1, 8 contra 5 → cambiaron; con la Res.Esp de J1 en 30 (✍ Elegir manualmente) → «lo resistió» y no se movió nadie. 872 pruebas
  en verde. **Duda anotada** (P243): un aliado Inamovible no tira su chance (sí un rival, como en Cambiar de lugar).
- **✅ hecho (2026-11-18) — ✨ Andanada arcana recosteada, vista en el mapa** (con el Arcano nv4, en «Claude · pruebas 2»): cobró 9 SP fijos (45 → 36),
  cada misil tiró su PdG.Esp y 1d6 + 4 de daño (7, 7, …); el segundo misil repitió blanco (Blanco J1) y el tercero fue a otro (el Blanco creep), con el
  «misil N de 3 — ¿a quién?» después de cada uno. Ojo (para mirar, no es error): el cartel «¿a quién?» sale mientras el cuadro del misil anterior
  sigue abierto unos segundos y queda medio tapado.
- **✅ hecho (2026-11-19) — 🧪 Pruebas en el mapa que quedaron sin hacer** (dueño, 2026-11-18: «ponelo en la cola y una vez que lo pruebes, marcalo como
  probado»). Cada una se tacha acá (✔ con fecha y el resultado en una línea) y en `docs/pruebas-en-el-mapa.md` apenas queda probada:
  - [x] ✔ 2026-11-19 🌑 Mala sombra desde la Botonera (Blanco J1 con la habilidad de clase): a un rival (Arcano 5) PdG.Esp 3 contra Res.Mt 8 → «lo resistió»; a un aliado (Blanco J1 b) entró directo, sin tirada → «Mala sombra (2)».
  - [x] ✔ 2026-11-18 🎯 Punto débil dejando la resistencia a crítico en negativo — Aguja siniestra (Maldito 1) a un creep sin resistencia y
    Ráfaga de cortes (Tipo 6): el cuadro muestra «Tipo 6 − Crítico frecuente 2 − 💢 Punto débil 1 = 3», el cuadradito violeta 💢 y una diferencia de 3 ya es crítico.
  - [x] ✔ 2026-11-19 🫨 Arrastrar → Desequilibrado: el Peleador de control 5 enganchó a Blanco J1 b (un personaje), lo trajo 2 casilleros y quedó Desequilibrado (−2 Evasión); con su turno en el orden, el ▶ Siguiente del GM se lo sacó. Ojo: quién quedó Desequilibrado lo recuerda el navegador del GM; abriendo el mapa en otro navegador no se va solo (se probó: quedó puesto).
  - [x] ✔ 2026-11-19 🌀 El Remolino con dos rivales (Blanco J1 entre el Arcano 4 y el Arcano 5): «¿te movés en el giro?» → su casilla → «elegí al primero» → un duelo por cada uno, de a uno (al Arcano 5, crítico ×2).
  - [x] ✔ 2026-11-19 🔥🐝 El Arma elemental en una invocación: **había un error y se arregló**: a la invocación le llegaba «🔥 Arma ígnea» como un estado sin su golpe (las invocaciones no publican sus armas, el nombre lleva el ícono y no se encontraba el preset) y no sumaba nada. Ahora (`FichaAcciones.estadoDeSpec` busca por el nombre de base, como con los creeps): la Abeja de prueba pegó con el Cuchillo, «🔥 Tirar el daño de fuego · 1d6» y «+ 3 de fuego directo = 10 en total».
  - [x] ✔ 2026-11-19 🦶 Inamovible con el cartel nuevo: Intercambio arcano del Arcano 5 a Blanco J1 (Botas de estibador): «Blanco J1 es Inamovible (Botas de estibador, 33 %): sale con 5 o 6 en 1d6» → salió 1 → los cambió.
  - [x] ✔ 2026-11-19 ⏱ Recuperarse rápido: a Blanco J1 b (Tobilleras de vendaje) le llegó Inmovilizado 2 turnos → a Jugador 1 «🎲 Tirar 1d6» → «Recuperarse rápido (Tobilleras de vendaje, 50 %)» salió 4 → Inmovilizado 1 turno. (Sentado sin turnos no lo dispara, a propósito: solo lo que tiene turnos.)
  Probar en «Claude · pruebas 2» mientras el dueño use «Claude · pruebas».
  (2026-11-19, Claude: en «Claude · pruebas 2» quedaron armados para eso: Blanco J1 con Mala sombra, Remolino, Arma elemental, las Botas de estibador
  y la invocación «Abeja de prueba»; Blanco J1 b con las Tobilleras de vendaje; el Peleador de control 5 en el mapa «Prueba · R4 M4».)

- **✅ hecho (2026-11-18) — ❤ La Vida extra como vida también en la ficha, GM Tools y los Tableros** (dueño, 2026-11-18: «sí», a que la ficha también
  muestre 100/35). *Resultado:* `Combatiente.vidaExtraDe(estados)` (ficha, creep y resumen público). La ficha muestra en la caja de vida el total
  (vida + Vida extra) sobre el máximo real, con un detalle chico «(❤+65 de Vida extra)»; al entrar a escribir, la caja muestra la vida sola (lo que se
  escribe o suma es la vida, como siempre) y al salir vuelve al total. Igual en la caja de HP de la tarjeta del creep en GM Tools, el Tablero (GM Tools
  y mapa) y el Ver del creep. Probado en «Claude · pruebas 2»: ficha de J1 con Vida extra 65 → «100 / 35 (❤+65 de Vida extra)» (al enfocar 35, al
  salir 100); creep con Vida extra 20 → «50 / 30» (al enfocar 30). 871 pruebas en verde.

- **✅ hecho (2026-11-18) — ❤ La Vida extra se muestra como vida** (dueño, 2026-11-18, con captura del salto a Bizzante: «0 de daño le va a entrar a la vida»
  con «− Vida extra 4»: «está comunicado raro. La vida extra es como si tuvieras un valor de vida por encima de tu máximo… tiene que decir que entró
  4 de daño, tu vida pasó de X a Y, y el resultado final Y/(tu máximo real); como quedó hoy Bizzante debería mostrar 100/35»).
  La vida que se muestra = vida + Vida extra, sobre el máximo real (35 + 65 = **100/35**). En la cuenta del daño: «4 de daño entra a la vida ·
  104/35 → 100/35» (sin el renglón «− Vida extra … se la lleva a ella»), y el número grande dice 4, no 0. Lo mismo en todo lo que muestra la vida
  después de un golpe: el cuadro del duelo, las trampas y zonas, la Mesa, el aviso del salto del rayo, el círculo de vida del token, la ficha lite,
  la Botonera y la ficha (revisar dónde se ve la vida). Lo demás no cambia (la Vida extra se gasta primero, como hoy). Probar en «Claude · pruebas 2».
  *Resultado:* `Combatiente.vidaConExtra / vidaCambioTxt / danoAVida` (comun/combatiente.js) y `resolverGolpe` (js/10) devuelve la Vida extra de antes
  y después (+ el máximo). El cuadro del duelo (vista previa y resultado), la Mesa, la cuenta (sin el renglón «− Vida extra»), las trampas (js/19), el
  salto del rayo (js/10, js/110) y el toast del golpe muestran «N de daño · vida 104/35 → 100/35». El círculo del token ya sumaba la Vida extra
  (2026-11-09). Probado en «Claude · pruebas 2»: personaje de J1 con Vida extra 10 (vida 15/5 → 11/5, «4 de daño») y Rata C con 65 (95/30 → 93/30).
  Sin tocar: la ficha (sus números de vida y el ❤+N aparte).

- **✅ hecho (2026-11-18) — ⚡ La cadena de rayos: no cortarse en un invulnerable, y la secuencia de a uno** (dueño, 2026-11-18, probando Cadena de rayos del
  Mago del rayo nv5 sobre Rockardo en «Prueba · Tormenta y Meteoro»: «debería haber saltado a Bizzante y a Larry»).
  **Lo que pasó** (visto en los datos): el golpe a Rockardo hizo 8; saltó a Bizzante, que estaba Titilando (invulnerable, recién salvado por el
  Pacto) → «Bizzante −0 (salto)»; y la cadena se cortó ahí, porque cada salto es la mitad de lo que ENTRÓ (0), así que no siguió a Larry.
  (1) **El salto se calcula sobre lo que llegaba, no sobre lo que entró:** 8 → 4 → 2 → 1, aunque uno lo frene (invulnerable, resistencia, escudo).
  (2) **La secuencia** (pedido del dueño): el que lanza tira el rayo → elige objetivo → el cuadro del duelo (PdG, Evasión, daño…). Recién ahí, si va
  a saltar: el cuadro se minimiza, se ve la animación de TODOS los saltos que van a pasar (uno tras otro) y después se abre, de a uno, el
  «Aplicar el daño» de cada alcanzado por el salto, y su tirada de Parálisis si corresponde (Varita de chispa, Arma eléctrica…). Vale para toda
  cadena de rayo (Cadena de rayos, varitas, Arma eléctrica, Escudo elemental). Video de la animación. Probar en «Claude · pruebas 2».
  **Regla del dueño (2026-11-18, con el caso real: Bizzante tenía Vida extra 69, no era invulnerable):** la Vida extra cuenta como vida (si baja, el
  daño entró y la cadena sigue); si lo frena un escudo, el salto sigue igual; un **Invulnerable no se elige como blanco**: el rayo salta al siguiente
  rival elegible. Cada salto, la mitad de lo que llegaba; la línea dice qué pasó («se lo comió la Vida extra 69 → 65», «lo frenó el escudo (4)»).
  *Resultado:* `rayoCadena` (js/10) ya no elige Invulnerables (`rayoInvulnerable`) y la mitad sale de lo que llegaba; `rayoCadenaAplicar` (lo usa el
  Escudo elemental) sigue con lo que llegaba y anota la nota de cada salto (`rayoVidaExtraDe`), que muestran el reporte y la Mesa (js/110). La
  secuencia (`dueloCadenaSecuencia`, js/13; la llaman la Cadena de rayos, el arma con rayo en cadena y el «a mano»): espera que el duelo del golpe
  termine → momento `rayo` (todas las pantallas: aparta el cuadro abierto y anima todos los saltos, js/16) → línea en la Mesa → de a uno, un duelo
  por salto directo en «💔 Aplicar el daño» con el daño ya puesto (`hab.dano.yaTirado`), que aplica el afectado (su jugador, el GM por los creeps), y
  la Parálisis en los efectos de ese mismo cuadro si corresponde. Probado en «Claude · pruebas 2» (GM + J1): saltos 8 → 4 (personaje de J1: aplicó él,
  5 → 1, y tiró la Parálisis) → 2 (Rata C con Vida extra: «la Vida extra se llevó 2», 30 → 30); `rayoCadenaAplicar` con Vida extra 10 en el medio
  (10 → 6 y siguió con 2); `rayoCadena` real con una rata Invulnerable pegada (no la eligió, saltó a la otra) y Escudo especial («lo frenó el escudo
  (4)»). Pendiente de verlo el dueño en una sesión real: las varitas y el Escudo elemental con la cadena entera.

- **✅ hecho (2026-11-18) — ☄ El aviso de la sombra del Meteoro** (dueño, 2026-11-18: «cuando alguien castea el meteoro, al seleccionar el área, a las personas
  dentro del área les aparezca una notificación que diga "Una sombra cubre el suelo: algo cae del cielo." Nada más»). Al marcar el centro, a quien
  maneja cada token que quedó adentro (su jugador; el GM por los creeps) le sale ese aviso, con ese texto exacto y nada más (sin nombrar al mago ni
  el daño). Una vez por token. Probar en «Claude · pruebas 2» con las dos cuentas.
  *Resultado:* `meteoroAvisarSombra` (vtt-hexgrid/js/74) al marcar el centro: un momento `meteoro-sombra` (sin tarjeta en la Crónica, js/16) con los
  uids de quien maneja cada personaje/invocación de adentro y el GM si hay creeps; cada pantalla a la que le toca muestra el cartel «☄ Una sombra
  cubre el suelo: algo cae del cielo.» con «Entendido», una vez. Probado en «Claude · pruebas 2»: J1 (su token adentro) y el GM (creeps adentro) lo vieron.

- **✅ hecho (2026-11-18) — ⚡ El salto del rayo, solo a rivales** (dueño, 2026-11-18: «el rayo no salta al propio caster ni siquiera salta a aliados, solo salta a
  rivales»; el ayudante vio que el salto del Arma eléctrica le pegó al propio atacante por ser el más cercano). Todo salto de rayo (Arma eléctrica,
  Varita de chispa, Varita del relámpago, Cadena de rayos, el Escudo elemental eléctrico…) elige solo entre los rivales de quien lo lanzó: nunca él
  mismo ni sus aliados. Ojo: hay una regla vieja del agua («el salto del rayo por un charco llega a todos», js/106 y js/50): no tocarla sin
  preguntar; contar cómo queda. Probar en «Claude · pruebas 2».
  *Resultado:* regla pura `Combatiente.rayoSaltaA` (con prueba automática: 869 en verde) y `rayoCadena` (js/10) recibe `lanzador`: nunca salta a quien
  lo lanzó ni a sus aliados, solo a sus rivales. Cubre todo lo que pasa por `dueloCadena` (js/13: Arma eléctrica y el elemento de un arma, varitas y
  habilidades con `cadena` —Varita de chispa, del relámpago, Cadena de rayos— y el Escudo elemental eléctrico, donde «lanzador» es el portador del
  escudo) y las flechas que saltan (js/33). **El agua no cambió**: en un charco el salto sigue llegando a todos los que están parados en él (también a
  quien lo lanzó y sus aliados), y el rayo que corre por el agua (js/50, `soloAgua`) tampoco. Probado en «Claude · pruebas 2»: Rata A (Arma eléctrica)
  le pega a Rata B, con Rata A y Rata C (aliada) pegadas y un blanco personaje a 2 → el salto fue al personaje (antes iba a Rata A).

- **✅ hecho (2026-11-18) — 🔧 Dos restos del daño de elemento separado** (2026-11-18, del ayudante, commit cd6ab2ff): (1) el botón del primer paso todavía
  dice «Tirar el daño · … + 🔥 +1d6 fuego» (lo arma la página del atacante): que diga solo el daño del arma, porque el elemento ya se tira aparte;
  (2) con un arma eléctrica (Arma eléctrica) el duelo no llegó al cierre en la prueba, probablemente por el salto al más cercano: revisar y probar
  con un segundo blanco cerca. Probar en «Claude · pruebas 2».
  *Resultado:* (1) el botón del primer paso ya dice solo el daño del arma («🎲 Tirar el daño · Dientes de rata · 1d4 + 6»): se sacó el «+ ⚡1d6…»
  de la vista previa en `comun/ficha-duelo.js` y `comun/creep-duelo.js`. (2) No era un error del arma eléctrica: la prueba anterior se cortaba porque
  el script no tocaba «🎲 Tirar el efecto (1d10)» (la Parálisis 20 %) ni el «Entendido» del cartel del salto. Probado en «Claude · pruebas 2» con
  tres ratas: PdG → Evasión → daño del arma → «⚡ Tirar el daño eléctrico · 1d6» → Aplicar → efecto → salto → resumen del duelo en la Mesa. Duda:
  el salto del rayo le pegó también al propio atacante (Rata A −1/−2) por ser el más cercano: ¿el rayo puede saltar a quien lo lanzó?

- **✅ hecho (2026-11-18) — 🔥❄⚡ El daño de elemento de un arma, en su propia tirada y con dados de su elemento** (dueño, 2026-11-18: «sí», a separar como el
  Meteoro). Hoy el daño elemental de un arma o una flecha (Arma elemental, flechas con fuego, varitas con daño físico + elemental, lo que use el
  extra de elemento) sale junto con el daño del arma en una sola tirada. Que sean dos pasos: primero «🎲 Tirar el daño (…)» del arma y después
  «🔥/❄/⚡/🧪/☠/☀/🌑 Tirar el daño de <elemento> (…)», cada uno con su recuadro, su número y su línea en la Mesa; los dados 3D del elemento con un
  estilo de su color (fuego ya existe, del Meteoro, commit 8a91a02c; buscar o armar los otros: hielo, rayo, ácido, tóxico, luz, siniestro). La cuenta
  de cada uno como siempre (lo físico con la Defensa; el elemento con su resistencia). Ojo con el crítico: el multiplicador hoy alcanza a todo el
  daño: no cambiarlo, solo mostrarlo bien en los dos. Video corto de los dados de 2–3 elementos. Probar en «Claude · pruebas 2».
  *Resultado:* `comun/duelo.js`: al guardar el daño del arma, el elemental queda pendiente (`dano.magico.pend`) y el cuadro muestra su propio paso
  «🔥/❄️/⚡… Tirar el daño de <elemento> · 1d6» (quien atacó, o el GM por él); se tira con los dados 3D del juego de su elemento (fuego → fire,
  hielo → ice, rayo → lightning, ácido → acid, tóxico → poison, luz → radiant, siniestro → necrotic), va a la Mesa en su línea y recién con los
  dados quietos se anota y se puede aplicar (aceptar / reclamar / la vista previa esperan). El Orbe salvaje se tira en ese momento. Cubre todo lo
  que un arma suma como daño elemental (`danoMagico` con dado en sus efectos al golpear): Arma elemental, flechas con elemento, armas con
  rayo/hielo. Las habilidades (varitas, hechizos) no cambian: su daño ya es una sola tirada; el Meteoro sigue con sus dos pasos. Probado en
  «Claude · pruebas 2» (Rata A con Arma ígnea / helada / eléctrica contra Rata B): los dos pasos en los tres, con dados de fuego, hielo y rayo;
  868 pruebas en verde. Dudas: el botón del primer paso sigue diciendo «Tirar el daño · … + 🔥 +1d6 fuego» (lo arma la página del atacante);
  con el arma eléctrica, el duelo no llegó al cierre en la prueba (el salto al más cercano: no revisado).

- **✅ hecho (2026-11-18) — ☄🔥 Meteoro: dos tiradas bien claras (físico y fuego), con dados de fuego** (dueño, 2026-11-18, con captura: «tirar todo junto el
  daño físico y el de fuego no me gusta. Deberían ser dos tiradas bien claras. Y si a los dados del daño de fuego le pudieras sumar algún efecto ígneo
  en su animación 3D, mejor»). Hoy un solo botón tira 4d6 y 2d6 juntos. Que sean **dos pasos**: «🎲 Tirar el daño físico (4d6)» y, después,
  «🔥 Tirar el daño de fuego (2d6)», cada uno con su recuadro y su resultado (los dos una sola vez para todos, como ahora). En los dados 3D del
  fuego, un estilo ígneo (color brasa/llamas, brillo o chispas). Revisar si los demás daños con un extra de elemento (`dano.extra`) usan el mismo
  camino y contarlo (no cambiarlos sin preguntar). Video corto de los dados de fuego. Probar en «Claude · pruebas 2» (el dueño trabaja en
  «Claude · pruebas»).
  *Resultado:* quien lo lanzó tira primero «🎲 Tirar daño físico · 4d6» (su cuadro, su número) y después «🔥 Tirar daño de fuego · 2d6» (otro cuadro;
  los dados 3D con el colorset de fuego de la librería, `{c:'fire'}`: `hab.dadosEstilo` en comun/duelo.js → `r.estiloDados` → comun/mesa.js); entre
  tirada y tirada queda el resultado a la vista 2,8 s. Los dos totales viajan a cada afectado como antes (`yaTirado` + `extra`). Probado en «Claude ·
  pruebas 2» (Rata A lanza sobre B y C): 4d6 = 17 y 2d6 = 8 en la Mesa, el del fuego con estilo fire; a cada rata 17 − Def 1 + 8 = 24. Otros daños
  con un extra de elemento (sin cambiar): el daño elemental de un arma o una flecha (efectos `danoMagico`, Arma elemental) se tira junto con el daño
  del arma, en la misma tirada (comun/duelo.js, `m.dano.magico`).

- **✅ hecho (2026-11-18) — 🏁 Los duelos terminados se cierran solos** (dueño, 2026-11-18, al abrir la compu después de las pruebas de la noche: el mapa
  lleno de tiras de duelos ya terminados —«Pegó: Bruto → Rockardo · ver», «Meteoro · el daño: 25 · ver», «Sanador: sigue adentro · ver»…— y un
  cuadro con «🏁 LISTO · Listo, cerrar»). Pedido: **un duelo terminado se cierra solo a los 10 segundos** (como si se tocara «Listo, cerrar»), y su
  tira minimizada también desaparece sola; **siempre que se pueda volver a abrir desde la Mesa** («🔍 Ver detalle del duelo» en su línea; revisar que
  todo duelo terminado —también los de área, Tormenta, Meteoro, trampas, chances— tenga esa línea con su botón). Mientras corre la cuenta, que se
  vea («se cierra en 10 s», y si se toca el cuadro, se queda abierto). Un duelo que todavía espera algo NO se cierra.
  Al probar: NO en «Claude · pruebas» mientras el dueño la use (comparte la cuenta del GM): en otra partida de prueba o cuando el dueño lo diga.
  *Resultado:* `comun/duelo.js`: el cuadro terminado (o cancelado) muestra «Se cierra solo en N s · tocá el cuadro para dejarlo abierto» y a los 10 s
  se cierra (`autoCierreArmar`); tocarlo lo deja abierto («Queda abierto»); solo arranca si terminó mientras esa pantalla lo miraba (uno reabierto
  para revisar no se cierra solo). Las tiras de duelos terminados se van a los 10 s (`RESUELTO_VISIBLE_MS`, con un redibujo programado). La Mesa ya
  tenía «🔍 Ver detalle del duelo» en todo duelo con su resumen (las trampas y las chances con cartel propio no son duelos: tienen su línea en la Mesa
  y la Crónica; el «¿Esquiva?» y la tirada de proyectiles de la Tormenta/Meteoro cuentan con sus líneas). Probado en la partida nueva «Claude ·
  pruebas 2» (GM + J1, tres ratas): en curso, a los 12 s sigue abierto; terminado, la cuenta en las dos pantallas y a los 11 s cerrado sin tiras;
  «Ver detalle del duelo» abre el resumen; tocado, a los 12 s sigue abierto. Capturas `scratchpad/auto/`.

- **✅ hecho (2026-11-18) — 💥 Todas las áreas: una sola tirada de daño para todos** (dueño, 2026-11-18: «sí», a la pregunta de pasar las demás áreas a una
  tirada como el Meteoro). Bola de fuego, ondas, conos, varitas de área y cualquier hechizo/habilidad de área con un daño común: quien la lanza tira el
  daño UNA vez y a cada afectado se le aplica ese resultado con lo suyo (Defensa / Def.Esp / resistencia al elemento), de a uno con su cuenta, como
  el Meteoro (js/118, commit a7a6694f). La Tormenta queda como está (cada uno su Nd4). Ojo con los daños que dependen del objetivo (la diferencia de
  tiradas, «la mitad si resiste», críticos): contarlo y no inventar. Probar en el mapa con capturas.
  *Resultado:* el daño que tira quien la lanzó contra el primero al que le pega queda en el área (`hab.danoCompartido`, adentro de `hab` porque las
  reglas de `areas` no aceptan campos nuevos; js/13 `dueloGrupoResuelto`) **sin lo de ese objetivo** (`dano.tiroBase`, comun/duelo.js) y los
  siguientes lo reciben ya tirado (`hab.dano.yaTirado`, el mismo camino del Meteoro): solo «Aplicar el daño», con su cuenta y lo de cada uno (la
  Presa, el miedo, el estandarte… `sumarModsDelObjetivo`; y al aplicar, su Def.Esp/Defensa/resistencia). Línea en la Mesa: «💥 Bola de fuego: el daño
  (N) es el mismo para todos los que alcanza». Vale para toda área/onda/cono/línea/varita de área con daño. **Quedan como estaban:** «la
  diferencia» (Drenar: depende de cada uno), los misiles repartidos (cada misil su tirada), la Tormenta y el Meteoro (su secuencia, js/118) y las
  zonas con duelo (se vuelven a tirar contra cada uno, js/112). Probado en el mapa con la Bola de fuego del Piromante sobre tres creeps: el primero
  tiró 2d6+4 = 12 y al Martillero y al Sanador les llegó «2d6+4 (una tirada para todos)» = 12 (+2 de la Botella con un diablito) − Def.Esp 4 = 10,
  sin botón de tirar. 868 pruebas en verde.
- **✅ hecho (2026-11-18) — 🏁 Devolver gentileza: sin el «FIN DEL DUELO» mientras se pregunta** (dueño, 2026-11-18: «sacalo»). En el cuadro del duelo, debajo de
  «¿Contraatacás? (Devolver gentileza)», ya aparece «🏁 FIN DEL DUELO · Ya no queda ninguna reacción por resolver»: que no aparezca hasta que se
  conteste (revisar lo mismo con la pregunta del Contraataque). Captura en `scratchpad/noche/h4/m04-GM.png`.

  *Resultado:* mientras el cuadro muestra «¿Contraatacás?» (Devolver gentileza o el Contraataque) o «está decidiendo…», no aparece el cartel
  «🏁 FIN DEL DUELO»; sale recién al contestar (comun/duelo.js, `esperaContra`). Probado en el mapa: Hachero contra el Escudero (con la pasiva),
  Parry y Bloqueo ganados → la pregunta sin el cartel de fin; con «No», aparece el fin.
- **✅ hecho (2026-11-18) — ☄ El daño del Meteoro, una sola tirada** (dueño, 2026-11-18, probándolo: «me pide que tire el daño una vez por cada objetivo
  afectado. La tirada de daño debería ser una sola, y después se calcula cuánto daño le pasó a cada afectado de acuerdo a sus resistencias»).
  Quien lo lanzó tira **una vez** (4d6 físico + 2d6 de fuego) y a cada uno que quedó adentro se le aplica ese mismo resultado con lo suyo (la Defensa
  al físico, la Res. fuego al fuego), de a uno como ahora («Aplicar el daño» con la cuenta de cada uno). Revisar si las demás áreas con un daño para
  todos (Bola de fuego, ondas, conos, varitas de área) tiran una vez o por objetivo, y contarlo (la Tormenta es distinta: cada uno su Nd4).
  Probar en el mapa cuando el dueño no lo esté usando.
  *Resultado:* después de la ronda de «¿Esquiva?», quien lo lanzó tira **una sola vez** «🎲 Tirar de daño · 4d6+2d6» (un cuadro de una tirada, como
  los proyectiles de la Tormenta; la Mesa dice «4d6 = 16 físico + 2d6 = 9 de fuego — el mismo para todos») y a cada uno le llega ese resultado ya
  tirado (`hab.dano.yaTirado`, comun/duelo.js; js/118): solo queda «Aplicar el daño» con su cuenta. Probado en un mapa propio con un Martillero
  (Defensa 8) y un Sanador (Defensa 2) bajo el mismo meteoro: 16 físico + 9 de fuego → 17 y 23 a la vida (la diferencia es la Defensa).
  **Las otras áreas** (Bola de fuego, ondas, conos, varitas de área): comparten la tirada de ataque (PdG / PdG.Esp) pero cada objetivo tira su
  propio daño en su cuadro. No lo cambié: queda como pregunta para el dueño.

- **✅ hecho (2026-11-18) — ☄🖼 La sombra del Meteoro más visible, y el texto del fondo del mapa** (dueño, 2026-11-18): (1) la sombra que deja el Meteoro
  hasta que cae se ve poco sobre una imagen de fondo: que se note más (más oscura o con borde, que se vea sobre cualquier fondo); (2) en 🗺 Mapas →
  🖼 Fondo, antes de cargar la imagen dice solo «La imagen se achica sola…»: que avise que después se puede cambiar el ancho en casillas y moverla
  con el mouse para acomodarla a la grilla.
  *Resultado:* (1) la sombra es más oscura, las casillas se tiñen de un rojo brasa que late y el borde es grueso, con contraste (negro abajo,
  naranja encima: `bordeHexPunteado` acepta `{solido, ancho, contraste}`, js/50; js/74). Probada sobre la imagen de fondo del mapa del dueño (copiada a
  un mapa propio): se ve clara. (2) El 🖼 Fondo, antes de cargar, dice además que después se puede cambiar el ancho en casillas y moverla con el
  mouse (js/09). De paso, la tira minimizada del daño del Meteoro lleva ☄ en lugar de 🌩.
- **✅ hecho (2026-11-18) — 🧌 Cargar al H4 Bruto que aguanta (nv2–5) y probarlo en el mapa** (dueño, 2026-11-18: «cuando termines de cargar al bruto, probalo»).
  Lo aprobado en `docs/creeps-humanoides.md` (con ¡Tu vieeeeja! 😜 en el nv3, la Coraza de pinchos, Piel de hierro en el nv5), su prueba de números en
  `comun/pruebas.html`, y en el mapa: ¡Tu vieeeeja!, Aguante (contar golpes y el ataque con dados de más), Contraataque, Golpe desesperado, Furia,
  Piel de hierro, las Espinas de la Coraza de pinchos y Mañas de sobreviviente.
  *Resultado:* cargado (niveles 2 a 5, los números del documento dan igual en `comun/pruebas.html`). En el mapa (mapa propio, el Bruto nv5 contra
  Rockardo (copia) del J1, las dos pantallas): **Piel de hierro** + **Aguante** → Defensa 18 y Def.Esp 10 (más el Desafiante después: 20 / 12);
  **¡Tu vieeeeja! 😜** → PdG.Esp 8 contra Res.Mt 2 → Rockardo Provocado y el Bruto Desafiante; Rockardo le pegó con el Mazo del juez (14 − Defensa 20 =
  0): **Aguante contó el golpe** aunque la armadura frenó todo, y **las Espinas de la Coraza de pinchos** le devolvieron 4 a Rockardo (27 → 23); el
  Pajaritos del mazo entró; **Furia** → Enfurecido (PdG 11); **Golpe desesperado** avisó «más de la mitad de la vida: +1 frecuente, +2 potente, +1
  al daño» (Rockardo esquivó). No se vio el Contraataque (el Parry del Bruto perdió por empate) ni Mañas de sobreviviente (no bajó de la mitad).

- **✅ hecho (2026-11-14) — 😜 Provocar de los creeps pasa a llamarse «¡Tu vieeeeja! 😜»** (dueño, 2026-11-14: «dejar provocar y le vamos a cambiar el nombre
  en la versión para creeps»). Solo la habilidad de creep (`comun/skills-creep-base.js`); el **Taunt** de la clase Tanque de los jugadores no cambia.
  Mismo funcionamiento (PdG.Esp + nivel contra la Res.Mt, Provocado 2 turnos, Desafiante). Renombrar en todos los creeps que la usan
  (`comun/creeps-esenciales.js` y donde se nombre: etiquetas, `APLICA`, pruebas, docs vigentes) y que un creep ya guardado en Firebase con «Provocar»
  la siga encontrando (alias del nombre viejo, si el código busca por nombre). Ojo: en la biblioteca de Firebase hay otra, «¡Tu vieeeja!» (tres e,
  la subió el dueño el 2026-10-16 para el escudero kobold: tira Fuerza contra Res.Esp) — no tocarla; avisar si los nombres chocan en algún lado.
  Probar en el mapa que un creep la usa y se ve el nombre nuevo (capturas).
  *Resultado:* renombrada en `comun/skills-creep-base.js` (y su etiqueta), en los 13 usos de `comun/creeps-esenciales.js` y en `comun/pruebas.html`; un
  creep guardado con «Provocar» se renombra solo al cargarse (`Combatiente.migrarLuzSanadora`, `RENOMBRES_LUZ`; la puesta al día de su tirada acepta los
  dos nombres). El Taunt de clase y la «¡Tu vieeeja!» de la biblioteca no se tocaron (los nombres no chocan: tres e contra cuatro y el emoji). Probado
  en el mapa (mapa propio, borrado después): un Escudero nuevo y uno guardado con «Provocar» muestran «¡Tu vieeeeja! 😜» en sus Acciones, y al
  Ejecutar se ve en el cartel de elegir objetivo y en la Mesa. 868 pruebas en verde.

- **✅ hecho (2026-11-13) — 🌩 Tormenta arcana: la ronda de a uno** (dueño, 2026-11-13, probándola: el cuadro del duelo tapaba el cartelito del dodge roll).
  La secuencia:
  1. **Elegir el área viéndola**: mientras se mueve el mouse, la flor ya se dibuja en el mapa siguiendo el puntero; el clic la fija.
     **Vale para todas las habilidades de área** (Meteoro, Orbe, zonas…).
  2. **¿Cuántos proyectiles?**: quien la lanza tira el 1d20 con su botón, en el cuadro del duelo.
  3. **Ronda de «¿Esquiva?»**, de a uno, **en el orden de la iniciativa**: pulso en el token, se despliega su menú Sí / No; «Sí» = el dodge roll de
     siempre (arrastrar hasta 2 casilleros pagando sus No2; si sale del área queda a salvo). Recién al terminar uno se pasa al siguiente.
  4. **La lluvia**: con los que quedaron adentro, una secuencia de rayos que caen al azar sobre los tokens, uno por proyectil, con un contador
     sobre cada token que suma 1 por rayo; al terminar, cada token queda con su número.
  5. **El daño**, de a uno, en el orden de la iniciativa: pulso en el token, menú «Tirá el daño: Nd4» (lo tira quien la lanzó), después
     «Aplicar el daño» (lo toca el afectado, con el GM de respaldo si no responde, como en las trampas) y se pasa al siguiente.
  - La versión de los creeps: **Nd4+1** (el +1 una sola vez, no por proyectil; hoy suma +1 por cada uno).
  - El reparto pasa a hacerse **después** del dodge roll (hoy se hace al lanzarla, antes).
  - **☄ El Meteoro, con la misma secuencia** (dueño, 2026-11-13: «dejá el dodge roll, y que la secuencia de acciones sea igual que con la tormenta
    arcana»): cuando cae, la ronda de «¿Esquiva?» de a uno por iniciativa (el dodge roll de siempre) y después el daño de a uno (pulso, «Tirá el daño»
    —4d6 físico + 2d6 de fuego, lo tira quien lo lanzó—, «Aplicar el daño», el siguiente). Sin d20 ni lluvia: es un solo golpe para todos los de adentro.
  *Resultado* (`vtt-hexgrid/js/118-secuencia-area.js`; comun/duelo.js `hab.soloTirada` y `hab.esquiva`): probado en un mapa propio («Prueba · Tormenta»,
  ya borrado) con un creep que la lanza, 3 ratas y un personaje del J1. La flor sigue al mouse; el GM tiró «🎲 Tirar proyectiles · 1d20» en el cuadro; la
  ronda salió en el orden de la iniciativa (Rata T3 → Prueba Uno → Rata T2 → Rata T4), de a uno; el J1 contestó «Sí» y arrastró su token afuera
  («logró salir»), las ratas «No» / «Sí y me quedo»; la lluvia con el contador en todas las pantallas; el daño de a uno («3d4+1» con 3 proyectiles), el
  J1 tocó «Aplicar el daño» para su personaje. El Meteoro: igual, 4d6 + 2d6 de fuego, el que salió no recibió nada. **De paso:** los carteles que piden
  algo (el dodge roll, el ataque de oportunidad del GM…) van por encima del cuadro del duelo (comun/aviso-combate.js). Video: `tormenta-ronda-y-lluvia-*.mp4`.
- **✅ hecho (2026-11-14) — 🩸 Sanguijuela: muerde de nuevo al empezar el turno, y la animación de toda transferencia de vida** (dueño, 2026-11-14).
  *Resultado:* `vtt-hexgrid/js/119-sanguijuela.js` (nuevo) + js/54, js/13, js/78, js/92, js/05, `comun/ficha-mantenimiento.js`. Probado en «Claude · pruebas»
  (mapa propio, borrado al terminar) con Rockardo (copia) (J1; respaldado y restaurado) y un creep con la Sanguijuela: la Varita sanguijuela drena con la
  animación; la Sanguijuela pega, drena y queda pegada (el gusanito latiendo sobre el token); al empezar el turno de Rockardo: «▶ Empieza tu turno» →
  el aviso «la cura no fue para vos» (su Regeneración +3 se la lleva el Ladrón, con la animación) → «tenés una sanguijuela» → el 1d6 en el cuadro del
  duelo (lo tira el GM por el creep; directo) y la cura de la mitad → «¿se suelta?»; con «Ahora no» sigue pegada; al soltarse, se suelta y cae.
  Orden real: la Regeneración robada sale antes de la mordida (es parte del «Empieza tu turno»). Capturas y videos en el scratchpad de la sesión
  (`sanguijuela-videos/`, `sanguijuela-capturas/`).
  1. **La regla:** al empezar el turno de quien la tiene pegada, la sanguijuela le hace **1d6** de daño y quien la lanzó se cura **la mitad de lo
     que entró, para arriba**. Lo tira **quien lanzó la sanguijuela** con su botón, en el cuadro del duelo (el GM por un creep). Definido por el dueño
     (2026-11-14): **daño directo** (no lo frena la Def.Esp), **sí lo frena la Res. siniestro**; **primero la mordida y después** el intento de
     arrancarla (Fuerza contra el Ef.Esp); vale también para la Sanguijuela del Debuffer de clase (la misma habilidad).
  2. **Cómo se comunica** (el dueño lo describió así): empieza el turno del afectado → aviso «tenés una sanguijuela» → quien la lanzó tira el
     1d6 → el daño → la cura que se lleva. Y si al afectado lo iba a curar algo (su **Regeneración**, una poción…), se le avisa claro que esa
     cura **no lo curó a él, se la llevó su rival** (cuánto y a quién).
  3. **La animación:** cuando se cierran los carteles, la misma animación de la **Transfusión sanguínea** (la vida viaja del afectado al que
     lanzó la sanguijuela). **Regla general nueva:** toda cura o transferencia de vida de un personaje a otro usa esa animación.
     **Incluye explícitamente** (dueño, 2026-11-14): la **Varita chupasangre** (ex Varita sanguijuela: el drenaje de su ataque) y, en general,
     todo lo que drena vida (`drena` del duelo, Drenar vida, la Sanguijuela al pegar). Probarla también.
  3b. **La sanguijuela dibujada** (dueño, 2026-11-14: «una animación de la sanguijuela, como la vaquita de San Antonio: una especie de gusano
     con una pulsación, como que está chupando sangre»). Propuesta: mientras está pegada, un gusanito sobre el token del afectado que late
     despacio (se hincha y se deshincha, un poco de rojo que pasa por el cuerpo); en cada mordida, un latido más fuerte y recién después la
     animación de la Transfusión hacia quien la lanzó. Al arrancarla o vencerse, se suelta y cae. Mismo estilo que la vaquita (js de la vaquita).
  4. **La prueba:** en «Claude · pruebas», con **Rockardo (copia)** como objetivo (tiene Regeneración como pasiva) y un Ladrón de fuerzas que le
     pone la sanguijuela; las dos cuentas (GM y jugador), capturas de las dos pantallas y videos mp4 de la animación. Respaldo de Rockardo (copia)
     antes y restaurarlo después. Reporte al dueño con capturas y videos.
- **✅ hecho (2026-11-14) — 😵 Un caído no esquiva ni recibe carteles de esquivar** (dueño, 2026-11-14: «al personaje caído no le tienen que aparecer ni
  siquiera notificaciones de esquivar ni nada»; lo vio el ayudante: uno en 0 de vida pudo arrastrar su token para terminar el dodge roll). Con 0 de
  vida (caído / inconsciente): la ronda de «¿Esquiva?» de la Tormenta y el Meteoro lo saltea sin preguntarle (sigue adentro, sin cartel), lo mismo
  la fase de dodge roll de cualquier área y los otros dodge roll (Tronco de huída, el del arco). **El token se puede seguir arrastrando** (dueño,
  2026-11-14: «no debería haber restricciones para arrastrar el token, porque puede haber alguna circunstancia que lo requiera»): solo que arrastrarlo
  no cuenta como dodge roll. Y **se le saltean los turnos mientras esté caído** (revisar que el orden de turnos ya lo haga). Revisar que tampoco le
  salgan otros carteles de defensa que no puede usar. Probar en el mapa con las dos cuentas.
  *Resultado:* `dodgeCaido` (vtt-hexgrid/js/13): con 0 de vida no se le abre el «¿Esquiva?» ni ningún cartel de dodge roll (área, Tronco de huída,
  arco); si cae mientras lo hace, el cartel se cierra solo y el duelo termina «💀 CAÍDO · el área no lo alcanza» (`Duelo.resolverDodge(id, false,
  true)`, el veredicto, el chip y la Mesa lo dicen así; no se le reabre el cuadro). La ronda de la Tormenta y el Meteoro ya lo salteaba (un caído es
  un cuerpo: ningún área lo alcanza, P225). El token se puede arrastrar igual y no cuenta como dodge roll. Los turnos ya salteaban a los caídos.
  Probado en el mapa (Meteoro, Prueba Uno del J1, GM + J1): caído desde antes → no le preguntan nada; cae en medio del dodge roll → el cartel se
  cierra; caído → Tronco y arco sin cartel, arrastra 1 casilla; ▶ Siguiente lo saltea. Capturas `caido-a/`, `caido-b/`, `caido-c/` del scratchpad.
  **Dudas para el dueño:** (1) a un caído se lo puede atacar con un ataque directo y le sale «Elegí cómo te defendés» (no se tocó: ¿se puede
  rematar a un caído?); (2) si alguien arrastra el token de un caído al lado de rivales, a esos rivales se les puede ofrecer el ataque de oportunidad.
- **✅ hecho (2026-11-14) — 🧌 Cargar los esenciales aprobados y probarlos en el mapa**. *Resultado:* cargados S3 Armero, D3 Ladrón de fuerzas, W4
  Verdugo y T4 Peleador de control, niveles 2 a 5 (commit 560dc7bb), con su prueba de números en `comun/pruebas.html` (864 en verde); la Varita
  sanguijuela pasó a **Varita chupasangre** (mismo id). Probado en el mapa (mapa propio «Prueba · Esenciales», los cuatro de nivel 5 contra Prueba Uno,
  las dos cuentas): **anduvo todo** — Armas perforantes, Ojo certero y Potencia sobre el Verdugo (y el golpe siguiente con crítico ×2); Abrojos (trampa
  a la vista, Prueba Uno la pisa: 2d6+2 − Defensa, Res.CC contra 8 → Rengo); el Martillo de herrero con Derribar 25 %; Disipar (le sacó Bendecido);
  Maldición tormentosa (Atormentado + Herida sombría) y el **Muñeco vudú** (Debilitado al primer daño especial); la Varita chupasangre (drena);
  **Mal de ojo** en turno ajeno (10 SP, el jugador repite la Evasión y queda la peor); Remate (+2 dados con la mitad de la vida) con **Ojo de carancho**
  (+1 contra alguien con Rengo); Furia; Golpe demoledor; Golpe brutal (crítico ×2); Puño de roca (Demora); Arrastrar (lo trae y queda Desequilibrado);
  Barrido; **Marcar el ritmo** (el Armero pegado sube 3.º → 2.º al empezar la ronda); **Desarmar** tras un Parry ganado (su Bloqueo contra la Fuerza del
  golpe: «desarmó al otro», la daga quedó en el piso; en turno ajeno, cooldown 6). **Dudas:** (1) la Demora del Puño de roca y la de la Maza de guerra
  en el mismo golpe **se suman** (dos efectos «Demora» separados en el duelo: baja 2 lugares si entran los dos); (2) al aplicar Derribar o la Armadura
  rota doble del Golpe demoledor sobre un personaje **sin armadura** aparecen errores 400 en la consola (el Derribar entra igual; la Armadura rota no
  tiene pieza que romper) — a mirar; (3) el texto de Abrojos dice «la Destreza del pícaro» aunque la ponga el Armero.
  Videos y capturas: `scratchpad/esenciales/` (de la sesión). (dueño, 2026-11-14: «¿los estás poniendo en cola para probarlos en el
  mapa después?»).
  1. **Cargar** en `comun/creeps-esenciales.js` (con su prueba de números en `comun/pruebas.html`) lo aprobado y todavía sin cargar: **S3 Armero
     nv2–5**, **D3 Ladrón de fuerzas nv2–5** y lo que se siga aprobando (W4 Verdugo…); renombrar la **Varita sanguijuela → Varita chupasangre**
     (mismo id) en el catálogo y donde se nombre. Ver `docs/creeps-humanoides.md`.
  2. **Probar en el mapa** (mapa propio en «Claude · pruebas», las dos cuentas, capturas; video si hay animación) cada creep nuevo usando lo que
     suma, sobre todo lo que nunca se usó con un creep esencial: Armero (Armas perforantes, Ojo certero, Potencia, **Abrojos**, el Martillo de herrero
     con Derribar); Ladrón (Sanguijuela, **Mal de ojo** en turno ajeno, **Disipar**, **Maldición tormentosa**, el **Muñeco vudú** con su Debilitado, la
     Varita chupasangre); Verdugo (Remate, **Sed de sangre** subiendo en la fila). Reporte con lo que anduvo y lo que no.
- **✅ hecho (2026-11-14) — ▶ Optimizar los avisos del inicio del turno.** Resultado: la ventana «Empieza tu turno» se cierra al tocar «Aplicar» (sin
  el segundo paso; solo si el turno cambió en el medio avisa «ya no es tu turno»); a quien maneja ese personaje no le sale la tarjeta «Empieza el turno
  de…»; la cura robada es un solo renglón en «Vida y SP» («🪱 Tu Regeneración (+3) no te curó a vos: se la llevó X con su Sanguijuela», sin el «+3 HP»
  que no entró) y sin aviso al centro ni tarjeta en esa pantalla; la mordida abre directo el cuadro del duelo («🪱 La sanguijuela muerde a X»); el
  «¿se suelta?» sale recién al cerrarse el cuadro; los estados que no cambian no se muestran. **Por qué la cura robada salía dos veces:** la vista
  previa del inicio del turno (que solo mira) también la mandaba → a quien lanzó la sanguijuela le llegaba DOS veces (+6 en vez de +3) y salían dos
  avisos y dos líneas en la Mesa; ahora la vista previa no manda nada (`ui.simular`, comun/ficha-mantenimiento.js). «4 turnos → 4 turnos»: no era un
  error (lo recién puesto no baja en su primer inicio de turno, P177). Probado con Rockardo (copia) y un creep con Sanguijuela, las dos cuentas.
- **✅ hecho (2026-11-14) — 🔧 Dos arreglos chicos.** (1) Regla del dueño: «romper armadura a alguien sin armadura no debería ser posible» → un
  personaje sin piezas de armadura puestas ya no recibía nada (quedó con el texto «Rompe armadura: no tiene armadura que romper»); un creep con su equipo
  en vivo y sin ninguna pieza de armadura, tampoco (`EstadosAplicar.creepTieneArmadura`, sin escribir nada; un creep viejo sin equipo, como siempre).
  Los errores 400 eran reintentos de transacciones de Firebase («Commit failed-precondition»: dos pantallas escribiendo el mismo documento a la vez);
  Firebase reintenta solo y la escritura entra (verificado: el Derribar y la Sanguijuela llegaron igual). No se repitieron con Derribar sobre un
  personaje. (2) Abrojos, Cordón oculto y Polvo cegador ya no dicen «del pícaro» sino «de quien los puso / lo tendió / las escondió».
- **✅ hecho (2026-11-14) — 💀 A alguien en 0 de vida no se lo ataca** (dueño, 2026-11-14: «corregirlo como sugerís»). Un token en 0 de vida (caído) no se
  puede elegir como objetivo de un ataque ni de una habilidad dirigida contra un rival: si se intenta, aviso «está caído» y no se abre el duelo (sin
  «Elegí cómo te defendés»). Tampoco da ni recibe ataques de oportunidad (ni cuando alguien lo arrastra al lado de rivales). Curas y lo que lo levanta
  (revivir, Ankh, Pacto…) siguen funcionando. Probar en el mapa con las dos cuentas.
  *Resultado:* `tokenFueraDeCombate(id)` (js/98: iniciativa o vida en 0, también invocaciones). Al elegir objetivo (js/13) un caído no brilla y, si se lo
  toca, «💀 X está caído: no se lo puede atacar. Elegí otro.» (también con el objetivo ya elegido); lo que es para un aliado o una cura sigue igual. El
  ataque de oportunidad (js/17) no lo da ni lo recibe un caído (ni el aviso de oportunidad negada). El Barrido y las áreas ya lo salteaban. Probado en el
  mapa con las dos cuentas: el GM no pudo elegir a Prueba Uno en 0; Prueba Uno en 0 se alejó del Verdugo pegado sin oportunidad; Prueba Uno vivo se
  alejó del Verdugo en 0 sin oportunidad (capturas `scratchpad/chance-caido/01…09`).
- **✅ hecho (2026-11-14) — 🎲 Carteles de chance: de dónde sale el número** (dueño, 2026-11-13, con la captura de Reflejos: «¿el valor
  de "5 o más" de dónde sale?»). En los carteles de chance de una pieza de equipo (Reflejos de mangosta, Retirada limpia, Recuperarse rápido…) mostrar
  qué pieza la da, su porcentaje y qué número hace falta: «Reflejos de mangosta (Botas de zapador, 33 %) · 1d6 = 5 (sale con 5 o 6)». Solo texto.
  *Resultado:* `Combatiente.chanceSale` («sale con 5 o 6») y `chanceEtiqueta` («Reflejos de mangosta (Botas de zapador, 33 %)»); la ficha publica de qué
  pieza sale cada chance (`resumen.chanceDe`: Retirada limpia, Inamovible, Recuperarse rápido, Reflejos) y el GM la saca del equipo y las pasivas del
  creep (`chanceFuente`, js/21). Cambiados: el cartel común de chances (Retirada, Inamovible, Recuperarse), Reflejos (js/23), Inamovible en las trampas
  (js/19) y en el cuadro del duelo, y las líneas de la Mesa. Probado en el mapa: Retirada limpia (Bombacha de gaucho matrero, 50 %) · «1d6 = 2 (sale con
  4, 5 o 6) → no salió»; Reflejos de mangosta (Botas de zapador, 33 %) · «1d6 = 4 (sale con 5 o 6)». Una ficha que no se volvió a guardar todavía no
  publica la pieza: sale «(33 %)» sin nombre hasta que se guarde. Capturas `scratchpad/chance-caido/41…58`.
- **✅ hecho — ⚡ Varita de chispa eléctrica: 20 % de Parálisis a todos los que toca** (dueño, 2026-11-12: «ponele 20 % a
  todos los que toca, el primero y los saltos»). Antes: 25 % al primero; los saltos, solo daño. Ahora 20 % (9–10 en d10) al primero, en los efectos
  del duelo, y a cada salto, cada uno en su cuadro del duelo de a uno (`cadena.efectos`, como la Varita del relámpago), lo tira quien la usa; en el agua,
  el doble. Probado en el mapa (mapa propio, 3 ratas): J1 tiró la chance de cada salto («Tirar el efecto (1d10)») y aplicó la que entró.
- **✅ hecho — 🎲 El d2 (moneda) mostraba otra cara que la del log** (dueño, 2026-11-12). Dos causas, medidas con la librería real (dice-box-threejs
  0.0.12, cargada local): (1) la moneda de la librería lee mal su cara de arriba (la geometría del cilindro no sigue la cuenta de caras de los
  demás dados) y además los dados que llegan después la dan vuelta; (2) dos tiradas seguidas en la misma caja: la segunda vuelve a simular la
  física y la primera cae en otra cara (7 de 10 mal con 300 ms de diferencia). Arreglo: **no se usa más el d2** (el dueño: «las tiradas de par o
  impar podemos hacerla con un dado de 6 u 8»): el 50 % se tira con d6 (4 a 6), la Moneda Re-Roll es par/impar en d6, los 86 ítems del
  catálogo y los creeps viejos pasaron a «(4–6 en d6)», y un efecto guardado con 2 caras se tira con d6 (`EfectosGolpe.normalizar`); y las
  tiradas de una misma caja de dados 3D van de a una (`dadosTirar`, `c.cadena`).
- **✅ hecho (2026-11-12) 🪤 Trampas con el GM desconectado** (dueño, 2026-11-12, probando Reflejos en «Prueba · Carteles»): Rockardo (copia) pisó
  la Trampa de oso con la pantalla del GM cerrada y quedó trabado en «⏳ el GM tira el daño de la trampa…». Hecho (`vtt-hexgrid/js/16`, `js/19`, `js/06`):
  1. **El paso pendiente vuelve a aparecer** cuando entra después la pantalla a la que le toca (como el sigilo): las trampas sin terminar de la última
     media hora se vuelven a mostrar; cada 3 s se revisan por si recién cargaron los tokens.
  2. **Quien espera tiene «✋ Resolver a mano»** en el cartel de espera a los 5 s (o «✋ Lo aplica la mesa» / «▶ Seguir desde acá», según el paso).
  3. **⏳ Pendientes N** abajo a la derecha del mapa: la lista de las trampas que esperan una tirada (las tuyas; el GM, todas) con «Abrir».
  4. **Se queda en la casilla de la trampa**: en el mapa de prueba (con la oportunidad de la rata, «Seguir sin esperar» y Reflejos) el token siempre
     frenó en la trampa. El de Rockardo muestra que lo movieron DESPUÉS, desde la trampa a la casilla de al lado (su último camino es trampa → siguiente),
     algo que se podía porque la trampa seguía trabada sin dejarle el Inmovilizado. Ahora, mover a quien tiene una trampa sin terminar pregunta
     «🪤 Trampa sin terminar… ¿Moverlo igual?» (Se queda / Moverlo igual).
  5. (Pedido extra) **«Aplicar el daño» muestra la cuenta**: «🧮 9 de daño − Defensa 4 = 5 a la vida» (con la Defensa real, la especial, la resistencia,
     los escudos y la Vida extra) y el botón dice lo que entra a la vida: «💔 Aplicar el daño (5)». Probado con Defensa 0 y Defensa 4.
  Capturas `trampa-gm-*`.
- **✅ hecho (2026-11-12) 🦶 Inamovible al cuadro del duelo** (dueño, 2026-11-11, revisando el bloque 4 en «Prueba · Carteles»): cuando empujan o tiran de alguien con
  una pieza Inamovible, la chance se tira en el cuadro del duelo de siempre (una tirada sin oponente, como las chances de la tanda 3), con el botón
  para **quien maneja al empujado** (su jugador; el GM para un creep; el GM tira por el ausente) y el «Aplicar» de siempre. Hoy es un cartel propio
  que tira la pantalla del GM que aplica el empujón (`vtt-hexgrid/js/21`/`23`).
  **Hecho:** `inamovibleSale` (js/21) abre el cuadro del duelo con una sola tirada para quien maneja al empujado y el «Aplicar No se mueve» (efecto
  `firme`, comun/duelo.js: no pone estado). El empujón sigue igual. Probado en el mapa: J1 tiró por Prueba Uno con Botas de ancla (50 %): con un 6 no
  se movió; con un 1 lo empujó 2 casillas. Con 100 %, oculto o si el cuadro no abre, queda el cartel de antes.
- **✅ hecho (2026-11-12) 🎮 El GM controla a un personaje** (dueño, 2026-11-11: «el aviso de que el GM está controlando a Rockardo debería estar visible
  siempre, sí, pero además un jugador no debería poder usar su propio token mientras lo controla el GM… sólo observar»). Mientras el GM tiene el 🎮
  control de un personaje: (1) en la pantalla del jugador dueño, un aviso fijo y siempre visible «🎮 El GM está manejando a <nombre>: las tiradas le
  salen a él»; (2) el jugador no puede usar ese token ni su Botonera (moverlo, atacar, habilidades, ítems, duelos de ese personaje): solo mirar.
  Al soltar el control, todo vuelve. (Surgió probando las trampas: el cartel de Rockardo le salía al GM.)
- **✅ hecho — Contraataque antes del Bloqueo** (dueño, 2026-11-11): con la habilidad Contraataque, al ganar el Parry se pregunta «¿contraatacás?»
  antes del Bloqueo; Sí → sin Bloqueo y sin daño, y se abre el contraataque; No → el Bloqueo de siempre. Devolver gentileza, sin cambios.
- ✅ hecho · **La Percepción siempre incierta** (dueño, 2026-11-11: «siempre que se tira Percepción, que no se sepa bien para qué… "Fulano
  siente un movimiento extraño" o "algo le parece inusual"… no importa si es el máster o un jugador… quizás el jugador está haciendo una acción
  incierta, como colocar una trampa»). Todo pedido de Percepción nombra solo a quien percibe (`Combatiente.percepcionIncierta`, 4 frases); el
  detalle, plegado y solo para el GM («ℹ detalle»). También percibe un personaje (cartel a su jugador, el GM tira por él si no está) y poner
  una trampa en la zona de alerta de un rival le pide Percepción a ese rival. Probado en el mapa.
- **✅ hecho — tres correcciones del dueño (2026-11-11):**
  - **A · Modo narrativo:** un token con un estado que traba el movimiento **se mueve igual**, preguntando al soltar «¿Moverlo igual?».
  - **B · Sigilo:** vuelve a ser **una tirada por paso** en la zona de alerta (cada paso, su cartel; si lo descubren, se cortan los que quedan).
  - **C · El visible sin Percepción aumentada** que **termina** el movimiento con un escondido en su zona de alerta: la tirada de verdad (Percepción
    de quien se movió → Sigilo del escondido), en lugar del aviso anónimo de la Mesa. De pasada, nada. No probado en el mapa (el dueño estaba
    probando con el mapa activo y el modo es global): pruebas automáticas.
5. **✅ hecho — Choque por empujón con botón** (dueño, 2026-11-11: «claro, es así»). Contra algo sólido, el empujado tira **su** Constitución
   (una por cada casillero que le faltó recorrer) y se la come él; contra otro token, cada uno tira **su propia** Constitución ×N, que es el daño
   que le hace **al otro**. Cada uno resta su Defensa. En el cuadro del duelo de siempre (`danoDuelo`, js/78), con el GM por quien no está y la
   salida a mano.
6. **✅ hecho (2026-11-11) Modo narrativo: los estados que traban el movimiento frenan igual** (dueño, 2026-11-11: «así»). Fuera del
   combate moverse no cobra No2, pero con Inmovilizado (también la Prisión de hielo), Sentado, Stun / Sueño o Congelado el token no se arrastra:
   el aviso «No te podés mover ahora (…: aunque el mapa esté en modo narrativo, no se mueve; si hace falta, el GM lo mueve con 🦶 Mover libre,
   tecla M)». Rengo no cambia nada. `Combatiente.trabaNarrativo` + `vtt-hexgrid/js/06-mouse.js`. (Salió de la prueba del dueño con la Red de
   caza: en modo narrativo Larry se movía igual.)
7. ✅ **hecho (2026-11-11)** · **Saque rápido.** La chance se tira sola; si sale, un **Aviso** al jugador («Saque rápido: sacaste <consumible> sin gastar No2»); si no sale,
   solo la Crónica y la Mesa.
8. ✅ **hecho (2026-11-11)** · **Sigilo.** Con los disparadores que ya existen (verificarlos, no cambiarlos): si el escondido se mueve y entra en la zona de alerta de alguien →
   Percepción; si se mueve el visible, solo con Percepción aumentada se frena a tirar cuando un escondido queda en su zona de alerta; si no, el
   sigilo se corta solo si el escondido queda en su cono de visión directa en ese movimiento. **Si el escondido es un creep:** como hoy, el GM tira a
   escondidas. **Si es un personaje y lo puede percibir un creep:** al GM le aparece «<creep> percibe movimientos cerca — tirá Percepción» y tira la
   Percepción del creep; después **el jugador tira su Sigilo con su botón**, a la vista solo de él y del GM.
4. **✅ hecho (2026-11-11) Recargos del sobrepeso** (dueño, 2026-11-11): con Sobrepeso, te pases lo que te pases (+1 fijo, «por ahora»): el Parry cuesta 2
   No2 (1 + 1), «Poner escudo» contra un disparo también 2, el dodge roll lo de moverse + 1, y el primer Parry con Parada fácil cuesta 1 (solo el
   recargo). La Evasión sigue igual (−1 por punto de más, o 1 No2 para evitarlo).
   Además (dueño, con captura: «si la penalidad de −5 es por sobrepeso, debe ser claro»): cada botón de defensa dice de dónde sale cada
   penalidad (la cuenta del sobrepeso —lo que pesa el equipo y la Carga máxima— y «Modificado por: …» con los estados). El dodge roll con
   sobrepeso no se probó en el mapa.
3. **✅ hecho (2026-11-11) Parar un disparo con el escudo gasta 1** (dueño, 2026-11-11: «parar un proyectil con un escudo, tirando Destreza, sería un
   "parry"; si es exitoso, implica que la flecha queda clavada en el escudo y se pierde 1 punto de durabilidad»). Contra un disparo, «Poner
   escudo» ganado → el escudo pierde 1 (con el aviso «pasó de N a N−1»); el botón lo avisa antes de elegir. **Corrección del dueño (mismo día):**
   «al recibir un disparo, las opciones son esquivar o parar con el escudo; no es lo mismo que el bloqueo del parry: si fallás el parar con el
   escudo, la flecha pasa de largo y no le baja la durabilidad» → «Poner escudo» perdido = el disparo pega normal, sin Bloqueo y sin desgaste.
   El Parry cuerpo a cuerpo ganado sigue sin gastar.
1. **✅ hecho (2026-11-11) Durabilidad — el aviso del Bloqueo perdido** (dueño, 2026-11-11: «el aviso está ok»): al perder el Bloqueo, al personaje le llega
   «Perdiste el Bloqueo: la durabilidad de tu <ítem> pasó de N a N−1» (y la advertencia si queda 1 / se rompe); el cuadro del duelo muestra «de N a
   N−1». **Regla confirmada:** un Parry o un Bloqueo **ganados** no gastan; solo se gasta 1 al **perder el Bloqueo**. La Defensa no baja (eso es
   solo Romper armadura).
   *Resultado:* al jugador le llega el cartel «🔧 Perdiste el Bloqueo: … pasó de N a N−1» (+ toast y recordatorio en la Mesa); el cuadro del
   duelo dice «pierde 1 punto de durabilidad: de N a N−1 (de máx) · la Defensa no baja». Probado en «Prueba · Escudo de rayo»: perdido 6 → 5;
   ganado, sin desgaste.
2. **✅ hecho (2026-11-11) — Durabilidad: 6 por punto de Peso para todo** (armas, escudos y armaduras), mínimo 6 (dueño, 2026-11-11: «la durabilidad está ok»).
   «Resistente ×N» / «Frágil ×N» siguen sumando/restando encima; las piezas ya gastadas conservan lo gastado y ganan el margen nuevo. Revisar
   el precio de reparar.

- **⬜ en cola (2026-11-21: 6 intentos más, no se repitió; sin tocar código — ver abajo) — 🐞 A veces, después de «▶ Iniciar combate», el combate queda como sin iniciar** (visto una vez en la pasada de pruebas del
  2026-11-21; no se pudo repetir en tres intentos). Qué pasó: el GM venía de mirar otro mapa («Prueba · L7 L8») y volvió al publicado; armó el
  orden con un **creep primero** (Peleador 5, Blanco J1, Blanco J2), apretó Ordenar → «▶ Iniciar combate» → «⚔ Pasar a Combate e iniciar» →
  «Empezar registro nuevo». La Mesa dijo «▶ Empieza el combate · todos arrancan con los No2 llenos» **sin nombrar de quién era el turno**, y
  unos segundos después el botón «▶ Iniciar combate» estaba otra vez a la vista y ▶ Siguiente avisaba «el combate todavía no se inició».
  Apretando de nuevo, anduvo. Sospecha (sin confirmar): el orden de turnos se guarda entero cada vez (`guardarIniciativa`, vtt-hexgrid/js/04), y
  una pantalla que guarda con lo que tenía de antes puede pisar lo que otra acaba de guardar; o la pantalla del GM, recién cambiada de mapa,
  todavía no tenía cargado el token del primero. Qué mirar: que cada guardado del orden toque solo lo suyo (o que revise antes de pisar), y
  probarlo cambiando de mapa justo antes de iniciar. No es grave (se vuelve a apretar), pero recarga los No2 dos veces.
  *Segundo intento (2026-11-21, sin tocar código):* **no se repitió** en 6 intentos más (creep primero, el GM recién vuelto de «Prueba · L7 L8»,
  con esperas distintas, y una vez con todo el antecedente: «Finalizar combate → Publicar» mirando el otro mapa y enseguida un combate nuevo).
  En todos arrancó bien, con «turno de Peleador 5» en la Mesa y un solo guardado del orden. Lo que se vio: (1) desde que se aprieta «Empezar
  registro nuevo» hasta que el combate figura iniciado pasan **entre 7 y 10 segundos** (llena los No2 de todos, uno por uno); en ese rato el
  botón sigue a la vista y ▶ Siguiente avisa que no se inició: si se mira ahí, parece que no anduvo. (2) Leyendo el código hay un camino que da
  exactamente lo que se vio: si al mapa le llega un «volvió a narrativo» después de iniciado, la pantalla del GM marca el combate como sin
  iniciar (js/04, el escucha del modo); eso solo lo escribe el cierre de «Finalizar combate», y no se logró que llegue tarde. (3) Que la Mesa no
  nombre de quién es el turno pasa cuando el primero es un creep que los jugadores todavía no conocen (es a propósito). Queda en cola: si
  vuelve a pasar, anotar si el mapa quedó en narrativo o en combate (eso dice cuál de las dos sospechas es).
  *2026-11-21, tanda 5:* para lo de (1) quedó el «⏳ Iniciando combate…» (la entrada de abajo): en esos segundos el botón está apagado y dice qué
  hace, y ▶ Siguiente no se puede apretar. En 4 inicios más de esta tanda no se repitió.
- **✅ hecho (2026-11-21) — ⏳ Cartel «iniciando…» en «▶ Iniciar combate»** (dueño, 2026-11-21: «poné un cartel de iniciando durante esos segundos
  que tarda»). Entre «Empezar registro nuevo» y que el combate figure iniciado pasan 7 a 10 s; en ese rato el botón seguía a la vista y
  «▶ Siguiente» avisaba que no se había iniciado.
  *Resultado:* desde que se elige cómo empezar, el botón queda apagado, con una franja que corre, y dice qué está haciendo: «⏳ Iniciando
  combate… pasando el mapa a Combate», «…llenando los No2 (3 de 5)», «…empezando el turno del primero». Los otros botones del orden de turnos
  quedan apagados y, si igual se llega a ▶ Siguiente, avisa «el combate se está iniciando». Un segundo clic no hace nada (una sola línea «▶
  Empieza el combate» en la Mesa). Si falla, avisa («No se pudo iniciar el combate… probá de nuevo») y el botón vuelve a quedar apretable.
  Solo lo ve el GM (los jugadores no tienen ese botón). Probado con clics en «Claude · pruebas 2» (GM, J1, J2): con «Pasar a Combate e
  iniciar» y con «Iniciar sin cambiar el modo»; la falla se forzó por código (el guardado del orden devolvió «no se pudo» una vez) y el segundo
  intento anduvo. 966 pruebas automáticas en verde. `vtt-hexgrid/js/04`, `mapa.css`.
- **✅ hecho (2026-11-21) — 🌫 El cartel de arriba de una zona, más preciso** (dueño, 2026-11-21: «habría que ajustarlo para que sea más
  preciso»). Decía siempre «la sufre quien entra y quien sigue adentro en el Mantenimiento», también para el hielo de la Varita de la ventisca.
  *Resultado:* el cartel saca la frase de la misma cuenta que la tarjeta de «Ver detalle» (`ZonaDetalle.cuandoEtiqueta`, comun/zona-detalle.js):
  «se dispara al entrar y, mientras sigan adentro, cada vez que se pasa de ronda»; el hielo de la varita, «se dispara en cada paso que dan
  adentro (quedarse quieto no la dispara)»; una que solo importa al entrar, «se dispara al entrar o cruzarla (quedarse quieto adentro no la
  vuelve a disparar)»; una de curación, «cura a los aliados de quien la puso que estén adentro, en cada pulso»; una luz, «ilumina…». Visto con
  clics en una zona común del GM, una de «solo al entrar» y el hielo de la varita (con la primera redacción; la frase final, igual a la de la
  tarjeta, quedó cubierta por la prueba automática nueva y no se volvió a mirar en el mapa). 1 prueba automática nueva.
- **✅ hecho (2026-11-21) — 🔮 Anillo de Foco Arcano igual que el de Puntería certera** (dueño, 2026-11-21: «habría que programarlo igual que el
  de puntería certera»).
  *Resultado:* ya compartía la pieza (comun/quieto.js, js/126). Probado con clics en «Claude · pruebas 2» (el anillo y una Varita de misiles
  dados a Blanco J1 por datos, y sacados al final): ronda 1 sin bono; al empezar la ronda 2, el cartel «🔮 Foco» sobre el token (jugador y GM);
  el aviso antes de moverse y Cancelar (se queda y no gasta); que lo mueva el GM con Mover libre no lo apaga; «Moverme igual» lo apaga en las
  tres pantallas (queda anotado en la partida). **Faltaban tres cosas, arregladas:** la Varita de misiles y las áreas no sumaban el +2; la
  declaración del cuadro no lo decía (ahora «💍 Foco: +2 PdG.Esp»); el aviso decía «Foco activa… la perdés». Dudas: P266 (el ataque de
  oportunidad se pregunta antes que el aviso) y P267 (qué tiradas cuentan). Sin ver: una habilidad de área de un personaje, un creep o una
  invocación con el anillo, Dash / Salto / Parpadeo.
- **✅ hecho (2026-11-21) — 📐 El menú de la izquierda de la ficha, como columna fija** (dueño, 2026-11-21, con captura: «este menú lateral en la
  ficha queda desprolijo. Qué tal dejar directamente una columna de ese ancho que efectivamente desplace el resto de la ficha. Que la columna
  quede fija y la ficha sí scrollee si fuera necesario»).
  *Resultado:* en la ficha y en GM Tools (comparten comun/dock-izq.css) el menú es una columna de 56 px, de alto completo, fija; la página
  empieza a su derecha y scrollea normal (ya no tapa «Puntos de vida», Constitución ni la foto; en GM Tools tapaba el borde de la primera
  tarjeta de creep). Los botones muestran solo el ícono y, al pasar el mouse, se abren con el rótulo entero (antes asomaba media letra); los
  paneles (Exp y Job, DDE, Personajes) se siguen abriendo a la derecha; los botones apagados quedan opacos. Embebidas en el mapa no queda el
  hueco. Probado con clics en la ficha suelta de Blanco J1 (ventana de 900 px y de 1920; arriba, al medio y al fondo; paneles Exp y Job, DDE y
  la ventana de Equipo) y en GM Tools (1100 px, scrolleado, con Personajes abierto). Capturas de antes y después. No se adaptó a celular.
- **✅ hecho (2026-11-21) — 🔁 Turnos, caídos y resurrección (pedidos del dueño, 2026-11-21)**. Todo se prueba en «Claude · pruebas 2».
  1. **«⏭ Pasar de ronda» en el orden de turnos (solo GM)**: «me gustaría, en el menú de iniciativa y orden, agregar un botón para el GM que diga
     PASAR DE RONDA, que se saltee todos los turnos pendientes de la ronda y vuelva al primero. Sobre todo me sirve para cuando estoy haciendo
     pruebas, pero podría llegar a suceder que lo necesite durante un juego».
  2. **Turno libre**: con clic en un nombre del orden se le puede dar un turno libre. «Cuando esa persona pone "terminar turno", ¿el juego te
     llevaría al que está inmediatamente después del del turno libre, o retoma la ronda de turnos como venía antes de otorgarle el turno libre?
     Debería ser la segunda». Ver cómo está y dejarlo así.
  3. **P257 decidida**: «un caído queda como estaba al caer. Mismos nitros, no hay recarga ni regeneración de nada» (también en «▶ Iniciar
     combate»). «También al momento de morir se le eliminan todos los estados alterados».
  4. **Resurrección con dos formas** (p. ej. Ankh y Pacto): «el juego te pregunta cuál preferís usar. Al seleccionar uno, recién ahí se muestra
     la animación». Verificar que la animación no salga antes de elegir; probar con clics «¿Con qué volvés?» eligiendo entre dos formas.
  5. **Invocaciones** (dato del dueño, no tarea): «no se reviven porque al caer se desinvocan». Que la doc lo diga y sacar de los pendientes la
     prueba «invocación revivida con su ✚».
  *Resultado:* (1) **«⏭ Pasar de ronda»** en el pie del orden de turnos, solo el GM: si quedan turnos sin jugar pregunta nombrándolos («Queda 1 turno
  sin jugar en la ronda 1 (Protector 3)…»); los que faltaban pasan su turno sin jugar (como un caído que se saltea), se pasa el Mantenimiento y empieza
  el primero, con su «▶ Empieza tu turno»; Mesa «⏭ El GM pasó de ronda: se saltearon los turnos de …». También en medio de un turno libre. Lo de
  «al terminar tu turno» de los salteados: se aplica (lo más parecido a pasar esos turnos), pregunta P269. (2) **Turno libre**: ya retomaba la ronda
  como venía; probado (J1 con turno libre en el de Protector 3, «✅ Terminar turno» → vuelve Protector 3, misma ronda). (3) **Caídos**: «Iniciar
  combate» no les llena los No2; al empezar su turno, al saltearlos y al pasar de ronda no recargan ni regeneran nada ni bajan sus cooldowns (solo la
  cuenta para morir; también el ⟳ de narrativo y los creeps); **al caer se les van los estados** (personajes y creeps desde el mapa), con línea en la
  Mesa. Se tomó «morir» = caer: P270. (4) **«¿Con qué volvés?»** con Pacto y Ankh: la animación sale recién después de elegir (video). (5) La doc lo
  dice y salió de los pendientes. Probado con clics (GM, J1, J2); por datos: los estados, No2, Pacto y Ankh de J2, el Sangrado del creep, el orden de
  turnos «por iniciar» y la vida a 0 (con la función del «HP directo»). 3 pruebas automáticas nuevas (969).
- **✅ hecho (2026-11-21) — 🎯 Apuntada de las ballestas, compartida entre pantallas** (dueño, 2026-11-21: «arreglalo también»): tiene la misma «memoria de
  una sola pantalla» que tenía la Puntería certera; dejarla como quedó esa (lo que se movió, compartido; que te muevan no cuenta).
  *Resultado:* la Apuntada y la Apuntada firme leen lo anotado en la partida, como el anillo (js/126, `Quieto.apuntada` / `apuntadaFirme`). Probado
  con clics con la Ballesta de guerra (Apuntada +2) de Blanco J1: J1 caminó una casilla en su pantalla y el GM, con 🎮 el control, disparó desde la
  suya → sin Apuntada (la memoria vieja de la pantalla del GM decía «quieto» y daba el +2); ronda nueva, sin caminar y con un 🦶 Mover libre del GM →
  «apuntada (no se movió): +2 PdG». La firme no se probó con clics (las dos ballestas con firme están archivadas; misma regla que el anillo, con
  pruebas automáticas). Sin cartel ni aviso antes de moverse: P271. Por datos: la ballesta equipada y el orden de turnos. 2 pruebas nuevas (971).
- **✅ hecho (2026-11-21) — 🔥 Muro de fuego al empezar el turno (P259 decidida)** (dueño, 2026-11-21): «el muro de fuego debería hacer daño a un
  personaje/token al iniciar el turno del mismo, si este está parado sobre el muro». Hoy el mapa lo dispara al pasar de ronda: corregir el mapa,
  y que el texto de la habilidad, el «Ver detalle» y el cartel de arriba digan lo mismo.
  *Resultado:* con orden de turnos, el muro ya no pega al pasar de ronda: al empezar el turno de cada uno que esté encima le sale el cartel «🔥 Muro de
  fuego: le toca a …» (al entrar o cruzarlo, como siempre). Sin orden de turnos, como antes. El texto de la habilidad, «Ver detalle» y el cartel de
  arriba dicen «al entrar o cruzarla y al empezar su turno adentro». Las copias guardadas en los creeps se ponen al día solas. Probado con clics en
  «Claude · pruebas 2»: el GM lo lanzó desde las Acciones de Arcano 3 (4 casillas, sobre Blanco J1); J2 entró caminando (cartel al entrar); al pasar
  a la ronda 5 el cartel salió solo a J1 (empezaba su turno), no a J2, que también estaba encima; a J2 recién al empezar el suyo. Por datos: darle
  la habilidad a Arcano 3 (en el formato viejo, para ver la puesta al día), acercarlo y sumarlo al orden. La Varita del muro de fuego no se tocó
  (P272); los que se saltean con «Pasar de ronda» no se queman (P269). 1 prueba automática nueva (972).
- **✅ hecho (2026-11-21) — 🔮 Foco Arcano y movimientos especiales con Puntería certera, con clics** (dueño, 2026-11-21: «probalo en Claude pruebas»):
  Dash, Salto, Carga, Takle, Parpadeo con los dos anillos; el Foco con un área de personaje y en un creep o una invocación.
  *Resultado:* probado con clics en «Claude · pruebas 2» (GM, J1, J2), con los dos anillos puestos por datos a Blanco J1, Blanco J2 y cuatro creeps.
  **Los cinco movimientos apagan los dos anillos** como caminar, en todas las pantallas: Dash (J1), Varita del blink (J2), y en creeps Parpadeo
  (Arcano 3), Salto (Protector 3), Takle (Blanco creep) y Carga que derriba (Peleador 5). **Faltaba el aviso antes (arreglado):** ahora, con el
  anillo activo, al tocar Ejecutar (o Atacar con la varita) sale «Tenés Puntería certera activa (+2 a PdG) y Foco activo (+2 a PdG.Esp). Si te
  movés con Dash, los perdés.» [Usarla igual] [Cancelar], antes de cobrar: Cancelar no gasta ni mueve (visto con el Dash, el Parpadeo, el Takle y la
  Carga); Usarla igual sigue como siempre (Dash, Varita del blink, Salto). **El Foco**: con el Orbe arcano de J2 (área de personaje) y la Lanza
  arcana de Arcano 3 (creep) el cuadro dice «💍 Foco: +2 PdG.Esp» y la tirada suma «+2 quieto». La Carga del Warrior (personaje) es caminar: ya
  avisaba. Sin ver: una invocación con el anillo (va por el mismo aviso). Duda nueva: P273. 1 prueba automática nueva.
  **🔥 Muro de fuego, la sospecha:** sí pega al empezar el turno — J1 50 → 41 (3d4 = 9, lo tiró el GM por Arcano 3) y J2 50 → 45, más la Quemadura.
  Lo engañoso era el cartel («No hay nada que tirar: se aplica lo que deja la zona»): ahora dice «No hay tirada para resistirla: le entra 3d4 de
  daño de fuego y Quemadura (3 turnos). El daño lo tira Arcano 3.» (vale para toda zona sin tirada). 1 prueba automática nueva (974).

- **✅ hecho (2026-11-22) — 🎨 Color de la columna de la izquierda** (dueño, 2026-11-22: «el fondo blanco no me gusta. Quisiera que fuera un fondo
  similar al del resto de la ficha, solo que un poco más claro»). Se le mandaron tres muestras (A suave `#261E23`, B media `#30262C`,
  C marcada `#3C3037`, en `.dock-izq` de `comun/dock-izq.css`). *Resultado:* eligió la A («me gusta la intensidad de la opción A»):
  `#261E23` en la ficha y en GM Tools (`?v=20261122fondoA`). La muestra se sacó con ese mismo color sobre la ficha de Blanco J1.
- **✅ hecho (2026-11-22) — 🪟 Carteles encimados al empezar el turno** (dueño, 2026-11-22, con dos capturas: «esta superposición de menús no me gusta. No
  entiendo bien en qué contexto suceden, así que para corregirlo debería entender eso»). Pasa cuando al empezar tu turno salen dos cosas a la
  vez: el «▶ Empieza tu turno» (No2, regeneración…) y el cartel de una zona en la que estás parado (Muro de fuego). Explicarle el contexto
  y proponer (por ejemplo, que la zona sea un paso más adentro de «Empieza tu turno», o que salgan uno después del otro); programar lo que elija.
  **Elegido (dueño, 2026-11-22): A** — la zona pasa a ser un renglón más dentro de «▶ Empieza tu turno» (debajo de los No2), con su botón
  para tirar el daño: un solo cartel con todo lo que pasa al empezar el turno.
  *Resultado:* un solo cartel. Las zonas de «al empezar su turno» ya no abren el suyo: van como renglones de «▶ Empieza tu turno» (debajo de los
  estados, la vida y los No2), una por zona, cada una con su botón («🔥 Tirar el daño (3d4)» o «🎲 Tirar Res.Esp para resistir…»). El botón se
  habilita después de «✔ Aplicar» (primero lo del turno, después la zona: P274); con zonas pendientes, «✔ Aplicar» ya no cierra la ventana. Al tocar
  el de la zona, la ventana se aparta y queda a la vista el cuadro del duelo de siempre (el daño lo tira el GM o el dueño de la zona; el jugador ve el
  cuadro «esperando que Arcano 3 tire el daño…» y aplica); cuando el cuadro se cierra, la ventana vuelve con el resultado («9 de daño de fuego (lo
  tiró Arcano 3; entraron 9) · Quemadura») y «Entendido». **Y nunca tapa un cuadro del duelo**: si se abre otro (la zona de una invocación, un
  ataque), se aparta sola y vuelve al cerrarse. Si el GM lo aplica por él o se aplica solo al pasar el turno, la zona sigue con su botón (se puede
  tirar igual); si la zona se fue antes de tirar, dice «ya no está: no pasa nada». Un creep sigue con el cartel de siempre (no tiene esa ventana).
  Probado con clics en «Claude · pruebas 2» (GM, J1, J2), con capturas de antes (la versión publicada) y después, en la pantalla del jugador y en la
  del GM (con 🎮 el control de J2): J1 50 → 46 (3d4 = 4) + Quemadura 2; J2 50 → 43 (7) + 2; dos zonas a la vez (el Muro y una Nube con tirada para
  resistir: dos renglones; Res.Esp 4 contra 8, no resistió, 1d4 + Pajaritos); «▶ Aplicar por él» del GM; pasar el turno sin tirar; un turno sin zona
  («✔ Aplicar» la cierra, como siempre). **Arreglado en el camino:** el cuadro del daño de la abeja (fuera del orden) se abría debajo de la ventana.
  Por datos: darle el Muro de fuego a Arcano 3, acercarlo, el orden de turnos, mover a J2 fuera del muro y la Nube de prueba. Sin ver: lo de
  `docs/pruebas-en-el-mapa.md` (2026-11-22). Dudas: P274 (el orden) y P275 (la abeja fuera del orden sigue con su cartel aparte). 5 pruebas
  automáticas nuevas (979).
- **✅ hecho (2026-11-22) — 👥 y 🎭 del mapa, ¿unificarlos?** (dueño, 2026-11-22: «¿no son medio redundantes? ¿No podrían unificarse? Escucho
  opiniones y sugerencias»). Mirar qué hace cada uno y proponer.
  *Propuesta enviada (2026-11-22), espera decisión:* hoy 👥 (cabecera) lista las fichas (abrir, ✕ del GM) y suma «🎭 Ponerlo en el mapa»
  a los personajes propios sin token; 🎭 (borde izquierdo) al jugador le abre «Nuevo token» (con «⬇ Traer mi token») y al GM un menú
  (＋ Token nuevo, 👥 Traer jugadores…, 👹 Traer creeps…). Lo repetido: poner tu personaje en el mapa (dos lugares) y «traer jugadores».
  **A (recomendada):** un solo botón «👥 Personajes y tokens» con una fila por personaje (📜 abrir ficha · en este mapa ✔ / 🎭 ponerlo ·
  GM: ✕) y, abajo, solo para el GM, «👹 Traer creeps…» y «＋ Token suelto (NPC u objeto)»; se saca el 🎭 del borde. **B:** dejar los dos
  pero cada uno con lo suyo: 👥 = solo fichas; 🎭 = solo tokens.
  **Elegido (dueño, 2026-11-22): A, con dos cambios:** «que el botón esté en el menú lateral izquierdo» (no en la cabecera) y «que a los
  jugadores también se les ofrezca la opción de agregar un token suelto. Que le puedan cargar una imagen, un nombre y una descripción».
  *Resultado:* un solo botón **👥** en el menú de la izquierda (donde estaba el 🎭), que abre «Personajes y tokens»: una fila por personaje (📜 su
  ficha · «✔ en el mapa» o «🎭 Ponerlo en el mapa» · el GM, ✓/💤 y la ✕), sus invocaciones debajo, y abajo «＋ Token suelto» para todos y, para el
  GM, «👥 Poner a todos los que faltan…» y «👹 Traer creeps…». Salieron el 👥 de la cabecera y la ventana «＋ Token nuevo». El token suelto lleva
  imagen, nombre y descripción; la descripción se lee al pasar el mouse y en su tarjeta 🪪; lo editan y lo borran quien lo puso y el GM.
  **Hay reglas de Firestore para pegar** (el campo descripción); sin ellas, crear o guardar con descripción avisa y no se hace. Probado con clics en
  «Claude · pruebas 2» (GM, J1, J2): el panel de los dos lados, poner un personaje (el jugador el suyo; el GM el de J2 a su nombre), la ✕ cancelada,
  traer un creep, «Poner a todos los que faltan», un token suelto de J1 con imagen y nombre que J2 y el GM ven, que J2 no puede borrar ni editar, que el
  GM renombra y que J1 saca. Sin ver de verdad: la descripción con las reglas pegadas (`docs/pruebas-en-el-mapa.md`). Dudas: P276 y P277. 5 pruebas
  automáticas nuevas (984).
- **⏸ en pausa (2026-11-22: «dejarlo como está hasta que lo charle con mis colegas») — 🗡 ¿Los ataques de oportunidad cuentan como por la espalda?** (dueño, 2026-11-22: «si no, evaluar el caso»). Contarle cómo
  está y, si no cuentan, proponer.
  *Cómo está (2026-11-22):* el ataque de oportunidad usa la regla general de la espalda (+1 PdG si quien ataca está en el punto ciego de quien se
  aleja; desde el sigilo, su defensa vale 1), mirando hacia dónde mira el token en ese momento. Pero el movimiento se frena en el último casillero
  pegado al rival, con la orientación que traía: si se aleja desde donde estaba (el caso común), sigue mirando al rival y no cuenta. *Propuesta:*
  **A:** toda oportunidad cuenta como por la espalda; **C (recomendada):** cuenta si el paso con el que se iba lo alejaba del rival (le da la
  espalda); si se iba de costado, no; **B:** dejarlo como está.
- **✅ explicado (2026-11-22) — 🔫 ¿Hay arcabuces?** (dueño, 2026-11-22: «contame cuáles. Ni sé qué es un arcabuz»). Listar los del catálogo, explicar qué
  son, y retomar P265 con eso.
  *Resultado:* un arcabuz es un arma de fuego antigua, larga, de pólvora y mecha (la abuela del mosquete y del rifle). En el catálogo hay
  cinco armas de pólvora: Arcabuz de cubierta, Arcabuz de mecha, Pistola de chispa, Pistola de duelo de plata y Trabuco del contrabandista; las
  cinco están **archivadas** (del catálogo viejo: no salen en las tiendas) y ninguna tiene Recarga, por eso la maestría de ballestas no les suma.
  La pólvora quedó pendiente en `docs/rework-armas-rango.md` («no se esquiva, se apunta»). Propuesta: P265 espera a que toque la pólvora en el
  rework. **Ok del dueño (2026-11-22):** «me parece bien».
- **✅ hecho (2026-11-22) — 🛡 Aguante de trinchera con cualquier daño** (dueño, 2026-11-22: «debería contemplarse para cualquier daño que tenga en cuenta
  esas defensas, independientemente si es trampa, ataque u otra cosa»). Ya se sumó en trampas y zonas de número fijo (tanda 5); revisar que
  no falte ningún camino y probarlo.
  *Resultado:* todo daño del mapa pasa por tres funciones (personaje, creep, invocación) y las tres ya lo sumaban; ahora la regla de a dónde va (a la
  Defensa, a la Defensa especial o a nada) está en un solo lugar, `Combatiente.trincheraDelGolpe`. Lo que faltaba era **que se viera**: en una trampa
  común, en una zona de número fijo y en el aviso del golpe se sumaba escondido adentro de «Defensa 3»; ahora dice «Defensa 1 − 🛡 Aguante de
  trinchera 2». También la vista previa de «Recibe daño» del token («10 − Def 3 (1 + 2 de Aguante de trinchera)»). No suma (a propósito) en lo que
  no resta ninguna defensa: un crítico, el daño directo (fuego del terreno, escudo elemental, rayo en cadena, Espinas, Espejo, Maldición tormentosa,
  Tendón cortado), el elemental de un arma, lo escrito a mano. En GM Tools no se cuenta (no sabe quién está pegado): avisa para sumarlo a mano (P283).
  Probado con clics en «Claude · pruebas 2» con la pasiva en Blanco J1 y dos creeps pegados: un ataque con arma, un hechizo (Defensa especial), una
  trampa física, una zona con daño tirado, una de número fijo física y una de fuego, «Recibe daño» del token, el Terreno incendiado (no suma, bien) y
  un creep escondido pegado (no cuenta: siguen siendo 2). 999 pruebas automáticas en verde (1 nueva). Dudas: P283.
- **✅ explicado (2026-11-22; lo que se decidió va al final de la cola) — 💨 Prisa contra otras pasivas de iniciativa** (dueño, 2026-11-22: «corroborar si ya hay una pasiva que dé más iniciativa. Si hay,
  comparar y evaluar»).
  *Resultado:* no hay otra pasiva de jugador que suba la Iniciativa (la Prisa reemplazó a «Reflejos de gato», +1). La suben ítems: 27 con +1, 10
  con +2 y la Navaja del compadrito con +3 (y 21 con −1); y tres habilidades de creep (a mano). La Iniciativa es el tamaño del dado (6 → 1d6; 11 →
  1d10+1): la Prisa suma +5 a **ese número**, no al resultado (en promedio +2,5; como mucho +5). El dueño había dicho «+5 a la tirada»: ¿queda
  así o pasa a +5 fijo al resultado? Comparación: con Agilidad 6, sin nada 1d6 (3,5 de promedio); con un +2 de arma 1d8 (4,5); con Prisa 1d10+1
  (6,5); con Prisa a +5 fijo, 1d6+5 (8,5).
- **✅ hecho (2026-11-22) — 🤝🎁 Dar y compartir: las dos tareas de abajo se superponen** (dueño, 2026-11-22: «me parece que son un poco redundantes o al
  menos se superponen. Evaluemos esta tarea»). *Propuesta enviada, espera decisión:* **A (recomendada):** un solo botón «🤝 Dar» en el menú de la
  izquierda (mapa, ficha y GM Tools) que abre una ventana distinta según quién lo toca: el GM, la de «Dar a un jugador» (catálogo, DDE, despojos,
  ítem nuevo; llega directo); un jugador, la de pasar algo de su mochila a otro (ofrecer / aceptar, con el aviso de combate y no adyacente). El 🎁
  sigue siendo solo el del botín (Despojos). **B:** como pidió al principio: el GM, en el 🎁; los jugadores, en un 🤝 aparte.
  **Elegido (dueño, 2026-11-22): A** («avanzá con la opción A»). Se hace junto con las dos entradas de abajo.
  *Resultado:* un botón **🤝 Dar** en el menú de la izquierda del mapa (cuadrado, entre el 🎁 y el 🗺), de la ficha (debajo de 🎁 Despojos) y de GM
  Tools (debajo de 👥 Personajes). El GM va directo a «🎁 Dar a un jugador» (en la ficha, con ese personaje ya marcado); un jugador, a «🤝 Pasarle algo
  a otro personaje» desde su personaje. Si hay más de un camino (el GM con 🎮 el control de un personaje, o un jugador con varios) sale un cartelito:
  «🎁 Dar como GM» / «🤝 Pasar algo de la mochila de X». El 🎁 sigue siendo solo el del botín. Las otras puertas se dejaron (P278). Sin reglas nuevas
  de Firestore. 5 pruebas automáticas nuevas (989). Probado con clics en «Claude · pruebas 2»: ver las dos entradas de abajo.
- **✅ hecho (2026-11-22) — 🎁 «Dar a un jugador» desde el menú de la izquierda** (dueño, 2026-11-22): «que la opción de dar ítems también se pueda acceder,
  como máster, desde el botón de regalo del menú lateral izquierdo del mapa. También agregar ese botón en GM Tools».
  *Resultado:* con la opción A va en el **🤝 Dar** (no en el 🎁, que quedó para el botín). Probado con clics: el GM lo toca en el mapa, en GM Tools y
  en la ficha de Blanco J1 y se abre «Dar a un jugador»; desde el mapa le dio a Blanco J1 un ítem del catálogo, 5 DDE y 2 despojos y al Jugador 1 le
  llegó con su cartel. Con 🎮 el control de Blanco J1, el GM elige entre las dos (mapa y ficha), y las dos abren. En la ficha, el «Ver» de un ítem
  muestra solo su texto (la ficha no carga la tarjeta grande del mapa y GM Tools).
- **✅ hecho (2026-11-22) — 🤝 Compartir con un colega desde el menú de la izquierda** (dueño, 2026-11-22): «que los jugadores tengan en ese mismo menú
  izquierdo un botón con dos manos estrechadas para poder compartir con cualquier colega ítems, DDE o despojos. Que si está en modo combate y no
  está adyacente te advierta que la regla no lo permite en modo combate (con opción de dar igual)».
  *Resultado:* el **🤝 Dar** del jugador abre la ventana de siempre de pasar cosas (ofrecer / aceptar / rechazar), a cualquier personaje de la
  partida. En combate siguen las reglas de antes (solo ítems, pagan los dos en No2) y, si el elegido no está pegado, el aviso nuevo: «Están en combate
  y X no está al lado tuyo. La regla no permite pasarle cosas en modo combate a alguien que no esté adyacente. ¿Querés dárselo igual?» con **«Dar
  igual» / «Cancelar»**. En la ficha también: lee quién está pegado en el mapa publicado (antes decía «fijate en el mapa»). Probado con clics (Jugador 1
  y Jugador 2): fuera de combate, desde el mapa, un ítem, DDE y despojos (aceptados) y desde la ficha unos DDE (rechazados: volvieron); en combate,
  pegados, sin aviso (aceptado, 2 No2 cada uno); separados, desde la ficha: «Cancelar» (no se ofreció nada) y «Dar igual» (rechazado, nadie pagó);
  desde el mapa: «Dar igual» (aceptado). Sin ver: un jugador con dos personajes, y el 🎁 con un botín publicado (`docs/pruebas-en-el-mapa.md`).
- **✅ hecho (2026-11-22) — 🧪 Consumibles propios, a mano** (dueño, 2026-11-22): «que +ítem te deje crear ítems consumibles, pero sin automatización. Que le
  puedas poner nombre, descripción, configurarlos como consumibles, poder equiparlos en la mochila, consumirlos y que desaparezcan, pero que los
  efectos de los consumibles custom se resuelvan a mano». Vale también para «Ítem nuevo» de «Dar a un jugador».
  *Resultado:* en el asistente de ítems (`comun/asistente-item.js`: «+ Ítem» de la ficha, «✎ Ítem nuevo» de Dar a un jugador, el ✎ Ítem custom de GM
  Tools, la tienda y el editor del catálogo) la categoría Consumible va por un camino corto: Qué es (nombre y qué hace, obligatorio) · Unidades ·
  Precio/peso/ranuras · Listo; el ítem queda `consumoAMano` con «✋ A mano: el efecto lo resuelve la mesa.» en el Detalle. Se consume como cualquiera
  (No2 de siempre, una unidad menos, en 0 desaparece) y la Mesa dice «X usó Y: «lo que hace» · ✋ a mano: lo resuelve la mesa»; no toca vida ni
  estados. El formulario completo (con efectos automáticos) sigue a un botón del resumen. Probado con clics en «Claude · pruebas 2»: el Jugador 1 armó
  uno de 2 unidades desde su ficha, lo pasó al cinturón, lo consumió fuera de combate (ficha) y en combate (Botonera del mapa) y desapareció; el GM
  armó uno con «✎ Ítem nuevo» de Dar a un jugador y se lo dio al Jugador 2, que lo consumió desde la mochila. También la 🔍, el Ver y la tienda (sin
  guardar). En GM Tools no se le equipa a un creep (avisa; se sube o se da). Dudas: P284. Pruebas automáticas: 1003 en verde.
- **✅ hecho (2026-11-22; falta pegar las reglas) — ✉ Mensajes secretos entre usuarios** (dueño, 2026-11-22): «ofrecer la opción de mandar mensajes secretos entre usuarios, ya sea
  jugadores o GM. Podría ser desde el menú del log de Mesa, con algún comando, pero que el mensaje le aparezca al receptor con una especie de botón
  flotante tipo notificación de WhatsApp, tanto en el mapa como en la ficha». Proponer antes de programar.
  *Propuesta (2026-11-22):* **mandar** con un botón ✉ al pie de la Mesa (ventanita: «Para» con una casilla por persona —el GM y cada jugador,
  con el nombre de su personaje— y el mensaje) o escribiendo en la Mesa `/m Nombre texto`. **Recibir:** un botón redondo ✉ flotante abajo a la
  derecha del mapa y de la ficha (y GM Tools), con un globito rojo con la cantidad sin leer, que late al llegar uno; al tocarlo, la conversación
  con esa persona y una caja para responder. La Mesa no muestra nada. Preguntas: (1) ¿el GM puede leer los mensajes entre dos jugadores?;
  (2) ¿a la persona (cuenta) o al personaje?; (3) ¿se pueden mandar a varios a la vez?; (4) ¿se borran solos (por ejemplo, a las 48 h como la
  Mesa)?; (5) ¿un sonido al llegar? Necesita reglas nuevas de Firestore.
  **Decidido (dueño, 2026-11-22):** (a) el botón ✉ al pie de la Mesa abre la ventanita con casillas para mandar a **uno o varios a la vez**;
  (b) el comando en la Mesa (dictado «/R»; aceptar `/m` y `/r`) con **autocompletado al escribir las primeras letras**, con nombres de personajes
  y de usuarios; (c) al que lo recibe le aparece **en la Mesa con un color muy distintivo y algún brillo**, y **también en la Crónica** con
  animación, fondo y borde brillante, «algo que llame mucho la atención»; cuando se va de la Crónica queda el botón ✉ flotante tipo WhatsApp con
  las notificaciones; (d) **el GM no puede leer** los mensajes privados entre jugadores; (e) se manda **al jugador** (no al personaje), pero
  se lo puede elegir por el nombre de su personaje o por el suyo; (f) **queda un registro** de los mensajes, que **se limpia al limpiar el
  registro general** (no a las 48 h); (g) el **sonido** queda para cuando se haga la música (anotado en `docs/pendientes.md`).
  **Y la paloma** (dueño, 2026-11-22: «el botoncito flotante… podría tener el icono de una paloma blanca, como si fuera una paloma mensajera. El
  emoji»): el flotante es 🕊️, y también el botón del pie de la Mesa, la fila de la Mesa, la Crónica y las ventanas (P285 punto 4).
  *Resultado:* una sola pieza, `comun/mensajes.js`, que usan el mapa, la ficha y GM Tools. **Mandar:** el 🕊️ al pie de la Mesa abre la ventanita con
  una casilla por persona (el usuario y sus personajes; «Marcar a todos») y el mensaje; o en la caja de la Mesa `/m` (o `/r`) + nombre + texto, con
  autocompletado desde la primera letra (personajes 🎭 y usuarios 👤/👑; ↑↓ y Enter o Tab; elegir cualquiera lleva a la persona); `/m Nombre` sin texto
  abre la ventanita con esa persona marcada. **Recibir:** en la Mesa, una fila fucsia que brilla y destella («🕊️ Mensaje secreto de X»; tocarla abre
  la conversación); en la Crónica del mapa, una tarjeta que entra con un fogonazo, borde y fondo brillantes, ~20 s; después queda el 🕊️ flotante abajo
  a la derecha (en el mapa, en la esquina del lienzo; en la ficha y GM Tools, a la izquierda de la Mesa) con el globito rojo de los sin leer, que late
  al llegar uno. Tocándolo: las conversaciones (una por persona, de más viejo a más nuevo, lo propio a la derecha) y una caja para responder (Enter).
  **Privacidad y registro:** colección nueva `mensajes` (la leen solo quien manda y quienes reciben, en las reglas) y `mensajes_indice` (solo la fecha,
  para que el GM los borre sin leerlos); se borran con el 🗑 de la Mesa (todos) y con 🆕 Registro nuevo (los de antes del combate anterior), no solos.
  **Reglas de Firestore nuevas: hay que pegarlas**; sin ellas, la ventanita, la conversación y el comando dicen «Faltan pegar las reglas de Firestore
  de los mensajes…» y no se manda nada. **Probado con clics** en «Claude · pruebas 2» (sin las reglas): la ventanita del GM con las dos casillas, el
  aviso de las reglas al mandar, el autocompletado del Jugador 1 en el mapa (`/m bl`) y del GM en GM Tools (dos sugerencias, y por el nombre del
  usuario), el `/m` sin reglas (avisa, no sale ninguna tirada) y una tirada libre que sigue andando; y, **con mensajes armados en memoria** (no se
  escribió nada): la fila de la Mesa, la tarjeta de la Crónica (video), el 🕊️ con el globito en el mapa, la ficha y GM Tools (al lado de la Mesa, sin
  taparla), la conversación (marca leído, el globito baja) y Esc. **Falta con las reglas pegadas:** lo de abajo («Probar: …»). Dudas: P285.
  Pruebas automáticas: 1014 en verde.
- **✅ hecho (2026-11-22) — 📖 Glosario con el mouse en «Ver detalle» de trampas y zonas** (dueño, 2026-11-22: «quedó muy bien, por cierto… dice que quedás
  expuesto, pero ni yo me acuerdo el detalle de expuesto, debería poder leerse. Sumale glosario a otros términos que te parezcan pertinentes»).
  *Resultado:* la tarjeta (zonas, trampas, nubes, portales, tótems y estandartes) marca con el estilo del glosario cada término que tiene entrada, **una
  vez en toda la tarjeta** (la primera: lo destacado de arriba, después las filas —también el título «Fuego amigo»— y la descripción); los nombres («De
  quién es», «Con qué se puso») no se marcan. Ahí, además, PdG, Defensa y Evasión (en el resto del juego siguen sin marcarse). Entradas nuevas en
  `comun/glosario.js`: Res.Esp, Res.CC, Res.Mt (antes el globo decía solo el nombre largo), Fuego amigo, Mantenimiento, PdG, Defensa, Evasión, y Ef.Esp,
  PdG.Esp, Defensa especial, Resistencia elemental y Suela gruesa (el mapa no carga de entrada el cálculo de la ficha: sin esto no aparecían). Probado con
  clics en «Claude · pruebas 2»: el Portal trampa de Arcano 5 (Expuesto, Res.Esp, Fuego amigo) como GM y, ya disparada por el Jugador 1, como jugador;
  una zona puesta a mano con Pajaritos y Res.Mt (Pajaritos, Mantenimiento, Fuego amigo) como GM y jugador; el Tótem de silencio de Control mental 4
  (Evasión, Defensa) como GM y jugador. El globo queda por encima de la tarjeta. Dudas: P286. Pruebas automáticas: 1018 en verde.
- **✅ repasado (2026-11-22; se le mandó el resumen con lo que sigue abierto) — ❓ Repaso de P252 y P256 a P262** (dueño, 2026-11-22: «recordame… y corroborá si siguen pendientes»). Contarle cada una en simple
  y cuál sigue abierta.
- **✅ hecho (2026-11-22) — 🕵 Área contra alguien escondido (P263)** (dueño, 2026-11-22): «me parece que no se debería abrir el duelo para el atacante. Al
  personaje en sigilo sí se le debe ofrecer la oportunidad de esquivar, si correspondiera, y en el caso de que lo logre, todo eso debería pasar
  desapercibido por el equipo rival. Habría que contemplarlo». Y después: «si el que está escondido tarda en hacer su tirada, el juego se
  frenaría… habría que encontrar alguna forma creativa de resolver eso».
  *Resultado:* cuando un área (área, onda, cono o línea de rivales) alcanza a alguien que la pantalla que la lanza no ve (sigilo, oculto, niebla,
  nube), ese escondido va a **un área aparte, que corre en paralelo** (`vtt-hexgrid/js/130-area-oculta.js`), con la tirada de quien la lanzó (y el
  daño de una tirada para todos) hecha sola al lanzarla. Su duelo (`grupo.oculto`, `comun/duelo.js`) **solo lo ve quien lo maneja** (su jugador,
  el GM si es un creep, el GM con 👁) o quien lo ve; al bando que la lanzó **no se le abre cuadro, ni botón, ni Crónica, ni líneas de la Mesa**
  (marcadas `oculta-pj` / `oculta-creep`, js/29), ni el golpe de la onda, ni el «débil/resistente», ni carteles sobre su token, **esquive o no**
  (lo más conservador; P287). Su cascada sigue con los que ve; si no veía a nadie, «No hay nadie adentro del área», como si no hubiera nadie. **No
  frena a nadie:** si en 40 s nadie hace nada en ese duelo, la pantalla del GM lo resuelve sola (tira su resistencia con el valor de su stat, no se
  mueve, acepta el daño, tira y aplica los efectos). Quien maneja al escondido hace también lo del atacante (los efectos). Si el daño le saca más
  que su Sigilo, se delata como siempre (P288). Probado con clics en «Claude · pruebas 2» (GM, Jugador 1, Jugador 2): (a) Blanco J1 con
  Shockwave (dada por datos) contra un Blanco creep en sigilo pegado y el Protector 3 a la vista: J1 y J2 vieron solo el duelo del Protector; el
  GM resolvió el del creep con «✍ Elegir manualmente» — resistió (15) y no resistió (0, Pajaritos aplicado) — y J1 no vio nada ni en la Mesa;
  con el creep solo, J1 no vio ningún cuadro; sin contestar, a los ~45 s la pantalla del GM tiró la Res.CC del creep y cerró el duelo. (b) Arcano 3
  con la Nova arcana contra Blanco J2 en sigilo (y J1 a la vista): el GM vio solo el duelo de J1; J2 esquivó (30) y el GM no vio nada, ni en la
  Mesa; J2 no esquivó (1): aplicó el daño y el Empujón él mismo; el daño (7) le sacó más que su Sigilo (6), se delató (regla de siempre) y desde ahí
  el GM lo vio. De paso: un cartel que flota sobre un token (inmunidad, «−2 EVA») ya no sale en las pantallas que no ven ese token (js/96).
  Pruebas automáticas: 1026 en verde (8 nuevas). Dudas: P287, P288. Lo que faltó probar, abajo como «Probar».
- **⏸ movida al final (2026-11-23) — 🌫 Definir la niebla (P264), conversando** (dueño, 2026-11-22: «para esto deberíamos definir bien la niebla. Sé que vos medio que
  la inventaste y me dejé llevar, pero no estoy seguro de entender exactamente cómo funciona. Vamos a tener que conversar de esto para
  definirlo»). Preparar una explicación de cómo funciona hoy y las preguntas para decidir; no programar hasta conversarlo.
- **✅ hecho (2026-11-23) — 📺 ¿El Portal trampa tiene la animación de la tele?** (dueño, 2026-11-22: «imagino que la teletransportación tiene la animación de
  la tele encendiendo/apagando, ¿no?»). Verificar y, si no, sumarla (con video).
  *Resultado:* **no la tenía**: el televisor solo lo usaban el Parpadeo y el Intercambio arcano; las trampas que teletransportan y los portales hacían
  solo los pulsos violeta/azul con el hilo punteado, y el token saltaba. Ahora **todo teletransporte de un token** se apaga como un televisor viejo
  donde estaba y se prende donde llega, en todas las pantallas a la vez: el Portal trampa de los creeps, el Glifo de teletransporte y la Varita del
  portal (js/19), los portales de Invocar portal y la Trampa de teleport de Terreno y Formas (js/02; esta última hoy no se puede crear: ver abajo «Probar»);
  el Town portal solo se apaga (el token se va del
  mapa). Los pulsos quedan además (dicen entre qué dos puntos pasó: P289). Arreglo de paso en el televisor (también vale para el Parpadeo): si el
  movimiento del token llega tarde a una pantalla, la tele se queda apagada esperándolo en vez de prenderse en el destino y volver a verse en la salida
  (se vio en la prueba: la pantalla de quien pasaba por el portal volvía a dibujarlo en el portal ~3 s). Probado con clics en «Claude · pruebas 2»
  («Prueba · R4 M4», GM + Jugador 1 + Jugador 2): Blanco J1 pisó un Glifo de teletransporte del GM (tiró Inamovible, no le salió, «🌀 Atravesar el
  portal»); Blanco J2 usó un portal de Invocar portal de Blanco J1 (dos veces) y entró a un Town portal. En las tres pantallas: apagado en la salida →
  apagado mientras llega el dato → prendido en el destino, sin verse nunca en el destino antes ni deslizarse. Armado por datos: el Glifo se colocó
  llamando a la función del consumible (con los dos clics de verdad), los portales con la función de la habilidad (con los dos clics de verdad) y el
  Town portal creando el elemento. Videos `tele-trampa-glifo.mp4` y `tele-invocar-portal.mp4` (fuera del repo). Pruebas automáticas: 1027 en verde
  (1 nueva). Lo que faltó probar, abajo como «Probar».
- **✅ hecho (2026-11-23) — 🐀 Inicio de turno de alguien escondido** (dueño, 2026-11-22: «en realidad a los rivales no les debería salir nada, a sus aliados
  sí»). Revisar que sus aliados sí vean su inicio de turno (veneno, etc.).
  *Resultado:* antes, a un personaje escondido nadie le veía la tarjeta de su turno con el nombre (todos leían «Pasa el turno») y el GM, su rival,
  leía en la Crónica «▶ Empieza el turno de Blanco J2» con «Aplicar por él» y en la Mesa el reporte del veneno; de un creep escondido, el GM (su
  aliado) veía la tarjeta sin las líneas del veneno. Ahora hay una sola regla de «quién ve a quién» (`NoVisto.loVeElEscondido`, la usan la Mesa y
  la Crónica): lo de un escondido lo ve su bando, el GM con 👁 y quien lo esté viendo; a sus rivales, nada. Probado con clics en «Claude · pruebas 2»:
  Blanco J2 en sigilo y envenenado → el Jugador 1 ve la tarjeta con su nombre, el anillo dorado y el veneno en la Mesa; el GM, nada. Un creep en
  sigilo y envenenado → el GM ve la tarjeta con el veneno y el anillo; los jugadores, nada. Dudas: P290.
- **✅ hecho (2026-11-23) — 🎲 «Tirar iniciativa» mete tokens que no van** (dueño, 2026-11-22: «acabo de probar "tirar iniciativa" y metió al tótem y al
  estandarte. No deberían ir»).
  *Resultado:* entraban por «Traer tokens», que ponía en la lista **todos** los tokens del mapa; el tótem y el estandarte son creeps (con su ficha),
  así que después «🎲 Tirar iniciativa de los creeps» también les tiraba. Ahora hay una sola regla, «¿este token ocupa lugar en la iniciativa?»
  (`OrdenTurnos.ocupaLugar`): el tótem y el estandarte no; personajes, invocaciones, creeps y tokens sueltos sí; y si el token trae el campo
  `iniciativa` (sí / no), manda eso (lo va a usar el token suelto paso a paso). La usan Traer tokens (no los trae y, si estaban, los saca), Tirar
  iniciativa (no les tira), Ordenar (los saca), ▶ Siguiente y ⏭ Pasar de ronda (los saltean sin darles turno), ▶ Iniciar combate (no arranca por
  ellos ni les llena los No2) y las invocaciones y refuerzos que entran solos. **Probado con clics** en «Claude · pruebas 2»: Control mental 4 clavó
  su Tótem de silencio y Blanco creep su Estandarte (la habilidad se le dio por datos y se le sacó al final); Traer tokens, Tirar iniciativa de los
  creeps y Ordenar → 21 de 23 tokens en la lista, sin los dos. Un orden «viejo» con los dos adentro (puesto por datos): Tirar no les tira, Ordenar
  los saca, ▶ Siguiente pasa de Blanco creep a Control mental 4 salteándolos y ▶ Iniciar combate arranca con Control mental 4. Dudas: P291.
- **✅ explicado (2026-11-23) — 💬 Explicar P266 y P267** (dueño, 2026-11-22: «P266: elaborá esto, fuera de contexto no lo entiendo»; «P267: elaborá esto para que
  lo entienda»). Explicarlas con un ejemplo.
- **✅ hecho (2026-11-23) — 💀 Un creep que cae desde GM Tools también pierde sus estados (P270)** (dueño, 2026-11-22: «no debería ser así»; P270 decidida:
  caer en 0 = se borran los estados).
  *Resultado:* en GM Tools ningún camino los sacaba (el recuadro de HP, «Daño», el Mantenimiento con veneno, las habilidades…): solo el mapa
  (`modificarCreep`). En vez de tocar cada camino, GM Tools mira cada creep contra la última vida que le vio (al redibujar y en cada vuelta del
  guardado, `gmCaidasRevisar`, js/11): si pasó de tener vida a 0, se le van los estados con **el mismo corte que el mapa**
  (`Combatiente.caerSiCayo`, nuevo, que ahora usa también `modificarCreep`; quedan lo del equipo, lo derivado y la Llama sin usar), toast al GM y la
  línea «💀 X cayó: se le fueron N estados (…)» en la Mesa si los jugadores lo conocen (token no oculto, ya visto y sin Sigilo; si no, solo el toast).
  Lo que llega del mapa ya viene limpio: no se repite la línea. **Otros caminos fuera del mapa**: la ficha suelta ya sacaba los estados al caer pero no
  lo contaba (ahora sí, toast y Mesa, solo la pantalla que puede guardar al personaje); en el mapa, la Botonera nueva (`bnRevisarVida`) y el pase de
  turno de un personaje (`mantFijarHp`) también los sacaban sin la línea: ahora la dejan (`caidaContarPj`, js/11). Las invocaciones se desinvocan al
  caer. **Probado con clics** en «Claude · pruebas 2» (GM con GM Tools y el mapa abiertos, J1 y J2 con el mapa): Blanco creep con Veneno y Bendecido
  (por datos) → «0» en su recuadro de HP de GM Tools: sin estados, una sola línea en la Mesa de GM Tools y de los mapas del GM y de J1; con Veneno 3
  por turno y 2 de vida → «⟳ Pasar de ronda» de GM Tools (lo aplicó GM Tools): cayó, sin estados, una línea; con Sangrado y Afortunado → «999» en
  «Daño»: igual. Con GM Tools abierto, la vida a 0 desde el mapa (la función del «HP directo», por datos) dio una sola línea (la del mapa). La ficha
  suelta de Blanco J1 (Veneno y Bendecido por datos) → «0» en su vida: sin estados, una línea. Se devolvieron vidas, estados y el turno de GM Tools.
  Duda: P292. 2 pruebas automáticas nuevas (1040).
- **✅ explicado (2026-11-23) — 🎯 Repasar la Apuntada de las ballestas (P271)** (dueño, 2026-11-22: «necesitaría repasar cómo está anotada la Apuntada para
  entender esto»). Explicarle cómo está y qué preguntaba P271.
- **✅ hecho (2026-11-23) — 🔥 La Varita del muro de fuego también al empezar el turno (P272 decidida)** (dueño, 2026-11-22: «sí»).
  *Resultado:* el muro de la varita hace lo mismo que el de la habilidad: con orden de turnos ya no pega al pasar de ronda, sino al empezar el turno
  de cada rival que esté encima (un personaje lo ve como un renglón más de «▶ Empieza tu turno», con su botón; un creep, con el cartel de siempre
  en la pantalla del GM); al entrar o **cruzarlo** pega como siempre (antes solo al entrar terminando adentro: P294); sin orden de turnos, como
  hoy (al pasar de ronda). El texto de la varita, «Ver detalle», el cartel de arriba y la descripción de la tarjeta dicen «al entrar o cruzarlo y
  al empezar su turno adentro»; la tarjeta ahora muestra el texto del ítem (antes decía «no encontré una habilidad con ese nombre»). Las copias
  de la varita que ya estaban en mochilas o en el equipo de un creep se ponen al día solas al cargarse (en el mapa, la ficha y GM Tools; en
  Firebase la copia vieja queda hasta la próxima vez que se guarde esa parte: no hace falta tocar nada). **Probado con clics en «Claude · pruebas 2»** (GM, J1, J2): Blanco J2 la usó desde la Botonera (con la copia
  vieja: ya salió con el texto nuevo y el muro nuevo) sobre Blanco creep; Peleador 5 entró caminando → cartel, el daño lo tiró J2 (70 → 68);
  Blanco J1 (aliado) se paró encima → nada, ni al entrar ni al empezar su turno; con orden (J1, Blanco creep, J2) al empezar el turno del creep el
  GM vio «le toca a Blanco creep» y el daño lo tiró J2 (dos veces, ronda 1 y 2; 1 de daño, la Defensa especial 2 lo frenó); al pasar de ronda
  no pegó. Además, con la varita en un creep (para ver el renglón): J2 entró caminando a su muro (50 → 47, el daño lo tiró el GM) y al empezar
  su turno le salió el renglón «🔥 Varita del muro de fuego: estás adentro al empezar tu turno» con «🔥 Tirar el daño (1d4)» (47 → 44); al pasar
  de ronda, nada. Sin orden de turnos, al pasar de ronda les tocó a los dos, como hoy (44 → 43). Por datos: la varita vieja a Blanco J2 y una a
  Blanco creep, el orden de turnos, y al final se sacaron, se borró el muro que quedaba y se devolvieron vidas, No2, SP y estados (narrativo, sin
  orden). Otras zonas «en cada Mantenimiento» sin tocar: P295. 1 prueba automática nueva (1044).

- **✅ hecho (2026-11-23) — 🪟 Zona al empezar el turno: lo que quedó sin probar** (dueño, 2026-11-22: «lo que quedó sin probar, probalo. Y si no se puede,
  y si el problema es que la tirada falló para resistir, forzá la tirada con elegir el resultado manualmente»). Resistir con éxito desde el
  renglón (con «✍ Elegir manualmente»), una invocación con turno propio sobre el Muro, recargar la página antes de tirar la zona, la frase «Se
  aplicó solo al pasar el turno…», y confirmar que el botón de tirar el daño lo tira **el dueño de la zona** (dueño: «habitualmente es un
  rival. ¿Correcto?»), también cuando la zona es de un jugador.
  *Resultado:* **probado con clics en «Claude · pruebas 2»** (GM, J1, J2, mapa «Prueba · R4 M4»). (1) **Resistir desde el renglón: ✅** — una «Nube de
  prueba» (Res.Esp contra un número fijo, Pajaritos y 1d4) bajo Blanco J1: el renglón dice «resistió (Res.Esp 8 contra 1)», no entró daño (50) ni
  Pajaritos, y la ventana volvió con el resultado y «Entendido». La resistencia a una zona no tiene «✍ Elegir manualmente» (la tira sola el mapa: ya
  está en `docs/pendientes.md`, «Tiradas que todavía hace sola el mapa»); para que saliera alta, la zona se armó con dificultad 1. (2) **Invocación
  con turno propio sobre el Muro: ✅** — la Abeja de prueba (del Jugador 1) en el orden: al Jugador 1 le sale la misma ventana «▶ Empieza tu turno»
  con el Muro como renglón (no un cartel aparte); el daño lo tiró el GM y lo aplicó el Jugador 1 (30 → 25, Quemadura). Ojo: la ventana no dice que
  es el turno de la abeja (P299). (3) **Recargar antes de tirar: ❌ → arreglado** — antes se perdían la ventana y el renglón, y la zona **no se
  aplicaba nunca** (el inicio sí: al pasar el turno se aplicó solo, «Se aplicó solo al pasar el turno»). Ahora, si sigue siendo su turno, al
  recargar vuelven la ventana y el renglón (probado: volvió la Nube con su botón y resistió). (4) **La frase: ✅** — sin aplicar, el GM pasó el turno
  y la ventana de la abeja dijo «✔ YA SE APLICÓ · Se aplicó solo al pasar el turno. Lo de la zona sigue pendiente: tiralo igual.»; tirándola igual
  después funcionó (21 → 13). **Arreglado en el camino:** con la zona ya tirada seguía diciendo «sigue pendiente»; ahora queda solo «Se aplicó solo al
  pasar el turno.». (5) **Quién tira el daño: ✅** — Muro de un creep sobre la abeja: lo tira el GM, el Jugador 1 espera; Varita del muro de Blanco J2
  con un creep empezando su turno adentro: el GM ve el cartel «El daño lo tira Blanco J2», J2 tiene el botón y el GM espera («Tirar a mano» por si no
  responde) (60 → 57). **Visto de paso:** a la abeja la Quemadura del Muro le restó 2 apenas entró en su propio turno (25 → 23), y en la ronda
  siguiente su inicio dijo «nada que cambie» con la Quemadura puesta — va con la tarea de abajo. Tras recargar, la tarjeta «X está en <zona>…» de la
  Crónica quedaba «tirando» (se cerró a mano). **Por datos:** el Muro de fuego a Blanco creep (lanzado con clics desde sus Acciones), la Nube de
  prueba, la Varita a Blanco J2 (la usó con clics), mover la abeja, Blanco J1 y Blanco creep a las zonas, y el orden de turnos; al final se borraron
  las zonas, se vació el orden (narrativo) y se devolvieron vidas, No2, SP, estados, la mochila de J2, la abeja y las posiciones. Dudas: P299, P300.
  2 pruebas automáticas nuevas (1049).
- **✅ hecho (2026-11-23) — 🔥 ¿La Quemadura del Muro pierde un turno en el mismo momento en que entra?** (dueño, 2026-11-22, sobre la captura con
  «Quemadura: 3 → 2 turnos»: «quiero creer que esa es una quemadura previa… no tendría sentido que en el momento que se le aplica la quemadura
  por la zona de muro, se baje su cantidad de turnos de 3 a 2, tendría que por lo menos durar una ronda»). Verificar de dónde venía esa
  Quemadura y qué pasa cuando el Muro le pone otra encima (¿se renueva a 3?); que una recién puesta dure al menos una ronda entera.
  *Resultado:* **no pierde un turno al entrar: era la previa**, como sospechaba el dueño. Orden real: «✔ Aplicar» cuenta los estados que ya tenía
  (P177: bajan al empezar el turno) y recién después se tira el Muro. La Quemadura nueva pega una vez al ponerse (la regla de siempre: pega apenas te la
  ponen) y queda en 3; baja a 2 recién al empezar el turno siguiente. Si ya tenía una, el Muro la vuelve a 3 sin pegar otra vez. Si llega fuera de su
  turno (el Muro tirado después de pasar el turno), su próximo inicio no la cuenta ni le pega: ese era el «Nada que cambie» de la abeja. **Lo que se
  cambió es lo que se lee:** el renglón del Muro dice «Quemadura (3 turnos)» o «Quemadura: ya la tenía, vuelve a 3 turnos», y en vez de «Nada que
  cambie» sale «Quemadura: le llegó fuera de su turno, así que este turno no le cuenta ni le pega (ya pegó al llegar) — sigue con 3 turnos» (vale
  para todo estado que llegue fuera del turno). **Probado con clics en «Claude · pruebas 2»** (GM, J1, J2; el Muro de fuego en Blanco creep lanzado
  desde sus Acciones; Blanco J1 y la Abeja puestos encima por datos; orden J1, abeja, J2): ronda 1, J1: 50 → 46 (Muro) → 44 (la Quemadura al
  ponerse), «Quemadura (3 turnos)», en la ficha 3 turnos; ronda 2, J1: «Quemadura: 3 → 2 turnos · −2 HP (44 → 42)», el Muro 11 (42 → 31) y
  «Quemadura: ya la tenía, vuelve a 3 turnos», en la ficha 3; la abeja con el Muro tirado después de pasar su turno (30 → 25 → 23): en su inicio
  siguiente salió el renglón nuevo. Al final, todo como estaba (sin el Muro ni la habilidad, vidas, No2, SP, estados, la abeja y las posiciones;
  narrativo, sin orden de turnos). Capturas en la carpeta de la tanda. 2 pruebas automáticas nuevas (1051).
- **✅ hecho (2026-11-23) — 🐝 Las invocaciones en el orden de turnos, con su iniciativa** (dueño, 2026-11-22, P275: «una invocación debería ubicarse en la
  lista en el orden de turnos. Es más, agreguemos una función que al realizar una invocación, esta venga acompañada de una tirada de iniciativa y
  que automáticamente al invocarse se ubique en el orden de turnos de acuerdo a su tirada de iniciativa»). Ver cómo está hoy (hay invocaciones
  con turno propio y otras fuera del orden, como la abeja); lo dudoso, como pregunta.
  *Cómo estaba:* una invocación que aparecía en el mapa con el orden armado entraba al final con 0 y con Mareo de invocación, sin tirar nada; las que ya
  estaban al «Traer tokens» entraban con 0 y nadie les tiraba. Al irse (muerta o sin turnos) salía del orden solo si lo veía la pantalla del GM; si no,
  quedaba «(token borrado)».
  *Resultado:* al aparecer su token con el orden armado, la pantalla del GM tira la Iniciativa de la invocación (sus datos, con lo fijo como la Prisa), la
  tirada va a la Mesa («Iniciativa · Abeja de prueba», con dados 3D) y entra en su lugar: antes del primero que sacó menos (`OrdenTurnos.entrarConTirada`).
  La Crónica dice con cuánto y dónde quedó, y el mareo. Si su lugar ya pasó en esta ronda, juega desde la próxima (P301). Al irse su token sale del orden
  aunque lo haya borrado la pantalla del jugador (una sola vez, aunque lo pidan dos caminos). Dudas: P301–P304. **Probado con clics** en «Claude · pruebas 2»
  (GM y Jugador 1; la abeja puesta con «🎭 Ponerlo en el mapa»): con el turno del Jugador 1 (6) sacó 4 y quedó después del Jugador 2 (5); con el Jugador 1
  en 0 sacó 3, quedó antes que él, anotada como que ya jugó, y en la ronda siguiente le tocó su turno (mareada) después del creep; con «⏳ Turnos agotados →
  🗑 Borrar token» se fue del mapa y del orden. Al final, todo como estaba (narrativo, sin orden, la abeja en su casilla, sus datos iguales). 2 pruebas
  automáticas nuevas (1053).

- **✅ hecho (2026-11-23) — 👥 Token suelto: probar lo que faltó** (dueño, 2026-11-22: «probar lo que no se probó»; va a pegar las reglas pronto). Con las
  reglas pegadas: que otro jugador y el GM lean una descripción guardada de verdad (mouse y 🪪), un token suelto creado por el GM, y el
  «🎭 Ponerlo en el mapa» de una invocación que no está en el mapa.
  *Resultado:* todo anduvo, no hubo que arreglar nada. Probado con clics en «Claude · pruebas 2» («Prueba · R4 M4»): el Jugador 1 puso un cofre con
  descripción; el Jugador 2 y el GM, después de recargar la página (o sea, leyéndola guardada de verdad), la leyeron al pasar el mouse y en la tarjeta 🪪
  («Token suelto · lo puso Jugador 1»); el GM le cambió la descripción y el Jugador 2 vio la nueva. El GM puso un NPC con descripción y el Jugador 1 y el
  Jugador 2 la leyeron igual («lo puso el GM»). El Jugador 1 sacó a su Abeja de prueba del mapa, el panel 👥 mostró «🎭 Ponerlo en el mapa» en la fila de la
  invocación, y con eso la volvió a poner en su casilla (el GM la vio llegar). Al final: los tokens sueltos borrados y la abeja en su lugar, con su color.
- **🟡 a medias (2026-11-23: programado; faltan pegar las reglas y probar lo que depende de ellas) — 📦 Token suelto paso a paso: iniciativa y vida** (dueño, 2026-11-22, dictado; «esto es para objetos inanimados»): que crear un
  token suelto sea una serie de pasos: nombre y descripción; «¿Ocupa lugar en la iniciativa? Sí / No»; «¿El token tiene HP? Sí / No», y si
  tiene HP, que se lo pueda elegir como objetivo de ataques («y hasta ahí nomás»). Resuelve también P277. (El «agregar tener» del dictado
  era «agregarlo a la lista de pendientes», dueño 2026-11-22.)
  *Resultado:* «＋ Token suelto» ahora son tres pasos: **1. Cómo es** (nombre, descripción, imagen, color), **2. Iniciativa** («🎲 Sí: tiene su turno» /
  «🪨 No: queda afuera del orden de turnos») y **3. Vida** («❤ Sí: tiene vida y se lo puede atacar», con cuánta, de 1 a 9999 / «— No»). Uno nuevo
  arranca en «No» y «No» (P305); editar uno que ya estaba abre los mismos pasos. Con vida: su círculo rojo en el token (lo cambian quien lo puso y el
  GM), «❤ Vida 7 de 10» en la tarjeta 🪪 y al pasar el mouse, y **se lo puede atacar**: se defiende con «🪨 Evasión 1 (es un objeto)», sin tirar, y el
  golpe entra entero a su vida, sin Defensa, escudos ni estados (P306); en 0 queda «💥 Roto» en el mapa (P307). La de un objeto del GM, los jugadores
  no la ven en números (P308). P277 queda resuelta. **Hay reglas de Firestore para pegar** (los campos nuevos del token, y de paso `trampaDestino`, que
  faltaba al crear una trampa de teleport): sin pegarlas, el token se pone igual sin la iniciativa ni la vida y avisa «faltan pegar las reglas».
  **Probado con clics** (Jugador 1 y GM): los tres pasos, el aviso si la vida no es un número, Enter en el nombre pasa al paso siguiente, ponerlo en el
  mapa y editarlo con las reglas viejas (se pone / se guarda sin lo nuevo, con el aviso). **Sin probar, hasta que se peguen las reglas**: todo lo que
  guarda la iniciativa o la vida (abajo, «Probar»). 6 pruebas automáticas nuevas (1059).

- **✅ hecho (2026-11-23) — 🤝 El 🎁 queda solo para el botín (P278 decidida)** (dueño, 2026-11-22: «reemplazá el emoji del regalito por el emoji de las
  manos para que se entienda que esas manos son para pasar objetos y otras cosas. Que el regalo quede solo para el botín»): el 🎁 del «⋯» del
  token (mapa), el de cada fila de 👥 Personajes (GM Tools), el del Ver de un ítem y donde más aparezca para dar, pasan a 🤝; el cartel «🎁 El GM te
  dio algo» también. El 🎁 queda solo en Despojos / botín.
  *Resultado:* pasan a 🤝 el botón del «⋯» del token, el de cada fila de 👥 Personajes, «Dar a un jugador» del Ver de un ítem, la ventana «Dar a un
  jugador» (título, «🤝 Dar», «Dar igual», «Ítem nuevo para dar», el aviso de «Listo»), la línea de la Mesa «🤝 El GM le dio a…», el cartel «El GM te
  dio algo», «Dar como GM» del 🤝 Dar de la izquierda y «Darle un ítem» de mano a mano. El 🎁 quedó en Despojos (mapa, ficha, GM Tools), «Botín» de la
  ficha lite y de la ficha, «Botín concluido», la pastilla «Botín abierto», el aviso de lo que llega del botín, el piedra, papel o tijera por el botín y
  los arquetipos del botín. Dos 🎁 que no son ni dar ni botín (la casilla «Permitir agregar gratis» del generador de tiendas y los efectos de arma de
  la Guía de diseño) se dejaron: P309. En el menú de un token quedan dos 🤝 (mano a mano en el primer anillo, el del GM en el «⋯»): P310. **Probado
  con clics** («Claude · pruebas 2», GM y Jugador 1): el 🤝 del «⋯» sobre Blanco J1 (abre la ventana con él marcado); en GM Tools el 🤝 de la fila de
  Blanco J1 y «🤝 Dar a un jugador» del Ver de un ítem (con el ítem ya puesto); el GM le dio 1 DDE a Blanco J1 y en su ficha salió el cartel «🤝 El GM
  te dio algo» (después se le volvió a poner 0 DDE); el 🤝 de mano a mano del Jugador 1 sobre Blanco J2. Pruebas automáticas 1060/1060.

- **✅ hecho (2026-11-22) — 💨 Prisa: +5 fijo al resultado de la tirada de iniciativa** (dueño, 2026-11-22: «la Prisa quiero que sea +5 al resultado de la
  tirada. Fijo. Porque no es tan relevante. Está bien que sea un bono grande»). Hoy suma 5 al número de Iniciativa (el tamaño del dado: 6 → 1d6,
  11 → 1d10+1); pasa a sumarse 5 al resultado (1d6 → 1d6+5), en la tirada del mapa («🎲 Tirar iniciativa»), en la de la ficha y en lo que se vea
  (la 🔍, el texto de la pasiva, `Combatiente.PRISA_DETALLE`). Ojo con las fichas que ya tienen la Prisa (y la copia vieja `prisa`).
  **Y además** (dueño, 2026-11-22, dictado «de los scripts» = de los creeps): en el orden de turnos, el botón «🎲 Tirar iniciativa» del GM
  pasa a decir **«🎲 Tirar iniciativa de los creeps»**, para que se entienda que con un botón tira la de todos los creeps.
  *Resultado:* la Prisa suma +5 al resultado y el dado sale de la Iniciativa sin ella (Agilidad 6 → **1d6+5**; antes 1d10+1), en el mapa, la ficha, la
  Botonera, las Acciones de un creep y las invocaciones. La Mesa dice «1d6 +5 Prisa» con «Afectada por Prisa +5»; la 🔍 de Iniciativa muestra 6 → 1d6,
  «Prisa +5 (al resultado: no cambia el dado)» y «Se tira 1d6 +5 Prisa»; el botón de la Botonera, «🎲+5». Quien ya tenía la Prisa (las dos copias viejas)
  pasa solo a la nueva, y un resumen publicado con el +5 adentro no lo duplica (el mapa lee la ficha). El botón del GM dice «🎲 Tirar iniciativa de los
  creeps» (el de los jugadores sigue igual). **Probado con clics** en «Claude · pruebas 2» (la Prisa se le dio por datos a Blanco J1 y a «Blanco creep»,
  y se les sacó al final): tirada del Jugador 1 desde el mapa (con el resumen viejo y con el nuevo) y desde la ficha (el 🎲 del stat y la Botonera),
  la 🔍, el botón nuevo del GM (6 tiradas del creep con Prisa, todas entre 7 y 10 = 1d4+1+5) y las Acciones del creep. **Sin probar con clics:** una
  invocación con la Prisa (sí en las pruebas automáticas). 991 pruebas automáticas en verde. Duda nueva: P279 (¿el +5 antes o después de una mitad?).

- **✅ hecho (2026-11-22) — 📋 Respuestas a P252, P256, P259, P260 y P262** (dueño, 2026-11-22):
  1. **P252:** «la lista de iniciativa se limpia al terminar el combate» (cuando el fin del combate pasa el mapa a narrativo).
  2. **P256 (i):** «si le subís la vida a mano [a un caído], te debe aparecer una notificación que diga: el personaje está caído, ¿querés
     resucitarlo con esa cantidad de vida? Sí / No». Con No, elegir lo más simple (no se le sube la vida) y decirlo.
  3. **P259 (3):** la nube (Polvareda, Bomba de humo…) guarda quién la puso y con qué, sin delatar al que está escondido (reglas de Firestore).
  4. **P259 (4):** «Ver detalle» para los tótems y los estandartes.
  5. **P260 (4):** «las armas naturales sí se ven afectadas por las maestrías del mismo tipo de arma» (garras de Tipo 4 → punzantes, etc.).
  6. **P260 (7):** «volver a cargar una misma pasiva que uno ya tiene cuesta un punto de Job más que la carga anterior» (1, 2, 3…). Verificar si ya
     está así; si no, hacerlo.
  7. **P262 (5):** la ventana «Dar a un jugador» le avisa al GM, antes de dar, si a alguien le va a quedar la mochila llena.
  Al terminar, decirle al dueño cuál es la siguiente tarea de la cola.
  *Resultado* (probado con clics en «Claude · pruebas 2», GM + Jugador 1 + Jugador 2; 998 pruebas automáticas en verde; sin reglas nuevas de Firestore):
  1. ✅ Al terminar «🏁 Finalizar combate» (cuando pasa el mapa a narrativo) se vacía también el orden de turnos, como «Limpiar»
     (`TokensAuto.volverANarrativo` → `limpiarIniciativa`). El interruptor a mano no lo toca. Probado en un mapa vacío armado para la prueba (y borrado).
  2. ✅ Subirle la vida a mano a un caído (HP directo o +N, desde el token) pregunta «X está caído. ¿Querés resucitarlo con N de vida?» Sí/No. **Sí** = el
     mismo ✚ Revivir con esa vida (se van los estados, Titilando, línea en la Mesa «…subiéndole la vida a mano», animación corta); **No** = no le
     sube la vida y sigue caído. Probado con un personaje (J1) y un creep (GM). Duda: P280.
  3. ✅ La nube (Bomba de humo, Polvareda, varita de niebla, virote de humo) guarda quién la puso y con qué; «Ver detalle» y el cartel de arriba lo
     muestran, y a la pantalla que no ve a quien la puso le dice «Alguien» (sin «con qué»). **No hicieron falta reglas**: esos campos ya estaban
     permitidos. Probado con la Bomba de humo de J1 (en Sigilo): el GM ve «Alguien», J2 y J1 lo ven nombrado.
  4. ✅ «🔍 Ver detalle» de los tótems y estandartes, en el cartel del token: qué hace, a quién, de quién es, con qué se clavó, cuánto dura, cómo se
     rompe. Probado con el Tótem de silencio de un creep (GM y J1; con el creep oculto, J1 ve «Alguien»). Duda: P281.
  5. ✅ Las armas naturales y el puño (Tipo 4) cuentan para la maestría de su Tipo, en personajes, invocaciones y creeps. Probado en el mapa con un
     creep con garras (por datos) y la Maestría en armas punzantes: la 🔍 de Daño y de Atacar la muestran. Duda: P282.
  6. ✅ No estaba: cada copia costaba lo mismo. Ahora la copia N cuesta N − 1 de Job más que la primera (1, 2, 3…; ×3 de una de 1 = 6) y se ve «la próxima
     copia: N» en la pasiva y en el catálogo. GM Tools no aplica (los creeps no tienen Job). El tope de «la mitad del nivel» sigue igual.
  7. ✅ La ventana avisa abajo «A X le va a quedar la mochila pasada: 30 de 20 ranuras» y «🎁 Dar» pregunta «¿Dar igual?». Probado desde el mapa y desde GM
     Tools (se canceló: no se dio nada).
  Lo que quedó sin probar, en `docs/pruebas-en-el-mapa.md`. La siguiente de la cola: «🛡 Aguante de trinchera con cualquier daño».

- **✅ hecho (2026-11-23) — ☥ Probar: la animación corta al resucitar subiéndole la vida a mano** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): que se vea en las tres pantallas (P256 i). *Resultado* (con clics, «Claude · pruebas 2»): el Jugador 1 puso a Blanco J1 en 0 y después le escribió 12 en «2 · HP directo»; salió «Está caído. ¿Querés resucitarlo con 12 de vida?», con «Sí» volvió con 12, Titilando, la línea en la Mesa, y el resplandor corto (~1 s) se vio en las tres pantallas (GM, Jugador 1 y Jugador 2). Video: `1c-J2-animacion-corta-al-resucitar.mp4`.
- **✅ hecho, con un arreglo (2026-11-23) — ☥ Probar: resucitar a mano a una invocación caída** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): el cartel «está caído, ¿querés resucitarlo…?» con una invocación (P256 i). *Resultado:* una invocación que muere desaparece del mapa (regla del 2026-10-22), así que se volvió a poner la abeja caída con «🎭 Ponerlo en el mapa» y se le escribió 15: salió el cartel, «Sí» la levantó con 15, sin estados, con la animación corta en las tres pantallas y la línea «…vuelve con 15 de vida (lo revivió su jugador, subiéndole la vida a mano)», sin Titilando (como el ✚ Revivir de una invocación). **Arreglado:** el cartel le prometía «queda Titilando» también a la invocación; ahora no lo dice.
- **✅ hecho (2026-11-23) — ☁ Probar: la Polvareda de un creep escondido** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): «Ver detalle» y el cartel dicen «Alguien» a los jugadores (P259 3). *Resultado:* con el creep oculto, al Jugador 1 y al Jugador 2 el cartel de arriba dice «☁ NUBE (alguien)» y «Ver detalle» dice «De quién es: Alguien» y «Con qué se puso: No se sabe»; a ellos no les llegó ninguna línea de la Mesa. El GM ve «Polvareda (Blanco creep (creep))».
- **✅ hecho (2026-11-23) — ☁ Probar: la nube de la varita de niebla** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): guarda quién la puso y con qué (P259 3). *Resultado:* el Jugador 1 la usó desde la Botonera; en las tres pantallas el cartel y «Ver detalle» dicen «Blanco J1 (personaje)» y «Varita de niebla», 3 turnos.
- **✅ hecho (2026-11-23) — ☁ Probar: el virote de humo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): su nube guarda quién la puso y con qué (P259 3). *Resultado:* el Jugador 2 disparó la Ballesta de mano con el Virote de humo (falló); la nube cayó igual y en las tres pantallas dice «Blanco J2 (personaje)» y «Virote de humo», 2 turnos.
- **✅ hecho, con un retoque (2026-11-23) — 🚩 Probar: «Ver detalle» del estandarte** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): el del Estandarte de guerra, con y sin quien lo clavó a la vista (P259 4). *Resultado:* con el creep oculto, el Jugador 1 ve «Alguien» y «No se sabe»; con el creep a la vista, el Jugador 2 ve «Blanco creep (creep)» y «Estandarte de guerra». **Retoque:** decía «quien la puso no está a la vista» (lo de las zonas); ahora «quien lo clavó». El nombre del token todavía nombra al creep: es P281, ya en la cola.
- **❌ falló y quedó arreglado (2026-11-23) — 👊 Probar: el puño de un personaje con la maestría de punzantes, en un duelo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): (P260 4; tiene prueba automática). *Resultado:* el cuadro anunciaba «Maestría en armas punzantes: +1 al daño» pero el botón tiraba 1d4 + 6 (sin el +1): el Daño sin arma usaba la cuenta general y no la del arma. **Arreglado** (el cuadro del duelo y el Daño sin arma de la ficha): probado otra vez con clics, ahora «Tirar el daño · 1d4 + 7». El +1 por la espalda sí estaba.
- **✅ hecho (2026-11-23) — 🐝 Probar: una invocación con colmillos y la maestría de su Tipo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): (P260 4; tiene prueba automática). *Resultado:* la abeja con Colmillos (Tipo 4) y la Maestría en armas punzantes: la 🔍 del Daño muestra «Maestría… +1» (1d4 + 5) y en el duelo contra Blanco creep tiró 1d4 + 5 de verdad.
- **✅ hecho (2026-11-23) — 🎁 Probar: «Dar igual» con la mochila llena** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): darlo de verdad y ver el aviso del jugador; después devolver el inventario (P262 5). *Resultado:* el GM le dio 30 Agujas de tejer a Blanco J1 (mochila de 20): la ventana avisó «32 de 20», «🤝 Dar igual» le entró todo, al Jugador 1 le salió «Tu mochila quedó pasada: 32 de 20 ranuras…» y la Mesa lo dijo; después se le sacaron las 30.
- **✅ hecho (2026-11-23) — 🪧 El nombre del tótem y del estandarte no delata al creep (P281 decidida)** (dueño, 2026-11-22: «correcto, sacale el nombre
  del creep»): el token se llama solo «Tótem de silencio» / «Estandarte de guerra», sin «de <creep>». Los ya clavados, también.
  *Resultado:* eran los dos únicos tokens con el nombre del creep pegado (las trampas y los refuerzos no). Ahora el token, su ficha y su nota (la 🪪, que ven
  todos) se llaman como la habilidad. Los clavados antes los renombra sola la pantalla del GM al verlos. Probado con clics en «Claude · pruebas 2»: Blanco
  creep clavó un Estandarte de guerra y un Tótem de silencio; el GM, el Jugador 1 y el Jugador 2 ven «Estandarte de guerra» / «Tótem de silencio»; en
  «Ver detalle», con el creep a la vista los jugadores ven «De quién es: Blanco creep (creep)» y, escondido, «Alguien». Uno puesto a mano con el nombre
  viejo («Tótem de silencio de Blanco creep») el Jugador 1 lo vio así un segundo y enseguida cambió solo. Duda que salió: P311 (el aviso de la Mesa).

- **✅ hecho (2026-11-23) — 🎒 Revisar el sobrepeso, y que la mochila sobrecargada también cuente** (dueño, 2026-11-22; decidido en P312: opción (a)).
  *Resultado:* cada ranura de más de la mochila pesa 1 y se suma a lo equipado contra la Carga máxima (solo personajes). Cartel «⚖ Tenés sobrepeso»
  (o «tu sobrepeso subió») con todo lo que implica y la cuenta, al dueño, cuando le queda o le sube, venga de donde venga. Regla nueva: −1 a la
  Iniciativa por punto (la tirada lo resta y la tabla muestra ⚖−N); en combate, si cambia, el GM ajusta el número y lo acomoda sin repetir ni perder
  turno. Aceptar de otro jugador y sacar del baúl ya no se frenan: preguntan y dejan seguir. Textos «regla en prueba» y el manual (05, 08), al día.
  Probado con clics en «Claude · pruebas 2» (GM, J1, J2): equiparse en la ficha suelta y en el mapa, recibir del GM y de otro jugador, tirar
  iniciativa, y en combate sacarse/ponerse el peto (sube y juega ahí · ya jugó y no vuelve · no jugó y su lugar ya pasó: juega en el de siempre y
  se acomoda en la ronda siguiente). Todo quedó como estaba. Pruebas automáticas 1065/1065. Dudas: P313. Sin probar: el baúl y la tienda (abajo).
  *Ajuste P313 (2026-11-23):* en combate el número cambia en el momento y el orden recién al pasar de ronda (sin «¿vuelve a actuar?»); el cartel sale en
  una sola pantalla (la que guardó el cambio); carteles «bajó» y «Ya no tenés sobrepeso». Probado con clics (ficha + mapa abiertos, y en combate). 1066/1066.
  *El ⚖ alrededor del token (2026-11-23, dueño):* el Sobrepeso se ve como un estado más alrededor del token, con su globo (cuánto, la cuenta y lo que implica);
  se va solo al sacarse el peso. Visto con clics desde el GM, el Jugador 1 y el Jugador 2. 1067/1067.
- **✅ hecho (2026-11-23) — 🛡 Probar: el aviso del Aguante de trinchera en GM Tools** (2026-11-22, de la tarea «Aguante de trinchera con cualquier daño»): un
  creep con la pasiva, recibir daño desde el cuadro de daño de GM Tools y ver que el aviso dice que el Aguante se suma a mano (P283).
  *Resultado:* anda, sin cambios. Probado con clics en «Claude · pruebas 2» con «Blanco creep» (GM de pruebas): sin la pasiva, el «Daño» dice solo
  «10 − Defensa 5 = 5 de daño (60 → 55 HP)»; con la pasiva (dada con «+ Pasiva»), en el «Daño» de la ficha completa y en el de la tarjeta, golpe que
  entra y golpe frenado entero, suma «🛡 el Aguante de trinchera no se cuenta acá (lo cuenta el mapa): si tiene enemigos pegados, sumalo a mano». Quedó
  como estaba (60 de vida, sin la pasiva).
- **✅ hecho (2026-11-24) — 🛡 Probar: el Aguante de trinchera con el escudo elemental y el rayo en cadena** (2026-11-22, misma tarea): no tienen que sumarlo
  (son directos); se revisó el código y se probó solo con el Terreno incendiado.
  *Resultado:* anda bien, sin cambios. Probado con clics en «Claude · pruebas 2» con la pasiva en Blanco J1 y dos creeps pegados (el duelo decía
  «🛡 Aguante de trinchera +2: 2 enemigos pegados»): el Escudo ígneo de un creep, al entrar al anillo, 1d6 = 5 × 1,5 = 8 y le entraron 8 (50 → 42); el
  salto de la Cadena de rayos (8 a Blanco J2, salta 4 a Blanco J1), «Daño directo: no lo frena la Defensa ni la Defensa especial», 4 (42 → 38); y el
  control, un hachazo de 10: «10 − Defensa 1 − 🛡 Aguante de trinchera 2 = 7» (38 → 31). Quedó todo como estaba (vidas, pasivas, habilidades, posiciones).

- **✅ hecho (2026-11-24) — 🏷 Etiquetas y filtros para las pasivas** → docs/etiquetas-pasivas.md. Las 47 de fábrica con Rol, Estilo y Función
  (sin «stat»; racial y criatura quedan como etiquetas sueltas, sin filtro); «+ Pasiva» (personajes, invocaciones y creeps) con filas de botoncitos
  por familia, «sumar las de Cualquiera», «Mostrando N de 47», «✕ Limpiar filtros» y el buscador; el rol del creep viene marcado si se sabe (de la
  biblioteca de la que salió); el asistente de personaje nuevo usa los mismos filtros (y un buscador); «Subir a la biblioteca» etiqueta con los
  mismos botoncitos, con las sugeridas marcadas. Lo que no tiene etiquetas nuevas se ve siempre, «🏷 sin etiquetar» (P316). Probado con clics.
  (Pedido original: dueño, 2026-11-22: «que las habilidades pasivas tengan tags y
  filtros. Por ejemplo, Aguante de trinchera es buena para warrior y para tanque y para melee en general, entonces pueden estar esos tags. Buscar
  cierto universo de tags para poder crear filtros a la hora de elegir pasivas»). Hoy `etiquetas` sueltas (ofensiva, defensiva, stat, utilidad,
  resistencia, regeneración, visión, percepción, racial). Preparar una propuesta (rol: warrior, tanque, liviano, rango, mago, support, debuffer;
  estilo: cuerpo a cuerpo, distancia, mágico; función: daño, defensa, movilidad, control, curación, sigilo…) y los filtros del catálogo de
  «+ Pasiva»; conversarlo con el dueño antes de programar.)

- **✅ hecho (2026-11-24) — 🛡 Revisar el caso raro: arma que perfora contra la Defensa especial con Aguante de trinchera** (dueño, 2026-11-22: «revisar
  ese caso raro de la perforación y defensa especial»; P283, punto 2): hoy el Aguante se resta después de lo que «pasa siempre» por Perfora, así
  que puede frenar parte de eso. Explicarle el caso con números y proponer.
  **Hecho (dueño eligió la (a), P283 punto 2):** contra la Defensa especial, el Aguante se suma a la Defensa especial antes de contar la Perfora, como en
  la común (`Combatiente.perforaContraEsp`; en ese caso js/10 no lo vuelve a restar). La cuenta del daño muestra la Defensa especial real, el Aguante en
  su renglón y «La Defensa especial (8) frenaba más: pasan 3 por Armas perforantes» (antes decía «Defensa especial 4/5», también sin Aguante). Ejemplo
  probado con clics en «Claude · pruebas 2» (8 de daño, Defensa especial 6, Aguante +2, Armas perforantes 3): antes entraba 1, ahora 3; sin el Aguante,
  3; sin Perfora, igual que siempre (lo frena entero). Pruebas automáticas en verde (1076).

- **✅ hecho (2026-11-24) — Probar: ⬆ Subir al catálogo un consumible propio** (2026-11-22, de los consumibles a mano): no se probó con clics para no
  sumar un ítem de prueba a la biblioteca compartida. Ver que suba con su «✋ A mano» y que, tomado del catálogo, se consuma igual.
  *Resultado:* había dos fallas, arregladas: (1) en la ficha, la ventana «⬆ Subir a la biblioteca» se abría **detrás** del asistente de ítems y no se podía
  tocar (`comun/capas.js` le borraba su capa propia; ahora la respeta: vale para cualquier ítem y también en GM Tools); (2) al subirlo desde la mochila se
  perdía la marca ✋ (`itemComoEntradaDeCatalogo`): en el catálogo salía «+0 HP al consumir» y la copia tomada ya no era «a mano». Con los arreglos, probado
  con clics en «Claude · pruebas 2» (Jugador 1, «Poción de prueba (borrar)», 2 unidades): subió 🔶 sin auditar; en el catálogo (con el 👁: los consumibles
  que no son esenciales no se ven sin él, P317) y su Ver dice «2 unidades · ✋ el efecto lo resuelve la mesa»; comprada a 0 DDE, la copia es ✋ a mano y se
  consume igual que la original (−1 No2, la Mesa «usó … · ✋ a mano: lo resuelve la mesa», en 0 desaparece). Al final el Jugador 1 la descartó con
  «🗑 Descartar» en la Auditoría de lo subido (la biblioteca quedó sin nada de prueba) y su ficha volvió a como estaba. Pruebas automáticas 1078/1078.

- **✅ hecho (2026-11-24): ya no aplica — Probar: un consumible propio en el editor del catálogo (`datos/catalogo-editor.html`)** (2026-11-22): no se abrió; ver que se
  guarde como consumible con su marca ✋.
  *Resultado:* el catálogo de fábrica no lleva consumibles a mano (P317): en el editor, elegir Consumible abre el formulario de siempre (con efectos), sin ✋;
  visto con clics sin guardar nada (el catálogo quedó igual, 1530 ítems, sin ninguna escritura).
- **✅ hecho (2026-11-24) — 🧪 Los consumibles a mano no van al catálogo (P317)** (dueño, 2026-11-24: «es para uso específico, narrativo de la partida. No
  quiero que nada de eso vaya al catálogo»). *Resultado:* un consumible propio «a mano» ya no muestra «⬆ Subir al catálogo» en ningún lado: el asistente de
  ítems (al elegir Consumible el botón desaparece; vuelve si se elige otra categoría), el editor de la mochila y el cinturón de la ficha, «✎ Ítem custom» de
  GM Tools, y el «✎ Editar y subir» del Ver (ficha, Botonera del mapa, GM Tools y tienda) no aparece para esos ítems. Si algún camino lo intenta igual, no
  sube y avisa «Los consumibles a mano son de la partida: no van al catálogo» (`Combatiente.noVaAlCatalogo`, y la última puerta en `Biblioteca.guardar`).
  El resto de los ítems sube como siempre. En «✎ Ítem custom», el aviso de «no se le equipa a un creep» ahora dice que se da con 🤝. En la biblioteca no
  había ningún consumible a mano subido. Probado con clics en «Claude · pruebas 2» (Jugador 1 en su ficha: un arma tiene el ⬆, el consumible no, ni al
  editarlo; el Cuchillo sí; el consumible de prueba se eliminó; GM en GM Tools: igual) y el editor del catálogo sin guardar. Pruebas automáticas 1079/1079.

- **✅ hecho (2026-11-24) — 🎒 Aviso equivocado al pasar al cinturón** (visto en la tarea de consumibles propios, 2026-11-22): al mover 1 unidad con
  «→ Cinturón», el aviso dice «el cinturón está lleno (1/5)» aunque no lo está. Revisar y corregir el texto.
  *Resultado:* el aviso tomaba «quedan unidades en la mochila» como «no entraron», y con «→ Cinturón» (que mueve de a una) siempre quedan. Ahora
  `FichaEquipo.alCinturon` devuelve además cuántas de las pedidas no entraron y el aviso dice «lleno» solo entonces: «1 unidad pasó al cinturón (1/5) ·
  quedan 3 en la mochila»; la que lo llena suma «· el cinturón quedó lleno»; lleno de verdad, «no entra, el cinturón está lleno (5/5)»; si entra parte,
  «1 unidad pasó… · 2 unidades no entraron: el cinturón está lleno y quedan en la mochila». Recibir de otro jugador al cinturón dice también cuántas
  fueron a la mochila. Probado con clics con Blanco J1 (antes y después): de a una con el cinturón vacío, varias seguidas, casi lleno, lleno, y con el
  Cinturón de utilidad equipado (6/8). La ficha quedó como estaba. Los creeps ya lo decían bien. Prueba nueva en `comun/pruebas.html` (1080 en verde).
- **✅ hecho (2026-11-23) — 🤝 Revisar el botón «Dar un ítem» del «⋯» del token** (visto en la misma tarea): con un clic el ayudante no encontró el botón y
  abrió la ventana por función. Ver si el botón está y se puede tocar (se cruza con el cambio de 🎁 a 🤝).
  *Resultado:* el botón está y anda: el GM toca el token de Blanco J1, el «⋯», y ahí aparece (ahora 🤝, entre 😇 y ↩); con un clic de verdad abre «Dar
  a un jugador» con Blanco J1 ya marcado. Lo que falló antes fue la prueba: buscaba un botón con el texto «Dar un ítem», y el botón muestra solo el
  ícono (el texto está en el globo al pasar el mouse). No hizo falta cambiar nada.

- **✅ hecho (2026-11-24) — 🎲 Consumible propio con una tirada opcional** (dueño, 2026-11-22, P284: «no estaría mal agregarle como opción tirar un dado»):
  en el asistente, un campo opcional «Tirada al consumirlo» (por ejemplo 1d6, 2d4+1); al consumirlo se tira sola y sale en la Mesa junto al
  «✋ a mano». Sin tirada, como ahora.
  *Resultado:* el campo «🎲 Tirada al consumirlo (opcional)» está en el paso «Unidades» del consumible a mano; si no es una fórmula de dados lo marca
  en rojo y no deja guardar (vuelve a ese paso). Se guarda en `tiradaExtra`, que ya tiran todos los caminos de Consumir (ficha y Botonera del mapa):
  se tira sola con los dados de siempre, a nombre de quien lo consume, y la línea «✋ a mano» de la Mesa suma «🎲 2d4+1 = 6». El Ver dice
  «🎲 al consumirlo: 2d4+1». Sigue sin ir al catálogo (P317). Sin «✍ Elegir manualmente» (las tiradas parecidas, la de las varitas a mano, tampoco lo
  tienen). Probado con clics con Jugador 1: crear uno con 2d4+1 (y uno mal escrito) y otro sin tirada, Ver, consumirlos en la ficha y en la
  Botonera del mapa, y la Mesa vista desde la pantalla del GM de pruebas. La ficha quedó como estaba. 4 pruebas nuevas en `comun/pruebas.html` (1085 en verde).

- **✅ hecho (2026-11-24) — ✉ Probar los mensajes secretos en el mapa, con clics, con las reglas de Firebase pegadas** (las reglas pegadas son las del repo: mandar no dio «faltan pegar las reglas»; los casos, abajo) (dueño,
  2026-11-22: «vamos a dejar al final de la cola probar este sistema en el mapa con los clics una vez que estén pegadas las reglas de Firebase…
  cuando llegue el turno de esa tarea, vamos a chequear que las reglas estén actualizadas y vamos a proceder con las pruebas»). Primer paso:
  verificar que las reglas pegadas sean las del repo (que mandar un mensaje no dé «faltan pegar las reglas»); si no, avisarle al dueño y esperar.
  Los casos, uno por renglón, son los «Probar: 🕊️ …» de abajo.

- **✅ hecho (2026-11-24) — Probar: 🕊️ mandar un mensaje secreto de verdad** (2026-11-22, de los mensajes secretos; con las reglas pegadas): el Jugador 1 le
  manda al Jugador 2 con la ventanita; al Jugador 2 le aparece en la Mesa (fila fucsia), en la Crónica del mapa y en el 🕊️ con el globito.
  *Resultado:* desde la paloma del mapa del Jugador 1 → «Mensaje secreto» → Jugador 2; al Jugador 2 le salió todo eso, más el aviso flotante y la
  paloma vibrando; tocar el aviso abrió la conversación y el globito bajó a 0.
- **✅ hecho (2026-11-24) — Probar: 🕊️ el GM no lee lo de dos jugadores** (2026-11-22, con las reglas pegadas): el Jugador 1 le escribe al Jugador 2; en la
  pantalla del GM no aparece nada (ni Mesa, ni Crónica, ni 🕊️), y una lectura directa del GM por la API la rechaza.
  *Resultado:* en el mapa del GM, nada (ni fila, ni Crónica, ni globito, ni aviso); leer ese mensaje directo con la cuenta del GM: «permission-denied».
- **✅ hecho (2026-11-24) — Probar: 🕊️ un mensaje a varios** (2026-11-22, con las reglas pegadas): el GM le escribe a los dos jugadores a la vez; cada uno lo ve
  con «También para…» y su respuesta le llega solo al GM.
  *Resultado:* así: «Solo lo ves vos (y Jugador 1)» en la Mesa y «También para: …» en la conversación; la respuesta del Jugador 2 le llegó solo al GM.
- **✅ hecho (2026-11-24) — Probar: 🕊️ el comando /m y /r de verdad** (2026-11-22, con las reglas pegadas): `/m Blanco J2 hola` (por el personaje) y `/r` + el
  nombre del usuario; que salga, que no aparezca en la Mesa de nadie más y que `/m Nombre` sin texto abra la ventanita con esa persona marcada.
  *Resultado:* `/m Blanco J2 …` del Jugador 1 le llegó al Jugador 2; `/r …` (ya sin nombre, P285.2) del Jugador 2 le llegó al Jugador 1 (el último que
  le había escrito); el GM no vio ninguno de los dos; `/m Blanco J2` sin texto abrió la ventanita con el Jugador 2 marcado. También `/m Todos …` (público).
- **✅ hecho (2026-11-24) — Probar: 🕊️ leído / sin leer en dos pantallas** (2026-11-22, con las reglas pegadas): el Jugador 2 con el mapa y la ficha abiertos;
  al abrir la conversación en una, el globito baja en las dos.
  *Resultado:* un secreto: las dos pantallas en 1, se leyó en el mapa y las dos quedaron en 0. Un 📣 público: las dos en 1, se leyó en la ficha y las
  dos en 0 (en el mismo navegador; ver P318.3).
- **✅ hecho en parte (2026-11-24) — Probar: 🕊️ el GM borra con el 🗑 de la Mesa y con 🆕 Registro nuevo** (2026-11-22, con las reglas pegadas): que desaparezcan de la
  Mesa y de las conversaciones de los jugadores (el 🗑, todos; el Registro nuevo, los de antes del combate anterior).
  *Resultado:* el 🗑 del GM en «Claude · pruebas 2» («Historial borrado (1 tiradas y 1 mensajes secretos)»): se fueron de la Mesa de los tres, de la
  conversación abierta del Jugador 2 en vivo, y por la API no quedó ninguno (tampoco el 📣 público). Ojo: el 🗑 borró además toda la Mesa de esa
  partida. **«Registro nuevo» no se probó**: borra de verdad las tiradas, el 📜 historial y los mensajes de antes del combate anterior de la partida
  de pruebas; queda abajo, al final de la cola, para cuando el dueño diga.
- **✅ hecho (2026-11-24, «hacelo», dueño) — Probar: 🕊️ «Borrar la partida» se lleva los mensajes** (2026-11-22, con las reglas pegadas): en una partida de prueba descartable.
  *Resultado:* el GM de pruebas creó «Claude · descartable (borrar)», el Jugador 1 y el Jugador 2 se sumaron con «Unirse», se mandaron dos secretos y
  un 📣 (el índice tenía 2); «Borrar la partida» (con el nombre revisado antes de confirmar) la borró sin errores. Para mirar adentro se volvió a crear
  vacía con el mismo id: 0 secretos, 0 en el índice, 0 públicos; después se la borró de nuevo. Las tres cuentas siguen en «Claude · pruebas 2».

- **✅ hecho (2026-11-24) — 🕊️ Ajustes de los mensajes secretos (P285)** (dueño, 2026-11-22):
  1. **Mensaje público:** «que también exista la posibilidad de mandar un mensaje público» (a toda la mesa; que se vea distinto de una tirada).
  2. **`/r` responde al último que me escribió**, sin poner el nombre («me gusta la sugerencia»); `/m` sigue con el nombre.
  3. **La paloma flotante, siempre a la vista y la ruta principal** para abrir los mensajes («más que la Mesa; de última que sean ambas»):
     que se vea aunque no haya mensajes.
  (Respondido además: se borran con el 🗑 y con «Registro nuevo», bien; paloma en todos lados, bien; sin «responder a todos».)
  4. **Directrices del dueño (2026-11-24, ya lo probó un poco):** «el botón redondo de la paloma sea el lugar para iniciar una conversación,
     para iniciar un mensaje. También para escribir un mensaje que sea para todo el grupo. Y esa misma paloma con un numerito rojo es para abrir
     la conversación, pero al mismo tiempo los mensajes que uno puede ver también le tienen que aparecer en la mesa del log. Y cuando recibís un
     mensaje, el botón tiene que también vibrar un poquito. Y alguna especie de notificación flotante de te llega un mensaje». Se hace junto con
     las pruebas de los mensajes de arriba.
  *Resultado (todo en `comun/mensajes.js`, sin reglas nuevas):* **la paloma** está siempre a la vista (mapa, ficha y GM Tools); con un numerito rojo
  (secretos + públicos sin leer) abre esa conversación; sin nada nuevo abre la ventana con «🕊️ Mensaje secreto» y «📣 Mensaje a todo el grupo», y la
  lista: «📣 Todo el grupo» arriba y una conversación por persona. **📣 A todo el grupo:** una casilla en la ventanita de mandar, la conversación del
  grupo, o `/m Todos texto`; sale en la Mesa de todos (también del GM) en dorado, distinto de una tirada y de un secreto (es una línea de la Mesa,
  así que se borra como las tiradas: P318.1). **En la Mesa** cada uno ve lo que le llega, lo que mandó (otro tono, sin brillo) y lo público, una sola
  vez; el GM sigue sin ver lo de dos jugadores. **Al llegar uno**, la paloma vibra un poquito y sale encima un aviso («🕊️ Te llegó un mensaje de X» /
  «📣 X le escribió a todo el grupo», con el principio del texto) que al tocarlo abre la conversación y se va solo a los 7 s (con «reducir movimiento»,
  sin vibrar). **`/r texto`** responde al último que te mandó un secreto. Probado con clics con las tres cuentas en «Claude · pruebas 2» (los
  renglones «Probar: 🕊️ …» de arriba), con video de la paloma vibrando y el aviso. Los mensajes de prueba se borraron. Dudas: P318. Pruebas
  automáticas: 1090 en verde.
- **✅ hecho (2026-11-24) — Probar: 📖 glosario en «Ver detalle» de una zona con daño** (2026-11-22): el Muro de fuego (o una zona con daño de elemento) en el
  mapa: que se marquen Defensa, Defensa especial y la resistencia al elemento en «Qué frena el daño», y Suela gruesa si es del piso.
  Probado con clics en «Claude · pruebas 2»: el Blanco creep levantó un Muro de fuego de 4 casillas desde la Botonera; «Ver detalle» desde el GM
  y desde el Jugador 1. En «Qué frena el daño» salen marcadas, cada una con su globo al pasar el mouse, **Defensa**, **Defensa especial**,
  **resistencia al fuego** (el globo dice que es lo único que frena el daño directo de ese elemento) y **Suela gruesa** (es del piso). En el
  resto de la tarjeta: Quemadura, Fuego amigo y «vuela» (en Altura); el GM ve además «daño de fuego directo» en la descripción de la habilidad
  (el jugador no la ve: es de un creep). Cada término una sola vez. Nada que arreglar. El muro se borró y el creep quedó como estaba.
- **✅ hecho (2026-11-24) — Probar: 📖 glosario en «Ver detalle» de un estandarte y de una nube** (2026-11-22): el Estandarte de guerra (PdG / Probabilidad de
  Golpe) y la nube de una Bomba de humo o de la varita.
  Probado con clics en «Claude · pruebas 2», desde el GM y desde el Jugador 1: **Estandarte de guerra** (lo clavó el Blanco creep): se marcan
  **Probabilidad de Golpe** (en la frase de arriba), **Evasión** y **Defensa** (en «Cómo se rompe»), con su globo. **Bomba de humo** (la del
  Blanco creep): se marcan **Fuego amigo** y **Sigilo** (en «Estado que deja»); el GM ve además «por la espalda» en la descripción. Los globos
  quedan por encima de la tarjeta y se leen enteros. Detalle menor, sin tocar: el globo de «Probabilidad de Golpe» empieza repitiendo
  «Probabilidad de golpe.» (el texto está pensado para cuando dice «PdG»). La varita de niebla no se probó (la entrada pedía una de las dos).
  El estandarte y la nube se borraron y el creep quedó como estaba.

- **✅ hecho (2026-11-24) — 📖 Revisar en contexto: «Silencio» en el nombre del tótem y el glosario** (dueño, 2026-11-22: «la observación de que marcaba
  silencio como un estado la pondría para revisar al final, porque técnicamente el silencio es un estado, pero lo revisamos en contexto más
  tarde»). Hoy, en «Ver detalle», las filas de nombres («De quién es», «Con qué se puso») no se marcan, así que «Tótem de silencio» no muestra
  el globo del estado Silencio. Mostrarle el caso y decidir juntos.
  **Lo que se vio (2026-11-24, con clics en «Claude · pruebas 2», J1 y GM, un tótem clavado por el Blanco creep):** el tótem **no le pone el
  estado Silencio a nadie**: es un aura de lugar que hace lo mismo (al querer usar una habilidad que cuesta SP adentro, avisa y deja seguir si la
  mesa lo decide), pero el personaje no queda con el estado (no aparece en su ficha, no se resiste y no lo frena «Inmune a controles mentales»,
  que sí frena al estado). La palabra sale solo en el título («🤐 Tótem de silencio») y en «Con qué se puso»; ninguna de las dos se marca. La
  frase de arriba dice «no pueden usar habilidades que cuestan SP», sin nombrar el Silencio, y no hay fila «Estado que deja». Lo único marcado
  en toda la tarjeta: Evasión y Defensa (en «Cómo se rompe»). El globo del estado, si se marcara, diría «Silenciado: no puede usar habilidades
  que cuestan SP mientras dure».
  **Opciones:** (a) dejarlo así: es un nombre, y la frase de arriba ya explica el efecto; (b) sumar a la frase de arriba «(como el estado
  Silencio, pero por estar adentro)» con su globo, para que se entienda que es el mismo efecto sin ser el estado; (c) marcar también las filas
  de nombres (el globo saldría también en un creep o una habilidad que se llame como un término). **Recomendación de Claude: (a)** —o (b) si
  querés el globo—; (c) no, porque diría que el tótem pone un estado que no pone. Para decidir aparte: si el tótem debería respetar
  «Inmune a controles mentales» como el estado.
  **Decidido (dueño, 2026-11-24):** «técnicamente mientras estás en el efecto [del tótem], sí te tiene que aparecer el estado de silencio. Y cuando
  te vas, se te va el estado de silencio. Entonces ahí también se resuelve lo de la inmunidad del control mental». O sea: el aura del Tótem de
  silencio le pone el estado Silencio (el de verdad, el del glosario) a los rivales mientras están adentro y se lo saca al salir (o al romperse
  el tótem); con eso «Inmune a controles mentales» lo frena como al estado.
  **Y (dueño, 2026-11-24):** el título no se marca con el glosario, y la descripción del tótem queda igual («a fines prácticos sucede
  lo mismo, solo que mecánicamente aparece el estado o no»). Opción (a) para el texto.
  *Resultado (2026-11-24):* el aura del tótem le pone el estado Silencio de siempre a los rivales que están adentro («mientras esté en el aura del
  tótem», sin turnos) y se lo saca al salir, al romperse o al borrarse el tótem (`vtt-hexgrid/js/134-totem-silencio.js`). Lo pone una sola pantalla:
  la del jugador (o quien tiene 🎮 el control) para un personaje o invocación, la del GM para un creep. Lo frena lo que frena al estado (Inmunidad
  mental, Inmunidad a CC, Invulnerable): no le entra, cartel «INMUNE» y línea en la Mesa. Al querer usar una habilidad de SP sale el aviso de
  siempre del estado, una sola vez. Un Silencio que ya tenía por otra cosa no se toca (P319). Título y descripción del tótem, igual; ya no sale el
  «Silenciado (tótem)» de área (sería doble). Probado con clics en «Claude · pruebas 2» (GM y Jugador 1): entrar (iconito, globo, ficha), el aviso
  al usar Remolino, salir, Inmunidad mental, romper el tótem, borrarlo y con un Silencio previo.
- **✅ hecho (2026-11-24) — Probar: 🙈 golpe a un personaje escondido que NO lo delata, visto desde el GM** (2026-11-22, P263): un área de un creep sin daño
  (o con daño menor que su Sigilo) contra un personaje en sigilo; que el GM no vea nada aunque le pegue. En la prueba, la Nova arcana siempre lo delató.
  Probado con clics en «Claude · pruebas 2» (GM de pruebas y Jugador 1, cada uno en su pantalla). Blanco J1 (Sigilo 6) escondido al lado de los creeps.
  (1) **Grito espeluznante** de Control mental 4 (onda de 3, 1d6 de daño: nunca pasa de 6, así que con Sigilo 6 nunca lo delata): al GM solo le
  salió «Grito espeluznante ejecutada» y la línea de siempre de la habilidad; nada de J1 (ni cuadro, ni Crónica, ni Mesa). J1 tuvo su duelo aparte
  (Res.Mt), perdió a propósito, le entraron 3 (1 + 2 de la Botella del creep: 50 → 47), se le puso Pánico y **siguió en Sigilo**; el GM siguió sin verlo.
  (2) **Nova arcana** de Arcano 3 con 5 de daño: J1 la esquivó; el GM no vio nada. (3) **Control**: Nova arcana con 9 de daño, J1 no la esquivó → «🕶
  Blanco J1 se delató y salió del sigilo», el GM lo ve y ve la línea del golpe. **❌ Lo que lo delata igual** (a la cola, abajo, y P320): los talismanes
  de quien lanza el área publican en la Mesa para todos. En (1), al GM le salió «😈 La Botella de Control mental 4: … el diablito se ríe» y el cartel
  «El diablito se ríe» (o sea: le pegó a alguien); en (3), «🔮 Cabeza reducida de jíbaro de Arcano 3: Blanco J1 queda Maldito», con el nombre, antes
  de que se delatara. Capturas en la carpeta de la prueba (cola86).
- **✅ hecho (2026-11-24) — Probar: 🙈 área contra un escondido con línea, cono, área con centro y con dodge roll** (2026-11-22, P263): solo se probaron ondas
  (Shockwave, Nova arcana). Mirar la Lanza arcana (chispas solo sobre los que se ven), un cono y un área con dodge roll (el escondido se mueve solo
  en su pantalla).
  Probado con clics en «Claude · pruebas 2» (GM de pruebas y Jugador 1, sin 👁), Blanco J1 en Sigilo y Arcano 3 lanzando (a Arcano 3 se le prestaron
  la Bola de fuego y el Hálito polar mientras duró la prueba). (1) **Línea, Lanza arcana**, con la Abeja de J1 a la vista y J1 escondido detrás: el
  GM vio el duelo y el dodge roll de la Abeja y nada de J1; la lanza y sus chispas, solo sobre la Abeja. J1 tuvo los dos duelos (el suyo como botón
  abajo), ganó la Evasión y se movió fuera de la línea: el GM no vio el movimiento. (2) **Área con centro y dodge roll, Bola de fuego** sobre J1 solo:
  al GM, «No hay nadie adentro del área»; J1 su duelo, ganó, arrastró su token 2 casillas y «logró salir»; el GM, nada. (3) **Cono, Hálito polar**
  (con dodge roll): como el cono es el mismo que el de detección, un escondido solo puede estar adentro si está en una nube (si no, el creep ya lo
  vio); J1 en una Niebla, a 3 casillas: el GM, «No hay nadie adentro del área»; J1 ganó la Evasión, no llegó a salir, recibió 3 (a mano, menos que
  su Sigilo) y Escarcha, y siguió en Sigilo. En las tres, el GM sin toasts, Mesa ni Crónica del escondido. **Visto**: en la línea, mientras J1
  resolvía el duelo de la Abeja, a los 40 s la pantalla del GM tiró sola la Evasión de J1 («solo: no contestó»): ver P321. Capturas: cola88.
- **✅ hecho (2026-11-24) — Probar: 🙈 el GM con 👁 Revelar lo oculto ve el duelo de un personaje escondido y lo resuelve a mano** (2026-11-22, P263).
  **Y (dueño, 2026-11-24):** revisar bien qué hace exactamente «👁 Revelar lo oculto», para garantizar que además de personajes ocultos
  revele trampas y otras cosas que el GM pudiera no ver.
  **Resultado:** el inventario de lo que revela está en `vtt-hexgrid/CLAUDE.md` («👁 Qué revela…»). Ya revelaba a los personajes e invocaciones
  en Sigilo, invisibles o adentro de una nube, las trampas de los jugadores, el duelo y el área de un escondido y sus líneas de la Mesa. **Faltaba
  y se sumó:** el detalle de la trampa que pone un jugador en la Mesa (antes, ni con el ojo); que el duelo de un escondido aparezca al toque al
  prender el ojo (antes esperaba a que el duelo cambiara) y se cierre al apagarlo; y **que se note**: un cartelito fijo arriba «👁 Revelando lo
  oculto · Apagar», y lo que se ve solo por el ojo va con contorno rojo punteado y un 👁 (token, trampa, fila del orden de turnos, cartel de la
  casilla, área en rojo y el cuadro del duelo con un aviso arriba). Los mensajes secretos entre jugadores siguen privados (sin tocar).
  **Probado con clics en «Claude · pruebas 2» (GM, Jugador 1 y Jugador 2):** Blanco J1 en Sigilo y una trampa suya; con el ojo apagado el GM no
  veía ninguno; prendido, los dos con su contorno rojo y su 👁, el cartel de la casilla con «la ves porque estás revelando lo oculto» y J1 con 👁 en
  el orden de turnos; apagado (con el botón del cartelito), todo como antes. Con el ojo apagado, la Bola de fuego de un creep sobre J1: al GM «No
  hay nadie adentro del área» y sin duelo; al prender el ojo le apareció el botón «👁 ✨ Ver ejecución: Arcano 3 → Blanco J1», lo abrió (con el
  aviso arriba) y lo resolvió a mano (✍ la Evasión de J1, otro valor de daño menor al Sigilo, la Quemadura): J1 siguió escondido. Los jugadores
  no vieron nada nuevo (solo el aviso de siempre del ojo). Quedó una pregunta: P322 (con el ojo prendido, un área alcanza al escondido como
  duelo normal y se lo puede elegir de objetivo). Capturas: cola89. Lo que no se probó con clics, al final de la cola.
- **✅ hecho (2026-11-24) — Probar: 🙈 la Mesa de la ficha suelta y de GM Tools con un duelo escondido** (2026-11-22, P263). Probado con clics en
  «Claude · pruebas 2»: el mapa abierto para los tres y, al lado, GM Tools (GM de pruebas, sin «👁 Revelar lo oculto») y la ficha suelta de Blanco J1
  (Jugador 1) y de Blanco J2 (Jugador 2). **Sin delatarse** (Blanco J1 en Sigilo, el Grito espeluznante de un creep con la Botella, 3 de daño): en
  GM Tools el GM vio solo el anuncio del Grito y, después, «el diablito quemó a Control mental 4» (sin decir a quién le pegó); ninguna línea con el
  nombre de Blanco J1 ni su duelo. Jugador 1 y Jugador 2 (su bando) vieron en la ficha todo el duelo: las dos tiradas, el +2 de la Botella, los 3 de
  daño, el Pánico y el resumen con «Ver detalle del duelo». **Se delata** (la Nova arcana con 9): las tres Mesas muestran «se delató», el Maldito y,
  **con un arreglo**, también la cuenta del daño y el resumen del duelo. Antes, en GM Tools esas dos líneas seguían escondidas (iban marcadas como del
  duelo oculto aunque ya se había delatado; el mapa del GM sí las mostraba). Ahora, si el golpe lo delata, el duelo queda anotado y lo que sigue va a
  la vista de todos (`comun/duelo.js`, `vtt-hexgrid/js/13`; prueba automática nueva, 1102 en verde). Las tiradas de antes de delatarse siguen siendo
  solo de su bando (igual que en el mapa). Capturas: cola90.
- **✅ hecho (2026-11-24) — Probar: 🙈 el vencimiento de 40 s con un personaje escondido, con el código nuevo en la pantalla del GM** (2026-11-22, P263): se
  probó con la pantalla del GM todavía con el código de antes (tiró la Evasión de J2, aceptó el daño y aplicó el Empujón solo); con el código
  nuevo solo se probó con el creep.
  **Probado con clics en «Claude · pruebas 2»** (GM de pruebas sin 👁 y Jugador 1, que no tocó nada): Blanco J1 en Sigilo, pegado a Arcano 2
  (Nova arcana: daño y Empujón) y, aparte, adentro de una Niebla en el cono de Hunter 5 (Abanico: solo daño; a los dos se les bajó el daño a 1d4
  mientras duró la prueba, para que no se delatara). **Lo que anduvo:** a los ~45 s la pantalla del GM tiró sola la Evasión («solo: no
  contestó»), aceptó el daño, lo aplicó (Nova 2, Abanico 2 − Defensa 1 = 1) y siguió escondido; el GM no vio cuadro, Crónica ni Mesa de J1; el
  Jugador 1 vio todo su duelo y lo que pasó. Con un daño mayor que su Sigilo (12 y 7 con el 2d6 de siempre) se delató y desde ahí todo a la vista, bien.
  **❌ → arreglado, dos cosas:** (1) **cada paso esperaba otros 40 s** (tirar, aceptar el daño, los efectos): el empujón llegaba a los 2 minutos
  y medio. Ahora, si la pantalla del GM ya lo tomó una vez, los pasos que siguen van enseguida (unos 4 s, lo que tardan los dados; `comun/duelo.js`,
  `ocultoReloj`): el daño entra ~10 s después de la Evasión. (2) **El Inamovible lo delataba**: Blanco J1 lleva unas botas con Inamovible 33 %, y
  al empujarlo se abría para todos el cuadro «✨ Inamovible: Nova arcana: empuja a Blanco J1», también en la pantalla del GM, con el nombre, y
  quedaba esperando (15 minutos) a que alguien lo tirara. Ahora ese cuadro va marcado como el duelo oculto (`vtt-hexgrid/js/21` y `js/78`): lo ve
  solo su bando (y el GM con 👁) y, si nadie lo tira, a los 40 s la pantalla del GM lo tira sola. Probado de nuevo con clics: no salió (4 en el
  d6), lo empujó 2 casillas y siguió escondido; el GM no vio nada. Pruebas automáticas nuevas (1104 en verde). Capturas: cola91 (la «0-…» es la de
  antes del arreglo). Sin probar: el caso de P321 (vence mientras resuelve otro duelo) y un área con un estado.

- **✅ hecho (2026-11-24) — 🥷 Aviso al escondido cuando el daño no alcanza para delatarlo** (dueño, 2026-11-23): «si a un personaje escondido se le hace
  daño que no alcanza para revelarlo, al usuario le tiene que aparecer: te hicieron tanto de daño, pero no alcanzó tu nivel de sigilo, por lo cual
  seguís escondido, o algo por el estilo». A quien maneja al escondido (jugador o GM por un creep), solo a él. Ver también P288.
  Hecho: cartel al centro «🥷 Seguís escondido — Te hicieron 3 de daño, pero no alcanzó tu Sigilo (6): seguís escondido.» (un creep, al GM: «A Rata 1
  le hicieron…: sigue escondido»). Sale con todo daño que pasa por el chequeo de delatarse (áreas, ondas, conos, líneas, zonas, trampas) cuando le
  sacó vida sin pasar su Sigilo; si lo delata, no sale (queda el «se delató»). Solo a quien lo maneja (quien tiene 🎮 el control, si no su dueño; un
  creep, el GM): nadie más lo ve, ni en la Crónica (`vtt-hexgrid/js/03` `sigiloAguantaAvisar`, js/16 tipo `sigilo-aguanta`, textos en
  `Combatiente.sigiloAguantaTxt`). Probado con clics en «Claude · pruebas 2» (GM sin el ojo y Jugador 1): la Nova arcana con 1d4 le sacó 3 a Blanco J1
  escondido → a J1 le salió el cartel, el GM no vio nada; control con 1d4+8 (12) → «se delató», sin cartel. Pruebas automáticas nuevas (1108 en verde).
  Capturas: cola92. Sin probar con clics: zonas, trampas y un creep escondido (en la cola).

- **⬜ en cola (al final, conversación) — ☁ Definir las nubes que tapan la vista** (dueño, 2026-11-23: «yo por niebla pensaba que era tipo una nube
  que se ponía en el territorio… la polvareda o algo así… Todo lo que son nubes, por ejemplo la Polvareda de la rata, quiero saber más o menos cómo
  funcionarían esas cosas que ocultan la vista. No tengo bien claro las reglas de esa parte»). Explicarle cómo funcionan hoy las nubes (Polvareda,
  Bomba de humo, varita de niebla, virote de humo, zonas con nube: qué tapan, quién ve adentro, cuánto duran, el viento) y las preguntas para
  decidir; P264 (el creep que actúa desde una nube) va con esto. La niebla de guerra del mapa ya se le explicó aparte.

- **✅ hecho (2026-11-24) — Probar: 📺 la tele con el Portal cósmico** (2026-11-23): el Portal trampa de un creep donde quien la puso elige adónde manda, y el
  caso en que lo mueve otra pantalla (un jugador mandando a un creep: paso «portal-mover»). Solo se probó el Glifo (destino fijo), que usa la misma
  función.
  Probado con clics en «Claude · pruebas 2» (GM de pruebas, Jugador 1, Jugador 2), con video. (1) El Portal de un creep, lo pisa Blanco J1: pierde
  la Res.CC, el GM toca «🌀 Elegir adónde lo mandás» y una casilla a 3; la tele (se apaga donde estaba, se prende donde llega) en las tres pantallas
  y el token queda en el destino; después, Pajaritos 1 turno. Con las Botas de estibador, el Inamovible (5 o 6 en 1d6) lo dejó en el lugar y el
  Pajaritos entró igual. (2) El Portal de Blanco J1, lo pisa un creep: el Jugador 1 elige el destino, la pantalla del GM mueve al creep
  («portal-mover»), la tele en las tres y Pajaritos. (3) El creep gana la Res.CC (✋ 15 contra 11): «¡Lo resistió!», no se mueve, sin tele y sin
  Pajaritos (como dice la trampa: ganar la Res.CC frena las dos cosas). **Arreglado:** mientras el portal lo llevaba, el cartel decía «Se está
  tirando en otra pantalla…» también en la pantalla que lo estaba mandando; ahora dice «🌀 El portal se lo está llevando…». Visto: en la pantalla de
  la víctima (y la del GM en el caso 2) el cartel de la trampa tapa la casilla de donde sale, así que ahí la tele se ve solo al llegar (entrada
  nueva al final de la cola), y la tele arranca 3 a 6 s después del clic.
- **✅ hecho (2026-11-24) — Probar: 📺 la tele con la Trampa de teleport de Terreno y Formas** (2026-11-23). Probado con clics en «Claude ·
  pruebas 2» (GM de pruebas, Jugador 1, Jugador 2), con video. El GM la arma con 🪤 Trampas (paso 7 «Teleport»), marca el destino y la pone: se
  crea sin error de permisos. Blanco J1 la pisa: «¡Cayó en la trampa!», los pulsos violeta/azul y la tele (se apaga en la trampa, se prende en el
  destino) en las pantallas del GM y del Jugador 2, y el token queda en el destino en las tres; la Mesa dice «🌀 Teleport de prueba: Blanco J1 fue
  teletransportado…». **Arreglado:** con 🪤 Trampas el clic en el mapa no dibujaba nada (solo miraba «Formas libres» desde 2026-09-28), así que no
  se podía poner la trampa; ahora sí (`dibujaElemento()`, js/14). Visto: en la pantalla del Jugador 1 el cartel «¡Cayó en la trampa!» sale antes
  y tapa la tele (se ve solo, oscurecida, la llegada): es lo de la entrada «📺 El cartel de la trampa tapa la tele del Portal cósmico».
- **✅ hecho (2026-11-24) — Probar: 📺 la tele de un teletransporte con un token oculto, en sigilo o en la niebla, y con «reducir movimiento»** (2026-11-23): por
  código, una pantalla que no ve el token no dibuja la tele (como el Parpadeo) y con «reducir movimiento» salta sin animación; no se probó en el mapa.
  Probado con clics en «Claude · pruebas 2» (GM de pruebas, Jugador 1, Jugador 2), con un portal de Invocar portal, video de las tres pantallas.
  (1) Blanco J1 en Sigilo pasa por el portal: el GM no ve ni la tele ni el token, en la salida ni en la llegada; el Jugador 1 y el Jugador 2 ven la
  tele entera. (2) Una niebla de varita: saliendo de adentro, el GM ve solo la llegada; entrando, solo la salida; los dos jugadores, todo.
  **Arreglado:** saliendo de la niebla, si la casilla nueva llegaba mientras se apagaba, el GM alcanzaba a ver el final del apagado (el puntito) en
  la salida, adentro de la nube: ahora cada lado se dibuja solo si esa pantalla vería al token ahí (`blinkTvVeoEn`, js/111; prueba automática).
  (3) Con «reducir movimiento» en las tres pantallas: el token salta sin tele. Visto aparte: los pulsos del portal sí se ven en la pantalla que no
  ve al token, y se animan igual con «reducir movimiento» (P323).

- **✅ hecho (2026-11-24: con las reglas pegadas se crea sin error de permisos y al pisarla teletransporta; probado con clics, ver «Probar: 📺 la tele con la Trampa de teleport») — 🔒 Arreglar las reglas: la Trampa de teleport de Terreno y Formas no se puede crear** (visto en la tarea de la tele,
  2026-11-23): `trampaDestino` está validado pero falta en la lista de campos que se pueden crear de `elementoValido` (firebase/firestore.rules),
  así que crearla da error de permisos. Sumarlo, avisarle al dueño que pegue las reglas, y probar crearla y pisarla con la tele.

- **⬜ en cola (al final, conversación) — 🏃 Un creep que se va por un Town portal no cuenta como escapado** (dueño, 2026-11-23, visto en la
  última partida: «un creep usó un town portal, se fue del mapa y a la hora de calcular el botín no lo tomó como escapado… repasar ese caso y
  discutir cómo resolverlo. En principio se me ocurre que cuando un creep hace blink out, le aparezca al GM qué hacer con la experiencia o algo
  así»). Revisar cómo «Batalla terminada» decide quién escapó, contarle el caso y conversar la solución antes de programar.

- **✅ hecho (2026-11-24) — Probar: 🙈 inicio de turno de un escondido con 👁 Revelar lo oculto** (2026-11-23): probado con clics en «Claude · pruebas 2»
  (GM de pruebas, Jugador 1 y Jugador 2), con Blanco J1 en Sigilo y un veneno de 3 turnos (−1 de vida al empezar), orden Blanco J2 → Blanco J1.
  (a) **Con el 👁 apagado**: al empezar el turno de J1, el GM no vio nada (ni la tarjeta, ni la fila del orden, ni la línea de la Mesa al aplicar); el
  Jugador 1 vio su «▶ Empieza tu turno» (veneno 3 → 2, vida 50 → 49) y lo aplicó; el Jugador 2 (su aliado) vio la tarjeta y la línea, como siempre.
  (b) **Con el 👁 prendido**: el GM vio la tarjeta «Empieza el turno de Blanco J1 · ▶ Aplicar por él» y la fila con el 👁; con el Jugador 1 sin tocar
  nada, «▶ Aplicar por él» lo aplicó (veneno 2 → 1, vida 49 → 48), el GM vio la línea en la Mesa y al Jugador 1 su ventana le pasó a «✔ Ya se aplicó
  (lo aplicó el GM)». Los jugadores no vieron nada nuevo, salvo la línea de siempre «El GM está revelando lo oculto». Como dice P322 (2), la línea
  de la Mesa del turno anterior (llegada con el ojo apagado) no apareció al prenderlo. Sin arreglos. Duda aparte: P324 («Cómo quedó el grupo»).
- **✅ hecho (2026-11-24) — Probar: 🙈 escondido y ▶ Iniciar combate / ⏬ Demorar / ⟳ Pasar de ronda / ↩ fin del turno libre** (2026-11-23): las cuatro
  tarjetas usan la misma regla (a los que lo ven, con su nombre; a los rivales, la de siempre sin él); solo se probó con ▶ Siguiente.
  Probado con clics en «Claude · pruebas 2» (GM de pruebas sin 👁, Jugador 1 y Jugador 2), Blanco J1 en Sigilo con un veneno de prueba.
  (a) **▶ Iniciar combate** con J1 primero: el GM vio «Ronda 1 · Empieza el combate · Sigue el orden de turnos» sin nombre; J1, su «▶ Empieza tu
  turno»; J2, «Empieza el combate: turno de Blanco J1». (b) **⟳ Pasar de ronda** en el turno de J2: el GM, «Ronda 2 · Pasa el turno»; J1 y J2, «Ronda 2 ·
  Empieza el turno de Blanco J1». Con J1 todavía sin jugar (se saltea), el GM vio solo «⏭ El GM pasó de ronda» y J1/J2 la tarjeta aparte de J1.
  **Arreglado**: el cartel de confirmar le nombraba al GM a J1 («Queda 1 turno sin jugar… (Blanco J1)») y la línea decía «se saltearon los turnos de
  alguien más» (le contaba a todos que había un escondido): ahora el cartel cuenta solo a los que el GM ve y la línea nombra solo a los que se ven.
  (c) **↩ fin del turno libre** (turno libre a J2 en el turno de J1): el GM vio «Termina el turno libre: sigue el orden de turnos»; J1 y J2, «Vuelve el
  turno de Blanco J1». **Arreglado**: el botón del GM decía «↩ Volver a Blanco J1» y el cartel de «Es el turno de…» decía «termina el de Blanco J1» /
  «vuelve a Blanco J1»; ahora, sin el nombre del escondido («↩ Volver», «el turno en curso», «quien lo tenía»). (d) **⏬ Demorar** con J1 escondido
  como el siguiente: el GM vio «⏬ Pasa el turno · Blanco J2 demora su turno: juega justo después» y la Mesa «le toca al siguiente»; J1 y J2, «Empieza el
  turno de Blanco J1». Ojo: el GM sin 👁 no puede apretar ▼ en el que juega cuando el de abajo es el escondido (no ve su fila: el ▼ queda apagado); se
  probó llamando a lo mismo que hace ▼. Duda: P325. Capturas fuera del repo.
- **✅ hecho (2026-11-24) — Probar: 🙈 el fin de turno de un escondido con algo que contar** (2026-11-23): si al terminar su turno le pasa algo (un estado
  que vence), va en su propia tarjeta, solo para los que lo ven; en la prueba no hubo líneas de fin de turno.
  Probado con clics con Blanco J1 en Sigilo y «Tropezado» (se va al terminar el turno). **Arreglado**: un estado que se va al terminar el turno
  (Tropezado, Acelerado) se iba en silencio, así que nunca había nada que contar; ahora deja «Tropezado: se terminó» (personaje, invocación y creep;
  `Combatiente.terminarTurnoEstados`, `FichaMantenimiento.finTurno`, prueba nueva; `comun/pruebas.html` 1112 en verde). Con ▶ Siguiente: J1 y J2 vieron
  la tarjeta aparte «Turno de Blanco J1 · Terminó el turno de Blanco J1: Tropezado: se terminó» y la línea de la Mesa; el GM no vio nada de J1 (solo
  «Empieza el turno de Blanco J2»).
- **❌ Probado con clics (2026-11-24) — 🙈 una zona de «al empezar su turno» (Muro de fuego) bajo un escondido, y el cartel flotante de inmunidad**
  (2026-11-23). En «Claude · pruebas 2», modo combate, orden Blanco J1 → Blanco J2, Blanco J1 en Sigilo (Sigilo 6) parado sobre el Muro de fuego
  de Blanco creep; GM de pruebas con el 👁 apagado, Jugador 1 y Jugador 2 mirando.
  - ✅ Al empezar su turno, a Jugador 1 le sale el renglón «🔥 Muro de fuego: estás adentro al empezar tu turno» dentro de «▶ Empieza tu turno», y
    lo resuelve él con «🔥 Tirar el daño (3d4)». El token sigue sin verse para el GM (ni el cartel flotante).
  - ❌ **Lo delata ante el GM: el daño va al cuadro del duelo de siempre y lo tira el GM** (es una zona de un creep). Al GM se le abre «Muro de
    fuego: el daño · Blanco creep VS Blanco J1» con «🎲 Tirar el daño», y además ve en la Crónica «🔥 Blanco J1 está en Muro de fuego…» (desde que
    empieza el turno, antes de tirar) y en la Mesa «Blanco creep le hizo Muro de fuego: el daño a Blanco J1. Le bajó 6 de vida». Como el GM sabe
    dónde está su muro, sabe dónde está J1. Lo mismo ve Jugador 2 (está bien: es su aliado). Arreglo grande y con dudas: entrada nueva al final
    de la cola y P326.
  - ✅ **No lo delata** (6 de daño, Sigilo 6): sigue escondido, Jugador 1 ve «🥷 Seguís escondido · Te hicieron 6 de daño, pero no alcanzó tu
    Sigilo (6)» y la Quemadura; el GM no ve el token, ni la casilla, ni el cartel flotante (sí todo lo de arriba).
  - ✅ **Lo delata** (10 de daño, puesto a mano con «✍ Otro valor»): «🕶 Blanco J1 se delató y salió del sigilo» para todos, el token aparece y
    todo sigue normal.
  - ✅ **Inmune** (resistencia al fuego 99): el daño entra 0 y el cartel «INMUNE AL FUEGO» flota sobre el token para Jugador 1 y Jugador 2; a la
    pantalla del GM le llega el aviso pero no dibuja nada (no ve el token). (La Crónica y la Mesa del GM igual dicen que el muro le pegó: ver arriba.)
  - Aparte: «🩺 Cómo quedó el grupo» le mostró al GM «En la zona: Muro de fuego» de Blanco J1 escondido: va con P324.
  - Capturas (fuera del repo, en el mismo momento): `4-aplicado-GM.png` y `4-aplicado-J1.png`.
- **✅ hecho (2026-11-24) — Probar: 🎲 una invocación o un refuerzo que entra solo al orden de turnos, y ⏭ Pasar de ronda con un tótem en un orden viejo**
  (2026-11-23): por código, la invocación nueva y el refuerzo pasan por la misma regla (`iniciativaOcupaLugar`) y Pasar de ronda no le hace pasar el
  turno a un tótem o estandarte; no se probaron en el mapa (hoy ninguna invocación ni refuerzo es un objeto inerte: es solo la red de seguridad).

  **Dueño (2026-11-24):** la parte del tótem en un orden viejo se descarta («si queda algún estandarte o tótem directamente se puede borrar a mano…
  a partir de ahora no deberían ni entrar a la lista de turnos»). Y se define: **una invocación o un refuerzo, el turno en que entra, tira su
  iniciativa automáticamente y se ubica en el orden; tiene Mareo de invocación hasta el inicio del próximo turno de quien lo invocó**. Armarlo
  junto con la prueba.
  - ✅ **Programado (2026-11-24):** el Mareo de invocación ya no es «su primer turno»: dura hasta que empieza el próximo turno de quien la invocó
    (una invocación → el personaje dueño; un refuerzo → el creep que lo llamó). Si le toca jugar antes, no actúa (el cartel de siempre ahora dice
    «No actúa hasta que empiece el próximo turno de X», con «Hacerlo igual»); reacciona igual. Al empezar el turno de quien invocó se le va, con su
    línea en la tarjeta del turno y en la Mesa («😵 Abeja de prueba ya no está mareada: empezó el turno de Blanco J1»). También se va si quien invocó
    sale del orden o está caído. Los refuerzos ahora tiran su iniciativa y entran en su lugar (antes: justo detrás de quien los llamó, con su mismo
    número y sin mareo). Si quien invocó no está en el orden, el mareo de antes (su primer turno). `vtt-hexgrid/js/135`, `OrdenTurnos.mareoSeVa`.
    Duda nueva: P327 (si saca más que quien la invocó, pierde también su primer turno de la ronda siguiente).
  - ✅ **Invocación, con clics** en «Claude · pruebas 2» (GM y Jugador 1): orden Blanco J1 30 · Blanco J2 25 · Blanco creep 0, turno de J1. J1 pone
    la Abeja con 👥 → «Ponerlo en el mapa»: tira 1d4 = 4 (va a la Mesa) y entra entre J2 y el creep, con el estado «Mareo de invocación · hasta que
    empiece el próximo turno de Blanco J1» (se ve en el globo del iconito 😵). ▶ Siguiente hasta su turno: el inicio de su turno no le saca el mareo;
    J1 la quiere mover y sale «Abeja de prueba recién llega: está mareada · No actúa hasta que empiece el próximo turno de Blanco J1»; no se mueve.
    Ronda 2, empieza el turno de J1: el mareo se va (línea en la tarjeta del GM) y el 😵 desaparece del token.
  - ✅ **Refuerzo, con clics** (ningún creep de la partida llama refuerzos: se le sumó a Blanco creep un «Chillido de prueba» y después se sacó).
    Orden J1 30 · Blanco creep 20 · J2 10 · Abeja 4, turno del creep: Acciones → Ejecutar → clic en una casilla libre. Llega «Blanco creep
    (refuerzo)», tira 1d4+1 = 5 (en la Mesa) y entra entre J2 y la Abeja, mareado «hasta que empiece el próximo turno de Blanco creep». En su turno
    el GM lo quiere mover: el cartel del mareo, no se mueve. Ronda 3: J1 juega, empieza el turno del creep → «😵 Blanco creep (refuerzo) ya no está
    mareada…» en la Mesa de todos (desde entonces dice «mareado» para un creep).
  - Capturas (fuera del repo): `cola99/2-J1-le-toca-a-la-abeja-y-esta-mareada.png`, `cola99/5-GM-le-toca-al-refuerzo-y-esta-mareado.png`.
  - Partida como estaba: narrativo, sin orden, la Abeja en su casilla, sin el refuerzo ni el Chillido de prueba, Blanco creep 60/60 sin estados.
  - ✅ **Ajuste por P327 (2026-11-24):** el mareo le hace perder **solo su primer turno**: se va al terminarlo o al empezar el turno de quien la
    invocó, lo que pase primero (invocaciones y refuerzos, con o sin quien los llamó en el orden). Cartel: «No actúa en su primer turno». **Con
    clics, el caso «saca más»:** orden J2 25 · creep 20 · J1 0, turno de J1; la Abeja saca 2 (más que J1) y entra antes de él (su lugar ya pasó).
    Ronda 2: le toca antes que a J1, está mareada y no se mueve; al terminar su turno, «😵 Abeja de prueba ya no está mareada: terminó su primer
    turno» en la Mesa. Ronda 3: se mueve sin cartel. Perdió un solo turno. Captura: `cola100/1-J1-saca-mas-que-J1-ronda-2-pierde-su-primer-turno.png`.
- **✅ hecho (2026-11-24) — ➕ Sumar un token al orden de turnos a mano (P291)** (dueño, 2026-11-23: «sí, quiero que lo hagas»): en el menú del token, para el
  GM, «➕ Sumar al orden de turnos» (y «➖ Sacar del orden» si ya está), aunque la regla diga que no ocupa lugar (un tótem, un token suelto…).
  - Dónde: en el «⋯» del token, solo el GM y con el orden de turnos armado (`vtt-hexgrid/js/136-sumar-al-orden.js`). Un jugador no lo ve.
  - Sumar: si tiene datos (personaje, invocación, creep, tótem) pregunta «🎲 Tirar su Iniciativa» (la de siempre, a la Mesa) o «✍ Escribir el
    número»; un token suelto, directo el número. Entra en su lugar como una invocación (`OrdenTurnos.entrarConTirada`; si su lugar ya pasó en esta
    ronda, juega desde la próxima: P301 b sigue en la cola), sin Mareo, con «➕ X entra al orden de turnos (lo sumó el GM) con N: queda después de Y»
    en la Mesa. Un tótem o un suelto «No» quedan marcados (`iniciativa: true`) para que Ordenar, Traer tokens y ▶ Siguiente los respeten.
  - Sacar: pregunta (y avisa si es su turno) y sale con `temporalFueraDelOrden` (js/54): si era su turno, termina y le toca al siguiente con su
    «Empieza el turno». «➖ X sale del orden de turnos (lo sacó el GM)» en la Mesa. Lo marcado vuelve a quedar afuera. Si los jugadores no lo ven,
    sin línea en la Mesa (solo un aviso al GM). Dudas: P328.
  - **Probado con clics** en «Claude · pruebas 2» (GM y Jugador 1), con el combate en marcha (J2 25 · Blanco creep 20 · J1 10, turno de J2): sumé un
    Tótem de silencio con 15 (quedó después de Blanco creep) y un token suelto «No» (Cofre) con 30 (primero; su lugar ya pasaba: juega desde la
    próxima). ▶ Siguiente: J2 → creep → **tótem** → J1 → ronda 2 → **Cofre**. Saqué a Blanco creep (no era su turno) y a Blanco J2 **en su turno**
    (le tocó al tótem, J2 quedó como que ya jugó). Volví a sumar a Blanco creep con «🎲 Tirar su Iniciativa» (sacó 4, a la Mesa) y saqué al tótem
    (volvió a quedar afuera). El Jugador 1 no ve ➕ ni ➖ en su «⋯». Pruebas automáticas: 1116 en verde (+2).
  - Capturas (fuera del repo): `cola101/1-GM-totem-menu-sumar-al-orden.png`, `cola101/5-GM-saco-a-J2-en-su-turno-le-toca-al-totem.png`.
  - Partida como estaba: narrativo, sin orden de turnos, sin el tótem ni el Cofre, Blanco creep igual que antes.
  - ✅ **Ajuste por P328 (2026-11-24):** sin el «➖ Sacar del orden» en el token (se saca con la ✕ de la tabla). La ✕, si saca al que tiene el turno,
    termina su turno y empieza el del siguiente con su «Empieza el turno» (antes no), con «➖ X sale del orden de turnos (lo sacó el GM)» en la Mesa (sin
    línea si los jugadores no lo ven), y lo deja afuera: «Traer tokens» no lo vuelve a traer hasta que el GM lo sume con ➕ (o se vacíe el orden: Limpiar
    o el fin del combate). **Con clics:** el «⋯» de J2 (en el orden) ya no tiene ➕ ni ➖; ✕ a J2 en su turno → «Empieza el turno de Blanco creep»;
    Traer tokens trajo a todos menos a J2; ➕ a J2 → volvió a entrar. Pruebas automáticas: 1116 en verde. Captura:
    `cola102/1-GM-la-X-saca-a-J2-en-su-turno-y-empieza-el-del-creep.png`. Partida como estaba.

- **✅ hecho (2026-11-24) — 💍 El aviso del anillo antes del ataque de oportunidad (P266)** (dueño, 2026-11-23): al alejarse con Puntería certera o Foco
  activo, primero sale «Si te movés, lo perdés. [Moverme igual] [Cancelar]» y recién si confirma se le ofrece al rival el ataque de oportunidad.
  **Cómo era:** pegado a un rival, el primer paso ya lo alejaba, así que se le ofrecía la oportunidad al rival enseguida y el aviso del anillo salía
  recién al seguir el camino (Cancelar dejaba el token quieto, pero la oportunidad ya se había jugado). Si el camino se frenaba más adelante (no en
  el primer paso), el orden ya era el bueno. **Cómo quedó** (`oportunidadTrasAvisoQuieto`, vtt-hexgrid/js/17, desde el arrastre de js/06): primero el
  aviso; con Cancelar no se mueve, no hay oportunidad (no queda «usada») y no pierde nada; con «Moverme igual» el bono se da por perdido en ese momento
  (aunque el rival lo ataque) y recién ahí se le pregunta al rival; al terminar de moverse no se vuelve a preguntar. Vale igual para el GM moviendo un
  creep, para las Apuntadas y para la vigilancia; sin bono activo, como siempre. **Probado con clics** en «Claude · pruebas 2» (Jugador 1 pegado a
  Blanco creep, ronda 3 y 5, con el GM en su pantalla): con Puntería certera y con el Anillo de Foco Arcano, arrastrando el token → sale primero el
  aviso y al GM no le aparece nada; Cancelar → quieto, con el bono, sin línea en la Mesa; «Moverme igual» → pierde el bono y recién ahí al GM
  «¿Ataque de oportunidad?»; «No, dejarlo pasar» → J1 terminó su camino sin otro aviso. Pruebas automáticas: 1117 en verde. Capturas:
  `cola103/1-J1-primero-el-aviso-del-anillo.png`, `cola103/2-GM-recien-despues-le-ofrecen-la-oportunidad.png`. Partida como estaba.

- **✅ hecho (2026-11-24) — Probar: 💀 un personaje que cae desde la Botonera del mapa o en su pase de turno** (2026-11-23, P270): ahora deja la línea «💀 X cayó:
  se le fueron N estados (…)» (`caidaContarPj`, vtt-hexgrid/js/11); antes los sacaba sin contarlo. Probarlo con J1 envenenado y poca vida (⏭ Pasar
  de ronda) y con un golpe que lo deja en 0 desde su Botonera: una sola línea, sin la repetida de js/98.
  *Resultado:* **probado con clics** en «Claude · pruebas 2» (GM y Jugador 1). (1) Blanco J1 con 2 de vida, Veneno ×4 y Bendecido, en combate y
  con su inicio de turno pendiente: el GM tocó ⏭ Pasar de ronda → el veneno lo dejó en 0 y quedó UNA sola línea «💀 Blanco J1 cayó: se le fueron 2
  estados (Veneno, Bendecido)», igual en las dos pantallas; sin la «💔 quedó en 0» de js/98 ni otra repetida (mirado otra vez 20 s después). (2) Con
  Maldito y 2 de vida, desde su Botonera: Ejecutar una habilidad de 3 SP → el aviso «Estás Maldito… quedás caído» → Aceptar → 0 de vida y UNA sola
  línea «💀 Blanco J1 cayó: se le fueron 2 estados (Maldito, Bendecido)». (La habilidad de prueba se sacó al terminar.) Capturas:
  `cola104/1-J1-cae-por-veneno-al-pasar-de-ronda.png`, `cola104/2-J1-cae-desde-su-Botonera-una-sola-linea.png`. Partida como estaba.
- **✅ hecho (2026-11-24) — Probar: 💀 un creep que cae desde GM Tools por una habilidad o un estado** (2026-11-23, P270): el corte es el mismo para cualquier
  camino (`gmCaidasRevisar`), pero con clics solo se probaron el recuadro de HP, «Daño» y ⟳ Pasar de ronda. Falta: una habilidad que le cuesta vida,
  un estado con daño al aplicarse, y un creep oculto o en Sigilo (tiene que salir solo el toast al GM, sin línea en la Mesa).
  *Resultado:* **probado con clics** en «Claude · pruebas 2» (GM con GM Tools y el mapa, Jugador 1 con el mapa), con los dos «Blanco creep». (1) Con
  Maldito y 3 de vida, Ejecutar «Piel de hierro» (cooldown 3) desde sus Acciones → 0 de vida, toast y UNA línea «💀 Blanco creep cayó: se le fueron 2
  estados (Maldito, Piel de hierro)» en la Mesa de las tres pantallas (el buff que recién se había puesto también se va). (2) Con 1 de vida, «+ Estado» →
  Veneno severo (hace daño al ponerlo) → ✔ Listo → 0, toast y UNA línea «… se le fue 1 estado (Veneno severo)». (3) Lo mismo con su token oculto por el
  GM: el toast al GM y ninguna línea nueva en la Mesa (ni en GM Tools, ni en el mapa del GM, ni en el de Jugador 1). Capturas:
  `cola104/3-GMTools-creep-cae-por-habilidad.png`, `cola104/4-GMTools-creep-oculto-solo-el-aviso.png`. Los dos creeps y el token quedaron como estaban.

- **✅ hecho (2026-11-24) — 🩸 GM Tools: la vida de un creep no baja de 0 (P292)** (dueño, 2026-11-23: «corregilo para que la vida no baje de cero»): hoy «Daño»
  la deja en negativo (999 → −989). Que quede en 0, como en el mapa, en todos los caminos de GM Tools.
  *Resultado:* dejaban vida negativa «Daño» (la tarjeta y la ficha completa, `aplicarDanioCreep`, js/01), el recuadro de HP con un «−N» más grande que
  la vida (`resolverDeltaHp`: ahora queda en 0 con el aviso «tenía 20 de vida y le restaste 50: la vida no baja de 0, queda en 0»), la vida que
  cuesta una habilidad (`CreepAcciones.ejecutarHab`) y la de un Flash (`CreepDuelo`); los estados con daño y Pasar de ronda ya la cortaban en 0. Además,
  una red de seguridad en `gmCaidasRevisar` (js/11, `gmVidaNoNegativa`): cualquier camino que la deje negativa se ve en 0, y un creep guardado de antes
  con vida negativa se ve en 0 al abrir GM Tools y se vuelve a guardar solo en 0. La caída (P270) sigue igual. La ficha suelta de un personaje ya no
  dejaba vida negativa; la de una invocación sí, escrita a mano: P329. **Probado con clics** en «Claude · pruebas 2» con el GM de pruebas: «Daño» 999 en
  la tarjeta (60 → 0, «💀 … cayó: se le fue 1 estado (Afortunado)»), «Daño» 999 en la ficha completa (30 → 0), el recuadro con −50 (20 → 0 y el aviso;
  −5 sigue dejando 15), Veneno severo con 1 de vida (0 y cae), Pasar de ronda con Veneno ×6 y 2 de vida (0 y cae) y un creep guardado en −989 (al
  recargar se ve en 0 y en Firebase queda 0). Capturas: `cola105/1-GMTools-dano-999-queda-en-0.png`, `cola105/2-GMTools-recuadro-menos-50-queda-en-0.png`,
  `cola105/4-GMTools-pasar-de-ronda-veneno.png`, `cola105/5-GMTools-creep-guardado-en-negativo-se-ve-en-0.png`. El creep, el turno y el contador de
  rondas quedaron como estaban. 1 prueba automática nueva (1118).

- **✅ hecho (2026-11-23) — 🎯 Apuntadas de las ballestas como el anillo (P271)** (dueño, 2026-11-23): (1) sumarles el cartel dorado al activarse y el aviso
  «si te movés, la perdés» antes de moverse (la misma pieza que Puntería certera); (2) **ninguna Apuntada vale en la ronda 1**: la firme ya no
  valía; la simple tampoco tiene que valer («tampoco en el anillo»: verificar que el anillo siga sin bono en la ronda 1).
  *Resultado:* la Apuntada y la Apuntada firme usan la pieza del anillo (comun/quieto.js, js/126): el cartel dorado «🎯 Apuntada» / «🎯 Apuntada
  firme» al activarse (a quien maneja al token y al GM), el aviso antes de caminar y antes de Dash / Salto / Carga / Takle / Parpadeo, y con el anillo
  y una Apuntada a la vez, un solo aviso que nombra a los dos. La simple vale recién desde la ronda 2 (el anillo y la firme ya). La 🔍 de Atacar suma
  «En el mapa, ahora» (si suma o no y por qué) y el cuadro del duelo dice «🎯 Apuntada +2: no suma — es la ronda 1 del combate…». La ficha publica
  `apuntada` / `apuntadaFirme` del arma en la mano. **Probado con clics** en «Claude · pruebas 2» (GM, J1, J2), con la Ballesta de guerra (Apuntada +2,
  archivada) dada a Blanco J1 por datos y el orden de turnos (J1, J2, Blanco creep) armado por datos, «▶ Iniciar combate» con clics: ronda 1, la 🔍 y
  el cuadro (en las tres pantallas) dicen que no suma por la ronda 1; ⏭ Pasar de ronda → cartel «🎯 Apuntada» en J1 y en el GM (no en J2), y el
  duelo con «apuntada (no se movió): +2 PdG» (tirada 1d6 +2); arrastrar → aviso; Cancelar no lo movió (las tres pantallas, sigue activa); «Moverme
  igual» lo movió y la apagó en las tres; el segundo arrastre ya no preguntó; la 🔍, «no suma: se movió en esta ronda»; ronda siguiente, el cartel
  otra vez. Con el Anillo de Puntería certera (por datos) en la ronda 4: un solo aviso «Puntería certera y Apuntada… las perdés». Al final se
  devolvió el inventario de J1, sin orden de turnos y en narrativo. 5 pruebas automáticas nuevas o cambiadas (1043). Duda: P293.
- **➡ pasó a la lista de diseño (dueño, 2026-11-24), junto al catálogo — Probar: 🎯 la Apuntada firme con clics** (2026-11-23, P271): las dos ballestas con firme (de mira, de vigía) están archivadas; misma
  pieza que la simple (pruebas automáticas), sin clics.
- **✅ hecho (2026-11-24) — Probar: 🎯 el aviso de la Apuntada antes de una habilidad que mueve (Dash, Salto, Carga, Takle, Parpadeo)** (2026-11-23, P271):
  sale por la misma función que el del anillo (prueba automática); con clics solo se probó caminar.
  *Resultado:* **probado con clics** en «Claude · pruebas 2» (Jugador 1 y GM), con la Ballesta de guerra (Apuntada +2) en la mano de Blanco J1, el
  orden de turnos en la ronda 3 y la Apuntada activa, todo armado por datos; las habilidades, dadas por datos: el Dash del Asalto y un Salto, un
  Parpadeo y un Takle de personaje hechos como los de los creeps. Con las cuatro, al tocar «Ejecutar» sale primero, antes de cobrar y de moverse,
  «🎯 Apuntada — Tenés Apuntada activa (+2 a PdG). Si te movés con Dash, la perdés. [Usarla igual] [Cancelar]» (el botón dice «Usarla igual», como
  el del anillo antes de una habilidad, P273). **Cancelar**: no se mueve, no gasta No2 ni SP y la Apuntada sigue (en las dos pantallas). **Usarla
  igual**: cobra, se mueve (el Dash hasta atravesar a un creep, el Salto 2, el Parpadeo 2, el Takle corre 2 hasta quedar pegado) y la Apuntada se
  apaga en las dos pantallas (en el duelo del Dash: «🎯 Apuntada +2: no suma — se movió en esta ronda»). **Alejándose de un rival pegado** (el Salto
  y el Parpadeo, con Blanco creep al lado): primero el aviso y, recién después de «Usarla igual», al GM le llega «Sin ataque de oportunidad: … se
  alejó de Blanco creep con Salto / Parpadeo» (estas habilidades no dan oportunidad). La Carga que derriba es solo de creeps (la Carga y el Takle
  de la clase no mueven el token): no se probó. Nada que arreglar. Al final se devolvió el equipo y las habilidades de J1, sus No2 y SP, las
  posiciones y el giro, sin orden de turnos y en narrativo. Capturas (fuera del repo): `cola106/1-J1-Dash-aviso-antes-de-moverse.png`,
  `cola106/4-J1-Salto-usado-sin-Apuntada.png`, `cola106/5-GM-Salto-sin-oportunidad.png`, y el aviso del Salto, el Parpadeo y el Takle. Duda: P330.
- **✅ hecho (2026-11-24) — Probar: 🎯 la Apuntada en un creep y en una invocación con ballesta** (2026-11-23, P271): el creep la toma de su arma en la mano
  (solo la pantalla del GM), la invocación del resumen de la ficha; con clics solo se probó un personaje.
  Probado con clics en «Claude · pruebas 2», con una Ballesta de guerra (Apuntada +2) puesta por datos en la mano de Blanco creep y de la Abeja de
  prueba (Jugador 1), con orden de turnos. **Creep**: al empezar una ronda sin haberse movido, al GM le salió el cartel dorado «🎯 Apuntada» sobre el
  creep (a Jugador 1 y Jugador 2, nada); la 🔍 de Atacar con la ballesta, en las Acciones, dice «🎯 Apuntada +2 — suma: no se movió en esta ronda»;
  el duelo contra Blanco J2 la mostró («apuntada (no se movió): +2 PdG») y la tirada la sumó (1d6+1 +2 → 7, le ganó a una Evasión de 5). Al
  arrastrarlo el GM: «Blanco creep tiene Apuntada activa (+2 a PdG). Si lo movés, la pierde. [Moverme igual] [Cancelar]» (los jugadores no ven el
  cartel); Cancelar lo deja quieto y con la Apuntada; «Moverme igual» lo mueve y la pierde. **Invocación**: lo mismo desde la pantalla de Jugador 1
  (el cartel le sale a él y al GM, no a Jugador 2); la 🔍 de la Abeja dice que suma; el duelo contra el creep sumó +2 (1d4 +2 → 4); al arrastrarla,
  «Abeja de prueba tiene Apuntada activa (+2 a PdG). Si lo movés, la pierde.» y con «Moverme igual» la pierde («se movió en esta ronda», en todas
  las pantallas). Nada que arreglar. Al final se sacaron las ballestas y se devolvieron el creep (tal cual), los No2 de la Abeja, las posiciones y
  los giros, sin orden de turnos y en narrativo. Capturas (fuera del repo): `cola107/1-GM-cartel-Apuntada-del-creep.png`,
  `cola107/3-GM-aviso-al-mover-el-creep.png`, `cola107/4-J1-cartel-Apuntada-de-la-Abeja.png`, `cola107/6-J1-aviso-al-mover-la-Abeja.png`.
- **✅ hecho (2026-11-24) — Probar: 🔥 una invocación con turno propio sobre el muro de la Varita del muro de fuego** (2026-11-23, P272): va por el mismo
  camino que el Muro de fuego (renglón de «Empieza tu turno» de quien la maneja); con clics, solo un personaje y un creep.
  *Resultado (con clics en «Claude · pruebas 2», GM de pruebas y Jugador 1):* Blanco creep con la varita (dada por datos) levantó el muro desde sus
  Acciones; el Jugador 1 puso a la Abeja de prueba con el combate empezado: tiró su iniciativa (2) y entró entre el creep (30) y Blanco J1 (0), con
  el Mareo; se la paró sobre el muro por datos. **Ronda 1 (mareada, resistencia al fuego 0):** al Jugador 1 le salió «▶ Empieza el turno de Abeja de
  prueba» (P299) con «🐝 Es el turno de Abeja de prueba», «Lo que pasa al empezar: nada que cambie» y el renglón «🔥 Varita del muro de fuego: Abeja de
  prueba está adentro al empezar su turno — No hay tirada para esquivarla: le entra 1d4 de daño de fuego (lo frena su resistencia al fuego). El daño
  lo tira Blanco creep.»; el botón del daño, apagado hasta «✔ Aplicar» (P274). En el cuadro del duelo tiró el GM (por el creep) y aplicó el Jugador 1:
  2 → vida 30 → 28, sin fila de resistencia. El renglón quedó «2 de daño de fuego (lo tiró Blanco creep; entraron 2)». **El mareo no frena la zona:**
  el muro le pegó igual; al querer atacar con la Abeja salió «😵 Abeja de prueba recién llega: está mareada — No actúa en su primer turno», y al
  terminar su turno, en la Mesa, «ya no está mareada». **Ronda 2 (resistencia al fuego 2, por datos en su cuchillo):** el mismo renglón; el GM tiró 4,
  la cuenta del Jugador 1 «− Resistencia al fuego 2 = pasa 2», la del GM «cuánto, lo ve su bando» → vida 28 → 26. **Quemadura:** la varita no deja
  ninguna (no la tiene; lo del Muro de la habilidad no aplica). Lo que todavía no está, porque está en la cola («Ajustes de la Varita del muro de
  fuego…»): el daño sigue en **1d4** (no 2d4), el texto dice «lo frena» (no «lo frena en parte») y el GM no ve el número de la resistencia de una
  invocación de jugador. Con una invocación el renglón **nombra la resistencia aunque sea 0** (no se lee su número; así quedó en P300): duda P331.
  La ventana del turno no dice que la Abeja está mareada: duda P332. Nada que arreglar en esta prueba. Al final, la partida como estaba (sin muro, el
  creep sin la varita, la Abeja con 30 de vida, sin estados y en su casilla, narrativo, sin orden). Capturas (fuera del repo):
  `cola108/1-J1-empieza-el-turno-de-la-abeja-mareada-sobre-el-muro.png`, `cola108/4-J1-renglon-del-muro-con-el-resultado.png`,
  `cola108/5-J1-la-abeja-mareada-no-actua.png`, `cola108/7-J1-la-cuenta-con-la-resistencia.png`, `cola108/8-J1-ronda2-renglon-con-el-resultado.png`.

- **✅ hecho (2026-11-24) — 🗺 Armar el mapa fijo «Prueba · General» en «Claude · pruebas 2»** (pedido del dueño el mismo día):
  un mapa listo para todas las pruebas, para no armar y desarmar cada vez. Con: **un solo personaje por jugador, los tres jugadores** (dueño: «no hace falta que cada jugador tenga varios personajes, porque eso puede dar
  a confusión»); al menos dos
  jugadores con una invocación cada uno, ya puestas; creeps de varios roles (warrior, tanque, mago, support, debuffer, rango); **varios objetos
  sólidos (columnas, cajas…) con espacio entre sí**, para probar lo que interactúa con ellos (empujones, choques, línea de visión, coberturas…);
  y lugar libre para movimientos, áreas y zonas. Más una **«foto» del estado inicial** guardada con un script (en el scratchpad o en `herramientas/`
  sin datos sensibles) y otro que lo **vuelve a esa foto** al terminar cada prueba (vida, estados, posiciones, giros, equipo, orden, modo).
  Después, anotarlo en `docs/memoria-claude.md` para que todas las pruebas usen ese mapa y esos scripts.
  *Resultado:* el mapa está armado y publicado. **Jugadores** (a la izquierda, uno por cuenta): Blanco J1, Blanco J2 y **Blanco J3** (nuevo, del
  Jugador 3, copia de Blanco J2: nivel 1, vida 50, Cuchillo de cazador); sus otras fichas no se tocaron (no tenían otras). **Invocaciones**: la Abeja
  de prueba del Jugador 1, **con la pasiva Vuela** (lleva puesto el estado Vuela), y la **Abeja de prueba 2** del Jugador 2 (copia limpia de la otra,
  **sin Vuela**), cada una al lado de su dueño. **Creeps** (a la derecha, del ⭐ pool esencial, nivel 1, agregados desde GM Tools y renombrados por
  rol): Warrior · Hachero, Tanque · Escudero, Liviano · Sangrador, Rango · Tirador, Mago · Piromante, Support · Sanador y Debuffer · Maldito, a la
  vista de los jugadores. **Sólidos** (en el medio, fijados, con 2 a 4 casillas libres entre sí): dos columnas (una al norte y otra al sur), dos
  cajas, una roca grande de 7 casillas y un muro corto de 3 casillas en fila. **Lugar libre**: todo el sur y los pasillos del medio. Narrativo, sin
  orden de turnos y sin niebla. **La foto y la vuelta**: `herramientas/mapa-general/` (`foto.js`, `restaurar.js`, `LEEME.md`); la foto queda fuera del
  repo. **Probado**: se movió Blanco J1, se giró el Tanque, se borró el token del Tirador, se agregaron un token suelto y un sólido, se corrió una
  caja, se pasó a combate con un orden de turnos, se le bajó la vida a Blanco J2 (31 + Veneno), a la Abeja (12) y al Warrior (9 + Stun); la vuelta
  dejó todo como en la foto («quedó igual», 82 documentos) y se vio así en el mapa, en la ficha de Blanco J2 (50/50, sin estados) y en GM Tools
  (Warrior 35, sin estados). `docs/memoria-claude.md` («Dónde se prueba») lo dice para todas las pruebas que siguen.
- **✅ hecho (2026-11-25) — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Varita de la fogata y Varita del chorro de lava** (con daño). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  **Decidido (dueño, 2026-11-25):** las dos pasan a pegar **al empezar el turno de quien está adentro** (como el Muro de fuego), manteniendo el daño
  al entrar y el golpe inmediato de la lava. Y la diferencia por la altura: la **Fogata es de piso y aire**; el **Chorro de lava es solo de piso**,
  así que **además le pega por cada paso que dé dentro del área**, y **lo frena la Suela gruesa** (solo en lo que es solo de piso).
  *Resultado:* **Fogata** (piso y aire): su zona lleva `alEmpezar` (como el Muro de fuego): pega al entrar y al empezar el turno de quien está adentro
  (con orden de turnos; sin orden, al pasar de ronda), ya no en cada Mantenimiento. Texto nuevo: «Una flor de fuego que queda ardiendo 2 turnos (los
  tuyos), en el piso y en el aire: 1d4 de fuego directo a cada rival (no lo frenan la Defensa ni la Defensa especial; sí la resistencia al fuego), al
  entrar y al empezar su turno adentro. ⚙ Automatizado: todo.» **Chorro de lava** (solo piso): `alEmpezar` y una marca nueva, `porPaso` (adentro del
  JSON de la zona, sin reglas nuevas): sigue el golpe al lanzarla; cada casilla del camino que pisa adentro (entrando o caminando por ella) es un
  golpe, el cartel lo dice («Dio 2 pasos sobre Varita del chorro de lava: le pega una vez por paso (2 veces)») y el daño se tira una vez por paso
  (cada uno con su cuenta; si cae, no le sigue pegando); y al empezar su turno adentro. Texto nuevo: «…y arde 2 turnos (los tuyos) en el piso: 1d4 a
  quien entra, por cada paso que da adentro y al empezar su turno adentro. Lo frenan la Defensa especial, la resistencia al fuego y la Suela gruesa.
  ⚙ Automatizado: todo.» **Suela gruesa**: el mapa ahora la resta solo en lo que es SOLO del piso (`suelaFrena`, js/08; también las trampas de «piso y
  aire», js/19, y «Ver detalle», `ZonaDetalle.frenoDe`); así queda resuelto de paso lo pendiente de «👟 Repasar la Suela gruesa» (el Muro de fuego ya
  no la resta, y el texto de la Varita del muro de fuego ya no la nombra). Las copias de las tres varitas en mochilas y creeps se ponen al día solas
  (`ITEMS_AL_DIA`). **Las zonas ya puestas** con el modo viejo terminan como estaban (duran 2 turnos). De paso: si el cartel de una zona ya mostraba
  su resultado, un golpe nuevo de la misma zona al mismo token se perdía (lo vi: la lava no volvía a pegar al empezar el turno si seguía abierto el
  cartel del golpe al lanzarla); ahora va a la fila. Probado con clics en «Claude · pruebas 2», mapa «Prueba · General» (GM y Jugador 1), armado por
  datos (el Mago · Piromante con las dos varitas, al lado de Blanco J1 con las Suelas de cuero de dragón del pantano, Suela gruesa 2): desde las
  Acciones del creep, la fogata centrada en J1 y el chorro de lava empezando en su casilla; el golpe inmediato de la lava (1 − Suela 2 = 0); al empezar
  el turno de J1, dos renglones: lava «lo frenan su Defensa especial y su Suela gruesa 2» (4 − 2 = 2) y fogata sin Suela (4, directo); J1 camina 2
  pasos por la lava → un cartel con 2 golpes (4 − 2 = 2, 3 − 2 = 1); pasar de ronda → ninguna zona pegó en el Mantenimiento; en su turno siguiente,
  solo el renglón de la lava (salió de la fogata); volviendo, 1 paso de lava → 1 golpe, y entrar a la fogata → su golpe al entrar. Tiró el daño el GM
  (dueño de la zona). Al final, la vuelta del mapa: «quedó igual». Pruebas automáticas: una nueva y tres puestas al día (1119 en verde). Duda: P333.
- **✅ hecho (2026-11-25) — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Varita de miasma y Pedos Tóxicos** (con daño). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  **Decidido (dueño, 2026-11-25):** (1) la **Varita de miasma** pasa a pegar **al empezar el turno de quien está adentro** y **dura 2 turnos** (en vez
  de 1). (2) Los **Pedos Tóxicos**, como excepción, **siguen en el Mantenimiento**, «para que se haga todo junto una sola vez, porque son varias
  tiradas»: en ese momento **el dueño de la nube tira una vez** (su Ef.Esp) y **cada afectado resiste en su momento** (su Res.Esp, en su pantalla).
  **✅ hecho (2026-11-25), la miasma:** pega al entrar y **al empezar el turno de quien está adentro** (el renglón de «▶ Empieza tu turno», con su
  duelo Ef.Esp contra Res.Esp, el 1d4 tóxico directo y el 50 % de Veneno), ya no al pasar de ronda; dura **2 turnos** (los de quien la tiró) y es de
  piso y aire. Texto nuevo: «Una nube tóxica en flor que queda 2 turnos (los tuyos), en el piso y en el aire. A cada rival, al entrar y al empezar su
  turno adentro: tu Ef.Esp contra su Res.Esp; el que no resiste recibe 1d4 de daño tóxico directo (no lo frenan la Defensa ni la Defensa especial;
  sí la resistencia a lo tóxico) y tiene 50 % de quedar envenenado. ⚙ Automatizado: todo.» Las copias guardadas se ponen al día solas. Probado con
  clics en «Prueba · General» (GM de pruebas, Jugador 1, Jugador 2): el Debuffer · Maldito la tiró sobre Blanco J1 y Blanco J2; al empezar el turno
  de cada uno, su renglón (J1 no resistió: 3 de daño, sin nombrar la resistencia en 0, y salió el Veneno; J2 resistió); al pasar de ronda, ningún
  cartel; volvió a pegar en sus turnos de las rondas 2 y 3 y en la 4 ya no estaba. Duda: P334 (los aliados).
  **✅ hecho (2026-11-25), los Pedos:** siguen en el Mantenimiento, pero ahora **todos juntos**: la pantalla del GM arma una sola tanda por nube con
  todos los que siguen adentro; en el primer duelo **el dueño de la nube tira su Ef.Esp con su botón** (una tirada nueva en cada Mantenimiento; antes
  se usaba para siempre la de cuando la tiró) y vale para todos; **cada afectado resiste en su pantalla**, de a uno, y si no contesta en 40 s lo
  tira la pantalla del GM por él. Lo demás igual (la diferencia como daño tóxico, el 1d20, el jefe). Quien entra a la nube, como antes (con la última
  tirada). Probado con clics: Blanco J1 los tiró con Blanco J2, el Liviano · Sangrador y el Debuffer adentro (la primera tanda con su 7); al pasar
  de ronda, una sola tanda con los tres, J1 tiró de nuevo (5) y esa misma valió para los tres; J2 no contestó y a los 40 s se tiró sola («solo: no
  contestó») y le entró el daño. Al final, la vuelta del mapa: «quedó igual». Pruebas automáticas: dos nuevas (1121 en verde). Duda: P335.
- **✅ hecho (2026-11-25) — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Nube tóxica (de clase y de creep) y Mina napalm (el piso ardiendo)** (con daño). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  **Decidido (dueño, 2026-11-25, «va así»):** (1) las **dos Nubes tóxicas** (clase y creep; piso y aire) pasan a pegar **al empezar el turno de quien
  está adentro**, como la miasma, con el resto igual; en la de la clase, **el dueño tira su Especial cada vez** (no más el valor fijo de cuando la
  lanzó). (2) La **Mina napalm** (solo piso) pasa a pegar **al empezar el turno de quien está adentro, por cada paso que da adentro, y la frena la
  Suela gruesa**, como el Chorro de lava; el golpe de 2d6 al dispararse queda igual.
  **✅ hecho (2026-11-25), la Nube tóxica de la clase:** piso y aire; pega al aparecer, al entrar y **al empezar el turno de quien está adentro** (ya
  no en el Mantenimiento; sin orden de turnos, al pasar de ronda), en el cuadro del duelo; **quien la tiró tira su Especial de verdad, con su botón,
  en cada tanda** (`tiraSuya`: ni el valor de cuando la lanzó ni la tirada de antes; al aparecer, una tirada para todos los que agarra). Lo demás
  igual. Texto nuevo: «…A cada rival que está adentro cuando aparece, que entra o que empieza su turno adentro: tirás tu Especial contra su Res.Esp
  (una tirada nueva cada vez, con tu botón); quien pierde queda con 3 stacks de Veneno. Una vez envenenado, no se le vuelve a tirar: cada vez que la
  nube lo afecta (al entrar o al empezar su turno adentro) le suma 1 stack de Veneno. No afecta a tus aliados. ⚙ Automatizado: todo…». Las copias de
  los personajes se ponen al día solas.
  **✅ hecho (2026-11-25), la Nube tóxica de los creeps:** piso y aire; al empezar el turno de quien está adentro (`alEmpezar`), el resto igual (2d4
  tóxico directo + Veneno 3; el envenenado suma 1 stack sin daño; quien resistió vuelve a tirar). Los creeps ya guardados con ella se ponen al día
  solos (`Combatiente.migrarLuzSanadora`, con los textos nuevos). **De paso:** al empezar el turno, al que ya está envenenado ya no le salta el
  cartel del Veneno encima de «▶ Empieza tu turno»: es un renglón más («☠ Sumar 1 stack de Veneno») y el cartel de «Aplicar / Resolver a mano» sale
  al tocarlo (un creep, el cartel de siempre del GM).
  **✅ hecho (2026-11-25), la Mina napalm:** la explosión (2d6, piso y aire) queda igual; el piso ardiendo es **solo de piso** y pega **al entrar, por
  cada paso que se da adentro y al empezar el turno de quien está adentro** (como el Chorro de lava; entrar es el primer paso, P333); lo frenan la
  Defensa especial, la resistencia al fuego y la Suela gruesa; alcanza también a los aliados. Va en `trampaDatos.zonaModo` (comun/catalogo.js) → `zm`
  en la trampa puesta → el JSON de la zona al dispararse (js/08); las minas de las mochilas y los creeps se ponen al día solas. Texto nuevo: «El piso
  queda ardiendo 3 turnos: 1d6 de fuego a quien entra, por cada paso que da adentro y al empezar su turno adentro. Lo frenan la Defensa especial,
  la resistencia al fuego y la Suela gruesa.» El cartel de la trampa («Queda en el piso») lo dice igual.
  *Probado con clics* en «Claude · pruebas 2», mapa «Prueba · General» (GM de pruebas, Jugador 1 y Jugador 2), armado por datos: el Debuffer ·
  Maldito con la Nube tóxica **vieja** (se puso al día sola al leerla) la tiró sobre Blanco J1 y Blanco J2 (los dos con Veneno 3); al empezar el turno
  de cada uno, su renglón («☠ Sumar 1 stack»: 3 → 4); al pasar de ronda, ningún cartel de la nube; sin Veneno, al empezar su turno J1 tuvo su duelo
  (Res.Esp, 2d4, Veneno 3). Blanco J1 con la Nube de la clase sobre el Warrior y el Tanque: al aparecer tiró su Especial (8) para los dos; al
  empezar el turno del Warrior (envenenado) +1 stack; al del Tanque (había resistido) **J1 volvió a tirar su Especial** (3). Mina napalm: el Rango ·
  Tirador la puso, J1 la pisó (2d6 = 10, sin Suela); caminó 2 pasos por el piso ardiendo (2 golpes: 1 − Suela 2 = 0 y 2 − 2 = 0); al pasar de ronda
  nada; al empezar su turno, su renglón (6 − Suela 2 = 4). Tiró el daño el GM (dueño de la zona). Al final, la vuelta del mapa: «quedó igual».
  Pruebas automáticas: una nueva (1122 en verde). Dudas: P336, P337.
- **✅ hecho (2026-11-25) — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): el terreno incendiado y las zonas hechas a mano con el asistente** (con daño). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  **Decidido (dueño, 2026-11-25):** (1) el **Terreno incendiado** pasa a ser **de piso y aire** («vamos a asumir que hay fuego») y pega **al empezar
  el turno de quien está adentro** (y al entrar), sin «cada paso» ni Suela gruesa; ahora también alcanza a quien vuela o levita (actualizar el texto
  de Levitar, que dice que no lo quema); las invocaciones, con su renglón como los demás. El daño fijo queda igual. (2) Las **zonas hechas a mano**:
  al empezar el turno de quien está adentro; si son **solo de piso**, además por cada paso y con Suela gruesa; si son **de piso y aire**, sin eso.
  **✅ hecho (2026-11-25), el terreno incendiado:** va por el mismo motor que las demás zonas (el mapa le suma, solo en pantalla, los datos de una
  zona: no se escribe nada nuevo en la nube). Es de piso y aire: pega **al entrar** (también si solo lo cruza) y **al empezar el turno de quien está
  adentro** (un renglón de «▶ Empieza tu turno», como el Muro de fuego); sin orden de turnos, al pasar de ronda. Ya no en el Mantenimiento si está en el
  orden; sin «cada paso» ni Suela gruesa; **alcanza a quien vuela o levita** y **a las invocaciones** (con su renglón; antes el GM las aplicaba a mano).
  El daño, el de siempre: fijo (5 por defecto), directo a la vida, a cualquiera (fuego amigo); como antes, no lo frena la resistencia al fuego (P338).
  Como es un número fijo, **no hay tirada**: lo aplica la pantalla de quien lo recibe (como toda zona de número fijo, P245), no el GM. Si quien lo recibe
  está escondido, la Mesa y la Crónica dicen «**Un personaje oculto** · Terreno incendiado» sin nombre (P326; sirve para todo daño fijo de una zona).
  Textos al día: Levitar (`comun/ficha-calculo.js`), las Zapatillas de pluma y de levitación (las copias se ponen al día solas), «Ver detalle», el cartel
  de arriba, el 🔍 de la casilla y el manual. Ojo: el terreno incendiado **ya no se puede crear desde Terreno y Formas** (desde el 2026-09-28 lo
  reemplaza el asistente de zonas); sigue andando el que ya está puesto o se copia con Ctrl+C / Ctrl+V (P339).
  **✅ hecho (2026-11-25), las zonas del asistente:** si «siguen afectando a quien se queda adentro», ahora pegan **al entrar y al empezar su turno
  adentro** (sin orden de turnos, al pasar de ronda), ya no en cada Mantenimiento. **Solo de piso**: además **una vez por cada paso** que da adentro
  (entrar es el primero, P333), las frena la Suela gruesa y no tocan a quien vuela o levita (la pregunta de «cruzarla» ya no se hace). **Piso y aire**
  (o del aire): sin eso (se sigue pudiendo elegir si cruzarla cuenta). Los textos del asistente lo dicen así. **Las zonas ya puestas terminan como
  estaban** (en cada Mantenimiento; duran pocos turnos), como con las varitas.
  *Probado con clics* en «Claude · pruebas 2», mapa «Prueba · General» (GM de pruebas, Jugador 1, Jugador 2): el GM puso terreno incendiado (por datos)
  debajo de Blanco J1 y de la Abeja de prueba (la que vuela); con orden de turnos, al empezar el turno de J1, su renglón (5, directo: 50 → 45); al empezar
  el de la abeja, su renglón (ahora sí la quema volando: 30 → 25); al pasar a la ronda 2, ningún golpe en el Mantenimiento (vida igual) y otra vez el
  renglón al empezar el turno de J1; J1 salió y volvió a entrar → su golpe al entrar. El GM armó con el asistente (con clics) «Brasas» solo de piso y
  «Llamarada» de piso y aire (1d4 de fuego): al empezar el turno de la abeja y de J1 en la Llamarada, su renglón (sin Suela); al empezar el de Blanco J2
  (con las Suelas de cuero de dragón del pantano, Suela gruesa 2) en las Brasas, su renglón (4 − Suela 2 = 2); J2 caminó 2 pasos adentro → un cartel
  «Dio 2 pasos…: le pega una vez por paso (2 veces)» y 2 golpes (3 − 2 = 1, 1 − 2 = 0); al pasar de ronda, nada. Tiró el daño con dados el GM (dueño de
  la zona). J1 en Sigilo entró al terreno: el GM leyó «Un personaje oculto · Terreno incendiado» en la Mesa y la Crónica. Al final, la vuelta del mapa:
  «quedó igual». Pruebas automáticas: dos nuevas y una puesta al día (1124 en verde). Dudas: P338, P339.
- **✅ hecho (2026-11-25) — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Gas adormecedor y Gas somnífero** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  **Decidido (dueño, 2026-11-25):** las dos pasan a «al entrar y al empezar el turno de quien está adentro» (sin orden de turnos, al pasar de
  ronda), como la Fogata y la miasma; son de aire: sin pasos ni Suela gruesa, alcanzan a quien vuela. Quien ya tiene el estado y empieza otro turno
  adentro **vuelve a tirar** y, si falla, el estado vuelve a contar 2 turnos desde ahí (opción a). Las nubes ya puestas terminan como estaban.
  **Cómo quedó:** las dos trampas llevan `trampaDatos.zonaModo = {altura: 'aire', alEmpezar: true}` (el mismo camino que la Mina napalm: va a la
  trampa puesta como `zm` y, al dispararse, al JSON de la nube). La nube pega al detonar, **al entrar** (también si solo la cruza; moverse adentro no
  lo repite) y **al empezar el turno de quien está adentro**, con un renglón en «▶ Empieza tu turno» y su tirada (Res.Mt contra 7 / Res.CC contra 9);
  sin orden de turnos (o a quien no está en el orden), al pasar de ronda; con orden, ya no en el Mantenimiento. Es del aire: sin pasos ni Suela, y le
  toca a quien vuela o levita. **Opción (a):** el código ya renovaba un estado repetido (el mismo nombre se reemplaza: no se apila); ahora, además,
  al empezar su turno **le vuelve a tocar aunque ya la haya sufrido en esa misma ronda** (al detonar o al entrar; antes la nube de una trampa le
  tocaba una sola vez por ronda), y el renglón lo dice: «no resistió (Res.Mt −12 contra 7) · Cansado: ya lo tenía, vuelve a 2 turnos» (P341). **Lo
  oculto:** la tirada de quien está escondido sale en la Mesa como «Un personaje oculto · Res.Mt» y la Crónica «Un personaje oculto está en Gas
  adormecedor…» (P326; vale para la tirada de resistencia de cualquier zona). Texto nuevo (las dos): «…La nube queda 3 turnos en las 7 casillas, en el
  aire (alcanza también a quien vuela o levita): lo sufre quien entra y quien empieza su turno adentro (moverse adentro no lo repite). Quien ya lo
  tiene vuelve a tirar: si falla, vuelve a 2 turnos.» Al día también: el cartel de la trampa al dispararse («lo sufre quien entra y quien empieza su
  turno adentro»), el «Después» de la ficha corta de la trampa, «Ver detalle» (dice que quien ya lo tiene vuelve a tirar), el cartel de arriba y el
  🔍 de la casilla (que antes decía «a quien sigue adentro en el Mantenimiento» para todas las zonas, también la Fogata o el Muro de fuego). El
  manual no hablaba de esto. **Las copias guardadas** se ponen al día solas en la mochila (como las varitas) y, desde hoy, también en el **cinturón**
  de los personajes y de los creeps (antes no: tampoco la Mina napalm del cinturón; ahora sí). Las nubes ya puestas y las trampas ya armadas en el
  mapa siguen como estaban. **De paso:** el salto de la Descarga eléctrica (`trampaSaltar`, js/19) tenía un error desde el arreglo de la Mina napalm
  (usaba una variable que no existía) y cortaba el salto: arreglado.
  *Probado con clics* en «Claude · pruebas 2», mapa «Prueba · General» (GM, Jugador 1, Jugador 2), armado por datos (el Gas adormecedor de fábrica
  puesto como del Debuffer · Maldito, y Blanco J1 con un estado de prueba que le baja la Res.Mt para que falle): con orden de turnos, J1 pisó el gas
  y lo alcanzó a él, a Blanco J2 y a la Abeja de prueba (la que vuela); J1 y la abeja quedaron Cansados, J2 lo resistió; al empezar el turno de la
  abeja, su renglón (no resistió: «Cansado: ya lo tenía, vuelve a 2 turnos»); J2 se escondió (Sigilo) y al empezar su turno, su renglón (no resistió:
  Cansado 2 turnos) y el GM leyó «Un personaje oculto · Res.Mt» en la Mesa y «Un personaje oculto está en Gas adormecedor…» en la Crónica; al pasar a
  la ronda 2, nada en el Mantenimiento; al empezar el turno de J1 (ya Cansado: 2 → 1), su renglón y volvió a fallar: «Cansado: ya lo tenía, vuelve a
  2 turnos» (quedó en 2). «Ver detalle», el cartel de arriba y el 🔍, con el texto nuevo. Al final, la vuelta del mapa: «quedó igual». Pruebas
  automáticas: una nueva (1131 en verde). Dudas: P341, P342, P343.
- **✅ hecho (2026-11-23) — 🔥 El Muro de fuego lo frena la resistencia al fuego.** Dueño: «En el Muro de fuego, si bien no se resiste, el daño sí
  lo frena la resistencia al fuego. Ajustá esta tarea con lo de la resistencia al fuego, que ya esté resuelto eso.» (El renglón de «Empieza tu turno»
  y el cartel decían «No hay tirada para resistirla: le entra 1d4 de daño de fuego…», como si nada lo frenara.)
  *Resultado:* el daño ya restaba la resistencia al fuego en los tres caminos (al entrar, al cruzar, al empezar el turno: los tres van por el cartel de
  la zona → el cuadro del duelo, `dueloAplicarDano`, la misma función que el resto del daño elemental); no hubo que tocar la cuenta. Lo que se cambió
  son los textos: el cartel y el renglón dicen «No hay tirada para esquivarla: le entra 3d4 de daño de fuego (lo frena su resistencia al fuego 2)»
  (con el número de un personaje; «lo frenan su Defensa especial y su resistencia al fuego» en la varita; «es inmune al fuego: su resistencia al
  fuego es 99»; la Suela gruesa si la tiene); «Ver detalle»: «Tirada para evitarla: no se puede esquivar» y «Qué frena el daño» con la resistencia
  (99 = inmune, negativa = entra de más) y la Suela gruesa también en «piso y aire» (la resta el mapa); la cuenta dice «Resistencia al fuego» (antes
  «Resistencia a fuego») y la frase de la Mesa «No le hizo daño (lo frenó: Resistencia al fuego)» (antes, siempre «la armadura o el escudo»). Sirve a
  toda zona con daño sin tirada (`ZonaDetalle.frenoDe` / `frenoCorto`, comun/zona-detalle.js), sin cambiar cuándo pegan. Probado con clics en
  «Claude · pruebas 2» (GM, J1, J2), con la resistencia al fuego de Blanco J1 y el Muro de fuego en Blanco creep **armados por datos**: Muro de la
  habilidad, al entrar con resistencia 2 (6 − 2 = 4) y al empezar el turno con 2 (5 − 2 = 3) y con 99 (8 − 99 = 0, el texto de inmune); Varita del
  muro de fuego, al cruzar con 99 (cartel «INMUNE AL FUEGO» en la pantalla del GM) y con 2 (4 − 2 = 2, «Daño especial»); las tiradas con «✍ Elegir
  manualmente». Al final, todo como estaba (sin muros, sin la resistencia ni la habilidad/varita de prueba, vida y No2 de antes, narrativo, sin orden).
  Las pruebas del cartel puestas al día y una nueva (1045). Dudas: P296 (¿la varita también la frena la Defensa especial?) y P297 (el número en el cartel).

- **✅ hecho (2026-11-23) — 🔥 Varita del muro de fuego directa y la resistencia sin número para el rival (P296, P297).** Dueño: (P296) «probablemente
  sea un daño bajo (1d4) y debería ser daño directo»; (P297) «me gustaría que el equipo rival no vea el número, pero que sí diga resistente al fuego,
  resistente a lo tóxico, pero que no diga cuánto».
  *Resultado:* **P296** — la varita (catálogo) lleva `danoDirecto`: su muro sale con `zonaDirecto` y no lo frenan la Defensa ni la Defensa especial; sí
  la resistencia al fuego y la Suela gruesa (es de piso y aire). El texto de la varita lo dice («1d4 de fuego directo a cada rival (no lo frenan la
  Defensa ni la Defensa especial; sí la resistencia al fuego y la Suela gruesa)»), y «Ver detalle», el cartel, el renglón de «Empieza tu turno» y la
  cuenta del duelo lo toman de la zona. Las varitas ya guardadas se ponen al día solas (`ITEMS_AL_DIA`, también la de un creep). **P297** — el número
  de la resistencia de quien recibe el daño lo ve solo su bando (`Combatiente.verResDe`: el GM, el de los creeps; los jugadores, el de los personajes):
  el bando rival lee «lo frena su resistencia al fuego (es resistente)», «es inmune al fuego» o «(es vulnerable: le entra de más)», sin cuánto; de un
  creep, solo lo que los jugadores ya descubrieron (`revelado`, js/89). En la cuenta del cuadro del duelo, el rival ve «− Resistencia al fuego» sin
  valor («cuánto, lo ve su bando») y el resultado final igual (elegido así: el pedido es no decir cuánto; la cuenta queda clara; restando se puede
  deducir — P298). La Mesa y la Crónica las ven todos: ahí la resistencia va siempre sin el número (`Combatiente.resSinNumero`; también la línea del
  daño directo de una zona y el aviso de los saltos del rayo). Probado con clics en «Claude · pruebas 2» (GM, J1, J2), **armado por datos**: Blanco J1
  con resistencia al fuego 2 y Defensa especial 3 (un estado de prueba); Blanco creep con una copia VIEJA de la varita (sin «directo»: se puso al
  día sola) y después con resistencia al fuego 2; J1 con la varita en la mochila. (a) Varita del creep, J1 la cruza: cartel en la pantalla de J1 «(lo
  frena su resistencia al fuego 2)», sin Defensa especial; cuenta 4 − 2 = 2 (la Defensa especial 3 ya no frena): J1 y J2 ven «Resistencia al fuego 2»,
  el GM «Resistencia al fuego · cuánto, lo ve su bando»; la Mesa sin número; «Ver detalle»: «No lo frenan la Defensa ni la Defensa especial (va
  directo)». (b) Varita de J1, el creep la cruza: cartel en la pantalla del GM «(lo frena su resistencia al fuego 2)»; cuenta 4 − 2 = 2: el GM con
  el número, J1 y J2 sin él; se reveló «Blanco creep es resistente al fuego» (sin número). Tiradas con «✍ Elegir manualmente». Al final, todo como
  estaba (sin muros; el creep sin la varita, sin la resistencia ni lo descubierto, vida 60 y No2 5, en su casilla; J1 y J2 con su mochila, vida,
  No2 y estados de antes, en su casilla; narrativo, sin orden de turnos). Dos pruebas nuevas (1047).

- **✅ hecho (2026-11-25: con las varitas de P295, la Suela gruesa ya se resta solo en lo que es solo de piso; el Muro de fuego ya no la resta) — 👟 Repasar la Suela gruesa** (dueño, 2026-11-23: «no me acuerdo bien qué es»; P298 punto 4): contarle qué es y qué hace hoy, y si al
  rival se le nombra en el cartel del daño de una zona.

  **Pendiente (dueño, 2026-11-24):** «en la prueba del muro de fuego decía que la suela lo frenaba, y el muro de fuego es suelo y aire, así que
  técnicamente la suela gruesa no debería frenarlo». Hoy el mapa resta la Suela gruesa también en las zonas de «piso y aire» (`frenoDe`, y el
  cartel «su Suela gruesa N»): que solo la reste en lo que es solo del piso.

- **✅ hecho (2026-11-23) — 🐝 «Empieza tu turno» de una invocación dice su nombre** (P299, dueño 2026-11-23: «sí»): «▶ Empieza el turno de Abeja de prueba»
  (y que se entienda que no es el turno del personaje).
  *Resultado:* título «▶ Empieza el turno de Abeja de prueba», primer renglón «🐝 Es el turno de Abeja de prueba — Empieza el turno de tu invocación, no
  el de Blanco J1: lo de abajo le pasa a Abeja de prueba», «Sus estados», el renglón «Muro de fuego: Abeja de prueba está adentro al empezar su turno» y
  «⏱ YA NO ES SU TURNO». La de un personaje sigue «▶ Empieza tu turno». Probado con clics (pantalla del Jugador 1, dos rondas y el cierre).
- **✅ hecho (2026-11-23) — 🔥 «Lo frena (en parte) su resistencia al fuego» solo si hay resistencia** (P300, dueño 2026-11-23, opción a): con resistencia 0, el
  cartel y el renglón de la zona no la nombran («le entra 1d4 de daño de fuego»). En una invocación sin el número a mano, como hoy.
  *Resultado:* con resistencia 0 (y el número a la vista de esa pantalla) no se nombra; lo demás que frena (Defensa especial, Suela gruesa) sigue. Sin el
  número (una invocación, o un creep que los jugadores no descubrieron) sigue «lo frena su resistencia al fuego»: los jugadores no se enteran de nada
  nuevo de un creep. Probado con clics: Blanco J1 (resistencia 0) leyó «le entra 3d4 de daño de fuego y Quemadura (3 turnos)»; la abeja, como antes.
  (El «en parte» de los textos es otra tarea de la cola, todavía sin hacer.)
- **✅ hecho (2026-11-25) — Probar: 🐝 una invocación de verdad (con su habilidad) entra al orden con su tirada y sale al morir** (2026-11-23, P275): con clics se puso
  la abeja con «🎭 Ponerlo en el mapa» (el mismo camino: aparece el token) y se fue con «Turnos agotados → Borrar»; falta invocarla con una habilidad que
  invoca y que salga del orden al caer con la vida en 0.
  *Resultado:* probado con clics en «Claude · pruebas 2», mapa «Prueba · General» (GM y Jugador 1), con el orden armado, en Combate. A Blanco J1 se le dio
  a mano una habilidad de prueba que invoca a su abeja («Llamar abeja (prueba)», 0 SP; la sacó la vuelta). Como su abeja ya estaba en juego, la habilidad
  creó una copia («Abeja de prueba 2»): J1 eligió la casilla con un clic y la pantalla del GM tiró su Iniciativa (1d4 = 3, a la Mesa: «Iniciativa · Abeja
  de prueba 2») y la puso **justo después de J1** (empate con él: después), con la Crónica «Sacó 3 de iniciativa: queda después de Blanco J1 · Recién
  llega: no actúa en su primer turno». **Mareo**: al terminar J1, le tocó a la abeja («▶ Empieza el turno de Abeja de prueba 2»); al tocar Atacar salió
  «Recién llega: está mareada — no actúa en su primer turno» (con «Hacerlo igual»); al terminar ese turno se fue el mareo («ya no está mareada: terminó
  su primer turno»). **Al morir**: J1 le bajó la vida a 0 (HP directo) → el token desaparece («💀 Abeja de prueba 2 desaparece: murió») y **sale del orden**
  en ~1,5 s. Segunda vez, invocada fuera de turno (sacó 1, entró después del Sanador, que tenía el turno) y muerta **en su propio turno**: salió del orden
  y el turno pasó a Blanco J3. Visto de paso: cada vez que se invoca se crea otra copia («… 3») porque la copia muerta no se vuelve a usar → P344.
  No se probó la pantalla de J3 al recibir el turno (no estaba conectado). Capturas fuera del repo (cola116). La vuelta: «quedó igual».
- **✅ hecho (2026-11-25) — Probar (reglas ya pegadas por el dueño el 2026-11-23): 📦 el token suelto paso a paso guarda la iniciativa y la vida** (2026-11-23): crear uno con «No» en la
  iniciativa y ver que «Traer tokens» / «Tirar iniciativa» no lo meten; otro con «Sí», que entra. Uno con vida: el círculo rojo en el token, cambiarla a
  mano («12», «-3», Ctrl+Z) desde quien lo puso y desde el GM; en la tarjeta 🪪 y al pasar el mouse, la de un jugador con números y la del GM sin números
  para los jugadores. Editarlo: bajar el máximo (la vida no pasa del nuevo) y sacarle la vida.
  *Resultado:* probado con clics en «Claude · pruebas 2», mapa «Prueba · General» (GM, Jugador 1 y Jugador 2). Los pasos arrancan en «No» y «No» (P305).
  **Iniciativa:** con cuatro sueltos puestos (un cofre del GM con «No», un guardia del GM con «Sí», una caja del Jugador 1 con vida 20 y «No», una puerta
  del GM con vida 30 y «No»), «Traer tokens» trajo a los 12 de siempre más el guardia, y ninguno de los «No»; «🎲 Tirar iniciativa de los creeps» tampoco
  los metió (el guardia, sin nada que tirar, sale en «Sin datos de: Guardia…», como quedó en P291: el número se escribe a mano). **Vida:** el círculo rojo
  «20/20» al seleccionar la caja; con «2 · HP directo», «12» → 12, «-3» → 9, Ctrl+Z → 12 → 20 («Deshecho: HP vuelve a…»), igual desde el Jugador 1 y
  desde el GM (en la caja del jugador y en su propia puerta). **Tarjeta 🪪 y globo del mouse:** la caja del Jugador 1, vista por el Jugador 2, el GM y él
  mismo: «❤ Vida 20 de 20 · se lo puede atacar» y el círculo con números (al Jugador 2, sin poder cambiarlo); la puerta del GM, vista por los dos jugadores:
  «❤ Tiene vida · se lo puede atacar», sin números y sin círculo (P308); el GM la ve con números. El cofre sin vida: solo «🪨 No ocupa lugar en la iniciativa».
  **Editar:** la caja en 15/20 → máximo 10 → quedó 10/10; la puerta en 25/30 → máximo 12 → 12/12; «— No: no tiene vida» → sin círculo ni renglón de vida.
  **Error encontrado y arreglado:** el menú de la vida arranca en «1 · Recibe daño», y en un suelto escribir «12» ahí fallaba con un mensaje técnico
  («No se pudo aplicar: Invalid document reference…», buscaba una ficha que no tiene) y decía «No conozco su Defensa todavía». Ahora dice «Es un objeto:
  no tiene Defensa… entra entero», la vista previa «7 entra entero → HP 20 → 13», aplica el golpe entero (con Ctrl+Z) y «+50» suma sin pasar del máximo
  y sin preguntar por Vida extra (`vtt-hexgrid/js/10`: `hudHpHtml`, `hudHpPrevia`, `hudHpAplicar`, `hudSumarVida`). Probado otra vez con el Jugador 1 y el
  GM. No se probó con el Jugador 3 (no hacía falta). Capturas fuera del repo (cola118). La vuelta: «quedó igual».
- **✅ hecho (2026-11-25) — Probar (reglas ya pegadas por el dueño el 2026-11-23): 📦 atacar a un token suelto con vida** (2026-11-23): el Jugador 1 ataca con su arma a un objeto del GM y a
  uno del Jugador 2 (cada uno contesta «🪨 Evasión 1» desde su pantalla; si no está, el GM a mano), el crítico, el daño que entra entero, «✍ Otro valor»,
  la línea de la Mesa, llegar a 0 («💥 Roto») y una habilidad dirigida contra el objeto.
  *Resultado (junto con las tres de abajo, una sola tarea):* probado con clics en «Claude · pruebas 2», mapa «Prueba · General» (GM, Jugador 1 y
  Jugador 2). Se pusieron con «＋ Token suelto» un barril del GM (vida 12), una caja del Jugador 2 (vida 10) y un cofre del GM sin vida, al lado de
  Blanco J1. **Arma contra el barril del GM:** el GM contestó «🪨 Evasión 1 (es un objeto)» desde su pantalla; PdG 6 a mano → «📦 SIN CRÍTICO: ES UN
  OBJETO»; el daño (11) entró entero (12 → 1), con la cuenta «es un objeto, sin Defensa: entra entero» y en la Mesa «… · 📦 contra un objeto no hay
  crítico». **Arma contra la caja del Jugador 2:** el mapa pregunta «es un aliado, ¿igual atacarlo?»; el Jugador 2 contestó «🪨 Evasión 1» desde su
  pantalla; sin crítico; «✍ Otro valor» 10 desde su pantalla → 10/10 → 0/10, y le apareció el aviso nuevo «💥 … se rompió… ¿Lo sacás del mapa?»
  («Dejarlo»: quedó roto en el mapa). La Mesa: «Blanco J1 atacó a Caja de J2… Le bajó 10 de vida. Caja de J2 se rompió 💥.». **Sin el Jugador 2:**
  el GM escribió la Evasión a mano (1), sin crítico, y aplicó el daño «por la caja». **Habilidad dirigida:** Mala sombra contra el barril (el GM
  contestó «🛡 Res.Mt»): funcionó, y su estado quedó «✘ No entra: 📦 es un objeto: no recibe estados». **Llegar a 0 a mano:** el GM le bajó la vida
  al barril con el menú de la vida → aviso → «Sacarlo del mapa» → «🗑 Barril (prueba) salió del mapa». **Sin vida:** el cofre no brilla y tocarlo
  dice «📦 Cofre sin vida (prueba) no tiene vida: no se lo puede atacar. Elegí otro.» (con el arma y con Mala sombra); el Remolino, con el cofre
  pegado, no encontró a nadie. **Errores encontrados y arreglados:** a un objeto le quedaba pendiente el Sangrado del arma («Aplicar Sangrado sobre el
  barril» → «no se pudo aplicar solo: hacelo a mano»); ahora los efectos que dejan un estado, curan o tocan los No2 quedan «no entra: es un
  objeto» solos (`objetoSinEstados`, comun/duelo.js). El cuadro decía «creep» debajo del objeto del GM (ahora «📦 objeto»), «Se le resta la Defensa
  del defensor» y «lo frena la Defensa» (ahora «es un objeto, sin Defensa: entra entero»), y la Mesa decía que la caja «cayó» (ahora «se rompió 💥»).
  Dudas nuevas: P346 (¿un objeto tiene espalda? se sumó «+1 por la espalda» contra la caja) y P347 (el aviso si quien lo puso no estaba conectado).
  No se probó con el Jugador 3 (no hacía falta). Capturas fuera del repo (cola119). La vuelta: «quedó igual».
- **✅ hecho (2026-11-26) — Probar: 🤝 el cartel «El GM te dio algo» en el mapa y con el GM con 🎮 el control** (2026-11-23, de P278): con clics se vio el cartel en la
  ficha del Jugador 1; falta verlo con el jugador mirando el mapa, y que el GM con 🎮 el control de un personaje vea en el 🤝 Dar de la izquierda «🤝 Dar
  como GM» y «🤝 Pasar algo de la mochila de …» (los dos con 🤝, con textos distintos). El Ver de un ítem de GM Tools se abrió por función (el botón
  «🤝 Dar a un jugador» sí se tocó con un clic).
  **Cómo quedó (2026-11-26), todo con clics** («Claude · pruebas 2», mapa «Prueba · General», GM + Jugador 1 + Jugador 2): (1) **cartel en el
  mapa**: el GM, con el 🤝 Dar de la izquierda (sin el control de nadie se abre directo «Dar a un jugador»), le dio una Misericordia a Blanco J1
  mientras el Jugador 1 miraba el mapa: le salió el cartel «🤝 El GM te dio algo» («ya está en tu mochila», «✔ Aceptar» lo cierra), la línea en la
  Mesa y el ítem en la mochila (el cartel tardó unos segundos más que la línea de la Mesa). (2) **El GM con 🎮 el control** de Blanco J2 (👓 →
  «🎮 Tomar el control»): el 🤝 Dar abre «🤝 Dar» con las dos opciones, cada una con 🤝 y su texto: «🤝 Dar como GM» y «🤝 Pasar algo de la mochila
  de Blanco J2». Con «Dar como GM» le dio una Misericordia a Blanco J2: entró bien y el cartel le salió **al GM** (como estaba pensado) y no al Jugador 2,
  que solo ve la Mesa (duda nueva: **P348**). Con «Pasar algo de la mochila de Blanco J2» le ofreció esa Misericordia a Blanco J1: al Jugador 1 le llegó «Te ofrecen algo», tocó
  «A la mochila», pasó de una mochila a la otra y la Mesa dijo «🤝 Blanco J2 le pasó Misericordia a Blanco J1». Después «↩ Devolver el control».
  (3) **El Ver de un ítem de GM Tools, con clics**: ⚔ Catálogo → buscar «Yelmo de hierro» → «Ver» → «🤝 Dar a un jugador»: la ventana se abrió con
  el yelmo ya en «Lo que vas a dar»; se marcó Blanco J1 y «🤝 Dar»: al Jugador 1, en el mapa, le salió el cartel y el yelmo entró. Sin errores en
  ninguna pantalla. No se probó con el Jugador 3 (no hacía falta). Capturas fuera del repo (cola120). La vuelta: «quedó igual» (las mochilas de
  Blanco J1 y Blanco J2 volvieron a como estaban).

- **✅ hecho (2026-11-26) — 🕊 Cambiar el ícono de «Quitar el Pacto» del anillo del token** (dueño, 2026-11-23, con captura: «el ícono de "quitar pacto" no
  me gusta, además la paloma quedó para mensajes. Quizás el mismo emoji del pacto, pero con el círculo rojo de "prohibido" encima»). Hoy es 🕊
  (`vtt-hexgrid/js/10-hud-y-vida.js`, `pacto-quitar`). Pasarlo al emoji del Pacto con un 🚫 / círculo rojo tachado encima; revisar si la 🕊 aparece
  en otros lugares del Pacto (js/83, Mesa, carteles) y cambiarla también ahí, para que la paloma quede solo para los mensajes secretos.
  *Resultado:* en el anillo del token, «Quitar el Pacto» ahora es el 😇 (el mismo emoji del Pacto) con un círculo rojo tachado encima, dibujado en
  SVG (`PACTO_QUITAR_ICONO`, js/83; `.hud-sin-pacto`, mapa.css). Donde solo va texto (el cartel de confirmar y su botón, el aviso «Quitando…», la
  Crónica y el Aviso al jugador) dice 😇🚫. La 🕊 quedó solo para los mensajes secretos. Probado en «Prueba · General»: el GM le dio el Pacto a
  Blanco J1 (😇), apareció el 😇🚫 en el ⋯, lo quitó; la Mesa dijo «El GM le quitó el Pacto a Blanco J1» y al Jugador 1 le saltó «😇🚫 Sin el Pacto».
  1141 pruebas en verde. Capturas fuera del repo (cola121). La vuelta: «ya está igual a la foto».

- **✅ hecho (2026-11-26) — 🐝 Invocación cuyo lugar ya pasó: juega igual al final de esta ronda (P301 decidida, b)** (dueño, 2026-11-23): si al
  invocarse su tirada la ubica en un lugar que ya pasó en esta ronda, en esta ronda juega igual al final, y desde la próxima en su lugar.
  **Lo mismo para lo sumado a mano** con el ➕ del token (P328 2, dueño, 2026-11-24): hoy usa el mismo `OrdenTurnos.entrarConTirada`
  (`vtt-hexgrid/js/136`), así que alcanza con cambiarlo ahí; revisar que la línea de la Mesa del ➕ deje de decir «juega desde la próxima».
  *Resultado:* `OrdenTurnos.entrarConTirada` ya no lo anota como que ya jugó: lo pone al final del orden, lo marca en `iniciativa.finRonda` (en la
  tabla, un ⤵ al lado del nombre, con su globo) y en `reubicar`, y al pasar de ronda va a su lugar por su número (lo mismo que el sobrepeso). Vale para
  las invocaciones, los refuerzos y el ➕. La Crónica y la Mesa dicen «Su lugar ya pasó en esta ronda: juega igual al final de esta ronda, y desde la
  próxima en su lugar». Varios así en la misma ronda: al final, por su tirada (P349). **Con el Mareo** (P327) anda bien: si su primer turno es ese del
  final, ahí no actúa y el mareo se va al terminarlo; en la ronda siguiente actúa en su lugar. 1143 pruebas en verde (dos nuevas).
  Probado con clics en «Claude · pruebas 2», mapa «Prueba · General» (GM y Jugador 1), en Combate: Blanco J1 (0, el último) invocó a su abeja con una
  habilidad de prueba en su turno; sacó 2 y entró **después de J1, al final** («⤵»), mareada. Al terminar J1 le tocó a la abeja (el cartel «Empieza el
  turno de Abeja de prueba 2» al Jugador 1), al tocar Atacar salió «Recién llega: está mareada», y al terminar su turno se le fue el mareo («terminó su
  primer turno») y empezó la ronda 2 con la abeja **en su lugar, antes de J1**; en la ronda 2 jugó ahí, sin mareo. **El ➕**: con el turno del Mago (20), el
  GM sacó con la ✕ al Sanador y al Debuffer y los sumó con «✍ Escribir el número» (27 y 29): los dos al final, el Debuffer primero, con la línea nueva
  en la Mesa; en la ronda 3, cada uno en su lugar. Capturas fuera del repo (cola122). La vuelta: «quedó igual».
- **✅ hecho (2026-11-25) — 📦 Atacar a un objeto: sin crítico (P306 decidida, b)** (dueño, 2026-11-23): contra un token suelto con vida no hay crítico.
  *Resultado:* el duelo marca al objeto al crearse (`defensor.objeto`, `Duelo.crear`, que lee el token entero con `window.dueloTokenDe` del mapa) y, si
  el golpe iba a ser crítico, entra como uno normal (`entrarCritico`, como el Blindado): el paso 4 dice «📦 SIN CRÍTICO: ES UN OBJETO» y «Contra un
  objeto no hay crítico: … recibe el golpe con su daño normal (entero: no tiene Defensa)», y la Mesa suma «· 📦 contra un objeto no hay crítico».
  Además, un objeto no recibe estados (lo decía la P306 y no se cumplía con los efectos del arma). Probado con clics (ver la entrada de arriba).
- **✅ hecho (2026-11-25) — 📦 Objeto en 0 de vida: aviso a quien lo puso para que lo saque (P307 decidida, d)** (dueño, 2026-11-23).
  *Resultado:* cuando la vida de un objeto pasa de más de 0 a 0 (por un duelo, por el menú de la vida o por Ctrl+Z), en la pantalla de quien lo puso
  aparece «💥 X se rompió (llegó a 0 de vida). ¿Lo sacás del mapa?» con «Sacarlo del mapa» / «Dejarlo» (`sueltoRotoAviso`, js/13; lo dispara
  `escucharTokens`, js/09). No se borra solo: con «Dejarlo» queda «💥 Roto» como antes. Probado con clics: el Jugador 2 (por un duelo) y el GM (a mano,
  y lo sacó). Si quien lo puso no está conectado no le llega nada: P347.
- **✅ hecho (2026-11-25) — 📦 Un token suelto sin vida no se puede atacar** (dueño, 2026-11-23: «no se debería poder atacar un token suelto»; sobre el
  hallazgo de que atacar uno sin vida abre un duelo donde el defensor no tiene opciones). Que no se lo pueda elegir como objetivo de un ataque
  (solo los que tienen vida, P305–P308).
  *Resultado:* no brilla al elegir objetivo y tocarlo dice «📦 X no tiene vida: no se lo puede atacar. Elegí otro.» (ataques y habilidades dirigidas,
  `sueltoNoAtacable`, js/13); no entra en un área, una onda, el Barrido, el Salto, la Carrera ni el Choque; no da ataque de oportunidad; en la lista de
  la ficha suelta no aparece; y `Duelo.crear` lo frena como última puerta. Excepción: el token viejo de un creep sin vincular, que el GM vincula al
  atacarlo si hay un creep con ese nombre. Probado con clics (arma, Mala sombra y Remolino).
- **✅ hecho (2026-11-26; dueño eligió (2)) — 🎁 Ver en detalle los dos 🎁 que no son ni «dar» ni botín (P309)** → «🆓 Permitir agregar gratis» y «💥 Efectos para un arma» (dueño, 2026-11-23: «ponelo al final de la cola para ver en
  detalle»): la casilla «🎁 Permitir agregar gratis» del generador de tiendas y los efectos de arma de la Guía de diseño. Mostrárselos al dueño
  con captura y proponer.

- **✅ hecho (2026-11-26) — 🪧 «Alguien clava un tótem…» si el creep está escondido (P311 decidida, b)** (dueño, 2026-11-23): la línea de la Mesa y la
  tarjeta de la Crónica al clavar un tótem o un estandarte no nombran al creep si está oculto o en sigilo; el GM lo sigue viendo.
  *Resultado:* si el creep está escondido para los jugadores (oculto por el GM, en sigilo, adentro de una nube), la Mesa y la Crónica salen dos
  veces: con el nombre, solo para el GM (y para quien lo esté viendo), y «Alguien clava un tótem de silencio…» / «Alguien clava un estandarte de
  guerra…» para los demás. La línea ⚡ de la habilidad también lo nombraba: ahora la leen solo los que lo ven (los demás ya leen «Alguien
  clava…»). Con el creep a la vista, todo como antes, con el nombre para todos. Es el mismo mecanismo de lo escondido en un duelo o una zona
  (vtt-hexgrid/js/130 y js/29), con su otra cara para la Mesa (`sinoculta-…`, como `sinEscondido` de la Crónica). Probado con clics en
  «Prueba · General» (GM y Jugador 1): el tótem con el creep oculto, el estandarte con el creep en sigilo y el tótem con el creep a la vista.
  La pantalla del GM que lo clava no lo pone en su propia Crónica (como siempre: ya lo ve en el aviso y en la Mesa).
- **✅ hecho (2026-11-26) — ⚖ Probar: el sobrepeso al sacar del baúl y al comprar en la tienda** (2026-11-23, de la tarea del sobrepeso con la mochila, P312):
  con la tienda abierta, sacar del 📦 baúl con la mochila llena (tiene que preguntar «Sacar igual» con la cuenta) y comprar algo que te deje con
  sobrepeso (cartel «⚖ Tenés sobrepeso» en el mapa y en la ficha). No se probó con clics: hacía falta abrir una tienda.
  *Resultado:* probado con clics en «Prueba · General» de «Claude · pruebas 2» (GM con el generador de tiendas: publicó y abrió la tienda; Jugador 1
  con el mapa y la ficha suelta abiertos a la vez). Blanco J1 (Fuerza 6, Carga máxima 6, equipo que pesa 1) con la mochila en 25 de 20. Todo anduvo
  bien, sin errores: (1) guardó un Garfio en el baúl y al sacarlo (24 de 20) salió «🎒 Mochila llena» con la cuenta («tu mochila queda pasada (25 de
  20)… tu equipo pesa 1 + 5 ranuras de más = 6; tu Carga máxima es 6») y «📦 Sacar igual» / «Volver»; con «Sacar igual» llegó a la mochila.
  (2) Comprando en la tienda del mapa: «⚖ Blanco J1: tenés sobrepeso» (te pasás por 1, la cuenta y todo lo que implica, con la Iniciativa −1) solo
  en el mapa; la ficha suelta mostró el estado Sobrepeso sin cartel; el ⚖ apareció alrededor del token, visto desde el Jugador 1 y desde el GM.
  Comprando en la tienda de la ficha: «⚖ Tu sobrepeso subió (1 → 2)» solo en la ficha. (3) Vendiendo en la ficha: «⚖ Tu sobrepeso bajó (2 → 1)»
  solo en la ficha; vendiendo en el mapa: «⚖ Blanco J1: ya no tenés sobrepeso» (antes, ahora y lo que recupera) solo en el mapa, y el ⚖ se fue
  del token. El GM no recibió ningún cartel. Al terminar: tienda cerrada y retirada (y su stock borrado; el borrador del generador quedó igual),
  baúl vacío y sin las dos líneas de su registro, la vuelta «quedó igual» (la plata y la mochila de Blanco J1, como estaban). Quedan en la Mesa
  las líneas de la compra y del baúl.

- **✅ hecho (evaluado 2026-11-26; el dueño eligió B de cerca y A de lejos, programado el mismo día) — 🔘 Evaluar qué pasa cuando hay más estados que lugares alrededor del token** (dueño, 2026-11-23: «evaluar qué pasa cuando hay
  más estados que los slots disponibles alrededor de un token para poner los iconitos»). Ver cuántos entran hoy, qué pasa con los que sobran
  (¿se pisan, se cortan, hay un «+N»?) y proponerle al dueño cómo mostrarlos, con capturas.
  *Evaluado (2026-11-26, sin tocar código; capturas en «Claude · pruebas 2», mapa «Prueba · General», y después la vuelta: «quedó igual»):* hoy entran
  **12** (6 vértices y 6 lados, en orden de llegada); desde el 13 el último lugar es un «+N» gris con la lista en su globo. Con 3 estados se ve bien.
  Con 12, el anillo tapa la cara del token y, con el zoom normal, cada circulito mide unos 13 píxeles (se adivina más de lo que se lee); con el mapa
  alejado se pisan entre ellos y con los tokens de al lado; las barras de vida bajan y quedan encima de los iconitos del token de abajo. El «+N» esconde
  los últimos que llegaron sin mirar cuáles importan (al Warrior con 16 le escondió sus 4 buffs) y el gris no dice si son buenos o malos; el ✋ va
  siempre al final, así que es lo primero que se esconde. Opciones (detalle y recomendación en **P350**): (a) prioridad y un «+N» con dos colores;
  (b) **agrupar por familia cuando no entran**, hasta 6 con un numerito (💫4) — la recomendada; (c) una segunda corona más chica. En las tres, con el
  mapa alejado mostrar menos. *Elegida y programada (2026-11-26):* ver «🔘 Iconitos de estado: agrupar por familia…» más abajo.

- **✅ hecho (2026-11-23) — 🔘 El globo de los iconitos de estado dice solo el efecto; el detalle, en la ventana de estados alterados** (dueño,
  2026-11-23: «al poner el hover en el icono, que solamente diga sobrepeso: número, y en qué consiste… solamente el efecto. Si después querés ver el
  detalle… apretando el icono de estados alterados… ahí puedas ver el detalle de cada estado: cuál es el origen, por qué, quién es el caster»; «en los
  estados alterados que tengan duración, sí tienen que aparecer [los turnos que quedan] en el hover del icono»).
  *Resultado:* pasar el mouse por UN iconito de alrededor del token ahora muestra solo ese estado: «Sobrepeso 2 — Evasión −2 (o 1 No2) · Iniciativa −2 ·
  Parry/escudo/dodge +1 No2»; «Quemadura · quedan 3 turnos — −2 vida por turno (le resta su Res. fuego)»; «Miedo · quedan 2 turnos — Acercarse a quien
  lo asustó cuesta el doble de No2 · −2 PdG y −2 daño contra él». El «+N» lista los que no entraron. **El globo del token entero** (pasar el mouse por el
  token, no por un iconito) cambió igual: un renglón por estado con lo mismo, sin las descripciones largas. **La ventana ◎ Estados alterados** suma, debajo
  de cada estado, lo que hace en corto con los turnos, la descripción entera y de dónde viene: la cuenta del sobrepeso («el equipo pesa 5 + 3 ranuras de
  más en la mochila = 8; la Carga máxima es 6 → se pasa por 2»), de qué pasiva o pieza viene, a quién protege o marcó, de quién tiene miedo, quién lo
  provocó, quién le pegó la Sanguijuela o le puso un Escudo elemental. Un creep escondido sale como «alguien que no se ve» para los jugadores (el GM lo
  ve). **Lo que no existe hoy:** quién puso cada estado y con qué (un Veneno, una Quemadura de un creep): pregunta nueva P314. La pieza común:
  `comun/estado-corto.js`. Probado con clics en «Claude · pruebas 2» (GM, Jugador 1 y Jugador 2): Blanco J1 con sobrepeso 2 (el Peto del gigante y 22
  agujas que pasan la mochila), Quemadura de 3 turnos y Miedo a un creep; el mouse sobre cada iconito y sobre el token, y la ventana ◎ desde las tres
  pantallas; con el creep escondido, el Jugador 2 ve «alguien que no se ve». Todo volvió a como estaba. Pruebas automáticas 1070/1070.
  **Ajuste (2026-11-23, dueño, con captura):** el corto nunca pierde el número — «Regeneración · Cura 2 de vida cada turno», «Veneno: 3 · −3 de vida al
  empezar el turno» (la ficha, GM Tools y el mapa publican ahora la vida por turno, los stacks y los números de cada estado); el Sobrepeso con su
  formato, también en el globo del token: «Sobrepeso: 1 · −1 a Evasión, salvo que pague 1 No2 · Parry/escudo/dodge roll +1 No2 · −1 a Iniciativa»; y al
  pie de los dos globos: «Para ver el detalle de cada estado (de dónde viene, quién lo puso, la cuenta), tocá el token y su botón ◎ Estados alterados (o
  la tecla E)» (el ◎ está en el anillo de cualquier token que se ve, también un creep para un jugador). Probado con clics desde el GM, el Jugador 1 y el
  Jugador 2 (Regeneración de 2, Veneno ×3, Rengo y sobrepeso 1; la E del Jugador 2 sobre el token del Jugador 1); todo volvió a como estaba. 1070/1070.
- **✅ hecho (2026-11-26) — Probar: 🔘 los estados puestos de verdad por un creep, con su habilidad** (2026-11-23): en la prueba, la Quemadura y el Miedo se le
  mandaron a Blanco J1 por el mismo aviso que usan las habilidades de creep (sin pasar por el duelo). Falta verlo con un creep usando su habilidad en
  un duelo, el «+N» con más de 12 estados, un creep visto por un jugador (sin el escudo) y una invocación.
  **Lo que se vio** (mapa «Prueba · General», GM con las Acciones del creep y J1 desde su pantalla; el «+N» ya no existe desde la P350, se miró el agrupado):
  (1) En duelos de verdad le pusieron a Blanco J1: el Mago · Piromante la **Quemadura** (Lengua de fuego), el Debuffer · Maldito la **Coraza maldita**
  y el **Punto débil** (con la Herida sombría del daño siniestro), el Tanque · Escudero el **Provocado** (y él quedó Desafiante), el Liviano · Sangrador
  el **Sangrado** y el Warrior · Hachero la **Armadura rota**. Todos quedaron bien en la ficha y cada uno apareció en su vértice. El Punto débil se notó
  en el duelo siguiente (bajó el rango del crítico). La Quemadura y el Sangrado sacan 2 de vida apenas entran: es la regla (`dispararAlAplicar`).
  (2) Con 10 estados (6 por habilidades y 4 a mano: Miedo, Silencio, Parálisis, Ceguera): **de cerca**, 3 circulitos con numerito (⚡5 control, 🔥2
  daño, 💢3 marcas) y su globo con los 5 de la familia; **de lejos**, Parálisis, Miedo y Provocado y la pastilla roja «+7», con su globo. Igual en la
  pantalla del GM y en la de J1. La Armadura rota de un personaje no tiene iconito (viene de su equipo): pregunta **P352**.
  (3) El Escudero (Desafiante y Piel de hierro por sus habilidades; Miedo, Veneno severo y Escudo especial a mano) visto por J1: los 5 iconitos y los
  globos, sin los números del escudo (el GM ve «Escudo 5/5», J1 no) ni la vida del creep; la ventana ◎ tampoco los muestra.
  (4) La Abeja de prueba recibió la Quemadura de la Lengua de fuego del Piromante (J1 se defendió desde su pantalla): quedó junto a su 🪶 Vuela.
  **Error encontrado y arreglado**: con la Botella con un diablito del Piromante, la pantalla del jugador golpeado decía «te va a entrar 6» y le
  entraban 8 (la del GM sí sumaba la Botella; el daño que se aplicaba era el bueno). Ahora la Botella va en lo público del creep
  (`CreepCalculo.tarjetaPublica` → `botella`, `talismanDe` de js/53) y las dos pantallas dan la misma cuenta (probado con la Abeja: 3 + 2 = 5 en las dos).


- **✅ hecho (2026-11-26) — 🎲 Al cargar el mapa (o con F5) a veces se ven muchas tiradas de dados animadas juntas** (dueño, 2026-11-23: «a veces cuando
  aprieto F5 o cargo el mapa por primera vez aparece la animación de muchas tiradas de dados, juntas. Asumo que será la acumulación de tiradas
  que se hacen durante los testeos en el mapa»). **Causa**: en el mapa de un **jugador** la Mesa espera a que lleguen los tokens para saber qué
  puede ver (vtt-hexgrid/js/29 `mesaFiltrar` devuelve la lista vacía hasta entonces); la primera carga se dibujaba vacía y, un segundo después,
  las 30 tiradas que ya estaban aparecían «nuevas» y se animaban todas juntas (también podían soltar el destello del ojo del GM de una línea vieja y
  cerrar el giro libre). Al GM, a la ficha y a GM Tools no les pasaba (medido: 0 animaciones al cargar; el mapa del Jugador 1, 30 llamadas, 10 con
  dados). **Arreglo**: pieza común nueva `comun/mesa-nuevas.js` (`MesaNuevas`): «nueva» se decide con lo que trae Firebase ANTES del filtro de cada
  pantalla — lo de la primera carga (y lo que venga de la copia local, `fromCache`) es viejo; una que entra «por abajo» al borrarse otra, también;
  lo nuevo que el filtro escondió un rato sigue siendo nuevo hasta mostrarse (15 s como mucho). La usa `comun/mesa.js` (mapa, ficha y GM Tools) para
  animar, resaltar y avisar. Probado con clics en «Prueba · General» (GM y Jugador 1): antes, F5 del Jugador 1 = 30 animaciones; después, 0 al
  cargar y con F5 (los dos); una tirada nueva de uno se anima en las dos pantallas (las dos direcciones) y el crítico de un duelo (los 3 d20) también.
  7 pruebas automáticas nuevas («una tirada vieja no se anima»). Sin probar: la copia local de Firebase en una red lenta (no se pudo forzar).

- **✅ hecho (2026-11-26) — ❤ «Vida extra»: descripción corta y con el origen** (dueño, 2026-11-23, con captura de la ventana ◎ Estados alterados): «la
  explicación de vida extra está innecesariamente larga. Se entiende bastante solo con el nombre, aunque está bueno que diga algo como "vida por
  encima de tu máximo", y que diga el origen (normalmente solo se va a permitir en casos particulares, lo dará algún ítem o algún skill, así que
  debería mencionar eso, o si se carga a mano, que diga "cargado a mano")». Acortar la descripción a algo como «Vida por encima de tu máximo» y
  mostrar de dónde viene (el ítem / la habilidad, o «cargado a mano»).
  **Hecho:** en la ventana ◎, en el globo del iconito y en el globo del token dice solo «+25 de vida por encima de tu máximo» (sin la explicación
  larga), y en ◎, abajo, de dónde viene: «Viene de Relicario de sangre.», «Cargado a mano.» (la que se carga desde la vida o con «+ Estado») o, si
  se juntaron, «Viene de Relicario de sangre (y una parte, cargada a mano).». La Vida extra ahora guarda su origen en todas las fuentes que hay hoy:
  el Relicario de sangre, el Anillo de la siesta, la Sanguijuela, Drenar vida y lo que drena, las habilidades y consumibles que la dan (de personajes,
  invocaciones y creeps). Una que ya estaba guardada de antes dice «Cargado a mano». Probado en «Claude · pruebas 2», mapa «Prueba · General»: J1 con el
  Relicario tomó una Poción de HP con la vida llena → «Vida extra +25 · Viene de Relicario de sangre» (lo ve él, J2 y el GM); J2 se cargó +10 desde
  su vida → «Cargado a mano» (lo ve él, J1 y el GM); J1 sumó +5 a mano encima → «Viene de Relicario de sangre (y una parte, cargada a mano)».
  1160 pruebas en verde; la vuelta dijo «quedó igual». Pregunta nueva: P353 («tu máximo» o «su máximo» cuando es de otro).
- **✅ hecho (2026-11-26) — 📜 Ventana ◎ Estados alterados: poder leer la descripción entera cuando no entra** (dueño, 2026-11-23: «en el caso de que una
  descripción de un estado no entre en el recuadro, debería haber alguna forma de poder leer el texto completo. En este caso no tengo cómo saber
  cómo termina ese texto»). Hoy se corta con «…» (p. ej. la de Vida extra). Que se pueda desplegar o ver completa.
  **Hecho:** el texto se cortaba porque lo que se publica de cada estado llega hasta 300 letras. Ahora (1) si es un estado de la lista común (Miedo,
  Malviaje de floripondio, Escudo eléctrico…), la ventana ◎ lo muestra entero desde la lista, sin «…» y sin tocar nada; (2) si es uno propio (de una
  habilidad o cargado a mano), sigue con «…» y al lado **«ver entera»**: un clic y aparece el texto completo guardado en la ficha (la puede leer
  cualquiera de la partida); queda abierto mientras dure la ventana. Los creeps no tienen el problema: los jugadores no ven su descripción y el GM la ve
  entera. Es solo del mapa: la ficha y GM Tools muestran los estados en su propia lista, con el texto completo (globo y «Ver el detalle»).
  `EstadoCorto.detalle` (`cortada`) y `EstadoCorto.entera` (comun/estado-corto.js), `hudEstadoDescHtml` / `hudEstadoEntera` (vtt-hexgrid/js/10).
  Probado con clics en «Prueba · General» (J1, J2 y GM): un estado propio de 470 letras («ver entera» → completo) y el Malviaje de floripondio (entero
  de entrada). Capturas `cola130/20-*` y `21-*`.

- **⬜ en cola (más adelante) — 🧑 Que el personaje de un jugador diga qué clase / rol es** (dueño, 2026-11-24, de la pregunta 4 de las etiquetas):
  hoy no lo dice en ningún lado; hace falta para abrir «+ Pasiva» con su rol ya marcado (y quizás para otras cosas).

- **✅ hecho (2026-11-26) — Probar: 🏷 «+ Pasiva» de una invocación y subir una pasiva con etiquetas de verdad** (2026-11-24, de las etiquetas de las pasivas):
  con clics se probó «+ Pasiva» en la ficha, en un creep de GM Tools (con su rol marcado) y en el asistente de personaje nuevo, y la ventana de
  «Subir a la biblioteca» con los botoncitos (sin subir). Falta ver «+ Pasiva» de una invocación y subir una pasiva de verdad (y borrarla después)
  para ver que la Biblioteca la muestre filtrable con sus etiquetas.
  **Hecho**, con clics en «Claude · pruebas 2» (Jugador 1, su ficha y su Abeja de prueba):
  (1) **🐞 Error encontrado y arreglado:** el «+ Pasiva» de la invocación (está en «✎ Editar» → paso 6, Pasivas) abría la ventana de la Biblioteca
  **detrás** del editor de la invocación: se veía oscurecida y no se podía tocar. Ahora se abre encima (`abrirPasivaNuevaInv`, js/04, `z: 99600`, como
  las trampas preconstruidas). Con eso: las tres filas (Rol, Estilo, Función), «☑ sumar las de 🌐 Cualquiera» tildado y «Mostrando 47 de 47»; Support
  → 22, sin Cualquiera → 7, + Distancia + Recursos → 2; «✕ Limpiar filtros» y el buscador andan. Se le sumó Callo de batalla, se guardó, se le sacó
  con la × y se volvió a guardar (quedó solo con Vuela). Capturas `cola132/01` a `09` (la del error, `02`; arreglado, `03`).
  (2) **Subida de verdad:** se creó en la ficha «Prueba de etiquetas (borrar)» (+1 Percepción); «⬆ Subir» abrió con «Percepción» ya marcada (la
  sugerida por lo que suma) y se marcaron 🏹 Shooter y 🎯 Distancia con los botoncitos; subió («ya lo pueden usar todos»). En la Biblioteca apareció
  (48 de 48, «🔶 sin auditar», «🏹 Shooter · 🎯 Distancia · Percepción · de Jugador 1») y se la encuentra filtrando Shooter sin Cualquiera (13),
  + Distancia (13) y + Percepción (4); con Tanque sin Cualquiera, Cuerpo a cuerpo o Sigilo no aparece. Se borró con el botón «Borrar» de la
  Biblioteca (el autor puede borrar lo suyo sin auditar): el documento ya no existe en la base y la lista volvió a 47. Se sacó la pasiva de la ficha
  (Editar → Eliminar). Capturas `cola132/10` a `18`. Duda nueva: P358 («Limpiar filtros» no vuelve a tildar «sumar las de Cualquiera»).
  `restaurar.js`: «quedó igual». Pruebas: 1163 en verde.

- **✅ hecho (2026-11-27) — 🏷 Responder P315: ¿el asistente de personaje nuevo marca la clase elegida en el filtro de pasivas?** (dueño, 2026-11-24: «anotá
  las nuevas preguntas en la cola»; decidida el 2026-11-27, la recomendación). En el paso «Pasivas» del asistente, el filtro abre con el rol de la
  clase elegida en «Idea» ya marcado (Tanque → 🛡 Tanque); se saca con un clic y, si se vuelve a «Pasivas» sin cambiar la clase, queda como se dejó.
  Si se cambia la clase, se cambia ese rol (los demás botoncitos quedan). Clase «Otra» o ninguna: sin rol. `comun/asistente-personaje.js`
  (`rolDeLaClase`) y `FiltroPasivas.rolDeClase` (`comun/pasivas.js`). **Probado con clics** (Jugador 1, sin crear el personaje: se canceló): Tanque →
  «Mostrando 24 de 47» con Tanque marcado; un clic lo saca (47 de 47) y al volver de Talentos sigue sacado; cambiando a Mago abre con Mago (23 de 47).
  Capturas `cola133/10` a `13`.
- **✅ hecho (2026-11-27) — 🏷 Responder P316: ¿el «✎ Etiquetas» de la biblioteca usa los mismos botoncitos en vez de texto libre?** (dueño, 2026-11-24;
  decidida el 2026-11-27, la recomendación). «✎ Etiquetas» (solo el dueño del proyecto) abre una ventana con los mismos botoncitos que «⬆ Subir»: en
  las pasivas, cada familia (Rol, Estilo, Función) en su renglón, con su rótulo, arrancando con las que ya tiene marcadas; abajo el campo de texto
  (las etiquetas sueltas, como «racial», se conservan ahí). Las demás bibliotecas (creeps, trampas…) usan los menús por grupo, como al subir.
  Cancelar no cambia nada. `comun/biblioteca.js` (`editarEtiquetas`, `pintarTags` compartido con «Subir»). **Probado con clics** (cuenta del GM, que
  es la del dueño): se subió «Prueba de etiquetas (borrar)» con Tanque, Cuerpo a cuerpo y Defensa; «✎ Etiquetas» abrió con esas tres marcadas; se
  cambió a Warrior + Cuerpo a cuerpo + Defensa + Aguante y se guardó: la fila y el filtro lo toman (aparece con Warrior, no con Shooter); se borró
  con «Borrar» y en la base quedó solo la corrección de Regeneración, **sin tocar** (sigue sin etiquetas: ponérselas, cuando el dueño diga).
  Capturas `cola133/04` a `09`.

- **✅ hecho (2026-11-27; dueño eligió (a)) — 📒 Revisar qué es el «catálogo propio» de un personaje («+ Ítem al catálogo» de la ficha)** → se sacó el botón «+ Ítem al catálogo» de la ficha (`ficha.html`): para crear un ítem, el «+ Ítem» de la mochila; para compartirlo, «⬆ Subir al catálogo». Lo que alguien ya guardó en su catálogo propio sigue viéndose (y se puede editar o borrar) hasta que lo borre. Con eso tampoco se puede guardar ahí un consumible a mano (P317). Pruebas 1167 en verde. (dueño, 2026-11-24: «no sé a qué te
  referís con el catálogo propio del personaje… revisar qué es eso y después revisar también el caso particular»). Explicarle al dueño qué es,
  para qué sirve y quién lo ve (con captura); después, el caso particular: hoy deja guardar ahí un consumible «a mano» (P317: esos no van al
  catálogo compartido). Decidir con el dueño si también se saca de ahí.

- **✅ hecho (2026-11-27) — Probar: 🎲 el consumible a mano con tirada desde el cinturón y armado en GM Tools** (2026-11-24, del consumible con tirada): con clics se
  probó crearlo en la ficha y consumirlo de la mochila (ficha y Botonera del mapa). Falta: pasarlo al cinturón y consumirlo de ahí, y armarlo en GM Tools
  («✎ Ítem custom» → 🤝 Dar a un jugador) con su tirada y que al jugador le llegue y le tire al consumirlo.
  *Resultado:* en «Claude · pruebas 2», con clics. **Cinturón:** el Jugador 1 creó en su ficha «Brebaje de prueba» (consumible, 2 unidades, 🎲 1d6;
  el asistente no ofrece ⬆ Subir, P317) y lo pasó con «→ Cinturón» (pasa de a una y conserva la tirada). Consumido del cinturón en la ficha: 1d6 = 1
  en la Mesa junto al «✋ a mano», −1 No2, se fue del cinturón; la otra unidad, al cinturón y consumida desde la Botonera del mapa: 1d6 = 3, −1 No2.
  **GM Tools:** se encontró un tropiezo: en «✎ Ítem custom», con un consumible, «Crear y equipar» solo avisaba «dáselo con 🤝 Dar a un jugador» y no
  pasaba nada más (el ítem armado quedaba ahí; había que volver a armarlo en 🤝 Dar → ✎ Ítem nuevo). **Arreglado:** ahora «Crear y equipar» con un
  consumible cierra el asistente y abre 🤝 Dar a un jugador con el consumible ya en la lista, con sus unidades y su tirada (P284 (1): «avisa y deja
  dárselo a un jugador»). Probado: el GM armó «Elixir del GM de prueba» (2 unidades, 🎲 2d4+1), se abrió Dar con «Elixir ×2», marcó a Blanco J1 y
  dio; a J1 le saltó el cartel «El GM te dio algo» y le entró a la mochila con la tirada (el Ver dice «🎲 al consumirlo: 2d4+1»). Consumido en la
  ficha (2d4+1 = 5, −2 No2) y en la Botonera del mapa (2d4+1 = 9, −2 No2); la Mesa del GM ve las dos. `comun/dar-jugador.js` (`itemN`),
  `gm-toolset/js/04` y `05`. Pruebas 1167 en verde. `restaurar.js`: «quedó igual». Capturas `cola134/`. Lo que quedó: la entrada de abajo.

- **✅ hecho (2026-11-24, con permiso del dueño) — Probar: 🕊️ «Registro nuevo» se lleva los mensajes de antes del combate anterior** (2026-11-24, de los ajustes de los mensajes): no se
  probó porque borra de verdad, en «Claude · pruebas 2», las tiradas, el 📜 historial y los mensajes de antes del combate anterior. Probarlo cuando el
  dueño diga (o en una partida descartable): que se vayan los mensajes viejos (secretos y 📣) y queden los del combate anterior y el actual.
  *Resultado:* en «Claude · pruebas 2»: mensajes A (secreto y 📣) → 🆕 Registro nuevo (A queda: pasa a ser «el combate anterior») → mensajes B →
  🆕 Registro nuevo otra vez: A se fue (de la Mesa, de las conversaciones y de Firebase) y B quedó, para el Jugador 1 y el Jugador 2. Se borró además
  el registro viejo de esa partida (tiradas e historial de antes).
- **✅ hecho (2026-11-24) — 🕊️ P318.2 y P318.4: la Crónica con el mensaje entero y `/r` con nombre** (dueño, 2026-11-24: «en la crónica se debería poder
  leer el mensaje directamente»; «habría que corregirlo»). *Resultado:* la tarjeta de la Crónica ya no corta el texto (un mensaje de 418 letras se lee
  entero; si es muy largo, se desplaza adentro de la tarjeta); el aviso flotante sigue. `/r Blanco J2 recibido, vamos` le llegó al Jugador 2 como
  «recibido, vamos» (sin el nombre): si después de `/r` viene el nombre de alguien de la partida, se le responde a esa persona; si no, al último
  que te escribió. Probado con clics en «Claude · pruebas 2».
- **✅ respondida (dueño, 2026-11-24; aplicada la parte que cambiaba, arriba) — 🕊️ Responder P318: los ajustes de los mensajes** (2026-11-24): lo público que vive en la Mesa (se borra como las tiradas), Crónica +
  aviso en el mapa, el «leído» de lo público por navegador, `/r`, lo mío en la Mesa, el aviso de 7 s. Ver `docs/preguntas-abiertas.md`.
- **⬜ en cola (propuesta aprobada por el dueño el 2026-11-24, ver P318) — 🕊️ Varias conversaciones a la vez: programar** — (a) un mensaje a varios
  arma un chat de grupo de verdad (nombre opcional; las respuestas les llegan a todos); (b) la lista en tres partes: 📣 Todo el grupo · 👥 chats
  de grupo · 🔒 de a dos, cada una con su numerito; (c) archivar (cada uno para sí, hasta que llegue algo nuevo; «▸ Archivadas»); (d) **un
  jugador puede borrar lo suyo** (dueño: «diría que sí»); el GM sigue pudiendo borrar todo; no se puede salir de un chat de grupo por ahora.
  Pedido original: (dueño, 2026-11-24: «no sé bien cómo se gestiona ahora el hecho de tener
  más de una conversación abierta. Y si un jugador inicia una conversación con otros 2 jugadores, eso se genera como si fuera un chat grupal. Entonces
  habría que encontrar alguna forma de gestionar conversaciones simultáneas, cómo pasar de una a otra, cómo se cierran, cómo se borran, etc.»).
  *Cómo está hoy:* un mensaje a dos jugadores NO es un chat grupal: se guarda uno solo, pero cada uno lo ve en su conversación de a dos con quien lo
  mandó («También para: …») y, si responde, le contesta solo a él. La ventana de la paloma tiene a la izquierda «📣 Todo el grupo» y una
  conversación por persona (la más reciente arriba, con su numerito); se pasa de una a otra con un clic. No se cierran ni se archivan, y un jugador
  no puede borrar nada: solo el GM borra todo junto (🗑 / Registro nuevo), sin leerlos.
  *Propuesta (a decidir, sin programar):* (a) **chats de grupo de verdad**: un mensaje a varios abre una conversación con todos ellos («Jugador 1,
  Jugador 2 y vos»), y las respuestas les llegan a todos los del chat; se le puede poner nombre («Los del plan»). (b) La lista de la paloma con tres
  partes: 📣 Todo el grupo · chats de grupo · de a dos, cada una con su numerito y una línea con lo último. (c) **Archivar** (cada uno, para sí): la
  conversación se esconde de la lista hasta que llegue algo nuevo; abajo, «Ver archivadas». (d) **Borrar**: un jugador borra solo lo que mandó él
  (o nada, y queda el 🗑 del GM); el GM sigue borrando todo sin leer. Boceto:
  `🕊️ Mensajes  [＋ Nuevo]` / `📣 Todo el grupo (2)` / `👥 Los del plan — J1, J2 y vos (1)` / `🔒 GM de pruebas` / `🔒 Jugador 1` / `▸ Archivadas (3)`.
  Preguntas: (1) ¿chat grupal de verdad para un mensaje a varios? (recomendación: sí); (2) ¿con nombre opcional? (sí, opcional); (3) ¿archivar
  en vez de cerrar? (sí: cerrar no tiene sentido si después llega algo); (4) ¿un jugador puede borrar lo suyo? (recomendación: no por ahora; alcanza
  con archivar y el 🗑 del GM); (5) ¿alguien se puede salir de un chat de grupo? (no por ahora).

- **⬜ en cola — 🔒 Revisar el email escrito en `docs/workflow-firebase.md`** (dueño, 2026-11-24: «esto no lo entiendo bien. Anotá en la cola
  revisarlo cuando le toque»): en un documento del repo (que es público) figura escrito un email de una cuenta de Gmail del proyecto. Explicarle
  al dueño qué es, para qué está ahí y si conviene sacarlo (el repo es público: no van emails).

- **⬜ en cola — 📖 El globo de «Probabilidad de Golpe» repite el nombre** (dueño, 2026-11-24, de la prueba del glosario): hoy el globo arranca
  con «Probabilidad de golpe.» (el texto está pensado para cuando la tarjeta dice «PdG»). Que quede algo como «Probabilidad de Golpe (PdG): …».
  Revisar si otras entradas del glosario (`comun/glosario.js`) tienen el mismo problema.

- **⬜ en cola — Probar: 🤐 el Silencio del Tótem en una invocación y con 🎮 el control** (2026-11-24): con clics se probó solo con el personaje del
  Jugador 1. Falta: una invocación que entra al aura (lo pone la pantalla de su dueño), un personaje que el GM maneja con 🎮 el control (lo pone la
  pantalla del GM, no la del jugador) y el Jugador 1 con el mapa abierto en dos pestañas (que no quede doble).

- **✅ hecho (2026-11-24) — 🙈 Los talismanes de quien lanza un área delatan al escondido** (2026-11-24, de la prueba del golpe que no lo delata; P320):
  cuando un área le pega a alguien que el bando que la lanzó no ve, lo que hacen los talismanes de quien la lanzó al aplicar el daño
  (`vtt-hexgrid/js/53-talismanes.js`, llamado desde `dueloAplicarDano`, js/13) va a la Mesa sin la marca del duelo oculto: la Botella con un
  diablito («+2… el diablito se ríe», y su cartel para aplicar la quemadura a quien la lleva), la Cabeza reducida / el Muñeco vudú («Fulano queda
  Maldito», **con el nombre del escondido**), y seguramente el Espejito, el Relicario, el Orbe salvaje y los anillos elementales (no probados).
  Visto con clics: el GM se enteró de que el Grito le pegó a alguien por la Botella, y del nombre por la Cabeza reducida. Arreglarlo depende de P320.
  **Hecho** (P320 decidida): mientras la pantalla del GM aplica lo de un golpe a un escondido (`vtt-hexgrid/js/130`, `areaOcultaCon`), todo lo que
  salta con el golpe va solo a su bando: las líneas de la Mesa (`comun/mesa.js` pregunta `mesaLineaMarca`), los momentos (`datos.escondido`, js/16)
  y, en la pantalla que no lo ve, ningún toast (js/01). Lo de quien lanzó el área le llega igual, sin decir contra quién ni por qué: el diablito
  («El diablito de la Botella se te ríe y te hace 2 de daño de fuego»), «un Espejito», el Relicario y la Cruz de plata con una línea neutra. El «se
  delató» se mira antes que los talismanes y va siempre a la vista; desde ahí, todo normal. También el Orbe del custodio / de resguardo y la Cruz
  de plata ahora corren en un duelo oculto (antes no pasaban). Pruebas automáticas: 1098 en verde. **Probado con clics** en «Claude · pruebas 2»
  (GM y Jugador 1, sin 👁): Control mental 4 con la Botella y una Cabeza reducida prestada, el Grito con un 1 en el daño contra Blanco J1 escondido
  → el GM no vio ni toast ni línea ni Crónica de J1; le salió solo el cartel neutro del diablito (y aplicó la quemadura); J1 vio su duelo, «+2 de la
  Botella», «Blanco J1 queda Maldito», 3 de daño, Maldito y Pánico, y siguió en Sigilo. Control: Nova arcana de 9 → se delató y la Cabeza reducida
  salió a la vista para todos, después del «se delató». Capturas en la carpeta de la prueba (cola87). Lo que no se probó con clics: Espejito,
  Relicario, Orbe salvaje, anillos, Cruz de plata (solo pruebas automáticas y lectura de código).

- **⬜ en cola (revisar más tarde) — 😈 El aviso del diablito de la Botella contra un escondido, con una mini explicación y al final del turno**
  (dueño, 2026-11-24, sobre P320): «si aparece ese mensaje así sin nadie, va a ser confuso, porque va a parecer que es un error. Entonces, que
  aparezca una mini explicación: había alguien oculto, te hizo esta tirada a escondidas, sacaste uno y el diablito te hace daño. Pero que lo
  diga de última, al final del turno». Revisar también los otros talismanes que quedaron con texto «sin nombre» (Espejito, Relicario, Cruz de
  plata, Orbe salvaje) por si conviene lo mismo.

- **⬜ en cola (revisar con tiempo) — ⏱ Responder P321: ¿los 40 s del duelo de un escondido esperan mientras el jugador resuelve otro duelo?**
  (dueño, 2026-11-24: «ponela al final de la cola para revisarla con tiempo»). Recomendación: sí, y que pasados 2–3 minutos se resuelva solo igual.

- **⬜ en cola — Probar: 👁 Revelar lo oculto con una invocación en Sigilo, con un personaje adentro de una nube y con un área tirada con el ojo
  ya prendido** (2026-11-24): por código, la invocación y la nube se marcan igual que el personaje en Sigilo (contorno rojo y 👁); el área con el
  ojo prendido va como duelo normal (P322). No se probaron con clics.

- **⬜ en cola — 👁 «Revelar lo oculto» es solo para mirar (P322 decidida)** (dueño, 2026-11-24: «tenés razón»): con el ojo prendido, un área de
  un creep le pega al escondido como un duelo común (no como su duelo aparte) y el GM lo puede elegir de objetivo. Que el ojo no cambie nada del
  juego: el escondido sigue con su duelo aparte y no se lo puede elegir de objetivo por estar revelado (como ya se decidió con las trampas).

- **⬜ en cola — 🕊️ En los mensajes, «Personaje (usuario)» en vez del usuario solo** (dueño, 2026-11-24, con captura del chat «Todo el grupo»):
  donde hoy dice el nombre del usuario (p. ej. arriba de cada mensaje del grupo, y en la lista de conversaciones), que aparezca primero el nombre
  de su personaje y entre paréntesis el del usuario: «Bizzante (copia) (Saulo.eche)». Si tiene más de un personaje, el principal (caso muy
  excepcional; «es una tarea pendiente revisar ciertas gestiones para usuarios con más de un personaje… cuando llegue el turno lo revisamos todo
  junto»). Si es el GM: «GM (nombre de usuario)». Igual que el «Larry (ElSaulo)» de las sugerencias de /m.

- **⬜ en cola — Probar: 🥷 el aviso «Seguís escondido» con una zona, una trampa y un creep escondido** (2026-11-24): con clics se probó solo un
  área (la Nova arcana) contra un personaje. Falta: una zona que pega poco (al entrar y en el Mantenimiento), una trampa, un creep escondido (el
  cartel le tiene que salir al GM) y un personaje con 🎮 el control del GM (le sale al GM, no al jugador).

- **⬜ en cola — 📺 El cartel de la trampa tapa la tele del Portal cósmico** (visto probando la tele, 2026-11-24): en la pantalla de la víctima (y en
  la de quien la maneja: el GM con un creep) el cartel de la trampa queda abierto en el medio mientras el portal se lo lleva, y tapa la casilla de
  donde sale: ahí se ve solo la llegada. La de un tercero lo ve entero. Propuesta: apartar el cartel (como se aparta el cuadro del duelo) mientras
  dura la tele, y quizás también centrar la vista. Además, la tele arranca 3 a 6 s después de elegir el destino (lo que tardan los avisos entre
  pantallas, más en el caso «portal-mover»): ver si se puede acortar.
  **Dueño (2026-11-24):** «se tendrían que minimizar los menús, enfocar en los tokens durante la animación, y después volver a abrir el menú». Y
  el mínimo 11 del Portal (Rara) contra la Res.CC de un nivel 1: «es una trampa rara, y entiendo que cara, así que está bien».

- **⬜ en cola — 🌀 Ajustes del Portal cósmico** (dueño, 2026-11-24, después de probarlo él en «Claude · pruebas»):
  1. **La dificultad es una tirada, no un número fijo:** hoy la Res.CC de la víctima va contra el Ef.Esp de quien puso la trampa como valor fijo
     (el Mago del rayo, 20). Quien la puso también tira su Ef.Esp, y si saca menos que el mínimo de la calidad (Rara 11), vale el mínimo.
     (Revisar si las otras trampas mágicas compradas con «contra el Ef.Esp de quien la puso», P218, tienen que ir igual: preguntarle.)
  2. **Al elegir el destino, mostrar el área de casillas disponibles** (las que están a la distancia permitida y libres).
  3. **La tele no se ve por los menús** (lo vio él): durante la animación, minimizar los menús y enfocar los tokens, y después volver a abrirlos
     (ver también la entrada «📺 El cartel de la trampa tapa la tele del Portal cósmico»).
  4. **Rango: máximo 5 casillas desde el punto de origen** (hoy 8). Actualizar el texto de la trampa en el catálogo.
  El escenario de prueba sigue puesto en «Claude · pruebas» (mapa «Prueba · Tormenta y Meteoro»): sacarlo cuando el dueño diga, o usarlo para probar esto.

- **⬜ en cola — 🌀 Los pulsos del portal, solo para quien ve al token; con «reducir movimiento», un destello corto (P323 decidida)** (dueño,
  2026-11-24): hoy los pulsos violeta y azul del portal le aparecen al GM aunque no vea al token que pasa (delatan que alguien lo usó y hacia dónde).
  Que se vean solo en las pantallas que ven al token (el portal en sí se sigue viendo). Con «reducir movimiento», un destello corto sin ondas.

- **⬜ en cola — 🦶 Un escondido que se mueve fuera de su turno: aviso en la Mesa, sin decir dónde** (dueño, 2026-11-24): «hoy si un jugador
  escondido usa "movimiento libre", el juego lo botonea. Si un jugador mueve su token fuera de su turno, también debe aparecer un mensaje en la
  mesa. No importa que se "revele" que hay un jugador escondido, porque el GM siempre sabe que hay un jugador escondido; no debe saber dónde… a
  diferencia de los jugadores, que quizás no tienen por qué saber cuántos creeps hay hasta que se revelan». Revisar qué pasa hoy (qué dice la
  Mesa, si se ve el rastro o la casilla) y que: un personaje escondido que se mueve fuera de su turno (o con movimiento libre) deje su línea en la
  Mesa, que el GM pueda leer con el nombre, pero sin casilla, rastro ni nada que diga dónde está. Un creep escondido no avisa a los jugadores.

- **⬜ en cola (revisar con tiempo) — 🩺 Responder P324: «Cómo quedó el grupo» muestra al escondido al GM con el ojo apagado** (dueño, 2026-11-24:
  «anotá lo anterior en la cola»). Recomendación: dejarlo así (sirve para acomodar estados de todo el grupo y no dice dónde está).

- **⬜ en cola — 👑 «Es el turno del GM» cuando los jugadores no saben de qué creep es el turno** (dueño, 2026-11-24): al iniciar el combate, es
  probable que los jugadores no vean muchos creeps en la lista de turnos (tras la niebla, u ocultos). Cuando le toca a uno que los jugadores no
  ven (sea por la niebla o porque está escondido; no tienen por qué saber cuál de los dos), el aviso de turno / la tabla tiene que decir **«Es el
  turno del GM»**. Si el creep ya está revelado en la tabla: «Es el turno de <creep>». Revisar qué muestra hoy (la tabla, el aviso de «le toca a…»,
  la Crónica) y ajustarlo.

- **⬜ en cola — 👑 El GM siempre ve a los jugadores en la tabla de turnos, aunque estén escondidos** (dueño, 2026-11-24): «el GM nunca deja de
  ver los nombres de los jugadores en la tabla, porque el GM sí sabe lo que está pasando. Esconderlos de la tabla de turnos es solamente creeps
  para jugadores». O sea: un personaje (o invocación) escondido sigue apareciendo con su nombre en el orden de turnos del GM, aunque el ojo esté
  apagado; lo que el GM no sabe es **dónde** está (token, casilla, rastro). Revisar y deshacer lo que hoy lo esconde de la tabla y de los textos
  del cambio de turno para el GM (la fila del orden, «↩ Volver a…», el cartel «Es el turno de…», «Queda 1 turno sin jugar (…)», las tarjetas
  de Iniciar combate / Demorar / Pasar de ronda, P263 y lo del 2026-11-24 en «escondido y ▶ Iniciar combate…»). Preguntarle antes, con ejemplos,
  qué más del escondido puede ver el GM (p. ej. lo de su inicio de turno: estados, vida) y qué no (dónde está, a quién le pegó si no se delató).
  Con esto P325 probablemente deja de hacer falta.
- **⬜ en cola (revisar en detalle con el dueño) — Responder P325: demorar cuando el que sigue es un escondido** (dueño, 2026-11-24: «ponela para
  revisar en la cola bien en detalle porque no la termino de entender»). Explicarla con un ejemplo paso a paso (quién juega, qué botón, qué pasa).
  Ver primero la entrada de arriba (el GM ve a los escondidos en la tabla), que quizás la resuelve sola.

- **⬜ en cola (investigar) — 👂 «Pasos a tu espalda» le salió al GM cuando el escondido se delató sin moverse** (visto el 2026-11-24, con el Muro
  de fuego: «Protector 4 oye pasos…»; dueño: «no lo entiendo bien, ponelo al final de la cola para investigarlo en su momento»). De paso, mirar
  por qué la Quemadura del Muro entró con 2 cargas y le sacó 2 de vida en el momento.

- **⬜ en cola — Probar: 😵 el Mareo de invocación que se va sin que la invocación juegue** (2026-11-24, ajustado por P327): con una invocación
  mareada, ✕ a la invocación en el orden (o Limpiar) → a los ~3 s se le va el mareo, con la línea en la Mesa; y con ⏭ Pasar de ronda o caída, cuando
  su turno pasa sin jugar. No se probó con clics (sí el caso normal y el de «saca más que su invocador»).

- **⬜ en cola — Probar: ➕ Sumar al orden a mano una invocación y un personaje con «🎲 Tirar su Iniciativa», y un token oculto** (2026-11-24, P291):
  con clics se probaron el tótem y el Cofre con el número escrito y Blanco creep tirando. Falta: una invocación (sin Mareo) y un personaje con
  sobrepeso (la fila lleva el «⚖−N»), y sumar o sacar un token oculto o un creep que los jugadores no vieron (sin línea en la Mesa, solo el aviso al GM).
  *Avance (2026-11-26, con la tarea de P301 b):* probado con clics **la invocación** (la Abeja de prueba 2 del Jugador 2, sacada con la ✕ y sumada con
  «🎲 Tirar su Iniciativa»: 1d4 = 1 a la Mesa, entró en su lugar y **sin Mareo**) y **el token oculto** (Blanco J3 escondido con 🙈, sacado con la ✕ y
  sumado con 21: ni la ✕ ni el ➕ dejaron línea en la Mesa —tampoco en la del Jugador 1—, solo el aviso al GM «(Los jugadores no lo ven: no va a la
  Mesa.)», y su fila no aparece en la tabla del Jugador 1). **Falta:** un personaje con sobrepeso tirando (la fila con el «⚖−N»).
- **⬜ en cola — Probar: 💍 el aviso del anillo antes de la oportunidad con un creep, con «Sí, atacar» y con la vigilancia** (2026-11-24, P266): con
  clics se probó solo el Jugador 1 arrastrando su token y el GM contestando «No». Falta: el GM moviendo un creep con una Apuntada o un anillo (el
  aviso en tercera persona), el rival que contesta «Sí, atacar» (el bono tiene que quedar perdido aunque no termine de moverse) y alejarse en la mira
  de alguien en vigilancia.

- **⬜ en cola (revisar con el dueño) — 👁 Alejarse en la mira de alguien en vigilancia, con un bono de «quieto» activo: ¿en qué orden?**
  (dueño, 2026-11-24: «habría que revisarlo, cuál sería el orden que tiene sentido… al final de la cola, para chequear»). Hoy (P266) primero sale
  «Si te movés, lo perdés» y después la reacción de quien vigila. Explicarle el caso paso a paso y decidir el orden antes de probarlo.

- **⬜ en cola (investigar a fondo) — ▶ El «Empieza tu turno» queda abierto después de terminar el combate, y al aplicarlo igual corre un inicio de
  turno** (visto el 2026-11-24 en la prueba de caídas; dueño: «investigar a fondo el origen de este posible error»): al Jugador 1 le quedó abierto el
  cartel después de que el GM vació el orden y pasó a narrativo; al tocar «Aplicar» se le aplicó igual (le bajó un turno a sus estados). Buscar el
  origen (¿el cartel no se entera de que el combate terminó / el orden se vació?), ver si pasa con otros carteles de turno (la tarjeta de la Crónica
  que queda «tirando» tras recargar, ya en la cola) y arreglarlo: que al terminar el combate se cierren solos y no apliquen nada.

- **⬜ en cola — Probar: 🩸 la vida de un creep no baja de 0 con una habilidad o un Flash que cuestan vida (P292)** (2026-11-24): GM Tools ya no
  deja la vida negativa por ningún camino; no se probó con clics una habilidad ni un Flash con costo en vida (de todos modos no dejan usarlos si
  no sobra vida), ni el mapa del GM mirando a un creep que estaba guardado en negativo antes de abrir GM Tools.

- **⬜ en cola — ❤ La vida de una invocación escrita a mano no baja de 0 (P329 decidida)** (dueño, 2026-11-24: «sí»): en la ficha suelta, el
  recuadro de HP de una invocación deja escribir un negativo; que quede en 0 con el mismo aviso que GM Tools.

- **⬜ en cola — 🌀 El paso gratis del Remolino cuenta como moverse (P330 decidida)** (dueño, 2026-11-24): con Apuntada, Puntería certera o Foco
  activos, el paso de 1 casilla del Remolino antes de girar muestra el aviso «Si te movés, lo perdés» y, si sigue, lo pierde (como las otras
  habilidades que mueven, P266/P271).
- **⬜ en cola — 🐝 El cuadro del duelo dice «personaje» debajo de una invocación** (visto el 2026-11-24, probando la Abeja sobre el muro de la
  varita): en «Objetivo», debajo de «Abeja de prueba», dice «personaje». Que diga «invocación» (o «invocación de Blanco J1»).

- **⬜ en cola — 😵 El Mareo de invocación se ve como estado (P332 decidida)** (dueño, 2026-11-24): que la invocación recién llegada muestre el
  iconito 😵 alrededor del token y que «Mareo de invocación» aparezca entre sus estados (ventana ◎, ficha). Sin vincularlo a las zonas.

- **⬜ en cola (investigar) — 🔁 La línea «Empieza su turno» sale repetida en la Mesa a veces** (visto el 2026-11-25 probando la miasma, con J1 y J2;
  dueño: «anotalo para investigarlo»). Buscar de dónde sale la repetida (¿dos pantallas que la publican?, ¿una recarga?) y arreglarlo.

- **⬜ en cola — 🔭 Una sola pasiva de +1 Rango: se saca «Largo alcance arcano»** (dueño, 2026-11-25: «resolver que exista solamente una de más
  rango y punto… sirve para todo lo que es rango: hechizos, armas de rango, etcétera»). Queda **Vista de halcón** (+1 Rango, para todo); sacar
  Largo alcance arcano de las pasivas de fábrica (`comun/pasivas.js`); los personajes, invocaciones y creeps que la tengan, pasarlos a Vista de
  halcón (sin duplicar si ya la tienen); ajustar las etiquetas de Vista de halcón (Shooter y Mago; distancia y mágico) y el texto si hace falta.
  **Y cambiarle el nombre** (dueño, 2026-11-25): **Vista de halcón pasa a llamarse «Rango amplificado»** («vista de halcón es muy referencia a algo de
  puntería»). Que los que ya la tienen guardada vean el nombre nuevo (mismo id o con su puesta al día).


- **⬜ en cola — ⚖ «Comparar» (tienda) no toma el daño de una varita** (dueño, 2026-11-25, con captura: Varita de granizo equipada contra Hacha de
  mano): en la fila «Daño prom.» la varita sale «—» aunque su texto dice que hace daño (1d4 + 3 a cada uno). Que cuente el daño de las varitas (y de
  lo que tenga daño en su Ejecución) y que la comparación **aclare de qué tipo es cada daño** (físico, especial, directo; y el elemento / Tipo si lo
  tiene): p. ej. «Daño prom. 5.5 (físico, Tipo 4, área)» contra «5.5 (físico, Tipo 8)». Ojo: la Varita de granizo es físico Tipo 4 según su texto.

- **✅ hecho (2026-11-25) — ✋ Los títulos de las dos ranuras de manos en el Equipo** (dueño, 2026-11-25, con captura de la ficha): hoy dicen «MANOS» y «MANOS
  (ARMAS Y ESCUDOS)», y se confunden. Que digan algo como **«MANOS (guantes / defensa)»** y **«MANOS (armas, escudos y otros)»**, en todos lados
  donde aparezcan (ficha, ventana de Equipo del mapa, ficha lite, GM Tools, el asistente de ítems).
  **Y además (dueño, 2026-11-25, con captura del Equipo):** que esa parte tenga una **división clara**: **primero lo que sostiene en las manos**,
  dividido en **«Mano 1» y «Mano 2»** (arma, escudo, varita, talismán…), y **después una sección «Equipado al cuerpo»** (cabeza, armaduras, guantes,
  piernas, pies, anillos, cinturón…). Hacerlo junto con los títulos de arriba, en la ficha y en la ventana de Equipo del mapa (y donde se repita).
  **Cómo quedó:** dicen «Manos (guantes / defensa)» y «Manos (armas, escudos y otros)» en el Equipo (la ficha y la ventana del mapa), la mochila,
  el cartel «Slot equipado», las categorías del asistente de ítems, el «Ver», la ficha lite y el Ver de un creep en GM Tools (sus armas: «Manos (armas,
  escudos y otros)»). La división quedó en la silueta (entrada de abajo): «✋ En las manos» con Mano 1 y Mano 2 a los costados, y «Equipado al cuerpo».
  Probado con clics (ficha y mapa).

- **✅ hecho (2026-11-25) (aprobado por el dueño el 2026-11-25, «avancemos así») — 🧍 El Equipo en una silueta del cuerpo**: reemplazar la lista de
  «Equipado» por una silueta simple (contorno propio, sin imágenes de terceros) con cada lugar del equipo encima: Cabeza; Armadura blanda y
  rígida en el torso; Cinturón; Piernas; Pies; Guantes y Anillos (1/2) junto a cada mano; **Mano 1 y Mano 2** como rectángulos a los costados;
  la Espalda arriba (Mochila equipada, Carcaj). Ocupado = verde con el nombre; vacío = punteado con «vacío». Con el mouse, el detalle del ítem;
  clic: Ver / Sacar. La Mochila al costado. Incluye los títulos de las manos y la división Mano 1 / Mano 2 / Equipado al cuerpo (entrada de
  arriba). Boceto aprobado: `docs/bocetos/equipo-silueta.html` y `.png`.
  **Cómo quedó** (`comun/ficha-equipo.js`, `siluetaHtml`): en 🛡 Equipo de la ficha y en la ventana de Equipo del mapa (la misma pieza; el 🎒 de la
  ficha lite abre esa), «Equipado» es la silueta, con la Mochila al costado como siempre y el peso equipado, el estado del equipo, Reparar y el
  Carcaj arriba y abajo, como antes. **Hover**: el detalle de la fila de antes (números, bonos, durabilidad, Armadura rota) y lo que hace, en corto.
  **Clic**: un menú con Ver / Editar / Sacar (los mismos botones de siempre). El lugar se pinta en rojo si lo puesto está roto y en ámbar si está
  gastado o con Armadura rota. **Dos manos**: la Mano 1 y la Mano 2 rayadas, las dos con el nombre («de dos manos: ocupa las dos» / «la misma de la
  Mano 1»). Un escudo atado al antebrazo va en un lugar propio, «💪 Antebrazo». La espalda: la mochila equipada y el carcaj (o el «Carcaj básico»
  que viene con el arco). **Arrastrar** un ítem de la mochila a su lugar lo equipa (aprieta su «Equipar»: el mismo costo y el mismo «Reemplazar o
  Comparar»); a un lugar donde no va, avisa y no hace nada. Invocaciones y creeps no usan este panel: quedan como hoy. Probado con clics en
  «Claude · pruebas 2» («Prueba · General»): Jugador 1 en la ficha y en el mapa (Sacar desde el menú, un bastón de dos manos arrastrado a la Mano 1,
  un anillo arrastrado, sacado y vuelto a poner, una capucha con «Equipar», un cuchillo arrastrado con el bastón puesto → «Slot equipado», unos
  guantes a la Cabeza → no, a Guantes → sí) y el GM en el mapa (ve la silueta y el hover; «Sacar» le dice que solo puede mirar). La vuelta: «quedó igual».

- **⬜ en cola — Probar: 🧍 la silueta del Equipo con lo que no se probó con clics** (2026-11-25): un escudo atado al antebrazo (el lugar «💪
  Antebrazo»), una mochila y un carcaj de verdad equipados en la espalda, el «Carcaj básico» con un arco, una pieza rota (en rojo) y con Armadura
  rota (en ámbar), y arrastrar en combate (que cobre los No2 de equipar). Con clics se probó lo demás (ver la entrada de la silueta).
- **✅ hecho (2026-11-25) — 🧍 Grietas y un iconito de «roto» en la silueta del Equipo** (dueño, 2026-11-25, con boceto aprobado en charla:
  el boceto mostraba tres recuadros sano / gastado / roto): una pieza **gastada (naranja)** lleva unas grietas finitas que
  entran solo desde los bordes y las esquinas; una **rota (roja)**, grietas que cruzan todo el recuadro de lado a lado. Dibujadas encima del recuadro,
  sin imágenes, y que se adapten al tamaño de cada lugar. Sugerencia de Claude (a confirmar con el dueño al mostrarlo): que en el roto pasen por detrás
  de las letras para que el nombre se lea. Además, **dentro del recuadro de una pieza rota, un iconito** que con el mouse encima diga el detalle: la
  durabilidad, si baja la Defensa, etc.
- **✅ hecho (2026-11-25) — 🧍 La Espalda y el Cinturón muestran lo básico cuando no hay nada especial** (dueño, 2026-11-25): al equiparse un arco o una
  ballesta se ocupa solo el **«Carcaj básico»** (así se llama hoy), y si después se pone un carcaj de verdad, va ese. Lo mismo con la mochila y el
  cinturón: sin nada especial equipado, la silueta dice **«Mochila básica · 20 ranuras»** y **«Cinturón básico · 5 ranuras»** (números dichos por el
  dueño; si las reglas o el código dicen otra cosa, preguntar antes de cambiar).
  **✅ hecho (2026-11-25), las grietas:** gastado (ámbar: le queda 1 punto o tiene Armadura rota) = grietas finitas desde los bordes y las esquinas
  y un **⚠**; roto (rojo) = grietas de lado a lado con ramas y un **💔**. Dibujadas en SVG, se estiran a cada lugar, tres dibujos por estado dados
  vuelta según el lugar (no se ven todas iguales) y pasan por detrás de las letras (el nombre lleva un halo del color del fondo). Con el mouse
  sobre el ⚠ / 💔: la durabilidad (x de y), si está ROTO (no da ningún efecto hasta repararlo), la Defensa que le baja la Armadura rota y con qué
  se repara (lo mismo que ya dice «🛠 Estado del equipo»). Probado con clics con el Jugador 1 (botas gastadas, cuchillo roto) y vuelto a como estaba.
  **✅ hecho (2026-11-25), lo básico:** el manual y el código dicen **20** ranuras de mochila y **5** de cinturón: sin nada equipado, la silueta
  dice «Mochila básica · 20 ranuras» y «Cinturón básico · 5 ranuras» (con los números que usa el juego, así que si cambian, cambian solos); con
  una mochila o un cinturón equipados, ese con sus ranuras totales. El «Carcaj básico» aparece con un arco **y con una ballesta** (dice sus
  lugares, «viene con tu arma»); con un carcaj de verdad, va ese. Los básicos van con borde fino sólido y fondo gris suave (ni punteado ni verde),
  con su explicación al pasar el mouse. Probado con clics con el Jugador 1 (arco y ballesta arrastrados a la Mano 1).

- **⬜ en cola — Revisar P343: 🪤 al detonar una trampa, una invocación resiste con los números de su dueño** (dueño, 2026-11-25: «ponela al
  final de la cola para revisarla»). Ver P343 en `preguntas-abiertas.md`: la Abeja de prueba resistió el Gas adormecedor con la Res.Mt de Blanco J1 al
  dispararse la trampa (al empezar su turno, con la suya). Y el 🔍 de una nube que alcanza a todos dice «a favor de los aliados de quien la puso»
  (se entiende al revés; propuesta: «también a los aliados de quien la puso»).
- **⬜ en cola — 🙈 Revisar el «?» que ve el GM dentro de una nube con un jugador escondido** (dueño, 2026-11-25): en la captura del GM probando el
  Gas adormecedor (J2 escondido con Sigilo adentro de la nube), al GM le aparecía un hexágono con «?» dentro de la nube. Investigar qué es (¿la última
  posición conocida? ¿una marca del escondido?) y, si delata **dónde** está el escondido, sacarlo: el GM sabe que existe y quién es, no dónde.
  En la misma captura, la tabla de turnos del GM no mostraba a Blanco J2 mientras estaba escondido (eso ya está en la cola: «El GM siempre ve a los
  jugadores en la tabla de turnos»).
- **⬜ en cola (vuelta al final, dueño 2026-11-25: «volvé a pasar esta tarea así como está al final de la cola») — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Nube de veneno y Aceite resbaladizo** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  Lo que ya se le contó (2026-11-25): la Nube de veneno es de aire, Veneno ×3, Res.Esp contra 9; el Aceite es de piso, Sentado, **al dispararse se
  resiste con Agilidad contra 7 pero el charco que queda con Res.CC contra 7** (error probable: recomendado Agilidad en los dos). Dudas abiertas:
  1) Nube de veneno, si ya está envenenado y vuelve a fallar: (a) +3 stacks, (b) +1 stack como la Nube tóxica (recomendado), (c) vuelve a 3.
  2) Aceite (solo piso): ¿también en cada paso adentro (recomendado) y sin que lo frene la Suela gruesa (recomendado: la Suela es para daño del piso)?
- **⬜ en cola — 🐝 Una invocación muerta se reúsa al invocarla de nuevo (P344 decidida, b)** (dueño, 2026-11-25): al volver a invocar, una copia
  muerta (vida 0) se reúsa como hoy se reúsa una dormida, y vuelve **como recién invocada de cero**: vida y No2 llenos y **sin ningún estado alterado**.
  Así no se juntan copias muertas en la ficha («… 3», «… 4»). Vale también para la invocación original que murió.
- **⬜ en cola (revisar) — 🐝 La copia de una invocación repite el nombre de otro token del mapa** (dueño, 2026-11-25: «me parece bien que lo pongas
  para revisar al final de la cola»): probando la habilidad que invoca, la copia de la abeja de Blanco J1 se llamó «Abeja de prueba 2», el mismo nombre
  que la abeja de Blanco J2, y en la tabla de turnos quedaron dos «Abeja de prueba 2» que no se distinguen. Propuesta: que una copia nunca repita el
  nombre de otro token del mapa.
- **✅ hecho (2026-11-25) — 🙈 P342 (c): un jugador escondido dentro de una zona, solo lo ven él y sus aliados** (dueño: «el GM ni siquiera
  vea que el jugador esté dentro de la nube»). Lo que resuelve la pantalla del escondido (la tirada para resistir la nube, la tirada de la zona, la
  chance, el daño fijo, el estado, el +1 stack del Veneno, la Crónica «… está en …» y los avisos) va marcado como las líneas del duelo oculto (P263):
  lo ven él, sus aliados y el GM solo con 👁; las líneas lo nombran. Mismo mecanismo (`vtt-hexgrid/js/130`, `zonaOcultaCon`); en `js/08`, el cartel de
  la zona, la Crónica, el Veneno, el stack y la renovación (estas tres escribían en la Mesa sin marca y con el nombre). El daño con dados de una zona
  de creep (P326) quedó igual: posible choque, P345. Pruebas: 6 nuevas (1137 en verde). Probado con clics en «Claude · pruebas 2» (Prueba · General):
  Blanco J2 en Sigilo dentro del Gas adormecedor al empezar su turno → J2 y J1 ven «Blanco J2 · Res.Mt» y la Crónica; el GM, nada (ni Mesa ni Crónica).
- **⬜ en cola — Probar: 🙈 P342 con el daño fijo de una zona (terreno incendiado), el +1 stack de la Nube tóxica y el GM con 👁** (2026-11-25): van por
  el mismo contexto (prueba automática), sin clics.
- **⬜ en cola — Probar: 📦 un objeto sin vida tampoco lo alcanzan un área, una onda, el Salto, la Carrera ni el Choque** (2026-11-25): con clics se
  probaron el ataque, Mala sombra y el Remolino; lo demás quedó con la misma regla (prueba automática), sin clics.
- **⬜ en cola — Probar: 📣 un refuerzo cuyo lugar ya pasó juega al final de esta ronda (P301 b)** (2026-11-26): con clics se probaron la invocación
  con su habilidad y el ➕ a mano; el refuerzo (un creep que llama refuerzos, js/31) usa el mismo camino (prueba automática), sin clics. Ver que entre al
  final con su mareo, lo pierda ahí y en la ronda siguiente juegue en su lugar.
- **⬜ en cola — 😵 Revisar el Mareo de invocación y probarlo en el mapa** (dueño, 2026-11-26: «pone al final de la cola el revisar mareo de
  invocación y testear en el mapa, etc.»). Revisar de punta a punta cómo funciona y probarlo con clics. Lo que dijo el dueño como ejemplo: «el Cura Plus
  no cura el mareo de invocación» — confirmar con él si es una regla (que no se cure con consumibles) o algo que vio que hoy no anda, y revisar qué
  hacen hoy el Cura Plus y los otros curadores con el mareo. Juntar con «😵 El Mareo de invocación se ve como estado (P332)» y «Probar: 😵 el Mareo de
  invocación que se va sin que la invocación juegue», que ya están en la cola.
- **✅ hecho (2026-11-26) — 🔘 Iconitos de estado: agrupar por familia de cerca y los 3 principales de lejos (P350 decidida)** (dueño, 2026-11-26):
  **de cerca (zoom normal o más):** opción B — hasta 6 estados, uno por vértice como hoy; con más, los de la misma familia se juntan en un circulito
  con numerito (💫4 = cuatro controles…), nunca más de 6 circulitos, y al pasar el mouse por un grupo se ve qué tiene; las familias se ordenan por
  importancia (lo que no deja actuar, el daño por turno, las marcas / ✋ / 🕶, las defensas y los buffs). **De lejos (mapa alejado):** opción A — solo
  los 3 más importantes y, abajo del token, una pastillita con el número de debuffs en rojo y el de buffs en verde (los que no se muestran). Bocetos:
  la evaluación del 2026-11-26 (entrada «Evaluar qué pasa cuando hay más estados que lugares…»). De paso: con tokens uno arriba del otro, la barra
  de vida queda encima de los iconitos del de abajo (visto en la evaluación).
  *Resultado:* **de cerca** (zoom 0,7 o más), hasta 6 estados van uno por vértice, en orden de llegada, como antes (un poco más grandes); con más de 6
  se juntan por familia en un circulito con el ícono del más importante y un numerito dorado (💫5). Seis familias, en este orden: lo que no deja actuar o
  controla, el daño por turno, las marcas y debilidades (con el ✋, el 🕶 y el ⚖), las defensas, los buffs y «otros»: nunca más de 6 circulitos y no se
  esconde ninguno. El globo de un grupo dice «💫 Lo que no deja actuar o controla · 5» y un renglón por estado con su efecto corto. **De lejos** (zoom
  menor a 0,7: dos toques del «−»), solo los 3 más importantes y, abajo del token, la pastilla con los que no se ven (rojo debuffs, verde buffs, gris
  los que no son ni una cosa ni la otra); su globo los lista. **De paso**: los iconitos se pintan después de todos los tokens, así que la barra de
  vida del de arriba ya no los tapa. Probado con clics en «Claude · pruebas 2» (Prueba · General): Blanco J1 con 3, el Tanque con 6, la Abeja con 9,
  el Warrior con 16 y el Debuffer escondido con 9, pegados; de cerca y de lejos, el globo de un grupo y el de la pastilla, desde el GM y desde el
  Jugador 1 (el escondido no se ve ni tiene globo). Después, la vuelta: «quedó igual». Lo que eligió Claude: **P351**. Queda: de lejos, con tokens
  pegados en diagonal, la pastilla de uno puede rozar un iconito del de al lado.
- **⬜ en cola — 🔘 La Armadura rota de un personaje con su iconito alrededor del token (P352 decidida)** (dueño, 2026-11-26): hoy, en un
  personaje, la Armadura rota viene del equipo roto y no sale entre los iconitos (ni de cerca ni en la pastilla de lejos; solo en la ventana ◎). Que
  tenga su iconito, en la familia 🎯 marcas y debilidades, como el ⚖ del sobrepeso (que también viene del equipo).
- **⬜ en cola (para evaluar más adelante; dueño 2026-11-26: al final, se hace si toca cuando pueda prestarle atención, si no se sigue postergando) — 🗺 GM Tools avisa cuando en el mapa pasan cosas que requieren ir ahí** (dueño, 2026-11-23, sobre
  P283: «casi siempre todo esto va a suceder en el mapa. Quizás lo que debería pasar en GM Tools es que te avise que están pasando cosas en el mapa
  que requieren que vayas ahí»). Pensar qué cosas (duelos esperando al GM, momentos pendientes, zonas por tirar…) y cómo avisarlas; conversarlo antes.
  Contado al dueño (2026-11-26): ejemplos de avisos (duelo esperando al GM, turno de un creep, zona o trampa por tirar, un jugador que pide algo, un
  creep caído) y formas (cartelito con «Ir al mapa», numerito rojo, sonido opcional); recomendado dejarlo para cuando juegue sesiones reales con GM Tools.
- **⬜ en cola — ❤ Vida extra de otro: «por encima de su máximo» (P353 decidida)** (dueño, 2026-11-26): cuando se mira la Vida extra de otro
  (otro jugador, un creep, una invocación ajena), la frase dice «su máximo»; la propia sigue «tu máximo» (ventana ◎, globo del iconito y del token).
- **⬜ en cola — 📋 Achicar la lista de «+ Estado» a los estados del core del juego** (dueño, 2026-11-26): «revisar los estados alterados que
  aparecen en el menú cuando uno pone más estado y filtrar los que son más redundantes, los que son un estado que se usa solamente por un ítem o un
  skill específico, y dejar solamente en ese menú de estados los que son más relevantes o representativos del core del juego, para que no sea una
  lista eterna. El resto de los estados que sigan existiendo, pero que no aparezcan en el core. Entonces, por ejemplo, la varita que te pone un estado
  al azar, que trabaje con los estados que tienen más sentido». Pasos: listar los estados de hoy (`comun/estados-presets.js` y los que suman ítems y
  skills), proponerle al dueño cuáles quedan en el «core» (con su motivo) y cuáles quedan fuera del menú (siguen existiendo y funcionando cuando un
  ítem o skill los pone); que la varita del estado al azar y lo que elija estados al azar use solo el core. Mostrárselo antes de programar.
- **✅ hecho (2026-11-26) — Probar: ❤ la Vida extra con Drenar vida** (dueño, 2026-11-26: verla con la habilidad de Larry). En «Claude · pruebas 2»,
  Blanco J1 (vida 50/50) con Drenar vida y Sanguijuela de prueba (se le sacaron al terminar), contra el Warrior · Hachero y el Support · Sanador,
  en duelos de verdad desde su Botonera; el GM resolvió al creep desde su pantalla. Se vio: (1) con la vida llena, todo lo drenado queda como Vida extra
  (+7, después +14); (2) **el tope del 50 %**: un tercer drenaje de 15 la dejó en +25 y no más (vida 50); (3) **la ventana ◎ dice «+25 de vida por encima
  de tu máximo» y «↳ Viene de Drenar vida.»** igual para J1, J2 y el GM; los globos del iconito y del token dicen solo «+N de vida por encima de tu
  máximo» (el origen, a propósito, va en ◎); (4) **la Sanguijuela**: pegada al Sanador, cuando se curó con «Sanar» la cura (+5) se la llevó J1 y, como
  estaba lleno, quedó como Vida extra: ◎ dice «Viene de Drenar vida y Sanguijuela.» para los tres. **Arreglado:** al sumarse a una Vida extra que ya
  había, el aviso decía «recibiste Vida extra (×undefined)»; ahora «recibiste Vida extra (+6: ahora +11)» (comun/ficha-acciones.js). **Pregunta nueva:**
  P354 (la Vida extra de la Sanguijuela no tiene tope: llegó a +30). **Ya anotado de antes** (`docs/pendientes.md`, revisión de las skills de clase,
  punto 5): Drenar vida dice «directo a la vida» pero le resta la Defensa especial del objetivo (se vio: 8 − 1 = 7). Capturas `cola130/01-*` a `17-*`.
- **✅ hecho (2026-11-26) — ❤ La Vida extra siempre con tope del 50 % (P354)** (dueño, 2026-11-26: «que la vida extra siempre tenga el tope de 50%»).
  **Un solo tope, en un solo lugar** (`comun/combatiente.js`): `VIDA_EXTRA_TOPE` (50), `topeVidaExtra(máximo)` (para abajo: con 50, +25),
  `vidaExtraEntra` (cuánto entra contando la que ya tiene), `vidaExtraTopeTxt` (el aviso «+6, pero el tope es +25 (50 % de tu máximo): quedó +25»),
  `sumarVidaExtraTope` y `vidaExtraAMano`/`vidaExtraAManoTxt` (lo escrito a mano). `agregarEstado` lo aplica solo cuando recibe `hpMax` (un creep ya lo
  pasa: es `sc`), así cubre el «+ Estado», las habilidades, los consumibles y lo recibido; `sumarVidaExtra(…, {hpMax})` también. Lo usan: el Relicario de
  sangre (la ficha y el mapa), el Anillo de la siesta (al descansar), la Sanguijuela (personaje, invocación y creep), Drenar vida (personaje y creep:
  `drenaTope` ya solo dice si da Vida extra; en el editor de la Ejecución pasó a una casilla), las habilidades y los consumibles, lo que llega por la
  cola de estados, el sobrante al curarse (avisa si ya está en el tope) y el número del chip ❤ (mapa, ficha y GM Tools). **El aviso** sale en el toast
  de cada camino y en la línea de la Mesa del creep. **Textos:** Drenar vida, la Sanguijuela (de clase, de creep y el estado), el Relicario, la Vida extra
  de la lista de estados y el manual (`07-estados.md`, «Excedente de vida»: decía «sin tope»). El cartelito del «+ Estado» → Vida extra ya no pregunta
  «¿Tiene un tope máximo?» (era solo un recordatorio, «Sin tope»): ahora dice el tope en la pregunta de cuánto. **Cuando baja el máximo:** hoy no se
  toca lo que ya tenía (P355). **Arreglado de paso:** el «+ Estado» de la ficha (personaje e invocaciones) perdía las opciones (`agregarEstadoConAviso`
  de `ficha-personaje/js/07`), así que un veneno o una regeneración no pegaban apenas se ponían (P161). **Probado con clics** en «Prueba · General»
  (J1, J2 y GM): «+ Estado» Vida extra 40 → +25 con el aviso; el chip ❤ escrito a 60 → +25; la Sanguijuela pegada al Sanador con J1 en +22: la cura
  robada (+5) lo dejó en +25 con el aviso; el Relicario de J1 con +20 y una Poción de HP (+25 con 45 de vida): +25 con el aviso «Vida extra (Relicario
  de sangre) +20, pero el tope es +25…»; el sobrante al curarse ya en el tope: «el sobrante no se carga»; ◎ igual para los tres («Viene de Sanguijuela
  y Relicario de sangre (y una parte, cargada a mano)»). Sin probar con clics: Drenar vida (la regla es la misma, en las pruebas automáticas), una
  invocación, GM Tools suelto y el Anillo de la siesta. Preguntas nuevas: P355, P356, P357. Capturas `cola131/`.
- **⬜ en cola — ❤ Tope de la Vida extra: recortar al bajar el máximo y el GM puede pasarlo a mano (P355 y P356 decididas)** (dueño, 2026-11-26,
  «como sugerís»): (1) si baja la vida máxima, la Vida extra que quede por encima del tope nuevo (50 % del máximo) se recorta sola, con un aviso;
  (2) el GM puede pasar el tope a mano (por ejemplo para un jefe), con un aviso que lo diga; los jugadores no. (P357: los escudos de los anillos
  siguen fuera del tope, sin cambios.) Regla común en `comun/combatiente.js` (commit e1bd62dc).
- **✅ hecho (2026-11-27) — P358: «✕ Limpiar filtros» de las pasivas deja todo como al abrir** (dueño, 2026-11-27, la recomendación). En «+ Pasiva»
  (la ventana de la Biblioteca: personaje, invocación y creep) y en el paso «Pasivas» del asistente de personaje nuevo, «✕ Limpiar filtros» desmarca
  los botoncitos, vuelve a tildar «sumar las de 🌐 Cualquiera» y vacía el buscador. El botón aparece también si solo se destildó «sumar…» o solo se
  escribió algo en el buscador. **El rol que venía marcado (un creep, la clase del asistente) también se va**: «Limpiar» es limpiar (si volviera a
  marcar el rol, el botón no haría nada a la vista cuando lo único marcado es ese rol); el rol se vuelve a marcar con un clic. `FiltroPasivas.clic`
  devuelve `'limpiar'` y `hayAlgo` (comun/pasivas.js); la Biblioteca y el asistente vacían su buscador. **Probado con clics** (GM, «+ Pasiva» del
  Tanque · Escudero; Jugador 1, el asistente). Nota: los siete creeps del mapa «Prueba · General» no guardan de qué entrada de la biblioteca salieron,
  así que su «+ Pasiva» abre sin rol marcado (no es un error del código: un Escudero agregado desde el pool esencial sí lo trae). Capturas
  `cola133/01` a `03` y `14`. Pruebas automáticas: 4 nuevas (1167 en verde). `restaurar.js`: «quedó igual».
- **✅ hecho (2026-11-27) — 🔮 Simular el fin del combate eligiendo qué creeps quedan vivos o muertos**
  (dueño, 2026-11-27): «en el simulador del final del combate uno puede poner que los creeps que siguen vivos estén muertos, entonces para saber
  cuánto ganan de experiencia y qué equipos le quedan con los creeps muertos. Entonces al poner simulación uno debe elegir cada uno de los creeps
  presentes y poder poner si están vivos o muertos». En 🔮 Simular (`comun/combate-fin.js`): una lista con cada creep presente y un interruptor
  vivo / muerto (arranca como están de verdad), y la experiencia y el botín se recalculan con esa elección; no se guarda nada (es simulación).
  **Hecho:** en 🔮 Simular, arriba de los pasos, el recuadro «☠ Quién cae» con cada creep presente (los del mapa publicado, también los ocultos —
  dice «🙈 oculto»— y los que se fueron por un Town portal) y su casilla: tildada = cae, destildada = sigue (cuenta como «Escapó», con su 20 % de XP
  si está tildado contar a los que escaparon). Arranca como está cada uno de verdad («de verdad sigue en pie / cayó / escapó por un portal»); lo
  cambiado se ve con un borde punteado. Al cambiar una casilla se recalcula todo al momento con la cuenta de siempre (`generar`): la XP de cada creep
  y por jugador, el oro, el equipo, los consumibles y los despojos, en los cinco pasos y en el renglón «Con esto: … XP · … DDE · … ítems en el botín».
  Botones «☠ Todos caen» y «↺ Como están». El oro (±20 %) y el consumible al azar de un creep que se marca como caído salen de una tirada de muestra,
  fija mientras dure la simulación: la lista dice que son un **estimado** (P359). Nada se guarda (`rep.simCae`, en memoria; en GM Tools se vacía al
  reabrir); «▶ Pasar a Avanzar» lo descarta y en Avanzar cuentan los creeps como están. Mapa y GM Tools. **Probado con clics** (GM, «Prueba · General»
  en combate, los siete creeps): al marcar el Hachero y el Tirador la cuenta pasó de 49 XP / 0 DDE / 0 ítems a 105 XP / 28 DDE / 8 ítems; al cerrar,
  la vida de los siete creeps, el combate, el botín y las recompensas quedaron igual; al reabrir arrancó como están; Avanzar, sin la lista, igual que
  antes (mirado sin publicar). Capturas `cola135/04`, `05`, `06`, `09`, `13`, `15` y `16`. Pruebas automáticas: 1 nueva (1168 en verde).
  `restaurar.js`: «quedó igual».
- **⬜ en cola — ✎ Ítem custom con un consumible: que no hable de creeps ni del catálogo** (2026-11-27, visto al probar el consumible con tirada):
  en GM Tools, «✎ Ítem custom» con la categoría Consumible igual muestra «Equipar a: (un creep)», «Si no lo equipás a nadie, igual lo podés publicar en
  el catálogo», el Tier («solo importa si lo publicás en el catálogo») y el botón dice «Crear y equipar», aunque un consumible propio no se equipa a
  un creep ni va al catálogo (P317): ahora pasa a 🤝 Dar a un jugador. Propuesta: con un consumible, esconder «Equipar a» y el Tier, y que el botón
  diga «Crear y dar a un jugador». Captura `cola134/13-GM-item-custom-consumible.png`.
- **⬜ en cola — 🩸 Corregir «Transfusión sanguínea»: no deja pasar vida de una invocación aliada a un personaje aliado** (dueño, 2026-11-27:
  «corregir tranfusion sanguinea: no permitió pasar hp de una invocación aliado a un pj aliado»). Reproducirlo con clics (una invocación aliada como
  origen y un personaje aliado como destino), ver por qué no la ofrece o no la deja, y arreglarlo.
- **⬜ en cola — 📜 Ficha lite: un botón para ver las habilidades** (dueño, 2026-11-27, con captura de la ficha lite de un personaje: abajo
  están «📊 Stats», «🎒 Abrir la mochila» y «📜 Ver mi ficha completa»): «acá debería haber un botón para ver las habilidades». Sumar «⚡ Habilidades»
  que muestre las habilidades del personaje (y de la invocación / creep si aplica) con lo esencial de cada una (costo, enfriamiento, qué hace) y,
  si es el dueño, que deje usarlas igual que la Botonera. Ver `comun/ficha-lite.js` y `vtt-hexgrid/js/15-ficha-lite.js`.
- **⬜ en cola — 🧹 Descripciones sintéticas con el detalle aparte, y sin las notas de desarrollo «(fecha, dueño: …)»** (sumado 2026-11-27: el dueño
  pide además descripciones bien sintéticas, con las minucias en un cuadro de detalle aparte; el Contraataque es el primero, hecho como modelo) (dueño, 2026-11-27: «hay muchas notas y
  aclaraciones tipo "fecha,dueño:" todo eso no debe llegar al jugador»). Revisar las descripciones visibles (`detalle`, `descripcion`, `efectoDetalle`,
  `original`…) de `comun/skills-clase.js`, `skills-creep-base.js`, `pasivas.js`, `estados-presets.js`, `catalogo.js`, `creeps-base.js`, `trampas-base.js`,
  `armas-naturales-base.js` y lo que se arme con textos en el código (carteles, «Ver detalle», el manual), y mover esas notas a un comentario o a `docs/`
  sin cambiar ninguna regla. Revisar si las copias guardadas (habilidades de clase, ítems) se ponen al día solas. Nueva regla en `docs/memoria-claude.md`.
- **⬜ en cola — ⚔ Las invocaciones no contraatacan nunca** (2026-11-27, Claude, al programar «Contraataque solo cuerpo a cuerpo»). El duelo de una
  invocación (`comun/inv-duelo.js`) no tiene el gancho `armaContra` (ni `contraPasiva`), así que una invocación con la pasiva Devolver gentileza o con
  la habilidad Contraataque nunca recibe la pregunta «¿Contraataca?» (las reglas de combate son iguales para personajes, creeps e invocaciones). Ver si
  hace falta y, si sí, sumarle los ganchos como `comun/creep-duelo.js` (con `Combatiente.contraArmaDe`, que ya sirve para invocaciones).
- **✅ hecho (2026-11-27) — ⚔ Contraataque solo con armas cuerpo a cuerpo y descripción prolija** (dueño: «Contraataque debería ser posible sólo con
  armas cuerpo a cuerpo. También me gustaría que emprolijaras un poco la descripción»; y sobre el ataque recibido: «solo cuerpo a cuerpo también»).
  El contraataque se ofrece solo si **el ataque recibido fue cuerpo a cuerpo** y quien contraataca tiene **un arma cuerpo a cuerpo** (no de rango, ni
  varita, ni orbe; un báculo sí; con las manos vacías, a puño); si tiene una cuerpo a cuerpo en la otra mano, contraataca con esa (un creep la pone en
  la mano al contraatacar). Vale para la habilidad Contraataque y para la pasiva **Devolver gentileza** (comparten `armaContra` y el cuadro del
  duelo), en personajes y creeps. La regla vive en `Combatiente.sirveParaContra` / `ataqueCuerpoACuerpo` / `motivoSinContra` / `contraArmaDe`; la usan
  `comun/duelo.js` (alcance, la pregunta, el cobro), `ficha-duelo.js` y `creep-duelo.js` (qué arma, el aviso «⚔ Contraataque: ahora no (…)» en
  «Elegí cómo te defendés»). En el cuadro: «⚔ Blanco J1 no puede contraatacar: …». Descripción nueva de Contraataque (de clase y de creep) y de Devolver
  gentileza, sin fechas ni citas. Las copias guardadas en las fichas se ponen al día solas (`FichaGuardado.migrarHabsDeClase`, salvo una copia editada a
  mano). Manual (06-combate, «Contraataque») al día. Pruebas: 1170 (dos nuevas). Probado en el mapa «Prueba · General» con el Warrior · Hachero contra
  Blanco J1 (con el Cuchillo: ofrece; con el Arco corto y con la Varita arcana: no) y el Rango · Tirador disparándole (con el Cuchillo: no). Duda
  nueva: P360 (el Parry a distancia del Shooter promete contraatacar con el arma de rango).
- **🔥 Zonas, todas juntas al final** (dueño, 2026-11-25: «vamos a pasar todas las tareas pendientes, inmediatas, que tengan que ver con zonas al final
  de la cola»). Lo de abajo, hasta «En cola», es todo de zonas; se retoma cuando el dueño lo pida.
- **⬜ en cola — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Brea pegajosa y Cola de carpintero** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
  Lo que ya se le contó (2026-11-25): la **Cola, al dispararse, se resiste con Fuerza contra 9 pero lo que queda en el piso con Res.CC contra 9**
  (error probable; recomendado Fuerza en los dos). Propuesto: al entrar y al empezar el turno; la Brea sigue renovando el Rengo por paso a quien ya
  está pegado; la Cola sin «cada paso»; la Suela gruesa no frena ninguna; quien ya tiene el estado y vuelve a fallar, se le renueva. Sin respuesta.
- **⬜ en cola — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Resina de árbol negro y Arena movediza (con las trampas de arena de varita)** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
- **⬜ en cola — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Varita del aceite y Varita del farol** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
- **⬜ en cola — 🔥 Zonas que pegan «en cada Mantenimiento», de a dos (P295): Varita de arena movediza (y la mayor) y Varita de la luz flotante** (solo un estado). Dueño, 2026-11-23: «verlas una por una… de a dos». Contarle qué hace cada una hoy y si conviene pasarla a «al empezar el turno de quien está adentro» (como el Muro de fuego); programar lo que elija.
- **⬜ en cola — Probar: 🔥 la Suela gruesa en el texto y la cuenta del Muro de fuego** (2026-11-23): nadie de la partida tiene Suela gruesa; el
  texto la nombra y el mapa la resta (prueba automática), sin clics.
- **⬜ en cola — Probar: 🔥 el Muro de fuego sobre un creep y sobre una invocación con resistencia al fuego** (2026-11-23): con clics, solo un
  personaje; el creep (el número solo en la pantalla del GM) y la invocación (sin número en el cartel) van por la misma función.
- **⬜ en cola — Probar: 🔥 resistencia al fuego negativa (vulnerable) en el Muro de fuego** (2026-11-23): el texto «−2, vulnerable» solo con la
  prueba automática.
- **⬜ en cola — Probar: 🔥 el Muro de la habilidad al cruzarlo (sin terminar adentro) y la Varita al empezar el turno, con resistencia** (2026-11-23):
  van por el mismo cartel y la misma cuenta que los otros caminos probados; con clics no se hizo esa combinación.
- **⬜ en cola — 🔥 El cartel verde del daño de una zona dice «no hay nada que resistir»** (visto en las capturas del 23/11): en el cuadro del duelo del
  daño del Muro de fuego, el cartel grande de abajo sigue diciendo «no hay nada que resistir: se aplica», aunque la cuenta resta la resistencia al
  fuego. Que diga algo coherente con lo nuevo (por ejemplo «no se puede esquivar: se aplica»).
- **⬜ en cola — Probar: 🔥 el cartel de la zona visto por el bando rival** (2026-11-23): el cartel lo ve solo la pantalla que lo resuelve (la del
  dueño del personaje, o la del GM para un creep), o sea siempre su bando; el texto sin número («es resistente») sale cuando el GM resuelve por un
  personaje (🎮 el control). Solo con la prueba automática.
- **⬜ en cola — Probar: 🔥 la Varita del muro de fuego al empezar el turno adentro, con resistencia** (2026-11-23): el renglón de «Empieza tu turno»
  usa el mismo texto que el cartel (probado al cruzarla); esa combinación no se hizo con clics.
- **⬜ en cola — Probar: 🔥 inmune y vulnerable sin número, a la vista del rival** (2026-11-23): «es inmune al fuego» y «(es vulnerable: le entra de
  más)» y la fila «+ Resistencia… (vulnerable)» del cuadro, solo con la prueba automática.
- **⬜ en cola — 🔥 Ajustes de la Varita del muro de fuego y del texto de la resistencia** (dueño, 2026-11-23):
  1. **El GM ve el número de la resistencia de los jugadores** (cartel, renglón de «Empieza tu turno», cuenta del daño): «el GM está bien que lo
     vea; el tema son los jugadores a los creeps». Los jugadores siguen sin ver el número de los creeps.
  2. **La varita pasa a 2d4** de daño de fuego directo («un d4 sin quemadura ni nada me parece muy poco»): catálogo, textos y las varitas ya en
     mochilas.
  3. **«Lo frena en parte su resistencia al fuego»** en vez de «lo frena su resistencia al fuego», en todos los textos donde aparezca («si dice "lo
     frena" se puede interpretar como que lo frena completamente»). El caso inmune sigue diciendo «es inmune».
- **⬜ en cola — 🪟 La tarjeta de la Crónica «X está en <zona>…» queda «tirando» para siempre después de recargar** (visto en la prueba del
  23/11): al recargar con una zona pendiente, la tarjeta de la Crónica no se cierra nunca. Que se cierre o se ponga al día sola.
- **⬜ en cola — Probar: 🔥 la resistencia 0 de un creep en la pantalla del GM** (2026-11-23, P300): el cartel de una zona sobre un creep sin resistencia,
  visto por el GM, tampoco la nombra; solo con la prueba automática (con clics se vio un personaje).
- **⬜ en cola — Probar: 🔥 el renglón «le llegó fuera de su turno» con el texto final** (2026-11-23): con clics se vio con la primera redacción («se lo
  pusieron fuera de su turno… ya pegó al ponérselo»); la final («le llegó… ya pegó al llegar») solo con la prueba automática.
- **⬜ en cola — 🙈 La zona de un creep que le pega a un jugador escondido no tiene que delatarlo ante el GM (P326)** (prueba con clics,
  **Actualizado por la P345 (dueño, 2026-11-25), reemplaza lo de abajo de la P326:** el GM **no ve nada** (ni la tirada, ni la Mesa, ni la Crónica,
  ni el cuadro del duelo) y el daño de la zona del creep sobre el escondido lo **tira la pantalla del escondido**, visible solo para su bando (como la P342 c).
  2026-11-24): hoy, con Blanco J1 en Sigilo sobre el Muro de fuego de un creep, el daño (3d4) va al cuadro del duelo y lo tira el GM; y el GM ve en
  la Crónica «Blanco J1 está en Muro de fuego…» y en la Mesa el daño con el nombre. El GM sabe que J1 está escondido (está bien), pero así sabe
  **dónde**. Lo mismo vale para cualquier zona con daño de dados del GM (y probablemente al entrar caminando, no solo al empezar el turno). Dónde:
  `vtt-hexgrid/js/08` (`zonaResolverBanner`: `porDuelo` mira solo `t.oculto`; `zonaMomentoAbrir` no marca `datos.escondido`; `danoDirectoAvisar`,
  la línea de la Mesa), `zonaCartelAntes` («El daño lo tira Blanco creep»). Esperar la respuesta de P326; no tocar lo de la tabla de turnos.
- **⬜ en cola — 🔥 El renglón de una zona lee la resistencia de una invocación (P331 decidida)** (dueño, 2026-11-24): hoy, con una invocación en
  resistencia 0, el renglón igual dice «lo frena su resistencia al fuego» porque no lee su número; que lo lea, y con 0 no la nombre (como P300).
- **⬜ en cola — Probar: 🌋 el Chorro de lava sobre un escondido, sobre un creep y sobre quien vuela** (2026-11-25): con clics se probó solo un
  personaje a la vista. El escondido va por el camino de siempre (P326, en cola aparte); el creep y quien vuela (no lo toca: es del piso), solo con
  la prueba automática.
- **⬜ en cola — Probar: 🔥 la Fogata y la lava sin orden de turnos** (2026-11-25): sin orden (narrativo) tienen que pegar al pasar de ronda, como el
  Muro; no se probó con clics.
- **⬜ en cola — 🔥 Recargar en el medio del turno vuelve a ofrecer una zona ya tirada** (visto el 2026-11-25): si «▶ Empieza tu turno» tardó (otro
  cartel de zona abierto más de 15 s) la zona sale en su cartel aparte; si después se recarga la página antes de cerrar la ventana, la zona vuelve a
  aparecer como renglón y se puede tirar dos veces. Pasa con cualquier zona de «al empezar el turno» (también el Muro).
- **⬜ en cola — Probar: 💨 los Pedos en el Mantenimiento con el GM mirando otro mapa** (2026-11-25): la tanda la arma la pantalla del GM; si está
  en otro mapa, a los 5 s cada pantalla pide la suya (con la misma tirada de ese Mantenimiento). No se probó con clics; tampoco con un escondido
  adentro (P326) ni con una invocación.
- **⬜ en cola — Probar: ☠ la Varita de miasma sin orden de turnos y sobre un creep** (2026-11-25): sin orden (narrativo) tiene que pegar al pasar de
  ronda; sobre un creep (la tira un jugador), el cartel de siempre del GM. Con clics se probó solo un creep tirándola sobre dos personajes.
- **⬜ en cola — Probar: ☠🔥 las Nubes tóxicas y la Mina napalm sin orden de turnos y sobre una invocación** (2026-11-25): sin orden (narrativo)
  tienen que pegar al pasar de ronda; la Nube de la clase sobre una invocación o con un escondido adentro (P326); la Nube de un creep sobre una
  invocación (renglón de «Empieza el turno de…»). Con clics se probó todo con orden de turnos, sobre personajes y creeps.
- **⬜ en cola — Probar: 🔥 el terreno incendiado y las zonas del asistente sin orden de turnos, y una zona del asistente con estado** (2026-11-25):
  sin orden (narrativo) tienen que pegar al pasar de ronda; una zona del asistente solo de piso con un estado y resistencia (una tirada al entrar
  aunque dé varios pasos; el daño, una vez por paso); una que «solo importa moverse» (sin el golpe al empezar el turno); que quien levita cruce las
  Brasas sin que le peguen. Con clics se probó todo con orden de turnos y daño sin estado.
- **⬜ en cola — 🔥 Al terreno incendiado lo frena la resistencia al fuego (P338 decidida)** (dueño, 2026-11-25): hoy su daño fijo va directo a la
  vida sin restar la resistencia al fuego; que la reste, como las demás zonas de fuego (y que el renglón / «Ver detalle» lo digan, P300/P331).
- **⬜ en cola — Probar: 💤 el Gas adormecedor y el Gas somnífero con lo que no se probó con clics** (2026-11-25): sin orden de turnos (narrativo:
  tienen que pegar al pasar de ronda), el **Gas somnífero** (Exhausto, Res.CC contra 9, se dispara solo en el centro), un **creep** adentro (el
  cartel de siempre en la pantalla del GM, no un renglón), alguien que **entra** a la nube ya puesta y se mueve adentro (una sola vez por ronda), y
  la puesta al día de una copia vieja en una **mochila** y en el **cinturón** de un personaje o de un creep. Con clics se probó el Gas adormecedor
  con orden de turnos sobre dos personajes, una invocación que vuela y un escondido.
- **⬜ en cola — 🔥 El Muro de fuego siempre con fuego amigo** (dueño, 2026-11-27: «que el muro de fuego siempre tenga fuego amigo»): el muro (de
  la habilidad, de la Varita del muro de fuego y el de un creep) le pega a cualquiera que lo cruce o empiece su turno adentro, aliados de quien lo puso
  incluidos (y él mismo), como la regla general de que lo de área tiene fuego amigo (2026-10-03). Revisar hoy qué hace cada uno y que todos lo cumplan;
  textos al día (habilidad, varita, «Ver detalle», cartel).

## En cola

28. [x] (✅ ya estaba hecha: la prueba pasó el 2026-11-11, con las reglas del campo `pf` pegadas — ver `docs/pendientes.md`; esta línea había quedado sin tachar. Revisado el 2026-11-18: el código guarda `pf` en el token y no hay nada pendiente) **Paso Fantasma guardado en la partida: mismo estado en todas las pantallas, se gasta una sola vez, sobrevive a recargar la página** (2026-11-09; antes, pegar las reglas nuevas de Firestore del campo `pf`).

Cada línea nueva que se termine de diseñar se suma al final.

## Hechas

- [x] **40 · Línea D2 · Tóxico, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad usada en el mapa (Espina tóxica,
  Nube tóxica con una sola tirada de Ef.Esp para todos y el +1 stack al volver a entrar, Corroer, Maldición de la sequía, Maldición tormentosa, Polen
  somnífero con Evasión 1 al dormido y despertar con daño), la Varita de la ponzoña (no se esquiva), la Varita de miasma y el Polvo de adormidera.
  **Arreglado:** el cartel del Veneno de una zona sin stacks propios (la Varita de miasma) decía «+1» y se aplicaban 4. Para ver con el dueño: un
  personaje que ya tiene Veneno de otro lado y queda adentro de la Nube cuando aparece tira y suma 3 (no 1); la Varita de la ponzoña suma 4 stacks.
  Sin probar: las pasivas por separado (sí sus números). Detalle en `pruebas-en-el-mapa.md`.
- [x] **38 · Estandarte de la vanguardia** (2026-11-10): los aliados a 2 casillas o menos reciben «🚩 Estandarte de la vanguardia» (+1 Defensa y +1 PdG)
  y se les va al alejarse. **Arreglados:** el estandarte de dos bonos cortaba con un error en el mapa (no aparecía el estado); un aliado que salía y volvía
  a entrar enseguida no lo recuperaba por 2 minutos; el estandarte clavado (el token del Estandarte de guerra) también lo recibía (este último arreglo, sin volver a probarlo en el mapa). Detalle en `pruebas-en-el-mapa.md`.
- [x] **39 · Línea S2 · Abanderado, niveles 1 a 5** (2026-11-10): números iguales al diseño; cada habilidad usada en el mapa (Potencia, ¡A la carga!,
  Bendecir el arma, Redoble de tambores, Arenga, Estandarte de guerra), el ataque con la Lanza corta a 2 casillas y el Pergamino grupal. Marcar el ritmo,
  probado con la cuenta del orden (sin pasar una ronda entera). Sin probar: la Lanza del abanderado atacando (sí sus números). Detalle en `pruebas-en-el-mapa.md`.
- [x] **36 · Orbe de resguardo mayor en el Mago de escarcha nv3** (2026-11-10): al ganar el PdG.Esp (Dardo helado a Larry), «Escudo especial 🛡3/3»
  hasta su próximo turno; recibió 5 de daño: 1 de Defensa, 3 el escudo y 1 a la vida, y el escudo desapareció. **Arreglado:** la marca de «una vez por
  turno» se perdía al recargar la página del GM (daba un segundo escudo); ahora queda guardada en el creep. Detalle en `pruebas-en-el-mapa.md`.
- [x] **37 · Línea M2 · Mago de escarcha, niveles 1 a 5** (2026-11-10): números iguales al diseño; cada habilidad usada en el mapa. **Arreglados:**
  el +2 del Anillo de escarcha no lo veía la pantalla del jugador golpeado (aplicaba 2 menos); la Lluvia de escarcha no les pegaba a los aliados; con el
  GM con el control de un personaje, el suelo congelado le pedía la Agilidad dos veces; el aviso «El hielo se derrite» se cortaba con un error.
  Sin probar: la Poción de SP menor y el Chaleco de kevlar contra un disparo (sí, sus números). Detalle en `pruebas-en-el-mapa.md`.

- [x] **35 · Línea R2 · Hostigador a distancia, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad, pasiva y
  pieza del equipo usada en el mapa, sin errores salvo uno. **Arreglado:** un disparo hecho con una habilidad (Tiro certero, Tiro a la rodilla…)
  perdía lo propio del arco (Emboscada, Espalda a distancia, la distancia mínima, el tiro alto); ahora lo lleva (`comun/combatiente.js`).
  No se vio la Racha (no salió ningún crítico con el Arco de tiro ligero). Detalle en `pruebas-en-el-mapa.md`.
- [x] **33 · Atacar saca del Sigilo** (2026-11-10): Bizzante (jugador) y una Rata (GM) atacaron desde el sigilo por la espalda: el duelo dijo
  «desde el sigilo, la defensa vale 1» (Evasión 2 → contó 1; 8 → 1), apenas se declaró salieron del sigilo, sin Marcado, y la Mesa dijo
  «🕶 … atacó y salió del sigilo». Bien. No probado: el robo y el giro. Detalle en `pruebas-en-el-mapa.md`.
- [x] **34 · Percepción aumentada: sin punto ciego en la espalda** (2026-11-10): con un creep. Sin la pasiva, Rockardo en sigilo llegó a su
  espalda sin aviso; con ella, «⚠ Hace falta una tirada de percepción» y la casilla de atrás pintada de alerta (también en la pantalla del jugador).
  Paso ligero sigue igual (no le ofrece darse vuelta, +2 por la espalda). No probado: un personaje o una invocación con la pasiva. Detalle en `pruebas-en-el-mapa.md`.

- [x] **32 · Línea L4 · Hostigador con trampas, niveles 1 a 5** (2026-11-10): números iguales a la prueba de niveles; cada habilidad, la Red de caza
  y las Botas del desertor usadas una vez en el mapa, sin errores. **Arreglado:** con un personaje Invulnerable, el cartel de la trampa ahora dice
  «no le hace nada (Invulnerable)», como con un creep (`vtt-hexgrid/js/19-trampa-paso-a-paso.js`). Detalle en `pruebas-en-el-mapa.md`.
- [x] **30 · Red de caza y Red tendida: se disparan en cualquiera de las 7 casillas** (2026-11-10): las dos, pisando un borde (no el centro);
  la red cayó sobre los tres personajes del área, cada uno con su Fuerza (contra 8 la Red tendida, contra 7 la de caza). Bien. Detalle en `pruebas-en-el-mapa.md`.
- [x] **31 · Trampas de área: se disparan en cualquier casilla** (2026-11-10): Polvo cegador, Mina del cazador, Gas somnífero (7 casillas, deja la
  nube 3 turnos) y Petardo trampa, pisando un borde: alcanzaron a los tres del área, cada uno con su tirada. **Arreglado:** la nube del Gas
  somnífero renovaba el Exhausto con Res.Mt; ahora con Res.CC, como la trampa (`comun/catalogo.js`).

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
  **Decidido (dueño, 2026-11-24, P326):** tira el daño el dueño de la zona; el GM sabe que le pegó «a un personaje oculto», sin nombre ni
  token: «el muro le hizo N de daño a un personaje oculto». El escondido sigue escondido y se puede seguir moviendo. Lo mismo con el inmune
  (la Crónica y la Mesa sin nombre; «esto es fácil de resolver, supongo»).


