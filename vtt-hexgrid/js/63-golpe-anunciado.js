/* ---------- 🪓 El que avisa no traiciona / 🐻 Zarpazo erguido (2026-10-21, dueño; choque pesado, «golpe que se anuncia») ----------
   Un turno: levanta el arma (o se para en dos patas) mirando a un rival —es su ataque del turno— y queda «Golpe anunciado» (el estado, con
   `golpeAnunciado`; a quién apunta: `objetivo` = el token, `objetivoNombre`). La Mesa y la Crónica lo anuncian: los jugadores lo ven venir.
   - Cargarlo cuesta 1 No2 y 1 SP (o cooldown 3). Si mientras lo carga le entran 10 de daño o más, sumando, se le cae (`cortaDano`, js/10).
   - Si el objetivo estaba pegado y se aleja, el golpe sale como su ataque de oportunidad: los No2 de una oportunidad y los 3 SP (dueño, 2026-10-21;
     js/17: `golpeAnunciadoOpcion`).
   - En su próximo turno (`sc.golpeListo`, CreepAcciones.inicioCreep) el Atacar de las Acciones (js/12) lo descarga: puede caminar antes; es un
     ataque con su arma con +3 dados del Tipo, sin Parry (solo se esquiva) y, si pega, lo empuja 2 casillas (`h.golpeAnunciado.duelo`). Paga lo de
     un ataque y 3 SP más (`golpeAnunciado.spGolpe`; en modo cooldown, +3 turnos de cooldown a la habilidad). Si no ataca en ese turno, se pierde
     (CreepAcciones.finCreep). Dueño, 2026-10-21: «+3 dados y encima desplazar me parece mucho» → el SP del golpe. */
/* ⚡ Un hechizo que se anuncia (2026-10-24, dueño: el Rayo cargado del Mago): `golpeAnunciado.duelo` puede ser una Ejecución de habilidad (no
   «con tu arma»): la descarga va al cuadro del duelo como un hechizo (PdG.Esp contra la Evasión…), con `no2Golpe` No2 y `spGolpe` SP; los textos
   salen de `icono`, `anuncio` y `detalleGolpe`; no sale de oportunidad. Mientras carga, el estado lleva `marcado` (brilla, se ve a través de la
   niebla: «una luz recubre al creep»). */
const GA_HECHIZO = h => !!(h && h.golpeAnunciado && h.golpeAnunciado.duelo && Combatiente.tipoEjecucion(h.golpeAnunciado.duelo) !== 'arma');
const GA_ICONO = h => (h && h.golpeAnunciado && h.golpeAnunciado.icono) || '🪓';
let golpeSaltear = '';   // el creep que eligió «Ataque común» (una vez)
const golpeAnunciadoDe = sc => (sc && (sc.estados || []).find(e => e && e.activo !== false && e.golpeAnunciado)) || null;
// La habilidad que lo cargó (para armar el golpe): la del nombre guardado, o la primera con `golpeAnunciado`.
const golpeHabDe = (sc, nombre) => (sc.habilidades || []).find(h => h && h.golpeAnunciado && (!nombre || h.nombre === nombre))
  || (sc.habilidades || []).find(h => h && h.golpeAnunciado) || null;
function golpeAtaque(sc, h){
  const g = (h && h.golpeAnunciado) || {};
  return CreepAcciones.ataqueDeHab(sc, {nombre: (h && h.nombre) || 'Golpe anunciado', detalle: g.detalleGolpe || '', duelo: g.duelo});
}

