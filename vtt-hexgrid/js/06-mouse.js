// js/06-mouse.js — tramo 6 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): mouse / dedo sobre el mapa.
/* ---------- Mouse / dedo sobre el mapa ---------- */

lienzo.addEventListener('contextmenu', e => e.preventDefault());
// Clic derecho con un token a medio arrastrar: cancela el movimiento y el
// token vuelve a donde estaba. (El botón derecho apretado con el izquierdo
// ya sostenido llega como mousedown, no siempre como pointerdown.)
function cancelarArrastreToken(){
  if(!arrastre) return false;
  const a = arrastre;
  arrastre = null;
  visibles.delete(a.id);
  lienzo.style.cursor = moverLibre ? 'crosshair' : 'default';
  toast('Movimiento cancelado');
  pedirDibujo();
  return true;
}
lienzo.addEventListener('mousedown', e => { if(e.button === 2) cancelarArrastreToken(); });
lienzo.addEventListener('pointerdown', e => {
  if(e.pointerType === 'mouse' && e.button === 2){
    // Con la Botonera o las Acciones abiertas, el clic derecho sobre el mapa (afuera de la ventana) las cierra.
    if(!$('#botonera-capa').hidden){ escapeABotonera(); return; }
    if(elegirDestinoCb){ elegirDestinoCancelar(); return; }
    if(colocando){ cancelarColocacion(); return; }
    if(cancelarArrastreToken()) return;
    // Con una herramienta de dibujo activa, el clic derecho es "salir de
    // acá" (no ping) — es la forma más práctica de volver al cursor
    // normal sin ir a buscar el botón de la barra lateral.
    // Con un borrador de Terreno/Formas esperando, el clic derecho lo descarta
    // (recién el siguiente sale de la herramienta).
    if(borradorElemento){ descartarBorradorElemento(); return; }
    if(herramientaActiva){ desactivarHerramienta(); return; }
    // Lo mismo con 🦶 Mover libre: el clic derecho lo apaga.
    if(moverLibre){ activarMoverLibre(moverLibre); return; }
    // Con la caja de herramientas abierta, el clic derecho la cierra (no hace ping).
    if(toolkitAbierto){ abrirToolkit(false); return; }
    const {px, py} = posEvento(e);
    const m = pantallaAMundo(px, py);
    guardarPing(m.x, m.y);
    return;
  }
  if(e.button !== 0 && e.pointerType === 'mouse') return;
  // Un clic en el mapa consolida el borrador (y nada más: no empieza otro).
  if(borradorElemento){ consolidarBorradorElemento(); return; }
  // Colocando un token nuevo: el clic elige la casilla y después la orientación.
  if(colocando){ const pc = posEvento(e); colocacionClic(pc.px, pc.py); return; }
  // Elegir un destino ya no se resuelve acá: arranca un paneo normal (para poder arrastrar el mapa y llegar
  // a un token lejos) y se resuelve al soltar, solo si no hubo arrastre de verdad — ver soltar().
  if(elegirDestinoCb){
    const pc = posEvento(e);
    paneo = {inicioX: pc.px, inicioY: pc.py, x: vista.x, y: vista.y};
    lienzo.style.cursor = 'grabbing';
    return;
  }
  // Pincel de niebla (GM): destapa o tapa lo que se arrastra.
  if(herramientaActiva === 'niebla' && soyGM){
    lienzo.setPointerCapture(e.pointerId);
    pincelNiebla = {celdas: new Set()};
    const pe = posEvento(e);
    nieblaPintar(pe.px, pe.py);
    lienzo.style.cursor = 'crosshair';
    return;
  }
  const {px, py} = posEvento(e);
  const m = pantallaAMundo(px, py);
  const id = tokenEn(m.x, m.y);
  lienzo.setPointerCapture(e.pointerId);
  const libre = moverLibre && tokens.get(moverLibre);
  if(libre && !rutaPendiente){
    if(id === moverLibre){
      // Arrastrar el token: sin ruta ni costo.
      const v = visibles.get(id) || hexCentro(libre.col, libre.fila);
      arrastre = {id, x: v.x, y: v.y, dx: v.x - m.x, dy: v.y - m.y, inicioX: px, inicioY: py, movio: false,
        ruta: [{col: libre.col, fila: libre.fila}], costo: null, avisado: false, libre: true};
      lienzo.style.cursor = 'grabbing';
      return;
    }
    // Tocar otra casilla: el token aparece ahí.
    const destino = mundoAHex(m.x, m.y);
    moverTokenLibre(moverLibre, destino.col, destino.fila);
    return;
  }
  if(id){
    seleccionar(id);
    const t = tokens.get(id);
    if(puedoMover(t)){
      const costo = costoMoverDe(t);
      if(rutaPendiente){
        // Ese clic confirmó el movimiento marcado: no empieza otro arrastre.
      }else if(costo && costo.porCasillero <= 0){
        toast('No te podés mover ahora (Inmovilizado)');
      }else{
        const v = visibles.get(id) || hexCentro(t.col, t.fila);
        arrastre = {id, x: v.x, y: v.y, dx: v.x - m.x, dy: v.y - m.y, inicioX: px, inicioY: py, movio: false,
          ruta: [{col: t.col, fila: t.fila}], costo, avisado: false};
        lienzo.style.cursor = 'grabbing';
        return;
      }
    }
  }else{
    // Colisión (solo GM): pintar casilleros arrastrando o de a uno; con Shift, borrar. No selecciona nada.
    if(herramientaActiva === 'elemento' && elemTipo === 'colision' && soyGM){
      const cc = mundoAHex(m.x, m.y);
      elementoSeleccionar(null);
      pintandoColision = {borrar: !!e.shiftKey, celdas: new Map([[colKey(cc), cc]]), ultima: cc};
      lienzo.style.cursor = 'crosshair';
      pedirDibujo();
      return;
    }
    // Handle de rotación del trazo ya seleccionado (si se puede manipular).
    if(trazoSeleccionado && trazos.has(trazoSeleccionado)){
      const ts = trazos.get(trazoSeleccionado);
      if(!ts.hex && puedeManipularTrazo(ts)){
        const h = trazoManijaMundo(ts);
        if(Math.hypot(m.x - h.x, m.y - h.y) <= 12 / vista.zoom){
          rotandoTrazo = {id: trazoSeleccionado};
          lienzo.style.cursor = 'grabbing';
          return;
        }
      }
    }
    // Un trazo permanente ahí: seleccionarlo y, si se puede, arrastrarlo.
    // Con el lápiz por casilleros activo se dibuja directo (un marcador
    // fijo ya puesto se selecciona saliendo de la herramienta).
    const idTrazo = (herramientaActiva === 'lapiz' && lapizEstilo === 'casillas') ? null : trazoEn(m.x, m.y);
    if(idTrazo){
      trazoSeleccionar(idTrazo);
      const t = trazos.get(idTrazo);
      // Un marcador por casilleros está atado a la grilla: se selecciona
      // (para borrarlo) pero no se arrastra ni se rota.
      if(!t.hex && puedeManipularTrazo(t)){
        arrastreTrazo = {id: idTrazo, dx: m.x - t.origen.x, dy: m.y - t.origen.y, inicioX: px, inicioY: py, movio: false};
        lienzo.style.cursor = 'grabbing';
      }
      return;
    }
    // Lápiz activo: empieza un trazo nuevo a mano alzada.
    if(herramientaActiva === 'lapiz'){
      trazoSeleccionar(null);
      dibujando = lapizEstilo === 'casillas'
        ? {hex: true, celdas: [mundoAHex(m.x, m.y)], marcador: true}
        : {puntos: [m]};
      lienzo.style.cursor = 'crosshair';
      return;
    }
    // Botón de editar, de pinear/despinear y handle de rotación del
    // elemento (terreno/formas) ya seleccionado.
    if(elementoSeleccionado && elementos.has(elementoSeleccionado)){
      const els = elementos.get(elementoSeleccionado);
      if(puedeManipularElemento(els)){
        const g = elementoGearMundo(els);
        if(Math.hypot(m.x - g.x, m.y - g.y) <= 12 / vista.zoom){
          abrirEditorElemento(elementoSeleccionado);
          return;
        }
        const p = elementoPinMundo(els);
        if(Math.hypot(m.x - p.x, m.y - p.y) <= 12 / vista.zoom){
          moverElemento(elementoSeleccionado, {fijado: !els.fijado});
          return;
        }
        if(!els.fijado){
          const h = elementoManijaMundo(els);
          if(Math.hypot(m.x - h.x, m.y - h.y) <= 12 / vista.zoom){
            rotandoElemento = {id: elementoSeleccionado};
            lienzo.style.cursor = 'grabbing';
            return;
          }
        }
      }
    }
    // Un elemento (terreno/formas) en esta casilla: seleccionarlo y, si se
    // puede y no está pineado, prepararlo para arrastrarlo. Pineado: se
    // comporta como el terreno de abajo — clickear y arrastrar mueve el
    // mapa, no el elemento (para eso está el botón de despinear).
    const casillaClic = mundoAHex(m.x, m.y);
    const idElemento = elementoEn(casillaClic.col, casillaClic.fila);
    if(idElemento){
      const elHit = elementos.get(idElemento);
      elementoSeleccionar(idElemento);
      if(elHit.fijado){
        paneo = {inicioX: px, inicioY: py, x: vista.x, y: vista.y};
        lienzo.style.cursor = 'grabbing';
        return;
      }
      if(puedeManipularElemento(elHit)){
        arrastreElemento = {id: idElemento, inicioX: px, inicioY: py, movio: false};
        lienzo.style.cursor = 'grabbing';
      }
      return;
    }
    // Terreno/Formas activo: crea un elemento nuevo (flor de un clic;
    // línea/libre se arman arrastrando, ver pointermove/soltar).
    if(herramientaActiva === 'elemento'){
      elementoSeleccionar(null);
      dibujandoElemento = {tipo: elemTipo, origen: casillaClic, celdas: new Map([['0,0', {dq: 0, dr: 0}]])};
      lienzo.style.cursor = 'crosshair';
      return;
    }
    // Con el engranaje abierto, el primer clic en el mapa solo lo cierra:
    // así no se pierde lo que se estaba por guardar.
    if(hudGlobo){ hudCerrar(); renderPanel(); pedirDibujo(); return; }
    seleccionar(null);
    trazoSeleccionar(null);
    elementoSeleccionar(null);
    if(moverFondo && soyGM && fondo){
      arrastreFondo = {inicioX: px, inicioY: py, x: fondo.x, y: fondo.y};
      lienzo.style.cursor = 'move';
      return;
    }
  }
  paneo = {inicioX: px, inicioY: py, x: vista.x, y: vista.y};
  lienzo.style.cursor = 'grabbing';
});

