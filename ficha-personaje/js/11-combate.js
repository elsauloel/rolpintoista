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

function parryConArma(arma, forzar){ FichaAcciones.parryConArma(S, arma, forzar, combateUi); }   // comun/ficha-acciones.js

// El Bloqueo se calcula así (2026-09-24, pedido del dueño): tu Bloqueo (que sale de la Fuerza, con lo que le suma tu equipo) MÁS el
// peso del arma elegida; ESA SUMA es el valor que se convierte en dado (antes el peso se sumaba aparte, como número fijo).
function bloqueoValorConArma(arma){ return FichaCombate.bloqueoValor(S, arma); }   // Bloqueo + peso: esa suma es el dado
function bloqueoConArma(arma){ FichaAcciones.bloqueoConArma(S, arma, combateUi); }
// Lo que hacen las tiradas de combate sueltas está en comun/ficha-acciones.js (lo usa también la Botonera nueva del mapa); acá,
// lo que se ve: los carteles de sobrepeso y de "¿Con qué arma?", el Parry que espera su Bloqueo, los efectos al golpear.
const combateUi = {
  toast: t => toast(t),
  registrarTirada: (origen, r) => registrarTirada(origen, r),
  avisarSinNitros: (costo, accion, continuar) => avisarSinNitros(costo, accion, continuar),
  preguntarSobrepeso: ({nombre, valor, extra, sobre: s}) => {
    sobrepesoPendiente = {nombre, valor, extra, sobre: s};
    $('#sobrepeso-texto').innerHTML = `Tu equipo pesa <b>${fmt(s)}</b> de más. ¿Pagás <b>1 No2</b> para tirar la evasión sin penalidad, o tirás con <b>−${fmt(s)}</b>? (tenés ${fmt(Math.max(0, num(S.nitros)))} No2)`;
    $('#sobrepeso-penal').textContent = `Tirar con −${fmt(s)}`;
    $('#sobrepeso-pagar').disabled = num(S.nitros) < 1;
    $('#scrim-sobrepeso').classList.add('open');
  },
  cambio: lista => lista.forEach(k => {
    if(k === 'nitros') renderNitros();
    else if(k === 'refresh') refresh();
    else if(k === 'botonera'){ if($('#scrim-botonera').classList.contains('open')) renderBotonera(); }
    else if(k === 'vitals') renderVitals();
    else if(k === 'inventario') renderInventario();
    else if(k === 'cinturon') renderList('cinturon');
  }),
  getParry: () => parryArmaPendiente,
  setParry: id => { parryArmaPendiente = id; },
  elegirArma: (tipo, armas) => {
    if(tipo === 'dano'){
      const dmg = compute().final.dmg;
      $('#elegir-arma-lista').innerHTML = armas.map(a => `
    <button class="btn" data-elegirarma="${a.item.id}" style="width:100%">
      ${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${esc(armaDanoTxt(a.item, dmg))}
    </button>`).join('');
      $('#scrim-elegir-arma').classList.add('open');
      return;
    }
    $('#elegir-arma-lista').innerHTML =
      `<div class="hint">${tipo === 'parry' ? 'Parry: siempre cuesta 1 No2, sea cual sea el arma o escudo que elijas.' : tipo === 'fuerza' ? 'Fuerza del golpe: tu Fuerza + el peso del arma que elijas; esa suma es el dado (contra el Bloqueo del defensor).' : 'Bloqueo: tu Bloqueo + el peso del arma o escudo que elijas; esa suma es el dado que tirás. (Después de un Parry se usa el mismo, solo.)'}</div>` +
      armas.map(a => `
    <button class="btn" data-defarma="${tipo}:${a.item.id}" style="width:100%">
      ${a.mano ? `Mano ${a.mano}: ` : ''}${esc(a.item.nombre)} — ${tipo === 'parry' ? `${fmt(costoParryNitros(a.item))} No2` : `+${fmt(num(a.item.peso))} de peso`}
    </button>`).join('');
    $('#scrim-elegir-arma').classList.add('open');
  },
  efectosAlPegar: it => efectosAlPegar(it),
};

