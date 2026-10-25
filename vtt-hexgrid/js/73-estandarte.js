// js/73-estandarte.js — 🚩 el Estandarte de guerra (2026-10-24, dueño; el Support, «Estandarte de guerra»: «+3 a la probabilidad de golpe, +5 al daño,
// 10 por nivel de HP, sin ningún tipo de defensa ni resistencia»; «permanente hasta que se rompa»; «el diámetro tiene que ser de 7»; el aura «que no sea
// hexagonal limpio: algún estilo marcial»).
// Una habilidad de creep con `estandarte = {radio, pdg, dano, vidaPorNivel}` (comun/skills-creep-base.js) → CreepAcciones.terminarHab llama `ui.estandarte`
// (js/12) → `plantarEstandarte`: el GM elige con un clic una casilla libre pegada al creep y ahí aparece el estandarte: un creep nuevo de su bando
// (ficha propia, quieta, sin ataques ni habilidades), con 10 de vida por nivel, Defensa 0, Defensa especial 0, resistencias en 0 y Evasión 1 (no esquiva):
// se le pega como a cualquier rival. No entra al orden de turnos ni da experiencia ni botín (`recompensado`). Uno por creep: clavar otro saca el anterior.
// Mientras siga en pie, los creeps a `radio` casillas o menos (él incluido) suman +pdg al PdG (o PdG.Esp) y +dano al daño: `estandarteBonus` (lo llaman
// js/13 y js/17 al crear el duelo; comun/duelo.js lo suma y lo muestra «🚩 bajo el estandarte»). Con 0 de vida se rompe: la pantalla del GM saca el token y
// la ficha. Lo público del creep lleva `estandarteRadio/Pdg/Dano` (CreepCalculo.tarjetaPublica): así todas las pantallas dibujan el aura.
// 🤐 El Tótem de silencio (2026-10-25, dueño; el Debuffer: «un skill tipo el estandarte, pero al revés… que en un área de diámetro 7 no permita utilizar
// ningún skill que cueste SP; aliados no, solo a rivales; 10 por nivel del caster»): el mismo token, con `estandarte.silencio` (lo público:
// `estandarteSilencio`). No da bonus: a los rivales de su bando dentro del aura, `silencioDeLugar` (la usa Combatiente.preguntaSilencio) les avisa
// que no pueden usar habilidades que cuestan SP (y los deja seguir si la mesa lo decide, como el estado Silencio).

const TOTEM_VIOLETA = '#5B4B8A', TOTEM_GRIS = '#B9B2CC';

const ESTANDARTE_CARMESI = '#B3202E', ESTANDARTE_ORO = '#E3B04B';
// ¿Ese token es un estandarte? → {radio, pdg, dano} (de lo público, lo ven todos) o null.
function estandarteInfo(t){
  if(!t || t.tipo !== 'creep' || !t.fichaId) return null;
  const v = vinculo(t);
  const radio = v ? Math.round(num(v.estandarteRadio)) : 0;
  return radio > 0 ? {radio, pdg: Math.max(0, Math.round(num(v.estandartePdg))), dano: Math.max(0, Math.round(num(v.estandarteDano))), silencio: num(v.estandarteSilencio) > 0} : null;
}
function estandarteEnPie(id, t){
  if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) return false;
  const v = vinculo(t), r = v && v.resumen;
  return !(r && r.hpPct !== undefined && num(r.hpPct) <= 0);
}
// Las casillas del aura: una flor de `radio` alrededor de la casilla.
function estandarteCeldas(c, radio){
  const out = [];
  for(let dc = -radio; dc <= radio; dc++) for(let df = -radio - 1; df <= radio + 1; df++){
    const p = {col: c.col + dc, fila: c.fila + df};
    if(distanciaHex(p, c) <= radio) out.push(p);
  }
  return out;
}
// El bonus para quien ataca (un creep a `radio` o menos de un estandarte en pie; si hay varios, el mayor; no se suman) → {pdg, dano} o null.
function estandarteBonus(mio){
  if(!mio || mio.tipo !== 'creep' || estandarteInfo(mio)) return null;
  let mejor = null;
  tokens.forEach((t, id) => {
    const e = estandarteInfo(t);
    if(!e || e.silencio || !estandarteEnPie(id, t)) return;   // (el tótem de silencio no da bonus)
    if(distanciaHex({col: t.col, fila: t.fila}, {col: mio.col, fila: mio.fila}) > e.radio) return;
    if(!mejor || e.pdg + e.dano > mejor.pdg + mejor.dano) mejor = {pdg: e.pdg, dano: e.dano};
  });
  return mejor;
}

