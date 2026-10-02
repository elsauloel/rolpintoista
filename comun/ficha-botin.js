/* =========================================================
   FICHA-BOTIN — el botín del combate visto por un jugador («⚔ Batalla terminada»), para cualquier pantalla (2026-10-02, hoja de ruta
   A5 de docs/pendientes.md: el mapa lo muestra él mismo, sin abrir la ficha escondida)
   Lo que antes vivía en la ficha (js/08: botinLootEscuchar, botinTextoItem, botinLootCuerpo, botinTomar), copiado tal cual y con el
   personaje (`S`) como parámetro. Los datos son de la partida: `campanas/<id>/combate/actual` ({numero, estado: 'publicado' |
   'cerrado', jugadores: [{fichaId, nombre, estado, xp, dde}]}) y `campanas/<id>/botin` (un doc por ítem: {nombre, json, despojos,
   origen, tomadoPor}).
   - loot(snap): la lista de lo que nadie tomó, a partir de un snapshot de `botin` → [{docId, nombre, item, despojos, origen}].
   - textoItem(item): el resumen de un ítem (para el globo al pasar el mouse).
   - html(S, {combate, loot, puede, fichaId}): el cuerpo de la ventana (lo que recibe cada jugador y los despojos para tomar).
   - tomar(S, entrada, ui): «Sumar a la mochila» — la mochila llena no deja; lo reclama con una transacción (el primero se lo lleva),
     lo suma a la mochila (los trofeos iguales se apilan) y lo anuncia en la Mesa. ui = {toast, cambio(), puede()}.
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
      if(x.tomadoPor) return;
      let item = null;
      try{ item = JSON.parse(x.json || 'null'); }catch(e){}
      if(!item) return;
      item.id = 'botin-' + d.id;
      out.push({docId: d.id, nombre: x.nombre || item.nombre, item, despojos: num(x.despojos), origen: x.origen || ''});
    });
    return out;
  }
  const publicado = combate => !!(combate && combate.estado === 'publicado');

  function textoItem(item){
    const partes = [];
    if(item.tier) partes.push(item.tier);
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
    const yo = o.fichaId;
    const js = (combate && Array.isArray(combate.jugadores)) ? combate.jugadores : [];
    const recompensas = js.length ? `<div style="margin-bottom:14px">
      <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Lo que recibe cada jugador</div>
      <div style="display:flex;flex-direction:column;gap:4px">${js.map(j => `<div style="display:flex;gap:10px;align-items:center;padding:6px 10px;border-radius:8px;background:rgba(255,255,255,${j.fichaId === yo ? '.10' : '.04'});${j.fichaId === yo ? 'outline:1px solid var(--copper, #B87333)' : ''}">
        <b style="flex:1">${esc(j.nombre)}${j.fichaId === yo ? ' <span class="hint">(vos)</span>' : ''}</b>
        <span class="hint">${esc(j.estado || '')}</span>
        <span style="min-width:90px;text-align:right"><b>+${fmt(num(j.xp))}</b> XP</span>
        <span style="min-width:90px;text-align:right"><b>+${fmt(num(j.dde))}</b> DDE</span></div>`).join('')}</div>
      <div class="hint" style="margin-top:4px">${publicado(combate) ? 'La experiencia y el oro se cargan en las fichas cuando el GM cierra el botín, después de que todos elijan.' : 'La experiencia y el oro ya se cargaron en las fichas.'}</div></div>` : '';
    const cerrado = combate && combate.estado === 'cerrado' && lista.length === 0
      ? '<div class="hint" style="margin-bottom:8px">El botín ya está cerrado: lo que nadie tomó se convirtió en despojos.</div>' : '';
    return `
    ${recompensas}${cerrado}
    <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Despojos: elegí lo que te llevás</div>
    <div class="hint" style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px">
      <span>Mochila: <b>${fmt(usado)}${cap > 0 ? ' / ' + fmt(cap) : ''}</b> ranuras${libres !== null ? ` · <b>${fmt(libres)}</b> libres` : ''}</span>
      <button type="button" class="mini" id="botin-loot-mochila">🎒 Abrir mochila</button>
    </div>
    ${puede ? '' : '<div class="hint" style="margin-bottom:8px">Abrí tu personaje (con permiso de edición) para tomar cosas del botín.</div>'}
    ${lista.length ? lista.map(b => {
      const info = E().slotOcupado(S, b.item);
      const comparar = info && info.equipados.length;
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--line, #444)">
        <div style="flex:1;min-width:0" title="${esc(textoItem(b.item))}">
          <div style="font-weight:600">${esc(b.nombre)}${b.item.trofeo ? ' <span class="hint">(trofeo)</span>' : ''}</div>
          <div class="hint">≈ ${fmt(b.despojos)} despojos${b.origen ? ' · de ' + esc(b.origen) : ''}${info && info.ocupado ? ' · slot ocupado' : ''}</div>
        </div>
        <button type="button" class="mini" data-view="catalogo:${esc(b.item.id)}">Ver</button>
        ${comparar ? `<button type="button" class="mini" data-botin-comparar="${esc(b.item.id)}">Comparar</button>` : ''}
        <button type="button" class="btn primary" data-botin-tomar="${esc(b.docId)}"${puede ? '' : ' disabled'}>Sumar a la mochila</button>
      </div>`;
    }).join('') : '<div class="hint">No queda nada sin tomar.</div>'}`;
  }

  async function tomar(S, b, ui){
    if(!ui.puede()){ ui.toast('Abrí tu personaje para tomar el botín'); return; }
    if(!b) return;
    const item = b.item;
    const igual = item.trofeo ? S.inventario.find(i => i.trofeo && i.nombre === item.nombre) : null;   // los trofeos iguales se apilan en una ranura
    const cap = E().capMochila(S);
    if(!igual && cap > 0 && E().mochilaUsada(S) + E().ranuras(item) > cap){ ui.toast(`Mochila llena: ${b.nombre} no entra (se va a convertir en despojos si nadie lo toma)`); return; }
    const ref = fbDb.collection(fbRutaCampana('botin')).doc(b.docId);
    let ok = false, quien = '';
    try{
      ok = await fbDb.runTransaction(async tx => {
        const x = await tx.get(ref);
        if(!x.exists) return false;
        if(x.data().tomadoPor){ quien = x.data().tomadoNombre || ''; return false; }
        tx.update(ref, {tomadoPor: fbUsuario.uid, tomadoNombre: String(S.meta.nombre || fbMiembro.nombre || '').slice(0, 60)});
        return true;
      });
    }catch(err){
      console.error('No se pudo tomar el botín:', err);
      ui.toast('No se pudo tomar' + (err.code === 'permission-denied' ? ' (sin permiso: faltan pegar las reglas)' : ''));
      return;
    }
    if(!ok){ ui.toast(quien ? `${b.nombre} ya lo tomó ${quien}` : `${b.nombre} ya no está`); return; }
    if(igual){ igual.unidades = num(igual.unidades) + 1; }
    else{
      const nuevo = structuredClone(item);
      nuevo.id = uid();
      nuevo.equipado = false;
      nuevo.unidades = 1;
      nuevo.ranuras = item.ranuras ?? 1;
      S.inventario.push(nuevo);
    }
    ui.cambio();
    ui.toast(`${b.nombre} → mochila`);
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String(S.meta.nombre || ''), origen: `🎁 ${S.meta.nombre || fbMiembro.nombre} tomó ${b.nombre}`, formula: '',
        rolls: [], mod: 0, total: 0, desde: 'recompensa', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('No se pudo escribir en la Mesa:', err); }
  }

  return {loot, publicado, textoItem, html, tomar};
})();
