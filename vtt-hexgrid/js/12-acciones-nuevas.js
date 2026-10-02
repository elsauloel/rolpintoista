// js/12-acciones-nuevas.js — tramo 12 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): Acciones nuevas de un creep (⚗).
/* ---------- ⚗ Acciones nuevas de un creep (prueba) — paso 4, etapa 4b (docs/plan-paso4-etapa4.md, 2026-10-01) ----------
   Con el interruptor ⚗ prendido (el mismo de la Botonera nueva), las Acciones de un creep (⚡ del token o B) las dibuja el mapa
   con comun/creep-botonera.js, en un recuadro aislado (shadow DOM) con el gm-tools.css de siempre, así se ven igual. Los datos
   salen de la parte privada del creep que el mapa ya escucha (creepsPriv). Por ahora solo dibuja: cada botón se lo pide a GM
   Tools en el marco (mensaje 'acciones-delegar'), que lo toca como siempre; lo que abra (el menú de ataque, Ver, un cartel) sale
   encima, en la capa de siempre. Sin 🔍 todavía (la de los creeps vive en GM Tools: 4c). */
const AC_PIEZAS = ['../comun/lupa.js?v=20261001a', '../comun/creep-lupa.js?v=20261002b', '../comun/creep-botonera.js?v=20261001b', '../comun/creep-acciones.js?v=20261002i', '../comun/confirmar-turno.js?v=20260930b', '../comun/creep-duelo.js?v=20261002a'];
var ac = null;          // {creepId, host, raiz}
var acCss = '';
var acCargando = null;
function acCargarPiezas(){
  if(!acCargando){
    if(!document.querySelector('link[data-bn-fuentes]')){
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = BN_FUENTES; l.dataset.bnFuentes = '1'; document.head.appendChild(l);
    }
    acCargando = cargarPiezas(AC_PIEZAS)
      .then(() => fetch('../gm-toolset/gm-tools.css?v=20260930a').then(r => r.text()))
      .then(css => { acCss = css.replace(/:root\b/g, ':host'); })
      .catch(err => { acCargando = null; throw err; });
  }
  return acCargando;
}
function acUbicar(){
  if(!ac || ac.host.hidden) return;
  const h = ac.host;
  if(!botoneraEnMitad()){ h.removeAttribute('style'); return; }
  const r = $('#lienzo-caja').getBoundingClientRect();
  Object.assign(h.style, {left: r.left + 'px', top: r.top + 'px', right: 'auto', bottom: 'auto', width: Math.round(r.width / 2) + 'px', height: r.height + 'px'});
}
window.addEventListener('resize', acUbicar);
function acDibujar(){
  if(!ac) return;
  const cuerpo = ac.raiz.querySelector('#ac-contenido');
  const crudo = creepPrivadoDe(ac.creepId);
  if(!crudo){ cuerpo.innerHTML = '<div class="modal acciones-modal"><div class="body"><div class="hint">Cargando el creep…</div></div></div>'; return; }
  const sc = CreepCalculo.normalizar(structuredClone(crudo));
  sc.id = ac.creepId;
  const r = CreepBotonera.html(sc, {parryPendiente: acParry.has(ac.creepId)});
  const scroll = ac.host.scrollTop;
  cuerpo.innerHTML = `<div class="modal acciones-modal">
    <header>
      <div style="display:flex;align-items:center;gap:10px;min-width:0">
        <h3>Acciones</h3>
        <span class="acciones-badge">${esc(r.badge)}</span>
        <span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(r.titulo)}</span>
      </div>
      <button class="iconbtn" data-ac-cerrar title="Cerrar (B o Esc)">Cerrar</button>
    </header>
    <div class="body">${r.html}</div>
  </div>`;
  ac.host.scrollTop = scroll;
  acVerCreepDibujar();   // el 🔍 Ver todo, si está abierto (A6a)
}
/* Paso 4c (tandas 1 y 2): lo que el mapa ya hace él mismo, con comun/creep-acciones.js — las tiradas de stats, Esquivar, Fuerza
   del golpe, Daño (con los efectos al golpear de su arma), Levantarse, Parry y Bloqueo. Lo que cambia al creep (No2, Sentado) se
   escribe con modificarCreep (transacción sobre su parte privada + resumen + firma: GM Tools, abierto en otra pestaña, se entera
   por la firma). El Parry que espera su Bloqueo vive acá (acParry), como en GM Tools. */
var acParry = new Set();
function acCreep(){
  const crudo = creepPrivadoDe(ac.creepId);
  if(!crudo) return null;
  const sc = CreepCalculo.normalizar(structuredClone(crudo));
  sc.id = ac.creepId;
  return sc;
}
// Una tirada del creep a la Mesa, a su nombre y pintada como las de GM Tools; avisa 'tirada-registrada' (lo recoge el duelo).
function acPublicar(sc, t){
  if(!t) return;
  if(t.error){ toast(t.error); return; }
  mesaPublicar(t.origen, {...t.r, quien: sc.nombre, desde: 'gm'});
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen: t.origen, r: t.r}}));
}
// Cambia el creep en una transacción: `cambiar(sc)` recibe el creep al día (normalizado) y devuelve {error} o {aviso}. Si es un
// error de la regla, no se escribe nada y se avisa. Devuelve lo que devolvió `cambiar`, o null.
/* ---------- El Mantenimiento de los creeps, hecho por el mapa del GM (2026-10-02, hoja de ruta A2b) ----------
   Antes, en cada ⟳ el mapa del GM cargaba GM Tools en un marco invisible para que les pasara el turno. Ahora lo hace el mapa con la
   misma regla (CreepAcciones.mantenimiento): toma los turnos con la misma transacción de GM Tools (gm/mantenimiento; si otra
   pantalla ya los aplicó, nada), le pasa el turno a cada creep de la partida (modificarCreep: transacción + resumen + firma, así GM
   Tools abierto en otra pestaña se entera), sube el contador de turno de GM Tools (gm/estado) y anota en el 📜 Historial. */
