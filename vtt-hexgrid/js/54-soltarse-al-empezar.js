/* ---------- 🔓 Soltarse al empezar el turno (2026-10-20, dueño, la Red Nerubian) ----------
   «Una vez que esté colocado el estado, al principio del turno de la persona que está inmovilizada, ahí tiene la tirada de Fuerza contra Efecto
   especial para ver si se zafa o no». Un estado con `soltar.alEmpezar` (Combatiente.soltarNorm lo conserva): cuando empieza el turno de quien lo
   tiene, la pantalla que lo maneja (su dueño, o el GM con 🎮 el control; un creep, el GM) muestra un cartel con la tirada, gratis. Si llega, se
   saca el estado. Es la única tirada por turno (dueño, 2026-10-20: sin el botón de reintentar). La tirada va a la Mesa. Lo llama
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

/* ---------- 🤝 Ayudar a soltar a un aliado (2026-10-20, dueño: «un aliado se puede parar de manera adyacente a la red y gastar un nitro en tirar su
   propia Fuerza contra el Efecto especial para intentar asistir a su colega») ----------
   Un estado con `soltar.ayuda`: los aliados pegados (a 1 casilla) ven en su Botonera / Acciones «🤝 Ayudar a soltar a …». Pagan 1 No2 (el `no2` del
   soltar), tiran su propio stat (el del soltar) contra la misma dificultad y, si llegan, el atrapado se suelta: un creep, el GM lo cambia directo; un
   personaje o una invocación, por aviso a su pantalla («Quitar estado», comun/recibidos.js). Aliados: creep con creep, personaje o invocación con
   personaje o invocación. */
