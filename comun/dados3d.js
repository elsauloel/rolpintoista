/* =========================================================
   DADOS 3D
   Compartido por mapa, ficha y gm-tools (y la pantalla de configuración
   comun/prueba-dados.html). Cuando llega una tirada nueva a la Mesa, los
   dados ruedan encima de la herramienta y caen en el resultado ya
   sorteado (no se vuelve a tirar nada ni se escribe en Firebase).

   - Librería: dice-box-threejs (MIT), desde jsDelivr, con sus texturas y
     sonidos. Se descarga recién con la primera tirada.
   - Varias tiradas a la vez se superponen (una caja por estilo) y cada
     tirada viaja con el estilo de quien la hizo (ver "Estilo que viaja").
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
const DADOS_QUIETOS_MS = 4500;  // cuánto quedan a la vista después de caer

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

/* ---------- Estilo que viaja con cada tirada ----------
   Cada uno tira con SU estilo (color, número, borde, textura y material,
   elegidos en la página de prueba). Ese estilo se publica junto con la
   tirada (campo `estilo` de la Mesa) para que todos vean los dados de cada
   uno con su color, como si hubiera varios juegos de dados sobre la mesa.
   Tamaño, fuerza, sombras y sonido siguen siendo de quien mira. */

function dadosEstiloTxt(){
  const p = dadosPrefs();
  const e = p.colorset === 'personalizado'
    ? {c: 'personalizado', f: p['color-fondo'], n: p['color-numero'], b: p['color-borde'], t: p.textura, m: p.material}
    : {c: p.colorset};
  return JSON.stringify(e);
}

// Lo que llega por la red no se toma tal cual: solo colores y nombres simples.
function dadosEstiloDe(txt){
  const propio = dadosPrefs();
  let e = null;
  try{ e = typeof txt === 'string' ? JSON.parse(txt) : null; }catch(err){ e = null; }
  if(!e || typeof e !== 'object') return propio;
  const color = v => typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v);
  const nombre = v => typeof v === 'string' && /^[a-z0-9_-]{1,30}$/i.test(v);
  if(e.c === 'personalizado' && color(e.f) && color(e.n) && color(e.b) && nombre(e.t) && nombre(e.m)){
    return {...propio, colorset: 'personalizado', 'color-fondo': e.f, 'color-numero': e.n, 'color-borde': e.b, textura: e.t, material: e.m};
  }
  if(nombre(e.c) && e.c !== 'personalizado') return {...propio, colorset: e.c};
  return propio;
}

/* ---------- Cajas de dados sobre la herramienta ----------
   Una caja (canvas transparente) por cada estilo distinto, todas
   superpuestas: las tiradas de varios jugadores conviven en pantalla y no
   se esperan unas a otras. Dentro de un mismo estilo, los dados nuevos se
   suman a los que ya están rodando o quietos. */

const dados = {cajas: new Map(), n: 0};
const DADOS_CAJAS_MAX = 6;       // canvas WebGL simultáneos (uno por estilo)
const DADOS_EN_MESA_MAX = 24;    // por caja; pasado esto se limpia lo viejo

function dadosCrearCapa(){
  const capa = document.createElement('div');
  capa.id = 'dados3d-capa-' + (++dados.n);
  capa.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:100000;opacity:0;transition:opacity .5s';
  document.body.appendChild(capa);
  return capa;
}

function dadosQuitarCaja(clave){
  const c = dados.cajas.get(clave);
  if(!c) return;
  clearTimeout(c.ocultarT);
  try{ c.caja.clearDice(); }catch(e){}
  c.capa.remove();
  dados.cajas.delete(clave);
}

