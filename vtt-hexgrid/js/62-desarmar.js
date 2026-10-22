/* ---------- 🤺 Desarmar (2026-10-21, dueño; choque pesado) ----------
   Una habilidad Flash (`desarmar`) que se usa en el paso del Bloqueo de un duelo (hubo Parry: arma contra arma o contra escudo), por quien ataca
   (en vez de su Fuerza del golpe) o por quien defiende (en vez de su Bloqueo). La tirada es la misma; cambia el resultado: si gana quien desarma,
   el otro pierde lo que tenía en la mano en ese cruce (el arma de quien atacaba, o el arma o el escudo con que paró), que sale volando 2 casillas
   en una dirección al azar —una ruleta de casillas que se ve en todas las pantallas— y queda en el piso (js/27). Eso reemplaza el resultado de
   siempre (sin la mitad del daño, sin contraataque). Si pierde, lo de siempre. Lo natural (garras, colmillos, un caparazón) no se cae.
   El botón instantáneo 🤺 (Flotantes.desarmar) aparece solo en un duelo en el paso del Bloqueo con alguien que la tenga lista y que maneje esta
   pantalla: un creep (el GM; su SP o su cooldown, el doble en turno ajeno) o un personaje con la skill del Warrior (`resumen.desarmar`, su dueño o
   quien tiene 🎮 el control; 3 SP, 6 en turno ajeno, con ConfirmarTurno.flash). Al costado del duelo abierto, o arriba si está minimizado. */
const DESARME_CASILLAS = 2, DESARME_RULETA_MS = 4300, DESARME_QUIETO_MS = 1300, DESARME_VUELTAS = 3;   // (2026-10-22: más larga, frena de a poco)
let desarmeDuelos = new Map(), desarmeEscucha = null;
// Los duelos abiertos (solo el GM: maneja a los creeps).
function desarmeEscuchar(){
  if(desarmeEscucha || !fbDb || !fbUsuario || typeof fbRutaCampana !== 'function') return;
  desarmeEscucha = fbDb.collection(fbRutaCampana('duelos')).where('estado', '==', 'esperando').onSnapshot(q => {
    desarmeDuelos = new Map(q.docs.map(x => [x.id, x.data()]));
    try{ renderDesarmarBoton(); }catch(e){}
  }, err => { console.error('Desarmar: no se pudieron escuchar los duelos', err); desarmeEscucha = null; });
}
// Las opciones de ahora: [{d, id, lado, nombre, tokenId, sc, h | pj}] (un creep o un personaje con Desarmar en un duelo en el paso del Bloqueo que
// todavía no tiró su parte).
/* Quién puede desarmar (dueño, 2026-10-22): no se declara en el turno («como quien tira pegar fuerte»): la ocasión se da solo en el Bloqueo
   que sigue a un Parry ganado, en vez de la Fuerza del golpe (quien ataca) o de bloquear (quien defiende). Quien defiende, solo si paró con el
   arma, no con el escudo. Lo que le saca al otro puede ser un arma o un escudo. Una bestia con garras también desarma (dueño: «el mecanismo debe
   existir como posible; cuándo sí o no lo define la mesa»); lo único es que su propia arma natural no se le cae (armaSoltar, js/27). → la opción, o null. */
