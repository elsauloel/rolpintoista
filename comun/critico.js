/* =========================================================
   GOLPE CRÍTICO (2026-09-25, regla del dueño: P113 y P115 en docs/preguntas-abiertas.md)
   Las tiradas de PdG contra Evasión se comparan a mano en la mesa; esto hace la cuenta del crítico a partir de esos dos números.

   Regla:
   - El "rango" del crítico es el Tipo del arma (4, 6, 8, 10 o 12). Crítico FRECUENTE ×F lo baja F puntos (mínimo 2).
   - Nivel del crítico N = (PdG − Evasión) ÷ rango, hacia abajo. N = 0: no hay crítico.
   - La Resistencia a crítico del defensor contra ese Tipo resta R niveles: se tiran N − R d20 y vale el MEJOR. Con N − R ≤ 0 no hay crítico.
   - El d20 da el multiplicador de TODO el daño del golpe: 7+ doble daño (×2), 17+ triple (×3), 20 cuádruple (×4); menos de 7, ×1.
     Crítico POTENTE ×P baja los umbrales: el doble 1 a 1 (7 − P, piso 1), el triple 1 cada 2 puntos, el cuádruple 1 cada 3.
   - El crítico IGNORA la armadura (la Defensa no se resta). Sin crítico, el daño es normal: daño − Defensa.

   API pura (sin Firebase): Critico.rango, Critico.umbrales, Critico.evaluar, Critico.multiplicador, Critico.resolverDano.
   Ventana: Critico.abrir() — una calculadora para poner PdG, Evasión y el arma, tirar los d20 y publicar el resultado en la Mesa.
   ========================================================= */
