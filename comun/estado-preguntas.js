/* =========================================================
   PREGUNTAS AL ACTIVAR UN ESTADO ALTERADO PRESET (2026-09-24, pedido del dueño)
   Cada preset de estado alterado ya trae definido QUÉ hace (su efecto), pero no sus cantidades: al elegirlo aparece un cartelito
   que pregunta de a una: cuánto HP (cura o daña por turno), cuántos HP tiene el escudo, cuántos stacks, cuánto suma o resta
   cada bono y, al final, cuántos turnos dura — o "sin límite" (no vence). Recién con las respuestas se crea el estado.

   Uso (lo llaman la ficha y gm-tools cuando se activa un preset estándar):
     const armado = await EstadoPreguntas.pedir(preset, {hp: 'hpturno', statLabel: id => 'Daño'});   // null = canceló
   `cfg.hp` es el nombre del campo de HP por turno del preset (la ficha usa `hpturno`, gm-tools `hpTurno`) y `cfg.statLabel`
   traduce el id de un stat a su nombre. Devuelve una copia del preset con las respuestas puestas; si no hay nada que preguntar,
   devuelve el preset tal cual. `EstadoPreguntas.chips(preset, cfg)` da lo que se va a preguntar, para mostrar en la tarjeta.
   ========================================================= */
