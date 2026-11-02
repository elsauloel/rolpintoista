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
  if(!conPrisa.length || typeof AvisoCombate === 'undefined'){
    const orden = ordenarIniciativa(iniciativa.orden);
    guardarIniciativa({orden, turno: 0, libre: null}).then(ok => { if(ok) iniciativaAvisarPuestos(orden, [], true); });
    return;
  }
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
  iniciativaAvisarPuestos(orden, conPrisa.map(x => x.o.id), auto);
}

/* 📣 «Terminó la ronda de iniciativa: quedaste en el puesto N» (dueño, 2026-11-03: «al tirar la iniciativa y apretar ordenar, le debe aparecer
   una notificación a los usuarios, sobre todo a los jugadores… y al que tiene prisa: quedaste primero porque tenés prisa»). Un solo momento
   (`iniciativa-orden`): cada jugador ve al centro SU texto (`datos.porUid`, js/16 momentoAvisoCentro), con un renglón por personaje suyo; la
   Crónica (el GM y quien mire) dice el orden de los personajes. El puesto cuenta solo las filas que ven los jugadores (sin las ocultas por el GM)
   y sin los creeps en sigilo… que igual no cuentan para el jugador: se numera la lista visible. (Reemplaza al Aviso suelto de la Prisa.) */
function iniciativaAvisarPuestos(orden, prisaIds, auto){
  try{
    const prisa = new Set(prisaIds || []);
    const visibles = (orden || []).filter(o => o && !o.oculto && tokens.get(o.id) && !(tokens.get(o.id).oculto));
    const porUid = {}, cronica = [];
    visibles.forEach((o, i) => {
      const t = tokens.get(o.id);
      if(!t || t.tipo === 'creep') return;
      const n = i + 1, nom = nombreDe(t), uid = prisaUidDe(t);
      cronica.push(`${n}.º ${nom}`);
      if(!uid) return;
      const conPrisa = prisa.has(o.id);
      const txt = conPrisa && auto && n === 1 ? `${nom}: quedaste primero porque tenés Prisa.`
        : conPrisa && auto ? `${nom}: quedaste en el puesto ${n}. Tenés Prisa: vas antes que los que no la tienen (entre los que la tienen, manda la tirada).`
        : conPrisa ? `${nom}: quedaste en el puesto ${n} (tenés Prisa, pero esta vez el GM acomoda el orden a mano).`
        : `${nom}: quedaste en el puesto ${n}.`;
      (porUid[uid] = porUid[uid] || []).push(txt);
    });
    const paraUids = Object.keys(porUid).filter(u => !fbUsuario || u !== fbUsuario.uid);
    const porUidTxt = {};
    Object.entries(porUid).forEach(([u, l]) => { porUidTxt[u] = l.join('\n'); });
    momentoAbrir({tipo: 'iniciativa-orden', icono: prisa.size ? '🏃' : '🎲', titulo: 'Terminó la ronda de iniciativa',
      resultado: cronica.length ? `Orden: ${cronica.join(' · ')}${prisa.size && auto ? ' (🏃 Prisa primero)' : ''}` : 'El orden de turnos quedó listo.',
      estado: 'listo', datos: {paraUids, aviso: true, tituloAviso: '🎲 Terminó la ronda de iniciativa', porUid: porUidTxt}});
  }catch(err){ console.error('No se pudo avisar el orden de turnos:', err); }
}
