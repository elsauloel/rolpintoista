// js/105-salto-casilla.js — 🦘 El Salto eligiendo dónde caer (2026-11-05, dueño: «uno debe poder elegir el casillero. Y si en ese casillero hay más de
// un objetivo posible, una vez que seleccionás el casillero, te dice elegí el objetivo, y ahí se ejecuta la parte del ataque»; «al seleccionarlo, mostrarte
// un área de todas las opciones a donde podés saltar. Si hay algún token interpuesto, no pasa nada. Pero si hay algún objeto sólido, debe aparecer una
// advertencia de discutir con la mesa si se puede saltar ese objeto o no, con Aceptar o Cancelar»).
// Lo llama dueloElegirObjetivoMapa (js/13) antes de elegir el objetivo, para un ataque con `saltoHab` que no sea una carrera (el Takle, `corre`, sigue
// por js/55 como siempre). Flujo: se pintan las casillas libres a `saltoHab` o menos (más fuertes las que quedan pegadas a un rival) → clic en una →
// si la línea pasa por un Sólido o una pared, la pregunta a la mesa → cae (sin No2 ni oportunidad; el Salto aplastante aplasta ahí) → si hay un solo rival
// pegado, va contra él; si hay varios, «Elegí el objetivo» con un clic → el duelo de siempre (msg.objetivoFijo + msg.saltoHecho). Esc cancela sin cobrar.
let saltoCasillas = null;   // {libres: Set 'col,fila', conRival: Set, t0}

function saltoCasillaDibujar(z){
  if(!saltoCasillas) return false;
  const pulso = 0.55 + 0.45 * Math.sin((performance.now() - saltoCasillas.t0) / 260);
  ctx.save();
  for(const k of saltoCasillas.libres){
    const [col, fila] = k.split(',').map(Number), c = hexCentro(col, fila), fuerte = saltoCasillas.conRival.has(k);
    ctx.beginPath(); trazarHex(c.x, c.y);
    ctx.fillStyle = fuerte ? `rgba(120,200,255,${(0.22 + 0.16 * pulso).toFixed(3)})` : 'rgba(120,200,255,.07)'; ctx.fill();
    ctx.lineWidth = (fuerte ? 2.4 : 1.2) / z; ctx.strokeStyle = fuerte ? 'rgba(150,215,255,.95)' : 'rgba(150,215,255,.35)'; ctx.stroke();
  }
  ctx.restore();
  return true;
}

function saltoRivalesPegados(c, mioId, yo, fijo){
  return [...tokens.entries()].filter(([id, x]) => id !== mioId && !x.bajoTierra && distanciaHex(c, x) === 1
      && (fijo ? id === fijo : dueloEsRival(yo, x)) && (soyGM || !x.oculto) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(x)))
    .map(([id, x]) => ({...x, id}));
}

