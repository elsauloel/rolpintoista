/* comun/filtro-catalogo.js — FiltroCatalogo: el filtro del catálogo, una sola pieza para todos lados (2026-10-08, dueño: «hay que ponerle onda,
   no era muy claro» + «un rango de precio» + en la tienda del jugador, «slots libres»).
   Antes había cinco filtros distintos (la tienda de la ficha y la del mapa, el «Agregar ítems» del generador de tiendas, el catálogo de GM Tools y
   el editor del catálogo), con cuatro maneras de agrupar y cuatro búsquedas. Ahora: un buscador (todas las palabras: nombre, efecto, bonos), chips
   con cuántos ítems quedan (qué es / dónde va, calidad, una o dos manos, lugar libre), el orden, «Más filtros» (Tipo de arma, elemento, qué sube,
   efecto al golpear, efecto escaso, de fábrica o del grupo, precio desde–hasta, peso) y «23 de 410 ítems · ✕ Limpiar todo».
   Qué es cada ítem lo dice GeneradorTiendas.parteDe (una sola clasificación: la misma con la que se arman las tiendas).

   FiltroCatalogo.crear(contenedor, cfg) dibuja el filtro adentro de `contenedor` (sirve dentro de un recuadro aislado: trae su propio CSS) y devuelve
   {f, filtrar(), agrupar(lista), actualizar(), limpiar(), activos(), dibujar()}.
   cfg = {base() → los ítems entre los que se filtra (lo que vende la tienda, el catálogo…), precio(it)? (el de la tienda, con su ajuste),
          libre(it)? → true / false / null (¿tiene libre el lugar del cuerpo donde va? null = no va en el cuerpo; sin esta función no hay chip),
          statLabel(st)?, etiquetas? (true: el filtro «Efecto escaso», para el GM), origen? (true: «de fábrica / del grupo»),
          calidad? (false: sin los chips de calidad ni el orden por calidad — los jugadores no ven la calidad, dueño 2026-10-08),
          ordenes? (claves de ORDENES a ofrecer), inicial? (valores de arranque), clave? (para recordar «Más filtros» abierto y el orden),
          alCambiar()}
   El que filtra también sirve suelto: FiltroCatalogo.pasa(it, f, ctx), ordenar(lista, f, ctx), agrupar(lista, f). */