async function mantenimientoCreeps(numero){
  if(!soyGM) return;
  try{
    await acCargarPiezas();
    const veces = await CreepAcciones.reclamarMantenimiento(fbDb, fbDb.doc(fbRutaCampana('gm/mantenimiento')), numero,
      () => firebase.firestore.FieldValue.serverTimestamp());
    if(!veces) return;
    acParry.clear();
    const snap = await fbDb.collection(fbRutaCampana('creeps')).get();
    let enCooldown = 0, hpAplicado = 0, vencidos = 0;
    for(const doc of snap.docs){
      for(let i = 0; i < veces; i++){
        let r = null, nombre = '';
        try{ await modificarCreep(doc.id, crudo => { const sc = CreepCalculo.normalizar(crudo); r = CreepAcciones.mantenimiento(sc); nombre = sc.nombre; return r; }); }
        catch(err){ r = null; console.error(`Mantenimiento: no se pudo pasar el turno del creep ${doc.id}`, err); }   // un creep a medio borrar, etc.
        if(!r) continue;
        enCooldown += r.enCooldown; hpAplicado += r.hpAplicado; vencidos += r.vencidos;
        if(r.rep.length && typeof historialReporteMantenimiento === 'function') historialReporteMantenimiento(nombre, r.rep);
      }
    }
    await fbDb.doc(fbRutaCampana('gm/estado')).set({turno: firebase.firestore.FieldValue.increment(veces),
      actualizado: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true});
    const detalle = [enCooldown ? `${enCooldown} CD en cuenta regresiva` : '', hpAplicado ? `${hpAplicado} estado(s) aplicados` : '',
      vencidos ? `${vencidos} estado(s) vencidos` : ''].filter(Boolean).join(' · ');
    toast(`Creeps: No2 recargados${detalle ? ` · ${detalle}` : ''}`);
    if(ac && !ac.host.hidden) acDibujar();
  }catch(err){
    console.error('No se pudo aplicar el Mantenimiento a los creeps:', err);
    toast('No se pudo pasar el turno de los creeps — mirá la consola');
  }
}
function acCambiar(cambiar){ return acCambiarCreep(ac.creepId, cambiar); }
async function acCambiarCreep(creepId, cambiar){
  try{
    return await modificarCreep(creepId, crudo => {
      const x = cambiar(CreepCalculo.normalizar(crudo));
      if(x && x.error) throw Object.assign(new Error(x.error), {regla: true});
      return x;
    });
  }catch(err){
    if(err.regla) toast(err.message);
    else { console.error('No se pudo cambiar el creep:', err); toast('No se pudo guardar el creep — revisá la consola'); }
    return null;
  }
}
// Los efectos al golpear de su arma (comun/efectos-golpe.js): recordar y tirar, no aplicar — igual que GM Tools.
function acEfectosAlPegar(sc){
  EfectosGolpe.alPegar({arma: `${sc.nombre} · ${sc.armaNombre || 'arma'}`, efectos: sc.armaEfectos, publicar: linea => {
    if(!fbDb || !fbUsuario || !fbMiembro) return;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String(sc.nombre || '').slice(0, 60),
      origen: linea.origen.slice(0, 120), formula: linea.formula.slice(0, 900),
      rolls: linea.rolls.slice(0, 100), mod: 0, total: 0, desde: 'efecto-gm',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudieron publicar los efectos en la Mesa:', err));
  }});
}
function acAccionAca(b){
  const d = b.dataset, sc = acCreep();
  if(!sc) return false;
  if(d.verhabaccion){ acVerHab(sc, d.verhabaccion); return true; }
  if(d.tirarstatcreep){ acPublicar(sc, CreepAcciones.tiradaStat(sc, d.tirarstatcreep.split(':')[1])); return true; }
  if(d.esquivarcreep){ acPublicar(sc, CreepAcciones.esquivar(sc)); return true; }
  if(d.fuerzacreep){ acPublicar(sc, CreepAcciones.fuerzaGolpe(sc)); return true; }
  if(d.daniocreep){
    const t = CreepAcciones.dano(sc);
    if(t){ acPublicar(sc, t); acEfectosAlPegar(sc); }
    return true;
  }
  if(d.levantarcreep){ acCambiar(c => CreepAcciones.levantarse(c)).then(x => { if(x) toast(x.aviso); }); return true; }
  if(d.parrycreep){
    const id = ac.creepId;
    acCambiar(c => CreepAcciones.pagarParry(c)).then(x => {
      if(!x) return;
      acParry.add(id);   // si gana el Parry, sigue el Bloqueo
      acPublicar(sc, CreepAcciones.parry(sc));
      toast(x.aviso);
      acDibujar();
    });
    return true;
  }
  if(d.atacarcreep){ acPreguntarTipoAtaque(sc); return true; }
  if(d.ejecutar){ acEjecutarHab(sc, d.ejecutar.split(':')[1]); return true; }
  if(d.danohabcreep){
    const h = (sc.habilidades || []).find(x => x.id === d.danohabcreep.split(':')[1]);
    if(h) acPublicar(sc, CreepAcciones.tiradaSegundaHab(sc, h));
    return true;
  }
  if(d.cdmod){
    const [, habId, accion] = d.cdmod.split(':');
    acCambiar(c => CreepAcciones.cdMod(c, habId, accion));
    return true;
  }
  if(d.bloqueocreep){
    const t = CreepAcciones.bloqueo(sc, acParry.has(ac.creepId));
    if(t.error){ toast(t.error); return true; }
    acParry.delete(ac.creepId);
    acDibujar();
    acPublicar(sc, t);
    return true;
  }
  return false;
}
/* Paso 4c (tanda 4): lo que el duelo le pide a un creep (su PdG, la defensa, el daño, la Fuerza del golpe, el Bloqueo, el crítico,
   el Flash, las tiradas de una habilidad dirigida) lo contesta el mapa con los mismos ganchos de GM Tools (comun/creep-duelo.js),
   sin pasar por el marco — para cualquier creep con token, si quien mira es el GM con ⚗ prendido (las piezas se cargan al
   prenderlo o al entrar con él prendido). Si no, por el marco, como siempre. */
