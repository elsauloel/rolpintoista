/* =========================================================
   DAR A UN JUGADOR — 🎁 el GM le da un ítem, DDE o despojos a uno o varios personajes (2026-11-21, dueño: «me gustaría que el GM pueda darle un
   ítem del catálogo muy fácilmente a un jugador… tanto desde el mapa como desde GM Tools»; «que sea directo a la mochila, pero que sí le aparezca
   una notificación, que uno ponga aceptar, que no aparezca simplemente en la Mesa, porque eso pasa un poco desapercibido. También doblones del
   espacio, despojos y ítems custom, ítems que uno puede crear en el momento»).

   UNA sola ventana para el mapa y GM Tools:
   - A quién: los personajes de la partida, con casillas (uno o varios).
   - Qué: ítems del catálogo (el filtro de siempre, comun/filtro-catalogo.js, con «Ver» y cuántos; incluye lo subido por el grupo), DDE, despojos
     (normales, mágicos, especiales con nombre) o un ítem nuevo creado en el momento (comun/asistente-item.js).
   - Cómo llega: SIN colección ni reglas nuevas. Es un aviso más en `campanas/<id>/recompensas` (el mismo camino que el fin del combate: lo crea el
     GM, lo aplica una sola vez la pantalla de quien maneja al personaje —el mapa o la ficha—, también si estaba desconectado), marcado
     `regalo: true`. Entra directo a la mochila / DDE / despojos y a quien lo recibe le sale un cartel al centro «🎁 El GM te dio: …» con
     «Aceptar» (solo lo cierra). El GM deja además la línea en la Mesa. Si la mochila queda pasada de ranuras se da igual y se avisa (en el
     cartel y en la Mesa).

   El aviso: {fichaId, duenoUid, nombre, xp: 0, dde, despojos, despojosMagicos, despojosEsp: [{nombre, cantidad}], items: [json, …] (uno por
   unidad, como el botín: así una pantalla con la versión anterior igual los recibe), regalo: true, de, aplicada: false, creado}.

   DarJugador.abrir({catalogo() → ítems, marcados: [fichaId], item, toast(t), verItem(it) → {titulo, html}}) — la ventana (solo el GM).
   DarJugador.aviso(ficha, que, de) → el documento · .texto(que) → «Hacha ×2 · 50 DDE · 3 despojos» · .mesaTexto(nombres, que)
   DarJugador.recibir(S, r) → {partes, lineas, items, pasada} (lo llama Recibidos.recompensa cuando el aviso es un regalo)
   DarJugador.cartel({nombre, de, lineas, pasada}) — el cartel de quien recibe (si ya hay uno abierto, se suma abajo).
   Necesita sesion.js y mesa.js; para recibir, ficha-tienda.js y ficha-equipo.js; la ventana, filtro-catalogo.js (y generador-tiendas.js),
   asistente-item.js y ficha-calculo.js (los bonos del ítem nuevo).
   ========================================================= */
