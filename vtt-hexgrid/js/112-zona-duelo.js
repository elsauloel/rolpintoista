/* 💨 Zona con duelo por token — los Pedos Tóxicos (2026-11-09, dueño):
   «Que al ejecutarlo, la nube se coloque automáticamente consigo mismo como centro del área» · «una animación del gas expandiéndose» ·
   «Recién cuando termina la expansión, empieza la resolución de efectos, al estilo del menú de duelo que usan la mayoría de los skills: de a un
   token por vez» · «en sentido horario alrededor del que lo tira, empezando por el más cercano» · «a vos no».

   Una zona con `duelo` adentro del JSON de `zonaEstado` (las reglas de Firestore no dejan sumar campos sueltos a los elementos; lo pone
   `zonaPersistenteDeHabilidad`, js/13, cuando el mensaje trae `zonaDuelo` — comun/combatiente.js `zonaDeHab`) ya no usa el cartel de la zona
   (#zona-banner, js/08): cada vez que le toca a alguien (la primera tanda, alguien que entra, la ronda que pasa con alguien adentro) se arma una
   tanda de la cascada de las áreas (`coleccionAreas`, js/13) con esos tokens, y el mapa del GM abre un duelo por token, de a uno, con el mismo
   cuadro que todas las habilidades (late el token, se despliega el cuadro, las tiradas adentro, se pliega y sigue el próximo):
   - la tirada de quien la creó (su Ef.Esp de cuando la tiró, `zonaTiraValor` → la fórmula de `hab.tira`) se tira UNA sola vez (dueño, 2026-11-09:
     «la tirada debe ser la misma para todos. Tira Ef.Esp una sola vez»): en el primer duelo la tira con su botón quien maneja a quien la creó (el
     jugador, o el GM por un creep; si no está, el GM con «🎲 Tirar a mano»), y ese valor queda en el área (`pdgCompartido`, dueloGrupoResuelto,
     js/13) para los demás duelos de la tanda; las tandas de después (quien entra, la ronda que pasa) lo buscan con `zonaDueloTiradaGuardada`.
     El cuadro lo dice: «Ef.Esp de Larry: 9 (una tirada para todos)». Cada afectado tira su resistencia desde la pantalla de quien lo maneja.
     (`zonaDueloTirada` quedó sin usar.)
   - ☠ La Nube tóxica de los creeps (2026-11-09) usa lo mismo, con la expansión desde el punto marcado; el estado que entra se anota en
     zonaResueltos (`zonaDueloAnotar`) para que su «envenenado: +1 stack» siga igual;
   - si no resiste, el daño es la diferencia, del tipo de la zona (tóxico), menos la Defensa especial (`ignoraDef`), como siempre;
   - y si el daño entra, el dado extra (1d20) con su tabla (`porTirada`: 7+ Pajaritos · 17+ Stun · 20 se desmaya) es un efecto más del cuadro
     (comun/duelo.js `porTiradaResolver`); el «cae» lo aplica `zonaDueloCaer`.
   Las tandas de una misma zona van de a una (`zonaDueloEspera`, desde `escucharAreas`). La nube recién tirada se expande desde quien la tiró
   (`zonaDueloExpansionDibujar`, desde js/50) y recién al terminar arranca la primera tanda (`zonaDueloAlCrear`, en la pantalla que la creó). */
const ZONA_DUELO_EXPANDE_MS = 2200;
const zonaDueloInicio = new Map();   // elId → performance.now() de cuando empezó a expandirse en esta pantalla (0 = ya está quieta)
const zonaDueloPedidos = new Map();  // elId → {ids, timer}: los que entraron hace un momento (se juntan en una sola tanda)

/* 🎲 Toda zona con «tirada de la zona» (el stat de quien la creó contra la resistencia de quien la pisa) también va en el cuadro del duelo
   (dueño, 2026-11-10, tanda 1 de docs/auditoria-tiradas.md: «las tiradas las hace el usuario involucrado»; antes, en el cartel de la zona, la tirada
   de quien la creó salía sola). Quien la creó tira con su botón una sola vez por tanda (`pdgCompartido`) y cada afectado su resistencia. Quedan en
   el cartel de siempre las que tienen algo que el duelo no hace: el hielo (una tirada por paso), la cura, la luz, un estado con chance (la Varita de
   miasma), el «soltarse» de un estado, la tirada extra sin tabla, las de una trampa y las de un número fijo (sin tirada de quien la creó). */
function zonaDueloCompatible(el){
  if(!el || !el.zona || el.trampa || el.zonaLuz) return false;
  if(!el.zonaTiraStat || !Number.isFinite(el.zonaTiraValor) || !el.zonaResistStat) return false;
  if(typeof zonaCuraDe === 'function' && zonaCuraDe(el)) return false;
  const sup = typeof superficieSpec === 'function' ? superficieSpec(el) : null;
  if(sup && (sup.superficie || sup.tiraPaso)) return false;
  const e = zonaSpecDe(el);
  if(num(e.pct) > 0 || e.soltar || e.revela || e.cura) return false;
  if(el.zonaTiraExtra && !Combatiente.porTiradaNorm(e.porTirada).length) return false;
  return true;
}
const zonaEsDuelo = el => !!(el && el.zona && (zonaSpecDe(el).duelo || zonaDueloCompatible(el)));

