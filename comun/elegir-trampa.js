/* =========================================================
   ELEGIR-TRAMPA — «🪤 Esta habilidad coloca una trampa»: el menú para elegir qué trampa (2026-10-02, pedido del dueño). En la ventana
   común paso a paso (comun/paso-a-paso.js). Tres caminos:
   - **Una trampa conocida**: se elige un tipo (Púas, Cepo, Veneno, Explosiva…; los conceptos salen del catálogo de trampas,
     comun/trampas-base.js, hasta que se auditen) y el paso a paso pregunta lo justo de ese tipo: si es de veneno, cuánto daño por turno y
     cuántos turnos; si es de púas, cuánto daño y si tiene un efecto adicional; etc. Todo arranca con valores sugeridos.
   - **Armar de cero**: el asistente completo de siempre (comun/asistente-trampa.js).
   - **Del catálogo de trampas**: las de fábrica y las que subió el grupo (`cfg.alCatalogo`, lo pone cada editor).
   Lo usan los tres editores de habilidades: personaje (comun/ficha-editor.js), creep (comun/creep-editor.js) e invocación (ficha js/04).
     ElegirTrampa.abrir({inicial (la trampa actual, forma única, o null), alTerminar(trampa), alCancelar(), alCatalogo?(), z?, contenedor?})
   La trampa vuelve en la forma única (P123, comun/plantillas.js), vía AsistenteTrampa.aTrampa; puede traer `estadoStacks`.
   ========================================================= */