// Después de cargar (js/12, junto a vigilanciaActivada): a quién apunta (un clic en su token; Esc = a quien elija al pegar) y el anuncio.
function golpeAnunciadoActivado(sc, h){
  if(!h || !h.golpeAnunciado) return;
  const e = tokenEntradaCreep(sc.id);
  const anunciar = (tid, nom) => {
    const txt = nom ? `${sc.nombre} ${h.golpeAnunciado.verbo || 'levanta el arma'} mirando a ${nom}… ¡${h.nombre}!` : `${sc.nombre} ${h.golpeAnunciado.verbo || 'levanta el arma'}… ¡${h.nombre}!`;
    mesaLinea(`${GA_ICONO(h)} ${txt}`, 'recordatorio');
    try{ momentoAbrir({tipo: 'golpe-anunciado', icono: GA_ICONO(h), titulo: txt, estado: 'listo',
      resultado: h.golpeAnunciado.anuncio ? h.golpeAnunciado.anuncio
        : `En su próximo turno descarga un golpe con +${GA_DADOS(h)} dados, que no se puede parrear y empuja 2 casillas.${nom ? ` Si ${nom} se aleja de su lado, se lo come de oportunidad.` : ''} Si le entran 10 de daño o más antes, se le cae.`}); }catch(err){}
    if(tid) modificarCreep(String(sc.id), c => {
      const es = golpeAnunciadoDe(c);
      if(es){ es.objetivo = tid; es.objetivoNombre = String(nom || '').slice(0, 40); es.hab = h.nombre; es.detalle = `Apunta a ${nom}. ${es.detalle || ''}`.slice(0, 600); }
      return {};
    }).catch(err => console.error('Golpe anunciado: no se pudo guardar a quién apunta', err));
  };
  if(ac && ac.host) ac.host.hidden = true;
  const reabrir = () => { if(ac && ac.creepId === sc.id){ ac.host.hidden = false; acUbicar(); acDibujar(); } };
  elegirDestino(c => {
    elegirDestinoTerminar();
    const hit = [...tokens.entries()].find(([id, t]) => t.col === c.col && t.fila === c.fila && (!e || id !== e[0]));
    anunciar(hit ? hit[0] : '', hit ? nombreDe(hit[1]) : '');
    reabrir();
  }, `<b>🪓 ¿A quién apunta ${esc(sc.nombre)}?</b> <span>clic en su token · Esc: a quien elija al pegar</span>`, true, () => { anunciar('', ''); reabrir(); });
}
const GA_DADOS = h => num((((h && h.golpeAnunciado) || {}).duelo || {}).arma && h.golpeAnunciado.duelo.arma.dados) || 3;
const GA_SP = h => num(h && h.golpeAnunciado && h.golpeAnunciado.spGolpe) || 3;
// Lo que cuesta descargarlo (además de los No2 del ataque): 3 SP, o en modo cooldown +3 turnos de cooldown. → {txt, cobrar(c)}
function golpeCosto(sc, h){
  const k = GA_SP(h), enSP = CreepCalculo.modoSP(sc), tiene = enSP ? CreepCalculo.spActual(sc) : 0;
  return {txt: enSP ? `${fmt(k)} SP${tiene < k ? ` (tiene ${fmt(tiene)}: queda en 0)` : ''}` : `+${fmt(k)} turnos de cooldown a ${h.nombre}`,
    cobrar: c => { if(CreepCalculo.modoSP(c)) c.sp = Math.max(0, CreepCalculo.spActual(c) - k); else{ const x = (c.habilidades || []).find(z => z && z.id === h.id); if(x) x.cdActual = Math.round(num(x.cdActual)) + k; } }};
}

