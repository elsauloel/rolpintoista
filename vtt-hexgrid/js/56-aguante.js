/* ---------- 🛡 Aguante (2026-10-21, dueño; la auditoría de los creeps de choque pesado) ----------
   «Gasta un nitro y un SP, obtiene +2 a la defensa [y +2 a la defensa especial] y queda… cargando. En su próximo turno, su ataque va a tener un dado
   más del dado de su arma por cada golpe que haya recibido durante la ronda. Y ahí se cobra el SP correspondiente por cada dado; los nitros, los del
   ataque»; «el anuncio dice: ‹creep› se pone en modo aguante»; «su próxima vez que apriete atacar, aparece modo aguante, se anuncia ese efecto y se pasa
   al duelo». En modo cooldown, cada dado suma 1 turno de cooldown a Aguante.
   - El estado «Aguante» (`aguante`, comun/estados-presets.js) cuenta los golpes en `golpes`: `aguanteSumar` (lo llama dueloAplicarDano, js/13, cada
     vez que un ataque le pega a un creep, aunque la armadura lo frene todo).
   - Al empezar su turno, `CreepAcciones.inicioCreep` lo pasa a `sc.aguanteListo` (y el estado se va); al terminar su turno, se pierde.
   - `aguanteAtacar` (desde el Atacar de las Acciones, js/12): el cartel, el cobro y el ataque con los dados de más, al duelo. */
