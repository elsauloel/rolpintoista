// js/76-dash.js — 💨 El Dash (2026-10-26, dueño; el del Asalto y su versión de creep, Choque liviano).
// Se elige hacia dónde (una de las 6 direcciones, con un clic hacia ese lado) y avanza `casillas` (3) en línea recta, gratis y sin ataques de
// oportunidad. Puede atravesar a UN rival: entonces avanza una casilla más y le pega al pasar (el duelo, con el ataque de la habilidad). Lo frenan los
// Sólidos, las paredes y un segundo token; nunca termina encima de nadie. Si el rival para el golpe con Parry (o lo bloquea), el Dash se corta: se queda
// en la casilla de antes del rival (dueño: «lo que se interrumpe es el movimiento»). El ataque cobra sus No2 solo si hay ataque (quien lo usa: `atacar`).
// Lo usan las Acciones de un creep (js/12, `ui.dash`) y la Botonera de un personaje (js/11, el mensaje 'dash-habilidad').
const dashPendientes = new Map();   // id del token que hace el Dash → {rivalId, fin, nombre}

// El camino en la dirección `dir` (de VECINO_LADO): → {celdas, rival: [id, t] | null, antes, fin}.
function dashCamino(origen, dir, casillas, tYo){
  const c0 = hexACubo(origen);
  let q = c0.q, r = c0.r, max = casillas, prev = {col: origen.col, fila: origen.fila}, fin = {...prev}, rival = null, antes = null;
  const celdas = [];
  for(let i = 0; i < max && i < 8; i++){
    q += dir[0]; r += dir[1];
    const c = {col: cuboACol(q, r), fila: cuboAFila(q, r)};
    if(elementoSolidoEn(c.col, c.fila) || (typeof paredCorta === 'function' && paredCorta(prev, c))) break;
    const ocup = [...tokens.entries()].find(([, x]) => x !== tYo && x.col === c.col && x.fila === c.fila && !x.bajoTierra);
    if(ocup){
      const [xid, x] = ocup;
      const caido = typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(xid);   // (con el id, 2026-10-26)
      if(!rival && !caido && dueloEsRival(tYo, x)){ rival = ocup; antes = {...prev}; max++; celdas.push(c); prev = c; continue; }   // atraviesa a uno: una casilla más
      break;
    }
    celdas.push(c); prev = c; fin = {...c};
  }
  return {celdas, rival, antes, fin};
}
function dashMover(id, c){
  return coleccionTokens().doc(id).update({col: c.col, fila: c.fila, ruta: firebase.firestore.FieldValue.delete()});
}
// o = {nombre, casillas, atacar(rivalId) → Promise<bool> (lanzó el duelo), alTerminar() (sin ataque o cancelado: reabrir la ventana)}. Pide la dirección con un clic.
function dashEjecutar(tokenId, o){
  const t = tokens.get(tokenId);
  if(!t){ toast(`${o.nombre || 'Dash'}: no hay token en este mapa`); return; }
  const casillas = Math.max(1, Math.round(num(o.casillas)) || 3);
  elegirDestino(async h => {
    const t1 = tokens.get(tokenId);
    if(!t1) return;
    // La dirección: el vecino que más se acerca a la casilla tocada.
    const dir = VECINO_LADO.map(d => { const c = hexACubo(t1); return {d, n: {col: cuboACol(c.q + d[0], c.r + d[1]), fila: cuboAFila(c.q + d[0], c.r + d[1])}}; })
      .sort((a, b) => distanciaHex(a.n, h) - distanciaHex(b.n, h))[0].d;
    const cam = dashCamino({col: t1.col, fila: t1.fila}, dir, casillas, t1);
    const nom = nombreDe(t1);
    const fin = () => { if(typeof o.alTerminar === 'function') o.alTerminar(); };
    if(!cam.celdas.length){ toast(`💨 ${o.nombre || 'Dash'}: no hay lugar para avanzar hacia ese lado`); fin(); return; }
    try{
      if(cam.rival){
        const [rid, rt] = cam.rival;
        if(cam.antes && (cam.antes.col !== t1.col || cam.antes.fila !== t1.fila)) await dashMover(tokenId, cam.antes);
        dashPendientes.set(tokenId, {rivalId: rid, fin: cam.fin, nombre: o.nombre || 'Dash'});
        mesaLinea(`💨 ${nom} hace ${o.nombre || 'Dash'}: atraviesa a ${nombreDe(rt)} y le pega al pasar (si lo para con Parry, se frena ahí).`, 'recordatorio');
        const ok = await o.atacar(rid).catch(err => { console.error('Dash: no se pudo atacar', err); return false; });
        if(!ok){ dashPendientes.delete(tokenId); await dashMover(tokenId, cam.fin); fin(); }
      }else{
        await dashMover(tokenId, cam.fin);
        mesaLinea(`💨 ${nom} hace ${o.nombre || 'Dash'}: avanza ${cam.celdas.length} casilla${cam.celdas.length === 1 ? '' : 's'} en línea recta.`, 'recordatorio');
        fin();
      }
    }catch(err){ console.error('Dash:', err); toast(`💨 ${o.nombre || 'Dash'}: no se pudo mover el token — movelo a mano`); fin(); }
  }, `<b>💨 ${esc(o.nombre || 'Dash')}: tocá hacia dónde avanza</b> <span>una casilla hacia ese lado (las 6 direcciones) · ${casillas} en línea recta; atraviesa a un rival y le pega · Esc o clic derecho cancelan</span>`, true, () => { if(typeof o.alTerminar === 'function') o.alTerminar(); });
}
// Cuando el duelo del Dash se resuelve (el gancho `disparoResuelto`, js/14): si lo paró con Parry (o lo bloqueó), se queda; si no, sigue hasta el final.
function dashResuelto(d){
  const id = d && d.atacante && d.atacante.tokenId, p = id && dashPendientes.get(id);
  if(!p) return;
  // Solo el duelo del Dash (2026-10-26, visto en el mapa: un Dash cancelado quedaba pendiente y el próximo Degollar de ese creep contra el mismo
  // rival lo hacía saltar al final del camino). Otro ataque de quien lo tenía pendiente lo descarta.
  if(!d.defensor || d.defensor.tokenId !== p.rivalId || (d.ataque && d.ataque.habNombre && d.ataque.habNombre !== p.nombre) || (!d.ataque || !d.ataque.habNombre)){ dashPendientes.delete(id); return; }
  dashPendientes.delete(id);
  const paro = d.resultado === 'bloqueado' || d.resultado === 'mitad' || !!(d.defensa && /parry/.test(String(d.defensa.modo || '')) && d.contacto && d.contacto.gana === 'defensor');
  const t = tokens.get(id), nom = t ? nombreDe(t) : (d.atacante.nombre || 'Alguien');
  if(paro){ mesaLinea(`💨 ${p.nombre}: ${d.defensor.nombre} lo paró — ${nom} se queda antes de pasarlo.`, 'recordatorio'); return; }
  dashMover(id, p.fin).then(() => mesaLinea(`💨 ${p.nombre}: ${nom} pasa de largo y termina detrás de ${d.defensor.nombre}.`, 'recordatorio'))
    .catch(err => { console.error('Dash:', err); toast(`💨 ${p.nombre}: no se pudo terminar el movimiento — movelo a mano`); });
}