// Menú de Atacar (2026-09-26, pedido del dueño): el botón Atacar pregunta QUÉ ataque es, para automatizar el costo en Nitros de cada uno.
//  · Ataque normal: el primero del turno con esa arma cuesta Tipo ÷ 2; los siguientes, el Tipo completo (cuenta como ataque).
//  · Ataque de oportunidad y Contraataque (regla a prueba: tras un Parry con arma o escudo): SIEMPRE cuestan Tipo ÷ 2 (lo de un primer ataque) y NO suman al conteo de ataques del turno.
const costoAtaqueEspecial = FichaCombate.costoAtaqueEspecial;
const NOMBRE_ATAQUE_ESPECIAL = FichaAcciones.NOMBRE_ATAQUE_ESPECIAL;
function ataqueEspecialConArma(arma, tipo, forzar){ FichaAcciones.ataqueEspecialConArma(S, arma, tipo, forzar, combateUi); }   // comun/ficha-acciones.js
function preguntarTipoAtaque(arma){
  // ✨ Un arma especial tiene su propio recorrido (dueño, 2026-10-05): sin «¿Qué ataque es?» (no tiene oportunidad ni contraataque, P160), directo a sus reglas.
  if(arma && arma.especial){ FichaAcciones.usarArmaEspecial(S, arma.id, false, habUi); return; }
  const costoNormal = costoAtaqueNitros(arma), primero = ataquesConArma(arma) === 0, especial = costoAtaqueEspecial(arma, 'contra'), especialOpor = costoAtaqueEspecial(arma, 'oportunidad');
  const id = arma ? arma.id : '';
  $('#tipo-ataque-lista').innerHTML = Combatiente.menuTipoAtaqueHtml({nombre: arma ? arma.nombre : 'Sin arma', normal: costoNormal, primero, especial, especialOpor, attr: 'data-tipoataque', ref: id, primeroTxt: 'primer ataque con esta arma (Tipo ÷ 2)', siguienteTxt: 'Tipo completo (ya atacaste con esta arma este turno)'});   // el menú común
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
      ataque: {tipo, armaId: arma ? arma.id : '', armaNombre: arma ? arma.nombre : '', tipoDado: tipoAtaque(arma), rango: !!(arma && arma.armaDeRango), alcance: alcanceDeArma(arma), ...Combatiente.ataqueDeArma(arma)}, suelto: hacer});
  }else hacer();
});

