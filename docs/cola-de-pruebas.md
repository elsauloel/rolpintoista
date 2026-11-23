# Cola de pruebas en el mapa

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
- **⬜ en cola — 💬 Explicar P266 y P267** (dueño, 2026-11-22: «P266: elaborá esto, fuera de contexto no lo entiendo»; «P267: elaborá esto para que
  lo entienda»). Explicarlas con un ejemplo.
- **⬜ en cola — 💀 Un creep que cae desde GM Tools también pierde sus estados (P270)** (dueño, 2026-11-22: «no debería ser así»; P270 decidida:
  caer en 0 = se borran los estados).
- **⬜ en cola — 🎯 Repasar la Apuntada de las ballestas (P271)** (dueño, 2026-11-22: «necesitaría repasar cómo está anotada la Apuntada para
  entender esto»). Explicarle cómo está y qué preguntaba P271.
- **⬜ en cola — 🔥 La Varita del muro de fuego también al empezar el turno (P272 decidida)** (dueño, 2026-11-22: «sí»).

- **⬜ en cola — 🪟 Zona al empezar el turno: lo que quedó sin probar** (dueño, 2026-11-22: «lo que quedó sin probar, probalo. Y si no se puede,
  y si el problema es que la tirada falló para resistir, forzá la tirada con elegir el resultado manualmente»). Resistir con éxito desde el
  renglón (con «✍ Elegir manualmente»), una invocación con turno propio sobre el Muro, recargar la página antes de tirar la zona, la frase «Se
  aplicó solo al pasar el turno…», y confirmar que el botón de tirar el daño lo tira **el dueño de la zona** (dueño: «habitualmente es un
  rival. ¿Correcto?»), también cuando la zona es de un jugador.
- **⬜ en cola — 🔥 ¿La Quemadura del Muro pierde un turno en el mismo momento en que entra?** (dueño, 2026-11-22, sobre la captura con
  «Quemadura: 3 → 2 turnos»: «quiero creer que esa es una quemadura previa… no tendría sentido que en el momento que se le aplica la quemadura
  por la zona de muro, se baje su cantidad de turnos de 3 a 2, tendría que por lo menos durar una ronda»). Verificar de dónde venía esa
  Quemadura y qué pasa cuando el Muro le pone otra encima (¿se renueva a 3?); que una recién puesta dure al menos una ronda entera.
- **⬜ en cola — 🐝 Las invocaciones en el orden de turnos, con su iniciativa** (dueño, 2026-11-22, P275: «una invocación debería ubicarse en la
  lista en el orden de turnos. Es más, agreguemos una función que al realizar una invocación, esta venga acompañada de una tirada de iniciativa y
  que automáticamente al invocarse se ubique en el orden de turnos de acuerdo a su tirada de iniciativa»). Ver cómo está hoy (hay invocaciones
  con turno propio y otras fuera del orden, como la abeja); lo dudoso, como pregunta.

- **⬜ en cola — 👥 Token suelto: probar lo que faltó** (dueño, 2026-11-22: «probar lo que no se probó»; va a pegar las reglas pronto). Con las
  reglas pegadas: que otro jugador y el GM lean una descripción guardada de verdad (mouse y 🪪), un token suelto creado por el GM, y el
  «🎭 Ponerlo en el mapa» de una invocación que no está en el mapa.
- **⬜ en cola — 📦 Token suelto paso a paso: iniciativa y vida** (dueño, 2026-11-22, dictado; «esto es para objetos inanimados»): que crear un
  token suelto sea una serie de pasos: nombre y descripción; «¿Ocupa lugar en la iniciativa? Sí / No»; «¿El token tiene HP? Sí / No», y si
  tiene HP, que se lo pueda elegir como objetivo de ataques («y hasta ahí nomás»). Resuelve también P277. (El «agregar tener» del dictado
  era «agregarlo a la lista de pendientes», dueño 2026-11-22.)

- **⬜ en cola — 🤝 El 🎁 queda solo para el botín (P278 decidida)** (dueño, 2026-11-22: «reemplazá el emoji del regalito por el emoji de las
  manos para que se entienda que esas manos son para pasar objetos y otras cosas. Que el regalo quede solo para el botín»): el 🎁 del «⋯» del
  token (mapa), el de cada fila de 👥 Personajes (GM Tools), el del Ver de un ítem y donde más aparezca para dar, pasan a 🤝; el cartel «🎁 El GM te
  dio algo» también. El 🎁 queda solo en Despojos / botín.

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

