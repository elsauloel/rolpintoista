/* =========================================================
   🐈‍⬛ ENYETAR (Debuffer, 2026-10-12, decisiones del dueño)
   «Obliga a repetir una tirada y quedarse con el valor más bajo»: después de que un enemigo tira, lo maldecís (tu PdG.Esp contra su
   Res.Esp) y, si ganás, esa tirada se repite y queda la más baja; el duelo se vuelve a resolver. 5 SP, Flash (10 en turno ajeno), sin No2,
   a un enemigo a la vista dentro de tu Rango, una vez por tirada.
   En combate, quien la tiene ve un botón fijo 🐈‍⬛ (Flotantes.enyetar, arriba como el 💪 de Empower): elegís la tirada de un enemigo en un
   duelo reciente (Duelo.tiradaSumable: la misma que la Polilla) y se ejecuta la habilidad contra él, sin tener que marcarlo en el mapa
   (bn.objetivoFijo → dueloElegirObjetivoMapa). Si gana la maldición, el mapa del GM repite esa tirada (js/13, efecto «Enyetar» →
   Duelo.enyetarTirada).
   😈 Parte A de P363 (2026-11-27, dueño): al elegir la tirada, ESE duelo queda en pausa («X le está echando la yeta a Y…», `ataque.yeta`,
   Duelo.yetaPausar) hasta que se resuelve la maldición: si gana, se repite exactamente la tirada elegida y el duelo sigue desde ahí; si pierde, se
   cancela o no llega a echarse, sigue como estaba (lo levanta la pantalla del GM, Duelo.yetaSeguir). El GM y quien la echó tienen «▶ Seguir sin la
   yeta». La lista suma las tiradas de habilidades. Desde A2/A3 (2026-11-27) todo lo de la fila del duelo pone la misma pausa (js/137) y la
   maldición se tira adentro del cuadro del duelo en pausa (comun/duelo.js, `yetaSubHtml`).
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

// Las tiradas de los enemigos a tu alcance que todavía se pueden cambiar (2026-11-27, P363 A): una por lado de cada duelo reciente, también las de
// habilidades (la tirada de un Rayo mágico, la resistencia de un objetivo). Lo puro en Duelo.tiradasEnyetables (comun/duelo.js). Lo usa también el
// 🧿 Mal de ojo (js/60). `o.incluirCerrados` (parte B, 2026-11-27): suma las tiradas del último duelo terminado, «🔒» (js/138 confirma y deshace).
async function enyetarCandidatos(yo, o){
  const rng = num((rangoDeToken(yo) || {}).rng);
  const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(15).get();
  const duelos = q.docs.map(doc => ({id: doc.id, ...doc.data()}));
  return Duelo.tiradasEnyetables(duelos, {
    reciente: enyetarReciente,
    esRival: id => { const t = tokens.get(id); return !!(t && dueloEsRival(yo, t)); },
    alcanza: id => { const t = tokens.get(id); return !!t && distanciaHex(yo, t) <= rng && !(typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(t)); },
    nombreDe: id => { const t = tokens.get(id); return t ? nombreDe(t) : ''; },
    incluirCerrados: !!(o && o.incluirCerrados), todas: !!(o && o.todas),   // 😈 Enyetar C (2026-11-27): todas las tiradas de ese enemigo (el daño, los d20 del crítico…)
  });
}
async function abrirEnyetar(tokenId){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  const nomYo = nombreDe(yo);
  let lista = [];
  try{ lista = await enyetarCandidatos(yo, {incluirCerrados: true, todas: true}); }catch(err){ console.error('Enyetar: no se pudieron ver los duelos', err); }
  if(!lista.length){
    AvisoCombate.mostrar({icono: '🐈‍⬛', titulo: `Enyetar · ${nomYo}`, texto: `No hay ninguna tirada reciente de un enemigo a tu alcance (Rango ${fmt(num((rangoDeToken(yo) || {}).rng))}) que se pueda enyetar.`});
    return;
  }
  const botones = lista.slice(0, 10).map(o => ({fila: true, texto: `${o.cerrado ? '↩ ' : ''}${o.etq} de ${o.nombre} (${fmt(o.total)})`,
    detalle: o.cerrado ? `🔒 el último duelo que terminó (${o.hab ? `${o.hab}, ` : ''}contra ${o.contra}): si la maldición gana, se deshace lo que dejó y se vuelve a resolver · antes te muestro qué se deshace · 5 SP (turno ajeno 10)`
      : `${o.hab ? `en ${o.hab}, ` : 'en el duelo '}contra ${o.contra}${o.terminado ? ' (ya terminó, pero esa tirada todavía se puede cambiar)' : ''} · el duelo espera mientras tirás PdG.Esp contra su Res.Esp; si ganás, repite esa tirada y queda la peor · 5 SP (turno ajeno 10)`,
    alClic: () => { AvisoCombate.cerrar(); if(o.cerrado) enyetarConfirmarDeshacer(tokenId, o); else enyetarElegir(tokenId, o); }}));
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🐈‍⬛', titulo: `Enyetar · ${nomYo}`, botones, texto: '¿A qué tirada de un enemigo le echás la yeta?'});
}
// 😈 Elegida la tirada: ese duelo queda en pausa («X le está echando la yeta a Y…») y recién ahí se ejecuta la habilidad (P363 A).
async function enyetarElegir(tokenId, o){
  const yo = tokens.get(tokenId);
  if(!yo) return;
  let ok = false;
  try{ ok = await Duelo.yetaPausar(o.dueloId, {lado: o.lado, campo: o.campo, por: tokenId, porNombre: nombreDe(yo), a: o.tokenId, aNombre: o.nombre, ...(o.deshacer ? {deshacer: o.deshacer} : {})}); }
  catch(err){ console.error('Enyetar: no se pudo poner en pausa el duelo', err); }
  if(!ok){ toast(`🐈‍⬛ Esa tirada de ${o.nombre} ya no se puede enyetar (el duelo siguió, o ya tiene una yeta encima)`); return false; }
  try{ if(Duelo.abiertoId() !== o.dueloId) Duelo.abrir(o.dueloId); }catch(err){}   // 😈 la maldición se tira adentro de ESE cuadro (A3)
  const usada = await enyetarUsar(yo, o.tokenId);
  if(!usada) try{ await Duelo.yetaSeguir(o.dueloId, 'no se pudo echar la maldición'); }catch(err){ console.error(err); }
  return usada;
}
// Ejecuta la habilidad (cobra el SP con su pregunta de Flash) contra ese enemigo, sin tener que marcarlo en el mapa. → false si no se pudo ni empezar.
async function enyetarUsar(yo, objetivoId){
  abrirBotonera(yo.fichaId);
  for(let i = 0; i < 40 && !(bn && bn.fichaId === yo.fichaId && bn.S && bn.sesion && bn.sesion.cargada); i++) await new Promise(r => setTimeout(r, 150));
  if(!(bn && bn.S)){ toast('Enyetar: no se pudo abrir el personaje'); return false; }
  const it = (bn.S.habilidades || []).find(h => h && h.enyetar);
  if(!it){ toast(`${nombreDe(yo)} no tiene Enyetar`); return false; }
  bn.objetivoFijo = objetivoId;
  FichaAcciones.ejecutarHabilidad(bn.S, it.id, undefined, false, bnHabUi());
  return true;
}

/* La tirada repetida en la Mesa (2026-10-12, dueño: «cuando se tiran los dos dados, el seleccionado tiene que tener una animación»): ruedan los dos
   juegos (el de antes y el nuevo) y el que queda se destaca — Enyetar con la animación de mala vibra (destacar 'malo:idx:…', comun/dados3d.js),
   Afortunado (js/39) con el brillo dorado de siempre. Si los dados de antes no se pueden reconstruir, rueda solo el nuevo. */
