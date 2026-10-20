# Pruebas pendientes en el mapa

> Protocolo del dueño (2026-10-09): lo que pide probar **en el mapa**, si no se puede (Claude in Chrome desconectado, falta una de las dos cuentas
> y él no está para habilitarlas), **no se prueba «por detrás»** (funciones a mano, datos simulados): se anota acá y se prueba en el mapa apenas
> se pueda. La prueba de Claude, con capturas, es un **filtro intermedio**: no reemplaza la del dueño, pero lo visual detecta errores que las
> pruebas automáticas no (un botón que no se ve, un cartel tapado…).
>
> Cómo: partida «Claude · pruebas» (`?partida=YWjRbx7eJlqQpL1wtCKH`), las dos cuentas de Chrome (jugador y GM), la Botonera nueva del mapa y
> capturas. Al probar algo: pasarlo a «Probado» con fecha, qué se vio y si hubo que arreglar algo.

## Pendientes
- [x] **🔥 Llama de Fénix** — probado en el mapa el 2026-10-20: Aurelia tomó el elixir desde su Botonera; un golpe de 100 del GM la levantó en el mismo golpe con toda la vida (50) y el SP lleno, Titilando, con el cartel «renace de sus cenizas»; un creep con la llama, igual (5/5).
- [x] **🧪 Escudos de poción** — probado en el mapa el 2026-10-20: Aurelia tomó la Poción de Cuero Duro (15); un golpe físico de 8 del GM lo absorbió entero (escudo 15 → 7, vida 50) y uno especial de 6 fue a la vida (50 → 44).
- [x] **😵 Mareo de invocación nuevo** (2026-10-20): probado en «Test con claude elsaulo» con el Lobo de Silvia: entra al final del orden con el
  Mareo y sus No2 enteros; en su turno, Atacar muestra «recién llega: está mareada» (con «Hacerlo igual»); Esquivar pasa; al empezar su segundo
  turno el Mareo se va y ataca normal. Se arregló en la prueba: el mapa no lo reconocía (lo publicado no traía la marca). **El dodge roll, probado
  el mismo día**: el Lobo mareado ganó la Evasión de un área del creep, se arrastró 2 casillas fuera y el duelo cerró «esquivó». Se arregló en la
  prueba: el mapa tomaba ese arrastre como una acción del turno (lo frenaba el Mareo, y podía pedir Confusión o avisar «fuera de turno»).
- [x] **🏹 Un creep dispara su flecha especial** (2026-10-20): con arco y la Flecha marcadora en el cinturón, Atacar pregunta «¿Qué flecha?»; la
  elegida va al duelo (declarada), se gasta del cinturón (el Antídoto queda) y, si erra, queda en el piso. Ojo: si después muere, la flecha
  aparece también en el botín (usada, tildada): el GM la saca en el paso Consumibles.
- [x] **🛡 Blindado en un duelo real** (2026-10-20): Silvia con Blindado, el creep con PdG 21 contra Evasión 3 → «CRÍTICO ANULADO» y entra como un
  golpe normal. Se arregló en la prueba: con las tiradas escritas a mano (✍) se perdía el Blindado (y la Resistencia a crítico), y el cartel decía
  «Evasión está Blindado» en vez del nombre.
- [x] **⏸ El cartel de la pausa abajo a la izquierda** (2026-10-20): probado con una pausa de verdad en «Test con claude elsaulo»: el GM y la
  jugadora lo ven abajo a la izquierda, sin tapar la barra de arriba; al reanudar se va.
- [x] **🎲 El consumible al azar en un fin de combate real** (2026-10-19; regla nueva 2026-10-20: todos van al botín, los usados tildados y los
  no usados destildados). **Probado el 2026-10-20** en «Test con claude elsaulo»: un creep jefe humano con tres al azar (pergamino, aguja,
  flecha) usó el pergamino desde sus Acciones en combate; derrotado, el paso Consumibles mostró el pergamino tildado («lo usó») y los otros dos
  destildados («no lo usó»). Cerrado sin publicar; el creep, restaurado.
- [x] **👁 El Ojo de Kicillof etéreo** (2026-10-20): invocado dentro del Rango y a la vista (fuera de rango o donde no ve, no deja). En combate,
  arrastrado por encima de una trampa y dentro de una zona, al lado de un creep: la trampa no se disparó, la zona no le hizo nada, nadie le pegó
  de oportunidad; pagó 4 No2 por 4 casillas.
- [x] **👻 El estado Etéreo** (2026-10-20): Silvia con Etéreo, en combate: el creep, al atacar, no la resalta y al hacerle clic «👁 Es etéreo: no se
  le puede hacer nada» (sí resalta a Xeena); Silvia, al tocar Atacar en su Botonera, «Silvia Suller está etéreo · Solo puede observar» con
  «Entendido» y «Hacerlo igual».
- [x] **🃏 Wildcards en el duelo y en el mapa de un jugador** (2026-10-15): desde una cuenta de jugador con wildcards, (1) la cartita 🃏 arriba, en la
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el creep le pega a Aurelia (desde la cuenta de «Sujeto de pruebas»): Evasión 1 → crítico; «🃏 Wildcard · volver a tirar Evasión» → el duelo vuelve a la defensa, la carta baja de 2 a 1, la nueva Evasión (4) deja el golpe sin crítico. **Arreglado:** la Mesa decía «usó una Moneda Re-Roll» aunque fuera la carta.
  fila de los lentes, girando; (2) en un duelo, después de tirar PdG/Evasión, aparecen «🃏 Wildcard» y «🪙 Moneda» lado a lado (o solo la carta) y
  reabrir con la carta descuenta 1. (Probado ya: el descanso del GM y la ventana de la ficha, ver «Probado».)
  **2026-10-19, desde la jugadora «Sujeto de pruebas» (el otro perfil de Chrome):** (1) visto: la 🃏 con su 2 arriba. Además, visto desde la
  jugadora: **la columna «Podés usar» del duelo** (Polilla, wildcard y moneda al costado del cuadro, por encima, con su texto al pasar el mouse) y
  **el anuncio del descanso** («Día 7: descansaste», al entrar, para Aurelia). Falta (2): reabrir una tirada con la carta dentro del duelo.
- [x] **Trampa de red del Goblin trampero con alcance 3** (2026-10-15): en una partida de prueba, un creep con una trampa ✨ con `trampaColocar.alcance: 3` → al
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el Goblin trampero ya no está en El origen; se armó la misma trampa en el creep de prueba. A 5 casillas avisa «la trampa llega hasta 3» y la coloca igual; oculta; Silvia la pisa: Anuncio «Inmovilizado (3 turnos)» → «¡CAYÓ EN LA TRAMPA!»; en la Botonera «🔓 Soltarse · Fuerza contra 5 · 1 No2» (sin No2 pregunta y deja seguir; 4 contra 5: sigue atrapada). **Arreglado:** el aviso de alcance lo tapaba enseguida el de «trampa colocada»; ahora van juntos.
  elegir una casilla a 4+ avisa «la trampa llega hasta 3»; la red se coloca oculta; un personaje que la pisa queda Inmovilizado y le aparece 🔓 Soltarse · Fuerza
  contra 5 · 1 No2. (El cambio de código es solo el aviso: js/13 `trampaAvisarAlcance`.)
- [ ] **🔎 Escanear grupo → 🤖 Proponer creeps** (2026-10-09): la respuesta de la IA (usa la clave de OpenRouter del dueño).
- [ ] **📖 El glosario con globos** (2026-10-09, lo ve el dueño): en la tienda, el catálogo, la mochila y el «Ver» de un ítem, los términos (estados,
  bonos de piezas, mecánicas de armas y flechas) salen subrayados en celeste y al pasar el mouse muestran su explicación; «Detalles técnicos» ya no
  repite eso. Mirar si sobra o falta algún término, y si algún texto del globo conviene reescribirlo.
- [ ] **🏹 Talabartería: las 4 flechas elementales siempre en la góndola** (2026-10-11): no se pudo ver en el mapa — la tienda abierta
  («Tienda de pueblito») es anterior al cambio y su Talabartería no trae flechas. Hace falta generar una tienda nueva en el Generador de
  tiendas y mirarla desde el 🏪 del mapa (y que no salga la Flecha de punta roma).
- [ ] **🎯 Virote recuperable**: ninguna ballesta del catálogo trae el rasgo `recuperable`, así que no hay con qué probarlo en el mapa.
- [x] **🐺 Una invocación que recibe un rebote** (2026-10-12): el Virote de rebote rebotó hacia el Lobo de prueba (invocación de Clementino) y el
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** con el Lobo invocado, el Virote de rebote erró contra Silvia y rebotó hacia el Lobo: le llegaron sus opciones de defensa (Evasión 1d1) y el duelo terminó normal; el virote quedó en el piso. **Arreglado:** la Mesa decía «La Virote de rebote»; ahora «El virote» y «entero».
  duelo dijo «No llegaron tus opciones de defensa». Puede ser porque el Lobo está sin invocar; revisarlo con una invocación invocada.

- [ ] **⏩ Acelerador desde Firebase** (2026-10-12): hasta que el dueño pegue las reglas nuevas (`acelerador` en los elementos), crear uno da «faltan
  publicar las reglas nuevas» (se probó: cobra 1 SP y 1 No2 y pide la casilla, pero no se guarda). Después de pegarlas: ejecutar Acelerador (o usar
  una Runa aceleradora del Bazar), elegir la casilla y que los demás la vean.
- [ ] **🐈‍⬛ La animación «mala» de los dados de Enyetar** (2026-10-12): los datos salen bien (los dos juegos, `destacar: 'malo:idx:…'`), pero no se
  pudo ver la animación 3D (la ventana de Chrome estaba de fondo). Mirarla en una sesión real.

- [x] **✨ Carga Elemental** (Mago, 2026-10-13): un personaje con la skill lanza una skill de daño especial → «Carga Elemental» con los 5
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Silvia con Toque mágico contra el creep: Frío (12 → Escarcha ×3), Fuego (18 +50 % = 27), Ácido (13 → Armadura rota ×3), Tóxico (16 → Veneno ×5); cada estado quedó puesto en el creep.
  elementos y «Sin carga»; cobra la mitad del SP; Fuego (+50 % en el cuadro), Frío (Escarcha ×N según lo que entró), Ácido (Armadura rota),
  Tóxico (Veneno), Eléctrico (salta y 20 % de Parálisis solo al primero).
  **Probado en parte (2026-10-13, GM + jugador elsaulo):** la pregunta con los 5 elementos y «Sin carga» ✔; Eléctrico ✔ (Toque mágico, 28 al
  Escarabajo, saltó al Coloso con 14 → 41 → 27; Parálisis 20 % tirada en el cuadro, salió 8: no). Frío: el daño entró pero la Escarcha no — la
  aplicó otra pantalla del GM con código viejo (los mapas abiertos del dueño); en la pestaña recargada, 6 de hielo → Escarcha ×2 ✔. **Falta,
  con todos los mapas recargados:** Frío, Fuego, Ácido y Tóxico de punta a punta.
