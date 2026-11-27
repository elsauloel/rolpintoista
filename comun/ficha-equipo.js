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
  // ¿Esta pantalla muestra la calidad de los ítems? Solo el GM (dueño, 2026-10-07/08: «que los jugadores no vean la calidad: que juzguen de
  // acuerdo a lo que sientan y lo que les venga bien»). La usan la tienda, el filtro, la mochila, el botín, el intercambio y los editores.
  const veCalidad = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const SLOT_DEFS = [
    {id:'cabeza', label:'Cabeza', cats:['cabeza'], max:1},
    {id:'torso_blanda', label:'Armadura blanda', cats:['armadura_blanda'], max:1},
    {id:'torso_rigida', label:'Armadura rígida', cats:['armadura_rigida'], max:1},
    {id:'manos', label:'Manos (guantes / defensa)', cats:['manos'], max:1},   // los títulos de las dos ranuras de manos (dueño, 2026-11-25: «se confunden»)
    {id:'manos_arma', label:'Manos (armas, escudos y otros)', cats:['arma_1m','arma_2m','escudo_1m','escudo_2m'], max:2, peso:{arma_1m:1, arma_2m:2, escudo_1m:1, escudo_2m:2}},
    {id:'anillos', label:'Anillos', cats:['anillos'], max:2},
    {id:'pies', label:'Pies', cats:['pies'], max:1},
    {id:'piernas', label:'Piernas', cats:['piernas'], max:1},
    {id:'cinturon', label:'Cinturón', cats:['cinturon'], max:1},
    {id:'mochila', label:'Mochila', cats:['mochila'], max:1},   // un solo cinturón y una sola mochila puestos (2026-09-25)
    {id:'carcaj', label:'Carcaj', cats:['carcaj'], max:1},   // 🏹 las flechas especiales (2026-10-09)
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
    {id:'manos', label:'Manos (guantes / defensa)', defensivo:true},
    {id:'piernas', label:'Piernas', defensivo:true},
    {id:'cabeza', label:'Cabeza', defensivo:true},
    {id:'pies', label:'Pies', defensivo:true},
    {id:'cinturon', label:'Cinturón', defensivo:true},
    {id:'mochila', label:'Mochila', defensivo:true},
    {id:'carcaj', label:'Carcaj'},
    {id:'anillos', label:'Anillos'},
    {id:'otros', label:'Otros'},
    {id:'consumibles', label:'Consumibles'},
  ];
  const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map(c=>[c.id, c.label]));
  // Lo que ocupa un ítem en la mochila (dueño, 2026-10-05, P158): al menos 1 ranura, salvo que el ítem diga lo contrario (`sinRanura: true`);
  // una pila de algo apilable (consumibles, trofeos iguales) ocupa 1 por pila. Antes había armas y piezas con 0 (no ocupaban lugar).
  // (2026-11-23, P312) Las cuentas viven en FichaCalculo, que las usa para el sobrepeso: cada ranura de más de la mochila pesa 1.
  const ranuras = i => FichaCalculo.ranurasItem(i);
  // Lo que ocupa la mochila (con el Morral de cazador, los trofeos no ocupan: 2026-10-05).
  const mochilaUsada = S => FichaCalculo.mochilaUsadaDe(S, FichaCalculo.calcular(S).final.morral);
  const capMochila = S => FichaCalculo.capMochilaDe(S, FichaCalculo.calcular(S).final.capmochila);
  /* ⚖ ¿Cómo queda el sobrepeso si a este personaje le llegan `items` a la mochila? Se prueba en una copia (no toca S).
     → {usada, cap, pasada, antes, despues, cuenta} (antes/despues: el sobrepeso; cuenta: {peso, ranuras, crg} con lo recibido). */
  function siRecibe(S, items){
    const c0 = FichaCalculo.calcular(S);
    const S2 = {...S, inventario: [...(S.inventario || []), ...(items || []).filter(Boolean).map(i => ({...i, equipado: false}))]};
    const c = FichaCalculo.calcular(S2), cap = FichaCalculo.capMochilaDe(S2, c.final.capmochila), usada = FichaCalculo.mochilaUsadaDe(S2, c.final.morral);
    return {usada, cap, pasada: cap > 0 && usada > cap, antes: c0.sobrecarga, despues: c.sobrecarga,
      cuenta: {peso: c.pesoEquipado, ranuras: c.ranurasDeMas, crg: Number.isNaN(c.final.crgmax) ? 0 : num(c.final.crgmax)}};
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
    if(!it) return {movidas: 0, quedan: 0, libre: cinturonLibre(S), noEntran: 0};
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
    // noEntran: las que se pidieron y no entraron (por el cinturón lleno). `quedan` puede ser más: con «→ Cinturón» se pide 1 y el resto
    // de la pila se queda en la mochila porque no se pidió, no porque no entre (cola de pruebas, 2026-11-24).
    return {movidas, quedan: (it.consumible ? Math.max(0, num(it.unidades)) : (movidas ? 0 : 1)), libre: cinturonLibre(S), noEntran: Math.max(0, quiere - movidas)};
  }
  // El aviso de un paso al cinturón (lo mismo en la ficha y en el mapa). «Lleno» solo cuando de verdad algo no entró (o quedó justo lleno).
  function textoAlCinturon(S, it, r){
    const cuenta = `${cinturonUsado(S)}/${capCinturon(S)}`;
    if(!r.movidas) return `${it.nombre}: no entra, el cinturón está lleno (${cuenta})`;
    const unid = k => k === 1 ? '1 unidad' : k + ' unidades';
    const pasaron = `${it.nombre}: ${r.movidas === 1 ? '1 unidad pasó' : r.movidas + ' unidades pasaron'} al cinturón (${cuenta})`;
    const noEntran = r.noEntran === undefined ? 0 : num(r.noEntran);
    if(noEntran > 0) return `${pasaron} · ${unid(noEntran)} no ${noEntran === 1 ? 'entró' : 'entraron'}: el cinturón está lleno y ${noEntran === 1 ? 'queda' : 'quedan'} en la mochila`;
    const quedan = num(r.quedan);
    return pasaron + (quedan ? ` · ${quedan === 1 ? 'queda 1' : 'quedan ' + quedan} en la mochila` : '') + (num(r.libre) <= 0 ? ' · el cinturón quedó lleno' : '');
  }

  /* ---------- Vaina (cinturón) y Correas laterales (mochila), 2026-10-05 ----------
     Un arma (vaina o correa) o un escudo (solo correa) que está «a mano» (`aMano`) se equipa sin gastar No2; y uno equipado, si queda una
     vaina o correa libre, se guarda ahí sin gastar No2. Cuántas hay: los stats `vainas` y `correas`. Fuera de combate no cuesta nada igual. */
  const esEscudo = it => String((it && it.tipoItem) || '').startsWith('escudo');
  // Todo lo que va en la mano (2026-11-01, dueño: «en la correa pueden ir armas o escudos, cualquier cosa que vaya en la mano: talismanes, armas
  // especiales, todo»): armas de una y dos manos (las varitas son arma_1m) y escudos (los orbes y talismanes son escudo_1m). La vaina del cinturón,
  // las armas; la correa de la mochila, cualquiera de las dos cosas (aManoEntra). Lo usa también el intercambio (recibir «a la vaina / correa»).
  const aManoApto = it => !!it && (FichaCombate.esArma(it.tipoItem) || esEscudo(it) || (FichaCombate.esMano && FichaCombate.esMano(it.tipoItem)));
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
  // Cuánto ocupa una pieza en su lugar: en las manos, lo de dos manos 2; un escudo atado al antebrazo, nada (2026-11-03: se lleva con dos armas).
  function pesoEnLugar(sd, i){
    if(sd.id === 'manos_arma' && i && i.antebrazo && /^escudo_/.test(String(i.tipoItem || ''))) return 0;
    return sd.peso ? (sd.peso[i.tipoItem] || 1) : 1;
  }
  function slots(S){
    const equipados = (S.inventario || []).filter(i => i.equipado);
    return SLOT_DEFS.map(sd => {
      let usado = 0;
      equipados.forEach(i => {
        if(!sd.cats.includes(i.tipoItem)) return;
        usado += pesoEnLugar(sd, i);
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
    const propio = pesoEnLugar(slotDef, item);
    // Lo equipado en ese lugar (2026-10-22, dueño: Comparar no andaba con las armas): antes solo lo del mismo tipo exacto, así una varita de una mano
    // no se comparaba con la espada de dos manos que tenías puesta. Primero lo del mismo tipo, después lo demás del mismo lugar.
    const mismoLugar = (S.inventario || []).filter(i => i.equipado && slotDef.cats.includes(i.tipoItem));
    const equipados = [...mismoLugar.filter(i => i.tipoItem === item.tipoItem), ...mismoLugar.filter(i => i.tipoItem !== item.tipoItem)];
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
    if(FichaCombate.esArma(item.tipoItem) && !(item.especial && !num(item.tipoDado))){   // una varita (arma especial sin Tipo) no pega con dados (2026-10-22)
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
    const costo = ui.modoCombate() ? veces * Combatiente.conExtenuado(S.efectos, FichaCalculo.IT2.nitrosEquipar) : 0;   // + Extenuado, por cada acción
    if(!costo){ accion(); return; }
    const pagar = forzar => {
      const gasto = forzar && costo > num(S.nitros) ? FichaAcciones.gastoNitrosForzado(S, costo, pasado) : costo;
      S.nitros = num(S.nitros) - gasto;
      if(typeof FichaAcciones !== 'undefined' && FichaAcciones.tormentaPj) for(let i = 0; i < veces; i++) FichaAcciones.tormentaPj(S, costo / veces, infinitivo, ui);   // ⛈ Atormentado: cada acción por separado
      if(ui.alPagar) ui.alPagar();   // la ficha redibuja los No2
      accion();
      ui.toast(`−${fmt(gasto)} No2 (equipar en combate)`);
    };
    if(costo > num(S.nitros)) ui.avisarSinNitros(costo, infinitivo, () => pagar(true));
    else pagar(false);
  }
  /* 🏹 El carcaj (2026-10-09, dueño; docs/ideas-arcos-flechas.md): una pieza propia del equipo (`tipoItem: 'carcaj'`, `capFlechas`, de fábrica 10)
     que guarda las flechas especiales adentro (`carcaj.flechas` = pilas de ítems con `flecha`). Las flechas comunes son ilimitadas. Se disparan solo
     desde el carcaj equipado; pasarlas de la mochila al carcaj (o al revés) es gratis fuera de combate y cuesta como equipar en combate. */
  const esFlecha = it => !!(it && it.flecha);
  const carcajReal = S => (S.inventario || []).find(i => i && i.tipoItem === 'carcaj' && i.equipado) || null;
  /* 🏹 El carcaj incluido (2026-11-20, dueño: «que cualquier jugador tenga por default un carcaj de 5 slot para virotes/flechas especiales incluído,
     sin peso adicional, por cargar cualquier arco o ballesta»): con un arco o una ballesta equipados y SIN carcaj puesto, el personaje tiene uno
     de 5 lugares que no es un ítem (no pesa, no ocupa el lugar de Carcaj ni la mochila). Sus flechas viven en `S.carcajIncluido` (pilas, como las de
     `carcaj.flechas`; viaja con lo demás del personaje, sin campo nuevo en las reglas). `carcajDe` lo devuelve cuando no hay uno de verdad, así
     todo lo que ya usa el carcaj (pasar, sacar, gastar, «¿Qué flecha?», levantar del piso) anda igual. Solo personajes. */
  const CAP_CARCAJ_INCLUIDO = 5;
  const tieneArcoOBallesta = S => typeof Combatiente !== 'undefined' && (S.inventario || []).some(i => i && i.equipado && !!Combatiente.municionDe(i));
  const CARCAJ_BASICO_NOMBRE = 'Carcaj básico';   // nombre confirmado por el dueño (2026-11-20: «es el carcaj básico»); antes decía «Carcaj incluido»
  const carcajIncluido = S => ({incluido: true, id: 'carcaj-incluido', nombre: CARCAJ_BASICO_NOMBRE, capFlechas: CAP_CARCAJ_INCLUIDO,
    get flechas(){ return S.carcajIncluido || []; },
    set flechas(v){ if(Array.isArray(v) && v.length) S.carcajIncluido = v; else delete S.carcajIncluido; }});
  const carcajDe = S => carcajReal(S) || (tieneArcoOBallesta(S) ? carcajIncluido(S) : null);
  // Lo que quedó en el incluido sin arco ni ballesta (se lo sacaron por un camino que no avisa): se sigue viendo en Equipo, para pasarlo a la mochila.
  const carcajHuerfano = S => !carcajDe(S) && (S.carcajIncluido || []).length ? carcajIncluido(S) : null;
  // + el Carcaj integrado de una ballesta (o un arma de rango) equipada (`carcajExtra`, 2026-10-11): solo si se pasa el personaje.
  const carcajExtraDe = S => S ? (S.inventario || []).filter(i => i && i.equipado && i.armaDeRango).reduce((a, i) => a + Math.max(0, Math.round(num(i.carcajExtra))), 0) : 0;
  const capCarcaj = (c, S) => c ? Math.max(1, Math.round(num(c.capFlechas)) || 10) + carcajExtraDe(S) : 0;
  const carcajUsado = c => c ? (c.flechas || []).reduce((a, f) => a + Math.max(0, num(f.unidades) || 1), 0) : 0;
  const flechasDelCarcaj = S => { const c = carcajDe(S); return c ? (c.flechas || []).filter(f => num(f.unidades) > 0) : []; };
  const nuevoId = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  // Mueve una pila (sin cobrar ni avisar): de la mochila al carcaj lo que entre → cuántas pasaron; del carcaj a la mochila, toda → cuántas.
  function pilaAlCarcaj(S, c, it){
    const tiene = Math.max(1, num(it.unidades) || 1), mover = Math.max(0, Math.min(capCarcaj(c, S) - carcajUsado(c), tiene));
    if(!mover) return 0;
    const pila = (c.flechas || []).find(f => f.nombre === it.nombre);
    if(pila) pila.unidades = num(pila.unidades) + mover;
    else{ const f = structuredClone(it); f.id = nuevoId('fl-'); f.unidades = mover; delete f.equipado; c.flechas = [...(c.flechas || []), f]; }
    it.unidades = tiene - mover;
    if(num(it.unidades) <= 0) S.inventario = S.inventario.filter(x => x !== it);
    return mover;
  }
  function pilaALaMochila(S, c, f){
    const u = Math.max(1, num(f.unidades) || 1);
    c.flechas = (c.flechas || []).filter(x => x !== f);
    const pila = (S.inventario || []).find(x => esFlecha(x) && x.nombre === f.nombre && !x.equipado);
    if(pila) pila.unidades = num(pila.unidades) + u;
    else S.inventario = [...(S.inventario || []), {...structuredClone(f), id: nuevoId('it-'), unidades: u}];
    return u;
  }
  const TODO_CARCAJ = '*';   // «Cargar todo lo que entre» / «Vaciar a la mochila» (dueño, 2026-11-20): cada pila se cobra como siempre (una acción de equipar en combate)
  const sueltasDe = S => (S.inventario || []).filter(i => esFlecha(i) && !i.equipado && !i.enMesa && !i.reservado);
  function alCarcaj(S, id, ui){
    const c = carcajDe(S), donde = c && c.incluido ? CARCAJ_BASICO_NOMBRE : 'carcaj';
    if(id === TODO_CARCAJ){
      if(!c) return true;
      // Las pilas que van a entrar, en orden, hasta llenar.
      const van = pilasQueEntran(S, c);
      if(!van.length){ ui.toast(sueltasDe(S).length ? `${c.nombre} está lleno (${fmt(carcajUsado(c))} / ${fmt(capCarcaj(c, S))})` : 'No hay flechas ni virotes especiales en la mochila'); return true; }
      conCosto(S, van.length, `cargar el ${donde}`, `cargó el ${donde}`, () => {
        const total = van.reduce((a, it) => a + pilaAlCarcaj(S, c, it), 0), quedan = sueltasDe(S).reduce((a, it) => a + Math.max(1, num(it.unidades) || 1), 0);
        ui.cambio(['inventario']);
        ui.toast(`🏹 ${fmt(total)} al ${donde} (${fmt(carcajUsado(c))} / ${fmt(capCarcaj(c, S))})${quedan ? ` · no entran más: ${fmt(quedan)} quedan en la mochila` : ''}`);
      }, ui);
      return true;
    }
    const it = (S.inventario || []).find(x => x.id === id);
    if(!it || !esFlecha(it)) return false;
    if(!c){ ui.toast('Equipá un arco, una ballesta o un carcaj para llevar flechas especiales'); return true; }
    const tiene = Math.max(1, num(it.unidades) || 1);
    if(capCarcaj(c, S) - carcajUsado(c) <= 0){ ui.toast(`${c.nombre} está lleno (${fmt(carcajUsado(c))} / ${fmt(capCarcaj(c, S))})`); return true; }
    conCosto(S, 1, `pasar ${it.nombre} al carcaj`, `pasó ${it.nombre} al carcaj`, () => {
      const mover = pilaAlCarcaj(S, c, it);
      ui.cambio(['inventario']);
      ui.toast(`${fmt(mover)} ${it.nombre} al ${donde}${mover < tiene ? ` (no entran más: ${fmt(tiene - mover)} quedan en la mochila)` : ''}`);
    }, ui);
    return true;
  }
  function delCarcaj(S, flechaId, ui){
    const c = carcajDe(S) || carcajHuerfano(S);
    if(flechaId === TODO_CARCAJ){
      const pilas = c ? (c.flechas || []).slice() : [];
      if(!pilas.length) return true;
      conCosto(S, pilas.length, `vaciar el carcaj`, `vació el carcaj`, () => {
        const total = pilas.reduce((a, f) => a + pilaALaMochila(S, c, f), 0);
        ui.cambio(['inventario']);
        ui.toast(`🎒 ${fmt(total)} del carcaj a la mochila`);
      }, ui);
      return true;
    }
    const f = c && (c.flechas || []).find(x => x.id === flechaId);
    if(!f) return false;
    conCosto(S, 1, `sacar ${f.nombre} del carcaj`, `sacó ${f.nombre} del carcaj`, () => {
      const u = pilaALaMochila(S, c, f);
      ui.cambio(['inventario']);
      ui.toast(`${fmt(u)} ${f.nombre} a la mochila`);
    }, ui);
    return true;
  }
  // Gasta una flecha del carcaj (al dispararla). Devuelve la flecha (una copia, con unidades 1) o null.
  function gastarFlecha(S, flechaId){
    const c = carcajDe(S), f = c && (c.flechas || []).find(x => x.id === flechaId);
    if(!f || num(f.unidades) <= 0) return null;
    f.unidades = num(f.unidades) - 1;
    if(f.unidades <= 0) c.flechas = c.flechas.filter(x => x !== f);
    return {...structuredClone(f), unidades: 1};
  }
  // La vuelta de una flecha gastada en un duelo cancelado (2026-10-28, dueño): a su pila del carcaj (mismo id o nombre) o como pila nueva; sin
  // carcaj, a la mochila. → 'carcaj' | 'mochila' | false.
  function devolverFlecha(S, f){
    if(!f || !f.nombre) return false;
    const c = carcajDe(S);
    if(c){
      const pila = (c.flechas || []).find(x => x.id === f.id) || (c.flechas || []).find(x => x.nombre === f.nombre);
      if(pila) pila.unidades = num(pila.unidades) + 1;
      else c.flechas = [...(c.flechas || []), {...structuredClone(f), unidades: 1}];
      return 'carcaj';
    }
    const pila = (S.inventario || []).find(x => esFlecha(x) && x.nombre === f.nombre && !x.equipado);
    if(pila) pila.unidades = num(pila.unidades) + 1;
    else S.inventario = [...(S.inventario || []), {...structuredClone(f), id: nuevoId('it-'), unidades: 1}];
    return 'mochila';
  }
  /* 🏹 Las flechas del carcaj incluido no se pierden (2026-11-20): al equipar un carcaj de verdad pasan a ese (las que no entren, a la mochila); sin
     arco ni ballesta equipados, vuelven a la mochila. → el aviso para mostrar ('' si no hubo nada que mover). Lo llaman equipar y reemplazar. */
  function acomodarCarcaj(S){
    const inc = (S.carcajIncluido || []).filter(f => f && num(f.unidades) > 0);
    const real = carcajReal(S);
    if(!real && tieneArcoOBallesta(S)) return '';
    delete S.carcajIncluido;
    if(!inc.length) return '';
    let pasaron = 0, aMochila = 0;
    inc.forEach(f => {
      let u = num(f.unidades);
      const entra = real ? Math.max(0, Math.min(u, capCarcaj(real, S) - carcajUsado(real))) : 0;
      if(entra > 0){
        real.flechas = real.flechas || [];
        const pila = real.flechas.find(x => x.nombre === f.nombre);
        if(pila) pila.unidades = num(pila.unidades) + entra; else real.flechas.push({...structuredClone(f), unidades: entra});
        u -= entra; pasaron += entra;
      }
      if(u > 0){
        const pila = (S.inventario || []).find(x => esFlecha(x) && x.nombre === f.nombre && !x.equipado);
        if(pila) pila.unidades = num(pila.unidades) + u; else S.inventario = [...(S.inventario || []), {...structuredClone(f), id: nuevoId('it-'), unidades: u}];
        aMochila += u;
      }
    });
    const cuantas = n => n === 1 ? '1 flecha o virote especial' : `${fmt(n)} flechas o virotes especiales`;
    if(real) return `🏹 Del ${CARCAJ_BASICO_NOMBRE} a ${real.nombre}: ${cuantas(pasaron)}${aMochila ? ` · no entraron ${fmt(aMochila)}: a la mochila` : ''}`;
    return `🏹 Sin arco ni ballesta: ${cuantas(aMochila)} del ${CARCAJ_BASICO_NOMBRE} ${aMochila === 1 ? 'volvió' : 'volvieron'} a la mochila`;
  }
  // El texto de lo que hace una flecha (su detalle sin el encabezado «Flecha especial…:»).
  // Lo que hace + su No2 (una sola vez: el detalle del catálogo ya lo trae, se saca y se arma de `flecha.no2`).
  const flechaTxt = f => {
    const t = String((f && f.detalle) || '').replace(/^(?:Flecha|Virote) especial[^:]*:\s*/, '').replace(/\.$/, '').replace(/\s*·\s*\+\d+ No2 al dispararl[ao]/, '');   // también los virotes (2026-10-10)
    const n = num(f && f.flecha && f.flecha.no2);
    return t + (n ? ` · +${fmt(n)} No2 al dispararla` : '');
  };
  /* 🏹 Cuánto cuesta en No2 cargar o descargar (dueño, 2026-11-20: «que los botones de cargar o descargar te digan cuántos No2 va a costar la
     acción»): lo mismo que cobra `conCosto` (una acción de equipar por cada clase de flecha que se pasa, + Extenuado; nada fuera de combate). */
  const costoCarcaj = (S, pilas, enCombate) => enCombate ? Math.max(0, pilas) * Combatiente.conExtenuado(S.efectos, FichaCalculo.IT2.nitrosEquipar) : 0;
  // Las pilas de la mochila que pasa «Cargar todo lo que entre» (en orden, hasta llenar): las mismas que cobra `alCarcaj(S, '*')`.
  function pilasQueEntran(S, c){
    let libre = c ? capCarcaj(c, S) - carcajUsado(c) : 0;
    return sueltasDe(S).filter(it => { const entra = libre > 0; libre -= Math.max(1, num(it.unidades) || 1); return entra; });
  }
  /* El carcaj en «Equipo y mochila»: UN solo recuadro, en dos partes (dueño, 2026-11-20: «un recuadro donde diga Carcaj y una descripción de qué
     carcaj tenés equipado con sus características y cuántos slots tiene ocupados, y dentro de ese mismo recuadro abajo que diga Proyectiles
     especiales, que valga tanto para virotes como para flechas»).
     · ARRIBA, el carcaj equipado como una pieza: con arco o ballesta y sin otro, el «Carcaj básico» (5 lugares, no pesa ni ocupa lugar); con uno
       mejor equipado desde la mochila, la fila de ese (Ver, Editar, Sacar) con su descripción y sus características; sin nada, cómo conseguir uno.
     · ABAJO, «Proyectiles especiales»: lo que hay ADENTRO del carcaj («→ Mochila») y, aparte, lo que está en la mochila para cargar («→ Carcaj»,
       «Cargar todo lo que entre»). Cada botón dice cuántos No2 cuesta (`o.enCombate`). */
  const CARCAJ_BASICO_TXT = 'Viene con tu arco o tu ballesta. Para llevar más, equipá un carcaj mejor desde la mochila.';
  function carcajHtml(S, o){
    const enCombate = !!(o && o.enCombate);
    const real = carcajReal(S), huerfano = carcajHuerfano(S), c = carcajDe(S) || huerfano, sueltas = (S.inventario || []).filter(i => esFlecha(i) && !i.equipado);
    const fila = (f, boton) => `<div class="equipo-fila">${thumb(f)}<div class="equipo-info"><div class="iname">${esc(f.nombre)} <span class="hint">×${fmt(num(f.unidades) || 1)}</span></div><div class="hint">${esc(flechaTxt(f))}</div></div>${boton}</div>`;
    const un = f => Math.max(1, num(f.unidades) || 1), cuantas = n => n > 1 ? ` (${fmt(n)})` : '';
    const precio = pilas => { const n = costoCarcaj(S, pilas, enCombate); return `<span class="carcaj-costo" style="opacity:.85;font-weight:400"> · ${n ? `${fmt(n)} No2` : 'gratis'}</span>`; };
    const precioTit = pilas => { const n = costoCarcaj(S, pilas, enCombate); return enCombate ? (n ? ` Cuesta ${fmt(n)} No2 (en combate).` : ' No cuesta No2.') : ' Fuera de combate no cuesta No2.'; };
    const libre = c && !huerfano ? Math.max(0, capCarcaj(c, S) - carcajUsado(c)) : 0;
    const cuenta = c ? (huerfano ? fmt(carcajUsado(c)) : `${fmt(carcajUsado(c))} / ${fmt(capCarcaj(c, S))}`) : '';
    // --- Arriba: qué carcaj tenés ---
    const extra = c && !huerfano ? carcajExtraDe(S) : 0;
    const lugares = c ? `${fmt(capCarcaj(c, huerfano ? null : S))} lugares${extra ? ` (${fmt(capCarcaj(c))} del carcaj + ${fmt(extra)} de tu arma)` : ''}` : '';
    const ocupados = c ? `<b class="carcaj-ocupados">${huerfano ? `${cuenta} adentro` : `${cuenta} ocupados`}</b>` : '';
    let pieza;
    if(real) pieza = filaHtml(real, `<button type="button" class="mini" data-toggle="${real.id}" title="Pasarlo a la mochila">Sacar</button>`)
      + `<div class="hint carcaj-desc" style="margin:2px 0 4px">${real.detalle ? `<div>${esc(real.detalle)}</div>` : ''}<div class="carcaj-carac">${lugares} · ${ocupados}</div></div>`;
    else if(c) pieza = `<div class="equipo-fila carcaj-basico"><div class="equipo-info"><div class="cat-nombre">${esc(c.nombre)}${huerfano ? ' <span class="hint">(sin arco ni ballesta)</span>' : ''}</div>`
      + `<div class="cat-meta">${lugares} · no pesa ni ocupa lugar</div></div></div>`
      + `<div class="hint carcaj-desc" style="margin:2px 0 4px">${huerfano ? 'Te quedaron proyectiles guardados sin arco ni ballesta: pasalos a la mochila o volvé a equipar el arma.' : CARCAJ_BASICO_TXT}<div class="carcaj-carac">${ocupados}</div></div>`;
    else pieza = `<div class="hint equipo-vacio">Sin carcaj. Al equipar un arco o una ballesta te aparece solo el ${CARCAJ_BASICO_NOMBRE} (${fmt(CAP_CARCAJ_INCLUIDO)} lugares, no pesa ni ocupa lugar); un carcaj mejor se equipa desde la mochila.</div>`;
    // --- Abajo: los proyectiles especiales ---
    const nDentro = c ? (c.flechas || []).length : 0, entran = c && !huerfano ? pilasQueEntran(S, c).length : 0;
    const todoMochila = nDentro > 1 ? `<button type="button" class="mini" data-delcarcaj="${TODO_CARCAJ}" title="Pasa todo lo del carcaj a la mochila.${precioTit(nDentro)}">Vaciar a la mochila${precio(nDentro)}</button>` : '';
    const todoCarcaj = c && !huerfano && sueltas.length > 1 && libre > 0 && entran ? `<button type="button" class="mini on" data-alcarcaj="${TODO_CARCAJ}" title="Pasa al carcaj todos los proyectiles especiales que entren.${precioTit(entran)}">Cargar todo lo que entre${precio(entran)}</button>` : '';
    const sub = (txt, boton) => `<div class="hint carcaj-sub" style="margin:6px 0 2px;display:flex;justify-content:space-between;align-items:center;gap:8px"><span>${txt}</span>${boton || ''}</div>`;
    const dentro = !c ? '' : sub('🏹 Adentro del carcaj', todoMochila)
      + (nDentro ? c.flechas.map(f => fila(f, `<button type="button" class="mini" data-delcarcaj="${f.id}" title="Pasarlas a la mochila.${precioTit(1)}">→ Mochila${cuantas(un(f))}${precio(1)}</button>`)).join('')
        : '<div class="hint equipo-vacio">Ninguno todavía. Las flechas y los virotes comunes no se gastan; los especiales se compran en la Talabartería.</div>');
    const fuera = sueltas.length ? `<div class="carcaj-mochila" style="margin-top:8px;padding-top:2px;border-top:1px dashed var(--line, #4a3b33)">`
      + sub(`🎒 En la mochila${c && !huerfano ? ', para cargar' : ''}`, todoCarcaj)
      + sueltas.map(f => { const puede = c && !huerfano && libre; return fila(f, `<button type="button" class="mini on" data-alcarcaj="${f.id}" title="${!c || huerfano ? 'Equipá un arco, una ballesta o un carcaj' : libre ? 'Pasarlas al carcaj.' + precioTit(1) : 'El carcaj está lleno'}"${puede ? '' : ' disabled'}>→ Carcaj${cuantas(Math.min(un(f), libre || un(f)))}${puede ? precio(1) : ''}</button>`); }).join('') + '</div>' : '';
    const hayBotones = nDentro || (sueltas.length && c && !huerfano && libre);
    const unaAccion = costoCarcaj(S, 1, true);
    const nota = !hayBotones ? '' : `<div class="hint carcaj-nota" style="margin-top:6px">${enCombate ? `⚔ En combate, cargar o descargar cuesta ${fmt(unaAccion)} No2 por cada clase de proyectil que pasás (como equipar).` : 'Fuera de combate, cargar y descargar no cuesta No2.'}</div>`;
    const proyectiles = c || sueltas.length ? `<div class="carcaj-proyectiles" style="margin-top:8px;padding-top:6px;border-top:1px solid var(--line, #4a3b33)">
        <div class="equipo-slot-cab carcaj-titulo2" style="margin-bottom:2px"><span title="Flechas y virotes especiales: los comunes no se gastan ni ocupan lugar">✨ Proyectiles especiales</span></div>
        ${dentro}${fuera}${nota}</div>` : '';
    return `<div class="equipo-slot equipo-carcaj">
      <div class="equipo-slot-cab"><span>🏹 Carcaj</span>${c ? `<span class="hint" title="Proyectiles especiales que lleva / los que entran">${cuenta}</span>` : ''}</div>
      ${pieza}${proyectiles}
    </div>`;
  }
  function equipar(S, id, ui){
    const it = (S.inventario || []).find(x => x.id === id);
    if(!it) return false;
    if(it.enMesa || it.reservado){ ui.toast(`Está ofrecido a ${it.reservadoPara || 'otro personaje'}: cancelá la oferta primero (🤝)`); return true; }   // 🤝 comun/intercambio.js
    if(!it.equipado && it.trofeo){ ui.toast('Un trofeo no se equipa: se vende en una tienda o se convierte en despojos'); return true; }
    if(!it.equipado && esFlecha(it)) return alCarcaj(S, id, ui);   // una flecha especial va al carcaj, no al cinturón
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
        const propio = pesoEnLugar(slotDef, it);   // 🐞 (2026-11-03, tanda e) el escudo atado al antebrazo ocupa 0: antes equipar lo contaba como 1 y pedía reemplazar
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
      const avisoCarcaj = acomodarCarcaj(S);   // 🏹 las flechas del carcaj incluido, al de verdad o a la mochila (2026-11-20)
      ui.cambio(['inventario']);
      if(aMano && ui.modoCombate()) ui.toast(`${it.nombre}: ${it.equipado ? 'sale de la vaina' : 'a la vaina'}, sin gastar No2`);
      if(avisoCarcaj) ui.toast(avisoCarcaj);
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
      const avisoCarcaj = acomodarCarcaj(S);   // 🏹 (2026-11-20)
      ui.cambio(['inventario'], {reemplazo: true});
      ui.toast(avisoCarcaj || `${nuevo.nombre} equipado en lugar de ${viejo.nombre}`);
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
  // 🔧 La durabilidad y la armadura rota de la pieza (2026-10-12: la ventana del mapa no la mostraba; la ficha tiene además sus − y +).
  function durHtml(it){
    if(!FichaCalculo.durableItem(it)) return '';
    const max = FichaCalculo.durMax(it), act = FichaCalculo.durActual(it), ar = FichaCalculo.armRotaDe(it), armadura = FichaCalculo.esArmaduraItem(it), pierde = FichaCalculo.pierdeDefPorRotura(it);
    // Las piezas de armadura y los escudos (abollados) pierden Defensa por la rotura, sin pasar de la que dan.
    const defPieza = (it.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0), menos = pierde ? Math.min(ar, Math.max(0, defPieza)) : 0;
    const rota = !ar ? '' : ` · <span style="white-space:nowrap">${armadura ? 'Armadura rota' : 'abollado'} ×${fmt(ar)}${menos ? ` (−${fmt(menos)} Defensa)` : ''}</span>`;
    const color = act <= 0 ? '#e06060' : act <= 1 ? '#e0a040' : '';
    const est = act <= 0 ? ' · ROTO (sin efectos)' : act <= 1 ? ' · a punto de romperse' : '';
    return `<div class="hint equipo-dur"${color ? ` style="color:${color};font-weight:700"` : ''} title="Durabilidad: ${esc(Combatiente.durTexto(it) || String(max))}.${pierde ? ` Cada punto ${armadura ? 'de armadura rota' : 'abollado'} le baja 1 a la Defensa de esta pieza.` : ''} Se repara fuera de combate (herrero de una tienda).">🔧 ${fmt(act)}/${fmt(max)}${rota}${est}</div>`;
  }
  function filaHtml(it, boton, attrs){
    const tierColor = veCalidad() ? (TIER_COLOR[it.tier] || '') : '';   // el color del nombre delataba la calidad
    return `<div class="equipo-fila"${attrs || ''}>
    ${thumb(it)}
    <div class="equipo-info">
      <div class="cat-nombre"${tierColor ? ` style="color:${tierColor}"` : ''}>${esc(it.nombre)}</div>
      <div class="cat-meta">${esc(statTxt(it))}</div>
      <div class="imeta">${modTags(it.mods)}</div>
      ${durHtml(it)}
    </div>
    <button type="button" class="mini" data-view="inventario:${it.id}">Ver</button><button type="button" class="mini" data-edit="inventario:${it.id}">Editar</button>
    ${boton}
  </div>`;
  }
  /* ---------- 🧍 El Equipo en una silueta del cuerpo (2026-11-25, dueño: «avancemos así»; boceto en docs/bocetos/equipo-silueta.*) ----------
     Un contorno propio (SVG, sin imágenes de terceros) con cada lugar encima: Cabeza; Armadura blanda y rígida en el torso; Cinturón; Piernas; Pies;
     Guantes (la ranura «Manos (guantes / defensa)») y Anillos junto a cada mano; Mano 1 y Mano 2 a los costados (la ranura «Manos (armas, escudos y
     otros)»: lo de dos manos ocupa las dos); la Espalda arriba (Mochila equipada, Carcaj). Ocupado = verde con el nombre; vacío = punteado.
     Con el mouse, el detalle (lo de la fila de antes: números, bonos, durabilidad, Armadura rota); con clic, un menú con Ver / Editar / Sacar (los
     mismos botones `data-view` / `data-edit` / `data-toggle`: cada pantalla los atiende como siempre). Arrastrar un ítem de la mochila a un lugar
     aprieta su botón «Equipar» (silArrastrar, abajo): la misma regla, el mismo costo y el mismo «Reemplazar o Comparar». */
  const SIL_SVG = `<svg class="sil-svg" width="560" height="640" viewBox="0 0 560 640" aria-hidden="true">
    <g fill="var(--sil-cuerpo, #2a2228)" stroke="var(--sil-borde, #8a7465)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">
      <circle cx="280" cy="92" r="46"/>
      <path d="M262 142 Q262 152 250 156 Q226 160 214 172 L150 300 Q140 322 158 330 Q176 336 186 318 L222 246 L222 560 Q222 584 244 584 Q266 584 266 560 L266 400 Q266 386 280 386 Q294 386 294 400 L294 560 Q294 584 316 584 Q338 584 338 560 L338 246 L374 318 Q384 336 402 330 Q420 322 410 300 L346 172 Q334 160 310 156 Q298 152 298 142 Z"/>
    </g></svg>`;
  const SIL_CSS = `
    .sil-cuerpo{position:relative;width:560px;max-width:100%;height:650px;margin:0 0 8px;border:1px solid var(--line-soft, #3a2f38);border-radius:10px;background:var(--panel2, #1d171d)}
    .sil-svg{position:absolute;left:0;top:0;pointer-events:none}
    .sil-zona{position:absolute;font:600 10px "Space Mono",ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--muted, #a8998f)}
    .sil-slot{position:absolute;box-sizing:border-box;border-radius:8px;padding:4px 6px;font-size:11.5px;line-height:1.2;text-align:center}
    .sil-slot>b{display:block;font:600 9.5px "Space Mono",ui-monospace,monospace;letter-spacing:.07em;text-transform:uppercase;opacity:.85;margin-bottom:1px}
    .sil-slot.lleno{background:#2f4a3a;border:1.5px solid #6fbf8a;color:#eafff0}
    .sil-slot.vacio{background:rgba(29,23,29,.85);border:1.5px dashed #6a5a63;color:var(--muted, #a8998f)}
    .sil-slot.vacio i{font-style:normal;opacity:.75}
    .sil-slot.basico{background:rgba(70,62,68,.6);border:1px solid #9a8f96;color:#ddd3d8}
    .sil-slot.basico .sil-nom{font-weight:500}
    .sil-slot.casi{border-color:#e0a040;background:#4a3a22;box-shadow:0 0 0 1px #e0a04055}
    .sil-slot.roto{border-color:#e06060;background:#4a2a2a;box-shadow:0 0 0 1px #e0606055}
    .sil-grietas{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;border-radius:inherit}
    .sil-slot>b,.sil-it>summary,.sil-slot>.sil-nom,.sil-slot>.sil-insignia{position:relative}
    .sil-slot.casi .sil-nom,.sil-slot.casi>b{text-shadow:0 0 3px #4a3a22,0 0 6px #4a3a22}
    .sil-slot.roto .sil-nom,.sil-slot.roto>b,.sil-slot.roto .sil-insignia{text-shadow:0 0 2px #4a2a2a,0 0 4px #4a2a2a,0 0 7px #4a2a2a}
    .sil-ico{position:absolute;right:-10px;top:-10px;z-index:6;width:22px;height:22px;box-sizing:border-box;border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:12px;line-height:1;cursor:pointer;border:2px solid #1d171d;box-shadow:0 1px 5px rgba(0,0,0,.6);transition:transform .12s}
    .sil-ico-casi{background:#e0a45a;color:#2a1d12;font-weight:700}
    .sil-ico-roto{background:#ffffff;border-color:#1d171d;font-size:12px}
    .sil-ico:hover,.sil-ico:focus{transform:scale(1.15);outline:none}
    .sil-ico>.sil-tip{left:0;right:auto}
    .sil-der .sil-ico>.sil-tip{left:auto;right:0}
    .sil-ico:hover>.sil-tip,.sil-ico:focus>.sil-tip{display:block}
    .sil-arriba .sil-ico>.sil-tip{top:auto;bottom:calc(100% + 6px)}
    .sil-ico-fila+.sil-ico-fila{margin-top:6px;padding-top:6px;border-top:1px solid #4a3b33}
    .sil-slot.mano{width:96px;min-height:118px;display:flex;flex-direction:column;justify-content:center}
    .sil-slot.dos{background:repeating-linear-gradient(135deg,#2f4a3a 0 8px,#284034 8px 16px)}
    .sil-slot.sil-acepta{outline:2px dashed #e0a45a;outline-offset:2px}
    .sil-slot.sil-sobre{outline:2px solid #e0a45a;background:#4a3f2a}
    .sil-slot.sil-no{outline:2px solid #e06060;background:#4a2a2a}
    .sil-item{margin-top:2px}
    .sil-it{display:block}
    .sil-slot:has(details.sil-it){cursor:pointer}
    .sil-it>summary{list-style:none;cursor:pointer;border-radius:5px;padding:1px 2px}
    .sil-it>summary::-webkit-details-marker{display:none}
    .sil-it>summary:hover{background:rgba(255,255,255,.08)}
    .sil-nom{font-weight:600}
    .sil-insignia{display:block;font-size:10px;opacity:.9;margin-top:1px}
    .sil-tip,.sil-menu{position:absolute;left:0;top:calc(100% + 6px);z-index:30;width:280px;box-sizing:border-box;text-align:left;
      background:var(--sil-tip, #262027);border:1px solid var(--brass, #e0a45a);border-radius:8px;padding:8px 10px;font-size:12px;line-height:1.35;
      color:var(--paper, #efe6dc);box-shadow:0 8px 24px #0009}
    .sil-der .sil-tip,.sil-der .sil-menu{left:auto;right:0}
    .sil-arriba .sil-tip,.sil-arriba .sil-menu{top:auto;bottom:calc(100% + 6px)}
    .sil-tip{display:none;pointer-events:none}
    .sil-item:hover>.sil-tip{display:block}
    .sil-item:has(details[open])>.sil-tip{display:none}
    .sil-tip-n{font-weight:700;font-size:13px;color:var(--brass, #e0a45a);margin-bottom:2px}
    .sil-tip-d{margin-top:4px;opacity:.9}
    .sil-tip .imeta{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
    .sil-tip .imeta .tag{white-space:nowrap;display:inline-block}
    .sil-menu{z-index:31;display:flex;flex-wrap:wrap;gap:5px;align-items:center;width:auto;min-width:200px}
    .sil-menu-n{flex-basis:100%;font-weight:700;color:var(--brass, #e0a45a)}
    .sil-ley{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 10px;font-size:11.5px;color:var(--muted, #a8998f)}
    .sil-ley span{display:inline-flex;gap:6px;align-items:center}
    .sil-ley i{display:inline-block;width:18px;height:11px;border-radius:3px}
    .sil-arr-hint{margin:0 0 8px}
    .equipo-fila[draggable="true"]{cursor:grab}
  `;
  // Mano 1 y Mano 2: lo mismo que FichaCombate.asignarManos (lo de dos manos en la 1; la «mano preferida»), sin los escudos atados al antebrazo
  // (no ocupan la mano: van aparte). Lo que sobre (más de lo que entra, de un dato raro) se muestra igual en la Mano 2, en rojo.
  function manosDeSilueta(equipados){
    const cats = SLOT_DEFS.find(sd => sd.id === 'manos_arma').cats;
    const enMano = equipados.filter(i => cats.includes(i.tipoItem));
    const antebrazo = enMano.filter(i => i.antebrazo && /^escudo_/.test(String(i.tipoItem || '')));
    const resto = enMano.filter(i => !antebrazo.includes(i));
    const dos = resto.find(i => i.tipoItem === 'arma_2m' || i.tipoItem === 'escudo_2m') || null;
    let m1 = [], m2 = [];
    if(dos){ m1 = [dos]; m2 = resto.filter(i => i !== dos); }
    else{
      const p1 = resto.find(a => String(a.manoPreferida) === '1');
      const p2 = resto.find(a => String(a.manoPreferida) === '2' && a !== p1);
      const libres = resto.filter(a => a !== p1 && a !== p2);
      const a1 = p1 || libres.shift() || null, a2 = p2 || libres.shift() || null;
      if(a1) m1 = [a1];
      if(a2) m2 = [a2];
      m2 = m2.concat(libres);
    }
    return {m1, m2, dos, antebrazo, cats};
  }
  const corto = (t, n) => { t = String(t || '').trim(); return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t; };
  // El detalle al pasar el mouse: lo mismo que la fila de antes (números, bonos, durabilidad y Armadura rota) y lo que hace, en corto.
  function silTipHtml(it, lugar){
    const tierColor = veCalidad() ? (TIER_COLOR[it.tier] || '') : '';
    return `<div class="sil-tip"><div class="sil-tip-n"${tierColor ? ` style="color:${tierColor}"` : ''}>${esc(it.nombre)}</div>
      <div class="hint">${esc([lugar, statTxt(it)].filter(Boolean).join(' · '))}</div>
      ${(it.mods || []).some(m => m.stat) ? `<div class="imeta">${modTags(it.mods)}</div>` : ''}${durHtml(it).replace(' · <span style="white-space:nowrap">', '<br><span style="white-space:nowrap">')}
      ${it.detalle ? `<div class="sil-tip-d">${esc(corto(it.detalle, 240))}</div>` : ''}
      <div class="hint" style="margin-top:4px">🖱 Clic: Ver / Editar / Sacar</div></div>`;
  }
  // Un ítem puesto: su nombre (clic = el menú) y su detalle (hover).
  function silItemHtml(it, lugar, insignia){
    return `<div class="sil-item"><details class="sil-it"><summary title=""><span class="sil-nom">${esc(it.nombre)}</span>${insignia ? `<span class="sil-insignia">${insignia}</span>` : ''}</summary>
      <div class="sil-menu"><span class="sil-menu-n">${esc(it.nombre)}</span>
        <button type="button" class="mini" data-view="inventario:${it.id}">Ver</button><button type="button" class="mini" data-edit="inventario:${it.id}">Editar</button><button type="button" class="mini" data-toggle="${it.id}" title="Pasarlo a la mochila">Sacar</button>
      </div></details>${silTipHtml(it, lugar)}</div>`;
  }
  // El estado del lugar según lo que tiene puesto: 'roto' si algo está roto, 'casi' (gastado) si le queda 1 punto o tiene Armadura rota.
  const silRoto = i => FichaCalculo.durableItem(i) && FichaCalculo.itemRoto(i);
  const silGastado = i => FichaCalculo.durableItem(i) && !FichaCalculo.itemRoto(i) && (FichaCalculo.durActual(i) <= 1 || FichaCalculo.armRotaDe(i) > 0);
  function silEstado(items){
    if(items.some(silRoto)) return 'roto';
    if(items.some(silGastado)) return 'casi';
    return '';
  }
  const silEstadoCls = items => { const e = silEstado(items); return e ? ' ' + e : ''; };
  /* 🩹 Las grietas (2026-11-25, dueño; boceto aprobado en charla): en SVG encima del recuadro, estiradas a su tamaño (viewBox 150×118 sin guardar
     proporción y el trazo que no se estira), sin imágenes. Gastado: finitas, entran solo desde los bordes y las esquinas (amarillo claro al 75 %).
     Roto: cruzan de lado a lado, con ramificaciones (rojo claro al 80 %). Pasan por detrás de las letras (el texto lleva un halo del color del
     fondo). Cada lugar elige una variante y la da vuelta según su nombre, para que no se vean todas iguales. */
  const GRIETAS = {
    casi: [
      ['M0 22 L9 25 L14 21 L22 27', 'M9 25 L12 33', 'M150 70 L141 73 L137 80 L128 82', 'M137 80 L139 88', 'M40 118 L43 109 L50 105', 'M118 0 L115 8 L120 14'],
      ['M0 0 L8 7 L11 14 L19 17', 'M8 7 L15 6', 'M150 40 L142 44 L139 51', 'M95 118 L97 110 L104 106 L108 109', 'M150 118 L143 111 L136 112'],
      ['M60 0 L63 8 L58 15', 'M63 8 L70 11', 'M0 84 L8 82 L13 88 L21 87', 'M150 14 L143 19 L140 27', 'M150 104 L141 101 L135 106']],
    roto: [
      ['M0 30 L18 36 L31 29 L47 44 L62 40 L74 58 L92 55 L104 72 L122 70 L135 86 L150 90', 'M74 58 L70 76 L78 92 L73 118', 'M47 44 L44 22 L53 0',
        'M104 72 L116 52 L130 46 L150 38', 'M18 36 L14 52 L22 66', 'M92 55 L98 30 L94 14'],
      ['M0 92 L16 84 L27 90 L44 72 L58 76 L71 58 L88 62 L101 44 L119 47 L133 28 L150 24', 'M71 58 L66 38 L74 20 L70 0', 'M44 72 L48 94 L41 118',
        'M101 44 L112 64 L128 70 L150 78', 'M16 84 L20 102 L12 118', 'M119 47 L124 26'],
      ['M30 0 L36 16 L29 30 L44 46 L40 62 L58 74 L54 92 L70 104 L68 118', 'M0 58 L20 54 L40 62', 'M58 74 L82 68 L98 80 L120 74 L134 88 L150 86',
        'M98 80 L102 100 L96 118', 'M36 16 L56 20 L66 8', 'M120 74 L126 54 L150 48']]};
  const silSemilla = t => { let h = 7; for(const c of String(t || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function grietasSvg(estado, clave){
    const lista = GRIETAS[estado]; if(!lista) return '';
    const h = silSemilla(clave), trazos = lista[h % lista.length];
    const vx = (h >> 3) & 1, vy = (h >> 4) & 1;
    const tr = vx || vy ? ` transform="matrix(${vx ? -1 : 1} 0 0 ${vy ? -1 : 1} ${vx ? 150 : 0} ${vy ? 118 : 0})"` : '';
    const col = estado === 'roto' ? 'stroke="#ff9a90" stroke-opacity=".8" stroke-width="1.6"' : 'stroke="#f3c27a" stroke-opacity=".75" stroke-width="1.4"';
    return `<svg class="sil-grietas sil-grietas-${estado}" viewBox="0 0 150 118" preserveAspectRatio="none" aria-hidden="true" fill="none" ${col} stroke-linecap="round" stroke-linejoin="round"><g${tr}>`
      + trazos.map(d => `<path d="${d}" vector-effect="non-scaling-stroke"/>`).join('') + '</g></svg>';
  }
  /* 💔 / ⚠ El iconito del estado (2026-11-25): adentro del recuadro, arriba a la derecha; con el mouse encima, lo que ya calcula el juego para cada
     pieza (estadoPieza: la durabilidad, si está rota y no da efectos, la Defensa que pierde por la Armadura rota, si le queda 1 punto). */
  function silIconoHtml(estado, items){
    const piezas = items.filter(estado === 'roto' ? silRoto : silGastado);
    if(!piezas.length) return '';
    const ico = estado === 'roto' ? '💔' : '⚠\uFE0E';   // el ⚠ como letra (no emoji amarillo) sobre el círculo ámbar
    const filas = piezas.map(it => { const e = estadoPieza(it);
      return `<div class="sil-ico-fila"><div class="sil-tip-n">${e.roto ? '💔' : '⚠'} ${esc(it.nombre)}</div>${e.lin.map(l => `<div>${l}</div>`).join('')}</div>`; }).join('');
    const pie = estado === 'roto' ? 'Se repara fuera de combate: el herrero de una tienda o el talento de reparar.' : 'Se repara fuera de combate: el herrero de una tienda, el talento de reparar o un Óleo reparador.';
    return `<span class="sil-ico sil-ico-${estado}" tabindex="0" aria-label="${estado === 'roto' ? 'Roto' : 'Gastado'}: ver el detalle">${ico}<span class="sil-tip sil-ico-tip">${filas}<div class="hint" style="margin-top:4px">${pie}</div></span></span>`;
  }
  // Un lugar de la silueta. o = {slot (id de SLOT_DEFS, para arrastrar), cats, titulo, items, lugar, pos: {left, top, w}, cls, vacio, insignia(it)}.
  function silSlotHtml(o){
    const items = o.items || [];
    const st = `left:${o.pos.left}px;top:${o.pos.top}px${o.pos.w ? `;width:${o.pos.w}px` : ''}`;
    const datos = o.cats ? ` data-sil-slot="${esc(o.slot)}" data-sil-cats="${esc(o.cats.join(','))}"` : '';
    const cuerpo = items.length ? items.map(it => silItemHtml(it, o.lugar, o.insignia ? o.insignia(it) : '')).join('') : (o.contenido || `<i>${esc(o.vacio || 'vacío')}</i>`);
    // Lo básico (2026-11-25): la mochila, el cinturón y el carcaj que vienen de base; ni vacío (punteado) ni un ítem (verde).
    const clase = items.length ? 'lleno' : o.contenido ? (o.basico ? 'basico' : 'lleno') : 'vacio';
    const estado = items.length ? silEstado(items) : '';
    const titulo = !items.length && (o.basico ? o.titleBasico || o.titleVacio : o.titleVacio);
    return `<div class="sil-slot ${clase}${estado ? ' ' + estado : ''}${o.cls ? ' ' + o.cls : ''}" style="${st}"${datos}${titulo ? ` title="${esc(titulo)}"` : ''}><b>${esc(o.titulo)}</b>`
      + `${estado ? grietasSvg(estado, o.titulo + '|' + items.map(i => i.id || i.nombre).join(',')) : ''}${cuerpo}${estado ? silIconoHtml(estado, items) : ''}</div>`;
  }
  function siluetaHtml(S, equipados){
    const de = id => { const sd = SLOT_DEFS.find(x => x.id === id); return {sd, items: equipados.filter(i => sd.cats.includes(i.tipoItem))}; };
    const lugar = id => SLOT_DEFS.find(x => x.id === id).label;
    const arr = 'Arrastrá acá un ítem de la mochila para equiparlo';
    const simple = (id, titulo, pos, cls) => { const d = de(id); return silSlotHtml({slot: id, cats: d.sd.cats, titulo, items: d.items, lugar: lugar(id), pos, cls, titleVacio: arr}); };
    const M = manosDeSilueta(equipados);
    const nDos = it => it.tipoItem === 'arma_2m' || it.tipoItem === 'escudo_2m';
    const mano1 = silSlotHtml({slot: 'manos_arma', cats: M.cats, titulo: 'Mano 1', items: M.m1, lugar: 'Mano 1', pos: {left: 20, top: 186}, cls: 'mano' + (M.dos ? ' dos' : ''),
      vacio: 'vacía', titleVacio: arr, insignia: it => nDos(it) ? '🤲 de dos manos: ocupa las dos' : ''});
    // Con algo de dos manos, la Mano 2 queda ocupada por lo mismo (y se ve: rayada, «↔ … (de dos manos)»).
    const mano2 = M.dos && !M.m2.length
      ? silSlotHtml({titulo: 'Mano 2', pos: {left: 442, top: 186}, cls: 'mano dos sil-der', items: [M.dos], lugar: 'Mano 1 y Mano 2', insignia: () => '↔ la misma de la Mano 1 (de dos manos)'})
      : silSlotHtml({slot: 'manos_arma', cats: M.cats, titulo: 'Mano 2', items: M.m2, lugar: 'Mano 2', pos: {left: 442, top: 186}, cls: 'mano sil-der' + (M.dos ? ' roto' : ''),
          vacio: 'vacía', titleVacio: arr, insignia: it => M.dos ? '⚠ no entra: la Mano 1 tiene algo de dos manos' : ''});
    const antebrazo = M.antebrazo.length ? silSlotHtml({titulo: '💪 Antebrazo', items: M.antebrazo, lugar: 'Atado al antebrazo (no ocupa la mano)', pos: {left: 20, top: 312, w: 90}}) : '';
    const anillos = de('anillos');
    const anillosHtml = silSlotHtml({slot: 'anillos', cats: anillos.sd.cats, titulo: `Anillos ${fmt(anillos.items.length)}/${fmt(anillos.sd.max)}`, items: anillos.items, lugar: 'Anillos',
      pos: {left: 360, top: 340, w: 96}, cls: 'sil-der', titleVacio: arr});
    // La espalda: la mochila equipada y el carcaj (el de verdad, o el «Carcaj básico» que viene con el arco: no es un ítem, no tiene menú).
    const carcaj = de('carcaj'), cInc = !carcaj.items.length ? carcajDe(S) : null, inc = cInc && cInc.incluido ? cInc : null;
    const lugaresInc = inc ? capCarcaj(inc, S) : 0;
    const carcajSlot = silSlotHtml({slot: 'carcaj', cats: carcaj.sd.cats, titulo: 'Espalda · Carcaj', items: carcaj.items, lugar: 'Carcaj', pos: {left: 430, top: 44, w: 110}, cls: 'sil-der', titleVacio: arr,
      basico: !!inc, titleBasico: `Viene de base con tu arco o tu ballesta (${fmt(lugaresInc)} lugares, no pesa ni ocupa lugar). Para llevar más, arrastrá acá un carcaj de la mochila.`,
      contenido: inc ? `<span class="sil-nom">${esc(CARCAJ_BASICO_NOMBRE)}</span><span class="sil-insignia">${fmt(lugaresInc)} lugares · viene con tu arma</span>` : ''});
    // La mochila y el cinturón: el equipado con sus ranuras; sin nada, lo que viene de base («Mochila básica · 20 ranuras», «Cinturón básico · 5 ranuras»,
    // con los números que usa el juego: S.caps y los bonos de lo puesto).
    const mochila = de('mochila'), cinturon = de('cinturon'), rMochila = capMochila(S), rCinturon = capCinturon(S);
    const ran = n => `${fmt(n)} ${n === 1 ? 'ranura' : 'ranuras'}`;
    const basico = (nombre, n) => `<span class="sil-nom">${esc(nombre)}</span><span class="sil-insignia">${ran(n)}</span>`;
    const mochilaSlot = silSlotHtml({slot: 'mochila', cats: mochila.sd.cats, titulo: 'Espalda · Mochila', items: mochila.items, lugar: 'Mochila (espalda)', pos: {left: 20, top: 44, w: 110},
      insignia: () => ran(rMochila), basico: true, contenido: basico('Mochila básica', rMochila),
      titleBasico: `La mochila que viene de base: ${ran(rMochila)}. Para llevar más, arrastrá acá una mochila de la mochila.`});
    const cinturonSlot = silSlotHtml({slot: 'cinturon', cats: cinturon.sd.cats, titulo: 'Cinturón', items: cinturon.items, lugar: lugar('cinturon'), pos: {left: 226, top: 298, w: 108},
      insignia: () => ran(rCinturon), basico: true, contenido: basico('Cinturón básico', rCinturon),
      titleBasico: `El cinturón que viene de base: ${ran(rCinturon)} para consumibles. Para llevar más, arrastrá acá un cinturón de la mochila.`});
    const ley = `<div class="sil-ley"><span><i style="background:#2f4a3a;border:1.5px solid #6fbf8a"></i>ocupado</span><span><i style="border:1.5px dashed #6a5a63"></i>vacío</span>
      <span><i style="background:rgba(70,62,68,.6);border:1px solid #9a8f96"></i>básico (viene de base)</span>
      <span title="Le queda 1 punto de durabilidad o tiene Armadura rota: pasá el mouse por el ⚠"><i style="background:#4a3a22;border:1.5px solid #e0a040"></i>gastado ⚠</span>
      <span title="Durabilidad en 0: no da ningún efecto hasta repararlo. Pasá el mouse por el 💔"><i style="background:#4a2a2a;border:1.5px solid #e06060"></i>roto 💔</span>
      <span>🖱 pasá el mouse: qué tiene · clic: Ver / Editar / Sacar</span>
      <span title="La ranura «Manos (armas, escudos y otros)»: 2 lugares; lo de dos manos ocupa los dos">✋ <b>Mano 1 / Mano 2</b>: armas, escudos y otros (lo que sostiene)</span>
      <span title="La ranura «Manos (guantes / defensa)»">🧤 <b>Guantes</b>: manos (guantes / defensa)</span></div>`;
    return `<div class="sil-cuerpo">${SIL_SVG}
      <div class="sil-zona" style="left:24px;top:168px">✋ En las manos</div>
      <div class="sil-zona" style="left:214px;top:14px">Equipado al cuerpo</div>
      ${mochilaSlot}
      ${carcajSlot}
      ${simple('cabeza', 'Cabeza', {left: 232, top: 66, w: 96})}
      ${mano1}${mano2}${antebrazo}
      ${simple('torso_blanda', 'Armadura blanda', {left: 222, top: 160, w: 116})}
      ${simple('torso_rigida', 'Armadura rígida', {left: 222, top: 224, w: 116})}
      ${cinturonSlot}
      ${simple('manos', 'Guantes', {left: 112, top: 340, w: 92})}
      ${anillosHtml}
      ${simple('piernas', 'Piernas', {left: 222, top: 440, w: 116})}
      ${simple('pies', 'Pies', {left: 206, top: 592, w: 148}, 'sil-arriba')}
    </div>${ley}`;
  }
  /* 🖱 Arrastrar de la mochila a un lugar (escuchas en el documento: andan también adentro del recuadro del mapa, que es un shadow DOM, por
     composedPath). Soltarlo en un lugar donde entra = apretar el «Equipar» de esa fila (la pantalla hace lo de siempre). Donde no entra, avisa. */
  const silArrastre = {fila: null, tipo: '', raiz: null};
  const silBuscar = (e, sel) => (e.composedPath ? e.composedPath() : []).find(el => el && el.matches && el.matches(sel)) || null;
  const silAcepta = (slot, tipo) => !!slot && String(slot.dataset.silCats || '').split(',').includes(tipo);
  function silLimpiar(){
    if(silArrastre.raiz) silArrastre.raiz.querySelectorAll('.sil-acepta, .sil-sobre').forEach(el => el.classList.remove('sil-acepta', 'sil-sobre'));
    silArrastre.fila = null; silArrastre.tipo = ''; silArrastre.raiz = null;
  }
  function silAvisar(t){ if(typeof toast === 'function') toast(t); }
  if(typeof document !== 'undefined' && !window.__silEscuchas){
    window.__silEscuchas = true;
    document.addEventListener('dragstart', e => {
      const fila = silBuscar(e, '[data-sil-arrastra]');
      if(!fila) return;
      silArrastre.fila = fila; silArrastre.tipo = fila.dataset.silTipo || ''; silArrastre.raiz = fila.getRootNode();
      try{ e.dataTransfer.setData('text/plain', fila.dataset.silArrastra); e.dataTransfer.effectAllowed = 'move'; }catch(err){ /* sin dataTransfer */ }
      silArrastre.raiz.querySelectorAll('[data-sil-slot]').forEach(sl => { if(silAcepta(sl, silArrastre.tipo)) sl.classList.add('sil-acepta'); });
    });
    document.addEventListener('dragover', e => {
      if(!silArrastre.fila) return;
      const slot = silBuscar(e, '[data-sil-slot]');
      if(!slot) return;
      e.preventDefault();
      try{ e.dataTransfer.dropEffect = silAcepta(slot, silArrastre.tipo) ? 'move' : 'none'; }catch(err){ /* nada */ }
      silArrastre.raiz.querySelectorAll('.sil-sobre').forEach(el => { if(el !== slot) el.classList.remove('sil-sobre'); });
      if(silAcepta(slot, silArrastre.tipo)) slot.classList.add('sil-sobre');
    });
    document.addEventListener('drop', e => {
      if(!silArrastre.fila) return;
      const slot = silBuscar(e, '[data-sil-slot]');
      if(!slot){ silLimpiar(); return; }
      e.preventDefault();
      const fila = silArrastre.fila, ok = silAcepta(slot, silArrastre.tipo);
      silLimpiar();
      if(!ok){
        const nombre = (fila.querySelector('.cat-nombre') || {}).textContent || 'Ese ítem';
        const titulo = (slot.querySelector('b') || {}).textContent || 'ese lugar';
        slot.classList.add('sil-no'); setTimeout(() => slot.classList.remove('sil-no'), 700);
        silAvisar(`${nombre.trim()} no va en ${titulo.trim()}`);
        return;
      }
      const boton = fila.querySelector('button[data-toggle]');
      if(boton) boton.click();
    });
    document.addEventListener('dragend', () => silLimpiar());
    // Un solo menú abierto a la vez; un clic afuera lo cierra.
    document.addEventListener('click', e => {
      const ruta = e.composedPath ? e.composedPath() : [];
      const raiz = ruta[0] && ruta[0].getRootNode ? ruta[0].getRootNode() : document;
      if(!raiz || !raiz.querySelectorAll) return;
      raiz.querySelectorAll('details.sil-it[open]').forEach(d => { if(!ruta.includes(d)) d.removeAttribute('open'); });
    }, true);
    // Un clic en cualquier parte del recuadro (no solo en el nombre) abre el menú del ítem, si el lugar tiene uno solo (dueño, 2026-11-27).
    document.addEventListener('click', e => {
      const ruta = e.composedPath ? e.composedPath() : [];
      const slot = ruta.find(n => n && n.classList && n.classList.contains('sil-slot'));
      if(!slot) return;
      if(ruta.some(n => n && n.classList && (n.classList.contains('sil-it') || n.classList.contains('sil-ico') || n.classList.contains('sil-menu')))) return;
      const ds = slot.querySelectorAll('details.sil-it');
      if(ds.length !== 1) return;
      ds[0].open = !ds[0].open;
    }, true);
  }
  function html(S, o){
    o = o || {};
    const lupa = clave => (o.lupa && typeof lupaBotonHtml === 'function') ? lupaBotonHtml(clave) : '';
    const sl = slots(S);
    const equipados = (S.inventario || []).filter(i => i.equipado);
    const izq = sl.filter(sd => sd.id !== 'carcaj').map(sd => {   // 🏹 el carcaj tiene su recuadro propio, uno solo (carcajHtml)
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
        // 🧍 Se puede arrastrar a un lugar de la silueta (2026-11-25): lo equipa con este mismo botón (silArrastrar).
        return filaHtml(it, `${typeof Intercambio !== 'undefined' ? Intercambio.botonDar(it, o && o.fichaId) + Intercambio.botonDespojos(it) : ''}${aManoBoton(S, it)}<button type="button" class="mini on" data-toggle="${it.id}" title="${info && info.ocupado ? 'El slot está lleno: te deja reemplazar o comparar' : 'Equipar'}">${info && info.ocupado ? 'Cambiar…' : 'Equipar'}</button>`,
          ` draggable="true" data-sil-arrastra="${esc(it.id)}" data-sil-tipo="${esc(it.tipoItem)}"`);
      }).join('')}
    </div>`;
    }).join('');
    const cEq = FichaCalculo.calcular(S);
    const crgEq = Number.isNaN(cEq.final.crgmax) ? 0 : cEq.final.crgmax;
    // ⚖ (2026-11-23, P312) con las ranuras de más de la mochila, que pesan 1 cada una
    const pesoEq = `<div class="equipo-peso">Peso equipado <b>${fmt(cEq.pesoEquipado)}</b>${cEq.ranurasDeMas > 0 ? ` + <b>${fmt(cEq.ranurasDeMas)}</b> ranura${cEq.ranurasDeMas === 1 ? '' : 's'} de más en la mochila = <b>${fmt(cEq.pesoTotal)}</b>` : ''} / ${fmt(crgEq)}${cEq.sobrecarga > 0 ? ` · <span style="color:var(--danger)">te pasás por ${fmt(cEq.sobrecarga)} (sobrepeso)</span>` : ''}</div>`;
    // Resumen arriba de todo (2026-09-27): qué hay en cada mano (nombre + efecto) y Defensa/Resistencia a crítico con su 🔍.
    const manos = equipados.filter(i => ['arma_1m', 'arma_2m', 'escudo_1m', 'escudo_2m'].includes(i.tipoItem));
    const manoEfecto = it => esc((it.detalle || '').trim() || statTxt(it) || 'Sin efecto');
    const manosHtml = manos.length
      ? manos.map(it => `<div class="equipo-mano"><div class="equipo-mano-nombre">${esc(it.nombre)}</div><div class="hint">${manoEfecto(it)}</div></div>`).join('')
      : '<div class="hint equipo-vacio">Nada en las manos</div>';
    const resumen = `<div class="equipo-resumen">
    <div class="equipo-manos">${manosHtml}</div>
    <div class="botonera-defensa">
      <div style="display:flex;flex-direction:column;gap:8px;min-width:0">
        <div class="botonera-tile bt-info" title="Defensa: se resta al daño físico (no se tira)">
          ${lupa('defensa:def')}
          <span class="bt-label">Defensa</span><span class="bt-value">${Number.isNaN(cEq.final.def) ? '?' : fmt(cEq.final.def)}</span>
        </div>
        <div class="botonera-tile bt-info" title="Defensa especial: se resta al daño especial (arcano, eléctrico, fuego, hielo, tóxico, ácido), como la Defensa al físico (no se tira)">
          ${lupa('defensa:armadmg')}
          <span class="bt-label">Def. especial</span><span class="bt-value">${Number.isNaN(cEq.final.armadmg) ? '?' : fmt(cEq.final.armadmg || 0)}</span>
        </div>
      </div>
      <div class="botonera-crit">
        <div class="botonera-crit-t">Resistencia a críticos</div>
        <div class="botonera-crit-grid">
          ${TIPOS_IDS.filter(id => id !== 'tipo5').map(id => `
          <div class="botonera-tile bt-info" title="${esc(F()[id])} (no se tira)">
            ${lupa(`defensa:${id}`)}
            <span class="bt-label">${esc(L()[id])}</span><span class="bt-value">${Number.isNaN(cEq.final[id]) ? '?' : fmt(cEq.final[id])}</span>
          </div>`).join('')}
        </div>
      </div>
      <div style="grid-column:-2 / -1;min-width:0">${Combatiente.resElementalesHtml(el => cEq.final['res' + el], el => lupa(`defensa:res${el}`))}</div>   <!-- debajo de la de crítico (la última columna) -->
    </div>
  </div>`;
    // 🧍 Lo equipado, en una silueta del cuerpo (2026-11-25, boceto aprobado por el dueño: docs/bocetos/equipo-silueta.*). La lista de antes
    // (`izq`, slot por slot) queda armada pero no se muestra: la silueta tiene lo mismo (hover = el detalle de la fila; clic = Ver / Editar / Sacar).
    void izq;
    return `<style>${SIL_CSS}</style>` + resumen + estadoEquipoHtml(S, equipados) + pesoEq + repararHtml(S, !!(o.enCombate)) + `<div class="equipo-cols">
    <div><h4 class="equipo-tit">Equipado</h4>${siluetaHtml(S, equipados)}${carcajHtml(S, o)}</div>
    <div><h4 class="equipo-tit">Mochila${typeof Intercambio !== 'undefined' ? ` <button type="button" class="mini" data-ix-abrir-dar="" title="Pasarle a otro personaje un ítem (también pociones y trofeos), DDE o despojos, o convertir un ítem en despojos (♻). En combate, solo a un aliado al lado (caído o no).">${esc(Intercambio.textoPasar ? Intercambio.textoPasar(o && o.fichaId) : '🤝 Pasar · ♻')}</button>` : ''}</h4>${der ? `<div class="hint sil-arr-hint">🖱 Arrastrá un ítem a su lugar en la silueta para equiparlo (si entra ahí).</div>${der}` : '<div class="hint">No hay nada equipable en la mochila.</div>'}</div>
  </div>`;
  }
  /* 🔧 Reparar sin herrero (dueño, 2026-10-12; P99): el talento «Reparar equipo» y el Óleo reparador. Solo fuera de combate. Cada punto
     reparado devuelve también 1 de armadura rota (o de abolladura) de esa pieza.
     - Talento (cualquier talento con «repar» en el nombre): 2 despojos por punto, sin tirada; una pieza ROTA cuesta el doble hasta quedar entera
       (como el herrero). Tope: 3 puntos por nivel del talento por día (`S.reparadoTalento`; lo vacía «⏳ Pasar de día», vtt-hexgrid/js/41).
     - Óleo reparador (`oleoReparador: N` en el consumible): N puntos a UNA pieza dañada; una pieza ROTA no (esa, solo el herrero o el talento).
       Se gasta una unidad. */
  const DESPOJOS_POR_PUNTO = 2, TOPE_POR_NIVEL = 3, RECARGO_ROTO = 2;   // el tope: 3 por nivel por día (dueño, 2026-10-12)
  const talentoReparar = S => (S.sociales || []).find(x => x && /repar/i.test(String(x.nombre || ''))) || null;
  const topeTalento = S => { const t = talentoReparar(S); return t ? TOPE_POR_NIVEL * Math.max(1, FichaBotonera.nivelSocial(t)) : 0; };
  const restoTalento = S => Math.max(0, topeTalento(S) - Math.max(0, num(S.reparadoTalento)));
  const oleosDe = S => [...(S.cinturon || []), ...(S.inventario || [])].filter(x => x && num(x.oleoReparador) > 0 && num(x.unidades ?? 1) > 0);
  const faltanDe = it => Math.max(0, FichaCalculo.durMax(it) - FichaCalculo.durActual(it));
  const danadas = S => (S.inventario || []).filter(i => FichaCalculo.durableItem(i) && faltanDe(i) > 0);
  const factorRoto = it => FichaCalculo.itemRoto(it) || it.reparoRoto ? RECARGO_ROTO : 1;
  function repararPuntos(it, q){
    q = Math.min(q, faltanDe(it));
    if(q <= 0) return 0;
    if(FichaCalculo.itemRoto(it)) it.reparoRoto = true;
    it.dur = FichaCalculo.durActual(it) + q; it.durV = Combatiente.DUR_VERSION;
    if(it.dur >= FichaCalculo.durMax(it)) delete it.reparoRoto;
    it.armRota = Math.max(0, FichaCalculo.armRotaDe(it) - q);
    return q;
  }
  /* 🛠 El estado del equipo (2026-10-29, dueño: «abajo del primer set de información del equipo, si parte del equipo está roto, que aclare bien
     cómo está la condición de durabilidad, con detalles»): cada pieza puesta que esté gastada, dañada o rota, con su durabilidad, la Defensa que da
     ahora y qué significa. */
  /* El estado de una pieza durable, en renglones (lo usan «🛠 Estado del equipo» y el iconito 💔 / ⚠ de la silueta): la durabilidad, si está
     ROTA (no da ningún efecto), la Defensa que le baja la Armadura rota / lo abollado y el aviso de que le queda 1 punto. */
  function estadoPieza(it){
    const max = FichaCalculo.durMax(it), act = FichaCalculo.durActual(it), ar = FichaCalculo.armRotaDe(it), roto = act <= 0, esEsc = FichaCalculo.esEscudoItem(it);
    const d0 = (it.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0), menos = FichaCalculo.pierdeDefPorRotura(it) ? Math.min(ar, Math.max(0, d0)) : 0;
    const lin = [`Durabilidad <b>${fmt(act)} de ${fmt(max)}</b>`];
    if(roto) lin.push('<b>ROTO</b>: sigue ocupando su lugar, pero <b>no da ningún efecto</b> (ni Defensa ni bonos) hasta repararlo');
    else{
      if(menos > 0) lin.push(`${esEsc ? 'abollado' : 'Armadura rota'} ×${fmt(ar)}: da <b>Defensa ${fmt(d0 - menos)}</b> en vez de ${fmt(d0)} (−${fmt(menos)}) hasta que lo reparen`);
      if(act === 1) lin.push('⚠ le queda 1 punto: el próximo lo rompe y se anulan todos sus efectos');
    }
    return {max, act, ar, roto, esEsc, menos, lin};
  }
  function estadoEquipoHtml(S, equipados){
    const dur = (equipados || []).filter(FichaCalculo.durableItem);
    const mal = dur.filter(it => FichaCalculo.durActual(it) < FichaCalculo.durMax(it) || FichaCalculo.armRotaDe(it) > 0);
    if(!mal.length) return dur.length ? '<div class="equipo-estado ok">✔ <b>Estado del equipo:</b> todo lo que tenés puesto está entero.</div>' : '';
    const filas = mal.map(it => {
      const {act, roto, menos, esEsc, lin} = estadoPieza(it);
      return `<div class="equipo-estado-fila${roto ? ' roto' : act <= 1 ? ' casi' : ''}"><div class="equipo-estado-nombre">${roto ? '💥' : menos > 0 ? (esEsc ? '🛡' : '🔨') : '🔧'} ${esc(it.nombre)}</div><div>${lin.join(' · ')}</div></div>`;
    }).join('');
    return `<div class="equipo-estado"><div class="equipo-estado-tit">🛠 Estado del equipo</div>${filas}
      <div class="hint" style="margin-top:6px">Cada punto de Romper armadura baja 1 la durabilidad de la pieza y 1 la Defensa que da, hasta que la reparen. Si la durabilidad llega a 0, la pieza se rompe y se anulan todos sus efectos. Se repara fuera de combate: el herrero de una tienda, el talento de reparar o un Óleo reparador.</div></div>`;
  }
  function repararHtml(S, enCombate){
    const tal = talentoReparar(S), oleos = oleosDe(S);
    if(!tal && !oleos.length) return '';
    const lista = danadas(S), desp = Math.floor(num(S.loot && S.loot.normal)), resto = restoTalento(S);
    const oleo = oleos[0], nOleo = oleo ? num(oleo.oleoReparador) : 0, uds = oleos.reduce((a, x) => a + num(x.unidades ?? 1), 0);
    const cab = [tal ? `talento <b>${esc(tal.nombre)}</b>: te quedan <b>${fmt(resto)} de ${fmt(topeTalento(S))}</b> puntos hoy · ${DESPOJOS_POR_PUNTO} despojos por punto (una pieza rota, el doble) · tenés ${fmt(desp)} despojos` : '',
      oleo ? `🧴 <b>${esc(oleo.nombre)}</b> ×${fmt(uds)}: ${fmt(nOleo)} puntos a una pieza dañada (no a una rota)` : ''].filter(Boolean).join('<br>');
    const filas = lista.map(it => {
      const roto = FichaCalculo.itemRoto(it), f = factorRoto(it), costo = DESPOJOS_POR_PUNTO * f;
      const bTal = tal ? `<button type="button" class="mini" data-reptal="${esc(it.id)}"${enCombate || resto < 1 || desp < costo ? ' disabled' : ''} title="Reparar 1 punto con tu talento">🔧 +1 · ${fmt(costo)} despojos</button>` : '';
      const bOleo = oleo ? `<button type="button" class="mini" data-repoleo="${esc(it.id)}"${enCombate || roto ? ' disabled' : ''} title="${roto ? 'Una pieza rota no se arregla con óleo: herrero o talento' : `Usar ${esc(oleo.nombre)}: +${fmt(nOleo)} puntos`}">🧴 +${fmt(nOleo)}</button>` : '';
      return `<div class="equipo-fila"><div class="equipo-info"><div class="cat-nombre">${esc(it.nombre)}${it.equipado ? ' <span class="hint">(equipado)</span>' : ''}</div>${durHtml(it)}</div>${bTal}${bOleo}</div>`;
    }).join('');
    return `<div class="equipo-slot equipo-reparar"><div class="equipo-slot-cab"><span>🔧 Reparar</span></div>
      <div class="hint" style="margin:4px 0 6px">${cab}</div>
      ${enCombate ? '<div class="hint" style="color:#FF9E7E">⚔ No se puede reparar durante el combate.</div>' : ''}
      ${filas || '<div class="hint equipo-vacio">Todo tu equipo está entero.</div>'}</div>`;
  }
  function repararTalento(S, itemId, ui){
    if(ui.modoCombate && ui.modoCombate()){ ui.toast('No se puede reparar durante el combate'); return false; }
    const tal = talentoReparar(S), it = (S.inventario || []).find(x => x.id === itemId);
    if(!tal || !it){ ui.toast('No tenés el talento de reparar o esa pieza ya no está'); return false; }
    if(restoTalento(S) < 1){ ui.toast(`Ya reparaste los ${fmt(topeTalento(S))} puntos de tu talento por hoy: se renueva al pasar el día`); return false; }
    const costo = DESPOJOS_POR_PUNTO * factorRoto(it), desp = Math.floor(num(S.loot && S.loot.normal));
    if(desp < costo){ ui.toast(`No te alcanzan los despojos: 1 punto cuesta ${fmt(costo)} y tenés ${fmt(desp)}`); return false; }
    if(!repararPuntos(it, 1)){ ui.toast(`${it.nombre} ya está entera`); return false; }
    S.loot.normal = num(S.loot.normal) - costo;
    S.reparadoTalento = Math.max(0, num(S.reparadoTalento)) + 1;
    ui.toast(`🔧 Reparaste 1 punto de ${it.nombre} con ${tal.nombre} (−${fmt(costo)} despojos) · 🔧 ${fmt(FichaCalculo.durActual(it))}/${fmt(FichaCalculo.durMax(it))}`);
    ui.cambio(['inventario', 'general', 'otros']);
    return true;
  }
  function usarOleo(S, itemId, ui){
    if(ui.modoCombate && ui.modoCombate()){ ui.toast('El óleo se usa fuera de combate'); return false; }
    const it = (S.inventario || []).find(x => x.id === itemId), oleo = oleosDe(S)[0];
    if(!it || !oleo){ ui.toast('No tenés óleo o esa pieza ya no está'); return false; }
    if(FichaCalculo.itemRoto(it)){ ui.toast(`${it.nombre} está rota: el óleo no alcanza (herrero o talento de reparar)`); return false; }
    const q = repararPuntos(it, num(oleo.oleoReparador));
    if(!q){ ui.toast(`${it.nombre} ya está entera`); return false; }
    oleo.unidades = num(oleo.unidades ?? 1) - 1;
    if(oleo.unidades <= 0){
      ['cinturon', 'inventario'].forEach(k => { S[k] = (S[k] || []).filter(x => x !== oleo); });
    }
    ui.toast(`🧴 ${oleo.nombre}: ${it.nombre} +${fmt(q)} · 🔧 ${fmt(FichaCalculo.durActual(it))}/${fmt(FichaCalculo.durMax(it))}`);
    ui.cambio(['inventario', 'cinturon']);
    return true;
  }
  // Los clics de la sección (la ficha y el mapa): true si lo atendió.
  function repararClic(S, b, ui){
    if(b.dataset.reptal){ repararTalento(S, b.dataset.reptal, ui); return true; }
    if(b.dataset.repoleo){ usarOleo(S, b.dataset.repoleo, ui); return true; }
    return false;
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
    // Un número que uno de los dos no tiene (una varita no tiene «daño promedio», un cuchillo no da PdG) se muestra como «—», sin flecha:
    // no es que sea peor, es que no aplica (dueño, 2026-10-22: comparar una varita con una espada). La flecha va solo cuando los dos lo tienen.
    const filasHtml = filaPeso + claves.map(k => {
      const te = statsEq[k] !== undefined, tn = statsNuevo[k] !== undefined, ve = statsEq[k] || 0, vn = statsNuevo[k] || 0;
      const cls = te && tn ? (vn > ve ? 'mejora' : vn < ve ? 'empeora' : '') : '';
      const label = STAT_COMPARABLE_LABEL[k] || L()[k] || k;
      return `<tr><td>${esc(label)}</td><td>${te ? fmt(ve) : '<span class="hint">—</span>'}</td><td class="${cls}">${tn ? fmt(vn) : '<span class="hint">—</span>'}${te && tn ? (vn>ve?' ▲':vn<ve?' ▼':'') : ''}</td></tr>`;
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
    ${queHaceHtml(equipado, item)}
    ${(S.inventario || []).some(x => x.id === item.id && !x.equipado) ? `<button type="button" class="btn primary" data-reemplazar="${equipado.id}:${item.id}" style="width:100%;margin-top:12px">Reemplazar ${esc(equipado.nombre)}</button>` : ''}
  `};
  }

  // Lo que hace cada uno, lado a lado (2026-10-22, dueño): la ficha corta de ItemCorto (lo que hace en la grilla: el hechizo de una varita, los
  // efectos al golpear, lo de un talismán, las resistencias de una pieza), en dos columnas, para comparar lo que no es un número.
  function queHaceHtml(equipado, item){
    if(typeof ItemCorto === 'undefined' || !ItemCorto.grillaHtml) return '';
    const col = (it, etq) => `<div style="flex:1;min-width:0;padding:8px 10px;border:1px solid var(--line, #444);border-radius:8px;background:rgba(255,255,255,.03)">
      <div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">${etq}</div>
      <div style="font-weight:700;margin-bottom:4px">${esc(it.nombre)}</div>${ItemCorto.grillaHtml(it)}</div>`;
    return `<div class="hint" style="text-transform:uppercase;letter-spacing:.08em;margin:12px 0 6px">Lo que hace cada uno</div>
    <div style="display:flex;gap:8px;align-items:stretch">${col(equipado, 'Equipado')}${col(item, 'Nuevo')}</div>`;
  }

  return {talentoReparar, topeTalento, restoTalento, repararHtml, repararTalento, usarOleo, repararClic, SLOT_DEFS, TIER_COLOR, veCalidad, STAT_COMPARABLE_LABEL, CATEGORIAS, CATEGORIA_LABEL, ranuras, mochilaUsada, capMochila, siRecibe, BASE_CINTURON, esFlecha, carcajDe, carcajReal, carcajHuerfano, acomodarCarcaj, costoCarcaj, CAP_CARCAJ_INCLUIDO, tieneArcoOBallesta, capCarcaj, carcajUsado, flechasDelCarcaj, alCarcaj, delCarcaj, gastarFlecha, devolverFlecha, flechaTxt, carcajHtml, cinturonUsado, capCinturon, cinturonLibre, cuantasEntran, opcionesCinturon, alCinturon, textoAlCinturon, aManoCap, aManoEntra, aManoApto, esEscudo, alternarAMano, slots, slotOcupado, defValor, statsComparables, conCosto, equipar, reemplazar,
    modTags, thumb, statTxt, html, slotLlenoHtml, compararHtml, manosDeSilueta, siluetaHtml};
})();
