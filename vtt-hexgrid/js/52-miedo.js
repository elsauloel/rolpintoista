/* ---------- 😱 El Miedo y la 💀 Calavera con vela (2026-10-18, dueño) ----------
   El Miedo (comun/estados-presets.js) lleva `miedoDe` = el token que lo asustó. Mientras dura, cada casillero que se mueve hacia ese token le
   cuesta MIEDO_NO2 (costoPasos, js/04, con `miedoFuentes`) y todo lo que hace contra él va con −1 PdG y −1 al daño (`miedoContra` → el `miedo`
   de Duelo.crear, js/13 y js/17). Dura hasta que empieza su próximo turno.
   La Calavera con vela: quien la lleva (`auraMiedo` = el radio, en lo que publica su ficha o su tarjeta de creep) tiene un aura espeluznante.
   Cada vez que un rival entra (estaba afuera y ahora está a `radio` o menos), tira su Res.Mt contra el Ef.Esp de quien la lleva (dos tiradas
   nuevas; el empate lo gana la calavera) y, si no llega, queda con Miedo. Lo resuelve la pantalla que maneja al que entró (sus personajes; el
   GM, los creeps), en modo combate: el Anuncio para él y la Crónica para la mesa. Lo que ya estaba adentro al abrir el mapa no cuenta. */
const MIEDO_NO2 = 2;
function miedoEstados(t){
  return (typeof confusionEstadosDe === 'function' ? confusionEstadosDe(t) : [])
    .filter(e => e && e.activo !== false && (e.miedo || /^miedo$/i.test(String(e.nombre || '').trim())));
}
// Dónde están los que lo asustaron (para cobrar los pasos hacia ellos).
function miedoFuentes(t){
  return miedoEstados(t).map(e => e.miedoDe && tokens.get(e.miedoDe)).filter(Boolean).map(x => ({col: x.col, fila: x.fila}));
}
// ¿`atq` le tiene miedo a `def`? → 1 (el −1 del duelo) o 0.
function miedoContra(atq, def){
  if(!atq || !def) return 0;
  const defId = def.id || idDeToken(def);
  return defId && miedoEstados(atq).some(e => e.miedoDe === defId) ? 1 : 0;
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
  const paso1 = {titulo: '💀 La calavera', texto: `Tira Res.Mt contra el Ef.Esp de ${de}: si no llega, queda con Miedo (moverse hacia ${de} le cuesta ${MIEDO_NO2} No2 por casillero, y contra ${de} tiene −1 a la probabilidad de golpe y −1 al daño) hasta que empieza su próximo turno.`};
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
      try{ await mesaPublicar(`${de} · Ef.Esp (Calavera con vela)`, {formula: rf.formula, rolls: rf.rolls, mod: rf.mod, total: rf.total, quien: de, ...gm(p)}); }catch(err){}
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
          }else await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec, origen: `${de} · Calavera con vela`});
        }catch(err){ console.error('No se pudo poner el Miedo:', err); nota = 'ponelo a mano'; }
      }
      const cronica = resiste ? `${tiradas}: no se asustó.` : `${tiradas}: ¡queda con Miedo de ${de}!${nota ? ' (' + nota + ')' : ''}`;
      try{ if(momentoId) momentoActualizar(momentoId, {estado: 'listo', resultado: cronica}); }catch(err){}
      try{ mesaLinea(`💀 ${quien} entró en el aura de ${de}: ${cronica}`, 'recordatorio'); }catch(err){}
      AvisoCombate.mostrar({...base, pasos: [paso1, {titulo: 'Tiradas', texto: tiradas + ' (el empate lo gana la calavera).'}],
        veredicto: resiste ? {tono: 'bueno', grande: 'NO SE ASUSTÓ', chico: ''} : {tono: 'malo', grande: '¡QUEDA CON MIEDO!', chico: nota || `hasta que empieza su próximo turno`},
        botones: [{texto: 'Entendido', alClic: terminar}], alCerrar: terminar});
    };
    // Entrar al aura obliga a tirar: cerrar el cartel también tira.
    AvisoCombate.mostrar({...base, pasos: [paso1], botones: [{texto: '🎲 Tirar Res.Mt', alClic: tirar}], alCerrar: tirar});
  });
}
