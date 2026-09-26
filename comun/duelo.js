/* comun/duelo.js — Ataque paso a paso en vivo entre atacante y defensor (etapa 1: contacto, 1 contra 1).
   Diseño: docs/ataque-paso-a-paso.md. Idea del dueño, 2026-09-26.

   Un duelo es un documento de Firestore (campanas/<partida>/duelos/<id>) que los dos lados ven y escriben en vivo:
     {estado: 'esperando'|'resuelto'|'cancelado', atacante:{ref,tipo,nombre,uid,tokenId}, defensor:{…}, ataque:{tipo,armaId,armaNombre,tipoDado},
      pdg:{total,formula,rolls,mod}|null, eva:{…}|null, veredicto:'pego'|'fallo'|null, dif, creado, creadoPor}
   Cada lado tira con SU propio código (el de la ficha o el de gm-tools): la página define window.DUELO_HOOKS = {
     soy(lado) → true si ese lado {ref,tipo} es el personaje/creep que maneja esta página,
     atacar(duelo) → hace el ataque de siempre (paga No2 y tira PdG),
     evadir(duelo) → tira la Evasión de siempre }.
   El resultado se recoge del evento 'tirada-registrada' que disparan registrarTirada() de la ficha y de gm-tools (detail: {origen, r}).
   Sin hooks (por ejemplo el mapa) el GM puede tirar por cualquiera de los dos a mano ("tirar por él").
   Depende de sesion.js (fbDb, fbUsuario, fbMiembro, fbRutaCampana) y de las globals $, esc, num, fmt, toast de cada herramienta. */
