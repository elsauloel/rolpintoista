/* =========================================================
   ⏳ PASAR DE DÍA (2026-10-12, dueño: «vamos a programar el paso del día»). Un pulso de renovación aparte del turno y del combate.
   El GM aprieta «⏳ Pasar de día» (la caja del Mantenimiento): `campanas/<id>/mapa/dia` = {dia, manual, actualizado} sube 1 y toda la mesa ve
   «☀ Día N» en la cabecera. Al llegar, cada pantalla renueva lo que maneja (`bnManejo`: sus personajes; el GM con 🎮 el control, esos):
   - **Descanso**: vida, SP y No2 al máximo (los caídos no se levantan solos), también sus invocaciones.
   - **Los estados con turnos terminan** (los permanentes, los de un ítem equipado y los derivados quedan).
   - **Los topes diarios**: el del talento de reparar (`S.reparadoTalento`; 3 puntos por nivel por día, comun/ficha-equipo.js).
   - **🃏 Wildcards** (2026-10-15, dueño): el GM elige el descanso (`descanso: 'bueno' | 'normal'` en el mismo documento): reparador = cada
     personaje queda con 2 wildcards si tenía menos; normal = el que no tenía recibe 1. Se usan como la Moneda Re-Roll (docs/reroll.md).
   **☀ El Anuncio del descanso** (2026-10-19, dueño): a cada jugador, lo que se le recargó (vida, SP, No2, wildcards, estados que terminaron,
   lo del equipo: anillos…) le aparece al centro con «Aceptar» (`diaPasos`, un momento `dia-descanso` con `paraUids`: su dueño y quien tiene 🎮 el control); los demás, en la Crónica.
   El GM además termina los estados con turnos de sus creeps (los que tienen token) y **repone la góndola** de la tienda publicada.
   Cada personaje guarda el día que ya aplicó (`S.diaAplicado`): no se aplica dos veces, y quien no estaba conectado lo recibe al entrar.
   Corregir el número a mano (✎) no renueva nada: solo cambia la cuenta (y todos lo anotan como aplicado).
   ========================================================= */
let diaActual = 0, diaManual = false, diaVisto = false, diaDescanso = 'normal';
const refDia = () => fbDb.doc(fbRutaCampana('mapa/dia'));
let diaEscuchando = false;
function escucharDia(){
  if(diaEscuchando || typeof fbDb === 'undefined' || !fbDb || typeof fbMiembro === 'undefined' || !fbMiembro) return;
  diaEscuchando = true;
  refDia().onSnapshot(doc => {
    const d = doc.exists ? doc.data() || {} : {};
    const antes = diaActual, yaVisto = diaVisto;
    diaActual = Math.max(0, Math.round(num(d.dia)));
    diaManual = !!d.manual;
    diaDescanso = d.descanso === 'bueno' ? 'bueno' : 'normal';   // 🃏 (2026-10-15): reparador = 2 wildcards, normal = 1
    diaVisto = true;
    if(typeof actualizarCabecera === 'function') actualizarCabecera();
    renderDiaBoton();
    if(yaVisto && diaActual > antes && !diaManual) amanecerMostrar();   // 🌞 la tarjeta de la tía (no al entrar ni al corregir el número)
    if(diaActual > 0) diaRevisar(antes);
  }, err => console.error('Error escuchando el día:', err));
}
function renderDiaBoton(){
  const b = $('#btn-dia-mapa');
  if(b) b.title = `Hoy es el Día ${diaActual || 0}. Pasa un día para toda la mesa: todos descansan (vida, SP y No2), terminan los estados con turnos, se renuevan los topes diarios y se repone la góndola de la tienda (solo GM)`;
}

