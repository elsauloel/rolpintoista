/* =========================================================
   🏹 LAS MECÁNICAS DE ARCO AL APUNTAR (2026-10-11, dueño; docs/ideas-arcos-flechas.md, «Lo que eligió el dueño de la segunda ronda»).
   Después de la línea de tiro, la distancia ideal (js/32) y la apuntada (js/13), el disparo suma lo que trae el arma (Combatiente.RASGOS_ARCO;
   valen en cualquier arma de rango):
   - Largo alcance: más allá del alcance (hasta Combatiente.LARGO_ALCANCE_MAX de más), −N PdG por casillero de más.
   - Emboscada: el primer disparo de ese tirador desde que el mapa pasó a combate, Crítico frecuente +N (se libera al volver a narrativo, js/25).
   - Matabestias: +N de daño contra un creep cuyo tipo de criatura es bestia (lo publica CreepCalculo.tarjetaPublica).
   - Contra el Marcado: +N PdG contra un Marcado.
   - Espalda a distancia: si todos los casilleros que cruza el disparo están en el punto ciego del objetivo (sin sigilo).
   - Tensar: pregunta si se tensa a fondo (1 No2 más → +N PdG); lo paga `msg.alTensar(costo)` de quien dispara (sin eso, no se ofrece).
   Todo va al `tiro` del duelo ({pdg, crit, critpot, fijo, ignora, motivo}), como la distancia ideal. Nunca traba el disparo.
   ========================================================= */
const emboscadaUsadas = new Set();
const primerDisparoUsados = new Set();   // el +1 dado del primer disparo del combate (se libera con la Emboscada, js/25)
function arcoSumar(tiro, o, motivo){
  tiro = tiro || {motivo: ''};
  Object.keys(o).forEach(k => { if(num(o[k])) tiro[k] = num(tiro[k]) + num(o[k]); });
  tiro.motivo = tiro.motivo ? `${tiro.motivo} y ${motivo}` : motivo;
  return tiro;
}
// ¿Todos los casilleros que cruza el disparo (sin el del objetivo) están en su punto ciego? El mismo «atrás» que porLaEspalda (js/13).
function arcoPorLaEspalda(atq, def){
  if(!atq || !def) return false;
  const k = ((Math.round(num(def.rotacion || 0) / 60) % 6) + 6) % 6;
  const rot = k * 60 * Math.PI / 180, bx = Math.sin(rot), by = -Math.cos(rot);
  const d = hexCentro(def.col, def.fila);
  const enCiego = c => {
    const p = hexCentro(c.col, c.fila), vx = p.x - d.x, vy = p.y - d.y, largo = Math.hypot(vx, vy);
    if(!largo) return true;
    return Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / largo))) * 180 / Math.PI < VISION_CUNA_CIEGA - 1;
  };
  const celdas = [...tiroCeldas(atq, def, 1), ...tiroCeldas(atq, def, -1), {col: atq.col, fila: atq.fila}];
  return celdas.filter(c => !(c.col === def.col && c.fila === def.fila)).every(enCiego);
}
function arcoEsBestia(t){
  if(!t || t.tipo !== 'creep') return false;
  const v = vinculo(t);
  return String((v && v.tipoCriatura) || '').toLowerCase() === 'bestia';
}
// Los bonos de las mecánicas del arma contra ese objetivo → el tiro (o el mismo, si no suma nada).
function arcoBonos(mio, t, ataque, tiro){
  if(!mio || !t || !ataque || !ataque.rango || ataque.hab) return tiro;
  const d = distanciaHex({col: mio.col, fila: mio.fila}, {col: t.col, fila: t.fila});
  const la = Combatiente.largoAlcance(ataque, d, ataque.alcance);
  if(la) tiro = arcoSumar(tiro, {pdg: la.pdg}, `largo alcance (${la.extra} de más)`);
  if(num(ataque.emboscada) > 0 && modoMapa === 'combate' && !emboscadaUsadas.has(mio.id)){
    tiro = arcoSumar(tiro, {crit: Math.round(num(ataque.emboscada))}, 'emboscada');
    emboscadaUsadas.add(mio.id);
  }
  if(num(ataque.matabestias) > 0 && arcoEsBestia(t)) tiro = arcoSumar(tiro, {fijo: Math.round(num(ataque.matabestias))}, 'matabestias');
  if(num(ataque.contraMarcado) > 0 && marcado(t)) tiro = arcoSumar(tiro, {pdg: Math.round(num(ataque.contraMarcado))}, 'contra el Marcado');
  const es = ataque.espaldaDistancia;
  if(es && (num(es.pdg) > 0 || num(es.fijo) > 0) && arcoPorLaEspalda(mio, t)) tiro = arcoSumar(tiro, {pdg: num(es.pdg), fijo: num(es.fijo)}, 'por la espalda');
  // 🎯 Las de ballesta (2026-10-11): alcance con caída, apuntada firme, tirador de apoyo, remate y el primer disparo del combate.
  const ca = Combatiente.caidaDano(ataque, d, ataque.alcance);
  if(ca) tiro = arcoSumar(tiro, {fijo: ca.fijo}, `caída (${ca.extra} de más)`);
  if(num(ataque.apuntadaFirme) > 0 && !seMovioEsteTurno(mio.id) && !seMovioTurnoAnterior(mio.id)) tiro = arcoSumar(tiro, {pdg: Math.round(num(ataque.apuntadaFirme))}, 'apuntada firme');
  if(num(ataque.tiradorApoyo) > 0 && arcoAliadoPegado(mio, t)) tiro = arcoSumar(tiro, {pdg: Math.round(num(ataque.tiradorApoyo))}, 'tirador de apoyo');
  if(num(ataque.remate) > 0 && arcoQuieto(t)) tiro = arcoSumar(tiro, {crit: Math.round(num(ataque.remate))}, 'remate');
  if(ataque.primerDisparo && modoMapa === 'combate' && !primerDisparoUsados.has(mio.id)){
    tiro = tiro || {motivo: ''};
    tiro.dado = `1d${Math.round(num(ataque.tipoDado)) || 6}`;
    tiro.motivo = tiro.motivo ? `${tiro.motivo} y primer disparo` : 'primer disparo';
    primerDisparoUsados.add(mio.id);
  }
  return tiro;
}
// Tirador de apoyo: ¿el objetivo está pegado a un aliado de quien dispara? (un token de su mismo bando que se ve, no él mismo)
function arcoAliadoPegado(mio, t){
  const crep = x => x.tipo === 'creep';
  return [...tokens.entries()].some(([id, x]) => id !== mio.id && id !== t.id && crep(x) === crep(mio) && (!x.oculto || soyGM) && distanciaHex({col: x.col, fila: x.fila}, {col: t.col, fila: t.fila}) === 1);
}
// Remate: el objetivo está Sentado o Inmovilizado.
function arcoQuieto(t){
  const e = estadoDe(t);
  return !!(e && e.estados.some(s => s && s.activo !== false && /^(sentado|inmovilizado)$/i.test(String(s.nombre || '').trim())));
}
/* 🎯 La Remachadora (2026-10-11): cada golpe seguido al mismo blanco suma Perfora +1 (hasta Combatiente.REMACHADORA_MAX); errar, que lo bloqueen o
   tirarle a otro la vuelven a 0. La lleva el mapa del GM, que es el que aplica el daño (js/13) y el que ve terminar los duelos (hook remachadoraErro). */
