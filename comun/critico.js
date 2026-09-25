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
#cr-fondo{position:fixed;inset:0;z-index:99975;background:rgba(0,0,0,.62);display:flex;align-items:center;justify-content:center;padding:14px}
#cr-caja{width:min(560px,100%);max-height:calc(100vh - 28px);overflow:auto;background:#1A1418;border:1px solid #C98545;border-radius:6px;box-shadow:0 16px 40px rgba(0,0,0,.7);
  font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left;padding:14px 18px 16px}
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
#cr-caja button:disabled{opacity:.4;cursor:default}`;
    document.head.appendChild(s);
  }

  function abrir(inicial){
    estilos();
    const previo = document.getElementById('cr-fondo'); if(previo) previo.remove();
    const v = Object.assign({pdg: '', eva: '', tipo: 6, frecuente: 0, potente: 0, resistencia: 0, dano: '', defensa: 0}, inicial || {});
    let tirada = null;   // {rolls, mejor, mult} del último "Tirar d20"
    const fondo = document.createElement('div');
    fondo.id = 'cr-fondo';
    document.body.appendChild(fondo);
    const cerrar = () => { fondo.remove(); document.removeEventListener('keydown', teclas, true); };
    const teclas = e => { if(e.key === 'Escape'){ e.stopPropagation(); cerrar(); } };
    document.addEventListener('keydown', teclas, true);

    const campo = (id, etiqueta, valor, extra) => `<div><label for="cr-${id}">${etiqueta}</label><input id="cr-${id}" type="number" step="1" value="${esc(valor)}" ${extra || ''}></div>`;
    const ev = () => evaluar({pdg: v.pdg, eva: v.eva, tipo: v.tipo, frecuente: v.frecuente, potente: v.potente, resistencia: v.resistencia});

    function resultadoHtml(){
      if(v.pdg === '' || v.eva === '') return '<div class="cr-res">Poné la <b>PdG</b> del atacante y la <b>Evasión</b> del defensor (las dos tiradas ya hechas) y te digo si hay crítico.</div>';
      const e = ev();
      const u = e.umbrales;
      const lineas = [`Diferencia PdG − Evasión: <b>${e.diferencia}</b> · rango del crítico: <b>${e.rango}</b>${e.rango !== num(v.tipo) ? ` (Tipo ${num(v.tipo)} con frecuente ×${num(v.frecuente)})` : ''}`];
      if(e.diferencia <= 0) return `<div class="cr-res">${lineas[0]}<br>La PdG no supera a la Evasión: <b>no hay golpe</b> (se resuelve a mano) ni crítico.</div>`;
      if(e.nivel === 0) return `<div class="cr-res">${lineas[0]}<br><b>No es crítico</b>: la diferencia no llega al rango. Daño normal (se resta la Defensa).</div>`;
      lineas.push(`Nivel del crítico: <b>${e.nivel}</b>${num(v.resistencia) > 0 ? ` − resistencia ${num(v.resistencia)} = <b>${e.dados}</b>` : ''}`);
      if(!e.critico) return `<div class="cr-res">${lineas.join('<br>')}<br>La Resistencia a crítico del defensor <b>anula el crítico</b>. Daño normal (se resta la Defensa).</div>`;
      lineas.push(`<b>Crítico${e.dados > 1 ? ` ×${e.dados}` : ''}</b>: se tiran <b>${e.dados}d20</b> y vale el mejor. Doble daño con ${u.doble}+, triple con ${u.triple}+, cuádruple con ${u.cuadruple}+. Ignora la armadura.`);
      if(tirada){
        lineas.push(`d20: ${tirada.rolls.join(', ')} → mejor <b>${tirada.mejor}</b> → <b>${NOMBRE_MULT[tirada.mult]}</b> (×${tirada.mult})`);
        if(v.dano !== ''){
          const r = resolverDano({dano: v.dano, critico: true, mult: tirada.mult});
          lineas.push(`Daño: ${num(v.dano)} × ${tirada.mult} = <b>${r.final}</b> (ignora la Defensa)`);
        }
      }
      return `<div class="cr-res si">${lineas.join('<br>')}</div>`;
    }

    function dibujar(soloResultado){
      if(soloResultado){ const r = fondo.querySelector('#cr-resultado'); if(r){ r.innerHTML = resultadoHtml(); botones(); return; } }
      fondo.innerHTML = `<div id="cr-caja" role="dialog" aria-modal="true"><h2>🎯 Calculadora de golpe crítico</h2>
        <p>La PdG contra la Evasión se compara a mano en la mesa. Acá ponés esos dos números y el arma, y te calculo el crítico. Es una <b>ayuda</b>, no una obligación.</p>
        <div class="cr-grid">
          ${campo('pdg', 'PdG del atacante', v.pdg)}${campo('eva', 'Evasión del defensor', v.eva)}
          <div><label for="cr-tipo">Tipo del arma (rango)</label><select id="cr-tipo">${TIPOS.map(t => `<option value="${t}"${num(v.tipo) === t ? ' selected' : ''}>Tipo ${t}</option>`).join('')}</select></div>
          ${campo('resistencia', 'Resistencia a crítico del defensor (a ese Tipo)', v.resistencia, 'min="0"')}
          ${campo('frecuente', 'Crítico frecuente ×', v.frecuente, 'min="0"')}${campo('potente', 'Crítico potente ×', v.potente, 'min="0"')}
          ${campo('dano', 'Daño del golpe (opcional, total con bonos)', v.dano, 'min="0"')}${campo('defensa', 'Defensa del defensor (si no es crítico)', v.defensa, 'min="0"')}
        </div>
        <div id="cr-resultado">${resultadoHtml()}</div>
        <div class="cr-fila"><button type="button" id="cr-cerrar">Cerrar</button><button type="button" id="cr-tirar" class="prim">🎲 Tirar los d20</button><button type="button" id="cr-publicar">📣 Publicar en la Mesa</button></div></div>`;
      botones();
    }
    function botones(){
      const e = v.pdg !== '' && v.eva !== '' ? ev() : null;
      const t = fondo.querySelector('#cr-tirar'), p = fondo.querySelector('#cr-publicar');
      if(t) t.disabled = !(e && e.critico);
      if(p) p.disabled = !e || e.nivel === 0;
    }
    function tirar(){
      const e = ev();
      if(!e.critico) return;
      const rolls = Array.from({length: e.dados}, () => 1 + Math.floor(Math.random() * 20));
      const mejor = Math.max(...rolls);
      tirada = {rolls, mejor, mult: multiplicador(mejor, v.potente), dados: e.dados};
      dibujar(true);
    }
    function publicar(){
      const e = ev();
      if(typeof mesaPublicar !== 'function' || !e || e.nivel === 0) return;
      const t = tirada && tirada.dados === e.dados ? tirada : null;
      const partes = [`PdG ${num(v.pdg)} − Evasión ${num(v.eva)} = ${e.diferencia} (rango ${e.rango})`];
      if(!e.critico) partes.push(e.nivel > 0 ? 'la Resistencia a crítico lo anula' : 'no es crítico');
      else if(t){
        partes.push(`${NOMBRE_MULT[t.mult]} (×${t.mult})`);
        if(v.dano !== '') partes.push(`daño ${num(v.dano)} × ${t.mult} = ${num(v.dano) * t.mult}, ignora la Defensa`);
      }else{ if(typeof toast === 'function') toast('Primero tirá los d20'); return; }
      try{ if(typeof mesaTextoPendiente !== 'undefined') mesaTextoPendiente = partes.join(' · ').slice(0, 300); }catch(err){}
      if(t) mesaPublicar('Golpe crítico', {formula: `${t.rolls.length}d20 (el mejor)`, rolls: t.rolls, mod: 0, total: t.mejor});
      else mesaPublicar('Golpe crítico', {formula: 'sin crítico', rolls: [], mod: 0, total: 0});
    }

    fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(); });
    fondo.addEventListener('input', e => {
      const id = e.target.id && e.target.id.startsWith('cr-') ? e.target.id.slice(3) : '';
      if(!id || !(id in v)) return;
      v[id] = e.target.value === '' && (id === 'pdg' || id === 'eva' || id === 'dano') ? '' : num(e.target.value);
      tirada = null;
      dibujar(true);
    });
    fondo.addEventListener('change', e => { if(e.target.id === 'cr-tipo'){ v.tipo = num(e.target.value); tirada = null; dibujar(true); } });
    fondo.addEventListener('click', e => {
      const b = e.target.closest('button'); if(!b) return;
      if(b.id === 'cr-cerrar') cerrar();
      else if(b.id === 'cr-tirar') tirar();
      else if(b.id === 'cr-publicar') publicar();
    });
    dibujar(false);
  }

  return {abrir, rango, umbrales, multiplicador, evaluar, resolverDano, TIPOS};
})();
