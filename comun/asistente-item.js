/* =========================================================
   ASISTENTE DE ÍTEMS (compartido)
   Crear o editar un ítem de equipo paso a paso, explicando en cada paso qué
   implica lo que se elige. Paso 1: categoría, nombre y la descripción en
   palabras (todo lo que hace el ítem). Después, solo los pasos con
   aplicación práctica para esa categoría:
     armas     Tipo · empuñadura · peso y daño · bonos · efectos al golpear
     defensa   defensa y resistencias a crítico · bonos
     el resto  bonos
   y al final estado al equipar, precio/lugar y resumen. Los consumibles no
   pasan por acá: cfg.onConsumible los manda al formulario de cada herramienta.
   Necesita comun/efectos-golpe.js (efectos al golpear).

   Lo usan ficha.html (inventario y catálogo), gm-tools.html (arma de un
   creep e ítem custom), vendor-generator.html y catalogo-editor.html.

   AsistenteItem.abrir(cfg) — cfg:
     contexto    'ficha' | 'creep' | 'tienda' | 'catalogo' (cambia los textos)
     nuevo       true al crear (Guardar recién en el último paso)
     draft       el ítem (campos del catálogo: nombre, tipoItem, detalle, mods,
                 tipoDado, peso, danoFijo, danoAmplificado, armaDeRango,
                 efectosGolpe, tier, descripcionNarrativa, precioCompra,
                 ranuras, imagen, equipado, manoPreferida, equipoEstado*)
     categorias  ids de tipoItem que se pueden elegir (null = todos)
     fijarCategoria  true = no se puede cambiar la categoría (ej. arma del creep)
     stats       [{id, label}] para la lista de bonos
     tiers       lista de tiers (null = no se pide)
     destinos    {label, opciones:[{v, l}], valor, nota} (ej. a qué creep) — opcional
     portador    destino => {nombre, nitros, dmg, rango, def, cargaUsada, cargaMax,
                 manosUsadas} de quien lo va a usar — opcional
     ejemplos    (tipoItem, tipoDado) => [nombres] del catálogo — opcional
     conPrecio, conRanuras, conNarrativa, conImagen, conEstadoEquipar,
     conPresetEstado, conLugar (equipado / mochila), conMano (mano preferida)
     imagenADatos file => Promise<dataURL> — opcional (si no, se lee tal cual)
     precioTxt   d => texto extra sobre el precio — opcional
     botones     [{texto, accion(d, boton)}] extra en el pie — opcional
     textoGuardar, onGuardar(d, destino) → false para no cerrar
     onFormulario(d) — si está, el resumen ofrece el formulario completo
     onConsumible(d) — al elegir la categoría Consumibles
   ========================================================= */
