// js/127-zona-detalle.js — 🔍 «Ver detalle» de una zona puesta en el mapa (2026-11-20, dueño: «invoqué el Muro de fuego y después, cuando quería
// recordar bien qué hacía, tenía que ir a la ficha del personaje que lo invocó… que al seleccionarlo, arriba, donde aparece el título, a la derecha,
// aparezca un botoncito que diga "ver detalle"»). El botón sale en el cartel del elemento seleccionado (js/10, `#elemento-etiqueta`) para todo lo que
// tiene algo que contar: zonas, trampas a la vista, terreno en llamas, nubes, portales. La tarjeta se arma desde los DATOS del elemento
// (comun/zona-detalle.js, puro y con pruebas): arriba y destacado, cuánto daño (o qué efecto), a quién y cuándo; debajo, el resto.
// Acá va solo lo que sabe el mapa: quién la puso y si esta pantalla lo ve (el criterio de «lo que hace alguien que no se ve, no lo nombra», js/29),
// cuánto le queda (la misma cuenta que el ⏳ del lienzo) y la descripción de la habilidad (la del creep, solo el GM; la de un personaje, de su ficha).
// No tira ni aplica nada: solo cuenta. Se cierra con ✕, Esc o al soltar la selección.

let zonaDetalleId = null, zonaDetalleFirma = '';
const zonaDetalleDesc = new Map();   // elId → {txt} | {no} | 'cargando'
const ZD_ELEM = {fuego: ['fuego', 'al fuego'], hielo: ['hielo', 'al hielo'], rayo: ['rayo', 'al rayo'], toxico: ['veneno / tóxico', 'a lo tóxico'],
  acido: ['ácido', 'al ácido'], luz: ['luz', 'a la luz'], siniestro: ['lo siniestro', 'a lo siniestro'], arcano: ['arcano', 'a lo arcano']};

// Quién la puso, para esta pantalla. → {c (colocador), ct (su token), autor: {nombre, escondido}}
// ☁ Una nube (`niebla`) guarda quién la puso desde el 2026-11-22 (P259 (3), crearNiebla en js/13); colocadorDe (js/07) no la mira a propósito:
// su duración se sigue contando por Mantenimientos, no por los turnos de quien la puso.
function nubeColocador(el){
  return el && el.niebla && el.zonaCasteadorRef ? {ref: el.zonaCasteadorRef, tipo: el.zonaCasteadorTipo === 'creep' ? 'creep' : 'pj'} : null;
}
function zonaDetalleAutor(el){
  const c = nubeColocador(el) || (typeof colocadorDe === 'function' ? colocadorDe(el) : null);
  if(!c){
    // Sin nadie detrás: la puso alguien a mano (o la pantalla que resolvió una habilidad que no guarda quién fue, como una nube).
    const m = miembros.get(el.duenoUid), nom = m ? (m.gm ? 'El GM' : m.nombre) : '';
    return {c: null, ct: null, autor: nom ? {nombre: el.niebla ? `Se puso desde la pantalla ${nom === 'El GM' ? 'del GM' : 'de ' + nom}. La nube no guarda qué personaje o creep fue (a mano).` : nom} : {}};
  }
  const ct = [...tokens.values()].find(x => String(x.fichaId) === c.ref && (x.tipo === 'creep' ? 'creep' : 'pj') === c.tipo) || null;
  let nombre = ct ? nombreDe(ct) : '';
  if(!nombre){
    if(c.tipo === 'creep') nombre = (creepsPub.get(c.ref) || {}).nombre || '';
    else { const [fid, invId] = c.ref.split(SEP_INVOCACION), f = fichasPub.get(fid);
      nombre = f ? (invId ? (((f.resumen && f.resumen.invocaciones) || []).find(i => i.id === invId) || {}).nombre || f.nombre : f.nombre) : ''; }
  }
  // 🙈 Lo que no se ve, no se nombra: el token de quien la puso, si esta pantalla no lo ve (oculto, en sigilo, bajo la niebla); y un creep que ya
  // no está en el mapa, para un jugador.
  const mio = ct && typeof puedoMover === 'function' && puedoMover(ct);
  const escondido = ct ? (!mio && typeof loVeoAhora === 'function' && !loVeoAhora(ct)) : (!soyGM && c.tipo === 'creep');
  const de = c.tipo === 'creep' ? 'creep' : c.ref.includes(SEP_INVOCACION) ? 'invocación' : 'personaje';
  return {c, ct, autor: escondido ? {escondido: true} : {nombre: nombre ? `${nombre}${de ? ` (${de})` : ''}` : ''}, nombre: escondido ? '' : nombre};
}