function acDueloUi(){
  return {
    creep: ref => { const c = creepPrivadoDe(ref); if(!c) return null; const sc = CreepCalculo.normalizar(structuredClone(c)); sc.id = ref; return sc; },
    cambiar: (ref, fn) => acCambiarCreep(ref, fn),
    publicar: (sc, t) => acPublicar(sc, t),
    toast: t => toast(t),
    confirmar: t => confirm(t),
    soy: lado => !!(lado && lado.tipo === 'creep' && soyGM && creepPrivadoDe(lado.ref)),
    borrarParry: ref => acParry.delete(ref),
  };
}
function acHooksDuelo(lado){
  if(!lado || lado.tipo !== 'creep' || !soyGM || !bnActiva() || typeof CreepDuelo === 'undefined' || !creepPrivadoDe(lado.ref)) return null;
  return CreepDuelo.hooks(acDueloUi());
}

/* Paso 4c (tanda 3): Atacar. El menú "¿Qué ataque es?" (normal / oportunidad / contraataque, con lo que cuesta cada uno, igual que
   GM Tools), después el objetivo con un clic en el token (dueloElegirObjetivoMapa, el mismo de siempre) y el duelo; "Sin objetivo"
   hace el ataque suelto acá (cobra con modificarCreep y tira el PdG). Las tiradas que pide el duelo las sigue haciendo GM Tools
   en el marco (tanda 4). */
function acPreguntarTipoAtaque(sc){
  const normal = CreepCalculo.costoAtaque(sc), primero = num(sc.ataquesTurno) === 0, especial = CreepCalculo.costoContraataque(sc);
  ac.raiz.querySelector('#ac-tipo-lista').innerHTML = `<div class="hint">${esc(sc.nombre)}</div>
    <button class="btn" data-ac-tipo="normal" style="width:100%">⚔ Ataque normal — ${fmt(normal)} No2<br><span class="hint">${primero ? 'primer ataque del turno (Tipo ÷ 2)' : 'Tipo completo (ya atacó este turno)'}</span></button>
    <button class="btn" data-ac-tipo="oportunidad" style="width:100%">🏃 Ataque de oportunidad — ${fmt(especial)} No2<br><span class="hint">siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>
    <button class="btn" data-ac-tipo="contra" style="width:100%">↩ Contraataque — ${fmt(especial)} No2<br><span class="hint">solo tras ganar un Parry y un Bloqueo; siempre Tipo ÷ 2; no suma al conteo de ataques</span></button>`;
  ac.raiz.querySelector('#ac-tipo-ataque').classList.add('open');
}
function acAtacar(tipo){
  const sc = acCreep();
  if(!sc) return;
  const id = ac.creepId;
  const hacer = () => {
    if(tipo === 'normal' && (sc.estados || []).some(e => e.activo !== false && e.sentado) && !confirm(`${sc.nombre} está Sentado y no puede atacar. ¿Atacar igual?`)) return;
    const forzar = CreepAcciones.faltanNitros(sc, tipo);   // sin No2: avisar y dejar seguir (2026-10-02)
    if(forzar && !confirm(CreepAcciones.preguntaSinNitros(sc, tipo))) return;
    acCambiar(c => CreepAcciones.pagarAtaque(c, tipo, forzar)).then(x => {
      if(!x) return;
      CreepAcciones.alertaSinNitros(sc, tipo, x.forzado);
      if(tipo === 'normal') acParry.delete(id);   // atacar cierra el Parry que esperaba su Bloqueo
      acPublicar(sc, CreepAcciones.tiradaAtaque(sc, tipo));
      toast(x.aviso);
      acDibujar();
    });
  };
  if(typeof Duelo === 'undefined' || !Duelo.disponible()){ hacer(); return; }
  acElegirObjetivo(sc, {tipo, armaId: '', armaNombre: sc.armaNombre || '', tipoDado: num(sc.armaTipo) || 8, rango: !!sc.armaDeRango, alcance: CreepCalculo.alcance(sc)}, hacer);
}
// Elegir el objetivo (de un ataque o de una habilidad) con un clic en el token: mientras tanto las Acciones nuevas se esconden
// (tapan el mapa); "Sin objetivo" o cancelar las vuelven a mostrar. `suelto`: lo que se hace sin objetivo.
function acElegirObjetivo(sc, ataque, suelto){
  const id = ac.creepId;
  const reabrir = () => { if(ac && ac.creepId === id){ ac.host.hidden = false; acUbicar(); acDibujar(); } };
  ac.host.hidden = true;
  dueloElegirObjetivoMapa({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre}, ataque, conSuelto: true, alSuelto: () => { reabrir(); suelto(); }, alCancelar: () => reabrir()});
}

