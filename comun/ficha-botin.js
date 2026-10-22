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

  /* 🗂 Tres grupos y pilas (2026-10-22, dueño: «mano, cuerpo y consumibles… y si hay ítems repetidos, que aparezcan enlistados: chaleco de
     cuero ×N, y que uno pueda reclamar uno, dos, tres, lo que quiera»). Mano = lo que va en la mano (armas, escudos, varitas, orbes);
     Cuerpo = lo demás que se equipa; Consumibles; y aparte los trofeos. Una pila junta los ítems iguales (mismo tipo, nombre, calidad y
     números); cada ítem sigue siendo su propio documento del botín: reclamar N reclama N de los libres. */
  const GRUPOS = [{id: 'mano', titulo: '🗡 Mano', nota: 'armas, escudos, varitas y orbes'}, {id: 'cuerpo', titulo: '🛡 Cuerpo', nota: 'lo que se equipa'},
    {id: 'consumibles', titulo: '🧪 Consumibles', nota: ''}, {id: 'trofeos', titulo: '🏆 Trofeos', nota: 'se venden o se guardan'}];
  function grupoDe(item){
    if(!item) return 'trofeos';
    if(item.trofeo) return 'trofeos';
    if(item.consumible || item.tipoItem === 'consumibles') return 'consumibles';
    const slot = FichaCalculo.slotDe(item.tipoItem);
    return slot === 'mano' || slot === 'escudo' ? 'mano' : 'cuerpo';
  }
  const claveDe = b => [b.item.tipoItem || '', b.nombre || '', b.item.tier || '', JSON.stringify(E().statsComparables(b.item)), (b.item.efectosGolpe || []).map(e => e && e.nombre).join(','), !!b.item.trofeo].join('|');
  function pilas(lista, yo, miUid){
    const por = new Map();
    (lista || []).forEach(b => {
      const k = claveDe(b);
      if(!por.has(k)) por.set(k, {clave: k, grupo: grupoDe(b.item), nombre: b.nombre, item: b.item, despojos: b.despojos, entradas: [], libres: [], mias: [], otros: new Map(), disputas: [], origenes: new Set()});
      const p = por.get(k);
      p.entradas.push(b);
      if(b.origen) p.origenes.add(b.origen);
      if(b.disputa) p.disputas.push(b);
      else if(!b.tomadoPor) p.libres.push(b);
      else if(b.tomadoFicha === yo) p.mias.push(b);
      else{ const n = b.tomadoPor === miUid ? '(otro personaje tuyo)' : (b.tomadoNombre || '?'); if(!p.otros.has(n)) p.otros.set(n, []); p.otros.get(n).push(b); }
    });
    return [...por.values()];
  }

  function html(S, o){
    const combate = o.combate, lista = o.loot || [];
    const cap = E().capMochila(S), usado = E().mochilaUsada(S);
    const libres = cap > 0 ? Math.max(0, cap - usado) : null;
    const puede = !!o.puede && publicado(combate);
    const yo = o.fichaId, miUid = (typeof fbUsuario !== 'undefined' && fbUsuario) ? fbUsuario.uid : '';
    const reclamado = lista.filter(b => b.tomadoPor && b.tomadoFicha === yo).reduce((a, b) => a + E().ranuras(b.item), 0);
    const js = (combate && Array.isArray(combate.jugadores)) ? combate.jugadores : [];
    // Lo tuyo, grande y destacado, cada valor en su recuadro (dueño, 2026-10-22); el resto de la mesa, chico abajo.
    const mio = js.find(j => j.fichaId === yo), otros = js.filter(j => j.fichaId !== yo);
    const caja = (num_, etq, nota) => `<div style="flex:1;min-width:120px;padding:12px 14px;border-radius:10px;background:rgba(184,115,51,.14);border:1px solid var(--copper, #B87333);text-align:center">
        <div style="font-size:30px;font-weight:800;line-height:1.1;color:var(--paper, #EDE3D6)">+${num_}</div><div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--copper, #B87333);margin-top:2px">${etq}</div>${nota ? `<div class="hint" style="margin-top:2px">${nota}</div>` : ''}</div>`;
    const recompensas = js.length ? `<div style="margin-bottom:14px">
      ${mio ? `<div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Lo que recibís · ${esc(mio.nombre)} <span class="hint">(vos)</span> · ${esc(mio.estado || '')}</div>
      <div style="display:flex;gap:10px;margin-bottom:8px">${caja(fmt(num(mio.xp)), 'XP · experiencia', '')}${caja(fmt(num(mio.dde)), 'DDE · doblones', '')}</div>` : ''}
      ${otros.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px 14px">${otros.map(j => `<span class="hint"><b>${esc(j.nombre)}</b> · ${esc(j.estado || '')} · +${fmt(num(j.xp))} XP · +${fmt(num(j.dde))} DDE</span>`).join('')}</div>` : ''}
      <div class="hint" style="margin-top:4px">${publicado(combate) ? 'La experiencia, el oro y lo que reclamaste se cargan en las fichas cuando el GM cierra el botín, después de que todos elijan.' : 'La experiencia y el oro ya se cargaron en las fichas.'}</div></div>` : '';
    const cerrado = combate && combate.estado === 'cerrado' && lista.length === 0
      ? '<div class="hint" style="margin-bottom:8px">El botín ya está cerrado: lo que nadie tomó se convirtió en despojos.</div>' : '';
    const todas = pilas(lista, yo, miUid);
    const grupos = GRUPOS.map(g => ({...g, pilas: todas.filter(p => p.grupo === g.id)})).filter(g => g.pilas.length);
    return `
    ${recompensas}${cerrado}
    <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Botín: reclamá lo que querés</div>
    <div class="hint" style="margin-bottom:8px">Lo que reclamás queda a tu nombre y llega a tu mochila cuando el GM cierra el botín. Si otro también lo quiere, te lo puede disputar: ✊ piedra, papel o tijera, y el que gana se lo lleva. Lo repetido va en una pila: elegí cuántos reclamás.</div>
    <div class="hint" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
      <span>Mochila: <b>${fmt(usado)}${cap > 0 ? ' / ' + fmt(cap) : ''}</b> ranuras${libres !== null ? ` · <b>${fmt(libres)}</b> libres` : ''}${reclamado ? ` · reclamaste <b>${fmt(reclamado)}</b>` : ''}</span>
      <button type="button" class="btn" id="botin-loot-mochila" style="border:1px solid var(--copper, #B87333);color:var(--paper, #EDE3D6);background:rgba(184,115,51,.18);font-weight:700;padding:8px 14px">🎒 Mochila y equipo</button>
    </div>
    ${puede ? '' : '<div class="hint" style="margin-bottom:8px">Abrí tu personaje (con permiso de edición) para reclamar cosas del botín.</div>'}
    ${grupos.length ? grupos.map(g => `<div style="margin:16px 0 4px;padding:6px 10px;border-radius:8px;background:rgba(184,115,51,.16);border-left:4px solid var(--copper, #B87333);display:flex;align-items:baseline;gap:10px"><b style="font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:var(--paper, #EDE3D6)">${g.titulo}</b><span class="hint">${esc(g.nota)}${g.nota ? ' · ' : ''}${g.pilas.reduce((a, p) => a + p.entradas.length, 0)} ${g.pilas.reduce((a, p) => a + p.entradas.length, 0) === 1 ? 'ítem' : 'ítems'}</span></div>
      ${g.pilas.map(p => fila(p)).join('')}`).join('') : '<div class="hint">No hay nada en el botín.</div>'}`;
    function fila(p){
      const n = p.entradas.length, info = E().slotOcupado(S, p.item);
      const comparar = info && (info.ocupado || info.equipados.length);   // con el slot ocupado, siempre se puede comparar (dueño, 2026-10-22)
      const origenes = [...p.origenes];
      const estado = [];
      if(n > 1 || p.mias.length || p.otros.size || p.disputas.length){
        if(p.libres.length) estado.push(`<b>${p.libres.length}</b> libre${p.libres.length === 1 ? '' : 's'}`);
        if(p.mias.length) estado.push(`<b style="color:var(--good, #4ec98a)">${p.mias.length === 1 && n === 1 ? 'es tuyo' : p.mias.length + ' tuyo' + (p.mias.length === 1 ? '' : 's')}</b>`);
        p.otros.forEach((lst, nom) => estado.push(`${esc(nom)} <b>${lst.length}</b>`));
        if(p.disputas.length) estado.push(`✊ ${p.disputas.length} en disputa`);
      }
      // El nombre con globo al pasar el mouse (el del glosario, con el texto del ítem: comun/glosario.js, data-glo-txt), y «slot ocupado» en rojo (dueño, 2026-10-22).
      const globo = textoItem(p.item).split(' · ').join('\n');
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line, #444)">
        <div style="flex:1;min-width:0">
          <div style="font-weight:600"><span class="glo" tabindex="0" data-glo-txt="${esc(globo)}">${esc(p.nombre)}</span>${n > 1 ? ` <span style="color:var(--copper, #B87333)">×${n}</span>` : ''}${p.item.trofeo ? ' <span class="hint">(trofeo)</span>' : ''}</div>
          <div class="hint">≈ ${fmt(p.despojos)} despojos${n > 1 ? ' c/u' : ''}${origenes.length ? ' · de ' + esc(origenes.slice(0, 3).join(', ')) + (origenes.length > 3 ? '…' : '') : ''}${info && info.ocupado ? ' · <b style="color:var(--bad, #E05A5A)">slot ocupado</b>' : ''}${estado.length ? ' · ' + estado.join(' · ') : ''}</div>
        </div>
        <button type="button" class="mini" data-view="catalogo:${esc(p.item.id)}">Ver</button>
        ${comparar ? `<button type="button" class="btn" data-botin-comparar="${esc(p.item.id)}" style="border:1px solid var(--copper, #B87333);color:var(--copper, #B87333);background:rgba(184,115,51,.10);font-weight:700" title="Lo comparás con lo que tenés puesto en ese lugar">⚖ Comparar</button>` : ''}
        ${acciones(p)}
      </div>`;
    }
    function acciones(p){
      const off = puede ? '' : ' disabled', partes = [];
      // ✊ una disputa en la que juego: volver al juego
      const juego = p.disputas.find(b => typeof PPT !== 'undefined' && PPT.juega(b.disputa));
      if(juego) partes.push(`<button type="button" class="btn primary" data-botin-ppt="${esc(juego.disputa)}" title="Volver al juego">✊ En disputa: jugar</button>`);
      // 🙋 reclamar N de los libres
      if(p.libres.length){
        const ids = p.libres.map(b => b.docId).join(',');
        const cant = p.libres.length > 1 ? `<input type="number" class="mini" min="1" max="${p.libres.length}" value="1" data-botin-cant="${esc(p.clave)}" title="Cuántos reclamás (hay ${p.libres.length} libres)" style="width:52px;padding:4px 6px;text-align:center"${off}>` : '';
        partes.push(`<span style="display:inline-flex;align-items:center;gap:4px">${cant}<button type="button" class="btn primary" data-botin-tomar="${esc(ids)}" data-botin-cant-de="${esc(p.clave)}"${off} title="Queda a tu nombre y llega a tu mochila cuando el GM cierre el botín. Otro te lo puede disputar."><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:rgba(15,12,14,.8);margin-right:6px;font-size:14px;vertical-align:middle">🙋</span>Reclamar</button></span>`);
      }
      // ↩ soltar uno de los míos
      if(p.mias.length) partes.push(`<button type="button" class="mini" data-botin-soltar="${esc(p.mias[0].docId)}"${off} title="Devolvés ${p.mias.length > 1 ? 'uno' : 'esto'} al botín para que lo reclame otro">↩ Soltar${p.mias.length > 1 ? ' 1' : ''}</button>`);
      // ⚔ disputar uno de los de otro (no de otro personaje mío)
      const ajeno = [...p.otros.entries()].find(([nom]) => nom !== '(otro personaje tuyo)');
      if(ajeno && !p.libres.length) partes.push(`<button type="button" class="btn" data-botin-disputar="${esc(ajeno[1][0].docId)}"${off} title="Le disputás ${esc(p.nombre)} a ${esc(ajeno[0])} a piedra, papel o tijera: el que gana se lo lleva">⚔ Disputar</button>`);
      if(!partes.length && p.disputas.length) partes.push('<span class="hint" title="Lo están disputando a piedra, papel o tijera">✊ en disputa</span>');
      return partes.join('');
    }
  }
  // Los ítems que pide un botón «Reclamar»: su lista de documentos (`data-botin-tomar`) cortada a la cantidad elegida (`data-botin-cant`).
  function idsDeBoton(btn, raiz){
    const ids = String(btn.dataset.botinTomar || '').split(',').filter(Boolean);
    const k = btn.dataset.botinCantDe;
    let n = 1;
    if(k){ const inp = (raiz || document).querySelector(`[data-botin-cant="${(window.CSS && CSS.escape) ? CSS.escape(k) : k}"]`); if(inp) n = Math.max(1, Math.min(ids.length, Math.round(num(inp.value)) || 1)); }
    return ids.slice(0, n);
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

  // 🙋 Reclamar: queda a tu nombre (no va a la mochila hasta que el GM cierre el botín). Uno, o varios de una pila (2026-10-22).
  async function tomarUno(S, b, ui){
    let quien = '', ok = false;
    try{
      ok = await fbDb.runTransaction(async tx => {
        const x = await tx.get(refBotin(b.docId));
        if(!x.exists) return false;
        if(x.data().tomadoPor){ quien = x.data().tomadoNombre || '?'; return false; }
        tx.update(x.ref, {tomadoPor: yoUid(), tomadoNombre: miNombre(S), tomadoFicha: String(ui.fichaId || '')});
        return true;
      });
    }catch(err){ console.error('No se pudo reclamar:', err); return {error: 'No se pudo reclamar' + errorTxt(err)}; }
    return ok ? {ok: true} : {quien};
  }
  async function tomarVarios(S, lista, ui){
    if(!ui.puede()){ ui.toast('Abrí tu personaje para reclamar cosas del botín'); return; }
    lista = (lista || []).filter(Boolean);
    if(!lista.length) return;
    let hechos = 0, quien = '';
    for(const b of lista){
      const r = await tomarUno(S, b, ui);
      if(r.error){ ui.toast(r.error); break; }
      if(r.ok) hechos++; else if(r.quien) quien = r.quien;
    }
    const b = lista[0], nombre = b.nombre;
    if(!hechos){ ui.toast(quien ? `${nombre} ya lo reclamó ${quien}: podés disputárselo` : `${nombre} ya no está`); return; }
    // ¿Va a entrar? (avisa y deja seguir: al llegar se suma igual)
    const cap = E().capMochila(S);
    const llena = cap > 0 && E().mochilaUsada(S) + E().ranuras(b.item) * hechos > cap;
    const que = hechos > 1 ? `${hechos} × ${nombre} son tuyos` : `${nombre} es tuyo`;
    ui.toast(`🙋 ${que}: llega${hechos > 1 ? 'n' : ''} a tu mochila cuando el GM cierre el botín${llena ? ' · ojo: tu mochila no da, hacé lugar' : ''}${hechos < lista.length ? ` (${lista.length - hechos} ya no estaban libres)` : ''}`);
    mesa(S, `🙋 ${S.meta.nombre || fbMiembro.nombre} reclamó ${hechos > 1 ? hechos + ' × ' : ''}${nombre}`);
  }
  const tomar = (S, b, ui) => tomarVarios(S, [b], ui);

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

  return {loot, publicado, textoItem, html, tomar, tomarVarios, idsDeBoton, grupoDe, pilas, GRUPOS, disputar, soltar};
})();
