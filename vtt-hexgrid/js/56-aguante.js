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
  if(!t || t.tipo !== 'creep' || !soyGM) return;
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
async function aguanteAtacar(sc){
  const id = sc.id, golpes = Math.round(num(sc.aguanteListo)), enSP = CreepCalculo.modoSP(sc);
  const dados = enSP ? Math.min(golpes, Math.max(0, Math.floor(CreepCalculo.spActual(sc)))) : golpes;
  const tipoD = Combatiente.armaEnMano(sc).tipoDado;
  const costo = enSP ? `${dados} SP` : `+${dados} turno${dados === 1 ? '' : 's'} de cooldown de Aguante`;
  const texto = `${sc.nombre} está en modo aguante: recibió ${golpes} golpe${golpes === 1 ? '' : 's'}, así que este ataque suma +${dados}d${tipoD}`
    + `${dados < golpes ? ` (el SP le alcanza para ${dados})` : ''}. Cuesta ${costo}, más los No2 del ataque.`;
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
    {arma: {...Combatiente.armaDeCombatiente(sc), id: '', nombre: Combatiente.armaEnMano(sc).nombre || '', rango: Combatiente.armaEnMano(sc).armaDeRango}, alcance: CreepCalculo.alcance(sc)});
  if(atq && typeof Duelo !== 'undefined' && Duelo.disponible()) acElegirObjetivo(sc, atq, () => acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq)));
  else acPublicar(sc, CreepDuelo.pdgDeArreglos(sc, atq));
  acDibujar();
}
