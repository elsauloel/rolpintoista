// js/86-prisa.js — 🏃 Prisa, a la vista (2026-10-31, dueño: «automatizar prisa: siempre primero en la tabla de la iniciativa al apretar
// "ordenar"; debe automatizarse pero también le debe aparecer una notificación al jugador y debe aparecer en el mensaje lateral»; el mismo día:
// «súmale el botón resolver a mano también»).
// El orden ya lo hacía `ordenarIniciativa` (js/04): los que tienen Prisa van primero y, entre ellos, manda la tirada de iniciativa (empate: el
// orden en que estaban). Lo nuevo: al apretar Ordenar, si alguien de la lista tiene Prisa, el GM ve el Aviso con quiénes la tienen y elige
// «✔ Aplicar» (van primero) o «✋ Resolver a mano» (se ordena solo por la tirada y el GM los acomoda con ▲▼). Después, el momento `prisa`:
// a los jugadores de esos personajes, el Aviso al centro («vas primero en el orden de turnos»); a los demás, la Crónica.
// Sin nadie con Prisa, Ordenar hace lo de siempre, sin cartel.

// Quién maneja ese token (para el Aviso): el dueño del personaje o quien tiene 🎮 su control. Un creep: nadie (lo ve el GM en la Crónica).
function prisaUidDe(t){
  if(!t || t.tipo === 'creep') return '';
  const f = fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]);
  return (f && f.resumen && f.resumen.control) || (f && f.duenoUid) || t.duenoUid || '';
}

// El botón Ordenar (js/04).
function prisaOrdenar(){
  const conPrisa = iniciativa.orden.filter(o => tokenTienePrisa(o.id)).map(o => ({o, t: tokens.get(o.id)})).filter(x => x.t);
  if(!conPrisa.length || typeof AvisoCombate === 'undefined'){ guardarIniciativa({orden: ordenarIniciativa(iniciativa.orden), turno: 0, libre: null}); return; }
  const nombres = conPrisa.map(x => nombreDe(x.t)).join(', ');
  const varios = conPrisa.length > 1;
  AvisoCombate.mostrar({clave: 'prisa-ordenar', icono: '🏃', titulo: 'Prisa al ordenar los turnos',
    pasos: [{titulo: varios ? 'La tienen' : 'La tiene', texto: nombres},
      {titulo: 'Qué hace', texto: `Va${varios ? 'n' : ''} primero en el orden de turnos, antes que todos los que no la tienen.${varios ? ' Entre ellos, manda la tirada de iniciativa (con empate, quedan como estaban).' : ''}`}],
    botones: [{texto: '✔ Aplicar', alClic: () => { AvisoCombate.cerrar(); prisaAplicar(conPrisa, true); }},
      {texto: '✋ Resolver a mano', sec: true, titulo: 'Se ordena solo por la tirada de iniciativa; el GM los acomoda con ▲▼', alClic: () => { AvisoCombate.cerrar(); prisaAplicar(conPrisa, false); }}]});
}

async function prisaAplicar(conPrisa, auto){
  const orden = auto ? ordenarIniciativa(iniciativa.orden)
    : iniciativa.orden.map((o, i) => ({o, i})).sort((a, b) => (num(b.o.valor) - num(a.o.valor)) || (a.i - b.i)).map(x => x.o);
  if(!await guardarIniciativa({orden, turno: 0, libre: null})) return;
  const nombres = conPrisa.map(x => nombreDe(x.t)).join(', ');
  const paraUids = [...new Set(conPrisa.map(x => prisaUidDe(x.t)).filter(u => u && (!fbUsuario || u !== fbUsuario.uid)))];
  const varios = conPrisa.length > 1;
  momentoAbrir({tipo: 'prisa', icono: '🏃', titulo: `Prisa: ${nombres}`,
    resultado: auto ? `Va${varios ? 'n' : ''} primero en el orden de turnos.` : 'El GM acomoda el orden a mano.',
    estado: 'listo', datos: {paraUids, aviso: true,
      tituloAviso: '🏃 Prisa',
      textoAviso: auto ? `Vas primero en el orden de turnos${varios ? ` (${nombres} tienen Prisa: entre ustedes manda la tirada de iniciativa)` : ''}.`
        : 'Tenés Prisa, pero esta vez el GM acomoda el orden de turnos a mano.'}});
}
