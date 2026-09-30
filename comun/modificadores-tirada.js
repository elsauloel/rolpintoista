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
    // Las mitades salen del motor común (comun/combatiente.js): se muestran exactamente las que se aplican al tirar
    // (Parálisis no aparece si ya parte Lisiado o Pajaritos; dos estados con la misma marca parten una sola vez).
    const parten = new Map();
    Combatiente.estadosQueParten(estados, statId).forEach(e => parten.set(e, (parten.get(e) || 0) + 1));
    (estados || []).filter(e => e && e.activo !== false).forEach(e => {
      const pol = e.polaridad === 'buff' ? 'buff' : e.polaridad === 'debuff' ? 'debuff' : 'otro';
      (e.mods || []).filter(m => m && m.stat === statId && num(m.val)).forEach(m => {
        const v = num(m.val);
        out.push({txt: `${e.nombre} ${v > 0 ? '+' : '−'}${Math.abs(v)}`, p: pol === 'otro' ? (v > 0 ? 'buff' : 'debuff') : pol});
      });
      if(parten.has(e)) out.push({txt: `${e.nombre} ÷${2 ** parten.get(e)}`, p: 'debuff'});
      if(e.afortunado && ['pdg', 'parry', 'eva'].includes(statId)) out.push({txt: `${e.nombre} ×2`, p: 'buff'});
    });
    return out;
  }

  /* ---------- El «?» de las defensas (2026-09-30, pedido del dueño: "que el sistema sea un poco autoexplicativo") ----------
     Esquivar, Parry y Bloqueo llevan un circulito «?»: al pasar el mouse explica qué es cada uno en concepto. Hacer clic en
     el «?» no tira nada. `ModTirada.ayuda('eva'|'parry'|'bloqueo')` devuelve el HTML (va adentro del botón; lo usan la
     ficha, las invocaciones, las Acciones de los creeps y el cuadro del duelo). Los textos siguen las reglas del manual
     (notas Parry, Bloqueo y Evasión de manual-usuario/notas/06-combate.md): si cambia una regla, cambiar acá también. */
  const AYUDA = {
    eva: {t: '🏃 Esquivar (Evasión)', p: [
      'Sacarle el cuerpo al golpe: tirás tu Evasión (sale de la Agilidad) contra el PdG del que te ataca.',
      'Si ganás, no te pega. No necesita arma ni escudo y no cuesta No2.',
      'Nunca baja de 1. Pajaritos y Sentado la parten a la mitad.']},
    parry: {t: '🗡 Parry', p: [
      'Interceptar el arma del enemigo con tu propia arma o tu escudo: tirás tu Parry (sale de la Destreza) contra el PdG del que te ataca.',
      'Cuesta 1 No2 y necesitás un arma o un escudo (un arma natural no alcanza, por ahora).',
      'Si lo ganás, todavía falta aguantar el golpe: sigue el Bloqueo. Si lo perdés, te pega.',
      'Para elegir entre Parry y Esquivar, mirá también cuánto tirarías de Bloqueo.']},
    bloqueo: {t: '🛡 Bloqueo', p: [
      'Aguantar la fuerza del golpe con tu propia fuerza, después de ganar el Parry.',
      'Tirás tu Bloqueo (Fuerza) + el peso de tu arma o escudo, contra la Fuerza del atacante + el peso de su arma.',
      'Si ganás, el golpe queda anulado. Si perdés, pasa la mitad del daño.',
      'No hay Bloqueo sin Parry: el botón muestra lo que tirarías, para decidir antes de defenderte.']},
  };
  function ayuda(clave){
    if(!AYUDA[clave]) return '';
    estilos(); escucharAyuda();
    return `<span class="bt-ayuda" data-ayuda="${clave}" role="note" aria-label="${esc(AYUDA[clave].t + ': ' + AYUDA[clave].p.join(' '))}">?</span>`;
  }
  let ayudaLista = false;
  function escucharAyuda(){
    if(ayudaLista || typeof document === 'undefined') return;
    ayudaLista = true;
    const cerrar = () => { const p = document.getElementById('bt-ayuda-pop'); if(p) p.remove(); };
    document.addEventListener('mouseover', e => {
      const a = e.target.closest && e.target.closest('.bt-ayuda');
      if(!a){ cerrar(); return; }
      const d = AYUDA[a.dataset.ayuda]; if(!d || document.getElementById('bt-ayuda-pop')) return;
      const p = document.createElement('div');
      p.id = 'bt-ayuda-pop';
      p.innerHTML = `<b>${esc(d.t)}</b>${d.p.map(x => `<p>${esc(x)}</p>`).join('')}`;
      document.body.appendChild(p);
      const r = a.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight;
      p.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.left)) + 'px';
      p.style.top = (r.bottom + 6 + h > window.innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
    });
    // Tocar el «?» no dispara el botón que lo contiene (misma idea que la 🔍, comun/lupa.js).
    document.addEventListener('click', e => { if(e.target.closest && e.target.closest('.bt-ayuda')){ e.preventDefault(); e.stopPropagation(); } }, true);
    document.addEventListener('scroll', cerrar, true);
  }

  function estilos(){
    if(typeof document === 'undefined' || document.getElementById('modtirada-css')) return;
    const s = document.createElement('style');
    s.id = 'modtirada-css';
    s.textContent = `
.bt-ayuda{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;border:1px solid currentColor;display:flex;align-items:center;justify-content:center;
  font:700 10px/1 "Space Mono",monospace;opacity:.55;cursor:help;z-index:2}
.bt-ayuda:hover{opacity:1;background:rgba(224,164,88,.2)}
.duelo-op .bt-ayuda,.bt-ayuda.en-linea{position:static;display:inline-flex;vertical-align:middle;margin-left:6px}
#bt-ayuda-pop{position:fixed;z-index:100000;max-width:320px;background:#1d1712;color:#EDE3D6;border:1px solid #E0A458;border-radius:6px;
  padding:9px 11px;font:13px/1.4 system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.5);pointer-events:none}
#bt-ayuda-pop b{display:block;margin-bottom:4px;color:#E0A458}
#bt-ayuda-pop p{margin:4px 0 0}
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

  return {lista, tile, ayuda, AYUDA};
})();
