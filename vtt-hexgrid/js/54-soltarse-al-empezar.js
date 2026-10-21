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
  if(soyGM) mordidaSoltar(o.id, iniciativa.paso);   // 🦷 la bestia suelta al empezar su turno
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
      soltarAlEmpezarCartel(clave, sc.nombre, est, () => soltarAlEmpezarCreep(clave, ref, t));
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
    soltarAlEmpezarCartel(clave, info.nombre, info.est, () => soltarAlEmpezarPj(clave, fichaId, invId, t));
  }catch(err){ console.error('Soltarse al empezar el turno:', err); }
}
function soltarAlEmpezarCartel(clave, nombre, est, tirar){
  const s = Combatiente.soltarNorm(est.soltar);
  AvisoCombate.cartel('soltar-' + clave, {icono: '🔓', titulo: `${nombre}: ¿se suelta?`,
    texto: `Empieza su turno atrapado (${est.nombre}). Tira ${s.etq} contra ${s.dif}: si llega, se suelta. Esta tirada no cuesta No2.${s.danoFalla ? ` Si no se suelta, ${s.deNombre ? 'el mordisco de ' + s.deNombre : 'el mordisco'} le vuelve a hacer daño (${s.danoFalla}).` : ''}`,
    botones: [{texto: `🎲 Tirar ${s.etq}`, alClic: tirar}, {texto: 'Ahora no', sec: true, alClic: () => AvisoCombate.cartel('soltar-' + clave, null)}]});
}
// Primero los dados, después el resultado (regla del dueño, 2026-09-26): espera a que los dados 3D queden quietos.
const esperarDadosMapa = () => new Promise(res => typeof Duelo !== 'undefined' && Duelo.esperarDados && !document.hidden ? Duelo.esperarDados(res) : res());
const soltarTirando = (clave, nombre) => AvisoCombate.cartel('soltar-' + clave, {icono: '🔓', titulo: `${nombre}: ¿se suelta?`, texto: '🎲 Tirando…'});
function soltarAlEmpezarResultado(clave, nombre, estNombre, tt, extra){
  const txt = (tt.ok ? `${nombre} se soltó de ${estNombre} (${tt.r ? tt.r.total : '—'} contra ${tt.s.dif}).` : `${nombre} no se soltó de ${estNombre} (${tt.r ? tt.r.total : '—'} contra ${tt.s.dif}): sigue atrapado este turno.`) + (extra ? ' ' + extra : '');
  mesaLinea(`🔓 ${txt}`, 'recordatorio');
  AvisoCombate.cartel('soltar-' + clave, {icono: '🔓', titulo: `${nombre}: ¿se suelta?`, veredicto: {tono: tt.ok ? 'bueno' : 'malo', grande: tt.ok ? '¡SE SOLTÓ!' : 'SIGUE ATRAPADO', chico: txt},
    botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cartel('soltar-' + clave, null)}]});
}
async function soltarAlEmpezarCreep(clave, creepId, t){
  const p = creepsPriv.get(creepId), sc = p && p.sc;
  const tt = sc && CreepAcciones.tiradaSoltarse(sc);
  if(!tt || !tt.r){ AvisoCombate.cartel('soltar-' + clave, null); return; }
  const gratis = {...tt, s: {...tt.s, no2: 0}};
  const estNombre = ((sc.estados || []).find(e => e.id === tt.estId) || {}).nombre || 'el estado';
  soltarTirando(clave, sc.nombre);
  mesaPublicar(tt.origen, {...tt.r, quien: sc.nombre, desde: 'gm'});
  await esperarDadosMapa();
  try{ await modificarCreep(creepId, c => { CreepAcciones.aplicarSoltarse(c, gratis); return {}; }); }catch(err){ console.error(err); toast('No se pudo anotar el resultado: sacá el estado a mano'); }
  const extra = !tt.ok && tt.s.danoFalla ? await mordidaDano(t, sc.nombre, tt.s) : '';
  soltarAlEmpezarResultado(clave, sc.nombre, estNombre, tt, extra);
}
async function soltarAlEmpezarPj(clave, fichaId, invId, t){
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
  soltarTirando(clave, res.nombre);
  mesaPublicar(`${res.nombre} · Soltarse (${res.est}) · ${res.tt.s.etq} contra ${res.tt.s.dif}`, {...res.tt.r, quien: res.nombre, ficha: fichaId});
  await esperarDadosMapa();
  const extra = !res.tt.ok && res.tt.s.danoFalla ? await mordidaDano(t, res.nombre, res.tt.s) : '';
  soltarAlEmpezarResultado(clave, res.nombre, res.est, res.tt, extra);
}

