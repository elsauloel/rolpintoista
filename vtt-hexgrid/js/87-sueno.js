/* ---------- 💤 El Sueño (2026-11-01, dueño: «es un stun que igual se termina con daño y también puede haber algunas situaciones específicas que lo
   despierten») ----------
   El estado (comun/estados-presets.js) lleva `stun: true`: todo lo del Stun (no actúa ni se mueve, su Evasión es 1 sin tirar, no reacciona; lo
   reconoce Combatiente.stuneado, también por el nombre). Es un control mental (Res.Mt; lo frenan la Inmunidad mental y la Inmunidad a CC; lo cura
   el Té de tilo). Dura 2 turnos.
   · Se despierta con daño: cualquier golpe que le saque vida se lo saca (danioCreep / danioPj / danioInv, js/10, con `suenoQuitarDe`) y la Mesa
     dice «💤 Fulano se despertó». (El veneno o el sangrado del Mantenimiento no pasan por ahí: no lo despiertan — anotado como pendiente.)
   · Un aliado pegado lo despierta sacudiéndolo (decisión de Claude, 2026-11-01): el botón 💤 en el token del dormido (como el 🤝), 1 No2 de quien
     sacude. Si esta pantalla maneja al dormido (sus personajes, el GM con los creeps o con 🎮 el control) se lo saca acá; si no, deja el momento
     `sueno-despertar` y lo resuelve la pantalla que lo maneja o la del GM (js/16). */
const SUENO_RE = /^sue[ñn]o$/i;
const esSueno = e => !!e && e.activo !== false && (!!e.sueno || SUENO_RE.test(String(e.nombre || '').trim()));
const dormido = t => !!t && (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : []).some(esSueno);
// Saca el Sueño de una lista de estados (la cambia); → true si había.
function suenoQuitarDe(estados){
  if(!Array.isArray(estados)) return false;
  let hubo = false;
  for(let i = estados.length - 1; i >= 0; i--) if(esSueno(estados[i])){ estados.splice(i, 1); hubo = true; }
  return hubo;
}
// ¿Lo maneja esta pantalla? (el GM sus creeps; cada uno sus personajes e invocaciones, o el GM con 🎮 el control)
function suenoManejo(t){
  if(!t || !t.fichaId) return false;
  if(t.tipo === 'creep') return soyGM;
  return typeof bnManejo === 'function' && bnManejo(String(t.fichaId).split(SEP_INVOCACION)[0]);
}
// El token que yo manejo, aliado y pegado al dormido `t`, que lo puede sacudir (no él mismo, ni otro dormido, ni una invocación).
function suenoDespertadorDe(t){
  if(!t || !dormido(t) || modoMapa !== 'combate') return null;
  for(const x of tokens.values()){
    if(!x || x === t || !x.fichaId || String(x.fichaId).includes(SEP_INVOCACION) || x.oculto) continue;
    if((t.tipo === 'creep') !== (x.tipo === 'creep')) continue;   // aliados: creep con creep, personaje con personaje (o su invocación)
    if(!suenoManejo(x) || dormido(x)) continue;
    if(distanciaHex({col: x.col, fila: x.fila}, {col: t.col, fila: t.fila}) <= 1) return x;
  }
  return null;
}
// Le saca el Sueño a `t` (lo escribe esta pantalla: tiene que manejarlo o ser el GM). → true si estaba dormido.
async function suenoDespertar(t, motivo){
  if(!t || !t.fichaId) return false;
  let hubo = false;
  try{
    if(t.tipo === 'creep') await modificarCreep(t.fichaId, sc => { hubo = suenoQuitarDe(sc.estados); });
    else{
      const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
      await editarPersonajeMapa(fichaId, S => {
        const lista = invId ? (((S.invocaciones || []).find(i => i && i.id === invId) || {}).estados) : S.efectos;
        hubo = suenoQuitarDe(lista);
        return hubo;
      });
    }
  }catch(err){ console.error('No se pudo despertar:', err); toast('No se pudo despertar — mirá la consola'); return false; }
  if(hubo && typeof mesaLinea === 'function') mesaLinea(`💤 ${nombreDe(t)} se despertó${motivo ? ': ' + motivo : ''}`, 'recordatorio');
  return hubo;
}
// El botón 💤 del token: quien sacude paga 1 No2 y el dormido se despierta.
async function suenoSacudir(t){
  const x = suenoDespertadorDe(t);
  if(!x){ toast('Para despertarlo, tu personaje tiene que estar pegado a él'); return; }
  const quien = nombreDe(x);
  // 1 No2 de quien sacude (sin No2: el aviso de siempre; ya en negativo, no)
  let pago = true;
  try{
    if(x.tipo === 'creep'){
      await modificarCreep(x.fichaId, sc => { sc.nitros = num(sc.nitros) - 1; });
    }else{
      pago = !!(await editarPersonajeMapa(x.fichaId, async S => {
        const no2 = num(S.nitros);
        if(Combatiente.sinNo2Negativo && Combatiente.sinNo2Negativo(no2, 1) && !(Combatiente.reglaNo2 && await Combatiente.reglaNo2({nombre: quien, nitros: no2, accion: 'despertar a alguien'}))) return false;   // ya en negativo: la regla, o hacerlo igual (2026-11-03)
        if(no2 < 0){ S.nitros = no2 - 1; return true; }   // ⚖ con la mesa: la deuda crece
        if(no2 < 1){
          const ok = await Confirmar.preguntar(`${quien} no tiene No2 para sacudirlo (cuesta 1, tiene ${fmt(no2)}). ¿Hacerlo igual? Queda en negativo.`, {titulo: '💤 Despertarlo', si: 'Hacerlo igual'});
          if(!ok) return false;
        }
        S.nitros = no2 - 1;
        return true;
      }));
    }
  }catch(err){ console.error('No se pudo cobrar el No2 de sacudir:', err); toast('No se pudo — mirá la consola'); return; }
  if(!pago) return;
  const motivo = `lo sacudió ${quien} (1 No2)`;
  if(suenoManejo(t) || soyGM){ await suenoDespertar(t, motivo); return; }
  const id = await momentoAbrir({tipo: 'sueno-despertar', icono: '💤', titulo: `${quien} sacude a ${nombreDe(t)} para despertarlo`, estado: 'esperando',
    datos: {tokenId: idDeToken(t), motivo}});
  if(!id) toast('No se pudo avisar a la pantalla que maneja al dormido');
  else toast(`💤 ${quien} sacude a ${nombreDe(t)}: se despierta en cuanto lo vea la pantalla de su jugador o la del GM`);
}
// El momento: lo resuelve la pantalla que maneja al dormido (o la del GM), una sola vez.
const suenoMomentosHechos = new Set();
async function suenoMomento(id, d){
  if(!d || d.estado !== 'esperando' || suenoMomentosHechos.has(id)) return;
  const t = tokens.get(d.datos && d.datos.tokenId);
  if(!t || !(suenoManejo(t) || soyGM)) return;
  suenoMomentosHechos.add(id);
  let mia = false;
  try{
    await fbDb.runTransaction(async tx => {
      const ref = coleccionMomentos().doc(id), doc = await tx.get(ref);
      mia = doc.exists && doc.data().estado === 'esperando';
      if(mia) tx.update(ref, {estado: 'listo', resultado: `${nombreDe(t)} se despertó`});
    });
  }catch(err){ console.error('No se pudo tomar el momento del Sueño:', err); return; }
  if(mia) await suenoDespertar(t, String((d.datos && d.datos.motivo) || ''));
}
