/* =========================================================
   PPT — ✊ Piedra, papel o tijera (2026-10-08, pedido del dueño: «un botón … que vos al seleccionarlo seleccionás contra quién va, puede
   ser contra otro usuario o contra el GM … y eso se va a poder usar para muchas situaciones»; y para disputar un ítem del botín: «a los
   dos les aparecen tres iconos: una piedra, un papel y una tijera, dispuestos en un triángulo, y se muestra el resultado cuando los dos
   hayan decidido»).
   Un juego es un documento de campanas/<id>/ppt:
     {a: {uid, nombre, ficha}, b: {…}, uids: [a.uid, b.uid], motivo: {tipo: 'libre', texto} | {tipo: 'botin', botinId, item},
      jugadas: {a: '', b: ''}, ronda, estado: 'jugando' | 'terminado' | 'cancelado', ganador: 'a' | 'b' | '', rendido: 'a' | 'b' | '',
      ultima: {ronda, a, b, res: 'a' | 'b' | 'empate'} | null, creado, actualizado}
   (en un juego del botín, `a` es quien lo reclamó y `b` quien se lo disputa).
   - retar(): elegir contra quién (los de la partida; el GM, marcado) y para qué (opcional), y empezar.
   - ref() / docNuevo({a, b, motivo}): para crearlo adentro de otra transacción (la disputa del botín, comun/ficha-botin.js).
   - elegir(id, jugada): una transacción; la segunda jugada resuelve: empate = otra ronda; si no, gana uno y, si es por el botín, el ítem
     queda a su nombre (en la misma transacción). Lo anuncia en la Mesa y en la Crónica del mapa.
   - rendirse(id): gana el otro. mostrar(id): vuelve a abrir la ventana de un juego. juega(id): ¿este usuario juega en ese?
   - iniciar(): escucha los juegos de este usuario y muestra la ventana (no dentro de un marco del mapa: ahí la muestra el mapa).
   Relajado (anotado en «Antes de abrirlo al público»): las dos jugadas viajan en el documento; la pantalla no muestra la del otro hasta que
   eligieron los dos.
   Necesita las globals de sesion.js (Firebase). Usa toast() y momentoAbrir() (la Crónica del mapa) si la página las tiene.
   ========================================================= */