const Duelo = (() => {
  const MAPA_PRINCIPAL = '_principal';
  const EMPATE_GANA_DEFENSOR = true;   // PLACEHOLDER: el manual no define el empate de una tirada enfrentada (preguntas-abiertas.md, P-Duelo)
  const VIGENCIA_AVISO_MS = 30 * 60 * 1000;   // un duelo sin resolver deja de avisar a los 30 minutos
  const NOMBRE_ATAQUE = {normal: 'Ataque', oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};

  let actual = null;        // {id, dato, baja} — el duelo abierto en el cuadro
  let revelado = {};        // id → true: el veredicto ya se animó en esta pestaña
  let manual = {};          // lado ('pdg'|'eva') → valor tipeado por el GM
  let banners = new Map();  // id → elemento del aviso
  let escuchando = null;

  const hooks = () => (typeof window !== 'undefined' && window.DUELO_HOOKS) || null;
  const yo = () => (typeof fbUsuario !== 'undefined' && fbUsuario ? fbUsuario.uid : '');
  const soyGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const disponible = () => !!(typeof fbDb !== 'undefined' && fbDb && typeof fbUsuario !== 'undefined' && fbUsuario && typeof fbMiembro !== 'undefined' && fbMiembro);
  const col = () => fbDb.collection(fbRutaCampana('duelos'));
  const _esc = s => (typeof esc === 'function' ? esc(s) : String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c])));
  const _fmt = n => (typeof fmt === 'function' ? fmt(n) : String(n));
  const _toast = m => { if(typeof toast === 'function') toast(m); };
  const soyLado = lado => { const h = hooks(); return !!(h && h.soy && lado && h.soy(lado)); };

  /* ---------- estilos ---------- */
  function inyectarCss(){
    if(document.getElementById('duelo-css')) return;
    const s = document.createElement('style');
    s.id = 'duelo-css';
    s.textContent = `
#duelo-fondo{position:fixed;inset:0;z-index:99000;background:rgba(6,8,14,.72);display:flex;align-items:center;justify-content:center;padding:12px;font-family:inherit}
.duelo-caja{background:#151a26;color:#e9ecf4;border:1px solid #39435c;border-radius:14px;width:min(640px,100%);max-height:96vh;overflow:auto;box-shadow:0 18px 60px rgba(0,0,0,.6)}
.duelo-cab{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #2b3347;font-weight:700;letter-spacing:.03em}
.duelo-cab button{background:none;border:0;color:#9aa4bd;font-size:20px;cursor:pointer}
.duelo-cuerpo{padding:14px 16px;display:flex;flex-direction:column;gap:14px}
.duelo-vs{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:stretch}
.duelo-lado{background:#1d2335;border:1px solid #2f3852;border-radius:10px;padding:10px 12px;min-width:0}
.duelo-lado.atq{border-color:#a5485a}.duelo-lado.def{border-color:#4a78b8}
.duelo-lado .rol{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd}
.duelo-lado .nom{font-size:17px;font-weight:700;margin-top:2px;overflow-wrap:anywhere}
.duelo-lado .sub{font-size:12px;color:#aab3ca;margin-top:2px}
.duelo-vs .vs{align-self:center;font-weight:800;color:#c9a24a;font-size:20px}
.duelo-paso{background:#1a2030;border:1px solid #2b3347;border-radius:10px;padding:10px 12px}
.duelo-paso h4{margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#9aa4bd;font-weight:600}
.duelo-paso h4 .n{display:inline-block;background:#2b3347;color:#e9ecf4;border-radius:50%;width:20px;height:20px;line-height:20px;text-align:center;margin-right:6px;font-size:11px}
.duelo-tiros{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.duelo-tiro{background:#12172a;border:1px dashed #39435c;border-radius:10px;padding:10px;text-align:center;min-height:118px;display:flex;flex-direction:column;justify-content:center;gap:6px}
.duelo-tiro .que{font-size:12px;color:#9aa4bd;text-transform:uppercase;letter-spacing:.06em}
.duelo-tiro .espera{color:#8b95b0;font-style:italic;font-size:13px}
.duelo-tiro .listo{color:#7fd08c;font-weight:700;font-size:15px}
.duelo-tiro .num{font-size:46px;font-weight:800;line-height:1}
.duelo-tiro .det{font-size:12px;color:#aab3ca}
.duelo-tiro button,.duelo-pie button,.duelo-man button{background:#2d6cdf;color:#fff;border:0;border-radius:8px;padding:9px 12px;font-size:14px;font-weight:600;cursor:pointer}
.duelo-tiro button:disabled{opacity:.5;cursor:default}
.duelo-tiro button.sec,.duelo-pie button.sec{background:#2b3347;color:#d5dbec}
.duelo-man{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}
.duelo-man input{width:64px;background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:6px;padding:6px;text-align:center}
.duelo-veredicto{border-radius:12px;padding:14px;text-align:center;font-weight:800;letter-spacing:.04em}
.duelo-veredicto .grande{font-size:38px;line-height:1.1}
.duelo-veredicto .chico{font-size:13px;font-weight:500;letter-spacing:0;margin-top:4px;opacity:.9}
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
#duelo-avisos{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:98000;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
.duelo-aviso{pointer-events:auto;background:#3b1820;color:#ffe3e7;border:2px solid #d95a6e;border-radius:12px;padding:10px 14px;display:flex;gap:12px;align-items:center;box-shadow:0 8px 30px rgba(0,0,0,.5);animation:duelo-aviso .5s ease-out both;font-size:14px}
.duelo-aviso.gm{background:#1d2335;border-color:#4a78b8;color:#dbe6ff}
.duelo-aviso button{background:#d95a6e;color:#fff;border:0;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer}
.duelo-aviso.gm button{background:#2d6cdf}
.duelo-aviso .x{background:none;color:inherit;opacity:.7;padding:0 4px;font-size:16px}
@keyframes duelo-aviso{0%{transform:translateY(-30px) scale(.9);opacity:0}100%{transform:none;opacity:1}}
`;
    document.head.appendChild(s);
  }

  function fondo(){
    inyectarCss();
    let f = document.getElementById('duelo-fondo');
    if(!f){
      f = document.createElement('div');
      f.id = 'duelo-fondo';
      f.addEventListener('mousedown', e => { if(e.target === f) cerrar(); });
      document.body.appendChild(f);
    }
    return f;
  }
  function cerrar(){
    if(actual && actual.baja) actual.baja();
    actual = null;
    manual = {};
    const f = document.getElementById('duelo-fondo');
    if(f) f.remove();
    window.dispatchEvent(new Event('ep-cerrado'));   // la Botonera/Acciones del mapa se fijan si quedó algo abierto
  }
  document.addEventListener('keydown', e => { if(e.key === 'Escape' && document.getElementById('duelo-fondo')){ e.stopPropagation(); cerrar(); } }, true);

  /* ---------- elegir el objetivo (lista de los tokens del mapa que se ve) ---------- */
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

  // cfg = {yo:{ref,tipo,nombre}, ataque:{tipo,armaId,armaNombre,tipoDado}, suelto: fn()} — `suelto` hace el ataque de siempre, sin objetivo.
  async function elegirObjetivo(cfg){
    if(!disponible()){ if(cfg.suelto) cfg.suelto(); return; }
    const f = fondo();
    f.innerHTML = `<div class="duelo-caja"><div class="duelo-cab"><span>⚔ ¿A quién atacás?</span><button type="button" data-x>✕</button></div>
      <div class="duelo-cuerpo"><div class="duelo-nota">Cargando los tokens del mapa…</div></div></div>`;
    f.querySelector('[data-x]').onclick = cerrar;
    let lista = [];
    try{ lista = await tokensDelMapa(); }catch(err){ console.error('Duelo: no se pudieron leer los tokens', err); }
    const propio = t => t.fichaId && String(t.fichaId).split('~')[0] === String(cfg.yo.ref).split('~')[0] && t.tipo === cfg.yo.tipo;
    const objetivos = lista.filter(t => !propio(t)).sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
    const cuerpo = f.querySelector('.duelo-cuerpo');
    cuerpo.innerHTML = `<div class="duelo-nota">${_esc(NOMBRE_ATAQUE[cfg.ataque.tipo] || 'Ataque')}${cfg.ataque.armaNombre ? ' con ' + _esc(cfg.ataque.armaNombre) : ''}. Elegí el token al que va dirigido:</div>
      <div class="duelo-lista">${objetivos.length ? objetivos.map(t => `<button type="button" data-tok="${_esc(t.id)}"><span>${_esc(t.nombre)}</span><span class="tag">${t.tipo === 'creep' ? 'creep' : 'personaje'}</span></button>`).join('') : '<div class="duelo-nota">No hay otros tokens en el mapa.</div>'}</div>
      <div class="duelo-pie">${cfg.suelto ? '<button type="button" class="sec" data-suelto>Sin objetivo · tirada suelta</button>' : ''}<button type="button" class="sec" data-cancelar>Cancelar</button></div>`;
    cuerpo.querySelector('[data-cancelar]').onclick = cerrar;
    const bs = cuerpo.querySelector('[data-suelto]');
    if(bs) bs.onclick = () => { cerrar(); cfg.suelto(); };
    cuerpo.querySelector('.duelo-lista').addEventListener('click', async e => {
      const b = e.target.closest('[data-tok]');
      if(!b) return;
      const t = objetivos.find(x => x.id === b.dataset.tok);
      if(!t) return;
      b.disabled = true;
      try{
        const id = await crear(cfg, t, lista);
        abrir(id);
      }catch(err){
        console.error('Duelo: no se pudo crear', err);
        _toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + (err.message || err));
        b.disabled = false;
      }
    });
  }

  async function crear(cfg, tokDef, lista){
    const miToken = (lista || []).find(t => t.fichaId && String(t.fichaId).split('~')[0] === String(cfg.yo.ref).split('~')[0] && t.tipo === cfg.yo.tipo);
    const ref = await col().add({
      estado: 'esperando',
      atacante: {ref: String(cfg.yo.ref), tipo: cfg.yo.tipo, nombre: String(cfg.yo.nombre || '').slice(0, 40), uid: yo(), tokenId: miToken ? miToken.id : ''},
      defensor: {ref: String(tokDef.fichaId || ''), tipo: tokDef.tipo, nombre: String(tokDef.nombre || '').slice(0, 40), uid: String(tokDef.duenoUid || ''), tokenId: tokDef.id},
      ataque: {tipo: cfg.ataque.tipo, armaId: String(cfg.ataque.armaId || ''), armaNombre: String(cfg.ataque.armaNombre || '').slice(0, 60), tipoDado: num(cfg.ataque.tipoDado)},
      pdg: null, eva: null, veredicto: null, dif: 0,
      creadoPor: yo(),
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  /* ---------- el cuadro del duelo ---------- */
  function abrir(id){
    if(!disponible()) return;
    if(actual && actual.id === id) return;
    cerrar();
    const f = fondo();
    f.innerHTML = '<div class="duelo-caja"><div class="duelo-cab"><span>⚔ Duelo</span><button type="button" data-x>✕</button></div><div class="duelo-cuerpo"><div class="duelo-nota">Abriendo el duelo…</div></div></div>';
    f.querySelector('[data-x]').onclick = cerrar;
    actual = {id, dato: null, baja: null};
    actual.baja = col().doc(id).onSnapshot(doc => {
      if(!doc.exists){ _toast('Ese duelo ya no existe'); cerrar(); return; }
      if(!actual || actual.id !== id) return;
      actual.dato = {id, ...doc.data()};
      dibujar();
    }, err => { console.error('Duelo: error escuchando', err); _toast('No se pudo seguir el duelo'); });
  }

  function tiroHtml(d, lado, esNuevo){
    const nombreLado = lado === 'pdg' ? 'PdG' : 'Evasión';
    const ladoDato = lado === 'pdg' ? d.atacante : d.defensor;
    const tiro = d[lado];
    const otro = d[lado === 'pdg' ? 'eva' : 'pdg'];
    const cerrado = d.estado !== 'esperando';
    const quien = _esc(ladoDato.nombre);
    let cuerpo;
    if(d.veredicto && tiro){
      return `<div class="duelo-tiro${esNuevo ? ' nuevo' : ''}"><div class="que">${nombreLado} · ${quien}</div><div class="num">${_fmt(tiro.total)}</div><div class="det">${_esc(tiro.formula || '')}${tiro.rolls && tiro.rolls.length ? ' → ' + tiro.rolls.join(' + ') : ''}${num(tiro.mod) ? ' ' + (num(tiro.mod) > 0 ? '+' : '−') + ' ' + Math.abs(num(tiro.mod)) : ''}</div></div>`;
    }
    if(tiro){
      cuerpo = `<div class="listo">✔ Ya tiró</div><div class="det">el resultado se muestra cuando tiren los dos</div>`;
    }else if(cerrado){
      cuerpo = `<div class="espera">no llegó a tirar</div>`;
    }else{
      const puedo = soyLado(ladoDato);
      const h = hooks();
      if(puedo && h){
        const etiqueta = lado === 'pdg' ? '🎲 Pagar y tirar PdG' : '🎲 Tirar Evasión';
        cuerpo = `<button type="button" data-tirar="${lado}">${etiqueta}</button>${lado === 'pdg' ? '<div class="det">descuenta los No2 del ataque</div>' : ''}`;
      }else if(soyGM() || ladoDato.uid === yo()){
        cuerpo = `<div class="espera">esperando que ${quien} tire…</div>
          <div class="duelo-man"><input type="number" min="1" data-manual="${lado}" placeholder="${nombreLado}" value="${_esc(manual[lado] || '')}"><button type="button" class="sec" data-tirarpor="${lado}">🎲 Tirar a mano</button></div>
          <div class="det">${soyGM() ? 'como GM, tirás por él' : 'tirás vos'}: escribí el valor de ${nombreLado} y se tira con dados</div>`;
      }else{
        cuerpo = `<div class="espera">esperando que ${quien} tire…</div>`;
      }
    }
    return `<div class="duelo-tiro"><div class="que">${nombreLado} · ${quien}</div>${cuerpo}</div>`;
  }

  function dibujar(){
    const d = actual && actual.dato;
    const f = document.getElementById('duelo-fondo');
    if(!d || !f) return;
    // Conservar lo tipeado por el GM mientras se redibuja.
    f.querySelectorAll('[data-manual]').forEach(i => { manual[i.dataset.manual] = i.value; });
    const nombreAtaque = NOMBRE_ATAQUE[d.ataque.tipo] || 'Ataque';
    const dif = num(d.dif);
    const esNuevo = !!d.veredicto && !revelado[d.id];   // el veredicto se anima una sola vez por pestaña
    let veredicto = '';
    if(d.veredicto){
      const nuevo = esNuevo ? ' nuevo' : '';
      veredicto = d.veredicto === 'pego'
        ? `<div class="duelo-veredicto pego${nuevo}"><div class="grande">⚔ ¡PEGÓ!</div><div class="chico">PdG ${_fmt(d.pdg.total)} contra Evasión ${_fmt(d.eva.total)} · le gana por ${_fmt(dif)}</div></div>`
        : `<div class="duelo-veredicto fallo${nuevo}"><div class="grande">🛡 FALLÓ</div><div class="chico">PdG ${_fmt(d.pdg.total)} contra Evasión ${_fmt(d.eva.total)} · ${dif === 0 && EMPATE_GANA_DEFENSOR ? 'empate: gana el que defiende' : 'esquivó por ' + _fmt(Math.abs(dif))}</div></div>`;
      revelado[d.id] = true;
    }else if(d.estado === 'cancelado'){
      veredicto = '<div class="duelo-veredicto fallo"><div class="chico">Duelo cancelado</div></div>';
    }
    const puedoCancelar = d.estado === 'esperando' && (soyGM() || d.creadoPor === yo());
    f.innerHTML = `<div class="duelo-caja">
      <div class="duelo-cab"><span>⚔ ${_esc(nombreAtaque)}</span><button type="button" data-x>✕</button></div>
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
          <button type="button" class="sec" data-x2>Cerrar</button>
        </div>
        ${d.veredicto ? '<div class="duelo-nota">Próximas etapas: Parry y Bloqueo, crítico, daño y defensa, efectos del golpe.</div>' : ''}
      </div></div>`;
    f.querySelector('[data-x]').onclick = cerrar;
    f.querySelector('[data-x2]').onclick = cerrar;
    const bc = f.querySelector('[data-cancelarduelo]');
    if(bc) bc.onclick = () => col().doc(d.id).update({estado: 'cancelado'}).catch(err => console.error(err));
    f.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => tirarPropio(d, b.dataset.tirar, b));
    f.querySelectorAll('[data-tirarpor]').forEach(b => b.onclick = () => tirarPorAusente(d, b.dataset.tirarpor));
  }

  /* ---------- las tiradas ---------- */
  let esperaTiro = null;   // {duelo id, lado} — a la espera de que la página registre la tirada
  function tirarPropio(d, lado, boton){
    const h = hooks();
    if(!h) return;
    esperaTiro = {id: d.id, lado};
    if(boton){ boton.disabled = true; boton.textContent = 'Tirando…'; }
    try{
      if(lado === 'pdg') h.atacar(d); else h.evadir(d);
    }catch(err){
      console.error('Duelo: error al tirar', err);
      esperaTiro = null;
      _toast('No se pudo tirar: ' + (err.message || err));
    }
    // Si no llegó a tirar (por ejemplo, sin No2 y se canceló), el botón vuelve.
    setTimeout(() => { if(esperaTiro && esperaTiro.id === d.id && esperaTiro.lado === lado && actual && actual.dato && !actual.dato[lado]) dibujar(); }, 1500);
  }

  window.addEventListener('tirada-registrada', e => {
    if(!esperaTiro || !actual || actual.id !== esperaTiro.id || !actual.dato) return;
    const det = e.detail || {}, r = det.r || {};
    const origen = String(det.origen || '');
    const lado = esperaTiro.lado;
    if(lado === 'pdg' && !/pdg/i.test(origen)) return;
    if(lado === 'eva' && !/evasi/i.test(origen)) return;
    esperaTiro = null;
    guardarTiro(actual.id, lado, r).catch(err => { console.error('Duelo: no se pudo guardar la tirada', err); _toast('No se pudo anotar la tirada en el duelo'); });
  });

  function tirarPorAusente(d, lado){
    const v = Math.round(num(manual[lado]));
    const input = document.querySelector(`[data-manual="${lado}"]`);
    const valor = input ? Math.round(num(input.value)) : v;
    const f = typeof formulaParaValor === 'function' ? formulaParaValor(valor) : null;
    if(!f){ _toast('Escribí el valor del stat (un número mayor que 0)'); return; }
    const rolls = f.combo.map(x => 1 + Math.floor(Math.random() * x));
    const total = rolls.reduce((a, b) => a + b, 0) + f.mod;
    const ladoDato = lado === 'pdg' ? d.atacante : d.defensor;
    const r = {formula: f.formula, rolls, mod: f.mod, total};
    if(typeof mesaPublicar === 'function'){ try{ mesaPublicar(`${ladoDato.nombre} · ${lado === 'pdg' ? 'PdG' : 'Evasión'} (tira el GM)`, r); }catch(e){} }
    guardarTiro(d.id, lado, r).catch(err => { console.error(err); _toast('No se pudo anotar la tirada en el duelo'); });
  }

  // Anota la tirada de un lado; si ya está la del otro, calcula el veredicto en la misma transacción.
  async function guardarTiro(id, lado, r){
    const tiro = {total: Math.round(num(r.total)), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(num), mod: num(r.mod)};
    const ref = col().doc(id);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const d = doc.data();
      if(d.estado !== 'esperando' || d[lado]) return;   // ya resuelto o ya tiró
      const cambios = {[lado]: tiro};
      const pdg = lado === 'pdg' ? tiro : d.pdg, eva = lado === 'eva' ? tiro : d.eva;
      if(pdg && eva){
        const dif = pdg.total - eva.total;
        cambios.dif = dif;
        cambios.veredicto = (dif > 0 || (dif === 0 && !EMPATE_GANA_DEFENSOR)) ? 'pego' : 'fallo';
        cambios.estado = 'resuelto';
      }
      tx.update(ref, cambios);
    });
  }

  /* ---------- aviso "te están atacando" ---------- */
  function contenedorAvisos(){
    inyectarCss();
    let c = document.getElementById('duelo-avisos');
    if(!c){ c = document.createElement('div'); c.id = 'duelo-avisos'; document.body.appendChild(c); }
    return c;
  }
  function quitarAviso(id){
    const el = banners.get(id);
    if(el){ el.remove(); banners.delete(id); }
  }

  // cfg.abrir(duelo) (opcional): qué hacer al tocar "Abrir" (el mapa abre la Botonera del defensor); por defecto se abre el cuadro acá.
  function escuchar(cfg){
    if(escuchando || !disponible()) return;
    cfg = cfg || {};
    escuchando = col().where('estado', '==', 'esperando').onSnapshot(snap => {
      const vivos = new Set();
      snap.docs.forEach(doc => {
        const d = {id: doc.id, ...doc.data()};
        const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : Date.now();
        if(Date.now() - t > VIGENCIA_AVISO_MS) return;
        const soyDefensor = d.defensor && d.defensor.uid === yo();
        const miroComoGM = soyGM() && !soyDefensor && d.atacante.uid !== yo();
        if(!soyDefensor && !miroComoGM) return;
        if(d.eva) return;   // el defensor ya tiró: no hace falta avisarle
        vivos.add(d.id);
        if(banners.has(d.id)) return;
        const av = document.createElement('div');
        av.className = 'duelo-aviso' + (soyDefensor ? '' : ' gm');
        av.innerHTML = soyDefensor
          ? `<span>⚔ <b>${_esc(d.atacante.nombre)}</b> te ataca${d.ataque.armaNombre ? ' con ' + _esc(d.ataque.armaNombre) : ''}</span><button type="button" data-abrir>Abrir</button><button type="button" class="x" data-ignorar>✕</button>`
          : `<span>👁 Duelo: <b>${_esc(d.atacante.nombre)}</b> → <b>${_esc(d.defensor.nombre)}</b></span><button type="button" data-abrir>Ver</button><button type="button" class="x" data-ignorar>✕</button>`;
        av.querySelector('[data-abrir]').onclick = () => {
          quitarAviso(d.id);
          if(soyDefensor && cfg.abrir) cfg.abrir(d); else abrir(d.id);
        };
        av.querySelector('[data-ignorar]').onclick = () => quitarAviso(d.id);
        contenedorAvisos().appendChild(av);
        banners.set(d.id, av);
      });
      [...banners.keys()].forEach(id => { if(!vivos.has(id)) quitarAviso(id); });
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

  return {disponible, elegirObjetivo, abrir, cerrar, escuchar};
})();