const DarJugador = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 9);
  const MAX_UNIDADES = 50;   // por ítem y por vez (cada unidad viaja escrita en el aviso)
  const sinMarca = s => String(s ?? '').replace(/^⚠️\s*/, '');

  /* ---------- Lo que se da: {items: [{item, n}], dde, despojos, magico, especiales: [{nombre, cantidad}]} ---------- */
  // Una copia del ítem para mandar: sin lo que es de la biblioteca ni imágenes pesadas.
  function copia(it){
    const c = structuredClone(it || {});
    delete c._bib; delete c.equipado; delete c.reservado; delete c.reservadoPara; delete c.enMesa; delete c.aMano;
    if(String(c.imagen || '').length > 40000) c.imagen = '';
    c.nombre = sinMarca(c.nombre);
    return c;
  }
  const entero = v => Math.max(0, Math.round(num(v)));
  function limpiar(que){
    que = que || {};
    return {
      items: (que.items || []).filter(x => x && x.item && entero(x.n) > 0).map(x => ({item: x.item, n: Math.min(MAX_UNIDADES, entero(x.n))})),
      dde: Math.max(0, Math.round(num(que.dde) * 100) / 100),
      despojos: entero(que.despojos), magico: entero(que.magico),
      especiales: (que.especiales || []).map(e => ({nombre: String((e && e.nombre) || '').trim().slice(0, 60), cantidad: entero(e && e.cantidad)})).filter(e => e.nombre && e.cantidad > 0),
    };
  }
  const vacio = que => { const q = limpiar(que); return !q.items.length && !q.dde && !q.despojos && !q.magico && !q.especiales.length; };
  // Las partes en palabras: ['Hacha ×2', '50 DDE', '3 despojos', '1 despojo mágico', '2 × Escama de dragón (despojo especial)'].
  function partesDe(que){
    const q = limpiar(que), p = [];
    q.items.forEach(x => p.push(`${sinMarca(x.item.nombre) || 'un ítem'}${x.n > 1 ? ` ×${x.n}` : ''}`));
    if(q.dde) p.push(`${fmt(q.dde)} DDE`);
    if(q.despojos) p.push(`${q.despojos} despojo${q.despojos === 1 ? '' : 's'}`);
    if(q.magico) p.push(`${q.magico} despojo${q.magico === 1 ? ' mágico' : 's mágicos'}`);
    q.especiales.forEach(e => p.push(`${e.cantidad} × ${e.nombre} (despojo especial)`));
    return p;
  }
  const texto = que => partesDe(que).join(' · ');
  const lista = nombres => nombres.length <= 1 ? (nombres[0] || '') : `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`;
  // La línea de la Mesa (la escribe el GM al dar).
  function mesaTexto(nombres, que){
    const varios = nombres.length > 1;
    return `🎁 El GM le${varios ? 's' : ''} dio a ${lista(nombres)}${varios ? ' (a cada uno)' : ''}: ${partesDe(que).join(', ')}`;
  }
  // El aviso que se deja en `recompensas` para un personaje (sin la hora, que la pone quien escribe).
  function aviso(ficha, que, de){
    const q = limpiar(que), items = [];
    q.items.forEach(x => { const js = JSON.stringify(copia(x.item)); for(let i = 0; i < x.n; i++) items.push(js); });
    return {fichaId: String(ficha.id), duenoUid: String(ficha.duenoUid || ''), nombre: String(ficha.nombre || '').slice(0, 60), xp: 0, dde: q.dde, despojos: q.despojos,
      ...(q.magico ? {despojosMagicos: q.magico} : {}), ...(q.especiales.length ? {despojosEsp: q.especiales} : {}), ...(items.length ? {items} : {}),
      regalo: true, de: String(de || 'El GM').slice(0, 60), aplicada: false};
  }

  /* ---------- Recibir (la pantalla de quien maneja al personaje: el mapa o la ficha) ---------- */
  // Los ítems del aviso, juntando las unidades iguales: [{item, n}].
  function itemsDe(r){
    const cuenta = new Map();
    (Array.isArray(r.items) ? r.items : []).forEach(js => { if(typeof js === 'string') cuenta.set(js, (cuenta.get(js) || 0) + 1); });
    const out = [];
    cuenta.forEach((n, js) => { try{ const item = JSON.parse(js); if(item && typeof item === 'object') out.push({item, n}); }catch(e){} });
    return out;
  }
  function recibir(S, r){
    r = r || {};
    S.meta = S.meta || {}; S.loot = S.loot || {}; S.inventario = S.inventario || [];
    const items = itemsDe(r), especiales = (Array.isArray(r.despojosEsp) ? r.despojosEsp : []).map(e => ({nombre: String((e && e.nombre) || '').trim(), cantidad: entero(e && e.cantidad)})).filter(e => e.nombre && e.cantidad > 0);
    const que = {items, dde: num(r.dde), despojos: num(r.despojos), magico: num(r.despojosMagicos), especiales};
    items.forEach(({item, n}) => {
      const base = structuredClone(item);
      if(base.consumible){ delete base.id; FichaTienda.agregarConsumible(S, base, n); return; }   // se apila con los iguales
      for(let i = 0; i < n; i++){
        const nuevo = structuredClone(base);
        if(base.id) nuevo.catId = base.id;   // de qué ítem del catálogo salió (↻ Actualizar desde el catálogo)
        nuevo.id = uid(); nuevo.equipado = false; nuevo.unidades = 1; nuevo.ranuras = base.ranuras ?? 1;
        S.inventario.push(nuevo);
      }
    });
    if(que.dde > 0) S.meta.dde = Math.round((num(S.meta.dde) + que.dde) * 100) / 100;
    if(que.despojos > 0) S.loot.normal = num(S.loot.normal) + entero(que.despojos);
    if(que.magico > 0) S.loot.magico = num(S.loot.magico) + entero(que.magico);
    especiales.forEach(e => {
      S.loot.especial = Array.isArray(S.loot.especial) ? S.loot.especial : [];
      const clave = e.nombre.toLowerCase();
      let l = S.loot.especial.find(x => String(x.nombre || '').trim().toLowerCase() === clave);
      if(!l){ l = {id: uid(), nombre: e.nombre, cantidad: 0}; S.loot.especial.push(l); }
      l.cantidad = num(l.cantidad) + e.cantidad;
    });
    // ¿Quedó la mochila pasada de ranuras? Se da igual: se avisa (ADN: avisar, no bloquear).
    let pasada = null;
    if(items.length){
      try{ const cap = FichaEquipo.capMochila(S), usada = FichaEquipo.mochilaUsada(S); if(cap > 0 && usada > cap) pasada = {usada, cap}; }catch(e){}
    }
    const lineas = [];
    items.forEach(x => lineas.push({icono: '🎒', texto: `${sinMarca(x.item.nombre) || 'Un ítem'}${x.n > 1 ? ` ×${x.n}` : ''}`, nota: 'ya está en tu mochila', item: x.item}));
    if(que.dde > 0) lineas.push({icono: '💰', texto: `+${fmt(que.dde)} DDE`});
    if(que.despojos > 0) lineas.push({icono: '🦴', texto: `+${entero(que.despojos)} despojo${entero(que.despojos) === 1 ? '' : 's'}`});
    if(que.magico > 0) lineas.push({icono: '✨', texto: `+${entero(que.magico)} despojo${entero(que.magico) === 1 ? ' mágico' : 's mágicos'}`});
    especiales.forEach(e => lineas.push({icono: '💎', texto: `+${e.cantidad} × ${e.nombre}`, nota: 'despojo especial'}));
    return {partes: partesDe(que), lineas, items: items.map(x => sinMarca(x.item.nombre) || '?'), pasada, de: String(r.de || 'El GM')};
  }
  const pasadaTexto = p => p ? `Tu mochila quedó pasada: ${fmt(p.usada)} de ${fmt(p.cap)} ranuras. Lo recibiste igual: acomodala cuando puedas.` : '';

  /* ---------- El cartel de quien recibe ---------- */
  const CSS = `
.dj-cartel-fondo{position:fixed;inset:0;z-index:99200;background:rgba(6,8,14,.66);display:flex;align-items:center;justify-content:center;padding:14px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.dj-cartel{width:min(520px,100%);max-height:90vh;overflow:auto;background:#1b1622;border:2px solid #E0A458;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.6);color:#EDE3D2;padding:20px 22px;text-align:center}
.dj-cartel .dj-regalo{font-size:46px;line-height:1}
.dj-cartel h3{margin:6px 0 2px;font-size:22px;color:#F3C77A;font-weight:700}
.dj-cartel .dj-para{font-size:13px;color:#B9A796;margin-bottom:12px}
.dj-cartel .dj-tanda{border-top:1px dashed #4a3d4a;padding-top:10px;margin-top:10px}
.dj-cartel .dj-tanda:first-of-type{border-top:0;padding-top:0;margin-top:0}
.dj-cartel .dj-linea{display:flex;align-items:baseline;gap:9px;text-align:left;background:#251e2e;border:1px solid #3d3247;border-radius:10px;padding:8px 12px;margin:6px 0;font-size:16px}
.dj-cartel .dj-linea b{font-weight:700}
.dj-cartel .dj-linea small{color:#B9A796;font-size:12px;margin-left:auto;white-space:nowrap}
.dj-cartel .dj-detalle{display:block;font-size:12px;color:#B9A796;font-weight:400;margin-top:2px}
.dj-cartel .dj-aviso{background:rgba(212,87,78,.16);border:1px solid #D4574E;border-radius:10px;padding:8px 12px;margin-top:8px;font-size:13.5px;text-align:left;color:#F5C6C1}
.dj-cartel button{margin-top:16px;background:#E0A458;color:#1b1622;border:0;border-radius:10px;padding:10px 34px;font-size:16px;font-weight:700;cursor:pointer}
.dj-cartel button:hover{filter:brightness(1.08)}

.dj-fondo{position:fixed;inset:0;z-index:94;background:rgba(6,8,14,.7);display:flex;align-items:center;justify-content:center;padding:14px;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
  --paper:#EDE3D2;--muted:#9A867E;--line:#3B2E34;--copper:#C98545;--danger:#D4574E}
.dj{width:min(1080px,100%);height:min(860px,94vh);display:flex;flex-direction:column;background:#1b1622;border:1px solid #4a3d4a;border-radius:14px;box-shadow:0 18px 60px rgba(0,0,0,.6);color:#EDE3D2;font-size:14px}
.dj *{box-sizing:border-box}
.dj header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #3B2E34}
.dj header h3{margin:0;font-size:19px;flex:1;color:#F3C77A}
.dj button{font:inherit;cursor:pointer;border-radius:8px;border:1px solid #4a3d4a;background:#2a2233;color:#EDE3D2;padding:5px 11px}
.dj button:hover{border-color:#C98545}
.dj button:disabled{opacity:.5;cursor:default}
.dj button.dj-pri{background:#E0A458;border-color:#E0A458;color:#1b1622;font-weight:700;padding:9px 22px;font-size:15px}
.dj input[type=number],.dj input[type=text]{font:inherit;background:#120e17;border:1px solid #4a3d4a;border-radius:8px;color:#EDE3D2;padding:6px 9px}
.dj input[type=number]{width:92px}
.dj .dj-cuerpo{flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;padding:12px 16px;overflow:hidden}
.dj .dj-tit{font-family:"Space Mono",monospace;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:#C98545;margin-bottom:5px}
.dj .dj-quien{display:flex;flex-wrap:wrap;gap:7px;align-items:center}
.dj .dj-pj{display:inline-flex;align-items:center;gap:7px;padding:5px 12px 5px 8px;border:1px solid #4a3d4a;border-radius:999px;background:#241d2c;cursor:pointer;user-select:none}
.dj .dj-pj.on{border-color:#E0A458;background:rgba(224,164,88,.18)}
.dj .dj-pj input{accent-color:#E0A458;width:16px;height:16px;margin:0}
.dj .dj-pj small{color:#9A867E}
.dj .dj-tabs{display:flex;gap:6px;flex-wrap:wrap}
.dj .dj-tabs button.on{background:#3a2d24;border-color:#E0A458;color:#F3C77A;font-weight:700}
.dj .dj-panel{flex:1;min-height:0;overflow:auto;border:1px solid #3B2E34;border-radius:10px;padding:10px 12px;background:#17121d}
.dj .dj-lista{margin-top:8px;display:flex;flex-direction:column;gap:5px}
.dj .dj-item{border:1px solid #3B2E34;border-radius:9px;background:#201927;padding:7px 10px}
.dj .dj-item-cab{display:flex;align-items:center;gap:9px}
.dj .dj-item-nombre{font-weight:600;flex:1;min-width:0}
.dj .dj-item-nombre small{display:block;color:#9A867E;font-weight:400;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dj .dj-tier{font-size:11px;border:1px solid currentColor;border-radius:999px;padding:1px 8px;white-space:nowrap}
.dj .dj-ver{margin-top:8px;border-top:1px dashed #3B2E34;padding-top:6px}
.dj .dj-nota{color:#9A867E;font-size:12.5px;line-height:1.45}
.dj .dj-fila{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0}
.dj .dj-fila label{min-width:150px}
.dj .dj-canasta{border:1px solid #E0A458;border-radius:10px;padding:9px 12px;background:rgba(224,164,88,.07);max-height:26%;overflow:auto}
.dj .dj-can-fila{display:flex;align-items:center;gap:8px;padding:3px 0}
.dj .dj-can-fila span.n{flex:1;min-width:0}
.dj .dj-can-fila button{padding:1px 9px}
.dj .dj-can-fila input{width:64px;padding:3px 6px;text-align:center}
.dj footer{display:flex;align-items:center;gap:12px;padding:11px 16px;border-top:1px solid #3B2E34}
.dj footer .dj-resumen{flex:1;color:#B9A796;font-size:13px}
.dj .view-wrap{display:flex}.dj .view-image-wrap{display:none}.dj .view-info{flex:1;min-width:0}
.dj .view-title{display:none}.dj .view-lines{display:flex;flex-direction:column;gap:3px}
.dj .view-line{display:flex;justify-content:space-between;gap:10px;font-size:12.5px}
.dj .view-label{color:#9A867E;flex:none}.dj .view-value{text-align:right}
.dj .view-detalle{padding:7px 0 0;font-size:12.5px;line-height:1.5;color:#DCCFC5;white-space:pre-wrap}
.dj .view-detalle .view-label{display:block;color:#C98545;font-size:10px;letter-spacing:.14em;text-transform:uppercase;margin-bottom:3px}
.dj .view-narrativa{font-style:italic;color:#B9A796}
`;
  function estilos(){
    if(typeof document === 'undefined' || document.getElementById('dar-jugador-css')) return;
    const s = document.createElement('style');
    s.id = 'dar-jugador-css';
    s.textContent = CSS + (typeof ItemCorto !== 'undefined' && ItemCorto.CSS ? ItemCorto.CSS : '');
    document.head.appendChild(s);
  }
  // El HTML de una tanda del cartel (lo que llegó en un aviso).
  function tandaHtml(o){
    const lineas = (o.lineas || []).map(l => {
      const det = l.item && l.item.detalle ? `<span class="dj-detalle">${esc(String(l.item.detalle).split('\n')[0].slice(0, 160))}</span>` : '';
      return `<div class="dj-linea"><span>${l.icono || '🎁'}</span><span><b>${esc(l.texto)}</b>${det}</span>${l.nota ? `<small>${esc(l.nota)}</small>` : ''}</div>`;
    }).join('');
    return `<div class="dj-tanda"><div class="dj-para">${esc(o.de || 'El GM')} le dio a <b>${esc(o.nombre || 'tu personaje')}</b>:</div>${lineas}
      ${o.pasada ? `<div class="dj-aviso">⚠ ${esc(pasadaTexto(o.pasada))}</div>` : ''}</div>`;
  }
  let cartelAbierto = null;
  function cartel(o){
    if(typeof document === 'undefined') return;
    estilos();
    if(cartelAbierto && cartelAbierto.isConnected){   // llegó otro mientras este seguía abierto: se suma abajo
      cartelAbierto.querySelector('.dj-tandas').insertAdjacentHTML('beforeend', tandaHtml(o));
      return;
    }
    const fondo = document.createElement('div');
    fondo.className = 'dj-cartel-fondo';
    fondo.innerHTML = `<div class="dj-cartel" role="dialog" aria-modal="true"><div class="dj-regalo">🎁</div><h3>${esc(o.de || 'El GM')} te dio algo</h3>
      <div class="dj-tandas">${tandaHtml(o)}</div><button type="button" data-dj-aceptar>✔ Aceptar</button></div>`;
    fondo.querySelector('[data-dj-aceptar]').onclick = () => { fondo.remove(); if(cartelAbierto === fondo) cartelAbierto = null; };
    document.body.appendChild(fondo);
    cartelAbierto = fondo;
    setTimeout(() => { const b = fondo.querySelector('[data-dj-aceptar]'); if(b) try{ b.focus(); }catch(e){} }, 30);
  }

  /* ---------- Dar (el GM) ---------- */
  // Deja un aviso por personaje (un solo lote) y la línea en la Mesa. → {ok, nombres} | {error}.
  async function enviar(fichas, que){
    if(typeof fbDb === 'undefined' || !fbDb || !fbMiembro || !fbMiembro.gm) return {error: 'Solo el GM puede dar cosas así'};
    fichas = (fichas || []).filter(f => f && f.id);
    if(!fichas.length) return {error: 'Elegí a quién dárselo'};
    if(vacio(que)) return {error: 'Elegí qué dar'};
    const lote = fbDb.batch(), col = fbDb.collection(fbRutaCampana('recompensas'));
    fichas.forEach(f => lote.set(col.doc(), {...aviso(f, que, 'El GM'), creado: firebase.firestore.FieldValue.serverTimestamp()}));
    try{ await lote.commit(); }
    catch(err){ console.error('No se pudo dar:', err); return {error: err && err.code === 'permission-denied' ? 'No se pudo dar: sin permiso (¿sos GM de esta partida?)' : 'No se pudo dar — mirá la consola'}; }
    const nombres = fichas.map(f => f.nombre || 'un personaje');
    try{ if(typeof mesaLinea === 'function') await mesaLinea(mesaTexto(nombres, que), 'recordatorio'); }catch(e){}
    return {ok: true, nombres};
  }
  // Los personajes de la partida (no las invocaciones: viven adentro de la ficha de su dueño).
  async function personajes(){
    const [fichas, miembros] = await Promise.all([fbDb.collection(fbRutaCampana('fichas')).get(), fbDb.collection(fbRutaCampana('miembros')).get().catch(() => ({docs: []}))]);
    const nombres = new Map(miembros.docs.map(d => [d.id, String((d.data() || {}).nombre || '')]));
    return fichas.docs.map(d => ({id: d.id, nombre: String(d.data().nombre || 'Sin nombre'), duenoUid: String(d.data().duenoUid || ''), jugador: nombres.get(d.data().duenoUid) || ''}))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }

  const TIER_COLOR = {'Común': '#9A867E', 'Buena Calidad': '#A8C256', 'Raro': '#5B8DBE', 'Excepcional': '#E0A458', 'Legendario': '#9B7BD4', 'A definir': '#D4574E'};
  const MAX_LISTA = 60;
  let v = null;   // la ventana abierta
  function cerrar(){ if(v){ v.fondo.remove(); v = null; } }

  async function abrir(o){
    o = o || {};
    const toast = t => { try{ (o.toast || (typeof window.toast === 'function' ? window.toast : () => {}))(t); }catch(e){} };
    if(typeof fbMiembro === 'undefined' || !fbMiembro || !fbMiembro.gm){ toast('Solo el GM puede dar cosas así'); return; }
    cerrar();
    estilos();
    const fondo = document.createElement('div');
    fondo.className = 'dj-fondo';
    fondo.innerHTML = `<div class="dj" role="dialog" aria-modal="true">
      <header><h3>🎁 Dar a un jugador</h3><button type="button" data-dj="cerrar">Cerrar</button></header>
      <div class="dj-cuerpo">
        <div><div class="dj-tit">¿A quién?</div><div class="dj-quien" data-dj-quien><span class="dj-nota">Leyendo los personajes…</span></div></div>
        <div><div class="dj-tit">¿Qué le das?</div><div class="dj-tabs">
          <button type="button" data-dj-tab="catalogo">📦 Ítem del catálogo</button><button type="button" data-dj-tab="dde">💰 DDE</button>
          <button type="button" data-dj-tab="despojos">🦴 Despojos</button><button type="button" data-dj-tab="nuevo">✎ Ítem nuevo</button></div></div>
        <div class="dj-panel" data-dj-panel="catalogo"><div data-dj-filtro></div><div class="dj-lista" data-dj-lista></div></div>
        <div class="dj-panel" data-dj-panel="dde" hidden>
          <div class="dj-fila"><label>Doblones del espacio (DDE)</label><input type="number" min="0" step="1" data-dj-num="dde" placeholder="0"></div>
          <p class="dj-nota">Se suman a los DDE del personaje. Si elegís a varios, cada uno recibe esa cantidad.</p></div>
        <div class="dj-panel" data-dj-panel="despojos" hidden>
          <div class="dj-fila"><label>🦴 Despojos normales</label><input type="number" min="0" step="1" data-dj-num="despojos" placeholder="0"></div>
          <div class="dj-fila"><label>✨ Despojos mágicos</label><input type="number" min="0" step="1" data-dj-num="magico" placeholder="0"></div>
          <div class="dj-fila"><label>💎 Despojo especial</label><input type="text" data-dj-esp-nombre placeholder="Nombre (ej. Escama de dragón)" style="flex:1;min-width:200px"><input type="number" min="1" step="1" data-dj-esp-n value="1"><button type="button" data-dj="esp-sumar">+ Sumar</button></div>
          <p class="dj-nota">Los despojos especiales llevan nombre; si el personaje ya tiene uno con ese nombre, se le suman. Si elegís a varios, cada uno recibe lo mismo.</p></div>
        <div class="dj-panel" data-dj-panel="nuevo" hidden>
          <p class="dj-nota" style="margin-top:0">Un ítem que no está en el catálogo: lo armás paso a paso (el mismo asistente de siempre) y queda en la lista de abajo para darlo. No se sube al catálogo. Los consumibles no pasan por el asistente: para esos, usá uno del catálogo.</p>
          <button type="button" class="dj-pri" data-dj="crear">✎ Crear un ítem ahora</button></div>
        <div class="dj-canasta"><div class="dj-tit">Lo que vas a dar</div><div data-dj-canasta></div></div>
      </div>
      <footer><span class="dj-resumen" data-dj-resumen></span><button type="button" data-dj="cerrar">Cancelar</button><button type="button" class="dj-pri" data-dj="dar">🎁 Dar</button></footer></div>`;
    document.body.appendChild(fondo);
    const $ = s => fondo.querySelector(s);
    const yo = v = {fondo, pjs: [], marcados: new Set((o.marcados || []).map(String)), que: {items: [], dde: 0, despojos: 0, magico: 0, especiales: []}, tab: 'catalogo', viendo: '', filtro: null, enviando: false};
    const catalogo = () => { try{ return (o.catalogo ? o.catalogo() : (typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE : [])) || []; }catch(e){ return []; } };
    const sumarItem = (item, n) => {
      const js = JSON.stringify(copia(item));
      const ya = yo.que.items.find(x => x.clave === js);
      if(ya) ya.n = Math.min(MAX_UNIDADES, ya.n + (n || 1)); else yo.que.items.push({clave: js, item: copia(item), n: n || 1});
    };
    if(o.item) sumarItem(o.item, 1);

    function dibujarQuien(){
      $('[data-dj-quien]').innerHTML = yo.pjs.length
        ? yo.pjs.map(p => `<label class="dj-pj${yo.marcados.has(p.id) ? ' on' : ''}"><input type="checkbox" data-dj-pj="${esc(p.id)}"${yo.marcados.has(p.id) ? ' checked' : ''}>${esc(p.nombre)}${p.jugador ? ` <small>· ${esc(p.jugador)}</small>` : ''}</label>`).join('')
          + (yo.pjs.length > 1 ? `<button type="button" data-dj="todos">${yo.pjs.every(p => yo.marcados.has(p.id)) ? 'Ninguno' : 'Todos'}</button>` : '')
        : '<span class="dj-nota">Todavía no hay personajes en la partida.</span>';
    }
    function dibujarTabs(){
      fondo.querySelectorAll('[data-dj-tab]').forEach(b => b.classList.toggle('on', b.dataset.djTab === yo.tab));
      fondo.querySelectorAll('[data-dj-panel]').forEach(p => { p.hidden = p.dataset.djPanel !== yo.tab; });
    }
    function verHtml(it){
      try{
        const r = o.verItem ? o.verItem(it) : (typeof CreepLupa !== 'undefined' ? CreepLupa.verItem(it) : null);
        if(r && r.html) return r.html;
      }catch(e){ console.error(e); }
      return `<div class="view-detalle">${esc(it.detalle || 'Sin descripción')}</div>`;
    }
    const tipoDe = it => { try{ return (typeof FiltroCatalogo !== 'undefined' && FiltroCatalogo.PARTE_ETQ && FiltroCatalogo.PARTE_ETQ[FiltroCatalogo.parteDe(it)]) || ''; }catch(e){ return ''; } };
    function dibujarLista(){
      const caja = $('[data-dj-lista]');
      let items = [];
      try{ if(yo.filtro){ yo.filtro.actualizar(); items = yo.filtro.filtrar(); } else items = catalogo(); }catch(e){ console.error(e); items = catalogo(); }
      yo.visibles = items.slice(0, MAX_LISTA);
      caja.innerHTML = (yo.visibles.map((it, i) => {
        const color = TIER_COLOR[it.tier] || TIER_COLOR['Común'], tipo = tipoDe(it), corto = String(it.detalle || '').split('\n')[0];
        return `<div class="dj-item"><div class="dj-item-cab"><span class="dj-item-nombre">${esc(it.nombre)}<small>${esc([tipo, corto].filter(Boolean).join(' · '))}</small></span>
          ${it.tier ? `<span class="dj-tier" style="color:${color}">${esc(it.tier)}</span>` : ''}
          <button type="button" data-dj-ver="${i}">${yo.viendo === it.id ? 'Ocultar' : 'Ver'}</button><button type="button" data-dj-sumar="${i}">+ Agregar</button></div>
          ${yo.viendo === it.id ? `<div class="dj-ver">${verHtml(it)}</div>` : ''}</div>`;
      }).join('') || '<div class="dj-nota">No hay ítems con esos filtros. Probá sacar alguno (✕ Limpiar todo).</div>')
        + (items.length > MAX_LISTA ? `<div class="dj-nota">Se muestran ${MAX_LISTA} de ${items.length}: escribí parte del nombre o usá los filtros para achicar la lista.</div>` : '');
    }
    function dibujarCanasta(){
      const q = yo.que, filas = [];
      q.items.forEach((x, i) => filas.push(`<div class="dj-can-fila"><span>🎒</span><span class="n">${esc(sinMarca(x.item.nombre))}</span>
        <button type="button" data-dj-menos="${i}" title="Uno menos">−</button><input type="number" min="1" max="${MAX_UNIDADES}" value="${x.n}" data-dj-cant="${i}" title="Cuántos"><button type="button" data-dj-mas="${i}" title="Uno más">+</button>
        <button type="button" data-dj-quitar="${i}" title="Sacarlo de la lista">✕</button></div>`));
      if(num(q.dde) > 0) filas.push(`<div class="dj-can-fila"><span>💰</span><span class="n">${fmt(num(q.dde))} DDE</span><button type="button" data-dj-cero="dde">✕</button></div>`);
      if(num(q.despojos) > 0) filas.push(`<div class="dj-can-fila"><span>🦴</span><span class="n">${entero(q.despojos)} despojo${entero(q.despojos) === 1 ? '' : 's'}</span><button type="button" data-dj-cero="despojos">✕</button></div>`);
      if(num(q.magico) > 0) filas.push(`<div class="dj-can-fila"><span>✨</span><span class="n">${entero(q.magico)} despojo${entero(q.magico) === 1 ? ' mágico' : 's mágicos'}</span><button type="button" data-dj-cero="magico">✕</button></div>`);
      q.especiales.forEach((e, i) => filas.push(`<div class="dj-can-fila"><span>💎</span><span class="n">${entero(e.cantidad)} × ${esc(e.nombre)} <small style="color:#9A867E">(despojo especial)</small></span><button type="button" data-dj-esp-quitar="${i}">✕</button></div>`));
      $('[data-dj-canasta]').innerHTML = filas.join('') || '<span class="dj-nota">Todavía nada: agregá un ítem, DDE o despojos de arriba.</span>';
      const quienes = yo.pjs.filter(p => yo.marcados.has(p.id)).map(p => p.nombre);
      $('[data-dj-resumen]').textContent = !quienes.length ? 'Elegí a quién dárselo.' : vacio(q) ? `Para ${lista(quienes)}: elegí qué dar.`
        : `${lista(quienes)} ${quienes.length > 1 ? 'reciben (cada uno)' : 'recibe'}: ${texto(q)}. Le${quienes.length > 1 ? 's' : ''} entra directo y le${quienes.length > 1 ? 's' : ''} salta un cartel.`;
      $('[data-dj="dar"]').disabled = yo.enviando || !quienes.length || vacio(q);
    }
    function crearItem(){
      if(typeof AsistenteItem === 'undefined'){ toast('No se pudo abrir el asistente de ítems'); return; }
      const stats = typeof FichaCalculo !== 'undefined' && FichaCalculo.MOD_TARGETS ? FichaCalculo.MOD_TARGETS.map(x => ({id: x.id, label: x.label})) : [];
      AsistenteItem.abrir({
        contexto: 'ficha', nuevo: true, titulo: '🎁 Ítem nuevo para dar',
        draft: {nombre: '', tipoItem: '', tier: 'A definir', peso: 0, ranuras: 1, detalle: '', mods: [], imagen: '', unidades: 1, consumible: false, precioCompra: 0,
          tipoDado: 8, danoFijo: 0, danoAmplificado: 0, armaDeRango: false, efectosGolpe: []},
        categorias: AsistenteItem.CATEGORIAS.map(c => c.id).filter(id => id !== 'consumibles'),
        stats, tiers: Object.keys(TIER_COLOR),
        ejemplos: (tipoItem, t) => catalogo().filter(it => String(it.tipoItem || '').startsWith('arma_') && num(it.tipoDado) === t).map(it => it.nombre),
        conPrecio: true, conRanuras: true, conNarrativa: true, conEstadoEquipar: true,
        textoGuardar: '✔ Crear y sumarlo a la lista',
        onGuardar: d => {
          if(v !== yo) return true;
          const item = copia(d);
          delete item.id; item.equipado = false; item.consumible = false; item.unidades = 1;
          sumarItem(item, 1);
          dibujarCanasta();
          toast(`«${item.nombre}» creado: quedó en la lista para dar`);
          return true;
        },
      });
    }
    async function dar(){
      const fichas = yo.pjs.filter(p => yo.marcados.has(p.id));
      if(!fichas.length || vacio(yo.que) || yo.enviando) return;
      yo.enviando = true; dibujarCanasta();
      const que = limpiar(yo.que), r = await enviar(fichas, que);
      yo.enviando = false;
      if(r.error){ toast(r.error); if(v === yo) dibujarCanasta(); return; }
      toast(`🎁 Listo: ${lista(r.nombres)} ${r.nombres.length > 1 ? 'reciben' : 'recibe'} ${texto(que)}`);
      if(typeof o.alDar === 'function') try{ o.alDar(fichas, que); }catch(e){}
      if(v === yo) cerrar();
    }

    fondo.addEventListener('click', e => {
      const t = e.target, b = t.closest('button');
      if(t === fondo){ cerrar(); return; }
      if(!b) return;
      const d = b.dataset;
      if(d.dj === 'cerrar'){ cerrar(); return; }
      if(d.dj === 'todos'){ const todos = yo.pjs.every(p => yo.marcados.has(p.id)); yo.marcados = new Set(todos ? [] : yo.pjs.map(p => p.id)); dibujarQuien(); dibujarCanasta(); return; }
      if(d.djTab){ yo.tab = d.djTab; dibujarTabs(); return; }
      if(d.djVer !== undefined){ const it = yo.visibles[num(d.djVer)]; if(it){ yo.viendo = yo.viendo === it.id ? '' : it.id; dibujarLista(); } return; }
      if(d.djSumar !== undefined){ const it = yo.visibles[num(d.djSumar)]; if(it){ sumarItem(it, 1); dibujarCanasta(); toast(`${sinMarca(it.nombre)}: sumado a la lista`); } return; }
      if(d.djMenos !== undefined){ const x = yo.que.items[num(d.djMenos)]; if(x){ x.n -= 1; if(x.n <= 0) yo.que.items.splice(num(d.djMenos), 1); dibujarCanasta(); } return; }
      if(d.djMas !== undefined){ const x = yo.que.items[num(d.djMas)]; if(x){ x.n = Math.min(MAX_UNIDADES, x.n + 1); dibujarCanasta(); } return; }
      if(d.djQuitar !== undefined){ yo.que.items.splice(num(d.djQuitar), 1); dibujarCanasta(); return; }
      if(d.djCero){ yo.que[d.djCero] = 0; const i = $(`[data-dj-num="${d.djCero}"]`); if(i) i.value = ''; dibujarCanasta(); return; }
      if(d.djEspQuitar !== undefined){ yo.que.especiales.splice(num(d.djEspQuitar), 1); dibujarCanasta(); return; }
      if(d.dj === 'esp-sumar'){
        const nombre = $('[data-dj-esp-nombre]').value.trim(), n = entero($('[data-dj-esp-n]').value) || 1;
        if(!nombre){ toast('Ponele un nombre al despojo especial'); $('[data-dj-esp-nombre]').focus(); return; }
        const ya = yo.que.especiales.find(x => x.nombre.toLowerCase() === nombre.toLowerCase());
        if(ya) ya.cantidad += n; else yo.que.especiales.push({nombre, cantidad: n});
        $('[data-dj-esp-nombre]').value = ''; $('[data-dj-esp-n]').value = 1;
        dibujarCanasta(); return;
      }
      if(d.dj === 'crear'){ crearItem(); return; }
      if(d.dj === 'dar'){ dar(); return; }
    });
    fondo.addEventListener('change', e => {
      const t = e.target;
      if(t.dataset.djPj){ if(t.checked) yo.marcados.add(t.dataset.djPj); else yo.marcados.delete(t.dataset.djPj); dibujarQuien(); dibujarCanasta(); return; }
      if(t.dataset.djCant !== undefined){ const x = yo.que.items[num(t.dataset.djCant)]; if(x){ x.n = Math.max(1, Math.min(MAX_UNIDADES, entero(t.value) || 1)); dibujarCanasta(); } }
    });
    fondo.addEventListener('input', e => {
      const t = e.target;
      if(t.dataset.djNum){ yo.que[t.dataset.djNum] = Math.max(0, num(t.value)); dibujarCanasta(); }
    });
    fondo.addEventListener('keydown', e => { if(e.key === 'Escape' && !document.querySelector('.pap-fondo')){ e.stopPropagation(); cerrar(); } });

    dibujarTabs();
    try{
      if(typeof FiltroCatalogo !== 'undefined') yo.filtro = FiltroCatalogo.crear($('[data-dj-filtro]'), {base: catalogo, origen: true, clave: 'dar-jugador', alCambiar: () => { if(v === yo) dibujarLista(); }});
    }catch(err){ console.error('El filtro del catálogo no se pudo armar:', err); }
    dibujarLista();
    dibujarCanasta();
    try{
      const pjs = await personajes();
      if(v !== yo) return;
      yo.pjs = pjs;
      yo.marcados = new Set([...yo.marcados].filter(id => pjs.some(p => p.id === id)));
      if(pjs.length === 1) yo.marcados.add(pjs[0].id);
    }catch(err){ console.error('No se pudieron leer los personajes:', err); if(v === yo) $('[data-dj-quien]').innerHTML = '<span class="dj-nota">No se pudieron leer los personajes — mirá la consola.</span>'; return; }
    dibujarQuien();
    dibujarCanasta();
  }

  return {abrir, cerrar, enviar, aviso, limpiar, vacio, partesDe, texto, mesaTexto, recibir, itemsDe, pasadaTexto, cartel, copia, MAX_UNIDADES};
})();