const EstadoPreguntas = (() => {
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const conf = cfg => ({hp: 'hpturno', statLabel: id => id, ...(cfg || {})});

  // Qué hay que preguntar de un preset, en orden: HP, escudo, stacks, bonos y por último la duración.
  function preguntas(p, cfg){
    cfg = conf(cfg);
    const qs = [];
    const hp = num(p[cfg.hp]);
    if(hp){
      qs.push({clave: 'hp', etiqueta: hp > 0 ? 'HP que cura' : 'Daño (HP)', min: 1,
        texto: hp > 0 ? '¿Cuánto HP cura por turno?' : (p.esVeneno && num(p.stacks) > 1 ? '¿Cuánto daño (HP) hace por turno, por cada stack?' : '¿Cuánto daño (HP) hace por turno?')});
    }
    if(num(p.escudoMagico) > 0) qs.push({clave: 'escudo', etiqueta: 'HP del escudo', min: 1, texto: '¿Cuántos HP tiene el escudo?'});
    if(num(p.stacks) > 1) qs.push({clave: 'stacks', etiqueta: 'Stacks', min: 1, texto: '¿Cuántos stacks?'});
    if(!p.armaduraRota){   // Armadura rota resta 1 por acumulación: es la regla, no una cantidad a elegir
      (p.mods || []).forEach((m, i) => {
        if(!m || !m.stat) return;
        const v = num(m.val), nombre = cfg.statLabel(m.stat);
        qs.push({clave: 'mod' + i, etiqueta: nombre, min: 1, texto: v < 0 ? `¿Cuánto resta a ${nombre}?` : `¿Cuánto suma a ${nombre}?`});
      });
    }
    qs.push({clave: 'turnos', etiqueta: 'Turnos', min: 1, turnos: true, sinLimiteInicial: !!p.permanente, texto: '¿Cuántos turnos dura?'});
    return qs;
  }

  // Lo que el preset va a preguntar, en palabras cortas (para la tarjeta del selector).
  const chips = (p, cfg) => preguntas(p, cfg).map(q => q.etiqueta);

  // Copia del preset con las respuestas puestas. resp = {clave: número} (turnos: null = sin límite).
  function aplicar(p, resp, cfg){
    cfg = conf(cfg);
    const r = structuredClone(p);
    if('hp' in resp){
      if(p.esSangrado){ r[cfg.hp] = -1; r.stacks = resp.hp; }   // Sangrado sube de a 1 con cada aplicación: N stacks de 1 HP
      else r[cfg.hp] = (num(p[cfg.hp]) < 0 ? -1 : 1) * resp.hp;
    }
    if('escudo' in resp) r.escudoMagico = resp.escudo;
    if('stacks' in resp) r.stacks = resp.stacks;
    (p.mods || []).forEach((m, i) => { if(('mod' + i) in resp) r.mods[i].val = (num(m.val) < 0 ? -1 : 1) * resp['mod' + i]; });
    if('turnos' in resp){
      if(resp.turnos === null){ r.permanente = true; r.turnos = 0; }
      else{ r.permanente = false; r.turnos = resp.turnos; }
    }
    return r;
  }

  function estilos(){
    if(document.getElementById('estado-preguntas-css')) return;
    const s = document.createElement('style');
    s.id = 'estado-preguntas-css';
    s.textContent = `
#ep-fondo{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px}
#ep-caja{width:min(360px,100%);background:#1A1418;border:1px solid #C98545;border-radius:6px;box-shadow:0 16px 40px rgba(0,0,0,.7);
  padding:16px 18px;font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left}
#ep-caja .ep-titulo{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#9A867E;margin-bottom:2px}
#ep-caja .ep-estado{font-size:17px;font-weight:700;color:#E0A458;margin-bottom:12px}
#ep-caja .ep-pregunta{font-size:15px;margin-bottom:8px}
#ep-caja input[type=number]{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;
  padding:9px 10px;font:inherit;font-size:18px}
#ep-caja input[type=number]:focus{outline:2px solid #C98545}
#ep-caja input[type=number]:disabled{opacity:.4}
#ep-caja .ep-sin{display:flex;gap:8px;align-items:center;margin-top:10px;font-size:14px;color:#EDE3D2;cursor:pointer}
#ep-caja .ep-error{min-height:1.2em;color:#E27B72;font-size:13px;margin-top:8px}
#ep-caja .ep-fila{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:10px}
#ep-caja .ep-pasos{font:11px "Space Mono",monospace;color:#9A867E}
#ep-caja .ep-botones{display:flex;gap:8px}
#ep-caja button{background:#221A1E;border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer}
#ep-caja button:hover{border-color:#C98545}
#ep-caja button.ep-primario{background:#C98545;border-color:#C98545;color:#180F08}`;
    document.head.appendChild(s);
  }

  // Muestra el cartelito, de a una pregunta. Devuelve una promesa: el preset armado, o null si se cancela.
  function pedir(preset, cfg){
    const qs = preguntas(preset, cfg);
    if(!qs.length) return Promise.resolve(preset);
    return preguntar({titulo: 'Estado alterado', nombre: preset.nombre}, qs, resp => aplicar(preset, resp, cfg));
  }

  // El cartelito genérico (2026-09-24): preguntas de a una con Siguiente/Atrás/Listo. cab = {titulo, nombre}. Cada pregunta:
  // {clave, texto, min, tipo?: 'numero' (por defecto) | 'texto', patron?, error?, opcional?, turnos?, sinLimiteInicial?}.
  // Al terminar llama a alTerminar(respuestas) y devuelve lo que ella devuelva (o null si se cancela).
  function preguntar(cab, qs, alTerminar){
    estilos();
    return new Promise(resolver => {
      const resp = {};
      let i = 0;
      const fondo = document.createElement('div');
      fondo.id = 'ep-fondo';
      fondo.innerHTML = '<div id="ep-caja" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(fondo);
      const caja = fondo.firstChild;
      const cerrar = valor => { document.removeEventListener('keydown', teclas, true); fondo.remove(); resolver(valor); window.dispatchEvent(new Event('ep-cerrado')); };
      const teclas = e => { if(e.key === 'Escape'){ e.preventDefault(); e.stopPropagation(); cerrar(null); } };
      document.addEventListener('keydown', teclas, true);
      fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(null); });

      const dibujar = () => {
        const q = qs[i], ultimo = i === qs.length - 1;
        const previo = q.clave in resp ? resp[q.clave] : undefined;
        const sinLimite = q.turnos && (previo === null || (previo === undefined && q.sinLimiteInicial));
        caja.innerHTML = `
          <div class="ep-titulo">${esc(cab.titulo)}</div>
          <div class="ep-estado">${esc(cab.nombre)}</div>
          <div class="ep-pregunta">${esc(q.texto)}</div>
          ${q.tipo === 'texto'
            ? `<input type="text" id="ep-valor" placeholder="${esc(q.placeholder || 'Escribí acá')}" value="${previo !== undefined && previo !== null ? esc(previo) : ''}" style="width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:9px 10px;font:inherit;font-size:18px">`
            : `<input type="number" id="ep-valor" min="${q.min}" step="1" inputmode="numeric" placeholder="Escribí un número"
            value="${previo !== undefined && previo !== null ? previo : ''}"${sinLimite ? ' disabled' : ''}>`}
          ${q.turnos ? `<label class="ep-sin"><input type="checkbox" id="ep-sin"${sinLimite ? ' checked' : ''}> Sin límite (no vence: dura hasta que se lo saquen)</label>` : ''}
          <div class="ep-error" id="ep-error"></div>
          <div class="ep-fila">
            <span class="ep-pasos">${i + 1} de ${qs.length}</span>
            <span class="ep-botones">
              <button type="button" id="ep-cancelar">Cancelar</button>
              ${i > 0 ? '<button type="button" id="ep-atras">← Atrás</button>' : ''}
              <button type="button" class="ep-primario" id="ep-siguiente">${ultimo ? 'Listo' : 'Siguiente'}</button>
            </span>
          </div>`;
        const campo = caja.querySelector('#ep-valor'), sin = caja.querySelector('#ep-sin');
        if(sin) sin.onchange = () => { campo.disabled = sin.checked; if(!sin.checked) campo.focus(); };
        const avanzar = () => {
          const error = msg => { caja.querySelector('#ep-error').textContent = msg; if(!campo.disabled) campo.focus(); };
          if(sin && sin.checked) resp[q.clave] = null;
          else if(q.tipo === 'texto'){
            const t = campo.value.trim();
            if(!t && !q.opcional) return error('Escribí algo.');
            if(t && q.patron && !q.patron.test(t)) return error(q.error || 'No es válido.');
            resp[q.clave] = t;
          }else{
            const v = Math.round(num(campo.value));
            if(campo.value.trim() === '' || !Number.isFinite(Number(campo.value))) return error('Escribí un número.');
            if(v < q.min) return error(`Tiene que ser ${q.min} o más.`);
            resp[q.clave] = v;
          }
          if(ultimo) cerrar(alTerminar(resp)); else{ i++; dibujar(); }
        };
        caja.querySelector('#ep-siguiente').onclick = avanzar;
        caja.querySelector('#ep-cancelar').onclick = () => cerrar(null);
        const atras = caja.querySelector('#ep-atras');
        if(atras) atras.onclick = () => { i--; dibujar(); };
        campo.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); avanzar(); } };
        if(!sinLimite) setTimeout(() => campo.focus(), 20);
      };
      dibujar();
    });
  }

  return {preguntas, chips, aplicar, pedir, preguntar};
})();
