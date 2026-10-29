/* ---------- ⚔🛡 La tanda del Choque pesado (2026-10-27, dueño; docs/diseno-roles-creep.md, «Tanda Choque pesado 10 · 10 · 10») ----------
   Lo que estas habilidades de creep hacen en el mapa (lo demás —la Ejecución, los estados, el cobro— va por el camino de siempre):
   · 🛡 Interponerse (Flash, botón ✨): cuando atacan a un aliado a 2 casillas o menos y el aliado todavía no eligió cómo defenderse, salta a su lado (gratis,
     sin oportunidad), el golpe va contra él (el duelo cambia de defensor) y queda Interpuesto (+2 a la Defensa contra ese golpe).
   · ⚔ Golpe que sigue (`ataque.sigue`): si el golpe deja al rival en 0, ataca enseguida a otro rival pegado, pagando lo de un primer ataque (el segundo no sigue).
   · ⚖ Arrastrar (`ataque.arrastra`): antes del golpe, Destreza contra la Evasión para engancharlo; si lo engancha, lo trae hasta quedar pegado (no camina:
     sin No2 ni oportunidad; las trampas y zonas del camino sí lo tocan) y sigue el golpe; si no, no hay golpe (P224, 2026-10-29).
   · ⚖ Carga que derriba (`ataque.derriba` = las casillas que corrió, desde 3; la carrera la hace js/55): si pega, Fuerza + X contra la Res.CC; si gana, Sentado.
   Lo llama el mapa del GM (maneja a los creeps): `disparoResuelto` (js/14) y el botón ✨ de los Flash de creep (js/71). */

