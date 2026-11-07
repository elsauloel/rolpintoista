// js/107-liviano.js — 🦵🩸👣🦎🔄 La tanda del choque liviano (2026-11-07, dueño): el Tajo al tendón, el Corte en la arteria, el Paso atrás, la
// pasiva Escurridizo y Cambiar de lugar (las recetas: comun/skills-creep-base.js; los estados: comun/estados-presets.js; docs/auditoria-skills-creep.md).
//   · 🦵 Tendón cortado: mientras sangre, cada casilla que camina le saca 1 de vida, directo (confirmarRuta, js/08, como el Atormentado).
//   · 🩸 Corte en la arteria (`ataque.arteria`): al elegir el objetivo (dueloElegirObjetivoMapa, js/13), si ya sangra, Crítico frecuente +2 y su
//     Sangrado pasa a los efectos «solo con crítico» (que entran permanentes: Duelo.sangradoPermanente). Si no sangra, el ataque de siempre.
//   · 👣 Paso atrás / 🦎 Escurridizo: ganó la Evasión (cfgEscuchar.evasionGanada, comun/duelo.js) → en la pantalla de quien esquivó, la pregunta
//     y la casilla con un clic (las casillas libres pegadas, pintadas como las del Salto, js/105). El Paso atrás: gratis y sin oportunidad. El
//     Escurridizo (solo contra un golpe cuerpo a cuerpo): sin oportunidad, pagando el No2 del paso como siempre (confirmarRuta).
//   · 🔄 Cambiar de lugar (`ataque.cambiaLugar`): si pega, la pantalla del GM (el creep ataca; el hook disparoResuelto, js/14) los cambia de casilla,
//     sin ataques de oportunidad. Un Inamovible tira su chance primero (como el empujón): si le sale, no se mueve nadie.

const esSangradoEstado = e => !!e && e.activo !== false && (e.esSangrado || /^sangrado$/i.test(String(e.nombre || '').trim()));
const esTendonEstado = e => !!e && e.activo !== false && (e.tendonCortado || /^tend[oó]n cortado$/i.test(String(e.nombre || '').trim()));

// ---------- 🦵 Tendón cortado ----------
const TENDON_POR_CASILLA = 1;
async function tendonAlMoverse(t, pasos){
  const n = Math.max(0, Math.round(num(pasos)));
  if(!t || !n || typeof heridaEstados !== 'function') return;
  const est = await heridaEstados(t);
  if(!est.some(esTendonEstado) || !est.some(esSangradoEstado)) return;
  const d = n * TENDON_POR_CASILLA, quien = nombreDe(t);
  try{
    const f = t.tipo === 'creep' ? danioCreep : String(t.fichaId).includes(SEP_INVOCACION) ? danioInv : danioPj;
    const res = await f(t, String(d), true, 0, 0, {});
    const recibido = res && res.r ? num(res.r.recibido) : d;
    mesaLinea(`🦵 ${quien} camina con el tendón cortado y sangrando: ${n} casilla${n === 1 ? '' : 's'}, −${fmt(recibido)} de vida (daño directo)`, 'alerta-roja', quien);
  }catch(err){
    console.error('Tendón cortado: no se pudo cobrar la vida', err);
    toast(`🦵 ${quien} se movió con el tendón cortado: −${d} de vida, aplicalo a mano`);
  }
}

