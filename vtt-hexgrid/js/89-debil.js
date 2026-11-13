// js/89-debil.js — 🎯 «Débil» / «Resistente» / «Inmune» en el token (2026-11-01, dueño).
/* Lo que pidió el dueño:
   - «Cuando uno ejecuta una habilidad con un daño elemental y alguno de los objetivos tiene debilidad contra ese daño, que aparezca en el token algún
     cartel que diga débil… lo mismo a la inversa, resistente» (2026-10-26). Y hoy: «al momento de seleccionar los posibles objetivos, ya en ese momento
     donde los tokens laten, ahí ya diga débil o resistente. Una criatura que vuela, débil a los ataques de rango: siempre que un arquero seleccione
     atacar… va a decir débil al rango. Y a la inversa para el GM: que no tenga la distracción de atacar con fuego a alguien con resistencia al fuego».
   - Los creeps: «si un creep tiene una resistencia, una debilidad, un elemento, que no se sepa; pero una vez que se revela, ya quede marcado… recibe una
     flecha de fuego, aparece una notificación, es débil. Y después le queda la marca». Por creep, no por tipo («muchas veces esas debilidades o
     resistencias van a venir por equipo; y además, que hagan sus apuestas»).
   - «El GM no necesita descubrirlo, siempre tiene la información desde el principio.»

   Quién ve qué:
   - El GM: todo, de creeps y de personajes (las resistencias del creep salen de su parte privada). En la marca de abajo del token, lo que los jugadores
     ya descubrieron va lleno y lo que no, tenue.
   - Un jugador, sobre un creep: lo que ya se reveló de ESE creep (`creeps/<id>.revelado`, lo escribe el mapa del GM) y lo que se ve a simple vista: que
     vuela (débil a disparos) y lo que sale de su tipo de criatura, que está en su tarjeta (la luz ×1,5 a no-muertos y demonios, lo siniestro que no les
     hace nada, lo sagrado y el Matabestias).
   - Sobre personajes (aliados o el propio): todo — sus resistencias ya están en lo público de la ficha y es información del grupo (decisión de Claude).

   Partes:
   - `debilApuntar(msg, area)` / `debilApuntarFin()`: los llama js/13 al empezar y terminar de elegir objetivo (o área). Mientras dura, js/05 llama
     `debilDibujar` en cada token y, si el golpe le pega de más o de menos, dibuja la etiqueta («DÉBIL AL FUEGO», «RESISTENTE AL HIELO», «INMUNE A LO
     SINIESTRO», «DÉBIL A DISPAROS») arriba del token.
   - La marca chiquita persistente (solo creeps), debajo de las barras: 🔥▼ débil, ❄️▲ resistente, ⛔ inmune.
   - `debilRevelar(t, el, info)`: lo llama `dueloAplicarDano` (js/13, solo el mapa del GM) cuando el daño de un elemento le entró a un creep de más o de
     menos por su resistencia o su identidad; la primera vez lo guarda en `creeps/<id>.revelado.<el>` y abre un momento para todos.
   - En la tarjeta 🪪 del creep: lo revelado y, el GM, todo y el botón «Olvidar lo descubierto». */

const DEBIL_ELS = ['fuego', 'hielo', 'rayo', 'toxico', 'acido', 'luz', 'siniestro'];
const DEBIL_NOMBRE = {fuego: 'al fuego', hielo: 'al hielo', rayo: 'a lo eléctrico', toxico: 'a lo tóxico', acido: 'al ácido', luz: 'a la luz', siniestro: 'a lo siniestro'};
const DEBIL_NOMBRE_INM = {fuego: 'al fuego', hielo: 'al hielo', rayo: 'a lo eléctrico', toxico: 'a lo tóxico', acido: 'al ácido', luz: 'a la luz', siniestro: 'a lo siniestro'};
const debilIcono = el => (el === 'disparo' ? '🏹' : el === 'sagrado' ? '✨' : el === 'matabestias' ? '🐾'
  : (typeof Combatiente !== 'undefined' && Combatiente.ELEMENTOS && Combatiente.ELEMENTOS[el] ? Combatiente.ELEMENTOS[el].icono : '•'));
