/* 🪤👁 (Desde el 2026-11-03 se puede, pero la ve: trampaConfirmarVista, abajo.) Una trampa no se coloca a la vista de un enemigo (regla del dueño, 2026-10-27: «al momento de colocar una trampa, cuando aparece el mapa,
   deben aparecer los conos de visión, los mismos que se usan para el sigilo, porque una trampa no se puede poner en el campo de visión directa de
   un enemigo»). Mientras se elige la casilla de una trampa (de una habilidad, un consumible o el glifo), el mapa muestra el cono azul y la zona de
   alerta naranja de los rivales que quien la pone ve (como el 👓 de los lentes); una casilla dentro del cono de alguno no sirve: avisa y la vuelve a
   pedir. Los rivales que no se ven (ocultos, en sigilo, en la niebla) no cuentan: no se delatan. Sin el token de quien la pone (el GM a mano), no
   se mira nada. Los pilares no son trampas: no cuentan. */
let trampaConosRivales = null;   // los ids de los tokens cuyos conos se ven mientras se elige la casilla de una trampa (null: ninguno)
// Los rivales de quien coloca que esta pantalla ve, vivos y despiertos.
function trampaRivalesALaVista(mio){
  if(!mio || typeof rivalesDe !== 'function') return [];
  return rivalesDe(mio).filter(r => {
    if(!tokenVisiblePorNiebla(r) || !estelaVisibleDe(r)) return false;
    const e = estadoDe(r);
    return !(e && (e.muerto || e.dormida));
  });
}
function trampaTokenDe(msg){
  return msg && msg.fichaId ? [...tokens.values()].find(x => x.fichaId === msg.fichaId && x.tipo === (msg.tipoToken || 'pj')) : null;
}
// → el nombre del rival que mira esa casilla (su cono), o ''.
function trampaALaVista(msg, h){
  const r = trampaRivalesALaVista(trampaTokenDe(msg)).find(x => zonasClaves(x).cono.has(nbPack(h.col, h.fila)));
  return r ? nombreDe(r) : '';
}
/* 👁 A la vista de un rival: se puede, pero la ve (dueño, 2026-11-03: «si alguno de sus casilleros queda dentro del cono de visión directo de un
   enemigo, le debe aparecer una notificación: estás poniendo una trampa dentro del cono de visión de un enemigo, la va a ver, avanzar o rechazar»;
   reemplaza al «no se coloca» del 2026-10-27). Se miran TODAS las casillas que va a ocupar (la línea del Cordón, la flor de los Abrojos…), con el
   cono de los rivales que quien la pone ve (los que no se ven no cuentan: no se delatan). Avanzar → se coloca descubierta (la ve todo el mundo);
   Rechazar → se vuelve a pedir la casilla (Esc sigue cancelando como siempre). */
