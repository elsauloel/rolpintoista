// js/03-tiradas.js — tramo 3 de 14 del script de ficha.html (paso 5, nivel A: mismo código, en el mismo orden).
/* =========================================================
   DADOS (fórmulas en comun/tiradas.js)
   ========================================================= */


let dadosHistorial = [];


let dadosHistorialSeq = 0;   // id creciente por tirada (para que la Moneda Re-Roll sepa cuál ya usó su re-roll)
// "Mis últimas tiradas" (P138, 2026-10-01): las de este personaje en la Mesa (las escucha la ficha abierta, fichaEscuchar) más
// las de esta ventana que todavía no llegaron; comun/tiradas-propias.js. Las usan la Moneda Re-Roll y la Polilla.
let tiradasMesa = [];
const tiradasPropias = () => TiradasPropias.juntar(dadosHistorial, tiradasMesa);
function registrarTirada(origen, r){
  const entrada = {origen, ...r, hora: new Date(), rerollId: ++dadosHistorialSeq};
  dadosHistorial.unshift(entrada);
  const pub = mesaPublicar(origen, r);
  // El id que le dio la Mesa: así no aparece dos veces en la lista y, si ya usó su moneda, la marca vale para las dos formas.
  if(pub && typeof pub.then === 'function') pub.then(id => {
    if(!id) return;
    entrada.docId = id;
    const u = S.rerollUsados || [];
    if(u.includes('L' + entrada.rerollId) && !u.includes(id)) S.rerollUsados = [...u, id].slice(-50);
  }).catch(() => {});
  window.dispatchEvent(new CustomEvent('tirada-registrada', {detail: {origen, r}}));   // el duelo (comun/duelo.js) recoge su PdG / Evasión de acá
  dadosHistorial = dadosHistorial.slice(0, 20);
  registrarEvento(`🎲 ${origen}: ${r.formula} = ${fmt(r.total)}`);
  if(document.getElementById('scrim-reroll') && $('#scrim-reroll').classList.contains('open')) renderReroll();
  renderPolillaBoton();   // el botón flotante muestra a qué tirada le sumaría el +2
}

/* ---------- Polilla mística (2026-09-27, regla del dueño; catálogo `cat-polilla`) ----------
   El consumible ya crea, al usarlo, el estado permanente «Polilla revoloteando» (efectoNombre del ítem, EFECTOS_PRESET no lo conoce así que
   queda como un estado libre). Mientras ese estado esté activo, un botón flotante (🦋) queda SIEMPRE VISIBLE, arriba de cualquier ventana:
   al tocarlo, suma +2 a la ÚLTIMA tirada propia del log (no vuelve a tirar nada: la tirada ya está hecha) y se anuncia en la Mesa; el estado
   se saca solo (la polilla se gastó). Sin una tirada en el log, no hay a qué sumarle el bono. */
