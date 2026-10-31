/* =========================================================
   EDITAR Y SUBIR UN ÍTEM DESDE CUALQUIER "VER" (compartido: ficha, gm-tools, generador de tiendas)
   Pedido del dueño (2026-09-29): cualquier ítem que se vea —en una tienda, en la mochila o el equipo de un jugador, en un
   creep, en el botín— tiene que poder editarse y subirse al catálogo compartido desde su ventana "Ver". No toca la copia
   que se está mirando (la mochila de otro, la tienda publicada…): arma una copia, la edita con el mismo asistente de
   siempre (comun/asistente-item.js; los consumibles, con un formulario corto de acá) y la sube con la subida unificada
   (Biblioteca.guardar, tipo `items`), que pregunta si es una corrección del ítem del catálogo o algo nuevo.

   EditarItem.abrir({item, catalogo, stats, contexto, tiers, alSubir})
     item      el ítem tal como se ve (de catálogo, de una mochila, de un creep: con la Defensa en `def` o en los bonos)
     catalogo  el catálogo con lo subido ya sumado (para saber de qué ítem sale y para completar lo que la copia no trae)
     stats     [{id, label}] para la lista de bonos del asistente
     contexto  'ficha' | 'creep' | 'tienda' (textos del asistente)
     alSubir   () => … después de subir (releer lo subido)
   EditarItem.subir(item, {catalogo, alSubir}) — sube directo, sin editar (lo usan los "⬆ Subir" de otros editores).
   Necesita comun/biblioteca.js, comun/plantillas.js, comun/items-subidos.js y comun/asistente-item.js.
   ========================================================= */