- **⬜ en cola — ☥ Probar: la animación corta al resucitar subiéndole la vida a mano** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): que se vea en las tres pantallas (P256 i).
- **⬜ en cola — ☥ Probar: resucitar a mano a una invocación caída** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): el cartel «está caído, ¿querés resucitarlo…?» con una invocación (P256 i).
- **⬜ en cola — ☁ Probar: la Polvareda de un creep escondido** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): «Ver detalle» y el cartel dicen «Alguien» a los jugadores (P259 3).
- **⬜ en cola — ☁ Probar: la nube de la varita de niebla** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): guarda quién la puso y con qué (P259 3).
- **⬜ en cola — ☁ Probar: el virote de humo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): su nube guarda quién la puso y con qué (P259 3).
- **⬜ en cola — 🚩 Probar: «Ver detalle» del estandarte** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): el del Estandarte de guerra, con y sin quien lo clavó a la vista (P259 4).
- **⬜ en cola — 👊 Probar: el puño de un personaje con la maestría de punzantes, en un duelo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): (P260 4; tiene prueba automática).
- **⬜ en cola — 🐝 Probar: una invocación con colmillos y la maestría de su Tipo** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): (P260 4; tiene prueba automática).
- **⬜ en cola — 🎁 Probar: «Dar igual» con la mochila llena** (dueño, 2026-11-22: «de la lista de sin probar con clics, ponelas cada una con su propio punto»): darlo de verdad y ver el aviso del jugador; después devolver el inventario (P262 5).
- **⬜ en cola — 🪧 El nombre del tótem y del estandarte no delata al creep (P281 decidida)** (dueño, 2026-11-22: «correcto, sacale el nombre
  del creep»): el token se llama solo «Tótem de silencio» / «Estandarte de guerra», sin «de <creep>». Los ya clavados, también.

- **⬜ en cola — 🎒 Revisar el sobrepeso, y que la mochila sobrecargada también cuente** (dueño, 2026-11-22: «revisar el sobrepeso y evaluar que
  la mochila sobrecargada también se sume al de sobrepeso»). Hoy la mochila llena se mide por ranuras y el peso solo cuenta lo equipado (P262).
  Contarle cómo está el sobrepeso hoy (qué lo dispara, qué hace) y proponer cómo sumar la mochila pasada de ranuras; programar lo que elija.
- **⬜ en cola — 🛡 Probar: el aviso del Aguante de trinchera en GM Tools** (2026-11-22, de la tarea «Aguante de trinchera con cualquier daño»): un
  creep con la pasiva, recibir daño desde el cuadro de daño de GM Tools y ver que el aviso dice que el Aguante se suma a mano (P283).
- **⬜ en cola — 🛡 Probar: el Aguante de trinchera con el escudo elemental y el rayo en cadena** (2026-11-22, misma tarea): no tienen que sumarlo
  (son directos); se revisó el código y se probó solo con el Terreno incendiado.

- **⬜ en cola — 🏷 Conversación de diseño: etiquetas y filtros para las pasivas** (dueño, 2026-11-22: «que las habilidades pasivas tengan tags y
  filtros. Por ejemplo, Aguante de trinchera es buena para warrior y para tanque y para melee en general, entonces pueden estar esos tags. Buscar
  cierto universo de tags para poder crear filtros a la hora de elegir pasivas»). Hoy `etiquetas` sueltas (ofensiva, defensiva, stat, utilidad,
  resistencia, regeneración, visión, percepción, racial). Preparar una propuesta (rol: warrior, tanque, liviano, rango, mago, support, debuffer;
  estilo: cuerpo a cuerpo, distancia, mágico; función: daño, defensa, movilidad, control, curación, sigilo…) y los filtros del catálogo de
  «+ Pasiva»; conversarlo con el dueño antes de programar.

- **⬜ en cola — 🛡 Revisar el caso raro: arma que perfora contra la Defensa especial con Aguante de trinchera** (dueño, 2026-11-22: «revisar
  ese caso raro de la perforación y defensa especial»; P283, punto 2): hoy el Aguante se resta después de lo que «pasa siempre» por Perfora, así
  que puede frenar parte de eso. Explicarle el caso con números y proponer.

