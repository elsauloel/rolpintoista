/* 💨 Zona con duelo por token — los Pedos Tóxicos (2026-11-09, dueño):
   «Que al ejecutarlo, la nube se coloque automáticamente consigo mismo como centro del área» · «una animación del gas expandiéndose» ·
   «Recién cuando termina la expansión, empieza la resolución de efectos, al estilo del menú de duelo que usan la mayoría de los skills: de a un
   token por vez» · «en sentido horario alrededor del que lo tira, empezando por el más cercano» · «a vos no».

   Una zona con `duelo` adentro del JSON de `zonaEstado` (las reglas de Firestore no dejan sumar campos sueltos a los elementos; lo pone
   `zonaPersistenteDeHabilidad`, js/13, cuando el mensaje trae `zonaDuelo` — comun/combatiente.js `zonaDeHab`) ya no usa el cartel de la zona
   (#zona-banner, js/08): cada vez que le toca a alguien (la primera tanda, alguien que entra, la ronda que pasa con alguien adentro) se arma una
   tanda de la cascada de las áreas (`coleccionAreas`, js/13) con esos tokens, y el mapa del GM abre un duelo por token, de a uno, con el mismo
   cuadro que todas las habilidades (late el token, se despliega el cuadro, las tiradas adentro, se pliega y sigue el próximo):
   - la tirada de quien la creó (su Ef.Esp de cuando la tiró, `zonaTiraValor`) se tira de nuevo contra cada uno (`hab.tiraCadaUno`,
     `zonaDueloTirada`): cada uno solo tira su resistencia, desde la pantalla de quien lo maneja;
   - si no resiste, el daño es la diferencia, del tipo de la zona (tóxico), menos la Defensa especial (`ignoraDef`), como siempre;
   - y si el daño entra, el dado extra (1d20) con su tabla (`porTirada`: 7+ Pajaritos · 17+ Stun · 20 se desmaya) es un efecto más del cuadro
     (comun/duelo.js `porTiradaResolver`); el «cae» lo aplica `zonaDueloCaer`.
   Las tandas de una misma zona van de a una (`zonaDueloEspera`, desde `escucharAreas`). La nube recién tirada se expande desde quien la tiró
   (`zonaDueloExpansionDibujar`, desde js/50) y recién al terminar arranca la primera tanda (`zonaDueloAlCrear`, en la pantalla que la creó). */
const ZONA_DUELO_EXPANDE_MS = 2200;
const zonaDueloInicio = new Map();   // elId → performance.now() de cuando empezó a expandirse en esta pantalla (0 = ya está quieta)
const zonaDueloPedidos = new Map();  // elId → {ids, timer}: los que entraron hace un momento (se juntan en una sola tanda)

const zonaEsDuelo = el => !!(el && el.zona && zonaSpecDe(el).duelo);