// Lo que el duelo necesita de esta página (comun/duelo.js): si el lado del duelo es este personaje, y cómo tira su PdG y su Evasión de siempre.
// El lado puede ser el personaje (ref = id de la ficha) o una de sus invocaciones (ref = «fichaId~invId»).
const dueloInvDe = lado => {
  const [f, invId] = String(lado.ref || '').split('~');
  return invId && f === (fichaVivo && fichaVivo.id) ? S.invocaciones.find(x => x.id === invId) || null : null;
};
// Lo que el duelo le pide a un PERSONAJE vive en comun/ficha-duelo.js (paso 4, etapa 3c-4c, 2026-10-01): la misma pieza la usa
// la Botonera nueva del mapa. Acá quedan las invocaciones (un lado «fichaId~invId»), que siguen con su código de siempre.
const dueloUi = {...combateUi,
  soy: lado => !!(lado && lado.tipo === 'pj' && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM && lado.ref === fichaVivo.id),
  reabrir: (id, campo) => Duelo.reabrir(id, campo),
  fijarHp: v => fijarHp(v),
};
const dueloPj = FichaDuelo.hooks(() => S, dueloUi);
// Lo que el duelo le pide a una INVOCACIÓN vive en comun/inv-duelo.js (paso 4, etapa 4e, tanda 4): la misma pieza la usa la
// Botonera nueva del mapa. Acá, cómo lo hace la ficha (publicar con registrarTirada, redibujar las invocaciones).
const dueloInvUi = {
  inv: lado => dueloInvDe(lado),
  registrar: (origen, r) => registrarTirada(origen, r),
  toast: t => toast(t),
  cambiar: fn => { if(fn() !== false) renderInvocaciones(); },
  parry: parryPendienteInv,
  soy: lado => !!(lado && lado.tipo === 'pj' && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM && dueloInvDe(lado)),
};
const dueloInv = InvDuelo.hooks(dueloInvUi);
// Ejecutar una habilidad (paso 3c-5a): la regla en comun/ficha-acciones.js; acá lo que se ve y lo que todavía hace solo la ficha
// (trampa, zona, la Ejecución paso a paso).
const habUi = {...combateUi,
  cambio: lista => lista.forEach(k => {
    if(k === 'habilidades' || k === 'efectos' || k === 'equipo' || k === 'mochila') renderList(k);
    else if(k === 'invocaciones') renderInvocaciones();
    else combateUi.cambio([k]);
  }),
  presets: EFECTOS_PRESET,
  recordatorios: avisos => publicarRecordatorios(avisos),
  yo: () => ({ref: fichaVivo ? fichaVivo.id : '', tipo: 'pj', nombre: (S.meta && S.meta.nombre) || 'Personaje'}),
  enMapa: () => window.parent !== window,
  alMapa: (tipo, msg) => MensajesMapa.alMapa(tipo, msg),
  dueloDisponible: () => !!(typeof Duelo !== 'undefined' && Duelo.disponible() && fichaVivo && fichaVivo.id && !fichaVivo.soloLectura && !fichaVivo.editaGM),
  puedeEscribir: () => !!(fichaVivo && fichaVivo.id && !fichaVivo.soloLectura),
  elegirObjetivo: cfg => Duelo.elegirObjetivo(cfg),
  colocarZona: (it, xSp, xNitros) => colocarZonaDeHab(it, xSp, xNitros),
  mesaHabilidad: (nombre, detalle) => mesaPublicarHabilidad(nombre, detalle),
  fijarHp: v => fijarHp(v),
  efecto: it => aplicarEfectoDeConsumo(it),
  colocarTrampa: it => colocarTrampaDeHab(it),
  avisarZona: it => avisarZonaAlMapa(it),
  terminar: (it, arma, xSp, xNitros) => terminarEjecucionHab(it, arma, xSp, xNitros),
  flashFuera: it => usarFlashFueraDelDuelo(it),
  elegirArmaHab: (it, opciones) => {
    $('#elegir-arma-lista').innerHTML =
      `<div class="hint">${esc(it.nombre)}: cuesta lo mismo que un ataque con el arma que elijas, y cuenta como ese ataque.</div>` +
      opciones.map(o => `
      <button class="btn" data-habarma="${esc(it.id)}:${esc(o.arma.id)}" style="width:100%">
        ${o.mano ? `Mano ${o.mano}: ` : ''}${esc(o.arma.nombre)} — ${fmt(costoAtaqueNitros(o.arma))} No2${ataquesConArma(o.arma) ? '' : ' (primer ataque)'}${costoAtaqueNitros(o.arma) > num(S.nitros) ? ' · no te alcanza' : ''}
      </button>`).join('');
    $('#scrim-elegir-arma').classList.add('open');
  },
  pedirCostoX: (it, armaPend) => {
    pendingArmaHab = armaPend;
    const arma = armaPend === undefined ? null : armaPend;
    pendingEjecucion = it.id;
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
  },
  cerrarCostoX: () => { $("#scrim-costox").classList.remove("open"); pendingEjecucion = null; },
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
    if(inv){ dueloInv.atacar(d); return; }   // comun/inv-duelo.js
    dueloPj.atacar(d);
  },
  // Para el crítico: el Crítico frecuente y potente del atacante (con el arma que usa) y la Resistencia a crítico del defensor contra el Tipo del arma.
  statsCritico: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv) return dueloInv.statsCritico(d);
    return dueloPj.statsCritico(d);
  },
  resistenciaCritico: d => {
    const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
    if(i < 0) return 0;
    const inv = dueloInvDe(d.defensor);
    if(inv) return dueloInv.resistenciaCritico(d);
    return dueloPj.resistenciaCritico(d);
  },
  // Los efectos al golpear del arma (o de la invocación) que el duelo resuelve uno por uno.
  efectosArma: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv) return dueloInv.efectosArma(d);
    return dueloPj.efectosArma(d);
  },
  // El daño del arma del ataque (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
  dano: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){ dueloInv.dano(d); return; }
    dueloPj.dano(d);
  },
  // Moneda Re-Roll (2026-09-27): ¿tengo una y cuánto cuesta? / usarla para reabrir una tirada del duelo.
  rerollInfo: d => {
    if(dueloInvDe(d.atacante) || dueloInvDe(d.defensor)) return {disponible: false};
    return dueloPj.rerollInfo(d);
  },
  rerollUsar: (d, campo) => dueloPj.rerollUsar(d, campo),
  // Flash (2026-09-27): las habilidades Flash que me sirven para esta tirada del duelo (se marcan ANTES de tirar) y su uso (cobra los SP; el duelo suma el bono).
  flashOpciones: (d, campo) => {
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    const inv = dueloInvDe(lado);
    if(inv) return dueloInv.flashOpciones(d, campo);   // invocación: como un creep (cooldown)
    return dueloPj.flashOpciones(d, campo);
  },
  // Usarlo: «¿es tu turno?» — en turno ajeno cuesta el doble (P136); se cobra al contestar y el duelo suma el bono.
  flashUsar: (d, campo, modo, habId) => {
    const inv = dueloInvDe((campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor);
    if(inv) return dueloInv.flashUsar(d, campo, modo, habId);
    return dueloPj.flashUsar(d, campo, modo, habId);
  },
  // Habilidades dirigidas: la tirada de quien la usa (quien = 'atacante') o la de quien se resiste (quien = 'defensor', modo = el stat que eligió).
  habTirar: (d, quien, modo) => {
    const lado = quien === 'atacante' ? d.atacante : d.defensor;
    const inv = dueloInvDe(lado);
    if(!inv){ dueloPj.habTirar(d, quien, modo); return; }
    dueloInv.habTirar(d, quien, modo);
  },
  // «Cuánto tirarías»: la fórmula de dados de ese stat (para el botón de defensa).
  habValor: (d, quien, stat) => {
    const inv = dueloInvDe(quien === 'atacante' ? d.atacante : d.defensor);
    if(!inv) return dueloPj.habValor(d, quien, stat);
    return dueloInv.habValor(d, quien, stat);
  },
  // ¿El objetivo de una habilidad dirigida puede parriar ahora? (2026-09-29, la caja "Parry" del paso Resistencia
  // del 🎯/✨ — misma regla que un ataque normal, P121: sin arma ni escudo equipado, no hay Parry.)
  puedeParry: d => {
    const inv = dueloInvDe(d.defensor);
    return inv ? dueloInv.puedeParry(d) : dueloPj.puedeParry(d);   // arma de verdad o escudo (2026-09-30)
  },
  // Cómo puede defenderse (elige a ciegas): Evasión, o Parry con cada arma o escudo equipado (siempre 1 No2).
  opcionesDefensa: d => {
    const inv = dueloInvDe(d.defensor);
    if(!inv) return dueloPj.opcionesDefensa(d);
    return dueloInv.opcionesDefensa(d);
  },
  defender: (d, modo, itemId) => {
    const inv = dueloInvDe(d.defensor);
    if(inv){ dueloInv.defender(d, modo); return; }
    dueloPj.defender(d, modo, itemId);
  },
  // La Fuerza del golpe del atacante contra el Bloqueo del defensor (Fue + peso de su arma).
  fuerza: d => {
    const inv = dueloInvDe(d.atacante);
    if(inv){ dueloInv.fuerza(d); return; }
    dueloPj.fuerza(d);
  },
  // El Bloqueo del defensor con el mismo arma o escudo con el que hizo Parry.
  bloquear: d => {
    const inv = dueloInvDe(d.defensor);
    if(inv){ dueloInv.bloquear(d); return; }   // el duelo ya sabe que ganó el Parry
    dueloPj.bloquear(d);
  },
  // Con qué arma contraataca (la del Parry si es un arma con daño; si no, la primera arma equipada con daño).
  armaContra: d => {
    const inv = dueloInvDe(d.defensor);
    if(inv) return dueloInv.armaContra(d);
    return dueloPj.armaContra(d);
  },
};

