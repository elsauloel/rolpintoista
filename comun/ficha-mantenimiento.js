/* =========================================================
   FICHA-MANTENIMIENTO — el ⟳ Mantenimiento de un personaje (y de sus invocaciones), fuera de la ficha (2026-10-02, hoja de ruta
   A2 de docs/pendientes.md: que el mapa lo haga sin cargar la ficha escondida)
   Lo que antes era mantenimiento() de ficha-personaje/js/11 y la transacción de mantenimientoRevisar (js/14), copiado tal cual:
   - aplicar(S, ui): un pase de turno sobre el personaje `S` — SP Regen al principio, los estados (Combatiente.pasarTurnoEstados),
     la regeneración de las pasivas, la vida (por ui.fijarHp, para que el Ankh se active antes de contar los turnos de muerte), los
     turnos de Inconsciente, No2 a full, ataques del turno a 0 y las invocaciones (No2, cooldowns, estados, se duermen al llegar su
     cooldown a 0). Deja S.turno + 1 y S.log (HTML, lo que muestra la ficha). Devuelve {rep (líneas para la Mesa), avisos (estados
     con pop-up), spRegen, spRecuperado}.
     ui = {fijarHp(v) (pone la vida y revisa Ankh y muerte, con lo que muestre cada pantalla), muerte() (opcional: redibujar el
     cartel de muerte), limpiarParry() (opcional: el Parry pendiente de cada pantalla)}.
   - reclamar(db, rutaFicha, objetivo, marca): la transacción sobre fichas/<id>/partes/mantenimiento — cuántos turnos le toca
     aplicar a ESTA pantalla (0 si ya los aplicó otra; una ficha que nunca registró número arranca desde el actual), máximo 10.
   - publicarReporte(titulo, lineas, quien) y publicarRecordatorios(avisos, quien): a la Mesa (necesitan las globals de sesion.js).
   Necesita comun/combatiente.js, ficha-calculo.js, ficha-botonera.js e inv-calculo.js.
   ========================================================= */