const DEBIL_COLOR = {debil: '#3E9B4F', resistente: '#8A7A5A', inmune: '#9B3B3B'};
const DEBIL_FLECHA = {debil: '▼', resistente: '▲', inmune: '⛔'};

let debilApuntando = null;   // {ataque, yo, area}

function debilApuntar(msg, area){ debilApuntando = msg && msg.ataque ? {ataque: msg.ataque, yo: msg.yo || {}, area: !!area} : null; pedirDibujo(); }
function debilApuntarFin(){ if(debilApuntando){ debilApuntando = null; pedirDibujo(); } }

// Lo que trae el golpe que se está por hacer: sus elementos, si es un disparo, lo sagrado y el Matabestias.
function debilDelAtaque(ataque, yo){
  const r = {els: new Set(), disparo: false, sagrado: false, matabestias: 0};
  if(!ataque) return r;
  const el = tipo => { const e = tipo ? Combatiente.elementoDe(tipo) : ''; if(e && DEBIL_ELS.includes(e)) r.els.add(e); };
  const hab = ataque.hab;
  if(hab){
    el((hab.dano && hab.dano.tipo) || hab.tipoDano);
    const ext = (hab.dano && hab.dano.extra) || hab.extra;
    if(ext) el(ext.tipo || 'fuego');
    if(hab.sagrado || (hab.dano && hab.dano.sagrado)) r.sagrado = true;
  }else{
    const efectos = [...(Array.isArray(ataque.efectos) ? ataque.efectos : []), ...(ataque.flecha && Array.isArray(ataque.flecha.efectos) ? ataque.flecha.efectos : [])];
    efectos.forEach(e => { if(e && e.danoMagico) el(e.tipo || e.nombre); });
    // El arma con elemento por un estado (Arma ígnea, Arma luminosa…: Arma elemental, 2026-10-31) se suma en el duelo; acá se lo lee de sus estados.
    const mio = yo ? [...tokens.values()].find(x => x.fichaId === yo.ref && x.tipo === yo.tipo) : null, est = mio ? estadoDe(mio) : null;
    const armas = (Combatiente.ARMAS_ELEMENTALES || []);
    if(est) est.estados.forEach(e => { if(!e || e.activo === false) return; const a = armas.find(x => x.estado === e.nombre); if(a) el(a.clave); else if(/^(arma (venenosa|envenenada)|óleo venenoso)/i.test(String(e.nombre || ''))) r.els.add('toxico'); });
    if(ataque.rango || ataque.flecha) r.disparo = true;
    if(num(ataque.matabestias) > 0) r.matabestias = num(ataque.matabestias);
  }
  return r;
}

// Lo que esta pantalla sabe del token: resistencias (las que conoce), si vuela, su tipo y lo revelado. `todo` = las sabe todas (GM o personaje).
function debilSabido(t){
  const s = {res: {}, vuela: false, tipo: '', revelado: {}, todo: false, creep: false};
  if(!t) return s;
  const est = estadoDe(t);
  s.vuela = !!(est && est.estados.some(e => e && e.activo !== false && (e.volador || String(e.nombre || '').trim().toLowerCase() === 'vuela')));
  if(t.tipo === 'creep'){
    s.creep = true;
    const v = vinculo(t) || {};
    s.tipo = String(v.tipoCriatura || '').toLowerCase().trim();
    s.revelado = v.revelado && typeof v.revelado === 'object' ? v.revelado : {};
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    if(sc){
      s.todo = true;
      DEBIL_ELS.forEach(el => { const x = num(CreepCalculo.resElemental(sc, el)); if(x) s.res[el] = x; });
      if(num(CreepCalculo.statValor(sc, 'evadisparo')) < 0) s.vuela = true;
    }else DEBIL_ELS.forEach(el => { const x = s.revelado[el]; if(x === 'debil') s.res[el] = -1; else if(x === 'resistente') s.res[el] = 1; else if(x === 'inmune') s.res[el] = 99; });
    return s;
  }
  if(String(t.fichaId || '').includes(SEP_INVOCACION)) return s;   // (una invocación: sus datos no están a mano acá)
  const f = fichasPub.get(t.fichaId), r = (f && f.resumen) || {};
  s.todo = true;
  DEBIL_ELS.forEach(el => { const x = num(r['res' + el]); if(x) s.res[el] = x; });
  return s;
}

