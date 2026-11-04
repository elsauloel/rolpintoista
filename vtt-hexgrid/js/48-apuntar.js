/* 🎯 Apuntar sin perderse (2026-10-15, dueño: «al poner atacar con rango, hay veces que el mapa te permitía ver el token de la persona que estaba
   atacando y no el que querías tener como objetivo, ni escanear el mapa para evaluar tus objetivos: tiene que haber alguna forma simple de poner
   atacar y poder mover el mapa sin tener que cancelar el ataque»).
   - Mientras se elige el objetivo (y siempre que no se esté escribiendo), las flechas del teclado mueven el mapa (js/06). Arrastrar el mapa y la
     rueda (zoom) ya andaban sin cancelar.
   - `encuadrarObjetivos()`: aleja y centra el mapa para que entren quien ataca y todos los que brillan (a su alcance). El botón «🔭 Ver mis
     objetivos» del cartel de abajo (dueloAvisoObjetivo, js/13) lo hace, y se hace solo al empezar a apuntar si alguno de los que brillan quedó
     fuera de la pantalla.
   - `atajoAtacar()`: la tecla A es el botón Atacar de la Botonera (o de las Acciones del creep): si no está abierta, la abre (la del token
     seleccionado o, un jugador, la de su personaje) y lo toca. */
