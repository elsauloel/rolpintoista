/* comun/duelo.js — Ataque paso a paso en vivo entre atacante y defensor (etapas 1 a 5: contacto, defensa, Parry, Bloqueo, crítico, daño y efectos del golpe; 1 contra 1).
   Diseño: docs/ataque-paso-a-paso.md. Idea del dueño, 2026-09-26.

   Un duelo es un documento de Firestore (campanas/<partida>/duelos/<id>) que los dos lados ven y escriben en vivo:
     {estado: 'esperando'|'empate'|'resuelto'|'cancelado', fase: 'contacto'|'bloqueo'|'critico'|'dano'|'efectos'|'fin',
      atacante:{ref,tipo,nombre,uid,tokenId}, defensor:{…}, ataque:{tipo,armaId,armaNombre,tipoDado},
      defensa: {modo:'evasion'|'parry', itemId, itemNombre, costo}|null,      ← la elige el defensor A CIEGAS (antes de ver el PdG)
      pdg, eva (la tirada de defensa: Evasión o Parry), fuerza (Fuerza del golpe), bloqueo: {total,formula,rolls,mod}|null,
      critDatos:{frecuente,potente,resistencia}|null (lo anota cada lado al tirar: el atacante su Crítico frecuente/potente, el defensor su Resistencia a crítico al Tipo),
      crit:{rango,diferencia,nivel,dados,critico,d20,mejor,mult}|null,
      dano:{crudo,formula,rolls,mod,reclamado,aplicado,mult,golpe,ignoraDef,mitad,defensa,recibido,absorbido,hpAntes,hpDespues,manual}|null,
      efectos:[{nombre,caras,exitos,dado,detalle,stacks,requiereDano,res:{dado,exito,extra}|null,omitido,motivo,aplicar:''|'pedido'|'en-curso',aplicado,nota}]|null,
      contacto:{gana,dif,desempate,moneda}|null, bloq:{…}|null, empate:{par:'contacto'|'bloqueo', moneda?}|null,
      resultado: 'pego'|'fallo'|'bloqueado'|'mitad'|null, contra: id del contraataque|null, contraDe, creado, creadoPor}
   Pasos: 1 declaración → 2 contacto (PdG contra Evasión o Parry) → si el Parry gana, 3 Bloqueo (Fuerza del golpe contra Bloqueo):
     · Evasión: gana el atacante → «pegó»; gana el defensor → «falló».
     · Parry: gana el atacante → el Parry falló y «pegó»; gana el defensor → Bloqueo: si el defensor lo gana, «bloqueado» (se anula el golpe y puede
       contraatacar); si lo pierde, «mitad» (pasa la mitad del daño, redondeada para arriba, y el objeto con el que bloqueó pierde 1 de durabilidad).
   CRÍTICO (etapa 3, `comun/critico.js`): si el golpe pega, se compara PdG − la tirada de defensa (Evasión o Parry) con el rango del crítico (Tipo del arma − Crítico
   frecuente): nivel N; la Resistencia a crítico del defensor lo baja; se tiran N − R d20 y el mejor da el multiplicador (×2 / ×3 / ×4, con Crítico potente).
   El crítico ignora la Defensa.
   DAÑO (etapa 4): si el golpe pega (o pasa la mitad), el atacante tira el daño de su arma (sin los efectos del golpe: son la etapa 5). Crítico: daño × multiplicador, derecho a
   la vida (sin restar la Defensa). Sin crítico: daño − Defensa. «Pasa la mitad»: (daño − Defensa) ÷ 2, redondeado para arriba. El HP lo baja el mapa del GM
   (`escuchar({aplicar})`: reutiliza «Recibe daño» del mapa, con Invulnerable y Escudo mágico) y el resultado queda en el duelo.
   EFECTOS DEL GOLPE (etapa 5, dueño 2026-09-26): los efectos del arma (Lisiado 25 %, Envenenar…) se tiran UNO POR UNO como momentos propios (dado a la vista y «¡FUNCIONÓ!» /
   «No funcionó»); si funcionan, un botón «Aplicar» los pone sobre el defensor (lo ejecuta el mapa del GM). Los que necesitan daño (Envenenar, Veneno severo, Sangrado, Drena
   vida, Lisiado) no entran si el golpe no hizo daño; Demora, Aturdir, Derribar, Prende fuego y Rompe armadura entran aunque no pase el daño.
   EMPATE (regla del dueño): si empatan y solo UNA de las dos tiradas lleva un «+» fijo, gana la que NO lo lleva; si las dos (o ninguna), par o impar.
   TODOS los conectados ven el cuadro (se abre solo); se puede minimizar («⚔ Ver duelo»). Cada uno solo ve los botones que le tocan.

   Cada lado tira con SU propio código (ficha o gm-tools). La página define window.DUELO_HOOKS = {
     soy(lado), atacar(duelo), opcionesDefensa(duelo) → [{modo, itemId, etiqueta, costo, motivoNo}], defender(duelo, modo, itemId),
     fuerza(duelo), bloquear(duelo), armaContra(duelo) → {armaId, armaNombre, tipoDado} }
   y `registrarTirada` dispara 'tirada-registrada' (detail: {origen, r}), de donde el duelo recoge cada resultado.
   En el MAPA no hay hooks: `escuchar({relay})` recibe la función que le manda un mensaje (`duelo-opciones`, `duelo-tirar`, `duelo-contra`) al iframe
   de la ficha (o de las Acciones del creep) del dueño; el iframe lo ejecuta y escribe el resultado él mismo en Firestore.
   Elegir el objetivo: dentro del mapa (iframe) con un clic en el token (`duelo-elegir-objetivo`); en una página suelta, de una lista.
   El GM (o el dueño) puede tirar «a mano» por quien no responde.
   Depende de sesion.js (fbDb, fbUsuario, fbMiembro, fbRutaCampana) y de las globals esc, num, fmt, toast, formulaParaValor de cada herramienta. */
