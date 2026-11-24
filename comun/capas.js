/* comun/capas.js — La última ventana que se abre queda arriba (2026-10-05, dueño: «hay menús que no se ven, quedan detrás de otros»).
   Todas las ventanas (.scrim) se abren poniéndoles la clase «open». Si dos tienen la misma capa (z-index), ganaba la que está más abajo en la
   página aunque se hubiera abierto antes (ej.: en la ficha, «Vender a la tienda» quedaba detrás de la tienda). Acá, cada vez que una se abre,
   se la sube por encima de las que ya estaban abiertas; al cerrarse, vuelve a su capa de siempre. No hay que hacer nada más: alcanza con
   cargar este archivo en la página (`<script src="../comun/capas.js">`). */
(function(){
  if(typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;
  const zDe = el => parseInt(getComputedStyle(el).zIndex, 10) || 0;
  const obs = new MutationObserver(cambios => cambios.forEach(c => {
    const el = c.target;
    if(!el.classList || !el.classList.contains('scrim')) return;
    const abierta = el.classList.contains('open'), antes = String(c.oldValue || '').split(/\s+/).includes('open');
    if(abierta === antes) return;
    // Vuelve a su capa de siempre (al cerrarse, queda así). Solo se deshace lo que subió este archivo: una capa propia puesta en la
    // ventana (`style="z-index:99700"`, como la de ⬆ Subir a la biblioteca, que tiene que quedar encima del asistente de ítems) se respeta
    // (2026-11-24: antes se borraba y «⬆ Subir al catálogo» quedaba detrás del asistente, sin poder tocarse).
    if(el.dataset.capaZ !== undefined){
      if(el.style.zIndex === el.dataset.capaZ) el.style.zIndex = el.dataset.capaAntes || '';
      delete el.dataset.capaZ; delete el.dataset.capaAntes;
    }
    if(!abierta) return;
    const otras = [...document.querySelectorAll('.scrim.open')].filter(x => x !== el).map(zDe);
    const max = otras.length ? Math.max(...otras) : -Infinity;
    if(max >= zDe(el)){ el.dataset.capaAntes = el.style.zIndex; el.style.zIndex = String(max + 1); el.dataset.capaZ = el.style.zIndex; }
  }));
  const iniciar = () => obs.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  if(document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