// ===== 🛡 Interponerse =====
let interponerDuelos = new Map(), interponerEscucha = null;
function interponerEscuchar(){
  if(interponerEscucha || !soyGM || !fbDb || !fbUsuario || typeof fbRutaCampana !== 'function') return;
  interponerEscucha = fbDb.collection(fbRutaCampana('duelos')).where('estado', '==', 'esperando').onSnapshot(q => {
    interponerDuelos = new Map(q.docs.map(x => [x.id, x.data()]));
  }, err => { console.error('Interponerse: no se pudieron escuchar los duelos', err); interponerEscucha = null; });
}
setInterval(() => { try{ interponerEscuchar(); }catch(e){} }, 3000);
const INTERPONER_DIST = 2;
// A quién puede cubrir: los aliados (creeps) que atacan ahora en un duelo abierto, a 2 casillas o menos, antes de que elijan cómo defenderse.
// → [{id (el token del aliado), t, mismo: false, dueloId}]
function interponerObjetivos(c){
  interponerEscuchar();
  const alc = Math.max(1, Math.round(num(c.h.interponerse && c.h.interponerse.distancia)) || INTERPONER_DIST), out = [];
  for(const [id, d] of interponerDuelos){
    if(!d || d.estado !== 'esperando' || d.fase !== 'contacto' || d.defensa || d.hab || !d.ataque || d.grupo) continue;
    const def = d.defensor;
    if(!def || def.tipo !== 'creep' || def.tokenId === c.id || (d.atacante && d.atacante.tokenId === c.id)) continue;
    if(d.atacante && d.atacante.tipo === 'creep') continue;   // (un creep contra otro: no lo cubre)
    const t = tokens.get(def.tokenId);
    if(!t || distanciaHex(c.t, t) > alc) continue;
    out.push({id: def.tokenId, t, mismo: false, dueloId: id});
  }
  return out;
}
async function interponerseUsar(c, objetivoId){
  const o = interponerObjetivos(c).find(x => x.id === objetivoId);
  const nom = nombreDe(c.t);
  if(!o){ toast(`${c.h.nombre}: ya no se puede (el duelo avanzó o el aliado ya no está cerca)`); return; }
  const d = interponerDuelos.get(o.dueloId), aliado = nombreDe(o.t), quien = (d && d.atacante && d.atacante.nombre) || 'el rival';
  // La casilla: pegada al aliado, libre, la más cerca de él (si ya está pegado, se queda donde está).
  let dest = distanciaHex(c.t, o.t) <= 1 ? {col: c.t.col, fila: c.t.fila} : null;
  if(!dest){
    const ocupada = x => elementoSolidoEn(x.col, x.fila) || [...tokens.entries()].some(([id, y]) => id !== c.id && y.col === x.col && y.fila === x.fila && !y.bajoTierra);
    dest = vecinosDeCasilla(o.t).filter(v => !ocupada(v)).sort((a, b) => distanciaHex(c.t, a) - distanciaHex(c.t, b))[0] || null;
  }
  if(!dest){ AvisoCombate.mostrar({icono: '🛡', titulo: c.h.nombre, texto: `No hay una casilla libre al lado de ${aliado}: ${nom} no puede interponerse.`}); return; }
  const k = flashCreepCosto(c);
  const ok = await AvisoCombate.preguntar(`${nom} salta al lado de ${aliado} y se come el golpe de ${quien}, con +2 a la Defensa contra ese golpe. Cuesta ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}.`,
    {icono: '🛡', titulo: `${nom}: ${c.h.nombre}`, si: 'Interponerse', no: 'Cancelar'});
  if(!ok) return;
  const sp = CreepCalculo.modoSP(c.sc), mult = k.ajeno ? 2 : 1;
  try{
    await modificarCreep(String(c.t.fichaId), sc => {
      const h = (sc.habilidades || []).find(x => x.id === c.h.id);
      if(h){ if(sp) sc.sp = Math.max(0, CreepCalculo.spActual(sc) - CreepCalculo.costoSpHab(sc, h) * mult); else h.cdActual = num(h.cd) * mult; }
      EstadosAplicar.aplicarACreep(sc, {nombre: 'Interpuesto'});
      return {};
    });
    if(dest.col !== c.t.col || dest.fila !== c.t.fila)
      await coleccionTokens().doc(c.id).update({col: dest.col, fila: dest.fila, rotacion: rotacionDePaso(hexCentro(dest.col, dest.fila), hexCentro(o.t.col, o.t.fila)), ruta: firebase.firestore.FieldValue.delete()});
    // El duelo sigue igual, pero ahora defiende él (las opciones de defensa se vuelven a calcular).
    await fbDb.collection(fbRutaCampana('duelos')).doc(o.dueloId).update({defensor: {ref: String(c.t.fichaId), tipo: 'creep', nombre: String(nom).slice(0, 40), uid: String(c.t.duenoUid || ''), tokenId: c.id}});
    if(typeof Duelo !== 'undefined' && Duelo.olvidarOpciones) Duelo.olvidarOpciones(o.dueloId);
  }catch(err){ console.error('Interponerse:', err); toast(`${c.h.nombre}: no se pudo (${err.message || err}) — hacelo a mano`); return; }
  const txt = `${nom} salta al lado de ${aliado} y se mete en el golpe: ahora ${quien} le pega a ${nom}, que tiene +2 a la Defensa contra ese golpe (${k.txt}).`;
  mesaLinea(`🛡 ${txt}`, 'recordatorio');
  momentoAbrir({tipo: 'interponerse', icono: '🛡', titulo: `${nom} se interpone`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido'}});
}

// ===== Lo que pasa al resolverse el ataque (disparoResuelto, js/14) =====
function choquePesadoResuelto(d){
  if(!soyGM || !d || !d.ataque || d.hab || !d.atacante || d.atacante.tipo !== 'creep') return;
  const pego = d.resultado === 'pego' || d.resultado === 'mitad';
  if(!pego) return;
  if(num(d.ataque.derriba) > 0) cargaDerribaResuelto(d).catch(err => console.error('Carga que derriba:', err));
  if(d.ataque.sigue) golpeQueSigueResuelto(d).catch(err => console.error('Golpe que sigue:', err));
}
const choquePesadoHechos = new Set();
// Lo que pregunta algo espera a que el cuadro del duelo se cierre o se minimice (hasta 2 minutos), para no salirle encima.
async function esperarDueloCerrado(maxMs){
  const t0 = Date.now();
  while(Date.now() - t0 < (maxMs || 120000)){
    const f = document.getElementById('duelo-fondo');
    if(!f || f.classList.contains('min') || !f.childElementCount || getComputedStyle(f).display === 'none') return;
    await new Promise(r => setTimeout(r, 400));
  }
}
function choquePesadoUnaVez(d, que){ const k = `${d.id}:${que}`; if(choquePesadoHechos.has(k)) return false; choquePesadoHechos.add(k); return true; }

// ⚔ Golpe que sigue (dueño, 2026-10-27, «vamos así»): si lo dejó en 0, otro rival pegado; lo de un primer ataque; el segundo no sigue.
async function golpeQueSigueResuelto(d){
  if(!choquePesadoUnaVez(d, 'sigue')) return;
  const dn = d.dano || {};
  if(!(num(dn.hpAntes) > 0 && num(dn.hpDespues) <= 0)) return;
  const ta = tokens.get(d.atacante.tokenId), sc = ta ? creepPrivadoDe(ta.fichaId) : null;
  if(!ta || !sc || num(sc.hp) <= 0) return;
  const yo = {ref: sc.id, tipo: 'creep', nombre: sc.nombre};
  const rivales = [...tokens.entries()].map(([id, x]) => ({...x, id})).filter(x => x.id !== d.defensor.tokenId && distanciaHex(x, ta) === 1 && !x.oculto && !x.bajoTierra
    && !etereoDe(x) && dueloEsRival(yo, x) && !(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(x.id)));
  const nom = nombreDe(ta), caido = d.defensor.nombre;
  if(!rivales.length){ mesaLinea(`⚔ ${nom} tumbó a ${caido}, pero no tiene otro rival pegado para seguir (Golpe que sigue)`, 'recordatorio'); return; }
  const costo = CreepCalculo.costoContraataque(sc);   // lo de un primer ataque
  await esperarDueloCerrado();   // (probado en el mapa, 2026-10-27: la pregunta salía encima del «Fin del duelo» y el clic en «Terminar duelo» la contestaba)
  const elegido = await Confirmar.elegir(`${nom} tumbó a ${caido}: ¿sigue contra otro rival pegado? (lo de un primer ataque: ${fmt(costo)} No2; tiene ${fmt(num(sc.nitros))})`,
    {titulo: 'Golpe que sigue', icono: '⚔', no: 'No, se queda', opciones: rivales.map(x => ({valor: x.id, texto: nombreDe(x), detalle: x.tipo === 'pj' ? 'personaje' : ''}))});
  if(!elegido) return;
  if(num(sc.nitros) < costo && !(await AvisoCombate.preguntar(`Le faltan No2 (cuesta ${fmt(costo)}, tiene ${fmt(num(sc.nitros))}). ¿Seguir igual? (queda en 0)`, {icono: '⚔', titulo: 'Sin No2', si: 'Seguir igual', no: 'No'}))) return;
  const h = (sc.habilidades || []).find(x => x && x.duelo && x.duelo.sigue);
  await modificarCreep(sc.id, c => { c.nitros = Math.max(0, num(c.nitros) - costo); return {}; });
  mesaLinea(`⚔ ${nom} tumbó a ${caido} y sigue contra ${nombreDe(tokens.get(elegido))} (Golpe que sigue: −${fmt(costo)} No2)`, 'recordatorio');
  // El segundo golpe: con su arma, sin los arreglos de la habilidad y sin volver a seguir.
  const atq = h ? CreepAcciones.ataqueDeHab(sc, {...h, nombre: `${h.nombre} (el segundo)`, duelo: {...h.duelo, arma: {}, sigue: false}}) : Combatiente.ataqueConSuArma(sc, 'normal', CreepCalculo.alcance(sc));
  if(atq && atq.sigue) delete atq.sigue;
  abrirAcciones(sc.id);
  for(let i = 0; i < 40 && !(ac && ac.creepId === sc.id); i++) await new Promise(r => setTimeout(r, 150));
  if(!(ac && ac.creepId === sc.id)){ toast('Golpe que sigue: no se pudieron abrir las Acciones del creep — atacalo a mano'); return; }
  ac.objetivoFijo = elegido;
  acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
}

/* ⚖ Arrastrar en dos tiempos (P224, dueño 2026-10-29: «vamos con la B», como estaba definido): antes del golpe, el ENGANCHE — la Destreza de quien
   lo tira contra la Evasión del rival (empate: no lo engancha). Si lo engancha, lo trae hasta quedar pegado (aunque después falle el golpe) y sigue
   el ataque con su arma con +2 PdG; si no, no pasa nada más (el ataque ya se gastó). Si ya estaba pegado, va directo al golpe. Lo llama
   dueloElegirObjetivoMapa (js/13) antes de armar el duelo. → true: sigue el golpe (`t` queda en su casilla nueva); false: no hay golpe. */
async function arrastrarEnganche(mio, t, ataque){
  const hab = ataque.habNombre || 'Arrastrar', nom = nombreDe(mio), obj = nombreDe(t);
  if(distanciaHex(mio, t) <= 1) return true;
  const deQuien = x => x.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(x.fichaId || '').split(SEP_INVOCACION)[0]};
  const rd = Combatiente.tirarStat(trampaValorStat(mio, 'des'), confusionEstadosDe(mio), 'des');
  const re = Combatiente.tirarStat(trampaValorStat(t, 'eva'), confusionEstadosDe(t), 'eva');
  let engancha;
  if(!rd || !re){
    engancha = await AvisoCombate.preguntar(`Tirá a mano la Destreza de ${nom} contra la Evasión de ${obj} (empate: no lo engancha). ¿Lo enganchó?`, {icono: '🪝', titulo: hab, si: 'Lo enganchó', no: 'No'});
  }else{
    mesaPublicar(`🪝 ${nom} · ${hab} · Destreza (para engancharlo)`, {...rd, quien: nom, ...deQuien(mio)});
    mesaPublicar(`${obj} · Evasión (que no lo enganche)`, {...re, quien: obj, ...deQuien(t)});
    if(typeof esperarDadosMapa === 'function') await esperarDadosMapa();
    engancha = rd.total > re.total;
  }
  const paraUid = t.tipo === 'pj' && t.duenoUid ? {paraUid: t.duenoUid} : {};
  if(!engancha){
    const txt = rd && re ? `${nom} le tira el gancho a ${obj} (Destreza ${rd.total} contra su Evasión ${re.total}): no lo engancha. No hay golpe.` : `${nom} no engancha a ${obj}: no hay golpe.`;
    mesaLinea(`🪝 ${txt}`, 'recordatorio');
    momentoAbrir({tipo: 'gancho', icono: '🪝', titulo: `${hab}: ${nom} no engancha a ${obj}`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido', ...paraUid}});
    return false;
  }
  if(rd && re) mesaLinea(`🪝 ${nom} engancha a ${obj} (Destreza ${rd.total} contra su Evasión ${re.total}): lo trae y le pega`, 'recordatorio');
  const fin = await arrastrarTraer(t.id, mio.id, hab, nom);
  if(fin){ t.col = fin.col; t.fila = fin.fila; }
  return true;
}
// Lo trae hasta quedar pegado a quien lo arrastra; las trampas del camino lo tocan (la primera que pisa lo frena ahí) y las zonas, también.
// → la casilla donde quedó, o null si no se movió.
async function arrastrarTraer(defId, atkId, hab, quien){
  const t = tokens.get(defId), ta = tokens.get(atkId);
  if(!t || !ta) return null;
  const nom = nombreDe(t), titulo = `${hab}: ${quien} arrastra a ${nom}`;
  const im = chanceDe(t, 'inamovible');
  if(im && Math.random() * 100 < im){ momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `Es Inamovible (${im} %): no se mueve.`, estado: 'listo'}); return null; }
  const ocupada = x => elementoSolidoEn(x.col, x.fila) || [...tokens.values()].some(y => y !== t && y.col === x.col && y.fila === x.fila && !y.bajoTierra);
  const pared = (a, b) => typeof paredCorta === 'function' && paredCorta(a, b);
  const ruta = [{col: t.col, fila: t.fila}];
  let c = ruta[0];
  for(let i = 0; i < 6 && distanciaHex(c, ta) > 1; i++){
    const sig = vecinosDeCasilla(c).filter(v => !ocupada(v) && !pared(c, v) && distanciaHex(v, ta) < distanciaHex(c, ta)).sort((p, q) => distanciaHex(p, ta) - distanciaHex(q, ta))[0];
    if(!sig) break;
    c = sig; ruta.push(c);
  }
  if(ruta.length < 2){ momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: distanciaHex(t, ta) <= 1 ? `Ya estaba pegado a ${quien}.` : 'No hay por dónde traerlo: queda donde está.', estado: 'listo'}); return null; }
  // La primera trampa del camino lo frena ahí y se dispara (como si la pisara).
  const tr = typeof trampasEvaluarRuta === 'function' ? trampasEvaluarRuta(defId, t, ruta, 0) : null;
  const corte = tr && tr.tipo === 'pisa' ? tr.indice : -1;
  const final = corte > 0 ? ruta.slice(0, corte + 1) : ruta, fin = final[final.length - 1], pasos = final.length - 1;
  try{ await coleccionTokens().doc(defId).update({col: fin.col, fila: fin.fila, ruta: firebase.firestore.FieldValue.delete()}); }
  catch(err){ console.error('Arrastrar: no se pudo mover', err); momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `Traelo ${pasos} casillas a mano (no se pudo mover solo).`, estado: 'listo'}); return null; }
  const trampaTxt = corte > 0 ? ' En el camino pisa algo: se frena ahí.' : '';
  momentoAbrir({tipo: 'gancho', icono: '🪝', titulo, resultado: `Lo trae ${pasos} casillero${pasos === 1 ? '' : 's'} hacia ${quien} (no camina: sin No2 ni ataques de oportunidad).${trampaTxt}`, estado: 'listo',
    datos: {arrastre: {tokenId: defId, celdas: final.map(x => ({col: x.col, fila: x.fila}))}}});   // las zonas del camino: las revisa la pantalla de su dueño (arrastreZonasMomento)
  mesaLinea(`🪝 ${quien} arrastra a ${nom} ${pasos} casillero${pasos === 1 ? '' : 's'}${trampaTxt ? ' — pisó una trampa en el camino' : ''}`, 'recordatorio');
  if(corte > 0 && typeof trampaResolver === 'function'){
    trampaPendiente = {tokenId: defId, tipo: 'pisa', id: tr.id, el: tr.el, celda: fin, desde: final[final.length - 2]};
    setTimeout(() => { trampaResolver().catch(err => console.error('Arrastrar: la trampa', err)); }, 600);
  }
  return fin;
}
// Las zonas del camino de alguien arrastrado (2026-10-27): cada pantalla revisa lo suyo (zonaEsMia: el dueño a su personaje, el GM a sus creeps), así
// que la que lo arrastró avisa con el momento y la del dueño las revisa. Solo un momento de recién (al entrar al mapa no se repiten los viejos).
const arrastresVistos = new Set();
function arrastreZonasMomento(id, d){
  const a = d && d.datos && d.datos.arrastre;
  if(!a || !Array.isArray(a.celdas) || a.celdas.length < 2 || arrastresVistos.has(id)) return;
  arrastresVistos.add(id);
  const cuando = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - cuando > 20000 || typeof zonaRevisarEntrada !== 'function') return;
  setTimeout(() => { try{ zonaRevisarEntrada(a.tokenId, a.celdas, 0); }catch(err){ console.error('Arrastrar: las zonas del camino', err); } }, 800);   // (que llegue antes la casilla nueva)
}

