/* 🕳 Bajo tierra (2026-10-13, dueño, el Kobold tunelero: «construyámoslo, ya queda como mecánica»).
   Una habilidad con `excavar: true` mete al token bajo tierra (campo `bajoTierra` del token, firestore.rules → tokenValido): en su casilla
   queda un pozo a la vista de todos, el token no se ve (el GM lo ve transparente, encima del pozo) y no se lo puede elegir de objetivo, ni
   le llega un área, un salto eléctrico ni un ataque de oportunidad (y moverse por abajo no da oportunidad). Una habilidad con
   `emerger` (un ataque con el arma) lo saca en la casilla donde está (desde el 2026-10-28; antes se elegía una a 4 o menos) y sigue el
   ataque, contra un rival pegado.
   Hoy lo usan los creeps (js/12, acEjecutarHab / acLanzarAtaqueDeHab); los personajes y las invocaciones, pendiente (docs/pendientes.md). */
const BAJO_TIERRA_DIST = 4;
function bajoTierra(t){ return !!(t && t.bajoTierra); }
function tokenEntradaCreep(creepId){ return [...tokens.entries()].find(([, x]) => x.tipo === 'creep' && x.fichaId === creepId) || null; }

// Excavar: el token queda bajo tierra (en su casilla, el pozo). → true si se guardó.
async function excavarToken(id){
  const t = tokens.get(id);
  if(!t) return false;
  t.bajoTierra = true;
  if(!soyGM && !puedoMover(t) && seleccion === id) seleccionar(null);   // (su dueño lo sigue teniendo elegido: lo mueve por abajo)
  pedirDibujo();
  try{
    await coleccionTokens().doc(id).update({bajoTierra: true});
    return true;
  }catch(err){
    t.bajoTierra = false; pedirDibujo();
    console.error('No se pudo meter el token bajo tierra:', err);
    toast(err && err.code === 'permission-denied' ? 'No se pudo meter bajo tierra: faltan pegar las reglas nuevas de Firestore (bajoTierra)' : 'No se pudo meter bajo tierra — revisá la consola');
    return false;
  }
}

// Emerger: o = {nombre, alSalir(), alCancelar()}. Sale en la casilla donde está (dueño, 2026-10-28: «que salga en la ubicación que está, no hasta 4
// casillas; si está adyacente a un rival, puede atacarle con el skill»): para salir en otro lado, primero se lo mueve por abajo. (`o.distancia` ya no se usa.)
async function emergerToken(id, o){
  const t = tokens.get(id);
  if(!t){ if(o.alCancelar) o.alCancelar(); return; }
  const h = {col: t.col, fila: t.fila};
  t.bajoTierra = false; t.rutaJson = '[]';
  estelas.delete(id); pedirDibujo();
  try{
    await coleccionTokens().doc(id).update({bajoTierra: firebase.firestore.FieldValue.delete(), ruta: firebase.firestore.FieldValue.delete()});
  }catch(err){
    t.bajoTierra = true; pedirDibujo();
    console.error('No se pudo sacar el token de abajo de la tierra:', err);
    toast('No se pudo salir de abajo de la tierra — sacalo a mano');
    if(o.alCancelar) o.alCancelar();
    return;
  }
  emergerPolvo(h, h);
  if(o.alSalir) o.alSalir();
}

/* 🕳 El montículo (dueño, 2026-10-29: «aunque esté quieto tres turnos y esté bajo tierra, tiene que haber un montículo de tierra donde está parado… en
   cuanto esté visible, se debe ver su montículo, que debe mantener el mismo estilo irregular y terroso de la estela»): en la casilla de cada token bajo
   tierra, mientras lo esté (con estela o sin ella), un montón de terrones desparejos con los colores y la forma de la estela (`tunelTramo`), un poco más
   alto en el medio. Lo ven todos los que verían esa casilla (antes era un pozo oscuro). */
