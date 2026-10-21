/* ---------- 🤺 Desarmar (2026-10-21, dueño; choque pesado) ----------
   Una habilidad Flash (`desarmar`) que se usa en el paso del Bloqueo de un duelo (hubo Parry: arma contra arma o contra escudo), por quien ataca
   (en vez de su Fuerza del golpe) o por quien defiende (en vez de su Bloqueo). La tirada es la misma; cambia el resultado: si gana quien desarma,
   el otro pierde lo que tenía en la mano en ese cruce (el arma de quien atacaba, o el arma o el escudo con que paró), que sale volando 2 casillas
   en una dirección al azar —una ruleta de casillas que se ve en todas las pantallas— y queda en el piso (js/27). Eso reemplaza el resultado de
   siempre (sin la mitad del daño, sin contraataque). Si pierde, lo de siempre. Lo natural (garras, colmillos, un caparazón) no se cae.
   El GM la usa desde su botón instantáneo 🤺 (Flotantes.desarmar), que aparece solo en un duelo en el paso del Bloqueo con un creep que la tenga
   lista: al costado del duelo abierto, o arriba si está minimizado. Cuesta su SP o su cooldown; en turno ajeno, el doble (Flash). */
const DESARME_CASILLAS = 2, DESARME_RULETA_MS = 2600, DESARME_QUIETO_MS = 1100;
let desarmeDuelos = new Map(), desarmeEscucha = null;
// Los duelos abiertos (solo el GM: maneja a los creeps).
function desarmeEscuchar(){
  if(desarmeEscucha || !soyGM || !fbDb || typeof fbRutaCampana !== 'function') return;
  desarmeEscucha = fbDb.collection(fbRutaCampana('duelos')).where('estado', '==', 'esperando').onSnapshot(q => {
    desarmeDuelos = new Map(q.docs.map(x => [x.id, x.data()]));
    try{ renderDesarmarBoton(); }catch(e){}
  }, err => { console.error('Desarmar: no se pudieron escuchar los duelos', err); desarmeEscucha = null; });
}
// Las opciones de ahora: [{d, id, lado, sc, h, tokenId, motivo}] (un creep con Desarmar en un duelo en el paso del Bloqueo que todavía no tiró su parte).
function desarmeOpciones(){
  if(!soyGM || modoMapa !== 'combate') return [];
  const out = [];
  for(const [id, d] of desarmeDuelos){
    if(!d || d.fase !== 'bloqueo' || d.desarme || d.hab) continue;
    for(const lado of ['atacante', 'defensor']){
      if(lado === 'atacante' ? d.fuerza : d.bloqueo) continue;
      const p = d[lado];
      if(!p || p.tipo !== 'creep') continue;
      const sc = creepPrivadoDe(p.ref);
      const h = sc && (sc.habilidades || []).find(x => x && x.desarmar);
      if(!h) continue;
      let motivo = '';
      try{ motivo = CreepCalculo.bloqueoHab(sc, h) || ''; }catch(e){}
      if(!motivo) out.push({d, id, lado, sc, h, tokenId: p.tokenId});
    }
  }
  return out;
}
function renderDesarmarBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.desarmar) return;
  desarmeEscuchar();
  const ops = desarmeOpciones();
  if(!ops.length){ Flotantes.desarmar(null); return; }
  const o = ops[0], otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
  Flotantes.desarmar({mostrar: true, sub: ops.length === 1 ? `${o.sc.nombre}: desarmar a ${otro.nombre} en el Bloqueo` : `${ops.length} creeps pueden desarmar`, alClic: () => abrirDesarmar()});
}
setInterval(() => { try{ renderDesarmarBoton(); }catch(e){} }, 1500);

