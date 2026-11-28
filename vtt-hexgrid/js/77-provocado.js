// js/77-provocado.js — 😤 Tirar la bronca y el brillo del que provoca (2026-10-26, dueño).
// «Tirar la bronca» (Support, creep): elige un aliado en su Rango (o a sí mismo) y, alrededor de ese aliado (radio 3), los rivales tiran Res.Mt contra
// el Ef.Esp del support; el que no resiste queda Provocado por ESE aliado 2 turnos (el área en cascada de siempre, `dueloElegirAreaMapa` con el
// centro fijo; el estado lleva `provocaDe` / `provocaDeNombre`, como el Miedo lleva `miedoDe`).
// El Anuncio: es el de siempre del Provocado (js/04 provocadoAvisar, al empezar su turno, a quien lo maneja), que con `provocaDe` dice «Estás
// provocado por Fulano»; al tocar Aceptar (js/16 momentoAvisoCentro → provocadoBrilloPedir), Fulano brilla con un anillo rojo que late hasta que
// pasa ese turno, en todas las pantallas (el momento `provocado-brillo`, js/16). (Hasta el 2026-10-26 había un Anuncio propio acá que se pisaba con
// ese y con «Empieza tu turno»: probándolo en el mapa no llegaba.)

// ---------- Tirar la bronca ----------
function provocarAliado(sc, h, alTerminar){
  const fin = () => { if(typeof alTerminar === 'function') alTerminar(); };
  const mio = [...tokens.entries()].find(([, x]) => x.tipo === 'creep' && x.fichaId === sc.id);
  if(!mio){ toast(`${h.nombre}: ${sc.nombre} no tiene token en este mapa`); fin(); return; }
  const cfg = h.provocarAliado || {}, radio = Math.max(1, Math.round(num(cfg.radio)) || 3), turnos = Math.max(1, Math.round(num(cfg.turnos)) || 2);
  const rng = Math.max(1, Math.round(num((rangoDeToken(mio[1]) || {}).rng)) || 1);
  const yo = {ref: sc.id, tipo: 'creep', nombre: sc.nombre};
  elegirDestino(c => {
    const e = [...tokens.entries()].find(([, x]) => x.col === c.col && x.fila === c.fila && !x.bajoTierra);
    if(!e || dueloEsRival(yo, e[1])){ toast('Tocá a un aliado (o al mismo creep)'); provocarAliado(sc, h, alTerminar); return; }
    const [aid, at] = e;
    if(aid !== mio[0] && distanciaHex(mio[1], at) > rng){ toast(`Tiene que estar en su Rango (${rng})`); provocarAliado(sc, h, alTerminar); return; }
    const hab0 = CreepAcciones.habEjecucion(sc, h);
    if(!hab0){ toast(`${h.nombre}: no se pudo armar la Ejecución`); fin(); return; }
    const nombreAliado = nombreDe(at);
    const hab = {...hab0, objetivo: 'area', radio, efectos: (hab0.efectos || []).map(ef => ef.spec && ef.spec.nombre === 'Provocado'
      ? {...ef, spec: {...ef.spec, turnos, provocaDe: aid, provocaDeNombre: String(nombreAliado).slice(0, 40)}} : ef)};
    try{ mesaLinea(`😤 ${sc.nombre} usa ${h.nombre} sobre ${nombreAliado}: los rivales a ${radio} casillas o menos de él tiran Res.Mt para no quedar provocados por ${nombreAliado}.`, 'recordatorio'); }catch(err){}
    dueloElegirAreaMapa({yo, ataque: {hab}, centroFijo: {col: at.col, fila: at.fila}});
    fin();
  }, `<b>😤 ${esc(h.nombre)}: ¿sobre qué aliado?</b> <span>clic sobre un aliado en su Rango (${rng}) o sobre el mismo creep · los rivales a ${radio} de él quedan provocados por él · Esc o clic derecho cancelan</span>`, true, fin);
}

// ---------- El brillo del que provoca ----------
const provocadoBrillos = new Map();   // tokenId del que provoca → la clave del turno en que brilla
const provocadoClave = () => `${iniciativa.ronda}:${iniciativa.turno}:${num(iniciativa.paso)}`;
// Al aceptar el Anuncio (js/16): brilla acá y en las demás pantallas (el momento), hasta que pasa el turno.
function provocadoBrilloPedir(provocaDe, quien, nom){
  if(!provocaDe || !tokens.has(provocaDe)) return;
  const clave = provocadoClave();
  provocadoBrillos.set(provocaDe, clave); pedirDibujo();
  try{ momentoAbrir({tipo: 'provocado-brillo', icono: '😤', titulo: `${nom || 'Alguien'} va contra ${quien || 'quien lo provocó'}`, resultado: `Está provocado por ${quien || 'él'}: este turno es para ir contra él.`, estado: 'listo', datos: {provocaDe, clave}}); }catch(err){}
}
// El momento que llega a todas las pantallas (js/16).
function provocadoBrilloRecibido(d){
  if(d && d.datos && d.datos.provocaDe) { provocadoBrillos.set(d.datos.provocaDe, d.datos.clave); pedirDibujo(); }
}
// En el recorrido de los tokens que se ven (js/05): el anillo rojo que late mientras siga el mismo turno.
function provocadoDibujar(id, x, y, rad, z){
  const clave = provocadoBrillos.get(id);
  if(!clave) return false;
  if(clave !== provocadoClave()){ provocadoBrillos.delete(id); return false; }
  const p = 0.5 + 0.5 * Math.sin(performance.now() / 220);
  ctx.save();
  trazarPuntos(verticesHex(x, y, rad * (1.16 + 0.12 * p)));
  ctx.strokeStyle = `rgba(230,50,40,${0.55 + 0.45 * p})`; ctx.lineWidth = (3 + 2.5 * p) / z; ctx.shadowColor = 'rgba(230,50,40,.9)'; ctx.shadowBlur = 14 / z; ctx.stroke();
  ctx.restore();
  return true;
}