function dibujarPozos(z){
  tokens.forEach(t => {
    if(!t.bajoTierra || (t.oculto && !soyGM)) return;
    if(!soyGM && !tokenVisiblePorNiebla(t)) return;
    if(!soyGM && nieblaAplica() && !nieblaVista.has(nbPack(t.col, t.fila))) return;   // en la niebla no se ve
    const c = hexCentro(t.col, t.fila), r = HEX * 0.55;
    const sem = (t.col * 73856093) ^ (t.fila * 19349663);
    const rnd = k => { let x = (sem + Math.imul(k + 7, 374761393)) | 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
    const terron = (x, y, rr, k) => {
      ctx.beginPath();
      for(let j = 0; j < 9; j++){
        const a = (j + rnd(k * 11 + j) * 0.6) * 2 * Math.PI / 9, rad = rr * (0.72 + 0.4 * rnd(k * 17 + j + 200));
        const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.85;
        if(j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
    };
    // Los terrones del montón: uno grande al medio y una ronda desareja alrededor (se sale un poquito del hexágono, como la estela).
    const monton = [{x: c.x, y: c.y, rr: r * 0.62}];
    for(let k = 0; k < 9; k++){
      const a = k * 2 * Math.PI / 9 + rnd(k + 20) * 0.5, d = r * (0.42 + 0.3 * rnd(k + 40));
      monton.push({x: c.x + Math.cos(a) * d, y: c.y + Math.sin(a) * d * 0.8, rr: r * (0.3 + 0.18 * rnd(k + 60))});
    }
    ctx.save();
    ctx.fillStyle = '#3f2a17'; monton.forEach((m, k) => terron(m.x, m.y, m.rr + r * 0.08, k));   // el borde oscuro
    ctx.fillStyle = '#6e4a2b'; monton.forEach((m, k) => terron(m.x, m.y, m.rr, k));              // la tierra
    // Lo de arriba del montón, más claro (la tierra levantada), y piedritas.
    for(let k = 0; k < 6; k++){
      ctx.fillStyle = rnd(k + 400) < 0.5 ? '#86603a' : '#7a5532';
      terron(c.x + (rnd(k + 500) - 0.5) * r * 0.7, c.y + (rnd(k + 600) - 0.5) * r * 0.5 - r * 0.08, r * (0.18 + 0.14 * rnd(k + 700)), k + 1000);
    }
    for(let i = 0; i < 8; i++){
      const a = rnd(i + 800) * 2 * Math.PI, d = r * (0.2 + 0.75 * rnd(i + 900));
      ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * d, c.y + Math.sin(a) * d * 0.8, r * (0.05 + 0.06 * rnd(i + 1000)), 0, 2 * Math.PI);
      ctx.fillStyle = i % 3 === 0 ? '#9a9187' : i % 3 === 1 ? '#8d6640' : '#4f3820'; ctx.fill();
    }
    ctx.restore();
  });
}

// Al salir: un estallido de tierra unos segundos en la casilla de salida (y el pozo vacío se cierra).
const efectosEmerger = [];
const EMERGER_FX_MS = 1800;
function emergerPolvo(pozo, salida){
  efectosEmerger.push({p: hexCentro(salida.col, salida.fila), desde: Date.now()});
  pedirDibujo();
}
function dibujarEfectosEmerger(z){
  const ahora = Date.now();
  let activo = false;
  for(let i = efectosEmerger.length - 1; i >= 0; i--){
    const fx = efectosEmerger[i], edad = ahora - fx.desde;
    if(edad > EMERGER_FX_MS){ efectosEmerger.splice(i, 1); continue; }
    const f = edad / EMERGER_FX_MS;
    ctx.save();
    for(let k = 0; k < 10; k++){
      const a = k * 2 * Math.PI / 10, d = HEX * (0.3 + 1.1 * f);
      ctx.beginPath(); ctx.arc(fx.p.x + Math.cos(a) * d, fx.p.y + Math.sin(a) * d * 0.8 - HEX * 0.4 * Math.sin(Math.PI * f), HEX * 0.09 * (1 - f * 0.6), 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${k % 2 ? '141,102,64' : '95,65,39'},${1 - f})`; ctx.fill();
    }
    ctx.restore();
    activo = true;
  }
  return activo;
}

/* 🕳 La estela del túnel (dueño, 2026-10-27, el Goblin tunelero: «mientras el chabón está enterrado, deja atrás una estela de tierra levantada, roquitas…
   que quede hasta el principio de su siguiente turno… cuando se va, van desapareciendo de a uno, de atrás para adelante, con cierta lentitud»; «está bien
   que la vean los jugadores… y cuando el GM la desplaza y la suelta, que la creación de la estela también sea de atrás para adelante, suave»).
   El token guarda `tunel` = [col, fila, col, fila…] (firestore.rules → tokenValido): lo que recorre bajo tierra (moverToken, js/07) y el tramo hasta donde
   sale (emergerToken). Lo borra el GM al empezar su próximo turno (turnoDeToken, js/04) o, sin orden de turnos, con el ⟳ de la ronda. Cada pantalla lo dibuja
   (`dibujarTuneles`, desde js/05): las casillas nuevas aparecen de a una, de la primera a la última; al borrarse, se van igual, de la más vieja a la más nueva. */
const TUNEL_MAX = 100, TUNEL_APARECE_MS = 160, TUNEL_SE_VA_MS = 320, TUNEL_FUNDIDO_MS = 650;
// La lista nueva (plana) con estas casillas al final, sin repetir la última; null si no hay nada nuevo.
function tunelSumar(t, celdas){
  const prev = Array.isArray(t.tunel) ? t.tunel.slice() : [];
  let cambio = false;
  (celdas || []).forEach(c => {
    const n = prev.length;
    if(n >= 2 && prev[n - 2] === c.col && prev[n - 1] === c.fila) return;
    prev.push(c.col, c.fila); cambio = true;
  });
  if(!cambio) return null;
  const lista = prev.slice(-TUNEL_MAX * 2);
  t.tunel = lista;
  return lista;
}
// Al soltar un token bajo tierra (js/07): el camino que hizo, sumado a su túnel (la casilla de partida incluida, si es el primer tramo).
function tunelTrasMover(t, celdas){
  if(!t || !t.bajoTierra || !celdas || celdas.length < 1) return null;
  return tunelSumar(t, celdas);
}
// El GM borra la estela (empieza su turno, o la ronda sin orden de turnos).
function tunelBorrar(id){
  const t = tokens.get(id);
  if(!t || !Array.isArray(t.tunel) || !t.tunel.length || !soyGM) return;
  t.tunel = null; pedirDibujo();
  coleccionTokens().doc(id).update({tunel: firebase.firestore.FieldValue.delete()}).catch(err => console.error('No se pudo borrar la estela del túnel:', err));
}
function tunelMantenimiento(){
  const enOrden = new Set(((typeof iniciativa !== 'undefined' && iniciativa && iniciativa.orden) || []).map(o => o.id));
  tokens.forEach((t, id) => { if(Array.isArray(t.tunel) && t.tunel.length && !enOrden.has(id)) tunelBorrar(id); });
}
// Lo que se ve: por token, cada casilla con cuándo aparece y, si se va, desde cuándo.
const tunelVista = new Map();   // id → {clave, cargado, celdas: [{col, fila, aparece, seVa}]}
function tunelSincronizar(){
  const ahora = Date.now();
  const irse = v => { let k = 0; v.celdas.forEach(c => { if(c.seVa === null) c.seVa = ahora + (k++) * TUNEL_SE_VA_MS; }); };
  tokens.forEach((t, id) => {
    const lista = Array.isArray(t.tunel) ? t.tunel : [], clave = lista.join(',');
    let v = tunelVista.get(id);
    if(!v){ v = {clave: '', cargado: false, celdas: []}; tunelVista.set(id, v); }
    if(v.clave === clave && v.cargado) return;
    const primera = !v.cargado; v.cargado = true; v.clave = clave;
    const vivas = v.celdas.filter(c => c.seVa === null);
    const nuevas = [];
    for(let i = 0; i + 1 < lista.length; i += 2) nuevas.push({col: lista[i], fila: lista[i + 1]});
    // ¿Es la misma estela, con casillas de más al final? Entonces aparecen solo las nuevas; si no, la vieja se va y la nueva aparece entera.
    const sigue = vivas.length <= nuevas.length && vivas.every((c, i) => c.col === nuevas[i].col && c.fila === nuevas[i].fila);
    if(!sigue) irse(v);
    const desde = sigue ? vivas.length : 0;
    nuevas.slice(desde).forEach((c, k) => v.celdas.push({col: c.col, fila: c.fila, aparece: primera ? 0 : ahora + k * TUNEL_APARECE_MS, seVa: null}));
  });
  tunelVista.forEach((v, id) => { if(!tokens.has(id)) irse(v); });
}
// El tramo de tierra removida de una casilla (dueño, 2026-10-27: «que no sean islas separadas sino una línea continua de tierra removida»; 2026-10-28: «se ve
// como con líneas rectas… que tenga unos bordes irregulares, como si fuera un montículo de tierra»): terrones desparejos encimados a lo largo del recorrido,
// de la mitad del paso anterior, por el centro de la casilla, a la mitad del siguiente (así los tramos se tocan), con la franja ondulando un poco.
// `fase`: 'borde' (lo oscuro de abajo), 'tierra' y 'detalle' (terrones claros y piedritas); se pinta cada fase en toda la estela antes de la siguiente,
// para que en las uniones el borde de un tramo no manche la tierra del otro. `ant` / `sig`: las casillas vecinas del recorrido (null en las puntas).
function tunelTramo(celda, ant, sig, r, alfa, fase){
  const c = hexCentro(celda.col, celda.fila);
  const mitad = o => { const p = hexCentro(o.col, o.fila); return {x: (p.x + c.x) / 2, y: (p.y + c.y) / 2}; };
  const pts = [ant ? mitad(ant) : null, c, sig ? mitad(sig) : null].filter(Boolean);
  const sem = (celda.col * 73856093) ^ (celda.fila * 19349663);
  const rnd = k => { let x = (sem + Math.imul(k + 1, 374761393)) | 0; x = Math.imul(x ^ (x >>> 13), 1274126177); return ((x ^ (x >>> 16)) >>> 0) / 4294967296; };
  // Puntos a lo largo del tramo (con un leve vaivén a los costados) y el tamaño de cada terrón.
  const largos = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y)), total = largos.reduce((a, b) => a + b, 0);
  const enRecorrido = (d, lado) => {
    let k = 0;
    while(k < largos.length - 1 && d > largos[k]){ d -= largos[k]; k++; }
    const a = pts[Math.min(k, pts.length - 1)], b = pts[Math.min(k + 1, pts.length - 1)], l = largos[k] || 1;
    const ux = (b.x - a.x) / l, uy = (b.y - a.y) / l;
    return {x: a.x + ux * d - uy * lado, y: a.y + uy * d + ux * lado};
  };
  // Ancho y vaivén irregulares (dueño, 2026-10-28: «por momentos más ancho, por momentos menos… que inclusive se salga un poquito del hexágono y vuelva
  // a entrar»): ondas suaves según el lugar del mapa, así cambian de a poco y empalman entre una casilla y la siguiente (la mitad del paso es la misma).
  const ancho = (x, y) => { const u = x / HEX, v = y / HEX; return 0.5 + 0.3 * Math.sin(u * 1.9 + v * 1.1 + 1.3) + 0.2 * Math.sin(-u * 0.8 + v * 2.7 + 4.1); };   // 0 a 1
  const vaiven = (x, y) => { const u = x / HEX, v = y / HEX; return 0.6 * Math.sin(u * 1.4 - v * 0.9 + 0.7) + 0.4 * Math.sin(u * 2.6 + v * 2.1 + 2.9); };   // −1 a 1
  const n = total > 0 ? Math.max(3, Math.round(total / (r * 0.15))) : 0;
  const muestras = total > 0 ? Array.from({length: n + 1}, (_, i) => {
    const base = enRecorrido(total * i / n, 0);
    return {...enRecorrido(total * i / n, vaiven(base.x, base.y) * r * 0.85), rr: r * (0.2 + 0.48 * ancho(base.x, base.y)) * (0.9 + 0.2 * rnd(i + 50))};
  }) : [{x: c.x, y: c.y, rr: r * 0.45}];
  const terron = (x, y, rr, k) => {
    ctx.beginPath();
    for(let j = 0; j < 9; j++){
      const a = (j + rnd(k * 11 + j) * 0.6) * 2 * Math.PI / 9, rad = rr * (0.72 + 0.4 * rnd(k * 17 + j + 200));
      const px = x + Math.cos(a) * rad, py = y + Math.sin(a) * rad * 0.85;
      if(j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  };
  ctx.save();
  ctx.globalAlpha = alfa;
  if(fase === 'borde'){ ctx.fillStyle = '#3f2a17'; muestras.forEach((m, k) => terron(m.x, m.y, m.rr + r * 0.08, k)); }
  else if(fase === 'tierra'){ ctx.fillStyle = '#6e4a2b'; muestras.forEach((m, k) => terron(m.x, m.y, m.rr, k)); }
  else{
    // Terrones más claros encima (la tierra levantada) y piedritas a los costados.
    muestras.forEach((m, k) => {
      if(rnd(k + 300) < 0.45){
        ctx.fillStyle = rnd(k + 400) < 0.5 ? '#86603a' : '#7a5532';
        terron(m.x + (rnd(k + 500) - 0.5) * m.rr, m.y + (rnd(k + 600) - 0.5) * m.rr * 0.8, m.rr * (0.28 + 0.2 * rnd(k + 700)), k + 1000);
      }
    });
    for(let i = 0; i < 7; i++){
      const d = total * rnd(i + 800), base = total > 0 ? enRecorrido(d, 0) : c;   // (sobre la zanja, que va y viene)
      const q = total > 0 ? enRecorrido(d, vaiven(base.x, base.y) * r * 0.85 + (rnd(i + 900) - 0.5) * r * (0.3 + 0.7 * ancho(base.x, base.y)))
        : {x: c.x + (rnd(i + 800) - 0.5) * r * 0.6, y: c.y + (rnd(i + 900) - 0.5) * r * 0.5};
      ctx.beginPath(); ctx.arc(q.x, q.y, r * (0.05 + 0.06 * rnd(i + 1000)), 0, 2 * Math.PI);
      ctx.fillStyle = i % 3 === 0 ? '#9a9187' : i % 3 === 1 ? '#8d6640' : '#4f3820'; ctx.fill();
    }
  }
  ctx.restore();
}
// → true si hay algo apareciendo o yéndose (hay que seguir animando).
function dibujarTuneles(z){
  tunelSincronizar();
  const ahora = Date.now(), r = HEX * 0.55;
  let anima = false;
  const tramos = [];
  tunelVista.forEach((v, id) => {
    const t = tokens.get(id);
    for(let i = v.celdas.length - 1; i >= 0; i--){
      const c = v.celdas[i];
      if(c.seVa !== null && ahora - c.seVa >= TUNEL_FUNDIDO_MS) v.celdas.splice(i, 1);
    }
    if(t && t.oculto && !soyGM) return;   // un token oculto no delata su túnel
    // Las vecinas del recorrido que se tocan (una casilla de distancia); la siguiente, recién cuando ya apareció (la zanja crece de a una).
    const pegada = (a, b) => a && b && distanciaHex(a, b) === 1;
    v.celdas.forEach((c, i) => {
      if(ahora < c.aparece){ anima = true; return; }
      const ant = pegada(v.celdas[i - 1], c) ? v.celdas[i - 1] : null;
      const sig = pegada(c, v.celdas[i + 1]) && ahora >= v.celdas[i + 1].aparece ? v.celdas[i + 1] : null;
      if(nieblaAplica() && !nieblaVista.has(nbPack(c.col, c.fila))) return;   // en la niebla no se ve
      let alfa = Math.min(1, (ahora - c.aparece) / 280);
      if(alfa < 1) anima = true;
      if(c.seVa !== null){
        anima = true;
        if(ahora >= c.seVa) alfa *= Math.max(0, 1 - (ahora - c.seVa) / TUNEL_FUNDIDO_MS);
      }
      if(alfa > 0) tramos.push([c, ant, sig, r, alfa]);
    });
  });
  ['borde', 'tierra', 'detalle'].forEach(f => tramos.forEach(x => tunelTramo(...x, f)));
  return anima;
}

/* 🕳 Salir o atacar desde abajo (dueño, 2026-10-28, P231: «mientras esté bajo tierra, tiene que aparecer un botoncito flotante, más o menos donde aparece el botón
   de limpiar dados, que diga salir; y si está adyacente a un enemigo, dos botones: salir o atacar»). Uno por token bajo tierra que maneja esta pantalla (el GM, sus
   creeps; un jugador, su personaje). «Salir» lo saca en su casilla, sin costo y sin atacar; «Atacar» es la habilidad Excavar de nuevo (sale y apuñala). */
function bajoTierraMios(){
  const out = [];
  tokens.forEach((t, id) => {
    if(!t || !t.bajoTierra) return;
    if(t.tipo === 'creep' ? !soyGM : !(t.tipo === 'pj' && !String(t.fichaId || '').includes(SEP_INVOCACION) && puedoMover(t))) return;
    const pegado = rivalesDe(t).some(r => !r.bajoTierra && distanciaHex({col: t.col, fila: t.fila}, {col: r.col, fila: r.fila}) === 1);
    out.push({id, t, pegado});
  });
  return out;
}
let bajoTierraBotonesFirma = '';
function renderBajoTierraBotones(){
  const lista = typeof modoMapa !== 'undefined' ? bajoTierraMios() : [];
  const limpiar = document.getElementById('dados-limpiar');
  const firma = lista.map(x => `${x.id}:${x.pegado ? 1 : 0}:${nombreDe(x.t)}`).join('|') + (limpiar ? '#d' : '');
  let caja = document.getElementById('bajo-tierra-botones');
  if(!lista.length){ if(caja) caja.remove(); bajoTierraBotonesFirma = ''; return; }
  if(caja && firma === bajoTierraBotonesFirma) return;
  bajoTierraBotonesFirma = firma;
  if(!caja){
    caja = document.createElement('div');
    caja.id = 'bajo-tierra-botones';
    caja.addEventListener('click', ev => {
      const b = ev.target.closest('button[data-bt]');
      if(!b) return;
      const [que, id] = b.dataset.bt.split('|');
      if(que === 'salir') bajoTierraSalir(id); else bajoTierraAtacar(id);
    });
    document.body.appendChild(caja);
  }
  // Como el 🧹 Limpiar dados (comun/dados3d.js): abajo, sobre el mapa, pegado al panel de la Mesa; si está ese botón, justo encima.
  const panel = document.querySelector('aside');
  const r = panel && panel.offsetParent !== null ? panel.getBoundingClientRect() : null;
  const derecha = r && r.left > innerWidth / 2 && r.height > innerHeight / 2 ? Math.round(innerWidth - r.left + 16) : 24;
  caja.style.cssText = `position:fixed;right:${derecha}px;bottom:${limpiar ? 64 : 20}px;z-index:100000;display:flex;flex-direction:column;gap:6px;align-items:flex-end`;
  const est = 'border-radius:10px;padding:7px 12px;font:600 13px system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.5)';
  caja.innerHTML = lista.map(x => `<div style="display:flex;gap:6px;align-items:center">
      <span style="background:#2a1d12;color:#e8d3b0;border:1px solid #7a5532;border-radius:10px;padding:6px 10px;font:600 12px system-ui,sans-serif">🕳 ${esc(nombreDe(x.t))}</span>
      <button type="button" data-bt="salir|${esc(x.id)}" title="Sale en su casilla, sin atacar" style="${est};background:#5f4127;color:#f6ead2;border:1px solid #a07a4f">⬆ Salir</button>
      ${x.pegado ? `<button type="button" data-bt="atacar|${esc(x.id)}" title="Sale y apuñala a un rival pegado (la habilidad Excavar)" style="${est};background:#8a2f2f;color:#fff;border:1px solid #d47a6a">⚔ Atacar</button>` : ''}
    </div>`).join('');
}
setInterval(() => { try{ renderBajoTierraBotones(); }catch(e){} }, 700);
function bajoTierraSalir(id){
  const t = tokens.get(id);
  if(!t || !t.bajoTierra) return;
  emergerToken(id, {nombre: 'Salir', alSalir: () => { mesaLinea(`🕳 ${nombreDe(t)} sale de abajo de la tierra (sin atacar)`, 'recordatorio'); renderBajoTierraBotones(); }});
}
// La habilidad que lo saca atacando: la de Excavar (`excavar` + `emerger`) o, si no, la que tenga `emerger`.
const habEmerger = lista => (lista || []).find(h => h && h.excavar && h.emerger) || (lista || []).find(h => h && h.emerger) || null;
async function bajoTierraAtacar(id){
  const t = tokens.get(id);
  if(!t || !t.bajoTierra) return;
  if(t.tipo === 'creep'){
    const sc = creepPrivadoDe(String(t.fichaId)), h = sc && habEmerger(sc.habilidades);
    if(!h){ toast(`${nombreDe(t)} no tiene una habilidad para salir atacando: usá ⬆ Salir`); return; }
    if(!(typeof ac !== 'undefined' && ac && ac.creepId === sc.id && !ac.host.hidden)) await abrirAccionesNuevas(sc.id);
    acEjecutarHab(sc, h.id);
    return;
  }
  // Un personaje: su Botonera, y la habilidad desde ahí (FichaAcciones.ejecutarHabilidad; elige el arma si tiene más de una).
  const fichaId = String(t.fichaId);
  if(!(typeof bn !== 'undefined' && bn && bn.fichaId === fichaId && !bn.host.hidden)) abrirBotonera(fichaId);
  for(let i = 0; i < 60 && !(typeof bn !== 'undefined' && bn && bn.fichaId === fichaId && bn.S && bn.sesion && bn.sesion.cargada); i++) await new Promise(r => setTimeout(r, 250));
  if(!(bn && bn.fichaId === fichaId && bn.S)){ toast('No se pudo abrir la Botonera'); return; }
  const h = habEmerger(bn.S.habilidades);
  if(!h){ toast(`${nombreDe(t)} no tiene Excavar: usá ⬆ Salir`); return; }
  FichaAcciones.ejecutarHabilidad(bn.S, h.id, undefined, false, bnHabUi());
}