// Fuerza del golpe (2026-09-26, reglas del escudo): la tirada del ATACANTE contra el Bloqueo del defensor. Si el defensor gana el Parry (con arma o escudo),
// su Bloqueo (Fuerza + peso de lo que usó) se enfrenta a tu Fuerza + el peso de tu arma; esa suma es el dado. Sin costo.
function fuerzaGolpeValorConArma(arma){ return FichaAcciones.fuerzaGolpeValorConArma(S, arma); }   // comun/ficha-acciones.js
function fuerzaGolpeConArma(arma){ FichaAcciones.fuerzaGolpeConArma(S, arma, combateUi); }

// Botones 🎲 Parry y 🎲 Bloqueo: con dos o más armas equipadas se elige con cuál.
function elegirArmaDefensa(tipo){ FichaAcciones.elegirArmaDefensa(S, tipo, combateUi); }   // comun/ficha-acciones.js

function atacarConArma(arma, forzar){ FichaAcciones.atacarConArma(S, arma, forzar, combateUi); }   // comun/ficha-acciones.js

/* ---------- Lupa de la Botonera: cómo se calcula cada tirada y cuánto cuesta ----------
   La del personaje vive en comun/ficha-lupa.js (paso 4 etapa 3c-6, la usa también el mapa); acá quedan las de las
   invocaciones (lupaHtmlInv). */