// 🤐 ¿Esa ficha está dentro del aura de un tótem de silencio rival? (`ref`: la ficha del token; «ficha~invocación» para una invocación) → el nombre
// del tótem, o ''. Rival = de otro bando que el tótem (el de un creep silencia a los personajes y sus invocaciones). Con varios, el primero.
function silencioDeLugar(ref){
  if(!ref) return '';
  const quien = [...tokens.values()].find(t => t.fichaId === ref);
  if(!quien || quien.bajoTierra) return '';
  let nom = '';
  tokens.forEach((t, id) => {
    if(nom || t === quien) return;
    const e = estandarteInfo(t);
    if(!e || !e.silencio || t.tipo === quien.tipo || !estandarteEnPie(id, t)) return;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: quien.col, fila: quien.fila}) <= e.radio) nom = (vinculo(t) || {}).nombre || t.nombre || 'un tótem de silencio';
  });
  return nom;
}
// La imagen del tótem: un poste tallado con dos caras de boca cosida, violeta y gris (dibujado, sin archivos).
function totemImagen(){
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  const g = cv.getContext('2d');
  g.fillStyle = '#1E1A2B'; g.fillRect(0, 0, 96, 96);
  g.fillStyle = '#4A3A2A'; g.fillRect(34, 8, 28, 84);   // el poste
  g.strokeStyle = '#2A2018'; g.lineWidth = 2; g.strokeRect(34, 8, 28, 84);
  g.fillStyle = TOTEM_VIOLETA; g.beginPath(); g.moveTo(22, 20); g.lineTo(34, 14); g.lineTo(34, 30); g.closePath(); g.fill();   // las alas de arriba
  g.beginPath(); g.moveTo(74, 20); g.lineTo(62, 14); g.lineTo(62, 30); g.closePath(); g.fill();
  [14, 52].forEach(y0 => {   // dos caras
    g.fillStyle = TOTEM_GRIS; g.beginPath(); g.arc(42, y0 + 8, 3, 0, Math.PI * 2); g.arc(54, y0 + 8, 3, 0, Math.PI * 2); g.fill();   // los ojos
    g.strokeStyle = TOTEM_GRIS; g.lineWidth = 2.5; g.beginPath(); g.moveTo(39, y0 + 18); g.lineTo(57, y0 + 18); g.stroke();   // la boca cerrada
    for(let x = 41; x <= 55; x += 4){ g.beginPath(); g.moveTo(x, y0 + 15); g.lineTo(x, y0 + 21); g.stroke(); }   // cosida
  });
  return cv.toDataURL('image/png');
}
// La imagen del token: una bandera carmesí de dos puntas, con borde dorado, en un asta (dibujada, sin archivos).
function estandarteImagen(){
  const cv = document.createElement('canvas'); cv.width = cv.height = 96;
  const g = cv.getContext('2d');
  g.fillStyle = '#2B1B16'; g.fillRect(0, 0, 96, 96);
  g.strokeStyle = '#6B4A2B'; g.lineWidth = 5; g.beginPath(); g.moveTo(28, 10); g.lineTo(28, 90); g.stroke();   // el asta
  g.fillStyle = ESTANDARTE_ORO; g.beginPath(); g.arc(28, 9, 5, 0, Math.PI * 2); g.fill();   // la punta
  g.beginPath(); g.moveTo(30, 16); g.lineTo(84, 16); g.lineTo(70, 37); g.lineTo(84, 58); g.lineTo(30, 58); g.closePath();   // el paño de dos puntas
  g.fillStyle = ESTANDARTE_CARMESI; g.fill();
  g.lineWidth = 3; g.strokeStyle = ESTANDARTE_ORO; g.stroke();
  g.fillStyle = ESTANDARTE_ORO; g.beginPath(); g.moveTo(41, 28); g.lineTo(51, 37); g.lineTo(41, 46); g.lineTo(47, 37); g.closePath(); g.fill();   // un chevrón
  g.beginPath(); g.moveTo(50, 28); g.lineTo(60, 37); g.lineTo(50, 46); g.lineTo(56, 37); g.closePath(); g.fill();
  return cv.toDataURL('image/png');
}

