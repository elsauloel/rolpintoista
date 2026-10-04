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

  function aplicar(S, ui){
    const c = FichaCalculo.calcular(S);
    const log = [];
    let hpDelta = 0;
    // Reporte para la Mesa (2026-09-24): lo que le pasó a este personaje en el pase de turno, en texto llano y con el antes y el
    // después, para que todos vean si el veneno bajó, si la regeneración curó, etc.
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
    const turnoEst = Combatiente.pasarTurnoEstados(S.efectos, {hp: 'hpturno', stacks: 'stacksturno', resFuego: num(c.final.resfuego)});
    hpDelta += turnoEst.hp;
    Combatiente.reporteTurno(turnoEst.eventos).forEach(l => { rep.push(l); log.push(esc(l)); });

    // Pasivas de regeneración: recuperan HP en cada Mantenimiento (por compra).
    (S.pasivas || []).forEach(p => {
      const hp = num(p.regenHp) * FichaCalculo.pasivaCompras(p);
      if(hp > 0 && num(S.hp) > 0){
        hpDelta += hp;
        log.push(`<b>${esc(p.nombre)}</b> <span class="heal">+${fmt(hp)} HP</span>`);
        rep.push(`${p.nombre} (pasiva): +${fmt(hp)} HP`);
      }
    });

    if(hpDelta){
      // Pasa por fijarHp para que el veneno que te deja en 0 active el Ankh
      // antes de que se descuenten los turnos de muerte, más abajo.
      ui.fijarHp(num(S.hp) + hpDelta);
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
      if(ui.muerte) ui.muerte();
    }

    // Los estados que se terminaron se sacan por identidad (fijarHp pudo tocar la lista, por ejemplo el Ankh).
    if(turnoEst.terminados.length){
      const fin = new Set(turnoEst.terminados);
      S.efectos = S.efectos.filter(e => !fin.has(e));
    }

    S.turno = (S.turno || 1) + 1;
    if(ui.limpiarParry) ui.limpiarParry();
    // Nitros se recargan al máximo y el primer ataque vuelve a costar la
    // mitad (el SP ya se regeneró al principio del Mantenimiento, ver arriba).
    S.nitros = FichaBotonera.nitrosMaximo(S);
    S.ataquesTurno = 0;
    S.ataquesArma = {};

    let invocacionesVencidas = 0;
    (S.invocaciones || []).forEach(inv => {
      InvCalculo.migrar(inv);
      if(inv.activa === false) return; // ya dormida, no se sigue procesando
      // Nitros se recargan al máximo, igual que el propio personaje.
      inv.nitros = InvCalculo.nitrosMax(inv);
      inv.ataquesTurno = 0;
      inv.habilidades.forEach(h => { if(num(h.cdActual) > 0) h.cdActual = Math.max(0, num(h.cdActual) - 1); });
      // Estados alterados de la invocación: la MISMA regla que el personaje y los creeps (comun/combatiente.js).
      const turnoInv = Combatiente.pasarTurnoEstados(inv.estados, {hp: 'hpturno', stacks: 'stacksturno', resFuego: num(InvCalculo.statValor(inv, 'resfuego'))});
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
    const avisos = (S.efectos || []).filter(e => e.popup && e.activo !== false);
    return {rep, avisos, spRegen, spRecuperado};
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

  return {MAX_SEGUIDOS, aplicar, reclamar, publicarReporte, publicarRecordatorios};
})();
