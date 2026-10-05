/* =========================================================
   FICHA-EQUIPO — Equipo y mochila de un personaje, para cualquier pantalla (2026-10-02, hoja de ruta A4 de docs/pendientes.md:
   el mapa lo muestra él mismo, sin abrir la ficha escondida)
   Lo que antes vivía en la ficha (js/01 SLOT_DEFS, js/02 computeSlots/modTags/thumb, js/04 defValorDe, js/06 el botón de equipar,
   js/07 slotOcupadoInfo/statsComparablesDe/TIER_COLOR, js/08 renderEquipo, js/09 conCostoEquipar/abrirSlotLleno/reemplazarEquipado/
   renderComparar), copiado tal cual y con el personaje (`S`) como parámetro:
   - SLOT_DEFS, slots(S), slotOcupado(S, item), defValor(i), statsComparables(item), TIER_COLOR.
   - equipar(S, id, ui): el botón Equipar / Sacar de un ítem de la mochila (en la mesa común no; un trofeo no se equipa; un consumible
     pasa al cinturón; con el slot lleno, ui.slotLleno(it) — que muestra «Reemplazar o Comparar» —; en combate cuesta No2).
   - reemplazar(S, equipadoId, nuevoId, ui): saca el equipado y pone el de la mochila (2 veces el costo de equipar).
   - conCosto(S, veces, infinitivo, pasado, accion, ui): el cobro de equipar en combate (sin No2: ui.avisarSinNitros, y si se hace
     igual, la línea roja de FichaAcciones.gastoNitrosForzado).
   - html(S, {lupa}): el cuerpo de la ventana «Equipo y mochila» (las manos, Defensa y resistencias a crítico, el peso equipado, lo
     equipado slot por slot y lo equipable de la mochila). slotLlenoHtml(S, it): el cuerpo de «el slot está lleno».
     compararHtml(S, item, equipadoId, {precioHtml}): la tabla de «Comparar».
   ui = {toast, avisarSinNitros(costo, accion, continuar), modoCombate() (¿el mapa está en combate?), slotLleno(it) (true si mostró
   el menú), cambio(partes)}: cada pantalla muestra y guarda a su manera.
   Necesita comun/ficha-calculo.js, ficha-combate.js, ficha-acciones.js (gastoNitrosForzado) y lupa.js (lupaBotonHtml, si hay lupa).
   ========================================================= */
