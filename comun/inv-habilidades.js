/* =========================================================
   INV-HABILIDADES — las habilidades de una invocación, fuera de la ficha (paso 4, etapa 4e, tanda 5 de
   docs/plan-paso4-etapa4.md, 2026-10-01)
   Lo que antes vivía en ficha-personaje/js/04-invocaciones.js (invEjecutarHab y sus ayudantes: habDueloInv, ataqueDeHabInv,
   lanzarAtaqueDeHabInv, usarFlashFueraDelDueloInv, ponerEstadoEnInv, aplicarSpecAInv, anunciarHabilidadInv,
   tirarExtraDeHabInv, tirarSegundaDeHabInv), copiado tal cual y partido como comun/creep-acciones.js: `ejecutar` (lo que CAMBIA
   a la invocación: cobrar No2, cooldown y vida, la cura y el estado del sistema anterior, el atajo ✨ «solo sobre ella») y
   `terminar` (lo que pasa DESPUÉS: la Mesa, el duelo, el ataque con arreglos, la tirada, el aviso), que cada pantalla hace con su
   `ui`. Las tiradas devuelven {origen, r} o {error}.
   ui = {mesaHabilidad(inv, nombre, detalle), mesaConTexto(texto), publicar(t), toast(t), cambio() (después de ejecutar: guardar y
     dibujar), cambiar(fn) (el Flash), parry (el Set del Parry pendiente), dueloDisponible(), elegirObjetivo(inv, cfg) (cfg =
     {ataque, suelto}: el duelo a nombre de la invocación), enMapa(), ref(inv) («fichaId~invId»), colocarZona(msg) → bool (la zona
     persistente: el mensaje 'zona-persistente-habilidad' al mapa), colocarTrampa(inv, h) (la trampa de la habilidad)}.
   Zona persistente y trampa (paso 4, etapa 4f, 2026-10-02, P134): como en el personaje — la trampa se coloca y la habilidad se
   anuncia igual (la maneja un jugador); la zona tira una vez su stat y le pide al mapa el centro.
   Necesita comun/combatiente.js, inv-calculo.js, inv-acciones.js, inv-duelo.js, ficha-calculo.js (STAT_LABEL), ficha-botonera.js
   (modoHab), ficha-habilidades.js (presets), ficha-acciones.js (estadoDeSpec), confirmar-turno.js y tiradas.js.
   ========================================================= */
