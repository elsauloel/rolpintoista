// js/05-vista-y-dibujo.js — tramo 5 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): vista y dibujo del lienzo.
/* ---------- Vista ---------- */

function guardarVista(){
  try{ localStorage.setItem('mapa-vista', JSON.stringify(vista)); }catch(e){}
  // También el hexágono del centro de la pantalla: TokensAuto (comun/tokens-auto.js) lo usa para poner los tokens nuevos ahí.
  try{ const w = pantallaAMundo(anchoPx / 2, altoPx / 2); localStorage.setItem('mapa-centro', JSON.stringify(mundoAHex(w.x, w.y))); }catch(e){}
}
function cargarVista(){
  try{
    const v = JSON.parse(localStorage.getItem('mapa-vista') || 'null');
    if(v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.zoom)){ vista = v; return true; }
  }catch(e){}
  return false;
}
function pantallaAMundo(px, py){
  return { x: (px - vista.x) / vista.zoom, y: (py - vista.y) / vista.zoom };
}
function posEvento(e){
  const r = lienzo.getBoundingClientRect();
  return { px: e.clientX - r.left, py: e.clientY - r.top };
}
function centrarEn(x, y){
  vista.x = anchoPx / 2 - x * vista.zoom;
  vista.y = altoPx / 2 - y * vista.zoom;
  guardarVista(); pedirDibujo();
}
function zoomEn(px, py, factor){
  const nuevo = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, vista.zoom * factor));
  const m = pantallaAMundo(px, py);
  vista.zoom = nuevo;
  vista.x = px - m.x * nuevo;
  vista.y = py - m.y * nuevo;
  guardarVista(); pedirDibujo();
}
function centrarEnMios(){
  const mios = [...tokens.values()].filter(t => puedoMover(t) && t.tipo === 'pj');
  const lista = mios.length ? mios : (soyGM ? [...tokens.values()] : []);
  if(!lista.length){ centrarEn(0, 0); return; }
  const cs = lista.map(t => hexCentro(t.col, t.fila));
  centrarEn(cs.reduce((a, c) => a + c.x, 0) / cs.length, cs.reduce((a, c) => a + c.y, 0) / cs.length);
}

function ajustarTamano(){
  const r = lienzo.getBoundingClientRect();
  dpr = window.devicePixelRatio || 1;
  anchoPx = r.width; altoPx = r.height;
  lienzo.width = Math.round(r.width * dpr);
  lienzo.height = Math.round(r.height * dpr);
  // La primera vez que se conoce el tamaño, si no había una vista guardada,
  // se pone la casilla 0,0 en el medio.
  if(!ajustarTamano.hecho && anchoPx > 0){
    ajustarTamano.hecho = true;
    ajustarTamano.habiaVista = cargarVista();
    if(!ajustarTamano.habiaVista) centrarEn(0, 0);
  }
  pedirDibujo();
}

/* ---------- Dibujo ---------- */

let dibujoPedido = false;
function pedirDibujo(){
  if(dibujoPedido) return;
  dibujoPedido = true;
  requestAnimationFrame(() => {
    dibujoPedido = false;
    if(dibujar()) pedirDibujo();
  });
}

// Aura que sigue la grilla: todas las casillas a `radio` pasos o menos del
// token, pintadas juntas, con el borde solo por fuera.
function dibujarAuraHex(centro, aura, z){
  const C = hexACubo(centro);
  const R = aura.radio;
  const borde = [];
  ctx.beginPath();
  for(let dq = -R; dq <= R; dq++){
    for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++){
      const r = C.r + dr, q = C.q + dq;
      const col = cuboACol(q, r);
      const h = hexCentro(col, cuboAFila(q, r));
      trazarHex(h.x, h.y);
      if(Math.max(Math.abs(dq), Math.abs(dr), Math.abs(dq + dr)) === R) borde.push({h, dq, dr});
    }
  }
  ctx.fillStyle = colorConAlfa(aura.color, 0.18); ctx.fill();
  ctx.beginPath();
  borde.forEach(({h, dq, dr}) => {
    VECINO_LADO.forEach(([vq, vr], i) => {
      const nq = dq + vq, nr = dr + vr;
      if(Math.max(Math.abs(nq), Math.abs(nr), Math.abs(nq + nr)) <= R) return;
      const a = ESQUINAS[i], b = ESQUINAS[(i + 1) % 6];
      ctx.moveTo(h.x + a[0], h.y + a[1]);
      ctx.lineTo(h.x + b[0], h.y + b[1]);
    });
  });
  ctx.strokeStyle = colorConAlfa(aura.color, 0.6); ctx.lineWidth = 2 / z; ctx.stroke();
}

// Rango de acción (📏 R y 🔮 T) con línea de visión (2026-09-26, pedido del dueño): como con la visión, si un objeto Sólido (o una Colisión) tapa el paso, lo que queda detrás
// NO está en el rango. Se ve la pared misma, no lo que hay del otro lado. Sin sólidos en el mapa se dibuja el círculo completo, como siempre.
function dibujarRangoConVision(centro, radio, color, z){
  const solidos = solidosSet();
  if(!solidos.size){ dibujarAuraHex(centro, {radio, color}, z); return; }
  const C = hexACubo(centro), R = radio, origen = {col: centro.col, fila: centro.fila};
  const dentro = new Set(), celdas = [];
  for(let dq = -R; dq <= R; dq++){
    for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++){
      const q = C.q + dq, r = C.r + dr, col = cuboACol(q, r), fila = cuboAFila(q, r);
      if(!lineaLibre(origen, {col, fila}, solidos)) continue;
      dentro.add(dq + ',' + dr);
      celdas.push({h: hexCentro(col, fila), dq, dr});
    }
  }
  ctx.beginPath();
  celdas.forEach(({h}) => trazarHex(h.x, h.y));
  ctx.fillStyle = colorConAlfa(color, 0.18); ctx.fill();
  ctx.beginPath();
  celdas.forEach(({h, dq, dr}) => {
    VECINO_LADO.forEach(([vq, vr], i) => {
      if(dentro.has((dq + vq) + ',' + (dr + vr))) return;
      const a = ESQUINAS[i], b = ESQUINAS[(i + 1) % 6];
      ctx.moveTo(h.x + a[0], h.y + a[1]);
      ctx.lineTo(h.x + b[0], h.y + b[1]);
    });
  });
  ctx.strokeStyle = colorConAlfa(color, 0.6); ctx.lineWidth = 2 / z; ctx.stroke();
}

function trazarHex(cx, cy){
  ctx.moveTo(cx + ESQUINAS[0][0], cy + ESQUINAS[0][1]);
  for(let i = 1; i < 6; i++) ctx.lineTo(cx + ESQUINAS[i][0], cy + ESQUINAS[i][1]);
  ctx.closePath();
}

// Vértices de un hexágono centrado en (cx,cy) con radio r (para los tokens,
// que pueden ser más chicos que una casilla cuando comparten lugar).
function verticesHex(cx, cy, r){
  const k = r / HEX;
  return ESQUINAS.map(([ex, ey]) => [cx + ex * k, cy + ey * k]);
}
function trazarPuntos(pts){
  ctx.beginPath();
  pts.forEach(([px, py], i) => { if(i) ctx.lineTo(px, py); else ctx.moveTo(px, py); });
  ctx.closePath();
}

