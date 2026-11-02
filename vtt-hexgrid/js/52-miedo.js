/* ---------- 😱 El Miedo, 😱 el Pánico y 💀 la Calavera con vela (2026-10-18; reglas nuevas del dueño, 2026-11-01) ----------
   El Miedo (comun/estados-presets.js) lleva `miedoDe` = el token que lo asustó. Mientras dura:
   · todo lo que hace contra él va con −MIEDO_PENA (2) a la PdG (o PdG.Esp) y −2 al daño (común o especial): `miedoContra` → el `miedo` de
     Duelo.crear (js/13 y js/17), con arma o con habilidad;
   · cada paso que termina a MIEDO_RADIO (3) o menos de él y no se aleja le cuesta el doble de No2 (costoPasos, js/04, con `miedoFuentes`).
   El Pánico (estado nuevo, 2026-11-01) es lo mismo contra TODOS sus rivales: −2/−2 a lo que hace contra cualquiera de ellos y el doble de No2 por
   cada paso que termina a 3 o menos de un rival a la vista sin alejarse de ese rival (si se aleja de uno pero queda cerca de otro y no se aleja de
   ese otro, igual cuesta el doble). Los dos duran hasta que empieza su próximo turno.
   La Calavera con vela: quien la lleva (`auraMiedo` = el radio, en lo que publica su ficha o su tarjeta de creep) tiene un aura espeluznante.
   Cada vez que un rival entra (estaba afuera y ahora está a `radio` o menos), tira su Res.Mt contra el Ef.Esp de quien la lleva (dos tiradas
   nuevas; el empate lo gana la calavera) y, si no llega, queda con Miedo. Lo resuelve la pantalla que maneja al que entró (sus personajes; el
   GM, los creeps), en modo combate: el Anuncio para él y la Crónica para la mesa. Lo que ya estaba adentro al abrir el mapa no cuenta. */
const MIEDO_PENA = 2, MIEDO_RADIO = 3;
function miedoEstados(t){
  return (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [])
    .filter(e => e && e.activo !== false && (e.miedo || /^miedo$/i.test(String(e.nombre || '').trim())));
}
function panicoDe(t){
  return (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [])
    .some(e => e && e.activo !== false && (e.panico || /^p[aá]nico$/i.test(String(e.nombre || '').trim())));
}
// 🌺 Malviaje de floripondio (2026-11-01): el Pánico contra TODOS (aliados y rivales).
function floripondioDe(t){
  return (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [])
    .some(e => e && e.activo !== false && (e.floripondio || /^mal ?viaje de floripondio$/i.test(String(e.nombre || '').trim())));
}
// Con el floripondio: todos los demás tokens que se ven (ni ocultos, ni muertos, ni en sigilo), aliados y rivales.
function floripondioOtros(t){
  if(!floripondioDe(t)) return [];
  const lista = [];
  tokens.forEach(r => {
    if(r === t || r.oculto) return;
    const e = typeof estadoDe === 'function' ? estadoDe(r) : null;
    if(e && e.muerto) return;
    if(typeof enSigilo === 'function' && enSigilo(r)) return;
    lista.push(r);
  });
  return lista;
}
// Los rivales que lo asustan con Pánico: los de rivalesDe (js/02: ni ocultos ni muertos) que se ven (no los que están en sigilo).
function panicoRivales(t){
  if(!panicoDe(t) || typeof rivalesDe !== 'function') return [];
  return rivalesDe(t).filter(r => !(typeof enSigilo === 'function' && enSigilo(r)));
}
// Dónde están los que lo asustan (para cobrar los pasos): los de su Miedo y, con Pánico, sus rivales.
function miedoFuentes(t){
  return [...miedoEstados(t).map(e => e.miedoDe && tokens.get(e.miedoDe)).filter(Boolean), ...panicoRivales(t), ...floripondioOtros(t)].map(x => ({col: x.col, fila: x.fila}));
}
// ¿El paso de `a` a `b` cuesta el doble? Termina a MIEDO_RADIO o menos de alguno y no se aleja de ese.
function miedoPasoAsusta(a, b, fuentes){
  return (fuentes || []).some(f => { const d = distanciaHex(b, f); return d <= MIEDO_RADIO && d <= distanciaHex(a, f); });
}
// ¿`atq` le tiene miedo a `def` (su Miedo, o Pánico y `def` es su rival)? → MIEDO_PENA (el −2 del duelo) o 0.
function miedoContra(atq, def){
  if(!atq || !def) return 0;
  const defId = def.id || idDeToken(def);
  if(defId && miedoEstados(atq).some(e => e.miedoDe === defId)) return MIEDO_PENA;
  if(panicoDe(atq) && (atq.tipo === 'creep' ? def.tipo === 'pj' : def.tipo === 'creep')) return MIEDO_PENA;
  if(floripondioDe(atq)) return MIEDO_PENA;   // 🌺 contra cualquiera, aliados incluidos
  return 0;
}
// 🌺 ¿El −2 de miedoContra viene del Malviaje (y no de un Miedo o un Pánico)? Para que el duelo diga «malviajando» (dueño, 2026-11-03).
function miedoEsMalviaje(atq, def){
  if(!atq || !def || !floripondioDe(atq)) return false;
  const defId = def.id || idDeToken(def);
  if(defId && miedoEstados(atq).some(e => e.miedoDe === defId)) return false;
  return !(panicoDe(atq) && (atq.tipo === 'creep' ? def.tipo === 'pj' : def.tipo === 'creep'));
}

