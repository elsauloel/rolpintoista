/* =========================================================
   ESCANEO-GRUPO — 🔎 Escanear el grupo (2026-10-09, pedido del dueño: «antes de crear un combate, un escaneo del party: cuánto tienen de
   resistencias a críticos, elementales, si tienen algún stat particularmente alto … para diseñar un equipo de creeps que juegue con esas
   vulnerabilidades, y a la inversa: cuán fuertes son, con qué tipos de arma, cuánta abundancia de tipos de daño»; «escaneo + IA»).
   Los números los saca el programa (el mismo motor de la ficha, exactos); la IA (GM Tools, OpenRouter) va encima solo para proponer creeps
   con esos datos (textoParaIA).
   - perfil(S, id): un personaje → {id, nombre, nivel, clase, attrs, vida, defensas, rescrit [T4…T12], elem {fuego…}, ataque {pdg, pdgEsp,
     dmgEsp, crit, critpot}, armas [{nombre, tipo, dano, efectos}], danos {clave: cuántas fuentes}}.
   - lectura(perfiles): las conclusiones en palabras (debilidades y fortalezas del grupo).
   - html(perfiles): la tabla y la lectura (clases `eg-`; CSS propio).
   - textoParaIA(perfiles, notas): el resumen en texto para pedirle creeps a la IA.
   Necesita ficha-calculo.js, ficha-combate.js y combatiente.js (al llamar).
   ========================================================= */