function lupaHtml(clave){ return FichaLupa.contenido(S, clave); }   // comun/ficha-lupa.js

// Contenido de la 🔍 (comun/lupa.js lo pide con lupaContenido).
function lupaContenido(clave){
  if(clave.startsWith('inv:')) return lupaHtmlInv(clave);
  return lupaHtml(clave);
}

/* ---------- Lupa de la Botonera de una invocación (igual que la de un
   creep en gm-tools): de qué stat sale, sus modificadores, cómo se
   reparte en dados y el costo en No2. ---------- */
function lupaStatInv(inv, statId, o){ return InvLupa.stat(inv, statId, o); }   // comun/inv-lupa.js (4e, tanda 6)
function lupaHtmlInv(clave){   // comun/inv-lupa.js (4e, tanda 6): lo usa también el mapa
  return InvLupa.contenido(S.invocaciones.find(x => x.id === clave.split(':')[1]), clave);
}

function atacar(){
  // Sentado no puede atacar: lo pregunta FichaAcciones al pagar el ataque (Combatiente.preguntaSentado), suelto o en el duelo.
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
function limiteCostoX(cual){ return FichaAcciones.limiteCostoX(S, cual); }   // comun/ficha-acciones.js

// Habilidades con costo de Nitros "ATAQUE": cuestan lo mismo que un ataque
// con el arma que se elige al ejecutarlas y cuentan como ese ataque.
let pendingArmaHab = undefined;   // arma elegida para la habilidad en curso (null = sin arma)

function armasParaHabilidad(){ return FichaBotonera.armasParaHabilidad(S); }   // comun/ficha-botonera.js

// Lo mínimo que puede costar (para saber si alcanza) y el texto para mostrar.
function costoAtaqueMinimo(){ return FichaBotonera.costoAtaqueMinimo(S); }
function costoAtaqueHabTxt(){ return FichaBotonera.costoAtaqueHabTxt(S); }

// ⚡ Flash (P136, regla del dueño): en tu turno cuesta lo que dice la habilidad (SP y vida); en turno ajeno, el doble — igual
// dentro del duelo que con el botón. Nunca cuesta No2. Pregunta el turno, revisa que alcance y cobra; null = no se usó.
const costoFlashDe = FichaDuelo.costoFlashDe;   // comun/ficha-duelo.js
function pagarFlash(h){ return FichaDuelo.pagarFlash(S, h, dueloUi); }
// Un Flash con el botón Ejecutar, fuera del cuadro del duelo: la misma regla de costo, se anuncia y el bono se suma a mano.
function usarFlashFueraDelDuelo(it){ return FichaDuelo.usarFlashFueraDelDuelo(S, it, habUi); }   // comun/ficha-duelo.js
// Ejecutar / Anunciar una habilidad (paso 4 etapa 3c-5a, 2026-10-01): la regla vive en comun/ficha-acciones.js (la usa también la
// Botonera nueva del mapa); acá queda lo que se ve — los carteles de "¿con qué arma?" y del costo X — en habUi.
function ejecutarHabilidad(id, armaId, forzar){ return FichaAcciones.ejecutarHabilidad(S, id, armaId, forzar, habUi); }

// Si la habilidad cuesta como un ataque, cuenta como ese ataque del arma
// (el próximo ataque con esa arma ya paga Tipo completo). Devuelve el texto.
function registrarAtaqueDeHabilidad(it, arma){ return FichaAcciones.registrarAtaqueDeHabilidad(S, it, arma); }

function confirmarCostoVariable(){
  const it = S.habilidades.find(h => h.id === pendingEjecucion);
  if(!it) return;
  const sp = num($('#f-costox-sp').value);
  const nitros = num($('#f-costox-nitros').value);
  const armaDeLaHab = pendingArmaHab === undefined ? null : pendingArmaHab;
  if(FichaAcciones.confirmarCostoVariable(S, it, sp, nitros, armaDeLaHab, habUi)) pendingArmaHab = undefined;
}

// El pase de turno (2026-10-02, hoja de ruta A2): la regla vive en comun/ficha-mantenimiento.js (la usa también el mapa, que
// hace el Mantenimiento de sus personajes sin cargar la ficha); acá queda lo que se ve.
function mantenimiento(){
  const {rep, avisos} = FichaMantenimiento.aplicar(S, {
    fijarHp: v => fijarHp(v),
    muerte: () => renderOverlayMuerte(),
    limpiarParry: () => { parryArmaPendiente = null; parryPendienteInv.clear(); },
  });
  mesaPublicarReporte(`Turno ${S.turno}`, rep);

  renderTurno();
  renderList('efectos');
  renderList('habilidades');
  renderNitros();
  renderInvocaciones();
  refresh();
  if(S.hp === 0) toast('Te quedaste en 0 de HP');

  if(avisos.length) showReminder(avisos);
  // En segundo plano (desde el mapa) el cartel no se ve: los recordatorios
  // van a la Mesa, a nombre del personaje.
  if(avisos.length && typeof MODO_MANTENIMIENTO !== 'undefined' && MODO_MANTENIMIENTO) publicarRecordatorios(avisos);
}

// Al ejecutar una habilidad, su descripción va a la Mesa aunque no tire
// dados, así todos leen qué hace. Si tira, viaja con la tirada (una sola
// línea); si no, va en su propia línea.
function habilidadTira(h){ return FichaAcciones.habilidadTira(h); }   // comun/ficha-acciones.js

function anunciarHabilidad(h){ FichaAcciones.anunciarHabilidad(S, h, habUi); }

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
function calcularHpRevivir(){ return FichaAcciones.hpRevivir(S, revivirModo, $('#f-revivir-pct').value, $('#f-revivir-valor').value); }   // comun/ficha-acciones.js (A6b)
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
  FichaAcciones.revivir(S, val);
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