- [x] **⚡ Salto eléctrico, regla general** (2026-10-13): 4 casillas; la mitad de lo que entró; cada salto resta la Res. eléctrica; sin tope
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Varita de chispa eléctrica contra Silvia: saltó a 3 más (la varita dice 2 saltos: no hay tope), cada uno la mitad de lo que le entró al anterior (Lobo 6, Xeena 3, Aurelia 1) y cortó al llegar a 1.
  (la varita de chispa, el relámpago, la flecha de tormenta, la trampa Descarga y el ⚡ del menú de vida).
- [x] **🕳 Bajo tierra, lo que falta** (2026-10-14): un crítico de la Puñalada (Rengo 2 y Lisiado 1). El pozo visto como jugador ya se vio (con
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** el creep con Excavar y la Puñalada desde abajo del Kobold tunelero: se mete en la tierra, sale al lado de Silvia (+3 PdG por salir de abajo); con crítico, los efectos pasan a Rengo 2 turnos y Lisiado 1 turno (en vez del Rengo 1).
  «👁 Ver como jugador», abajo, en Probado).
## Probado
- [x] **🔮 Los ocho talismanes que faltaban** (2026-10-18, «Test con claude elsaulo», con capturas): **Piedra bezoar** (Veneno ×3 → ×2 en la
  ficha; ojo: el cuadro del duelo sigue diciendo «le llegó Veneno ×3», porque lo baja la ficha al recibirlo), **Bola de cristal** (un creep en
  sigilo a la vista → el paso «🔮 Bola de cristal» en «Empieza tu turno»), **Sahumerio** (1d4 → 4 se llevó Pajaritos; **arreglado**: el cartel
  mostraba una tirada y al aplicar se tiraba otra; ahora el azar queda fijo por turno, y el estado dice «se lo llevó el humo»), **Brújula**
  («−0 No2 (1 casillero gratis)»), **Muñeco vudú** en un creep (Debilitado 1 turno; con 0 de daño no salta, a propósito), **Orbe de resguardo**
  (Vida extra 2 al ganar el PdG.Esp), **Anillo de tormenta** (el rayo saltó a 5 casillas) y **Ekeko** (+20 %; **arreglado**: daba 9,6 DDE, ahora
  entero y para arriba).
- [x] **🩸 Maldito** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): con Maldito y una habilidad de 2 SP, «Ejecutar» →
  «Estás Maldito: usar Chispa de prueba cuesta 2 SP y te va a bajar 2 de vida (5 → 3)»; Cancelar no cobró nada; Aceptar: vida 5 → 3, SP 3 → 1 y
  en la Mesa «🩸 Maldito: pagar 2 SP (Chispa de prueba) te sacó 2 de vida (5 → 3)». Mapa limpio después.
- [x] **▶ Empieza tu turno** (2026-10-17, «Test con claude elsaulo»): Xeena con Bendecido (2 turnos), Regeneración (pasiva) y 1 de vida. Al
  pasarle el turno: sin el control, el GM vio «▶ Aplicar por él» en la Crónica y al tocarlo se aplicó (Bendecido 2 → 1, +3 HP, 1 → 4); con 🎮 el
  control, el cartel al centro «Empieza tu turno» (Tus estados · Vida y SP · No2) → «✔ Aplicar» → «✔ YA SE APLICÓ»; cerrándolo sin aplicar y
  pasando el turno, se aplicó solo («✔ Se aplicó solo al pasar el turno»). Mapa limpio después.
- [x] **💔 Duelo: «Aplicar el daño»** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): el Creep de prueba le pegó
  (empate resuelto con par) y tiró 2d8+1 = 6: el paso 5 quedó en «6 de daño, menos tu Defensa» con «💔 Aplicar el daño» y la vida sin tocar; al
  tocarlo: «6 de daño (6 − Defensa 0) · Xeena: 5 → 0 HP». Falta: la variante del GM «Aplicar por …» con un personaje de otra cuenta.
- [x] **💥 Trampa que explota** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): una trampa en flor con «Explota»: al
  pisarla, las 7 casillas se encendieron con la onda y el mapa quedó quieto; 1,5 s después, el anuncio («🎲 Tirar el daño», «💔 Aplicar el daño (3)»,
  «Entendido»). Captura de la explosión en la conversación. Falta: verlo el dueño y un jugador desde su cuenta (pendientes, 🖥).
- [x] **💔 Trampas: el daño en dos pasos** (2026-10-17, «Test con claude elsaulo», GM con 🎮 el control de Xeena): al pisar una trampa de 1d6,
  «🎲 Tirar el daño (1d6)» → «1d6 = 4» y el paso «Aplicar el daño: 4 de daño, menos su Defensa. ⚙ Al tocar el botón se descuenta solo…» →
  «💔 Aplicar el daño (4)» → «4 − Defensa 0 → 4 de daño · ✔ ya se descontó de la vida (5 → 1)» → «¡CAYÓ EN LA TRAMPA!». Mapa limpio después.
- [x] **🕊 Vuela como pasiva: trampas y zonas del piso** (2026-10-17, «Test con claude elsaulo», GM): con la pasiva Vuela, un creep cruzó una
  zona de púas del piso (de un personaje) y un personaje (Xeena, con 🎮 el control) cruzó una trampa escondida del GM: ni la trampa se disparó
  ni las púas pegaron, sin cartel de «pisaste algo». Contraprueba sin la pasiva: al creep las púas le sacaron 3; a Xeena la trampa la frenó y le
  pegó 1d6. Mapa limpio después (sin trampa, sin zona, control devuelto, modo narrativo).
- [x] **🕊 Vuela** (2026-10-16, «Test con claude elsaulo», GM): un creep con Vuela cruzó por encima de Silvia Suller: se frenó al lado con
  «⚔ … pasa por encima de Silvia Suller · ¿Ataque de oportunidad?», al dejarlo pasar siguió hasta el destino sin un segundo ataque; con un
  rival sin No2 (Sandro) no se ofrece. Falta verlo desde la cuenta de un jugador (las abejas de Bizzante).
- [x] **¡Tu vieeeja! (provocación de creep) y Tapa de barril** (2026-10-16, Kobold escudero de barril de El origen; no se prueba ahí, hace falta una copia en una partida de prueba): que la Botonera resalte a 3 casilleros, tire Fuerza contra Res.Esp y ponga Provocado 2 turnos; que la Tapa sume +3 Defensa, +3 Armadura mágica y +1 de resistencia a crítico por 1 turno.
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** copiadas del Kobold escudero de barril (El origen, solo lectura) al creep de prueba. ¡Tu vieeeja!: resalta solo a los que están a 3 o menos (Xeena a 3, Silvia a 2; Aurelia a 6 no), Fuerza contra Res.Esp, Provocado 2 turnos en la ficha de Silvia. Tapa de barril: Defensa 0 → 3, Defensa especial 0 → 3, resistencia a crítico +1 en los cinco Tipos, 1 turno, 1 No2 y cooldown 2.
- [x] **📣 Llamar refuerzos** (2026-10-16, «Test con claude elsaulo», GM): una copia de la Rata de alcantarilla con «Plaga en la galería»
  (`refuerzos: {cant: 2}`) → Acciones → Ejecutar: cobra 2 No2 y el cooldown, la Mesa la anuncia, aparece «elegí dónde aparece (1 de 2)», dos
  clics → dos «Rata de prueba (refuerzo)» en esas casillas, 30/30, No2 llenos, sin la Plaga, en el orden de turnos detrás de la que chilló.
  Todo borrado al terminar. **Falta**: el editor de creeps no tiene todavía un campo para armar `refuerzos` (se carga el dato).
- [x] **⏸ Mapa en pausa: mirar sí, tocar no** (2026-10-16, El origen, pantalla del GM en modo jugador solo en el navegador, sin guardar nada):
  arrastrar mueve la vista, la rueda hace zoom (1 → 1,76). Después (dueño: «ver lo mismo que durante una partida»): tocar un token sí lo
  selecciona y abre su menú (vida, No2, estados, ⋯, la tarjeta 🪪 de un creep), pero sin ↻ girar, sin ⚡ Botonera y con los números sin
  poder cambiarse. **Falta**: verlo con una cuenta de jugador de verdad. (🃏 La carta de arriba con el número, probada igual, local.)
- [x] **🃏 Wildcards: descanso y ventana** (2026-10-16, «Test con claude elsaulo», GM con el control de Silvia Suller): ⏳ Pasar de día → «¿Cómo
  descansaron?» → 🌙 Descanso reparador: Silvia queda con 2 wildcards (la Mesa lo dice); en su ficha suelta la cartita «Wildcards ×2» abajo a
  la izquierda; tirar Fuerza (1) → la carta → «🃏 Wildcard»: re-roll 4, quedan 1, la original «ya se repitió». La partida quedó en el Día 1.
- [x] **▶ Es su turno (clic derecho en la iniciativa)** (2026-10-15, «Test con claude elsaulo», GM, con Xeena / Aurelia / Silvia de prueba):
  le tocaba a Xeena; clic derecho en Silvia → *Turno libre*: le toca a Silvia (⚡ arriba), no pasa el turno; «↩ Volver a Xeena» lo devuelve sin
  tocar nada. Clic derecho en Silvia → *Turno normal*: termina el de Xeena, empieza el de Silvia («se lo dio el GM»), el contador de turnos
  sube. Orden de turnos vaciado al terminar. **Falta**: en un combate real con creeps (que bajen los cooldowns en el normal y no en el libre).
- [x] **«＋ Demora» y el primer «Editar» desde las Acciones** (2026-10-15, El origen, GM, sin combate): Acciones del Goblin hondero (2) →
  Lluvia de piedras → Ver → ✎ Editar: abre al frente al primer clic (antes quedaba arriba, fuera de la vista) y sin el cartel de la pausa
  encima; Costo → «Un número» 5; Ejecución → Efectos: quitar la Demora y volver a ponerla con «＋ Demora» (tarjeta «baja un lugar en el
  orden de turnos», sin turnos ni bonos); guardado: 5 No2 · 2d6 · Demora. **Falta**: verla aplicarse en un combate real.
