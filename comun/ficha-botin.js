/* =========================================================
   FICHA-BOTIN — el botín del combate visto por un jugador («⚔ Batalla terminada»), para cualquier pantalla (2026-10-02, hoja de ruta
   A5 de docs/pendientes.md: el mapa lo muestra él mismo, sin abrir la ficha escondida)
   Lo que antes vivía en la ficha (js/08: botinLootEscuchar, botinTextoItem, botinLootCuerpo, botinTomar), copiado tal cual y con el
   personaje (`S`) como parámetro. Los datos son de la partida: `campanas/<id>/combate/actual` ({numero, estado: 'publicado' |
   'cerrado', jugadores: [{fichaId, nombre, estado, xp, dde}]}) y `campanas/<id>/botin` (un doc por ítem: {nombre, json, despojos,
   origen, tomadoPor, tomadoNombre, tomadoFicha, disputa}).
   Reclamar y disputar (2026-10-08, pedido del dueño: «que todo el mundo ponga reclamar, que no se lo puedan meter directamente en la
   mochila … al resto le aparece el botón disputar … y se hace un juego de piedra, papel o tijera»): reclamar deja el ítem a tu nombre
   (tomadoPor = quién lo hizo, tomadoFicha = el personaje) sin tocar la mochila; otro puede disputarlo mientras el botín está abierto
   (comun/ppt.js: el que gana queda con el ítem); al cerrar el botín, el GM lo manda a la mochila de quien lo tiene (comun/combate-fin.js →
   la recompensa `items`, comun/recibidos.js).
   - loot(snap): la lista del botín, a partir de un snapshot de `botin` → [{docId, nombre, item, despojos, origen, tomadoPor, tomadoNombre,
     tomadoFicha, disputa}] (lo que se tomó a la vieja, sin tomadoFicha, ya está en una mochila: no aparece).
   - textoItem(item): el resumen de un ítem (para el globo al pasar el mouse).
   - html(S, {combate, loot, puede, fichaId}): el cuerpo de la ventana (lo que recibe cada jugador y los despojos para tomar).
   - tomar(S, entrada, ui): «🙋 Reclamar» — con una transacción (el primero lo reclama); avisa si la mochila no da, y lo anuncia en la
     Mesa. ui = {toast, puede(), fichaId}.
   - disputar(S, entrada, ui): «⚔ Disputar» lo que reclamó otro: crea el piedra, papel o tijera y lo anota en el ítem (`disputa`).
   - soltar(S, entrada, ui): devolver lo que reclamaste (sin disputa) para que lo tome otro.
   Necesita comun/ficha-equipo.js (categorías, mochila, comparar), ficha-combate.js y las globals de sesion.js (Firebase).
   ========================================================= */
