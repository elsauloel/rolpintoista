/* =========================================================
   ASISTENTE-PERSONAJE — «＋ Personaje nuevo», paso a paso en la ventana común (comun/paso-a-paso.js) (2026-10-02, tanda 7 de
   docs/plan-paso-a-paso.md). Antes era un `confirm` y una ficha en blanco.
   Pasos: Idea · Imagen · Atributos · Habilidades · Pasivas · Talentos · Equipo · Historia · Resumen («✔ Crear el personaje»).
   Decisiones del dueño (2026-10-02): atributos con mínimo 3 (como el manual), 33 puntos al nivel 1; se puede terminar con puntos sin gastar,
   con aviso; Historia opcional; el equipo sale de la tienda que publicó el GM, con el DDE inicial (300 doblones del espacio, salvo que el GM
   fije otro en ⚙ Partida); un acompañante orienta según la clase (los repartos de los roles de creeps: Combatiente.ROL_DE_CLASE), dejando
   claro que no restringe.
   No escribe nada: arma los datos del personaje y se los pasa a `ctx.alCrear(datos)` (la ficha los crea en la partida).
     AsistentePersonaje.abrir({
       base(),                         // un personaje en blanco ya normalizado (FichaGuardado.normalizar)
       clases,                         // CLASES_SKILLS
       pool(claseId), habilidad(claseId, habId),   // las habilidades de una clase (con lo subido; '_custom' = el pool custom) y la copia lista
       editarHabilidad(S, id, alCambiar),          // abre el paso a paso de habilidades sobre el personaje en armado (id null = una nueva,
                                                   // custom); lo guardado queda en S.habilidades y avisa con alCambiar()
       pasivas(), pasiva(datos, meta), // [{datos, meta}] del catálogo de pasivas, y la copia lista
       tienda(),                       // Promise: la tienda publicada (FichaTienda.desdeDoc) o null
       ddeInicial(),                   // Promise: el DDE inicial de la partida (300 si el GM no fijó otro)
       imagen(file),                   // Promise: {imagen, miniatura} (o rechaza con 'cancelado')
       alCrear(datos),                 // false = no cerrar
       toast,
     });
   ========================================================= */
