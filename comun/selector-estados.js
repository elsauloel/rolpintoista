/* =========================================================
   SELECTOR-ESTADOS — el "+ Estado" (la grilla de estados alterados para ponerle a alguien), para cualquier pantalla
   (2026-10-02, hoja de ruta A3 de docs/pendientes.md: el mapa lo hace él mismo, sin abrir la ficha ni GM Tools en el marco)
   Lo mismo que la grilla de "+ Estado" de la ficha (abrirPresetsEfecto 'directo'/'inv') y de GM Tools (abrirPresetsEstadoCreep):
   los presets estándar agrupados en Buffs / Debuffs / Otros (al elegir uno pregunta sus cantidades con EstadoPreguntas), los "Mis
   presets" de quien lo use (se activan directo, con sus números) y "＋ Crear estado nuevo (paso a paso)" (AsistenteEstado).
   abrir({titulo, para, presets, propios, cfgPreguntas, stats, armarDeAsistente(res)}) → Promise de {preset, guardar} o null.
     presets: la lista estándar en la forma de quien la usa (estadosPresetFicha() o estadosPresetCreep());
     cfgPreguntas: {hp: 'hpturno' | 'hpTurno', statLabel(id)} (el de EstadoPreguntas);
     stats: los stats que ofrece el asistente ([{id, label, full}]); armarDeAsistente(res): el preset a partir de lo que devuelve.
     `preset` es el estado elegido con sus cantidades (copia); `guardar`: el asistente pidió guardarlo en "Mis presets".
   textoAgregado(r, campoHp): la frase que se avisa después de Combatiente.agregarEstado (la misma en la ficha, GM Tools y el mapa).
   Necesita comun/estado-preguntas.js y asistente-estado.js.
   ========================================================= */