/* ---------- la nube que se expande ---------- */
// La ve aparecer esta pantalla (js/07): si es recién puesta (la escritura propia, o creada hace unos segundos), arranca la expansión.
// ☁ Desde el 2026-11-09 (dueño: «todas las nubes que son en área, al seleccionarla deben aparecer con la misma animación, desde el centro hacia
// afuera») vale para cualquier nube: la zona con duelo, toda zona que se dibuja como gas (`nubeColor`, js/50: Nube tóxica, Nube de veneno, Gas
// adormecedor, Bomba de humo, Niebla de confusión, vapor…) y la niebla de la varita o de la Bomba de humo (`niebla`, js/05).
function zonaDueloEsNube(d){
  if(!d) return false;
  if(d.niebla === true) return true;
  if(d.zona !== true) return false;
  let e = {}; try{ e = JSON.parse(d.zonaEstado || '{}') || {}; }catch(err){}
  return !!e.duelo || (typeof nubeColor === 'function' && !!nubeColor(d));
}
function zonaDueloVista(id, d, pendiente){
  if(zonaDueloInicio.has(id)) return;
  if(!zonaDueloEsNube(d)) return;
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
function zonaDueloExpansionDibujar(el, celdas, color, z, k, opc){
  // El centro: el de la flor; una forma libre o una línea, desde el medio de sus casillas.
  let C = hexCentro(el.origen.col, el.origen.fila);
  if(el.tipo && el.tipo !== 'flor' && celdas.length){ let x = 0, y = 0; celdas.forEach(c => { const p = hexCentro(c.col, c.fila); x += p.x; y += p.y; }); C = {x: x / celdas.length, y: y / celdas.length}; }
  const gris = !!(opc && opc.gris);
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
    // Las bocanadas toman el color de la nube: violeta y verde lo tóxico (como los Pedos), verde el veneno, gris la niebla y el humo, blanco el talco.
    const [c1, c2] = zonaDueloBocanadas(color, gris, i);
    g.addColorStop(0, `rgba(${c1},${(0.6 * apaga).toFixed(2)})`);
    g.addColorStop(0.55, `rgba(${c2},${(0.32 * apaga).toFixed(2)})`);
    g.addColorStop(1, `rgba(${c2},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function zonaDueloBocanadas(color, gris, i){
  const VIOLETA = ['205,160,255', '160,105,215'], VERDE = ['160,225,100', '120,190,70'];
  if(gris || (typeof NUBE_GRIS !== 'undefined' && color === NUBE_GRIS)) return ['236,239,246', '200,205,216'];
  if(typeof NUBE_HUMO !== 'undefined' && color === NUBE_HUMO) return ['110,110,118', '70,70,78'];
  if(typeof NUBE_TALCO !== 'undefined' && color === NUBE_TALCO) return ['255,255,252', '238,236,228'];
  if(typeof NUBE_TOXICA !== 'undefined' && color === NUBE_TOXICA) return i % 3 === 1 ? VIOLETA : VERDE;
  return i % 3 === 1 ? VERDE : VIOLETA;
}

/* ---------- la tirada de quien la creó, una para todos ---------- */
const zonaDueloTiradas = new Map();   // zonaId → la tirada (en la pantalla del GM, que arma las tandas)
function zonaDueloTiradaAnotar(zonaId, pdg){ if(zonaId && pdg) zonaDueloTiradas.set(zonaId, pdg); }
// → la tirada que ya hizo quien creó la zona (en una tanda anterior), o null si todavía no tiró.
async function zonaDueloTiradaGuardada(zonaId){
  if(!zonaId) return null;
  if(zonaDueloTiradas.has(zonaId)) return zonaDueloTiradas.get(zonaId);
  try{
    const q = await coleccionAreas().where('hab.zonaId', '==', zonaId).get();
    let mejor = null, cuando = -1;
    q.forEach(doc => { const a = doc.data(); const ms = a.creado && a.creado.toMillis ? a.creado.toMillis() : 0; if(a.pdgCompartido && ms > cuando){ mejor = a.pdgCompartido; cuando = ms; } });
    if(mejor) zonaDueloTiradas.set(zonaId, mejor);
    return mejor;
  }catch(err){ console.error('Zona: no se pudo leer la tirada guardada', err); return null; }
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
    contra: [{modo: resStat, stat: resStat, etq: etqRes}], dano, efectos, sinDodge: true, zonaId: el.id, detalle: detalle.slice(0, 600)};
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
  if(t0 && zonaSpecDe(el).duelo && performance.now() - t0 < ZONA_DUELO_EXPANDE_MS + 2000) return;   // recién tirada: la primera tanda ya lo incluye (solo las de `duelo`, que la arma quien la creó)
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
/* 💀 El «cae» de la tabla (el desmayo: la vida a 0) o, con `muere` (dueño, 2026-11-09, el 20 natural de los Pedos: «dice desmayo pero en realidad
   muere»), la muerte de verdad: un personaje queda muerto del todo (`S.muerto.definitivo`, como cuando se le acaban los turnos de inconsciente:
   sin Revivir), una invocación y un creep con la vida en 0 (para un creep, eso ya es derrotado: no tiene un «inconsciente» aparte). Un jefe no
   llega acá: lo frena `zonaDueloJefe`. */
async function zonaDueloCaer(t, d, spec){
  const nom = nombreDe(t), muere = !!(spec && spec.muere);
  const aMano = {manual: true, nota: muere ? `${nom} muere: ponele la vida en 0 y marcalo muerto a mano` : `${nom} cae: ponele la vida en 0 a mano`};
  try{
    if(t.tipo === 'creep'){ await modificarCreep(t.fichaId, sc => { sc.hp = 0; }); }
    else if(String(t.fichaId || '').includes(SEP_INVOCACION)){ await cambiarVidaPj({fichaId: t.fichaId}, null, '0'); }
    else{
      const ok = await editarPersonajeMapa(t.fichaId, S => {
        FichaAcciones.fijarHp(S, 0); FichaAcciones.revisarMuerte(S);
        if(muere) S.muerto = {activo: true, turnos: 0, definitivo: true};   // muerto del todo (comun/ficha-mantenimiento.js contarMuerte)
        return true;
      });
      if(ok === null) return aMano;
    }
    return {nota: muere ? `💀 ${nom} muere` : `💀 ${nom} se desmaya (la vida a 0)`};
  }catch(err){ console.error('Zona con duelo: no se pudo aplicar el «cae»', err); return aMano; }
}
/* 🛡 Protección de jefe contra la tabla (dueño, 2026-11-09: «el boss protection debe prevenir esta muerte»; «también previene el stun»): a un creep
   jefe el renglón que le toca no le aplica si es caer / morir o un estado del que el jefe es inmune (Combatiente.JEFE_INMUNE: Stun, Sueño…); le toca
   el renglón más alto de abajo que sí le aplica (en los Pedos: Pajaritos, que el jefe recibe por 1 turno), o nada. → null si no es un jefe o el
   renglón le aplica; si no, {spec (el de reemplazo, o null), nota}. */
async function zonaDueloEsJefe(t){
  if(!t || t.tipo !== 'creep' || !t.fichaId) return false;
  const e = typeof creepsPriv !== 'undefined' ? creepsPriv.get(t.fichaId) : null;
  if(e && e.sc) return !!e.sc.jefe;
  try{ const doc = await fbDb.doc(fbRutaCampana(`creeps/${t.fichaId}/privado/ficha`)).get(); return !!(doc.exists && (JSON.parse(doc.data().json || '{}') || {}).jefe); }
  catch(err){ return false; }
}
const zonaDueloJefeFrena = f => !f || f.caer || (f.estado && Combatiente.JEFE_INMUNE.includes(String(f.estado.nombre || '').trim().toLowerCase()));
async function zonaDueloJefe(t, ef, spec){
  if(!ef || !ef.porTirada || !spec) return null;
  const fila = spec.caer ? {caer: true} : {estado: spec};
  if(!zonaDueloJefeFrena(fila) || !(await zonaDueloEsJefe(t))) return null;
  const tabla = Combatiente.porTiradaNorm(ef.porTirada), hasta = ef.res && Number.isFinite(Number(ef.res.dado)) ? Number(ef.res.dado) : 999;
  const resp = tabla.filter(f => f.desde <= hasta && !zonaDueloJefeFrena(f)).pop() || null;
  const base = '🛡 Protección de jefe: sin Stun ni muerte', nota = `${base}${resp ? ` · le queda ${Combatiente.porTiradaFilaTxt(resp)}` : ' · no le pasa nada'}`;
  return {spec: resp ? {...resp.estado} : null, nota, base};
}

// ☠ La Nube tóxica de los creeps (2026-11-09): el estado de la zona entró por el duelo → se anota en zonaResueltos, como lo hacía el cartel (js/08),
// así su `unaVez` / `sumaUno` siguen igual (envenenado, la nube no le vuelve a tirar: al entrar o al pasar la ronda adentro le suma 1 stack).
async function zonaDueloAnotar(zonaId, tokenId, nombreEstado){
  const el = elementos.get(zonaId);
  if(!el || !el.zonaEstado || !tokenId) return;
  const e = zonaSpecDe(el);
  if(!e.nombre || (nombreEstado && nombreEstado !== e.nombre)) return;
  if((el.zonaResueltos || []).includes(tokenId)) return;
  try{ await coleccionElementos().doc(zonaId).update({zonaResueltos: firebase.firestore.FieldValue.arrayUnion(tokenId)}); }
  catch(err){ console.error('Zona con duelo: no se pudo anotar zonaResueltos', err); }
}