let apuntarMioId = null;   // el token de quien ataca mientras elige el objetivo (lo pone dueloElegirObjetivoMapa, js/13)
const MOVER_FLECHA_PX = 120;
function moverMapaConFlecha(key){
  const d = {ArrowLeft: [1, 0], ArrowRight: [-1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1]}[key];
  if(!d) return false;
  vista.x += d[0] * MOVER_FLECHA_PX; vista.y += d[1] * MOVER_FLECHA_PX;
  guardarVista(); pedirDibujo();
  return true;
}
// ¿Algún punto (mundo) queda fuera de la parte visible del lienzo?
function apuntarFuera(p){
  const x = p.x * vista.zoom + vista.x, y = p.y * vista.zoom + vista.y, m = 40;
  return x < m || y < m || x > anchoPx - m || y > altoPx - m;
}
function encuadrarObjetivos(soloSiHaceFalta){
  const ids = [...(objetivosResaltados || [])];
  if(apuntarMioId && tokens.has(apuntarMioId)) ids.push(apuntarMioId);
  const ps = ids.map(id => tokens.get(id)).filter(Boolean).map(t => hexCentro(t.col, t.fila));
  if(!ps.length) return false;
  if(soloSiHaceFalta && !ps.some(apuntarFuera)) return false;
  const xs = ps.map(p => p.x), ys = ps.map(p => p.y), margen = HEX * 3;
  const ancho = Math.max(...xs) - Math.min(...xs) + margen * 2, alto = Math.max(...ys) - Math.min(...ys) + margen * 2;
  vista.zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.min(anchoPx / ancho, (altoPx - 120) / alto, Math.max(vista.zoom, 1))));
  centrarEn((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2);
  return true;
}
// A = Atacar.
async function atajoAtacar(){
  const sel = '[data-botoneraaccion="atacar"], [data-atacarcreep], [data-invatacar]';
  const abierto = () => (typeof bn !== 'undefined' && bn && !bn.host.hidden) ? bn.raiz : (typeof ac !== 'undefined' && ac && !ac.host.hidden) ? ac.raiz : null;
  let raiz = abierto();
  if(!raiz){
    if(!abrirBotoneraDeSeleccion()){
      if(seleccion){ toast('Ese token no tiene Botonera para vos'); return; }
      if(soyGM){ toast('Seleccioná un creep para atacar con la A'); return; }
      abrirBotoneraPrincipal();
    }
    for(let i = 0; i < 40; i++){   // hasta 4 s: que se abra y se dibuje
      raiz = abierto();
      if(raiz && raiz.querySelector(sel)) break;
      await new Promise(r => setTimeout(r, 100));
    }
  }
  const botones = raiz ? [...raiz.querySelectorAll(sel)] : [];
  if(!botones.length){ toast('No encontré el botón Atacar en la Botonera'); return; }
  // ⚔ ¿Con qué arma? (dueño, 2026-11-04: «al estar equipado con dos armas, al apretar A para atacar, lo primero que debería ver el usuario es
  // "¿con qué arma?"»). Hay un «Atacar» por arma en la Botonera (las de mano y las especiales, como una varita) o en las Acciones del creep: con
  // más de uno, se pregunta; con uno, como antes.
  const b = botones.length > 1 ? await atajoElegirArma(botones) : botones[0];
  if(!b) return;
  b.click();
}
// El cartel «⚔ ¿Con qué arma?»: un botón por cada «Atacar» de la Botonera, con su nombre, Tipo, costo de ahora y lo que tenga encima (🔥).
async function atajoElegirArma(botones){
  const t = seleccion && tokens.get(seleccion);
  let armas = [], estados = [];
  try{
    if(t && t.tipo === 'creep' && t.fichaId && typeof creepPrivadoDe === 'function'){
      const sc = creepPrivadoDe(t.fichaId);
      if(sc){ armas = Combatiente.armasDeMano(sc) || []; estados = sc.estados || []; }
    }else if(t){
      const v = typeof vinculo === 'function' ? vinculo(t) : null;
      const f = typeof fichasPub !== 'undefined' && fichasPub.get ? fichasPub.get(String(t.fichaId || '').split('~')[0]) : null;
      const r = (v && v.resumen) || (f && f.resumen);
      armas = (r && r.armasMano) || []; estados = (r && r.estados) || [];
    }
  }catch(err){ console.error('¿Con qué arma?', err); }
  const limpio = x => String(x || '').replace(/\s+/g, ' ').trim();
  const opciones = botones.map((b, i) => {
    const id = b.dataset.atacararma || b.dataset.arma || '';
    const a = armas.find(x => x && String(x.id || '') === String(id));
    const etiqueta = limpio(b.querySelector('.bt-label') ? b.querySelector('.bt-label').textContent : '');
    const titulo = limpio(b.getAttribute('title') || b.textContent);
    // nombre: el del arma si la encontramos; si no, lo que dice el botón («Atacar con X · …» → X)
    const nombre = a ? a.nombre : (/con (.+?)( \(|$| ·)/.exec(titulo) || [])[1] || etiqueta.replace(/^.*?·\s*/, '') || etiqueta || 'Atacar';
    const costo = limpio(b.querySelector('.bt-mod') ? b.querySelector('.bt-mod').textContent : '') || (/(\d+(?:,\d+)? No2(?: · 1\.º ataque)?)/.exec(etiqueta) || [])[1] || (/(\d+(?:,\d+)? No2(?: · 1\.º ataque)?)/.exec(titulo) || [])[1] || '';
    // el Tipo: el del arma; si la ficha no lo publica, el del catálogo con ese nombre
    const delCat = typeof CATALOGO_BASE !== 'undefined' && Array.isArray(CATALOGO_BASE) ? CATALOGO_BASE.find(x => x && x.nombre === nombre) : null;
    const tipoDado = (a && a.tipoDado) || (delCat && delCat.tipoDado);
    const tipo = /arma especial/.test(titulo) || (delCat && delCat.especial) ? 'arma especial' : tipoDado ? `Tipo ${tipoDado}` : '';
    let fuego = '';
    try{ const ae = a && Combatiente.armaElementalDelGolpe(estados, null, {id: a.id, nombre: a.nombre}); if(ae) fuego = ` · ${ae.txt || ae.corto || '🔥 Arma elemental'}`; }catch(e){}
    return {valor: i, texto: `⚔ ${nombre}`, detalle: [tipo, costo].filter(Boolean).join(' · ') + fuego};
  });
  const i = await Confirmar.elegir('', {titulo: '¿Con qué arma?', icono: '⚔', opciones, no: 'Cancelar'});
  return i === null || i === undefined ? null : botones[i];
}