const FichaBotin = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const E = () => FichaEquipo;

  function loot(snap){
    const out = [];
    snap.docs.forEach(d => {
      const x = d.data();
      if(x.tomadoPor && !x.tomadoFicha) return;   // tomado a la vieja: ya está en una mochila
      let item = null;
      try{ item = JSON.parse(x.json || 'null'); }catch(e){}
      if(!item) return;
      item.id = 'botin-' + d.id;
      out.push({docId: d.id, nombre: x.nombre || item.nombre, item, despojos: num(x.despojos), origen: x.origen || '',
        tomadoPor: x.tomadoPor || '', tomadoNombre: x.tomadoNombre || '', tomadoFicha: x.tomadoFicha || '', disputa: x.disputa || ''});
    });
    return out;
  }
  const publicado = combate => !!(combate && combate.estado === 'publicado');

  function textoItem(item){
    const partes = [];
    if(item.tier && E().veCalidad()) partes.push(item.tier);   // la calidad, solo el GM
    if(E().CATEGORIA_LABEL[item.tipoItem]) partes.push(E().CATEGORIA_LABEL[item.tipoItem]);
    const dano = FichaCombate.esArma(item.tipoItem) ? FichaCombate.armaDanoTxt(item) : '';
    if(dano) partes.push('Daño ' + dano);
    const st = E().statsComparables(item);
    Object.keys(st).forEach(k => { if(k !== 'danoprom') partes.push(`${E().STAT_COMPARABLE_LABEL[k] || FichaCalculo.STAT_LABEL[k] || k} ${st[k] > 0 ? '+' : ''}${fmt(st[k])}`); });
    (item.efectosGolpe || []).forEach(e => { if(e && e.nombre) partes.push('Al golpear: ' + e.nombre); });
    partes.push(`Peso ${fmt(num(item.peso))}`);
    if(item.detalle) partes.push(item.detalle);
    return partes.join(' · ');
  }

  function html(S, o){
    const combate = o.combate, lista = o.loot || [];
    const cap = E().capMochila(S), usado = E().mochilaUsada(S);
    const libres = cap > 0 ? Math.max(0, cap - usado) : null;
    const puede = !!o.puede && publicado(combate);
    const yo = o.fichaId, miUid = (typeof fbUsuario !== 'undefined' && fbUsuario) ? fbUsuario.uid : '';
    const reclamado = lista.filter(b => b.tomadoPor && b.tomadoFicha === yo).reduce((a, b) => a + E().ranuras(b.item), 0);
    const js = (combate && Array.isArray(combate.jugadores)) ? combate.jugadores : [];
    const recompensas = js.length ? `<div style="margin-bottom:14px">
      <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Lo que recibe cada jugador</div>
      <div style="display:flex;flex-direction:column;gap:4px">${js.map(j => `<div style="display:flex;gap:10px;align-items:center;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,${j.fichaId === yo ? '.10' : '.04'});${j.fichaId === yo ? 'outline:1px solid var(--copper, #B87333)' : ''}">
        <b style="flex:1">${esc(j.nombre)}${j.fichaId === yo ? ' <span class="hint">(vos)</span>' : ''}</b>
        <span class="hint">${esc(j.estado || '')}</span>
        <span style="min-width:90px;text-align:right"><b>+${fmt(num(j.xp))}</b> XP</span>
        <span style="min-width:90px;text-align:right"><b>+${fmt(num(j.dde))}</b> DDE</span></div>`).join('')}</div>
      <div class="hint" style="margin-top:4px">${publicado(combate) ? 'La experiencia, el oro y lo que reclamaste se cargan en las fichas cuando el GM cierra el botín, después de que todos elijan.' : 'La experiencia y el oro ya se cargaron en las fichas.'}</div></div>` : '';
    const cerrado = combate && combate.estado === 'cerrado' && lista.length === 0
      ? '<div class="hint" style="margin-bottom:8px">El botín ya está cerrado: lo que nadie tomó se convirtió en despojos.</div>' : '';
    return `
    ${recompensas}${cerrado}
    <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Botín: reclamá lo que querés</div>
    <div class="hint" style="margin-bottom:8px">Lo que reclamás queda a tu nombre y llega a tu mochila cuando el GM cierra el botín. Si otro también lo quiere, te lo puede disputar: ✊ piedra, papel o tijera, y el que gana se lo lleva.</div>
    <div class="hint" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
      <span>Mochila: <b>${fmt(usado)}${cap > 0 ? ' / ' + fmt(cap) : ''}</b> ranuras${libres !== null ? ` · <b>${fmt(libres)}</b> libres` : ''}${reclamado ? ` · reclamaste <b>${fmt(reclamado)}</b>` : ''}</span>
      <button type="button" class="mini" id="botin-loot-mochila">🎒 Abrir mochila</button>
    </div>
    ${puede ? '' : '<div class="hint" style="margin-bottom:8px">Abrí tu personaje (con permiso de edición) para reclamar cosas del botín.</div>'}
    ${lista.length ? lista.map(b => {
      const info = E().slotOcupado(S, b.item);
      const comparar = info && info.equipados.length;
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line, #444)">
        <div style="flex:1;min-width:0" title="${esc(textoItem(b.item))}">
          <div style="font-weight:600">${esc(b.nombre)}${b.item.trofeo ? ' <span class="hint">(trofeo)</span>' : ''}</div>
          <div class="hint">≈ ${fmt(b.despojos)} despojos${b.origen ? ' · de ' + esc(b.origen) : ''}${info && info.ocupado ? ' · slot ocupado' : ''}${quien(b)}</div>
        </div>
        <button type="button" class="mini" data-view="catalogo:${esc(b.item.id)}">Ver</button>
        ${comparar ? `<button type="button" class="mini" data-botin-comparar="${esc(b.item.id)}">Comparar</button>` : ''}
        ${accion(b)}
      </div>`;
    }).join('') : '<div class="hint">No hay nada en el botín.</div>'}`;
    function quien(b){
      if(!b.tomadoPor) return '';
      if(b.tomadoFicha === yo) return ' · <b style="color:var(--good, #4ec98a)">es tuyo</b>';
      return ` · lo reclamó <b>${esc(b.tomadoNombre || '?')}</b>`;
    }
    function accion(b){
      const d = esc(b.docId), off = puede ? '' : ' disabled';
      if(!b.tomadoPor) return `<button type="button" class="btn primary" data-botin-tomar="${d}"${off} title="Queda a tu nombre y llega a tu mochila cuando el GM cierre el botín. Otro te lo puede disputar.">🙋 Reclamar</button>`;
      if(b.disputa){
        const juego = typeof PPT !== 'undefined' && PPT.juega(b.disputa);
        return juego ? `<button type="button" class="btn primary" data-botin-ppt="${esc(b.disputa)}" title="Volver al juego">✊ En disputa: jugar</button>`
          : '<span class="hint" title="Lo están disputando a piedra, papel o tijera">✊ en disputa</span>';
      }
      if(b.tomadoFicha === yo) return `<button type="button" class="mini" data-botin-soltar="${d}"${off} title="Lo devolvés al botín para que lo reclame otro">↩ Soltar</button>`;
      if(b.tomadoPor === miUid) return '<span class="hint">(lo reclamó otro personaje tuyo)</span>';
      return `<button type="button" class="btn" data-botin-disputar="${d}"${off} title="Le disputás ${esc(b.nombre)} a ${esc(b.tomadoNombre || '?')} a piedra, papel o tijera: el que gana se lo lleva">⚔ Disputar</button>`;
    }
  }

  const yoUid = () => fbUsuario.uid;
  const miNombre = S => String(S.meta.nombre || fbMiembro.nombre || '').slice(0, 60);
  const refBotin = id => fbDb.collection(fbRutaCampana('botin')).doc(id);
  const errorTxt = err => err && err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : '';
  function mesa(S, texto){
    return fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String(S.meta.nombre || ''), origen: texto, formula: '',
      rolls: [], mod: 0, total: 0, desde: 'recompensa', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo escribir en la Mesa:', err));
  }

  // 🙋 Reclamar: queda a tu nombre (no va a la mochila hasta que el GM cierre el botín).
  async function tomar(S, b, ui){
    if(!ui.puede()){ ui.toast('Abrí tu personaje para reclamar cosas del botín'); return; }
    if(!b) return;
    let quien = '', ok = false;
    try{
      ok = await fbDb.runTransaction(async tx => {
        const x = await tx.get(refBotin(b.docId));
        if(!x.exists) return false;
        if(x.data().tomadoPor){ quien = x.data().tomadoNombre || '?'; return false; }
        tx.update(x.ref, {tomadoPor: yoUid(), tomadoNombre: miNombre(S), tomadoFicha: String(ui.fichaId || '')});
        return true;
      });
    }catch(err){
      console.error('No se pudo reclamar:', err);
      ui.toast('No se pudo reclamar' + errorTxt(err));
      return;
    }
    if(!ok){ ui.toast(quien ? `${b.nombre} ya lo reclamó ${quien}: podés disputárselo` : `${b.nombre} ya no está`); return; }
    // ¿Va a entrar? (avisa y deja seguir: al llegar se suma igual)
    const cap = E().capMochila(S);
    const llena = cap > 0 && E().mochilaUsada(S) + E().ranuras(b.item) > cap;
    ui.toast(`🙋 ${b.nombre} es tuyo: llega a tu mochila cuando el GM cierre el botín${llena ? ' · ojo: tu mochila no da, hacé lugar' : ''}`);
    mesa(S, `🙋 ${S.meta.nombre || fbMiembro.nombre} reclamó ${b.nombre}`);
  }

  // ⚔ Disputar lo que reclamó otro: el piedra, papel o tijera (comun/ppt.js) se crea en la misma transacción.
  async function disputar(S, b, ui){
    if(!ui.puede()){ ui.toast('Abrí tu personaje para disputar cosas del botín'); return; }
    if(!b) return;
    if(typeof PPT === 'undefined'){ ui.toast('Falta cargar piedra, papel o tijera'); return; }
    let r = null;
    try{
      r = await fbDb.runTransaction(async tx => {
        const x = await tx.get(refBotin(b.docId));
        if(!x.exists) return {error: `${b.nombre} ya no está`};
        const d = x.data();
        if(!d.tomadoPor) return {error: `${b.nombre} está libre: reclamalo`};
        if(d.tomadoPor === yoUid()) return {error: 'Ya es tuyo (o de otro personaje tuyo)'};
        if(!d.tomadoFicha) return {error: `${b.nombre} ya está en la mochila de ${d.tomadoNombre || '?'}`};
        if(d.disputa) return {error: `${b.nombre} ya está en disputa`};
        const ref = PPT.ref();
        tx.set(ref, PPT.docNuevo({a: {uid: d.tomadoPor, nombre: d.tomadoNombre, ficha: d.tomadoFicha}, b: {uid: yoUid(), nombre: miNombre(S), ficha: ui.fichaId},
          motivo: {tipo: 'botin', botinId: b.docId, item: b.nombre}}));
        tx.update(x.ref, {disputa: ref.id});
        return {ok: true, rival: d.tomadoNombre || '?'};
      });
    }catch(err){
      console.error('No se pudo disputar:', err);
      ui.toast('No se pudo disputar' + errorTxt(err));
      return;
    }
    if(r.error){ ui.toast(r.error); return; }
    ui.toast(`⚔ Le disputás ${b.nombre} a ${r.rival}: ¡piedra, papel o tijera!`);
    mesa(S, `⚔ ${S.meta.nombre || fbMiembro.nombre} le disputa ${b.nombre} a ${r.rival}: piedra, papel o tijera`);
  }

  // ↩ Soltar lo que reclamaste (sin disputa): vuelve a quedar libre.
  async function soltar(S, b, ui){
    if(!ui.puede() || !b) return;
    let ok = false;
    try{
      ok = await fbDb.runTransaction(async tx => {
        const x = await tx.get(refBotin(b.docId));
        if(!x.exists || x.data().tomadoPor !== yoUid() || x.data().disputa) return false;
        tx.update(x.ref, {tomadoPor: '', tomadoNombre: '', tomadoFicha: ''});
        return true;
      });
    }catch(err){
      console.error('No se pudo soltar:', err);
      ui.toast('No se pudo soltar' + errorTxt(err));
      return;
    }
    if(!ok){ ui.toast('No se puede soltar (¿está en disputa?)'); return; }
    ui.toast(`↩ ${b.nombre} volvió al botín`);
    mesa(S, `↩ ${S.meta.nombre || fbMiembro.nombre} soltó ${b.nombre}`);
  }

  return {loot, publicado, textoItem, html, tomar, disputar, soltar};
})();