/* ---------- El aura de la Calavera ---------- */
function auraMiedoDe(t){
  if(!t || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return 0;
  const v = vinculo(t);
  if(t.tipo === 'creep') return num(v && v.auraMiedo);
  return num(v && v.resumen && v.resumen.auraMiedo);
}
// El Ef.Esp con que asusta quien la lleva (un creep: su ficha si mira el GM, si no lo que publica su tarjeta).
function auraEfEspDe(t){
  if(t.tipo === 'creep'){
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    if(sc){ const v = CreepCalculo.statValor(sc, 'dmgesp'); return Number.isFinite(v) ? v : 0; }
    return num((vinculo(t) || {}).auraEfEsp);
  }
  const v = vinculo(t);
  return v && v.resumen && v.resumen.dmgesp !== undefined ? num(v.resumen.dmgesp) : null;
}
// La Res.Mt de quien entra (null = no se sabe: una invocación, o una ficha que todavía no publicó el dato).
function auraResMtDe(t){
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); if(!sc) return null; const v = CreepCalculo.statValor(sc, 'resm'); return Number.isFinite(v) ? v : 0; }
  if(String(t.fichaId).includes(SEP_INVOCACION)) return null;
  const f = fichasPub.get(t.fichaId);
  return f && f.resumen && f.resumen.resm !== undefined ? num(f.resumen.resm) : null;
}
// ¿Lo maneja esta pantalla? (el GM sus creeps; cada uno sus personajes e invocaciones, o el GM con 🎮 el control)
function auraManejo(t){
  if(!t || !t.fichaId) return false;
  if(t.tipo === 'creep') return soyGM;
  return typeof bnManejo === 'function' && bnManejo(String(t.fichaId).split(SEP_INVOCACION)[0]);
}

const auraDentro = new Map();   // id de quien maneja esta pantalla → Set de los ids de calaveras que lo tienen adentro
const auraCola = [];
let auraOcupado = false;
function auraRevisar(){
  if(modoMapa !== 'combate'){ auraDentro.clear(); return; }
  const portadores = [...tokens.entries()].filter(([id, t]) => auraMiedoDe(t) > 0 && !t.bajoTierra && !(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)));
  tokens.forEach((t, id) => {
    if(!auraManejo(t)) return;
    const antes = auraDentro.get(id), ahora = new Set();
    if(!(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) && !t.bajoTierra)
      portadores.forEach(([pid, p]) => { if(pid !== id && dueloEsRival(p, t) && distanciaHex(p, t) <= auraMiedoDe(p)) ahora.add(pid); });
    if(antes) ahora.forEach(pid => { if(!antes.has(pid) && !auraCola.some(x => x.id === id && x.pid === pid)) auraCola.push({id, pid}); });
    auraDentro.set(id, ahora);
  });
  auraSiguiente();
}
setInterval(auraRevisar, 700);

