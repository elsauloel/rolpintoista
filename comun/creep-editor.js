/* =========================================================
   CREEP-EDITOR — el editor paso a paso de una habilidad de creep, común a GM Tools y al mapa
   (hoja de ruta A6c, docs/plan-a6c-editor-creeps.md; 2026-10-02)
   Copiado tal cual de gm-toolset (js/04: PASOS_HAB_CREEP, hcOrden, hcModosRender, hcEjecucionRender, hcAbrirEjecucion,
   hcAplicarModoNitros, hcMostrarPaso, hcStatLabel, hcOpcionesStat; js/05: la trampa, hcResumenHtml, abrirEditorHabCreep,
   guardarEditorHabCreep; js/10: sus manejadores; js/01: MODOS_HAB_CREEP; js/03: las opciones de estados) y la ventana fija
   #scrim-hab-creep de gm-tools.html, que ahora arma el componente (los ids pasaron a data-hc). Los campos viejos de la trampa
   (#hc-trampa-nombre…, escondidos y sin uso desde el asistente de trampas) no se copiaron.

   crear(contenedor, ctx, {id}) → editor. Arma la ventana adentro de `contenedor` (GM Tools: document.body con id 'scrim-hab-creep',
   para sus estilos; el mapa: el recuadro de las Acciones nuevas). `ctx`:
     creep(scId)                    el creep (GM Tools: el de la memoria; el mapa: una copia normalizada).
     guardarHab(scId, aplicar)      aplicar(sc) cambia la habilidad adentro del creep; la pantalla lo guarda (GM Tools: renderAll; el
                                    mapa: modificarCreep). Puede devolver una promesa.
     personalizados()               los "Mis presets" de estados (GM Tools: S.estadosPersonalizados; el mapa: []).
     elegirEstadoDuelo()            el `elegirEstado` de la Ejecución ✨ (comun/asistente-duelo-hab.js).
     toast(msg)
     alCerrar()                     (opcional) la ventana se cerró (guardada o cancelada).
   editor = {abrir(scId, habId, opc), cerrar(), estado}. opc = {borrador (una habilidad suelta: se edita ella, no se agrega al creep),
   alGuardar(h), encima (por encima de las ventanas de Ver)}.
   Necesita creep-calculo.js, combatiente.js, estados-presets.js, estados-aplicar.js y, al usarlos, asistente-duelo-hab.js,
   asistente-trampa.js, plantillas.js, biblioteca.js, estado-preguntas.js, trampas-base.js.
   ========================================================= */
