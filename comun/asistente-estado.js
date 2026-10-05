/* =========================================================
   ASISTENTE PARA CREAR UN ESTADO ALTERADO DE CERO (2026-09-25, pedido del dueño)
   Un menú paso a paso, didáctico, en vez del formulario completo: primero qué es (nombre y si es bueno o malo), después
   QUÉ HACE (daño o cura por turno, suma o resta a números, un escudo, reglas especiales ya automatizadas, o solo un
   recordatorio), las cantidades de cada cosa que se eligió, cuántos turnos dura y un resumen en palabras llanas.
   No sabe nada de la ficha ni de gm-tools: devuelve un resultado neutro y cada herramienta lo convierte a su formato.

   Uso:
     AsistenteEstado.abrir({
       titulo: 'Crear estado alterado',               // opcional
       para: 'Grunt',                                 // opcional: a quién se le va a aplicar (se ve arriba)
       stats: [{id, label, full}],                    // los números que se pueden subir o bajar
       guardable: true,                               // ofrece "guardar en Mis presets"
       alTerminar: res => {...},                      // res: ver abajo
       alFormulario: res => {...},                    // opcional: "Abrir el formulario completo" con lo armado hasta ahora
     });
   res = {nombre, polaridad: 'buff'|'debuff'|'otro', detalle, hp (con signo: + cura, − daño; 0 = nada), mods: [{stat, val}],
          escudo (0 = nada), flags: {marca: true…}, forzarNitros (undefined = nada, 0 = sin No2…), turnos, permanente, guardar}
   ========================================================= */
