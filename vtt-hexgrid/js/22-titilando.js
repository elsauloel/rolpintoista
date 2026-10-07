// js/22-titilando.js — Titilando (2026-10-06, dueño: «como en el Contra: cuando te morís y resucitás, titilás unos segundos y sos invulnerable»).
/* Titilando (comun/estados-presets.js: invulnerable, se va al empezar su próximo turno) lo ponen SOLO los efectos que reviven (dueño, 2026-10-06:
   «una poción de cura normal no revive a alguien inconsciente; tiene que ser un efecto que diga revivir»): ✚ Revivir y el Ankh (FichaAcciones).
   Una cura no levanta a un caído (Combatiente.curaQueEntra). Acá: cualquier token con un estado que lo hace invulnerable titila en el mapa
   (`tokenTitila`, lo usa el dibujo en js/05). */

function tokenTitila(t){
  if(!t || !t.fichaId) return false;
  if(t.tipo === 'creep'){
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    if(sc) return Combatiente.titila(sc.estados);
  }
  const e = estadoDe(t);
  return !!(e && Combatiente.titila(e.estados));
}

/* ---------- ✚ Revive, el consumible (2026-10-06, dueño: «hagámoslo») ----------
   «Revive con el 50 % de la vida a 1 aliado caído (inconsciente, antes de morir del todo), a 5 casillas o menos.» Quien lo usa elige a quién
   antes de gastarlo (si cancela o no hay nadie, no se gasta). A un personaje le llega como un aviso (EstadosAplicar.encolarPj, «Revivir»): lo
   aplica la pantalla que lo maneja (comun/recibidos.js → FichaAcciones.aplicarEstadoRecibido) y vuelve Titilando. A un creep (el GM) se le
   pone la vida directo. Las invocaciones, a mano. */
function caidosParaRevivir(origenTok, bando, rango){
  const lejos = t => origenTok ? distanciaHex({col: origenTok.col, fila: origenTok.fila}, {col: t.col, fila: t.fila}) : null;
  const out = [];
  tokens.forEach((t, id) => {
    if(!t || !t.fichaId || t === origenTok || (t.oculto && !soyGM)) return;
    let caido = false, nombre = '', extra = '';
    if(bando === 'pj'){
      if(t.tipo !== 'pj' || String(t.fichaId).includes(SEP_INVOCACION)) return;
      const f = fichasPub.get(t.fichaId), r = f && f.resumen;
      if(!r) return;
      const m = r.muerto;
      if(r.muertoDef || (m && m.definitivo)) return;   // muerto del todo: ya no hay vuelta
      caido = num(r.hp) <= 0 || m === true || !!(m && m.activo);
      nombre = r.nombre || t.nombre || 'Personaje';
      if(m && m.activo) extra = ` · le quedan ${num(m.turnos)} turno${num(m.turnos) === 1 ? '' : 's'}`;
    } else {
      if(t.tipo !== 'creep') return;
      const sc = creepPrivadoDe(t.fichaId);
      caido = !!sc && num(sc.hpMax) > 0 && num(sc.hp) <= 0;
      nombre = (sc && sc.nombre) || t.nombre || 'Creep';
    }
    if(!caido) return;
    const d = lejos(t);
    if(d !== null && d > rango) return;
    out.push({tokenId: id, fichaId: t.fichaId, tipo: bando, nombre, distancia: d, extra});
  });
  return out.sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0));
}
// El cartel «¿A quién revivís?» → Promise del elegido ({tokenId, fichaId, tipo, nombre}) o null.
function elegirCaidoParaRevivir(o){
  const rango = Math.max(1, num(o.rango) || 5);
  const origen = [...tokens.values()].find(t => t && t.fichaId === o.fichaId && t.tipo === o.bando);
  const lista = caidosParaRevivir(origen, o.bando, rango);
  if(!lista.length){
    toast(`✚ ${o.item}: no hay ningún aliado caído a ${rango} casillas o menos${origen ? '' : ' (y tu token no está en este mapa)'} — no se gastó`);
    return Promise.resolve(null);
  }
  return new Promise(res => {
    let listo = false;
    const fin = x => { if(listo) return; listo = true; AvisoCombate.cerrar(); res(x); };
    AvisoCombate.mostrar({icono: '✚', titulo: `${o.item}: ¿a quién revivís?`,
      texto: `Vuelve con el ${o.pct} % de su vida máxima y queda titilando (invulnerable) hasta que empiece su turno. Solo aliados caídos a ${rango} casillas o menos.`,
      botones: [...lista.map(c => ({texto: `✚ ${c.nombre}`, detalle: `${c.distancia !== null ? `a ${c.distancia} casilla${c.distancia === 1 ? '' : 's'}` : 'sin distancia (tu token no está en este mapa)'}${c.extra}`, alClic: () => fin(c)})),
        {texto: 'Cancelar (no se gasta)', sec: true, alClic: () => fin(null)}],
      alCerrar: () => fin(null)});
  });
}
// Revivir al elegido: un personaje por aviso a su pantalla; un creep, directo.
async function revivirElegido(c, pct, origen){
  if(c.tipo === 'creep'){
    await modificarCreep(c.fichaId, sc => {
      sc.hp = Math.max(1, Math.floor(num(sc.hpMax) * pct / 100));
      const e = typeof estadosPresetCreep === 'function' ? Combatiente.estadoTitilando(estadosPresetCreep()) : null;
      if(e){ sc.estados = sc.estados || []; Combatiente.agregarEstado(sc.estados, e); }
    });
    return;
  }
  const f = fichasPub.get(c.fichaId);
  if(!f) throw new Error('no encuentro su ficha');
  await EstadosAplicar.encolarPj({fichaId: c.fichaId, duenoUid: f.duenoUid, spec: {nombre: 'Revivir', pct}, origen});
}
