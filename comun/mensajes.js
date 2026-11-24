/* =========================================================
   🕊️ MENSAJES SECRETOS ENTRE USUARIOS (2026-11-22, dueño: «ofrecer la opción de mandar mensajes secretos entre usuarios, ya sea
   jugadores o GM… que el mensaje le aparezca al receptor con una especie de botón flotante tipo notificación de WhatsApp, tanto en el
   mapa como en la ficha». Decisiones (a)–(g) en docs/cola-de-pruebas.md).

   Lo usan el mapa, la ficha y GM Tools (lo arranca mesaEscuchar, comun/mesa.js; dentro de los iframes del mapa no hace nada).
   - Mandar: el 🕊️ al pie de la Mesa (ventanita con una casilla por persona: el GM y cada jugador, con sus personajes) o el comando
     `/m Nombre texto` (también `/r`) en la caja de la Mesa, con autocompletado (nombres de personajes y de usuarios; elegir cualquiera
     lleva siempre a la persona). Se manda a la persona (uid), no al personaje.
   - Recibir: en la Mesa de quien lo recibe, con un color propio que brilla (mezclarEnMesa / mesaHtml, los dibuja comun/mesa.js); en la
     Crónica del mapa, con animación (window.mensajesCronica, vtt-hexgrid/js/16, que dibuja cronicaHtml); y el 🕊️ flotante abajo a la
     derecha con el globito rojo de los sin leer, que late al llegar uno. Tocándolo: las conversaciones, de más viejo a más nuevo, y una
     caja para responder. Quien manda ve lo suyo ahí (nunca en la Mesa general).
   - Privacidad: campanas/<id>/mensajes/<id> lo leen solo `lectores` (quien manda + quienes reciben): lo imponen las reglas de Firestore,
     el GM no puede leer lo que se mandan dos jugadores. Para que el GM pueda borrarlos sin leerlos, cada mensaje deja su id en
     campanas/<id>/mensajes_indice/<id> = {cuando} (solo la fecha), que lee y borra solo el GM.
   - Registro: se borran cuando el GM limpia el registro (🗑 de la Mesa: todos; 🆕 Registro nuevo: los de antes del combate anterior,
     igual que las tiradas). No se borran solos.
   - Sin sonido (queda para la música).
   Necesita sesion.js (fbDb, fbUsuario, fbMiembro, fbRutaCampana); usa toast y Confirmar si están.
   ========================================================= */