// ---------- 🩸 Corte en la arteria ----------
const ARTERIA_CRIT = 2;
async function arteriaBonos(mio, t, ataque, yo){
  if(!ataque || !ataque.arteria || !t || typeof heridaEstados !== 'function') return ataque;
  const sangra = (await heridaEstados(t)).some(esSangradoEstado);
  if(!sangra) return ataque;
  const nom = (yo && yo.nombre) || (mio ? nombreDe(mio) : 'Alguien'), hab = ataque.habNombre || 'Corte en la arteria', quien = t.oculto ? 'alguien' : nombreDe(t);
  const a = Combatiente.arteriaAtaque(ataque, ARTERIA_CRIT);
  const txt = `${hab} de ${nom}: ${quien} ya sangra → Crítico frecuente +${ARTERIA_CRIT}; con un crítico, su Sangrado queda permanente`;
  try{ mesaLinea(`🩸 ${txt}`, 'recordatorio'); }catch(err){}
  try{ momentoAbrir({tipo: 'herida', icono: '🩸', titulo: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  return a;
}

// ---------- 👣 Paso atrás / 🦎 Escurridizo ----------
const pasoOfrecidos = new Set();
const pasoEscurridizo = t => typeof ordenPasiva === 'function' ? num(ordenPasiva(t, 'escurridizo', 'escurridizo')) : 0;
const NO_SE_MUEVE = /^(inmovilizado|sentado|stun|par[aá]lisis|congelado)$/i;
// Quién recibe el aviso: quien maneja ese token — el GM para un creep; para un personaje o una invocación, quien tiene el 🎮 control o, si no, su dueño
// (como el Escudo elemental, js/106).
function pasoLoManejoYo(t){
  if(!t || !fbUsuario) return false;
  if(t.tipo === 'creep') return !!soyGM;
  const r = ((fichasPub.get(String(t.fichaId || '').split(SEP_INVOCACION)[0]) || {}).resumen) || {};
  return fbUsuario.uid === (r.control || t.duenoUid || '');
}
async function pasoTrasEvasion(d){
  if(!d || !d.defensor || pasoOfrecidos.has(d.id)) return;
  const tid = d.defensor.tokenId, t = tid && tokens.get(tid);
  if(!t || !pasoLoManejoYo(t)) return;
  const atras = !!(d.eva && d.eva.paso);
  const cuerpo = !d.hab && !(d.ataque && d.ataque.rango);
  const escurre = !atras && cuerpo && pasoEscurridizo(t) > 0;
  if(!atras && !escurre) return;
  pasoOfrecidos.add(d.id);
  const quien = d.defensor.nombre || nombreDe(t), est = typeof heridaEstados === 'function' ? await heridaEstados(t) : [];
  if(est.some(e => e && e.activo !== false && (e.inmovilizado || NO_SE_MUEVE.test(String(e.nombre || '').trim())))){ toast(`${quien} esquivó, pero no puede moverse ahora`); return; }
  if(escurre && typeof tokenExpuesto === 'function' && tokenExpuesto(t)){ toast(`${quien} está Expuesto: no puede escurrirse (no reacciona con No2)`); return; }
  // El aviso (dueño, 2026-11-07: «siempre que el personaje realice una evasión exitosa, le tiene que aparecer una notificación»): al centro, con «Dar un
  // paso» (→ la casilla con un clic) o «No». Es local a esta pantalla: no frena el duelo de los demás.
  const si = await AvisoCombate.preguntar(atras
    ? `🦶 ${quien}: tenés Paso atrás activo. ¿Querés dar un paso? (gratis, sin No2 ni ataque de oportunidad)`
    : `🦶 ${quien}: sos escurridizo. ¿Querés dar un paso? (sin ataque de oportunidad; pagás el No2 del paso)`,
    {icono: '🦶', titulo: atras ? 'Paso atrás' : 'Escurridizo', si: 'Dar un paso', no: 'No'});
  if(!si) return;
  pasoElegirCasilla(tid, atras ? 'atras' : 'escurridizo', quien);
}
// Las casillas libres pegadas (sin Sólido, sin token, sin pared en el medio).
function pasoCasillasLibres(t){
  const ocupada = c => elementoSolidoEn(c.col, c.fila) || [...tokens.values()].some(x => x !== t && x.col === c.col && x.fila === c.fila && !x.bajoTierra);
  return vecinosDeCasilla({col: t.col, fila: t.fila}).filter(c => !ocupada(c) && !(typeof paredCorta === 'function' && paredCorta({col: t.col, fila: t.fila}, c)));
}
function pasoElegirCasilla(tid, modo, quien){
  const t = tokens.get(tid);
  if(!t) return;
  const libres = pasoCasillasLibres(t);
  if(!libres.length){ toast(`${quien}: no hay ninguna casilla libre pegada adonde moverse`); return; }
  const claves = new Set(libres.map(c => c.col + ',' + c.fila));
  const terminar = () => { if(typeof saltoCasillas !== 'undefined') saltoCasillas = null; pedirDibujo(); };
  if(typeof saltoCasillas !== 'undefined') saltoCasillas = {libres: claves, conRival: new Set(), t0: performance.now()};
  try{ cerrarBotonera(); }catch(err){}
  try{ if(typeof Duelo !== 'undefined' && Duelo.minimizar) Duelo.minimizar(); }catch(err){}   // que el cuadro del duelo no tape el mapa al elegir la casilla
  seleccion = null; try{ hudCerrar(); }catch(err){}
  pedirDibujo();
  const nom = modo === 'atras' ? 'Paso atrás' : 'Escurridizo';
  const texto = `<b>${modo === 'atras' ? '👣' : '🦎'} ${esc(quien)}: elegí la casilla</b> <span>${nom}: 1 casilla, ${modo === 'atras' ? 'gratis' : 'pagando su No2'} y sin ataques de oportunidad · Esc o clic derecho: se queda</span>`;
  const pedir = () => elegirDestino(async h => {
    if(!claves.has(h.col + ',' + h.fila)){ toast('Elegí una de las casillas marcadas, pegadas al token'); pedir(); return; }
    terminar();
    const t1 = tokens.get(tid);
    if(!t1) return;
    const o = {col: t1.col, fila: t1.fila}, ruta = [o, {col: h.col, fila: h.fila}];
    if(typeof oporNegadaAvisar === 'function') oporNegadaAvisar(t1, tid, ruta, nom);   // a quien se le niega la oportunidad, el aviso (js/17)
    if(modo === 'atras'){
      await moverToken(tid, h.col, h.fila, ruta);
      mesaLinea(`👣 ${quien} da un paso atrás: 1 casilla, gratis y sin ataques de oportunidad.`, 'recordatorio');
      tendonAlMoverse(t1, 1).catch(err => console.error('Tendón cortado:', err));
      return;
    }
    // 🦎 Escurridizo: el paso de siempre (confirmarRuta: cobra el No2, Lento, Rengo, el Tendón cortado…), sin oportunidad.
    const cm = costoMoverDe(t1);
    if(!cm){ await moverToken(tid, h.col, h.fila, ruta); mesaLinea(`🦎 ${quien} se escurre 1 casilla (sin ataques de oportunidad): cobrale el No2 a mano.`, 'recordatorio'); return; }
    const costo = costoRuta(ruta, cm.porCasillero, 1, cm.gratis, cm.recargo, cm.levita, cm.ext, cm.sprint, cm.miedo);
    if(costo > Math.max(0, num(cm.disponibles))){ toast(`🦎 No le alcanzan los No2 para escurrirse: el paso cuesta ${fmt(costo)} y ${t1.tipo === 'creep' ? 'le' : 'te'} quedan ${fmt(Math.max(0, num(cm.disponibles)))}`); return; }
    const gratis = Math.min(1, num(cm.gratis));
    rutaPendiente = {id: tid, celdas: ruta, pasos: 1, porCasillero: cm.porCasillero, ext: cm.ext, miedo: cm.miedo, costo, disponibles: cm.disponibles, oportunidad: [],
      gratis, sprint: Math.min(Math.max(0, 1 - gratis), num(cm.sprint)), lento: num(cm.recargo) > 0, dodge: false, levita: Math.min(1, num(cm.levita)), avisoFin: `🦎 ${quien} se escurre`};
    await confirmarRuta();
    mesaLinea(`🦎 ${quien} se escurre: 1 casilla sin ataques de oportunidad (pagó su No2).`, 'recordatorio');
  }, texto, true, () => { terminar(); });
  pedir();
}

// ---------- 🔄 Cambiar de lugar ----------
const cambioHecho = new Set();
async function cambiarLugarResuelto(d){
  if(!d || !d.ataque || !d.ataque.cambiaLugar || cambioHecho.has(d.id)) return;
  if(d.resultado !== 'pego' && d.resultado !== 'mitad') return;
  if(!soyGM){ return; }   // mueve el token del rival: lo hace la pantalla del GM
  cambioHecho.add(d.id);
  const ida = d.atacante && d.atacante.tokenId, idd = d.defensor && d.defensor.tokenId;
  const ta = ida && tokens.get(ida), td = idd && tokens.get(idd);
  const hab = d.ataque.habNombre || 'Cambiar de lugar';
  if(!ta || !td){ toast(`${hab}: uno de los dos ya no está en el mapa, cambialos a mano`); return; }
  const na = nombreDe(ta), nd = nombreDe(td), titulo = `${hab}: ${na} y ${nd}`;
  const im = typeof chanceDe === 'function' ? chanceDe(td, 'inamovible') : 0;
  if(im && Math.random() * 100 < im){
    const txt = `${nd} es Inamovible (${im} %): no se mueve nadie.`;
    mesaLinea(`🔄 ${titulo} — ${txt}`, 'recordatorio');
    try{ momentoAbrir({tipo: 'cambio', icono: '🔄', titulo, resultado: txt, estado: 'listo'}); }catch(err){}
    return;
  }
  const a0 = {col: ta.col, fila: ta.fila}, d0 = {col: td.col, fila: td.fila};
  // Sin ataques de oportunidad para nadie: es un movimiento forzado (moverToken no los evalúa); el aviso, a quien se le niega (js/17).
  await moverToken(idd, a0.col, a0.fila, [d0, a0]);
  await moverToken(ida, d0.col, d0.fila, [a0, d0]);
  const txt = `${na} y ${nd} cambian de lugar (sin ataques de oportunidad).`;
  mesaLinea(`🔄 ${txt}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'cambio', icono: '🔄', titulo, resultado: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
}
