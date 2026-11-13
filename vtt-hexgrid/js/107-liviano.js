// js/107-liviano.js — 🦵🩸👣🦎🔄 La tanda del choque liviano (2026-11-07, dueño): el Tajo al tendón, el Corte en la arteria, el Paso atrás, la
// pasiva Escurridizo y Cambiar de lugar (las recetas: comun/skills-creep-base.js; los estados: comun/estados-presets.js; docs/auditoria-skills-creep.md).
//   · 🦵 Tendón cortado: mientras sangre, cada casilla que camina le saca 1 de vida, directo (confirmarRuta, js/08, como el Atormentado).
//   · 🩸 Corte en la arteria (`ataque.arteria`): al elegir el objetivo (dueloElegirObjetivoMapa, js/13), si ya sangra, Crítico frecuente +2 y su
//     Sangrado pasa a los efectos «solo con crítico» (que entran permanentes: Duelo.sangradoPermanente). Si no sangra, el ataque de siempre.
//   · 👣 Paso atrás / 🦎 Escurridizo: ganó la Evasión (cfgEscuchar.evasionGanada, comun/duelo.js) → en la pantalla de quien esquivó, la pregunta
//     y la casilla con un clic (las casillas libres pegadas, pintadas como las del Salto, js/105). El Paso atrás: gratis y sin oportunidad. El
//     Escurridizo (solo contra un golpe cuerpo a cuerpo): sin oportunidad, pagando el No2 del paso como siempre (confirmarRuta).
//   · 🔄 Cambiar de lugar (`ataque.cambiaLugar`): apenas pega (contactoGanado, antes del daño; si no llegó, disparoResuelto) la pantalla del GM los cambia de casilla con la animación de abajo,
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
  // Apenas gana el contacto (contactoGanado, antes del daño: el duelo se aparta, se cruzan y el duelo vuelve para el daño) o, si eso no llegó, al terminar.
  if(!(d.contacto && d.contacto.gana === 'atacante' && d.estado !== 'resuelto') && d.resultado !== 'pego' && d.resultado !== 'mitad') return;
  if(!soyGM){ return; }   // mueve el token del rival: lo hace la pantalla del GM
  cambioHecho.add(d.id);
  const ida = d.atacante && d.atacante.tokenId, idd = d.defensor && d.defensor.tokenId;
  const ta = ida && tokens.get(ida), td = idd && tokens.get(idd);
  const hab = d.ataque.habNombre || 'Cambiar de lugar';
  if(!ta || !td){ toast(`${hab}: uno de los dos ya no está en el mapa, cambialos a mano`); return; }
  const na = nombreDe(ta), nd = nombreDe(td), titulo = `${hab}: ${na} y ${nd}`;
  const im = typeof chanceDe === 'function' ? chanceDe(td, 'inamovible') : 0;
  if(im && await inamovibleSale(td, im, titulo)){   // el cartel con el d6 (js/21)
    const txt = `${nd} es Inamovible (${im} %): no se mueve nadie.`;
    mesaLinea(`🔄 ${titulo} — ${txt}`, 'recordatorio');
    try{ momentoAbrir({tipo: 'cambio', icono: '🔄', titulo, resultado: txt, estado: 'listo'}); }catch(err){}
    return;
  }
  const a0 = {col: ta.col, fila: ta.fila}, d0 = {col: td.col, fila: td.fila};
  // 🎞 La animación (dueño, 2026-11-07): el duelo se aparta, los dos se deslizan cruzándose en arco, y el duelo vuelve solo.
  cambioFxPublicar(ida, idd, a0, d0, d.id).catch(err => console.error('Cambiar de lugar: la animación', err));
  await new Promise(r => setTimeout(r, 150));   // (que la animación arranque antes de que lleguen las casillas nuevas: así no salta)
  // Sin ataques de oportunidad para nadie: es un movimiento forzado (moverToken no los evalúa); el aviso, a quien se le niega (js/17).
  await moverToken(idd, a0.col, a0.fila, [d0, a0]);
  await moverToken(ida, d0.col, d0.fila, [a0, d0]);
  const txt = `${na} y ${nd} cambian de lugar (sin ataques de oportunidad).`;
  mesaLinea(`🔄 ${txt}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'cambio', icono: '🔄', titulo, resultado: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
}

/* 🎞 La animación de Cambiar de lugar (dueño, 2026-11-07: «se minimiza el duelo, se ve la animación fluida de las dos fichas intercambiando de lugar,
   se vuelve a desplegar el duelo y continúa»). Momento sin tarjeta 'cambio-fx' ({a, b, pa, pb, duelo}): lo publica la pantalla del GM apenas pega (contactoGanado, comun/duelo.js, antes del daño) y lo
   dibujan todas (js/16 → cambioFxRecibido). Mientras dura, calcularDisposicion (js/05) dibuja cada token sobre un arco de su casilla vieja a la nueva
   (`cambioFxPosToken`, arcos opuestos para que no se pisen) y queda una estela dorada. El duelo se aparta (Duelo.apartar) y vuelve solo al terminar.
   Lo que esta pantalla no ve (oculto, niebla, sigilo) no deja estela. «Reducir movimiento»: corta. */
const CAMBIO_FX = [];
const cambioFxVistos = new Set();
const cambioPoco = () => { try{ return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } };
async function cambioFxPublicar(a, b, pa, pb, dueloId){
  const datos = {a, b, pa: {col: pa.col, fila: pa.fila}, pb: {col: pb.col, fila: pb.fila}, ...(dueloId ? {duelo: String(dueloId)} : {})};
  const id = typeof momentoAbrir === 'function' ? await momentoAbrir({tipo: 'cambio-fx', icono: '', titulo: '', estado: 'listo', datos}).catch(() => null) : null;
  if(!id) cambioFxEmpezar(datos);
}
function cambioFxRecibido(id, d){
  if(!d || !d.datos || cambioFxVistos.has(id)) return;
  cambioFxVistos.add(id);
  const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
  if(Date.now() - t > 20000) return;
  cambioFxEmpezar(d.datos);
}
function cambioFxEmpezar(dt){
  if(!dt || !tokens.get(dt.a) || !tokens.get(dt.b)) return;
  if(CAMBIO_FX.some(f => f.a === dt.a && f.b === dt.b && performance.now() - f.t0 < f.dur)) return;
  const poco = cambioPoco(), dur = poco ? 320 : 950, espera = poco ? 0 : 380;   // (espera: que el duelo termine de achicarse)
  CAMBIO_FX.push({a: dt.a, b: dt.b, pa: hexCentro(dt.pa.col, dt.pa.fila), pb: hexCentro(dt.pb.col, dt.pb.fila), t0: performance.now() + espera, dur, poco});
  if(dt.duelo && typeof Duelo !== 'undefined' && Duelo.apartar){ try{ Duelo.apartar(dt.duelo, espera + dur + 450); }catch(e){} }
  pedirDibujo();
}
const cambioSuave = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
function cambioPunto(fx, desde, hasta, k, lado){
  const dx = hasta.x - desde.x, dy = hasta.y - desde.y, l = Math.hypot(dx, dy) || 1;
  const arco = (fx.poco ? 0 : HEX * 0.78) * Math.sin(Math.PI * k) * lado;
  return {x: desde.x + dx * k - dy / l * arco, y: desde.y + dy * k + dx / l * arco};
}
// Dónde se dibuja el token mientras dura (o null: donde está). Antes de arrancar, en su casilla vieja.
function cambioFxPosToken(id){
  const ahora = performance.now();
  for(const fx of CAMBIO_FX){
    if(id !== fx.a && id !== fx.b) continue;
    const ms = ahora - fx.t0;
    if(ms >= fx.dur) continue;
    const k = cambioSuave(Math.max(0, ms) / fx.dur);
    return id === fx.a ? cambioPunto(fx, fx.pa, fx.pb, k, 1) : cambioPunto(fx, fx.pb, fx.pa, k, 1);
  }
  return null;
}
function dibujarEfectosCambio(z){
  if(!CAMBIO_FX.length) return false;
  const ahora = performance.now();
  const ve = id => { const t = tokens.get(id); return !!t && (!t.oculto || soyGM) && (typeof tokenVisiblePorNiebla !== 'function' || tokenVisiblePorNiebla(t)); };
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for(let i = CAMBIO_FX.length - 1; i >= 0; i--){
    const fx = CAMBIO_FX[i], ms = ahora - fx.t0;
    if(ms >= fx.dur + 250){ CAMBIO_FX.splice(i, 1); continue; }
    if(ms < 0 || fx.poco) continue;
    const kNow = Math.min(1, ms / fx.dur), apaga = ms > fx.dur ? 1 - (ms - fx.dur) / 250 : 1;
    [[fx.a, fx.pa, fx.pb], [fx.b, fx.pb, fx.pa]].forEach(([id, desde, hasta]) => {
      if(!ve(id)) return;
      for(let j = 1; j <= 9; j++){   // la estela: puntos que quedan atrás y se apagan
        const k = kNow - j * 0.045;
        if(k <= 0) break;
        const p = cambioPunto(fx, desde, hasta, cambioSuave(k), 1), a = (0.55 - j * 0.05) * apaga;
        if(a <= 0) continue;
        const r = HEX * (0.34 - j * 0.025);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(255,230,150,${a.toFixed(3)})`); g.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
  ctx.restore();
  return CAMBIO_FX.length > 0;
}