/* Paso 4c (tanda 5): las habilidades. Lo que cambia al creep (cobrar, cura y estado propio, el atajo ✨ «solo sobre sí») va en una
   transacción (CreepAcciones.ejecutarHab); lo que pasa después (la Mesa, el duelo, la trampa, la zona, «¿a quién le pegó?», el
   aviso) lo hace CreepAcciones.terminarHab con acHabUi — igual que GM Tools, pero con el mapa a mano: la trampa ✨ y la zona se
   colocan con un clic, como las de un personaje. */
function acMesaHabilidad(sc, h, extra){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  fbDb.collection(fbRutaCampana('tiradas')).add({
    uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: String((sc && sc.nombre) || '').slice(0, 60),
    origen: String((h && h.nombre) || 'Habilidad').slice(0, 80),
    formula: [CreepCalculo.habTextoMesa(h), extra || ''].filter(Boolean).join(' ').slice(0, 300),   // sin el aviso ⚙/✋ para el GM
    rolls: [], mod: 0, total: 0, desde: 'habilidad',
    cuando: firebase.firestore.FieldValue.serverTimestamp(),
  }).catch(err => console.error('No se pudo publicar la habilidad en la Mesa:', err));
}
// «Ataque con mi arma, con arreglos»: se anuncia y va al cuadro del duelo; sin duelo, se tira el PdG suelto.
function acLanzarAtaqueDeHab(sc, h){
  const atq = CreepAcciones.ataqueDeHab(sc, h);
  acParry.delete(sc.id);   // atacar cierra el Parry que esperaba su Bloqueo
  acMesaHabilidad(sc, h);
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible()) acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
  else acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq));
}
// 🪤 Una 💰 con trampa: la coloca sola, oculta, al lado del token del creep (como GM Tools).
async function acColocarTrampaJunto(sc, h){
  try{
    const r = await TokensAuto.colocarTrampas({fichaId: sc.id, tipoToken: 'creep', trampa: Combatiente.trampaDeHab(h, st => CreepCalculo.statValor(sc, st))});   // forma única (P123)
    if(r.colocadas) toast(`🪤 ${r.colocadas === 1 ? 'Trampa colocada' : r.colocadas + ' trampas colocadas'} al lado de ${sc.nombre}, oculta${r.colocadas === 1 ? '' : 's'} a los jugadores`);
    else if(r.motivo === 'sin-token') toast(`${sc.nombre} no tiene token en ese mapa: la trampa no se colocó (ponela a mano con Terreno y Formas → Trampa)`);
    else toast('No hay casilla libre al lado del token para la trampa');
  }catch(err){
    console.error('No se pudo colocar la trampa:', err);
    toast('No se pudo colocar la trampa' + (err.code === 'permission-denied' ? ' (sin permiso)' : ' — ponela a mano'));
  }
}
// 🎯 «¿A quién le pegó?» (h.estadoObjetivo): los tokens del mapa que se está viendo; un creep lo recibe directo, un personaje por
// un aviso que su ficha aplica sola (comun/estados-aplicar.js) — como GM Tools.
var acObjetivoPendiente = null;
function acElegirObjetivoEstado(sc, h){
  const spec = h.estadoObjetivo;
  const toks = [...tokens.entries()].map(([id, t]) => ({id, ...t, nombre: nombreDe(t)}))
    .filter(t => t.fichaId && !String(t.fichaId).includes('~') && !(t.tipo === 'creep' && t.fichaId === sc.id))
    .sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'pj' ? -1 : 1) || String(a.nombre).localeCompare(String(b.nombre), 'es'));
  acObjetivoPendiente = {sc, h, spec, toks};
  ac.raiz.querySelector('#ac-obj-titulo').textContent = `🎯 ¿A quién le pegó ${h.nombre || 'la habilidad'}?`;
  ac.raiz.querySelector('#ac-obj-cuerpo').innerHTML = `<p class="hint" style="margin:0 0 10px">Se le aplica solo: <b>${esc(EstadosAplicar.texto(spec))}</b>. Elegí a quien la recibió; si falló, tocá "Nadie".</p>
    ${toks.length ? toks.map(t => `<button type="button" class="addhab" data-ac-obj="${esc(t.id)}" style="display:block;width:100%;margin:0 0 6px;text-align:left">${t.tipo === 'pj' ? '🧑' : '👹'} ${esc(t.nombre)}${t.oculto ? ' 🙈' : ''}</button>`).join('') : '<div class="hint">No hay otros tokens en el mapa que estás viendo.</div>'}`;
  ac.raiz.querySelector('#ac-objetivo').classList.add('open');
}
async function acAplicarEstadoAObjetivo(pend, tokenId){
  const tok = pend.toks.find(t => t.id === tokenId), spec = pend.spec;
  if(!tok) return;
  try{
    if(tok.tipo === 'creep'){
      const r = await acCambiarCreep(tok.fichaId, c => {
        const x = EstadosAplicar.aplicarACreep(c, spec);
        if(!x.ok) return {error: `${c.nombre}: inmune ahora mismo (${x.motivo}) — no recibió ${spec.nombre}`};
        if(CreepCalculo.modsAfectanHp(x.estado.mods)) CreepCalculo.actualizarHpMaxPorCon(c);
        return {aviso: `🎯 ${c.nombre} recibe ${EstadosAplicar.texto(spec)}`};
      });
      if(r) toast(r.aviso);
      return;
    }
    await EstadosAplicar.encolarPj({fichaId: tok.fichaId, duenoUid: tok.duenoUid, spec, origen: `${pend.sc.nombre}: ${pend.h.nombre || ''}`});
    toast(`🎯 ${tok.nombre} recibe ${EstadosAplicar.texto(spec)} (su ficha lo aplica sola)`);
  }catch(err){
    console.error('No se pudo aplicar el estado:', err);
    toast('No se pudo aplicar el estado' + (err.code === 'permission-denied' ? ' (faltan pegar las reglas nuevas)' : ''));
  }
}
function acHabUi(){
  return {
    mesaHabilidad: (sc, h, extra) => acMesaHabilidad(sc, h, extra),
    mesaConTexto: t => mesaConTexto(t),
    publicar: (sc, t) => acPublicar(sc, t),
    toast: t => toast(t),
    habDuelo: (sc, h) => (typeof Duelo !== 'undefined' && Duelo.disponible()) ? CreepAcciones.habEjecucion(sc, h) : null,
    lanzarAtaque: (sc, h) => acLanzarAtaqueDeHab(sc, h),
    lanzarDuelo: (sc, h, hab) => acElegirObjetivo(sc, {tipo: 'habilidad', hab, alcance: hab.alcance}, () => acPublicar(sc, CreepAcciones.tiradaPrimeraHab(sc, h))),
    // ✨ el GM elige la casilla (los jugadores no se enteran); 💰 al lado del token, como siempre.
    colocarTrampa: (sc, h, auto) => { if(auto){ ac.host.hidden = true; trampaDeHabilidad({fichaId: sc.id, tipoToken: 'creep', nombre: h.nombre, trampa: Combatiente.trampaDeHab(h, st => CreepCalculo.statValor(sc, st))}); } else acColocarTrampaJunto(sc, h); },
    colocarZona: (sc, h) => {
      const z = CreepAcciones.zonaDeHab(sc, h);
      if(!z) return false;
      if(z.tirada) acPublicar(sc, z.tirada);
      ac.host.hidden = true;
      zonaPersistenteDeHabilidad(z.zona);
      return true;
    },
    elegirObjetivo: (sc, h) => acElegirObjetivoEstado(sc, h),
  };
}
// ⚡ Un Flash con el botón, fuera del cuadro del duelo: la misma regla de costo (cooldown y vida, el doble en turno ajeno); se
// anuncia y el bono se suma a mano.
async function acFlashFuera(sc, h){
  const p = await CreepDuelo.pagarFlash(acDueloUi(), sc.id, h.id);
  if(!p) return;
  const f = h.duelo.flash || {};
  acMesaHabilidad(sc, h, `⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
  toast(`${h.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
}
function acEjecutarHab(sc, habId){
  const h = (sc.habilidades || []).find(x => x.id === habId);
  if(!h) return;
  const modo = CreepCalculo.modoHab(h);
  if(modo === 'manual'){ acMesaHabilidad(sc, h); toast(`${h.nombre || 'Habilidad'} anunciada`); return; }   // 📣 solo el texto
  if(modo === 'auto' && Combatiente.tipoEjecucion(h.duelo) === 'flash'){ acFlashFuera(sc, h); return; }   // ⚡ sin No2, cooldown según el turno
  const id = sc.id;
  acCambiar(c => {
    const p = CreepAcciones.ejecutarHab(c, (c.habilidades || []).find(x => x.id === habId), estadosPresetCreep());
    if(!p.error) p.creep = c;   // el creep ya cambiado (con el estado propio, si lo hubo), para lo que sigue
    return p;
  }).then(p => {
    if(!p) return;
    if(p.aviso) toast(p.aviso);
    const sc2 = Object.assign(p.creep, {id}), h2 = (sc2.habilidades || []).find(x => x.id === habId);
    CreepAcciones.terminarHab(sc2, h2, p, acHabUi());
    acDibujar();
  });
}
// Un botón de las Acciones nuevas: se lo pide a GM Tools en el marco (lo carga si hace falta, sin abrir nada).
/* Paso 4c, tanda 6: el Ver de una habilidad del creep, adentro del recuadro (comun/creep-lupa.js, el mismo de GM Tools). */
var acViendo = null;   // "creepId:habId" de lo que muestra el Ver
function acVerHab(sc, ref){
  const h = (sc.habilidades || []).find(x => x.id === ref.split(':')[1]);
  if(!h) return;
  acViendo = ref;
  const v = CreepLupa.verHab(sc, h);
  ac.raiz.querySelector('#ac-ver-titulo').textContent = v.titulo;
  ac.raiz.querySelector('#ac-ver-cuerpo').innerHTML = v.html;
  ac.raiz.querySelector('#ac-ver').classList.add('open');
}
function acDelegar(datos, boton){
  const marco = $('#botonera-marco'), msg = {tipo: 'acciones-delegar', creep: ac.creepId, datos, ...(boton ? {boton} : {})};
  if(botonera.herramienta === 'gm'){
    if(botonera.lista) MensajesMapa.alMarco(marco, msg); else botonera.pendiente = msg;
    return;
  }
  botonera = {herramienta: 'gm', fichaId: ac.creepId, invId: '', lista: false, pendiente: msg, completa: false, precarga: true};
  marco.src = sinCache(`../gm-toolset/gm-tools.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=acciones&precarga=1`);
}
function acCrear(){
  const host = document.createElement('div');
  host.id = 'acciones-nuevas';
  host.hidden = true;
  document.body.appendChild(host);
  const raiz = host.attachShadow({mode: 'open'});
  raiz.innerHTML = `<style id="ac-css"></style><div id="ac-contenido"></div>
    <div class="scrim" id="ac-objetivo"><div class="modal" style="max-width:440px">
      <header><h3 id="ac-obj-titulo">🎯 ¿A quién le pegó?</h3></header>
      <div class="body" id="ac-obj-cuerpo"></div>
      <footer><button class="btn ghost" data-ac-obj="nadie">Nadie (falló)</button></footer>
    </div></div>
    <div class="scrim" id="ac-ver"><div class="modal" style="max-width:420px">
      <header><h3 id="ac-ver-titulo">Habilidad</h3><button class="iconbtn" data-ac-ver="no">Cerrar</button></header>
      <div class="body" id="ac-ver-cuerpo"></div>
      <footer>
        <button class="btn ghost" data-ac-ver="verhab-subir" title="Subir esta habilidad a la biblioteca compartida, con toda su configuración: queda disponible para todos al instante">⬆ Subir</button>
        <button class="btn ghost" data-ac-ver="verhab-reemplazar" title="Cambiar esta habilidad por otra de la biblioteca">↻ Reemplazar</button>
        <button class="btn primary" data-ac-ver="verhab-editar" title="Abrir el editor paso a paso de esta habilidad">✎ Editar</button>
      </footer>
    </div></div>
    <div class="scrim" id="ac-vercreep"><div class="modal" style="max-width:820px">
      <header><h3 id="ac-vercreep-titulo">Creep</h3><button class="iconbtn" data-ac-vc="no">Cerrar</button></header>
      <div class="body" id="ac-vercreep-cuerpo"></div>
      <footer><button class="btn primary" data-ac-vc="editar" title="Abrir la ficha completa del creep en GM Tools (otra pestaña) para cambiar sus números">✎ Editar en GM Tools</button></footer>
    </div></div>
    <div class="scrim" id="ac-tipo-ataque"><div class="modal" style="max-width:360px">
      <header><h3>¿Qué ataque es?</h3><button class="iconbtn" data-ac-tipo="no">Cerrar</button></header>
      <div class="body" id="ac-tipo-lista" style="display:flex;flex-direction:column;gap:9px"></div>
    </div></div>`;
  raiz.querySelector('#ac-tipo-ataque').addEventListener('mousedown', e => { if(e.target.id === 'ac-tipo-ataque') e.target.classList.remove('open'); });
  raiz.querySelector('#ac-ver').addEventListener('mousedown', e => { if(e.target.id === 'ac-ver'){ e.target.classList.remove('open'); acViendo = null; } });
  raiz.querySelector('#ac-objetivo').addEventListener('mousedown', e => { if(e.target.id === 'ac-objetivo'){ e.target.classList.remove('open'); acObjetivoPendiente = null; } });
  raiz.querySelector('#ac-vercreep').addEventListener('mousedown', e => { if(e.target.id === 'ac-vercreep') acVerCreepCerrar(); });
  raiz.addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b || !ac) return;
    if(b.dataset.acCerrar !== undefined){ cerrarAccionesNuevas(); return; }
    if(b.dataset.acObj){
      raiz.querySelector('#ac-objetivo').classList.remove('open');
      const pend = acObjetivoPendiente;
      acObjetivoPendiente = null;
      if(pend && b.dataset.acObj !== 'nadie') acAplicarEstadoAObjetivo(pend, b.dataset.acObj);
      return;
    }
    if(b.dataset.acVer){
      raiz.querySelector('#ac-ver').classList.remove('open');
      const v = acViendo;
      acViendo = null;
      // ✎ Editar: el editor común, acá (A6c). Subir y Reemplazar todavía los hace GM Tools en el marco (abre el Ver y toca el botón).
      if(v && b.dataset.acVer === 'verhab-editar'){ const [cid, hid] = v.split(':'); acEditarHab(cid, hid); }
      else if(v && b.dataset.acVer !== 'no') acDelegar({verhabaccion: v}, b.dataset.acVer);
      return;
    }
    if(b.dataset.acVc){
      const id = ac.creepId;
      acVerCreepCerrar();
      if(b.dataset.acVc === 'editar') window.open('../gm-toolset/gm-tools.html?partida=' + encodeURIComponent(FB_CAMPANA) + '&editar=' + encodeURIComponent(id), '_blank', 'noopener');
      return;
    }
    if(b.dataset.acTipo){
      raiz.querySelector('#ac-tipo-ataque').classList.remove('open');
      if(b.dataset.acTipo !== 'no') acAtacar(b.dataset.acTipo);
      return;
    }
    if(acAccionAca(b)) return;
    const datos = {...b.dataset};
    if(!Object.keys(datos).length) return;
    acDelegar(datos);
  });
  // Clic en el fondo: se cierra (e.target acá es siempre el recuadro: se mira el primer elemento real, como en la Botonera nueva).
  host.addEventListener('mousedown', e => { const t = e.composedPath()[0]; if(t === host || (t && t.id === 'ac-contenido')) cerrarAccionesNuevas(); });
  return {host, raiz};
}
async function abrirAccionesNuevas(creepId){
  if(ac && ac.creepId === creepId && !ac.host.hidden){ cerrarAccionesNuevas(); return; }   // B (o el token) otra vez: se cierra
  try{ await acCargarPiezas(); }catch(err){ console.error(err); toast('No se pudieron cargar las Acciones nuevas — se abren las de siempre'); abrirAcciones(creepId, null, true); return; }
  if(!ac) ac = Object.assign({creepId: ''}, acCrear());
  const lupaCss = (document.getElementById('lupa-css') || {}).textContent || '';   // los 🔍 (comun/lupa.js)
  ac.raiz.querySelector('#ac-css').textContent = acCss + lupaCss + PANEL_CSS + ' #ac-contenido{font-family:"Space Grotesk",system-ui,sans-serif;font-size:14px;line-height:1.45;color:var(--paper)}';
  ac.creepId = creepId;
  if(bn && !bn.host.hidden) cerrarBotoneraNueva();
  ac.host.hidden = false;
  acUbicar();
  centrarTokenDeBotonera('gm', creepId);
  acDibujar();
}
function cerrarAccionesNuevas(){
  if(!ac) return;
  ac.host.hidden = true;
  ac.raiz.querySelector('#ac-vercreep').classList.remove('open');
  ac.soloVer = false;
}
/* ---------- ✎ El editor de una habilidad de creep, hecho por el mapa (2026-10-02, hoja de ruta A6c, docs/plan-a6c-editor-creeps.md) ----------
   El ✎ Editar del Ver de una habilidad se lo pedía a GM Tools escondido. Ahora es el editor común (comun/creep-editor.js: el mismo paso
   a paso, con la trampa y la Ejecución ✨), adentro del recuadro de las Acciones nuevas; guarda con modificarCreep (acCambiarCreep). Los
   estados para la Ejecución, con el selector común (los "Mis presets" del GM no están en la partida: ver pendientes 7b). */
