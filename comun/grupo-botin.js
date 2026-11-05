/* =========================================================
   GRUPO-BOTIN — 📋 Ver el grupo, desde el botín de «⚔ Batalla terminada» (2026-11-03, pedido del dueño: «en la instancia de elegir como GM qué
   parte del botín queda publicado para PJs, tiene que haber un botón que te arme un reporte de los jugadores donde se vea claramente sus slots
   vacíos, resistencias y debilidades, sus stats. Algo que a simple vista ayude a elegir qué poner y qué no»).
   - GrupoBotin.abrir({jugadores: [{id, nombre}], items: [{nombre, template}]}): lee las fichas (FichaGuardado.cargar), arma una tarjeta por
     personaje (slots vacíos resaltados, stats, resistencias y debilidades con colores relativos al grupo, arma y tipos de daño) y, arriba, una
     pista por cada pieza del botín de a quién le sirve. Abre su propio recuadro (en document.body; ✕, Aceptar, Esc o clic afuera).
   - GrupoBotin.slotsDe(S) y GrupoBotin.pistas(item, grupo): lógica pura (las pruebas en comun/pruebas.html).
   Carga sola lo que le falte (ficha-calculo, ficha-guardado, ficha-combate, escaneo-grupo); el catálogo lo tiene que tener la página.
   La llama CombateFin.clic (data-rep-grupo), en GM Tools y en el mapa.
   ========================================================= */