async function auraSiguiente(){
  if(auraOcupado || !auraCola.length) return;
  auraOcupado = true;
  const {id, pid} = auraCola.shift();
  try{ await auraResolver(id, pid); }catch(err){ console.error('El aura de la Calavera:', err); }
  auraOcupado = false;
  auraSiguiente();
}
async function auraResolver(id, pid){
  const t = tokens.get(id), p = tokens.get(pid);
  if(!t || !p) return;
  const quien = nombreDe(t), de = p.oculto ? 'Alguien' : nombreDe(p);
  const res = auraResMtDe(t), ef = auraEfEspDe(p);
  const titulo = `${quien} entra en el aura espeluznante de ${de}`;
  const paso1 = {titulo: '💀 El aura espeluznante', texto: `Tira Res.Mt contra el Ef.Esp de ${de}: si no llega, queda con Miedo (cada paso que termina a ${MIEDO_RADIO} casilleros o menos de ${de} sin alejarse le cuesta el doble de No2, y contra ${de} tiene −${MIEDO_PENA} a la probabilidad de golpe y −${MIEDO_PENA} al daño, común o especial) hasta que empieza su próximo turno.`};
  if(res === null || ef === null){
    try{ momentoAbrir({tipo: 'zona-renueva', icono: '💀', titulo, estado: 'listo', resultado: `Res.Mt contra el Ef.Esp de ${de}: tiralo a mano (faltan los datos para tirarlo solo).`, datos: {}}); }catch(err){}
    try{ mesaLinea(`💀 ${quien} entró en el aura espeluznante de ${de}: Res.Mt contra su Ef.Esp, a mano`, 'recordatorio'); }catch(err){}
    return;
  }
  const momentoId = await momentoAbrir({tipo: 'chance', icono: '💀', titulo, estado: 'tirando', datos: {centro: true}}).catch(() => null);
  const base = {clave: 'aura-' + id + '-' + pid, icono: '💀', titulo};
  await new Promise(fin => {
    let listo = false, tirando = false;
    const terminar = () => { if(listo) return; listo = true; AvisoCombate.cerrar(); fin(); };
    const tirar = async () => {
      if(tirando || listo) return;
      tirando = true;
      AvisoCombate.mostrar({...base, pasos: [paso1, {titulo: 'Tiradas', texto: 'Rodando…', espera: true}], botones: [{texto: '🎲 Tirando…', deshabilitado: true}], alCerrar: () => {}});
      const rf = Combatiente.tirarStat(ef, [], 'dmgesp');
      const rr = Combatiente.tirarStat(res, confusionEstadosDe(t), 'resm');
      if(!rf || !rr){ tirando = false; AvisoCombate.mostrar({...base, pasos: [paso1], aMano: 'No se pudo tirar solo: tiralo a mano.', botones: [{texto: 'Entendido', alClic: terminar}], alCerrar: terminar}); return; }
      const gm = x => x.tipo === 'creep' ? {desde: 'gm'} : {};
      try{ await mesaPublicar(`${de} · Ef.Esp (aura espeluznante)`, {formula: rf.formula, rolls: rf.rolls, mod: rf.mod, total: rf.total, quien: de, ...gm(p)}); }catch(err){}
      try{ await mesaPublicar(`${quien} · Res.Mt`, {formula: rr.formula, rolls: rr.rolls, mod: rr.mod, total: rr.total, quien, ...gm(t)}); }catch(err){}
      await new Promise(r => (typeof Duelo !== 'undefined' && Duelo.esperarDados) ? Duelo.esperarDados(r) : r());
      const resiste = rr.total > rf.total;   // el empate lo gana la calavera
      const tiradas = `Res.Mt ${rr.total} contra Ef.Esp ${rf.total}`;
      let nota = '';
      if(!resiste){
        const spec = {nombre: 'Miedo', miedoDe: pid, miedoDeNombre: de};
        try{
          if(t.tipo === 'creep'){
            const r = await modificarCreep(t.fichaId, sc => EstadosAplicar.aplicarACreep(sc, spec));
            if(r && !r.ok) nota = `no le entró (${r.motivo || 'está protegido'})`;
          }else await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec, origen: `${de} · aura espeluznante`});
        }catch(err){ console.error('No se pudo poner el Miedo:', err); nota = 'ponelo a mano'; }
      }
      const cronica = resiste ? `${tiradas}: no se asustó.` : `${tiradas}: ¡queda con Miedo de ${de}!${nota ? ' (' + nota + ')' : ''}`;
      try{ if(momentoId) momentoActualizar(momentoId, {estado: 'listo', resultado: cronica}); }catch(err){}
      try{ mesaLinea(`💀 ${quien} entró en el aura de ${de}: ${cronica}`, 'recordatorio'); }catch(err){}
      AvisoCombate.mostrar({...base, pasos: [paso1, {titulo: 'Tiradas', texto: tiradas + ' (el empate lo gana el aura).'}],
        veredicto: resiste ? {tono: 'bueno', grande: 'NO SE ASUSTÓ', chico: ''} : {tono: 'malo', grande: '¡QUEDA CON MIEDO!', chico: nota || `hasta que empieza su próximo turno`},
        botones: [{texto: 'Entendido', alClic: terminar}], alCerrar: terminar});
    };
    // Entrar al aura obliga a tirar: cerrar el cartel también tira.
    AvisoCombate.mostrar({...base, pasos: [paso1], botones: [{texto: '🎲 Tirar Res.Mt', alClic: tirar}], alCerrar: tirar});
  });
}

