/* =========================================================
   ESTADOS SOBRE OTROS (compartido: gm-tools, mapa, ficha)
   Una habilidad de creep, o una trampa, puede dejar un estado alterado a quien golpea o a quien la pisa
   (Veneno, Sangrado, Stun, Inmovilizado, o uno propio con bonos/penalizaciones: "−2 de Daño 3 turnos"). Acá vive:
   - `componer(spec)`: arma el estado en la forma de un creep (los mismos presets de gm-tools).
   - `aplicarACreep(sc, spec)`: lo pone en un creep (respeta Invulnerable, Inmunidad a CC, Sangre pura…).
   - `encolarPj({fichaId, duenoUid, spec, origen})`: para un personaje NO se escribe en su ficha desde afuera: se deja un
     aviso en campanas/<id>/estados y la ficha del dueño lo aplica sola, una vez (mismo mecanismo que las recompensas).
   spec = {nombre, turnos?, mods?: [{stat, val}], hp?, detalle?, polaridad?}. Si el nombre es el de un preset de
   `comun/estados-presets.js` (Veneno, Sangrado, Stun, Escudo especial…) se usa ese preset con sus marcas; si no, es
   un estado propio con lo que traiga la spec.
   Aplicar sobre el rival sigue pasando por una decisión del GM (elegir a quién le pegó) o por una trampa que alguien pisó.
   ========================================================= */
