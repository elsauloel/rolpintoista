/* =========================================================
   ASISTENTE PARA CREAR UNA ZONA CON EFECTO PERSISTENTE, PASO A PASO (2026-09-28, pedido del dueño)
   Mismo criterio que asistente-trampa.js (mismo dueño de la idea): un menú didáctico, paso por paso, con
   resumen al final. Por ahora solo cubre la forma Flor (radio) — Línea y Forma libre se siguen armando a mano
   con el panel de siempre de Terreno y Formas. No conoce el mapa ni Firestore: devuelve un resultado neutro
   (`res`) y quien llama lo convierte en los campos del elemento y pide dónde ponerlo.

   Uso:
     AsistenteZona.abrir({
       colores: ['#3F6FB0', …],
       alTerminar: res => {...},
       alCancelar: () => {...}   // opcional: se cerró sin terminar
     });
   res = {nombre, color, alfa, radio, turnos, dano ('' o '2d6+1'), tipoDano, ignoraDef, estado: {nombre, turnos, stacks?} | null,
          resistStat ('' o el id de un stat), resistValor, enMantenimiento, cadaPaso, amiga}
   Desde 2026-10-02 (tanda 5 de docs/plan-paso-a-paso.md) se abre en la ventana común paso a paso (comun/paso-a-paso.js), con la
   paleta de todos (antes era verde): título con el paso, pestañas que saltan, Atrás/Siguiente.
   ========================================================= */
