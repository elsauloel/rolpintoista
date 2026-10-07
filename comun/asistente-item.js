/* =========================================================
   ASISTENTE DE ÍTEMS (compartido)
   Crear o editar un ítem de equipo paso a paso, explicando en cada paso qué
   implica lo que se elige. Paso 1: categoría, nombre y la descripción en
   palabras (todo lo que hace el ítem). Después, solo los pasos con
   aplicación práctica para esa categoría:
     armas     Tipo · empuñadura · peso y daño · bonos · efectos al golpear
     ✨ especial (varita, báculo: un hechizo equipable, 2026-10-05) empuñadura · hechizo (costo y daño) · Ejecución ✨ y trampa ·
               ✋ a mano (texto y tirada para lo que no se automatiza) · bonos
     defensa   defensa y resistencias a crítico · bonos  (🔮 un orbe: lo que hace al usar una varita, en vez de la Defensa)
     el resto  bonos
   y al final estado al equipar, precio/lugar y resumen. Los consumibles no
   pasan por acá: cfg.onConsumible los manda al formulario de cada herramienta.
   Necesita comun/efectos-golpe.js (efectos al golpear).

   Lo usan ficha.html (inventario y catálogo), gm-tools.html (arma de un
   creep e ítem custom), vendor-generator.html y catalogo-editor.html.

   AsistenteItem.abrir(cfg) — cfg:
     contexto    'ficha' | 'creep' | 'tienda' | 'catalogo' (cambia los textos)
     nuevo       true al crear («✔ Crear» en el último paso; al editar, Guardar siempre). La ventana es la común paso a paso
                 (comun/paso-a-paso.js, 2026-10-02): título con el paso, pestañas que saltan, Atrás/Siguiente.
     draft       el ítem (campos del catálogo: nombre, tipoItem, detalle, mods,
                 tipoDado, peso, danoFijo, danoAmplificado, armaDeRango,
                 efectosGolpe, tier, descripcionNarrativa, precioCompra,
                 ranuras, imagen, equipado, manoPreferida, equipoEstado*)
     categorias  ids de tipoItem que se pueden elegir (null = todos)
     fijarCategoria  true = no se puede cambiar la categoría (ej. arma del creep)
     stats       [{id, label}] para la lista de bonos
     tiers       lista de tiers (null = no se pide)
     destinos    {label, opciones:[{v, l}], valor, nota} (ej. a qué creep) — opcional
     portador    destino => {nombre, nitros, dmg, rango, def, cargaUsada, cargaMax,
                 manosUsadas} de quien lo va a usar — opcional
     ejemplos    (tipoItem, tipoDado) => [nombres] del catálogo — opcional
     conPrecio, conRanuras, conNarrativa, conImagen, conEstadoEquipar,
     conPresetEstado, conLugar (equipado / mochila), conMano (mano preferida)
     imagenADatos file => Promise<dataURL> — opcional (si no, se lee tal cual)
     precioTxt   d => texto extra sobre el precio — opcional
     botones     [{texto, accion(d, boton)}] extra en el pie — opcional
     textoGuardar, onGuardar(d, destino) → false para no cerrar
     onFormulario(d) — si está, el resumen ofrece el formulario completo
     onConsumible(d) — al elegir la categoría Consumibles
     sinEspecial   true = no ofrece «✨ arma especial» (el arma de un creep o de una invocación)
     elegirEstado  () => Promise — el «+ Estado» de la página para la Ejecución ✨ de un arma especial (opcional; ver asistente-duelo-hab.js)
   ========================================================= */