async function saltoElegirCasilla(msg, yo, ataque, conSalto){
  const propio = t => t.fichaId === yo.ref && t.tipo === yo.tipo;
  const mio = [...tokens.entries()].map(([id, t]) => ({...t, id})).find(propio);
  if(!mio){ toast(`${(ataque && ataque.habNombre) || 'El Salto'}: no encontré tu token en este mapa`); if(msg.alCancelar) msg.alCancelar(); return; }
  const n = Math.max(1, Math.round(num(conSalto.saltoHab)) || 3), nom = nombreDe(mio);
  const fijo = msg.objetivoFijo && tokens.get(msg.objetivoFijo) ? msg.objetivoFijo : null;
  const ocupada = c => elementoSolidoEn(c.col, c.fila) || [...tokens.entries()].some(([id, x]) => id !== mio.id && x.col === c.col && x.fila === c.fila && !x.bajoTierra);
  const choca = c => lineaHex(mio, c).some((x, i, l) => elementoSolidoEn(x.col, x.fila) || (typeof paredCorta === 'function' && paredCorta(i ? l[i - 1] : mio, x)));
  // Todas las casillas a n o menos (la propia también: atacar sin saltar si ya está pegado).
  const c0 = hexACubo(mio), libres = new Set(), conRival = new Set();
  for(let dq = -n; dq <= n; dq++) for(let dr = Math.max(-n, -dq - n); dr <= Math.min(n, -dq + n); dr++){
    const c = {col: cuboACol(c0.q + dq, c0.r + dr), fila: cuboAFila(c0.q + dq, c0.r + dr)}, k = c.col + ',' + c.fila;
    const esMia = c.col === mio.col && c.fila === mio.fila;
    if(!esMia && ocupada(c)) continue;
    libres.add(k);
    if(saltoRivalesPegados(c, mio.id, yo, fijo).length) conRival.add(k);
  }
  const terminar = () => { saltoCasillas = null; pedirDibujo(); };
  const cancelar = () => { terminar(); if(msg.alCancelar) msg.alCancelar(); };
  if(!conRival.size){
    const si = await AvisoCombate.preguntar(`No hay ninguna casilla a ${n} o menos donde caer pegado a ${fijo ? nombreDe(tokens.get(fijo)) : 'un rival'}. ¿Atacar igual sin saltar? (lo decide la mesa)`,
      {icono: '🦘', titulo: 'Sin salto', si: 'Atacar igual', no: 'Cancelar'});
    if(!si){ cancelar(); return; }
    mesaLinea(`🦘 ${nom} ataca sin saltar (no había dónde caer; lo decidió la mesa)`, 'alerta-roja');
    msg.saltoHecho = true; dueloElegirObjetivoMapa(msg); return;
  }
  saltoCasillas = {libres, conRival, t0: performance.now()};
  cerrarBotonera(); seleccion = null; hudCerrar(); pedirDibujo();
  const texto = `<b>🦘 ${esc(nom)}: elegí dónde caer</b> <span>las casillas marcadas fuerte quedan pegadas a un rival (salta hasta ${n}, por encima de los tokens) · Esc o clic derecho cancelan</span>`;
  const pedirCasilla = () => elegirDestino(async h => {
    const k = h.col + ',' + h.fila;
    if(!libres.has(k)){ toast(`Ahí no puede caer: elegí una casilla libre a ${n} o menos`); pedirCasilla(); return; }
    if(!conRival.has(k)){ toast('Elegí una casilla pegada a un rival (las marcadas más fuerte)'); pedirCasilla(); return; }
    const salta = !(h.col === mio.col && h.fila === mio.fila);
    if(salta && choca(h)){   // por encima de algo sólido: lo decide la mesa
      const ok = await AvisoCombate.preguntar(`El salto de ${nom} pasa por encima de algo sólido (una pared o un objeto Sólido). El salto es de 1,5 metros de altura: discutilo con la mesa, ¿se puede saltar?`,
        {icono: '🦘', titulo: '¿Se puede saltar?', si: 'Aceptar', no: 'Cancelar'});
      if(!ok){ pedirCasilla(); return; }
      mesaLinea(`🦘 La mesa decidió que ${nom} sí puede saltar por encima de algo sólido`, 'recordatorio');
    }
    terminar();
    const rivales = saltoRivalesPegados(h, mio.id, yo, fijo);
    if(salta){
      const k2 = distanciaHex(mio, h), desde = {col: mio.col, fila: mio.fila}, mira = rivales[0] || h;
      if(typeof oporNegadaAvisar === 'function') oporNegadaAvisar(mio, mio.id, [desde, ...lineaHex(mio, h).filter(c => !(c.col === mio.col && c.fila === mio.fila))], ataque.habNombre || ataque.nombre || 'el Salto', rivales[0] && rivales[0].id);
      try{
        await coleccionTokens().doc(mio.id).update({col: h.col, fila: h.fila, rotacion: rotacionDePaso(hexCentro(h.col, h.fila), hexCentro(mira.col, mira.fila)), ruta: firebase.firestore.FieldValue.delete()});
      }catch(err){ console.error('El Salto: no se pudo mover el token', err); toast('No se pudo saltar: ' + String((err && err.message) || err)); if(msg.alCancelar) msg.alCancelar(); return; }
      if(typeof marcarMovido === 'function') marcarMovido(mio.id);
      mio.col = h.col; mio.fila = h.fila;
      const txt = `${nom} salta ${k2} casillero${k2 === 1 ? '' : 's'} y cae ${rivales.length === 1 ? 'al lado de ' + nombreDe(rivales[0]) : 'en medio de sus rivales'}.`;
      mesaLinea(`🦘 ${txt}`, 'recordatorio');
      if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'salto', icono: '🦘', titulo: `${nom} salta`, resultado: txt, estado: 'listo', datos: {chico: true}});
    }
    if(conSalto.saltoAplasta && typeof saltoAplastar === 'function') await saltoAplastar(mio, yo);
    const atacar = r => { msg.saltoHecho = true; msg.objetivoFijo = r.id; dueloElegirObjetivoMapa(msg); };
    if(rivales.length === 1){ atacar(rivales[0]); return; }
    // Varios rivales pegados: «Elegí el objetivo».
    saltoCasillas = {libres: new Set(rivales.map(r => r.col + ',' + r.fila)), conRival: new Set(rivales.map(r => r.col + ',' + r.fila)), t0: performance.now()};
    pedirDibujo();
    const elegirRival = () => elegirDestino(h2 => {
      const r = rivales.find(x => x.col === h2.col && x.fila === h2.fila);
      if(!r){ toast('Elegí a uno de los rivales marcados'); elegirRival(); return; }
      terminar(); atacar(r);
    }, `<b>🦘 Elegí el objetivo</b> <span>clic en uno de los rivales marcados, pegados a ${esc(nom)} · Esc o clic derecho cancelan</span>`, true, () => { terminar(); if(msg.alCancelar) msg.alCancelar(); });
    elegirRival();
  }, texto, true, cancelar);
  pedirCasilla();
}
