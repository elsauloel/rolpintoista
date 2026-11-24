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

/* ---------- 🙈 Lo que se dispara con el golpe a un escondido, sin delatarlo (2026-11-24, P320, dueño: «como propusiste») ----------
   El daño de un duelo oculto lo aplica la pantalla del GM (comun/duelo.js), y con él saltan los talismanes, los anillos, el Orbe salvaje, la Cabeza
   reducida, el drenaje… que escribían en la Mesa para todos, abrían momentos y mostraban toasts (visto con clics: el diablito de la Botella le avisó
   al GM que el grito le pegó a alguien; la Cabeza reducida nombró al escondido). Mientras se aplica lo de un duelo oculto hay un «contexto»
   (`areaOcultaCon`): cada línea de la Mesa (`mesaLinea`, `mesaPublicar`: comun/mesa.js pregunta a `mesaLineaMarca`) va marcada como las del duelo
   oculto (la ve su bando, el GM con 👁 y quien lo ve), cada momento lleva `datos.escondido` (js/16; a quien va dirigido le llega igual) y, en una
   pantalla que no lo ve, no sale ningún toast (js/01). Lo que le pasa a QUIEN LANZÓ el área pasa igual y le llega con un texto que no dice contra
   quién ni por qué (`areaOcultaAfuera` + los textos de js/53). Si se delata (el daño le saca más que su Sigilo), desde ahí todo normal
   (`areaOcultaDelatado`). */
let areaOcultaCtx = null;
function areaOcultaDe(d){
  if(!d || !d.grupo || !d.grupo.oculto || !d.defensor) return null;
  const tipo = d.defensor.tipo === 'creep' ? 'creep' : 'pj';
  return {tipo, ficha: String(d.defensor.ref || d.defensor.fichaId || '').slice(0, 80), tokenId: String(d.defensor.tokenId || ''), veo: !!dueloVeOculto(d), delatado: false};
}
// ¿Lo de este duelo va marcado? (sí mientras corre lo de un duelo oculto y el escondido no se delató)
function areaOcultaActiva(){ return !!(areaOcultaCtx && !areaOcultaCtx.delatado && !areaOcultaCtx.afuera); }
// Corre `fn` con el contexto del duelo `d` (si no es oculto, igual que siempre). El contexto es de la pantalla entera: para que no marque lo de otro
// duelo que se aplica al mismo tiempo (un área que le pega a uno que se ve y a uno escondido), lo de un escondido espera a que termine lo que está
// corriendo y lo demás espera a que termine lo del escondido (como mucho 8 s cada uno: después sigue igual, para no trabar nada).
let areaOcultaEnCurso = 0;
async function areaOcultaEsperar(cond, ms){
  const t0 = Date.now();
  while(!cond() && Date.now() - t0 < ms) await new Promise(r => setTimeout(r, 120));
}
async function areaOcultaCon(d, fn){
  const c = areaOcultaDe(d);
  if(!c){
    if(areaOcultaCtx) await areaOcultaEsperar(() => !areaOcultaCtx, 8000);
    areaOcultaEnCurso++;
    try{ return await fn(); }
    finally{ areaOcultaEnCurso--; }
  }
  if(areaOcultaCtx || areaOcultaEnCurso > 0) await areaOcultaEsperar(() => !areaOcultaCtx && areaOcultaEnCurso === 0, 8000);
  const antes = areaOcultaCtx;
  areaOcultaCtx = c;
  try{ return await fn(); }
  finally{ areaOcultaCtx = antes; }
}
// Lo que va a la vista aunque se esté aplicando un duelo oculto: lo de quien lanzó (con texto neutro) y el «se delató».
async function areaOcultaAfuera(fn){
  const c = areaOcultaCtx;
  if(!c) return fn();
  const antes = c.afuera;
  c.afuera = true;
  try{ return await fn(); }
  finally{ c.afuera = antes; }
}
// Se delató: desde acá, todo a la vista.
function areaOcultaDelatado(){ if(areaOcultaCtx) areaOcultaCtx.delatado = true; }
// La marca de una línea de la Mesa (comun/mesa.js la pide): `oculta-<pj|creep>:<desde>` y la ficha del escondido, o null.
function mesaLineaMarca(desde){
  if(!areaOcultaActiva()) return null;
  const base = /^[a-z-]{1,20}$/.test(String(desde || '')) && !/^oculta-/.test(String(desde)) ? String(desde) : 'recordatorio';
  return {desde: `oculta-${areaOcultaCtx.tipo}:${base}`.slice(0, 40), ficha: areaOcultaCtx.ficha};
}
// Un momento abierto mientras tanto: solo para los que lo ven (js/16 momentoEscondidoVer).
function momentoMarcaOculta(datos){
  if(!areaOcultaActiva() || (datos && (datos.escondido || datos.sinEscondido))) return datos;
  return {...(datos || {}), escondido: {tipo: areaOcultaCtx.tipo, tokenId: areaOcultaCtx.tokenId}};
}
// ¿Esta pantalla se calla (los toasts)? Solo la que no ve al escondido.
function areaOcultaCalla(){ return areaOcultaActiva() && !areaOcultaCtx.veo; }
// ¿Hace falta el texto neutro para quien lanzó? (mientras dure lo de un duelo oculto, aunque se haya delatado no: ahí ya se sabe)
function areaOcultaNeutro(){ return !!(areaOcultaCtx && !areaOcultaCtx.delatado); }
