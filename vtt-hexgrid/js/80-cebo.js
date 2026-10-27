/* 💎 El Cebo (Hunter, dueño, 2026-10-27: «el cazador pone como cebo algo semienterrado que parece de muchísimo valor, con un brillo misterioso que llama
   la atención»; «flor de diámetro 9»; «que el cebo esté tendido durante 3 turnos, igual tiene una tirada de resistencia mental»; «cualquier persona que se
   pare en un hexágono adyacente descubre que es una roca pintada… la levanta y abajo tiene pintado puto el que lee»; «el primer rival que llega y da vuelta
   a la piedra, desaparece la piedra»).
   No es una trampa: se ve. Es un elemento chico (una casilla, dorado) con `trampaNombre: 'Cebo'` y `trampaEstado` = {cebo: {de, dif, radio, mueve, quien}}
   (sin campos nuevos en Firestore), que dura `turnos` (se va solo, como las formas con turnos). Lo resuelve la pantalla del GM:
   · al colocarlo y al empezar el turno de cada rival (turnoDeToken, js/04): los rivales que lo ven, a `radio` casillas o menos, tiran Res.Mt contra la
     Destreza de quien lo puso (`dif`); el que pierde camina ya hasta `mueve` casillas hacia el cebo (gratis, sin oportunidad), y lo que pise en el camino
     lo toca (la primera trampa lo frena ahí; las zonas, el momento del arrastre: js/78);
   · el primer rival que queda pegado al cebo lo da vuelta: el Anuncio para todos y el cebo desaparece. */
