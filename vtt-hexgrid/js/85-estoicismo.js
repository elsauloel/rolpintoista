// js/85-estoicismo.js — 🗿 Estoicismo (2026-10-30, dueño: el Warrior, «una especie de estado estoico en el que se te suba automáticamente la defensa por
// cada enemigo adyacente mientras el estado esté activo»; «sin tope, y lo que cuenta como enemigo es lo que vos sugerís»).
// Mientras tenga el estado (preset con `estoico`, comun/estados-presets.js), +N a la Defensa por cada rival pegado, contado en el momento del golpe: lo
// suma el daño (js/10, junto al Muro de escudos) y sale en el desglose de la Defensa. Cuentan solo los rivales que se ven: ni ocultos, ni en sigilo, ni
// bajo tierra, ni etéreos, ni muertos, ni las estructuras (estandartes, tótems).
// Lo que se ve (dueño, el mismo día: «al activar el estoicismo, al jugador le debe aparecer una notificación… Aplicar, resolver a mano… cada vez que esto
// se modifica vuelve a aparecer… desde afuera, una animación: +2 con un escudito en verde flotando hacia arriba, −2 en rojo hacia abajo; que lo vean los
// aliados y los rivales»): cada pantalla mira lo público (como las flechitas, js/75): al activarse y cada vez que cambia la cuenta, quien lo maneja
// recibe el Aviso (`estoicoAvisar`) y todos ven el ±N sobre el token (`estoicoDibujar`, en el recorrido de los tokens que se ven: no delata a nadie).
// No anima ni avisa lo que ya estaba al cargar el mapa.

const ESTOICO_POR = 2;
const ESTOICO_MS = 2300;

function estoicoRivales(t){
  if(!t || t.col === undefined || t.fila === undefined) return [];
  const out = [];
  tokens.forEach((x, id) => {
    if(!x || x === t || !x.fichaId || bandoDe(x) === bandoDe(t) || x.col === undefined) return;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: x.col, fila: x.fila}) !== 1) return;
    if(x.oculto || x.bajoTierra || enSigilo(x) || (typeof etereoDe === 'function' && etereoDe(x)) || (typeof estandarteInfo === 'function' && estandarteInfo(x))) return;
    const e = estadoDe(x);
    if(e && e.muerto) return;
    out.push({id, t: x});
  });
  return out;
}
const estoicoEstado = estados => (estados || []).find(s => s && s.activo !== false && (num(s.estoico) > 0 || String(s.nombre || '').trim().toLowerCase() === 'estoicismo'));
// ¿Tiene Estoicismo activo? → {val, n} (n = rivales pegados) o null. `n` se cuenta antes (estoicoRivales) y los estados son los de adentro de la transacción.
function estoicoDe(estados, n){
  const e = estoicoEstado(estados);
  if(!e || !(n > 0)) return null;
  return {val: (num(e.estoico) || ESTOICO_POR) * n, n};
}

// El bono de ahora mismo de un token, para mostrarlo (la ficha lite y la Botonera; el golpe lo vuelve a contar en su momento): {val, n} o null.
function estoicoAhora(t){
  const e = t && estadoDe(t);
  return e && !e.muerto ? estoicoDe(e.estados, estoicoRivales(t).length) : null;
}
// El token de un personaje o una invocación (tipo 'pj', «ficha~inv») o de un creep (tipo 'creep', su id).
const estoicoToken = (tipo, fichaId) => [...tokens.values()].find(x => x && x.tipo === tipo && x.fichaId === fichaId) || null;
// Cambió la cuenta: las ventanas abiertas que la muestran se redibujan (un rival que se mueve no les llega por otro lado).
function estoicoRefrescar(){
  try{ if(typeof flDibujar === 'function') flDibujar(); }catch(err){}
  try{ if(typeof bn !== 'undefined' && bn && bn.host && !bn.host.hidden && typeof bnDibujar === 'function') bnDibujar(); }catch(err){}
}

