/* =========================================================
   ASISTENTE DE ARMAS (compartido)
   Crear o editar un arma paso a paso, explicando en cada paso qué implica
   lo que se elige. Lo usan gm-tools.html (arma de un creep e ítem custom),
   vendor-generator.html (ítem nuevo de la tienda) y catalogo-editor.html.
   La ficha tiene el suyo, metido en su propio editor (drawEditorArma).

   AsistenteArma.abrir(cfg) — cfg:
     contexto   'creep' | 'tienda' | 'catalogo' (cambia los textos)
     nuevo      true al crear (Guardar recién en el último paso)
     draft      {nombre, tipoItem, tipoDado, peso, danoFijo, danoAmplificado,
                 armaDeRango, mods, detalle, descripcionNarrativa, tier,
                 precioCompra, ranuras, imagen, equipoEstado*}
     stats      [{id, label}] para la lista de bonos
     tiers      lista de tiers (null = no se pide)
     destinos   {label, opciones:[{v, l}], valor} (ej. a qué creep) — opcional
     portador   sc => {nombre, nitros, dmg, rango} de quien la va a usar — opcional
     ejemplos   tipo => [nombres] del catálogo con ese Tipo — opcional
     conPrecio, conRanuras, conNarrativa, conImagen, conEstadoEquipar, conPresetEstado
     precioTxt  d => texto extra sobre el precio — opcional
     botones    [{texto, titulo, accion(d, boton)}] extra en el pie — opcional
     textoGuardar, onGuardar(d, destino) → true para cerrar
     onFormulario(d) — si está, el resumen ofrece pasar al formulario completo
   ========================================================= */
