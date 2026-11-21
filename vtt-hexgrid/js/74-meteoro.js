// js/74-meteoro.js — ☄ el Meteoro (2026-10-24, dueño; el Mago, «área anunciada»: «se esquiva con dodge roll; se anuncia como una sombra, viene del
// cielo»; 4d6 físicos + 2d6 de fuego directo).
// Una habilidad de creep con `meteoro = {radio, fisico, fuego}` (comun/skills-creep-base.js) → CreepAcciones.terminarHab llama `ui.meteoro` (js/12) →
// `marcarMeteoro`: el GM marca el centro dentro del Rango del creep y queda la sombra (`sc.meteoro` en su ficha; lo público lleva `meteoroCol/Fila/Radio`
// para que todas las pantallas la dibujen). Al empezar el próximo turno del creep (con el orden de turnos: su turno, con un `paso` mayor que el de cuando
// la marcó; sin orden, el próximo cambio de ronda) la pantalla del GM la hace caer: la explosión en todas las pantallas (el momento «estallido», js/16) y un
// área con el centro fijo (`dueloElegirAreaMapa({centroFijo})`, js/13) que agarra a todos los de adentro menos él (también a sus aliados), donde cada uno
// arranca en el dodge roll (`soloDodge`, como la Tormenta arcana): quien sale no recibe nada; quien sigue adentro, el daño físico (lo frena la Defensa) y
// el de fuego (`dano.extra` → `dano.magico` del duelo: directo, menos la resistencia al fuego). Si el creep cae antes, la sombra se disipa.

function meteoroDe(t){   // lo público de un creep con una sombra por caer → {col, fila, radio} o null
  if(!t || t.tipo !== 'creep' || !t.fichaId) return null;
  const v = vinculo(t), radio = v ? Math.round(num(v.meteoroRadio)) : 0;
  return radio > 0 ? {col: Math.round(num(v.meteoroCol)), fila: Math.round(num(v.meteoroFila)), radio} : null;
}
function meteoroCeldas(c, radio){
  const out = [];
  for(let dc = -radio; dc <= radio; dc++) for(let df = -radio - 1; df <= radio + 1; df++){
    const p = {col: c.col + dc, fila: c.fila + df};
    if(distanciaHex(p, c) <= radio) out.push(p);
  }
  return out;
}

// Marcarlo: el GM elige el centro dentro del Rango. Esc o clic derecho: no se marca (lo cobrado ya se cobró, como los refuerzos).
function marcarMeteoro(sc, h){
  const orig = [...tokens.entries()].find(([, t]) => t.tipo === 'creep' && t.fichaId === sc.id);
  if(!orig){ toast(`☄ ${sc.nombre}: no tiene token en este mapa, así que no puede marcar la sombra`); return; }
  const [origId, tOrig] = orig;
  const m = h.meteoro || {};
  const radio = Math.max(1, Math.round(num(m.radio)) || 2);
  const rng = Math.max(1, Math.round(num((rangoDeToken(tOrig) || {}).rng)) || 1);
  const pedir0 = () => elegirDestino(async c => {
    if(distanciaHex(c, {col: tOrig.col, fila: tOrig.fila}) > rng){ toast(`Ese punto queda fuera del Rango de ${sc.nombre} (${rng}): elegí otro más cerca`); pedir1(); return; }
    try{
      await modificarCreep(sc.id, x => { x.meteoro = {col: c.col, fila: c.fila, radio, fisico: String(m.fisico || '4d6'), fuego: String(m.fuego || '2d6'),
        nombre: String(h.nombre || 'Meteoro').slice(0, 60), paso: Math.round(num(iniciativa.paso)), mant: Math.round(num(mantenimientoNumero)),
        enOrden: iniciativa.orden.some(o => o.id === origId)}; });
    }catch(err){ console.error('No se pudo marcar el meteoro:', err); toast('No se pudo marcar el meteoro — mirá la consola'); return; }
    const txt = `Una sombra cubre el suelo (${Combatiente.areaTxt(radio)}): algo cae del cielo. Cae al empezar el próximo turno de ${sc.nombre}`;
    try{ mesaLinea(`☄ ${sc.nombre}: ${txt}.`, 'recordatorio'); }catch(err){}
    try{ momentoAbrir({tipo: 'meteoro', icono: '☄', titulo: `${sc.nombre} llama a un meteoro`, resultado: `${txt}: los que sigan adentro, de a uno, eligen si esquivan (dodge roll).`, estado: 'listo', datos: {centro: true}}); }catch(err){}
    meteoroAvisarSombra({col: c.col, fila: c.fila}, radio).catch(err => console.error('El aviso de la sombra:', err));
  }, `<b>☄ ${esc(h.nombre || 'Meteoro')}: marcá dónde cae</b> <span>el centro, dentro de su Rango (${rng} casilla${rng === 1 ? '' : 's'}) · ${Combatiente.areaTxt(radio)} · Esc o clic derecho cancelan</span>`, true);
  const pedir1 = () => { pedir0(); if(typeof areaPrevia === 'function') areaPrevia(radio, '#ff9650'); };   // 👁 la sombra sigue al mouse (js/118)
  pedir1();
}

