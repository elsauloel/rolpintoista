// js/11-combate.js — tramo 11 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   MANTENIMIENTO Y REINICIO
   ========================================================= */

function renderTurno(){
  // El número de turno se muestra en la cabecera de la Mesa flotante.
  if(typeof mesaPonerTurno === 'function') mesaPonerTurno(S.turno || 1);
}

function renderNitros(){
  const box = $('#nitros-box');
  if(!box) return;
  const fNitros = $('#f-nitros');
  if(document.activeElement !== fNitros) fNitros.value = fmt(num(S.nitros));
  $('#btn-atacar-pdg').title = `Cuesta Nitros · ${costoAtaqueTxt()}`;
  box.classList.toggle('agotadas', num(S.nitros) <= 0);
  const max = compute().final.nitros;
  $('#v-nitros-max').textContent = Number.isNaN(max) ? '?' : fmt(max);
  if($('#scrim-botonera').classList.contains('open')) renderBotonera();
}

// Número del costo en SP de una habilidad, y el costo variable (X) en SP o en Nitros (se elige al ejecutar):
// comun/ficha-habilidades.js (paso 5, nivel B, área 3) — mismas funciones, puras.
const parseCostoSp = FichaHabilidades.parseCostoSp;
const spVariable = FichaHabilidades.spVariable;
const nitrosVariable = FichaHabilidades.nitrosVariable;
const nitrosAtaque = FichaHabilidades.nitrosAtaque;
const habCostoVariable = FichaHabilidades.habCostoVariable;

// Nitros fijos de una habilidad (0 si son X: se eligen al usarla).
function costoNitrosHab(h, arma){ return FichaBotonera.costoNitrosHab(S, h, arma); }   // comun/ficha-botonera.js

/* ---------- Moverse: los Nitros se gastan desde el mapa (arrastrando el token);
   la ficha solo publica cuánto cuesta cada casillero (ver fichaResumen) ---------- */

function estadoActivo(flag){ return FichaResumen.estadoActivo(S, flag); }   // comun/ficha-resumen.js

function costoMoverCasillero(){ return FichaResumen.costoMoverCasillero(S); }

function sinNitrosPara(h){ return FichaBotonera.sinNitrosPara(S, h); }   // comun/ficha-botonera.js

/* ---------- Atacar: cada arma paga Tipo ÷ 2 su primer ataque del turno y Tipo completo los demás ---------- */

// Qué arma, su Tipo, cuántos ataques lleva y cuánto cuesta el próximo: comun/ficha-combate.js (paso 5, nivel B, área 2).
const claveAtaque = FichaCombate.claveAtaque;
const tipoAtaque = FichaCombate.tipoAtaque;
const ataquesConArma = arma => FichaCombate.ataquesConArma(S, arma);
function costoAtaqueNitros(arma){ return FichaCombate.costoAtaque(S, arma); }

function costoAtaqueTxt(){
  const armas = armasEquipadasConDano();
  if(!armas.length) return `sin arma: ${costoAtaqueNitros(null)} No2 ⚠ provisorio`;
  return armas.map(a => `${a.item.nombre}: ${costoAtaqueNitros(a.item)} No2 (${ataquesConArma(a.item) ? 'Tipo completo' : 'primer ataque, Tipo ÷ 2'})`).join(' · ');
}

const esArmaEnMano = id => FichaCombate.esArmaEnMano(S, id);

// PdG al atacar con un arma: no cuentan los modificadores de PdG que vienen
// de otra arma equipada (cada arma aporta el suyo solo cuando ataca).
function pdgParaArma(arma, c){ return FichaCombate.pdgParaArma(S, arma, c); }   // sin los bonos de PdG de la otra arma

/* ---------- Parry y Bloqueo con arma o escudo ----------
   Parry: siempre cuesta 1 No2 (2026-09-26, dueño; antes el Peso del arma o escudo), sin importar el arma o escudo ni cuántos ataques hiciste en
   el turno. Se puede parriar con cualquier arma o escudo equipado, no
   solo con las que hacen daño (`armasYEscudosParaParry`).
   Bloqueo: tira el substat Bloqueo (sale de Fuerza) MÁS el peso del arma o escudo, y la SUMA es el dado (`bloqueoValorConArma`, 2026-09-24).
   Con más de un arma/escudo equipado, el Parry pregunta con cuál. Sin arma ni escudo no hay Parry ni Bloqueo, y el
   Bloqueo SOLO existe después de un Parry, con la misma arma o escudo (reglas del dueño, 2026-09-30 — ver
   comun/combatiente.js, BLOQUEO_SOLO_TRAS_PARRY). */
// Arma o escudo con el que se hizo el último Parry (id). El Bloqueo que sigue usa ese mismo sin volver a preguntar.
// null = no hay un Parry esperando su Bloqueo (entonces no hay Bloqueo). Se limpia al bloquear, atacar o pasar el turno.
let parryArmaPendiente = null;
// El Parry siempre cuesta 1 No2 (2026-09-26, dueño). Antes: el Peso del arma o escudo (2026-09-24) y antes la mitad.
const costoParryNitros = () => Combatiente.costoParry();   // SIEMPRE 1 No2, sin importar el arma o escudo (comun/combatiente.js)

// A diferencia de armasEquipadasConDano() (para Atacar/Daño Arma/Bloqueo),
// acá entra cualquier arma O ESCUDO equipado, tenga o no daño: para
// parriar alcanza con la mano, el escudo no ataca pero sí para.
function armasYEscudosParaParry(){ return FichaCombate.armasYEscudosParaParry(S); }   // comun/ficha-combate.js

function costoParryTxt(){ return FichaBotonera.costoParryTxt(S); }   // comun/ficha-botonera.js

// Valor del stat cuando se usa ESA arma: no cuentan los modificadores que vienen de otra arma equipada.
// Parry y Bloqueo (P129, dueño 2026-09-30, "cada uno con lo suyo"): tampoco cuentan los de un ESCUDO que no es con el que se
// para — el +1 al Parry de un escudo vale al parar con ese escudo, y el de la espada, con la espada.
const STATS_DEFENSA_POR_ITEM = FichaCombate.STATS_DEFENSA_POR_ITEM;
const esEnMano = id => FichaCombate.esEnMano(S, id);
function statParaArma(statId, arma){ return FichaCombate.statParaArma(S, statId, arma); }   // comun/ficha-combate.js

function parryConArma(arma, forzar){
  const costo = costoParryNitros(arma);
  const con = arma ? ' con ' + arma.nombre : '';
  if(costo > num(S.nitros) && !forzar){
    avisarSinNitros(costo, `hacer Parry${con}`, () => parryConArma(arma, true));
    return;
  }
  S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, `hizo Parry${con}`) : costo);
  renderNitros();
  parryArmaPendiente = arma ? arma.id : null;   // queda esperando su Bloqueo (si ganás el Parry)
  tirarValorStat(arma ? `Parry · ${arma.nombre}` : 'Parry', statParaArma('parry', arma), 'parry');
  toast(`Parry${con}: −${fmt(costo)} No2 · te quedan ${fmt(num(S.nitros))}${arma ? ' · si lo ganás, tirá el Bloqueo' : ''}`);
  refresh();
  if($('#scrim-botonera').classList.contains('open')) renderBotonera();
}

// El Bloqueo se calcula así (2026-09-24, pedido del dueño): tu Bloqueo (que sale de la Fuerza, con lo que le suma tu equipo) MÁS el
// peso del arma elegida; ESA SUMA es el valor que se convierte en dado (antes el peso se sumaba aparte, como número fijo).
function bloqueoValorConArma(arma){ return FichaCombate.bloqueoValor(S, arma); }   // Bloqueo + peso: esa suma es el dado
function bloqueoConArma(arma){
  tirarValorStat(arma ? `Bloqueo · ${arma.nombre}` : 'Bloqueo', bloqueoValorConArma(arma), 'bloqueo');
}