function desarmeCosto(o){
  const ajeno = typeof esSuTurno === 'function' && esSuTurno(o.tokenId) === false, k = ajeno ? 2 : 1;
  const sp = CreepCalculo.modoSP(o.sc) ? CreepCalculo.costoSpHab(o.sc, o.h) * k : 0, cd = num(o.h.cd) * k;
  return {ajeno, sp, cd, txt: CreepCalculo.modoSP(o.sc) ? `${fmt(sp)} SP` : `cooldown ${fmt(cd)}`};
}
function abrirDesarmar(){
  const ops = desarmeOpciones();
  if(!ops.length){ toast('Ya no hay un Bloqueo en el que se pueda desarmar'); return; }
  if(ops.length === 1){ desarmarUsar(ops[0]); return; }
  const botones = ops.slice(0, 6).map(o => { const k = desarmeCosto(o), otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
    return {fila: true, texto: `${o.sc.nombre} desarma a ${otro.nombre}`, detalle: `${o.lado === 'atacante' ? 'en vez de su Fuerza del golpe' : 'en vez de su Bloqueo'} · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`,
      alClic: () => { AvisoCombate.cerrar(); desarmarUsar(o); }}; });
  botones.push({texto: 'Cancelar', sec: true, alClic: () => AvisoCombate.cerrar()});
  AvisoCombate.mostrar({icono: '🤺', titulo: 'Desarmar', botones, texto: '¿Quién intenta desarmar?'});
}
async function desarmarUsar(o){
  const k = desarmeCosto(o), otro = o.d[o.lado === 'atacante' ? 'defensor' : 'atacante'];
  let ok = false;
  try{ ok = await Duelo.marcarDesarme(o.id, o.lado, {nombre: o.h.nombre || 'Desarmar', quien: o.sc.nombre}); }catch(err){ console.error('Desarmar: no se pudo marcar', err); }
  if(!ok){ toast('No se pudo: el Bloqueo ya se tiró o alguien ya intenta desarmar'); return; }
  try{
    await modificarCreep(String(o.sc.id || o.d[o.lado].ref), s => {
      const hh = (s.habilidades || []).find(x => x.id === o.h.id);
      if(CreepCalculo.modoSP(s)) s.sp = Math.max(0, num(CreepCalculo.spActual(s)) - k.sp);
      else if(hh) hh.cdActual = Math.max(num(hh.cdActual), k.cd);
      return {};
    });
  }catch(err){ console.error('Desarmar: no se pudo cobrar', err); toast(`✋ Cobrale a mano el Desarmar a ${o.sc.nombre} (${k.txt})`); }
  mesaLinea(`🤺 ${o.sc.nombre} intenta desarmar a ${otro.nombre}: ${o.lado === 'atacante' ? 'su Fuerza del golpe' : 'su Bloqueo'} vale como Desarmar · ${k.txt}${k.ajeno ? ' (Flash en turno ajeno: el doble)' : ''}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'desarme-intento', icono: '🤺', titulo: `${o.sc.nombre} intenta desarmar a ${otro.nombre}`, estado: 'listo', resultado: 'Si gana el Bloqueo, el otro pierde lo que tiene en la mano'}); }catch(e){}
}

/* El duelo terminó «desarmado» (gancho `desarmado` de Duelo.escuchar, js/14; solo el GM): la ruleta de casillas en todas las pantallas (un momento)
   y, cuando frena, el arma o el escudo al piso (armaSoltar, js/27) y, si era el arma, Desarmado. */
async function desarmadoResuelto(d){
  const ds = d.desarme || {}, ladoV = ds.lado === 'atacante' ? 'defensor' : 'atacante', v = d[ladoV], t = v && tokens.get(v.tokenId);
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
    datos: {celdas: celdas.map(c => [c.col, c.fila]), elegida}}); }catch(err){ console.error('Desarmar: el momento', err); }
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
function desarmeRuleta(id, datos){
  if(ruletaVistas.has(id) || !datos || !Array.isArray(datos.celdas) || !datos.celdas.length) return;
  ruletaVistas.add(id);
  const celdas = datos.celdas.map(([col, fila]) => hexCentro(col, fila)), n = celdas.length, fin = Math.max(0, Math.min(n - 1, num(datos.elegida)));
  // El recorrido: dos vueltas y hasta la elegida; cada paso un poco más lento.
  const pasos = n * 2 + fin + 1, tiempos = [];
  let acc = 0;
  for(let i = 0; i < pasos; i++){ tiempos.push(acc); const f = i / Math.max(1, pasos - 1); acc += 35 + 300 * f * f; }
  const escala = DESARME_RULETA_MS / acc;
  efectosRuleta.push({celdas, fin, pasos, tiempos: tiempos.map(x => x * escala), desde: Date.now()});
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
