/* ---------- 🧿 Mal de ojo (2026-10-21, dueño; el Debuffer de los creeps) ----------
   El Enyetar de los personajes (js/38), para creeps: después de que un personaje tira, el creep le echa el mal de ojo (su PdG.Esp contra la Res.Esp
   del personaje, a su Rango y a la vista); si gana, esa tirada se repite y queda la peor, y el duelo se vuelve a resolver (el efecto «Mal de ojo»,
   js/13 → enyetarAplicar). Es Flash (dueño: «mal de ojo tiene que tener flash»): en turno ajeno cuesta el doble (el SP en modo SP; el cooldown en
   modo cooldown). El GM ve el botón fijo 🧿 (Flotantes.malDeOjo) mientras algún creep del mapa la tenga lista: arriba, donde están la moneda y los
   demás, y al costado del cuadro del duelo cuando está abierto (comun/flotantes.js los muda solos). */
// Los creeps del mapa con Mal de ojo: [{id (token), t, sc, h, motivo}] (`motivo` = por qué no se puede usar ahora: cooldown, sin SP…).
function malDeOjoCreeps(){
  if(!soyGM || modoMapa !== 'combate') return [];
  const out = [];
  for(const [id, t] of tokens.entries()){
    if(t.tipo !== 'creep') continue;
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc || num(sc.hp) <= 0) continue;
    const h = (sc.habilidades || []).find(x => x && x.malDeOjo);
    if(!h) continue;
    let motivo = '';
    try{ motivo = CreepCalculo.bloqueoHab(sc, h) || ''; }catch(e){}
    out.push({id, t, sc, h, motivo});
  }
  return out;
}
function renderMalDeOjoBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.malDeOjo) return;
  const l = malDeOjoCreeps().filter(x => !x.motivo);
  if(!l.length){ Flotantes.malDeOjo(null); return; }
  Flotantes.malDeOjo({mostrar: true, sub: l.length === 1 ? `${nombreDe(l[0].t)}: que un personaje repita una tirada y se quede con la peor` : `${l.length} creeps pueden echarlo`,
    alClic: () => abrirMalDeOjo()});
}
setInterval(() => { try{ renderMalDeOjoBoton(); }catch(e){} }, 1500);

// Lo que cuesta ahora: el de la habilidad, el doble en turno ajeno (la regla del Flash).
function malDeOjoCosto(c){
  const ajeno = esSuTurno(c.id) === false;
  const sp = CreepCalculo.modoSP(c.sc) ? CreepCalculo.costoSpHab(c.sc, c.h) : 0, cd = num(c.h.cd);
  return {ajeno, sp: sp * (ajeno ? 2 : 1), cd: cd * (ajeno ? 2 : 1), txt: CreepCalculo.modoSP(c.sc) ? `${fmt(sp * (ajeno ? 2 : 1))} SP` : `cooldown ${fmt(cd * (ajeno ? 2 : 1))}`};
}
async function abrirMalDeOjo(){
  const listos = malDeOjoCreeps().filter(x => !x.motivo), opciones = [];
  for(const c of listos){
    let lista = [];
    try{ lista = await enyetarCandidatos(c.t); }catch(err){ console.error('Mal de ojo: no se pudieron ver los duelos', err); }
    lista.forEach(o => opciones.push({c, o}));
  }
  if(!opciones.length){
    AvisoCombate.mostrar({icono: '🧿', titulo: 'Mal de ojo', texto: 'No hay ninguna tirada reciente de un personaje que un creep con Mal de ojo tenga a su alcance y a la vista.'});
    return;
  }
  const botones = opciones.slice(0, 8).map(({c, o}) => { const k = malDeOjoCosto(c); return {fila: true, texto: `${nombreDe(c.t)} → ${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra} · ${o.nombre} la vuelve a tirar y se queda con la peor · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`,
    alClic: () => { AvisoCombate.cerrar(); malDeOjoUsar(c, o); }}; });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🧿', titulo: 'Mal de ojo', botones, texto: '¿A qué tirada de un personaje le echa el mal de ojo?'});
}
/* 🧿 El mal de ojo, paso a paso (dueño, 2026-10-28: «el jugador tira PdG como parte de su duelo; el rival tira "mal de ojo"; selecciona la tirada a ser afectada;
   al jugador le aparece una notificación: "fulano te tiró mal de ojo: volvé a tirar PdG y quedate con el peor resultado", botón "tirar PdG"; si fuera
   posible, que durante la animación del dado de la segunda tirada esté en la mesa el dado anterior con su tirada original, y cuando se resuelva, una
   animación sobre el dado más bajo mostrando que está maldito»). Antes armaba un duelo aparte (PdG.Esp contra Res.Esp) y el programa repetía la tirada
   solo, buscando «la más reciente»: confuso. Ahora: el GM elige la tirada, se cobra el costo (el doble en turno ajeno, Flash) y se abre el momento
   `mal-de-ojo` para quien maneja al personaje (su dueño o quien tiene 🎮 el control). Su pantalla le muestra el Anuncio con su tirada de antes y
   «🎲 Tirar …»; al tocarlo, Duelo.enyetarTirada repite esa tirada y se queda con la peor (el duelo se vuelve a resolver), y en la Mesa ruedan los dos
   juegos (el de antes cae en su número) con el más bajo marcado «maldito» (publicarRepeticion, js/38). El GM puede tirar por él desde la Crónica.
   Sin la contienda de antes (P230: a confirmar). */