/* 🌺 Malviaje al empezar el turno (dueño, 2026-11-03: «al principio de cada turno… alguna tirada para que elija escapar o atacar al más cercano»;
   aprobado: «tira su Res.Mt contra el Ef.Esp de quien se lo puso… si gana, ese turno juega normal (con el −2); si pierde, 1d6: 1–3 escapa, 4–6 ataca
   al más cercano, aliado o rival… lo que hace después lo ejecuta el jugador a mano»). Va como un paso del «▶ Empieza tu turno» (js/04): avisa en el
   cartel y, al aplicarlo, tira. La dificultad: el Ef.Esp guardado en el estado (`efEsp` / `malviajeDif` / `dif`); si no está, la elige el GM (si
   aplica él) o vale MALVIAJE_DIF_DEFECTO. Las tiradas van a la Mesa; el resultado, al cartel y a la Crónica (el mismo momento). */
const MALVIAJE_DIF_DEFECTO = 8;
function malviajeEstadoDe(t){
  return (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [])
    .find(e => e && e.activo !== false && (e.floripondio || /^mal ?viaje de floripondio$/i.test(String(e.nombre || '').trim()))) || null;
}
const malviajeDifDe = e => Math.round(num(e && (e.malviajeDif || e.efEsp || e.dif)));
const esMalviaje = e => !!(e && e.activo !== false && (e.floripondio || /^mal ?viaje de floripondio$/i.test(String(e.nombre || '').trim())));
// `e`: el estado (de la copia de la ficha que arma el inicio del turno, js/04; el resumen público puede venir atrasado). Sin él, el del token.
function malviajePasoPrevio(t, e){
  e = e || malviajeEstadoDe(t);
  if(!e) return null;
  const dif = malviajeDifDe(e);
  return {titulo: '🌺 Estás malviajando', texto: `Ves a todos como enemigos, aliados y rivales por igual. Al aplicar, tirás tu Res.Mt contra ${dif ? `el Ef.Esp de quien te lo puso (${fmt(dif)})` : 'el Ef.Esp de quien te lo puso (no se sabe: lo elige el GM, o ' + MALVIAJE_DIF_DEFECTO + ')'}: si ganás, este turno jugás normal (con el −2); si perdés, 1d6: 1–3 escapás, 4–6 atacás al más cercano.`};
}