// El descanso de un personaje y qué estados terminan: comun/ficha-mantenimiento.js (FichaMantenimiento.descansar / terminaAlPasarDia).
const diaTermina = e => FichaMantenimiento.terminaAlPasarDia(e);
const DIA_WILDCARDS = {normal: 1, bueno: 2};   // 🃏 cuántas carga cada descanso (dueño, 2026-10-15)
const diaDescansarPj = (S, descanso) => FichaMantenimiento.descansar(S, {wildcards: DIA_WILDCARDS[descanso] || 1});
// Un renglón del descanso → un paso del Anuncio, con su título.
// Un recuadro por personaje, con todo lo suyo adentro (dueño, 2026-10-30: «este reporte del paso del día está muy mal organizado, cada personaje
// debe tener un texto propio con la información completa en un recuadro para cada uno»): antes era un paso por línea (Vida, SP, No2…).
function diaPasos(nombre, lineas){
  const titulo = nombre || 'Tu personaje';
  if(!lineas.length) return [{titulo, texto: 'Ya estaba entero: no había nada para recargar.', resumen: 'ya estaba entero'}];
  const icono = l => /^vida /.test(l) ? '❤' : /^SP /.test(l) ? '🔵' : /^No2 /.test(l) ? '🟢' : /^terminaron/.test(l) ? '⏳'
    : /^(🃏|💍)/.test(l) ? '' : /^sigue caído/.test(l) ? '💀' : '•';
  const fila = l => { const i = icono(l), t = l.charAt(0).toUpperCase() + l.slice(1); return `<span style="display:block;margin:2px 0">${i ? i + ' ' : ''}${esc(t)}</span>`; };
  return [{titulo, html: lineas.map(fila).join(''), resumen: lineas.join(' · ')}];   // (resumen: para la Crónica)
}
let diaTrabajando = false;
async function diaRevisar(antes){
  if(diaTrabajando || !fbUsuario) return;
  diaTrabajando = true;
  try{
    if(typeof bnCargarPiezas === 'function') await bnCargarPiezas();
    const dia = diaActual, manual = diaManual, descanso = diaDescanso;
    const anuncios = new Map();   // uid del dueño → pasos del Anuncio (☀, 2026-10-19)
    // Mis personajes.
    for(const [fichaId] of fichasPub){
      if(typeof bnManejo !== 'function' || !bnManejo(fichaId)) continue;
      let lineas = null, nombre = '';
      try{
        await editarPersonajeMapa(fichaId, S => {
          lineas = null;
          // Corregido a mano: solo se anota el número (aunque sea más chico, así el próximo día se aplica bien).
          if(manual ? num(S.diaAplicado) === dia : num(S.diaAplicado) >= dia) return false;
          nombre = ((S.meta && S.meta.nombre) || '').trim();
          if(!manual) lineas = diaDescansarPj(S, descanso);
          S.diaAplicado = dia;
          return true;
        });
      }catch(err){ console.error('Pasar de día: no se pudo renovar a un personaje', err); }
      if(lineas){
        const txt = lineas.length ? lineas.join(' · ') : 'ya estaba entero';
        mesaLinea(`☀ Día ${dia}: ${nombre || 'un personaje'} descansó — ${txt}`, 'recordatorio', nombre);
        // A su dueño y, si el GM lo maneja con 🎮 el control, también a él.
        const f = fichasPub.get(fichaId), uids = [...new Set([(f && f.duenoUid) || '', (f && f.resumen && f.resumen.control) || ''].filter(Boolean))].sort();
        const k = uids.join(',');
        if(k){ if(!anuncios.has(k)) anuncios.set(k, []); anuncios.get(k).push(...diaPasos(nombre, lineas)); }
      }
    }
    // ☀ Lo que se le recargó a cada jugador, en un Anuncio con «Aceptar» (dueño, 2026-10-19: «lo que sea que se recargue… debe aparecerle en
    // un anuncio»). Le llega a su dueño aunque lo haya aplicado la pantalla del GM (con 🎮 el control); los demás lo ven en la Crónica.
    if(anuncios.size) await amanecerEspera();   // primero la tarjeta de la tía; el Anuncio, cuando se va
    for(const [k, pasos] of anuncios){
      if(typeof momentoAbrir !== 'function' || !pasos.length) continue;
      try{ await momentoAbrir({tipo: 'dia-descanso', icono: '☀', titulo: `Día ${dia}: descansaste`, estado: 'listo',
        resultado: pasos.map(p => `${p.titulo}: ${p.resumen || p.texto || ''}`).join(' · ').slice(0, 400),   // (las reglas: hasta 400)
        datos: {paraUids: k.split(','), aviso: true, boton: 'Aceptar', pasos: pasos.slice(0, 20)}}); }
      catch(err){ console.error('Pasar de día: no se pudo mostrar el anuncio', err); }
    }
    // El GM: los estados con turnos de sus creeps terminan, y la góndola de la tienda se repone (una sola vez, desde la pantalla que pasó el día).
    if(soyGM){
      const yaEsta = s => manual ? num(s.diaAplicado) === dia : num(s.diaAplicado) >= dia;
      for(const [creepId, p] of creepsPriv){
        const sc = p && p.sc;
        if(!sc || yaEsta(sc)) continue;
        try{
          await modificarCreep(creepId, s => {
            if(yaEsta(s)) return false;
            if(!manual) s.estados = (s.estados || []).filter(e => !diaTermina(e));
            if(!manual && s.modoSP) s.sp = CreepCalculo.spMax(s);   // 💧 descansó: SP lleno
            s.diaAplicado = dia;
            return true;
          });
        }catch(err){ console.error('Pasar de día: no se pudo renovar a un creep', err); }
      }
    }
  }finally{ diaTrabajando = false; }
}
// La góndola llena otra vez (P181): la tienda publicada dice qué ítems van en la góndola; el stock vuelve a sus unidades.
async function diaReponerGondola(){
  try{
    const pub = await fbDb.doc(fbRutaCampana('tienda/publicada')).get();
    if(!pub.exists) return '';
    let t = {};
    try{ t = JSON.parse(pub.data().json || '{}'); }catch(e){}
    const ids = (t.gondola || []).filter(id => (t.items || []).includes(id));
    if(!ids.length) return '';
    const n = typeof GeneradorTiendas !== 'undefined' && GeneradorTiendas.UNIDADES_GONDOLA ? GeneradorTiendas.UNIDADES_GONDOLA : 3;
    const ref = fbDb.doc(fbRutaCampana('tienda/stock'));
    const st = await ref.get();
    if(!st.exists) return '';
    await ref.update({gondola: Object.fromEntries(ids.map(id => [id, n])), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
    return `la góndola de la tienda se repuso (${ids.length} gastable${ids.length === 1 ? '' : 's'}, ${n} de cada uno)`;
  }catch(err){ console.error('Pasar de día: no se pudo reponer la góndola', err); return ''; }
}
async function pasarDeDia(){
  if(!soyGM) return;
  const sig = diaActual + 1;
  // 🃏 ¿Cómo descansaron? (dueño, 2026-10-15): reparador = hasta 2 wildcards; normal = hasta 1 (a quien no tiene). Lo demás del día, igual.
  const descanso = await Confirmar.elegir(`Pasa al Día ${sig}. Todos descansan (vida, SP y No2 al máximo; los caídos no se levantan), terminan los estados con turnos, se renuevan los topes diarios (el talento de reparar) y se repone la góndola de la tienda. ¿Cómo descansaron?`, {titulo: '⏳ Pasar de día', icono: '☀', no: 'Cancelar', opciones: [
    {valor: 'bueno', texto: '🌙 Descanso reparador', detalle: 'Durmieron bien, a salvo: cada uno queda con 2 wildcards 🃏 (si tenía menos).'},
    {valor: 'normal', texto: '💤 Descanso normal', detalle: 'Descansaron como pudieron: el que no tenía ninguna recibe 1 wildcard 🃏.'},
  ]});
  if(descanso !== 'bueno' && descanso !== 'normal') return;
  try{
    await refDia().set({dia: sig, manual: false, descanso, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
  }catch(err){ console.error(err); toast('No se pudo pasar de día'); return; }
  const gond = await diaReponerGondola();
  const texto = `☀ Pasó un día: es el Día ${sig}. ${descanso === 'bueno' ? '🌙 Descanso reparador: cada uno queda con 2 wildcards' : '💤 Descanso normal: el que no tenía wildcard recibe 1'}. Todos descansaron (vida, SP y No2 al máximo; los caídos siguen caídos), terminaron los estados con turnos y se renovaron los topes diarios${gond ? '; ' + gond : ''}.`;
  mesaLinea(texto, 'recordatorio', 'GM');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'dia', icono: '☀', titulo: `Día ${sig}`, resultado: texto, estado: 'listo', datos: {chico: true}});
}
async function corregirDia(){
  if(!soyGM) return;
  const t = prompt(`¿Qué día es? (hoy: Día ${diaActual}). Corregir el número no renueva nada.`, String(diaActual || 1));
  if(t === null) return;
  const n = Math.max(0, Math.round(num(t)));
  try{ await refDia().set({dia: n, manual: true, actualizado: firebase.firestore.FieldValue.serverTimestamp()}); toast(`Ahora es el Día ${n}`); }
  catch(err){ console.error(err); toast('No se pudo cambiar el día'); }
}
$('#btn-dia-mapa').onclick = () => pasarDeDia();
// El arranque (js/14, arrancarEnVivo) lo llama; si ya arrancó antes de que cargara este archivo, se empieza acá (2026-10-12: pasaba).
escucharDia();
$('#btn-dia-corregir').onclick = () => corregirDia();
/* 🌞 AMANESE QUE NO ES POCO (2026-10-19, dueño: «una referencia en chiste a esa tía cursi que te manda una tarjeta con Tweety y mensajes
   motivacionales mal escritos y cursis llenos de rosas y diseño feo»). Al pasar de día, en todas las pantallas, unos segundos al centro: un 🌞
   gigante (dueño: con el emoji, no con una imagen), el texto con faltas a propósito y una lluvia de corazones, chispas, hadas
   y flores. Se va sola o con un clic. Es a propósito fea: no «arreglarla». */
const AMANECER_EMOJIS = ['💖', '✨', '🧚', '🌸', '🌹', '💕', '🌼', '🦋', '💗', '🌷', '⭐', '🧚‍♀️', '💝', '🌺'];
function amanecerMostrar(){
  document.getElementById('amanecer-tia')?.remove();
  const em = n => Array.from({length: n}, (_, i) => AMANECER_EMOJIS[(i * 5 + Math.floor(Math.random() * 3)) % AMANECER_EMOJIS.length]).join('');
  const lluvia = Array.from({length: 46}, () => `<span class="am-cae" style="left:${Math.random() * 100}%;animation-delay:${(Math.random() * 2.5).toFixed(2)}s;animation-duration:${(3 + Math.random() * 3).toFixed(2)}s;font-size:${18 + Math.round(Math.random() * 26)}px">${AMANECER_EMOJIS[Math.floor(Math.random() * AMANECER_EMOJIS.length)]}</span>`).join('');
  const el = document.createElement('div');
  el.id = 'amanecer-tia';
  el.innerHTML = `<style>
    #amanecer-tia{position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;pointer-events:auto;cursor:pointer;
      background:radial-gradient(circle,rgba(255,182,230,.55),rgba(255,105,180,.25) 60%,transparent);animation:am-entra .6s ease-out, am-va .9s ease-in 7.2s forwards;overflow:hidden}
    #amanecer-tia .am-tarjeta{position:relative;text-align:center;padding:14px 30px 18px;max-height:94vh;box-sizing:border-box;border:6px dashed #ff2fa8;border-radius:30px;
      background:linear-gradient(135deg,#fff6a8,#ffc4ec 45%,#b8f2ff);box-shadow:0 0 0 6px #fff,0 0 0 12px #8a2be2,0 18px 50px rgba(0,0,0,.45);
      max-width:min(92vw,720px);animation:am-bambolea 2.4s ease-in-out infinite}
    #amanecer-tia .am-sol{width:min(34vh,320px);height:min(34vh,320px);object-fit:contain;filter:drop-shadow(0 0 28px #ffd400) drop-shadow(0 0 8px #ff8c00);animation:am-late 1.6s ease-in-out infinite}
    #amanecer-tia .am-solemoji{font-size:min(28vh,240px);line-height:1;filter:drop-shadow(0 0 24px #ffd400);animation:am-late 1.6s ease-in-out infinite}
    #amanecer-tia .am-fila{font-size:clamp(18px,4vh,30px);letter-spacing:2px;line-height:1.2}
    #amanecer-tia .am-texto{font-family:'Comic Sans MS','Comic Sans',cursive;font-weight:900;font-size:clamp(26px,min(6vw,8vh),64px);line-height:1.05;margin:6px 0;
      background:linear-gradient(90deg,#ff0080,#ff8c00,#ffe600,#00d26a,#00a2ff,#a200ff,#ff0080);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;
      -webkit-text-stroke:2px #5a0060;text-shadow:3px 3px 0 rgba(255,255,255,.7);animation:am-arcoiris 2.5s linear infinite;transform:rotate(-3deg)}
    #amanecer-tia .am-firma{font-family:'Comic Sans MS',cursive;font-size:17px;color:#c4007a;font-style:italic;margin-top:4px}
    #amanecer-tia .am-cae{position:absolute;top:-60px;animation:am-cae linear infinite;pointer-events:none}
    @keyframes am-entra{from{opacity:0;transform:scale(.6) rotate(-8deg)}to{opacity:1;transform:none}}
    @keyframes am-va{to{opacity:0;visibility:hidden}}
    @keyframes am-bambolea{0%,100%{transform:rotate(-2deg) scale(1)}50%{transform:rotate(2deg) scale(1.03)}}
    @keyframes am-late{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.08) rotate(6deg)}}
    @keyframes am-arcoiris{to{background-position:300% 0}}
    @keyframes am-cae{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(115vh) rotate(540deg)}}
  </style>${lluvia}
  <div class="am-tarjeta">
    <div class="am-fila">${em(9)}</div>
    <div class="am-solemoji">🌞</div>
    <div class="am-fila">${em(6)}</div>
    <div class="am-texto">${em(3)} AMANESE QUE NO ES POCO ${em(3)}</div>
    <div class="am-fila">${em(9)}</div>
    <div class="am-firma">BENDISIONES PARA TODOS!!! 🙏🌹 Día ${diaActual}</div>
  </div>`;
  const cerrar = () => el.remove();
  el.addEventListener('click', cerrar);
  document.body.appendChild(el);
  setTimeout(cerrar, 8200);
}
async function amanecerEspera(){
  for(let i = 0; i < 40 && document.getElementById('amanecer-tia'); i++) await new Promise(r => setTimeout(r, 300));
}
