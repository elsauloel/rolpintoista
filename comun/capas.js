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
    el.style.zIndex = '';   // su capa de siempre (al cerrarse, queda así)
    if(!abierta) return;
    const otras = [...document.querySelectorAll('.scrim.open')].filter(x => x !== el).map(zDe);
    const max = otras.length ? Math.max(...otras) : -Infinity;
    if(max >= zDe(el)) el.style.zIndex = String(max + 1);
  }));
  const iniciar = () => obs.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true});
  if(document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
})();