// Dónde va cada token: si varios comparten casilla, se acomodan en ronda.
function calcularDisposicion(){
  // Tokens ocultos (solo el GM los prepara y los muestra cuando corresponde):
  // a los jugadores ni se les dibujan ni se pueden tocar.
  const orden = [...tokens.entries()]
    .filter(([, t]) => (soyGM || !t.oculto) && tokenVisiblePorNiebla(t))
    .map(([id, t]) => ({id, t}))
    .sort((a, b) => (a.t.creadoMs - b.t.creadoMs) || (a.id < b.id ? -1 : 1));
  const grupos = new Map();
  orden.forEach(o => {
    if(arrastre && arrastre.id === o.id) return;
    if(rutaPendiente && rutaPendiente.id === o.id) return;
    const k = o.t.col + ',' + o.t.fila;
    if(!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(o);
  });
  const res = [];
  grupos.forEach(grupo => {
    const n = grupo.length;
    grupo.forEach((o, i) => {
      const c = hexCentro(o.t.col, o.t.fila);
      if(n === 1){ res.push({id: o.id, x: c.x, y: c.y, radio: HEX * 0.68, solo: true}); return; }
      const ang = -Math.PI / 2 + i * 2 * Math.PI / n;
      const d = HEX * (n > 4 ? 0.45 : 0.38);
      res.push({id: o.id, x: c.x + d * Math.cos(ang), y: c.y + d * Math.sin(ang), radio: HEX * (n > 4 ? 0.3 : 0.42)});
    });
  });
  if(arrastre && tokens.has(arrastre.id)) res.push({id: arrastre.id, x: arrastre.x, y: arrastre.y, radio: HEX * 0.68, solo: true, arrastrado: true});
  // Esperando confirmación: el token queda en el destino de la ruta.
  if(rutaPendiente && tokens.has(rutaPendiente.id)){
    const fin = rutaPendiente.celdas[rutaPendiente.celdas.length - 1];
    const c = hexCentro(fin.col, fin.fila);
    res.push({id: rutaPendiente.id, x: c.x, y: c.y, radio: HEX * 0.68, solo: true});
  }
  return res;
}

// Devuelve true si todavía hay algo animándose.
function dibujar(){
  revelarActualizar();
  nieblaActualizar();
  sigiloRevisar();
  sigiloFantasmasActualizar();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#0F0C0E';
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  const z = vista.zoom;
  ctx.setTransform(dpr * z, 0, 0, dpr * z, dpr * vista.x, dpr * vista.y);

  // Imagen de fondo (la pone el GM), debajo de la grilla.
  const imgFondo = fondo ? imagenLista(fondo.dato) : null;
  if(imgFondo){
    const alto = fondo.ancho * imgFondo.naturalHeight / imgFondo.naturalWidth;
    ctx.drawImage(imgFondo, fondo.x, fondo.y, fondo.ancho, alto);
  }

  // Grilla: solo las casillas que se ven.
  const a = pantallaAMundo(0, 0), b = pantallaAMundo(anchoPx, altoPx);
  const filaMin = Math.floor(a.y / (SQ3 * HEX)) - 1, filaMax = Math.ceil(b.y / (SQ3 * HEX)) + 1;
  const colMin = Math.floor(a.x / (1.5 * HEX)) - 1, colMax = Math.ceil(b.x / (1.5 * HEX)) + 1;
  ctx.beginPath();
  const sinGrilla = colisionInfo().set;   // adentro de la Colisión no se dibujan las líneas de la grilla
  for(let f = filaMin; f <= filaMax; f++){
    for(let c = colMin; c <= colMax; c++){
      if(sinGrilla.size && sinGrilla.has(c + ',' + f)) continue;
      const p = hexCentro(c, f);
      trazarHex(p.x, p.y);
    }
  }
  if(!imgFondo){
    ctx.fillStyle = '#17121A';
    ctx.fill();
  }
  ctx.strokeStyle = imgFondo ? 'rgba(15,12,14,.45)' : 'rgba(201,133,69,.28)';
  ctx.lineWidth = 1 / z;
  ctx.stroke();

  // Casilla de origen marcada apenas, como referencia.
  ctx.beginPath(); trazarHex(0, 0);
  ctx.strokeStyle = 'rgba(224,164,88,.45)'; ctx.lineWidth = 2 / z; ctx.stroke();

  // Elementos de terreno/formas: van pegados al piso, debajo de los tokens.
  const trazarCeldas = (celdas) => {
    ctx.beginPath();
    celdas.forEach(c => { const h = hexCentro(c.col, c.fila); trazarHex(h.x, h.y); });
  };
  const bordeCeldas = (celdas) => {
    const set = new Set(celdas.map(c => c.col + ',' + c.fila));
    ctx.beginPath();
    celdas.forEach(c => {
      const cubo = hexACubo(c);
      const h = hexCentro(c.col, c.fila);
      VECINO_LADO.forEach(([vq, vr], i) => {
        const nq = cubo.q + vq, nr = cubo.r + vr;
        if(set.has(cuboACol(nq, nr) + ',' + cuboAFila(nq, nr))) return;
        const a = ESQUINAS[i], b = ESQUINAS[(i + 1) % 6];
        ctx.moveTo(h.x + a[0], h.y + a[1]);
        ctx.lineTo(h.x + b[0], h.y + b[1]);
      });
    });
  };
  // El borrador (lo que se está dibujando o esperando consolidarse) se
  // pinta como un elemento de verdad, con el color, la opacidad, la imagen y
  // el resto de lo que se eligió en el panel, para ver cómo va a quedar.
  const listaElementos = [...elementos.entries()];
  const origenBorrador = dibujandoElemento || borradorElemento;
  if(origenBorrador && herramientaActiva === 'elemento' && fbUsuario){
    listaElementos.push([ID_BORRADOR, {
      tipo: origenBorrador.tipo, origen: origenBorrador.origen, celdas: [...origenBorrador.celdas.values()], rotacion: 0,
      color: elemColor, alfa: elemAlfa, solido: elemSolido, invisible: !!(soyGM && elemInvisible),
      trampa: elemTrampa, trampaNombre: elemTrampaNombre, trampaDetalle: elemTrampaDetalle, disparada: false,
      imagen: elemImagen, imgZoom: 1, imgDX: 0, imgDY: 0, fijado: true, duenoUid: fbUsuario.uid,
    }]);
  }
  // Colisión: un solo contorno alrededor de todas las casillas pegadas (fusionadas), visible para todos.
  const colI = colisionInfo();
  if(colI.celdas.length){
    trazarCeldas(colI.celdas);
    ctx.fillStyle = 'rgba(216,82,75,.10)'; ctx.fill();
    bordeCeldas(colI.celdas);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(15,8,10,.6)'; ctx.lineWidth = 6 / z; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,92,72,.95)'; ctx.lineWidth = 3 / z; ctx.stroke();
  }
  // Lo que el GM está pintando (o borrando) ahora mismo con la Colisión.
  if(pintandoColision && pintandoColision.celdas.size){
    const lista = [...pintandoColision.celdas.values()];
    trazarCeldas(lista);
    ctx.fillStyle = pintandoColision.borrar ? 'rgba(237,227,210,.35)' : 'rgba(255,92,72,.35)'; ctx.fill();
    ctx.strokeStyle = pintandoColision.borrar ? 'rgba(237,227,210,.95)' : 'rgba(255,92,72,1)'; ctx.lineWidth = 2 / z; ctx.stroke();
  }
  listaElementos.forEach(([id, el]) => {
    if(!puedeVerElemento(el)) return;  // invisible: solo el GM y su creador
    const celdas = celdasDeElemento(el);
    const esColision = !!el.colision;   // su relleno y su contorno ya se dibujaron arriba, todos juntos
    if(!esColision){
    const img = el.imagen ? imagenLista(el.imagen) : null;
    if(img){
      ctx.save();
      trazarCeldas(celdas); ctx.clip();
      // La imagen vive en el marco sin rotar y gira junto con el elemento
      // alrededor de su casilla origen.
      const co = hexCentro(el.origen.col, el.origen.fila);
      ctx.translate(co.x, co.y); ctx.rotate((el.rotacion || 0) * Math.PI / 180); ctx.translate(-co.x, -co.y);
      const caja = cajaCeldas(celdasDeElemento(el, true));
      const escala = Math.max(caja.w / img.naturalWidth, caja.h / img.naturalHeight) * (el.imgZoom || 1);
      const iw = img.naturalWidth * escala, ih = img.naturalHeight * escala;
      const cx = caja.minX + caja.w / 2 + (el.imgDX || 0), cy = caja.minY + caja.h / 2 + (el.imgDY || 0);
      ctx.globalAlpha = el.invisible ? el.alfa / 100 * 0.35 : el.alfa / 100;
      ctx.drawImage(img, cx - iw / 2, cy - ih / 2, iw, ih);
      ctx.restore();
    }else{
      trazarCeldas(celdas);
      ctx.fillStyle = colorConAlfa(el.color, (el.invisible ? el.alfa / 100 * 0.35 : el.alfa / 100 * 0.7));
      ctx.fill();
    }
    bordeCeldas(celdas);
    if(el.invisible){
      // Solo GM y creador: contorno punteado violeta, para no confundirlo
      // con un sólido que también ven los jugadores.
      ctx.setLineDash([10 / z, 6 / z]);
      ctx.strokeStyle = 'rgba(175,130,235,1)';
      ctx.lineWidth = 4 / z;
      ctx.stroke();
      ctx.setLineDash([]);
    }else if(el.alfa === 0 && !el.solido && !puedeManipularElemento(el)){
      // Transparencia 0: el resto no ve nada, ni el contorno.
    }else if(el.alfa === 0 && !el.solido){
      // Transparencia 0: el GM y el creador siguen viendo el contorno.
      ctx.setLineDash([10 / z, 6 / z]);
      ctx.strokeStyle = colorConAlfa(el.color, 1);
      ctx.lineWidth = 4 / z;
      ctx.stroke();
      ctx.setLineDash([]);
    }else if(el.solido){
      // Sólido visible: borde de advertencia fijo, para que se note que
      // bloquea el paso más allá del color elegido.
      ctx.strokeStyle = 'rgba(216,82,75,.85)';
      ctx.lineWidth = 3 / z;
      ctx.stroke();
    }else{
      ctx.strokeStyle = colorConAlfa(el.color, Math.min(1, el.alfa / 100 + 0.25));
      ctx.lineWidth = 2 / z;
      ctx.stroke();
    }
    if(el.trampa){
      // Trampa: armada = ámbar con ⚠ (solo la ven su dueño y el GM); disparada = roja con ✖ (la ven todos).
      const disp = !!el.disparada;
      trazarCeldas(celdas);
      ctx.fillStyle = disp ? 'rgba(216,82,75,.28)' : 'rgba(224,164,88,.18)'; ctx.fill();
      bordeCeldas(celdas);
      ctx.setLineDash([8 / z, 5 / z]);
      ctx.strokeStyle = disp ? 'rgba(232,90,80,1)' : 'rgba(255,190,90,1)';
      ctx.lineWidth = 3.5 / z; ctx.stroke();
      ctx.setLineDash([]);
      const pT = hexCentro(celdas[0].col, celdas[0].fila);
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${18 / z}px system-ui, sans-serif`;
      ctx.fillStyle = disp ? '#FF6A60' : '#FFC46B';
      ctx.fillText(disp ? '✖' : '⚠', pT.x, pT.y);
      ctx.restore();
      const dst = destinoParsear(el.trampaDestino);
      if(dst){   // trampa de teleport: se marca el destino (lo ve quien ve la trampa)
        const pD = hexCentro(dst.col, dst.fila);
        ctx.save();
        ctx.setLineDash([6 / z, 4 / z]); ctx.strokeStyle = 'rgba(186,140,255,.95)'; ctx.lineWidth = 3 / z;
        ctx.beginPath(); ctx.arc(pD.x, pD.y, HEX * 0.7, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${20 / z}px system-ui, sans-serif`; ctx.fillStyle = '#C9A3FF';
        ctx.fillText('🌀', pD.x, pD.y);
        ctx.restore();
      }
    }
    if(el.fuego && celdas.length){
      // Terreno incendiado: llamitas en las casillas y el daño en el medio.
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${Math.max(10, 16 / z)}px system-ui, sans-serif`;
      celdas.slice(0, 60).forEach(c => { const p = hexCentro(c.col, c.fila); ctx.fillText('🔥', p.x, p.y); });
      const cm = celdas[Math.floor(celdas.length / 2)], pm = hexCentro(cm.col, cm.fila);
      ctx.font = `700 ${11 / z}px "Space Mono", monospace`;
      const txt = `${num(el.fuegoDano) || 5}`, w = ctx.measureText(txt).width + 8 / z, h = 15 / z;
      ctx.fillStyle = 'rgba(15,12,14,.85)'; ctx.fillRect(pm.x - w / 2, pm.y + 10 / z, w, h);
      ctx.fillStyle = '#FFB070'; ctx.fillText(txt, pm.x, pm.y + 10 / z + h / 2);
      ctx.restore();
    }
    if(el.portal){
      // Portal: anillo morado con remolino en su casilla (lo ven todos).
      const cP = celdas[0], pP = hexCentro(cP.col, cP.fila);
      ctx.save();
      ctx.strokeStyle = 'rgba(186,140,255,.95)'; ctx.lineWidth = 4 / z; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(pP.x, pP.y, HEX * 0.62, 0, Math.PI * 2); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `700 ${22 / z}px system-ui, sans-serif`; ctx.fillStyle = '#C9A3FF';
      ctx.fillText('🌀', pP.x, pP.y);
      ctx.restore();
    }
    }   // fin de lo que no es Colisión
    if(id !== ID_BORRADOR && el.venceMant !== null && el.venceMant !== undefined && mantenimientoNumero !== null && celdas.length){
      // Contador de turnos que le quedan a la forma (se elimina sola al llegar a 0).
      const quedan = Math.max(0, el.venceMant - mantenimientoNumero);
      const cm = celdas[Math.floor(celdas.length / 2)], pm = hexCentro(cm.col, cm.fila);
      ctx.save();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `700 ${12 / z}px "Space Mono", monospace`;
      const txt = `⏳${quedan}`, w = ctx.measureText(txt).width + 10 / z, h = 17 / z;
      ctx.fillStyle = 'rgba(15,12,14,.85)';
      ctx.beginPath(); ctx.rect(pm.x - w / 2, pm.y - h / 2, w, h); ctx.fill();
      ctx.strokeStyle = 'rgba(237,227,210,.9)'; ctx.lineWidth = 1.2 / z; ctx.stroke();
      ctx.fillStyle = '#EDE3D2'; ctx.fillText(txt, pm.x, pm.y + 0.5 / z);
      ctx.restore();
    }
    if(id === ID_BORRADOR){
      // Todavía no está creado: contorno blanco punteado.
      ctx.setLineDash([6 / z, 5 / z]);
      ctx.strokeStyle = 'rgba(237,227,210,.9)';
      ctx.lineWidth = 1.5 / z;
      bordeCeldas(celdas); ctx.stroke();
      ctx.setLineDash([]);
    }
    if(id === elementoSeleccionado){
      ctx.setLineDash([6 / z, 5 / z]);
      ctx.strokeStyle = 'rgba(237,227,210,.85)';
      ctx.lineWidth = 1.5 / z;
      bordeCeldas(celdas); ctx.stroke();
      ctx.setLineDash([]);
      if(puedeManipularElemento(el)){
        const c = hexCentro(el.origen.col, el.origen.fila);
        if(!el.fijado){
          const h = elementoManijaMundo(el);
          ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(h.x, h.y);
          ctx.strokeStyle = 'rgba(79,168,224,.7)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
          ctx.beginPath(); ctx.arc(h.x, h.y, 9 / z, 0, 2 * Math.PI);
          ctx.fillStyle = '#4FA8E0'; ctx.fill();
          ctx.strokeStyle = 'rgba(15,12,14,.6)'; ctx.lineWidth = 2 / z; ctx.stroke();
        }
        // Botón de pinear/despinear: rojo y candado cerrado si ya está
        // pineado (clic para soltarlo), celeste con 📌 si no (clic para
        // fijarlo — pineado, se comporta como el terreno de abajo).
        const p = elementoPinMundo(el);
        ctx.beginPath(); ctx.arc(p.x, p.y, 9 / z, 0, 2 * Math.PI);
        ctx.fillStyle = el.fijado ? '#D8524B' : '#4FA8E0';
        ctx.fill();
        ctx.strokeStyle = 'rgba(15,12,14,.6)'; ctx.lineWidth = 2 / z; ctx.stroke();
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `${11 / z}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText(el.fijado ? '🔓' : '📌', p.x, p.y + 0.5 / z);
        ctx.restore();
        // Botón de editar: color, transparencia, imagen y su acomodo.
        const g = elementoGearMundo(el);
        ctx.beginPath(); ctx.arc(g.x, g.y, 9 / z, 0, 2 * Math.PI);
        ctx.fillStyle = '#9A867E'; ctx.fill();
        ctx.strokeStyle = 'rgba(15,12,14,.6)'; ctx.lineWidth = 2 / z; ctx.stroke();
        ctx.save();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = `${11 / z}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText('⚙️', g.x, g.y + 0.5 / z);
        ctx.restore();
      }
    }
  });

  // Niebla de guerra (negra: nunca vista; gris: descubierta pero fuera de la visión de ahora).
  // A los jugadores (y al GM con "Como jugador") tapa todo lo de abajo y se pinta después de los
  // tokens. Al GM sin "Como jugador" solo se le insinúa: se pinta ANTES de las estelas, las auras y
  // los tokens, para que los nombres y las estelas se lean bien aunque estén en zona tapada.
  const pintarNiebla = () => {
    const aplica = nieblaAplica();
    const alfaNegra = aplica ? 1 : 0.4, alfaGris = aplica ? 0.6 : 0.25;
    const margen = HEX * 2;
    const x0 = a.x - margen, y0 = a.y - margen, x1 = b.x + margen, y1 = b.y + margen;
    const abiertas = [], grises = [];
    const dentro = c => { const p = hexCentro(c.col, c.fila); return p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1; };
    nieblaDescubierta.forEach(k => { if(nieblaVista.has(k)) return; const c = nbUnpack(k); if(dentro(c)) grises.push(c); });
    nieblaVista.forEach(k => { const c = nbUnpack(k); if(dentro(c)) abiertas.push(c); });
    const trazarLista = lista => lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    // Negra: todo el cuadro menos las casillas descubiertas o a la vista.
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    trazarLista(grises); trazarLista(abiertas);
    ctx.globalAlpha = alfaNegra;
    ctx.fillStyle = '#000';
    ctx.fill('evenodd');
    // Gris: lo ya descubierto que ahora no se ve.
    if(grises.length){
      ctx.beginPath();
      trazarLista(grises);
      ctx.globalAlpha = alfaGris;
      ctx.fillStyle = 'rgb(58,60,70)';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };
  if(nieblaActiva && !nieblaAplica()) pintarNiebla();

  // 👹 Visión de los creeps (solo GM): niebla semitransparente sobre lo que ningún creep ve, y en naranja lo que los sólidos les tapan.
  if(visionCreepsActiva && soyGM){
    const vc = visionCreepsCalcular();
    const margen = HEX * 2;
    const x0 = a.x - margen, y0 = a.y - margen, x1 = b.x + margen, y1 = b.y + margen;
    const dentro = c => { const p = hexCentro(c.col, c.fila); return p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1; };
    const vistasLista = [], tapadasLista = [];
    vc.vistas.forEach(k => { const c = nbUnpack(k); if(dentro(c)) vistasLista.push(c); });
    vc.tapadas.forEach(k => { const c = nbUnpack(k); if(dentro(c)) tapadasLista.push(c); });
    const trazarLista = lista => lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.beginPath();
    ctx.rect(x0, y0, x1 - x0, y1 - y0);
    trazarLista(vistasLista);
    ctx.fillStyle = 'rgba(20,24,44,.55)';
    ctx.fill('evenodd');
    if(tapadasLista.length){
      ctx.beginPath();
      trazarLista(tapadasLista);
      ctx.fillStyle = 'rgba(255,150,40,.32)'; ctx.fill();
      ctx.strokeStyle = 'rgba(255,170,60,.85)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
    }
    if(vistasLista.length){
      ctx.beginPath();
      trazarLista(vistasLista);
      ctx.strokeStyle = 'rgba(214,69,69,.45)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
    }
  }

  // Estelas: la ruta que se está dibujando, la que espera confirmación y las
  // de movimientos recientes (se desvanecen).
  let animando = false;
  const ahora = Date.now();
  // pagables: casilleros que alcanzan los Nitros; los de más van en magenta (antes en rojo: el rojo ahora es la estela normal,
  // 2026-09-24, para que se destaque sobre la niebla). Cada casillero lleva su numerito: los Nitros que suma hasta ahí
  // (porCasillero × pasos; en modo narrativo o en la estela de otro, solo la cuenta de pasos).
  const dibujarEstela = (celdas, alfa, pagables = Infinity, porCasillero = 1) => {
    if(celdas.length < 2) return;
    const ROJO = '255,38,38', IMPAGO = '226,40,214';
    const casillas = (color, lista) => {
      if(!lista.length) return;
      ctx.beginPath();
      lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
      ctx.fillStyle = `rgba(${color},${0.26 * alfa})`; ctx.fill();
      ctx.strokeStyle = `rgba(${color},${0.95 * alfa})`; ctx.lineWidth = 2.5 / z; ctx.stroke();
    };
    casillas(ROJO, celdas.slice(1, pagables + 1));
    casillas(IMPAGO, celdas.slice(pagables + 1));
    const trazarLinea = () => {
      ctx.beginPath();
      celdas.forEach((c, i) => { const p = hexCentro(c.col, c.fila); if(i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
    };
    // Contorno oscuro debajo, para que el rojo se separe de la niebla y de fondos claros.
    trazarLinea(); ctx.strokeStyle = `rgba(15,8,10,${0.7 * alfa})`; ctx.lineWidth = 8 / z; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    trazarLinea(); ctx.strokeStyle = `rgba(255,52,52,${alfa})`; ctx.lineWidth = 4.5 / z; ctx.stroke();
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${11 / z}px "Space Mono", monospace`;
    celdas.slice(1).forEach((c, i) => {
      const p = hexCentro(c.col, c.fila);
      const color = i < pagables ? ROJO : IMPAGO;
      const n = porCasillero > 0 ? (i + 1) * porCasillero : i + 1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 9 / z, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${color},${alfa})`; ctx.fill();
      ctx.strokeStyle = `rgba(15,8,10,${0.9 * alfa})`; ctx.lineWidth = 1.8 / z; ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${alfa})`;
      ctx.strokeStyle = `rgba(0,0,0,${0.8 * alfa})`; ctx.lineWidth = 2.5 / z;
      ctx.strokeText(String(n), p.x, p.y + 0.5 / z);
      ctx.fillText(String(n), p.x, p.y + 0.5 / z);
    });
    ctx.restore();
  };
  // Zona de una habilidad (ej. el cono de Sonic Boom): casillas rellenas y con borde, sin numeritos.
  const dibujarZonaHex = (celdas, color, alfa) => {
    if(!celdas.length) return;
    ctx.beginPath();
    celdas.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.fillStyle = colorConAlfa(color, 0.45 * alfa); ctx.fill();
    ctx.strokeStyle = colorConAlfa(color, 0.95 * alfa); ctx.lineWidth = 2.5 / z; ctx.stroke();
  };
  // Marcador de trayectoria del lápiz por casilleros: como la estela, pero
  // de un color elegido y con todas las casillas (incluida la de partida).
  const dibujarRutaHex = (celdas, color, alfa, seleccionada) => {
    if(!celdas.length) return;
    ctx.beginPath();
    celdas.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.fillStyle = colorConAlfa(color, 0.25 * alfa); ctx.fill();
    ctx.strokeStyle = colorConAlfa(color, 0.9 * alfa); ctx.lineWidth = 2 / z; ctx.stroke();
    if(celdas.length > 1){
      ctx.beginPath();
      celdas.forEach((c, i) => { const p = hexCentro(c.col, c.fila); if(i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
      ctx.strokeStyle = colorConAlfa(color, alfa); ctx.lineWidth = 4 / z; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
    }
    // Cada casillero lleva su número (1, 2, 3…) para contar trayectorias de un vistazo.
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${11 / z}px "Space Mono", monospace`;
    celdas.forEach((c, i) => {
      const p = hexCentro(c.col, c.fila);
      ctx.beginPath(); ctx.arc(p.x, p.y, 9 / z, 0, 2 * Math.PI);
      ctx.fillStyle = colorConAlfa(color, alfa); ctx.fill();
      ctx.strokeStyle = `rgba(15,12,14,${0.85 * alfa})`; ctx.lineWidth = 1.5 / z; ctx.stroke();
      ctx.fillStyle = `rgba(255,255,255,${alfa})`;
      ctx.strokeStyle = `rgba(0,0,0,${0.7 * alfa})`; ctx.lineWidth = 2.5 / z;
      ctx.strokeText(String(i + 1), p.x, p.y + 0.5 / z);
      ctx.fillText(String(i + 1), p.x, p.y + 0.5 / z);
    });
    ctx.restore();
    if(seleccionada){
      ctx.beginPath();
      celdas.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
      ctx.setLineDash([6 / z, 5 / z]);
      ctx.strokeStyle = 'rgba(237,227,210,.9)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
      ctx.setLineDash([]);
    }
  };
  estelas.forEach((e, id) => {
    const resta = e.hasta - ahora;
    if(resta <= 0){ estelas.delete(id); return; }
    const tEstela = tokens.get(id);
    if(tEstela && !tokenVisiblePorNiebla(tEstela)) return;   // la estela de lo que no se ve tampoco
    if(!estelaVisibleDe(tEstela)) return;                    // ni la de un oculto ni la de un sigiloso ajeno
    dibujarEstela(e.celdas, Math.min(1, resta / 1200));
    animando = true;
  });
  if(rutaPendiente) dibujarEstela(rutaPendiente.celdas, 1, pasosPagables(rutaPendiente), rutaPendiente.porCasillero || 1);
  if(arrastre && arrastre.movio) dibujarEstela(arrastre.ruta, 1, pasosPagables(arrastre.costo), arrastre.costo ? arrastre.costo.porCasillero : 1);

  // 👓 Ver conos: el cono de detección (azul) y la zona de alerta (naranja) de todos los tokens
  // que se ven (los ocultos o en sigilo que no ves, tampoco muestran sus zonas).
  if(verZonas){
    const pintarZona = (lista, relleno, borde) => {
      if(!lista.length) return;
      ctx.beginPath();
      lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
      ctx.fillStyle = relleno; ctx.fill();
      ctx.strokeStyle = borde; ctx.lineWidth = 2 / z; ctx.stroke();
    };
    tokens.forEach((t, id) => {
      if(t.oculto && !soyGM) return;
      if(!tokenVisiblePorNiebla(t)) return;
      if(!lentesMuestra(id, t)) return;
      const est = estadoDe(t);
      if(est && (est.muerto || est.dormida)) return;   // muertos o invocaciones dormidas no ven
      const zn = zonasSigilo(t);
      pintarZona(zn.alerta, 'rgba(232,140,50,.38)', 'rgba(255,170,80,.9)');
      pintarZona(zn.cono, 'rgba(60,120,210,.45)', 'rgba(110,170,255,.95)');
    });
  }

  // Auras: una superficie de color semitransparente alrededor del token.
  tokens.forEach((t, id) => {
    if(t.oculto && !soyGM) return;
    if(!tokenVisiblePorNiebla(t)) return;
    const aura = auraDe(t);
    if(!aura) return;
    const dib = disposicion.find(d => d.id === id);
    const vis = visibles.get(id);
    const c = vis || (dib ? {x: dib.x, y: dib.y} : hexCentro(t.col, t.fila));
    if(aura.forma === 'hex'){
      dibujarAuraHex(vis ? mundoAHex(vis.x, vis.y) : {col: t.col, fila: t.fila}, aura, z);
      return;
    }
    ctx.beginPath();
    ctx.arc(c.x, c.y, aura.radio * ANCHO_CASILLA, 0, 2 * Math.PI);
    ctx.fillStyle = colorConAlfa(aura.color, 0.18); ctx.fill();
    ctx.strokeStyle = colorConAlfa(aura.color, 0.5); ctx.lineWidth = 2 / z; ctx.stroke();
  });

  // 📏🔮 Visualizador de rango: el área alrededor de tu propio token (nada de esto se guarda ni lo ven los demás).
  if(rangoActivo || rangoMagicoActivo){
    const mt = seleccion ? tokens.get(seleccion) : null;   // el rango es del token seleccionado
    const rr = mt && rangoDeToken(mt);
    if(mt && rr){
      if(rangoActivo && rr.rng > 0) dibujarRangoConVision({col: mt.col, fila: mt.fila}, Math.max(0, Math.round(rr.rng)), '#4FA8D8', z);
      if(rangoMagicoActivo && rr.casteo > 0) dibujarRangoConVision({col: mt.col, fila: mt.fila}, Math.max(0, Math.round(rr.casteo)), '#9B7BD4', z);
    }
  }

  // Tokens.
  disposicion = calcularDisposicion();
  // Si el token seleccionado dejó de verse (niebla, sigilo), se suelta.
  if(seleccion && tokens.has(seleccion) && !disposicion.some(d => d.id === seleccion)){
    const sel = seleccion;
    setTimeout(() => { if(seleccion === sel) seleccionar(null); }, 0);
  }
  const etiquetas = HEX * z >= 22;
  disposicion.forEach(d => {
    const t = tokens.get(d.id);
    let v = visibles.get(d.id);
    if(!v || d.arrastrado){ v = {x: d.x, y: d.y}; visibles.set(d.id, v); }
    else{
      const dx = d.x - v.x, dy = d.y - v.y;
      if(Math.abs(dx) + Math.abs(dy) > 0.5){ v.x += dx * 0.25; v.y += dy * 0.25; animando = true; }
      else{ v.x = d.x; v.y = d.y; }
    }
    const x = v.x, y = v.y, rad = d.radio;
    // Hexágono del token: mismo tamaño y orientación que la casilla de la
    // grilla (fijo — no rota con el frente), para que calce con el mapa.
    const puntos = verticesHex(x, y, rad);
    if(objetivosResaltados && objetivosResaltados.has(d.id)){   // al elegir un objetivo: los que están a tu alcance laten
      const pulso = 0.5 + 0.5 * Math.sin(performance.now() / 230);
      ctx.save();
      trazarPuntos(verticesHex(x, y, rad * (1.10 + 0.14 * pulso)));
      ctx.fillStyle = `rgba(255,205,80,${0.10 + 0.18 * pulso})`; ctx.fill();
      ctx.strokeStyle = `rgba(255,214,102,${0.6 + 0.4 * pulso})`; ctx.lineWidth = (3 + 2.5 * pulso) / z;
      ctx.shadowColor = 'rgba(255,190,60,.95)'; ctx.shadowBlur = (12 + 16 * pulso) / z; ctx.stroke();
      ctx.restore();
      animando = true;
    }
    // Oculto: solo lo dibuja el GM (los demás ni lo tienen en disposicion),
    // más transparente para acordarse de que los jugadores no lo ven.
    if(t.oculto || enSigilo(t)) ctx.globalAlpha = 0.5;

    trazarPuntos(verticesHex(x + 2 / z, y + 3 / z, rad));
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fill();

    const vin = vinculo(t);
    const est = estadoDe(t);
    const nombre = nombreDe(t);
    const mini = vin ? imagenLista(vin.miniatura) : imagenLista(t.imagen);

    trazarPuntos(puntos);
    ctx.fillStyle = t.color || '#9A867E'; ctx.fill();
    if(mini){
      ctx.save();
      trazarPuntos(puntos); ctx.clip();
      // La foto NO gira con el token (2026-09-24): se ve siempre de arriba para abajo, como en la ficha.
      // Lo que rota es el marco: el lado que mira se marca con la línea de FRENTE_COLOR.
      ctx.translate(x, y);
      ctx.drawImage(mini, -rad, -rad, rad * 2, rad * 2);
      ctx.restore();
    }
    if(est && (est.muerto || est.dormida)){
      trazarPuntos(puntos);
      ctx.fillStyle = 'rgba(15,12,14,.62)'; ctx.fill();
    }
    // Borde: dorado tuyos, verde otros jugadores, rojo creeps, gris NPC.
    trazarPuntos(puntos);
    ctx.lineWidth = Math.max(2.5 / z, rad * 0.13);
    ctx.strokeStyle = BORDE[claseToken(t)];
    ctx.stroke();
    // Frente: el lado hacia el que mira el token (abajo con rotación 0) se resalta con una línea gruesa
    // saturada y con contorno negro, para ubicarlo de un vistazo sin seleccionar el token.
    // El lado 1 del hexágono (ver ESQUINAS) es "abajo".
    {
      const frenteI = (Math.round(num(t.rotacion || 0) / 60) + 1) % 6;
      const [fx1, fy1] = puntos[frenteI], [fx2, fy2] = puntos[(frenteI + 1) % 6];
      trazarFrente(fx1, fy1, fx2, fy2, rad, z, x, y);
    }

    if(seleccion === d.id){
      trazarPuntos(verticesHex(x, y, rad + 5 / z));
      ctx.strokeStyle = '#EDE3D2'; ctx.lineWidth = 2.5 / z; ctx.stroke();
    }

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if(!mini){
      ctx.fillStyle = '#fff';
      ctx.font = `700 ${rad * 0.95}px "Space Grotesk", system-ui, sans-serif`;
      ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 3;
      ctx.fillText(inicial(nombre), x, y + rad * 0.05);
      ctx.shadowBlur = 0;
    }
    if(est && est.muerto){
      ctx.strokeStyle = HP_COLOR; ctx.lineWidth = Math.max(2 / z, rad * 0.14);
      const k = rad * 0.45;
      ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke();
    }

    // Insignia en la esquina de arriba a la derecha: 🙈 = oculto por el GM, 🥷 = en sigilo
    // (los dos bajan a media transparencia y se confundían). Con los dos a la vez, el 🥷 va al lado.
    {
      const marcas = [];
      if(t.oculto) marcas.push('🙈');
      if(enSigilo(t)) marcas.push('🥷');
      if(marcas.length){
        const alfaPrevio = ctx.globalAlpha;
        ctx.globalAlpha = 1;
        const rm = Math.max(6 / z, rad * 0.3);
        marcas.forEach((m, i) => {
          const mx = x + rad * 0.62 - i * rm * 2.1, my = y - rad * 0.62;
          ctx.beginPath(); ctx.arc(mx, my, rm, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(15,12,14,.8)'; ctx.fill();
          ctx.font = `${rm * 1.35}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
          ctx.fillStyle = '#fff';
          ctx.fillText(m, mx, my + rm * 0.08);
        });
        ctx.globalAlpha = alfaPrevio;
      }
    }

    // Barras: vida (roja) y, en los PJ, SP (azul), justo debajo del token.
    // (rad*sqrt3/2: el hexágono de lado arriba no llega a "rad" de alto.)
    const bordeV = rad * SQ3 / 2;
    let debajo = y + bordeV + 3 / z;
    if(est){
      const bw = rad * 1.8, bh = Math.max(3 / z, rad * 0.13);
      const barra = (valor, color) => {
        ctx.fillStyle = 'rgba(15,12,14,.85)';
        ctx.fillRect(x - bw / 2 - 1 / z, debajo - 1 / z, bw + 2 / z, bh + 2 / z);
        ctx.fillStyle = color;
        ctx.fillRect(x - bw / 2, debajo, bw * valor, bh);
        debajo += bh + 2 / z;
      };
      const barras = barrasDe(t);
      if(barras.hp) barra(est.hp, HP_COLOR);
      if(barras.sp && est.sp !== null) barra(est.sp, SP_COLOR);
      if(barras.no2 && est.no2 !== null) barra(est.no2, NO2_COLOR);
    }

    // Estados: circulitos con la inicial sobre el borde de arriba del token
    // (verde = beneficio, violeta = perjuicio). Solo en el seleccionado: sin
    // seleccionar, el mapa muestra nada más que el token y sus barras.
    if(est && est.estados.length && seleccion === d.id){
      const max = 5;
      const lista = est.estados.slice(0, max);
      const r = Math.max(5 / z, rad * 0.24);
      lista.forEach((e, i) => {
        const ang = -Math.PI / 2 + (i - (lista.length - 1) / 2) * 0.62;
        const ex = x + bordeV * Math.cos(ang), ey = y + bordeV * Math.sin(ang);
        const resto = i === max - 1 && est.estados.length > max;
        ctx.beginPath(); ctx.arc(ex, ey, r, 0, 2 * Math.PI);
        ctx.fillStyle = resto ? '#3B2E34' : (ESTADO_COLOR[e.polaridad] || ESTADO_COLOR['']);
        ctx.fill();
        ctx.strokeStyle = '#0F0C0E'; ctx.lineWidth = 1.5 / z; ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = `700 ${r * 1.15}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillText(resto ? '+' + (est.estados.length - max + 1) : inicial(e.nombre), ex, ey + r * 0.06);
      });
    }

    // El nombre, solo del seleccionado, sobre un fondo translúcido.
    if(etiquetas && seleccion === d.id){
      const tam = 11 / z;
      ctx.font = `500 ${tam}px "Space Grotesk", system-ui, sans-serif`;
      const texto = nombre.length > 18 ? nombre.slice(0, 17) + '…' : nombre;
      const w = ctx.measureText(texto).width + 8 / z;
      const ty = debajo + 7 / z;
      ctx.fillStyle = 'rgba(15,12,14,.45)';
      ctx.fillRect(x - w / 2, ty - tam * 0.7, w, tam * 1.4);
      ctx.fillStyle = '#EDE3D2';
      ctx.fillText(texto, x, ty);
    }
    ctx.globalAlpha = 1;
  });

  // Trazos del lápiz: los temporales se ven un rato y se desvanecen sobre
  // el final (los borra el que los ve, por eso conviene que se note antes
  // de irse); los permanentes quedan fijos hasta que alguien los mueva o
  // los borre.
  trazos.forEach((t, id) => {
    const alfa = t.permanente ? 1 : Math.max(0, Math.min(1, (t.creadoMs + TRAZO_MS - ahora) / 800));
    if(!t.permanente && alfa <= 0) return;
    if(t.hex && t.grosor >= TRAZO_ZONA_GROSOR){
      dibujarZonaHex(t.celdas, t.color, alfa);
      if(!t.permanente) animando = true;
      return;
    }
    if(t.hex){
      dibujarRutaHex(t.celdas, t.color, alfa, id === trazoSeleccionado);
      if(!t.permanente) animando = true;
      return;
    }
    ctx.save();
    ctx.translate(t.origen.x, t.origen.y);
    ctx.rotate(t.rotacion * Math.PI / 180);
    ctx.beginPath();
    trazarSuave(ctx, t.puntos);
    ctx.globalAlpha = alfa;
    ctx.strokeStyle = t.color;
    ctx.lineWidth = t.grosor / z;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.stroke();
    ctx.globalAlpha = 1;
    if(id === trazoSeleccionado){
      ctx.setLineDash([6 / z, 5 / z]);
      ctx.strokeStyle = 'rgba(237,227,210,.85)';
      ctx.lineWidth = 1.5 / z;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
    if(id === trazoSeleccionado && puedeManipularTrazo(t)){
      const h = trazoManijaMundo(t);
      ctx.beginPath(); ctx.moveTo(t.origen.x, t.origen.y); ctx.lineTo(h.x, h.y);
      ctx.strokeStyle = 'rgba(79,168,224,.7)'; ctx.lineWidth = 1.5 / z; ctx.stroke();
      ctx.beginPath(); ctx.arc(h.x, h.y, 9 / z, 0, 2 * Math.PI);
      ctx.fillStyle = '#4FA8E0'; ctx.fill();
      ctx.strokeStyle = 'rgba(15,12,14,.6)'; ctx.lineWidth = 2 / z; ctx.stroke();
    }
    if(!t.permanente) animando = true;
  });
  // El trazo que se está dibujando ahora mismo, en vivo.
  if(dibujando && dibujando.hex) dibujarRutaHex(dibujando.celdas, lapizColor, 1);
  else if(dibujando && dibujando.puntos.length > 1){
    ctx.beginPath();
    trazarSuave(ctx, simplificarTrazo(dibujando.puntos, 1.5 / z));
    ctx.strokeStyle = lapizColor;
    ctx.lineWidth = 4 / z;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Niebla de guerra: encima del mapa y los tokens, debajo de los pings.
  // Negra = nunca vista; gris = ya descubierta pero fuera de la visión de
  // ahora. Al GM (sin "Como jugador") solo se le insinúa.
  if(nieblaActiva){
    const aplica = nieblaAplica();
    if(aplica) pintarNiebla();   // al GM sin "Como jugador" ya se le pintó antes de las estelas
    // Última posición vista de lo que ya no está a la vista.
    if(aplica){
      nieblaFantasmas.forEach((f, id) => {
        const t = tokens.get(id);
        if(!t || nieblaVista.has(nbPack(t.col, t.fila))) return;
        dibujarFantasma(f.col, f.fila, t.color, z);
      });
    }
  }
  // Sigilo: quien se escondió a la vista deja su última posición marcada un par de turnos.
  sigiloFantasmas.forEach((f, id) => {
    const t = tokens.get(id);
    if(!t || !ocultoPorSigiloParaMi(t) || (mantenimientoNumero || 0) >= f.hasta) return;
    dibujarFantasma(f.col, f.fila, t.color, z);
  });

  // Vista previa del token que se está colocando (lugar y orientación).
  if(colocando){
    const cel = colocando.paso === 'lugar' ? colocando.hover : colocando.celda;
    if(cel){
      const c = hexCentro(cel.col, cel.fila), rad = HEX * 0.68;
      const pts = verticesHex(c.x, c.y, rad);
      const imgPrev = colocando.datos.imagen ? imagenLista(colocando.datos.imagen) : null;
      ctx.save();
      ctx.globalAlpha = 0.75;
      trazarPuntos(pts);
      ctx.fillStyle = colocando.datos.color || '#9A867E'; ctx.fill();
      if(imgPrev){ ctx.save(); trazarPuntos(pts); ctx.clip(); ctx.translate(c.x, c.y); ctx.drawImage(imgPrev, -rad, -rad, rad * 2, rad * 2); ctx.restore(); }
      trazarPuntos(pts);
      ctx.setLineDash([6 / z, 4 / z]);
      ctx.strokeStyle = '#EDE3D2'; ctx.lineWidth = 2.5 / z; ctx.stroke();
      ctx.setLineDash([]);
      // Frente: el lado hacia el que mira; 0° = abajo.
      const fi = (Math.round(colocando.rotacion / 60) + 1) % 6;
      const [f1x, f1y] = pts[fi], [f2x, f2y] = pts[(fi + 1) % 6];
      trazarFrente(f1x, f1y, f2x, f2y, rad, z, c.x, c.y);
      if(!imgPrev){
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
        ctx.font = `700 ${rad * 0.95}px "Space Grotesk", system-ui, sans-serif`;
        ctx.fillText(inicial(colocando.datos.nombre), c.x, c.y + rad * 0.05);
      }
      ctx.restore();
      // En el paso de orientación, una flecha desde el centro hacia el frente.
      if(colocando.paso === 'orientacion'){
        const a = (90 + colocando.rotacion) * Math.PI / 180;
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.lineTo(c.x + Math.cos(a) * HEX * 1.35, c.y + Math.sin(a) * HEX * 1.35);
        ctx.strokeStyle = FRENTE_COLOR; ctx.lineWidth = 2 / z; ctx.setLineDash([4 / z, 4 / z]); ctx.stroke(); ctx.setLineDash([]);
      }
    }
  }

  // Ping (clic derecho): un anillo que se expande y se apaga solo, con
  // el nombre de quién lo mandó, arriba de todo lo demás.
  pings.forEach((p, id) => {
    const t = Math.max(0, (Date.now() - p.creadoMs) / PING_MS);
    if(t >= 1){ pings.delete(id); return; }
    animando = true;
    const radio = HEX * (0.4 + t * 2.2);
    const alfa = 1 - t;
    ctx.beginPath(); ctx.arc(p.x, p.y, radio, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(224,164,88,${alfa})`; ctx.lineWidth = 3 / z; ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, radio - HEX * 0.5), 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(224,164,88,${alfa * 0.6})`; ctx.lineWidth = 2 / z; ctx.stroke();
    ctx.save();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${12 / z}px "Space Grotesk", system-ui, sans-serif`;
    ctx.fillStyle = `rgba(237,227,210,${alfa})`;
    ctx.fillText(nombreMiembro(p.duenoUid), p.x, p.y - radio - 10 / z);
    ctx.restore();
  });

  // Anillo pulsante sobre el token al que se llegó desde la lista de turnos (unos segundos).
  if(iniResaltado){
    const restante = iniResaltado.hasta - Date.now();
    const tk = tokens.get(iniResaltado.id);
    if(restante <= 0 || !tk){ iniResaltado = null; }
    else{
      const v = visibles.get(iniResaltado.id) || hexCentro(tk.col, tk.fila);
      const pulso = 0.5 + 0.5 * Math.sin(Date.now() / 140);
      const alfa = Math.min(1, restante / 700);
      ctx.save();
      ctx.beginPath(); ctx.arc(v.x, v.y, HEX * (0.95 + 0.18 * pulso), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(15,8,10,${0.7 * alfa})`; ctx.lineWidth = 9 / z; ctx.stroke();
      ctx.strokeStyle = `rgba(255,214,110,${alfa})`; ctx.lineWidth = 5 / z; ctx.stroke();
      // Aviso de turno: además, dos ondas que se expanden desde el token y se desvanecen (para que se note a lo lejos).
      if(iniResaltado.turno){
        [0, 0.5].forEach(desfase => {
          const fase = ((Date.now() / 1400) + desfase) % 1;
          ctx.beginPath(); ctx.arc(v.x, v.y, HEX * (0.9 + 2.2 * fase), 0, 2 * Math.PI);
          ctx.strokeStyle = `rgba(255,214,110,${(1 - fase) * 0.85 * alfa})`; ctx.lineWidth = 4 / z; ctx.stroke();
        });
      }
      ctx.restore();
      animando = true;
    }
  }

  // Pulso de duelo minimizado/de fondo: ver dueloParesActivos() más arriba.
  duelosPulsoPares.forEach(p => {
    [p.atacanteTokenId, p.defensorTokenId].forEach(id => {
      if(!id) return;
      const tk = tokens.get(id);
      if(!tk || (tk.oculto && !soyGM) || !tokenVisiblePorNiebla(tk)) return;
      const v = visibles.get(id) || hexCentro(tk.col, tk.fila);
      const pulso = 0.5 + 0.5 * Math.sin(Date.now() / 260);
      ctx.save();
      ctx.beginPath(); ctx.arc(v.x, v.y, HEX * (0.85 + 0.14 * pulso), 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(15,8,10,${0.55 + 0.15 * pulso})`; ctx.lineWidth = 7 / z; ctx.stroke();
      ctx.strokeStyle = `rgba(224,90,70,${0.55 + 0.35 * pulso})`; ctx.lineWidth = 3.5 / z; ctx.stroke();
      ctx.restore();
      animando = true;
    });
    // Fase 'dodge' (Paso 4/7 del casteo): al defensor le queda dibujado un anillo de 2 casilleros,
    // como referencia visual de hasta dónde se puede arrastrar para intentar salir del área.
    if(p.fase === 'dodge' && p.defensorTokenId){
      const tk = tokens.get(p.defensorTokenId);
      if(tk && !(tk.oculto && !soyGM) && tokenVisiblePorNiebla(tk)) dibujarAuraHex(tk, {radio: 2, color: '#4FA88C'}, z);
    }
  });

  // Hechizos de área en curso (Paso 4/7 del casteo, docs/reglas-casteo.md §1.3): el círculo se ve para
  // TODOS los conectados (no solo el GM) mientras dura la cascada — ver escucharAreas().
  areasActivas.forEach(a => {
    if(!(a.centro && a.centro.cono)){ dibujarAuraHex(a.centro, {radio: a.radio, color: '#9B7BD4'}, z); return; }
    // El cono de una habilidad (Sonic Boom): sus casillas, en el mismo violeta.
    const celdas = zonasSigilo({col: a.centro.col, fila: a.centro.fila, rotacion: num(a.centro.rot)}).cono;
    ctx.beginPath();
    celdas.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.fillStyle = 'rgba(155,123,212,.28)'; ctx.fill();
    ctx.strokeStyle = 'rgba(155,123,212,.9)'; ctx.lineWidth = 2 / z; ctx.stroke();
  });

  if(dibujarEfectosTeleport()) animando = true;

  // Mientras se arrastra un token en combate, una esferita con los Nitros que le quedarían al llegar a donde está el
  // mouse queda pegada al token (verde; en magenta si se pasa) — no depende del anillo del HUD (2026-09-24).
  if(arrastre && arrastre.movio && !arrastre.libre && arrastre.costo && modoMapa === 'combate' && tokens.has(arrastre.id)){
    const porCas = arrastre.costo.porCasillero, gastado = Math.max(0, arrastre.ruta.length - 1) * porCas;
    const quedan = arrastre.costo.disponibles - gastado;
    const bx = arrastre.x + HEX * 0.75, by = arrastre.y - HEX * 0.75, rad = 17 / z;
    ctx.save();
    ctx.beginPath(); ctx.arc(bx, by, rad, 0, 2 * Math.PI);
    ctx.fillStyle = quedan >= 0 ? 'rgba(20,70,36,.95)' : 'rgba(90,10,86,.95)'; ctx.fill();
    ctx.strokeStyle = quedan >= 0 ? NO2_COLOR : 'rgb(226,40,214)'; ctx.lineWidth = 3 / z; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = `700 ${14 / z}px "Space Mono", monospace`;
    ctx.fillText(String(quedan), bx, by - 2 / z);
    ctx.font = `700 ${8 / z}px "Space Mono", monospace`;
    ctx.fillText('No2', bx, by + 9 / z);
    ctx.restore();
  }

  // Clima del sigilo: quien tiene un personaje en sigilo ve el mapa con un
  // filtro violáceo tenue.
  if(yoEnSigilo()){
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(112, 60, 190, 0.16)';
    ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  }

  hudUbicar();
  return animando;
}

function tokenEn(x, y){
  for(let i = disposicion.length - 1; i >= 0; i--){
    const d = disposicion[i];
    const v = visibles.get(d.id) || d;
    if(Math.hypot(v.x - x, v.y - y) <= d.radio + 3) return d.id;
  }
  return null;
}