async function malDeOjoUsar(c, o){
  const k = malDeOjoCosto(c), fichaId = String(c.t.fichaId), nomC = nombreDe(c.t);
  let error = '';
  try{
    await modificarCreep(fichaId, s => {
      const hh = (s.habilidades || []).find(x => x && x.id === c.h.id);
      if(!hh){ error = 'ya no tiene Mal de ojo'; return {}; }
      const bloq = CreepCalculo.bloqueoHab(s, hh);
      if(bloq){ error = bloq; return {}; }
      if(CreepCalculo.modoSP(s)) s.sp = Math.max(0, num(CreepCalculo.spActual ? CreepCalculo.spActual(s) : s.sp) - k.sp);
      else hh.cdActual = Math.max(num(hh.cdActual), k.cd);
      return {};
    });
  }catch(err){ console.error('Mal de ojo: no se pudo cobrar', err); error = 'no se pudo cobrar'; }
  if(error){ toast(`🧿 ${nomC}: ${error}`); return; }
  // Quién la vuelve a tirar: el dueño del personaje, o quien tiene 🎮 su control.
  const fichaPj = String(o.ref || '').split(SEP_INVOCACION)[0], f = fichasPub.get(fichaPj);
  const uid = (f && f.resumen && f.resumen.control) || (f && f.duenoUid) || '';
  const etq = o.etq || 'tirada';
  mesaLinea(`🧿 ${nomC} le echa el mal de ojo a ${o.nombre}: repite su ${etq} y se queda con la peor${k.ajeno ? ` (Flash en turno ajeno: ${k.txt})` : ''}`, 'recordatorio');
  try{
    await momentoAbrir({tipo: 'mal-de-ojo', icono: '🧿', titulo: `${nomC} le echa el mal de ojo a ${o.nombre}: vuelve a tirar su ${etq}`, estado: 'esperando',
      datos: {paraUid: uid, dueloId: o.dueloId, lado: o.lado, etq, total: num(o.total), rolls: (o.rolls || []).slice(0, 20), creep: nomC, objetivo: o.nombre, contra: o.contra}});
  }catch(err){ console.error('Mal de ojo: no se pudo avisar', err); toast('🧿 No se pudo avisar al jugador: que repita la tirada a mano y se quede con la peor'); }
}
/* ---------- Quien la vuelve a tirar ---------- */
const malDeOjoVistos = new Set(), malDeOjoTirandoAca = new Set();
function malDeOjoMomento(id, d){
  const dt = d.datos || {};
  if(d.estado !== 'esperando'){
    if(!malDeOjoTirandoAca.has(id) && AvisoCombate.abiertoClave && AvisoCombate.abiertoClave() === 'mal-de-ojo:' + id) AvisoCombate.cerrar();   // la tiró otra pantalla
    return;
  }
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!fbUsuario || dt.paraUid !== fbUsuario.uid || malDeOjoVistos.has(id) || Date.now() - ms > 15 * 60 * 1000) return;
  malDeOjoVistos.add(id);
  const dados = (dt.rolls || []).map(r => `<span style="display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;margin:0 3px;border-radius:7px;background:#e9ecf4;color:#141a26;font-weight:900">${esc(String(r))}</span>`).join('');
  AvisoCombate.mostrar({clave: 'mal-de-ojo:' + id, icono: '🧿', titulo: `${dt.creep} te tiró mal de ojo`, soloBoton: true,
    pasos: [`Volvé a tirar tu ${dt.etq} y quedate con el peor resultado.`, `Tu ${dt.etq} de antes: ${fmt(num(dt.total))} (en el duelo contra ${dt.contra || 'el otro'})`],
    veredicto: {tono: 'malo', grande: `🧿 ${fmt(num(dt.total))}`, chico: 'tu tirada de antes'},
    botones: [{texto: `🎲 Tirar ${dt.etq}`, id: 'mal-de-ojo-tirar', alClic: () => { const b = document.getElementById('mal-de-ojo-tirar'); if(b) b.disabled = true; malDeOjoTirar(id, d); }}]});
}
async function malDeOjoTirar(id, d, porGM){
  const dt = d.datos || {}, ref = fbDb.collection(fbRutaCampana('momentos')).doc(id);
  let tomo = false;
  malDeOjoTirandoAca.add(id);
  try{ await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(x.exists && x.data().estado === 'esperando'){ tx.update(ref, {estado: 'tirando'}); tomo = true; } }); }
  catch(err){ console.error('Mal de ojo: no se pudo tomar la tirada', err); }
  if(!tomo){ toast('Esa tirada ya se hizo'); AvisoCombate.cerrar(); return; }
  let r = null;
  try{ r = await Duelo.enyetarTirada(dt.dueloId, dt.lado); }catch(err){ console.error('Mal de ojo: no se pudo repetir la tirada', err); }
  if(!r){
    await momentoActualizar(id, {estado: 'listo', resultado: `✋ La tirada ya no se podía cambiar: que ${dt.objetivo} la repita a mano y se quede con la peor.`});
    AvisoCombate.mostrar({clave: 'mal-de-ojo:' + id, icono: '🧿', titulo: `${dt.creep} te tiró mal de ojo`, texto: 'Esa tirada ya no se puede cambiar (el duelo siguió). Resolvelo a mano con el GM.',
      botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
    return;
  }
  await publicarRepeticion(dt.objetivo, {...r, etq: dt.etq}, 'peor', porGM ? 'gm' : 'mapa', `🧿 ${dt.objetivo} · mal de ojo de ${dt.creep}: repite su ${dt.etq}`);
  const resultado = `${dt.objetivo} repite su ${dt.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}`;
  await momentoActualizar(id, {estado: 'listo', resultado});
  // El veredicto, cuando los dados quedan quietos.
  const mostrar = () => AvisoCombate.mostrar({clave: 'mal-de-ojo:' + id, icono: '🧿', titulo: `${dt.creep} te tiró mal de ojo`,
    texto: `Tu ${dt.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)}. Te quedás con la peor. El duelo se vuelve a resolver.`,
    veredicto: {tono: 'malo', grande: `🧿 Queda ${fmt(r.ahora)}`, chico: r.nuevaQueda ? 'la nueva salió más baja: la maldita' : 'la de antes era más baja: queda esa'},
    botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
  if(Duelo.esperarDados) Duelo.esperarDados(mostrar); else setTimeout(mostrar, 2500);
}
