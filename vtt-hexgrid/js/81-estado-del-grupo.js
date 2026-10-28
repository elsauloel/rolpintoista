// js/81-estado-del-grupo.js — 🩺 cómo quedó el grupo, para el GM.
/* (dueño, 2026-10-28: «al finalizar combate, después del momento de publicar el loot y terminar ese proceso, al GM le debe aparecer un reporte del estado
   de los jugadores: hp, sp, estados alterados; y ahí él debe poder decidir si le retira algún estado temporal o lo deja. También al pasar de modo narrativo a
   modo combate: debe poder modificar la cantidad de turnos restantes de los estados temporales, si los tuviera»).
   Una ventana con los personajes que tienen token en el mapa que mira el GM: vida, SP y No2 con su máximo, y sus estados. Los temporales (con turnos y que
   no son permanentes) llevan − turnos + y ✕ Sacar; los que no vencen (o salen del equipo y las pasivas) solo se muestran. Escribe con hudEstadoCambiar
   (js/10), lo mismo que el globo de estados del token. Se abre sola al cerrar el botín (js/18, o al publicar sin botín) y al pasar a combate (js/04);
   `motivo`: 'fin' | 'combate'. Se redibuja sola cuando llegan los cambios de las fichas. */
let eg = null;   // {el, motivo, firma, reloj}
function estadoGrupoTokens(){
  return [...tokens.entries()].filter(([, t]) => t && t.tipo === 'pj' && t.fichaId && !String(t.fichaId).includes(SEP_INVOCACION) && vinculo(t))
    .sort((a, b) => nombreDe(a[1]).localeCompare(nombreDe(b[1])));
}
const egTemporal = e => !!e && !e.permanente && !e.derivado && num(e.turnos) > 0;
function estadoGrupoHtml(){
  const lista = estadoGrupoTokens();
  const barra = (txt, v, max, color) => v === null || v === undefined ? '' : `<span class="eg-rec" style="border-color:${color}">${txt} <b>${fmt(num(v))}</b>${max !== null && max !== undefined && num(max) > 0 ? ` / ${fmt(num(max))}` : ''}</span>`;
  const filas = lista.map(([id, t]) => {
    const d = hudDatos(t);
    const estados = (d.estados || []).map((e, i) => ({e, i})).filter(x => x.e && x.e.activo !== false && x.e.nombre);
    const temp = estados.filter(x => egTemporal(x.e)), fijos = estados.filter(x => !egTemporal(x.e));
    const cayo = num(d.hp) <= 0;
    return `<div class="eg-pj">
      <div class="eg-cab"><b>${esc(nombreDe(t))}</b>${cayo ? ' <span class="eg-cayo">💀 en el piso</span>' : ''}</div>
      <div class="eg-recs">${barra('❤ Vida', d.hp, d.hpMax, HP_COLOR)}${barra('✦ SP', d.sp, d.spMax, SP_COLOR)}${barra('⚡ No2', d.no2, d.no2Max, NO2_COLOR)}</div>
      ${temp.length ? temp.map(({e, i}) => `<div class="eg-est ${e.polaridad === 'buff' ? 'buff' : e.polaridad === 'debuff' ? 'debuff' : ''}">
          <span class="eg-nom">${esc(e.nombre)}${num(e.stacks) > 1 ? ` ×${fmt(num(e.stacks))}` : ''}</span>
          <span class="eg-turnos"><button type="button" data-eg-t="${esc(id)}|${i}|-1" title="Un turno menos">−</button><b>${fmt(num(e.turnos))}</b> turno${num(e.turnos) === 1 ? '' : 's'}<button type="button" data-eg-t="${esc(id)}|${i}|1" title="Un turno más">+</button></span>
          <button type="button" class="eg-x" data-eg-x="${esc(id)}|${i}" title="Sacarle este estado">✕ Sacar</button></div>`).join('')
        : '<div class="eg-nada">Sin estados temporales.</div>'}
      ${fijos.length ? `<div class="eg-fijos">No vencen: ${fijos.map(({e}) => esc(e.nombre)).join(' · ')}</div>` : ''}
    </div>`;
  }).join('');
  const intro = eg && eg.motivo === 'combate'
    ? 'Empieza el combate. Si algún estado tiene que durar más o menos, ajustale los turnos (o sacáselo).'
    : 'Terminó el combate. Mirá cómo quedó cada uno y decidí si le sacás algún estado temporal o lo dejás.';
  return `<div class="eg-caja" role="dialog" aria-modal="true">
    <div class="eg-tit"><span>🩺 Cómo quedó el grupo</span><button type="button" data-eg-cerrar title="Cerrar">✕</button></div>
    <div class="eg-intro">${intro}</div>
    <div class="eg-lista">${filas || '<div class="eg-nada">No hay personajes con token en este mapa.</div>'}</div>
    <div class="eg-pie"><button type="button" data-eg-cerrar>Listo</button></div></div>`;
}
function estadoGrupoEstilos(){
  if(document.getElementById('eg-css')) return;
  const s = document.createElement('style');
  s.id = 'eg-css';
  s.textContent = `#eg-fondo{position:fixed;inset:0;z-index:99060;background:rgba(6,8,14,.62);display:flex;align-items:center;justify-content:center;padding:12px}
.eg-caja{width:min(560px,96vw);max-height:90vh;display:flex;flex-direction:column;background:var(--panel);color:var(--paper);border:1px solid var(--line);border-radius:12px;box-shadow:0 14px 40px rgba(0,0,0,.6);font-size:13px}
.eg-tit{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--line);font-weight:800;font-size:15px}
.eg-tit button{background:none;border:0;color:var(--paper);font-size:16px;cursor:pointer}
.eg-intro{padding:10px 14px 0;color:var(--muted)}
.eg-lista{overflow:auto;padding:10px 14px;display:flex;flex-direction:column;gap:10px}
.eg-pj{border:1px solid var(--line);border-radius:10px;padding:8px 10px;background:rgba(0,0,0,.18)}
.eg-cab{font-size:14px;margin-bottom:6px}
.eg-cayo{color:#ff8a8a;font-size:12px}
.eg-recs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px}
.eg-rec{border:1.5px solid;border-radius:12px;padding:2px 8px;font-size:12px}
.eg-est{display:flex;align-items:center;gap:8px;padding:4px 0;border-top:1px dashed var(--line)}
.eg-est.buff .eg-nom{color:#8fe3a9}.eg-est.debuff .eg-nom{color:#d9a3ff}
.eg-nom{flex:1;font-weight:700}
.eg-turnos{display:flex;align-items:center;gap:6px;font-size:12px}
.eg-turnos button,.eg-x,.eg-pie button{background:var(--bg,#1a1416);color:var(--paper);border:1px solid var(--line);border-radius:6px;padding:2px 9px;cursor:pointer;font-weight:700}
.eg-x{color:#ff9a9a}
.eg-nada,.eg-fijos{color:var(--muted);font-size:12px;padding-top:2px}
.eg-pie{padding:10px 14px;border-top:1px solid var(--line);text-align:right}
.eg-pie button{padding:6px 18px}`;
  document.head.appendChild(s);
}
function abrirEstadoDelGrupo(motivo){
  if(!soyGM) return;
  estadoGrupoEstilos();
  cerrarEstadoDelGrupo();
  const el = document.createElement('div');
  el.id = 'eg-fondo';
  document.body.appendChild(el);
  eg = {el, motivo: motivo || 'fin', firma: ''};
  const dibujar = () => {
    if(!eg) return;
    const html = estadoGrupoHtml();
    if(html === eg.firma) return;
    const sc = (el.querySelector('.eg-lista') || {}).scrollTop || 0;
    eg.firma = html; el.innerHTML = html;
    const l = el.querySelector('.eg-lista'); if(l) l.scrollTop = sc;
  };
  dibujar();
  eg.reloj = setInterval(dibujar, 700);   // las fichas llegan solas (fichasPub): se redibuja cuando cambia algo
  el.addEventListener('mousedown', ev => { if(ev.target === el) cerrarEstadoDelGrupo(); });
  el.addEventListener('click', async ev => {
    const b = ev.target.closest('button');
    if(!b) return;
    if(b.hasAttribute('data-eg-cerrar')){ cerrarEstadoDelGrupo(); return; }
    const dato = b.dataset.egT || b.dataset.egX;
    if(!dato) return;
    const [id, i, delta] = dato.split('|'), t = tokens.get(id);
    if(!t) return;
    b.disabled = true;
    try{
      if(b.dataset.egX) await hudEstadoCambiar(t, Number(i), 'quitar');
      else await hudEstadoCambiar(t, Number(i), 'turnos', Number(delta));
    }catch(err){ console.error('No se pudo cambiar el estado:', err); toast('No se pudo cambiar el estado'); }
    b.disabled = false;
  });
}
function cerrarEstadoDelGrupo(){
  if(!eg) return;
  clearInterval(eg.reloj);
  eg.el.remove();
  eg = null;
}
document.addEventListener('keydown', ev => { if(eg && ev.key === 'Escape'){ ev.stopImmediatePropagation(); cerrarEstadoDelGrupo(); } }, true);