const SelectorEstados = (() => {
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const POLARIDAD = {buff: 'Buffs', debuff: 'Debuffs', otro: 'Otros'};

  function estilos(){
    if(document.getElementById('se-css')) return;
    const s = document.createElement('style');
    s.id = 'se-css';
    s.textContent = `
#se-fondo{position:fixed;inset:0;z-index:99970;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:14px}
#se-caja{width:min(760px,100%);max-height:calc(100vh - 28px);display:flex;flex-direction:column;background:#1A1418;border:1px solid #C98545;border-radius:6px;
  box-shadow:0 16px 40px rgba(0,0,0,.7);font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left}
#se-caja header{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 18px 8px}
#se-caja .se-tit{font-size:18px;font-weight:700;color:#E0A458}
#se-caja .se-para{font-size:12px;color:#9A867E}
#se-caja .se-cuerpo{padding:4px 18px 14px;overflow:auto}
#se-caja .se-grupo{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A867E;margin:12px 0 6px}
#se-caja .se-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px}
#se-caja .se-btn{display:flex;flex-direction:column;gap:4px;text-align:left;background:rgba(255,255,255,.03);border:1px solid #3B2E34;border-radius:6px;
  padding:9px 11px;color:#EDE3D2;cursor:pointer;font:inherit}
#se-caja .se-btn:hover{border-color:#E0A458}
#se-caja .se-btn.buff{border-left:3px solid #6FAE6A}#se-caja .se-btn.debuff{border-left:3px solid #A86AC0}#se-caja .se-btn.propio{border-left:3px solid #E0A458}
#se-caja .se-nombre{font-weight:700;font-size:14px}
#se-caja .se-datos{display:flex;flex-wrap:wrap;gap:4px}
#se-caja .se-dato{font-size:11px;background:#2A2126;border-radius:3px;padding:1px 5px;color:#B7A79E}
#se-caja .se-dato.bueno{color:#8FCB89}#se-caja .se-dato.malo{color:#E27B72}
#se-caja .se-detalle{font-size:12px;color:#B7A79E;line-height:1.35}
#se-caja .se-x,#se-caja .se-nuevo{background:#2A2126;border:1px solid #3B2E34;border-radius:5px;color:#EDE3D2;padding:7px 12px;cursor:pointer;font:inherit;font-size:13px}
#se-caja .se-x:hover,#se-caja .se-nuevo:hover{border-color:#C98545}
#se-caja .se-nuevo{width:100%;margin-top:6px;border-style:dashed}
`;
    document.head.appendChild(s);
  }

  // La tarjeta de un preset: lo que hace (estándar: lo que se va a preguntar; propio: sus números).
  function tarjeta(p, valor, clase, cfg){
    const datos = [];
    if(valor.startsWith('std:')){
      EstadoPreguntas.chips(p, cfg).forEach(t => datos.push(`<span class="se-dato">${esc(t)}: a elegir</span>`));
    }else{
      const hp = num(p[cfg.hp]);
      if(hp) datos.push(`<span class="se-dato ${hp > 0 ? 'bueno' : 'malo'}">${hp > 0 ? '+' : ''}${fmt(hp)} HP/turno</span>`);
      if(p.permanente) datos.push('<span class="se-dato">No vence</span>');
      else if(num(p.turnos)) datos.push(`<span class="se-dato">${fmt(num(p.turnos))} turnos</span>`);
      if(num(p.escudoMagico) > 0) datos.push(`<span class="se-dato bueno">🛡${fmt(num(p.escudoMagico))}</span>`);
      (p.mods || []).forEach(m => { if(m && m.stat){ const v = num(m.val); datos.push(`<span class="se-dato ${v > 0 ? 'bueno' : 'malo'}">${esc(cfg.statLabel(m.stat))} ${v > 0 ? '+' : ''}${fmt(v)}</span>`); } });
    }
    const det = String(p.detalle || '').trim();
    return `<button type="button" class="se-btn ${clase}" data-se="${esc(valor)}">
      <span class="se-nombre">${esc(p.nombre)}</span>
      ${datos.length ? `<span class="se-datos">${datos.join('')}</span>` : ''}
      ${det ? `<span class="se-detalle">${esc(det.length > 90 ? det.slice(0, 88) + '…' : det)}</span>` : ''}
    </button>`;
  }

  function abrir(o){
    o = o || {};
    estilos();
    const cfg = {hp: 'hpturno', statLabel: id => id, ...(o.cfgPreguntas || {})};
    const presets = o.presets || [], propios = o.propios || [];
    return new Promise(resolve => {
      let html = '';
      ['buff', 'debuff', 'otro'].forEach(pol => {
        const del = presets.map((p, i) => ({p, i})).filter(({p}) => (p.polaridad || 'otro') === pol);
        if(!del.length) return;
        html += `<div class="se-grupo">${POLARIDAD[pol]} · ${fmt(del.length)}</div><div class="se-grid">${del.map(({p, i}) => tarjeta(p, `std:${i}`, pol, cfg)).join('')}</div>`;
      });
      if(propios.length) html += `<div class="se-grupo">Mis presets · ${fmt(propios.length)}</div><div class="se-grid">${propios.map((p, i) => tarjeta(p, `custom:${i}`, 'propio', cfg)).join('')}</div>`;
      const fondo = document.createElement('div');
      fondo.id = 'se-fondo';
      fondo.innerHTML = `<div id="se-caja" role="dialog" aria-label="${esc(o.titulo || 'Estado alterado')}">
        <header><div><div class="se-tit">${esc(o.titulo || 'Estado alterado')}</div>${o.para ? `<div class="se-para">para ${esc(o.para)}</div>` : ''}</div>
          <button type="button" class="se-x" data-se-x>Cerrar</button></header>
        <div class="se-cuerpo">${o.armarDeAsistente ? '<button type="button" class="se-nuevo" data-se-nuevo>＋ Crear estado nuevo (paso a paso)</button>' : ''}${html}</div>
      </div>`;
      let hecho = false;
      const terminar = v => {
        if(hecho) return;
        hecho = true;
        fondo.remove();
        document.removeEventListener('keydown', alTeclear, true);
        resolve(v);
      };
      const alTeclear = e => {
        if(e.key !== 'Escape' || !document.body.contains(fondo) || fondo.hidden) return;
        e.preventDefault(); e.stopPropagation();
        terminar(null);
      };
      document.addEventListener('keydown', alTeclear, true);
      fondo.addEventListener('mousedown', e => { if(e.target === fondo) terminar(null); });
      fondo.addEventListener('click', e => {
        const b = e.target.closest('button');
        if(!b) return;
        if(b.dataset.seX !== undefined){ terminar(null); return; }
        if(b.dataset.seNuevo !== undefined){
          fondo.hidden = true;
          let elegido = false;
          AsistenteEstado.abrir({
            titulo: 'Crear un estado alterado', para: o.para || '', stats: o.stats || [],
            alTerminar: res => { elegido = true; terminar({preset: o.armarDeAsistente(res), guardar: !!res.guardar}); },
            alCancelar: () => { if(!hecho && !elegido) fondo.hidden = false; },   // se cerró sin crear: se vuelve a la grilla
          });
          return;
        }
        const valor = b.dataset.se;
        if(!valor) return;
        const [tipo, idx] = valor.split(':');
        const p = (tipo === 'std' ? presets : propios)[+idx];
        if(!p) return;
        if(tipo !== 'std'){ terminar({preset: structuredClone(p), guardar: false}); return; }
        // Un preset estándar pregunta sus cantidades (HP, turnos…) antes de activarse.
        fondo.hidden = true;
        EstadoPreguntas.pedir(p, cfg).then(armado => { if(armado) terminar({preset: armado, guardar: false}); else fondo.hidden = false; });
      });
      document.body.appendChild(fondo);
    });
  }

  // Lo que se le avisa al que pone un estado (misma frase en la ficha, las invocaciones y los creeps).
  function textoAgregado(r, campoHp){
    const e = r.estado;
    if(r.que === 'acumulado'){
      if(e.esEscarcha) return `${e.nombre} ×${e.stacks} (−${e.stacks} No2 máx.)`;
      if(e.esSangrado) return `${e.nombre} +1 al daño por turno (${fmt(Math.abs(num(e[campoHp])) * num(e.stacks))} ahora)`;
      return `${e.nombre} ×${e.stacks}`;
    }
    return r.que === 'renovado' ? `${e.nombre} renovado (ya lo tenía)` : `${e.nombre} activado`;
  }

  /* El estado listo para Combatiente.agregarEstado, a partir del preset elegido (con sus cantidades), como lo arma cada herramienta:
     - personaje: lo mismo que activarEfectoPreset de la ficha (los valores por defecto de un estado nuevo + el preset);
     - invocación: lo mismo que activarEfectoPresetInv ({id, nombre, ...el resto del preset});
     - creep: lo mismo que activarEstadoPresetCreep de GM Tools (los campos de un estado de creep + sus marcas, `flags`). */
  function estadoPersonaje(preset, id){
    const {nombre, ...resto} = preset;
    return {id, nombre: '', imagen: '', detalle: '', mods: [], activo: true, stacks: 1, turnos: '', hpturno: 0, stacksturno: 0, permanente: false, popup: false,
      forzarNitros: '', mitadPdgEva: false, armaduraRota: false, escudoMagico: 0, ...structuredClone(resto), nombre};
  }
  function estadoInvocacion(preset, id){
    const {nombre, ...resto} = preset;
    return {id, nombre, ...structuredClone(resto)};
  }
  function estadoCreep(preset, id, flags){
    const datos = {
      id,
      nombre: preset.nombre,
      detalle: preset.detalle || '',
      turnos: preset.turnos ?? 0,
      stacks: preset.stacks ?? 1,
      hpTurno: preset.hpTurno ?? 0,
      stacksTurno: preset.stacksTurno ?? 0,
      activo: true,
      permanente: !!preset.permanente,
      escudoMagico: preset.escudoMagico ?? 0,
      forzarNitros: preset.forzarNitros ?? '',
      polaridad: preset.polaridad || 'otro',
      mods: structuredClone(preset.mods || []),
    };
    (flags || []).forEach(f => { datos[f] = !!preset[f]; });
    return datos;
  }

  return {abrir, textoAgregado, estadoPersonaje, estadoInvocacion, estadoCreep};
})();