lienzo.addEventListener('pointermove', e => {
  const {px, py} = posEvento(e);
  if(lineaPreview) lineaPreviewMover(pantallaAMundo(px, py));   // la línea recta que se está apuntando (js/13)
  if(pincelNiebla){ nieblaPintar(px, py); return; }
  if(colocando){ colocacionMover(px, py); return; }
  if(dibujando){
    if(dibujando.hex){
      // Casillero por casillero, como la estela de un token (sin costo ni
      // obstáculos): volver sobre una casilla recorta la línea.
      const m = pantallaAMundo(px, py);
      extenderRuta({ruta: dibujando.celdas, costo: null, marcador: true}, mundoAHex(m.x, m.y));
    }else{
      dibujando.puntos.push(pantallaAMundo(px, py));
    }
    pedirDibujo();
    return;
  }
  if(pintandoColision){
    const m = pantallaAMundo(px, py);
    const cc = mundoAHex(m.x, m.y);
    const p = pintandoColision;
    if(cc.col !== p.ultima.col || cc.fila !== p.ultima.fila){
      // Se completan los casilleros del medio, para que un arrastre rápido no deje huecos.
      lineaHex(p.ultima, cc).forEach(c => p.celdas.set(colKey(c), c));
      p.ultima = cc;
      pedirDibujo();
    }
    return;
  }
  if(dibujandoElemento){
    const m = pantallaAMundo(px, py);
    const casilla = mundoAHex(m.x, m.y);
    const c0 = hexACubo(dibujandoElemento.origen), c1 = hexACubo(casilla);
    if(dibujandoElemento.tipo === 'flor'){
      // El clic fija el centro; el radio es la distancia hasta el mouse.
      const dq = c1.q - c0.q, dr = c1.r - c0.r;
      const radio = Math.min(TAMANO_ELEMENTO_MAX, (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2);
      dibujandoElemento.celdas = new Map(celdasFlor(radio).map(c => [`${c.dq},${c.dr}`, c]));
    }else if(dibujandoElemento.tipo === 'linea'){
      // El largo lo da el arrastre: casilleros hasta donde está el mouse
      // (contando el origen), con un tope de LINEA_MAX_CELDAS.
      const dq = c1.q - c0.q, dr = c1.r - c0.r;
      const largo = Math.min(LINEA_MAX_CELDAS, (Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr)) / 2 + 1);
      const celdas = celdasLinea({dq, dr}, largo);
      dibujandoElemento.celdas = new Map(celdas.map(c => [`${c.dq},${c.dr}`, c]));
    }else{
      dibujandoElemento.celdas.set(`${c1.q - c0.q},${c1.r - c0.r}`, {dq: c1.q - c0.q, dr: c1.r - c0.r});
    }
    pedirDibujo();
    return;
  }
  if(arrastreElemento){
    if(!arrastreElemento.movio && Math.hypot(px - arrastreElemento.inicioX, py - arrastreElemento.inicioY) < 4) return;
    arrastreElemento.movio = true;
    const els = elementos.get(arrastreElemento.id);
    if(els){ const m = pantallaAMundo(px, py); els.origen = mundoAHex(m.x, m.y); }
    pedirDibujo();
    return;
  }
  if(rotandoElemento){
    const els = elementos.get(rotandoElemento.id);
    if(els){
      const m = pantallaAMundo(px, py);
      const c = hexCentro(els.origen.col, els.origen.fila);
      const dx = m.x - c.x, dy = m.y - c.y;
      if(Math.hypot(dx, dy) > 6 / vista.zoom){
        const ang = (Math.atan2(-dx, dy) * 180 / Math.PI + 360) % 360;
        els.rotacion = Math.round(ang / 60) * 60 % 360;
      }
    }
    pedirDibujo();
    return;
  }
  if(arrastreTrazo){
    if(!arrastreTrazo.movio && Math.hypot(px - arrastreTrazo.inicioX, py - arrastreTrazo.inicioY) < 4) return;
    arrastreTrazo.movio = true;
    const m = pantallaAMundo(px, py);
    const t = trazos.get(arrastreTrazo.id);
    if(t){ t.origen.x = m.x - arrastreTrazo.dx; t.origen.y = m.y - arrastreTrazo.dy; }
    pedirDibujo();
    return;
  }
  if(rotandoTrazo){
    const t = trazos.get(rotandoTrazo.id);
    if(t){
      const m = pantallaAMundo(px, py);
      const dx = m.x - t.origen.x, dy = m.y - t.origen.y;
      if(Math.hypot(dx, dy) > 4 / vista.zoom) t.rotacion = (Math.atan2(-dx, dy) * 180 / Math.PI + 360) % 360;
    }
    pedirDibujo();
    return;
  }
  if(arrastre){
    if(!arrastre.movio && Math.hypot(px - arrastre.inicioX, py - arrastre.inicioY) < 4) return;
    arrastre.movio = true;
    const m = pantallaAMundo(px, py);
    arrastre.x = m.x + arrastre.dx; arrastre.y = m.y + arrastre.dy;
    arrastre.chocado = false;
    if(!arrastre.libre){
      arrastre.chocado = extenderRuta(arrastre, mundoAHex(arrastre.x, arrastre.y));
      if(arrastre.chocado){
        // Choque: el token no sigue al mouse, apenas se "apoya" contra el
        // obstáculo desde la última casilla libre.
        const u = arrastre.ruta[arrastre.ruta.length - 1];
        const cu = hexCentro(u.col, u.fila);
        const vx = arrastre.x - cu.x, vy = arrastre.y - cu.y;
        const largo = Math.hypot(vx, vy), tope = HEX * 0.3;
        if(largo > tope){ arrastre.x = cu.x + vx / largo * tope; arrastre.y = cu.y + vy / largo * tope; }
        lienzo.style.cursor = 'not-allowed';
      }
    }
    pedirDibujo();
    return;
  }
  if(arrastreFondo){
    fondo.x = arrastreFondo.x + (px - arrastreFondo.inicioX) / vista.zoom;
    fondo.y = arrastreFondo.y + (py - arrastreFondo.inicioY) / vista.zoom;
    pedirDibujo();
    return;
  }
  if(paneo){
    vista.x = paneo.x + px - paneo.inicioX;
    vista.y = paneo.y + py - paneo.inicioY;
    pedirDibujo();
    return;
  }
  const m = pantallaAMundo(px, py);
  const id = tokenEn(m.x, m.y);
  if(elegirDestinoCb){ lienzo.style.cursor = 'crosshair'; return; }   // sin arrastrar: sigue esperando el clic que elige el destino
  if(moverLibre){ lienzo.style.cursor = id === moverLibre ? 'grab' : 'crosshair'; return; }
  if(!id){
    if(trazoSeleccionado && trazos.has(trazoSeleccionado) && !trazos.get(trazoSeleccionado).hex && puedeManipularTrazo(trazos.get(trazoSeleccionado))){
      const h = trazoManijaMundo(trazos.get(trazoSeleccionado));
      if(Math.hypot(m.x - h.x, m.y - h.y) <= 12 / vista.zoom){ lienzo.style.cursor = 'grab'; return; }
    }
    const idTrazo = trazoEn(m.x, m.y);
    if(idTrazo){ const tz = trazos.get(idTrazo); lienzo.style.cursor = !tz.hex && puedeManipularTrazo(tz) ? 'grab' : 'pointer'; return; }
    if(elementoSeleccionado && elementos.has(elementoSeleccionado) && puedeManipularElemento(elementos.get(elementoSeleccionado))){
      const els = elementos.get(elementoSeleccionado);
      const g = elementoGearMundo(els);
      if(Math.hypot(m.x - g.x, m.y - g.y) <= 12 / vista.zoom){ lienzo.style.cursor = 'pointer'; return; }
      const p = elementoPinMundo(els);
      if(Math.hypot(m.x - p.x, m.y - p.y) <= 12 / vista.zoom){ lienzo.style.cursor = 'pointer'; return; }
      if(!els.fijado){
        const h = elementoManijaMundo(els);
        if(Math.hypot(m.x - h.x, m.y - h.y) <= 12 / vista.zoom){ lienzo.style.cursor = 'grab'; return; }
      }
    }
    const casilla = mundoAHex(m.x, m.y);
    const idElemento = elementoEn(casilla.col, casilla.fila);
    if(idElemento){
      const elHover = elementos.get(idElemento);
      lienzo.style.cursor = elHover.fijado ? 'default' : (puedeManipularElemento(elHover) ? 'grab' : 'pointer');
      return;
    }
    if(herramientaActiva === 'lapiz' || herramientaActiva === 'elemento'){ lienzo.style.cursor = 'crosshair'; return; }
  }
  lienzo.style.cursor = id ? (puedoMover(tokens.get(id)) ? 'grab' : 'pointer') : (moverFondo && soyGM && fondo ? 'move' : 'default');
});