- **⬜ en cola — Probar: ⬆ Subir al catálogo un consumible propio** (2026-11-22, de los consumibles a mano): no se probó con clics para no
  sumar un ítem de prueba a la biblioteca compartida. Ver que suba con su «✋ A mano» y que, tomado del catálogo, se consuma igual.

- **⬜ en cola — Probar: un consumible propio en el editor del catálogo (`datos/catalogo-editor.html`)** (2026-11-22): no se abrió; ver que se
  guarde como consumible con su marca ✋.

- **⬜ en cola — 🎒 Aviso equivocado al pasar al cinturón** (visto en la tarea de consumibles propios, 2026-11-22): al mover 1 unidad con
  «→ Cinturón», el aviso dice «el cinturón está lleno (1/5)» aunque no lo está. Revisar y corregir el texto.
- **⬜ en cola — 🤝 Revisar el botón «Dar un ítem» del «⋯» del token** (visto en la misma tarea): con un clic el ayudante no encontró el botón y
  abrió la ventana por función. Ver si el botón está y se puede tocar (se cruza con el cambio de 🎁 a 🤝).

- **⬜ en cola — 🎲 Consumible propio con una tirada opcional** (dueño, 2026-11-22, P284: «no estaría mal agregarle como opción tirar un dado»):
  en el asistente, un campo opcional «Tirada al consumirlo» (por ejemplo 1d6, 2d4+1); al consumirlo se tira sola y sale en la Mesa junto al
  «✋ a mano». Sin tirada, como ahora.

- **⬜ en cola (al final, a propósito) — ✉ Probar los mensajes secretos en el mapa, con clics, con las reglas de Firebase pegadas** (dueño,
  2026-11-22: «vamos a dejar al final de la cola probar este sistema en el mapa con los clics una vez que estén pegadas las reglas de Firebase…
  cuando llegue el turno de esa tarea, vamos a chequear que las reglas estén actualizadas y vamos a proceder con las pruebas»). Primer paso:
  verificar que las reglas pegadas sean las del repo (que mandar un mensaje no dé «faltan pegar las reglas»); si no, avisarle al dueño y esperar.
  Los casos, uno por renglón, son los «Probar: 🕊️ …» de abajo.

- **⬜ en cola — Probar: 🕊️ mandar un mensaje secreto de verdad** (2026-11-22, de los mensajes secretos; con las reglas pegadas): el Jugador 1 le
  manda al Jugador 2 con la ventanita; al Jugador 2 le aparece en la Mesa (fila fucsia), en la Crónica del mapa y en el 🕊️ con el globito.
- **⬜ en cola — Probar: 🕊️ el GM no lee lo de dos jugadores** (2026-11-22, con las reglas pegadas): el Jugador 1 le escribe al Jugador 2; en la
  pantalla del GM no aparece nada (ni Mesa, ni Crónica, ni 🕊️), y una lectura directa del GM por la API la rechaza.
- **⬜ en cola — Probar: 🕊️ un mensaje a varios** (2026-11-22, con las reglas pegadas): el GM le escribe a los dos jugadores a la vez; cada uno lo ve
  con «También para…» y su respuesta le llega solo al GM.
- **⬜ en cola — Probar: 🕊️ el comando /m y /r de verdad** (2026-11-22, con las reglas pegadas): `/m Blanco J2 hola` (por el personaje) y `/r` + el
  nombre del usuario; que salga, que no aparezca en la Mesa de nadie más y que `/m Nombre` sin texto abra la ventanita con esa persona marcada.
- **⬜ en cola — Probar: 🕊️ leído / sin leer en dos pantallas** (2026-11-22, con las reglas pegadas): el Jugador 2 con el mapa y la ficha abiertos;
  al abrir la conversación en una, el globito baja en las dos.
- **⬜ en cola — Probar: 🕊️ el GM borra con el 🗑 de la Mesa y con 🆕 Registro nuevo** (2026-11-22, con las reglas pegadas): que desaparezcan de la
  Mesa y de las conversaciones de los jugadores (el 🗑, todos; el Registro nuevo, los de antes del combate anterior).
- **⬜ en cola — Probar: 🕊️ «Borrar la partida» se lleva los mensajes** (2026-11-22, con las reglas pegadas): en una partida de prueba descartable.