function desarmeOpcion(id, d, lado){
  if(!d || d.fase !== 'bloqueo' || d.estado !== 'esperando' || (d.ataque && d.ataque.desarme) || d.hab || !d.ataque) return null;
  if(!d.defensa || d.defensa.modo !== 'parry') return null;
  if(lado === 'atacante' ? d.fuerza : d.bloqueo) return null;
  if(lado === 'defensor' && d.defensa.escudo) return null;   // paró con el escudo: bloquea, no desarma
  // Contra algo natural (garras, colmillos, una coraza natural) no se ofrece: no se le puede caer (dueño, 2026-10-22).
  if(lado === 'atacante' && d.defensa.natural) return null;
  if(lado === 'defensor' && (d.ataque.natural || desarmeAtacanteNatural(d))) return null;
  const p = d[lado];
  if(p && p.tipo === 'pj' && p.ref && !String(p.ref).includes(SEP_INVOCACION) && bnManejo(p.ref)){   // 🤺 el Warrior (2026-10-21)
    const r = (fichasPub.get(p.ref) || {}).resumen || {}, k = r.desarmar;
    if(!k || r.muerto) return null;
    const ajeno = typeof esSuTurno === 'function' && esSuTurno(p.tokenId) === false;
    const costo = ajeno ? (num(k.spAjeno) || num(k.sp) * 2) : num(k.sp);
    return num(r.sp) >= costo ? {d, id, lado, nombre: p.nombre, tokenId: p.tokenId, pj: {fichaId: p.ref, ...k}} : null;
  }
  if(!soyGM || !p || p.tipo !== 'creep') return null;
  const sc = creepPrivadoDe(p.ref);
  const h = sc && (sc.habilidades || []).find(x => x && x.desarmar);
  if(!h) return null;
  let motivo = '';
  try{ motivo = CreepCalculo.bloqueoHab(sc, h) || ''; }catch(e){}
  return motivo ? null : {d, id, lado, nombre: sc.nombre, sc, h, tokenId: p.tokenId};
}
// Para los duelos que no traen la marca: si el que ataca es un creep con arma natural (solo lo sabe el GM).
function desarmeAtacanteNatural(d){
  if(!d || !d.atacante || d.atacante.tipo !== 'creep' || typeof creepPrivadoDe !== 'function') return false;
  const sc = creepPrivadoDe(d.atacante.ref);
  return !!(sc && sc.armaNatural && (!d.ataque.armaNombre || d.ataque.armaNombre === sc.armaNombre));
}
// El gancho de comun/duelo.js (crear): ¿este ataque va con un arma natural? (un creep o una invocación con garras, colmillos…). Una invocación vive
// en la ficha de su dueño: se lee (invDeToken, js/10) — por eso es async (2026-10-22, dueño: «lo de las invocaciones, ¿no se puede resolver?»).
window.dueloArmaNatural = async (yo, ataque) => {
  if(!yo || !ataque) return false;
  if(yo.tipo === 'creep' && typeof creepPrivadoDe === 'function'){
    const sc = creepPrivadoDe(yo.ref);
    return !!(sc && sc.armaNatural && (!ataque.armaNombre || ataque.armaNombre === sc.armaNombre));
  }
  if(String(yo.ref || '').includes(SEP_INVOCACION) && typeof invDeToken === 'function'){
    const inv = await invDeToken({fichaId: yo.ref}).catch(() => null);
    return !!(inv && inv.armaNatural && (!ataque.armaNombre || ataque.armaNombre === inv.armaNombre));
  }
  return false;
};
function desarmeOpciones(){
  if(modoMapa !== 'combate') return [];
  const out = [];
  for(const [id, d] of desarmeDuelos) for(const lado of ['atacante', 'defensor']){ const o = desarmeOpcion(id, d, lado); if(o) out.push(o); }
  return out;
}
// Los ganchos del cuadro del duelo (comun/duelo.js): el botón «🤺 Desarmar» adentro del paso 3, al lado de la tirada.
window.dueloDesarmeOpcion = (d, lado) => {
  if(!d || !d.id) return null;
  const o = desarmeOpcion(d.id, d, lado);
  if(!o) return null;
  const k = desarmeCosto(o);
  return {costo: k.txt + (k.ajeno ? ' (turno ajeno: el doble)' : ''), titulo: `En vez de ${lado === 'atacante' ? 'tu Fuerza del golpe' : 'bloquear'}: si ganás, se le cae lo que tiene en la mano`};
};
window.dueloDesarmar = async (id, lado) => {
  const d = desarmeDuelos.get(id) || (await fbDb.collection(fbRutaCampana('duelos')).doc(id).get().then(s => s.exists ? {...s.data(), id} : null).catch(() => null));
  const o = desarmeOpcion(id, d, lado);
  if(!o){ toast('Ya no se puede desarmar en este duelo'); return false; }
  return await desarmarUsar(o);
};
function renderDesarmarBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.desarmar) return;
  desarmeEscuchar();
  const ops = desarmeOpciones();
  if(!ops.length){ Flotantes.desarmar(null); return; }
  const o = ops[0], otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
  Flotantes.desarmar({mostrar: true, sub: ops.length === 1 ? `${o.nombre}: desarmar a ${otro.nombre} en el Bloqueo${o.pj ? ` · ${fmt(desarmeCosto(o).sp)} SP` : ''}` : `${ops.length} pueden desarmar`, alClic: () => abrirDesarmar()});
}
setInterval(() => { try{ renderDesarmarBoton(); }catch(e){} }, 1500);