const Duelo = (() => {
  const MAPA_PRINCIPAL = '_principal';
  const VIGENCIA_MS = 30 * 60 * 1000;      // un duelo sin resolver deja de avisar a los 30 minutos
  const AUTOABRIR_MS = 60 * 1000;          // el cuadro se abre solo si el duelo es de hace menos de un minuto
  const RESUELTO_VISIBLE_MS = 2 * 60 * 1000;
  const NOMBRE_ATAQUE = {normal: 'Ataque', oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  const CAMPOS_ESCRIBIBLES = ['estado', 'fase', 'defensa', 'pdg', 'eva', 'fuerza', 'bloqueo', 'contacto', 'bloq', 'resultado', 'empate', 'critDatos', 'crit', 'dano', 'efectos'];

  let actual = null;         // {id, dato, baja, min} — el duelo abierto (o minimizado) en el cuadro
  let revelado = {};         // id:clave → true: ya se animó en esta pestaña
  let manual = {};           // clave → valor tipeado a mano
  let descartados = new Set();
  let autoAbiertos = new Set();
  let chips = new Map();
  let listaDuelos = [];
  let escuchando = null;
  let cfgEscuchar = {};
  let esperaTiro = null;     // {id, campo, re, defensa}
  let pendienteSuelto = null;
  let opciones = {};         // id → opciones de defensa del defensor (las pide al iframe o a los hooks)
  let opcionesPedidas = new Set();
  let aplicando = new Set();   // duelos cuyo daño está aplicando esta pestaña (GM)

  const hooks = () => (typeof window !== 'undefined' && window.DUELO_HOOKS) || null;
  const yo = () => (typeof fbUsuario !== 'undefined' && fbUsuario ? fbUsuario.uid : '');
  const soyGM = () => !!(typeof fbMiembro !== 'undefined' && fbMiembro && fbMiembro.gm);
  const enIframe = () => window.parent !== window;
  const disponible = () => !!(typeof fbDb !== 'undefined' && fbDb && typeof fbUsuario !== 'undefined' && fbUsuario && typeof fbMiembro !== 'undefined' && fbMiembro);
  const col = () => fbDb.collection(fbRutaCampana('duelos'));
  const _esc = s => (typeof esc === 'function' ? esc(s) : String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c])));
  const _fmt = n => (typeof fmt === 'function' ? fmt(n) : String(n));
  const _toast = m => { if(typeof toast === 'function') toast(m); };
  const _num = v => (typeof num === 'function' ? num(v) : Number(v) || 0);
  const abierto = d => d.estado === 'esperando' || d.estado === 'empate';

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
.duelo-tiro button:disabled{opacity:.45;cursor:default}
.duelo-tiro button.sec,.duelo-pie button.sec{background:#2b3347;color:#d5dbec}
.duelo-opc{display:flex;flex-direction:column;gap:6px}
.duelo-opc small{display:block;font-weight:500;font-size:11px;opacity:.85}
.duelo-man{display:flex;gap:6px;align-items:center;justify-content:center;flex-wrap:wrap}
.duelo-man input,.duelo-man select{background:#0e1220;color:#fff;border:1px solid #39435c;border-radius:6px;padding:7px;text-align:center}
.duelo-man input{width:70px}
.duelo-mini{margin-top:10px;text-align:center;font-size:14px;font-weight:700;color:#cfd6ea}
.duelo-mini.g{color:#8fe3a9}.duelo-mini.r{color:#f1a1ad}
.duelo-veredicto{border-radius:14px;padding:18px;text-align:center;font-weight:900;letter-spacing:.04em}
.duelo-veredicto .grande{font-size:48px;line-height:1.1}
.duelo-veredicto .chico{font-size:14px;font-weight:500;letter-spacing:0;margin-top:6px;opacity:.92}
.duelo-veredicto.pego{background:linear-gradient(180deg,#1f5a34,#173f27);border:2px solid #4fce7c;color:#c9f5d6}
.duelo-veredicto.fallo{background:linear-gradient(180deg,#5a2530,#3d181f);border:2px solid #d95a6e;color:#fbd0d7}
.duelo-veredicto.bloqueado{background:linear-gradient(180deg,#1f3f5a,#172c3d);border:2px solid #5aa7e8;color:#cfe6fb}
.duelo-veredicto.mitad{background:linear-gradient(180deg,#5a4a1f,#3d3317);border:2px solid #d9b45a;color:#f8ecc6}
.duelo-veredicto.empate{background:linear-gradient(180deg,#5a4a1f,#3d3317);border:2px solid #d9b45a;color:#f8ecc6}
.duelo-ef{background:#12172a;border:1px solid #2f3852;border-radius:10px;padding:10px 12px;margin-bottom:8px}
.duelo-ef-top{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:16px}
.duelo-ef-prob{font-size:12px;color:#ffd25a;border:1px solid #ffd25a;border-radius:99px;padding:1px 10px}
.duelo-ef button{margin-top:8px;background:#2d6cdf;color:#fff;border:0;border-radius:10px;padding:10px 14px;font-size:15px;font-weight:700;cursor:pointer}
.duelo-ef button:disabled{opacity:.5}
.duelo-ef-res{margin-top:8px;padding:10px 12px;border-radius:10px;font-weight:900;font-size:22px}
.duelo-ef-res span{font-size:13px;font-weight:500}
.duelo-ef-res.ok{background:rgba(79,206,124,.16);color:#8fe3a9;border:1px solid #4fce7c}
.duelo-ef-res.no{background:rgba(154,134,126,.14);color:#9aa4bd;border:1px solid #39435c;text-decoration:none}
.duelo-ef-res.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
.duelo-danobox{margin-top:10px;text-align:center;border-radius:12px;padding:14px;background:rgba(0,0,0,.25);border:1px solid #39435c}
.duelo-danobox.crit{border-color:#ff5a5a;background:radial-gradient(circle at 50% 30%,rgba(120,20,20,.55),rgba(40,8,8,.6))}
.duelo-danonum{font-size:96px;font-weight:900;line-height:1;animation:duelo-num .6s ease-out both}
.duelo-danonum.rojo{color:#ff4d4d;text-shadow:0 0 24px rgba(255,60,60,.7)}
.duelo-danonum.inv{font-size:40px;color:#9ad0ff}
.duelo-danosub{font-size:14px;color:#cfd6ea;margin-top:4px}
.duelo-danosub.rojo{font-size:26px;font-weight:900;letter-spacing:.12em;color:#ff4d4d}
.duelo-tabla{width:100%;border-collapse:collapse;margin:8px 0 0;font-size:14px}
.duelo-tabla th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9aa4bd;text-align:left;padding:4px 8px}
.duelo-tabla td{padding:6px 8px;border-top:1px solid #2b3347}
.duelo-tabla tr.mod td{color:#ffd25a}
.duelo-tabla tr.gano td{background:rgba(255,210,90,.18);font-weight:800;color:#fff3c9}
.duelo-veredicto.critico{background:radial-gradient(circle at 50% 30%,#8a5a12,#4a2a08 70%);border:3px solid #ffd25a;color:#fff3c9;box-shadow:0 0 40px rgba(255,190,60,.55),inset 0 0 30px rgba(255,210,90,.25);animation:duelo-brillo 1.4s ease-in-out infinite alternate}
.duelo-veredicto.critico .grande{font-size:64px;letter-spacing:.06em;text-shadow:0 0 18px #ffb400,0 3px 0 #7a4a00}
.duelo-veredicto.critico .mult{font-size:34px;font-weight:900;color:#ffd25a;margin-top:2px}
.duelo-veredicto.critico .chispas{font-size:26px}
.duelo-veredicto.critico.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both,duelo-brillo 1.4s ease-in-out .55s infinite alternate}
@keyframes duelo-brillo{0%{box-shadow:0 0 22px rgba(255,190,60,.35),inset 0 0 20px rgba(255,210,90,.15)}100%{box-shadow:0 0 60px rgba(255,190,60,.8),inset 0 0 40px rgba(255,210,90,.35)}}
.duelo-veredicto.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
.duelo-motivo{margin-top:10px;background:rgba(0,0,0,.28);border-radius:10px;padding:10px 12px;font-size:15px;font-weight:600;letter-spacing:0}
.duelo-par{display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:10px;font-size:15px;font-weight:600;letter-spacing:0}
.duelo-par button,.duelo-contra button{background:#c9a24a;color:#1b1608;border:0;border-radius:10px;padding:10px 18px;font-size:16px;font-weight:800;cursor:pointer}
.duelo-par button:disabled{opacity:.5}
.duelo-contra{margin-top:12px}
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

  // tokDef = un token del mapa ({id, nombre, tipo, fichaId, duenoUid}); miTokenId = el token del atacante (o ''); contraDe = id del duelo que se contraataca.
  async function crear(cfg, tokDef, miTokenId, contraDe){
    const ref = await col().add({
      estado: 'esperando', fase: 'contacto',
      atacante: {ref: String(cfg.yo.ref), tipo: cfg.yo.tipo, nombre: String(cfg.yo.nombre || '').slice(0, 40), uid: yo(), tokenId: miTokenId || ''},
      defensor: {ref: String(tokDef.fichaId || ''), tipo: tokDef.tipo, nombre: String(tokDef.nombre || '').slice(0, 40), uid: String(tokDef.duenoUid || ''), tokenId: tokDef.id},
      ataque: {tipo: cfg.ataque.tipo, armaId: String(cfg.ataque.armaId || ''), armaNombre: String(cfg.ataque.armaNombre || '').slice(0, 60), tipoDado: _num(cfg.ataque.tipoDado)},
      defensa: null, pdg: null, eva: null, fuerza: null, bloqueo: null, contacto: null, bloq: null, empate: null, resultado: null, critDatos: null, crit: null, dano: null, efectos: null, contra: null,
      contraDe: contraDe || '',
      creadoPor: yo(),
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    });
    autoAbiertos.add(ref.id);
    if(!enIframe()) abrir(ref.id);   // adentro de un iframe del mapa el cuadro no se abre: lo abre el mapa (y el de todos)
    return ref.id;
  }

  /* ---------- las reglas del duelo (puras, sobre el documento) ---------- */
  // Compara dos tiradas (a = del atacante, b = del defensor). Devuelve {gana, dif, desempate} o {empate: true}.
  function resolverPar(a, b){
    const dif = a.total - b.total;
    if(dif > 0) return {gana: 'atacante', dif};
    if(dif < 0) return {gana: 'defensor', dif};
    const masA = _num(a.mod) > 0, masB = _num(b.mod) > 0;
    if(masA !== masB) return {gana: masA ? 'defensor' : 'atacante', dif: 0, desempate: 'mas1'};
    return {empate: true};
  }

  // Aplica el resultado de un par de tiradas al documento `m` (una copia), y avanza de fase.
  // El golpe pasa (entero o a la mitad): sigue el daño.
  function entrarDano(m){ m.fase = 'dano'; m.estado = 'esperando'; }

  function cerrarPar(m, par, r){
    const info = {gana: r.gana, dif: r.dif, desempate: r.desempate || null, moneda: r.moneda || null};
    m.empate = null;
    m.estado = 'esperando';
    if(par === 'contacto'){
      m.contacto = info;
      if(m.defensa && m.defensa.modo === 'parry' && r.gana === 'defensor'){ m.fase = 'bloqueo'; }   // el Parry paró el PdG: sigue el Bloqueo
      else if(r.gana === 'atacante'){ m.resultado = 'pego'; entrarCritico(m); }   // el golpe pega: ¿es crítico?
      else{ m.resultado = 'fallo'; m.fase = 'fin'; m.estado = 'resuelto'; }
    }else{
      m.bloq = info;
      m.resultado = r.gana === 'defensor' ? 'bloqueado' : 'mitad';
      if(m.resultado === 'mitad') entrarDano(m);
      else{ m.fase = 'fin'; m.estado = 'resuelto'; }
    }
  }

  // El golpe pegó (por Evasión o por un Parry perdido): se evalúa el crítico con la misma regla, contra la tirada de defensa que se usó.
  function entrarCritico(m){
    const dd = m.critDatos || {};
    let e = null;
    if(typeof Critico !== 'undefined' && m.pdg && m.eva){
      e = Critico.evaluar({pdg: m.pdg.total, eva: m.eva.total, tipo: m.ataque.tipoDado, frecuente: _num(dd.frecuente), potente: _num(dd.potente), resistencia: _num(dd.resistencia)});
    }
    if(e && e.critico){
      m.crit = {rango: e.rango, diferencia: e.diferencia, nivel: e.nivel, dados: e.dados, critico: true, frecuente: _num(dd.frecuente), potente: _num(dd.potente), resistencia: _num(dd.resistencia), d20: null, mejor: 0, mult: 1};
      m.fase = 'critico';
      m.estado = 'esperando';
    }else{
      m.crit = e ? {rango: e.rango, diferencia: e.diferencia, nivel: e.nivel, dados: e.dados, critico: false, frecuente: _num(dd.frecuente), potente: _num(dd.potente), resistencia: _num(dd.resistencia), d20: null, mejor: 0, mult: 1} : null;
      entrarDano(m);
    }
  }

  // Tira los d20 del crítico (los tira el atacante o el GM): el mejor da el multiplicador.
  async function tirarCritico(id){
    const ref = col().doc(id);
    let anuncio = '', publicar = null;
    await fbDb.runTransaction(async tx => {
      anuncio = ''; publicar = null;
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'esperando' || m.fase !== 'critico' || !m.crit || m.crit.d20) return;
      const n = Math.max(1, _num(m.crit.dados));
      const rolls = Array.from({length: n}, () => 1 + Math.floor(Math.random() * 20));
      const mejor = Math.max(...rolls);
      const mult = Critico.multiplicador(mejor, m.crit.potente);
      m.crit = {...m.crit, d20: rolls, mejor, mult};
      entrarDano(m);
      tx.update(ref, cambiosDe(m));
      const NOMBRE_MULT = {1: 'sin multiplicador: el golpe pega normal', 2: 'doble daño', 3: 'triple daño', 4: 'cuádruple daño'};
      publicar = {origen: `${m.atacante.nombre} · Crítico (${n}d20)`, r: {formula: `${n}d20`, rolls, mod: 0, total: mejor}};
      anuncio = mult > 1 ? `💥 ¡CRÍTICO! ${m.atacante.nombre} contra ${m.defensor.nombre}: ×${mult} (${NOMBRE_MULT[mult]}), ignora la Defensa` : `${m.atacante.nombre} tiró el crítico contra ${m.defensor.nombre} y no salió multiplicador: el golpe pega normal`;
    });
    if(publicar && typeof mesaPublicar === 'function'){ try{ mesaPublicar(publicar.origen, publicar.r); }catch(err){} }
    anunciarMesa(anuncio);
  }

  // Si ya están las dos tiradas del par de la fase, lo resuelve (o abre el desempate).
  function avanzar(m){
    let par = null, a = null, b = null;
    if(m.fase === 'contacto' && m.pdg && m.eva){ par = 'contacto'; a = m.pdg; b = m.eva; }
    else if(m.fase === 'bloqueo' && m.fuerza && m.bloqueo){ par = 'bloqueo'; a = m.fuerza; b = m.bloqueo; }
    if(!par) return null;
    const r = resolverPar(a, b);
    if(r.empate){ m.estado = 'empate'; m.empate = {par}; return null; }
    cerrarPar(m, par, r);
    return r.desempate === 'mas1' ? textoDesempate(m, par, r) : null;
  }

  const nombresPar = (m, par) => par === 'contacto'
    ? [`PdG de ${m.atacante.nombre}`, `${m.defensa && m.defensa.modo === 'parry' ? 'Parry' : 'Evasión'} de ${m.defensor.nombre}`, m.pdg, m.eva]
    : [`Fuerza del golpe de ${m.atacante.nombre}`, `Bloqueo de ${m.defensor.nombre}`, m.fuerza, m.bloqueo];

  function textoDesempate(m, par, r){
    const [na, nb, ta, tb] = nombresPar(m, par);
    const ganador = r.gana === 'atacante' ? m.atacante.nombre : m.defensor.nombre;
    if(r.desempate === 'mas1'){
      const conMas = r.gana === 'atacante' ? nb : na;
      return `⚖ Empate (${ta.total} a ${tb.total}) entre ${na} y ${nb}: gana ${ganador} porque ${conMas} llevaba un «+» fijo y la otra no`;
    }
    const mo = r.moneda;
    const quien = mo.quien === 'atacante' ? m.atacante.nombre : m.defensor.nombre;
    return `⚖ Empate (${ta.total} a ${tb.total}) entre ${na} y ${nb}, las dos con «+» fijo o ninguna: ${quien} eligió ${mo.eleccion}, salió ${mo.resultado} (${mo.resultado % 2 === 0 ? 'par' : 'impar'}) → gana ${ganador}`;
  }

  async function anunciarMesa(texto){
    if(!texto) return;
    try{
      await fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: yo(), jugador: fbMiembro.nombre, quien: '', origen: texto.slice(0, 200), formula: '', rolls: [], mod: 0, total: 0,
        desde: 'recordatorio', cuando: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }catch(err){ console.error('Duelo: no se pudo anunciar en la Mesa', err); }
  }

  const cambiosDe = m => { const c = {}; CAMPOS_ESCRIBIBLES.forEach(k => { c[k] = m[k] === undefined ? null : m[k]; }); return c; };

  // Anota la tirada de `campo` ('pdg'|'eva'|'fuerza'|'bloqueo'); si ya está el otro del par, lo resuelve en la misma transacción.
  async function guardarTiro(id, campo, r, defensa, extra){
    const tiro = {total: Math.round(_num(r.total)), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(_num), mod: _num(r.mod)};
    const fase = (campo === 'pdg' || campo === 'eva') ? 'contacto' : 'bloqueo';
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'esperando' || m.fase !== fase || m[campo]) return;   // ya resuelto, otra fase o ya tiró
      m[campo] = tiro;
      if(campo === 'eva' && defensa) m.defensa = defensa;
      if(extra && (campo === 'pdg' || campo === 'eva')) m.critDatos = {...(m.critDatos || {}), ...extra};   // Crítico frecuente/potente del atacante; Resistencia a crítico del defensor
      anuncio = avanzar(m) || '';
      tx.update(ref, cambiosDe(m));
    });
    anunciarMesa(anuncio);
  }

  /* ---------- efectos del golpe ---------- */
  // Efectos que SOLO entran si el golpe hizo daño (decidido por el dueño, 2026-09-26). El resto entra aunque la armadura absorba todo. Un efecto puede traer `requiereDano` propio.
  const EFECTOS_CON_DANO = ['envenenar', 'veneno severo', 'sangrado', 'drena vida', 'lisiado'];
  const requiereDanoDe = ef => (typeof ef.requiereDano === 'boolean') ? ef.requiereDano : EFECTOS_CON_DANO.includes(String(ef.nombre || '').trim().toLowerCase());
  const siempreEf = ef => _num(ef.caras) <= 1 || _num(ef.exitos) >= _num(ef.caras);
  const pctEf = ef => Math.round(_num(ef.exitos) / Math.max(1, _num(ef.caras)) * 100);
  const necesitaTiradaEf = ef => !siempreEf(ef) || !!ef.dado;

  // Del efecto del arma al estado que se le pone al defensor (null = a mano: no hay estado que lo represente).
  function specDeEfecto(ef){
    const n = String(ef.nombre || '').trim().toLowerCase();
    const st = Math.max(0, Math.round(_num(ef.stacks)));
    if(n === 'rompe armadura' || n === 'arruina armadura' || n === 'media armadura') return {nombre: 'Armadura rota', stacks: Math.max(1, st)};
    if(n === 'sangrado' || n === 'primera sangre') return {nombre: 'Sangrado'};
    if(n === 'envenenar' || n === 'veneno severo') return (n === 'veneno severo' || /severo/i.test(ef.detalle || '')) ? {nombre: 'Veneno severo'} : (st ? {nombre: 'Veneno', stacks: st} : {nombre: 'Veneno'});
    if(n === 'lisiado') return {nombre: 'Lisiado'};
    if(n === 'pajaritos') return {nombre: 'Pajaritos'};
    if(n === 'aturdir') return {nombre: 'Stun'};
    if(n === 'derribar' || n === 'knockdown') return {nombre: 'Sentado'};
    return null;
  }

  // Los efectos que trae el arma, en el formato del duelo (los manda la página del atacante al tirar el daño).
  function normalizarEfectos(lista){
    return (Array.isArray(lista) ? lista : []).slice(0, 8).map(e => {
      const caras = Math.max(1, Math.round(_num(e.caras)) || 1), exitos = Math.min(caras, Math.max(1, Math.round(_num(e.exitos)) || 1));
      const o = {nombre: String(e.nombre || '').trim().slice(0, 40), caras, exitos, dado: String(e.dado || '').trim().slice(0, 20), detalle: String(e.detalle || '').trim().slice(0, 200), stacks: Math.max(0, Math.round(_num(e.stacks)))};
      o.requiereDano = requiereDanoDe(e);
      o.res = null; o.omitido = false; o.motivo = ''; o.aplicar = ''; o.aplicado = false; o.nota = '';
      return o;
    }).filter(e => e.nombre);
  }

  const efectoResuelto = ef => ef.omitido || ef.aplicado || (ef.res && !ef.res.exito);
  // Si ya no queda ningún efecto por resolver, el duelo termina.
  function cerrarSiListo(m){
    if(m.fase !== 'efectos') return;
    if((m.efectos || []).every(efectoResuelto)){ m.fase = 'fin'; m.estado = 'resuelto'; }
  }

  // El atacante (o el GM) tira el dado de un efecto: el dado a la vista, «funcionó» o «no funcionó».
  async function tirarEfecto(id, i){
    const ref = col().doc(id);
    let publicar = null, anuncio = '';
    await fbDb.runTransaction(async tx => {
      publicar = null; anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      const ef = (m.efectos || [])[i];
      if(m.fase !== 'efectos' || !ef || ef.res || ef.omitido) return;
      const r = {dado: 0, exito: true, extra: null};
      if(!siempreEf(ef)){
        r.dado = 1 + Math.floor(Math.random() * ef.caras);
        r.exito = r.dado >= ef.caras - ef.exitos + 1;
      }
      if(r.exito && ef.dado && typeof tirarDados === 'function'){
        const x = tirarDados(ef.dado);
        if(x) r.extra = {formula: x.formula, total: x.total, rolls: (x.rolls || []).slice(0, 10)};
      }
      ef.res = r;
      m.efectos = m.efectos.map((e, k) => k === i ? ef : e);
      cerrarSiListo(m);
      tx.update(ref, cambiosDe(m));
      if(!siempreEf(ef)) publicar = {origen: `${m.atacante.nombre} · ${ef.nombre} ${pctEf(ef)}%`, r: {formula: `1d${ef.caras}`, rolls: [r.dado], mod: 0, total: r.dado}};
      anuncio = r.exito ? `✔ ${ef.nombre}${siempreEf(ef) ? '' : ' (' + pctEf(ef) + '%)'} de ${m.atacante.nombre} sobre ${m.defensor.nombre}: ${siempreEf(ef) ? '' : 'salió ' + r.dado + ' → '}¡FUNCIONÓ!${r.extra ? ' · ' + ef.dado + ' = ' + r.extra.total : ''}`
        : `✘ ${ef.nombre} (${pctEf(ef)}%) de ${m.atacante.nombre} sobre ${m.defensor.nombre}: salió ${r.dado} → no funcionó`;
    });
    if(publicar && typeof mesaPublicar === 'function'){ try{ mesaPublicar(publicar.origen, publicar.r); }catch(err){} }
    anunciarMesa(anuncio);
  }

  // Pedir «Aplicar» (lo ejecuta el mapa del GM) o dar por hecho uno que se hace a mano.
  async function marcarEfecto(id, i, cambios){
    const ref = col().doc(id);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      const ef = (m.efectos || [])[i];
      if(m.fase !== 'efectos' || !ef || ef.aplicado) return;
      m.efectos = m.efectos.map((e, k) => k === i ? {...e, ...cambios} : e);
      cerrarSiListo(m);
      tx.update(ref, cambiosDe(m));
    });
  }
  async function terminarEfectos(id){
    const ref = col().doc(id);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.fase !== 'efectos') return;
      m.fase = 'fin'; m.estado = 'resuelto';
      tx.update(ref, cambiosDe(m));
    });
  }

  // El atacante tiró el daño de su arma.
  async function guardarDano(id, r, efectos){
    const ref = col().doc(id);
    await fbDb.runTransaction(async tx => {
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'esperando' || m.fase !== 'dano' || m.dano) return;
      m.dano = {crudo: Math.max(0, Math.round(_num(r.total))), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(_num), mod: _num(r.mod), reclamado: '', aplicado: false};
      m.efectos = normalizarEfectos(efectos);
      tx.update(ref, cambiosDe(m));
    });
  }

  /* ---------- resumen final en la Mesa ---------- */
  // Un renglón por cosa que pasó, para la línea de reporte de la Mesa.
  function lineasResumen(d){
    const L = [];
    const arma = d.ataque.armaNombre ? d.ataque.armaNombre : 'sin arma';
    L.push(`${d.atacante.nombre} → ${d.defensor.nombre} · ${NOMBRE_ATAQUE[d.ataque.tipo] || 'Ataque'} con ${arma} (Tipo ${_fmt(_num(d.ataque.tipoDado))})`);
    const defTxt = d.defensa && d.defensa.modo === 'parry' ? 'Parry' + (d.defensa.itemNombre ? ' con ' + d.defensa.itemNombre : '') : 'Evasión';
    if(d.pdg && d.eva) L.push(`Contacto: PdG ${d.pdg.total} contra ${defTxt} ${d.eva.total} → ${d.contacto && d.contacto.gana === 'atacante' ? 'pegó' : 'el defensor ganó'}${d.contacto && d.contacto.desempate ? ' (por desempate)' : ''}`);
    if(d.fuerza && d.bloqueo) L.push(`Bloqueo: Fuerza del golpe ${d.fuerza.total} contra Bloqueo ${d.bloqueo.total} → ${d.bloq && d.bloq.gana === 'defensor' ? 'bloqueado' : 'no alcanzó'}${d.bloq && d.bloq.desempate ? ' (por desempate)' : ''}`);
    if(d.crit && d.crit.critico) L.push(d.crit.mult > 1 ? `¡Crítico ×${d.crit.mult}! (d20: ${(d.crit.d20 || []).join(', ')})` : `Crítico posible pero sin multiplicador (d20: ${(d.crit.d20 || []).join(', ')})`);
    const dn = d.dano;
    if(dn && dn.aplicado){
      const crit = d.resultado === 'pego' && d.crit && d.crit.mult > 1;
      if(dn.invulnerable) L.push('Daño: era Invulnerable, no hizo nada');
      else if(dn.manual) L.push(`Daño: ${dn.golpe} (se aplicó a mano)`);
      else if(crit) L.push(`Daño: ${dn.crudo} × ${dn.mult} = ${dn.golpe} derecho a la vida (${dn.hpAntes} → ${dn.hpDespues} HP)`);
      else if(dn.mitad) L.push(`Daño: pasó la mitad → ${dn.recibido} (${dn.hpAntes} → ${dn.hpDespues} HP)`);
      else L.push(`Daño: ${dn.crudo} − Defensa ${dn.defensa} = ${dn.recibido} (${dn.hpAntes} → ${dn.hpDespues} HP)`);
    }
    if(d.resultado === 'mitad') L.push(`Durabilidad: ${d.defensa && d.defensa.itemNombre ? d.defensa.itemNombre : 'el objeto que bloqueó'} pierde 1 punto`);
    (d.efectos || []).forEach(ef => {
      if(ef.omitido) L.push(`— ${ef.nombre}: no entró (${ef.motivo || 'sin daño'})`);
      else if(ef.res && !ef.res.exito) L.push(`✘ ${ef.nombre} (${pctEf(ef)} %): no funcionó`);
      else if(ef.aplicado) L.push(`✔ ${ef.nombre}${siempreEf(ef) ? '' : ' (' + pctEf(ef) + ' %)'}: aplicado${ef.nota ? ' · ' + ef.nota : ''}`);
      else L.push(`? ${ef.nombre}: quedó sin resolver`);
    });
    const fin = {pego: 'El golpe pegó', fallo: 'El golpe falló', bloqueado: 'El golpe fue bloqueado', mitad: 'Pasó la mitad del daño'}[d.resultado];
    if(fin) L.push(`Resultado: ${fin}`);
    return L;
  }

  // Cuando un duelo termina, quien lo creó publica UNA línea de resumen en la Mesa (se «reclama» con `resumido`).
  async function publicarResumenSiCorresponde(d){
    if(d.estado !== 'resuelto' || d.resumido || d.creadoPor !== yo() || aplicando.has(d.id + ':resumen')) return;
    aplicando.add(d.id + ':resumen');
    const ref = col().doc(d.id);
    let datos = null;
    try{
      await fbDb.runTransaction(async tx => {
        datos = null;
        const doc = await tx.get(ref);
        if(!doc.exists) return;
        const m = {id: d.id, ...doc.data()};
        if(m.resumido || m.estado !== 'resuelto') return;
        tx.update(ref, {resumido: true});
        datos = m;
      });
      if(datos){
        await fbDb.collection(fbRutaCampana('tiradas')).add({
          uid: yo(), jugador: fbMiembro.nombre, quien: '', origen: `⚔ Resumen del duelo · ${datos.atacante.nombre} → ${datos.defensor.nombre}`,
          formula: lineasResumen(datos).join('\n').slice(0, 900), rolls: [], mod: 0, total: 0, desde: 'reporte',
          cuando: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    }catch(err){ console.error('Duelo: no se pudo publicar el resumen', err); }
  }

  // Reclamar un pedido de «Aplicar» para que, con varias pestañas del GM, solo una lo ejecute.
  async function reclamarEfecto(id, i){
    const ref = col().doc(id);
    let mio = false;
    await fbDb.runTransaction(async tx => {
      mio = false;
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      const ef = (m.efectos || [])[i];
      if(!ef || ef.aplicado || ef.aplicar !== 'pedido') return;
      m.efectos = m.efectos.map((e, k) => k === i ? {...e, aplicar: 'en-curso'} : e);
      tx.update(ref, cambiosDe(m));
      mio = true;
    });
    return mio;
  }

  // El GM (en el mapa) aplica el daño al HP: primero se «reclama» para que, con varias pestañas del GM, solo una lo aplique.
  async function reclamarAplicacion(id){
    const ref = col().doc(id);
    let mio = false;
    await fbDb.runTransaction(async tx => {
      mio = false;
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.fase !== 'dano' || !m.dano || m.dano.aplicado || m.dano.reclamado) return;
      m.dano = {...m.dano, reclamado: yo()};
      tx.update(ref, cambiosDe(m));
      mio = true;
    });
    return mio;
  }
  async function guardarAplicacion(id, info){
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.fase !== 'dano' || !m.dano || m.dano.aplicado) return;
      m.dano = {...m.dano, ...info, aplicado: true};
      // ¿El golpe hizo daño? Los efectos que lo necesitan no entran si la armadura lo absorbió todo.
      const dn0 = m.dano;
      const hizoDano = dn0.invulnerable ? false : dn0.manual ? _num(dn0.golpe) > 0 : (_num(dn0.recibido) + _num(dn0.absorbido)) > 0;
      m.efectos = (m.efectos || []).map(ef => (ef.requiereDano && !hizoDano) ? {...ef, omitido: true, motivo: dn0.invulnerable ? 'era Invulnerable: el golpe no hizo nada' : 'el golpe no hizo daño (la armadura lo absorbió)'} : ef);
      if((m.efectos || []).length){ m.fase = 'efectos'; m.estado = 'esperando'; cerrarSiListo(m); }
      else{ m.fase = 'fin'; m.estado = 'resuelto'; }
      tx.update(ref, cambiosDe(m));
      const dn = m.dano, crit = m.resultado === 'pego' && m.crit && m.crit.mult > 1;
      anuncio = dn.manual ? `⚔ ${m.atacante.nombre} le pegó a ${m.defensor.nombre}${crit ? ' con crítico ×' + m.crit.mult : ''}: ${dn.golpe} de daño (aplicalo a mano)`
        : dn.invulnerable ? `⚔ ${m.atacante.nombre} → ${m.defensor.nombre}: Invulnerable, el golpe no hizo nada`
        : crit ? `💥 ${m.atacante.nombre} → ${m.defensor.nombre}: ${dn.golpe} de daño (×${m.crit.mult}) derecho a la vida (${dn.hpAntes} → ${dn.hpDespues} HP)`
        : dn.mitad ? `⚠ ${m.atacante.nombre} → ${m.defensor.nombre}: pasó la mitad: ${dn.recibido} de daño (${dn.hpAntes} → ${dn.hpDespues} HP)`
        : `⚔ ${m.atacante.nombre} → ${m.defensor.nombre}: ${dn.crudo} − Defensa ${dn.defensa} = ${dn.recibido} de daño (${dn.hpAntes} → ${dn.hpDespues} HP)`;
    });
    anunciarMesa(anuncio);
  }

  // Empate con «+» en las dos (o en ninguna): el primero que elige par o impar decide; se tira un d6 y gana el que acierta.
  async function elegirParidad(id, quien, eleccion){
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'empate' || !m.empate || m.empate.moneda) return;   // ya lo eligió el otro
      const par = m.empate.par;
      const resultado = 1 + Math.floor(Math.random() * 6);
      const esPar = resultado % 2 === 0;
      const acierta = (eleccion === 'par') === esPar;
      const gana = acierta ? quien : (quien === 'atacante' ? 'defensor' : 'atacante');
      const r = {gana, dif: 0, desempate: 'moneda', moneda: {quien, eleccion, resultado}};
      cerrarPar(m, par, r);
      anuncio = textoDesempate(m, par, r);
      tx.update(ref, cambiosDe(m));
    });
    anunciarMesa(anuncio);
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

  const esMio = lado => !!lado && lado.uid === yo();
  // ¿Puede esta pestaña tirar por ese lado con su propio código (o pidiéndolo al iframe)?
  const puedoTirarYo = lado => esMio(lado) && !!(cfgEscuchar.relay || (hooks() && hooks().soy && hooks().soy(lado)));
  const puedoAMano = lado => soyGM() || esMio(lado);

  // Envía un pedido al dueño del lado: en el mapa, al iframe; en una página suelta, se ejecuta acá.
  function enviar(lado, msg){
    if(cfgEscuchar.relay) cfgEscuchar.relay(lado, msg);
    else ejecutar(msg);
  }

  function pedirOpciones(d){
    if(opcionesPedidas.has(d.id)) return;
    opcionesPedidas.add(d.id);
    enviar(d.defensor, {tipo: 'duelo-opciones', id: d.id});
  }
  function recibirOpciones(id, ops){
    opciones[id] = Array.isArray(ops) ? ops : [];
    if(actual && actual.id === id && actual.dato) dibujar();
  }

  const ETIQ = {pdg: 'PdG', eva: 'Defensa', fuerza: 'Fuerza del golpe', bloqueo: 'Bloqueo', dano: 'Daño'};
  const nombreDefensa = d => d.defensa ? (d.defensa.modo === 'parry' ? 'Parry' + (d.defensa.itemNombre ? ' · ' + d.defensa.itemNombre : '') : 'Evasión') : 'Defensa';

  function numerosHtml(tiro, esNuevo, que, quien){
    return `<div class="duelo-tiro${esNuevo ? ' nuevo' : ''}"><div class="que">${_esc(que)} · ${_esc(quien)}</div><div class="num">${_fmt(tiro.total)}</div><div class="det">${_esc(tiro.formula || '')}${tiro.rolls && tiro.rolls.length ? ' → ' + tiro.rolls.join(' + ') : ''}${_num(tiro.mod) ? ' ' + (_num(tiro.mod) > 0 ? '+' : '−') + ' ' + Math.abs(_num(tiro.mod)) : ''}</div></div>`;
  }

  // Una caja de tirada. campo: 'pdg'|'eva'|'fuerza'|'bloqueo'.
  function cajaHtml(d, campo, otro, esNuevo){
    const esAtq = campo === 'pdg' || campo === 'fuerza';
    const lado = esAtq ? d.atacante : d.defensor;
    const tiro = d[campo];
    const fase = (campo === 'pdg' || campo === 'eva') ? 'contacto' : 'bloqueo';
    const etiqueta = campo === 'eva' ? nombreDefensa(d) : ETIQ[campo];
    const parCompleto = !!(tiro && d[otro]);
    if(parCompleto) return numerosHtml(tiro, esNuevo, etiqueta, lado.nombre);
    if(tiro) return `<div class="duelo-tiro"><div class="que">${_esc(etiqueta)} · ${_esc(lado.nombre)}</div><div class="listo">✔ Ya tiró</div><div class="det">el resultado se muestra cuando tiren los dos</div></div>`;
    const vivo = d.estado === 'esperando' && d.fase === fase;
    if(!vivo) return `<div class="duelo-tiro"><div class="que">${_esc(etiqueta)} · ${_esc(lado.nombre)}</div><div class="espera">no llegó a tirar</div></div>`;
    const quien = _esc(lado.nombre);
    let cuerpo;
    if(puedoTirarYo(lado)){
      if(campo === 'eva'){
        const ops = opciones[d.id];
        if(!ops){ pedirOpciones(d); cuerpo = '<div class="espera">cargando tus opciones de defensa…</div>'; }
        else cuerpo = `<div class="det">Elegí cómo te defendés (antes de ver el PdG):</div><div class="duelo-opc">${ops.map((o, i) => `<button type="button" data-def="${i}"${o.motivoNo ? ' disabled' : ''}>${_esc(o.etiqueta)}${o.costo ? `<small>${_fmt(o.costo)} No2</small>` : ''}${o.motivoNo ? `<small>${_esc(o.motivoNo)}</small>` : ''}</button>`).join('')}</div>`;
      }else{
        const txt = campo === 'pdg' ? '🎲 Pagar y tirar PdG' : campo === 'fuerza' ? '🎲 Tirar Fuerza del golpe' : `🎲 Tirar Bloqueo${d.defensa && d.defensa.itemNombre ? ' · ' + _esc(d.defensa.itemNombre) : ''}`;
        cuerpo = `<button type="button" data-tirar="${campo}">${txt}</button>${campo === 'pdg' ? '<div class="det">descuenta los No2 del ataque</div>' : ''}`;
      }
    }else if(puedoAMano(lado)){
      const selModo = campo === 'eva' ? `<select data-manual-modo><option value="evasion">Evasión</option><option value="parry">Parry</option></select>` : '';
      cuerpo = `<div class="espera">esperando que ${quien} tire…</div>
        <div class="duelo-man">${selModo}<input type="number" min="1" data-manual="${campo}" placeholder="valor" value="${_esc(manual[campo] || '')}"><button type="button" class="sec" data-tirarpor="${campo}">🎲 Tirar a mano</button></div>
        <div class="det">${soyGM() ? 'como GM, tirás por él' : 'tirás vos'}: escribí el valor del stat y se tira con dados</div>`;
    }else{
      cuerpo = `<div class="espera">esperando que ${quien} tire…</div>`;
    }
    return `<div class="duelo-tiro"><div class="que">${_esc(etiqueta)} · ${quien}</div>${cuerpo}</div>`;
  }

  // Línea corta con quién ganó un par ya resuelto.
  function miniHtml(d, par){
    const info = par === 'contacto' ? d.contacto : d.bloq;
    if(!info) return '';
    const a = par === 'contacto' ? d.pdg : d.fuerza, b = par === 'contacto' ? d.eva : d.bloqueo;
    const [na, nb] = nombresPar(d, par);
    const gano = info.gana === 'atacante' ? na : nb;
    return `<div class="duelo-mini ${info.gana === 'atacante' ? 'r' : 'g'}">${a.total} contra ${b.total} · gana ${_esc(gano)}${info.desempate ? ' (desempate)' : ''}</div>`;
  }

  function empateHtml(d, esNuevo){
    const par = d.empate.par;
    const [na, nb, ta, tb] = nombresPar(d, par);
    const lados = [['atacante', d.atacante], ['defensor', d.defensor]].filter(([, l]) => puedoAMano(l));
    return `<div class="duelo-veredicto empate${esNuevo ? ' nuevo' : ''}"><div class="grande">⚖ ¡EMPATE!</div><div class="chico">${_esc(na)} ${ta.total} · ${_esc(nb)} ${tb.total} — las dos llevan «+» fijo (o ninguna): se resuelve con par o impar</div>
      ${lados.length ? lados.map(([q, l]) => `<div class="duelo-par"><span>${_esc(l.nombre)} (${q}) elige:</span><button type="button" data-par="${q}:par">Par</button><button type="button" data-par="${q}:impar">Impar</button></div>`).join('') : '<div class="chico">esperando que uno de los dos elija par o impar…</div>'}
      <div class="chico">el primero que elige decide: se tira un dado y gana el que acierta</div></div>`;
  }

  function veredictoHtml(d, esNuevo){
    const nuevo = esNuevo ? ' nuevo' : '';
    const motivos = [];
    [d.contacto, d.bloq].forEach((info, i) => {
      if(!info || !info.desempate) return;
      const par = i === 0 ? 'contacto' : 'bloqueo';
      const [na, nb, ta, tb] = nombresPar(d, par);
      const ganador = info.gana === 'atacante' ? d.atacante.nombre : d.defensor.nombre;
      if(info.desempate === 'mas1') motivos.push(`Se resolvió el empate (${_esc(par === 'contacto' ? 'contacto' : 'Bloqueo')}): gana ${_esc(ganador)} porque la otra tirada llevaba un «+» fijo y ella no.`);
      else if(info.moneda) motivos.push(`Se resolvió el empate (${par === 'contacto' ? 'contacto' : 'Bloqueo'}) con par o impar: ${_esc(info.moneda.quien === 'atacante' ? d.atacante.nombre : d.defensor.nombre)} eligió ${info.moneda.eleccion}, salió ${info.moneda.resultado} (${info.moneda.resultado % 2 === 0 ? 'par' : 'impar'}) → gana ${_esc(ganador)}.`);
    });
    const mot = motivos.map(t => `<div class="duelo-motivo">⚖ ${t}</div>`).join('');
    const item = d.defensa && d.defensa.itemNombre ? d.defensa.itemNombre : 'el objeto con el que bloqueó';
    let caja;
    if(d.resultado === 'pego' && d.crit && d.crit.critico && d.crit.mult > 1){
      const porParry = d.defensa && d.defensa.modo === 'parry';
      caja = `<div class="duelo-veredicto critico${nuevo}"><div class="chispas">✨ 💥 ✨</div><div class="grande">¡CRÍTICO!</div><div class="mult">×${d.crit.mult} · ${NOMBRE_MULT[d.crit.mult]}</div><div class="chico">${porParry ? 'El Parry no alcanzó y ' : ''}el golpe ignora la Defensa: todo el daño se multiplica y va derecho a la vida <span style="opacity:.8">(el número del daño aparece en la próxima etapa)</span></div>${mot}</div>`;
    }else if(d.resultado === 'pego'){
      const porParry = d.defensa && d.defensa.modo === 'parry';
      caja = `<div class="duelo-veredicto pego${nuevo}"><div class="grande">⚔ ¡PEGÓ!</div><div class="chico">${porParry ? 'El Parry no alcanzó: el golpe entra completo' : 'El golpe entra completo'}</div>${mot}</div>`;
    }else if(d.resultado === 'fallo'){
      caja = `<div class="duelo-veredicto fallo${nuevo}"><div class="grande">🛡 FALLÓ</div><div class="chico">${_esc(d.defensor.nombre)} lo esquivó</div>${mot}</div>`;
    }else if(d.resultado === 'bloqueado'){
      caja = `<div class="duelo-veredicto bloqueado${nuevo}"><div class="grande">🛡 ¡BLOQUEADO!</div><div class="chico">El golpe queda anulado</div>${mot}</div>`;
    }else if(d.resultado === 'mitad'){
      caja = `<div class="duelo-veredicto mitad${nuevo}"><div class="grande">⚠ PASA LA MITAD</div><div class="chico">Paró el golpe pero no lo frenó del todo: pasa la mitad del daño (redondeada para arriba)</div>
        <div class="duelo-motivo">🔧 ${_esc(item)} pierde 1 punto de durabilidad <span style="font-weight:400">(la durabilidad todavía no está en la ficha: anotalo a mano)</span></div>${mot}</div>`;
    }else return '';
    let contra = '';
    if(d.resultado === 'bloqueado' && !d.contra && esMio(d.defensor)) contra = `<div class="duelo-contra"><button type="button" data-contra>⚔ Contraatacar</button></div>`;
    else if(d.resultado === 'bloqueado' && !d.contra && soyGM()) contra = `<div class="duelo-contra"><button type="button" data-contra>⚔ Contraatacar (por ${_esc(d.defensor.nombre)})</button></div>`;
    else if(d.contra) contra = `<div class="duelo-mini">⚔ ${_esc(d.defensor.nombre)} contraatacó: hay otro duelo abierto</div>`;
    return caja + contra;
  }

  const NOMBRE_MULT = {1: 'sin multiplicador', 2: 'DOBLE DAÑO', 3: 'TRIPLE DAÑO', 4: 'CUÁDRUPLE DAÑO'};

  // Paso 6 · Efectos del golpe: cada efecto es un momento propio (dado a la vista, «funcionó», «Aplicar»).
  function efectosHtml(d){
    const efs = d.efectos || [];
    if(!efs.length) return '';
    const puedeAtq = esMio(d.atacante) || soyGM();
    const cards = efs.map((ef, i) => {
      const clave = d.id + ':ef' + i;
      const nuevo = ef.res && !revelado[clave];
      if(ef.res) revelado[clave] = true;
      const prob = siempreEf(ef) ? 'siempre' : pctEf(ef) + ' %';
      const spec = specDeEfecto(ef);
      let estado;
      if(ef.omitido) estado = `<div class="duelo-ef-res no">✘ No entra: ${_esc(ef.motivo || 'el golpe no hizo daño')}</div>`;
      else if(ef.aplicado) estado = `<div class="duelo-ef-res ok">✔ Aplicado${ef.nota ? ' · ' + _esc(ef.nota) : ''}</div>`;
      else if(ef.res && !ef.res.exito) estado = `<div class="duelo-ef-res no${nuevo ? ' nuevo' : ''}">✘ No funcionó <span>(salió ${_fmt(ef.res.dado)} en 1d${_fmt(ef.caras)})</span></div>`;
      else if(ef.res || (!necesitaTiradaEf(ef) && siempreEf(ef))){
        const cab = ef.res ? `<div class="duelo-ef-res ok${nuevo ? ' nuevo' : ''}">✔ ¡FUNCIONÓ! ${siempreEf(ef) ? '' : `<span>(salió ${_fmt(ef.res.dado)} en 1d${_fmt(ef.caras)})</span>`}${ef.res && ef.res.extra ? ` <span>· ${_esc(ef.dado)} = <b>${_fmt(ef.res.extra.total)}</b></span>` : ''}</div>` : `<div class="duelo-ef-res ok">Entra siempre</div>`;
        let acc;
        if(ef.aplicar === 'pedido' || ef.aplicar === 'en-curso') acc = `<div class="duelo-nota">Aplicando sobre ${_esc(d.defensor.nombre)}…</div>`;
        else if(!puedeAtq) acc = `<div class="duelo-nota">esperando que ${_esc(d.atacante.nombre)} lo aplique…</div>`;
        else if(spec) acc = `<button type="button" data-ef-aplicar="${i}">✔ Aplicar ${_esc(EstadosAplicarTexto(spec, ef))} sobre ${_esc(d.defensor.nombre)}</button>`;
        else acc = `<div class="duelo-nota">✋ A mano: ${_esc(ef.detalle || 'aplicalo vos, no hay un estado automático para este efecto')}</div><button type="button" data-ef-mano="${i}">Listo, lo apliqué a mano</button>`;
        estado = cab + acc;
      }
      else if(puedeAtq) estado = `<button type="button" data-ef-tirar="${i}">🎲 Tirar ${siempreEf(ef) ? _esc(ef.dado) : '1d' + _fmt(ef.caras)}</button><div class="duelo-nota">${siempreEf(ef) ? '' : 'de ' + _fmt(ef.caras - ef.exitos + 1) + (ef.exitos > 1 ? ' a ' + _fmt(ef.caras) : '') + ' funciona · '}${ef.requiereDano ? 'necesita que el golpe haga daño' : 'entra aunque no pase el daño'}</div>`;
      else estado = `<div class="espera duelo-nota">esperando que ${_esc(d.atacante.nombre)} tire…</div>`;
      return `<div class="duelo-ef"><div class="duelo-ef-top"><b>${_esc(ef.nombre)}</b><span class="duelo-ef-prob">${_esc(prob)}</span></div>${ef.detalle ? `<div class="duelo-nota">${_esc(ef.detalle)}</div>` : ''}${estado}</div>`;
    }).join('');
    const pendiente = d.fase === 'efectos';
    return `<div class="duelo-paso"><h4><span class="n">6</span>Efectos del golpe</h4>${cards}${pendiente && puedeAtq ? '<div class="duelo-pie" style="margin-top:8px"><button type="button" class="sec" data-ef-terminar>Terminar sin resolver los que faltan</button></div>' : ''}</div>`;
  }
  const EstadosAplicarTexto = (spec, ef) => (typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.texto(spec) : spec.nombre) + (spec.nombre === 'Armadura rota' && spec.stacks > 1 ? ` ×${spec.stacks}` : '');

  // Paso 5 · Daño: la tirada del arma, la cuenta y, cuando el GM lo aplica, el número grande y la vida.
  function danoHtml(d){
    const dn = d.dano;
    const crit = d.resultado === 'pego' && d.crit && d.crit.critico && d.crit.mult > 1;
    const mult = crit ? d.crit.mult : 1;
    const arma = d.ataque.armaNombre ? ` · ${_esc(d.ataque.armaNombre)}` : '';
    let cuerpo;
    if(!dn){
      const soyAtq = esMio(d.atacante) && (cfgEscuchar.relay || (hooks() && hooks().soy && hooks().soy(d.atacante)));
      if(soyAtq) cuerpo = `<div style="text-align:center"><button type="button" data-dano-tirar>🎲 Tirar el daño${arma}</button><div class="duelo-nota" style="margin-top:6px">${crit ? `Es crítico: todo el daño se multiplica ×${mult} y va derecho a la vida (no se resta la Defensa).` : d.resultado === 'mitad' ? 'Pasa la mitad: (daño − Defensa) ÷ 2, redondeado para arriba.' : 'Se le resta la Defensa del defensor.'}</div></div>`;
      else if(puedoAMano(d.atacante)) cuerpo = `<div class="espera duelo-nota" style="text-align:center">esperando que ${_esc(d.atacante.nombre)} tire el daño…</div>
        <div class="duelo-man"><input type="number" min="1" data-manual="dano" placeholder="daño" value="${_esc(manual.dano || '')}"><button type="button" class="sec" data-tirarpor="dano">🎲 Tirar a mano</button></div>`;
      else cuerpo = `<div class="espera duelo-nota" style="text-align:center">esperando que ${_esc(d.atacante.nombre)} tire el daño…</div>`;
    }else{
      const tiro = `<div class="duelo-mini">Daño${arma}: <b>${_fmt(dn.crudo)}</b> <span style="opacity:.7">(${_esc(dn.formula || '')}${dn.rolls && dn.rolls.length ? ' → ' + dn.rolls.join(' + ') : ''}${_num(dn.mod) ? ' ' + (_num(dn.mod) > 0 ? '+' : '−') + ' ' + Math.abs(_num(dn.mod)) : ''})</span></div>`;
      if(!dn.aplicado){
        cuerpo = tiro + `<div class="duelo-mini">${crit ? `×${mult} = <b>${_fmt(dn.crudo * mult)}</b> derecho a la vida…` : 'Calculando lo que pasa con la Defensa…'}</div>
          <div class="duelo-nota" style="text-align:center">${soyGM() ? 'Aplicando el daño al HP…' : 'El GM aplica el daño al HP.'}</div>
          ${soyGM() ? `<div class="duelo-man"><input type="number" min="0" data-manual="recibido" placeholder="daño recibido" value="${_esc(manual.recibido || '')}"><button type="button" class="sec" data-aplicar-mano>Ya lo apliqué a mano</button></div>` : ''}`;
      }else{
        const golpe = _num(dn.golpe);
        let grande;
        if(dn.invulnerable) grande = `<div class="duelo-danonum inv">INVULNERABLE</div><div class="duelo-danosub">El golpe no hizo nada</div>`;
        else if(dn.manual) grande = `<div class="duelo-danonum">${_fmt(golpe)}</div><div class="duelo-danosub">de daño — <b>aplicalo a mano</b> (${_esc(dn.motivoManual || 'no se pudo aplicar solo')})</div>`;
        else if(dn.ignoraDef) grande = `<div class="duelo-danonum rojo">${_fmt(golpe)}</div><div class="duelo-danosub rojo">DERECHO A LA VIDA</div><div class="duelo-danosub">${_fmt(dn.crudo)} × ${_fmt(dn.mult)} · el crítico ignora la Defensa</div>`;
        else if(dn.mitad) grande = `<div class="duelo-danonum">${_fmt(dn.recibido)}</div><div class="duelo-danosub">de daño (la mitad de ${_fmt(dn.crudo)} − Defensa ${_fmt(dn.defensa)}, redondeada para arriba)</div>`;
        else grande = `<div class="duelo-danonum">${_fmt(dn.recibido)}</div><div class="duelo-danosub">de daño (${_fmt(dn.crudo)} − Defensa ${_fmt(dn.defensa)})</div>`;
        const vida = dn.hpAntes !== undefined && dn.hpAntes !== null && dn.hpDespues !== undefined && dn.hpDespues !== null
          ? `<div class="duelo-mini">${_esc(d.defensor.nombre)}: <b>${_fmt(dn.hpAntes)}</b> → <b>${_fmt(dn.hpDespues)}</b> HP${_num(dn.absorbido) ? ` · el escudo absorbió ${_fmt(dn.absorbido)}` : ''}</div>` : '';
        cuerpo = tiro + `<div class="duelo-danobox${dn.ignoraDef ? ' crit' : ''}">${grande}</div>${vida}`;
      }
    }
    return `<div class="duelo-paso"><h4><span class="n">5</span>Daño</h4>${cuerpo}</div>`;
  }
  // Tabla de valores del d20 para el multiplicador, a la vista ANTES de tirar. Si hay Crítico potente, dice cuánto se movió cada umbral y por qué.
  function tablaCriticoHtml(c, d, mejor){
    const P = Math.max(0, Math.round(_num(c.potente)));
    const u = Critico.umbrales(P), b = Critico.umbrales(0);
    const filas = [['×2', 'DOBLE DAÑO', b.doble, u.doble, P, 1], ['×3', 'TRIPLE DAÑO', b.triple, u.triple, Math.floor(P / 2), 2], ['×4', 'CUÁDRUPLE DAÑO', b.cuadruple, u.cuadruple, Math.floor(P / 3), 3]];
    const gano = mejor ? (mejor >= u.cuadruple ? 2 : mejor >= u.triple ? 1 : mejor >= u.doble ? 0 : -1) : -2;
    const cambia = P > 0;
    const razones = cambia ? `<div class="duelo-nota" style="margin-top:6px">🔧 <b>Tabla modificada:</b> ${_esc(d.atacante.nombre)} tiene <b>Crítico potente ${_fmt(P)}</b>${_num(c.potente) ? ' (de su equipo, habilidades o estados)' : ''}. Cada punto baja <b>1</b> el número del doble daño (hasta un mínimo de 1), <b>1 cada 2 puntos</b> el del triple y <b>1 cada 3 puntos</b> el del cuádruple. Por eso: doble ${b.doble} → <b>${u.doble}</b>${P >= 2 ? `, triple ${b.triple} → <b>${u.triple}</b>` : ''}${P >= 3 ? `, cuádruple ${b.cuadruple} → <b>${u.cuadruple}</b>` : ''}.</div>` : `<div class="duelo-nota" style="margin-top:6px">Tabla base (sin Crítico potente).</div>`;
    return `<table class="duelo-tabla"><thead><tr><th>Multiplicador</th><th>Sale con el mejor d20 de…</th>${cambia ? '<th>Base</th>' : ''}</tr></thead><tbody>
      ${filas.map((f, i) => `<tr class="${gano === i ? 'gano' : ''}${f[3] !== f[2] ? ' mod' : ''}"><td>${f[0]} · ${f[1]}</td><td><b>${f[3] >= 20 && i === 2 ? '20' : f[3] + ' o más'}</b>${f[3] !== f[2] ? ' ✎' : ''}</td>${cambia ? `<td>${f[2] >= 20 && i === 2 ? '20' : f[2] + ' o más'}</td>` : ''}</tr>`).join('')}
      <tr class="${gano === -1 ? 'gano' : ''}"><td>×1 · sin multiplicador</td><td>menos de ${u.doble}</td>${cambia ? `<td>menos de ${b.doble}</td>` : ''}</tr></tbody></table>${razones}`;
  }

  // Paso 4 · Crítico: la cuenta, los d20 y (si sale) la celebración.
  function criticoHtml(d){
    const c = d.crit;
    const nombreDef = d.defensa && d.defensa.modo === 'parry' ? 'Parry' : 'Evasión';
    const cuenta = `PdG ${_fmt(d.pdg.total)} − ${nombreDef} ${_fmt(d.eva.total)} = ${_fmt(c.diferencia)} · rango del crítico ${_fmt(c.rango)} (Tipo ${_fmt(_num(d.ataque.tipoDado))}${_num(c.frecuente) ? ' − Crít. frecuente ' + _fmt(c.frecuente) : ''}) → nivel ${_fmt(c.nivel)}${_num(c.resistencia) ? ` − resistencia ${_fmt(c.resistencia)}` : ''}`;
    let cuerpo;
    if(!c.critico){
      cuerpo = `<div class="duelo-mini">Sin crítico: ${_esc(cuenta)}${c.nivel > 0 && c.dados <= 0 ? ' (la Resistencia a crítico lo anuló)' : ''}</div>`;
    }else if(!c.d20){
      const puede = esMio(d.atacante) || soyGM();
      cuerpo = `<div class="duelo-mini">${_esc(cuenta)}</div>
        <div class="duelo-mini g">💥 ¡Hay posibilidad de crítico! Se tiran <b>${_fmt(c.dados)} d20</b> y vale el mejor</div>
        ${tablaCriticoHtml(c, d, 0)}
        <div class="duelo-contra" style="text-align:center">${puede ? `<button type="button" data-critico>🎲 Tirar ${_fmt(c.dados)} d20</button>` : `<div class="espera duelo-nota">esperando que ${_esc(d.atacante.nombre)} tire el crítico…</div>`}</div>`;
    }else{
      cuerpo = `<div class="duelo-mini">${_esc(cuenta)}</div>
        <div class="duelo-mini">d20: ${c.d20.map(x => x === c.mejor ? `<b>${x}</b>` : x).join(' · ')} → mejor <b>${_fmt(c.mejor)}</b> · ${c.mult > 1 ? `×${_fmt(c.mult)} ${NOMBRE_MULT[c.mult]}` : 'sin multiplicador'}</div>
        ${tablaCriticoHtml(c, d, c.mejor)}`;
    }
    return `<div class="duelo-paso"><h4><span class="n">4</span>Crítico</h4>${cuerpo}</div>`;
  }

  function dibujar(){
    const d = actual && actual.dato;
    const f = document.getElementById('duelo-fondo');
    if(!d || !f) return;
    f.querySelectorAll('[data-manual]').forEach(i => { manual[i.dataset.manual] = i.value; });   // conservar lo tipeado a mano
    const nombreAtaque = NOMBRE_ATAQUE[d.ataque.tipo] || 'Ataque';
    const nuevaClave = k => { const c = d.id + ':' + k; const nuevo = !revelado[c]; revelado[c] = true; return nuevo; };
    const contactoListo = !!(d.pdg && d.eva), bloqueoListo = !!(d.fuerza && d.bloqueo);
    const nuevoContacto = contactoListo ? nuevaClave('contacto') : false;
    const nuevoBloqueo = bloqueoListo ? nuevaClave('bloqueo') : false;
    let cierre = '';
    if(d.estado === 'empate' && d.empate) cierre = empateHtml(d, nuevaClave('empate' + d.empate.par));
    else if(d.resultado && (d.estado === 'resuelto' || d.fase === 'dano' || d.fase === 'efectos')) cierre = veredictoHtml(d, nuevaClave('resultado'));
    else if(d.estado === 'cancelado') cierre = '<div class="duelo-veredicto fallo"><div class="chico">Duelo cancelado</div></div>';
    const puedoCancelar = abierto(d) && (soyGM() || d.creadoPor === yo());
    const min = f.classList.contains('min');
    const mostrarBloqueo = d.fase === 'bloqueo' || !!d.bloq || (d.estado === 'empate' && d.empate && d.empate.par === 'bloqueo') || !!d.fuerza;
    f.innerHTML = `<div class="duelo-caja">
      <div class="duelo-cab"><span>⚔ ${_esc(nombreAtaque)}</span><div class="bt"><button type="button" data-min title="Minimizar (queda el botón «Ver duelo»)">—</button><button type="button" data-x title="Cerrar">✕</button></div></div>
      <div class="duelo-cuerpo">
        <div class="duelo-paso"><h4><span class="n">1</span>Declaración</h4>
          <div class="duelo-vs">
            <div class="duelo-lado atq"><div class="rol">Ataca</div><div class="nom">${_esc(d.atacante.nombre)}</div><div class="sub">${d.ataque.armaNombre ? 'con ' + _esc(d.ataque.armaNombre) : 'sin arma'} · Tipo ${_fmt(_num(d.ataque.tipoDado))}</div></div>
            <div class="vs">VS</div>
            <div class="duelo-lado def"><div class="rol">Defiende</div><div class="nom">${_esc(d.defensor.nombre)}</div><div class="sub">${d.defensor.tipo === 'creep' ? 'creep' : 'personaje'}${d.defensa ? ' · ' + _esc(nombreDefensa(d)) : ''}</div></div>
          </div></div>
        <div class="duelo-paso"><h4><span class="n">2</span>Contacto: PdG contra ${d.defensa ? _esc(d.defensa.modo === 'parry' ? 'Parry' : 'Evasión') : 'la defensa que elija'}</h4>
          <div class="duelo-tiros">${cajaHtml(d, 'pdg', 'eva', nuevoContacto)}${cajaHtml(d, 'eva', 'pdg', nuevoContacto)}</div>
          ${miniHtml(d, 'contacto')}
        </div>
        ${mostrarBloqueo ? `<div class="duelo-paso"><h4><span class="n">3</span>Bloqueo: Fuerza del golpe contra Bloqueo</h4>
          <div class="duelo-tiros">${cajaHtml(d, 'fuerza', 'bloqueo', nuevoBloqueo)}${cajaHtml(d, 'bloqueo', 'fuerza', nuevoBloqueo)}</div>
          ${miniHtml(d, 'bloqueo')}
        </div>` : ''}
        ${d.crit ? criticoHtml(d) : ''}
        ${(d.fase === 'dano' || d.dano) ? danoHtml(d) : ''}
        ${efectosHtml(d)}
        ${cierre}
        <div class="duelo-pie">
          ${puedoCancelar ? '<button type="button" class="sec" data-cancelarduelo>Cancelar duelo</button>' : ''}
          <button type="button" class="sec" data-min2>Minimizar</button>
          <button type="button" class="sec" data-x2>Cerrar</button>
        </div>
        ${d.resultado ? '<div class="duelo-nota">Próximas etapas: crítico, daño y defensa (con la durabilidad), efectos del golpe.</div>' : ''}
      </div></div>`;
    if(min) f.classList.add('min');
    f.querySelector('[data-min]').onclick = minimizar;
    f.querySelector('[data-min2]').onclick = minimizar;
    f.querySelector('[data-x]').onclick = cerrar;
    f.querySelector('[data-x2]').onclick = cerrar;
    const bc = f.querySelector('[data-cancelarduelo]');
    if(bc) bc.onclick = () => col().doc(d.id).update({estado: 'cancelado'}).catch(err => console.error(err));
    f.querySelectorAll('[data-par]').forEach(b => b.onclick = () => {
      const [q, e] = b.dataset.par.split(':');
      f.querySelectorAll('[data-par]').forEach(x => x.disabled = true);
      elegirParidad(d.id, q, e).catch(err => { console.error(err); _toast('No se pudo tirar el desempate'); });
    });
    f.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => {
      const campo = b.dataset.tirar;
      b.disabled = true; b.textContent = 'Tirando…';
      enviar(campo === 'pdg' || campo === 'fuerza' ? d.atacante : d.defensor, {tipo: 'duelo-tirar', id: d.id, campo});
      setTimeout(() => { if(actual && actual.dato && !actual.dato[campo]) dibujar(); }, 8000);
    });
    f.querySelectorAll('[data-def]').forEach(b => b.onclick = () => {
      const o = (opciones[d.id] || [])[Number(b.dataset.def)];
      if(!o) return;
      f.querySelectorAll('[data-def]').forEach(x => x.disabled = true);
      enviar(d.defensor, {tipo: 'duelo-tirar', id: d.id, campo: 'eva', modo: o.modo, itemId: o.itemId || ''});
      setTimeout(() => { if(actual && actual.dato && !actual.dato.eva){ opcionesPedidas.delete(d.id); dibujar(); } }, 8000);
    });
    f.querySelectorAll('[data-tirarpor]').forEach(b => b.onclick = () => tirarPorAusente(d, b.dataset.tirarpor));
    f.querySelectorAll('[data-ef-tirar]').forEach(b => b.onclick = () => { b.disabled = true; b.textContent = 'Tirando…'; tirarEfecto(d.id, Number(b.dataset.efTirar)).catch(err => { console.error(err); _toast('No se pudo tirar el efecto'); }); });
    f.querySelectorAll('[data-ef-aplicar]').forEach(b => b.onclick = () => { b.disabled = true; marcarEfecto(d.id, Number(b.dataset.efAplicar), {aplicar: 'pedido'}).catch(err => { console.error(err); _toast('No se pudo pedir la aplicación'); }); });
    f.querySelectorAll('[data-ef-mano]').forEach(b => b.onclick = () => { b.disabled = true; marcarEfecto(d.id, Number(b.dataset.efMano), {aplicado: true, aplicar: '', nota: 'a mano'}).catch(err => console.error(err)); });
    const bft = f.querySelector('[data-ef-terminar]');
    if(bft) bft.onclick = () => terminarEfectos(d.id).catch(err => console.error(err));
    const bdt = f.querySelector('[data-dano-tirar]');
    if(bdt) bdt.onclick = () => { bdt.disabled = true; bdt.textContent = 'Tirando…'; enviar(d.atacante, {tipo: 'duelo-tirar', id: d.id, campo: 'dano'}); setTimeout(() => { if(actual && actual.dato && !actual.dato.dano) dibujar(); }, 8000); };
    const bam = f.querySelector('[data-aplicar-mano]');
    if(bam) bam.onclick = () => { const v = Math.max(0, Math.round(_num((f.querySelector('[data-manual="recibido"]') || {}).value))); guardarAplicacion(d.id, {manual: true, golpe: v, recibido: v, mult: 1, crudo: d.dano.crudo, motivoManual: 'lo aplicó el GM a mano'}).catch(err => console.error(err)); };
    const bcr = f.querySelector('[data-critico]');
    if(bcr) bcr.onclick = () => { bcr.disabled = true; bcr.textContent = 'Tirando…'; tirarCritico(d.id).catch(err => { console.error(err); _toast('No se pudo tirar el crítico'); }); };
    const bcon = f.querySelector('[data-contra]');
    if(bcon) bcon.onclick = () => { bcon.disabled = true; enviar(d.defensor, {tipo: 'duelo-contra', id: d.id}); };
  }

  /* ---------- las tiradas: lo que corre en la página del dueño (iframe del mapa o página suelta) ---------- */
  const RE_CAMPO = {pdg: /pdg/i, eva: /evasi|parry/i, fuerza: /fuerza/i, bloqueo: /bloqueo/i, dano: /da[ñn]o/i};

  async function ejecutar(m){
    const h = hooks();
    if(!h || !disponible()) return;
    try{
      const doc = await col().doc(m.id).get();
      if(!doc.exists) return;
      const d = {id: m.id, ...doc.data()};
      if(m.tipo === 'duelo-opciones'){
        if(!h.soy || !h.soy(d.defensor)) return;
        const ops = (h.opcionesDefensa ? h.opcionesDefensa(d) : []) || [];
        if(enIframe()) window.parent.postMessage({tipo: 'duelo-opciones-res', id: d.id, opciones: ops}, location.origin);
        else recibirOpciones(d.id, ops);
        return;
      }
      if(m.tipo === 'duelo-contra'){
        if(!h.soy || !h.soy(d.defensor) || !h.armaContra || d.resultado !== 'bloqueado' || d.contra) return;
        const arma = h.armaContra(d) || {};
        const tok = {id: d.atacante.tokenId, nombre: d.atacante.nombre, tipo: d.atacante.tipo, fichaId: d.atacante.ref, duenoUid: d.atacante.uid};
        const nid = await crear({yo: {ref: d.defensor.ref, tipo: d.defensor.tipo, nombre: d.defensor.nombre}, ataque: {tipo: 'contra', armaId: arma.armaId || '', armaNombre: arma.armaNombre || '', tipoDado: arma.tipoDado || 8}}, tok, d.defensor.tokenId, d.id);
        await col().doc(d.id).update({contra: nid});
        return;
      }
      if(m.tipo !== 'duelo-tirar') return;
      const campo = m.campo;
      const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
      const fase = (campo === 'pdg' || campo === 'eva') ? 'contacto' : campo === 'dano' ? 'dano' : 'bloqueo';
      if(!h.soy || !h.soy(lado) || d[campo] || d.estado !== 'esperando' || d.fase !== fase) return;
      document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));   // sin la Botonera abierta debajo
      let defensa = null;
      if(campo === 'eva'){
        const op = (h.opcionesDefensa ? h.opcionesDefensa(d) : []).find(o => o.modo === m.modo && (o.itemId || '') === (m.itemId || ''));
        if(!op || op.motivoNo) return;
        defensa = {modo: op.modo, itemId: op.itemId || '', itemNombre: op.itemNombre || '', costo: _num(op.costo)};
      }
      let extra = null;
      if(campo === 'pdg' && h.statsCritico) extra = h.statsCritico(d) || null;
      if(campo === 'eva' && h.resistenciaCritico) extra = {resistencia: _num(h.resistenciaCritico(d))};
      if(campo === 'dano') extra = {efectos: h.efectosArma ? (h.efectosArma(d) || []) : []};
      esperaTiro = {id: d.id, campo, re: campo === 'eva' ? (m.modo === 'parry' ? /parry/i : /evasi/i) : RE_CAMPO[campo], defensa, extra};
      if(campo === 'pdg') h.atacar(d);
      else if(campo === 'eva') h.defender(d, m.modo, m.itemId || '');
      else if(campo === 'fuerza') h.fuerza(d);
      else if(campo === 'dano') h.dano(d);
      else h.bloquear(d);
      setTimeout(avisarMapaUi, 350);
    }catch(err){
      console.error('Duelo: no se pudo ejecutar el pedido', err);
      esperaTiro = null;
      _toast('No se pudo tirar: ' + (err.message || err));
      avisarMapaUi();
    }
  }

  window.addEventListener('tirada-registrada', e => {
    if(!esperaTiro) return;
    const det = e.detail || {}, r = det.r || {};
    if(!esperaTiro.re.test(String(det.origen || ''))) return;
    const {id, campo, defensa, extra} = esperaTiro;
    esperaTiro = null;
    (campo === 'dano' ? guardarDano(id, r, extra && extra.efectos) : guardarTiro(id, campo, r, defensa, extra)).catch(err => { console.error('Duelo: no se pudo guardar la tirada', err); _toast('No se pudo anotar la tirada en el duelo'); })
      .then(() => avisarMapaUi());
  });

  // Adentro de un iframe del mapa: le cuenta si hay algún cartelito abierto (Nitros, sobrepeso…) que el jugador tiene que ver, o si ya puede esconderse.
  function avisarMapaUi(){
    if(!enIframe()) return;
    const abiertoUi = !!document.querySelector('.scrim.open, #ep-fondo, #ae-fondo');
    window.parent.postMessage({tipo: abiertoUi ? 'duelo-ui-visible' : 'botonera-cerrada'}, location.origin);
  }

  window.addEventListener('message', e => {
    if(e.origin !== location.origin || !e.data) return;
    const m = e.data;
    if(m.tipo === 'duelo-suelto' && pendienteSuelto){   // el mapa: «Sin objetivo · tirada suelta»
      const f = pendienteSuelto; pendienteSuelto = null;
      f();
      return;
    }
    if(m.tipo === 'duelo-cancelado'){ pendienteSuelto = null; return; }
    if(m.tipo === 'duelo-opciones' || m.tipo === 'duelo-tirar' || m.tipo === 'duelo-contra') ejecutar(m);
  });

  // A mano: el GM (o el dueño) escribe el valor del stat y se tira con dados.
  function tirarPorAusente(d, campo){
    const input = document.querySelector(`[data-manual="${campo}"]`);
    const valor = Math.round(_num(input ? input.value : manual[campo]));
    const f = typeof formulaParaValor === 'function' ? formulaParaValor(valor) : null;
    if(!f){ _toast('Escribí el valor del stat (un número mayor que 0)'); return; }
    const rolls = f.combo.map(x => 1 + Math.floor(Math.random() * x));
    const total = rolls.reduce((a, b) => a + b, 0) + f.mod;
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    const selModo = document.querySelector('[data-manual-modo]');
    const modo = campo === 'eva' && selModo ? selModo.value : 'evasion';
    const defensa = campo === 'eva' ? {modo, itemId: '', itemNombre: '', costo: 0} : null;
    const etiqueta = campo === 'eva' ? (modo === 'parry' ? 'Parry' : 'Evasión') : ETIQ[campo];
    const r = {formula: f.formula, rolls, mod: f.mod, total};
    if(typeof mesaPublicar === 'function'){ try{ mesaPublicar(`${lado.nombre} · ${etiqueta} (a mano)`, r); }catch(err){} }
    (campo === 'dano' ? guardarDano(d.id, r) : guardarTiro(d.id, campo, r, defensa)).catch(err => { console.error(err); _toast('No se pudo anotar la tirada en el duelo'); });
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
      if(abierto(d) && ahora - t > VIGENCIA_MS) return;
      if(d.estado === 'resuelto' && ahora - t > RESUELTO_VISIBLE_MS) return;
      if(d.estado === 'cancelado') return;
      const abiertoAhora = actual && actual.id === d.id && !actual.min;
      if(abiertoAhora) return;
      mostrar.set(d.id, d);
    });
    if(actual && actual.min && actual.dato && !mostrar.has(actual.id)) mostrar.set(actual.id, actual.dato);
    [...chips.keys()].forEach(id => { if(!mostrar.has(id)){ chips.get(id).remove(); chips.delete(id); } });
    const RES = {pego: '⚔ Pegó', fallo: '🛡 Falló', bloqueado: '🛡 Bloqueó', mitad: '⚠ Pasó la mitad'};
    const critico = d => d.resultado === 'pego' && d.crit && d.crit.critico && d.crit.mult > 1;
    mostrar.forEach((d, id) => {
      const txt = d.estado === 'resuelto'
        ? `${critico(d) ? '💥 ¡CRÍTICO ×' + d.crit.mult + '!' : (RES[d.resultado] || 'Resuelto')}: ${d.atacante.nombre} → ${d.defensor.nombre} · ver`
        : d.fase === 'critico' ? `💥 Crítico: ${d.atacante.nombre} → ${d.defensor.nombre} · tirar d20`
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

  // cfg.aplicarEfecto(duelo, efecto) → {nota, manual?} (solo el mapa del GM): pone el estado del efecto sobre el defensor.
  // cfg.aplicar(duelo) → info (solo el mapa del GM): aplica el daño al HP del defensor y devuelve lo que pasó.
  // cfg.relay(lado, mensaje) (el mapa): cómo mandarle un pedido al iframe de la ficha o de las Acciones del dueño de ese lado.
  function escuchar(cfg){
    if(escuchando || !disponible()) return;
    cfgEscuchar = cfg || {};
    escuchando = col().where('estado', 'in', ['esperando', 'empate', 'resuelto']).onSnapshot(snap => {
      listaDuelos = snap.docs.map(doc => ({id: doc.id, ...doc.data()}));
      const ahora = Date.now();
      // Un duelo nuevo se abre solo para todos los conectados; si ya hay otro abierto y sin resolver, queda el botón.
      listaDuelos.forEach(d => {
        if(d.estado !== 'esperando' || descartados.has(d.id) || autoAbiertos.has(d.id)) return;
        const t = d.creado && d.creado.toMillis ? d.creado.toMillis() : ahora;
        if(ahora - t > AUTOABRIR_MS) return;
        autoAbiertos.add(d.id);
        if(!actual || (actual.dato && (actual.dato.estado === 'resuelto' || actual.dato.estado === 'cancelado'))) abrir(d.id);
      });
      dibujarChips();
      listaDuelos.forEach(publicarResumenSiCorresponde);   // el resumen final en la Mesa
      // El GM (en el mapa) aplica el daño al HP apenas el atacante lo tira.
      if(cfgEscuchar.aplicar && soyGM()){
        listaDuelos.forEach(d => {
          if(d.fase !== 'dano' || !d.dano || d.dano.aplicado || d.dano.reclamado || aplicando.has(d.id)) return;
          aplicando.add(d.id);
          reclamarAplicacion(d.id).then(async mio => {
            if(!mio) return;
            let info;
            try{ info = await cfgEscuchar.aplicar(d); }
            catch(err){ console.error('Duelo: no se pudo aplicar el daño', err); info = {manual: true, motivoManual: 'no se pudo aplicar solo'}; }
            const crit = d.resultado === 'pego' && d.crit && d.crit.mult > 1;
            await guardarAplicacion(d.id, {golpe: 0, ...info});
          }).catch(err => console.error('Duelo: error al aplicar el daño', err));
        });
      }
      // El GM (en el mapa) aplica los efectos que el atacante pidió («Aplicar»).
      if(cfgEscuchar.aplicarEfecto && soyGM()){
        listaDuelos.forEach(d => {
          if(d.fase !== 'efectos') return;
          (d.efectos || []).forEach((ef, i) => {
            const clave = d.id + ':' + i;
            if(ef.aplicar !== 'pedido' || ef.aplicado || aplicando.has(clave)) return;
            aplicando.add(clave);
            reclamarEfecto(d.id, i).then(async mio => {
              if(!mio) return;
              let info;
              try{ info = await cfgEscuchar.aplicarEfecto(d, ef); }
              catch(err){ console.error('Duelo: no se pudo aplicar el efecto', err); info = {manual: true, nota: 'no se pudo aplicar solo: hacelo a mano'}; }
              await marcarEfecto(d.id, i, {aplicado: true, aplicar: '', nota: String(info.nota || (info.manual ? 'a mano' : '')).slice(0, 120)});
            }).catch(err => console.error('Duelo: error al aplicar el efecto', err));
          });
        });
      }
    }, err => console.error('Duelo: error escuchando los duelos', err));
    limpiarViejos();
  }

  async function limpiarViejos(){
    if(!soyGM()) return;
    try{
      const corte = firebase.firestore.Timestamp.fromMillis(Date.now() - 24 * 3600 * 1000);
      const snap = await col().where('creado', '<', corte).limit(30).get();
      await Promise.all(snap.docs.map(d => d.ref.delete()));
    }catch(e){ /* sin permiso o sin reglas nuevas: no pasa nada */ }
  }

  return {disponible, elegirObjetivo, crear, abrir, cerrar, minimizar, escuchar, recibirOpciones, specDeEfecto};
})();