- [x] **✨ El editor de la Ejecución como el cuadro del duelo** (2026-10-15, Claude · pruebas, GM): Acciones de «Bosque (prueba)» → Ver → ✎ Editar →
  Ejecución: se abre el cuadro del duelo (Declaración, Contacto con «Pagar y tirar PdG» y «Elegí cómo te defendés», Bloqueo, Crítico, Daño,
  Efectos) con el 📜 a la izquierda; tocar «Tirar el daño» abre lo suyo debajo. Cerrado sin guardar. (Antes, «Editar» desde las Acciones no
  abría nada: arreglado.) **Falta**: que el dueño edite una de verdad y la ejecute.
- [x] **🗡 Ataque por la espalda, 👣 Pasos silenciosos y ↻ darse vuelta** (2026-10-15, Claude · pruebas, GM rolpintoista): «Bosque (prueba)» a
  la espalda de Clementino → el duelo declara «🗡 por la espalda: +1 PdG» y el PdG sale «1d12 +1 espalda → 5 + 1 = 6» (duelo cancelado, «No cuenta»).
  Con la pasiva «Pasos silenciosos» puesta desde GM Tools (+ Pasiva): el bono pasa a +2 y la tarjeta pública la publica; con «👁 Ver como jugador»
  pegado a Clementino se lo ve y a 2 casilleros por la espalda no (queda el «?»). Sin la pasiva, en combate y con el GM con 🎮 el control de
  Clementino: alejarlo y volver a acercarlo por la espalda → «Pasos a tu espalda… ¿Se da vuelta?» → «↻ Darse vuelta» giró a Clementino hacia él
  y la Crónica dijo «↻ Clementino oyó a Bosque (prueba) y se dio vuelta»; con Bosque pegado al frente, la Bruja llegando por atrás → «¡Flanqueado!».
  Control devuelto y modo narrativo. **Falta**: verlo desde la cuenta de un jugador (la oferta le sale a su pantalla, la misma pieza).
  Visto de paso (aparte): al cancelar el duelo «No cuenta», un creep que había atacado sin No2 suficientes (pagó 3 de 4) recibió de vuelta 4.
- [x] **📜 «Detalles técnicos» aparte en el recuadro del duelo** (2026-10-15, Claude · pruebas): Flecha a la rodilla de «Bosque (prueba)» →
  el recuadro dice solo «Le apunta a las piernas.» y «▸ Detalles técnicos» despliega «⚙ Automatizado… ✋ A mano…». El «FLASH» con su globo
  (Sonic Boom de Clementino) lo está mirando el dueño.
- [x] **👂 El oído (punto ciego)** (2026-10-15, Claude · pruebas, GM con «👁 Ver como jugador»): «Bosque (prueba)» a 4 casilleros por la espalda
  de juan → los jugadores no lo ven; a 2 → aparece (atenuado, porque la casilla sigue en penumbra: oírlo no descubre el terreno). El Ladrón en
  sigilo, pegado a juan, sigue sin verse. Falta probar los pasos silenciosos cuando exista algo que los dé (P200).
- [x] **📜 El texto de la habilidad en el duelo, ✍ Elegir manualmente y 💨 Prisa** (2026-10-15, Claude · pruebas, GM con «Bosque (prueba)»):
  la pasiva Prisa puesta desde GM Tools (+ Pasiva) → al ordenar los turnos, Bosque (1) quedó arriba de juan (2). Flecha a la rodilla → el duelo
  muestra a la izquierda «📜 Flecha a la rodilla» con su texto, y se va al cerrar. ✍ en la defensa: «2» a mano → la Mesa dice «Evasión 2 (manual)»
  y pegó; ✍ en el daño: «1» con «no resta» → «✍ sin restar Defensa: 1» y «1 − Defensa 0». **Falta**: el recuadro en el editor de la Ejecución
  (va a cambiar con el rediseño, ver «🖥 Para cuando el dueño está en la compu» en pendientes).
- [x] **⌨ A = Atacar, B cierra, flechas, 🔭 y el duelo cancelado** (2026-10-15, Claude · pruebas, GM con el creep «Bosque (prueba)»): A abrió
  las Acciones y apretó Atacar; el mapa se encuadró solo en el creep y los que brillan; las flechas movieron el mapa sin cancelar; «🔭 Ver mis
  objetivos» encuadró; B cerró las Acciones con juan seleccionado. Duelo: pagó y tiró el PdG (No2 8 → 7, 1 ataque) → «Cancelar duelo» →
  «¿Cuenta como un ataque hecho? Es para calcular los No2…» → «No cuenta» → No2 de vuelta a 8, 0 ataques, aviso y línea en la Mesa. Falta ver
  lo mismo con un personaje (misma pieza: el gancho de FichaDuelo).
- [x] **💤 Inactivos, 📦 Vender el baúl, el Ver de las habilidades y lo nuevo de los goblins del Bosque** (2026-10-15, Claude · pruebas):
  en el menú 👥 Personajes del mapa, ✓ al lado de cada uno → juan tachado (💤) y GM Tools lo ve afuera; «📦 Vender el baúl» (Daga + 2 Velas +
  10 DDE) → «Total 57,5 DDE → 57,5 para cada uno de Clementino» (juan inactivo, no cuenta), el baúl quedó vacío, la recompensa de Clementino
  pendiente para su ficha, el registro y la Mesa. El Ver de «Flecha a la rodilla»: «Detalle» arriba y «Detalles técnicos» aparte. Flecha a la
  rodilla (creep con arco) → pegó, Rengo aplicado y además el Envenenar 25 % del arco; ¡Azuzar! → Crítico potente al Escarabajo; ¡Por el amo! →
  Bendecido a los aliados a 3 (Escarabajo y Ladrón), de a uno.
- [x] **🌲 Bosque, combinaciones nuevas** (2026-10-14, Claude · pruebas, creep «Bosque (prueba)» con las cuatro): **No siente el dolor** → elegís
  objetivo, clic en sí mismo → Endurecido aplicado; **Aullido de la manada** → solo a los aliados a 3 (un Escarabajo y el Ladrón, de a uno), Acelerado
  1 turno, juan no; **Grilletes de sombra** → PdG.Esp 9 contra Res.Esp 1 → Inmovilizado 1 turno «le llegó a su ficha»; **Lluvia de piedras** → clic
  en el centro, PdG contra Eva, «Tirar el daño · 1d4+1 · se le resta la Defensa», 3 − 0. Ojo: con la honda (Tipo 10) cada ataque cuesta 5 No2.
- [x] **🫳 Robo en sigilo, en secreto + Marcado al perder el sigilo** (2026-10-14, GM rolpintoista + juan de elsaulo, las dos ventanas a la vista):
  ladrón en sigilo → Bolsillo ajeno → sin duelo ni Mesa; el GM ve «Robo en secreto» con su Sigilo (8, con +2); juan ve «🤨 ¿Sentiste un movimiento
  raro? juan, tirá Percepción». 1.ª vez: 9 contra 8 → «¡Lo pescaste! …» y en la Crónica «¡juan pescó a Ladrón (prueba) metiendo mano en su
  cinturón!»; el ladrón quedó sin sigilo y **Marcado 2t**. 2.ª vez: Sigilo 11, Percepción 7 → «Mmm… Puede que estés flasheando», la Vela de sebo
  pasó callada y al empezar el turno de juan le apareció «Sentís el cinturón más liviano… y te das cuenta de que te falta: Vela de sebo».
- [x] **🗡 Golpe doble del Ladrón del monte** (2026-10-14, Claude · pruebas, en el «Ladrón (prueba)»): Ejecutar → juan → el duelo dice «con
  Cuchillo · Tipo 4 · +1d4 de daño», «Los No2 de este ataque ya los cobró la habilidad»; PdG 4 contra Evasión 1 → pegó; daño «1d4 + 5 + 1d4» =
  10 − Defensa 2 = 8. Sin probar: el +2 por la espalda en sigilo.
- [x] **🫳 Robar** (2026-10-14, Claude · pruebas, GM rolpintoista + juan de elsaulo): el «Ladrón (prueba)» pegado a juan ejecuta Bolsillo
  ajeno → brillan los que están a 1 casillero → clic en juan → el cuadro «Sigilo contra Percepción» (Sigilo 1d10+1 = 5, Percepción de juan
  tirada a mano = 1) → ¡Funcionó! → «✔ Aplicar Robo sobre juan» (solo lo ve el GM) → «le robó Cepo de prueba». El Cepo quedó en el cinturón
  del ladrón, la Crónica dijo «Ladrón (prueba) le robó a juan · Se llevó: Cepo de prueba», salió el cartel «🫳 huye con lo robado» y al
  arrastrarlo 2 casilleros se cerró sin ataque de oportunidad. La ficha de juan descontó el Cepo sola (queda Púas). Arreglado en el camino: un
  segundo robo antes de que la ficha del robado guarde ya no se lleva la misma unidad (mira los avisos de robo pendientes). Con el ladrón en Sigilo, el botón dijo «Tirar Sigilo (+2 en
  sigilo) · 1d12+1» (9 contra 1) y se llevó las Púas. Sin probar: el +2 por la espalda (sin sigilo).
- [x] **⚙ Dibujos: color, sin relleno, ⭕ puntas cerradas, figura sólida** (2026-10-14, con capturas, reglas pegadas): a la pared en L se le
  cerraron las puntas desde el ⚙ (quedó un triángulo), pasó a rojo y con relleno tenue; adentro no se dibuja la grilla y sus 7 casillas
  cuentan como sólidas; «sin relleno» la deja como línea roja cortada para el GM y casi invisible como jugador. Todo se guarda.
- [x] **❄ Granizo de cristal** (2026-10-14, copia «Chamán (prueba)», con capturas): centro en juan, flor con fuego amigo → cascada de 4 con
  un solo PdG.Esp (6). Escarabajo 6 de daño → Escarcha ×1; Tunelero 6 → Escarcha ×1; juan 4 → nada; Capataz 3 → nada.
- [x] **👁 Ver como jugador** (2026-10-14, con capturas): desde el menú del ojo, el GM ve el pozo en vez del tunelero bajo tierra, la niebla de los
  jugadores y el cartel «Estás viendo el mapa como un jugador»; tocándolo vuelve.
