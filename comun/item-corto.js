/* =========================================================
   ITEM-CORTO — cómo se ve un ítem (o una trampa) en una grilla para elegir, y sus «Detalles técnicos» (2026-10-02, pedido del dueño:
   "en la grilla para seleccionar un ítem, lo único que se tiene que ver es lo que hace"; plan en docs/plan-paso-a-paso.md).
   - En la grilla: solo lo que hace. Una trampa, en datos cortos: forma y tamaño, daño, efecto, cómo se evita y qué tan difícil es detectarla.
     Otro ítem: la parte de su Detalle que cuenta qué hace (sin las notas ⚙ Automático / ✋ A mano).
   - En «Ver»: lo que hace y, aparte, el recuadro «Detalles técnicos» (qué se automatiza, qué va a mano, cómo se apila, si falta auditar),
     que solo aparece si hay algo que poner.
   ItemCorto.partes(texto) → {hace, tecnico, auditar}; .trampaFilas(t) → [[etiqueta, valor]]; .grillaHtml(item) (para la tarjeta de la grilla);
   .trampaHtml(t) (las filas de una trampa); .tecnicoHtml(item | texto) (el recuadro, '' si no hay nada). Trae su CSS.
   ========================================================= */
const ItemCorto = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const AVISO_RE = /\(Trampa creada automáticamente: requiere auditar\.\)\s*/;

  // Los estilos (también los copia el mapa adentro de sus recuadros aislados: ItemCorto.CSS).
  const CSS = `
.ic-filas{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:12.5px;line-height:1.4;margin-top:4px}
.ic-filas .ic-e{color:var(--muted,#9A867E);font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.ic-filas .ic-v{color:var(--paper,#EDE3D2)}
.ic-filas .ic-mano{color:var(--muted,#9A867E);font-size:11px}
.ic-hace{font-size:12.5px;line-height:1.45;color:var(--paper,#EDE3D2);margin-top:4px}
.ic-tecnico{margin-top:10px;border:1px dashed var(--line,#3B2E34);border-radius:4px;padding:8px 10px;font-size:12.5px;line-height:1.5;color:var(--muted,#9A867E)}
.ic-tecnico > b{display:block;font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;color:var(--muted,#9A867E)}
.ic-tecnico p{margin:0 0 4px}`;
  let cssPuesto = false;
  function estilos(){
    if(cssPuesto || typeof document === 'undefined') return;
    cssPuesto = true;
    const s = document.createElement('style');
    s.id = 'item-corto-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // El texto de un ítem, partido: lo que hace / las notas técnicas (desde la primera ⚙ o ✋) / si dice que falta auditar.
  function partes(texto){
    let t = String(texto || '');
    const auditar = AVISO_RE.test(t);
    t = t.replace(AVISO_RE, '');
    const i = t.search(/⚙|✋/);
    return {hace: (i >= 0 ? t.slice(0, i) : t).trim(), tecnico: i >= 0 ? t.slice(i).trim() : '', auditar};
  }

  const casillas = r => 3 * r * (r + 1) + 1;
  // Una trampa en datos cortos (forma única de comun/plantillas.js o los datos del catálogo, que traen los mismos campos).
  function trampaFilas(t0){
    const t = t0 && typeof Plantillas !== 'undefined' && Plantillas.trampaDesde ? (Plantillas.trampaDesde(t0) || t0) : (t0 || {});
    const f = [];
    const tam = Math.max(0, num(t.tamano));
    f.push(['Forma', t.tipo === 'linea' ? `Línea de ${Math.max(1, tam)}` : tam ? `Flor de radio ${tam} (${casillas(tam)} casillas)` : 'Una casilla']);
    if(t.dano) f.push(['Daño', `${t.dano} · ${t.ignoraDef ? 'directo a la vida' : 'contempla la armadura'}`]);
    // El efecto: lo que aplica el mapa solo (el estado) y lo que queda a mano (efectoManual).
    if(t.estado){
      const sinFin = {Sentado: 'hasta que se pare', Sangrado: 'hasta que lo curen'}[t.estado];
      const txt = `${t.estado}${num(t.estadoStacks) > 0 ? ' ×' + t.estadoStacks : ''}${num(t.estadoHp) ? ` (${Math.abs(num(t.estadoHp))} de daño por turno)` : ''}${num(t.estadoTurnos) > 0 ? ` · ${t.estadoTurnos} turno${num(t.estadoTurnos) === 1 ? '' : 's'}` : sinFin ? ` · ${sinFin}` : ''}`;
      f.push(['Efecto', txt]);
    }
    if(t.efectoManual) f.push([t.estado ? 'Además' : 'Efecto', t.efectoManual, 'a mano']);
    if(t.teleport) f.push(['Efecto', 'Teletransporta a quien la pisa']);
    if(!t.dano && !t.estado && !t.efectoManual && !t.teleport) f.push(['Efecto', 'Solo avisa cuando se dispara']);
    const s = t.salvacion && t.salvacion.stat ? t.salvacion : null;
    const QUE = {todo: 'la evita entera', efecto: t.dano ? 'evita el efecto (el daño entra igual)' : 'la evita', mitad: 'la mitad del daño'};
    f.push(['Se evita', s ? `${s.etq || s.stat} contra ${s.dif} → ${QUE[s.que] || QUE.todo}` : 'no']);
    f.push(['Detectarla', t.detectarStat ? `Percepción contra ${t.detectarStat === 'dmgesp' ? 'el Efecto especial' : 'la Destreza'} de quien la pone` : num(t.detectar) >= 1 ? `Percepción contra ${num(t.detectar)}` : 'sin definir']);
    if(t.dejaZona) f.push(['Después', `queda como zona ${num(t.zonaTurnos) || 3} turnos`]);
    if(t.amiga) f.push(['Alcanza', 'también a los aliados del área']);
    return f;
  }
  function filasHtml(filas){
    estilos();
    return `<div class="ic-filas">${filas.map(([e, v, nota]) => `<span class="ic-e">${esc(e)}</span><span class="ic-v">${esc(v)}${nota ? ` <span class="ic-mano">(${esc(nota)})</span>` : ''}</span>`).join('')}</div>`;
  }
  const trampaHtml = t => filasHtml(trampaFilas(t));

  /* ---------- Armas (regla del dueño, 2026-10-03: como las trampas) ----------
     En la grilla, lo esencial —Tipo, dados, daño, bonos, efectos— dando por sabidas las reglas (`armaEsencial`: la línea que se usa como
     Detalle de las armas del rework). Al abrir el ítem, «Detalles técnicos» explica cada mecánica que tiene (`armaTecnico`), armado de los
     datos del arma: no hay que escribirlo a mano en cada una. */
  const esArma = it => !!(it && /^arma_/.test(String(it.tipoItem || '')));
  const BONO = {pdg: 'PdG', pdgopor: 'PdG en oportunidad', pdgcontra: 'PdG en contraataque', rng: 'Alcance', ini: 'Iniciativa', crit: 'Crítico frecuente',
    critpot: 'Crítico potente', parry: 'Parry', bloqueo: 'Bloqueo', dmg: 'Dmg', eva: 'Evasión'};
  const EFECTO = {envenenar: 'Veneno', 'veneno severo': 'Veneno severo', sangrado: 'Sangrado', lisiado: 'Lisiado', 'rompe armadura': 'Rompe armadura',
    aturdir: 'Aturdir', derribar: 'Derribar', 'prende fuego': 'Prende fuego', 'drena vida': 'Drena vida', demora: 'Demora'};
  const nombreEf = e => EFECTO[String(e.nombre || '').trim().toLowerCase()] || String(e.nombre || '').trim();
  const pctEf = e => { const c = Math.max(1, num(e.caras) || 1), x = Math.min(c, Math.max(1, num(e.exitos) || 1)); return x >= c ? 100 : Math.round(x / c * 100); };
  const durPP = it => num(it.durPorPeso) > 0 ? num(it.durPorPeso) : 3;
  const durMax = it => typeof Combatiente !== 'undefined' && Combatiente.durMax ? Combatiente.durMax(it) : Math.max(3, Math.round(durPP(it) * Math.max(0, Math.round(num(it.peso)))));
  // «Sangrado 50 % · 2 turnos», «Veneno 3 stacks (siempre)», «Lisiado 25 %, seguro si es crítico».
  function efectoCorto(e){
    const n = nombreEf(e), pct = pctEf(e);
    const st = num(e.stacks) > 0 && /^Veneno$/.test(n) ? ` ${num(e.stacks)} stacks` : '';
    return `${n}${st} ${pct >= 100 ? '(siempre)' : pct + ' %'}${num(e.turnos) > 0 ? ` · ${num(e.turnos)} turnos` : ''}${e.seguroCritico && pct < 100 ? ', seguro si es crítico' : ''}`;
  }
  function armaEsencial(it){
    if(!esArma(it)) return '';
    const peso = Math.max(1, num(it.peso) || 1), amp = Math.max(0, num(it.danoAmplificado)), tipo = num(it.tipoDado) || 8;
    const p = [`Tipo ${tipo}`];
    if(it.tipoItem === 'arma_2m') p.push('2 manos');
    if(it.armaDeRango) p.push('a distancia');
    p.push(`${peso} dado${peso === 1 ? '' : 's'}${amp ? ` + ${amp} amplificado${amp === 1 ? '' : 's'}` : ''}`);
    if(num(it.danoFijo)) p.push(`${num(it.danoFijo) > 0 ? '+' : ''}${num(it.danoFijo)} de daño`);
    (it.mods || []).forEach(m => { if(m && m.stat && num(m.val) && m.stat !== 'def') p.push(`${BONO[m.stat] || m.stat} ${num(m.val) > 0 ? '+' : ''}${num(m.val)}`); });
    (it.efectosGolpe || []).forEach(e => { if(e && e.nombre) p.push(efectoCorto(e)); });
    if(num(it.durPorPeso) > 3) p.push(`Resistente (durabilidad ${durMax(it)})`);
    else if(num(it.durPorPeso) > 0 && num(it.durPorPeso) < 3) p.push(`Frágil (durabilidad ${durMax(it)})`);
    const es = it.espalda;
    if(es && (num(es.pdg) || num(es.fijo) || num(es.critpot))) p.push(`Por la espalda (en sigilo): ${[num(es.pdg) ? `+${num(es.pdg)} PdG` : '', num(es.fijo) ? `+${num(es.fijo)} de daño` : '', num(es.critpot) ? `+${num(es.critpot)} Crítico potente` : ''].filter(Boolean).join(', ')}`);
    return p.join(' · ');
  }
  // Las explicaciones de cada mecánica que tiene el arma (para «Detalles técnicos»).
  const MECANICA = {
    pdg: 'PdG: se suma a la tirada para pegar.',
    pdgopor: 'PdG en oportunidad: solo se suma en un ataque de oportunidad (cuando un rival se aleja de tu lado). Ese ataque cuesta lo de un primer ataque y no cuenta como ataque del turno.',
    pdgcontra: 'PdG en contraataque: solo se suma en un contraataque (después de ganar un Parry y un Bloqueo). Cuesta lo de un primer ataque y no cuenta como ataque del turno.',
    rng: 'Alcance: pega a más casilleros de distancia sin dejar de ser cuerpo a cuerpo (sigue sumando el Dmg).',
    ini: 'Iniciativa: actúa antes en el orden de los turnos.',
    crit: 'Crítico frecuente: achica el rango del crítico (críticos más seguidos). El rango no baja de 2: en un Tipo 4 sirve hasta +2.',
    critpot: 'Crítico potente: hace más fuerte el crítico (baja lo que hay que sacar en el d20 para ×2, ×3 y ×4), no lo hace más seguido. A diferencia del frecuente, en el Tipo 4 rinde hasta +6.',
    parry: 'Parry: se suma al parar un golpe con el arma.', bloqueo: 'Bloqueo: se suma al aguantar el golpe después de un Parry.',
    dmg: 'Dmg: se suma al daño de cada golpe.', eva: 'Evasión: se suma al esquivar.',
  };
  const MEC_EFECTO = {
    Lisiado: 'Lisiado: 3 turnos con el PdG y el Parry a la mitad (se tira el dado completo y el resultado se divide por 2).',
    Sangrado: 'Sangrado: pierde 1 HP por stack en cada Mantenimiento (entra con 2). Si ya sangraba, suma +1 stack. Sin turnos dura hasta que lo curen; con turnos vence, salvo que entre con un golpe crítico: ahí queda permanente.',
    Veneno: 'Veneno: pierde 1 HP por stack en cada Mantenimiento y un stack por turno (los turnos son los stacks). Los stacks nuevos se suman a los que ya tenía.',
    'Veneno severo': 'Veneno severo: daño por turno que crece en cada Mantenimiento y no se va solo: hay que curarlo.',
    'Rompe armadura': 'Rompe armadura: deja Armadura rota (−1 de Defensa por stack).',
  };
  function armaTecnico(it){
    if(!esArma(it)) return [];
    const tipo = num(it.tipoDado) || 8, L = [];
    L.push(`Tipo ${tipo}: cada dado de daño es un d${tipo}. El primer ataque del turno con esta arma cuesta ${Math.ceil(tipo / 2)} No2 y los siguientes ${tipo}.`);
    L.push(`Peso ${Math.max(1, num(it.peso) || 1)}: es la cantidad de dados de daño y lo que carga mientras está equipada.`);
    if(num(it.danoAmplificado)) L.push('Daño amplificado: dados de daño de más que no pesan.');
    if(num(it.danoFijo)) L.push('Daño fijo: se suma al resultado de los dados en cada golpe.');
    if(it.tipoItem === 'arma_2m') L.push('A dos manos: ocupa las dos manos.');
    const vistos = new Set();
    (it.mods || []).forEach(m => { if(m && MECANICA[m.stat] && !vistos.has(m.stat)){ vistos.add(m.stat); L.push(MECANICA[m.stat]); } });
    const efs = (it.efectosGolpe || []).filter(e => e && e.nombre);
    efs.forEach(e => { const n = nombreEf(e); if(MEC_EFECTO[n] && !vistos.has(n)){ vistos.add(n); L.push(MEC_EFECTO[n]); } });
    if(efs.some(e => pctEf(e) < 100)) L.push('Los porcentajes se tiran en el duelo, después del daño (50 % = una moneda, 25 % = un d4, 75 % = un d4 que falla solo con 1). Lisiado, Veneno y Sangrado necesitan que el golpe haga daño.');
    if(efs.some(e => e.seguroCritico)) L.push('Seguro si es crítico: con un golpe crítico, el efecto entra sin tirar.');
    if(efs.length) L.push('⚙ Automatizado: el duelo tira cada efecto y lo aplica con «Aplicar».');
    if(num(it.durPorPeso) > 0 && num(it.durPorPeso) !== 3) L.push(`Durabilidad ${durMax(it)} (${durPP(it)} por punto de Peso; lo normal es 3): cuánto desgaste aguanta antes de romperse.`);
    const es = it.espalda;
    if(es && (num(es.pdg) || num(es.fijo) || num(es.critpot))) L.push('Por la espalda: cuenta solo si quien ataca está en sigilo y en el casillero justo de atrás del defensor (si lo ve, se da vuelta). ⚙ El mapa lo suma solo.');
    return L;
  }
  // Lo que se ve de un ítem en la tarjeta de una grilla para elegir.
  function grillaHtml(item){
    estilos();
    if(!item) return '';
    if(item.trampaDatos) return trampaHtml(item.trampaDatos);
    const p = partes(item.detalle);
    const hace = p.hace || armaEsencial(item);   // un arma sin Detalle: lo esencial, de sus datos
    return hace ? `<div class="ic-hace cat-detalle">${esc(hace)}</div>` : '';
  }
  // El recuadro «Detalles técnicos» (para «Ver»): '' si no hay nada técnico que contar.
  function tecnicoHtml(fuente){
    estilos();
    const texto = typeof fuente === 'string' ? fuente : (fuente && fuente.detalle) || '';
    const p = partes(texto);
    const extra = [];
    if(fuente && typeof fuente === 'object'){
      extra.push(...armaTecnico(fuente));   // las armas: cada mecánica que tiene, explicada
      if(fuente.trampaDatos && fuente.trampaDatos.detectar === undefined) extra.push('La dificultad para detectarla todavía no está definida.');
      if(fuente.pilaInfinita && !/apila/.test(p.tecnico)) extra.push('Se apila sin límite en la mochila.');
    }
    const lineas = [p.tecnico, ...extra, p.auditar ? 'Creada automáticamente: las cifras están para auditar.' : ''].filter(Boolean);
    if(!lineas.length) return '';
    return `<div class="ic-tecnico"><b>Detalles técnicos</b>${lineas.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;
  }
  // Lo de «Ver»: qué hace (una trampa, en datos cortos), el Detalle sin las notas técnicas y el recuadro «Detalles técnicos».
  function verHtml(item){
    if(!item) return '';
    const p = partes(item.detalle);
    return (item.trampaDatos ? `<div class="view-detalle"><span class="view-label">Qué hace</span>${trampaHtml(item.trampaDatos)}</div>` : '')
      + (p.hace ? `<div class="view-detalle"><span class="view-label">Detalle</span>${esc(p.hace)}</div>` : '')
      + tecnicoHtml(item);
  }
  return {CSS, partes, trampaFilas, trampaHtml, filasHtml, grillaHtml, tecnicoHtml, verHtml, armaEsencial, armaTecnico};
})();
