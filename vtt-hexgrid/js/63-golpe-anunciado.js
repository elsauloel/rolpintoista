/* ---------- 🪓 El que avisa no traiciona / 🐻 Zarpazo erguido (2026-10-21, dueño; choque pesado, «golpe que se anuncia») ----------
   Un turno: levanta el arma (o se para en dos patas) mirando a un rival —es su ataque del turno— y queda «Golpe anunciado» (el estado, con
   `golpeAnunciado`; a quién apunta: `objetivo` = el token, `objetivoNombre`). La Mesa y la Crónica lo anuncian: los jugadores lo ven venir.
   - Si le hacen daño antes (que le llegue a la vida), se le cae el golpe (`pierdeAlDano`, js/10).
   - Si el objetivo estaba pegado y se aleja, el golpe sale como su ataque de oportunidad, sin No2 (js/17: `golpeAnunciadoOpcion`).
   - En su próximo turno (`sc.golpeListo`, CreepAcciones.inicioCreep) el Atacar de las Acciones (js/12) lo descarga: puede caminar antes; es un
     ataque con su arma con +3 dados del Tipo, sin Parry (solo se esquiva) y, si pega, lo empuja 2 casillas (`h.golpeAnunciado.duelo`). Paga lo de
     un ataque. Si no ataca en ese turno, se pierde (CreepAcciones.finCreep). */
let golpeSaltear = '';   // el creep que eligió «Ataque común» (una vez)
const golpeAnunciadoDe = sc => (sc && (sc.estados || []).find(e => e && e.activo !== false && e.golpeAnunciado)) || null;
// La habilidad que lo cargó (para armar el golpe): la del nombre guardado, o la primera con `golpeAnunciado`.
const golpeHabDe = (sc, nombre) => (sc.habilidades || []).find(h => h && h.golpeAnunciado && (!nombre || h.nombre === nombre))
  || (sc.habilidades || []).find(h => h && h.golpeAnunciado) || null;
function golpeAtaque(sc, h){
  const g = (h && h.golpeAnunciado) || {};
  return CreepAcciones.ataqueDeHab(sc, {nombre: (h && h.nombre) || 'Golpe anunciado', detalle: g.detalleGolpe || '', duelo: g.duelo});
}

// Después de cargar (js/12, junto a vigilanciaActivada): a quién apunta (un clic en su token; Esc = a quien elija al pegar) y el anuncio.
function golpeAnunciadoActivado(sc, h){
  if(!h || !h.golpeAnunciado) return;
  const e = tokenEntradaCreep(sc.id);
  const anunciar = (tid, nom) => {
    const txt = nom ? `${sc.nombre} ${h.golpeAnunciado.verbo || 'levanta el arma'} mirando a ${nom}… ¡${h.nombre}!` : `${sc.nombre} ${h.golpeAnunciado.verbo || 'levanta el arma'}… ¡${h.nombre}!`;
    mesaLinea(`🪓 ${txt}`, 'recordatorio');
    try{ momentoAbrir({tipo: 'golpe-anunciado', icono: '🪓', titulo: txt, estado: 'listo',
      resultado: `En su próximo turno descarga un golpe con +${GA_DADOS(h)} dados, que no se puede parrear y empuja 2 casillas.${nom ? ` Si ${nom} se aleja de su lado, se lo come de oportunidad.` : ''} Si le hacen daño antes, se le cae.`}); }catch(err){}
    if(tid) modificarCreep(String(sc.id), c => {
      const es = golpeAnunciadoDe(c);
      if(es){ es.objetivo = tid; es.objetivoNombre = String(nom || '').slice(0, 40); es.hab = h.nombre; es.detalle = `Apunta a ${nom}. ${es.detalle || ''}`.slice(0, 600); }
      return {};
    }).catch(err => console.error('Golpe anunciado: no se pudo guardar a quién apunta', err));
  };
  if(ac && ac.host) ac.host.hidden = true;
  const reabrir = () => { if(ac && ac.creepId === sc.id){ ac.host.hidden = false; acUbicar(); acDibujar(); } };
  elegirDestino(c => {
    elegirDestinoTerminar();
    const hit = [...tokens.entries()].find(([id, t]) => t.col === c.col && t.fila === c.fila && (!e || id !== e[0]));
    anunciar(hit ? hit[0] : '', hit ? nombreDe(hit[1]) : '');
    reabrir();
  }, `<b>🪓 ¿A quién apunta ${esc(sc.nombre)}?</b> <span>clic en su token · Esc: a quien elija al pegar</span>`, true, () => { anunciar('', ''); reabrir(); });
}
const GA_DADOS = h => num((((h && h.golpeAnunciado) || {}).duelo || {}).arma && h.golpeAnunciado.duelo.arma.dados) || 3;

