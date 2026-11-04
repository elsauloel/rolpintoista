// js/98-vida-en-cero.js — 💔 Un personaje que queda en 0 de vida desde el mapa (2026-11-04).
//
// Dueño: «Bizzante quedó en 0 HP (se puso −N en el recuadro de HP directo, hasta quedar en 0) y no se murió, ni se activó su pacto».
// La revisión de la vida en 0 (la Llama de Fénix, el Pacto, el Ankh del cinturón y, si nada lo salva, inconsciente con 5 turnos para morir:
// FichaAcciones.revisarAnkh + revisarMuerte) la hacía solo la ficha de su dueño cuando ÉL hacía algo; «HP directo» (cambiarVidaPj, js/09)
// escribe la vida tal cual, y un golpe (danioPj, js/10) revisaba el Pacto y la Llama pero no dejaba al personaje inconsciente.
// Ahora, cualquiera sea el camino: si un personaje tiene 0 de vida y su resumen todavía no dice que está caído (`muerto`) ni muerto de
// verdad (`muertoDef`), la pantalla de quien lo maneja (su dueño, o el GM con 🎮 el control: bnManejo) corre esa misma revisión y la guarda.
// Las invocaciones no: su vida en 0 la resuelve su dueño (desaparecen o no, como siempre).

const vidaCeroEnCurso = new Set();
const vidaCeroVisto = new Map();     // fichaId → desde cuándo está en 0 sin marcar (se espera un momento: la ficha abierta puede resolverlo antes)
const vidaCeroIntento = new Map();   // fichaId → cuándo se probó por última vez (no reintentar en 30 s si el resumen no cambió)

async function vidaCeroRevisar(fichaId){
  if(vidaCeroEnCurso.has(fichaId) || Date.now() - (vidaCeroIntento.get(fichaId) || 0) < 30000) return;
  vidaCeroEnCurso.add(fichaId);
  vidaCeroIntento.set(fichaId, Date.now());
  let salvado = '', cayo = false, nombre = '';
  try{
    await editarPersonajeMapa(fichaId, S => {
      nombre = ((S.meta && S.meta.nombre) || '').trim() || 'Tu personaje';
      if(num(S.hp) > 0 || (S.muerto && (S.muerto.activo || S.muerto.definitivo))) return false;   // ya lo resolvió otra pantalla
      salvado = FichaAcciones.revisarAnkh(S) || '';
      const r = FichaAcciones.revisarMuerte(S);
      cayo = !!(r && r.cayo);
      return true;
    });
  }catch(err){ console.error('La vida en 0: no se pudo revisar', err); }
  finally{ vidaCeroEnCurso.delete(fichaId); vidaCeroVisto.delete(fichaId); }
  if(salvado){
    const txt = salvado === 'El Pacto' ? `😇 ${nombre} zafó de morir: lo salvó el pacto (vuelve Titilando)`
      : salvado === 'Llama de Fénix' ? `🔥 ${nombre}: ¡la Llama de Fénix lo levanta con toda la vida, Titilando!`
      : `☥ ${nombre}: ¡${salvado} se activó solo y revive!`;
    toast(txt);
    try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
    try{ momentoAbrir({tipo: 'buff', icono: salvado === 'El Pacto' ? '😇' : salvado === 'Llama de Fénix' ? '🔥' : '☥', titulo: `${nombre} no cae`, resultado: txt, estado: 'listo'}); }catch(e){}
  }else if(cayo){
    try{ mesaLinea(`💔 ${nombre} quedó en 0 de vida: inconsciente (5 turnos para morir)`, 'recordatorio'); }catch(e){}
  }
}

setInterval(() => {
  try{
    if(typeof fichasPub === 'undefined' || typeof bnManejo !== 'function' || typeof editarPersonajeMapa !== 'function' || window.parent !== window) return;
    const ahora = Date.now();
    for(const [fichaId, f] of fichasPub){
      const r = f && f.resumen;
      if(!r || r.hp === undefined || num(r.hp) > 0 || r.muerto === true || r.muertoDef || !bnManejo(fichaId)){ vidaCeroVisto.delete(fichaId); continue; }
      if(!vidaCeroVisto.has(fichaId)){ vidaCeroVisto.set(fichaId, ahora); continue; }
      if(ahora - vidaCeroVisto.get(fichaId) >= 1500) vidaCeroRevisar(fichaId);
    }
  }catch(err){ console.error('La vida en 0', err); }
}, 1000);

