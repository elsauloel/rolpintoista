/* ---------- ✨ Armas invocadas (2026-10-22, D7 de docs/plan-inventario-creeps.md) ----------
   El dueño: «puede haber invocaciones con manos, tipo esqueletos, zombies, que pueden tener armas, que van a ser armas invocadas… se pueden usar
   mientras el creep esté invocado. Si se desinvoca, el arma desaparece; el arma de una invocación no aparece en el botín y se puede seguir usando
   todo el combate.»
   Lo que una invocación trae puesto es suyo (`invocada: true` en su equipo; InvCalculo.migrar lo marca). Si se le cae (js/27, armaSoltar), la pieza
   lleva de qué invocación es (`invocadaDe` = "fichaId~invId", `invocadaNombre`): la puede levantar y usar cualquiera, MIENTRAS esa invocación siga
   en el mapa y despierta, y como mucho hasta el fin del combate. Cuando no (se durmió, su token se fue, terminó el combate), se desvanece de donde
   esté: del piso y de los creeps (lo hace la pantalla del GM) y de un personaje (la de quien lo maneja, con la Botonera abierta). Nunca va al botín
   (comun/combate-fin.js). Si la levanta su propia invocación, vuelve a ser suya. */
function invocadaViva(ref){
  if(!ref || modoMapa !== 'combate') return false;
  const t = [...tokens.values()].find(x => x && x.tipo === 'pj' && x.fichaId === ref);
  if(!t) return false;
  const r = (vinculo(t) || {}).resumen || {};
  return !r.dormida && r.activa !== false;
}
// Se desvanece recién si su invocación lleva un rato sin estar (≥ 5 s: que el mapa termine de cargar o de cambiar de modo no la borre).
const invocadaAusente = new Map();   // ref -> desde cuándo no está
const invocadaSeVa = it => !!(it && it.invocadaDe) && invocadaAusente.has(it.invocadaDe) && Date.now() - invocadaAusente.get(it.invocadaDe) >= 5000;
const armasInvocadasBorrando = new Set();
function invocadaRefs(){
  const refs = new Set(), sumar = it => { if(it && it.invocadaDe) refs.add(it.invocadaDe); };
  elementos.forEach(el => { if(el && el.arma){ try{ sumar(JSON.parse(el.armaItem || '{}')); }catch(e){} } });
  if(typeof creepsPriv !== 'undefined') creepsPriv.forEach(e => ((e && e.sc && e.sc.equipo) || []).forEach(sumar));
  if(typeof bn !== 'undefined' && bn && bn.S){ (bn.S.inventario || []).forEach(sumar); (bn.S.invocaciones || []).forEach(i => (i.equipo || []).forEach(sumar)); }
  return refs;
}
async function armasInvocadasRevisar(){
  if(typeof tokens === 'undefined' || !fbUsuario) return;
  if(soyGM && mapaMostrado !== mapaActivo) return;   // el GM armando otro mapa: no ve los tokens del combate
  const refs = invocadaRefs();
  [...invocadaAusente.keys()].forEach(r => { if(!refs.has(r) || invocadaViva(r)) invocadaAusente.delete(r); });
  refs.forEach(r => { if(!invocadaViva(r) && !invocadaAusente.has(r)) invocadaAusente.set(r, Date.now()); });
  // 1) El piso (el GM).
  if(soyGM) for(const [id, el] of elementos){
    if(!el || !el.arma || armasInvocadasBorrando.has(id)) continue;
    let it = null; try{ it = JSON.parse(el.armaItem || '{}'); }catch(e){}
    if(!invocadaSeVa(it)) continue;
    armasInvocadasBorrando.add(id);
    try{ await coleccionElementos().doc(id).delete(); mesaLinea(`✨ ${el.armaNombre || 'Un arma invocada'} se desvanece (era de ${it.invocadaNombre || 'una invocación'})`, 'recordatorio'); }
    catch(err){ console.error('No se pudo desvanecer el arma invocada:', err); }
    armasInvocadasBorrando.delete(id);
  }
  // 2) Los creeps que la levantaron (el GM).
  if(soyGM && typeof creepsPriv !== 'undefined') for(const [creepId, e] of creepsPriv){
    const sc = e && e.sc;
    if(!sc || armasInvocadasBorrando.has('c:' + creepId) || !(sc.equipo || []).some(invocadaSeVa)) continue;
    armasInvocadasBorrando.add('c:' + creepId);
    const nombres = (sc.equipo || []).filter(invocadaSeVa).map(it => it.nombre);
    try{ await modificarCreep(creepId, c => { c.equipo = (c.equipo || []).filter(it => !invocadaSeVa(it)); return {}; }); mesaLinea(`✨ ${nombres.join(' y ')} de ${sc.nombre} se desvanece`, 'recordatorio', sc.nombre); }
    catch(err){ console.error('No se pudo desvanecer el arma invocada del creep:', err); }
    armasInvocadasBorrando.delete('c:' + creepId);
  }
  // 3) El personaje de la Botonera abierta (y sus invocaciones, que pudieron levantar la de otra).
  if(typeof bn !== 'undefined' && bn && bn.S && typeof bnPuedeGuardar === 'function' && bnPuedeGuardar() && !armasInvocadasBorrando.has('pj')){
    const S = bn.S, enInv = inv => (inv.equipo || []).some(invocadaSeVa);
    if((S.inventario || []).some(invocadaSeVa) || (S.invocaciones || []).some(enInv)){
      armasInvocadasBorrando.add('pj');
      const antes = FichaGuardado.partes(S), nombres = [...(S.inventario || []), ...(S.invocaciones || []).flatMap(i => i.equipo || [])].filter(invocadaSeVa).map(it => it.nombre);
      S.inventario = (S.inventario || []).filter(it => !invocadaSeVa(it));
      (S.invocaciones || []).forEach(inv => { inv.equipo = (inv.equipo || []).filter(it => !invocadaSeVa(it)); });
      bnUi(antes).cambio();
      mesaLinea(`✨ ${nombres.join(' y ')} se desvanece: su invocación ya no está`, 'recordatorio');
      armasInvocadasBorrando.delete('pj');
    }
  }
}
setInterval(() => { armasInvocadasRevisar().catch(err => console.error(err)); }, 3000);