const esPolillaActiva = () => S.efectos.find(e => e && e.activo !== false && /^Polilla revoloteando/i.test(String(e.nombre || '')));
function renderPolillaBoton(){
  const est = esPolillaActiva();
  let b = document.getElementById('polilla-flotante');
  if(!est){ if(b) b.remove(); return; }
  if(!b){
    b = document.createElement('button');
    b.type = 'button';
    b.id = 'polilla-flotante';
    b.style.cssText = 'position:fixed;left:16px;bottom:16px;z-index:999999;background:#3a1f4a;color:#e9d6ff;border:2px solid #b98cff;border-radius:16px;padding:10px 16px;font-size:15px;font-weight:800;cursor:pointer;box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 14px rgba(180,120,255,.5);animation:polilla-latido 2.6s ease-in-out infinite alternate;text-align:left;transform-origin:left bottom';
    b.innerHTML = '<div>🦋 Polilla mística</div><small style="display:block;font-weight:500;font-size:11px;opacity:.9" id="polilla-flotante-sub"></small>';
    b.onclick = usarPolilla;
    document.body.appendChild(b);
    if(!document.getElementById('polilla-css')){
      const s = document.createElement('style');
      s.id = 'polilla-css';
      // Pulsación sutil: un leve respiro de tamaño y brillo, sin el contraste fuerte de los latidos de aviso (duelo, etc.).
      s.textContent = '@keyframes polilla-latido{0%{transform:scale(1);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 10px rgba(180,120,255,.4)}100%{transform:scale(1.025);box-shadow:0 8px 26px rgba(0,0,0,.6),0 0 18px rgba(190,130,255,.65)}}';
      document.head.appendChild(s);
    }
  }
  const ultima = tiradasPropias()[0];
  $('#polilla-flotante-sub').textContent = ultima ? `+2 a tu última tirada: ${ultima.origen} (${fmt(num(ultima.total))})` : 'todavía no hiciste ninguna tirada';
}
function usarPolilla(){
  const est = esPolillaActiva();
  if(!est) return;
  const ultima = tiradasPropias()[0];
  if(!ultima){ toast('Todavía no hiciste ninguna tirada para sumarle el +2'); return; }
  S.efectos = S.efectos.filter(e => e.id !== est.id);   // la polilla se gasta
  ultima.total = num(ultima.total) + 2;   // se ve reflejado en el historial de esta pantalla (la Mesa ya publicada no se reescribe)
  try{ publicarRecordatorios([{nombre: `🦋 ${(S.meta && S.meta.nombre) || 'Alguien'} usó la Polilla mística`, detalle: `+2 a su última tirada — ${ultima.origen}: ahora ${fmt(ultima.total)}`}]); }catch(e){}
  toast(`🦋 Polilla mística: +2 a "${ultima.origen}" (ahora ${fmt(ultima.total)})`);
  renderList('efectos');
  renderPolillaBoton();
}

/* ---------- Historial de sesión (tiradas + eventos, no se guarda) ---------- */
let sesionHistorial = [];
function registrarEvento(texto){
  sesionHistorial.unshift({texto, hora: new Date()});
  sesionHistorial = sesionHistorial.slice(0, 80);
  renderHistorialSesion();
}
function renderHistorialSesion(){
  const el = $('#historial-body');
  if(!el) return;
  el.innerHTML = sesionHistorial.length
    ? sesionHistorial.map(h => `<div>${horaTxt(h.hora)} — ${esc(h.texto)}</div>`).join('')
    : '<div style="opacity:.6">Sin eventos todavía.</div>';
}

/* ---------- Tirar dados a partir del valor de un stat (formulaParaValor: comun/tiradas.js) ---------- */

const STATS_SIN_TIRADA = FichaBotonera.STATS_SIN_TIRADA;   // comun/ficha-botonera.js


// Afortunado da ventaja en PdG/Parry/Evasión: tira dos veces y se queda
// con el total más alto. statId es opcional — solo importa para esos tres.
/* ---------- Percepción ----------
   Stat derivado de Destreza (2026-09-22, antes salía directo del Especial —
   GRUPOS/formulas.percepcion, junto a rng/pdg/crit/parry). La pasiva
   "Percepción aumentada" sube un escalón cada dado (d6 → d8, d8 → d10…) y
   además hace que el mapa le avise de las trampas ocultas cercanas. */