/* ---------- ✚ El GM revive un token caído (2026-11-04, dueño: «cuando hay un token "caído", el gm al seleccionarlo vea entre sus botones uno para
   revivirlo. tanto para creeps como para jugadores») ----------
   Un botón ✚ en el anillo del token (js/10), solo para el GM y solo si está caído. Pregunta con cuánta vida vuelve (un % de su máximo o un número) y lo
   levanta Titilando hasta su próximo turno, como el ✚ Revivir de la ficha: un creep con modificarCreep; un personaje con FichaAcciones.revivir (también
   le saca el estado de inconsciente); una invocación, la vida en la ficha de su dueño. Lo anuncia en la Mesa. */
function tokenCaido(t){
  if(!t || !t.fichaId) return false;
  if(t.tipo === 'creep'){ const sc = typeof creepPrivadoDe === 'function' ? creepPrivadoDe(t.fichaId) : null; return sc ? num(sc.hp) <= 0 : !!((estadoDe(t) || {}).muerto); }
  const v = vinculo(t), r = (v && v.resumen) || {};
  if(String(t.fichaId).includes(SEP_INVOCACION)) return num(r.hp) <= 0 && !r.dormida;
  return num(r.hp) <= 0 || r.muerto === true;
}
function maxVidaDe(t){
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? num(sc.hpMax) : 0; }
  const r = ((vinculo(t) || {}).resumen) || {};
  return num(r.hpMax);
}
async function gmRevivirToken(t){
  if(!soyGM || !tokenCaido(t)) return;
  const nom = nombreDe(t), max = maxVidaDe(t);
  const conPct = p => max > 0 ? `${p} % (${fmt(Math.max(1, Math.floor(max * p / 100)))} de ${fmt(max)})` : `${p} %`;
  const op = await Confirmar.elegir(`¿Con cuánta vida vuelve ${nom}? Queda Titilando (invulnerable) hasta su próximo turno.`, {titulo: '✚ Revivir', icono: '✚', no: 'Cancelar', opciones: [
    {valor: '25', texto: conPct(25)}, {valor: '50', texto: conPct(50)}, {valor: '100', texto: max > 0 ? `Toda (${fmt(max)})` : 'Toda'}, {valor: 'num', texto: '✍ Escribir cuánta'}]});
  if(!op) return;
  let val;
  if(op === 'num'){
    const txt = await Confirmar.texto(`¿Con cuánta vida vuelve ${nom}?`, {titulo: '✚ Revivir', icono: '✚', valor: String(max > 0 ? Math.max(1, Math.floor(max / 2)) : 1), si: 'Revivir', max: 4});
    val = Math.round(num(txt));
    if(!(val > 0)) return;
  }else val = Math.max(1, Math.floor((max > 0 ? max : 1) * num(op) / 100));
  if(max > 0) val = Math.min(val, max);
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => {
        sc.hp = val;
        const e = typeof estadosPresetCreep === 'function' ? Combatiente.estadoTitilando(estadosPresetCreep()) : null;
        if(e){ sc.estados = sc.estados || []; Combatiente.agregarEstado(sc.estados, e); }
      });
    }else if(String(t.fichaId).includes(SEP_INVOCACION)){
      const [ficha, invId] = String(t.fichaId).split(SEP_INVOCACION);
      const ok = await editarPersonajeMapa(ficha, S => { const inv = (S.invocaciones || []).find(x => x && String(x.id) === String(invId)); if(!inv) return false; inv.hp = val; return true; });
      if(!ok) throw new Error('no se pudo escribir la ficha de su dueño');
    }else{
      const ok = await editarPersonajeMapa(t.fichaId, S => { FichaAcciones.revivir(S, val); return true; });
      if(!ok) throw new Error('no se pudo escribir su ficha');
    }
  }catch(err){ console.error('Revivir:', err); toast(`No se pudo revivir a ${nom}: ${err.message || err}`); return; }
  const txt = `✚ ${nom} vuelve con ${fmt(val)} de vida${t.tipo === 'creep' || !String(t.fichaId).includes(SEP_INVOCACION) ? ', Titilando hasta su próximo turno' : ''} (lo revivió el GM)`;
  toast(txt);
  try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
  try{ momentoAbrir({tipo: 'buff', icono: '✚', titulo: `${nom} vuelve a pie`, resultado: txt, estado: 'listo', datos: t.tipo !== 'creep' && t.duenoUid ? {paraUid: t.duenoUid, aviso: true, boton: 'Entendido'} : {}}); }catch(e){}
  pedirDibujo();
}
