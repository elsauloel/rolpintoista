/* ficha-lite.js (FichaLite) — la ficha LITE (2026-10-02, pedido del dueño): lo que hace falta a mano en un combate, en una
   ventanita encima del mapa. Arriba, en una franja horizontal, el equipo: qué hay en cada mano, la Defensa y las cinco
   resistencias a crítico (al pasar el mouse, de dónde sale cada número: qué ítem, qué estado, qué pasiva); abajo, el resto del
   equipo puesto, los estados alterados y, en el personaje, DDE y Despojos. Los botones los pone cada pantalla.
   Un solo dibujo para los tres: `personaje(S)`, `creep(sc)` e `invocacion(inv)` arman el mismo modelo
   {titulo, subtitulo, manos[], defensa, crit[], equipo[], estados[], extras[]} y `html(modelo, botones)` lo dibuja (con `CSS`).
   Solo arma HTML: no lee Firebase ni toca pantalla. Necesita ficha-calculo.js y ficha-combate.js (personaje), creep-calculo.js
   (creep), inv-calculo.js (invocación) y ficha-resumen.js (estados derivados del personaje). */
const FichaLite = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const signo = v => (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v));
  const TIPOS = ['T4', 'T6', 'T8', 'T10', 'T12'];
  const TIPOS_LARGO = ['armas Tipo 4 (d4)', 'armas Tipo 6 (d6)', 'armas Tipo 8 (d8)', 'armas Tipo 10 (d10)', 'armas Tipo 12 (d12)'];
  const SLOT_NOMBRE = {armadura: 'Armadura', cabeza: 'Cabeza', manos: 'Manos', piernas: 'Piernas', pies: 'Pies', cinturon: 'Cinturón',
    mochila: 'Mochila', accesorio: 'Accesorio', anillo: 'Anillo', cuello: 'Cuello', escudo: 'Escudo', mano: 'Mano', otro: 'Equipo'};

  // Nombre corto de un stat ("Defensa", "PdG", "Tipo 4"), con lo que haya cargado.
  function etq(stat){
    const F = window.FichaCalculo;
    if(F && F.STAT_LABEL && F.STAT_LABEL[stat]) return F.STAT_LABEL[stat];
    const C = window.CreepCalculo;
    if(C && C.STAT_LOOKUP && C.STAT_LOOKUP[stat]) return C.STAT_LOOKUP[stat].label || stat;
    return stat === 'def' ? 'Defensa' : stat;
  }
  const efectoTxt = e => {   // un efecto al golpear ({nombre, caras, exitos}): "Al golpear: Sangrado (33 %)"
    const caras = num(e.caras), ex = num(e.exitos);
    const prob = caras > 1 && ex > 0 && ex < caras ? ` (${Math.round(ex / caras * 100)} %)` : '';
    return `Al golpear: ${e.nombre || 'efecto'}${prob}`;
  };
  const modsTxt = mods => (mods || []).filter(m => m && m.stat && num(m.val)).map(m => `${etq(m.stat)} ${signo(num(m.val))}`).join(' · ');

  // Las líneas del "de dónde sale": [{txt, val, nota?, tachado?}] y el total. Si no cierra la cuenta (topes, mínimo 0…), una línea "Otros".
  function cerrar(lineas, total){
    const suma = lineas.filter(l => !l.tachado && l.val !== null).reduce((a, l) => a + l.val, 0);
    if(Number.isFinite(total) && Math.abs(suma - total) > 1e-9) lineas.push({txt: total === 0 && suma < 0 ? 'No baja de 0' : 'Otros ajustes', val: total - suma});
    return {valor: total, lineas};
  }

  // Los extras de la franja de abajo (2026-10-04): Sigilo, Defensa especial y las resistencias elementales.
  const ELEM = {resfuego: 'fuego', reshielo: 'hielo', resrayo: 'rayo', restoxico: 'toxico', resacido: 'acido'};
  const ETQ_EXTRA = {sigilo: '🕶 Sigilo', armadmg: '✨ Defensa especial', resfuego: '🔥 Res. fuego', reshielo: '❄ Res. hielo', resrayo: '⚡ Res. eléctrica', restoxico: '☠ Res. tóxico', resacido: '🧪 Res. ácido'};

  /* ---------- Personaje ---------- */
  function lineasFicha(S, c, stat){
    const L = [];
    const base = c.base[stat];
    if(Number.isFinite(base) && base) L.push({txt: 'Base', val: base});
    (c.mods[stat] || []).forEach(m => L.push({txt: m.origen, val: m.val, nota: m.tipo === 'estado alterado' ? 'estado' : m.tipo === 'pasiva' ? 'pasiva' : ''}));
    // Una pieza rota ocupa el lugar pero no da nada: se muestra tachada, para que se entienda por qué no suma.
    (S.inventario || []).filter(i => i.equipado && FichaCalculo.itemRoto(i)).forEach(i => {
      const v = (i.mods || []).filter(m => m.stat === stat).reduce((a, m) => a + num(m.val), 0);
      if(v) L.push({txt: `${i.nombre} (rota: no cuenta)`, val: v, tachado: true});
    });
    return cerrar(L, Number.isNaN(c.final[stat]) ? NaN : c.final[stat]);
  }
  function manoPersonaje(S, i, dmg){
    if(!i) return {nombre: '', detalle: 'vacía', lineas: []};
    const roto = FichaCalculo.itemRoto(i);
    const esArma = /^arma_/.test(i.tipoItem);
    const dos = i.tipoItem === 'arma_2m' || i.tipoItem === 'escudo_2m';
    const def = (i.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0);
    const partes = [];
    if(esArma){ partes.push(FichaCombate.armaDanoTxt(i, dmg)); partes.push(`Tipo ${fmt(num(i.tipoDado) || 8)}`); }
    else if(def) partes.push(`Defensa ${signo(def)}`);
    if(dos) partes.push('a dos manos');
    const lineas = [];
    if(esArma) lineas.push({txt: `Daño ${FichaCombate.armaDanoTxt(i, dmg)}${i.armaDeRango ? ` (${Combatiente.dmgDelArmaTxt(i)})` : ''}`});
    if(num(i.peso)) lineas.push({txt: `Peso ${fmt(num(i.peso))}`});
    const mt = modsTxt(i.mods);
    if(mt) lineas.push({txt: mt});
    (i.efectosGolpe || []).forEach(e => lineas.push({txt: efectoTxt(e)}));
    if(roto) lineas.push({txt: '⚠ Rota: no da ningún efecto hasta repararla'});
    return {nombre: i.nombre || '(sin nombre)', detalle: (roto ? '⚠ rota · ' : '') + partes.join(' · '), lineas, roto};
  }
  function estadosLista(lista){
    return (lista || []).filter(e => e && e.activo !== false).map(e => {
      const st = Math.max(1, num(e.stacks) || 1);
      const datos = [];
      if(st > 1) datos.push('×' + st);
      const escudo = e.escudoMagicoActual ?? e.escudo;
      if(escudo !== undefined && escudo !== null && escudo !== '') datos.push('🛡' + fmt(num(escudo)));
      datos.push(e.permanente || e.derivado ? '∞' : num(e.turnos) ? num(e.turnos) + 't' : '');
      const lineas = [];
      if(e.detalle) lineas.push({txt: e.detalle});
      if(e.armaduraRota) lineas.push({txt: `Defensa −${st} (−1 por cada acumulación)`});
      const mt = modsTxt(e.mods);
      if(mt) lineas.push({txt: mt + (st > 1 ? ` (por cada uno de los ${st})` : '')});
      const hp = num(e.hpturno ?? e.hpTurno);
      if(hp) lineas.push({txt: `${hp > 0 ? 'Cura' : 'Daña'} ${fmt(Math.abs(hp * st))} HP en cada Mantenimiento`});
      lineas.push({txt: e.permanente || e.derivado ? 'No vence' : num(e.turnos) ? `Le quedan ${fmt(num(e.turnos))} turnos` : 'Termina en el próximo Mantenimiento'});
      return {nombre: e.nombre || '(sin nombre)', datos: datos.filter(Boolean).join(' '), pol: e.polaridad === 'buff' ? 'buff' : e.polaridad === 'debuff' ? 'debuff' : '', lineas};
    });
  }
  function personaje(S){
    const c = FichaCalculo.calcular(S);
    const dmg = Number.isNaN(c.final.dmg) ? 0 : c.final.dmg;
    const manos = FichaCombate.asignarManos(S);
    const enMano = n => (S.inventario || []).find(i => manos.get(i.id) === n) || null;
    const m1 = enMano(1), m2 = enMano(2);
    const dosManos = m1 && (m1.tipoItem === 'arma_2m' || m1.tipoItem === 'escudo_2m') && !m2;
    const equipo = (S.inventario || []).filter(i => i.equipado && !manos.has(i.id)).map(i => {
      const roto = FichaCalculo.itemRoto(i);
      const lineas = [];
      const mt = modsTxt(i.mods);
      lineas.push({txt: mt || 'No suma a ningún stat'});
      if(roto) lineas.push({txt: '⚠ Rota: no da ningún efecto hasta repararla'});
      return {slot: SLOT_NOMBRE[FichaCalculo.slotDe(i.tipoItem)] || 'Equipo', nombre: i.nombre || '(sin nombre)', lineas, roto};
    });
    const esp = (S.loot && S.loot.especial || []).reduce((a, l) => a + num(l.cantidad), 0);
    const meta = S.meta || {};
    return {
      titulo: meta.nombre || 'Sin nombre',
      subtitulo: [`Nivel ${fmt(num(meta.nivel) || 1)}`, meta.raza, meta.clase].filter(Boolean).join(' · '),
      manos: [manoPersonaje(S, m1, dmg), dosManos ? {nombre: '', detalle: 'ocupada (arma a dos manos)', lineas: []} : manoPersonaje(S, m2, dmg)],
      defensa: lineasFicha(S, c, 'def'),
      crit: ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'].map(id => lineasFicha(S, c, id)),
      equipo,
      estados: estadosLista(window.FichaResumen ? FichaResumen.estadosTodos(S) : S.efectos),
      extras: [
        {etq: 'DDE', valor: fmt(num(meta.dde)), lineas: [{txt: 'Tu dinero: para comprar en las tiendas; es lo que cobrás al vender.'}]},
        {etq: 'Despojos', valor: `${fmt(num(S.loot && S.loot.normal))} · ${fmt(num(S.loot && S.loot.magico))} · ${fmt(esp)}`,
          lineas: [{txt: 'Normales · mágicos · especiales: los materiales que soltaron los rivales. Las tiendas los compran y sirven para reparar.'}]},
        // Sigilo y las resistencias que no están en 0 (2026-10-04), con de dónde salen.
        ...['sigilo', 'armadmg', ...Object.keys(ELEM)].filter(id => id === 'sigilo' || num(c.final[id]) > 0).map(id => ({etq: ETQ_EXTRA[id], valor: fmt(num(c.final[id])), lineas: lineasFicha(S, c, id).lineas})),
      ],
    };
  }

  /* ---------- Creeps e invocaciones (guardan la Defensa y las resistencias ya sumadas con su equipo) ---------- */
  function lineasGuardadas(o, total, base, deItem, deEstado){
    const L = [];
    let items = 0;
    (o.equipo || []).forEach(it => { const v = deItem(it); if(v){ items += v; L.push({txt: it.nombre || '(sin nombre)', val: v}); } });
    const resto = num(base) - items;
    if(resto) L.unshift({txt: 'Base (cargada a mano)', val: resto});
    (o.estados || []).filter(e => e.activo !== false).forEach(e => { const v = deEstado(e); if(v) L.push({txt: e.nombre || '(sin nombre)', val: v, nota: 'estado'}); });
    return cerrar(L, total);
  }
  const defItem = it => num(it.def);
  const modDe = stat => it => (it.mods || []).filter(m => m.stat === stat).reduce((a, m) => a + num(m.val), 0);
  const defEstado = e => {
    const st = Math.max(1, num(e.stacks) || 1);
    if(e.armaduraRota) return -st;
    return (e.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val) * st, 0);
  };
  function manoGuardada(o, danoTxt){
    if(!o.armaNombre) return {nombre: '', detalle: 'sin arma', lineas: []};
    const lineas = [{txt: `Daño ${danoTxt}${o.armaDeRango ? ` (${Combatiente.dmgDelArmaTxt(o)})` : ''}`}];
    if(num(o.armaPeso)) lineas.push({txt: `Peso ${fmt(num(o.armaPeso))}`});
    const mt = modsTxt(o.armaMods);
    if(mt) lineas.push({txt: mt});
    if(o.armaNatural) lineas.push({txt: 'Arma natural (no sirve para Parry ni Bloqueo)'});
    (o.armaEfectos || []).forEach(e => lineas.push({txt: efectoTxt(e)}));
    return {nombre: o.armaNombre, detalle: `${danoTxt} · Tipo ${fmt(num(o.armaTipo) || 8)}`, lineas};
  }
  function segundaMano(o, slotDe){
    const esc2 = (o.equipo || []).find(it => slotDe(it.tipoItem) === 'escudo');
    if(!esc2) return {nombre: '', detalle: 'vacía', lineas: []};
    const lineas = [{txt: modsTxt(esc2.mods) || 'No suma a ningún stat'}];
    if(num(esc2.def)) lineas.unshift({txt: `Defensa ${signo(num(esc2.def))}`});
    return {nombre: esc2.nombre || 'Escudo', detalle: num(esc2.def) ? `Defensa ${signo(num(esc2.def))}` : 'escudo', lineas};
  }
  function equipoGuardado(o, slotDe){
    return (o.equipo || []).filter(it => slotDe(it.tipoItem) !== 'escudo').map(it => {
      const lineas = [];
      if(num(it.def)) lineas.push({txt: `Defensa ${signo(num(it.def))}`});
      const mt = modsTxt(it.mods);
      if(mt || !lineas.length) lineas.push({txt: mt || 'No suma a ningún stat'});
      return {slot: SLOT_NOMBRE[slotDe(it.tipoItem)] || 'Equipo', nombre: it.nombre || '(sin nombre)', lineas};
    });
  }
  function creep(sc){
    const C = CreepCalculo;
    const dmg = C.statValor(sc, 'dmg');
    return {
      titulo: sc.nombre || 'Creep',
      subtitulo: [`Nivel ${fmt(num(sc.nivel) || 1)}`, sc.jefe ? 'jefe' : '', sc.raza].filter(Boolean).join(' · '),
      manos: [manoGuardada(sc, C.danoTxt(sc, dmg)), segundaMano(sc, C.slotDe)],
      defensa: lineasGuardadas(sc, C.defensaEfectiva(sc), sc.defensa, defItem, defEstado),
      crit: [0, 1, 2, 3, 4].map(i => lineasGuardadas(sc, C.critEfectivo(sc, i), (sc.crit || [])[i], modDe('tipo' + (i + 1)), () => 0)),
      equipo: equipoGuardado(sc, C.slotDe),
      estados: estadosLista(sc.estados),
      extras: [{etq: ETQ_EXTRA.sigilo, valor: fmt(C.statValor(sc, 'sigilo')), lineas: []},
        ...(C.armadmgEfectiva(sc) > 0 ? [{etq: ETQ_EXTRA.armadmg, valor: fmt(C.armadmgEfectiva(sc)), lineas: []}] : []),
        ...Object.keys(ELEM).filter(el => C.resElemental && C.resElemental(sc, ELEM[el]) > 0).map(el => ({etq: ETQ_EXTRA[el], valor: fmt(C.resElemental(sc, ELEM[el])), lineas: []}))],
    };
  }
  function invocacion(inv, duenoNombre){
    const I = InvCalculo;
    const dmg = I.statValor(inv, 'dmg');
    const slotDe = window.FichaCalculo ? FichaCalculo.slotDe : (t => ({escudo_1m: 'escudo', escudo_2m: 'escudo'}[t] || 'otro'));
    return {
      titulo: inv.nombre || 'Invocación',
      subtitulo: ['Invocación', duenoNombre ? `de ${duenoNombre}` : '', inv.activa === false ? 'dormida' : ''].filter(Boolean).join(' · '),
      manos: [manoGuardada(inv, I.danoTxt(inv, dmg)), segundaMano(inv, slotDe)],
      // Armadura rota de una invocación cuenta por acumulación (como en InvCalculo.defensaEfectiva).
      defensa: lineasGuardadas(inv, I.defensaEfectiva(inv), inv.defensa, defItem, defEstado),
      crit: [0, 1, 2, 3, 4].map(i => lineasGuardadas(inv, I.critEfectivo(inv, i), (inv.crit || [])[i], modDe('tipo' + (i + 1)), () => 0)),
      equipo: equipoGuardado(inv, slotDe),
      estados: estadosLista(inv.estados),
      extras: [{etq: ETQ_EXTRA.sigilo, valor: fmt(I.statValor(inv, 'sigilo')), lineas: []},
        ...['armadmg', ...Object.keys(ELEM)].filter(id => num(I.statValor(inv, id)) > 0).map(id => ({etq: ETQ_EXTRA[id], valor: fmt(num(I.statValor(inv, id))), lineas: []}))],
    };
  }

  /* ---------- Dibujo ---------- */
  function tip(titulo, lineas, total){
    const filas = (lineas || []).map(l => l.val === undefined || l.val === null
      ? `<div class="fl-tip-txt">${esc(l.txt)}</div>`
      : `<div class="fl-tip-fila${l.tachado ? ' tachado' : ''}"><span>${esc(l.txt)}${l.nota ? ` <i>(${esc(l.nota)})</i>` : ''}</span><b>${esc(signo(l.val))}</b></div>`).join('');
    const tot = total === undefined ? '' : `<div class="fl-tip-fila total"><span>Total</span><b>${esc(Number.isFinite(total) ? fmt(total) : '?')}</b></div>`;
    return `<div class="fl-tip"><div class="fl-tip-tit">${esc(titulo)}</div>${filas || '<div class="fl-tip-txt">Nada lo cambia.</div>'}${tot}</div>`;
  }
  function html(m, botones){
    const mano = (etqMano, x) => `<div class="fl-celda fl-mano${x.roto ? ' roto' : ''}${x.nombre ? '' : ' vacia'}">
        <div class="fl-etq">${esc(etqMano)}</div>
        <div class="fl-nombre">${esc(x.nombre || '—')}</div>
        <div class="fl-sub">${esc(x.detalle || '')}</div>
        ${x.nombre ? tip(x.nombre, x.lineas) : ''}
      </div>`;
    const numero = (etqN, largo, x, clase) => `<div class="fl-celda fl-num ${clase || ''}">
        <div class="fl-etq">${esc(etqN)}</div>
        <div class="fl-valor">${esc(Number.isFinite(x.valor) ? fmt(x.valor) : '?')}</div>
        ${tip(largo, x.lineas, x.valor)}
      </div>`;
    const franja = mano('Mano 1', m.manos[0]) + mano('Mano 2', m.manos[1])
      + numero('Defensa', 'Defensa: lo que se le resta a cada golpe (un crítico la ignora)', m.defensa, 'fl-def')
      + `<div class="fl-crit"><div class="fl-crit-tit">Resistencia a crítico</div><div class="fl-crit-fila">${
        m.crit.map((x, i) => numero(TIPOS[i], `Resistencia a crítico de ${TIPOS_LARGO[i]}`, x, 'fl-rc')).join('')}</div></div>`;
    const equipo = m.equipo.length
      ? m.equipo.map(e => `<span class="fl-chip${e.roto ? ' roto' : ''}"><i>${esc(e.slot)}</i> ${esc(e.nombre)}${tip(e.nombre, e.lineas)}</span>`).join('')
      : '<span class="fl-gris">Nada más puesto.</span>';
    const estados = m.estados.length
      ? m.estados.map(e => `<span class="fl-chip fl-estado ${e.pol}">${esc(e.nombre)}${e.datos ? ` <i>${esc(e.datos)}</i>` : ''}${tip(e.nombre, e.lineas)}</span>`).join('')
      : '<span class="fl-gris">Ninguno.</span>';
    const extras = (m.extras || []).map(x => `<span class="fl-chip fl-extra"><i>${esc(x.etq)}</i> <b>${esc(x.valor)}</b>${tip(x.etq, x.lineas)}</span>`).join('');
    const bots = (botones || []).map(b => `<button type="button" class="fl-btn" data-fl="${esc(b.id)}" title="${esc(b.tip || '')}">${b.txt}</button>`).join('');
    return `<div class="fl-ventana" role="dialog" aria-label="Ficha lite de ${esc(m.titulo)}">
      <header><div><h3>${esc(m.titulo)}</h3><div class="fl-subtit">${esc(m.subtitulo || '')}</div></div>
        <button type="button" class="fl-cerrar" data-fl="cerrar" title="Cerrar (F o Esc)">✕</button></header>
      <div class="fl-franja">${franja}</div>
      <div class="fl-bloque"><div class="fl-bloque-tit">Equipo puesto</div><div class="fl-chips">${equipo}</div></div>
      <div class="fl-bloque"><div class="fl-bloque-tit">Estados alterados</div><div class="fl-chips">${estados}</div></div>
      ${extras ? `<div class="fl-bloque"><div class="fl-chips">${extras}</div></div>` : ''}
      ${bots ? `<div class="fl-botones">${bots}</div>` : ''}
    </div>`;
  }
  const CSS = `
:host{all:initial}
.fl-ventana{--panel:#1A1418;--panel2:#221A1E;--line:#3B2E34;--copper:#C98545;--brass:#E0A458;--paper:#EDE3D2;--muted:#9A867E;
  --bueno:#A8C256;--malo:#D4574E;font-family:"Space Grotesk",system-ui,sans-serif;font-size:13px;line-height:1.4;color:var(--paper);
  background:var(--panel);border:1px solid var(--copper);border-radius:6px;box-shadow:0 12px 40px rgba(0,0,0,.6);
  width:min(880px,calc(100vw - 32px));padding:12px 14px 14px;box-sizing:border-box}
header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:10px}
h3{margin:0;font-family:Fraunces,Georgia,serif;font-size:19px;color:var(--brass)}
.fl-subtit{color:var(--muted);font-size:12px}
.fl-cerrar{background:none;border:1px solid var(--line);color:var(--muted);border-radius:4px;cursor:pointer;font-size:14px;padding:2px 8px}
.fl-cerrar:hover{color:var(--paper);border-color:var(--copper)}
.fl-franja{display:flex;gap:8px;flex-wrap:wrap;align-items:stretch}
.fl-celda{position:relative;background:var(--panel2);border:1px solid var(--line);border-radius:5px;padding:7px 10px;cursor:help;box-sizing:border-box}
.fl-celda:hover{border-color:var(--copper)}
.fl-mano{flex:1 1 170px;min-width:150px}
.fl-mano.vacia{cursor:default;opacity:.7}
.fl-mano.roto .fl-nombre{color:var(--malo)}
.fl-etq{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)}
.fl-nombre{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.fl-sub{font-size:12px;color:var(--muted);font-family:"Space Mono",monospace}
.fl-num{text-align:center;min-width:58px}
.fl-valor{font-size:22px;font-weight:700;line-height:1.1}
.fl-def{min-width:76px}
.fl-def .fl-valor{color:var(--brass)}
.fl-crit{display:flex;flex-direction:column;gap:3px}
.fl-crit-tit{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);text-align:center}
.fl-crit-fila{display:flex;gap:4px;flex:1}
.fl-rc{min-width:46px;padding:4px 6px}
.fl-rc .fl-valor{font-size:18px}
.fl-bloque{margin-top:10px}
.fl-bloque-tit{font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin-bottom:4px}
.fl-chips{display:flex;flex-wrap:wrap;gap:5px}
.fl-chip{position:relative;display:inline-flex;align-items:center;gap:5px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;
  padding:3px 10px;cursor:help;font-size:12px}
.fl-chip:hover{border-color:var(--copper)}
.fl-chip i{font-style:normal;color:var(--muted);font-size:11px}
.fl-chip.roto{color:var(--malo)}
.fl-estado.buff{border-color:rgba(168,194,86,.55)}
.fl-estado.debuff{border-color:rgba(212,87,78,.6)}
.fl-extra b{font-size:13px}
.fl-gris{color:var(--muted);font-size:12px}
.fl-tip{display:none;position:absolute;z-index:5;top:calc(100% + 6px);left:0;width:260px;background:#0F0C0E;border:1px solid var(--copper);
  border-radius:5px;padding:8px 10px;box-shadow:0 8px 24px rgba(0,0,0,.6);text-align:left;cursor:default;font-size:12px;font-weight:400;
  white-space:normal;color:var(--paper)}
.fl-celda:hover>.fl-tip,.fl-chip:hover>.fl-tip{display:block}
.fl-crit .fl-celda:nth-last-child(-n+3)>.fl-tip{left:auto;right:0}
.fl-chip>.fl-tip{top:auto;bottom:calc(100% + 6px)}
.fl-tip-tit{font-weight:700;color:var(--brass);margin-bottom:4px}
.fl-tip-fila{display:flex;justify-content:space-between;gap:10px;padding:1px 0}
.fl-tip-fila i{color:var(--muted)}
.fl-tip-fila.tachado{text-decoration:line-through;color:var(--muted)}
.fl-tip-fila.total{border-top:1px solid var(--line);margin-top:3px;padding-top:3px;font-weight:700}
.fl-tip-txt{padding:1px 0}
.fl-botones{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--line)}
.fl-btn{background:var(--panel2);border:1px solid var(--line);color:var(--paper);border-radius:4px;padding:8px 12px;cursor:pointer;font:inherit}
.fl-btn:hover{border-color:var(--copper);background:rgba(201,133,69,.14)}
`;
  return {personaje, creep, invocacion, html, CSS, estadosLista};
})();
