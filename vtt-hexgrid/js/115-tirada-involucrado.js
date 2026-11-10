/* ---------- 🎲 Las tiradas las hace el involucrado (dueño, 2026-11-10) ----------
   «No quiero que las tiradas las haga sola el mapa. Quiero que las tiradas las haga el usuario involucrado… porque le quitan la sensación de que
   el jugador está involucrado en la partida.» (Lo mismo que las trampas, js/19, y el dado del Escudo elemental, js/106.)

   tiradaInvolucrado({token, stat, extra, etq, icono, titulo, texto}) → Promise<{total, formula, rolls, aMano?} | null>
   - La tira quien MANEJA a `token`: un creep → el GM; un personaje o su invocación → quien tiene 🎮 el control, si no su dueño.
   - Si es esta misma pantalla: el cartel sale acá («🎲 Tirar <etq> (fórmula)» y «✋ Resolver a mano»).
   - Si no: un momento `tirada-pedida` (esperando) que esa pantalla abre como cartel y contesta (estado 'tirado' o 'mano'); esta espera.
   - 🧯 Respaldo del GM: si la pantalla que tiene que tirar no avisó que lo vio (`datos.visto`) en TIRADA_RESPALDO_MS, al GM le sale el mismo cartel
     («· tirá por él»); y en la Crónica, mientras espera, el GM tiene «🎲 Tirar por él». Lo toma una transacción (esperando → tirando): nunca dos veces.
   - La tirada va a la Mesa con los dados 3D, a nombre del involucrado; «✋ Resolver a mano»: la mesa escribe el total.
   Lo usan Golpe en la sien, Carga que derriba (js/78), Salto aplastante (js/55), Tolerar un efecto y Atraer (js/13). Una por vez en cada pantalla (en fila). */
const TIRADA_RESPALDO_MS = 6000, TIRADA_MAX_MS = 5 * 60 * 1000;
const tiradaEsperan = new Map();   // momentoId → resolve (la pantalla que pidió la tirada)
const tiradaVistos = new Set(), tiradaTomadas = new Set(), tiradaCola = [];
let tiradaAbierta = null;