// Qué le pasa a ese token con ese golpe → [{tipo: debil|resistente|inmune, clave, txt}]
function debilEvaluar(t, del){
  const s = debilSabido(t), out = [];
  const oscura = ['no-muerto', 'demonio'].includes(s.tipo);
  del.els.forEach(el => {
    const id = Combatiente.identidadElemento(el, s.tipo);
    if(id && id.mult === 0){ out.push({tipo: 'inmune', clave: el, txt: `INMUNE ${DEBIL_NOMBRE_INM[el].toUpperCase()}`}); return; }
    if(id && id.mult > 1){ out.push({tipo: 'debil', clave: el, txt: `DÉBIL ${DEBIL_NOMBRE[el].toUpperCase()}`}); return; }
    const r = num(s.res[el]);
    if(r >= 99) out.push({tipo: 'inmune', clave: el, txt: `INMUNE ${DEBIL_NOMBRE_INM[el].toUpperCase()}`});
    else if(r < 0) out.push({tipo: 'debil', clave: el, txt: `DÉBIL ${DEBIL_NOMBRE[el].toUpperCase()}`});
    else if(r > 0) out.push({tipo: 'resistente', clave: el, txt: `RESISTENTE ${DEBIL_NOMBRE[el].toUpperCase()}`});
  });
  if(del.disparo && s.vuela) out.push({tipo: 'debil', clave: 'disparo', txt: 'DÉBIL A DISPAROS'});
  if(del.sagrado && oscura) out.push({tipo: 'debil', clave: 'sagrado', txt: 'DÉBIL A LO SAGRADO'});
  if(del.matabestias && s.tipo === 'bestia') out.push({tipo: 'debil', clave: 'matabestias', txt: 'DÉBIL (MATABESTIAS)'});
  return out;
}

// La marca persistente de un creep: [{el, tipo, sabido}] — el GM, todo (lo no descubierto, tenue); un jugador, lo revelado.
function debilMarcas(t){
  if(!t || t.tipo !== 'creep') return [];
  const s = debilSabido(t), out = [];
  DEBIL_ELS.forEach(el => {
    const id = Combatiente.identidadElemento(el, s.tipo);
    let tipo = id && id.mult === 0 ? 'inmune' : '';
    if(!tipo){ const r = num(s.res[el]); tipo = r >= 99 ? 'inmune' : r < 0 ? 'debil' : r > 0 ? 'resistente' : ''; }
    if(!tipo && id && id.mult > 1) tipo = 'debil';
    if(!tipo) return;
    const sabido = !s.todo || !!s.revelado[el] || !!(id && id.mult !== 1);   // lo de su tipo de criatura está a la vista
    out.push({el, tipo, sabido});
  });
  return out;
}

const debilEtiquetaDe = tipo => tipo === 'debil' ? 'débil' : tipo === 'resistente' ? 'resistente' : 'inmune';

