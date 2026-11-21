/* Catálogo base de habilidades pasivas (las que cuestan puntos de Job).
   La ficha las ofrece en "+ Pasiva → Elegir del catálogo" (junto con las que
   el dueño del proyecto aprueba desde Firebase, ver comun/biblioteca.js) y
   las copia tal cual al personaje.

   Una pasiva no es solo un bono a un stat: es una habilidad con efectos.
   Los que se pueden automatizar funcionan solos al cargarla:
   - mods: [{stat, val}] — bonos a stats (mismos ids que MOD_TARGETS de la
     ficha). Con varias compras se multiplican.
   - regenHp: HP que recupera en cada Mantenimiento, por compra.
   - estado: el nombre de un preset (comun/estados-presets.js) que queda puesto, permanente, mientras se tenga la pasiva
     (Combatiente.sincronizarEstadosDePasivas; 2026-10-16, Vuela).
   Lo que no se puede automatizar va en `detalle` como recordatorio.

   Campos: poolId (estable, no cambiar: marca de dónde salió la copia y sirve
   para acumular compras), nombre, jobCosto (1, 2 o 3), detalle, etiquetas.
   Tope de compras de cada pasiva: mitad del nivel, redondeada hacia abajo
   (mínimo 1) — ver PASIVA_TOPE en ficha.html.

   Escalón = lo que da 1 punto del atributo del que sale el stat (Hp.Max 5,
   SP 3, el resto 1). Excepciones decididas (docs/preguntas-abiertas.md
   P70): Res.CC da +2. Los +1 de los stats restantes se cargaron el 2026-09-19 a pedido del dueño;
   los marcados ⚠ (No2, Rng, Crit) son los que más hay que revisar. */