// Quién tira por `t`: {gm: true, nombre} o {uid, nombre}.
function tiradaManeja(t){
  if(!t || t.tipo === 'creep' || !t.fichaId) return {gm: true, nombre: 'el GM'};
  const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
  const uid = (f && f.resumen && f.resumen.control) || t.duenoUid || (f && f.duenoUid) || '';
  if(!uid) return {gm: true, nombre: 'el GM'};
  const m = typeof miembros !== 'undefined' ? miembros.get(uid) : null;
  if(m && m.gm) return {gm: true, nombre: 'el GM'};
  return {uid, nombre: (m && m.nombre) || nombreDe(t)};
}
const tiradaEsMia = tz => tz.gm ? !!soyGM : !!(fbUsuario && fbUsuario.uid === tz.uid);
// El valor del stat y los estados de `t`, como los ve esta pantalla (la que maneja a `t` los ve todos).
function tiradaValorDe(t, stat){
  if(t && t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? CreepCalculo.statValor(sc, stat) : 0; }
  return trampaValorStat(t, stat);
}
// El valor a tirar: el que se pasó (`valor`, p. ej. el Ef.Esp guardado de quien usó la habilidad) o el stat del token, más `extra`.
const tiradaValorInfo = (info, t) => (info.valor !== null && info.valor !== undefined && info.valor !== '' ? num(info.valor) : (t ? tiradaValorDe(t, info.stat) : 0)) + num(info.extra);
// La tirada en esta pantalla: los dados (a la Mesa, a nombre del involucrado) o lo que escribió la mesa. → {total, formula, rolls, aMano?} | null.
async function tiradaHacerAca(info, mano){
  const t = tokens.get(info.tokenId);
  const quien = info.quien || (t ? nombreDe(t) : '');
  const aNombre = info.creep ? {desde: 'gm'} : (info.ficha ? {ficha: info.ficha} : {});
  if(mano !== undefined){
    mesaLinea(`✋ ${quien} · ${info.etq}: a mano, ${mano} (lo decidió la mesa)${info.porGM ? ' · lo resolvió el GM' : ''}`, 'recordatorio');
    return {total: mano, formula: 'a mano', rolls: [], aMano: true};
  }
  const valor = tiradaValorInfo(info, t);
  const r = Combatiente.tirarStat(valor, t && !info.sinEstados ? confusionEstadosDe(t) : [], info.stat);
  if(!r) return null;
  try{ await mesaPublicar(`${info.icono || '🎲'} ${quien} · ${info.etq}${info.para ? ` (${info.para})` : ''}${info.porGM ? ' · lo tiró el GM' : ''}`, {...r, quien, ...aNombre}); }catch(err){}
  await new Promise(res => (!document.hidden && typeof Duelo !== 'undefined' && Duelo.esperarDados) ? Duelo.esperarDados(res) : res());
  return {total: num(r.total), formula: r.formula || '', rolls: r.rolls || []};
}
async function tiradaPedirMano(info){
  const t = await Confirmar.texto(`${info.quien}: ¿qué salió en ${info.etq}? Escribí el total que decidió la mesa.`, {titulo: 'Resolver a mano', icono: '✋', valor: '', si: 'Seguir', max: 4});
  if(t === null || t === undefined) return null;
  const n = Math.round(Number(String(t).trim()));
  if(!Number.isFinite(n) || n < 0){ toast('Escribí un número (0 o más)'); return tiradaPedirMano(info); }
  return n;
}
// El cartel. → Promise<{total, …} | null>. Uno por vez; si otro cartel lo tapa, vuelve a aparecer cuando se cierra. Se cierra solo con sus botones.
function tiradaCartel(info, alTomar){
  return new Promise(fin => {
    let listo = false, fase = 'inicio', vigia = null;
    const clave = 'tirada-inv:' + (info.mid || 'local') + ':' + Math.random().toString(36).slice(2, 7);
    const cerrar = v => { if(listo) return; listo = true; if(vigia) clearInterval(vigia); try{ if(AvisoCombate.abiertoClave() === clave) AvisoCombate.cerrar(); }catch(e){} fin(v); };
    const t = tokens.get(info.tokenId);
    const valor = tiradaValorInfo(info, t), f = formulaParaValor(valor);
    const titulo = `${info.titulo || ''}${info.porGM ? ` · tirá por ${info.tiraNombre || 'él'}` : ''}`;
    const correr = async mano => {
      fase = 'tirando';
      if(alTomar && !(await alTomar())){ cerrar(null); return; }
      if(mano === undefined) AvisoCombate.mostrar({clave, soloBoton: true, icono: info.icono || '🎲', titulo, pasos: [{titulo: info.texto || '', texto: `🎲 Rodando ${info.etq}…`, espera: true}],
        botones: [{texto: '🎲 Tirando…', deshabilitado: true}], alCerrar: () => {}});
      const r = await tiradaHacerAca(info, mano);
      if(!r){ toast(`No se pudo tirar ${info.etq}`); cerrar(null); return; }
      cerrar(r);
    };
    const mostrarInicio = () => AvisoCombate.mostrar({clave, soloBoton: true, icono: info.icono || '🎲', titulo,
      pasos: [{titulo: info.texto || 'Tirada', texto: `🎲 ${info.etq}${f ? ` (${f.formula})` : ''}${num(info.extra) ? ` — incluye +${num(info.extra)}` : ''}.`, espera: true}],
      botones: [{texto: `🎲 Tirar ${info.etq}${f ? ` (${f.formula})` : ''}`, alClic: () => { if(!listo && fase === 'inicio') correr(); }},
        {texto: '✋ Resolver a mano', sec: true, alClic: async () => {
          if(listo || fase !== 'inicio') return;
          const n = await tiradaPedirMano({...info, quien: info.quien || (t ? nombreDe(t) : '')});
          if(n === null) return;
          correr(n);
        }}],
      alCerrar: () => {}});
    vigia = setInterval(() => { if(!listo && fase === 'inicio' && !AvisoCombate.abierto()) mostrarInicio(); }, 1000);
    if(!AvisoCombate.abierto()) mostrarInicio();
  });
}
// Fila local: un cartel por vez en esta pantalla.
let tiradaFila = Promise.resolve();
const tiradaEnFila = fn => { const p = tiradaFila.then(fn, fn); tiradaFila = p.catch(() => {}); return p; };

// Pide la tirada a quien maneja a `o.token`. → {total, formula, rolls, aMano?} | null (nadie tiró: a mano).
async function tiradaInvolucrado(o){
  const t = o.token, tz = tiradaManeja(t);
  const info = {tokenId: o.tokenId || [...tokens.entries()].find(([, x]) => x === t)?.[0] || '', stat: String(o.stat), extra: num(o.extra), ...(o.valor !== undefined && o.valor !== null ? {valor: num(o.valor)} : {}), ...(o.sinEstados ? {sinEstados: true} : {}), etq: String(o.etq || o.stat),
    icono: o.icono || '🎲', titulo: String(o.titulo || ''), texto: String(o.texto || ''), para: String(o.para || ''), quien: t ? nombreDe(t) : '',
    creep: !!(t && t.tipo === 'creep'), ficha: t && t.tipo !== 'creep' && t.fichaId ? String(t.fichaId).split(SEP_INVOCACION)[0] : '', tiraNombre: tz.nombre};
  if(tiradaEsMia(tz)) return tiradaEnFila(() => tiradaCartel(info, null));
  const mid = await momentoAbrir({tipo: 'tirada-pedida', icono: '⏳', titulo: `⏳ Esperando que ${tz.gm ? 'el GM' : tz.nombre} tire ${info.etq} de ${info.quien}${info.para ? ` (${info.para})` : ''}`,
    estado: 'esperando', datos: {...info, tiraUid: tz.gm ? '' : tz.uid, tiraGM: !!tz.gm}});
  if(!mid) return tiradaEnFila(() => tiradaCartel({...info, porGM: true}, null));   // sin momentos (reglas viejas): la tira esta pantalla, para no trabar
  return new Promise(res => {
    tiradaEsperan.set(mid, res);
    setTimeout(() => { if(tiradaEsperan.get(mid) === res){ tiradaEsperan.delete(mid); momentoActualizar(mid, {estado: 'listo', resultado: 'Nadie tiró a tiempo: ✋ a mano.'}); res(null); } }, TIRADA_MAX_MS);
  });
}

