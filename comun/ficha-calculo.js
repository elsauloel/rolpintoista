/* =========================================================
   FICHA-CALCULO — el cálculo de un personaje, fuera de la ficha (paso 5, nivel B, área 1 de docs/plan-paso5.md, 2026-09-30)
   Lo que antes vivía adentro de ficha-personaje (js/01-modelo-y-reglas.js): la lista de atributos y stats con sus
   etiquetas, las ranuras del equipo, la durabilidad de los ítems, las compras de pasivas, el presupuesto de Job y el CÁLCULO
   de los stats finales (`calcular(S)`, el viejo `compute()`), que ahora recibe la ficha (`S`) en vez de leerla de una
   variable global. Mismo código de siempre (copiado tal cual), así que da exactamente lo mismo; lo puede usar cualquier
   pantalla que tenga los datos de un personaje (la ficha hoy; el mapa cuando dibuje la Botonera, paso 4 etapa 3).
   Necesita comun/combatiente.js (durabilidad y No2 máximo). Ojo: las fórmulas de stats de cada ficha (`S.formulas`) se
   evalúan como código (`evalFormula`), igual que siempre.
   ========================================================= */
const FichaCalculo = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

  /* ---------- Atributos y stats ---------- */
  const GRUPOS = [
    {id:'con', label:'Con', full:'Constitución', color:'#C4485A', derived:[
      {id:'resmg', label:'Res.Esp', full:'Resistencia especial'},
      {id:'rescc', label:'Res.CC', full:'Resistencia al crowd control'},
      {id:'hpmax', label:'Hp.Max', full:'Health points máximos'}]},
    {id:'fue', label:'Fue', full:'Fuerza', color:'#D07B3A', derived:[
      {id:'dmg', label:'Dmg', full:'Damage'},
      {id:'bloqueo', label:'Bloqueo', full:'Bloqueo'},
      {id:'crgmax', label:'Crg.Max', full:'Carga máxima'}]},
    {id:'agl', label:'Agi', full:'Agilidad', color:'#8FB84F', derived:[
      {id:'eva', label:'Eva', full:'Evasión'},
      {id:'ini', label:'Iniciativa', full:'Iniciativa'},
      {id:'nitros', label:'No2', full:'Nitros'}]},
    {id:'des', label:'Des', full:'Destreza', color:'#4FA88C', derived:[
      {id:'rng', label:'Rng', full:'Rango'},
      {id:'pdg', label:'PdG', full:'Probabilidad de golpe'},
      {id:'pdgopor', label:'PdG Oport.', full:'PdG en ataque de oportunidad: solo suma cuando hacés un ataque de oportunidad; vale mucho menos que un PdG normal'},
      {id:'pdgcontra', label:'PdG Contra', full:'PdG en contraataque: solo suma cuando contraatacás (tras un Parry); vale mucho menos que un PdG normal'},
      {id:'critpot', label:'Crít.Pot.', full:'Crítico potente (baja los umbrales del d20: doble, triple y cuádruple daño)'},
      {id:'crit', label:'Crít.Frec.', full:'Crítico frecuente (baja el rango del crítico; ver Calculadora de crítico)'},
      {id:'parry', label:'Parry', full:'Parry'},
      {id:'percepcion', label:'Percep.', full:'Percepción'},
      // Sigilo (2026-10-04, dueño): la tirada para NO ser descubierto (Destreza + bonos) contra la Percepción de quien busca.
      {id:'sigilo', label:'Sigilo', full:'Sigilo: tu tirada para no ser descubierto (Destreza + bonos) contra la Percepción de quien te busca'}]},
    {id:'esp', label:'Esp', full:'Especial', color:'#9B7BD4', derived:[
      {id:'pdgmg', label:'PdG.Esp', full:'Probabilidad de golpe especial'},
      // Efecto especial (2026-10-02, pedido del dueño; se llamó "Daño especial" unas horas — el id quedó `dmgesp`): la potencia de los
      // efectos del Especial —daño u otros—, el par del Dmg de Fuerza. Para tiradas puntuales que miden "cuánto" en vez de "si pega"
      // (ej. Pedos Tóxicos tira Ef.Esp contra Res.Esp) y la dificultad de las trampas mágicas que coloca una habilidad.
      {id:'dmgesp', label:'Ef.Esp', full:'Efecto especial: la potencia de los efectos del Especial (daño u otros), para habilidades y trampas mágicas'},
      {id:'resm', label:'Res.Mt', full:'Resistencia mental'},
      {id:'sp', label:'SP', full:'Special Power'},
      {id:'spregen', label:'SP Regen', full:'Regeneración de SP por turno'},
      {id:'rangocasteo', label:'Rango Cast.', full:'Rango de casteo'}]},
  ];
  const EXTRA = [
    {id:'def', label:'Defensa', full:'Defensa'},
    // Armadura mágica (Paso 3 de las reglas de casteo, docs/reglas-casteo.md):
    // stat general, fijo, que NO sale de ningún atributo (arranca en 0) — solo
    // lo dan ítems Raros o mejores. Protege el daño de casteo que "ignora la
    // Defensa" (Paso 1); no tiene nada que ver con el Escudo especial (HP
    // temporal) ni con la skill del Mago "Armadura arcana".
    {id:'armadmg', label:'Armadura mágica', full:'Armadura mágica: se resta al daño de casteo que ignora la Defensa. No sale de ningún atributo — solo la dan ítems raros o mejores.'},
    // Los ids tipo1..tipo5 quedaron de antes de correr la escala +2 (eran
    // Tipo 2..10): no se renombran para no tocar los mods ya guardados.
    {id:'tipo1', label:'Tipo 4', full:'Resistencia a crítico — armas Tipo 4 (d4)'},
    {id:'tipo2', label:'Tipo 6', full:'Resistencia a crítico — armas Tipo 6 (d6)'},
    {id:'tipo3', label:'Tipo 8', full:'Resistencia a crítico — armas Tipo 8 (d8)'},
    {id:'tipo4', label:'Tipo 10', full:'Resistencia a crítico — armas Tipo 10 (d10)'},
    {id:'tipo5', label:'Tipo 12', full:'Resistencia a crítico — armas Tipo 12 (d12, explosivos/modernas)'},
    {id:'capcinturon', label:'Ranuras cinturón', full:'Ranuras extra para consumibles que da el cinturón equipado'},
    {id:'emergencia', label:'Bolsillo de emergencia', full:'Al bajar del 25 % de la vida, se toma sola la mejor poción de curación del cinturón, sin No2; una vez por combate'},
    {id:'capmochila', label:'Ranuras mochila', full:'Ranuras extra de la mochila que da la mochila equipada'},
    {id:'luz', label:'Luz portada', full:'Radio de luz que llevás encima (farol, bengala): iluminás y ves ese radio a tu alrededor, sin punto ciego'},
    {id:'veoculto', label:'Ve lo oculto', full:'Radio (dentro de tu campo de visión) en el que ves lo oculto: creeps en sigilo y trampas escondidas'},
    // Radio del campo de visión en hexágonos (base 6, decidido con la niebla de
    // guerra: P47). Se ve en un cuadro junto a Defensa; lo modifican pasivas,
    // ítems y estados. La niebla del mapa todavía no lo lee.
    {id:'vision', label:'Campo de visión', full:'Campo de visión (radio en hexágonos)'},
    // Pasos gratis (2026-10-04, dueño: un bono al movimiento que no sea dar No2): los primeros N casilleros de cada turno (de Mantenimiento a
    // Mantenimiento) no cuestan No2. Lo dan sobre todo las piernas; sube con la calidad (1, 2, 3).
    {id:'pasosgratis', label:'Pasos gratis', full:'Casilleros que te movés gratis al comienzo de cada turno (sin gastar No2)'},
    // Mecánicas de las piernas (2026-10-04, dueño): Evasión solo contra un tipo de ataque, y la chance de alejarse sin ataque de oportunidad.
    {id:'evaopor', label:'Evasión contra oportunidad', full:'Evasión extra cuando te atacan de oportunidad (no suma al Parry)'},
    {id:'evacontra', label:'Evasión contra contraataque', full:'Evasión extra cuando te contraatacan (no suma al Parry)'},
    // Mecánicas de los pies (2026-10-04, dueño). Las de chance van en % (33 = 5–6 en d6, 50 = 2 en d2, 20 = 9–10 en d10…: Combatiente.chanceDado; 100 = siempre).
    {id:'pasosbaile', label:'Pasos de baile', full:'Evasión extra si ya te moviste en la ronda'},
    {id:'pisadaatenta', label:'Pisada atenta', full:'Al pasar al lado de una trampa escondida, tirás Percepción para descubrirla (como la Percepción aumentada, solo trampas)'},
    {id:'inamovible', label:'Inamovible (%)', full:'Chance (en %) de que no te muevan contra tu voluntad (empujes, portales): 33 = 5–6 en d6, 50 = 4–6, 100 = siempre'},
    {id:'recuperarse', label:'Recuperarse rápido (%)', full:'Chance (en %) de que Inmovilizado, Rengo, Sentado o Lento te duren 1 turno menos: 50 = 4–6 en d6, 100 = siempre'},
    {id:'reflejos', label:'Reflejos de mangosta (%)', full:'Al pisar una trampa, chance (en %) de un dodge roll hacia donde quieras (hasta 2 casilleros) para esquivarla: 33 = 5–6 en d6, 100 = siempre'},
    // Cinturón y mochila (2026-10-05, dueño).
    {id:'saquerapido', label:'Saque rápido (%)', full:'Chance (en %) de que el primer consumible del turno sacado del cinturón no cueste No2: 50 = 4–6 en d6, 100 = siempre'},
    {id:'boticario', label:'Mano de boticario', full:'Lo que suma a la curación de cada poción'},
    {id:'portapergaminos', label:'Portapergaminos', full:'Portapergaminos: una ranura aparte del cinturón donde entran N pergaminos'},
    {id:'ranurapocion', label:'Ranuras para pociones', full:'Ranuras del cinturón solo para pociones'},
    {id:'ranurapergamino', label:'Ranuras para pergaminos', full:'Ranuras del cinturón solo para pergaminos'},
    {id:'ranuratrampa', label:'Ranuras para trampas', full:'Ranuras del cinturón solo para trampas'},
    {id:'ranuraankh', label:'Ranura para el Ankh', full:'Ranura del cinturón solo para el Ankh'},
    {id:'vainas', label:'Vainas', full:'Armas que podés llevar envainadas: se equipan o se guardan sin gastar No2'},
    {id:'correas', label:'Correas laterales', full:'Armas o escudos colgados de la mochila: se equipan o se guardan sin gastar No2'},
    {id:'bolsilloext', label:'Bolsillo exterior', full:'El primer consumible del turno sacado de la mochila cuesta 1 No2 en vez de 2'},
    {id:'morral', label:'Morral de cazador', full:'Los trofeos no ocupan ranuras de la mochila'},
    {id:'pasamanos', label:'Pasamanos', full:'En combate, pasarle a un aliado al lado algo del cinturón no cuesta No2'},
    {id:'alforja', label:'Alforja compartida', full:'En combate, un aliado al lado puede sacar un consumible de tu mochila por 1 No2'},
    // Guantes de Buena calidad (2026-10-05, dueño): PdG con una familia de armas o a distancia, ataques especiales más baratos, soltarse, trampas
    // mejor escondidas, el primer conjuro más barato y los venenos con un stack más. Mismos ids para personajes, invocaciones y creeps.
    {id:'pdgt4', label:'PdG con punzantes', full:'PdG extra al atacar con un arma punzante (Tipo 4)'},
    {id:'pdgt6', label:'PdG con cortantes', full:'PdG extra al atacar con un arma cortante (Tipo 6)'},
    {id:'pdgt8', label:'PdG con hachas', full:'PdG extra al atacar con un hacha (Tipo 8)'},
    {id:'pdgt10', label:'PdG con contundentes', full:'PdG extra al atacar con un arma contundente (Tipo 10)'},
    {id:'pdgdist', label:'PdG a distancia', full:'PdG extra al atacar con un arma a distancia'},
    {id:'oporahorro', label:'Oportunidad más barata', full:'No2 de menos que cuesta tu ataque de oportunidad (nunca menos de 0)'},
    {id:'contraahorro', label:'Contraataque más barato', full:'No2 de menos que cuesta tu contraataque, el que hacés después de ganar un Parry (nunca menos de 0)'},
    {id:'soltarse', label:'Soltarse', full:'Suma a la tirada para soltarte de una red, un cepo o una telaraña'},
    {id:'trampaoculta', label:'Trampas mejor escondidas', full:'Suma a la dificultad para detectar las trampas que colocás'},
    {id:'ahorroespsp', label:'Primer conjuro', full:'SP de menos que cuesta el primer uso de un arma especial en el turno'},
    {id:'venenista', label:'Envenenador', full:'Stacks de más en los venenos que ponés: cada stack es un turno más y 1 de daño más por turno'},
    // Torso blando de Buena calidad (2026-10-06, dueño).
    // Torso rígido de Buena calidad (2026-10-06, dueño).
    // Pies de Buena calidad (2026-10-06, dueño).
    {id:'levantarse', label:'Levantarse rápido', full:'Levantarse de Sentado cuesta esta cantidad de No2 menos (nunca menos de 0)'},
    {id:'levitar', label:'Levitar', full:'Los primeros N casilleros que te movés en cada turno no tocan el piso: no te frena el terreno lento, no pisás ni detectás trampas y no te quema el terreno incendiado (las zonas sí te alcanzan: pueden ser nubes); al terminar el turno tocás el piso'},
    {id:'suelagruesa', label:'Suela gruesa', full:'Lo que pisás (zonas y trampas) te hace esta cantidad menos de daño'},
    {id:'meditar', label:'Meditar', full:'Si no te moviste en tu turno anterior, al empezar el tuyo recuperás esta cantidad de SP'},
    // Piernas de Buena calidad (2026-10-06, dueño).
    {id:'embestida', label:'Embestida', full:'PdG extra en tu primer ataque del turno si llegaste al rival con tus últimos 2 pasos (o más) en línea recta hacia él'},
    // Anillos Comunes (2026-10-06, dueño).
    {id:'cascara', label:'Cáscara protectora', full:'Al empezar cada combate, un Escudo especial de esta cantidad que no se recarga'},
    {id:'primerasangre', label:'Primera sangre', full:'Daño extra en tu primer ataque del combate, si pega'},
    {id:'calma', label:'Calma', full:'Si no atacaste en tu turno, al terminarlo recuperás esta cantidad de No2'},
    {id:'foco', label:'Foco', full:'PdG.Esp extra si no te moviste en este turno'},
    {id:'pulso', label:'Pulso quieto', full:'PdG extra si no te moviste antes de atacar en este turno'},
    {id:'pasofantasma', label:'Paso fantasma', full:'Evasión extra si en esta ronda te moviste 3 casilleros o más'},
    {id:'cambiante', label:'Cambiante', full:'Al empezar el combate elegís Res. fuego, hielo o rayo: suma esta cantidad'},
    {id:'absorbearmadura', label:'Armadura indestructible', full:'La primera Armadura rota de cada combate se absorbe'},
    {id:'impulsofue', label:'Fuerza del Toro', full:'Una vez por combate, +N a tu última tirada de Fuerza (como la Polilla)'},
    {id:'impulsodes', label:'Manos Ligeras', full:'Una vez por combate, +N a tu última tirada de Destreza (como la Polilla)'},
    {id:'impulsoesp', label:'Clarividencia', full:'Una vez por combate, +N a tu última tirada de Especial (como la Polilla)'},
    {id:'impulsocon', label:'Piel de Roble', full:'Una vez por combate, +N a tu última tirada de Constitución (como la Polilla)'},
    {id:'pasodoble', label:'Primer paso doble', full:'El primer casillero que te movés en cada turno cuesta el doble (como Lento): la contra de las piernas pesadas'},
    {id:'guardian', label:'Guardián', full:'Los aliados que están al lado tuyo tienen +N Defensa (el mapa la suma sola al aplicarles el daño; no se acumula con otro guardián)'},
    {id:'escolta', label:'Escolta (a mano)', full:'Una vez por turno podés recibir vos el golpe dirigido a un aliado al lado (1 No2). Se resuelve a mano'},
    {id:'defprimer', label:'Defensa contra el primer golpe', full:'Defensa extra contra el primer golpe que recibís en cada turno'},
    {id:'defdist', label:'Defensa contra armas a distancia', full:'Defensa extra contra los golpes de armas a distancia'},
    {id:'pagarhp', label:'Pagar con vida', full:'Con un arma especial, elegís cada vez si pagás el SP con SP o con vida (1 HP por SP)'},
    {id:'retirada', label:'Retirada limpia (%)', full:'Chance (en %) de alejarte de un rival sin darle ataque de oportunidad: 33 = 5–6 en d6, 50 = 4–6, 100 = siempre'},
    // Resistencias elementales (2026-10-04, dueño): cada una se resta al daño de su elemento (además de la Armadura mágica). Situacionales: pesan poco.
    {id:'resfuego', label:'Res. fuego', full:'Resistencia al fuego: se resta a todo daño de fuego'},
    {id:'reshielo', label:'Res. hielo', full:'Resistencia al hielo: se resta a todo daño de hielo'},
    {id:'resrayo', label:'Res. rayo', full:'Resistencia al rayo: se resta a todo daño de rayo'},
    {id:'restoxico', label:'Res. tóxico', full:'Resistencia a lo tóxico: se resta a todo daño tóxico'},
    {id:'resacido', label:'Res. ácido', full:'Resistencia al ácido: se resta a todo daño de ácido'},
  ];
  const STAT_LIST = [...GRUPOS.flatMap(g=>g.derived), ...EXTRA];
  const ATTR_LIST = GRUPOS.map(g => ({id:g.id, label:g.label, full:g.full}));
  const MOD_TARGETS = [...ATTR_LIST, ...STAT_LIST];
  const STAT_LABEL = Object.fromEntries(MOD_TARGETS.map(s=>[s.id,s.label]));
  const STAT_FULL = Object.fromEntries(MOD_TARGETS.map(s=>[s.id,s.full]));
  const ES_ATTR = id => ATTR_LIST.some(a => a.id === id);

  /* ---------- Ranuras del equipo ---------- */
  const SLOT_MAP = {
    arma_1m:'mano', arma_2m:'mano',
    escudo_1m:'escudo', escudo_2m:'escudo',
    armadura_blanda:'armadura', armadura_rigida:'armadura',
    cabeza:'cabeza', manos:'manos', piernas:'piernas', pies:'pies',
    cinturon:'cinturon', mochila:'mochila',
  };
  const SLOT_LABEL = {mano:'Mano (una mano)', escudo:'Escudo', armadura:'Armadura', cabeza:'Cabeza', manos:'Manos', piernas:'Piernas', pies:'Pies', cinturon:'Cinturón', mochila:'Mochila', otro:'Otro'};
  function slotDe(tipoItem){ return SLOT_MAP[tipoItem] || 'otro'; }

  /* ---------- Durabilidad (docs/durabilidad.md; cuánta tiene cada ítem: comun/combatiente.js) ---------- */
  const SLOTS_DURABLES = ['mano', 'escudo', 'armadura', 'cabeza', 'manos', 'piernas', 'pies'];
  const SLOTS_ARMADURA = ['armadura', 'cabeza', 'manos', 'piernas', 'pies'];
  const durableItem = i => !!i && !i.consumible && SLOTS_DURABLES.includes(slotDe(i.tipoItem));
  const esArmaduraItem = i => durableItem(i) && SLOTS_ARMADURA.includes(slotDe(i.tipoItem));
  const durMax = i => Combatiente.durMax(i);
  const durActual = i => (i.dur === undefined || i.dur === null) ? durMax(i) : Math.max(0, Math.min(durMax(i), Math.round(num(i.dur))));
  const itemRoto = i => durableItem(i) && durActual(i) <= 0;
  const armRotaDe = i => Math.max(0, Math.min(durMax(i), Math.round(num(i.armRota))));

  /* ---------- Pasivas y Job ---------- */
  // Cuántas veces se compró una pasiva (las que se compran varias veces suman sus bonos).
  const pasivaCompras = x => Math.max(1, Math.floor(num(x && x.compras)) || 1);
  // Presupuesto total de Job: 3 al nivel 1 y 3 más por cada nivel.
  const jobTotal = nivel => 3 + 3 * (Math.max(1, num(nivel) || 1) - 1);

  /* ---------- Cálculo ---------- */
  function modsDe(S){
    const out = {};
    // tipo: de dónde viene (lo muestra la 🔍); itemId: para el PdG propio de cada arma.
    const push = (m, origen, tipo, itemId) => {
      if(!m || !m.stat) return;
      (out[m.stat] = out[m.stat] || []).push({val:num(m.val), origen, tipo, itemId});
    };
    (S.inventario || []).filter(i=>i.equipado).forEach(i => {
      if(itemRoto(i)) return;   // roto: ocupa el lugar pero no da ningún efecto
      (i.mods||[]).forEach(m => push(m, i.nombre, 'equipado', i.id));
      // Armadura rota de la pieza: cada punto baja 1 su Defensa (sin pasar de lo que la pieza da).
      const ar = esArmaduraItem(i) ? armRotaDe(i) : 0;
      if(ar > 0){
        const defPieza = (i.mods || []).filter(m => m.stat === 'def').reduce((a, m) => a + num(m.val), 0);
        const r = Math.min(ar, Math.max(0, defPieza));
        if(r > 0) push({stat: 'def', val: -r}, `${i.nombre} · Armadura rota ×${ar}`, 'equipado', i.id);
      }
    });
    (S.pasivas || []).forEach(p => {
      const compras = pasivaCompras(p);
      (p.mods||[]).forEach(m => push({stat:m.stat, val:num(m.val)*compras}, p.nombre + (compras>1 ? ' ×'+compras : ''), 'pasiva'));
    });
    (S.efectos || []).filter(e=>e.activo !== false).forEach(e => (e.mods||[]).forEach(m => {
      const stacks = Math.max(1, num(e.stacks) || 1);
      push({stat:m.stat, val:num(m.val)*stacks}, e.nombre + (stacks>1 ? ' ×'+stacks : ''), 'estado alterado');
    }));
    return out;
  }

  function evalFormula(expr, ctx){
    try{
      const keys = Object.keys(ctx);
      const fn = new Function(...keys, 'return ('+(expr||'0')+');');
      const v = fn(...keys.map(k=>ctx[k]));
      return Number.isFinite(v) ? v : NaN;
    }catch(e){ return NaN; }
  }

  function calcular(S){
    const mods = modsDe(S);
    const modTotal = {};
    MOD_TARGETS.forEach(s => modTotal[s.id] = (mods[s.id]||[]).reduce((a,b)=>a+b.val,0));

    const attrFinal = {};
    ATTR_LIST.forEach(a => attrFinal[a.id] = num(S.attrs[a.id]) + modTotal[a.id]);

    const ctx = {
      ...attrFinal,
      nivel:num(S.meta.nivel), job:jobTotal(S.meta.nivel),
      sobrecarga:0,
      floor:Math.floor, ceil:Math.ceil, round:Math.round,
      min:Math.min, max:Math.max, abs:Math.abs
    };
    STAT_LIST.forEach(s => ctx[s.id] = 0);

    const pesoEquipado = (S.inventario || []).filter(i=>i.equipado).reduce((a,i)=>a+num(i.peso),0);

    const base = {};
    for(let pass=0; pass<4; pass++){
      ctx.sobrecarga = Math.max(0, pesoEquipado - (ctx.crgmax||0));
      STAT_LIST.forEach(s => {
        const v = evalFormula(S.formulas[s.id], ctx);
        base[s.id] = Number.isNaN(v) ? NaN : v;
        ctx[s.id] = (Number.isNaN(v) ? 0 : v) + modTotal[s.id];
      });
    }

    const final = {};
    STAT_LIST.forEach(s => final[s.id] = Number.isNaN(base[s.id]) ? NaN : base[s.id] + modTotal[s.id]);
    ATTR_LIST.forEach(a => { base[a.id] = num(S.attrs[a.id]); final[a.id] = attrFinal[a.id]; });

    // Efectos activos que fuerzan/alteran un stat más allá de un modificador sumable.
    const efectosActivos = (S.efectos || []).filter(e => e.activo !== false);
    // No2 máximo con Cansado, Hypeado, Exhausto y Stun/forzados (topes): regla común de personajes, invocaciones y creeps.
    final.nitros = Combatiente.nitrosMax(final.nitros, efectosActivos);
    // Pajaritos y Lisiado ya no achican el stat: parten el RESULTADO de la tirada (ver mitadesDeTirada / tirarValorStat).
    // Inmovilizado y Rengo ya no tocan un stat: Movimiento se fundió en
    // Nitros, así que actúan al moverse (ver costoMoverCasillero).
    // Armadura arruinada se sacó (2026-09-21, repaso de debuffs): lo que la aplicaba pasó a sumar stacks de Armadura rota.

    return {base, mods, modTotal, final, pesoEquipado, sobrecarga:ctx.sobrecarga};
  }

  /* ---------- Iteración 2 — Nitros (No2) y SP: los costos (movido tal cual de ficha-personaje/js/01, 2026-10-01) ----------
     Lo marcado PLACEHOLDER está sin confirmar: se ajusta acá y en la pantalla de la ficha aparece con ⚠. */
  const IT2 = {
    // Costos confirmados.
    nitrosMover: 1,               // por casillero
    nitrosConsumirCinturon: 1,
    nitrosConsumirMochila: 2,
    nitrosHabilidad: 1,           // costo por defecto de una habilidad nueva
    nitrosSigilo: 1,              // entrar en sigilo (a revisar, P1)
    nitrosLevantarse: 1,          // pararse estando Sentado (decidido 2026-09-24)
    nitrosEquipar: 1,             // equipar o desequipar un ítem, solo en modo combate del mapa
    // PLACEHOLDER: equipo, estados y catálogo viejos que daban "+N Bonos"
    // pasan a dar "+N × esto" de SP.
    spPorBono: 1,
    // PLACEHOLDER: Tipo con el que se cobra un ataque sin arma equipada.
    tipoSinArma: 4,
    // (El costo de atacar —Tipo ÷ 2 para arriba el primero— pasó al motor común: Combatiente.costoAtaque, comun/combatiente.js.)
    // PLACEHOLDER: Rengo cobra esto por casillero; Inmovilizado no deja moverse.
    nitrosMoverRengo: 2,
    inmovilizadoBloqueaMover: true,
    // PLACEHOLDER: tope de X en costos variables. null = solo frena lo
    // disponible. Si se confirma, poner una función: c => c.final.esp
    limiteXNitros: null,
    limiteXSp: null,
    // PLACEHOLDER: penalidad por peso de más. Hoy no resta nada (antes
    // restaba de Bonos); se puede sumar en la fórmula de SP (clic en el stat → fx), ej. esp*3 - sobrecarga.
    penalidadSobrecargaDefinida: false,
  };

  return {IT2, GRUPOS, EXTRA, STAT_LIST, ATTR_LIST, MOD_TARGETS, STAT_LABEL, STAT_FULL, ES_ATTR,
    SLOT_MAP, SLOT_LABEL, slotDe, SLOTS_DURABLES, SLOTS_ARMADURA, durableItem, esArmaduraItem, durMax, durActual, itemRoto, armRotaDe,
    pasivaCompras, jobTotal, modsDe, evalFormula, calcular};
})();