const AsistenteZona = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  const TIPOS = [['arcano', 'Arcano (mágico)'], ['fuego', 'Fuego (mágico)'], ['hielo', 'Hielo (mágico)'], ['rayo', 'Eléctrico (mágico)'], ['toxico', 'Tóxico (veneno, gas)'], ['fisico', 'Físico (respeta la Defensa)']];
  const STATS = [['resmg', 'Res.Esp (resistir magia u otros efectos del Especial)'], ['resm', 'Res.Mt (resistir la mente)'], ['eva', 'Evasión (esquivar)'], ['con', 'Constitución'], ['fue', 'Fuerza'], ['agl', 'Agilidad'], ['des', 'Destreza'], ['esp', 'Especial']];

  function estilos(){
    if(document.getElementById('az-css')) return;
    const s = document.createElement('style');
    s.id = 'az-css';
    s.textContent = `
.az-c .az-preg{font-size:16px;font-weight:600;margin:10px 0 4px}
.az-c .az-ayuda{font-size:13px;color:#B7A79E;margin:0 0 10px;line-height:1.45}
.az-c input[type=text],.az-c input[type=number],.az-c select{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;
  border-radius:4px;color:#EDE3D2;padding:9px 10px;font:inherit;font-size:15px}
.az-c input:focus,.az-c select:focus{outline:2px solid #C98545}
.az-c .az-op{display:flex;gap:10px;align-items:flex-start;width:100%;box-sizing:border-box;text-align:left;background:rgba(255,255,255,.03);border:1px solid #3B2E34;
  border-radius:6px;padding:10px 12px;margin-bottom:8px;color:#EDE3D2;cursor:pointer;font:inherit}
.az-c .az-op:hover{border-color:#8A6236}.az-c .az-op.on{border-color:#E0A458;background:rgba(224,164,88,.12)}
.az-c .az-op .ico{font-size:22px;line-height:1.1;flex:none}
.az-c .az-op b{display:block;font-size:15px}.az-c .az-op small{display:block;color:#B7A79E;font-size:12.5px;margin-top:2px;line-height:1.35}
.az-c .az-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.az-c .az-grid .az-op{margin:0;flex-direction:column;gap:4px}
.az-c .az-grid .az-op .cab{display:flex;justify-content:space-between;gap:6px;width:100%;align-items:baseline}
.az-c .az-grid .az-op .cab em{font-style:normal;font-size:11px;color:#9A867E;font-family:"Space Mono",monospace;flex:none}
.az-c .az-fila{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.az-c .az-fila > *{min-width:0}
.az-c .az-fila label{font-size:13px;color:#B7A79E;flex:none}
.az-c .az-colores{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}
.az-c .az-color{width:28px;height:28px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0}
.az-c .az-color.on{border-color:#EDE3D2}
.az-c .az-sin{display:flex;gap:8px;align-items:flex-start;margin:10px 0;font-size:14px;cursor:pointer;line-height:1.35}
.az-c .az-sin input{width:auto!important;flex:none;margin:3px 0 0;padding:0}
.az-c .az-resumen{background:rgba(0,0,0,.3);border:1px solid #3B2E34;border-radius:6px;padding:12px 14px;margin:8px 0;font-size:15px;line-height:1.5}
.az-c .az-resumen b{color:#E0A458}.az-c .az-resumen ul{margin:6px 0 0;padding-left:20px}
`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    cfg = cfg || {};
    estilos();
    const colores = cfg.colores && cfg.colores.length ? cfg.colores : ['#4C9A2A', '#D9531E', '#3F6FB0', '#D07B3A', '#C4485A', '#9B7BD4'];
    const est = {
      error: '',
      radio: 1, turnos: 3,
      haceDano: false, dados: 2, caras: 6, fijo: 0, tipoDano: 'arcano', ignoraDef: true,
      aplicaEstado: false, estado: '', estadoTurnos: 0, estadoStacks: 0,
      seResiste: false, resistStat: 'resmg', resistValor: 12,
      enMantenimiento: true, cadaPaso: false,
      altura: 'aire',   // dónde está (2026-10-07): 'aire' | 'piso' | 'ambos' — Levitar salva de lo del piso; las Suelas restan a lo que toca el piso
      amiga: false,
      nombre: '', color: colores[0], alfa: 40,
    };
    const PASOS = ['tamano', 'dano', 'estado', 'resistencia', 'disparo', 'nombre', 'resumen'];
    const nombresEstado = () => (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS) ? EstadosAplicar.DEBUFFS.filter(p => !p.soloSistema).map(p => p.nombre) : [];
    const presetEstado = () => (typeof EstadosAplicar !== 'undefined' && EstadosAplicar.DEBUFFS) ? EstadosAplicar.DEBUFFS.find(p => p.nombre === est.estado) : null;
    const esVeneno = () => ['Veneno', 'Veneno severo'].includes(est.estado);
    const danoTxt = () => est.haceDano ? `${Math.max(1, est.dados)}d${est.caras}${est.fijo ? (est.fijo > 0 ? '+' : '') + est.fijo : ''}` : '';

    function frases(){
      const f = [];
      if(danoTxt()) f.push(`Hace ${danoTxt()} de daño ${TIPOS.find(t => t[0] === est.tipoDano)[1].split(' (')[0].toLowerCase()}${est.ignoraDef ? ' (directo a la vida: ignora la Defensa)' : ' (se le resta la Defensa)'}`);
      if(est.aplicaEstado && est.estado){ const p = presetEstado(); f.push(`Deja ${est.estado}${esVeneno() && est.estadoStacks ? ` ×${est.estadoStacks}` : ''}${p && p.permanente ? ' (no vence solo)' : ` durante ${est.estadoTurnos || (p ? p.turnos : 2)} turno(s)`}`); }
      if(est.seResiste) f.push(`Se resiste con ${STATS.find(s => s[0] === est.resistStat)[1].split(' (')[0]} contra ${est.resistValor}: quien pierde recibe lo de arriba`);
      else if(f.length) f.push('Se aplica directo, sin nada que resistir');
      if(!f.length) f.push('Todavía no hace nada: volvé a los pasos de Daño o Estado');
      f.push(est.enMantenimiento ? 'Sigue afectando en cada Mantenimiento a quien se quede adentro' : 'Solo afecta al entrar — quedarse quieto adentro no hace nada');
      f.push(est.cadaPaso ? 'Cada paso que se camina adentro cuenta (como pisar una a una varias púas)' : 'Alcanza con entrar una vez');
      f.push(est.amiga ? 'Afecta también a los aliados de quien la puso' : 'Solo afecta a los rivales');
      return f;
    }

    function validar(id){
      if(id === 'dano' && est.haceDano){
        if(!(est.dados >= 1)) return 'Poné cuántos dados de daño (1 o más).';
        if(!(est.caras >= 2)) return 'Elegí de cuántas caras es cada dado.';
      }
      if(id === 'estado' && est.aplicaEstado && !est.estado) return 'Elegí qué estado deja (o marcá "No").';
      if(id === 'resistencia' && est.seResiste && !(est.resistValor >= 1)) return 'Poné la dificultad (un número).';
      if(id === 'nombre' && !est.nombre.trim()) return 'Ponele un nombre a la zona.';
      return '';
    }

    // La ventana es la común (comun/paso-a-paso.js, 2026-10-02): pestañas que saltan hasta donde lo anterior está completo.
    let api = null;
    const NOMBRES = {tamano: 'Tamaño', dano: 'Daño', estado: 'Estado', resistencia: 'Resistencia', disparo: 'Cuándo afecta', nombre: 'Nombre', resumen: 'Resumen'};
    // ¿Se puede ir al paso i? Todo lo anterior tiene que estar completo (el problema se muestra arriba del paso).
    const faltaAntes = i => { for(let k = 0; k < Math.min(i, PASOS.length); k++){ const p = validar(PASOS[k]); if(p) return p; } return ''; };
    const vista = () => api && api.raiz.querySelector('#az-dvista');

    function cuerpo(id){
      if(id === 'tamano'){
        return `<div class="az-preg">¿Qué tamaño tiene?</div>
          <p class="az-ayuda">Por ahora el asistente arma zonas redondas (flor): un centro y los casilleros alrededor. Al terminar vas a marcar el centro con un clic en el mapa.</p>
          <div class="az-fila"><label style="flex:1.4">Tamaño</label><select id="az-radio">${Combatiente.diametroOpciones(est.radio, {min: 1})}</select></div>
          <div class="az-preg" style="margin-top:14px">¿Cuántos turnos dura?</div>
          <p class="az-ayuda">Cada ⟳ Mantenimiento del GM cuenta un turno; al llegar a este número, se borra sola.</p>
          <div class="az-fila"><label style="flex:1.4">Turnos</label><input type="number" id="az-turnos" min="1" max="99" value="${esc(est.turnos)}" style="width:90px"></div>`;
      }
      if(id === 'dano'){
        return `<div class="az-preg">¿Hace daño?</div>
          <label class="az-sin"><input type="checkbox" id="az-haceDano"${est.haceDano ? ' checked' : ''}> Sí, quien corresponda recibe daño</label>
          ${est.haceDano ? `<div class="az-preg">¿Cuánto?</div>
            <div class="az-fila"><input type="number" id="az-dados" min="1" max="20" value="${esc(est.dados)}" style="width:70px"><label>d</label>
              <select id="az-caras" style="width:90px">${[4, 6, 8, 10, 12, 20].map(c => `<option value="${c}"${est.caras === c ? ' selected' : ''}>${c}</option>`).join('')}</select>
              <label>+</label><input type="number" id="az-fijo" value="${esc(est.fijo)}" style="width:80px"><label>= <b id="az-dvista" style="color:#E0A458">${esc(danoTxt())}</b></label></div>
            <div class="az-preg">Tipo</div>
            <select id="az-tipodano">${TIPOS.map(([v, t]) => `<option value="${v}"${est.tipoDano === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
            <label class="az-sin" style="margin-top:8px"><input type="checkbox" id="az-ignoradef"${est.ignoraDef ? ' checked' : ''}> <span><b>Ignora la Defensa</b><br><small style="color:#B7A79E">Arranca marcado o no según el tipo (mágico = sí, físico = no), pero se puede cambiar: lo que decide no es el elemento, es cómo se narra.</small></span></label>` : ''}`;
      }
      if(id === 'estado'){
        return `<div class="az-preg">¿Aplica algún estado?</div>
          <p class="az-ayuda">Por ejemplo Veneno, Inmovilizado o Escarcha. Se aplica solo, mientras dure.</p>
          <div class="az-fila"><button type="button" class="az-op${!est.aplicaEstado ? ' on' : ''}" data-aplica="0" style="margin:0"><span><b>No</b></span></button>
            <button type="button" class="az-op${est.aplicaEstado ? ' on' : ''}" data-aplica="1" style="margin:0"><span><b>Sí, deja un estado</b></span></button></div>
          ${est.aplicaEstado ? `<div class="az-preg">¿Cuál?</div><div class="az-grid">${nombresEstado().map(n => `<button type="button" class="az-op${est.estado === n ? ' on' : ''}" data-estado="${esc(n)}"><span class="cab"><b>${esc(n)}</b></span></button>`).join('')}</div>
            ${est.estado && !esVeneno() ? `<div class="az-preg">¿Cuántos turnos dura el estado?</div><input type="number" id="az-estadoturnos" min="1" max="20" value="${esc(est.estadoTurnos || (presetEstado() ? presetEstado().turnos : 2))}">` : ''}
            ${est.estado && esVeneno() ? `<div class="az-preg">¿Cuántos stacks?</div><p class="az-ayuda">Vacío = el de siempre del preset.</p><input type="number" id="az-estadostacks" min="1" max="20" placeholder="por defecto" value="${est.estadoStacks || ''}">` : ''}` : ''}`;
      }
      if(id === 'resistencia'){
        return `<div class="az-preg">¿Se resiste con algo?</div>
          <p class="az-ayuda">Como quien la pone es el GM (no un personaje que tira), en vez de una tirada compartida le ponés vos la dificultad — mismo criterio que ya usan las trampas en su texto ("Evasión contra 10").</p>
          <label class="az-sin"><input type="checkbox" id="az-seresiste"${est.seResiste ? ' checked' : ''}> Sí: hay algo que tirar para resistirse</label>
          ${est.seResiste ? `<div class="az-fila"><select id="az-resiststat" style="flex:1.4">${STATS.map(([v, t]) => `<option value="${v}"${est.resistStat === v ? ' selected' : ''}>${t}</option>`).join('')}</select>
            <label>contra</label><input type="number" id="az-resistvalor" min="1" value="${esc(est.resistValor)}" style="width:80px"></div>` : '<p class="az-ayuda">Sin resistencia: el daño y/o el estado se aplican directo, sin tirar nada.</p>'}`;
      }
      if(id === 'disparo'){
        return `<div class="az-preg">¿Sigue afectando a quien se queda adentro?</div>
          <p class="az-ayuda">Una nube de veneno sí: quien se queda parado la sigue respirando. Un piso de púas no: si no caminás, no te pinchás.</p>
          <button type="button" class="az-op${est.enMantenimiento ? ' on' : ''}" data-mant="1"><span class="ico">☁️</span><span><b>Sí, en cada Mantenimiento</b><small>Mientras alguien siga adentro cuando el GM pasa el turno, se lo vuelve a chequear.</small></span></button>
          <button type="button" class="az-op${!est.enMantenimiento ? ' on' : ''}" data-mant="0"><span class="ico">🚶</span><span><b>No, solo importa moverse</b><small>Quedarse quieto adentro no hace nada — hace falta volver a caminar.</small></span></button>
          <div class="az-preg" style="margin-top:14px">¿Se dispara con cada paso, o alcanza con entrar?</div>
          <p class="az-ayuda">Con "cada paso", cruzarla de largo también cuenta, no solo terminar el movimiento adentro (las púas: cada casillero que pisás, aunque sigas de largo).</p>
          <button type="button" class="az-op${!est.cadaPaso ? ' on' : ''}" data-paso="0"><span class="ico">📍</span><span><b>Alcanza con entrar</b><small>Se chequea cuando termina de moverse adentro (nube de veneno, gas).</small></span></button>
          <button type="button" class="az-op${est.cadaPaso ? ' on' : ''}" data-paso="1"><span class="ico">🦶</span><span><b>Cada paso caminado adentro</b><small>Se chequea aunque solo la esté cruzando, sin quedarse (púas, brasas).</small></span></button>
          <div class="az-preg" style="margin-top:14px">¿Dónde está?</div>
          <p class="az-ayuda">Levitar salva de lo que está en el piso (mientras levita; al terminar su turno toca el suelo). Las Suelas restan al daño de lo que toca el piso.</p>
          <select id="az-altura" style="max-width:100%">
            <option value="aire"${est.altura === 'aire' ? ' selected' : ''}>☁️ Del aire: ocupa el espacio (gas, nube, humo, explosión) — alcanza aunque levites</option>
            <option value="piso"${est.altura === 'piso' ? ' selected' : ''}>🟫 Del piso: está en el suelo (púas, brea, aceite, brasas) — levitando se cruza sin tocarla</option>
            <option value="ambos"${est.altura === 'ambos' ? ' selected' : ''}>🔥 Ambos (fuego, escarcha): alcanza aunque levites; las Suelas le restan</option></select>
          <div class="az-preg" style="margin-top:14px">¿Afecta también a los aliados?</div>
          <label class="az-sin"><input type="checkbox" id="az-amiga"${est.amiga ? ' checked' : ''}> Sí, a cualquiera que corresponda, no solo a los rivales</label>`;
      }
      if(id === 'nombre'){
        return `<div class="az-preg">¿Cómo se llama?</div>
          <input type="text" id="az-nombre" maxlength="40" placeholder="Ej.: Nube tóxica" value="${esc(est.nombre)}">
          <div class="az-preg" style="margin-top:14px">Color</div>
          <div class="az-colores">${colores.map(c => `<button type="button" class="az-color${est.color === c ? ' on' : ''}" data-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>
          <div class="az-preg">Transparencia</div>
          <input type="range" id="az-alfa" min="10" max="100" step="5" value="${est.alfa}">`;
      }
      const fr = frases();
      return `<div class="az-preg">Así queda tu zona</div>
        <div class="az-resumen">🌫 <b>${esc(est.nombre.trim())}</b> · ${Combatiente.areaTxt(est.radio)} · dura ${est.turnos} turno${est.turnos === 1 ? '' : 's'}
          <ul>${fr.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        <p class="az-ayuda">Al confirmar te queda lista: <b>hacé clic en el mapa</b> para marcar el centro.</p>`;
    }

    const dibujar = () => { if(api) api.redibujar(); };

    // Estado: si es Veneno/Veneno severo y no se puso una cantidad de stacks a mano, no se manda `turnos` —
    // que lo complete el preset solo (Veneno sin stacks propios: 4 stacks, 4 turnos). Si se manda `turnos` fijo
    // sin stacks, `EstadosAplicar.componer` lo toma igual y el Veneno queda con los stacks de siempre (4) pero
    // vencido en menos turnos de los que dura ese daño — un desajuste real, encontrado probando este asistente.
    const estadoResultado = () => {
      if(!est.aplicaEstado || !est.estado) return null;
      const o = {nombre: est.estado};
      if(esVeneno()){ if(est.estadoStacks) o.stacks = est.estadoStacks; }
      else o.turnos = Math.max(1, est.estadoTurnos || (presetEstado() ? presetEstado().turnos : 2));
      return o;
    };
    const resultado = () => ({
      nombre: est.nombre.trim(), color: est.color, alfa: est.alfa, radio: est.radio, turnos: est.turnos,
      dano: danoTxt(), tipoDano: est.tipoDano, ignoraDef: est.haceDano ? est.ignoraDef : false,
      estado: estadoResultado(),
      resistStat: est.seResiste ? est.resistStat : '', resistValor: est.seResiste ? est.resistValor : null,
      enMantenimiento: est.enMantenimiento, cadaPaso: est.cadaPaso, amiga: est.amiga, altura: est.altura,
    });

    // Terminar (el «✓» del último paso): todo completo → el resultado (la ventana se cierra sola); si falta algo, avisa y sigue abierta.
    function terminar(){
      const problema = faltaAntes(PASOS.length);
      if(problema){ api.aviso(problema); return false; }
      const r = resultado();
      if(cfg.alTerminar) cfg.alTerminar(r);
    }
    const siguiente = () => api.irA(api.paso() + 1);

    const alClic = e => {
      const b = e.target.closest('button'); if(!b) return;
      const d = b.dataset;
      if(d.color){ est.color = d.color; dibujar(); return; }
      if(d.aplica !== undefined){ est.aplicaEstado = d.aplica === '1'; if(!est.aplicaEstado) est.estado = ''; est.error = ''; dibujar(); return; }
      if(d.estado){ est.estado = d.estado; est.estadoTurnos = 0; est.estadoStacks = 0; est.error = ''; dibujar(); return; }
      if(d.mant !== undefined){ est.enMantenimiento = d.mant === '1'; dibujar(); return; }
      if(d.paso !== undefined){ est.cadaPaso = d.paso === '1'; dibujar(); return; }
    };
    // Los campos se guardan al escribir (sin volver a dibujar, para no perder el foco).
    const alInput = e => {
      const t = e.target;
      if(t.id === 'az-radio') est.radio = Math.max(1, Math.min(6, Math.round(num(t.value)) || 1));
      else if(t.id === 'az-turnos') est.turnos = Math.max(1, Math.min(99, Math.round(num(t.value)) || 1));
      else if(t.id === 'az-dados'){ est.dados = Math.max(0, Math.round(num(t.value))); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'az-fijo'){ est.fijo = Math.round(num(t.value)); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'az-estadoturnos') est.estadoTurnos = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'az-estadostacks') est.estadoStacks = Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'az-resistvalor') est.resistValor = Math.round(num(t.value));
      else if(t.id === 'az-alfa') est.alfa = Math.round(num(t.value));
      else if(t.id === 'az-nombre') est.nombre = t.value;
    };
    const alCambio = e => {
      const t = e.target;
      if(t.id === 'az-haceDano'){ est.haceDano = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'az-caras'){ est.caras = num(t.value); const v = vista(); if(v) v.textContent = danoTxt(); }
      else if(t.id === 'az-tipodano'){ est.tipoDano = t.value; est.ignoraDef = est.tipoDano !== 'fisico'; dibujar(); }
      else if(t.id === 'az-ignoradef') est.ignoraDef = t.checked;
      else if(t.id === 'az-seresiste'){ est.seResiste = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'az-resiststat') est.resistStat = t.value;
      else if(t.id === 'az-amiga') est.amiga = t.checked;
      else if(t.id === 'az-altura') est.altura = t.value;
    };
    const inicial = JSON.stringify(est);
    api = PasoAPaso.abrir({
      titulo: '🌫 Crear una zona con efecto persistente', crear: true, z: 99985,
      textoCrear: '✓ Crear la zona',
      pasos: () => PASOS.map(id => ({id, nombre: NOMBRES[id] || id, html: () => `<div class="az-c">${cuerpo(id)}</div>`,
        alMontar: (c, a) => { const foco = a.raiz.querySelector('#az-radio, #az-nombre'); if(foco) setTimeout(() => { foco.focus(); if(foco.select) foco.select(); }, 30); }})),
      puedeIr: i => faltaAntes(i),
      alClic, alInput, alCambio,
      alTecla: e => { if(e.key === 'Enter' && e.target.tagName !== 'BUTTON'){ e.preventDefault(); if(api.paso() < PASOS.length - 1) siguiente(); else if(terminar() !== false) api.cerrar(); } },
      confirmarCancelar: () => JSON.stringify(est) === inicial ? '' : '¿Cancelar? La zona que estás armando se descarta.',
      alCrear: () => terminar(),
      alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); },
    });
  }

  return {abrir};
})();