// Menú de Atacar (2026-09-26, pedido del dueño): el botón Atacar pregunta QUÉ ataque es, para automatizar el costo en Nitros de cada uno.
//  · Ataque normal: el primero del turno con esa arma cuesta Tipo ÷ 2; los siguientes, el Tipo completo (cuenta como ataque).
//  · Ataque de oportunidad y Contraataque (regla a prueba: tras un Parry con arma o escudo): SIEMPRE cuestan Tipo ÷ 2 (lo de un primer ataque) y NO suman al conteo de ataques del turno.
const costoAtaqueEspecial = FichaCombate.costoAtaqueEspecial;
const NOMBRE_ATAQUE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
function ataqueEspecialConArma(arma, tipo, forzar){
  const costo = costoAtaqueEspecial(arma), nombre = NOMBRE_ATAQUE_ESPECIAL[tipo] || 'Ataque';
  const con = arma ? ' con ' + arma.nombre : '';
  if(costo > num(S.nitros) && !forzar){
    avisarSinNitros(costo, `hacer un ${nombre.toLowerCase()}${con}`, () => ataqueEspecialConArma(arma, tipo, true));
    return;
  }
  S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, `hizo un ${nombre.toLowerCase()}${con}`) : costo);
  renderNitros();
  // Solo el contraataque suma el «PdG en contraataque» de la propia arma (los tipos 6 lo traen: +1 a +3, mucho menos valioso que un PdG normal porque es circunstancial);
  // y solo el ataque de oportunidad suma el «PdG en oportunidad» (los tipos 4, mismo criterio).
  const bonoContra = tipo === 'contra' ? statParaArma('pdgcontra', arma) : tipo === 'oportunidad' ? statParaArma('pdgopor', arma) : 0;
  tirarValorStat(`${nombre} · PdG${arma ? ' · ' + arma.nombre : ''}`, pdgParaArma(arma).valor + (Number.isNaN(bonoContra) ? 0 : bonoContra), 'pdg');
  toast(`${nombre}${con}: −${fmt(costo)} No2 (lo de un primer ataque)${bonoContra > 0 ? ` · PdG +${fmt(bonoContra)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · te quedan ${fmt(num(S.nitros))}`);
  refresh();
}
function preguntarTipoAtaque(arma){
  const costoNormal = costoAtaqueNitros(arma), primero = ataquesConArma(arma) === 0, especial = costoAtaqueEspecial(arma);
  const id = arma ? arma.id : '';
  $('#tipo-ataque-lista').innerHTML = `<div class="hint">${arma ? esc(arma.nombre) : 'Sin arma'}</div>
    <button class="btn" data-tipoataque="normal:${id}" style="width:100%">⚔ Ataque normal — ${fmt(costoNormal)} No2<br><span class="hint">${primero ? 'primer ataque con esta arma (Tipo ÷ 2)' : 'Tipo completo (ya atacaste con esta arma este turno)'}</span></button>
    <button class="btn" data-tipoataque="oportunidad:${id}" style="width:100%">🏃 Ataque de oportunidad — ${fmt(especial)} No2<br><span class="hint">siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>
    <button class="btn" data-tipoataque="contra:${id}" style="width:100%">↩ Contraataque — ${fmt(especial)} No2<br><span class="hint">tras un Parry; siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>`;
  $('#scrim-tipo-ataque').classList.add('open');
}
$('#tipo-ataque-x').onclick = () => $('#scrim-tipo-ataque').classList.remove('open');
$('#scrim-tipo-ataque').addEventListener('mousedown', e => { if(e.target.id === 'scrim-tipo-ataque') $('#scrim-tipo-ataque').classList.remove('open'); });
$('#tipo-ataque-lista').addEventListener('click', e => {
  const b = e.target.closest('[data-tipoataque]');
  if(!b) return;
  const [tipo, armaId] = b.dataset.tipoataque.split(':');
  $('#scrim-tipo-ataque').classList.remove('open');
  const arma = S.inventario.find(x => x.id === armaId) || null;
  const hacer = () => { if(tipo === 'normal') atacarConArma(arma); else ataqueEspecialConArma(arma, tipo); };
  // Duelo paso a paso (comun/duelo.js, 2026-09-26): primero se elige el token al que se ataca; el PdG (y sus No2) se tiran adentro del duelo.
  // «Sin objetivo» deja el ataque suelto de siempre.
  if(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM){
    Duelo.elegirObjetivo({yo: {ref: fichaVivo.id, tipo: 'pj', nombre: (S.meta && S.meta.nombre) || 'Personaje'},
      ataque: {tipo, armaId: arma ? arma.id : '', armaNombre: arma ? arma.nombre : '', tipoDado: tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), alcance: alcanceDeArma(arma)}, suelto: hacer});
  }else hacer();
});

// Lo que el duelo necesita de esta página (comun/duelo.js): si el lado del duelo es este personaje, y cómo tira su PdG y su Evasión de siempre.
// El lado puede ser el personaje (ref = id de la ficha) o una de sus invocaciones (ref = «fichaId~invId»).
const dueloInvDe = lado => {
  const [f, invId] = String(lado.ref || '').split('~');
  return invId && f === (fichaVivo && fichaVivo.id) ? S.invocaciones.find(x => x.id === invId) || null : null;
};
window.DUELO_HOOKS = {
  soy: lado => {
    if(!(lado && lado.tipo === 'pj' && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM)) return false;
    return lado.ref === fichaVivo.id || !!dueloInvDe(lado);
  },
  // 🎮 Si el GM tiene el control de este personaje, su lado del duelo lo maneja el GM (comun/duelo.js, esMio).
  controlDe: lado => (lado && lado.tipo === 'pj' && fichaVivo && fichaVivo.control && String(lado.ref || '').split('~')[0] === fichaVivo.id) ? fichaVivo.control.uid : '',
  // El ataque de siempre (paga los No2 y tira el PdG).
  atacar: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){ if(d.ataque.tipo === 'habilidad-arma') tirarPdgDeArreglosInv(inv, d.ataque); else invAtacarSuelto(inv.id); return; }   // con arreglos: los No2 ya los cobró la habilidad
    const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : null;
    if(d.ataque.tipo === 'habilidad-arma'){   // los No2 del ataque ya los cobró la habilidad: solo se tira el PdG (con lo que le suma)
      tirarValorStat(arma ? `PdG · ${arma.nombre}` : 'PdG', pdgParaArma(arma).valor + num(d.ataque.mods && d.ataque.mods.pdg), 'pdg');
      return;
    }
    if(d.ataque.tipo === 'normal') atacarConArma(arma); else ataqueEspecialConArma(arma, d.ataque.tipo);
  },
  // Para el crítico: el Crítico frecuente y potente del atacante (con el arma que usa) y la Resistencia a crítico del defensor contra el Tipo del arma.
  statsCritico: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){   // las invocaciones siguen las mismas reglas que los creeps
      const f = invStatValor(inv, 'crit'), p = invStatValor(inv, 'critpot');
      return {frecuente: Number.isNaN(f) ? 0 : Math.max(0, Math.round(f)), potente: Number.isNaN(p) ? 0 : Math.max(0, Math.round(p))};
    }
    const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : null;
    const f = statParaArma('crit', arma), p = statParaArma('critpot', arma);
    return {frecuente: Number.isNaN(f) ? 0 : Math.max(0, Math.round(f)), potente: Number.isNaN(p) ? 0 : Math.max(0, Math.round(p))};
  },
  resistenciaCritico: d => {
    const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
    if(i < 0) return 0;
    const inv = dueloInvDe(d.defensor);
    if(inv) return num((inv.crit || [])[i]);
    const v = compute().final['tipo' + (i + 1)];
    return Number.isNaN(v) ? 0 : Math.max(0, Math.round(v));
  },
  // Los efectos al golpear del arma (o de la invocación) que el duelo resuelve uno por uno.
  efectosArma: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv) return (inv.armaEfectos || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)}));
    const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : (armasEquipadasConDano()[0] || {}).item || null;
    return arma ? (arma.efectosGolpe || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)})) : [];
  },
  // El daño del arma del ataque (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
  dano: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){ invDanio(inv.id, true, d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null); return; }
    const arma = d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : (armasEquipadasConDano()[0] || {}).item || null;
    if(!arma){ toast('No hay un arma equipada con daño para tirar'); return; }
    let formula = armaDanoTxt(arma, compute().final.dmg);
    const m = d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null;   // lo que le suma la habilidad: dados del Tipo del arma y daño fijo
    if(m){
      if(num(m.dados) > 0) formula += ` + ${Math.round(num(m.dados))}d${num(arma.tipoDado) || 8}`;
      if(num(m.fijo)) formula += ` ${num(m.fijo) > 0 ? '+' : '−'} ${fmt(Math.abs(num(m.fijo)))}`.replace('−', '-');
    }
    const r = tirarDados(formula);
    if(r) registrarTirada(`Daño · ${arma.nombre}`, r);
  },
  // Moneda Re-Roll (2026-09-27): ¿tengo una y cuánto cuesta? / usarla para reabrir una tirada del duelo.
  rerollInfo: d => {
    if(dueloInvDe(d.atacante) || dueloInvDe(d.defensor)) return {disponible: false};
    const m = monedaReroll();
    return m ? {disponible: true, donde: m.key === 'cinturon' ? 'el cinturón' : 'la mochila'} : {disponible: false};
  },
  rerollUsar: async (d, campo) => {
    const m = monedaReroll();
    if(!m){ toast('No tenés una Moneda Re-Roll'); return false; }
    const ok = await Duelo.reabrir(d.id, campo);
    if(!ok){ toast('La tirada ya no se puede repetir (no se gastó la moneda)'); return false; }
    setTimeout(() => tirarMonedaReroll(m), 800);
    return true;
  },
  // Flash (2026-09-27): las habilidades Flash que me sirven para esta tirada del duelo (se marcan ANTES de tirar) y su uso (cobra los SP; el duelo suma el bono).
  flashOpciones: (d, campo) => {
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    const inv = dueloInvDe(lado);
    if(inv) return (inv.habilidades || []).filter(h => Combatiente.flashPara(h.duelo, campo)).map(h => ({habId: h.id, nombre: h.nombre, bono: num(h.duelo.flash.bono), en: h.duelo.flash.en || [],
      costoTxt: ConfirmarTurno.textoFlash(costoFlashInv(h)), motivoNo: Combatiente.bloqueoHab(h, {hp: inv.hp}).toLowerCase()}));   // invocación: como un creep (cooldown)
    const sp = spMaximo() - num(S.spGastado);
    return S.habilidades.filter(h => Combatiente.flashPara(dueloDe(h), campo))   // regla común (comun/combatiente.js)
      .map(h => { const c = dueloDe(h).flash, costo = parseCostoSp(h.costo); return {habId: h.id, nombre: h.nombre, bono: num(c.bono), en: c.en || [], costoSp: costo,
        costoTxt: ConfirmarTurno.textoFlash(costoFlashDe(h), {spAjeno: h.turnoAjenoSp}), motivoNo: costo > sp ? 'no te alcanzan los SP' : ''}; });
  },
  // Usarlo: «¿es tu turno?» — en turno ajeno cuesta el doble (P136); se cobra al contestar y el duelo suma el bono.
  flashUsar: (d, campo, modo, habId) => {
    const inv = dueloInvDe((campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor);
    if(inv){
      const hi = (inv.habilidades || []).find(x => x.id === habId);
      if(!hi || !Combatiente.flashPara(hi.duelo, campo)) return null;
      if(!Combatiente.flashPara(hi.duelo, campo, modo)){ toast(`${hi.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
      return pagarFlashInv(inv, hi).then(p => p ? {bono: num(hi.duelo.flash.bono), etq: hi.nombre, quien: inv.nombre} : null);
    }
    const h = S.habilidades.find(x => x.id === habId), c = h && dueloDe(h);
    if(!c || c.modo !== 'flash' || !c.flash) return null;
    if(!Combatiente.flashPara(c, campo, modo)){ toast(`${h.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
    return pagarFlash(h).then(p => p ? {bono: num(c.flash.bono), etq: h.nombre, quien: (S.meta && S.meta.nombre) || 'Personaje'} : null);
  },
  // Habilidades dirigidas: la tirada de quien la usa (quien = 'atacante') o la de quien se resiste (quien = 'defensor', modo = el stat que eligió).
  habTirar: (d, quien, modo) => {
    const lado = quien === 'atacante' ? d.atacante : d.defensor;
    const c = quien === 'atacante' ? d.hab.tira : (d.hab.contra || []).find(x => x.modo === modo);
    if(!c) return;
    const nombre = quien === 'atacante' ? `${d.hab.nombre} · ${c.etq}` : c.etq;
    // Tirada personalizada (2026-09-27): la fórmula ya viene resuelta (X sustituida) desde habDueloDe — acá
    // solo se tira y se anuncia, igual que cualquier otra tirada del duelo.
    if(c.formula){ const r = tirarDados(c.formula); if(r) registrarTirada(nombre, r); else toast(`No se pudo tirar «${c.etq}»: la fórmula «${c.formula}» no es válida (revisá la habilidad)`); return; }
    if(!c.stat) return;
    const inv = dueloInvDe(lado);
    const v = inv ? invStatValor(inv, c.stat) : compute().final[c.stat];
    if(inv) tirarValorStatInv(inv, nombre, num(v) + num(c.bono), c.stat);
    else tirarValorStat(nombre, num(v) + num(c.bono), c.stat);
  },
  // «Cuánto tirarías»: la fórmula de dados de ese stat (para el botón de defensa).
  habValor: (d, quien, stat) => {
    const inv = dueloInvDe(quien === 'atacante' ? d.atacante : d.defensor);
    const v = inv ? invStatValor(inv, stat) : compute().final[stat];
    const f = formulaParaValor(num(v));
    return f ? f.formula : fmt(num(v));
  },
  // ¿El objetivo de una habilidad dirigida puede parriar ahora? (2026-09-29, la caja "Parry" del paso Resistencia
  // del 🎯/✨ — misma regla que un ataque normal, P121: sin arma ni escudo equipado, no hay Parry.)
  puedeParry: d => {
    const inv = dueloInvDe(d.defensor);
    return inv ? !!defensaInv(inv) : armasYEscudosParaParry().length > 0;   // arma de verdad o escudo (2026-09-30)
  },
  // Cómo puede defenderse (elige a ciegas): Evasión, o Parry con cada arma o escudo equipado (siempre 1 No2).
  opcionesDefensa: d => {
    // «cuánto tirarías»: la fórmula de dados de cada defensa (con las mitades de Lisiado/Pajaritos/Sentado…) y, para cada Parry, el Bloqueo que tirarías si ganás.
    const fx = (v, statId, estados) => { const f = formulaParaValor(v); if(!f) return fmt(num(v)); const mit = statId ? mitadesDeTirada(estados, statId) : 0; return f.formula + ' ÷2'.repeat(mit); };
    const inv = dueloInvDe(d.defensor);
    if(inv){
      const c = Combatiente.costoParry();
      const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión', info: [`Evasión 🎲 ${fx(invStatValor(inv, 'eva'), 'eva', inv.estados)}`]}];
      // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30; un arma natural no alcanza, por ahora).
      const def = defensaInv(inv);
      if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === inv.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}`, costo: c, motivoNo: c > num(inv.nitros) ? 'no le alcanzan los No2' : '',
        info: [`Parry 🎲 ${fx(invStatValor(inv, 'parry'), 'parry', inv.estados)}`, `si ganás, Bloqueo 🎲 ${fx(bloqueoValorInv(inv))}`]});
      return ops;
    }
    const sobre = compute().sobrecarga;
    // Con sobrepeso (el equipo pasa el Crg.Max) la Evasión pide elegir: pagar 1 No2 para tirar sin penalidad o tirar con −N. Se elige acá, en el cuadro del duelo.
    const ops = sobre > 0
      ? [{modo: 'evasion', itemId: 'pagado', etiqueta: '🏃 Evasión · pagando 1 No2', costo: 1, motivoNo: num(S.nitros) < 1 ? 'no te alcanzan los No2' : '', info: [`Evasión 🎲 ${fx(compute().final.eva, 'eva', S.efectos)}`, `sin la penalidad de sobrepeso (−${fmt(sobre)})`]},
         {modo: 'evasion', itemId: 'penal', etiqueta: `🏃 Evasión · con penalidad −${fmt(sobre)}`, motivoNo: '', info: [`Evasión 🎲 ${fx(compute().final.eva, 'eva', S.efectos)} −${fmt(sobre)}`, 'no gastás No2']}]
      : [{modo: 'evasion', itemId: '', etiqueta: '🏃 Evasión', motivoNo: '', info: [`Evasión 🎲 ${fx(compute().final.eva, 'eva', S.efectos)}`]}];
    // Sin arma ni escudo equipado no se puede parriar (regla del dueño, 2026-09-28) — antes había una opción
    // "Parry (sin arma ni escudo)" gratis; se sacó, no se ofrece nada si `armas` viene vacío.
    const armas = armasYEscudosParaParry();
    armas.forEach(a => {
      const c = costoParryNitros(a.item);
      ops.push({modo: 'parry', itemId: a.item.id, itemNombre: a.item.nombre, etiqueta: `${String(a.item.tipoItem).startsWith('escudo') ? '🛡' : '🗡'} Parry · ${a.item.nombre}`, costo: c, motivoNo: c > num(S.nitros) ? 'no te alcanzan los No2' : '',
        info: [`Parry 🎲 ${fx(statParaArma('parry', a.item), 'parry', S.efectos)}`, `si ganás, Bloqueo 🎲 ${fx(bloqueoValorConArma(a.item))}`]});
    });
    return ops;
  },
  defender: (d, modo, itemId) => {
    const inv = dueloInvDe(d.defensor);
    if(inv){
      if(modo === 'parry') invTirarStat(inv.id, 'parry'); else tirarValorStatInv(inv, 'Evasión', invStatValor(inv, 'eva'), 'eva');
      return;
    }
    if(modo === 'parry') parryConArma(itemId ? S.inventario.find(x => x.id === itemId) || null : null);
    else if(itemId === 'pagado' || itemId === 'penal'){   // Evasión con sobrepeso: la elección ya se hizo en el cuadro del duelo
      const sobre = compute().sobrecarga;
      if(itemId === 'pagado'){
        if(num(S.nitros) < 1){ toast('No tenés No2 para pagar: elegí tirar con la penalidad'); return; }
        S.nitros = num(S.nitros) - 1; renderNitros(); refresh();
      }
      tirarValorStat('Evasión', compute().final.eva, 'eva', undefined, itemId === 'pagado' ? 'pagado' : 'penal', sobre);
    }
    else tirarValorStat('Evasión', compute().final.eva, 'eva');
  },
  // La Fuerza del golpe del atacante contra el Bloqueo del defensor (Fue + peso de su arma).
  fuerza: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){ tirarValorStatInv(inv, 'Fuerza del golpe', invStatValor(inv, 'fue') + pesoArmaInv(inv), 'fue'); return; }
    fuerzaGolpeConArma(d.ataque.armaId ? S.inventario.find(x => x.id === d.ataque.armaId) || null : null);
  },
  // El Bloqueo del defensor con el mismo arma o escudo con el que hizo Parry.
  bloquear: d => {
    const inv = dueloInvDe(d.defensor);
    if(inv){ invTirarStat(inv.id, 'bloqueo', {trasParry: true}); return; }   // el duelo ya sabe que ganó el Parry
    const it = d.defensa && d.defensa.itemId ? S.inventario.find(x => x.id === d.defensa.itemId) || null : null;
    parryArmaPendiente = null;
    // Con el arma o escudo del Parry; si ya no está, con el primero que haya en mano; sin nada, no hay Bloqueo.
    const conQue = it || ((armasYEscudosParaParry()[0] || {}).item) || null;
    if(!conQue){ toast(Combatiente.SIN_ARMA_DEFENSA); return; }
    bloqueoConArma(conQue);
  },
  // Con qué arma contraataca (la del Parry si es un arma con daño; si no, la primera arma equipada con daño).
  armaContra: d => {
    const inv = dueloInvDe(d.defensor);
    if(inv) return {armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8};
    const usada = d.defensa && d.defensa.itemId ? S.inventario.find(x => x.id === d.defensa.itemId) : null;
    const conDano = armasEquipadasConDano();
    const it = (usada && conDano.some(a => a.item.id === usada.id)) ? usada : (conDano.length ? conDano[0].item : null);
    return {armaId: it ? it.id : '', armaNombre: it ? it.nombre : '', tipoDado: tipoAtaque(it)};
  },
};