const InvHabilidades = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const uid = () => Math.random().toString(36).slice(2,9);
  const I = () => InvCalculo, A = () => InvAcciones;
  const etq = s => FichaCalculo.STAT_LABEL[s] || s;

  const tira = h => !!(h.tiradaStat || (h.tiradaExtra||'').trim());
  function anunciar(inv, h, ui){
    const detalle = (h && (h.detalle || h.efectoDetalle)) || '';
    if(tira(h)) ui.mesaConTexto(detalle);
    else ui.mesaHabilidad(inv, h.nombre, detalle);
  }
  // Igual que en el personaje (tirarPrimeraDeHab): al ejecutar se tira solo la primera; la fórmula, si hay stat, va con el botón 🎲.
  // Devuelve la tirada ({origen, r} o {error}) o null si no hay nada que tirar.
  function tiradaPrimera(inv, h){
    if(h.tiradaStat) return A().tirada(inv, `${h.nombre} · ${etq(h.tiradaStat)}`, I().statValor(inv, h.tiradaStat), h.tiradaStat);
    const formula = (h.tiradaExtra||'').trim();
    if(formula){
      const r = tirarDados(formula);
      if(r) return {origen: `${inv.nombre} · ${h.nombre}`, r};
    }
    return null;
  }
  function tiradaSegunda(inv, h){
    const r = tirarDados((h.tiradaExtra||'').trim());
    return r ? {origen: `${inv.nombre} · ${h.nombre} · Efecto`, r} : {error: 'La fórmula de la habilidad no es válida'};
  }
  function alcanceHab(inv, c, statTira){ return Combatiente.alcanceHab(c, statTira, s => I().statValor(inv, s)); }   // comun/combatiente.js
  // La Ejecución de una invocación: la misma regla que el personaje y el creep. Las invocaciones no tienen costo variable.
  function habEjecucion(inv, h){
    return Combatiente.habEjecucion(h, h && h.duelo, {stat: s => I().statValor(inv, s), etq, armaDano: I().ataqueTxt(inv)});
  }
  // «Ataque con mi arma, con arreglos» de una invocación (P134), con su arma y su alcance (o el que diga la habilidad).
  function ataqueDeHab(inv, h){
    const c = h && h.duelo;
    return Combatiente.ataqueConArreglos(h, c, {arma: {...Combatiente.armaDeCombatiente(inv), id: '', nombre: inv.armaNombre || '', rango: !!inv.armaDeRango},
      alcance: c && c.alcance !== undefined && c.alcance !== 'auto' ? alcanceHab(inv, c, 'pdg') : (inv.armaDeRango ? Math.max(1, Math.round(num(I().statValor(inv, 'rng')))) : 1)});
  }
  // El PdG del ataque con arreglos, con lo que le suma la habilidad (los No2 ya los cobró la habilidad).
  const tiradaPdgArreglos = (inv, atq) => A().tirada(inv, 'Atacar (PdG)', I().statValor(inv, 'pdg') + num(atq && atq.mods && atq.mods.pdg), 'pdg');
  // Se anuncia y va al cuadro del duelo como un ataque de la invocación; sin duelo, se tira el PdG suelto.
  function lanzarAtaque(inv, h, ui){
    const atq = ataqueDeHab(inv, h);
    ui.parry.delete(inv.id);   // atacar cierra el Parry que esperaba su Bloqueo
    ui.mesaHabilidad(inv, h.nombre, h.detalle || h.efectoDetalle || '');
    if(atq && ui.dueloDisponible()) ui.elegirObjetivo(inv, {ataque: atq, suelto: () => ui.publicar(tiradaPdgArreglos(inv, atq))});
    else ui.publicar(tiradaPdgArreglos(inv, atq));
  }
  // ⚡ Flash fuera del duelo: cobra (cooldown y vida, el doble en turno ajeno) y lo anuncia; el bono se suma a mano.
  async function usarFlashFuera(inv, h, ui){
    const p = await InvDuelo.pagarFlash(inv, h, ui);
    if(!p) return;
    const f = h.duelo.flash || {};
    ui.mesaHabilidad(inv, h.nombre, `${h.detalle || ''}${h.detalle ? ' — ' : ''}⚡ Flash: +${fmt(num(f.bono))} a la tirada.`);
    ui.toast(`${h.nombre}: ⚡ +${fmt(num(f.bono))} (sumalo a mano a la tirada; dentro del duelo se suma solo) · ${ConfirmarTurno.textoCosto(p)}`);
  }
  // Pone un estado en la invocación con la regla común (inmunidades, acumulación y renovación). Devuelve el texto para la Mesa.
  function ponerEstado(inv, d){
    inv.estados = inv.estados || [];
    const r = Combatiente.agregarEstado(inv.estados, d, {armaNatural: !!inv.armaNatural});
    if(!r.ok) return `${d.nombre}: no le hizo efecto (${r.motivo})`;
    if(r.que === 'yaLoTiene') return `${d.nombre}: ya lo tenía`;
    const e = r.estado;
    // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
    const dis = Combatiente.dispararAlAplicar(r, inv.estados, {hp: 'hpturno', resFuego: num(I().statValor(inv, 'resfuego')), hpActual: inv.hp});
    const ya = dis.hp ? ` · ya ${dis.hp < 0 ? 'le sacó' : 'le curó'} ${fmt(Math.abs(dis.hp))} HP` : '';
    if(dis.hp) inv.hp = Math.max(0, Math.min(num(inv.hpMax) || Infinity, num(inv.hp) + dis.hp));
    if(I().modsAfectanHp(e.mods || [])) I().actualizarHpMaxPorCon(inv);
    if(r.que === 'acumulado') return `${e.nombre} ×${fmt(num(e.stacks))}`;
    return `${e.nombre}${r.que === 'renovado' ? ' renovado' : ''}${e.permanente ? ' (no vence)' : e.turnos ? ` (${fmt(e.turnos)} turno${e.turnos === 1 ? '' : 's'})` : ''}${e.escudoMagico ? `, 🛡${fmt(e.escudoMagico)}` : ''}${ya}`;
  }
  // La zona persistente (4f): tira una vez su stat (si la Ejecución dice qué tira) y le manda al mapa el mensaje de siempre
  // (comun/combatiente.js, zonaDeHab, a nombre de «fichaId~invId»). false = no se pudo (sin el mapa abierto).
  function zona(inv, h, ui){
    const c = h && h.duelo;
    if(!c || typeof c !== 'object' || c.objetivo !== 'zona' || !ui.enMapa()) return false;
    // La tirada es de la zona, no de la habilidad (2026-10-02, P143): se manda el valor del stat y el mapa lo tira en cada exposición.
    const v = c.tira ? I().statValor(inv, c.tira) : NaN;
    try{ return ui.colocarZona(Combatiente.zonaDeHab(h, c, {fichaId: ui.ref(inv), tipo: 'pj', tiraValor: Number.isFinite(v) ? v : undefined})) !== false; }
    catch(err){ console.error('No se pudo avisar la zona al mapa:', err); return false; }
  }
  // Un efecto del cuadro de Ejecución sobre la propia invocación: cura, o el estado armado igual que uno recibido.
  function aplicarSpec(inv, ef, presets){
    if(ef.cura){ inv.hp = Math.min(num(inv.hpMax) > 0 ? num(inv.hpMax) : Infinity, num(inv.hp) + num(ef.cura)); return `+${fmt(num(ef.cura))} HP`; }
    return ponerEstado(inv, FichaAcciones.estadoDeSpec(ef.spec || {nombre: ef.nombre}, presets));
  }

  /* ---------- Ejecutar (antes invEjecutarHab) ----------
     ejecutar(inv, h, presets, dueloDisponible) → {modo: 'manual'} (📣: solo anunciar), {modo: 'flash'} (⚡: usarFlashFuera), {error}
     (no se puede usar ahora) o el plan {costo, costoHp, curaHp, efectoTxt, falta, esArma, sobreSi, hab, aplicadoDirecto, hDuelo}
     después de cobrar. terminar(inv, h, p, ui) hace lo que sigue. */
  function ejecutar(inv, h, presets, dueloDisponible){
    const sil = Combatiente.preguntaSilencio(inv.estados, h, inv.nombre);   // Silencio (2026-10-04): avisa y deja seguir
    if(sil && !(typeof confirm === 'function' && confirm(sil))) return {error: `${inv.nombre}: en Silencio, no usó ${h.nombre || 'la habilidad'}`};
    const modo = FichaBotonera.modoHab(h);
    if(modo === 'manual') return {modo: 'manual'};
    if(modo === 'auto' && Combatiente.tipoEjecucion(h.duelo) === 'flash') return {modo: 'flash'};   // ⚡ su propia regla de costo (P136)
    const bloqueo = I().bloqueoHab(inv, h);
    if(bloqueo) return {error: `${inv.nombre}: ${h.nombre||'Habilidad'} — ${bloqueo}`};
    // Se cobra lo que la habilidad tenga cargado (P133): No2, cooldown y vida; y si trae una cura del sistema anterior, cura.
    const costo = I().costoNitrosHab(inv, h), costoHp = num(h.hpCosto), curaHp = num(h.curaHp);
    inv.nitros = num(inv.nitros) - costo;
    if(I().habAtaque(h)) inv.ataquesTurno = num(inv.ataquesTurno) + 1;
    if(num(h.cd) > 0) h.cdActual = num(h.cd);
    if(costoHp > 0) inv.hp = num(inv.hp) - costoHp;
    if(curaHp > 0) inv.hp = Math.min(num(inv.hpMax) > 0 ? num(inv.hpMax) : Infinity, num(inv.hp) + curaHp);
    let efectoTxt = '';
    if((h.efectoNombre||'').trim()){
      const nombre = h.efectoNombre.trim();
      // Estado al ejecutar (sistema anterior): con las marcas de su preset, si tiene uno, para que valgan las inmunidades.
      efectoTxt = ponerEstado(inv, {...FichaHabilidades.flagsDePreset(presets, nombre), id: uid(), nombre, detalle: h.efectoDetalle||'', turnos: Math.max(0,num(h.efectoTurnos)||0),
        hpturno: num(h.efectoHpTurno)||0, permanente: Combatiente.efectoPermanente(h, FichaHabilidades.presetPorNombre(presets, nombre)), activo: true, stacks:1, stacksturno:0,
        polaridad: h.efectoPolaridad||'otro', mods: structuredClone(h.efectoMods||[])});
    }
    let hDuelo = null, aplicadoDirecto = '', falta = '', esArma = false, sobreSi = false, hab = null, esZona = false, soloTrampa = false;
    if(modo === 'auto'){
      // ✨ que solo coloca una trampa (sin la Ejecución armada): la trampa y su anuncio los hace colocarTrampa, como el personaje.
      soloTrampa = !!h.trampaColocar && !Combatiente.tipoEjecucion(h.duelo);
      // Lo que todavía no anda para invocaciones se avisa y va como 💰.
      falta = soloTrampa ? '' : Combatiente.ejecucionNoDisponible(h.duelo, 'inv');
      esArma = !falta && !soloTrampa && Combatiente.tipoEjecucion(h.duelo) === 'arma';   // ataque con arreglos: al duelo como un ataque
      esZona = !falta && !soloTrampa && Combatiente.tipoEjecucion(h.duelo) === 'zona';   // zona persistente (4f): queda puesta en el mapa
      hab = falta || esArma || esZona || soloTrampa ? null : habEjecucion(inv, h);
      if(falta || esArma || esZona || soloTrampa){ /* el aviso va al final, junto con lo que se cobró; el resto, en terminar */ }
      else if(Combatiente.sobreSiSinTiradas(hab)){
        sobreSi = true;
        aplicadoDirecto = hab.efectos.map(ef => aplicarSpec(inv, ef, presets)).join(' · ');
      }else if(dueloDisponible) hDuelo = hab;
    }
    return {costo, costoHp, curaHp, efectoTxt, falta, esArma, esZona, soloTrampa, sobreSi, hab, aplicadoDirecto, hDuelo};
  }
  function terminar(inv, h, p, ui){
    if(h.trampaColocar && ui.colocarTrampa) ui.colocarTrampa(inv, h);   // 4f: como el personaje, se coloca y la habilidad sigue
    if(p.sobreSi) ui.mesaHabilidad(inv, h.nombre, [h.detalle || '', p.aplicadoDirecto ? '→ ' + p.aplicadoDirecto : '', p.hab.efectoLibre || '', p.hab.efectosNota || ''].filter(Boolean).join(' '));
    if(p.esArma) lanzarAtaque(inv, h, ui);
    else if(p.soloTrampa){ /* el anuncio y la casilla ya los maneja colocarTrampa */ }
    else if(p.esZona){
      ui.mesaHabilidad(inv, h.nombre, h.detalle || h.efectoDetalle || '');
      if(!zona(inv, h, ui)) ui.toast(`${h.nombre}: para colocar la zona hace falta tener el mapa abierto`);
    }
    else if(p.hDuelo){
      ui.mesaHabilidad(inv, h.nombre, h.detalle || h.efectoDetalle || '');
      ui.elegirObjetivo(inv, {ataque: {tipo: 'habilidad', hab: p.hDuelo, alcance: p.hDuelo.alcance}, suelto: () => { const t = tiradaPrimera(inv, h); if(t) ui.publicar(t); }});
    }else if(!p.aplicadoDirecto){
      anunciar(inv, h, ui);
      const t = tiradaPrimera(inv, h);
      if(t) ui.publicar(t);
    }
    ui.cambio();
    const partes = ['ejecutada', p.costo?`-${fmt(p.costo)} No2`:'sin costo de Nitros'];
    if(p.costoHp > 0) partes.push(`-${fmt(p.costoHp)} HP`);
    if(p.curaHp > 0) partes.push(`+${fmt(p.curaHp)} HP`);
    if(p.falta) partes.push(`⚠ ${p.falta}: se ejecutó como semiautomática`);
    if(p.aplicadoDirecto) partes.push(p.aplicadoDirecto);
    if(p.efectoTxt) partes.push(p.efectoTxt);
    ui.toast(`${h.nombre||'Habilidad'} ${partes.join(' · ')}`);
  }

  return {tira, anunciar, tiradaPrimera, tiradaSegunda, alcanceHab, habEjecucion, ataqueDeHab, tiradaPdgArreglos, lanzarAtaque,
    usarFlashFuera, ponerEstado, aplicarSpec, zona, ejecutar, terminar};
})();
