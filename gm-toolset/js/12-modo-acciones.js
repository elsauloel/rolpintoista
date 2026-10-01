// js/12-modo-acciones.js — tramo 12 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Modo acciones (dentro del mapa) ----------
   El mapa del GM abre gm-tools en un iframe con ?modo=acciones&creep=<id>:
   al cargar los creeps se abre la ventana de Acciones de ese creep; cuando
   se cierran todas las ventanitas se le avisa al mapa para que oculte el
   iframe, y el mapa puede pedir abrir las de otro creep sin recargar. Lo
   que se haga se guarda solo, como siempre. */
const MODO_ACCIONES = document.documentElement.classList.contains('modo-acciones');

function estadosModoAbrir(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  abrirPresetsEstadoCreep(creepId);
  gmAvisarMapa('acciones-lista');
}

// Lo que el duelo necesita de esta página (comun/duelo.js): si el lado del duelo es uno de estos creeps, y cómo tira su PdG y su Evasión.
window.DUELO_HOOKS = {
  soy: lado => !!(lado && lado.tipo === 'creep' && gmVivo.activo && S.creeps.some(c => c.id === lado.ref)),
  atacar: d => {
    const sc = S.creeps.find(c => c.id === d.atacante.ref);
    if(!sc) return;
    if(d.ataque.tipo === 'habilidad-arma'){ tirarPdgDeArreglosCreep(sc, d.ataque); return; }   // los No2 ya los cobró la habilidad
    if(d.ataque.tipo === 'normal') atacarNormalCreep(sc); else ataqueEspecialCreep(sc, d.ataque.tipo);
  },
  // Para el crítico: el Crítico frecuente y potente del creep y su Resistencia a crítico contra el Tipo del arma que lo ataca.
  statsCritico: d => {
    const sc = S.creeps.find(c => c.id === d.atacante.ref);
    return sc ? {frecuente: Math.max(0, Math.round(creepModTotal(sc, 'crit'))), potente: Math.max(0, Math.round(creepModTotal(sc, 'critpot')))} : {frecuente: 0, potente: 0};
  },
  resistenciaCritico: d => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    const i = [4, 6, 8, 10, 12].indexOf(num(d.ataque.tipoDado));
    return sc && i >= 0 ? num((sc.crit || [])[i]) : 0;
  },
  // Los efectos al golpear del arma del creep, que el duelo resuelve uno por uno.
  efectosArma: d => {
    const sc = S.creeps.find(c => c.id === d.atacante.ref);
    return sc ? (sc.armaEfectos || []).map(e => ({...EfectosGolpe.normalizar(e), stacks: num(e.stacks)})) : [];
  },
  // El daño del arma del creep (sin los efectos del golpe: los resuelve el duelo en su paso de efectos).
  dano: d => {
    const sc = S.creeps.find(c => c.id === d.atacante.ref);
    if(!sc) return;
    let formula = danoTxt(sc, creepStatValor(sc, 'dmg'));
    const m = d.ataque.tipo === 'habilidad-arma' ? (d.ataque.mods || {}) : null;   // lo que le suma la habilidad: dados del Tipo del arma y daño fijo
    if(m){
      if(num(m.dados) > 0) formula += ` + ${Math.round(num(m.dados))}d${num(sc.armaTipo) || 8}`;
      if(num(m.fijo)) formula += ` ${num(m.fijo) > 0 ? '+' : '-'} ${fmt(Math.abs(num(m.fijo)))}`;
    }
    const r = tirarDados(formula);
    if(r) registrarTirada(`${sc.nombre} · Daño`, r);
  },
  // ⚡ Flash (P135): las reacciones del creep que sirven para esta tirada del duelo (se marcan antes de tirar) y su uso.
  flashOpciones: (d, campo) => {
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    const sc = S.creeps.find(c => c.id === lado.ref);
    if(!sc) return [];
    return (sc.habilidades || []).filter(h => Combatiente.flashPara(h.duelo, campo)).map(h => ({habId: h.id, nombre: h.nombre, bono: num(h.duelo.flash.bono), en: h.duelo.flash.en || [],
      costoTxt: costoFlashCreepTxt(h), motivoNo: Combatiente.bloqueoHab(h, {hp: sc.hp}).toLowerCase()}));
  },
  flashUsar: (d, campo, modo, habId) => {
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    const sc = S.creeps.find(c => c.id === lado.ref);
    const h = sc && (sc.habilidades || []).find(x => x.id === habId);
    if(!h || !Combatiente.flashPara(h.duelo, campo)) return null;
    if(!Combatiente.flashPara(h.duelo, campo, modo)){ toast(`${h.nombre} no vale para esta tirada (${modo === 'parry' ? 'Parry' : campo})`); return null; }
    // «¿es su turno?»: lo de la habilidad o el doble (P136); sin No2
    return pagarFlashCreep(sc, h).then(p => p ? {bono: num(h.duelo.flash.bono), etq: h.nombre, quien: sc.nombre} : null);
  },
  // Habilidades dirigidas: la tirada del creep que la usa (quien = 'atacante') o la del creep que se resiste (quien = 'defensor').
  habTirar: (d, quien, modo) => {
    const lado = quien === 'atacante' ? d.atacante : d.defensor;
    const sc = S.creeps.find(c => c.id === lado.ref);
    const c = quien === 'atacante' ? d.hab.tira : (d.hab.contra || []).find(x => x.modo === modo);
    if(!sc || !c) return;
    const nombre = quien === 'atacante' ? `${d.hab.nombre} · ${c.etq}` : c.etq;
    // Tirada personalizada (la fórmula llega lista desde habEjecucion): se tira y se anuncia, como en la ficha.
    if(c.formula){ const r = tirarDados(c.formula); if(r) registrarTirada(nombre, r); else toast(`No se pudo tirar «${c.etq}»: la fórmula «${c.formula}» no es válida (revisá la habilidad)`); return; }
    if(!c.stat) return;
    tirarValorStat(nombre, habStatCreep(sc, c.stat) + num(c.bono), sc, c.stat);
  },
  habValor: (d, quien, stat) => {
    const sc = S.creeps.find(c => c.id === (quien === 'atacante' ? d.atacante : d.defensor).ref);
    if(!sc) return '';
    const v = habStatCreep(sc, stat), f = formulaParaValor(v);
    return f ? f.formula : fmt(num(v));
  },
  // ¿El creep objetivo de una habilidad dirigida puede parriar ahora? (2026-09-29, misma regla que un ataque
  // normal, P121: sin arma no hay Parry.)
  puedeParry: d => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    return !!defensaCreep(sc);   // arma de verdad o escudo (un arma natural no alcanza, por ahora)
  },
  // Cómo puede defenderse el creep (elige el GM, a ciegas): Evasión o Parry con su arma (siempre 1 No2).
  opcionesDefensa: d => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    if(!sc) return [];
    // «Cuánto tirarías» antes de elegir (2026-09-27, pedido del dueño): mismo criterio que ya tenía la ficha
    // con sus personajes e invocaciones — acá faltaba para los creeps.
    const fx = (v, statId) => { const f = formulaParaValor(v); if(!f) return fmt(num(v)); const mit = statId ? mitadesDeTirada(sc.estados, statId) : 0; return f.formula + ' ÷2'.repeat(mit); };
    const c = costoParryCreep(sc);
    const ops = [{modo: 'evasion', etiqueta: '🏃 Evasión', info: [`Evasión 🎲 ${fx(creepStatValor(sc, 'eva'), 'eva')}`]}];
    // Parry solo con un arma de verdad o un escudo (regla del dueño, 2026-09-30; un arma natural no alcanza, por ahora).
    const def = defensaCreep(sc);
    if(def) ops.push({modo: 'parry', itemId: '', itemNombre: def.nombre, etiqueta: `${def.nombre === sc.armaNombre ? '🗡' : '🛡'} Parry · ${def.nombre}`, costo: c, motivoNo: c > num(sc.nitros) ? 'no le alcanzan los No2' : '',
      info: [`Parry 🎲 ${fx(creepStatValor(sc, 'parry'), 'parry')}`, `si gana, Bloqueo 🎲 ${fx(bloqueoValorCreep(sc))}`]});
    return ops;
  },
  defender: (d, modo) => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    if(!sc) return;
    if(modo === 'parry'){
      if(!defensaCreep(sc)){ toast(`${sc.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`); return; }
      const costo = costoParryCreep(sc);
      if(costo > num(sc.nitros)){ toast(`${sc.nombre}: no le alcanzan los No2 — el Parry cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`); return; }
      sc.nitros = num(sc.nitros) - costo;
      renderAll();
      tirarValorStat(`${sc.nombre} · Parry`, creepStatValor(sc, 'parry'), sc, 'parry');
      toast(`${sc.nombre}: Parry −${fmt(costo)} No2 · quedan ${fmt(sc.nitros)}`);
    }else tirarValorStat(`${sc.nombre} · Evasión`, creepStatValor(sc, 'eva'), sc, 'eva');
  },
  fuerza: d => {
    const sc = S.creeps.find(c => c.id === d.atacante.ref);
    if(sc) tirarValorStat(`${sc.nombre} · Fuerza del golpe`, fuerzaGolpeValorCreep(sc));
  },
  bloquear: d => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    if(sc) tirarValorStat(`${sc.nombre} · Bloqueo`, bloqueoValorCreep(sc), sc, 'bloqueo');
  },
  armaContra: d => {
    const sc = S.creeps.find(c => c.id === d.defensor.ref);
    return {armaId: '', armaNombre: (sc && sc.armaNombre) || '', tipoDado: (sc && num(sc.armaTipo)) || 8};
  },
};

