/* =========================================================
   ⚡ LA FILA DE BOTONES ENTRE TIRADAS, en el cuadro del duelo (2026-11-27, Enyetar A2; dueño, con un boceto sobre el cuadro: «me gustaría que los
   botones aparezcan en el menú, entre tiradas, siempre que vengan al caso… con ese espacio dividiéndose en botones por cada opción disponible (por
   ejemplo estos tres) [polilla · enyetar · re-roll (WC-MONEDA)]… De esta manera se ve más claro sin interrumpir la partida. Seguimos con la idea de que
   si alguien tira enyetar, rerroll, etc., el duelo se pausa hasta que se resuelva»).
   El cuadro (comun/duelo.js, `filaHtml`) le pregunta a esta pantalla qué puede usar quien mira sobre una tirada de ESE duelo que todavía se puede
   cambiar (`dueloOpcionesFila(d)`, sin escribir nada) y, al tocar un botón, lo usa (`dueloUsarFila(d, o)`): primero pone el duelo en pausa
   (`Duelo.yetaPausar` con el `tipo`, la misma pausa de la parte A) y después hace lo de siempre de cada cosa. Lo que la levanta: la tirada que se
   cambia (en la misma escritura) o, si no se llega a usar, la pantalla del GM a los 60 s (con el aviso en el cuadro). Lo de cada uno:
   · 🦋 la Polilla (si la tiene activa el personaje que maneja esta pantalla y es parte del duelo) → +2 a esa tirada (js/02 `polillaDespues`);
   · 😈 Enyetar (si le alcanza el SP) → la maldición se tira adentro del mismo cuadro (js/38, A3);
   · 🧚 el Golpe de suerte del Support (antes «Re-roll») (a vos o a un aliado a tu alcance) → repite esa tirada y queda la mejor (js/39);
   · 🧿 el Mal de ojo (el GM, con un creep que lo tenga listo) → el cartel al jugador para repetirla (js/60);
   · 💪 el Empower (a vos o a un aliado del duelo a tu alcance) → +3 a su próxima tirada (js/37);
   · 🪙 «Re-roll (WC-Moneda)» lo arma el propio cuadro (la Moneda Re-Roll o la 🃏 WildCard del personaje).
   Los botoncitos de arriba de estos (🐈‍⬛ 🧚 🧿 💪 🦋 🪙 🃏) se esconden mientras quien mira tiene un duelo abierto en pantalla (comun/flotantes.js).
   ========================================================= */
const FILA_ENYETAR = {sp: 5, spAjeno: 10};
// ¿Esta pantalla maneja ese personaje? (su jugador, o quien tiene 🎮 su control)
function filaManejo(t){
  if(!t || t.tipo !== 'pj' || !t.fichaId || String(t.fichaId).includes(SEP_INVOCACION)) return false;
  return typeof bnManejo === 'function' ? bnManejo(t.fichaId) : (fbUsuario && t.duenoUid === fbUsuario.uid);
}
const filaResumen = t => ((fichasPub.get(t && t.fichaId) || {}).resumen) || {};
const filaRango = t => num((rangoDeToken(t) || {}).rng);
const filaVe = t => !(typeof tokenVisiblePorNiebla === 'function' && !tokenVisiblePorNiebla(t));
// El costo de una cosa Flash para el que la usa: en turno ajeno, el de turno ajeno; sin orden de turnos no se sabe (lo pregunta al usarla).
function filaCostoTxt(tokenId, sp, spAjeno){
  const su = typeof esSuTurno === 'function' ? esSuTurno(tokenId) : null;
  return {sp: su === false ? spAjeno : sp, txt: su === null ? `${fmt(sp)} SP (turno ajeno ${fmt(spAjeno)})` : `${fmt(su === false ? spAjeno : sp)} SP${su === false ? ' (turno ajeno)' : ''}`};
}

