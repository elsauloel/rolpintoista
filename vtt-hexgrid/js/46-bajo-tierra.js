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
  if(!soyGM && seleccion === id) seleccionar(null);
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

// El pozo: tierra removida y un agujero oscuro, en la casilla de cada token bajo tierra (lo ven todos los que verían el token).
function dibujarPozos(z){
  tokens.forEach(t => {
    if(!t.bajoTierra || (t.oculto && !soyGM)) return;
    if(!soyGM && !tokenVisiblePorNiebla(t)) return;
    const c = hexCentro(t.col, t.fila), r = HEX * 0.62;
    ctx.save();
    ctx.beginPath(); ctx.ellipse(c.x, c.y + r * 0.06, r, r * 0.78, 0, 0, 2 * Math.PI);
    ctx.fillStyle = '#7a5532'; ctx.fill();
    ctx.lineWidth = 2 / z; ctx.strokeStyle = '#4a321c'; ctx.stroke();
    // terrones alrededor
    for(let i = 0; i < 7; i++){
      const a = i * 2 * Math.PI / 7 + 0.4, rr = r * (0.9 + 0.12 * ((i * 37) % 5) / 5);
      ctx.beginPath(); ctx.arc(c.x + Math.cos(a) * rr, c.y + r * 0.06 + Math.sin(a) * rr * 0.78, r * (0.1 + 0.03 * (i % 3)), 0, 2 * Math.PI);
      ctx.fillStyle = i % 2 ? '#8d6640' : '#5f4127'; ctx.fill();
    }
    const g = ctx.createRadialGradient(c.x, c.y + r * 0.12, 0, c.x, c.y + r * 0.12, r * 0.68);
    g.addColorStop(0, '#000'); g.addColorStop(0.7, '#160d06'); g.addColorStop(1, '#3a2615');
    ctx.beginPath(); ctx.ellipse(c.x, c.y + r * 0.12, r * 0.66, r * 0.48, 0, 0, 2 * Math.PI);
    ctx.fillStyle = g; ctx.fill();
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
// El tramo de tierra removida de una casilla (dueño, 2026-10-27: «que no sean islas separadas sino una línea continua de tierra removida»): de la mitad
// del paso anterior, por el centro de la casilla, a la mitad del siguiente, así los tramos se tocan y forman una zanja. Borde oscuro, lomo más claro y
// piedritas a lo largo (fijas para cada casilla). `ant` / `sig`: las casillas vecinas del recorrido (null en las puntas).
function tunelTramo(celda, ant, sig, r, alfa){
  const c = hexCentro(celda.col, celda.fila);
  const mitad = o => { const p = hexCentro(o.col, o.fila); return {x: (p.x + c.x) / 2, y: (p.y + c.y) / 2}; };
  const pts = [ant ? mitad(ant) : null, c, sig ? mitad(sig) : null].filter(Boolean);
  const sem = Math.abs((celda.col * 73856093) ^ (celda.fila * 19349663));
  const rnd = k => ((sem >> (k % 16)) % 97) / 97;
  ctx.save();
  ctx.globalAlpha = alfa;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const trazo = (color, ancho) => {
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    if(pts.length === 1) ctx.lineTo(c.x + 0.01, c.y); else pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.stroke();
  };
  trazo('#3f2a17', r * 0.95);   // el borde
  trazo('#6e4a2b', r * 0.78);   // la tierra
  trazo('#86603a', r * 0.28);   // el lomo
  // Piedritas a lo largo del tramo, a un lado y al otro.
  const largos = pts.slice(1).map((p, i) => Math.hypot(p.x - pts[i].x, p.y - pts[i].y)), total = largos.reduce((a, b) => a + b, 0);
  for(let i = 0; i < 7; i++){
    let d = total * rnd(i + 1), k = 0;
    while(k < largos.length - 1 && d > largos[k]){ d -= largos[k]; k++; }
    const a = pts[Math.min(k, pts.length - 1)], b = pts[Math.min(k + 1, pts.length - 1)], l = largos[k] || 1;
    const ux = (b.x - a.x) / l, uy = (b.y - a.y) / l, lado = (rnd(i + 5) - 0.5) * r * 0.62;
    const x = a.x + ux * d - uy * lado, y = a.y + uy * d + ux * lado;
    ctx.beginPath(); ctx.arc(x, y, r * (0.06 + 0.06 * rnd(i + 11)), 0, 2 * Math.PI);
    ctx.fillStyle = i % 3 === 0 ? '#9a9187' : i % 3 === 1 ? '#8d6640' : '#4f3820'; ctx.fill();
  }
  ctx.restore();
}
// → true si hay algo apareciendo o yéndose (hay que seguir animando).
function dibujarTuneles(z){
  tunelSincronizar();
  const ahora = Date.now(), r = HEX * 0.55;
  let anima = false;
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
      if(alfa > 0) tunelTramo(c, ant, sig, r, alfa);
    });
  });
  return anima;
}
