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
  let salvado = '', cayo = false, nombre = '', elige = false, sacados = [];
  try{
    await editarPersonajeMapa(fichaId, S => {
      nombre = ((S.meta && S.meta.nombre) || '').trim() || 'Tu personaje';
      if(num(S.hp) > 0 || (S.muerto && (S.muerto.activo || S.muerto.definitivo))) return false;   // ya lo resolvió otra pantalla
      salvado = FichaAcciones.revisarAnkh(S) || '';   // con una sola forma de volver, sola; con más de una, no revive: elige (más abajo)
      elige = !salvado && FichaAcciones.volverPendiente(S).length > 1;
      const r = FichaAcciones.revisarMuerte(S);
      cayo = !!(r && r.cayo); sacados = (r && r.sacados) || [];   // 💀 al caer se le van los estados (P257)
      return true;
    });
  }catch(err){ console.error('La vida en 0: no se pudo revisar', err); }
  finally{ vidaCeroEnCurso.delete(fichaId); vidaCeroVisto.delete(fichaId); }
  if(salvado){
    const txt = Combatiente.volverTxt(nombre, salvado);
    toast(txt);
    try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
    try{ momentoAbrir({tipo: 'buff', icono: Combatiente.volverIcono(salvado), titulo: `${nombre} no cae`, resultado: txt, estado: 'listo'}); }catch(e){}
  }else if(cayo){
    try{ mesaLinea(elige ? Combatiente.volverPendienteTxt(nombre) : `💔 ${nombre} quedó en 0 de vida: inconsciente (5 turnos para morir)`, 'recordatorio'); }catch(e){}
    if(sacados.length){ try{ mesaLinea(Combatiente.caidaTxt(nombre, sacados), 'recordatorio'); }catch(e){} }
  }
}

/* ---------- ☥ ¿Con qué volvés? (dueño, 2026-11-20: «si un jugador tiene un pacto activo y un ankh en el cinturón, al jugador le debe aparecer la opción de
   qué usar») ----------
   Con MÁS DE UNA forma de volver (el Pacto, un Ankh de Reencarnación en el cinturón, la Llama de Fénix) el personaje ya no revive solo: queda caído y su
   resumen dice con qué puede volver (`resumen.volver`, comun/ficha-resumen.js). A quien lo maneja (su jugador, o el GM con 🎮 el control) el cartel le sale
   solo, una vez por caída y otra vez si recarga la pantalla; si lo cierra, sigue caído y lo reabre con el ☥ del token o el botón de la pantalla roja. El GM
   puede elegir por él con el ☥ del token. Se usa SOLO la elegida (FichaAcciones.volverCon); con una sola forma, todo sigue automático. */
const volverEnCurso = new Set();      // fichaId con el cartel abierto (o guardando)
const volverPreguntado = new Set();   // fichaId al que ya se le mostró el cartel solo en esta caída
function volverFormas(fichaId){
  const f = typeof fichasPub !== 'undefined' ? fichasPub.get(fichaId) : null, r = f && f.resumen;
  if(!r || r.hp === undefined || num(r.hp) > 0 || r.muertoDef || !Array.isArray(r.volver) || r.volver.length < 2) return null;
  return r.volver;
}
function volverPuede(t){
  if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return false;
  return !!volverFormas(t.fichaId) && puedeRevivirToken(t);
}
async function volverPreguntar(fichaId){
  const formas = volverFormas(fichaId);
  if(!formas || volverEnCurso.has(fichaId)) return;
  volverEnCurso.add(fichaId);
  try{
    const f = fichasPub.get(fichaId), nombre = f.nombre || (f.resumen && f.resumen.nombre) || 'Tu personaje', porGM = !!soyGM && f.duenoUid !== fbUsuario.uid;
    const c = Combatiente.volverOpciones(nombre, formas, porGM);
    const id = await Confirmar.elegir(c.texto, c.o);
    if(!id){ toast(`☥ ${nombre} sigue en el piso. Para elegir con qué vuelve: el ☥ de su token`); return; }
    toast(`☥ ${nombre} vuelve…`);   // (leer y guardar el personaje desde el mapa tarda unos segundos)
    let salvado = '';
    try{
      await editarPersonajeMapa(fichaId, S => {
        salvado = FichaAcciones.volverCon(S, id) || '';
        if(!salvado) return false;
        FichaAcciones.revisarMuerte(S);
        return true;
      });
    }catch(err){ console.error('¿Con qué volvés?:', err); }
    if(!salvado){ toast(`☥ No se pudo: ${nombre} ya no está caído o ya no tiene eso para volver`); return; }
    const txt = Combatiente.volverTxt(nombre, salvado, {elegido: true, porGM});
    toast(txt);
    try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
    try{ momentoAbrir({tipo: 'buff', icono: Combatiente.volverIcono(salvado), titulo: `${nombre} no cae`, resultado: txt, estado: 'listo',
      datos: porGM && f.duenoUid ? {paraUid: f.duenoUid, aviso: true, boton: 'Entendido'} : {}}); }catch(e){}
    if(typeof pedirDibujo === 'function') pedirDibujo();
  }finally{ volverEnCurso.delete(fichaId); }
}