// Las casillas que va a ocupar una trampa puesta en `h` (la misma cuenta que TokensAuto.colocarTrampas: la línea sale hacia donde mira el token).
function trampaCeldasPrevias(msg, h){
  const mio = trampaTokenDe(msg);
  let t = msg.trampa || {};
  try{ if(typeof Plantillas !== 'undefined' && Plantillas.trampaDesde) t = Plantillas.trampaDesde(t) || t; }catch(e){}
  const linea = t.tipo === 'linea' || t.forma === 'linea';
  const frente = mio ? ((Math.round(num(mio.rotacion || 0) / 60) % 6) + 6) % 6 : 0;
  const largo = Math.max(1, Math.min(20, Math.round(num(t.tamano || t.largo)) || 3));
  const radio = linea ? 0 : (typeof Plantillas !== 'undefined' && Plantillas.radioDeTrampa ? Plantillas.radioDeTrampa(t) : Math.max(0, Math.round(num(t.radio))));
  const celdas = linea ? Array.from({length: largo}, (_, i) => ({dq: 0, dr: i})) : celdasFlor(radio);
  return celdasDeElemento({origen: {col: h.col, fila: h.fila}, celdas, rotacion: linea ? frente * 60 : 0});
}
// Los rivales (que se ven) que tienen alguna de esas casillas en su cono. → [tokens]
function trampaQuienesVen(msg, celdas){
  const claves = new Set((celdas || []).map(c => nbPack(c.col, c.fila)));
  return trampaRivalesALaVista(trampaTokenDe(msg)).filter(r => [...zonasClaves(r).cono].some(k => claves.has(k)));
}
// → Promise<{ok, vistos: [nombres]}>: ok false = Rechazar.
async function trampaConfirmarVista(msg, h){
  const vistos = trampaQuienesVen(msg, trampaCeldasPrevias(msg, h)).map(r => nombreDe(r));
  if(!vistos.length) return {ok: true, vistos: []};
  const lista = vistos.length === 1 ? vistos[0] : vistos.slice(0, -1).join(', ') + ' y ' + vistos[vistos.length - 1];
  const texto = `⚠ Estás poniendo la trampa dentro del cono de visión de ${lista}: la ${vistos.length === 1 ? 'va' : 'van'} a ver.\n\n¿Avanzar (queda a la vista) o Rechazar (elegís otra casilla)?`;
  const si = typeof Confirmar !== 'undefined' ? await Confirmar.preguntar(texto, {titulo: 'Trampa a la vista de un rival', icono: '👁', si: 'Avanzar', no: 'Rechazar'}) : confirm(texto);
  return si ? {ok: true, vistos} : {ok: false, vistos};
}
// La línea en la Mesa cuando se colocó igual, a la vista.
function trampaAnunciarVista(msg, vistos, nombre){
  if(!vistos || !vistos.length || !fbUsuario) return;
  const mio = trampaTokenDe(msg), quien = mio ? nombreDe(mio) : String(msg.nombre || 'Alguien');
  fbDb.collection(fbRutaCampana('tiradas')).add({uid: fbUsuario.uid, jugador: (fbMiembro && fbMiembro.nombre) || '', quien,
    origen: `👁 ${quien} colocó una trampa a la vista de ${vistos.join(', ')}`, formula: `«${String(nombre || msg.nombre || 'Trampa').slice(0, 40)}»: la vieron, quedó descubierta`,
    rolls: [], mod: 0, total: 0, desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp()}).catch(err => console.error('Trampa a la vista (Mesa):', err));
}
// Pedir la casilla de una trampa con los conos a la vista; los apaga al elegir o al cancelar (si se vuelve a pedir, se prenden de nuevo).
function elegirCasillaTrampa(msg, cb, texto, libre, alCancelar){
  const rivales = trampaRivalesALaVista(trampaTokenDe(msg));
  trampaConosRivales = rivales.length ? [...tokens.entries()].filter(([, x]) => rivales.includes(x)).map(([id]) => id) : null;
  const apagar = () => { trampaConosRivales = null; pedirDibujo(); };
  elegirDestino(h => { apagar(); cb(h); }, texto + (rivales.length ? ' <span>· 👁 el cono azul de un rival: si la ponés ahí, la ve</span>' : ''), libre,
    () => { apagar(); if(alCancelar) alCancelar(); });
}
/* 🪤 El límite de trampas de habilidad (regla del dueño, 2026-10-27: «un límite de trampas activas igual al nivel… más 1. Y eso por cada tipo de
   trampa… si se coloca una por encima de ese número… debe elegir cuál desarma en su lugar»; vale para creeps, personajes e invocaciones): las sin
   disparar de quien la pone, con el mismo nombre, como mucho su nivel + 1. Las consumibles (`trampaItem`) no cuentan. Quién la puso: `de` en su
   trampaEstado ("ref|tipo"); si no entró, su dueño de la cuenta (el GM: todos sus creeps juntos). → Promise<bool>: false = no se coloca (canceló). */
