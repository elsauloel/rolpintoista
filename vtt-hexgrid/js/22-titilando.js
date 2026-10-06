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