// Casilleros que alcanzan a pagarse con los Nitros disponibles (Infinity si
// el token se mueve sin costo). Los que siguen se dibujan en rojo.
function pasosPagables(costo, ruta){
  if(!costo) return Infinity;
  if(ruta){ const a = costoPasos(ruta, costo.porCasillero, costo.gratis, costo.recargo); let n = 0; while(n < a.length && a[n] <= costo.disponibles) n++; return n; }   // con terreno lento
  return Math.max(0, Math.floor(costo.disponibles / costo.porCasillero));
}

// La ruta sigue al token casilla por casilla. Volver sobre una casilla ya
// recorrida borra la estela desde ahí. Pasarse de los Nitros se permite
// (quedan en negativo), pero avisa y la estela sigue en rojo.
// Devuelve true si un elemento sólido cortó el avance: el token "se choca"
// y se queda en la última casilla libre.
function extenderRuta(a, casilla){
  const ruta = a.ruta;
  const i = ruta.findIndex(c => mismoHex(c, casilla));
  if(i >= 0){ ruta.length = i + 1; return false; }
  let chocado = false;
  for(const c of lineaHex(ruta[ruta.length - 1], casilla)){
    const j = ruta.findIndex(x => mismoHex(x, c));
    if(j >= 0){ ruta.length = j + 1; continue; }
    if(!a.marcador && elementoSolidoEn(c.col, c.fila)){ chocado = true; break; }
    if(ruta.length >= RUTA_MAX_CELDAS) break;
    ruta.push(c);
  }
  if(a.costo && ruta.length - 1 > pasosPagables(a.costo, ruta) && !a.avisado){
    // Sin aviso verde: la estela en rojo y el cartel ya lo muestran.
    a.avisado = true;
  }
  return chocado;
}

