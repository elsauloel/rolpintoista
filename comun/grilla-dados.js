/* =========================================================
   GRILLA DE DADOS
   Compartido por la ficha, gm-tools y el mapa. Como en Roll20: una fila
   por dado (D4 … D100) y columnas con la cantidad. Clic en el nombre del
   dado tira 1; clic en un número tira esa cantidad. La tirada va a la
   Mesa por la función que pasa cada herramienta (en la ficha y gm-tools,
   registrarTirada; en el mapa, mesaPublicar).

   - En la Mesa flotante (ficha y gm-tools) se abre al costado de la
     cajita; en el mapa, debajo del botón de la barra de arriba.
   - Queda abierta para tirar varias veces; se cierra con el mismo botón,
     con Esc o con un clic afuera.
   ========================================================= */

const GRILLA_CARAS = [4, 6, 8, 10, 12, 20, 100];
const GRILLA_CANTIDADES = [2, 3, 4, 5, 6];

const grilla = {panel: null, boton: null, alTirar: null, lado: 'costado', ancla: null};

function grillaEstilos(){
  if(document.getElementById('grilla-dados-estilos')) return;
  const s = document.createElement('style');
  s.id = 'grilla-dados-estilos';
  s.textContent = `
#grilla-dados{position:fixed;z-index:60;background:var(--panel2,#221A1E);border:2px solid var(--paper,#EDE3D2);border-radius:var(--r,3px);
  box-shadow:0 0 0 3px rgba(0,0,0,.45),0 10px 24px -8px rgba(0,0,0,.6);padding:6px;font-family:"Space Mono",monospace;color:var(--paper,#EDE3D2)}
#grilla-dados table{border-collapse:collapse}
#grilla-dados td{padding:1px}
#grilla-dados button{font-family:inherit;color:inherit;background:none;border:1px solid transparent;border-radius:var(--r,3px);cursor:pointer;
  font-size:13px;min-width:34px;height:30px;padding:0 6px}
#grilla-dados button:hover{background:var(--wine,#8C2F3E);border-color:var(--brass,#E0A458)}
#grilla-dados button:active{background:var(--copper,#C98545);color:#180F08}
#grilla-dados .grilla-dado{text-align:left;min-width:62px;color:var(--brass,#E0A458);font-weight:700}
#grilla-dados .grilla-dado i{font-style:normal;display:inline-block;width:18px;color:var(--muted,#9A867E);font-weight:400}
#grilla-dados .grilla-cant{border-left:1px solid var(--line-soft,#2A2126)}`;
  document.head.appendChild(s);
}

const GRILLA_ICONO = {4: '▲', 6: '■', 8: '◆', 10: '◈', 12: '⬟', 20: '⬢', 100: '%'};

function grillaArmar(){
  grillaEstilos();
  const panel = document.createElement('div');
  panel.id = 'grilla-dados';
  panel.hidden = true;
  panel.innerHTML = '<table>' + GRILLA_CARAS.map(c =>
    `<tr><td><button type="button" class="grilla-dado" data-n="1" data-caras="${c}" title="Tirar 1d${c}"><i>${GRILLA_ICONO[c]}</i>D${c}</button></td>` +
    GRILLA_CANTIDADES.map(n => `<td class="grilla-cant"><button type="button" data-n="${n}" data-caras="${c}" title="Tirar ${n}d${c}">${n}</button></td>`).join('') +
    '</tr>').join('') + '</table>';
  panel.addEventListener('click', e => {
    const b = e.target.closest('button[data-caras]');
    if(!b || !grilla.alTirar) return;
    grilla.alTirar(`${b.dataset.n}d${b.dataset.caras}`);
  });
  document.body.appendChild(panel);
  document.addEventListener('keydown', e => { if(e.key === 'Escape') grillaCerrar(); });
  document.addEventListener('pointerdown', e => {
    if(panel.hidden || panel.contains(e.target) || (grilla.boton && grilla.boton.contains(e.target))) return;
    grillaCerrar();
  });
  window.addEventListener('resize', () => { if(!panel.hidden) grillaUbicar(); });
  grilla.panel = panel;
  return panel;
}

// 'costado': al lado del ancla (a la izquierda si entra, si no a la derecha),
// alineado abajo. 'abajo': debajo del ancla, alineado a su derecha.
function grillaUbicar(){
  const p = grilla.panel, a = grilla.ancla.getBoundingClientRect();
  const w = p.offsetWidth, h = p.offsetHeight, m = 8;
  let x, y;
  if(grilla.lado === 'abajo'){
    x = a.right - w;
    y = a.bottom + 6;
  }else{
    x = a.left - w - m >= 0 ? a.left - w - m : a.right + m;
    y = a.bottom - h;
  }
  p.style.left = Math.max(m, Math.min(x, innerWidth - w - m)) + 'px';
  p.style.top = Math.max(m, Math.min(y, innerHeight - h - m)) + 'px';
}

function grillaCerrar(){
  if(!grilla.panel || grilla.panel.hidden) return;
  grilla.panel.hidden = true;
  if(grilla.boton) grilla.boton.classList.remove('activo');
}

// boton: el que abre/cierra. ancla: junto a qué se ubica. alTirar(formula).
function grillaConectar(boton, {ancla, lado, alTirar}){
  boton.addEventListener('click', e => {
    e.stopPropagation();
    const panel = grilla.panel || grillaArmar();
    if(!panel.hidden && grilla.boton === boton){ grillaCerrar(); return; }
    Object.assign(grilla, {boton, ancla: ancla || boton, lado: lado || 'costado', alTirar});
    panel.hidden = false;
    boton.classList.add('activo');
    grillaUbicar();
  });
}
