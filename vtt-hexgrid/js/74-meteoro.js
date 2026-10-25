// js/74-meteoro.js — ☄ la Lluvia de meteoros (2026-10-24, dueño; el Mago, «Lluvia de meteoros»: «4d6 de daño físico y 4d6 de daño de fuego; se esquiva
// con dodge roll; se anuncia como una sombra, viene del cielo»).
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
  const pedir = () => elegirDestino(async c => {
    if(distanciaHex(c, {col: tOrig.col, fila: tOrig.fila}) > rng){ toast(`Ese punto queda fuera del Rango de ${sc.nombre} (${rng}): elegí otro más cerca`); pedir(); return; }
    try{
      await modificarCreep(sc.id, x => { x.meteoro = {col: c.col, fila: c.fila, radio, fisico: String(m.fisico || '4d6'), fuego: String(m.fuego || '4d6'),
        nombre: String(h.nombre || 'Lluvia de meteoros').slice(0, 60), paso: Math.round(num(iniciativa.paso)), mant: Math.round(num(mantenimientoNumero)),
        enOrden: iniciativa.orden.some(o => o.id === origId)}; });
    }catch(err){ console.error('No se pudo marcar el meteoro:', err); toast('No se pudo marcar el meteoro — mirá la consola'); return; }
    const txt = `Una sombra cubre el suelo (${Combatiente.areaTxt(radio)}): algo cae del cielo. Cae al empezar el próximo turno de ${sc.nombre}`;
    try{ mesaLinea(`☄ ${sc.nombre}: ${txt}.`, 'recordatorio'); }catch(err){}
    try{ momentoAbrir({tipo: 'meteoro', icono: '☄', titulo: `${sc.nombre} llama a un meteoro`, resultado: `${txt}: los que sigan adentro tienen un dodge roll para salir.`, estado: 'listo', datos: {centro: true}}); }catch(err){}
  }, `<b>☄ ${esc(h.nombre || 'Lluvia de meteoros')}: marcá dónde cae</b> <span>el centro, dentro de su Rango (${rng} casilla${rng === 1 ? '' : 's'}) · ${Combatiente.areaTxt(radio)} · Esc o clic derecho cancelan</span>`, true);
  pedir();
}

// Hacerlo caer (la pantalla del GM): la explosión, el anuncio y el área con dodge roll.
async function meteoroCaer(id, t, sc){
  const m = sc.meteoro;
  await modificarCreep(sc.id, x => { delete x.meteoro; });
  const celdas = meteoroCeldas({col: m.col, fila: m.fila}, m.radio);
  const explota = {clave: 'meteoro:' + sc.id + ':' + Date.now(), celdas: celdas.flatMap(c => [c.col, c.fila])};
  try{ await momentoAbrir({tipo: 'estallido', icono: '☄', titulo: `¡Cae el meteoro de ${sc.nombre}!`, estado: 'listo',
    resultado: `${m.fisico} de daño físico y ${m.fuego} de fuego a los que sigan adentro (dodge roll para salir).`, datos: {explota}}); }catch(err){}
  try{ mesaLinea(`☄ ¡Cae el meteoro de ${sc.nombre}! ${m.fisico} físico (lo frena la Defensa) y ${m.fuego} de fuego (menos la resistencia al fuego) a los que sigan adentro: cada uno tiene un dodge roll para salir`, 'recordatorio'); }catch(err){}
  if(typeof explosionEmpezar === 'function') explosionEmpezar(explota);
  const hab = {nombre: m.nombre || 'Lluvia de meteoros', objetivo: 'area', radio: m.radio, tira: null, contra: [{modo: 'eva', stat: 'eva', etq: 'Evasión'}],
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
    g.addColorStop(0, 'rgba(0,0,0,.5)'); g.addColorStop(0.65, 'rgba(10,4,0,.32)'); g.addColorStop(1, 'rgba(10,4,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    bordeHexPunteado(celdas, z, 'rgba(255,150,70,.55)');
    ctx.save();
    const brillo = 0.55 + 0.45 * Math.sin(t0 * 5);
    ctx.shadowColor = 'rgba(255,140,40,.9)'; ctx.shadowBlur = 14 / z;
    ctx.fillStyle = `rgba(255,${150 + Math.round(60 * brillo)},60,${0.6 + 0.35 * brillo})`;
    ctx.beginPath(); ctx.arc(c.x, c.y, HEX * (0.12 + 0.05 * brillo), 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
  return hay;
}