const FiltroCatalogo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n * 100) / 100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const sinAcentos = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const G = () => (typeof GeneradorTiendas !== 'undefined' ? GeneradorTiendas : null);

  const TIERS = ['Común', 'Buena Calidad', 'Raro', 'Excepcional', 'Legendario'];
  const TIER_ETQ = {'Común': 'Común', 'Buena Calidad': 'Buena', 'Raro': 'Raro', 'Excepcional': 'Excepcional', 'Legendario': 'Legendario'};
  const TIER_COLOR = {'Común': '#9A867E', 'Buena Calidad': '#A8C256', 'Raro': '#5B8DBE', 'Excepcional': '#E0A458', 'Legendario': '#9B7BD4', 'A definir': '#D4574E'};
  // Qué es / dónde va: en el orden en que se muestran, con su ícono.
  const PARTES = [['arma', '⚔'], ['distancia', '🏹'], ['especial', '✨'], ['escudo', '🛡'], ['orbe', '🔮'], ['torso', '🦺'], ['cabeza', '🪖'], ['manos', '🧤'],
    ['piernas', '👖'], ['pies', '🥾'], ['cinturon', '🎗'], ['mochila', '🎒'], ['anillo', '💍'], ['consumible', '🧪'], ['trampa', '🪤'], ['otro', '📦']];
  const PARTE_ETQ = {arma: 'Armas', distancia: 'A distancia', especial: 'Varitas y báculos', escudo: 'Escudos', orbe: 'Orbes', torso: 'Torso', cabeza: 'Cabeza',
    manos: 'Manos', piernas: 'Piernas', pies: 'Pies', cinturon: 'Cinturón', mochila: 'Mochila', anillo: 'Anillos', consumible: 'Consumibles', trampa: 'Trampas', otro: 'Otros'};
  const ELEMENTOS = [['fisico', '🗡', 'Físico'], ['arcano', '✨', 'Arcano'], ['fuego', '🔥', 'Fuego'], ['hielo', '❄', 'Hielo'], ['rayo', '⚡', 'Eléctrico'],
    ['toxico', '☠', 'Tóxico'], ['acido', '🧪', 'Ácido']];
  const TIPOS_ARMA = [4, 6, 8, 10, 12];
  const ORDENES = {categoria: 'Por tipo', nombre: 'Nombre', precio: 'Precio', rareza: 'Calidad', peso: 'Peso', dano: 'Daño', defensa: 'Defensa'};

  const parteDe = it => { const g = G(); return g ? g.parteDe(it) : 'otro'; };
  const esArma = it => String((it && it.tipoItem) || '').startsWith('arma_');
  const manosDe = it => { const m = /_(1|2)m$/.exec(String((it && it.tipoItem) || '')); return m ? m[1] : ''; };
  // El daño que hace un ítem: físico (un arma común), el de una varita (y sus modos), el mágico de un arma y el de una trampa.
  const elemCache = new WeakMap();
  function elementosDe(it){
    let s = elemCache.get(it);
    if(s) return s;
    s = new Set();
    const add = t => {
      const el = typeof Combatiente !== 'undefined' ? Combatiente.elementoDe(t) : '';
      if(el) s.add(el); else if(/arcan/i.test(t || '')) s.add('arcano'); else if(/f[ií]sic/i.test(t || '')) s.add('fisico');
    };
    const e = it.especial || {};
    [e, ...(e.modos || [])].forEach(x => { if(x && x.duelo && x.duelo.tipoDano) add(x.duelo.tipoDano); });
    (it.efectosGolpe || []).forEach(g => { if(g && g.danoMagico) add(g.nombre); });
    if(it.trampaDatos && it.trampaDatos.elemento) add(it.trampaDatos.elemento);
    if(esArma(it) && !it.especial) s.add('fisico');
    elemCache.set(it, s);
    return s;
  }
  const subeStat = (it, st) => (it.mods || []).some(m => m && m.stat === st && num(m.val) > 0);
  const golpesDe = it => (it.efectosGolpe || []).map(g => g && String(g.nombre || '').trim()).filter(Boolean);
  const etiquetasDe = it => { const g = G(); return g && g.etiquetasDe ? g.etiquetasDe(it) : []; };
  function danoDe(it){   // el daño máximo de un arma (lo que no es arma: 0, al final)
    if(!esArma(it) || it.especial) return 0;
    const dados = Math.max(1, num(it.peso) || 1) + Math.max(0, num(it.danoAmplificado));
    return dados * (num(it.tipoDado) || 8) + num(it.danoFijo);
  }
  const defensaDe = it => (it.mods || []).filter(m => m && m.stat === 'def').reduce((a, m) => a + num(m.val), 0) || num(it.def);
  function statLabelDe(st){
    if(typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_LABEL && FichaCalculo.STAT_LABEL[st]) return FichaCalculo.STAT_LABEL[st];
    if(typeof CreepCalculo !== 'undefined' && CreepCalculo.STAT_LABEL && CreepCalculo.STAT_LABEL[st]) return CreepCalculo.STAT_LABEL[st];
    if(typeof STAT_LABEL !== 'undefined' && STAT_LABEL && STAT_LABEL[st]) return STAT_LABEL[st];
    return st;
  }
  // El texto en el que busca el buscador: nombre, detalle, narrativa, efectos, calidad, qué es y los bonos con su nombre legible.
  const textoCache = new WeakMap();
  function textoDe(it, statLabel){
    let t = textoCache.get(it);
    if(t !== undefined) return t;
    const partes = [it.nombre, it.detalle, it.descripcionNarrativa, it.efectoNombre, it.efectoDetalle, it.equipoEstadoNombre, it.equipoEstadoDetalle,
      it.equipoEstadoPreset, PARTE_ETQ[parteDe(it)], ...golpesDe(it), it.especial && it.especial.nombre];
    if(typeof FichaEquipo !== 'undefined' && FichaEquipo.CATEGORIA_LABEL) partes.push(FichaEquipo.CATEGORIA_LABEL[it.tipoItem]);
    [...(it.mods || []), ...(it.efectoMods || [])].forEach(m => { if(m && m.stat){ partes.push((statLabel || statLabelDe)(m.stat)); if(typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_FULL) partes.push(FichaCalculo.STAT_FULL[m.stat]); } });
    t = sinAcentos(partes.filter(Boolean).join(' '));
    textoCache.set(it, t);
    return t;
  }

  const vacio = () => ({buscar: '', parte: '', manos: '', tier: '', libre: false, tipo: '', elemento: '', bono: '', golpe: '', etiqueta: '', origen: '',
    pMin: '', pMax: '', pesoMax: '', orden: 'categoria', desc: false});
  const CLAVES_FILTRO = ['buscar', 'parte', 'manos', 'tier', 'libre', 'tipo', 'elemento', 'bono', 'golpe', 'etiqueta', 'origen', 'pMin', 'pMax', 'pesoMax'];
  const CLAVES_MAS = ['tipo', 'elemento', 'bono', 'golpe', 'etiqueta', 'origen', 'pMin', 'pMax', 'pesoMax'];
  const activo = (f, k) => k === 'libre' ? !!f.libre : String(f[k] ?? '').trim() !== '';
  const cuantos = f => CLAVES_FILTRO.filter(k => activo(f, k)).length;   // cuántos filtros hay puestos

  // ¿Pasa el ítem los filtros? `salvo`: un filtro que no se mira (para contar cuántos quedarían con cada chip).
  function pasa(it, f, ctx, salvo){
    ctx = ctx || {};
    const mira = k => k !== salvo && activo(f, k);
    if(mira('parte') && parteDe(it) !== f.parte) return false;
    if(mira('tier') && it.tier !== f.tier) return false;
    if(mira('manos') && manosDe(it) !== String(f.manos)) return false;
    if(mira('libre') && !(ctx.libre && ctx.libre(it) === true)) return false;
    if(mira('tipo') && !(esArma(it) && !it.especial && num(it.tipoDado) === num(f.tipo))) return false;
    if(mira('elemento') && !elementosDe(it).has(f.elemento)) return false;
    if(mira('bono') && !subeStat(it, f.bono)) return false;
    if(mira('golpe') && !golpesDe(it).some(n => sinAcentos(n) === sinAcentos(f.golpe))) return false;
    if(mira('etiqueta') && !etiquetasDe(it).includes(f.etiqueta)) return false;
    if(mira('origen') && (f.origen === 'grupo') !== !!it._bib) return false;
    if(mira('pMin') || mira('pMax')){
      const p = ctx.precio ? ctx.precio(it) : num(it.precioCompra);
      if(mira('pMin') && p < num(f.pMin)) return false;
      if(mira('pMax') && p > num(f.pMax)) return false;
    }
    if(mira('pesoMax') && num(it.peso) > num(f.pesoMax)) return false;
    if(mira('buscar')){
      const palabras = sinAcentos(f.buscar).split(/\s+/).filter(Boolean), hay = textoDe(it, ctx.statLabel);
      if(!palabras.every(p => hay.includes(p))) return false;
    }
    return true;
  }
  // El orden. Daño y Defensa: lo que no tiene, siempre al final.
  function ordenar(lista, f, ctx){
    ctx = ctx || {};
    const porNombre = (a, b) => String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    const tierIdx = it => { const i = TIERS.indexOf(it.tier); return i < 0 ? 99 : i; };
    const parteIdx = it => PARTES.findIndex(p => p[0] === parteDe(it));
    const precio = it => ctx.precio ? ctx.precio(it) : num(it.precioCompra);
    const o = f.orden || 'categoria';
    if(o === 'dano' || o === 'defensa'){
      const val = o === 'dano' ? danoDe : defensaDe;
      const con = lista.filter(i => val(i) > 0), sin = lista.filter(i => val(i) <= 0).sort(porNombre);
      con.sort((a, b) => val(a) - val(b) || porNombre(a, b));
      if(f.desc) con.reverse();
      return [...con, ...sin];
    }
    // Sin calidad (los jugadores), ni el orden la delata: «Por tipo» va por nombre adentro de cada tipo.
    const porTier = ctx.sinCalidad ? () => 0 : (a, b) => tierIdx(a) - tierIdx(b);
    const cmp = {categoria: (a, b) => parteIdx(a) - parteIdx(b) || porTier(a, b), nombre: () => 0, precio: (a, b) => precio(a) - precio(b),
      rareza: porTier, peso: (a, b) => num(a.peso) - num(b.peso)}[o] || (() => 0);
    const l = lista.slice().sort((a, b) => cmp(a, b) || porNombre(a, b));
    return f.desc ? l.reverse() : l;
  }
  // Agrupado por qué es (con «Por tipo»); con otro orden, un solo grupo.
  function agrupar(lista, f){
    if((f.orden || 'categoria') !== 'categoria') return [{clave: '', label: ORDENES[f.orden] || '', items: lista}];
    const grupos = new Map();
    lista.forEach(it => { const p = parteDe(it); if(!grupos.has(p)) grupos.set(p, []); grupos.get(p).push(it); });
    const orden = PARTES.map(p => p[0]);
    return [...grupos.keys()].sort((a, b) => orden.indexOf(a) - orden.indexOf(b))
      .map(p => ({clave: p, label: `${(PARTES.find(x => x[0] === p) || [, ''])[1]} ${PARTE_ETQ[p] || p}`.trim(), items: grupos.get(p)}));
  }

  const CSS = `
  .fc{display:flex;flex-direction:column;gap:7px;font-size:13px;color:var(--paper,#EDE3D2)}
  .fc *{box-sizing:border-box}
  .fc-arriba{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .fc-buscar{flex:1 1 260px;display:flex;align-items:center;gap:6px;background:rgba(0,0,0,.3);border:1px solid var(--line,#3B2E34);border-radius:999px;padding:3px 12px}
  .fc-buscar:focus-within{border-color:var(--copper,#C98545);box-shadow:0 0 0 2px rgba(201,133,69,.25)}
  .fc-buscar input{flex:1;min-width:0;width:auto;background:none!important;border:0!important;outline:none;color:inherit;font:inherit;padding:5px 0;box-shadow:none!important}
  .fc-buscar button{background:none;border:0;color:var(--muted,#9A867E);cursor:pointer;font-size:14px;padding:0 2px}
  .fc-orden{display:flex;align-items:center;gap:5px;flex:none}
  .fc-orden span{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#9A867E)}
  .fc-orden select{width:auto;min-width:0;background:rgba(0,0,0,.3);border:1px solid var(--line,#3B2E34);border-radius:6px;color:inherit;font:inherit;padding:4px 6px}
  .fc-btn{background:rgba(255,255,255,.04);border:1px solid var(--line,#3B2E34);border-radius:6px;color:inherit;font:inherit;font-size:12px;padding:4px 9px;cursor:pointer;white-space:nowrap}
  .fc-btn:hover{border-color:var(--copper,#C98545)}
  .fc-btn.on{background:rgba(201,133,69,.22);border-color:var(--copper,#C98545)}
  .fc-fila{display:flex;flex-wrap:wrap;gap:5px;align-items:center}
  .fc-sep{width:1px;align-self:stretch;background:var(--line,#3B2E34);margin:0 4px}
  .fc-etq{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#9A867E);margin-right:2px}
  .fc-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,.035);border:1px solid var(--line,#3B2E34);border-radius:999px;color:inherit;
    font:inherit;font-size:12px;line-height:1.2;padding:4px 10px;cursor:pointer;transition:background .12s,border-color .12s,transform .08s;white-space:nowrap}
  .fc-chip:hover{border-color:var(--chip,var(--copper,#C98545));background:rgba(255,255,255,.07)}
  .fc-chip:active{transform:scale(.96)}
  .fc-chip b{font-family:"Space Mono",monospace;font-size:10.5px;font-weight:400;color:var(--muted,#9A867E)}
  .fc-chip.on{background:var(--chip-bg,rgba(201,133,69,.28));border-color:var(--chip,var(--copper,#C98545));color:#fff;box-shadow:0 0 0 1px var(--chip,var(--copper,#C98545)) inset}
  .fc-chip.on b{color:#fff;opacity:.85}
  .fc-chip.cero{opacity:.38}
  .fc-chip.tier{border-color:color-mix(in srgb, var(--chip) 55%, transparent)}
  .fc-chip.tier .fc-punto{width:8px;height:8px;border-radius:50%;background:var(--chip)}
  .fc-chip.libre.on{--chip:#3fb27f;--chip-bg:rgba(63,178,127,.28)}
  .fc-mas{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px 14px;padding:9px 10px;border:1px dashed var(--line,#3B2E34);border-radius:8px;background:rgba(0,0,0,.18)}
  .fc-mas[hidden]{display:none}
  .fc-campo{display:flex;flex-direction:column;gap:4px;min-width:0}
  .fc-campo.ancho{grid-column:1/-1}
  .fc-campo select,.fc-campo input{width:100%;min-width:0;background:rgba(0,0,0,.3);border:1px solid var(--line,#3B2E34);border-radius:6px;color:inherit;font:inherit;padding:4px 7px}
  .fc-rango{display:flex;align-items:center;gap:6px}
  .fc-rango input{width:90px!important;flex:none}
  .fc-pie{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
  .fc-cuenta{font-family:"Space Mono",monospace;font-size:11.5px;color:var(--muted,#9A867E)}
  .fc-cuenta b{color:var(--paper,#EDE3D2);font-size:13px}
  .fc-pie .fc-esp{flex:1}
  .fc-limpiar{color:#ffb4a8;border-color:rgba(212,87,78,.55)}
  `;

  function crear(cont, cfg){
    cfg = cfg || {};
    const ctx = {precio: cfg.precio, libre: cfg.libre, statLabel: cfg.statLabel, sinCalidad: cfg.calidad === false};
    const f = Object.assign(vacio(), cfg.inicial || {});
    let masAbierto = false;
    const guardado = () => { try{ return cfg.clave ? JSON.parse(localStorage.getItem('filtro-' + cfg.clave) || 'null') : null; }catch(e){ return null; } };
    const recordar = () => { try{ if(cfg.clave) localStorage.setItem('filtro-' + cfg.clave, JSON.stringify({mas: masAbierto, orden: f.orden, desc: f.desc})); }catch(e){} };
    const g0 = guardado();
    if(g0){ masAbierto = !!g0.mas; if(g0.orden && ORDENES[g0.orden]) f.orden = g0.orden; f.desc = !!g0.desc; }
    const conCalidad = cfg.calidad !== false;
    const ordenes = (cfg.ordenes || Object.keys(ORDENES)).filter(k => ORDENES[k] && (conCalidad || k !== 'rareza'));
    if(!ordenes.includes(f.orden)) f.orden = ordenes[0];
    const base = () => { try{ return (cfg.base ? cfg.base() : []) || []; }catch(e){ console.error(e); return []; } };
    const q = s => cont.querySelector(s);

    cont.innerHTML = `<div class="fc"><style>${CSS}</style>
      <div class="fc-arriba">
        <label class="fc-buscar"><span>🔍</span><input type="text" data-fc="buscar" placeholder="Buscar por nombre, efecto o bono (ej.: veneno, evasión, hacha)…" autocomplete="off">
          <button type="button" data-fc-accion="borrar-busqueda" title="Borrar la búsqueda" hidden>✕</button></label>
        <div class="fc-orden"><span>Ordenar</span><select data-fc="orden">${ordenes.map(k => `<option value="${k}">${esc(ORDENES[k])}</option>`).join('')}</select>
          <button type="button" class="fc-btn" data-fc-accion="desc"></button></div>
      </div>
      <div class="fc-fila" data-fc-zona="parte"></div>
      <div class="fc-fila" data-fc-zona="fila2"></div>
      <div class="fc-mas" data-fc-zona="mas" hidden>
        <div class="fc-campo"><span class="fc-etq">Tipo de arma</span><div class="fc-fila" data-fc-zona="tipo"></div></div>
        <div class="fc-campo"><span class="fc-etq">Daño</span><div class="fc-fila" data-fc-zona="elemento"></div></div>
        <div class="fc-campo"><span class="fc-etq">Que suba</span><select data-fc="bono"></select></div>
        <div class="fc-campo"><span class="fc-etq">Efecto al golpear</span><select data-fc="golpe"></select></div>
        ${cfg.etiquetas ? `<div class="fc-campo"><span class="fc-etq">Efecto escaso</span><select data-fc="etiqueta"></select></div>` : ''}
        ${cfg.origen ? `<div class="fc-campo"><span class="fc-etq">De dónde sale</span><div class="fc-fila" data-fc-zona="origen"></div></div>` : ''}
        <div class="fc-campo"><span class="fc-etq">Precio (DDE)</span><div class="fc-rango"><input type="number" min="0" data-fc="pMin" placeholder="desde"> – <input type="number" min="0" data-fc="pMax" placeholder="hasta"></div></div>
        <div class="fc-campo"><span class="fc-etq">Peso</span><div class="fc-rango">hasta <input type="number" min="0" step="0.5" data-fc="pesoMax" placeholder="cualquiera"></div></div>
      </div>
      <div class="fc-pie"><span class="fc-cuenta" data-fc-zona="cuenta"></span><span class="fc-esp"></span>
        <button type="button" class="fc-btn" data-fc-accion="mas"></button>
        <button type="button" class="fc-btn fc-limpiar" data-fc-accion="limpiar" hidden>✕ Limpiar todo</button></div>
    </div>`;

    // Las opciones de los desplegables salen de los ítems que hay (solo los bonos y efectos que alguno tiene).
    function opciones(){
      const items = base();
      const sel = (k, vacioTxt, lista) => {
        const el = q(`[data-fc="${k}"]`);
        if(!el) return;
        if(f[k] && !lista.some(x => x[0] === f[k])) lista.push([f[k], f[k]]);
        el.innerHTML = `<option value="">${esc(vacioTxt)}</option>` + lista.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
        el.value = f[k] || '';
      };
      const stats = [...new Set(items.flatMap(it => (it.mods || []).filter(m => m && m.stat && num(m.val) > 0).map(m => m.stat)))];
      sel('bono', 'Cualquier cosa', stats.map(st => [st, (cfg.statLabel || statLabelDe)(st)]).sort((a, b) => a[1].localeCompare(b[1], 'es')));
      const golpes = new Map();
      items.forEach(it => golpesDe(it).forEach(n => { const k = sinAcentos(n); if(!golpes.has(k)) golpes.set(k, n); }));
      sel('golpe', 'Cualquiera', [...golpes.values()].sort((a, b) => a.localeCompare(b, 'es')).map(n => [n, n]));
      if(cfg.etiquetas && G() && G().ETIQUETAS) sel('etiqueta', 'Cualquiera', Object.keys(G().ETIQUETAS).map(k => [k, k]));
    }
    // Un chip: su texto, cuántos ítems quedarían y si está prendido.
    const chip = (k, v, html, n, extra) => {
      const on = k === 'libre' ? !!f.libre : String(f[k]) === String(v) && v !== '';
      const todo = v === '' && k !== 'libre';
      const prendido = todo ? !activo(f, k) : on;
      return `<button type="button" class="fc-chip ${extra && extra.clase || ''}${prendido ? ' on' : ''}${!prendido && n === 0 ? ' cero' : ''}" data-fc-chip="${k}" data-v="${esc(v)}"
        ${extra && extra.color ? `style="--chip:${extra.color};--chip-bg:${extra.color}40"` : ''} ${extra && extra.titulo ? `title="${esc(extra.titulo)}"` : ''}>${html}${n !== null ? ` <b>${fmt(n)}</b>` : ''}</button>`;
    };
    // Cuántos quedan para cada valor de un filtro, mirando todos los demás.
    const conteo = (items, k, valorDe) => {
      const c = new Map();
      let total = 0;
      items.forEach(it => { if(!pasa(it, f, ctx, k)) return; total++; [].concat(valorDe(it)).forEach(v => { if(v !== '' && v !== null && v !== undefined) c.set(String(v), (c.get(String(v)) || 0) + 1); }); });
      return {c, total};
    };
    function dibujar(){
      const items = base();
      // Qué es / dónde va
      const cp = conteo(items, 'parte', parteDe);
      q('[data-fc-zona="parte"]').innerHTML = chip('parte', '', 'Todo', cp.total)
        + PARTES.filter(([p]) => cp.c.get(p) || f.parte === p).map(([p, ic]) => chip('parte', p, `${ic} ${esc(PARTE_ETQ[p])}`, cp.c.get(p) || 0)).join('');
      // Calidad · manos · lugar libre
      const ct = conteo(items, 'tier', it => it.tier || '');
      const tiers = TIERS.filter(t => ct.c.get(t) || f.tier === t);
      const cm = conteo(items, 'manos', manosDe);
      let fila2 = !conCalidad ? '' : `<span class="fc-etq">Calidad</span>` + tiers.map(t => chip('tier', t, `<span class="fc-punto"></span>${esc(TIER_ETQ[t] || t)}`, ct.c.get(t) || 0,
        {clase: 'tier', color: TIER_COLOR[t]})).join('');
      if(cm.c.get('1') || cm.c.get('2') || f.manos) fila2 += `${fila2 ? '<span class="fc-sep"></span>' : ''}<span class="fc-etq">Empuñadura</span>`
        + chip('manos', '1', '✋ Una mano', cm.c.get('1') || 0, {titulo: 'Armas y escudos de una mano'}) + chip('manos', '2', '🙌 Dos manos', cm.c.get('2') || 0, {titulo: 'Armas y escudos de dos manos'});
      if(cfg.libre){
        const cl = conteo(items, 'libre', it => cfg.libre(it) === true ? 'si' : '');
        fila2 += (fila2 ? `<span class="fc-sep"></span>` : '') + chip('libre', 'si', '🟢 Lugar libre', cl.c.get('si') || 0,
          {clase: 'libre', titulo: 'Solo lo que te podés equipar sin sacarte nada: el lugar del cuerpo donde va lo tenés libre'});
      }
      q('[data-fc-zona="fila2"]').innerHTML = fila2;
      // Más filtros: Tipo de arma, daño, origen
      const cTipo = conteo(items, 'tipo', it => esArma(it) && !it.especial ? num(it.tipoDado) : '');
      q('[data-fc-zona="tipo"]').innerHTML = TIPOS_ARMA.map(t => chip('tipo', t, `Tipo ${t}`, cTipo.c.get(String(t)) || 0)).join('');
      const cEl = conteo(items, 'elemento', it => [...elementosDe(it)]);
      q('[data-fc-zona="elemento"]').innerHTML = ELEMENTOS.filter(([e]) => cEl.c.get(e) || f.elemento === e).map(([e, ic, l]) => chip('elemento', e, `${ic} ${l}`, cEl.c.get(e) || 0)).join('')
        || '<span class="fc-etq">—</span>';
      if(cfg.origen){
        const cO = conteo(items, 'origen', it => it._bib ? 'grupo' : 'fabrica');
        q('[data-fc-zona="origen"]').innerHTML = chip('origen', 'fabrica', '🏭 De fábrica', cO.c.get('fabrica') || 0) + chip('origen', 'grupo', '👥 Subido por el grupo', cO.c.get('grupo') || 0);
      }
      // Pie
      const quedan = items.filter(it => pasa(it, f, ctx)).length, n = activos();
      q('[data-fc-zona="cuenta"]').innerHTML = `<b>${fmt(quedan)}</b> de ${fmt(items.length)} ítems${n ? ` · ${n} filtro${n === 1 ? '' : 's'}` : ''}`;
      const nMas = CLAVES_MAS.filter(k => activo(f, k)).length;
      q('[data-fc-accion="mas"]').textContent = `⚙ Más filtros${nMas ? ` (${nMas})` : ''} ${masAbierto ? '▴' : '▾'}`;
      q('[data-fc-accion="mas"]').classList.toggle('on', nMas > 0);
      q('[data-fc-zona="mas"]').hidden = !masAbierto;
      q('[data-fc-accion="limpiar"]').hidden = !n;
      q('[data-fc-accion="borrar-busqueda"]').hidden = !f.buscar;
      q('[data-fc-accion="desc"]').textContent = f.desc ? '↓ Mayor a menor' : '↑ Menor a mayor';
      q('[data-fc="orden"]').value = f.orden;
      ['pMin', 'pMax', 'pesoMax'].forEach(k => { const el = q(`[data-fc="${k}"]`); if(el && document.activeElement !== el && el.value !== String(f[k])) el.value = f[k]; });
      const b = q('[data-fc="buscar"]');
      if(b && b.value !== f.buscar && !(b.getRootNode().activeElement === b)) b.value = f.buscar;
    }
    const cambio = () => { dibujar(); try{ cfg.alCambiar && cfg.alCambiar(); }catch(e){ console.error(e); } };

    cont.addEventListener('click', e => {
      const ch = e.target.closest('[data-fc-chip]');
      if(ch){
        const k = ch.dataset.fcChip, v = ch.dataset.v;
        if(k === 'libre') f.libre = !f.libre;
        else f[k] = v === '' || String(f[k]) === v ? '' : v;
        cambio();
        return;
      }
      const a = e.target.closest('[data-fc-accion]');
      if(!a) return;
      const ac = a.dataset.fcAccion;
      if(ac === 'mas'){ masAbierto = !masAbierto; recordar(); dibujar(); return; }
      if(ac === 'desc'){ f.desc = !f.desc; recordar(); cambio(); return; }
      if(ac === 'limpiar'){ limpiar(); cambio(); return; }
      if(ac === 'borrar-busqueda'){ f.buscar = ''; const b = q('[data-fc="buscar"]'); if(b){ b.value = ''; b.focus(); } cambio(); }
    });
    let tBuscar = null;
    cont.addEventListener('input', e => {
      const el = e.target.closest('[data-fc]');
      if(!el) return;
      const k = el.dataset.fc;
      if(k === 'buscar'){ f.buscar = el.value; clearTimeout(tBuscar); tBuscar = setTimeout(cambio, 120); return; }
      if(k === 'pMin' || k === 'pMax' || k === 'pesoMax'){ f[k] = el.value; clearTimeout(tBuscar); tBuscar = setTimeout(cambio, 200); }
    });
    cont.addEventListener('change', e => {
      const el = e.target.closest('[data-fc]');
      if(!el) return;
      const k = el.dataset.fc;
      if(k === 'orden'){ f.orden = el.value; recordar(); cambio(); return; }
      if(k === 'bono' || k === 'golpe' || k === 'etiqueta'){ f[k] = el.value; cambio(); }
    });

    function activos(){ return cuantos(f); }
    function limpiar(){
      CLAVES_FILTRO.forEach(k => { f[k] = k === 'libre' ? false : ''; });
      cont.querySelectorAll('[data-fc]').forEach(el => { if(el.dataset.fc !== 'orden') el.value = ''; });
      dibujar();
    }
    function filtrar(){ return ordenar(base().filter(it => pasa(it, f, ctx)), f, ctx); }
    function actualizar(){ opciones(); dibujar(); }
    actualizar();
    return {f, filtrar, agrupar: lista => agrupar(lista, f), actualizar, limpiar, activos, dibujar};
  }

  return {crear, pasa, ordenar, agrupar, vacio, cuantos, parteDe, elementosDe, danoDe, defensaDe, textoDe, PARTES, PARTE_ETQ, ORDENES, TIERS, CSS};
})();
