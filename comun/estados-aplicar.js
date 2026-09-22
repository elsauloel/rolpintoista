/* =========================================================
   ESTADOS SOBRE OTROS (compartido: gm-tools, mapa, ficha)
   Una habilidad de creep, o una trampa, puede dejar un estado alterado a quien golpea o a quien la pisa
   (Veneno, Sangrado, Stun, Inmovilizado, o uno propio con bonos/penalizaciones: "−2 de Daño 3 turnos"). Acá vive:
   - `componer(spec)`: arma el estado en la forma de un creep (los mismos presets de gm-tools).
   - `aplicarACreep(sc, spec)`: lo pone en un creep (respeta Invulnerable, Inmunidad a CC, Sangre pura…).
   - `encolarPj({fichaId, duenoUid, spec, origen})`: para un personaje NO se escribe en su ficha desde afuera: se deja un
     aviso en campanas/<id>/estados y la ficha del dueño lo aplica sola, una vez (mismo mecanismo que las recompensas).
   spec = {nombre, turnos?, mods?: [{stat, val}], hp?, detalle?, polaridad?}. Si el nombre es el de un preset
   (Veneno, Sangrado, Stun, Exhausto, Cansado, Lisiado, Inmovilizado, Rengo, Pajaritos, Armadura rota, Veneno severo)
   se usa ese preset con sus marcas; si no, es un estado propio con lo que traiga la spec.
   Aplicar sobre el rival sigue pasando por una decisión del GM (elegir a quién le pegó) o por una trampa que alguien pisó.
   ========================================================= */