async function publicarRepeticion(nom, r, modo, desde, titulo){
  const malo = modo === 'peor', antes = Array.isArray(r.rollsAntes) ? r.rollsAntes : [], n = (r.rolls || []).length;
  const juntos = n > 0 && antes.length === n;
  const queda = juntos ? (r.nuevaQueda ? [...Array(n).keys()].map(i => i + n) : [...Array(n).keys()]) : (r.nuevaQueda ? [...Array(n).keys()] : []);
  const que = malo ? 'se queda con la peor (Enyetar)' : 'se queda con la mejor (Golpe de suerte)';
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: nom,
      origen: (titulo ? `${titulo}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)} (la peor)` : `${malo ? '🐈‍⬛' : '🧚'} ${nom} · repite su ${r.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)} (${que})`).slice(0, 160),
      formula: juntos ? `${r.dados}+${r.dados}` : (r.dados || '0'), rolls: juntos ? [...antes, ...r.rolls] : (r.rolls || []), mod: 0, total: r.ahora,
      ...(queda.length && queda.length <= 20 ? {destacar: (malo ? 'malo:' : '') + 'idx:' + queda.join(',')} : {}),
      desde, cuando: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error('No se pudo publicar la tirada repetida', err); }
}
// El efecto «Enyetar» (lo aplica el mapa del GM, js/13). Desde el 2026-11-27 (P363 A) va EXACTAMENTE a la tirada que se eligió en la lista: la del duelo
// que quedó en pausa por esta maldición (`ataque.yeta` de quien la echó sobre ese enemigo). Antes buscaba «la más reciente de ese enemigo» y podía
// tomar otra. La repetición saca la pausa en la misma transacción; si ya no se puede (alguien la cambió con otra cosa), el duelo sigue y queda ✋ a mano.
async function enyetarAplicar(d, t){
  const nom = nombreDe(t);
  try{
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(25).get();
    const doc = q.docs.find(x => {
      const y = x.id !== d.id && x.data().ataque && x.data().ataque.yeta;
      return y && Duelo.yetaTipo(x.data()) === 'enyetar' && String(y.por) === String(d.atacante.tokenId) && String(y.a) === String(d.defensor.tokenId);
    });
    if(doc){
      const x = {id: doc.id, ...doc.data()}, y = x.ataque.yeta;
      // ↩ Parte B: sobre el último duelo terminado, primero se deshace lo que dejó (js/138) y después se vuelve a esa tirada.
      const r = y.deshacer ? await deshacerYReabrir(doc.id, x, y, d.id) : await Duelo.enyetarTirada(doc.id, y.lado, 'peor', {campo: y.campo, yeta: true, hijo: d.id});   // (hijo: la maldición, que se vio adentro de este duelo, A3)
      if(!r){
        await Duelo.yetaSeguir(doc.id, 'la tirada ya no se podía cambiar');
        return {manual: true, nota: `${nom}: esa tirada ya no se podía cambiar: ✋ que la repita y se quede con la peor, a mano`};
      }
      const otro = (y.lado === 'atacante' ? x.defensor : x.atacante) || {};
      await publicarRepeticion(nom, r, 'peor', t.tipo === 'creep' ? 'gm' : 'mapa');
      return {nota: `${nom} repite su ${r.etq}: ${fmt(r.antes)} y ${fmt(r.nueva)} → queda ${fmt(r.ahora)}${r.contra !== null ? ` contra ${fmt(r.contra)}` : ''}; el duelo contra ${otro.nombre || 'el otro'} sigue desde ahí`};
    }
  }catch(err){ console.error('Enyetar: no se pudo ver el duelo', err); }
  return {manual: true, nota: `${nom}: no se encontró la tirada elegida (el duelo ya no estaba en pausa): ✋ que la repita y se quede con la peor, a mano`};
}