const AsistenteArma = (() => {
  const DADOS = [4, 6, 8, 10, 12];
  const TIPOS = {
    4: {nombre: 'Perforante', ejemplo: 'dagas, estoques, lanzas livianas'},
    6: {nombre: 'Cortante', ejemplo: 'espadas, cimitarras, hachas de mano'},
    8: {nombre: 'Cortante pesado o contundente liviano', ejemplo: 'hachas de guerra, mazas, bastones'},
    10: {nombre: 'Contundente pesado', ejemplo: 'martillos de guerra, mazas de dos manos'},
    12: {nombre: 'Explosivo / armas modernas', ejemplo: 'lanzallamas, explosivos (tier Excepcional)'},
  };
  const RAPIDOS = [['pdg', 'PdG'], ['crit', 'Crítico'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['dmg', 'Dmg']];
  const APARTE = ['rng'];  // el alcance va en su propio paso

  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
  const f = x => Number.isInteger(x) ? x : Math.round(x * 100) / 100;
  const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const primer = t => Math.ceil(t / 2);
  const ataques = (t, nitros) => nitros < primer(t) ? 0 : 1 + Math.floor((nitros - primer(t)) / t);
  const danoTxt = d => {
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    return `${dados}d${n(d.tipoDado) || 8}${n(d.danoFijo) ? ` + ${f(n(d.danoFijo))}` : ''}`;
  };
  const modVal = (d, stat) => (d.mods || []).filter(m => m.stat === stat).reduce((a, m) => a + n(m.val), 0);
  function setMod(d, stat, val){
    d.mods = (d.mods || []).filter(m => m.stat !== stat);
    if(val) d.mods.push({stat, val});
  }

  let st = null;  // {cfg, d, paso, destino, estadoAbierto}
  let raiz = null;

  function pasos(){
    const c = st.cfg;
    const L = [
      {id: 'nombre', corto: 'Nombre'},
      {id: 'tipo', corto: 'Tipo'},
      {id: 'empunadura', corto: 'Empuñadura'},
      {id: 'dano', corto: 'Peso y daño'},
      {id: 'bonos', corto: 'Bonos'},
      {id: 'efectos', corto: 'Efectos'},
    ];
    if(c.conPrecio || c.conRanuras) L.push({id: 'precio', corto: 'Precio'});
    L.push({id: 'listo', corto: 'Listo'});
    return L;
  }

  function montar(){
    if(raiz) return;
    const css = document.createElement('style');
    css.textContent = `
.aa-scrim{position:fixed;inset:0;background:rgba(8,5,7,.78);display:none;align-items:flex-start;justify-content:center;padding:24px;overflow:auto;z-index:95}
.aa-scrim.open{display:flex}
.aa-modal{width:100%;max-width:520px;background:var(--panel,#1A1418);border:1px solid var(--line,#3B2E34);border-top:3px solid var(--copper,#C98545);border-radius:var(--r,3px);color:var(--paper,#EDE3D2)}
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
.aa-campo input,.aa-campo select,.aa-campo textarea,.aa-mod select,.aa-mod input{background:var(--panel2,#221A1E);border:1px solid var(--line,#3B2E34);color:var(--paper,#EDE3D2);border-radius:var(--r,3px);padding:6px 8px;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.aa-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.aa-opciones{display:flex;flex-wrap:wrap;gap:6px}
.aa-op{font-family:"Space Mono",monospace;font-size:10.5px;border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:6px 11px;color:var(--muted,#9A867E);border-radius:var(--r,3px);cursor:pointer}
.aa-op:hover{border-color:var(--copper,#C98545);color:var(--paper,#EDE3D2)}
.aa-op.activa{border-color:var(--copper,#C98545);background:rgba(201,133,69,.18);color:var(--paper,#EDE3D2);font-weight:700}
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
.aa-resumen{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:10px 12px;border-radius:var(--r,3px)}
.aa-resumen-nombre{font-family:"Fraunces",serif;font-size:17px;font-weight:700;color:var(--brass,#E0A458);margin-bottom:6px}
.aa-resumen-fila{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0;border-top:1px solid var(--line-soft,#2A2126)}
.aa-resumen-fila span{color:var(--muted,#9A867E)}
.aa-resumen-fila b{text-align:right}
.aa-nav{display:flex;justify-content:space-between;gap:8px;margin-top:14px;padding-top:10px;border-top:1px solid var(--line-soft,#2A2126)}
.aa-img{width:72px;height:72px;object-fit:cover;border:1px solid var(--line,#3B2E34);border-radius:var(--r,3px)}
`;
    document.head.appendChild(css);
    raiz = document.createElement('div');
    raiz.className = 'aa-scrim';
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
        alCambiar(ev);
        ir(st.paso + 1);
      }
    });
  }

  function abrir(cfg){
    montar();
    const d = Object.assign({
      nombre: '', tipoItem: 'arma_1m', tipoDado: 8, peso: 1, danoFijo: 0, danoAmplificado: 0,
      armaDeRango: false, mods: [], detalle: '', descripcionNarrativa: '', tier: 'Común',
      precioCompra: 0, ranuras: 1, imagen: '',
      equipoEstadoNombre: '', equipoEstadoHpTurno: 0, equipoEstadoDetalle: '', equipoEstadoPreset: '',
    }, structuredClone(cfg.draft || {}));
    if(!String(d.tipoItem || '').startsWith('arma_')) d.tipoItem = 'arma_1m';
    if(!DADOS.includes(n(d.tipoDado))) d.tipoDado = 8;
    d.mods = Array.isArray(d.mods) ? d.mods : [];
    st = {cfg, d, paso: cfg.paso || 0, destino: cfg.destinos ? cfg.destinos.valor : null,
      estadoAbierto: !!String(d.equipoEstadoNombre || '').trim()};
    document.getElementById('aa-titulo').textContent = cfg.titulo || (cfg.nuevo ? 'Nueva arma' : 'Editar arma');
    dibujar();
    raiz.classList.add('open');
    setTimeout(() => raiz.querySelector('#aa-body input')?.focus(), 40);
  }

  function cerrar(){
    if(!raiz) return;
    raiz.classList.remove('open');
    st = null;
  }

  function ir(i){
    if(!st) return;
    const total = pasos().length;
    const destino = Math.max(0, Math.min(total - 1, i));
    if(destino > 0 && !st.d.nombre.trim()){
      st.paso = 0;
      dibujar();
      avisar('Primero ponele un nombre');
      raiz.querySelector('[data-aa-c="nombre"]')?.focus();
      return;
    }
    st.paso = destino;
    dibujar();
    raiz.querySelector('#aa-body input:not([type=file]),#aa-body textarea')?.focus();
  }

  function avisar(msg){
    if(typeof toast === 'function') toast(msg); else alert(msg);
  }

  function portador(){
    const c = st.cfg;
    if(!c.portador) return null;
    return c.portador(st.destino);
  }

  // Textos que cambian según quién usa el arma.
  function quien(){
    const ctx = st.cfg.contexto;
    const p = portador();
    return {
      ctx, p,
      nombreAyuda: ctx === 'creep'
        ? 'Es el nombre que se lee en la tarjeta del creep y en la Mesa cada vez que ataca o tira daño con ella.'
        : ctx === 'tienda'
          ? 'Es como la ven los jugadores en la tienda y, si la compran, en su Equipo y en la Botonera.'
          : 'Es como aparece en el catálogo del fabricante, en las tiendas que la sorteen y en las fichas de quien la tenga.',
      quienLaUsa: ctx === 'creep' ? (p && p.nombre ? p.nombre : 'el creep') : 'quien la use',
    };
  }

  const efecto = txt => `<div class="aa-efecto">${txt}</div>`;
  const op = (attr, valor, activa, texto) => `<button type="button" class="aa-op ${activa ? 'activa' : ''}" data-aa-${attr}="${valor}">${texto}</button>`;
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
    const tipo = n(d.tipoDado) || 8;
    let h = `<div class="aa-chips">${L.map((x, i) => {
      const bloqueado = cfg.nuevo && i > st.paso && !d.nombre.trim();
      return `<button type="button" class="aa-chip${i === st.paso ? ' activo' : ''}${i < st.paso ? ' hecho' : ''}" data-aa-paso="${i}" ${bloqueado ? 'disabled' : ''}>${i + 1}. ${x.corto}</button>`;
    }).join('')}</div>`;
    const titulo = (t, ayuda) => { h += `<div class="aa-titulo">${t}</div><p class="aa-ayuda">${ayuda}</p>`; };

    if(paso.id === 'nombre'){
      titulo('¿Cómo se llama el arma?', q.nombreAyuda);
      h += campo('Nombre', input('nombre', d.nombre, 'placeholder="ej. Hacha oxidada del pantano"'));
      if(cfg.destinos){
        h += campo(cfg.destinos.label, `<select data-aa-destino="1">${cfg.destinos.opciones.map(o => `<option value="${e(o.v)}" ${String(st.destino) === String(o.v) ? 'selected' : ''}>${e(o.l)}</option>`).join('')}</select>`,
          'Si no la equipás a ningún creep, igual la podés publicar en el catálogo desde el último paso.');
      }
      if(cfg.tiers){
        h += campo('Tier (rareza)', `<select data-aa-c="tier">${cfg.tiers.map(t => `<option value="${e(t)}" ${d.tier === t ? 'selected' : ''}>${e(t)}</option>`).join('')}</select>`,
          q.ctx === 'creep'
            ? 'Solo importa si la publicás en el catálogo: decide en qué tiendas puede salir. "A definir" la deja marcada para revisarla.'
            : 'Marca qué tan rara es: el generador de tiendas sortea más seguido las comunes, y en la ficha Excepcional y Legendario no aparecen en el catálogo general (solo en tiendas).');
      }
      if(cfg.conNarrativa){
        h += campo('Descripción narrativa (opcional)', `<textarea data-aa-c="descripcionNarrativa" rows="2" placeholder="ej. Hoja ancha de un solo filo, gastada de tanto uso.">${e(d.descripcionNarrativa)}</textarea>`,
          'Es solo color: la lee el jugador al mirar el arma, no tiene ningún efecto.');
      }
      if(cfg.conImagen){
        h += campo('Imagen (opcional)', `<div style="display:flex;gap:10px;align-items:center">
          ${d.imagen ? `<img class="aa-img" src="${d.imagen}" alt="">` : ''}
          <input type="file" accept="image/*" data-aa-imagen="1">
          ${d.imagen ? '<button type="button" class="aa-op" data-aa-quitarimg="1">Quitar</button>' : ''}
        </div>`, 'Se ve en el catálogo y en el Equipo de quien la tenga.');
      }
    }

    if(paso.id === 'tipo'){
      titulo('¿De qué Tipo es?', 'El Tipo decide tres cosas a la vez: <b>el dado de daño</b> (Tipo 6 = cada dado es un d6), <b>cuántos Nitros cuesta atacar</b> (el primer ataque del turno con esta arma cuesta la mitad del Tipo; los siguientes, el Tipo entero) y <b>contra qué resistencia a críticos choca</b>. Más Tipo = más daño por golpe, pero menos golpes por turno.');
      h += `<div class="aa-tipos">${DADOS.map(t => `<button type="button" class="aa-tipo ${tipo === t ? 'activa' : ''}" data-aa-tipo="${t}">
          <b>${t}</b><span>${e(TIPOS[t].nombre)} · d${t}</span>
          <small>${e(TIPOS[t].ejemplo)} · atacar: ${primer(t)} No2 el primero, ${t} los siguientes</small>
        </button>`).join('')}</div>`;
      let txt = `Con <b>Tipo ${tipo}</b>: cada dado de daño es un <b>d${tipo}</b>. Atacar cuesta <b>${primer(tipo)} No2</b> el primer golpe del turno y <b>${tipo} No2</b> cada golpe siguiente.`;
      if(p){
        const a = ataques(tipo, n(p.nitros));
        txt += `<br>Con sus ${f(n(p.nitros))} No2, <b>${e(p.nombre || 'el creep')}</b> ataca <b>${a} ${a === 1 ? 'vez' : 'veces'} por turno</b> con ella (si no gasta Nitros en otra cosa).`;
        txt += `<br>Un crítico suyo choca contra la <b>Res. crítico Tipo ${tipo}</b> del personaje que reciba el golpe.`;
      }else{
        txt += `<br>Ataques por turno según los No2 del personaje: ${[4, 6, 8, 12].map(x => `con ${x} → <b>${ataques(tipo, x)}</b>`).join(' · ')}.`;
        txt += `<br>Un crítico con esta arma choca contra la <b>Res. crítico Tipo ${tipo}</b> del rival.`;
      }
      h += efecto(txt);
      const ej = cfg.ejemplos ? cfg.ejemplos(tipo) : [];
      if(ej.length) h += `<div class="aa-nota">En el catálogo, Tipo ${tipo}: ${e(ej.slice(0, 6).join(', '))}${ej.length > 6 ? '…' : ''}</div>`;
    }

    if(paso.id === 'empunadura'){
      titulo('¿Cómo se empuña y a qué distancia pega?', 'Las manos que ocupa definen qué más se puede llevar al mismo tiempo; la distancia define si el daño suma el Dmg (que sale de la Fuerza).');
      const dos = d.tipoItem === 'arma_2m';
      h += campo('Manos', `<div class="aa-opciones">${op('manos', 'arma_1m', !dos, 'Una mano')}${op('manos', 'arma_2m', dos, 'Dos manos')}</div>`);
      h += efecto(q.ctx === 'creep'
        ? `Un creep lleva <b>una sola arma</b>: las manos no le cambian nada al creep. Solo cuentan si después la publicás en el catálogo (un jugador ${dos ? 'no podría llevar escudo ni otra arma con ella' : 'podría llevar un escudo u otra arma en la otra mano'}).`
        : dos
          ? 'Ocupa <b>las dos manos</b>: mientras el jugador la tenga equipada no puede llevar escudo ni otra arma.'
          : 'Ocupa <b>una mano</b>: la otra queda libre para un escudo o una segunda arma. Con dos armas, cada una paga su propio primer ataque del turno y el PdG de cada una solo cuenta cuando se ataca con ella.');
      h += campo('Distancia', `<div class="aa-opciones">${op('rango', '0', !d.armaDeRango, 'Cuerpo a cuerpo')}${op('rango', '1', !!d.armaDeRango, 'A distancia')}</div>`);
      h += efecto(d.armaDeRango
        ? `Es <b>de rango</b> (arco, pistola, lanzallamas…): el daño <b>no suma el Dmg</b> de ${e(q.quienLaUsa)}. Es solo el del arma.`
        : `Es <b>cuerpo a cuerpo</b>: al tirar daño se suma el <b>Dmg</b> de ${e(q.quienLaUsa)}${p ? ` (hoy ${f(n(p.dmg))})` : ''}.`);
      h += campo('Alcance extra (+ Rango)', `<input data-aa-rng="1" type="number" step="1" value="${modVal(d, 'rng')}" style="max-width:120px">`,
        `Casilleros de más a los que llega (una lanza o un látigo suelen dar +1).${p && p.rango !== undefined ? ` Hoy el Rango de ${e(p.nombre || 'el creep')} es ${f(n(p.rango))}.` : ''}`);
    }

    if(paso.id === 'dano'){
      titulo('¿Cuánto pesa y cuánto daño hace?', q.ctx === 'creep'
        ? 'El <b>Peso</b> es la cantidad de dados de daño. Los creeps no llevan cuenta de carga, así que para el creep solo decide los dados.'
        : 'El <b>Peso</b> es a la vez la cantidad de dados de daño y lo que carga el jugador: un arma pesada pega más fuerte, pero ocupa más de su Carga máxima mientras la tenga equipada.');
      h += `<div class="aa-fila">
        ${campo('Peso (= dados)', num('peso', d.peso, 'step="1" min="1"'))}
        ${campo('Daño fijo', num('danoFijo', d.danoFijo, 'step="1"'))}
        ${campo('Daño amplificado', num('danoAmplificado', d.danoAmplificado, 'step="1" min="0"'))}
      </div>`;
      h += efecto(`<span id="aa-dano">${danoHtml()}</span>`);
      h += `<div class="aa-nota"><b>Daño fijo</b>: se suma siempre al resultado de los dados. <b>Daño amplificado</b>: dados de más que no pesan (un arma liviana que pega como una pesada).</div>`;
      if(q.ctx !== 'creep') h += efecto(`Equipada, suma <b id="aa-carga">${f(n(d.peso))}</b> a la carga del jugador. En la mochila no pesa: ocupa ranuras.`);
    }

    if(paso.id === 'bonos'){
      titulo('¿Mejora algún stat mientras se lleva?', `Cada bono suma (o resta, con negativo) a ese stat mientras ${e(q.quienLaUsa)} tenga el arma. Si no tiene ninguno, seguí.`);
      const opciones = sel => (cfg.stats || []).map(s => `<option value="${e(s.id)}" ${sel === s.id ? 'selected' : ''}>${e(s.label)}</option>`).join('');
      h += `<div class="aa-campo"><label>Bonos</label>
        ${d.mods.map((m, i) => APARTE.includes(m.stat) ? '' : `<div class="aa-mod">
          <select data-aa-modstat="${i}"><option value="">— elegir stat —</option>${opciones(m.stat)}</select>
          <input data-aa-modval="${i}" type="number" step="any" value="${e(m.val)}">
          <button type="button" class="aa-x" data-aa-modrm="${i}">×</button>
        </div>`).join('')}
        <div class="aa-opciones">${RAPIDOS.map(([id, t]) => `<button type="button" class="aa-op" data-aa-modadd="${id}">+ ${t}</button>`).join('')}
          <button type="button" class="aa-op" data-aa-modadd="">+ Otro stat</button></div>
      </div>`;
      h += efecto(`<b>PdG</b>: probabilidad de golpe${q.ctx === 'creep' ? '' : '; en un jugador solo cuenta cuando ataca con esta arma (no se suma a la otra mano)'}.
        <br><b>Crítico</b>: más chance de que el golpe sea crítico (un crítico ignora la Defensa del rival).
        <br><b>Parry</b>: ayuda a desviar golpes. <b>Bloqueo</b>: frena daño. <b>Dmg</b>: suma al daño de los golpes cuerpo a cuerpo.
        <br>Los demás (Fuerza, Evasión…) se suman igual mientras ${e(q.quienLaUsa)} la tenga.`);
    }

    if(paso.id === 'efectos'){
      titulo('¿Tiene algún efecto especial?', 'Lo que hace además del daño. Si no tiene nada especial, dejalo vacío y seguí.');
      h += campo('Qué hace además del daño', `<textarea data-aa-c="detalle" rows="3" placeholder="ej. Sangrado al golpear. Ignora 1 de resistencia al crítico.">${e(d.detalle)}</textarea>`);
      h += efecto(q.ctx === 'creep'
        ? 'Los efectos <b>al golpear</b> (Sangrado, Veneno, Rompe armadura, ignorar resistencia al crítico…) <b>no se aplican solos</b>: quedan escritos en la tarjeta del creep y los aplicás vos sobre el personaje cuando el creep pega.'
        : 'Los efectos <b>sobre el rival al golpear</b> (Sangrado, Veneno, Rompe armadura, ignorar resistencia al crítico…) <b>no se aplican solos</b>: el jugador los lee acá y se aplican a mano cuando pega.');
      if(cfg.conEstadoEquipar){
        if(st.estadoAbierto){
          h += campo('Estado alterado al equipar', input('equipoEstadoNombre', d.equipoEstadoNombre, 'placeholder="ej. Regeneración"'));
          h += `<div class="aa-fila">${campo('HP por turno (mientras esté puesta)', num('equipoEstadoHpTurno', d.equipoEstadoHpTurno, 'step="any"'))}</div>`;
          h += campo('Detalle del estado', `<textarea data-aa-c="equipoEstadoDetalle" rows="2" placeholder="Qué hace el estado. Si lo dejás vacío se usa el detalle del arma.">${e(d.equipoEstadoDetalle)}</textarea>`);
          if(cfg.conPresetEstado){
            h += campo('Preset que hereda (opcional)', input('equipoEstadoPreset', d.equipoEstadoPreset, 'placeholder="ej. Afortunado, Sangre pura…"'),
              'Si coincide EXACTO con un preset de Estados alterados de la ficha, el arma hereda su mecánica real. Si no, el estado aparece igual pero como recordatorio.');
          }
          h += `<button type="button" class="aa-op" data-aa-estado="0">Quitar estado alterado</button>`;
          h += efecto('El estado al equipar <b>sí es automático</b>: se activa sobre el jugador al ponérsela y se va al sacársela (ej. una espada que regenera 2 HP por turno mientras la lleva).');
        }else{
          h += `<button type="button" class="aa-op" data-aa-estado="1">+ Estado alterado al equipar</button>
            <div class="aa-nota" style="margin-top:6px">Para efectos sobre quien la lleva que duran mientras la tenga puesta.</div>`;
        }
      }
    }

    if(paso.id === 'precio'){
      titulo('¿Cuánto vale?', q.ctx === 'creep'
        ? 'Solo importa si la publicás en el catálogo: a un creep no le cambia nada.'
        : 'El precio sirve para comprarla y venderla en las tiendas.');
      if(cfg.conPrecio){
        h += campo('Precio de compra (DDE)', num('precioCompra', d.precioCompra, 'step="1" min="0" style="max-width:140px"'));
        h += efecto(`<span id="aa-precio">${precioHtml()}</span>`);
      }
      if(cfg.conRanuras){
        h += campo('Ranuras que ocupa en la mochila', num('ranuras', d.ranuras, 'step="1" min="0" style="max-width:120px"'),
          'Lo que ocupa cuando el jugador la guarda en vez de tenerla equipada (equipada, pesa; en la mochila, ocupa ranuras).');
      }
    }

    if(paso.id === 'listo'){
      titulo('Revisá cómo quedó', 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.');
      const fila = (a, b) => `<div class="aa-resumen-fila"><span>${a}</span><b>${b}</b></div>`;
      const nombreStat = id => ((cfg.stats || []).find(s => s.id === id) || {}).label || id;
      const bonos = d.mods.filter(m => m.stat && n(m.val)).map(m => `${nombreStat(m.stat)} ${n(m.val) > 0 ? '+' : ''}${f(n(m.val))}`).join(', ');
      const dest = cfg.destinos ? (cfg.destinos.opciones.find(o => String(o.v) === String(st.destino)) || {}).l : '';
      h += `<div class="aa-resumen">
        <div class="aa-resumen-nombre">${e(d.nombre || '(sin nombre)')}</div>
        ${cfg.destinos ? fila(cfg.destinos.label, e(dest || '—')) : ''}
        ${cfg.tiers ? fila('Tier', e(d.tier)) : ''}
        ${fila('Tipo', e(`Tipo ${tipo} · ${TIPOS[tipo].nombre}`))}
        ${fila('Empuñadura', d.tipoItem === 'arma_2m' ? 'dos manos' : 'una mano')}
        ${fila('Distancia', d.armaDeRango ? 'a distancia (no suma Dmg)' : 'cuerpo a cuerpo')}
        ${fila('Daño', e(danoTxt(d)))}
        ${fila('Atacar', `${primer(tipo)} No2 el primero, ${tipo} los siguientes`)}
        ${fila('Bonos', e(bonos || 'ninguno'))}
        ${fila('Efectos', e(String(d.detalle || '').trim() || 'ninguno'))}
        ${cfg.conEstadoEquipar ? fila('Al equipar', e(String(d.equipoEstadoNombre || '').trim() || 'ningún estado')) : ''}
        ${cfg.conPrecio ? fila('Precio', `${f(n(d.precioCompra))} DDE`) : ''}
        ${cfg.conRanuras ? fila('Ranuras', f(n(d.ranuras))) : ''}
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
    pie.innerHTML = (cfg.botones || []).map((b, i) => `<button type="button" class="btn ghost aa-izq" data-aa-extra="${i}" title="${e(b.titulo || '')}" ${listo ? '' : 'style="display:none"'}>${e(b.texto)}</button>`).join('')
      + `<button type="button" class="btn ghost" data-aa="cerrar">Cancelar</button>`
      + `<button type="button" class="btn primary" data-aa="guardar" ${listo ? '' : 'style="display:none"'}>${e(cfg.textoGuardar || 'Guardar')}</button>`;
  }

  function danoHtml(){
    const d = st.d, p = portador();
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    const caras = n(d.tipoDado) || 8, fijo = n(d.danoFijo);
    const min = dados + fijo, max = dados * caras + fijo;
    const prom = Math.round((dados * (caras + 1) / 2 + fijo) * 10) / 10;
    let t = `Tira <b>${e(danoTxt(d))}</b>: entre ${f(min)} y ${f(max)}, ${f(prom)} en promedio.`;
    if(d.armaDeRango) t += ' Es de rango: no suma Dmg.';
    else if(p) t += ` Con el Dmg de ${e(p.nombre || 'el creep')} (${f(n(p.dmg))}): entre ${f(min + n(p.dmg))} y ${f(max + n(p.dmg))}.`;
    else t += ' Al tirar se le suma el Dmg de quien la use.';
    return t;
  }

  function precioHtml(){
    const d = st.d;
    return `Se compra a <b>${f(n(d.precioCompra))}</b> DDE y el jugador la vende a la mitad: <b>${f(n(d.precioCompra) / 2)}</b>.${st.cfg.precioTxt ? ' ' + st.cfg.precioTxt(d) : ''}`;
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
    if(ds.aaTipo) d.tipoDado = n(ds.aaTipo);
    else if(ds.aaManos) d.tipoItem = ds.aaManos;
    else if(ds.aaRango) d.armaDeRango = ds.aaRango === '1';
    else if(ds.aaModadd !== undefined) d.mods.push({stat: ds.aaModadd, val: ds.aaModadd ? 1 : 0});
    else if(ds.aaModrm !== undefined) d.mods.splice(n(ds.aaModrm), 1);
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
    if(t.dataset.aaC){
      const c = t.dataset.aaC;
      d[c] = NUMERICOS.includes(c) ? n(t.value) : t.value;
      // Los textos con cuentas se actualizan en su lugar (redibujar al
      // confirmar el número se comería el clic en "Siguiente").
      const poner = (id, html) => { const el = document.getElementById(id); if(el) el.innerHTML = html; };
      if(['peso', 'danoFijo', 'danoAmplificado'].includes(c)) poner('aa-dano', danoHtml());
      if(c === 'peso') poner('aa-carga', String(f(n(d.peso))));
      if(c === 'precioCompra') poner('aa-precio', precioHtml());
      if(c === 'nombre') raiz.querySelectorAll('[data-aa-paso]').forEach(x => { x.disabled = false; });
    }
    if(t.dataset.aaRng) setMod(d, 'rng', n(t.value));
    if(t.dataset.aaModstat !== undefined) d.mods[n(t.dataset.aaModstat)].stat = t.value;
    if(t.dataset.aaModval !== undefined) d.mods[n(t.dataset.aaModval)].val = n(t.value);
  }

  function alCambiar(ev){
    if(!st) return;
    const t = ev.target;
    alEscribir(ev);
    if(t.dataset.aaDestino){ st.destino = t.value; dibujar(); return; }
    if(t.dataset.aaImagen && t.files && t.files[0]){
      const r = new FileReader();
      r.onload = () => { if(st){ st.d.imagen = r.result; dibujar(); } };
      r.readAsDataURL(t.files[0]);
    }
  }

  // Copia lista para guardar: sin bonos vacíos ni en cero.
  function limpio(){
    const d = structuredClone(st.d);
    d.nombre = d.nombre.trim();
    d.peso = Math.max(1, n(d.peso) || 1);
    d.danoAmplificado = Math.max(0, n(d.danoAmplificado));
    d.mods = d.mods.filter(m => m.stat && n(m.val));
    return d;
  }

  function guardar(){
    if(!st.d.nombre.trim()){ ir(0); return; }
    if(st.cfg.onGuardar(limpio(), st.destino) !== false) cerrar();
  }

  return {abrir, cerrar, abierto: () => !!st, TIPOS, DADOS};
})();
