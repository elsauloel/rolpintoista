// js/26-escudos.js — los escudos y orbes de Buena calidad (2026-10-06, dueño: «programá todas las mecánicas nuevas que hagan falta»).
/* Muro de escudos (`muroescudos`): Defensa +N para quien recibe el golpe si tiene al lado (a 1 casillero, del mismo bando) un aliado con un
   escudo equipado (un orbe no cuenta). Lo suma el daño (js/10, junto al Guardián) solo cuando la Defensa cuenta; la Crónica lo cuenta.
   Empujón (`empujon`): un golpe cuerpo a cuerpo de un arma que el defensor BLOQUEÓ (anulado) deja al atacante con Demora (dueloDemora, js/13).
   Lo hace la pantalla del GM al ver resolverse el duelo (Duelo.escuchar → `bloqueado`).
   Orbe del custodio (`orbeCustodio` en el orbe): al usar una varita, un aliado al lado recibe Vida extra N hasta su próximo turno (una vez
   por turno). Si hay varios al lado, se elige en un cartel.
   Orbe de absorción (`orbeAbsorcion`): el daño mágico o elemental que llega a la vida le devuelve N SP, una vez por turno (personajes; js/10). */

const bandoDe = x => x.tipo === 'creep' ? 'creep' : 'pj';
// Los aliados AL LADO de un token (mismo bando: creeps con creeps; personajes e invocaciones entre sí) → [{id, t}].
function aliadosAlLado(t){
  if(!t || t.col === undefined || t.fila === undefined) return [];
  const out = [];
  tokens.forEach((x, id) => {
    if(!x || x === t || !x.fichaId || x.fichaId === t.fichaId || bandoDe(x) !== bandoDe(t) || x.col === undefined) return;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: x.col, fila: x.fila}) > 1) return;
    out.push({id, t: x});
  });
  return out;
}
// ¿Lleva un escudo de verdad equipado? (creep: su equipo, solo el GM; invocación y personaje: lo que publica la ficha)
function tieneEscudo(x){
  if(x.tipo === 'creep'){ const sc = soyGM ? creepPrivadoDe(x.fichaId) : null; return !!sc && (sc.equipo || []).some(i => Combatiente.esEscudo(i)); }
  const ri = resumenDeInv(x);
  if(ri) return !!ri.conEscudo;
  const f = fichasPub.get(x.fichaId);
  return !!(f && f.resumen && f.resumen.conEscudo);
}
function muroDe(t){
  const val = Math.max(0, Math.round(statPiesDe(t, 'muroescudos')));
  if(!val) return null;
  const a = aliadosAlLado(t).find(a => tieneEscudo(a.t));
  return a ? {val, nombre: nombreDe(a.t)} : null;
}
function muroAviso(t, m){
  if(!m || typeof momentoAbrir !== 'function') return;
  momentoAbrir({tipo: 'guardian', icono: '🛡', titulo: `Muro de escudos: ${nombreDe(t)} con ${m.nombre}`, resultado: `+${m.val} Defensa contra el golpe, por cubrirse junto al escudo de ${m.nombre}.`,
    estado: 'listo', datos: {...(t.tipo !== 'creep' && t.duenoUid ? {paraUid: t.duenoUid} : {}), chico: true, aviso: true}});
}

// Empujón: el GM, al ver un duelo bloqueado (ver arriba).
async function dueloEmpujon(d){
  if(!d || d.hab || !d.ataque || d.ataque.rango || !d.defensor || !d.atacante) return;
  const def = tokens.get(d.defensor.tokenId);
  if(!def || statPiesDe(def, 'empujon') <= 0 || !tokens.get(d.atacante.tokenId)) return;
  const r = await dueloDemora(d.atacante.tokenId);
  const quien = d.defensor.nombre || nombreDe(def), a = d.atacante.nombre || 'el atacante';
  mesaLinea(`🛡 Empujón: ${quien} bloqueó el golpe y empujó a ${a} — ${r.nota || ''}`);
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'guardian', icono: '🛡', titulo: `Empujón de ${quien}`, resultado: `${a} queda con Demora: ${r.nota || ''}`, estado: 'listo', datos: {chico: true}});
}

// Orbe del custodio: o = {fichaId, tipo: 'pj' | 'creep', n, orbe, quien}.
async function orbeCustodioMapa(o){
  const origen = [...tokens.values()].find(t => t && t.fichaId === o.fichaId && bandoDe(t) === o.tipo);
  if(!origen){ mesaLinea(`🔮 ${o.orbe}: el token no está en este mapa — la Vida extra ${o.n} para un aliado al lado, a mano`); return; }
  const lista = aliadosAlLado(origen);
  if(!lista.length){ mesaLinea(`🔮 ${o.orbe}: no hay ningún aliado al lado de ${nombreDe(origen)} para cubrir`); return; }
  const el = lista.length === 1 ? lista[0] : await new Promise(res => {
    let listo = false;
    const fin = x => { if(listo) return; listo = true; AvisoCombate.cerrar(); res(x); };
    AvisoCombate.mostrar({icono: '🔮', titulo: `${o.orbe}: ¿a quién cubrís?`, texto: `Vida extra ${o.n} hasta su próximo turno, a un aliado al lado.`,
      botones: [...lista.map(a => ({texto: nombreDe(a.t), alClic: () => fin(a)})), {texto: 'A nadie', sec: true, alClic: () => fin(null)}], alCerrar: () => fin(null)});
  });
  if(!el) return;
  const spec = {nombre: 'Vida extra', turnos: 1, escudoMagico: o.n};
  try{
    if(el.t.tipo === 'creep') await modificarCreep(el.t.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec));
    else{
      const f = fichasPub.get(String(el.t.fichaId).split(SEP_INVOCACION)[0]);
      await EstadosAplicar.encolarPj({fichaId: el.t.fichaId, duenoUid: (f && f.duenoUid) || el.t.duenoUid, spec, origen: `${o.quien || ''} (${o.orbe})`.trim()});
    }
    mesaLinea(`🔮 ${o.orbe}: ${nombreDe(el.t)} recibe Vida extra ${o.n} hasta su próximo turno`);
  }catch(err){ console.error('Orbe del custodio:', err); toast(`${o.orbe}: no se pudo dar la Vida extra — a mano`); }
}