const PPT = (() => {
  const JUGADAS = {
    piedra: {icono: '🪨', nombre: 'Piedra', gana: 'tijera'},
    papel: {icono: '📄', nombre: 'Papel', gana: 'piedra'},
    tijera: {icono: '✂️', nombre: 'Tijera', gana: 'papel'},
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const aviso = t => (typeof toast === 'function' ? toast(t) : console.log(t));
  const col = () => fbDb.collection(fbRutaCampana('ppt'));
  const yo = () => (typeof fbUsuario !== 'undefined' && fbUsuario) ? fbUsuario.uid : '';
  const ts = () => typeof firebase !== 'undefined' ? firebase.firestore.FieldValue.serverTimestamp() : null;   // (sin Firebase: las pruebas)

  // Quién gana: 'a', 'b' o 'empate'.
  function resultado(ja, jb){
    if(ja === jb) return 'empate';
    return JUGADAS[ja].gana === jb ? 'a' : 'b';
  }
  const ladoDe = (d, uid) => d.a && d.a.uid === uid ? 'a' : d.b && d.b.uid === uid ? 'b' : '';
  const otro = l => l === 'a' ? 'b' : 'a';
  const lado = o => ({uid: String(o.uid || ''), nombre: String(o.nombre || '?').slice(0, 60), ficha: String(o.ficha || '').slice(0, 80)});

  const ref = () => col().doc();
  function docNuevo({a, b, motivo}){
    const m = motivo && motivo.tipo === 'botin'
      ? {tipo: 'botin', botinId: String(motivo.botinId || ''), item: String(motivo.item || '').slice(0, 80)}
      : {tipo: 'libre', texto: String((motivo && motivo.texto) || '').slice(0, 120)};
    return {a: lado(a), b: lado(b), uids: [String(a.uid), String(b.uid)], motivo: m, jugadas: {a: '', b: ''}, ronda: 1,
      estado: 'jugando', ganador: '', rendido: '', ultima: null, creado: ts(), actualizado: ts()};
  }
  const motivoTxt = d => !d.motivo ? '' : d.motivo.tipo === 'botin' ? `por ${d.motivo.item || 'un ítem del botín'}` : (d.motivo.texto || '');
  const errorTxt = err => err && err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : '';

  // Cerrar el juego con un ganador (adentro de la transacción). Si es por el botín y el ítem sigue ahí, queda a nombre del ganador.
  function cerrarEn(tx, r, d, ganador, extra, botin){
    tx.update(r, {estado: 'terminado', ganador, actualizado: ts(), ...extra});
    if(botin && botin.exists && botin.data().disputa === r.id){
      const g = d[ganador];
      tx.update(botin.ref, {tomadoPor: g.uid, tomadoNombre: g.nombre, tomadoFicha: g.ficha || '', disputa: ''});
    }
  }
  const leerBotin = (tx, d) => d.motivo && d.motivo.tipo === 'botin' && d.motivo.botinId
    ? tx.get(fbDb.collection(fbRutaCampana('botin')).doc(d.motivo.botinId)) : Promise.resolve(null);

  async function elegir(id, jugada){
    if(!JUGADAS[jugada] || !yo()) return;
    const r = col().doc(id);
    let fin = null;
    try{
      fin = await fbDb.runTransaction(async tx => {
        const s = await tx.get(r);
        if(!s.exists) return {error: 'Ese juego ya no existe'};
        const d = s.data();
        if(d.estado !== 'jugando') return {error: 'Ese juego ya terminó'};
        const l = ladoDe(d, yo());
        if(!l) return {error: 'No jugás en este'};
        const j = {a: '', b: '', ...(d.jugadas || {})};
        if(j[l]) return {error: 'Ya elegiste'};
        const botin = await leerBotin(tx, d);
        j[l] = jugada;
        if(!j[otro(l)]){ tx.update(r, {[`jugadas.${l}`]: jugada, actualizado: ts()}); return {espera: true}; }
        const res = resultado(j.a, j.b), ronda = d.ronda || 1;
        const ultima = {ronda, a: j.a, b: j.b, res};
        if(res === 'empate'){ tx.update(r, {jugadas: {a: '', b: ''}, ronda: ronda + 1, ultima, actualizado: ts()}); return {empate: true}; }
        cerrarEn(tx, r, d, res, {jugadas: j, ultima}, botin);
        return {gano: res, d, ultima};
      });
    }catch(err){
      console.error('No se pudo jugar:', err);
      aviso('No se pudo jugar' + errorTxt(err));
      return;
    }
    if(fin && fin.error) aviso(fin.error);
    if(fin && fin.gano) anunciar(fin.d, fin.gano, fin.ultima, '');
    dibujar();
  }

  async function rendirse(id){
    const r = col().doc(id);
    let fin = null;
    try{
      fin = await fbDb.runTransaction(async tx => {
        const s = await tx.get(r);
        if(!s.exists) return null;
        const d = s.data();
        const l = ladoDe(d, yo());
        if(d.estado !== 'jugando' || !l) return null;
        const botin = await leerBotin(tx, d);
        cerrarEn(tx, r, d, otro(l), {rendido: l}, botin);
        return {d, ganador: otro(l), rendido: l};
      });
    }catch(err){
      console.error('No se pudo rendir:', err);
      aviso('No se pudo' + errorTxt(err));
      return;
    }
    if(fin) anunciar(fin.d, fin.ganador, null, fin.rendido);
  }

  // La línea de la Mesa y la Crónica del mapa (todos se enteran).
  function anunciar(d, ganador, ultima, rendido){
    const A = d.a.nombre, B = d.b.nombre, G = d[ganador].nombre;
    const premio = d.motivo && d.motivo.tipo === 'botin' ? ` y se lleva ${d.motivo.item || 'el ítem'}` : '';
    const para = motivoTxt(d);
    const como = rendido ? `${d[rendido].nombre} se rindió` : `${A} ${JUGADAS[ultima.a].icono} contra ${JUGADAS[ultima.b].icono} ${B}`;
    const texto = `✊ Piedra, papel o tijera${para ? ' (' + para + ')' : ''}: ${como} → gana ${G}${premio}`;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: yo(), jugador: (typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.nombre) || '', quien: '', origen: texto, formula: '',
      rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: ts(),
    }).catch(err => console.error('No se pudo escribir en la Mesa:', err));
    if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'ppt', icono: '✊', titulo: `Piedra, papel o tijera: ${A} contra ${B}`, resultado: texto.replace(/^✊ /, ''), estado: 'listo'});
  }

  /* ---------- Retar: contra quién ---------- */
  async function retar(){
    if(!yo()){ aviso('Entrá a la partida para jugar'); return; }
    estilos();
    let lista = [];
    try{
      const snap = await fbDb.collection(fbRutaCampana('miembros')).get();
      lista = snap.docs.filter(x => x.id !== yo()).map(x => ({uid: x.id, nombre: String(x.data().nombre || '?'), gm: x.data().gm === true}))
        .sort((p, q) => (q.gm - p.gm) || p.nombre.localeCompare(q.nombre, 'es'));
    }catch(err){ console.error(err); aviso('No se pudo leer quiénes están en la partida'); return; }
    cerrarRetar();
    const f = document.createElement('div');
    f.id = 'ppt-retar';
    f.className = 'ppt-fondo';
    f.innerHTML = `<div class="ppt-caja ppt-chica">
      <div class="ppt-cab"><b>✊ Piedra, papel o tijera</b><button type="button" class="ppt-x" data-ppt-r="cerrar" title="Cancelar">✕</button></div>
      <label class="ppt-lbl">¿Para qué? <span>(opcional)</span><input type="text" id="ppt-para" maxlength="120" placeholder="ej: quién abre la puerta"></label>
      <div class="ppt-lbl">¿Contra quién?</div>
      <div class="ppt-lista">${lista.length ? lista.map(m => `<button type="button" class="ppt-rival" data-ppt-rival="${esc(m.uid)}">${esc(m.nombre)}${m.gm ? ' <span class="ppt-gm">GM</span>' : ''}</button>`).join('')
        : '<div class="ppt-nota">No hay nadie más en la partida.</div>'}</div>
    </div>`;
    document.body.appendChild(f);
    f.addEventListener('click', async e => {
      const t = e.target.closest('button');
      if(e.target === f || (t && t.dataset.pptR === 'cerrar')){ cerrarRetar(); return; }
      if(!t || !t.dataset.pptRival) return;
      const m = lista.find(x => x.uid === t.dataset.pptRival);
      const texto = (f.querySelector('#ppt-para').value || '').trim();
      cerrarRetar();
      const yoNombre = (fbMiembro && fbMiembro.nombre) || '?';
      try{
        await ref().set(docNuevo({a: {uid: yo(), nombre: yoNombre}, b: {uid: m.uid, nombre: m.nombre}, motivo: {tipo: 'libre', texto}}));
        aviso(`✊ Desafiaste a ${m.nombre}`);
      }catch(err){ console.error('No se pudo empezar el juego:', err); aviso('No se pudo empezar' + errorTxt(err)); }
    });
    setTimeout(() => { const i = f.querySelector('#ppt-para'); if(i) i.focus(); }, 30);
  }
  function cerrarRetar(){ const f = document.getElementById('ppt-retar'); if(f) f.remove(); }

  /* ---------- La ventana del juego ---------- */
  const juegos = new Map();   // id -> doc (solo los de este usuario)
  const ocultos = new Set();  // los que se minimizaron
  const vistos = new Set();   // `${id}:${ronda}` de los resultados ya revelados acá
  const finales = [];         // los que terminaron mientras esta pantalla estaba abierta (se muestran hasta «Cerrar»)
  let escucha = null, primera = true, revela = null;   // revela = {id, ultima, fase: 'agita' | 'listo'}

  function iniciar(){
    if(escucha || typeof fbDb === 'undefined' || !fbDb || !yo()) return;
    if(window.parent !== window) return;   // dentro de un marco del mapa: la muestra el mapa
    estilos();
    escucha = col().where('uids', 'array-contains', yo()).onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        const id = ch.doc.id;
        if(ch.type === 'removed'){ juegos.delete(id); return; }
        const d = ch.doc.data(), antes = juegos.get(id);
        juegos.set(id, d);
        const u = d.ultima, clave = u ? `${id}:${u.ronda}` : '';
        if(primera){ if(clave) vistos.add(clave); return; }
        if(clave && !vistos.has(clave)){ vistos.add(clave); ocultos.delete(id); revelar(id, u); }
        if(d.estado !== 'jugando' && (!antes || antes.estado === 'jugando') && !finales.includes(id)) finales.push(id);
        if(!antes && d.estado === 'jugando'){
          const botin = d.motivo && d.motivo.tipo === 'botin';
          if(botin && d.a.uid === yo()) aviso(`⚔ ${d.b.nombre} te disputa ${d.motivo.item}: piedra, papel o tijera`);
          else if(!botin && d.b.uid === yo()) aviso(`✊ ${d.a.nombre} te desafía a piedra, papel o tijera`);
        }
      });
      primera = false;
      dibujar();
    }, err => console.error('Error escuchando piedra, papel o tijera:', err));
    if(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm) barrerViejos();
  }
  // El GM borra los de más de un día al entrar.
  async function barrerViejos(){
    try{
      const viejo = firebase.firestore.Timestamp.fromMillis(Date.now() - 24 * 3600 * 1000);
      const snap = await col().where('creado', '<', viejo).limit(100).get();
      if(snap.empty) return;
      const lote = fbDb.batch();
      snap.docs.forEach(x => lote.delete(x.ref));
      await lote.commit();
    }catch(err){ console.error('No se pudieron barrer los juegos viejos:', err); }
  }
  function revelar(id, ultima){
    revela = {id, ultima, fase: 'agita'};
    dibujar();
    setTimeout(() => { if(revela && revela.id === id && revela.ultima === ultima){ revela.fase = 'listo'; dibujar(); } }, 1100);
    setTimeout(() => { if(revela && revela.id === id && revela.ultima === ultima){ revela = null; dibujar(); } }, 3600);
  }
  const juega = id => juegos.has(id);
  function mostrar(id){ ocultos.delete(id); dibujar(); }

  // Qué juego se ve: el que se está revelando, uno que terminó (hasta cerrarlo) o el más nuevo en juego que no se ocultó.
  function actual(){
    if(revela && juegos.has(revela.id)) return {id: revela.id, modo: 'revela'};
    const f = finales.find(id => juegos.has(id) && !ocultos.has(id));
    if(f) return {id: f, modo: 'fin'};
    const enJuego = [...juegos.entries()].filter(([id, d]) => d.estado === 'jugando' && !ocultos.has(id))
      .sort((p, q) => ((q[1].creado && q[1].creado.toMillis ? q[1].creado.toMillis() : Date.now()) - (p[1].creado && p[1].creado.toMillis ? p[1].creado.toMillis() : Date.now())));
    return enJuego.length ? {id: enJuego[0][0], modo: 'jugar'} : null;
  }

  function caraHtml(nombre, jugada, agita, gana){
    const j = JUGADAS[jugada];
    return `<div class="ppt-cara${gana ? ' gana' : ''}"><div class="ppt-mano${agita ? ' agita' : ' pop'}">${agita || !j ? '✊' : j.icono}</div>
      <div class="ppt-quien">${esc(nombre)}</div><div class="ppt-nota">${agita || !j ? '…' : j.nombre}</div></div>`;
  }
  function cabHtml(d){
    const para = motivoTxt(d);
    return `<div class="ppt-cab"><b>✊ Piedra, papel o tijera</b><button type="button" class="ppt-x" data-ppt="ocultar" title="Ocultar (sigue abajo)">—</button></div>
      ${para ? `<div class="ppt-motivo">${d.motivo.tipo === 'botin' ? '🎁 ' : ''}${esc(para)}</div>` : ''}`;
  }
  function resultadoHtml(d, l, res, rendido){
    if(res === 'empate') return '<div class="ppt-banner empate">Empate: otra vez</div>';
    const premio = d.motivo && d.motivo.tipo === 'botin' ? (res === l ? ` · te llevás ${esc(d.motivo.item)}` : ` · se lo lleva ${esc(d[res].nombre)}`) : '';
    const por = rendido ? `<div class="ppt-nota">${rendido === l ? 'Te rendiste' : esc(d[rendido].nombre) + ' se rindió'}</div>` : '';
    return `<div class="ppt-banner ${res === l ? 'bien' : 'mal'}">${res === l ? '¡Ganaste!' : 'Perdiste'}${premio}</div>${por}`;
  }

  function dibujar(){
    if(!escucha) return;
    let f = document.getElementById('ppt-fondo');
    const a = actual();
    // El botoncito de abajo con los que se ocultaron.
    const ocultosEnJuego = [...juegos.entries()].filter(([id, d]) => d.estado === 'jugando' && ocultos.has(id));
    let chip = document.getElementById('ppt-chip');
    if(ocultosEnJuego.length){
      if(!chip){ chip = document.createElement('button'); chip.type = 'button'; chip.id = 'ppt-chip'; document.body.appendChild(chip); chip.onclick = () => { ocultos.clear(); dibujar(); }; }
      const [, d] = ocultosEnJuego[0], l = ladoDe(d, yo()), falta = !(d.jugadas || {})[l];
      chip.className = falta ? 'late' : '';
      chip.textContent = `✊ Piedra, papel o tijera con ${d[otro(l)].nombre}${ocultosEnJuego.length > 1 ? ` (+${ocultosEnJuego.length - 1})` : ''}${falta ? ' · te toca elegir' : ''}`;
    }else if(chip) chip.remove();
    if(!a){ if(f) f.remove(); return; }
    if(!f){ f = document.createElement('div'); f.id = 'ppt-fondo'; f.className = 'ppt-fondo'; document.body.appendChild(f); f.addEventListener('click', clic); }
    const d = juegos.get(a.id), l = ladoDe(d, yo()), o = otro(l);
    f.dataset.id = a.id;
    let cuerpo;
    if(a.modo === 'revela'){
      const u = revela.ultima, agita = revela.fase === 'agita';
      cuerpo = `<div class="ppt-caras">${caraHtml('Vos', u[l], agita, !agita && u.res === l)}<div class="ppt-vs">contra</div>${caraHtml(d[o].nombre, u[o], agita, !agita && u.res === o)}</div>
        ${agita ? '<div class="ppt-banner">¡Piedra, papel o tijera!</div>' : resultadoHtml(d, l, u.res, '')}`;
    }else if(a.modo === 'fin'){
      const u = d.ultima && !d.rendido ? d.ultima : null;
      cuerpo = `${u ? `<div class="ppt-caras">${caraHtml('Vos', u[l], false, d.ganador === l)}<div class="ppt-vs">contra</div>${caraHtml(d[o].nombre, u[o], false, d.ganador === o)}</div>` : ''}
        ${d.estado === 'cancelado' ? '<div class="ppt-banner empate">Se cortó el juego (el GM cerró el botín)</div>' : resultadoHtml(d, l, d.ganador, d.rendido)}
        <div class="ppt-pie"><button type="button" class="ppt-btn" data-ppt="cerrar">Cerrar</button></div>`;
    }else{
      const j = d.jugadas || {}, mia = j[l], suya = !!j[o];
      const empate = d.ultima && d.ultima.res === 'empate' && d.ultima.ronda === (d.ronda || 1) - 1;
      const boton = (k, pos) => `<button type="button" class="ppt-elige ${pos}${mia === k ? ' elegida' : ''}${mia && mia !== k ? ' apagada' : ''}" data-ppt-jugada="${k}"${mia ? ' disabled' : ''} title="${JUGADAS[k].nombre}">
        <span>${JUGADAS[k].icono}</span><small>${JUGADAS[k].nombre}</small></button>`;
      cuerpo = `<div class="ppt-contra">Vos contra <b>${esc(d[o].nombre)}</b>${(d.ronda || 1) > 1 ? ` · ronda ${d.ronda}` : ''}</div>
        ${empate ? `<div class="ppt-banner empate chico">Empate: ${JUGADAS[d.ultima.a].icono} contra ${JUGADAS[d.ultima.b].icono} — otra vez</div>` : ''}
        <div class="ppt-tri">${boton('piedra', 'arriba')}${boton('papel', 'izq')}${boton('tijera', 'der')}</div>
        <div class="ppt-estado">${mia ? `Elegiste ${JUGADAS[mia].nombre}. ${suya ? 'Resolviendo…' : `Esperando a ${esc(d[o].nombre)}…`}`
          : `Elegí. ${suya ? `${esc(d[o].nombre)} ya eligió.` : `${esc(d[o].nombre)} todavía no eligió.`} Nadie ve lo del otro hasta que eligen los dos.`}</div>
        <div class="ppt-pie"><button type="button" class="ppt-btn sec" data-ppt="rendirse" title="Gana ${esc(d[o].nombre)}">🏳 Rendirse</button></div>`;
    }
    f.innerHTML = `<div class="ppt-caja">${cabHtml(d)}${cuerpo}</div>`;
  }
  function clic(e){
    const f = document.getElementById('ppt-fondo');
    const id = f && f.dataset.id;
    const b = e.target.closest('button');
    if(!id || !b) return;
    if(b.dataset.pptJugada){ elegir(id, b.dataset.pptJugada); return; }
    const q = b.dataset.ppt;
    if(q === 'ocultar'){
      const i = finales.indexOf(id);
      if(i >= 0) finales.splice(i, 1); else ocultos.add(id);
      if(revela && revela.id === id) revela = null;
      dibujar();
    }else if(q === 'cerrar'){
      const i = finales.indexOf(id);
      if(i >= 0) finales.splice(i, 1);
      dibujar();
    }else if(q === 'rendirse'){
      const d = juegos.get(id);
      if(d && confirm(`¿Rendirte? Gana ${d[otro(ladoDe(d, yo()))].nombre}.`)) rendirse(id);
    }
  }

  function estilos(){
    if(document.getElementById('ppt-css')) return;
    const s = document.createElement('style');
    s.id = 'ppt-css';
    s.textContent = `
.ppt-fondo{position:fixed;inset:0;z-index:99700;display:flex;align-items:center;justify-content:center;background:rgba(8,10,16,.55);font-family:Inter,system-ui,sans-serif}
.ppt-caja{width:min(440px,calc(100vw - 32px));background:#1b2030;color:#e8ecf4;border:1px solid #39435c;border-radius:14px;box-shadow:0 18px 50px rgba(0,0,0,.55);padding:14px 16px 16px;text-align:center}
.ppt-chica{text-align:left}
.ppt-cab{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;font-size:15px}
.ppt-x{background:none;border:1px solid #39435c;color:#e8ecf4;border-radius:8px;padding:2px 10px;cursor:pointer;font-size:14px}
.ppt-motivo{font-size:13px;color:#ffd25a;margin-bottom:4px}
.ppt-contra{font-size:14px;margin:4px 0 6px;color:#c9d2e3}
.ppt-tri{position:relative;height:250px;margin:6px auto 4px;width:300px}
.ppt-elige{position:absolute;width:104px;height:104px;border-radius:50%;border:2px solid #39435c;background:#242b3f;color:#e8ecf4;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:transform .15s,border-color .15s,opacity .2s,box-shadow .15s}
.ppt-elige span{font-size:46px;line-height:1}
.ppt-elige small{font-size:12px;letter-spacing:.04em;color:#c9d2e3}
.ppt-elige:hover:not([disabled]){transform:scale(1.08);border-color:#2d6cdf;box-shadow:0 0 0 4px rgba(45,108,223,.25)}
.ppt-elige.arriba{left:98px;top:0}.ppt-elige.izq{left:4px;top:142px}.ppt-elige.der{left:192px;top:142px}
.ppt-elige.elegida{border-color:#ffd25a;box-shadow:0 0 0 5px rgba(255,210,90,.25);cursor:default}
.ppt-elige.apagada{opacity:.25;cursor:default}
.ppt-estado{font-size:13px;color:#c9d2e3;min-height:34px;margin-top:4px}
.ppt-caras{display:flex;align-items:center;justify-content:center;gap:14px;margin:14px 0 8px}
.ppt-cara{display:flex;flex-direction:column;align-items:center;gap:4px;min-width:120px;padding:10px 6px;border-radius:12px;border:2px solid transparent}
.ppt-cara.gana{border-color:#4ec98a;background:rgba(78,201,138,.10)}
.ppt-mano{font-size:64px;line-height:1.1}
.ppt-mano.agita{animation:ppt-agita .36s ease-in-out 3}
.ppt-mano.pop{animation:ppt-pop .35s ease-out}
@keyframes ppt-agita{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-18px) rotate(-12deg)}}
@keyframes ppt-pop{0%{transform:scale(.4)}70%{transform:scale(1.18)}100%{transform:scale(1)}}
.ppt-quien{font-weight:700;font-size:14px}
.ppt-vs{font-size:12px;color:#9aa6bd;text-transform:uppercase;letter-spacing:.1em}
.ppt-nota{font-size:12px;color:#9aa6bd}
.ppt-banner{margin:8px 0 4px;padding:8px 10px;border-radius:10px;font-weight:800;font-size:18px;background:#242b3f;border:1px solid #39435c}
.ppt-banner.bien{background:rgba(78,201,138,.16);border-color:#4ec98a;color:#8ff0bd}
.ppt-banner.mal{background:#3b1820;border-color:#d95a6e;color:#ff9aa9}
.ppt-banner.empate{background:rgba(45,108,223,.16);border-color:#2d6cdf;color:#a9c6ff}
.ppt-banner.chico{font-size:13px;font-weight:600;padding:5px 8px}
.ppt-pie{display:flex;justify-content:center;gap:8px;margin-top:10px}
.ppt-btn{background:#2d6cdf;color:#fff;border:0;border-radius:8px;padding:7px 16px;cursor:pointer;font-size:13px;font-weight:600}
.ppt-btn.sec{background:transparent;border:1px solid #39435c;color:#c9d2e3;font-weight:500}
.ppt-lbl{display:block;font-size:13px;margin:8px 0 4px;color:#c9d2e3}
.ppt-lbl span{color:#9aa6bd}
.ppt-lbl input{display:block;width:100%;box-sizing:border-box;margin-top:4px;background:#242b3f;border:1px solid #39435c;color:#e8ecf4;border-radius:8px;padding:7px 9px;font-size:13px}
.ppt-lista{display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto}
.ppt-rival{text-align:left;background:#242b3f;border:1px solid #39435c;color:#e8ecf4;border-radius:9px;padding:9px 11px;cursor:pointer;font-size:14px}
.ppt-rival:hover{border-color:#2d6cdf}
.ppt-gm{font-size:10px;font-weight:700;letter-spacing:.06em;color:#ffd25a;border:1px solid #ffd25a;border-radius:6px;padding:0 5px;margin-left:6px}
#ppt-chip{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:99650;background:#1b2030;color:#e8ecf4;border:1px solid #39435c;border-radius:999px;padding:8px 16px;font-size:13px;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);font-family:Inter,system-ui,sans-serif}
#ppt-chip.late{border-color:#ffd25a;animation:ppt-late 1.4s ease-in-out infinite}
@keyframes ppt-late{0%,100%{box-shadow:0 0 0 0 rgba(255,210,90,.5)}50%{box-shadow:0 0 0 8px rgba(255,210,90,0)}}`;
    document.head.appendChild(s);
  }

  return {JUGADAS, resultado, ladoDe, ref, docNuevo, elegir, rendirse, retar, iniciar, mostrar, juega};
})();