/* ☄ El aviso de la sombra (dueño, 2026-11-18: «al seleccionar el área, a las personas dentro del área les aparezca una notificación que diga "Una
   sombra cubre el suelo: algo cae del cielo." Nada más»). Al marcar el centro, un momento `meteoro-sombra` (sin tarjeta en la Crónica) con a quién le
   toca: el que maneja cada personaje o invocación de adentro (su jugador, o quien tiene 🎮 el control) y el GM si hay creeps adentro. Cada pantalla
   a la que le toca muestra el cartel una sola vez. */
const METEORO_SOMBRA_TXT = 'Una sombra cubre el suelo: algo cae del cielo.';
async function meteoroAvisarSombra(centro, radio){
  const uids = new Set();
  let gm = false;
  tokens.forEach(t => {
    if(!t || distanciaHex({col: t.col, fila: t.fila}, centro) > radio) return;
    if(t.tipo === 'creep'){ gm = true; return; }
    if(!t.fichaId) return;
    const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]);
    const uid = (f && f.resumen && f.resumen.control) || t.duenoUid || (f && f.duenoUid) || '';
    if(uid) uids.add(uid); else gm = true;
  });
  if(!uids.size && !gm) return;
  await momentoAbrir({tipo: 'meteoro-sombra', icono: '☄', titulo: METEORO_SOMBRA_TXT, estado: 'listo', datos: {paraUids: [...uids], paraGM: gm}});
}
const meteoroSombraVistos = new Set();
function meteoroSombraMomento(id, d){   // (js/16) → true: no va a la Crónica
  if(meteoroSombraVistos.has(id)) return true;
  meteoroSombraVistos.add(id);
  const dt = d.datos || {}, ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - ms > 60000) return true;   // uno viejo, al abrir el mapa, no
  const mio = (fbUsuario && (dt.paraUids || []).includes(fbUsuario.uid)) || (soyGM && dt.paraGM);
  if(!mio) return true;
  const clave = 'meteoro-sombra:' + id;
  AvisoCombate.cartel(clave, {icono: '☄', titulo: METEORO_SOMBRA_TXT, botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cartel(clave, null)}]});
  return true;
}