// La descripción de la habilidad: no viaja en la zona. Del creep (su parte privada: solo el GM) o de la ficha del personaje que la puso.
function zonaDetalleDescripcion(elId, el, a){
  const ya = zonaDetalleDesc.get(elId);
  if(ya) return ya === 'cargando' ? {} : ya;
  const fin = v => { zonaDetalleDesc.set(elId, v); zonaDetalleFirma = ''; zonaDetalleRefrescar(); return v; };
  const nom = String(el.zonaNombre || '').trim().toLowerCase();
  const buscar = lista => { const h = (lista || []).find(x => x && String(x.nombre || '').trim().toLowerCase() === nom); return h && (h.detalle || h.descripcion) ? String(h.detalle || h.descripcion) : ''; };
  if(el.trampa) return {};   // (la trampa trae su propio texto)
  if(!a.c || !nom) return fin({no: `El elemento no guarda la descripción de la habilidad (${ZonaDetalle.A_MANO}).`});
  if(a.autor.escondido) return fin({no: 'No se muestra: quien la puso no está a la vista.'});
  if(a.c.tipo === 'creep'){
    if(!soyGM) return fin({no: 'La descripción de la habilidad de un creep la ve solo el GM. Lo de arriba sale de lo que la zona hace.'});
    const sc = creepPrivadoDe(a.c.ref), txt = sc ? buscar(sc.habilidades) : '';
    return fin(txt ? {txt} : {no: `No encontré esa habilidad en el creep (${ZonaDetalle.A_MANO}).`});
  }
  zonaDetalleDesc.set(elId, 'cargando');
  const [fid, invId] = a.c.ref.split(SEP_INVOCACION);
  fbDb.doc(fbRutaCampana(`fichas/${fid}/partes/${invId ? 'invocaciones' : 'habilidades'}`)).get().then(p => {
    const d = p.exists ? JSON.parse(p.data().json || '{}') : {};
    let txt = invId ? buscar((((d.invocaciones || []).find(i => i && i.id === invId)) || {}).habilidades) : buscar(d.habilidades);
    // (una varita o un consumible: el nombre de la zona es el del ítem)
    fin(txt ? {txt} : {no: `No encontré una habilidad con ese nombre en la ficha de quien la puso: puede venir de un ítem (${ZonaDetalle.A_MANO}).`});
  }).catch(err => { console.error('Ver detalle: la descripción de la habilidad', err); fin({no: `No se pudo leer la descripción (${ZonaDetalle.A_MANO}).`}); });
  return {};
}