// Fuerza del golpe (2026-09-26, reglas del escudo): la tirada del ATACANTE contra el Bloqueo del defensor. Si el defensor gana el Parry (con arma o escudo),
// su Bloqueo (Fuerza + peso de lo que usó) se enfrenta a tu Fuerza + el peso de tu arma; esa suma es el dado. Sin costo.
function fuerzaGolpeValorConArma(arma){
  return statParaArma('fue', arma) + (arma ? num(arma.peso) : 0);
}
function fuerzaGolpeConArma(arma){
  tirarValorStat(arma ? `Fuerza del golpe · ${arma.nombre}` : 'Fuerza del golpe', fuerzaGolpeValorConArma(arma), 'fue');
}

// Botones 🎲 Parry y 🎲 Bloqueo: con dos o más armas equipadas se elige con cuál.
function elegirArmaDefensa(tipo){
  // Bloqueo justo después de un Parry: es con la misma arma, no se elige otra vez.
  // El Bloqueo solo existe después de un Parry, y es con la misma arma o escudo (regla del dueño, 2026-09-30).
  if(tipo === 'bloqueo'){
    const armaDelParry = parryArmaPendiente ? S.inventario.find(x => x.id === parryArmaPendiente && x.equipado) : null;
    parryArmaPendiente = null;
    if(armaDelParry) bloqueoConArma(armaDelParry);
    else toast(Combatiente.BLOQUEO_SOLO_TRAS_PARRY);
    if($('#scrim-botonera').classList.contains('open')) renderBotonera();
    return;
  }
  // Parry: con un arma o un escudo (regla del dueño, 2026-09-30); la Fuerza del golpe, con un arma que pega.
  const armas = tipo === 'fuerza' ? armasEquipadasConDano() : armasYEscudosParaParry();
  if(tipo !== 'fuerza' && !armas.length){ toast(Combatiente.SIN_ARMA_DEFENSA); return; }
  const ir = arma => (tipo === 'parry' ? parryConArma(arma) : tipo === 'fuerza' ? fuerzaGolpeConArma(arma) : bloqueoConArma(arma));
  if(armas.length <= 1){ ir(armas.length ? armas[0].item : null); return; }
  $('#elegir-arma-lista').innerHTML =
    `<div class="hint">${tipo === 'parry' ? 'Parry: siempre cuesta 1 No2, sea cual sea el arma o escudo que elijas.' : tipo === 'fuerza' ? 'Fuerza del golpe: tu Fuerza + el peso del arma que elijas; esa suma es el dado (contra el Bloqueo del defensor).' : 'Bloqueo: tu Bloqueo + el peso del arma o escudo que elijas; esa suma es el dado que tirás. (Después de un Parry se usa el mismo, solo.)'}</div>` +
    armas.map(a => `
    <button class="btn" data-defarma="${tipo}:${a.item.id}" style="width:100%">
      ${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${tipo === 'parry' ? `${fmt(costoParryNitros(a.item))} No2` : `+${fmt(num(a.item.peso))} de peso`}
    </button>`).join('');
  $('#scrim-elegir-arma').classList.add('open');
}