- [x] **🕳 Excavar y Puñalada desde abajo** (2026-10-14, «Claude · pruebas», con capturas): Excavar cobra 1 No2 y cooldown 3, lo anuncia, el
  token queda transparente para el GM y bajo tierra (reglas pegadas). Puñalada: «¿por dónde sale?», sale pegado a juan con la tierra que salta,
  pide el objetivo, el duelo dice +1 PdG y +1d6, Crítico frecuente (1); pegó (3 contra 1), 10 − 2 de Defensa → Rengo 1 turno, aplicado.
- [x] **👷 ¡A laburar! y Golpe al piso** (2026-10-14, «Claude · pruebas», con capturas): el grito arma la cascada solo con los aliados
  (Escarabajo y Tunelero; juan no) y les pone Bendecido 2 turnos. Golpe al piso: una casilla lejana se rechaza y vuelve a pedir («en una casilla
  pegada»); sobre juan, solo él (los kobolds de al lado no); PdG 6 contra 1, daño 25 − 2 = 23 (30 → 10, el escudo absorbió 3), Sentado aplicado.

- [x] **⚔ Contraataque** (Warrior, 2026-10-13; GM rolpintoista + jugador elsaulo, los dos mapas recargados): el Escarabajo (copia) ataca a juan
  (con la skill); «Elegí cómo te defendés» muestra en la Evasión «⚔ si esquivás, podés contraatacar…»; juan esquiva (29 contra 1) y aparece
  «Esquivaste: ¿contraatacás…? (Contraataque)»; con «Sí», SP 40 → 38 y se abre el duelo «Contraataque» con su Arco corto; al tirar el PdG,
  No2 10 → 8 (un primer ataque); pegó (6 contra 3), 3 de daño (Escarabajo 12 → 9). Duelos terminados en los dos mapas. Sin probar: el caso
  «no lo alcanza» (hace falta un atacante a distancia más lejos que el alcance de quien esquiva).

- [x] **🩸 Transfusión sanguínea** (2026-10-13, con la cuenta del jugador dueño —elsaulo—, sin tomar el control, con todos los mapas recargados):
  Clementino → juan: los carteles «¿quién da?», «¿quién la recibe? (da: Clementino)» y «¿cuánta vida? … Como mucho 9» (juan en 21 de 30); con «9 (lo
  máximo)», Clementino 22 → 13 y juan 21 → 30, sin dejar ningún estado; la Mesa lo contó. (Una primera vuelta con mapas sin recargar dejó un estado de
  vida por turno: arreglado, el número viaja en `vida`.)

- [x] **🔁 Repetición** (2026-10-13, juan con el Arco corto; la pestaña estaba en segundo plano, así que los botones se tocaron desde adentro de la
  página): X = 3 cobró 3 SP y 0 No2; tres disparos al Coloso: el 1.º sin bono, el 2.º «repetición (+1)» = +1 PdG y +1d4, el 3.º +2 PdG y +2d4, y el
  estado se fue. Con X = 2: un disparo al Coloso y el siguiente al escarabajo → sin bono, «se cortó la Repetición» y el estado se fue. Los duelos de
  prueba se cancelaron (no se tiró el daño). Visto: con flechas especiales en el carcaj, el ataque pregunta «¿Qué flecha?» primero.

- [x] **✨ Smite** (2026-10-13, juan con el control del GM): contra el Coloso marcado como no-muerto, sin tirada, la Mesa avisó «lo sagrado le pega el
  doble» y tiró 2d4 = 6 directo a la vida (47 → 41).
- [x] **🌩 Tormenta arcana, con clics** (2026-10-13, después de que el dueño recargó los mapas): 20 proyectiles (escarabajo 8, Lobo 7, Coloso 5); el
  escarabajo salió del área arrastrándolo y «revisar» dio «esquivó»; el Lobo «sigue adentro» → 7d4 = 18 directo (8 → 0); el Coloso → 5d4 = 12 (59 → 47).
  **Arreglos**: los sub-duelos repetidos con varias pantallas del GM (ahora se reserva el lugar con una transacción: `areaCrearSiguienteSubDuelo`) y el
  título del cartel del dodge roll («Le cae la tormenta a X (8d4)» en vez de «ganó la Evasión»). Al terminar, todo cerrado y el mapa limpio.

- [x] **🌩 Tormenta arcana** (2026-10-13, «Claude · pruebas», el GM con el control de juan; la pestaña quedó oculta, así que la ejecución y el centro
  se hicieron con las mismas funciones que llaman los botones): cobró 5 No2 (12 → 7); el cartel «marcá el centro» se vio; con el escarabajo, el Coloso
  y el Lobo (aliado) adentro, la Mesa contó el reparto (salió 1 proyectil, al escarabajo); el sub-duelo arrancó en el dodge roll; «sigue adentro» →
  1d4 directo a la vida (13 → 12). Visto: otra pantalla del GM con la **versión vieja** del mapa (los mapas que quedaron abiertos) creó un segundo
  duelo que saltaba directo al daño — hay que recargar esas pantallas después de cada cambio.

- [x] **🏃 Sprint** (2026-10-13, «Claude · pruebas», el GM con el control de juan, modo combate): Ejecutar cobró 1 SP y 2 No2 (12 → 10) y dejó el
  estado Sprint con 3; usarla otra vez preguntó «se usa una vez por turno… ¿Usarla igual?» y al cancelar no cobró nada. Arrastrar 4 casilleros costó
  1 No2 («−1 No2 · te quedan 9») y el estado se fue al usar los 3. Detalle visto: los numeritos de la estela cuentan pasos, no lo que costó (con los
  pasos gratis de los pies pasa lo mismo).

- [x] **🏹 Proyectil perforante** (2026-10-13, «Claude · pruebas», el GM con el control de juan, Arco corto): juan → Escarabajo (copia) con el
  Coloso detrás en la misma línea. PdG 9 contra Evasión 1 → pegó; al terminar se abrió solo el segundo duelo contra el Coloso con la misma tirada
  (solo pidió su Evasión): crítico ×3, 18 de daño, sin efectos. **Arreglo encontrado**: con dos pantallas del GM abiertas se abrían dos duelos
  iguales; ahora una marca en la Crónica (`perf-<duelo>`) deja seguir a una sola (verificado: de dos intentos, uno solo pasa).
- [x] **🩸 Balas de sangre** (2026-10-13, juan con Especial 14): el cartel del costo trae «Vida (HP) a gastar» y el tope «de 1 a 14»; con 20
  avisó y no ejecutó; con 4 cobró 1 SP, 2 No2 y 4 de vida (30 → 26), duelo PdG 3 contra Evasión 1, daño 4d4 = 8 (23 → 15).
- [x] **🌀 Remolino** (2026-10-13, juan con el Caronero, Escarabajo al lado de la salida y Coloso al lado de la llegada): pidió la casilla del giro,
  juan se movió gratis y el área tomó a los dos; un solo PdG (4) contra la Evasión de cada uno, daño 1d6+3 menos la Defensa (al Coloso, 9 − 16 = 0),
  sin dodge roll. **Arreglo encontrado**: el cartel de instrucciones de «elegí una casilla» se escondía en el redibujo (afectaba también al centro
  de un área y al teleport); corregido (`actualizarAvisoColocacion`, js/09). Visto también: con dos pantallas del GM, la cascada del área abre dos
  sub-duelos iguales (riesgo ya anotado de los hechizos de área).
- [x] **⟳ Pasar de ronda en GM Tools** (2026-10-13): con el mapa abierto, al pasarlo a combate (con la lista de turnos armada) el botón se escondió
  en GM Tools, y volvió al pasar a narrativo.

- [x] **🧱 Los rivales cortan el paso** (2026-10-12, «Claude · pruebas», el GM, modo combate): la Bruja del pantano arrastrada en línea recta
  contra Clementino (rival) y un casillero sólido: la línea los rodea por arriba mientras se arrastra (captura enviada al dueño). El Escarabajo
  arrastrado hasta la casilla del Coloso (aliado): quedó en la de al lado y pagó 2 No2 en vez de 3.
- [x] **🧭 El rodeo automático** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con una flor sólida de 7 casillas (puesta solo en
  esa pantalla) justo debajo de juan, se lo arrastró derecho 4 casilleros hacia abajo, a través de la flor: llegó al otro lado pagando 6 No2
  (30 → 24), o sea que el camino rodeó el obstáculo en vez de chocarse.

- [x] **🎯 Headshot** (2026-10-12, «Claude · pruebas», el GM con el control de juan, con el Arco de pastor): «Headshot · 4 No2 (ataque con Arco de
  pastor) · 4 SP»; el duelo muestra «+2 PdG · +5 de daño fijo» y en el crítico «Headshot suma +1 a tu Crítico frecuente / potente». Contra el Coloso
  salió triple crítico; con un estado de prueba de resistencia a crítico 20, pegó sin crítico → «🎯 SIN CRÍTICO: Headshot no hace nada».
  **Arreglado en el camino:** la resistencia a crítico de los creeps y las invocaciones no sumaba la de sus estados (Endurecido en un creep no
  servía en el duelo); ahora sí.
- [x] **📐 El cartelito del lápiz en rectas** (2026-10-12): con el lápiz en rectas, al lado del puntero sale «Clic para empezar · doble clic para
  terminar» y, ya empezado, «Doble clic para terminar · Esc descarta».

- [x] **🛡 Endurecimiento** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Endurecimiento 1 No2 · 5 SP; pidió el objetivo (brillaban los
  aliados), juan se lo puso a sí mismo: Defensa 0 → 3, Armadura mágica 0 → 3, resistencia a crítico 0 → 1 en los cinco Tipos, 2 turnos.
- [x] **😵 Confusión** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Confusión 2 No2 · 5 SP; PdG.Esp 8 contra Res.Esp 2 del Coloso →
  Confusión 2 turnos. Al mover al Coloso salió el cartel «está confundido: tirá antes» con el d4 (se cerró con «Ahora no»). (El cartel «¿Tomar el
  control?» que parecía salir dos veces no era un error: el primer clic de la prueba no llegaba a apretar el botón.)

- [x] **🏹 Parry a distancia** (2026-10-12, «Claude · pruebas», el GM con el control de juan, que tiene el Arco de pastor): el Coloso atacó a juan y en
  «Elegí cómo te defendés» apareció «🏹 Parry a distancia · Arco de pastor» (Evasión 1d8, 4 No2 del disparo + 2 SP, el aviso del dodge roll). Cobró
  4 SP (turno ajeno) y los 4 No2; PdG 3 contra Evasión 5 → «¡INTERCEPTADO!». Con el arco, el contraataque no aparece hasta el dodge roll: salió el
  cartel «dodge roll para contraatacar», juan se alejó 1 casillero (−1 No2) y recién ahí el duelo ofreció «¿contraatacás?».