function soltar(){
  if(pincelNiebla) nieblaGuardarPincel();
  if(dibujando){
    const d = dibujando;
    dibujando = null;
    if(d.hex) guardarTrazoHex(d.celdas, lapizPermanente);
    else if(d.puntos.length > 1) guardarTrazo(d.puntos, lapizPermanente);
    pedirDibujo();
  }
  if(arrastreTrazo){
    const a = arrastreTrazo;
    arrastreTrazo = null;
    const t = trazos.get(a.id);
    if(a.movio && t) moverTrazo(a.id, {origen: {x: t.origen.x, y: t.origen.y}});
    pedirDibujo();
  }
  if(rotandoTrazo){
    const a = rotandoTrazo;
    rotandoTrazo = null;
    const t = trazos.get(a.id);
    if(t) moverTrazo(a.id, {rotacion: t.rotacion});
    pedirDibujo();
  }
  if(pintandoColision){
    const p = pintandoColision;
    pintandoColision = null;
    const lista = [...p.celdas.values()];
    pedirDibujo();
    if(p.borrar) colisionBorrar(lista); else colisionPintar(lista);
  }
  if(dibujandoElemento){
    // No se crea todavía: queda de borrador para ajustar opacidad, color, etc.
    const d = dibujandoElemento;
    dibujandoElemento = null;
    if(d.celdas.size >= 1){ borradorElemento = d; renderHerramientaFlotante(); }
    pedirDibujo();
  }
  if(arrastreElemento){
    const a = arrastreElemento;
    arrastreElemento = null;
    const els = elementos.get(a.id);
    if(a.movio && els) moverElemento(a.id, {origen: {col: els.origen.col, fila: els.origen.fila}});
    pedirDibujo();
  }
  if(rotandoElemento){
    const a = rotandoElemento;
    rotandoElemento = null;
    const els = elementos.get(a.id);
    if(els) moverElemento(a.id, {rotacion: els.rotacion});
    pedirDibujo();
  }
  if(arrastre){
    const a = arrastre;
    arrastre = null;
    const t = tokens.get(a.id);
    // Confusión (2026-10-04, js/20): antes de moverse, si es su primera acción del turno, tira; con «Seguir» se mueve por esta misma ruta.
    if(!(a.movio && !a.libre && confusionAntes(a.id, () => rutaSoltada(a, tokens.get(a.id))))) rutaSoltada(a, t);   // (2026-10-02: separado para que el ataque de oportunidad pueda retomar el resto del camino, js/17)
    pedirDibujo();
  }
  // Elegir un destino (centro de área, teleport…) ya no se resuelve en el pointerdown (bloqueaba poder
  // arrastrar el mapa para llegar a un token lejos): arranca un paneo como cualquier clic y acá, al soltar,
  // se mira si en el camino hubo arrastre de verdad o fue un clic quieto (dueño, 2026-09-27).
  if(elegirDestinoCb && paneo){
    const arrastrado = Math.hypot(vista.x - paneo.x, vista.y - paneo.y) >= 6;
    if(!arrastrado){
      const mw = pantallaAMundo(paneo.inicioX, paneo.inicioY), h = mundoAHex(mw.x, mw.y), cb = elegirDestinoCb;
      if(!elegirDestinoLibre && elementoSolidoEn(h.col, h.fila)) toast('Ese punto no es transitable a pie (hay un Sólido o una pared): elegí otra casilla');
      else{ elegirDestinoTerminar(); cb(h); }
    }
  }
  if(paneo){ paneo = null; guardarVista(); }
  if(arrastreFondo){
    const movido = fondo.x !== arrastreFondo.x || fondo.y !== arrastreFondo.y;
    arrastreFondo = null;
    if(movido) guardarFondo({x: fondo.x, y: fondo.y});
  }
  lienzo.style.cursor = moverLibre ? 'crosshair' : 'default';
}
// Lo que pasa al soltar un token que se arrastró (o al retomar el resto de un camino frenado por un ataque de oportunidad, js/17): sigilo,
// trampas, percepción y oportunidad cortan la ruta donde corresponda; después se mueve (cobrando No2) o se pregunta si se pasa de los que tiene.
function rutaSoltada(a, t){
  // Sigilo: si la ruta pisa un cono rival, se corta ahí (aparece donde lo
  // detectaron) y se anotan los pasos en las zonas de alerta.
  if(!a.libre && a.movio && t && a.ruta.length > 1 && enSigilo(t)){
    const largo = a.ruta.length;
    sigiloEvaluarRuta(t, a);
    if(a.ruta.length < largo){
      const fc = a.ruta[a.ruta.length - 1], pc = hexCentro(fc.col, fc.fila);
      a.x = pc.x; a.y = pc.y;
      toast('🕶 Te detectaron: el movimiento se corta donde entraste en su cono');
    }
  }
  // Se corta la ruta donde ocurra primero: un rival en sigilo dentro del cono (detección
  // inmediata) o una trampa (pisarla, o quedar al lado si tiene Percepción aumentada).
  trampaPendiente = null;
  percepcionSigiloPendiente = null;
  oportunidadPendiente = null;
  if(!a.libre && a.movio && t && a.ruta.length > 1){
    const corte = !enSigilo(t) ? percepcionEvaluarRuta(t, a.id, a.ruta, null) : null;
    const trampa = trampasEvaluarRuta(a.id, t, a.ruta);
    const corteTrampa = trampa && (!corte || trampa.indice < corte.indice) ? trampa : null;
    const corteSigilo = corte && (!corteTrampa) ? corte : null;
    let indice = corteTrampa ? corteTrampa.indice : (corteSigilo ? corteSigilo.indice : -1);
    // Ataque de oportunidad (2026-10-02, js/17): si antes de eso se aleja de un rival que puede aprovecharlo, se frena en el último
    // casillero al lado de ese rival y espera la decisión; el resto del camino queda guardado.
    const opor = oportunidadCorte(t, a.id, a.ruta);
    if(opor && (indice < 0 || opor.indice < indice)){
      oportunidadPendiente = {tokenId: a.id, rivalId: opor.rivalId, resto: a.ruta.slice(opor.indice)};
      a.ruta = a.ruta.slice(0, opor.indice + 1);
      const fc = a.ruta[a.ruta.length - 1], pc = hexCentro(fc.col, fc.fila);
      a.x = pc.x; a.y = pc.y;
      indice = -1;
      if(a.ruta.length === 1){ visibles.delete(a.id); oportunidadResolver(); }   // se aleja en el primer paso: no hay nada que mover todavía
    }
    if(indice >= 0){
      a.ruta = a.ruta.slice(0, indice + 1);
      const fc = a.ruta[a.ruta.length - 1], pc = hexCentro(fc.col, fc.fila);
      a.x = pc.x; a.y = pc.y;
      if(corteSigilo && corteSigilo.tipo === 'percibe') percepcionSigiloPendiente = {tokenId: a.id, ocultoId: corteSigilo.ocultoId, celda: fc};   // P145: se resuelve al llegar (js/16)
      else if(corteSigilo) toast(`🕶 Viste a ${corteSigilo.ocultos.map(o => o.nombre).join(', ')}: el movimiento se corta acá y pierde el sigilo`);
      else{
        trampaPendiente = {tokenId: a.id, tipo: corteTrampa.tipo, id: corteTrampa.id, el: corteTrampa.el, celda: a.ruta[a.ruta.length - 1], desde: a.ruta[a.ruta.length - 2]};
        if(corteTrampa.tipo === 'pisa') toast('⚠ Pisaste algo: el movimiento se corta acá');   // 'cerca': lo dice el cartelito, sin nombrar la trampa (P145)
      }
    }
  }
  const pasos = a.ruta.length - 1;
  if(a.libre){
    const fin = mundoAHex(a.x, a.y);
    if(a.movio && t && !mismoHex(fin, t)){
      visibles.set(a.id, {x: a.x, y: a.y});
      moverTokenLibre(a.id, fin.col, fin.fila);
    }
  }else if(a.movio && t && pasos > 0 && a.ruta.slice(1).some(c => elementoSolidoEn(c.col, c.fila))){
    toast('Ese camino pasa por un obstáculo — no se puede confirmar así');
    visibles.delete(a.id);
  }else if(a.movio && t && pasos > 0){
    if(a.chocado) toast('🚧 Te chocaste con un obstáculo');
    visibles.set(a.id, {x: a.x, y: a.y});
    const oportunidad = oportunidadEvaluarRuta(t, a.ruta);
    if(a.costo){
      const costoTotal = costoRuta(a.ruta, a.costo.porCasillero, pasos, a.costo.gratis, a.costo.recargo);   // con el terreno lento (arena movediza), los pasos gratis y Lento
      rutaPendiente = {id: a.id, celdas: a.ruta, pasos, porCasillero: a.costo.porCasillero, costo: costoTotal, disponibles: a.costo.disponibles, oportunidad,
        gratis: Math.min(pasos, num(a.costo.gratis)), lento: num(a.costo.recargo) > 0};
      // Solo se pregunta si el movimiento se pasa de los No2 que quedan.
      if(costoTotal > Math.max(0, a.costo.disponibles)) mostrarConfirmacionRuta();
      else confirmarRuta();
    }else{
      const fin = a.ruta[pasos];
      moverToken(a.id, fin.col, fin.fila, a.ruta);
      if(trampaPendiente) trampaResolver();
      if(percepcionSigiloPendiente) percepcionSigiloResolver();
      if(oportunidadPendiente && oportunidadPendiente.tokenId === a.id) oportunidadResolver();
      oportunidadPublicarAvisos(t, oportunidad);
    }
  }
}
lienzo.addEventListener('pointerup', soltar);
lienzo.addEventListener('pointercancel', soltar);