// js/05, en cada token: la etiqueta mientras se apunta y la marca de abajo. → {debajo (la nueva, para lo que siga), animando}.
function debilDibujar(id, t, x, y, rad, z, debajo){
  const r = debilDibujar0(id, t, x, y, rad, z, debajo);
  return typeof r === 'number' ? {debajo: r, animando: false} : r;
}
function debilDibujar0(id, t, x, y, rad, z, debajo){
  if(!t) return debajo;
  // 1) La marca chiquita persistente (creeps).
  const marcas = debilMarcas(t);
  if(!marcas.length) debilCajas.delete(id);
  if(marcas.length){
    const tam = Math.max(11 / z, rad * 0.24);
    ctx.save();
    ctx.font = `700 ${tam}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Space Grotesk", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const piezas = marcas.map(m => ({...m, txt: debilIcono(m.el) + (m.tipo === 'inmune' ? '⛔' : DEBIL_FLECHA[m.tipo])}));
    const anchos = piezas.map(p => ctx.measureText(p.txt).width + 6 / z);
    const total = anchos.reduce((a, b) => a + b, 0) + (piezas.length - 1) * 2 / z;
    let cx = x - total / 2;
    const cy = debajo + tam * 0.75;
    const ahora = performance.now();
    debilCajas.set(id, {x0: cx, x1: cx + total, y0: cy - tam * 0.72, y1: cy + tam * 0.72, cuando: ahora});   // para el cartelito al pasar el mouse
    debilUltimoDibujo = ahora;
    piezas.forEach((p, i) => {
      const w = anchos[i];
      ctx.globalAlpha = p.sabido ? 1 : 0.45;
      ctx.fillStyle = 'rgba(15,12,14,.85)';
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(cx, cy - tam * 0.72, w, tam * 1.44, 3 / z); else ctx.rect(cx, cy - tam * 0.72, w, tam * 1.44); ctx.fill();
      ctx.strokeStyle = DEBIL_COLOR[p.tipo]; ctx.lineWidth = 1.5 / z; ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.fillText(p.txt, cx + w / 2, cy + tam * 0.06);
      cx += w + 2 / z;
    });
    ctx.restore();
    debajo = cy + tam * 0.8;
  }
  // 2) La etiqueta mientras se apunta.
  const ap = debilApuntando;
  if(ap){
    const activo = ap.area ? (!!elegirDestinoCb || !!lineaPreview) : !!(document.getElementById('duelo-objetivo') && !document.getElementById('duelo-objetivo').hidden);
    if(!activo){ if(ap.area) setTimeout(debilApuntarFin, 0); return debajo; }
    const propio = t.fichaId === ap.yo.ref && t.tipo === ap.yo.tipo;
    const candidato = !propio && (objetivosResaltados ? objetivosResaltados.has(id) : (ap.area ? true : dueloEsRival(ap.yo, t)));
    if(!candidato) return debajo;
    const lista = debilEvaluar(t, debilDelAtaque(ap.ataque, ap.yo));
    if(!lista.length) return debajo;
    const tam = Math.max(11 / z, rad * 0.26);
    ctx.save();
    ctx.font = `800 ${tam}px "Space Grotesk", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const pulso = 0.5 + 0.5 * Math.sin(performance.now() / 230);
    let yy = y - rad * 1.32 - tam * 0.2;
    lista.slice(0, 2).forEach(p => {
      const txt = `${debilIcono(p.clave)} ${p.txt}`;
      const w = ctx.measureText(txt).width + 10 / z, h = tam * 1.6;
      ctx.fillStyle = DEBIL_COLOR[p.tipo];
      ctx.globalAlpha = 0.85 + 0.15 * pulso;
      ctx.beginPath(); if(ctx.roundRect) ctx.roundRect(x - w / 2, yy - h / 2, w, h, 4 / z); else ctx.rect(x - w / 2, yy - h / 2, w, h); ctx.fill();
      ctx.strokeStyle = 'rgba(15,12,14,.9)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff';
      ctx.fillText(txt, x, yy + tam * 0.05);
      yy -= h + 2 / z;
    });
    ctx.restore();
    return {debajo, animando: true};
  }
  return debajo;
}

/* Revelar (solo el mapa del GM, desde dueloAplicarDano): `info` = {res, mult} con la resistencia que restó y el multiplicador de la identidad.
   La primera vez de ese elemento en ese creep: lo guarda y avisa a todos. */
