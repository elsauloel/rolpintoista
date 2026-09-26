/* comun/duelo.js — Ataque paso a paso en vivo entre atacante y defensor (etapa 1: contacto, 1 contra 1).
   Diseño: docs/ataque-paso-a-paso.md. Idea del dueño, 2026-09-26.

   Un duelo es un documento de Firestore (campanas/<partida>/duelos/<id>) que los dos lados ven y escriben en vivo:
     {estado: 'esperando'|'empate'|'resuelto'|'cancelado', atacante:{ref,tipo,nombre,uid,tokenId}, defensor:{…}, ataque:{tipo,armaId,armaNombre,tipoDado},
      pdg:{total,formula,rolls,mod}|null, eva:{…}|null, veredicto:'pego'|'fallo'|null, dif, desempate:'mas1'|'moneda'|null,
      moneda:{quien:'atacante'|'defensor', eleccion:'par'|'impar', resultado, gana}|null, creado, creadoPor}
   EMPATE (regla del dueño, 2026-09-26): si empatan y solo UNA de las dos tiradas lleva un «+» fijo (el +1 de los stats impares), gana la que NO lo lleva;
   si las dos lo llevan (o ninguna), se resuelve con par o impar: cualquiera de los dos elige, el que elige primero, se tira el dado y gana el que acierta.
   TODOS los que están conectados ven el cuadro del duelo (se les abre solo); cualquiera lo puede minimizar («⚔ Ver duelo») y volver a abrir.
   El cuadro solo muestra los botones que le tocan a cada uno (no la Botonera entera).

   Cada lado tira con SU propio código (el de la ficha o el de gm-tools). La página define window.DUELO_HOOKS = {
     soy(lado) → true si ese lado {ref,tipo} es el personaje/invocación/creep que maneja esta página,
     atacar(duelo) → hace el ataque de siempre (paga No2 y tira PdG),
     evadir(duelo) → tira la Evasión de siempre }
   y `registrarTirada` dispara el evento 'tirada-registrada' (detail: {origen, r}), de donde el duelo recoge el resultado.
   En el MAPA no hay hooks: el mapa le pasa a `escuchar` una función `tirar(duelo, lado)` que le pide la tirada al iframe de la ficha (o de las
   Acciones del creep) con el mensaje `duelo-tirar`; el iframe tira y escribe el resultado él mismo en Firestore.
   Elegir el objetivo: dentro del mapa (iframe) se le pide al mapa un clic sobre el token (mensaje `duelo-elegir-objetivo`); en una página suelta
   se elige de una lista. El GM puede tirar «a mano» por quien no responde.
   Depende de sesion.js (fbDb, fbUsuario, fbMiembro, fbRutaCampana) y de las globals esc, num, fmt, toast, formulaParaValor de cada herramienta. */