const EscaneoGrupo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n * 10) / 10;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TIPOS = [4, 6, 8, 10, 12];
  const ELEM = ['fuego', 'hielo', 'rayo', 'toxico', 'acido'];
  const ELEM_TXT = {fuego: '🔥 fuego', hielo: '❄ hielo', rayo: '⚡ eléctrico', toxico: '☠ tóxico', acido: '🧪 ácido'};
  const ATTR = [['con', 'Con'], ['fue', 'Fue'], ['agl', 'Agi'], ['des', 'Des'], ['esp', 'Esp']];
  const DANO_TXT = k => k.startsWith('T') ? `físico Tipo ${k.slice(1)}` : ({arcano: '✨ arcano', fisico: 'físico (habilidad)', ...ELEM_TXT})[k] || k;

  function perfil(S, id){
    const f = FichaCalculo.calcular(S).final;
    const v = k => num(f[k]);
    const danos = {};
    const suma = k => { if(k) danos[k] = (danos[k] || 0) + 1; };
    const armas = FichaCombate.armasEquipadasConDano(S).map(({item}) => {
      const tipo = num(item.tipoDado) || 8;
      suma('T' + tipo);
      const efectos = (item.efectosGolpe || []).map(e => e && e.nombre).filter(Boolean);
      (item.efectosGolpe || []).forEach(e => { const el = e && e.danoMagico && typeof Combatiente !== 'undefined' && Combatiente.elementoDe ? Combatiente.elementoDe(e.nombre || '') : ''; if(el) suma(el); });
      return {nombre: item.nombre, tipo, dano: FichaCombate.armaDanoTxt(item), efectos};
    });
    // Armas especiales (varitas, báculos) y habilidades con daño: su tipo de daño.
    (S.inventario || []).filter(i => i.equipado && i.especial && i.especial.duelo && i.especial.duelo.dano).forEach(i => suma(i.especial.duelo.tipoDano || 'arcano'));
    const habs = (S.habilidades || []).filter(h => h && h.duelo && h.duelo.dano);
    habs.forEach(h => suma(h.duelo.tipoDano || 'arcano'));
    return {
      id, nombre: (S.meta && S.meta.nombre) || 'Sin nombre', nivel: num(S.meta && S.meta.nivel) || 1, clase: (S.meta && S.meta.clase) || '',
      attrs: Object.fromEntries(ATTR.map(([k]) => [k, v(k)])),
      vida: {hp: v('hpmax'), no2: v('nitros'), ini: v('ini')},
      defensas: {def: v('def'), armadmg: v('armadmg'), eva: v('eva'), parry: v('parry'), bloqueo: v('bloqueo'), resmg: v('resmg'), rescc: v('rescc')},
      rescrit: TIPOS.map((t, i) => v('tipo' + (i + 1))),
      elem: Object.fromEntries(ELEM.map(el => [el, v('res' + el)])),
      ataque: {pdg: v('pdg'), pdgEsp: v('pdgmg'), dmg: v('dmg'), dmgEsp: v('dmgesp'), crit: v('crit'), critpot: v('critpot'), rng: v('rng')},
      armas, danos, habsConDano: habs.length,
    };
  }

  const prom = l => l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0;
  function lectura(ps){
    if(!ps.length) return {debiles: [], fuertes: []};
    const debiles = [], fuertes = [];
    // Resistencia a crítico por Tipo: la más baja del grupo.
    const crit = TIPOS.map((t, i) => ({t, min: Math.min(...ps.map(p => p.rescrit[i])), prom: prom(ps.map(p => p.rescrit[i]))}));
    const sinRes = crit.filter(c => c.min <= 0).map(c => 'Tipo ' + c.t);
    if(sinRes.length === TIPOS.length) debiles.push('Alguien no tiene ninguna resistencia a crítico: cualquier arma le puede critear de lleno.');
    else if(sinRes.length) debiles.push(`Alguien no resiste críticos de ${sinRes.join(', ')}.`);
    const peor = crit.slice().sort((a, b) => a.prom - b.prom)[0];
    debiles.push(`Donde menos resisten críticos, en promedio: armas Tipo ${peor.t} (${fmt(peor.prom)}).`);
    // Elementales.
    const nadie = [], vulnerables = [];
    ELEM.forEach(el => {
      const vals = ps.map(p => p.elem[el]);
      if(vals.every(x => x <= 0)) nadie.push(ELEM_TXT[el]);
      if(vals.some(x => x < 0)) vulnerables.push(`${ELEM_TXT[el]} (${ps.filter(p => p.elem[el] < 0).map(p => p.nombre).join(', ')})`);
      else if(vals.every(x => x >= 2)) fuertes.push(`Todos resisten el ${ELEM_TXT[el]} (mínimo ${fmt(Math.min(...vals))}).`);
    });
    if(nadie.length) debiles.push(`Nadie resiste el daño ${nadie.join(', ')}.`);
    if(vulnerables.length) debiles.push(`Vulnerables (resistencia negativa): ${vulnerables.join(', ')}.`);
    // Defensas.
    const def = ps.map(p => p.defensas.def), am = ps.map(p => p.defensas.armadmg);
    if(Math.max(...am) <= 0) debiles.push('Nadie tiene Armadura mágica: el daño mágico les entra entero.');
    if(prom(def) >= 6) fuertes.push(`Defensa alta (promedio ${fmt(prom(def))}): los golpes físicos chicos rinden poco; conviene daño mágico, crítico o directo.`);
    const resmg = ps.map(p => p.defensas.resmg), rescc = ps.map(p => p.defensas.rescc);
    const flojo = (lista, nombre) => { const p = ps[lista.indexOf(Math.min(...lista))]; return `${p.nombre} es el de menos ${nombre} (${fmt(Math.min(...lista))}).`; };
    debiles.push(flojo(resmg, 'Res.Esp (debuffs y magia)'));
    debiles.push(flojo(rescc, 'Res.CC (control)'));
    debiles.push(flojo(ps.map(p => p.defensas.eva), 'Evasión'));
    // Stats altos de cada uno.
    ps.forEach(p => {
      const [k, val] = Object.entries(p.attrs).sort((a, b) => b[1] - a[1])[0];
      fuertes.push(`${p.nombre}: lo más alto es ${(ATTR.find(a => a[0] === k) || [k, k])[1]} ${fmt(val)}.`);
    });
    // Daño que hacen.
    const danos = {};
    ps.forEach(p => Object.entries(p.danos).forEach(([k, n]) => { danos[k] = (danos[k] || 0) + n; }));
    const orden = Object.entries(danos).sort((a, b) => b[1] - a[1]);
    if(orden.length) fuertes.push(`Su daño viene sobre todo de: ${orden.map(([k, n]) => `${DANO_TXT(k)} ×${n}`).join(', ')}.`);
    const fisTipos = TIPOS.filter(t => danos['T' + t]);
    if(fisTipos.length) debiles.push(`Armas físicas solo de Tipo ${fisTipos.join(', ')}: una buena resistencia a crítico de ${fisTipos.length === 1 ? 'ese Tipo' : 'esos Tipos'} los frena.`);
    const sinElem = ELEM.filter(el => !danos[el]);
    if(sinElem.length < ELEM.length && sinElem.length) debiles.push(`No hacen daño ${sinElem.map(el => ELEM_TXT[el]).join(', ')}.`);
    if(!ELEM.some(el => danos[el]) && !danos.arcano) debiles.push('No tienen daño mágico ni elemental: un creep con mucha Defensa los complica.');
    return {debiles, fuertes, danos: orden};
  }

  const CSS = `.eg-tabla{border-collapse:collapse;width:100%;font-size:12px;margin:6px 0 12px}
.eg-tabla th,.eg-tabla td{border:1px solid var(--line,#3A3036);padding:4px 6px;text-align:center;white-space:nowrap}
.eg-tabla th{background:rgba(255,255,255,.05);font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.04em;text-transform:uppercase}
.eg-tabla td.eg-n{text-align:left;font-weight:700}
.eg-bajo{color:#ff9aa9;font-weight:700}.eg-alto{color:#8ff0bd;font-weight:700}
.eg-sec{font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#9A867E);margin:12px 0 4px}
.eg-lista{margin:0 0 6px 18px;padding:0;font-size:13px;line-height:1.45}
.eg-wrap{overflow-x:auto}`;
  // Marca lo más bajo y lo más alto de cada columna (si hay diferencia).
  function celdas(ps, valor, invertir){
    const vals = ps.map(valor), min = Math.min(...vals), max = Math.max(...vals);
    return vals.map(x => `<td class="${min !== max && x === min ? (invertir ? 'eg-alto' : 'eg-bajo') : min !== max && x === max ? (invertir ? 'eg-bajo' : 'eg-alto') : ''}">${fmt(x)}</td>`);
  }
  function tabla(ps, titulo, cols){
    const filas = ps.map((p, i) => `<tr><td class="eg-n">${esc(p.nombre)}</td>${cols.map(c => c.celdas[i]).join('')}</tr>`).join('');
    return `<div class="eg-sec">${titulo}</div><div class="eg-wrap"><table class="eg-tabla"><tr><th></th>${cols.map(c => `<th title="${esc(c.titulo || '')}">${esc(c.th)}</th>`).join('')}</tr>${filas}</table></div>`;
  }
  const col = (ps, th, valor, titulo, invertir) => ({th, titulo, celdas: celdas(ps, valor, invertir)});
  function html(ps){
    if(!ps.length) return '<div class="hint">No hay personajes para escanear.</div>';
    const l = lectura(ps);
    return `<style>${CSS}</style>
    <div class="eg-sec">Lectura rápida · puntos débiles</div><ul class="eg-lista">${l.debiles.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    <div class="eg-sec">Lectura rápida · fortalezas</div><ul class="eg-lista">${l.fuertes.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    ${tabla(ps, 'Resistencia a crítico (por Tipo de arma)', TIPOS.map((t, i) => col(ps, 'T' + t, p => p.rescrit[i])))}
    ${tabla(ps, 'Resistencias elementales (negativo = vulnerable)', ELEM.map(el => col(ps, ELEM_TXT[el], p => p.elem[el])))}
    ${tabla(ps, 'Defensas', [col(ps, 'Def', p => p.defensas.def, 'Defensa'), col(ps, 'Arm.Mág', p => p.defensas.armadmg, 'Armadura mágica'), col(ps, 'Eva', p => p.defensas.eva, 'Evasión'),
      col(ps, 'Parry', p => p.defensas.parry), col(ps, 'Bloq', p => p.defensas.bloqueo, 'Bloqueo'), col(ps, 'Res.Esp', p => p.defensas.resmg), col(ps, 'Res.CC', p => p.defensas.rescc),
      col(ps, 'HP', p => p.vida.hp), col(ps, 'No2', p => p.vida.no2)])}
    ${tabla(ps, 'Atributos', ATTR.map(([k, n]) => col(ps, n, p => p.attrs[k])))}
    ${tabla(ps, 'Ataque', [col(ps, 'PdG', p => p.ataque.pdg), col(ps, 'PdG.Esp', p => p.ataque.pdgEsp), col(ps, 'Dmg', p => p.ataque.dmg), col(ps, 'Ef.Esp', p => p.ataque.dmgEsp, 'Efecto especial'),
      col(ps, 'Crít.F', p => p.ataque.crit, 'Crítico frecuente'), col(ps, 'Crít.P', p => p.ataque.critpot, 'Crítico potente'), col(ps, 'Rango', p => p.ataque.rng)])}
    <div class="eg-sec">Armas y tipos de daño</div>
    <ul class="eg-lista">${ps.map(p => `<li><b>${esc(p.nombre)}</b>: ${p.armas.length ? p.armas.map(a => `${esc(a.nombre)} (Tipo ${a.tipo}, ${esc(a.dano)}${a.efectos.length ? ' · ' + esc(a.efectos.join(', ')) : ''})`).join('; ') : 'sin arma'}${Object.keys(p.danos).length ? ` — daño: ${esc(Object.entries(p.danos).map(([k, n]) => `${DANO_TXT(k)} ×${n}`).join(', '))}` : ''}</li>`).join('')}</ul>`;
  }

  function textoParaIA(ps, notas){
    const l = lectura(ps);
    const fila = p => `- ${p.nombre} (nivel ${p.nivel}${p.clase ? ', ' + p.clase : ''}): atributos ${ATTR.map(([k, n]) => `${n} ${fmt(p.attrs[k])}`).join(', ')}; HP ${fmt(p.vida.hp)}; `
      + `Defensa ${fmt(p.defensas.def)}, Armadura mágica ${fmt(p.defensas.armadmg)}, Evasión ${fmt(p.defensas.eva)}, Res.Esp ${fmt(p.defensas.resmg)}, Res.CC ${fmt(p.defensas.rescc)}; `
      + `resistencia a crítico T4/T6/T8/T10/T12 = ${p.rescrit.map(fmt).join('/')}; resistencias elementales ${ELEM.map(el => `${el} ${fmt(p.elem[el])}`).join(', ')}; `
      + `ataque PdG ${fmt(p.ataque.pdg)}, PdG.Esp ${fmt(p.ataque.pdgEsp)}, Crít. frecuente ${fmt(p.ataque.crit)}, potente ${fmt(p.ataque.critpot)}; `
      + `armas: ${p.armas.length ? p.armas.map(a => `${a.nombre} Tipo ${a.tipo} ${a.dano}${a.efectos.length ? ' (' + a.efectos.join(', ') + ')' : ''}`).join('; ') : 'ninguna'}; `
      + `tipos de daño: ${Object.entries(p.danos).map(([k, n]) => `${DANO_TXT(k)} ×${n}`).join(', ') || 'solo físico'}.`;
    return `Grupo de jugadores:\n${ps.map(fila).join('\n')}\n\nPuntos débiles detectados:\n${l.debiles.map(t => '- ' + t).join('\n')}\n\nFortalezas:\n${l.fuertes.map(t => '- ' + t).join('\n')}`
      + (notas ? `\n\nPedido del GM: ${notas}` : '');
  }
  const IA_SISTEMA = `Sos un asistente de diseño de encuentros para un juego de rol táctico por turnos en mapa de hexágonos (el Rol Pintoísta). Te paso el escaneo del grupo de jugadores. Proponé un equipo de 3 a 5 creeps (enemigos) que haga un combate interesante y desafiante pero ganable: que aproveche sus puntos débiles y que también tenga respuesta a sus fortalezas. Reglas del juego que importan: las armas tienen Tipo 4, 6, 8, 10 o 12 (más Tipo = más rango de crítico); la resistencia a crítico de un Tipo anula niveles de crítico de armas de ese Tipo; la Defensa resta al daño físico; la Armadura mágica resta al daño mágico; las resistencias elementales (fuego, hielo, eléctrico, tóxico, ácido) restan a ese daño y en negativo suman (vulnerable); Res.Esp resiste debuffs y magia; Res.CC resiste control (aturdir, inmovilizar). Para cada creep: nombre y concepto en una línea, nivel, rol (bruto, tanque, asalto, tirador, mago, debuffer, support), qué atributos altos, arma (Tipo y daño) o tipo de daño mágico/elemental, resistencias que conviene darle, 1 o 2 habilidades y por qué está ahí (a qué debilidad o fortaleza del grupo responde). Cerrá con 2 o 3 líneas de táctica para el GM. Respondé en español rioplatense, claro y sin tecnicismos de programación, en texto (sin JSON).`;

  return {TIPOS, ELEM, perfil, lectura, html, textoParaIA, IA_SISTEMA, CSS};
})();
