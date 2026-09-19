/* Pool de habilidades de clase — solo las que el grupo ya cerró.
   La ficha las ofrece en "+ Habilidad → De clase" y las copia tal cual al
   personaje (campos de una habilidad: ver SCHEMA.habilidades en ficha.html).
   El borrador con todas (cerradas y pendientes) está en docs/clases-borrador.md:
   una skill se agrega acá recién cuando ahí queda marcada ✅.

   Campos de cada skill:
   - id: estable, no cambiar (marca de dónde salió la copia del personaje).
   - costo: SP como texto ("2", "X", "2 + X").
   - nitrosCosto: número, "X" (se elige al usarla) o "ATAQUE" (cuesta lo de un ataque).
   - detalle: lo que se publica en la Mesa (la Mesa corta en 300 caracteres). */
const CLASES_SKILLS = [
  {id: 'warrior', nombre: 'Warrior', habilidades: [
    {id: 'warrior-arte-de-la-guerra', nombre: 'Arte de la guerra', costo: '2', nitrosCosto: 0,
     detalle: 'Flash. +2 a una sola tirada de PdG, Parry, Bloqueo o Daño. No se usa más de una vez sobre la misma tirada. ⚖ A definir en mesa: ¿todas las veces que quieras en el turno, o una sola por turno?'},
    {id: 'warrior-amplificar-dano', nombre: 'Amplificar daño', costo: 'X', nitrosCosto: 'ATAQUE',
     detalle: 'Espameable. Ataque con +X dados de daño del Tipo del arma. X máx. 3 (a mano: la ficha no lo limita).'},
    {id: 'warrior-canon-vasco', nombre: 'Cañón Vasco', costo: '2 + X', nitrosCosto: 1,
     detalle: 'Salta X casillas (X hasta Fue); si cae sobre un enemigo lo empuja 1. Al caer, los enemigos adyacentes (flor de 1, no aliados) reciben X + tirada de Fuerza de daño de onda expansiva (defienden con Constitución, a confirmar). Puede atacar al caer (pagando el ataque) con +X daño fijo. Al ejecutar, poné el SP total (2 + X).'},
    {id: 'warrior-carga', nombre: 'Carga', costo: 'X', nitrosCosto: 'X',
     detalle: 'Avanza X casilleros en línea recta (1 No2 por casillero) y al final ataca con +X de daño fijo y +X a la PdG. El ataque final se paga aparte con Atacar. Tope de X a confirmar.'},
  ]},
  {id: 'asalto', nombre: 'Asalto', habilidades: []},
  {id: 'tanque', nombre: 'Tanque', habilidades: []},
  {id: 'mago', nombre: 'Mago', habilidades: []},
  {id: 'shooter', nombre: 'Shooter', habilidades: []},
  {id: 'support', nombre: 'Support', habilidades: []},
  {id: 'debuffer', nombre: 'Debuffer', habilidades: []},
];
