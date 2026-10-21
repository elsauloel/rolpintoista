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
   detalle: 'Tus tiradas de percepción usan un dado más alto (cada dado sube un escalón). Además, las trampas ocultas cercanas te avisan: si en tu camino quedás justo al lado de una, el movimiento se interrumpe y corresponde una tirada de percepción.',
   mods: [], percepcionAumentada: true},
  {poolId: 'ojo-avizor', nombre: 'Ojo avizor', jobCosto: 1, etiquetas: ['visión', 'utilidad'],
   detalle: '+1 al campo de visión (radio en hexágonos).', mods: [{stat: 'vision', val: 1}]},
  // Resto de los stats secundarios (escalón +1 = lo que da 1 punto de su atributo).
  {poolId: 'temple-magico', nombre: 'Temple mágico', jobCosto: 1, etiquetas: ['stat', 'resistencia'],
   detalle: '+1 Res.Esp (resistencia mágica).', mods: [{stat: 'resmg', val: 1}]},
  {poolId: 'golpe-fuerte', nombre: 'Golpe fuerte', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Dmg (daño).', mods: [{stat: 'dmg', val: 1}]},
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
   detalle: '+1 Crítico frecuente. ⚠ A revisar.', mods: [{stat: 'crit', val: 1}]},
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