- **⬜ en cola — 🕊️ Ajustes de los mensajes secretos (P285)** (dueño, 2026-11-22):
  1. **Mensaje público:** «que también exista la posibilidad de mandar un mensaje público» (a toda la mesa; que se vea distinto de una tirada).
  2. **`/r` responde al último que me escribió**, sin poner el nombre («me gusta la sugerencia»); `/m` sigue con el nombre.
  3. **La paloma flotante, siempre a la vista y la ruta principal** para abrir los mensajes («más que la Mesa; de última que sean ambas»):
     que se vea aunque no haya mensajes.
  (Respondido además: se borran con el 🗑 y con «Registro nuevo», bien; paloma en todos lados, bien; sin «responder a todos».)
- **⬜ en cola — Probar: 📖 glosario en «Ver detalle» de una zona con daño** (2026-11-22): el Muro de fuego (o una zona con daño de elemento) en el
  mapa: que se marquen Defensa, Defensa especial y la resistencia al elemento en «Qué frena el daño», y Suela gruesa si es del piso.
- **⬜ en cola — Probar: 📖 glosario en «Ver detalle» de un estandarte y de una nube** (2026-11-22): el Estandarte de guerra (PdG / Probabilidad de
  Golpe) y la nube de una Bomba de humo o de la varita.

- **⬜ en cola — 📖 Revisar en contexto: «Silencio» en el nombre del tótem y el glosario** (dueño, 2026-11-22: «la observación de que marcaba
  silencio como un estado la pondría para revisar al final, porque técnicamente el silencio es un estado, pero lo revisamos en contexto más
  tarde»). Hoy, en «Ver detalle», las filas de nombres («De quién es», «Con qué se puso») no se marcan, así que «Tótem de silencio» no muestra
  el globo del estado Silencio. Mostrarle el caso y decidir juntos.
- **⬜ en cola — Probar: 🙈 golpe a un personaje escondido que NO lo delata, visto desde el GM** (2026-11-22, P263): un área de un creep sin daño
  (o con daño menor que su Sigilo) contra un personaje en sigilo; que el GM no vea nada aunque le pegue. En la prueba, la Nova arcana siempre lo delató.
- **⬜ en cola — Probar: 🙈 área contra un escondido con línea, cono, área con centro y con dodge roll** (2026-11-22, P263): solo se probaron ondas
  (Shockwave, Nova arcana). Mirar la Lanza arcana (chispas solo sobre los que se ven), un cono y un área con dodge roll (el escondido se mueve solo
  en su pantalla).
- **⬜ en cola — Probar: 🙈 el GM con 👁 Revelar lo oculto ve el duelo de un personaje escondido y lo resuelve a mano** (2026-11-22, P263).
- **⬜ en cola — Probar: 🙈 la Mesa de la ficha suelta y de GM Tools con un duelo escondido** (2026-11-22, P263): solo con pruebas automáticas.
- **⬜ en cola — Probar: 🙈 el vencimiento de 40 s con un personaje escondido, con el código nuevo en la pantalla del GM** (2026-11-22, P263): se
  probó con la pantalla del GM todavía con el código de antes (tiró la Evasión de J2, aceptó el daño y aplicó el Empujón solo); con el código
  nuevo solo se probó con el creep.

- **⬜ en cola — 🥷 Aviso al escondido cuando el daño no alcanza para delatarlo** (dueño, 2026-11-23): «si a un personaje escondido se le hace
  daño que no alcanza para revelarlo, al usuario le tiene que aparecer: te hicieron tanto de daño, pero no alcanzó tu nivel de sigilo, por lo cual
  seguís escondido, o algo por el estilo». A quien maneja al escondido (jugador o GM por un creep), solo a él. Ver también P288.

- **⬜ en cola (al final, conversación) — ☁ Definir las nubes que tapan la vista** (dueño, 2026-11-23: «yo por niebla pensaba que era tipo una nube
  que se ponía en el territorio… la polvareda o algo así… Todo lo que son nubes, por ejemplo la Polvareda de la rata, quiero saber más o menos cómo
  funcionarían esas cosas que ocultan la vista. No tengo bien claro las reglas de esa parte»). Explicarle cómo funcionan hoy las nubes (Polvareda,
  Bomba de humo, varita de niebla, virote de humo, zonas con nube: qué tapan, quién ve adentro, cuánto duran, el viento) y las preguntas para
  decidir; P264 (el creep que actúa desde una nube) va con esto. La niebla de guerra del mapa ya se le explicó aparte.