async function aguanteSumar(t){
  if(!t || !soyGM) return;
  // 🛡 Un personaje (el Tanque, 2026-10-23): el estado vive en su ficha; lo cuenta la pantalla del GM, que aplica el daño del duelo.
  if(t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION)){
    const pub = fichasPub.get(t.fichaId), r = pub && pub.resumen;
    if(r && Array.isArray(r.estados) && !r.estados.some(e => e && (e.aguante || e.nombre === 'Aguante'))) return;   // (sin el estado, ni la abre)
    try{ await editarPersonajeMapa(t.fichaId, S => { const e = (S.efectos || []).find(x => x && x.activo !== false && x.aguante); if(!e) return false; e.golpes = Math.round(num(e.golpes)) + 1; return ['efectos']; }); }
    catch(err){ console.error('Aguante: no se pudo contar el golpe', err); }
    return;
  }
  if(t.tipo !== 'creep') return;
  const sc = creepPrivadoDe(t.fichaId);
  if(!sc || !(sc.estados || []).some(e => e && e.activo !== false && e.aguante)) return;
  try{ await modificarCreep(String(t.fichaId), c => { const e = (c.estados || []).find(x => x && x.activo !== false && x.aguante); if(e) e.golpes = Math.round(num(e.golpes)) + 1; return {}; }); }
  catch(err){ console.error('Aguante: no se pudo contar el golpe', err); }
}
// El anuncio de una habilidad que lo trae (`h.anuncio`, «{nombre} se pone en modo aguante.»): la Mesa y la Crónica.
function habilidadAnuncio(sc, h){
  if(!h || !h.anuncio) return;
  const txt = String(h.anuncio).replace(/\{nombre\}/g, sc.nombre || 'El creep');
  mesaLinea(`🛡 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'aguante', icono: '🛡', titulo: txt, resultado: (h.detalle || '').split(' ⚙')[0].slice(0, 300), estado: 'listo', datos: {chico: true}});
}
const aguanteTope = sc => Math.max(1, Math.round(num(sc && sc.nivel)) + 1);
async function aguanteAtacar(sc){
  const id = sc.id, golpes = Math.round(num(sc.aguanteListo)), enSP = CreepCalculo.modoSP(sc);
  // Tope (dueño, 2026-10-23): a lo sumo su nivel + 1 dados, aunque haya recibido más golpes (para que el grupo le pueda pegar sin un golpe imposible).
  const tope = aguanteTope(sc), conTope = Math.min(golpes, tope);
  const dados = enSP ? Math.min(conTope, Math.max(0, Math.floor(CreepCalculo.spActual(sc)))) : conTope;
  const tipoD = Combatiente.armaEnMano(sc).tipoDado;
  const costo = enSP ? `${dados} SP` : `+${dados} turno${dados === 1 ? '' : 's'} de cooldown de Aguante`;
  const texto = `${sc.nombre} está en modo aguante: recibió ${golpes} golpe${golpes === 1 ? '' : 's'}, así que este ataque suma +${dados}d${tipoD}`
    + `${conTope < golpes ? ` (el tope es su nivel + 1: ${tope})` : ''}${dados < conTope ? ` (el SP le alcanza para ${dados})` : ''}. Cuesta ${costo}, más los No2 del ataque.`;
  if(!(await AvisoCombate.preguntar(texto, {icono: '🛡', titulo: 'Modo aguante', si: 'Atacar', no: 'Cancelar'}))) return;
  const qs = Combatiente.preguntaSentado(sc.estados, sc.nombre);
  if(qs && !(await AvisoCombate.preguntar(qs, {icono: '⚔', titulo: 'Atacar igual', si: 'Sí, atacar'}))) return;
  const forzar = CreepAcciones.faltanNitros(sc, 'normal');
  if(forzar && !(await AvisoCombate.preguntar(CreepAcciones.preguntaSinNitros(sc, 'normal'), {icono: '⚠', titulo: 'Sin No2', si: 'Sí, atacar'}))) return;
  const x = await acCambiar(c => {
    const r = CreepAcciones.pagarAtaque(c, 'normal', forzar);
    if(!r || r.error) return r;
    if(CreepCalculo.modoSP(c)) c.sp = Math.max(0, CreepCalculo.spActual(c) - dados);
    else{ const h = (c.habilidades || []).find(z => z && z.nombre === 'Aguante'); if(h) h.cdActual = Math.round(num(h.cdActual)) + dados; }
    c.aguanteListo = 0;
    return r;
  });
  if(!x) return;
  CreepAcciones.alertaSinNitros(sc, 'normal', x.forzado);
  acParry.delete(id);
  const txt = `${sc.nombre} descarga el aguante: +${dados}d${tipoD} al ataque (${costo}).`;
  mesaLinea(`🛡 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'aguante', icono: '🛡', titulo: `${sc.nombre} descarga el aguante`, resultado: txt, estado: 'listo', datos: {chico: true}});
  const atq = Combatiente.ataqueConArreglos({nombre: 'Aguante', detalle: `Modo aguante: +${dados}d${tipoD} por los golpes que recibió.`}, {modo: 'arma', arma: {dados}},
    {arma: Combatiente.armaParaArreglos(sc), alcance: CreepCalculo.alcance(sc)});
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible()) acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
  else acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq));
  acDibujar();
}

/* 🛡 El Aguante de un personaje (Tanque, 2026-10-23, dueño: «si es un jugador, el nivel del jugador más uno»): lo mismo que el de los creeps, desde la
   Botonera nueva (bnAtacar, js/11). `S.aguanteListo` lo deja FichaMantenimiento al empezar su turno; al apretar Atacar (ataque normal) sale el
   cartel, se cobran los No2 del ataque y 1 SP por dado (hasta su nivel + 1, y hasta el SP que tenga) y va al duelo como un ataque con arreglos. */
