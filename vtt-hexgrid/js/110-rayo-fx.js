// js/110-rayo-fx.js — 🔢⚡ Lo que se ve de un golpe que salta (dueño, 2026-11-09, probando el Escudo elemental de rayo: «no queda claro cuánto daño le
// hace a cada uno… quiero que al saltar de personaje en personaje, aparezca en el token un número en rojo con "-x", que ascienda, se mantenga algún
// tiempo, y luego de terminar se abra un pop up con un reporte con el detalle del efecto»; «si se aplica la parálisis… "¡Parálisis!" flotando»;
// y el mismo día: «quiero que se aplique a cualquier fuente de daño eléctrico con salto»).
//
// Un solo ayudante para todas las fuentes: el salto general del rayo (dueloCadena, js/13: varitas, Cadena de rayos, Centella / Zap, la Carga
// eléctrica, el daño eléctrico de un arma), la flecha que salta (js/33), el rayo que corre por el agua (js/50) y el Escudo elemental (js/106, de
// cualquier elemento, salte o no). Publica UN momento «rayo» que ven todas las pantallas (rayoMomento, js/16):
//   - la animación de cada salto (i × 450 ms; el rayo llega en 350 ms);
//   - sobre cada token, el «−X» rojo que entró, cuando le llega (sube, se queda y se apaga; ganchoEvaEmpezar, js/96);
//   - el estado que le entró («¡Parálisis!», «¡Quemadura!»…), un poco después y arriba del número;
//   - al terminar, el reporte (AvisoCombate): a quién, cuánto (vida antes → después), golpe o salto, los estados, a quién saltó. Lo ve el GM y el
//     jugador que tenga algún token en el reporte.
// Además deja una línea clara en la Mesa: «⚡ Escudo eléctrico de X: Larry −5 (golpe), Rockardo −2 (salto) · Rockardo: Parálisis».
//
// g = {titulo, icono, fuente (texto corto para la Mesa), golpe: {id, entro, antes, despues, estados: [txt…], notas: [txt…], etiqueta} | null,
//      saltos: [{id, desde, dano, entro, antes, despues, estados: [txt…]}], extra: [txt…], resultado (texto de la Crónica, opcional), mesa: true}
const RAYO_FX_SALTO_MS = 450, RAYO_FX_LLEGA_MS = 350, RAYO_FX_NUM_MS = 2600;
function rayoFxNombre(id){ const t = tokens.get(id); return !t ? '¿?' : t.oculto ? 'Alguien' : nombreDe(t); }
function rayoFxVida(x){ return x && x.antes !== undefined && x.antes !== null && x.despues !== undefined && x.despues !== null ? ` (${fmt(x.antes)} → ${fmt(x.despues)} de vida)` : ''; }
function rayoFxArmar(g){
  const flotan = [], pasos = [], mesa = [], estadosMesa = [];
  const icono = g.icono || '⚡';
  const golpe = g.golpe && g.golpe.id && tokens.get(g.golpe.id) ? g.golpe : null;
  const saltos = (g.saltos || []).filter(s => s && tokens.get(s.id));
  const base = golpe ? RAYO_FX_LLEGA_MS + 150 : 0;   // los saltos arrancan después del «−X» del golpe
  if(golpe){
    const nom = rayoFxNombre(golpe.id), est = (golpe.estados || []).filter(Boolean);
    flotan.push({a: golpe.id, texto: `−${fmt(golpe.entro)}`, retraso: 0, dur: RAYO_FX_NUM_MS});
    est.forEach((e, k) => flotan.push({a: golpe.id, texto: `¡${e}!`, retraso: 350 + k * 250, dur: RAYO_FX_NUM_MS, fila: 1 + k}));
    pasos.push({titulo: `${icono} ${nom} · ${golpe.etiqueta || 'golpe'}`, texto: [`Le entraron ${fmt(golpe.entro)} de daño${rayoFxVida(golpe)}.`,
      ...(golpe.notas || []), ...(est.length ? [`Estado: ${est.join(', ')}.`] : [])].join('\n')});
    mesa.push(`${nom} −${fmt(golpe.entro)} (${golpe.etiqueta || 'golpe'})`);
    if(est.length) estadosMesa.push(`${nom}: ${est.join(', ')}`);
  }
  saltos.forEach((s, i) => {
    const nom = rayoFxNombre(s.id), est = (s.estados || []).filter(Boolean), llega = base + i * RAYO_FX_SALTO_MS + RAYO_FX_LLEGA_MS;
    flotan.push({a: s.id, texto: `−${fmt(s.entro)}`, retraso: llega, dur: RAYO_FX_NUM_MS});
    est.forEach((e, k) => flotan.push({a: s.id, texto: `¡${e}!`, retraso: llega + 350 + k * 250, dur: RAYO_FX_NUM_MS, fila: 1 + k}));
    pasos.push({titulo: `⚡ Salto ${i + 1}: ${rayoFxNombre(s.desde)} → ${nom}`, texto: [`Le llegan ${fmt(s.dano)}${num(s.entro) !== num(s.dano) ? `; con su resistencia, le entraron ${fmt(s.entro)}` : ''}${rayoFxVida(s)}.`,
      ...(est.length ? [`Estado: ${est.join(', ')}.`] : [])].join('\n')});
    mesa.push(`${nom} −${fmt(s.entro)} (salto)`);
    if(est.length) estadosMesa.push(`${nom}: ${est.join(', ')}`);
  });
  (g.extra || []).filter(Boolean).forEach(x => pasos.push({titulo: 'Además', texto: String(x)}));
  const fin = flotan.reduce((m, f) => Math.max(m, num(f.retraso)), 0) + RAYO_FX_NUM_MS * 0.7;
  const total = (golpe ? num(golpe.entro) : 0) + saltos.reduce((a, s) => a + num(s.entro), 0);
  const reporte = pasos.length ? {icono, titulo: g.titulo || `${icono} El rayo`, pasos,
    veredicto: {tono: 'malo', grande: `−${fmt(total)}`, chico: `${saltos.length ? `${saltos.length} salto${saltos.length === 1 ? '' : 's'}` : 'sin saltos'}${estadosMesa.length ? ' · ' + estadosMesa.join(' · ') : ''}`},
    ids: [...new Set([golpe ? golpe.id : null, ...saltos.map(s => s.id), ...saltos.map(s => s.desde)].filter(Boolean))]} : null;
  const lineaMesa = `${icono} ${g.fuente || g.titulo || 'El rayo'}: ${mesa.join(', ')}${estadosMesa.length ? ' · ' + estadosMesa.join(' · ') : ''}`;
  return {flotan, reporte, fin: Math.round(fin), lineaMesa, saltos: saltos.map(s => ({desde: s.desde, hacia: s.id})), base};
}
// Publica todo (un momento que ven todas las pantallas) y deja la línea en la Mesa. → la línea.
function rayoFxPublicar(g){
  const a = rayoFxArmar(g || {});
  if(!a.flotan.length) return '';
  if(g.mesa !== false) try{ mesaLinea(a.lineaMesa, 'recordatorio'); }catch(e){}
  const datos = {saltos: a.saltos, saltoBase: a.base, flotan: a.flotan, ...(a.reporte ? {reporte: a.reporte, reporteEn: a.fin} : {})};
  const m = {tipo: 'rayo', icono: g.icono || '⚡', titulo: g.titulo || 'El rayo', estado: 'listo', datos, resultado: g.resultado || a.lineaMesa};
  Promise.resolve(typeof momentoAbrir === 'function' ? momentoAbrir(m) : null).then(id => { if(!id) rayoFxReproducir(datos); }).catch(() => rayoFxReproducir(datos));
  return a.lineaMesa;
}
// Lo que hace cada pantalla al recibirlo (rayoMomento, js/16; o acá mismo si no se pudo publicar).
function rayoFxReproducir(dt){
  if(!dt) return;
  const base = Math.max(0, num(dt.saltoBase));
  if(Array.isArray(dt.saltos) && typeof rayoSaltoEfecto === 'function') dt.saltos.forEach((s, i) => setTimeout(() => rayoSaltoEfecto(s.desde, s.hacia), base + i * RAYO_FX_SALTO_MS));
  if(Array.isArray(dt.flotan) && typeof ganchoEvaEmpezar === 'function') dt.flotan.forEach(f => ganchoEvaEmpezar(f));
  if(dt.reporte && rayoFxMeToca(dt.reporte)) setTimeout(() => rayoFxReporte(dt.reporte), Math.max(0, num(dt.reporteEn)));
}
// El reporte: el GM, y el jugador que tenga algún token adentro.
function rayoFxMeToca(rep){
  if(typeof soyGM !== 'undefined' && soyGM) return true;
  const uid = typeof fbUsuario !== 'undefined' && fbUsuario ? fbUsuario.uid : '';
  return !!uid && (rep.ids || []).some(id => { const t = tokens.get(id); return t && t.tipo !== 'creep' && (t.duenoUid === uid || (typeof puedoMover === 'function' && puedoMover(t))); });
}
function rayoFxReporte(rep){
  if(typeof AvisoCombate === 'undefined' || !AvisoCombate.mostrar) return;
  try{ AvisoCombate.mostrar({icono: rep.icono || '⚡', titulo: rep.titulo, pasos: rep.pasos, veredicto: rep.veredicto}); }catch(err){ console.error('El reporte del rayo:', err); }
}
