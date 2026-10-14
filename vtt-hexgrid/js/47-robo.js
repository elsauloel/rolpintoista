/* 🫳 Robar (2026-10-14, dueño: «tendríamos que desarrollar el robo, puede ser divertido»). Una habilidad con el efecto «Robo» en su
   Ejecución (dirigida, pegado al objetivo; el Ladrón del monte: Sigilo contra Percepción) le saca al personaje una unidad al azar de su
   cinturón (lo que publica su ficha: `resumen.cinturon`) y se la pasa al cinturón del ladrón: si lo matan, vuelve con el botín; si escapa, se
   la lleva; si es algo que se usa, la puede usar. A la ficha del robado le llega el aviso «Robo» (`EstadosAplicar.encolarPj`, item = el
   nombre) y descuenta esa unidad (`FichaAcciones.aplicarEstadoRecibido`). Después el ladrón se aleja hasta 3 casilleros sin ataque de
   oportunidad (el cartel del dodge roll, `dodgeBanner.robo`). Si viene en sigilo o por la espalda, +2 a su tirada (`roboBono`, js/13).
   Hoy: un creep le roba a un personaje. Un personaje que le roba a un creep, y robar oro si no hay nada en el cinturón, pendientes. */
const ROBO_HUIDA = 3;
const esRobo = hab => !!(hab && (hab.efectos || []).some(e => e && /^robo$/i.test(String(e.nombre || (e.spec && e.spec.nombre) || '').trim())));
// ¿Está en el punto ciego del otro? (como porLaEspalda, js/13, pero sin pedir sigilo)
function enPuntoCiego(atq, def){
  if(!atq || !def) return false;
  const k = ((Math.round(num(def.rotacion || 0) / 60) % 6) + 6) % 6;
  const rot = k * 60 * Math.PI / 180, bx = Math.sin(rot), by = -Math.cos(rot);
  const a = hexCentro(atq.col, atq.fila), d = hexCentro(def.col, def.fila);
  const vx = a.x - d.x, vy = a.y - d.y, largo = Math.hypot(vx, vy);
  if(!largo) return false;
  return Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / largo))) * 180 / Math.PI < VISION_CUNA_CIEGA - 1;
}
// El +2 del ladrón que viene en sigilo o por la espalda: una copia del ataque con la tirada corregida (o el mismo, si no corresponde).
function roboBono(ataque, mio, t){
  if(!ataque || !esRobo(ataque.hab) || !ataque.hab.tira || !ataque.hab.tira.stat || !mio || !t) return ataque;
  const porque = enSigilo(mio) ? 'en sigilo' : enPuntoCiego(mio, t) ? 'por la espalda' : '';
  if(!porque) return ataque;
  const tira = {...ataque.hab.tira, bono: num(ataque.hab.tira.bono) + 2, etq: `${ataque.hab.tira.etq || 'Tirada'} (+2 ${porque})`.slice(0, 30)};
  return {...ataque, hab: {...ataque.hab, tira}};
}
async function roboAplicar(d, t){
  if(t.tipo !== 'pj' || String(t.fichaId || '').includes(SEP_INVOCACION)) return {manual: true, nota: 'robarle a un creep o a una invocación, por ahora a mano'};
  const f = fichasPub.get(t.fichaId), cin = f && f.resumen && Array.isArray(f.resumen.cinturon) ? f.resumen.cinturon : null;
  if(!cin) return {manual: true, nota: `no se ve el cinturón de ${nombreDe(t)} (que abra su ficha una vez): el robo, a mano`};
  const bolsa = cin.flatMap(x => Array(Math.max(0, Math.min(20, Math.round(num(x && x.u))))).fill(String((x && x.n) || '')).filter(Boolean));
  // Lo ya robado que su ficha todavía no descontó (el aviso sigue pendiente): no se puede robar dos veces la misma unidad.
  try{
    const pend = await fbDb.collection(fbRutaCampana('estados')).where('fichaId', '==', String(t.fichaId)).get();
    pend.docs.forEach(doc => {
      const x = doc.data(); if(x.aplicada) return;
      let sp = {}; try{ sp = JSON.parse(x.spec || '{}'); }catch(e){}
      const i = /^robo$/i.test(String(sp.nombre || '')) ? bolsa.indexOf(String(sp.item || '')) : -1;
      if(i >= 0) bolsa.splice(i, 1);
    });
  }catch(err){ console.error('No se pudieron mirar los robos pendientes:', err); }
  if(!bolsa.length){
    momentoAbrir({tipo: 'robo', icono: '🫳', titulo: `${d.atacante.nombre} intentó robarle a ${nombreDe(t)}`, resultado: 'No tenía nada en el cinturón.', estado: 'listo'});
    return {nota: `${nombreDe(t)} no tenía nada en el cinturón`};
  }
  const nombre = bolsa[Math.floor(Math.random() * bolsa.length)];
  if(d.atacante.tipo === 'creep'){
    const cat = typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE.find(i => i.nombre === nombre && i.tipoItem === 'consumibles') : null;
    const base = cat || {nombre, tipoItem: 'consumibles', consumible: true, detalle: `Robado a ${nombreDe(t)}.`};
    try{
      await modificarCreep(d.atacante.ref, sc => {
        const r = CreepAcciones.alCinturon(sc, base, 1);
        if(r.error){   // con el cinturón lleno, igual se lo lleva (en los bolsillos)
          sc.cinturon = Array.isArray(sc.cinturon) ? sc.cinturon : [];
          sc.cinturon.push({...structuredClone(base), id: 'rb' + Math.random().toString(36).slice(2, 9), consumible: true, unidades: 1});
        }
        return {};
      });
    }catch(err){ console.error('No se pudo pasar lo robado al ladrón:', err); return {manual: true, nota: `no se pudo pasar ${nombre} al ladrón: hacelo a mano`}; }
  }
  try{ await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Robo', item: nombre}, origen: d.atacante.nombre || 'Un ladrón'}); }
  catch(err){ console.error('No se pudo avisar el robo:', err); return {manual: true, nota: `sacale ${nombre} del cinturón a mano`}; }
  momentoAbrir({tipo: 'robo', icono: '🫳', titulo: `${d.atacante.nombre} le robó a ${nombreDe(t)}`, resultado: `Se llevó: ${nombre}. Si lo atrapan, lo recuperan.`, estado: 'listo'});
  roboHuida(d);
  return {nota: `le robó ${nombre}`};
}
// La huida: el cartel del dodge roll para el ladrón (en la pantalla que aplica el efecto: la del GM, que maneja al creep).
function roboHuida(d){
  const tid = d.atacante && d.atacante.tokenId;
  if(!tid || !tokens.has(tid)) return;
  seleccionar(tid);
  dodgeBanner = {id: d.id, tokenId: tid, nombre: d.atacante.nombre, libre: true, robo: true};
  renderDodgeBanner();
}