const FichaMantenimiento = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const MAX_SEGUIDOS = 10;

  // SP Regen: lo que recupera (sin pasar del máximo). Por defecto la mitad del Especial, más lo que sumen habilidades, equipo o estados.
  function regenerarSp(S, c, rep){
    const spRegen = Math.max(0, Number.isNaN(c.final.spregen) ? 0 : Math.floor(c.final.spregen));
    const spRecuperado = Math.min(spRegen, Math.max(0, num(S.spGastado)));
    if(spRecuperado){ S.spGastado = num(S.spGastado) - spRecuperado; rep.push(`SP: +${fmt(spRecuperado)} (SP Regen)`); }
    return {spRegen, spRecuperado};
  }
  // Pasivas de regeneración: recuperan HP en cada turno (por compra).
  function regenPasivas(S, log, rep){
    let hp = 0;
    (S.pasivas || []).forEach(p => {
      const x = num(p.regenHp) * FichaCalculo.pasivaCompras(p);
      if(x > 0 && num(S.hp) > 0){ hp += x; log.push(`<b>${esc(p.nombre)}</b> <span class="heal">+${fmt(x)} HP</span>`); rep.push(`${p.nombre} (pasiva): +${fmt(x)} HP`); }
    });
    return hp;
  }
  // La vida por fijarHp (para que el veneno que te deja en 0 active el Ankh antes de contar los turnos de muerte) y el reporte.
  function aplicarVida(S, ui, hpDelta, hpAntes, rep){
    if(!hpDelta) return;
    ui.fijarHp(num(S.hp) + hpDelta);
    rep.push(num(S.hp) !== hpAntes ? `HP total: ${fmt(hpAntes)} → ${fmt(num(S.hp))}` : `HP total: sigue en ${fmt(hpAntes)}`);
  }
  // Inconsciente: un turno menos para morir.
  function contarMuerte(S, ui, log, rep){
    if(!(S.muerto && S.muerto.activo && !S.muerto.definitivo && num(S.hp) <= 0)) return;
    S.muerto.turnos = Math.max(0, num(S.muerto.turnos) - 1);
    if(S.muerto.turnos === 0){
      S.muerto.definitivo = true;
      log.push(`<span class="gone">TE HAS MORIDO BIEN MUERTO Y YA NO HAY VUELTA ATR&Aacute;S</span>`);
      rep.push('Murió: ya no hay vuelta atrás');
    }else{
      log.push(`Inconsciente: morís en <b>${fmt(S.muerto.turnos)}</b> turno(s)`);
      rep.push(`Inconsciente: muere en ${fmt(S.muerto.turnos)} turno${S.muerto.turnos === 1 ? '' : 's'}`);
    }
    if(ui.muerte) ui.muerte();
  }
  const camposInv = inv => ({hp: 'hpturno', stacks: 'stacksturno', resFuego: num(InvCalculo.statValor(inv, 'resfuego'))});
  // Lo de una invocación al empezar su vuelta: No2, ataques, cooldowns, lo que se dispara y la cuenta para dormirse. → líneas.
  function invInicio(inv){
    InvCalculo.migrar(inv);
    if(inv.activa === false) return [];
    inv.nitros = Combatiente.recargarNo2(InvCalculo.nitrosMax(inv), inv.nitros);
    inv.ataquesTurno = 0;
    inv.golpeTurno = 0;   // la Defensa contra el primer golpe vuelve a valer
    inv.habilidades.forEach(h => { if(num(h.cdActual) > 0) h.cdActual = Math.max(0, num(h.cdActual) - 1); });
    const d = Combatiente.dispararEstados(inv.estados, camposInv(inv));
    const rep = Combatiente.reporteTurno(d.eventos);
    if(d.hp){ const antes = num(inv.hp); inv.hp = Math.max(0, Math.min(num(inv.hpMax) || Infinity, antes + d.hp)); rep.push(`HP total: ${fmt(antes)} → ${fmt(inv.hp)}`); }
    if(num(inv.cooldown) > 0){
      inv.cooldownActual = Math.max(0, num(inv.cooldownActual) - 1);
      if(inv.cooldownActual === 0){ inv.activa = false; rep.push('Se duerme: llegó su cooldown a 0'); }
    }
    return rep;
  }
  function invFin(inv){
    const k = Combatiente.contarEstados(inv.estados, camposInv(inv));
    inv.estados = k.quedan;
    return Combatiente.reporteTurno(k.eventos);
  }

  /* ⟳ Mantenimiento de la ronda (fuera de combate, o para quien no está en el orden de turnos): un pase de turno sobre el personaje `S`.
     Con turno propio reciente (en combate) no hace nada —ni toca la ficha: así no pisa lo que escribió su turno—: lo hace su turno
     (inicioTurno / finTurno). `numero` = el número de ese Mantenimiento (sin él, se aplica siempre, como antes). */
  function aplicar(S, ui, numero){
    const turnoAntes = num(S.turno || 1);
    if(numero !== undefined && !Combatiente.estadosEnMantenimiento(S.finTurnoEn, numero))
      return {rep: [], avisos: [], spRegen: 0, spRecuperado: 0, enTurno: true};
    const c = FichaCalculo.calcular(S);
    const log = [], rep = [];
    const hpAntes = num(S.hp);
    // SP Regen AL PRINCIPIO, con los números de antes de que venza o cambie ningún estado.
    const {spRegen, spRecuperado} = regenerarSp(S, c, rep);
    // Lo que hacen los estados (escudo, daño/cura con inmunidades, stacks, turnos): la regla común de comun/combatiente.js.
    const turnoEst = Combatiente.pasarTurnoEstados(S.efectos, {hp: 'hpturno', stacks: 'stacksturno', resFuego: num(c.final.resfuego)});
    Combatiente.reporteTurno(turnoEst.eventos).forEach(l => { rep.push(l); log.push(esc(l)); });
    const hpDelta = turnoEst.hp + regenPasivas(S, log, rep);
    aplicarVida(S, ui, hpDelta, hpAntes, rep);
    contarMuerte(S, ui, log, rep);
    // Los estados que se terminaron se sacan por identidad (fijarHp pudo tocar la lista, por ejemplo el Ankh).
    if(turnoEst.terminados.length){ const finS = new Set(turnoEst.terminados); S.efectos = S.efectos.filter(e => !finS.has(e)); }
    S.turno = turnoAntes + 1;
    if(ui.limpiarParry) ui.limpiarParry();
    // Nitros al máximo y el primer ataque vuelve a costar la mitad (el SP ya se regeneró al principio).
    S.nitros = Combatiente.recargarNo2(FichaBotonera.nitrosMaximo(S), S.nitros);   // la deuda de una defensa sin No2 se descuenta acá
    S.ataquesTurno = 0;
    S.ataquesArma = {};
    let invocacionesVencidas = 0;
    (S.invocaciones || []).forEach(inv => {
      if(inv.activa === false) return;
      if(numero !== undefined && !Combatiente.estadosEnMantenimiento(inv.finTurnoEn, numero)) return;   // tiene turno propio en el orden: lo hace su turno
      const r1 = invInicio(inv);
      invFin(inv);
      if(r1.includes('Se duerme: llegó su cooldown a 0')) invocacionesVencidas++;
    });
    if(invocacionesVencidas) log.push(`${invocacionesVencidas} invocación(es) quedaron dormidas al llegar el cooldown a 0.`);
    log.unshift(`<b style="color:var(--brass)">Turno ${S.turno}</b>`);
    log.push(`Nitros recargados a ${fmt(num(S.nitros))}.` + (spRegen ? ` SP ${spRecuperado ? `<span class="heal">+${fmt(spRecuperado)}</span>` : '+0'} (SP Regen ${fmt(spRegen)}${spRegen && !spRecuperado ? ', ya estaba lleno' : ''}).` : ''));
    S.log = log;
    const avisos = (S.efectos || []).filter(e => e.popup && e.activo !== false);
    return {rep, avisos, spRegen, spRecuperado};
  }

  /* El TURNO PROPIO de un personaje (o de una invocación suya, `invId`) en el orden de turnos (2026-10-06, P161, turno completo).
     `clave` = «mapa:paso:…» de ese turno: si ya se aplicó (otra pantalla, doble clic), no hace nada → null. `conTurno` = ids de sus
     invocaciones que tienen turno propio en el orden; las demás van con el personaje. `numero` = el Mantenimiento en curso (para que el ⟳
     de la ronda sepa que ya lo atiende su turno). ui = {fijarHp(v), muerte?(), limpiarParry?()}.
     inicioTurno → {rep, nombre, avisos}: SP Regen, lo que se dispara, pasivas, vida, turnos de muerte, No2 al máximo, ataques a 0.
     finTurno → {rep, nombre}: baja el contador de sus estados. */
  function inicioTurno(S, ui, clave, invId, conTurno, numero){
    const turno = num(numero), sin = new Set(conTurno || []);
    if(invId){
      const inv = (S.invocaciones || []).find(i => i && i.id === invId);
      if(!inv || inv.inicioTurnoClave === clave) return null;
      inv.inicioTurnoClave = clave; inv.finTurnoEn = turno;
      return {rep: invInicio(inv), nombre: inv.nombre || 'Invocación', avisos: []};
    }
    if(S.inicioTurnoClave === clave) return null;
    S.inicioTurnoClave = clave; S.finTurnoEn = turno;
    const c = FichaCalculo.calcular(S);
    const log = [], rep = [], hpAntes = num(S.hp);
    regenerarSp(S, c, rep);
    // Meditar (pies, 2026-10-06): si no se movió desde que empezó su turno anterior, recupera SP (el mapa anota `movidoPaso` al cobrar el movimiento).
    const paso = Number(String(clave || '').split(':')[1]);
    if(num(c.final.meditar) > 0 && S.inicioPaso !== undefined && !(num(S.movidoPaso) >= num(S.inicioPaso))){
      const m = Math.min(num(c.final.meditar), Math.max(0, num(S.spGastado)));
      if(m){ S.spGastado = num(S.spGastado) - m; rep.push(`SP: +${fmt(m)} (Meditar: no se movió)`); }
    }
    if(Number.isFinite(paso)) S.inicioPaso = paso;
    const d = Combatiente.dispararEstados(S.efectos, {hp: 'hpturno', stacks: 'stacksturno', resFuego: num(c.final.resfuego)});
    rep.push(...Combatiente.reporteTurno(d.eventos));
    aplicarVida(S, ui, d.hp + regenPasivas(S, log, rep), hpAntes, rep);
    contarMuerte(S, ui, log, rep);
    if(ui.limpiarParry) ui.limpiarParry();
    const deudaAntes = num(S.nitros);
    S.nitros = Combatiente.recargarNo2(FichaBotonera.nitrosMaximo(S), S.nitros);   // la deuda de una defensa sin No2 se descuenta acá
    S.ataquesTurno = 0;
    S.ataquesArma = {};
    rep.push(`No2 recargados a ${fmt(num(S.nitros))}${num(S.nitros) < FichaBotonera.nitrosMaximo(S) && deudaAntes < 0 ? ` (se descontó la deuda de ${fmt(-deudaAntes)})` : ''}`);
    (S.invocaciones || []).forEach(inv => { if(inv && inv.activa !== false && !sin.has(inv.id)){ inv.finTurnoEn = turno; invInicio(inv).forEach(l => rep.push(`${inv.nombre}: ${l}`)); } });
    return {rep, nombre: ((S.meta && S.meta.nombre) || '').trim(), avisos: (S.efectos || []).filter(e => e.popup && e.activo !== false)};
  }
  function finTurno(S, ui, clave, invId, conTurno, numero){
    const turno = num(numero), sin = new Set(conTurno || []);
    if(invId){
      const inv = (S.invocaciones || []).find(i => i && i.id === invId);
      if(!inv || inv.finTurnoClave === clave) return null;
      inv.finTurnoClave = clave; inv.finTurnoEn = turno;
      return {rep: invFin(inv), nombre: inv.nombre || 'Invocación'};
    }
    if(S.finTurnoClave === clave) return null;
    S.finTurnoClave = clave; S.finTurnoEn = turno;
    const c = FichaCalculo.calcular(S);
    const k = Combatiente.contarEstados(S.efectos, {hp: 'hpturno', stacks: 'stacksturno', resFuego: num(c.final.resfuego)});
    const rep = Combatiente.reporteTurno(k.eventos);
    if(k.terminados.length){ const finS = new Set(k.terminados); S.efectos = S.efectos.filter(e => !finS.has(e)); }
    (S.invocaciones || []).forEach(inv => { if(inv && inv.activa !== false && !sin.has(inv.id)){ inv.finTurnoEn = turno; invFin(inv).forEach(l => rep.push(`${inv.nombre}: ${l}`)); } });
    return {rep, nombre: ((S.meta && S.meta.nombre) || '').trim()};
  }

  // Cuántos turnos le toca aplicar a esta pantalla (la toma en una transacción: si hay varias, solo una los aplica).
  async function reclamar(db, rutaFicha, objetivo, marca){
    const ref = db.doc(`${rutaFicha}/partes/mantenimiento`);
    return db.runTransaction(async tx => {
      const doc = await tx.get(ref);
      let hecho = null;
      if(doc.exists){ try{ hecho = Math.round(num(JSON.parse(doc.data().json))); }catch(e){} }
      if(hecho !== null && hecho >= objetivo) return 0;
      tx.set(ref, {json: JSON.stringify(objetivo), actualizado: marca()});
      return hecho === null ? 0 : Math.min(MAX_SEGUIDOS, objetivo - hecho);
    });
  }

  const hayMesa = () => typeof fbDb !== 'undefined' && fbDb && typeof fbUsuario !== 'undefined' && fbUsuario && typeof fbMiembro !== 'undefined' && fbMiembro;
  function publicarReporte(titulo, lineas, quien){
    if(!lineas || !lineas.length || !hayMesa()) return;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: quien || '',
      origen: String(titulo || '').slice(0, 60), formula: lineas.join('\n').slice(0, 900),
      rolls: [], mod: 0, total: 0, desde: 'reporte',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar el reporte del Mantenimiento:', err));
  }
  function publicarRecordatorios(avisos, quien){
    if(!avisos || !avisos.length || !hayMesa()) return;
    avisos.slice(0, 5).forEach(e => {
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: quien || '',
        origen: String(e.nombre || 'Estado').slice(0, 80), formula: String(e.detalle || '').slice(0, 240),
        rolls: [], mod: 0, total: 0, desde: 'recordatorio',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudo publicar el recordatorio:', err));
    });
  }

  return {MAX_SEGUIDOS, aplicar, inicioTurno, finTurno, reclamar, publicarReporte, publicarRecordatorios};
})();
