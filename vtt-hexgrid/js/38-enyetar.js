/* =========================================================
   🐈‍⬛ ENYETAR (Debuffer, 2026-10-12, decisiones del dueño)
   «Obliga a repetir una tirada y quedarse con el valor más bajo»: después de que un enemigo tira, lo maldecís (tu PdG.Esp contra su
   Res.Esp) y, si ganás, esa tirada se repite y queda la más baja; el duelo se vuelve a resolver. 5 SP, Flash (10 en turno ajeno), sin No2,
   a un enemigo a la vista dentro de tu Rango, una vez por tirada.
   En combate, quien la tiene ve un botón fijo 🐈‍⬛ (Flotantes.enyetar, arriba como el 💪 de Empower): elegís la tirada de un enemigo en un
   duelo reciente (Duelo.tiradaSumable: la misma que la Polilla) y se ejecuta la habilidad contra él, sin tener que marcarlo en el mapa
   (bn.objetivoFijo → dueloElegirObjetivoMapa). Si gana la maldición, el mapa del GM repite esa tirada (js/13, efecto «Enyetar» →
   Duelo.enyetarTirada): toma la tirada más reciente de ese enemigo que todavía se pueda cambiar.
   ========================================================= */
const ENYETAR_MS = 10 * 60 * 1000;
const enyetarReciente = ts => !!(ts && ts.toMillis && Date.now() - ts.toMillis() < ENYETAR_MS);

function enyetarToken(){
  if(modoMapa !== 'combate' || !fbUsuario) return null;
  const ok = t => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && puedoMover(t)
    && !!(((fichasPub.get(t.fichaId) || {}).resumen || {}).enyetar);
  const sel = seleccion ? tokens.get(seleccion) : null;
  if(ok(sel)) return sel;
  for(const t of tokens.values()) if(ok(t)) return t;
  return null;
}
function renderEnyetarBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.enyetar) return;
  const t = enyetarToken();
  if(!t){ Flotantes.enyetar(null); return; }
  const id = idDeToken(t);
  Flotantes.enyetar({mostrar: true, sub: `${nombreDe(t)}: que un enemigo repita una tirada y se quede con la peor`, alClic: () => abrirEnyetar(id)});
}
setInterval(() => { try{ renderEnyetarBoton(); }catch(e){} }, 1500);

