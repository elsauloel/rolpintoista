/* ---------- 🙈 Un área contra alguien que no se ve (2026-11-22, P263) ----------
   Dueño: «me parece que no se debería abrir el duelo para el atacante. Al personaje en sigilo sí se le debe ofrecer la oportunidad de esquivar,
   si correspondiera, y en el caso de que lo logre, todo eso debería pasar desapercibido por el equipo rival»; y «si el que está escondido tarda
   en hacer su tirada, el juego se frenaría… habría que encontrar alguna forma creativa de resolver eso».
   Cuando un área (hechizo de área, onda, cono, línea) alcanza a alguien que la pantalla que la lanza NO ve (en sigilo, oculto por el GM, en la
   niebla, tapado por una nube…), `dueloElegirAreaMapa` (js/13) lo saca de la cascada de siempre y le arma un área APARTE, de un solo objetivo,
   con `hab.oculta` y la tirada de quien la lanzó ya hecha (`pdgCompartido`, y el daño en `hab.danoCompartido` si es de una tirada para todos):
   - el bando que la lanzó no espera a nadie: su cascada sigue con los que ve (y si no ve a ninguno, «No hay nadie adentro del área», lo mismo que
     si no hubiera nadie);
   - el sub-duelo lleva `grupo.oculto` (comun/duelo.js): solo lo ve quien maneja al escondido o quien lo ve ahora (`dueloVeOculto`), sus líneas de
     la Mesa van marcadas para su bando (js/29) y su círculo violeta solo se dibuja para esas pantallas (`areaOcultaLaVeo`, js/05);
   - si nadie lo resuelve en 40 s, la pantalla del GM lo hace sola (comun/duelo.js, revisarOcultos, con el valor de `dueloValorOculto`).
   Qué no entra (sigue como antes, a la vista): las áreas de aliados, la Tormenta y el Meteoro (su propia secuencia, js/118), los misiles
   repartidos, las zonas con duelo (js/112) y lo que tira el daño contra cada uno. Dudas: P287. */

// ¿Esta habilidad puede ir aparte contra un escondido? (la tirada de quien la lanza se puede hacer de antemano, y el daño también)
function areaOcultable(hab){
  if(!hab || hab.aliados || hab.tormenta || hab.meteoro || hab.reparte || hab.zonaId || hab.soloTirada || hab.tiraCadaUno || hab.esquiva) return false;
  if(!hab.tira || !(hab.tira.stat || hab.tira.formula)) return false;
  if(hab.dano && !hab.dano.diferencia && !areaDanoCompartible(hab)) return false;
  return true;
}
// Quién maneja este token en esta pantalla (su jugador; el GM, sus creeps).
function areaManejoToken(t){
  if(!t || !fbUsuario) return false;
  if(t.tipo === 'creep') return !!soyGM;
  return t.duenoUid === fbUsuario.uid;
}
// Los objetivos que esta pantalla (la de quien lanza el área) no ve.
function areaOcultosDe(hab, objetivos){
  if(!areaOcultable(hab) || typeof loVeoAhora !== 'function') return [];
  return (objetivos || []).filter(id => { const t = tokens.get(id); return t && !areaManejoToken(t) && !loVeoAhora(t); });
}

