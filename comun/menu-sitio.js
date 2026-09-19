/* =========================================================
   MENÚ DEL SITIO
   Botón ☰ fijo arriba a la izquierda, igual en todas las páginas (inicio,
   mapa, ficha, gm-tools, generador de tiendas). Abre un panel para
   navegar el sitio por ramas:

     Home (siempre primero) → todas las partidas
     Partida abierta (segunda) → su página, Mapa, personajes
       (tuyos y de los demás; el GM ve los de todos), GM Tools y Generador de tiendas (solo GM)
     Otras partidas → tus demás partidas
     Manual · Cerrar sesión

   Se carga después de sesion.js. Lee la cuenta y la partida de ahí
   (fbUsuario, fbMiembro, fbPartida, FB_CAMPANA) al abrirse, así que sirve
   aunque la página entre a la partida más tarde. Las listas (partidas y
   personajes) se leen de Firebase al abrir, con un rato de caché. No
   aparece dentro de los iframes del mapa (botonera, acciones,
   mantenimiento).
   ========================================================= */

const MENU_RAIZ = new URL('./', FB_INICIO).href;
const MENU_CACHE_MS = 60 * 1000;
const menuSitio = {panel: null, boton: null, partidas: null, partidasEn: 0, fichas: null, fichasEn: 0, fichasDe: ''};

function menuEsc(s){
  return String(s ?? '').replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
}
function menuUrl(ruta, partida, hash){
  return MENU_RAIZ + ruta + (partida ? '?partida=' + encodeURIComponent(partida) : '') + (hash ? '#' + hash : '');
}
function menuEsActual(url){
  const u = new URL(url);
  const sinIndex = p => p.replace(/\/index\.html$/, '/');
  return sinIndex(u.pathname) === sinIndex(location.pathname) && u.search === location.search && u.hash === location.hash;
}

function menuEstilos(){
  const s = document.createElement('style');
  s.textContent = `
#menu-sitio-boton{position:fixed;top:10px;left:10px;z-index:70;width:38px;height:38px;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:4px;padding:0;background:#1A1418;border:1px solid #3B2E34;border-radius:3px;
  cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.45)}
#menu-sitio-boton span{display:block;width:18px;height:2px;border-radius:1px;background:#E0A458;transition:transform .2s,opacity .2s}
#menu-sitio-boton:hover{border-color:#C98545}
#menu-sitio-boton.abierto{border-color:#E0A458}
#menu-sitio-boton.abierto span:nth-child(1){transform:translateY(6px) rotate(45deg)}
#menu-sitio-boton.abierto span:nth-child(2){opacity:0}
#menu-sitio-boton.abierto span:nth-child(3){transform:translateY(-6px) rotate(-45deg)}
#menu-sitio{position:fixed;top:54px;left:10px;z-index:70;width:290px;max-width:calc(100vw - 20px);max-height:calc(100vh - 66px);
  overflow-y:auto;background:#1A1418;border:1px solid #3B2E34;border-radius:3px;box-shadow:0 12px 30px rgba(0,0,0,.6);
  font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.35;color:#EDE3D2;padding:6px 0;text-align:left}
#menu-sitio[hidden]{display:none!important}
#menu-sitio .ms-titulo{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#9A867E;padding:10px 14px 4px}
#menu-sitio .ms-cuenta{padding:4px 14px 8px;font-size:12px;color:#9A867E;border-bottom:1px solid #2A2126;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#menu-sitio a,#menu-sitio button.ms-item{display:flex;align-items:center;gap:9px;width:100%;padding:7px 14px;color:#EDE3D2;
  text-decoration:none;background:none;border:0;border-radius:0;font:inherit;text-align:left;cursor:pointer;text-transform:none;letter-spacing:0}
#menu-sitio a:hover,#menu-sitio button.ms-item:hover{background:#2A2126;color:#E0A458}
#menu-sitio a.actual{color:#E0A458;box-shadow:inset 3px 0 0 #E0A458}
#menu-sitio .ms-ico{width:18px;text-align:center;flex:none}
#menu-sitio .ms-rama{padding-left:24px}
#menu-sitio .ms-rama2{padding-left:44px;font-size:13px}
#menu-sitio .ms-extra{margin-left:auto;font-family:"Space Mono",monospace;font-size:10px;color:#9A867E;white-space:nowrap}
#menu-sitio .ms-partida{font-weight:700;color:#E0A458}
#menu-sitio .ms-nota{padding:4px 14px 4px 44px;font-size:12px;color:#9A867E}
#menu-sitio hr{border:0;border-top:1px solid #2A2126;margin:6px 0}
#btn-revivir{left:58px!important}`;
  document.head.appendChild(s);
}