const PERCEPCION_DADO_SUBE = {2: 4, 3: 4, 4: 6, 6: 8, 8: 10, 10: 12, 12: 20, 20: 20};
function tienePercepcionAumentada(){ return FichaBotonera.tienePercepcionAumentada(S); }   // comun/ficha-botonera.js
function tirarPercepcion(){
  const valor = compute().final.percepcion;
  const f = formulaParaValor(valor);
  if(!f){ toast(`Percepción: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
  const mejor = tienePercepcionAumentada();
  const combo = f.combo.map(d => mejor ? (PERCEPCION_DADO_SUBE[d] || d) : d);
  const rolls = combo.map(d => 1 + Math.floor(Math.random() * d));
  const cuenta = {};
  combo.forEach(d => { cuenta[d] = (cuenta[d] || 0) + 1; });
  const formula = Object.keys(cuenta).map(Number).sort((a, b) => a - b).map(d => `${cuenta[d]}d${d}`).join('+') + (f.mod ? `+${f.mod}` : '');
  registrarTirada(mejor ? 'Percepción (aumentada)' : 'Percepción', {formula, rolls, mod: f.mod, total: rolls.reduce((a, b) => a + b, 0) + f.mod});
}


// Sobrepeso (regla en prueba, 2026-09-24): con el equipo pasado de Crg.Max, cada punto de más resta 1 a la Evasión al tirarla, salvo que
// se pague 1 No2. Al tirar Evasión aparece un pop-up para elegir; el estado "Sobrepeso" se ve entre los estados alterados (derivado).
let sobrepesoPendiente = null;
function cerrarSobrepeso(){ sobrepesoPendiente = null; $('#scrim-sobrepeso').classList.remove('open'); }
function sobrepesoElegir(pagar){
  const p = sobrepesoPendiente; if(!p) return;
  if(pagar){
    if(num(S.nitros) < 1){ toast('No tenés Nitros para pagar: tirá con la penalidad o cancelá'); return; }
    S.nitros = num(S.nitros) - 1;
    renderNitros(); refresh();
  }
  cerrarSobrepeso();
  tirarValorStat(p.nombre, p.valor, 'eva', p.extra, pagar ? 'pagado' : 'penal', p.sobre);
}
$('#sobrepeso-x').onclick = cerrarSobrepeso;
$('#scrim-sobrepeso').addEventListener('mousedown', e => { if(e.target.id === 'scrim-sobrepeso') cerrarSobrepeso(); });
$('#sobrepeso-pagar').onclick = () => sobrepesoElegir(true);
$('#sobrepeso-penal').onclick = () => sobrepesoElegir(false);

// Estados que parten la TIRADA a la mitad (Pajaritos, Lisiado, Parálisis, Sentado): comun/combatiente.js.
function mitadesDeTirada(estados, statId){ return Combatiente.mitadesDeTirada(estados, statId); }
function aplicarMitades(total, n){ return Combatiente.aplicarMitades(total, n); }

function tirarValorStat(nombre, valor, statId, extra, sobrepeso, sobre){
  const f = formulaParaValor(valor);
  if(!f){ toast(`${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
  if(statId === 'eva' && !sobrepeso){
    const s = compute().sobrecarga;
    if(s > 0){
      sobrepesoPendiente = {nombre, valor, extra, sobre: s};
      $('#sobrepeso-texto').innerHTML = `Tu equipo pesa <b>${fmt(s)}</b> de más. ¿Pagás <b>1 No2</b> para tirar la evasión sin penalidad, o tirás con <b>−${fmt(s)}</b>? (tenés ${fmt(Math.max(0, num(S.nitros)))} No2)`;
      $('#sobrepeso-penal').textContent = `Tirar con −${fmt(s)}`;
      $('#sobrepeso-pagar').disabled = num(S.nitros) < 1;
      $('#scrim-sobrepeso').classList.add('open');
      return;
    }
  }
  if(sobrepeso === 'penal') extra = num(extra) - num(sobre);
  // La tirada en sí (Afortunado, mitades, Evasión mínimo 1) es la del motor común: comun/combatiente.js.
  const r = Combatiente.tirarStat(valor, S.efectos, statId, {extra});
  if(sobrepeso === 'penal') r.estados.push({n: 'Sobrepeso', p: 'debuff'});
  else if(sobrepeso === 'pagado') r.estados.push({n: 'Sobrepeso (pagó 1 No2)', p: 'otro'});
  registrarTirada(nombre, r);
}

