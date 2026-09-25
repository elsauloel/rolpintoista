/* =========================================================
   QUÉ ESTADOS ALTERADOS MODIFICAN UNA TIRADA (2026-09-25, pedido del dueño)
   En las botoneras (ficha, invocaciones y Acciones de creeps) los botones de Atacar (PdG), Esquivar, Parry y Bloqueo se pintan
   de VERDE si un estado alterado a favor (buff) los modifica, de ROJO si es en contra (debuff) y de ÁMBAR si hay de los dos, y
   muestran ahí mismo cuál es el modificador ("Pajaritos ÷2 · Afortunado ×2"). El detalle completo sigue en la 🔍 del botón.

   Uso:  const m = ModTirada.tile(estados, 'eva');   →  {clase, html, titulo}
     - clase: ' bt-buff' | ' bt-debuff' | ' bt-mixto' | '' (se suma a la clase del botón)
     - html:  la línea con los modificadores, para poner adentro del botón
     - titulo: ' — Modificado por: …' para sumar al title del botón
   ModTirada.lista(estados, 'pdg') devuelve [{txt, p: 'buff'|'debuff'}]. `estados` es la lista de estados activos de la ficha,
   la invocación o el creep (los campos son los mismos en las tres: mods, mitadPdgEva, lisiado, sentado, afortunado).
   ========================================================= */
const ModTirada = (() => {
  const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  function lista(estados, statId){
    const out = [];
    (estados || []).filter(e => e && e.activo !== false).forEach(e => {
      const pol = e.polaridad === 'buff' ? 'buff' : e.polaridad === 'debuff' ? 'debuff' : 'otro';
      (e.mods || []).filter(m => m && m.stat === statId && num(m.val)).forEach(m => {
        const v = num(m.val);
        out.push({txt: `${e.nombre} ${v > 0 ? '+' : '−'}${Math.abs(v)}`, p: pol === 'otro' ? (v > 0 ? 'buff' : 'debuff') : pol});
      });
      if(e.mitadPdgEva && ['pdg', 'eva'].includes(statId)) out.push({txt: `${e.nombre} ÷2`, p: 'debuff'});
      if(e.lisiado && ['pdg', 'parry'].includes(statId)) out.push({txt: `${e.nombre} ÷2`, p: 'debuff'});
      if(e.sentado && statId === 'eva') out.push({txt: `${e.nombre} ÷2`, p: 'debuff'});
      if(e.afortunado && ['pdg', 'parry', 'eva'].includes(statId)) out.push({txt: `${e.nombre} ×2`, p: 'buff'});
    });
    return out;
  }

  function estilos(){
    if(typeof document === 'undefined' || document.getElementById('modtirada-css')) return;
    const s = document.createElement('style');
    s.id = 'modtirada-css';
    s.textContent = `
.botonera-tile.bt-buff{border-color:#8FB84F!important;background:rgba(143,184,79,.14)!important}
.botonera-tile.bt-debuff{border-color:#D4574E!important;background:rgba(212,87,78,.16)!important}
.botonera-tile.bt-mixto{border-color:#E0A458!important;background:rgba(224,164,88,.14)!important}
.botonera-tile .bt-estados{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;max-width:100%;font-family:"Space Mono",monospace;font-size:9.5px;line-height:1.25;overflow:hidden;text-align:center;word-break:break-word}
.botonera-tile.bt-buff .bt-estados{color:#A8C256}
.botonera-tile.bt-debuff .bt-estados{color:#E27B72}
.botonera-tile.bt-mixto .bt-estados{color:#E0A458}
`;
    document.head.appendChild(s);
  }

  function tile(estados, statId){
    estilos();
    const l = lista(estados, statId);
    if(!l.length) return {clase: '', html: '', titulo: ''};
    const b = l.some(x => x.p === 'buff'), d = l.some(x => x.p === 'debuff');
    const txt = l.map(x => x.txt).join(' · ');
    return {clase: b && d ? ' bt-mixto' : d ? ' bt-debuff' : ' bt-buff', html: `<span class="bt-estados">${esc(txt)}</span>`, titulo: ` — Modificado por: ${txt}`};
  }

  return {lista, tile};
})();