const PASIVAS_BASE = [
  // 🪨 Inmunidad tóxica (2026-10-28, dueño: «a Larry una habilidad pasiva racial que es inmunidad a efectos tóxicos; Larry es una roca en un robot»):
  // racial (no cuesta Job). Res. tóxico 99 (el daño tóxico no entra: zonas, armas, flechas, habilidades) y el estado «Inmune a lo tóxico» (el Veneno no entra).
  {poolId: 'inmunidad-toxica', nombre: 'Inmunidad tóxica (racial)', jobCosto: 0, etiquetas: ['racial', 'defensiva'], estado: 'Inmune a lo tóxico',
   mods: [{stat: 'restoxico', val: 99}],
   detalle: 'Racial. Lo tóxico no le hace nada: el daño tóxico no entra (Res. tóxico 99) y no se le puede aplicar Veneno. ⚙ Automatizado: las dos cosas.'},
  // 🕊 Vuela (2026-10-16, dueño: «Vuela debería ser una habilidad pasiva también… en la abeja»): da el estado Vuela, permanente.
  // Un personaje también la puede elegir, justificándola con el GM (dueño, 2026-10-17, P202); jobCosto 3 provisorio.
  {poolId: 'vuela', nombre: 'Vuela', jobCosto: 3, etiquetas: ['movimiento', 'criatura'], estado: 'Vuela', mods: [],
   detalle: 'Vuela bajo: nunca toca el piso (no lo frena el terreno lento, no pisa trampas, no lo tocan las zonas del piso), pasa por encima de los tokens (al cruzar a un rival, antes le da su ataque de oportunidad), no le entran Sentado ni Rengo, y −1 a la Evasión contra disparos. ⚙ Automatizado: mientras la tenga, lleva puesto el estado Vuela. ✋ A mano: un personaje la elige justificándola en la historia con el GM.'},
  {poolId: 'robustez', nombre: 'Robustez', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+5 Hp.Max.', mods: [{stat: 'hpmax', val: 5}]},
  {poolId: 'reserva-de-poder', nombre: 'Reserva de poder', jobCosto: 1, etiquetas: ['stat'],
   detalle: '+3 SP.', mods: [{stat: 'sp', val: 3}]},
  {poolId: 'recuperacion-mental', nombre: 'Recuperación mental', jobCosto: 1, etiquetas: ['regeneración'],
   detalle: 'Recuperás +1 SP por turno (en el Mantenimiento).', mods: [{stat: 'spregen', val: 1}]},
  {poolId: 'regeneracion', nombre: 'Regeneración', jobCosto: 1, etiquetas: ['regeneración', 'defensiva'],
   detalle: 'Recuperás 3 HP por turno (en el Mantenimiento).', mods: [], regenHp: 3},
  {poolId: 'voluntad-de-hierro', nombre: 'Voluntad de hierro', jobCosto: 1, etiquetas: ['resistencia', 'stat'],
   detalle: '+2 a la resistencia al crowd control.', mods: [{stat: 'rescc', val: 2}]},
  {poolId: 'percepcion-aumentada', nombre: 'Percepción aumentada', jobCosto: 1, etiquetas: ['utilidad', 'percepción'],
   detalle: 'Tus tiradas de percepción usan un dado más alto (cada dado sube un escalón). Además, las trampas ocultas cercanas te avisan: si en tu camino quedás justo al lado de una, el movimiento se interrumpe y corresponde una tirada de percepción. Y no tenés punto ciego para el sigilo: un personaje en sigilo pegado a tu espalda también te da la tirada para descubrirlo (la casilla de atrás cuenta como zona de alerta). ⚙ Automatizado en el mapa.',
   mods: [], percepcionAumentada: true},
  {poolId: 'ojo-avizor', nombre: 'Ojo avizor', jobCosto: 1, etiquetas: ['visión', 'utilidad'],
   detalle: '+2 al campo de visión (radio en hexágonos). Solo para personajes.', mods: [{stat: 'vision', val: 2}]},   // (dueño, 2026-11-11: «subile +2 al ojo avizor»; es para jugadores, no para creeps)
  // Resto de los stats secundarios (escalón +1 = lo que da 1 punto de su atributo).
  {poolId: 'temple-magico', nombre: 'Temple mágico', jobCosto: 1, etiquetas: ['stat', 'resistencia'],
   detalle: '+1 Res.Esp (resistencia mágica).', mods: [{stat: 'resmg', val: 1}]},
  {poolId: 'golpe-fuerte', nombre: 'Golpe fuerte', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Dmg (daño).', mods: [{stat: 'dmg', val: 1}]},
  // 🗡 Perforante (2026-10-30, dueño, P236: «hacemos como decís vos»): Perfora 2 por 1 Job, al lado de Golpe fuerte (+1 al daño). La Perfora no suma
  // daño: asegura que lastime (y que entren los efectos «si lo lastima»); por eso 2 y no 1. Da el estado Perforante (comun/estados-presets.js).
  {poolId: 'perforante', nombre: 'Perforante', jobCosto: 1, etiquetas: ['ofensiva'], estado: 'Perforante', mods: [],
   detalle: 'Perfora 2: en cada golpe, 2 puntos del daño pasan siempre la Defensa del rival. No suma daño: asegura que lastime aunque tenga mucha armadura (y que entren los efectos «si lo lastima», como el veneno); con crítico no hace falta. Se suma a la Perfora del arma. ⚙ Automatizado: mientras la tenga, lleva puesto el estado Perforante y el mapa lo cuenta en cada golpe.'},
  {poolId: 'guardia-firme', nombre: 'Guardia firme', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Bloqueo.', mods: [{stat: 'bloqueo', val: 1}]},
  {poolId: 'espalda-de-mula', nombre: 'Espalda de mula', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 Crg.Max (carga máxima).', mods: [{stat: 'crgmax', val: 1}]},
  {poolId: 'pies-ligeros', nombre: 'Pies ligeros', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Eva (evasión).', mods: [{stat: 'eva', val: 1}]},
  // 💨 Prisa (2026-10-15, dueño: reemplaza a «Reflejos de gato», +1 Iniciativa). Desde el 2026-11-20 (dueño: «en lugar de que te mande siempre primero a la
  // lista de iniciativas, te dé +5 a la tirada de iniciativa») ya no pone primero: suma 5 a la Iniciativa. Quien tenía la copia vieja (stat `prisa`) pasa
  // sola a esta al cargarse (Combatiente.pasivasAlDia). El texto está también en Combatiente.PRISA_DETALLE (el mapa no carga este archivo).
  {poolId: 'prisa', nombre: 'Prisa', jobCosto: 1, etiquetas: ['utilidad'],
   detalle: '+5 a la tirada de Iniciativa: arrancás el combate con ventaja para jugar antes. No te pone primero por sí sola: se suma a tu tirada y el orden lo decide el resultado, como con cualquiera. ⚙ Automatizado: se suma sola a tu Iniciativa.', mods: [{stat: 'ini', val: 5}]},
  // 👣 Pasos silenciosos (2026-10-15, dueño: «puede ser una pasiva de job, que además te da un +1 adicional a la pdg»): un sigilo suave.
  // 2026-10-21 (dueño): se llama «Paso ligero» (el id y el stat siguen igual).
  {poolId: 'pasos-silenciosos', nombre: 'Paso ligero', jobCosto: 1, etiquetas: ['utilidad'],
   detalle: 'Nadie te oye acercarte por la espalda (no es sigilo: se te ve): se te ve recién al quedar pegado, y no le das tiempo a darse vuelta. Atacar por la espalda te suma +1 PdG más (+2 en total). ⚙ Automatizado: el mapa no te hace oír a 3 casilleros y suma el PdG en el duelo.', mods: [{stat: 'pasossilenciosos', val: 1}]},
  {poolId: 'impulso', nombre: 'Impulso', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 No2 (nitros). ⚠ De las más fuertes para 1 Job: a revisar.', mods: [{stat: 'nitros', val: 1}]},
  {poolId: 'vista-de-halcon', nombre: 'Vista de halcón', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Rng (rango). ⚠ A revisar.', mods: [{stat: 'rng', val: 1}]},
  {poolId: 'punteria', nombre: 'Puntería', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 PdG (probabilidad de golpe).', mods: [{stat: 'pdg', val: 1}]},
  {poolId: 'ojo-critico', nombre: 'Ojo crítico', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Crítico frecuente.', mods: [{stat: 'crit', val: 1}]},   // (dueño, 2026-11-05: «le sacamos el revisar a ojo crítico»)
  // 🦅 Ojo de carancho (dueño, 2026-11-07, del boceto del L1 Sangrador nivel 4: «una pasiva general: +1 PdG contra cualquier rival con algún
  // debuff… sube la probabilidad de golpe, el stat probabilidad de golpe»). Corrección del mismo día: «a cualquier tirada que use Probabilidad de Golpe, armas y hechizos» (PdG y PdG.Esp).
  {poolId: 'ojo-de-carancho', nombre: 'Ojo de carancho', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: '+1 a la Probabilidad de Golpe (PdG con armas y PdG.Esp con hechizos) contra cualquier rival que tenga algún estado malo encima (Sangrado, Veneno, Rengo, Armadura rota…): el carancho huele al que está flojo. ⚙ Automatizado: el duelo lo suma solo y se ve «+1 Ojo de carancho» en la tirada.', mods: [{stat: 'ojocarancho', val: 1}]},
  // 🐝 Táctica de enjambre (dueño, 2026-11-20: «tenés +1 a la pdg por cada aliado adyacente. cuesta 2 puntos de job»). Lo suma el mapa al atacar
  // (vtt-hexgrid/js/65, enjambreDeToken → Duelo.crear). Solo los ataques con arma y el PdG común, mientras tanto: P249 en docs/preguntas-abiertas.md.
  {poolId: 'tactica-de-enjambre', nombre: 'Táctica de enjambre', jobCosto: 2, etiquetas: ['ofensiva'],
   detalle: '+1 a la Probabilidad de Golpe por cada aliado que tengas pegado (a 1 casilla tuya) en el momento de atacar con tu arma, sin tope: solo sos uno más, en enjambre sos un problema. ⚙ Automatizado en el mapa: al atacar cuenta a tus aliados pegados (los de tu bando que están en pie; vos no te contás) y se ve «🐝 Táctica de enjambre +2: 2 aliados al lado» en el cuadro del duelo y en la tirada. Vale también en el contraataque y en el ataque de oportunidad. ✋ Fuera del mapa (la ficha suelta) no suma: ahí se suma a mano.',
   mods: [{stat: 'enjambre', val: 1}]},
  // 🛡 Aguante de trinchera (dueño, 2026-11-20: «un skill pasiva por 2 puntos de Job que te dé +1 la defensa y +1 la defensa especial por cada enemigo
  // adyacente»; el nombre lo eligió él). El espejo de la Táctica de enjambre: lo cuenta el mapa cuando le llega el golpe (vtt-hexgrid/js/65 y js/10).
  {poolId: 'aguante-de-trinchera', nombre: 'Aguante de trinchera', jobCosto: 2, etiquetas: ['defensiva'],
   detalle: '+1 a la Defensa y +1 a la Defensa especial por cada enemigo que tengas pegado (a 1 casilla tuya) en el momento en que te llega el golpe, sin tope: cuanto más te rodean, más aguantás. ⚙ Automatizado en el mapa: al recibir daño cuenta a los enemigos pegados que se ven (no los escondidos ni los caídos; un tótem o un estandarte no cuenta) y se ve «🛡 Aguante de trinchera +2: 2 enemigos pegados» en el cuadro del duelo y en la cuenta del daño; la 🔍 de Defensa dice cuánto suma en ese momento. Un golpe crítico ignora la Defensa, como siempre. ✋ Fuera del mapa (la ficha suelta) no suma: ahí se suma a mano.',
   mods: [{stat: 'trinchera', val: 1}]},
  // 🛡 Resistencia a crítico (2026-11-05, dueño: «si no existe ninguna pasiva… que interactúe con la resistencia del crítico, ya diseñaría alguno»;
  // docs/propuesta-pasivas-consumibles-res-critico.md). Las de la vida las suma el duelo al calcular el crítico (Combatiente.resCritPorVida).
  {poolId: 'callo-de-batalla', nombre: 'Callo de batalla', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Res. crítico Tipo 4: de tanto ligarla, ya ni se mosquea. ⚙ Automatizado.', mods: [{stat: 'tipo1', val: 1}]},
  // Cuero duro (dueño, 2026-11-05: «Cuero duro queda»).
  {poolId: 'cuero-duro', nombre: 'Cuero duro', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Res. crítico Tipo 6 y +1 Res. crítico Tipo 8: el pellejo curtido aguanta los cortes y los hachazos. ⚙ Automatizado.', mods: [{stat: 'tipo2', val: 1}, {stat: 'tipo3', val: 1}]},
  // 🥁 Orden de turnos (dueño, 2026-11-05: «marcar el ritmo como pasiva me gusta… es una pasiva, punto»; «bloodlust… cuando un rival cae por tu golpe sube 2
  // lugares»). Las mueve la pantalla del GM (vtt-hexgrid/js/102), con las reglas del orden (comun/orden-turnos.js): nadie juega dos veces, subir y bajar
  // se cancelan, uno por ronda.
  {poolId: 'marcar-el-ritmo', nombre: 'Marcar el ritmo', jobCosto: 1, etiquetas: ['utilidad'],
   detalle: 'Al empezar cada ronda, un aliado pegado a vos sube 1 lugar en el orden de turnos (si tenés varios al lado, elegís a cuál): vas marcando el paso y te sigue. ⚙ Automatizado: lo hace el mapa del GM al empezar la ronda (como mucho un efecto de orden por personaje y por ronda).', mods: [{stat: 'ritmo', val: 1}]},
  // ⚔ Devolver gentileza (dueño, 2026-11-05: «una habilidad pasiva que sí habilite el contraataque… tenés que ganar el parry y el bloqueo, y solo en
  // ese contexto te permite contraatacar»). El contraataque libre tras un Bloqueo exitoso se fue: ahora hace falta esta pasiva o la habilidad Contraataque.
  {poolId: 'devolver-gentileza', nombre: 'Devolver gentileza', jobCosto: 1, etiquetas: ['ofensiva', 'defensiva'],
   detalle: 'Si ganás el Parry y el Bloqueo contra un golpe cuerpo a cuerpo, podés contraatacar al que te atacó: cuesta lo de un primer ataque y no cuenta como tu ataque del turno. Sin bonus (la habilidad Contraataque, en cambio, te deja contestar apenas ganás la Evasión o el Parry y suma +2 a la Probabilidad de Golpe). ⚙ Automatizado: el duelo te pregunta «¿Contraatacás?».', mods: [{stat: 'gentileza', val: 1}]},
  {poolId: 'sed-de-sangre', nombre: 'Sed de sangre', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: 'Cuando un rival cae por tu golpe, el subidón te pone primero en la fila: subís 2 lugares en el orden de turnos (si ya jugaste esta ronda, al empezar la próxima). ⚙ Automatizado: lo hace el mapa del GM cuando el golpe del duelo lo deja en 0.', mods: [{stat: 'sedsangre', val: 2}]},
  // ⚔ Sed de batalla (dueño, 2026-11-05, del boceto del W1 Hachero: «sumamos Sed de batalla como pasiva, que la puedan elegir los jugadores también»).
  {poolId: 'sed-de-batalla', nombre: 'Sed de batalla', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: 'Cuando un rival cae por tu golpe, el envión te devuelve el aire: ganás 3 No2, aunque pases de tu máximo (los de más no se pierden al empezar tu turno: la recarga solo sube hasta el máximo, nunca baja). ⚙ Automatizado: lo hace el mapa cuando el golpe del duelo lo deja en 0, y te avisa.', mods: [{stat: 'sedbatalla', val: 3}]},   // (2026-11-05, dueño: «más que 2 le pondría 3… puede ser superior al máximo»)
  // 🦎 Escurridizo (dueño, 2026-11-07: «vamos a crear una pasiva que sea algo parecido [al Paso atrás], pero un poco menos fuerte»): sin el +2 y pagando
  // el No2 del paso. Lo ofrece el mapa de quien esquivó (vtt-hexgrid/js/107-liviano.js).
  {poolId: 'escurridizo', nombre: 'Escurridizo', jobCosto: 1, etiquetas: ['defensiva'],
   detalle: 'Cuando ganás la Evasión contra un ataque cuerpo a cuerpo, podés moverte 1 casilla sin dar ataques de oportunidad, pagando el No2 de ese paso como siempre. ⚙ Automatizado: al esquivar te aparece el aviso «¿Querés dar un paso?» y la casilla se elige con un clic.', mods: [{stat: 'escurridizo', val: 1}]},
  // 💚 Manos de curandero (dueño, 2026-11-06: «una pasiva que cada cura… +1 me parece muy poco, probemos +5»; el mismo día: «+5 en curas directas o
  // individuales y +2 en curas en área y regeneraciones; y que también aplique a pergaminos y a pociones»).
  {poolId: 'manos-de-curandero', nombre: 'Manos de curandero', jobCosto: 1, etiquetas: ['utilidad'],
   detalle: 'Cada cura que das cura más: +5 si es a uno solo (Sanar, Purificar, una varita o un arma que cura, una poción) y +2 a cada uno si es en área (la Oleada sanadora, un pergamino de grupo) o por turno (cada turno de Regeneración, Bálsamo, Círculo o Aura sanadora). También sobre vos. No vale para la Transfusión (no es una cura: pasa vida). ⚙ Automatizado: el duelo, el mapa y los consumibles la suman solos.', mods: [{stat: 'curamas', val: 5}, {stat: 'curamasarea', val: 2}]},
  {poolId: 'manas-de-sobreviviente', nombre: 'Mañas de sobreviviente', jobCosto: 1, etiquetas: ['defensiva'],
   detalle: 'Con la vida a la mitad o menos: +1 Res. crítico contra todos los Tipos. ⚙ Automatizado: el duelo lo suma al calcular el crítico, mirando tu vida en ese momento.', mods: [{stat: 'rescritmitad', val: 1}]},
  {poolId: 'contra-las-cuerdas', nombre: 'Contra las cuerdas', jobCosto: 1, etiquetas: ['defensiva'],
   detalle: 'Con la vida en menos de un cuarto: +2 Res. crítico contra todos los Tipos (se suma a Mañas de sobreviviente). ⚙ Automatizado: el duelo lo suma al calcular el crítico, mirando tu vida en ese momento.', mods: [{stat: 'rescritcuarto', val: 2}]},
  {poolId: 'desvio-habil', nombre: 'Desvío hábil', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Parry.', mods: [{stat: 'parry', val: 1}]},
  // 🔨 Maestría en armas pesadas (dueño, 2026-11-20: «da +2 a pdg en armas de tipo 10, y además da +1 al parry con ese tipo de armas», para jugadores y
  // creeps). jobCosto 1 (confirmado por el dueño, P248).
  {poolId: 'maestria-armas-pesadas', nombre: 'Maestría en armas pesadas', jobCosto: 1, etiquetas: ['ofensiva', 'defensiva'],
   detalle: '+2 a la Probabilidad de Golpe con armas de Tipo 10 (contundentes) y +1 al Parry cuando parás con un arma de Tipo 10. ⚙ Automatizado: el PdG de más se suma solo al atacar con un arma de Tipo 10, y el Parry de más solo al parar con ella (no con un escudo ni con un arma de otro Tipo); se ve en la 🔍 de Atacar y de Parry.',
   mods: [{stat: 'pdgt10', val: 2}, {stat: 'parryt10', val: 1}]},
  /* ⚔ Las otras cinco maestrías (dueño, 2026-11-20; docs/cola-de-pruebas.md, con los «ajustes del dueño»): 1 Job cada una, para jugadores y creeps. Cada
     bono vale SOLO con un arma de esa familia en la mano (Combatiente.familiaDeArma / MAESTRIA_STATS): punzante = Tipo 4 cuerpo a cuerpo, cortante = Tipo 6
     cuerpo a cuerpo, hacha = Tipo 8 cuerpo a cuerpo; arco y ballesta, como los distingue el juego (la ballesta es el arma de rango con Recarga). */
  {poolId: 'maestria-armas-punzantes', nombre: 'Maestría en armas punzantes', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: 'Con un arma punzante cuerpo a cuerpo (Tipo 4; no arcos, ballestas ni proyectiles): +1 al daño de cada golpe, +1 a la Probabilidad de Golpe en un ataque de oportunidad y +1 a la Probabilidad de Golpe al pegar por la espalda (se suma al +1 que ya da la espalda). ⚙ Automatizado: el daño y el ataque de oportunidad se suman solos al tirar; lo de la espalda lo suma el mapa al abrirse el duelo. Se ve en la 🔍 de Atacar y de Daño y en el cuadro del duelo. Con otra arma no suma nada.',
   mods: [{stat: 'dmgt4', val: 1}, {stat: 'oport4', val: 1}, {stat: 'espaldat4', val: 1}]},
  {poolId: 'maestria-armas-cortantes', nombre: 'Maestría en armas cortantes', jobCosto: 1, etiquetas: ['ofensiva', 'defensiva'],
   detalle: 'Con un arma cortante de mano (Tipo 6; no una ballesta): +1 al Parry y +1 al Bloqueo cuando parás y bloqueás con ella (no con un escudo ni con un arma de otro Tipo), y +1 a la Probabilidad de Golpe en un contraataque hecho con ella. ⚙ Automatizado: se suma solo al tirar; se ve en la 🔍 de Parry, de Bloqueo y de Atacar.',
   mods: [{stat: 'parryt6', val: 1}, {stat: 'bloqueot6', val: 1}, {stat: 'contrat6', val: 1}]},
  {poolId: 'maestria-hachas', nombre: 'Maestría en hachas', jobCosto: 1, etiquetas: ['ofensiva', 'defensiva'],
   detalle: 'Con un hacha (Tipo 8, cuerpo a cuerpo): el segundo ataque del turno con ella y los siguientes cuestan 2 No2 menos (6 en vez de 8), y +1 al Bloqueo cuando bloqueás con el hacha. ⚙ Automatizado: el botón Atacar ya muestra el costo rebajado desde el segundo ataque y su 🔍 dice por qué; el Bloqueo de más se ve en la 🔍 de Bloqueo.',
   mods: [{stat: 'ahorrot8', val: 2}, {stat: 'bloqueot8', val: 1}]},
  {poolId: 'maestria-arcos', nombre: 'Maestría en arcos', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: 'Con un arco: +1 a la Probabilidad de Golpe y +2 al Crítico potente. ⚙ Automatizado: se suma solo al disparar con un arco (no con una ballesta ni con otra arma de rango); se ve en la 🔍 de Atacar y en el cuadro del duelo.',
   mods: [{stat: 'pdgarco', val: 1}, {stat: 'critpotarco', val: 2}]},
  {poolId: 'maestria-ballestas', nombre: 'Maestría en ballestas', jobCosto: 1, etiquetas: ['ofensiva'],
   detalle: 'Con una ballesta: +1 a la Probabilidad de Golpe y Perfora +1 (1 punto más del daño pasa siempre la Defensa del rival; se suma a la Perfora que ya tengan la ballesta y el virote). ⚙ Automatizado: se suma solo al disparar con una ballesta (no con un arco); se ve en la 🔍 de Atacar y en el cuadro del duelo.',
   mods: [{stat: 'pdgballesta', val: 1}, {stat: 'perforaballesta', val: 1}]},
  {poolId: 'punteria-arcana', nombre: 'Puntería arcana', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 PdG.Esp (probabilidad de golpe mágico).', mods: [{stat: 'pdgmg', val: 1}]},
  {poolId: 'potencia-especial', nombre: 'Potencia especial', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Ef.Esp (efecto especial).', mods: [{stat: 'dmgesp', val: 1}]},
  {poolId: 'mente-serena', nombre: 'Mente serena', jobCosto: 1, etiquetas: ['stat', 'resistencia'],
   detalle: '+1 Res.Mt (resistencia mental).', mods: [{stat: 'resm', val: 1}]},
  {poolId: 'largo-alcance-arcano', nombre: 'Largo alcance arcano', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 Rango (hasta dónde llegan tus armas a distancia y lo especial).', mods: [{stat: 'rng', val: 1}]},   // ex +1 Rango de casteo (2026-10-07)
  // Otros stats (fuera de los cinco atributos).
  {poolId: 'piel-curtida', nombre: 'Piel curtida', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Defensa.', mods: [{stat: 'def', val: 1}]},
  {poolId: 'bolsillos-extra', nombre: 'Bolsillos extra', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 ranura de cinturón para consumibles.', mods: [{stat: 'capcinturon', val: 1}]},
];

/* Categorías de una pasiva (2026-10-02, pedido del dueño: filtrar las pasivas por categoría; las armó el asistente). Salen de sus etiquetas y de
   lo que suma, así una pasiva subida sin categoría igual cae en una: Recuperación (regenera), Recursos (SP o No2), Ofensivas, Defensivas
   (incluye las resistencias) y Utilidad (visión, percepción, carga…). Una pasiva va en una sola, la primera que le corresponde en ese orden. */
const CATEGORIAS_PASIVA = [
  {id: 'ofensiva', nombre: '🗡 Ofensivas'}, {id: 'defensiva', nombre: '🛡 Defensivas'}, {id: 'recuperacion', nombre: '❤ Recuperación'},
  {id: 'recursos', nombre: '⚡ Recursos'}, {id: 'utilidad', nombre: '🧭 Utilidad'},
];
function categoriaDePasiva(p){
  const et = (p && p.etiquetas || []).map(e => String(e).toLowerCase());
  const stats = (p && p.mods || []).map(m => m && m.stat);
  if(et.includes('regeneración') || et.includes('regeneracion') || (p && Number(p.regenHp) > 0)) return 'recuperacion';
  if(stats.some(s => ['sp', 'nitros', 'spregen'].includes(s))) return 'recursos';
  if(et.includes('ofensiva')) return 'ofensiva';
  if(et.includes('defensiva') || et.includes('resistencia')) return 'defensiva';
  return 'utilidad';
}

// Una pasiva del catálogo (o de la biblioteca) lista para un creep o una invocación (2026-10-16: la usan GM Tools y la ficha): lo que suma,
// la vida por turno, el estado que da y las compras (sin Job). `id`: el id nuevo.
function pasivaParaCombatiente(datos, id){
  const clave = datos.poolId || String(datos.nombre || '').toLowerCase();
  return {id, poolId: clave, nombre: datos.nombre, detalle: datos.detalle || '', mods: (datos.mods || []).map(m => ({...m})),
    regenHp: Number(datos.regenHp) || 0, ...(String(datos.estado || '').trim() ? {estado: String(datos.estado).trim()} : {}), compras: 1};
}

