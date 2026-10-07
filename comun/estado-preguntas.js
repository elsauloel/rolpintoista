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
   Desde 2026-10-02 (tanda 5 de docs/plan-paso-a-paso.md) las preguntas se hacen en la ventana común paso a paso
   (comun/paso-a-paso.js): una pregunta por paso, con su pestaña («HP del escudo», «Turnos»…) y «✔ Listo» en el último.
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
    // Veneno (regla del dueño, 2026-09-25): el daño por stack es SIEMPRE 1 HP, así que no se pregunta: solo cuántos stacks (y los turnos).
    if(hp && !p.esVeneno){
      qs.push({clave: 'hp', etiqueta: hp > 0 ? 'HP que cura' : 'Daño (HP)', min: 1,
        texto: hp > 0 ? '¿Cuánto HP cura por turno?' : (p.esVeneno && num(p.stacks) > 1 ? '¿Cuánto daño (HP) hace por turno, por cada stack?' : '¿Cuánto daño (HP) hace por turno?')});
    }
    if(num(p.escudoMagico) > 0) qs.push(p.excedenteVida ? {clave: 'escudo', etiqueta: 'Excedente', min: 1, texto: '¿Cuántos HP de vida extra tiene?'} : {clave: 'escudo', etiqueta: 'HP del escudo', min: 1, texto: '¿Cuántos HP tiene el escudo?'});
    // La vida extra es un valor neto sin tope por defecto (2026-09-27, pedido del dueño): al activarlo se
    // pregunta si esta vez tiene uno (ej. Drenar vida: "hasta 50% del máximo") — se guarda como recordatorio en
    // `excedenteTope`, nada lo hace cumplir solo.
    if(p.excedenteVida) qs.push({clave: 'tope', etiqueta: 'Tope', min: 1, sinLimite: true, sinLimiteInicial: true,
      sinLimiteTexto: 'Sin tope (se puede acumular lo que sea)', texto: '¿Tiene un tope máximo de excedente?'});
    // Sangrado no: sus stacks SON el daño (N de daño = N stacks de 1 HP), ya salen de la pregunta de HP.
    if(num(p.stacks) > 1 && !p.esSangrado && !p.esQuemadura) qs.push({clave: 'stacks', etiqueta: 'Stacks', min: 1, texto: '¿Cuántos stacks?'});
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
      if(p.esSangrado || p.esQuemadura){ r[cfg.hp] = -1; r.stacks = resp.hp; }   // Sangrado sube de a 1 con cada aplicación: N stacks de 1 HP
      else r[cfg.hp] = (num(p[cfg.hp]) < 0 ? -1 : 1) * resp.hp;
    }
    if('escudo' in resp) r.escudoMagico = resp.escudo;
    if('tope' in resp) r.excedenteTope = resp.tope;   // null = sin tope
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
.ep-c .ep-pregunta{font-size:16px;font-weight:600;margin:4px 0 10px}
.ep-c input[type=number],.ep-c input[type=text]{width:100%;box-sizing:border-box;font-size:18px}
.ep-c input:disabled{opacity:.4}
.ep-c .ep-sin{display:flex;gap:8px;align-items:center;margin-top:12px;font-size:14px;cursor:pointer}
.ep-c .ep-sin input{width:auto;flex:none;margin:0}`;
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
      // Lo escrito en cada pregunta (texto crudo) y si está marcado "sin límite"; se valida al pasar de paso y al terminar.
      const crudo = {}, sin = {};
      qs.forEach(q => { sin[q.clave] = !!((q.turnos || q.sinLimite) && q.sinLimiteInicial); crudo[q.clave] = ''; });
      // Se resuelve una sola vez: con lo armado (Listo) o null (Cancelar, Escape). El aviso 'ep-cerrado' sale después de que la ventana
      // se cerró (la Botonera/Acciones del mapa se fijan si quedó algo abierto).
      let resuelta = false;
      const listo = valor => { if(resuelta) return; resuelta = true; resolver(valor); setTimeout(() => window.dispatchEvent(new Event('ep-cerrado')), 0); };
      // La respuesta de la pregunta k: {v} o {error}.
      const leer = k => {
        const q = qs[k];
        if((q.turnos || q.sinLimite) && sin[q.clave]) return {v: null};
        const t = String(crudo[q.clave] ?? '').trim();
        if(q.tipo === 'texto'){
          if(!t && !q.opcional) return {error: 'Escribí algo.'};
          if(t && q.patron && !q.patron.test(t)) return {error: q.error || 'No es válido.'};
          return {v: t};
        }
        if(t === '' || !Number.isFinite(Number(t))) return {error: 'Escribí un número.'};
        const v = Math.round(num(t));
        if(v < q.min) return {error: `Tiene que ser ${q.min} o más.`};
        return {v};
      };
      const faltaAntes = i => { for(let k = 0; k < Math.min(i, qs.length); k++){ const x = leer(k); if(x.error) return `${qs[k].etiqueta || qs[k].texto}: ${x.error}`; } return ''; };
      function terminar(){
        const problema = faltaAntes(qs.length);
        if(problema){ api.aviso(problema); return false; }
        const resp = {};
        qs.forEach((q, k) => { resp[q.clave] = leer(k).v; });
        listo(alTerminar(resp));
      }
      const campoDe = () => api.raiz.querySelector('#ep-valor');
      const api = PasoAPaso.abrir({
        titulo: `${cab.titulo} · ${cab.nombre}`, crear: true, z: 99990, ancho: 640, textoCrear: '✔ Listo',
        pasos: qs.map((q, k) => ({id: q.clave, nombre: q.etiqueta || 'Pregunta ' + (k + 1), html: () => {
          const conCheckSin = q.turnos || q.sinLimite, marcado = conCheckSin && sin[q.clave];
          return `<div class="ep-c"><div class="ep-pregunta">${esc(q.texto)}</div>
            ${q.tipo === 'texto'
              ? `<input type="text" id="ep-valor" placeholder="${esc(q.placeholder || 'Escribí acá')}" value="${esc(crudo[q.clave])}">`
              : `<input type="number" id="ep-valor" min="${q.min}" step="1" inputmode="numeric" placeholder="Escribí un número" value="${esc(crudo[q.clave])}"${marcado ? ' disabled' : ''}>`}
            ${conCheckSin ? `<label class="ep-sin"><input type="checkbox" id="ep-sin"${marcado ? ' checked' : ''}> ${esc(q.sinLimiteTexto || 'Sin límite (no vence: dura hasta que se lo saquen)')}</label>` : ''}</div>`;
        }, alMontar: (cuerpo, a) => { const c = a.raiz.querySelector('#ep-valor'); if(c && !c.disabled) setTimeout(() => c.focus(), 20); }})),
        puedeIr: i => faltaAntes(i),
        alInput: e => { const t = e.target; if(t.id === 'ep-valor') crudo[qs[api.paso()].clave] = t.value; },
        alCambio: e => {
          const t = e.target;
          if(t.id !== 'ep-sin') return;
          sin[qs[api.paso()].clave] = t.checked;
          const c = campoDe();
          if(c){ c.disabled = t.checked; if(!t.checked) c.focus(); }
        },
        alTecla: e => {
          if(e.key !== 'Enter' || e.target.id !== 'ep-valor') return;
          e.preventDefault();
          if(api.paso() < qs.length - 1) api.irA(api.paso() + 1);
          else if(terminar() !== false) api.cerrar();
        },
        confirmarCancelar: '',
        alCrear: () => terminar(),
        alCancelar: () => listo(null),
      });
    });
  }

  return {preguntas, chips, aplicar, pedir, preguntar};
})();