const AsistenteItem = (() => {
  const DADOS = [4, 6, 8, 10, 12];
  const TIPOS = {
    4: {nombre: 'Perforante', ejemplo: 'dagas, estoques, lanzas livianas'},
    6: {nombre: 'Cortante', ejemplo: 'espadas, cimitarras, hachas de mano'},
    8: {nombre: 'Cortante pesado o contundente liviano', ejemplo: 'hachas de guerra, mazas, bastones'},
    10: {nombre: 'Contundente pesado', ejemplo: 'martillos de guerra, mazas de dos manos'},
    12: {nombre: 'Explosivo / armas modernas', ejemplo: 'lanzallamas, explosivos (tier Excepcional)'},
  };
  const CATEGORIAS = [
    {id: 'arma_1m', label: 'Arma de una mano', grupo: 'arma'},
    {id: 'arma_2m', label: 'Arma de dos manos', grupo: 'arma'},
    {id: 'escudo_1m', label: 'Escudo de una mano', grupo: 'defensa'},
    {id: 'escudo_2m', label: 'Escudo de dos manos', grupo: 'defensa'},
    {id: 'armadura_blanda', label: 'Armadura blanda', grupo: 'defensa'},
    {id: 'armadura_rigida', label: 'Armadura rígida', grupo: 'defensa'},
    {id: 'cabeza', label: 'Cabeza', grupo: 'defensa'},
    {id: 'manos', label: 'Manos', grupo: 'defensa'},
    {id: 'piernas', label: 'Piernas', grupo: 'defensa'},
    {id: 'pies', label: 'Pies', grupo: 'defensa'},
    {id: 'cinturon', label: 'Cinturón', grupo: 'accesorio'},
    {id: 'anillos', label: 'Anillo', grupo: 'accesorio'},
    {id: 'otros', label: 'Otro', grupo: 'otro'},
    {id: 'consumibles', label: 'Consumible', grupo: 'consumible'},
  ];
  const GRUPO_TITULO = {arma: 'Armas', defensa: 'Defensa', accesorio: 'Accesorios', otro: 'Otros', consumible: 'Consumibles'};
  const RAPIDOS = {
    arma: [['pdg', 'PdG'], ['crit', 'Crítico'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['dmg', 'Dmg']],
    defensa: [['eva', 'Evasión'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['hpmax', 'HP máx.'], ['mov', 'Movimiento']],
    accesorio: [['con', 'Con'], ['fue', 'Fue'], ['agl', 'Agi'], ['des', 'Des'], ['esp', 'Esp'], ['capcinturon', 'Ranuras de cinturón']],
    otro: [['con', 'Con'], ['fue', 'Fue'], ['agl', 'Agi'], ['des', 'Des'], ['esp', 'Esp']],
  };
  const EXPLICA_BONO = {
    pdg: 'probabilidad de golpe', crit: 'chance de crítico (un crítico ignora la Defensa del rival)',
    parry: 'desviar golpes', bloqueo: 'frenar daño', dmg: 'suma al daño de los golpes cuerpo a cuerpo',
    eva: 'esquivar', hpmax: 'vida máxima', mov: 'casilleros de movimiento', capcinturon: 'lugares extra en el cinturón',
  };
  const CRIT_IDS = ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'];
  const CRIT_TIPO = {tipo1: 4, tipo2: 6, tipo3: 8, tipo4: 10, tipo5: 12};

  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
  const f = x => Number.isInteger(x) ? x : Math.round(x * 100) / 100;
  const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const primer = t => Math.ceil(t / 2);
  const ataques = (t, nitros) => nitros < primer(t) ? 0 : 1 + Math.floor((nitros - primer(t)) / t);
  const grupoDe = id => (CATEGORIAS.find(c => c.id === id) || {}).grupo || '';
  const labelDe = id => (CATEGORIAS.find(c => c.id === id) || {}).label || id;
  const danoTxt = d => {
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    return `${dados}d${n(d.tipoDado) || 8}${n(d.danoFijo) ? ` + ${f(n(d.danoFijo))}` : ''}`;
  };
  const modVal = (d, stat) => (d.mods || []).filter(m => m.stat === stat).reduce((a, m) => a + n(m.val), 0);
  function setMod(d, stat, val){
    d.mods = (d.mods || []).filter(m => m.stat !== stat);
    if(val) d.mods.push({stat, val});
  }
  const EG = () => (typeof EfectosGolpe !== 'undefined' ? EfectosGolpe : null);

  let st = null;  // {cfg, d, paso, destino, estadoAbierto}
  let raiz = null;

  function pasos(){
    const {cfg, d} = st;
    const g = grupoDe(d.tipoItem);
    const L = [{id: 'que', corto: 'Qué es'}];
    if(g === 'arma') L.push({id: 'tipo', corto: 'Tipo'}, {id: 'empunadura', corto: 'Empuñadura'}, {id: 'dano', corto: 'Peso y daño'});
    if(g === 'defensa') L.push({id: 'defensa', corto: 'Defensa'});
    if(g) L.push({id: 'bonos', corto: 'Bonos'});
    if(g === 'arma') L.push({id: 'golpe', corto: 'Al golpear'});
    if(g && cfg.conEstadoEquipar) L.push({id: 'equipar', corto: 'Al equipar'});
    if(g && (cfg.conPrecio || cfg.conRanuras || cfg.conLugar || g !== 'arma')) L.push({id: 'lugar', corto: cfg.conPrecio ? 'Precio' : 'Peso'});
    L.push({id: 'listo', corto: 'Listo'});
    return L;
  }

  function montar(){
    if(raiz) return;
    const css = document.createElement('style');
    css.textContent = `
.aa-scrim{position:fixed;inset:0;background:rgba(8,5,7,.78);display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;z-index:95}
.aa-scrim.open{display:flex}
.aa-modal{width:100%;max-width:540px;background:var(--panel,#1A1418);border:1px solid var(--line,#3B2E34);border-top:3px solid var(--copper,#C98545);border-radius:var(--r,3px);color:var(--paper,#EDE3D2)}
.aa-modal header{position:static;background:none;flex-wrap:nowrap;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 15px;border-bottom:1px solid var(--line,#3B2E34)}
.aa-modal header h3{margin:0;font-family:"Fraunces",serif;font-size:18px}
.aa-body{padding:14px 15px}
.aa-modal footer{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;padding:12px 15px;border-top:1px solid var(--line,#3B2E34)}
.aa-modal footer .aa-izq{margin-right:auto}
.aa-chips{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px}
.aa-chip{font-family:"Space Mono",monospace;font-size:10px;padding:3px 8px;border:1px solid var(--line,#3B2E34);border-radius:99px;color:var(--muted,#9A867E);background:none;cursor:pointer}
.aa-chip.hecho{color:var(--paper,#EDE3D2)}
.aa-chip.activo{color:#180F08;background:var(--copper,#C98545);border-color:var(--copper,#C98545);font-weight:700}
.aa-chip:disabled{opacity:.4;cursor:not-allowed}
.aa-titulo{font-family:"Fraunces",serif;font-size:19px;font-weight:700;margin:2px 0 4px}
.aa-ayuda{color:var(--muted,#9A867E);font-size:12.5px;margin:0 0 12px;line-height:1.45}
.aa-ayuda b,.aa-efecto b{color:var(--brass,#E0A458)}
.aa-campo{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.aa-campo>label{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#9A867E)}
.aa-campo input,.aa-campo select,.aa-campo textarea,.aa-mod select,.aa-mod input,.aa-golpe input,.aa-golpe select{background:var(--panel2,#221A1E);border:1px solid var(--line,#3B2E34);color:var(--paper,#EDE3D2);border-radius:var(--r,3px);padding:6px 8px;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.aa-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}
.aa-opciones{display:flex;flex-wrap:wrap;gap:6px}
.aa-op{font-family:"Space Mono",monospace;font-size:10.5px;border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:6px 11px;color:var(--muted,#9A867E);border-radius:var(--r,3px);cursor:pointer}
.aa-op:hover{border-color:var(--copper,#C98545);color:var(--paper,#EDE3D2)}
.aa-op.activa{border-color:var(--copper,#C98545);background:rgba(201,133,69,.18);color:var(--paper,#EDE3D2);font-weight:700}
.aa-cat-grupo{font-family:"Space Mono",monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--copper,#C98545);margin:6px 0 4px}
.aa-tipos{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.aa-tipo{display:grid;grid-template-columns:52px 1fr;gap:2px 10px;align-items:center;text-align:left;border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:7px 10px;border-radius:var(--r,3px);color:var(--paper,#EDE3D2);cursor:pointer;font:inherit}
.aa-tipo:hover{border-color:var(--copper,#C98545)}
.aa-tipo.activa{border-color:var(--copper,#C98545);background:rgba(201,133,69,.18)}
.aa-tipo b{grid-row:span 2;font-family:"Fraunces",serif;font-size:20px;color:var(--brass,#E0A458);text-align:center}
.aa-tipo span{font-size:12.5px;font-weight:700}
.aa-tipo small{font-size:11px;color:var(--muted,#9A867E);line-height:1.35}
.aa-efecto{border-left:3px solid var(--copper,#C98545);background:var(--panel2,#221A1E);padding:7px 10px;font-size:12.5px;line-height:1.45;margin:0 0 10px;border-radius:0 var(--r,3px) var(--r,3px) 0}
.aa-nota{font-size:11.5px;color:var(--muted,#9A867E);line-height:1.45;margin:-4px 0 10px}
.aa-mod{display:grid;grid-template-columns:1fr 80px 30px;gap:6px;margin-bottom:6px}
.aa-x{border:1px solid var(--line,#3B2E34);background:none;color:var(--muted,#9A867E);border-radius:var(--r,3px);cursor:pointer}
.aa-crit{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.aa-crit label{font-family:"Space Mono",monospace;font-size:9.5px;color:var(--muted,#9A867E);text-align:center;display:block}
.aa-crit input{text-align:center}
.aa-golpe{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);border-radius:var(--r,3px);padding:8px 10px;margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr 30px;gap:6px}
.aa-golpe .aa-ancho{grid-column:1 / -1}
.aa-golpe .aa-regla{grid-column:1 / -1;font-size:11.5px;color:var(--brass,#E0A458)}
.aa-resumen{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:10px 12px;border-radius:var(--r,3px)}
.aa-resumen-nombre{font-family:"Fraunces",serif;font-size:17px;font-weight:700;color:var(--brass,#E0A458)}
.aa-resumen-desc{font-size:12.5px;margin:4px 0 8px;white-space:pre-wrap}
.aa-resumen-fila{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0;border-top:1px solid var(--line-soft,#2A2126)}
.aa-resumen-fila span{color:var(--muted,#9A867E);flex:none}
.aa-resumen-fila b{text-align:right}
.aa-nav{display:flex;justify-content:space-between;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--line-soft,#2A2126)}
.aa-img{width:72px;height:72px;object-fit:cover;border:1px solid var(--line,#3B2E34);border-radius:var(--r,3px)}
`;
    document.head.appendChild(css);
    raiz = document.createElement('div');
    // .scrim: los modos botonera/acciones (dentro del mapa) solo muestran y vigilan esas.
    raiz.className = 'scrim aa-scrim';
    raiz.innerHTML = `<div class="aa-modal" role="dialog">
      <header><h3 id="aa-titulo"></h3><button type="button" class="iconbtn" data-aa="cerrar">Cerrar</button></header>
      <div class="aa-body" id="aa-body"></div>
      <footer id="aa-pie"></footer>
    </div>`;
    document.body.appendChild(raiz);
    raiz.addEventListener('mousedown', ev => { if(ev.target === raiz) cerrar(); });
    raiz.addEventListener('click', alClic);
    raiz.addEventListener('input', alEscribir);
    raiz.addEventListener('change', alCambiar);
    raiz.addEventListener('keydown', ev => {
      if(ev.key === 'Escape'){ ev.stopPropagation(); cerrar(); return; }
      if(ev.key === 'Enter' && ev.target.matches('input:not([type=file])')){
        ev.preventDefault();
        alEscribir(ev);
        ir(st.paso + 1);
      }
    });
  }

  function abrir(cfg){
    montar();
    const d = Object.assign({
      nombre: '', tipoItem: '', tipoDado: 8, peso: 1, danoFijo: 0, danoAmplificado: 0,
      armaDeRango: false, mods: [], efectosGolpe: [], detalle: '', descripcionNarrativa: '', tier: 'Común',
      precioCompra: 0, ranuras: 1, imagen: '',
      equipoEstadoNombre: '', equipoEstadoHpTurno: 0, equipoEstadoDetalle: '', equipoEstadoPreset: '',
    }, structuredClone(cfg.draft || {}));
    if(!DADOS.includes(n(d.tipoDado))) d.tipoDado = 8;
    d.mods = Array.isArray(d.mods) ? d.mods : [];
    d.efectosGolpe = Array.isArray(d.efectosGolpe) ? d.efectosGolpe : [];
    st = {cfg, d, paso: cfg.paso || 0, destino: cfg.destinos ? cfg.destinos.valor : null,
      estadoAbierto: !!String(d.equipoEstadoNombre || '').trim()};
    document.getElementById('aa-titulo').textContent = cfg.titulo || (cfg.nuevo ? 'Ítem nuevo' : `Editar ${d.nombre || 'ítem'}`);
    dibujar();
    raiz.classList.add('open');
    setTimeout(() => raiz.querySelector('#aa-body input')?.focus(), 40);
  }

  function cerrar(){
    if(!raiz) return;
    raiz.classList.remove('open');
    st = null;
  }

  function faltaAlgo(){
    if(!st.d.tipoItem) return 'Primero elegí qué tipo de ítem es';
    if(!st.d.nombre.trim()) return 'Primero ponele un nombre';
    return '';
  }

  function ir(i){
    if(!st) return;
    const total = pasos().length;
    const destino = Math.max(0, Math.min(total - 1, i));
    const falta = faltaAlgo();
    if(destino > 0 && falta){
      st.paso = 0;
      dibujar();
      avisar(falta);
      if(st.d.tipoItem) raiz.querySelector('[data-aa-c="nombre"]')?.focus();
      return;
    }
    st.paso = destino;
    dibujar();
    raiz.querySelector('#aa-body input:not([type=file]),#aa-body textarea')?.focus();
  }

  function avisar(msg){
    if(typeof toast === 'function') toast(msg); else alert(msg);
  }

  const portador = () => (st.cfg.portador ? st.cfg.portador(st.destino) : null);

  // Cómo se nombra a quien lo usa, según la herramienta.
  function quien(){
    const ctx = st.cfg.contexto;
    const p = portador();
    const nombreCreep = p && p.nombre ? p.nombre : 'el creep';
    return {
      ctx, p,
      suj: ctx === 'ficha' ? 'vos' : ctx === 'creep' ? nombreCreep : 'el jugador',
      de: ctx === 'ficha' ? 'que tenés' : ctx === 'creep' ? `de ${nombreCreep}` : 'del jugador',
      tener: ctx === 'ficha' ? 'la tengas' : ctx === 'creep' ? `${nombreCreep} la tenga` : 'el jugador la tenga',
    };
  }

  const efecto = txt => `<div class="aa-efecto">${txt}</div>`;
  const op = (attr, valor, activa, texto) => `<button type="button" class="aa-op ${activa ? 'activa' : ''}" data-aa-${attr}="${e(valor)}">${texto}</button>`;
  const campo = (label, html, nota) => `<div class="aa-campo"><label>${label}</label>${html}${nota ? `<div class="aa-nota" style="margin:2px 0 0">${nota}</div>` : ''}</div>`;
  const input = (c, val, extra = '') => `<input data-aa-c="${c}" value="${e(val)}" ${extra}>`;
  const num = (c, val, extra = '') => `<input data-aa-c="${c}" type="number" value="${e(val)}" ${extra}>`;

  function dibujar(){
    const {cfg, d} = st;
    const L = pasos();
    st.paso = Math.max(0, Math.min(L.length - 1, st.paso));
    const paso = L[st.paso];
    const q = quien();
    const p = q.p;
    const g = grupoDe(d.tipoItem);
    const tipo = n(d.tipoDado) || 8;
    let h = `<div class="aa-chips">${L.map((x, i) => {
      const bloqueado = cfg.nuevo && i > st.paso && !!faltaAlgo();
      return `<button type="button" class="aa-chip${i === st.paso ? ' activo' : ''}${i < st.paso ? ' hecho' : ''}" data-aa-paso="${i}" ${bloqueado ? 'disabled' : ''}>${i + 1}. ${x.corto}</button>`;
    }).join('')}</div>`;
    const titulo = (t, ayuda) => { h += `<div class="aa-titulo">${t}</div><p class="aa-ayuda">${ayuda}</p>`; };

    if(paso.id === 'que'){
      titulo('¿Qué es?', 'Elegí el tipo de ítem, ponele nombre y contá con palabras todo lo que hace. Los pasos siguientes cargan solo la parte práctica (lo que la herramienta calcula o recuerda sola).');
      if(!cfg.fijarCategoria){
        const permitidas = CATEGORIAS.filter(c => !cfg.categorias || cfg.categorias.includes(c.id));
        const grupos = [...new Set(permitidas.map(c => c.grupo))];
        h += `<div class="aa-campo"><label>Tipo de ítem</label>${grupos.map(gr => `<div class="aa-cat-grupo">${GRUPO_TITULO[gr]}</div>
          <div class="aa-opciones">${permitidas.filter(c => c.grupo === gr).map(c => op('cat', c.id, d.tipoItem === c.id, e(c.label))).join('')}</div>`).join('')}</div>`;
        if(g) h += efecto(explicaCategoria(d.tipoItem, q));
      }
      h += campo('Nombre', input('nombre', d.nombre, 'placeholder="ej. Hacha oxidada del pantano"'),
        q.ctx === 'creep' ? 'Se lee en la tarjeta del creep y en la Mesa.'
          : q.ctx === 'ficha' ? 'Aparece en tu Equipo, en la Botonera y en la Mesa.'
          : 'Es como lo ven los jugadores en el catálogo, en las tiendas y en su Equipo.');
      h += campo('Descripción (qué hace, en palabras)', `<textarea data-aa-c="detalle" rows="4" placeholder="ej. Hoja dentada. Tiene 50% de envenenar al golpear. Resistencia a críticos Tipo 6: +1.">${e(d.detalle)}</textarea>`,
        'Contá todos sus efectos: bonos, resistencias a crítico, estados que aplica, efectos al golpear, lo que haga falta recordar. Es lo que se lee al mirar el ítem; los números de los pasos siguientes son los que la herramienta usa.');
      if(cfg.destinos){
        h += campo(cfg.destinos.label, `<select data-aa-destino="1">${cfg.destinos.opciones.map(o => `<option value="${e(o.v)}" ${String(st.destino) === String(o.v) ? 'selected' : ''}>${e(o.l)}</option>`).join('')}</select>`, cfg.destinos.nota || '');
      }
      if(cfg.tiers){
        h += campo('Tier (rareza)', `<select data-aa-c="tier">${cfg.tiers.map(t => `<option value="${e(t)}" ${d.tier === t ? 'selected' : ''}>${e(t)}</option>`).join('')}</select>`,
          q.ctx === 'creep'
            ? 'Solo importa si lo publicás en el catálogo. "A definir" lo deja marcado para revisarlo.'
            : 'Marca qué tan raro es: el generador de tiendas sortea más seguido los comunes, y en la ficha Excepcional y Legendario no aparecen en el catálogo general (solo en tiendas).');
      }
      if(cfg.conNarrativa){
        h += campo('Descripción narrativa (opcional)', `<textarea data-aa-c="descripcionNarrativa" rows="2" placeholder="ej. Hoja ancha de un solo filo, gastada de tanto uso.">${e(d.descripcionNarrativa)}</textarea>`,
          'Solo color: se lee al mirar el ítem, no tiene ningún efecto.');
      }
      if(cfg.conImagen){
        h += campo('Imagen (opcional)', `<div style="display:flex;gap:10px;align-items:center">
          ${d.imagen ? `<img class="aa-img" src="${d.imagen}" alt="">` : ''}
          <input type="file" accept="image/*" data-aa-imagen="1">
          ${d.imagen ? '<button type="button" class="aa-op" data-aa-quitarimg="1">Quitar</button>' : ''}
        </div>`);
      }
    }

    if(paso.id === 'tipo'){
      titulo('¿De qué Tipo es el arma?', 'El Tipo decide tres cosas a la vez: <b>el dado de daño</b> (Tipo 6 = cada dado es un d6), <b>cuántos Nitros cuesta atacar</b> (el primer ataque del turno con esta arma cuesta la mitad del Tipo; los siguientes, el Tipo entero) y <b>contra qué resistencia a críticos choca</b>. Más Tipo = más daño por golpe, pero menos golpes por turno.');
      h += `<div class="aa-tipos">${DADOS.map(t => `<button type="button" class="aa-tipo ${tipo === t ? 'activa' : ''}" data-aa-tipo="${t}">
          <b>${t}</b><span>${e(TIPOS[t].nombre)} · d${t}</span>
          <small>${e(TIPOS[t].ejemplo)} · atacar: ${primer(t)} No2 el primero, ${t} los siguientes</small>
        </button>`).join('')}</div>`;
      let txt = `Con <b>Tipo ${tipo}</b>: cada dado de daño es un <b>d${tipo}</b>. Atacar cuesta <b>${primer(tipo)} No2</b> el primer golpe del turno y <b>${tipo} No2</b> cada golpe siguiente.`;
      if(p){
        const a = ataques(tipo, n(p.nitros));
        txt += `<br>Con ${q.ctx === 'ficha' ? 'tus' : 'sus'} ${f(n(p.nitros))} No2, ${q.ctx === 'ficha' ? 'te entran' : `<b>${e(q.suj)}</b> hace`} <b>${a} ataque${a === 1 ? '' : 's'} por turno</b> con ella (si no se gastan Nitros en otra cosa).`;
      }else{
        txt += `<br>Ataques por turno según los No2 del personaje: ${[4, 6, 8, 12].map(x => `con ${x} → <b>${ataques(tipo, x)}</b>`).join(' · ')}.`;
      }
      txt += `<br>Un crítico con esta arma choca contra la <b>Res. crítico Tipo ${tipo}</b> de quien recibe el golpe.`;
      h += efecto(txt);
      const ej = cfg.ejemplos ? cfg.ejemplos(d.tipoItem, tipo).filter(x => x !== d.nombre) : [];
      if(ej.length) h += `<div class="aa-nota">En el catálogo, Tipo ${tipo}: ${e(ej.slice(0, 6).join(', '))}${ej.length > 6 ? '…' : ''}</div>`;
    }

    if(paso.id === 'empunadura'){
      titulo('¿Cómo se empuña y a qué distancia pega?', 'Las manos que ocupa definen qué más se puede llevar al mismo tiempo; la distancia define si el daño suma el Dmg (que sale de la Fuerza).');
      const dos = d.tipoItem === 'arma_2m';
      h += campo('Manos', `<div class="aa-opciones">${op('manos', 'arma_1m', !dos, 'Una mano')}${op('manos', 'arma_2m', dos, 'Dos manos')}</div>`);
      h += efecto(q.ctx === 'creep'
        ? `Un creep lleva <b>una sola arma</b>: las manos no le cambian nada. Solo cuentan si después la publicás en el catálogo.`
        : dos
          ? 'Ocupa <b>las dos manos</b>: mientras esté equipada no se puede llevar escudo ni otra arma.'
          : 'Ocupa <b>una mano</b>: la otra queda libre para un escudo o una segunda arma. Con dos armas, cada una paga su propio primer ataque del turno y el PdG de cada una solo cuenta cuando se ataca con ella.');
      if(p && p.manosUsadas !== undefined) h += `<div class="aa-nota">Manos ocupadas hoy: ${f(n(p.manosUsadas))} de 2.</div>`;
      if(cfg.conMano && !dos) h += campoMano(d);
      h += campo('Distancia', `<div class="aa-opciones">${op('rango', '0', !d.armaDeRango, 'Cuerpo a cuerpo')}${op('rango', '1', !!d.armaDeRango, 'A distancia')}</div>`);
      h += efecto(d.armaDeRango
        ? `Es <b>de rango</b> (arco, pistola, lanzallamas…): tiene su propia mecánica — el daño <b>no suma el Dmg</b>, es solo el del arma. No confundir con el <b>Alcance</b> de las armas cuerpo a cuerpo: son dos cosas distintas.`
        : `Es <b>cuerpo a cuerpo</b>: al tirar daño se suma el <b>Dmg</b> ${e(q.de)}${p ? ` (hoy ${f(n(p.dmg))})` : ''}.`);
      // Mismo mod ('rng'), pero se explica distinto: en un arma de rango es su
      // propia distancia de disparo; en una cuerpo a cuerpo es el Alcance
      // (deja pegar a más de un casillero sin dejar de sumar el Dmg).
      if(d.armaDeRango){
        h += campo('Rango del disparo (+ Rango)', `<input data-aa-mod1="rng" type="number" step="1" value="${modVal(d, 'rng')}" style="max-width:120px">`,
          `Hasta dónde llega el disparo, además de lo que ya da la Destreza.${p && p.rango !== undefined ? ` Hoy el Rango ${e(q.de)} es ${f(n(p.rango))}.` : ''}`);
      }else{
        h += campo('Alcance (+ Rango)', `<input data-aa-mod1="rng" type="number" step="1" value="${modVal(d, 'rng')}" style="max-width:120px">`,
          `Sin esto, un arma cuerpo a cuerpo solo golpea al casillero de al lado. Cada +1 la deja atacar un casillero más lejos <b>sin dejar de ser cuerpo a cuerpo</b> (sigue sumando el Dmg) — una lanza o un látigo suelen dar +1.${p && p.rango !== undefined ? ` Hoy el Rango ${e(q.de)} es ${f(n(p.rango))}.` : ''}`);
      }
    }

    if(paso.id === 'dano'){
      titulo('¿Cuánto pesa y cuánto daño hace?', q.ctx === 'creep'
        ? 'El <b>Peso</b> es la cantidad de dados de daño. Los creeps no llevan cuenta de carga, así que para el creep solo decide los dados.'
        : 'El <b>Peso</b> es a la vez la cantidad de dados de daño y lo que carga: un arma pesada pega más fuerte, pero ocupa más de la Carga máxima mientras esté equipada.');
      h += `<div class="aa-fila">
        ${campo('Peso (= dados)', num('peso', d.peso, 'step="1" min="1"'))}
        ${campo('Daño fijo', num('danoFijo', d.danoFijo, 'step="1"'))}
        ${campo('Daño amplificado', num('danoAmplificado', d.danoAmplificado, 'step="1" min="0"'))}
      </div>`;
      h += efecto(`<span id="aa-dano">${danoHtml()}</span>`);
      h += `<div class="aa-nota"><b>Daño fijo</b>: se suma siempre al resultado de los dados. <b>Daño amplificado</b>: dados de más que no pesan (un arma liviana que pega como una pesada).</div>`;
      if(q.ctx !== 'creep') h += efecto(`<span id="aa-carga">${cargaHtml()}</span>`);
    }

    if(paso.id === 'defensa'){
      titulo('¿Cuánto protege?', 'La <b>Defensa</b> se resta al daño de cada golpe que se recibe (un golpe crítico la ignora). La <b>resistencia a críticos</b> protege contra los críticos de armas de cada Tipo.');
      h += campo('Defensa', `<input data-aa-mod1="def" type="number" step="1" value="${modVal(d, 'def')}" style="max-width:120px">`,
        p && p.def !== undefined ? `Hoy la Defensa ${e(q.de)} es ${f(n(p.def))}.` : '');
      h += `<div class="aa-campo"><label>Resistencia a críticos, por Tipo del arma que golpea</label>
        <div class="aa-crit">${CRIT_IDS.map(id => `<div><label>Tipo ${CRIT_TIPO[id]}</label><input data-aa-mod1="${id}" type="number" step="1" value="${modVal(d, id)}"></div>`).join('')}</div></div>`;
      const crit = CRIT_IDS.filter(id => modVal(d, id));
      h += efecto(crit.length
        ? `Protege contra los críticos de ${crit.map(id => `<b>Tipo ${CRIT_TIPO[id]}</b> (+${f(modVal(d, id))})`).join(', ')}. ${crit.length < 5 ? 'Contra los demás Tipos no ayuda.' : ''}`
        : 'Sin resistencia a críticos: si el arma que te pega saca crítico, este ítem no lo frena.');
      if(d.tipoItem === 'escudo_2m') h += efecto('Ocupa <b>las dos manos</b>: con este escudo no se puede llevar arma.');
      if(d.tipoItem === 'escudo_1m') h += efecto('Ocupa <b>una mano</b>: la otra queda para un arma.');
      if(cfg.conMano && d.tipoItem === 'escudo_1m') h += campoMano(d);
      if(/^armadura_/.test(d.tipoItem)) h += `<div class="aa-nota">Una armadura blanda y una rígida se pueden llevar a la vez; del resto de las piezas, una de cada una.</div>`;
    }

    if(paso.id === 'bonos'){
      titulo('¿Mejora algún stat mientras se lleva?', `Cada bono suma (o resta, con negativo) a ese stat mientras esté equipado. Si no tiene ninguno, seguí.`);
      const aparte = g === 'arma' ? ['rng'] : g === 'defensa' ? ['def', ...CRIT_IDS] : [];
      const ids = new Set((cfg.stats || []).map(s => s.id));
      const opciones = sel => (cfg.stats || []).map(s => `<option value="${e(s.id)}" ${sel === s.id ? 'selected' : ''}>${e(s.label)}</option>`).join('');
      const rapidos = (RAPIDOS[g] || []).filter(([id]) => ids.has(id) && (id !== 'capcinturon' || d.tipoItem === 'cinturon'));
      h += `<div class="aa-campo"><label>Bonos</label>
        ${d.mods.map((m, i) => aparte.includes(m.stat) ? '' : `<div class="aa-mod">
          <select data-aa-modstat="${i}"><option value="">— elegir stat —</option>${opciones(m.stat)}</select>
          <input data-aa-modval="${i}" type="number" step="any" value="${e(m.val)}">
          <button type="button" class="aa-x" data-aa-modrm="${i}">×</button>
        </div>`).join('')}
        <div class="aa-opciones">${rapidos.map(([id, t]) => `<button type="button" class="aa-op" data-aa-modadd="${id}">+ ${t}</button>`).join('')}
          <button type="button" class="aa-op" data-aa-modadd="">+ Otro stat</button></div>
      </div>`;
      const vistos = [...new Set(d.mods.map(m => m.stat).filter(s => s && !aparte.includes(s)))];
      const lineas = vistos.map(s => `<b>${e(((cfg.stats || []).find(x => x.id === s) || {}).label || s)} ${modVal(d, s) > 0 ? '+' : ''}${f(modVal(d, s))}</b>${EXPLICA_BONO[s] ? `: ${EXPLICA_BONO[s]}` : ''}`);
      if(g === 'arma' && vistos.includes('pdg') && q.ctx !== 'creep') lineas.push('El PdG de un arma solo cuenta cuando se ataca con ella (no se suma a la otra mano).');
      h += efecto(lineas.length ? lineas.join('<br>') : `Sin bonos: ${g === 'arma' ? 'el arma aporta solo su daño y sus efectos' : 'no cambia ningún stat'}.`);
      if(q.ctx === 'creep' && g !== 'arma') h += `<div class="aa-nota">En un creep, SP, Bonos y Res. mental no tienen dónde sumarse: quedan escritos en el ítem.</div>`;
    }

    if(paso.id === 'golpe'){
      titulo('¿Hace algo cuando pega?', 'Efectos que se aplican sobre quien recibe el golpe: Envenenar, Rompe armadura, Sangrado, fuego extra… Al tirar el Daño con esta arma, cada efecto aparece <b>resaltado en la Mesa</b> para no olvidarlo, y si depende de la suerte se abre un pop-up para tirar el dado. Se aplican a mano sobre el objetivo.');
      const eg = EG();
      h += (d.efectosGolpe.map((ef, i) => {
        const x = eg ? eg.normalizar(ef) : ef;
        const probSel = `${x.caras}/${x.exitos}`;
        const probs = eg ? eg.PROBABILIDADES : [{caras: 1, exitos: 1, texto: 'Siempre'}];
        const conocida = probs.some(pp => `${pp.caras}/${pp.exitos}` === probSel);
        return `<div class="aa-golpe">
          <input class="aa-ancho" data-aa-golpe="${i}" data-campo="nombre" value="${e(ef.nombre || '')}" placeholder="ej. Envenenar">
          <select data-aa-golpe="${i}" data-campo="prob">
            ${probs.map(pp => `<option value="${pp.caras}/${pp.exitos}" ${`${pp.caras}/${pp.exitos}` === probSel ? 'selected' : ''}>${e(pp.texto)}${pp.caras > 1 ? ` (1d${pp.caras})` : ''}</option>`).join('')}
            ${conocida ? '' : `<option value="${probSel}" selected>${x.exitos} en 1d${x.caras}</option>`}
          </select>
          <input data-aa-golpe="${i}" data-campo="dado" value="${e(ef.dado || '')}" placeholder="tirada extra: ej. 1d6">
          <button type="button" class="aa-x" data-aa-golperm="${i}">×</button>
          <input class="aa-ancho" data-aa-golpe="${i}" data-campo="detalle" value="${e(ef.detalle || '')}" placeholder="qué hace (opcional): ej. Veneno de 4 stacks">
          <div class="aa-regla">${eg && x.nombre ? e(eg.reglaTxt(x)) + (x.dado ? ` Si entra, se tira además ${e(x.dado)}.` : '') : ''}</div>
        </div>`;
      }).join('')) + `<div class="aa-opciones">
        ${['Envenenar', 'Sangrado', 'Rompe armadura'].map(t => `<button type="button" class="aa-op" data-aa-golpeadd="${t}">+ ${t}</button>`).join('')}
        <button type="button" class="aa-op" data-aa-golpeadd="">+ Otro efecto</button></div>`;
      h += efecto(d.efectosGolpe.length && eg
        ? `Al tirar el Daño: ${e(eg.resumenLista(d.efectosGolpe)) || '(poné el nombre de cada efecto)'}. ${d.efectosGolpe.some(x => !eg.siempre(eg.normalizar(x))) ? 'Los que tienen porcentaje abren el pop-up para tirar: 50% es una moneda (2 = éxito), 25% un d4 (4 = éxito), y así.' : 'Salen como recordatorio en la Mesa, sin tirar.'}`
        : 'Sin efectos al golpear: al tirar el Daño no aparece ningún recordatorio.');
      h += `<div class="aa-nota">"Tirada extra" es para efectos que suman dados cuando entran (ej. 1d6 de fuego). Dejala vacía si no hace falta.</div>`;
    }

    if(paso.id === 'equipar'){
      titulo('¿Le pone un estado a quien lo lleva?', 'Un estado alterado que se activa solo al equiparlo y se va al sacárselo (ej. una espada que regenera 2 HP por turno mientras se lleva). Si no tiene, seguí.');
      if(st.estadoAbierto){
        h += campo('Nombre del estado', input('equipoEstadoNombre', d.equipoEstadoNombre, 'placeholder="ej. Regeneración"'));
        h += `<div class="aa-fila">${campo('HP por turno (mientras esté puesto)', num('equipoEstadoHpTurno', d.equipoEstadoHpTurno, 'step="any"'))}</div>`;
        h += campo('Qué hace el estado', `<textarea data-aa-c="equipoEstadoDetalle" rows="2" placeholder="Si lo dejás vacío se usa la descripción del ítem.">${e(d.equipoEstadoDetalle)}</textarea>`);
        if(cfg.conPresetEstado){
          h += campo('Preset que hereda (opcional)', input('equipoEstadoPreset', d.equipoEstadoPreset, 'placeholder="ej. Afortunado, Sangre pura…"'),
            'Si coincide EXACTO con un preset de Estados alterados de la ficha, hereda su mecánica real. Si no, el estado aparece igual pero como recordatorio.');
        }
        h += `<button type="button" class="aa-op" data-aa-estado="0">Quitar estado</button>`;
        h += efecto('<b>Es automático</b>: se activa al ponérselo y se va al sacárselo.');
      }else{
        h += `<button type="button" class="aa-op" data-aa-estado="1">+ Estado alterado al equipar</button>`;
      }
    }

    if(paso.id === 'lugar'){
      titulo(cfg.conPrecio ? '¿Cuánto vale y cuánto pesa?' : '¿Cuánto pesa y dónde va?', q.ctx === 'creep'
        ? 'A un creep el peso y el precio no le cambian nada: solo importan si lo publicás en el catálogo.'
        : 'Equipado, el ítem pesa en la carga; guardado en la mochila, ocupa ranuras en vez de peso.');
      if(g !== 'arma'){
        h += campo('Peso', num('peso', d.peso, 'step="any" min="0" style="max-width:120px"'));
        if(q.ctx !== 'creep') h += efecto(`<span id="aa-carga">${cargaHtml()}</span>`);
      }
      if(cfg.conPrecio){
        h += campo('Precio de compra (DDE)', num('precioCompra', d.precioCompra, 'step="1" min="0" style="max-width:140px"'));
        h += efecto(`<span id="aa-precio">${precioHtml()}</span>`);
      }
      if(cfg.conLugar){
        h += campo('¿Dónde lo tenés?', `<div class="aa-opciones">${op('equipado', '1', !!d.equipado, 'Equipado')}${op('equipado', '0', !d.equipado, 'En la mochila')}</div>`);
        h += efecto(d.equipado
          ? `<b>Equipado</b>: sus bonos cuentan${g === 'arma' ? ', aparece en la Botonera para atacar' : ''} y pesa en tu carga.`
          : '<b>En la mochila</b>: no suma nada hasta equiparlo, pero ocupa ranuras de la mochila en vez de peso.');
      }
      if(cfg.conRanuras || (cfg.conLugar && !d.equipado)){
        h += campo('Ranuras que ocupa en la mochila', num('ranuras', d.ranuras, 'step="1" min="0" style="max-width:120px"'),
          cfg.conLugar ? '' : 'Lo que ocupa cuando el jugador lo guarda en vez de tenerlo equipado.');
      }
    }

    if(paso.id === 'listo'){
      titulo('Revisá cómo quedó', 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardalo.');
      const fila = (a, b) => `<div class="aa-resumen-fila"><span>${a}</span><b>${b}</b></div>`;
      const nombreStat = id => ((cfg.stats || []).find(s => s.id === id) || {}).label || id;
      const aparte = g === 'arma' ? ['rng'] : g === 'defensa' ? ['def', ...CRIT_IDS] : [];
      const bonos = d.mods.filter(m => m.stat && n(m.val) && !aparte.includes(m.stat)).map(m => `${nombreStat(m.stat)} ${n(m.val) > 0 ? '+' : ''}${f(n(m.val))}`).join(', ');
      const dest = cfg.destinos ? (cfg.destinos.opciones.find(o => String(o.v) === String(st.destino)) || {}).l : '';
      const eg = EG();
      h += `<div class="aa-resumen">
        <div class="aa-resumen-nombre">${e(d.nombre || '(sin nombre)')}</div>
        <div class="aa-resumen-desc">${d.detalle ? e(d.detalle) : '<span style="color:var(--muted,#9A867E)">(sin descripción)</span>'}</div>
        ${fila('Tipo de ítem', e(labelDe(d.tipoItem)))}
        ${cfg.destinos ? fila(cfg.destinos.label, e(dest || '—')) : ''}
        ${cfg.tiers ? fila('Tier', e(d.tier)) : ''}
        ${g === 'arma' ? fila('Tipo', e(`Tipo ${tipo} · ${TIPOS[tipo].nombre}`)) + fila('Distancia', d.armaDeRango ? 'a distancia (no suma Dmg)' : 'cuerpo a cuerpo')
          + fila('Daño', e(danoTxt(d))) + fila('Atacar', `${primer(tipo)} No2 el primero, ${tipo} los siguientes`)
          + (modVal(d, 'rng') ? fila(d.armaDeRango ? 'Rango' : 'Alcance', `+${f(modVal(d, 'rng'))}`) : '')
          + fila('Al golpear', e((eg && eg.resumenLista(d.efectosGolpe)) || 'nada')) : ''}
        ${g === 'defensa' ? fila('Defensa', f(modVal(d, 'def'))) + fila('Res. crítico', e(CRIT_IDS.filter(id => modVal(d, id)).map(id => `T${CRIT_TIPO[id]} +${f(modVal(d, id))}`).join(', ') || 'ninguna')) : ''}
        ${fila('Bonos', e(bonos || 'ninguno'))}
        ${cfg.conEstadoEquipar ? fila('Al equipar', e(String(d.equipoEstadoNombre || '').trim() || 'ningún estado')) : ''}
        ${q.ctx !== 'creep' || g !== 'arma' ? fila('Peso', f(n(d.peso))) : ''}
        ${cfg.conPrecio ? fila('Precio', `${f(n(d.precioCompra))} DDE`) : ''}
        ${cfg.conLugar ? fila('Dónde', d.equipado ? 'equipado' : `mochila (${f(n(d.ranuras))} ranura${n(d.ranuras) === 1 ? '' : 's'})`) : cfg.conRanuras ? fila('Ranuras', f(n(d.ranuras))) : ''}
      </div>`;
      if(cfg.onFormulario) h += `<button type="button" class="aa-op" data-aa-formulario="1" style="margin-top:10px">Ver en el formulario completo</button>`;
    }

    h += `<div class="aa-nav">
      ${st.paso > 0 ? '<button type="button" class="btn ghost" data-aa-atras="1">← Atrás</button>' : '<span></span>'}
      ${st.paso < L.length - 1 ? '<button type="button" class="btn primary" data-aa-siguiente="1">Siguiente →</button>' : ''}
    </div>`;
    document.getElementById('aa-body').innerHTML = h;

    // Pie: Guardar (y los extras) recién en el último paso al crear; al editar, siempre.
    const listo = !cfg.nuevo || st.paso === L.length - 1;
    const pie = document.getElementById('aa-pie');
    pie.innerHTML = (cfg.botones || []).map((b, i) => `<button type="button" class="btn ghost aa-izq" data-aa-extra="${i}" ${listo ? '' : 'style="display:none"'}>${e(b.texto)}</button>`).join('')
      + `<button type="button" class="btn ghost" data-aa="cerrar">Cancelar</button>`
      + `<button type="button" class="btn primary" data-aa="guardar" ${listo ? '' : 'style="display:none"'}>${e(cfg.textoGuardar || 'Guardar')}</button>`;
  }

  function campoMano(d){
    return campo('Mano', `<select data-aa-c="manoPreferida">
        <option value="" ${!d.manoPreferida ? 'selected' : ''}>Automática</option>
        <option value="1" ${String(d.manoPreferida) === '1' ? 'selected' : ''}>Mano 1</option>
        <option value="2" ${String(d.manoPreferida) === '2' ? 'selected' : ''}>Mano 2</option>
      </select>`, 'Solo ordena en qué mano se muestra cuando llevás dos cosas.');
  }

  function explicaCategoria(id, q){
    const g = grupoDe(id);
    if(g === 'arma') return `<b>Arma</b>: tiene Tipo, daño y ${q.ctx === 'creep' ? 'reemplaza el arma del creep' : 'aparece en la Botonera para atacar'}. ${id === 'arma_2m' ? 'Ocupa las dos manos.' : 'Ocupa una mano.'}`;
    if(g === 'defensa') return `<b>Defensa</b>: da Defensa y resistencia a críticos. ${/^escudo/.test(id) ? `Va en ${id === 'escudo_2m' ? 'las dos manos' : 'una mano'}.` : `Ocupa el lugar de ${labelDe(id).toLowerCase()}.`}`;
    if(id === 'cinturon') return '<b>Cinturón</b>: puede dar lugares extra para consumibles, además de bonos.';
    if(id === 'anillos') return '<b>Anillo</b>: se pueden llevar dos. Da bonos y estados.';
    return '<b>Otro</b>: cualquier cosa que no entra en las demás. Si se equipa, sus bonos cuentan.';
  }

  function danoHtml(){
    const d = st.d, p = portador(), q = quien();
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    const caras = n(d.tipoDado) || 8, fijo = n(d.danoFijo);
    const min = dados + fijo, max = dados * caras + fijo;
    const prom = Math.round((dados * (caras + 1) / 2 + fijo) * 10) / 10;
    let t = `Tira <b>${e(danoTxt(d))}</b>: entre ${f(min)} y ${f(max)}, ${f(prom)} en promedio.`;
    if(d.armaDeRango) t += ' Es de rango: no suma Dmg.';
    else if(p) t += ` Con el Dmg ${e(q.de)} (${f(n(p.dmg))}): entre ${f(min + n(p.dmg))} y ${f(max + n(p.dmg))}.`;
    else t += ' Al tirar se le suma el Dmg de quien la use.';
    return t;
  }

  function cargaHtml(){
    const d = st.d, p = portador();
    let t = `Equipado, suma <b>${f(n(d.peso))}</b> a la carga.`;
    if(p && p.cargaMax !== undefined){
      const con = n(p.cargaUsada) + n(d.peso);
      t += ` Quedarías en <b>${f(con)} de ${f(n(p.cargaMax))}</b> (Carga máx.)${con > n(p.cargaMax) ? ' — <b>te pasás</b>: lo que sobra cuenta como sobrecarga.' : '.'}`;
    }
    return t + ' En la mochila no pesa: ocupa ranuras.';
  }

  function precioHtml(){
    const d = st.d;
    return `Se compra a <b>${f(n(d.precioCompra))}</b> DDE y se vende a la mitad: <b>${f(n(d.precioCompra) / 2)}</b>.${st.cfg.precioTxt ? ' ' + st.cfg.precioTxt(d) : ''}`;
  }

  function alClic(ev){
    if(!st) return;
    const b = ev.target.closest('button');
    if(!b) return;
    const d = st.d, ds = b.dataset;
    if(ds.aa === 'cerrar'){ cerrar(); return; }
    if(ds.aa === 'guardar'){ guardar(); return; }
    if(ds.aaPaso !== undefined){ ir(n(ds.aaPaso)); return; }
    if(ds.aaSiguiente){ ir(st.paso + 1); return; }
    if(ds.aaAtras){ ir(st.paso - 1); return; }
    if(ds.aaExtra !== undefined){ const x = st.cfg.botones[n(ds.aaExtra)]; if(x) x.accion(limpio(), b); return; }
    if(ds.aaFormulario){ const cb = st.cfg.onFormulario, copia = limpio(); cerrar(); cb(copia); return; }
    if(ds.aaCat){
      if(ds.aaCat === 'consumibles'){
        const cb = st.cfg.onConsumible, copia = limpio();
        if(!cb){ avisar('Los consumibles se crean desde el formulario común'); return; }
        copia.tipoItem = 'consumibles';
        cerrar();
        cb(copia);
        return;
      }
      d.tipoItem = ds.aaCat;
      if(grupoDe(d.tipoItem) === 'arma' && !n(d.peso)) d.peso = 1;
    }
    else if(ds.aaTipo) d.tipoDado = n(ds.aaTipo);
    else if(ds.aaManos) d.tipoItem = ds.aaManos;
    else if(ds.aaRango) d.armaDeRango = ds.aaRango === '1';
    else if(ds.aaEquipado) d.equipado = ds.aaEquipado === '1';
    else if(ds.aaModadd !== undefined) d.mods.push({stat: ds.aaModadd, val: ds.aaModadd ? 1 : 0});
    else if(ds.aaModrm !== undefined) d.mods.splice(n(ds.aaModrm), 1);
    else if(ds.aaGolpeadd !== undefined) d.efectosGolpe.push({nombre: ds.aaGolpeadd, caras: ds.aaGolpeadd ? 2 : 1, exitos: 1, dado: '', detalle: ''});
    else if(ds.aaGolperm !== undefined) d.efectosGolpe.splice(n(ds.aaGolperm), 1);
    else if(ds.aaEstado !== undefined){
      st.estadoAbierto = ds.aaEstado === '1';
      if(!st.estadoAbierto){ d.equipoEstadoNombre = ''; d.equipoEstadoHpTurno = 0; d.equipoEstadoDetalle = ''; d.equipoEstadoPreset = ''; }
    }
    else if(ds.aaQuitarimg) d.imagen = '';
    else return;
    dibujar();
  }

  const NUMERICOS = ['peso', 'danoFijo', 'danoAmplificado', 'precioCompra', 'ranuras', 'equipoEstadoHpTurno'];
  function alEscribir(ev){
    if(!st) return;
    const t = ev.target, d = st.d;
    // Los textos con cuentas se actualizan en su lugar (redibujar al
    // confirmar un número se comería el clic en "Siguiente").
    const poner = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
    if(t.dataset.aaC){
      const c = t.dataset.aaC;
      d[c] = NUMERICOS.includes(c) ? n(t.value) : t.value;
      if(['peso', 'danoFijo', 'danoAmplificado'].includes(c)) poner('aa-dano', danoHtml());
      if(c === 'peso') poner('aa-carga', cargaHtml());
      if(c === 'precioCompra') poner('aa-precio', precioHtml());
      if(c === 'nombre') raiz.querySelectorAll('[data-aa-paso]').forEach(x => { x.disabled = !!faltaAlgo() && n(x.dataset.aaPaso) > st.paso; });
    }
    if(t.dataset.aaMod1) setMod(d, t.dataset.aaMod1, n(t.value));
    if(t.dataset.aaModstat !== undefined) d.mods[n(t.dataset.aaModstat)].stat = t.value;
    if(t.dataset.aaModval !== undefined) d.mods[n(t.dataset.aaModval)].val = n(t.value);
    if(t.dataset.aaGolpe !== undefined){
      const ef = d.efectosGolpe[n(t.dataset.aaGolpe)];
      if(t.dataset.campo === 'prob'){
        const [caras, exitos] = t.value.split('/').map(n);
        ef.caras = caras; ef.exitos = exitos;
      }else{
        ef[t.dataset.campo] = t.value;
      }
    }
  }

  function alCambiar(ev){
    if(!st) return;
    const t = ev.target;
    alEscribir(ev);
    if(t.dataset.aaDestino){ st.destino = t.value; dibujar(); return; }
    // La regla de cada efecto y la lista de resistencias dependen de lo elegido.
    if((t.dataset.aaGolpe !== undefined && t.dataset.campo === 'prob') || (t.dataset.aaMod1 && CRIT_IDS.includes(t.dataset.aaMod1))){
      setTimeout(() => { if(st) dibujar(); }, 0);
      return;
    }
    if(t.dataset.aaImagen && t.files && t.files[0]){
      const file = t.files[0];
      const leer = st.cfg.imagenADatos || (x => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(x); }));
      leer(file).then(url => { if(st){ st.d.imagen = url; dibujar(); } }).catch(() => avisar('No se pudo cargar esa imagen'));
    }
  }

  // Copia lista para guardar: sin bonos vacíos ni efectos sin nombre.
  function limpio(){
    const d = structuredClone(st.d);
    d.nombre = d.nombre.trim();
    d.mods = d.mods.filter(m => m.stat && n(m.val));
    const eg = EG();
    d.efectosGolpe = eg ? eg.lista(d.efectosGolpe) : d.efectosGolpe.filter(x => String(x.nombre || '').trim());
    if(grupoDe(d.tipoItem) === 'arma'){
      d.peso = Math.max(1, n(d.peso) || 1);
      d.danoAmplificado = Math.max(0, n(d.danoAmplificado));
    }else{
      // Lo que es solo de armas no viaja en el resto.
      delete d.efectosGolpe; delete d.tipoDado; delete d.danoFijo; delete d.danoAmplificado; delete d.armaDeRango;
    }
    return d;
  }

  function guardar(){
    const falta = faltaAlgo();
    if(falta){ avisar(falta); ir(0); return; }
    if(st.cfg.onGuardar(limpio(), st.destino) !== false) cerrar();
  }

  if(document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);

  const esCategoriaDelAsistente = id => !!grupoDe(id) && grupoDe(id) !== 'consumible';

  return {abrir, cerrar, abierto: () => !!st, esCategoriaDelAsistente, grupoDe, CATEGORIAS, TIPOS, DADOS};
})();
