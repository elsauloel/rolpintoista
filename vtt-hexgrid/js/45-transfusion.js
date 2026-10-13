/* 🩸 TRANSFUSIÓN SANGUÍNEA (Debuffer, 2026-10-13, dueño; docs/clases-borrador.md). Después de cobrar (1 SP y 1 No2), se eligen en el mapa quién da
   y quién recibe —dos personajes aliados, quien la usa incluido, dentro de su Rango (si no, avisa y deja seguir)— y cuánto (hasta `max`, 20): quien
   da queda con al menos 1 de vida y quien recibe no pasa su máximo. La vida no la escribe esta pantalla (un jugador no escribe la ficha de otro):
   va como un aviso «Transfusión» a cada ficha (EstadosAplicar.encolarPj → FichaAcciones.aplicarEstadoRecibido), que lo aplica su dueño (o el mapa
   que lo maneja). Las invocaciones, a mano. */
function transfusionElegir(texto){
  return new Promise(res => elegirDestino(c => res(c), texto, true, () => res(null)));
}
function transfusionToken(c){
  const e = [...tokens.entries()].find(([, t]) => t.col === c.col && t.fila === c.fila && t.tipo === 'pj');
  return e ? {id: e[0], t: e[1]} : null;
}
async function transfusionDeHabilidad(msg){
  const yo = [...tokens.entries()].find(([, t]) => t.fichaId === msg.fichaId && t.tipo === 'pj');
  if(!yo){ toast(`${msg.nombre}: tu token no está en el mapa — pasá la vida a mano`); return; }
  let rango = 0;
  try{ rango = Math.round(num(rangoDeToken(yo[1]).rng)) || 0; }catch(e){}
  const pedir = async paso => {
    const c = await transfusionElegir(`<b>🩸 ${esc(msg.nombre)}: ${paso}</b> <span>clic sobre un personaje aliado (vos también) a ${rango} casilleros o menos · Esc cancela</span>`);
    if(!c) return null;
    const x = transfusionToken(c);
    if(!x){ toast('Ahí no hay un personaje: elegí uno de tu equipo'); return pedir(paso); }
    if(String(x.t.fichaId).includes(SEP_INVOCACION)){ toast(`${nombreDe(x.t)} es una invocación: la Transfusión entre invocaciones va a mano`); return null; }
    if(rango && distanciaHex(yo[1], x.t) > rango) toast(`${nombreDe(x.t)} está fuera de tu Rango (${rango}): va igual, lo decide la mesa`);
    return x;
  };
  const da = await pedir('¿quién da la vida?');
  if(!da){ mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  const recibe = await pedir(`¿quién la recibe? (da: ${nombreDe(da.t)})`);
  if(!recibe){ mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); return; }
  if(recibe.id === da.id){ toast('Tienen que ser dos personajes distintos'); mesaLinea(`🩸 ${msg.nombre}: se canceló (era el mismo personaje)`, 'recordatorio'); return; }
  const rd = (fichasPub.get(da.t.fichaId) || {}).resumen || {}, rr = (fichasPub.get(recibe.t.fichaId) || {}).resumen || {};
  const max = Math.min(Math.max(1, num(msg.max) || 20), Math.max(0, num(rd.hp) - 1), Math.max(0, num(rr.hpMax) - num(rr.hp)));
  if(max <= 0){ toast(num(rd.hp) <= 1 ? `${nombreDe(da.t)} no tiene vida para dar` : `${nombreDe(recibe.t)} ya tiene la vida llena`); mesaLinea(`🩸 ${msg.nombre}: no había vida para pasar`, 'recordatorio'); return; }
  const opciones = [...new Set([5, 10, 15, 20].filter(v => v < max).concat(max))];
  AvisoCombate.mostrar({clave: 'transfusion', icono: '🩸', titulo: `${msg.nombre}: ¿cuánta vida?`,
    texto: `De ${nombreDe(da.t)} (${fmt(num(rd.hp))} de vida) a ${nombreDe(recibe.t)} (${fmt(num(rr.hp))} de ${fmt(num(rr.hpMax))}). Como mucho ${fmt(max)}.`,
    botones: [...opciones.map(v => ({texto: v === max ? `${v} (lo máximo)` : String(v), alClic: () => { AvisoCombate.cerrar(); transfusionAplicar(msg, da, recibe, v); }})),
      {texto: 'Cancelar', sec: true, alClic: () => { AvisoCombate.cerrar(); mesaLinea(`🩸 ${msg.nombre}: se canceló (el costo ya se pagó)`, 'recordatorio'); }}]});
}
async function transfusionAplicar(msg, da, recibe, n){
  try{
    await EstadosAplicar.encolarPj({fichaId: da.t.fichaId, duenoUid: da.t.duenoUid, spec: {nombre: 'Transfusión', hp: -n}, origen: msg.nombre});
    await EstadosAplicar.encolarPj({fichaId: recibe.t.fichaId, duenoUid: recibe.t.duenoUid, spec: {nombre: 'Transfusión', hp: n}, origen: msg.nombre});
    mesaLinea(`🩸 ${msg.nombre}: ${nombreDe(da.t)} le pasa ${n} de vida a ${nombreDe(recibe.t)}`, 'recordatorio');
  }catch(err){
    console.error('No se pudo hacer la Transfusión:', err);
    mesaLinea(`🩸 ${msg.nombre}: no se pudo aplicar — a mano: ${nombreDe(da.t)} −${n} de vida, ${nombreDe(recibe.t)} +${n}`, 'alerta-roja');
  }
}