/* ---------- la nube que se expande ---------- */
// La ve aparecer esta pantalla (js/07): si es recién puesta (la escritura propia, o creada hace unos segundos), arranca la expansión.
function zonaDueloVista(id, d, pendiente){
  if(zonaDueloInicio.has(id)) return;
  let e = {}; try{ e = JSON.parse(d.zonaEstado || '{}') || {}; }catch(err){}
  if(!e.duelo) return;
  const ms = d.creado && typeof d.creado.toMillis === 'function' ? d.creado.toMillis() : null;
  const nueva = ms === null ? !!pendiente : Date.now() - ms < 6000;
  zonaDueloInicio.set(id, nueva ? performance.now() : 0);
  if(nueva) pedirDibujo();
}
// → cuánto va de la expansión (0 a 1), o null si ya está quieta.
function zonaDueloExpandiendo(el){
  const t0 = el && zonaDueloInicio.get(el.id);
  if(!t0) return null;
  const k = (performance.now() - t0) / ZONA_DUELO_EXPANDE_MS;
  if(k >= 1){ zonaDueloInicio.set(el.id, 0); return null; }
  return Math.max(0, k);
}
// La mancha de siempre (nubeDibujar, js/50), agrandándose desde el centro, con bocanadas que se abren en el frente (violeta y verde).
function zonaDueloExpansionDibujar(el, celdas, color, z, k){
  const C = hexCentro(el.origen.col, el.origen.fila);
  const e = (1 - Math.cos(Math.PI * k)) / 2;   // arranca suave, se abre y frena al llegar
  const s = 0.12 + 0.88 * e;
  let R = 0; celdas.forEach(c => { const p = hexCentro(c.col, c.fila); R = Math.max(R, Math.hypot(p.x - C.x, p.y - C.y)); });
  R += HEX * 0.9;
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * e;
  ctx.translate(C.x, C.y); ctx.scale(s, s); ctx.translate(-C.x, -C.y);
  nubeDibujar(celdas, color, z * s);
  ctx.restore();
  // Las bocanadas: círculos difusos en el borde que avanza, que se mecen y se apagan al final.
  const t = performance.now() / 1000, n = 14, frente = R * s, apaga = k < 0.75 ? 1 : (1 - k) / 0.25;
  ctx.save();
  for(let i = 0; i < n; i++){
    const a = i / n * Math.PI * 2 + Math.sin(t * 1.3 + i) * 0.12;
    const d = frente * (0.82 + 0.12 * Math.sin(t * 2.1 + i * 1.7));
    const x = C.x + Math.cos(a) * d, y = C.y + Math.sin(a) * d, r = HEX * (0.55 + 0.3 * superficieAzar(el.origen.col + i, el.origen.fila, 77)) * (0.6 + 0.6 * e);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const verde = i % 3 === 1;
    g.addColorStop(0, verde ? `rgba(160,225,100,${(0.6 * apaga).toFixed(2)})` : `rgba(205,160,255,${(0.6 * apaga).toFixed(2)})`);
    g.addColorStop(0.55, verde ? `rgba(120,190,70,${(0.3 * apaga).toFixed(2)})` : `rgba(160,105,215,${(0.32 * apaga).toFixed(2)})`);
    g.addColorStop(1, 'rgba(150,95,200,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

/* ---------- las tandas de duelos ---------- */
function zonaDueloCasteador(el){
  const ref = String(el.zonaCasteadorRef || ''), creep = el.zonaCasteadorTipo === 'creep';
  if(!ref) return null;
  for(const [id, t] of tokens) if(t.fichaId === ref && (t.tipo === 'creep') === creep) return {id, t};
  return null;
}
// La habilidad del cuadro: lo que la zona tiene guardado, en el formato de una habilidad de área sin dodge roll.
function zonaDueloHab(el){
  const e = zonaSpecDe(el), tiraStat = el.zonaTiraStat || 'dmgesp', resStat = el.zonaResistStat || 'resmg';
  const etqTira = ZONA_STAT_LABEL[tiraStat] || tiraStat, etqRes = ZONA_STAT_LABEL[resStat] || resStat;
  const valor = Number.isFinite(el.zonaTiraValor) ? el.zonaTiraValor : Math.round(num(el.zonaResistValor));
  const f = typeof formulaParaValor === 'function' ? formulaParaValor(valor) : null;
  const tipo = Combatiente.elementoDe(el.zonaDanoTipo) || 'arcano';
  const dano = el.zonaDanoDif ? {formula: '', diferencia: true, tipo, ignoraDef: !!el.zonaIgnoraDef, ...(el.zonaDirecto ? {directo: true} : {})}
    : el.zonaDano ? {formula: el.zonaDano, tipo, ignoraDef: !!el.zonaIgnoraDef, ...(el.zonaDirecto ? {directo: true} : {})} : null;
  const efectos = [];
  if(e.nombre){ const {duelo, porTirada, ...spec} = e; efectos.push({nombre: e.nombre, caras: 1, exitos: 1, spec}); }
  const tabla = Combatiente.porTiradaNorm(e.porTirada), m = String(el.zonaTiraExtra || '').match(/d(\d+)/i);
  if(tabla.length && m && dano){
    const caras = Math.max(2, Math.min(100, num(m[1]))), desde = Math.min(...tabla.map(x => x.desde));
    efectos.push({nombre: `${el.zonaTiraExtra} de la nube`.slice(0, 40), caras, exitos: Math.max(1, caras - desde + 1), porTirada: tabla, requiereDano: true,
      detalle: Combatiente.porTiradaTxt(tabla)});
  }
  const detalle = `${el.zonaNombre || 'La zona'}: ${etqTira} de quien la tiró contra tu ${etqRes}. Si no resistís, ${dano ? (dano.diferencia ? `la diferencia como daño ${el.zonaDanoTipo ? String(el.zonaDanoTipo).toLowerCase() : ''}${dano.ignoraDef && !dano.directo ? ' (menos la Defensa especial)' : ''}` : `${dano.formula} de daño`) : 'lo que deja'}${efectos.some(x => x.porTirada) ? ` y ${el.zonaTiraExtra}: ${Combatiente.porTiradaTxt(tabla)}` : ''}.`;
  return {nombre: el.zonaNombre || 'Zona', objetivo: 'area', radio: 2,
    tira: f ? {formula: f.formula, etq: etqTira} : {stat: tiraStat, etq: etqTira},
    contra: [{modo: resStat, stat: resStat, etq: etqRes}], dano, efectos, sinDodge: true, tiraCadaUno: true, zonaId: el.id, detalle: detalle.slice(0, 600)};
}
// Ordena los tokens en sentido horario alrededor del centro, empezando por el más cercano.
function zonaDueloOrdenar(el, ids){
  const C = hexCentro(el.origen.col, el.origen.fila);
  const info = ids.map(id => { const t = tokens.get(id), p = hexCentro(t.col, t.fila); return {id, d: Math.hypot(p.x - C.x, p.y - C.y), a: Math.atan2(p.y - C.y, p.x - C.x)}; });
  if(!info.length) return [];
  const primero = info.reduce((m, x) => x.d < m.d - 0.01 || (Math.abs(x.d - m.d) <= 0.01 && x.a < m.a) ? x : m);
  const rel = x => { let r = x.a - primero.a; while(r < -1e-6) r += Math.PI * 2; return r; };
  return info.sort((x, y) => rel(x) - rel(y) || x.d - y.d).map(x => x.id);
}
// ¿Quiénes de los de adentro le tocan? (no quien la creó, ni un caído, ni lo escondido; lo del piso no a quien vuela)
function zonaDueloAfectados(el){
  const cs = new Set(celdasDeElemento(el).map(c => c.col + ',' + c.fila));
  const ids = [];
  tokens.forEach((t, id) => {
    if(!cs.has(t.col + ',' + t.fila) || t.oculto || t.bajoTierra || !zonaAplicaA(el, t)) return;
    if(typeof iniciativaFueraDeJuego === 'function' && iniciativaFueraDeJuego(id)) return;
    if(alturaDe(el) === 'piso' && typeof vuelaToken === 'function' && vuelaToken(t)) return;
    ids.push(id);
  });
  return ids;
}
async function zonaDueloLanzar(el, ids){
  ids = zonaDueloOrdenar(el, ids.filter(id => tokens.has(id)));
  if(!ids.length) return;
  const c = zonaDueloCasteador(el);
  const casteador = {ref: String(el.zonaCasteadorRef || ''), tipo: el.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj', nombre: String(c ? nombreDe(c.t) : (el.zonaNombre || 'La zona')).slice(0, 40),
    uid: (c && c.t.duenoUid) || fbUsuario.uid, tokenId: c ? c.id : ''};
  try{
    await coleccionAreas().add({
      casteador, hab: Duelo.limpiarHab(zonaDueloHab(el)), centro: {col: el.origen.col, fila: el.origen.fila, mapa: mapaMostrado}, radio: 2, objetivos: ids, duelos: [], indice: 0,
      estado: AREA_EN_CURSO, creadoPor: fbUsuario.uid, creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('Zona con duelo: no se pudo armar la tanda', err); toast(`${el.zonaNombre || 'La zona'}: no se pudieron armar los duelos (${String((err && err.message) || err).slice(0, 80)})`); }
}
// La pantalla que la creó (js/13 crearElementoZona → alCrear): la primera tanda, cuando terminó de expandirse.
function zonaDueloAlCrear(id){
  setTimeout(() => {
    const el = elementos.get(id);
    if(!el){ return; }
    const ids = zonaDueloAfectados(el);
    if(!ids.length){ toast(`${el.zonaNombre || 'La nube'}: no agarró a nadie (por ahora)`); return; }
    zonaDueloLanzar(el, ids);
  }, ZONA_DUELO_EXPANDE_MS + 300);
}
// ¿Ese token ya espera su duelo en una tanda de esta zona?
function zonaDueloPendiente(zonaId, tokenId){
  for(const a of areasActivas.values()){
    if(!a.hab || a.hab.zonaId !== zonaId || !areaEnCurso(a)) continue;
    const i = (a.objetivos || []).indexOf(tokenId);
    if(i >= 0 && i >= num(a.indice)) return true;
  }
  return false;
}
// Un token que le toca (entró, o pasó la ronda adentro: js/08 zonaEncolar, en la pantalla que lo maneja). Se juntan un momento en una sola tanda.
// Una sola pantalla pide por cada token (como el Escudo elemental, js/106): un creep, el GM; un personaje o una invocación, quien tiene 🎮 el control,
// si no su dueño (antes un personaje controlado por el GM salía en dos tandas: la del GM y la de su dueño).
function zonaDueloResuelvoYo(t){
  if(!t || !fbUsuario) return false;
  if(t.tipo === 'creep') return !!soyGM;
  const r = ((fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]) || {}).resumen) || {};
  return fbUsuario.uid === (r.control || t.duenoUid || '');
}
function zonaDueloPedir(el, t){
  const tokId = zonaIdDe(t);
  if(!tokId || !zonaDueloResuelvoYo(t) || zonaDueloPendiente(el.id, tokId)) return;
  const t0 = zonaDueloInicio.get(el.id);
  if(t0 && performance.now() - t0 < ZONA_DUELO_EXPANDE_MS + 2000) return;   // recién tirada: la primera tanda ya lo incluye
  const p = zonaDueloPedidos.get(el.id) || {ids: new Set(), timer: null};
  p.ids.add(tokId);
  clearTimeout(p.timer);
  p.timer = setTimeout(() => {
    zonaDueloPedidos.delete(el.id);
    const e2 = elementos.get(el.id);
    if(e2) zonaDueloLanzar(e2, [...p.ids].filter(id => !zonaDueloPendiente(el.id, id)));
  }, 700);
  zonaDueloPedidos.set(el.id, p);
}
// Desde escucharAreas (js/13, el GM): una tanda de una zona espera a que termine la anterior de esa misma zona.
function zonaDueloEspera(id, a){
  if(!a.hab || !a.hab.zonaId) return false;
  const ms = x => x.creado && typeof x.creado.toMillis === 'function' ? x.creado.toMillis() : Infinity;
  for(const [oid, o] of areasActivas){
    if(oid === id || !o.hab || o.hab.zonaId !== a.hab.zonaId || !areaEnCurso(o)) continue;
    if(ms(o) < ms(a) || (ms(o) === ms(a) && oid < id)) return true;
  }
  return false;
}
// La tirada de quien creó la zona contra este token (js/13 areaCrearSiguienteSubDuelo): su valor de cuando la tiró, con dados nuevos. A la Mesa la
// manda el duelo, junto con la resistencia, cuando tiran los dos.
function zonaDueloTirada(a, t){
  const el = elementos.get(a.hab.zonaId);
  let r = null;
  if(el && Number.isFinite(el.zonaTiraValor)) r = Combatiente.tirarStat(el.zonaTiraValor, [], el.zonaTiraStat || 'dmgesp');
  else if(a.hab.tira && a.hab.tira.formula && typeof tirarDados === 'function') r = tirarDados(a.hab.tira.formula);
  if(!r) return null;
  const tiro = {total: Math.round(num(r.total)), formula: String(r.formula || ''), rolls: (r.rolls || []).slice(0, 20), mod: num(r.mod)};
  return tiro;
}
// «Cae» (el 20): la vida a 0, como lo hacía la tirada extra de la zona (js/66). Lo aplica la pantalla que aplica los efectos del duelo.
async function zonaDueloCaer(t, d){
  const nom = nombreDe(t);
  try{
    if(t.tipo === 'creep'){ await modificarCreep(t.fichaId, sc => { sc.hp = 0; }); }
    else if(String(t.fichaId || '').includes(SEP_INVOCACION)){ await cambiarVidaPj({fichaId: t.fichaId}, null, '0'); }
    else{
      const ok = await editarPersonajeMapa(t.fichaId, S => { FichaAcciones.fijarHp(S, 0); FichaAcciones.revisarMuerte(S); return true; });
      if(ok === null) return {manual: true, nota: `${nom} cae: ponele la vida en 0 a mano`};
    }
    return {nota: `💀 ${nom} se desmaya (la vida a 0)`};
  }catch(err){ console.error('Zona con duelo: no se pudo desmayar', err); return {manual: true, nota: `${nom} cae: ponele la vida en 0 a mano`}; }
}
