/* =========================================================
   PAUSA DE LA PARTIDA (2026-10-10, pedido del dueño)
   El GM pausa la partida al terminar una sesión. Hasta la próxima, los jugadores pueden entrar y tocar su ficha (equipo,
   mochila, compras, stats…), pero el mapa queda congelado: se ve, no se toca. Todo lo importante que cambian en sus fichas
   durante la pausa queda en un registro; al reanudar, el GM lo ve y elige borrarlo o guardarlo.

   Datos: `campanas/<id>/ajustes/pausa` = {pausada, desde, gmNombre, actualizado} (lo escribe el GM) y
   `campanas/<id>/pausaLog/<id>` = {quien, jugador, personaje, texto, cuando} (lo escribe cada jugador; lo lee y borra el GM).
   Reglas nuevas de Firestore (hay que pegarlas).

   - `Pausa.iniciar({donde: 'mapa'|'ficha'|'gm'})`: escucha la pausa y muestra el cartel (en el mapa, a un jugador, además la capa
     que no deja tocar). Adentro de un marco no hace nada.
   - `Pausa.boton(el)`: un botón del GM que pausa / reanuda (el texto cambia solo).
   - `Pausa.alGuardar(cambios, personaje)`: lo llama `FichaSesion.guardar` después de guardar; `cambios` = [[parte, jsonViejo, jsonNuevo]].
     Si la partida está en pausa y quien guarda no es el GM, anota en el registro lo importante que cambió (`diferencias`).
   - `Pausa.diferencias(parte, viejo, nuevo)`: las líneas en palabras (DDE, nivel, atributos, mochila, equipo, cinturón,
     habilidades, pasivas, talentos). Lo chico (vida, No2, notas, imagen) no se anota.
   ========================================================= */