function menuLink(url, ico, texto, {clase = '', extra = ''} = {}){
  const actual = menuEsActual(url) ? ' actual' : '';
  const extraHtml = extra ? `<span class="ms-extra">${menuEsc(extra)}</span>` : '';
  return `<a href="${menuEsc(url)}" class="${clase}${actual}"><span class="ms-ico">${ico}</span><span>${texto}</span>${extraHtml}</a>`;
}

// Partidas donde está la cuenta.
async function menuPartidas(){
  if(menuSitio.partidas && Date.now() - menuSitio.partidasEn < MENU_CACHE_MS) return menuSitio.partidas;
  const snap = await fbDb.collection('campanas').get();
  const lista = [];
  await Promise.all(snap.docs.filter(d => d.data().gmUid).map(async d => {
    try{
      const m = await fbDb.doc(`campanas/${d.id}/miembros/${fbUsuario.uid}`).get();
      if(m.exists) lista.push({id: d.id, nombre: d.data().nombre || 'Sin nombre', gm: m.data().gm === true});
    }catch(e){}
  }));
  lista.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  Object.assign(menuSitio, {partidas: lista, partidasEn: Date.now()});
  return lista;
}

// Personajes de la partida abierta, con el nombre de su jugador.
async function menuFichas(){
  if(menuSitio.fichas && menuSitio.fichasDe === FB_CAMPANA && Date.now() - menuSitio.fichasEn < MENU_CACHE_MS) return menuSitio.fichas;
  const [f, m] = await Promise.all([
    fbDb.collection(`campanas/${FB_CAMPANA}/fichas`).get(),
    fbDb.collection(`campanas/${FB_CAMPANA}/miembros`).get(),
  ]);
  const nombres = Object.fromEntries(m.docs.map(d => [d.id, d.data().nombre]));
  const fichas = f.docs
    .map(d => ({id: d.id, nombre: d.data().nombre || 'Sin nombre', duenoUid: d.data().duenoUid, dueno: nombres[d.data().duenoUid] || ''}))
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  Object.assign(menuSitio, {fichas, fichasDe: FB_CAMPANA, fichasEn: Date.now()});
  return fichas;
}

