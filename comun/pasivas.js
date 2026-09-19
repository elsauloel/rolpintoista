/* Catálogo base de habilidades pasivas (las que cuestan puntos de Job).
   La ficha las ofrece en "+ Pasiva → Elegir del catálogo" (junto con las que
   el dueño del proyecto aprueba desde Firebase, ver comun/biblioteca.js) y
   las copia tal cual al personaje.

   Una pasiva no es solo un bono a un stat: es una habilidad con efectos.
   Los que se pueden automatizar funcionan solos al cargarla:
   - mods: [{stat, val}] — bonos a stats (mismos ids que MOD_TARGETS de la
     ficha). Con varias compras se multiplican.
   - regenHp: HP que recupera en cada Mantenimiento, por compra.
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
  {poolId: 'ojo-avizor', nombre: 'Ojo avizor', jobCosto: 1, etiquetas: ['visión', 'utilidad'],
   detalle: '+1 al campo de visión (radio en hexágonos).', mods: [{stat: 'vision', val: 1}]},
  // Resto de los stats secundarios (escalón +1 = lo que da 1 punto de su atributo).
  {poolId: 'temple-magico', nombre: 'Temple mágico', jobCosto: 1, etiquetas: ['stat', 'resistencia'],
   detalle: '+1 Res.Mg (resistencia mágica).', mods: [{stat: 'resmg', val: 1}]},
  {poolId: 'golpe-fuerte', nombre: 'Golpe fuerte', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Dmg (daño).', mods: [{stat: 'dmg', val: 1}]},
  {poolId: 'guardia-firme', nombre: 'Guardia firme', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Bloqueo.', mods: [{stat: 'bloqueo', val: 1}]},
  {poolId: 'espalda-de-mula', nombre: 'Espalda de mula', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 Crg.Max (carga máxima).', mods: [{stat: 'crgmax', val: 1}]},
  {poolId: 'pies-ligeros', nombre: 'Pies ligeros', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Eva (evasión).', mods: [{stat: 'eva', val: 1}]},
  {poolId: 'reflejos-de-gato', nombre: 'Reflejos de gato', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 Iniciativa.', mods: [{stat: 'ini', val: 1}]},
  {poolId: 'impulso', nombre: 'Impulso', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 No2 (nitros). ⚠ De las más fuertes para 1 Job: a revisar.', mods: [{stat: 'nitros', val: 1}]},
  {poolId: 'vista-de-halcon', nombre: 'Vista de halcón', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Rng (rango). ⚠ A revisar.', mods: [{stat: 'rng', val: 1}]},
  {poolId: 'punteria', nombre: 'Puntería', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 PdG (probabilidad de golpe).', mods: [{stat: 'pdg', val: 1}]},
  {poolId: 'ojo-critico', nombre: 'Ojo crítico', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 Crit. ⚠ A revisar.', mods: [{stat: 'crit', val: 1}]},
  {poolId: 'desvio-habil', nombre: 'Desvío hábil', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Parry.', mods: [{stat: 'parry', val: 1}]},
  {poolId: 'punteria-arcana', nombre: 'Puntería arcana', jobCosto: 1, etiquetas: ['stat', 'ofensiva'],
   detalle: '+1 PdG.Mg (probabilidad de golpe mágico).', mods: [{stat: 'pdgmg', val: 1}]},
  {poolId: 'mente-serena', nombre: 'Mente serena', jobCosto: 1, etiquetas: ['stat', 'resistencia'],
   detalle: '+1 Res.Mt (resistencia mental).', mods: [{stat: 'resm', val: 1}]},
  {poolId: 'largo-alcance-arcano', nombre: 'Largo alcance arcano', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 Rango de casteo.', mods: [{stat: 'rangocasteo', val: 1}]},
  // Otros stats (fuera de los cinco atributos).
  {poolId: 'piel-curtida', nombre: 'Piel curtida', jobCosto: 1, etiquetas: ['stat', 'defensiva'],
   detalle: '+1 Defensa.', mods: [{stat: 'def', val: 1}]},
  {poolId: 'bolsillos-extra', nombre: 'Bolsillos extra', jobCosto: 1, etiquetas: ['stat', 'utilidad'],
   detalle: '+1 ranura de cinturón para consumibles.', mods: [{stat: 'capcinturon', val: 1}]},
];
