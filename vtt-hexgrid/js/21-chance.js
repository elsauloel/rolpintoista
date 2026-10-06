// js/21-chance.js — las mecánicas «con chance» de las piezas (2026-10-04, piernas y pies). Va después del arranque: solo define funciones
// (y una revisión periódica para Recuperarse rápido).
/* Retirada limpia, Inamovible, Recuperarse rápido, Reflejos de mangosta: un stat en % (con el dado de cada porcentaje: Combatiente.chanceDado; 100 = siempre). Regla del dueño
   (2026-10-04): «el anuncio y la tirada no pueden ser silenciosas y automáticas en el log» — a quien le toca se le abre un cartel paso a paso
   (la estética del duelo) con su chance y el botón «🎲 Tirar 1d6»; los dados ruedan, el cartel muestra el resultado y el resto de la mesa lo
   ve en la Crónica (y queda una línea en la Mesa). Con 100 % sale siempre: el cartel lo anuncia, sin tirar.
   Inamovible y Reflejos de mangosta pasan dentro del paso a paso de las trampas (js/19, fases «firme-…» y «reflejos»). */

// El % de un token en uno de estos stats: un creep, de sus datos (solo el GM); un personaje o una invocación, de lo que publica la ficha de su
// dueño (las reglas, iguales para todos: dueño, 2026-10-04).
const CHANCE_RESUMEN = {retirada: 'retirada', inamovible: 'inamovible', recuperarse: 'recuperarse', reflejos: 'reflejos'};
function chanceDe(t, stat){
  if(!t || !t.fichaId) return 0;
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return sc ? Combatiente.chancePct(CreepCalculo.modTotal(sc, stat)) : 0; }
  const ri = resumenDeInv(t);
  if(ri) return Combatiente.chancePct(ri[CHANCE_RESUMEN[stat] || stat]);
  const f = fichasPub.get(t.fichaId);
  return Combatiente.chancePct(f && f.resumen && f.resumen[CHANCE_RESUMEN[stat] || stat]);
}
const chanceMesa = texto => mesaLinea(texto);   // la línea común de la Mesa (comun/mesa.js)
/* El cartel de una chance → Promise<bool> (salió o no). o = {clave, icono, titulo (del cartel), mecanica (nombre para la Mesa), pct, t (el token),
   paso1: {titulo, texto}, momento: el título para la Crónica, exito: {grande, chico, cronica, mesa}, fallo: {grande, chico, cronica, mesa},
   botonOk / botonNo: el texto del botón final}. Cerrar el cartel antes de tirar = no la intenta. */
async function chanceCartel(o){
  const pct = Combatiente.chancePct(o.pct), d = Combatiente.chanceDado(pct), quien = nombreDe(o.t);
  if(pct <= 0) return false;
  const necesita = d ? d.caras - d.exitos + 1 : 0;
  const momentoId = await momentoAbrir({tipo: 'chance', icono: o.icono, titulo: o.momento, estado: 'tirando', datos: {centro: true}});
  const base = {clave: o.clave, icono: o.icono, titulo: o.titulo};
  return new Promise(fin => {
    let listo = false;
    const terminar = v => { if(listo) return; listo = true; AvisoCombate.cerrar(); fin(v); };
    const final = (ok, paso2) => {
      const x = ok ? o.exito : o.fallo;
      chanceMesa(x.mesa);
      momentoActualizar(momentoId, {estado: 'listo', resultado: x.cronica});
      AvisoCombate.mostrar({...base, pasos: [o.paso1, ...(paso2 ? [paso2] : [])], veredicto: {tono: ok ? 'bueno' : 'malo', grande: x.grande, chico: x.chico},
        botones: [{texto: (ok ? o.botonOk : o.botonNo) || 'Entendido', alClic: () => terminar(ok)}], alCerrar: () => terminar(ok)});
    };
    if(pct >= 100){ final(true, null); return; }
    const tirar = async () => {
      if(listo) return;
      const tr = tirarDados('1d' + d.caras);
      if(!tr) return;
      AvisoCombate.mostrar({...base, pasos: [o.paso1, {titulo: 'Tirada', texto: `Rodando el d${d.caras}…`, espera: true}], botones: [{texto: '🎲 Tirando…', deshabilitado: true}], alCerrar: () => {}});
      try{ await mesaPublicar(`${o.mecanica} · ${Combatiente.chanceTexto(pct)}`, {formula: tr.formula, rolls: tr.rolls, mod: tr.mod, total: tr.total, quien, ...(o.t.tipo === 'creep' ? {desde: 'gm'} : {})}); }catch(err){}
      await new Promise(res => (typeof Duelo !== 'undefined' && Duelo.esperarDados) ? Duelo.esperarDados(res) : res());
      const ok = tr.total >= necesita;
      final(ok, {titulo: 'Tirada', texto: `Sacaste ${tr.total} en el d${d.caras} (${ok ? 'salía' : 'salías'} con ${necesita} o más).`});
    };
    AvisoCombate.mostrar({...base, pasos: [o.paso1, {titulo: 'Tirada', texto: `1d${d.caras}: sale con ${necesita} o más.`, espera: true}],
      botones: [{texto: `🎲 Tirar 1d${d.caras}`, alClic: tirar}],
      alCerrar: () => { if(listo) return; listo = true; momentoActualizar(momentoId, {estado: 'listo', resultado: '…no la intentó.'}); fin(false); }});
  });
}