const AsistentePersonaje = (() => {
  const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n * 100) / 100;
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const uid = () => Math.random().toString(36).slice(2, 10);
  const ATTRS = ['con', 'fue', 'agl', 'des', 'esp'];
  const MIN_ATTR = 3;
  const DDE_POR_DEFECTO = 300;
  // Lo que suele hacer cada clase (una línea; los atributos que "suele" llevar salen de los pesos de su rol).
  const CLASE_TXT = {warrior: 'Pega fuerte cuerpo a cuerpo.', asalto: 'Rápido: entra, golpea y sale.', tanque: 'Aguanta y protege al grupo.',
    mago: 'Hechizos con el Especial (gasta SP).', shooter: 'Pega a distancia.', support: 'Cura, protege y ayuda.', debuffer: 'Maldiciones y estados sobre los rivales.'};
  const TALENTOS_SUGERIDOS = ['Persuadir', 'Mentir', 'Intimidar', 'Regatear', 'Seducir', 'Investigar', 'Leer intenciones', 'Historia', 'Saber arcano',
    'Medicina', 'Supervivencia', 'Rastrear', 'Tecnología', 'Actuar', 'Desarmar trampas'];   // Desarmar trampas: detecta y desarma trampas en el mapa (2026-10-08)

  let cssPuesto = false;
  function estilos(){
    if(cssPuesto) return;
    cssPuesto = true;
    const s = document.createElement('style');
    s.textContent = `
.ap-c{font-size:14px;line-height:1.5}
.ap-c .ap-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:8px}
.ap-c .ap-op{display:flex;flex-direction:column;gap:3px;text-align:left;padding:10px 12px;border:1px solid var(--pap-linea);border-radius:4px;background:rgba(255,255,255,.02);
  color:var(--pap-papel);cursor:pointer;font:inherit}
.ap-c .ap-op:hover{border-color:var(--pap-cobre)}
.ap-c .ap-op.on{border-color:var(--pap-laton);background:rgba(224,164,88,.12)}
.ap-c .ap-op b{font-size:15px}.ap-c .ap-op small{color:var(--pap-tenue);font-size:12.5px;line-height:1.4}
.ap-c .ap-op .ap-cab{display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.ap-c .ap-op .ap-cab em{font-style:normal;font-family:"Space Mono",monospace;font-size:11px;color:var(--pap-laton);flex:none}
.ap-c h4{margin:14px 0 6px;font-family:"Space Mono",monospace;font-size:10.5px;text-transform:uppercase;letter-spacing:.08em;color:var(--pap-tenue)}
.ap-c .ap-guia{border:1px solid var(--pap-cobre);border-left-width:4px;background:rgba(201,133,69,.08);padding:10px 12px;border-radius:3px;margin:0 0 12px}
.ap-c .ap-guia b{color:var(--pap-laton)}
.ap-c .ap-contador{font-family:"Space Mono",monospace;font-size:12px;padding:6px 10px;border:1px solid var(--pap-linea);border-radius:3px;display:inline-block;margin:0 0 10px}
.ap-c .ap-contador.mal{border-color:var(--pap-peligro);color:var(--pap-peligro)}
.ap-c .ap-attrs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
.ap-c .ap-attr{border:1px solid var(--pap-linea);border-radius:4px;padding:8px;text-align:center}
.ap-c .ap-attr label{display:block;font-family:"Space Mono",monospace;font-size:10px;text-transform:uppercase;color:var(--pap-tenue)}
.ap-c .ap-attr .ap-num{font-size:26px;font-weight:700;color:var(--pap-laton);margin:4px 0}
.ap-c .ap-attr .ap-sug{font-size:11px;color:var(--pap-tenue)}
.ap-c .ap-mm{display:flex;gap:6px;justify-content:center}
.ap-c .ap-mm button{width:30px;height:28px;border:1px solid var(--pap-linea);background:none;color:var(--pap-papel);border-radius:3px;cursor:pointer;font:inherit;font-size:16px}
.ap-c .ap-mm button:hover{border-color:var(--pap-cobre)}
.ap-c .ap-deriv{display:flex;flex-wrap:wrap;gap:6px 14px;margin-top:12px;font-size:13px;color:var(--pap-tenue)}
.ap-c .ap-deriv b{color:var(--pap-papel)}
.ap-c .ap-chips{display:flex;flex-wrap:wrap;gap:6px}
.ap-c .ap-chip{border:1px dashed var(--pap-linea);background:none;color:var(--pap-papel);border-radius:999px;padding:4px 10px;cursor:pointer;font:inherit;font-size:13px}
.ap-c .ap-chip:hover{border-color:var(--pap-cobre)}
.ap-c .ap-fila{display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--pap-linea2)}
.ap-c .ap-fila .ap-n{flex:1;min-width:0}
.ap-c .ap-resumen .resumen-fila,.ap-c .ap-rf{display:flex;justify-content:space-between;gap:12px;padding:5px 0;border-bottom:1px solid var(--pap-linea2)}
.ap-c .ap-rf span{color:var(--pap-tenue)}.ap-c .ap-rf b{text-align:right}
.ap-c .ap-aviso{color:var(--pap-peligro);font-size:13px;margin:4px 0}
.ap-c .ap-img{width:120px;height:120px;object-fit:cover;border-radius:6px;border:2px solid var(--pap-linea)}`;
    document.head.appendChild(s);
  }

  function abrir(ctx){
    estilos();
    const S = ctx.base();
    S.meta.nivel = 1;
    ATTRS.forEach(a => { S.attrs[a] = MIN_ATTR; });
    const st = {
      claseId: '', claseOtra: '', concepto: '', historia: '', catPasiva: '',
      habs: new Map(),        // `${claseId}:${habId}` → {claseId, habId}
      pasivas: new Set(),     // índice en ctx.pasivas()
      talentos: [],           // [{nombre, puntos}]
      carrito: new Map(),     // id del ítem → cantidad
      tienda: undefined, dde: DDE_POR_DEFECTO, ddeGM: null, ddeTocado: false, abiertas: new Set(),
    };
    const clases = ctx.clases || [];
    const pasivasLista = ctx.pasivas ? ctx.pasivas() : [];
    const clase = () => clases.find(c => c.id === st.claseId) || null;
    const rol = () => (typeof Combatiente !== 'undefined' && Combatiente.ROL_DE_CLASE[st.claseId]) || '';
    const presupuestoAttr = () => { const usado = ATTRS.reduce((a, k) => a + num(S.attrs[k]), 0), total = 33; return {usado, total, pend: total - usado}; };
    const sugerencia = () => rol() ? Combatiente.repartirAtributos(33, Combatiente.PESOS_ROL[rol()], MIN_ATTR) : null;
    const labelAttr = id => (FichaCalculo.ATTR_LIST.find(a => a.id === id) || {}).full || id;
    const jobTotal = () => FichaCalculo.jobTotal(1);
    const costoHab = claseId => claseId === '_custom' || claseId === '_creep' ? 2 : 1;
    const propiasArmadas = () => (S.habilidades || []);   // las custom armadas en el paso a paso de habilidades
    const jobUsado = () => [...st.habs.values()].reduce((a, x) => a + costoHab(x.claseId), 0)
      + propiasArmadas().reduce((a, h) => a + (h.job === false ? 0 : Math.max(0, num(h.jobCosto))), 0)
      + [...st.pasivas].reduce((a, i) => a + Math.max(0, num((pasivasLista[i] || {}).datos && pasivasLista[i].datos.jobCosto) || 1), 0);
    const intTotal = () => FichaBotonera.inteligenciaAuto(S);
    const intUsado = () => st.talentos.reduce((a, t) => a + Math.max(0, num(t.puntos)), 0);
    const totalCompra = () => { let t = 0; st.carrito.forEach((n, id) => { const it = itemTienda(id); if(it) t += precioDe(it) * n; }); return t; };
    const itemTienda = id => FichaTienda.itemCatalogo(S, {tienda: st.tienda || null}, id);
    const precioDe = it => FichaTienda.precioDeCompra({tienda: st.tienda || null}, it);

    // Lo que se lee de la partida (tienda y DDE inicial), una vez.
    Promise.resolve(ctx.ddeInicial ? ctx.ddeInicial() : DDE_POR_DEFECTO).then(v => { st.ddeGM = Number.isFinite(Number(v)) ? Number(v) : DDE_POR_DEFECTO; if(!st.ddeTocado){ st.dde = st.ddeGM; if(api && api.abierto() && api.pasoId() === 'equipo') api.redibujar(); } }).catch(() => {});
    Promise.resolve(ctx.tienda ? ctx.tienda() : null).then(t => { st.tienda = t || null; if(api && api.abierto() && api.pasoId() === 'equipo') api.redibujar(); }).catch(() => { st.tienda = null; });

    function guia(t){ return `<div class="ap-guia">🧭 ${t}</div>`; }
    const contador = (txt, mal) => `<span class="ap-contador${mal ? ' mal' : ''}">${txt}</span>`;

    function pasoIdea(){
      return `<div class="pap-fila" style="gap:12px;flex-wrap:wrap">
          <div class="pap-campo" style="flex:2;min-width:220px"><label>Nombre</label><input id="ap-nombre" maxlength="60" placeholder="Ej.: Aurelia de la Cueva" value="${esc(S.meta.nombre)}"></div>
          <div class="pap-campo" style="flex:1;min-width:160px"><label>Raza</label><input id="ap-raza" maxlength="40" placeholder="Humana, piedra consciente…" value="${esc(S.meta.raza)}"></div>
          <div class="pap-campo" style="flex:1;min-width:160px"><label>Subclase (opcional)</label><input id="ap-subclase" maxlength="40" value="${esc(S.meta.subclase)}"></div>
        </div>
        <div class="pap-campo"><label>La idea, en dos líneas</label><textarea id="ap-concepto" maxlength="300" placeholder="Ej.: guerrera lenta que se cree elegante; un sacerdote con escopeta de agua bendita.">${esc(st.concepto)}</textarea></div>
        <h4>Clase</h4>
        <p class="pap-nota">La clase orienta qué atributos y habilidades te convienen. No restringe nada: podés elegir de cualquier clase, o ninguna.</p>
        <div class="ap-grid">${clases.map(c => {
          const p = Combatiente.PESOS_ROL[Combatiente.ROL_DE_CLASE[c.id]];
          const top = p ? p.map((w, i) => [w, ATTRS[i]]).sort((a, b) => b[0] - a[0]).slice(0, 2).map(x => labelAttr(x[1])).join(' y ') : '';
          return `<button type="button" class="ap-op${st.claseId === c.id ? ' on' : ''}" data-ap-clase="${esc(c.id)}"><b>${esc(c.nombre)}</b><small>${esc(CLASE_TXT[c.id] || '')}${top ? ` Suele llevar ${esc(top)}.` : ''}</small></button>`;
        }).join('')}
          <button type="button" class="ap-op${st.claseId === '_otra' ? ' on' : ''}" data-ap-clase="_otra"><b>Otra</b><small>Una clase propia (escribila abajo).</small></button>
        </div>
        ${st.claseId === '_otra' ? `<div class="pap-campo" style="margin-top:10px"><label>¿Cuál?</label><input id="ap-clase-otra" maxlength="40" value="${esc(st.claseOtra)}"></div>` : ''}`;
    }
    function pasoImagen(){
      return `<div class="pap-fila" style="align-items:center;gap:14px">
        ${S.meta.imagen ? `<img class="ap-img" src="${esc(S.meta.imagen)}" alt="">` : '<div class="ap-img" style="display:flex;align-items:center;justify-content:center;color:var(--pap-tenue)">sin foto</div>'}
        <div><button type="button" class="pap-boton" data-ap-img="elegir">${S.meta.imagen ? 'Cambiar la foto' : 'Elegir una foto'}</button>
          ${S.meta.imagen ? '<button type="button" class="pap-boton" data-ap-img="quitar" style="margin-left:6px">Quitar</button>' : ''}
          <p class="pap-nota">Después de elegirla, marcás qué parte se ve en el token del mapa.</p></div></div>
        <input type="file" id="ap-img-input" accept="image/*" hidden>`;
    }
    function pasoAtributos(){
      const b = presupuestoAttr(), sug = sugerencia(), c = FichaCalculo.calcular(S).final;
      const nomClase = clase() ? clase().nombre : st.claseId === '_otra' ? (st.claseOtra || 'tu clase') : '';
      return (sug ? guia(`Un <b>${esc(nomClase)}</b> suele repartir así: ${ATTRS.map((a, i) => `${esc(labelAttr(a))} ${sug[i]}`).join(' · ')}. Es una orientación, no una regla: cambialo como quieras.
          <div style="margin-top:6px"><button type="button" class="pap-boton" data-ap-sugerencia="1">Usar la sugerencia</button></div>`)
          : guia('Elegí una clase en «Idea» y te sugiero un reparto. Si no, repartí a gusto: cada atributo arranca en 3.'))
        + contador(`Puntos: ${b.usado} de ${b.total}${b.pend > 0 ? ` · te ${b.pend === 1 ? 'queda' : 'quedan'} ${b.pend}` : b.pend < 0 ? ` · ${-b.pend} de más` : ' · justo'}`, b.pend < 0)
        + `<div class="ap-attrs">${ATTRS.map((a, i) => `<div class="ap-attr"><label>${esc(labelAttr(a))}</label><div class="ap-num">${num(S.attrs[a])}</div>
            <div class="ap-mm"><button type="button" data-ap-attr="${a}" data-ap-delta="-1" title="Restar">−</button><button type="button" data-ap-attr="${a}" data-ap-delta="1" title="Sumar">+</button></div>
            ${sug ? `<div class="ap-sug">sugerido ${sug[i]}</div>` : ''}</div>`).join('')}</div>
        <div class="ap-deriv"><span>Vida <b>${fmt(num(c.hpmax))}</b></span><span>No2 <b>${fmt(num(c.nitros))}</b></span><span>SP <b>${fmt(num(c.sp))}</b></span>
          <span>PdG <b>${fmt(num(c.pdg))}</b></span><span>Evasión <b>${fmt(num(c.eva))}</b></span><span>Daño <b>${fmt(num(c.dmg))}</b></span><span>PdG.Esp <b>${fmt(num(c.pdgmg))}</b></span></div>
        <p class="pap-nota">Mínimo 3 en cada uno. Constitución da la vida; Fuerza el daño; Agilidad la Evasión y los No2; Destreza el PdG; Especial los SP y los hechizos.</p>`;
    }
    function tarjetaHab(claseId, h, propia){
      const k = `${claseId}:${h.id}`, on = st.habs.has(k);
      const costo = [h.costo ? `${h.costo}${/sp/i.test(String(h.costo)) ? '' : ' SP'}` : '', h.nitrosCosto !== undefined && h.nitrosCosto !== '' ? `${h.nitrosCosto} No2` : ''].filter(Boolean).join(' · ');
      const det = String(h.detalle || '').split(/⚙|✋/)[0].trim();
      return `<button type="button" class="ap-op${on ? ' on' : ''}" data-ap-hab="${esc(k)}"><span class="ap-cab"><b>${propia ? '★ ' : ''}${esc(h.nombre)}</b><em>${on ? '✔ ' : ''}${costoHab(claseId)} Job</em></span>
        <small>${esc(costo)}${costo && det ? ' — ' : ''}${esc(det.length > 170 ? det.slice(0, 170) + '…' : det)}</small></button>`;
    }
    function pasoHabilidades(){
      const jt = jobTotal(), ju = jobUsado();
      const propias = clase() ? ctx.pool(clase().id) : [];
      const otras = clases.filter(c => !clase() || c.id !== clase().id);
      return guia(clase() ? `Las de <b>${esc(clase().nombre)}</b> (★) van primero: son las que mejor acompañan tu idea. Podés llevarte las de cualquier clase (cada habilidad de clase cuesta 1 de Job).`
          : 'Cada habilidad de clase cuesta 1 de Job. Elegí las que vayan con tu idea, de cualquier clase.')
        + contador(`Job: ${ju} de ${jt} (habilidades + pasivas)${ju > jt ? ` · ${ju - jt} de más` : ''}`, ju > jt)
        + `<h4>Una habilidad propia</h4>
          <div class="pap-fila" style="flex-wrap:wrap;gap:8px"><button type="button" class="pap-boton" data-ap-hab-nueva="1">＋ Crear una habilidad nueva (custom · 2 de Job)</button>
            <span class="pap-nota" style="margin:0">Se arma en su propio paso a paso, como en la ficha.</span></div>
          ${propiasArmadas().length ? `<div class="ap-grid" style="margin-top:8px">${propiasArmadas().map(h => `<div class="ap-op on" style="cursor:default"><span class="ap-cab"><b>✎ ${esc(h.nombre || 'Sin nombre')}</b><em>${fmt(h.job === false ? 0 : num(h.jobCosto))} Job</em></span>
            <small>${esc(String(h.detalle || '').slice(0, 140))}</small><span class="pap-fila" style="gap:6px;margin-top:4px"><button type="button" class="pap-boton" data-ap-hab-editar="${esc(h.id)}">Editar</button><button type="button" class="pap-boton" data-ap-hab-quitar="${esc(h.id)}">Quitar</button></span></div>`).join('')}</div>` : ''}`
        + (propias.length ? `<h4>De tu clase</h4><div class="ap-grid">${propias.map(h => tarjetaHab(clase().id, h, true)).join('')}</div>` : '')
        + otras.map(c => {
          const lista = ctx.pool(c.id);
          if(!lista.length) return '';
          const abierta = st.abiertas.has(c.id) || [...st.habs.values()].some(x => x.claseId === c.id);
          return `<h4><button type="button" class="ap-chip" data-ap-abrir="${esc(c.id)}">${abierta ? '▾' : '▸'} ${esc(c.nombre)} (${lista.length})</button></h4>${abierta ? `<div class="ap-grid">${lista.map(h => tarjetaHab(c.id, h, false)).join('')}</div>` : ''}`;
        }).join('')
        + (() => {   // 🧩 El pool custom: habilidades ya armadas por el grupo, de ninguna clase (2 de Job cada una).
          const lista = ctx.pool('_custom') || [];
          if(!lista.length) return '';
          const abierta = st.abiertas.has('_custom') || [...st.habs.values()].some(x => x.claseId === '_custom');
          return `<h4><button type="button" class="ap-chip" data-ap-abrir="_custom">${abierta ? '▾' : '▸'} 🧩 Pool custom (${lista.length}) · 2 de Job c/u</button></h4>${abierta ? `<div class="ap-grid">${lista.map(h => tarjetaHab('_custom', h, false)).join('')}</div>` : ''}`;
        })();
    }
    // Las pasivas, agrupadas por categoría (comun/pasivas.js: CATEGORIAS_PASIVA, categoriaDePasiva) y con un filtro arriba.
    function pasoPasivas(){
      const jt = jobTotal(), ju = jobUsado();
      const cats = typeof CATEGORIAS_PASIVA !== 'undefined' ? CATEGORIAS_PASIVA : [{id: 'utilidad', nombre: 'Pasivas'}];
      const catDe = d => typeof categoriaDePasiva === 'function' ? categoriaDePasiva(d) : 'utilidad';
      const conIndice = pasivasLista.map((p, i) => ({p, i, cat: catDe(p.datos || {})}));
      const tarjeta = ({p, i}) => {
        const d = p.datos || {}, on = st.pasivas.has(i);
        return `<button type="button" class="ap-op${on ? ' on' : ''}" data-ap-pasiva="${i}"><span class="ap-cab"><b>${esc(d.nombre)}</b><em>${on ? '✔ ' : ''}${fmt(Math.max(1, num(d.jobCosto) || 1))} Job</em></span><small>${esc(d.detalle || '')}</small></button>`;
      };
      const chip = (id, txt, n) => `<button type="button" class="ap-chip${st.catPasiva === id ? ' on' : ''}" data-ap-catpasiva="${id}"${st.catPasiva === id ? ' style="border-style:solid;border-color:var(--pap-laton);color:var(--pap-laton)"' : ''}>${esc(txt)}${n !== undefined ? ` (${n})` : ''}</button>`;
      const visibles = cats.filter(c => !st.catPasiva || c.id === st.catPasiva);
      return guia('Las pasivas funcionan solas, siempre: más vida, más SP, regenerar… Comparten el Job con las habilidades.')
        + contador(`Job: ${ju} de ${jt} (habilidades + pasivas)${ju > jt ? ` · ${ju - jt} de más` : ''}`, ju > jt)
        + `<div class="ap-chips" style="margin-bottom:6px">${chip('', 'Todas')}${cats.map(c => chip(c.id, c.nombre, conIndice.filter(x => x.cat === c.id).length)).join('')}</div>`
        + visibles.map(c => {
          const lista = conIndice.filter(x => x.cat === c.id);
          return lista.length ? `<h4>${esc(c.nombre)}</h4><div class="ap-grid">${lista.map(tarjeta).join('')}</div>` : '';
        }).join('');
    }
    function pasoTalentos(){
      const it = intTotal(), iu = intUsado();
      const ya = new Set(st.talentos.map(t => t.nombre.toLowerCase()));
      return guia('Los talentos son lo social y lo que sabés: persuadir, mentir, regatear, saber de historia… Cada punto de Inteligencia en un talento le suma 2 caras al dado.')
        + contador(`Inteligencia: ${iu} de ${it}${iu > it ? ` · ${iu - it} de más` : iu < it ? ` · te ${it - iu === 1 ? 'queda' : 'quedan'} ${it - iu}` : ''}`, iu > it)
        + `<div class="ap-chips">${TALENTOS_SUGERIDOS.filter(n => !ya.has(n.toLowerCase())).map(n => `<button type="button" class="ap-chip" data-ap-talento="${esc(n)}">+ ${esc(n)}</button>`).join('')}</div>
        <div class="pap-fila" style="margin:10px 0"><input id="ap-talento-propio" maxlength="40" placeholder="Otro talento (el que quieras)"><button type="button" class="pap-boton" data-ap-talento-propio="1">Agregar</button></div>
        ${st.talentos.length ? st.talentos.map((t, i) => `<div class="ap-fila"><span class="ap-n"><b>${esc(t.nombre)}</b> · ${t.puntos ? `d${t.puntos * 2}` : 'sin dado (tira solo Inteligencia)'}</span>
          <span class="ap-mm"><button type="button" data-ap-tal="${i}" data-ap-delta="-1">−</button><b style="min-width:22px;text-align:center">${t.puntos}</b><button type="button" data-ap-tal="${i}" data-ap-delta="1">+</button></span>
          <button type="button" class="pap-boton" data-ap-tal-quitar="${i}">Quitar</button></div>`).join('') : '<p class="pap-nota">Todavía ninguno. Podés dejarlo para después.</p>'}`;
    }
    function pasoEquipo(){
      // El DDE inicial, editable (pedido del dueño): arranca en 300 (o lo que fijó el GM en ⚙ Partida); si en la mesa corresponde otro, se cambia acá.
      const head = guia(`<b>¿Con cuántos DDE (doblones del espacio) arrancás?</b> Lo estándar son ${fmt(DDE_POR_DEFECTO)}${st.ddeGM !== null && st.ddeGM !== DDE_POR_DEFECTO ? `; el GM fijó ${fmt(st.ddeGM)} para esta partida` : ''}.
          Si en tu mesa corresponde otro valor, preguntale al GM y cambialo acá.
          <div class="pap-fila" style="margin-top:8px;align-items:center"><input id="ap-dde" type="number" min="0" step="10" value="${fmt(st.dde)}" style="max-width:140px"> <span>DDE</span></div>`);
      if(st.tienda === undefined) return head + '<p class="pap-nota">Mirando si el GM publicó una tienda…</p>';
      if(!st.tienda) return head + '<p>El GM todavía no publicó una tienda: cuando la abra, comprás desde 🏪 en la ficha o en el mapa, con tus DDE.</p>';
      if(!st.tienda.abierta) return head + '<p>La tienda de la partida está cerrada: cuando el GM la abra, comprás desde 🏪 con tus DDE.</p>';
      const total = totalCompra(), items = (st.tienda.items || []).map(itemTienda).filter(Boolean);
      return head + `<span data-ap-gasto>${contador(`Gastás ${fmt(total)} de ${fmt(st.dde)} · te quedan ${fmt(st.dde - total)}`, total > st.dde)}</span>`
        + `<div class="ap-grid">${items.map(it => {
          const n = st.carrito.get(it.id) || 0;
          return `<div class="ap-op${n ? ' on' : ''}" style="cursor:default"><span class="ap-cab"><b>${esc(it.nombre)}</b><em>${fmt(precioDe(it))} DDE</em></span>
            <small>${esc(String(it.detalle || '').split(/⚙|✋/)[0].slice(0, 120))}</small>
            <span class="ap-mm" style="justify-content:flex-start;margin-top:4px"><button type="button" data-ap-item="${esc(it.id)}" data-ap-delta="-1">−</button><b style="min-width:22px;text-align:center">${n}</b><button type="button" data-ap-item="${esc(it.id)}" data-ap-delta="1">+</button></span></div>`;
        }).join('')}</div><p class="pap-nota">Lo que compres queda en la mochila; lo equipás desde la ficha.</p>`;
    }
    function pasoHistoria(){
      return `<div class="pap-campo"><label>Historia (opcional)</label><textarea id="ap-historia" style="min-height:220px" placeholder="De dónde viene, qué busca, una manía…">${esc(st.historia)}</textarea></div>
        <p class="pap-nota">Queda en la bitácora del personaje, en una página «Historia». Se puede escribir o cambiar cuando quieras.</p>`;
    }
    function avisos(){
      const a = [], b = presupuestoAttr(), jt = jobTotal(), ju = jobUsado(), it = intTotal(), iu = intUsado();
      const queda = n => n === 1 ? 'Te queda 1' : `Te quedan ${n}`;
      if(b.pend > 0) a.push(`${queda(b.pend)} punto${b.pend === 1 ? '' : 's'} de atributo sin gastar.`);
      if(b.pend < 0) a.push(`Usaste ${-b.pend} punto${b.pend === -1 ? '' : 's'} de atributo de más.`);
      if(ju < jt) a.push(`${queda(jt - ju)} de Job sin usar.`);
      if(ju > jt) a.push(`Usaste ${ju - jt} de Job de más.`);
      if(iu < it) a.push(`${queda(it - iu)} de Inteligencia sin invertir.`);
      if(iu > it) a.push(`Invertiste ${iu - it} de Inteligencia de más.`);
      if(totalCompra() > st.dde) a.push('La compra se pasa de tus DDE.');
      return a;
    }
    function pasoResumen(){
      const fila = (t, v) => `<div class="ap-rf"><span>${t}</span><b>${v}</b></div>`;
      const c = FichaCalculo.calcular(datosFinales()).final;   // con las pasivas y el equipo elegidos
      const habs = [...propiasArmadas().map(h => h.nombre), ...[...st.habs.values()].map(x => (ctx.pool(x.claseId).find(h => h.id === x.habId) || {}).nombre)].filter(Boolean);
      const pas = [...st.pasivas].map(i => pasivasLista[i] && pasivasLista[i].datos.nombre).filter(Boolean);
      const compra = [...st.carrito.entries()].filter(([, n]) => n > 0).map(([id, n]) => { const it = itemTienda(id); return it ? `${it.nombre}${n > 1 ? ' ×' + n : ''}` : ''; }).filter(Boolean);
      const av = avisos();
      return `<div class="ap-resumen">
        ${fila('Nombre', esc(S.meta.nombre || '—'))}${fila('Raza · clase', esc([S.meta.raza, nombreClase(), S.meta.subclase].filter(Boolean).join(' · ') || '—'))}
        ${fila('Atributos', ATTRS.map(a => `${esc(labelAttr(a).slice(0, 3))} ${num(S.attrs[a])}`).join(' · '))}
        ${fila('Vida · No2 · SP', `${fmt(num(c.hpmax))} · ${fmt(num(c.nitros))} · ${fmt(num(c.sp))}`)}
        ${fila('Habilidades', esc(habs.join(', ') || '—'))}${fila('Pasivas', esc(pas.join(', ') || '—'))}
        ${fila('Talentos', esc(st.talentos.map(t => `${t.nombre}${t.puntos ? ' d' + t.puntos * 2 : ''}`).join(', ') || '—'))}
        ${fila('Equipo', esc(compra.join(', ') || '—'))}${fila('DDE', fmt(st.dde - totalCompra()))}
      </div>${st.concepto.trim() ? `<p class="pap-nota" style="margin-top:10px">«${esc(st.concepto.trim())}»</p>` : ''}
      ${av.length ? `<div style="margin-top:10px">${av.map(x => `<div class="ap-aviso">⚠ ${esc(x)}</div>`).join('')}<p class="pap-nota">Se puede crear igual: todo se ajusta después desde la ficha.</p></div>` : ''}`;
    }
    const nombreClase = () => clase() ? clase().nombre : st.claseId === '_otra' ? st.claseOtra.trim() : '';

    const PASOS = [
      {id: 'idea', nombre: 'Idea', ayuda: '<b>¿Quién es?</b> Vos elegís: un paladín, una piedra consciente con un robot, un pendorcho galáctico… Los números vienen después.', html: pasoIdea},
      {id: 'imagen', nombre: 'Imagen', ayuda: '<b>Una foto (opcional).</b> Se ve en la ficha y en tu token del mapa.', html: pasoImagen},
      {id: 'atributos', nombre: 'Atributos', ayuda: '<b>Tus cinco atributos.</b> Repartís 33 puntos; cada uno arranca en 3.', html: pasoAtributos},
      {id: 'habilidades', nombre: 'Habilidades', ayuda: '<b>Lo que sabés hacer.</b> Tenés 3 de Job para habilidades y pasivas.', html: pasoHabilidades},
      {id: 'pasivas', nombre: 'Pasivas', ayuda: '<b>Lo que tenés siempre puesto.</b> Comparten el Job con las habilidades.', html: pasoPasivas},
      {id: 'talentos', nombre: 'Talentos', ayuda: '<b>Lo social y lo que sabés.</b> Tenés 6 de Inteligencia para repartir.', html: pasoTalentos},
      {id: 'equipo', nombre: 'Equipo', ayuda: '<b>Con qué arrancás.</b> Comprás en la tienda que publicó el GM.', html: pasoEquipo},
      {id: 'historia', nombre: 'Historia', ayuda: '<b>Tu historia (opcional).</b> Un motivo, una manía, de dónde venís.', html: pasoHistoria},
      {id: 'resumen', nombre: 'Resumen', ayuda: '<b>Así queda.</b> Todo se puede cambiar después desde la ficha.', html: pasoResumen},
    ].map(p => ({...p, html: () => `<div class="ap-c">${p.html()}</div>`,
      alMontar: (c, a) => { const f = a.cuerpo.querySelector('#ap-nombre, #ap-historia'); if(f && p.id !== 'resumen') setTimeout(() => f.focus(), 30); }}));

    function datosFinales(){
      const d = structuredClone(S);
      d.meta.clase = nombreClase();
      d.meta.dde = Math.max(0, st.dde - totalCompra());
      d.habilidades = [...(d.habilidades || []), ...[...st.habs.values()].map(x => ctx.habilidad(x.claseId, x.habId)).filter(Boolean)];   // las armadas a mano + las elegidas
      d.pasivas = [...st.pasivas].map(i => pasivasLista[i] ? ctx.pasiva(pasivasLista[i].datos, pasivasLista[i].meta) : null).filter(Boolean);
      d.sociales = st.talentos.map(t => ({...FichaEditor.borrador(null), id: uid(), nombre: t.nombre, detalle: '', puntosInt: Math.max(0, num(t.puntos)), nivelExtra: 0}));
      d.inventario = [];
      st.carrito.forEach((n, id) => { const it = itemTienda(id); if(it && n > 0) FichaTienda.crearItems(d, it, n); });
      const historia = [st.concepto.trim() ? `Idea: ${st.concepto.trim()}` : '', st.historia.trim()].filter(Boolean).join('\n\n');
      d.bitacora = [{id: 'j1', nombre: historia ? 'Historia' : 'Página 1', texto: historia}];
      d.bitacoraActiva = 'j1';
      const c = FichaCalculo.calcular(d).final;
      d.hp = Number.isFinite(num(c.hpmax)) ? num(c.hpmax) : 0;   // arranca con la vida llena
      d.nitros = null;                                           // y los No2 llenos
      return d;
    }
    const faltaNombre = () => S.meta.nombre.trim() ? '' : 'Ponele un nombre a tu personaje.';
    async function crear(){
      const f = faltaNombre();
      if(f){ api.irA('idea'); api.aviso(f); return false; }
      return ctx.alCrear(datosFinales());
    }

    const api = PasoAPaso.abrir({
      titulo: '＋ Personaje nuevo', crear: true, z: 52, textoCrear: '✔ Crear el personaje',   // debajo del editor de habilidades (55)
      pasos: PASOS,
      puedeIr: i => i > 0 ? faltaNombre() : '',
      alInput: e => {
        const t = e.target;
        if(t.id === 'ap-nombre') S.meta.nombre = t.value;
        else if(t.id === 'ap-raza') S.meta.raza = t.value;
        else if(t.id === 'ap-subclase') S.meta.subclase = t.value;
        else if(t.id === 'ap-concepto') st.concepto = t.value;
        else if(t.id === 'ap-clase-otra') st.claseOtra = t.value;
        else if(t.id === 'ap-historia') st.historia = t.value;
        else if(t.id === 'ap-dde'){   // sin redibujar (se perdería el foco): solo el contador de lo que se gasta
          st.dde = Math.max(0, Math.round(num(t.value))); st.ddeTocado = true;
          const g = api.raiz.querySelector('[data-ap-gasto]'), total = totalCompra();
          if(g) g.innerHTML = contador(`Gastás ${fmt(total)} de ${fmt(st.dde)} · te quedan ${fmt(st.dde - total)}`, total > st.dde);
        }
      },
      alCambio: async e => {
        const t = e.target;
        if(t.id !== 'ap-img-input') return;
        const file = t.files[0]; t.value = '';
        if(!file || !ctx.imagen) return;
        try{ const r = await ctx.imagen(file); S.meta.imagen = r.imagen || ''; S.meta.miniatura = r.miniatura || ''; api.redibujar(); }
        catch(err){ if(err && err.message !== 'cancelado' && ctx.toast) ctx.toast('No se pudo usar esa imagen'); }
      },
      alClic: e => {
        const b = e.target.closest('button'); if(!b) return;
        const d = b.dataset;
        if(d.apClase !== undefined){ st.claseId = st.claseId === d.apClase ? '' : d.apClase; api.redibujar(); return; }
        if(d.apImg === 'elegir'){ const i = api.raiz.querySelector('#ap-img-input'); if(i) i.click(); return; }
        if(d.apImg === 'quitar'){ S.meta.imagen = ''; S.meta.miniatura = ''; api.redibujar(); return; }
        if(d.apSugerencia){ const v = sugerencia(); if(v) ATTRS.forEach((a, i) => { S.attrs[a] = v[i]; }); api.redibujar(); return; }
        if(d.apAttr){ S.attrs[d.apAttr] = Math.max(MIN_ATTR, num(S.attrs[d.apAttr]) + num(d.apDelta)); api.redibujar(); return; }
        if(d.apHab){ const [claseId, ...resto] = d.apHab.split(':'), habId = resto.join(':'); if(st.habs.has(d.apHab)) st.habs.delete(d.apHab); else st.habs.set(d.apHab, {claseId, habId}); api.redibujar(); return; }
        if(d.apHabNueva || d.apHabEditar){
          if(!ctx.editarHabilidad){ if(ctx.toast) ctx.toast('Una habilidad propia se arma después desde la ficha (+ Habilidad)'); return; }
          ctx.editarHabilidad(S, d.apHabEditar || null, () => { if(api.abierto()) api.redibujar(); });
          return;
        }
        if(d.apHabQuitar){ S.habilidades = (S.habilidades || []).filter(h => h.id !== d.apHabQuitar); api.redibujar(); return; }
        if(d.apAbrir){ if(st.abiertas.has(d.apAbrir)) st.abiertas.delete(d.apAbrir); else st.abiertas.add(d.apAbrir); api.redibujar(); return; }
        if(d.apCatpasiva !== undefined){ st.catPasiva = d.apCatpasiva; api.redibujar(); return; }
        if(d.apPasiva !== undefined){ const i = num(d.apPasiva); if(st.pasivas.has(i)) st.pasivas.delete(i); else st.pasivas.add(i); api.redibujar(); return; }
        if(d.apTalento){ st.talentos.push({nombre: d.apTalento, puntos: intUsado() < intTotal() ? 1 : 0}); api.redibujar(); return; }
        if(d.apTalentoPropio){ const i = api.raiz.querySelector('#ap-talento-propio'), n = i && i.value.trim(); if(n){ st.talentos.push({nombre: n.slice(0, 40), puntos: 0}); api.redibujar(); } return; }
        if(d.apTal !== undefined){ const t = st.talentos[num(d.apTal)]; if(t){ t.puntos = Math.max(0, num(t.puntos) + num(d.apDelta)); api.redibujar(); } return; }
        if(d.apTalQuitar !== undefined){ st.talentos.splice(num(d.apTalQuitar), 1); api.redibujar(); return; }
        if(d.apItem){
          const n = Math.max(0, (st.carrito.get(d.apItem) || 0) + num(d.apDelta)), it = itemTienda(d.apItem);
          if(num(d.apDelta) > 0 && it && totalCompra() + precioDe(it) > st.dde){ api.aviso(`No te alcanzan los DDE para ${it.nombre}.`); return; }
          if(n) st.carrito.set(d.apItem, n); else st.carrito.delete(d.apItem);
          api.redibujar(); return;
        }
      },
      alTecla: e => {
        if(e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
        e.preventDefault();
        if(e.target.id === 'ap-talento-propio'){ const n = e.target.value.trim(); if(n){ st.talentos.push({nombre: n.slice(0, 40), puntos: 0}); api.redibujar(); } return; }
        if(api.paso() < PASOS.length - 1) api.irA(api.paso() + 1);
      },
      confirmarCancelar: () => S.meta.nombre.trim() || st.habs.size || (S.habilidades || []).length || st.talentos.length ? '¿Cancelar? El personaje que estás armando se descarta.' : '',
      alCrear: () => crear(),
    });
    return api;
  }
  return {abrir, DDE_POR_DEFECTO, MIN_ATTR};
})();
