/* =========================================================
   ITEM-CORTO — cómo se ve un ítem (o una trampa) en una grilla para elegir, y sus «Detalles técnicos» (2026-10-02, pedido del dueño:
   "en la grilla para seleccionar un ítem, lo único que se tiene que ver es lo que hace"; plan en docs/plan-paso-a-paso.md).
   - En la grilla: solo lo que hace. Una trampa, en datos cortos: forma y tamaño, daño, efecto, cómo se evita y qué tan difícil es detectarla.
     Otro ítem: la parte de su Detalle que cuenta qué hace (sin las notas ⚙ Automático / ✋ A mano).
   - En «Ver»: lo que hace y, aparte, el recuadro «Detalles técnicos» (qué se automatiza, qué va a mano, cómo se apila, si falta auditar),
     que solo aparece si hay algo que poner.
   ItemCorto.partes(texto) → {hace, tecnico, auditar}; .trampaFilas(t) → [[etiqueta, valor]]; .grillaHtml(item) (para la tarjeta de la grilla);
   .trampaHtml(t) (las filas de una trampa); .tecnicoHtml(item | texto) (el recuadro, '' si no hay nada). Trae su CSS.
   ========================================================= */
const ItemCorto = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const AVISO_RE = /\(Trampa creada automáticamente: requiere auditar\.\)\s*/;

  // Los estilos (también los copia el mapa adentro de sus recuadros aislados: ItemCorto.CSS).
  const CSS = `
.ic-filas{display:grid;grid-template-columns:auto 1fr;gap:2px 10px;font-size:12.5px;line-height:1.4;margin-top:4px}
.ic-filas .ic-e{color:var(--muted,#9A867E);font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.04em;padding-top:1px}
.ic-filas .ic-v{color:var(--paper,#EDE3D2)}
.ic-filas .ic-mano{color:var(--muted,#9A867E);font-size:11px}
.ic-hace{font-size:12.5px;line-height:1.45;color:var(--paper,#EDE3D2);margin-top:4px}
.ic-tecnico{margin-top:10px;border:1px dashed var(--line,#3B2E34);border-radius:4px;padding:8px 10px;font-size:12.5px;line-height:1.5;color:var(--muted,#9A867E)}
.ic-tecnico > b{display:block;font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px;color:var(--muted,#9A867E)}
.ic-tecnico p{margin:0 0 4px}`;
  let cssPuesto = false;
  function estilos(){
    if(cssPuesto || typeof document === 'undefined') return;
    cssPuesto = true;
    const s = document.createElement('style');
    s.id = 'item-corto-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // El texto de un ítem, partido: lo que hace / las notas técnicas (desde la primera ⚙ o ✋) / si dice que falta auditar.
  function partes(texto){
    let t = String(texto || '');
    const auditar = AVISO_RE.test(t);
    t = t.replace(AVISO_RE, '');
    const i = t.search(/⚙|✋/);
    return {hace: (i >= 0 ? t.slice(0, i) : t).trim(), tecnico: i >= 0 ? t.slice(i).trim() : '', auditar};
  }

  const casillas = r => 3 * r * (r + 1) + 1;
  // Una trampa en datos cortos (forma única de comun/plantillas.js o los datos del catálogo, que traen los mismos campos).
  function trampaFilas(t0){
    const t = t0 && typeof Plantillas !== 'undefined' && Plantillas.trampaDesde ? (Plantillas.trampaDesde(t0) || t0) : (t0 || {});
    const f = [];
    const tam = Math.max(0, num(t.tamano));
    f.push(['Forma', t.tipo === 'linea' ? `Línea de ${Math.max(1, tam)}` : tam ? `Flor de radio ${tam} (${casillas(tam)} casillas)` : 'Una casilla']);
    if(t.dano) f.push(['Daño', `${t.dano} · ${t.ignoraDef ? 'directo a la vida' : 'contempla la armadura'}`]);
    const efecto = t.efectoTxt || (t.estado ? `${t.estado}${num(t.estadoStacks) > 0 ? ' ×' + t.estadoStacks : ''}${num(t.estadoTurnos) > 0 ? ' ' + t.estadoTurnos + ' turnos' : ''}` : '');
    const efectoAuto = !t.efectoTxt ? !!t.estado : !!t.efectoAuto;
    if(efecto) f.push(['Efecto', efecto, efectoAuto ? '' : 'a mano']);
    if(t.teleport && !t.efectoTxt) f.push(['Efecto', 'Teletransporta a quien la pisa']);
    if(!t.dano && !efecto && !t.teleport) f.push(['Efecto', 'Solo avisa cuando se dispara']);
    const salva = t.salvaTxt || (t.salvacion && t.salvacion.stat ? `${t.salvacion.stat} contra ${t.salvacion.dif}` : '');
    f.push(['Se evita', salva || 'no', salva ? 'a mano' : '']);
    f.push(['Detectarla', t.detectarStat ? `Percepción contra ${t.detectarStat === 'dmgesp' ? 'el Efecto especial' : 'la Destreza'} de quien la pone` : num(t.detectar) >= 1 ? `Percepción contra ${num(t.detectar)}` : 'sin definir']);
    if(t.dejaZona) f.push(['Después', `queda como zona ${num(t.zonaTurnos) || 3} turnos`]);
    if(t.amiga) f.push(['Alcanza', 'también a los aliados del área']);
    return f;
  }
  function filasHtml(filas){
    estilos();
    return `<div class="ic-filas">${filas.map(([e, v, nota]) => `<span class="ic-e">${esc(e)}</span><span class="ic-v">${esc(v)}${nota ? ` <span class="ic-mano">(${esc(nota)})</span>` : ''}</span>`).join('')}</div>`;
  }
  const trampaHtml = t => filasHtml(trampaFilas(t));
  // Lo que se ve de un ítem en la tarjeta de una grilla para elegir.
  function grillaHtml(item){
    estilos();
    if(!item) return '';
    if(item.trampaDatos) return trampaHtml(item.trampaDatos);
    const p = partes(item.detalle);
    return p.hace ? `<div class="ic-hace cat-detalle">${esc(p.hace)}</div>` : '';
  }
  // El recuadro «Detalles técnicos» (para «Ver»): '' si no hay nada técnico que contar.
  function tecnicoHtml(fuente){
    estilos();
    const texto = typeof fuente === 'string' ? fuente : (fuente && fuente.detalle) || '';
    const p = partes(texto);
    const extra = [];
    if(fuente && typeof fuente === 'object'){
      if(fuente.trampaDatos && fuente.trampaDatos.detectar === undefined) extra.push('La dificultad para detectarla todavía no está definida.');
      if(fuente.pilaInfinita && !/apila/.test(p.tecnico)) extra.push('Se apila sin límite en la mochila.');
    }
    const lineas = [p.tecnico, ...extra, p.auditar ? 'Creada automáticamente: las cifras están para auditar.' : ''].filter(Boolean);
    if(!lineas.length) return '';
    return `<div class="ic-tecnico"><b>Detalles técnicos</b>${lineas.map(l => `<p>${esc(l)}</p>`).join('')}</div>`;
  }
  // Lo de «Ver»: qué hace (una trampa, en datos cortos), el Detalle sin las notas técnicas y el recuadro «Detalles técnicos».
  function verHtml(item){
    if(!item) return '';
    const p = partes(item.detalle);
    return (item.trampaDatos ? `<div class="view-detalle"><span class="view-label">Qué hace</span>${trampaHtml(item.trampaDatos)}</div>` : '')
      + (p.hace ? `<div class="view-detalle"><span class="view-label">Detalle</span>${esc(p.hace)}</div>` : '')
      + tecnicoHtml(item);
  }
  return {CSS, partes, trampaFilas, trampaHtml, filasHtml, grillaHtml, tecnicoHtml, verHtml};
})();