// Caja del estilo dado; se rearma si cambió el tamaño de la ventana o algún ajuste del que mira.
async function dadosCaja(estilo){
  const firma = JSON.stringify([estilo, innerWidth, innerHeight]);
  const clave = JSON.stringify([estilo.colorset, estilo['color-fondo'], estilo['color-numero'], estilo['color-borde'], estilo.textura, estilo.material]);
  const hay = dados.cajas.get(clave);
  if(hay && hay.firma === firma) return hay;
  if(hay) dadosQuitarCaja(clave);
  await dadosCargarLibreria();
  // Si ya hay muchos estilos, se saca el que lleva más tiempo sin usarse.
  while(dados.cajas.size >= DADOS_CAJAS_MAX){
    const viejo = [...dados.cajas.entries()].sort((a, b) => a[1].uso - b[1].uso)[0];
    dadosQuitarCaja(viejo[0]);
  }
  const capa = dadosCrearCapa();
  const DiceBox = dadosClase();
  const caja = new DiceBox('#' + capa.id, dadosConfigLibreria(estilo));
  await caja.initialize();
  const c = {caja, capa, firma, uso: Date.now(), pendientes: 0, ocultarT: null};
  dados.cajas.set(clave, c);
  return c;
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

/* Destacar el dado más alto (2026-09-26, pedido del dueño, primero para los d20 del crítico; sirve para cualquier tirada de varios dados donde importa el mejor):
   cuando los dados quedan quietos, el más alto se agranda, sube hacia la cámara, brilla y suelta ondas concéntricas. Todo es opcional: si algo falla, los dados
   ruedan igual. Se pide con `destacar: 'max'` en la tirada (campo de la Mesa). */
function dadosEstilosOnda(){
  if(document.getElementById('dados3d-css')) return;
  const st = document.createElement('style');
  st.id = 'dados3d-css';
  st.textContent = '.dados3d-onda{position:absolute;width:90px;height:90px;margin:-45px 0 0 -45px;border:3px solid #FFD25A;border-radius:50%;opacity:0;pointer-events:none;box-shadow:0 0 14px rgba(255,190,60,.8);animation:dados3d-onda 1.6s ease-out infinite}' +
    '@keyframes dados3d-onda{0%{transform:scale(.35);opacity:.95}100%{transform:scale(3.2);opacity:0}}';
  document.head.appendChild(st);
}

function dadosDestacarMayor(c, notacion){
  const valores = String(notacion).split('@')[1];
  if(!valores) return;
  const vals = valores.split(',').map(v => parseInt(v, 10)).filter(v => Number.isFinite(v));
  const lista = c.caja.diceList || [];
  if(!vals.length || lista.length < vals.length) return;
  const nuevos = lista.slice(-vals.length);
  const die = nuevos[vals.indexOf(Math.max(...vals))];
  if(!die || !die.position || !die.scale) return;
  dadosEstilosOnda();
  if(c.destacado) c.destacado.cancelar();
  // Materiales propios (los de la librería se comparten entre dados del mismo tipo).
  const orig = die.material;
  const mats = (Array.isArray(orig) ? orig : [orig]).map(m => (m && m.clone ? m.clone() : m));
  die.material = Array.isArray(orig) ? mats : mats[0];
  mats.forEach(m => { if(m && m.emissive){ m.emissive.setHex(0xFFB400); m.emissiveIntensity = 0; } });
  const cam = c.caja.camera, render = () => c.caja.renderer.render(c.caja.scene, cam);
  const p0 = die.position.clone(), s0 = die.scale.x || 1;
  const dir = cam.position.clone().sub(p0).normalize();
  // Ondas concéntricas sobre la pantalla, centradas en el dado.
  cam.updateMatrixWorld();
  const v = p0.clone().project(cam), r = c.capa.getBoundingClientRect();
  const centro = document.createElement('div');
  centro.style.cssText = `position:absolute;left:${(v.x * 0.5 + 0.5) * r.width}px;top:${(-v.y * 0.5 + 0.5) * r.height}px;width:0;height:0;pointer-events:none`;
  for(let i = 0; i < 3; i++){ const o = document.createElement('div'); o.className = 'dados3d-onda'; o.style.animationDelay = (i * 0.5) + 's'; centro.appendChild(o); }
  c.capa.appendChild(centro);
  let vivo = true;
  const t0 = performance.now();
  const fin = () => { vivo = false; centro.remove(); };
  c.destacado = {cancelar: fin};
  const paso = ahora => {
    if(!vivo) return;
    const k = Math.min(1, (ahora - t0) / 800), c1 = 1.70158, c3 = c1 + 1;
    const e = 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);   // easeOutBack: sube con un pequeño rebote
    die.scale.setScalar(s0 + s0 * 0.8 * e);
    die.position.copy(p0).addScaledVector(dir, 70 * e);
    const pulso = 0.5 + 0.5 * Math.sin((ahora - t0) / 170);
    mats.forEach(m => { if(m && m.emissive) m.emissiveIntensity = (0.3 + 0.5 * pulso) * k; });
    try{ render(); }catch(err){ fin(); return; }
    if(ahora - t0 < DADOS_QUIETOS_MS - 300) requestAnimationFrame(paso); else fin();
  };
  requestAnimationFrame(paso);
}