// Hacerlo caer (la pantalla del GM): la explosión, el anuncio y el área con dodge roll.
async function meteoroCaer(id, t, sc){
  const m = sc.meteoro;
  await modificarCreep(sc.id, x => { delete x.meteoro; });
  const celdas = meteoroCeldas({col: m.col, fila: m.fila}, m.radio);
  const explota = {clave: 'meteoro:' + sc.id + ':' + Date.now(), celdas: celdas.flatMap(c => [c.col, c.fila])};
  try{ await momentoAbrir({tipo: 'estallido', icono: '☄', titulo: `¡Cae el meteoro de ${sc.nombre}!`, estado: 'listo',
    resultado: `${m.fisico} de daño físico y ${m.fuego} de fuego a los que sigan adentro (de a uno: ¿esquiva? y después el daño).`, datos: {explota}}); }catch(err){}
  try{ mesaLinea(`☄ ¡Cae el meteoro de ${sc.nombre}! ${m.fisico} físico (lo frena la Defensa) y ${m.fuego} de fuego (menos la resistencia al fuego) a los que sigan adentro: de a uno, cada uno elige si esquiva (dodge roll) y después el daño`, 'recordatorio'); }catch(err){}
  if(typeof explosionEmpezar === 'function') explosionEmpezar(explota);
  const hab = {nombre: m.nombre || 'Meteoro', objetivo: 'area', radio: m.radio, tira: null, contra: [{modo: 'eva', stat: 'eva', etq: 'Evasión'}],
    dano: {formula: m.fisico, tipo: 'fisico', ignoraDef: false, extra: {formula: m.fuego, tipo: 'fuego'}}, efectos: [], soloDodge: true, meteoro: true, fuegoAmigo: true};
  dueloElegirAreaMapa({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre}, ataque: {hab}, centroFijo: {col: m.col, fila: m.fila}});
}
const meteorosEnCurso = new Set();
setInterval(() => {
  if(!soyGM || !fbDb) return;
  tokens.forEach((t, id) => {
    if(t.tipo !== 'creep' || !t.fichaId || meteorosEnCurso.has(id)) return;
    const sc = creepPrivadoDe(t.fichaId), m = sc && sc.meteoro;
    if(!m) return;
    const listo = (p) => { meteorosEnCurso.add(id); p.catch(err => console.error('El meteoro:', err)).finally(() => setTimeout(() => meteorosEnCurso.delete(id), 4000)); };
    if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)){   // el que lo llamó cayó: la sombra se disipa
      listo(modificarCreep(sc.id, x => { delete x.meteoro; }).then(() => { try{ mesaLinea(`☄ ${sc.nombre} cayó: la sombra se disipa y el meteoro no llega`, 'recordatorio'); }catch(e){} }));
      return;
    }
    const enOrden = iniciativa.orden.some(o => o.id === id);
    const cae = enOrden ? (esSuTurno(id) === true && Math.round(num(iniciativa.paso)) > Math.round(num(m.paso)))
      : (mantenimientoNumero !== null && Math.round(num(mantenimientoNumero)) > Math.round(num(m.mant)));
    if(cae) listo(meteoroCaer(id, t, sc));
  });
}, 1000);

/* La sombra: un círculo oscuro y borroso que respira sobre el área (más oscura en el centro), la línea punteada naranja sobre el borde exacto de las
   casillas y un punto de fuego chiquito en el centro que titila (lo que viene cayendo). La ven todos. Debajo de los tokens (js/05). */
function meteoroDibujar(z){
  let hay = false;
  const t0 = performance.now() / 1000;
  tokens.forEach(t => {
    const m = meteoroDe(t);
    if(!m) return;
    hay = true;
    const celdas = meteoroCeldas(m, m.radio), c = hexCentro(m.col, m.fila);
    const R = (m.radio + 0.8) * Math.sqrt(3) * HEX * (0.96 + 0.04 * Math.sin(t0 * 1.6));
    ctx.save();
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, R);
    // (2026-11-18, dueño: «la sombra del meteoro debería verse un poco más»: sobre una imagen de fondo se perdía) más oscura, las casillas
    // teñidas de un rojo brasa que late, y un borde grueso con contraste (negro abajo, naranja encima) que se ve sobre cualquier fondo.
    g.addColorStop(0, 'rgba(0,0,0,.72)'); g.addColorStop(0.65, 'rgba(14,4,0,.52)'); g.addColorStop(1, 'rgba(14,4,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
    const late = 0.5 + 0.5 * Math.sin(t0 * 2.4);
    ctx.fillStyle = `rgba(160,40,0,${0.14 + 0.1 * late})`;
    celdas.forEach(k => { const h = hexCentro(k.col, k.fila); ctx.beginPath(); ESQUINAS.forEach(([dx, dy], i) => i ? ctx.lineTo(h.x + dx, h.y + dy) : ctx.moveTo(h.x + dx, h.y + dy)); ctx.closePath(); ctx.fill(); });
    ctx.restore();
    bordeHexPunteado(celdas, z, `rgba(255,${130 + Math.round(50 * late)},50,${0.85 + 0.15 * late})`, {solido: true, ancho: 3, contraste: 'rgba(0,0,0,.75)'});
    ctx.save();
    const brillo = 0.55 + 0.45 * Math.sin(t0 * 5);
    ctx.shadowColor = 'rgba(255,140,40,.9)'; ctx.shadowBlur = 14 / z;
    ctx.fillStyle = `rgba(255,${150 + Math.round(60 * brillo)},60,${0.6 + 0.35 * brillo})`;
    ctx.beginPath(); ctx.arc(c.x, c.y, HEX * (0.12 + 0.05 * brillo), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  return hay;
}
