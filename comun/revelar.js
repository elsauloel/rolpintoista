/* comun/revelar.js — 👁 Revelar a mano lo que está oculto (2026-11-20, dueño: «un personaje tiró para detectar una trampa… el sistema entendió
   que la trampa no fue detectada, pero en realidad sí fue detectada por un malentendido. Y yo como GM no tenía una forma de revelar lo que estaba
   oculto… Tanto para GMs como para jugadores, uno tiene que poder hacerles clic y revelarlas»).
   Lo puro: qué se le ofrece a quien hace clic en algo oculto y qué línea va a la Mesa. No decide qué se ve (eso es del mapa: `puedeVerElemento`,
   el sigilo, la niebla): acá llega solo lo que esa pantalla YA ve. Quién mira: {gm, mio} — `mio`: lo puso o lo controla (su trampa, su token).
   · El GM, con cualquiera (y la contraria, «volver a ocultar», donde tiene sentido).
   · El jugador, solo con lo suyo (interpretación de Claude, P254: no revela lo que no ve ni lo de otro).
   Revelar.elemento(el, quien) → null | {accion: 'revelar' | 'ocultar', que: 'trampa' | 'invisible', texto, titulo, cambios: [{campo: valor}, …]}
       (los cambios van de a uno: las reglas de Firestore dejan marcar `descubierta` solo, sin otro campo en la misma escritura)
   Revelar.token(t, quien)      → null | {accion: 'revelar' | 'ocultar', que: 'oculto' | 'sigilo', texto, titulo, enMenu?}   (t = {oculto, sigilo};
       `enMenu`: no va entre los botones a la vista del token, va adentro de su «⋯»)
   Revelar.linea(op, o)         → {origen, formula} para la Mesa (o = {gm, quien, nombre}); null si ese cambio no se anuncia.
   Revelar.aMano(detectada, o)  → {origen, formula, resultado} de «✋ Resolver a mano» en una tirada de detectar (o = {detector, nombre}). */
const Revelar = (() => {
  const comillas = n => (n ? `«${n}»` : '');

  function elemento(el, quien){
    if(!el) return null;
    quien = quien || {};
    const puede = !!(quien.gm || quien.mio);
    const armada = !!(el.trampa && !el.disparada);
    if(armada && !el.descubierta){
      if(!puede) return null;
      // Una trampa del GM que además es «Invisible para jugadores»: se le saca también eso (si no, seguiría sin verse).
      const cambios = [{descubierta: true}];
      if(el.invisible && quien.gm) cambios.push({invisible: false});
      return {accion: 'revelar', que: 'trampa', texto: `👁 Revelar${el.trampaNombre ? ' ' + comillas(el.trampaNombre) : ' la trampa'}`,
        titulo: 'La trampa pasa a verse para todos (como cuando la detectan). No se dispara ni se desarma.', cambios};
    }
    if(armada && el.descubierta && quien.gm)
      return {accion: 'ocultar', que: 'trampa', texto: `🙈 Volver a ocultar${el.trampaNombre ? ' ' + comillas(el.trampaNombre) : ' la trampa'}`,
        titulo: 'La trampa vuelve a estar oculta para los rivales de quien la puso.', cambios: [{descubierta: false}]};
    if(el.invisible && quien.gm)
      return {accion: 'revelar', que: 'invisible', texto: '👁 Revelar a los jugadores',
        titulo: 'Deja de ser «Invisible para jugadores»: lo ven todos. Para volver a ocultarlo, la casilla del ⚙.', cambios: [{invisible: false}]};
    return null;
  }

  function token(t, quien){
    if(!t) return null;
    quien = quien || {};
    // (enMenu, 2026-11-20, dueño: «está bien que el botón del ojito aparezca detrás del menú de los tres puntitos»: el de un token oculto por el GM
    // no va entre los botones a la vista, va adentro del «⋯», donde está el 🙈 de siempre.)
    if(t.oculto) return quien.gm ? {accion: 'revelar', que: 'oculto', enMenu: true, texto: '👁 Revelar', titulo: 'Oculto: mostrarlo a los jugadores'} : null;
    if(t.sigilo && (quien.gm || quien.mio))
      return {accion: 'revelar', que: 'sigilo', texto: '👁 Revelar',
        titulo: quien.gm ? 'Revelarlo a mano: sale del sigilo y lo ven todos (sin tirada)' : 'Revelarte: salís del sigilo y te ven todos'};
    return null;
  }

  // La línea de la Mesa. Lo revelado ya lo ven todos (se puede nombrar); lo que se vuelve a ocultar no se nombra.
  function linea(op, o){
    if(!op) return null;
    o = o || {};
    const quien = o.gm ? 'El GM' : (o.quien || 'Alguien');
    const n = comillas(o.nombre);
    if(op.que === 'trampa' && op.accion === 'revelar')
      return {origen: o.gm ? `👁 El GM reveló una trampa${n ? ': ' + n : ''}` : `👁 ${quien} reveló su trampa${n ? ': ' + n : ''}`, formula: 'Ahora la ven todos. Sigue armada.'};
    if(op.que === 'trampa' && op.accion === 'ocultar') return {origen: '🙈 El GM volvió a ocultar una trampa', formula: 'Vuelve a estar oculta.'};
    if(op.que === 'invisible') return {origen: '👁 El GM reveló algo que estaba oculto en el mapa', formula: 'Ahora lo ven todos.'};
    if(op.que === 'sigilo')
      return o.gm ? {origen: `👁 El GM reveló a ${o.nombre || 'alguien'}`, formula: 'Salió del sigilo: lo ven todos.'}
        : {origen: `👁 ${o.nombre || 'Alguien'} se dejó ver`, formula: 'Salió del sigilo por las suyas.'};
    return null;   // (mostrar un token que el GM tenía oculto para preparar la mesa no se anuncia, como siempre)
  }

  // «✋ Resolver a mano» de una tirada de detectar una trampa: el GM dice qué pasó, más allá de los dados.
  function aMano(detectada, o){
    o = o || {};
    const d = o.detector || 'Alguien', n = comillas(o.nombre);
    return detectada
      ? {origen: `✋ El GM resolvió a mano: ${d} detectó una trampa${n ? ' (' + n + ')' : ''}`, formula: 'Ahora la ven todos. Sigue armada.',
          resultado: `✋ A mano (el GM): …y encuentra una trampa${n ? ': ' + n : ''}.`}
      : {origen: `✋ El GM resolvió a mano: ${d} no detectó nada`, formula: 'Lo que hubiera sigue oculto.',
          resultado: '✋ A mano (el GM): no encuentra nada.'};
  }

  return {elemento, token, linea, aMano};
})();
if(typeof module !== 'undefined') module.exports = Revelar;
