/* ---------- 🧿 Mal de ojo (2026-10-21, dueño; el Debuffer de los creeps) ----------
   El Enyetar de los personajes (js/38), para creeps: después de que un personaje tira, el creep le echa el mal de ojo (su PdG.Esp contra la Res.Esp
   del personaje, a su Rango y a la vista); si gana, esa tirada se repite y queda la peor, y el duelo se vuelve a resolver (el efecto «Mal de ojo»,
   js/13 → enyetarAplicar). Es Flash (dueño: «mal de ojo tiene que tener flash»): en turno ajeno cuesta el doble (el SP en modo SP; el cooldown en
   modo cooldown). El GM ve el botón fijo 🧿 (Flotantes.malDeOjo) mientras algún creep del mapa la tenga lista: arriba, donde están la moneda y los
   demás, y al costado del cuadro del duelo cuando está abierto (comun/flotantes.js los muda solos). */
// Los creeps del mapa con Mal de ojo: [{id (token), t, sc, h, motivo}] (`motivo` = por qué no se puede usar ahora: cooldown, sin SP…).
function malDeOjoCreeps(){
  if(!soyGM || modoMapa !== 'combate') return [];
  const out = [];
  for(const [id, t] of tokens.entries()){
    if(t.tipo !== 'creep') continue;
    const sc = creepPrivadoDe(t.fichaId);
    if(!sc || num(sc.hp) <= 0) continue;
    const h = (sc.habilidades || []).find(x => x && x.malDeOjo);
    if(!h) continue;
    let motivo = '';
    try{ motivo = CreepCalculo.bloqueoHab(sc, h) || ''; }catch(e){}
    out.push({id, t, sc, h, motivo});
  }
  return out;
}
function renderMalDeOjoBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.malDeOjo) return;
  const l = malDeOjoCreeps().filter(x => !x.motivo);
  if(!l.length){ Flotantes.malDeOjo(null); return; }
  Flotantes.malDeOjo({mostrar: true, sub: l.length === 1 ? `${nombreDe(l[0].t)}: que un personaje repita una tirada y se quede con la peor` : `${l.length} creeps pueden echarlo`,
    alClic: () => abrirMalDeOjo()});
}
setInterval(() => { try{ renderMalDeOjoBoton(); }catch(e){} }, 1500);

// Lo que cuesta ahora: el de la habilidad, el doble en turno ajeno (la regla del Flash).
function malDeOjoCosto(c){
  const ajeno = esSuTurno(c.id) === false;
  const sp = CreepCalculo.modoSP(c.sc) ? CreepCalculo.costoSpHab(c.sc, c.h) : 0, cd = num(c.h.cd);
  return {ajeno, sp: sp * (ajeno ? 2 : 1), cd: cd * (ajeno ? 2 : 1), txt: CreepCalculo.modoSP(c.sc) ? `${fmt(sp * (ajeno ? 2 : 1))} SP` : `cooldown ${fmt(cd * (ajeno ? 2 : 1))}`};
}
async function abrirMalDeOjo(){
  const listos = malDeOjoCreeps().filter(x => !x.motivo), opciones = [];
  for(const c of listos){
    let lista = [];
    try{ lista = await enyetarCandidatos(c.t); }catch(err){ console.error('Mal de ojo: no se pudieron ver los duelos', err); }
    lista.forEach(o => opciones.push({c, o}));
  }
  if(!opciones.length){
    AvisoCombate.mostrar({icono: '🧿', titulo: 'Mal de ojo', texto: 'No hay ninguna tirada reciente de un personaje que un creep con Mal de ojo tenga a su alcance y a la vista.'});
    return;
  }
  const botones = opciones.slice(0, 8).map(({c, o}) => { const k = malDeOjoCosto(c); return {fila: true, texto: `${nombreDe(c.t)} → ${o.nombre} · ${o.etq} (${fmt(o.total)})`,
    detalle: `en el duelo contra ${o.contra} · su PdG.Esp contra la Res.Esp de ${o.nombre}; si gana, repite y queda la peor · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`,
    alClic: () => { AvisoCombate.cerrar(); malDeOjoUsar(c, o.tokenId); }}; });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🧿', titulo: 'Mal de ojo', botones, texto: '¿A qué tirada de un personaje le echa el mal de ojo?'});
}
// Ejecuta la habilidad del creep contra ese personaje, sin marcarlo en el mapa (ac.objetivoFijo, js/12); en turno ajeno, cobra el doble.
async function malDeOjoUsar(c, objetivoId){
  const k = malDeOjoCosto(c), fichaId = String(c.t.fichaId);
  abrirAcciones(fichaId);
  for(let i = 0; i < 40 && !(ac && ac.creepId === fichaId); i++) await new Promise(r => setTimeout(r, 150));
  if(!(ac && ac.creepId === fichaId)){ toast('Mal de ojo: no se pudieron abrir las Acciones del creep'); return; }
  const sc = creepPrivadoDe(fichaId) || c.sc, spAntes = num(CreepCalculo.spActual ? CreepCalculo.spActual(sc) : sc.sp);
  ac.objetivoFijo = objetivoId;
  await acEjecutarHab(sc, c.h.id);
  if(!k.ajeno) return;
  // El Flash en turno ajeno: la habilidad cobró lo de siempre; se cobra otro tanto (una vez que se cobró lo primero).
  for(let i = 0; i < 30; i++){
    const s2 = creepPrivadoDe(fichaId), h2 = s2 && (s2.habilidades || []).find(x => x.id === c.h.id);
    const cobro = CreepCalculo.modoSP(s2) ? num(CreepCalculo.spActual ? CreepCalculo.spActual(s2) : s2.sp) < spAntes : !!(h2 && num(h2.cdActual) > 0);
    if(cobro) break;
    await new Promise(r => setTimeout(r, 200));
  }
  try{
    await modificarCreep(fichaId, s => {
      const hh = (s.habilidades || []).find(x => x.id === c.h.id);
      if(CreepCalculo.modoSP(s)) s.sp = Math.max(0, num(CreepCalculo.spActual ? CreepCalculo.spActual(s) : s.sp) - CreepCalculo.costoSpHab(s, c.h));
      else if(hh) hh.cdActual = Math.max(num(hh.cdActual), num(hh.cd) * 2);
      return {};
    });
    mesaLinea(`⚡ ${nombreDe(c.t)}: Mal de ojo en turno ajeno (Flash) — cuesta el doble: ${k.txt}`, 'recordatorio');
  }catch(err){ console.error('Mal de ojo: no se pudo cobrar el doble', err); toast(`✋ Cobrale a mano el doble del Mal de ojo a ${nombreDe(c.t)} (${k.txt})`); }
}