// La ficha del creep (la ventana «Editar creep» de GM Tools, editable) dentro del mapa: el 📜 del token de un creep o la tecla F, solo para el GM.
function accionesModoVer(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  document.querySelectorAll('.scrim.open').forEach(x => x.classList.remove('open'));
  abrirEditarCreep(creepId);   // la ficha editable del creep (stats, equipo, habilidades en lista con descripción y Ejecutar); F o el 📜 del token la abren en el mapa
  gmAvisarMapa('acciones-lista');
}

function accionesModoAbrir(creepId){
  if(!S.creeps.some(sc => sc.id === creepId)){
    toast('Ese creep ya no está en gm-tools');
    gmAvisarMapa('acciones-cerrada');
    return;
  }
  abrirAccionesCreep(creepId);
  gmAvisarMapa('acciones-lista');
}

if(MODO_ACCIONES){
  // B (la tecla que abre las Acciones desde el mapa) también las cierra, con el foco adentro de esta ventana: se hace como Escape.
  document.addEventListener('keydown', e => {
    if(e.key !== 'b' && e.key !== 'B' && e.key !== 'f' && e.key !== 'F') return;   // B o F también las cierran
    if(e.ctrlKey || e.altKey || e.metaKey || e.isTrusted === false) return;
    if(e.target && e.target.closest && e.target.closest('input,select,textarea,[contenteditable]')) return;
    e.preventDefault();
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
  });
  const observador = new MutationObserver(() => {
    if(gmVivo.listo && !document.querySelector('.scrim.open, #ep-fondo, #ae-fondo, #at-fondo, #adh-fondo, #duelo-fondo')) gmAvisarMapa('acciones-cerrada');   // #ep-fondo: cartelito de cantidades de un estado
  });
  document.querySelectorAll('.scrim').forEach(el => observador.observe(el, {attributes: true, attributeFilter: ['class']}));
  window.addEventListener('message', e => {
    if(e.origin !== location.origin || !e.data) return;
    if(e.data.tipo === 'abrir-acciones' && gmVivo.listo) accionesModoAbrir(e.data.creep);
    if(e.data.tipo === 'abrir-ver-creep' && gmVivo.listo) accionesModoVer(e.data.creep);   // el 📜 del token de un creep
    // ⚗ Las Acciones nuevas del mapa (paso 4, etapa 4b) las dibuja el mapa; sus botones, por ahora, los hace GM Tools: se dibujan
    // las Acciones de ese creep (aunque no estén abiertas) y se toca el mismo botón, como si se hubiera tocado acá. Lo que cambie
    // se sube enseguida, así el mapa lo muestra sin esperar.
    if(e.data.tipo === 'acciones-delegar' && gmVivo.listo){
      if(S.creeps.some(sc => sc.id === e.data.creep)){
        accionesCreepId = e.data.creep;
        renderAccionesCreep();
        const d = e.data.datos || {};
        const sel = Object.keys(d).map(k => `[data-${k.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}="${CSS.escape(String(d[k]))}"]`).join('');
        const b = sel ? document.querySelector('#acciones-creep-lista ' + sel) : null;
        if(b) b.click(); else toast('No se encontró ese botón en las Acciones de GM Tools');
        setTimeout(() => gmGuardarTick(true), 300);
      }else toast('Ese creep ya no está en gm-tools');
    }
    // Escape apretado en el mapa: se hace como si se apretara acá.
    if(e.data.tipo === 'tecla-f') document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    if(e.data.tipo === 'tecla-escape') document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    // El mapa pide agregar un estado a un creep: mismo selector que "+ Estado".
    if(e.data.tipo === 'abrir-estados' && gmVivo.listo) estadosModoAbrir(e.data.creep);
    // El ⚙ de un estado en el mapa: se abre su editor (se busca por nombre).
    if(e.data.tipo === 'editar-estado' && gmVivo.listo){
      const sc = S.creeps.find(x => x.id === e.data.creep);
      const es = sc && (sc.estados || []).find(x => x && x.nombre === e.data.nombre);
      if(!es){ toast('No encontré ese estado en el creep'); gmAvisarMapa('acciones-cerrada'); return; }
      abrirEditorEstadoCreep(sc.id, es.id);
      gmAvisarMapa('acciones-lista');
    }
  });
}