const GrupoBotin = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const PIEZAS = ['../comun/ficha-calculo.js?v=20261105contra', '../comun/ficha-guardado.js?v=20261029u', '../comun/ficha-combate.js?v=20261015d', '../comun/escaneo-grupo.js?v=20261026d'];
  // Los lugares del cuerpo (los mismos de FichaEquipo.SLOT_DEFS; sin la mochila, el cinturón ni el carcaj, que no son de pelea).
  const SLOTS = [
    {id: 'manos_arma', label: 'Manos', cats: ['arma_1m', 'arma_2m', 'escudo_1m', 'escudo_2m'], max: 2, peso: {arma_1m: 1, arma_2m: 2, escudo_1m: 1, escudo_2m: 2}},
    {id: 'cabeza', label: 'Cabeza', cats: ['cabeza'], max: 1},
    {id: 'torso_blanda', label: 'Armadura blanda', cats: ['armadura_blanda'], max: 1},
    {id: 'torso_rigida', label: 'Armadura rígida', cats: ['armadura_rigida'], max: 1},
    {id: 'manos', label: 'Guantes', cats: ['manos'], max: 1},
    {id: 'piernas', label: 'Piernas', cats: ['piernas'], max: 1},
    {id: 'pies', label: 'Pies', cats: ['pies'], max: 1},
    {id: 'anillos', label: 'Anillos', cats: ['anillos'], max: 2},
  ];
  const TIPOS = [4, 6, 8, 10, 12];
  const ELEM = [['fuego', '🔥'], ['hielo', '❄'], ['rayo', '⚡'], ['toxico', '☠'], ['acido', '🧪'], ['luz', '☀'], ['siniestro', '🌑']];

  // Cada lugar: lo puesto y cuánto queda libre (las manos cuentan peso: un arma de dos manos ocupa las dos).
  function slotsDe(S){
    const eq = (S.inventario || []).filter(i => i && i.equipado);
    return SLOTS.map(sd => {
      const puestos = eq.filter(i => sd.cats.includes(i.tipoItem));
      const usado = puestos.reduce((a, i) => a + (sd.peso ? (sd.peso[i.tipoItem] || 1) : 1), 0);
      return {id: sd.id, label: sd.label, max: sd.max, puestos: puestos.map(i => i.nombre || '¿?'), libre: Math.max(0, sd.max - usado), piezas: puestos};
    });
  }
  // Lo que suma una pieza a lo que importa para comparar de un vistazo.
  const valorDe = it => {
    const m = k => (it && it.mods || []).filter(x => x && x.stat === k).reduce((a, x) => a + num(x.val), 0);
    const def = num(it && it.def) + m('def');
    return {def, armadmg: m('armadmg')};
  };
  /* Pistas: para una pieza del botín, a quién le sirve. grupo = [{nombre, slots}]. → ['🔲 llena Cabeza de Larry', '↑ Defensa +2 para Bizzante'] */
  function pistas(item, grupo){
    const t = (item && item.template) || item || {};
    const sd = SLOTS.find(s => s.cats.includes(t.tipoItem));
    if(!sd) return [];
    const propio = sd.peso ? (sd.peso[t.tipoItem] || 1) : 1;
    const nuevo = valorDe(t), out = [];
    (grupo || []).forEach(p => {
      const s = (p.slots || []).find(x => x.id === sd.id);
      if(!s) return;
      if(s.libre >= propio){ out.push(`🔲 llena ${sd.label === 'Manos' ? (propio > 1 ? 'las dos manos libres' : 'una mano libre') : sd.label} de ${p.nombre}`); return; }
      if(sd.id === 'manos_arma') return;   // las armas no se comparan por defensa
      const peor = s.piezas.map(valorDe).sort((a, b) => (a.def + a.armadmg) - (b.def + b.armadmg))[0] || {def: 0, armadmg: 0};
      const dd = nuevo.def - peor.def, de = nuevo.armadmg - peor.armadmg;
      const partes = [];
      if(dd > 0) partes.push(`Defensa +${fmt(dd)}`);
      if(de > 0) partes.push(`Def. especial +${fmt(de)}`);
      if(partes.length && dd >= 0 && de >= 0) out.push(`↑ ${partes.join(' y ')} para ${p.nombre}`);
    });
    return out;
  }

  // Un personaje: el perfil del escaneo + lo que falta (Res.Mt) + sus lugares.
  function armar(S, id){
    const p = EscaneoGrupo.perfil(S, id);
    const f = FichaCalculo.calcular(S).final;
    p.resm = num(f.resm);
    p.slots = slotsDe(S);
    p.cinturon = (S.cinturon || []).reduce((a, i) => a + (i && i.consumible ? Math.max(1, num(i.unidades)) : 1), 0);
    return p;
  }
  // Rojo lo más bajo del grupo, verde lo más alto (si hay diferencia).
  const tono = (vals, x, invertir) => {
    const mn = Math.min(...vals), mx = Math.max(...vals);
    if(mn === mx) return '';
    if(x === mn) return invertir ? 'gb-alto' : 'gb-bajo';
    if(x === mx) return invertir ? 'gb-bajo' : 'gb-alto';
    return '';
  };
  function debilFuerte(p, ps){
    const deb = [], fue = [];
    TIPOS.forEach((t, i) => { if(p.rescrit[i] <= 0) deb.push(`crítico T${t}`); });
    if(deb.length === TIPOS.length){ deb.length = 0; deb.push('críticos de todo Tipo'); }
    ELEM.forEach(([el, ic]) => { const v = p.elem[el]; if(v < 0) deb.push(`${ic} ${el} (${fmt(v)})`); else if(v >= 2) fue.push(`${ic} ${el} (${fmt(v)})`); });
    const rel = (nombre, sel) => {
      const vals = ps.map(sel);
      if(Math.min(...vals) === Math.max(...vals)) return;
      if(sel(p) === Math.min(...vals)) deb.push(`${nombre} (${fmt(sel(p))}, el más bajo)`);
      else if(sel(p) === Math.max(...vals)) fue.push(`${nombre} (${fmt(sel(p))}, el más alto)`);
    };
    rel('Defensa', x => x.defensas.def); rel('Def. especial', x => x.defensas.armadmg); rel('Evasión', x => x.defensas.eva);
    rel('Res.Esp', x => x.defensas.resmg); rel('Res.Mt', x => x.resm); rel('Res.CC', x => x.defensas.rescc); rel('Vida', x => x.vida.hp);
    if(p.defensas.armadmg <= 0) deb.push('sin Def. especial: la magia le entra entera');
    return {deb, fue};
  }
  function tarjeta(p, ps){
    const c = (sel, x, inv) => `<b class="${tono(ps.map(sel), sel(x), inv)}">${fmt(sel(x))}</b>`;
    const slots = p.slots.map(s => {
      const vacio = s.libre > 0;
      const txt = s.puestos.length ? esc(s.puestos.join(' + ')) : '';
      return `<div class="gb-slot${vacio ? ' gb-vacio' : ''}"><span class="gb-sl">${vacio ? '🔲' : '▪'} ${esc(s.label)}</span><span>${txt}${vacio ? `${txt ? ' · ' : ''}<b>${s.max > 1 && s.libre < s.max ? `${s.libre} libre` : 'vacío'}</b>` : ''}</span></div>`;
    }).join('');
    const {deb, fue} = debilFuerte(p, ps);
    const crit = TIPOS.map((t, i) => `<span class="gb-chip">T${t} ${c(x => x.rescrit[i], p)}</span>`).join('');
    const elem = ELEM.map(([el, ic]) => `<span class="gb-chip">${ic} ${c(x => x.elem[el], p)}</span>`).join('');
    const armas = p.armas.length ? p.armas.map(a => `${esc(a.nombre)} (T${a.tipo}, ${esc(a.dano)})`).join('; ') : 'sin arma con daño';
    const danos = Object.keys(p.danos || {}).map(k => k.startsWith('T') ? `físico T${k.slice(1)}` : k).join(', ');
    return `<div class="gb-card">
      <div class="gb-nom">${esc(p.nombre)} <span class="gb-sub">nivel ${fmt(p.nivel)}${p.clase ? ' · ' + esc(p.clase) : ''}</span></div>
      <div class="gb-sec">Equipo puesto</div>${slots}<div class="gb-slot"><span class="gb-sl">🎒 Cinturón</span><span>${fmt(p.cinturon)} consumible${p.cinturon === 1 ? '' : 's'}</span></div>
      <div class="gb-sec">Stats</div>
      <div class="gb-grid">${[['Con', x => x.attrs.con], ['Fue', x => x.attrs.fue], ['Agi', x => x.attrs.agl], ['Des', x => x.attrs.des], ['Esp', x => x.attrs.esp]].map(([n, s]) => `<span class="gb-chip">${n} ${c(s, p)}</span>`).join('')}</div>
      <div class="gb-grid">${[['Vida', x => x.vida.hp], ['Def', x => x.defensas.def], ['Def.Esp', x => x.defensas.armadmg], ['Eva', x => x.defensas.eva], ['PdG', x => x.ataque.pdg], ['PdG.Esp', x => x.ataque.pdgEsp], ['No2', x => x.vida.no2], ['Rango', x => x.ataque.rng]].map(([n, s]) => `<span class="gb-chip">${n} ${c(s, p)}</span>`).join('')}</div>
      <div class="gb-sec">Resistencias</div>
      <div class="gb-grid">${[['Res.Esp', x => x.defensas.resmg], ['Res.Mt', x => x.resm], ['Res.CC', x => x.defensas.rescc]].map(([n, s]) => `<span class="gb-chip">${n} ${c(s, p)}</span>`).join('')}</div>
      <div class="gb-grid"><span class="gb-mini">A crítico</span>${crit}</div>
      <div class="gb-grid"><span class="gb-mini">Elementos</span>${elem}</div>
      <div class="gb-linea gb-bajo">▼ Débil en: ${deb.length ? esc(deb.join(' · ')) : '—'}</div>
      <div class="gb-linea gb-alto">▲ Fuerte en: ${fue.length ? esc(fue.join(' · ')) : '—'}</div>
      <div class="gb-sec">Ataque</div><div class="gb-linea">🗡 ${armas}${danos ? `<br><span class="gb-mini">Daño: ${esc(danos)}</span>` : ''}</div>
    </div>`;
  }
  const CSS = `#grupo-botin-pop{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;font-family:"Space Grotesk",system-ui,sans-serif}
#grupo-botin-pop .gb-caja{background:#1d1714;color:#efe6da;border:1px solid #6b5443;border-top:3px solid #d9963c;border-radius:10px;width:min(1180px,100%);max-height:calc(100vh - 40px);display:flex;flex-direction:column;box-shadow:0 12px 40px rgba(0,0,0,.6)}
#grupo-botin-pop header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #4a3b30}
#grupo-botin-pop header h3{margin:0;font-size:16px;flex:1}
#grupo-botin-pop .gb-x{background:none;border:1px solid #6b5443;color:#efe6da;border-radius:6px;cursor:pointer;padding:2px 9px;font-size:14px}
#grupo-botin-pop .gb-cuerpo{overflow:auto;padding:12px 16px}
#grupo-botin-pop .gb-pistas{margin:0 0 12px;padding:8px 10px;border-left:3px solid #c9a227;background:rgba(201,162,39,.08);font-size:13px;line-height:1.5}
#grupo-botin-pop .gb-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
#grupo-botin-pop .gb-card{border:1px solid #4a3b30;border-radius:8px;padding:10px 12px;background:#231c18}
#grupo-botin-pop .gb-nom{font-weight:800;font-size:16px;margin-bottom:4px}
#grupo-botin-pop .gb-sub,.gb-mini{font-weight:400;font-size:11.5px;color:#a8988c}
#grupo-botin-pop .gb-sec{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#a8988c;margin:10px 0 4px}
#grupo-botin-pop .gb-slot{display:flex;justify-content:space-between;gap:8px;font-size:13px;padding:2px 0;border-bottom:1px dashed #3a2e27}
#grupo-botin-pop .gb-slot span:last-child{text-align:right}
#grupo-botin-pop .gb-vacio{color:#ffd27a}
#grupo-botin-pop .gb-vacio .gb-sl{font-weight:700}
#grupo-botin-pop .gb-grid{display:flex;flex-wrap:wrap;gap:4px;margin:3px 0;align-items:center}
#grupo-botin-pop .gb-chip{font-size:12px;border:1px solid #4a3b30;border-radius:5px;padding:1px 6px;background:rgba(255,255,255,.04)}
#grupo-botin-pop .gb-linea{font-size:12.5px;margin-top:4px;line-height:1.4}
#grupo-botin-pop .gb-bajo{color:#ff9aa9}
#grupo-botin-pop .gb-alto{color:#8ff0bd}
#grupo-botin-pop footer{padding:10px 16px;border-top:1px solid #4a3b30;text-align:right}
#grupo-botin-pop footer button{background:#d9963c;color:#1d1714;border:none;border-radius:6px;padding:7px 18px;font-weight:700;cursor:pointer;font:inherit}`;

  function cargarScript(src){
    return new Promise((ok, mal) => {
      if([...document.scripts].some(s => s.src && s.src.includes(src.split('?')[0].replace('../', '')))){ ok(); return; }
      const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => mal(new Error('No se pudo cargar ' + src));
      document.head.appendChild(s);
    });
  }
  function ventana(){
    let pop = document.getElementById('grupo-botin-pop');
    if(pop) return pop;
    if(!document.getElementById('grupo-botin-css')){ const st = document.createElement('style'); st.id = 'grupo-botin-css'; st.textContent = CSS; document.head.appendChild(st); }
    pop = document.createElement('div');
    pop.id = 'grupo-botin-pop';
    pop.innerHTML = `<div class="gb-caja" role="dialog" aria-modal="true"><header><h3>📋 El grupo, para elegir el botín</h3><button type="button" class="gb-x" title="Cerrar">✕</button></header>
      <div class="gb-cuerpo"><div class="gb-mini">Leyendo las fichas…</div></div><footer><button type="button" class="gb-ok">Aceptar</button></footer></div>`;
    const cerrar = () => { pop.remove(); document.removeEventListener('keydown', tecla, true); };
    const tecla = ev => { if(ev.key === 'Escape'){ ev.stopPropagation(); ev.preventDefault(); cerrar(); } };
    pop.addEventListener('click', ev => { if(ev.target === pop || ev.target.closest('.gb-x, .gb-ok')) cerrar(); });
    pop.addEventListener('mousedown', ev => ev.stopPropagation());
    document.addEventListener('keydown', tecla, true);
    document.body.appendChild(pop);
    return pop;
  }
  async function abrir(o){
    o = o || {};
    const pop = ventana();
    const cuerpo = pop.querySelector('.gb-cuerpo');
    try{
      for(const src of PIEZAS) await cargarScript(src);
      const jug = (o.jugadores || []).filter(j => j && j.id);
      if(!jug.length){ cuerpo.innerHTML = '<div class="gb-mini">No hay personajes que cobren.</div>'; return; }
      const ps = [];
      for(const j of jug){
        try{
          const r = await FichaGuardado.cargar(fbDb, fbRutaCampana('fichas/' + j.id));
          if(r && r.S) ps.push(armar(r.S, j.id));
        }catch(err){ console.error('📋 No se pudo leer la ficha ' + j.id + ':', err); }
      }
      if(!ps.length){ cuerpo.innerHTML = '<div class="gb-mini">No se pudieron leer las fichas — mirá la consola.</div>'; return; }
      const items = (o.items || []).filter(i => i && i.template && !i.template.consumible);
      // Las piezas iguales, una sola vez (×N); y las pistas agrupadas: «🔲 llena la Cabeza de: A, B» / «↑ Defensa +1 para: C».
      const porNombre = new Map();
      items.forEach(i => { const k = i.nombre; if(porNombre.has(k)) porNombre.get(k).n++; else porNombre.set(k, {i, n: 1}); });
      const pist = [...porNombre.values()].map(({i, n}) => {
        const grupos = new Map();
        pistas(i, ps).forEach(t => { const m = /^(.*?) (?:de|para) ([^·]+)$/.exec(t); const k = m ? m[1] : t; if(!grupos.has(k)) grupos.set(k, []); if(m) grupos.get(k).push(m[2].trim()); });
        const l = [...grupos.entries()].map(([k, quienes]) => quienes.length ? `${k} de: ${quienes.join(', ')}` : k).map(t => t.replace(/^(↑ .*) de: /, '$1 para: '));
        return {i, n, l};
      }).filter(x => x.l.length);
      cuerpo.innerHTML = `${items.length ? `<div class="gb-pistas"><b>A quién le sirve lo del botín</b><br>${pist.length ? pist.map(x => `<b>${esc(x.i.nombre)}${x.n > 1 ? ` ×${x.n}` : ''}</b>: ${esc(x.l.join(' · '))}`).join('<br>') : 'Ninguna pieza llena un lugar vacío ni mejora la Defensa de lo que tienen puesto.'}</div>` : ''}
        <div class="gb-cards">${ps.map(p => tarjeta(p, ps)).join('')}</div>
        <div class="gb-mini" style="margin-top:8px">En rojo, lo más bajo del grupo; en verde, lo más alto. 🔲 = lugar vacío. Los números son los de la ficha ahora (equipo, pasivas y estados).</div>`;
    }catch(err){
      console.error('📋 No se pudo armar el reporte del grupo:', err);
      cuerpo.innerHTML = '<div class="gb-mini">No se pudo armar el reporte — mirá la consola.</div>';
    }
  }
  return {SLOTS, slotsDe, pistas, abrir};
})();
