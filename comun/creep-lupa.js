/* =========================================================
   CREEP-LUPA — la 🔍 y el "Ver" de una habilidad de un creep, fuera de GM Tools (paso 4, etapa 4c, tanda 6 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Copiado tal cual de gm-toolset (lupaStatCreep, lupaHtmlCreep y lo que arma abrirVerHabAccion en js/03; paraHabHtml en js/05).
   Solo arma el HTML: el cuadro de la 🔍 lo abre comun/lupa.js (cada pantalla define lupaContenido) y la ventana de Ver, cada
   pantalla. Así la ven igual GM Tools y el mapa.
   contenido(sc, clave) → {titulo, html}: clave = "creepId|tipo|ref" (la de los data-lupa de comun/creep-botonera.js).
   verHab(sc, h) → {titulo, html}: la tarjeta de Ver de una habilidad del creep. paraHtml(h): para quién es (🐾 / 🧙).
   stat(sc, statId, o): el desglose de un stat.
   Necesita comun/creep-calculo.js y lupa.js (lupaFila, lupaSeccion, lupaNota, lupaSigno, lupaTirada).
   ========================================================= */
const CreepLupa = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const K = CreepCalculo;
  const PARA_TXT = {creep: '🐾 Creep · cooldown', jugador: '🧙 Jugador · SP'};

  function stat(sc, statId, {sinTirada = false} = {}){
    const d = K.STAT_LOOKUP[statId];
    const attr = d.attr;
    let h = lupaFila(`${K.ATTR_NOMBRE[attr]} base`, fmt(num(sc[attr])));
    K.aportesMod(sc, attr).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${a.tipo} · ${K.ATTR_NOMBRE[attr]})</span>`, lupaSigno(a.val)); });
    if(statId !== attr) K.aportesMod(sc, statId).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${a.tipo} · ${esc(d.label)})</span>`, lupaSigno(a.val)); });
    if(!K.aportesMod(sc, attr).length && (statId === attr || !K.aportesMod(sc, statId).length)) h += lupaFila('<span class="lupa-gris">Sin modificadores</span>', '–');
    if((statId === 'pdg' || statId === 'eva') && K.estadoActivo(sc, 'mitadPdgEva')) h += lupaFila('Pajaritos <span class="lupa-gris">(al resultado de la tirada: ÷ 2, para abajo, mínimo 1)</span>', '÷ 2');
    if((statId === 'pdg' || statId === 'parry') && K.estadoActivo(sc, 'lisiado')) h += lupaFila('Lisiado <span class="lupa-gris">(al resultado de la tirada: ÷ 2, para abajo, mínimo 1)</span>', '÷ 2');
    if(statId === 'resmg' && sc.jefe) h += lupaFila('Protección de jefe', '+1');
    const valor = K.statValor(sc, statId);
    h += lupaFila(esc(d.label), fmt(valor), 'lupa-total');
    let out = lupaSeccion('De dónde sale', h);
    if(sinTirada) return out;
    out += lupaTirada(valor);
    const afortunado = ['pdg', 'parry', 'eva'].includes(statId) && (sc.estados || []).find(e => e.activo !== false && e.afortunado);
    if(afortunado) out += lupaNota(`Ventaja por ${esc(afortunado.nombre)}: se tira dos veces y queda la mejor.`);
    return out;
  }

  function contenido(sc, clave){
    const [, tipo, ref] = clave.split('|');
    if(!sc) return {titulo: '', html: ''};
    const sinCosto = lupaSeccion('Costo', lupaFila('Esta tirada', 'sin costo'));
    if(tipo === 'stat') return {titulo: `${sc.nombre} · ${K.STAT_LOOKUP[ref].label}`, html: stat(sc, ref) + sinCosto};
    if(tipo === 'defensa'){
      // Defensa, Defensa especial y resistencia a crítico: de dónde sale cada número (equipo, base a mano, armadura rota).
      const esDef = ref === 'def', esArmadmg = ref === 'armadmg';
      const i = (esDef || esArmadmg) ? 0 : num(String(ref).replace('tipo', '')) - 1;
      const texto = esDef ? K.defensaOrigenTxt(sc) : esArmadmg ? K.armadmgOrigenTxt(sc) : K.critOrigenTxt(sc, i);
      const titulo = esDef ? 'Defensa' : esArmadmg ? 'Defensa especial' : 'Res. a crítico Tipo ' + (4 + 2 * i);
      const nota = esArmadmg ? 'No se tira: se resta al daño de casteo que ignora la Defensa (Paso 3 del casteo).' : 'No se tira: se resta al daño (Defensa) o baja la chance de un crítico.';
      return {titulo: `${sc.nombre} · ${titulo}`, html: lupaSeccion('De dónde sale', texto.split('\n').map(l => lupaNota(esc(l))).join('')) + lupaNota(nota)};
    }
    if(tipo === 'atacar'){
      const tipoArma = num(sc.armaTipo) || 8;
      const hechos = num(sc.ataquesTurno);
      const costo = K.costoAtaque(sc);
      let h = lupaFila(`Tipo del arma${sc.armaNombre ? ` (${esc(sc.armaNombre)})` : ''}: d${fmt(tipoArma)}`, fmt(tipoArma));
      h += lupaFila('Ataques este turno', fmt(hechos));
      h += hechos === 0
        ? lupaFila(`Primer ataque: Tipo ÷ 2${tipoArma % 2 ? ', para arriba' : ''}`, `${fmt(costo)} No2`, 'lupa-total')
        : lupaFila('Ya atacó: Tipo completo', `${fmt(costo)} No2`, 'lupa-total');
      h += lupaFila('No2 disponibles', fmt(num(sc.nitros)), costo > num(sc.nitros) ? 'lupa-falta' : '');
      h += lupaNota('El primer ataque del turno cuesta la mitad. Se reinicia en el Mantenimiento.');
      return {titulo: `${sc.nombre} · Atacar`, html: stat(sc, 'pdg') + lupaSeccion('Costo', h)};
    }
    if(tipo === 'danio'){
      const dmg = K.statValor(sc, 'dmg');
      let h = lupaFila('Peso del arma (cantidad de dados)', fmt(Math.max(1, num(sc.armaPeso) || 1)));
      if(num(sc.armaAmplificado) > 0) h += lupaFila('Daño amplificado (dados extra)', lupaSigno(num(sc.armaAmplificado)));
      h += lupaFila('Tipo (caras del dado)', `d${fmt(num(sc.armaTipo) || 8)}`);
      if(num(sc.armaFijo)) h += lupaFila('Daño fijo del arma', lupaSigno(num(sc.armaFijo)));
      h += !sc.armaDeRango ? lupaFila('Dmg (de Fuerza)', lupaSigno(dmg))   // un arco suma la mitad (Combatiente.dmgDelArma); otra de rango, nada
        : Combatiente.esArco(sc) ? lupaFila('Dmg <span class="lupa-gris">(arco: la mitad, para arriba)</span>', lupaSigno(Combatiente.dmgDelArma(sc, dmg)))
        : lupaFila('Dmg <span class="lupa-gris">(arma de rango: no suma)</span>', '–', 'lupa-tachado');
      h += lupaFila('Daño', esc(K.danoTxt(sc, dmg)), 'lupa-total');
      let out = lupaSeccion('De dónde sale', h);
      if(!sc.armaDeRango || Combatiente.esArco(sc)) out += stat(sc, 'dmg', {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
      return {titulo: `${sc.nombre} · Daño${sc.armaNombre ? ` (${sc.armaNombre})` : ''}`, html: out + sinCosto};
    }
    if(tipo === 'hab'){
      const h0 = (sc.habilidades || []).find(x => x.id === ref);
      if(!h0) return {titulo: '', html: ''};
      const n = K.costoNitrosHab(sc, h0);
      const porDefecto = h0.nitrosCosto === undefined || h0.nitrosCosto === null || h0.nitrosCosto === '';
      let h = lupaFila(K.habAtaque(h0) ? `No2 · como un ataque <span class="lupa-gris">(${num(sc.ataquesTurno) ? "Tipo completo" : "primer ataque, Tipo ÷ 2"})</span>` : porDefecto ? `No2 (por defecto, ${fmt(K.IT2_CREEP.nitrosHabilidad)})` : "No2 de la habilidad", `${fmt(n)} No2`, "lupa-total");
      if(num(h0.cd) > 0) h += lupaFila('Cooldown', `${fmt(num(h0.cd))} turno(s)${num(h0.cdActual) > 0 ? ` · faltan ${fmt(num(h0.cdActual))}` : ''}`);
      h += lupaFila('No2 disponibles', fmt(num(sc.nitros)), n > num(sc.nitros) ? 'lupa-falta' : '');
      let out = lupaSeccion('Costo', h);
      if(h0.tiradaStat && K.STAT_LOOKUP[h0.tiradaStat]) out += lupaSeccion("Tirada del stat", lupaFila(esc(K.STAT_LOOKUP[h0.tiradaStat].label), fmt(K.statValor(sc, h0.tiradaStat))));
      if((h0.tiradaExtra || '').trim()) out += lupaSeccion('Tirada', lupaFila('Fórmula de la habilidad', esc(h0.tiradaExtra)));
      return {titulo: `${sc.nombre} · ${h0.nombre || 'Habilidad'}`, html: out};
    }
    return {titulo: '', html: ''};
  }

  function paraHtml(h){
    if(h.para !== 'jugador') return `<div class="hint" style="margin-bottom:6px"><b>${PARA_TXT.creep}</b></div>`;
    return `<div class="hint" style="margin-bottom:6px;color:#e0a040"><b>${PARA_TXT.jugador}</b> — es una habilidad de jugador: paga con SP, que un creep no tiene. Revisale el costo y, si hace falta, ponele cooldown.</div>`;
  }

  function verHab(sc, h){
    const costo = K.costoNitrosHab(sc, h);
    const costoTxt = K.costoHabTxt(sc, h);
    const cdTxt = num(h.cd) > 0 ? `${fmt(num(h.cd))} turno(s) de cooldown` : 'Sin cooldown';
    return {titulo: h.nombre || 'Sin nombre', html: `
    ${paraHtml(h)}
    <div class="hint" style="margin-bottom:10px">${esc(costoTxt)} · ${esc(cdTxt)}</div>
    <div>${h.detalle ? (typeof Glosario !== 'undefined' ? Glosario.marcar(h.detalle) : esc(h.detalle)) : 'Sin detalle cargado — tocá ✎ en la habilidad para escribir uno.'}</div>`};
  }

  /* ---------- El «Ver» de un creep entero (2026-10-02, hoja de ruta A6a) ----------
     Copiado tal cual de gm-toolset/js/05 (verCreepDatos) y js/01-02 (derivadosHtml, recompensasVerHtml): lo usan GM Tools (su
     ventana «Ver») y el mapa (🔍 Ver todo de la ficha lite, adentro del recuadro de las Acciones). Solo arma el HTML, con las
     clases de gm-tools.css. verCreep(sc, {habilidades}) → {titulo, html}: `habilidades` reemplaza la lista de chips (GM Tools
     la arma con sus botones cuando muestra un creep de la biblioteca). */
  const ATTR_IDS = ['con','fue','agl','des','esp'];
  const ATTR_LABELS = {con:'Con', fue:'Fue', agl:'Agi', des:'Des', esp:'Esp'};
  function derivadosHtml(sc, attr){
    return `<div class="derivados">${K.DERIVADOS_POR_ATTR[attr].map(([id, label]) => `
    <div class="derivado con-tip" data-deriv="${id}" data-tip="${esc(K.statOrigenTxt(sc, id, label))}">
      <span>${label}</span><b>${fmt(K.statValor(sc, id))}</b>
    </div>`).join('')}</div>`;
  }
  function recompensasVerHtml(sc){
    const t = K.tipoDe(sc);
    return `<div class="vc-cajas vc-2">
      <div class="vc-caja"><span class="vc-caja-label">Oro</span><span class="vc-caja-valor">${fmt(num(sc.oroBase))} DDE</span></div>
      <div class="vc-caja"><span class="vc-caja-label">Tipo</span><span class="vc-caja-valor">${esc(t || '—')}${sc.jefe ? ' · jefe' : ''}</span></div>
    </div>
    <div class="hint" style="margin-top:6px"><b>Al morir suelta:</b> ${esc(K.dropsResumen(sc))}</div>`;
  }
  function verCreep(sc, {habilidades: habsHtml} = {}){
    // Recuadro con título chico y valor destacado; tip = texto al pasar el mouse.
    const caja = (label, valor, tip) => `<div class="vc-caja${tip ? ' con-tip' : ''}"${tip ? ` data-tip="${esc(tip)}"` : ''}>
      <span class="vc-caja-label">${esc(label)}</span><span class="vc-caja-valor">${esc(valor)}</span></div>`;
    const seccion = (titulo, contenido) => `<div class="vc-seccion"><div class="sect-label">${esc(titulo)}</div>${contenido}</div>`;

    const critLabels = ['Tipo 4','Tipo 6','Tipo 8','Tipo 10','Tipo 12'];
    const crits = sc.crit.map((v, i) => num(v) ? caja(`Res. ${critLabels[i]}`, K.conSigno(K.critEfectivo(sc, i)), K.critOrigenTxt(sc, i)) : '').join('');

    const habilidades = sc.habilidades.map(h => {
      const partes = [];
      partes.push(K.costoHabTxt(sc, h));
      if(num(h.cd) > 0) partes.push(`CD ${fmt(num(h.cd))}`);
      const tip = `${partes.join(' · ')}\n${h.detalle || 'Sin descripción.'}`;
      return `<span class="vc-chip con-tip" data-tip="${esc(tip)}">${esc(h.nombre || '(sin nombre)')}</span>`;
    }).join('');

    const estados = sc.estados.map(es => {
      const dura = es.permanente ? 'permanente' : `${fmt(num(es.turnos))}t`;
      return `<span class="vc-chip vc-estado-${es.polaridad || 'otro'} con-tip" data-tip="${esc(es.detalle || 'Sin descripción.')}">${esc(es.nombre || '(sin nombre)')} · ${dura}</span>`;
    }).join('');

    // Todo lo equipado: el arma y cada pieza de armadura, con su número destacado.
    const equipado = (nombre, tipo, valor, detalle) => `<div class="vc-equipo">
      <div class="equipo-item-top">
        <span class="equipado-nombre">${esc(nombre)}</span>
        <span class="valor-caja">${valor}</span>
      </div>
      <div class="equipo-item-meta">${esc(tipo)}</div>
      ${detalle ? `<div class="arma-detalle">${esc(detalle)}</div>` : ''}
    </div>`;
    const efectos = (sc.armaEfectos || []).length && typeof EfectosGolpe !== 'undefined' ? `Al golpear: ${EfectosGolpe.resumenLista(sc.armaEfectos)}` : '';
    const equipo = [
      equipado(sc.armaNombre || 'Arma sin nombre', sc.armaDeRango ? 'Arma de rango' : 'Arma', esc(K.danoTxt(sc)),
        [sc.armaDetalle, efectos].filter(Boolean).join(' · ')),
      ...(sc.equipo || []).map(it => equipado(it.nombre || '(sin nombre)', K.TIPOITEM_LABEL[it.tipoItem] || it.tipoItem || '', `<small>DEF</small>+${fmt(num(it.def))}`, it.detalle)),
    ].join('');

    return {titulo: sc.nombre || 'Creep', html: `
    <div class="view-wrap">
      <div class="view-image-wrap">${sc.imagen ? `<img src="${esc(sc.imagen)}" class="view-image" alt="">` : `<span class="view-image-empty">Sin imagen</span>`}</div>
      <div class="view-info">
        <div class="view-title">${esc(sc.nombre)} <span class="vc-nivel">Lv ${fmt(num(sc.nivel))}</span></div>
        <div class="vc-cajas vc-2">
          ${caja('HP', `${fmt(num(sc.hp))} / ${fmt(num(sc.hpMax))}`)}
          ${caja('No2', `${fmt(num(sc.nitros))} / ${fmt(K.nitrosMax(sc))}`)}
        </div>
        <div class="sect-label" style="margin-top:12px">Estados alterados</div>
        ${estados ? `<div class="vc-chips" style="margin-top:6px">${estados}</div>` : '<div class="hint" style="margin-top:4px">Sin estados.</div>'}
      </div>
    </div>
    <div class="vc-cuerpo">
      ${seccion('Atributos', `<div class="vc-cajas vc-5">${ATTR_IDS.map(a => {
        const mod = K.modTotal(sc, a);
        return `<div class="attr-col">${caja(ATTR_LABELS[a], fmt(num(sc[a]) + mod), mod ? `Base ${fmt(num(sc[a]))} ${K.conSigno(mod)} por ${K.origenesMod(sc, a).join(', ')}` : '')}${derivadosHtml(sc, a)}</div>`;
      }).join('')}</div>`)}
      ${seccion('Daño y defensa', `<div class="vc-cajas vc-2">
        ${caja('Daño', K.ataqueTxt(sc), K.ataqueOrigenTxt(sc))}
        ${caja('Defensa', fmt(K.defensaEfectiva(sc)), K.defensaOrigenTxt(sc))}
        ${K.armadmgEfectiva(sc) ? caja('Defensa especial', fmt(K.armadmgEfectiva(sc)), K.armadmgOrigenTxt(sc)) : ''}
      </div>
      ${crits ? `<div class="vc-cajas vc-5">${crits}</div>` : ''}`)}
      ${seccion('Habilidades', habsHtml !== undefined ? habsHtml : (habilidades ? `<div class="vc-chips">${habilidades}</div>` : '<div class="hint">Sin habilidades.</div>'))}
      ${seccion('Equipo', `<div class="vc-equipos">${equipo}</div>`)}
      ${seccion('Recompensas', recompensasVerHtml(sc))}
    </div>
    ${sc.notas ? `<div class="view-detalle"><span class="view-label">Notas</span>${esc(sc.notas)}</div>` : ''}
  `};
  }

  /* El «Ver» de un ítem visto por el GM (el arma o una pieza de un creep, un ítem del catálogo, una plantilla del botín). Copiado tal
     cual de gm-toolset/js/04 (verItemDatos, 2026-10-02, A6a). verItem(item) → {titulo, html}. */
  function verItem(item){
    item = {tipoItem: 'otros', ...item};
    const linea = (label, val) => (val === '' || val === null || val === undefined)
      ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
    const esArma = item.tipoItem.startsWith('arma_');
    const esCons = item.tipoItem === 'consumibles';
    const L = [];
    L.push(linea('Categoría', K.TIPOITEM_LABEL[item.tipoItem] || item.tipoItem));
    if(item.tier) L.push(linea('Rareza', item.tier));
    if(esArma) L.push(linea('Daño', `${Math.max(1,num(item.peso))}d${num(item.tipoDado)||8}${num(item.danoFijo)?` +${fmt(num(item.danoFijo))}`:''}`));
    if(item.def) L.push(linea('Defensa', `${num(item.def)>0?'+':''}${fmt(num(item.def))}`));
    L.push(linea('Peso', fmt(num(item.peso))));
    // Durabilidad (variable de diseño del ítem, comun/combatiente.js). Los creeps no la gastan: importa si lo sueltan o se publica.
    if(Combatiente.durTexto(item)) L.push(linea('Durabilidad', Combatiente.durTexto(item)));
    if(item.precioCompra !== undefined) L.push(linea('Precio', `${fmt(num(item.precioCompra))} DDE${item.estimado ? ' (estimado por comparación con el catálogo)' : ''}`));
    if(item.trofeo) L.push(linea('Trofeo', 'No se equipa: se vende en una tienda o se convierte en despojos'));
    if(esArma && (item.efectosGolpe || []).length && typeof EfectosGolpe !== 'undefined') L.push(linea('Al golpear', EfectosGolpe.resumenLista(item.efectosGolpe)));
    if(esCons) L.push(linea('Consumible', item.curahp ? `${num(item.curahp)>0?'+':''}${fmt(num(item.curahp))} HP al consumir` : 'Sin efecto numérico'));
    const otros = (item.mods || []).filter(m => m.stat && m.stat !== 'def');
    if(otros.length) L.push(linea('Otros modificadores', otros.map(m => `${K.STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));

    return {titulo: item.nombre || 'Ítem', html: `
    <div class="view-wrap">
      <div class="view-image-wrap">${item.imagen ? `<img src="${esc(item.imagen)}" class="view-image" alt="">` : `<span class="view-image-empty">Sin imagen</span>`}</div>
      <div class="view-info">
        <div class="view-title">${esc(item.nombre)}</div>
        <div class="view-lines">${L.filter(Boolean).join('')}</div>
      </div>
    </div>
    ${ItemCorto.verHtml(item)}
    ${(item.descripcionNarrativa||'').trim() ? `<div class="view-detalle view-narrativa">${esc(item.descripcionNarrativa)}</div>` : ''}
  `};
  }

  return {contenido, verHab, paraHtml, stat, derivadosHtml, recompensasVerHtml, verCreep, verItem};
})();