async function debilRevelar(t, el, info){
  if(!soyGM || !t || t.tipo !== 'creep' || !el || !DEBIL_ELS.includes(el)) return;
  const res = num(info && info.res), mult = info && info.mult !== undefined ? num(info.mult) : 1;
  let tipo = '';
  if(mult === 0 || res >= 99) tipo = 'inmune';
  else if(res < 0) tipo = 'debil';
  else if(res > 0) tipo = 'resistente';
  if(!tipo) return;   // (el ×1,5 de la luz por el tipo de criatura ya está a la vista: no es un descubrimiento)
  const v = vinculo(t) || {}, prev = (v.revelado && v.revelado[el]) || '';
  if(prev === tipo) return;
  try{ await fbDb.doc(fbRutaCampana(`creeps/${t.fichaId}`)).set({revelado: {[el]: tipo}}, {merge: true}); }
  catch(err){ console.error('No se pudo guardar lo descubierto del creep:', err); return; }
  if(v.revelado) v.revelado = {...v.revelado, [el]: tipo}; else v.revelado = {[el]: tipo};
  const nom = nombreDe(t) || 'El creep';
  const titulo = `${debilIcono(el)} ¡${nom} es ${debilEtiquetaDe(tipo)} ${DEBIL_NOMBRE[el]}!`;
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'debil', icono: debilIcono(el), titulo, resultado: tipo === 'debil' ? 'Ese daño le entra de más. Queda marcado en su token.' : tipo === 'inmune' ? 'Ese daño no le hace nada. Queda marcado en su token.' : 'Ese daño le entra de menos. Queda marcado en su token.', estado: 'listo'});
  if(typeof mesaLinea === 'function') mesaLinea(`${titulo.replace('¡', '').replace('!', '')} (queda marcado en su token)`, 'recordatorio');
  pedirDibujo();
}

// La tarjeta 🪪 del creep: lo descubierto (y, el GM, todo y el botón para olvidarlo).
function debilTarjetaHtml(t){
  const marcas = debilMarcas(t);
  if(!marcas.length && !(soyGM && t && t.tipo === 'creep' && Object.keys((vinculo(t) || {}).revelado || {}).length)) return '';
  const fila = m => `<div class="hud-estado"${m.sabido ? '' : ' style="opacity:.5" title="Los jugadores todavía no lo descubrieron"'}><span class="nom">${debilIcono(m.el)} ${debilEtiquetaDe(m.tipo)} ${DEBIL_NOMBRE[m.el]}</span><span class="turnos">${m.sabido ? '' : 'oculto'}</span></div>`;
  const hay = Object.keys((vinculo(t) || {}).revelado || {}).length;
  return '<div class="hud-seccion"><h3>Débil / resistente</h3>' + marcas.map(fila).join('')
    + (soyGM && hay ? `<button type="button" class="hud-mini" data-debil-olvidar="${esc(t.fichaId)}" title="Borra lo que los jugadores descubrieron de este creep (vuelven a no verlo)">🙈 Olvidar lo descubierto</button>` : '')
    + '</div>';
}
document.addEventListener('click', async e => {
  const b = e.target.closest && e.target.closest('[data-debil-olvidar]');
  if(!b || !soyGM) return;
  e.preventDefault(); e.stopPropagation();
  const id = b.dataset.debilOlvidar;
  try{
    await fbDb.doc(fbRutaCampana(`creeps/${id}`)).update({revelado: firebase.firestore.FieldValue.delete()});
    const v = creepsPub.get(id); if(v) v.revelado = {};
    toast('Listo: los jugadores ya no ven lo descubierto de ese creep');
    if(typeof mesaLinea === 'function') mesaLinea(`🙈 El GM ocultó lo descubierto de ${(v && v.nombre) || 'un creep'}`, 'recordatorio');
    pedirDibujo();
  }catch(err){ console.error('No se pudo olvidar lo descubierto:', err); toast('No se pudo: ' + String((err && err.message) || err)); }
}, true);

