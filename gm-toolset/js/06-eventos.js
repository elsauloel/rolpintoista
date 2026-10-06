// js/06-eventos.js — tramo 6 de 12 del script de gm-tools.html (paso 5, nivel A: mismo código, en el mismo orden).
/* ---------- Eventos ---------- */

document.addEventListener('input', e => {
  const t = e.target;
  if(t.dataset.attr !== undefined && t.dataset.id){
    const sc = S.creeps.find(s=>s.id===t.dataset.id);
    if(!sc) return;
    const mod = num(t.dataset.attrmod);
    // No2 depende de Agilidad: el "antes" hay que tomarlo previo a cambiar
    // el atributo (no hay un sc.nitrosMax guardado, a diferencia del HP).
    const agl = t.dataset.attr === 'agl' && sc.nitros !== null && sc.nitros !== undefined
      ? {full: num(sc.nitros) >= creepNitrosMax(sc)} : null;
    sc[t.dataset.attr] = num(t.value) - mod;
    const card = t.closest('.card');
    if(t.dataset.attr === 'con'){
      actualizarHpMaxPorCon(sc);
      actualizarVitalesEnDOM(sc, card);
    }
    if(agl){
      actualizarNo2PorAgl(sc, agl);
      actualizarNo2EnDOM(sc, card);
    }
    actualizarBadgePresupuesto(sc, card);
    actualizarDerivadosEnDOM(sc, card);
    return;
  }
  if(t.dataset.f !== undefined && t.dataset.id){
    const sc = S.creeps.find(s=>s.id===t.dataset.id);
    if(!sc) return;
    const campo = t.dataset.f;
    // El HP se resuelve al salir del campo o con Enter: si se guardara
    // mientras se escribe, "+10" quedaría en 10 apenas se teclea el 1.
    if(campo === 'hp') return;
    const numericos = ['nivel','hp','hpMax','nitros','spd','defensa','armadmg','resfuego','reshielo','resrayo','restoxico','resacido'];
    sc[campo] = numericos.includes(campo) ? num(t.value) : t.value;
    if(campo === 'nivel'){
      actualizarBadgePresupuesto(sc, t.closest('.card'));
    }
    return;
  }
  if(t.dataset.crit !== undefined && t.dataset.id){
    const sc = S.creeps.find(s=>s.id===t.dataset.id);
    if(sc) sc.crit[+t.dataset.crit] = num(t.value);
    return;
  }
  if(t.dataset.habf !== undefined){
    const sc = S.creeps.find(s=>s.id===t.dataset.scid);
    if(!sc) return;
    const h = sc.habilidades.find(x=>x.id===t.dataset.habid);
    if(!h) return;
    h[t.dataset.habf] = t.dataset.habf === 'cd' ? num(t.value) : t.value;
    return;
  }
});

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  // Tocar en cualquier otro lado esconde los botones del estado abierto.
  if(estadoChipAbierto && !(b && (b.dataset.toggleestado || b.dataset.turnoestado || b.dataset.stackestado))) cerrarChipEstado(b);
  if(!b) return;

  if(b.dataset.toggleestado){
    estadoChipAbierto = estadoChipAbierto === b.dataset.toggleestado ? null : b.dataset.toggleestado;
    renderAll();
    return;
  }
  if(b.dataset.stackestado){
    // Armadura rota: suma o resta un stack (-1 Defensa cada uno); en 0 se repara.
    const [scId, esId, d] = b.dataset.stackestado.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    const es = sc && sc.estados.find(x => x.id === esId);
    if(es){
      const n = Math.max(1, num(es.stacks) || 1) + num(d);
      if(n <= 0){ sc.estados = sc.estados.filter(x => x.id !== esId); estadoChipAbierto = null; toast('Armadura reparada'); }
      else { es.stacks = n; estadoChipAbierto = `${scId}:${esId}`; }
      renderAll();
    }
    return;
  }
  if(b.dataset.turnoestado){
    // Suma o resta un turno y deja los botones a la vista para seguir ajustando.
    const [scId, esId, d] = b.dataset.turnoestado.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    const es = sc && sc.estados.find(x => x.id === esId);
    if(es){
      es.turnos = Math.max(0, num(es.turnos) + num(d));
      estadoChipAbierto = `${scId}:${esId}`;
      renderAll();
    }
    return;
  }

  if(b.id === 'btn-add'){
    cargarCreepsSubidos();   // de paso, los avisos 🔔 de las tarjetas quedan al día
    Biblioteca.abrir({
      tipo: 'creeps', titulo: 'Creep nuevo',
      textoCrearDeCero: '+ Crear de cero',
      textoAsistente: '🧭 Crear paso a paso',
      alAsistente: () => abrirAsistenteCreep(null),
      base: typeof CREEPS_BASE !== 'undefined' ? CREEPS_BASE : [],
      alCrearDeCero: () => { const nuevo = nuevoCreep(); nuevo.mapa = mapaParaNuevo(); S.creeps.push(nuevo); renderAll(); },
      alElegir: agregarCreepDeBiblioteca,
      alVer: verCreepDeBiblioteca,
      grupos: CREEPS_GRUPOS,
    });
    return;
  }
  if(b.dataset.bib){
    const sc = S.creeps.find(s => s.id === b.dataset.bib);
    if(sc) guardarCreepEnBiblioteca(sc);
    return;
  }
  if(b.dataset.versioncreep){ const sc = S.creeps.find(s => s.id === b.dataset.versioncreep); if(sc) abrirVersionNuevaCreep(sc); return; }
  if(b.dataset.ver){ verCreep(b.dataset.ver); return; }
  if(b.dataset.editarcreep){ abrirEditarCreep(b.dataset.editarcreep); return; }
  if(b.dataset.cerrareditar){ cerrarEditarCreep(); return; }
  if(b.dataset.img){
    document.querySelector(`[data-imginput="${b.dataset.img}"]`)?.click();
    return;
  }
  if(b.dataset.imgrm){
    const sc = S.creeps.find(x=>x.id===b.dataset.imgrm);
    if(sc){ sc.imagen = ''; renderAll(); }
    return;
  }
  if(b.dataset.del){
    if(!confirm('¿Borrar este creep? No se puede deshacer.')) return;
    const idBorrado = b.dataset.del;
    S.creeps = S.creeps.filter(s=>s.id!==idBorrado);
    renderAll();
    preguntarBorrarTokensDeCreep(idBorrado);
    return;
  }
  if(b.dataset.dup){
    const idx = S.creeps.findIndex(s=>s.id===b.dataset.dup);
    if(idx < 0) return;
    const copia = structuredClone(S.creeps[idx]);
    copia.id = uid();
    copia.nombre = (copia.nombre || 'Creep') + ' (copia)';
    copia.habilidades = (copia.habilidades || []).map(h => ({...h, id: uid()}));
    copia.estados = (copia.estados || []).map(es => ({...es, id: uid()}));
    S.creeps.splice(idx + 1, 0, copia);
    renderAll();
    toast(`${copia.nombre} creado`);
    return;
  }
  if(b.dataset.edithab){
    const [scId, habId] = b.dataset.edithab.split(':');
    abrirEditorHabCreep(scId, habId);
    return;
  }
  if(b.dataset.editararma){
    abrirEditorArmaCreep(b.dataset.editararma);
    return;
  }
  if(b.dataset.verarmacreep){
    const sc = S.creeps.find(s => s.id === b.dataset.verarmacreep);
    if(sc) verItemDatos(armaDeCreepComoItem(sc));
    return;
  }
  if(b.dataset.verequipocreep){
    const [scId, itId] = b.dataset.verequipocreep.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    const it = sc && (sc.equipo || []).find(x => x.id === itId);
    if(it) verItemDatos(piezaDeCreepComoItem(it));
    return;
  }
  if(b.dataset.modorigen){
    toast(b.dataset.modorigen);
    return;
  }
  if(b.dataset.abriracciones){
    abrirAccionesCreep(b.dataset.abriracciones);
    return;
  }
  if(b.dataset.revivircreep){
    revivirCreepId = b.dataset.revivircreep;
    revivirCreepModo = 'pct';
    $('#f-revivircreep-pct').value = 50;
    actualizarRevivirCreepUI();
    $('#scrim-revivir-creep').classList.add('open');
    return;
  }
  if(b.dataset.verhabaccion){
    const [scId, habId] = b.dataset.verhabaccion.split(':');
    abrirVerHabAccion(scId, habId);
    return;
  }
  if(b.dataset.tirarstatcreep){
    const [scId, statId] = b.dataset.tirarstatcreep.split(':');
    publicarTiradaCreep(CreepAcciones.tiradaStat(S.creeps.find(s=>s.id===scId), statId));   // comun/creep-acciones.js (paso 4 etapa 4c)
    return;
  }
  if(b.dataset.atacarcreep || b.dataset.otroataquecreep){
    const sc = S.creeps.find(s=>s.id===(b.dataset.atacarcreep || b.dataset.otroataquecreep));
    if(!sc) return;
    preguntarTipoAtaqueCreep(sc, !!b.dataset.otroataquecreep);   // Atacar = ataque normal; el otro botón, el menú (dueño, 2026-10-06)
    return;
  }
  if(b.dataset.soltarcreep){   // trampas de Atrapar (2026-10-03): la tirada una vez, después cobra y, si salió, saca el estado
    const sc = S.creeps.find(s=>s.id===b.dataset.soltarcreep);
    const t = sc && CreepAcciones.tiradaSoltarse(sc);
    if(!t) return;
    if(num(sc.nitros) < t.s.no2){ toast(`${sc.nombre}: no le alcanzan los No2 — soltarse cuesta ${t.s.no2}`); return; }
    publicarTiradaCreep({origen: t.origen, r: t.r});
    const x = CreepAcciones.aplicarSoltarse(sc, t);
    renderAll();
    toast(x.error || x.aviso);
    return;
  }
  // El cinturón de un creep (2026-10-04): usar, sacar y cargar consumibles (comun/creep-acciones.js).
  if(b.dataset.cinConsumir){
    const [scId, itemId] = b.dataset.cinConsumir.split(':');
    const sc = S.creeps.find(s => s.id === scId), it = sc && (sc.cinturon || []).find(x => x.id === itemId);
    if(!it) return;
    (async () => {
      let forzar = false;
      if(CreepAcciones.faltanNitrosConsumir(sc)){
        if(!confirm(`${sc.nombre} no tiene los No2 para usar ${it.nombre} (cuesta ${CreepAcciones.costoConsumir()}). ¿Usarlo igual? Gasta los que tenga.`)) return;
        forzar = true;
      }
      if(it.trampaDatos){ const t = await CreepAcciones.colocarTrampaDeItem(sc.id, it); toast(t.aviso); if(!t.ok) return; }
      const res = CreepAcciones.consumir(sc, itemId, ESTADOS_PRESET_GM, forzar);
      if(res.error){ toast(res.error); return; }
      (res.tiradas || []).forEach(t => publicarTiradaCreep(t));
      if(res.anuncio) mesaLinea(res.anuncio.texto);   // el anuncio en la Mesa (la Crónica es del mapa)
      renderAll();
      toast(res.aviso);
    })();
    return;
  }
  if(b.dataset.cinQuitar){
    const [scId, itemId] = b.dataset.cinQuitar.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    if(!sc) return;
    const x = CreepAcciones.quitarDelCinturon(sc, itemId);
    if(!x.error) renderAll();
    toast(x.error || x.aviso);
    return;
  }
  if(b.dataset.cinAgregar){
    const sc = S.creeps.find(s => s.id === b.dataset.cinAgregar);
    const sel = document.querySelector(`[data-cin-sel="${b.dataset.cinAgregar}"]`);
    const it = sel ? CATALOGO_BASE.find(x => x.id === sel.value) : null;
    if(!sc || !it){ toast('Elegí un consumible del catálogo'); return; }
    window.cinSelCreep = it.id;   // el desplegable recuerda el último elegido
    const x = CreepAcciones.alCinturon(sc, it, 1);
    if(!x.error) renderAll();
    toast(x.error || x.aviso);
    return;
  }
  if(b.dataset.levantarcreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.levantarcreep);
    if(!sc) return;
    const x = CreepAcciones.levantarse(sc);   // comun/creep-acciones.js
    if(x.error){ toast(x.error); return; }
    renderAll();
    toast(x.aviso);
    return;
  }
  if(b.dataset.daniocreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.daniocreep);
    if(!sc) return;
    const t = CreepAcciones.dano(sc);   // comun/creep-acciones.js
    if(t){
      registrarTirada(t.origen, t.r);
      efectosAlPegarCreep(sc);
    }
    return;
  }
  if(b.dataset.esquivarcreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.esquivarcreep);
    if(!sc) return;
    publicarTiradaCreep(CreepAcciones.esquivar(sc));   // comun/creep-acciones.js
    return;
  }
  if(b.dataset.parrycreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.parrycreep);
    if(!sc) return;
    const x = CreepAcciones.pagarParry(sc);   // comun/creep-acciones.js
    if(x.error){ toast(x.error); return; }
    if(x.deuda) Combatiente.avisarDeudaNo2(x.deuda);   // sin No2: queda en negativo (2026-10-06)
    parryPendienteCreep.add(sc.id);   // si gana el Parry, sigue el Bloqueo
    renderAll();
    publicarTiradaCreep(CreepAcciones.parry(sc));
    toast(x.aviso);
    return;
  }
  if(b.dataset.contraatacarcreep){   // (ya no hay botón suelto: el contraataque es una opción del menú de Atacar)
    const sc = S.creeps.find(s=>s.id===b.dataset.contraatacarcreep);
    if(!sc) return;
    const costo = costoContraataqueCreep(sc);
    if(costo > num(sc.nitros)){
      toast(`${sc.nombre}: no le alcanzan los No2 — el contraataque cuesta ${fmt(costo)} y tiene ${fmt(num(sc.nitros))}`);
      return;
    }
    sc.nitros = num(sc.nitros) - costo;
    renderAll();
    tirarValorStat(`${sc.nombre} · Contraataque (PdG)`, creepStatValor(sc, 'pdg'), sc, 'pdg');
    toast(`${sc.nombre}: contraataque −${fmt(costo)} No2 (lo de un primer ataque) · quedan ${fmt(sc.nitros)}`);
    return;
  }
  if(b.dataset.tipoataquecreep){
    const [tipo, scId] = b.dataset.tipoataquecreep.split(':');
    $('#scrim-tipo-ataque-creep').classList.remove('open');
    const sc = S.creeps.find(s=>s.id===scId);
    if(!sc) return;
    const hacer = () => { if(tipo === 'normal') atacarNormalCreep(sc); else ataqueEspecialCreep(sc, tipo); };
    // Duelo paso a paso (comun/duelo.js): se elige el token al que ataca; su PdG (y los No2) se tiran adentro del duelo.
    if(typeof Duelo !== 'undefined' && Duelo.disponible()){
      Duelo.elegirObjetivo({yo: {ref: sc.id, tipo: 'creep', nombre: sc.nombre},
        ataque: {tipo, armaId: '', armaNombre: sc.armaNombre || '', tipoDado: num(sc.armaTipo) || 8, rango: !!sc.armaDeRango, alcance: alcanceDeCreep(sc)}, suelto: hacer});
    }else hacer();
    return;
  }
  if(b.dataset.fuerzacreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.fuerzacreep);
    if(!sc) return;
    publicarTiradaCreep(CreepAcciones.fuerzaGolpe(sc));   // comun/creep-acciones.js
    return;
  }
  if(b.dataset.bloqueocreep){
    const sc = S.creeps.find(s=>s.id===b.dataset.bloqueocreep);
    if(!sc) return;
    const t = CreepAcciones.bloqueo(sc, parryPendienteCreep.has(sc.id));   // comun/creep-acciones.js
    if(t.error){ toast(t.error); return; }
    parryPendienteCreep.delete(sc.id);
    renderAll();
    publicarTiradaCreep(t);
    return;
  }
  if(b.dataset.armanat){
    abrirCatalogoArmasNaturales(b.dataset.armanat);
    return;
  }
  if(b.dataset.equipardelfabricante){
    abrirEquiparCreep(b.dataset.equipardelfabricante);
    return;
  }
  if(b.id === 'btn-catalogo'){
    abrirEquiparCreep(null);
    return;
  }
  if(b.id === 'btn-tablero'){
    abrirTablero();
    return;
  }
  if(b.id === 'btn-historial'){
    renderHistorialSesion();
    $('#scrim-historial').classList.add('open');
    return;
  }
  if(b.dataset.equiparitem !== undefined){
    equiparItemEnCreep(num(b.dataset.equiparitem));
    return;
  }
  if(b.dataset.veritem !== undefined){
    verItemGM(num(b.dataset.veritem));
    return;
  }
  if(b.dataset.quitarequipo){
    const [scId, equipoId] = b.dataset.quitarequipo.split(':');
    quitarEquipoDeCreep(scId, equipoId);
    return;
  }
  if(b.dataset.addhab){
    const sc = S.creeps.find(s=>s.id===b.dataset.addhab);
    if(sc) abrirCatalogoHabilidades(sc.id);
    return;
  }
  if(b.dataset.addestado){
    abrirPresetsEstadoCreep(b.dataset.addestado);
    return;
  }
  if(b.dataset.presetcreep){
    aplicarPresetEstadoCreep(b.dataset.presetcreep);
    return;
  }
  if(b.dataset.escudo){
    const [scId, esId, acc] = b.dataset.escudo.split(':');
    const sc = S.creeps.find(x => x.id === scId);
    const es = sc && sc.estados.find(x => x.id === esId);
    if(es){
      const neto = !!es.excedenteVida, max = neto ? null : num(es.escudoMagico), actual = num(es.escudoMagicoActual ?? es.escudoMagico);
      const txt = acc === 'set' ? prompt(neto ? `${es.nombre}: ${fmt(actual)}\nEscribí el valor nuevo, +N o -N (sin tope)` : `${es.nombre}: ${fmt(actual)}/${fmt(max)}\nEscribí el valor nuevo, +N o -N (para cambiar el máximo: max 12)`, fmt(actual)) : (num(acc) > 0 ? '+' : '') + acc;
      const nuevo = txt === null ? null : escudoParsear(txt, actual, max);
      if(nuevo){ es.escudoMagico = neto ? nuevo.actual : nuevo.max; es.escudoMagicoActual = nuevo.actual; renderAll(); }
      else if(txt !== null) toast(neto ? 'Escribí un número, +N o -N' : 'Escribí un número, +N, -N o "max N"');
    }
    return;
  }
  if(b.dataset.editarestado){
    const [scId, esId] = b.dataset.editarestado.split(':');
    abrirEditorEstadoCreep(scId, esId);
    return;
  }
  if(b.dataset.verestadocreep){
    const [scId, esId] = b.dataset.verestadocreep.split(':');
    abrirVerEstadoCreep(scId, esId);
    return;
  }
  if(b.dataset.rmestado){
    const [scId, estId] = b.dataset.rmestado.split(':');
    const sc = S.creeps.find(s=>s.id===scId);
    if(sc){
      const es = sc.estados.find(x=>x.id===estId);
      const teniaCon = es && modsAfectanHp(es.mods);
      sc.estados = sc.estados.filter(es=>es.id!==estId);
      if(teniaCon) actualizarHpMaxPorCon(sc);
      renderAll();
    }
    return;
  }
  if(b.dataset.rmhab){
    const [scId, habId] = b.dataset.rmhab.split(':');
    const sc = S.creeps.find(s=>s.id===scId);
    if(sc){ sc.habilidades = sc.habilidades.filter(h=>h.id!==habId); renderAll(); }
    return;
  }
  if(b.dataset.cdmod){
    const [scId, habId, accion] = b.dataset.cdmod.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    const h = sc && sc.habilidades.find(x => x.id === habId);
    if(!sc || !h) return;
    CreepAcciones.cdMod(sc, habId, accion);   // comun/creep-acciones.js
    renderAll();
    return;
  }
  if(b.dataset.duelohabcreep){   // 🎯 cómo se juega la habilidad en el duelo (comun/asistente-duelo-hab.js)
    const [scId, habId] = b.dataset.duelohabcreep.split(':');
    const sc = S.creeps.find(s => s.id === scId);
    const h = sc && sc.habilidades.find(x => x.id === habId);
    if(sc && h) AsistenteDueloHab.abrir({nombre: h.nombre, inicial: h.duelo || null, siempreActivo: true, tieneFormula: !!String(h.tiradaExtra || '').trim(),
      costoInicial: {sp: h.costo, nitrosCosto: h.nitrosCosto, hpCosto: h.hpCosto}, elegirEstado: elegirEstadoDuelo,   // costo en vida: se cobra igual que en un personaje (P133)
      alGuardar: r => {
        if(r){ h.duelo = r.duelo; h.costo = r.costo.sp; h.nitrosCosto = r.costo.nitrosCosto; if(num(r.costo.hpCosto) > 0) h.hpCosto = num(r.costo.hpCosto); else delete h.hpCosto; h.modo = 'auto'; h.automatizada = true; }
        else{ delete h.duelo; if(h.modo === 'auto' || !h.modo) h.modo = 'semi'; }
        renderAll(); toast(r ? `${h.nombre}: ✨ automática (ejecución paso a paso)` : `${h.nombre}: sin ejecución paso a paso (queda semiautomática)`);
      }});
    return;
  }
  if(b.dataset.danohabcreep){
    const [scId, habId] = b.dataset.danohabcreep.split(':');
    const sc = S.creeps.find(s=>s.id===scId);
    const h = sc && sc.habilidades.find(x=>x.id===habId);
    if(sc && h) tirarSegundaDeHab(h, sc);
    return;
  }
  if(b.dataset.ejecutar){
    const [scId, habId] = b.dataset.ejecutar.split(':');
    const sc = S.creeps.find(s=>s.id===scId);
    const h = sc && sc.habilidades.find(x=>x.id===habId);
    if(!sc || !h) return;
    const modo = modoHabCreep(h);
    if(modo === 'manual'){ mesaPublicarHabilidadCreep(sc, h); toast(`${h.nombre || 'Habilidad'} anunciada`); return; }   // 📣 solo el texto
    if(modo === 'auto' && Combatiente.tipoEjecucion(h.duelo) === 'flash'){ usarFlashFueraDelDueloCreep(sc, h); return; }   // ⚡ sin No2, cooldown según el turno
    // Lo que cambia al creep (cobrar, cura y estado del sistema anterior, el atajo «solo sobre sí») y lo que pasa después (Mesa,
    // duelo, trampa, zona, a quién le pegó, el aviso): comun/creep-acciones.js (paso 4 etapa 4c, tanda 5), con gmHabUi (js/04).
    const p = CreepAcciones.ejecutarHab(sc, h, ESTADOS_PRESET_GM);
    if(p.error){ toast(p.error); return; }
    if(p.aviso) toast(p.aviso);
    renderAll();
    CreepAcciones.terminarHab(sc, h, p, gmHabUi);
    return;
  }
  if(b.dataset.especialcreep){   // ✨ un arma especial del creep (2026-10-05): el mismo camino que en el mapa (comun/creep-acciones.js)
    const [scId, itemId] = b.dataset.especialcreep.split(':');
    const sc = S.creeps.find(s=>s.id===scId);
    if(!sc) return;
    const p = CreepAcciones.usarEspecialCreep(sc, itemId, ESTADOS_PRESET_GM);
    if(p.error){ toast(p.error); return; }
    if(p.aviso) toast(p.aviso);
    (p.avisosOrbe || []).forEach(a => toast(a));
    renderAll();
    const h = CreepAcciones.habEspecialParaTerminar(sc, itemId, p.doble);
    if(h) CreepAcciones.terminarHab(sc, h, p, gmHabUi);
    if(p.aMano){   // ✋ la parte a mano
      if(p.aMano.tirada){ if(p.aMano.texto) mesaConTexto('✋ A mano: ' + p.aMano.texto); gmHabUi.publicar(sc, p.aMano.tirada); }
      else gmHabUi.mesaHabilidad(sc, {nombre: (h || {}).nombre || 'Arma especial'}, '✋ A mano: ' + p.aMano.texto);
    }
    return;
  }
  if(b.id === 'btn-mant'){
    // Conectado como GM: pasa el turno para toda la mesa (fichas y creeps).
    // Sin conexión: solo los creeps de esta pestaña, como antes.
    if(gmVivo.activo && gmVivo.listo) mantenimientoGlobal();
    else mantenimiento();
    return;
  }
  if(b.id === 'btn-reset'){
    reiniciarCombate();
    return;
  }
  if(b.id === 'btn-finalizar-combate'){
    abrirReporteFinalizar();
    return;
  }
  if(b.id === 'btn-respaldo-partida'){
    if(!fbDb || !fbMiembro){ toast('Sin conexión con la partida: no se puede armar el respaldo'); return; }
    b.disabled = true;
    toast('Armando el respaldo de la partida…');
    fbBajarRespaldo().then(toast).catch(err => {
      console.error('No se pudo armar el respaldo:', err);
      toast('No se pudo armar el respaldo — mirá la consola');
    }).finally(() => { b.disabled = false; });
    return;
  }
  if(b.id === 'btn-load'){
    if(gmVivo.listo && !confirm('Cargar un respaldo reemplaza TODOS los creeps de la mesa por los del archivo (los que no estén en el archivo se borran).\n\n¿Seguís?')) return;
    $('#file-input').click();
    return;
  }
  if(b.id === 'btn-ia'){ $('#ia-prompt').value = ''; poblarSelectorModelos(); $('#scrim-ia').classList.add('open'); $('#ia-prompt').focus(); return; }
  if(b.id === 'ia-x'){ $('#scrim-ia').classList.remove('open'); return; }
  if(b.id === 'ia-token'){ if(orKey(true)) toast('Clave de OpenRouter actualizada'); return; }
  if(b.id === 'ia-generar'){ generarCreepIA($('#ia-prompt').value.trim()); return; }
});