const ACE_PIEZAS = ['../comun/creep-editor.js?v=20261002a', '../comun/asistente-duelo-hab.js?v=20261002i'];
async function acEditarHab(creepId, habId){
  try{ await acCargarPiezas(); await cargarPiezas(SE_PIEZAS); await cargarPiezas(ACE_PIEZAS); }
  catch(err){ console.error(err); toast('No se pudo abrir el editor'); return; }
  if(!ac.editor){
    ac.editor = CreepEditor.crear(ac.raiz, {
      creep: id => { const crudo = creepPrivadoDe(id); if(!crudo) return null; const sc = CreepCalculo.normalizar(structuredClone(crudo)); sc.id = id; return sc; },
      guardarHab: (id, aplicar) => acCambiarCreep(id, sc => { aplicar(sc); return {}; }),
      personalizados: () => [],
      elegirEstadoDuelo: async () => {
        const sc0 = creepPrivadoDe(ac.creepId);
        const r = await SelectorEstados.abrir({
          titulo: 'Estado alterado', para: (sc0 && sc0.nombre) || '', presets: estadosPresetCreep(), propios: [],
          cfgPreguntas: {hp: 'hpTurno', statLabel: id => (SE_STATS_CREEP[id] && SE_STATS_CREEP[id][0]) || id},
          stats: Object.entries(SE_STATS_CREEP).map(([id, [label, full]]) => ({id, label, full})),
          armarDeAsistente: res => ({nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpTurno: res.hp, stacksTurno: 0,
            escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, ...res.flags, ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})}),
        });
        if(!r) return null;
        const pr = r.preset;
        return {modo: 'preset', nombre: pr.nombre, turnos: pr.turnos, permanente: !!pr.permanente, hp: num(pr.hpTurno), mods: pr.mods, stacks: pr.stacks, escudoMagico: num(pr.escudoMagico), polaridad: pr.polaridad, detalle: pr.detalle};
      },
      toast: m => toast(m),
    }, {id: 'scrim-hab-creep'});
    // Sus botones son solo suyos: que no los atienda también el manejador general del recuadro.
    ['click', 'change', 'input'].forEach(ev => ac.editor.scrim.addEventListener(ev, e => e.stopPropagation()));
  }
  ac.editor.abrir(creepId, habId);
}
/* ---------- 🔍 Ver todo de un creep, hecho por el mapa (2026-10-02, hoja de ruta A6a) ----------
   El 🔍 Ver todo de la ficha lite abría la ventana «Ver» de GM Tools escondido en el marco. Ahora la muestra el mapa adentro del
   recuadro de las Acciones nuevas, con comun/creep-lupa.js (verCreep: el mismo dibujo que GM Tools), y se redibuja con cada cambio
   del creep (acDibujar). Si las Acciones no estaban a la vista, se abren solo para esto (ac.soloVer: al cerrar el Ver se cierran).
   ✎ Editar abre GM Tools en otra pestaña (el editor del creep pasa al mapa en la A6c). */
