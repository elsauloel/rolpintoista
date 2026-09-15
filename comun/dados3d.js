/* =========================================================
   DADOS 3D
   Compartido por mapa, ficha y gm-tools (y la pantalla de configuración
   comun/prueba-dados.html). Cuando llega una tirada nueva a la Mesa, los
   dados ruedan encima de la herramienta y caen en el resultado ya
   sorteado (no se vuelve a tirar nada ni se escribe en Firebase).

   - Librería: dice-box-threejs (MIT), desde jsDelivr, con sus texturas y
     sonidos. Se descarga recién con la primera tirada.
   - Estilo y encendido/apagado: por navegador, en localStorage
     ('dados3d'). Cada uno ve todas las tiradas con su propio estilo.
   - Tiradas con más de DADOS_MAX dados, o con dados que la librería no
     tiene, no se animan (la Mesa las muestra igual).
   ========================================================= */

const DADOS_LIBRERIA = 'https://cdn.jsdelivr.net/npm/@3d-dice/dice-box-threejs@0.0.12/dist/dice-box-threejs.umd.js';
const DADOS_RECURSOS = 'https://cdn.jsdelivr.net/npm/@3d-dice/dice-box-threejs@0.0.12/public/';
const DADOS_CLAVE = 'dados3d';
const DADOS_MAX = 12;
const DADOS_CARAS = [2, 4, 6, 8, 10, 12, 20];
const DADOS_QUIETOS_MS = 2200;  // cuánto quedan a la vista después de caer

// Estilo de la mesa por defecto (elegido en la página de prueba).
const DADOS_DEFECTO = {
  animacion: true,
  colorset: 'personalizado',
  'color-fondo': '#4A0E6E',
  'color-numero': '#EAF20A',
  'color-borde': '#1F5C1F',
  textura: 'bronze01',
  material: 'wood',
  tamano: '80',
  fuerza: '1.2',
  sombras: true,
  sonido: true,
  superficie: 'green-felt',
  volumen: '95',
};

function dadosPrefs(){
  let guardadas = {};
  try{ guardadas = JSON.parse(localStorage.getItem(DADOS_CLAVE) || '{}') || {}; }catch(e){}
  return {...DADOS_DEFECTO, ...guardadas};
}
function dadosGuardarPrefs(prefs){
  try{ localStorage.setItem(DADOS_CLAVE, JSON.stringify(prefs)); }catch(e){}
}
function dadosActivos(){ return dadosPrefs().animacion !== false; }
function dadosActivar(si){ dadosGuardarPrefs({...dadosPrefs(), animacion: !!si}); }

// Preferencias -> configuración de la librería.
function dadosConfigLibreria(p){
  const c = {
    assetPath: DADOS_RECURSOS,
    sounds: !!p.sonido,
    volume: Number(p.volumen),
    shadows: !!p.sombras,
    theme_surface: p.superficie,
    theme_material: p.material,
    baseScale: Number(p.tamano),
    strength: Number(p.fuerza),
    gravity_multiplier: 400,
    light_intensity: 0.8,
  };
  if(p.colorset === 'personalizado'){
    // El nombre identifica la combinación: la librería guarda cada juego por nombre.
    c.theme_customColorset = {
      name: `rp-${p['color-fondo']}-${p['color-numero']}-${p['color-borde']}-${p.textura}-${p.material}`,
      foreground: p['color-numero'], background: p['color-fondo'], outline: p['color-borde'],
      texture: p.textura, material: p.material,
    };
  }else{
    c.theme_colorset = p.colorset;
  }
  return c;
}

function dadosCargarLibreria(){
  if(window['dice-box-threejs']) return Promise.resolve();
  if(!dadosCargarLibreria.promesa){
    dadosCargarLibreria.promesa = new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = DADOS_LIBRERIA;
      s.onload = res;
      s.onerror = () => { dadosCargarLibreria.promesa = null; rej(new Error('No se pudo cargar la librería de dados')); };
      document.head.appendChild(s);
    });
  }
  return dadosCargarLibreria.promesa;
}
function dadosClase(){
  const m = window['dice-box-threejs'];
  return m && m.default ? m.default : m;
}

/* ---------- Caja de dados sobre la herramienta ---------- */

const dados = {caja: null, firma: '', capa: null, cola: [], ocupado: false, ocultarT: null};