const ElegirTrampa = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const SALVACIONES = [['Evasión', 'Evasión'], ['Fuerza', 'Fuerza'], ['Res.CC', 'Res. a controles'], ['Res.Esp', 'Res. especial'], ['Res.Mt', 'Res. mental']];
  const COLORES = ['#5C4033', '#8A8A8A', '#6B8E23', '#D9531E', '#E25822', '#7FB3D5', '#E6D84A', '#8E6BBF', '#3F6FB0', '#C4485A'];

  /* Los tipos de trampa (conceptos del catálogo; las cifras son una propuesta, a auditar). `pasos`: qué se pregunta, en orden, además de
     Tamaño (siempre primero) y Nombre (siempre al final). `def`: los valores con que arranca. `sugeridos`: los estados que se ofrecen primero. */
  const CONCEPTOS = [
    {id: 'puas', icono: '🗡', nombre: 'Púas y estacas', idea: 'Un pozo o un piso de púas: daño físico a quien la pisa.', base: 'Foso con estacas',
      pasos: ['dano', 'extra', 'evita'], sugeridos: ['Sentado', 'Sangrado', 'Rengo'],
      def: {forma: 'flor', radio: 0, dados: 3, caras: 6, armadura: true, estado: 'Sentado', estadoTurnos: 1, sal: ['Evasión', 12], color: '#5C4033', amiga: true, detectar: 'des'}},
    {id: 'cepo', icono: '🪤', nombre: 'Cepo (trampa de oso)', idea: 'Mandíbulas de metal: daño y queda agarrado.', base: 'Trampa de oso',
      pasos: ['dano', 'estado', 'evita'], sugeridos: ['Inmovilizado', 'Rengo', 'Sangrado'],
      def: {forma: 'flor', radio: 0, dados: 2, caras: 6, armadura: true, estado: 'Inmovilizado', estadoTurnos: 2, sal: null, color: '#8A8A8A', amiga: true, detectar: 'des'}},
    {id: 'red', icono: '🕸', nombre: 'Red', idea: 'Atrapa sin lastimar.', base: 'Red de caza',
      pasos: ['estado', 'evita'], sugeridos: ['Inmovilizado', 'Rengo'],
      def: {forma: 'flor', radio: 1, dados: 0, estado: 'Inmovilizado', estadoTurnos: 1, sal: ['Evasión', 10], color: '#B5A642', amiga: true, detectar: 'des'}},
    {id: 'veneno', icono: '☠', nombre: 'Veneno', idea: 'Dardos o púas envenenadas: un pinchazo y el veneno sigue haciendo daño.', base: 'Dardos envenenados',
      pasos: ['dano', 'estado', 'evita'], sugeridos: ['Veneno', 'Veneno severo'],
      def: {forma: 'linea', largo: 3, dados: 1, caras: 6, armadura: true, estado: 'Veneno', estadoStacks: 3, estadoTurnos: 3, sal: ['Evasión', 10], color: '#6B8E23', amiga: true, detectar: 'des'}},
    {id: 'gas', icono: '☁', nombre: 'Gas', idea: 'Una nube que adormece, marea o envenena a los de adentro.', base: 'Gas somnífero',
      pasos: ['estado', 'evita'], sugeridos: ['Exhausto', 'Pajaritos', 'Veneno', 'Cansado'],
      def: {forma: 'flor', radio: 2, dados: 0, estado: 'Exhausto', estadoTurnos: 2, sal: ['Res.CC', 10], color: '#8FBC8F', amiga: true, detectar: 'des'}},
    {id: 'explosiva', icono: '💥', nombre: 'Explosiva', idea: 'Una mina o un barril: mucho daño en área; la armadura no sirve.', base: 'Mina explosiva',
      pasos: ['dano', 'extra', 'evita'], sugeridos: ['Sentado', 'Pajaritos', 'Armadura rota'],
      def: {forma: 'flor', radio: 2, dados: 3, caras: 6, armadura: false, estado: '', sal: ['Evasión', 12], color: '#D9531E', amiga: true, detectar: 'des'}},
    {id: 'fuego', icono: '🔥', nombre: 'Fuego', idea: 'Una llamarada al pisarla.', base: 'Llamarada',
      pasos: ['dano', 'extra', 'evita'], sugeridos: ['Pajaritos', 'Miedo'],
      def: {forma: 'flor', radio: 1, dados: 2, caras: 6, armadura: false, estado: '', sal: ['Evasión', 10], color: '#E25822', amiga: true, detectar: 'des'}},
    {id: 'hielo', icono: '❄', nombre: 'Hielo', idea: 'Escarcha repentina: daño y la deja lenta.', base: 'Trampa de escarcha',
      pasos: ['dano', 'estado', 'evita'], sugeridos: ['Escarcha', 'Rengo', 'Inmovilizado'],
      def: {forma: 'flor', radio: 1, dados: 2, caras: 6, armadura: false, estado: 'Escarcha', estadoTurnos: 2, sal: ['Res.Esp', 10], color: '#7FB3D5', amiga: false, detectar: 'dmgesp'}},
    {id: 'electrica', icono: '⚡', nombre: 'Eléctrica', idea: 'Una descarga: daño y la deja aturdida.', base: 'Descarga eléctrica',
      pasos: ['dano', 'estado', 'evita'], sugeridos: ['Stun', 'Parálisis', 'Pajaritos'],
      def: {forma: 'flor', radio: 1, dados: 3, caras: 6, armadura: false, estado: 'Stun', estadoTurnos: 1, sal: ['Res.Esp', 12], color: '#E6D84A', amiga: false, detectar: 'dmgesp'}},
    {id: 'pegajosa', icono: '🫗', nombre: 'Pegajosa o resbaladiza', idea: 'Brea o aceite: frena a quien la pisa.', base: 'Brea pegajosa',
      pasos: ['estado', 'evita'], sugeridos: ['Rengo', 'Sentado', 'Inmovilizado'],
      def: {forma: 'flor', radio: 2, dados: 0, estado: 'Rengo', estadoTurnos: 2, sal: ['Evasión', 10], color: '#3A2A20', amiga: true, detectar: 'des'}},
    {id: 'runa', icono: '🔮', nombre: 'Runa (maldición)', idea: 'Un glifo mágico que maldice a quien lo pisa: debilidad, miedo, confusión…', base: 'Runa de debilidad',
      pasos: ['estado', 'evita'], sugeridos: ['Lisiado', 'Miedo', 'Pajaritos', 'Cansado'],
      def: {forma: 'flor', radio: 1, dados: 0, estado: 'Lisiado', estadoTurnos: 2, sal: ['Res.Esp', 10], color: '#8E6BBF', amiga: false, detectar: 'dmgesp'}},
    {id: 'alarma', icono: '🔔', nombre: 'Alarma', idea: 'No lastima: avisa cuando alguien pasa.', base: 'Cable de alarma',
      pasos: [], sugeridos: [],
      def: {forma: 'linea', largo: 3, dados: 0, estado: '', sal: null, color: '#C0A060', amiga: true, detectar: 'des'}},
  ];
  const NOMBRES = {como: 'Cómo', tipo: 'Tipo', tamano: 'Tamaño', dano: 'Daño', estado: 'Qué le deja', extra: 'Efecto adicional', evita: 'Se evita', nombre: 'Nombre', resumen: 'Resumen'};

  let cssPuesto = false;
  function estilos(){
    if(cssPuesto) return;
    cssPuesto = true;
    const s = document.createElement('style');
    s.textContent = `
.et-c{font-size:14px;line-height:1.5}
.et-c .et-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.et-c .et-op{display:flex;flex-direction:column;gap:3px;text-align:left;padding:10px 12px;border:1px solid var(--pap-linea,#3B2E34);border-radius:4px;
  background:rgba(255,255,255,.02);color:var(--pap-papel,#EDE3D2);cursor:pointer;font:inherit}
.et-c .et-op:hover{border-color:var(--pap-cobre,#C98545)}
.et-c .et-op.on{border-color:var(--pap-laton,#E0A458);background:rgba(224,164,88,.12)}
.et-c .et-op b{font-size:15px}.et-c .et-op small{color:var(--pap-tenue,#9A867E);font-size:12.5px;line-height:1.4}
.et-c .et-op .et-ico{font-size:24px;line-height:1}
.et-c .et-grande{flex-direction:row;gap:12px;align-items:flex-start;padding:14px}
.et-c .et-grande b,.et-c .et-grande small{display:block}.et-c .et-grande small{margin-top:4px}
.et-c h4{margin:14px 0 6px;font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--pap-tenue,#9A867E)}
.et-c .et-fila{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:8px 0}
.et-c .et-fila input[type=number]{width:80px}
.et-c .et-colores{display:flex;gap:6px;flex-wrap:wrap}
.et-c .et-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.et-c .et-color.on{border-color:var(--pap-papel,#EDE3D2)}
.et-c .et-rf{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid var(--pap-linea2,#2A2126)}
.et-c .et-rf span{color:var(--pap-tenue,#9A867E)}`;
    document.head.appendChild(s);
  }

  const debuffs = () => (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS ? EstadosAplicar.DEBUFFS : []).filter(p => !p.permanente);
  const presetDe = nombre => debuffs().find(p => p.nombre === nombre) || null;
  const conStacks = nombre => { const p = presetDe(nombre); return !!(p && (p.esVeneno || p.esSangrado)); };

  function abrir(cfg){
    cfg = cfg || {};
    estilos();
    const st = {modo: 'concepto', concepto: null};
    const c = () => CONCEPTOS.find(x => x.id === st.concepto) || null;
    function cargar(con){
      const d = con.def;
      Object.assign(st, {concepto: con.id, forma: d.forma, radio: d.radio || 0, largo: d.largo || 3, cant: 1,
        haceDano: d.dados > 0, dados: d.dados || 2, caras: d.caras || 6, fijo: 0, armadura: d.armadura !== false,
        estado: d.estado || '', estadoTurnos: d.estadoTurnos || 0, estadoStacks: d.estadoStacks || 0,
        seEvita: !!d.sal, salStat: d.sal ? d.sal[0] : 'Evasión', salDif: d.sal ? d.sal[1] : 10,
        nombre: con.base === 'Cable de alarma' ? 'Alarma' : con.nombre.replace(/ \(.*\)$/, ''), descripcion: '', color: d.color, amiga: !!d.amiga, detectar: d.detectar});
    }
    const pasos = () => {
      const base = ['como'];
      if(st.modo !== 'concepto') return base;
      base.push('tipo');
      if(!c()) return base;
      return base.concat(['tamano'], c().pasos, ['nombre', 'resumen']);
    };
    const danoTxt = () => st.haceDano && st.dados > 0 ? `${st.dados}d${st.caras}${st.fijo ? (st.fijo > 0 ? '+' : '') + st.fijo : ''}` : '';
    const falta = id => {
      if(id === 'tipo' && !c()) return 'Elegí un tipo de trampa.';
      if(id === 'dano' && st.haceDano && !(st.dados >= 1)) return 'Poné cuántos dados de daño (1 o más).';
      if(id === 'nombre' && !String(st.nombre || '').trim()) return 'Ponele un nombre a la trampa.';
      return '';
    };
    const faltaAntes = i => { const ps = pasos(); for(let k = 0; k < Math.min(i, ps.length); k++){ const f = falta(ps[k]); if(f) return f; } return ''; };

    function htmlEstado(conNinguno){
      const sug = (c() ? c().sugeridos : []).map(presetDe).filter(Boolean);
      const otros = debuffs().filter(p => !sug.includes(p));
      const tarjeta = p => `<button type="button" class="et-op${st.estado === p.nombre ? ' on' : ''}" data-et-estado="${esc(p.nombre)}"><b>${esc(p.nombre)}</b><small>${esc(String(p.detalle || '').slice(0, 110))}</small></button>`;
      const pre = presetDe(st.estado);
      return (conNinguno ? `<div class="et-grid" style="margin-bottom:8px"><button type="button" class="et-op${!st.estado ? ' on' : ''}" data-et-estado=""><b>Ninguno</b><small>Solo lo de los pasos anteriores.</small></button></div>` : '')
        + (sug.length ? `<h4>Los que suelen ir con este tipo</h4><div class="et-grid">${sug.map(tarjeta).join('')}</div>` : '')
        + `<h4><button type="button" class="pap-boton" data-et-otros="1">${st.verOtros ? '▾' : '▸'} Otros estados (${otros.length})</button></h4>${st.verOtros ? `<div class="et-grid">${otros.map(tarjeta).join('')}</div>` : ''}`
        + (st.estado ? `<h4>${esc(st.estado)}</h4>
          ${conStacks(st.estado) ? `<div class="et-fila"><label>¿Cuánto daño por turno?</label><input type="number" min="1" max="20" data-et="estadoStacks" value="${st.estadoStacks || num(pre && pre.stacks) || 1}"><span class="pap-nota" style="margin:0">stacks (1 de daño cada uno, por turno)</span></div>` : ''}
          <div class="et-fila"><label>¿Cuántos turnos?</label><input type="number" min="1" max="20" data-et="estadoTurnos" value="${st.estadoTurnos || num(pre && pre.turnos) || 1}"></div>` : '');
    }
    function cuerpo(id){
      if(id === 'como') return `<div class="et-grid">
          <button type="button" class="et-op et-grande${st.modo === 'concepto' ? ' on' : ''}" data-et-modo="concepto"><span class="et-ico">🧩</span><span><b>Una trampa conocida</b><small>Elegís el tipo (púas, cepo, veneno, explosiva…) y te pregunto solo lo que importa de ese tipo, con valores sugeridos.</small></span></button>
          <button type="button" class="et-op et-grande" data-et-modo="cero"><span class="et-ico">🪄</span><span><b>Armar de cero</b><small>Todas las opciones, paso a paso: forma, a quién alcanza, daño, estado, zona que deja, cómo se detecta…</small></span></button>
          ${cfg.alCatalogo ? `<button type="button" class="et-op et-grande" data-et-modo="catalogo"><span class="et-ico">📚</span><span><b>Del catálogo de trampas</b><small>Las de fábrica y las que subió el grupo, con buscador.</small></span></button>` : ''}
        </div>`;
      if(id === 'tipo') return `<p class="pap-nota">Son puntos de partida: después de elegir, cambiás lo que quieras. (Las cifras salen del catálogo y todavía están para auditar.)</p>
        <div class="et-grid">${CONCEPTOS.map(x => `<button type="button" class="et-op${st.concepto === x.id ? ' on' : ''}" data-et-concepto="${x.id}"><span class="et-ico">${x.icono}</span><b>${esc(x.nombre)}</b><small>${esc(x.idea)}</small></button>`).join('')}</div>`;
      if(id === 'tamano'){
        const linea = st.forma === 'linea';
        return `<div class="et-grid">
            <button type="button" class="et-op${!linea ? ' on' : ''}" data-et-forma="flor"><b>⬡ Redonda (flor)</b><small>Una casilla y las que la rodean.</small></button>
            <button type="button" class="et-op${linea ? ' on' : ''}" data-et-forma="linea"><b>➖ Línea</b><small>Una fila de casillas hacia afuera del token: un pasillo, un cable.</small></button></div>
          ${linea ? `<div class="et-fila"><label>Largo (casillas)</label><input type="number" min="1" max="20" data-et="largo" value="${st.largo}"></div>`
            : `<div class="et-fila"><label>Tamaño (radio)</label><input type="number" min="0" max="6" data-et="radio" value="${st.radio}"><span class="pap-nota" style="margin:0">0 = una sola casilla · 1 = una flor de 1 (7 casillas)…</span></div>`}
          <div class="et-fila"><label>¿Cuántas deja cada vez que la usás?</label><input type="number" min="1" max="6" data-et="cant" value="${st.cant}"></div>
          <p class="pap-nota">La habilidad la coloca oculta, al lado de quien la usa.</p>`;
      }
      if(id === 'dano') return `<label class="et-fila" style="cursor:pointer"><input type="checkbox" data-et="haceDano" ${st.haceDano ? 'checked' : ''} style="width:auto"> Hace daño al activarse</label>
          ${st.haceDano ? `<div class="et-fila"><input type="number" min="1" max="20" data-et="dados" value="${st.dados}"><span>d</span>
            <select data-et="caras">${[4, 6, 8, 10, 12, 20].map(n => `<option value="${n}"${st.caras === n ? ' selected' : ''}>${n}</option>`).join('')}</select>
            <span>+</span><input type="number" data-et="fijo" value="${st.fijo}"><b data-et-vista style="color:var(--pap-laton,#E0A458)">= ${esc(danoTxt())}</b></div>
            <label class="et-fila" style="cursor:pointer"><input type="checkbox" data-et="armadura" ${st.armadura ? 'checked' : ''} style="width:auto"> Contempla la armadura (se le resta la Defensa, como un golpe). Destildado: va directo a la vida.</label>` : ''}`;
      if(id === 'estado') return htmlEstado(true);
      if(id === 'extra') return `<p class="pap-nota">Algo más que le pasa a quien la pisa, además del daño (por ejemplo, queda Sentado o Sangrando).</p>` + htmlEstado(true);
      if(id === 'evita') return `<label class="et-fila" style="cursor:pointer"><input type="checkbox" data-et="seEvita" ${st.seEvita ? 'checked' : ''} style="width:auto"> Se puede evitar con una tirada (la resuelve la mesa a mano)</label>
          ${st.seEvita ? `<div class="et-fila"><select data-et="salStat">${SALVACIONES.map(([v, t]) => `<option value="${v}"${st.salStat === v ? ' selected' : ''}>${t}</option>`).join('')}</select><span>contra</span><input type="number" min="1" data-et="salDif" value="${st.salDif}"></div>` : ''}`;
      if(id === 'nombre') return `<div class="pap-campo"><label>Nombre</label><input data-et="nombre" maxlength="40" value="${esc(st.nombre)}"></div>
          <div class="pap-campo"><label>Qué hace, en palabras (opcional)</label><textarea data-et="descripcion" maxlength="200" placeholder="Si lo dejás vacío, se arma solo con lo que elegiste.">${esc(st.descripcion)}</textarea></div>
          <div class="pap-campo"><label>Color</label><div class="et-colores">${[...new Set([c().def.color, ...COLORES])].map(col => `<button type="button" class="et-color${st.color === col ? ' on' : ''}" data-et-color="${col}" style="background:${col}" title="${col}"></button>`).join('')}</div></div>
          <div class="pap-campo"><label>Para detectarla</label><select data-et="detectar"><option value="des"${st.detectar !== 'dmgesp' ? ' selected' : ''}>Percepción contra tu Destreza (trampa física)</option><option value="dmgesp"${st.detectar === 'dmgesp' ? ' selected' : ''}>Percepción contra tu Efecto especial (trampa mágica)</option></select></div>`;
      // resumen
      const t = AsistenteTrampa.aTrampa(resultado()), fila = (a, b) => `<div class="et-rf"><span>${a}</span><b>${esc(b)}</b></div>`;
      return `<div>${fila('Trampa', `${c().icono} ${t.nombre}`)}${fila('Qué hace', AsistenteTrampa.resumenTexto(t))}${fila('Se evita', st.seEvita ? `${st.salStat} contra ${st.salDif} (a mano)` : 'no')}
        ${fila('Detectarla', st.detectar === 'dmgesp' ? 'Percepción contra tu Efecto especial' : 'Percepción contra tu Destreza')}</div>
        <p class="pap-nota" style="margin-top:10px">${esc(t.detalle)}</p>`;
    }
    function resultado(){
      const tieneEstado = !!st.estado && (c().pasos.includes('estado') || c().pasos.includes('extra'));
      return {nombre: String(st.nombre || '').trim(), descripcion: String(st.descripcion || '').trim(), forma: st.forma, color: st.color, alfa: 45, amiga: !!st.amiga,
        radio: st.radio, cant: st.cant, largo: st.largo, dano: danoTxt(), contemplaArmadura: st.armadura,
        estado: tieneEstado ? st.estado : '', estadoTurnos: tieneEstado ? st.estadoTurnos : 0, estadoStacks: tieneEstado && conStacks(st.estado) ? st.estadoStacks : 0,
        teleport: false, salvacion: st.seEvita ? {stat: st.salStat, dif: st.salDif} : null, turnos: 0, dejaZona: false, detectarStat: st.detectar === 'dmgesp' ? 'dmgesp' : 'des'};
    }
    function deCero(){
      api.cerrar();
      const estados = debuffs().filter(p => num(p.turnos) > 0 && !p.esVeneno).map(p => ({nombre: p.nombre, detalle: p.detalle || '', turnos: num(p.turnos), permanente: false}));
      AsistenteTrampa.abrir({contexto: 'habilidad', editando: false, estados, inicial: AsistenteTrampa.inicialDe(cfg.inicial || {}),
        alTerminar: res => { if(cfg.alTerminar) cfg.alTerminar(AsistenteTrampa.aTrampa(res)); }, alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); }});
    }
    const api = PasoAPaso.abrir({
      // z: encima de los editores (también los del mapa), debajo del asistente completo de trampas (99985).
      titulo: '🪤 La trampa de la habilidad', crear: true, z: cfg.z || 99980, contenedor: cfg.contenedor, textoCrear: '✔ Usar esta trampa',
      pasos: () => pasos().map(id => ({id, nombre: NOMBRES[id] || id, html: () => `<div class="et-c">${cuerpo(id)}</div>`,
        ayuda: {como: '<b>¿Cómo la armás?</b>', tipo: '<b>¿Qué tipo de trampa es?</b>', tamano: '<b>¿De qué tamaño, y cuántas?</b>', dano: '<b>¿Cuánto daño hace?</b>',
          estado: '<b>¿Qué le deja a quien la pisa?</b>', extra: '<b>¿Tiene un efecto adicional?</b>', evita: '<b>¿Se puede evitar?</b>', nombre: '<b>¿Cómo se llama?</b>', resumen: '<b>Así queda.</b>'}[id] || ''})),
      puedeIr: i => faltaAntes(i),
      alClic: e => {
        const b = e.target.closest('button'); if(!b) return;
        const d = b.dataset;
        if(d.etModo){ if(d.etModo === 'cero'){ deCero(); return; } if(d.etModo === 'catalogo'){ api.cerrar(); cfg.alCatalogo(); return; } st.modo = d.etModo; api.redibujar(); api.irA('tipo'); return; }
        if(d.etConcepto){ cargar(CONCEPTOS.find(x => x.id === d.etConcepto)); api.redibujar(); api.irA('tamano'); return; }
        if(d.etForma){ st.forma = d.etForma; api.redibujar(); return; }
        if(d.etEstado !== undefined){ st.estado = d.etEstado; const p = presetDe(st.estado); st.estadoTurnos = num(p && p.turnos) || 1; st.estadoStacks = conStacks(st.estado) ? (num(p && p.stacks) || 1) : 0; api.redibujar(); return; }
        if(d.etOtros){ st.verOtros = !st.verOtros; api.redibujar(); return; }
        if(d.etColor){ st.color = d.etColor; api.redibujar(); return; }
      },
      alInput: e => {
        const t = e.target, k = t.dataset && t.dataset.et; if(!k || t.type === 'checkbox' || t.tagName === 'SELECT') return;
        if(['nombre', 'descripcion'].includes(k)) st[k] = t.value;
        else st[k] = Math.round(num(t.value));
        if(['dados', 'fijo'].includes(k)){ const v = api.raiz.querySelector('[data-et-vista]'); if(v) v.textContent = '= ' + danoTxt(); }
      },
      alCambio: e => {
        const t = e.target, k = t.dataset && t.dataset.et; if(!k) return;
        if(t.type === 'checkbox'){ st[k] = t.checked; api.redibujar(); return; }
        if(t.tagName === 'SELECT'){ st[k] = k === 'caras' ? num(t.value) : t.value; if(k === 'caras'){ const v = api.raiz.querySelector('[data-et-vista]'); if(v) v.textContent = '= ' + danoTxt(); } }
      },
      alTecla: e => { if(e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); if(api.paso() < pasos().length - 1) api.irA(api.paso() + 1); } },
      confirmarCancelar: '',
      alCrear: () => {
        if(!c()){ api.aviso('Elegí un tipo de trampa.'); return false; }
        const f = faltaAntes(pasos().length); if(f){ api.aviso(f); return false; }
        if(cfg.alTerminar) cfg.alTerminar(AsistenteTrampa.aTrampa(resultado()));
      },
      alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); },
    });
    return api;
  }
  return {abrir, CONCEPTOS};
})();
