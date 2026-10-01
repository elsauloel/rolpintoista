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
      // Defensa, Armadura mágica y resistencia a crítico: de dónde sale cada número (equipo, base a mano, armadura rota).
      const esDef = ref === 'def', esArmadmg = ref === 'armadmg';
      const i = (esDef || esArmadmg) ? 0 : num(String(ref).replace('tipo', '')) - 1;
      const texto = esDef ? K.defensaOrigenTxt(sc) : esArmadmg ? K.armadmgOrigenTxt(sc) : K.critOrigenTxt(sc, i);
      const titulo = esDef ? 'Defensa' : esArmadmg ? 'Armadura mágica' : 'Res. a crítico Tipo ' + (4 + 2 * i);
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
      h += sc.armaDeRango
        ? lupaFila('Dmg <span class="lupa-gris">(arma de rango: no suma)</span>', '–', 'lupa-tachado')
        : lupaFila('Dmg (de Fuerza)', lupaSigno(dmg));
      h += lupaFila('Daño', esc(K.danoTxt(sc, dmg)), 'lupa-total');
      let out = lupaSeccion('De dónde sale', h);
      if(!sc.armaDeRango) out += stat(sc, 'dmg', {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
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
    <div>${h.detalle ? esc(h.detalle) : 'Sin detalle cargado — tocá ✎ en la habilidad para escribir uno.'}</div>`};
  }

  return {contenido, verHab, paraHtml, stat};
})();
