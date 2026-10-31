/* ---------- 🎲 La tirada extra de una zona la tira quien la creó (2026-10-22, dueño, después de la sesión en «El origen de las especies») ----------
   «Ese dado lo tenga que tirar el usuario de Larry, en una instancia de "tirá para el efecto del pedo tóxico contra Goblin 1"». Cuando el daño de
   una zona que creó un personaje entra (zonaResolverBanner, js/08), el dado extra (`zonaTiraExtra`, ej. 1d20) ya no lo tira solo la pantalla que
   resolvió la zona: abre el momento `zona-extra` (esperando) para quien maneja al personaje que la creó (`paraUid`: su dueño o quien tiene 🎮 el
   control). Esa pantalla muestra el Anuncio con el botón «🎲 Tirá…» (de a uno, si hay varios); la tirada sale en la Mesa a nombre de quien creó la
   zona, con la nota (qué significa cada resultado), y la Crónica lo cuenta. El GM la puede tirar por él desde la Crónica. Las zonas de un creep,
   las del GM y las de trampas siguen tirándolo solas.
   🎲→◎ Lo que sale se aplica solo, pero nunca en silencio (2026-10-22, dueño: «los estados se podrían automatizar después de la tirada de 20…
   que no se cargue de manera silenciosa»): si la zona trae la tabla «según la tirada» (`porTirada` adentro del JSON de `zonaEstado`,
   comun/combatiente.js porTiradaNorm; «cae» = el desmayo, la vida a 0), después de tirar quien tiró ve «🎲 18 → Stun (1 turno) a Goblin 1» y
   acepta («✔ Que se aplique»; o «✋ a mano»): el momento pasa a `aplicar`, y la pantalla que maneja a quien lo recibe (el GM para un creep; el
   dueño o quien tiene 🎮 el control para un personaje) ve el Anuncio «Te aplican …» y lo aplica al aceptar; la Mesa y la Crónica lo cuentan. El GM
   puede aceptar o aplicar por otro desde la Crónica. Una zona que tira sola (js/08) abre directo el momento en `aplicar`. */