const EditarItem = (() => {
  const clon = v => structuredClone(v);
  const n = v => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const avisar = m => (typeof toast === 'function' ? toast(m) : alert(m));
  const TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];
  // La calidad solo la ve el GM (dueño, 2026-10-08); en las pantallas sin partida (el editor del catálogo) se ve.
  const veCalidad = () => typeof fbMiembro === 'undefined' || !fbMiembro || !!fbMiembro.gm;
  const SOLO_ARMA = ['tipoDado', 'danoFijo', 'danoAmplificado', 'armaDeRango', 'efectosGolpe'];
  // Lo que es de la copia (quién la tiene, cómo está puesta) y no del ítem.
  const DE_LA_COPIA = ['id', 'imagen', 'equipado', 'cargaActual', '_bib', 'bibOrigen', 'bibIgnorada', 'manoPreferida', 'compras',
    'estimado', 'clave', 'trofeoDe'];

  const disponible = () => typeof Biblioteca !== 'undefined' && typeof Biblioteca.guardar === 'function';

  // Una copia que guarda la Defensa aparte (creeps, botín) pasa a tenerla como bono, como en el catálogo.
  function normalizar(it){
    const d = clon(it || {});
    d.mods = Array.isArray(d.mods) ? d.mods.filter(m => m && m.stat) : [];
    if(n(d.def) && !d.mods.some(m => m.stat === 'def')) d.mods.unshift({stat: 'def', val: n(d.def)});
    delete d.def;
    return d;
  }
  const mismosBonos = (a, b) => {
    const k = it => JSON.stringify((it.mods || []).filter(m => n(m.val)).map(m => [m.stat, n(m.val)]).sort());
    return k(a) === k(b);
  };
  function delCatalogo(item, catalogo){
    const cat = catalogo || [];
    const nom = typeof sinAviso === 'function' ? sinAviso : (s => s);
    return (item.id && cat.find(c => c.id === item.id)) || cat.find(c => nom(c.nombre) === nom(item.nombre)) || null;
  }

  // La copia, con lo que no trae (rareza, precio, narrativa… en el arma de un creep) sacado del ítem del catálogo del que sale.
  function completar(item, catalogo){
    const copia = normalizar(item);
    const cat = delCatalogo(copia, catalogo);
    if(!cat) return copia;
    const trae = Object.fromEntries(Object.entries(copia).filter(([, v]) => v !== undefined && v !== '' && v !== null));
    return {...normalizar(cat), ...trae};
  }

  // Lista de stats del asistente, más los que ya trae el ítem y no estén (para no perderlos al editar).
  function statsCon(stats, d){
    const out = [...(stats || [])];
    (d.mods || []).forEach(m => { if(m.stat && !out.some(s => s.id === m.stat)) out.push({id: m.stat, label: m.stat}); });
    return out;
  }

  /* ---------- Ventanita propia (elegir copia / catálogo, y el formulario de consumibles) ---------- */
  let raiz = null;
  function montar(){
    if(raiz) return;
    const css = document.createElement('style');
    css.textContent = `
.ei-scrim{position:fixed;inset:0;background:rgba(8,5,7,.78);display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;z-index:99600}
.ei-scrim.open{display:flex}
.ei-modal{width:100%;max-width:500px;background:var(--panel,#1A1418);border:1px solid var(--line,#3B2E34);border-top:3px solid var(--copper,#C98545);border-radius:var(--r,6px);color:var(--paper,#EDE3D2);margin-top:6vh}
.ei-modal header{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 15px;border-bottom:1px solid var(--line,#3B2E34);position:static;background:none}
.ei-modal header h3{margin:0;font-size:17px}
.ei-body{padding:14px 15px;font-size:14px;line-height:1.45}
.ei-body label{display:block;font-size:12.5px;color:var(--muted,#9A867E);margin:10px 0 4px}
.ei-body input,.ei-body select,.ei-body textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid var(--line,#3B2E34);border-radius:6px;color:inherit;padding:7px 9px;font:inherit}
.ei-body textarea{min-height:64px;resize:vertical}
.ei-fila{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ei-nota{font-size:12.5px;color:var(--muted,#9A867E);margin-top:10px}
.ei-modal footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:12px 15px;border-top:1px solid var(--line,#3B2E34)}
.ei-modal footer .btn{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);color:inherit;border-radius:6px;padding:7px 12px;font-weight:600;cursor:pointer}
.ei-modal footer .btn.primary{background:var(--copper,#C98545);border-color:var(--copper,#C98545);color:#180F08}`;
    document.head.appendChild(css);
    raiz = document.createElement('div');
    raiz.className = 'ei-scrim';
    raiz.innerHTML = `<div class="ei-modal"><header><h3 id="ei-titulo"></h3><button type="button" class="btn" data-ei="x" style="border:0;background:none;color:inherit;cursor:pointer">Cerrar</button></header>
      <div class="ei-body" id="ei-body"></div><footer id="ei-pie"></footer></div>`;
    document.body.appendChild(raiz);
    raiz.addEventListener('mousedown', ev => { if(ev.target === raiz) cerrarVentana(); });
    raiz.addEventListener('click', ev => { if(ev.target.closest('[data-ei="x"]')) cerrarVentana(); });
  }
  function cerrarVentana(){ if(raiz) raiz.classList.remove('open'); }
  function ventana(titulo, cuerpo, botones){
    montar();
    raiz.querySelector('#ei-titulo').textContent = titulo;
    raiz.querySelector('#ei-body').innerHTML = cuerpo;
    const pie = raiz.querySelector('#ei-pie');
    pie.innerHTML = botones.map((b, i) => `<button type="button" class="btn${b.primario ? ' primary' : ''}" data-ei-b="${i}">${e(b.texto)}</button>`).join('');
    pie.querySelectorAll('[data-ei-b]').forEach(el => el.onclick = () => botones[n(el.dataset.eiB)].accion());
    raiz.classList.add('open');
  }

  /* ---------- Subir ---------- */
  function subir(item, op){
    op = op || {};
    if(!disponible()){ avisar('La biblioteca compartida no está disponible en esta página'); return; }
    const d = completar(item, op.catalogo);
    if(!String(d.nombre || '').trim()){ avisar('Poné un nombre antes de subirlo al catálogo'); return; }
    if(!d.tipoItem){ avisar('Elegí una categoría antes de subirlo al catálogo'); return; }
    const basadoEn = ItemsSubidos.basadoEn(item, op.catalogo || []);
    DE_LA_COPIA.forEach(k => delete d[k]);
    const datos = typeof Plantillas !== 'undefined' ? Plantillas.limpiar('items', d) : d;
    Biblioteca.guardar({tipo: 'items', datos, nombre: datos.nombre, nivel: 0, basadoEn, alSubir: () => { if(op.alSubir) op.alSubir(); }});
  }

  /* ---------- Editar y subir ---------- */
  function abrir(cfg){
    if(!cfg || !cfg.item) return;
    const copia = normalizar(cfg.item);
    const cat = delCatalogo(copia, cfg.catalogo);
    const completa = completar(cfg.item, cfg.catalogo);
    if(cat && !mismosBonos(copia, cat)){
      ventana(`Editar ${copia.nombre || 'ítem'}`,
        `<p style="margin:0">Esta copia <b>no es igual</b> a la del catálogo actual (tiene otros bonos: puede ser de antes de una corrección).</p>
         <p class="ei-nota">¿Cuál querés editar para subir? Subirla no cambia la copia que estás mirando.</p>`,
        [{texto: 'La del catálogo', accion: () => { cerrarVentana(); editar(cfg, normalizar(cat), cat); }},
         {texto: 'Esta copia', primario: true, accion: () => { cerrarVentana(); editar(cfg, completa, cat); }}]);
      return;
    }
    editar(cfg, completa, cat);
  }

  function editar(cfg, d, cat){
    const opSubir = {catalogo: cfg.catalogo, alSubir: cfg.alSubir};
    // Mismo id que el del catálogo: así "¿corrección o algo nuevo?" lo reconoce aunque se le cambie el nombre.
    const conId = x => cat ? {...x, id: cat.id, _bib: cat._bib} : x;
    if(d.tipoItem === 'consumibles' || !(typeof AsistenteItem !== 'undefined' && AsistenteItem.esCategoriaDelAsistente(d.tipoItem))){
      return formularioSimple(d, datos => subir(conId(datos), opSubir));
    }
    AsistenteItem.abrir({
      contexto: cfg.contexto || 'tienda',
      nuevo: false,
      titulo: `Editar y subir: ${d.nombre || 'ítem'}`,
      draft: d,
      stats: statsCon(cfg.stats, d),
      tiers: veCalidad() ? (cfg.tiers || TIERS) : null,   // los jugadores no ven la calidad (queda la del ítem)
      conNarrativa: true, conPrecio: true, conRanuras: true, conEstadoEquipar: true,
      textoGuardar: '⬆ Subir al catálogo',
      onConsumible: x => formularioSimple({...d, ...x, tipoItem: 'consumibles', consumible: true}, datos => subir(conId(datos), opSubir)),
      onGuardar: x => {
        const item = AsistenteItem.fusionar(d, x);
        if(!AsistenteItem.grupoDe || AsistenteItem.grupoDe(item.tipoItem) !== 'arma') SOLO_ARMA.forEach(k => delete item[k]);
        subir(conId(item), opSubir);
        return true;
      },
    });
  }

  // Consumibles (y cualquier categoría que el asistente no maneje): lo básico a la vista; lo demás (estado al consumir,
  // trampa, efecto especial) viaja tal cual.
  function formularioSimple(d, alSubir){
    const esCons = d.tipoItem === 'consumibles';
    const tiers = [...new Set([...TIERS, d.tier].filter(Boolean))];
    ventana(`Editar y subir: ${d.nombre || 'ítem'}`,
      `<label>Nombre</label><input data-ei-c="nombre" value="${e(d.nombre)}">
       <div class="ei-fila">
         ${veCalidad() ? `<div><label>Rareza</label><select data-ei-c="tier">${tiers.map(t => `<option ${t === d.tier ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></div>` : ''}
         <div><label>Precio</label><input type="number" data-ei-c="precioCompra" value="${e(n(d.precioCompra))}"></div>
         ${esCons ? `<div><label>Unidades</label><input type="number" data-ei-c="unidades" value="${e(n(d.unidades) || 1)}"></div>` : `<div><label>Peso</label><input type="number" data-ei-c="peso" value="${e(n(d.peso))}"></div>`}
       </div>
       ${esCons ? `<div class="ei-fila">
         <div><label>HP al consumir</label><input type="number" data-ei-c="curahp" value="${e(n(d.curahp))}"></div>
         <div><label>Cargas</label><input type="number" data-ei-c="cargaMax" value="${e(n(d.cargaMax))}"></div>
         <div><label>Ranuras</label><input type="number" data-ei-c="ranuras" value="${e(n(d.ranuras))}"></div>
       </div>` : ''}
       <label>Detalle (qué hace)</label><textarea data-ei-c="detalle">${e(d.detalle)}</textarea>
       <label>Descripción narrativa</label><textarea data-ei-c="descripcionNarrativa">${e(d.descripcionNarrativa)}</textarea>
       <div class="ei-nota">${esCons ? 'El estado al consumir, la trampa y los efectos especiales se suben tal cual están. ' : ''}Subirlo no cambia la copia que estás mirando: va a la biblioteca compartida, que pregunta si es una corrección del ítem del catálogo o algo nuevo.</div>`,
      [{texto: 'Cancelar', accion: cerrarVentana},
       {texto: '⬆ Subir al catálogo', primario: true, accion: () => {
         const x = {...d};
         raiz.querySelectorAll('[data-ei-c]').forEach(el => { const k = el.dataset.eiC; x[k] = el.type === 'number' ? n(el.value) : el.value; });
         x.nombre = String(x.nombre || '').trim();
         cerrarVentana();
         alSubir(x);
       }}]);
  }

  return {abrir, subir, disponible};
})();