/* ---------- Recuperarse rápido (2026-10-04, pies) ----------
   Cuando a un token que maneja esta pantalla le aparece Inmovilizado, Rengo, Sentado o Lento (con turnos), y tiene Recuperarse rápido, se le abre
   el cartel de la chance: si sale, ese estado arranca con 1 turno menos (si le quedaba 1, se termina). Un creep, en sus datos; un personaje, con
   el aviso de siempre a su ficha («Acortar estado»; una invocación, igual, con su id). Solo lo NUEVO: lo que ya tenía al abrir el mapa no cuenta. */
const recupVistos = new Map();   // tokenId → Set de los estados que traban que ya tenía
const recupCola = [];
let recupOcupado = false;
const recupInicio = Date.now();
function recuperarseRevisar(){
  if(!fbUsuario || Date.now() - recupInicio < 8000) return;   // que lleguen los datos antes de mirar
  tokens.forEach((t, id) => {
    if(!t || !t.fichaId) return;
    const cargado = t.tipo === 'creep' ? soyGM && creepPrivadoDe(t.fichaId) : puedoMover(t) && (String(t.fichaId).includes(SEP_INVOCACION) ? resumenDeInv(t) : fichasPub.get(t.fichaId));
    if(!cargado) return;   // solo lo que maneja esta pantalla, ya cargado (personajes, invocaciones y creeps)
    const presentes = new Set(confusionEstadosDe(t).filter(e => e && e.activo !== false && Combatiente.esTraba(e) && !e.permanente && num(e.turnos) > 0).map(e => String(e.nombre)));
    const antes = recupVistos.get(id);
    recupVistos.set(id, presentes);
    if(!antes || chanceDe(t, 'recuperarse') <= 0) return;
    presentes.forEach(n => { if(!antes.has(n)) recupCola.push({id, nombre: n}); });
  });
  recuperarseSiguiente();
}
async function recuperarseSiguiente(){
  if(recupOcupado || !recupCola.length || AvisoCombate.abierto()) return;
  const {id, nombre} = recupCola.shift();
  const t = tokens.get(id);
  if(!t) return;
  recupOcupado = true;
  try{
    const pct = chanceDe(t, 'recuperarse'), quien = nombreDe(t);
    const ok = await chanceCartel({clave: 'recuperarse', icono: '🦶', titulo: 'Recuperarse rápido', mecanica: 'Recuperarse rápido', pct, t,
      paso1: {titulo: `${quien} quedó ${nombre}`, texto: `Recuperarse rápido ${Combatiente.chanceTexto(pct)}: si sale, ${nombre} le dura 1 turno menos.`},
      momento: `${quien} intenta sacarse de encima ${nombre} (Recuperarse rápido)`,
      exito: {grande: '¡SE RECUPERA!', chico: `${nombre}: 1 turno menos`, cronica: `…¡salió! ${nombre} le dura 1 turno menos.`, mesa: `🦶 ${quien}: Recuperarse rápido — ${nombre} le dura 1 turno menos`},
      fallo: {grande: 'NO ALCANZÓ', chico: `${nombre} dura lo de siempre`, cronica: `…no salió: ${nombre} dura lo de siempre.`, mesa: `🦶 ${quien}: Recuperarse rápido no salió — ${nombre} dura lo de siempre`}});
    if(ok) await recuperarseAcortar(t, nombre);
  }catch(err){ console.error('Recuperarse rápido:', err); }
  finally{ recupOcupado = false; setTimeout(recuperarseSiguiente, 300); }
}
async function recuperarseAcortar(t, nombre){
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => {
        const e = (sc.estados || []).find(x => x && x.activo !== false && x.nombre === nombre && !x.permanente);
        if(!e) return;
        e.turnos = Math.max(0, num(e.turnos) - 1);
        if(e.turnos <= 0) sc.estados = sc.estados.filter(x => x !== e);
      });
    }else await EstadosAplicar.encolarPj({fichaId: t.fichaId, duenoUid: t.duenoUid, spec: {nombre: 'Acortar estado', estado: nombre, stacks: 1}, origen: 'Recuperarse rápido'});
  }catch(err){ console.error('No se pudo acortar el estado:', err); toast(`Recuperarse rápido: sacale 1 turno a ${nombre} a mano`); }
}
setInterval(recuperarseRevisar, 1500);

/* ---------- Usar un consumible: el anuncio (dueño, 2026-10-05: «se anuncia en el log y en la crónica») ----------
   Una línea en la Mesa y una tarjeta en la Crónica para los demás (quien lo usó ya lo vio en su pantalla). Con Saque rápido que salió, a quien
   lo usó le aparece el aviso al centro. `oculto`: un token escondido (oculto o en sigilo) no se anuncia (solo el aviso a quien lo usó). */
function anunciarConsumo(a, oculto){
  if(!oculto){
    mesaLinea(a.texto);
    momentoAbrir({tipo: 'consumo', icono: '🧪', titulo: a.titulo, resultado: a.resultado || '', estado: 'listo', datos: {centro: true}});
  }
  if(a.saqueSalio) AvisoCombate.mostrar({icono: '⚡', titulo: 'Saque rápido', texto: `Sacar ${a.item} del cinturón no te costó No2.`});
}