const CEBO_COLOR = '#E8C547';
const ceboDe = el => { if(!el || el.trampa || !el.trampaEstado) return null; try{ const j = JSON.parse(el.trampaEstado); return j && j.cebo ? j.cebo : null; }catch(e){ return null; } };
const ceboRivalesDe = c => { const tipo = String(c.de || '').split('|')[1] || 'creep'; return x => x && x.fichaId && !x.oculto && (tipo === 'creep' ? x.tipo !== 'creep' : x.tipo === 'creep'); };
// o = {fichaId, nombre, dif, radio, turnos, mueve, alTerminar}: quien lo pone (un creep) elige la casilla, dentro de su Rango y a la vista.
function colocarCebo(o){
  const mio = [...tokens.values()].find(x => x.fichaId === o.fichaId && x.tipo === 'creep');
  if(!mio){ toast(`${o.nombre}: no tiene token en este mapa`); if(o.alTerminar) o.alTerminar(); return; }
  const rr = typeof rangoDeToken === 'function' ? rangoDeToken(mio) : null, rng = Math.max(1, Math.round(num(rr && rr.rng)) || 1);
  const pedir = () => elegirDestino(async h => {
    if(distanciaHex(mio, h) > rng){ toast(`⚠ Esa casilla queda a ${distanciaHex(mio, h)}: el cebo se pone dentro de su Rango (${rng})`); pedir(); return; }
    if(!celdasVisionDe(mio).includes(nbPack(h.col, h.fila))){ toast('⚠ Esa casilla no la ve: el cebo se pone en su campo de visión'); pedir(); return; }
    if(elementoSolidoEn(h.col, h.fila) || [...tokens.values()].some(x => x.col === h.col && x.fila === h.fila)){ toast('Esa casilla no está libre: elegí otra'); pedir(); return; }
    const n = Math.max(1, Math.round(num(o.turnos)) || 3);
    const cebo = {de: `${o.fichaId}|creep`, dif: Math.max(1, Math.round(num(o.dif)) || 1), radio: Math.max(1, Math.round(num(o.radio)) || 4), mueve: Math.max(1, Math.round(num(o.mueve)) || 3), quien: String(mio.nombre || o.nombre || '').slice(0, 40)};
    let id = null;
    try{
      const ref = await coleccionElementos().add({tipo: 'flor', origen: {col: h.col, fila: h.fila}, celdas: [0, 0], rotacion: 0, color: CEBO_COLOR, alfa: 55, solido: false, invisible: false,
        imagen: '', imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, trampaNombre: 'Cebo', trampaEstado: JSON.stringify({cebo}), turnos: n, venceMant: Math.round(num(mantenimientoNumero)) + n,
        duenoUid: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp()});
      id = ref.id;
    }catch(err){ console.error('No se pudo poner el cebo:', err); toast('No se pudo poner el cebo — ponelo a mano'); if(o.alTerminar) o.alTerminar(); return; }
    mesaLinea(`💎 Algo brilla, semienterrado, a unos pasos de ${nombreDe(mio)}…`, 'recordatorio');
    try{ await ceboAtraer(id, {...cebo, col: h.col, fila: h.fila}, null); }catch(err){ console.error('El cebo:', err); }
    if(o.alTerminar) o.alTerminar();
  }, `<b>💎 ${esc(o.nombre || 'Cebo')}: elegí dónde dejar el cebo</b> <span>dentro de su Rango (${rng}), en una casilla que vea · Esc o clic derecho cancelan</span>`, true, o.alTerminar || null);
  pedir();
}
// Los rivales que lo ven y están cerca tiran Res.Mt; al que pierde, el cebo lo atrae. `soloId`: solo ese token (el que empieza su turno).
async function ceboAtraer(elId, c, soloId){
  const centro = {col: c.col, fila: c.fila}, esRival = ceboRivalesDe(c);
  const lista = [...tokens.entries()].filter(([id, x]) => (!soloId || id === soloId) && esRival(x) && distanciaHex(x, centro) <= c.radio && distanciaHex(x, centro) > 1
    && !(estadoDe(x) || {}).muerto && celdasVisionDe(x).includes(nbPack(centro.col, centro.fila)));
  for(const [id, x] of lista){
    const quien = nombreDe(x), estados = x.tipo === 'creep' ? ((creepPrivadoDe(x.fichaId) || {}).estados || []) : (((fichasPub.get(String(x.fichaId).split(SEP_INVOCACION)[0]) || {}).resumen || {}).estados || []);
    if(estados.some(e => e && e.activo !== false && (e.inmunidadMental || e.inmuneCC))){ mesaLinea(`💎 ${quien} ni mira el brillo (inmune a lo mental)`, 'recordatorio'); continue; }
    const rd = Combatiente.tirarStat(trampaValorStat(x, 'resm'), estados, 'resm');
    if(!rd){ mesaLinea(`💎 ${quien}: ✋ tirá a mano Res.Mt contra ${c.dif} (si pierde, camina hasta ${c.mueve} casillas hacia el brillo)`, 'alerta-roja'); continue; }
    try{ await mesaPublicar(`${quien} · Res.Mt (el brillo del cebo)`, {...rd, quien, ...(x.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(x.fichaId).split(SEP_INVOCACION)[0]})}); }catch(err){}
    if(rd.total >= c.dif){ mesaLinea(`💎 ${quien}: Res.Mt ${rd.total} contra ${c.dif} → no se tienta`, 'recordatorio'); continue; }
    await ceboCaminar(id, x, centro, c, rd.total);
  }
}
async function ceboCaminar(id, x, centro, c, tiro){
  const quien = nombreDe(x);
  const ocupada = v => elementoSolidoEn(v.col, v.fila) || [...tokens.values()].some(y => y !== x && y.col === v.col && y.fila === v.fila && !y.bajoTierra) || (v.col === centro.col && v.fila === centro.fila);
  const pared = (a, b) => typeof paredCorta === 'function' && paredCorta(a, b);
  const ruta = [{col: x.col, fila: x.fila}];
  let p = ruta[0];
  for(let i = 0; i < c.mueve && distanciaHex(p, centro) > 1; i++){
    const sig = vecinosDeCasilla(p).filter(v => !ocupada(v) && !pared(p, v) && distanciaHex(v, centro) < distanciaHex(p, centro)).sort((a, b) => distanciaHex(a, centro) - distanciaHex(b, centro))[0];
    if(!sig) break;
    p = sig; ruta.push(p);
  }
  const titulo = `${quien} va hacia el brillo`;
  if(ruta.length < 2){ momentoAbrir({tipo: 'gancho', icono: '💎', titulo, resultado: `Res.Mt ${tiro} contra ${c.dif}: se tienta, pero no hay por dónde acercarse.`, estado: 'listo'}); return; }
  const tr = typeof trampasEvaluarRuta === 'function' ? trampasEvaluarRuta(id, x, ruta, 0) : null;
  const corte = tr && tr.tipo === 'pisa' ? tr.indice : -1;
  const final = corte > 0 ? ruta.slice(0, corte + 1) : ruta, fin = final[final.length - 1], pasos = final.length - 1;
  try{ await coleccionTokens().doc(id).update({col: fin.col, fila: fin.fila, ruta: firebase.firestore.FieldValue.delete()}); }
  catch(err){ console.error('El cebo: no se pudo mover', err); mesaLinea(`💎 ${quien} se tienta: acercalo ${pasos} casillas al brillo, a mano`, 'alerta-roja'); return; }
  const piso = corte > 0 ? ' En el camino pisa algo: se frena ahí.' : '';
  momentoAbrir({tipo: 'gancho', icono: '💎', titulo, resultado: `Res.Mt ${tiro} contra ${c.dif}: el brillo lo tienta y camina ${pasos} casillero${pasos === 1 ? '' : 's'} hacia él (gratis, sin ataques de oportunidad).${piso}`,
    estado: 'listo', datos: {arrastre: {tokenId: id, celdas: final.map(v => ({col: v.col, fila: v.fila}))}, ...(x.tipo !== 'creep' && x.duenoUid ? {paraUid: x.duenoUid, aviso: true} : {})}});
  mesaLinea(`💎 ${quien} se tienta con el brillo y camina ${pasos} casillero${pasos === 1 ? '' : 's'} hacia él${piso ? ' — pisó algo en el camino' : ''}`, 'recordatorio');
  if(corte > 0 && typeof trampaResolver === 'function'){
    trampaPendiente = {tokenId: id, tipo: 'pisa', id: tr.id, el: tr.el, celda: fin, desde: final[final.length - 2]};
    setTimeout(() => { trampaResolver().catch(err => console.error('El cebo: la trampa', err)); }, 600);
  }
}
// Al empezar el turno de un token (js/04, la pantalla del GM): si es rival de algún cebo y lo ve, tira de nuevo.
async function ceboInicioTurno(tokenId){
  if(!soyGM) return;
  for(const [elId, el] of elementos){
    const c = ceboDe(el);
    if(!c) continue;
    try{ await ceboAtraer(elId, {...c, col: el.origen.col, fila: el.origen.fila}, tokenId); }catch(err){ console.error('El cebo:', err); }
  }
}
// El primero que queda pegado lo da vuelta (lo mira la pantalla del GM cada segundo y medio).
const ceboRevelados = new Set();
setInterval(async () => {
  if(!soyGM || typeof elementos === 'undefined') return;
  for(const [elId, el] of elementos){
    const c = ceboDe(el);
    if(!c || ceboRevelados.has(elId)) continue;
    const centro = {col: el.origen.col, fila: el.origen.fila}, esRival = ceboRivalesDe(c);
    const x = [...tokens.values()].find(y => esRival(y) && distanciaHex(y, centro) <= 1);
    if(!x) continue;
    ceboRevelados.add(elId);
    const quien = nombreDe(x);
    try{ await coleccionElementos().doc(elId).delete(); }catch(err){ console.error('El cebo: no se pudo sacar', err); }
    momentoAbrir({tipo: 'cebo', icono: '🪨', titulo: `${quien} da vuelta el brillo`, estado: 'listo',
      resultado: `Era una roca pintada. ${quien} la levanta y abajo tiene pintado: «puto el que lee».`,
      datos: {veredicto: {tono: 'malo', grande: 'PUTO EL QUE LEE', chico: 'era una roca pintada'}, paraUids: typeof miembros !== 'undefined' ? [...miembros.keys()] : [], aviso: true}});
    mesaLinea(`🪨 ${quien} da vuelta el cebo: era una roca pintada. Abajo dice «puto el que lee».`, 'recordatorio');
  }
}, 1500);
// El brillo (lo llama `dibujar`, js/05): un destello dorado que late sobre la casilla del cebo.
function ceboDibujar(z){
  let hay = false;
  elementos.forEach(el => {
    if(!ceboDe(el)) return;
    hay = true;
    const p = hexCentro(el.origen.col, el.origen.fila), t = Date.now() / 600, r = HEX * (0.35 + 0.08 * Math.sin(t));
    ctx.save();
    ctx.font = `${Math.round(r * 1.6)}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t);
    ctx.fillText('💎', p.x, p.y);
    ctx.restore();
  });
  return hay;
}