function dueloOpcionesFila(d){
  if(modoMapa !== 'combate' || !fbUsuario || !d || !d.atacante || !d.defensor) return [];
  const ops = [];
  const lados = ['atacante', 'defensor'];
  const tokDe = lado => d[lado] && tokens.get(d[lado].tokenId);
  // 🦋 La Polilla del personaje que maneja esta pantalla, sobre su tirada del duelo.
  lados.forEach(lado => {
    const t = tokDe(lado);
    if(!filaManejo(t)) return;
    const idx = (filaResumen(t).estados || []).findIndex(e => e && e.activo !== false && /^Polilla revoloteando/i.test(String(e.nombre || '')));
    if(idx < 0) return;
    const s = Duelo.tiradaSumable(d, lado);
    if(!s || !Duelo.parListo(d, s.campo)) return;
    ops.push({clave: 'polilla', icono: '🦋', txt: 'Polilla', sub: `+2 a tu ${s.etq} (${fmt(s.total)})`, titulo: 'Polilla mística: +2 a esa tirada; el duelo se vuelve a resolver (quien la usa pierde los empates)',
      lado, campo: s.campo, tokenId: d[lado].tokenId});
  });
  const mios = [...tokens.entries()].filter(([, t]) => filaManejo(t) && !filaResumen(t).muerto);
  // 😈 Enyetar: la tirada de un enemigo a tu alcance y a la vista, si te alcanza el SP.
  mios.forEach(([id, t]) => {
    const r = filaResumen(t);
    if(!r.enyetar) return;
    const c = filaCostoTxt(id, FILA_ENYETAR.sp, FILA_ENYETAR.spAjeno);
    if(num(r.sp) < c.sp) return;
    const rng = filaRango(t);
    // ↩ Parte B (2026-11-27): si este es el último duelo que terminó, también sus tiradas (se deshace lo que dejó y se vuelve a resolver, js/138).
    const ultimo = d.estado === 'resuelto' && Duelo.ultimoTerminadoAhora() === d.id;
    Duelo.tiradasEnyetables([d], {esRival: tid => { const x = tokens.get(tid); return !!(x && dueloEsRival(t, x)); },
      alcanza: tid => { const x = tokens.get(tid); return !!x && distanciaHex(t, x) <= rng && filaVe(x); }, incluirCerrados: ultimo})
      .filter(o => o.cerrado || Duelo.parListo(d, o.campo))
      .forEach(o => ops.push({clave: 'enyetar', icono: o.cerrado ? '↩' : '😈', txt: o.cerrado ? 'Enyetar y deshacer' : 'Enyetar', sub: `${o.etq} de ${o.nombre} (${fmt(o.total)}) · ${c.txt}`,
        titulo: o.cerrado ? `${nombreDe(t)}: el duelo ya terminó; si la maldición gana, se deshace lo que dejó y se vuelve a resolver (antes te muestra qué se deshace)`
          : `${nombreDe(t)}: tirás PdG.Esp contra su Res.Esp, acá mismo; si ganás, repite esa tirada y se queda con la peor`, por: id, o}));
  });
  // 🧚 Golpe de suerte (Support): una tirada tuya o de un aliado a tu alcance; queda la mejor.
  mios.forEach(([id, t]) => {
    const r = filaResumen(t);
    if(!(r.reroll || r.suerte)) return;
    const c = filaCostoTxt(id, REROLL.sp, REROLL.spAjeno);
    if(num(r.sp) < c.sp) return;
    const rng = filaRango(t);
    lados.forEach(lado => {
      const x = tokDe(lado);
      if(!x || x.tipo !== 'pj' || (x !== t && (dueloEsRival(t, x) || distanciaHex(t, x) > rng))) return;
      const s = Duelo.tiradaSumable(d, lado);
      if(!s || s.afortunada || !Duelo.parListo(d, s.campo)) return;
      ops.push({clave: 'reroll', icono: '🧚', txt: 'Golpe de suerte', sub: `${x === t ? 'tu ' : ''}${s.etq}${x === t ? '' : ` de ${d[lado].nombre}`} (${fmt(s.total)}) · ${c.txt}`,
        titulo: `${nombreDe(t)}: repite esa tirada y se queda con la mejor`, por: id, lado, campo: s.campo, etq: s.etq, total: s.total});
    });
  });
  // 🧿 Mal de ojo (el GM): un creep que lo tiene listo, sobre la tirada de un personaje a su alcance.
  if(soyGM && typeof malDeOjoCreeps === 'function'){
    malDeOjoCreeps().filter(c => !c.motivo).forEach(c => {
      const rng = filaRango(c.t);
      Duelo.tiradasEnyetables([d], {esRival: tid => { const x = tokens.get(tid); return !!(x && dueloEsRival(c.t, x)); },
        alcanza: tid => { const x = tokens.get(tid); return !!x && distanciaHex(c.t, x) <= rng; }})
        .filter(o => Duelo.parListo(d, o.campo))
        .forEach(o => { const k = malDeOjoCosto(c); ops.push({clave: 'maldeojo', icono: '🧿', txt: 'Mal de ojo', sub: `${nombreDe(c.t)} → ${o.etq} de ${o.nombre} (${fmt(o.total)}) · ${k.txt}`,
          titulo: `${o.nombre} la vuelve a tirar y se queda con la peor`, c, o}); });
    });
  }
  // 💪 Empower: a vos o a un aliado del duelo a tu alcance, para su próxima tirada.
  mios.forEach(([id, t]) => {
    const r = filaResumen(t);
    if(!r.empower) return;
    const rng = filaRango(t);
    lados.forEach(lado => {
      const x = tokDe(lado);
      if(!x || x.tipo !== 'pj' || !x.fichaId || String(x.fichaId).includes(SEP_INVOCACION) || filaResumen(x).muerto) return;
      if(x !== t && (dueloEsRival(t, x) || distanciaHex(t, x) > rng)) return;
      const ya = empowerPendientes(x), c = filaCostoTxt(id, 2 + ya, 4 + ya);
      if(num(r.sp) < c.sp) return;
      ops.push({clave: 'empower', icono: '💪', txt: 'Empower', sub: `${x === t ? 'a vos' : `a ${d[lado].nombre}`}: +${fmt(EMPOWER_SUMA * (ya + 1))} a su próxima tirada · ${c.txt}`,
        titulo: `${nombreDe(t)}: la próxima tirada ${x === t ? 'tuya' : `de ${d[lado].nombre}`}, la que sea, suma +${fmt(EMPOWER_SUMA * (ya + 1))}`, por: id, lado, ya});
    });
  });
  return ops;
}