// 🗡 El Atacar de su próximo turno (js/12): descargar el golpe, o un ataque común (y se pierde).
async function golpeAnunciadoAtacar(sc, tipo){
  if(golpeSaltear === sc.id){ golpeSaltear = ''; return false; }
  const g = sc.golpeListo || {}, h = golpeHabDe(sc, g.hab);
  if(!h) return false;
  const quien = g.objetivoNombre ? ` contra ${g.objetivoNombre}` : '', k = golpeCosto(sc, h);
  const hechizo = GA_HECHIZO(h), no2H = Math.max(0, Math.round(num(h.golpeAnunciado.no2Golpe)));
  const eleccion = await new Promise(res => AvisoCombate.mostrar({icono: GA_ICONO(h), titulo: h.nombre, texto: hechizo
      ? `${sc.nombre} tiene listo ${h.nombre}${quien}: ${h.golpeAnunciado.detalleGolpe || ''} Cuesta ${no2H ? `${fmt(no2H)} No2 y ` : ''}${k.txt}.`
      : `${sc.nombre} tiene el golpe cargado${quien}: +${GA_DADOS(h)} dados del Tipo de su arma, no se puede parrear y, si pega, lo empuja 2 casillas. Cuesta los No2 de un ataque y ${k.txt}. (Si todavía no está al lado, primero caminá y después apretá Atacar.)`,
    botones: [{texto: hechizo ? `Descargar ${h.nombre}` : 'Descargar el golpe', alClic: () => { AvisoCombate.cerrar(); res('golpe'); }}, {texto: `Un ataque común (se pierde ${hechizo ? 'lo cargado' : 'el golpe'})`, sec: true, alClic: () => { AvisoCombate.cerrar(); res('comun'); }}, {texto: 'Cancelar', sec: true, alClic: () => { AvisoCombate.cerrar(); res(''); }}]}));
  if(!eleccion) return true;
  if(eleccion === 'comun'){
    await acCambiar(c => { c.golpeListo = null; return {}; });
    golpeSaltear = sc.id;
    acAtacar(tipo);
    return true;
  }
  if(hechizo){   // ⚡ el hechizo cargado: al cuadro del duelo, como una habilidad (al objetivo que anunció, si lo hay)
    const x = await acCambiar(c => { c.nitros = num(c.nitros) - no2H; k.cobrar(c); c.golpeListo = null; return {}; });
    if(!x) return true;
    const txt = `${sc.nombre} descarga ${h.nombre}${quien} (${no2H ? `${fmt(no2H)} No2 y ` : ''}${k.txt.replace(/ \(.*\)$/, '')}).`;
    mesaLinea(`${GA_ICONO(h)} ${txt}`, 'recordatorio');
    try{ momentoAbrir({tipo: 'golpe-anunciado', icono: GA_ICONO(h), titulo: `${sc.nombre} descarga ${h.nombre}`, resultado: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
    const hd = {nombre: h.nombre, detalle: h.golpeAnunciado.detalleGolpe || '', duelo: h.golpeAnunciado.duelo}, ui = acHabUi(), hab = ui.habDuelo(sc, hd);
    if(hab){ if(g.objetivo && tokens.has(g.objetivo)) ac.objetivoFijo = g.objetivo; ui.lanzarDuelo(sc, hd, hab); }
    else toast(`${h.nombre}: hace falta el cuadro del duelo para descargarlo`);
    acDibujar();
    return true;
  }
  const qs = Combatiente.preguntaSentado(sc.estados, sc.nombre);
  if(qs && !(await AvisoCombate.preguntar(qs, {icono: '⚔', titulo: 'Atacar igual', si: 'Sí, atacar'}))) return true;
  const forzar = CreepAcciones.faltanNitros(sc, 'normal');
  if(forzar && !(await AvisoCombate.preguntar(CreepAcciones.preguntaSinNitros(sc, 'normal'), {icono: '⚠', titulo: 'Sin No2', si: 'Sí, atacar'}))) return true;
  const x = await acCambiar(c => { const r = CreepAcciones.pagarAtaque(c, 'normal', forzar); if(!r || r.error) return r; k.cobrar(c); c.golpeListo = null; return r; });
  if(!x) return true;
  CreepAcciones.alertaSinNitros(sc, 'normal', x.forzado);
  acParry.delete(sc.id);
  const txt = `${sc.nombre} descarga ${h.nombre}${quien}: +${GA_DADOS(h)} dados, sin Parry, empuja 2 (${k.txt.replace(/ \(.*\)$/, '')}).`;
  mesaLinea(`🪓 ${txt}`, 'recordatorio');
  try{ momentoAbrir({tipo: 'golpe-anunciado', icono: '🪓', titulo: `${sc.nombre} descarga el golpe`, resultado: txt, estado: 'listo', datos: {chico: true}}); }catch(err){}
  const atq = golpeAtaque(sc, h);
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible()) acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
  else acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq));
  acDibujar();
  return true;
}

// ⚔ La oportunidad (js/17): si quien se aleja es a quien apunta (o no apuntaba a nadie), el golpe cargado: los No2 de una oportunidad y los 3 SP
// (sin los No2, no se ofrece, como cualquier oportunidad). → la opción, o null.
function golpeAnunciadoOpcion(r, moverId){
  if(!r || r.tipo !== 'creep') return null;
  const sc = creepPrivadoDe(r.fichaId), es = golpeAnunciadoDe(sc);
  if(!es || (es.objetivo && es.objetivo !== moverId)) return null;
  const h = golpeHabDe(sc, es.hab);
  if(!h || GA_HECHIZO(h)) return null;   // (un hechizo cargado no sale de oportunidad)
  const atq = golpeAtaque({...sc, id: r.fichaId}, h);
  if(!atq) return null;
  const k = golpeCosto(sc, h), no2 = CreepCalculo.costoOportunidad(sc);
  const tiene = sc.nitros === null || sc.nitros === undefined ? CreepCalculo.nitrosMax(sc) : num(sc.nitros);
  if(tiene < no2) return null;
  return {nombre: `🪓 ${h.nombre}`, costo: no2, yo: {ref: r.fichaId, tipo: 'creep', nombre: nombreDe(r)}, ataque: atq,
    detalle: `El golpe que venía cargando: +${GA_DADOS(h)} dados, sin Parry, empuja 2 · ${fmt(no2)} No2 y ${k.txt}`,
    alUsar: () => modificarCreep(String(r.fichaId), c => { c.estados = (c.estados || []).filter(x => !(x && x.golpeAnunciado)); c.nitros = num(c.nitros) - no2; k.cobrar(c); return {}; })
      .catch(err => console.error('Golpe anunciado: no se pudo gastar', err))};
}
