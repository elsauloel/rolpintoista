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
  const b = raiz && raiz.querySelector(sel);
  if(!b){ toast('No encontré el botón Atacar en la Botonera'); return; }
  b.click();
}
