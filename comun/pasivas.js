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
   detalle: '+1 al campo de visión (radio en hexágonos).', mods: [{stat: 'vision', val: 1}]},
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
  // 💨 Prisa (2026-10-15, dueño: reemplaza a «Reflejos de gato», +1 Iniciativa): va primero en el orden de turnos; entre dos con Prisa (de bandos
  // rivales o no), decide la tirada de iniciativa (vtt-hexgrid/js/04, ordenarIniciativa).
  {poolId: 'prisa', nombre: 'Prisa', jobCosto: 1, etiquetas: ['utilidad'],
   detalle: 'Vas primero en el orden de turnos: antes que todos los que no tienen Prisa. Si otro también la tiene (un aliado o un creep), entre ustedes decide la tirada de iniciativa. ⚙ Automatizado: el mapa te pone arriba al ordenar los turnos.', mods: [{stat: 'prisa', val: 1}]},
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