// Cuántos turnos le quedan a lo puesto en el mapa: {quedan, porTurnos} (null si no vence). Con quien la puso en el orden de turnos, son turnos
// SUYOS (`turnos`); si no, lo que falta de Mantenimientos. La usan la tarjeta y el cartel de arriba (js/10), para que digan lo mismo (2026-11-21:
// el cartel contaba siempre por Mantenimientos y decía «quedan 2 turnos» donde la tarjeta decía 1).
function zonaTurnosQuedan(el, a){
  if(!el || el.venceMant === null || el.venceMant === undefined || mantenimientoNumero === null) return null;
  a = a || zonaDetalleAutor(el);
  const porTurnos = !el.niebla && Math.round(num(el.turnos)) > 0 && !!a.c && colocadorEnOrden(a.c);   // (la nube: por Mantenimientos)
  return {quedan: porTurnos ? Math.round(num(el.turnos)) : Math.max(0, el.venceMant - mantenimientoNumero), porTurnos};
}
function zonaDetalleCtx(elId, el){
  const a = zonaDetalleAutor(el), ctx = {autor: a.autor};
  ctx.statLabel = id => (typeof ZONA_STAT_LABEL !== 'undefined' && ZONA_STAT_LABEL[id]) || '';
  ctx.estadoTexto = sp => { try{ const {duelo, porTirada, pct, unaVez, sumaUno, resetea, renuevaPaso, superficie, tiraPaso, salva, efecto, magica, elemento, alEmpezar, ...limpio} = sp; return EstadosAplicar.texto(limpio); }catch(e){ return sp.nombre; } };
  // Cuánto le queda: la misma cuenta que el ⏳ del lienzo (js/05) y el cartel de la casilla (js/104).
  const q = zonaTurnosQuedan(el, a);
  if(q){ ctx.quedan = q.quedan; if(q.porTurnos) ctx.quedanDe = `son turnos de ${a.nombre || 'quien la puso'}: baja uno cada vez que empieza su turno`; }
  let sp = {}; try{ sp = JSON.parse(el.zonaEstado || el.trampaEstado || '{}') || {}; }catch(e){}
  const elem = (typeof Combatiente !== 'undefined' && Combatiente.elementoDe ? Combatiente.elementoDe(el.zonaDanoTipo || '') : '') || (el.trampa ? sp.elemento || '' : '');
  if(elem){ ctx.elemento = elem; ctx.elementoNombre = (ZD_ELEM[elem] || [elem])[0]; ctx.elementoRes = (ZD_ELEM[elem] || [])[1] || `a ${elem}`; }
  ctx.altura = typeof alturaDe === 'function' ? alturaDe(el) : '';
  ctx.cura = typeof zonaCuraDe === 'function' ? zonaCuraDe(el) : null;
  if(sp.porTirada && Combatiente.porTiradaNorm && Combatiente.porTiradaTxt){ try{ ctx.porTiradaTxt = Combatiente.porTiradaTxt(Combatiente.porTiradaNorm(sp.porTirada)); }catch(e){} }
  if(el.zona && !el.trampa){
    const quien = a.autor.escondido ? 'quien la puso' : (a.nombre || '');
    const bando = el.zonaCasteadorTipo === 'creep' ? 'los personajes y sus invocaciones' : 'los creeps';
    ctx.rivalesTxt = quien ? `los rivales de ${quien} (${bando})` : bando;
    ctx.habilidad = a.c ? (el.zonaNombre || '') : 'Puesta a mano desde el mapa (Zonas con efectos persistentes), no con una habilidad.';
  }
  if(el.trampa){
    ctx.magica = typeof trampaEsMagica === 'function' && trampaEsMagica(el);
    const ef = typeof trampaEfectoDe === 'function' ? trampaEfectoDe(el) : null;
    ctx.sola = (ef ? ef.area : (celdasDeElemento(el).length > 1 ? 'trampa' : 'pisador')) === 'pisador';
    ctx.habilidad = el.trampaNombre || '';
  }
  if(el.fuego || el.portal || el.townPortal || el.acelerador) ctx.habilidad = a.c ? (el.zonaNombre || '') : '';
  // ☁ La nube: con qué se puso (la Bomba de humo, la Polvareda, la varita, el virote de humo). Si quien la puso no está a la vista, tampoco se dice
  // con qué (el nombre de la habilidad lo delataría: «si la rata está bajo la niebla… no tiene que decir "la rata usó Polvareda"», js/29).
  if(el.niebla){ ctx.habilidad = el.zonaNombre || ''; if(a.autor.escondido) ctx.habilidadOculta = true; }
  const d = el.zona || el.niebla ? zonaDetalleDescripcion(elId, el, a) : {};
  ctx.descripcion = d.txt || ''; ctx.descripcionNo = d.no || '';
  return ctx;
}