/* 👆 Qué quiere decir la marca de abajo del token, al pasar el mouse (2026-11-05, dueño: «los iconitos debajo de los tokens asumo que son
   resistencias y debilidades, pero es poco claro, les agregaría una explicación con hover»). Cada dibujo guarda dónde quedó la marca de cada
   token (`debilCajas`, en coordenadas del mapa); vale solo la del último dibujo (un token que dejó de verse no deja su caja). */
const debilCajas = new Map();   // tokenId → {x0, x1, y0, y1, cuando}
let debilUltimoDibujo = 0;
const DEBIL_DANO = {fuego: 'de fuego', hielo: 'de hielo', rayo: 'eléctrico', toxico: 'tóxico', acido: 'de ácido', luz: 'de luz', siniestro: 'siniestro'};
let debilHoverId = null;
function debilHoverCaja(){
  let c = document.getElementById('hover-debil');
  if(c) return c;
  c = document.createElement('div');
  c.id = 'hover-debil';
  c.hidden = true;
  c.style.cssText = 'position:fixed;z-index:61;max-width:320px;pointer-events:none;background:rgba(20,16,20,.96);color:#EDE6DF;border:1px solid #4A3C43;'
    + 'border-radius:10px;padding:8px 10px;font:12px/1.35 "Space Grotesk",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.5)';
  document.body.appendChild(c);
  return c;
}
function debilHoverHtml(t){
  const marcas = debilMarcas(t);
  if(!marcas.length) return '';
  const que = {debil: 'le entra de más', resistente: 'le entra de menos', inmune: 'no le hace nada'};
  const etq = {debil: 'Débil', resistente: 'Resistente', inmune: 'Inmune'};
  const filas = marcas.map(m => `<div style="margin-top:5px${m.sabido ? '' : ';opacity:.6'}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${DEBIL_COLOR[m.tipo]};margin-right:6px;vertical-align:1px"></span>`
    + `${debilIcono(m.el)}${DEBIL_FLECHA[m.tipo]} <b>${etq[m.tipo]} ${DEBIL_NOMBRE[m.el]}</b>: el daño ${DEBIL_DANO[m.el]} ${que[m.tipo]}.`
    + (m.sabido ? '' : ' <i style="color:#B7A99F">(los jugadores todavía no lo descubrieron)</i>') + '</div>').join('');
  return `<div style="font-weight:700;color:#F0D27A">${esc(nombreDe(t))}</div>`
    + `<div style="color:#B7A99F;font-size:11px">▼ débil · ▲ resistente · ⛔ inmune</div>${filas}`;
}
function debilHoverOcultar(){ debilHoverId = null; const c = document.getElementById('hover-debil'); if(c) c.hidden = true; }
lienzo.addEventListener('pointermove', e => {
  if(e.buttons){ debilHoverOcultar(); return; }
  const {px, py} = posEvento(e);
  const m = pantallaAMundo(px, py);
  let id = null;
  for(const [k, b] of debilCajas){
    if(debilUltimoDibujo - b.cuando > 60 || !tokens.has(k)) continue;
    if(m.x >= b.x0 && m.x <= b.x1 && m.y >= b.y0 && m.y <= b.y1){ id = k; break; }
  }
  if(!id){ if(debilHoverId) debilHoverOcultar(); return; }
  const c = debilHoverCaja();
  if(id !== debilHoverId){
    const html = debilHoverHtml(tokens.get(id));
    if(!html){ debilHoverOcultar(); return; }
    c.innerHTML = html; debilHoverId = id;
  }
  c.hidden = false;
  const w = c.offsetWidth, h = c.offsetHeight;
  let x = e.clientX + 16, y = e.clientY + 16;
  if(x + w > innerWidth - 8) x = e.clientX - w - 12;
  if(y + h > innerHeight - 8) y = innerHeight - h - 8;
  c.style.left = Math.max(8, x) + 'px'; c.style.top = Math.max(8, y) + 'px';
});
['pointerleave', 'pointerdown', 'wheel'].forEach(ev => lienzo.addEventListener(ev, debilHoverOcultar, {passive: true}));
