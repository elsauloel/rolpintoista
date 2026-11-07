// js/83-pacto.js — 😇 el Pacto, arriba del mapa.
/* (dueño, 2026-10-28: «el pacto debe aparecer como un estado activo o botón inactivo, en los botones instantáneos de la parte superior del mapa… podría ser un
   ángel o un halo o algo sagrado»). Para un jugador, el botón 😇 de su personaje principal, siempre a la vista: dorado si el pacto está activo, gris si se
   gastó (lo dice `resumen.pacto` de su ficha). Tocarlo explica qué hace. El pacto se marca en la ficha («😇 Pacto: sí / no»); lo gasta la vida al llegar a 0
   (danioPj, js/10, y FichaAcciones.revisarAnkh). */
function renderPactoBoton(){
  if(typeof Flotantes === 'undefined' || !Flotantes.pacto) return;
  const id = !soyGM && typeof fichaPrincipalId === 'function' ? fichaPrincipalId() : null, f = id && fichasPub.get(id);
  if(!f || !f.resumen){ Flotantes.pacto(null); return; }
  const activo = f.resumen.pacto === true, nombre = f.nombre || (f.resumen && f.resumen.nombre) || 'Tu personaje';
  Flotantes.pacto({mostrar: true, activo, alClic: () => Confirmar.preguntar(activo
    ? `${nombre} tiene un pacto espiritual activo.\n\nSi su vida llega a 0, revive solo con un cuarto de su vida y queda Titilando (invulnerable) hasta el inicio de su próximo turno. Ahí el pacto se gasta.`
    : `El pacto de ${nombre} está gastado.\n\nSe renueva cuando la historia lo dé: alguna entidad espiritual que le brinde otro, por el precio o el intercambio que decida el GM. Se marca en la ficha (😇 Pacto: sí).`,
    {titulo: 'Pacto', icono: '😇', si: 'Entendido', no: 'Cerrar'})});
}
setInterval(() => { try{ renderPactoBoton(); }catch(e){} }, 1500);