function dadosCapa(){
  if(dados.capa) return dados.capa;
  const capa = document.createElement('div');
  capa.id = 'dados3d-capa';
  capa.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:96;opacity:0;transition:opacity .35s';
  document.body.appendChild(capa);
  dados.capa = capa;
  return capa;
}

// Arma la caja la primera vez, o de nuevo si cambió el estilo o el tamaño de la ventana.
async function dadosCaja(){
  const prefs = dadosPrefs();
  const firma = JSON.stringify([prefs, innerWidth, innerHeight]);
  if(dados.caja && dados.firma === firma) return dados.caja;
  await dadosCargarLibreria();
  const capa = dadosCapa();
  capa.innerHTML = '';
  const DiceBox = dadosClase();
  const caja = new DiceBox('#dados3d-capa', dadosConfigLibreria(prefs));
  await caja.initialize();
  dados.caja = caja;
  dados.firma = firma;
  return caja;
}

// "1d20+2d6+3" y [17, 4, 2] -> "1d20+2d6@17,4,2"; null si no se puede animar.
function dadosNotacion(formula, rolls){
  const valores = (rolls || []).map(v => Math.round(Number(v)));
  const grupos = [];
  const re = /(\d*)d(\d+)/gi;
  let m;
  while((m = re.exec(String(formula || '')))){
    const n = parseInt(m[1] || '1', 10);
    const caras = parseInt(m[2], 10);
    if(!DADOS_CARAS.includes(caras) || n < 1) return null;
    grupos.push({n, caras});
  }
  const cantidad = grupos.reduce((a, g) => a + g.n, 0);
  if(!cantidad || cantidad > DADOS_MAX || cantidad !== valores.length) return null;
  let i = 0;
  for(const g of grupos){
    for(let k = 0; k < g.n; k++, i++){
      if(!(valores[i] >= 1 && valores[i] <= g.caras)) return null;
    }
  }
  return grupos.map(g => `${g.n}d${g.caras}`).join('+') + '@' + valores.join(',');
}

async function dadosSiguiente(){
  if(dados.ocupado) return;
  const notacion = dados.cola.shift();
  if(!notacion) return;
  dados.ocupado = true;
  clearTimeout(dados.ocultarT);
  try{
    const caja = await dadosCaja();
    dadosCapa().style.opacity = '1';
    await caja.roll(notacion);
    await new Promise(r => setTimeout(r, dados.cola.length ? 600 : DADOS_QUIETOS_MS));
  }catch(err){
    console.error('Dados 3D:', err);
  }finally{
    dados.ocupado = false;
    if(dados.cola.length){
      dadosSiguiente();
    }else if(dados.capa){
      dados.capa.style.opacity = '0';
      dados.ocultarT = setTimeout(() => { if(dados.caja && !dados.ocupado) dados.caja.clearDice(); }, 400);
    }
  }
}

// Punto de entrada: una tirada de la Mesa ({formula, rolls}).
function dadosAnimarTirada(t){
  if(!t || !dadosActivos() || document.hidden) return;
  // Ficha o gm-tools abiertas dentro del mapa (Botonera, Mantenimiento en
  // segundo plano): no animan, ya lo hace el mapa.
  const html = document.documentElement.classList;
  if(html.contains('modo-botonera') || html.contains('modo-mantenimiento')) return;
  const notacion = dadosNotacion(t.formula, t.rolls);
  if(!notacion) return;
  if(dados.cola.length >= 4) dados.cola.shift();  // si se acumulan, se saltean las más viejas
  dados.cola.push(notacion);
  dadosSiguiente();
}

// Botón chico para prender/apagar la animación (lo usan las cajitas de Mesa).
function dadosBotonHtml(){
  return '<button type="button" class="dados3d-boton">🎲</button>';
}
function dadosConectarBoton(cont){
  (cont || document).querySelectorAll('.dados3d-boton').forEach(b => {
    const pintar = () => {
      const si = dadosActivos();
      b.textContent = si ? '🎲' : '⚀';
      b.style.opacity = si ? '1' : '.45';
      b.title = si ? 'Dados 3D prendidos (clic para apagar)' : 'Dados 3D apagados (clic para prender)';
    };
    pintar();
    b.onclick = e => { e.stopPropagation(); dadosActivar(!dadosActivos()); pintar(); };
    window.addEventListener('storage', ev => { if(ev.key === DADOS_CLAVE) pintar(); });
  });
}
