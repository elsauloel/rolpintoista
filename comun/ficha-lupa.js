/* =========================================================
   FICHA-LUPA — la 🔍 ("cómo se calcula") y el "Ver" de un personaje, fuera de la ficha (paso 4, etapa 3c-6 de
   docs/plan-paso4-etapa3.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje (lupaHtml y sus ayudantes en js/11; el armado de la tarjeta de openViewer en js/07),
   movido tal cual, con la ficha (`S`) como parámetro en vez de leerla de una variable global. Así lo muestran igual la ficha
   y el mapa (Botonera nueva). Solo arma el HTML: abrir el cuadro (comun/lupa.js) o la ventana de Ver es de cada pantalla.
   contenido(S, clave) → {titulo, html}: la 🔍 de un botón de la Botonera del personaje ('stat:pdg', 'atacar:<arma>',
       'danio:<arma>', 'defensa:def', 'social:<id>', 'habx:<id>', 'hab:<id>', 'cons:<lista>:<id>'). Las 🔍 de las
       invocaciones ('inv:…') siguen en la ficha.
   ver(S, key, it) → {titulo, html}: la tarjeta de "Ver" de un ítem, habilidad, pasiva, talento o estado (`key` = la lista:
       'inventario', 'cinturon', 'catalogo', 'habilidades', 'pasivas', 'sociales', 'efectos').
   Necesita lupa.js (lupaFila, lupaSeccion…), tiradas.js (formulaParaValor), combatiente.js, efectos-golpe.js,
   ficha-calculo.js, ficha-combate.js, ficha-habilidades.js y ficha-botonera.js.
   ========================================================= */