const Pausa = (() => {
  let doc = null, escuchando = false, donde = '';
  const botones = new Set();
  const n = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[ch]));
  const ref = () => fbDb.doc(fbRutaCampana('ajustes/pausa'));
  const colLog = () => fbDb.collection(fbRutaCampana('pausaLog'));
  const esGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm === true);
  const ts = () => firebase.firestore.FieldValue.serverTimestamp();
  const activa = () => !!(doc && doc.pausada);
  const ATTR = {con: 'Constitución', fue: 'Fuerza', agl: 'Agilidad', des: 'Destreza', esp: 'Especial'};

  /* ---------- Las diferencias, en palabras ---------- */
  const parse = j => { try{ return j ? JSON.parse(j) : {}; }catch(e){ return {}; } };
  const cant = it => n(it.cantidad ?? it.unidades ?? 1) || 1;
  const nombreItem = it => String((it && it.nombre) || 'algo');
  function listaItems(viejos, nuevos, donde){
    const L = [];
    const mapa = a => new Map((Array.isArray(a) ? a : []).filter(x => x && x.id !== undefined).map(x => [String(x.id), x]));
    const A = mapa(viejos), B = mapa(nuevos);
    B.forEach((it, id) => {
      const antes = A.get(id);
      if(!antes){ L.push(`sumó ${cant(it) > 1 ? cant(it) + ' × ' : ''}${nombreItem(it)}${donde}`); return; }
      if(!!antes.equipado !== !!it.equipado) L.push(`${it.equipado ? 'se equipó' : 'se sacó'} ${nombreItem(it)}`);
      if(cant(antes) !== cant(it)) L.push(`${nombreItem(it)}${donde}: ${cant(antes)} → ${cant(it)}`);
    });
    A.forEach((it, id) => { if(!B.has(id)) L.push(`ya no tiene ${cant(it) > 1 ? cant(it) + ' × ' : ''}${nombreItem(it)}${donde}`); });
    return L;
  }
  function listaNombres(viejos, nuevos, que){
    const nom = a => (Array.isArray(a) ? a : []).map(x => String((x && x.nombre) || '')).filter(Boolean);
    const A = nom(viejos), B = nom(nuevos), L = [];
    B.filter(x => !A.includes(x)).forEach(x => L.push(`sumó ${que} ${x}`));
    A.filter(x => !B.includes(x)).forEach(x => L.push(`sacó ${que} ${x}`));
    return L;
  }
  function diferencias(parte, viejo, nuevo){
    const a = parse(viejo), b = parse(nuevo), L = [];
    if(parte === 'general'){
      const ma = a.meta || {}, mb = b.meta || {};
      if(n(ma.dde) !== n(mb.dde)) L.push(`DDE ${n(ma.dde)} → ${n(mb.dde)}`);
      if(n(ma.nivel) !== n(mb.nivel)) L.push(`nivel ${n(ma.nivel)} → ${n(mb.nivel)}`);
      if(n(ma.exp) !== n(mb.exp)) L.push(`experiencia ${n(ma.exp)} → ${n(mb.exp)}`);
      if(ma.nombre && mb.nombre && ma.nombre !== mb.nombre) L.push(`se cambió el nombre: ${ma.nombre} → ${mb.nombre}`);
      Object.keys(ATTR).forEach(k => { const x = n((a.attrs || {})[k]), y = n((b.attrs || {})[k]); if(x !== y) L.push(`${ATTR[k]} ${x} → ${y}`); });
    }
    if(parte === 'inventario') L.push(...listaItems(a.inventario, b.inventario, ''));
    if(parte === 'cinturon') L.push(...listaItems(a.cinturon, b.cinturon, ' (cinturón)'));
    if(parte === 'habilidades'){
      L.push(...listaNombres(a.habilidades, b.habilidades, 'la habilidad'));
      L.push(...listaNombres(a.pasivas, b.pasivas, 'la pasiva'));
      L.push(...listaNombres(a.sociales, b.sociales, 'el talento'));
    }
    return L;
  }

  /* ---------- El registro ---------- */
  async function alGuardar(cambios, personaje){
    if(!activa() || esGM() || !Array.isArray(cambios) || !cambios.length) return;
    const lineas = cambios.flatMap(([parte, viejo, nuevo]) => viejo === undefined ? [] : diferencias(parte, viejo, nuevo)).slice(0, 20);
    if(!lineas.length) return;
    try{
      const batch = fbDb.batch();
      lineas.forEach(texto => batch.set(colLog().doc(), {quien: fbUsuario.uid, jugador: String((fbMiembro && fbMiembro.nombre) || '').slice(0, 40),
        personaje: String(personaje || '').slice(0, 60), texto: String(texto).slice(0, 300), cuando: ts()}));
      await batch.commit();
    }catch(err){ console.error('No se pudo anotar en el registro de la pausa:', err); }
  }

  /* ---------- Pausar y reanudar (el GM) ---------- */
  async function pausar(){
    if(!await Confirmar.preguntar('Los jugadores van a poder entrar y tocar su ficha, pero el mapa queda congelado hasta que la reanudes. Lo que cambien queda en un registro.',
      {titulo: '⏸ Pausar la partida', icono: '⏸', si: 'Pausar'})) return;
    try{ await ref().set({pausada: true, desde: ts(), gmNombre: String((fbMiembro && fbMiembro.nombre) || 'GM').slice(0, 40), actualizado: ts()}); }
    catch(err){ console.error(err); alertar(err); }
  }
  function alertar(err){
    const msg = err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (la pausa)' : 'No se pudo: ' + String((err && err.message) || err).slice(0, 120);
    if(typeof toast === 'function') toast(msg); else alert(msg);
  }
  async function reanudar(){
    let docs = [];
    try{ docs = (await colLog().orderBy('cuando').get()).docs; }
    catch(err){ console.error('No se pudo leer el registro de la pausa:', err); }
    const ok = await mostrarRegistro(docs);
    if(ok === null) return;   // cerró sin decidir: sigue en pausa
    try{
      if(ok === 'borrar' && docs.length){
        for(let i = 0; i < docs.length; i += 400){ const b = fbDb.batch(); docs.slice(i, i + 400).forEach(d => b.delete(d.ref)); await b.commit(); }
      }
      await ref().set({pausada: false, desde: (doc && doc.desde) || null, gmNombre: String((fbMiembro && fbMiembro.nombre) || 'GM').slice(0, 40), actualizado: ts()});
    }catch(err){ console.error(err); alertar(err); }
  }
  // La ventana con lo que pasó durante la pausa: 'borrar' | 'guardar' | null (cerrada sin decidir).
  function mostrarRegistro(docs){
    return new Promise(res => {
      inyectarCss();
      const fondo = document.createElement('div');
      fondo.className = 'pausa-fondo';
      const filas = docs.map(d => d.data()).map(x => {
        const f = x.cuando && x.cuando.toDate ? x.cuando.toDate() : null;
        const hora = f ? f.toLocaleString('es-AR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) : '';
        return `<li><span class="pausa-hora">${esc(hora)}</span> <b>${esc(x.personaje || '?')}</b>${x.jugador ? ` <span class="pausa-jug">(${esc(x.jugador)})</span>` : ''}: ${esc(x.texto)}</li>`;
      }).join('');
      fondo.innerHTML = `<div class="pausa-caja" role="dialog" aria-modal="true">
        <div class="pausa-cab">▶ Reanudar la partida <button type="button" class="pausa-x" data-p="cerrar" title="Cerrar sin reanudar">✕</button></div>
        <div class="pausa-cuerpo">${docs.length ? `<p>Esto hicieron los jugadores mientras la partida estaba en pausa:</p><ul class="pausa-lista">${filas}</ul>`
          : '<p>Nadie cambió nada importante durante la pausa.</p>'}</div>
        <div class="pausa-pie">${docs.length ? '<button type="button" class="pausa-btn sec" data-p="guardar">Guardar el registro y reanudar</button><button type="button" class="pausa-btn" data-p="borrar">Borrar el registro y reanudar</button>'
          : '<button type="button" class="pausa-btn" data-p="guardar">Reanudar</button>'}</div></div>`;
      document.body.appendChild(fondo);
      const fin = v => { fondo.remove(); res(v); };
      fondo.addEventListener('click', e => { const b = e.target.closest('[data-p]'); if(b) fin(b.dataset.p === 'cerrar' ? null : b.dataset.p); else if(e.target === fondo) fin(null); });
    });
  }

  /* ---------- Lo que se ve ---------- */
  function inyectarCss(){
    if(document.getElementById('pausa-css')) return;
    const st = document.createElement('style');
    st.id = 'pausa-css';
    st.textContent = `
      .pausa-cartel{position:fixed;top:54px;left:50%;transform:translateX(-50%);z-index:100015;background:#2a2410;border:1px solid #c9a227;color:#f3e2a0;
        padding:7px 16px;border-radius:8px;font:600 13px/1.35 system-ui,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.45);text-align:center;max-width:min(560px,92vw)}
      .pausa-cartel small{display:block;font-weight:400;opacity:.85}
      .pausa-capa{position:absolute;inset:0;z-index:90;background:rgba(10,10,14,.28);cursor:not-allowed}
      .pausa-fondo{position:fixed;inset:0;z-index:100030;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px}
      .pausa-caja{background:#171b26;color:#e6e9f2;border:1px solid #39435c;border-radius:12px;width:min(640px,100%);max-height:86vh;display:flex;flex-direction:column;
        font:14px/1.45 system-ui,sans-serif;box-shadow:0 10px 40px rgba(0,0,0,.6)}
      .pausa-cab{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #39435c;font-weight:700;font-size:16px}
      .pausa-x{background:none;border:0;color:#aab;font-size:16px;cursor:pointer}
      .pausa-cuerpo{padding:12px 16px;overflow:auto}
      .pausa-lista{margin:6px 0 0;padding-left:18px}
      .pausa-lista li{margin:3px 0}
      .pausa-hora,.pausa-jug{color:#8f98ad;font-size:12px}
      .pausa-pie{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #39435c;flex-wrap:wrap}
      .pausa-btn{background:#2d6cdf;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-weight:600;cursor:pointer}
      .pausa-btn.sec{background:#2a3042;border:1px solid #39435c}`;
    document.head.appendChild(st);
  }
  function dibujar(){
    inyectarCss();
    let c = document.getElementById('pausa-cartel');
    if(activa()){
      if(!c){ c = document.createElement('div'); c.id = 'pausa-cartel'; c.className = 'pausa-cartel'; document.body.appendChild(c); }
      c.innerHTML = esGM() ? '⏸ La partida está en pausa<small>Los jugadores pueden tocar su ficha, pero no el mapa. Reanudala con «▶ Reanudar partida».</small>'
        : `⏸ Partida en pausa hasta la próxima sesión<small>${donde === 'mapa' ? 'El mapa se ve, pero no se puede tocar. ' : ''}Podés tocar tu ficha: lo que cambies le queda anotado al GM.</small>`;
    }else if(c) c.remove();
    // El mapa de un jugador: una capa encima del lienzo que no deja tocar nada.
    if(donde === 'mapa' && !esGM()){
      const caja = document.getElementById('lienzo-caja');
      let capa = document.getElementById('pausa-capa');
      if(activa() && caja && !capa){
        capa = document.createElement('div'); capa.id = 'pausa-capa'; capa.className = 'pausa-capa'; capa.title = 'La partida está en pausa'; caja.appendChild(capa);
        if(typeof cerrarBotonera === 'function') try{ cerrarBotonera(); }catch(e){}   // si tenía la Botonera abierta, se cierra
      }
      if(!activa() && capa) capa.remove();
    }
    botones.forEach(b => {
      b.textContent = activa() ? '▶ Reanudar partida' : '⏸ Pausar partida';
      b.title = activa() ? 'Ver lo que hicieron los jugadores durante la pausa y reanudar' : 'Al terminar la sesión: los jugadores pueden tocar su ficha, pero no el mapa';
    });
  }
  // Las teclas del mapa (B, mover, girar…) no andan en pausa para un jugador (Escape sí).
  function bloquearTeclas(e){
    if(donde !== 'mapa' || esGM() || !activa() || e.key === 'Escape') return;
    const t = e.target;
    if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    e.stopImmediatePropagation();
  }

  function iniciar(o){
    if(window.parent !== window || escuchando || typeof fbDb === 'undefined' || !fbDb) return;
    donde = (o && o.donde) || '';
    escuchando = true;
    window.addEventListener('keydown', bloquearTeclas, true);
    ref().onSnapshot(s => { doc = s.exists ? s.data() : null; dibujar(); }, err => console.error('No se pudo escuchar la pausa de la partida:', err));
  }
  function boton(el){
    if(!el) return;
    botones.add(el);
    el.onclick = () => activa() ? reanudar() : pausar();
    dibujar();
  }

  return {iniciar, boton, activa, alGuardar, diferencias, pausar, reanudar};
})();