const Duelo = (() => {
  const MAPA_PRINCIPAL = '_principal';
  const VIGENCIA_MS = 30 * 60 * 1000;      // un duelo sin resolver deja de avisar a los 30 minutos
  const AUTOABRIR_MS = 60 * 1000;          // el cuadro se abre solo si el duelo es de hace menos de un minuto
  const RESUELTO_VISIBLE_MS = 2 * 60 * 1000;
  const NOMBRE_ATAQUE = {normal: 'Ataque', oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};

  let actual = null;         // {id, dato, baja, min} — el duelo abierto (o minimizado) en el cuadro
  let revelado = {};         // id → true: el veredicto ya se animó en esta pestaña
  let manual = {};           // lado → valor tipeado por el GM
  let descartados = new Set();   // duelos que ya cerré: no vuelven a abrirse solos ni a mostrar botón
  let autoAbiertos = new Set();
  let chips = new Map();     // id → botón «Ver duelo»
  let listaDuelos = [];      // último snapshot (para redibujar los botones)
  let escuchando = null;
  let cfgEscuchar = {};
  let esperaTiro = null;     // {id, lado}: esperando que la página registre la tirada
  let pendienteSuelto = null;

  const hooks = () => (typeof window !== 'undefined' && window.DUELO_HOOKS) || null;
  const yo = () => (typeof fbUsuario !== 'undefined' && fbUsuario ? fbUsuario.uid : '');
  const soyGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const enIframe = () => window.parent !== window;
  const disponible = () => !!(typeof fbDb !== 'undefined' && fbDb && typeof fbUsuario !== 'undefined' && fbUsuario && typeof fbMiembro !== 'undefined' && fbMiembro);
  const col = () => fbDb.collection(fbRutaCampana('duelos'));
  const _esc = s => (typeof esc === 'function' ? esc(s) : String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c])));
  const _fmt = n => (typeof fmt === 'function' ? fmt(n) : String(n));
  const _toast = m => { if(typeof toast === 'function') toast(m); };
  const baseDe = ref => String(ref || '').split('~')[0];

  /* ---------- estilos ---------- */
  function inyectarCss(){
    if(document.getElementById('duelo-css')) return;
    const s = document.createElement('style');
    s.id = 'duelo-css';
    s.textContent = `
#duelo-fondo{position:fixed;inset:0;z-index:99000;background:rgba(6,8,14,.78);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
#duelo-fondo.min{display:none}
.duelo-caja{background:#151a26;color:#e9ecf4;border:1px solid #39435c;border-radius:16px;width:min(880px,100%);max-height:96vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.6)}
.duelo-cab{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #2b3347;font-weight:800;font-size:18px;letter-spacing:.03em}
.duelo-cab .bt{display:flex;gap:6px}
.duelo-cab button{background:#232b40;border:0;color:#c7cee2;font-size:16px;cursor:pointer;border-radius:8px;padding:4px 10px}
.duelo-cab button:hover{background:#2d3854}
.duelo-cuerpo{padding:16px 18px;display:flex;flex-direction:column;gap:16px}
.duelo-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:12px;align-items:stretch}
.duelo-lado{background:#1d2335;border:1px solid #2f3852;border-radius:12px;padding:12px 14px;min-width:0}
.duelo-lado.atq{border-color:#a5485a}.duelo-lado.def{border-color:#4a78b8}
.duelo-lado .rol{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd}
.duelo-lado .nom{font-size:22px;font-weight:800;margin-top:2px;overflow-wrap:anywhere}
.duelo-lado .sub{font-size:13px;color:#aab3ca;margin-top:2px}
.duelo-vs .vs{align-self:center;font-weight:800;color:#c9a24a;font-size:26px}
.duelo-paso{background:#1a2030;border:1px solid #2b3347;border-radius:12px;padding:12px 14px}
.duelo-paso h4{margin:0 0 10px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd;font-weight:600}
.duelo-paso h4 .n{display:inline-block;background:#2b3347;color:#e9ecf4;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;margin-right:6px;font-size:11px}
.duelo-tiros{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.duelo-tiro{background:#12172a;border:1px dashed #39435c;border-radius:12px;padding:12px;text-align:center;min-height:150px;display:flex;flex-direction:column;justify-content:center;gap:8px}
.duelo-tiro .que{font-size:12px;color:#9aa4bd;text-transform:uppercase;letter-spacing:.06em}
.duelo-tiro .espera{color:#8b95b0;font-style:italic;font-size:14px}
.duelo-tiro .listo{color:#7fd08c;font-weight:800;font-size:17px}
.duelo-tiro .num{font-size:64px;font-weight:900;line-height:1}
.duelo-tiro .det{font-size:12px;color:#aab3ca}
.duelo-tiro button,.duelo-pie button,.duelo-man button{background:#2d6cdf;color:#fff;border:0;border-radius:10px;padding:11px 14px;font-size:15px;font-weight:700;cursor:pointer}
.duelo-tiro button:disabled{opacity:.5;cursor:default}
.duelo-tiro button.sec,.duelo-pie button.sec{background:#2b3347;color:#d5dbec}
.duelo-man{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}
.duelo-man input{width:70px;background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:6px;padding:7px;text-align:center}
.duelo-veredicto{border-radius:14px;padding:18px;text-align:center;font-weight:900;letter-spacing:.04em}
.duelo-veredicto .grande{font-size:48px;line-height:1.1}
.duelo-veredicto .chico{font-size:14px;font-weight:500;letter-spacing:0;margin-top:6px;opacity:.92}
.duelo-veredicto.empate{background:linear-gradient(180deg,#5a4a1f,#3d3317);border:2px solid #d9b45a;color:#f8ecc6}
.duelo-motivo{margin-top:10px;background:rgba(0,0,0,.28);border-radius:10px;padding:10px 12px;font-size:15px;font-weight:600;letter-spacing:0}
.duelo-par{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:10px;font-size:15px;font-weight:600;letter-spacing:0}
.duelo-par button{background:#c9a24a;color:#1b1608;border:0;border-radius:10px;padding:10px 18px;font-size:16px;font-weight:800;cursor:pointer}
.duelo-par button:disabled{opacity:.5}
.duelo-veredicto.pego{background:linear-gradient(180deg,#1f5a34,#173f27);border:2px solid #4fce7c;color:#c9f5d6}
.duelo-veredicto.fallo{background:linear-gradient(180deg,#5a2530,#3d181f);border:2px solid #d95a6e;color:#fbd0d7}
.duelo-veredicto.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
.duelo-tiro.nuevo .num{animation:duelo-num .6s ease-out both}
@keyframes duelo-golpe{0%{transform:scale(.3);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
@keyframes duelo-num{0%{transform:scale(2.4);opacity:0}100%{transform:scale(1);opacity:1}}
.duelo-pie{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
.duelo-nota{font-size:12px;color:#8b95b0}
.duelo-lista{display:flex;flex-direction:column;gap:6px;max-height:50vh;overflow:auto}
.duelo-lista button{background:#1d2335;color:#e9ecf4;border:1px solid #39435c;border-radius:8px;padding:9px 12px;text-align:left;cursor:pointer;font-size:14px;display:flex;justify-content:space-between;gap:8px}
.duelo-lista button:hover{border-color:#6b8fd6}
.duelo-lista .tag{font-size:11px;color:#9aa4bd}
#duelo-avisos{position:fixed;bottom:14px;left:50%;transform:translateX(-50%);z-index:98000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.duelo-chip{pointer-events:auto;background:#3b1820;color:#ffe3e7;border:2px solid #d95a6e;border-radius:999px;padding:9px 16px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.5);animation:duelo-chip .5s ease-out both}
.duelo-chip.res{background:#173f27;border-color:#4fce7c;color:#c9f5d6}
@keyframes duelo-chip{0%{transform:translateY(30px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
@media(max-width:600px){.duelo-tiros{grid-template-columns:1fr}.duelo-vs{grid-template-columns:1fr}.duelo-vs .vs{display:none}}
`;
    document.head.appendChild(s);
  }

  function fondo(){
    inyectarCss();
    let f = document.getElementById('duelo-fondo');
    if(!f){
      f = document.createElement('div');
      f.id = 'duelo-fondo';
      document.body.appendChild(f);
    }
    return f;
  }
  function quitarFondo(){
    const f = document.getElementById('duelo-fondo');
    if(f) f.remove();
  }
  function avisarPagina(){ window.dispatchEvent(new Event('ep-cerrado')); }   // la Botonera/Acciones del mapa se fijan si quedó algo abierto

  // Cerrar del todo (no vuelve a abrirse solo).
  function cerrar(){
    if(actual){
      descartados.add(actual.id);
      if(actual.baja) actual.baja();
    }
    actual = null;
    manual = {};
    quitarFondo();
    dibujarChips();
    avisarPagina();
  }
  // Minimizar: el duelo sigue vivo y queda el botón «Ver duelo».
  function minimizar(){
    const f = document.getElementById('duelo-fondo');
    if(!actual || !f) return;
    actual.min = true;
    f.classList.add('min');
    dibujarChips();
    avisarPagina();
  }
  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    const f = document.getElementById('duelo-fondo');
    if(!f || f.classList.contains('min')) return;
    e.stopPropagation();
    if(actual) minimizar(); else quitarFondo();
  }, true);

  /* ---------- elegir el objetivo ---------- */
  // cfg = {yo:{ref,tipo,nombre}, ataque:{tipo,armaId,armaNombre,tipoDado}, suelto: fn()} — `suelto` hace el ataque de siempre, sin objetivo.
  function elegirObjetivo(cfg){
    if(!disponible()){ if(cfg.suelto) cfg.suelto(); return; }
    if(enIframe()){
      // Adentro de la Botonera/Acciones del mapa: el objetivo se elige con un clic en el token, en el propio mapa.
      pendienteSuelto = cfg.suelto || null;
      window.parent.postMessage({tipo: 'duelo-elegir-objetivo', yo: cfg.yo, ataque: cfg.ataque, conSuelto: !!cfg.suelto}, location.origin);
      return;
    }
    elegirObjetivoLista(cfg);
  }

  async function tokensDelMapa(){
    let mapaId = MAPA_PRINCIPAL;
    try{
      const a = await fbDb.doc(fbRutaCampana('mapa/activo')).get();
      if(a.exists && a.data().mapaId) mapaId = a.data().mapaId;
    }catch(e){ /* sin mapa activo: el principal */ }
    const c = mapaId === MAPA_PRINCIPAL ? fbDb.collection(fbRutaCampana('tokens')) : fbDb.collection(fbRutaCampana(`mapas/${mapaId}/tokens`));
    const snap = await c.get();
    return snap.docs.map(d => ({id: d.id, ...d.data()})).filter(t => !t.oculto || soyGM());
  }

  // Página suelta (sin mapa al lado): una lista de los tokens.
  async function elegirObjetivoLista(cfg){
    const f = fondo();
    f.classList.remove('min');
    f.innerHTML = `<div class="duelo-caja"><div class="duelo-cab"><span>⚔ ¿A quién atacás?</span><div class="bt"><button type="button" data-x>✕</button></div></div>
      <div class="duelo-cuerpo"><div class="duelo-nota">Cargando los tokens del mapa…</div></div></div>`;
    f.querySelector('[data-x]').onclick = () => quitarFondo();
    let lista = [];
    try{ lista = await tokensDelMapa(); }catch(err){ console.error('Duelo: no se pudieron leer los tokens', err); }
    const propio = t => t.fichaId === cfg.yo.ref && t.tipo === cfg.yo.tipo;
    const objetivos = lista.filter(t => !propio(t)).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
    const cuerpo = f.querySelector('.duelo-cuerpo');
    cuerpo.innerHTML = `<div class="duelo-nota">${_esc(NOMBRE_ATAQUE[cfg.ataque.tipo] || 'Ataque')}${cfg.ataque.armaNombre ? ' con ' + _esc(cfg.ataque.armaNombre) : ''}. Elegí el token al que va dirigido:</div>
      <div class="duelo-lista">${objetivos.length ? objetivos.map(t => `<button type="button" data-tok="${_esc(t.id)}"><span>${_esc(t.nombre)}</span><span class="tag">${t.tipo === 'creep' ? 'creep' : 'personaje'}</span></button>`).join('') : '<div class="duelo-nota">No hay otros tokens en el mapa.</div>'}</div>
      <div class="duelo-pie">${cfg.suelto ? '<button type="button" class="sec" data-suelto>Sin objetivo · tirada suelta</button>' : ''}<button type="button" class="sec" data-cancelar>Cancelar</button></div>`;
    cuerpo.querySelector('[data-cancelar]').onclick = () => quitarFondo();
    const bs = cuerpo.querySelector('[data-suelto]');
    if(bs) bs.onclick = () => { quitarFondo(); cfg.suelto(); };
    cuerpo.querySelector('.duelo-lista').addEventListener('click', async e => {
      const b = e.target.closest('[data-tok]');
      if(!b) return;
      const t = objetivos.find(x => x.id === b.dataset.tok);
      if(!t) return;
      b.disabled = true;
      const mio = lista.find(x => x.fichaId === cfg.yo.ref && x.tipo === cfg.yo.tipo);
      try{
        quitarFondo();
        await crear(cfg, t, mio ? mio.id : '');
      }catch(err){
        console.error('Duelo: no se pudo crear', err);
        _toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + (err.message || err));
      }
    });
  }

  // tokDef = un token del mapa ({id, nombre, tipo, fichaId, duenoUid}); miTokenId = el token del atacante (o '').
  async function crear(cfg, tokDef, miTokenId){
    const ref = await col().add({
      estado: 'esperando',
      atacante: {ref: String(cfg.yo.ref), tipo: cfg.yo.tipo, nombre: String(cfg.yo.nombre || '').slice(0, 40), uid: yo(), tokenId: miTokenId || ''},
      defensor: {ref: String(tokDef.fichaId || ''), tipo: tokDef.tipo, nombre: String(tokDef.nombre || '').slice(0, 40), uid: String(tokDef.duenoUid || ''), tokenId: tokDef.id},
      ataque: {tipo: cfg.ataque.tipo, armaId: String(cfg.ataque.armaId || ''), armaNombre: String(cfg.ataque.armaNombre || '').slice(0, 60), tipoDado: num(cfg.ataque.tipoDado)},
      pdg: null, eva: null, veredicto: null, dif: 0,
      creadoPor: yo(),
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    autoAbiertos.add(ref.id);
    abrir(ref.id);
    return ref.id;
  }

  /* ---------- el cuadro del duelo ---------- */
  function abrir(id){
    if(!disponible()) return;
    descartados.delete(id);
    if(actual && actual.id === id){
      actual.min = false;
      const f0 = document.getElementById('duelo-fondo');
      if(f0) f0.classList.remove('min');
      dibujarChips();
      return;
    }
    if(actual && actual.baja) actual.baja();
    actual = null;
    const f = fondo();
    f.classList.remove('min');
    f.innerHTML = '<div class="duelo-caja"><div class="duelo-cab"><span>⚔ Duelo</span><div class="bt"><button type="button" data-min title="Minimizar">—</button><button type="button" data-x title="Cerrar">✕</button></div></div><div class="duelo-cuerpo"><div class="duelo-nota">Abriendo el duelo…</div></div></div>';
    f.querySelector('[data-min]').onclick = minimizar;
    f.querySelector('[data-x]').onclick = cerrar;
    actual = {id, dato: null, baja: null, min: false};
    actual.baja = col().doc(id).onSnapshot(doc => {
      if(!doc.exists){ _toast('Ese duelo ya no existe'); cerrar(); return; }
      if(!actual || actual.id !== id) return;
      actual.dato = {id, ...doc.data()};
      dibujar();
    }, err => { console.error('Duelo: error escuchando', err); _toast('No se pudo seguir el duelo'); });
    dibujarChips();
  }

  const puedoTirar = lado => !!lado && lado.uid === yo();

  function tiroHtml(d, lado, esNuevo){
    const nombreLado = lado === 'pdg' ? 'PdG' : 'Evasión';
    const ladoDato = lado === 'pdg' ? d.atacante : d.defensor;
    const tiro = d[lado];
    const cerrado = d.estado !== 'esperando' && d.estado !== 'empate';
    const quien = _esc(ladoDato.nombre);
    let cuerpo;
    if((d.veredicto || d.estado === 'empate') && tiro){
      return `<div class="duelo-tiro${esNuevo ? ' nuevo' : ''}"><div class="que">${nombreLado} · ${quien}</div><div class="num">${_fmt(tiro.total)}</div><div class="det">${_esc(tiro.formula || '')}${tiro.rolls && tiro.rolls.length ? ' → ' + tiro.rolls.join(' + ') : ''}${num(tiro.mod) ? ' ' + (num(tiro.mod) > 0 ? '+' : '−') + ' ' + Math.abs(num(tiro.mod)) : ''}</div></div>`;
    }
    if(tiro){
      cuerpo = `<div class="listo">✔ Ya tiró</div><div class="det">el resultado se muestra cuando tiren los dos</div>`;
    }else if(cerrado){
      cuerpo = `<div class="espera">no llegó a tirar</div>`;
    }else if(puedoTirar(ladoDato) && (cfgEscuchar.tirar || (hooks() && hooks().soy && hooks().soy(ladoDato)))){
      const etiqueta = lado === 'pdg' ? '🎲 Pagar y tirar PdG' : '🎲 Tirar Evasión';
      cuerpo = `<button type="button" data-tirar="${lado}">${etiqueta}</button>${lado === 'pdg' ? '<div class="det">descuenta los No2 del ataque</div>' : ''}`;
    }else if(soyGM() || ladoDato.uid === yo()){
      cuerpo = `<div class="espera">esperando que ${quien} tire…</div>
        <div class="duelo-man"><input type="number" min="1" data-manual="${lado}" placeholder="${nombreLado}" value="${_esc(manual[lado] || '')}"><button type="button" class="sec" data-tirarpor="${lado}">🎲 Tirar a mano</button></div>
        <div class="det">${soyGM() ? 'como GM, tirás por él' : 'tirás vos'}: escribí el valor de ${nombreLado} y se tira con dados</div>`;
    }else{
      cuerpo = `<div class="espera">esperando que ${quien} tire…</div>`;
    }
    return `<div class="duelo-tiro"><div class="que">${nombreLado} · ${quien}</div>${cuerpo}</div>`;
  }

  function dibujar(){
    const d = actual && actual.dato;
    const f = document.getElementById('duelo-fondo');
    if(!d || !f) return;
    f.querySelectorAll('[data-manual]').forEach(i => { manual[i.dataset.manual] = i.value; });   // conservar lo tipeado por el GM
    const nombreAtaque = NOMBRE_ATAQUE[d.ataque.tipo] || 'Ataque';
    const dif = num(d.dif);
    const esNuevo = !!(d.veredicto || d.estado === 'empate') && !revelado[d.id];   // el veredicto se anima una sola vez por pestaña
    let veredicto = '';
    const detalleContacto = d.pdg && d.eva ? `PdG ${_fmt(d.pdg.total)} contra Evasión ${_fmt(d.eva.total)}` : '';
    if(d.estado === 'empate'){
      // Empate con «+» en las dos (o en ninguna): elige par o impar cualquiera de los dos; el primero que elige decide.
      const lados = [['atacante', d.atacante], ['defensor', d.defensor]].filter(([, l]) => soyGM() || l.uid === yo());
      veredicto = `<div class="duelo-veredicto empate${esNuevo ? ' nuevo' : ''}"><div class="grande">⚖ ¡EMPATE!</div><div class="chico">${detalleContacto} · las dos llevan «+» fijo (o ninguna): se resuelve con par o impar</div>
        ${lados.length ? lados.map(([q, l]) => `<div class="duelo-par"><span>${_esc(l.nombre)} (${q}) elige:</span><button type="button" data-par="${q}:par">Par</button><button type="button" data-par="${q}:impar">Impar</button></div>`).join('') : '<div class="chico">esperando que uno de los dos elija par o impar…</div>'}
        <div class="chico">el primero que elige decide: se tira un dado y gana el que acierta</div></div>`;
      revelado[d.id] = true;
    }else if(d.veredicto){
      const nuevo = esNuevo ? ' nuevo' : '';
      let como = '', motivo = '';
      if(d.desempate === 'mas1'){ como = ' · empate'; motivo = `Se resolvió el empate: gana ${d.veredicto === 'pego' ? _esc(d.atacante.nombre) : _esc(d.defensor.nombre)} porque la tirada del otro llevaba un «+» fijo y ella no.`; }
      else if(d.desempate === 'moneda' && d.moneda){
        const gan = d.moneda.gana === 'atacante' ? d.atacante.nombre : d.defensor.nombre;
        como = ' · empate';
        motivo = `Se resolvió el empate con par o impar: ${_esc(d.moneda.quien === 'atacante' ? d.atacante.nombre : d.defensor.nombre)} eligió ${d.moneda.eleccion}, salió ${d.moneda.resultado} (${d.moneda.resultado % 2 === 0 ? 'par' : 'impar'}) → gana ${_esc(gan)}.`;
      }
      veredicto = d.veredicto === 'pego'
        ? `<div class="duelo-veredicto pego${nuevo}"><div class="grande">⚔ ¡PEGÓ!</div><div class="chico">${detalleContacto}${dif !== 0 ? ' · le gana por ' + _fmt(dif) : ''}${como}</div>${motivo ? `<div class="duelo-motivo">⚖ ${motivo}</div>` : ''}</div>`
        : `<div class="duelo-veredicto fallo${nuevo}"><div class="grande">🛡 FALLÓ</div><div class="chico">${detalleContacto}${dif !== 0 ? ' · esquivó por ' + _fmt(Math.abs(dif)) : ''}${como}</div>${motivo ? `<div class="duelo-motivo">⚖ ${motivo}</div>` : ''}</div>`;
      revelado[d.id] = true;
    }else if(d.estado === 'cancelado'){
      veredicto = '<div class="duelo-veredicto fallo"><div class="chico">Duelo cancelado</div></div>';
    }
    const puedoCancelar = (d.estado === 'esperando' || d.estado === 'empate') && (soyGM() || d.creadoPor === yo());
    const min = f.classList.contains('min');
    f.innerHTML = `<div class="duelo-caja">
      <div class="duelo-cab"><span>⚔ ${_esc(nombreAtaque)}</span><div class="bt"><button type="button" data-min title="Minimizar (queda el botón «Ver duelo»)">—</button><button type="button" data-x title="Cerrar">✕</button></div></div>
      <div class="duelo-cuerpo">
        <div class="duelo-paso"><h4><span class="n">1</span>Declaración</h4>
          <div class="duelo-vs">
            <div class="duelo-lado atq"><div class="rol">Ataca</div><div class="nom">${_esc(d.atacante.nombre)}</div><div class="sub">${d.ataque.armaNombre ? 'con ' + _esc(d.ataque.armaNombre) : 'sin arma'} · Tipo ${_fmt(num(d.ataque.tipoDado))}</div></div>
            <div class="vs">VS</div>
            <div class="duelo-lado def"><div class="rol">Defiende</div><div class="nom">${_esc(d.defensor.nombre)}</div><div class="sub">${d.defensor.tipo === 'creep' ? 'creep' : 'personaje'}</div></div>
          </div></div>
        <div class="duelo-paso"><h4><span class="n">2</span>Contacto: PdG contra Evasión</h4>
          <div class="duelo-tiros">${tiroHtml(d, 'pdg', esNuevo)}${tiroHtml(d, 'eva', esNuevo)}</div>
        </div>
        ${veredicto}
        <div class="duelo-pie">
          ${puedoCancelar ? '<button type="button" class="sec" data-cancelarduelo>Cancelar duelo</button>' : ''}
          <button type="button" class="sec" data-min2>Minimizar</button>
          <button type="button" class="sec" data-x2>Cerrar</button>
        </div>
        ${d.veredicto ? '<div class="duelo-nota">Próximas etapas: Parry y Bloqueo, crítico, daño y defensa, efectos del golpe.</div>' : ''}
      </div></div>`;
    if(min) f.classList.add('min');
    f.querySelector('[data-min]').onclick = minimizar;
    f.querySelector('[data-min2]').onclick = minimizar;
    f.querySelector('[data-x]').onclick = cerrar;
    f.querySelector('[data-x2]').onclick = cerrar;
    const bc = f.querySelector('[data-cancelarduelo]');
    if(bc) bc.onclick = () => col().doc(d.id).update({estado: 'cancelado'}).catch(err => console.error(err));
    f.querySelectorAll('[data-par]').forEach(b => b.onclick = () => { const [q, e] = b.dataset.par.split(':'); f.querySelectorAll('[data-par]').forEach(x => x.disabled = true); elegirParidad(d.id, q, e).catch(err => { console.error(err); _toast('No se pudo tirar el desempate'); }); });
    f.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => tirarPropio(d, b.dataset.tirar, b));
    f.querySelectorAll('[data-tirarpor]').forEach(b => b.onclick = () => tirarPorAusente(d, b.dataset.tirarpor));
  }

  /* ---------- las tiradas ---------- */
  function tirarPropio(d, lado, boton){
    if(boton){ boton.disabled = true; boton.textContent = 'Tirando…'; }
    if(cfgEscuchar.tirar){
      cfgEscuchar.tirar(d, lado);   // el mapa se lo pide al iframe de la ficha / de las Acciones del creep
      setTimeout(() => { if(actual && actual.dato && !actual.dato[lado]) dibujar(); }, 8000);
      return;
    }
    const h = hooks();
    if(!h) return;
    esperaTiro = {id: d.id, lado};
    try{
      if(lado === 'pdg') h.atacar(d); else h.evadir(d);
    }catch(err){
      console.error('Duelo: error al tirar', err);
      esperaTiro = null;
      _toast('No se pudo tirar: ' + (err.message || err));
    }
    setTimeout(() => { if(actual && actual.dato && !actual.dato[lado]) dibujar(); }, 1500);   // si no llegó a tirar (sin No2, canceló), el botón vuelve
  }

  window.addEventListener('tirada-registrada', e => {
    if(!esperaTiro) return;
    const det = e.detail || {}, r = det.r || {};
    const origen = String(det.origen || '');
    const lado = esperaTiro.lado;
    if(lado === 'pdg' && !/pdg/i.test(origen)) return;
    if(lado === 'eva' && !/evasi/i.test(origen)) return;
    const id = esperaTiro.id;
    esperaTiro = null;
    guardarTiro(id, lado, r).catch(err => { console.error('Duelo: no se pudo guardar la tirada', err); _toast('No se pudo anotar la tirada en el duelo'); })
      .then(() => avisarMapaUi());
  });

  // Adentro de un iframe del mapa: le cuenta si hay algún cartelito abierto (Nitros, sobrepeso…) que el jugador tiene que ver, o si ya puede esconderse.
  function avisarMapaUi(){
    if(!enIframe()) return;
    const abierto = !!document.querySelector('.scrim.open, #ep-fondo, #ae-fondo');
    window.parent.postMessage({tipo: abierto ? 'duelo-ui-visible' : 'botonera-cerrada'}, location.origin);
  }

  window.addEventListener('message', async e => {
    if(e.origin !== location.origin || !e.data) return;
    const m = e.data;
    if(m.tipo === 'duelo-suelto' && pendienteSuelto){   // el mapa: «Sin objetivo · tirada suelta»
      const f = pendienteSuelto; pendienteSuelto = null;
      f();
      return;
    }
    if(m.tipo === 'duelo-cancelado'){ pendienteSuelto = null; return; }
    if(m.tipo !== 'duelo-tirar' || !disponible()) return;
    // El mapa pide tirar el PdG o la Evasión de este personaje/creep para un duelo: se tira acá y se anota solo.
    const h = hooks();
    if(!h) return;
    try{
      const doc = await col().doc(m.id).get();
      if(!doc.exists) return;
      const d = {id: m.id, ...doc.data()};
      const ladoDato = m.lado === 'pdg' ? d.atacante : d.defensor;
      if(!h.soy || !h.soy(ladoDato) || d[m.lado] || d.estado !== 'esperando') return;
      document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));   // sin la Botonera abierta debajo
      esperaTiro = {id: m.id, lado: m.lado};
      if(m.lado === 'pdg') h.atacar(d); else h.evadir(d);
      setTimeout(avisarMapaUi, 350);
    }catch(err){
      console.error('Duelo: no se pudo tirar a pedido del mapa', err);
      esperaTiro = null;
      avisarMapaUi();
    }
  });

  function tirarPorAusente(d, lado){
    const input = document.querySelector(`[data-manual="${lado}"]`);
    const valor = Math.round(num(input ? input.value : manual[lado]));
    const f = typeof formulaParaValor === 'function' ? formulaParaValor(valor) : null;
    if(!f){ _toast('Escribí el valor del stat (un número mayor que 0)'); return; }
    const rolls = f.combo.map(x => 1 + Math.floor(Math.random() * x));
    const total = rolls.reduce((a, b) => a + b, 0) + f.mod;
    const ladoDato = lado === 'pdg' ? d.atacante : d.defensor;
    const r = {formula: f.formula, rolls, mod: f.mod, total};
    if(typeof mesaPublicar === 'function'){ try{ mesaPublicar(`${ladoDato.nombre} · ${lado === 'pdg' ? 'PdG' : 'Evasión'} (a mano)`, r); }catch(err){} }
    guardarTiro(d.id, lado, r).catch(err => { console.error(err); _toast('No se pudo anotar la tirada en el duelo'); });
  }

  // Cuando un empate se resuelve, se avisa en la Mesa para que quede escrito por qué (línea de sistema 🔔, como los avisos del mapa).
  async function anunciarEmpate(texto){
    if(!texto) return;
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: yo(), jugador: fbMiembro.nombre, quien: '', origen: texto.slice(0, 200), formula: '', rolls: [], mod: 0, total: 0,
        desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('Duelo: no se pudo anunciar el empate en la Mesa', err); }
  }

  // Anota la tirada de un lado; si ya está la del otro, calcula el veredicto en la misma transacción.
  async function guardarTiro(id, lado, r){
    const tiro = {total: Math.round(num(r.total)), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(num), mod: num(r.mod)};
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const d = doc.data();
      if(d.estado !== 'esperando' || d[lado]) return;   // ya resuelto o ya tiró
      const cambios = {[lado]: tiro};
      const pdg = lado === 'pdg' ? tiro : d.pdg, eva = lado === 'eva' ? tiro : d.eva;
      if(pdg && eva){
        const dif = pdg.total - eva.total;
        cambios.dif = dif;
        if(dif !== 0){
          cambios.veredicto = dif > 0 ? 'pego' : 'fallo';
          cambios.estado = 'resuelto';
        }else{
          // Empate: si solo una de las dos lleva un «+» fijo, gana la que NO lo lleva; si las dos (o ninguna), par o impar.
          const masA = num(pdg.mod) > 0, masD = num(eva.mod) > 0;
          if(masA !== masD){
            cambios.veredicto = masA ? 'fallo' : 'pego';
            cambios.desempate = 'mas1';
            cambios.estado = 'resuelto';
            anuncio = `⚖ Empate ${d.atacante.nombre} contra ${d.defensor.nombre} (${pdg.total} a ${eva.total}): gana ${masA ? d.defensor.nombre : d.atacante.nombre} porque la tirada de ${masA ? d.atacante.nombre : d.defensor.nombre} llevaba un «+» fijo y la otra no`;
          }else{
            cambios.desempate = 'moneda';
            cambios.estado = 'empate';
          }
        }
      }
      tx.update(ref, cambios);
    });
    anunciarEmpate(anuncio);
  }

  // Empate con «+» en las dos (o en ninguna): el primero que elige par o impar decide; se tira un dado y gana el que acierta.
  async function elegirParidad(id, quien, eleccion){
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const d = doc.data();
      if(d.estado !== 'empate' || d.moneda) return;   // ya lo eligió el otro
      const resultado = 1 + Math.floor(Math.random() * 6);
      const par = resultado % 2 === 0;
      const acierta = (eleccion === 'par') === par;
      const gana = acierta ? quien : (quien === 'atacante' ? 'defensor' : 'atacante');
      tx.update(ref, {moneda: {quien, eleccion, resultado, gana}, veredicto: gana === 'atacante' ? 'pego' : 'fallo', estado: 'resuelto'});
      const nom = q => (q === 'atacante' ? d.atacante : d.defensor).nombre;
      anuncio = `⚖ Empate ${d.atacante.nombre} contra ${d.defensor.nombre} (${d.pdg.total} a ${d.eva.total}, las dos con «+» fijo o ninguna): ${nom(quien)} eligió ${eleccion}, salió ${resultado} (${par ? 'par' : 'impar'}) → gana ${nom(gana)}`;
    });
    anunciarEmpate(anuncio);
  }

  /* ---------- botones «Ver duelo» y apertura automática ---------- */
  function contenedorAvisos(){
    inyectarCss();
    let c = document.getElementById('duelo-avisos');
    if(!c){ c = document.createElement('div'); c.id = 'duelo-avisos'; document.body.appendChild(c); }
    return c;
  }

  function dibujarChips(){
    const mostrar = new Map();
    const ahora = Date.now();
    listaDuelos.forEach(d => {
      if(descartados.has(d.id)) return;
      const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : ahora;
      if((d.estado === 'esperando' || d.estado === 'empate') && ahora - t > VIGENCIA_MS) return;
      if(d.estado === 'resuelto' && ahora - t > RESUELTO_VISIBLE_MS) return;
      if(d.estado === 'cancelado') return;
      const abiertoAhora = actual && actual.id === d.id && !actual.min;
      if(abiertoAhora) return;
      mostrar.set(d.id, d);
    });
    // Un duelo minimizado sigue con su botón aunque el snapshot todavía no lo traiga.
    if(actual && actual.min && actual.dato && !mostrar.has(actual.id)) mostrar.set(actual.id, actual.dato);
    [...chips.keys()].forEach(id => { if(!mostrar.has(id)){ chips.get(id).remove(); chips.delete(id); } });
    mostrar.forEach((d, id) => {
      const txt = d.estado === 'resuelto'
        ? `${d.veredicto === 'pego' ? '⚔ Pegó' : '🛡 Falló'}: ${d.atacante.nombre} → ${d.defensor.nombre} · ver`
        : d.estado === 'empate' ? `⚖ Empate: ${d.atacante.nombre} → ${d.defensor.nombre} · elegir par o impar`
        : `⚔ Ver duelo: ${d.atacante.nombre} → ${d.defensor.nombre}`;
      let el = chips.get(id);
      if(!el){
        el = document.createElement('button');
        el.type = 'button';
        el.onclick = () => abrir(id);
        contenedorAvisos().appendChild(el);
        chips.set(id, el);
      }
      el.className = 'duelo-chip' + (d.estado === 'resuelto' ? ' res' : '');
      el.textContent = txt;
    });
  }

  // cfg.tirar(duelo, lado) (opcional, el mapa): cómo pedir la tirada al iframe de la ficha o de las Acciones.
  function escuchar(cfg){
    if(escuchando || !disponible()) return;
    cfgEscuchar = cfg || {};
    escuchando = col().where('estado', 'in', ['esperando', 'empate', 'resuelto']).onSnapshot(snap => {
      listaDuelos = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      const ahora = Date.now();
      // Un duelo nuevo se abre solo para todos (los que están conectados), salvo que ya haya otro abierto (entonces queda el botón).
      listaDuelos.forEach(d => {
        if(d.estado !== 'esperando' || descartados.has(d.id) || autoAbiertos.has(d.id)) return;
        const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : ahora;
        if(ahora - t > AUTOABRIR_MS) return;
        autoAbiertos.add(d.id);
        if(!actual) abrir(d.id);
      });
      dibujarChips();
    }, err => console.error('Duelo: error escuchando los duelos', err));
    limpiarViejos();
  }

  // El GM borra los duelos de más de un día (como el historial de la Mesa).
  async function limpiarViejos(){
    if(!soyGM()) return;
    try{
      const corte = firebase.firestore.Timestamp.fromMillis(Date.now() - 24 * 3600 * 1000);
      const snap = await col().where('creado', '<', corte).limit(30).get();
      await Promise.all(snap.docs.map(d => d.ref.delete()));
    }catch(e){ /* sin permiso o sin reglas nuevas: no pasa nada */ }
  }

  return {disponible, elegirObjetivo, crear, abrir, cerrar, minimizar, escuchar, elegirParidad};
})();