// Clavarlo: el GM elige la casilla, libre y dentro del Rango del creep (dueño: «en cualquier lugar dentro de su rango»). Esc o clic derecho: no se
// clava (lo cobrado ya se cobró, como los refuerzos).
function plantarEstandarte(sc, h){
  const orig = [...tokens.entries()].find(([, t]) => t.tipo === 'creep' && t.fichaId === sc.id);
  if(!orig){ toast(`${(h.estandarte || {}).silencio ? '🤐' : '🚩'} ${sc.nombre}: no tiene token en este mapa, así que no puede clavar ${(h.estandarte || {}).silencio ? 'el tótem' : 'el estandarte'}`); return; }
  const [origId, tOrig] = orig;
  const e = h.estandarte || {}, ic = e.silencio ? '🤐' : '🚩', que = e.silencio ? 'el tótem' : 'el estandarte';
  const rng = Math.max(1, Math.round(num((rangoDeToken(tOrig) || {}).rng)) || 1);
  const pedir = () => elegirDestino(async c => {
    const ocupada = [...tokens.values()].some(x => x.col === c.col && x.fila === c.fila) || (typeof elementoSolidoEn === 'function' && elementoSolidoEn(c.col, c.fila));
    if(ocupada){ toast('Esa casilla no está libre (hay un token o un Sólido): elegí otra'); pedir(); return; }
    if(distanciaHex(c, {col: tOrig.col, fila: tOrig.fila}) > rng){ toast(`Esa casilla queda fuera del Rango de ${sc.nombre} (${rng}): elegí otra más cerca`); pedir(); return; }
    try{ await estandarteCrear(sc, e, c, tOrig, origId); }
    catch(err){ console.error('No se pudo clavar el estandarte:', err); toast(`No se pudo clavar ${que} — mirá la consola`); }
  }, `<b>${ic} ${esc(h.nombre || 'Estandarte de guerra')}: elegí dónde lo clava</b> <span>una casilla libre dentro de su Rango (${rng} casilla${rng === 1 ? '' : 's'}) · Esc o clic derecho cancelan</span>`, true);
  pedir();
}
async function estandarteCrear(sc, e, celda, tOrig){
  // Uno por creep (de cada clase: un estandarte y un tótem pueden convivir): el que ya tenía se va.
  const sil = !!e.silencio;
  for(const [id, t] of [...tokens.entries()]){
    const p = estandarteInfo(t) && creepPrivadoDe(t.fichaId);
    if(p && p.estandarte && p.estandarte.de === sc.id && !!p.estandarte.silencio === sil) await estandarteQuitar(id, t, 'reemplazo');
  }
  const n = Math.max(1, Math.round(num(sc.nivel)) || 1);
  const vida = Math.max(1, Math.round(num(e.vidaPorNivel) || 10) * n);
  const radio = Math.max(1, Math.round(num(e.radio)) || 3), pdg = Math.round(num(e.pdg)) || 3, dano = Math.round(num(e.dano)) || 5;
  const col = fbDb.collection(fbRutaCampana('creeps'));
  const nuevo = col.doc();
  const color = sil ? TOTEM_VIOLETA : ESTANDARTE_CARMESI;
  const nombre = `${sil ? 'Tótem de silencio' : 'Estandarte'} de ${String(sc.nombre || 'creep').replace(/\s*\((auditar|copia|refuerzo)\)\s*$/i, '')}`.slice(0, 60);
  // Todo en 1 y la vida por un estado propio (la vida de un creep sale de la Constitución: con 1, 5 de vida + lo del estado); sin resistencias.
  const est = {id: uidCorto(), nombre: sil ? 'Tótem' : 'Estandarte', polaridad: 'otro', permanente: true, turnos: 0, activo: true, stacks: 1, hpTurno: 0,
    mods: [{stat: 'hpmax', val: vida - 5}, {stat: 'resmg', val: -1}, {stat: 'rescc', val: -1}, {stat: 'resm', val: -1}],
    detalle: sil ? `Un tótem de silencio clavado en el piso: no ataca ni se mueve, no esquiva y no tiene defensas ni resistencias. Mientras siga en pie, los rivales de ${sc.nombre} a ${radio} casillas o menos no pueden usar habilidades que cuestan SP.`
      : `Un estandarte clavado en el piso: no ataca ni se mueve, no esquiva y no tiene defensas ni resistencias. Mientras siga en pie, los aliados de ${sc.nombre} a ${radio} casillas o menos suman +${pdg} a la Probabilidad de Golpe y +${dano} al daño.`};
  const ficha = {id: nuevo.id, nombre, nivel: n, con: 1, fue: 1, agl: 1, des: 1, esp: 1, hp: vida, hpMax: vida, defensa: 0, armadmg: 0, crit: [0, 0, 0, 0, 0],
    equipo: [], habilidades: [], estados: [est], cinturon: [], pasivas: [], tipoCriatura: 'Otro', tipoCriaturaOtro: 'Estandarte', oroBase: 0, jefe: false,
    mapa: mapaMostrado, recompensado: true, escalaTipos: 2, notas: sil ? `Tótem de silencio de ${sc.nombre}: sus rivales a ${radio} casillas o menos no pueden usar habilidades que cuestan SP mientras siga en pie.` : `Estandarte de guerra de ${sc.nombre}: sus aliados a ${radio} casillas o menos pegan mejor mientras siga en pie.`,
    estandarte: {de: sc.id, deNombre: String(sc.nombre || '').slice(0, 60), radio, ...(sil ? {pdg: 0, dano: 0, silencio: true} : {pdg, dano})}};
  const imagen = sil ? totemImagen() : estandarteImagen();
  const json = JSON.stringify(ficha);
  const lote = fbDb.batch();
  lote.set(nuevo, {nombre, orden: 999, color, mapa: String(mapaMostrado || '').slice(0, 80), resumen: {hpPct: 100, estados: []},
    firma: hashGm(json) + '-' + hashGm(imagen), miniatura: imagen, tarjeta: imagen, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  lote.set(nuevo.collection('privado').doc('ficha'), {json});
  lote.set(nuevo.collection('privado').doc('imagen'), {dato: imagen});
  await lote.commit();
  await modificarCreep(nuevo.id, x => { CreepCalculo.actualizarHpMaxPorCon(x); x.hp = x.hpMax; });   // arma lo público (vida, estados, el aura) como cualquier creep
  await pegarTokenEn({nombre, color, tipo: 'creep', rotacion: 0, oculto: false}, celda, nuevo.id, nombre);
  if(sil){
    const txt = `${sc.nombre} clava un tótem de silencio: sus rivales a ${radio} casillas o menos no pueden usar habilidades que cuestan SP mientras siga en pie (${vida} de vida, sin defensas)`;
    try{ mesaLinea(`🤐 ${txt}`, 'recordatorio'); }catch(err){}
    try{ momentoAbrir({tipo: 'estandarte', icono: '🤐', titulo: `${sc.nombre} clava un tótem de silencio`, resultado: `Sus rivales a ${radio} casillas o menos no pueden usar habilidades que cuestan SP, hasta que lo rompan.`, estado: 'listo', datos: {centro: true}}); }catch(err){}
    toast(`🤐 ${nombre}: clavado`);
    return;
  }
  const txt = `${sc.nombre} clava un estandarte de guerra: sus aliados a ${radio} casillas o menos suman +${pdg} a la Probabilidad de Golpe y +${dano} al daño mientras siga en pie (${vida} de vida, sin defensas)`;
  try{ mesaLinea(`🚩 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'estandarte', icono: '🚩', titulo: `${sc.nombre} clava un estandarte de guerra`, resultado: `Sus aliados a ${radio} casillas o menos: +${pdg} PdG y +${dano} al daño, hasta que lo rompan.`, estado: 'listo', datos: {centro: true}}); }catch(err){}
  toast(`🚩 ${nombre}: clavado`);
}
// Sacarlo del mapa y borrar su ficha (al romperse, o al clavar otro).
async function estandarteQuitar(id, t, motivo){
  const v = vinculo(t), nom = (v && v.nombre) || t.nombre || 'El estandarte';
  try{ await coleccionTokens().doc(id).delete(); }catch(err){ console.error('No se pudo sacar el token del estandarte:', err); }
  try{
    const base = fbDb.doc(fbRutaCampana(`creeps/${t.fichaId}`));
    await Promise.all([base.collection('privado').doc('ficha').delete(), base.collection('privado').doc('imagen').delete()]);
    await base.delete();
  }catch(err){ console.error('No se pudo borrar la ficha del estandarte:', err); }
  if(motivo === 'roto'){
    const sil = !!(estandarteInfo(t) || {}).silencio, ic = sil ? '🤐' : '🚩';
    try{ mesaLinea(`${ic} Rompieron ${nom}: ${sil ? 'se termina el silencio' : 'se termina su bonus'}`, 'recordatorio'); }catch(err){}
    try{ momentoAbrir({tipo: 'estandarte', icono: ic, titulo: `Rompieron ${nom}`, resultado: sil ? 'Sus rivales ya pueden volver a usar habilidades que cuestan SP.' : 'Sus aliados ya no suman el bonus.', estado: 'listo', datos: {centro: true}}); }catch(err){}
  }
}
// La pantalla del GM saca los que se rompieron (0 de vida).
const estandartesQuitando = new Set();
setInterval(() => {
  if(!soyGM || !fbDb) return;
  tokens.forEach((t, id) => {
    if(!estandarteInfo(t) || estandarteEnPie(id, t) || estandartesQuitando.has(id)) return;
    estandartesQuitando.add(id);
    estandarteQuitar(id, t, 'roto').finally(() => setTimeout(() => estandartesQuitando.delete(id), 5000));
  });
}, 1500);

/* El aura (dueño: «algún estilo marcial»): la línea punteada dorada sobre el borde exacto de las casillas (qué casillas cuentan, como el muro y la
   curación), un velo carmesí muy tenue adentro y, por fuera de la grilla, un anillo carmesí y dorado con banderines triangulares que flamean. Debajo
   de los tokens (js/05). */
function estandarteDibujar(z){
  let hay = false;
  const t0 = performance.now() / 1000;
  tokens.forEach((t, id) => {
    const e = estandarteInfo(t);
    if(!e || !estandarteEnPie(id, t) || (t.oculto && !soyGM) || (typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(t))) return;
    hay = true;
    const celdas = estandarteCeldas({col: t.col, fila: t.fila}, e.radio), c = hexCentro(t.col, t.fila);
    const p = 0.5 + 0.5 * Math.sin(t0 * 1.3);
    if(e.silencio){   // 🤐 el tótem: un velo violeta que respira, el borde punteado gris y un anillo doble, quieto (es silencio: nada flamea)
      ctx.save();
      ctx.beginPath();
      celdas.forEach(q => { const h = hexCentro(q.col, q.fila); ESQUINAS.forEach((a, i) => i ? ctx.lineTo(h.x + a[0], h.y + a[1]) : ctx.moveTo(h.x + a[0], h.y + a[1])); ctx.closePath(); });
      ctx.fillStyle = `rgba(70,55,120,${0.10 + 0.05 * p})`; ctx.fill();
      ctx.restore();
      bordeHexPunteado(celdas, z, 'rgba(200,192,225,.55)');
      const R = Math.max(...celdas.map(q => { const h = hexCentro(q.col, q.fila); return Math.hypot(h.x - c.x, h.y - c.y); })) + HEX * 1.15;
      ctx.save();
      ctx.beginPath(); ctx.arc(c.x, c.y, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(20,14,35,.55)'; ctx.lineWidth = 5 / z; ctx.stroke();
      ctx.strokeStyle = `rgba(110,90,170,${0.7 + 0.2 * p})`; ctx.lineWidth = 3 / z; ctx.stroke();
      ctx.setLineDash([HEX * 0.25, HEX * 0.18]); ctx.beginPath(); ctx.arc(c.x, c.y, R - 5 / z, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200,192,225,.7)'; ctx.lineWidth = 1.2 / z; ctx.stroke();
      ctx.restore();
      return;
    }
    ctx.save();
    // El velo, casilla por casilla.
    ctx.beginPath();
    celdas.forEach(q => { const h = hexCentro(q.col, q.fila); ESQUINAS.forEach((a, i) => i ? ctx.lineTo(h.x + a[0], h.y + a[1]) : ctx.moveTo(h.x + a[0], h.y + a[1])); ctx.closePath(); });
    ctx.fillStyle = `rgba(150,24,36,${0.07 + 0.03 * p})`; ctx.fill();
    ctx.restore();
    bordeHexPunteado(celdas, z, 'rgba(235,195,105,.45)');
    // El anillo y los banderines, por fuera de la grilla, siguiendo la forma del área con las puntas redondeadas (dueño: «que no sea circular exacta, más
    // aproximada a la forma hexagonal, pero que tampoco sea literalmente hexagonal»): en cada dirección, el centro de la casilla más alejada en esa
    // dirección, corrido un margen fijo hacia afuera (la forma del área con las puntas redondeadas; convexa, sin entradas).
    const pts = celdas.map(q => hexCentro(q.col, q.fila)), M = 120, MARGEN = HEX * 1.15;
    const punto = (th, extra) => {
      const ux = Math.cos(th), uy = Math.sin(th);
      let mejor = pts[0], hmax = -Infinity;
      for(const q of pts){ const d = (q.x - c.x) * ux + (q.y - c.y) * uy; if(d > hmax){ hmax = d; mejor = q; } }
      const m = MARGEN + (extra || 0);
      return {x: mejor.x + ux * m, y: mejor.y + uy * m};
    };
    const trazar = extra => { ctx.beginPath(); for(let i = 0; i <= M; i++){ const q = punto((i / M) * Math.PI * 2, extra); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); } ctx.closePath(); };
    ctx.save();
    ctx.lineJoin = 'round';
    trazar(0);
    ctx.strokeStyle = 'rgba(40,10,12,.55)'; ctx.lineWidth = 5 / z; ctx.stroke();
    ctx.strokeStyle = `rgba(179,32,46,${0.75 + 0.2 * p})`; ctx.lineWidth = 3 / z; ctx.stroke();
    trazar(-4 / z);
    ctx.strokeStyle = 'rgba(227,176,75,.8)'; ctx.lineWidth = 1.2 / z; ctx.stroke();
    // Los banderines, a distancias iguales a lo largo del contorno (por ángulo se amontonaban en las puntas); flamean un poquito hacia los costados.
    const linea = []; for(let i = 0; i <= M; i++) linea.push(punto((i / M) * Math.PI * 2));
    const tramos = []; let total = 0;
    for(let i = 0; i < M; i++){ const l = Math.hypot(linea[i + 1].x - linea[i].x, linea[i + 1].y - linea[i].y); tramos.push(l); total += l; }
    const N = Math.max(12, Math.round(total / HEX * 0.5)), largo = HEX * 0.42, ancho = HEX * 0.17;
    for(let i = 0; i < N; i++){
      let resto = (i / N) * total, k = 0;
      while(k < M - 1 && resto > tramos[k]){ resto -= tramos[k]; k++; }
      const a0 = linea[k], a1 = linea[k + 1], f = tramos[k] ? resto / tramos[k] : 0;
      const tl = tramos[k] || 1, vx0 = (a1.x - a0.x) / tl, vy0 = (a1.y - a0.y) / tl;
      const bx = a0.x + (a1.x - a0.x) * f, by = a0.y + (a1.y - a0.y) * f;
      const sw = 0.25 * Math.sin(t0 * 2.2 + i * 0.9);   // flamean
      const nx = vy0, ny = -vx0;   // hacia afuera del contorno
      const ux = nx + vx0 * sw, uy = ny + vy0 * sw, vx = vx0, vy = vy0;
      ctx.beginPath();
      ctx.moveTo(bx - vx * ancho, by - vy * ancho);
      ctx.lineTo(bx + vx * ancho, by + vy * ancho);
      ctx.lineTo(bx + ux * largo, by + uy * largo);
      ctx.closePath();
      ctx.fillStyle = i % 2 ? ESTANDARTE_ORO : ESTANDARTE_CARMESI; ctx.fill();
      ctx.strokeStyle = 'rgba(30,8,10,.7)'; ctx.lineWidth = 1 / z; ctx.stroke();
    }
    ctx.restore();
  });
  return hay;
}
