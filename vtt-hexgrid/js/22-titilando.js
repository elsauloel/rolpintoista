// js/22-titilando.js — Titilando (2026-10-06, dueño: «como en el Contra: cuando te morís y resucitás, titilás unos segundos y sos invulnerable»).
/* Quien vuelve de estar caído (de 0 de vida a más de 0, por lo que sea: Ankh, ✚ Revivir, una poción, un hechizo, a mano) queda Titilando
   (comun/estados-presets.js: invulnerable, se va al empezar su próximo turno). El Ankh y ✚ Revivir ya lo ponen solos (FichaAcciones); para todo lo
   demás, cada pantalla mira la vida de lo que maneja (sus personajes e invocaciones; el GM, los creeps) y, al verla pasar de 0 a más, se lo pone y
   lo cuenta en la Crónica. La primera vez que ve a alguien solo anota su vida (no dispara al entrar al mapa).
   Además, cualquier token con un estado que lo hace invulnerable titila en el mapa (`tokenTitila`, lo usa el dibujo en js/05). */
const titilaVida = new Map();   // tokenId → la última vida vista

function tokenTitila(t){
  if(!t || !t.fichaId) return false;
  if(t.tipo === 'creep'){
    const sc = soyGM ? creepPrivadoDe(t.fichaId) : null;
    if(sc) return Combatiente.titila(sc.estados);
  }
  const e = estadoDe(t);
  return !!(e && Combatiente.titila(e.estados));
}

// La vida de un token que maneja esta pantalla (o null si no lo maneja o no se sabe).
function titilaVidaDe(t){
  if(!t || !t.fichaId) return null;
  if(t.tipo === 'creep'){
    if(!soyGM) return null;
    const sc = creepPrivadoDe(t.fichaId);
    return sc ? num(sc.hp) : null;
  }
  const [fichaId] = String(t.fichaId).split(SEP_INVOCACION);
  if(typeof bnManejo !== 'function' || !bnManejo(fichaId)) return null;
  if(String(t.fichaId).includes(SEP_INVOCACION)){ const ri = resumenDeInv(t); return ri && ri.activa !== false ? num(ri.hp) : null; }
  const f = fichasPub.get(fichaId);
  return f && f.resumen && f.resumen.hp !== undefined ? num(f.resumen.hp) : null;
}

async function titilarToken(id, t){
  let puesto = false;
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => {
        const e = Combatiente.estadoTitilando(estadosPresetCreep());
        if(!e) return;
        sc.estados = sc.estados || [];
        puesto = Combatiente.agregarEstado(sc.estados, e).ok !== false;
      });
    }else{
      const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
      await editarPersonajeMapa(fichaId, S => {
        const e = Combatiente.estadoTitilando(estadosPresetFicha());
        if(!e) return false;
        let lista;
        if(invId){ const inv = (S.invocaciones || []).find(x => x && x.id === invId); if(!inv) return false; inv.estados = inv.estados || []; lista = inv.estados; }
        else{ S.efectos = S.efectos || []; lista = S.efectos; }
        puesto = Combatiente.agregarEstado(lista, e).ok !== false;
        return puesto;
      });
    }
  }catch(err){ console.error('No se pudo poner Titilando:', err); return; }
  if(!puesto) return;
  momentoAbrir({tipo: 'titilando', icono: '✨', titulo: `${nombreDe(t)} vuelve a la vida`, estado: 'listo',
    datos: {lineas: ['Titila: es invulnerable (no recibe daño ni debuffs) hasta que empiece su próximo turno.']}});
}

setInterval(() => {
  if(!fbMiembro) return;
  tokens.forEach((t, id) => {
    if(t.tipo !== 'creep' && t.tipo !== 'pj') return;
    const hp = titilaVidaDe(t);
    if(hp === null){ titilaVida.delete(id); return; }
    const antes = titilaVida.get(id);
    titilaVida.set(id, hp);
    if(antes === 0 && hp > 0){
      const e = estadoDe(t);
      if(e && (e.estados || []).some(x => x && x.activo !== false && /^titilando$/i.test(String(x.nombre || '').trim()))) return;   // ya lo tiene (Ankh, Revivir)
      titilarToken(id, t);
    }
  });
}, 1000);
