/* 🕳 Bajo tierra (2026-10-13, dueño, el Kobold tunelero: «construyámoslo, ya queda como mecánica»).
   Una habilidad con `excavar: true` mete al token bajo tierra (campo `bajoTierra` del token, firestore.rules → tokenValido): en su casilla
   queda un pozo a la vista de todos, el token no se ve (el GM lo ve transparente, encima del pozo) y no se lo puede elegir de objetivo, ni
   le llega un área, un salto eléctrico ni un ataque de oportunidad (y moverse por abajo no da oportunidad). Una habilidad con
   `emerger: {distancia}` (un ataque con el arma) lo saca: se elige una casilla libre a esa distancia o menos del pozo, el token aparece
   ahí y sigue el ataque. Si se cancela la salida, sigue bajo tierra (lo cobrado, cobrado: se arregla a mano).
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

// Emerger: o = {distancia, nombre, alSalir(), alCancelar()}. Se elige la casilla de salida (libre, a `distancia` o menos del pozo).
function emergerToken(id, o){
  const t = tokens.get(id);
  if(!t){ if(o.alCancelar) o.alCancelar(); return; }
  const dist = Math.max(1, Math.round(num(o.distancia)) || BAJO_TIERRA_DIST);
  const pozo = {col: t.col, fila: t.fila}, nom = esc(o.nombre || 'Emerger');
  const pedir = () => elegirDestino(async h => {
    if(distanciaHex(h, pozo) > dist){ toast(`Tiene que salir a ${dist} casillas o menos del pozo`); pedir(); return; }
    if(elementoSolidoEn(h.col, h.fila) || [...tokens.entries()].some(([k, x]) => k !== id && x.col === h.col && x.fila === h.fila)){ toast('Esa casilla no está libre: elegí otra'); pedir(); return; }
    const antes = {col: t.col, fila: t.fila, bajoTierra: true, rutaJson: t.rutaJson};
    t.col = h.col; t.fila = h.fila; t.bajoTierra = false; t.rutaJson = '[]';
    estelas.delete(id); pedirDibujo();
    try{
      await coleccionTokens().doc(id).update({col: h.col, fila: h.fila, bajoTierra: firebase.firestore.FieldValue.delete(), ruta: firebase.firestore.FieldValue.delete()});
    }catch(err){
      Object.assign(t, antes); pedirDibujo();
      console.error('No se pudo sacar el token de abajo de la tierra:', err);
      toast('No se pudo salir de abajo de la tierra — movelo a mano');
      if(o.alCancelar) o.alCancelar();
      return;
    }
    emergerPolvo(pozo, h);
    if(o.alSalir) o.alSalir();
  }, `<b>🕳 ${nom}: ¿por dónde sale ${esc(nombreDe(t))}?</b> <span>clic en una casilla libre a ${dist} o menos del pozo · Esc o clic derecho cancelan (sigue bajo tierra)</span>`, true,
    () => { toast(`${nombreDe(t)} sigue bajo tierra`); if(o.alCancelar) o.alCancelar(); });
  pedir();
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
