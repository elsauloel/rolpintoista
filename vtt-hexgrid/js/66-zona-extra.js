/* ---------- 🎲 La tirada extra de una zona la tira quien la creó (2026-10-22, dueño, después de la sesión en «El origen de las especies») ----------
   «Ese dado lo tenga que tirar el usuario de Larry, en una instancia de "tirá para el efecto del pedo tóxico contra Goblin 1"». Cuando el daño de
   una zona que creó un personaje entra (zonaResolverBanner, js/08), el dado extra (`zonaTiraExtra`, ej. 1d20) ya no lo tira solo la pantalla que
   resolvió la zona: abre el momento `zona-extra` (esperando) para quien maneja al personaje que la creó (`paraUid`: su dueño o quien tiene 🎮 el
   control). Esa pantalla muestra el Anuncio con el botón «🎲 Tirá…» (de a uno, si hay varios); la tirada sale en la Mesa a nombre de quien creó la
   zona, con la nota (qué significa cada resultado: lo que diga se aplica a mano), y la Crónica lo cuenta. El GM la puede tirar por él desde la
   Crónica. Las zonas de un creep, las del GM y las de trampas siguen tirándolo solas. */
const zonaExtraCola = [], zonaExtraVistos = new Set(), zonaExtraTirandoAca = new Set();
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
// Lo pide (desde js/08). → el nombre de quien la tira, o '' si no corresponde (se tira como siempre).
async function zonaExtraPedir(el, quienTxt){
  const c = zonaExtraCasteador(el);
  if(!c || !el.zonaTiraExtra) return '';
  const zona = el.zonaNombre || 'la zona';
  try{
    await momentoAbrir({tipo: 'zona-extra', icono: '🎲', titulo: `${c.nombre} tira para el efecto de ${zona} contra ${quienTxt}`, estado: 'esperando',
      datos: {paraUid: c.uid, tira: el.zonaTiraExtra, nota: el.zonaNota || '', zona, quien: quienTxt, casteador: c.nombre}});
    return c.nombre;
  }catch(err){ console.error('Zona: no se pudo pedir la tirada extra', err); return ''; }
}
// Llega un momento `zona-extra` (js/16): si es para esta pantalla, a la fila del Anuncio.
function zonaExtraMomento(id, d){
  const dt = d.datos || {};
  // Ya la tiró otra pantalla (el GM por él): se cierra el Anuncio. (La que tira esta pantalla la muestra zonaExtraTirar.)
  if(d.estado !== 'esperando'){ if(!zonaExtraTirandoAca.has(id) && zonaExtraAbierto === id && AvisoCombate.abiertoClave && AvisoCombate.abiertoClave() === 'zona-extra:' + id) AvisoCombate.cerrar(); return; }
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!fbUsuario || dt.paraUid !== fbUsuario.uid || zonaExtraVistos.has(id) || Date.now() - ms > 15 * 60 * 1000) return;   // (uno viejo, al abrir el mapa, no)
  zonaExtraVistos.add(id);
  zonaExtraCola.push({id, d});
  zonaExtraMostrar();
}
function zonaExtraMostrar(){
  if(zonaExtraAbierto || !zonaExtraCola.length) return;
  const {id, d} = zonaExtraCola.shift(), dt = d.datos || {};
  zonaExtraAbierto = id;
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
  const resultado = `🎲 ${dt.tira}: ${r.total}${dt.nota ? ` — ${dt.nota}` : ''}`;
  await momentoActualizar(id, {estado: 'listo', resultado});
  if(zonaExtraAbierto === id) AvisoCombate.mostrar({clave: 'zona-extra:' + id, icono: '🎲', titulo: `${dt.zona} · ${dt.quien}`, texto: resultado,
    veredicto: {tono: 'bueno', grande: `🎲 ${r.total}`}, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}],
    alCerrar: () => { zonaExtraAbierto = null; setTimeout(zonaExtraMostrar, 300); }});
}