const CreepEditor = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const uid = () => Math.random().toString(36).slice(2,9);
  const K = CreepCalculo;

  /* Tres modos de ejecución (los mismos que en la ficha, 2026-09-30): 'manual' (📣 Anunciar: solo el texto, no cobra ni pone
     cooldown), 'semi' (💰 cobra No2 y cooldown, tira la tirada inicial; los efectos van a mano) y 'auto' (✨ la Ejecución paso a
     paso, `h.duelo`). */
  const MODOS_HAB_CREEP = {
    manual: {icono: '📣', nombre: 'Manual', boton: 'Anunciar', corto: 'solo se anuncia', explica: 'El botón se llama <b>Anunciar</b>: publica la descripción en la Mesa y todo lo demás (costo, cooldown, tiradas y efectos) va a mano.'},
    semi: {icono: '💰', nombre: 'Semiautomático', boton: 'Ejecutar', corto: 'cobra No2 y cooldown, tira la tirada inicial', explica: 'Al tocar <b>Ejecutar</b> cobra solo los <b>No2</b> y pone el <b>cooldown</b>, y <b>tira la tirada inicial</b> si la tiene (por lo general, la PdG). Los efectos se resuelven a mano.'},
    auto: {icono: '✨', nombre: 'Automático', boton: 'Ejecutar', corto: 'ejecución paso a paso', explica: 'Al tocar <b>Ejecutar</b> se abre la <b>Ejecución paso a paso</b>: cobra, elegís el objetivo en el mapa, cada uno tira en su momento y se aplican los efectos. Si es solo sobre el creep y no tira nada, se aplica directo. Si coloca una trampa, elegís la casilla en el mapa (los jugadores no se enteran).'},
  };
  /* Habilidades de creeps: editor paso a paso, como el de la ficha pero con lo que tiene un creep (sin SP ni Job; con cooldown y
     "otro costo"). Al crear, Guardar aparece en el último paso; al editar, siempre. */
  const PASOS_HAB_CREEP = [
    {corto: 'Qué es', titulo: '¿Cómo se llama y qué hace?',
     ayuda: 'Esta descripción se lee en la Mesa cada vez que el creep la usa.'},
    {corto: 'Costo', titulo: '¿Cuánto le cuesta y cada cuánto la puede usar?',
     ayuda: 'Los No2 se recargan en cada Mantenimiento.'},
    {corto: 'Tirada al ejecutar', titulo: '¿Qué se tira al tocar Ejecutar?',
     ayuda: "Lo que se tira apenas tocás Ejecutar: elegí el stat del golpe o de la prueba (por ejemplo PdG para un ataque). Es la PRIMERA tirada, de golpe. Si no elegís ninguno, Ejecutar no tira un stat (y si en el paso siguiente hay una fórmula, Ejecutar tira esa fórmula directamente). Si la habilidad incluye un ataque (o cuesta lo mismo que uno), conviene elegir PdG."},
    {corto: 'Tirada de efecto', titulo: '¿Tiene una tirada de efecto (daño, curación…)?',
     ayuda: "La tirada interna de la habilidad: daño, curación, duración… (por ejemplo 2d6+3). Aparece como un botoncito 🎲 en la misma tarjeta, al lado de Ejecutar, y solo si esta tirada existe y hay un stat en el paso anterior. Sin stat, Ejecutar tira esta fórmula directamente y no hay botón aparte. Se puede dejar vacía."},
    {corto: 'Estado', titulo: '¿Le aplica un estado alterado?',
     ayuda: 'Se aplica sobre el propio creep al ejecutarla. Si no aplica ninguno, dejá el nombre vacío y seguí.'},
    {corto: '🪤 Trampa', titulo: '¿Coloca una trampa en el mapa?',
     ayuda: 'Al ejecutarla, la habilidad deja sola una trampa oculta a los jugadores al lado del token del creep. Acá elegís qué trampa es, cuánto daño hace y qué estado deja, o se la sacás.'},
    {corto: 'Listo', titulo: 'Revisá cómo quedó',
     ayuda: 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.'},
    {corto: 'Cómo se ejecuta', titulo: '¿Cómo se ejecuta esta habilidad?',
     ayuda: 'Tres formas, de menos a más automática. Se puede cambiar cuando quieras.'},
    {corto: 'Ejecución', titulo: '¿Cómo se juega paso a paso?',
     ayuda: 'A quién apunta, qué tira cada uno, el daño y los efectos: el mismo cuadro de Ejecución que se abre para toda la mesa al usarla.'},
  ];
  // Stats que un creep puede tirar en una habilidad: los 5 atributos y los secundarios con tirada (los mismos que ofrece la ficha).
  const HC_STATS_SECUNDARIOS = ["resmg", "rescc", "bloqueo", "eva", "ini", "pdg", "parry", "pdgmg", "dmgesp", "resm", "percepcion"];
  function statLabel(id){
    const d = id ? K.STAT_LOOKUP[id] : null;
    return d ? (K.ATTR_NOMBRE[id] || d.label) : "";
  }
  function opcionesStat(elegido){
    const op = id => `<option value="${id}" ${elegido === id ? "selected" : ""}>${esc(statLabel(id))}</option>`;
    return '<option value="">— no tira un stat —</option>' +
      `<optgroup label="Principales">${["con", "fue", "agl", "des", "esp"].map(op).join("")}</optgroup>` +
      `<optgroup label="Secundarios">${HC_STATS_SECUNDARIOS.filter(id => K.STAT_LOOKUP[id]).map(op).join("")}</optgroup>`;
  }
  const POLARIDAD_ESTADO_LABEL = {buff:'Buffs', debuff:'Debuffs', otro:'Otros'};
  // Las opciones del desplegable de estados (los presets de creep y los "Mis presets").
  function opcionesEstadosHtml(personalizados){
    const presets = estadosPresetCreep();
    return ['buff','debuff','otro'].map(pol => {
      const opts = presets.map((p,i) => ({p,i})).filter(({p}) => (p.polaridad||'otro') === pol);
      if(!opts.length) return '';
      return `<optgroup label="${POLARIDAD_ESTADO_LABEL[pol]}">${opts.map(({p,i}) => `<option value="std:${i}">${esc(p.nombre)}</option>`).join('')}</optgroup>`;
    }).join('') + ((personalizados || []).length ? `<optgroup label="Mis presets">${personalizados.map((p,i) => `<option value="custom:${i}">${esc(p.nombre)}</option>`).join('')}</optgroup>` : '');
  }
  const habEtq = stat => (K.STAT_LOOKUP[stat] && K.STAT_LOOKUP[stat].label) || stat;
  const HC_TRAMPA_DANO_RE = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;

  // Los bloques de cada paso (data-hc-paso = índice de PASOS_HAB_CREEP). La ventana, las pestañas, el título y Atrás/Siguiente/Guardar
  // son de la ventana común (comun/paso-a-paso.js, 2026-10-02): cada paso muestra su bloque tal cual, así lo escrito se conserva.
  const BLOQUES = `
      <div class="hc-paso" data-hc-paso="7"><div class="modos-hab" data-hc="modos"></div></div>
      <div class="hc-paso" data-hc-paso="8">
        <div class="hint" data-hc="ejecucion-resumen" style="margin-bottom:10px"></div>
        <button type="button" class="btn primary" data-hc="ejecucion-abrir" style="width:100%">✨ Armar la ejecución paso a paso</button>
      </div>
      <div class="hc-paso" data-hc-paso="0">
        <div class="f"><label>Nombre</label><input type="text" data-hc="nombre" placeholder="ej. Mordida venenosa" data-hc-enter="1"></div>
        <div class="f" style="margin-top:8px"><label>Descripción</label><textarea data-hc="detalle" rows="4" placeholder="ej. Muerde y deja veneno en la herida."></textarea></div>
      </div>
      <div class="hc-paso" data-hc-paso="1">
        <div class="f" style="margin-bottom:8px"><label>No2 que gasta</label>
          <div class="opcion-fila">
            <button type="button" class="opcion-btn" data-hc-nitros-modo="num">Un número</button>
            <button type="button" class="opcion-btn" data-hc-nitros-modo="ataque">Lo mismo que un ataque</button>
          </div>
          <div class="hint" data-hc="ataque-ayuda" style="margin-top:5px"></div>
        </div>
        <input type="hidden" data-hc="nitros-modo" value="num">
        <div class="row3">
          <div class="mini-f" data-hc="acciones-caja"><label>No2 que gasta</label><input type="number" data-hc="acciones" min="0" value="1" data-hc-enter="1"></div>
          <div class="mini-f"><label>Cooldown (turnos)</label><input type="number" data-hc="cd" min="0" value="0" data-hc-enter="1"></div>
          <div class="mini-f"><label>Otro costo</label><input type="text" data-hc="costo" placeholder="opcional" data-hc-enter="1"></div>
        </div>
        <div class="row3" style="margin-top:8px">
          <div class="mini-f"><label>Vida (HP) que cuesta</label><input type="number" data-hc="hpcosto" min="0" value="0" data-hc-enter="1"></div>
          <div></div><div></div>
        </div>
        <label class="chk-lenta" style="display:flex;align-items:center;gap:8px;margin-top:10px;cursor:pointer"><input type="checkbox" data-hc="cd-arranca" style="width:auto"> <span><b>Habilidad lenta</b>: arranca el combate con el cooldown ya activo (como si la hubiera usado el turno anterior)</span></label>
        <div class="hint" style="margin-top:6px">Cooldown: cuántos turnos tiene que esperar para volver a usarla (0 = cuando quiera). La vida se descuenta sola al usarla (tiene que sobrarle). "Otro costo" es un recordatorio libre: un objeto, etc.</div>
      </div>
      <div class="hc-paso" data-hc-paso="2">
        <div class="f"><label>Tirada al ejecutar: stat del creep</label><select data-hc="tirada-stat"></select></div>
      </div>
      <div class="hc-paso" data-hc-paso="3">
        <div class="f"><label>Tirada de efecto: fórmula de dados (opcional)</label><input type="text" data-hc="tirada" placeholder="ej. 2d6+3" data-hc-enter="1"></div>
        <div class="hint" style="margin-top:6px">Si hay un stat en el paso anterior, esta fórmula queda en el botón 🎲 de la tarjeta; sin stat, Ejecutar la tira directamente.</div>
      </div>
      <div class="hc-paso" data-hc-paso="4">
        <div class="f"><label>Elegir de la lista</label><select data-hc="efecto-preset"></select></div>
        <div class="f" style="margin-top:8px"><label>Nombre del estado</label><input type="text" data-hc="efecto-nombre" placeholder="vacío = no aplica ninguno"></div>
        <div class="row3" style="margin-top:8px">
          <div class="mini-f"><label>Turnos</label><input type="number" data-hc="efecto-turnos" min="0" value="0"></div>
          <div class="mini-f"><label>Stacks</label><input type="number" data-hc="efecto-stacks" min="1" value="1"></div>
          <div class="mini-f"><label>HP por turno</label><input type="number" data-hc="efecto-hpturno" value="0"></div>
        </div>
        <label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer;margin-top:8px" title="Marcado, el estado queda puesto hasta que se lo saque a mano (los Turnos no cuentan)">
          <input type="checkbox" data-hc="efecto-permanente" style="width:auto">
          <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">No vence</span>
        </label>
        <div class="f" style="margin-top:8px"><label>Descripción del estado (opcional)</label><input type="text" data-hc="efecto-detalle"></div>
        <input type="hidden" data-hc="efecto-polaridad" value="otro">
        <input type="hidden" data-hc="efecto-mods" value="[]">
      </div>
      <div class="hc-paso" data-hc-paso="5">
        <button type="button" class="btn" data-hc="trampa-preconstruidas" style="width:100%;margin-bottom:10px" title="Elegir una trampa ya armada del catálogo (oso, foso, mina, red…) y decir su tamaño, daño y cantidad">📚 Trampas preconstruidas</button>
        <label class="hc-trampa-on" style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--copper);border-radius:var(--r);background:rgba(201,133,69,.10);cursor:pointer">
          <input type="checkbox" data-hc="trampa-on" style="width:auto"> <span><b>🪤 Esta habilidad coloca una trampa</b><br><span style="color:var(--muted);font-size:12px">Destildá esto para sacarle la trampa a la habilidad.</span></span>
        </label>
        <div data-hc="trampa-resumen" style="margin-top:10px"></div>
      </div>
      <div class="hc-paso" data-hc-paso="6">
        <div class="resumen-hab" data-hc="resumen"></div>
      </div>`;

  function crear(contenedor, ctx, {id} = {}){
    // Los bloques viven sueltos (fuera de la página) y la ventana común muestra el del paso actual.
    const cajaBloques = document.createElement('div');
    cajaBloques.innerHTML = BLOQUES;
    const bloques = {};
    cajaBloques.querySelectorAll('.hc-paso').forEach(b => { bloques[b.dataset.hcPaso] = b; });
    const todos = Object.values(bloques);
    const $h = n => { for(const b of todos){ const x = b.querySelector(`[data-hc="${n}"]`); if(x) return x; } return null; };
    const $$h = sel => todos.flatMap(b => [...b.querySelectorAll(sel)]);
    let pap = null;          // la ventana abierta (comun/paso-a-paso.js)
    const toast = m => ctx.toast(m);
    let e = null;            // la habilidad que se edita: {scId, habId (null = nueva), paso, borrador, alGuardar, modo, duelo}
    let pdgAuto = false;     // el PdG lo puso solo el costo de ataque (se saca si cambia de opción)
    let trampa = null;       // la trampa que se está editando, en la forma única (P123, comun/plantillas.js)

    // Qué pasos (índices de PASOS_HAB_CREEP / data-hc-paso) muestra el editor según el modo. Lo del sistema anterior (estado propio,
    // trampa al lado del token) aparece en semi solo si la habilidad ya lo tenía; en auto la trampa es una opción más.
    function orden(){
      const m = e && e.modo;
      const conEstado = !!$h('efecto-nombre').value.trim(), conTrampa = $h('trampa-on').checked;
      if(m === 'semi') return [7, 0, 1, 2, 3, ...(conEstado ? [4] : []), ...(conTrampa ? [5] : []), 6];
      if(m === 'auto') return [7, 0, 1, 8, 5, ...(conEstado ? [4] : []), 6];
      return [7, 0, 6];
    }
    function modosRender(){
      const m = e.modo;
      $h('modos').innerHTML = Object.entries(MODOS_HAB_CREEP).map(([k, v]) => `<button type="button" class="opcion-btn modo-hab-btn ${m === k ? 'activa' : ''}" data-hc-modo="${k}"><b>${v.icono} ${v.nombre}</b><span>${v.explica}</span></button>`).join('')
        + (m === null ? '<div class="hint">Elegí una para seguir.</div>' : '');
    }
    function ejecucionRender(){
      const c = e.duelo;
      const OBJ = {enemigo: 'a un enemigo', aliado: 'a un aliado', 'uno mismo': 'sobre el creep', area: 'en un área', onda: 'onda alrededor', zona: 'zona persistente'};
      $h('ejecucion-resumen').innerHTML = c
        ? `Configurada: <b>${esc(c.modo === 'arma' ? 'ataque con su arma' : (OBJ[c.objetivo] || c.objetivo || 'a un enemigo') + (c.tira ? ' · tira ' + habEtq(c.tira) : '') + (c.dano ? ' · hace daño' : '') + ((c.efectos || []).length ? ' · ' + c.efectos.map(x => x.nombre || 'efecto').join(', ') : ''))}</b>. Si además coloca una trampa, está en el paso siguiente.`
        : 'Todavía <b>no está configurada</b>. Si la habilidad solo coloca una trampa, alcanza con el paso siguiente (🪤); si no, armala acá.';
      $h('ejecucion-abrir').textContent = `✨ ${c ? 'Cambiar' : 'Armar'} la ejecución paso a paso`;
    }
    function abrirEjecucion(){
      const ed = e;
      AsistenteDueloHab.abrir({nombre: $h('nombre').value.trim() || 'Habilidad', inicial: ed.duelo || null, siempreActivo: true, tieneFormula: !!$h('tirada').value.trim(),
        costoInicial: {sp: $h('costo').value, nitrosCosto: $h('nitros-modo').value === 'ataque' ? 'ATAQUE' : num($h('acciones').value), hpCosto: num($h('hpcosto').value)}, elegirEstado: ctx.elegirEstadoDuelo,
        alGuardar: r => {
          if(e !== ed) return;
          if(r){
            ed.duelo = r.duelo;
            $h('costo').value = r.costo.sp || '';
            if(r.costo.nitrosCosto === 'ATAQUE'){ $h('nitros-modo').value = 'ataque'; }
            else{ $h('nitros-modo').value = 'num'; $h('acciones').value = Math.max(0, num(r.costo.nitrosCosto)); }
            $h('hpcosto').value = Math.max(0, num(r.costo.hpCosto));
            aplicarModoNitros();
          }else{ ed.duelo = null; ed.modo = 'semi'; }
          if(pap) pap.redibujar();
        }});
    }
    // Modo de costo de Nitros: número o "lo mismo que un ataque" (con su arma).
    function aplicarModoNitros(){
      const modo = $h('nitros-modo').value;
      $$h("[data-hc-nitros-modo]").forEach(b => b.classList.toggle("activa", b.dataset.hcNitrosModo === modo));
      $h('acciones-caja').style.visibility = modo === "ataque" ? "hidden" : "visible";
      const sc = e && ctx.creep(e.scId);
      $h('ataque-ayuda').textContent = modo === "ataque"
        ? `Cuesta lo mismo que un ataque con su arma (Tipo ÷ 2 el primero del turno, Tipo completo después) y cuenta como ese ataque.${sc ? ` Hoy: ${fmt(K.costoAtaque(sc))} No2.` : ""}`
        : "Siempre gasta esa cantidad.";
    }
    // `n` es la posición dentro de los pasos visibles (orden), no el índice de PASOS_HAB_CREEP. Lo que todavía no se puede lo avisa la
    // ventana (puedeIr).
    function mostrarPaso(n){ if(pap) pap.irA(n); }
    // El paso `idx` (índice de PASOS_HAB_CREEP) para la ventana común: su bloque, con lo que se calcula al mostrarlo.
    function pasoVentana(idx){
      const P = PASOS_HAB_CREEP[idx];
      return {id: String(idx), nombre: P.corto, ayuda: `<b>${P.titulo}</b> ${P.ayuda}`, html: () => {
        if(idx === 7) modosRender();
        if(idx === 8) ejecucionRender();
        if(idx === 6) $h('resumen').innerHTML = resumenHtml();
        bloques[idx].hidden = false;
        return bloques[idx];
      }, alMontar: () => {
        const primero = bloques[idx].querySelector('input:not([type=hidden]):not([type=checkbox]),select,textarea');
        if(primero) setTimeout(() => primero.focus(), 30);
      }};
    }

    /* ---------- 🪤 Trampa de una habilidad de creep (2026-09-24) ----------
       La habilidad puede colocar una trampa oculta al ejecutarse (`h.trampaColocar`); se enciende, se configura (con el asistente de
       trampas) o se apaga desde acá. Sacarla borra `trampaColocar`. */
    function trampaResumen(){
      if(!$h('trampa-on').checked || !trampa) return 'no coloca';
      return AsistenteTrampa.resumenTexto(trampa);
    }
    function trampaRender(){
      const on = $h('trampa-on').checked;
      const nom = trampa ? String(trampa.nombre || '').trim() : '';
      $h('trampa-resumen').innerHTML = on
        ? `<div class="hint" style="margin-bottom:8px"><b>${esc(nom || $h('nombre').value.trim() || 'Sin nombre')}</b><br>${esc(trampaResumen())}</div>
      <div style="display:flex;gap:8px"><button type="button" class="btn" data-hc="trampa-elegir" style="flex:1">🪤 Elegir otra trampa</button>
      <button type="button" class="btn primary" data-hc="trampa-asistente" style="flex:1">🪄 Ajustar todo, paso a paso</button></div>`
        : '';
    }
    function cargarTrampa(h){
      trampa = h.trampaColocar ? Plantillas.trampaDesde(h.trampaColocar) : null;   // las viejas {radio, estado:{…}} se traducen solas
      $h('trampa-on').checked = !!trampa;
      trampaRender();
    }
    function guardarTrampa(h, on){
      if(!on || !trampa){ delete h.trampaColocar; return; }
      h.trampaColocar = {...structuredClone(trampa), nombre: String(trampa.nombre || '').trim().slice(0, 40) || h.nombre};
    }
    // Al tildar la trampa (o «Elegir otra trampa»): el menú común — una conocida por tipo, de cero o del catálogo (comun/elegir-trampa.js).
    function elegirTrampa(){
      ElegirTrampa.abrir({inicial: trampa,
        alTerminar: t => { trampa = t; $h('trampa-on').checked = true; trampaRender(); },
        alCancelar: () => { if(!(trampa && (String(trampa.nombre || '').trim() || trampa.dano))){ $h('trampa-on').checked = false; trampaRender(); if(pap) pap.redibujar(); } },
        alCatalogo: () => trampasPreconstruidas()});
    }
    // Menú paso a paso de trampas (comun/asistente-trampa.js, 2026-09-25): «Ajustar todo».
    function abrirAsistenteTrampa(){
      const lista = EstadosAplicar.DEBUFFS.filter(p => !p.permanente && num(p.turnos) > 0 && !p.esVeneno && !p.soloSistema).map(p => ({nombre: p.nombre, detalle: p.detalle || '', turnos: num(p.turnos), permanente: false}));
      AsistenteTrampa.abrir({
        contexto: 'habilidad', editando: false, estados: lista, inicial: AsistenteTrampa.inicialDe(trampa || {}),
        alTerminar: res => { trampa = AsistenteTrampa.aTrampa(res); $h('trampa-on').checked = true; trampaRender(); },
        alCancelar: () => { if(!(trampa && (String(trampa.nombre || '').trim() || trampa.dano))){ $h('trampa-on').checked = false; trampaRender(); } },
      });
    }
    // 📚 Trampas preconstruidas (2026-09-24): una del catálogo de trampas base (y las propuestas por el grupo); un cartelito pregunta
    // sus cantidades — de qué tamaño, cuánto daño y cuántas — antes de cargarla en el editor.
    function trampasPreconstruidas(){
      Biblioteca.abrir({
        tipo: 'trampas', titulo: 'Trampa preconstruida', z: 99600,   // por encima del editor de la habilidad
        base: typeof TRAMPAS_BASE !== 'undefined' ? TRAMPAS_BASE : [],
        subtitulo: x => (x.nivel ? ` · nivel ${x.nivel}` : '') + (x.datos && x.datos.amiga ? ' · 🔥 daña a aliados en el área' : '') + (x.datos && x.datos.dano ? ` · 💥 ${x.datos.dano}` : ''),
        grupos: [{nombre: 'Efecto', tags: ['daño', 'veneno', 'explosiva', 'fuego', 'inmoviliza', 'debuff', 'control', 'alarma']}, {nombre: 'Origen', tags: ['mecánica', 'mágica', 'natural']}, {nombre: 'Nivel', tags: ['nivel 1', 'nivel 2', 'nivel 3', 'nivel 4', 'nivel 5']}, {nombre: 'Alcance', tags: ['área']}],
        alElegir: async datos => {
          const preguntas = [{clave: 'radio', min: 0, texto: '¿De qué tamaño es? (0 = una casilla · 1 = flor de 7 casillas, diámetro 3 · 2 = 19 casillas, diámetro 5…)'}];
          if(datos.dano) preguntas.push({clave: 'dano', tipo: 'texto', texto: '¿Cuánto daño hace? (dados, ej. 2d6 o 1d8+3)', patron: HC_TRAMPA_DANO_RE, error: 'Escribilo así: 2d6 o 1d8+3.', placeholder: 'ej. 2d6+3'});
          preguntas.push({clave: 'cant', min: 1, texto: '¿Cuántas trampas coloca cada vez que la ejecuta?'});
          const r = await EstadoPreguntas.preguntar({titulo: 'Trampa', nombre: datos.nombre}, preguntas, x => x);
          if(!r) return;
          // La trampa del catálogo entera (forma única, P123: estado, color, zona que deja…), con el tamaño, el daño y la cantidad
          // que se eligieron recién. En una línea, el "radio" preguntado es su largo. El teleport no lo coloca una habilidad.
          const base = Plantillas.trampaDesde(datos);
          trampa = {...base, nombre: String(datos.nombre || '').slice(0, 40), detalle: String(datos.detalle || '').slice(0, 200), dano: r.dano || '',
            tamano: base.tipo === 'linea' ? Math.max(1, Math.min(20, r.radio || 1)) : Math.max(0, Math.min(6, r.radio)), cant: Math.max(1, Math.min(6, r.cant))};
          delete trampa.teleport;
          $h('trampa-on').checked = true;
          trampaRender();
          toast(`Trampa "${datos.nombre}" cargada: revisala y guardá la habilidad`);
        },
      });
    }

    function resumenHtml(){
      const fila = (titulo, valor) => `<div class="resumen-fila"><span>${titulo}</span><b>${esc(valor)}</b></div>`;
      const detalle = $h('detalle').value.trim();
      const estado = $h('efecto-nombre').value.trim();
      const turnos = num($h('efecto-turnos').value);
      const cd = num($h('cd').value);
      return `<div class="resumen-nombre">${esc($h('nombre').value.trim() || '(sin nombre)')}</div>
    <div class="resumen-desc">${detalle ? esc(detalle) : '<span style="color:var(--muted)">(sin descripción)</span>'}</div>
    ${fila('Ejecución', (m => `${m.icono} ${m.nombre} (${m.corto})`)(MODOS_HAB_CREEP[e.modo || 'semi']))}
    ${fila("No2", $h('nitros-modo').value === "ataque" ? "como un ataque" : fmt(Math.max(0, num($h('acciones').value))))}
    ${fila('Cooldown', cd ? `${fmt(cd)} turno${cd === 1 ? '' : 's'}` : 'sin cooldown')}
    ${num($h('hpcosto').value) > 0 ? fila('Vida', `${fmt(num($h('hpcosto').value))} HP`) : ''}
    ${fila('Otro costo', $h('costo').value.trim() || 'ninguno')}
    ${fila("Al ejecutar", statLabel($h('tirada-stat').value) || $h('tirada').value.trim() || "no tira")}
    ${fila("Efecto", $h('tirada-stat').value && $h('tirada').value.trim() ? $h('tirada').value.trim() + " (botón 🎲)" : "sin tirada de efecto")}
    ${fila('Estado', estado ? `${estado}${turnos ? ` (${fmt(turnos)} turnos)` : ''}` : 'ninguno')}
    ${fila('🪤 Trampa', trampaResumen())}`;
    }

    function abrir(scId, habId, opc){
      const sc = ctx.creep(scId);
      if(!sc) return;
      // habId vacío = habilidad nueva (se agrega al guardar).
      // opc.borrador = una habilidad suelta (la de la biblioteca): se edita ella, no se agrega al creep; al guardar avisa con opc.alGuardar.
      const h = opc && opc.borrador ? opc.borrador : habId ? sc.habilidades.find(x => x.id === habId) : {};
      if(!h) return;
      e = {scId, habId: habId || null, borrador: !!(opc && opc.borrador), borradorObj: opc && opc.borrador, alGuardar: opc && opc.alGuardar,
        modo: (habId || (opc && opc.borrador)) ? K.modoHab(h) : null, duelo: h.duelo && typeof h.duelo === 'object' ? structuredClone(h.duelo) : null};
      const titulo = e.borrador ? `Editar habilidad de la biblioteca · ${h.nombre || ''}` : habId ? `Editar habilidad · ${sc.nombre || 'creep'}` : `Nueva habilidad · ${sc.nombre || 'creep'}`;
      const encima = !!(e.borrador || (opc && opc.encima));   // por encima de las ventanas de Ver
      $h('nombre').value = h.nombre || '';
      $h('costo').value = h.costo || '';
      $h('nitros-modo').value = K.habAtaque(h) ? "ataque" : "num";
      $h('acciones').value = K.habAtaque(h) ? K.IT2_CREEP.nitrosHabilidad : (h.nitrosCosto ?? K.IT2_CREEP.nitrosHabilidad);
      pdgAuto = false;
      $h('cd').value = h.cd || 0;
      $h('hpcosto').value = h.hpCosto || 0;
      $h('cd-arranca').checked = !!h.cdArranca;
      $h('detalle').value = h.detalle || '';
      $h('tirada').value = h.tiradaExtra || '';
      $h('tirada-stat').innerHTML = opcionesStat(h.tiradaStat || "");
      $h('efecto-preset').innerHTML = '<option value="">— elegir preset o completar a mano —</option>' + opcionesEstadosHtml(ctx.personalizados());
      $h('efecto-nombre').value = h.efectoNombre || '';
      $h('efecto-turnos').value = h.efectoTurnos || 0;
      $h('efecto-stacks').value = h.efectoStacks || 1;
      $h('efecto-hpturno').value = h.efectoHpTurno || 0;
      $h('efecto-permanente').checked = Combatiente.efectoPermanente(h, estadosPresetCreep().find(p => p.nombre === (h.efectoNombre || '').trim() || (p.alias || []).includes((h.efectoNombre || '').trim())));   // P137
      $h('efecto-detalle').value = h.efectoDetalle || '';
      $h('efecto-polaridad').value = h.efectoPolaridad || 'otro';
      $h('efecto-mods').value = JSON.stringify(h.efectoMods || []);
      cargarTrampa(h);
      aplicarModoNitros();
      const ed = e, inicial = JSON.stringify(datosDePantalla());
      if(pap){ const viejo = pap; pap = null; viejo.cerrar(); }
      pap = PasoAPaso.abrir({
        titulo, crear: !habId && !ed.borrador, contenedor, z: encima ? 96 : 85,
        pasos: () => orden().map(pasoVentana),
        puedeIr: i => i > 0 && ed.modo === null ? 'Primero elegí cómo se ejecuta' : i > 1 && !$h('nombre').value.trim() ? 'Primero ponele un nombre' : '',
        alClic: clic, alTecla: teclas,
        confirmarCancelar: () => JSON.stringify(datosDePantalla()) === inicial && ed.modo === (habId || ed.borrador ? K.modoHab(h) : null) ? ''
          : (habId || ed.borrador ? '¿Descartar los cambios de esta habilidad?' : '¿Cancelar? La habilidad que estás armando se descarta.'),
        alGuardar: () => guardar(), alCrear: () => guardar(),
        alCancelar: () => cerrar(),
      });
    }
    function cerrar(){
      e = null;
      if(pap){ const viejo = pap; pap = null; viejo.cerrar(); }
      if(ctx.alCerrar) ctx.alCerrar();
    }
    // Lo que hay en la pantalla (para saber si cambió algo antes de descartar).
    function datosDePantalla(){
      return ['nombre', 'detalle', 'costo', 'nitros-modo', 'acciones', 'cd', 'hpcosto', 'tirada', 'tirada-stat', 'efecto-nombre', 'efecto-turnos', 'efecto-stacks', 'efecto-hpturno', 'efecto-detalle']
        .map(n => $h(n) ? $h(n).value : '').concat([$h('cd-arranca').checked, $h('efecto-permanente').checked, $h('trampa-on').checked, JSON.stringify(e && e.duelo || null)]);
    }

    async function guardar(){
      if(!e) return;
      if(!$h('nombre').value.trim()){ mostrarPaso(1); if(pap) pap.aviso('Ponele un nombre antes de guardarla'); return false; }
      // Lo que quedó en la pantalla, antes de cerrarla.
      let mods;
      try{ mods = JSON.parse($h('efecto-mods').value) || []; }catch(err){ mods = []; }
      const v = {
        nombre: $h('nombre').value.trim() || 'Sin nombre', costo: $h('costo').value,
        nitrosCosto: $h('nitros-modo').value === "ataque" ? "ATAQUE" : Math.max(0, num($h('acciones').value) || 0),
        cd: Math.max(0, num($h('cd').value) || 0), hpCosto: Math.max(0, num($h('hpcosto').value) || 0), cdArranca: $h('cd-arranca').checked,
        detalle: $h('detalle').value, tiradaExtra: $h('tirada').value.trim(), tiradaStat: $h('tirada-stat').value,
        efectoNombre: $h('efecto-nombre').value.trim(), efectoTurnos: Math.max(0, num($h('efecto-turnos').value) || 0),
        efectoStacks: Math.max(1, num($h('efecto-stacks').value) || 1), efectoHpTurno: num($h('efecto-hpturno').value) || 0,
        efectoPermanente: $h('efecto-permanente').checked, efectoDetalle: $h('efecto-detalle').value, efectoPolaridad: $h('efecto-polaridad').value || 'otro',
        efectoMods: mods, trampaOn: $h('trampa-on').checked,
      };
      const ed = e;
      const aplicarEn = h => {
        h.nombre = v.nombre;
        h.costo = v.costo;
        h.nitrosCosto = v.nitrosCosto;
        h.cd = v.cd;
        if(v.hpCosto) h.hpCosto = v.hpCosto; else delete h.hpCosto;
        // Habilidad lenta: empieza con el cooldown ya activo (al crearla, al marcarla, y en cada combate nuevo).
        const eraLenta = !!h.cdArranca;
        h.cdArranca = v.cdArranca;
        if(h.cdArranca && (!eraLenta || !ed.habId)) h.cdActual = h.cd;
        h.detalle = v.detalle;
        h.tiradaExtra = v.tiradaExtra;
        h.tiradaStat = v.tiradaStat;
        h.efectoNombre = v.efectoNombre;
        h.efectoTurnos = v.efectoTurnos;
        h.efectoStacks = v.efectoStacks;
        h.efectoHpTurno = v.efectoHpTurno;
        h.efectoPermanente = v.efectoPermanente;
        h.efectoDetalle = v.efectoDetalle;
        h.efectoPolaridad = v.efectoPolaridad;
        h.efectoMods = structuredClone(v.efectoMods);
        guardarTrampa(h, v.trampaOn);
        h.modo = ed.modo || 'semi';
        h.automatizada = h.modo !== 'manual';
        if(ed.duelo) h.duelo = structuredClone(ed.duelo); else delete h.duelo;
      };
      cerrar();
      // Una habilidad de la biblioteca: se vuelve a la vista, sin tocar al creep.
      if(ed.borrador){ aplicarEn(ed.borradorObj); if(ed.alGuardar) ed.alGuardar(ed.borradorObj); return; }
      let nombre = v.nombre, ok = true;
      await ctx.guardarHab(ed.scId, sc => {
        let h = ed.habId ? sc.habilidades.find(x => x.id === ed.habId) : null;
        if(ed.habId && !h){ ok = false; return; }
        if(!h){ h = {id: uid(), cdActual: 0}; sc.habilidades.push(h); }
        aplicarEn(h);
      });
      if(ok) toast(`${nombre} guardada`);
    }

    // Los manejadores (antes en gm-toolset/js/10): clics y teclas de la ventana común; los campos tienen los suyos en sus bloques.
    function clic(ev){
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(!t || !t.closest || !e) return;
      const modo = t.closest('[data-hc-modo]');
      if(modo){ e.modo = modo.dataset.hcModo; if(pap) pap.redibujar(); return; }
      const nm = t.closest('[data-hc-nitros-modo]');
      if(nm){
        const m = nm.dataset.hcNitrosModo;
        $h('nitros-modo').value = m;
        // Con costo de ataque, la tirada por defecto es PdG (si no eligió otra).
        const sel = $h('tirada-stat');
        if(m === "ataque" && !sel.value){ sel.value = "pdg"; pdgAuto = true; }
        else if(m !== "ataque" && pdgAuto && sel.value === "pdg"){ sel.value = ""; pdgAuto = false; }
        aplicarModoNitros();
        return;
      }
      const b = t.closest('[data-hc]');
      const a = b && b.dataset.hc;
      if(a === 'ejecucion-abrir') abrirEjecucion();
      else if(a === 'trampa-asistente') abrirAsistenteTrampa();
      else if(a === 'trampa-preconstruidas') trampasPreconstruidas();
      else if(a === 'trampa-elegir') elegirTrampa();
    }
    // Enter en un campo de una línea: al paso siguiente.
    function teclas(ev){
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(ev.key !== 'Enter' || !e || !pap || !t.matches || !t.matches('[data-hc-enter]')) return;
      ev.preventDefault();
      if(pap.paso() < orden().length - 1) mostrarPaso(pap.paso() + 1);
    }
    $h('tirada-stat').addEventListener('change', () => { pdgAuto = false; });
    $h('efecto-preset').addEventListener('change', ev => {
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(!t.value) return;
      const [tipo, idx] = t.value.split(':');
      const preset = (tipo === 'std' ? estadosPresetCreep() : (ctx.personalizados() || []))[+idx];
      if(!preset) return;
      $h('efecto-nombre').value = preset.nombre;
      $h('efecto-turnos').value = preset.turnos ?? 0;
      $h('efecto-stacks').value = preset.stacks ?? 1;
      $h('efecto-hpturno').value = preset.hpTurno ?? 0;
      $h('efecto-permanente').checked = !!preset.permanente;
      $h('efecto-detalle').value = preset.detalle || '';
      $h('efecto-polaridad').value = preset.polaridad || 'otro';
      $h('efecto-mods').value = JSON.stringify(preset.mods || []);
      if(pap) pap.redibujar();   // con estado, el paso Estado ya cuenta en las pestañas
    });
    $h('trampa-on').addEventListener('change', () => { trampaRender(); if($h('trampa-on').checked && !(trampa && (String(trampa.nombre || '').trim() || trampa.dano))) elegirTrampa(); });
    // Los pasos que se ven dependen de si hay estado y de si coloca trampa (orden): al cambiarlos, se rearman las pestañas.
    $h('trampa-on').addEventListener('change', () => { if(pap) pap.redibujar(); });
    $h('efecto-nombre').addEventListener('change', () => { if(pap) pap.redibujar(); });

    return {abrir, cerrar, get raiz(){ return pap ? pap.raiz : null; }, get estado(){ return e && pap ? {...e, paso: pap.paso()} : e; }};
  }

  /* ---------- ⬆ Subir y ↻ Reemplazar una habilidad de creep (tanda c2, 2026-10-02) ----------
     Copiado de gm-toolset/js/05 (LEGADO_HABS, paraDeDatos, PARA_TXT, habDeBiblioteca, avisoJugador, metaHab, HABS_CREEP_GRUPOS,
     proponerHabilidadABiblioteca, abrirCatalogoHabilidades). Habilidades de jugador y de creep son un solo tipo en la biblioteca
     (`biblioteca_skills`, P122), con la marca `para` bien a la vista porque pagan distinto: 🐾 creep = cooldown, 🧙 jugador = SP (P125).
     Lo que se subió antes como habilidad de creep (`biblioteca_habs_creep`, `{habilidad}`) se sigue mostrando: LEGADO_HABS lo lee de ahí.
     Necesitan biblioteca.js y, para las recetas de fábrica, creeps-base.js + skills-creep-base.js (armarHabilidadDeCreep). */
  const LEGADO_HABS = {tipo: 'habs_creep', convertir: d => d && d.habilidad ? {...d.habilidad, para: 'creep'} : d};
  const paraDeDatos = d => d && d.sp ? 'creep' : (d && d.para) || 'creep';   // las recetas de fábrica (sp) son de creep
  const PARA_TXT = {creep: '🐾 Creep · cooldown', jugador: '🧙 Jugador · SP'};
  // Una habilidad de la biblioteca lista para un creep: las recetas de fábrica se calculan con su nivel; lo subido va tal cual. `meta` =
  // de dónde salió ({tipo, id, version}), para el aviso de versión nueva. Una de jugador conserva la marca.
  function habDeBiblioteca(sc, datos, meta){
    const para = paraDeDatos(datos);
    const h = datos.sp ? armarHabilidadDeCreep(datos, sc.nivel) : structuredClone(datos.habilidad || datos);
    delete h.para; delete h.clase;
    return {...h, id: uid(), cdActual: h.cdArranca ? num(h.cd) : 0, ...(para === 'jugador' ? {para: 'jugador'} : {}), ...(meta ? {bibOrigen: meta} : {})};
  }
  const avisoJugador = h => h.para === 'jugador' ? ' — 🧙 es de jugador (paga con SP): revisale el costo' : '';
  const metaHab = ent => ent ? {tipo: 'skills', id: ent.id, version: ent.version || 1} : null;
  // Etiquetas de las habilidades de creeps, agrupadas por criterio: sirven de filtro en la biblioteca y de opciones al guardar.
  const HABS_CREEP_GRUPOS = [
    {nombre: 'Función', tags: ['daño', 'defensa', 'buff', 'debuff', 'curación', 'control', 'movilidad', 'invocación', 'área']},
    {nombre: 'Mecánica del juego', tags: ['sigilo', 'trampas', 'terreno y formas', 'niebla y visión', 'iniciativa', 'aura', 'estados alterados', 'orientación', 'percepción', 'movimiento', 'botín', 'jefe']},
    {nombre: 'A quién apunta', tags: ['a sí mismo', 'un enemigo', 'zona o área', 'aliados', 'terreno']},
    {nombre: 'Velocidad', tags: ['rápida', 'lenta']},
    {nombre: 'Rol', tags: ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer']},
    {nombre: 'Raza', tags: ['cualquiera', 'humano', 'humanoide', 'bestia', 'planta', 'elemental', 'no-muerto', 'constructo', 'alienígena']},
    {nombre: 'Automatización', tags: ['toda automatizada', 'con parte a mano']},
  ];
  // ⬆ Sube a la biblioteca una habilidad ya calculada (queda con valores fijos), marcada 🐾 de creep (o 🧙 si ya era de jugador). Si salió
  // de otra (`bibOrigen`), pregunta si es una corrección o algo nuevo (comun/biblioteca.js). alSubir(r, origen): lo que guarda cada
  // pantalla (la habilidad ya quedó con su `bibOrigen` nuevo en `hab`; el mapa lo escribe en el creep con `origen`).
  function subirHab(sc, hab, {alSubir} = {}){
    const h = structuredClone(hab);
    delete h.id;
    h.cdActual = h.cdArranca ? num(h.cd) : 0;
    const o = hab.bibOrigen;
    Biblioteca.guardar({tipo: 'skills', datos: {...h, para: h.para === 'jugador' ? 'jugador' : 'creep'}, nombre: h.nombre, nivel: sc.nivel,
      grupos: HABS_CREEP_GRUPOS, base: typeof HABILIDADES_CREEP_BASE !== 'undefined' ? HABILIDADES_CREEP_BASE : [], legado: LEGADO_HABS,
      basadoEn: o && o.id ? {id: o.id, nombre: h.nombre} : null,
      alSubir: r => { const origen = {tipo: 'skills', id: r.id, version: r.version}; hab.bibOrigen = origen; if(alSubir) alSubir(r, origen); }});
  }
  // Pone una habilidad (de la biblioteca) en el creep: en el lugar de `viejaId` si viene (↻ Reemplazar), si no al final. → el aviso.
  function ponerHab(sc, h, viejaId){
    const vieja = viejaId ? sc.habilidades.find(x => x.id === viejaId) : null;
    const i = vieja ? sc.habilidades.indexOf(vieja) : -1;
    if(i >= 0){
      sc.habilidades[i] = h;   // en el mismo lugar de la lista
      return `${vieja.nombre || 'La habilidad'} reemplazada por ${h.nombre}${avisoJugador(h)}`;
    }
    sc.habilidades.push(h);
    return `${h.nombre} agregada a ${sc.nombre || 'el creep'} (nivel ${sc.nivel || 1})${avisoJugador(h)}`;
  }
  /* El catálogo de habilidades para un creep (comun/skills-creep-base.js + lo subido): se elige una, se calcula con su nivel y se agrega
     o, con reemplazarId (↻ Reemplazar del Ver), pisa esa habilidad. op = {reemplazarId, alElegir(h, viejaId), alCrearDeCero(viejaId),
     alVer(datos, ent)?}. */
  function elegirDeBiblioteca(sc, op = {}){
    const vieja = op.reemplazarId ? sc.habilidades.find(x => x.id === op.reemplazarId) : null;
    Biblioteca.abrir({
      tipo: 'skills', legado: LEGADO_HABS,
      titulo: vieja ? `Reemplazar «${vieja.nombre || 'habilidad'}» de ${sc.nombre || 'el creep'}` : `Habilidad para ${sc.nombre || 'el creep'}`,
      textoCrearDeCero: vieja ? '✎ Mejor editar la actual (paso a paso)' : '+ Crear de cero (paso a paso)',
      alCrearDeCero: () => op.alCrearDeCero && op.alCrearDeCero(vieja ? vieja.id : null),
      base: typeof HABILIDADES_CREEP_BASE !== 'undefined' ? HABILIDADES_CREEP_BASE : [],
      // Siempre a la vista para quién es (P122): 🐾 de creep (cooldown) o 🧙 de jugador (SP).
      subtitulo: x => paraDeDatos(x.datos) === 'jugador' ? ` · ${PARA_TXT.jugador}`
        : ` · ${PARA_TXT.creep} · ` + (x.datos.sp ? `${x.etiquetas.includes('lenta') ? 'lenta' : 'rápida'} · escala con el nivel del creep` : `${x.datos.cdArranca ? 'lenta' : 'rápida'} · valores fijos`),
      ...(op.alVer ? {alVer: op.alVer} : {}),
      alElegir: (datos, meta) => op.alElegir && op.alElegir(habDeBiblioteca(sc, datos, meta), vieja ? vieja.id : null),
      grupos: HABS_CREEP_GRUPOS,
    });
  }

  /* ---------- El editor de un estado de un creep (tanda c3, 2026-10-02) ----------
     Copiado de gm-toolset (js/05: abrirEditorEstadoCreep, actualizarBotonesPresetEc, renderEcMods, forzarNitrosDelEditor,
     guardarEditorEstadoCreep; js/03: textoEstadoAgregado; js/10: sus manejadores) y la ventana #scrim-estado-creep (ids → data-ec).
     Desde 2026-10-02 (tanda 6 de docs/plan-paso-a-paso.md) en la ventana común paso a paso: Qué es · Duración · Vida · Números · Resumen.
     crearEstado(contenedor, ctx) → {abrir(scId, esId, inicial), cerrar, raiz, estado}. `contenedor`: donde va la ventana (document.body, o el
     recuadro aislado del mapa). `ctx`: creep(scId), guardar(scId, aplicar) (aplicar(sc)
     cambia el creep; puede devolver una promesa), toast, confirmar?, alCerrar?, y — solo si la pantalla guarda "Mis presets" — personalizados() y
     guardarPresets(lista) (sin eso, los botones de preset personalizado no aparecen). `inicial` = lo que trae el asistente de estados
     ("formulario completo"): {nombre, detalle, turnos, permanente, hp, escudo, mods, polaridad, flags, forzarNitros}. */
  const ATTR_IDS = ['con','fue','agl','des','esp'];
  const ATTR_LABELS = {con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp'};
  // Lo que se le avisa al que pone un estado (misma frase en la ficha, las invocaciones y los creeps).
  function textoEstadoAgregado(r, campoHp){
    const x = r.estado;
    if(r.que === 'acumulado'){
      if(x.esEscarcha) return `${x.nombre} ×${x.stacks} (−${x.stacks} No2 máx.)`;
      if(x.esSangrado) return `${x.nombre} +1 al daño por turno (${fmt(Math.abs(num(x[campoHp])) * num(x.stacks))} ahora)`;
      return `${x.nombre} ×${x.stacks}`;
    }
    return r.que === 'renovado' ? `${x.nombre} renovado (ya lo tenía)` : `${x.nombre} activado`;
  }
  // Los bloques de cada paso del editor de un estado (2026-10-02, tanda 6 de docs/plan-paso-a-paso.md): la ventana, las pestañas y los botones
  // son de la ventana común (comun/paso-a-paso.js); cada paso muestra su bloque tal cual, así lo escrito se conserva al ir y volver.
  const BLOQUES_ESTADO = `
    <div class="ec-paso" data-ec-paso="que" style="display:flex;flex-direction:column;gap:10px">
      <div class="f"><label>Preset (opcional: carga sus números)</label><select data-ec="preset"></select></div>
      <div class="f"><label>Nombre</label><input type="text" data-ec="nombre" placeholder="ej. Veneno"></div>
      <div class="f"><label>Qué hace (en palabras, opcional)</label><input type="text" data-ec="detalle"></div>
    </div>
    <div class="ec-paso" data-ec-paso="dura" style="display:flex;flex-direction:column;gap:10px">
      <div class="mini-f" style="max-width:220px"><label>Turnos restantes</label><input type="number" data-ec="turnos" min="0" value="1"></div>
      <label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-ec="permanente" style="width:auto">
        <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Permanente (no vence)</span>
      </label>
      <label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-ec="activo" checked style="width:auto">
        <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Activo (si no, queda en la lista sin hacer efecto)</span>
      </label>
    </div>
    <div class="ec-paso" data-ec-paso="vida">
      <div class="row3" style="grid-template-columns:1fr 1fr">
        <div class="mini-f"><label>HP por turno (por stack)</label><input type="number" data-ec="hpturno" value="0"></div>
        <div class="mini-f"><label>Stacks</label><input type="number" data-ec="stacks" min="1" value="1"></div>
        <div class="mini-f"><label>Stacks por turno</label><input type="number" data-ec="stacksturno" value="0"></div>
        <div class="mini-f"><label>Vida extra de base (se renueva cada Mantenimiento)</label><input type="number" data-ec="escudomagico" min="0" value="0"></div>
      </div>
    </div>
    <div class="ec-paso" data-ec-paso="numeros">
      <div class="est-mods">
        <div class="est-mods-label">Modificadores de atributo</div>
        <div data-ec="mods-lista"></div>
        <button type="button" class="addmod-mini" data-ec="addmod">+ Modificador de atributo</button>
      </div>
    </div>
    <div class="ec-paso" data-ec-paso="resumen" style="display:flex;flex-direction:column;gap:10px">
      <div class="resumen-hab" data-ec="resumen"></div>
      <div data-ec="presets-caja" style="border-top:1px dashed var(--line-soft);padding-top:8px">
        <button type="button" class="addmod-mini" data-ec="guardarpreset">☆ Guardar como preset personalizado</button>
        <button type="button" class="addmod-mini" data-ec="borrarpreset" style="margin-top:5px;color:var(--danger);display:none">Borrar preset personalizado</button>
      </div>
    </div>`;
  const PASOS_ESTADO = [
    {id: 'que', corto: 'Qué es', ayuda: '<b>¿Qué estado es?</b> Elegí uno de la lista (carga sus números) o completalo a mano.'},
    {id: 'dura', corto: 'Duración', ayuda: '<b>¿Cuánto dura?</b> Cada ⟳ Mantenimiento descuenta un turno. Permanente: no vence solo.'},
    {id: 'vida', corto: 'Vida', ayuda: '<b>¿Toca la vida?</b> HP por turno: negativo daña, positivo cura; se multiplica por los stacks. El escudo absorbe el daño antes que la vida.'},
    {id: 'numeros', corto: 'Números', ayuda: '<b>¿Cambia algún número?</b> Suma o resta a un atributo (o al No2 máximo) mientras esté activo: +2 Fuerza, −1 Agilidad…'},
    {id: 'resumen', corto: 'Resumen', ayuda: '<b>Así queda.</b>'},
  ];
  function crearEstado(contenedor, ctx){
    const cajaBloques = document.createElement('div');
    cajaBloques.innerHTML = BLOQUES_ESTADO;
    const bloques = {};
    cajaBloques.querySelectorAll('.ec-paso').forEach(b => { bloques[b.dataset.ecPaso] = b; });
    const todos = Object.values(bloques);
    const $e = n => { for(const b of todos){ const x = b.querySelector(`[data-ec="${n}"]`); if(x) return x; } return null; };
    let pap = null;   // la ventana abierta (comun/paso-a-paso.js)
    const toast = m => ctx.toast(m);
    const confirmar = (t, o) => (ctx.confirmar || ((x, y) => Confirmar.preguntar(x, y)))(t, o);   // el cartel del juego, no el confirm() nativo (puede ser una promesa: siempre con await)
    const FLAGS = CreepAcciones.FLAGS_ESTADO;
    const conPresets = typeof ctx.personalizados === 'function' && typeof ctx.guardarPresets === 'function';
    const personalizados = () => conPresets ? (ctx.personalizados() || []) : [];
    let ed = null;     // {scId, esId} — esId es null para un estado nuevo
    let mods = [];

    function botonesPreset(){
      $e('presets-caja').style.display = conPresets ? '' : 'none';
      if(!conPresets) return;
      const nombre = $e('nombre').value.trim();
      const yaGuardado = nombre && personalizados().some(p => p.nombre === nombre);
      $e('guardarpreset').textContent = yaGuardado ? 'Actualizar preset personalizado' : '☆ Guardar como preset personalizado';
      $e('borrarpreset').style.display = yaGuardado ? '' : 'none';
    }
    function renderMods(){
      $e('mods-lista').innerHTML = mods.map((m,i) => `
    <div class="est-modrow">
      <select data-ecmodstat="${i}">
        ${[...ATTR_IDS, 'nitros'].map(a => `<option value="${a}" ${m.stat===a?'selected':''}>${a === 'nitros' ? 'No2 máx.' : ATTR_LABELS[a]}</option>`).join('')}
      </select>
      <input type="number" data-ecmodval="${i}" value="${m.val}">
      <button class="rm" data-ecmodrm="${i}">×</button>
    </div>`).join('');
    }
    // El tope de No2 (Stun, Exhausto) no tiene campo propio en el editor: viaja con el preset elegido o con el estado que se está editando.
    function forzarNitros(){
      const v = $e('preset').dataset.forzarnitros;
      return v === undefined || v === '' ? '' : num(v);
    }
    function abrir(scId, esId, inicial){
      const sc = ctx.creep(scId);
      if(!sc) return;
      let es = null;
      if(esId){
        es = (sc.estados || []).find(x => x.id === esId);
        if(!es) return;
      }
      ed = {scId, esId};
      mods = structuredClone((es && es.mods) || []);
      $e('preset').innerHTML = '<option value="">— elegir preset o completar a mano —</option>' + opcionesEstadosHtml(personalizados());
      $e('preset').value = '';
      $e('nombre').value = es ? es.nombre : '';
      $e('detalle').value = es ? (es.detalle||'') : '';
      $e('turnos').value = es ? es.turnos : 1;
      $e('stacks').value = es ? es.stacks : 1;
      $e('hpturno').value = es ? es.hpTurno : 0;
      $e('stacksturno').value = es ? (es.stacksTurno ?? 0) : 0;
      $e('activo').checked = es ? es.activo !== false : true;
      $e('permanente').checked = es ? !!es.permanente : false;
      $e('preset').dataset.polaridad = es ? (es.polaridad||'otro') : 'otro';
      FLAGS.forEach(f => { $e('preset').dataset[f.toLowerCase()] = es && es[f] ? '1' : ''; });
      $e('preset').dataset.forzarnitros = es && es.forzarNitros !== undefined && es.forzarNitros !== null ? String(es.forzarNitros) : '';
      $e('escudomagico').value = es ? (es.escudoMagico ?? 0) : 0;
      if(inicial){   // lo que trae el asistente de estados (comun/asistente-estado.js, "formulario completo")
        $e('nombre').value = inicial.nombre;
        $e('detalle').value = inicial.detalle;
        $e('turnos').value = inicial.turnos;
        $e('permanente').checked = !!inicial.permanente;
        $e('hpturno').value = inicial.hp;
        $e('escudomagico').value = inicial.escudo;
        mods = structuredClone((inicial.mods || []).filter(m => [...ATTR_IDS, 'nitros'].includes(m.stat)));
        $e('preset').dataset.polaridad = inicial.polaridad;
        FLAGS.forEach(f => { $e('preset').dataset[f.toLowerCase()] = inicial.flags && inicial.flags[f] ? '1' : ''; });
        $e('preset').dataset.forzarnitros = inicial.forzarNitros !== undefined ? String(inicial.forzarNitros) : '';
      }
      renderMods();
      botonesPreset();
      const inicialPantalla = JSON.stringify(datosDePantalla()), nuevo = !esId;
      if(pap){ const v = pap; pap = null; v.cerrar(); }
      pap = PasoAPaso.abrir({
        titulo: () => nuevo ? `Nuevo estado · ${sc.nombre || 'creep'}` : `Editar estado · ${$e('nombre').value.trim() || 'estado'}`, crear: nuevo, contenedor, z: 85,
        textoCrear: '✔ Aplicar el estado',
        pasos: PASOS_ESTADO.map(x => ({id: x.id, nombre: x.corto, ayuda: x.ayuda, html: () => {
          if(x.id === 'resumen') $e('resumen').innerHTML = resumenHtml();
          bloques[x.id].hidden = false;
          return bloques[x.id];
        }, alMontar: () => { if(x.id === 'que') setTimeout(() => $e('nombre').focus(), 30); }})),
        alClic: clic, alCambio: alCambio, alInput: alInput,
        alTecla: ev => {
          const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
          if(ev.key !== 'Enter' || !t || t.tagName !== 'INPUT') return;
          ev.preventDefault();
          if(pap.paso() < PASOS_ESTADO.length - 1) pap.irA(pap.paso() + 1);
        },
        confirmarCancelar: () => JSON.stringify(datosDePantalla()) === inicialPantalla ? '' : (nuevo ? '¿Cancelar? El estado que estás armando se descarta.' : '¿Descartar los cambios de este estado?'),
        alGuardar: () => guardar(), alCrear: () => guardar(),
        alCancelar: () => cerrar(),
      });
    }
    function cerrar(){
      ed = null;
      if(pap){ const v = pap; pap = null; v.cerrar(); }
      if(ctx.alCerrar) ctx.alCerrar();
    }
    function resumenHtml(){
      const d = datosDePantalla(), fila = (t, v) => `<div class="resumen-fila"><span>${t}</span><b>${v}</b></div>`;
      const mods = d.mods.filter(m => m && num(m.val)).map(m => `${num(m.val) > 0 ? '+' : ''}${fmt(num(m.val))} ${esc(m.stat === 'nitros' ? 'No2 máx.' : ATTR_LABELS[m.stat] || m.stat)}`).join(' · ');
      return fila('Nombre', esc(d.nombre)) + fila('Dura', d.permanente ? 'no vence' : `${fmt(d.turnos)} turno(s)`)
        + (d.hpTurno ? fila('HP por turno', fmt(d.hpTurno) + (d.stacks > 1 ? ` × ${fmt(d.stacks)} stacks` : '')) : '')
        + (d.escudoMagico ? fila('Escudo', fmt(d.escudoMagico) + ' HP') : '') + (mods ? fila('Números', mods) : '') + (d.activo ? '' : fila('Activo', 'no'))
        + (d.detalle ? `<p class="hint" style="margin-top:8px">${esc(d.detalle)}</p>` : '');
    }
    function datosDePantalla(){
      const datos = {
        nombre: $e('nombre').value.trim() || 'Sin nombre',
        detalle: $e('detalle').value,
        turnos: Math.max(0, num($e('turnos').value) || 0),
        stacks: Math.max(1, num($e('stacks').value) || 1),
        hpTurno: num($e('hpturno').value) || 0,
        stacksTurno: num($e('stacksturno').value) || 0,
        activo: $e('activo').checked,
        permanente: $e('permanente').checked,
        polaridad: $e('preset').dataset.polaridad || 'otro',
        escudoMagico: num($e('escudomagico').value) || 0,
        forzarNitros: forzarNitros(),
        mods: structuredClone(mods),
      };
      FLAGS.forEach(f => { datos[f] = $e('preset').dataset[f.toLowerCase()] === '1'; });
      return datos;
    }
    async function guardar(){
      if(!ed) return;
      const datos = datosDePantalla(), {scId, esId} = ed, nombre = datos.nombre;
      cerrar();   // (la ventana se cierra sola: alGuardar/alCrear no devuelven false)
      let aviso = '';
      await ctx.guardar(scId, sc => {
        if(esId){
          const es = sc.estados.find(x => x.id === esId);
          if(es) Object.assign(es, datos);
          if(K.modsAfectanHp(datos.mods)) K.actualizarHpMaxPorCon(sc);
          aviso = `${nombre} guardado`;
          return;
        }
        // Un estado nuevo: la misma regla que el "+ Estado" (inmunidades, acumular o renovar uno igual), comun/combatiente.js.
        const r = Combatiente.agregarEstado(sc.estados, {id: uid(), ...datos}, {jefe: sc.jefe});
        if(!r.ok){ aviso = `${sc.nombre}: inmune ahora mismo (${r.motivo}) — ${nombre} no se pudo aplicar`; return; }
        if(r.que === 'yaLoTiene'){ aviso = `${sc.nombre}: ${nombre} ya lo tiene, no se acumula`; return; }
        if(K.modsAfectanHp(r.estado.mods)) K.actualizarHpMaxPorCon(sc);
        // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
        const dis = Combatiente.dispararAlAplicar(r, sc.estados, {hp: 'hpTurno', resFuego: K.resElemental(sc, 'fuego'), hpActual: sc.hp});
        if(dis.hp) sc.hp = Math.max(0, Math.min((parseFloat(sc.hpMax) || 0) > 0 ? parseFloat(sc.hpMax) : Infinity, (parseFloat(sc.hp) || 0) + dis.hp));
        aviso = `${sc.nombre}: ${textoEstadoAgregado(r, 'hpTurno')}${dis.hp ? ` · ya ${dis.hp < 0 ? 'sacó' : 'curó'} ${Math.abs(dis.hp)} HP` : ''}`;
      });
      if(aviso) toast(aviso);
    }

    async function clic(ev){
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(!t || !t.closest || !ed) return;
      const rm = t.closest('[data-ecmodrm]');
      if(rm){ mods.splice(+rm.dataset.ecmodrm, 1); renderMods(); return; }
      const b = t.closest('[data-ec]'), a = b && b.dataset.ec;
      if(a === 'addmod'){ mods.push({stat:'con', val:0}); renderMods(); }
      else if(a === 'guardarpreset' && conPresets){
        const nombre = $e('nombre').value.trim();
        if(!nombre){ toast('Poné un nombre antes de guardar el preset'); return; }
        const d = datosDePantalla();
        const preset = {nombre, polaridad: d.polaridad, turnos: d.turnos, stacks: d.stacks, hpTurno: d.hpTurno, stacksTurno: d.stacksTurno, detalle: d.detalle,
          escudoMagico: d.escudoMagico, forzarNitros: d.forzarNitros, mods: d.mods};
        FLAGS.forEach(f => { preset[f] = d[f]; });
        const lista = personalizados();
        const idx = lista.findIndex(p => p.nombre === preset.nombre);
        if(idx >= 0) lista[idx] = preset; else lista.push(preset);
        ctx.guardarPresets(lista);
        toast(`Preset "${preset.nombre}" guardado`);
        botonesPreset();
      }
      else if(a === 'borrarpreset' && conPresets){
        const nombre = $e('nombre').value.trim();
        if(!(await confirmar(`¿Borrar el preset "${nombre}"?\n\nEsto no borra el estado activo, solo el preset guardado para reutilizar.`, {titulo: 'Borrar preset', si: 'Borrar', peligro: true}))) return;
        ctx.guardarPresets(personalizados().filter(p => p.nombre !== nombre));
        toast('Preset borrado');
        botonesPreset();
      }
    }
    function alCambio(ev){
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(t && t.dataset && t.dataset.ecmodstat !== undefined) mods[+t.dataset.ecmodstat].stat = t.value;
      if(t && t.dataset && t.dataset.ec === 'preset') elegirPreset(t);
    }
    function alInput(ev){
      const t = ev.composedPath ? ev.composedPath()[0] : ev.target;
      if(t && t.dataset && t.dataset.ecmodval !== undefined) mods[+t.dataset.ecmodval].val = num(t.value);
      if(t && t.dataset && t.dataset.ec === 'nombre') botonesPreset();
    }
    function elegirPreset(t){
      if(!t.value) return;
      const [tipo, idx] = t.value.split(':');
      const preset = (tipo === 'std' ? estadosPresetCreep() : personalizados())[+idx];
      if(!preset) return;
      $e('nombre').value = preset.nombre;
      $e('detalle').value = preset.detalle || '';
      $e('turnos').value = preset.turnos ?? 0;
      $e('stacks').value = preset.stacks ?? 1;
      $e('hpturno').value = preset.hpTurno ?? 0;
      $e('stacksturno').value = preset.stacksTurno ?? 0;
      $e('activo').checked = true;
      $e('permanente').checked = !!preset.permanente;
      $e('escudomagico').value = preset.escudoMagico ?? 0;
      t.dataset.polaridad = preset.polaridad || 'otro';
      FLAGS.forEach(f => { t.dataset[f.toLowerCase()] = preset[f] ? '1' : ''; });
      t.dataset.forzarnitros = preset.forzarNitros !== undefined && preset.forzarNitros !== null ? String(preset.forzarNitros) : '';
      mods = structuredClone(preset.mods || []);
      renderMods();
      botonesPreset();
    }

    return {abrir, cerrar, get raiz(){ return pap ? pap.raiz : null; }, get estado(){ return ed; }};
  }

  return {MODOS_HAB_CREEP, PASOS_HAB_CREEP, HC_STATS_SECUNDARIOS, statLabel, opcionesStat, opcionesEstadosHtml, crear,
    textoEstadoAgregado, crearEstado,
    LEGADO_HABS, paraDeDatos, PARA_TXT, habDeBiblioteca, avisoJugador, metaHab, HABS_CREEP_GRUPOS, subirHab, ponerHab, elegirDeBiblioteca};
})();