function estadoParaAyudar(t){
  if(!t) return null;
  const est = t.tipo === 'creep' ? ((creepsPriv.get(String(t.fichaId)) || {}).sc || {}).estados : confusionEstadosDe(t);
  return (est || []).find(e => e && e.activo !== false && e.soltar && e.soltar.ayuda && Combatiente.soltarNorm(e.soltar)) || null;
}
function atrapadosCercaDe(t){
  if(!t || modoMapa !== 'combate') return [];
  const out = [];
  tokens.forEach((x, id) => {
    if(x === t || (x.tipo === 'creep') !== (t.tipo === 'creep') || (x.oculto && !soyGM) || distanciaHex(t, x) > 1) return;
    const e = estadoParaAyudar(x);
    if(!e) return;
    const s = Combatiente.soltarNorm(e.soltar);
    out.push({tokenId: id, nombre: nombreDe(x), est: e.nombre, etq: s.etq, dif: s.dif, stat: s.stat, no2: Math.max(1, s.no2 || 1)});
  });
  return out;
}
function atrapadosOpciones(t){ return {atrapadosCerca: atrapadosCercaDe(t)}; }
async function ayudarASoltar({tipo, invId, tokenId}){
  const x = tokens.get(tokenId), e = estadoParaAyudar(x);
  if(!x || !e){ toast('Ya no está atrapado'); return; }
  const s = Combatiente.soltarNorm(e.soltar), costo = Math.max(1, s.no2 || 1), atrapado = nombreDe(x);
  let quien = '', tt = null, ficha = '';
  // Quien ayuda paga y tira (su propio stat, con lo que le sume Soltarse).
  if(tipo === 'creep'){
    const sc = typeof acCreep === 'function' ? acCreep() : null;
    if(!sc) return;
    quien = sc.nombre;
    if(num(sc.nitros) < costo && !(await AvisoCombate.preguntar(`${sc.nombre} no tiene los No2 (cuesta ${costo}). ¿Ayudar igual?`, {icono: '🤝', titulo: 'Sin No2', si: 'Ayudar igual'}))) return;
    tt = Combatiente.tiradaSoltarse(e, CreepCalculo.statValor(sc, s.stat) + Math.max(0, num(CreepCalculo.modTotal(sc, 'soltarse'))), sc.estados);
    await acCambiar(c => { c.nitros = num(c.nitros) - costo; return {aviso: ''}; });
    mesaPublicar(`${quien} · Ayudar a soltar a ${atrapado} · ${s.etq} contra ${s.dif}`, {...tt.r, quien, desde: 'gm'});
  }else{
    if(!bn || !bn.S || !bnPuedeGuardar()) return;
    const S = bn.S, inv = tipo === 'inv' ? (S.invocaciones || []).find(i => i && i.id === invId) : null;
    if(tipo === 'inv' && !inv) return;
    quien = inv ? inv.nombre : ((S.meta && S.meta.nombre) || 'Alguien');
    const tiene = num(inv ? inv.nitros : S.nitros);
    if(tiene < costo && !(await AvisoCombate.preguntar(`${quien} no tiene los No2 (cuesta ${costo}). ¿Ayudar igual?`, {icono: '🤝', titulo: 'Sin No2', si: 'Ayudar igual'}))) return;
    const valor = inv ? InvCalculo.statValor(inv, s.stat) + Math.max(0, num(InvCalculo.modTotal(inv, 'soltarse')))
      : num(FichaCalculo.calcular(S).final[s.stat]) + Math.max(0, num(FichaCalculo.calcular(S).final.soltarse));
    tt = Combatiente.tiradaSoltarse(e, valor, inv ? inv.estados : S.efectos);
    if(inv) inv.nitros = num(inv.nitros) - costo; else S.nitros = num(S.nitros) - costo;
    bnUi(FichaGuardado.partes(S)).cambio();
    ficha = inv ? bn.fichaId + SEP_INVOCACION + inv.id : bn.fichaId;
    mesaPublicar(`${quien} · Ayudar a soltar a ${atrapado} · ${s.etq} contra ${s.dif}`, {...tt.r, quien, ficha});
  }
  if(!tt || !tt.r) return;
  // Si llegó, el atrapado se suelta.
  if(tt.ok){
    try{
      if(x.tipo === 'creep') await modificarCreep(String(x.fichaId), c => { c.estados = (c.estados || []).filter(z => !(z && z.nombre === e.nombre && z.soltar)); return {}; });
      else{ const f = fichasPub.get(String(x.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: x.fichaId, duenoUid: (f && f.duenoUid) || x.duenoUid, spec: {nombre: 'Quitar estado', estado: e.nombre}, origen: `${quien} te ayudó a soltarte`}); }
    }catch(err){ console.error('Ayudar a soltar:', err); toast(`Sacale ${e.nombre} a ${atrapado} a mano`); }
  }
  const txt = tt.ok ? `${quien} ayudó a ${atrapado} a soltarse de ${e.nombre} (${tt.r.total} contra ${s.dif}).` : `${quien} intentó ayudar a ${atrapado}, pero no alcanzó (${tt.r.total} contra ${s.dif}): sigue atrapado.`;
  mesaLinea(`🤝 ${txt} −${costo} No2.`, 'recordatorio');
  AvisoCombate.mostrar({icono: '🤝', titulo: `Ayudar a soltar a ${atrapado}`, veredicto: {tono: tt.ok ? 'bueno' : 'malo', grande: tt.ok ? '¡LO SOLTÓ!' : 'SIGUE ATRAPADO', chico: txt},
    botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
}

/* 🙈 Para la Ceguera (comun/combatiente.js, aDistancia): la distancia entre dos tokens del mapa, para saber si un hechizo dirigido viene de lejos. */
window.mapaDistanciaTokens = (a, b) => { const x = tokens.get(a), y = tokens.get(b); return x && y ? distanciaHex(x, y) : NaN; };

/* 👁 Una invocación temporal (el Ojo de Kicillof, 2026-10-20, dueño: «al cumplirse el segundo turno, desaparece»): cuando se duerme (sus turnos
   llegaron a 0), su token se borra del mapa. Lo hace la pantalla que maneja a su dueño (o el GM). */
const temporalesBorrando = new Set();
setInterval(() => {
  if(typeof tokens === 'undefined' || !fbUsuario) return;
  tokens.forEach((t, id) => {
    if(t.tipo !== 'pj' || !String(t.fichaId || '').includes(SEP_INVOCACION) || temporalesBorrando.has(id)) return;
    const r = (vinculo(t) || {}).resumen || {};
    if(!r.temporal || !r.dormida) return;
    const ficha = String(t.fichaId).split(SEP_INVOCACION)[0];
    if(!soyGM && !(typeof bnManejo === 'function' && bnManejo(ficha))) return;
    temporalesBorrando.add(id);
    const nombre = nombreDe(t);
    coleccionTokens().doc(id).delete().then(async () => {
      mesaLinea(`👁 ${nombre} se desvanece: cumplió sus turnos`, 'recordatorio');
      if(soyGM) await temporalFueraDelOrden(id);   // (solo el GM cambia el largo del orden)
    }).catch(err => { console.error('No se pudo sacar la invocación temporal:', err); temporalesBorrando.delete(id); });
  });
}, 1500);
// Su lugar en el orden de turnos también se va: si justo era su turno, primero pasa al siguiente (con su inicio de turno).
async function temporalFueraDelOrden(id){
  if(!iniciativa.orden.some(o => o.id === id)) return;
  if(iniciativa.orden[iniciativa.turno] && iniciativa.orden[iniciativa.turno].id === id){ try{ await iniciativaSiguiente(); }catch(e){ console.error(e); } }
  const i = iniciativa.orden.findIndex(o => o.id === id);
  if(i < 0) return;
  let turno = iniciativa.turno;
  if(i < turno) turno--;
  const orden = iniciativa.orden.filter(o => o.id !== id).map(o => o.oculto ? {id: o.id, valor: num(o.valor), oculto: true} : {id: o.id, valor: num(o.valor)});
  if(turno >= orden.length) turno = 0;
  await guardarIniciativa({orden, turno});
}
