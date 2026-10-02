// js/15-ficha-lite.js — la ficha lite (2026-10-02, pedido del dueño), después del arranque: solo define funciones y escuchas.
/* ---------- Ficha lite ----------
   El 📜 de un token (o la F) abre encima del mapa —centrada, sin oscurecer— lo que hace falta a mano en un combate: qué hay en cada
   mano, la Defensa y las resistencias a crítico (al pasar el mouse, de dónde sale cada número), el resto del equipo, los estados y,
   en un personaje, DDE y Despojos. El dibujo es común (comun/ficha-lite.js); acá se leen los datos y se atienden los botones.
   - Un personaje o una invocación: su dueño, o el GM con 🎮 el control (sin el control, el GM sigue abriendo la ficha completa en
     otra pestaña). Los lee con FichaSesion (en vivo, sin guardar nada).
   - Un creep: el GM (de su parte privada, `creepsPriv`).
   Se cierra con F, Esc, ✕ o un clic afuera. Los botones abren las ventanas de siempre (Stats, Equipo y mochila, Tienda, Botín en la
   ficha del marco; Botonera, Acciones, Ver) o la ficha completa / GM Tools en otra pestaña. */
var fl = null;   // {host, raiz, clave, tipo: 'pj'|'inv'|'creep', fichaId, invId, creepId, sesion, fichaIdSesion, S, tienda}
const FL_PIEZA = '../comun/ficha-lite.js?v=20261002a';
const flAbierta = () => !!(fl && fl.host.style.display !== 'none');

function flCrear(){
  const host = document.createElement('div');
  host.id = 'ficha-lite';
  host.style.cssText = 'position:fixed;inset:0;z-index:88;display:none;align-items:center;justify-content:center';
  const raiz = host.attachShadow({mode: 'open'});
  raiz.innerHTML = `<style>${FichaLite.CSS}</style><div id="fl-contenido"></div>`;
  document.body.appendChild(host);
  raiz.addEventListener('click', e => {
    const b = e.composedPath().find(x => x && x.dataset && x.dataset.fl);
    if(b) flBoton(b.dataset.fl);
  });
  // Clic afuera de la ventanita: se cierra (en el recuadro aislado, el primer elemento del recorrido es el recuadro mismo).
  host.addEventListener('mousedown', e => { const t = e.composedPath()[0]; if(t === host || (t && t.id === 'fl-contenido')) cerrarFichaLite(); });
  return {host, raiz};
}