const FichaLupa = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  // Iguales a los de la ficha (el HTML tiene que salir letra por letra igual).
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  function esc(s){ return String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch])); }
  const IT2 = () => FichaCalculo.IT2;
  const IT2_PENDIENTE = txt => `<span class="it2-pendiente" title="Sin confirmar (Iteración 2): ${esc(txt)}">⚠</span>`;
  const ES_ATTR = id => FichaCalculo.ES_ATTR(id);
  const TIPOS_IDS = ['tipo1','tipo2','tipo3','tipo4','tipo5'];

  /* ---------- Lupa de la Botonera: cómo se calcula cada tirada y cuánto cuesta ----------
     Cada botón de la Botonera trae un 🔍 (data-lupa="tipo:clave") que abre
     #lupa-pop con el desglose: de qué stat sale, sus modificadores y de dónde
     vienen, cómo se reparte en dados y el costo en Nitros/SP con su motivo. */

  function lupaBase(S, id, c){
    const {ATTR_LIST, STAT_LIST, STAT_LABEL} = FichaCalculo;
    if(ES_ATTR(id)) return lupaFila('Valor propio', fmt(num(S.attrs[id])));
    const f = String(S.formulas[id] || '0');
    const vars = [...new Set(f.match(/[a-z]+/gi) || [])].filter(v => ATTR_LIST.some(a => a.id === v) || STAT_LIST.some(s => s.id === v));
    const detalle = vars.map(v => `${STAT_LABEL[v] || v} ${fmt(Number.isNaN(c.final[v]) ? 0 : c.final[v])}`).join(', ');
    let h = lupaFila(`Base: <code>${esc(f)}</code>${detalle ? ` <span class="lupa-gris">(${esc(detalle)})</span>` : ''}`,
      Number.isNaN(c.base[id]) ? '?' : fmt(c.base[id]));
    return h + lupaDesgloseVars(S, vars, c, 1, new Set([id]));
  }

  const lupaVarsDe = (S, id) => [...new Set(String(S.formulas[id] || '0').match(/[a-z]+/gi) || [])]
    .filter(v => FichaCalculo.ATTR_LIST.some(a => a.id === v) || FichaCalculo.STAT_LIST.some(s => s.id === v));

  // Abre, nivel por nivel, cada valor de la fórmula que tenga algo sumado
  // (equipo, estados, pasivas): la base del stat ya lo trae incluido.
  function lupaDesgloseVars(S, vars, c, nivel, vistos){
    const {STAT_LABEL, STAT_FULL} = FichaCalculo;
    let h = '';
    const pad = `style="padding-left:${14 * nivel}px"`;
    const fila = (txt, val) => `<div class="lupa-fila lupa-sub" ${pad}><span>${txt}</span><b>${val}</b></div>`;
    vars.forEach(v => {
      if(vistos.has(v)) return;
      const mods = c.mods[v] || [];
      const sub = ES_ATTR(v) ? '' : lupaDesgloseVars(S, lupaVarsDe(S, v), c, nivel + 1, new Set([...vistos, v]));
      if(!mods.length && !sub) return;
      h += ES_ATTR(v)
        ? fila(`${esc(STAT_FULL[v])} (valor propio)`, fmt(num(S.attrs[v])))
        : fila(`${esc(STAT_LABEL[v])} base <code>${esc(S.formulas[v] || '0')}</code>`, Number.isNaN(c.base[v]) ? '?' : fmt(c.base[v]));
      h += sub;
      mods.forEach(m => { h += fila(`${esc(m.origen)} <span class="lupa-gris">(${esc(m.tipo || '')} · ${esc(STAT_LABEL[v])})</span>`, lupaSigno(m.val)); });
    });
    return h;
  }

  // Stat completo: base, modificadores con su origen y efectos que lo alteran.
  function lupaStat(S, id, c, {valor, excluidos = [], sinTirada = false} = {}){
    const {STAT_LABEL, STAT_FULL} = FichaCalculo;
    valor = valor ?? c.final[id];
    let h = lupaBase(S, id, c);
    (c.mods[id] || []).forEach(m => {
      const fuera = excluidos.includes(m);
      h += lupaFila(`${esc(m.origen)} <span class="lupa-gris">(${esc(m.tipo || '')})${fuera ? ' — no cuenta: es de la otra arma' : ''}</span>`, lupaSigno(m.val), fuera ? 'lupa-tachado' : '');
    });
    if(!(c.mods[id] || []).length) h += lupaFila(`<span class="lupa-gris">Sin modificadores${ES_ATTR(id) ? '' : ` directos a ${esc(STAT_LABEL[id] || id)}`}</span>`, '–');
    const activos = (S.efectos || []).filter(e => e.activo !== false);
    const mitad = [];
    if(['pdg', 'eva'].includes(id)) activos.filter(e => e.mitadPdgEva).forEach(e => mitad.push(e.nombre));
    if(['pdg', 'parry'].includes(id)) activos.filter(e => e.lisiado).forEach(e => mitad.push(e.nombre));
    if(['pdg', 'parry', 'eva'].includes(id)) activos.filter(e => e.paralisis).forEach(e => mitad.push(e.nombre));
    if(id === 'eva') activos.filter(e => e.sentado).forEach(e => mitad.push(e.nombre));
    mitad.forEach(n => { h += lupaFila(`${esc(n)} <span class="lupa-gris">(al resultado de la tirada: ÷ 2, para abajo, mínimo 1)</span>`, '÷ 2'); });
    if(id === 'nitros'){
      activos.filter(e => e.forzarNitros !== '' && e.forzarNitros != null).forEach(e => { h += lupaFila(`${esc(e.nombre)} <span class="lupa-gris">(tope)</span>`, fmt(num(e.forzarNitros))); });
      activos.filter(e => e.cansado).forEach(e => { h += lupaFila(`${esc(e.nombre)} <span class="lupa-gris">(2/3, para abajo)</span>`, '× 2/3'); });
      activos.filter(e => e.hypeado).forEach(e => { h += lupaFila(`${esc(e.nombre)} <span class="lupa-gris">(+ un tercio del natural, para arriba)</span>`, '+ ⅓'); });
      activos.filter(e => e.exhausto).forEach(e => { h += lupaFila(`${esc(e.nombre)} <span class="lupa-gris">(tope: un tercio del natural, para abajo)</span>`, '÷ 3'); });
    }
    const nombreTotal = !STAT_FULL[id] || STAT_FULL[id] === STAT_LABEL[id] ? (STAT_LABEL[id] || id)
      : TIPOS_IDS.includes(id) ? `Res. a crítico ${STAT_LABEL[id]}` : `${STAT_LABEL[id]} · ${STAT_FULL[id]}`;
    h += lupaFila(esc(nombreTotal), Number.isNaN(valor) ? '?' : fmt(valor), 'lupa-total');
    let out = lupaSeccion('De dónde sale', h);
    if(sinTirada) return out;
    const afortunado = ['pdg', 'parry', 'eva'].includes(id) && activos.find(e => e.afortunado);
    out += lupaTirada(valor);
    if(afortunado) out += lupaNota(`Ventaja por ${esc(afortunado.nombre)}: se tira dos veces y queda la mejor.`);
    return out;
  }

  function lupaCostoAtaque(S, arma){
    const tipo = FichaCombate.tipoAtaque(arma);
    const hechos = FichaCombate.ataquesConArma(S, arma);
    const costo = FichaCombate.costoAtaque(S, arma);
    let h = lupaFila(arma ? `Tipo del arma (d${fmt(tipo)})` : `Sin arma: Tipo provisorio ${IT2_PENDIENTE('Tipo de un ataque sin arma')}`, fmt(tipo));
    h += lupaFila(`Ataques con ${arma ? 'esta arma' : 'las manos'} este turno`, fmt(hechos));
    h += hechos === 0
      ? lupaFila(`Primer ataque con ${arma ? 'esta arma' : 'las manos'}: Tipo ÷ 2${tipo % 2 ? ', para arriba' : ''}`, `${fmt(costo)} No2`, 'lupa-total')
      : lupaFila('Ya atacó con ella: Tipo completo', `${fmt(costo)} No2`, 'lupa-total');
    h += lupaFila('Nitros disponibles', fmt(num(S.nitros)), costo > num(S.nitros) ? 'lupa-falta' : '');
    h += lupaNota('Cada arma tiene su propio primer ataque a mitad de precio. Se reinicia en el Mantenimiento.');
    return lupaSeccion('Costo', h);
  }

  function formulaSocial(S, i){
    const caras = FichaBotonera.dadoCarasSocial(i);
    const inte = FichaBotonera.inteligenciaBudget(S).resto;
    return caras > 0 ? `1d${caras}+${inte}` : `+${inte}`;
  }

  function contenido(S, clave){
    const {STAT_LABEL, STAT_FULL} = FichaCalculo;
    const H = FichaHabilidades, B = FichaBotonera;
    const c = FichaCalculo.calcular(S);
    const [tipo, ...resto] = clave.split(':');
    const ref = resto.join(':');
    const sinCosto = lupaSeccion('Costo', lupaFila('Esta tirada', 'sin costo'));
    if(tipo === 'stat'){
      return {titulo: STAT_FULL[ref] || STAT_LABEL[ref] || ref, html: lupaStat(S, ref, c) + sinCosto};
    }
    if(tipo === 'defensa'){
      return {titulo: STAT_FULL[ref] || ref, html: lupaStat(S, ref, c, {sinTirada: true}) + lupaNota('Valor fijo: no se tira.')};
    }
    if(tipo === 'atacar'){
      const arma = S.inventario.find(i => i.id === ref) || null;
      const pdg = FichaCombate.pdgParaArma(S, arma, c);
      return {titulo: `Atacar${arma ? ` con ${arma.nombre}` : ' sin arma'}`, html: lupaStat(S, 'pdg', c, pdg) + lupaCostoAtaque(S, arma)};
    }
    if(tipo === 'danio'){
      const arma = S.inventario.find(i => i.id === ref);
      if(!arma) return {titulo: 'Daño', html: lupaNota('No tenés un arma con daño equipada.')};
      const dmg = Number.isNaN(c.final.dmg) ? 0 : c.final.dmg;
      let h = lupaFila('Peso del arma (cantidad de dados)', fmt(Math.max(1, num(arma.peso) || 1)));
      if(num(arma.danoAmplificado) > 0) h += lupaFila('Daño amplificado (dados extra)', lupaSigno(num(arma.danoAmplificado)));
      h += lupaFila('Tipo (caras del dado)', `d${fmt(num(arma.tipoDado) || 8)}`);
      if(num(arma.danoFijo)) h += lupaFila('Daño fijo del arma', lupaSigno(num(arma.danoFijo)));
      h += arma.armaDeRango
        ? lupaFila('Dmg <span class="lupa-gris">(arma de rango: no suma)</span>', '–', 'lupa-tachado')
        : lupaFila('Dmg (de Fuerza)', lupaSigno(dmg));
      h += lupaFila('Daño', esc(FichaCombate.armaDanoTxt(arma, dmg)), 'lupa-total');
      let out = lupaSeccion('De dónde sale', h);
      if(!arma.armaDeRango) out += lupaStat(S, 'dmg', c, {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
      return {titulo: `Daño · ${arma.nombre}`, html: out + sinCosto};
    }
    if(tipo === 'social'){
      const it = S.sociales.find(x => x.id === ref);
      if(!it) return {titulo: 'Talento', html: ''};
      const caras = B.dadoCarasSocial(it);
      let h = lupaFila('Nivel', fmt(B.nivelSocial(it)));
      if(num(it.puntosInt)) h += lupaFila('· de Inteligencia invertida', fmt(num(it.puntosInt)));
      if(num(it.nivelExtra)) h += lupaFila('· de tirada máxima', fmt(num(it.nivelExtra)));
      h += lupaFila('Dado (nivel × 2 caras)', caras ? `d${fmt(caras)}` : 'ninguno todavía');
      h += lupaFila('Inteligencia sin invertir', fmt(B.inteligenciaBudget(S).resto));
      h += lupaFila('Tirada', esc(formulaSocial(S, it)), 'lupa-total');
      return {titulo: it.nombre, html: lupaSeccion('De dónde sale', h) + sinCosto};
    }
    // Lupa del botón Ejecutar (Botonera): solo cuánto cuesta, cuánto hay de
    // eso y qué tira. Sin el desglose del origen de la tirada.
    if(tipo === 'habx'){
      const h0 = S.habilidades.find(x => x.id === ref);
      if(!h0) return {titulo: 'Habilidad', html: ''};
      let costo = '';
      let usaNitros = false, usaSp = false;
      if(H.nitrosAtaque(h0)){
        usaNitros = true;
        B.armasParaHabilidad(S).forEach(o => {
          costo += lupaFila(`No2 · como un ataque ${o.arma ? `con ${esc(o.arma.nombre)}` : 'sin arma'}`, `${fmt(FichaCombate.costoAtaque(S, o.arma))}`);
        });
      }else if(H.nitrosVariable(h0)){
        usaNitros = true;
        costo += lupaFila('No2', 'X (lo elegís al usarla)');
      }else if(B.costoNitrosHab(S, h0)){
        usaNitros = true;
        costo += lupaFila('No2', fmt(B.costoNitrosHab(S, h0)));
      }
      if(H.spVariable(h0)){ usaSp = true; costo += lupaFila('SP', 'X (lo elegís al usarla)'); }
      else if(H.parseCostoSp(h0.costo)){ usaSp = true; costo += lupaFila('SP', fmt(H.parseCostoSp(h0.costo))); }
      let usaHp = false;
      if(num(h0.hpCosto) > 0){ usaHp = true; costo += lupaFila('HP', fmt(num(h0.hpCosto))); }
      if(!costo) costo = lupaFila('Costo', 'gratis');
      let disp = '';
      if(usaNitros) disp += lupaFila('No2', fmt(num(S.nitros)), B.costoNitrosHab(S, h0) > num(S.nitros) ? 'lupa-falta' : '');
      if(usaHp) disp += lupaFila('HP', fmt(num(S.hp)), num(S.hp) <= num(h0.hpCosto) ? 'lupa-falta' : '');
      if(usaSp){
        const spDisp = B.spMaximo(S, c) - num(S.spGastado);
        disp += lupaFila('SP', fmt(spDisp), H.parseCostoSp(h0.costo) > spDisp ? 'lupa-falta' : '');
      }
      let tirada = '';
      const stat = h0.tiradaStat;
      if(stat && c.final[stat] !== undefined){
        const f = formulaParaValor(c.final[stat]);
        tirada += lupaFila(esc(STAT_LABEL[stat] || stat), f ? `= ${esc(f.formula)}` : `${fmt(num(c.final[stat]))} (no se puede tirar)`);
      }
      if((h0.tiradaExtra || '').trim()) tirada += lupaFila('Fórmula', esc(h0.tiradaExtra));
      if(!tirada) tirada = lupaFila('Tirada', 'no tira dados');
      return {titulo: h0.nombre, html: lupaSeccion('Cuesta', costo) + (disp ? lupaSeccion('Tenés', disp) : '') + lupaSeccion('Tira', tirada)};
    }
    if(tipo === 'hab'){
      const h0 = S.habilidades.find(x => x.id === ref);
      if(!h0) return {titulo: 'Habilidad', html: ''};
      let costo = '';
      if(H.habCostoVariable(h0)) costo += lupaFila(`Costo variable (X en ${[H.spVariable(h0) ? "SP" : "", H.nitrosVariable(h0) ? "No2" : ""].filter(Boolean).join(" y ")})`, "elegís al ejecutar");
      else{
        const n = B.costoNitrosHab(S, h0);
        if(H.nitrosAtaque(h0)) B.armasParaHabilidad(S).forEach(o => { costo += lupaFila(`Como un ataque con ${o.arma ? esc(o.arma.nombre) : "sin arma"} <span class="lupa-gris">(${FichaCombate.ataquesConArma(S, o.arma) ? "Tipo completo" : "primer ataque, Tipo ÷ 2"})</span>`, `${fmt(FichaCombate.costoAtaque(S, o.arma))} No2`); });
        else costo += lupaFila(h0.nitrosCosto === undefined || h0.nitrosCosto === null || h0.nitrosCosto === '' ? `Nitros (por defecto, ${fmt(IT2().nitrosHabilidad)})` : 'Nitros de la habilidad', `${fmt(n)} No2`);
        const sp = H.parseCostoSp(h0.costo);
        if(sp) costo += lupaFila(`SP <span class="lupa-gris">(${esc(h0.costo)})</span>`, `${fmt(sp)} SP`);
      }
      costo += lupaFila('Disponibles', `${fmt(num(S.nitros))} No2 · ${fmt(B.spMaximo(S, c) - num(S.spGastado))} SP`);
      let out = lupaSeccion('Costo', costo);
      const stat = h0.tiradaStat;
      if(stat && c.final[stat] !== undefined) out += lupaSeccion(`Tira ${esc(STAT_LABEL[stat] || stat)}`, lupaStat(S, stat, c));
      if(stat && num(h0.tiradaBono)) out += lupaSeccion('Bono de la habilidad', lupaFila(`Suma al ${esc(STAT_LABEL[stat] || stat)} de esta tirada`, lupaSigno(num(h0.tiradaBono))));
      if((h0.tiradaExtra || '').trim()) out += lupaSeccion('Tirada extra', lupaFila('Fórmula de la habilidad', esc(h0.tiradaExtra)));
      return {titulo: h0.nombre, html: out};
    }
    if(tipo === 'cons'){
      const [lista, id] = [resto[0], resto[1]];
      const it = (S[lista] || []).find(x => x.id === id);
      if(!it) return {titulo: 'Consumible', html: ''};
      let h = lupaFila(`Consumir desde ${lista === 'cinturon' ? 'el cinturón' : 'la mochila'}`, `${fmt(B.costoConsumirNitros(lista))} No2`, 'lupa-total');
      h += lupaFila("No2 que tenés", fmt(num(S.nitros)), B.costoConsumirNitros(lista) > num(S.nitros) ? "lupa-falta" : "");
      h += lupaFila("Unidades", fmt(num(it.unidades)), num(it.unidades) <= 0 ? "lupa-falta" : "");
      h += lupaNota(`Del cinturón cuesta ${fmt(IT2().nitrosConsumirCinturon)} No2; de la mochila, ${fmt(IT2().nitrosConsumirMochila)}.`);
      let ef = '';
      if(it.curahp) ef += lupaFila('Vida', `${lupaSigno(num(it.curahp))} HP`);
      if(num(it.curaspPct) > 0) ef += lupaFila('SP', `${fmt(num(it.curaspPct))}% del máximo`);
      if(it.efectoNombre) ef += lupaFila('Estado', esc(it.efectoNombre));
      return {titulo: it.nombre, html: lupaSeccion('Costo', h) + (ef ? lupaSeccion('Efecto', ef) : '')};
    }
    return {titulo: '', html: ''};
  }

  /* ---------- "Ver": la tarjeta de un ítem, habilidad, pasiva, talento o estado ---------- */
  // Las categorías de un ítem (las mismas del editor de la ficha).
  const CATEGORIA_LABEL = {'': '— elegir categoría —', arma_1m: 'Arma de una mano', arma_2m: 'Arma de dos manos',
    escudo_1m: 'Escudo de una mano', escudo_2m: 'Escudo de dos manos', armadura_blanda: 'Armadura blanda', armadura_rigida: 'Armadura rígida',
    manos: 'Manos', piernas: 'Piernas', cabeza: 'Cabeza', pies: 'Pies', cinturon: 'Cinturón', mochila: 'Mochila', anillos: 'Anillos',
    otros: 'Otros', consumibles: 'Consumibles'};
  const ES_ARMA = catId => catId === 'arma_1m' || catId === 'arma_2m';
  const sinAvisoTxt = s => String(s ?? '').replace(/^⚠️\s*/, '');
  // Puntos de Job que costó (1 si no dice otra cosa).
  function jobCostoDe(x){
    if(!x || x.job === false) return 0;
    const n = num(x.jobCosto);
    const uno = x.jobCosto === undefined || x.jobCosto === null || x.jobCosto === "" ? 1 : Math.max(0, n);
    return uno * FichaCalculo.pasivaCompras(x);
  }
  const ranurasDe = i => (i.ranuras === undefined || i.ranuras === '') ? 1 : num(i.ranuras);
  const precioVentaDe = i => Math.round((num(i.precioCompra) / 2) * 100) / 100;
  const defValorDe = i => (i.mods||[]).filter(m => m.stat === 'def').reduce((a,m) => a + num(m.val), 0);
  const getModVal = (draft, statId) => { const m = (draft.mods||[]).find(mm => mm.stat === statId); return m ? m.val : 0; };
  /* Texto de color del ítem, solo para la tarjeta de "Ver" — no toca ninguna
     mecánica (todo lo que el ítem hace vive en `detalle`). Igual que con el
     efecto al consumir, el catálogo manda: los ítems que el jugador ya tenía
     en la mochila se copiaron antes de que existiera este campo. */
  function narrativaDe(S, it){
    const propia = (it.descripcionNarrativa || '').trim();
    if(propia) return propia;
    const base = (S.catalogo || []).find(c => sinAvisoTxt(c.nombre) === sinAvisoTxt(it.nombre));
    return base ? (base.descripcionNarrativa || '').trim() : '';
  }

  function ver(S, key, it){
    const {STAT_LABEL} = FichaCalculo;
    const linea = (label, val) => (val === '' || val === null || val === undefined) ? '' : `<div class="view-line"><span class="view-label">${esc(label)}</span><span class="view-value">${esc(val)}</span></div>`;
    const L = [];

    if(key === 'inventario' || key === 'cinturon' || key === 'catalogo'){
      if(it.tipoItem) L.push(linea('Categoría', CATEGORIA_LABEL[it.tipoItem] || it.tipoItem));
      if(ES_ARMA(it.tipoItem)) L.push(linea('Tipo', fmt(num(it.tipoDado) || 8)));
      if(ES_ARMA(it.tipoItem) && EfectosGolpe.lista(it.efectosGolpe).length) L.push(linea('Al golpear', EfectosGolpe.resumenLista(it.efectosGolpe)));
      L.push(linea('Peso', fmt(num(it.peso))));
      // Durabilidad (variable de diseño del ítem): la de fábrica; en una copia propia, además cuánto le queda.
      if(FichaCalculo.durableItem(it)) L.push(linea('Durabilidad', key === 'catalogo' || it.dur === undefined || it.dur === null
        ? Combatiente.durTexto(it) : `${fmt(FichaCalculo.durActual(it))} de ${Combatiente.durTexto(it)}${FichaCalculo.itemRoto(it) ? ' · ROTO' : ''}`));
      if(ES_ARMA(it.tipoItem)) L.push(linea('Daño', FichaCombate.armaDanoTxt(it)));
      const defVal = defValorDe(it);
      if(defVal) L.push(linea('Defensa', `${defVal>0?'+':''}${fmt(defVal)}`));
      TIPOS_IDS.forEach(tid => {
        const v = getModVal(it, tid);
        if(v) L.push(linea(`Res. crítico ${STAT_LABEL[tid]}`, `${v>0?'+':''}${fmt(v)}`));
      });
      if(key === 'inventario') L.push(linea('Estado', it.equipado ? 'Equipado' : 'En mochila'));
      if(key === 'inventario' && !it.equipado) L.push(linea('Ranuras', fmt(ranurasDe(it))));
      if(num(it.precioCompra)) L.push(linea('Precio de compra', fmt(num(it.precioCompra))));
      if(precioVentaDe(it)) L.push(linea('Precio de venta', fmt(precioVentaDe(it))));
      if(it.consumible) L.push(linea('Consumible', `${fmt(num(it.unidades))} unidades · ${num(it.curahp)>=0?'+':''}${fmt(num(it.curahp))} HP al consumir`));
      const otrosMods = (it.mods||[]).filter(m => m.stat && m.stat !== 'def' && !TIPOS_IDS.includes(m.stat));
      if(otrosMods.length) L.push(linea('Otros modificadores', otrosMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));
    }

    if(key === 'habilidades'){
      if(it.costo) L.push(linea('Costo', it.costo));
      L.push(linea("Adquirida con Job", it.job !== false ? `Sí · ${fmt(jobCostoDe(it))} punto${jobCostoDe(it) === 1 ? "" : "s"}` : "No"));
      if(it.job === false && it.origen) L.push(linea("Origen", it.origen));
    }

    if(key === 'pasivas'){
      L.push(linea('Adquirida con Job', it.job !== false ? 'Sí' : 'No'));
      if(it.job === false && it.origen) L.push(linea('Origen', it.origen));
      const pMods = (it.mods||[]);
      if(pMods.length) L.push(linea('Modificadores', pMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));
    }

    if(key === 'sociales'){
      L.push(linea('Nivel', FichaBotonera.nivelSocialTxt(it)));
      L.push(linea('Tirada', FichaBotonera.tiradaSocialTxt(S, it)));
      if(num(it.puntosInt)) L.push(linea('De Inteligencia', fmt(num(it.puntosInt))));
      if(num(it.nivelExtra)) L.push(linea('De tirada máxima', fmt(num(it.nivelExtra))));
    }

    if(key === 'efectos'){
      L.push(linea('Duración', it.permanente ? 'Permanente' : (num(it.turnos)>0 ? `${fmt(num(it.turnos))} turno(s) restante(s)` : 'Sin duración fija')));
      if(num(it.stacks) > 1) L.push(linea('Stacks', fmt(num(it.stacks))));
      if(num(it.hpturno)) L.push(linea('HP por turno (por stack)', `${num(it.hpturno)>0?'+':''}${fmt(num(it.hpturno))}`));
      L.push(linea('Estado', it.activo !== false ? 'Activo' : 'Pausado'));
      if(it.popup) L.push(linea('Aviso', 'Avisa en el mantenimiento'));
      const eMods = (it.mods||[]);
      if(eMods.length) L.push(linea('Modificadores', eMods.map(m => `${STAT_LABEL[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}`).join(', ')));
    }

    const narrativa = narrativaDe(S, it);
    return {titulo: it.nombre || 'Ítem', html: `
    <div class="view-wrap">
      <div class="view-image-wrap">${it.imagen ? `<img src="${esc(it.imagen)}" class="view-image" alt="">` : `<span class="view-image-empty">Sin imagen</span>`}</div>
      <div class="view-info">
        <div class="view-title">${esc(it.nombre)}</div>
        <div class="view-lines">${L.filter(Boolean).join('') || '<div class="view-line"><span class="view-value">Sin datos adicionales.</span></div>'}</div>
      </div>
    </div>
    ${ItemCorto.verHtml(it)}
    ${narrativa ? `<div class="view-detalle view-narrativa">${esc(narrativa)}</div>` : ''}
  `};
  }

  return {contenido, ver, formulaSocial, jobCostoDe, narrativaDe, CATEGORIA_LABEL};
})();
