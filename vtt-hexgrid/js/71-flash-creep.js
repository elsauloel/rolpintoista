/* ---------- ✨ Flash de un creep, con el botón instantáneo del GM (2026-10-24, dueño) ----------
   «Para este skill el GM debería tener el botón instantáneo disponible no sólo durante el turno del creep sino todo el tiempo, también en la columna
   anexa al menú de duelos». Una habilidad de creep marcada `flash` (Bendecir el arma; el Mal de ojo y el Desarmar tienen el suyo: js/60, js/62) se
   puede usar desde el botón fijo ✨ (Flotantes.bendecir): arriba, con los demás, y en la columna «Podés usar» del duelo abierto (comun/flotantes.js
   los muda solos). Al tocarlo se elige qué creep y a quién (sus aliados en su Rango; primero el que ataca en el duelo abierto, que su golpe la usa si
   llega antes de tirar el daño, aunque ya haya tirado el PdG: js/13 cargaAlGolpeAbierto) y se ejecuta como desde sus Acciones (acEjecutarHab, js/12: en turno ajeno cobra el doble). */
// Los creeps del mapa con una habilidad Flash propia lista: [{id (token), t, sc, h}].
function flashCreepListos(){
  if(!soyGM) return [];
  const out = [];
  for(const [id, t] of tokens.entries()){
    if(t.tipo !== 'creep') continue;
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc || num(sc.hp) <= 0) continue;
    (sc.habilidades || []).forEach(h => {
      if(!h || !h.flash || h.malDeOjo || h.desarmar) return;
      let motivo = '';
      try{ motivo = CreepCalculo.bloqueoHab(sc, h) || ''; }catch(e){}
      if(!motivo) out.push({id, t, sc, h});
    });
  }
  return out;
}
function renderFlashCreepBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.bendecir) return;
  const l = flashCreepListos();
  if(!l.length){ Flotantes.bendecir(null); return; }
  Flotantes.bendecir({mostrar: true, sub: l.length === 1 ? `${nombreDe(l[0].t)}: ${l[0].h.nombre}` : `${l.length} habilidades Flash de creeps`, alClic: () => abrirFlashCreep()});
}
setInterval(() => { try{ renderFlashCreepBoton(); }catch(e){} }, 1500);

// Quién ataca en el duelo abierto ahora (el último sin resolver): su golpe usa la bendición si llega antes de tirar el daño (js/13 cargaAlGolpeAbierto).
async function flashCreepAtacanteDelDuelo(){
  try{
    const q = await fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(5).get();
    const d = q.docs.map(x => x.data()).find(x => x && !x.hab && (x.estado === 'esperando' || x.estado === 'empate'));
    return d && d.atacante ? {tokenId: d.atacante.tokenId, danoTirado: !!d.dano} : null;
  }catch(err){ return null; }
}
// Lo que cuesta ahora: lo de la habilidad, el doble en turno ajeno (la regla del Flash).
function flashCreepCosto(c){
  const ajeno = modoMapa === 'combate' && esSuTurno(c.id) === false;
  const sp = CreepCalculo.modoSP(c.sc) ? CreepCalculo.costoSpHab(c.sc, c.h) : 0, cd = num(c.h.cd), k = ajeno ? 2 : 1;
  return {ajeno, txt: CreepCalculo.modoSP(c.sc) ? `${fmt(sp * k)} SP` : `cooldown ${fmt(cd * k)}`};
}
// A quién se la puede dar: él y sus aliados (creeps vivos, no bajo tierra) dentro de su Rango.
function flashCreepObjetivos(c){
  const rng = num((rangoDeToken(c.t) || {}).rng), out = [];
  for(const [id, t] of tokens.entries()){
    if(t.tipo !== 'creep' || t.bajoTierra) continue;
    const sc = id === c.id ? c.sc : creepPrivadoDe(t.fichaId);
    if(!sc || num(sc.hp) <= 0) continue;
    if(id !== c.id && (distanciaHex(c.t, t) > rng || (c.h.blink && c.h.blink.soloYo))) continue;   // ✨ el Parpadeo: solo él (2026-10-26)
    out.push({id, t, mismo: id === c.id});
  }
  return out;
}
async function abrirFlashCreep(){
  const listos = flashCreepListos();
  if(!listos.length) return;
  const duelo = await flashCreepAtacanteDelDuelo(), opciones = [];
  listos.forEach(c => flashCreepObjetivos(c).forEach(o => opciones.push({c, o, ataca: !!(duelo && duelo.tokenId === o.id)})));
  opciones.sort((a, b) => (b.ataca - a.ataca) || (a.o.mismo - b.o.mismo));
  if(!opciones.length){ AvisoCombate.mostrar({icono: '✨', titulo: 'Flash de un creep', texto: 'Ningún aliado está dentro de su Rango.'}); return; }
  const botones = opciones.slice(0, 10).map(({c, o, ataca}) => {
    const k = flashCreepCosto(c);
    return {fila: true, texto: `${nombreDe(c.t)}: ${c.h.nombre} → ${o.mismo ? 'a sí mismo' : nombreDe(o.t)}${ataca ? ' ⚔' : ''}`,
      detalle: `${ataca ? (duelo.danoTirado ? 'ataca en el duelo abierto, pero ya tiró el daño: le sirve para su próximo ataque · ' : 'ataca en el duelo abierto: la usa en este golpe (todavía no tiró el daño) · ') : ''}${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`,
      alClic: () => { AvisoCombate.cerrar(); flashCreepUsar(c, o.id); }};
  });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '✨', titulo: 'Flash de un creep', botones, texto: '¿Qué creep la usa y a quién?'});
}
// Se ejecuta como desde sus Acciones, con el objetivo ya elegido (ac.objetivoFijo, como el Mal de ojo).
async function flashCreepUsar(c, objetivoId){
  const fichaId = String(c.t.fichaId);
  abrirAcciones(fichaId);
  for(let i = 0; i < 40 && !(ac && ac.creepId === fichaId); i++) await new Promise(r => setTimeout(r, 150));
  if(!(ac && ac.creepId === fichaId)){ toast(`${c.h.nombre}: no se pudieron abrir las Acciones del creep`); return; }
  ac.objetivoFijo = objetivoId;
  await acEjecutarHab(creepPrivadoDe(fichaId) || c.sc, c.h.id);
}
