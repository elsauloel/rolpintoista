/* ---------- 🔓 Soltarse al empezar el turno (2026-10-20, dueño, la Red Nerubian) ----------
   «Una vez que esté colocado el estado, al principio del turno de la persona que está inmovilizada, ahí tiene la tirada de Fuerza contra Efecto
   especial para ver si se zafa o no». Un estado con `soltar.alEmpezar` (Combatiente.soltarNorm lo conserva): cuando empieza el turno de quien lo
   tiene, la pantalla que lo maneja (su dueño, o el GM con 🎮 el control; un creep, el GM) muestra un cartel con la tirada, gratis. Si llega, se
   saca el estado. El «🔓 Soltarse» de la Botonera sigue para reintentar en el mismo turno (con su costo). La tirada va a la Mesa. Lo llama
   escucharIniciativa (js/04) cada vez que cambia el turno. */
const soltarAlEmpezarHechos = new Set();   // token@paso: una sola vez por turno
const soltarAlEmpezarDe = estados => (estados || []).find(e => e && e.activo !== false && e.soltar && e.soltar.alEmpezar && Combatiente.soltarNorm(e.soltar)) || null;
async function soltarAlEmpezarRevisar(){
  const o = iniciativa.orden[iniciativa.turno];
  const t = o && tokens.get(o.id);
  if(!t) return;
  const clave = `${o.id}@${iniciativa.paso}`;
  if(soltarAlEmpezarHechos.has(clave)) return;
  const ref = String(t.fichaId || '');
  try{
    if(t.tipo === 'creep'){
      if(!soyGM) return;
      const p = creepsPriv.get(ref), sc = p && p.sc;
      const est = sc && soltarAlEmpezarDe(sc.estados);
      if(!est) return;
      soltarAlEmpezarHechos.add(clave);
      soltarAlEmpezarCartel(clave, sc.nombre, est, () => soltarAlEmpezarCreep(clave, ref));
      return;
    }
    if(!ref) return;
    const [fichaId, invId] = ref.split(SEP_INVOCACION);
    if(typeof bnManejo !== 'function' || !bnManejo(fichaId)) return;
    let info = null;
    await editarPersonajeMapa(fichaId, S => {
      const x = invId ? (S.invocaciones || []).find(i => i && i.id === invId) : null;
      const est = soltarAlEmpezarDe(invId ? (x && x.estados) : S.efectos);
      if(est) info = {nombre: invId ? x.nombre : ((S.meta && S.meta.nombre) || 'Personaje'), est: {...est}};
      return false;   // solo mirar
    });
    if(!info) return;
    soltarAlEmpezarHechos.add(clave);
    soltarAlEmpezarCartel(clave, info.nombre, info.est, () => soltarAlEmpezarPj(clave, fichaId, invId));
  }catch(err){ console.error('Soltarse al empezar el turno:', err); }
}
function soltarAlEmpezarCartel(clave, nombre, est, tirar){
  const s = Combatiente.soltarNorm(est.soltar);
  AvisoCombate.cartel('soltar-' + clave, {icono: '🔓', titulo: `${nombre}: ¿se suelta?`,
    texto: `Empieza su turno atrapado (${est.nombre}). Tira ${s.etq} contra ${s.dif}: si llega, se suelta. Esta tirada no cuesta No2.`,
    botones: [{texto: `🎲 Tirar ${s.etq}`, alClic: tirar}, {texto: 'Ahora no', sec: true, alClic: () => AvisoCombate.cartel('soltar-' + clave, null)}]});
}
function soltarAlEmpezarResultado(clave, nombre, estNombre, tt){
  const txt = tt.ok ? `${nombre} se soltó de ${estNombre} (${tt.r ? tt.r.total : '—'} contra ${tt.s.dif}).` : `${nombre} no se soltó de ${estNombre} (${tt.r ? tt.r.total : '—'} contra ${tt.s.dif}): sigue atrapado este turno.`;
  mesaLinea(`🔓 ${txt}`, 'recordatorio');
  AvisoCombate.cartel('soltar-' + clave, {icono: '🔓', titulo: `${nombre}: ¿se suelta?`, veredicto: {tono: tt.ok ? 'bueno' : 'malo', grande: tt.ok ? '¡SE SOLTÓ!' : 'SIGUE ATRAPADO', chico: txt},
    botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cartel('soltar-' + clave, null)}]});
}
async function soltarAlEmpezarCreep(clave, creepId){
  const p = creepsPriv.get(creepId), sc = p && p.sc;
  const tt = sc && CreepAcciones.tiradaSoltarse(sc);
  if(!tt || !tt.r){ AvisoCombate.cartel('soltar-' + clave, null); return; }
  const gratis = {...tt, s: {...tt.s, no2: 0}};
  const estNombre = ((sc.estados || []).find(e => e.id === tt.estId) || {}).nombre || 'el estado';
  mesaPublicar(tt.origen, {...tt.r, quien: sc.nombre, desde: 'gm'});
  try{ await modificarCreep(creepId, c => { CreepAcciones.aplicarSoltarse(c, gratis); return {}; }); }catch(err){ console.error(err); toast('No se pudo anotar el resultado: sacá el estado a mano'); }
  soltarAlEmpezarResultado(clave, sc.nombre, estNombre, tt);
}
async function soltarAlEmpezarPj(clave, fichaId, invId){
  let res = null;
  await editarPersonajeMapa(fichaId, S => {
    if(invId){
      const inv = (S.invocaciones || []).find(i => i && i.id === invId);
      const tt = inv && InvAcciones.tiradaSoltarse(inv);
      if(!tt || !tt.r) return false;
      InvAcciones.aplicarSoltarse(inv, {...tt, s: {...tt.s, no2: 0}});
      res = {tt, nombre: inv.nombre, est: tt.est.nombre};
      return true;
    }
    const est = Combatiente.estadoSoltable(S.efectos);
    if(!est) return false;
    const f = FichaCalculo.calcular(S).final, s = Combatiente.soltarNorm(est.soltar);
    const tt = Combatiente.tiradaSoltarse(est, num(f[s.stat]) + Math.max(0, num(f.soltarse)), S.efectos);
    if(!tt || !tt.r) return false;
    if(tt.ok) S.efectos = S.efectos.filter(e => e !== est);
    else Combatiente.hundirSiFalla(est, tt);
    res = {tt, nombre: (S.meta && S.meta.nombre) || 'Personaje', est: est.nombre};
    return true;
  });
  if(!res){ AvisoCombate.cartel('soltar-' + clave, null); return; }
  mesaPublicar(`${res.nombre} · Soltarse (${res.est}) · ${res.tt.s.etq} contra ${res.tt.s.dif}`, {...res.tt.r, quien: res.nombre, ficha: fichaId});
  soltarAlEmpezarResultado(clave, res.nombre, res.est, res.tt);
}