// Tocar un botón de la fila: el duelo queda en pausa y se usa. → true si se usó (si no, el cuadro vuelve a dibujar la fila).
async function dueloUsarFila(d, o){
  const pausar = y => Duelo.yetaPausar(d.id, y);
  const seguir = motivo => Duelo.yetaSeguir(d.id, motivo).catch(err => console.error('La fila: no se pudo seguir el duelo', err));
  if(o.clave === 'enyetar') return !!(await (o.o.cerrado ? enyetarConfirmarDeshacer(o.por, o.o) : enyetarElegir(o.por, o.o)));   // (pausa, abre este cuadro y echa la maldición: js/38; el último duelo terminado, primero la confirmación: js/138)
  if(o.clave === 'polilla'){
    const t = tokens.get(o.tokenId);
    if(!t) return false;
    if(!(await pausar({tipo: 'polilla', lado: o.lado, campo: o.campo, por: o.tokenId, porNombre: nombreDe(t), a: o.tokenId, aNombre: nombreDe(t)}))){ toast('🦋 Esa tirada ya no se puede cambiar'); return false; }
    const idx = (filaResumen(t).estados || []).findIndex(e => e && e.activo !== false && /^Polilla revoloteando/i.test(String(e.nombre || '')));
    const otro = o.lado === 'atacante' ? d.defensor : d.atacante;
    let p = null;
    try{ p = await Duelo.sumarATirada(d.id, o.lado, 2, '🦋', 'la Polilla', {pausa: 'polilla'}); }catch(err){ console.error('Polilla: no se pudo sumar', err); }
    if(!p){ await seguir('no se pudo usar la Polilla'); toast('🦋 No se pudo usar la Polilla en esa tirada'); return false; }
    await polillaDespues(t, idx, p, otro);
    return true;
  }
  if(o.clave === 'reroll'){
    const yo = tokens.get(o.por), l = d[o.lado] || {};
    if(!yo) return false;
    if(!(await pausar({tipo: 'reroll', lado: o.lado, campo: o.campo, por: o.por, porNombre: nombreDe(yo), a: l.tokenId, aNombre: l.nombre}))){ toast('🧚 Esa tirada ya no se puede cambiar'); return false; }
    const otro = o.lado === 'atacante' ? d.defensor : d.atacante;
    const ok = await rerollUsar(yo, {id: d.id, lado: o.lado, campo: o.campo, nombre: l.nombre, etq: o.etq, total: o.total, contra: (otro && otro.nombre) || 'el otro'});
    if(!ok) await seguir('no se llegó a usar el Golpe de suerte');
    return ok;
  }
  if(o.clave === 'maldeojo'){
    const c = o.c, x = o.o;
    if(!(await pausar({tipo: 'maldeojo', lado: x.lado, campo: x.campo, por: c.id, porNombre: nombreDe(c.t), a: x.tokenId, aNombre: x.nombre}))){ toast('🧿 Esa tirada ya no se puede cambiar'); return false; }
    const ok = await malDeOjoUsar(c, x);
    if(ok) await Duelo.yetaMarcar(d.id, {echado: true}).catch(err => console.error('Mal de ojo: no se pudo anotar', err));
    else await seguir('no se llegó a echar el mal de ojo');
    return ok;
  }
  if(o.clave === 'empower'){
    const yo = tokens.get(o.por), t = tokens.get((d[o.lado] || {}).tokenId);
    if(!yo || !t) return false;
    if(!(await pausar({tipo: 'empower', lado: o.lado, campo: '', por: o.por, porNombre: nombreDe(yo), a: d[o.lado].tokenId, aNombre: nombreDe(t)}))){ toast('💪 El duelo ya está esperando otra cosa'); return false; }
    const ok = await empowerUsar(yo, t, o.ya);
    await Duelo.yetaSeguir(d.id, ok ? 'listo' : 'no se llegó a dar el Empower', ok ? 'gano' : 'seguir').catch(err => console.error(err));
    return ok;
  }
  return false;
}