// ⚖ Carga que derriba (dueño, 2026-10-27): si corrió 3 o más y pegó, Fuerza + X contra la Res.CC; si gana, Sentado (empate: no cae).
async function cargaDerribaResuelto(d){
  if(!choquePesadoUnaVez(d, 'derriba')) return;
  const t = tokens.get(d.defensor.tokenId), ta = tokens.get(d.atacante.tokenId);
  const sc = ta ? creepPrivadoDe(ta.fichaId) : null;
  if(!t || !sc) return;
  const x = Math.round(num(d.ataque.derriba)), nom = nombreDe(ta), obj = nombreDe(t);
  const rf = Combatiente.tirarStat(CreepCalculo.statValor(sc, 'fue') + x, sc.estados, 'fue');
  const rr = Combatiente.tirarStat(trampaValorStat(t, 'rescc'), confusionEstadosDe(t), 'rescc');
  if(!rf || !rr){ mesaLinea(`🏃 ${nom} carga contra ${obj}: ✋ tirá a mano Fuerza + ${x} contra su Res.CC (si gana, Sentado)`, 'alerta-roja'); return; }
  mesaPublicar(`🏃 ${nom} · Carga que derriba · Fuerza + ${x}`, {...rf, quien: nom, desde: 'gm'});
  mesaPublicar(`${obj} · Res.CC (para no caer)`, {...rr, quien: obj, ...(t.tipo === 'creep' ? {desde: 'gm'} : {ficha: String(t.fichaId).split(SEP_INVOCACION)[0]})});
  const cae = rr.total < rf.total;
  if(cae){
    try{
      if(t.tipo === 'creep') await modificarCreep(String(t.fichaId), c => { EstadosAplicar.aplicarACreep(c, {nombre: 'Sentado'}); return {}; });
      else{ const f = fichasPub.get(String(t.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: (f && f.duenoUid) || t.duenoUid, spec: {nombre: 'Sentado'}, origen: `${nom} · Carga que derriba`}); }
    }catch(err){ console.error('Carga que derriba: no se pudo sentar', err); mesaLinea(`🏃 ${obj} cae Sentado (✋ ponéselo a mano: no se pudo solo)`, 'alerta-roja'); }
  }
  if(typeof esperarDadosMapa === 'function') await esperarDadosMapa();
  const txt = `${nom} llega a toda carrera (Fuerza + ${x}: ${rf.total}) contra la Res.CC de ${obj} (${rr.total}): ${cae ? `${obj} cae Sentado` : `${obj} se mantiene en pie`}.`;
  mesaLinea(`🏃 ${txt}`, 'recordatorio');
  momentoAbrir({tipo: 'carga', icono: '🏃', titulo: `${nom}: Carga que derriba`, resultado: txt, estado: 'listo', datos: {aviso: true, boton: 'Entendido', ...(t.tipo === 'pj' && t.duenoUid ? {paraUid: t.duenoUid} : {})}});
}