const EstadosAplicar = (() => {
  const id = () => Math.random().toString(36).slice(2, 9);
  // Los presets salen de la lista única de `comun/estados-presets.js` (se carga antes que este archivo), en la forma
  // de un creep. DEBUFFS son los que se le ponen a un rival (habilidades de creep, trampas, zonas); BUFFS, los que se da
  // uno mismo o a un aliado desde el paso «Efectos» de la Ejecución (Escudo especial, Barrera, Invulnerable…).
  // `escudoMagico` es el mismo campo que entiende el resto del juego (HUD del mapa, chip de la ficha): una barra
  // secundaria que absorbe daño antes que el HP real.
  const TODOS = typeof estadosPresetCreep === 'function' ? estadosPresetCreep() : [];
  const DEBUFFS = TODOS.filter(p => p.polaridad === 'debuff');
  const BUFFS = TODOS.filter(p => p.polaridad === 'buff');
  const presetPorNombre = nombre => TODOS.find(p => p.nombre === nombre || (p.alias || []).includes(nombre));

  function limpiarSpec(spec){
    const s = spec || {};
    const out = {nombre: String(s.nombre || 'Estado').slice(0, 40)};
    if(s.turnos !== undefined && s.turnos !== null) out.turnos = Math.max(0, Math.round(Number(s.turnos) || 0));
    if(Array.isArray(s.mods)) out.mods = s.mods.filter(m => m && m.stat).map(m => ({stat: String(m.stat), val: Number(m.val) || 0})).slice(0, 8);
    if(s.hp) out.hp = Math.round(Number(s.hp) || 0);
    if(s.detalle) out.detalle = String(s.detalle).slice(0, 200);
    if(s.polaridad) out.polaridad = s.polaridad;
    if(s.item) out.item = String(s.item).slice(0, 64);   // el ítem al que se le da el desgaste (nombre: 'Desgaste')
    if(s.stacks) out.stacks = Math.max(1, Math.min(20, Math.round(Number(s.stacks) || 1)));
    // Escudo especial (2026-09-28): HP de una barra secundaria que absorbe daño antes que el HP real —
    // ver BUFFS. Un valor explícito manda sobre el del preset (se resuelve en `componer`).
    if(s.escudoMagico) out.escudoMagico = Math.max(0, Math.round(Number(s.escudoMagico) || 0));
    if(s.sentadoEnCero) out.sentadoEnCero = true;
    if(s.estado) out.estado = String(s.estado).slice(0, 40);   // «Acortar estado» (Recuperarse rápido, 2026-10-04): a cuál le saca turnos   // «Pierde No2» (Sonic Boom): si llega a 0, queda Sentado
    if(s.soltar && Combatiente.soltarNorm(s.soltar)) out.soltar = Combatiente.soltarNorm(s.soltar);   // cómo se suelta (trampas de Atrapar)
    return out;
  }
  const esPreset = nombre => !!presetPorNombre(nombre);

  // Estado en la forma de un creep.
  function componer(spec){
    const s = limpiarSpec(spec);
    const p = presetPorNombre(s.nombre);
    // Sin preset (nombre propio) pero con un escudo puesto a mano: es un buff, no el debuff de siempre por
    // defecto (2026-09-28) — un «Blindaje improvisado» con escudoMagico:6 no debería quedar marcado en contra.
    const base = p ? structuredClone(p) : {nombre: s.nombre, polaridad: s.polaridad || (s.escudoMagico ? 'buff' : 'debuff'), turnos: 0, stacks: 1, hpTurno: 0, detalle: ''};
    // Los números que manda la habilidad pisan los del preset (comun/combatiente.js, la misma regla que la ficha).
    Combatiente.ajustarPreset(base, s, 'hpTurno');
    if(!p && !s.detalle){
      const partes = (base.mods || []).map(m => `${m.val > 0 ? '+' : ''}${m.val} ${m.stat}`);
      if(base.hpTurno) partes.push(`${base.hpTurno > 0 ? '+' : ''}${base.hpTurno} HP por turno`);
      if(base.escudoMagico) partes.push(`escudo de ${base.escudoMagico}`);
      base.detalle = partes.length ? partes.join(', ') + (base.turnos ? ` durante ${base.turnos} turno(s).` : '.') : '';
    }
    return {id: id(), activo: true, stacks: 1, hpTurno: 0, stacksTurno: 0, permanente: false, escudoMagico: 0, forzarNitros: '', mods: [], ...base, ...(s.soltar ? {soltar: s.soltar} : {})};
  }

  // Inmunidades del que recibe el estado: la regla vive en comun/combatiente.js (la misma para ficha, gm-tools y mapa).
  function bloqueadoCreep(estados, est, sc){ return Combatiente.inmunidad(estados, est, sc); }

  // Lo pone en un creep (objeto de gm-tools o de su parte privada). Devuelve {ok, estado?, motivo?}.
  function aplicarACreep(sc, spec){
    sc.estados = Array.isArray(sc.estados) ? sc.estados : [];
    // Inmunidades, acumulación y renovación: la regla común de comun/combatiente.js (agregarEstado).
    const r = Combatiente.agregarEstado(sc.estados, componer(spec), sc);
    if(!r.ok) return {ok: false, motivo: r.motivo};
    // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
    const d = Combatiente.dispararAlAplicar(r, sc.estados, {hp: 'hpTurno', resFuego: typeof CreepCalculo !== 'undefined' ? CreepCalculo.resElemental(sc, 'fuego') : 0});
    if(d.hp){ const tope = parseFloat(sc.hpMax) > 0 ? parseFloat(sc.hpMax) : Infinity; sc.hp = Math.max(0, Math.min(tope, (parseFloat(sc.hp) || 0) + d.hp)); }
    return {ok: true, estado: r.estado, que: r.que, disparo: d};
  }

  // Deja el aviso para que la ficha del dueño lo aplique (campanas/<id>/estados).
  async function encolarPj(o){
    await fbDb.collection(fbRutaCampana('estados')).add({
      fichaId: String(o.fichaId), duenoUid: String(o.duenoUid), spec: JSON.stringify(limpiarSpec(o.spec)).slice(0, 600),
      origen: String(o.origen || '').slice(0, 80), aplicada: false, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  // "Veneno" / "Debilitado (3 turnos: −2 Daño)" — para descripciones y avisos.
  function texto(spec){
    const s = limpiarSpec(spec);
    const p = presetPorNombre(s.nombre);
    const stacks = Number(s.stacks) > 0 ? Math.round(Number(s.stacks)) : 0;
    // El Veneno con stacks dura tantos turnos como stacks (Combatiente.ajustarPreset): se dice "Veneno ×3", sin los turnos del preset.
    const turnos = stacks && p && p.esVeneno ? 0 : s.turnos !== undefined ? s.turnos : (p ? p.turnos : 0);
    // Con el nombre del stat que ve la mesa («Defensa», «Res.Esp», «Tipo 4»), no su id interno (2026-10-02).
    const etq = id => (typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_LABEL && FichaCalculo.STAT_LABEL[id]) || id;
    const mods = (s.mods || (p && p.mods) || []).map(m => `${m.val > 0 ? '+' : '−'}${Math.abs(m.val)} ${etq(m.stat)}`);
    const escudo = s.escudoMagico !== undefined ? s.escudoMagico : (p ? p.escudoMagico : 0);
    const extra = [turnos ? `${turnos} turno${turnos === 1 ? '' : 's'}` : '', ...mods, s.hp ? `${s.hp > 0 ? '+' : '−'}${Math.abs(s.hp)} HP por turno` : '', escudo ? `🛡${escudo}` : ''].filter(Boolean);
    return s.nombre + (stacks ? ` ×${stacks}` : '') + (extra.length ? ` (${extra.join(', ')})` : '');
  }

  return {DEBUFFS, BUFFS, limpiarSpec, esPreset, componer, bloqueadoCreep, aplicarACreep, encolarPj, texto};
})();
