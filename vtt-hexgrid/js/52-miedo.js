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
// Los rivales que lo asustan con Pánico: los de rivalesDe (js/02: ni ocultos ni muertos) que se ven (no los que están en sigilo).
function panicoRivales(t){
  if(!panicoDe(t) || typeof rivalesDe !== 'function') return [];
  return rivalesDe(t).filter(r => !(typeof enSigilo === 'function' && enSigilo(r)));
}
// Dónde están los que lo asustan (para cobrar los pasos): los de su Miedo y, con Pánico, sus rivales.
function miedoFuentes(t){
  return [...miedoEstados(t).map(e => e.miedoDe && tokens.get(e.miedoDe)).filter(Boolean), ...panicoRivales(t)].map(x => ({col: x.col, fila: x.fila}));
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
  return 0;
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
