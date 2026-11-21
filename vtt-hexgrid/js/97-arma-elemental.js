// js/97-arma-elemental.js — 🔥 El Arma elemental, sin cuadro de duelo y en UN arma (2026-11-04, dueño: «hacé eso, y para las dos armas, la opción b»).
//
// Antes: usarla abría un duelo «Bizzante → Bizzante» (no hay nada que tirar) y el estado llegaba recién al resolverlo; el estado valía para
// cualquier arma y no decía cuál. Ahora, al elegir a quién (js/13, la elección del objetivo):
//   1. si el objetivo tiene más de un arma en la mano (sin escudos ni talismanes), quien la usa elige a cuál; con una, va a esa;
//   2. el estado se aplica al instante, con el arma en el nombre («🔥 Arma ígnea: Lanza corta») y `armaDe` (solo suma con esa arma:
//      Combatiente.estadoAplicaAlArma);
//   3. un aviso para quien la recibe («🔥 Tu Lanza corta arde 3 turnos: +1d6 de fuego por golpe») y la línea en la Mesa.
// Los costos ya los cobró la habilidad antes de elegir el objetivo (FichaAcciones / CreepAcciones).

// ¿El ataque es un Arma elemental (todos sus efectos son estados de arma elemental y no tira nada)?
function armaElementalEsHab(ataque){
  const h = ataque && ataque.hab;
  if(!h || h.tira || h.dano) return false;
  const efs = Array.isArray(h.efectos) ? h.efectos : [];
  return efs.length > 0 && efs.every(ef => { const sp = typeof Duelo !== 'undefined' && Duelo.specDeEfecto ? Duelo.specDeEfecto(ef) : ef; return !!Combatiente.armaElementalDe(sp && sp.nombre ? sp : ef); });
}
// Las armas en la mano de un token → [{id, nombre}] (un creep: su equipo; un personaje: lo que publica su ficha; una invocación: ninguna).
function armaElementalArmasDe(t){
  if(!t) return [];
  try{
    if(t.tipo === 'creep' && t.fichaId){
      const sc = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null;
      return sc ? Combatiente.armasDeMano(sc).filter(a => a && !a.natural).map(a => ({id: String(a.id || ''), nombre: String(a.nombre || '')})) : [];
    }
    if(t.tipo === 'pj' && !String(t.fichaId || '').includes(typeof SEP_INVOCACION !== 'undefined' ? SEP_INVOCACION : '§§')){
      const v = typeof vinculo === 'function' ? vinculo(t) : null, r = v && v.resumen;
      return Array.isArray(r && r.armasMano) ? r.armasMano.filter(a => a && a.nombre) : [];
    }
  }catch(err){ console.error('Arma elemental: las armas', err); }
  return [];
}
// La aplica directo. → true si la aplicó; false si se canceló la elección del arma (la elección del objetivo vuelve a preguntar).
async function armaElementalDirecto(yo, mio, t, ataque){
  const ef0 = (ataque.hab.efectos || [])[0] || {};
  const sp0 = (typeof Duelo !== 'undefined' && Duelo.specDeEfecto ? Duelo.specDeEfecto(ef0) : null) || {nombre: ef0.nombre};
  const def = Combatiente.armaElementalDe(sp0) || Combatiente.armaElementalDe(ef0);
  if(!def) return false;
  const nom = nombreDe(t), quien = (yo && yo.nombre) || (mio ? nombreDe(mio) : 'Alguien');
  const armas = armaElementalArmasDe(t);
  let arma = armas[0] || null;
  if(armas.length > 1){
    const v = await Confirmar.elegir(`${def.icono} ¿A qué arma de ${nom} le ponés el ${def.nombre.toLowerCase()}? Suma solo cuando pega con esa.`, {titulo: 'Arma elemental', icono: def.icono, no: 'Cancelar',
      opciones: armas.map((a, i) => ({valor: String(i), texto: a.nombre, detalle: i === 0 ? 'la que tiene en la mano principal' : ''}))});
    if(v === null || v === undefined) return false;
    arma = armas[Number(v)] || armas[0];
  }
  const nombre = Combatiente.nombreArmaElemental(def.estado, arma && arma.nombre);
  const spec = {...sp0, nombre, ...(arma ? {armaDe: {id: arma.id, nombre: arma.nombre}} : {})};
  const d = {id: 'arma-elemental-' + Date.now(), hab: ataque.hab, ataque,
    atacante: {nombre: quien, tokenId: mio ? mio.id : '', tipo: mio ? mio.tipo : '', ref: mio ? String(mio.fichaId || '') : ''},
    defensor: {nombre: nom, tokenId: t.id, tipo: t.tipo, ref: String(t.fichaId || '')}};
  let r = null;
  try{ r = await dueloAplicarEfectoBase(d, {nombre, spec}); }catch(err){ console.error('Arma elemental: no se pudo aplicar', err); r = {manual: true, nota: 'aplicalo a mano'}; }
  try{ if(typeof cargaAlGolpeAbierto === 'function') await cargaAlGolpeAbierto(t, t.id, nombre); }catch(e){}
  const turnos = Math.round(num((EstadosAplicar.presetPorNombre(def.estado) || {}).turnos)) || 3;
  const queArma = arma ? arma.nombre : 'su arma';
  const efecto = `+${def.que.replace(/^\+/, '')} por golpe`;
  const mismo = mio && mio.id === t.id;
  const ok = r && !r.manual && !r.sinEfecto;
  try{ if(yo && yo.ref && typeof Duelo !== 'undefined' && Duelo.pagoHab) Duelo.pagoHab(yo.ref, null); }catch(e){}   // ya se usó: no queda para devolver
  try{ mesaLinea(`${def.icono} ${quien} ${mismo ? 'encanta su' : `le encanta a ${nom} su`} ${arma ? queArma : 'arma'}: ${def.nombre.toLowerCase()} ${turnos} turnos — ${efecto}${ok ? '' : ` (${(r && r.nota) || 'a mano'})`}`, 'recordatorio'); }catch(e){}
  if(ok){
    const para = t.tipo === 'creep' ? (fbUsuario && fbUsuario.uid) : t.duenoUid;
    try{
      momentoAbrir({tipo: 'buff', icono: def.icono, titulo: mismo ? `${quien} encantó su ${queArma}` : `${quien} le encantó el arma a ${t.oculto ? 'alguien' : nom}`,
        resultado: `${def.icono} ${mismo || t.tipo !== 'creep' ? `${t.tipo === 'creep' ? `La ${queArma} de ${nom}` : `Tu ${queArma}`}` : `La ${queArma} de ${nom}`} arde ${turnos} turnos: ${efecto}. Solo con esa arma.`, estado: 'listo',
        datos: para ? {paraUid: para, aviso: true, boton: 'Entendido', veredicto: {tono: 'bueno', grande: nombre, chico: `${def.icono} ${t.tipo === 'creep' ? `La ${queArma} de ${nom}` : `Tu ${queArma}`} arde ${turnos} turnos: ${efecto}`}} : {}});
    }catch(err){ console.error('Arma elemental: el aviso', err); }
  }
  return true;
}