function zonaDetalleHtml(elId, el){
  const m = ZonaDetalle.armar(el, zonaDetalleCtx(elId, el));
  if(!m) return '';
  const marcar = t => (typeof Glosario !== 'undefined' && Glosario.marcar ? Glosario.marcar(t) : esc(t));
  const filas = m.filas.map(f => `<div class="zd-fila${f.aMano ? ' zd-amano' : ''}"><b>${esc(f.k)}</b><span>${esc(f.v)}</span></div>`).join('');
  const desc = m.descripcion ? `<div class="zd-desc"><b>📜 Descripción de la habilidad</b><div>${marcar(m.descripcion)}</div></div>`
    : m.descripcionNo ? `<div class="zd-desc zd-amano"><b>📜 Descripción de la habilidad</b><div>${esc(m.descripcionNo)}</div></div>`
    : zonaDetalleDesc.get(elId) === 'cargando' ? '<div class="zd-desc zd-amano"><b>📜 Descripción de la habilidad</b><div>Buscándola…</div></div>' : '';
  return `<div class="zd-cab"><b>${esc(m.icono)} ${esc(m.titulo)}</b><button type="button" class="zd-cerrar" title="Cerrar (Esc)" aria-label="Cerrar">✕</button></div>` +
    `<div class="zd-esencial"><span class="zd-ico">${esc(m.icono)}</span><span>${esc(m.esencial)}</span></div>` +
    `<div class="zd-filas">${filas}</div>${desc}` +
    `<div class="zd-pie">Sale de los datos de lo que está puesto en el mapa. «${ZonaDetalle.A_MANO}» = ese dato no está guardado ahí.</div>`;
}
function zonaDetalleCaja(){
  let c = $('#zona-detalle');
  if(!c){
    c = document.createElement('div'); c.id = 'zona-detalle'; c.hidden = true; c.setAttribute('role', 'dialog'); c.setAttribute('aria-label', 'Detalle de la zona');
    (lienzo.parentElement || document.body).appendChild(c);
    c.addEventListener('click', e => { if(e.target.closest('.zd-cerrar')) zonaDetalleCerrar(); });
  }
  return c;
}
function zonaDetalleAbrir(elId){
  const el = elementos.get(elId);
  if(!el || !puedeVerElemento(el) || !ZonaDetalle.tiene(el)) return;
  zonaDetalleId = elId; zonaDetalleFirma = '';
  if(typeof inerteDetalleId !== 'undefined') inerteDetalleId = null;   // (la misma caja: un detalle por vez)
  zonaDetalleRefrescar();
}
function zonaDetalleCerrar(){
  zonaDetalleId = null; zonaDetalleFirma = '';
  const c = $('#zona-detalle'); if(c) c.hidden = true;
}
// Se rearma mientras está abierta (los turnos que le quedan, quien la puso que aparece o se esconde); se cierra sola si el elemento se fue,
// dejó de verse o se soltó la selección.
function zonaDetalleRefrescar(){
  if(!zonaDetalleId) return;
  const el = elementos.get(zonaDetalleId);
  if(!el || !puedeVerElemento(el) || elementoSeleccionado !== zonaDetalleId){ zonaDetalleCerrar(); return; }
  const c = zonaDetalleCaja(), html = zonaDetalleHtml(zonaDetalleId, el);
  if(!html){ zonaDetalleCerrar(); return; }
  if(html !== zonaDetalleFirma || c.dataset.de !== 'zona'){ c.innerHTML = html; zonaDetalleFirma = html; c.dataset.de = 'zona'; }
  const et = $('#elemento-etiqueta');
  c.style.top = ((et && !et.hidden && et.offsetHeight ? et.offsetTop + et.offsetHeight : 64) + 8) + 'px';
  c.hidden = false;
}
setInterval(zonaDetalleRefrescar, 700);
// El botón del cartel (js/10 lo dibuja con `data-zona-detalle`): abre y cierra.
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-zona-detalle]');
  if(!b) return;
  e.preventDefault(); e.stopPropagation();
  if(zonaDetalleId && zonaDetalleId === elementoSeleccionado) zonaDetalleCerrar(); else if(elementoSeleccionado) zonaDetalleAbrir(elementoSeleccionado);
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && zonaDetalleId) zonaDetalleCerrar(); });

/* ---------- 🚩🤐 «Ver detalle» de un tótem o un estandarte (P259 (4), dueño, 2026-11-22: «Ver detalle para los tótems y los estandartes») ----------
   Son tokens (un creep quieto, js/73), no zonas: el botón va en el cartel del token seleccionado (js/10, `#token-etiqueta`, `data-inerte-detalle`) y
   abre la MISMA tarjeta (`#zona-detalle`, con ZonaDetalle.armarInerte): qué hace, a quién, de quién es, con qué se clavó, cuánto dura. Quien lo clavó
   se nombra salvo que esta pantalla no lo vea (oculto, en sigilo, bajo la niebla): ahí, «Alguien» y sin decir con qué. */