async function menuDibujar(){
  const p = menuSitio.panel;
  const conCuenta = !!(fbUsuario && fbDb);
  const enPartida = !!(conCuenta && FB_CAMPANA && fbMiembro && fbPartida);
  const esGM = enPartida && fbMiembro.gm === true;
  let partidas = null, fichas = null, error = '';

  const pintar = () => {
    let h = '';
    if(conCuenta) h += `<div class="ms-cuenta">${menuEsc(fbUsuario.email || fbUsuario.displayName || '')}</div>`;
    // Siempre primero: Home, que lleva a todas las partidas.
    h += menuLink(menuUrl('index.html'), '⌂', 'Home', {extra: 'todas las partidas'});
    if(enPartida){
      const mias = (fichas || []).filter(f => f.duenoUid === fbUsuario.uid);
      const otras = (fichas || []).filter(f => f.duenoUid !== fbUsuario.uid);
      h += '<hr><div class="ms-titulo" style="padding-top:0">Partida abierta</div>';
      h += menuLink(menuUrl('index.html', FB_CAMPANA), '▾', `<span class="ms-partida">${menuEsc(fbPartida.nombre)}</span>`, {extra: esGM ? 'GM' : 'jugador'});
      h += menuLink(menuUrl('vtt-hexgrid/mapa.html', FB_CAMPANA), '⬡', 'Mapa', {clase: 'ms-rama'});
      if(esGM){
        h += menuLink(menuUrl('gm-toolset/gm-tools.html', FB_CAMPANA), '⚔', 'GM Tools', {clase: 'ms-rama'});
        h += menuLink(menuUrl('gm-toolset/vendor-generator.html', FB_CAMPANA), '🏪', 'Generador de tiendas', {clase: 'ms-rama'});
        h += menuLink(menuUrl('ficha-personaje/ficha.html', FB_CAMPANA), '📜', 'Fichas de los jugadores', {clase: 'ms-rama'});
      }else{
        h += menuLink(menuUrl('ficha-personaje/ficha.html', FB_CAMPANA), '📜', 'Mis personajes', {clase: 'ms-rama'});
        mias.forEach(f => { h += menuLink(menuUrl('ficha-personaje/ficha.html', FB_CAMPANA, f.id), '·', menuEsc(f.nombre), {clase: 'ms-rama2'}); });
        if(fichas && !mias.length) h += '<div class="ms-nota">Todavía no tenés personajes.</div>';
        if(otras.length) h += '<div class="ms-titulo" style="padding-left:44px">De los demás</div>';
      }
      otras.forEach(f => { h += menuLink(menuUrl('ficha-personaje/ficha.html', FB_CAMPANA, f.id), '·', menuEsc(f.nombre), {clase: 'ms-rama2', extra: f.dueno}); });
      if(!fichas && !error) h += '<div class="ms-nota">Cargando personajes…</div>';
    }
    // Después de la partida abierta: las demás partidas.
    const otrasPartidas = (partidas || []).filter(x => !enPartida || x.id !== FB_CAMPANA);
    if(otrasPartidas.length){
      h += '<hr><div class="ms-titulo" style="padding-top:0">' + (enPartida ? 'Otras partidas' : 'Tus partidas') + '</div>';
      otrasPartidas.forEach(x => {
        h += menuLink(menuUrl('index.html', x.id), '▸', menuEsc(x.nombre), {clase: 'ms-rama', extra: x.gm ? 'GM' : ''});
      });
    }
    h += '<hr>' + menuLink(menuUrl('manual-usuario/manual.html', enPartida ? FB_CAMPANA : ''), '📖', 'Manual');
    if(error) h += `<div class="ms-nota" style="padding-left:14px;color:#D4574E">${menuEsc(error)}</div>`;
    if(conCuenta) h += '<hr><button type="button" class="ms-item" id="menu-sitio-salir"><span class="ms-ico">⎋</span><span>Cerrar sesión</span></button>';
    p.innerHTML = h;
    const salir = p.querySelector('#menu-sitio-salir');
    if(salir) salir.onclick = async () => {
      if(!confirm('¿Cerrar sesión en este navegador?')) return;
      await firebase.auth().signOut();
      location.href = menuUrl('index.html');
    };
  };

  pintar();
  if(!conCuenta) return;
  try{
    [partidas, fichas] = await Promise.all([menuPartidas(), enPartida ? menuFichas() : Promise.resolve(null)]);
  }catch(err){
    console.error('Menú del sitio:', err);
    error = 'No se pudieron leer las partidas o los personajes.';
  }
  if(!p.hidden) pintar();
}

function menuCerrar(){
  if(!menuSitio.panel || menuSitio.panel.hidden) return;
  menuSitio.panel.hidden = true;
  menuSitio.boton.classList.remove('abierto');
  menuSitio.boton.setAttribute('aria-expanded', 'false');
}

function menuIniciar(){
  const html = document.documentElement.classList;
  if(window.top !== window || ['modo-botonera', 'modo-mantenimiento', 'modo-acciones'].some(c => html.contains(c))) return;
  menuEstilos();
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.id = 'menu-sitio-boton';
  boton.title = 'Menú del sitio';
  boton.setAttribute('aria-label', 'Menú del sitio');
  boton.setAttribute('aria-expanded', 'false');
  boton.innerHTML = '<span></span><span></span><span></span>';
  const panel = document.createElement('nav');
  panel.id = 'menu-sitio';
  panel.hidden = true;
  document.body.append(boton, panel);
  Object.assign(menuSitio, {boton, panel});

  boton.onclick = e => {
    e.stopPropagation();
    if(!panel.hidden){ menuCerrar(); return; }
    panel.hidden = false;
    boton.classList.add('abierto');
    boton.setAttribute('aria-expanded', 'true');
    menuDibujar();
  };
  // Un link a la misma página con otro #personaje: el navegador solo
  // cambiaría el #, así que se recarga para abrir ese personaje.
  panel.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if(!a) return;
    const u = new URL(a.href);
    if(u.pathname === location.pathname && u.search === location.search && u.hash !== location.hash){
      e.preventDefault();
      location.href = a.href;
      location.reload();
    }
  });
  document.addEventListener('pointerdown', e => {
    if(!panel.hidden && !panel.contains(e.target) && !boton.contains(e.target)) menuCerrar();
  });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') menuCerrar(); });
}

menuIniciar();