function trampaNivelDe(msg){
  const ref = String(msg.fichaId || '');
  if((msg.tipoToken || 'pj') === 'creep') return Math.max(1, Math.round(num((creepPrivadoDe(ref) || {}).nivel)) || 1);
  const [base, invId] = ref.split(SEP_INVOCACION), r = (fichasPub.get(base) || {}).resumen || {};
  if(invId){ const i = (r.invocaciones || []).find(x => x && x.id === invId); return Math.max(1, Math.round(num(i && i.nivel)) || Math.round(num(r.nivel)) || 1); }
  return Math.max(1, Math.round(num(r.nivel)) || 1);
}
function trampasPropias(msg, nombre){
  const de = `${msg.fichaId}|${(msg.tipoToken || 'pj') === 'creep' ? 'creep' : 'pj'}`;
  return [...elementos.entries()].filter(([, el]) => {
    if(!el.trampa || el.disparada || el.zona || el.trampaItem || String(el.trampaNombre || '') !== String(nombre || '')) return false;
    let e = null; try{ e = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(x){}
    return e && e.de ? e.de === de : el.duenoUid === (fbUsuario && fbUsuario.uid);
  });
}
function trampaLimite(msg, nombre){
  const tope = trampaNivelDe(msg) + 1, propias = trampasPropias(msg, nombre);
  if(propias.length < tope) return Promise.resolve(true);
  return new Promise(res => {
    const celdaDe = new Map();
    propias.forEach(([id, el]) => celdasDeElemento(el).forEach(c => celdaDe.set(nbPack(c.col, c.fila), id)));
    const pedir = () => elegirDestino(async h => {
      const id = celdaDe.get(nbPack(h.col, h.fila));
      if(!id){ toast(`Elegí una de tus «${nombre}» (la que se desarma)`); pedir(); return; }
      try{ await coleccionElementos().doc(id).delete(); toast(`🪤 Se desarmó una «${nombre}»: la nueva va en su lugar`); res(true); }
      catch(err){ console.error('No se pudo desarmar la trampa:', err); toast('No se pudo desarmar — sacala a mano'); res(false); }
    }, `<b>🪤 Ya tenés ${propias.length} «${esc(nombre)}» (tu tope es ${tope}: nivel + 1)</b> <span>clic en la que se desarma para poner la nueva · Esc o clic derecho cancelan</span>`, true, () => res(false));
    pedir();
  });
}
/* 🪢 El Cordón oculto, cómo se ve (dueño, 2026-10-27: «como una línea de un color claro y bordes negros bien saturada para que se vea, y en cada extremo
   algo que haga referencia como a una estaca donde está anotado el cordón y que se vea cierta tensión cada X cantidad de segundos, como que se mueve un
   poco el cordón… reforzado por la línea de puntos para tener bien claro el área»). Lo llama `dibujar` (js/05) para una trampa con `visual: 'cordon'` en su
   trampaEstado, cuando esta pantalla la ve. → true: hay que seguir animando. */
const CORDON_CICLO_MS = 3200, CORDON_VIBRA_MS = 650;
function cordonDibujarSuelo(el, celdas, z, bordeCeldas){
  let e = null; try{ e = el.trampaEstado ? JSON.parse(el.trampaEstado) : null; }catch(x){}
  if(!e || e.visual !== 'cordon' || !celdas || celdas.length < 2) return false;
  // El contorno de puntos de sus casillas (encima del borde de siempre).
  bordeCeldas(celdas); ctx.save(); ctx.setLineDash([3 / z, 5 / z]); ctx.lineCap = 'round'; ctx.strokeStyle = 'rgba(20,16,12,.95)'; ctx.lineWidth = 2.5 / z; ctx.stroke(); ctx.restore();
  const a = hexCentro(celdas[0].col, celdas[0].fila), b = hexCentro(celdas[celdas.length - 1].col, celdas[celdas.length - 1].fila);
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
  const ext = HEX * 0.55, p0 = {x: a.x - ux * ext, y: a.y - uy * ext}, p1 = {x: b.x + ux * ext, y: b.y + uy * ext};
  // La tensión: cada tanto el cordón tiembla un poco (una onda que se apaga).
  const t = Date.now() % CORDON_CICLO_MS, vib = t < CORDON_VIBRA_MS ? Math.sin(t / 40) * (1 - t / CORDON_VIBRA_MS) * HEX * 0.12 : 0;
  const mx = (p0.x + p1.x) / 2 - uy * vib, my = (p0.y + p1.y) / 2 + ux * vib;
  ctx.save();
  ctx.lineCap = 'round';
  const cordon = () => { ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.quadraticCurveTo(mx, my, p1.x, p1.y); };
  cordon(); ctx.strokeStyle = '#000'; ctx.lineWidth = 8 / z + HEX * 0.1; ctx.stroke();
  cordon(); ctx.strokeStyle = '#F4ECD8'; ctx.lineWidth = 4 / z + HEX * 0.06; ctx.stroke();
  // Las estacas, una en cada punta: un palo marrón con borde negro y la cabeza clavada.
  [p0, p1].forEach(p => {
    const w = HEX * 0.16, h = HEX * 0.42;
    ctx.beginPath(); ctx.rect(p.x - w / 2, p.y - h * 0.7, w, h);
    ctx.fillStyle = '#7A4E25'; ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2.5 / z; ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x, p.y - h * 0.7, w * 0.75, 0, Math.PI * 2); ctx.fillStyle = '#A8723E'; ctx.fill(); ctx.stroke();
  });
  ctx.restore();
  return true;
}
// Lo dibuja `dibujar` (js/05), con los mismos colores que el 👓 de los lentes.
function trampaConosDibujar(z){
  if(!trampaConosRivales) return;
  const pintar = (lista, relleno, borde) => {
    if(!lista.length) return;
    ctx.beginPath();
    lista.forEach(c => { const p = hexCentro(c.col, c.fila); trazarHex(p.x, p.y); });
    ctx.fillStyle = relleno; ctx.fill();
    ctx.strokeStyle = borde; ctx.lineWidth = 2 / z; ctx.stroke();
  };
  trampaConosRivales.forEach(id => {
    const t = tokens.get(id);
    if(!t) return;
    const zn = zonasSigilo(t);
    pintar(zn.alerta, 'rgba(232,140,50,.38)', 'rgba(255,170,80,.9)');
    pintar(zn.cono, 'rgba(60,120,210,.45)', 'rgba(110,170,255,.95)');
  });
}
