/* =========================================================
   GLOSARIO — los términos del juego que se explican al pasar el mouse (2026-10-09, pedido del dueño: «que el bono Pasos de baile, Perfora o
   Crítico frecuente aparezca como un vínculo, con otro color, y al pasar el mouse se abra la descripción de cómo funciona»).
   Un solo lugar con cada término y su explicación corta, armado de lo que ya está escrito:
   - los estados alterados (comun/estados-presets.js: su `detalle`, sin las notas ⚙/✋),
   - los bonos de las piezas (comun/ficha-calculo.js: el `full` de cada stat),
   - las mecánicas de armas y flechas (`MECANICAS`, acá abajo; antes vivían en «Detalles técnicos» de comun/item-corto.js).
   Glosario.marcar(texto) → HTML con cada término conocido (la primera vez que aparece) en un <span class="glo">; el globo lo muestra este
   archivo solo, en cualquier pantalla (también adentro de los recuadros aislados del mapa: mira `composedPath`).
   Glosario.def(termino) → {titulo, texto} | null. Glosario.CSS: el estilo del término (va también en ItemCorto.CSS, que el mapa copia en sus
   recuadros). Un término nuevo: sumarlo en `MECANICAS` (o darle `full` a su stat, o `detalle` a su estado).
   ========================================================= */
