/* ---------- 👁 Vigilancia (2026-10-21, dueño; el rango, y habilidad de clase del Shooter) ----------
   Quien usa Vigilancia queda «Vigilancia» (estado `vigilancia`) hasta que empiece su próximo turno; su resumen público publica el alcance del disparo
   (`vigilancia: N` en el estado: el de su arma a distancia). El primer rival que se mueve dentro de ese alcance, a la vista y con línea de tiro libre, se
   frena ahí (`oportunidadCorte`, js/17, con `vigilancia: true`) y quien maneja al vigilante ve «¿Dispara?» (el cartel de la oportunidad): sí → un duelo
   normal con su arma (paga los No2 al tirar el PdG) y se le va la vigilancia; «Dejarlo pasar» → la vigilancia sigue. Si no le alcanzan los No2, avisa y
   el rival sigue su camino. Quien ya estaba adentro: solo si se mueve. Un rival en sigilo que no se ve, no. El alcance se dibuja para todos. */
const VIGILANCIA_PDG = 2;   // el disparo sale con +2 PdG (dueño, 2026-10-21: «para justificar los 2 SP, asumiendo el riesgo de que nadie entre»)
// Los rivales de `t` que vigilan (lo público): [{rid, r, alcance}].
function vigilantesDe(t){
  const rivales = new Set(rivalesDe(t));
  return [...tokens.entries()].filter(([, r]) => rivales.has(r) && !r.bajoTierra && !etereoDe(r) && !iniciativaFueraDeJuego(r))
    .map(([rid, r]) => { const e = (((vinculo(r) || {}).resumen || {}).estados || []).find(x => x && num(x.vigilancia) > 0); return e ? {rid, r, alcance: num(e.vigilancia)} : null; })
    .filter(Boolean);
}
// ¿Lo tiene en la mira en esa casilla? Dentro del alcance y con la línea libre (Sólidos y paredes).
function vigilanciaLoVe(o, c){
  const desde = {col: o.r.col, fila: o.r.fila};
  return distanciaHex(desde, c) <= o.alcance && distanciaHex(desde, c) > 0 && lineaLibre(desde, c, solidosSet());
}
// El alcance marcado en el mapa, para todos (con la línea de visión, como el 📏 Rango).
function vigilanciaDibujar(z){
  tokens.forEach(t => {
    if((t.oculto && !soyGM) || !tokenVisiblePorNiebla(t)) return;
    const e = (((vinculo(t) || {}).resumen || {}).estados || []).find(x => x && num(x.vigilancia) > 0);
    if(e) dibujarRangoConVision({col: t.col, fila: t.fila}, num(e.vigilancia), '#E8A23A', z);
  });
}
// Con qué dispara: su ataque normal (el arma a distancia, si tiene). [{nombre, costo, yo, ataque, detalle}]; vacío si no le alcanzan los No2.
async function vigilanciaArmasDe(r){
  const nombre = nombreDe(r);
  if(r.tipo === 'creep'){
    const sc = creepPrivadoDe(r.fichaId);
    if(!sc) return [];
    const costo = CreepCalculo.costoAtaque(sc);
    const n = sc.nitros === null || sc.nitros === undefined ? CreepCalculo.nitrosMax(sc) : num(sc.nitros);
    if(n < costo) return [];
    return [{nombre: sc.armaNombre || 'su arma', costo, yo: {ref: r.fichaId, tipo: 'creep', nombre}, detalle: oporDetalle(CreepCalculo.ataqueTxt(sc), sc, Combatiente.armaDeCombatiente(sc)),
      ataque: {tipo: 'normal', armaId: '', armaNombre: sc.armaNombre || '', tipoDado: num(sc.armaTipo) || 8, rango: !!sc.armaDeRango, alcance: CreepCalculo.alcance(sc), ...Combatiente.ataqueDeArma(Combatiente.armaDeCombatiente(sc))}}];
  }
  await bnCargarPiezas();
  const fichaId = String(r.fichaId).split(SEP_INVOCACION)[0];
  const c = await FichaGuardado.cargar(fbDb, fbRutaCampana(`fichas/${fichaId}`), {mezclarCatalogo: bnMezclarCatalogo});
  if(!c || !c.S) return [];
  const S = c.S, calc = FichaCalculo.calcular(S);
  const disponibles = S.nitros === null || S.nitros === undefined ? num(calc.final.nitros) : num(S.nitros);
  const armas = FichaCombate.armasEquipadasConDano(S).map(x => x.item).filter(a => a && a.armaDeRango);
  return armas.map(arma => ({arma, costo: FichaCombate.costoAtaque(arma, S)})).filter(x => x.costo <= disponibles)
    .map(({arma, costo}) => ({nombre: arma.nombre, costo, yo: {ref: fichaId, tipo: 'pj', nombre},
      detalle: [`Daño ${FichaCombate.armaDanoTxt(arma, calc.final.dmg)}`, typeof ItemCorto !== 'undefined' ? ItemCorto.armaEsencial(arma) : ''].filter(Boolean).join(' · '),
      ataque: {tipo: 'normal', armaId: arma.id, armaNombre: arma.nombre, tipoDado: FichaCombate.tipoAtaque(arma), rango: true, alcance: FichaCombate.alcanceDeArma(S, arma), ...Combatiente.ataqueDeArma(arma)}}));
}
// Se le va la vigilancia (disparó): un creep directo; un personaje, por aviso a su pantalla.
async function vigilanciaQuitar(r){
  try{
    if(r.tipo === 'creep') await modificarCreep(String(r.fichaId), c => { c.estados = (c.estados || []).filter(e => !(e && e.vigilancia)); return {}; });
    else{ const f = fichasPub.get(String(r.fichaId).split(SEP_INVOCACION)[0]); await EstadosAplicar.encolarPj({fichaId: r.fichaId, duenoUid: (f && f.duenoUid) || r.duenoUid, spec: {nombre: 'Quitar estado', estado: 'Vigilancia'}, origen: 'Disparó desde la vigilancia'}); }
  }catch(err){ console.error('Vigilancia: no se pudo sacar el estado', err); toast(`Sacale Vigilancia a ${nombreDe(r)} a mano`); }
}
// Un creep que se pone en vigilancia: es su acción de ataque del turno.
async function vigilanciaActivada(sc, h){
  if(!h || !(h.efectoNombre === 'Vigilancia' || h.cuentaComoAtaque)) return;   // y las que dicen «es su acción de ataque» (Arma elemental, 2026-10-21)
  try{ await modificarCreep(String(sc.id), c => { c.ataquesTurno = Math.round(num(c.ataquesTurno)) + 1; return {}; }); }catch(err){ console.error(err); }
}