async function aguanteAtacarPj(arma){
  if(!bn || !bn.S || !bnPuedeGuardar()) return false;
  const S = bn.S, golpes = Math.round(num(S.aguanteListo));
  if(!(golpes > 0)) return false;
  const nombre = ((S.meta && S.meta.nombre) || 'Personaje').trim();
  const tope = Math.max(1, Math.round(num(S.meta && S.meta.nivel)) + 1), conTope = Math.min(golpes, tope);
  const spLibre = Math.max(0, Math.floor(FichaBotonera.spMaximo(S, FichaCalculo.calcular(S)) - num(S.spGastado)));
  const dados = Math.min(conTope, spLibre), tipoD = FichaCombate.tipoAtaque(arma);
  const costo = FichaCombate.costoAtaque(S, arma);
  const texto = `${nombre} está en modo aguante: recibió ${golpes} golpe${golpes === 1 ? '' : 's'}, así que este ataque suma +${dados}d${tipoD}`
    + `${conTope < golpes ? ` (el tope es tu nivel + 1: ${tope})` : ''}${dados < conTope ? ` (el SP te alcanza para ${dados})` : ''}. Cuesta ${dados} SP, más los ${fmt(costo)} No2 del ataque.`;
  if(!(await AvisoCombate.preguntar(texto, {icono: '🛡', titulo: 'Modo aguante', si: 'Atacar', no: 'Cancelar'}))) return true;   // (como los creeps)
  const qs = Combatiente.preguntaSentado(S.efectos, nombre);
  if(qs && !(await AvisoCombate.preguntar(qs, {icono: '⚔', titulo: 'Atacar igual', si: 'Sí, atacar'}))) return true;
  const forzar = costo > num(S.nitros);
  if(forzar && !(await AvisoCombate.preguntar(`Te faltan No2 para atacar (cuesta ${fmt(costo)}, tenés ${fmt(num(S.nitros))}). ¿Atacar igual?`, {icono: '⚠', titulo: 'Sin No2', si: 'Sí, atacar'}))) return true;
  const antes = FichaGuardado.partes(S);
  S.nitros = num(S.nitros) - (forzar ? FichaAcciones.gastoNitrosForzado(S, costo, `atacó${arma ? ' con ' + arma.nombre : ''} (aguante)`) : costo);
  FichaCombate.registrarAtaque(S, arma);
  if(dados) FichaAcciones.gastarSp(S, dados, {fijarHp: v => mantFijarHp(S, v), toast}, 'Aguante');
  S.aguanteListo = 0;
  bnUi(antes).cambio();
  const txt = `${nombre} descarga el aguante: +${dados}d${tipoD} al ataque (${dados} SP).`;
  mesaLinea(`🛡 ${txt}`, 'recordatorio');
  if(typeof momentoAbrir === 'function') momentoAbrir({tipo: 'aguante', icono: '🛡', titulo: `${nombre} descarga el aguante`, resultado: txt, estado: 'listo', datos: {chico: true}});
  const atq = Combatiente.ataqueConArreglos({nombre: 'Aguante', detalle: `Modo aguante: +${dados}d${tipoD} por los golpes que recibió.`}, {modo: 'arma', arma: {dados}},
    {arma: {id: arma ? arma.id : '', nombre: arma ? arma.nombre : '', tipoDado: tipoD, rango: !!(arma && arma.armaDeRango), espalda: arma && arma.espalda, sinParry: !!(arma && arma.sinParry)},
      alcance: FichaCombate.alcanceDeArma(S, arma)});
  if(!atq || typeof Duelo === 'undefined' || !Duelo.disponible()){ FichaAcciones.tirarValorStat(S, arma ? `PdG · ${arma.nombre}` : 'PdG', FichaCombate.pdgParaArma(S, arma).valor, 'pdg', undefined, undefined, undefined, bnCombateUi()); return true; }
  const reabrir = () => { if(bn){ bn.host.hidden = false; bnUbicar(); bnDibujar(); } };
  bn.host.hidden = true;
  dueloElegirObjetivoMapa({yo: {ref: bn.fichaId, tipo: 'pj', nombre}, ataque: {...atq, tokenRef: bn.fichaId},
    conSuelto: true, alSuelto: () => { reabrir(); FichaAcciones.tirarValorStat(S, arma ? `PdG · ${arma.nombre}` : 'PdG', FichaCombate.pdgParaArma(S, arma).valor, 'pdg', undefined, undefined, undefined, bnCombateUi()); }, alCancelar: () => {}});
  return true;
}