async function abrirVerCreepMapa(creepId){
  const yaVisible = ac && !ac.host.hidden && ac.creepId === creepId;
  if(!yaVisible) await abrirAccionesNuevas(creepId);
  if(!ac || ac.host.hidden || ac.creepId !== creepId) return;
  ac.soloVer = !yaVisible;
  ac.raiz.querySelector('#ac-vercreep').classList.add('open');
  acVerCreepDibujar();
}
function acVerCreepDibujar(){
  if(!ac || !ac.raiz.querySelector('#ac-vercreep').classList.contains('open')) return;
  const sc = acCreep();
  if(!sc){ ac.raiz.querySelector('#ac-vercreep-cuerpo').innerHTML = '<div class="hint">Cargando el creep…</div>'; return; }
  if(!sc.imagen){ const pub = creepsPub.get(ac.creepId); sc.imagen = pub && (pub.tarjeta || pub.miniatura) || ''; }   // la foto completa es privada del GM: la tarjeta pública alcanza
  const v = CreepLupa.verCreep(sc);
  ac.raiz.querySelector('#ac-vercreep-titulo').textContent = v.titulo;
  ac.raiz.querySelector('#ac-vercreep-cuerpo').innerHTML = v.html;
}
function acVerCreepCerrar(){
  if(!ac) return;
  ac.raiz.querySelector('#ac-vercreep').classList.remove('open');
  if(ac.soloVer){ ac.soloVer = false; cerrarAccionesNuevas(); }
}
document.addEventListener('keydown', e => {
  if(!ac || ac.host.hidden || !$('#botonera-capa').hidden || elegirDestinoCb) return;
  if(e.key !== 'Escape') return;
  e.preventDefault();
  const abiertos = [...ac.raiz.querySelectorAll('.scrim.open')], cartel = abiertos[abiertos.length - 1];   // el de más arriba
  if(cartel && ac.editor && cartel === ac.editor.scrim){ ac.editor.cerrar(); return; }
  if(cartel && cartel.id === 'ac-vercreep'){ acVerCreepCerrar(); return; }
  if(cartel){ cartel.classList.remove('open'); acObjetivoPendiente = null; return; }
  cerrarAccionesNuevas();
});