const FichaEquipo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const TIPOS_IDS = ['tipo1','tipo2','tipo3','tipo4','tipo5'];
  const TIER_COLOR = {'Común':'#9A867E', 'Buena Calidad':'#A8C256', 'Raro':'#5B8DBE', 'Excepcional':'#E0A458', 'Legendario':'#9B7BD4', 'A definir':'#D4574E'};
  const SLOT_DEFS = [
    {id:'cabeza', label:'Cabeza', cats:['cabeza'], max:1},
    {id:'torso_blanda', label:'Armadura blanda', cats:['armadura_blanda'], max:1},
    {id:'torso_rigida', label:'Armadura rígida', cats:['armadura_rigida'], max:1},
    {id:'manos', label:'Manos', cats:['manos'], max:1},
    {id:'manos_arma', label:'Manos (armas y escudos)', cats:['arma_1m','arma_2m','escudo_1m','escudo_2m'], max:2, peso:{arma_1m:1, arma_2m:2, escudo_1m:1, escudo_2m:2}},
    {id:'anillos', label:'Anillos', cats:['anillos'], max:2},
    {id:'pies', label:'Pies', cats:['pies'], max:1},
    {id:'piernas', label:'Piernas', cats:['piernas'], max:1},
    {id:'cinturon', label:'Cinturón', cats:['cinturon'], max:1},
    {id:'mochila', label:'Mochila', cats:['mochila'], max:1},   // un solo cinturón y una sola mochila puestos (2026-09-25)
  ];
  const STAT_COMPARABLE_LABEL = {def:'Defensa', danoprom:'Daño prom.'};
  const L = () => FichaCalculo.STAT_LABEL, F = () => FichaCalculo.STAT_FULL;
  // Las categorías de ítem de la ficha (js/01, A5) y la mochila: ranuras de un ítem, cuántas usa la mochila y su capacidad (la base la
  // pone el jugador, S.caps.mochila, y la mochila equipada la amplía con el mod "capmochila").
  const CATEGORIAS = [
    {id:'', label:'— elegir categoría —'},
    {id:'arma_1m', label:'Arma de una mano', arma:true},
    {id:'arma_2m', label:'Arma de dos manos', arma:true},
    {id:'escudo_1m', label:'Escudo de una mano', defensivo:true},
    {id:'escudo_2m', label:'Escudo de dos manos', defensivo:true},
    {id:'armadura_blanda', label:'Armadura blanda', defensivo:true},
    {id:'armadura_rigida', label:'Armadura rígida', defensivo:true},
    {id:'manos', label:'Manos', defensivo:true},
    {id:'piernas', label:'Piernas', defensivo:true},
    {id:'cabeza', label:'Cabeza', defensivo:true},
    {id:'pies', label:'Pies', defensivo:true},
    {id:'cinturon', label:'Cinturón', defensivo:true},
    {id:'mochila', label:'Mochila', defensivo:true},
    {id:'anillos', label:'Anillos'},
    {id:'otros', label:'Otros'},
    {id:'consumibles', label:'Consumibles'},
  ];
  const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map(c=>[c.id, c.label]));
  // Lo que ocupa un ítem en la mochila (dueño, 2026-10-05, P158): al menos 1 ranura, salvo que el ítem diga lo contrario (`sinRanura: true`);
  // una pila de algo apilable (consumibles, trofeos iguales) ocupa 1 por pila. Antes había armas y piezas con 0 (no ocupaban lugar).
  const ranuras = i => (i && i.sinRanura) ? 0 : Math.max(1, Math.round(num(i && i.ranuras)) || 1);
  // Lo que ocupa la mochila (con el Morral de cazador, los trofeos no ocupan: 2026-10-05).
  const mochilaUsada = S => { const morral = num(FichaCalculo.calcular(S).final.morral) > 0; return (S.inventario || []).filter(i => !i.equipado && !(morral && i.trofeo)).reduce((a, i) => a + ranuras(i), 0); };
  function capMochila(S){
    const bonus = FichaCalculo.calcular(S).final.capmochila;
    return num(S.caps && S.caps.mochila) + (Number.isNaN(bonus) ? 0 : bonus);
  }
  /* ---------- Las ranuras del cinturón (dueño, 2026-10-04) ----------
     1 ranura = 1 unidad (5 pociones = 5 ranuras). La base es 5 para todos (S.caps.cinturon; el número a mano queda para casos especiales) y
     el cinturón equipado —o, de manera excepcional, otra pieza— la amplía con «capcinturon». Con el cinturón lleno no entra nada más: lo que
     no entra se queda en la mochila. Todos los caminos que meten algo en el cinturón pasan por alCinturon. */
  const BASE_CINTURON = 5;
  // Portapergaminos y ranuras exclusivas (2026-10-05): la cuenta común, Combatiente.ranurasCinturon.
  function opcionesCinturon(S){
    const f = FichaCalculo.calcular(S).final;
    return {portapergaminos: num(f.portapergaminos),
      excl: {pocion: num(f.ranurapocion), pergamino: num(f.ranurapergamino), trampa: num(f.ranuratrampa), ankh: num(f.ranuraankh)}};
  }
  const cinturonUsado = S => Combatiente.ranurasCinturon(S.cinturon || [], opcionesCinturon(S));
  const cuantasEntran = (S, it, cuantas) => Combatiente.entranEnCinturon(S.cinturon || [], it, cuantas, capCinturon(S), opcionesCinturon(S));
  function capCinturon(S){
    const bonus = FichaCalculo.calcular(S).final.capcinturon;
    const base = S.caps && S.caps.cinturon !== undefined && S.caps.cinturon !== '' ? num(S.caps.cinturon) : BASE_CINTURON;
    return base + (Number.isNaN(bonus) ? 0 : bonus);
  }
  const cinturonLibre = S => Math.max(0, capCinturon(S) - cinturonUsado(S));
  // Pasa al cinturón hasta `cantidad` unidades del consumible `it` de la mochila (todas si no se dice), las que entren: se suman a una pila
  // igual que ya esté en el cinturón o forman una nueva. Lo que no entra queda en la mochila (y si la pila de la mochila se vacía, se va).
  // → {movidas, quedan, libre} (libre: las ranuras que quedan después).
  function alCinturon(S, it, cantidad){
    if(!it) return {movidas: 0, quedan: 0, libre: cinturonLibre(S)};
    const tiene = it.consumible ? Math.max(0, num(it.unidades)) : 1;
    const quiere = Math.min(tiene, cantidad === undefined ? tiene : Math.max(0, Math.round(num(cantidad))));
    const movidas = cuantasEntran(S, it, quiere);
    if(movidas > 0){
      const pila = it.consumible ? (S.cinturon || []).find(x => x.consumible && x.nombre === it.nombre) : null;
      if(pila) pila.unidades = num(pila.unidades) + movidas;
      else{
        const c = structuredClone(it);
        c.id = 'cin-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        c.equipado = false; c.ranuras = 1;
        if(it.consumible){ c.unidades = movidas; c.cargaActual = Math.max(1, num(it.cargaMax) || 1); }
        S.cinturon = [...(S.cinturon || []), c];
      }
      if(it.consumible) it.unidades = tiene - movidas;
      if(!it.consumible || num(it.unidades) <= 0) S.inventario = (S.inventario || []).filter(x => x !== it);
    }
    return {movidas, quedan: (it.consumible ? Math.max(0, num(it.unidades)) : (movidas ? 0 : 1)), libre: cinturonLibre(S)};
  }
  // El aviso de un paso al cinturón (lo mismo en la ficha y en el mapa).
  function textoAlCinturon(S, it, r){
    const lleno = `el cinturón está lleno (${cinturonUsado(S)}/${capCinturon(S)})`;
    if(!r.movidas) return `${it.nombre}: no entra, ${lleno}`;
    return `${it.nombre}: ${r.movidas === 1 ? '1 unidad pasó' : r.movidas + ' unidades pasaron'} al cinturón` + (r.quedan ? ` · ${r.quedan} quedan en la mochila (${lleno})` : '');
  }

  /* ---------- Vaina (cinturón) y Correas laterales (mochila), 2026-10-05 ----------
     Un arma (vaina o correa) o un escudo (solo correa) que está «a mano» (`aMano`) se equipa sin gastar No2; y uno equipado, si queda una
     vaina o correa libre, se guarda ahí sin gastar No2. Cuántas hay: los stats `vainas` y `correas`. Fuera de combate no cuesta nada igual. */
  const esEscudo = it => String((it && it.tipoItem) || '').startsWith('escudo');
  const aManoApto = it => !!it && (FichaCombate.esArma(it.tipoItem) || esEscudo(it));
  function aManoCap(S){ const f = FichaCalculo.calcular(S).final; return {vainas: Math.max(0, Math.round(num(f.vainas))), correas: Math.max(0, Math.round(num(f.correas)))}; }
  // ¿Entra `it` a mano, junto con los que ya están (salvo `sin`)?
  function aManoEntra(S, it, sin){
    if(!aManoApto(it)) return false;
    const lista = (S.inventario || []).filter(x => !x.equipado && x.aMano && x !== it && x !== sin).concat([it]);
    const cap = aManoCap(S);
    let v = cap.vainas, c = cap.correas;
    for(const x of lista.filter(esEscudo)){ if(c > 0) c--; else return false; }
    for(const x of lista.filter(x => !esEscudo(x))){ if(v > 0) v--; else if(c > 0) c--; else return false; }
    return true;
  }
  function alternarAMano(S, id, ui){
    const it = (S.inventario || []).find(x => x.id === id);
    if(!it || it.equipado) return;
    if(it.aMano){ it.aMano = false; ui.cambio(['inventario']); ui.toast(`${it.nombre} vuelve a la mochila`); return; }
    if(!aManoEntra(S, it)){ ui.toast(esEscudo(it) ? 'No te queda una correa libre para el escudo' : 'No te queda una vaina ni una correa libre'); return; }
    it.aMano = true;
    ui.cambio(['inventario']);
    ui.toast(`${it.nombre} queda a mano: se equipa sin gastar No2`);
  }
  const aManoBoton = (S, it) => {
    const cap = aManoCap(S);
    if(!aManoApto(it) || (!cap.vainas && !cap.correas) || it.equipado) return '';
    return `<button type="button" class="mini${it.aMano ? ' on' : ''}" data-amano="${it.id}" title="${it.aMano ? 'Está a mano (se equipa sin No2): devolverlo a la mochila' : 'Dejarlo a mano (vaina o correa): se equipa sin gastar No2'}">${it.aMano ? '🗡 A mano' : '🗡 Vaina / correa'}</button>`;
  };

  /* ---------- Los slots ---------- */
  function slots(S){
    const equipados = (S.inventario || []).filter(i => i.equipado);
    return SLOT_DEFS.map(sd => {
      let usado = 0;
      equipados.forEach(i => {
        if(!sd.cats.includes(i.tipoItem)) return;
        usado += sd.peso ? (sd.peso[i.tipoItem] || 1) : 1;
      });
      return {...sd, usado};
    });
  }
  // Slot que ocupa un ítem según SLOT_DEFS, y si ese slot ya está lleno o ya hay algo del mismo tipo puesto (para Comparar).
  // null para lo que no ocupa un slot del cuerpo (consumibles, etc.).
  function slotOcupado(S, item){
    const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(item.tipoItem));
    if(!slotDef) return null;
    const usado = slots(S).find(s => s.id === slotDef.id)?.usado || 0;
    const propio = slotDef.peso ? (slotDef.peso[item.tipoItem] || 1) : 1;
    const equipados = (S.inventario || []).filter(i => i.equipado && i.tipoItem === item.tipoItem);
    return {ocupado: usado + propio > slotDef.max, equipados};
  }
  function defValor(i){
    return (i.mods||[]).filter(m => m.stat === 'def').reduce((a,m) => a + num(m.val), 0);
  }
  // Stats de un ítem en forma comparable: Defensa, daño promedio del arma (dados*(caras+1)/2 + fijo) y sus mods menos Defensa.
  function statsComparables(item){
    const out = {};
    const defVal = defValor(item);
    if(defVal) out.def = defVal;
    if(FichaCombate.esArma(item.tipoItem)){
      const dados = Math.max(1, num(item.peso) || 1) + Math.max(0, num(item.danoAmplificado)), caras = num(item.tipoDado) || 8, fijo = num(item.danoFijo);
      out.danoprom = Math.round((dados * (caras + 1) / 2 + fijo) * 10) / 10;
    }
    (item.mods || []).forEach(m => {
      if(!m.stat || m.stat === 'def') return;
      out[m.stat] = (out[m.stat] || 0) + num(m.val);
    });
    return out;
  }

  /* ---------- Equipar, sacar, reemplazar ---------- */
  // En modo combate, equipar o desequipar un ítem cuesta No2 (IT2.nitrosEquipar) cada vez: reemplazar uno por otro son dos. Sin No2
  // suficientes: el cartel de siempre (cancelar o hacerlo igual, con la línea roja en la Mesa). En narrativo no cuesta nada.
  function conCosto(S, veces, infinitivo, pasado, accion, ui){
    const costo = ui.modoCombate() ? veces * FichaCalculo.IT2.nitrosEquipar : 0;
    if(!costo){ accion(); return; }
    const pagar = forzar => {
      const gasto = forzar && costo > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, costo, pasado) : costo;
      S.nitros = num(S.nitros) - gasto;
      if(ui.alPagar) ui.alPagar();   // la ficha redibuja los No2
      accion();
      ui.toast(`−${fmt(gasto)} No2 (equipar en combate)`);
    };
    if(costo > num(S.nitros)) ui.avisarSinNitros(costo, infinitivo, () => pagar(true));
    else pagar(false);
  }
  function equipar(S, id, ui){
    const it = (S.inventario || []).find(x => x.id === id);
    if(!it) return false;
    if(it.enMesa || it.reservado){ ui.toast(`Está ofrecido a ${it.reservadoPara || 'otro personaje'}: cancelá la oferta primero (🤝)`); return true; }   // 🤝 comun/intercambio.js
    if(!it.equipado && it.trofeo){ ui.toast('Un trofeo no se equipa: se vende en una tienda o se convierte en despojos'); return true; }
    if(!it.equipado && it.tipoItem === 'consumibles'){
      // Al cinturón, las unidades que entren (1 ranura = 1 unidad; lleno, no entra nada más).
      const r = alCinturon(S, it);
      if(r.movidas) ui.cambio(['inventario', 'cinturon']);
      ui.toast(textoAlCinturon(S, it, r));
      return true;
    }
    if(!it.equipado && it.tipoItem){
      const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(it.tipoItem));
      if(slotDef){
        const usadoSinEste = slots(S).find(s => s.id === slotDef.id)?.usado || 0;
        const propio = slotDef.peso ? (slotDef.peso[it.tipoItem] || 1) : 1;
        if(usadoSinEste + propio > slotDef.max){
          if(ui.slotLleno(it)) return true;  // menú: Reemplazar o Comparar
          ui.toast(`No entra: ${slotDef.label} quedaría en ${fmt(usadoSinEste + propio)} / ${fmt(slotDef.max)}`);
          return true;
        }
      }
    }
    const eraEquipado = it.equipado;
    // Vaina o correa: desde ahí se equipa sin No2, y se guarda ahí sin No2 si queda una libre (2026-10-05).
    const aMano = eraEquipado ? aManoEntra(S, it) : !!it.aMano;
    conCosto(S, aMano ? 0 : 1, `${eraEquipado ? 'desequipar' : 'equipar'} ${it.nombre}`, `${eraEquipado ? 'desequipó' : 'equipó'} ${it.nombre}`, () => {
      it.equipado = !it.equipado;
      it.aMano = !it.equipado && aMano;
      ui.cambio(['inventario']);
      if(aMano && ui.modoCombate()) ui.toast(`${it.nombre}: ${it.equipado ? 'sale de la vaina' : 'a la vaina'}, sin gastar No2`);
    }, ui);
    return true;
  }
  // Saca el equipado y pone el de la mochila. Si el slot igual no alcanza (ej. un arma de dos manos con escudo puesto), avisa.
  function reemplazar(S, equipadoId, nuevoId, ui){
    const nuevo = (S.inventario || []).find(x => x.id === nuevoId);
    const viejo = (S.inventario || []).find(x => x.id === equipadoId);
    if(!nuevo || !viejo) return;
    const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(nuevo.tipoItem));
    // Se prueba si entra ANTES de cobrar nada.
    viejo.equipado = false;
    nuevo.equipado = true;
    const usado = slotDef ? (slots(S).find(s => s.id === slotDef.id)?.usado || 0) : 0;
    viejo.equipado = true;
    nuevo.equipado = false;
    if(slotDef && usado > slotDef.max){
      ui.toast(`Igual no entra: ${slotDef.label} quedaría en ${fmt(usado)} / ${fmt(slotDef.max)}. Sacá otro ítem del slot primero.`);
      return;
    }
    // Vaina o correa (2026-10-05): el que sale de ahí no cuesta; el que se guarda ahí (si queda lugar) tampoco.
    const nuevoAMano = !!nuevo.aMano, viejoAMano = aManoEntra(S, viejo, nuevo);
    conCosto(S, (nuevoAMano ? 0 : 1) + (viejoAMano ? 0 : 1), `reemplazar ${viejo.nombre} por ${nuevo.nombre}`, `reemplazó ${viejo.nombre} por ${nuevo.nombre}`, () => {
      nuevo.aMano = false; viejo.aMano = viejoAMano;
      viejo.equipado = false;
      nuevo.equipado = true;
      ui.cambio(['inventario'], {reemplazo: true});
      ui.toast(`${nuevo.nombre} equipado en lugar de ${viejo.nombre}`);
    }, ui);
  }

  /* ---------- Lo que se ve ---------- */
  const thumb = i => i.imagen ? `<img class="item-thumb" src="${i.imagen}" alt="">` : '';
  function modTags(mods){
    return (mods||[]).filter(m=>m.stat).map(m =>
      `<span class="tag mod ${num(m.val)<0?'neg':''}" title="${esc(F()[m.stat]||'')}">${L()[m.stat]||m.stat} ${num(m.val)>0?'+':''}${fmt(num(m.val))}</span>`).join('');
  }
  function statTxt(it){
    const d = FichaCombate.armaDanoTxt(it);
    const df = defValor(it);
    return [d ? `Daño ${d}` : '', df ? `Def ${df > 0 ? '+' : ''}${fmt(df)}` : '', `Peso ${fmt(num(it.peso))}`].filter(Boolean).join(' · ');
  }
  function filaHtml(it, boton){
    const tierColor = TIER_COLOR[it.tier] || '';
    return `<div class="equipo-fila">
    ${thumb(it)}
    <div class="equipo-info">
      <div class="cat-nombre"${tierColor ? ` style="color:${tierColor}"` : ''}>${esc(it.nombre)}</div>
      <div class="cat-meta">${esc(statTxt(it))}</div>
      <div class="imeta">${modTags(it.mods)}</div>
    </div>
    <button type="button" class="mini" data-view="inventario:${it.id}">Ver</button><button type="button" class="mini" data-edit="inventario:${it.id}">Editar</button>
    ${boton}
  </div>`;
  }
  function html(S, o){
    o = o || {};
    const lupa = clave => (o.lupa && typeof lupaBotonHtml === 'function') ? lupaBotonHtml(clave) : '';
    const sl = slots(S);
    const equipados = (S.inventario || []).filter(i => i.equipado);
    const izq = sl.map(sd => {
      const puestos = equipados.filter(i => sd.cats.includes(i.tipoItem));
      return `<div class="equipo-slot">
      <div class="equipo-slot-cab"><span>${esc(sd.label)}</span><span class="hint">${fmt(sd.usado)} / ${fmt(sd.max)}</span></div>
      ${puestos.length ? puestos.map(it => filaHtml(it, `<button type="button" class="mini" data-toggle="${it.id}" title="Pasarlo a la mochila">Sacar</button>`)).join('') : '<div class="hint equipo-vacio">Vacío</div>'}
    </div>`;
    }).join('');
    const mochila = (S.inventario || []).filter(i => !i.equipado && SLOT_DEFS.some(sd => sd.cats.includes(i.tipoItem)));
    const der = SLOT_DEFS.map(sd => {
      const items = mochila.filter(i => sd.cats.includes(i.tipoItem));
      if(!items.length) return '';
      return `<div class="equipo-slot">
      <div class="equipo-slot-cab"><span>${esc(sd.label)}</span></div>
      ${items.map(it => {
        const info = slotOcupado(S, it);
        return filaHtml(it, `${typeof Intercambio !== 'undefined' ? Intercambio.botonDar(it) + Intercambio.botonDespojos(it) : ''}${aManoBoton(S, it)}<button type="button" class="mini on" data-toggle="${it.id}" title="${info && info.ocupado ? 'El slot está lleno: te deja reemplazar o comparar' : 'Equipar'}">${info && info.ocupado ? 'Cambiar…' : 'Equipar'}</button>`);
      }).join('')}
    </div>`;
    }).join('');
    const cEq = FichaCalculo.calcular(S);
    const crgEq = Number.isNaN(cEq.final.crgmax) ? 0 : cEq.final.crgmax;
    const pesoEq = `<div class="equipo-peso">Peso equipado <b>${fmt(cEq.pesoEquipado)}</b> / ${fmt(crgEq)}${cEq.sobrecarga > 0 ? ` · <span style="color:var(--danger)">te pasás por ${fmt(cEq.sobrecarga)}</span>` : ''}</div>`;
    // Resumen arriba de todo (2026-09-27): qué hay en cada mano (nombre + efecto) y Defensa/Resistencia a crítico con su 🔍.
    const manos = equipados.filter(i => ['arma_1m', 'arma_2m', 'escudo_1m', 'escudo_2m'].includes(i.tipoItem));
    const manoEfecto = it => esc((it.detalle || '').trim() || statTxt(it) || 'Sin efecto');
    const manosHtml = manos.length
      ? manos.map(it => `<div class="equipo-mano"><div class="equipo-mano-nombre">${esc(it.nombre)}</div><div class="hint">${manoEfecto(it)}</div></div>`).join('')
      : '<div class="hint equipo-vacio">Nada en las manos</div>';
    const resumen = `<div class="equipo-resumen">
    <div class="equipo-manos">${manosHtml}</div>
    <div class="botonera-defensa">
      <div class="botonera-tile bt-info" title="Defensa (no se tira)">
        ${lupa('defensa:def')}
        <span class="bt-label">Defensa</span><span class="bt-value">${Number.isNaN(cEq.final.def) ? '?' : fmt(cEq.final.def)}</span>
      </div>
      <div class="botonera-crit">
        <div class="botonera-crit-t">Resistencia a críticos</div>
        <div class="botonera-crit-grid">
          ${TIPOS_IDS.map(id => `
          <div class="botonera-tile bt-info" title="${esc(F()[id])} (no se tira)">
            ${lupa(`defensa:${id}`)}
            <span class="bt-label">${esc(L()[id])}</span><span class="bt-value">${Number.isNaN(cEq.final[id]) ? '?' : fmt(cEq.final[id])}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
    return resumen + pesoEq + `<div class="equipo-cols">
    <div><h4 class="equipo-tit">Equipado</h4>${izq}</div>
    <div><h4 class="equipo-tit">Mochila${typeof Intercambio !== 'undefined' ? ` <button type="button" class="mini" data-ix-abrir-dar="" title="Pasarle a otro personaje un ítem (también pociones y trofeos), DDE o despojos, o convertir un ítem en despojos (♻)">🤝 Pasar · ♻</button>` : ''}</h4>${der || '<div class="hint">No hay nada equipable en la mochila.</div>'}</div>
  </div>`;
  }
  // El cuerpo de «el slot está lleno»: Reemplazar cada uno de los equipados del mismo tipo, o Comparar. null si no hay con qué.
  function slotLlenoHtml(S, it){
    const info = slotOcupado(S, it);
    if(!info || !info.equipados.length) return null;
    const slotDef = SLOT_DEFS.find(sd => sd.cats.includes(it.tipoItem));
    return `
    <div class="hint" style="margin-bottom:10px">${esc(slotDef.label)} no tiene lugar para <b>${esc(it.nombre)}</b>. Ya tenés equipado:</div>
    ${info.equipados.map(e => `<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:6px">
      <b>${esc(e.nombre)}</b>
      <button type="button" class="btn" data-reemplazar="${e.id}:${it.id}">Reemplazar</button>
    </div>`).join('')}
    <button type="button" class="btn" data-slot-comparar="${it.id}" style="width:100%;margin-top:8px">Comparar</button>`;
  }
  // La tabla de Comparar: el ítem contra uno equipado del mismo tipo (se elige si hay más de uno). null si no hay con qué comparar.
  function compararHtml(S, item, equipadoId, o){
    o = o || {};
    const precioHtml = o.precioHtml || (it => `<b>${fmt(num(it.precioCompra))} DDE</b>`);
    const info = slotOcupado(S, item);
    const equipados = info ? info.equipados : [];
    const equipado = equipados.find(e => e.id === equipadoId) || equipados[0];
    if(!equipado) return null;
    const statsEq = statsComparables(equipado);
    const statsNuevo = statsComparables(item);
    const claves = [...new Set([...Object.keys(statsEq), ...Object.keys(statsNuevo)])];
    const elegirHtml = equipados.length > 1 ? `<div class="comparar-elegir">
    ${equipados.map(e => `<button type="button" class="${e.id===equipado.id?'activo':''}" data-comparar-elegir="${e.id}">${esc(e.nombre)}</button>`).join('')}
  </div>` : '';
    const pesoEq = num(equipado.peso), pesoNuevo = num(item.peso);
    const pesoCls = pesoNuevo < pesoEq ? 'mejora' : pesoNuevo > pesoEq ? 'empeora' : '';
    const filaPeso = `<tr><td>Peso</td><td>${fmt(pesoEq)}</td><td class="${pesoCls}">${fmt(pesoNuevo)}${pesoNuevo<pesoEq?' ▲':pesoNuevo>pesoEq?' ▼':''}</td></tr>`;
    const filasHtml = filaPeso + claves.map(k => {
      const ve = statsEq[k] || 0, vn = statsNuevo[k] || 0;
      const cls = vn > ve ? 'mejora' : vn < ve ? 'empeora' : '';
      const label = STAT_COMPARABLE_LABEL[k] || L()[k] || k;
      return `<tr><td>${esc(label)}</td><td>${fmt(ve)}</td><td class="${cls}">${fmt(vn)}${vn>ve?' ▲':vn<ve?' ▼':''}</td></tr>`;
    }).join('');
    return {equipadoId: equipado.id, html: `
    ${elegirHtml}
    <div class="comparar-cabeceras">
      <div class="comparar-cabecera">
        <div class="cat-nombre">${esc(equipado.nombre)} <span class="hint">(equipado)</span></div>
        <div class="cat-meta">Peso ${fmt(num(equipado.peso))}</div>
      </div>
      <div class="comparar-cabecera">
        <div class="cat-nombre">${esc(item.nombre)}</div>
        <div class="cat-meta">${precioHtml(item)} · Peso ${fmt(num(item.peso))}</div>
      </div>
    </div>
    <table class="comparar-tabla">
      <thead><tr><th>Stat</th><th>Equipado</th><th>Nuevo</th></tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>
    ${(S.inventario || []).some(x => x.id === item.id && !x.equipado) ? `<button type="button" class="btn primary" data-reemplazar="${equipado.id}:${item.id}" style="width:100%;margin-top:12px">Reemplazar ${esc(equipado.nombre)}</button>` : ''}
  `};
  }

  return {SLOT_DEFS, TIER_COLOR, STAT_COMPARABLE_LABEL, CATEGORIAS, CATEGORIA_LABEL, ranuras, mochilaUsada, capMochila, BASE_CINTURON, cinturonUsado, capCinturon, cinturonLibre, cuantasEntran, opcionesCinturon, alCinturon, textoAlCinturon, aManoCap, aManoEntra, alternarAMano, slots, slotOcupado, defValor, statsComparables, conCosto, equipar, reemplazar,
    modTags, thumb, statTxt, html, slotLlenoHtml, compararHtml};
})();
