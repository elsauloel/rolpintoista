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
  const CAMPOS_ESCRIBIBLES = ['estado', 'fase', 'defensa', 'pdg', 'eva', 'fuerza', 'bloqueo', 'contacto', 'bloq', 'resultado', 'empate', 'critDatos', 'crit', 'dano', 'efectos', 'rerollUsado', 'resumido'];

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
  let aplicando = new Set();
  let grupoAvisado = new Set();   // ids de sub-duelos de área ya avisados a cfgEscuchar.grupoResuelto (no avisar dos veces)
  let dodgeActivos = new Set();   // ids de duelos con fase 'dodge' ya avisados a cfgEscuchar.dodgeEmpieza (para saber cuándo avisar dodgeTermina)
  const retener = on => { window.DUELO_RETENER = !!on; if(on) setTimeout(() => { window.DUELO_RETENER = false; }, 20000); };   // la Mesa no publica la tirada mientras está prendido   // duelos cuyo daño está aplicando esta pestaña (GM)

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
.duelo-opc small.duelo-info{font-size:13px;font-weight:700;opacity:1;color:#dfe8ff;margin-top:2px}
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
.duelo-ef-tablero table{width:100%;border-collapse:collapse;font-size:14px}
.duelo-ef-tablero th{text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8d97ad;padding:2px 6px 6px}
.duelo-ef-tablero td{padding:7px 6px;border-top:1px solid #2f3852;vertical-align:middle}
.duelo-ef-tablero .hint{color:#ffd25a;font-size:12px}
.duelo-ef-tablero .ok{color:#8fe3a9;font-weight:800}
.duelo-ef-tablero .no{color:#9aa4bd;font-weight:700}
.duelo-dado{display:inline-block;min-width:28px;text-align:center;font-size:18px;padding:2px 6px;border-radius:8px;background:#1d2a4a;border:1px solid #5aa7e8;color:#fff}
.duelo-dado.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
.duelo-dado.ok{font-size:26px;min-width:40px;padding:4px 8px;background:radial-gradient(circle at 50% 35%,#7a5a12,#3d2c08);border:2px solid #ffd25a;color:#fff6d8;box-shadow:0 0 14px rgba(255,190,60,.75);animation:duelo-brillo 1.4s ease-in-out infinite}
.duelo-dado.ok.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both,duelo-brillo 1.4s ease-in-out .55s infinite}
.duelo-funciono{font-size:15px;letter-spacing:.03em;text-shadow:0 0 10px rgba(79,206,124,.7)}
.duelo-funciono.nuevo{display:inline-block;animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) .15s both}
@keyframes duelo-brillo{0%,100%{box-shadow:0 0 8px rgba(255,190,60,.55)}50%{box-shadow:0 0 22px rgba(255,190,60,1),0 0 4px #fff inset}}
.duelo-danobox{margin-top:10px;text-align:center;border-radius:12px;padding:14px;background:rgba(0,0,0,.25);border:1px solid #39435c}
.duelo-danobox.crit{border-color:#ff5a5a;background:radial-gradient(circle at 50% 30%,rgba(120,20,20,.55),rgba(40,8,8,.6))}
.duelo-danonum{font-size:96px;font-weight:900;line-height:1;animation:duelo-num .6s ease-out both}
.duelo-danonum.rojo{color:#ff4d4d;text-shadow:0 0 24px rgba(255,60,60,.7)}
.duelo-danonum.inv{font-size:40px;color:#9ad0ff}
.duelo-danosub{font-size:14px;color:#cfd6ea;margin-top:4px}
.duelo-danosub.rojo{font-size:26px;font-weight:900;letter-spacing:.12em;color:#ff4d4d}
#duelo-fondo [data-dano-tirar],#duelo-fondo [data-critico]{background:#2d6cdf;color:#fff;border:2px solid #8db3ff;border-radius:12px;padding:14px 28px;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(45,108,223,.5)}
#duelo-fondo [data-dano-tirar]:hover,#duelo-fondo [data-critico]:hover{background:#3b7bf0}
#duelo-fondo [data-dano-tirar]:disabled,#duelo-fondo [data-critico]:disabled{opacity:.5;cursor:default}
.duelo-crit-titulo{text-align:center;font-size:30px;font-weight:900;letter-spacing:.04em;padding:10px 0 4px}
.duelo-crit-titulo.no{color:#9aa4bd}
.duelo-crit-titulo.posible{color:#ffd25a}
.duelo-crit-titulo.si{color:#ffd25a;text-shadow:0 0 14px rgba(255,190,60,.7)}
.duelo-crit-explica{text-align:center;font-size:13px;color:#aab3ca;line-height:1.5;margin-bottom:6px}
.duelo-crit-viz{margin:8px 0 4px}
.duelo-crit-viz-tit{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9aa4bd;margin:8px 0 5px}
.duelo-crit-viz-tit:first-child{margin-top:0}
.duelo-crit-fila{display:flex;flex-wrap:wrap;align-items:center}
.duelo-crit-cinco{display:flex;gap:2px;margin:0 7px 4px 0}
.duelo-crit-cuad{width:20px;height:20px;border-radius:4px;background:#1d2335;border:1px solid #39435c;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;color:#9aa4bd;flex:none;position:relative}
.duelo-crit-cuad.frec{background:#1f6b3a;border-color:#5fd08a;color:#e6ffee}
.duelo-crit-cuad.eva{background:#3b1820;border-color:#d95a6e;color:#ffe3e7}
.duelo-crit-cuad.activo{background:#2d6cdf;border-color:#8db3ff;color:#fff}
.duelo-crit-cuad.suelto{background:#12172a;border-color:#2b3347;color:#565f78}
.duelo-crit-cuad.anulado{background:#2d6cdf;border-color:#8db3ff}
.duelo-crit-cuad.anulado::after{content:'';position:absolute;inset:0;border-radius:3px;background:linear-gradient(135deg,transparent 44%,#ffd25a 47%,#ffd25a 53%,transparent 56%)}
.duelo-crit-leyenda{display:flex;flex-wrap:wrap;gap:5px 16px;margin-top:6px}
.duelo-crit-ref{display:flex;align-items:center;gap:6px;font-size:11.5px;color:#9aa4bd}
.duelo-crit-ref .duelo-crit-cuad{width:16px;height:16px;font-size:7px}
.duelo-d20s{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-items:center;margin:12px 0 8px}
.duelo-d20{width:44px;height:44px;border-radius:10px;background:#12172a;border:1px solid #39435c;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;color:#9aa4bd;position:relative}
.duelo-d20.nuevo{animation:duelo-d20in .45s cubic-bezier(.2,1.6,.4,1) both}
.duelo-d20.mejor{width:58px;height:58px;font-size:28px;color:#fff3c9;background:radial-gradient(circle,#8a5a12,#4a2a08);border:2px solid #ffd25a;z-index:1;box-shadow:0 0 18px rgba(255,190,60,.7)}
.duelo-d20.mejor::before,.duelo-d20.mejor::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px solid #ffd25a;opacity:0;pointer-events:none;animation:duelo-onda 1.8s ease-out infinite}
.duelo-d20.mejor::after{animation-delay:.9s}
@keyframes duelo-onda{0%{transform:scale(.7);opacity:.95}100%{transform:scale(2.6);opacity:0}}
@keyframes duelo-d20in{0%{transform:scale(0) rotate(-180deg);opacity:0}100%{transform:none;opacity:1}}
.duelo-fin{text-align:center;border:2px solid #8db3ff;background:linear-gradient(180deg,#1b2a4a,#131c33);border-radius:14px;padding:16px 14px}
.duelo-fin .grande{font-size:34px;font-weight:900;letter-spacing:.06em;color:#dbe7ff}
.duelo-fin .chico{font-size:13px;color:#aab3ca;margin:4px 0 12px}
.duelo-fin button{background:#2d6cdf;color:#fff;border:2px solid #8db3ff;border-radius:12px;padding:13px 30px;font-size:18px;font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(45,108,223,.5)}
.duelo-fin.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
.duelo-tabla{width:100%;border-collapse:collapse;margin:8px 0 0;font-size:14px}
.duelo-tabla th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#9aa4bd;text-align:left;padding:4px 8px}
.duelo-tabla td{padding:6px 8px;border-top:1px solid #2b3347}
.duelo-tabla tr.mod td{color:#ffd25a}
.duelo-tabla tr.gano td{background:rgba(255,210,90,.18);font-weight:800;color:#fff3c9}
.duelo-veredicto.critico{background:radial-gradient(circle at 50% 30%,#8a5a12,#4a2a08 70%);border:3px solid #ffd25a;color:#fff3c9;box-shadow:0 0 40px rgba(255,190,60,.55),inset 0 0 30px rgba(255,210,90,.25)}
.duelo-veredicto.critico .grande{font-size:64px;letter-spacing:.06em;text-shadow:0 0 18px #ffb400,0 3px 0 #7a4a00}
.duelo-veredicto.critico .mult{font-size:34px;font-weight:900;color:#ffd25a;margin-top:2px}
.duelo-veredicto.critico .chispas{font-size:26px}
.duelo-veredicto.critico.nuevo{animation:duelo-golpe .55s cubic-bezier(.2,1.6,.4,1) both}
/* El latido va en el paso en curso (el que espera una acción), no en el veredicto. */
.duelo-paso.activo{border-color:#6fa8ff;animation:duelo-latido 1.4s ease-in-out infinite alternate}
.duelo-paso.activo h4{color:#cfe0ff}
/* El botón que hay que apretar ahora brilla y late. */
.duelo-tiro button:not(.sec):not(:disabled),.duelo-ef button:not(:disabled),.duelo-contra button:not(.sec):not(:disabled),.duelo-pie button:not(.sec):not(:disabled),.duelo-fin button:not(:disabled),.duelo-par button{animation:duelo-boton 1.2s ease-in-out infinite alternate}
@keyframes duelo-boton{0%{box-shadow:0 0 4px rgba(90,150,255,.3);filter:brightness(1)}100%{box-shadow:0 0 22px 4px rgba(110,170,255,.95);filter:brightness(1.25)}}
.viva,.duelo-nota.viva,.espera.duelo-reroll{position:fixed;right:22px;bottom:22px;z-index:99100;background:#3a2f12;color:#ffe9a8;border:2px solid #d9b45a;border-radius:16px;padding:12px 18px;font-size:17px;font-weight:800;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.6),0 0 22px rgba(255,190,60,.55);animation:duelo-latido 1.6s ease-in-out infinite alternate;text-align:center}
.duelo-reroll small{display:block;font-size:11.5px;font-weight:500;opacity:.9}
#duelo-fondo.min .duelo-reroll{display:none}
.duelo-flash{margin-top:8px;display:flex;flex-direction:column;gap:6px;align-items:stretch}
.duelo-flash button.flash{background:#3a2f12;color:#ffe9a8;border:1px solid #d9b45a;font-size:14px}
.duelo-flash button.flash small{display:block;font-weight:500;font-size:11px;opacity:.85}
.duelo-flash button.flash.on{background:#8a5a12;box-shadow:0 0 16px rgba(255,190,60,.7)}
.duelo-flash button.flash:disabled{opacity:.45}
.viva{display:block;margin:6px auto;padding:10px 14px;border-radius:10px;color:#dfeaff!important;font-style:normal!important;font-weight:700;background:rgba(80,140,255,.14);border:1px solid rgba(110,170,255,.5);animation:duelo-latido 1.4s ease-in-out infinite alternate}
.duelo-paso.activo h4 .n{background:#2d6cdf}
@keyframes duelo-latido{0%{box-shadow:0 0 6px rgba(80,140,255,.25),inset 0 0 8px rgba(80,140,255,.06)}100%{box-shadow:0 0 30px rgba(80,150,255,.75),inset 0 0 22px rgba(80,150,255,.22)}}
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
    // Un hechizo de área (Paso 4/7 del casteo) necesita la geometría del mapa (marcar el centro, calcular quién
    // queda adentro): sin el mapa abierto no hay forma de resolverlo — ni siquiera la lista de "a quién apunta".
    if(cfg.ataque && cfg.ataque.hab && (cfg.ataque.hab.objetivo === 'area' || cfg.ataque.hab.objetivo === 'onda' || cfg.ataque.hab.objetivo === 'cono')){ _toast('Las habilidades de área se lanzan desde el mapa (abrilo para ejecutar esta habilidad)'); return; }
    // Sobre uno mismo (bug real, 2026-09-29 — reportado con Blindaje ejecutado desde la ficha suelta, fuera del
    // mapa): el mapa ya tenía este atajo (dueloElegirObjetivoMapa), pero acá faltaba — sin él, elegirObjetivoLista
    // mostraba "¿A quién atacás?" con la lista de TODOS los demás tokens (ni siquiera incluye el propio, porque
    // la lista se arma filtrando `!propio(t)`), así que una habilidad "a uno mismo" no tenía forma de aplicarse
    // sobre quien la usó — solo sobre quien se eligiera por error.
    if(cfg.ataque && cfg.ataque.hab && cfg.ataque.hab.objetivo === 'uno mismo'){ elegirObjetivoUnoMismo(cfg); return; }
    elegirObjetivoLista(cfg);
  }

  async function elegirObjetivoUnoMismo(cfg){
    let lista = [];
    try{ lista = await tokensDelMapa(); }catch(err){ console.error('Duelo: no se pudieron leer los tokens', err); }
    const mio = lista.find(t => t.fichaId === cfg.yo.ref && t.tipo === cfg.yo.tipo);
    if(!mio){ _toast('No encontré tu token en el mapa: abrilo para ejecutar esta habilidad'); return; }
    try{ await crear(cfg, mio, mio.id); }
    catch(err){
      console.error('Duelo: no se pudo crear', err);
      _toast(err && err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore (duelos)' : 'No se pudo abrir el duelo: ' + (err.message || err));
    }
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
    cuerpo.innerHTML = `<div class="duelo-nota">${_esc(cfg.ataque.habNombre || NOMBRE_ATAQUE[cfg.ataque.tipo] || 'Ataque')}${cfg.ataque.armaNombre ? ' con ' + _esc(cfg.ataque.armaNombre) : ''}. Elegí el token al que va dirigido:</div>
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

  /* «Por la espalda» (2026-10-03, pedido del dueño): el mapa avisa (`cfg.espalda`) si el atacante está en el punto ciego del defensor (la
     misma cuña ciega de la visión) y está EN SIGILO —si lo ve, se da vuelta— y el ataque trae el bono de su arma o habilidad (`cfg.ataque.espalda` = {pdg, fijo, critpot}). Queda en
     `ataque.porLaEspalda` y `ataque.espalda`, y se suma acá mismo, igual para todos: el PdG al guardarlo, el daño fijo al guardar el daño y el
     Crítico potente al evaluar el crítico. */
  function limpiarEspalda(e){
    const o = {pdg: Math.max(0, Math.round(_num(e && e.pdg))), fijo: Math.max(0, Math.round(_num(e && e.fijo))), critpot: Math.max(0, Math.round(_num(e && e.critpot)))};
    return (o.pdg || o.fijo || o.critpot) ? o : null;
  }
  const espaldaTxt = e => [e.pdg ? `+${e.pdg} PdG` : '', e.fijo ? `+${e.fijo} de daño` : '', e.critpot ? `+${e.critpot} Crítico potente` : ''].filter(Boolean).join(', ');
  // tokDef = un token del mapa ({id, nombre, tipo, fichaId, duenoUid}); miTokenId = el token del atacante (o ''); contraDe = id del duelo que se contraataca.
  async function crear(cfg, tokDef, miTokenId, contraDe){
    const hab = limpiarHab(cfg.ataque.hab);
    const inicial = {
      estado: 'esperando', fase: 'contacto',
      atacante: {ref: String(cfg.yo.ref), tipo: cfg.yo.tipo, nombre: String(cfg.yo.nombre || '').slice(0, 40), uid: cfg.yo.uid || yo(), tokenId: miTokenId || ''},
      defensor: {ref: String(tokDef.fichaId || ''), tipo: tokDef.tipo, nombre: String(tokDef.nombre || '').slice(0, 40), uid: String(tokDef.duenoUid || ''), tokenId: tokDef.id},
      ataque: hab ? {tipo: 'habilidad', armaId: '', armaNombre: hab.nombre, tipoDado: 0, rango: true}
        : cfg.ataque.tipo === 'habilidad-arma' ? {tipo: 'habilidad-arma', habNombre: txtCorto(cfg.ataque.habNombre, 60), armaId: String(cfg.ataque.armaId || ''), armaNombre: String(cfg.ataque.armaNombre || '').slice(0, 60), tipoDado: _num(cfg.ataque.tipoDado), rango: !!cfg.ataque.rango,
          sinParry: !!cfg.ataque.sinParry, mods: {pdg: _num(cfg.ataque.mods && cfg.ataque.mods.pdg), dados: Math.max(0, Math.round(_num(cfg.ataque.mods && cfg.ataque.mods.dados))), fijo: _num(cfg.ataque.mods && cfg.ataque.mods.fijo), ignoraResistCrit: Math.max(0, Math.round(_num(cfg.ataque.mods && cfg.ataque.mods.ignoraResistCrit))),
            critBono: Math.max(0, Math.round(_num(cfg.ataque.mods && cfg.ataque.mods.critBono))), critpotBono: Math.max(0, Math.round(_num(cfg.ataque.mods && cfg.ataque.mods.critpotBono)))}, efectos: limpiarEfectos(cfg.ataque.efectos),
          ...(cfg.ataque.efectosNota ? {efectosNota: txtCorto(cfg.ataque.efectosNota, 200)} : {}),
          // ⚡ Critical Matters (2026-09-29): efectos/nota que solo cuentan si el golpe es crítico (ver
          // entrarCritico/efectosHtml) — mismo saneo que los de siempre, adentro de un campo aparte.
          ...(cfg.ataque.critico ? {critico: {
            ...(cfg.ataque.critico.efectos && cfg.ataque.critico.efectos.length ? {efectos: limpiarEfectos(cfg.ataque.critico.efectos)} : {}),
            ...(cfg.ataque.critico.efectosNota ? {efectosNota: txtCorto(cfg.ataque.critico.efectosNota, 200)} : {}),
          }} : {})}
        : {tipo: cfg.ataque.tipo, armaId: String(cfg.ataque.armaId || ''), armaNombre: String(cfg.ataque.armaNombre || '').slice(0, 60), tipoDado: _num(cfg.ataque.tipoDado), rango: !!cfg.ataque.rango},
      defensa: null, pdg: null, eva: null, fuerza: null, bloqueo: null, contacto: null, bloq: null, empate: null, resultado: null, critDatos: null, crit: null, dano: null, efectos: null, contra: null,
      contraDe: contraDe || '',
      creadoPor: yo(),
      creado: firebase.firestore.FieldValue.serverTimestamp(),
    };
    // Hechizo de área (dicho por el dueño, 2026-09-27): el casteador tira su PdG.Esp/PdG UNA SOLA VEZ para toda la
    // cascada; cada objetivo tira su Evasión individualmente contra esa MISMA tirada. `cfg.pdgCompartido` (la tirada
    // ya resuelta del primer objetivo) llega precargada acá, así que este sub-duelo arranca con el contacto ya
    // "medio hecho" — nada más pide la Evasión de este objetivo (mismo camino que cuando un lado tira antes que el otro).
    if(cfg.pdgCompartido) inicial.pdg = limpiarTiro(cfg.pdgCompartido);
    if(cfg.espalda && !hab){
      inicial.ataque.porLaEspalda = true;
      const be = limpiarEspalda(cfg.ataque.espalda);
      if(be) inicial.ataque.espalda = be;
    }
    if(hab){
      inicial.hab = hab;   // (la regla de Firestore tiene que conocer el campo `hab`)
      if(hab.sinOposicion){ inicial.resultado = 'pego'; entrarHab(inicial); }   // sin oposición: el cuadro se abre directo en los efectos
    }
    if(cfg.grupo) inicial.grupo = limpiarGrupo(cfg.grupo);   // hechizo de área (Paso 4/7): ata este sub-duelo a la cascada (docs/reglas-casteo.md §1.3)
    const ref = await col().add(inicial);
    autoAbiertos.add(ref.id);
    if(!enIframe()) abrir(ref.id);   // adentro de un iframe del mapa el cuadro no se abre: lo abre el mapa (y el de todos)
    return ref.id;
  }

  /* ---------- habilidades dirigidas (2026-09-27, docs/duelo-de-habilidades.md) ----------
     El mismo duelo sirve para una habilidad con objetivo: `hab` describe la contienda.
       hab = {nombre, objetivo: 'enemigo'|'aliado'|'uno mismo',
              tira: {stat, etq, bono}|null,                       ← lo que tira quien la usa (PdG.Esp, Fuerza…)
              contra: [{modo, stat, etq}],                        ← lo que puede tirar el objetivo (elige a ciegas si hay más de una); [] = sin oposición
              dano: {formula, tipo, ignoraDef}|null,              ← daño de la habilidad (el mágico ignora la Defensa y no critica)
              efectos: [{nombre, caras, exitos, dado, detalle, stacks, spec, cura}],
              sinOposicion: bool}
     Con oposición: la tirada de quien la usa va en `pdg` y la del objetivo en `eva` (mismas fases y mismo empate que el ataque); si gana quien la usa, sigue el daño (si tiene) y
     los efectos; si no, «se resistió». Sin oposición (buffs, curas): el cuadro se abre directo en los efectos, con su botón «Aplicar». */
  const nombreAtq = d => d.hab ? d.hab.nombre : (d.ataque.tipo === 'habilidad-arma' && d.ataque.habNombre ? d.ataque.habNombre : (NOMBRE_ATAQUE[d.ataque.tipo] || 'Ataque'));
  // Ataque con un arma hecho con una habilidad (Golpe brutal, Carga, Takle…): lo que la habilidad le suma al ataque, en palabras.
  const modsTxt = d => {
    const m = (d.ataque && d.ataque.mods) || {}, t = [];
    if(_num(m.pdg)) t.push(`${_num(m.pdg) > 0 ? '+' : ''}${_fmt(m.pdg)} PdG`);
    if(_num(m.dados)) t.push(`+${_fmt(m.dados)} dado${_num(m.dados) === 1 ? '' : 's'} de daño`);
    if(_num(m.fijo)) t.push(`${_num(m.fijo) > 0 ? '+' : ''}${_fmt(m.fijo)} de daño fijo`);
    if(d.ataque && d.ataque.sinParry) t.push('no se puede parrear');
    if(d.ataque && d.ataque.porLaEspalda) t.push(`🗡 por la espalda${d.ataque.espalda ? ': ' + espaldaTxt(d.ataque.espalda) : ''}`);
    return t.join(' · ');
  };
  const escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const txtCorto = (v, n) => String(v === undefined || v === null ? '' : v).trim().slice(0, n);
  function limpiarSpec(s){
    if(!s || !s.nombre) return null;
    const o = {nombre: txtCorto(s.nombre, 40)};
    if(s.turnos !== undefined && s.turnos !== null) o.turnos = Math.max(0, Math.round(_num(s.turnos)));
    if(Array.isArray(s.mods) && s.mods.length) o.mods = s.mods.slice(0, 8).map(m => ({stat: txtCorto(m.stat, 20), val: _num(m.val)})).filter(m => m.stat);
    if(_num(s.hp)) o.hp = _num(s.hp);
    if(s.polaridad === 'buff' || s.polaridad === 'debuff') o.polaridad = s.polaridad;
    if(_num(s.stacks)) o.stacks = Math.max(1, Math.round(_num(s.stacks)));
    // Escudo (2026-09-28, pedido del dueño): un efecto de la habilidad puede dar un escudo especial (Blindaje,
    // Barrera…) en vez de (o además de) un debuff — ver EstadosAplicar.BUFFS y el paso «Efectos» del 🎯.
    if(_num(s.escudoMagico)) o.escudoMagico = Math.max(0, Math.round(_num(s.escudoMagico)));
    return o;
  }
  function limpiarEfectos(lista){
    return (Array.isArray(lista) ? lista : []).slice(0, 8).map(e => ({
      nombre: txtCorto(e.nombre, 40), caras: Math.max(1, Math.round(_num(e.caras)) || 1), exitos: Math.max(1, Math.round(_num(e.exitos)) || 1), dado: txtCorto(e.dado, 20),
      detalle: txtCorto(e.detalle, 200), stacks: Math.max(0, Math.round(_num(e.stacks))), spec: limpiarSpec(e.spec), cura: Math.max(0, Math.round(_num(e.cura))),
      ...(e.no2 !== undefined ? {no2: Math.max(0, Math.round(_num(e.no2))), no2Dif: !!e.no2Dif, no2Sentado: !!e.no2Sentado} : {}),
    })).filter(e => e.nombre);
  }
  // Grupo de un hechizo de área (Paso 4/7 del casteo): ata este sub-duelo a la cascada de `campanas/<id>/areas/<grupoId>`
  // — solo lo que hace falta para dibujar/anunciar acá (el resto vive en el doc de `areas`). `indice`/`total` son 1-based.
  function limpiarGrupo(g){
    if(!g || !g.id) return null;
    return {id: txtCorto(g.id, 40), indice: Math.max(1, Math.round(_num(g.indice)) || 1), total: Math.max(1, Math.round(_num(g.total)) || 1)};
  }
  // Una tirada ya resuelta ({total, formula, rolls, mod}) que llega de afuera (ej. la PdG compartida de un hechizo de
  // área): mismo saneo que guardarTiro le hace a una tirada recién tirada, para no confiar ciego en lo que llega.
  function limpiarTiro(r){
    if(!r) return null;
    return {total: Math.round(_num(r.total)), formula: txtCorto(r.formula, 60), rolls: (Array.isArray(r.rolls) ? r.rolls : []).slice(0, 20).map(_num), mod: _num(r.mod)};
  }
  function limpiarHab(h){
    if(!h || !h.nombre) return null;
    // Tirada personalizada (2026-09-27): la fórmula ya viene resuelta (X sustituida) desde quien la crea.
    const t = h.tira && h.tira.formula ? {formula: txtCorto(h.tira.formula, 60), etq: txtCorto(h.tira.etq || 'Tirada', 30)}
      : h.tira && h.tira.stat ? {stat: txtCorto(h.tira.stat, 20), etq: txtCorto(h.tira.etq || h.tira.stat, 30), bono: _num(h.tira.bono)} : null;
    const contra = (Array.isArray(h.contra) ? h.contra : []).slice(0, 4)
      .map(c => ({modo: txtCorto(c.modo || c.stat, 20), stat: txtCorto(c.stat || c.modo, 20), etq: txtCorto(c.etq || c.stat || c.modo, 30)})).filter(c => c.stat);
    const dano = h.dano && (String(h.dano.formula || '').trim() || h.dano.diferencia) ? {formula: txtCorto(h.dano.formula, 40), tipo: txtCorto(h.dano.tipo || 'arcano', 20), ignoraDef: h.dano.ignoraDef !== false,
      ...(h.dano.diferencia ? {diferencia: true} : {}), ...(h.dano.drena ? {drena: true, drenaTope: Math.max(0, Math.round(_num(h.dano.drenaTope)))} : {})} : null;
    const efectos = limpiarEfectos(h.efectos);
    const objetivo = ['enemigo', 'aliado', 'uno mismo', 'area', 'onda', 'cono'].includes(h.objetivo) ? h.objetivo : 'enemigo';
    return {nombre: txtCorto(h.nombre, 60), objetivo, tira: t, contra, dano, efectos, sinOposicion: !(t && contra.length),
      ...(objetivo === 'onda' && h.dodge ? {dodge: true} : {}),
      ...(h.efectoLibre ? {efectoLibre: txtCorto(h.efectoLibre, 200)} : {}),
      ...(h.efectosNota ? {efectosNota: txtCorto(h.efectosNota, 200)} : {}),
      // «Otro»: se resiste con algo que no está en la lista de stats — texto libre para que la mesa lo
      // aplique a mano (2026-09-28, pedido del dueño). No cambia sinOposicion (sigue abriéndose directo en
      // los efectos): es solo un recordatorio visible.
      ...(h.contraOtro ? {contraOtro: txtCorto(h.contraOtro, 120)} : {})};
  }
  const etqTira = d => (d.hab && d.hab.tira ? d.hab.tira.etq : 'PdG');
  const selModoHtml = d => d.hab ? (d.hab.contra || []).map(c => `<option value="${_esc(c.modo)}">${_esc(c.etq)}</option>`).join('') : '<option value="evasion">Evasión</option><option value="parry">Parry</option>';
  const etqContra = d => {
    if(d.hab){
      const c = d.defensa ? (d.hab.contra || []).find(x => x.modo === d.defensa.modo) : null;
      return c ? c.etq : ((d.hab.contra || []).length === 1 ? d.hab.contra[0].etq : 'Defensa');
    }
    return d.defensa && d.defensa.modo === 'parry' ? 'Parry' : 'Evasión';
  };
  // Las opciones de defensa de una habilidad: lo que el objetivo puede tirar contra ella (un botón por cada stat de `contra`).
  // Parry (2026-09-29, pedido del dueño: "cajas individuales, ante el posible caso de algún skill que no se pueda
  // parriar") sale como una caja más, PERO respeta la misma regla que un ataque normal — sin arma ni escudo
  // equipado no hay Parry (P121): si el objetivo no puede parriar ahora, esa caja no se ofrece, aunque la
  // habilidad la tenga marcada. `hk.puedeParry(d)` es opcional (compatibilidad hacia atrás: sin el hook, se ofrece
  // igual — hoy solo lo define ficha.html/gm-tools.html).
  function opcionesHab(d, h){
    const hk = h || hooks();
    return ((d.hab && d.hab.contra) || [])
      .filter(c => c.stat !== 'parry' || !hk || !hk.puedeParry || hk.puedeParry(d))
      .map(c => ({modo: c.modo, itemId: '', itemNombre: '', etiqueta: `🛡 ${c.etq}`, costo: 0, motivoNo: '',
        info: hk && hk.habValor ? [`${c.etq} 🎲 ${hk.habValor(d, 'defensor', c.stat) || '—'}`] : []}));
  }
  // Pasa a lo que sigue cuando quien usa la habilidad ganó la contienda (o no había): daño, efectos o fin.
  function entrarHab(m){
    // Daño «la diferencia» (2026-10-02, Drenar Vida): no se tira — es lo que quien la usa le ganó a la resistencia. Queda listo para
    // que el GM lo aplique, como si ya lo hubiera tirado.
    if(m.hab && m.hab.dano && m.hab.dano.diferencia){
      const dif = Math.max(0, Math.round(_num(m.contacto && m.contacto.dif)));
      m.dano = {crudo: dif, formula: 'la diferencia', rolls: [], mod: 0, reclamado: '', aplicado: false};
      m.efectos = normalizarEfectos(m.hab.efectos);
      entrarDano(m);
      return;
    }
    if(m.hab && m.hab.dano){ entrarDano(m); return; }
    const efs = normalizarEfectos(m.hab ? m.hab.efectos : []);
    if(efs.length){ m.efectos = efs; m.fase = 'efectos'; m.estado = 'esperando'; }
    else{ m.fase = 'fin'; m.estado = 'resuelto'; }
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
    if(par === 'contacto' && m.hab){   // habilidad dirigida: gana quien la usa → sigue; gana el objetivo → se resistió
      m.contacto = info;
      if(r.gana === 'atacante'){ m.resultado = 'pego'; entrarHab(m); }
      else if(m.grupo && ((m.hab.objetivo !== 'onda' && m.hab.objetivo !== 'cono') || m.hab.dodge)){   // (una onda solo si deja dodge: `hab.dodge`, Daño en área)   // hechizo de área (Paso 4 del casteo): ganar la Evasión no termina el duelo, gana el DERECHO a un dodge roll (la onda alrededor de quien la usa no da dodge: no hay a dónde salir)
        m.fase = 'dodge'; m.estado = 'esperando';
      }
      else{ m.resultado = 'fallo'; m.fase = 'fin'; m.estado = 'resuelto'; }
      return;
    }
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
    // "Ignora Resistencia a crítico" (2026-09-27, pedido del dueño): una habilidad tipo "ataque con mi arma, con
    // arreglos" (Golpe brutal y similares, duelo.arma.ignoraResistCrit) le resta puntos a la Resistencia del
    // defensor antes de calcular el crítico — a la vista en la cuenta y en los cuadraditos, como cualquier otra.
    const ignora = _num(m.ataque && m.ataque.mods && m.ataque.mods.ignoraResistCrit) + _num(dd.ignora);   // + lo que ignora el arma (statsCritico)
    const resistencia = Math.max(0, _num(dd.resistencia) - ignora);
    // Crítico frecuente/potente "solo esta tirada" (2026-09-29, pedido del dueño — Lisiar: el bono no puede
    // quedar como un estado de al menos 1 turno, que podría alcanzar a un ataque posterior). A diferencia de
    // un Efecto sobre uno mismo (que sí deja un estado real), esto se suma acá nomás, para ESTE golpe: no
    // escribe nada en la ficha ni en S.efectos.
    const frecuente = _num(dd.frecuente) + _num(m.ataque && m.ataque.mods && m.ataque.mods.critBono);
    const potente = _num(dd.potente) + _num(m.ataque && m.ataque.mods && m.ataque.mods.critpotBono) + _num(m.ataque && m.ataque.espalda && m.ataque.espalda.critpot);   // + por la espalda
    let e = null;
    if(typeof Critico !== 'undefined' && m.pdg && m.eva){
      e = Critico.evaluar({pdg: m.pdg.total, eva: m.eva.total, tipo: m.ataque.tipoDado, frecuente, potente, resistencia});
    }
    if(e && e.critico){
      const d20extra = Math.max(0, Math.round(_num(dd.d20)));   // el arma tira N d20 más en el crítico (2026-10-03)
      m.crit = {rango: e.rango, diferencia: e.diferencia, nivel: e.nivel, dados: e.dados + d20extra, critico: true, frecuente, potente, resistencia, d20: null, mejor: 0, mult: 1, ...(d20extra ? {d20extra} : {})};
      m.fase = 'critico';
      m.estado = 'esperando';
    }else{
      m.crit = e ? {rango: e.rango, diferencia: e.diferencia, nivel: e.nivel, dados: e.dados, critico: false, frecuente, potente, resistencia, d20: null, mejor: 0, mult: 1} : null;
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
      // Supercrítico (2026-09-30): dos o más 20 naturales suman sus ×4 (Critico.resultadoD20).
      const res = Critico.resultadoD20 ? Critico.resultadoD20(rolls, m.crit.potente) : {mejor: Math.max(...rolls), mult: Critico.multiplicador(Math.max(...rolls), m.crit.potente)};
      const mejor = res.mejor, mult = res.mult;
      m.crit = {...m.crit, d20: rolls, mejor, mult, ...(res.supercritico ? {supercritico: res.veintes} : {})};
      entrarDano(m);
      tx.update(ref, cambiosDe(m));
      const NOMBRE_MULT = {1: 'sin multiplicador: el d20 no alcanzó a multiplicar', 2: 'doble daño', 3: 'triple daño', 4: 'cuádruple daño'};
      publicar = {origen: `${m.atacante.nombre} · Crítico (${n}d20)`, r: {formula: `${n}d20`, rolls, mod: 0, total: mejor, destacar: 'max'}};
      anuncio = res.supercritico
        ? `🌟 ¡SUPERCRÍTICO! ${m.atacante.nombre} contra ${m.defensor.nombre}: ${res.veintes} veintes naturales, ×${mult}, ignora la Defensa`
        : `💥 ¡CRÍTICO! ${m.atacante.nombre} contra ${m.defensor.nombre}: ×${mult} (${NOMBRE_MULT[mult]}), ignora la Defensa`;
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
    ? [`${etqTira(m)} de ${m.atacante.nombre}`, `${etqContra(m)} de ${m.defensor.nombre}`, m.pdg, m.eva]
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
    const tiro = {total: campo === 'eva' ? Math.max(1, Math.round(_num(r.total))) : Math.round(_num(r.total)), formula: String(r.formula || '').slice(0, 60), rolls: (r.rolls || []).slice(0, 20).map(_num), mod: _num(r.mod),
      ...(r.nota ? {nota: String(r.nota).slice(0, 60)} : {})};   // lo que se sumó a la tirada (2026-10-04: «+2 contra oportunidad»): se ve en el cuadro y en la Mesa
    const fase = (campo === 'pdg' || campo === 'eva') ? 'contacto' : 'bloqueo';
    const ref = col().doc(id);
    let anuncio = '', par = null;
    await fbDb.runTransaction(async tx => {
      anuncio = ''; par = null;
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'esperando' || m.fase !== fase || m[campo]) return;   // ya resuelto, otra fase o ya tiró
      m[campo] = tiro;
      const be = campo === 'pdg' && m.ataque && m.ataque.espalda;   // por la espalda: el PdG del arma o la habilidad
      if(be && be.pdg) m.pdg = {...tiro, total: tiro.total + be.pdg, mod: tiro.mod + be.pdg, formula: `${tiro.formula} +${be.pdg} espalda`.slice(0, 60)};
      if(campo === 'eva' && defensa) m.defensa = defensa;
      if(extra && (campo === 'pdg' || campo === 'eva')) m.critDatos = {...(m.critDatos || {}), ...extra};   // Crítico frecuente/potente del atacante; Resistencia a crítico del defensor
      anuncio = avanzar(m) || '';
      tx.update(ref, cambiosDe(m));
      // Tiraron los dos: las dos tiradas van juntas a la Mesa (con los dados), como cierre del suspenso.
      const a = fase === 'contacto' ? m.pdg : m.fuerza, b = fase === 'contacto' ? m.eva : m.bloqueo;
      if(a && b){
        const nb = fase === 'contacto' ? etqContra(m) : 'Bloqueo';
        const notaDe = t => t && t.nota ? ` (${t.nota})` : '';
        par = [{origen: `${m.atacante.nombre} · ${fase === 'contacto' ? etqTira(m) : 'Fuerza del golpe'}${notaDe(a)}`, r: a}, {origen: `${m.defensor.nombre} · ${nb}${notaDe(b)}`, r: b}];
      }
    });
    // Las dos tiradas se publican a la vez para que los dos juegos de dados 3D rueden juntos.
    if(par && typeof mesaPublicar === 'function'){ await Promise.all(par.map(x => { try{ return mesaPublicar(x.origen, {formula: x.r.formula, rolls: x.r.rolls, mod: x.r.mod, total: x.r.total}); }catch(err){ return null; } })); }
    anunciarMesa(anuncio);
  }

  // Resuelve el dodge roll de un hechizo de área (Paso 4/7 del casteo): `logroSalir` lo decide quien lo pide
  // (el mapa lo calcula solo comparando la posición actual del token con el centro/radio del grupo; sin mapa,
  // el GM lo puede marcar a mano — "ayuda, no bloquea"). Si logró salir, el duelo termina sin efecto ("SE
  // RESISTIÓ"); si sigue adentro (perdió la Evasión, no se movió, no le alcanzó, Inmovilizado…), NO hay
  // término medio (regla 4e): sigue como si hubiera perdido el contacto, con el efecto completo.
  async function resolverDodge(id, logroSalir){
    const ref = col().doc(id);
    let anuncio = '';
    await fbDb.runTransaction(async tx => {
      anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.estado !== 'esperando' || m.fase !== 'dodge') return;
      if(logroSalir){ m.resultado = 'fallo'; m.fase = 'fin'; m.estado = 'resuelto'; anuncio = `🏃 ${m.defensor.nombre} logró salir del área de ${m.hab.nombre}: esquivó`; }
      else{ m.resultado = 'pego'; entrarHab(m); anuncio = `🏃 ${m.defensor.nombre} no logró salir del área de ${m.hab.nombre}: efecto completo`; }
      tx.update(ref, cambiosDe(m));
    });
    anunciarMesa(anuncio);
  }

  /* ---------- efectos del golpe ---------- */
  // Efectos que SOLO entran si el golpe hizo daño (decidido por el dueño, 2026-09-26). El resto entra aunque la armadura absorba todo. Un efecto puede traer `requiereDano` propio.
  const EFECTOS_CON_DANO = ['envenenar', 'veneno severo', 'sangrado', 'drena vida', 'lisiado', 'rengo'];
  const requiereDanoDe = ef => (typeof ef.requiereDano === 'boolean') ? ef.requiereDano : EFECTOS_CON_DANO.includes(String(ef.nombre || '').trim().toLowerCase());
  const siempreEf = ef => _num(ef.caras) <= 1 || _num(ef.exitos) >= _num(ef.caras);
  const pctEf = ef => Math.round(_num(ef.exitos) / Math.max(1, _num(ef.caras)) * 100);
  const necesitaTiradaEf = ef => !siempreEf(ef) || !!ef.dado;

  // Del efecto del arma al estado que se le pone al defensor (null = a mano: no hay estado que lo represente).
  function specDeEfecto(ef){
    if(ef.spec && ef.spec.nombre) return ef.spec;   // habilidades: el estado ya viene armado
    if(_num(ef.cura) > 0) return {nombre: 'Curación', cura: Math.round(_num(ef.cura))};   // habilidades: cura sobre el objetivo
    if(ef.no2 !== undefined) return {nombre: 'Pierde No2', no2: Math.max(0, Math.round(_num(ef.no2))), no2Dif: !!ef.no2Dif, no2Sentado: !!ef.no2Sentado};   // Sonic Boom
    const n = String(ef.nombre || '').trim().toLowerCase();
    const st = Math.max(0, Math.round(_num(ef.stacks)));
    const tu = Math.max(0, Math.round(_num(ef.turnos)));   // turnos puestos en el efecto del arma (ej. Sangrado 2 turnos); 0 = los del estado
    const conTurnos = sp => sp && tu ? {...sp, turnos: tu} : sp;
    return conTurnos(specArma(n, st, ef));
  }
  const SANGRADO_ARMA_TURNOS = 2;
  const esDrenaEf = ef => /^drena(r)?\s+vida$/i.test(String((ef && ef.nombre) || '').trim());
  const esSangradoEf = ef => /^(sangrado|primera sangre)$/i.test(String((ef.spec && ef.spec.nombre) || ef.nombre || '').trim());
  // El Sangrado con turnos pasa a permanente (le saca los turnos, al efecto y a su estado ya armado).
  function sangradoPermanente(ef){
    if(!esSangradoEf(ef) || ef.permanente) return ef;
    const {turnos, ...r} = ef;
    if(r.spec){ const {turnos: t2, ...sp} = r.spec; r.spec = sp; }
    if(!r.spec) r.permanente = true;   // el de un arma: si no, quedaría con los 2 turnos estándar
    return {...r, detalle: `${r.detalle ? r.detalle + ' ' : ''}(Fue crítico: el Sangrado queda permanente.)`.slice(0, 200)};
  }
  function specArma(n, st, ef){
    if(n === 'rompe armadura' || n === 'arruina armadura' || n === 'media armadura') return {nombre: 'Armadura rota', stacks: Math.max(1, st)};
    // Sangrado de un arma (regla del dueño, 2026-10-03): 2 de daño por turno durante SANGRADO_ARMA_TURNOS (2), salvo que el arma diga otros turnos
    // o «permanente»; con un golpe crítico, permanente (sangradoPermanente). Con más stacks si el arma lo dice.
    if(n === 'sangrado' || n === 'primera sangre') return {nombre: 'Sangrado', ...(st ? {stacks: st} : {}), ...(ef.permanente ? {} : {turnos: _num(ef.turnos) > 0 ? Math.round(_num(ef.turnos)) : SANGRADO_ARMA_TURNOS})};
    if(n === 'rengo') return {nombre: 'Rengo'};   // Rengo en armas (2026-10-03)
    if(n === 'envenenar' || n === 'veneno severo') return (n === 'veneno severo' || /severo/i.test(ef.detalle || '')) ? {nombre: 'Veneno severo'} : (st ? {nombre: 'Veneno', stacks: st} : {nombre: 'Veneno'});
    if(n === 'lisiado') return {nombre: 'Lisiado'};
    if(n === 'pajaritos') return {nombre: 'Pajaritos'};
    if(n === 'aturdir') return {nombre: 'Stun'};
    if(n === 'derribar') return {nombre: 'Sentado'};
    if(n === 'demora' || n === 'knockdown') return {nombre: 'Demora'};   // baja 1 lugar en el orden de turnos: lo hace el mapa (`aplicaDemora`)
    return null;
  }

  // Los efectos que trae el arma, en el formato del duelo (los manda la página del atacante al tirar el daño).
  function normalizarEfectos(lista){
    // «Ignora N de Res. crítico» no es un efecto sobre el golpeado: ya se usó al calcular el crítico (2026-10-03).
    return (Array.isArray(lista) ? lista : []).filter(e => !(typeof Combatiente !== 'undefined' && Combatiente.esEfectoIgnora(e))).slice(0, 8).map(e => {
      const caras = Math.max(1, Math.round(_num(e.caras)) || 1), exitos = Math.min(caras, Math.max(1, Math.round(_num(e.exitos)) || 1));
      const o = {nombre: String(e.nombre || '').trim().slice(0, 40), caras, exitos, dado: String(e.dado || '').trim().slice(0, 20), detalle: String(e.detalle || '').trim().slice(0, 200), stacks: Math.max(0, Math.round(_num(e.stacks)))};
      if(_num(e.turnos) > 0) o.turnos = Math.round(_num(e.turnos));
      if(e.permanente) o.permanente = true;
      if(e.spec && e.spec.nombre) o.spec = e.spec;
      if(_num(e.cura) > 0) o.cura = Math.round(_num(e.cura));
      if(e.no2 !== undefined){ o.no2 = Math.max(0, Math.round(_num(e.no2))); o.no2Dif = !!e.no2Dif; o.no2Sentado = !!e.no2Sentado; }
      if(e.seguroCritico && caras > 1) o.seguroCritico = true;
      if(e.soloCritico) o.soloCritico = true;
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
      if(!siempreEf(ef)) publicar = {origen: `${m.atacante.nombre} · ${ef.nombre} ${pctEf(ef)}%`, r: {formula: `1d${ef.caras}`, rolls: [r.dado], mod: 0, total: r.dado, ...(r.exito ? {destacar: 'idx:0'} : {})}};
      anuncio = r.exito ? `✔ ${ef.nombre}${siempreEf(ef) ? '' : ' (' + pctEf(ef) + '%)'} de ${m.atacante.nombre} sobre ${m.defensor.nombre}: ${siempreEf(ef) ? '' : 'salió ' + r.dado + ' → '}¡FUNCIONÓ!${r.extra ? ' · ' + ef.dado + ' = ' + r.extra.total : ''}`
        : `✘ ${ef.nombre} (${pctEf(ef)}%) de ${m.atacante.nombre} sobre ${m.defensor.nombre}: salió ${r.dado} → no funcionó`;
    });
    if(publicar && typeof mesaPublicar === 'function'){ try{ mesaPublicar(publicar.origen, publicar.r); }catch(err){} }
    anunciarMesa(anuncio);
  }

  /* Todos los efectos con dado, juntos (2026-10-04, pedido del dueño: «para que pegar con un arma no sea una eternidad»): un solo botón tira un
     dado por cada efecto que lo necesite; la Mesa recibe UNA tirada con todos los dados y una línea con lo que funcionó y lo que no; el cuadro
     muestra el tablero (qué dado va con qué efecto, con qué número funciona, qué salió). */
  async function tirarEfectos(id){
    const ref = col().doc(id);
    let publicar = null, anuncio = '';
    await fbDb.runTransaction(async tx => {
      publicar = null; anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(m.fase !== 'efectos') return;
      const dados = [], partes = [];
      m.efectos = (m.efectos || []).map(e => {
        if(!e || e.res || e.omitido || !necesitaTiradaEf(e)) return e;
        const ef = {...e}, r = {dado: 0, exito: true, extra: null};
        if(!siempreEf(ef)){
          r.dado = 1 + Math.floor(Math.random() * ef.caras);
          r.exito = r.dado >= ef.caras - ef.exitos + 1;
          dados.push({caras: ef.caras, dado: r.dado, exito: r.exito});
        }
        if(r.exito && ef.dado && typeof tirarDados === 'function'){
          const x = tirarDados(ef.dado);
          if(x) r.extra = {formula: x.formula, total: x.total, rolls: (x.rolls || []).slice(0, 10)};
        }
        ef.res = r;
        partes.push(`${r.exito ? '✔' : '✘'} ${ef.nombre}${siempreEf(ef) ? '' : ` ${pctEf(ef)} % (salió ${r.dado} en d${ef.caras})`}${r.extra ? ` · ${ef.dado} = ${r.extra.total}` : ''}`);
        return ef;
      });
      if(!partes.length) return;
      cerrarSiListo(m);
      tx.update(ref, cambiosDe(m));
      // Los dados que funcionaron brillan en 3D como el d20 del crítico (2026-10-04, dueño): `destacar: 'idx:…'`.
      const ok = dados.map((x, k) => x.exito ? k : -1).filter(k => k >= 0);
      if(dados.length) publicar = {origen: `${m.atacante.nombre} · Efectos del golpe`, r: {formula: dados.map(x => `1d${x.caras}`).join('+'), rolls: dados.map(x => x.dado), mod: 0, total: dados.reduce((a, x) => a + x.dado, 0),
        ...(ok.length ? {destacar: 'idx:' + ok.join(',')} : {})}};
      anuncio = `🎲 Efectos de ${m.atacante.nombre} sobre ${m.defensor.nombre}: ${partes.join(' · ')}`;
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
      const be = m.ataque && m.ataque.espalda;   // por la espalda: el daño fijo del arma o la habilidad
      if(be && be.fijo) m.dano = {...m.dano, crudo: m.dano.crudo + be.fijo, mod: m.dano.mod + be.fijo, formula: `${m.dano.formula} +${be.fijo} espalda`.slice(0, 60)};
      const critGolpe = !!(m.crit && m.crit.critico);
      let crudos = m.hab ? m.hab.efectos : efectos;
      if(!m.hab){
        // ⚡ Critical Matters de un arma (2026-10-03): el efecto con `soloCritico` entra solo si el golpe fue crítico.
        crudos = (Array.isArray(crudos) ? crudos : []).filter(e => !(e && e.soloCritico) || critGolpe);
        // Drena vida de un arma (2026-10-03, regla del dueño): quien ataca se cura un % (`drenaPct`, 50 si no dice) de la vida que el golpe le
        // sacó de verdad al defensor (lo que frena la armadura no cuenta). No es un estado sobre el golpeado: lo aplica el mapa con el daño.
        const drenas = crudos.filter(esDrenaEf);
        if(drenas.length){ m.dano.drenaPct = Math.min(100, drenas.reduce((a, e) => a + (_num(e.drenaPct) > 0 ? _num(e.drenaPct) : 50), 0)); crudos = crudos.filter(e => !esDrenaEf(e)); }
        // Daño mágico de un arma (2026-10-03, rayo / hielo): se tira acá, ignora la Defensa (resta la Armadura mágica) y queda AFUERA del
        // multiplicador del crítico (regla del dueño). Lo aplica el mapa junto con el daño.
        const magicos = crudos.filter(e => e && e.danoMagico && e.dado);
        if(magicos.length && typeof tirarDados === 'function'){
          const tiros = magicos.map(e => ({e, r: tirarDados(e.dado)})).filter(x => x.r);
          if(tiros.length) m.dano.magico = {tipo: tiros.map(x => String(x.e.nombre || 'mágico').slice(0, 20)).join(' y '), total: tiros.reduce((a, x) => a + Math.max(0, Math.round(_num(x.r.total))), 0),
            formula: tiros.map(x => x.r.formula).join(' + ').slice(0, 60), rolls: tiros.flatMap(x => x.r.rolls || []).slice(0, 12).map(_num)};
          crudos = crudos.filter(e => !(e && e.danoMagico));
        }
      }
      m.efectos = normalizarEfectos(crudos);
      // «Seguro si es crítico» (2026-10-03): un efecto con porcentaje que, si el golpe fue crítico, entra sin tirar.
      if(m.crit && m.crit.critico) m.efectos = m.efectos.map(ef => ef.seguroCritico ? {...ef, caras: 1, exitos: 1, detalle: `${ef.detalle ? ef.detalle + ' ' : ''}(Fue crítico: entra seguro.)`.slice(0, 200)} : ef);
      // Regla del dueño (2026-10-03), característica del Sangrado: si entra con un golpe CRÍTICO de arma es permanente, aunque diga turnos —
      // venga del arma o de la habilidad con la que se atacó (Ejecución «con tu arma», Critical Matters…). Solo hay crítico con un arma.
      if(m.crit && m.crit.critico) m.efectos = m.efectos.map(sangradoPermanente);
      tx.update(ref, cambiosDe(m));
    });
  }

  /* ---------- resumen final en la Mesa ---------- */
  // Un renglón por cosa que pasó, para la línea de reporte de la Mesa.
  function lineasResumen(d){
    const L = [];
    const arma = d.ataque.armaNombre ? 'con ' + d.ataque.armaNombre : 'sin arma';
    if(d.hab) L.push(`${d.atacante.nombre} → ${d.defensor.nombre} · ✨ ${d.hab.nombre}${d.hab.sinOposicion ? '' : ' (' + etqTira(d) + ' contra ' + etqContra(d) + ')'}`);
    else L.push(`${d.atacante.nombre} → ${d.defensor.nombre} · ${nombreAtq(d)} ${arma} (Tipo ${_fmt(_num(d.ataque.tipoDado))})${modsTxt(d) ? ' · ' + modsTxt(d) : ''}`);
    const defTxt = d.defensa && d.defensa.modo === 'parry' ? 'Parry' + (d.defensa.itemNombre ? ' con ' + d.defensa.itemNombre : '') : 'Evasión';
    if(d.hab){
      if(d.pdg && d.eva) L.push(`${etqTira(d)} ${d.pdg.total} contra ${etqContra(d)} ${d.eva.total} → ${d.contacto && d.contacto.gana === 'atacante' ? 'funcionó' : 'se resistió'}${d.contacto && d.contacto.desempate ? ' (por desempate)' : ''}`);
    }
    else if(d.pdg && d.eva) L.push(`Contacto: PdG ${d.pdg.total} contra ${defTxt} ${d.eva.total} → ${d.contacto && d.contacto.gana === 'atacante' ? 'pegó' : 'el defensor ganó'}${d.contacto && d.contacto.desempate ? ' (por desempate)' : ''}`);
    if(d.fuerza && d.bloqueo) L.push(`Bloqueo: Fuerza del golpe ${d.fuerza.total} contra Bloqueo ${d.bloqueo.total} → ${d.bloq && d.bloq.gana === 'defensor' ? 'bloqueado' : 'no alcanzó'}${d.bloq && d.bloq.desempate ? ' (por desempate)' : ''}`);
    if(d.crit && d.crit.critico) L.push(`¡Crítico ×${d.crit.mult}!${d.crit.mult > 1 ? '' : ' (el d20 no alcanzó a multiplicar, pero ignora la Defensa)'} (d20: ${(d.crit.d20 || []).join(', ')})`);
    const dn = d.dano;
    if(dn && dn.aplicado){
      const crit = d.resultado === 'pego' && d.crit && d.crit.critico;
      if(dn.invulnerable) L.push('Daño: era Invulnerable, no hizo nada');
      else if(d.hab && dn.ignoraDef && !dn.manual) L.push(`Daño ${d.hab.dano ? d.hab.dano.tipo : 'mágico'}: ${dn.golpe} directo a la vida${dn.freno ? ` (lo frenan: ${dn.freno})` : ''} (${dn.hpAntes} → ${dn.hpDespues} HP)`);
      else if(dn.manual) L.push(`Daño: ${dn.golpe} (se aplicó a mano)`);
      else if(crit) L.push(`Daño: ${dn.crudo} × ${dn.mult} = ${dn.golpe} derecho a la vida (${dn.hpAntes} → ${dn.hpDespues} HP)`);
      else if(dn.mitad) L.push(`Daño: pasó la mitad → ${dn.recibido} (${dn.hpAntes} → ${dn.hpDespues} HP)`);
      else L.push(`Daño: ${dn.crudo} − Defensa ${dn.defensa}${dn.freno ? ` − ${dn.freno}` : ''} = ${dn.recibido} (${dn.hpAntes} → ${dn.hpDespues} HP)`);
    }
    if(dn && dn.magico) L.push(`Daño de ${dn.magico.tipo}: ${dn.magico.total} (${dn.magico.formula}; ignora la Defensa, sin multiplicar)${dn.magico.recibido !== undefined ? ` → recibió ${dn.magico.recibido}` : ''}${dn.magico.hpDespues !== undefined ? ` (${dn.magico.hpAntes} → ${dn.magico.hpDespues} HP)` : ''}`);
    if(dn && dn.drena) L.push(`Drena: ${dn.drena.quien || d.atacante.nombre} se cura ${dn.drena.monto}${dn.drena.manual ? ` (a mano${dn.drena.motivo ? ': ' + dn.drena.motivo : ''})` : `${dn.drena.hpAntes !== undefined && dn.drena.hpAntes !== null ? ` (${dn.drena.hpAntes} → ${dn.drena.hpDespues} HP)` : ''}${_num(dn.drena.excedente) ? ` · Excedente de vida ${dn.drena.excedente}` : ''}${dn.drena.nota ? ' · ' + dn.drena.nota : ''}`}`);
    if(dn && dn.espinas) L.push(`Espinas: ${dn.espinas.quien || d.atacante.nombre} recibe ${dn.espinas.monto} de daño devuelto${dn.espinas.manual ? ' (a mano)' : dn.espinas.hpAntes !== undefined && dn.espinas.hpAntes !== null ? ` (${dn.espinas.hpAntes} → ${dn.espinas.hpDespues} HP)` : ''}`);
    if(d.resultado === 'mitad') L.push(`Durabilidad: ${d.defensa && d.defensa.itemNombre ? d.defensa.itemNombre : 'el objeto que bloqueó'} pierde 1 punto`);
    (d.efectos || []).forEach(ef => {
      if(ef.omitido) L.push(`— ${ef.nombre}: no entró (${ef.motivo || 'sin daño'})`);
      else if(ef.res && !ef.res.exito) L.push(`✘ ${ef.nombre} (${pctEf(ef)} %): no funcionó`);
      else if(ef.aplicado) L.push(`✔ ${ef.nombre}${siempreEf(ef) ? '' : ' (' + pctEf(ef) + ' %)'}: aplicado${ef.nota ? ' · ' + ef.nota : ''}`);
      else L.push(`? ${ef.nombre}: quedó sin resolver`);
    });
    const fin = d.hab ? {pego: 'La habilidad funcionó', fallo: 'El objetivo la resistió'}[d.resultado] : {pego: 'El golpe pegó', fallo: 'El golpe falló', bloqueado: 'El golpe fue bloqueado', mitad: 'Pasó la mitad del daño'}[d.resultado];
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
      const dn = m.dano, crit = m.resultado === 'pego' && m.crit && m.crit.critico;
      anuncio = dn.manual ? `⚔ ${m.atacante.nombre} le pegó a ${m.defensor.nombre}${crit ? ' con crítico ×' + m.crit.mult : ''}: ${dn.golpe} de daño (aplicalo a mano)`
        : dn.invulnerable ? `⚔ ${m.atacante.nombre} → ${m.defensor.nombre}: Invulnerable, el golpe no hizo nada`
        : crit ? `💥 ${m.atacante.nombre} → ${m.defensor.nombre}: ${dn.golpe} de daño (×${m.crit.mult}) derecho a la vida (${dn.hpAntes} → ${dn.hpDespues} HP)`
        : dn.mitad ? `⚠ ${m.atacante.nombre} → ${m.defensor.nombre}: pasó la mitad: ${dn.recibido} de daño (${dn.hpAntes} → ${dn.hpDespues} HP)`
        : `⚔ ${m.atacante.nombre} → ${m.defensor.nombre}: ${dn.crudo} − Defensa ${dn.defensa}${dn.freno ? ` − ${dn.freno}` : ''} = ${dn.recibido} de daño (${dn.hpAntes} → ${dn.hpDespues} HP)`;
    });
    anunciarMesa(anuncio);
  }

  // Empate con «+» en las dos (o en ninguna): el primero que elige par o impar decide; se tira un d6 y gana el que acierta.
  // La moneda rueda en 3D como cualquier otra tirada del duelo (regla del dueño, 2026-09-27): se publica en la Mesa
  // y `nReveal` (ver más abajo) hace que el cuadro espere a que el dado quede quieto antes de mostrar quién ganó.
  async function elegirParidad(id, quien, eleccion){
    const ref = col().doc(id);
    let anuncio = '', publicar = null;
    await fbDb.runTransaction(async tx => {
      anuncio = ''; publicar = null;
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
      const quienTiro = quien === 'atacante' ? m.atacante.nombre : m.defensor.nombre;
      publicar = {origen: `${quienTiro} · Empate: ${eleccion}`, r: {formula: '1d6', rolls: [resultado], mod: 0, total: resultado}};
    });
    if(publicar && typeof mesaPublicar === 'function'){ try{ mesaPublicar(publicar.origen, publicar.r); }catch(err){} }
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
    f.innerHTML = '<div class="duelo-caja"><div class="duelo-cab"><span>⚔ Duelo</span><div class="bt"><button type="button" data-min title="Minimizar">—</button><button type="button" data-x title="Cerrar">✕</button></div></div><div class="duelo-cuerpo"><div class="duelo-nota">Abriendo…</div></div></div>';
    f.querySelector('[data-min]').onclick = minimizar;
    f.querySelector('[data-x]').onclick = cerrar;
    actual = {id, dato: null, baja: null, min: false};
    actual.baja = col().doc(id).onSnapshot(doc => {
      if(!doc.exists){ _toast('Ese duelo ya no existe'); cerrar(); return; }
      if(!actual || actual.id !== id) return;
      actual.dato = {id, ...doc.data()};
      // Primero ruedan los dados 3D y, cuando quedan a la vista, se muestra el resultado en el cuadro (no antes).
      const nRev = nReveal(actual.dato);
      if(actual.nRev === undefined){ actual.nRev = nRev; dibujar(); return; }   // al abrir un duelo que ya está avanzado no se espera nada
      if(nRev > actual.nRev && typeof dadosActivos === 'function' && dadosActivos() && !document.hidden){
        if(!actual.reteniendo){
          actual.reteniendo = true;
          esperarDados(() => { if(!actual || actual.id !== id) return; actual.reteniendo = false; actual.nRev = nReveal(actual.dato); dibujar(); });
        }
        return;
      }
      if(!actual.reteniendo){ actual.nRev = nRev; dibujar(); }
    }, err => { console.error('Duelo: error escuchando', err); _toast('No se pudo seguir el duelo'); });
    dibujarChips();
  }

  // 🎮 Si el GM tomó el control de un personaje (2026-09-30), su lado lo maneja quien lo controla, no su dueño. Lo avisa la
  // página: el mapa con cfg.controlDe(lado), la ficha suelta con el hook controlDe(lado) → uid de quien lo controla, o ''.
  const controlDe = lado => (cfgEscuchar.controlDe && cfgEscuchar.controlDe(lado)) || (hooks() && hooks().controlDe && hooks().controlDe(lado)) || '';
  const esMio = lado => { if(!lado) return false; const c = controlDe(lado); return c ? c === yo() : lado.uid === yo(); };
  // ¿Puede esta pestaña tirar por ese lado con su propio código (o pidiéndolo al iframe)?
  const puedoTirarYo = lado => esMio(lado) && !!(cfgEscuchar.relay || (hooks() && hooks().soy && hooks().soy(lado)));
  const puedoAMano = lado => soyGM() || esMio(lado);

  // Envía un pedido al dueño del lado: en el mapa, al iframe; en una página suelta, se ejecuta acá.
  // Paso 4, etapa 3c-4c (2026-10-01): el mapa puede contestar él mismo por un lado (el personaje de su Botonera nueva) con
  // cfg.hooksLocal(lado) → los mismos ganchos de la ficha (comun/ficha-duelo.js), sin pasar por el marco.
  // hooksLocal puede devolver una promesa (2026-10-02: el mapa tiene que cargar al personaje la primera vez): se espera; si termina
  // en null, va por el camino de siempre.
  function enviar(lado, msg){
    const hl = cfgEscuchar.hooksLocal ? cfgEscuchar.hooksLocal(lado) : null;
    const otro = () => { if(cfgEscuchar.relay) cfgEscuchar.relay(lado, msg); else ejecutar(msg); };
    if(hl && typeof hl.then === 'function'){ hl.then(h => h ? ejecutar(msg, h) : otro(), err => { console.error('Duelo: hooksLocal', err); otro(); }); return; }
    if(hl){ ejecutar(msg, hl); return; }
    otro();
  }

  let opcionesFalla = {};   // id → true: las opciones no llegaron (tardaron demasiado o la ficha/Acciones no respondió)
  function pedirOpciones(d){
    if(opcionesPedidas.has(d.id)) return;
    opcionesPedidas.add(d.id);
    delete opcionesFalla[d.id];
    // Si la pestaña ya sabe calcularlas sola (el mapa del GM con un creep), no hace falta esperar a un iframe.
    if(cfgEscuchar.opcionesLocal){
      let ops = null;
      try{ ops = cfgEscuchar.opcionesLocal(d); }catch(err){ console.error('Duelo: opcionesLocal', err); }
      if(ops){ recibirOpciones(d.id, ops); return; }
    }
    enviar(d.defensor, {tipo: 'duelo-opciones', id: d.id});
    setTimeout(() => { if(!opciones[d.id]){ opcionesFalla[d.id] = true; if(actual && actual.id === d.id && actual.dato) dibujar(); } }, 12000);
  }
  function recibirOpciones(id, ops){
    if(Array.isArray(ops)){ opciones[id] = ops; delete opcionesFalla[id]; }
    else opcionesFalla[id] = true;   // el dueño contestó que no puede (no es su personaje, etc.)
    if(actual && actual.id === id && actual.dato) dibujar();
  }

  /* ---------- Reacciones Flash dentro del duelo (2026-09-27, docs/duelo-de-habilidades.md §10) ----------
     Una habilidad Flash (`duelo.modo === 'flash'`, `duelo.flash = {en: ['pdg','eva','parry','bloqueo','fuerza','dano'], bono}`) se puede usar ANTES de una tirada del duelo (regla de Flash:
     se declara antes de tirar, nunca después de ver el resultado; no cuesta No2, solo los SP de la habilidad). En cada caja de tirada, quien tira ve un botón por cada Flash que le sirve;
     lo marca y, al tirar, la página del dueño cobra los SP (`flashUsar`) y el bono se suma a esa tirada (queda en su fórmula: «+2 ⚡»). Una vez por tirada. */
  let flashOps = {};      // 'duelo:campo' → opciones que calculó la página del que tira ([] = ninguna)
  let flashSel = {};      // 'duelo:campo' → habId marcado
  let flashPedidas = new Set();
  function pedirFlash(d, campo){
    const k = d.id + ':' + campo;
    if(flashPedidas.has(k)) return;
    flashPedidas.add(k);
    const lado = (campo === 'pdg' || campo === 'fuerza' || campo === 'dano') ? d.atacante : d.defensor;
    // Un creep sin Flash para esta tirada: el mapa del GM ya lo sabe y contesta solo, sin cargar GM Tools (P135, 2026-09-30).
    if(lado.tipo === 'creep' && cfgEscuchar.flashLocal){
      let ops = null;
      try{ ops = cfgEscuchar.flashLocal(d, campo, lado); }catch(err){ console.error('Duelo: flashLocal', err); }
      if(ops){ flashOps[k] = ops; return; }
    }
    enviar(lado, {tipo: 'duelo-flash', id: d.id, campo});
    setTimeout(() => { if(flashOps[k] === undefined) flashOps[k] = []; }, 6000);
  }
  function recibirFlash(id, campo, ops){
    flashOps[id + ':' + campo] = Array.isArray(ops) ? ops : [];
    if(actual && actual.id === id && actual.dato) dibujar();
  }
  const ETQ_FLASH = {pdg: 'la tirada de ataque (PdG)', eva: 'Evasión', parry: 'Parry', bloqueo: 'Bloqueo', fuerza: 'Fuerza del golpe', dano: 'el daño'};
  function flashHtml(d, campo){
    const k = d.id + ':' + campo;
    if(flashOps[k] === undefined){ pedirFlash(d, campo); return ''; }
    const ops = flashOps[k];
    if(!ops.length) return '';
    return `<div class="duelo-flash"><div class="det">⚡ Flash (se declara antes de tirar · no cuesta No2):</div>${ops.map(o => {   // costoTxt: lo que cuesta (un creep: cooldown); si no, SP
      const on = flashSel[k] === o.habId;
      const vale = (o.en || []).map(e => ETQ_FLASH[e] || e).join(', ');
      return `<button type="button" class="flash${on ? ' on' : ''}" data-flash="${_esc(campo)}:${_esc(o.habId)}"${o.motivoNo ? ' disabled' : ''} title="Vale para: ${_esc(vale)}">${on ? '✔ ' : ''}⚡ ${_esc(o.nombre)} +${_fmt(o.bono)}<small>${o.costoTxt ? _esc(o.costoTxt) : _fmt(o.costoSp) + ' SP'}${campo === 'eva' && (o.en || []).length ? ' · vale con ' + _esc((o.en || []).filter(e => e === 'eva' || e === 'parry').map(e => ETQ_FLASH[e]).join(' o ')) : ''}${o.motivoNo ? ' · ' + _esc(o.motivoNo) : ''}</small></button>`;
    }).join('')}</div>`;
  }

  const ETIQ = {pdg: 'PdG', eva: 'Defensa', fuerza: 'Fuerza del golpe', bloqueo: 'Bloqueo', dano: 'Daño'};
  /* ---------- Re-roll dentro del duelo (2026-09-27, dueño; docs/reroll.md) ----------
     Con una Moneda Re-Roll (cinturón: 1 No2; mochila: 2 No2) se puede volver a hacer «la última tirada que hiciste». En el duelo eso es REABRIR esa tirada: se borra y quien la hizo la
     vuelve a tirar con el botón de siempre (dados 3D, mismo empate). Solo se puede mientras no pasó a una etapa posterior con tiradas (Bloqueo, crítico, daño) ni se aplicó daño ni
     efectos. El botón flotante 🪙 del cuadro lo ve quien tiene una moneda y puede reabrir alguna de sus tiradas; la página del dueño cobra los No2, tira la moneda (par se conserva,
     impar se rompe) y reabre. */
  function puedeReabrir(m, campo){
    if(!m || m.estado === 'cancelado' || m.dano) return false;
    if(m.rerollUsado && m.rerollUsado[campo]) return false;   // una moneda por tirada: esta ya usó la suya
    if((m.efectos || []).some(e => e && (e.res || e.aplicado || e.aplicar))) return false;
    const critHecho = !!(m.crit && m.crit.d20);
    if(campo === 'critico') return critHecho;
    if(campo === 'pdg' || campo === 'eva') return !!m[campo] && !m.fuerza && !m.bloqueo && !critHecho;
    if(campo === 'fuerza' || campo === 'bloqueo') return !!m[campo] && !critHecho;
    return false;
  }
  // La última tirada que hizo ese lado que todavía se puede reabrir (la más avanzada primero).
  const campoReabrible = (m, lado) => (lado === 'atacante' ? ['critico', 'fuerza', 'pdg'] : ['bloqueo', 'eva']).find(c => puedeReabrir(m, c)) || null;
  const etqCampo = (d, c) => c === 'pdg' ? etqTira(d) : c === 'eva' ? etqContra(d) : c === 'critico' ? 'los d20 del crítico' : ETIQ[c];
  async function reabrir(id, campo){
    const ref = col().doc(id);
    let ok = false, anuncio = '';
    await fbDb.runTransaction(async tx => {
      ok = false; anuncio = '';
      const doc = await tx.get(ref);
      if(!doc.exists) return;
      const m = {...doc.data()};
      if(!puedeReabrir(m, campo)) return;
      m.rerollUsado = {...(m.rerollUsado || {}), [campo]: true};
      const quien = (campo === 'pdg' || campo === 'fuerza' || campo === 'critico') ? m.atacante.nombre : m.defensor.nombre;
      if(campo === 'critico'){ m.crit = {...m.crit, d20: null, mejor: 0, mult: 1}; m.fase = 'critico'; }
      else if(campo === 'fuerza' || campo === 'bloqueo'){ m[campo] = null; m.bloq = null; m.empate = null; m.resultado = null; m.crit = null; m.fase = 'bloqueo'; }
      else{
        m[campo] = null; if(campo === 'eva') m.defensa = null;
        m.contacto = null; m.bloq = null; m.empate = null; m.resultado = null; m.crit = null; m.fase = 'contacto';
        if(m.hab) m.efectos = null;
      }
      m.estado = 'esperando';
      const upd = cambiosDe(m);
      if(m.resumido) upd.resumido = false;   // el resumen final se vuelve a publicar cuando termine
      tx.update(ref, upd);
      ok = true;
      anuncio = `🪙 ${quien} usó una Moneda Re-Roll: vuelve a tirar ${etqCampo(m, campo)}`;
    });
    if(ok) anunciarMesa(anuncio);
    return ok;
  }
  let rerollInfo = {}, rerollPedidas = new Set();
  function ladoMio(d){ return puedoTirarYo(d.atacante) ? 'atacante' : puedoTirarYo(d.defensor) ? 'defensor' : ''; }
  function pedirRerollInfo(d, lado){
    const k = d.id + ':' + lado;
    if(rerollPedidas.has(k)) return;
    rerollPedidas.add(k);
    const l = d[lado];
    if(l.tipo === 'creep' || String(l.ref || '').includes('~')){ rerollInfo[k] = {disponible: false}; return; }
    enviar(l, {tipo: 'duelo-reroll-info', id: d.id, lado});
    setTimeout(() => { if(rerollInfo[k] === undefined) rerollInfo[k] = {disponible: false}; }, 6000);
  }
  function recibirRerollInfo(id, lado, info){
    rerollInfo[id + ':' + lado] = info || {disponible: false};
    if(actual && actual.id === id && actual.dato) dibujar();
  }
  function rerollBtnHtml(d){
    if(d.estado === 'cancelado') return '';
    const lado = ladoMio(d);
    if(!lado) return '';
    const campo = campoReabrible(d, lado);
    if(!campo){ return ''; }
    const k = d.id + ':' + lado;
    if(rerollInfo[k] === undefined){ pedirRerollInfo(d, lado); return ''; }
    const info = rerollInfo[k];
    if(!info.disponible) return '';
    return `<button type="button" class="duelo-reroll" data-reroll="${_esc(lado)}:${_esc(campo)}" title="Volver a tirar ${_esc(etqCampo(d, campo))} (moneda en ${_esc(info.donde || 'el inventario')}, sin costo de No2) y después se tira una moneda: par se conserva, impar se rompe">🪙 Re-roll<small>volver a tirar ${_esc(etqCampo(d, campo))}</small></button>`;
  }


  const nombreDefensa = d => d.hab ? etqContra(d) : d.defensa ? (d.defensa.modo === 'parry' ? 'Parry' + (d.defensa.itemNombre ? ' · ' + d.defensa.itemNombre : '') : 'Evasión') : 'Defensa';

  function numerosHtml(tiro, esNuevo, que, quien){
    return `<div class="duelo-tiro${esNuevo ? ' nuevo' : ''}"><div class="que">${_esc(que)}${tiro.nota ? ' (' + _esc(tiro.nota) + ')' : ''} · ${_esc(quien)}</div><div class="num">${_fmt(tiro.total)}</div><div class="det">${_esc(tiro.formula || '')}${tiro.rolls && tiro.rolls.length ? ' → ' + tiro.rolls.join(' + ') : ''}${_num(tiro.mod) ? ' ' + (_num(tiro.mod) > 0 ? '+' : '−') + ' ' + Math.abs(_num(tiro.mod)) : ''}</div></div>`;
  }

  // El «?» que explica Esquivar, Parry y Bloqueo (comun/modificadores-tirada.js; si la página no lo carga, no aparece).
  const ayudaDefensa = clave => typeof ModTirada !== 'undefined' && ModTirada.ayuda ? ModTirada.ayuda(clave).replace('class="bt-ayuda"', 'class="bt-ayuda en-linea"') : '';

  // Una caja de tirada. campo: 'pdg'|'eva'|'fuerza'|'bloqueo'.
  function cajaHtml(d, campo, otro, esNuevo){
    const esAtq = campo === 'pdg' || campo === 'fuerza';
    const lado = esAtq ? d.atacante : d.defensor;
    const tiro = d[campo];
    const fase = (campo === 'pdg' || campo === 'eva') ? 'contacto' : 'bloqueo';
    const etiqueta = campo === 'eva' ? nombreDefensa(d) : (campo === 'pdg' && d.hab) ? etqTira(d) : ETIQ[campo];
    const parCompleto = !!(tiro && d[otro]);
    if(parCompleto) return numerosHtml(tiro, esNuevo, etiqueta, lado.nombre);
    if(tiro){
      // Quien tiró ve SU propia tirada mientras espera al otro (para el resto queda secreta hasta que tiren los dos).
      const propia = esMio(lado)
        ? `<div class="num" style="font-size:52px">${_fmt(tiro.total)}</div><div class="det">tu tirada · ${_esc(tiro.formula || '')}${tiro.rolls && tiro.rolls.length ? ' → ' + tiro.rolls.join(' + ') : ''}${_num(tiro.mod) ? ' ' + (_num(tiro.mod) > 0 ? '+' : '−') + ' ' + Math.abs(_num(tiro.mod)) : ''}</div><div class="det">🔒 los demás no la ven hasta que tiren los dos</div>`
        : `<div class="listo">✔ ${_esc(lado.nombre)} ya tiró <b>${_esc(tiro.formula || 'los dados')}</b></div><div class="det">el resultado se muestra cuando tiren los dos</div>`;
      return `<div class="duelo-tiro"><div class="que">${_esc(etiqueta)} · ${_esc(lado.nombre)}</div>${propia}</div>`;
    }
    const vivo = d.estado === 'esperando' && d.fase === fase;
    if(!vivo) return `<div class="duelo-tiro"><div class="que">${_esc(etiqueta)} · ${_esc(lado.nombre)}</div><div class="espera">no llegó a tirar</div></div>`;
    const quien = _esc(lado.nombre);
    let cuerpo;
    if(puedoTirarYo(lado)){
      if(campo === 'eva'){
        const ops = opciones[d.id];
        if(!ops && opcionesFalla[d.id]){
          cuerpo = `<div class="espera">No llegaron tus opciones de defensa (la ficha o las Acciones no respondieron).</div>${window.DUELO_MOTIVO ? `<div class="det">${_esc(window.DUELO_MOTIVO)}</div>` : ''}<button type="button" class="sec" data-reintentar-def>↻ Reintentar</button>
            <div class="duelo-man"><input type="number" min="1" data-manual="eva" placeholder="valor" value="${_esc(manual.eva || '')}"><select data-manual-modo>${selModoHtml(d)}</select><button type="button" class="sec" data-tirarpor="eva">🎲 Tirar a mano</button></div>`;
        }
        else if(!ops){ pedirOpciones(d); cuerpo = '<div class="espera">cargando tus opciones de defensa… <span class="det">(la primera vez puede tardar unos segundos)</span></div>'; }
        else cuerpo = `<div class="det">Elegí cómo te defendés (antes de ver el PdG):</div><div class="duelo-opc">${ops.map((o, i) => `<button type="button" data-def="${i}"${o.motivoNo ? ' disabled' : ''}>${_esc(o.etiqueta)}${ayudaDefensa(o.modo === 'evasion' ? 'eva' : o.modo)}${o.costo ? `<small>${_fmt(o.costo)} No2</small>` : ''}${(o.info || []).map(t => `<small class="duelo-info">${_esc(t)}</small>`).join('')}${o.motivoNo ? `<small>${_esc(o.motivoNo)}</small>` : ''}</button>`).join('')}</div>`;
      }else{
        const txt = campo === 'pdg' ? (d.hab ? `🎲 Tirar ${_esc(etqTira(d))}` : '🎲 Pagar y tirar PdG') : campo === 'fuerza' ? '🎲 Tirar Fuerza del golpe' : `🎲 Tirar Bloqueo${d.defensa && d.defensa.itemNombre ? ' · ' + _esc(d.defensa.itemNombre) : ''}`;
        cuerpo = `<button type="button" data-tirar="${campo}">${txt}${campo === 'bloqueo' ? ayudaDefensa('bloqueo') : ''}</button>${campo === 'pdg' && !d.hab ? '<div class="det">descuenta los No2 del ataque</div>' : ''}`;
      }
      cuerpo += flashHtml(d, campo);
    }else if(puedoAMano(lado)){
      const selModo = campo === 'eva' ? `<select data-manual-modo>${selModoHtml(d)}</select>` : '';
      cuerpo = `<div class="espera duelo-nota">esperando que ${quien} tire…</div>
        <div class="duelo-man">${selModo}<input type="number" min="1" data-manual="${campo}" placeholder="valor" value="${_esc(manual[campo] || '')}"><button type="button" class="sec" data-tirarpor="${campo}">🎲 Tirar a mano</button></div>
        <div class="det">${soyGM() ? 'como GM, tirás por él' : 'tirás vos'}: escribí el valor del stat y se tira con dados</div>`;
    }else{
      cuerpo = `<div class="espera duelo-nota">esperando que ${quien} tire…</div>`;
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
    // Efecto que la skill no puede automatizar del todo (2026-09-27, pedido del dueño — "Pasos personalizados"
    // del 🎯): texto libre + la diferencia entre las dos tiradas, si hubo contienda, para resolverlo a mano.
    const efectoLibre = d.hab && d.hab.efectoLibre
      ? `<div class="duelo-motivo">✋ ${_esc(d.hab.efectoLibre)}${d.contacto ? ` <b>(diferencia: ${_fmt(Math.abs(_num(d.contacto.dif)))})</b>` : ''}</div>` : '';
    let caja;
    if(d.hab && d.resultado === 'pego' && d.hab.sinOposicion) caja = `<div class="duelo-veredicto pego${nuevo}"><div class="grande">✨ ${_esc(d.hab.nombre.toUpperCase())}</div><div class="chico">${_esc(d.atacante.nombre)} → ${_esc(d.defensor.nombre)} · no hay nada que resistir: se aplica</div>${efectoLibre}</div>`;
    else if(d.hab && d.resultado === 'pego') caja = `<div class="duelo-veredicto pego${nuevo}"><div class="grande">✨ ¡FUNCIONÓ!</div><div class="chico">${_esc(d.hab.nombre)} de ${_esc(d.atacante.nombre)} venció la ${_esc(etqContra(d))} de ${_esc(d.defensor.nombre)}</div>${mot}${efectoLibre}</div>`;
    else if(d.hab && d.resultado === 'fallo') caja = `<div class="duelo-veredicto fallo${nuevo}"><div class="grande">🛡 SE RESISTIÓ</div><div class="chico">${_esc(d.defensor.nombre)} resistió ${_esc(d.hab.nombre)} (${_esc(etqContra(d))})</div>${mot}</div>`;
    else if(d.resultado === 'pego' && d.crit && d.crit.critico){
      const porParry = d.defensa && d.defensa.modo === 'parry';
      caja = `<div class="duelo-veredicto critico${nuevo}"><div class="chispas">✨ 💥 ✨</div><div class="grande">${d.crit.supercritico ? '¡SUPERCRÍTICO!' : '¡CRÍTICO!'}</div><div class="mult">×${d.crit.mult} · ${NOMBRE_MULT[d.crit.mult] || `${d.crit.supercritico} VEINTES NATURALES`}</div><div class="chico">${porParry ? 'El Parry no alcanzó y ' : ''}${d.crit.mult > 1 ? 'el golpe ignora la Defensa: todo el daño se multiplica y va derecho a la vida' : 'es crítico aunque el d20 no multiplique: el golpe ignora la Defensa y va derecho a la vida (daño ×1)'}</div>${mot}</div>`;
    }else if(d.resultado === 'pego'){
      const porParry = d.defensa && d.defensa.modo === 'parry';
      caja = `<div class="duelo-veredicto pego${nuevo}"><div class="grande">⚔ ¡PEGÓ!</div><div class="chico">${porParry ? 'El Parry no alcanzó: el golpe entra completo' : 'El golpe entra completo'}</div>${mot}</div>`;
    }else if(d.resultado === 'fallo'){
      caja = `<div class="duelo-veredicto fallo${nuevo}"><div class="grande">🛡 FALLÓ</div><div class="chico">${_esc(d.defensor.nombre)} lo esquivó</div>${mot}</div>`;
    }else if(d.resultado === 'bloqueado'){
      caja = `<div class="duelo-veredicto bloqueado${nuevo}"><div class="grande">🛡 ¡BLOQUEADO!</div><div class="chico">El golpe queda anulado</div>${mot}</div>`;
    }else if(d.resultado === 'mitad'){
      caja = `<div class="duelo-veredicto mitad${nuevo}"><div class="grande">⚠ PASA LA MITAD</div><div class="chico">Paró el golpe pero no lo frenó del todo: pasa la mitad del daño (redondeada para arriba)</div>
        <div class="duelo-motivo">🔧 ${_esc(item)} pierde 1 punto de durabilidad${d.dano && d.dano.desgaste ? ' <span style="font-weight:400">(ya se le descontó en su ficha)</span>' : ''}</div>${mot}</div>`;
    }else return '';
    // Contraataque (regla del dueño, 2026-10-01, P139): solo después de un Parry Y un Bloqueo exitosos — eso es «bloqueado». El paso
    // siguiente es una pregunta, Sí o No: con Sí se abre un duelo nuevo con los papeles al revés (quien defendía ataca). `contra`:
    // el id de ese duelo, 'no' si decidió no contraatacar, vacío mientras decide.
    let contra = '';
    if(d.resultado === 'bloqueado' && !d.contra){
      const propio = esMio(d.defensor);
      if(propio || soyGM()) contra = `<div class="duelo-contra"><div class="duelo-nota" style="margin-bottom:8px">⚔ ${propio ? 'Ganaste' : _esc(d.defensor.nombre) + ' ganó'} el Parry y el Bloqueo: <b>¿${propio ? 'contraatacás' : 'contraataca'} a ${_esc(d.atacante.nombre)}?</b><br><span style="opacity:.8">Cuesta lo de un primer ataque con su arma y se abre un duelo nuevo con los papeles al revés.</span></div>`
        + `<button type="button" data-contra>Sí, contraatacar${propio ? '' : ' (por ' + _esc(d.defensor.nombre) + ')'}</button> <button type="button" class="sec" data-contra-no>No</button></div>`;
      else contra = `<div class="duelo-mini">⚔ ${_esc(d.defensor.nombre)} puede contraatacar: está decidiendo…</div>`;
    }
    else if(d.contra === 'no') contra = `<div class="duelo-mini">${_esc(d.defensor.nombre)} decidió no contraatacar</div>`;
    else if(d.contra) contra = `<div class="duelo-mini">⚔ ${_esc(d.defensor.nombre)} contraatacó: hay otro duelo abierto</div>`;
    return caja + contra;
  }

  const NOMBRE_MULT = {1: 'SIN MULTIPLICADOR', 2: 'DOBLE DAÑO', 3: 'TRIPLE DAÑO', 4: 'CUÁDRUPLE DAÑO'};
  // El NIVEL del crítico (cuántos d20 se tiran) da el título antes de tirar: 1 = crítico, 2 = doble crítico, 3 = triple crítico… Después de tirar, el mejor d20 da el multiplicador del DAÑO (doble daño, triple daño…).
  const tituloNivel = n => n <= 1 ? '¡ES CRÍTICO!' : n === 2 ? '¡ES DOBLE CRÍTICO!' : n === 3 ? '¡ES TRIPLE CRÍTICO!' : n === 4 ? '¡ES CUÁDRUPLE CRÍTICO!' : `¡ES CRÍTICO DE NIVEL ${n}!`;

  // Paso 6 · Efectos del golpe: cada efecto es un momento propio (dado a la vista, «funcionó», «Aplicar»).
  function efectosHtml(d){
    const efs = d.efectos || [];
    // Efecto personalizado (2026-09-27, pedido del dueño — mismo criterio que `efectoLibre` en el veredicto):
    // texto libre, sin tirada ni botón «Aplicar», se muestra igual haya o no efectos automáticos.
    const nota = (d.hab && d.hab.efectosNota) || (d.ataque && d.ataque.efectosNota) || '';
    // ⚡ Critical Matters (2026-09-29, pedido del dueño — Lisiar): el texto libre de "si es crítico" solo se
    // muestra cuando el golpe SALIÓ crítico — d.crit ya está resuelto a esta altura (se evalúa antes del daño).
    const notaCritico = (d.crit && d.crit.critico && d.ataque && d.ataque.critico && d.ataque.critico.efectosNota) || '';
    // «Se resiste con» a mano (2026-09-28): la habilidad tira igual pero no hay stat automático que la resista.
    const contraOtro = (d.hab && d.hab.contraOtro) || '';
    if(!efs.length && !nota && !notaCritico && !contraOtro) return '';
    const puedeAtq = esMio(d.atacante) || soyGM();
    // El tablero de los dados (2026-10-04): una fila por efecto que se tira — su dado, con qué número funciona y qué salió.
    const conDado = efs.map((ef, i) => [ef, i]).filter(([ef]) => !siempreEf(ef));
    const faltan = efs.filter(ef => !ef.res && !ef.omitido && necesitaTiradaEf(ef));
    const fila = ([ef, i]) => {
      const clave = d.id + ':efd' + i, nuevo = ef.res && !revelado[clave];
      if(ef.res) revelado[clave] = true;
      const desde = ef.caras - ef.exitos + 1;
      const res = ef.omitido ? `<span class="no">no entra</span>` : !ef.res ? '<span class="espera">—</span>'
        : ef.res.exito ? `<b class="duelo-dado ok${nuevo ? ' nuevo' : ''}">${_fmt(ef.res.dado)}</b> <span class="ok duelo-funciono${nuevo ? ' nuevo' : ''}">¡FUNCIONÓ!</span>`
        : `<b class="duelo-dado${nuevo ? ' nuevo' : ''}">${_fmt(ef.res.dado)}</b> <span class="no">✘ no funcionó</span>`;
      return `<tr><td>🎲 d${_fmt(ef.caras)}</td><td><b>${_esc(ef.nombre)}</b> <span class="hint">${pctEf(ef)} %</span></td><td>${desde === ef.caras ? _fmt(desde) : `${_fmt(desde)}–${_fmt(ef.caras)}`}</td><td>${res}</td></tr>`;
    };
    const tablero = conDado.length ? `<div class="duelo-ef duelo-ef-tablero"><table><thead><tr><th>Dado</th><th>Efecto</th><th>Funciona con</th><th>Salió</th></tr></thead><tbody>${conDado.map(fila).join('')}</tbody></table>
      ${faltan.length ? (puedeAtq ? `<button type="button" data-ef-tirar-todos>🎲 Tirar ${faltan.length === 1 ? 'el efecto' : 'los efectos'} (${faltan.map(ef => siempreEf(ef) ? _esc(ef.dado) : '1d' + _fmt(ef.caras)).join(' · ')})</button>`
        : `<div class="espera duelo-nota">esperando que ${_esc(d.atacante.nombre)} tire los efectos…</div>`) : ''}</div>` : '';
    const cards = efs.map((ef, i) => {
      if(!siempreEf(ef) && !(ef.res && ef.res.exito && !ef.omitido && !ef.aplicado) && !ef.aplicado) return '';   // en el tablero: sin tirar, falló o no entra
      const clave = d.id + ':ef' + i;
      const nuevo = ef.res && !revelado[clave];
      if(ef.res) revelado[clave] = true;
      const prob = siempreEf(ef) ? 'siempre' : `${pctEf(ef)} % (${ef.exitos > 1 ? (ef.caras - ef.exitos + 1) + '–' : ''}${ef.caras} en d${ef.caras})`;   // «17 % (6 en d6)»
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
      else if(puedeAtq && !conDado.length) estado = `<button type="button" data-ef-tirar="${i}">🎲 Tirar ${siempreEf(ef) ? _esc(ef.dado) : '1d' + _fmt(ef.caras)}</button><div class="duelo-nota">${siempreEf(ef) ? '' : 'de ' + _fmt(ef.caras - ef.exitos + 1) + (ef.exitos > 1 ? ' a ' + _fmt(ef.caras) : '') + ' funciona · '}${ef.requiereDano ? 'necesita que el golpe haga daño' : 'entra aunque no pase el daño'}</div>`;
      else estado = `<div class="espera duelo-nota">esperando que ${_esc(d.atacante.nombre)} tire…</div>`;
      return `<div class="duelo-ef"><div class="duelo-ef-top"><b>${_esc(ef.nombre)}</b><span class="duelo-ef-prob">${_esc(prob)}</span></div>${ef.detalle ? `<div class="duelo-nota">${_esc(ef.detalle)}</div>` : ''}${estado}</div>`;
    }).join('');
    const contraCard = contraOtro ? `<div class="duelo-ef"><div class="duelo-nota">✋ Se resiste con: ${_esc(contraOtro)}</div></div>` : '';
    const notaCard = contraCard + (nota ? `<div class="duelo-ef"><div class="duelo-nota">✋ ${_esc(nota)}</div></div>` : '')
      + (notaCritico ? `<div class="duelo-ef"><div class="duelo-nota">⚡ Crítico: ${_esc(notaCritico)}</div></div>` : '');
    const pendiente = d.fase === 'efectos' && efs.length;
    return `<div class="duelo-paso"><h4><span class="n">${d.hab ? (d.hab.sinOposicion ? 2 : d.hab.dano ? 4 : 3) : 6}</span>${d.hab ? 'Efectos de la habilidad' : 'Efectos del golpe'}</h4>${notaCard}${tablero}${cards}${pendiente && puedeAtq ? '<div class="duelo-pie" style="margin-top:8px"><button type="button" class="sec" data-ef-terminar>Terminar sin resolver los que faltan</button></div>' : ''}</div>`;
  }
  const EstadosAplicarTexto = (spec, ef) => spec.cura ? `Curación de ${spec.cura} HP` : (typeof EstadosAplicar !== 'undefined' ? EstadosAplicar.texto(spec) : spec.nombre) + (spec.nombre === 'Armadura rota' && spec.stacks > 1 ? ` ×${spec.stacks}` : '');

  // Paso 5 · Daño: la tirada del arma, la cuenta y, cuando el GM lo aplica, el número grande y la vida.
  function danoHtml(d){
    const dn = d.dano;
    const crit = d.resultado === 'pego' && d.crit && d.crit.critico;
    const mult = crit ? d.crit.mult : 1;
    const arma = d.ataque.armaNombre ? ` · ${_esc(d.ataque.armaNombre)}` : '';
    let cuerpo;
    if(!dn){
      const soyAtq = esMio(d.atacante) && (cfgEscuchar.relay || (hooks() && hooks().soy && hooks().soy(d.atacante)));
      if(soyAtq) cuerpo = `<div style="text-align:center"><button type="button" data-dano-tirar>🎲 Tirar el daño${arma}</button>${flashHtml(d, 'dano')}<div class="duelo-nota" style="margin-top:6px">${crit ? `Es crítico: todo el daño se multiplica ×${mult} y va derecho a la vida (no se resta la Defensa).` : d.resultado === 'mitad' ? 'Pasa la mitad: (daño − Defensa) ÷ 2, redondeado para arriba.' : (d.hab && d.hab.dano && d.hab.dano.ignoraDef ? `Daño ${_esc(d.hab.dano.tipo)}: ignora la Defensa, no critica y va derecho a la vida.` : 'Se le resta la Defensa del defensor.')}</div></div>`;
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
        else if(dn.ignoraDef && d.hab) grande = `<div class="duelo-danonum rojo">${_fmt(golpe)}</div><div class="duelo-danosub rojo">DERECHO A LA VIDA</div><div class="duelo-danosub">daño ${_esc(d.hab.dano ? d.hab.dano.tipo : 'mágico')} · ignora la Defensa y no critica${dn.freno ? ` · lo frenan: ${_esc(dn.freno)} → entran ${_fmt(_num(dn.recibido) + _num(dn.absorbido))}` : ''}</div>`;
        else if(dn.ignoraDef) grande = `<div class="duelo-danonum rojo">${_fmt(golpe)}</div><div class="duelo-danosub rojo">DERECHO A LA VIDA</div><div class="duelo-danosub">${_fmt(dn.crudo)} × ${_fmt(dn.mult)} · el crítico ignora la Defensa</div>`;
        else if(dn.mitad) grande = `<div class="duelo-danonum">${_fmt(dn.recibido)}</div><div class="duelo-danosub">de daño (la mitad de ${_fmt(dn.crudo)} − Defensa ${_fmt(dn.defensa)}, redondeada para arriba${dn.freno ? `; además − ${_esc(dn.freno)}` : ''})</div>`;
        else grande = `<div class="duelo-danonum">${_fmt(dn.recibido)}</div><div class="duelo-danosub">de daño (${_fmt(dn.crudo)} − Defensa ${_fmt(dn.defensa)}${dn.freno ? ` − ${_esc(dn.freno)}` : ''})</div>`;
        const vida = dn.hpAntes !== undefined && dn.hpAntes !== null && dn.hpDespues !== undefined && dn.hpDespues !== null
          ? `<div class="duelo-mini">${_esc(d.defensor.nombre)}: <b>${_fmt(dn.hpAntes)}</b> → <b>${_fmt(dn.hpDespues)}</b> HP${_num(dn.absorbido) ? ` · el escudo absorbió ${_fmt(dn.absorbido)}` : ''}</div>` : '';
        const esp = dn.espinas ? `<div class="duelo-mini" style="color:#8fe3a9">🌵 Espinas: ${_esc(dn.espinas.quien || d.atacante.nombre)} recibe <b>${_fmt(dn.espinas.monto)}</b> de daño devuelto (1/4 del daño del golpe, directo a la vida)${dn.espinas.manual ? ' — <b>aplicalo a mano</b>' + (dn.espinas.motivo ? ' (' + _esc(dn.espinas.motivo) + ')' : '') : (dn.espinas.hpAntes !== undefined && dn.espinas.hpAntes !== null ? ` · ${_fmt(dn.espinas.hpAntes)} → ${_fmt(dn.espinas.hpDespues)} HP` : '')}</div>` : '';
        const dr = dn.drena ? `<div class="duelo-mini" style="color:#8fe3a9">🩸 Drena: ${_esc(dn.drena.quien || d.atacante.nombre)} se cura <b>${_fmt(dn.drena.monto)}</b>${dn.drena.manual ? ' — <b>aplicalo a mano</b>' + (dn.drena.motivo ? ' (' + _esc(dn.drena.motivo) + ')' : '') : `${dn.drena.hpAntes !== undefined && dn.drena.hpAntes !== null ? ` · ${_fmt(dn.drena.hpAntes)} → ${_fmt(dn.drena.hpDespues)} HP` : ''}${_num(dn.drena.excedente) ? ` · Excedente de vida ${_fmt(dn.drena.excedente)}` : ''}${dn.drena.nota ? ' · ' + _esc(dn.drena.nota) : ''}`}</div>` : '';
        const mg = dn.magico ? `<div class="duelo-mini" style="color:#9cc7ff">⚡ Daño de ${_esc(dn.magico.tipo)}: <b>${_fmt(dn.magico.total)}</b> (${_esc(dn.magico.formula || '')}) · ignora la Defensa, sin multiplicar${dn.magico.recibido !== undefined ? ` · recibió <b>${_fmt(dn.magico.recibido)}</b>` : ''}${dn.magico.hpDespues !== undefined ? ` · ${_fmt(dn.magico.hpAntes)} → ${_fmt(dn.magico.hpDespues)} HP` : ''}</div>` : '';
        cuerpo = tiro + `<div class="duelo-danobox${dn.ignoraDef ? ' crit' : ''}">${grande}</div>${vida}${mg}${esp}${dr}`;
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
  // Fase 'dodge' (Paso 4/7 del casteo, hechizo de área): el defensor ganó la Evasión y tiene el derecho a moverse
  // hasta 2 casilleros para intentar salir del área. El movimiento en sí no pasa por acá (ya cuesta No2 arrastrando
  // el token, como siempre): esto solo espera a que alguien diga "ya elegí" y revisa si logró salir.
  function dodgeHtml(d, nuevo){
    const puedeMapa = !!(cfgEscuchar && cfgEscuchar.chequearDodge);
    const puedeAMano = esMio(d.defensor) || soyGM();
    return `<div class="duelo-veredicto pego${nuevo ? ' nuevo' : ''}">
      <div class="grande">🏃 ¡GANÓ LA EVASIÓN!</div>
      <div class="chico">${_esc(d.defensor.nombre)} tiene derecho a un <b>dodge roll</b>: hasta 2 casilleros, arrastrando el token en el mapa (ya cuesta No2 solo, con Rengo/Inmovilizado de siempre). Si logra salir del área, no recibe nada; si sigue adentro por cualquier motivo, recibe el efecto completo — no hay término medio.</div>
      ${puedeMapa ? '<div class="duelo-contra" style="text-align:center;margin-top:10px"><button type="button" data-dodge-resolver>▶ Ya se movió (o decidió no hacerlo): revisar</button></div>' : ''}
      ${puedeAMano ? `<div class="duelo-nota" style="margin:8px 0 4px">${puedeMapa ? 'O a mano, si ya sabés el resultado:' : 'Se revisa mejor desde el mapa. A mano:'}</div>
        <div class="duelo-pie" style="justify-content:center"><button type="button" class="sec" data-dodge-manual="1">✔ Logró esquivar</button><button type="button" class="sec" data-dodge-manual="0">✘ Sigue adentro</button></div>` : ''}
      ${!puedeMapa && !puedeAMano ? '<div class="duelo-nota">esperando que se resuelva el dodge roll…</div>' : ''}
    </div>`;
  }
  // Cuadraditos del crítico (2026-09-27, pedido del dueño — hacer visible la cuenta abstracta de PdG/Evasión/Tipo/
  // rango/resistencia). Arriba, el Tipo del arma en cuadrados: los que se pierden por Crítico frecuente quedan
  // atenuados, el resto (el rango real) queda entero. Abajo, la tirada de PdG completa (no la diferencia — el
  // dueño pidió ver el total real): lo que se come la Evasión/Parry en rojo con una «E», y lo que queda se agrupa
  // de a «rango» — cada grupo entero es un nivel de crítico (azul); los que anula la Resistencia a crítico quedan
  // tachados cuadradito por cuadradito (no con una línea por encima de todo el grupo); lo que sobra sin llegar a
  // un grupo entero queda gris, suelto. Las dos filas se reordenan de a 5 (pedido del dueño, para contar de un
  // vistazo) y abajo hay una leyenda con lo que significa cada color/símbolo.
  function criticoVizHtml(d){
    const c = d.crit;
    const tipo = Math.max(1, Math.round(_num(d.ataque.tipoDado)));
    const rango = Math.max(1, Math.round(_num(c.rango)));
    const evaTotal = Math.max(0, Math.round(_num(d.eva.total)));
    const pdgTotal = Math.max(0, Math.round(_num(d.pdg.total)));
    const nivel = Math.max(0, Math.round(_num(c.nivel)));
    const resistencia = Math.max(0, Math.round(_num(c.resistencia)));
    const nombreDef2 = d.defensa && d.defensa.modo === 'parry' ? 'Parry' : 'Evasión';
    const cuad = (cls, txt) => `<div class="duelo-crit-cuad ${cls || ''}">${txt || ''}</div>`;
    // Agrupados de a 5 (pedido del dueño, para contar fácil de un vistazo) — el hueco extra cada 5 es solo
    // visual, no cambia nada del cálculo (el color/tachado de cada cuadradito ya dice lo que corresponde).
    const deA5 = arr => { const out = []; for(let i = 0; i < arr.length; i += 5) out.push(`<div class="duelo-crit-cinco">${arr.slice(i, i + 5).join('')}</div>`); return out.join(''); };

    // Fila del Rango: los cuadraditos que resta el Crítico frecuente van en verde con una «F» (pedido del dueño).
    const nFrec = Math.max(0, tipo - rango);
    const filaTipo = deA5(Array.from({length: tipo}, (_, i) => i < nFrec ? cuad('frec', 'F') : cuad('')));

    // La tirada, agrupada de a «rango» (2026-09-28, el dueño volvió a este agrupado en vez de a 5: cada grupo
    // entero es un nivel de crítico, así se cuentan de un vistazo). Primero lo que come la Evasión/Parry (rojo,
    // «E», de a 5 porque no es un nivel); los grupos que anula la Resistencia quedan tachados cuadradito por
    // cuadradito.
    const grupos = [];
    const nEva = Math.min(evaTotal, pdgTotal);
    for(let i = 0; i < nEva; i += 5) grupos.push(Array.from({length: Math.min(5, nEva - i)}, () => cuad('eva', 'E')));
    let quedan = Math.max(0, pdgTotal - evaTotal), grupo = 0, huboAnulado = false, huboSuelto = false;
    while(quedan >= rango){
      grupo++;
      const anulado = grupo > nivel - resistencia && grupo <= nivel;
      if(anulado) huboAnulado = true;
      grupos.push(Array.from({length: rango}, () => cuad(anulado ? 'anulado' : 'activo')));
      quedan -= rango;
    }
    if(quedan > 0){ huboSuelto = true; grupos.push(Array.from({length: quedan}, () => cuad('suelto'))); }
    const filaTirada = grupos.map(g => `<div class="duelo-crit-cinco">${g.join('')}</div>`).join('');

    const leyenda = [
      nFrec ? `${cuad('frec', 'F')}<span>= Crítico frecuente (${_fmt(nFrec)}): se resta del Tipo y achica el rango</span>` : '',
      evaTotal ? `${cuad('eva', 'E')}<span>= tirada de ${_esc(nombreDef2)}</span>` : '',
      `${cuad('activo')}<span>= cuenta para un nivel de crítico</span>`,
      huboAnulado ? `${cuad('anulado')}<span>= anulado por Resistencia a crítico (Tipo ${_fmt(tipo)})</span>` : '',
      huboSuelto ? `${cuad('suelto')}<span>= no llega a completar un nivel</span>` : '',
    ].filter(Boolean).map(t => `<div class="duelo-crit-ref">${t}</div>`).join('');

    return `<div class="duelo-crit-viz">
      <div class="duelo-crit-viz-tit">Rango del crítico: Tipo ${_fmt(tipo)}${tipo !== rango ? ` − Crítico frecuente = ${_fmt(rango)}` : ''}</div>
      <div class="duelo-crit-fila">${filaTipo}</div>
      <div class="duelo-crit-viz-tit">Tu tirada: PdG ${_fmt(pdgTotal)}${evaTotal ? ` − ${_esc(nombreDef2)} ${_fmt(evaTotal)}` : ''}</div>
      <div class="duelo-crit-fila">${filaTirada}</div>
      <div class="duelo-crit-leyenda">${leyenda}</div>
    </div>`;
  }
  function criticoHtml(d){
    const c = d.crit;
    const nombreDef = d.defensa && d.defensa.modo === 'parry' ? 'Parry' : 'Evasión';
    const cuenta = `PdG ${_fmt(d.pdg.total)} − ${nombreDef} ${_fmt(d.eva.total)} = ${_fmt(c.diferencia)} · rango del crítico ${_fmt(c.rango)} (Tipo ${_fmt(_num(d.ataque.tipoDado))}${_num(c.frecuente) ? ' − Crít. frecuente ' + _fmt(c.frecuente) : ''}) → nivel ${_fmt(c.nivel)}${_num(c.resistencia) ? ` − resistencia ${_fmt(c.resistencia)}` : ''}`;
    // Lo primero que se lee es el veredicto en grande; la cuenta que lo explica va debajo, en renglones.
    const titulo = (clase, txt) => `<div class="duelo-crit-titulo ${clase}">${txt}</div>`;
    const explica = lineas => `<div class="duelo-crit-explica">${lineas.map(l => `<div>${_esc(l)}</div>`).join('')}</div>`;
    const ignoraResistCrit = _num(d.ataque && d.ataque.mods && d.ataque.mods.ignoraResistCrit);
    const critBono = _num(d.ataque && d.ataque.mods && d.ataque.mods.critBono);
    const critpotBono = _num(d.ataque && d.ataque.mods && d.ataque.mods.critpotBono);
    const nombreHab = d.hab ? d.hab.nombre : d.ataque.habNombre || 'Esta habilidad';
    const lCuenta = [`PdG ${_fmt(d.pdg.total)} − ${nombreDef} ${_fmt(d.eva.total)} = ${_fmt(c.diferencia)} de diferencia`,
      `Rango del crítico: ${_fmt(c.rango)} (Tipo ${_fmt(_num(d.ataque.tipoDado))}${_num(c.frecuente) ? ' − Crítico frecuente ' + _fmt(c.frecuente) : ''})`,
      ...(ignoraResistCrit ? [`${_esc(nombreHab)} ignora ${_fmt(ignoraResistCrit)} de Resistencia a crítico del defensor.`] : []),
      ...(critBono ? [`${_esc(nombreHab)} suma +${_fmt(critBono)} a tu Crítico frecuente, solo en esta tirada.`] : []),
      ...(critpotBono ? [`${_esc(nombreHab)} suma +${_fmt(critpotBono)} a tu Crítico potente, solo en esta tirada.`] : []),
      ...(_num(d.critDatos && d.critDatos.ignora) ? [`${_esc(d.ataque.armaNombre || 'El arma')} ignora ${_fmt(d.critDatos.ignora)} de Resistencia a crítico del defensor.`] : []),
      ...(_num(c.d20extra) ? [`${_esc(d.ataque.armaNombre || 'El arma')} tira ${_fmt(c.d20extra)} d20 más en el crítico.`] : []),
      ...(_num(d.ataque && d.ataque.espalda && d.ataque.espalda.critpot) ? [`Por la espalda: +${_fmt(d.ataque.espalda.critpot)} a tu Crítico potente.`] : []),
      `Nivel del crítico: ${_fmt(c.nivel)}${_num(c.resistencia) ? ` − Resistencia a crítico ${_fmt(c.resistencia)} = ${_fmt(c.dados)} d20` : ''}`];
    let cuerpo;
    const viz = criticoVizHtml(d);
    if(!c.critico){
      const anulado = c.nivel > 0 && c.dados <= 0;
      cuerpo = titulo('no', '✘ NO ES CRÍTICO')
        + explica([anulado ? `La Resistencia a crítico (${_fmt(c.resistencia)}) del defensor anuló el crítico.` : `La diferencia (${_fmt(c.diferencia)}) no alcanza el rango del crítico (${_fmt(c.rango)}).`, ...lCuenta])
        + viz;
    }else if(!c.d20){
      const puede = esMio(d.atacante) || soyGM();
      cuerpo = titulo('posible', '💥 ' + tituloNivel(_num(c.dados)))
        + explica([`Ya es crítico y el golpe ignora la Defensa. Se tiran ${_fmt(c.dados)} d20 y el mejor decide cuánto se multiplica el daño.`, ...lCuenta])
        + viz
        + tablaCriticoHtml(c, d, 0)
        + `<div class="duelo-contra" style="text-align:center">${puede ? `<button type="button" data-critico>🎲 Tirar ${_fmt(c.dados)} d20</button>` : `<div class="espera duelo-nota">esperando que ${_esc(d.atacante.nombre)} tire el crítico…</div>`}</div>`;
    }else{
      // Los d20 como fichas: el más alto destaca con ondas concéntricas.
      const nuevoD20 = !revelado[d.id + ':d20']; revelado[d.id + ':d20'] = true;
      const iMejor = c.d20.indexOf(c.mejor);
      const fichas = `<div class="duelo-d20s">${c.d20.map((x, i) => `<div class="duelo-d20${(c.supercritico ? x === 20 : i === iMejor) ? ' mejor' : ''}${nuevoD20 ? ' nuevo' : ''}" style="animation-delay:${(i * 0.12).toFixed(2)}s">${_fmt(x)}</div>`).join('')}</div>`;
      cuerpo = titulo('si', c.supercritico ? `🌟 ¡SUPERCRÍTICO! ×${_fmt(c.mult)} · ${_fmt(c.supercritico)} VEINTES NATURALES` : `💥 ¡CRÍTICO! ×${_fmt(c.mult)} · ${NOMBRE_MULT[c.mult]}`)
        + fichas
        + explica([c.supercritico
            ? `d20: salieron ${_fmt(c.supercritico)} veintes naturales. Supercrítico: cada 20 vale ×4 y se suman (${Array(c.supercritico).fill('×4').join(' + ')} = ×${_fmt(c.mult)}), sin importar umbrales ni modificadores.`
            : `d20: el mejor fue ${_fmt(c.mejor)}${c.mult > 1 ? '' : ': no alcanza a multiplicar, pero SIGUE siendo crítico y el golpe ignora la Defensa'}.`, ...lCuenta])
        + viz
        + tablaCriticoHtml(c, d, c.mejor);
    }
    return `<div class="duelo-paso"><h4><span class="n">4</span>Crítico</h4>${cuerpo}</div>`;
  }

  // Cuántas revelaciones con dados tiene el duelo (el contacto, el Bloqueo, la moneda de un empate, los d20 del crítico,
  // el daño y cada efecto tirado): el cuadro espera a los dados 3D en cada una. La moneda es su propia revelación,
  // aparte de la de contacto/Bloqueo (que ya contaron al llegar las dos tiradas parejas) — así el cuadro también
  // espera a que el d6 quede quieto antes de mostrar quién ganó el empate (2026-09-27, pedido del dueño).
  const nReveal = d => (d.pdg && d.eva ? 1 : 0) + (d.fuerza && d.bloqueo ? 1 : 0)
    + ((d.contacto && d.contacto.moneda) || (d.bloq && d.bloq.moneda) ? 1 : 0)
    + (d.crit && d.crit.d20 ? 1 : 0) + (d.dano ? 1 : 0) + (d.efectos || []).filter(e => e && e.res && !siempreEf(e)).length;

  // Espera a que los dados 3D rueden y queden quietos (o un máximo, por si no hay animación) y llama a cb.
  function esperarDados(cb){
    let hecho = false, empezo = typeof dados !== 'undefined' && dados.rodando > 0, tMax, tMin;   // si los dados ya están rodando, no hace falta esperar a que «empiecen»
    const t0 = Date.now();
    const fin = () => {
      if(hecho) return;
      hecho = true;
      window.removeEventListener('dados-inicio', ini); window.removeEventListener('dados-quietos', quietos);
      clearTimeout(tMax); clearTimeout(tMin);
      setTimeout(cb, 400);   // un instante para verlos quietos
    };
    const ini = () => { empezo = true; };
    const quietos = () => { if(empezo) fin(); };
    window.addEventListener('dados-inicio', ini);
    window.addEventListener('dados-quietos', quietos);
    tMin = setTimeout(() => { if(!empezo) fin(); }, 2200);   // los dados no llegaron a empezar: no se espera más
    tMax = setTimeout(fin, 7000);
  }

  function dibujar(){
    const d = actual && actual.dato;
    const f = document.getElementById('duelo-fondo');
    if(!d || !f || actual.reteniendo) return;
    f.querySelectorAll('[data-manual]').forEach(i => { manual[i.dataset.manual] = i.value; });   // conservar lo tipeado a mano
    const nombreAtaque = nombreAtq(d);
    const nuevaClave = k => { const c = d.id + ':' + k; const nuevo = !revelado[c]; revelado[c] = true; return nuevo; };
    const contactoListo = !!(d.pdg && d.eva), bloqueoListo = !!(d.fuerza && d.bloqueo);
    if(!contactoListo) delete revelado[d.id + ':contacto'];   // tras un re-roll, el nuevo resultado vuelve a animarse
    if(!bloqueoListo) delete revelado[d.id + ':bloqueo'];
    if(!d.resultado) delete revelado[d.id + ':resultado'];
    if(!(d.crit && d.crit.d20)) delete revelado[d.id + ':d20'];
    const nuevoContacto = contactoListo ? nuevaClave('contacto') : false;
    const nuevoBloqueo = bloqueoListo ? nuevaClave('bloqueo') : false;
    let cierre = '';
    if(d.estado === 'empate' && d.empate) cierre = empateHtml(d, nuevaClave('empate' + d.empate.par));
    else if(d.resultado && (d.estado === 'resuelto' || d.fase === 'dano' || d.fase === 'efectos')) cierre = veredictoHtml(d, nuevaClave('resultado'));
    else if(d.estado === 'cancelado') cierre = `<div class="duelo-veredicto fallo"><div class="chico">${d.hab ? 'Cancelado' : 'Duelo cancelado'}</div></div>`;
    // Fin: cuando ya no queda ninguna reacción, un cartel claro y un botón para cerrarlo. «Duelo» es solo para el
    // combate cuerpo a cuerpo de siempre (PdG contra Evasión) — una habilidad (d.hab) usa un texto genérico, para
    // no llamarle "duelo" a un buff sobre uno mismo o un aliado (2026-09-29, pedido del dueño).
    const nuevoFin = d.estado === 'resuelto' && !revelado[d.id + ':fin'];
    if(d.estado === 'resuelto') revelado[d.id + ':fin'] = true;
    const finHtml = d.estado === 'resuelto'
      ? `<div class="duelo-fin${nuevoFin ? ' nuevo' : ''}"><div class="grande">🏁 ${d.hab ? 'LISTO' : 'FIN DEL DUELO'}</div><div class="chico">Ya no queda ninguna reacción por resolver.</div><button type="button" data-fin-duelo>${d.hab ? 'Listo, cerrar' : 'Terminar duelo'}</button></div>`
      : d.estado === 'cancelado' ? `<div class="duelo-fin"><div class="grande">🏁 ${d.hab ? 'CANCELADO' : 'DUELO CANCELADO'}</div><button type="button" data-fin-duelo>${d.hab ? 'Cerrar' : 'Terminar duelo'}</button></div>` : '';
    const puedoCancelar = abierto(d) && (soyGM() || d.creadoPor === yo());
    const min = f.classList.contains('min');
    const cajaAntes = f.querySelector('.duelo-caja'), scrollAntes = cajaAntes ? cajaAntes.scrollTop : 0;   // al redibujar no se pierde dónde estaba
    const mostrarBloqueo = d.fase === 'bloqueo' || !!d.bloq || (d.estado === 'empate' && d.empate && d.empate.par === 'bloqueo') || !!d.fuerza;
    f.innerHTML = `<div class="duelo-caja">
      <div class="duelo-cab"><span>${d.hab ? '✨' : '⚔'} ${_esc(nombreAtaque)}</span><div class="bt"><button type="button" data-min title="Minimizar (queda el botón «${d.hab ? 'Ver ejecución' : 'Ver duelo'}»)">—</button><button type="button" data-x title="Cerrar">✕</button></div></div>
      <div class="duelo-cuerpo">
        <div class="duelo-paso"><h4><span class="n">1</span>Declaración</h4>
          <div class="duelo-vs">
            <div class="duelo-lado atq"><div class="rol">${d.hab ? 'Usa la habilidad' : 'Ataca'}</div><div class="nom">${_esc(d.atacante.nombre)}</div><div class="sub">${d.hab ? _esc(d.hab.nombre) + (d.hab.tira ? ' · tira ' + _esc(d.hab.tira.etq) : '') : (d.ataque.armaNombre ? 'con ' + _esc(d.ataque.armaNombre) : 'sin arma') + ' · Tipo ' + _fmt(_num(d.ataque.tipoDado)) + (modsTxt(d) ? ' · ' + _esc(modsTxt(d)) : '')}</div></div>
            <div class="vs">VS</div>
            <div class="duelo-lado def"><div class="rol">${d.hab ? (d.hab.sinOposicion ? 'Objetivo' : 'Se resiste') : 'Defiende'}</div><div class="nom">${_esc(d.defensor.nombre)}</div><div class="sub">${d.defensor.tipo === 'creep' ? 'creep' : 'personaje'}${d.defensa ? ' · ' + _esc(nombreDefensa(d)) : ''}</div></div>
          </div></div>
        ${d.hab && d.hab.sinOposicion ? '' : `<div class="duelo-paso"><h4><span class="n">2</span>${d.hab ? '' : 'Contacto: '}${_esc(etqTira(d))} contra ${d.defensa || (d.hab && d.hab.contra.length === 1) ? _esc(etqContra(d)) : 'la defensa que elija'}</h4>
          <div class="duelo-tiros">${cajaHtml(d, 'pdg', 'eva', nuevoContacto)}${cajaHtml(d, 'eva', 'pdg', nuevoContacto)}</div>
          ${miniHtml(d, 'contacto')}
        </div>`}
        ${mostrarBloqueo ? `<div class="duelo-paso"><h4><span class="n">3</span>Bloqueo: Fuerza del golpe contra Bloqueo</h4>
          <div class="duelo-tiros">${cajaHtml(d, 'fuerza', 'bloqueo', nuevoBloqueo)}${cajaHtml(d, 'bloqueo', 'fuerza', nuevoBloqueo)}</div>
          ${miniHtml(d, 'bloqueo')}
        </div>` : ''}
        ${d.fase === 'dodge' ? dodgeHtml(d, nuevaClave('dodge')) : ''}
        ${d.crit ? criticoHtml(d) : ''}
        ${(d.fase === 'dano' || d.dano) ? danoHtml(d) : ''}
        ${efectosHtml(d)}
        ${cierre}
        ${finHtml}
        <div class="duelo-pie">
          ${puedoCancelar ? `<button type="button" class="sec" data-cancelarduelo>Cancelar${d.hab ? '' : ' duelo'}</button>` : ''}
          <button type="button" class="sec" data-min2>Minimizar</button>
          <button type="button" class="sec" data-x2>Cerrar</button>
        </div>
      </div></div>${rerollBtnHtml(d)}`;
    if(min) f.classList.add('min');
    // El paso en curso (el último que aparece, mientras el duelo siga abierto) late para llamar la atención.
    if(d.estado !== 'resuelto' && d.estado !== 'cancelado'){
      const pasos = f.querySelectorAll('.duelo-paso');
      if(pasos.length > 1) pasos[pasos.length - 1].classList.add('activo');
    }
    // Scroll: si cambió el paso en curso (o el duelo terminó) se enfoca ese recuadro; si solo se actualizó algo del mismo paso, se queda donde estaba.
    const caja = f.querySelector('.duelo-caja');
    if(caja){
      const clave = d.id + '|' + f.querySelectorAll('.duelo-paso').length + '|' + d.fase + '|' + d.estado + '|' + (d.empate ? d.empate.par : '');
      const cambio = f.dataset.pasoClave !== clave;
      f.dataset.pasoClave = clave;
      if(!cambio) caja.scrollTop = scrollAntes;
      else{
        const objetivo = f.querySelector('.duelo-paso.activo') || f.querySelector('.duelo-fin');
        if(objetivo) caja.scrollTop += objetivo.getBoundingClientRect().top - caja.getBoundingClientRect().top - 70;
      }
    }
    f.querySelector('[data-min]').onclick = minimizar;
    f.querySelector('[data-min2]').onclick = minimizar;
    f.querySelector('[data-x]').onclick = cerrar;
    f.querySelector('[data-x2]').onclick = cerrar;
    const bc = f.querySelector('[data-cancelarduelo]');
    if(bc) bc.onclick = () => col().doc(d.id).update({estado: 'cancelado'}).catch(err => console.error(err));
    const bDodgeResolver = f.querySelector('[data-dodge-resolver]');
    if(bDodgeResolver) bDodgeResolver.onclick = () => {
      bDodgeResolver.disabled = true;
      let adentro = true;
      try{ adentro = !!cfgEscuchar.chequearDodge(d); }catch(err){ console.error('Duelo: chequearDodge', err); }
      resolverDodge(d.id, !adentro).catch(err => { console.error(err); _toast('No se pudo resolver el dodge roll'); bDodgeResolver.disabled = false; });
    };
    f.querySelectorAll('[data-dodge-manual]').forEach(b => b.onclick = () => {
      f.querySelectorAll('[data-dodge-manual]').forEach(x => x.disabled = true);
      resolverDodge(d.id, b.dataset.dodgeManual === '1').catch(err => { console.error(err); _toast('No se pudo resolver el dodge roll'); });
    });
    f.querySelectorAll('[data-par]').forEach(b => b.onclick = () => {
      const [q, e] = b.dataset.par.split(':');
      f.querySelectorAll('[data-par]').forEach(x => x.disabled = true);
      elegirParidad(d.id, q, e).catch(err => { console.error(err); _toast('No se pudo tirar el desempate'); });
    });
    f.querySelectorAll('[data-tirar]').forEach(b => b.onclick = () => {
      const campo = b.dataset.tirar;
      b.disabled = true; b.textContent = 'Tirando…';
      enviar(campo === 'pdg' || campo === 'fuerza' ? d.atacante : d.defensor, {tipo: 'duelo-tirar', id: d.id, campo, flash: flashSel[d.id + ':' + campo] || ''});
      setTimeout(() => { if(actual && actual.dato && !actual.dato[campo]) dibujar(); }, 8000);
    });
    f.querySelectorAll('[data-def]').forEach(b => b.onclick = () => {
      const o = (opciones[d.id] || [])[Number(b.dataset.def)];
      if(!o) return;
      f.querySelectorAll('[data-def]').forEach(x => x.disabled = true);
      enviar(d.defensor, {tipo: 'duelo-tirar', id: d.id, campo: 'eva', modo: o.modo, itemId: o.itemId || '', flash: flashSel[d.id + ':eva'] || ''});
      setTimeout(() => { if(actual && actual.dato && !actual.dato.eva){ opcionesPedidas.delete(d.id); dibujar(); } }, 8000);
    });
    f.querySelectorAll('[data-flash]').forEach(b => b.onclick = () => {   // marcar o desmarcar el Flash de esta tirada
      const [campo, habId] = b.dataset.flash.split(':'), k = d.id + ':' + campo;
      flashSel[k] = flashSel[k] === habId ? '' : habId;
      dibujar();
    });
    f.querySelectorAll('[data-tirarpor]').forEach(b => b.onclick = () => tirarPorAusente(d, b.dataset.tirarpor));
    const brd = f.querySelector('[data-reintentar-def]');
    if(brd) brd.onclick = () => { opcionesPedidas.delete(d.id); delete opcionesFalla[d.id]; delete opciones[d.id]; dibujar(); };
    const btt = f.querySelector('[data-ef-tirar-todos]');
    if(btt) btt.onclick = () => { btt.disabled = true; btt.textContent = 'Tirando…'; tirarEfectos(d.id).catch(err => { console.error(err); _toast('No se pudieron tirar los efectos'); }); };
    f.querySelectorAll('[data-ef-tirar]').forEach(b => b.onclick = () => { b.disabled = true; b.textContent = 'Tirando…'; tirarEfecto(d.id, Number(b.dataset.efTirar)).catch(err => { console.error(err); _toast('No se pudo tirar el efecto'); }); });
    f.querySelectorAll('[data-ef-aplicar]').forEach(b => b.onclick = () => { b.disabled = true; marcarEfecto(d.id, Number(b.dataset.efAplicar), {aplicar: 'pedido'}).catch(err => { console.error(err); _toast('No se pudo pedir la aplicación'); }); });
    f.querySelectorAll('[data-ef-mano]').forEach(b => b.onclick = () => { b.disabled = true; marcarEfecto(d.id, Number(b.dataset.efMano), {aplicado: true, aplicar: '', nota: 'a mano'}).catch(err => console.error(err)); });
    const bft = f.querySelector('[data-ef-terminar]');
    if(bft) bft.onclick = () => terminarEfectos(d.id).catch(err => console.error(err));
    const bdt = f.querySelector('[data-dano-tirar]');
    if(bdt) bdt.onclick = () => { bdt.disabled = true; bdt.textContent = 'Tirando…'; enviar(d.atacante, {tipo: 'duelo-tirar', id: d.id, campo: 'dano', flash: flashSel[d.id + ':dano'] || ''}); setTimeout(() => { if(actual && actual.dato && !actual.dato.dano) dibujar(); }, 8000); };
    const bam = f.querySelector('[data-aplicar-mano]');
    if(bam) bam.onclick = () => { const v = Math.max(0, Math.round(_num((f.querySelector('[data-manual="recibido"]') || {}).value))); guardarAplicacion(d.id, {manual: true, golpe: v, recibido: v, mult: 1, crudo: d.dano.crudo, motivoManual: 'lo aplicó el GM a mano'}).catch(err => console.error(err)); };
    const bcr = f.querySelector('[data-critico]');
    if(bcr) bcr.onclick = () => { bcr.disabled = true; bcr.textContent = 'Tirando…'; tirarCritico(d.id).catch(err => { console.error(err); _toast('No se pudo tirar el crítico'); }); };
    const brr = f.querySelector('[data-reroll]');
    if(brr) brr.onclick = () => {
      const [lado, campo] = brr.dataset.reroll.split(':');
      brr.disabled = true;
      enviar(d[lado], {tipo: 'duelo-reroll', id: d.id, campo});
      delete rerollInfo[d.id + ':' + lado]; rerollPedidas.delete(d.id + ':' + lado);
      setTimeout(() => { if(actual && actual.dato) dibujar(); }, 4000);
    };
    const bfin = f.querySelector('[data-fin-duelo]');
    if(bfin){ bfin.onclick = cerrar; if(nuevoFin){ try{ bfin.scrollIntoView({behavior: 'smooth', block: 'nearest'}); }catch(err){} } }
    const bcon = f.querySelector('[data-contra]');
    if(bcon) bcon.onclick = () => { bcon.disabled = true; enviar(d.defensor, {tipo: 'duelo-contra', id: d.id}); };
    const bconNo = f.querySelector('[data-contra-no]');
    if(bconNo) bconNo.onclick = () => {
      bconNo.disabled = true;
      col().doc(d.id).update({contra: 'no'}).catch(err => { console.error('Duelo: no se pudo anotar «no contraatacar»', err); bconNo.disabled = false; _toast('No se pudo anotar la respuesta: probá de nuevo'); });
    };
  }

  /* ---------- las tiradas: lo que corre en la página del dueño (iframe del mapa o página suelta) ---------- */
  const RE_CAMPO = {pdg: /pdg/i, eva: /evasi|parry/i, fuerza: /fuerza/i, bloqueo: /bloqueo/i, dano: /da[ñn]o/i};

  async function ejecutar(m, hk){
    const h = hk || hooks();
    if(!h || !disponible()) return;
    try{
      const doc = await col().doc(m.id).get();
      if(!doc.exists) return;
      const d = {id: m.id, ...doc.data()};
      if(m.tipo === 'duelo-opciones'){
        const ops = (h.soy && h.soy(d.defensor)) ? (d.hab ? opcionesHab(d, h) : ((h.opcionesDefensa ? h.opcionesDefensa(d) : []) || []).filter(o => !(d.ataque && d.ataque.sinParry && o.modo === 'parry'))) : null;   // null = este personaje/creep no es el mío
        if(enIframe()) window.parent.postMessage({tipo: 'duelo-opciones-res', id: d.id, opciones: ops}, location.origin);
        else recibirOpciones(d.id, ops);
        return;
      }
      if(m.tipo === 'duelo-reroll-info'){   // ¿tengo una moneda de re-roll?
        const lado = m.lado === 'defensor' ? d.defensor : d.atacante;
        const info = (h.soy && h.soy(lado) && h.rerollInfo) ? (h.rerollInfo(d) || {disponible: false}) : {disponible: false};
        if(enIframe()) window.parent.postMessage({tipo: 'duelo-reroll-info-res', id: d.id, lado: m.lado, info}, location.origin);
        else recibirRerollInfo(d.id, m.lado, info);
        return;
      }
      if(m.tipo === 'duelo-reroll'){   // usar la moneda: verifica, cobra, reabre la tirada y tira la moneda
        const lado = (m.campo === 'pdg' || m.campo === 'fuerza' || m.campo === 'critico') ? d.atacante : d.defensor;
        if(!(h.soy && h.soy(lado) && h.rerollUsar) || !puedeReabrir(d, m.campo)){ _toast('Esa tirada ya no se puede repetir'); return; }
        await h.rerollUsar(d, m.campo);
        return;
      }
      if(m.tipo === 'duelo-flash'){   // ¿qué Flash tengo para esta tirada?
        const lado = (m.campo === 'pdg' || m.campo === 'fuerza' || m.campo === 'dano') ? d.atacante : d.defensor;
        const ops = (h.soy && h.soy(lado) && h.flashOpciones) ? (h.flashOpciones(d, m.campo) || []) : [];
        if(enIframe()) window.parent.postMessage({tipo: 'duelo-flash-res', id: d.id, campo: m.campo, opciones: ops}, location.origin);
        else recibirFlash(d.id, m.campo, ops);
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
      if(!hk) document.querySelectorAll('.scrim.open').forEach(s => s.classList.remove('open'));   // sin la Botonera abierta debajo
      let defensa = null;
      if(campo === 'eva'){
        const op = (d.hab ? opcionesHab(d, h) : (h.opcionesDefensa ? h.opcionesDefensa(d) : [])).find(o => o.modo === m.modo && (o.itemId || '') === (m.itemId || ''));
        if(!op || op.motivoNo) return;
        defensa = {modo: op.modo, itemId: op.itemId || '', itemNombre: op.itemNombre || '', costo: _num(op.costo)};
      }
      let extra = null;
      if(!d.hab && campo === 'pdg' && h.statsCritico) extra = h.statsCritico(d) || null;
      if(!d.hab && campo === 'eva' && h.resistenciaCritico) extra = {resistencia: _num(h.resistenciaCritico(d))};
      // ⚡ Critical Matters (2026-09-29): a esta altura (el daño se tira después del crítico, ver entrarCritico)
      // d.crit ya está resuelto — si el golpe salió crítico, los efectos de duelo.critico.efectos se suman a
      // los de siempre (arma + habilidad), mismo mecanismo de "recordar y tirar" que ya usan efectosArma/efectos.
      if(campo === 'dano') extra = {efectos: d.hab ? [] : [...(h.efectosArma ? (h.efectosArma(d) || []) : []), ...((d.ataque && d.ataque.efectos) || []),
        ...((d.crit && d.crit.critico && d.ataque && d.ataque.critico && d.ataque.critico.efectos) || [])]};
      if(campo !== 'dano') retener(true);   // el PdG / Evasión / Parry / Fuerza / Bloqueo se muestran juntos cuando tiran los dos (elegir la defensa es a ciegas)
      let re = campo === 'eva' ? (m.modo === 'parry' ? /parry/i : /evasi/i) : RE_CAMPO[campo];
      if(d.hab && campo === 'pdg') re = new RegExp(escRe(etqTira(d)), 'i');
      if(d.hab && campo === 'eva'){ const c = d.hab.contra.find(x => x.modo === m.modo); re = new RegExp(escRe(c ? c.etq : m.modo), 'i'); }
      let flash = null;   // Flash marcado: la página cobra los SP y el bono se suma a la tirada cuando llegue
      if(m.flash && h.flashUsar){
        // flashUsar puede preguntar algo antes de cobrar (un creep: «¿es su turno?», P136) — se espera la respuesta; dentro
        // del mapa, el cartel hace que se muestre la ventana de esta página.
        const pedido = h.flashUsar(d, campo, m.modo || '', m.flash);
        setTimeout(avisarMapaUi, 120);
        flash = (await pedido) || null;
        if(!flash) _toast('No se usó el Flash: se tira sin él');
        delete flashOps[d.id + ':' + campo]; flashPedidas.delete(d.id + ':' + campo);
      }
      esperaTiro = {id: d.id, campo, re, defensa, extra, flash};
      if(d.hab && (campo === 'pdg' || campo === 'eva')){
        if(h.habTirar) h.habTirar(d, campo === 'pdg' ? 'atacante' : 'defensor', m.modo);
        else{ esperaTiro = null; retener(false); _toast('Esta página no sabe tirar habilidades'); }
      }
      else if(d.hab && campo === 'dano') tirarDanoHab(d, h);
      else if(campo === 'pdg') h.atacar(d);
      else if(campo === 'eva') h.defender(d, m.modo, m.itemId || '');
      else if(campo === 'fuerza') h.fuerza(d);
      else if(campo === 'dano') h.dano(d);
      else h.bloquear(d);
      setTimeout(avisarMapaUi, 350);
    }catch(err){
      console.error('Duelo: no se pudo ejecutar el pedido', err);
      esperaTiro = null;
      retener(false);
      _toast('No se pudo tirar: ' + (err.message || err));
      avisarMapaUi();
    }
  }

  window.addEventListener('tirada-registrada', e => {
    if(!esperaTiro) return;
    const det = e.detail || {}, r = det.r || {};
    if(!esperaTiro.re.test(String(det.origen || ''))) return;
    const {id, campo, defensa, extra, flash} = esperaTiro;
    esperaTiro = null;
    retener(false);
    let rr = r;
    // Una Evasión contra oportunidad / contra contraataque (2026-10-04): la página la etiqueta «Evasión (+2 contra oportunidad)»; el duelo guarda esa nota.
    const notaEsp = String(det.origen || '').match(/\(([+−-]\s*\d+\s+contra [^)]*)\)/);
    if(notaEsp) rr = {...r, nota: notaEsp[1]};
    if(flash && _num(flash.bono)){   // el Flash suma un «+» fijo a la tirada (y cuenta como tal en el desempate)
      rr = {...r, mod: _num(r.mod) + _num(flash.bono), total: _num(r.total) + _num(flash.bono), formula: String(r.formula || '') + ` +${_num(flash.bono)} ⚡`};
      anunciarMesa(`⚡ ${flash.etq || 'Flash'}: +${_num(flash.bono)} a ${ETQ_FLASH[campo === 'eva' ? 'eva' : campo] || 'la tirada'} (${flash.quien || 'un jugador'})`);
    }
    (campo === 'dano' ? guardarDano(id, rr, extra && extra.efectos) : guardarTiro(id, campo, rr, defensa, extra)).catch(err => { console.error('Duelo: no se pudo guardar la tirada', err); _toast('No se pudo anotar la tirada en el duelo'); })
      .then(() => avisarMapaUi());
  });

  // Adentro de un iframe del mapa: le cuenta si hay algún cartelito abierto (Nitros, sobrepeso…) que el jugador tiene que ver, o si ya puede esconderse.
  function avisarMapaUi(){
    if(!enIframe()) return;
    const abiertoUi = !!document.querySelector('.scrim.open, .pap-fondo, #ct-fondo');
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
    if(m.tipo === 'duelo-opciones' || m.tipo === 'duelo-tirar' || m.tipo === 'duelo-contra' || m.tipo === 'duelo-flash' || m.tipo === 'duelo-reroll-info' || m.tipo === 'duelo-reroll') ejecutar(m);
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
    const cHab = d.hab && campo === 'eva' ? (d.hab.contra.find(x => x.modo === modo) || d.hab.contra[0]) : null;
    const etiqueta = campo === 'eva' ? (cHab ? cHab.etq : (modo === 'parry' ? 'Parry' : 'Evasión')) : (campo === 'pdg' && d.hab) ? etqTira(d) : ETIQ[campo];
    const r = {formula: f.formula, rolls, mod: f.mod, total};
    if(campo === 'dano' && typeof mesaPublicar === 'function'){ try{ mesaPublicar(`${lado.nombre} · ${etiqueta} (a mano)`, r); }catch(err){} }   // las tiradas de un par se publican juntas cuando tiran los dos
    (campo === 'dano' ? guardarDano(d.id, r) : guardarTiro(d.id, campo, r, defensa)).catch(err => { console.error(err); _toast('No se pudo anotar la tirada en el duelo'); });
  }

  // El daño de una habilidad: la fórmula que dejó la habilidad (ya con lo que suma el que la usa), tirada por quien la usa.
  function tirarDanoHab(d, h){
    const f = d.hab && d.hab.dano ? d.hab.dano.formula : '';
    const r = f && typeof tirarDados === 'function' ? tirarDados(f) : null;
    if(!r){ esperaTiro = null; retener(false); _toast('La fórmula de daño de la habilidad no es válida: ' + f); return; }
    const reg = (h && h.registrarTirada) || (typeof registrarTirada === 'function' ? registrarTirada : null);
    if(reg) reg(`Daño · ${d.hab.nombre}`, r);
  }

  /* ---------- lo que se ve de un duelo que esta pantalla no tiene abierto (P151, dueño 2026-10-03: «las dos») ----------
     Cada paso que ya pasó (contacto, Bloqueo, crítico, daño, efectos, fin) se revela en esta pantalla recién cuando los dados 3D quedan
     quietos («primero los dados, después el resultado»): el botón «Ver duelo» dice en qué va y, si el cuadro no está abierto acá,
     `cfg.paso(d, nuevos, todos)` (el mapa) lo cuenta en la Crónica. Solo lo público: el daño que recibió, no la vida que le queda. */
  const pasosVistos = new Map();       // id → Set de claves ya reveladas en esta pantalla
  const pasosEnEspera = new Set();     // 'id:clave' esperando a los dados
  const resueltoDesde = new Map();     // id → cuándo esta pantalla lo vio resolverse (el botón queda un rato)
  let pasosListo = false;              // el primer aviso: lo que ya había pasado no se anuncia
  function pasosDe(d){
    const P = [];
    const g = d.contacto && d.contacto.gana;
    if(d.pdg && d.eva && g){
      const desemp = d.contacto.desempate ? ' (desempate)' : '';
      if(d.hab) P.push({clave: 'contacto', dados: 1, txt: `${etqTira(d)} ${d.pdg.total} contra ${etqContra(d)} ${d.eva.total} → ${g === 'atacante' ? 'funcionó' : 'se resistió'}${desemp}`});
      else{
        const parry = d.defensa && d.defensa.modo === 'parry';
        P.push({clave: 'contacto', dados: 1, txt: `PdG ${d.pdg.total} contra ${parry ? 'Parry' : 'Evasión'} ${d.eva.total} → ${g === 'atacante' ? 'pegó' : parry ? 'lo frena el Parry' : 'falló'}${desemp}`});
      }
    }
    if(d.fuerza && d.bloqueo && d.bloq && d.bloq.gana) P.push({clave: 'bloqueo', dados: 1, txt: `Fuerza ${d.fuerza.total} contra Bloqueo ${d.bloqueo.total} → ${d.bloq.gana === 'defensor' ? 'bloqueó' : 'pasa la mitad'}`});
    if(d.crit && d.crit.d20 && d.crit.critico) P.push({clave: 'critico', dados: 1, txt: `${_num(d.crit.supercritico) >= 2 ? '¡SUPERCRÍTICO' : '¡Crítico'} ×${d.crit.mult}!`});
    const dn = d.dano;
    if(dn && dn.aplicado){
      const n = dn.recibido !== undefined && dn.recibido !== null ? dn.recibido : dn.golpe;
      P.push({clave: 'dano', txt: dn.invulnerable ? `${d.defensor.nombre} es Invulnerable: no le hace nada`
        : dn.manual ? `Daño ${_num(dn.golpe)} (se aplica a mano)` : `${d.defensor.nombre} recibe ${_num(n)} de daño`});
      if(dn.magico && dn.magico.recibido !== undefined) P.push({clave: 'magico', txt: `…y ${_num(dn.magico.recibido)} de ${dn.magico.tipo}`});
      if(dn.drena && !dn.drena.manual) P.push({clave: 'drena', txt: `${dn.drena.quien || d.atacante.nombre} se cura ${_num(dn.drena.monto)}`});
      if(dn.espinas) P.push({clave: 'espinas', txt: `Espinas: ${dn.espinas.quien || d.atacante.nombre} recibe ${_num(dn.espinas.monto)}`});
    }
    (d.efectos || []).forEach((ef, i) => {
      if(ef.omitido) P.push({clave: 'ef' + i, txt: `${ef.nombre}: no entra`});
      else if(ef.res) P.push({clave: 'ef' + i, dados: siempreEf(ef) ? 0 : 1, txt: `${ef.nombre}: ${ef.res.exito ? 'funcionó' : 'no funcionó'}`});
    });
    if(d.estado === 'resuelto'){
      const fin = d.hab ? {pego: 'La habilidad funcionó', fallo: 'El objetivo la resistió'}[d.resultado]
        : {pego: 'El golpe pegó', fallo: 'El golpe falló', bloqueado: 'El golpe fue bloqueado', mitad: 'Pasó la mitad del daño'}[d.resultado];
      P.push({clave: 'fin', txt: `🏁 ${fin || 'Terminó'}`});
    }
    return P;
  }
  const pasosRevelados = d => { const v = pasosVistos.get(d.id); return v ? pasosDe(d).filter(p => v.has(p.clave)) : []; };
  function revisarPasos(){
    const ahora = Date.now();
    listaDuelos.forEach(d => {
      if(d.estado === 'resuelto' && !resueltoDesde.has(d.id)) resueltoDesde.set(d.id, pasosListo ? ahora : (d.creado && d.creado.toMillis ? d.creado.toMillis() : ahora));
      let vistos = pasosVistos.get(d.id);
      if(!vistos){ vistos = new Set(); pasosVistos.set(d.id, vistos); }
      const nuevos = pasosDe(d).filter(p => !vistos.has(p.clave) && !pasosEnEspera.has(d.id + ':' + p.clave));
      if(!nuevos.length) return;
      const grande = actual && actual.id === d.id && !actual.min;
      if(!pasosListo || grande || descartados.has(d.id)){ nuevos.forEach(p => vistos.add(p.clave)); return; }   // ya se ve en el cuadro (o no interesa)
      nuevos.forEach(p => pasosEnEspera.add(d.id + ':' + p.clave));
      const revelar = () => {
        nuevos.forEach(p => { vistos.add(p.clave); pasosEnEspera.delete(d.id + ':' + p.clave); });
        const dd = listaDuelos.find(x => x.id === d.id) || d;
        dibujarChips();
        if(cfgEscuchar.paso && !(actual && actual.id === d.id && !actual.min)){
          try{ cfgEscuchar.paso(dd, nuevos, pasosRevelados(dd)); }catch(err){ console.error('Duelo: paso', err); }
        }
      };
      if(nuevos.some(p => p.dados) && !document.hidden) esperarDados(revelar); else revelar();   // oculta: no hay dados que esperar
    });
    pasosListo = true;
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
      if(d.estado === 'resuelto' && ahora - (resueltoDesde.get(d.id) || t) > RESUELTO_VISIBLE_MS) return;   // a contar desde que se resolvió
      if(d.estado === 'cancelado') return;
      const abiertoAhora = actual && actual.id === d.id && !actual.min;
      if(abiertoAhora) return;
      mostrar.set(d.id, d);
    });
    if(actual && actual.min && actual.dato && !mostrar.has(actual.id)) mostrar.set(actual.id, actual.dato);
    [...chips.keys()].forEach(id => { if(!mostrar.has(id)){ chips.get(id).remove(); chips.delete(id); } });
    const RES = {pego: '⚔ Pegó', fallo: '🛡 Falló', bloqueado: '🛡 Bloqueó', mitad: '⚠ Pasó la mitad'};
    const critico = d => d.resultado === 'pego' && d.crit && d.crit.critico;
    mostrar.forEach((d, id) => {
      const ult = pasosRevelados(d).filter(p => p.clave !== 'fin').pop();   // en qué va (lo ya revelado en esta pantalla)
      const txt = d.estado === 'resuelto'
        ? `${critico(d) ? '💥 ¡CRÍTICO ×' + d.crit.mult + '!' : (RES[d.resultado] || 'Resuelto')}: ${d.atacante.nombre} → ${d.defensor.nombre} · ver`
        : d.fase === 'critico' ? `💥 Crítico: ${d.atacante.nombre} → ${d.defensor.nombre} · tirar d20`
        : d.fase === 'dodge' ? `🏃 Dodge roll: ${d.defensor.nombre} vs. ${d.hab ? d.hab.nombre : 'área'}`
        : d.estado === 'empate' ? `⚖ Empate: ${d.atacante.nombre} → ${d.defensor.nombre} · elegir par o impar`
        : ult ? `${d.hab ? '✨' : '⚔'} ${d.atacante.nombre} → ${d.defensor.nombre} · ${ult.txt}`
        : d.hab ? `✨ Ver ejecución: ${d.atacante.nombre} → ${d.defensor.nombre}` : `⚔ Ver duelo: ${d.atacante.nombre} → ${d.defensor.nombre}`;
      let el = chips.get(id);
      if(!el){
        el = document.createElement('button');
        el.type = 'button';
        el.onclick = () => abrir(id);
        contenedorAvisos().appendChild(el);
        chips.set(id, el);
      }
      // Mientras un paso espera a los dados, el botón no lo adelanta (ni el «💥 Crítico» que viene después).
      if(el.textContent && [...pasosEnEspera].some(k => k.startsWith(id + ':'))) return;
      el.className = 'duelo-chip' + (d.estado === 'resuelto' ? ' res' : '');
      el.textContent = txt;
      el.title = d.hab ? 'Ver la ejecución' : 'Ver el duelo';
    });
    // Hook opcional (2026-09-27, pedido del dueño): el mapa lo usa para hacer latir en el
    // lienzo a los dos tokens de cada duelo que quedó minimizado/de fondo para esta pantalla —
    // así se entiende entre quiénes hay acción sin reabrir el cuadro grande. No rompe ficha ni
    // gm-tools, que no lo definen.
    if(typeof dueloParesActivos === 'function'){
      dueloParesActivos([...mostrar.values()]
        .filter(d => d.estado !== 'resuelto')
        .map(d => ({id: d.id, atacanteTokenId: d.atacante && d.atacante.tokenId, defensorTokenId: d.defensor && d.defensor.tokenId, fase: d.fase})));
    }
  }

  // cfg.opcionesLocal(duelo) → opciones de defensa o null (el mapa del GM las calcula solo para un creep, sin cargar las Acciones).
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
      revisarPasos();
      dibujarChips();
      listaDuelos.forEach(publicarResumenSiCorresponde);   // el resumen final en la Mesa
      // Hechizo de área (Paso 4/7 del casteo): un sub-duelo con `grupo` que se resolvió — el mapa (GM) avanza la cascada
      // al siguiente objetivo o cierra el grupo si era el último.
      if(cfgEscuchar.grupoResuelto && soyGM()){
        listaDuelos.forEach(d => {
          if(!d.grupo || d.estado !== 'resuelto' || grupoAvisado.has(d.id)) return;
          grupoAvisado.add(d.id);
          try{ cfgEscuchar.grupoResuelto(d); }catch(err){ console.error('Duelo: grupoResuelto', err); }
        });
      }
      // Fase 'dodge' de un hechizo de área (pedido del dueño, 2026-09-27): avisa cuando un duelo ENTRA y cuando SALE
      // de la fase (se resolvió, moviéndose o declinando) — el mapa usa esto para minimizar/reabrir el cuadro solo y
      // mostrar un cartel de "no me quiero mover" mientras le toca decidir a quien defiende (o al GM).
      if(cfgEscuchar.dodgeEmpieza || cfgEscuchar.dodgeTermina){
        const enDodgeAhora = new Map(listaDuelos.filter(d => d.fase === 'dodge' && d.estado === 'esperando').map(d => [d.id, d]));
        enDodgeAhora.forEach((d, id) => {
          if(dodgeActivos.has(id)) return;
          dodgeActivos.add(id);
          if(cfgEscuchar.dodgeEmpieza) try{ cfgEscuchar.dodgeEmpieza(d); }catch(err){ console.error('Duelo: dodgeEmpieza', err); }
        });
        [...dodgeActivos].forEach(id => {
          if(enDodgeAhora.has(id)) return;
          dodgeActivos.delete(id);
          const d = listaDuelos.find(x => x.id === id) || {id};
          if(cfgEscuchar.dodgeTermina) try{ cfgEscuchar.dodgeTermina(d); }catch(err){ console.error('Duelo: dodgeTermina', err); }
        });
      }
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
            const crit = d.resultado === 'pego' && d.crit && d.crit.critico;
            await guardarAplicacion(d.id, {golpe: 0, ...info});
          }).catch(err => console.error('Duelo: error al aplicar el daño', err));
        });
      }
      // El GM (en el mapa) aplica los efectos que el atacante pidió («Aplicar») — y, desde el 2026-09-29, también
      // uno mismo cuando el efecto es sobre su propio personaje (`esMio(d.defensor)`, ej. Blindaje): antes esto
      // dependía SIEMPRE de que el GM tuviera el mapa abierto y conectado, así que un buff sobre uno mismo se
      // quedaba en «Aplicando…» para siempre si nadie más estaba mirando. Escribir la propia ficha nunca
      // necesita permiso de nadie más, así que no hace falta esperar al GM para eso puntual.
      if(cfgEscuchar.aplicarEfecto){
        listaDuelos.forEach(d => {
          if(d.fase !== 'efectos' || !(soyGM() || esMio(d.defensor))) return;
          (d.efectos || []).forEach((ef, i) => {
            const clave = d.id + ':' + i;
            if(ef.aplicar !== 'pedido' || ef.aplicado || aplicando.has(clave)) return;
            const sp = specDeEfecto(ef);
            if(sp && sp.nombre === 'Demora' && !cfgEscuchar.aplicaDemora) return;   // el orden de turnos lo mueve el mapa
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

  return {estilos: inyectarCss, esperarDados, limpiarEspalda, guardarDano, entrarCritico, reabrir, puedeReabrir, recibirRerollInfo, recibirFlash, opcionesHab, disponible, elegirObjetivo, crear, abrir, cerrar, minimizar, escuchar, recibirOpciones, specDeEfecto, resolverDodge, limpiarHab, pasosDe};
})();