const EstadosAplicar = (() => {
  const id = () => Math.random().toString(36).slice(2, 9);
  // Los debuffs de ESTADOS_PRESET_GM (gm-tools), en la forma de un creep.
  const DEBUFFS = [
    {nombre: 'Veneno', polaridad: 'debuff', turnos: 4, stacks: 4, hpTurno: -1, stacksTurno: -1, esVeneno: true, detalle: 'Pierde 1 HP por stack cada turno.'},
    {nombre: 'Pajaritos', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, mitadPdgEva: true, detalle: 'PdG y Evasión a la mitad (redondeado hacia abajo) mientras dure.'},
    {nombre: 'Cansado', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, cansado: true, detalle: 'Sus No2 máximos quedan en 2/3 (redondeado hacia abajo). Ej.: con 9 de máximo, pierde 3 y le quedan 6.'},
    {nombre: 'Exhausto', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, esCC: true, exhausto: true, detalle: 'Sus No2 máximos quedan en un tercio (redondeado hacia abajo). Ej.: con 9 de máximo, le quedan 3.'},
    {nombre: 'Stun', polaridad: 'debuff', turnos: 2, stacks: 1, hpTurno: 0, esCC: true, forzarNitros: 0, detalle: 'Sin No2 durante 2 turnos (dura dos para que te agarre de verdad en tu próximo turno, aunque el Mantenimiento pase antes de que actúes). Mientras dura, cualquier tirada de Evasión falla directo: ni hace falta tirar el dado (a mano).'},
    {nombre: 'Armadura rota', polaridad: 'debuff', permanente: true, stacks: 1, hpTurno: 0, armaduraRota: true, detalle: '−1 Defensa por cada acumulación (×N). Permanente y acumulable.'},
    {nombre: 'Veneno severo', polaridad: 'debuff', turnos: 0, stacks: 1, hpTurno: -1, stacksTurno: 1, permanente: true, esVeneno: true, detalle: 'Hace 1 de daño el primer turno y 1 más con cada mantenimiento. No caduca.'},
    {nombre: 'Sangrado', polaridad: 'debuff', turnos: 0, stacks: 2, hpTurno: -1, stacksTurno: 0, permanente: true, esSangrado: true, detalle: 'Pierde 2 HP por turno. Permanente hasta curarse. Si se repite, suma +1 al daño por turno.'},
    {nombre: 'Lisiado', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, lisiado: true, detalle: 'PdG y Parry a la mitad (redondeado hacia abajo) mientras dure.'},
    {nombre: 'Inmovilizado', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, inmovilizado: true, detalle: 'El Movimiento queda en 0 mientras dure.'},
    {nombre: 'Rengo', polaridad: 'debuff', turnos: 3, stacks: 1, hpTurno: 0, rengo: true, detalle: 'El Movimiento queda a la mitad (redondeado hacia abajo) mientras dure.'},
  ];

  function limpiarSpec(spec){
    const s = spec || {};
    const out = {nombre: String(s.nombre || 'Estado').slice(0, 40)};
    if(s.turnos !== undefined && s.turnos !== null) out.turnos = Math.max(0, Math.round(Number(s.turnos) || 0));
    if(Array.isArray(s.mods)) out.mods = s.mods.filter(m => m && m.stat).map(m => ({stat: String(m.stat), val: Number(m.val) || 0})).slice(0, 8);
    if(s.hp) out.hp = Math.round(Number(s.hp) || 0);
    if(s.detalle) out.detalle = String(s.detalle).slice(0, 200);
    if(s.polaridad) out.polaridad = s.polaridad;
    return out;
  }
  const esPreset = nombre => DEBUFFS.some(p => p.nombre === nombre);

  // Estado en la forma de un creep.
  function componer(spec){
    const s = limpiarSpec(spec);
    const p = DEBUFFS.find(x => x.nombre === s.nombre);
    const base = p ? structuredClone(p) : {nombre: s.nombre, polaridad: s.polaridad || 'debuff', turnos: 0, stacks: 1, hpTurno: 0, detalle: ''};
    if(s.turnos !== undefined) base.turnos = s.turnos;
    if(s.mods) base.mods = structuredClone(s.mods);
    if(s.hp) base.hpTurno = s.hp;
    if(s.detalle) base.detalle = s.detalle;
    if(!p && !s.detalle){
      const partes = (base.mods || []).map(m => `${m.val > 0 ? '+' : ''}${m.val} ${m.stat}`);
      if(base.hpTurno) partes.push(`${base.hpTurno > 0 ? '+' : ''}${base.hpTurno} HP por turno`);
      base.detalle = partes.length ? partes.join(', ') + (base.turnos ? ` durante ${base.turnos} turno(s).` : '.') : '';
    }
    return {id: id(), activo: true, stacks: 1, hpTurno: 0, stacksTurno: 0, permanente: false, escudoMagico: 0, forzarNitros: '', mods: [], ...base};
  }

  // Inmunidades del que recibe el estado (las mismas reglas que gm-tools y la ficha).
  function bloqueadoCreep(estados, est, sc){
    if(!est || est.polaridad !== 'debuff') return false;
    if(sc && sc.jefe && est.nombre === 'Stun') return 'Protección de jefe';
    const activos = (estados || []).filter(e => e.activo !== false);
    if(activos.some(e => e.invulnerable)) return 'Invulnerable';
    if(est.esCC && activos.some(e => e.inmunidadCC)) return 'Inmunidad a CC';
    if(est.esVeneno && activos.some(e => e.sangrePura)) return 'Sangre pura';
    if(est.esSangrado && activos.some(e => e.coagulacionExtrema)) return 'Coagulación extrema';
    return false;
  }

  // Lo pone en un creep (objeto de gm-tools o de su parte privada). Devuelve {ok, estado?, motivo?}.
  function aplicarACreep(sc, spec){
    sc.estados = Array.isArray(sc.estados) ? sc.estados : [];
    const est = componer(spec);
    const b = bloqueadoCreep(sc.estados, est, sc);
    if(b) return {ok: false, motivo: b};
    if(est.armaduraRota){
      const ya = sc.estados.find(e => e.armaduraRota);
      if(ya){ ya.stacks = Math.max(1, Number(ya.stacks) || 1) + 1; ya.activo = true; return {ok: true, estado: ya}; }
    }
    // Veneno se acumula (suma sus stacks, turnos = stacks); Veneno severo no.
    if(est.esVeneno){
      const ya = sc.estados.find(e => e.esVeneno && e.nombre === est.nombre);
      if(ya){
        if(!est.permanente){
          ya.stacks = Math.max(1, Number(ya.stacks) || 1) + Math.max(1, Number(est.stacks) || 1);
          ya.turnos = ya.stacks;
          ya.activo = true;
        }
        return {ok: true, estado: ya};
      }
    }
    // Sangrado se acumula distinto: solo +1 stack por reaplicación (el daño por turno sube de a 1), no una tirada nueva.
    if(est.esSangrado){
      const ya = sc.estados.find(e => e.esSangrado && e.nombre === est.nombre);
      if(ya){ ya.stacks = Math.max(1, Number(ya.stacks) || 1) + 1; ya.activo = true; return {ok: true, estado: ya}; }
    }
    const igual = sc.estados.find(e => e.nombre === est.nombre);
    if(igual){ Object.assign(igual, {...est, id: igual.id}); return {ok: true, estado: igual}; }
    sc.estados.push(est);
    return {ok: true, estado: est};
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
    const p = DEBUFFS.find(x => x.nombre === s.nombre);
    const turnos = s.turnos !== undefined ? s.turnos : (p ? p.turnos : 0);
    const mods = (s.mods || (p && p.mods) || []).map(m => `${m.val > 0 ? '+' : '−'}${Math.abs(m.val)} ${m.stat}`);
    const extra = [turnos ? `${turnos} turno${turnos === 1 ? '' : 's'}` : '', ...mods, s.hp ? `${s.hp > 0 ? '+' : '−'}${Math.abs(s.hp)} HP por turno` : ''].filter(Boolean);
    return s.nombre + (extra.length ? ` (${extra.join(', ')})` : '');
  }

  return {DEBUFFS, limpiarSpec, esPreset, componer, bloqueadoCreep, aplicarACreep, encolarPj, texto};
})();