function atacarConArma(arma, forzar){
  parryArmaPendiente = null;
  const costo = costoAtaqueNitros(arma);
  if(costo > num(S.nitros) && !forzar){
    avisarSinNitros(costo, `atacar${arma ? ' con ' + arma.nombre : ''}`, () => atacarConArma(arma, true));
    return;
  }
  S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(costo, `atacó${arma ? ' con ' + arma.nombre : ''}`) : costo);
  const primero = FichaCombate.registrarAtaque(S, arma);   // cuenta el ataque con esa arma (comun/ficha-combate.js)
  renderNitros();
  tirarValorStat(arma ? `PdG · ${arma.nombre}` : 'PdG', pdgParaArma(arma).valor, 'pdg');
  const tipo = tipoAtaque(arma);
  const impar = primero && tipo % 2 !== 0;
  toast(`${arma ? arma.nombre : 'Sin arma ⚠ (Tipo provisorio)'}: -${fmt(costo)} No2 · ${primero ? 'primer ataque con esta arma' : `ataque ${ataquesConArma(arma)} con esta arma`}${impar ? ' · ⚠ Tipo impar, redondeo provisorio' : ''}`);
}

/* ---------- Lupa de la Botonera: cómo se calcula cada tirada y cuánto cuesta ----------
   Cada botón de la Botonera trae un 🔍 (data-lupa="tipo:clave") que abre
   #lupa-pop con el desglose: de qué stat sale, sus modificadores y de dónde
   vienen, cómo se reparte en dados y el costo en Nitros/SP con su motivo. */


function lupaBase(id, c){
  if(ES_ATTR(id)) return lupaFila('Valor propio', fmt(num(S.attrs[id])));
  const f = String(S.formulas[id] || '0');
  const vars = [...new Set(f.match(/[a-z]+/gi) || [])].filter(v => ATTR_LIST.some(a => a.id === v) || STAT_LIST.some(s => s.id === v));
  const detalle = vars.map(v => `${STAT_LABEL[v] || v} ${fmt(Number.isNaN(c.final[v]) ? 0 : c.final[v])}`).join(', ');
  let h = lupaFila(`Base: <code>${esc(f)}</code>${detalle ? ` <span class="lupa-gris">(${esc(detalle)})</span>` : ''}`,
    Number.isNaN(c.base[id]) ? '?' : fmt(c.base[id]));
  return h + lupaDesgloseVars(vars, c, 1, new Set([id]));
}

const lupaVarsDe = id => [...new Set(String(S.formulas[id] || '0').match(/[a-z]+/gi) || [])]
  .filter(v => ATTR_LIST.some(a => a.id === v) || STAT_LIST.some(s => s.id === v));