setInterval(() => {
  try{
    if(typeof fichasPub === 'undefined' || typeof bnManejo !== 'function' || typeof editarPersonajeMapa !== 'function' || window.parent !== window) return;
    const ahora = Date.now();
    for(const [fichaId, f] of fichasPub){
      const r = f && f.resumen;
      if(!r || num(r.hp) > 0) volverPreguntado.delete(fichaId);   // de pie: la próxima caída vuelve a preguntar
      // ☥ Caído y con más de una forma de volver: a quien lo maneja, el cartel le sale solo (una vez por caída; al recargar, de nuevo).
      else if(r.muerto === true && bnManejo(fichaId) && volverFormas(fichaId) && !volverPreguntado.has(fichaId) && !(typeof pausaSoloMirar === 'function' && pausaSoloMirar())){ volverPreguntado.add(fichaId); volverPreguntar(fichaId); }
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
// 💀 ¿Está fuera de combate (0 de vida)? Por id: lo de la iniciativa (creep derrotado, personaje en 0) o tokenCaido (también una invocación).
// (2026-11-14, dueño: a alguien en 0 de vida no se lo ataca, y no da ni recibe ataques de oportunidad.)
function tokenFueraDeCombate(id){
  const t = tokens.get(id);
  if(!t) return false;
  return !!((typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) || tokenCaido(t));
}
function maxVidaDe(t){
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? num(sc.hpMax) : 0; }
  const r = ((vinculo(t) || {}).resumen) || {};
  return num(r.hpMax);
}
// ¿Quién puede revivir este token? El GM, cualquiera; un jugador, su propio personaje o una invocación suya (2026-11-04, dueño: «el botón de
// revivir desde el token también debe aparecer en la ficha propia de los jugadores»). Un creep, solo el GM.
function puedeRevivirToken(t){
  if(!t || !t.fichaId) return false;
  if(soyGM) return true;
  if(t.tipo !== 'pj' || !fbUsuario) return false;
  const v = vinculo(t), ficha = String(t.fichaId).split(SEP_INVOCACION)[0];
  return !!((v && v.duenoUid === fbUsuario.uid) || t.duenoUid === fbUsuario.uid || (typeof controloFicha === 'function' && controloFicha(ficha)));
}
// o (opcional) = {val, aMano}: la vida ya elegida (P256 (i): la vida subida a mano desde el token, js/10 hudAplicar, después de su cartel) →
// no pregunta «¿con cuánta vida?», la animación es la corta y la línea de la Mesa lo dice.
async function revivirToken(t, o){
  o = o || {};
  if(!puedeRevivirToken(t) || !tokenCaido(t)) return;
  const nom = nombreDe(t), esInv = String(t.fichaId).includes(SEP_INVOCACION);
  const forma = o.aMano ? 'corta' : 'revive';
  const val = o.val > 0 ? Math.round(o.val) : await Revivir.elegirVida(nom, maxVidaDe(t), {titila: !esInv});
  if(!val) return;
  let vuelta = null;   // ☥ al volver se van los estados (Combatiente.volverLimpio); un personaje lo cuenta editarPersonajeMapa (js/11)
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => {
        sc.hp = val;
        Combatiente.volverLimpio(sc, 'estados', forma); vuelta = Combatiente.vueltaTomar(sc);
        const e = typeof estadosPresetCreep === 'function' ? Combatiente.estadoTitilando(estadosPresetCreep()) : null;
        if(e){ sc.estados = sc.estados || []; Combatiente.agregarEstado(sc.estados, e); }
      });
    }else if(esInv){
      const [ficha, invId] = String(t.fichaId).split(SEP_INVOCACION);
      const ok = await editarPersonajeMapa(ficha, S => { const inv = (S.invocaciones || []).find(x => x && String(x.id) === String(invId)); if(!inv) return false; inv.hp = val; Combatiente.volverLimpio(inv, 'estados', forma); vuelta = Combatiente.vueltaTomar(inv); Combatiente.vueltaTomar(S); return true; });
      if(!ok) throw new Error('no se pudo escribir la ficha de su dueño');
    }else{
      const ok = await editarPersonajeMapa(t.fichaId, S => { if(o.aMano) Combatiente.volverLimpio(S, 'efectos', forma); FichaAcciones.revivir(S, val); return true; });   // (a mano: la forma queda «corta», la anota primero)
      if(!ok) throw new Error('no se pudo escribir su ficha');
    }
  }catch(err){ console.error('Revivir:', err); toast(`No se pudo revivir a ${nom}: ${err.message || err}`); return; }
  const txt = Revivir.texto(nom, val, {titila: !esInv, quien: soyGM ? 'gm' : 'dueno', aMano: !!o.aMano});
  toast(txt);
  try{ mesaLinea(txt, 'recordatorio'); }catch(e){}
  try{ momentoAbrir({tipo: 'buff', icono: '✚', titulo: `${nom} vuelve a pie`, resultado: txt, estado: 'listo', datos: soyGM && t.tipo !== 'creep' && t.duenoUid ? {paraUid: t.duenoUid, aviso: true, boton: 'Entendido'} : {}}); }catch(e){}
  if(vuelta && typeof resurreccionAnunciar === 'function') resurreccionAnunciar({t, forma, sacados: vuelta.sacados});   // (creep e invocación; js/123)
  pedirDibujo();
}
const gmRevivirToken = revivirToken;   // el nombre de antes (js/10)
// El ✚ de la pantalla de muerte del mapa (js/13): el mismo de arriba, con el token del personaje; sin token en este mapa, la ventana de antes.
function revivirPersonajePropio(fichaId){
  let t = null;
  for(const x of tokens.values()) if(x.tipo === 'pj' && x.fichaId === fichaId){ t = x; break; }
  if(t && tokenCaido(t)) return revivirToken(t);
  return abrirRevivirMapa(fichaId);
}