const AsistenteEstado = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  // Reglas especiales que el juego YA automatiza (las mismas marcas que llevan los presets). `flags` se suma al estado.
  const ESPECIALES = [
    {id: 'mitadEva',   texto: 'Parte a la mitad la Evasión y el PdG',             ayuda: 'Como Pajaritos: se tira el dado entero y al resultado se lo divide por 2, para abajo.', flags: {mitadPdgEva: true}},
    {id: 'mitadPar',   texto: 'Parte a la mitad el PdG y el Parry',               ayuda: 'Como Lisiado.', flags: {lisiado: true}},
    {id: 'inmov',      texto: 'No se puede mover',                                ayuda: 'Como Inmovilizado: no puede moverse (los No2 siguen sirviendo para lo demás).', flags: {inmovilizado: true, esCC: true}},
    {id: 'rengo',      texto: 'Moverse cuesta el doble de No2',                   ayuda: 'Como Rengo: 2 No2 por casillero.', flags: {rengo: true, esCC: true}},
    {id: 'lento',      texto: 'El primer casillero del turno cuesta el doble',   ayuda: 'Como Lento: el primer paso de cada turno cuesta el doble de No2.', flags: {lento: true, esCC: true}},
    {id: 'cansado',    texto: 'Recorta los No2 máximos a 2/3',                    ayuda: 'Como Cansado (redondeado hacia abajo).', flags: {cansado: true}},
    {id: 'exhausto',   texto: 'Recorta los No2 máximos a 1/3',                    ayuda: 'Como Exhausto (redondeado hacia abajo).', flags: {exhausto: true, esCC: true}},
    {id: 'hypeado',    texto: 'Suma 1/3 a los No2 máximos',                       ayuda: 'Como Hypeado (redondeado hacia arriba).', flags: {hypeado: true}},
    {id: 'sinNo2',     texto: 'Se queda sin No2',                                 ayuda: 'Como Stun: sus No2 quedan en 0 mientras dure.', flags: {esCC: true}, forzarNitros: 0},
    {id: 'sentado',    texto: 'Está en el piso (Sentado)',                        ayuda: 'Evasión a la mitad, no puede atacar; levantarse cuesta 1 No2.', flags: {sentado: true, esCC: true}},
    {id: 'invul',      texto: 'No recibe daño de ninguna fuente',                 ayuda: 'Como Invulnerable: tampoco se le pueden aplicar debuffs.', flags: {invulnerable: true}},
    {id: 'inmuneCC',   texto: 'Es inmune a los controles',                        ayuda: 'Como Inmunidad a CC: Stun, Exhausto, Inmovilizado, Rengo, Lisiado, Pajaritos…', flags: {inmunidadCC: true}},
    {id: 'sangrePura', texto: 'Es inmune al Veneno',                              ayuda: 'Como Sangre pura.', flags: {sangrePura: true}},
    {id: 'coagulacion',texto: 'Es inmune al Sangrado',                            ayuda: 'Como Coagulación extrema.', flags: {coagulacionExtrema: true}},
    {id: 'afortunado', texto: 'Tira dos veces PdG, Parry y Evasión y se queda con la mejor', ayuda: 'Como Afortunado.', flags: {afortunado: true}},
    {id: 'esCC',       texto: 'Cuenta como un estado de control',                 ayuda: 'No cambia números por sí solo: hace que Inmunidad a CC lo bloquee.', flags: {esCC: true}},
  ];
  const POLARIDADES = [
    {id: 'buff',   icono: '👍', texto: 'Buff',   ayuda: 'Le hace bien a quien lo recibe (una bendición, una mejora).'},
    {id: 'debuff', icono: '👎', texto: 'Debuff', ayuda: 'Le hace mal (una maldición, un veneno, un control).'},
    {id: 'otro',   icono: '◽', texto: 'Otro',   ayuda: 'Ni bueno ni malo: una condición o un recordatorio.'},
  ];
  const HACE = [
    {id: 'hp',       icono: '💔', texto: 'Daña o cura cada turno',           ayuda: 'Cambia el HP en cada Mantenimiento: un veneno, una regeneración…'},
    {id: 'mods',     icono: '📊', texto: 'Suma o resta a sus números',        ayuda: 'Por ejemplo +2 de Defensa, −1 de Evasión o −1 de No2 máximo.'},
    {id: 'escudo',   icono: '🛡', texto: 'Le da un escudo',                   ayuda: 'Una barra de HP extra que absorbe el daño antes que la vida.'},
    {id: 'especial', icono: '⚙', texto: 'Reglas especiales ya automatizadas', ayuda: 'Cosas que el programa ya sabe hacer solo: partir tiradas a la mitad, inmunidades, no poder moverse…'},
    {id: 'nota',     icono: '📝', texto: 'Solo un recordatorio',              ayuda: 'No cambia números: lo resolvés a mano y el estado te lo recuerda.'},
  ];

  function estilos(){
    if(document.getElementById('ae-css')) return;
    const s = document.createElement('style');
    s.id = 'ae-css';
    s.textContent = `
.ae-c .ae-preg{font-size:16px;font-weight:600;margin:10px 0 4px}
.ae-c .ae-ayuda{font-size:13px;color:#B7A79E;margin:0 0 10px;line-height:1.4}
.ae-c input[type=text],.ae-c input[type=number],.ae-c select,.ae-c textarea{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;
  border-radius:4px;color:#EDE3D2;padding:9px 10px;font:inherit;font-size:15px}
.ae-c textarea{min-height:64px;resize:vertical}
.ae-c input:focus,.ae-c select:focus,.ae-c textarea:focus{outline:2px solid #C98545}
.ae-c .ae-op{display:flex;gap:10px;align-items:flex-start;width:100%;box-sizing:border-box;text-align:left;background:rgba(255,255,255,.03);border:1px solid #3B2E34;
  border-radius:6px;padding:10px 12px;margin-bottom:8px;color:#EDE3D2;cursor:pointer;font:inherit}
.ae-c .ae-op:hover{border-color:#8A6236}
.ae-c .ae-op.on{border-color:#E0A458;background:rgba(224,164,88,.12)}
.ae-c .ae-op .ico{font-size:22px;line-height:1.1;flex:none}
.ae-c .ae-op b{display:block;font-size:15px}
.ae-c .ae-op small{display:block;color:#B7A79E;font-size:12.5px;margin-top:2px;line-height:1.35}
.ae-c .ae-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.ae-c .ae-grid3 .ae-op{flex-direction:column;align-items:center;text-align:center;margin:0}
.ae-c .ae-fila{display:flex;gap:8px;align-items:center;margin-bottom:8px}
.ae-c .ae-fila select{flex:1.2}.ae-c .ae-fila input[type=number]{flex:1;min-width:0}
.ae-c .ae-mini{background:#2A2126;border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:7px 11px;cursor:pointer;font:inherit;font-size:14px}
.ae-c .ae-mini:hover{border-color:#C98545}
.ae-c .ae-sin{display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14px;cursor:pointer}
.ae-c .ae-sin input{width:auto!important;flex:none;margin:0;padding:0}
.ae-c .ae-resumen{background:rgba(0,0,0,.3);border:1px solid #3B2E34;border-radius:6px;padding:12px 14px;margin:8px 0;font-size:15px;line-height:1.5}
.ae-c .ae-resumen b{color:#E0A458}
.ae-c .ae-resumen ul{margin:6px 0 0;padding-left:20px}
.ae-c .ae-link{background:none;border:none;color:#9A867E;text-decoration:underline;cursor:pointer;font:inherit;font-size:13px;padding:4px 0}
`;
    document.head.appendChild(s);
  }

  function abrir(cfg){
    cfg = cfg || {};
    estilos();
    const stats = (cfg.stats && cfg.stats.length ? cfg.stats : [{id: 'def', label: 'Def', full: 'Defensa'}]);
    const est = {
      paso: 0, error: '',
      nombre: '', polaridad: '', detalle: '',
      hace: new Set(),
      hpTipo: '', hpValor: 1,
      mods: [{stat: stats[0].id, val: 1}],
      escudo: 3,
      especiales: new Set(),
      sinLimite: false, turnos: 3,
      guardar: false, modsTocados: false,
    };

    // Los pasos dependen de lo que se eligió en "¿Qué hace?".
    const pasos = () => {
      const p = ['que', 'hace'];
      if(est.hace.has('hp')) p.push('hp');
      if(est.hace.has('mods')) p.push('mods');
      if(est.hace.has('escudo')) p.push('escudo');
      if(est.hace.has('especial')) p.push('especial');
      p.push('dura', 'resumen');
      return p;
    };

    const labelStat = id => { const s = stats.find(x => x.id === id); return s ? s.label : id; };
    const signo = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);

    // Lo que se va a crear, en palabras llanas (para el resumen y, si no se escribió una descripción, para el detalle del estado).
    function frases(){
      const f = [];
      if(est.hace.has('hp') && est.hpTipo) f.push(est.hpTipo === 'cura' ? `Cura ${est.hpValor} HP por turno` : `Hace ${est.hpValor} de daño por turno`);
      if(est.hace.has('mods')) est.mods.filter(m => m.stat && num(m.val)).forEach(m => f.push(`${signo(num(m.val))} ${labelStat(m.stat)}`));
      if(est.hace.has('escudo')) f.push(`Da un escudo de ${est.escudo} HP`);
      if(est.hace.has('especial')) ESPECIALES.filter(e => est.especiales.has(e.id)).forEach(e => f.push(e.texto));
      if(est.hace.has('nota') && !f.length) f.push('Solo un recordatorio (se resuelve a mano)');
      return f;
    }
    const duracionTxt = () => est.sinLimite ? 'No vence solo (sin límite)' : `Dura ${est.turnos} turno${est.turnos === 1 ? '' : 's'}`;

    function resultado(){
      const flags = {};
      let forzar;
      ESPECIALES.filter(e => est.hace.has('especial') && est.especiales.has(e.id)).forEach(e => { Object.assign(flags, e.flags); if(e.forzarNitros !== undefined) forzar = e.forzarNitros; });
      const hp = est.hace.has('hp') && est.hpTipo ? (est.hpTipo === 'cura' ? 1 : -1) * num(est.hpValor) : 0;
      const detalle = est.detalle.trim() || (frases().join('. ') + (frases().length ? '. ' : '') + duracionTxt() + '.');
      return {
        nombre: est.nombre.trim(), polaridad: est.polaridad || 'otro', detalle,
        hp, mods: est.hace.has('mods') ? est.mods.filter(m => m.stat && num(m.val)).map(m => ({stat: m.stat, val: num(m.val)})) : [],
        escudo: est.hace.has('escudo') ? num(est.escudo) : 0,
        flags, ...(forzar !== undefined ? {forzarNitros: forzar} : {}),
        turnos: est.sinLimite ? 0 : est.turnos, permanente: est.sinLimite, guardar: !!est.guardar,
      };
    }

    // Validación de cada paso: devuelve el texto del problema o ''.
    function validar(id){
      if(id === 'que'){
        if(!est.nombre.trim()) return 'Ponele un nombre al estado.';
        if(!est.polaridad) return 'Elegí si es un buff, un debuff u otro.';
      }
      if(id === 'hace' && !est.hace.size) return 'Elegí al menos una opción (o "Solo un recordatorio").';
      if(id === 'hp'){
        if(!est.hpTipo) return 'Elegí si daña o si cura.';
        if(!(num(est.hpValor) >= 1)) return 'Poné cuánto HP por turno (1 o más).';
      }
      if(id === 'mods'){
        const validos = est.mods.filter(m => m.stat && num(m.val));
        if(!validos.length) return 'Poné al menos un número distinto de 0 (con − para restar).';
      }
      if(id === 'escudo' && !(num(est.escudo) >= 1)) return 'Poné cuántos HP tiene el escudo (1 o más).';
      if(id === 'especial' && !est.especiales.size) return 'Marcá al menos una regla especial (o volvé y sacá esa opción).';
      if(id === 'dura' && !est.sinLimite && !(num(est.turnos) >= 1)) return 'Poné cuántos turnos dura (1 o más), o marcá "sin límite".';
      return '';
    }

    // La ventana es la común (comun/paso-a-paso.js, 2026-10-02): pestañas que saltan hasta donde lo anterior está completo.
    let api = null;
    const cerrar = () => { if(api) api.cerrar(); };
    const NOMBRES = {que: 'Qué es', hace: 'Qué hace', hp: 'Vida', mods: 'Números', escudo: 'Escudo', especial: 'Reglas', dura: 'Duración', resumen: 'Resumen'};
    // ¿Se puede ir al paso i? Todo lo anterior tiene que estar completo (el problema se muestra arriba del paso).
    const faltaAntes = i => { const ps = pasos(); for(let k = 0; k < Math.min(i, ps.length); k++){ const p = validar(ps[k]); if(p) return p; } return ''; };

    function cuerpoPaso(id){
      if(id === 'que'){
        return `<div class="ae-preg">¿Cómo se llama el estado?</div>
          <input type="text" id="ae-nombre" maxlength="40" placeholder="Ej.: Maldición de la luna" value="${esc(est.nombre)}">
          <div class="ae-preg">¿Es bueno o malo para quien lo recibe?</div>
          <div class="ae-grid3">${POLARIDADES.map(p => `<button type="button" class="ae-op${est.polaridad === p.id ? ' on' : ''}" data-pol="${p.id}"><span class="ico">${p.icono}</span><b>${p.texto}</b><small>${p.ayuda}</small></button>`).join('')}</div>
          <div class="ae-preg">Descripción <small style="color:#9A867E;font-weight:400">(opcional)</small></div>
          <p class="ae-ayuda">Lo que le pasa en la historia o en la regla. Si no escribís nada, el programa arma una con lo que configures.</p>
          <textarea id="ae-detalle" maxlength="300" placeholder="Ej.: La luna le roba fuerzas a quien la mira.">${esc(est.detalle)}</textarea>`;
      }
      if(id === 'hace'){
        return `<div class="ae-preg">¿Qué hace este estado?</div>
          <p class="ae-ayuda">Podés elegir varias cosas: después te voy preguntando los números de cada una.</p>
          ${HACE.map(h => `<button type="button" class="ae-op${est.hace.has(h.id) ? ' on' : ''}" data-hace="${h.id}"><span class="ico">${h.icono}</span><span><b>${h.texto}</b><small>${h.ayuda}</small></span></button>`).join('')}`;
      }
      if(id === 'hp'){
        return `<div class="ae-preg">¿Daña o cura?</div>
          <div class="ae-grid3" style="grid-template-columns:repeat(2,1fr)">
            <button type="button" class="ae-op${est.hpTipo === 'dano' ? ' on' : ''}" data-hptipo="dano"><span class="ico">🩸</span><b>Hace daño</b><small>Le saca HP cada turno.</small></button>
            <button type="button" class="ae-op${est.hpTipo === 'cura' ? ' on' : ''}" data-hptipo="cura"><span class="ico">💚</span><b>Cura</b><small>Le devuelve HP cada turno.</small></button>
          </div>
          <div class="ae-preg">¿Cuántos HP por turno?</div>
          <p class="ae-ayuda">Se aplica en cada Mantenimiento mientras el estado esté activo.</p>
          <input type="number" id="ae-hp" min="1" step="1" value="${esc(est.hpValor)}">`;
      }
      if(id === 'mods'){
        return `<div class="ae-preg">¿Qué números cambia?</div>
          <p class="ae-ayuda">Elegí el número y cuánto suma o resta. Para restar poné un − adelante (por ejemplo −2). Podés agregar varios.</p>
          ${est.mods.map((m, i) => `<div class="ae-fila">
            <select data-modstat="${i}">${stats.map(s => `<option value="${esc(s.id)}"${m.stat === s.id ? ' selected' : ''}>${esc(s.label)}${s.full && s.full !== s.label ? ' · ' + esc(s.full) : ''}</option>`).join('')}</select>
            <input type="number" step="1" data-modval="${i}" value="${esc(m.val)}">
            <button type="button" class="ae-mini" data-modrm="${i}" title="Sacar esta fila"${est.mods.length < 2 ? ' disabled' : ''}>✕</button>
          </div>`).join('')}
          <button type="button" class="ae-mini" data-modmas="1">＋ Agregar otro número</button>`;
      }
      if(id === 'escudo'){
        return `<div class="ae-preg">¿Cuántos HP tiene el escudo?</div>
          <p class="ae-ayuda">Absorbe todo el daño que reciba antes de que le toquen la vida, y se recarga entero en cada Mantenimiento mientras el estado siga activo.</p>
          <input type="number" id="ae-escudo" min="1" step="1" value="${esc(est.escudo)}">`;
      }
      if(id === 'especial'){
        return `<div class="ae-preg">¿Qué reglas especiales aplica?</div>
          <p class="ae-ayuda">Marcá las que quieras: el programa las resuelve solo mientras el estado esté activo.</p>
          ${ESPECIALES.map(e => `<button type="button" class="ae-op${est.especiales.has(e.id) ? ' on' : ''}" data-esp="${e.id}"><span class="ico">${est.especiales.has(e.id) ? '☑' : '☐'}</span><span><b>${e.texto}</b><small>${e.ayuda}</small></span></button>`).join('')}`;
      }
      if(id === 'dura'){
        return `<div class="ae-preg">¿Cuánto dura?</div>
          <p class="ae-ayuda">Cada ⟳ Mantenimiento que toca el GM cuenta como un turno. Al llegar a 0, el estado se saca solo.</p>
          <input type="number" id="ae-turnos" min="1" step="1" value="${esc(est.turnos)}"${est.sinLimite ? ' disabled' : ''}>
          <label class="ae-sin"><input type="checkbox" id="ae-sin"${est.sinLimite ? ' checked' : ''}> Sin límite: dura hasta que alguien lo saque a mano</label>`;
      }
      // resumen
      const fr = frases();
      return `<div class="ae-preg">Así queda tu estado</div>
        <div class="ae-resumen"><b>${esc(est.nombre.trim())}</b> · ${POLARIDADES.find(p => p.id === est.polaridad).icono} ${POLARIDADES.find(p => p.id === est.polaridad).texto}
          <ul>${fr.map(x => `<li>${esc(x)}</li>`).join('')}<li>${esc(duracionTxt())}</li></ul>
          ${est.detalle.trim() ? `<div style="margin-top:8px;color:#B7A79E;font-size:13px">“${esc(est.detalle.trim())}”</div>` : ''}
        </div>
        ${cfg.guardable !== false ? `<label class="ae-sin"><input type="checkbox" id="ae-guardar"${est.guardar ? ' checked' : ''}> ⭐ Guardarlo también en "Mis presets" para usarlo de nuevo</label>` : ''}
        ${cfg.alFormulario ? '<div style="margin-top:10px"><button type="button" class="ae-link" data-formulario="1">Prefiero abrir el formulario completo para ajustar más cosas</button></div>' : ''}`;
    }

    const dibujar = () => { if(api) api.redibujar(); };
    function terminar(){
      const problema = faltaAntes(pasos().length);
      if(problema){ api.aviso(problema); return false; }
      const res = resultado();
      if(cfg.alTerminar) cfg.alTerminar(res);
    }
    const siguiente = () => api.irA(api.paso() + 1);

    const alClic = e => {
      const b = e.target.closest('button');
      if(!b) return;
      const d = b.dataset;
      if(d.pol){ est.polaridad = d.pol; if(!est.modsTocados) est.mods[0].val = d.pol === 'debuff' ? -1 : 1; est.error = ''; dibujar(); return; }
      if(d.hace){
        // "Solo un recordatorio" no se combina con lo demás.
        if(d.hace === 'nota'){ est.hace = new Set(est.hace.has('nota') ? [] : ['nota']); }
        else{ est.hace.delete('nota'); if(est.hace.has(d.hace)) est.hace.delete(d.hace); else est.hace.add(d.hace); }
        est.error = ''; dibujar(); return;
      }
      if(d.hptipo){ est.hpTipo = d.hptipo; est.error = ''; dibujar(); return; }
      if(d.esp){ if(est.especiales.has(d.esp)) est.especiales.delete(d.esp); else est.especiales.add(d.esp); est.error = ''; dibujar(); return; }
      if(d.modmas){ est.mods.push({stat: stats[0].id, val: est.polaridad === 'debuff' ? -1 : 1}); dibujar(); return; }
      if(d.modrm !== undefined){ est.mods.splice(num(d.modrm), 1); dibujar(); return; }
      if(d.formulario && cfg.alFormulario){ const res = resultado(); cerrar(); cfg.alFormulario(res); return; }
    };
    // Los campos se guardan al escribir (sin volver a dibujar, para no perder el foco).
    const alInput = e => {
      const t = e.target;
      if(t.id === 'ae-nombre') est.nombre = t.value;
      else if(t.id === 'ae-detalle') est.detalle = t.value;
      else if(t.id === 'ae-hp') est.hpValor = t.value === '' ? '' : Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'ae-escudo') est.escudo = t.value === '' ? '' : Math.max(0, Math.round(num(t.value)));
      else if(t.id === 'ae-turnos') est.turnos = t.value === '' ? '' : Math.max(0, Math.round(num(t.value)));
      else if(t.dataset.modval !== undefined){ est.modsTocados = true; est.mods[num(t.dataset.modval)].val = t.value === '' ? 0 : Math.round(num(t.value)); }
    };
    const alCambio = e => {
      const t = e.target;
      if(t.id === 'ae-sin'){ est.sinLimite = t.checked; est.error = ''; dibujar(); }
      else if(t.id === 'ae-guardar') est.guardar = t.checked;
      else if(t.dataset.modstat !== undefined) est.mods[num(t.dataset.modstat)].stat = t.value;
    };
    api = PasoAPaso.abrir({
      titulo: (cfg.titulo || 'Crear un estado alterado') + (cfg.para ? ' · para ' + cfg.para : ''), crear: true, z: 99980,
      textoCrear: '✓ Crear el estado',
      pasos: () => pasos().map(id => ({id, nombre: NOMBRES[id] || id, html: () => `<div class="ae-c">${cuerpoPaso(id)}</div>`,
        alMontar: (c, a) => { const foco = a.raiz.querySelector('#ae-nombre, #ae-hp, #ae-escudo, #ae-turnos'); if(foco) setTimeout(() => { foco.focus(); if(foco.select) foco.select(); }, 30); }})),
      puedeIr: i => faltaAntes(i),
      alClic, alInput, alCambio,
      alTecla: e => { if(e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'BUTTON'){ e.preventDefault(); if(api.paso() < pasos().length - 1) siguiente(); else if(terminar() !== false) cerrar(); } },
      confirmarCancelar: () => est.nombre.trim() || est.hace.size ? '¿Cancelar? El estado que estás armando se descarta.' : '',
      alCrear: () => terminar(),
      alCancelar: () => { if(cfg.alCancelar) cfg.alCancelar(); },   // se cerró sin crear (lo usa el selector de estados para volver a su grilla)
    });
  }

  return {abrir, ESPECIALES};
})();