const Glosario = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const sinNotas = t => String(t || '').split(/\s*[⚙✋]/)[0].trim();

  // Las mecánicas (titulo = lo que se lee; `re` si el texto que aparece no es el título tal cual).
  const MECANICAS = [
    {titulo: 'Tipo', re: 'Tipo (?:4|6|8|10|12)', texto: 'Tipo N: el dado del arma (Tipo 6 = d6) y contra qué Resistencia a crítico pega. El primer ataque del turno cuesta la mitad del Tipo en No2 y los siguientes, el Tipo entero.'},
    {titulo: 'Amplificado', re: 'amplificados?', texto: 'Daño amplificado: dados de daño de más que no pesan.'},
    {titulo: '2 manos', re: '2 manos|a dos manos', texto: 'A dos manos: ocupa las dos manos (no se puede llevar un escudo ni otra arma).'},
    {titulo: 'Arco', re: 'arco', texto: 'Arco: suma la mitad de tu Dmg (para arriba) y tiene Tiro alto (salvo que diga «Sin tiro alto»). Dispara con al menos 1 casillero libre entre vos y el objetivo (no al de al lado); con el arco no se pega cuerpo a cuerpo, no se hacen ataques de oportunidad ni se parrea.'},
    {titulo: 'A distancia', re: 'a distancia', texto: 'Arma a distancia: el daño es solo el del arma, no suma tu Dmg.'},
    {titulo: 'Recarga', re: 'Recarga \\d', texto: 'Recarga N (ballestas): el primer disparo del turno cuesta N No2, el segundo 2N, el tercero 3N… (1 = rápida, 2 = común, 3 = de asedio). Pocos tiros y fuertes. No suma tu Dmg: el daño es el del arma. A diferencia del arco, dispara con el rival al lado.'},
    {titulo: 'Apuntada', re: 'Apuntada \\+\\d', texto: 'Apuntada +N: si no te moviste en este turno, el disparo suma +N al PdG (el francotirador quieto). ⚙ Lo suma el mapa al apuntar.'},
    {titulo: 'Llega cargada', re: 'Llega cargada', texto: 'Llega cargada: el primer disparo del turno es gratis (0 No2) si con esta ballesta no disparaste el turno anterior. Lo lento es volver a cargarla.'},
    {titulo: 'Atraviesa escudos', re: 'Atraviesa escudos', texto: 'Atraviesa escudos: si te paran el disparo con un escudo, el escudo se abolla: el que lo paró queda con 1 stack de Armadura rota. ⚙ Lo aplica el mapa.'},
    {titulo: 'Tensar', re: 'Tensar \\+\\d', texto: 'Tensar +N: al disparar podés tensar el arco a fondo: pagás 1 No2 más y el disparo suma +N al PdG. Se elige en cada disparo. ⚙ El mapa lo pregunta al apuntar.'},
    {titulo: 'Largo alcance', re: 'Largo alcance', texto: 'Largo alcance: podés disparar hasta 4 casilleros más allá de tu alcance, con ese PdG de menos por cada casillero de más. ⚙ Lo resta el mapa al apuntar.'},
    {titulo: 'Emboscada', re: 'Emboscada', texto: 'Emboscada: tu primer disparo del combate (desde que el mapa pasa a combate) suma ese Crítico frecuente. ⚙ Lo suma el mapa.'},
    {titulo: 'Matabestias', re: 'Matabestias', texto: 'Matabestias: daño de más contra una bestia (el tipo de criatura del creep). ⚙ Lo suma el mapa.'},
    {titulo: 'Contra el Marcado', re: 'Contra el Marcado', texto: 'Contra el Marcado: PdG de más contra un objetivo Marcado (por ejemplo, con una Flecha marcadora). ⚙ Lo suma el mapa.'},
    {titulo: 'Espalda a distancia', re: 'Espalda a distancia', texto: 'Espalda a distancia: si todo el trayecto del disparo pasa por el punto ciego del objetivo (los casilleros de atrás, que no ve), suma ese bono. No hace falta estar en sigilo. ⚙ Lo mira el mapa.'},
    {titulo: 'Afinidad elemental', re: 'Afinidad elemental', texto: 'Afinidad elemental: con este arco, el daño elemental de las flechas especiales (fuego, escarcha, ácido…) suma +1.'},
    {titulo: 'Tiro alto', re: 'Tiro alto', texto: 'Tiro alto: dispara por encima de los tokens que tapan la línea (no de los Sólidos), con el objetivo a 4 casilleros o más y PdG −2 en ese disparo. Lo tienen todos los arcos. ⚙ El mapa lo ofrece solo.'},
    {titulo: 'Sin tiro alto', re: 'Sin tiro alto', texto: 'Sin tiro alto: a diferencia del resto de los arcos, este no puede tirar por encima de los tokens que tapan la línea.'},
    {titulo: 'Distancia ideal', re: 'Distancia ideal', texto: 'Distancia ideal: si el objetivo está en esa franja, el disparo suma el bono que dice. «Media distancia» y «lejos» se miden con tu alcance. ⚙ Al apuntar, los objetivos en esa franja brillan en celeste.'},
    {titulo: 'Línea de tiro', re: 'Línea de tiro', texto: 'Línea de tiro: la tapan los Sólidos y cualquier token en el medio, aliado o rival. Si está tapada o roza, el mapa avisa y lo decide la mesa.'},
    {titulo: 'Daño directo', re: '[Dd]año [a-záéíóú ]{0,20}directo|directo a la vida', texto: 'Daño directo: va derecho a la vida. No lo frenan la Defensa ni la Defensa especial; solo la resistencia a su elemento (fuego, hielo, rayo, tóxico, ácido), si tiene uno. No hace crítico. Es el daño de las varitas y los proyectiles mágicos chicos.'},
    {titulo: 'Perfora', re: 'Perfora \\d+|perfora \\d+|Perfora', texto: 'Perfora N: N puntos del golpe pasan siempre, aunque la Defensa de quien lo recibe frene el resto. El daño nunca es menos de N (ni más que el golpe). Con un crítico no hace falta: el crítico ya ignora la Defensa entera.'},
    {titulo: 'Crítico frecuente', texto: 'Crítico frecuente: achica el rango del crítico (críticos más seguidos). El rango no baja de 2: en un Tipo 4 sirve hasta +2.'},
    {titulo: 'Crítico potente', texto: 'Crítico potente: hace más fuerte el crítico (baja lo que hay que sacar en el d20 para ×2, ×3 y ×4), no lo hace más seguido.'},
    {titulo: 'PdG en oportunidad', texto: 'PdG en oportunidad: solo se suma en un ataque de oportunidad (cuando un rival se aleja de tu lado).'},
    {titulo: 'PdG en contraataque', texto: 'PdG en contraataque: solo se suma en un contraataque (después de ganar un Parry y un Bloqueo).'},
    {titulo: 'Res. crítico', re: 'Res\\. crítico|Resistencia a crítico', texto: 'Resistencia a crítico: cuántos niveles de crítico se le restan al golpe de un arma de ese Tipo. Un arma que «ignora N de Res. crítico» le resta N a la del defensor.'},
    {titulo: 'Por la espalda', texto: 'Por la espalda: cuenta solo si quien ataca está en sigilo y en el casillero justo de atrás del defensor (si lo ve, se da vuelta). ⚙ El mapa lo suma solo.'},
    {titulo: 'No se puede parrear', texto: 'No se puede parrear: contra esta arma el defensor solo puede esquivar.'},
    {titulo: 'Oportunidad sin No2', texto: 'Oportunidad sin No2: el ataque de oportunidad con esta arma no cuesta Nitros.'},
    {titulo: 'd20 en el crítico', re: 'd20 en el crítico', texto: '+N d20 en el crítico: cuando el golpe es crítico se tiran N d20 más para el multiplicador (más chance de ×3, ×4 y de supercrítico).'},
    {titulo: 'Primer ataque', re: 'Primer ataque −\\d+ No2', texto: 'Primer ataque −N No2: el primer ataque normal del turno con esta arma cuesta N No2 menos.'},
    {titulo: 'Si es crítico', re: 'Si es crítico', texto: '⚡ Si es crítico (Critical Matters): ese efecto solo entra si el golpe fue crítico.'},
    {titulo: 'seguro si es crítico', texto: 'Seguro si es crítico: con un golpe crítico, el efecto entra sin tirar.'},
    {titulo: 'siempre', re: '\\(siempre\\)', texto: 'Siempre: el efecto entra en todo golpe que pegue, sin tirar.'},
    {titulo: 'Resistente', re: 'Resistente(?: ×\\d+)?', texto: 'Resistente: aguanta más desgaste antes de romperse (+1 de durabilidad por cada ×).'},
    {titulo: 'Frágil', re: 'Frágil(?: ×\\d+)?', texto: 'Frágil: aguanta menos desgaste antes de romperse (−1 de durabilidad por cada ×).'},
    {titulo: 'Durabilidad', texto: 'Durabilidad: cuánto desgaste aguanta antes de romperse (3 por punto de Peso). Una pieza rota no da sus bonos y repararla cuesta el doble.'},
    {titulo: 'Daño elemental', re: '\\+\\d*d\\d+ (?:eléctrico|tóxico|de fuego|de hielo|de ácido)', texto: 'Daño elemental: se tira aparte cuando el golpe pega y va directo a la vida: no lo frenan la Defensa ni la Defensa especial, solo la resistencia a su elemento. No se multiplica con el crítico.'},
    {titulo: 'Drena vida', texto: 'Drena vida N %: quien ataca se cura el N % de la vida que el golpe le sacó de verdad (lo que frena la armadura no cuenta).'},
    {titulo: 'Rompe armadura', re: 'Rompe armadura|Armadura rota doble', texto: 'Rompe armadura: deja Armadura rota (−1 de Defensa por stack). «Doble»: 2 stacks por golpe.'},
    {titulo: 'Demora', texto: 'Demora: baja al golpeado 1 lugar en el orden de turnos. ⚙ Lo hace el mapa.'},
    {titulo: 'Aturdir', texto: 'Aturdir: lo deja con Stun.'},
    {titulo: 'Derribar', texto: 'Derribar: cae al suelo y queda Sentado (Evasión a la mitad, no puede atacar). Levantarse cuesta 1 No2.'},
    {titulo: 'Salto', re: 'salta', texto: 'Salto (rayo): pasa al rival más cercano del mismo bando, a 3 casillas o menos, una vez por objetivo. Si lleva daño, salta con la mitad (para abajo): quien recibe 1 es el último.'},
    {titulo: 'Flecha especial', texto: 'Flecha especial: va en el carcaj y se elige al disparar con un arco. Se gasta al dispararla, pegue o no (si erra, queda en el piso y se puede levantar); su efecto entra siempre que pegue.'},
    {titulo: 'Carcaj', re: 'carcaj', texto: 'Carcaj: guarda las flechas especiales. Todo arco viene con uno de 10 lugares.'},
  ];
  // Lo que se da por sabido (se usa en todos lados: marcarlo llenaría todo de vínculos).
  const BASICOS = new Set(['fuerza', 'destreza', 'especial', 'constitución', 'agilidad', 'pdg', 'dmg', 'evasión', 'parry', 'bloqueo', 'defensa', 'iniciativa',
    'alcance', 'rango', 'hp', 'sp', 'no2', 'vida', 'peso', 'percepción', 'visión', 'nitros', 'eva', 'def']);
  // Efectos de arma que conviene explicar con el texto de arma (más preciso que el del estado).
  const EF_ARMA = {
    Rengo: 'Rengo: 3 turnos en que moverse le cuesta 2 No2 por casillero.',
    Lisiado: 'Lisiado: 3 turnos con el PdG y el Parry a la mitad.',
    Sangrado: 'Sangrado: pierde 1 HP por stack en cada turno (entra con 2). El de un arma dura 2 turnos; con un golpe crítico, queda permanente. Si ya sangraba: +1 stack.',
    Veneno: 'Veneno: pierde 1 HP por stack en cada turno y un stack por turno. Los stacks nuevos se suman a los que ya tenía. Necesita que el golpe haga daño.',
  };

  const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let cache = null, firma = '';
  function lista(){
    const f = [typeof ESTADOS_PRESET !== 'undefined' ? ESTADOS_PRESET.length : 0, typeof FichaCalculo !== 'undefined' ? 1 : 0].join('|');
    if(cache && firma === f) return cache;
    const defs = new Map();   // título (minúsculas) → {titulo, texto, re}
    const poner = (titulo, texto, re, pisar) => {
      const k = String(titulo || '').trim().toLowerCase();
      if(!k || !texto || BASICOS.has(k) || (defs.has(k) && !pisar)) return;
      defs.set(k, {titulo: String(titulo).trim(), texto: String(texto).trim(), re: re || reEsc(String(titulo).trim())});
    };
    MECANICAS.forEach(m => poner(m.titulo, m.texto, m.re, true));
    Object.entries(EF_ARMA).forEach(([n, t]) => poner(n, t, null, true));
    if(typeof ESTADOS_PRESET !== 'undefined') ESTADOS_PRESET.forEach(e => { if(e && e.nombre && e.detalle) poner(e.nombre, sinNotas(e.detalle)); });
    if(typeof FichaCalculo !== 'undefined'){
      const stats = [...(FichaCalculo.EXTRA || []), ...((FichaCalculo.GRUPOS || []).flatMap(g => g.derived || []))];
      stats.forEach(s => {
        if(!s || !s.label || !s.full || s.full === s.label || /^Tipo \d/.test(s.label)) return;
        const m = /^([^:]{3,40}):\s/.exec(s.full);   // «Defensa especial: se resta…» → también se reconoce «Defensa especial»
        poner(s.label, s.full);
        if(m && m[1].toLowerCase() !== s.label.toLowerCase()) poner(m[1], s.full);
      });
    }
    const arr = [...defs.values()].sort((a, b) => b.re.length - a.re.length);
    cache = {arr, porTitulo: defs, re: arr.length ? new RegExp(arr.map(d => `(?<![\\p{L}\\d])(${d.re})(?![\\p{L}\\d])`).join('|'), 'giu') : null};
    firma = f;
    return cache;
  }
  function def(termino){ const d = lista().porTitulo.get(String(termino || '').trim().toLowerCase()); return d ? {titulo: d.titulo, texto: d.texto} : null; }

  // El texto, escapado, con cada término conocido marcado (la primera vez que aparece).
  function marcar(texto){
    const t = String(texto ?? '');
    const L = lista();
    if(!t || !L.re) return esc(t);
    const usados = new Set();
    let out = '', ultimo = 0;
    L.re.lastIndex = 0;
    for(let m; (m = L.re.exec(t));){
      const i = m.slice(1).findIndex(x => x !== undefined);
      const d = L.arr[i];
      if(!d || usados.has(d.titulo)) continue;
      usados.add(d.titulo);
      out += esc(t.slice(ultimo, m.index)) + `<span class="glo" tabindex="0" data-glo="${esc(d.titulo)}">${esc(m[0])}</span>`;
      ultimo = m.index + m[0].length;
    }
    return out + esc(t.slice(ultimo));
  }

  // El estilo del término (va también adentro de los recuadros aislados) y el del globo (en la página).
  const CSS = `.glo{color:#8FD3F0;text-decoration:underline dotted rgba(143,211,240,.7);text-underline-offset:2px;cursor:help;border-radius:2px}
.glo:hover,.glo:focus{background:rgba(143,211,240,.14);outline:none}`;
  const CSS_GLOBO = `#glo-pop{position:fixed;z-index:100200;max-width:320px;background:#1d1712;color:#EDE3D6;border:1px solid #8FD3F0;border-radius:8px;
padding:9px 12px;font:13px/1.45 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.55);pointer-events:none;display:none}
#glo-pop b{display:block;color:#8FD3F0;font-size:12px;letter-spacing:.03em;margin-bottom:3px}`;
  let globo = null, actual = null;
  function iniciar(){
    if(globo || typeof document === 'undefined' || !document.body) return;
    const st = document.createElement('style');
    st.id = 'glosario-css';
    st.textContent = CSS + '\n' + CSS_GLOBO;
    document.head.appendChild(st);
    globo = document.createElement('div');
    globo.id = 'glo-pop';
    document.body.appendChild(globo);
    const cual = e => (e.composedPath ? e.composedPath() : [e.target]).find(n => n && n.classList && n.classList.contains('glo'));
    const mostrar = el => {
      const d = def(el.dataset.glo);
      if(!d){ esconder(); return; }
      actual = el;
      // Título: lo que dice el texto marcado («Tipo 4», «Perfora 1»); el cuerpo, sin el «Nombre:» del principio si lo trae.
      const cab = /^([^:]{1,48}):\s+/.exec(d.texto);
      const cuerpo = cab && cab[1].toLowerCase().includes(d.titulo.toLowerCase().split(' ')[0]) ? d.texto.slice(cab[0].length) : d.texto;
      const titulo = (el.textContent || d.titulo).trim();
      globo.innerHTML = `<b>${esc(titulo.charAt(0).toUpperCase() + titulo.slice(1))}</b>${esc(cuerpo.charAt(0).toUpperCase() + cuerpo.slice(1))}`;
      globo.style.display = 'block';
      const r = el.getBoundingClientRect(), g = globo.getBoundingClientRect();
      let x = Math.min(Math.max(8, r.left), innerWidth - g.width - 8), y = r.bottom + 6;
      if(y + g.height > innerHeight - 8) y = Math.max(8, r.top - g.height - 6);
      globo.style.left = x + 'px'; globo.style.top = y + 'px';
    };
    const esconder = () => { actual = null; if(globo) globo.style.display = 'none'; };
    // Lo que hay debajo del puntero, entrando en los recuadros aislados (por si el evento llega apuntado al recuadro y no al término).
    const bajo = e => {
      const c = cual(e);
      if(c) return c;
      let el = document.elementFromPoint(e.clientX, e.clientY);
      for(let i = 0; el && el.shadowRoot && i < 4; i++){ const x = el.shadowRoot.elementFromPoint(e.clientX, e.clientY); if(!x || x === el) break; el = x; }
      return el && el.closest ? el.closest('.glo') : null;
    };
    let pendiente = null;
    const revisar = e => {
      pendiente = e;
      requestAnimationFrame(() => { if(!pendiente) return; const ev = pendiente; pendiente = null; const el = bajo(ev); if(el && el !== actual) mostrar(el); else if(!el && actual) esconder(); });
    };
    document.addEventListener('mouseover', revisar, true);
    document.addEventListener('mousemove', revisar, true);
    document.addEventListener('focusin', e => { const el = cual(e); if(el) mostrar(el); }, true);
    document.addEventListener('focusout', () => esconder(), true);
    ['scroll', 'mousedown', 'keydown'].forEach(ev => document.addEventListener(ev, () => esconder(), true));
  }
  if(typeof document !== 'undefined'){
    if(document.body) iniciar(); else document.addEventListener('DOMContentLoaded', iniciar);
  }
  return {MECANICAS, marcar, def, lista, CSS, iniciar};
})();
