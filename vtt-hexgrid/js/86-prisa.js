// js/86-prisa.js — 🎲 El botón «Ordenar» del orden de turnos y el aviso del puesto de cada uno.
// (El archivo nació el 2026-10-31 para la Prisa «a la vista»: con alguien con Prisa en la lista, Ordenar le mostraba al GM un cartel «✔ Aplicar /
// ✋ Resolver a mano» y los ponía primero. **Desde el 2026-11-20** —dueño: «cambiar la habilidad Prisa para que en lugar de que te mande siempre
// primero a la lista de iniciativas, te dé +5 a la tirada de iniciativa»— la Prisa es un +5 a la Iniciativa (comun/pasivas.js) que ya viene adentro de
// la tirada: Ordenar ordena por el resultado y nada más, sin cartel. El nombre del archivo se conserva para no mover los `<script>`.)

// Quién maneja ese token (para el Aviso): el dueño del personaje o quien tiene 🎮 su control. Un creep: nadie (lo ve el GM en la Crónica).
function prisaUidDe(t){
  if(!t || t.tipo === 'creep') return '';
  const f = fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]);
  return (f && f.resumen && f.resumen.control) || (f && f.duenoUid) || t.duenoUid || '';
}

// El botón Ordenar (js/04): de mayor a menor por la tirada; deja listo el «▶ Iniciar combate» (OrdenTurnos.marcasAlOrdenar) y avisa los puestos.
// Lo que no ocupa lugar (un tótem o un estandarte que quedó de un orden viejo: OrdenTurnos.ocupaLugar, 2026-11-23) sale de la lista.
function iniciativaOrdenar(){
  const orden = ordenarIniciativa(iniciativa.orden.filter(o => iniciativaOcupaLugar(o.id)));
  guardarIniciativa({orden, turno: 0, libre: null, reubicar: [], ...OrdenTurnos.marcasAlOrdenar(iniciativa, modoMapa)}).then(ok => { if(ok) iniciativaAvisarPuestos(orden); });
}

/* 📣 «Terminó la ronda de iniciativa: quedaste en el puesto N» (dueño, 2026-11-03: «al tirar la iniciativa y apretar ordenar, le debe aparecer
   una notificación a los usuarios, sobre todo a los jugadores… y al que tiene prisa: quedaste primero porque tenés prisa»). Un solo momento
   (`iniciativa-orden`): cada jugador ve al centro SU texto (`datos.porUid`, js/16 momentoAvisoCentro), con un renglón por personaje suyo; la
   Crónica (el GM y quien mire) dice el orden de los personajes. El puesto cuenta solo las filas que ven los jugadores (sin las ocultas por el GM)
   y sin los creeps en sigilo… que igual no cuentan para el jugador: se numera la lista visible. */
function iniciativaAvisarPuestos(orden){
  try{
    const visibles = (orden || []).filter(o => o && !o.oculto && tokens.get(o.id) && !(tokens.get(o.id).oculto));
    const porUid = {}, cronica = [];
    visibles.forEach((o, i) => {
      const t = tokens.get(o.id);
      if(!t || t.tipo === 'creep') return;
      const n = i + 1, nom = nombreDe(t), uid = prisaUidDe(t);
      cronica.push(`${n}.º ${nom}`);
      if(!uid) return;
      (porUid[uid] = porUid[uid] || []).push(`${nom}: quedaste en el puesto ${n}.`);
    });
    const paraUids = Object.keys(porUid).filter(u => !fbUsuario || u !== fbUsuario.uid);
    const porUidTxt = {};
    Object.entries(porUid).forEach(([u, l]) => { porUidTxt[u] = l.join('\n'); });
    momentoAbrir({tipo: 'iniciativa-orden', icono: '🎲', titulo: 'Terminó la ronda de iniciativa',
      resultado: cronica.length ? `Orden: ${cronica.join(' · ')}` : 'El orden de turnos quedó listo.',
      estado: 'listo', datos: {paraUids, aviso: true, tituloAviso: 'Terminó la ronda de iniciativa', porUid: porUidTxt}});
  }catch(err){ console.error('No se pudo avisar el orden de turnos:', err); }
}