// q: {tipo: 'pj', fichaId} | {tipo: 'inv', fichaId, invId} | {tipo: 'creep', creepId}. Otra vez lo mismo: se cierra.
async function abrirFichaLite(q){
  const clave = q.tipo === 'creep' ? 'creep:' + q.creepId : q.fichaId + (q.invId ? SEP_INVOCACION + q.invId : '');
  if(flAbierta() && fl.clave === clave){ cerrarFichaLite(); return; }
  try{ await bnCargarPiezas(); await cargarPiezas([FL_PIEZA]); }
  catch(err){ console.error(err); toast('No se pudo abrir la ficha lite'); return; }
  if(!fl) fl = Object.assign({sesion: null, fichaIdSesion: '', S: null}, flCrear());
  Object.assign(fl, {clave, tipo: q.tipo, fichaId: q.fichaId || '', invId: q.invId || '', creepId: q.creepId || '', tienda: false});
  if(q.tipo !== 'creep' && (fl.fichaIdSesion !== q.fichaId || !fl.sesion)) flEscuchar(q.fichaId);
  fl.host.style.display = 'flex';
  flDibujar();
  if(q.tipo === 'pj') flMirarTienda(clave);
}
function cerrarFichaLite(){
  if(fl) fl.host.style.display = 'none';
}
// El personaje en vivo (el mismo armado que la Botonera nueva), para la ficha lite de él o de una de sus invocaciones.
function flEscuchar(fichaId){
  if(fl.sesion) FichaSesion.cortar(fl.sesion);
  fl.S = null;
  fl.fichaIdSesion = fichaId;
  const f = FichaSesion.nueva(fichaId, '', false, true);   // solo mirar: la ficha lite nunca guarda
  fl.sesion = f;
  FichaSesion.escuchar(f, {
    db: fbDb, ruta: fbRutaCampana(`fichas/${fichaId}`), vigente: () => !!fl && fl.sesion === f,
    alDoc: doc => {
      if(!doc.exists){ toast('Ese personaje ya no está en la mesa'); cerrarFichaLite(); return; }
      f.duenoUid = doc.data().duenoUid;
    },
    alCargar: armado => {
      const S = FichaGuardado.normalizar(armado.datos, {mezclarCatalogo: bnMezclarCatalogo}).S;
      FichaGuardado.ponerImagenesInvocaciones(S, armado.imgInvocaciones);
      FichaGuardado.completar(S);
      fl.S = S;
      f.cargada = true;
      flDibujar();
    },
    alControl: c => { f.control = c; },
    aplicarParte: (parte, datos) => FichaGuardado.aplicarParte(fl.S, parte, datos, {mezclarCatalogo: bnMezclarCatalogo, imgInvocaciones: f.ultimo.imgInvocaciones || ''}),
    alCambiar: () => { FichaGuardado.completar(fl.S); flDibujar(); },
    alErrorPartes: () => toast('No se pudo leer el personaje para la ficha lite'),
  });
}
// El botón 🏪 solo aparece con la tienda abierta (se mira al abrir la ficha lite).
async function flMirarTienda(clave){
  try{
    const doc = await fbDb.doc(fbRutaCampana('tienda/publicada')).get();
    const abierta = doc.exists && doc.data().abierta === true;
    if(fl && fl.clave === clave && fl.tienda !== abierta){ fl.tienda = abierta; flDibujar(); }
  }catch(err){ console.error('No se pudo mirar la tienda:', err); }
}
function flDibujar(){
  if(!flAbierta()) return;
  const cuerpo = fl.raiz.querySelector('#fl-contenido');
  const aviso = txt => { cuerpo.innerHTML = `<div class="fl-ventana"><header><div class="fl-gris">${esc(txt)}</div><button type="button" class="fl-cerrar" data-fl="cerrar">✕</button></header></div>`; };
  let modelo, botones;
  try{
    if(fl.tipo === 'creep'){
      const crudo = creepPrivadoDe(fl.creepId);
      if(!crudo){ aviso('Cargando el creep…'); return; }
      let sc = structuredClone(crudo);
      try{ sc = CreepCalculo.normalizar(sc) || sc; }catch(err){}
      modelo = FichaLite.creep(sc);
      botones = [
        {id: 'acciones', txt: '⚡ Acciones', tip: 'Las Acciones del creep (también con B)'},
        {id: 'ver', txt: '🔍 Ver todo', tip: 'La ficha completa del creep, de solo lectura, encima del mapa'},
        {id: 'gmtools', txt: '⚔ Editar en GM Tools', tip: 'Abre GM Tools en otra pestaña, con este creep para editarlo'},
      ];
    }else{
      if(!fl.S){ aviso('Cargando el personaje…'); return; }
      if(fl.tipo === 'inv'){
        const cruda = (fl.S.invocaciones || []).find(x => x && x.id === fl.invId);
        if(!cruda){ aviso('Esa invocación ya no está.'); return; }
        modelo = FichaLite.invocacion(InvCalculo.migrar(structuredClone(cruda)), fl.S.meta && fl.S.meta.nombre);
        botones = [
          {id: 'botonera', txt: '⚡ Botonera', tip: 'La Botonera de la invocación (también con B)'},
          {id: 'completa', txt: '📜 Ver la ficha completa', tip: 'La ficha del personaje que la invocó, en otra pestaña'},
        ];
      }else{
        modelo = FichaLite.personaje(fl.S);
        botones = [
          {id: 'stats', txt: '📊 Stats', tip: 'Tus atributos y stats'},
          {id: 'mochila', txt: '🎒 Abrir la mochila', tip: 'Equipo y mochila: equipar, sacar, cambiar'},
          ...(fl.tienda ? [{id: 'tienda', txt: '🏪 Tienda', tip: 'La tienda que publicó el GM: comprar, vender y reparar'}] : []),
          ...(combatePublicado() ? [{id: 'botin', txt: '🎁 Botín', tip: 'El botín del último combate'}] : []),
          {id: 'completa', txt: '📜 Ver mi ficha completa', tip: 'Tu ficha completa, en otra pestaña'},
        ];
      }
    }
  }catch(err){ console.error('Ficha lite:', err); aviso('No se pudo armar la ficha lite'); return; }
  cuerpo.innerHTML = FichaLite.html(modelo, botones);
}
function flBoton(id){
  if(!fl) return;
  const {fichaId, invId, creepId} = fl;
  const fichaUrl = '../ficha-personaje/ficha.html?partida=' + encodeURIComponent(FB_CAMPANA) + '#' + encodeURIComponent(fichaId);
  if(id === 'cerrar'){ cerrarFichaLite(); return; }
  if(id === 'completa'){ window.open(fichaUrl, '_blank', 'noopener'); return; }
  if(id === 'gmtools'){ window.open('../gm-toolset/gm-tools.html?partida=' + encodeURIComponent(FB_CAMPANA) + '&editar=' + encodeURIComponent(creepId), '_blank', 'noopener'); return; }
  cerrarFichaLite();   // lo demás abre otra ventana encima del mapa
  if(id === 'stats') abrirStatsMapa(fichaId);   // el mapa (js/11, A6a)
  else if(id === 'mochila') abrirEquipoMapa(fichaId);   // el mapa (js/11, A4)
  else if(id === 'tienda') abrirTiendaMapa(fichaId);   // el mapa (js/11, A5)
  else if(id === 'botin') abrirBotinMapa(fichaId);   // el mapa (js/11, A5)
  else if(id === 'botonera') abrirBotonera(fichaId, undefined, invId);
  else if(id === 'acciones') abrirAcciones(creepId);
  else if(id === 'ver') abrirAcciones(creepId, {tipo: 'abrir-ver-creep', creep: creepId});
}
// El creep cambió (su parte privada): si su ficha lite está abierta, se redibuja (lo llama actualizarEscuchasCreeps).
function flCreepCambio(id){ if(flAbierta() && fl.tipo === 'creep' && fl.creepId === id) flDibujar(); }
document.addEventListener('keydown', e => {
  if(e.key !== 'Escape' || !flAbierta() || !$('#botonera-capa').hidden || elegirDestinoCb) return;
  e.preventDefault();
  e.stopPropagation();
  cerrarFichaLite();
}, true);
