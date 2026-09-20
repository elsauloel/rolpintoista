/* Pool de habilidades de clase.
   La ficha las ofrece en "+ Habilidad → De clase" y las copia tal cual al
   personaje (campos de una habilidad: ver SCHEMA.habilidades en ficha.html).
   El borrador de trabajo con todas está en docs/clases-borrador.md.

   Dos tipos de skill:
   - Auditadas (✅ en el borrador): automatizadas, con costo (SP y No2) y su
     descripción definitiva.
   - Sin auditar (SA): solo se anuncian en la Mesa (automatizada:false), con
     "(Sin auditar)" al principio de la descripción y el costo del PDF
     escrito ahí adentro como referencia. Al auditar una, se pasa a la lista
     de auditadas (con costo real) y se saca de SA.

   Campos de una auditada:
   - id: estable, no cambiar (marca de dónde salió la copia del personaje).
   - costo: SP como texto ("2", "X", "2 + X").
   - nitrosCosto: número, "X" (se elige al usarla) o "ATAQUE" (cuesta lo de un ataque).
   - detalle: lo que se publica en la Mesa (la Mesa corta en 300 caracteres). */
const SKILL_SIN_AUDITAR = '(Sin auditar) ';
// Arma una skill sin auditar: solo título y descripción, se anuncia.
const skillSA = (clase, nombre, detalle) => ({
  id: clase + '-' + nombre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
  nombre, detalle: SKILL_SIN_AUDITAR + detalle, automatizada: false,
});