const Mensajes = (() => {
  const TEXTO_MAX = 1000, PARA_MAX = 20, CRONICA_MS = 20000;
  const AVISO_REGLAS = '🕊️ Faltan pegar las reglas de Firestore de los mensajes: avisale al dueño de la partida que las pegue en la consola de Firebase (firebase/firestore.rules). Hasta entonces no se pueden mandar ni leer.';
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const avisar = t => { if(typeof toast === 'function') toast(t); };
  const ms = t => !t ? 0 : typeof t.toMillis === 'function' ? t.toMillis() : t instanceof Date ? t.getTime() : (Number(t) || 0);

  /* ---------- Lo puro (probado en comun/pruebas.html) ---------- */

  // Las personas a las que se les puede escribir: cada miembro menos uno mismo, con sus personajes. El GM primero.
  function personas(miembros, fichas, yo){
    const fs = (fichas || []).filter(f => f && f.duenoUid);
    return (miembros || []).filter(m => m && m.uid && m.uid !== yo).map(m => ({
      uid: m.uid, nombre: String(m.nombre || '?').trim() || '?', gm: m.gm === true,
      personajes: [...new Set(fs.filter(f => f.duenoUid === m.uid).map(f => String(f.nombre || '').trim()).filter(Boolean))],
    })).sort((a, b) => (b.gm - a.gm) || a.nombre.localeCompare(b.nombre, 'es'));
  }
  // 📣 Todo el grupo (2026-11-24, P285.1): el mensaje público. No es una persona: va a la Mesa de todos (colección `tiradas`, desde 'publico').
  const GRUPO = '*grupo*';
  const GRUPO_PERSONA = {uid: GRUPO, nombre: 'Todo el grupo', gm: false, personajes: [], grupo: true};
  const GRUPO_NOMBRES = ['Todo el grupo', 'Todos'];
  // Cada nombre que sirve para elegir a alguien: el del usuario y el de cada personaje (con o.grupo, también «Todo el grupo» y «Todos»).
  function candidatos(pers, o){
    const out = [];
    (pers || []).forEach(p => {
      out.push({uid: p.uid, nombre: p.nombre, tipo: 'usuario', persona: p});
      p.personajes.forEach(n => out.push({uid: p.uid, nombre: n, tipo: 'personaje', persona: p}));
    });
    if(o && o.grupo) GRUPO_NOMBRES.forEach(n => out.push({uid: GRUPO, nombre: n, tipo: 'grupo', persona: GRUPO_PERSONA}));
    return out;
  }
  // Lo que sugiere el autocompletado para las primeras letras (del nombre entero o de cualquiera de sus palabras).
  function sugerencias(pers, frag, max, o){
    const f = norm(frag).trim();
    const vistos = new Set();
    return candidatos(pers, o).filter(c => {
      const n = norm(c.nombre);
      if(f && !n.startsWith(f) && !n.split(/\s+/).some(w => w.startsWith(f))) return false;
      const k = c.uid + '|' + n;
      if(vistos.has(k)) return false;
      vistos.add(k);
      return true;
    }).sort((a, b) => (norm(a.nombre).startsWith(f) ? 0 : 1) - (norm(b.nombre).startsWith(f) ? 0 : 1)).slice(0, max || 8);
  }
  // ¿Es un comando de mensaje? `/m` o `/r` (mayúscula o minúscula), solo o seguido de un espacio. → {cmd: 'm'|'r', resto} o null.
  function comando(texto){
    const m = /^\s*\/([mr])(?:\s([\s\S]*))?$/i.exec(String(texto || ''));
    return m ? {cmd: m[1].toLowerCase(), resto: (m[2] || '').replace(/^\s+/, '')} : null;
  }
  // `/m Nombre texto` → {persona, por, texto} (el nombre más largo que calce), {ambiguo, opciones} o {persona: null}. null si no es comando.
  // `/r texto` (P285.2, 2026-11-24): responde al último que me escribió, sin nombre → {responder: true, persona (o.ultimo, o null), texto}.
  // o = {grupo: true (acepta «Todo el grupo»/«Todos»), ultimo: la persona del último que me escribió}.
  function parsear(texto, pers, o){
    const c = comando(texto);
    if(!c) return null;
    const resto = c.resto;
    if(c.cmd === 'r'){
      // P318.4 (dueño, 2026-11-24: «habría que corregirlo»): si después de /r viene el nombre de alguien de la partida, no va como texto: se
      // le responde a esa persona (sin el nombre en el mensaje). Si no, al último que me escribió.
      const n = calzar(resto, pers);
      if(n && n.persona) return {responder: true, persona: n.persona, porNombre: true, texto: n.texto, resto};
      return {responder: true, persona: (o && o.ultimo) || null, texto: resto.trim(), resto};
    }
    return calzar(resto, pers, o) || {persona: null, texto: '', resto};
  }
  // El nombre más largo (de persona o personaje) con el que empieza `resto` → {persona, por, texto, resto}, {ambiguo…} o null si no calza ninguno.
  function calzar(resto, pers, o){
    const calzan = candidatos(pers, o).filter(k => {
      const n = k.nombre;
      return n && resto.length >= n.length && norm(resto.slice(0, n.length)) === norm(n) && (resto.length === n.length || /[\s:,]/.test(resto[n.length]));
    });
    if(!calzan.length) return null;
    const largo = Math.max(...calzan.map(k => k.nombre.length));
    const mejores = calzan.filter(k => k.nombre.length === largo);
    const uids = [...new Set(mejores.map(k => k.uid))];
    if(uids.length > 1) return {persona: null, ambiguo: true, opciones: mejores, texto: '', resto};
    return {persona: mejores[0].persona, por: mejores[0], texto: resto.slice(largo).replace(/^[\s:,]+/, '').trim(), resto};
  }
  // Para el autocompletado: lo que se está escribiendo del nombre (puede ser ''), o null si no hay que sugerir nada.
  function fragmento(texto, pers, o){
    if(!/^\s*\/m\s/i.test(String(texto || ''))) return null;   // (el /r no lleva nombre)
    const p = parsear(texto, pers, o);
    if(p && p.persona && p.resto.length > p.por.nombre.length) return null;   // ya eligió y siguió escribiendo el mensaje
    return p ? p.resto : null;
  }
  // El documento que se guarda (sin `cuando`). Tira un Error con el motivo si no se puede mandar.
  function armarDoc(yo, yoNombre, para, texto){
    const t = String(texto || '').trim();
    if(!t) throw new Error('Escribí el mensaje.');
    if(t.length > TEXTO_MAX) throw new Error(`El mensaje es muy largo (máximo ${TEXTO_MAX} letras).`);
    const vistos = new Set(), lista = [];
    (para || []).forEach(p => { if(p && p.uid && p.uid !== yo && !vistos.has(p.uid)){ vistos.add(p.uid); lista.push(p); } });
    if(!lista.length) throw new Error('Elegí a quién se lo mandás.');
    if(lista.length > PARA_MAX) throw new Error(`Como mucho ${PARA_MAX} personas por mensaje.`);
    const uids = lista.map(p => p.uid);
    return {de: yo, deNombre: String(yoNombre || '?').slice(0, 40), para: uids, paraNombres: lista.map(p => String(p.nombre || '?').slice(0, 40)),
      lectores: [yo, ...uids], texto: t, leidoPor: [yo]};
  }
  // 📣 El mensaje público: una línea de la Mesa (colección `tiradas`, sin reglas nuevas) que ven todos los de la partida. Sin `cuando`.
  function armarPublico(yo, yoNombre, texto){
    const t = String(texto || '').trim();
    if(!t) throw new Error('Escribí el mensaje.');
    if(t.length > TEXTO_MAX) throw new Error(`El mensaje es muy largo (máximo ${TEXTO_MAX} letras).`);
    return {uid: yo, jugador: String(yoNombre || '?').slice(0, 60), quien: '', origen: '📣 Mensaje a todo el grupo', formula: '', rolls: [], mod: 0, total: 0,
      desde: 'publico', texto: t};
  }
  // Quién me escribió último (un mensaje secreto en el que estoy en `para`) → su uid, o ''.
  function ultimoQueMeEscribio(lista, yo){
    let u = '', t = -1;
    (lista || []).forEach(m => { if(m && m.de !== yo && (m.para || []).includes(yo) && ms(m.cuando) >= t){ t = ms(m.cuando); u = m.de; } });
    return u;
  }
  // Los públicos de otros que llegaron después de `visto` (ms).
  const publicosNoLeidos = (pubs, yo, visto) => (pubs || []).filter(m => m && m.uid !== yo && ms(m.cuando) > (Number(visto) || 0)).length;
  const sinLeer = (m, yo) => !!(m && m.de !== yo && Array.isArray(m.para) && m.para.includes(yo) && !(Array.isArray(m.leidoPor) && m.leidoPor.includes(yo)));
  // Las conversaciones de `yo`: una por persona. Lo que mandé va en la de cada destinatario; lo que me mandaron, en la de quien lo mandó.
  // → [{uid, nombre, msgs (de más viejo a más nuevo), noLeidos, ultima}] (la de lo más reciente primero).
  function conversaciones(lista, yo, pers){
    const conv = new Map();
    const nombreDe = (uid, alt) => { const p = (pers || []).find(x => x.uid === uid); return p ? p.nombre : (alt || '?'); };
    const de = (uid, alt) => { if(!conv.has(uid)) conv.set(uid, {uid, nombre: nombreDe(uid, alt), msgs: [], noLeidos: 0, ultima: 0}); return conv.get(uid); };
    (lista || []).forEach(m => {
      if(!m) return;
      if(m.de === yo) (m.para || []).forEach((u, i) => de(u, (m.paraNombres || [])[i]).msgs.push(m));
      else if((m.para || []).includes(yo)){ const c = de(m.de, m.deNombre); c.msgs.push(m); if(sinLeer(m, yo)) c.noLeidos++; }
    });
    const lst = [...conv.values()];
    lst.forEach(c => { c.msgs.sort((a, b) => ms(a.cuando) - ms(b.cuando)); c.ultima = c.msgs.length ? ms(c.msgs[c.msgs.length - 1].cuando) : 0; });
    return lst.sort((a, b) => b.ultima - a.ultima);
  }
  const noLeidos = (lista, yo) => (lista || []).filter(m => sinLeer(m, yo)).length;
  // Las filas de la Mesa con los mensajes secretos que puedo ver (los que ME llegaron y los que mandé: P285, 2026-11-24), mezcladas por hora con
  // las tiradas (que vienen de la más nueva a la más vieja). Si la Mesa ya muestra su tope de tiradas, solo los mensajes desde la más vieja que se
  // ve (así no se amontonan los de hace días). Los 📣 públicos ya vienen entre las tiradas: se marcan como mensaje (no son una acción ni se animan).
  function mezclarEnMesa(docs, lista, yo, tope){
    docs = (docs || []).map(d => d && !d._mensaje && (d.data() || {}).desde === 'publico' ? {id: d.id, _mensaje: true, _publico: true, data: o => d.data(o)} : d);
    const mios = (lista || []).filter(m => m && (m.de === yo || (m.para || []).includes(yo)));
    if(!mios.length) return docs;
    const hora = d => ms((d.data({serverTimestamps: 'estimate'}) || {}).cuando);
    const desde = docs.length && docs.length >= (tope || 30) ? hora(docs[docs.length - 1]) : 0;
    const pseudo = mios.filter(m => ms(m.cuando) >= desde).map(m => ({id: 'msj-' + m.id, _mensaje: true, data: () => ({...m, desde: 'mensaje', mensajeId: m.id})}));
    return [...docs, ...pseudo].sort((a, b) => hora(b) - hora(a));
  }
  const tambienPara = (m, yo) => (m.para || []).map((u, i) => u === yo ? null : (m.paraNombres || [])[i] || '?').filter(Boolean);
  // La fila de la Mesa de un mensaje secreto: uno que me llegó o uno que mandé yo.
  function mesaHtml(t, yo){
    if(t.de === yo){
      return `<div class="msj-mesa-tit">🕊️ Tu mensaje secreto para <b>${e((t.paraNombres || []).join(', ') || '?')}</b></div>` +
        `<div class="msj-mesa-txt">${e(t.texto)}</div>` +
        `<div class="msj-mesa-pie">🔒 Solo lo ven ustedes · tocá para abrir la conversación</div>`;
    }
    const otros = tambienPara(t, yo);
    return `<div class="msj-mesa-tit">🕊️ Mensaje secreto de <b>${e(t.deNombre || '?')}</b></div>` +
      `<div class="msj-mesa-txt">${e(t.texto)}</div>` +
      `<div class="msj-mesa-pie">🔒 Solo lo ves vos${otros.length ? ` (y ${e(otros.join(', '))})` : ''} · tocá para responder</div>`;
  }
  // La fila de la Mesa de un 📣 mensaje a todo el grupo (la ven todos).
  function publicoHtml(t, yo){
    return `<div class="msj-mesa-tit">📣 ${t.uid === yo ? 'Tu mensaje' : `<b>${e(t.jugador || '?')}</b>`} a todo el grupo</div>` +
      `<div class="msj-mesa-txt">${e(t.texto)}</div>` +
      `<div class="msj-mesa-pie">👥 Lo ven todos los de la partida · tocá para abrir la conversación del grupo</div>`;
  }
  // La tarjeta de la Crónica (el mapa la redibuja cada medio segundo: las animaciones arrancan en negativo según la edad, así no vuelven a empezar).
  function cronicaHtml(k, m, edad, queda){
    const d = -Math.max(0, Number(edad) || 0) + 'ms';
    return `<div class="msj-cronica" data-mensaje-abrir="${e(m.de)}" data-mensaje-clave="${e(k)}" style="animation-delay:${d},${d};opacity:${queda < 1500 ? Math.max(0.15, queda / 1500) : 1}">
      <button type="button" class="momento-x" data-momento-cerrar="${e(k)}" title="Cerrar (el mensaje queda en el 🕊️)">✕</button>
      <div class="msj-cronica-tit">🕊️ ¡Mensaje secreto!</div>
      <div class="msj-cronica-de">de <b>${e(m.deNombre || '?')}</b></div>
      <div class="msj-cronica-txt">${e(m.texto)}</div>
      <div class="msj-cronica-pie">🔒 Solo para vos · tocá para responder</div>
    </div>`;
  }

  /* ---------- Estado ---------- */
  let iniciado = false, faltanReglas = false, avisadoReglas = false, primera = true;
  const msgs = new Map();
  const pubs = new Map();   // 📣 los mensajes a todo el grupo (líneas `publico` de la Mesa)
  let primeraPub = true;
  let miembros = [], fichas = [];
  let latirHasta = 0;
  const yo = () => (typeof fbUsuario !== 'undefined' && fbUsuario) ? fbUsuario.uid : '';
  const yoNombre = () => (typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.nombre) || '?';
  const soyGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const lista = () => [...msgs.values()];
  const listaPub = () => [...pubs.values()].sort((a, b) => ms(a.cuando) - ms(b.cuando));
  // Hasta cuándo vi los 📣 públicos (por navegador; no se guarda en Firebase: la Mesa no se edita). Sin dato: desde ahora (lo viejo no cuenta).
  const claveVisto = () => 'msjPublicoVisto:' + (typeof fbRutaCampana === 'function' ? fbRutaCampana('') : '');
  function vistoPub(){
    try{ const v = Number(localStorage.getItem(claveVisto())); if(v) return v; localStorage.setItem(claveVisto(), String(Date.now())); }catch(err){}
    return Date.now();
  }
  function marcarVistoPub(){
    const ult = listaPub().reduce((mx, m) => Math.max(mx, ms(m.cuando)), Date.now());
    try{ localStorage.setItem(claveVisto(), String(ult)); }catch(err){}
  }
  const noLeidosPub = () => publicosNoLeidos(listaPub(), yo(), vistoPub());
  const misPersonas = () => personas(miembros, fichas, yo());
  const persona = uid => misPersonas().find(p => p.uid === uid) || null;
  const etiqueta = p => p ? p.nombre + (p.gm ? ' (GM)' : '') : '?';
  const personajesTxt = p => p && p.personajes.length ? p.personajes.join(', ') : (p && p.gm ? 'GM' : 'sin personaje');

  function avisoReglas(){
    faltanReglas = true;
    if(!avisadoReglas){ avisadoReglas = true; console.warn(AVISO_REGLAS); }
    document.querySelectorAll('.msj-aviso-reglas').forEach(x => { x.hidden = false; });
  }
  const esPermiso = err => !!(err && (err.code === 'permission-denied' || /permission/i.test(String(err.message || ''))));

  /* ---------- Estilos ---------- */
  function estilos(){
    if(document.getElementById('mensajes-css')) return;
    const st = document.createElement('style');
    st.id = 'mensajes-css';
    st.textContent = `
@keyframes msj-brillo{0%,100%{box-shadow:0 0 6px 1px rgba(255,62,165,.55),inset 0 0 0 1px rgba(255,214,240,.35)}50%{box-shadow:0 0 18px 5px rgba(255,62,165,.95),inset 0 0 0 1px rgba(255,255,255,.7)}}
@keyframes msj-reflejo{0%{background-position:-160% 0}55%,100%{background-position:260% 0}}
@keyframes msj-entra{0%{transform:translateX(60px) scale(.6);opacity:0;filter:brightness(2.4)}55%{transform:translateX(-6px) scale(1.06);opacity:1;filter:brightness(1.6)}75%{transform:scale(.98)}100%{transform:none;filter:none}}
@keyframes msj-late{0%,100%{transform:scale(1)}20%{transform:scale(1.35)}40%{transform:scale(.92)}60%{transform:scale(1.18)}}
@keyframes msj-boton-late{0%,100%{box-shadow:0 0 0 0 rgba(255,62,165,.0),0 6px 16px rgba(0,0,0,.5)}50%{box-shadow:0 0 0 10px rgba(255,62,165,.35),0 6px 16px rgba(0,0,0,.5)}}
.mesa-tirada.mesa-mensaje{cursor:pointer;color:#fff!important;border:1px solid #ff8fd0!important;border-radius:7px;
  background:linear-gradient(100deg,#7a0f55 0%,#c2187d 45%,#ff5fb8 50%,#c2187d 55%,#5d1478 100%)!important;background-size:260% 100%!important;
  animation:msj-brillo 1.6s ease-in-out infinite,msj-reflejo 3.2s ease-in-out infinite}
.mesa-tirada.mesa-mensaje .msj-mesa-tit{font-weight:700;letter-spacing:.02em}
.mesa-tirada.mesa-mensaje .msj-mesa-txt{margin-top:3px;font-size:13px;line-height:1.35;white-space:pre-wrap;word-break:break-word}
.mesa-tirada.mesa-mensaje .msj-mesa-pie{margin-top:4px;font-size:10.5px;opacity:.85}
.mesa-tirada.mesa-mensaje:hover{filter:brightness(1.12)}
.msj-cronica{position:relative;pointer-events:auto;cursor:pointer;color:#fff;border:2px solid #ffb3e0;border-radius:10px;padding:10px 12px;font-size:13.5px;line-height:1.35;
  background:linear-gradient(100deg,#6d0c4c 0%,#c2187d 42%,#ff7cc6 50%,#c2187d 58%,#4e1170 100%);background-size:260% 100%;
  animation:msj-entra .9s cubic-bezier(.2,.9,.3,1.3) both,msj-brillo 1.4s ease-in-out infinite;transition:opacity .4s}
.msj-cronica::after{content:"";position:absolute;inset:0;border-radius:8px;pointer-events:none;background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.38) 50%,transparent 70%);background-size:260% 100%;animation:msj-reflejo 2.6s ease-in-out infinite}
.msj-cronica .momento-x{color:#ffe3f3!important}
.msj-cronica-tit{font-weight:800;font-size:15px;letter-spacing:.03em;text-shadow:0 0 8px rgba(255,255,255,.6);padding-right:18px}
.msj-cronica-de{margin-top:2px;font-size:12.5px}
.msj-cronica-txt{margin-top:5px;background:rgba(0,0,0,.25);border-radius:6px;padding:6px 8px;white-space:pre-wrap;word-break:break-word;max-height:260px;overflow-y:auto}
.msj-cronica-pie{margin-top:5px;font-size:11px;opacity:.9}
.mensajes-boton-mesa{flex:0 0 auto;font-size:15px!important;padding-left:9px!important;padding-right:9px!important}
#msj-flotante{z-index:44;width:58px;height:58px;border-radius:50%;border:2px solid #ffb3e0;cursor:pointer;font-size:27px;line-height:1;color:#fff;
  background:radial-gradient(circle at 35% 30%,#ff7cc6,#c2187d 60%,#6d0c4c);box-shadow:0 6px 16px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:0}
#msj-flotante[hidden]{display:none}
#msj-flotante.msj-hay{animation:msj-boton-late 1.8s ease-in-out infinite}
#msj-flotante .msj-globo{position:absolute;top:-5px;right:-5px;min-width:22px;height:22px;padding:0 6px;box-sizing:border-box;border-radius:11px;background:#e5251f;color:#fff;
  font:800 12.5px/22px system-ui,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)}
#msj-flotante .msj-globo[hidden]{display:none}
#msj-flotante .msj-globo.late{animation:msj-late .9s ease-in-out 3}
.msj-fondo{position:fixed;inset:0;z-index:99550;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif}
.msj-caja{background:#221a20;color:#f3e8ee;border:1px solid #6e4a60;border-top:3px solid #ff3ea5;border-radius:12px;box-shadow:0 14px 44px rgba(0,0,0,.65);
  width:min(560px,100%);max-height:calc(100vh - 50px);display:flex;flex-direction:column}
.msj-caja.ancha{width:min(860px,100%);height:min(620px,calc(100vh - 50px))}
.msj-caja header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #4a3442}
.msj-caja header h3{margin:0;font-size:16px;flex:1}
.msj-caja .msj-x{background:none;border:1px solid #6e4a60;color:#f3e8ee;border-radius:6px;cursor:pointer;font-size:14px;padding:2px 9px}
.msj-nota{font-size:12px;color:#d9b9cb;padding:8px 16px 0}
.msj-aviso-reglas{margin:10px 16px 0;padding:8px 10px;border-radius:7px;background:#5a1414;border:1px solid #ff6a6a;color:#fff;font-size:12.5px;line-height:1.4}
.msj-aviso-reglas[hidden]{display:none}
.msj-para{padding:10px 16px;overflow:auto;display:flex;flex-direction:column;gap:6px;max-height:300px}
.msj-para label{display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid #4a3442;border-radius:8px;cursor:pointer;background:#2b2129}
.msj-para label:hover{border-color:#ff8fd0}
.msj-para label.marcado{border-color:#ff3ea5;background:#3a1f33}
.msj-para input{width:17px;height:17px;accent-color:#ff3ea5}
.msj-para .msj-quien{font-weight:700}
.msj-para .msj-pjs{font-size:12px;color:#d9b9cb}
.msj-todos{font-size:12px;color:#ffb3e0;background:none;border:none;cursor:pointer;padding:0 16px;text-align:left;text-decoration:underline}
.msj-caja textarea{margin:8px 16px 0;min-height:86px;resize:vertical;background:#170f15;color:#f3e8ee;border:1px solid #6e4a60;border-radius:8px;padding:8px 10px;font:14px/1.4 system-ui,sans-serif}
.msj-cuenta{font-size:11px;color:#a98c9c;padding:2px 16px 0;text-align:right}
.msj-caja footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #4a3442;margin-top:10px}
.msj-btn{border-radius:7px;padding:7px 16px;font:700 13.5px system-ui,sans-serif;cursor:pointer;border:1px solid #6e4a60;background:#2b2129;color:#f3e8ee}
.msj-btn.si{background:#ff3ea5;border-color:#ff3ea5;color:#1a0712}
.msj-btn:disabled{opacity:.5;cursor:default}
.msj-conv{flex:1;display:flex;min-height:0}
.msj-lista{width:240px;border-right:1px solid #4a3442;overflow:auto;padding:8px}
.msj-lista button{display:block;width:100%;text-align:left;border:1px solid transparent;border-radius:8px;background:none;color:#f3e8ee;padding:8px 10px;cursor:pointer;margin-bottom:4px;font:13px system-ui,sans-serif;position:relative}
.msj-lista button:hover{background:#2b2129}
.msj-lista button.activa{background:#3a1f33;border-color:#ff3ea5}
.msj-lista .msj-l-pjs{display:block;font-size:11.5px;color:#d9b9cb;margin-top:1px}
.msj-lista .msj-l-n{position:absolute;right:8px;top:9px;min-width:19px;height:19px;border-radius:10px;background:#e5251f;color:#fff;font:800 11px/19px system-ui;text-align:center;padding:0 5px}
.msj-lista .msj-l-vacia{font-size:12px;color:#a98c9c;padding:8px}
.msj-hilo{flex:1;display:flex;flex-direction:column;min-width:0}
.msj-hilo-cab{padding:10px 14px;border-bottom:1px solid #4a3442;font-size:13px}
.msj-hilo-cab b{font-size:14.5px}
.msj-hilo-msgs{flex:1;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:8px}
.msj-burbuja{max-width:78%;padding:7px 10px;border-radius:12px;font-size:13.5px;line-height:1.38;white-space:pre-wrap;word-break:break-word}
.msj-burbuja.suya{align-self:flex-start;background:#3a2734;border:1px solid #6e4a60;border-bottom-left-radius:3px}
.msj-burbuja.mia{align-self:flex-end;background:linear-gradient(135deg,#c2187d,#8a1360);border:1px solid #ff8fd0;border-bottom-right-radius:3px}
.msj-burbuja .msj-hora{display:block;font-size:10.5px;opacity:.7;margin-top:3px;text-align:right}
.msj-burbuja .msj-tambien{display:block;font-size:10.5px;opacity:.8;margin-bottom:2px}
.msj-hilo-vacio{margin:auto;color:#a98c9c;font-size:13px;text-align:center;padding:20px}
.msj-responder{display:flex;gap:8px;padding:10px 14px;border-top:1px solid #4a3442}
.msj-responder textarea{flex:1;margin:0;min-height:44px;height:44px}
.msj-sug{position:fixed;z-index:99560;background:#221a20;border:1px solid #ff3ea5;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.6);padding:4px;min-width:240px;max-width:360px;font:13px system-ui,sans-serif;color:#f3e8ee}
.msj-sug .msj-sug-tit{font-size:11px;color:#d9b9cb;padding:4px 8px 3px}
.msj-sug button{display:flex;gap:8px;align-items:baseline;width:100%;text-align:left;background:none;border:none;color:inherit;padding:6px 8px;border-radius:6px;cursor:pointer;font:inherit}
.msj-sug button.activa,.msj-sug button:hover{background:#3a1f33}
.msj-sug .msj-sug-a{font-size:11.5px;color:#d9b9cb}
.mesa-tirada.mesa-mensaje.mesa-mensaje-mio{animation:none;background:#4a1438!important;border-style:dashed!important}
.mesa-tirada.mesa-publico{cursor:pointer;color:#fff7df!important;border:1px solid #ffcf5a!important;border-left:5px solid #ffcf5a!important;border-radius:7px;background:linear-gradient(100deg,#4a3208,#6e4a0c 60%,#4a3208)!important}
.mesa-tirada.mesa-publico .msj-mesa-tit{font-weight:700;letter-spacing:.02em}
.mesa-tirada.mesa-publico .msj-mesa-txt{margin-top:3px;font-size:13px;line-height:1.35;white-space:pre-wrap;word-break:break-word}
.mesa-tirada.mesa-publico .msj-mesa-pie{margin-top:4px;font-size:10.5px;opacity:.85}
.mesa-tirada.mesa-publico:hover{filter:brightness(1.15)}
@keyframes msj-vibra{0%,100%{transform:none}12%{transform:translateX(-3px) rotate(-9deg)}25%{transform:translateX(3px) rotate(9deg)}37%{transform:translateX(-3px) rotate(-7deg)}50%{transform:translateX(2px) rotate(6deg)}62%{transform:translateX(-2px) rotate(-4deg)}75%{transform:translateX(1px) rotate(2deg)}}
#msj-flotante.msj-vibra{animation:msj-vibra .7s ease-in-out 2}
#msj-flotante.msj-vibra.msj-hay{animation:msj-vibra .7s ease-in-out 2,msj-boton-late 1.8s ease-in-out infinite}
#msj-avisos{z-index:45;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;width:300px}
@keyframes msj-aviso-entra{0%{transform:translateY(14px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
.msj-aviso{pointer-events:auto;cursor:pointer;box-sizing:border-box;width:100%;color:#fff;border:2px solid #ffb3e0;border-radius:12px;padding:9px 12px;font:13px/1.35 system-ui,sans-serif;
  background:linear-gradient(135deg,#c2187d,#6d0c4c);box-shadow:0 8px 24px rgba(0,0,0,.55);animation:msj-aviso-entra .35s ease-out both;transition:opacity .5s,transform .5s}
.msj-aviso.publico{border-color:#ffe29a;background:linear-gradient(135deg,#8a5a0c,#4a3208)}
.msj-aviso.sale{opacity:0;transform:translateY(8px)}
.msj-aviso-tit{font-weight:800;font-size:13.5px}
.msj-aviso-txt{margin-top:3px;opacity:.95;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.msj-aviso-pie{margin-top:3px;font-size:11px;opacity:.8}
@media (prefers-reduced-motion: reduce){#msj-flotante.msj-vibra,#msj-flotante.msj-vibra.msj-hay{animation:none;outline:3px solid #fff;outline-offset:2px}.msj-aviso{animation:none}}
.msj-lista button.grupo{border-color:#6e5520;background:#2e2412}
.msj-lista button.grupo.activa{border-color:#ffcf5a;background:#45340f}
.msj-burbuja.suya.pub,.msj-burbuja.mia.pub{border-color:#ffcf5a}
.msj-burbuja.mia.pub{background:linear-gradient(135deg,#9a6a10,#6e4a0c)}
.msj-burbuja .msj-de{display:block;font-size:11px;font-weight:700;opacity:.9;margin-bottom:2px}
.msj-inicio{margin:auto;display:flex;flex-direction:column;gap:12px;align-items:stretch;padding:20px;max-width:360px;text-align:center;color:#d9b9cb;font-size:13px}
.msj-inicio .msj-btn{padding:11px 16px;font-size:14.5px}
.msj-inicio .msj-btn.grupo{background:#ffcf5a;border-color:#ffcf5a;color:#2a1c00}
.msj-para label.grupo{border-color:#6e5520;background:#2e2412}
.msj-para label.grupo.marcado{border-color:#ffcf5a;background:#45340f}
.msj-para label.apagado{opacity:.45}`;
    document.head.appendChild(st);
  }

  /* ---------- Firebase ---------- */
  const col = () => fbDb.collection(fbRutaCampana('mensajes'));
  const colIndice = () => fbDb.collection(fbRutaCampana('mensajes_indice'));

  function escuchar(){
    col().where('lectores', 'array-contains', yo()).onSnapshot(snap => {
      faltanReglas = false;
      document.querySelectorAll('.msj-aviso-reglas').forEach(x => { x.hidden = true; });
      const nuevos = [];
      snap.docChanges().forEach(ch => {
        if(ch.type === 'removed'){ msgs.delete(ch.doc.id); return; }
        const m = {id: ch.doc.id, ...ch.doc.data({serverTimestamps: 'estimate'})};
        if(ch.type === 'added' && !primera && m.de !== yo()) nuevos.push(m);
        msgs.set(m.id, m);
      });
      primera = false;
      alCambiar(nuevos);
    }, err => {
      if(esPermiso(err)) avisoReglas();
      else console.error('Mensajes: no se pudieron leer', err);
    });
  }
  function escucharNombres(){
    fbDb.collection(fbRutaCampana('miembros')).onSnapshot(s => {
      miembros = s.docs.map(d => ({uid: d.id, nombre: d.data().nombre, gm: d.data().gm === true}));
      redibujar();
    }, err => console.error('Mensajes: miembros', err));
    fbDb.collection(fbRutaCampana('fichas')).onSnapshot(s => {
      fichas = s.docs.map(d => ({duenoUid: d.data().duenoUid, nombre: d.data().nombre}));
      redibujar();
    }, err => console.error('Mensajes: fichas', err));
  }

  async function enviar(uids, texto){
    let doc;
    const para = uids.map(u => { const p = persona(u); return {uid: u, nombre: p ? p.nombre : '?'}; });
    try{ doc = armarDoc(yo(), yoNombre(), para, texto); }
    catch(err){ avisar(err.message); return false; }
    if(faltanReglas){ avisar(AVISO_REGLAS); return false; }
    const ref = col().doc();
    const lote = fbDb.batch();
    const ahora = firebase.firestore.FieldValue.serverTimestamp();
    lote.set(ref, {...doc, cuando: ahora});
    lote.set(colIndice().doc(ref.id), {cuando: ahora});
    try{ await lote.commit(); return true; }
    catch(err){
      if(esPermiso(err)){ avisoReglas(); avisar(AVISO_REGLAS); }
      else{ console.error('Mensajes: no se pudo mandar', err); avisar('No se pudo mandar el mensaje — revisá la conexión'); }
      return false;
    }
  }
  // 📣 A todo el grupo: una línea de la Mesa (la ven todos, como una tirada; con su propio color).
  async function enviarPublico(texto){
    let doc;
    try{ doc = armarPublico(yo(), yoNombre(), texto); }
    catch(err){ avisar(err.message); return false; }
    try{ await fbDb.collection(fbRutaCampana('tiradas')).add({...doc, cuando: firebase.firestore.FieldValue.serverTimestamp()}); return true; }
    catch(err){ console.error('Mensajes: no se pudo mandar al grupo', err); avisar('No se pudo mandar el mensaje al grupo — revisá la conexión'); return false; }
  }
  function escucharPublicos(){
    fbDb.collection(fbRutaCampana('tiradas')).where('desde', '==', 'publico').onSnapshot(snap => {
      const nuevos = [];
      snap.docChanges().forEach(ch => {
        if(ch.type === 'removed'){ pubs.delete(ch.doc.id); return; }
        const m = {id: ch.doc.id, ...ch.doc.data({serverTimestamps: 'estimate'})};
        if(ch.type === 'added' && !primeraPub && m.uid !== yo()) nuevos.push(m);
        pubs.set(m.id, m);
      });
      primeraPub = false;
      if(nuevos.length){
        if(convAbierta && convSel === GRUPO && document.visibilityState === 'visible') marcarVistoPub();
        else nuevos.forEach(m => avisarLlegada({uid: GRUPO, publico: true, nombre: m.jugador, texto: m.texto}));
      }
      redibujar();
    }, err => console.error('Mensajes: no se pudieron leer los mensajes al grupo', err));
  }
  async function marcarLeidos(uid){
    const pend = lista().filter(m => m.de === uid && sinLeer(m, yo()));
    if(!pend.length) return;
    pend.forEach(m => { m.leidoPor = [...(m.leidoPor || []), yo()]; });   // ya, en la pantalla
    redibujar();
    const lote = fbDb.batch();
    pend.forEach(m => lote.update(col().doc(m.id), {leidoPor: firebase.firestore.FieldValue.arrayUnion(yo())}));
    try{ await lote.commit(); }catch(err){ console.error('Mensajes: no se pudieron marcar como leídos', err); }
  }
  // 🗑 / 🆕 Registro nuevo (el GM): borra los mensajes de antes de `antesDe` (todos si es null) sin leerlos, por el índice. → cuántos.
  async function borrar(antesDe){
    if(!soyGM() || typeof fbDb === 'undefined' || !fbDb) return 0;
    let total = 0;
    try{
      for(;;){
        const q = antesDe ? colIndice().where('cuando', '<', firebase.firestore.Timestamp.fromDate(antesDe)).limit(200) : colIndice().limit(200);
        const snap = await q.get();
        if(snap.empty) break;
        const lote = fbDb.batch();
        snap.docs.forEach(d => { lote.delete(col().doc(d.id)); lote.delete(d.ref); });
        await lote.commit();
        total += snap.size;
        if(snap.size < 200) break;
      }
    }catch(err){
      if(esPermiso(err)) console.warn(AVISO_REGLAS);
      else console.error('Mensajes: no se pudieron borrar', err);
    }
    return total;
  }

  /* ---------- Al cambiar ---------- */
  function alCambiar(nuevos){
    nuevos.forEach(m => {
      if(convAbierta && convSel === m.de && document.visibilityState === 'visible') marcarLeidos(m.de);
      else{
        if(typeof window.mensajesCronica === 'function'){ try{ window.mensajesCronica(m); }catch(err){ console.error(err); } }
        avisarLlegada({uid: m.de, nombre: m.deNombre, texto: m.texto});
      }
    });
    if(nuevos.length) latirHasta = Date.now() + 2800;
    redibujar();
    if(typeof mesaRefiltrar === 'function') mesaRefiltrar();
  }
  function redibujar(){
    dibujarBoton();
    if(convAbierta) dibujarConv();
  }

  /* ---------- El 🕊️ flotante ---------- */
  let boton = null;
  function dibujarBoton(){
    if(!iniciado) return;
    const todos = lista(), n = noLeidos(todos, yo()) + noLeidosPub();
    if(!boton){
      boton = document.createElement('button');
      boton.type = 'button';
      boton.id = 'msj-flotante';
      boton.title = 'Mensajes';
      boton.innerHTML = '🕊️<span class="msj-globo" hidden></span>';
      boton.onclick = () => abrirDesdePaloma();
      const caja = document.getElementById('lienzo-caja');   // el mapa: abajo a la derecha del lienzo (la Mesa va en la columna de al lado)
      if(caja){ boton.style.cssText = 'position:absolute;right:18px;bottom:18px'; caja.appendChild(boton); }
      else{ boton.style.cssText = 'position:fixed;right:18px;bottom:18px'; document.body.appendChild(boton); setInterval(ubicarBoton, 1000); window.addEventListener('resize', ubicarBoton); }
    }
    boton.hidden = false;   // P285.3 (2026-11-24): siempre a la vista; es la ruta principal para mandar y para leer
    boton.classList.toggle('msj-hay', n > 0);
    const g = boton.querySelector('.msj-globo');
    g.hidden = !n;
    g.textContent = n > 99 ? '99+' : String(n);
    boton.title = n ? `Mensajes · ${n} sin leer (tocá para leerlos)` : 'Mensajes: mandá uno secreto o a todo el grupo';
    if(latirHasta > Date.now()){ g.classList.remove('late'); void g.offsetWidth; g.classList.add('late'); latirHasta = 0; }
    ubicarBoton();
  }
  // Ficha y GM Tools: la Mesa flotante también va abajo a la derecha; si la tapa, el 🕊️ se corre a su izquierda.
  function ubicarBoton(){
    if(!boton || boton.style.position !== 'fixed') return;
    const mesa = document.getElementById('mesa');
    let derecha = 18, abajo = 18;
    if(mesa && mesa.getClientRects().length){   // (la Mesa es fija: offsetParent da null)
      const r = mesa.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight;
      const bx0 = W - 18 - 58, by0 = H - 18 - 58;
      if(r.left < W - 18 && r.right > bx0 && r.top < H - 18 && r.bottom > by0) derecha = Math.round(W - r.left + 12);
    }
    boton.style.right = derecha + 'px';
    boton.style.bottom = abajo + 'px';
    if(avisos && avisos.style.position === 'fixed') avisos.style.right = derecha + 'px';
  }

  /* ---------- Al llegar uno: la paloma vibra y sale un aviso flotante (P285, dueño 2026-11-24) ---------- */
  let avisos = null;
  const AVISO_MS = 7000;
  function vibrar(){
    if(!boton) return;
    boton.classList.remove('msj-vibra'); void boton.offsetWidth; boton.classList.add('msj-vibra');
    clearTimeout(vibrar.t); vibrar.t = setTimeout(() => boton && boton.classList.remove('msj-vibra'), 1500);
  }
  // {uid (de quién, o GRUPO), publico, nombre, texto}
  function avisarLlegada(a){
    if(!iniciado) return;
    dibujarBoton();
    vibrar();
    if(!avisos){
      avisos = document.createElement('div');
      avisos.id = 'msj-avisos';
      const caja = document.getElementById('lienzo-caja');
      if(caja && boton && boton.parentNode === caja){ avisos.style.cssText = 'position:absolute;right:18px;bottom:88px'; caja.appendChild(avisos); }
      else{ avisos.style.cssText = `position:fixed;right:${(boton && boton.style.right) || '18px'};bottom:88px`; document.body.appendChild(avisos); }
    }
    const d = document.createElement('div');
    d.className = 'msj-aviso' + (a.publico ? ' publico' : '');
    d.dataset.abrir = a.uid;
    d.title = 'Tocá para abrir la conversación';
    const txt = String(a.texto || '');
    d.innerHTML = `<div class="msj-aviso-tit">${a.publico ? `📣 ${e(a.nombre || '?')} le escribió a todo el grupo` : `🕊️ Te llegó un mensaje de ${e(a.nombre || '?')}`}</div>` +
      `<div class="msj-aviso-txt">${e(txt.length > 90 ? txt.slice(0, 87) + '…' : txt)}</div><div class="msj-aviso-pie">Tocá para abrirlo</div>`;
    const sacar = () => { d.classList.add('sale'); setTimeout(() => d.remove(), 500); };
    d.addEventListener('click', () => { d.remove(); abrirConversacion(a.uid); });
    avisos.appendChild(d);
    while(avisos.children.length > 3) avisos.firstChild.remove();
    setTimeout(sacar, AVISO_MS);
  }

  /* ---------- Ventanas ---------- */
  let abierta = null;   // la ventana de mandar
  let convAbierta = null, convSel = '';
  function cerrarVentana(v){ if(v){ v.remove(); } }
  function tecla(ev){
    if(ev.key !== 'Escape') return;
    if(sug){ return; }
    if(abierta){ ev.stopPropagation(); ev.preventDefault(); cerrarVentana(abierta); abierta = null; return; }
    if(convAbierta){ ev.stopPropagation(); ev.preventDefault(); cerrarConv(); }
  }

  // La ventanita de mandar: una casilla por persona, el mensaje y «Enviar».
  function abrirMandar(o){
    estilos();
    if(abierta) cerrarVentana(abierta);
    const marcados = new Set((o && o.para) || []);
    let grupo = !!(o && o.publico);
    const v = document.createElement('div');
    v.className = 'msj-fondo';
    v.innerHTML = `<div class="msj-caja" role="dialog" aria-modal="true"><header><h3>🕊️ Mensaje nuevo</h3><button type="button" class="msj-x" title="Cerrar">✕</button></header>
      <div class="msj-nota msj-nota-priv"></div>
      <div class="msj-aviso-reglas" ${faltanReglas ? '' : 'hidden'}>${e(AVISO_REGLAS)}</div>
      <div class="msj-nota"><b>Para:</b> todo el grupo, o marcá uno o varios (secreto).</div>
      <div class="msj-para"></div>
      <button type="button" class="msj-todos">Marcar a todos</button>
      <textarea maxlength="${TEXTO_MAX}" placeholder="Escribí el mensaje… (Ctrl+Enter para mandarlo)">${e((o && o.texto) || '')}</textarea>
      <div class="msj-cuenta"></div>
      <footer><button type="button" class="msj-btn no">Cancelar</button><button type="button" class="msj-btn si">🕊️ Enviar</button></footer></div>`;
    const pintar = () => {
      const ps = misPersonas();
      v.querySelector('.msj-para').innerHTML = `<label class="grupo ${grupo ? 'marcado' : ''}"><input type="checkbox" data-grupo="1" ${grupo ? 'checked' : ''}>` +
        `<span><span class="msj-quien">📣 Todo el grupo</span><br><span class="msj-pjs">Mensaje público: sale en la Mesa de todos (también del GM)</span></span></label>` +
        (ps.length ? ps.map(p => `<label class="${marcados.has(p.uid) && !grupo ? 'marcado' : ''}${grupo ? ' apagado' : ''}"><input type="checkbox" data-uid="${e(p.uid)}" ${marcados.has(p.uid) && !grupo ? 'checked' : ''}>` +
        `<span><span class="msj-quien">🔒 ${e(etiqueta(p))}</span><br><span class="msj-pjs">${p.personajes.length ? '🎭 ' + e(p.personajes.join(', ')) : (p.gm ? 'el GM' : 'sin personaje')}</span></span></label>`).join('')
        : '<div class="msj-nota">No hay nadie más en la partida.</div>');
      v.querySelector('.msj-todos').textContent = ps.length && ps.every(p => marcados.has(p.uid)) ? 'Desmarcar a todos' : 'Marcar a todos (secreto)';
      v.querySelector('.msj-todos').hidden = grupo;
      v.querySelector('.msj-nota-priv').innerHTML = grupo ? '📣 <b>Público:</b> lo ven todos los de la partida, en la Mesa.'
        : '🔒 <b>Secreto:</b> lo leen solo vos y a quienes se lo mandes (el GM tampoco, si no se lo mandás). Les aparece en su Mesa y en su 🕊️.';
      v.querySelector('h3').textContent = grupo ? '📣 Mensaje a todo el grupo' : '🕊️ Mensaje secreto';
      v.querySelector('.si').textContent = grupo ? '📣 Enviar a todos' : '🕊️ Enviar';
    };
    const cuenta = () => {
      const t = v.querySelector('textarea').value;
      v.querySelector('.msj-cuenta').textContent = `${t.length} / ${TEXTO_MAX}`;
      v.querySelector('.si').disabled = !t.trim() || (!grupo && !marcados.size);
    };
    pintar(); cuenta();
    v.pintar = pintar;
    v.addEventListener('change', ev => {
      if(ev.target.closest('input[data-grupo]')){ grupo = ev.target.checked; pintar(); cuenta(); return; }
      const c = ev.target.closest('input[data-uid]');
      if(!c) return;
      grupo = false;
      if(c.checked) marcados.add(c.dataset.uid); else marcados.delete(c.dataset.uid);
      pintar(); cuenta();
    });
    v.querySelector('textarea').addEventListener('input', cuenta);
    const mandar = async () => {
      const b = v.querySelector('.si');
      if(b.disabled) return;
      b.disabled = true;
      const publico = grupo;
      const ok = publico ? await enviarPublico(v.querySelector('textarea').value) : await enviar([...marcados], v.querySelector('textarea').value);
      if(ok){ cerrarVentana(v); if(abierta === v) abierta = null; avisar(publico ? '📣 Mensaje enviado a todo el grupo' : '🕊️ Mensaje secreto enviado'); }
      else cuenta();
    };
    v.querySelector('textarea').addEventListener('keydown', ev => { if(ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)){ ev.preventDefault(); mandar(); } });
    v.addEventListener('click', ev => {
      if(ev.target === v || ev.target.closest('.msj-x, .no')){ cerrarVentana(v); if(abierta === v) abierta = null; return; }
      if(ev.target.closest('.msj-todos')){
        grupo = false;
        const ps = misPersonas();
        if(ps.every(p => marcados.has(p.uid))) marcados.clear(); else ps.forEach(p => marcados.add(p.uid));
        pintar(); cuenta(); return;
      }
      if(ev.target.closest('.si')) mandar();
    });
    document.body.appendChild(v);
    abierta = v;
    v.querySelector('textarea').focus();
    return v;
  }

  // La paloma: con algo sin leer, abre esa conversación; si no, la ventana con «Mensaje nuevo» y «A todo el grupo» a mano (P285, 2026-11-24).
  function abrirDesdePaloma(){
    const convs = conversaciones(lista(), yo(), misPersonas());
    const c = convs.find(x => x.noLeidos);
    if(c) return abrirConversacion(c.uid);
    if(noLeidosPub()) return abrirConversacion(GRUPO);
    convSel = '';
    abrirConversacion('', {inicio: true});
  }
  // Las conversaciones (el 🕊️ flotante, tocar un mensaje en la Mesa, en la Crónica o en el aviso). uid = GRUPO: la del grupo.
  function abrirConversacion(uid, o){
    estilos();
    if(abierta){ cerrarVentana(abierta); abierta = null; }
    if(!convAbierta){
      const v = document.createElement('div');
      v.className = 'msj-fondo';
      v.innerHTML = `<div class="msj-caja ancha" role="dialog" aria-modal="true"><header><h3>🕊️ Mensajes</h3><button type="button" class="msj-btn msj-nuevo">＋ Mensaje nuevo</button><button type="button" class="msj-x" title="Cerrar">✕</button></header>
        <div class="msj-aviso-reglas" ${faltanReglas ? '' : 'hidden'}>${e(AVISO_REGLAS)}</div>
        <div class="msj-nota" style="padding-bottom:8px">🔒 Cada conversación secreta la leen solo los que están en ella: el GM no puede leer lo que se mandan dos jugadores. 📣 La del grupo la ven todos.</div>
        <div class="msj-conv"><div class="msj-lista"></div><div class="msj-hilo"></div></div></div>`;
      v.addEventListener('click', ev => {
        if(ev.target === v || ev.target.closest('.msj-x')){ cerrarConv(); return; }
        if(ev.target.closest('.msj-nuevo')){ cerrarConv(); abrirMandar({}); return; }
        if(ev.target.closest('.msj-nuevo-grupo')){ cerrarConv(); abrirMandar({publico: true}); return; }
        const b = ev.target.closest('[data-conv]');
        if(b){ convSel = b.dataset.conv; dibujarConv(true); return; }
        if(ev.target.closest('.msj-mandar-hilo')) responder();
      });
      document.body.appendChild(v);
      convAbierta = v;
    }
    const convs = conversaciones(lista(), yo(), misPersonas());
    convSel = (o && o.inicio) ? '' : (uid || convSel || (convs.find(c => c.noLeidos) || convs[0] || {}).uid || '');
    dibujarConv(true);
  }
  function cerrarConv(){ if(convAbierta){ convAbierta.remove(); convAbierta = null; } }
  let borradorHilo = {};
  function dibujarConv(enfocar){
    const v = convAbierta;
    if(!v) return;
    const ps = misPersonas();
    const convs = conversaciones(lista(), yo(), ps);
    if(convSel && convSel !== GRUPO && !convs.some(c => c.uid === convSel)) convs.push({uid: convSel, nombre: (persona(convSel) || {}).nombre || '?', msgs: [], noLeidos: 0, ultima: 0});
    const ta = v.querySelector('.msj-responder textarea');
    if(ta) borradorHilo[ta.dataset.conv || convSel] = ta.value;
    const nPub = noLeidosPub();
    v.querySelector('.msj-lista').innerHTML = `<button type="button" data-conv="${GRUPO}" class="grupo ${convSel === GRUPO ? 'activa' : ''}"><b>📣 Todo el grupo</b><span class="msj-l-pjs">Público: lo ven todos</span>${nPub ? `<span class="msj-l-n">${nPub}</span>` : ''}</button>` +
      (convs.length ? convs.map(c => { const p = persona(c.uid);
      return `<button type="button" data-conv="${e(c.uid)}" class="${c.uid === convSel ? 'activa' : ''}"><b>🔒 ${e(p ? etiqueta(p) : c.nombre)}</b><span class="msj-l-pjs">${e(p ? personajesTxt(p) : '')}</span>${c.noLeidos ? `<span class="msj-l-n">${c.noLeidos}</span>` : ''}</button>`; }).join('')
      : '<div class="msj-l-vacia">Todavía no hay mensajes secretos. Mandá uno con «＋ Mensaje nuevo» o escribiendo en la Mesa <b>/m</b> y el nombre.</div>');
    const hora = m => { const t = ms(m.cuando); if(!t) return ''; const d = new Date(t); return d.toLocaleDateString('es-AR', {day: '2-digit', month: '2-digit'}) + ' ' + d.toLocaleTimeString('es-AR', {hour: '2-digit', minute: '2-digit', hour12: false}); };
    const hilo = v.querySelector('.msj-hilo');
    const enganchar = (nta) => {
      const caja = hilo.querySelector('.msj-hilo-msgs');
      if(caja) caja.scrollTop = caja.scrollHeight;
      nta.dataset.conv = convSel;
      nta.value = borradorHilo[convSel] || '';
      nta.addEventListener('keydown', ev => { if(ev.key === 'Enter' && !ev.shiftKey){ ev.preventDefault(); responder(); } });
      if(enfocar) nta.focus();
    };
    if(convSel === GRUPO){
      const ps = listaPub();
      hilo.innerHTML = `<div class="msj-hilo-cab"><b>📣 Todo el grupo</b> <span class="msj-l-pjs" style="display:inline;color:#d9b9cb">· público: sale en la Mesa de todos, también del GM</span></div>` +
        `<div class="msj-hilo-msgs">${ps.length ? ps.map(m => { const mia = m.uid === yo();
          return `<div class="msj-burbuja pub ${mia ? 'mia' : 'suya'}">${mia ? '' : `<span class="msj-de">${e(m.jugador || '?')}</span>`}${e(m.texto)}<span class="msj-hora">${e(hora(m))}</span></div>`; }).join('')
          : '<div class="msj-hilo-vacio">Todavía nadie le escribió al grupo. Escribí abajo.</div>'}</div>` +
        `<div class="msj-responder"><textarea maxlength="${TEXTO_MAX}" placeholder="Escribile a todo el grupo… (Enter manda, Shift+Enter baja de renglón)"></textarea><button type="button" class="msj-btn si msj-mandar-hilo">📣 Enviar</button></div>`;
      enganchar(hilo.querySelector('textarea'));
      if(nPub && document.visibilityState === 'visible'){ marcarVistoPub(); dibujarBoton(); setTimeout(() => { if(convAbierta && convSel === GRUPO) dibujarConv(); }, 0); }
      return;
    }
    const c = convs.find(x => x.uid === convSel);
    if(!c){ hilo.innerHTML = `<div class="msj-inicio"><div>¿Qué querés mandar?</div><button type="button" class="msj-btn si msj-nuevo">🕊️ Mensaje secreto</button>` +
      `<button type="button" class="msj-btn grupo msj-nuevo-grupo">📣 Mensaje a todo el grupo</button><div>O elegí una conversación de la izquierda. En la Mesa también podés escribir <b>/m</b> y el nombre, o <b>/r</b> para responderle al último que te escribió.</div></div>`; return; }
    const p = persona(c.uid);
    hilo.innerHTML = `<div class="msj-hilo-cab">Con <b>${e(p ? etiqueta(p) : c.nombre)}</b> <span class="msj-l-pjs" style="display:inline;color:#d9b9cb">· ${e(p ? personajesTxt(p) : '')}</span></div>` +
      `<div class="msj-hilo-msgs">${c.msgs.length ? c.msgs.map(m => { const mia = m.de === yo(); const otros = mia ? (m.paraNombres || []).filter((n, i) => m.para[i] !== c.uid) : tambienPara(m, yo());
        return `<div class="msj-burbuja ${mia ? 'mia' : 'suya'}">${otros.length ? `<span class="msj-tambien">${mia ? 'También a' : 'También para'}: ${e(otros.join(', '))}</span>` : ''}${e(m.texto)}<span class="msj-hora">${e(hora(m))}</span></div>`; }).join('')
        : '<div class="msj-hilo-vacio">Todavía no se mandaron nada. Escribí abajo.</div>'}</div>` +
      `<div class="msj-responder"><textarea maxlength="${TEXTO_MAX}" placeholder="Responder a ${e(p ? p.nombre : c.nombre)}… (Enter manda, Shift+Enter baja de renglón)"></textarea><button type="button" class="msj-btn si msj-mandar-hilo">Enviar</button></div>`;
    enganchar(hilo.querySelector('textarea'));
    if(c.noLeidos && document.visibilityState === 'visible') marcarLeidos(c.uid);
  }
  async function responder(){
    const v = convAbierta;
    if(!v || !convSel) return;
    const ta = v.querySelector('.msj-responder textarea'), b = v.querySelector('.msj-mandar-hilo');
    if(!ta.value.trim()) return;
    b.disabled = true;
    const ok = convSel === GRUPO ? await enviarPublico(ta.value) : await enviar([convSel], ta.value);
    b.disabled = false;
    if(ok){ ta.value = ''; borradorHilo[convSel] = ''; }
  }

  /* ---------- La Mesa: el 🕊️ al pie, el comando y el autocompletado ---------- */
  let sug = null, sugLista = [], sugI = 0, sugInput = null;
  function cerrarSug(){ if(sug){ sug.remove(); sug = null; } sugLista = []; }
  function mostrarSug(input){
    const f = fragmento(input.value, misPersonas(), {grupo: true});
    if(f === null){ cerrarSug(); return; }
    sugLista = sugerencias(misPersonas(), f, 8, {grupo: true});
    if(!sugLista.length){ cerrarSug(); return; }
    sugInput = input;
    if(sugI >= sugLista.length) sugI = 0;
    if(!sug){ sug = document.createElement('div'); sug.className = 'msj-sug'; document.body.appendChild(sug);
      sug.addEventListener('mousedown', ev => { const b = ev.target.closest('[data-sug]'); if(b){ ev.preventDefault(); elegirSug(Number(b.dataset.sug)); } }); }
    sug.innerHTML = '<div class="msj-sug-tit">🕊️ Mensaje secreto para… (↑↓ y Enter o Tab)</div>' + sugLista.map((c, i) => `<button type="button" data-sug="${i}" class="${i === sugI ? 'activa' : ''}">` +
      `<span>${c.tipo === 'grupo' ? '📣' : c.tipo === 'personaje' ? '🎭' : (c.persona.gm ? '👑' : '👤')} ${e(c.nombre)}</span><span class="msj-sug-a">${c.tipo === 'grupo' ? 'público, lo ven todos' : c.tipo === 'personaje' ? '→ ' + e(etiqueta(c.persona)) : (c.persona.personajes.length ? e(c.persona.personajes.join(', ')) : (c.persona.gm ? 'GM' : ''))}</span></button>`).join('');
    const r = input.getBoundingClientRect();
    sug.style.left = Math.max(8, Math.min(r.left, window.innerWidth - 370)) + 'px';
    sug.style.bottom = (window.innerHeight - r.top + 6) + 'px';
    sug.style.top = 'auto';
  }
  function elegirSug(i){
    const c = sugLista[i], input = sugInput;
    if(!c || !input) return;
    const m = /^(\s*\/m\s+)/i.exec(input.value);
    input.value = (m ? m[1] : '/m ') + c.nombre + ' ';
    cerrarSug();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
  function conectarMesa(){
    const form = document.getElementById('mesa-tirar'), input = document.getElementById('mesa-formula');
    if(!form || !input || form.dataset.mensajes) return;
    form.dataset.mensajes = '1';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn mensajes-boton-mesa';
    b.title = 'Mandar un mensaje secreto o a todo el grupo (o escribí /m y el nombre; /r responde al último que te escribió)';
    b.textContent = '🕊️';
    b.onclick = () => abrirMandar({});
    form.appendChild(b);
    input.placeholder = 'Tirada libre (2d6+3), /m Nombre mensaje o /r respuesta';
    input.addEventListener('input', () => { sugI = 0; mostrarSug(input); });
    input.addEventListener('blur', () => setTimeout(cerrarSug, 150));
    input.addEventListener('keydown', ev => {
      if(!sug) return;
      if(ev.key === 'ArrowDown' || ev.key === 'ArrowUp'){ ev.preventDefault(); sugI = (sugI + (ev.key === 'ArrowDown' ? 1 : sugLista.length - 1)) % sugLista.length; mostrarSug(input); return; }
      if(ev.key === 'Enter' || ev.key === 'Tab'){ ev.preventDefault(); ev.stopPropagation(); elegirSug(sugI); return; }
      if(ev.key === 'Escape'){ ev.preventDefault(); ev.stopPropagation(); cerrarSug(); }
    }, true);
    // El comando va antes que la tirada libre de cada herramienta (fase de captura, en el documento).
    document.addEventListener('submit', ev => {
      if(ev.target !== form) return;
      const ult = ultimoQueMeEscribio(lista(), yo());
      const p = parsear(input.value, misPersonas(), {grupo: true, ultimo: ult ? (persona(ult) || {uid: ult, nombre: (lista().find(m => m.de === ult) || {}).deNombre || '?'}) : null});
      if(!p) return;
      ev.preventDefault();
      ev.stopImmediatePropagation();
      cerrarSug();
      if(p.responder){
        if(!p.persona){ avisar('Todavía nadie te mandó un mensaje secreto para responder: usá /m y el nombre.'); return; }
        if(!p.texto){ input.value = ''; abrirConversacion(p.persona.uid); return; }
        if(faltanReglas){ avisar(AVISO_REGLAS); return; }
        enviar([p.persona.uid], p.texto).then(ok => { if(ok){ input.value = ''; avisar(`🕊️ Respuesta secreta para ${p.persona.nombre}`); } });
        return;
      }
      if(p.persona && p.persona.grupo){
        if(!p.texto){ input.value = ''; abrirMandar({publico: true}); return; }
        enviarPublico(p.texto).then(ok => { if(ok){ input.value = ''; avisar('📣 Mensaje enviado a todo el grupo'); } });
        return;
      }
      if(p.ambiguo){ avisar('Hay más de una persona con ese nombre: elegila en la ventanita del 🕊️.'); abrirMandar({}); return; }
      if(!p.persona){ avisar('¿A quién? Escribí /m y las primeras letras del nombre (de la persona o de su personaje) y elegilo de la lista.'); mostrarSug(input); return; }
      if(!p.texto){ abrirMandar({para: [p.persona.uid]}); input.value = ''; return; }
      if(faltanReglas){ avisar(AVISO_REGLAS); return; }
      enviar([p.persona.uid], p.texto).then(ok => { if(ok){ input.value = ''; avisar(`🕊️ Mensaje secreto para ${p.persona.nombre}`); } });
    }, true);
  }

  /* ---------- Arranque ---------- */
  function iniciar(){
    if(iniciado) return;
    try{ if(window.parent !== window) return; }catch(err){ return; }   // los iframes del mapa (Botonera, Acciones) no
    if(typeof fbDb === 'undefined' || !fbDb || !yo()) return;
    iniciado = true;
    estilos();
    document.addEventListener('keydown', tecla, true);
    conectarMesa();
    escucharNombres();
    escuchar();
    escucharPublicos();
    window.addEventListener('storage', ev => { if(ev.key === claveVisto()) redibujar(); });   // lo del grupo leído en otra pestaña
    dibujarBoton();
  }

  // Para las pruebas y las capturas armadas con datos en memoria (no escribe nada): carga mensajes como si hubieran llegado.
  function _cargar(lst, o){
    if(o && o.publicos){ o.publicos.forEach(m => { const ya = pubs.has(m.id); pubs.set(m.id, m); if(!ya && o.nuevos && m.uid !== yo()) avisarLlegada({uid: GRUPO, publico: true, nombre: m.jugador, texto: m.texto}); }); redibujar(); }
    const nuevos = [];
    (lst || []).forEach(m => { const ya = msgs.has(m.id); msgs.set(m.id, m); if(!ya && o && o.nuevos && m.de !== yo()) nuevos.push(m); });
    alCambiar(nuevos);
  }

  return {TEXTO_MAX, PARA_MAX, CRONICA_MS, AVISO_REGLAS, GRUPO, personas, candidatos, sugerencias, comando, parsear, fragmento, armarDoc, armarPublico,
    ultimoQueMeEscribio, publicosNoLeidos, sinLeer, conversaciones, noLeidos, mezclarEnMesa, mesaHtml, publicoHtml, cronicaHtml,
    iniciar, abrirMandar, abrirConversacion, abrirDesdePaloma, borrar, faltanReglas: () => faltanReglas, _cargar, yo,
    mesa: (docs, tope) => mezclarEnMesa(docs, iniciado ? lista() : [], yo(), tope)};
})();
