/* ---------- 🕶 Atacar saca del Sigilo (dueño, 2026-11-09: «claro, atacar lo saca del sigilo») ----------
   Hasta acá, quien atacaba desde el sigilo (un ataque con el arma, una habilidad de ataque, un disparo, un hechizo o una varita contra un rival)
   seguía en Sigilo. Ahora, apenas se declara el ataque (el duelo nuevo contra un rival), el atacante sale del sigilo. El bono de atacar desde el
   sigilo (la defensa vale 1, el +2 del Puñal de sombra, la Puñalada…) ya quedó guardado en el duelo al crearlo, así que ese primer golpe lo
   conserva; los siguientes (otro objetivo del mismo giro, el próximo turno) ya no.
   - Lo hace la pantalla que creó el duelo (el `uid` del atacante: el jugador para su personaje o su invocación; el GM para sus creeps), mirando los
     duelos nuevos de la partida: así cubre todos los caminos (el mapa, la ficha, las Acciones, los giros, la oportunidad) sin tocar cada uno.
   - No cuenta: un duelo contra un aliado o contra sí mismo, y lo que diga que no rompe el sigilo: el robo (es a escondidas, js/47) y una habilidad
     con `mantieneSigilo: true`.
   - Sin Marcado: no lo descubrieron, se mostró al atacar (como salir del sigilo por las suyas). */
const ataqueSacaSigiloVistos = new Set();
let ataqueSacaSigiloCorte = null;
// ¿Este duelo es un ataque contra un rival que saca del sigilo? (lo usa también la prueba automática)
function ataqueSacaSigilo(d){
  if(!d || !d.atacante || !d.defensor) return false;
  const a = d.atacante, de = d.defensor;
  if(a.tokenId && de.tokenId && a.tokenId === de.tokenId) return false;   // sobre sí mismo
  if(a.ref && de.ref && a.ref === de.ref && a.tipo === de.tipo) return false;
  if((a.tipo === 'creep') === (de.tipo === 'creep')) return false;   // contra un aliado (o un creep contra otro creep)
  const hab = d.hab;
  if(hab && hab.mantieneSigilo) return false;
  if(hab && typeof esRobo === 'function' && esRobo(hab)) return false;   // el robo es a escondidas (js/47)
  return true;
}
async function ataqueSacarSigilo(d){
  const a = d.atacante || {};
  let id = a.tokenId && tokens.has(a.tokenId) ? a.tokenId : '';
  if(!id) for(const [tid, t] of tokens) if(t && t.fichaId === a.ref && t.tipo === a.tipo){ id = tid; break; }
  const t = id && tokens.get(id);
  if(!t || !enSigilo(t) || sigiloRompiendo.has(id) || !puedoCambiarEstados(t)) return;
  const e = estadoDe(t);
  const idx = e ? e.estados.findIndex(s => String((s && s.nombre) || '').trim().toLowerCase() === 'sigilo') : -1;
  if(idx < 0) return;
  sigiloRompiendo.add(id);
  try{
    await hudEstadoCambiar(t, idx, 'quitar');
    sigiloAviso(`🕶 ${nombreDe(t)} atacó y salió del sigilo`, `Atacar saca del sigilo (el bono de atacar desde el sigilo ya se contó en este golpe)`);
  }catch(err){ console.error('No se pudo sacar el sigilo al atacar:', err); toast(`✋ ${nombreDe(t)} atacó desde el sigilo: sacale el Sigilo a mano`); }
  finally{ setTimeout(() => sigiloRompiendo.delete(id), 3000); }
}
setInterval(() => {
  try{
    if(ataqueSacaSigiloCorte || typeof fbDb === 'undefined' || !FB_CAMPANA || !fbUsuario) return;
    let primera = true;
    ataqueSacaSigiloCorte = fbDb.collection(fbRutaCampana('duelos')).orderBy('creado', 'desc').limit(8).onSnapshot(snap => {
      snap.docChanges().forEach(ch => {
        if(ch.type !== 'added' || ataqueSacaSigiloVistos.has(ch.doc.id)) return;
        ataqueSacaSigiloVistos.add(ch.doc.id);
        if(primera) return;   // lo de antes de abrir el mapa no cuenta
        const d = ch.doc.data();
        if(!d || !d.atacante || d.atacante.uid !== fbUsuario.uid) return;   // solo la pantalla que lo creó
        if(ataqueSacaSigilo(d)) ataqueSacarSigilo(d);
      });
      primera = false;
    }, err => console.error('No se pudo mirar los duelos (sigilo):', err));
  }catch(err){}
}, 1000);