// La tirada más reciente de cada enemigo a tu alcance que todavía se pueda cambiar (una por enemigo: la que tomaría la maldición).
async function enyetarCandidatos(yo){
  const rng = num((rangoDeToken(yo) || {}).rng), vistos = new Set(), lista = [];
  const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(10).get();
  q.docs.forEach(doc => {
    const x = doc.data();
    if(!x || x.estado === 'cancelado' || x.hab || !enyetarReciente(x.creado)) return;
    ['atacante', 'defensor'].forEach(lado => {
      const p = x[lado], t = p && tokens.get(p.tokenId);
      if(!t || vistos.has(p.tokenId) || !dueloEsRival(yo, t) || distanciaHex(yo, t) > rng) return;
      if(typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(t)) return;
      vistos.add(p.tokenId);
      const s = Duelo.tiradaSumable(x, lado);
      if(!s || s.enyetada) return;
      const otro = x[lado === 'atacante' ? 'defensor' : 'atacante'] || {};
      lista.push({tokenId: p.tokenId, nombre: p.nombre || nombreDe(t), etq: s.etq, total: s.total, contra: otro.nombre || 'el otro'});
    });
  });
  return lista;
}
async function abrirEnyetar(tokenId){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  const nomYo = nombreDe(yo);
  let lista = [];
  try{ lista = await enyetarCandidatos(yo); }catch(err){ console.error('Enyetar: no se pudieron ver los duelos', err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: '🐈‍⬛', titulo: `Enyetar · ${nomYo}`, texto: `No hay ninguna tirada reciente de un enemigo a tu alcance (Rango ${fmt(num((rangoDeToken(yo) || {}).rng))}) que se pueda enyetar.`});
    return;
  }
  const botones = lista.slice(0, 8).map(o => ({fila: true, texto: `${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra} · tirás PdG.Esp contra su Res.Esp; si ganás, repite y queda la peor · 5 SP (turno ajeno 10)`,
    alClic: () => { AvisoCombate.cerrar(); enyetarUsar(yo, o.tokenId); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🐈‍⬛', titulo: `Enyetar · ${nomYo}`, botones, texto: '¿A qué tirada de un enemigo le echás la yeta?'});
}
// Ejecuta la habilidad (cobra el SP con su pregunta de Flash) contra ese enemigo, sin tener que marcarlo en el mapa.
async function enyetarUsar(yo, objetivoId){
  abrirBotonera(yo.fichaId);
  for(let i = 0; i < 40 && !(bn && bn.fichaId === yo.fichaId && bn.S && bn.sesion && bn.sesion.cargada); i++) await new Promise(r => setTimeout(r, 150));
  if(!(bn && bn.S)){ toast('Enyetar: no se pudo abrir el personaje'); return; }
  const it = (bn.S.habilidades || []).find(h => h && h.enyetar);
  if(!it){ toast(`${nombreDe(yo)} no tiene Enyetar`); return; }
  bn.objetivoFijo = objetivoId;
  FichaAcciones.ejecutarHabilidad(bn.S, it.id, undefined, false, bnHabUi());
}

/* La tirada repetida en la Mesa (2026-10-12, dueño: «cuando se tiran los dos dados, el seleccionado tiene que tener una animación»): ruedan los dos
   juegos (el de antes y el nuevo) y el que queda se destaca — Enyetar con la animación de mala vibra (destacar 'malo:idx:…', comun/dados3d.js),
   Afortunado (js/39) con el brillo dorado de siempre. Si los dados de antes no se pueden reconstruir, rueda solo el nuevo. */
async function publicarRepeticion(nom, r, modo, desde){
  const malo = modo === 'peor', antes = Array.isArray(r.rollsAntes) ? r.rollsAntes : [], n = (r.rolls || []).length;
  const juntos = n > 0 && antes.length === n;
  const queda = juntos ? (r.nuevaQueda ? [...Array(n).keys()].map(i => i + n) : [...Array(n).keys()]) : (r.nuevaQueda ? [...Array(n).keys()] : []);
  const que = malo ? 'se queda con la peor (Enyetar)' : 'se queda con la mejor (Re-roll)';
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nom,
      origen: `${malo ? '🐈‍⬛' : '🧚'} ${nom} · repite su ${r.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)} (${que})`.slice(0, 160),
      formula: juntos ? `${r.dados}+${r.dados}` : (r.dados || '0'), rolls: juntos ? [...antes, ...r.rolls] : (r.rolls || []), mod: 0, total: r.ahora,
      ...(queda.length && queda.length <= 20 ? {destacar: (malo ? 'malo:' : '') + 'idx:' + queda.join(',')} : {}),
      desde, cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('No se pudo publicar la tirada repetida', err); }
}
// El efecto «Enyetar» (lo aplica el mapa del GM, js/13): la tirada más reciente de ese enemigo que se pueda cambiar se repite y queda la peor.
async function enyetarAplicar(d, t){
  const nom = nombreDe(t);
  try{
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(10).get();
    for(const doc of q.docs){
      if(doc.id === d.id) continue;
      const x = doc.data();
      if(!x || x.estado === 'cancelado' || x.hab || !enyetarReciente(x.creado)) continue;
      const lado = x.atacante && x.atacante.tokenId === d.defensor.tokenId ? 'atacante' : x.defensor && x.defensor.tokenId === d.defensor.tokenId ? 'defensor' : '';
      if(!lado) continue;
      const s = Duelo.tiradaSumable(x, lado);
      if(!s || s.enyetada) continue;
      const r = await Duelo.enyetarTirada(doc.id, lado);
      if(!r) continue;
      const otro = (lado === 'atacante' ? x.defensor : x.atacante) || {};
      await publicarRepeticion(nom, r, 'peor', t.tipo === 'creep' ? 'gm' : 'mapa');
      return {nota: `${nom} repite su ${r.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}; el duelo contra ${otro.nombre || 'el otro'} se volvió a resolver`};
    }
  }catch(err){ console.error('Enyetar: no se pudo ver el duelo', err); }
  return {manual: true, nota: `${nom} no tiene una tirada reciente que se pueda cambiar: ✋ que repita su última tirada y se quede con la peor, a mano`};
}