const Critico = (() => {
  const TIPOS = [4, 6, 8, 10, 12];
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const NOMBRE_MULT = {1: 'sin multiplicador', 2: 'doble daño', 3: 'triple daño', 4: 'cuádruple daño'};

  // Rango del crítico: el Tipo, menos los puntos de Crítico frecuente (nunca baja de 2).
  const rango = (tipo, frecuente) => Math.max(2, Math.round(num(tipo)) - Math.max(0, Math.round(num(frecuente))));

  // Umbrales del d20 con Crítico potente ×P. El doble daño baja 1 por punto (piso 1); el triple 1 cada 2; el cuádruple 1 cada 3.
  function umbrales(potente){
    const P = Math.max(0, Math.round(num(potente)));
    return {doble: Math.max(1, 7 - P), triple: Math.max(1, 17 - Math.floor(P / 2)), cuadruple: Math.max(1, 20 - Math.floor(P / 3))};
  }

  // Multiplicador que da el mejor d20 (1 = sin multiplicador).
  function multiplicador(mejorD20, potente){
    const u = umbrales(potente), d = num(mejorD20);
    return d >= u.cuadruple ? 4 : d >= u.triple ? 3 : d >= u.doble ? 2 : 1;
  }

  // ¿Hay crítico? Devuelve el rango efectivo, la diferencia, el nivel N y cuántos d20 se tiran (N − resistencia).
  function evaluar({pdg, eva, tipo, frecuente = 0, potente = 0, resistencia = 0}){
    const r = rango(tipo, frecuente), diff = num(pdg) - num(eva);
    const nivel = diff > 0 ? Math.floor(diff / r) : 0;
    const dados = Math.max(0, nivel - Math.max(0, Math.round(num(resistencia))));
    return {rango: r, diferencia: diff, nivel, dados, critico: dados > 0, umbrales: umbrales(potente)};
  }

  // Daño final. Con crítico: todo el daño × multiplicador y la Defensa NO se resta. Sin crítico: daño − Defensa (mínimo 0).
  function resolverDano({dano, defensa = 0, critico, mult = 1}){
    const d = Math.max(0, num(dano));
    if(critico) return {final: d * mult, ignoraArmadura: true, mult};
    return {final: Math.max(0, d - Math.max(0, num(defensa))), ignoraArmadura: false, mult: 1};
  }

  /* ---------- Ventana ---------- */
  function estilos(){
    if(document.getElementById('cr-css')) return;
    const s = document.createElement('style');
    s.id = 'cr-css';
    s.textContent = `
#cr-fondo{position:fixed;right:16px;top:64px;z-index:99975;width:min(400px,calc(100vw - 24px))}
#cr-caja{max-height:calc(100vh - 80px);overflow:auto;background:#1A1418;border:1px solid #C98545;border-radius:6px;box-shadow:0 16px 40px rgba(0,0,0,.7);
  font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left;padding:0 14px 14px}
#cr-caja .cr-cab{display:flex;align-items:center;gap:8px;padding:10px 0 6px;cursor:move;user-select:none;position:sticky;top:0;background:#1A1418;z-index:1}
#cr-caja .cr-cab h2{flex:1;margin:0;font-size:16px;color:#E0A458}
#cr-caja .cr-cab button{padding:2px 9px}
#cr-caja h2{margin:0 0 4px;font-size:18px;color:#E0A458}
#cr-caja p{margin:0 0 10px;font-size:13px;line-height:1.45;color:#B7A79E}
#cr-caja .cr-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 12px;margin:8px 0}
#cr-caja label{display:block;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:#9A867E;margin-bottom:2px}
#cr-caja input,#cr-caja select{width:100%;box-sizing:border-box;background:rgba(0,0,0,.35);border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:7px 9px;font:inherit;font-size:14px}
#cr-caja .cr-res{margin:10px 0;padding:10px 12px;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid #3B2E34;font-size:14px;line-height:1.5}
#cr-caja .cr-res b{color:#E0A458}
#cr-caja .cr-res.si{border-color:#C98545;background:rgba(201,133,69,.10)}
#cr-caja .cr-fila{display:flex;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap}
#cr-caja button{background:none;border:1px solid #3B2E34;border-radius:4px;color:#EDE3D2;padding:8px 14px;cursor:pointer;font:inherit}
#cr-caja button:hover{border-color:#C98545;color:#E0A458}
#cr-caja button.prim{background:#C98545;border-color:#C98545;color:#1A1418;font-weight:700}
#cr-caja button:disabled{opacity:.4;cursor:default}
#cr-caja .cr-sup{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#9A867E}
#cr-caja .cr-pasos{display:flex;gap:4px;margin:6px 0 4px}
#cr-caja .cr-pasos i{flex:1;height:4px;border-radius:2px;background:#3B2E34}
#cr-caja .cr-pasos i.hecho{background:#8A6236}#cr-caja .cr-pasos i.ahora{background:#E0A458}
#cr-caja .cr-preg{font-size:16px;font-weight:600;margin:8px 0 4px}
#cr-caja .cr-grid{grid-template-columns:1fr}
#cr-caja .cr-error{min-height:16px;color:#E27B72;font-size:13px}`;
    document.head.appendChild(s);
  }

  function abrir(inicial){
    estilos();
    const previo = document.getElementById('cr-fondo'); if(previo) previo.remove();
    inicial = inicial || {};
    // Datos de partida: si la herramienta define criticoDatosIniciales() (la ficha: su Crítico frecuente/potente y el Tipo de su arma equipada) se usan;
    // y si define criticoFuentes() (el mapa: los tokens con sus datos) se puede elegir quién ataca y quién defiende y se completa solo.
    let auto = {}, fuentes = [];
    try{ if(typeof criticoDatosIniciales === 'function') auto = criticoDatosIniciales() || {}; }catch(err){ console.error('criticoDatosIniciales:', err); }
    try{ if(typeof criticoFuentes === 'function') fuentes = criticoFuentes() || []; }catch(err){ console.error('criticoFuentes:', err); }
    if(Array.isArray(inicial.fuentes)) fuentes = inicial.fuentes;
    const v = Object.assign({pdg: '', eva: '', tipo: 6, frecuente: 0, potente: 0, resistencia: 0, dano: '', defensa: 0, atacante: '', defensor: ''}, auto, inicial);
    delete v.fuentes;
    const fuente = id => fuentes.find(f => f.id === id) || null;
    // Completa lo que se puede desde el token elegido (atacante: arma, frecuente y potente; defensor: resistencia a ese Tipo y Defensa).
    function cargarAtacante(){
      const f = fuente(v.atacante); if(!f) return;
      if(f.tipo) v.tipo = num(f.tipo);
      if(f.frecuente !== undefined) v.frecuente = Math.max(0, Math.round(num(f.frecuente)));
      if(f.potente !== undefined) v.potente = Math.max(0, Math.round(num(f.potente)));
    }
    function cargarDefensor(){
      const f = fuente(v.defensor); if(!f) return;
      const i = TIPOS.indexOf(num(v.tipo));
      if(Array.isArray(f.resistencias) && i >= 0) v.resistencia = Math.max(0, Math.round(num(f.resistencias[i])));
      if(f.defensa !== undefined && f.defensa !== null) v.defensa = Math.max(0, num(f.defensa));
    }
    cargarAtacante(); cargarDefensor();
    let tirada = null;   // {rolls, mejor, mult, dados} del último "Tirar d20"
    let paso = 0, error = '';
    const fondo = document.createElement('div');
    fondo.id = 'cr-fondo';
    document.body.appendChild(fondo);

    // Es un panel FLOTANTE, sin fondo que tape nada: se puede dejar abierto mientras se usa la Botonera. Esc solo lo cierra si el foco está adentro.
    let aMano = false;   // si la movieron con el mouse, no se reubica sola
    const cerrar = () => { clearInterval(vigia); removeEventListener('resize', reubicar); fondo.remove(); document.removeEventListener('keydown', teclas, true); };
    const teclas = e => { if(e.key === 'Escape' && fondo.contains(document.activeElement)){ e.stopPropagation(); cerrar(); } };
    document.addEventListener('keydown', teclas, true);
    // Con la Botonera abierta (en el mapa va en un iframe; en la ficha es una ventana), si la calculadora quedó encima se corre al espacio libre de al lado.
    function rectBotonera(){
      try{
        const marco = document.getElementById('botonera-marco'), capa = document.getElementById('botonera-capa');
        if(marco && capa && !capa.hidden && marco.contentDocument){
          const m = marco.contentDocument.querySelector('.scrim.open .modal');
          if(m){ const r = m.getBoundingClientRect(), o = marco.getBoundingClientRect(); return {left: r.left + o.left, right: r.right + o.left, top: r.top + o.top, bottom: r.bottom + o.top}; }
        }
        const m2 = document.querySelector('.scrim.open .botonera-modal');
        if(m2) return m2.getBoundingClientRect();
      }catch(err){}
      return null;
    }
    function reubicar(){
      if(!fondo.isConnected){ clearInterval(vigia); return; }
      if(aMano) return;
      const b = rectBotonera(), m = 12, MAX = 400, MIN = 300;
      fondo.style.top = '64px';
      if(!b){ fondo.style.width = ''; fondo.style.left = 'auto'; fondo.style.right = m + 'px'; return; }
      const libreDer = innerWidth - b.right - m * 2, libreIzq = b.left - m * 2;
      const ancho = Math.min(MAX, Math.max(libreDer, libreIzq));
      if(ancho < MIN){ fondo.style.width = ''; fondo.style.left = 'auto'; fondo.style.right = m + 'px'; return; }   // no hay lugar libre: se queda a la derecha (se puede arrastrar)
      fondo.style.width = ancho + 'px';
      if(libreDer >= libreIzq){ fondo.style.left = (b.right + m) + 'px'; fondo.style.right = 'auto'; }
      else{ fondo.style.left = Math.max(m, b.left - ancho - m) + 'px'; fondo.style.right = 'auto'; }
    }
    const vigia = setInterval(reubicar, 700);
    addEventListener('resize', reubicar);

    const campo = (id, etiqueta, valor, extra) => `<div class="cr-campo"><label for="cr-${id}">${etiqueta}</label><input id="cr-${id}" type="number" step="1" value="${esc(valor)}" ${extra || ''}></div>`;
    const selFuente = (id, etiqueta, actual) => fuentes.length
      ? `<div class="cr-campo"><label for="cr-${id}">${etiqueta}</label><select id="cr-${id}"><option value="">— a mano —</option>${fuentes.map(f => `<option value="${esc(f.id)}"${f.id === actual ? ' selected' : ''}>${esc(f.nombre)}</option>`).join('')}</select></div>` : '';
    const ev = () => evaluar({pdg: v.pdg, eva: v.eva, tipo: v.tipo, frecuente: v.frecuente, potente: v.potente, resistencia: v.resistencia});

    /* Pasos, en el orden de las tiradas:
       1 el arma del atacante · 2 la PdG del atacante · 3 la Evasión del defensor · 4 el crítico (nivel y d20; se saltea si no hay) · 5 el daño y el resultado */
    const PASOS = ['arma', 'pdg', 'eva', 'critico', 'dano'];
    const TITULOS = {arma: 'El arma del atacante', pdg: 'La PdG del atacante', eva: 'La Evasión del defensor', critico: '¿Hay crítico?', dano: 'El daño'};
    const hayCritico = () => !!(v.pdg !== '' && v.eva !== '' && ev().critico);
    const tieneAuto = () => Object.keys(auto).length > 0 || !!fuente(v.atacante);

    function cuerpo(id){
      if(id === 'arma') return `<div class="cr-preg">¿Con qué arma ataca?</div>
        <p>El <b>Tipo</b> del arma es el rango del crítico: cuanto más bajo, más fácil. Con <b>Crítico frecuente</b> el rango baja (mínimo 2); con <b>Crítico potente</b> los multiplicadores salen con menos en el d20. ${tieneAuto() ? '<b>Ya los completé</b> con lo que tiene equipado y activo (equipo, habilidades y estados): cambialos si hace falta.' : ''}</p>
        <div class="cr-grid">${selFuente('atacante', '¿Quién ataca?', v.atacante)}<div class="cr-campo"><label for="cr-tipo">Tipo del arma</label><select id="cr-tipo">${TIPOS.map(t => `<option value="${t}"${num(v.tipo) === t ? ' selected' : ''}>Tipo ${t}</option>`).join('')}</select></div>
        ${campo('frecuente', 'Crítico frecuente ×', v.frecuente, 'min="0"')}${campo('potente', 'Crítico potente ×', v.potente, 'min="0"')}</div>`;
      if(id === 'pdg') return `<div class="cr-preg">¿Cuánto sacó de PdG?</div>
        <p>La tirada de <b>probabilidad de golpe</b> del atacante, con todo sumado (el total que quedó en la Mesa).</p>
        <div class="cr-grid">${campo('pdg', 'PdG del atacante', v.pdg)}</div>`;
      if(id === 'eva') return `<div class="cr-preg">¿Cuánto sacó de Evasión el defensor?</div>
        <p>Su tirada de <b>Evasión</b>. Su equipo puede tener <b>Resistencia a crítico</b> contra armas de Tipo ${num(v.tipo)}: cada punto le quita un nivel al crítico. ${fuente(v.defensor) ? '<b>Ya la completé</b> con la del defensor.' : ''}</p>
        <div class="cr-grid">${selFuente('defensor', '¿Quién defiende?', v.defensor)}${campo('eva', 'Evasión del defensor', v.eva)}${campo('resistencia', `Resistencia a crítico (Tipo ${num(v.tipo)})`, v.resistencia, 'min="0"')}</div>
        <div id="cr-vista"></div>`;
      if(id === 'critico'){
        const e = ev(), u = e.umbrales;
        const cab = `Diferencia PdG − Evasión: <b>${e.diferencia}</b> · rango del crítico: <b>${e.rango}</b>${e.rango !== num(v.tipo) ? ` (Tipo ${num(v.tipo)} con frecuente ×${num(v.frecuente)})` : ''}`;
        let r;
        if(e.diferencia <= 0) r = `La PdG no supera a la Evasión: <b>no hay golpe</b> (se resuelve a mano) ni crítico.`;
        else if(e.nivel === 0) r = `<b>No es crítico</b>: la diferencia no llega al rango.`;
        else if(!e.critico) r = `Nivel del crítico ${e.nivel} − resistencia ${num(v.resistencia)}: la Resistencia a crítico del defensor <b>anula el crítico</b>.`;
        else{
          r = `Nivel del crítico: <b>${e.nivel}</b>${num(v.resistencia) > 0 ? ` − resistencia ${num(v.resistencia)} = <b>${e.dados}</b>` : ''}.<br><b>Crítico${e.dados > 1 ? ` ×${e.dados}` : ''}</b>: se tiran <b>${e.dados}d20</b> y vale el mejor. Doble daño con ${u.doble}+, triple con ${u.triple}+, cuádruple con ${u.cuadruple}+. Ignora la armadura.`;
          if(tirada) r += `<br>d20: ${tirada.rolls.join(', ')} → mejor <b>${tirada.mejor}</b> → <b>${NOMBRE_MULT[tirada.mult]}</b> (×${tirada.mult})`;
          else r += `<div class="cr-fila"><button type="button" id="cr-tirar" class="prim">🎲 Tirar ${e.dados}d20</button></div>`;
        }
        return `<div class="cr-preg">¿Hay crítico?</div><div class="cr-res${e.critico ? ' si' : ''}">${cab}<br>${r}</div>`;
      }
      // dano
      const e = ev(), crit = e.critico && tirada;
      return `<div class="cr-preg">¿Cuánto daño hace el golpe?</div>
        <p>El daño total del arma con todos los bonos (Fuerza incluida). ${e.critico ? 'Como es crítico, <b>no se resta la Defensa</b>: se multiplica y listo.' : 'Como no es crítico, se resta la Defensa del defensor.'}</p>
        <div class="cr-grid">${campo('dano', 'Daño del golpe', v.dano, 'min="0"')}${e.critico ? '' : campo('defensa', 'Defensa del defensor', v.defensa, 'min="0"')}</div>
        <div id="cr-resdano" class="cr-res${crit ? ' si' : ''}">${textoDano()}</div>
        <div class="cr-fila"><button type="button" id="cr-publicar">📣 Publicar en la Mesa</button><button type="button" id="cr-nuevo">↺ Otro golpe</button></div>`;
    }
    function textoDano(){
      if(v.dano === '') return 'Poné el daño y te calculo el resultado.';
      const e = ev(), crit = e.critico && tirada;
      const r = resolverDano({dano: v.dano, defensa: v.defensa, critico: !!crit, mult: crit ? tirada.mult : 1});
      if(crit) return `Daño: ${num(v.dano)} × ${tirada.mult} = <b>${r.final}</b> (ignora la Defensa)`;
      return `Daño: ${num(v.dano)} − Defensa ${num(v.defensa)} = <b>${r.final}</b>${e.critico ? '<br><i>Falta tirar los d20 del crítico (volvé al paso anterior).</i>' : ''}`;
    }
    function vistaEva(){
      const c = fondo.querySelector('#cr-vista'); if(!c) return;
      if(v.pdg === '' || v.eva === ''){ c.innerHTML = ''; return; }
      const e = ev();
      c.innerHTML = `<div class="cr-res">Diferencia: <b>${e.diferencia}</b> · rango <b>${e.rango}</b> → ${e.diferencia <= 0 ? 'no hay golpe' : e.critico ? `<b>crítico${e.dados > 1 ? ' ×' + e.dados : ''}</b>` : e.nivel > 0 ? 'la resistencia lo anula' : 'no es crítico'}</div>`;
    }

    function validar(id){
      if(id === 'pdg' && v.pdg === '') return 'Escribí la PdG del atacante.';
      if(id === 'eva' && v.eva === '') return 'Escribí la Evasión del defensor.';
      if(id === 'critico' && hayCritico() && !tirada) return 'Tirá los d20 del crítico (o volvé y cambiá los números).';
      return '';
    }
    function siguientePaso(){
      const p = validar(PASOS[paso]);
      if(p){ error = p; dibujar(); return; }
      error = '';
      paso++;
      dibujar();
    }
    function pasoAtras(){ error = ''; paso = Math.max(0, paso - 1); dibujar(); }

    function dibujar(){
      const id = PASOS[paso], ultimo = paso === PASOS.length - 1;
      fondo.innerHTML = `<div id="cr-caja" role="dialog"><div class="cr-cab" id="cr-cab" title="Arrastrala para moverla"><h2>🎯 Calculadora de crítico</h2><button type="button" id="cr-x" title="Cerrar">✕</button></div>
        <div class="cr-sup">Paso ${paso + 1} de ${PASOS.length} · ${TITULOS[id]}</div>
        <div class="cr-pasos">${PASOS.map((_, i) => `<i class="${i < paso ? 'hecho' : i === paso ? 'ahora' : ''}"></i>`).join('')}</div>
        <div class="cr-cuerpo">${cuerpo(id)}<div class="cr-error">${esc(error)}</div></div>
        <div class="cr-fila">${paso > 0 ? '<button type="button" id="cr-atras">◀ Volver</button>' : ''}${ultimo ? '' : '<button type="button" id="cr-sigue" class="prim">Siguiente ▶</button>'}</div></div>`;
      vistaEva();
      const foco = fondo.querySelector('#cr-pdg, #cr-eva, #cr-dano');
      if(foco) setTimeout(() => { foco.focus(); if(foco.select) foco.select(); }, 30);
    }
    function tirar(){
      const e = ev();
      if(!e.critico) return;
      const rolls = Array.from({length: e.dados}, () => 1 + Math.floor(Math.random() * 20));
      const mejor = Math.max(...rolls);
      tirada = {rolls, mejor, mult: multiplicador(mejor, v.potente), dados: e.dados};
      error = '';
      dibujar();
    }
    function publicar(){
      const e = ev();
      if(typeof mesaPublicar !== 'function' || e.nivel === 0){ if(typeof toast === 'function') toast('No hay crítico que publicar'); return; }
      const t = tirada && tirada.dados === e.dados ? tirada : null;
      const partes = [`PdG ${num(v.pdg)} − Evasión ${num(v.eva)} = ${e.diferencia} (rango ${e.rango})`];
      if(!e.critico) partes.push('la Resistencia a crítico lo anula');
      else if(t){
        partes.push(`${NOMBRE_MULT[t.mult]} (×${t.mult})`);
        if(v.dano !== '') partes.push(`daño ${num(v.dano)} × ${t.mult} = ${num(v.dano) * t.mult}, ignora la Defensa`);
      }else{ if(typeof toast === 'function') toast('Primero tirá los d20'); return; }
      try{ if(typeof mesaTextoPendiente !== 'undefined') mesaTextoPendiente = partes.join(' · ').slice(0, 300); }catch(err){}
      if(t) mesaPublicar('Golpe crítico', {formula: `${t.rolls.length}d20 (el mejor)`, rolls: t.rolls, mod: 0, total: t.mejor});
      else mesaPublicar('Golpe crítico', {formula: 'sin crítico', rolls: [], mod: 0, total: 0});
    }

    fondo.addEventListener('mousedown', e => {   // arrastrar desde la cabecera
      const cab = e.target.closest('#cr-cab');
      if(!cab || e.target.closest('button')) return;
      e.preventDefault();
      const r = fondo.getBoundingClientRect(), dx = e.clientX - r.left, dy = e.clientY - r.top;
      const mover = ev2 => { aMano = true; fondo.style.right = 'auto'; fondo.style.left = Math.max(0, Math.min(innerWidth - 60, ev2.clientX - dx)) + 'px'; fondo.style.top = Math.max(0, Math.min(innerHeight - 40, ev2.clientY - dy)) + 'px'; };
      const soltar = () => { removeEventListener('mousemove', mover); removeEventListener('mouseup', soltar); };
      addEventListener('mousemove', mover); addEventListener('mouseup', soltar);
    });
    fondo.addEventListener('input', e => {
      const id = e.target.id && e.target.id.startsWith('cr-') ? e.target.id.slice(3) : '';
      if(!id || !(id in v) || id === 'atacante' || id === 'defensor' || id === 'tipo') return;
      v[id] = e.target.value === '' && (id === 'pdg' || id === 'eva' || id === 'dano') ? '' : num(e.target.value);
      if(id !== 'dano' && id !== 'defensa') tirada = null;   // cambiar los números del crítico invalida los d20 ya tirados; el daño no
      error = '';
      if(id === 'pdg' || id === 'eva' || id === 'resistencia') vistaEva();
      if(id === 'dano' || id === 'defensa'){ const r = fondo.querySelector('#cr-resdano'); if(r) r.innerHTML = textoDano(); }
    });
    fondo.addEventListener('change', e => {
      const id = e.target.id;
      if(id === 'cr-tipo'){ v.tipo = num(e.target.value); tirada = null; cargarDefensor(); }
      else if(id === 'cr-atacante'){ v.atacante = e.target.value; tirada = null; cargarAtacante(); cargarDefensor(); dibujar(); }
      else if(id === 'cr-defensor'){ v.defensor = e.target.value; tirada = null; cargarDefensor(); dibujar(); }
    });
    fondo.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.id === 'cr-x') cerrar();
      else if(b.id === 'cr-sigue') siguientePaso();
      else if(b.id === 'cr-atras') pasoAtras();
      else if(b.id === 'cr-tirar') tirar();
      else if(b.id === 'cr-publicar') publicar();
      else if(b.id === 'cr-nuevo'){ v.pdg = ''; v.eva = ''; v.dano = ''; tirada = null; error = ''; paso = 1; dibujar(); }
    });
    fondo.addEventListener('keydown', e => { if(e.key === 'Enter' && e.target.tagName === 'INPUT'){ e.preventDefault(); if(paso < PASOS.length - 1) siguientePaso(); } });
    dibujar();
    reubicar();
  }

  return {abrir, rango, umbrales, multiplicador, evaluar, resolverDano, TIPOS};
})();