async function dadosTirar(notacion, estilo, opts){
  let c = null;
  dados.rodando = (dados.rodando || 0) + 1;
  try{ window.dispatchEvent(new Event('dados-inicio')); }catch(e){}
  try{
    c = await dadosCaja(estilo);
    c.pendientes++;
    c.uso = Date.now();
    clearTimeout(c.ocultarT);
    if(c.destacado) c.destacado.cancelar();
    c.capa.style.opacity = '1';
    // Con la caja llena (dados viejos quietos) se limpia antes de sumar.
    const enMesa = (c.caja.diceList || []).length;
    if(c.pendientes === 1 && enMesa > DADOS_EN_MESA_MAX - DADOS_MAX) c.caja.clearDice();
    await c.caja.add(notacion);
    if(opts && opts.destacar === 'max'){ try{ dadosDestacarMayor(c, notacion); }catch(err){ console.error('Dados 3D: no se pudo destacar el más alto', err); } }
  }catch(err){
    console.error('Dados 3D:', err);
  }finally{
    if(c){
      c.pendientes = Math.max(0, c.pendientes - 1);
      c.uso = Date.now();
      // Cuando ya no ruedan dados de este estilo, quedan a la vista un rato y se apagan.
      if(c.pendientes === 0){
        clearTimeout(c.ocultarT);
        c.ocultarT = setTimeout(() => {
          if(c.destacado) c.destacado.cancelar();
          c.capa.style.opacity = '0';
          c.ocultarT = setTimeout(() => { if(c.pendientes === 0){ try{ c.caja.clearDice(); }catch(e){} } }, 600);
        }, DADOS_QUIETOS_MS);
      }
    }
    // Ya no rueda ninguno: los dados quedaron quietos y a la vista (el cuadro del duelo espera esto para mostrar el resultado).
    dados.rodando = Math.max(0, dados.rodando - 1);
    if(dados.rodando === 0){ try{ window.dispatchEvent(new Event('dados-quietos')); }catch(e){} }
  }
}

// Punto de entrada: una tirada de la Mesa ({formula, rolls, estilo?}).
function dadosAnimarTirada(t){
  if(!t || !dadosActivos() || document.hidden) return;
  // Ficha o gm-tools abiertas dentro del mapa (Botonera, Mantenimiento en
  // segundo plano): no animan, ya lo hace el mapa.
  const html = document.documentElement.classList;
  if(html.contains('modo-botonera') || html.contains('modo-mantenimiento') || html.contains('modo-acciones')) return;
  const notacion = dadosNotacion(t.formula, t.rolls);
  if(!notacion) return;
  const estilo = dadosEstiloDe(t.estilo);
  dadosTirar(notacion, estilo, {destacar: t.destacar});
  // Afortunado: ruedan los dos juegos de dados a la vez y un cartel dice cuál se eligió.
  if(t.ventaja && Array.isArray(t.ventaja.rolls)){
    const otra = dadosNotacion(t.formula, t.ventaja.rolls);
    if(otra) dadosTirar(otra, estilo);
    dadosCartelAfortunado(t);
  }
}

// Cartel sobre la pantalla mientras ruedan los dados del Afortunado: la tirada elegida (verde, ✔) y la descartada (gris, tachada).
function dadosCartelAfortunado(t){
  try{
    document.getElementById('dados-afortunado')?.remove();
    const d = document.createElement('div');
    d.id = 'dados-afortunado';
    d.style.cssText = 'position:fixed;top:14%;left:50%;transform:translateX(-50%);z-index:99999;pointer-events:none;background:rgba(20,14,18,.92);color:#EDE3D2;' +
      'border:2px solid #E0A458;border-radius:10px;padding:10px 18px;font:600 16px "Space Grotesk",system-ui,sans-serif;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,.6);' +
      'opacity:0;transition:opacity .4s';
    d.innerHTML = '🍀 Afortunado: tira dos veces y se queda con la mejor<br>' +
      `<span style="color:#7fdc86;font-size:22px">✔ ${Math.round(Number(t.ventaja.elegido))}</span> &nbsp; ` +
      `<span style="opacity:.55;text-decoration:line-through;font-size:20px">✘ ${Math.round(Number(t.ventaja.total))}</span>`;
    document.body.appendChild(d);
    setTimeout(() => { d.style.opacity = '1'; }, 1400);   // aparece cuando los dados ya casi frenaron
    setTimeout(() => { d.style.opacity = '0'; }, 6500);
    setTimeout(() => d.remove(), 7000);
  }catch(e){}
}


// Botón chico para prender/apagar la animación (lo usan las cajitas de Mesa).
function dadosBotonHtml(){
  return '<button type="button" class="dados3d-boton">🎲</button>';
}
const dadosPintores = new Set();
window.addEventListener('storage', ev => { if(ev.key === DADOS_CLAVE) dadosPintores.forEach(p => p()); });
// data-texto="1": el botón lleva la palabra ("🎲 Animación: sí"), no solo el dibujito.
function dadosConectarBoton(cont){
  (cont || document).querySelectorAll('.dados3d-boton').forEach(b => {
    const pintar = () => {
      if(!b.isConnected){ dadosPintores.delete(pintar); return; }
      const si = dadosActivos();
      b.textContent = b.dataset.texto ? (si ? '🎲 Animación: sí' : '⚀ Animación: no') : (si ? '🎲' : '⚀');
      b.style.opacity = si || b.dataset.texto ? '1' : '.45';
      b.title = si ? 'Dados 3D prendidos (clic para apagar)' : 'Dados 3D apagados (clic para prender)';
    };
    pintar();
    b.onclick = e => { e.stopPropagation(); dadosActivar(!dadosActivos()); pintar(); dadosPintores.forEach(p => p()); };
    dadosPintores.add(pintar);
  });
}