lienzo.addEventListener('wheel', e => {
  e.preventDefault();
  const {px, py} = posEvento(e);
  zoomEn(px, py, Math.exp(-e.deltaY * 0.0015));
}, {passive: false});

function abrirMenuLentes(abrir){
  $('#lentes-menu').hidden = !abrir;
  $('#btn-zonas').setAttribute('aria-expanded', abrir ? 'true' : 'false');
  renderBotonZonas();   // también esconde/muestra el acceso directo 👁 según quede el menú
}
$('#btn-zonas').onclick = () => abrirMenuLentes($('#lentes-menu').hidden);
function alternarLentes(){
  verZonas = !verZonas;
  try{ localStorage.setItem('mapa-ver-zonas', verZonas ? '1' : '0'); }catch(e){}
  renderBotonZonas(); pedirDibujo();
  toast(verZonas ? '👓 Modo lentes prendido' : '👓 Modo lentes apagado');
}
$('#lentes-activar').onclick = alternarLentes;
$('#lentes-todos').onclick = () => {
  lentesTodos = !lentesTodos;
  try{ localStorage.setItem('mapa-lentes-todos', lentesTodos ? '1' : '0'); }catch(err){}
  renderBotonZonas(); actualizarAvisoLentes(); pedirDibujo();
};
$('#btn-zonas-todas').onclick = () => $('#lentes-todos').onclick();
document.addEventListener('pointerdown', e => {
  if(!$('#lentes-menu').hidden && !e.target.closest('#lentes-caja')) abrirMenuLentes(false);
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('#lentes-menu').hidden) abrirMenuLentes(false); });
renderBotonZonas();
$('#btn-acercar').onclick = () => zoomEn(anchoPx / 2, altoPx / 2, 1.25);
$('#btn-alejar').onclick = () => zoomEn(anchoPx / 2, altoPx / 2, 0.8);
$('#btn-centrar').onclick = centrarEnMios;

