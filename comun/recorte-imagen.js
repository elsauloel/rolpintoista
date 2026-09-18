/* =========================================================
   RECORTE DE IMAGEN — elegir qué parte de una foto se ve
   Antes de guardar una imagen chica y cuadrada (token, retrato…), deja
   arrastrar y hacer zoom para elegir el recorte, en vez de cortar
   siempre el centro nomás.

   recortarImagen(file, {lado, tope}) devuelve una promesa con el data
   URL final (jpeg, tratando de quedar bajo `tope` bytes) o rechaza con
   Error('cancelado') si el usuario cierra el cuadro sin elegir, o
   Error('no-image')/Error('bad-image') si el archivo no sirve.

   Como lupa.js: este archivo arma el marcado y la lógica, pero el CSS
   de .recorte-scrim/.recorte-caja/etc. va en cada herramienta que lo
   use (ver vtt-hexgrid/mapa.html), con sus propias variables de color.
   ========================================================= */

const RECORTE_VISOR_PX = 320;
const RECORTE_ZOOM_MAX = 4;

function recortarImagen(file, opciones){
  const lado = (opciones && opciones.lado) || 96;
  const tope = (opciones && opciones.tope) || 60000;
  return new Promise((res, rej) => {
    if(!file.type || !file.type.startsWith('image/')){ rej(new Error('no-image')); return; }
    const lector = new FileReader();
    lector.onerror = () => rej(lector.error);
    lector.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error('bad-image'));
      img.onload = () => abrirRecorte(img, lado, tope, res, rej);
      img.src = lector.result;
    };
    lector.readAsDataURL(file);
  });
}

function abrirRecorte(img, lado, tope, res, rej){
  const anterior = document.getElementById('recorte-scrim');
  if(anterior) anterior.remove();
  const V = RECORTE_VISOR_PX;
  const scrim = document.createElement('div');
  scrim.id = 'recorte-scrim';
  scrim.className = 'recorte-scrim';
  scrim.innerHTML = `<div class="recorte-caja">
    <p class="recorte-titulo">Elegí qué parte de la imagen se ve</p>
    <div class="recorte-visor" style="width:${V}px;height:${V}px"><img id="recorte-img" draggable="false"></div>
    <input type="range" id="recorte-zoom" min="100" max="${RECORTE_ZOOM_MAX * 100}" value="100" step="1">
    <p class="recorte-ayuda">Arrastrá la imagen para moverla; la barra (o la rueda del mouse) para acercar o alejar.</p>
    <div class="fila recorte-botones">
      <button type="button" class="btn" id="recorte-cancelar">Cancelar</button>
      <button type="button" class="btn primary" id="recorte-usar">Usar esta parte</button>
    </div>
  </div>`;
  document.body.appendChild(scrim);
  const visor = scrim.querySelector('.recorte-visor');
  const elImg = scrim.querySelector('#recorte-img');
  const zoomInput = scrim.querySelector('#recorte-zoom');
  elImg.src = img.src;

  // "Cover": con zoom 1 el lado más chico de la imagen llena el visor
  // (sin dejar bordes vacíos); el zoom de acá para adelante solo acerca.
  const escalaBase = V / Math.min(img.naturalWidth, img.naturalHeight);
  let z = 1, tx = 0, ty = 0;
  const dims = () => ({dispW: img.naturalWidth * escalaBase * z, dispH: img.naturalHeight * escalaBase * z});
  const clamp = () => {
    const {dispW, dispH} = dims();
    tx = Math.min(0, Math.max(V - dispW, tx));
    ty = Math.min(0, Math.max(V - dispH, ty));
  };
  const aplicar = () => {
    const {dispW, dispH} = dims();
    elImg.style.width = dispW + 'px';
    elImg.style.height = dispH + 'px';
    elImg.style.transform = `translate(${tx}px, ${ty}px)`;
  };
  {
    const {dispW, dispH} = dims();
    tx = (V - dispW) / 2; ty = (V - dispH) / 2;
  }
  aplicar();

  let arrastre = null;
  visor.addEventListener('pointerdown', e => {
    visor.setPointerCapture(e.pointerId);
    arrastre = {x: e.clientX, y: e.clientY, tx, ty};
  });
  visor.addEventListener('pointermove', e => {
    if(!arrastre) return;
    tx = arrastre.tx + (e.clientX - arrastre.x);
    ty = arrastre.ty + (e.clientY - arrastre.y);
    clamp(); aplicar();
  });
  const soltar = () => { arrastre = null; };
  visor.addEventListener('pointerup', soltar);
  visor.addEventListener('pointercancel', soltar);

  // Cambia el zoom manteniendo fijo el punto (cx,cy) del visor — con la
  // rueda del mouse, el punto bajo el cursor; con la barra, el centro.
  const porZoom = (nuevoZ, cx, cy) => {
    const antes = dims();
    const fx = (cx - tx) / antes.dispW, fy = (cy - ty) / antes.dispH;
    z = Math.max(1, Math.min(RECORTE_ZOOM_MAX, nuevoZ));
    const despues = dims();
    tx = cx - fx * despues.dispW; ty = cy - fy * despues.dispH;
    clamp(); aplicar();
    zoomInput.value = Math.round(z * 100);
  };
  zoomInput.addEventListener('input', () => porZoom(zoomInput.value / 100, V / 2, V / 2));
  visor.addEventListener('wheel', e => {
    e.preventDefault();
    const r = visor.getBoundingClientRect();
    porZoom(z * (e.deltaY < 0 ? 1.1 : 1 / 1.1), e.clientX - r.left, e.clientY - r.top);
  }, {passive: false});

  const onEscape = e => { if(e.key === 'Escape') cancelar(); };
  document.addEventListener('keydown', onEscape);
  const cerrar = () => { document.removeEventListener('keydown', onEscape); scrim.remove(); };
  const cancelar = () => { cerrar(); rej(new Error('cancelado')); };
  scrim.querySelector('#recorte-cancelar').onclick = cancelar;
  scrim.addEventListener('pointerdown', e => { if(e.target === scrim) cancelar(); });
  scrim.querySelector('#recorte-usar').onclick = () => {
    cerrar();
    const escalaFinal = escalaBase * z;
    const sx = -tx / escalaFinal, sy = -ty / escalaFinal, sTam = V / escalaFinal;
    let ladoOut = lado, calidad = 0.85, dato = '';
    for(let i = 0; i < 6; i++){
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = ladoOut;
      const c = canvas.getContext('2d');
      c.fillStyle = '#17121A'; c.fillRect(0, 0, ladoOut, ladoOut);
      c.drawImage(img, sx, sy, sTam, sTam, 0, 0, ladoOut, ladoOut);
      dato = canvas.toDataURL('image/jpeg', calidad);
      if(dato.length < tope) break;
      calidad = Math.max(0.5, calidad - 0.1); ladoOut = Math.round(ladoOut * 0.85);
    }
    dato.length < tope ? res(dato) : rej(new Error('muy-grande'));
  };
}
