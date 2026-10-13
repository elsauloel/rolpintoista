/* 🏹 PROYECTIL PERFORANTE (Shooter, 2026-10-13, dueño; docs/clases-borrador.md). Un disparo con un arma a distancia que atraviesa: pegue o no
   al primero, sigue derecho por la misma línea del disparo y le pega al primer token que haya detrás —aliado incluido— hasta el Rango de quien
   disparó; un Sólido o una pared lo frenan, y un caído o lo que esta pantalla no ve no lo para. El segundo se defiende contra la MISMA tirada
   de PdG (`pdgCompartido`, como los objetivos de un hechizo de área) y recibe el daño entero, que se tira de nuevo, pero sin los efectos
   especiales: ni los del arma, ni los de la flecha, ni los del crítico (`ataque.sinEfectos`; la flecha no viaja). Lo lanza la pantalla de quien
   disparó (hook disparoResuelto de js/14), una sola vez: el segundo duelo ya no lleva `perforante`. */
const perforanteHechos = new Set();   // ids de los duelos que ya siguieron (no lanzar dos veces)
function perforanteSiguiente(tA, tD, alcance, ignorar){
  const solidos = solidosSet(), dist = distanciaHex(tA, tD);
  let previa = {col: tA.col, fila: tA.fila};
  const linea = flechaLinea(tA, tD, alcance);
  for(let i = 0; i < linea.length; i++){
    const c = linea[i];
    if(solidos.has(nbPack(c.col, c.fila)) || (typeof paredCorta === 'function' && paredCorta(previa, c))) return {frena: true};
    previa = c;
    if(i + 1 <= dist) continue;   // hasta el blanco: el camino del primer disparo
    for(const [id, t] of tokens.entries()){
      if(ignorar.has(id) || t.tipo === 'elemento' || t.col !== c.col || t.fila !== c.fila || !tiroTokenVisible(t)) continue;
      if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) continue;   // pasa por encima de un caído
      return {id, t};
    }
  }
  return null;
}
async function perforanteResuelto(d){
  const a = d && d.ataque;
  if(!a || !a.perforante || d.hab || !d.id || perforanteHechos.has(d.id)) return;
  perforanteHechos.add(d.id);
  const quien = (d.atacante && d.atacante.nombre) || 'Alguien', blanco = (d.defensor && d.defensor.nombre) || 'su blanco';
  const nombre = a.habNombre || 'Proyectil perforante';
  const idA = d.atacante.tokenId, idD = d.defensor.tokenId, tA = tokens.get(idA), tD = tokens.get(idD);
  if(!tA || !tD){ mesaLinea(`🏹 El ${nombre} de ${quien} atraviesa a ${blanco}: el segundo objetivo va a mano (no encontré los tokens en el mapa)`, 'recordatorio'); return; }
  if(!d.pdg){ mesaLinea(`🏹 El ${nombre} de ${quien} no tiene una tirada de PdG para seguir: el segundo objetivo va a mano`, 'recordatorio'); return; }
  const dist = distanciaHex(tA, tD);
  let alcance = dist;
  try{ alcance = Math.max(dist, Math.round(num(rangoDeToken(tA).rng)) || dist); }catch(e){}
  const sig = perforanteSiguiente(tA, tD, alcance, new Set([idA, idD]));
  if(!sig || sig.frena){
    mesaLinea(`🏹 El ${nombre} de ${quien} atravesó a ${blanco} y ${sig && sig.frena ? 'se frenó contra un obstáculo' : 'siguió de largo: no había nadie detrás, dentro de su Rango'}`, 'recordatorio');
    return;
  }
  const otro = sig.t, nombreOtro = nombreDe(otro);
  mesaLinea(`🏹 El ${nombre} de ${quien} atravesó a ${blanco} y sigue hacia ${nombreOtro}: misma tirada de PdG, daño entero, sin efectos especiales`, 'recordatorio');
  try{
    await Duelo.crear({yo: {ref: d.atacante.ref, tipo: d.atacante.tipo, nombre: d.atacante.nombre, uid: d.atacante.uid},
      ataque: {tipo: 'habilidad-arma', habNombre: `${nombre} (atravesó a ${blanco})`, armaId: a.armaId || '', armaNombre: a.armaNombre || '', tipoDado: num(a.tipoDado),
        rango: !!a.rango, sinParry: !!a.sinParry, mods: {pdg: 0, dados: num(a.mods && a.mods.dados), fijo: num(a.mods && a.mods.fijo)}, efectos: [], sinEfectos: true,
        ...(num(a.perfora) > 0 ? {perfora: num(a.perfora)} : {})},
      pdgCompartido: d.pdg},
      {id: sig.id, nombre: nombreOtro, tipo: otro.tipo, fichaId: otro.fichaId, duenoUid: otro.duenoUid}, idA);
  }catch(err){
    console.error('No se pudo seguir el Proyectil perforante:', err);
    mesaLinea(`🏹 El ${nombre} de ${quien} sigue hacia ${nombreOtro}, pero no se pudo abrir el duelo: resolvelo a mano con la misma tirada de PdG (${num(d.pdg.total)})`, 'alerta-roja');
  }
}