document.addEventListener('keydown', e => {
  // Con la Botonera o las Acciones abiertas, el teclado es de esa ventana:
  // Escape se le pasa (cierra la de más arriba) y el mapa no hace nada más.
  if(!$('#botonera-capa').hidden){
    // Escape, o B (la tecla que la abre), la cierra.
    if((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.altKey && !e.metaKey){ escapeABotonera(true); return; }   // F abre y cierra la ficha: cierra todo de una
    if(e.key === 'Escape' || ((e.key === 'b' || e.key === 'B') && !e.ctrlKey && !e.altKey && !e.metaKey)) escapeABotonera();
    return;
  }
  if(elegirDestinoCb && e.key === 'Escape'){ elegirDestinoCancelar(); return; }
  if(colocando && e.key === 'Escape'){ cancelarColocacion(); return; }
  if(colocando && e.key === 'Escape'){ cancelarColocacion(); return; }
  if(creando && e.key === 'Escape' && !document.querySelector('.recorte-scrim')){ cancelarNuevoToken(); return; }
  if(editandoElemento && e.key === 'Escape'){ cerrarEditorElemento(true); return; }
  // Borrador de Terreno/Formas: Enter lo crea y Esc lo descarta, incluso con
  // el foco en un control del panel (la barra de opacidad).
  if(borradorElemento && e.key === 'Enter'){ e.preventDefault(); consolidarBorradorElemento(); return; }
  if(borradorElemento && e.key === 'Escape'){ descartarBorradorElemento(); return; }
  // Ctrl+L: prende o apaga el modo lentes (conos de detección). La L sola es del Lápiz.
  if((e.key === 'l' || e.key === 'L') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey){
    e.preventDefault();
    alternarLentes();
    return;
  }
  // Ctrl+Z: deshace el último movimiento o giro propio (no mientras se escribe en un campo).
  if((e.key === 'z' || e.key === 'Z') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && !(e.target.closest && e.target.closest('input,select,textarea,[contenteditable]'))){
    e.preventDefault();
    deshacerUltimoMovimiento();
    return;
  }
  // Ctrl+B: abre o cierra la bitácora flotante (también escribiendo en ella).
  if((e.key === 'b' || e.key === 'B') && e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && fbMiembro){
    e.preventDefault();
    abrirBitacoraFlotante(!bitacoraFlotanteAbierta);
    return;
  }
  if(e.target.closest && e.target.closest('input,select,textarea')) return;
  // L: prende o apaga el Lápiz.
  if((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.altKey && !e.metaKey && fbMiembro){
    e.preventDefault();
    if(herramientaActiva === 'lapiz') desactivarHerramienta();
    else{ if(borradorElemento) consolidarBorradorElemento(); herramientaActiva = 'lapiz'; renderToolkit(); }
    return;
  }
  // D: abre o cierra la grilla de dados.
  if((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.altKey && !e.metaKey){
    e.preventDefault();
    $('#toolkit-dados').click();
    return;
  }
  // H: abre o cierra la caja de herramientas.
  if((e.key === 'h' || e.key === 'H') && !e.ctrlKey && !e.altKey && !e.metaKey){
    e.preventDefault();
    abrirToolkit(!toolkitAbierto);
    return;
  }
  // M: prende o apaga 🦶 Mover libre del token seleccionado (si se puede).
  if((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.altKey && !e.metaKey){
    e.preventDefault();
    const tm = seleccion ? tokens.get(seleccion) : null;
    if(tm && puedoMoverLibre(tm)) activarMoverLibre(seleccion);
    else if(moverLibre) activarMoverLibre(moverLibre);
    else toast('Elegí primero un token tuyo para moverlo libre');
    return;
  }
  // R: 📏 Rango (Destreza); Shift+R: 🔮 Rango de casteo (Especial). Locales, no se sincronizan con nadie más.
  // (Ctrl+R queda afuera a propósito: el navegador lo usa para recargar la página y no se puede pisar del todo.)
  if((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey && !e.metaKey){
    e.preventDefault();
    alternarRango(e.shiftKey);
    return;
  }
  // T (2026-09-24): 🔮 Rango de casteo, sin Shift (Shift+R con Ctrl a mano se confunde con recargar la página).
  if((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.altKey && !e.metaKey && fbMiembro){
    e.preventDefault();
    alternarRango(true);
    return;
  }
  // C (2026-09-24): centra el mapa en el token seleccionado (un creep, si el GM tiene uno seleccionado); sin selección, en tu token
  // propio (un jugador) o en los tuyos (GM), como el botón Centrar.
  if((e.key === 'c' || e.key === 'C') && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && fbMiembro){
    e.preventDefault();
    const tc = seleccion ? tokens.get(seleccion) : null;
    if(tc && (soyGM || puedoMover(tc))){ const cc = hexCentro(tc.col, tc.fila); centrarEn(cc.x, cc.y); pulsarTokens([seleccion]); }   // el GM en cualquiera; un jugador en un token suyo
    else centrarEnMios();
    return;
  }
  // G (antes F, 2026-09-26: la F ahora abre la ficha): prende o apaga Terreno y Formas.
  if((e.key === 'g' || e.key === 'G') && !e.ctrlKey && !e.altKey && !e.metaKey && fbMiembro){
    e.preventDefault();
    if(herramientaActiva === 'elemento') desactivarHerramienta();
    else{ if(borradorElemento) consolidarBorradorElemento(); herramientaActiva = 'elemento'; renderToolkit(); }
    return;
  }
  // F (2026-09-26, pedido del dueño): abre el menú de la FICHA del token seleccionado (jugador: su personaje, o el principal si no hay selección; GM: la ficha del creep). Se cierra con F o con Esc.
  if((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && fbMiembro){
    e.preventDefault();
    if(flAbierta()){ cerrarFichaLite(); return; }   // F otra vez: se cierra la ficha lite (js/15)
    const tf = seleccion ? tokens.get(seleccion) : null;
    if(soyGM){   // GM: la ficha lite del creep o del personaje seleccionado (dueño, 2026-10-05: siempre la lite; de ahí, a la completa)
      if(tf && tf.tipo === 'creep'){ if(tf.fichaId && creepsPub.has(tf.fichaId)) abrirFichaDeToken(tf); else toast('Ese token no está vinculado a un creep de GM Tools'); }
      else if(tf && tf.tipo === 'pj' && tf.fichaId) abrirFichaDeToken(tf);
      else toast('Seleccioná un creep o un personaje para ver su ficha');
    }else{   // jugador: su token seleccionado (personaje o invocación) o, si no, su personaje principal (aunque tenga seleccionado el de otro)
      if(tf && tf.tipo === 'pj' && tf.fichaId && tf.duenoUid === fbUsuario.uid) abrirFichaDeToken(tf);
      else{ const propio = fichaPrincipalId(); if(propio) abrirFichaLite({tipo: 'pj', fichaId: propio}); else toast('No tenés un personaje para abrir'); }
    }
    return;
  }
  // B (2026-09-24, pedido del dueño): abre la Botonera del TOKEN SELECCIONADO (jugador: su personaje o una invocación suya; GM: las
  // Acciones del creep). Sin token seleccionado, un jugador abre la de su personaje principal, como siempre; el GM recibe un aviso.
  // Se cierra con B o con Esc.
  if((e.key === 'b' || e.key === 'B') && !e.ctrlKey && !e.altKey && !e.metaKey && fbMiembro){
    e.preventDefault();
    if(abrirBotoneraDeSeleccion()) return;
    if(seleccion){ toast('Ese token no tiene Botonera para vos'); return; }
    if(soyGM) toast('Seleccioná un creep para abrir sus Acciones');
    else abrirBotoneraPrincipal();
    return;
  }
  // E (2026-09-25, pedido del dueño): abre o cierra el globo de ESTADOS ALTERADOS del token seleccionado.
  if((e.key === 'e' || e.key === 'E') && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey && fbMiembro){
    e.preventDefault();
    if(!seleccion || !tokens.get(seleccion)){ toast('Seleccioná un token para ver sus estados alterados'); return; }
    hudGlobo = hudGlobo === 'estados' ? '' : 'estados';
    hudEditando = '';
    if(hudGlobo === 'estados') estadosPrecargar(tokens.get(seleccion));   // así «+ Estado» abre enseguida
    pedirDibujo();
    return;
  }
  // Ctrl+C / Ctrl+V (2026-09-25, pedido del dueño): copian la forma seleccionada y la pegan donde está el mouse.
  if((e.key === 'c' || e.key === 'C') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && fbMiembro && elementoSeleccionado){
    e.preventDefault();
    copiarElementoSeleccionado();
    return;
  }
  if((e.key === 'v' || e.key === 'V') && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey && fbMiembro && portapapelesElemento){
    e.preventDefault();
    pegarElemento();
    return;
  }
  if(rutaPendiente && e.key === 'Enter'){ e.preventDefault(); confirmarRuta(); return; }
  if(rutaPendiente && e.key === 'Escape'){ cancelarRuta(); return; }
  if(moverLibre && e.key === 'Escape'){ activarMoverLibre(moverLibre); return; }
  if(herramientaActiva && e.key === 'Escape'){ desactivarHerramienta(); return; }
  if(toolkitAbierto && e.key === 'Escape'){ abrirToolkit(false); return; }   // Esc cierra la caja de herramientas (2026-09-24)
  if(e.key === 'Escape'){ seleccionar(null); trazoSeleccionar(null); elementoSeleccionar(null); }
  if((e.key === 'Delete' || e.key === 'Backspace') && seleccion) borrarToken(seleccion);
  if((e.key === 'Delete' || e.key === 'Backspace') && trazoSeleccionado && puedeManipularTrazo(trazos.get(trazoSeleccionado))){
    borrarTrazo(trazoSeleccionado);
    trazoSeleccionar(null);
  }
  if((e.key === 'Delete' || e.key === 'Backspace') && elementoSeleccionado && puedeManipularElemento(elementos.get(elementoSeleccionado))){
    borrarElemento(elementoSeleccionado);
    elementoSeleccionar(null);
  }
});