const CLASES_SKILLS = [
  {id: 'warrior', nombre: 'Warrior', habilidades: [
    {id: 'warrior-arte-de-la-guerra', nombre: 'Arte de la guerra', costo: '2', nitrosCosto: 0,
     detalle: 'Flash. +2 a una sola tirada de PdG, Parry, Bloqueo o Daño. No se usa más de una vez sobre la misma tirada. ⚖ A definir en mesa: ¿todas las veces que quieras en el turno, o una sola por turno?'},
    {id: 'warrior-amplificar-dano', nombre: 'Amplificar daño', costo: 'X', nitrosCosto: 'ATAQUE',
     detalle: 'Ataque con +X dados de daño del Tipo del arma. X máx. 3 (a mano: la ficha no lo limita).'},
    skillSA('warrior', 'Sacadito', 'En pausa, a definir. SP 3. Recibe 10 Nitros que puede usar en ataques consecutivos iguales. Acumulable con otras skills si todos los ataques son idénticos.'),
    {id: 'warrior-canon-vasco', nombre: 'Cañón Vasco', costo: '2 + X', nitrosCosto: 1,
     detalle: 'Salta X casillas (X hasta Fue); si cae sobre un enemigo lo empuja 1. Al caer, los enemigos adyacentes (flor de 1, no aliados) reciben X + tirada de Fuerza de daño de onda expansiva (defienden con Constitución, a confirmar). Puede atacar al caer (pagando el ataque) con +X daño fijo. Al ejecutar, poné el SP total (2 + X).'},
    {id: 'warrior-carga', nombre: 'Carga', costo: 'X', nitrosCosto: 'X',
     detalle: 'Avanza X casilleros en línea recta (1 No2 por casillero) y al final ataca con +X de daño fijo y +X a la PdG. El ataque final se paga aparte con Atacar. Tope de X a confirmar.'},
    skillSA('warrior', 'Estoicismo', 'SP 2. No2 0. Flash. +2 Def por cada enemigo adyacente. +1 Res.Crit *.'),
    skillSA('warrior', 'Remolino', 'SP 3. Ataque que daña a todos los objetivos adyacentes. Puede desplazarse una casilla; si lo hace, cuenta las áreas de efecto de ambas posiciones. Repetirlo de inmediato ignora el cooldown del arma.'),
    skillSA('warrior', 'Parry', 'SP 2. No2 1. Cooldown 1. Flash. Reemplaza la EV por PG en una tirada de evasión. El que tenga el arma más pesada tiene una bonificación igual a la diferencia en el peso de las armas.'),
    skillSA('warrior', 'Contraataque', 'SP 2. Permite realizar un ataque de oportunidad después de esquivar un ataque.'),
  ]},
  {id: 'asalto', nombre: 'Asalto', habilidades: [
    skillSA('asalto', 'Dash', 'SP 3. No2 1 + Ataque. Avanza 3 casilleros en línea recta atravesando hasta 1 enemigo. Ataca a los enemigos que atraviesa. +2 fijo al parry. Se cancela si pierde una tirada de parry o bloqueo. Si atraviesa un enemigo, se desplaza un casillero adicional.'),
    skillSA('asalto', 'Lisiar', 'SP 2. Ataque con +1 al crítico. Lesión de -1 de PG al objetivo durante 2 turnos. Si es crítico, el efecto pasa a -2 fijo a la PG por 2 turnos.'),
    skillSA('asalto', 'Tajear', 'SP 3. Ataque con +1 al crítico. Deja heridas de 3 de daño por 3 turnos. Si es crítico, pasa a 5 de daño hasta curarse.'),
    skillSA('asalto', 'Invi', 'SP 5. Invisible por Invi × 2 turnos. Se detecta con Percepción (ESP). El rango depende de la velocidad: normal (1 No2 por casillero) flor de 3; lenta (2 No2 por casillero) flor de 2.'),
    skillSA('asalto', 'Envenenar arma', 'SP 2. Mejora el arma con veneno: +3 fijo al daño y 3 stacks de veneno. Dura 2 ataques.'),
    skillSA('asalto', 'Backstab', 'SP 2. Únicamente por la espalda. +5 daño fijo. Ignora 1 de resistencia a crítico.'),
    skillSA('asalto', 'Degollar', 'SP 7. Ataque devastador: +4 de PG, +7 de daño y +1 al crítico. Interrumpe tu turno y pasás al final de la iniciativa. Hasta tu próximo turno perdés 50% de evasión y no podés usar No2 para responder a acciones enemigas.'),
    skillSA('asalto', 'Sprint', 'SP 1. 2 No2: avanza 3 casillas.'),
    skillSA('asalto', 'Tronco de huída', 'SP 2. +2 fijo a una tirada de evasión con giro.'),
    skillSA('asalto', 'Robar SP', 'SP 1. Ganás 2 SP por cada crítico obtenido.'),
  ]},
  {id: 'tanque', nombre: 'Tanque', habilidades: [
    {id: 'tanque-blindaje', nombre: 'Blindaje', costo: '1', nitrosCosto: 0,
     efectoNombre: 'Barrera', efectoTurnos: 1,
     efectoDetalle: 'Blindaje del Tanque: absorbe 8 de daño de la próxima fuente de daño este turno, como una barra de HP secundaria (🛡). Si la fuente hace más, el resto entra normal.',
     detalle: 'Flash (SP x 2: si la usás en turno ajeno, pagá 1 SP más a mano). Solo sobre vos: absorbe 8 de daño de la próxima fuente de daño este turno; si hace más, el resto entra normal.'},
    skillSA('tanque', 'Shockwave', 'SP 4. Onda expansiva (Fuerza / Constitución). Flash (SP x 2). Todos los adyacentes al tanque quedan en Pajaritos (mitad de tiradas de DES, ESP y AGI) hasta el final de su próximo turno.'),
    skillSA('tanque', 'Aura de espinas', 'SP 1. Devuelve 1/4 del daño del ataque como true damage hasta el comienzo del próximo turno.'),
    {id: 'tanque-recuperacion', nombre: 'Recuperación', costo: '1', nitrosCosto: 2, curaHp: 9,
     detalle: 'Recuperás 9 HP (fijos, sin pasar tu HP máximo). Solo sobre vos. Se puede usar con el HP lleno: gasta igual.'},
    skillSA('tanque', 'Sonic Boom', 'SP 2. Onda expansiva (Fuerza / Constitución). Flash (SP x 2). Cono al frente: pierden No2 igual a 1 + la diferencia en la tirada. Si pierden todos, quedan Sentados (-2 evasión, no atacan, 1 No2 para pararse).'),
    skillSA('tanque', 'Piel resistente', 'SP 5. Armadura temporal: Defensa 5, Res. Mágica 5, reduce críticos de todo tipo. Dura 2 turnos.'),
    skillSA('tanque', 'Daño en área', 'SP 2. Ataque con daño en área de flor. No afecta al tanque.'),
    skillSA('tanque', 'Takle', 'SP 3. Flash (SP x 2). Se desplaza hasta 2 casillas. Ataque con +1 a PG. Si gana una tirada de Constitución, el objetivo pierde 2 Nitros, es empujado 2 casillas, se interrumpe su turno y pasa al final de la iniciativa (si ya era último, pierde el turno).'),
    skillSA('tanque', 'Taunt', 'SP 1. Tira Especial + 1 contra Especial para obligar a un enemigo a atacarte hasta el final de su próximo turno.'),
    skillSA('tanque', 'Miti-Miti', 'SP 2. Marca un personaje como protegido: comparte con el tanque la mitad del daño que recibe. Dura 1 turno.'),
  ]},
  {id: 'mago', nombre: 'Mago', habilidades: [
    skillSA('mago', 'Chispazo', 'SP 1. No2 3. Hechizo (PG: Esp · Daño: Esp). Dispara un proyectil T4 P1 que ignora armadura.'),
    skillSA('mago', 'Rayo Mágico', 'SP X. No2 5. Hechizo. Rayo arcano de daño tipo 1. Amplifica el daño en el doble de X. X no puede ser mayor a Especial.'),
    skillSA('mago', 'Orbe arcano', 'SP 4. No2 5. Hechizo. Orbe arcano de daño en área tipo 5, amplifica el daño en 4. Área: flor de 1.'),
    skillSA('mago', 'Tormenta arcana', 'SP 15. No2 5. Hechizo. Lluvia de 1d20 proyectiles arcanos T4 P1 en flor de 2, caen al azar sobre todos los objetivos posibles. Esquivable solo con dodge roll.'),
    skillSA('mago', 'Ráfaga arcana', 'SP 2. No2 3. Hechizo. Ráfaga de daño en área tipo 3. Área: cono de 3 al frente.'),
    skillSA('mago', 'Toque mágico', 'SP 3. No2 4. Hechizo. Requiere un toque físico con la mano o el arma, PG contra Evasión. No se puede bloquear. A distancia melé hace 3d T6 + ESP de daño mágico.'),
    skillSA('mago', 'Carga Elemental', 'SP X (la mitad del coste del skill que modifica). Modifica un skill de daño mágico para darle propiedades elementales; cada nivel da nuevos elementos. Fuego: +50% de daño. Frío: -1 No2 cada 5 de daño (mín. 1). Eléctrico: el daño se propaga a enemigos hasta 5 de distancia.'),
    skillSA('mago', 'Armadura Mágica', 'SP 5. No2 3. Hechizo. Armadura que reduce el daño recibido 50% (máx. 10). Al terminar hace daño mágico en flor igual al daño absorbido. Dura 2 turnos.'),
    skillSA('mago', 'Telekinesis', 'SP 15. No2 3. Hechizo. Mueve y controla un objeto con la mente; puede arrebatar el arma a un enemigo con Esp/Fue y atacar con ella (ESP como PG y como daño). 1 SP por cada No2 que use para atacar o mover el objeto. Controlado el resto del turno; 1 SP para contrarrestar con ESP; 1 SP por mantenimiento para conservarlo.'),
    skillSA('mago', 'Control Mental', 'SP 7. No2 3. Hechizo. Tira Esp contra (Esp + Res.M) de otro personaje. Si gana, lo controla y lo obliga a cualquier acción que no lo dañe a sí mismo. Pagás 1 SP y 1 No2 por cada No2 que gaste el controlado.'),
  ]},
  {id: 'shooter', nombre: 'Shooter', habilidades: [
    skillSA('shooter', 'Apuntar', 'SP X (X ≤ 3). X No2: +X a la PG y al crítico en el próximo ataque a distancia.'),
    skillSA('shooter', 'Acelerado', 'SP 1. Reduce el cooldown de un ataque. Repetible (+1 SP por repetición).'),
    skillSA('shooter', 'Enfocado', 'SP 1. +2 de daño al próximo ataque. Repetible (+1 SP por repetición).'),
    skillSA('shooter', 'Parry a distancia', 'SP 2. Flash. Realiza un ataque de rango como instantáneo. Si es respuesta a un ataque, tira Agilidad para cancelarlo.'),
    skillSA('shooter', 'Headshot', 'SP 4. Ataque con +1 al crítico y crítico mejorado. Daño +5. +2 fijo a PG. Falla si no es crítico.'),
    skillSA('shooter', 'Proyectil perforante', 'SP 2. Ataque que continúa hasta un segundo objetivo. Los efectos especiales se pierden después del primero.'),
    skillSA('shooter', 'Marcar', 'SP 3. Marca un objetivo hasta que ataques a otro. +1 PG, +1 Daño y +1 Crítico contra el marcado.'),
    skillSA('shooter', 'Repetición', 'SP X. X ataques consecutivos idénticos (gastan No2 normalmente). Cada ataque después del primero suma +1 a la PG y amplifica +1 el daño.'),
    skillSA('shooter', 'Disparo múltiple', 'SP X (el doble de objetivos adicionales). Ataca a múltiples objetivos en línea directa en un cono ancho.'),
    skillSA('shooter', 'Tiro con comba', 'SP 1. Altera la trayectoria de un ataque de rango para esquivar obstáculos. Desvío máx. 2 casillas; cada una cuenta como +1 de distancia.'),
  ]},
  {id: 'support', nombre: 'Support', habilidades: [
    skillSA('support', 'Empower', 'SP 2. No2 0. +3 a cualquier tirada propia o de un aliado.'),
    skillSA('support', 'Blessing', 'SP 5. +1 fijo en todas las tiradas por 2 turnos.'),
    skillSA('support', 'Heal', 'SP 2. No2 1. Cura 4 + 1d6 HP.'),
    skillSA('support', 'Shield', 'SP 2. Flash (SP x 2). Blindaje temporal que absorbe 14 de HP hasta el final del turno.'),
    skillSA('support', 'Acelerador', 'SP 1. Marca una casilla con flechitas (>>). Cada aliado que la pisa obtiene +2 No2 (máx. una vez por turno). Dura 10 turnos.'),
    skillSA('support', 'Endurecimiento', 'SP 5. Armadura temporal: Defensa 3, Res. Mágica 3, reduce críticos de todo tipo. Dura 2 turnos.'),
    skillSA('support', 'Re-roll', 'SP 2. Flash. Permite rerolear tiradas aliadas. Lento.'),
    skillSA('support', 'Smite', 'SP 1. No2 1. Rayo de daño holy inesquivable, 1d4 de daño.'),
    skillSA('support', 'Transferir SP', 'SP 1. Transfiere 1d6 SP entre vos y un aliado.'),
    skillSA('support', 'Adrenalina', 'SP 5. +1 a Destreza, Fuerza y Agilidad durante 2 turnos. Acumulable. Lento.'),
  ]},
  {id: 'debuffer', nombre: 'Debuffer', habilidades: [
    skillSA('debuffer', 'Enyetar', 'SP 5. Maldición (Esp / Res.M). Flash. Obliga a repetir una tirada y quedarse con el valor más bajo.'),
    skillSA('debuffer', 'Confusión', 'SP 5. Maldición (Esp / Res.M). Antes de un ataque o habilidad con objetivo, tira 1d4: 1) elegís vos el objetivo; 2) gasta los No2 pero no actúa; 3) objetivo al azar; 4) actúa normal. Alternativos en radio de 3 No2. Dura 2 turnos.'),
    skillSA('debuffer', 'Maldición debilitante', 'SP 5. Maldición (Esp / Res.M). -1 a todas las tiradas. Dura 2 turnos. Acumulable. Lento.'),
    skillSA('debuffer', 'Maldición extenuante', 'SP 3. Maldición (Esp / Res.M). +1 Nitro a todas las acciones; debe pagar 1 Nitro para moverse cada 2 casillas. Dura 1 turno. Acumulable. Lento.'),
    skillSA('debuffer', 'Maldición tormentosa', 'SP 5. Maldición (Esp / Res.M). Por cada acción recibe daño igual a No2 - 1; paga 1 HP para moverse cada 2 casillas. Dura 3 turnos. Acumulable. Lento.'),
    skillSA('debuffer', 'Drenar vida', 'SP X (X ≤ ESP). Tira X + 1dX; el objetivo tira resistencia mágica. Drena HP igual a la diferencia, acumulable hasta 50% sobre el máximo.'),
    skillSA('debuffer', 'Balas de sangre', 'SP 1. Gastás X HP (máx. ESP). Dispara un proyectil tipo 1 con peso igual a la vida gastada.'),
    skillSA('debuffer', 'Transfusión sanguínea', 'SP 1. Transfiere hasta 20 de HP de un aliado a otro.'),
    skillSA('debuffer', 'Veneno', 'SP 2. Maldición (Esp / Res.M). Aplica 3 stacks de veneno.'),
    skillSA('debuffer', 'Nube tóxica', 'SP 3. Área de flor que aplica 3 stacks de veneno a quien entre o esté adentro en el mantenimiento (solo 1 a los ya envenenados). Dura 3 turnos.'),
  ]},
];
