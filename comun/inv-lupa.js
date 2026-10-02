/* =========================================================
   INV-LUPA — la 🔍 y el "Ver" de una habilidad de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 6 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Copiado tal cual de ficha-personaje (lupaStatInv y lupaHtmlInv en js/11; lo que arma verHabInv en js/04). Solo arma el HTML:
   el cuadro de la 🔍 lo abre comun/lupa.js (cada pantalla define lupaContenido) y la ventana de Ver, cada pantalla.
   contenido(inv, clave) → {titulo, html}: clave = "inv:invId:tipo:ref" (la de los data-lupa de comun/inv-botonera.js).
   verHab(inv, h) → {titulo, html}. stat(inv, statId, o): el desglose de un stat.
   Necesita comun/inv-calculo.js, ficha-calculo.js (STAT_LABEL) y lupa.js (lupaFila, lupaSeccion, lupaNota, lupaSigno, lupaTirada).
   ========================================================= */
const InvLupa = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const I = InvCalculo;

  function stat(inv, statId, {sinTirada = false} = {}){
    const attr = I.INV_STAT_ATTR[statId] || statId;
    let h = lupaFila(`${FichaCalculo.STAT_LABEL[attr]} base`, fmt(num(inv[attr])));
    I.aportesMod(inv, attr).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${esc(FichaCalculo.STAT_LABEL[attr])})</span>`, lupaSigno(a.val)); });
    if(statId !== attr) I.aportesMod(inv, statId).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${esc(FichaCalculo.STAT_LABEL[statId]||statId)})</span>`, lupaSigno(a.val)); });
    if(!I.aportesMod(inv, attr).length && (statId === attr || !I.aportesMod(inv, statId).length)) h += lupaFila('<span class="lupa-gris">Sin modificadores</span>', '–');
    if((statId === 'pdg' || statId === 'parry') && I.estadoActivo(inv, 'lisiado')) h += lupaFila('Lisiado <span class="lupa-gris">(la mitad, para abajo)</span>', '÷ 2');
    const valor = I.statValor(inv, statId);
    h += lupaFila(esc(FichaCalculo.STAT_LABEL[statId]||statId), fmt(valor), 'lupa-total');
    let out = lupaSeccion('De dónde sale', h);
    if(sinTirada) return out;
    out += lupaTirada(valor);
    return out;
  }

  function contenido(inv, clave){
    const [, , tipo, ref] = clave.split(':');
    if(!inv) return {titulo: '', html: ''};
    const sinCosto = lupaSeccion('Costo', lupaFila('Esta tirada', 'sin costo'));
    if(tipo === 'stat') return {titulo: `${inv.nombre} · ${FichaCalculo.STAT_LABEL[ref]||ref}`, html: stat(inv, ref) + sinCosto};
    if(tipo === 'atacar'){
      const tipoArma = num(inv.armaTipo) || 8;
      const hechos = num(inv.ataquesTurno);
      const costo = I.costoAtaque(inv);
      let h = lupaFila(`Tipo del arma${inv.armaNombre ? ` (${esc(inv.armaNombre)})` : ''}: d${fmt(tipoArma)}`, fmt(tipoArma));
      h += lupaFila('Ataques este turno', fmt(hechos));
      h += hechos === 0
        ? lupaFila(`Primer ataque: Tipo ÷ 2${tipoArma % 2 ? ', para arriba' : ''}`, `${fmt(costo)} No2`, 'lupa-total')
        : lupaFila('Ya atacó: Tipo completo', `${fmt(costo)} No2`, 'lupa-total');
      h += lupaFila('No2 disponibles', fmt(num(inv.nitros)), costo > num(inv.nitros) ? 'lupa-falta' : '');
      h += lupaNota('El primer ataque del turno cuesta la mitad. Se reinicia en el Mantenimiento.');
      return {titulo: `${inv.nombre} · Atacar`, html: stat(inv, 'pdg') + lupaSeccion('Costo', h)};
    }
    if(tipo === 'danio'){
      const dmg = I.statValor(inv, 'dmg');
      let h = lupaFila('Peso del arma (cantidad de dados)', fmt(Math.max(1, num(inv.armaPeso) || 1)));
      if(num(inv.armaAmplificado) > 0) h += lupaFila('Daño amplificado (dados extra)', lupaSigno(num(inv.armaAmplificado)));
      h += lupaFila('Tipo (caras del dado)', `d${fmt(num(inv.armaTipo) || 8)}`);
      if(num(inv.armaFijo)) h += lupaFila('Daño fijo del arma', lupaSigno(num(inv.armaFijo)));
      h += inv.armaDeRango
        ? lupaFila('Dmg <span class="lupa-gris">(arma de rango: no suma)</span>', '–', 'lupa-tachado')
        : lupaFila('Dmg (de Fuerza)', lupaSigno(dmg));
      h += lupaFila('Daño', esc(I.danoTxt(inv, dmg)), 'lupa-total');
      let out = lupaSeccion('De dónde sale', h);
      if(!inv.armaDeRango) out += stat(inv, 'dmg', {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
      return {titulo: `${inv.nombre} · Daño${inv.armaNombre ? ` (${inv.armaNombre})` : ''}`, html: out + sinCosto};
    }
    if(tipo === 'hab'){
      const h0 = inv.habilidades.find(x => x.id === ref);
      if(!h0) return {titulo: '', html: ''};
      const n = I.costoNitrosHab(inv, h0);
      const porDefecto = h0.nitrosCosto === undefined || h0.nitrosCosto === null || h0.nitrosCosto === '';
      let h = lupaFila(I.habAtaque(h0) ? `No2 · como un ataque <span class="lupa-gris">(${num(inv.ataquesTurno) ? 'Tipo completo' : 'primer ataque, Tipo ÷ 2'})</span>` : porDefecto ? `No2 (por defecto, ${fmt(I.IT2_INV.nitrosHabilidad)})` : 'No2 de la habilidad', `${fmt(n)} No2`, 'lupa-total');
      if(num(h0.cd) > 0) h += lupaFila('Cooldown', `${fmt(num(h0.cd))} turno(s)${num(h0.cdActual) > 0 ? ` · faltan ${fmt(num(h0.cdActual))}` : ''}`);
      h += lupaFila('No2 disponibles', fmt(num(inv.nitros)), n > num(inv.nitros) ? 'lupa-falta' : '');
      let out = lupaSeccion('Costo', h);
      if(h0.tiradaStat) out += lupaSeccion('Tirada del stat', lupaFila(esc(FichaCalculo.STAT_LABEL[h0.tiradaStat]||h0.tiradaStat), fmt(I.statValor(inv, h0.tiradaStat))));
      if((h0.tiradaExtra || '').trim()) out += lupaSeccion('Tirada', lupaFila('Fórmula de la habilidad', esc(h0.tiradaExtra)));
      return {titulo: `${inv.nombre} · ${h0.nombre || 'Habilidad'}`, html: out};
    }
    return {titulo: '', html: ''};
  }

  function verHab(inv, h){
    return {titulo: h.nombre || 'Sin nombre', html: `<div class="hint" style="margin-bottom:10px">${esc(I.costoHabTxt(inv,h))}${num(h.cd)>0?` · ${fmt(num(h.cd))} turno(s) de cooldown`:' · sin cooldown'}</div>
    <div>${h.detalle ? esc(h.detalle) : 'Sin detalle cargado.'}</div>`};
  }

  return {contenido, verHab, stat};
})();
