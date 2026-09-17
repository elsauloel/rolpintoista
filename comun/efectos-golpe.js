/* =========================================================
   EFECTOS AL GOLPEAR (compartido)
   Un arma puede traer efectos que se aplican cuando pega (Envenenar, Rompe
   armadura, +1d6 de fuego…). La ficha y gm-tools los muestran al tirar el
   Daño: los que dependen de suerte abren un pop-up para tirar el dado
   (50% = moneda, 25% = d4…) y todo queda en la Mesa en una línea resaltada,
   para que nadie se olvide de aplicarlos. Se aplican a mano sobre el rival:
   la herramienta solo recuerda y tira.

   Cada efecto: {nombre, caras, exitos, dado, detalle}
     caras/exitos  probabilidad = exitos en 1d(caras); éxito = sacar más de
                   caras - exitos. caras 1 (o exitos >= caras) = siempre.
     dado          tirada extra cuando el efecto entra (ej. "1d6"), opcional.
   En los ítems va en `efectosGolpe`; en los creeps, en `armaEfectos`.
   ========================================================= */
const EfectosGolpe = (() => {
  // Probabilidades que se ofrecen al crear el arma, con su dado.
  const PROBABILIDADES = [
    {caras: 1, exitos: 1, texto: 'Siempre'},
    {caras: 4, exitos: 3, texto: '75%'},
    {caras: 2, exitos: 1, texto: '50%'},
    {caras: 3, exitos: 1, texto: '33%'},
    {caras: 4, exitos: 1, texto: '25%'},
    {caras: 5, exitos: 1, texto: '20%'},
    {caras: 10, exitos: 1, texto: '10%'},
  ];

  const n = v => { const x = parseInt(v, 10); return Number.isFinite(x) ? x : 0; };
  const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function normalizar(ef){
    const caras = Math.max(1, n(ef && ef.caras) || 1);
    const exitos = Math.min(caras, Math.max(1, n(ef && ef.exitos) || 1));
    return {
      nombre: String((ef && ef.nombre) || '').trim(),
      caras, exitos,
      dado: String((ef && ef.dado) || '').trim(),
      detalle: String((ef && ef.detalle) || '').trim(),
    };
  }
  const lista = efs => (Array.isArray(efs) ? efs : []).map(normalizar).filter(x => x.nombre);
  const siempre = ef => ef.caras <= 1 || ef.exitos >= ef.caras;
  const pct = ef => Math.round(ef.exitos / ef.caras * 100);
  const probTxt = ef => siempre(ef) ? 'siempre' : `${pct(ef)}%`;
  const minimoExito = ef => ef.caras - ef.exitos + 1;

  // "1d2: 2 = éxito · 1 = falla"
  function reglaTxt(ef){
    if(siempre(ef)) return 'Entra en cada golpe, sin tirar.';
    const m = minimoExito(ef);
    const exito = m === ef.caras ? `${m}` : `${m} a ${ef.caras}`;
    const falla = m - 1 === 1 ? '1' : `1 a ${m - 1}`;
    return `Tirá 1d${ef.caras}${ef.caras === 2 ? ' (moneda)' : ''}: ${exito} = éxito · ${falla} = falla.`;
  }

  // "Envenenar (50%, +1d6)"
  function resumenTxt(ef){
    const extras = [probTxt(ef), ef.dado ? `+${ef.dado}` : ''].filter(Boolean).join(', ');
    return `${ef.nombre} (${extras})`;
  }
  const resumenLista = efs => lista(efs).map(resumenTxt).join(' · ');

  // Excel: "Envenenar 1/2; Rompe armadura; Quemadura 1d6: arde el objetivo"
  function aTexto(efs){
    return lista(efs).map(ef => [ef.nombre, siempre(ef) ? '' : `${ef.exitos}/${ef.caras}`, ef.dado].filter(Boolean).join(' ')
      + (ef.detalle ? `: ${ef.detalle}` : '')).join('; ');
  }

  // Dados simples: "2d6+1", "1d4", "3".
  function tirarFormula(formula){
    const f = String(formula || '').replace(/\s+/g, '').toLowerCase();
    const re = /([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g;
    let m, total = 0, rolls = [], valida = false;
    while((m = re.exec(f))){
      valida = true;
      if(m[3]){
        const signo = m[1] === '-' ? -1 : 1;
        const cant = Math.min(50, n(m[2]) || 1), caras = Math.max(1, n(m[3]));
        for(let i = 0; i < cant; i++){ const r = 1 + Math.floor(Math.random() * caras); rolls.push(r); total += signo * r; }
      }else{
        total += (m[4] === '-' ? -1 : 1) * n(m[5]);
      }
    }
    return valida ? {total, rolls} : null;
  }

  /* ---------- Pop-up ---------- */
  let raiz = null, st = null;

  function montar(){
    if(raiz) return;
    const css = document.createElement('style');
    css.textContent = `
.eg-scrim{position:fixed;inset:0;background:rgba(8,5,7,.7);display:none;align-items:flex-start;justify-content:center;padding:40px 16px;overflow:auto;z-index:120}
.eg-scrim.open{display:flex}
.eg-modal{width:100%;max-width:440px;background:var(--panel,#1A1418);border:2px solid var(--brass,#E0A458);border-radius:var(--r,3px);color:var(--paper,#EDE3D2);box-shadow:0 10px 40px rgba(0,0,0,.6)}
.eg-modal header{position:static;background:none;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid var(--line,#3B2E34)}
.eg-modal header h3{margin:0;font-family:"Fraunces",serif;font-size:17px}
.eg-body{padding:12px 14px;display:flex;flex-direction:column;gap:9px}
.eg-card{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);border-radius:var(--r,3px);padding:9px 11px}
.eg-card-top{display:flex;justify-content:space-between;align-items:center;gap:8px}
.eg-nombre{font-weight:700;font-size:14.5px}
.eg-prob{font-family:"Space Mono",monospace;font-size:11px;color:var(--brass,#E0A458);border:1px solid var(--brass,#E0A458);border-radius:99px;padding:1px 8px}
.eg-regla{font-size:12.5px;margin-top:4px}
.eg-detalle{font-size:11.5px;color:var(--muted,#9A867E);margin-top:3px}
.eg-res{margin-top:7px;padding:6px 9px;border-radius:var(--r,3px);font-weight:700;font-size:13px}
.eg-res.exito{background:rgba(142,230,168,.16);color:#8EE6A8;border:1px solid #8EE6A8}
.eg-res.falla{background:rgba(154,134,126,.14);color:var(--muted,#9A867E);border:1px solid var(--line,#3B2E34)}
.eg-tirar{margin-top:7px}
.eg-modal footer{display:flex;justify-content:flex-end;gap:8px;padding:11px 14px;border-top:1px solid var(--line,#3B2E34)}
`;
    document.head.appendChild(css);
    raiz = document.createElement('div');
    // .scrim: los modos botonera/acciones (dentro del mapa) solo muestran y vigilan esas.
    raiz.className = 'scrim eg-scrim';
    raiz.innerHTML = `<div class="eg-modal" role="dialog"><header><h3 id="eg-titulo"></h3><button type="button" class="iconbtn" data-eg="listo">Cerrar</button></header>
      <div class="eg-body" id="eg-body"></div>
      <footer><button type="button" class="btn" data-eg="todo">🎲 Tirar todo</button><button type="button" class="btn primary" data-eg="listo">Listo</button></footer></div>`;
    document.body.appendChild(raiz);
    raiz.addEventListener('mousedown', ev => { if(ev.target === raiz) terminar(); });
    raiz.addEventListener('keydown', ev => { if(ev.key === 'Escape'){ ev.stopPropagation(); terminar(); } });
    raiz.addEventListener('click', ev => {
      const b = ev.target.closest('button');
      if(!b || !st) return;
      if(b.dataset.eg === 'listo'){ terminar(); return; }
      if(b.dataset.eg === 'todo'){ st.efectos.forEach((ef, i) => { if(!st.res[i] && necesitaTirada(ef)) tirarUno(i); }); dibujar(); return; }
      if(b.dataset.egTirar !== undefined){ tirarUno(n(b.dataset.egTirar)); dibujar(); }
    });
  }

  const necesitaTirada = ef => !siempre(ef) || !!ef.dado;

  function tirarUno(i){
    const ef = st.efectos[i];
    const r = {rolls: []};
    if(siempre(ef)){
      r.exito = true;
    }else{
      r.dado = 1 + Math.floor(Math.random() * ef.caras);
      r.rolls.push(r.dado);
      r.exito = r.dado >= minimoExito(ef);
    }
    if(r.exito && ef.dado){
      r.extra = tirarFormula(ef.dado);
      if(r.extra) r.rolls.push(...r.extra.rolls);
    }
    st.res[i] = r;
    if(st.cfg.alTirar) st.cfg.alTirar(r.rolls);
  }

  function dibujar(){
    const {efectos, res} = st;
    document.getElementById('eg-body').innerHTML = efectos.map((ef, i) => {
      const r = res[i];
      let resultado = '';
      if(r){
        if(siempre(ef)) resultado = `<div class="eg-res exito">Aplicale ${e(ef.nombre)} al objetivo.${r.extra ? ` ${e(ef.dado)} = ${r.extra.total}` : ''}</div>`;
        else if(r.exito) resultado = `<div class="eg-res exito">Salió ${r.dado} → ¡ÉXITO! Aplicale ${e(ef.nombre)} al objetivo.${r.extra ? ` ${e(ef.dado)} = ${r.extra.total}` : ''}</div>`;
        else resultado = `<div class="eg-res falla">Salió ${r.dado} → falló, no se aplica.</div>`;
      }
      const boton = !r && necesitaTirada(ef)
        ? `<button type="button" class="btn eg-tirar" data-eg-tirar="${i}">🎲 Tirar ${siempre(ef) ? e(ef.dado) : `1d${ef.caras}`}</button>` : '';
      return `<div class="eg-card">
        <div class="eg-card-top"><span class="eg-nombre">${e(ef.nombre)}</span><span class="eg-prob">${e(probTxt(ef))}</span></div>
        <div class="eg-regla">${e(reglaTxt(ef))}${ef.dado ? ` Si entra, tirá además ${e(ef.dado)}.` : ''}</div>
        ${ef.detalle ? `<div class="eg-detalle">${e(ef.detalle)}</div>` : ''}
        ${resultado || boton || (siempre(ef) ? `<div class="eg-res exito">Aplicale ${e(ef.nombre)} al objetivo.</div>` : '')}
      </div>`;
    }).join('');
    raiz.querySelector('[data-eg="todo"]').style.display = efectos.some((ef, i) => !res[i] && necesitaTirada(ef)) ? '' : 'none';
  }

  // Una línea por efecto, para la Mesa.
  function lineas(efectos, res){
    return efectos.map((ef, i) => {
      const r = res[i];
      const extra = r && r.extra ? ` · ${ef.dado} = ${r.extra.total}` : '';
      if(siempre(ef)) return `▶ ${ef.nombre}: ¡APLICALO!${extra}${ef.dado && !r ? ` (falta tirar ${ef.dado})` : ''}`;
      if(!r) return `? ${ef.nombre} (${pct(ef)}%): sin tirar — tirá 1d${ef.caras}, ${minimoExito(ef)}+ = éxito`;
      return r.exito
        ? `✔ ${ef.nombre} (${pct(ef)}%): salió ${r.dado} en 1d${ef.caras} → ¡ÉXITO, APLICALO!${extra}`
        : `✘ ${ef.nombre} (${pct(ef)}%): salió ${r.dado} en 1d${ef.caras} → falló`;
    });
  }

  function terminar(){
    if(!st) return;
    const {cfg, efectos, res} = st;
    st = null;
    raiz.classList.remove('open');
    publicar(cfg, efectos, res);
  }

  function publicar(cfg, efectos, res){
    const rolls = res.flatMap(r => (r && r.rolls) || []);
    cfg.publicar({
      origen: `${cfg.arma || 'Arma'} · efectos al golpear`,
      formula: lineas(efectos, res).join('\n'),
      rolls,
    });
  }

  /* Al tirar el daño de un arma:
     cfg = {arma, efectos, publicar({origen, formula, rolls}), alTirar(rolls)?}
     Sin nada que tirar, publica el recordatorio directo; si no, abre el pop-up
     y publica al cerrarlo (con lo que se haya tirado). */
  function alPegar(cfg){
    const efectos = lista(cfg.efectos);
    if(!efectos.length) return false;
    if(!efectos.some(necesitaTirada)){
      publicar(cfg, efectos, efectos.map(() => ({exito: true, rolls: []})));
      return true;
    }
    montar();
    if(st) terminar();
    st = {cfg, efectos, res: efectos.map(() => null)};
    document.getElementById('eg-titulo').textContent = `⚔ ${cfg.arma || 'Arma'} pegó: efectos`;
    dibujar();
    raiz.classList.add('open');
    setTimeout(() => raiz.querySelector('[data-eg-tirar]')?.focus(), 40);
    return true;
  }

  /* ---------- Mesa ----------
     Línea resaltada para desde 'efecto' (jugador) o 'efecto-gm' (creep).
     claseQuien: la clase de color del nombre que usa cada página. */
  let cssMesa = false;
  function mesaHtml(t, claseQuien){
    if(!cssMesa){
      cssMesa = true;
      const css = document.createElement('style');
      css.textContent = `
.mesa-tirada.mesa-efecto{background:rgba(224,164,88,.16);border:2px solid var(--brass,#E0A458);border-left-width:5px}
.mesa-efecto-titulo{font-weight:700;color:var(--brass,#E0A458);text-transform:uppercase;letter-spacing:.03em;font-size:11px}
.mesa-efecto-linea{font-size:12px;font-weight:700;color:var(--paper,#EDE3D2);margin-top:2px}
.mesa-efecto-linea.ok{color:#8EE6A8}
.mesa-efecto-linea.no{color:var(--muted,#9A867E);font-weight:400;text-decoration:line-through}
.mesa-efecto-linea.pend{color:#FF9E7E}
`;
      document.head.appendChild(css);
    }
    const quien = t.quien || t.jugador || '?';
    const usuario = t.quien && t.jugador && t.quien !== t.jugador ? ` <span class="mesa-usuario">(${e(t.jugador)})</span>` : '';
    const filas = String(t.formula || '').split('\n').filter(Boolean).map(l => {
      const cls = l.startsWith('✔') || l.startsWith('▶') ? 'ok' : l.startsWith('✘') ? 'no' : l.startsWith('?') ? 'pend' : '';
      return `<div class="mesa-efecto-linea ${cls}">${e(l)}</div>`;
    }).join('');
    return `<span class="mesa-quien ${claseQuien}">${e(quien)}</span>${usuario} <span class="mesa-efecto-titulo">⚠ ${e(t.origen)}</span>${filas}`;
  }
  const esLineaMesa = t => t && (t.desde === 'efecto' || t.desde === 'efecto-gm');

  // Se arma al cargar, para que los modos botonera/acciones la registren.
  if(document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);

  return {PROBABILIDADES, normalizar, lista, siempre, pct, probTxt, reglaTxt, resumenTxt, resumenLista, aTexto, alPegar, mesaHtml, esLineaMesa};
})();