- **⬜ en cola — Probar: 📺 la tele con el Portal cósmico** (2026-11-23): el Portal trampa de un creep donde quien la puso elige adónde manda, y el
  caso en que lo mueve otra pantalla (un jugador mandando a un creep: paso «portal-mover»). Solo se probó el Glifo (destino fijo), que usa la misma
  función.
- **⬜ en cola — Probar: 📺 la tele con la Trampa de teleport de Terreno y Formas** (2026-11-23): no se pudo crear: las reglas de Firestore no dejan
  crear un elemento con `trampaDestino` (está validado, pero falta en la lista de campos permitidos de `elementoValido`; el ⚙ sí lo deja cambiar).
  Arreglarlo es sumar el campo a esa lista y pegar las reglas. Los portales de Invocar portal usan la misma función y sí se probaron.
- **⬜ en cola — Probar: 📺 la tele de un teletransporte con un token oculto, en sigilo o en la niebla, y con «reducir movimiento»** (2026-11-23): por
  código, una pantalla que no ve el token no dibuja la tele (como el Parpadeo) y con «reducir movimiento» salta sin animación; no se probó en el mapa.

- **⬜ en cola — 🔒 Arreglar las reglas: la Trampa de teleport de Terreno y Formas no se puede crear** (visto en la tarea de la tele,
  2026-11-23): `trampaDestino` está validado pero falta en la lista de campos que se pueden crear de `elementoValido` (firebase/firestore.rules),
  así que crearla da error de permisos. Sumarlo, avisarle al dueño que pegue las reglas, y probar crearla y pisarla con la tele.

- **⬜ en cola (al final, conversación) — 🏃 Un creep que se va por un Town portal no cuenta como escapado** (dueño, 2026-11-23, visto en la
  última partida: «un creep usó un town portal, se fue del mapa y a la hora de calcular el botín no lo tomó como escapado… repasar ese caso y
  discutir cómo resolverlo. En principio se me ocurre que cuando un creep hace blink out, le aparezca al GM qué hacer con la experiencia o algo
  así»). Revisar cómo «Batalla terminada» decide quién escapó, contarle el caso y conversar la solución antes de programar.

- **⬜ en cola — Probar: 🙈 inicio de turno de un escondido con 👁 Revelar lo oculto** (2026-11-23): por código, con el 👁 prendido el GM ve la
  tarjeta, «▶ Aplicar por él» y el reporte de la Mesa de un personaje escondido; no se probó en el mapa (prender el 👁 avisa a todos).
- **⬜ en cola — Probar: 🙈 escondido y ▶ Iniciar combate / ⏬ Demorar / ⟳ Pasar de ronda / ↩ fin del turno libre** (2026-11-23): las cuatro
  tarjetas usan la misma regla (a los que lo ven, con su nombre; a los rivales, la de siempre sin él); solo se probó con ▶ Siguiente.
- **⬜ en cola — Probar: 🙈 el fin de turno de un escondido con algo que contar** (2026-11-23): si al terminar su turno le pasa algo (un estado
  que vence), va en su propia tarjeta, solo para los que lo ven; en la prueba no hubo líneas de fin de turno.
- **⬜ en cola — Probar: 🙈 una zona de «al empezar su turno» (Muro de fuego) bajo un escondido, y el cartel flotante de inmunidad** (2026-11-23):
  no se tocaron (la zona la resuelve quien lo maneja; el cartel flotante ya no sale en una pantalla que no ve el token, P263); no se probaron
  con un escondido al empezar su turno.
- **⬜ en cola — Probar: 🎲 una invocación o un refuerzo que entra solo al orden de turnos, y ⏭ Pasar de ronda con un tótem en un orden viejo**
  (2026-11-23): por código, la invocación nueva y el refuerzo pasan por la misma regla (`iniciativaOcupaLugar`) y Pasar de ronda no le hace pasar el
  turno a un tótem o estandarte; no se probaron en el mapa (hoy ninguna invocación ni refuerzo es un objeto inerte: es solo la red de seguridad).

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