// 🗡 El Atacar de su próximo turno (js/12): descargar el golpe, o un ataque común (y se pierde).
async function golpeAnunciadoAtacar(sc, tipo){
  if(golpeSaltear === sc.id){ golpeSaltear = ''; return false; }
  const g = sc.golpeListo || {}, h = golpeHabDe(sc, g.hab);
  if(!h) return false;
  const quien = g.objetivoNombre ? ` contra ${g.objetivoNombre}` : '';
  const eleccion = await new Promise(res => AvisoCombate.mostrar({icono: '🪓', titulo: h.nombre, texto: `${sc.nombre} tiene el golpe cargado${quien}: +${GA_DADOS(h)} dados del Tipo de su arma, no se puede parrear y, si pega, lo empuja 2 casillas. Cuesta lo de un ataque. (Si todavía no está al lado, primero caminá y después apretá Atacar.)`,
    botones: [{texto: 'Descargar el golpe', alClic: () => { AvisoCombate.cerrar(); res('golpe'); }}, {texto: 'Un ataque común (se pierde el golpe)', sec: true, alClic: () => { AvisoCombate.cerrar(); res('comun'); }}, {texto: 'Cancelar', sec: true, alClic: () => { AvisoCombate.cerrar(); res(''); }}]}));
  if(!eleccion) return true;
  if(eleccion === 'comun'){
    await acCambiar(c => { c.golpeListo = null; return {}; });
    golpeSaltear = sc.id;
    acAtacar(tipo);
    return true;
  }
  const qs = Combatiente.preguntaSentado(sc.estados, sc.nombre);
  if(qs && !(await AvisoCombate.preguntar(qs, {icono: '⚔', titulo: 'Atacar igual', si: 'Sí, atacar'}))) return true;
  const forzar = CreepAcciones.faltanNitros(sc, 'normal');
  if(forzar && !(await AvisoCombate.preguntar(CreepAcciones.preguntaSinNitros(sc, 'normal'), {icono: '⚠', titulo: 'Sin No2', si: 'Sí, atacar'}))) return true;
  const x = await acCambiar(c => { const r = CreepAcciones.pagarAtaque(c, 'normal', forzar); if(!r || r.error) return r; c.golpeListo = null; return r; });
  if(!x) return true;
  CreepAcciones.alertaSinNitros(sc, 'normal', x.forzado);
  acParry.delete(sc.id);
  const txt = `${sc.nombre} descarga ${h.nombre}${quien}: +${GA_DADOS(h)} dados, sin Parry, empuja 2.`;
  mesaLinea(`🪓 ${txt}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'golpe-anunciado', icono: '🪓', titulo: `${sc.nombre} descarga el golpe`, resultado: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  const atq = golpeAtaque(sc, h);
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible()) acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
  else acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq));
  acDibujar();
  return true;
}

// ⚔ La oportunidad (js/17): si quien se aleja es a quien apunta (o no apuntaba a nadie), el golpe cargado, sin No2. → la opción, o null.
function golpeAnunciadoOpcion(r, moverId){
  if(!r || r.tipo !== 'creep') return null;
  const sc = creepPrivadoDe(r.fichaId), es = golpeAnunciadoDe(sc);
  if(!es || (es.objetivo && es.objetivo !== moverId)) return null;
  const h = golpeHabDe(sc, es.hab);
  if(!h) return null;
  const atq = golpeAtaque({...sc, id: r.fichaId}, h);
  if(!atq) return null;
  return {nombre: `🪓 ${h.nombre}`, costo: 0, yo: {ref: r.fichaId, tipo: 'creep', nombre: nombreDe(r)}, ataque: atq,
    detalle: `El golpe que venía cargando: +${GA_DADOS(h)} dados, sin Parry, empuja 2 · sin No2`,
    alUsar: () => modificarCreep(String(r.fichaId), c => { c.estados = (c.estados || []).filter(x => !(x && x.golpeAnunciado)); return {}; })
      .catch(err => console.error('Golpe anunciado: no se pudo gastar', err))};
}