const estoicoPrevios = new Map();   // id del token → {clave, activo, ids: [rivales pegados]}
const estoicoAnims = new Map();     // id del token → [{delta, inicio}]
const estoicoCallados = new Set();  // ids de los tokens cuyo Aviso se pidió no volver a mostrar (hasta que se termine el estado)
// ¿Este token lo maneja esta pantalla? (el personaje o su invocación: quien lo controla; un creep: el GM)
const estoicoMio = t => t.tipo === 'creep' ? soyGM : (t.tipo === 'pj' && typeof bnManejo === 'function' && bnManejo(String(t.fichaId || '').split(SEP_INVOCACION)[0]));

// Una vez por dibujo (js/05, antes de los tokens).
function estoicoRevisar(){
  tokens.forEach((t, id) => {
    const est = estadoDe(t);
    if(!est) return;
    const clave = (t.tipo || '') + ':' + (t.fichaId || '');
    const e = est.muerto ? null : estoicoEstado(est.estados);
    const ids = e ? estoicoRivales(t).map(r => r.id).sort() : [];
    const previo = estoicoPrevios.get(id);
    estoicoPrevios.set(id, {clave, activo: !!e, ids});
    if(!previo || previo.clave !== clave) return;   // recién aparece o cambió de vínculo: solo se anota
    const por = e ? (num(e.estoico) || ESTOICO_POR) : ESTOICO_POR;
    if(!e){
      if(previo.activo && previo.ids.length){ estoicoAnimar(id, -por * previo.ids.length); estoicoRefrescar(); }   // se terminó: se va lo que daba
      estoicoCallados.delete(id);   // al volver a activarse, el Aviso vuelve a aparecer
      return;
    }
    const llegan = ids.filter(x => !previo.ids.includes(x)), seVan = previo.ids.filter(x => !ids.includes(x));
    if(previo.activo && !llegan.length && !seVan.length) return;
    const delta = previo.activo ? por * (ids.length - previo.ids.length) : por * ids.length;
    if(delta) estoicoAnimar(id, delta);
    estoicoRefrescar();
    if(!previo.activo) estoicoCallados.delete(id);
    if(estoicoMio(t) && !estoicoCallados.has(id)) estoicoAvisar(id, t, {nuevo: !previo.activo, llegan, seVan, ids, n: ids.length, por});
  });
  estoicoPrevios.forEach((_, id) => { if(!tokens.has(id)){ estoicoPrevios.delete(id); estoicoAnims.delete(id); } });
}
function estoicoAnimar(id, delta){
  const l = estoicoAnims.get(id) || [];
  l.push({delta, inicio: performance.now()});
  estoicoAnims.set(id, l);
  try{ pedirDibujo(); }catch(err){}
}
// El Aviso para quien lo maneja (dueño: «Aplicar, resolver a mano: que resolver a mano básicamente no cambia nada, pero el anuncio está»). Uno por
// token (`clave`): si cambia de nuevo con el Aviso abierto, se redibuja en el lugar.
function estoicoAvisar(id, t, c){
  if(typeof AvisoCombate === 'undefined') return;
  const nom = ids => ids.map(x => tokens.get(x)).filter(Boolean).map(nombreDe).join(', ');
  const total = c.por * c.n, enem = n => `${n} enemigo${n === 1 ? '' : 's'} pegado${n === 1 ? '' : 's'}`;
  const pasos = [];
  if(c.nuevo) pasos.push({titulo: 'Estoicismo', texto: `Hasta el final de tu próximo turno: +${c.por} a la Defensa por cada enemigo pegado (los que se ven), contado en cada golpe, sin tope.`});
  if(!c.nuevo && c.llegan.length) pasos.push({titulo: `Se suma${c.llegan.length === 1 ? '' : 'n'}: +${c.por * c.llegan.length} a la Defensa`, texto: nom(c.llegan)});
  if(!c.nuevo && c.seVan.length) pasos.push({titulo: `Se aleja${c.seVan.length === 1 ? '' : 'n'}: −${c.por * c.seVan.length} a la Defensa`, texto: nom(c.seVan)});
  const totalTxt = c.n ? `Tenés ${enem(c.n)} (${nom(c.ids)}): +${total} a la Defensa.` : 'No tenés ningún enemigo pegado: por ahora, +0 a la Defensa.';
  // «No volver a mostrar» (dueño, el mismo día: «puede llegar a ser un poco molesta… durante la duración, no volver a mostrarla; cuando se termina
  // el estado y se vuelve a activar, que vuelva a aparecer»): se calla hasta que se termina el estado (estoicoRevisar lo olvida ahí). La animación sigue.
  pasos.push({titulo: 'Total', html: `${esc(totalTxt)}<label style="display:flex;gap:8px;align-items:center;margin-top:10px;font-size:13px;opacity:.9;cursor:pointer">
    <input type="checkbox" id="estoico-callar" style="width:16px;height:16px;margin:0"> No volver a mostrar mientras dure este Estoicismo</label>`});
  AvisoCombate.mostrar({clave: 'estoico-' + id, icono: '🗿', titulo: `${nombreDe(t)}: Estoicismo`, pasos,
    veredicto: {tono: 'bueno', grande: `+${total} 🛡`, chico: enem(c.n)},
    botones: [{texto: '✔ Aplicar', alClic: () => AvisoCombate.cerrar()},
      {texto: '✋ Resolver a mano', sec: true, titulo: 'No cambia nada: el golpe igual suma el bono; la mesa decide si hay algo excepcional', alClic: () => AvisoCombate.cerrar()}]});
  const casilla = document.getElementById('estoico-callar');
  if(casilla) casilla.onchange = () => { if(casilla.checked) estoicoCallados.add(id); else estoicoCallados.delete(id); };
}
// En el recorrido de los tokens que se ven (js/05): el ±N con el escudito, verde subiendo o rojo bajando. Devuelve true mientras siga animando.
function estoicoDibujar(id, x, y, rad, z){
  const l = estoicoAnims.get(id);
  if(!l || !l.length) return false;
  const ahora = performance.now();
  const vivos = l.filter(a => ahora - a.inicio < ESTOICO_MS);
  if(!vivos.length){ estoicoAnims.delete(id); return false; }
  estoicoAnims.set(id, vivos);
  ctx.save();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  vivos.forEach((a, i) => {
    const f = (ahora - a.inicio) / ESTOICO_MS, sube = a.delta > 0;
    const alfa = f < 0.15 ? f / 0.15 : f > 0.7 ? (1 - f) / 0.3 : 1;
    const yy = sube ? y - rad * (0.2 + 1.5 * f) : y - rad * 1.4 + rad * 1.7 * f;   // el +N sube desde el token; el −N baja desde arriba
    const xx = x + (i % 2 ? rad * 0.35 : 0);
    const tam = Math.max(16 / z, rad * 0.75);
    const txt = `${sube ? '+' : '−'}${Math.abs(a.delta)}`;
    ctx.globalAlpha = Math.max(0, alfa);
    ctx.font = `800 ${tam}px system-ui, sans-serif`;
    const ancho = ctx.measureText(txt).width, esc = tam * 0.95;
    const tx = xx - esc * 0.55, ex = xx + ancho / 2 + esc * 0.05;
    ctx.lineWidth = Math.max(3 / z, tam * 0.16); ctx.strokeStyle = 'rgba(10,8,12,.9)'; ctx.lineJoin = 'round';
    ctx.strokeText(txt, tx, yy);
    ctx.fillStyle = sube ? '#5FDC8C' : '#F0525C';
    ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 8 / z;
    ctx.fillText(txt, tx, yy);
    ctx.shadowBlur = 0;
    ctx.font = `${esc}px system-ui, "Segoe UI Emoji", sans-serif`;
    ctx.fillText('🛡', ex, yy);
  });
  ctx.restore();
  return true;
}