/* 🌺 El Malviaje al empezar el turno, presentado a los involucrados (dueño, 2026-11-03: «esta tirada debe presentarse a los involucrados. "fulano
   está malviajando, tirá para bla bla bla", o "estás malviajando, tirá para resolver", apretar dado, tirar a mano… después se muestra la
   resolución»). Un momento `malviaje` con fases: 'resm' (Res.Mt contra el Ef.Esp) → si no resiste, 'd6' (1–3 escapa, 4–6 ataca al más cercano)
   → 'listo'. Al afectado (su dueño, o quien tiene 🎮 su control), al centro: «🎲 Tirar» o «✍ Tirar a mano». A los demás, un cartel abajo («Fulano
   está malviajando…»; el GM puede tirar por él). La resolución, a todos. Las tiradas, a la Mesa (con los dados 3D). Lo que hace después (moverse
   o atacar) lo ejecuta el jugador a mano. */
async function malviajeAbrir(t, porGM, e, tokenId){
  e = e || malviajeEstadoDe(t);
  if(!e || !t) return null;
  let dif = malviajeDifDe(e), nota = '';
  if(!dif && porGM && typeof Confirmar !== 'undefined' && Confirmar.texto){
    const v = await Confirmar.texto(`${nombreDe(t)} está malviajando: ¿contra qué Ef.Esp tira su Res.Mt? (el de quien le puso el Malviaje)`, {titulo: '🌺 Malviaje', icono: '🌺', valor: String(MALVIAJE_DIF_DEFECTO), si: 'Listo'});
    dif = Math.round(num(v));
  }
  if(!dif){ dif = MALVIAJE_DIF_DEFECTO; nota = ` (no se sabía el Ef.Esp: vale ${MALVIAJE_DIF_DEFECTO})`; }
  const [fichaId] = String(t.fichaId || '').split(SEP_INVOCACION);
  const f = fichasPub.get(fichaId);
  const paraUid = (f && f.resumen && f.resumen.control) || t.duenoUid || (f && f.duenoUid) || '';
  const quien = nombreDe(t);
  await momentoAbrir({tipo: 'malviaje', icono: '🌺', titulo: `${quien} está malviajando`, estado: 'esperando',
    resultado: `Tira su Res.Mt contra ${fmt(dif)}${nota} para resistir: si gana, juega normal (con el −2); si no, 1d6: 1–3 escapa, 4–6 ataca al más cercano.`,
    datos: {tokenId: tokenId || t.id || '', quien, paraUid, dif, nota, fase: 'resm', oculto: !!(t.oculto || (typeof enSigilo === 'function' && enSigilo(t)))}});
  return {titulo: '🌺 Malviajando', texto: `Ves a todos como enemigos. Ahora tirás tu Res.Mt contra ${fmt(dif)}${nota}, en tu cartel.`, resumen: '🌺 malviajando: tira para resolver'};
}
const malviajeVistos = new Set();
function malviajeTextos(dt){
  const quien = dt.quien || 'Alguien';
  if(dt.fase === 'd6') return {
    mio: `No resististe (Res.Mt ${fmt(num(dt.resm))} contra ${fmt(num(dt.dif))}). Tirá 1d6: 1–3 escapás (usá tu movimiento para alejarte de todos), 4–6 atacás al más cercano, aliado o rival.`,
    otro: `${quien} no resistió (Res.Mt ${fmt(num(dt.resm))} contra ${fmt(num(dt.dif))}): tira 1d6. 1–3 escapa, 4–6 ataca al más cercano, aliado o rival.`};
  return {
    mio: `Ves a todos como enemigos, aliados y rivales por igual. Tirá tu Resistencia mental contra ${fmt(num(dt.dif))}${dt.nota || ''} para resolver: si ganás, este turno jugás normal (con el −2); si perdés, tirás 1d6 para ver si escapás o atacás.`,
    otro: `${quien} ve a todos como enemigos. Tira su Resistencia mental contra ${fmt(num(dt.dif))}${dt.nota || ''} para resistir: si gana, juega normal (con el −2); si no, 1d6: escapa o ataca al más cercano.`};
}
function malviajeVeredicto(dt){
  if(dt.resistio) return {tono: 'bueno', grande: '🌺 RESISTIÓ', chico: `Res.Mt ${fmt(num(dt.resm))} contra ${fmt(num(dt.dif))}: este turno juega normal (con el −2).`};
  return {tono: 'malo', grande: dt.escapa ? '🌺 ESCAPA' : '🌺 ATACA AL MÁS CERCANO', chico: `Res.Mt ${fmt(num(dt.resm))} contra ${fmt(num(dt.dif))} · 1d6 = ${fmt(num(dt.d6))}: ${dt.escapa ? 'usa su movimiento para alejarse de todos' : 'ataca al más cercano, aliado o rival'}. ✋ Se hace a mano.`};
}
// Lo que llega del momento (js/16): al afectado, al centro; a los demás, un cartel abajo. → true si esta pantalla lo mostró al centro.
function malviajeMomento(id, d){
  const dt = d.datos || {};
  const ms = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(!fbUsuario || Date.now() - ms > 15 * 60 * 1000) return false;   // uno viejo, al abrir el mapa, no
  const mio = dt.paraUid === fbUsuario.uid, clave = 'malviaje:' + id;
  if(d.estado !== 'listo') malviajeVistos.add(id);
  else if(!malviajeVistos.has(id)) return false;   // la resolución, solo a quien vio la tirada
  if(mio){
    if(d.estado === 'esperando'){
      AvisoCombate.mostrar({clave, icono: '🌺', titulo: dt.fase === 'd6' ? 'Malviajando: ¿escapás o atacás?' : 'Estás malviajando', soloBoton: true, texto: malviajeTextos(dt).mio,
        botones: [{texto: dt.fase === 'd6' ? '🎲 Tirar 1d6' : '🎲 Tirar Res.Mt', id: 'malviaje-tirar', alClic: () => { const b = document.getElementById('malviaje-tirar'); if(b) b.disabled = true; malviajeTirar(id, d, false, false); }},
          {texto: '✍ Tirar a mano', sec: true, alClic: () => malviajeTirar(id, d, true, false)}]});
    }else if(d.estado === 'listo') AvisoCombate.mostrar({clave, icono: '🌺', titulo: 'Malviajando', texto: d.resultado || '', soloBoton: true, veredicto: malviajeVeredicto(dt),
      botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cerrar()}]});
    return true;
  }
  if(dt.oculto && !soyGM) return false;
  if(d.estado === 'esperando'){
    AvisoCombate.cartel(clave, {icono: '🌺', titulo: `${dt.quien || 'Alguien'} está malviajando`, texto: malviajeTextos(dt).otro, posicion: 'abajo',
      botones: soyGM ? [{texto: dt.fase === 'd6' ? '🎲 Tirar 1d6 por él' : '🎲 Tirar por él', alClic: () => malviajeTirar(id, d, false, true)}, {texto: '✍ A mano', sec: true, alClic: () => malviajeTirar(id, d, true, true)}, {texto: 'Ocultar', sec: true, alClic: () => AvisoCombate.cartel(clave, null)}]
        : [{texto: 'Ocultar', sec: true, alClic: () => AvisoCombate.cartel(clave, null)}]});
  }else if(d.estado === 'listo'){
    AvisoCombate.cartel(clave, {icono: '🌺', titulo: d.titulo || 'Malviaje', texto: d.resultado || '', posicion: 'abajo', veredicto: malviajeVeredicto(dt),
      botones: [{texto: 'Entendido', alClic: () => AvisoCombate.cartel(clave, null)}]});
  }
  return false;
}
// La tirada (su pantalla, o el GM por él): se toma con una transacción, para que no se tire dos veces. `aMano`: se escribe el número.
async function malviajeTirar(id, d, aMano, porGM){
  const dt = d.datos || {}, fase = dt.fase || 'resm';
  let valor = null;
  if(aMano){
    const v = await Confirmar.texto(fase === 'd6' ? 'Escribí lo que salió en el 1d6 (1 a 6).' : `Escribí el total de la Resistencia mental (contra ${fmt(num(dt.dif))}).`, {titulo: '✍ Tirar a mano', icono: '🌺', valor: '', si: 'Listo'});
    if(v === null || String(v).trim() === '') return;
    valor = Math.round(num(v));
    if(fase === 'd6' && (valor < 1 || valor > 6)){ toast('El 1d6 va de 1 a 6'); return; }
  }
  const ref = coleccionMomentos().doc(id);
  let tomo = false;
  try{ await fbDb.runTransaction(async tx => { const x = await tx.get(ref); if(x.exists && x.data().estado === 'esperando' && ((x.data().datos || {}).fase || 'resm') === fase){ tx.update(ref, {estado: 'tirando'}); tomo = true; } }); }
  catch(err){ console.error('Malviaje: no se pudo tomar la tirada', err); }
  if(!tomo){ toast('Esa tirada ya se hizo'); return; }
  const t = tokens.get(dt.tokenId), quien = dt.quien || (t ? nombreDe(t) : '');
  let r;
  if(valor !== null) r = {formula: `${valor} (a mano)`, rolls: [], mod: valor, total: valor};
  else if(fase === 'd6') r = tirarDados('1d6');
  else{ const f = t ? formulaParaValor(trampaValorStat(t, 'resm')) : null; r = f ? tirarDados(f.formula) : {formula: '0', rolls: [], mod: 0, total: 0}; }
  const por = porGM ? ' (lo tiró el GM)' : valor !== null ? ' (a mano)' : '';
  try{ await mesaPublicar(fase === 'd6' ? `Malviaje: ¿escapa o ataca? (1–3 escapa, 4–6 ataca)${por}` : `Res.Mt contra el Malviaje (Ef.Esp ${fmt(num(dt.dif))})${por}`,
    {formula: r.formula, rolls: r.rolls, mod: r.mod, total: r.total, quien}); }catch(err){}
  if(fase === 'resm'){
    if(num(r.total) >= num(dt.dif)) await momentoActualizar(id, {estado: 'listo', titulo: `${quien}: resistió el Malviaje`, 'datos.fase': 'listo', 'datos.resm': num(r.total), 'datos.resistio': true,
      resultado: `🌺 Res.Mt ${fmt(num(r.total))} contra ${fmt(num(dt.dif))}${dt.nota || ''}: resistió. Este turno juega normal (con el −2 del Malviaje contra cualquiera).`});
    else await momentoActualizar(id, {estado: 'esperando', titulo: `${quien} no resistió el Malviaje: tira 1d6`, 'datos.fase': 'd6', 'datos.resm': num(r.total),
      resultado: `🌺 Res.Mt ${fmt(num(r.total))} contra ${fmt(num(dt.dif))}: no resistió. Ahora 1d6: 1–3 escapa, 4–6 ataca al más cercano.`});
    return;
  }
  const escapa = num(r.total) <= 3;
  await momentoActualizar(id, {estado: 'listo', titulo: `${quien}: ${escapa ? 'escapa' : 'ataca al más cercano'} (Malviaje)`, 'datos.fase': 'listo', 'datos.d6': num(r.total), 'datos.escapa': escapa,
    resultado: `🌺 No resistió (Res.Mt ${fmt(num(dt.resm))} contra ${fmt(num(dt.dif))}). 1d6 = ${fmt(num(r.total))} → ${escapa ? 'escapa: usa su movimiento para alejarse de todos' : 'ataca al más cercano, aliado o rival'}. ✋ Lo hace el jugador, a mano.`});
}
