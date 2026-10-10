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
.ic-tecnico{margin-top:10px;border:1px dashed var(--line,#3B2E34);border-radius:6px;padding:7px 10px;font-size:12px;line-height:1.45;color:var(--muted,#9A867E)}
.ic-tecnico > b{display:block;font-family:"Space Mono",monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px;color:var(--muted,#9A867E)}
.ic-tecnico ul{margin:0;padding-left:16px}
.ic-tecnico li{margin:1px 0}
.ic-tecnico .ic-pie{margin-top:4px;font-size:11px;opacity:.8}
.ic-trampa{display:inline-flex;align-items:baseline;gap:6px;flex-wrap:wrap;margin-top:5px;padding:2px 9px;border:1px solid #C9A227;border-radius:999px;background:rgba(201,162,39,.16);color:#F0D27A;font-family:"Space Mono",monospace;font-size:10.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase}
.ic-trampa span{font-family:inherit;font-weight:400;letter-spacing:0;text-transform:none;color:var(--muted,#9A867E);font-size:11px}
`
    + (typeof Glosario !== 'undefined' ? Glosario.CSS : '');   // los términos con globo (comun/glosario.js, se carga antes)
  // Un texto con los términos del glosario marcados (al pasar el mouse, su explicación); sin el glosario, el texto tal cual.
  const mk = t => typeof Glosario !== 'undefined' ? Glosario.marcar(t) : esc(t);
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
    // Cómo funciona (dueño, 2026-10-08: «al verla tenés que entender que es una trampa y más o menos cómo funciona»): dónde se dispara (la
    // superficie que se pisa) y a quién alcanza (el efecto), por separado.
    const sup = t.tipo === 'linea' ? Math.max(1, tam) : casillas(tam);
    f.push(['Se dispara', t.tipo === 'linea' ? `cuando un rival pisa cualquiera de sus ${sup} casillas en línea`
      : tam ? `cuando un rival pisa cualquiera de sus ${sup} casillas (flor de diámetro ${2 * tam + 1})` : 'cuando un rival pisa su casilla (una sola)']);
    const ef = t.efecto || {}, area = ef.area || (sup > 1 ? 'trampa' : 'pisador'), r = Math.max(1, num(ef.radio) || 1);
    const ALTURA = {piso: ' (en el piso)', aire: ' (en el aire)', ambos: ' (en el piso y en el aire)'};
    f.push(['Alcanza', (area === 'flor' ? `una flor de diámetro ${2 * r + 1} (${casillas(r)} casillas) alrededor ${ef.centro === 'trampa' ? 'del centro de la trampa' : 'de donde la pisan'}`
      : area === 'trampa' ? (sup > 1 ? `a todos los que estén sobre sus ${sup} casillas` : 'a quien la pisa') : 'solo a quien la pisa') + (ALTURA[t.altura] || '')]);
    const ELEM = {fuego: 'de fuego', hielo: 'de hielo', rayo: 'eléctrico', toxico: 'tóxico', acido: 'de ácido'};
    if(t.dano) f.push(['Daño', `${t.dano}${ELEM[t.elemento] ? ' ' + ELEM[t.elemento] : ''} · ${t.ignoraDef ? 'directo a la vida' : 'contempla la armadura'}${ELEM[t.elemento] ? ' (lo frena su resistencia y la Defensa especial)' : ''}`]);
    // El efecto: lo que aplica el mapa solo (el estado) y lo que queda a mano (efectoManual).
    if(t.estado){
      const sinFin = {Sentado: 'hasta que se pare', Sangrado: 'hasta que lo curen'}[t.estado];
      const txt = `${t.estado}${num(t.estadoStacks) > 0 ? ' ×' + t.estadoStacks : ''}${num(t.estadoHp) ? ` (${Math.abs(num(t.estadoHp))} de daño por turno)` : ''}${num(t.estadoTurnos) > 0 ? ` · ${t.estadoTurnos} turno${num(t.estadoTurnos) === 1 ? '' : 's'}` : sinFin ? ` · ${sinFin}` : ''}`;
      f.push(['Efecto', txt]);
    }
    if(t.efectoManual) f.push([t.estado ? 'Además' : 'Efecto', t.efectoManual, 'a mano']);
    if(t.teleport) f.push(['Efecto', 'Teletransporta a quien la pisa']);
    if(t.muro){ const l = num(t.muro.largo) >= 5 ? 5 : num(t.muro.largo) >= 3 ? 3 : 1;
      f.push(['Efecto', `${l === 1 ? 'Un pilar' : `Un muro de ${l} casillas`} justo delante de quien la pisa · ${num(t.muro.turnos) || 4} turnos (si hay alguien ahí, sale despedido y recibe 1d6)`]); }
    if(!t.dano && !t.estado && !t.efectoManual && !t.teleport && !t.muro) f.push(['Efecto', 'Solo avisa cuando se dispara']);
    const s = t.salvacion && t.salvacion.stat ? t.salvacion : null;
    const QUE = {todo: 'la evita entera', efecto: t.dano ? 'resiste lo que le deja (el daño entra igual)' : 'lo resiste', mitad: 'la mitad del daño'};
    if(!s) f.push(['Se resiste', 'no']);
    else f.push([s.que === 'efecto' ? 'Se resiste' : 'Se evita', `${s.etq || s.stat} contra ${s.dif} → ${s.logra || QUE[s.que] || QUE.todo}`]);
    if(t.pierdeSp) f.push(['Efecto', `pierde ${t.pierdeSp} de SP`]);
    if(t.renuevaPaso) f.push(['Al caminarla', 'cada paso sobre ella le vuelve a poner el estado en sus turnos']);
    if(t.requiereDano) f.push(['Si lastima', 'lo que deja solo entra si el daño pasa la Defensa']);
    if(t.portal && num(t.portal.rango) > 0) f.push(['Teletransporta', `quien la pone elige adónde lo manda, hasta ${num(t.portal.rango)} casillas`]);
    if(t.cadena && num(t.cadena.rango) > 0) f.push(['Salta', `al enemigo más cercano a ${num(t.cadena.rango)} casillas o menos, con la mitad del daño (hacia abajo: con 1 ya no salta); una vez por enemigo`]);
    if(t.danoZona) f.push(['Después', `el piso sigue haciendo ${t.danoZona} de daño en cada Mantenimiento`]);
    if(num(t.lento) > 0) f.push(['Terreno', `una vez disparada, cada paso que sale de ella cuesta ${num(t.lento)} No2`]);
    const so = t.soltar && t.soltar.stat ? t.soltar : null;   // salir antes de que venza (el botón 🔓 Soltarse)
    if(so) f.push(['Para salir', `🔓 Soltarse: ${so.etq || so.stat} contra ${num(so.dif)} · ${num(so.no2)} No2${num(so.hunde) ? ` · si falla, se hunde más: +${num(so.hunde)} turno${num(so.hunde) === 1 ? '' : 's'}` : ''}`]);
    f.push(['Detectarla', t.detectarStat ? `Percepción contra ${t.detectarStat === 'dmgesp' ? 'el Efecto especial' : 'la Destreza'} de quien la pone` : num(t.detectar) >= 1 ? `Percepción contra ${num(t.detectar)}` : 'sin definir']);
    if(t.dejaZona) f.push(['Después', `queda como zona ${num(t.zonaTurnos) || 3} turnos`]);
    if(t.amiga) f.push(['Alcanza', 'también a los aliados del área']);
    return f;
  }
  function filasHtml(filas){
    estilos();
    return `<div class="ic-filas">${filas.map(([e, v, nota]) => `<span class="ic-e">${esc(e)}</span><span class="ic-v">${mk(v)}${nota ? ` <span class="ic-mano">(${esc(nota)})</span>` : ''}</span>`).join('')}</div>`;
  }
  // El distintivo de una trampa (dueño, 2026-10-08: «tiene que ser visiblemente claro cuando un ítem es trampa»).
  const TRAMPA_BADGE = '<div class="ic-trampa">🪤 Trampa <span>se coloca en el mapa · la dispara un rival al pisarla</span></div>';
  const trampaHtml = t => TRAMPA_BADGE + filasHtml(trampaFilas(t));

  /* ---------- Armas (regla del dueño, 2026-10-03: como las trampas) ----------
     En la grilla, lo esencial —Tipo, dados, daño, bonos, efectos— dando por sabidas las reglas (`armaEsencial`: la línea que se usa como
     Detalle de las armas del rework). Al abrir el ítem, «Detalles técnicos» explica cada mecánica que tiene (`armaTecnico`), armado de los
     datos del arma: no hay que escribirlo a mano en cada una. */
  const esArma = it => !!(it && /^arma_/.test(String(it.tipoItem || '')));
  const BONO = {pdg: 'PdG', pdgopor: 'PdG en oportunidad', pdgcontra: 'PdG en contraataque', rng: 'Alcance', ini: 'Iniciativa', crit: 'Crítico frecuente',
    critpot: 'Crítico potente', parry: 'Parry', bloqueo: 'Bloqueo', dmg: 'Dmg', eva: 'Evasión'};
  const EFECTO = {envenenar: 'Veneno', 'veneno severo': 'Veneno severo', sangrado: 'Sangrado', lisiado: 'Lisiado', 'rompe armadura': 'Rompe armadura',
    aturdir: 'Aturdir', derribar: 'Derribar', rengo: 'Rengo', 'prende fuego': 'Prende fuego', 'drena vida': 'Drena vida', demora: 'Demora'};
  const nombreEf = e => EFECTO[String(e.nombre || '').trim().toLowerCase()] || String(e.nombre || '').trim();
  const pctEf = e => { const c = Math.max(1, num(e.caras) || 1), x = Math.min(c, Math.max(1, num(e.exitos) || 1)); return x >= c ? 100 : Math.round(x / c * 100); };
  // Qué se tira para un efecto con porcentaje (dueño, 2026-10-03: «17 % (6 en d6)», bien sintético): «6 en d6», «5–6 en d6».
  const dadoEf = e => { let c = Math.max(1, num(e.caras) || 1), x = Math.min(c, Math.max(1, num(e.exitos) || 1)); if(c === 3){ c = 6; x *= 2; }   // un d3 se tira con d6 (5 o 6)
    if(c === 5){ c = 10; x *= 2; }  // y un d5 con d10 (9 o 10; dueño, 2026-10-06)
    return `${x > 1 ? (c - x + 1) + '–' : ''}${c} en d${c}`; };
  const pctTxt = e => `${pctEf(e)} % (${dadoEf(e)})`;
  const durPP = it => num(it.durPorPeso) > 0 ? num(it.durPorPeso) : 3;
  const durMax = it => typeof Combatiente !== 'undefined' && Combatiente.durMax ? Combatiente.durMax(it) : Math.max(3, Math.round(durPP(it) * Math.max(0, Math.round(num(it.peso)))));
  // «Sangrado 50 % (2 en d2) · 2 turnos», «Veneno 3 stacks (siempre)», «Lisiado 25 % (4 en d4), seguro si es crítico».
  function efectoCorto(e){
    const pct = pctEf(e);
    let n = nombreEf(e);
    if(n === 'Rompe armadura' && num(e.stacks) > 1) n = `Armadura rota ${num(e.stacks) === 2 ? 'doble' : '×' + num(e.stacks)}`;   // 2 stacks por golpe (Raras del Tipo 8)
    if(e.danoMagico){   // «eléctrico» y «tóxico» son adjetivos: «+1d4 eléctrico» (el rayo, en lo que se ve, es eléctrico: dueño, 2026-10-07)
      const n = String(e.nombre || 'magia').toLowerCase();
      return /^(rayo|el[eé]ctric|t[oó]xic)/.test(n) ? `+${e.dado} ${/^t/.test(n) ? 'tóxico' : 'eléctrico'}` : `+${e.dado} de ${n}`;
    }
    if(n === 'Drena vida') return `${e.soloCritico ? 'Si es crítico: drena otro' : 'Drena vida'} ${num(e.drenaPct) > 0 ? num(e.drenaPct) : 50} %`;
    if(e.soloCritico) return `Si es crítico: ${n}${num(e.stacks) > 0 && /^(Veneno|Sangrado)$/.test(n) ? ` ${num(e.stacks)} stacks` : ''}${pct < 100 ? ` ${pctTxt(e)}` : ''}${num(e.turnos) > 0 ? ` · ${num(e.turnos)} turnos` : ''}`;
    const st = num(e.stacks) > 0 && /^(Veneno|Sangrado)$/.test(n) ? ` ${num(e.stacks)} stacks` : '';
    return `${n}${st} ${pct >= 100 ? '(siempre)' : pctTxt(e)}${e.permanente ? ' · permanente' : num(e.turnos) > 0 ? ` · ${num(e.turnos)} turnos` : ''}${e.seguroCritico && pct < 100 ? ', seguro si es crítico' : ''}`;
  }
  function armaEsencial(it){
    if(!esArma(it)) return '';
    if(it.especial){   // ✨ arma especial (2026-10-05): su daño (si tiene) y lo que cuesta, sin Tipo ni dados por Peso
      const e = it.especial, du = e.duelo || {};
      return ['✨ Arma especial', ...(e.dano ? [`${e.dano}${e.sumaEspecial ? ' + Ef.Esp' : ''} ${du.tipoDano || 'arcano'}`] : []), `${num(e.no2 ?? 1)} No2 + ${num(e.sp)} SP por uso`].join(' · ');
    }
    const peso = Math.max(1, num(it.peso) || 1), amp = Math.max(0, num(it.danoAmplificado)), tipo = num(it.tipoDado) || 8;
    const p = [`Tipo ${tipo}`];
    if(it.tipoItem === 'arma_2m') p.push('2 manos');
    if(it.armaDeRango) p.push(Combatiente.esArco(it) ? 'arco' : 'a distancia');
    p.push(`${peso} dado${peso === 1 ? '' : 's'}${amp ? ` + ${amp} amplificado${amp === 1 ? '' : 's'}` : ''}`);
    if(num(it.danoFijo)) p.push(`${num(it.danoFijo) > 0 ? '+' : ''}${num(it.danoFijo)} de daño`);
    (it.mods || []).forEach(m => { if(m && m.stat && num(m.val) && m.stat !== 'def') p.push(`${m.stat === 'rng' && it.armaDeRango ? 'Rango' : (BONO[m.stat] || m.stat)} ${num(m.val) > 0 ? '+' : ''}${num(m.val)}`); });   // en un arma de rango, «Rango» (no Alcance)
    const ign = num(it.ignoraResistCrit) + (it.efectosGolpe || []).reduce((a, e) => { const m = /^ignora\s+(\d+)\s+de\s+res/i.exec(String((e && e.nombre) || '').trim()); return a + (m ? num(m[1]) : 0); }, 0);
    if(ign) p.push(`Ignora ${ign} de Res. crítico`);
    (it.efectosGolpe || []).forEach(e => { if(e && e.nombre && !/^ignora\s+\d+\s+de\s+res/i.test(String(e.nombre).trim())) p.push(efectoCorto(e)); });
    if(it.sinParry) p.push('No se puede parrear');
    if(it.oporGratis) p.push('Oportunidad sin No2');
    if(Combatiente.recargaDe && Combatiente.recargaDe(it)) p.push(`Recarga ${Combatiente.recargaDe(it)}`);
    if(num(it.perfora) > 0) p.push(`Perfora ${Math.round(num(it.perfora))}`);   // ignora N de Defensa (2026-10-10; el globo lo explica)   // la ballesta (2026-10-10): el globo del glosario explica cuánto cuesta
    if(it.armaDeRango && Combatiente.esArco(it) && it.sinTiroAlto) p.push('Sin tiro alto');
    else if(it.armaDeRango && !Combatiente.esArco(it) && it.tiroAlto) p.push('Tiro alto');
    if(it.armaDeRango && it.ideal && it.ideal.donde) p.push(Combatiente.idealTxt(it.ideal));
    if(num(it.ahorroNitros)) p.push(`Primer ataque −${num(it.ahorroNitros)} No2`);
    if(num(it.critD20)) p.push(`+${num(it.critD20)} d20 en el crítico`);
    const dx = Math.round(num(it.durExtra));
    if(dx > 0 || num(it.durPorPeso) > 3) p.push(`Resistente${dx > 0 ? ' ×' + dx : ''} (durabilidad ${durMax(it)})`);
    else if(dx < 0 || (num(it.durPorPeso) > 0 && num(it.durPorPeso) < 3)) p.push(`Frágil${dx < 0 ? ' ×' + (-dx) : ''} (durabilidad ${durMax(it)})`);
    const es = it.espalda;
    if(es && (num(es.pdg) || num(es.fijo) || num(es.critpot))) p.push(`Por la espalda (en sigilo): ${[num(es.pdg) ? `+${num(es.pdg)} PdG` : '', num(es.fijo) ? `+${num(es.fijo)} de daño` : '', num(es.critpot) ? `+${num(es.critpot)} Crítico potente` : ''].filter(Boolean).join(', ')}`);
    return p.join(' · ');
  }
  // «Detalles técnicos» de un arma (2026-10-09, dueño: «una vez que esté la explicación con el hover, se borra del detalle técnico para que no
  // sea redundante; que sea más amigable a la vista»): solo lo que NO explica un globo del glosario (comun/glosario.js: Tipo, Perfora, tiro
  // alto, Crítico frecuente, cada efecto…). Lo que queda: el Peso, el Alcance o Rango, la línea de tiro, cómo se tiran los efectos y la
  // durabilidad con su número.
  function armaTecnico(it){
    if(!esArma(it)) return [];
    if(it.especial){   // ✨ arma especial (varita, báculo, 2026-10-05): cómo se usa y qué cuesta
      const e = it.especial, du = e.duelo || {};
      const E = [`Se usa desde «✨ Atacar» de la Botonera, con su propio recorrido (sin oportunidad ni contraataque).`,
        `Cuesta ${num(e.no2 ?? 1)} No2 el primer uso del turno, ${num(e.sube ?? 1)} más por cada uso siguiente y ${num(e.sp)} SP por uso (sin SP: 1 No2 más por cada SP).`];
      if(e.sumaEspecial) E.push(`Suma ${e.sumaEspecial === true ? 'tu Ef.Esp' : 'la mitad de tu Ef.Esp'} al daño.`);
      if(num(du.critTipo)) E.push(`Es física: la frena la Defensa y critica como un arma de Tipo ${num(du.critTipo)}.`);
      E.push('No sirve para parrear ni bloquear.');
      return E;
    }
    const peso = Math.max(1, num(it.peso) || 1), L = [];
    L.push(`Peso ${peso}: ${peso} dado${peso === 1 ? '' : 's'} de daño y lo que carga mientras está equipada.`);
    if((it.mods || []).some(m => m && m.stat === 'rng' && num(m.val))) L.push(it.armaDeRango
      ? 'Rango: lo que el arma le suma a tu Rango (de la Destreza): hasta dónde llega el disparo.'
      : 'Alcance: pega a más casilleros de distancia sin dejar de ser cuerpo a cuerpo (sigue sumando el Dmg).');
    if(it.armaDeRango) L.push('Dispara con Línea de tiro. ⚙ El mapa muestra la línea al apuntar.');
    const efs = (it.efectosGolpe || []).filter(e => e && e.nombre && !/^ignora\s+\d+\s+de\s+res/i.test(String(e.nombre).trim()));
    if(efs.some(e => pctEf(e) < 100 && !e.soloCritico)) L.push('Los porcentajes se tiran en el duelo, después del daño.');
    if(efs.length) L.push('⚙ El duelo tira los efectos y los aplica con «Aplicar».');
    const dx = Math.round(num(it.durExtra));
    if(dx) L.push(`Durabilidad ${durMax(it)} (${dx > 0 ? `+${dx}` : `−${-dx}`} sobre lo normal).`);
    else if(num(it.durPorPeso) > 0 && num(it.durPorPeso) !== 3) L.push(`Durabilidad ${durMax(it)} (${durPP(it)} por punto de Peso; lo normal es 3).`);
    return L;
  }
  // Lo que se ve de un ítem en la tarjeta de una grilla para elegir.
  function grillaHtml(item){
    estilos();
    if(!item) return '';
    if(item.trampaDatos) return trampaHtml(item.trampaDatos);
    const p = partes(item.detalle);
    const hace = p.hace || armaEsencial(item);   // un arma sin Detalle: lo esencial, de sus datos
    return hace ? `<div class="ic-hace cat-detalle">${mk(hace)}</div>` : '';
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
    const notas = String(p.tecnico || '').split(/\s*(?=[⚙✋])/).map(x => x.trim()).filter(Boolean);
    const dicen = notas.join(' ');   // lo que ya cuentan las notas del ítem no se repite (el costo de una varita, por ejemplo)
    const lineas = [...notas, ...extra.filter(l => !(/^Cuesta /.test(l) && /Cuesta/.test(dicen)))].filter(Boolean);
    if(!lineas.length && !p.auditar) return '';
    return `<div class="ic-tecnico"><b>Detalles técnicos</b>${lineas.length ? `<ul>${lineas.map(l => `<li>${mk(l)}</li>`).join('')}</ul>` : ''}`
      + `${p.auditar ? '<div class="ic-pie">Creada automáticamente: las cifras están para auditar.</div>' : ''}</div>`;
  }
  // Lo de «Ver»: qué hace (una trampa, en datos cortos), el Detalle sin las notas técnicas y el recuadro «Detalles técnicos».
  function verHtml(item){
    if(!item) return '';
    const p = partes(item.detalle);
    return (item.trampaDatos ? `<div class="view-detalle"><span class="view-label">Qué hace</span>${trampaHtml(item.trampaDatos)}</div>` : '')
      + (p.hace ? `<div class="view-detalle"><span class="view-label">Detalle</span>${mk(p.hace)}</div>` : '')
      + tecnicoHtml(item);
  }
  return {CSS, partes, trampaFilas, trampaHtml, filasHtml, grillaHtml, tecnicoHtml, verHtml, armaEsencial, armaTecnico};
})();