/* ---------- 🦷 Mordisco feroz (2026-10-21, dueño: «mientras la bestia me está mordiendo, debería repetir el daño… y si tira para soltarse y no se
   suelta, debería hacerle daño»; «también queda trabada, y al principio del siguiente turno la bestia se suelta») ----------
   El estado «Mordido» lleva en su `soltar` quién lo tiene agarrado (`de`, el token) y el daño que se repite (`danoFalla`). Al pegar, la bestia queda
   «Mordiendo» (`muerdeA`). Si el mordido no se suelta al empezar su turno, `mordidaDano` le aplica ese daño otra vez (con su Defensa). Al empezar el
   turno de la bestia, `mordidaSoltar` (el GM) les saca los dos estados; y si el mordido se zafa antes, el revisado de abajo le saca el «Mordiendo» a
   la bestia. */
async function mordidaEmpezar(d, spec){
  const ta = tokens.get(d.atacante.tokenId), victima = nombreDe(tokens.get(d.defensor.tokenId)) || d.defensor.nombre || 'alguien';
  if(spec.soltar) spec.soltar = {...spec.soltar, de: d.atacante.tokenId, deNombre: String(d.atacante.nombre || '').slice(0, 40)};
  if(!ta) return;
  const est = {nombre: 'Mordiendo', muerdeA: d.defensor.tokenId, muerdeANombre: String(victima).slice(0, 40), desde: Date.now()};
  try{
    if(ta.tipo === 'creep') await modificarCreep(String(ta.fichaId), c => { EstadosAplicar.aplicarACreep(c, est); return {}; });
    else{ const f = fichasPub.get(String(ta.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: ta.fichaId, duenoUid: (f && f.duenoUid) || ta.duenoUid, spec: est, origen: `${d.atacante.nombre} · mordisco`}); }
  }catch(err){ console.error('Mordisco: no se pudo trabar a la bestia', err); }
}
// El daño que se repite al no soltarse. → el texto para el cartel.
async function mordidaDano(t, nombre, s){
  const r = typeof tirarDados === 'function' ? tirarDados(s.danoFalla) : null;
  if(!t || !r) return `✋ El mordisco le vuelve a hacer daño (${s.danoFalla}): aplicalo a mano.`;
  const quien = s.deNombre || 'La bestia';
  mesaPublicar(`🦷 ${quien} sigue mordiendo a ${nombre} · Daño`, {...r, quien, ...(t.tipo === 'creep' ? {desde: 'gm'} : {})});
  await esperarDadosMapa();
  let res = null;
  try{
    if(t.tipo === 'creep'){ if(soyGM) res = await danioCreep(t, String(r.total), false, 0, 0); }
    else res = await (String(t.fichaId).includes(SEP_INVOCACION) ? danioInv : danioPj)(t, String(r.total), false, 0, 0);
  }catch(err){ console.error('Mordisco: no se pudo aplicar el daño', err); }
  const txt = res && res.r ? `${quien} sigue mordiendo: ${s.danoFalla} = ${r.total}${res.r.invulnerable ? ' → Invulnerable: no le hizo nada' : ` − Defensa ${fmt(res.r.defensa)} → ${fmt(res.r.recibido)} de daño`}.`
    : `${quien} sigue mordiendo: ${s.danoFalla} = ${r.total} de daño, menos su Defensa — aplicalo a mano.`;
  mesaLinea(`🦷 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'mordisco', icono: '🦷', titulo: `${quien} sigue mordiendo a ${nombre}`, resultado: txt, estado: 'listo', datos: {chico: true}});
  return txt;
}
// Le saca un estado a un token (el GM): un creep directo; un personaje o una invocación, por aviso a su pantalla.
async function mordidaQuitar(t, nombreEstado, origen){
  if(!t) return;
  if(t.tipo === 'creep') return modificarCreep(String(t.fichaId), c => { c.estados = (c.estados || []).filter(z => !(z && z.nombre === nombreEstado)); return {}; });
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
  return EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: (f && f.duenoUid) || t.duenoUid, spec: {nombre: 'Quitar estado', estado: nombreEstado}, origen});
}
const mordidaHechos = new Set();   // token@paso: una vez por turno
async function mordidaSoltar(tokenId, paso){
  const clave = `${tokenId}@${paso}`;
  if(mordidaHechos.has(clave)) return;
  mordidaHechos.add(clave);
  const bestia = tokens.get(tokenId);
  if(!bestia) return;
  const quien = nombreDe(bestia), soltados = [];
  for(const [id, t] of tokens){
    if(id === tokenId || !confusionEstadosDe(t).some(e => e && e.nombre === 'Mordido' && e.soltar && e.soltar.de === tokenId)) continue;
    try{ await mordidaQuitar(t, 'Mordido', `${quien} te soltó`); soltados.push(nombreDe(t)); }catch(err){ console.error('Mordisco: no se pudo soltar', err); toast(`Sacale Mordido a ${nombreDe(t)} a mano`); }
  }
  if(confusionEstadosDe(bestia).some(e => e && e.nombre === 'Mordiendo')) try{ await mordidaQuitar(bestia, 'Mordiendo', 'Soltaste'); }catch(err){ console.error(err); }
  if(soltados.length){
    const txt = `${quien} suelta a ${soltados.join(' y ')} al empezar su turno.`;
    mesaLinea(`🦷 ${txt}`, 'recordatorio');
    if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'mordisco', icono: '🦷', titulo: `${quien} suelta`, resultado: txt, estado: 'listo', datos: {chico: true}});
  }
}
// Si el mordido se zafó antes (o ya no está), la bestia deja de estar trabada. Solo el GM; desde los 8 s de morder (el estado del mordido tarda en llegar).
const mordidaRevisando = new Set();
setInterval(() => {
  if(typeof tokens === 'undefined' || !soyGM) return;
  tokens.forEach((b, bid) => {
    if(b.tipo !== 'creep' || mordidaRevisando.has(bid)) return;
    const e = confusionEstadosDe(b).find(x => x && x.nombre === 'Mordiendo' && x.muerdeA);
    if(!e || Date.now() - num(e.desde) < 8000) return;
    const v = tokens.get(e.muerdeA);
    const delMismo = de => de === bid || ((tokens.get(de) || {}).fichaId === b.fichaId && (tokens.get(de) || {}).tipo === 'creep');   // (dos tokens del mismo creep)
    if(v && confusionEstadosDe(v).some(x => x && x.nombre === 'Mordido' && x.soltar && delMismo(x.soltar.de))) return;
    mordidaRevisando.add(bid);
    mordidaQuitar(b, 'Mordiendo', 'Se zafó').then(() => mesaLinea(`🦷 ${nombreDe(b)} ya no tiene agarrado a ${e.muerdeANombre || 'nadie'}: queda libre.`, 'recordatorio'))
      .catch(err => console.error('Mordisco:', err)).finally(() => setTimeout(() => mordidaRevisando.delete(bid), 3000));
  });
}, 2000);

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