// Llega un momento `tirada-pedida` (js/16).
function tiradaMomento(id, d){
  const dt = d.datos || {};
  const espera = tiradaEsperan.get(id);
  if(espera && (d.estado === 'tirado' || d.estado === 'mano')){
    tiradaEsperan.delete(id);
    espera({total: num(dt.total), formula: String(dt.formula || (d.estado === 'mano' ? 'a mano' : '')), rolls: dt.rolls || [], ...(d.estado === 'mano' ? {aMano: true} : {})});
    return;
  }
  if(d.estado !== 'esperando'){
    if(tiradaAbierta === id && !tiradaTomadas.has(id) && String(AvisoCombate.abiertoClave() || '').startsWith('tirada-inv:' + id + ':')) AvisoCombate.cerrar();
    return;
  }
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!fbUsuario || tiradaVistos.has(id) || Date.now() - ms > TIRADA_MAX_MS) return;
  const mio = dt.tiraGM ? !!soyGM : dt.tiraUid === fbUsuario.uid;
  if(mio){
    tiradaVistos.add(id);
    if(!dt.visto) momentoActualizar(id, {'datos.visto': true});   // así el GM no salta a tirar por esta pantalla
    tiradaCola.push({id, d}); tiradaMostrar(); return;
  }
  // 🧯 Si la pantalla que tiene que tirar no aparece, el GM tira por ella.
  if(soyGM && !dt.tiraGM){
    tiradaVistos.add(id);
    setTimeout(async () => {
      try{
        const x = await coleccionMomentos().doc(id).get();
        if(x.exists && x.data().estado === 'esperando' && !(x.data().datos || {}).visto){ tiradaCola.push({id, d: x.data(), porGM: true}); tiradaMostrar(); }
      }catch(err){}
    }, Math.max(0, TIRADA_RESPALDO_MS - (Date.now() - ms)));
  }
}
// «🎲 Tirar por él» de la Crónica (el GM, cuando la pantalla del jugador lo vio pero no tira).
async function tiradaPorEl(id){
  try{
    const x = await coleccionMomentos().doc(id).get();
    if(x.exists && x.data().estado === 'esperando'){ tiradaCola.unshift({id, d: x.data(), porGM: true}); tiradaMostrar(); }
    else toast('Esa tirada ya se hizo');
  }catch(err){ console.error('Tirar por él:', err); }
}
function tiradaMostrar(){
  if(tiradaAbierta || !tiradaCola.length) return;
  const {id, d, porGM} = tiradaCola.shift(), dt = d.datos || {};
  tiradaAbierta = id;
  const tomar = async () => {
    const ref = coleccionMomentos().doc(id);
    let tomo = false;
    try{ await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(x.exists && x.data().estado === 'esperando'){ tx.update(ref, {estado: 'tirando'}); tomo = true; } }); }
    catch(err){ console.error('Tirada: no se pudo tomar', err); }
    if(!tomo) toast('Esa tirada ya se hizo');
    else tiradaTomadas.add(id);
    return tomo;
  };
  tiradaEnFila(() => tiradaCartel({...dt, mid: id, porGM: !!porGM}, tomar)).then(async r => {
    if(r && r.aMano) await momentoActualizar(id, {estado: 'mano', 'datos.total': r.total, 'datos.formula': 'a mano', titulo: `✋ ${dt.quien} · ${dt.etq}: a mano, ${r.total}`});
    else if(r) await momentoActualizar(id, {estado: 'tirado', 'datos.total': r.total, 'datos.formula': r.formula || '', 'datos.rolls': r.rolls || [],
      titulo: `🎲 ${dt.quien} · ${dt.etq}: ${fmt(r.total)}${porGM ? ' (lo tiró el GM)' : ''}`});
  }).catch(err => console.error('Tirada del involucrado:', err)).finally(() => { tiradaAbierta = null; setTimeout(tiradaMostrar, 300); });
}
// El botón de la Crónica: el GM, mientras la tirada de un jugador espera.
function tiradaBotonFeed(id, d){
  const dt = d.datos || {};
  if(d.estado !== 'esperando' || !soyGM || dt.tiraGM) return '';
  return `<div style="margin-top:6px"><button type="button" data-tirada-por-el="${esc(id)}" style="font-size:12px;padding:3px 10px;border-radius:6px;border:1px solid #c98545;background:#2a2016;color:#f0c890;cursor:pointer">🎲 Tirar por ${esc(dt.tiraNombre || 'él')}</button></div>`;
}