- [x] **🧚 Afortunado y ⏩ Acelerador (dibujo y pisada)** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con Afortunado aparece el
  botón 🧚 (verde, al lado del 🐈‍⬛ y el 💪); juan atacó al Coloso, el 🧚 ofreció «juan · PdG (6)», cobró 10 SP (turno ajeno) y repitió: «6 y 6 →
  queda 6», con los dos juegos de dados en la Mesa. El Acelerador (puesto solo en esa pantalla, sin las reglas) se ve como un círculo verde con dos
  flechitas que avanzan y el ⏳ abajo; juan pasó por encima moviéndose 3 casillas: −3 No2 y +2 del Acelerador (29 → 28).

- [x] **🐈‍⬛ Enyetar** (2026-10-12, «Claude · pruebas», el GM con el control de juan): con Enyetar aparece el botón fijo 🐈‍⬛ (violeta, al lado
  del 💪). juan atacó al Coloso; el 🐈‍⬛ ofreció «Coloso · Evasión (1)»; fuera de su turno cobró 10 SP y la maldición se abrió directo contra el
  Coloso (sin marcarlo en el mapa): PdG.Esp 8 contra Res.Esp 1 → «repite su Evasión: 1 y 2 → queda 1 contra 11; el duelo se volvió a
  resolver», con la tirada repetida en la Mesa. Después, esa tirada ya no aparece en el menú (una vez por tirada).

- [x] **🏹 Acelerado** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Acelerado 2 SP; usado dos veces seguidas (2 + 3 SP, la
  tercera ya marcaba 4), el «Atacar» con el arco pasó de 4 a 2 No2. Que lo gaste el disparo y que se vaya al terminar el turno quedó en las
  pruebas automáticas (en el mapa no era el turno de juan).

- [x] **💪 Empower** (2026-10-12, «Claude · pruebas», el GM con el control de juan): en combate aparece el botón fijo 💪 (naranja, el brazo
  hace fuerza y titila una chispa); juan atacó al Coloso (PdG 10 contra Evasión 1) y, antes de los d20 del crítico, el 💪 ofreció «juan · PdG
  (10) · 2 SP (turno ajeno 4)»; fuera de su turno preguntó y cobró 4 SP, el PdG quedó 13 y el duelo se volvió a resolver. Un segundo Empower
  sobre la misma tirada ya marcaba «3 SP (turno ajeno 5) · ya lleva 1 Empower». Al devolver el control, el botón se fue (ya no lo maneja el GM).

- [x] **⟳ Pasar de ronda** (2026-10-12): el botón del GM se llama así (antes «⟳ Mantenimiento»); en combate con la lista de turnos (7 en el
  orden) desaparece, y al volver a narrativo aparece de nuevo.
- [x] **⏳ Pasar de día** (2026-10-12, «Claude · pruebas», el GM con el control de juan): Día 1 → juan con vida 5, SP gastado, No2 2, Veneno y
  Endurecido: quedó vida 30/30, SP y No2 llenos, sin Veneno ni Endurecido (Sigilo y Shield, permanentes, quedaron); la Mesa: «☀ Día 1: juan descansó —
  vida 5 → 30 · SP lleno · No2 lleno · terminaron: Endurecido, Veneno», la Crónica y la cabecera «☀ Día 1»; la góndola se repuso (11 gastables). Día
  2: vida 10 → 30. Visto en el camino y arreglado: la escucha del día no arrancaba si el mapa arrancaba antes de cargar el archivo. **Falta**: un
  jugador que no estaba conectado y lo recibe al entrar.
- [x] **🔧 Reparar sin herrero** (2026-10-12, «Claude · pruebas», el GM con el control de juan, talento «Reparar equipo» nivel 1 y un Óleo
  reparador): en combate, Equipo y mochila muestra la sección 🔧 Reparar con «No se puede reparar durante el combate» y los botones apagados; en
  narrativo, 🧴 +3 en la Tapa abollada (2/3 → 3/3, el óleo se gastó) y 🔧 +1 en el peto con el talento (5/6 → 6/6, sin armadura rota; «te quedan 1 de
  2», despojos 26 → 24). (El mapa quedó en narrativo.) **Falta**: reparar una pieza rota con el talento (al doble) en el mapa — está en las pruebas
  automáticas.
- [x] **🛡 Armadura rota: cinco arreglos** (2026-10-12, «Claude · pruebas», el GM con el control de juan, con una Tapa de tacho de basura y un Peto de
  tablas equipados): (1) **Atraviesa escudos** abolla el escudo que paró el disparo (Tapa 3/3 → 2/3, «abollado ×1»; el peto intacto) y lo cuenta
  la Mesa; (2) **un crítico no rompe armadura**: el efecto queda «no entra · fue crítico» (con la prueba automática; un crítico real con un hacha
  en el mapa **falta**); (3) **Anillo de armadura indestructible**: la primera Armadura rota del combate no tocó ninguna pieza, la segunda sí
  (peto 6/6 → 5/6, ×1); (4) el estado y el manual ya no nombran el Óleo reparador; (5) **Equipo y mochila** (también la del mapa) muestra
  «🔧 5/6 · Armadura rota ×1 (−1 Defensa)» en cada pieza. De paso: los avisos de una pieza rota o a punto de romperse que le llegan a un
  personaje ahora van a la Mesa también desde el mapa.
- [x] **🧚 Re-roll** (2026-10-12, «Claude · pruebas», el GM con el control de juan; ya con Afortunado adentro): juan atacó a la Bruja y sacó PdG 3;
  el botón 🧚 ofreció «juan · PdG (3) … 2 SP (turno ajeno 4) + 2 No2»; fuera de su turno pidió 4 SP (Flash) y la tirada pasó a 11 (3 y 11 → queda la
  mejor), con su línea en la Mesa («−4 SP · −2 No2»). SP 38 → 34, No2 −2.
- [x] **🦋 La polillita** (2026-10-12): con «Polilla revoloteando», una polillita celeste da vueltas alrededor del token de juan (aletea y deja una
  estela de tres puntitos). Se agrandó un poco después de verla (era casi invisible con el mapa alejado).
- [x] **⛈ Maldición tormentosa** (2026-10-12, «Claude · pruebas», el GM): la Bruja del pantano Atormentada (1 stack). Moverse 3 casillas → −1
  de vida y 4 casillas → −2, con su línea roja en la Mesa; atacar desde sus Acciones (3 No2) → −2 (37 → 35), una sola línea. juan Atormentado
  (con el control): atacar con el Arco de pastor (4 No2) → 3 de daño que frenó su Shield (14 → 11), la vida no cambió. **Falta**: lanzar la
  Maldición en un duelo de verdad (es el mismo duelo que la extenuante, con el estado Atormentado).
- [x] **🚧 Los rivales cortan el paso: el aviso** (2026-10-12): la Bruja arrastrada hasta la casilla del Escarabajo (aliado) quedó en la de antes
  y el cartel dijo «🚧 No se puede terminar en la casilla de Escarabajo de cobre (auditar): queda en la de antes · Bruja del pantano (auditar):
  −4 No2 · le quedan 5».

- [x] **😮‍💨 Maldición extenuante** (2026-10-12, «Claude · pruebas», el GM con el control de juan): PdG.Esp 10 contra Res.Esp 1 del Coloso →
  Extenuado 1 turno. Las Acciones del Coloso: Atacar 5 → 6 No2, Parry 1 → 2; moverse 2 casilleros le costó 3 No2 (4 → 1). juan Extenuado:
  todas sus habilidades con No2 suben 1 (Maldición debilitante 3 → 4, Marcar 1 → 2), las que no cuestan No2 siguen gratis, y moverse lleva
  el recargo (`ext: 1`). En el camino: el botón Consumir y el Levantarse / cinturón de un creep ahora muestran el costo con el recargo.

- [x] **🎯 Marcar (Shooter)** (2026-10-12, en el mapa): juan marcó al Coloso (3 SP, 1 No2, sin tirada; el GM aplicó): el Coloso quedó con «Marcado»
  que no vence y juan con «Marcando»; el disparo a su marca dijo «contra su marca: +1 PdG, Crítico frecuente +1, Crítico potente +1, +1 de daño»
  (sumado a la emboscada del arco); al atacar a Clementino salió «Coloso deja de estar marcado», juan perdió el «Marcando» y la pantalla del GM le
  sacó el Marcado al Coloso.
