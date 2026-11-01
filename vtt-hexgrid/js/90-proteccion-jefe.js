// js/90-proteccion-jefe.js — 🛡 La Protección de jefe como recordatorio (2026-11-01, dueño: «no tiene que ser obligatorio sino un recordatorio de reglas y una
// opción de automatización… que el GM pueda definir sobre la marcha»). La regla la aplica por defecto Combatiente (JEFE_INMUNE / JEFE_UN_TURNO); apenas
// pasa, avisa acá (`window.avisoJefe(info)`, Combatiente.reglaJefe). En la pantalla del GM: el cartel del juego con «Aplicar la regla» o «Aplicar igual /
// completo»; si elige lo segundo, se lo vuelve a poner al creep sin la protección (`sinJefe`). En otra pantalla (no debería tocar creeps): la regla, con su
// línea en la Mesa.
window.avisoJefe = async function(info){
  if(!info) return;
  const linea = t => { try{ mesaLinea(t); }catch(e){} };
  if(!soyGM || typeof Confirmar === 'undefined' || !info.estado){ linea(info.txt); return; }
  const unTurno = info.tipo === 'unTurno';
  const r = await Confirmar.elegir(info.txt, {titulo: 'Protección de jefe', icono: '🛡', no: unTurno ? 'Aplicar la regla (1 turno)' : 'Aplicar la regla (no entra)',
    opciones: [
      {texto: unTurno ? 'Aplicar la regla (1 turno)' : 'Aplicar la regla (no entra)', detalle: 'Lo que dice la Protección de jefe', valor: 'regla'},
      {texto: unTurno ? `Aplicar completo (${info.antes || info.turnos + ' turnos'})` : 'Aplicar igual', detalle: 'Sin la protección: lo decide el GM', valor: 'igual'}]});
  if(r !== 'igual'){ linea(info.txt); return; }
  // El creep: por su id (el de su ficha) o por el nombre del token.
  const tok = [...tokens.values()].find(t => t.tipo === 'creep' && (t.fichaId === info.creepId || ((typeof creepPrivadoDe === 'function' && creepPrivadoDe(t.fichaId)) || {}).id === info.creepId))
    || [...tokens.values()].find(t => t.tipo === 'creep' && nombreDe(t) === info.creepNombre);
  if(!tok){ toast(`No encontré a ${info.creepNombre} en el mapa: ponele ${info.estado.nombre} a mano`); return; }
  try{
    await modificarCreep(tok.fichaId, sc => {
      const est = JSON.parse(JSON.stringify(info.estado));
      est.id = idEstadoNuevo();
      return Combatiente.agregarEstado(sc.estados = sc.estados || [], est, {...sc, sinJefe: true});
    });
    linea(`🛡 ${info.creepNombre}: el GM aplicó ${info.estado.nombre} ${unTurno ? 'completo' : 'igual'} (sin la Protección de jefe)`);
  }catch(err){ console.error(err); toast('No se pudo aplicar: ' + (err.message || err)); }
};