/* Batalla terminada: cuando el GM confirma el fin del combate, a cada jugador se le abre solo la ventana (la de la ficha, en el iframe de la
   Botonera, a pantalla casi completa) con lo que recibe cada uno y los despojos para elegir. El botón 🎁 del borde izquierdo (para todos, junto
   a 🎭 y 🎲) la vuelve a abrir mientras haya botín publicado; con el botín cerrado, se apaga. Solo reacciona a un combate NUEVO (`numero`),
   no al que ya estaba al entrar. Lo lee de campanas/<id>/combate/actual. */
let combateMapa = null, combatePrimero = true, combateNumeroVisto = null, combateTimer = null;
const combatePublicado = () => !!(combateMapa && combateMapa.estado === 'publicado');
function actualizarBotonDespojosMapa(){
  const b = $('#toolkit-botin');
  if(!b) return;
  b.disabled = !combatePublicado();
  b.title = combatePublicado() ? (soyGM ? 'Despojos: ver qué tomó cada uno y convertir en despojos lo que nadie tomó' : 'Despojos: abrir la ventana de la batalla para elegir del botín') : 'Despojos: se habilita cuando el GM publica el botín de un combate';
}
function abrirBatallaDeJugador(){
  const fichaId = fichaPrincipalId();
  if(!fichaId){ toast('🎁 Hay botín del combate, pero no tenés un personaje para tomarlo'); return; }
  abrirBotinMapa(fichaId);   // el mapa (js/11, A5)
}
function escucharBotinParaJugador(){
  if(!fbUsuario) return;
  fbDb.doc(fbRutaCampana('combate/actual')).onSnapshot(snap => {
    const d = snap.exists ? snap.data() : null;
    const nuevo = !combatePrimero && !!d && d.numero !== combateNumeroVisto;
    const cerrada = combatePublicado() && d && d.estado !== 'publicado';
    combatePrimero = false;
    combateMapa = d;
    if(d) combateNumeroVisto = d.numero;
    actualizarBotonDespojosMapa();
    $('#toolkit-botin').classList.toggle('pendiente', combatePublicado());
    if(!soyGM && nuevo){
      clearTimeout(combateTimer);
      combateTimer = setTimeout(() => { toast('⚔ Batalla terminada'); abrirBatallaDeJugador(); }, 600);
    }
    if(cerrada && bnBotinCombateCerrado()) toast('El GM cerró el botín: lo que nadie tomó se convirtió en despojos');
    else if(cerrada && botonera.completa && !$('#botonera-capa').hidden){ cerrarBotonera(); toast('El GM cerró el botín: lo que nadie tomó se convirtió en despojos'); }
    if(typeof bnBotinDibujar === 'function') bnBotinDibujar();
    if(soyGM) vgCombateCambio();   // la ventana del botín del GM (js/18)
  }, err => console.error('Error escuchando el fin del combate:', err));
}
// 🏪 Tienda (2026-09-24, pedido del dueño): abre la tienda que publicó el GM, sin salir del mapa, en la ventana de la ficha del
// personaje principal (mismo iframe que la Botonera y el botín). Solo con la tienda abierta.
$('#toolkit-tienda').onclick = async () => {
  if(soyGM){ window.open('../gm-toolset/vendor-generator.html?partida=' + encodeURIComponent(FB_CAMPANA), '_blank', 'noopener'); return; }   // el GM arma y abre la tienda en el generador
  const fichaId = fichaPrincipalId();
  if(!fichaId){ toast('Para usar la tienda necesitás un personaje'); return; }
  abrirTiendaMapa(fichaId);   // el mapa (js/11, A5): mira si está abierta y la muestra
};
$('#toolkit-botin').onclick = () => {
  if(!combatePublicado()) return;
  if(soyGM) abrirBotinGMMapa(); else abrirBatallaDeJugador();   // el GM: el mapa (js/18, A6a)
};

/* GM Tools adentro del mapa: el reporte de fin de combate (modo=finalizar) y el botín para despojar (modo=botin). */
function abrirModoGM(modo){
  const capa = $('#botonera-capa');
  const marco = $('#botonera-marco');
  capa.hidden = false;
  botonera = {herramienta: 'gm', fichaId: '', lista: false, pendiente: null, completa: true};
  ubicarBotoneraCapa();
  $('#botonera-cargando-texto').textContent = modo === 'finalizar' ? 'Abriendo el reporte del combate…' : 'Abriendo el botín…';
  $('#botonera-cargando').hidden = false;
  marco.src = sinCache(`../gm-toolset/gm-tools.html?partida=${encodeURIComponent(FB_CAMPANA)}&modo=${modo}`);
}
$('#btn-finalizar-mapa').onclick = () => abrirFinalizarMapa();   // el mapa (js/18, A6a); abrirModoGM quedó sin uso (limpieza A′)

/* Tokens automáticos (comun/tokens-auto.js): uno por creep de un grupo, o uno por personaje de jugador. */
function centroDeLaVista(){
  const w = pantallaAMundo(anchoPx / 2, altoPx / 2);
  return mundoAHex(w.x, w.y);
}