- [x] **Las pruebas pendientes del 2026-10-09 al 11, en el mapa** (2026-10-12, «Claude · pruebas», juan y el GM; blanco casi siempre Clementino,
  con un estado de prueba de puntería y otro sin críticos para forzar golpes normales):
  - **🗡 Dagas T4**: Pica Hielos «Tipo 4 · 2 dados · PdG −1», 2d4, $50; golpe con el Estileto «1d4 + 5» contra el Coloso (Defensa 16 → 0).
  - **💠 Distancia ideal**: media (alcance 14 → franja 7–9) brilla en celeste la Bruja a 7 y el duelo suma +1 PdG; lejos (los 3 últimos, desde
    8) brilla el Coloso a 12 y suma.
  - **🎯 Ballestas revisadas**: Común (Recarga 3) 3, 6, 9 No2; Buena (Recarga 2) 2, 4, 6. La de cazador y la de guardia conservan su Rango de
    bono a propósito (ajuste del 2026-10-11 para que no queden mellizas); las Raras en adelante no se revisaron.
  - **⚔ Tabla de turnos achicada**: «⚔ Turno: *nombre*», cambia sola al pasar el turno, agrandada vuelve a «Orden de turnos». Un creep que juan
    ya conoce sigue figurando con su nombre aunque no lo vea (misma regla que la lista).
  - **🎯 Mecánicas de ballesta**: Doble cuerda 2, 2, 6; Tiro rápido 2, 3, 4; Alcance con caída «(2 de más): −4 de daño» (5 − 4 = 1, ×4 de
    crítico = 4); Apuntada firme +3 sin moverse y nada después de moverse; Tirador de apoyo +2 PdG; Remate Crítico frecuente +1 contra el
    Inmovilizado; Primer disparo +1d6 (9 + 5 = 14); Punta de diamante pasan 4 contra Defensa 21; Remachadora pasan 2 y 3 en golpes seguidos y
    al errar vuelve a 0; Cargador «no cobra su No2 (1 de 2 del combate)»; Carcaj integrado 12 / 13; Virote de red 0 de daño e Inmovilizado 1
    turno.
  - **🏹 Mecánicas de arco**: Tensar («¿Tensás…?» → «tensado: +1 PdG»); Largo alcance (Clementino a 16 con alcance 14 brilla y «(2 de más):
    −4 PdG»); Emboscada solo el primer disparo y se libera al volver a narrativo; Matabestias +2 de daño contra la bestia; Contra el Marcado
    (Flecha marcadora y el segundo disparo +2 PdG); Espalda a distancia +2 PdG +1 de daño sin sigilo; Afinidad elemental (fuego 1d4+1).
  - **⏱ Turno ajeno**: «No es el turno de juan… Cuesta 4 SP» (Shield); Cancelar no cobra nada; en el propio turno no pregunta.
  - **🎯 Ojo de asesino**: «Rango del crítico: 3 (Tipo 4 − Crítico frecuente 1)»; el mismo disparo gastó el Ojo y una carga del Arma envenenada.
  - **🧱 Paredes**: figura en rectas cerrada con un clic en el primer punto; «Entre vos y Clementino está una pared»; una flecha que erró chocó y
    se rompió (moneda); con la pared juan no ve la casilla de Clementino ni la alcanza su cono (sin la pared, sí).
  - **🏹 Virotes con mapa**: humo (nube flor de 7, 2 turnos), luz (bengala, 3 turnos), explosivo (fuego 1d6 a Clementino y al Lobo pegado),
    clavo (contra la pared: Inmovilizado 1 turno), rebote (rebota al que está pegado, PdG −2).
  - **🏹 Rasgos de ballesta**: apuntada «+2 PdG (no se movió)» y nada si se movió; atraviesa escudos «¡PARADO!» y el escudo de Clementino se
    abolló (Armadura rota).
  - **🏹 Apuntar con un arma de rango**: al apuntar se ve el alcance, brillan los objetivos posibles, la línea muestra si pasa y avisa cuando la
    tapa un token o una pared.
  - **Arreglado en el camino**: un PdG en 0 o negativo dejaba el duelo en «Tirando…» para siempre (ahora da el valor, sin dados); el Virote de
    rebote nunca rebotaba (comparaba ids que los tokens no llevan).
  - **Observaciones para el dueño**: cancelar un duelo después de elegir el objetivo ya cuenta como disparo (gasta Apuntar, la Emboscada, la
    Respiración contenida); el Virote de red igual muestra «Tirar el daño» (después da 0); el dado extra del Primer disparo no aparece en el
    botón de daño (se suma aparte).

- [x] **Skills auditadas del 2026-10-11, en el mapa** (2026-10-12, «Claude · pruebas», juan y el GM, con capturas):
  - **🎯 Enfocado**: tres usos seguidos cobraron 1, 2 y 3 SP (y 1 No2 cada uno), el botón decía «2 SP (+1 por usarla seguida)»… y quedó
    «Enfocado ×3»; el disparo de arco al Coloso: «Arco corto · 2d4 + 2 + 6» (crítico ×3 = 45); el estado se gastó y volvió a costar 1 SP. No se
    probó un golpe cuerpo a cuerpo (juan solo tiene arco): es el mismo mecanismo de cargas que Envenenar arma. En «Ver», «Detalles técnicos»
    muestra el texto original del borrador.
  - **🌑 Maldición debilitante**: PdG.Esp 9 contra Res.Esp 3 → Debilitado 2 turnos en el Coloso (Acciones: «Debilitado −1» en Atacar y Esquivar);
    la segunda (10 contra 7): ×2, 2 turnos, −2 (los dados bajan de 1d4 a 1d3). **Arreglado en el camino**: el cartelito decía −1 con ×2 (ahora
    multiplica por los stacks). No se probó contra un personaje: va por el mismo aviso que Veneno, ya probado.
  - **✨ Blessing**: sobre juan mismo, Bendecido 2 turnos, PdG 11 → 12, «Bendecido +1» en Atacar y Esquivar; 5 SP y 1 No2. El daño del arco no
    cambia (suma la mitad del Dmg). **Arreglado en el camino**: la ficha suelta en segundo plano se adjudicaba el efecto y guardaba tarde (el
    navegador frena sus relojes); ahora solo lo toma si está a la vista, si no lo aplica el mapa.
  - **🛡 Shield**: sobre Clementino 14/14; golpe de 9 → 5; golpe de 8 → 0 y 3 a la vida (18 → 15); al empezar el turno de Clementino, el escudo
    gastado se fue. En turno ajeno: «No es el turno de juan… Cuesta 4 SP» y cobró 4. **Arreglado en el camino**: el token seguía mostrando el escudo
    lleno después de un golpe (el resumen público no se actualizaba; venía de antes).
  - **🎯 Apuntar**: el cartel dice «X: de 1 a 3»; con 4 avisa «Como mucho 3 Nitros en X» y no cobra; con 2: «Apuntando ×2» y el disparo
    «distancia ideal y apuntando (+2): +3 PdG, Crítico potente +2». Ojo: cancelar el duelo después de elegir el objetivo ya gastó Apuntando.

- [x] **☠ Veneno (Debuffer)** (2026-10-11, en el mapa, las dos cuentas): juan («1 No2 · 2 SP») contra el Coloso: el duelo «PdG.Esp contra Res.Esp»;
  la primera vez resistió (6 contra 11: «se resistió»); con un estado de prueba en el Coloso (−10 Res.Esp) ganó juan (9 contra 4: «¡Funcionó!») y
  el GM aplicó: «Veneno ×3 → ahora ×9» (tenía 6: se suman).

- [x] **🎯 Apuntar (Shooter)** (2026-10-11, en el mapa): juan con la skill («X No2 · X SP»): en el cartel del costo, al poner 2 en SP los No2 pasaron
  solos a 2 (la misma X); cobró 2 SP y 2 No2 y quedó «Apuntando». Disparó el Arco corto al Coloso: «distancia ideal y apuntando (+1): +2 PdG, Crítico
  potente +1» y el estado se gastó. Hubo que arreglar: el estado quedó con 1 stack en vez de 2 (la ficha armaba los estados propios con 1 stack fijo) →
  corregido (prueba automática). **Falta**: ver el ×2 en el mapa, y el tope de X (el cartel dice «Tope de X sin definir»: hoy deja pagar más de 3; el
  bono igual se queda en 3).

- [x] **✨ Heal (Support)** (2026-10-11, en el mapa): juan (con la skill: «1 No2 · 2 SP») se eligió **a sí mismo** (la opción nueva «aliado o uno mismo»):
  «juan → juan · Curación 1d6+4 [6] = 10 · Aplicado +10 HP (8 → 18)»; después a Clementino: «+9 HP (12 → 21)». El tope en la vida máxima y que no
  levante a un caído son los de siempre de la cura (dueloCurar), ya probados con las varitas de cura.

- [x] **🛡 Miti-Miti (Tanque)** (2026-10-11, en el mapa, las dos cuentas): juan (con la skill) marcó a Clementino desde la Botonera («1 No2 · 2 SP»;
  «Clementino queda protegido: juan se lleva la mitad del daño hasta su próximo turno»). La Bruja le pegó a Clementino: 13 − Defensa 1 (lo que entró,
  5, después de su escudo) → Clementino 2 y juan 3, directo a la vida (Mesa: «🛡 Miti-Miti: juan se lleva 3 del golpe a Clementino»). Pasó el turno
  de juan y la marca siguió; otro golpe, con crítico: 18 → Clementino 9 y juan 9 (el cuadro del duelo: «🛡 juan se llevó 9 (Miti-Miti)»). Al
  empezar el turno siguiente de juan: «Miti-Miti: 1 → 0 turnos, se terminó». Hubo que arreglar: (1) **los efectos de un duelo los aplica también la
  ficha suelta del dueño del defensor**, y con dos personajes del mismo jugador la ficha de uno reclamaba el del otro y lo dejaba «a mano» → la ficha
  solo reclama los de su personaje (y nunca Miti-Miti); (2) el resumen público no llevaba a quién protege; (3) el texto del golpe no contaba lo que se
  llevó el Tanque. Ojo: después de subir algo, **todas las pantallas** (las fichas sueltas también) tienen que recargar. **Falta ver**: «a la vista»
  (el cartel no mostró el alcance al elegir al protegido: con el Rango de juan, no limita).

- [x] **🏹 Arcos Comunes nuevos** (2026-10-11, en el mapa, las dos cuentas; juan con 7 de los arcos nuevos): **Respiración contenida** («+2 PdG» el
  primer disparo del turno), **Abanico + Emboscada de PdG** (otro blanco: «emboscada y abanico: +2 PdG»), **Contra lo sobrenatural** (el Coloso pasado
  a demonio: «+2 de daño»), **Arco duro** (Fuerza 3 < 4: «−2 PdG») y **Mínima más larga** («de 3 a 15 casilleros»), **Lectura del viento** (pegó al
  Coloso y el segundo disparo: «+1 PdG»), **Contra humanos** (la Bruja, humanoide: «+2 de daño»). Hubo que arreglar: el mapa cargaba la Botonera vieja
  (con el catálogo viejo) porque no se le había subido la versión. **Falta**: Racha (necesita un crítico), Flecha de más, la distancia ideal nueva y la
  Emboscada de Crítico potente. Ver `revision-arcos.md`. **Después, el mismo día:** Racha (juan con PdG +10 para asegurar el crítico: doble crítico al
  Coloso y el disparo siguiente «racha: Crítico frecuente +1», a 3 No2 por Encadenar), Flecha de más (Mesa: «disparó Flecha de fuego · Flecha de más:
  no cobra su No2»), distancia ideal **cerca** (el Coloso a 3 brilla en celeste; «distancia ideal: +1 PdG») y Emboscada de Crítico potente («Crítico
  frecuente +2, Crítico potente +1»; el texto decía «emboscada y emboscada»: arreglado). **Falta** la distancia ideal **media** y **lejos** (ver arriba).

