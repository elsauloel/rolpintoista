/* ---------- ↻ Darse vuelta (2026-10-15, regla del dueño) ----------
   «En el caso de que un enemigo se acerque por la espalda sin pasos silenciosos, al aparecer en el campo a distancia hex 3, el personaje debe tener
   la opción de darse vuelta para no darle la espalda, sin costo de nitros. Esta posibilidad sin embargo se anula si está enfrentando a otro rival,
   por lo que se lo considera flanqueado.»
   - Cada pantalla mira los personajes (y sus invocaciones) que maneja (bnManejo): si un rival entra en su cuña ciega a OIDO_RADIO casilleros o
     menos (lo oye: sin pared en el medio, sin sigilo, sin pasos silenciosos), le pregunta si se da vuelta; sí → gira hacia él, gratis.
   - Solo en modo combate, y solo cuando se acerca el otro: si el propio se movió o giró, no se pregunta (lo hizo él).
   - Flanqueado: si ya tiene otro rival pegado y a la vista (fuera de su cuña ciega), no hay oferta; solo el aviso.
   - Quien camina con pasos silenciosos se ve recién pegado (js/02) y no da esta oportunidad.
   Los creeps también (dueño, 2026-10-30, P201): la pantalla del GM pregunta por los suyos (visibles) cuando un personaje se les acerca por atrás. */
const VUELTA_REVISAR_MS = 700;
const vueltaPrevios = new Map();   // id del token propio → {pos: 'col,fila,rot', rivales: Set de ids}
let vueltaAbierta = false;

// Los tokens que esta pantalla maneja y que pueden darse vuelta.
function vueltaMios(){
  if(typeof bnManejo !== 'function') return [];
  return [...tokens.entries()].filter(([id, t]) => t.fichaId && !t.oculto && !t.bajoTierra && !iniciativaFueraDeJuego(id)
    && (t.tipo === 'pj' ? bnManejo(String(t.fichaId).split(SEP_INVOCACION)[0]) : t.tipo === 'creep' && soyGM));
}
// Un rival que se ve o se oye (no oculto, no en sigilo, no bajo tierra, en juego).
function vueltaRivalPresente(id, r){
  return !!r && !r.oculto && !r.bajoTierra && !enSigilo(r) && !iniciativaFueraDeJuego(id);
}
// Los rivales que oye por la espalda: en su cuña ciega, a OIDO_RADIO o menos, sin pared en el medio y sin pasos silenciosos.
function vueltaOidos(t){
  const solidos = solidosSet(), paredes = hayParedes(), res = new Set();
  tokens.forEach((r, rid) => {
    if(!dueloEsRival(t, r) || !vueltaRivalPresente(rid, r) || pasosSilenciosos(r)) return;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: r.col, fila: r.fila}) > OIDO_RADIO || !enCunaCiega(r, t)) return;
    if((solidos.size || paredes) && !lineaLibre({col: t.col, fila: t.fila}, {col: r.col, fila: r.fila}, solidos, !paredes)) return;
    res.add(rid);
  });
  return res;
}
// ¿Está enfrentando a otro rival? (uno pegado y a la vista, fuera de su cuña ciega) → el que lo enfrenta, o null.
function vueltaFlanco(t, exceptoId){
  for(const [rid, r] of tokens){
    if(rid === exceptoId || !dueloEsRival(t, r) || !vueltaRivalPresente(rid, r)) continue;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: r.col, fila: r.fila}) === 1 && !enCunaCiega(r, t)) return r;
  }
  return null;
}
function vueltaRevisar(){
  if(modoMapa !== 'combate'){ vueltaPrevios.clear(); return; }
  if(vueltaAbierta || !fbUsuario) return;
  let oferta = null;
  vueltaMios().forEach(([id, t]) => {
    const pos = `${t.col},${t.fila},${Math.round(num(t.rotacion))}`;
    const ahora = vueltaOidos(t), prev = vueltaPrevios.get(id);
    vueltaPrevios.set(id, {pos, rivales: ahora});
    if(oferta || !prev || prev.pos !== pos) return;   // la primera vez, o se movió / giró él mismo
    const nuevos = [...ahora].filter(r => !prev.rivales.has(r));
    if(!nuevos.length) return;
    const dist = rid => { const r = tokens.get(rid); return distanciaHex({col: t.col, fila: t.fila}, {col: r.col, fila: r.fila}); };
    oferta = {id, rid: nuevos.sort((a, b) => dist(a) - dist(b))[0]};
  });
  if(oferta) vueltaOfrecer(oferta.id, oferta.rid);
}
// ¿La Crónica lo puede contar? Un personaje, siempre; un creep, solo si los jugadores lo ven (no delata a uno escondido o en sigilo).
const vueltaPublico = t => t.tipo !== 'creep' || (!enSigilo(t) && (typeof visibleParaJugadores !== 'function' || visibleParaJugadores(t)));
async function vueltaOfrecer(id, rid){
  const t = tokens.get(id), r = tokens.get(rid);
  if(!t || !r) return;
  vueltaAbierta = true;
  try{
    const flanco = vueltaFlanco(t, rid);
    if(flanco){
      AvisoCombate.mostrar({icono: '👂', titulo: 'Pasos a tu espalda',
        texto: `${nombreDe(t)} oye a ${nombreDe(r)} acercarse por la espalda, pero está enfrentando a ${nombreDe(flanco)}: no puede darse vuelta.`,
        veredicto: {tono: 'malo', grande: '¡Flanqueado!', chico: `${nombreDe(r)} le queda por la espalda`}});
      if(vueltaPublico(t)) momentoAbrir({tipo: 'flanqueado', icono: '👂', titulo: `${nombreDe(t)} está flanqueado: ${nombreDe(r)} le llega por la espalda`});
      return;
    }
    const si = await Confirmar.preguntar(`${nombreDe(t)} oye pasos: ${nombreDe(r)} se acerca por la espalda. ¿Se da vuelta para no darle la espalda? (no cuesta No2)`,
      {titulo: 'Pasos a tu espalda', icono: '👂', si: '↻ Darse vuelta', no: 'Seguir así'});
    const t2 = tokens.get(id), r2 = tokens.get(rid);
    if(!si || !t2 || !r2) return;
    const rot = rotacionDePaso(hexCentro(t2.col, t2.fila), hexCentro(r2.col, r2.fila));
    await editarToken(id, {rotacion: rot});
    vueltaPrevios.set(id, {pos: `${t2.col},${t2.fila},${rot}`, rivales: vueltaOidos({...t2, rotacion: rot})});
    if(vueltaPublico(t2)) momentoAbrir({tipo: 'darse-vuelta', icono: '↻', titulo: `${nombreDe(t2)} oyó a ${nombreDe(r2)} y se dio vuelta`});
  }catch(err){ console.error('No se pudo ofrecer darse vuelta:', err); }
  finally{ vueltaAbierta = false; }
}
setInterval(vueltaRevisar, VUELTA_REVISAR_MS);
