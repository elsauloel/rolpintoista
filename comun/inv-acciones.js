/* =========================================================
   INV-ACCIONES — los botones de la Botonera de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 3 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes hacía ficha-personaje/js/04-invocaciones.js (tirarValorStatInv, invAtacar/invAtacarSuelto, invDanio,
   invTirarStat), copiado tal cual y partido como comun/creep-acciones.js: lo que CAMBIA a la invocación (pagar el Parry o el
   ataque: devuelven {error} o {aviso}) y las TIRADAS (devuelven {origen, r} para publicar, o {error}). Así la ficha lo hace con
   su personaje en memoria y el mapa con el de la Botonera nueva, y cada uno publica y guarda a su manera. El Parry que espera su
   Bloqueo lo lleva cada pantalla.
   Necesita comun/combatiente.js, inv-calculo.js, ficha-calculo.js (STAT_LABEL) y tiradas.js (tirarDados).
   ========================================================= */
const InvAcciones = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const I = () => InvCalculo;
  const etq = statId => FichaCalculo.STAT_LABEL[statId] || statId;

  /* ---------- Tiradas ---------- */
  // La misma tirada que el personaje y los creeps (comun/combatiente.js): con Afortunado también tira dos veces (P100).
  function tirada(inv, nombre, valor, statId){
    const r = Combatiente.tirarStat(valor, inv.estados, statId);
    if(!r) return {error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`};
    return {origen: `${inv.nombre} · ${nombre}`, r};
  }
  // Una tirada de stat de la Botonera (también Esquivar, Parry y Bloqueo). o: {parryPendiente (¿tiene un Parry esperando su
  // Bloqueo?), trasParry (el duelo ya sabe que el Parry se ganó)}. Devuelve {error} o {tirada, parry: 'poner'|'sacar'|'',
  // aviso, cambio (true si le cobró algo)}: el Parry cobra 1 No2 y deja el Bloqueo pendiente; el Bloqueo lo cierra.
  function tirarStat(inv, statId, o){
    o = o || {};
    if((statId === 'parry' || statId === 'bloqueo') && !I().defensa(inv)) return {error: `${inv.nombre}: ${Combatiente.SIN_ARMA_DEFENSA}`};
    let parry = '', aviso = '', cambio = false;
    if(statId === 'bloqueo'){
      if(!o.trasParry && !o.parryPendiente) return {error: `${inv.nombre}: ${Combatiente.BLOQUEO_SOLO_TRAS_PARRY}`};
      parry = 'sacar';
    }
    if(statId === 'parry'){
      const costo = Combatiente.costoParry();   // el Parry siempre cuesta 1 No2
      if(costo > num(inv.nitros)) return {error: `${inv.nombre}: no le alcanzan los No2 — el Parry cuesta ${fmt(costo)} No2 y tiene ${fmt(num(inv.nitros))}`};
      inv.nitros = num(inv.nitros) - costo;
      parry = 'poner';   // si gana el Parry, sigue el Bloqueo
      cambio = true;
      aviso = `${inv.nombre}: Parry −${fmt(costo)} No2 · quedan ${fmt(inv.nitros)}`;
    }
    const valor = statId === 'bloqueo' ? I().bloqueoValor(inv) : I().statValor(inv, statId);
    return {tirada: tirada(inv, etq(statId), valor, statId), parry, aviso, cambio};
  }
  // El daño de su arma; mods: lo que suma un ataque con arreglos (dados y fijo). Los efectos al golpear los publica cada pantalla.
  function dano(inv, mods){
    let formula = I().danoTxt(inv, I().statValor(inv, 'dmg'));
    if(mods){
      if(num(mods.dados) > 0) formula += ` + ${Math.round(num(mods.dados))}d${num(inv.armaTipo) || 8}`;
      if(num(mods.fijo)) formula += ` ${num(mods.fijo) > 0 ? '+' : '-'} ${fmt(Math.abs(num(mods.fijo)))}`;
    }
    const r = tirarDados(formula);
    return r ? {origen: `${inv.nombre} · Daño Arma`, r} : null;
  }

  /* ---------- Atacar ----------
     Con el duelo: el ataque que va al cuadro (ataqueDuelo). Sin duelo (o "Sin objetivo"): cobrar (pagarAtaque: el primero del
     turno Tipo ÷ 2, después el Tipo completo; suma al conteo) y tirar el PdG (tiradaAtaque). Atacar cierra el Parry pendiente:
     lo borra cada pantalla. */
  function ataqueDuelo(inv){
    return {tipo: 'normal', armaId: '', armaNombre: inv.armaNombre || '', tipoDado: num(inv.armaTipo) || 8, rango: !!inv.armaDeRango, ...(inv.armaEspalda ? {espalda: inv.armaEspalda} : {}),
      alcance: inv.armaDeRango ? Math.max(1, Math.round(num(I().statValor(inv, 'rng')))) : 1};
  }
  /* Sin No2 suficientes (2026-10-02, hoja de ruta B-7, igual que los creeps y los personajes: avisar y dejar seguir): faltanNitros, la
     pregunta «¿Atacar igual?», pagar forzando (gasta los que tenga, hasta 0) y la línea roja de la Mesa (alertaSinNitros). */
  const faltanNitros = inv => I().costoAtaque(inv) > num(inv.nitros);
  function preguntaSinNitros(inv){
    return `${inv.nombre} no tiene No2 suficientes: este ataque cuesta ${fmt(I().costoAtaque(inv))} y tiene ${fmt(Math.max(0, num(inv.nitros)))}.\n\n¿Atacar igual? Gasta los No2 que tenga y queda anotado en rojo en la Mesa.`;
  }
  function pagarAtaque(inv, forzar){
    const costo = I().costoAtaque(inv), tenia = Math.max(0, num(inv.nitros));
    const forzado = costo > num(inv.nitros) ? {costo, tenia} : null;
    if(forzado && !forzar) return {error: `${inv.nombre}: no le alcanzan los Nitros — este ataque cuesta ${fmt(costo)} y tiene ${fmt(num(inv.nitros))}`};
    const primero = num(inv.ataquesTurno) === 0;
    inv.nitros = forzado ? 0 : num(inv.nitros) - costo;
    inv.ataquesTurno = num(inv.ataquesTurno) + 1;
    return {forzado, aviso: `${inv.nombre}: -${fmt(forzado ? tenia : costo)} No2${forzado ? ` (costaba ${fmt(costo)})` : ''} · ${primero ? 'primer ataque del turno' : 'ataque extra'}`};
  }
  function alertaSinNitros(inv, forzado){
    if(!forzado || typeof fbDb === 'undefined' || !fbDb || typeof fbUsuario === 'undefined' || !fbUsuario || !fbMiembro) return;
    fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `⚠ ${inv.nombre} atacó sin No2 suficientes`, formula: `Costaba ${fmt(forzado.costo)} No2 y tenía ${fmt(forzado.tenia)}`,
      rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(err => console.error('No se pudo publicar la alerta de No2:', err));
  }
  const tiradaAtaque = inv => tirada(inv, 'Atacar (PdG)', I().statValor(inv, 'pdg'), 'pdg');

  return {tirada, tirarStat, dano, ataqueDuelo, pagarAtaque, tiradaAtaque, faltanNitros, preguntaSinNitros, alertaSinNitros};
})();