- [x] **🏹 Mecánicas nuevas de arco: Contra el que corre, Flecha en la cuerda, Encadenar y el menú «¿Qué flecha?»** (2026-10-11, en el mapa,
  las dos cuentas): juan con un «Arco de prueba (corre)» (copia del Arco corto + Contra el que corre +2, Flecha en la cuerda, Encadenar). El GM
  movió al Coloso 3 casilleros en su turno (ronda 3); mientras su turno seguía, la pantalla de juan contaba 0 (no está completo) y al pasar a juan,
  3. Juan le disparó: el duelo dijo «contra el que corre: +2 PdG» y la tirada «1d10+1 +2 contra el que corre» (5); el primer disparo cobró **1 No2**
  (Tipo 4 ÷ 2 = 2, −1 por Flecha en la cuerda). Pegó (sin daño: Defensa 16) y el segundo disparo apareció a **3 No2** (4 − 1 por Encadenar).
  Hubo que arreglar: lo movido se contaba por el número de Mantenimiento, que llega un instante después que la ronda del orden de turnos → ahora
  por la ronda del orden. El menú de flechas, rehecho a pedido del dueño: «🏹 Flecha común» / «✨ Flecha especial ▾» y, al tocarla, las
  especiales abajo, una por renglón y por nombre (con muchas, la ventana tiene scroll). **Falta**: el caso del arquero primero en la ronda
  (aplica desde la segunda) y las demás mecánicas nuevas (Respiración contenida, Racha, Lectura del viento, Abanico, Contra humanos/adefesios,
  Arco duro, Mínima más larga, Emboscada potente) — se prueban cuando estén los arcos Comunes nuevos cargados.

- [x] **⏸ La pausa de la partida** (2026-10-10, en el mapa, con las reglas pegadas): el GM pausó desde el mapa (cartel «La partida está en pausa» y
  el botón pasa a «▶ Reanudar»); el jugador vio «Partida en pausa hasta la próxima sesión», arrastrar a juan no armó camino y la B no abrió la
  Botonera; en su ficha se sacó y se volvió a equipar la ballesta; al reanudar, el GM vio las dos líneas con la hora y eligió «Borrar el registro y
  reanudar» (el registro quedó vacío y el mapa del jugador se destrabó). Arreglado después: el cartel de la pausa tapaba el título de otras
  ventanas (ahora se esconde mientras haya una abierta). Queda la duda P194 (en pausa, ¿cobra como en combate?).
- [x] **🧱 Paredes y 📐 lápiz en rectas** (2026-10-10, en el mapa, con las reglas pegadas): el GM dibujó en rectas, con imán y «🧱 Con colisión», 5
  puntos sobre las esquinas del casillero de juan (arriba, izquierda y abajo); se guardó (en rectas y con colisión) y se ve en las dos pantallas (borde
  oscuro y línea roja cortada). juan no pudo cruzarla (el arrastre no armó camino), mientras que por el lado abierto sí (pidió No2). Su rango (R) se
  abre solo hacia la derecha. Un garabato a mano alzada: el 🧱 del dibujo seleccionado lo volvió pared («Ese dibujo ahora es una pared…») y
  otra vez lo sacó («ya no es una pared»). La casilla de colisión y el 🧱 son solo del GM.
- [x] **🪵 Tronco de huída** (2026-10-10, en el mapa): la Bruja atacó a juan; juan marcó el Flash «Tronco de huída +2» y eligió Evasión: 1d8 +2 ⚡ = 7
  contra 6, esquivó gracias al +2. Apareció «🪵 juan esquivó: dodge roll»; lo arrastró 2 casilleros lejos del Coloso (al que se le dieron No2 para
  que pudiera aprovechar): pagó sus 2 No2, el cartel se cerró solo y no hubo ataque de oportunidad ni aviso. Falta: el caso de un cono (la fase dodge).
- [x] **😱 Expuesto y el dodge roll** (2026-10-10, en el mapa): el Coloso Expuesto (con +60 de Evasión de prueba) contra la Ráfaga arcana de
  juan: su Evasión salió «2d12+2d20 ÷2» = 17 contra 13, la ganó, y en vez del dodge roll la Mesa dijo «😱 Coloso … está Expuesto: no puede hacer
  el dodge roll y se queda en el área» y «no logró salir del área: efecto completo»; juan tiró el daño. (Detalle de texto, de antes: cuando quien
  gana la Evasión no sale del área, el cartel dice «¡FUNCIONÓ! … venció la Eva», aunque la Evasión la ganó.)
- [x] **🗡 Degollar y Expuesto** (2026-10-10, en el mapa, con orden de turnos): juan, en su turno (4.º de 7), contra el Coloso: la declaración
  dice «+4 PdG · +7 de daño fijo», el crítico «Degollar suma +1 a tu Crítico frecuente / potente», el daño «2d6 + 4 + 7» (salió crítico ×2:
  28, el Coloso 43 → 15). Al resolverse: la Mesa «⏭ juan usó Degollar: termina su turno y pasa al final del orden», el turno pasó solo
  (salteando al Escarabajo caído) a Clementino y juan quedó último, abajo con los que ya jugaron. La Bruja atacó a juan: su defensa ofrecía
  solo la Evasión, «1d8 ÷2» con el aviso «😱 Expuesto…» (salió 5 → 2). La Bruja se alejó de juan: «no hay ataque de oportunidad (juan está
  Expuesto)». ▶ Siguiente después de la Bruja: juan se salteó y empezó la Ronda 2; al llegarle su turno en la Ronda 2, Expuesto se fue solo.
- [x] **🔮 Armadura arcana** (2026-10-10, prueba completa en el mapa, juan contra el Coloso y la Bruja): un golpe de 8 → «la Armadura arcana
  absorbió 4», juan 10 → 6. Al vencerse (al empezar su turno) la Mesa dice «💥 … explota: 4 de daño arcano directo» y sale la cascada: el
  Coloso 56 → 52 (empate desempatado a par o impar), la Bruja 21 → 17 (su Defensa especial 3 no resta: es directo). **Bug encontrado y
  arreglado**: el daño que aplica el mapa a un personaje buscaba los estados en la parte equivocada de la ficha, así que a un personaje no le
  valían ni los escudos, ni Invulnerable, ni la absorción (`danioPj`, js/10). Queda: la vista previa del «Recibe daño» no muestra lo absorbido.
- [x] **✨ Toque mágico pegando** (2026-10-10): solo el que está al lado, el defensor solo con Evasión; pegó 22, menos la Defensa especial 3
  del objetivo = 19 (no su Defensa).
- [x] **🌀 Ráfaga arcana: ganar la Evasión y quedarse adentro** (2026-10-10): el Coloso (con +20 de Evasión de prueba) ganó 7 contra 4 → el
  cartel del dodge roll → «✋ No me quiero mover» → la Mesa «no logró salir del área de Ráfaga arcana: efecto completo» → juan tiró el daño:
  3 directo a la vida, 52 → 49. Salir del cono ya estaba probado (la Bruja esquivó).
- [x] **🧴 Óleo venenoso** (2026-10-10): consumirlo pone el estado con su carga; el «Arma envenenada» sin cargas que quedaba se fue; el
  ataque sumó +2 y Veneno ×3 (fue crítico: 26 de daño).
- [x] **🧪 Envenenar arma y las cargas** (2026-10-10, en el mapa): juan la ejecuta (2 SP, la Mesa dice «→ Arma envenenada»), ataca al Coloso
  con la ballesta: el botón del daño dice «2d6 + 4 + 3», el paso de efectos trae «Envenenar · entra siempre» → «Aplicado · Veneno ×3», y en su
  ficha queda **1 carga**; el segundo ataque gasta la otra (0). **Bug encontrado y arreglado**: cancelar el cartel de «sin No2» gastaba la carga
  igual; ahora se gasta recién cuando el ataque se pagó. **Arreglado y probado después** (2026-10-10): al gastar la última carga, «Arma
  envenenada» desaparece enseguida de la lista de juan, y ese último golpe igual suma el +3 («2d6 + 7») y el Veneno ×3.
- [x] **🔮 Vista previa de «Recibe daño» con la Armadura arcana** (2026-10-10): juan con la Armadura puesta, golpe de 8 → «8 − Def 0 = 8
  (Armadura arcana −4) → HP 6 → 2». Antes la vista previa de un personaje no veía ni escudos ni la Armadura arcana.
- [x] **⚔ Tajear y la Perfora nueva** (2026-10-10, en el mapa, «Claude · pruebas»): juan contra el Coloso (Defensa 16): «11 − Defensa 16
  (pasa 1 por la Perfora) = 1», el Coloso 31 → 30, el Sangrado ×3 (3 turnos) entra con «Aplicar» y su primer tick lo deja en 27. Antes se vio
  el +1 al Crítico frecuente solo en esa tirada y el aviso sin No2.

- [x] **🏹 Ballestas: Recarga, «¿Qué virote?» y Perfora del arma** (2026-10-10, probado en el mapa con juan y la Ballesta de guardia): el primer disparo cobró 2 No2 y el siguiente marca 4; la ventana dice «¿Qué virote?» y ofrece solo el virote (no las flechas del carcaj); disparó al Coloso pegado (la ballesta no tiene distancia mínima); el daño dijo «12 − Defensa 11 (16 − perfora 5)» (3 del arma + 2 del virote). Arreglado después: el texto del virote repetía su encabezado y la declaración no mostraba la Perfora del arma.

- ✅ **Disputa del botín** (2026-10-09, sin tercera cuenta: el GM toma 🎮 el control de Clementino): «🏁 Finalizar combate» con un ítem extra (Amuleto de
  prueba) → publicar; juan 🙋 lo reclama («es tuyo», ↩ Soltar); el GM, como Clementino, lo ve «lo reclamó juan» con ⚔ Disputar → piedra, papel o tijera
  «por Amuleto de prueba» en las dos pantallas («Vos contra juan» / «Vos contra Clementino»), la fila «✊ En disputa: jugar»; papel contra piedra →
  «¡Ganaste! te llevás Amuleto de prueba» / «Perdiste: se lo lleva Clementino», la fila pasa a «lo reclamó Clementino»; ↩ Soltar lo deja libre y se
  vuelve a reclamar; el GM cierra el botín («Reclamados (1): Amuleto de prueba → Clementino») → el amuleto en la mochila de Clementino y +63 XP; la
  Mesa cuenta cada paso. (De paso: «Tomar el control» pasó al cartel del juego; era un confirm() nativo.)