let inerteDetalleId = null, inerteDetalleFirma = '';
function inerteDetalleCtx(id, t){
  const v = vinculo(t) || {}, e = estandarteInfo(t);
  const ct = v.estandarteDeId ? [...tokens.values()].find(x => x.tipo === 'creep' && String(x.fichaId) === v.estandarteDeId) : null;
  const mio = ct && typeof puedoMover === 'function' && puedoMover(ct);
  const escondido = !!ct && !mio && typeof loVeoAhora === 'function' && !loVeoAhora(ct);
  const deNom = ct ? nombreDe(ct) : v.estandarteDe;
  const autor = escondido ? {escondido: true} : deNom ? {nombre: `${deNom} (creep)`, corto: deNom} : {};
  return {e, ctx: {autor, nombre: v.nombre || t.nombre || '', habilidad: escondido ? '' : (v.estandarteCon || ''), habilidadOculta: escondido,
    vida: typeof inerteVida === 'function' ? inerteVida(id, t) : '', bando: t.tipo === 'creep' ? 'creep' : 'pj'}};
}
function inerteDetalleHtml(id, t){
  const {e, ctx} = inerteDetalleCtx(id, t);
  const m = e ? ZonaDetalle.armarInerte(e, ctx) : null;
  if(!m) return '';
  const filas = m.filas.map(f => `<div class="zd-fila${f.aMano ? ' zd-amano' : ''}"><b>${esc(f.k)}</b><span>${esc(f.v)}</span></div>`).join('');
  return `<div class="zd-cab"><b>${esc(m.icono)} ${esc(m.titulo)}</b><button type="button" class="zd-cerrar" title="Cerrar (Esc)" aria-label="Cerrar">✕</button></div>` +
    `<div class="zd-esencial"><span class="zd-ico">${esc(m.icono)}</span><span>${esc(m.esencial)}</span></div>` +
    `<div class="zd-filas">${filas}</div>` +
    `<div class="zd-pie">Sale de los datos de lo que está puesto en el mapa. «${ZonaDetalle.A_MANO}» = ese dato no está guardado ahí.</div>`;
}
function inerteDetalleCerrar(){
  inerteDetalleId = null; inerteDetalleFirma = '';
  const c = $('#zona-detalle'); if(c && !zonaDetalleId) c.hidden = true;
}
function inerteDetalleRefrescar(){
  if(!inerteDetalleId) return;
  const t = tokens.get(inerteDetalleId);
  if(!t || seleccion !== inerteDetalleId || !esInerte(t)){ inerteDetalleCerrar(); return; }
  const html = inerteDetalleHtml(inerteDetalleId, t);
  if(!html){ inerteDetalleCerrar(); return; }
  if(zonaDetalleId) zonaDetalleCerrar();
  const c = zonaDetalleCaja();
  if(html !== inerteDetalleFirma || c.dataset.de !== 'inerte'){ c.innerHTML = html; inerteDetalleFirma = html; c.dataset.de = 'inerte'; }
  const et = $('#token-etiqueta');
  c.style.top = ((et && !et.hidden && et.offsetHeight ? et.offsetTop + et.offsetHeight : 64) + 8) + 'px';
  c.hidden = false;
}
setInterval(inerteDetalleRefrescar, 700);
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-inerte-detalle]');
  if(b){
    e.preventDefault(); e.stopPropagation();
    if(inerteDetalleId && inerteDetalleId === seleccion) inerteDetalleCerrar();
    else if(seleccion){ inerteDetalleId = seleccion; inerteDetalleFirma = ''; inerteDetalleRefrescar(); }
    return;
  }
  if(inerteDetalleId && e.target.closest && e.target.closest('#zona-detalle .zd-cerrar')) inerteDetalleCerrar();
}, true);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && inerteDetalleId) inerteDetalleCerrar(); });