async function gmMantenimientoRevisar(){
  const g = gmVivo;
  if(gmMantenimientoSenal === null || !g.activo || !g.listo) return;
  if(gmMantenimientoRevisando){ gmMantenimientoOtraVez = true; return; }
  gmMantenimientoRevisando = true;
  try{
    const objetivo = gmMantenimientoSenal;
    const ref = fbDb.doc(fbRutaCampana('gm/mantenimiento'));
    const veces = await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      const hecho = doc.exists ? Math.round(num(doc.data().aplicado)) : null;
      if(hecho !== null && hecho >= objetivo) return 0;
      tx.set(ref, {aplicado: objetivo, actualizado: firebase.firestore.FieldValue.serverTimestamp()});
      return hecho === null ? 0 : Math.min(MANTENIMIENTO_MAX_SEGUIDOS, objetivo - hecho);
    });
    for(let i = 0; i < veces; i++) mantenimiento();
    if(MODO_MANTENIMIENTO){
      // En segundo plano (iframe del mapa): avisar cuando los creeps ya se guardaron.
      const inicio = Date.now();
      const revisar = () => {
        if(gmHayPendiente() && Date.now() - inicio < 20000){ gmGuardarTick(true); setTimeout(revisar, 400); return; }
        gmAvisarMapa('mantenimiento-listo');
      };
      setTimeout(revisar, 300);
    }
  }catch(err){
    console.error('No se pudo aplicar el mantenimiento a los creeps:', err);
    if(MODO_MANTENIMIENTO) gmAvisarMapa('mantenimiento-listo');
  }finally{
    gmMantenimientoRevisando = false;
    if(gmMantenimientoOtraVez){ gmMantenimientoOtraVez = false; gmMantenimientoRevisar(); }
  }
}

// 📜 Historial (comun/historial.js): cada segundo se le pasa la lista de creeps para que anote cambios de HP y de estados.
setInterval(() => {
  if(typeof historialObservarCreeps !== 'function' || !gmVivo || !gmVivo.listo || !fbMiembro || !fbMiembro.gm || window.parent !== window) return;
  historialObservarCreeps(creepsReales().map(sc => ({id: sc.id, nombre: sc.nombre, hp: sc.hp, estados: (sc.estados || []).filter(e => e && e.activo !== false).map(e => ({nombre: e.nombre, turnos: num(e.turnos)}))})));
}, 1000);

mesaIniciar(gmAlEntrar);