const remachadoraCuenta = new Map();   // tokenId de quien dispara → {blanco, golpes}
function remachadoraPerfora(d){
  if(!d || !d.ataque || !d.ataque.remachadora) return 0;
  const k = d.atacante && d.atacante.tokenId, b = d.defensor && d.defensor.tokenId, c = remachadoraCuenta.get(k);
  const previos = c && c.blanco === b ? c.golpes : 0;
  remachadoraCuenta.set(k, {blanco: b, golpes: previos + 1});
  return Math.min(Combatiente.REMACHADORA_MAX, previos);
}
function remachadoraErro(d){ if(d && d.atacante) remachadoraCuenta.delete(d.atacante.tokenId); }
// 🏹 Tensar: «¿Tensás a fondo?» (1 No2 más → +N PdG). Se cobra con msg.alTensar; sin eso no se ofrece.
async function arcoTensar(ataque, msg, tiro){
  const n = Math.round(num(ataque && ataque.tensar));
  if(!(n > 0) || !msg || typeof msg.alTensar !== 'function') return tiro;
  const c = Combatiente.TENSAR_NO2;
  const si = await AvisoCombate.preguntar(`Tensar el arco a fondo: pagás ${c} No2 más y el disparo suma +${n} al PdG.`,
    {icono: '🏹', titulo: `¿Tensás el ${ataque.armaNombre || 'arco'}?`, si: `Tensar (+${c} No2 → +${n} PdG)`, no: 'Disparar así'});
  if(!si) return tiro;
  try{ msg.alTensar(c); }catch(err){ console.error('No se pudo cobrar el Tensar:', err); return tiro; }
  return arcoSumar(tiro, {pdg: n}, 'tensado');
}