// La tirada de quien lanza el área, hecha ya (sin mostrarla: la cuenta la Mesa de su bando cuando el escondido tira la suya).
async function areaTiroOculto(habL, casteador){
  const c = habL && habL.tira;
  if(!c) return null;
  const limpio = r => r ? {total: Math.max(0, Math.round(num(r.total))), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(num), mod: num(r.mod)} : null;
  if(c.formula) return limpio(tirarDados(c.formula));
  const lado = {ref: casteador.ref, tipo: casteador.tipo, nombre: casteador.nombre, uid: casteador.uid, tokenId: casteador.tokenId};
  let f = '';
  try{
    let hk = (typeof bnHooksDuelo === 'function' && bnHooksDuelo(lado)) || (typeof bnHooksDueloInv === 'function' && bnHooksDueloInv(lado)) || (typeof acHooksDuelo === 'function' && acHooksDuelo(lado)) || null;
    if(hk && typeof hk.then === 'function') hk = await hk;
    if(hk && hk.habValor) f = String(hk.habValor({id: '', hab: habL, atacante: lado, defensor: lado}, 'atacante', c.stat) || '');
  }catch(err){ console.error('Área oculta: la tirada de quien la lanza', err); }
  const mitades = (f.match(/÷2/g) || []).length;
  let base = f.replace(/\s*÷2/g, '').trim();
  if(!/d/i.test(base)){   // sin los ganchos: el valor de su stat (el resumen del personaje, o los datos del creep)
    let v = num(base);
    if(!v){
      const t = tokens.get(casteador.tokenId);
      if(t && t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); v = sc ? num(CreepCalculo.statValor(sc, c.stat)) : 0; }
      else{ const fp = fichasPub.get(String(casteador.ref || '').split(SEP_INVOCACION)[0]); v = fp && fp.resumen ? num(fp.resumen[c.stat]) : 0; }
    }
    const fv = formulaParaValor(Math.max(1, Math.round(Math.max(v, num(c.min)))));
    base = fv ? fv.formula : '1d4';
  }
  const r = tirarDados(base);
  if(!r) return null;
  let total = num(r.total);
  for(let i = 0; i < mitades; i++) total = Math.max(1, Math.floor(total / 2));
  total += num(c.bono);
  return limpio({...r, total, formula: `${r.formula}${' ÷2'.repeat(mitades)}${num(c.bono) ? ` +${num(c.bono)}` : ''}`});
}
// El daño, una tirada (como el de «una tirada para todos» de siempre).
function areaDanoOculto(habL){
  if(!habL || !habL.dano || habL.dano.diferencia || !areaDanoCompartible(habL)) return null;
  const r = tirarDados(habL.dano.formula);
  if(!r) return null;
  const ex = habL.dano.extra && habL.dano.extra.formula ? tirarDados(habL.dano.extra.formula) : null;
  return {crudo: Math.max(0, Math.round(num(r.total))), formula: `${String(r.formula || '').slice(0, 40)} (una tirada para todos)`, rolls: (r.rolls || []).map(num),
    ...(ex ? {extra: {total: Math.max(0, Math.round(num(ex.total))), formula: String(ex.formula || ''), rolls: (ex.rolls || []).map(num)}} : {})};
}
// Un área aparte por cada escondido, con todo listo: corre sola, en paralelo, sin frenar a nadie.
async function areaLanzarOcultos(o){
  const habL = Duelo.limpiarHab(o.hab);
  for(const id of o.ocultos){
    try{
      const pdg = await areaTiroOculto(habL, o.casteador);
      if(!pdg){ console.error('Área oculta: no se pudo hacer la tirada de', o.casteador.nombre); continue; }
      const dc = areaDanoOculto(habL);
      await coleccionAreas().add({
        casteador: o.casteador, hab: {...habL, oculta: true, ...(o.deArea ? {ocultaDe: String(o.deArea).slice(0, 40)} : {}), ...(dc ? {danoCompartido: dc} : {})},
        centro: {col: o.h.col, fila: o.h.fila, ...(o.h.cono ? {cono: true, rot: o.h.rot} : {}), ...(o.h.linea ? {linea: o.h.linea} : {}), mapa: mapaMostrado},
        radio: o.radio, objetivos: [id], duelos: [], indice: 0, estado: AREA_EN_CURSO, pdgCompartido: pdg,
        creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('Área oculta: no se pudo lanzar contra un escondido', err); }
  }
}

// ¿Esta pantalla ve el duelo de un escondido? Quien lo maneja (el jugador, su personaje o invocación; el GM, sus creeps), el GM con 👁 Revelar lo
// oculto, o quien lo ve ahora (lo mismo que dibuja el mapa). comun/duelo.js ya cuenta a quien lo controla (🎮).
function dueloVeOculto(d){
  const t = d && d.defensor ? tokens.get(d.defensor.tokenId) : null;
  if(!t) return !!(soyGM && d && d.defensor && d.defensor.tipo === 'creep');
  if(areaManejoToken(t)) return true;
  if(soyGM && ojoRevelando) return true;
  return typeof loVeoAhora === 'function' && loVeoAhora(t);
}
// El círculo de un área contra un escondido: solo para quien ve ese duelo.
function areaOcultaLaVeo(a){
  const id = a && (a.objetivos || [])[0], t = id ? tokens.get(id) : null;
  if(!t) return false;
  return dueloVeOculto({defensor: {tokenId: id, tipo: t.tipo}});
}
// El valor del stat de un lado (para la tirada que hace sola la pantalla del GM cuando el escondido no contesta): el creep, de sus datos; el
// personaje, de su resumen público.
function dueloValorOculto(d, ladoN, stat){
  const lado = d && d[ladoN], t = lado ? tokens.get(lado.tokenId) : null;
  if(!t || !stat) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? num(CreepCalculo.statValor(sc, stat)) : 0; }
  const f = fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]);
  return f && f.resumen ? num(f.resumen[stat === 'evasion' ? 'eva' : stat]) : 0;
}