- ✅ **🏹 El arco en una invocación y 🪙 la moneda en el rincón** (2026-10-09): el Lobo de prueba (de Clementino) con un Arco corto: el 🔍 del Daño dice
  «Dmg (arco: la mitad, para arriba) +2» con Dmg 3; al atacar a la Bruja, el duelo dice «con Arco corto · Tipo 4» y a la Bruja se le ofrece el Parry
  con escudo «si gana, el disparo queda parado». **Arreglado probando**: con alcance 2 no le brillaba nadie (el arco pide 3+) y el cartel no decía por
  qué; ahora: «tu alcance (2) no llega a los 3 casilleros que necesita el arco». **Moneda Re-Roll en el rincón**: con una moneda, el botón 🪙 con brillo
  abajo a la izquierda abre «mis últimas tiradas»; con la Polilla activa, se apilan (Polilla abajo, moneda arriba).

- ✅ **Tanda del 2026-10-09 (tarde, el dueño afuera)**: **Parry con escudo de un personaje contra un disparo**: Clementino con la Tapa de tacho de
  basura, la Bruja le dispara: «Elegí cómo te defendés» ofrece Evasión y Parry solo con el escudo (el cuchillo no), «si ganás, el disparo queda parado
  (sin Bloqueo)»; ganó 6 contra 3 → «¡PARADO!», sin Bloqueo ni contraataque. **Moneda Re-Roll**: sin moneda el 🪙 sale gris y tachado y avisa; con una
  en la mochila se enciende y abre «mis últimas tiradas». **Estados al pasar el mouse**: sobre el Coloso, el cartelito con Piernas de prueba (no
  vence), Veneno 1 turno y Parálisis 1 turno. **Piedra, papel o tijera desde el mapa del GM**: desafío con motivo, piedra contra tijera, el GM ve
  «¡Ganaste!» y el jugador «Perdiste», en la Mesa. **El arco suma la mitad del Dmg**: el 🔍 del Daño de juan dice «Dmg (arco: la mitad, para arriba)
  +2» con Dmg 3. **Sin oportunidad con un arco**: juan se aleja de la Bruja (solo arco) en combate: no lo frena y la Mesa y la Crónica dicen «tiene un
  arco, que no sirve de oportunidad» (**arreglado probando**: los creeps no publicaban ese dato y la Crónica decía siempre «no tiene No2»).
  **🎭 Acción incierta, lado del GM**, con niebla de verdad: una copia del Escarabajo escondida y lejos no aparece en el orden de turnos del jugador
  (6 filas contra 7 del GM) ni su tirada en la Mesa; al acercarse a juan, el mapa del GM la marcó «revelado» sola; vuelta a la niebla, sigue en el
  orden del jugador y su tirada le llega como «🎭 … está realizando una acción incierta». Y usando una Trampa de oso de su cinturón: el GM ve «🎭 … colocó una trampa («Trampa de oso»)» y el jugador solo «acción incierta». **Glosario**: en el «Ver» del Arco corto y de la Varita de
  chispa eléctrica, los términos marcados y el globo al pasar el mouse (Parálisis); «Detalles técnicos» en lista corta. **Perfora sin crítico**:
  juan con la Perforante, PdG 3 contra Evasión 1: 6 de daño contra Defensa 4 → recibió 3 (la Perfora le restó 1 a la Defensa). El texto decía
  «6 − Defensa 4 − perfora 1», como si la Perfora frenara el daño: **corregido** a «Defensa 3 (4 − perfora 1)» (falta verlo: los intentos siguientes
  salieron crítico o fallo).
- ✅ **Línea de tiro, tiro alto, distancia ideal y distancia mínima** (2026-10-09, probado antes y anotado ahora): la línea al mouse (verde/roja, con
  la distancia), los tokens tapan, el cartel de «tapado» con «Elegir otro», el tiro alto con PdG −2 («1d6 −2 tiro alto»), los resaltes de la
  distancia mínima y de la distancia ideal, el daño del arco 2d6+3.

- ✅ **🏹 Disparo contra un personaje y la flecha envenenada** (2026-10-09): la Bruja (Arco largo de tejo) le dispara a juan: «Elegí cómo te
  defendés» ofrece solo la Evasión (juan tiene el arco en las manos: no parrea con él) y ya sin la nota del disparo; esquivó 5 contra 2. juan
  dispara la Envenenada: la declaración dice «Flecha envenenada: Envenenar · perfora 1»; crítico ×2 (18); se aplicó Veneno ×3. (Después, dueño: el
  veneno sigue necesitando que pase el daño; para eso está la Perfora.)

- ✅ **🏹 Flechas eléctricas y levantar una flecha** (2026-10-09): juan a la Bruja (con Stun, para que pegue). **Relámpago**: el duelo dice
  «Flecha relámpago: Parálisis», pegó, Parálisis 1 turno aplicada al blanco y saltó al Coloso de mineral (a 2 casillas): 1d2 = 2 → paralizado
  (quedó en su lista de estados); el carcaj bajó 2 → 1. **Tormenta** (crítico ×3): el físico se multiplicó (21) y el eléctrico no (7, «ignora la
  Defensa, sin multiplicar»); saltó 7 → 3 al Coloso → 1 al Escarabajo de cobre y ahí se cortó; Parálisis 50 % (1d2: 1) y 25 % (1d4: 2), ninguna
  entró; la Crónica y la Mesa lo cuentan. **Arreglado probando**: el cartel «No te alcanzan los Nitros» al pagar el PdG quedaba tapado por el
  duelo (ahora una ventana que se abre en la Botonera queda encima; verificado). **Levantar**: juan al lado de la Flecha de fuego del piso →
  «🗡️ Levantar Flecha de fuego · 1 No2» → sin No2 pregunta y deja seguir → salió del piso y fue **al carcaj** (1 → 2), con su línea en la Mesa.

- ✅ **🏹 Flecha especial, parada con escudo** (2026-10-09): juan dispara el Arco corto a la Bruja con «¿Qué flecha?» → Flecha de fuego (se
  gasta del carcaj, 2 → 1, y cobra su No2); el duelo muestra la flecha y sus efectos. La Bruja elige Parry con el Escudo de la falange (la opción
  dice «si gana, el disparo queda parado (sin Bloqueo)»), gana 4 contra 2: «🛡 ¡PARADO!», sin tirada de Bloqueo y **sin ofrecer contraataque**
  (corregido el mismo día, pedido del dueño). La flecha quedó en el piso a 15 casillas (el alcance del arco) siguiendo la línea, con su línea en la
  Mesa. Se sacó la nota «Es un disparo: se esquiva igual…» de la Evasión (dueño: no hace falta explicarlo).

- ✅ **✊ Piedra, papel o tijera** (2026-10-09): juan (mapa) contra el GM (GM Tools): desafío con motivo, empate y ronda 2, papel contra tijera →
  «Perdiste» / el ganador en verde, la línea en la Mesa. Arreglado en el momento: el escucha no reintentaba si la pantalla se abrió antes de pegar
  las reglas, y la Mesa adelantaba el resultado.
- ✅ **📋 Ctrl+C / Ctrl+V de un creep** (2026-10-09): «Sí, crear su ficha» duplicó el creep (GM Tools lo levantó con sus habilidades y su vida) y el
  token quedó vinculado; GM Tools pregunta «¿crear su token?» al duplicar.
- ✅ **🧊 El hielo y 💧 el charco** (2026-10-17, «Test con claude elsaulo», con capturas): el hielo aparece bajo Silvia → «Tirar Agilidad» (2 contra
  9, Sentada); caminar 2 y 3 casilleros → «una tirada por paso», falla el primero y queda en esa casilla; al derretirse queda el charco (una mancha
  ondulada, permanente); una zona de fuego encima evaporó la parte de abajo. El rayo en el agua da ×1,5 (5 → 8). Las nubes: verde, violeta y gris.
- [x] **💧 La Parálisis al doble en el agua, dentro de un duelo** (2026-10-17): falta verla en un duelo de verdad (un rayo con Parálisis contra
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** Silvia parada en un charco recibe la Varita de chispa eléctrica: el tablero muestra Parálisis 50 % (el doble del 25 %) y el daño «en el agua: 6 × 1,5 = 9» (20 → 11).
  alguien parado en un charco: el tablero de efectos tiene que mostrar el doble de chance y «💧 en el agua»).
- [ ] **⚡💧 El rayo corre por el agua, en un duelo de verdad** (2026-10-17): probado llamando a la función con dos personajes en un charco
  **Avance el 2026-10-20 (Claude, «Test con claude elsaulo»):** en un duelo real el golpe corrió por el charco hasta el Lobo (9). La Parálisis del Lobo se tiró sola (50 %) y no salió: falta verla salir. Ojo: el Lobo recibió además el salto eléctrico (6): pregunta abierta P214.
  (Xeena recibió 4 × 1,5 = 6, la Crónica y la Mesa lo contaron); falta un duelo real con un rayo con Parálisis, para ver que la Parálisis del
  otro se aplica sola (en la prueba salió «a mano» por el duelo armado a mano).
- ✅ **✍ El crítico a mano** (2026-10-17, duelo de prueba Silvia → Xeena): PdG 30 y Evasión 1 a mano → crítico de nivel 7; «Elegir
  manualmente» en el crítico, escrito 17 → ×3 (la Mesa: «Crítico (1d20, a mano)»). Duelo cancelado sin contar el ataque.
- [x] **✍ Los efectos a mano** (2026-10-17): «✔ Funcionó / ✘ No funcionó» en el tablero de efectos; falta un duelo con un arma que tenga
  **Probado el 2026-10-20 (Claude, «Test con claude elsaulo»):** creep con Daga de efectos Sangrado 50 % y Lisiado 25 %: «✔ Funcionó» al Sangrado y «✘ No funcionó» al Lisiado → el tablero muestra ✍ en los dos y la tarjeta del Sangrado («fue crítico: queda permanente»). **Arreglado:** mientras el daño esperaba su «💔 Aplicar el daño», los botones de los efectos se veían y no hacían nada (ahora avisa «primero se aplica el daño»); y lo elegido a mano decía «salió 0».
  efectos con chance.
- ✅ **😤 La Bronca** (2026-10-18, «Test con claude elsaulo», creep de prueba con tope 2): primer golpe → «junta bronca (1/2)» en la Crónica y la
  Mesa; segundo → explosión de 2 casillas y «¡SE LE SALTÓ LA TÉRMICA!», y la onda arrancó el duelo de área (su PdG contra la Evasión). **Hasta el final, probado el 2026-10-20:** dos golpes → «¡Se le saltó la térmica!»; el creep tira una sola vez para toda la
  onda (9); Silvia (Evasión 1) recibe 5 − Defensa 3 = 2 y queda Sentada; el Lobo (20) gana, hace el dodge roll fuera del área (sin oportunidad: el creep
  tiene arco) y «se resistió»; el área se cierra sola.