const zonaExtraCola = [], zonaExtraVistos = new Set(), zonaExtraTirandoAca = new Set(), zonaExtraAplicandoAca = new Set();
let zonaExtraAbierto = null;
// El personaje que creó la zona → {uid, nombre} o null (una zona de creep, del GM o de una trampa).
function zonaExtraCasteador(el){
  if(!el || el.zonaCasteadorTipo !== 'pj' || !el.zonaCasteadorRef) return null;
  const ref = String(el.zonaCasteadorRef), fichaId = ref.split(SEP_INVOCACION)[0], f = fichasPub.get(fichaId);
  if(!f) return null;
  const uid = (f.resumen && f.resumen.control) || f.duenoUid;
  if(!uid) return null;
  const tk = [...tokens.values()].find(x => x.fichaId === ref && x.tipo !== 'creep');
  return {uid, nombre: tk ? nombreDe(tk) : (f.nombre || 'Quien la creó')};
}
// La tabla «según la tirada» de la zona (comun/combatiente.js), o [].
function zonaExtraTabla(el){
  try{ const e = JSON.parse(el.zonaEstado || '{}') || {}; return Combatiente.porTiradaNorm(e.porTirada); }catch(err){ return []; }
}
// Quién recibe lo que salga: el token que estaba en la zona.
function zonaExtraObjetivo(t){
  return t ? {tokenId: String(zonaIdDe(t) || ''), tipo: t.tipo === 'creep' ? 'creep' : 'pj', ref: String(t.fichaId || ''), uid: String(t.duenoUid || '')} : null;
}
// Lo pide (desde js/08). → el nombre de quien la tira, o '' si no corresponde (se tira como siempre).
async function zonaExtraPedir(el, quienTxt, t){
  const c = zonaExtraCasteador(el);
  if(!c || !el.zonaTiraExtra) return '';
  const zona = el.zonaNombre || 'la zona';
  try{
    await momentoAbrir({tipo: 'zona-extra', icono: '🎲', titulo: `${c.nombre} tira para el efecto de ${zona} contra ${quienTxt}`, estado: 'esperando',
      datos: {paraUid: c.uid, tira: el.zonaTiraExtra, nota: el.zonaNota || '', zona, quien: quienTxt, casteador: c.nombre, objetivo: zonaExtraObjetivo(t), porTirada: zonaExtraTabla(el)}});
    return c.nombre;
  }catch(err){ console.error('Zona: no se pudo pedir la tirada extra', err); return ''; }
}
// Una zona que tira sola (js/08: la de un creep, del GM o de una trampa) y cuya tabla dice algo para esa tirada: el momento nace en `aplicar`
// (quien lo recibe lo acepta en su pantalla). → el texto de lo que toca, o '' si la tabla no dice nada.
async function zonaExtraAplicarDirecto(el, quienTxt, t, total){
  const fila = Combatiente.efectoPorTirada(zonaExtraTabla(el), total);
  if(!fila || !t) return '';
  const zona = el.zonaNombre || 'la zona', txt = Combatiente.porTiradaFilaTxt(fila);
  try{
    await momentoAbrir({tipo: 'zona-extra', icono: '🎲', titulo: `${zona} contra ${quienTxt}: 🎲 ${total} → ${txt}`, estado: 'aplicar',
      datos: {tira: el.zonaTiraExtra || '', zona, quien: quienTxt, casteador: '', objetivo: zonaExtraObjetivo(t), aplicar: fila, total}});
  }catch(err){ console.error('Zona: no se pudo abrir el momento para aplicar', err); return ''; }
  return txt;
}
// Llega un momento `zona-extra` (js/16): si es para esta pantalla, a la fila del Anuncio.
function zonaExtraMomento(id, d){
  const dt = d.datos || {};
  if(d.estado === 'aplicar'){ zonaExtraAplicarMomento(id, d); return; }
  // Ya la tiró (o ya la aplicó) otra pantalla: se cierra el Anuncio que esperaba acá. (Lo que hace esta misma pantalla lo muestra ella.)
  if(d.estado !== 'esperando'){
    const clave = AvisoCombate.abiertoClave && AvisoCombate.abiertoClave();
    if(!zonaExtraTirandoAca.has(id) && zonaExtraAbierto === id && clave === 'zona-extra:' + id) AvisoCombate.cerrar();
    if(['aplicando', 'listo'].includes(d.estado) && !zonaExtraAplicandoAca.has(id) && zonaExtraAbierto === id && clave === 'zona-extra-ap:' + id) AvisoCombate.cerrar();
    return;
  }
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!fbUsuario || dt.paraUid !== fbUsuario.uid || zonaExtraVistos.has(id) || Date.now() - ms > 15 * 60 * 1000) return;   // (uno viejo, al abrir el mapa, no)
  zonaExtraVistos.add(id);
  zonaExtraCola.push({id, d, modo: 'tirar'});
  zonaExtraMostrar();
}
function zonaExtraMostrar(){
  if(zonaExtraAbierto || !zonaExtraCola.length) return;
  const {id, d, modo} = zonaExtraCola.shift(), dt = d.datos || {};
  zonaExtraAbierto = id;
  if(modo === 'aplicar'){ zonaExtraAnuncioAplicar(id, d); return; }
  AvisoCombate.mostrar({clave: 'zona-extra:' + id, icono: '🎲', titulo: `${dt.zona} · ${dt.quien}`,
    texto: `Tirá para el efecto de ${dt.zona} contra ${dt.quien}.${dt.nota ? ` ${dt.nota}` : ''}`,
    botones: [{texto: `🎲 Tirar ${dt.tira}`, id: 'zona-extra-tirar', alClic: () => { const b = document.getElementById('zona-extra-tirar'); if(b) b.disabled = true; zonaExtraTirar(id, d); }}],
    alCerrar: () => { zonaExtraAbierto = null; setTimeout(zonaExtraMostrar, 300); }});
}
// La tirada (su pantalla, o el GM por él desde la Crónica): se toma con una transacción, para que no se tire dos veces.
async function zonaExtraTirar(id, d, porGM){
  const dt = d.datos || {};
  const ref = fbDb.collection(fbRutaCampana('momentos')).doc(id);
  let tomo = false;
  zonaExtraTirandoAca.add(id);
  try{ await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(x.exists && x.data().estado === 'esperando'){ tx.update(ref, {estado: 'tirando'}); tomo = true; } }); }
  catch(err){ console.error('Zona: no se pudo tomar la tirada', err); }
  if(!tomo){ toast('Esa tirada ya se hizo'); if(zonaExtraAbierto === id) AvisoCombate.cerrar(); return; }
  const r = tirarDados(dt.tira);
  if(!r){ toast(`No se pudo tirar ${dt.tira}: tiralo a mano`); await momentoActualizar(id, {estado: 'esperando'}); return; }
  try{ if(dt.nota) mesaConTexto(dt.nota); await mesaPublicar(`${dt.zona} contra ${dt.quien}${porGM ? ' (lo tiró el GM)' : ''}`, {formula: r.formula || dt.tira, rolls: r.rolls, mod: r.mod, total: r.total, quien: dt.casteador}); }catch(err){}
  const fila = Combatiente.efectoPorTirada(dt.porTirada, r.total);
  const alCerrar = () => { zonaExtraAbierto = null; setTimeout(zonaExtraMostrar, 300); };
  if(!fila){
    const resultado = `🎲 ${dt.tira}: ${r.total}${dt.nota ? ` — ${dt.nota}` : ''}${(dt.porTirada || []).length ? ' → nada' : ''}`;
    await momentoActualizar(id, {estado: 'listo', resultado});
    if(zonaExtraAbierto === id) AvisoCombate.mostrar({clave: 'zona-extra:' + id, icono: '🎲', titulo: `${dt.zona} · ${dt.quien}`, texto: resultado,
      veredicto: {tono: (dt.porTirada || []).length ? 'neutro' : 'bueno', grande: `🎲 ${r.total}`}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}], alCerrar});
    return;
  }
  // 🎲→◎ Hay algo que aplicar: quien tiró lo ve y lo acepta (dueño: «se van a aplicar estos estados: Aceptar»). Recién ahí le llega a quien lo recibe.
  const txt = Combatiente.porTiradaFilaTxt(fila), resultado = `🎲 ${dt.tira}: ${r.total} → ${txt}`;
  await momentoActualizar(id, {estado: 'tirado', resultado, 'datos.total': r.total, 'datos.aplicar': fila});
  if(porGM) zonaExtraAbierto = id;
  if(zonaExtraAbierto === id) AvisoCombate.mostrar({clave: 'zona-extra:' + id, icono: '🎲', titulo: `${dt.zona} · ${dt.quien}`,
    texto: `Salió ${r.total}: a ${dt.quien} le toca ${txt}. Se aplica en la pantalla de quien lo recibe, cuando acepte.`,
    veredicto: {tono: 'malo', grande: `🎲 ${r.total} → ${txt}`},
    botones: [{texto: '✔ Que se aplique', alClic: async () => { await momentoActualizar(id, {estado: 'aplicar'}); AvisoCombate.cerrar(); }},
      {texto: '✋ Lo resolvemos a mano', sec: true, alClic: async () => { await momentoActualizar(id, {estado: 'listo', resultado: resultado + ' (a mano)'}); AvisoCombate.cerrar(); }}],
    alCerrar});
}
/* ---------- Quien lo recibe ---------- */
// ¿Esta pantalla maneja a quien lo recibe? Un creep: el GM. Un personaje o su invocación: su dueño, o el GM con 🎮 el control (bnManejo, js/11).
function zonaExtraManejo(o){
  if(!o) return false;
  if(o.tipo === 'creep') return !!soyGM;
  const fichaId = String(o.ref || '').split(SEP_INVOCACION)[0];
  return !!fichaId && typeof bnManejo === 'function' && bnManejo(fichaId);
}
function zonaExtraAplicarMomento(id, d){
  const dt = d.datos || {};
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!dt.aplicar || zonaExtraVistos.has(id + ':ap') || Date.now() - ms > 15 * 60 * 1000 || !zonaExtraManejo(dt.objetivo)) return;
  zonaExtraVistos.add(id + ':ap');
  zonaExtraCola.push({id, d, modo: 'aplicar'});
  zonaExtraMostrar();
}
// El Anuncio «Te aplican …» (dueño: «a la persona que lo recibe también: te aplican este estado, Aceptar»).
function zonaExtraAnuncioAplicar(id, d){
  const dt = d.datos || {}, fila = dt.aplicar, txt = Combatiente.porTiradaFilaTxt(fila);
  AvisoCombate.mostrar({clave: 'zona-extra-ap:' + id, icono: fila.caer ? '💀' : '◎', titulo: `${dt.zona} · ${dt.quien}`,
    texto: `${dt.casteador ? `${dt.casteador} tiró` : 'Salió'} ${dt.total} en ${dt.tira} por ${dt.zona}: a ${dt.quien} le toca ${txt}.`,
    veredicto: {tono: 'malo', grande: fila.caer ? `💀 ${dt.quien} cae` : `◎ ${txt}`},
    botones: [{texto: '✔ Aceptar', id: 'zona-extra-aceptar', alClic: () => { const b = document.getElementById('zona-extra-aceptar'); if(b) b.disabled = true; zonaExtraAplicar(id, d); }}],
    alCerrar: () => { zonaExtraAbierto = null; setTimeout(zonaExtraMostrar, 300); }});
}
// Aplicarlo de verdad (esta pantalla, o el GM por otro desde la Crónica): se toma con una transacción, así no entra dos veces.
async function zonaExtraAplicar(id, d, porGM){
  const dt = d.datos || {}, fila = dt.aplicar, o = dt.objetivo;
  if(!fila || !o) return;
  const ref = fbDb.collection(fbRutaCampana('momentos')).doc(id);
  let tomo = false;
  zonaExtraAplicandoAca.add(id);
  try{ await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(x.exists && ['aplicar', 'tirado'].includes(x.data().estado)){ tx.update(ref, {estado: 'aplicando'}); tomo = true; } }); }
  catch(err){ console.error('Zona: no se pudo tomar la aplicación', err); }
  if(!tomo){ toast('Eso ya se aplicó'); if(zonaExtraAbierto === id) AvisoCombate.cerrar(); return; }
  const txt = Combatiente.porTiradaFilaTxt(fila), origen = dt.zona || 'Zona';
  let hecho = '';
  try{
    if(o.tipo === 'creep'){
      await modificarCreep(o.ref, sc => {
        if(fila.caer){ sc.hp = 0; return; }
        const r = EstadosAplicar.aplicarACreep(sc, {...fila.estado});
        if(r && r.ok === false) throw new Error(r.motivo || 'no entró');
      });
    }else{
      const [fichaId, invId] = String(o.ref).split(SEP_INVOCACION);
      if(invId){   // una invocación: por el aviso de siempre (su dueño lo aplica); caer, la vida a 0 directo
        if(fila.caer) await cambiarVidaPj({fichaId: o.ref}, null, '0');
        else await EstadosAplicar.encolarPj({fichaId: o.ref, duenoUid: o.uid, spec: {...fila.estado}, origen});
      }else{
        const ok = await editarPersonajeMapa(fichaId, S => {
          if(fila.caer){ FichaAcciones.fijarHp(S, 0); FichaAcciones.revisarMuerte(S); return true; }
          const nombre = ((S.meta && S.meta.nombre) || '').trim();
          const ui = {presets: estadosPresetFicha(), cambio: () => {}, toast: m => toast(m),
            recordatorios: lista => (lista || []).forEach(x => x && x.nombre && mesaLinea(`${x.nombre}${x.detalle ? ' — ' + x.detalle : ''}`, 'recordatorio', nombre))};
          FichaAcciones.aplicarEstadoRecibido(S, {...fila.estado}, origen, ui);
          return true;
        });
        if(ok === null) throw new Error('no pude abrir su ficha');
      }
    }
    hecho = fila.caer ? `${dt.quien} cae (la vida a 0)` : `${dt.quien}: ${txt}`;
  }catch(err){
    console.error('Zona: no se pudo aplicar lo de la tirada', err);
    hecho = `${dt.quien}: ${txt} — no se pudo aplicar (${err && err.message || err}); va a mano`;
  }
  try{ mesaLinea(`${origen} → ${hecho}`, 'recordatorio', dt.casteador || ''); }catch(err){}
  await momentoActualizar(id, {estado: 'listo', resultado: `✔ ${hecho}${porGM ? ' (lo aplicó el GM)' : ''}`});
  if(zonaExtraAbierto === id) AvisoCombate.mostrar({clave: 'zona-extra-ap:' + id, icono: fila.caer ? '💀' : '◎', titulo: `${dt.zona} · ${dt.quien}`, texto: hecho,
    veredicto: {tono: 'malo', grande: `✔ ${fila.caer ? 'cae' : txt}`}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}],
    alCerrar: () => { zonaExtraAbierto = null; setTimeout(zonaExtraMostrar, 300); }});
}