function desarmeCosto(o){
  const ajeno = typeof esSuTurno === 'function' && esSuTurno(o.tokenId) === false, k = ajeno ? 2 : 1;
  if(o.pj){ const sp = ajeno ? (num(o.pj.spAjeno) || num(o.pj.sp) * 2) : num(o.pj.sp); return {ajeno, sp, cd: 0, txt: `${fmt(sp)} SP`}; }
  const sp = CreepCalculo.modoSP(o.sc) ? CreepCalculo.costoSpHab(o.sc, o.h) * k : 0, cd = num(o.h.cd) * k;
  return {ajeno, sp, cd, txt: CreepCalculo.modoSP(o.sc) ? `${fmt(sp)} SP` : `cooldown ${fmt(cd)}`};
}
function abrirDesarmar(){
  const ops = desarmeOpciones();
  if(!ops.length){ toast('Desarmar se usa en el paso del Bloqueo de un duelo (después de un Parry): ahí aparece el botón 🤺 al costado del duelo'); return; }
  if(ops.length === 1){ desarmarUsar(ops[0]); return; }
  const botones = ops.slice(0, 6).map(o => { const k = desarmeCosto(o), otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
    return {fila: true, texto: `${o.nombre} desarma a ${otro.nombre}`, detalle: `${o.lado === 'atacante' ? 'en vez de su Fuerza del golpe' : 'en vez de su Bloqueo'} · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`,
      alClic: () => { AvisoCombate.cerrar(); desarmarUsar(o); }}; });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🤺', titulo: 'Desarmar', botones, texto: '¿Quién intenta desarmar?'});
}
async function desarmarUsar(o){
  let k = desarmeCosto(o);
  const otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
  if(o.pj){   // el Warrior: pregunta el Flash (en turno ajeno, el doble) antes de marcar
    const pago = await ConfirmarTurno.flash('Desarmar', {sp: num(o.pj.sp)}, {quien: o.nombre, spAjeno: num(o.pj.spAjeno) || num(o.pj.sp) * 2, ident: {nombre: o.nombre, ref: o.pj.fichaId}});
    if(!pago) return false;
    k = {...k, sp: num(pago.sp), txt: `${fmt(num(pago.sp))} SP`};
  }
  let ok = false;
  try{ ok = await Duelo.marcarDesarme(o.id, o.lado, {nombre: (o.h && o.h.nombre) || 'Desarmar', quien: o.nombre}); }catch(err){ console.error('Desarmar: no se pudo marcar', err); }
  if(!ok){ toast('No se pudo: el Bloqueo ya se tiró o alguien ya intenta desarmar'); return false; }
  if(o.pj){
    let falta = null;
    const cobro = await editarPersonajeMapa(o.pj.fichaId, async S => {
      const disp = Math.max(0, FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado));
      if(disp < k.sp){ falta = disp; return false; }
      FichaAcciones.gastarSp(S, k.sp, {fijarHp: v => mantFijarHp(S, v), toast}, 'Desarmar');   // 🩸 Maldito
      return true;
    }).catch(err => { console.error('Desarmar: no se pudo cobrar', err); return false; });
    if(!cobro) toast(falta !== null ? `✋ No te alcanzaba el SP (tenés ${fmt(falta)}): ajustalo a mano` : `✋ Cobrale a mano el Desarmar a ${o.nombre} (${k.txt})`);
  }else try{
    await modificarCreep(String(o.sc.id || o.d[o.lado].ref), s => {
      const hh = (s.habilidades || []).find(x => x.id === o.h.id);
      if(CreepCalculo.modoSP(s)) s.sp = Math.max(0, num(CreepCalculo.spActual(s)) - k.sp);
      else if(hh) hh.cdActual = Math.max(num(hh.cdActual), k.cd);
      return {};
    });
  }catch(err){ console.error('Desarmar: no se pudo cobrar', err); toast(`✋ Cobrale a mano el Desarmar a ${o.nombre} (${k.txt})`); }
  mesaLinea(`🤺 ${o.nombre} intenta desarmar a ${otro.nombre}: ${o.lado === 'atacante' ? 'su Fuerza del golpe' : 'su Bloqueo'} vale como Desarmar · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'desarme-intento', icono: '🤺', titulo: `${o.nombre} intenta desarmar a ${otro.nombre}`, estado: 'listo', resultado: 'Si gana el Bloqueo, el otro pierde lo que tiene en la mano'}); }catch(e){}
  return true;
}

/* El duelo terminó «desarmado» (gancho `desarmado` de Duelo.escuchar, js/14; solo el GM): la ruleta de casillas en todas las pantallas (un momento)
   y, cuando frena, el arma o el escudo al piso (armaSoltar, js/27) y, si era el arma, Desarmado. */
async function desarmadoResuelto(d){
  // Primero el cartel «X desarmó a Y» con Aceptar (comun/duelo.js; dueño, 2026-10-22, atacando o defendiendo); la ruleta, recién después.
  if(d.ataque && d.ataque.desarme && !d.ataque.desarme.aceptado){
    const ok = await new Promise(fin => {
      const baja = fbDb.collection(fbRutaCampana('duelos')).doc(d.id).onSnapshot(s => {
        const x = s.exists ? s.data() : null;
        if(!x){ baja(); fin(false); return; }
        if(x.ataque && x.ataque.desarme && x.ataque.desarme.aceptado){ baja(); fin(true); }
      }, err => { console.error('Desarmar: esperando el Aceptar', err); fin(true); });
    });
    if(!ok) return;
  }
  const ds = (d.ataque && d.ataque.desarme) || {}, ladoV = ds.lado === 'atacante' ? 'defensor' : 'atacante', v = d[ladoV], t = v && tokens.get(v.tokenId);
  const gano = (d[ds.lado] || {}).nombre || 'Alguien';
  if(!t){ mesaLinea(`🤺 ${gano} desarmó a ${(v && v.nombre) || 'alguien'}: ✋ dejá su arma en el piso a mano`, 'recordatorio'); return; }
  const itemId = ladoV === 'defensor' ? ((d.defensa && d.defensa.itemId) || '') : ((d.ataque && d.ataque.armaId) || '');
  const itemNombre = ladoV === 'defensor' ? ((d.defensa && d.defensa.itemNombre) || 'lo que tenía en la mano') : ((d.ataque && d.ataque.armaNombre) || 'su arma');
  // Las casillas a 2 de distancia (sin Sólidos); si no hay ninguna, la suya.
  const anillo = [];
  for(let dc = -3; dc <= 3; dc++) for(let df = -3; df <= 3; df++){
    const c = {col: t.col + dc, fila: t.fila + df};
    if(distanciaHex(t, c) === DESARME_CASILLAS && !elementoSolidoEn(c.col, c.fila)) anillo.push(c);
  }
  const celdas = anillo.length ? anillo : [{col: t.col, fila: t.fila}];
  const elegida = Math.floor(Math.random() * celdas.length);
  try{ momentoAbrir({tipo: 'desarme', icono: '🤺', titulo: `¡${gano} desarma a ${nombreDe(t)}!`, estado: 'listo', resultado: `${itemNombre} sale volando ${DESARME_CASILLAS} casillas`,
    datos: {celdas: celdas.map(c => ({c: c.col, f: c.fila})), elegida, duelo: d.id}}); }catch(err){ console.error('Desarmar: el momento', err); }   // (objetos: Firestore no guarda listas dentro de listas)
  await new Promise(r => setTimeout(r, DESARME_RULETA_MS + 300));
  const s = await armaSoltar(t, 0, {celda: celdas[elegida], itemId, itemNombre});
  // Si lo que se cayó es su arma (no un escudo), queda Desarmado (un creep no la pierde de sus datos: el estado lo frena hasta levantarla).
  if(s && s.cayo && !s.escudo){
    try{ await dueloAplicarEfectoBase({...d, defensor: {...v}}, {nombre: 'Desarmado', caras: 1, exitos: 1, dado: '', detalle: 'Lo desarmaron: su arma está en el piso.', spec: {nombre: 'Desarmado'}}); }
    catch(err){ console.error('Desarmar: el estado', err); }
  }
  mesaLinea(`🤺 ${gano} desarmó a ${nombreDe(t)}: ${s && s.nota ? s.nota : itemNombre + ' al piso'}`, 'recordatorio');
}

// 🎡 La ruleta de casillas (en todas las pantallas, desde el momento «desarme», js/16): se iluminan de a una, rápido y frenando hasta la elegida.
const efectosRuleta = [];
const ruletaVistas = new Set();
async function desarmeRuleta(id, datos){
  if(ruletaVistas.has(id) || !datos || !Array.isArray(datos.celdas) || !datos.celdas.length) return;
  ruletaVistas.add(id);
  // Llega después del Aceptar del cartel «X desarmó a Y» (los dados ya quedaron quietos): el cuadro del duelo se minimiza y gira la ruleta; al
  // terminar, el cuadro vuelve con el resultado y «Terminar duelo» (dueño, 2026-10-22; Duelo.desarmeListo).
  try{ if(typeof Duelo !== 'undefined' && Duelo.minimizar) Duelo.minimizar(); }catch(e){}
  if(datos.duelo) setTimeout(() => { try{ if(typeof Duelo !== 'undefined' && Duelo.desarmeListo) Duelo.desarmeListo(datos.duelo); }catch(e){ console.error(e); } }, DESARME_RULETA_MS + DESARME_QUIETO_MS);
  const crudas = datos.celdas.map(x => Array.isArray(x) ? hexCentro(x[0], x[1]) : hexCentro(x.c, x.f)), n = crudas.length;
  const elegida = Math.max(0, Math.min(n - 1, num(datos.elegida)));
  // Una ruleta de verdad (dueño, 2026-10-22: «que el brillo gire en círculos alrededor del personaje»): las casillas en orden, por el ángulo
  // alrededor del centro del anillo (el personaje), en el sentido de las agujas del reloj. Antes iban en el orden de la grilla y saltaban.
  const cx = crudas.reduce((a, p) => a + p.x, 0) / n, cy = crudas.reduce((a, p) => a + p.y, 0) / n;
  const orden = crudas.map((p, i) => i).sort((a, b) => Math.atan2(crudas[a].y - cy, crudas[a].x - cx) - Math.atan2(crudas[b].y - cy, crudas[b].x - cx));
  const celdas = orden.map(i => crudas[i]), fin = orden.indexOf(elegida);
  // El recorrido: tres vueltas y hasta la elegida, frenando parejo como una rueda que pierde velocidad (2026-10-22, dueño: «la desaceleración
  // un poquito más paulatina»): la posición sigue una curva de frenado constante (cuadrática), así cada paso dura un poco más que el anterior
  // desde el principio, en vez de ir rápido casi todo el tiempo y frenar de golpe al final.
  const pasos = n * DESARME_VUELTAS + fin + 1, tiempos = [];
  for(let i = 0; i < pasos; i++) tiempos.push(DESARME_RULETA_MS * (1 - Math.sqrt(1 - i / pasos)));
  efectosRuleta.push({celdas, fin, pasos, tiempos, desde: Date.now()});
  pedirDibujo();
}
function dibujarEfectosRuleta(){
  const ahora = Date.now();
  let activo = false;
  for(let i = efectosRuleta.length - 1; i >= 0; i--){
    const fx = efectosRuleta[i], edad = ahora - fx.desde;
    if(edad > DESARME_RULETA_MS + DESARME_QUIETO_MS){ efectosRuleta.splice(i, 1); continue; }
    let k = 0;
    while(k + 1 < fx.tiempos.length && fx.tiempos[k + 1] <= edad) k++;
    const actual = edad >= DESARME_RULETA_MS ? fx.fin : k % fx.celdas.length, quieto = edad >= DESARME_RULETA_MS;
    ctx.save();
    fx.celdas.forEach((p, j) => {
      ctx.beginPath(); trazarHex(p.x, p.y);
      if(j === actual){
        const pulso = quieto ? 0.55 + 0.35 * Math.sin(edad / 90) : 0.7;
        ctx.fillStyle = `rgba(255,205,90,${pulso})`; ctx.fill();
        ctx.lineWidth = quieto ? 4 : 3; ctx.strokeStyle = '#fff2c4'; ctx.stroke();
      }else{
        ctx.fillStyle = 'rgba(255,205,90,.08)'; ctx.fill();
        ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,205,90,.45)'; ctx.stroke();
      }
    });
    if(quieto){ const p = fx.celdas[fx.fin]; ctx.font = `${Math.round(HEX * 0.9)}px system-ui,sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('🗡', p.x, p.y); }
    ctx.restore();
    activo = true;
  }
  return activo;
}