const AsistenteItem = (() => {
  const DADOS = [4, 6, 8, 10, 12];
  const TIPOS = {
    4: {nombre: 'Perforante', ejemplo: 'dagas, estoques, lanzas livianas'},
    6: {nombre: 'Cortante', ejemplo: 'espadas, cimitarras, sables'},
    8: {nombre: 'Hachas', ejemplo: 'hachas de mano, hachas de guerra, hachas dobles'},   // el Tipo 8 es siempre hachas (dueño, 2026-10-03)
    10: {nombre: 'Contundente pesado', ejemplo: 'martillos de guerra, mazas de dos manos'},
    12: {nombre: 'Explosivo / armas modernas', ejemplo: 'lanzallamas, explosivos (tier Excepcional)'},
  };
  const CATEGORIAS = [
    {id: 'arma_1m', label: 'Arma de una mano', grupo: 'arma'},
    {id: 'arma_2m', label: 'Arma de dos manos', grupo: 'arma'},
    {id: 'escudo_1m', label: 'Escudo de una mano', grupo: 'defensa'},
    {id: 'escudo_2m', label: 'Escudo de dos manos', grupo: 'defensa'},
    {id: 'armadura_blanda', label: 'Armadura blanda', grupo: 'defensa'},
    {id: 'armadura_rigida', label: 'Armadura rígida', grupo: 'defensa'},
    {id: 'cabeza', label: 'Cabeza', grupo: 'defensa'},
    {id: 'manos', label: 'Manos', grupo: 'defensa'},
    {id: 'piernas', label: 'Piernas', grupo: 'defensa'},
    {id: 'pies', label: 'Pies', grupo: 'defensa'},
    {id: 'cinturon', label: 'Cinturón', grupo: 'accesorio'},
    {id: 'mochila', label: 'Mochila', grupo: 'accesorio'},
    {id: 'anillos', label: 'Anillo', grupo: 'accesorio'},
    {id: 'otros', label: 'Otro', grupo: 'otro'},
    {id: 'consumibles', label: 'Consumible', grupo: 'consumible'},
  ];
  const GRUPO_TITULO = {arma: 'Armas', defensa: 'Defensa', accesorio: 'Accesorios', otro: 'Otros', consumible: 'Consumibles'};
  const RAPIDOS = {
    arma: [['pdg', 'PdG'], ['crit', 'Crít. frecuente'], ['critpot', 'Crít. potente'], ['pdgcontra', 'PdG en contraataque'], ['pdgopor', 'PdG en oportunidad'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['dmg', 'Dmg']],
    defensa: [['eva', 'Evasión'], ['parry', 'Parry'], ['bloqueo', 'Bloqueo'], ['hpmax', 'HP máx.'], ['mov', 'Movimiento'], ['armadmg', 'Defensa especial']],
    accesorio: [['con', 'Con'], ['fue', 'Fue'], ['agl', 'Agi'], ['des', 'Des'], ['esp', 'Esp'], ['capcinturon', 'Ranuras de cinturón'], ['capmochila', 'Ranuras de mochila']],
    otro: [['con', 'Con'], ['fue', 'Fue'], ['agl', 'Agi'], ['des', 'Des'], ['esp', 'Esp']],
  };
  const EXPLICA_BONO = {
    pdgopor: 'PdG solo en ataques de oportunidad: vale mucho menos que un PdG normal porque es circunstancial',
    pdgcontra: 'PdG solo al contraatacar (tras un Parry): vale mucho menos que un PdG normal porque es circunstancial',
    pdg: 'probabilidad de golpe', crit: 'Crítico frecuente: baja el rango del crítico (cada punto = 1 menos de diferencia PdG − Evasión; mínimo 2)', critpot: 'Crítico potente: baja los umbrales del d20 (doble, triple y cuádruple daño)',
    parry: 'desviar golpes', bloqueo: 'frenar daño', dmg: 'suma al daño de los golpes cuerpo a cuerpo',
    eva: 'esquivar', hpmax: 'vida máxima', mov: 'casilleros de movimiento', capcinturon: 'lugares extra en el cinturón', capmochila: 'lugares extra en la mochila',
    armadmg: 'protege contra el daño de casteo que ignora la Defensa — reservalo para ítems Raros o mejores',
  };
  const CRIT_IDS = ['tipo1', 'tipo2', 'tipo3', 'tipo4', 'tipo5'];
  const CRIT_TIPO = {tipo1: 4, tipo2: 6, tipo3: 8, tipo4: 10, tipo5: 12};

  const n = v => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
  const f = x => Number.isInteger(x) ? x : Math.round(x * 100) / 100;
  const e = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  // Costo de atacar: la regla del motor (comun/combatiente.js); la copia de abajo es solo por si una página no lo carga.
  const MOTOR = () => (typeof Combatiente !== 'undefined' ? Combatiente : null);
  const primer = t => MOTOR() ? MOTOR().costoPrimerAtaque(t) : Math.ceil(t / 2);
  const ataques = (t, nitros) => MOTOR() ? MOTOR().ataquesPosibles(t, nitros) : (nitros < primer(t) ? 0 : 1 + Math.floor((nitros - primer(t)) / t));
  const grupoDe = id => (CATEGORIAS.find(c => c.id === id) || {}).grupo || '';
  const labelDe = id => (CATEGORIAS.find(c => c.id === id) || {}).label || id;
  const danoTxt = d => {
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    return `${dados}d${n(d.tipoDado) || 8}${n(d.danoFijo) ? ` + ${f(n(d.danoFijo))}` : ''}`;
  };
  const modVal = (d, stat) => (d.mods || []).filter(m => m.stat === stat).reduce((a, m) => a + n(m.val), 0);
  function setMod(d, stat, val){
    d.mods = (d.mods || []).filter(m => m.stat !== stat);
    if(val) d.mods.push({stat, val});
  }
  const EG = () => (typeof EfectosGolpe !== 'undefined' ? EfectosGolpe : null);

  /* ✨ Armas especiales y 🔮 orbes (2026-10-05, rework mágico): una varita o un báculo es un hechizo equipable (`especial` = {sp, no2, sube,
     dano, sumaEspecial, duelo (la Ejecución ✨), trampaColocar?, estadoPropio?, aMano?}); un orbe va en la otra mano y actúa al usar una
     varita (`orbe`, `orbeResguardo`, `orbeSalvaje`). Ver comun/CLAUDE.md «Armas especiales». */
  const esEspecial = d => grupoDe(d.tipoItem) === 'arma' && !!d.especial;
  const esOrbe = d => d.tipoItem === 'escudo_1m' && !!d.orbe;
  const ESPECIAL_NUEVA = () => ({sp: 1, no2: 1, sube: 1, dano: ''});
  const OBJETIVO_TXT = {enemigo: 'a un rival', aliado: 'a un aliado', 'uno mismo': 'a quien la usa', area: 'un área', onda: 'una onda alrededor', cono: 'un cono al frente', linea: 'una línea recta', zona: 'una zona que queda'};
  const statTxt = id => {
    if(!id) return '';
    const L = (typeof FichaCalculo !== 'undefined' && FichaCalculo.STAT_LABEL) || {};
    return L[id] || ({pdgmg: 'PdG.Esp', resmg: 'Res.Esp', dmgesp: 'Ef.Esp', eva: 'Evasión', rescc: 'Res.CC', resm: 'Res.Mt'})[id] || id;
  };
  const efectoTxt = x => x.cura !== undefined ? `cura ${x.cura}` : x.nombre === 'Pierde No2' ? `pierde ${x.no2} No2` : `${x.nombre}${Number(x.caras) > 1 ? ` (${Math.round(100 * Math.max(1, n(x.exitos)) / Number(x.caras))} %)` : ''}${x.turnos ? ` ${x.turnos} t.` : ''}`;
  // Lo que hace la Ejecución ✨ de un arma especial, en palabras (una línea por cosa).
  function ejecucionLineas(du){
    if(!du) return [];
    const L = [];
    const ob = du.objetivo === 'zona' && du.niebla ? 'una nube de niebla' : (OBJETIVO_TXT[du.objetivo] || du.objetivo || 'a un rival');
    const tam = du.objetivo === 'linea' ? ` de ${du.largo || du.radio || 4}` : (du.radio !== undefined && ['area', 'onda', 'zona'].includes(du.objetivo)) ? ` de radio ${du.radio}` : '';
    L.push(`Objetivo: ${ob}${tam}${du.conVista ? ' (todos los rivales que ve)' : ''}`);
    const tira = du.tiraFormula ? `${du.tiraEtiqueta || 'Tirada'} (${du.tiraFormula})` : statTxt(du.tira);
    if(tira) L.push(`Tira ${tira}${(du.contra || []).length ? ` contra ${du.contra.map(statTxt).join(' o ')}` : du.contraOtro ? ` contra ${du.contraOtro} (a mano)` : ', sin resistencia'}`);
    if(du.dano) L.push(`Daño ${du.tipoDano || 'arcano'}${du.danoDiferencia ? ': la diferencia de las tiradas' : ''}${du.ignoraDano === false ? ' (la Defensa lo frena)' : du.trueDamage ? ' (True Damage: no lo frena nada)' : du.danoDirecto ? ' (daño directo: no lo frena la Defensa especial)' : ' (lo frena la Defensa especial)'}`);
    if((du.efectos || []).length) L.push('Efectos: ' + du.efectos.map(efectoTxt).join(', '));
    if(du.cadena) L.push(`Salta a ${du.cadena.saltos} más (a ${du.cadena.rango} casillas)`);
    if(du.reparte) L.push(`${du.reparte.total || 2} misiles de ${du.reparte.cada}, de a uno`);
    if(du.zonaQueda) L.push(`Deja ${du.zonaQueda.nombre || 'una zona'} ${du.zonaQueda.turnos || 1} turno(s)`);
    if(du.atrae) L.push(`Atrae ${du.atrae.casillas} casillas`);
    if(du.menosDistancia) L.push('−1 de daño por casillero de distancia');
    if(du.critTipo) L.push(`Critica como un arma de Tipo ${du.critTipo}`);
    if(du.efectoLibre) L.push(`✋ ${du.efectoLibre}`);
    if(du.efectosNota) L.push(`✋ ${du.efectosNota}`);
    return L;
  }
  const trampaTxt = t => (typeof AsistenteTrampa !== 'undefined' && AsistenteTrampa.resumenTexto) ? AsistenteTrampa.resumenTexto(t) : `${t.nombre || 'Trampa'}${t.dano ? ` · ${t.dano}` : ''}`;
  // Lo que la trampa de un arma especial trae y el asistente de trampas no conoce (los pilares, el portal): se conserva al ajustarla.
  const TRAMPA_CONSERVA = ['pilar', 'portal'];
  const costoEspTxt = es => {
    const sp = Math.max(0, Math.round(n(es.sp))), no2 = Math.max(0, Math.round(n(es.no2 ?? 1))), sube = Math.max(0, Math.round(n(es.sube ?? 1)));
    return `${no2} No2${sp ? ` + ${sp} SP (sin SP: ${no2 + sp} No2)` : ''}${sube ? `; el No2 sube ${sube} por cada uso más en el turno` : ''}`;
  };
  const esperaCreep = es => (typeof CreepAcciones !== 'undefined' && CreepAcciones.ESPERA_POR_SP) ? CreepAcciones.ESPERA_POR_SP(n(es.sp)) : (n(es.sp) <= 0 ? 0 : n(es.sp) <= 2 ? 1 : 2);
  const espCostoHtml = es => `Cuesta <b>${e(costoEspTxt(es))}</b>. Un creep no tiene SP: la paga con <b>${esperaCreep(es)} turno(s) de espera</b> (provisorio).`;

  let st = null;  // {cfg, d, destino, estadoAbierto, api (la ventana común), inicial}
  let cssPuesto = false;
  const enVentana = sel => st && st.api ? st.api.raiz.querySelector(sel) : null;

  function pasos(){
    const {cfg, d} = st;
    const g = grupoDe(d.tipoItem);
    const L = [{id: 'que', corto: 'Qué es'}];
    const esp = esEspecial(d), orbe = esOrbe(d);
    if(g === 'arma' && !esp) L.push({id: 'tipo', corto: 'Tipo'}, {id: 'empunadura', corto: 'Empuñadura'}, {id: 'dano', corto: 'Peso y daño'});
    if(esp) L.push({id: 'empunadura', corto: 'Empuñadura'}, {id: 'hechizo', corto: 'Hechizo'}, {id: 'ejecucion', corto: 'Qué hace ✨'}, {id: 'amano', corto: '✋ A mano'});
    if(g === 'defensa') L.push(orbe ? {id: 'orbe', corto: 'Orbe'} : {id: 'defensa', corto: 'Defensa'});
    if(g) L.push({id: 'bonos', corto: 'Bonos'});
    if(g === 'arma' && !esp) L.push({id: 'golpe', corto: 'Al golpear'});
    if(g && cfg.conEstadoEquipar) L.push({id: 'equipar', corto: 'Al equipar'});
    if(g && (cfg.conPrecio || cfg.conRanuras || cfg.conLugar || g !== 'arma')) L.push({id: 'lugar', corto: cfg.conPrecio ? 'Precio' : 'Peso'});
    L.push({id: 'listo', corto: 'Listo'});
    return L;
  }

  function montar(){
    if(cssPuesto) return;
    cssPuesto = true;
    const css = document.createElement('style');
    css.textContent = `
.aa-efecto b{color:var(--brass,#E0A458)}
.aa-campo{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}
.aa-campo>label{font-family:"Space Mono",monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#9A867E)}
.aa-campo input,.aa-campo select,.aa-campo textarea,.aa-mod select,.aa-mod input,.aa-golpe input,.aa-golpe select{background:var(--panel2,#221A1E);border:1px solid var(--line,#3B2E34);color:var(--paper,#EDE3D2);border-radius:var(--r,3px);padding:6px 8px;font:inherit;font-size:13px;width:100%;box-sizing:border-box}
.aa-fila{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px}
.aa-opciones{display:flex;flex-wrap:wrap;gap:6px}
.aa-op{font-family:"Space Mono",monospace;font-size:10.5px;border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:6px 11px;color:var(--muted,#9A867E);border-radius:var(--r,3px);cursor:pointer}
.aa-op:hover{border-color:var(--copper,#C98545);color:var(--paper,#EDE3D2)}
.aa-op.activa{border-color:var(--copper,#C98545);background:rgba(201,133,69,.18);color:var(--paper,#EDE3D2);font-weight:700}
.aa-cat-grupo{font-family:"Space Mono",monospace;font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--copper,#C98545);margin:6px 0 4px}
.aa-tipos{display:flex;flex-direction:column;gap:6px;margin-bottom:10px}
.aa-tipo{display:grid;grid-template-columns:52px 1fr;gap:2px 10px;align-items:center;text-align:left;border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:7px 10px;border-radius:var(--r,3px);color:var(--paper,#EDE3D2);cursor:pointer;font:inherit}
.aa-tipo:hover{border-color:var(--copper,#C98545)}
.aa-tipo.activa{border-color:var(--copper,#C98545);background:rgba(201,133,69,.18)}
.aa-tipo b{grid-row:span 2;font-family:"Fraunces",serif;font-size:20px;color:var(--brass,#E0A458);text-align:center}
.aa-tipo span{font-size:12.5px;font-weight:700}
.aa-tipo small{font-size:11px;color:var(--muted,#9A867E);line-height:1.35}
.aa-efecto{border-left:3px solid var(--copper,#C98545);background:var(--panel2,#221A1E);padding:7px 10px;font-size:12.5px;line-height:1.45;margin:0 0 10px;border-radius:0 var(--r,3px) var(--r,3px) 0}
.aa-nota{font-size:11.5px;color:var(--muted,#9A867E);line-height:1.45;margin:-4px 0 10px}
.aa-mod{display:grid;grid-template-columns:1fr 80px 30px;gap:6px;margin-bottom:6px}
.aa-x{border:1px solid var(--line,#3B2E34);background:none;color:var(--muted,#9A867E);border-radius:var(--r,3px);cursor:pointer}
.aa-crit{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
.aa-crit label{font-family:"Space Mono",monospace;font-size:9.5px;color:var(--muted,#9A867E);text-align:center;display:block}
.aa-crit input{text-align:center}
.aa-golpe{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);border-radius:var(--r,3px);padding:8px 10px;margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr 30px;gap:6px}
.aa-golpe .aa-ancho{grid-column:1 / -1}
.aa-golpe .aa-regla{grid-column:1 / -1;font-size:11.5px;color:var(--brass,#E0A458)}
.aa-resumen{border:1px solid var(--line,#3B2E34);background:var(--panel2,#221A1E);padding:10px 12px;border-radius:var(--r,3px)}
.aa-resumen-nombre{font-family:"Fraunces",serif;font-size:17px;font-weight:700;color:var(--brass,#E0A458)}
.aa-resumen-desc{font-size:12.5px;margin:4px 0 8px;white-space:pre-wrap}
.aa-resumen-fila{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:3px 0;border-top:1px solid var(--line-soft,#2A2126)}
.aa-resumen-fila span{color:var(--muted,#9A867E);flex:none}
.aa-resumen-fila b{text-align:right}
.aa-img{width:72px;height:72px;object-fit:cover;border:1px solid var(--line,#3B2E34);border-radius:var(--r,3px)}
`;
    document.head.appendChild(css);
  }

  function abrir(cfg){
    montar();
    const d = Object.assign({
      nombre: '', tipoItem: '', tipoDado: 8, peso: 1, danoFijo: 0, danoAmplificado: 0,
      armaDeRango: false, mods: [], efectosGolpe: [], detalle: '', descripcionNarrativa: '', tier: 'Común',
      precioCompra: 0, ranuras: 1, imagen: '',
      equipoEstadoNombre: '', equipoEstadoHpTurno: 0, equipoEstadoDetalle: '', equipoEstadoPreset: '',
    }, structuredClone(cfg.draft || {}));
    if(!DADOS.includes(n(d.tipoDado))) d.tipoDado = 8;
    d.mods = Array.isArray(d.mods) ? d.mods : [];
    d.efectosGolpe = Array.isArray(d.efectosGolpe) ? d.efectosGolpe : [];
    if(st && st.api) st.api.cerrar();
    st = {cfg, d, destino: cfg.destinos ? cfg.destinos.valor : null,
      estadoAbierto: !!String(d.equipoEstadoNombre || '').trim()};
    const yo = st;
    yo.inicial = JSON.stringify(d);
    yo.api = PasoAPaso.abrir({
      titulo: cfg.titulo || (cfg.nuevo ? 'Ítem nuevo' : `Editar ${d.nombre || 'ítem'}`),
      crear: !!cfg.nuevo, z: 95, inicio: cfg.paso || 0,
      textoCrear: cfg.textoGuardar || '✔ Crear', textoGuardar: cfg.textoGuardar || 'Guardar',
      // Cada paso: su contenido y su ayuda se arman juntos, una vez por dibujo.
      pasos: () => pasos().map(x => {
        let c = null;
        const cont = () => c || (c = contenidoPaso(x.id));
        return {id: x.id, nombre: x.corto, get ayuda(){ return cont().ayuda; }, html: () => cont().h};
      }),
      puedeIr: i => i > 0 ? faltaAlgo() : '',
      alClic: alClic, alInput: alEscribir, alCambio: alCambiar,
      alTecla: ev => {
        if(ev.key === 'Enter' && ev.target.matches('input:not([type=file])')){
          ev.preventDefault();
          alEscribir(ev);
          ir(yo.api.paso() + 1);
        }
      },
      extras: (cfg.botones || []).map((x, i) => ({id: 'extra' + i, texto: x.texto, alClic: () => { if(st === yo) x.accion(limpio(), enVentana(`[data-pap-extra="extra${i}"]`)); }})),
      confirmarCancelar: () => JSON.stringify(yo.d) === yo.inicial ? '' : (cfg.nuevo ? '¿Cancelar? El ítem que estás armando se descarta.' : '¿Descartar los cambios de este ítem?'),
      alGuardar: () => guardar(), alCrear: () => guardar(),
      alCancelar: () => { if(st === yo) st = null; },
    });
    setTimeout(() => { const i = enVentana('.pap-paso input:not([type=file])'); if(i) i.focus(); }, 40);
  }

  function cerrar(){
    if(!st) return;
    const api = st.api;
    st = null;
    if(api) api.cerrar();
  }

  function faltaAlgo(){
    if(!st.d.tipoItem) return 'Primero elegí qué tipo de ítem es';
    if(!st.d.nombre.trim()) return 'Primero ponele un nombre';
    return '';
  }

  function ir(i){ if(st && st.api) st.api.irA(i); }   // lo que falta lo avisa la ventana (puedeIr)
  function dibujar(){ if(st && st.api) st.api.redibujar(); }

  function avisar(msg){
    if(typeof toast === 'function') toast(msg); else alert(msg);
  }

  const portador = () => (st.cfg.portador ? st.cfg.portador(st.destino) : null);

  // Cómo se nombra a quien lo usa, según la herramienta.
  function quien(){
    const ctx = st.cfg.contexto;
    const p = portador();
    const nombreCreep = p && p.nombre ? p.nombre : 'el creep';
    return {
      ctx, p,
      suj: ctx === 'ficha' ? 'vos' : ctx === 'creep' ? nombreCreep : 'el jugador',
      de: ctx === 'ficha' ? 'que tenés' : ctx === 'creep' ? `de ${nombreCreep}` : 'del jugador',
      tener: ctx === 'ficha' ? 'la tengas' : ctx === 'creep' ? `${nombreCreep} la tenga` : 'el jugador la tenga',
    };
  }

  const efecto = txt => `<div class="aa-efecto">${txt}</div>`;
  const op = (attr, valor, activa, texto) => `<button type="button" class="aa-op ${activa ? 'activa' : ''}" data-aa-${attr}="${e(valor)}">${texto}</button>`;
  const campo = (label, html, nota) => `<div class="aa-campo"><label>${label}</label>${html}${nota ? `<div class="aa-nota" style="margin:2px 0 0">${nota}</div>` : ''}</div>`;
  const input = (c, val, extra = '') => `<input data-aa-c="${c}" value="${e(val)}" ${extra}>`;
  const num = (c, val, extra = '') => `<input data-aa-c="${c}" type="number" value="${e(val)}" ${extra}>`;

  function contenidoPaso(id){
    const {cfg, d} = st;
    const paso = {id};
    const q = quien();
    const p = q.p;
    const g = grupoDe(d.tipoItem);
    const tipo = n(d.tipoDado) || 8;
    let h = '', ayuda = '';
    const titulo = (t, a) => { ayuda = `<b>${t}</b> ${a}`; };

    if(paso.id === 'que'){
      titulo('¿Qué es?', 'Elegí el tipo de ítem, ponele nombre y contá con palabras todo lo que hace. Los pasos siguientes cargan solo la parte práctica (lo que la herramienta calcula o recuerda sola).');
      if(!cfg.fijarCategoria){
        const permitidas = CATEGORIAS.filter(c => !cfg.categorias || cfg.categorias.includes(c.id));
        const grupos = [...new Set(permitidas.map(c => c.grupo))];
        h += `<div class="aa-campo"><label>Tipo de ítem</label>${grupos.map(gr => `<div class="aa-cat-grupo">${GRUPO_TITULO[gr]}</div>
          <div class="aa-opciones">${permitidas.filter(c => c.grupo === gr).map(c => op('cat', c.id, d.tipoItem === c.id, e(c.label))).join('')}</div>`).join('')}</div>`;
        if(g) h += efecto(explicaCategoria(d.tipoItem, q));
      }
      if(g === 'arma' && !cfg.sinEspecial){
        h += campo('¿Qué clase de arma?', `<div class="aa-opciones">${op('clase', 'fisica', !d.especial, '⚔ Física (Tipo, peso y daño)')}${op('clase', 'especial', !!d.especial, '✨ Especial: varita o báculo')}</div>`,
          d.especial ? 'Un <b>hechizo equipable</b>: se usa desde Atacar («✨ Atacar · nombre»), cuesta No2 y SP (un creep paga el SP con espera) y hace lo que diga su Ejecución ✨. No tiene Tipo, ni daño físico, ni Parry.'
            : 'Un arma de las de siempre: Tipo, dados por Peso, Dmg, críticos.');
      }
      if(d.tipoItem === 'escudo_1m'){
        h += campo('¿Escudo u orbe?', `<div class="aa-opciones">${op('orbe', '0', !d.orbe, '🛡 Escudo')}${op('orbe', '1', !!d.orbe, '🔮 Orbe (acompaña a las varitas)')}</div>`,
          d.orbe ? 'Va en la otra mano y <b>actúa al usar una varita o un báculo</b> (un escudo, una tirada…). No parrea ni bloquea.' : 'Un escudo de los de siempre: Defensa, Bloqueo, Parry.');
      }
      h += campo('Nombre', input('nombre', d.nombre, 'placeholder="ej. Hacha oxidada del pantano"'),
        q.ctx === 'creep' ? 'Se lee en la tarjeta del creep y en la Mesa.'
          : q.ctx === 'ficha' ? 'Aparece en tu Equipo, en la Botonera y en la Mesa.'
          : 'Es como lo ven los jugadores en el catálogo, en las tiendas y en su Equipo.');
      h += campo('Descripción (qué hace, en palabras)', `<textarea data-aa-c="detalle" rows="4" placeholder="ej. Hoja dentada. Tiene 50% de envenenar al golpear. Resistencia a críticos Tipo 6: +1.">${e(d.detalle)}</textarea>`,
        'Contá todos sus efectos: bonos, resistencias a crítico, estados que aplica, efectos al golpear, lo que haga falta recordar. Es lo que se lee al mirar el ítem; los números de los pasos siguientes son los que la herramienta usa.');
      if(cfg.destinos){
        h += campo(cfg.destinos.label, `<select data-aa-destino="1">${cfg.destinos.opciones.map(o => `<option value="${e(o.v)}" ${String(st.destino) === String(o.v) ? 'selected' : ''}>${e(o.l)}</option>`).join('')}</select>`, cfg.destinos.nota || '');
      }
      if(cfg.tiers){
        h += campo('Tier (rareza)', `<select data-aa-c="tier">${cfg.tiers.map(t => `<option value="${e(t)}" ${d.tier === t ? 'selected' : ''}>${e(t)}</option>`).join('')}</select>`,
          q.ctx === 'creep'
            ? 'Solo importa si lo publicás en el catálogo. "A definir" lo deja marcado para revisarlo.'
            : 'Marca qué tan raro es: el generador de tiendas sortea más seguido los comunes, y en la ficha Excepcional y Legendario no aparecen en el catálogo general (solo en tiendas).');
      }
      if(cfg.conNarrativa){
        h += campo('Descripción narrativa (opcional)', `<textarea data-aa-c="descripcionNarrativa" rows="2" placeholder="ej. Hoja ancha de un solo filo, gastada de tanto uso.">${e(d.descripcionNarrativa)}</textarea>`,
          'Solo color: se lee al mirar el ítem, no tiene ningún efecto.');
      }
      if(cfg.conImagen){
        h += campo('Imagen (opcional)', `<div style="display:flex;gap:10px;align-items:center">
          ${d.imagen ? `<img class="aa-img" src="${d.imagen}" alt="">` : ''}
          <input type="file" accept="image/*" data-aa-imagen="1">
          ${d.imagen ? '<button type="button" class="aa-op" data-aa-quitarimg="1">Quitar</button>' : ''}
        </div>`);
      }
    }

    if(paso.id === 'tipo'){
      titulo('¿De qué Tipo es el arma?', 'El Tipo decide tres cosas a la vez: <b>el dado de daño</b> (Tipo 6 = cada dado es un d6), <b>cuántos Nitros cuesta atacar</b> (el primer ataque del turno con esta arma cuesta la mitad del Tipo; los siguientes, el Tipo entero) y <b>contra qué resistencia a críticos choca</b>. Más Tipo = más daño por golpe, pero menos golpes por turno.');
      h += `<div class="aa-tipos">${DADOS.map(t => `<button type="button" class="aa-tipo ${tipo === t ? 'activa' : ''}" data-aa-tipo="${t}">
          <b>${t}</b><span>${e(TIPOS[t].nombre)} · d${t}</span>
          <small>${e(TIPOS[t].ejemplo)} · atacar: ${primer(t)} No2 el primero, ${t} los siguientes</small>
        </button>`).join('')}</div>`;
      let txt = `Con <b>Tipo ${tipo}</b>: cada dado de daño es un <b>d${tipo}</b>. Atacar cuesta <b>${primer(tipo)} No2</b> el primer golpe del turno y <b>${tipo} No2</b> cada golpe siguiente.`;
      if(p){
        const a = ataques(tipo, n(p.nitros));
        txt += `<br>Con ${q.ctx === 'ficha' ? 'tus' : 'sus'} ${f(n(p.nitros))} No2, ${q.ctx === 'ficha' ? 'te entran' : `<b>${e(q.suj)}</b> hace`} <b>${a} ataque${a === 1 ? '' : 's'} por turno</b> con ella (si no se gastan Nitros en otra cosa).`;
      }else{
        txt += `<br>Ataques por turno según los No2 del personaje: ${[4, 6, 8, 12].map(x => `con ${x} → <b>${ataques(tipo, x)}</b>`).join(' · ')}.`;
      }
      txt += `<br>Un crítico con esta arma choca contra la <b>Res. crítico Tipo ${tipo}</b> de quien recibe el golpe.`;
      h += efecto(txt);
      const ej = cfg.ejemplos ? cfg.ejemplos(d.tipoItem, tipo).filter(x => x !== d.nombre) : [];
      if(ej.length) h += `<div class="aa-nota">En el catálogo, Tipo ${tipo}: ${e(ej.slice(0, 6).join(', '))}${ej.length > 6 ? '…' : ''}</div>`;
    }

    if(paso.id === 'empunadura'){
      if(esEspecial(d)) titulo('¿Con cuántas manos se empuña?', 'Las manos que ocupa definen qué más se puede llevar al mismo tiempo (con una mano, en la otra puede ir un orbe).');
      else titulo('¿Cómo se empuña y a qué distancia pega?', 'Las manos que ocupa definen qué más se puede llevar al mismo tiempo; la distancia define si el daño suma el Dmg (que sale de la Fuerza).');
      const dos = d.tipoItem === 'arma_2m';
      h += campo('Manos', `<div class="aa-opciones">${op('manos', 'arma_1m', !dos, 'Una mano')}${op('manos', 'arma_2m', dos, 'Dos manos')}</div>`);
      h += efecto(q.ctx === 'creep'
        ? `Un creep lleva <b>una sola arma</b>: las manos no le cambian nada. Solo cuentan si después la publicás en el catálogo.`
        : dos
          ? 'Ocupa <b>las dos manos</b>: mientras esté equipada no se puede llevar escudo ni otra arma.'
          : 'Ocupa <b>una mano</b>: la otra queda libre para un escudo o una segunda arma. Con dos armas, cada una paga su propio primer ataque del turno y el PdG de cada una solo cuenta cuando se ataca con ella.');
      if(p && p.manosUsadas !== undefined) h += `<div class="aa-nota">Manos ocupadas hoy: ${f(n(p.manosUsadas))} de 2.</div>`;
      if(cfg.conMano && !dos) h += campoMano(d);
      if(esEspecial(d)) return {h: h + efecto('Un arma especial no tiene distancia propia: hasta dónde llega lo dice su Ejecución ✨ (el Rango de casteo, una línea, un área…).'), ayuda};
      h += campo('Distancia', `<div class="aa-opciones">${op('rango', '0', !d.armaDeRango, 'Cuerpo a cuerpo')}${op('rango', '1', !!d.armaDeRango, 'A distancia')}</div>`);
      h += efecto(d.armaDeRango
        ? `Es <b>de rango</b> (arco, pistola, lanzallamas…): tiene su propia mecánica — el daño <b>no suma el Dmg</b>, es solo el del arma. No confundir con el <b>Alcance</b> de las armas cuerpo a cuerpo: son dos cosas distintas.`
        : `Es <b>cuerpo a cuerpo</b>: al tirar daño se suma el <b>Dmg</b> ${e(q.de)}${p ? ` (hoy ${f(n(p.dmg))})` : ''}.`);
      // Mismo mod ('rng'), pero se explica distinto: en un arma de rango es su
      // propia distancia de disparo; en una cuerpo a cuerpo es el Alcance
      // (deja pegar a más de un casillero sin dejar de sumar el Dmg).
      if(d.armaDeRango){
        h += campo('Rango del disparo (+ Rango)', `<input data-aa-mod1="rng" type="number" step="1" value="${modVal(d, 'rng')}" style="max-width:120px">`,
          `Hasta dónde llega el disparo, además de lo que ya da la Destreza.${p && p.rango !== undefined ? ` Hoy el Rango ${e(q.de)} es ${f(n(p.rango))}.` : ''}`);
      }else{
        h += campo('Alcance', `<input data-aa-mod1="rng" type="number" step="1" value="${modVal(d, 'rng')}" style="max-width:120px">`,
          `Sin esto, un arma cuerpo a cuerpo solo golpea al casillero de al lado. Cada +1 la deja atacar un casillero más lejos <b>sin dejar de ser cuerpo a cuerpo</b> (sigue sumando el Dmg) — una lanza o un látigo suelen dar +1.${p && p.rango !== undefined ? ` Hoy el Rango ${e(q.de)} es ${f(n(p.rango))}.` : ''}`);
      }
    }

    if(paso.id === 'dano'){
      titulo('¿Cuánto pesa y cuánto daño hace?', q.ctx === 'creep'
        ? 'El <b>Peso</b> es la cantidad de dados de daño. Los creeps no llevan cuenta de carga, así que para el creep solo decide los dados.'
        : 'El <b>Peso</b> es a la vez la cantidad de dados de daño y lo que carga: un arma pesada pega más fuerte, pero ocupa más de la Carga máxima mientras esté equipada.');
      h += `<div class="aa-fila">
        ${campo('Peso (= dados)', num('peso', d.peso, 'step="1" min="1"'))}
        ${campo('Daño fijo', num('danoFijo', d.danoFijo, 'step="1"'))}
        ${campo('Daño amplificado', num('danoAmplificado', d.danoAmplificado, 'step="1" min="0"'))}
      </div>`;
      h += efecto(`<span id="aa-dano">${danoHtml()}</span>`);
      h += `<div class="aa-nota"><b>Daño fijo</b>: se suma siempre al resultado de los dados. <b>Daño amplificado</b>: dados de más que no pesan (un arma liviana que pega como una pesada).</div>`;
      // Mecánicas de firma (2026-10-03): lo que el arma cambia en cómo se ataca.
      const chk = (k, txt) => `<label style="display:flex;gap:6px;align-items:center;font-size:12.5px"><input type="checkbox" data-aa-firma="${k}" ${d[k] ? 'checked' : ''} style="width:auto"> ${txt}</label>`;
      h += `<div class="aa-campo"><label>Mecánicas de firma (opcional)</label>
        ${chk('sinParry', 'No se puede parrear (el defensor solo puede esquivar)')}
        ${chk('oporGratis', 'El ataque de oportunidad con esta arma no cuesta No2')}
        <div class="aa-fila">${campo('Primer ataque del turno: No2 de menos', `<input data-aa-c="ahorroNitros" type="number" step="1" min="0" value="${n(d.ahorroNitros) || 0}" style="max-width:110px">`)}
        ${campo('d20 de más en el crítico', `<input data-aa-c="critD20" type="number" step="1" min="0" value="${n(d.critD20) || 0}" style="max-width:110px">`)}</div></div>`;
      h += `<div class="aa-fila">${campo('Ignora Resistencia a crítico', `<input data-aa-c="ignoraResistCrit" type="number" step="1" min="0" value="${n(d.ignoraResistCrit) || 0}" style="max-width:110px">`,
        'Puntos de Resistencia a crítico del defensor que este arma no cuenta al calcular el crítico (el duelo los resta solo). Típico de estiletes y estoques, desde Raro.')}</div>`;
      if(!d.armaDeRango){   // por la espalda (2026-10-03): solo si quien ataca está en sigilo y en el punto ciego del defensor; el mapa lo suma solo
        const es = d.espalda || {};
        const ne = k => `<input data-aa-esp="${k}" type="number" step="1" min="0" value="${n(es[k]) || 0}" style="max-width:110px">`;
        h += `<div class="aa-campo"><label>🗡 Por la espalda (opcional)</label><div class="aa-fila">${campo('+ PdG', ne('pdg'))}${campo('+ Daño', ne('fijo'))}${campo('+ Crítico potente', ne('critpot'))}</div></div>`;
        h += `<div class="aa-nota">Cuenta solo si quien ataca está <b>en sigilo</b> y pegado al defensor <b>por atrás</b> (el casillero justo de atrás, su punto ciego): si lo ve, se da vuelta. El mapa lo suma solo. Típico de dagas y estiletes.</div>`;
      }
      if(q.ctx !== 'creep') h += efecto(`<span id="aa-carga">${cargaHtml()}</span>`);
      h += durCampo();
    }

    if(paso.id === 'hechizo'){
      const es = d.especial;
      titulo('¿Cuánto cuesta y cuánto daño hace?', 'Usar un arma especial cuesta <b>No2</b> (el primer uso del turno; sube con cada uso más) y <b>SP</b> (sin SP alcanza, se paga con No2). El daño se tira al pegar; puede sumar el <b>Ef.Esp</b> de quien la usa.');
      const ne = (k, v) => `<input data-aa-esp1="${k}" type="number" step="1" min="0" value="${e(v)}" style="max-width:110px">`;
      h += `<div class="aa-fila">${campo('SP', ne('sp', Math.round(n(es.sp))))}${campo('No2 (primer uso)', ne('no2', Math.round(n(es.no2 ?? 1))))}${campo('+ No2 por uso más', ne('sube', Math.round(n(es.sube ?? 1))))}</div>`;
      h += efecto(`<span id="aa-espcosto">${espCostoHtml(es)}</span>`);
      h += campo('Daño (fórmula; vacío = no hace daño)', `<input data-aa-esp1="dano" value="${e(es.dano || '')}" placeholder="ej. 1d6" style="max-width:160px">`,
        'El tipo (arcano, fuego, hielo…) y a quién le pega se eligen en el paso siguiente, «Qué hace ✨».');
      const suma = es.sumaEspecial === true ? 'si' : n(es.sumaEspecial) === 0.5 ? 'mitad' : 'no';
      h += campo('¿Suma el Ef.Esp de quien la usa?', `<div class="aa-opciones">${op('sumaesp', 'no', suma === 'no', 'No')}${op('sumaesp', 'si', suma === 'si', 'Sí, entero')}${op('sumaesp', 'mitad', suma === 'mitad', 'La mitad')}</div>`);
      h += campo('Peso', num('peso', d.peso, 'step="1" min="1" style="max-width:120px"'), 'Una varita pesa 1; un báculo, 2.');
      if(q.ctx !== 'creep') h += efecto(`<span id="aa-carga">${cargaHtml()}</span>`);
      h += durCampo();
    }

    if(paso.id === 'ejecucion'){
      const es = d.especial, du = es.duelo, t = es.trampaColocar, pr = es.estadoPropio;
      titulo('¿Qué hace al usarla?', 'Su <b>Ejecución ✨</b>: a quién apunta, qué tira y contra qué, el daño y los efectos (lo mismo que una habilidad automatizada). Puede además <b>colocar una trampa</b>. Lo que no se pueda automatizar va en el paso siguiente, «✋ A mano».');
      const hayEj = typeof AsistenteDueloHab !== 'undefined';
      const conservado = du && ['cadena', 'reparte', 'zonaQueda', 'atrae', 'menosDistancia', 'critTipo', 'conVista', 'niebla'].some(k => du[k] !== undefined);
      h += `<div class="aa-campo"><label>Ejecución ✨</label>${du ? efecto(ejecucionLineas(du).map(e).join('<br>')) : '<div class="aa-nota" style="margin:0 0 8px">Sin Ejecución: no apunta a nadie.</div>'}
        <div class="aa-opciones">${hayEj ? `<button type="button" class="aa-op" data-aa-ejec="1">${du ? '✨ Ajustar la Ejecución' : '✨ Armar la Ejecución'}</button>` : ''}${du ? '<button type="button" class="aa-op" data-aa-ejecrm="1">Quitar</button>' : ''}</div>
        ${hayEj ? '' : '<div class="aa-nota">La Ejecución se arma desde la ficha o GM Tools (esta pantalla no tiene ese asistente).</div>'}
        ${conservado ? '<div class="aa-nota">«Salta», «misiles», «deja una zona», «atrae», «−1 por casillero», «critica como», la luz y la niebla todavía no se editan en la Ejecución: al ajustarla se conservan tal cual.</div>' : ''}</div>`;
      const hayTr = typeof ElegirTrampa !== 'undefined' || typeof AsistenteTrampa !== 'undefined';
      h += `<div class="aa-campo"><label>🪤 Trampa</label>${t ? efecto(e(trampaTxt(t)) + (t.pilar ? '<br>Levanta pilares sólidos (uno por clic).' : '') + (t.portal ? `<br>Portal: marcás también el destino (a ${e(t.portal.rango || '?')} casillas como mucho).` : '')) : '<div class="aa-nota" style="margin:0 0 8px">No coloca ninguna trampa.</div>'}
        <div class="aa-opciones">${hayTr ? `<button type="button" class="aa-op" data-aa-trampa="1">${t ? '🪄 Ajustar la trampa' : '🪤 Coloca una trampa'}</button>` : ''}${t ? '<button type="button" class="aa-op" data-aa-tramparm="1">Quitar</button>' : ''}</div></div>`;
      if(pr && pr.nombre) h += `<div class="aa-campo"><label>Se pone quien la usa</label>${efecto(`<b>${e(pr.nombre)}</b>${pr.turnos ? ` ${e(pr.turnos)} turno(s)` : ''}${pr.detalle ? ` — ${e(pr.detalle)}` : ''}`)}<div class="aa-opciones"><button type="button" class="aa-op" data-aa-propiorm="1">Quitar</button></div></div>`;
      if(!du && !t) h += `<div class="aa-nota">Sin Ejecución ni trampa, al usarla solo cobra y se anuncia: contá qué hace en «✋ A mano».</div>`;
    }

    if(paso.id === 'amano'){
      const am = d.especial.aMano || {};
      titulo('¿Algo se resuelve a mano?', 'Si una parte es demasiado compleja para automatizarla, contala acá: al usar el arma, <b>el texto va a la Mesa</b> («✋ A mano: …») y, si ponés una tirada, <b>se tira sola</b> con ese texto, para que la mesa lo resuelva con el número a la vista. Si todo está automatizado, seguí.');
      h += campo('Qué hay que resolver a mano', `<textarea data-aa-amano="texto" rows="3" placeholder="ej. Si el objetivo está mojado, el daño se duplica.">${e(am.texto || '')}</textarea>`);
      h += `<div class="aa-fila">${campo('Tirada (opcional)', `<input data-aa-amano="tirada" value="${e(am.tirada || '')}" placeholder="ej. 1d6" style="max-width:140px">`)}${campo('Nombre de la tirada', `<input data-aa-amano="etiqueta" value="${e(am.etiqueta || '')}" placeholder="ej. Chispa" style="max-width:200px">`)}</div>`;
      h += efecto(`<span id="aa-amano">${amanoHtml()}</span>`);
      h += `<div class="aa-nota" id="aa-amano-ok" style="color:#d95a6e">${tiradaValida(am.tirada) ? '' : 'La tirada tiene que ser una fórmula de dados (ej. 1d6, 2d4+1).'}</div>`;
      h += `<div class="aa-nota">Dejalo también en la descripción («✋ A mano: …»), para quien mire el ítem.</div>`;
    }

    if(paso.id === 'orbe'){
      titulo('¿Qué hace el orbe?', 'Un orbe actúa <b>cada vez que se usa una varita o un báculo</b> con él en la otra mano. Los bonos que dé mientras se lleva (luz, visión…) van en el paso siguiente.');
      h += campo('🛡 Resguardo: Escudo especial', `<input data-aa-orbe1="orbeResguardo" type="number" step="1" min="0" value="${Math.round(n(d.orbeResguardo)) || 0}" style="max-width:110px">`,
        'Una vez por turno, al usar una varita: Escudo especial de este valor hasta tu próximo turno. 0 = no.');
      h += campo('🎲 Salvaje', `<select data-aa-orbe1="orbeSalvaje" style="max-width:360px"><option value="">no</option><option value="si"${d.orbeSalvaje === true ? ' selected' : ''}>salvaje: con 1 te hace 1 de daño; con 6, el efecto sale doble</option><option value="domado"${d.orbeSalvaje === 'domado' ? ' selected' : ''}>domado: con 1 no pasa nada; con 5 o 6, el efecto sale doble</option></select>`,
        'Al usar una varita se tira 1d6.');
      h += campo('🛡 Custodio: Escudo especial a un aliado', `<input data-aa-orbe1="orbeCustodio" type="number" step="1" min="0" value="${Math.round(n(d.orbeCustodio)) || 0}" style="max-width:110px">`,
        'Una vez por turno, al usar una varita: un aliado al lado tuyo recibe Escudo especial de este valor hasta su próximo turno. 0 = no.');
      h += campo('💧 Absorción: SP que devuelve', `<input data-aa-orbe1="orbeAbsorcion" type="number" step="1" min="0" value="${Math.round(n(d.orbeAbsorcion)) || 0}" style="max-width:110px">`,
        'Cuando te entra daño mágico o elemental, recuperás estos SP (una vez por turno). 0 = no.');
      h += efecto(`<span id="aa-orbe">${orbeHtml(d)}</span>`);
    }

    if(paso.id === 'defensa'){
      titulo('¿Cuánto protege?', 'La <b>Defensa</b> se resta al daño de cada golpe que se recibe (un golpe crítico la ignora). La <b>resistencia a críticos</b> protege contra los críticos de armas de cada Tipo.');
      h += campo('Defensa', `<input data-aa-mod1="def" type="number" step="1" value="${modVal(d, 'def')}" style="max-width:120px">`,
        p && p.def !== undefined ? `Hoy la Defensa ${e(q.de)} es ${f(n(p.def))}.` : '');
      h += `<div class="aa-campo"><label>Resistencia a críticos, por Tipo del arma que golpea</label>
        <div class="aa-crit">${CRIT_IDS.map(id => `<div><label>Tipo ${CRIT_TIPO[id]}</label><input data-aa-mod1="${id}" type="number" step="1" value="${modVal(d, id)}"></div>`).join('')}</div></div>`;
      const crit = CRIT_IDS.filter(id => modVal(d, id));
      h += efecto(crit.length
        ? `Protege contra los críticos de ${crit.map(id => `<b>Tipo ${CRIT_TIPO[id]}</b> (+${f(modVal(d, id))})`).join(', ')}. ${crit.length < 5 ? 'Contra los demás Tipos no ayuda.' : ''}`
        : 'Sin resistencia a críticos: si el arma que te pega saca crítico, este ítem no lo frena.');
      if(d.tipoItem === 'escudo_2m') h += efecto('Ocupa <b>las dos manos</b>: con este escudo no se puede llevar arma.');
      if(d.tipoItem === 'escudo_1m') h += efecto('Ocupa <b>una mano</b>: la otra queda para un arma.');
      if(cfg.conMano && d.tipoItem === 'escudo_1m') h += campoMano(d);
      if(/^armadura_/.test(d.tipoItem)) h += `<div class="aa-nota">Una armadura blanda y una rígida se pueden llevar a la vez; del resto de las piezas, una de cada una.</div>`;
    }

    if(paso.id === 'bonos'){
      titulo('¿Mejora algún stat mientras se lleva?', `Cada bono suma (o resta, con negativo) a ese stat mientras esté equipado. Si no tiene ninguno, seguí.`);
      const aparte = g === 'arma' ? ['rng'] : g === 'defensa' ? ['def', ...CRIT_IDS] : [];
      const ids = new Set((cfg.stats || []).map(s => s.id));
      const opciones = sel => (cfg.stats || []).map(s => `<option value="${e(s.id)}" ${sel === s.id ? 'selected' : ''}>${e(s.label)}</option>`).join('');
      const rapidos = (RAPIDOS[g] || []).filter(([id]) => ids.has(id) && (id !== 'capcinturon' || d.tipoItem === 'cinturon') && (id !== 'capmochila' || d.tipoItem === 'mochila'));
      h += `<div class="aa-campo"><label>Bonos</label>
        ${d.mods.map((m, i) => aparte.includes(m.stat) ? '' : `<div class="aa-mod">
          <select data-aa-modstat="${i}"><option value="">— elegir stat —</option>${opciones(m.stat)}</select>
          <input data-aa-modval="${i}" type="number" step="any" value="${e(m.val)}">
          <button type="button" class="aa-x" data-aa-modrm="${i}">×</button>
        </div>`).join('')}
        <div class="aa-opciones">${rapidos.map(([id, t]) => `<button type="button" class="aa-op" data-aa-modadd="${id}">+ ${t}</button>`).join('')}
          <button type="button" class="aa-op" data-aa-modadd="">+ Otro stat</button></div>
      </div>`;
      const vistos = [...new Set(d.mods.map(m => m.stat).filter(s => s && !aparte.includes(s)))];
      const lineas = vistos.map(s => `<b>${e(((cfg.stats || []).find(x => x.id === s) || {}).label || s)} ${modVal(d, s) > 0 ? '+' : ''}${f(modVal(d, s))}</b>${EXPLICA_BONO[s] ? `: ${EXPLICA_BONO[s]}` : ''}`);
      if(g === 'arma' && vistos.includes('pdg') && q.ctx !== 'creep') lineas.push('El PdG de un arma solo cuenta cuando se ataca con ella (no se suma a la otra mano).');
      h += efecto(lineas.length ? lineas.join('<br>') : `Sin bonos: ${g === 'arma' ? 'el arma aporta solo su daño y sus efectos' : 'no cambia ningún stat'}.`);
      if(q.ctx === 'creep' && g !== 'arma') h += `<div class="aa-nota">En un creep, SP, Bonos y Res. mental no tienen dónde sumarse: quedan escritos en el ítem.</div>`;
    }

    if(paso.id === 'golpe'){
      titulo('¿Hace algo cuando pega?', 'Efectos que se aplican sobre quien recibe el golpe: Envenenar, Rompe armadura, Sangrado, fuego extra… Al tirar el Daño con esta arma, cada efecto aparece <b>resaltado en la Mesa</b> para no olvidarlo, y si depende de la suerte se abre un pop-up para tirar el dado. Se aplican a mano sobre el objetivo.');
      const eg = EG();
      h += (d.efectosGolpe.map((ef, i) => {
        const x = eg ? eg.normalizar(ef) : ef;
        const probSel = `${x.caras}/${x.exitos}`;
        const probs = eg ? eg.PROBABILIDADES : [{caras: 1, exitos: 1, texto: 'Siempre'}];
        const conocida = probs.some(pp => `${pp.caras}/${pp.exitos}` === probSel);
        return `<div class="aa-golpe">
          <input class="aa-ancho" data-aa-golpe="${i}" data-campo="nombre" value="${e(ef.nombre || '')}" placeholder="ej. Envenenar">
          <select data-aa-golpe="${i}" data-campo="prob">
            ${probs.map(pp => `<option value="${pp.caras}/${pp.exitos}" ${`${pp.caras}/${pp.exitos}` === probSel ? 'selected' : ''}>${e(pp.texto)}${pp.caras > 1 ? ` (1d${pp.caras})` : ''}</option>`).join('')}
            ${conocida ? '' : `<option value="${probSel}" selected>${x.exitos} en 1d${x.caras}</option>`}
          </select>
          <input data-aa-golpe="${i}" data-campo="dado" value="${e(ef.dado || '')}" placeholder="tirada extra: ej. 1d6">
          <input data-aa-golpe="${i}" data-campo="stacks" type="number" min="0" step="1" value="${e(ef.stacks || '')}" placeholder="stacks" title="Stacks (Veneno, Armadura rota…); vacío = los del estado" style="max-width:80px">
          <input data-aa-golpe="${i}" data-campo="turnos" type="number" min="0" step="1" value="${e(ef.turnos || '')}" placeholder="turnos" title="Cuántos turnos dura; vacío = lo que dure el estado" style="max-width:80px">
          <button type="button" class="aa-x" data-aa-golperm="${i}">×</button>
          <input class="aa-ancho" data-aa-golpe="${i}" data-campo="detalle" value="${e(ef.detalle || '')}" placeholder="qué hace (opcional): ej. Veneno de 4 stacks">
          ${x.caras > 1 && !ef.soloCritico ? `<label class="aa-ancho" style="display:flex;gap:6px;align-items:center;font-size:12.5px"><input type="checkbox" data-aa-golpe="${i}" data-campo="seguroCritico" ${ef.seguroCritico ? 'checked' : ''} style="width:auto"> Si el golpe es crítico, entra seguro (sin tirar)</label>` : ''}
          <label class="aa-ancho" style="display:flex;gap:6px;align-items:center;font-size:12.5px"><input type="checkbox" data-aa-golpe="${i}" data-campo="soloCritico" ${ef.soloCritico ? 'checked' : ''} style="width:auto"> ⚡ Solo si el golpe es crítico (Critical Matters)</label>
          ${ef.dado ? `<label class="aa-ancho" style="display:flex;gap:6px;align-items:center;font-size:12.5px"><input type="checkbox" data-aa-golpe="${i}" data-campo="danoMagico" ${ef.danoMagico ? 'checked' : ''} style="width:auto"> La tirada extra es daño mágico (ignora la Defensa, resta la Defensa especial y no se multiplica con el crítico)</label>` : ''}
          ${/^drena(r)?\s+vida$/i.test(String(ef.nombre || '').trim()) ? `<label class="aa-ancho" style="display:flex;gap:6px;align-items:center;font-size:12.5px">Drena el <input data-aa-golpe="${i}" data-campo="drenaPct" type="number" min="1" max="100" step="5" value="${e(ef.drenaPct || 50)}" style="max-width:70px"> % de la vida que le saca de verdad (lo que frena la armadura no cuenta)</label>` : ''}
          <div class="aa-regla">${eg && x.nombre ? e(eg.reglaTxt(x)) + (x.seguroCritico && x.caras > 1 ? ' Con un crítico, entra seguro.' : '') + (x.dado ? ` Si entra, se tira además ${e(x.dado)}.` : '') : ''}</div>
        </div>`;
      }).join('')) + `<div class="aa-opciones">
        ${['Envenenar', 'Sangrado', 'Lisiado', 'Rengo', 'Drena vida', 'Rompe armadura'].map(t => `<button type="button" class="aa-op" data-aa-golpeadd="${t}">+ ${t}</button>`).join('')}
        <button type="button" class="aa-op" data-aa-golpeadd="">+ Otro efecto</button></div>`;
      h += efecto(d.efectosGolpe.length && eg
        ? `Al tirar el Daño: ${e(eg.resumenLista(d.efectosGolpe)) || '(poné el nombre de cada efecto)'}. ${d.efectosGolpe.some(x => !eg.siempre(eg.normalizar(x))) ? 'Los que tienen porcentaje abren el pop-up para tirar: 50% es una moneda (2 = éxito), 25% un d4 (4 = éxito), y así.' : 'Salen como recordatorio en la Mesa, sin tirar.'}`
        : 'Sin efectos al golpear: al tirar el Daño no aparece ningún recordatorio.');
      h += `<div class="aa-nota">"Tirada extra" es para efectos que suman dados cuando entran (ej. 1d6 de fuego). Dejala vacía si no hace falta.</div>`;
    }

    if(paso.id === 'equipar'){
      titulo('¿Le pone un estado a quien lo lleva?', 'Un estado alterado que se activa solo al equiparlo y se va al sacárselo (ej. una espada que regenera 2 HP por turno mientras se lleva). Si no tiene, seguí.');
      if(st.estadoAbierto){
        h += campo('Nombre del estado', input('equipoEstadoNombre', d.equipoEstadoNombre, 'placeholder="ej. Regeneración"'));
        h += `<div class="aa-fila">${campo('HP por turno (mientras esté puesto)', num('equipoEstadoHpTurno', d.equipoEstadoHpTurno, 'step="any"'))}</div>`;
        h += campo('Qué hace el estado', `<textarea data-aa-c="equipoEstadoDetalle" rows="2" placeholder="Si lo dejás vacío se usa la descripción del ítem.">${e(d.equipoEstadoDetalle)}</textarea>`);
        if(cfg.conPresetEstado){
          h += campo('Preset que hereda (opcional)', input('equipoEstadoPreset', d.equipoEstadoPreset, 'placeholder="ej. Afortunado, Sangre pura…"'),
            'Si coincide EXACTO con un preset de Estados alterados de la ficha, hereda su mecánica real. Si no, el estado aparece igual pero como recordatorio.');
        }
        h += `<button type="button" class="aa-op" data-aa-estado="0">Quitar estado</button>`;
        h += efecto('<b>Es automático</b>: se activa al ponérselo y se va al sacárselo.');
      }else{
        h += `<button type="button" class="aa-op" data-aa-estado="1">+ Estado alterado al equipar</button>`;
      }
    }

    if(paso.id === 'lugar'){
      titulo(cfg.conPrecio ? '¿Cuánto vale y cuánto pesa?' : '¿Cuánto pesa y dónde va?', q.ctx === 'creep'
        ? 'A un creep el peso y el precio no le cambian nada: solo importan si lo publicás en el catálogo.'
        : 'Equipado, el ítem pesa en la carga; guardado en la mochila, ocupa ranuras en vez de peso.');
      if(g !== 'arma'){
        h += campo('Peso', num('peso', d.peso, 'step="any" min="0" style="max-width:120px"'));
        if(q.ctx !== 'creep') h += efecto(`<span id="aa-carga">${cargaHtml()}</span>`);
        if(DURABLE(d)) h += durCampo();
      }
      if(cfg.conPrecio){
        h += campo('Precio de compra (DDE)', num('precioCompra', d.precioCompra, 'step="1" min="0" style="max-width:140px"'));
        h += efecto(`<span id="aa-precio">${precioHtml()}</span>`);
      }
      if(cfg.conLugar){
        h += campo('¿Dónde lo tenés?', `<div class="aa-opciones">${op('equipado', '1', !!d.equipado, 'Equipado')}${op('equipado', '0', !d.equipado, 'En la mochila')}</div>`);
        h += efecto(d.equipado
          ? `<b>Equipado</b>: sus bonos cuentan${g === 'arma' ? ', aparece en la Botonera para atacar' : ''} y pesa en tu carga.`
          : '<b>En la mochila</b>: no suma nada hasta equiparlo, pero ocupa ranuras de la mochila en vez de peso.');
      }
      if(cfg.conRanuras || (cfg.conLugar && !d.equipado)){
        h += campo('Ranuras que ocupa en la mochila', num('ranuras', d.ranuras, 'step="1" min="1" style="max-width:120px"'),
          cfg.conLugar ? '' : 'Lo que ocupa cuando el jugador lo guarda en vez de tenerlo equipado.');
      }
    }

    if(paso.id === 'listo'){
      titulo('Revisá cómo quedó', 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardalo.');
      const fila = (a, b) => `<div class="aa-resumen-fila"><span>${a}</span><b>${b}</b></div>`;
      const nombreStat = id => ((cfg.stats || []).find(s => s.id === id) || {}).label || id;
      const aparte = g === 'arma' ? ['rng'] : g === 'defensa' ? ['def', ...CRIT_IDS] : [];
      const bonos = d.mods.filter(m => m.stat && n(m.val) && !aparte.includes(m.stat)).map(m => `${nombreStat(m.stat)} ${n(m.val) > 0 ? '+' : ''}${f(n(m.val))}`).join(', ');
      const dest = cfg.destinos ? (cfg.destinos.opciones.find(o => String(o.v) === String(st.destino)) || {}).l : '';
      const eg = EG();
      h += `<div class="aa-resumen">
        <div class="aa-resumen-nombre">${e(d.nombre || '(sin nombre)')}</div>
        <div class="aa-resumen-desc">${d.detalle ? e(d.detalle) : '<span style="color:var(--muted,#9A867E)">(sin descripción)</span>'}</div>
        ${fila('Tipo de ítem', e(labelDe(d.tipoItem)))}
        ${cfg.destinos ? fila(cfg.destinos.label, e(dest || '—')) : ''}
        ${cfg.tiers ? fila('Tier', e(d.tier)) : ''}
        ${esEspecial(d) ? fila('Clase', '✨ arma especial') + fila('Cuesta', e(costoEspTxt(d.especial))) + fila('Daño', e(d.especial.dano ? d.especial.dano + (d.especial.sumaEspecial === true ? ' + Ef.Esp' : n(d.especial.sumaEspecial) === 0.5 ? ' + la mitad del Ef.Esp' : '') : 'no hace'))
          + fila('Qué hace ✨', d.especial.duelo ? e(ejecucionLineas(d.especial.duelo).join(' · ')) : 'sin Ejecución')
          + (d.especial.trampaColocar ? fila('Trampa', e(trampaTxt(d.especial.trampaColocar))) : '')
          + (aManoTxt(d.especial) ? fila('✋ A mano', e(aManoTxt(d.especial))) : '') : ''}
        ${esOrbe(d) ? fila('Clase', '🔮 orbe') + fila('Al usar una varita', e([n(d.orbeResguardo) ? `Escudo especial ${Math.round(n(d.orbeResguardo))} (1 vez por turno)` : '', d.orbeSalvaje ? (d.orbeSalvaje === 'domado' ? '1d6 domado' : '1d6 salvaje') : '', n(d.orbeCustodio) ? `Escudo especial ${Math.round(n(d.orbeCustodio))} a un aliado al lado` : ''].filter(Boolean).join(' · ') || 'nada'))
          + (n(d.orbeAbsorcion) ? fila('Absorción', e(`+${Math.round(n(d.orbeAbsorcion))} SP al recibir daño mágico o elemental (1 vez por turno)`)) : '') : ''}
        ${g === 'arma' && !esEspecial(d) ? fila('Tipo', e(`Tipo ${tipo} · ${TIPOS[tipo].nombre}`)) + fila('Distancia', d.armaDeRango ? 'a distancia (no suma Dmg)' : 'cuerpo a cuerpo')
          + fila('Daño', e(danoTxt(d))) + fila('Atacar', `${primer(tipo)} No2 el primero, ${tipo} los siguientes`)
          + (modVal(d, 'rng') ? fila(d.armaDeRango ? 'Rango' : 'Alcance', `+${f(modVal(d, 'rng'))}`) : '')
          + (n(d.ignoraResistCrit) > 0 ? fila('Ignora', `${f(n(d.ignoraResistCrit))} de Resistencia a crítico`) : '')
          + ([d.sinParry ? 'no se puede parrear' : '', d.oporGratis ? 'oportunidad sin No2' : '', n(d.ahorroNitros) ? `primer ataque −${f(n(d.ahorroNitros))} No2` : '', n(d.critD20) ? `+${f(n(d.critD20))} d20 en el crítico` : ''].filter(Boolean).length
            ? fila('Firma', e([d.sinParry ? 'no se puede parrear' : '', d.oporGratis ? 'oportunidad sin No2' : '', n(d.ahorroNitros) ? `primer ataque −${f(n(d.ahorroNitros))} No2` : '', n(d.critD20) ? `+${f(n(d.critD20))} d20 en el crítico` : ''].filter(Boolean).join(' · '))) : '')
          + (!d.armaDeRango && espaldaTxt(d.espalda) ? fila('Por la espalda', e(espaldaTxt(d.espalda) + ' (en sigilo)')) : '')
          + fila('Al golpear', e((eg && eg.resumenLista(d.efectosGolpe)) || 'nada')) : ''}
        ${g === 'defensa' && !esOrbe(d) ? fila('Defensa', f(modVal(d, 'def'))) + fila('Res. crítico', e(CRIT_IDS.filter(id => modVal(d, id)).map(id => `T${CRIT_TIPO[id]} +${f(modVal(d, id))}`).join(', ') || 'ninguna')) : ''}
        ${fila('Bonos', e(bonos || 'ninguno'))}
        ${cfg.conEstadoEquipar ? fila('Al equipar', e(String(d.equipoEstadoNombre || '').trim() || 'ningún estado')) : ''}
        ${q.ctx !== 'creep' || g !== 'arma' ? fila('Peso', f(n(d.peso))) : ''}
        ${DURABLE(d) ? fila('Durabilidad', `${f(durTotal(d))}${Math.round(n(d.durExtra)) > 0 ? ` (Resistente ×${Math.round(n(d.durExtra))})` : Math.round(n(d.durExtra)) < 0 ? ` (Frágil ×${-Math.round(n(d.durExtra))})` : ' (lo normal: 3 por punto de Peso)'}`) : ''}
        ${cfg.conPrecio ? fila('Precio', `${f(n(d.precioCompra))} DDE`) : ''}
        ${cfg.conLugar ? fila('Dónde', d.equipado ? 'equipado' : `mochila (${f(n(d.ranuras))} ranura${n(d.ranuras) === 1 ? '' : 's'})`) : cfg.conRanuras ? fila('Ranuras', f(n(d.ranuras))) : ''}
      </div>`;
      if(cfg.onFormulario) h += `<button type="button" class="aa-op" data-aa-formulario="1" style="margin-top:10px">Ver en el formulario completo</button>`;
    }
    return {h, ayuda};
  }

  const orbeHtml = d => n(d.orbeResguardo) || d.orbeSalvaje || n(d.orbeCustodio) || n(d.orbeAbsorcion) ? `⚙ Automatizado: ${[n(d.orbeResguardo) ? `Escudo especial ${Math.round(n(d.orbeResguardo))}, una vez por turno` : '', d.orbeSalvaje ? `la tirada de 1d6 y los dados del daño ×2 con ${d.orbeSalvaje === 'domado' ? 'un 5 o un 6' : 'un 6'} (el doble de un arma sin daño, a mano)` : '', n(d.orbeCustodio) ? `el Escudo especial ${Math.round(n(d.orbeCustodio))} al aliado (si hay varios al lado, se elige)` : '', n(d.orbeAbsorcion) ? `los ${Math.round(n(d.orbeAbsorcion))} SP del daño mágico o elemental` : ''].filter(Boolean).join('; ')}.` : 'Sin efecto al usar una varita: solo sus bonos (si tiene).';
  const aManoTxt = es => { const a = es && es.aMano; return a ? [String(a.texto || '').trim(), String(a.tirada || '').trim() ? `tira ${String(a.tirada).trim()}` : ''].filter(Boolean).join(' · ') : ''; };
  const tiradaValida = t => { const x = String(t || '').replace(/\s+/g, ''); return !x || (typeof parseDados === 'function' ? !!parseDados(x) : /^\d*d\d+([+-]\d+)?$/i.test(x)); };
  function amanoHtml(){
    const am = (st.d.especial && st.d.especial.aMano) || {}, txt = String(am.texto || '').trim(), tir = String(am.tirada || '').trim();
    if(!txt && !tir) return 'Nada a mano: todo lo que hace está en su Ejecución ✨ (o en su trampa).';
    return `Al usarla, la Mesa recibe ${tir ? `la tirada <b>${e(am.etiqueta || 'A mano')}: ${e(tir)}</b> con el texto` : 'el texto'} «✋ A mano: ${e(txt || '…')}».`;
  }
  // La Ejecución ✨ de un arma especial: la misma ventana que las habilidades (comun/asistente-duelo-hab.js), con el costo del arma.
  function abrirEjecucion(){
    const yo = st, es = st.d.especial;
    AsistenteDueloHab.abrir({nombre: st.d.nombre || 'Arma especial', inicial: es.duelo || null, siempreActivo: true, tieneFormula: !!String(es.dano || '').trim(),
      costoInicial: {sp: String(Math.round(n(es.sp))), nitrosCosto: Math.round(n(es.no2 ?? 1))}, elegirEstado: st.cfg.elegirEstado,
      alGuardar: r => {
        if(st !== yo) return;
        if(r){
          es.duelo = r.duelo;
          if(r.costo){ const sp = parseInt(r.costo.sp, 10); if(Number.isFinite(sp)) es.sp = Math.max(0, sp); const nn = parseInt(r.costo.nitrosCosto, 10); if(Number.isFinite(nn)) es.no2 = Math.max(0, nn); }
        }else delete es.duelo;
        dibujar();
      }});
  }
  function abrirTrampa(){
    const yo = st, es = st.d.especial, vieja = es.trampaColocar || null;
    const listo = t => {
      if(st !== yo || !t) return;
      const nueva = structuredClone(t);
      if(vieja) TRAMPA_CONSERVA.forEach(k => { if(vieja[k] !== undefined && nueva[k] === undefined) nueva[k] = structuredClone(vieja[k]); });
      es.trampaColocar = nueva;
      dibujar();
    };
    if(typeof ElegirTrampa !== 'undefined') ElegirTrampa.abrir({inicial: vieja, alTerminar: listo, alCancelar: () => {}, z: 99400});
    else AsistenteTrampa.abrir({contexto: 'habilidad', inicial: vieja ? AsistenteTrampa.inicialDe(vieja) : null, alTerminar: r => listo(AsistenteTrampa.aTrampa(r)), alCancelar: () => {}});
  }

  function campoMano(d){
    return campo('Mano', `<select data-aa-c="manoPreferida">
        <option value="" ${!d.manoPreferida ? 'selected' : ''}>Automática</option>
        <option value="1" ${String(d.manoPreferida) === '1' ? 'selected' : ''}>Mano 1</option>
        <option value="2" ${String(d.manoPreferida) === '2' ? 'selected' : ''}>Mano 2</option>
      </select>`, 'Solo ordena en qué mano se muestra cuando llevás dos cosas.');
  }

  function explicaCategoria(id, q){
    const g = grupoDe(id);
    if(g === 'arma' && st && st.d.especial) return `<b>Arma especial</b>: un hechizo equipable (varita, báculo). ${id === 'arma_2m' ? 'Ocupa las dos manos.' : 'Ocupa una mano; en la otra puede ir un orbe.'}`;
    if(g === 'arma') return `<b>Arma</b>: tiene Tipo, daño y ${q.ctx === 'creep' ? 'reemplaza el arma del creep' : 'aparece en la Botonera para atacar'}. ${id === 'arma_2m' ? 'Ocupa las dos manos.' : 'Ocupa una mano.'}`;
    if(g === 'defensa') return `<b>Defensa</b>: da Defensa y resistencia a críticos. ${/^escudo/.test(id) ? `Va en ${id === 'escudo_2m' ? 'las dos manos' : 'una mano'}.` : `Ocupa el lugar de ${labelDe(id).toLowerCase()}.`}`;
    if(id === 'cinturon') return '<b>Cinturón</b>: puede dar lugares extra para consumibles, además de bonos.';
    if(id === 'mochila') return '<b>Mochila</b>: da lugares extra en la mochila (solo una puesta a la vez).';
    if(id === 'anillos') return '<b>Anillo</b>: se pueden llevar dos. Da bonos y estados.';
    return '<b>Otro</b>: cualquier cosa que no entra en las demás. Si se equipa, sus bonos cuentan.';
  }

  function danoHtml(){
    const d = st.d, p = portador(), q = quien();
    const dados = Math.max(1, n(d.peso) || 1) + Math.max(0, n(d.danoAmplificado));
    const caras = n(d.tipoDado) || 8, fijo = n(d.danoFijo);
    const min = dados + fijo, max = dados * caras + fijo;
    const prom = Math.round((dados * (caras + 1) / 2 + fijo) * 10) / 10;
    let t = `Tira <b>${e(danoTxt(d))}</b>: entre ${f(min)} y ${f(max)}, ${f(prom)} en promedio.`;
    if(d.armaDeRango) t += ' Es de rango: no suma Dmg.';
    else if(p) t += ` Con el Dmg ${e(q.de)} (${f(n(p.dmg))}): entre ${f(min + n(p.dmg))} y ${f(max + n(p.dmg))}.`;
    else t += ' Al tirar se le suma el Dmg de quien la use.';
    return t;
  }

  function cargaHtml(){
    const d = st.d, p = portador();
    let t = `Equipado, suma <b>${f(n(d.peso))}</b> a la carga.`;
    if(p && p.cargaMax !== undefined){
      const con = n(p.cargaUsada) + n(d.peso);
      t += ` Quedarías en <b>${f(con)} de ${f(n(p.cargaMax))}</b> (Carga máx.)${con > n(p.cargaMax) ? ' — <b>te pasás</b>: lo que sobra cuenta como sobrecarga.' : '.'}`;
    }
    return t + ' En la mochila no pesa: ocupa ranuras.';
  }

  /* Durabilidad: variable de diseño del ítem (2026-09-30, dueño). Puntos por cada punto de Peso: 3 lo normal, más = mejor
     calidad, menos = frágil; mínimo 3 en total. La regla es la del motor (comun/combatiente.js). */
  const DURABLE = d => /^(arma_|escudo_|armadura_)/.test(String(d.tipoItem || '')) || ['cabeza', 'manos', 'piernas', 'pies'].includes(d.tipoItem);
  // Resistente / Frágil (dueño, 2026-10-04): un número que suma o resta durabilidad total (no por Peso). Con Frágil, nunca menos de 1.
  const durBase = d => typeof Combatiente !== 'undefined' ? Combatiente.durBase(d) : Math.max(3, 3 * Math.max(0, Math.round(n(d.peso))));
  const durTotal = d => typeof Combatiente !== 'undefined' ? Combatiente.durMax(d) : Math.max(1, durBase(d) + Math.round(n(d.durExtra)));
  function durHtml(){
    const d = st.d, x = Math.round(n(d.durExtra)), base = durBase(d), tot = durTotal(d);
    const calidad = x > 0 ? ` + <b>Resistente ×${x}</b>` : x < 0 ? ` − <b>Frágil ×${-x}</b>` : ' (lo normal)';
    return `Durabilidad <b>${f(tot)}</b>: ${f(base)} por su Peso (3 por punto, mínimo 3)${calidad}${x < 0 && base + x < 1 ? ' (nunca menos de 1)' : ''}. Cada Bloqueo perdido (o una pieza de armadura dañada) le saca 1 punto; en 0 se rompe y no da efectos hasta repararlo.`;
  }
  function durCampo(){
    const d = st.d;
    return campo('Durabilidad: Resistente (+) o Frágil (−)', num('durExtra', Math.round(n(d.durExtra)), 'step="1" style="max-width:120px"'),
      '0 es lo normal. Resistente ×N suma N a la durabilidad total; Frágil ×N la baja N (puede quedar por debajo de 3, nunca menos de 1).' + (quien().ctx === 'creep' ? ' (Los creeps no gastan durabilidad: vale si se publica en el catálogo o se suelta como botín.)' : ''))
      + efecto(`<span id="aa-dur">${durHtml()}</span>`);
  }

  function precioHtml(){
    const d = st.d;
    return `Se compra a <b>${f(n(d.precioCompra))}</b> DDE y se vende a la mitad: <b>${f(n(d.precioCompra) / 2)}</b>.${st.cfg.precioTxt ? ' ' + st.cfg.precioTxt(d) : ''}`;
  }

  function alClic(ev){
    if(!st) return;
    const b = ev.target.closest('button');
    if(!b) return;
    const d = st.d, ds = b.dataset;
    if(ds.aaFormulario){ const cb = st.cfg.onFormulario, copia = limpio(); cerrar(); cb(copia); return; }
    if(ds.aaCat){
      if(ds.aaCat === 'consumibles'){
        const cb = st.cfg.onConsumible, copia = limpio();
        if(!cb){ avisar('Los consumibles se crean desde el formulario común'); return; }
        copia.tipoItem = 'consumibles';
        cerrar();
        cb(copia);
        return;
      }
      d.tipoItem = ds.aaCat;
      if(grupoDe(d.tipoItem) === 'arma' && !n(d.peso)) d.peso = 1;
    }
    else if(ds.aaClase){ if(ds.aaClase === 'especial'){ d.especial = d.especial || ESPECIAL_NUEVA(); d.armaDeRango = false; } else delete d.especial; }
    else if(ds.aaOrbe !== undefined){ if(ds.aaOrbe === '1') d.orbe = true; else { delete d.orbe; delete d.orbeResguardo; delete d.orbeSalvaje; delete d.orbeCustodio; delete d.orbeAbsorcion; } }
    else if(ds.aaSumaesp && d.especial){ if(ds.aaSumaesp === 'si') d.especial.sumaEspecial = true; else if(ds.aaSumaesp === 'mitad') d.especial.sumaEspecial = 0.5; else delete d.especial.sumaEspecial; }
    else if(ds.aaEjec && d.especial){ abrirEjecucion(); return; }
    else if(ds.aaEjecrm && d.especial) delete d.especial.duelo;
    else if(ds.aaTrampa && d.especial){ abrirTrampa(); return; }
    else if(ds.aaTramparm && d.especial) delete d.especial.trampaColocar;
    else if(ds.aaPropiorm && d.especial) delete d.especial.estadoPropio;
    else if(ds.aaTipo) d.tipoDado = n(ds.aaTipo);
    else if(ds.aaManos) d.tipoItem = ds.aaManos;
    else if(ds.aaRango) d.armaDeRango = ds.aaRango === '1';
    else if(ds.aaEquipado) d.equipado = ds.aaEquipado === '1';
    else if(ds.aaModadd !== undefined) d.mods.push({stat: ds.aaModadd, val: ds.aaModadd ? 1 : 0});
    else if(ds.aaModrm !== undefined) d.mods.splice(n(ds.aaModrm), 1);
    else if(ds.aaGolpeadd !== undefined) d.efectosGolpe.push({nombre: ds.aaGolpeadd, caras: ds.aaGolpeadd ? 2 : 1, exitos: 1, dado: '', detalle: ''});
    else if(ds.aaGolperm !== undefined) d.efectosGolpe.splice(n(ds.aaGolperm), 1);
    else if(ds.aaEstado !== undefined){
      st.estadoAbierto = ds.aaEstado === '1';
      if(!st.estadoAbierto){ d.equipoEstadoNombre = ''; d.equipoEstadoHpTurno = 0; d.equipoEstadoDetalle = ''; d.equipoEstadoPreset = ''; }
    }
    else if(ds.aaQuitarimg) d.imagen = '';
    else return;
    dibujar();
  }

  // «+2 PdG, +1 de daño» (el bono por la espalda de un arma).
  const espaldaTxt = es => es ? [n(es.pdg) ? `+${f(n(es.pdg))} PdG` : '', n(es.fijo) ? `+${f(n(es.fijo))} de daño` : '', n(es.critpot) ? `+${f(n(es.critpot))} Crítico potente` : ''].filter(Boolean).join(', ') : '';
  const NUMERICOS = ['peso', 'danoFijo', 'danoAmplificado', 'ignoraResistCrit', 'ahorroNitros', 'critD20', 'precioCompra', 'ranuras', 'equipoEstadoHpTurno', 'durExtra', 'durPorPeso'];
  function alEscribir(ev){
    if(!st) return;
    const t = ev.target, d = st.d;
    // Los textos con cuentas se actualizan en su lugar (redibujar al
    // confirmar un número se comería el clic en "Siguiente").
    const poner = (id, html) => { const el = enVentana('#' + id); if(el) el.innerHTML = html; };
    if(t.dataset.aaC){
      const c = t.dataset.aaC;
      d[c] = NUMERICOS.includes(c) ? n(t.value) : t.value;
      if(['peso', 'danoFijo', 'danoAmplificado'].includes(c)) poner('aa-dano', danoHtml());
      if(c === 'peso') poner('aa-carga', cargaHtml());
      if(c === 'peso' || c === 'durExtra') poner('aa-dur', durHtml());
      if(c === 'precioCompra') poner('aa-precio', precioHtml());
    }
    if(t.dataset.aaMod1) setMod(d, t.dataset.aaMod1, n(t.value));
    if(t.dataset.aaEsp1 && d.especial){
      const k = t.dataset.aaEsp1;
      d.especial[k] = k === 'dano' ? t.value : Math.max(0, Math.round(n(t.value)));
      poner('aa-espcosto', espCostoHtml(d.especial));
    }
    if(t.dataset.aaAmano && d.especial){ d.especial.aMano = {...(d.especial.aMano || {}), [t.dataset.aaAmano]: t.value}; poner('aa-amano', amanoHtml()); poner('aa-amano-ok', tiradaValida(d.especial.aMano.tirada) ? '' : 'La tirada tiene que ser una fórmula de dados (ej. 1d6, 2d4+1).'); }
    if(t.dataset.aaOrbe1){ const k = t.dataset.aaOrbe1; if(k === 'orbeSalvaje'){ if(t.value === 'domado') d.orbeSalvaje = 'domado'; else if(t.value) d.orbeSalvaje = true; else delete d.orbeSalvaje; } else d[k] = Math.max(0, Math.round(n(t.value))); poner('aa-orbe', orbeHtml(d)); }
    if(t.dataset.aaFirma){ if(t.checked) d[t.dataset.aaFirma] = true; else delete d[t.dataset.aaFirma]; }
    if(t.dataset.aaEsp) d.espalda = {...(d.espalda || {}), [t.dataset.aaEsp]: Math.max(0, Math.round(n(t.value)))};
    if(t.dataset.aaModstat !== undefined) d.mods[n(t.dataset.aaModstat)].stat = t.value;
    if(t.dataset.aaModval !== undefined) d.mods[n(t.dataset.aaModval)].val = n(t.value);
    if(t.dataset.aaGolpe !== undefined){
      const ef = d.efectosGolpe[n(t.dataset.aaGolpe)];
      if(t.dataset.campo === 'prob'){
        const [caras, exitos] = t.value.split('/').map(n);
        ef.caras = caras; ef.exitos = exitos;
      }else if(t.dataset.campo === 'seguroCritico' || t.dataset.campo === 'soloCritico' || t.dataset.campo === 'danoMagico'){
        if(t.checked) ef[t.dataset.campo] = true; else delete ef[t.dataset.campo];
      }else{
        ef[t.dataset.campo] = t.value;
      }
    }
  }

  function alCambiar(ev){
    if(!st) return;
    const t = ev.target;
    alEscribir(ev);
    if(t.dataset.aaDestino){ st.destino = t.value; dibujar(); return; }
    // La regla de cada efecto y la lista de resistencias dependen de lo elegido.
    if((t.dataset.aaGolpe !== undefined && (t.dataset.campo === 'prob' || t.dataset.campo === 'seguroCritico' || t.dataset.campo === 'soloCritico' || t.dataset.campo === 'danoMagico' || t.dataset.campo === 'nombre' || t.dataset.campo === 'dado')) || (t.dataset.aaMod1 && CRIT_IDS.includes(t.dataset.aaMod1))){
      setTimeout(() => { if(st) dibujar(); }, 0);
      return;
    }
    if(t.dataset.aaImagen && t.files && t.files[0]){
      const file = t.files[0];
      const leer = st.cfg.imagenADatos || (x => new Promise((ok, mal) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = mal; r.readAsDataURL(x); }));
      leer(file).then(url => { if(st){ st.d.imagen = url; dibujar(); } }).catch(() => avisar('No se pudo cargar esa imagen'));
    }
  }

  // Copia lista para guardar: sin bonos vacíos ni efectos sin nombre.
  function limpio(){
    const d = structuredClone(st.d);
    d.nombre = d.nombre.trim();
    d.mods = d.mods.filter(m => m.stat && n(m.val));
    const eg = EG();
    d.efectosGolpe = eg ? eg.lista(d.efectosGolpe) : d.efectosGolpe.filter(x => String(x.nombre || '').trim());
    if(esEspecial(d)){
      // ✨ Un arma especial: su hechizo, sin lo físico (Tipo, dados, Dmg, rasgos, efectos al golpear).
      const es = d.especial;
      es.sp = Math.max(0, Math.round(n(es.sp)));
      es.no2 = Math.max(0, Math.round(n(es.no2 ?? 1))); if(es.no2 === 1) delete es.no2;
      es.sube = Math.max(0, Math.round(n(es.sube ?? 1))); if(es.sube === 1) delete es.sube;
      es.dano = String(es.dano || '').replace(/\s+/g, ''); if(!es.dano) delete es.dano;
      if(es.sumaEspecial !== true && n(es.sumaEspecial) !== 0.5) delete es.sumaEspecial;
      const am = es.aMano || {}, amT = String(am.texto || '').trim(), amR = String(am.tirada || '').replace(/\s+/g, ''), amE = String(am.etiqueta || '').trim();
      if(amT || amR) es.aMano = {...(amT ? {texto: amT} : {}), ...(amR ? {tirada: amR} : {}), ...(amE ? {etiqueta: amE} : {})}; else delete es.aMano;
      d.peso = Math.max(1, n(d.peso) || 1);
      ['tipoDado', 'danoFijo', 'danoAmplificado', 'armaDeRango', 'espalda', ...(typeof Combatiente !== 'undefined' ? Combatiente.RASGOS_ARMA : ['ignoraResistCrit', 'sinParry', 'oporGratis', 'ahorroNitros', 'critD20'])].forEach(k => delete d[k]);
      if(!(d.efectosGolpe || []).length) delete d.efectosGolpe;
      d.mods = d.mods.filter(m => m.stat !== 'rng');
    }else if(grupoDe(d.tipoItem) === 'arma'){
      delete d.especial;
      d.peso = Math.max(1, n(d.peso) || 1);
      d.danoAmplificado = Math.max(0, n(d.danoAmplificado));
      const es = d.espalda || {}, eo = {};
      ['pdg', 'fijo', 'critpot'].forEach(k => { if(n(es[k]) > 0) eo[k] = Math.round(n(es[k])); });
      if(d.armaDeRango || !Object.keys(eo).length) delete d.espalda; else d.espalda = eo;
      if(n(d.ignoraResistCrit) > 0) d.ignoraResistCrit = Math.round(n(d.ignoraResistCrit)); else delete d.ignoraResistCrit;
      ['ahorroNitros', 'critD20'].forEach(k => { if(n(d[k]) > 0) d[k] = Math.round(n(d[k])); else delete d[k]; });
      ['sinParry', 'oporGratis'].forEach(k => { if(d[k]) d[k] = true; else delete d[k]; });
    }else{
      // Lo que es solo de armas no viaja en el resto.
      delete d.especial;
      if(esOrbe(d)){
        d.orbe = true;
        ['orbeResguardo', 'orbeCustodio', 'orbeAbsorcion'].forEach(k => { if(Math.round(n(d[k])) > 0) d[k] = Math.round(n(d[k])); else delete d[k]; });
        if(d.orbeSalvaje) d.orbeSalvaje = d.orbeSalvaje === 'domado' ? 'domado' : true; else delete d.orbeSalvaje;
      }
      else { delete d.orbe; delete d.orbeResguardo; delete d.orbeSalvaje; delete d.orbeCustodio; delete d.orbeAbsorcion; }
      delete d.efectosGolpe; delete d.tipoDado; delete d.danoFijo; delete d.danoAmplificado; delete d.armaDeRango; delete d.espalda; delete d.ignoraResistCrit; delete d.sinParry; delete d.oporGratis; delete d.ahorroNitros; delete d.critD20;
    }
    // Durabilidad: solo se guarda si no es la de siempre (3 por Peso) y el ítem la tiene.
    // Una pieza vieja con durPorPeso: se pasa a Resistente / Frágil conservando su durabilidad.
    if(n(d.durPorPeso) > 0 && n(d.durPorPeso) !== 3 && typeof Combatiente !== 'undefined'){ const tot = Combatiente.durMax(d); delete d.durPorPeso; d.durExtra = tot - Combatiente.durBase(d); }
    delete d.durPorPeso;
    if(!DURABLE(d) || !Math.round(n(d.durExtra))) delete d.durExtra;
    else d.durExtra = Math.round(n(d.durExtra));
    return d;
  }

  function guardar(){
    const falta = faltaAlgo();
    if(falta){ ir(0); if(st.api) st.api.aviso(falta); return false; }
    const yo = st;
    if(yo.cfg.onGuardar(limpio(), yo.destino) === false) return false;
    if(st === yo) st = null;   // la ventana se cierra sola (paso-a-paso)
  }

  if(document.body) montar(); else document.addEventListener('DOMContentLoaded', montar);

  const esCategoriaDelAsistente = id => !!grupoDe(id) && grupoDe(id) !== 'consumible';

  /* El ítem guardado = lo que había (`base`) con lo que devolvió el asistente (`d`) encima, SIN lo que el asistente sacó a propósito (2026-10-05):
     con `{...base, ...d}` a una varita le quedaba el Tipo 8 de fábrica (y con él, daño físico y Parry), y a un arma que dejó de ser especial, su
     hechizo. Todas las pantallas guardan con esto. */
  const CONTROLADOS = ['especial', 'orbe', 'orbeResguardo', 'orbeSalvaje', 'orbeCustodio', 'orbeAbsorcion', 'tipoDado', 'danoFijo', 'danoAmplificado', 'armaDeRango', 'espalda', 'efectosGolpe',
    'ignoraResistCrit', 'sinParry', 'oporGratis', 'ahorroNitros', 'critD20', 'durExtra', 'durPorPeso'];
  function fusionar(base, d){
    const o = {...(base || {}), ...(d || {})};
    CONTROLADOS.forEach(k => { if(!(k in (d || {}))) delete o[k]; });
    return o;
  }

  return {abrir, fusionar, cerrar, abierto: () => !!st, esCategoriaDelAsistente, grupoDe, CATEGORIAS, TIPOS, DADOS};
})();