// Abre, nivel por nivel, cada valor de la fórmula que tenga algo sumado
// (equipo, estados, pasivas): la base del stat ya lo trae incluido.
function lupaDesgloseVars(vars, c, nivel, vistos){
  let h = '';
  const pad = `style="padding-left:${14 * nivel}px"`;
  const fila = (txt, val) => `<div class="lupa-fila lupa-sub" ${pad}><span>${txt}</span><b>${val}</b></div>`;
  vars.forEach(v => {
    if(vistos.has(v)) return;
    const mods = c.mods[v] || [];
    const sub = ES_ATTR(v) ? '' : lupaDesgloseVars(lupaVarsDe(v), c, nivel + 1, new Set([...vistos, v]));
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
function lupaStat(id, c, {valor, excluidos = [], sinTirada = false} = {}){
  valor = valor ?? c.final[id];
  let h = lupaBase(id, c);
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

function lupaCostoAtaque(arma){
  const tipo = tipoAtaque(arma);
  const hechos = ataquesConArma(arma);
  const costo = costoAtaqueNitros(arma);
  let h = lupaFila(arma ? `Tipo del arma (d${fmt(tipo)})` : `Sin arma: Tipo provisorio ${IT2_PENDIENTE('Tipo de un ataque sin arma')}`, fmt(tipo));
  h += lupaFila(`Ataques con ${arma ? 'esta arma' : 'las manos'} este turno`, fmt(hechos));
  h += hechos === 0
    ? lupaFila(`Primer ataque con ${arma ? 'esta arma' : 'las manos'}: Tipo ÷ 2${tipo % 2 ? ', para arriba' : ''}`, `${fmt(costo)} No2`, 'lupa-total')
    : lupaFila('Ya atacó con ella: Tipo completo', `${fmt(costo)} No2`, 'lupa-total');
  h += lupaFila('Nitros disponibles', fmt(num(S.nitros)), costo > num(S.nitros) ? 'lupa-falta' : '');
  h += lupaNota('Cada arma tiene su propio primer ataque a mitad de precio. Se reinicia en el Mantenimiento.');
  return lupaSeccion('Costo', h);
}

// Contenido de la 🔍 (comun/lupa.js lo pide con lupaContenido).
function lupaContenido(clave){
  if(clave.startsWith('inv:')) return lupaHtmlInv(clave);
  return lupaHtml(clave);
}

/* ---------- Lupa de la Botonera de una invocación (igual que la de un
   creep en gm-tools): de qué stat sale, sus modificadores, cómo se
   reparte en dados y el costo en No2. ---------- */
function lupaStatInv(inv, statId, {sinTirada = false} = {}){
  const attr = INV_STAT_ATTR[statId] || statId;
  let h = lupaFila(`${STAT_LABEL[attr]} base`, fmt(num(inv[attr])));
  aportesModInv(inv, attr).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${esc(STAT_LABEL[attr])})</span>`, lupaSigno(a.val)); });
  if(statId !== attr) aportesModInv(inv, statId).forEach(a => { h += lupaFila(`${esc(a.nombre)} <span class="lupa-gris">(${esc(STAT_LABEL[statId]||statId)})</span>`, lupaSigno(a.val)); });
  if(!aportesModInv(inv, attr).length && (statId === attr || !aportesModInv(inv, statId).length)) h += lupaFila('<span class="lupa-gris">Sin modificadores</span>', '–');
  if((statId === 'pdg' || statId === 'parry') && invEstadoActivo(inv, 'lisiado')) h += lupaFila('Lisiado <span class="lupa-gris">(la mitad, para abajo)</span>', '÷ 2');
  const valor = invStatValor(inv, statId);
  h += lupaFila(esc(STAT_LABEL[statId]||statId), fmt(valor), 'lupa-total');
  let out = lupaSeccion('De dónde sale', h);
  if(sinTirada) return out;
  out += lupaTirada(valor);
  return out;
}
function lupaHtmlInv(clave){
  const [, invId, tipo, ref] = clave.split(':');
  const inv = S.invocaciones.find(x => x.id === invId);
  if(!inv) return {titulo: '', html: ''};
  const sinCosto = lupaSeccion('Costo', lupaFila('Esta tirada', 'sin costo'));
  if(tipo === 'stat') return {titulo: `${inv.nombre} · ${STAT_LABEL[ref]||ref}`, html: lupaStatInv(inv, ref) + sinCosto};
  if(tipo === 'atacar'){
    const tipoArma = num(inv.armaTipo) || 8;
    const hechos = num(inv.ataquesTurno);
    const costo = costoAtaqueInv(inv);
    let h = lupaFila(`Tipo del arma${inv.armaNombre ? ` (${esc(inv.armaNombre)})` : ''}: d${fmt(tipoArma)}`, fmt(tipoArma));
    h += lupaFila('Ataques este turno', fmt(hechos));
    h += hechos === 0
      ? lupaFila(`Primer ataque: Tipo ÷ 2${tipoArma % 2 ? ', para arriba' : ''}`, `${fmt(costo)} No2`, 'lupa-total')
      : lupaFila('Ya atacó: Tipo completo', `${fmt(costo)} No2`, 'lupa-total');
    h += lupaFila('No2 disponibles', fmt(num(inv.nitros)), costo > num(inv.nitros) ? 'lupa-falta' : '');
    h += lupaNota('El primer ataque del turno cuesta la mitad. Se reinicia en el Mantenimiento.');
    return {titulo: `${inv.nombre} · Atacar`, html: lupaStatInv(inv, 'pdg') + lupaSeccion('Costo', h)};
  }
  if(tipo === 'danio'){
    const dmg = invStatValor(inv, 'dmg');
    let h = lupaFila('Peso del arma (cantidad de dados)', fmt(Math.max(1, num(inv.armaPeso) || 1)));
    if(num(inv.armaAmplificado) > 0) h += lupaFila('Daño amplificado (dados extra)', lupaSigno(num(inv.armaAmplificado)));
    h += lupaFila('Tipo (caras del dado)', `d${fmt(num(inv.armaTipo) || 8)}`);
    if(num(inv.armaFijo)) h += lupaFila('Daño fijo del arma', lupaSigno(num(inv.armaFijo)));
    h += inv.armaDeRango
      ? lupaFila('Dmg <span class="lupa-gris">(arma de rango: no suma)</span>', '–', 'lupa-tachado')
      : lupaFila('Dmg (de Fuerza)', lupaSigno(dmg));
    h += lupaFila('Daño', esc(invDanoTxt(inv, dmg)), 'lupa-total');
    let out = lupaSeccion('De dónde sale', h);
    if(!inv.armaDeRango) out += lupaStatInv(inv, 'dmg', {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
    return {titulo: `${inv.nombre} · Daño${inv.armaNombre ? ` (${inv.armaNombre})` : ''}`, html: out + sinCosto};
  }
  if(tipo === 'hab'){
    const h0 = inv.habilidades.find(x => x.id === ref);
    if(!h0) return {titulo: '', html: ''};
    const n = costoNitrosHabInv(inv, h0);
    const porDefecto = h0.nitrosCosto === undefined || h0.nitrosCosto === null || h0.nitrosCosto === '';
    let h = lupaFila(habInvAtaque(h0) ? `No2 · como un ataque <span class="lupa-gris">(${num(inv.ataquesTurno) ? 'Tipo completo' : 'primer ataque, Tipo ÷ 2'})</span>` : porDefecto ? `No2 (por defecto, ${fmt(IT2_INV.nitrosHabilidad)})` : 'No2 de la habilidad', `${fmt(n)} No2`, 'lupa-total');
    if(num(h0.cd) > 0) h += lupaFila('Cooldown', `${fmt(num(h0.cd))} turno(s)${num(h0.cdActual) > 0 ? ` · faltan ${fmt(num(h0.cdActual))}` : ''}`);
    h += lupaFila('No2 disponibles', fmt(num(inv.nitros)), n > num(inv.nitros) ? 'lupa-falta' : '');
    let out = lupaSeccion('Costo', h);
    if(h0.tiradaStat) out += lupaSeccion('Tirada del stat', lupaFila(esc(STAT_LABEL[h0.tiradaStat]||h0.tiradaStat), fmt(invStatValor(inv, h0.tiradaStat))));
    if((h0.tiradaExtra || '').trim()) out += lupaSeccion('Tirada', lupaFila('Fórmula de la habilidad', esc(h0.tiradaExtra)));
    return {titulo: `${inv.nombre} · ${h0.nombre || 'Habilidad'}`, html: out};
  }
  return {titulo: '', html: ''};
}

function lupaHtml(clave){
  const c = compute();
  const [tipo, ...resto] = clave.split(':');
  const ref = resto.join(':');
  const sinCosto = lupaSeccion('Costo', lupaFila('Esta tirada', 'sin costo'));
  if(tipo === 'stat'){
    return {titulo: STAT_FULL[ref] || STAT_LABEL[ref] || ref, html: lupaStat(ref, c) + sinCosto};
  }
  if(tipo === 'defensa'){
    return {titulo: STAT_FULL[ref] || ref, html: lupaStat(ref, c, {sinTirada: true}) + lupaNota('Valor fijo: no se tira.')};
  }
  if(tipo === 'atacar'){
    const arma = S.inventario.find(i => i.id === ref) || null;
    const pdg = pdgParaArma(arma, c);
    return {titulo: `Atacar${arma ? ` con ${arma.nombre}` : ' sin arma'}`, html: lupaStat('pdg', c, pdg) + lupaCostoAtaque(arma)};
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
    h += lupaFila('Daño', esc(armaDanoTxt(arma, dmg)), 'lupa-total');
    let out = lupaSeccion('De dónde sale', h);
    if(!arma.armaDeRango) out += lupaStat('dmg', c, {sinTirada: true}).replace('De dónde sale', 'Dmg (de Fuerza)');
    return {titulo: `Daño · ${arma.nombre}`, html: out + sinCosto};
  }
  if(tipo === 'social'){
    const it = S.sociales.find(x => x.id === ref);
    if(!it) return {titulo: 'Talento', html: ''};
    const caras = dadoCarasSocial(it);
    let h = lupaFila('Nivel', fmt(nivelSocial(it)));
    if(num(it.puntosInt)) h += lupaFila('· de Inteligencia invertida', fmt(num(it.puntosInt)));
    if(num(it.nivelExtra)) h += lupaFila('· de tirada máxima', fmt(num(it.nivelExtra)));
    h += lupaFila('Dado (nivel × 2 caras)', caras ? `d${fmt(caras)}` : 'ninguno todavía');
    h += lupaFila('Inteligencia sin invertir', fmt(inteligenciaBudget().resto));
    h += lupaFila('Tirada', esc(formulaSocial(it)), 'lupa-total');
    return {titulo: it.nombre, html: lupaSeccion('De dónde sale', h) + sinCosto};
  }
  // Lupa del botón Ejecutar (Botonera): solo cuánto cuesta, cuánto hay de
  // eso y qué tira. Sin el desglose del origen de la tirada.
  if(tipo === 'habx'){
    const h0 = S.habilidades.find(x => x.id === ref);
    if(!h0) return {titulo: 'Habilidad', html: ''};
    let costo = '';
    let usaNitros = false, usaSp = false;
    if(nitrosAtaque(h0)){
      usaNitros = true;
      armasParaHabilidad().forEach(o => {
        costo += lupaFila(`No2 · como un ataque ${o.arma ? `con ${esc(o.arma.nombre)}` : 'sin arma'}`, `${fmt(costoAtaqueNitros(o.arma))}`);
      });
    }else if(nitrosVariable(h0)){
      usaNitros = true;
      costo += lupaFila('No2', 'X (lo elegís al usarla)');
    }else if(costoNitrosHab(h0)){
      usaNitros = true;
      costo += lupaFila('No2', fmt(costoNitrosHab(h0)));
    }
    if(spVariable(h0)){ usaSp = true; costo += lupaFila('SP', 'X (lo elegís al usarla)'); }
    else if(parseCostoSp(h0.costo)){ usaSp = true; costo += lupaFila('SP', fmt(parseCostoSp(h0.costo))); }
    let usaHp = false;
    if(num(h0.hpCosto) > 0){ usaHp = true; costo += lupaFila('HP', fmt(num(h0.hpCosto))); }
    if(!costo) costo = lupaFila('Costo', 'gratis');
    let disp = '';
    if(usaNitros) disp += lupaFila('No2', fmt(num(S.nitros)), costoNitrosHab(h0) > num(S.nitros) ? 'lupa-falta' : '');
    if(usaHp) disp += lupaFila('HP', fmt(num(S.hp)), num(S.hp) <= num(h0.hpCosto) ? 'lupa-falta' : '');
    if(usaSp){
      const spDisp = spMaximo(c) - num(S.spGastado);
      disp += lupaFila('SP', fmt(spDisp), parseCostoSp(h0.costo) > spDisp ? 'lupa-falta' : '');
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
    if(habCostoVariable(h0)) costo += lupaFila(`Costo variable (X en ${[spVariable(h0) ? "SP" : "", nitrosVariable(h0) ? "No2" : ""].filter(Boolean).join(" y ")})`, "elegís al ejecutar");
    else{
      const n = costoNitrosHab(h0);
      if(nitrosAtaque(h0)) armasParaHabilidad().forEach(o => { costo += lupaFila(`Como un ataque con ${o.arma ? esc(o.arma.nombre) : "sin arma"} <span class="lupa-gris">(${ataquesConArma(o.arma) ? "Tipo completo" : "primer ataque, Tipo ÷ 2"})</span>`, `${fmt(costoAtaqueNitros(o.arma))} No2`); });
      else costo += lupaFila(h0.nitrosCosto === undefined || h0.nitrosCosto === null || h0.nitrosCosto === '' ? `Nitros (por defecto, ${fmt(IT2.nitrosHabilidad)})` : 'Nitros de la habilidad', `${fmt(n)} No2`);
      const sp = parseCostoSp(h0.costo);
      if(sp) costo += lupaFila(`SP <span class="lupa-gris">(${esc(h0.costo)})</span>`, `${fmt(sp)} SP`);
    }
    costo += lupaFila('Disponibles', `${fmt(num(S.nitros))} No2 · ${fmt(spMaximo(c) - num(S.spGastado))} SP`);
    let out = lupaSeccion('Costo', costo);
    const stat = h0.tiradaStat;
    if(stat && c.final[stat] !== undefined) out += lupaSeccion(`Tira ${esc(STAT_LABEL[stat] || stat)}`, lupaStat(stat, c));
    if(stat && num(h0.tiradaBono)) out += lupaSeccion('Bono de la habilidad', lupaFila(`Suma al ${esc(STAT_LABEL[stat] || stat)} de esta tirada`, lupaSigno(num(h0.tiradaBono))));
    if((h0.tiradaExtra || '').trim()) out += lupaSeccion('Tirada extra', lupaFila('Fórmula de la habilidad', esc(h0.tiradaExtra)));
    return {titulo: h0.nombre, html: out};
  }
  if(tipo === 'cons'){
    const [lista, id] = [resto[0], resto[1]];
    const it = (S[lista] || []).find(x => x.id === id);
    if(!it) return {titulo: 'Consumible', html: ''};
    let h = lupaFila(`Consumir desde ${lista === 'cinturon' ? 'el cinturón' : 'la mochila'}`, `${fmt(costoConsumirNitros(lista))} No2`, 'lupa-total');
    h += lupaFila("No2 que tenés", fmt(num(S.nitros)), costoConsumirNitros(lista) > num(S.nitros) ? "lupa-falta" : "");
    h += lupaFila("Unidades", fmt(num(it.unidades)), num(it.unidades) <= 0 ? "lupa-falta" : "");
    h += lupaNota(`Del cinturón cuesta ${fmt(IT2.nitrosConsumirCinturon)} No2; de la mochila, ${fmt(IT2.nitrosConsumirMochila)}.`);
    let ef = '';
    if(it.curahp) ef += lupaFila('Vida', `${lupaSigno(num(it.curahp))} HP`);
    if(num(it.curaspPct) > 0) ef += lupaFila('SP', `${fmt(num(it.curaspPct))}% del máximo`);
    if(it.efectoNombre) ef += lupaFila('Estado', esc(it.efectoNombre));
    return {titulo: it.nombre, html: lupaSeccion('Costo', h) + (ef ? lupaSeccion('Efecto', ef) : '')};
  }
  return {titulo: '', html: ''};
}


function atacar(){
  // Sentado no puede atacar: se avisa y se deja seguir (las herramientas ayudan, no prohíben).
  if(efectoSentado() && !confirm('Estás Sentado: no podés atacar. ¿Atacar igual?')) return;
  const armas = armasEquipadasConDano();
  if(armas.length <= 1){ preguntarTipoAtaque(armas.length ? armas[0].item : null); return; }
  $('#elegir-arma-lista').innerHTML = armas.map(a => `
    <button class="btn" data-atacararma="${a.item.id}" style="width:100%">
      ${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)}
    </button>`).join('');
  $('#scrim-elegir-arma').classList.add('open');
}

let pendingEjecucion = null;

/* Lo que cuesta ejecutar una habilidad, para verlo sin abrir la tarjeta.
   El costo en SP es texto libre ("2 SP", "X SP"), así que se muestra tal
   cual lo escribió el jugador. */
function costoHabilidadTxt(h){ return FichaBotonera.costoHabilidadTxt(S, h); }   // comun/ficha-botonera.js

function esCostoVariable(costo){
  return /x/i.test(String(costo||''));
}

// Tope de X en costos variables. PLACEHOLDER: ver IT2.limiteXNitros/limiteXSp.
function limiteCostoX(cual){
  const f = cual === 'sp' ? IT2.limiteXSp : IT2.limiteXNitros;
  return typeof f === 'function' ? f(compute()) : null;
}

// Habilidades con costo de Nitros "ATAQUE": cuestan lo mismo que un ataque
// con el arma que se elige al ejecutarlas y cuentan como ese ataque.
let pendingArmaHab = undefined;   // arma elegida para la habilidad en curso (null = sin arma)

function armasParaHabilidad(){ return FichaBotonera.armasParaHabilidad(S); }   // comun/ficha-botonera.js

// Lo mínimo que puede costar (para saber si alcanza) y el texto para mostrar.
function costoAtaqueMinimo(){ return FichaBotonera.costoAtaqueMinimo(S); }
function costoAtaqueHabTxt(){ return FichaBotonera.costoAtaqueHabTxt(S); }

// ⚡ Flash (P136, regla del dueño): en tu turno cuesta lo que dice la habilidad (SP y vida); en turno ajeno, el doble — igual
// dentro del duelo que con el botón. Nunca cuesta No2. Pregunta el turno, revisa que alcance y cobra; null = no se usó.
const costoFlashDe = h => ({sp: parseCostoSp(h.costo), hp: num(h.hpCosto)});
async function pagarFlash(h){
  const p = await ConfirmarTurno.flash(`⚡ ${h.nombre || 'Flash'}`, costoFlashDe(h), {spAjeno: h.turnoAjenoSp});
  if(!p) return null;
  if(p.sp > spMaximo() - num(S.spGastado)){ toast(`No te alcanzan los SP para ${h.nombre} (${fmt(p.sp)} SP)`); return null; }
  if(p.hp > 0 && num(S.hp) <= p.hp){ toast(`No te alcanza la vida para ${h.nombre} (${fmt(p.hp)} HP)`); return null; }
  S.spGastado = num(S.spGastado) + p.sp;
  if(p.hp > 0) fijarHp(num(S.hp) - p.hp);
  renderVitals(); refresh();
  return p;
}
// Un Flash con el botón Ejecutar, fuera del cuadro del duelo: la misma regla de costo, se anuncia y el bono se suma a mano.
async function usarFlashFueraDelDuelo(it){
  const p = await pagarFlash(it);
  if(!p) return;
  const f = dueloDe(it).flash || {};
  mesaPublicarHabilidad(it.nombre, `${it.detalle || ''}${it.detalle ? ' — ' : ''}⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
  renderList('habilidades');
  toast(`${it.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
}
async function ejecutarHabilidad(id, armaId, forzar){
  const it = S.habilidades.find(h => h.id === id);
  if(!it) return;
  // 📣 Manual: "Anunciar" solo publica la descripción en la Mesa.
  if(modoHab(it) === 'manual'){
    mesaPublicarHabilidad(it.nombre, it.detalle || it.efectoDetalle || '');
    toast(`${it.nombre} anunciada`);
    return;
  }
  if(Combatiente.tipoEjecucion(dueloDe(it)) === 'flash'){ usarFlashFueraDelDuelo(it); return; }   // ⚡ su propia regla de costo (P136)
  // Costo en vida: hace falta que sobre vida después de pagarlo.
  if(num(it.hpCosto) > 0 && num(S.hp) <= num(it.hpCosto)){
    toast(`No te alcanza la vida — ${it.nombre} cuesta ${fmt(num(it.hpCosto))} HP y tenés ${fmt(num(S.hp))}`);
    return;
  }
  // Con costo de ataque: primero se elige el arma (si hay más de una).
  let arma = null;
  if(nitrosAtaque(it)){
    const opciones = armasParaHabilidad();
    if(armaId === undefined && opciones.length > 1){
      $('#elegir-arma-lista').innerHTML =
        `<div class="hint">${esc(it.nombre)}: cuesta lo mismo que un ataque con el arma que elijas, y cuenta como ese ataque.</div>` +
        opciones.map(o => `
        <button class="btn" data-habarma="${esc(it.id)}:${esc(o.arma.id)}" style="width:100%">
          ${o.mano ? `Mano ${o.mano}: ` : ''}${esc(o.arma.nombre)} — ${fmt(costoAtaqueNitros(o.arma))} No2${ataquesConArma(o.arma) ? '' : ' (primer ataque)'}${costoAtaqueNitros(o.arma) > num(S.nitros) ? ' · no te alcanza' : ''}
        </button>`).join('');
      $('#scrim-elegir-arma').classList.add('open');
      return;
    }
    arma = armaId ? (S.inventario.find(x => x.id === armaId) || null) : opciones[0].arma;
  }
  pendingArmaHab = nitrosAtaque(it) ? arma : undefined;
  if(habCostoVariable(it)){
    pendingEjecucion = id;
    $("#costox-nombre").textContent = it.nombre + (nitrosAtaque(it) ? ` · con ${arma ? arma.nombre : 'sin arma'}` : '');
    // Lo que es X se elige; lo fijo se muestra y no se puede cambiar.
    const campoSp = $("#f-costox-sp"), campoNitros = $("#f-costox-nitros");
    campoSp.value = spVariable(it) ? 0 : parseCostoSp(it.costo);
    campoSp.disabled = !spVariable(it);
    campoNitros.value = nitrosVariable(it) ? Math.min(num(S.nitros), 1) : costoNitrosHab(it, arma);
    campoNitros.disabled = !nitrosVariable(it);
    if(nitrosVariable(it) && !spVariable(it)) setTimeout(() => campoNitros.select(), 50);
    $('#costox-disponibles').textContent = `${fmt(num(S.nitros))} No2 y ${fmt(spMaximo() - num(S.spGastado))} SP`;
    const limN = limiteCostoX('nitros'), limS = limiteCostoX('sp');
    $('#costox-limite').innerHTML = (limN === null || limS === null)
      ? `${IT2_PENDIENTE('el tope de X todavía no está confirmado')} Tope de X sin definir: por ahora solo te frena lo que tengas.`
      : '';
    $('#scrim-costox').classList.add('open');
    return;
  }
  const costoNitros = costoNitrosHab(it, arma);
  if(costoNitros > num(S.nitros) && !forzar){
    avisarSinNitros(costoNitros, `usar ${it.nombre}${nitrosAtaque(it) ? ` (ataque con ${arma ? arma.nombre : 'sin arma'})` : ''}`, () => ejecutarHabilidad(id, armaId, true));
    return;
  }
  let costoSp = parseCostoSp(it.costo);
  // Costo distinto en turno ajeno (2026-09-28, pedido del dueño): antes de cobrar nada, un cartelito pregunta.
  if(String(it.turnoAjenoSp || '').trim() && !spVariable(it)){
    const elegido = await ConfirmarTurno.pedir(it.nombre, costoSp, num(it.turnoAjenoSp));
    if(elegido === null) return;   // canceló: no se cobra ni se ejecuta nada
    costoSp = elegido;
  }
  S.nitros = num(S.nitros) - (forzar && costoNitros > num(S.nitros) ? gastoNitrosForzado(costoNitros, `usó ${it.nombre}`) : costoNitros);
  S.spGastado = num(S.spGastado) + costoSp;
  const costoHp = num(it.hpCosto);
  if(costoHp > 0) fijarHp(num(S.hp) - costoHp);
  const curaHp = num(it.curaHp);
  if(curaHp > 0) fijarHp(num(S.hp) + curaHp);   // cura sobre uno mismo, sin pasar del máximo
  const ataque = registrarAtaqueDeHabilidad(it, arma);
  const efecto = aplicarEfectoDeConsumo(it);
  colocarTrampaDeHab(it);
  avisarZonaAlMapa(it);
  terminarEjecucionHab(it, arma, 0, 0);
  renderList("habilidades");
  if(efecto) renderList('efectos');
  renderNitros();
  renderVitals();
  const partes = [`ejecutada`];
  if(costoSp) partes.push(`-${fmt(costoSp)} SP`);
  partes.push(costoNitros ? `-${fmt(costoNitros)} No2` : 'sin costo de Nitros');
  if(costoHp > 0) partes.push(`-${fmt(costoHp)} HP`);
  if(curaHp > 0) partes.push(`+${fmt(curaHp)} HP`);
  if(ataque) partes.push(ataque);
  if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
  toast(`${it.nombre} ${partes.join(' · ')}`);
}

// Si la habilidad cuesta como un ataque, cuenta como ese ataque del arma
// (el próximo ataque con esa arma ya paga Tipo completo). Devuelve el texto.
function registrarAtaqueDeHabilidad(it, arma){
  if(!nitrosAtaque(it)) return '';
  const primero = FichaCombate.registrarAtaque(S, arma);   // cuenta como ese ataque (comun/ficha-combate.js)
  return `ataque con ${arma ? arma.nombre : 'sin arma'}${primero ? ' (primero del turno)' : ''}`;
}

function confirmarCostoVariable(){
  const it = S.habilidades.find(h => h.id === pendingEjecucion);
  if(!it) return;
  const sp = num($('#f-costox-sp').value);
  const nitros = num($('#f-costox-nitros').value);
  if(sp < 0 || nitros < 0){
    toast('Los valores no pueden ser negativos');
    return;
  }
  if(nitros > num(S.nitros)){
    toast(`No te alcanzan los Nitros — tenés ${fmt(num(S.nitros))}`);
    return;
  }
  const limN = limiteCostoX('nitros'), limS = limiteCostoX('sp');
  if(limN !== null && nitros > limN){ toast(`Como mucho ${fmt(limN)} Nitros en X`); return; }
  if(limS !== null && sp > limS){ toast(`Como mucho ${fmt(limS)} SP en X`); return; }
  S.nitros = Math.max(0, num(S.nitros) - nitros);
  S.spGastado = num(S.spGastado) + sp;
  const costoHp = num(it.hpCosto);
  if(costoHp > 0) fijarHp(num(S.hp) - costoHp);
  if(num(it.curaHp) > 0) fijarHp(num(S.hp) + num(it.curaHp));
  const armaDeLaHab = pendingArmaHab === undefined ? null : pendingArmaHab;
  const ataque = registrarAtaqueDeHabilidad(it, armaDeLaHab);
  pendingArmaHab = undefined;
  const efecto = aplicarEfectoDeConsumo(it);
  colocarTrampaDeHab(it);
  avisarZonaAlMapa(it);
  terminarEjecucionHab(it, armaDeLaHab, sp, nitros);
  $("#scrim-costox").classList.remove("open");
  pendingEjecucion = null;
  renderList('habilidades');
  if(efecto) renderList('efectos');
  renderNitros();
  renderVitals();
  const partes = [`ejecutada`, `-${fmt(sp)} SP`, `-${fmt(nitros)} No2`];
  if(costoHp > 0) partes.push(`-${fmt(costoHp)} HP`);
  if(ataque) partes.push(ataque);
  if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
  toast(`${it.nombre} ${partes.join(' · ')}`);
}

function mantenimiento(){
  const c = compute();
  const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
  const log = [];
  let hpDelta = 0;
  // Reporte para la Mesa (2026-09-24): lo que le pasó a este personaje en el pase de turno, en texto llano y con el antes y el
  // después, para que todos vean si el veneno bajó, si la regeneración curó, etc. Se publica al final (mesaPublicarReporte).
  const rep = [];
  const hpAntes = num(S.hp);

  // SP Regen: AL PRINCIPIO del Mantenimiento (2026-09-24), con los números de antes de que venza o cambie ningún estado.
  // Por defecto es la mitad del Especial, redondeada hacia abajo (fórmula base del stat), más lo que sumen habilidades, equipo o estados.
  // Recupera SP sin pasar del máximo (si ya estaba por encima, no se toca).
  const spRegen = Math.max(0, Number.isNaN(c.final.spregen) ? 0 : Math.floor(c.final.spregen));
  const spRecuperado = Math.min(spRegen, Math.max(0, num(S.spGastado)));
  if(spRecuperado){
    S.spGastado = num(S.spGastado) - spRecuperado;
    rep.push(`SP: +${fmt(spRecuperado)} (SP Regen)`);
  }

  // Lo que hacen los estados en el pase de turno (escudo, daño/cura con inmunidades, stacks, turnos): regla común de
  // personajes, invocaciones y creeps (comun/combatiente.js). La vida se aplica más abajo, con fijarHp (tope, Ankh, muerte).
  const turnoEst = Combatiente.pasarTurnoEstados(S.efectos, {hp: 'hpturno', stacks: 'stacksturno'});
  hpDelta += turnoEst.hp;
  Combatiente.reporteTurno(turnoEst.eventos).forEach(l => { rep.push(l); log.push(esc(l)); });

  // Pasivas de regeneración: recuperan HP en cada Mantenimiento (por compra).
  S.pasivas.forEach(p => {
    const hp = num(p.regenHp) * pasivaCompras(p);
    if(hp > 0 && num(S.hp) > 0){
      hpDelta += hp;
      log.push(`<b>${esc(p.nombre)}</b> <span class="heal">+${fmt(hp)} HP</span>`);
      rep.push(`${p.nombre} (pasiva): +${fmt(hp)} HP`);
    }
  });

  if(hpDelta){
    // Pasa por fijarHp para que el veneno que te deja en 0 active el Ankh
    // antes de que se descuenten los turnos de muerte, más abajo.
    fijarHp(num(S.hp) + hpDelta);
    if(num(S.hp) !== hpAntes) rep.push(`HP total: ${fmt(hpAntes)} → ${fmt(num(S.hp))}`);
    else rep.push(`HP total: sigue en ${fmt(hpAntes)}`);
  }

  if(S.muerto && S.muerto.activo && !S.muerto.definitivo && num(S.hp) <= 0){
    S.muerto.turnos = Math.max(0, num(S.muerto.turnos) - 1);
    if(S.muerto.turnos === 0){
      S.muerto.definitivo = true;
      log.push(`<span class="gone">TE HAS MORIDO BIEN MUERTO Y YA NO HAY VUELTA ATR&Aacute;S</span>`);
      rep.push('Murió: ya no hay vuelta atrás');
    }else{
      log.push(`Inconsciente: morís en <b>${fmt(S.muerto.turnos)}</b> turno(s)`);
      rep.push(`Inconsciente: muere en ${fmt(S.muerto.turnos)} turno${S.muerto.turnos === 1 ? '' : 's'}`);
    }
    renderOverlayMuerte();
  }

  // Los estados que se terminaron se sacan por identidad (fijarHp pudo tocar la lista, por ejemplo el Ankh).
  if(turnoEst.terminados.length){
    const fin = new Set(turnoEst.terminados);
    S.efectos = S.efectos.filter(e => !fin.has(e));
  }

  S.turno = (S.turno || 1) + 1;
  parryArmaPendiente = null;
  parryPendienteInv.clear();
  // Nitros se recargan al máximo y el primer ataque vuelve a costar la
  // mitad (el SP ya se regeneró al principio del Mantenimiento, ver arriba).
  S.nitros = nitrosMaximo();
  S.ataquesTurno = 0;
  S.ataquesArma = {};

  let invocacionesVencidas = 0;
  S.invocaciones.forEach(inv => {
    migrarInvocacion(inv);
    if(inv.activa === false) return; // ya dormida, no se sigue procesando
    // Nitros se recargan al máximo, igual que el propio personaje.
    inv.nitros = invNitrosMax(inv);
    inv.ataquesTurno = 0;
    inv.habilidades.forEach(h => { if(num(h.cdActual) > 0) h.cdActual = Math.max(0, num(h.cdActual) - 1); });
    // Estados alterados de la invocación: la MISMA regla que el personaje y los creeps (comun/combatiente.js). Hasta el
    // 2026-09-30 era una copia recortada: no respetaba inmunidades, no recargaba el escudo y la vida no tenía tope.
    const turnoInv = Combatiente.pasarTurnoEstados(inv.estados, {hp: 'hpturno', stacks: 'stacksturno'});
    if(turnoInv.hp) inv.hp = Math.max(0, Math.min(num(inv.hpMax) || Infinity, num(inv.hp) + turnoInv.hp));
    inv.estados = turnoInv.quedan;
    if(num(inv.cooldown) > 0){
      inv.cooldownActual = Math.max(0, num(inv.cooldownActual) - 1);
      if(inv.cooldownActual === 0){
        inv.activa = false;
        invocacionesVencidas++;
      }
    }
  });
  if(invocacionesVencidas){
    log.push(`${invocacionesVencidas} invocación(es) quedaron dormidas al llegar el cooldown a 0.`);
  }

  log.unshift(`<b style="color:var(--brass)">Turno ${S.turno}</b>`);
  log.push(`Nitros recargados a ${fmt(num(S.nitros))}.` + (spRegen ? ` SP ${spRecuperado ? `<span class="heal">+${fmt(spRecuperado)}</span>` : '+0'} (SP Regen ${fmt(spRegen)}${spRegen && !spRecuperado ? ', ya estaba lleno' : ''}).` : ''));
  S.log = log;
  mesaPublicarReporte(`Turno ${S.turno}`, rep);

  renderTurno();
  renderList('efectos');
  renderList('habilidades');
  renderNitros();
  renderInvocaciones();
  refresh();
  if(S.hp === 0) toast('Te quedaste en 0 de HP');

  const avisos = S.efectos.filter(e => e.popup && e.activo !== false);
  if(avisos.length) showReminder(avisos);
  // En segundo plano (desde el mapa) el cartel no se ve: los recordatorios
  // van a la Mesa, a nombre del personaje.
  if(avisos.length && typeof MODO_MANTENIMIENTO !== 'undefined' && MODO_MANTENIMIENTO) publicarRecordatorios(avisos);
}

// Al ejecutar una habilidad, su descripción va a la Mesa aunque no tire
// dados, así todos leen qué hace. Si tira, viaja con la tirada (una sola
// línea); si no, va en su propia línea.
function habilidadTira(h){
  return !!(h && (String(h.tiradaExtra || "").trim() || h.tiradaStat));
}

function anunciarHabilidad(h){
  const detalle = (h && (h.detalle || h.efectoDetalle)) || "";
  if(habilidadTira(h)) mesaConTexto(detalle);
  else mesaPublicarHabilidad(h.nombre, detalle);
}

function mesaPublicarHabilidad(nombre, detalle){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: mesaQuien(),
    origen: String(nombre || 'Habilidad').slice(0, 80),
    formula: String(detalle || "").slice(0, 300),
    rolls: [], mod: 0, total: 0, desde: 'habilidad',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar la habilidad en la Mesa:', err));
}

// Reporte del Mantenimiento de este personaje a la Mesa (todos lo ven): una línea con un renglón por cosa que pasó. Si no pasó
// nada que valga la pena contar, no se publica nada.
function mesaPublicarReporte(titulo, lineas){
  if(!lineas || !lineas.length || !fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: mesaQuien(),
    origen: String(titulo || '').slice(0, 60), formula: lineas.join('\n').slice(0, 900),
    rolls: [], mod: 0, total: 0, desde: 'reporte',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar el reporte del Mantenimiento:', err));
}

function publicarRecordatorios(avisos){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  avisos.slice(0, 5).forEach(e => {
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: mesaQuien(),
      origen: String(e.nombre || 'Estado').slice(0, 80), formula: String(e.detalle || '').slice(0, 240),
      rolls: [], mod: 0, total: 0, desde: 'recordatorio',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar el recordatorio:', err));
  });
}

function showReminder(avisos){
  $('#reminder-body').innerHTML = avisos.map(e => `
    <div class="reminder-item">
      <div class="rname">${esc(e.nombre)}</div>
      ${e.detalle ? `<div class="rdetail">${esc(e.detalle)}</div>` : ''}
    </div>`).join('');
  $('#scrim-reminder').classList.add('open');
}
$('#reminder-ok').onclick = () => $('#scrim-reminder').classList.remove('open');
$('#reminder-x').onclick = () => $('#scrim-reminder').classList.remove('open');
$('#scrim-reminder').addEventListener('mousedown', e => { if(e.target.id==='scrim-reminder') $('#scrim-reminder').classList.remove('open'); });
$('#muerte-cerrar').onclick = () => $('#scrim-muerte').classList.remove('open');
let revivirModo = 'pct';
function calcularHpRevivir(){
  const c = compute();
  const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
  if(revivirModo === 'pct'){
    const pct = Math.max(0, Math.min(100, num($('#f-revivir-pct').value) || 0));
    return {hpmax, val: Math.max(1, Math.floor(hpmax * pct / 100))};
  }
  return {hpmax, val: Math.max(1, Math.floor(num($('#f-revivir-valor').value) || 1))};
}
function actualizarRevivirUI(){
  $('#revivir-modo-pct').classList.toggle('primary', revivirModo === 'pct');
  $('#revivir-modo-valor').classList.toggle('primary', revivirModo === 'valor');
  $('#revivir-campo-pct').style.display = revivirModo === 'pct' ? '' : 'none';
  $('#revivir-campo-valor').style.display = revivirModo === 'valor' ? '' : 'none';
  const {hpmax, val} = calcularHpRevivir();
  $('#revivir-preview').textContent = `Revive con ${fmt(val)} / ${fmt(hpmax)} HP`;
}
$('#btn-revivir').onclick = () => {
  revivirModo = 'pct';
  $('#f-revivir-pct').value = 50;
  actualizarRevivirUI();
  $('#scrim-revivir').classList.add('open');
};
$('#revivir-modo-pct').onclick = () => { revivirModo = 'pct'; actualizarRevivirUI(); };
$('#revivir-modo-valor').onclick = () => { revivirModo = 'valor'; actualizarRevivirUI(); };
$('#f-revivir-pct').addEventListener('input', actualizarRevivirUI);
$('#f-revivir-valor').addEventListener('input', actualizarRevivirUI);
$('#revivir-confirmar').onclick = () => {
  const {val} = calcularHpRevivir();
  S.hp = val;
  $('#f-hp').value = S.hp;
  $('#scrim-revivir').classList.remove('open');
  refresh();
  toast(`Revivido con ${fmt(S.hp)} HP`);
};
$('#revivir-cancel').onclick = () => $('#scrim-revivir').classList.remove('open');
$('#revivir-x').onclick = () => $('#scrim-revivir').classList.remove('open');
$('#scrim-revivir').addEventListener('mousedown', e => { if(e.target.id==='scrim-revivir') $('#scrim-revivir').classList.remove('open'); });
$('#scrim-muerte').addEventListener('mousedown', e => { if(e.target.id==='scrim-muerte') $('#scrim-muerte').classList.remove('open'); });
$('#view-x').onclick = () => $('#scrim-view').classList.remove('open');
$('#comparar-x').onclick = () => $('#scrim-comparar').classList.remove('open');
$('#scrim-comparar').addEventListener('mousedown', e => { if(e.target.id==='scrim-comparar') $('#scrim-comparar').classList.remove('open'); });
$('#costox-x').onclick = () => { $('#scrim-costox').classList.remove('open'); pendingEjecucion = null; };
$('#costox-cancel').onclick = () => { $('#scrim-costox').classList.remove('open'); pendingEjecucion = null; };
$('#costox-confirm').onclick = confirmarCostoVariable;
$('#scrim-costox').addEventListener('mousedown', e => { if(e.target.id==='scrim-costox'){ $('#scrim-costox').classList.remove('open'); pendingEjecucion = null; } });
$('#btn-ver-todas-habilidades').onclick = () => { renderTodasHabilidades(); $('#scrim-todas-habilidades').classList.add('open'); };
$('#todas-habilidades-x').onclick = () => $('#scrim-todas-habilidades').classList.remove('open');
$('#scrim-todas-habilidades').addEventListener('mousedown', e => { if(e.target.id==='scrim-todas-habilidades') $('#scrim-todas-habilidades').classList.remove('open'); });
$('#btn-botonera').onclick = () => { renderBotonera(); $('#scrim-botonera').classList.add('open'); };
$('#botonera-x').onclick = () => $('#scrim-botonera').classList.remove('open');
// 🎲 Dados libres dentro de la Botonera (2026-09-25, pedido del dueño): en el mapa la Mesa flotante queda tapada, así que la grilla de dados se abre desde acá.
{ const br = $('#botonera-reroll'); if(br) br.onclick = rerollFuera; }   // 🪙 Moneda Re-Roll: repite la última tirada
['#botonera-dados', '#botonerainv-dados'].forEach(sel => { const b = $(sel); if(b && typeof grillaConectar === 'function') grillaConectar(b, {ancla: b, lado: 'abajo', alTirar: f => registrarTirada('Tirada libre', tirarDados(f))}); });
$('#scrim-botonera').addEventListener('mousedown', e => { if(e.target.id==='scrim-botonera') $('#scrim-botonera').classList.remove('open'); });
$('#scrim-portrait').addEventListener('mousedown', e => { if(e.target.id==='scrim-portrait') $('#scrim-portrait').classList.remove('open'); });
$('#btn-atacar-pdg').onclick = atacar;
$('#btn-danio-arma').onclick = pedirArmaYTirar;
$('#btn-esquivar').onclick = () => tirarValorStat('Evasión', compute().final.eva, 'eva');
$('#c-inteligencia').onclick = editarInteligencia;
$('#btn-parry').onclick = () => elegirArmaDefensa('parry');
$('#btn-bloqueo').onclick = () => elegirArmaDefensa('bloqueo');
$('#btn-fuerza-golpe').onclick = () => elegirArmaDefensa('fuerza');
$('#elegir-arma-x').onclick = () => $('#scrim-elegir-arma').classList.remove('open');
$('#scrim-elegir-arma').addEventListener('mousedown', e => { if(e.target.id==='scrim-elegir-arma') $('#scrim-elegir-arma').classList.remove('open'); });
$('#c-job').addEventListener('click', abrirJobLista);
$('#job-x').onclick = () => $('#scrim-job').classList.remove('open');
$('#scrim-job').addEventListener('mousedown', e => { if(e.target.id==='scrim-job') $('#scrim-job').classList.remove('open'); });
$('#nivelsocial-tiradamax').onclick = nivelarSocialPorTiradaMaxima;
$('#nivelsocial-confirmar').onclick = nivelarSocialPorInteligencia;
$('#nivelsocial-manual').onclick = nivelarSocialAMano;
$('#nivelsocial-x').onclick = () => { nivelSocialId = null; $('#scrim-nivel-social').classList.remove('open'); };
$('#scrim-nivel-social').addEventListener('mousedown', e => { if(e.target.id==='scrim-nivel-social'){ nivelSocialId = null; $('#scrim-nivel-social').classList.remove('open'); } });
$('#scrim-chooser').addEventListener('mousedown', e => { if(e.target.id==='scrim-chooser') $('#scrim-chooser').classList.remove('open'); });
$('#scrim-catalogo').addEventListener('mousedown', e => { if(e.target.id==='scrim-catalogo') $('#scrim-catalogo').classList.remove('open'); });
$('#catalogo-filtro').addEventListener('change', renderCatalogoModal);
$('#catalogo-filtro-slot').addEventListener('change', renderCatalogoModal);
$('#catalogo-filtro-tier').addEventListener('change', renderCatalogoModal);
$('#catalogo-buscar').addEventListener('input', renderCatalogoModal);
$('#catalogo-limpiar-filtros').addEventListener('click', () => {
  $('#catalogo-filtro').value = '';
  $('#catalogo-filtro-slot').value = '';
  $('#catalogo-filtro-tier').value = '';
  $('#catalogo-buscar').value = '';
  renderCatalogoModal();
});
$('#catalogo-item-aleatorio').addEventListener('click', elegirItemAleatorio);
$('#catalogo-ver-completo').addEventListener('click', () => {
  verCatalogoCompleto = !verCatalogoCompleto;
  $('#catalogo-ver-completo').classList.toggle('activo', verCatalogoCompleto);
  renderCatalogoModal();
  toast(verCatalogoCompleto ? 'Mostrando el catálogo completo, sin filtros' : 'Volviendo a la vista normal del catálogo');
});
$('#item-aleatorio-tirar-de-nuevo').addEventListener('click', elegirItemAleatorio);
$('#item-aleatorio-x').onclick = () => $('#scrim-item-aleatorio').classList.remove('open');
$('#item-aleatorio-cerrar').onclick = () => $('#scrim-item-aleatorio').classList.remove('open');
$('#scrim-item-aleatorio').addEventListener('mousedown', e => { if(e.target.id==='scrim-item-aleatorio') $('#scrim-item-aleatorio').classList.remove('open'); });
$('#scrim-view').addEventListener('mousedown', e => { if(e.target.id==='scrim-view') $('#scrim-view').classList.remove('open'); });
$('#view-edit-btn').onclick = () => {
  if(!viewing) return;
  $('#scrim-view').classList.remove('open');
  if(verItemAjeno(viewing.key)){
    const it = viewing.key === 'catalogo' ? itemCatalogo(viewing.id) : (S[viewing.key] || []).find(x => x.id === viewing.id);
    if(it) EditarItem.abrir({item: it, catalogo: S.catalogo, contexto: 'ficha',
      stats: MOD_TARGETS.map(x => ({id: x.id, label: x.label})), alSubir: () => cargarItemsSubidos()});
    return;
  }
  openEditor(viewing.key, viewing.id);
};
$('#view-baja-btn').onclick = async () => {
  if(!viewing) return;
  const it = viewing.key === 'catalogo' ? itemCatalogo(viewing.id) : (S[viewing.key] || []).find(x => x.id === viewing.id);
  if(!it) return;
  const ok = await ItemsSubidos.solicitarBaja(it);
  if(ok){ $('#scrim-view').classList.remove('open'); cargarItemsSubidos(); }
};

$('#btn-limpiar-estados').onclick = () => {
  const cuantos = (S.efectos || []).length;
  if(!cuantos){ toast('No hay estados para limpiar'); return; }
  if(!confirm(`¿Sacar los ${cuantos} estado(s) alterado(s)?`)) return;
  S.efectos = [];
  renderList('efectos');
  refresh();
  toast(`${cuantos} estado(s) eliminado(s)`);
};

/* La venta de ítems ya no existe fuera de la tienda: se hace desde "Vender" en el Vendedor (ver abrirVender). */

$('#view-del-btn').onclick = () => {
  if(!viewing) return;
  const {key, id} = viewing;
  const it = (S[key] || []).find(x => x.id === id);
  if(!it) return;
  if(!confirm(`¿Borrar "${it.nombre || 'esto'}"?`)) return;
  S[key] = S[key].filter(x => x.id !== id);
  $('#scrim-view').classList.remove('open');
  viewing = null;
  if(key === 'inventario') renderInventario(); else renderList(key);
  refresh();
  toast(`${it.nombre || 'Ítem'} eliminado`);
};

// Deja la ficha en blanco. No pregunta: en la versi\u00f3n en vivo la usa
// crearPersonajeNuevo(), que ya desengancha la ficha anterior antes.
function fichaNueva(){
  const formulas = structuredClone(S.formulas);
  const caps = structuredClone(S.caps);
  S = structuredClone(DEFAULT);
  S.formulas = formulas;
  S.caps = caps;
  S.meta = {nombre:'', raza:'', clase:'', subclase:'', nivel:1, exp:0, dde:0, imagen:'', miniatura:''};
  S.bitacora = [{id:'j1', nombre:'Página 1', texto:''}];
  S.bitacoraActiva = 'j1';
  S.attrs = {con:1, fue:1, agl:1, des:1, esp:1};
  S.hp = 0; S.turno = 1; S.log = []; S.spGastado = 0; S.ataquesTurno = 0; S.ataquesArma = {};
  S.armadura = {nota:''};
  ['inventario','cinturon','habilidades','pasivas','sociales','efectos','invocaciones'].forEach(k => S[k] = []);
  S.nitros = nitrosMaximo();
  { const hpmax = compute().final.hpmax; S.hp = Number.isNaN(hpmax) ? 0 : hpmax; }  // arranca con la vida llena
  openStat = null;
  renderAll();
  $('#f-nombre').focus();
}

// La ficha se guarda sola en la mesa (ver FICHA EN VIVO), así que
// Mantenimiento ya no necesita subir nada aparte.
// El Mantenimiento ya no tiene botón en la ficha: lo toca el GM en el mapa
// y cada ficha lo aplica sola (ver "Mantenimiento del GM" al final).

let fichaVivo = null;  // adelantado: renderAll() ya lo usa para la identidad de la barra
// (El primer renderAll() + aplicarColapsados() pasó al final de js/14-modo-botonera.js: usa funciones de los archivos que
// vienen después — la identidad de la barra, la bitácora… — y entre archivos solo se pueden usar una vez cargados. Paso 5.)
