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
   P70): Res.CC da +2. Solo van acá las tandas que el dueño ya validó. */
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
];
