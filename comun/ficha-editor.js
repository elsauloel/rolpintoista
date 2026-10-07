/* =========================================================
   FICHA-EDITOR — el editor de la ficha (ítems, habilidades, pasivas, talentos, estados), común a la ficha y al mapa
   (hoja de ruta A6b, docs/plan-a6b-editor.md; 2026-10-02)
   Se muda por tandas, copiado tal cual de ficha-personaje/js/07 y js/10. Tanda b1: las tablas y los ayudantes puros —
   - SCHEMA / CAMPO_LABEL / CAMPO_NUM: qué campos tiene cada tipo de entrada y cómo se llaman (el formulario se arma solo con esto).
   - borrador(key, item, equipadoPreset): el borrador con todos los campos por defecto (lo que armaba openEditor).
   - getModVal / setModVal: leer o fijar un modificador del borrador.
   - itemComoEntradaDeCatalogo(draft): un ítem de un personaje convertido en entrada de catálogo (para ⬆ Subir).
   - PASOS_HAB, MODOS_HAB, habLegado(h), pasosHabilidad(draft): el paso a paso de una habilidad según cómo se ejecuta.
   Necesita ficha-calculo.js (IT2), ficha-equipo.js (CATEGORIAS) y ficha-botonera.js (modoHab).
   ========================================================= */
const FichaEditor = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const fmt = n => Number.isInteger(n) ? n : Math.round(n*100)/100;
  const uid = () => Math.random().toString(36).slice(2,9);
  const ES_ARMA = catId => FichaEquipo.CATEGORIAS.find(c=>c.id===catId)?.arma === true;

  const SCHEMA = {
    inventario: {titulo:'Ítem de inventario', campos:['nombre','imagen','tipoItem','manoPreferida','peso','ranuras','tipoDado','danoFijo','danoAmplificado','armaDeRango','precioCompra','precioVentaAuto','equipado','unidades','consumible','cargaMax','cargaActual','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
    cinturon: {titulo:'Ítem del cinturón', campos:['nombre','imagen','tipoItem','precioCompra','precioVentaAuto','unidades','consumible','cargaMax','cargaActual','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
    catalogo: {titulo:'Ítem del catálogo', campos:['nombre','imagen','tipoItem','peso','tipoDado','danoFijo','danoAmplificado','armaDeRango','precioCompra','precioVentaAuto','consumible','cargaMax','curahp','curaspPct','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:true},
    habilidades:{titulo:'Habilidad', campos:['nombre','imagen','costo','nitrosCosto','job','origen','efectoNombre','efectoTurnos','efectoHpTurno','efectoDetalle','tiradaExtra','detalle'], mods:false},
    pasivas:  {titulo:'Pasiva', campos:['nombre','imagen','job','jobCosto','compras','regenHp','origen','detalle'], mods:true},
    // El dado ya no se escribe a mano: sale del nivel (botón "+ Nivel" en la lista).
    sociales: {titulo:'Talento', campos:['nombre','imagen','detalle'], mods:false},
    efectos:  {titulo:'Estado alterado', campos:['nombre','imagen','turnos','stacks','hpturno','stacksturno','forzarNitros','escudoMagico','mitadPdgEva','armaduraRota','permanente','activo','popup','detalle'], mods:true},
  };
  const CAMPO_LABEL = {nombre:'Nombre', peso:'Peso', ranuras:'Ranuras (si no está equipado)', costo:'Costo en SP (ej. 2 SP, o X si es variable)', nitrosCosto:'Costo en Nitros', dado:'Dado', stacks:'Stacks', detalle:'Detalle',
    equipado:'Equipado', activo:'Activo', turnos:'Turnos restantes', hpturno:'HP por turno (por stack)',
    stacksturno:'Stacks por turno', permanente:'Permanente (no vence)', popup:'Pop-up al mantenimiento',
    compras:'Compras (los efectos y el costo en Job se multiplican; tope por pasiva: mitad del nivel)', regenHp:'HP que recupera en cada Mantenimiento (por compra)',
    job:'Adquirida con puntos de Job', jobCosto:'Puntos de Job que costó (si fue con Job)', origen:'Cómo se consiguió (si no fue con Job)', imagen:'Imagen',
    unidades:'Cantidad (unidades en la pila)', consumible:'Consumible', curahp:'HP al consumir (+ cura / − daña)',
    precioCompra:'Precio de compra', tipoItem:'Categoría de ítem', tipoDado:'Tipo de arma (caras del dado)', danoFijo:'Daño fijo',
    danoAmplificado:'Daño amplificado (dados extra sin sumar peso)', armaDeRango:'Arma de rango (el botón de Daño Arma no suma el stat Dmg)',
    manoPreferida:'Mano', efectoNombre:'Nombre del estado', efectoTurnos:'Turnos del estado', efectoHpTurno:'HP por turno del estado', efectoEscudo:'HP del escudo del estado', efectoStacks:'Stacks del estado', efectoDetalle:'Detalle del estado',
    curaspPct:'% de SP al consumir (0-100, redondea hacia arriba)',
    cargaMax:'Cargas por unidad (usos antes de gastar 1 de la cantidad)', cargaActual:'Cargas restantes (de la unidad actual)',
    forzarNitros:'Forzar Nitros máx. a (vacío = no forzar; el más bajo activo gana)', mitadPdgEva:'PdG y Evasión a la mitad (redondeado abajo)',
    escudoMagico:'Vida extra — vida de más que se gasta antes que la vida; es neta: lo que se gasta no vuelve (dejalo en 0 si no aplica)',
    armaduraRota:'Armadura rota: -1 Defensa por cada acumulación (stack)',
    tiradaExtra:'Tirada de efecto: fórmula de dados, botón 🎲 (opcional, ej. 2d6+3)',
    tiradaStat:'Tirada al ejecutar: stat (opcional)'};
  const CAMPO_NUM = ['curaHp','compras','regenHp','jobCosto','peso','ranuras','stacks','turnos','hpturno','stacksturno','unidades','curahp','precioCompra','danoFijo','danoAmplificado','tipoDado','nitrosCosto','hpCosto','efectoTurnos','efectoHpTurno','efectoEscudo','efectoStacks','curaspPct','cargaMax','cargaActual','forzarNitros','equipoEstadoHpTurno','escudoMagico'];

  // El borrador de una entrada: todos los campos con su valor por defecto, pisados por los de `item` (si se está editando una) —
  // lo que armaba openEditor antes de abrir la ventana.
  function borrador(item, equipadoPreset){
    const defaults = {id:uid(), nombre:'', peso:0, ranuras:1, detalle:'', mods:[],
      equipado: equipadoPreset !== undefined ? equipadoPreset : true,
      activo:true, stacks:1, costo:'', nitrosCosto:FichaCalculo.IT2.nitrosHabilidad, dado:'', turnos:'', hpturno:0, stacksturno:0, permanente:false, popup:false,
      compras:1, regenHp:0,
      job:true, origen:'', imagen:'', categoria:'', tipoItem:'', tipoDado:8, danoFijo:0, danoAmplificado:0, armaDeRango:false, manoPreferida:'',
      unidades:1, consumible:false, curahp:0, precioCompra:0,
      efectoNombre:'', efectoTurnos:0, efectoHpTurno:0, efectoEscudo:0, efectoStacks:1, efectoPermanente:false, efectoDetalle:'', efectoMods:[], curaspPct:0, cargaMax:1, cargaActual:1,
      forzarNitros:'', mitadPdgEva:false, armaduraRota:false, escudoMagico:0, tiradaExtra:'', tiradaStat:'',
      equipoEstadoNombre:'', equipoEstadoHpTurno:0, equipoEstadoDetalle:''};
    return item ? Object.assign({}, defaults, item) : defaults;
  }

  function getModVal(draft, statId){
    const m = (draft.mods||[]).find(mm => mm.stat === statId);
    return m ? m.val : 0;
  }
  function setModVal(draft, statId, val){
    draft.mods = draft.mods || [];
    const idx = draft.mods.findIndex(mm => mm.stat === statId);
    if(val === 0){
      if(idx >= 0) draft.mods.splice(idx, 1);
    }else if(idx >= 0){
      draft.mods[idx].val = val;
    }else{
      draft.mods.push({stat: statId, val});
    }
  }

  function slugItemCatalogo(s){
    return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'item';
  }
  // Convierte un ítem de inventario/cinturón (instancia de un personaje) en
  // una entrada de catálogo del fabricante: descarta lo que solo tiene
  // sentido para una instancia (equipado, cargaActual, manoPreferida) y le
  // pone un id y un tier nuevos, porque el catálogo no los hereda de nada.
  function itemComoEntradaDeCatalogo(draft){
    return {
      id: 'new-' + slugItemCatalogo(draft.nombre),
      nombre: draft.nombre, tier: 'A definir', imagen: draft.imagen || '',
      tipoItem: draft.tipoItem, peso: num(draft.peso), ranuras: num(draft.ranuras) || 1,
      ...(ES_ARMA(draft.tipoItem) ? {
        tipoDado: num(draft.tipoDado) || 8, danoFijo: num(draft.danoFijo),
        danoAmplificado: num(draft.danoAmplificado), armaDeRango: !!draft.armaDeRango,
        efectosGolpe: structuredClone(draft.efectosGolpe || []),
      } : {}),
      precioCompra: num(draft.precioCompra),
      unidades: num(draft.unidades) || 1, cargaMax: num(draft.cargaMax),
      consumible: !!draft.consumible, curahp: num(draft.curahp), curaspPct: num(draft.curaspPct),
      efectoNombre: draft.efectoNombre || '', efectoTurnos: num(draft.efectoTurnos),
      efectoHpTurno: num(draft.efectoHpTurno), efectoEscudo: num(draft.efectoEscudo), efectoStacks: Math.max(1, num(draft.efectoStacks) || 1), efectoPermanente: !!draft.efectoPermanente,
      efectoDetalle: draft.efectoDetalle || '', efectoMods: structuredClone(draft.efectoMods || []),
      equipoEstadoNombre: draft.equipoEstadoNombre || '', equipoEstadoHpTurno: num(draft.equipoEstadoHpTurno),
      equipoEstadoDetalle: draft.equipoEstadoDetalle || '',
      mods: structuredClone((draft.mods || []).filter(m => m.stat)),
      detalle: draft.detalle || '',
    };
  }

  /* ---------- Habilidades: editor paso a paso ----------
     Crear o editar una habilidad va en pasos cortos, cada uno con una
     pregunta que guía al jugador. Al crear, "Guardar" aparece en el último
     paso; al editar, está siempre (y se puede saltar a cualquier paso). */
  const PASOS_HAB = {
    auto: {id: 'auto', corto: 'Cómo se ejecuta', titulo: '¿Cómo se ejecuta esta habilidad?',
     ayuda: 'Tres formas, de menos a más automática. Se puede cambiar cuando quieras.'},
    ejecucion: {id: 'ejecucion', corto: 'Ejecución', titulo: '¿Cómo se juega paso a paso?',
     ayuda: 'El costo, a quién apunta, qué tira cada uno, el daño y los efectos. Se arma en el cuadro de Ejecución (✨), el mismo que se abre para toda la mesa al usarla.'},
    anterior: {id: 'anterior', corto: 'Del sistema anterior', titulo: 'Lo que tenía del sistema anterior',
     ayuda: 'Esta habilidad todavía tiene cosas del sistema de automatización anterior. Se siguen aplicando solas al ejecutarla hasta que la adaptes: lo ideal es pasarla a ✨ Automático y armar ahí su ejecución.'},
    que: {id: 'que', corto: 'Qué es', titulo: '¿Cómo se llama y qué hace?',
     ayuda: 'Contalo como lo leería la mesa: esta descripción aparece en la Mesa cada vez que la uses.'},
    costo: {id: 'costo', corto: 'Costo', titulo: '¿Qué cuesta usarla?',
     ayuda: 'Se descuenta solo al ejecutarla. El SP se gasta y no vuelve al pasar turno; los Nitros (No2) se recargan en cada Mantenimiento. SP vacío = no gasta. En SP y en No2, X = lo elegís al usarla.'},
    tiradaEj: {id: 'tiradaEj', corto: 'Tirada al ejecutar', titulo: '¿Qué se tira al tocar Ejecutar?',
     ayuda: 'Lo que se tira apenas tocás Ejecutar: elegí el stat del golpe o de la prueba (por ejemplo PdG para un ataque). Es la PRIMERA tirada, de golpe. Si no elegís ninguno, Ejecutar no tira un stat (y si en el paso siguiente hay una fórmula, Ejecutar tira esa fórmula directamente).'},
    tiradaEf: {id: 'tiradaEf', corto: 'Tirada de efecto', titulo: '¿Tiene una tirada de efecto (daño, curación…)?',
     ayuda: 'La tirada interna de la habilidad: daño, curación, duración… (por ejemplo 2d6+3). Aparece como un botoncito 🎲 en la misma tarjeta, al lado de Ejecutar, y solo si esta tirada existe y hay un stat en el paso anterior. Sin stat, Ejecutar tira esta fórmula directamente y no hay botón aparte. Se puede dejar vacía.'},
    efecto: {id: 'efecto', corto: 'Efecto', titulo: '¿Qué pasa cuando la usás?',
     ayuda: 'La tirada: podés vincularla a un stat (se tira con su valor del momento, con los modificadores activos), escribir una fórmula, las dos cosas o ninguna (por ejemplo, si incluye un ataque, elegí PdG para que tire el golpe). Y lo que habilita: un estado alterado sobre vos (un buff, un recordatorio). Si no aplica ninguno, dejá el nombre vacío.'},
    origen: {id: 'origen', corto: 'Origen', titulo: '¿Cómo la conseguiste?',
     ayuda: 'Las que se compran con puntos de Job descuentan de tu Job disponible.'},
    listo: {id: 'listo', corto: 'Listo', titulo: 'Revisá cómo quedó',
     ayuda: 'Si algo no está bien, tocá el paso arriba para volver. Si está todo, guardala.'},
  };
  /* Tres modos de ejecución (regla del dueño, 2026-09-30 — reemplaza a "¿automatizarla? sí/no" + el tilde "¿se juega en el
     duelo?", que se superponían): 'manual' (📣 Anunciar: publica el texto y todo va a mano), 'semi' (💰 cobra solo el costo
     —Nitros, SP, HP— y tira la tirada inicial si la tiene; los efectos van a mano) y 'auto' (✨ la Ejecución paso a paso:
     objetivo, tiradas de cada uno, efectos). Se guarda en `h.modo`; las de antes lo deducen: automatizada === false →
     manual, con `duelo` configurado → auto, el resto → semi. Lo del sistema anterior (estado sobre uno mismo, cura, trampa)
     se sigue aplicando en semi y en auto hasta que se adapte cada habilidad. */
  const MODOS_HAB = {
    manual: {icono: '📣', nombre: 'Manual', boton: 'Anunciar', corto: 'solo se anuncia'},
    semi: {icono: '💰', nombre: 'Semiautomático', boton: 'Ejecutar', corto: 'cobra el costo y tira la tirada inicial'},
    auto: {icono: '✨', nombre: 'Automático', boton: 'Ejecutar', corto: 'ejecución paso a paso'},
  };
  const modoHab = h => FichaBotonera.modoHab(h);
  // Lo del sistema anterior que tiene cargado la habilidad (se sigue aplicando en semi y auto hasta adaptarla).
  function habLegado(h){
    const L = [];
    if(String(h.efectoNombre || '').trim()) L.push(`estado «${h.efectoNombre}» sobre vos`);
    if(num(h.curaHp) > 0) L.push(`cura ${fmt(num(h.curaHp))} HP`);
    if(h.trampaColocar && modoHab(h) !== 'auto') L.push('coloca una trampa');
    if(h.zonaMapa || h.portalMapa) L.push(h.portalMapa ? 'abre un portal' : 'marca una zona');
    return L;
  }
  // Automatizada (o sin definir, como las de antes): pide costo y efecto. No automatizada: solo qué es, origen y listo.
  function pasosHabilidad(draft){
    const m = modoHab(draft);
    const anterior = habLegado(draft).length ? [PASOS_HAB.anterior] : [];
    if(m === 'semi') return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.costo, PASOS_HAB.tiradaEj, PASOS_HAB.tiradaEf, ...anterior, PASOS_HAB.origen, PASOS_HAB.listo];
    if(m === 'auto') return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.ejecucion, ...anterior, PASOS_HAB.origen, PASOS_HAB.listo];
    return [PASOS_HAB.auto, PASOS_HAB.que, PASOS_HAB.origen, PASOS_HAB.listo];
  }

  /* =========================================================
     Tandas b2-b3: el editor como componente (dibujo, manejadores, Guardar/Eliminar, asistente de ítems, trampa, Ejecución)
     Copiado de ficha-personaje/js/10 (drawEditor, drawEditorHabilidad, htmlEstadoAlUsar, htmlEstadoAlEquipar, trampa…, los
     listeners de #modal-body, #modal-save/#modal-del, abrirAsistenteItem, portadorFicha, subirItemAlCatalogo) y js/07/js/02
     (agregarEstadoConAviso, statOptions, resumenEjecucionHab, abrirEjecucionHab, la categoría del ítem). Lo que leía variables
     de la ficha ahora sale del personaje (`ctx.S()`) y de las piezas comunes; lo que cada pantalla muestra a su manera va por `ctx`.

     crear(donde, ctx) → editor. `donde`: un elemento (o un ShadowRoot) de la pantalla; las ventanas paso a paso se abren en su documento
     (o adentro de su recuadro aislado, en el mapa). Desde la tanda 6 (2026-10-02) TODO se edita en la ventana común paso a paso.
     `ctx`:
       S()                     el personaje.
       toast(msg)              un aviso.
       confirmar(texto)        ¿seguro? (por defecto, confirm).
       alCambiar(keys)         se guardó/borró algo de esas listas: redibujar y guardar.
       elegirTipoItem(actual)  → Promise<id de categoría | null>  (la grilla: tipoItemHtml).
       elegirEstadoItem()      → Promise<{nombre, armado, estandar, detalle} | null>  (estado al usar/consumir).
       elegirEstadoDuelo()     → Promise (el `elegirEstado` de AsistenteDueloHab).
       alSubirCatalogo()       después de ⬆ Subir al catálogo (releer lo subido).
       alCerrar()              (opcional) la ventana se cerró (guardada, eliminada o cancelada).
     editor = {abrir(key, id, equipadoPreset, opciones), cerrar(), dibujar(), irAPaso(n), abrirAsistenteItem(key, id, op),
       aplicarTipoItem(id), estado (get/set: {key, id, draft, paso…} o null)}.
     Necesita además ficha-combate, ficha-lupa, ficha-tienda, ficha-habilidades, combatiente, estados-presets y, al usarlos,
     asistente-item, asistente-trampa, asistente-duelo-hab, biblioteca, plantillas, estado-preguntas, items-subidos. */
  const esc = s => String(s??'').replace(/[&<>"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
  const DADOS_ARMA = [4, 6, 8, 10, 12];
  const STAT_LABEL = () => FichaCalculo.STAT_LABEL;

  function statOptions(sel){
    const opt = s => `<option value="${s.id}" ${sel===s.id?'selected':''}>${s.label} — ${s.full}</option>`;
    return `<optgroup label="Atributos">${FichaCalculo.ATTR_LIST.map(opt).join('')}</optgroup>`
         + FichaCalculo.GRUPOS.map(g => `<optgroup label="${g.label} · ${g.full}">${g.derived.map(opt).join('')}</optgroup>`).join('')
         + `<optgroup label="Otros">${FichaCalculo.EXTRA.map(opt).join('')}</optgroup>`;
  }
  // Ponerle un estado al personaje o a una invocación: inmunidades, acumulación (Armadura rota, Veneno, Sangrado, Escarcha) y
  // renovación de uno igual son la regla común (comun/combatiente.js, agregarEstado). Devuelve el resultado.
  function agregarEstadoConAviso(lista, nuevo, quien, toast, o){
    const r = Combatiente.agregarEstado(lista, nuevo);
    const q = quien ? quien + ': ' : '';
    if(!r.ok){ toast(`🛡 ${q}inmune ahora mismo (${r.motivo}) — ${nuevo.nombre} no se pudo aplicar`); return r; }
    if(r.que === 'yaLoTiene'){ toast(`${q}${nuevo.nombre}: ya lo tiene, no se acumula`); return r; }
    const e = r.estado;
    const txt = r.que === 'acumulado'
      ? (e.esEscarcha ? `${e.nombre} ×${e.stacks} (−${e.stacks} No2 máx.)` : e.esSangrado ? `${e.nombre}: +1 al daño por turno (${fmt(Math.abs(num(e.hpturno)) * num(e.stacks))} ahora)` : `${e.nombre} ×${e.stacks}`)
      : r.que === 'renovado' ? `${e.nombre} renovado (ya lo tenía)` : `${e.nombre} activado`;
    // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161) — si quien llama sabe poner la vida.
    const dis = o && o.alDisparar ? Combatiente.dispararAlAplicar(r, lista, {hp: 'hpturno', resFuego: num(o.resFuego), ...(o.hpActual !== undefined ? {hpActual: o.hpActual} : {})}) : {hp: 0};
    if(dis.hp) o.alDisparar(dis.hp);
    toast(q + txt + (dis.hp ? ` · ya ${dis.hp < 0 ? 'sacó' : 'curó'} ${fmt(Math.abs(dis.hp))} HP` : ''));
    return r;
  }
  // Resumen de una ejecución paso a paso, en una línea (para el editor y la tarjeta).
  function resumenEjecucionHab(c){
    if(!c || typeof c !== 'object') return '';
    if(c.modo === 'arma') return 'ataque con tu arma';
    if(c.modo === 'flash') return 'flash';
    const OBJ = {enemigo: 'a un enemigo', aliado: 'a un aliado', 'uno mismo': 'sobre vos', area: 'en un área', onda: 'onda alrededor tuyo', zona: 'zona persistente'};
    const tira = c.tiraFormula ? (c.tiraEtiqueta || 'tirada propia') : c.tira ? (STAT_LABEL()[c.tira] || c.tira) : '';
    const partes = [OBJ[c.objetivo] || c.objetivo || 'a un enemigo'];
    if(tira) partes.push(`tira ${tira}${(c.contra || []).length ? ' contra ' + c.contra.map(s => STAT_LABEL()[s] || s).join('/') : ''}`);
    if(c.dano) partes.push('hace daño');
    if((c.efectos || []).length) partes.push(c.efectos.map(e => e.nombre || (e.cura ? 'cura' : 'efecto')).join(', '));
    return partes.join(' · ');
  }
  // Abre el cuadro que arma la ejecución paso a paso de una habilidad (comun/asistente-duelo-hab.js). Guardarla la deja
  // en ✨ Automático; sacarla la deja en 💰 Semiautomático.
  function abrirEjecucionHab(it, elegirEstado, alTerminar){
    AsistenteDueloHab.abrir({nombre: it.nombre || 'Habilidad', inicial: FichaBotonera.dueloDe(it) || null, siempreActivo: true, tieneFormula: !!String(it.tiradaExtra || '').trim(), costoVariable: FichaHabilidades.spVariable(it) ? 'sp' : FichaHabilidades.nitrosVariable(it) ? 'nitros' : '',
      costoInicial: {sp: it.costo, nitrosCosto: it.nitrosCosto, hpCosto: it.hpCosto, turnoAjenoSp: it.turnoAjenoSp}, elegirEstado,
      alGuardar: r => {
        if(r){ it.duelo = r.duelo; it.costo = r.costo.sp; it.nitrosCosto = r.costo.nitrosCosto; it.hpCosto = r.costo.hpCosto; it.turnoAjenoSp = r.costo.turnoAjenoSp || ''; it.modo = 'auto'; it.automatizada = true; }
        else{
          if(it.habClaseId && (function(){ const base = CLASES_SKILLS.flatMap(c => c.habilidades).find(h => h.id === it.habClaseId); return base && base.duelo; })()) it.duelo = null;
          else delete it.duelo;
          if(modoHab(it) === 'auto' || it.modo === 'auto') it.modo = 'semi';
        }
        if(alTerminar) alTerminar(r);
      }});
  }
  // La grilla de categorías de ítem (cada pantalla la muestra en su ventanita; el botón lleva data-tipoitem).
  function tipoItemHtml(actual){
    const grupos = {armas:'Armas', escudos:'Escudos', defensa:'Defensa', consumibles:'Consumibles', otros:'Otros'};
    let html = '';
    Object.keys(grupos).forEach(g => {
      const del = FichaEquipo.CATEGORIAS.filter(c => c.id && FichaTienda.grupoCompraDe(c.id) === g);
      if(!del.length) return;
      html += `<div class="preset-grupo">${grupos[g]} · ${fmt(del.length)}</div>`;
      html += `<div class="preset-grid">${del.map(c =>
        `<button type="button" class="tipoitem-btn ${g} ${actual === c.id ? 'activa' : ''}" data-tipoitem="${esc(c.id)}">${esc(c.label)}</button>`
      ).join('')}</div>`;
    });
    return html;
  }
  /* ⬆ Subir al catálogo (paso 5 de docs/plan-subida-unificada.md, P124): el ítem va a la biblioteca compartida de Firebase
     (tipo `items`), disponible al instante para todos, 🔶 sin auditar hasta que lo revise el dueño. Si el ítem salió del catálogo
     (mismo id, o mismo nombre), se puede elegir que sea una CORRECCIÓN de ese ítem: lo reemplaza para todos.
     `key` = 'catalogo' si es un ítem del catálogo (se sube tal cual); si no, es un ítem de un personaje (mochila, cinturón). */
  function subirAlCatalogo(S, draft, key, {toast, alSubir}){
    if(!String(draft.nombre || '').trim()){ toast('Poné un nombre antes de subirlo al catálogo'); return; }
    if(!draft.tipoItem){ toast('Elegí una categoría antes de subirlo al catálogo'); return; }
    const datos = key === 'catalogo' ? structuredClone(draft) : itemComoEntradaDeCatalogo(draft);
    if(key !== 'catalogo'){ const base = (S.catalogo || []).find(c => sinAviso(c.nombre) === sinAviso(draft.nombre)); if(base && base.tier) datos.tier = base.tier; }
    Biblioteca.guardar({tipo: 'items', datos, nombre: datos.nombre, nivel: 0, basadoEn: ItemsSubidos.basadoEn(draft, S.catalogo), alSubir});
  }
  // Una imagen elegida, achicada a un data URL (copia de fileToDataURL de la ficha).
  function imagenADatos(file, maxDim=480, quality=0.85){
    return new Promise((resolve, reject) => {
      if(!file.type || !file.type.startsWith('image/')){ reject(new Error('no-image')); return; }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('bad-image'));
        img.onload = () => {
          let w = img.naturalWidth, h = img.naturalHeight;
          if(w > maxDim || h > maxDim){
            if(w >= h){ h = Math.round(h * maxDim / w); w = maxDim; }
            else { w = Math.round(w * maxDim / h); h = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#1A1418';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  // Los números del personaje que muestra el asistente de ítems (cuántos No2, Dmg, carga…).
  function portador(S, idItem){
    const c = FichaCalculo.calcular(S);
    const usado = FichaEquipo.slots(S).find(sl => sl.id === 'manos_arma');
    return {
      nombre: S.meta.nombre || 'vos', nitros: num(FichaBotonera.nitrosMaximo(S, c)), dmg: num(c.final.dmg), rango: num(c.final.rng), def: num(c.final.def),
      cargaUsada: S.inventario.filter(i => i.equipado && i.id !== idItem).reduce((a, i) => a + num(i.peso), 0),
      cargaMax: num(c.final.crgmax),
      manosUsadas: usado ? usado.usado : 0,
    };
  }
  function jobResto(S){
    const total = FichaCalculo.jobTotal(S.meta.nivel);
    const gastado = [...S.habilidades, ...S.pasivas].reduce((a, x) => a + FichaLupa.jobCostoDe(x), 0);
    return total - gastado;
  }
  function costoAtaqueTxt(S){
    const armas = FichaCombate.armasEquipadasConDano(S);
    if(!armas.length) return `sin arma: ${FichaCombate.costoAtaque(S, null)} No2 ⚠ provisorio`;
    return armas.map(a => `${a.item.nombre}: ${FichaCombate.costoAtaque(S, a.item)} No2 (${FichaCombate.ataquesConArma(S, a.item) ? 'Tipo completo' : 'primer ataque, Tipo ÷ 2'})`).join(' · ');
  }
  const esCostoVariable = costo => /x/i.test(String(costo||''));
  const TRAMPA_DANO_RE = /^\d{1,2}d\d{1,3}([+-]\d{1,3})?$/i;
  // Estados que puede dejar una trampa (los debuffs con duración de EstadosAplicar).
  function trampaEstadosLista(){
    return EstadosAplicar.DEBUFFS.filter(p => !p.permanente && Number(p.turnos) > 0 && !p.esVeneno).map(p => ({nombre: p.nombre, detalle: p.detalle || '', turnos: Number(p.turnos), permanente: false}));
  }

  function crear(donde, ctx){
    const lugar = () => { const r = donde && donde.getRootNode ? donde.getRootNode() : document; return r instanceof ShadowRoot ? r : document.body; };
    const S = () => ctx.S();
    const toast = m => ctx.toast(m);
    const confirmar = t => (ctx.confirmar || (x => confirm(x)))(t);
    let editing = null;
    // Una habilidad se edita en la ventana común paso a paso (editing.pap, comun/paso-a-paso.js); el resto, en la ventana del editor.
    const q = sel => editing && editing.pap ? editing.pap.raiz.querySelector(sel) : null;

    function campoImagenHtml(draft){
      return `<div class="f">
    <label>${CAMPO_LABEL.imagen}</label>
    <button type="button" class="itempick" data-ed="itempick">
      ${draft.imagen ? `<img src="${draft.imagen}" alt="">` : `<span class="itempick-empty">+<small>Imagen</small></span>`}
    </button>
    ${draft.imagen ? `<button type="button" class="mini" data-ed="itempick-remove" style="margin-top:6px">Quitar imagen</button>` : ''}
    <input type="file" data-ed="itempick-input" accept="image/*" hidden>
  </div>`;
    }
    function trampaHtml(draft){
      const t = draft.trampaColocar || null;
      return `<div class="f" style="margin-top:10px"><label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--copper);border-radius:var(--r);background:rgba(201,133,69,.10)">
      <input type="checkbox" data-tr="on" ${t ? 'checked' : ''} style="width:auto"> <span><b>🪤 Esta habilidad coloca una trampa</b><br><span style="font-size:12px;color:var(--muted);text-transform:none;letter-spacing:0">${modoHab(draft) === 'auto' ? 'Al ejecutarla elegís en el mapa dónde colocarla. La ven solo los de tu bando: el GM se entera de que la colocaste, pero no de dónde.' : 'Al ejecutarla deja sola una trampa oculta al lado de tu token, en el mapa que se está jugando.'}</span></span></label></div>
    ${t ? `<div class="hint" style="margin:4px 0 8px"><b>${esc(t.nombre || 'Sin nombre')}</b><br>${esc(AsistenteTrampa.resumenTexto(t))}</div>
      <div style="display:flex;gap:8px"><button type="button" class="btn" data-ed="trampa-elegir" style="flex:1">🪤 Elegir otra trampa</button>
      <button type="button" class="btn primary" data-ed="trampa-asistente" style="flex:1">🪄 Ajustar todo, paso a paso</button></div>` : ''}`;
    }
    // ¿La habilidad invoca a una de tus invocaciones? (2026-10-02): al ejecutarla la despierta (o crea una copia, si ya está en juego)
    // y elegís en el mapa dónde aparece (FichaAcciones.invocarConHab).
    function invocaHtml(draft){
      const lista = ((S() || {}).invocaciones || []).filter(i => i && !i.copiaDe);
      const sel = draft.invoca && draft.invoca.invId || '';
      return `<div class="f" style="margin-top:14px"><label>🔮 ¿Invoca a una de tus invocaciones?</label>
      <select data-invoca="1">
        <option value="">— no invoca —</option>
        ${lista.map(i => `<option value="${esc(i.id)}" ${sel === i.id ? 'selected' : ''}>${esc(i.nombre || 'Invocación')}${num(i.cooldown) ? ` (dura ${fmt(num(i.cooldown))} turnos)` : ''}</option>`).join('')}
      </select>
      <div class="hint" style="margin-top:5px">${lista.length ? 'Al ejecutarla se despierta con la vida y los No2 llenos y elegís en el mapa dónde aparece. Si ya está en juego, se crea una copia («… 2»), así se puede usar varias veces seguidas. Cada una se duerme sola al terminar sus turnos.' : 'Todavía no tenés invocaciones: armala primero en la sección Invocaciones de tu ficha y después elegila acá.'}</div></div>`;
    }
    function trampaAbrirAsistente(){
      const ed = editing, t = ed.draft.trampaColocar || {};
      AsistenteTrampa.abrir({
        contexto: 'habilidad', editando: false, estados: trampaEstadosLista(), inicial: AsistenteTrampa.inicialDe(t),
        alTerminar: res => {
          if(editing !== ed) return;
          ed.draft.trampaColocar = AsistenteTrampa.aTrampa(res);   // forma única (P123)
          dibujar();
        },
        alCancelar: () => { if(editing === ed && ed.draft.trampaColocar && !String(ed.draft.trampaColocar.nombre || '').trim() && !ed.draft.trampaColocar.dano){ delete ed.draft.trampaColocar; dibujar(); } },
      });
    }
    // Al tildar la trampa (o «Elegir otra trampa»): el menú común — una conocida por tipo, de cero o del catálogo (comun/elegir-trampa.js).
    function trampaElegir(){
      const ed = editing;
      ElegirTrampa.abrir({inicial: ed.draft.trampaColocar || null,
        alTerminar: t => { if(editing !== ed) return; ed.draft.trampaColocar = t; dibujar(); },
        alCancelar: () => { if(editing === ed && ed.draft.trampaColocar && !String(ed.draft.trampaColocar.nombre || '').trim() && !ed.draft.trampaColocar.dano){ delete ed.draft.trampaColocar; dibujar(); } },
        alCatalogo: () => trampaPreconstruidas()});
    }
    function trampaGuardarCampo(el){
      const d = editing.draft, k = el.dataset.tr;
      if(k === 'on'){ d.trampaColocar = el.checked ? (d.trampaColocar || {nombre: '', detalle: '', dano: '', ignoraDef: false, tipo: 'flor', tamano: 0, cant: 1}) : undefined; if(!el.checked) delete d.trampaColocar; dibujar(); if(el.checked && !String(d.trampaColocar.nombre || '').trim()) trampaElegir(); return; }
      const t = d.trampaColocar; if(!t) return;
      if(k === 'ignoraDef') t[k] = el.checked;
      else if(k === 'radio' || k === 'cant') t[k] = Math.max(k === 'cant' ? 1 : 0, Math.min(6, Math.round(num(el.value) || 0)));
      else t[k] = el.value;
    }
    function trampaPreconstruidas(){
      const ed = editing;
      Biblioteca.abrir({
        tipo: 'trampas', titulo: 'Trampa preconstruida', z: 99600,   // por encima del editor de la habilidad
        base: typeof TRAMPAS_BASE !== 'undefined' ? TRAMPAS_BASE : [],
        subtitulo: e => (e.nivel ? ` · nivel ${e.nivel}` : '') + (e.datos && e.datos.dano ? ` · 💥 ${e.datos.dano}` : ''),
        grupos: [{nombre: 'Efecto', tags: ['daño', 'veneno', 'explosiva', 'fuego', 'inmoviliza', 'debuff', 'control', 'alarma']}, {nombre: 'Origen', tags: ['mecánica', 'mágica', 'natural']}, {nombre: 'Nivel', tags: ['nivel 1', 'nivel 2', 'nivel 3', 'nivel 4', 'nivel 5']}],
        alElegir: async datos => {
          const qs = [{clave: 'radio', min: 0, texto: '¿De qué tamaño es? (radio: 0 = una casilla, 1 = una flor de 1, 2 = una flor de 2…)'}];
          if(datos.dano) qs.push({clave: 'dano', tipo: 'texto', texto: '¿Cuánto daño hace? (dados, ej. 2d6 o 1d8+3)', patron: TRAMPA_DANO_RE, error: 'Escribilo así: 2d6 o 1d8+3.', placeholder: 'ej. 2d6+3'});
          qs.push({clave: 'cant', min: 1, texto: '¿Cuántas trampas coloca cada vez que la ejecutás?'});
          const r = await EstadoPreguntas.preguntar({titulo: 'Trampa', nombre: datos.nombre}, qs, x => x);
          if(!r || editing !== ed) return;
          // La trampa del catálogo entera (forma única, P123: con su estado, color y la zona que deja), con el tamaño, el daño y la
          // cantidad que se eligieron recién. Si es una línea, el "radio" que se preguntó se toma como su largo.
          const base = Plantillas.trampaDesde(datos);
          ed.draft.trampaColocar = {...base, nombre: String(datos.nombre || '').slice(0, 40), detalle: String(datos.detalle || '').slice(0, 200), dano: r.dano || '',
            tamano: base.tipo === 'linea' ? Math.max(1, Math.min(20, r.radio || 1)) : Math.max(0, Math.min(6, r.radio)), cant: Math.max(1, Math.min(6, r.cant))};
          delete ed.draft.trampaColocar.teleport;   // el teleport no lo coloca una habilidad (su destino se marca en el mapa)
          dibujar();
          toast(`Trampa "${datos.nombre}" cargada`);
        },
      });
    }
    // Sección "Estado alterado al usar" (consumibles y habilidades).
    function htmlEstadoAlUsar(key, draft){
      const personalizadosIt = S().efectosPersonalizados || [];
      return `<div class="f"><label>Estado alterado al ${key === 'habilidades' ? 'ejecutar' : 'consumir'} (opcional)</label>
      <button type="button" class="btn preset-abrir" data-ed="estado-preset">Elegir de la lista · ${fmt(estadosPresetFicha().length + personalizadosIt.length)} estados</button>
      <input data-c="efectoNombre" placeholder="${key === 'habilidades' ? 'ej. Espinas' : 'ej. Regeneración (poción)'}" value="${esc(draft.efectoNombre??'')}" style="margin-top:6px"></div>
      <label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-c="efectoPermanente" ${draft.efectoPermanente?'checked':''} style="width:auto">
        <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">No vence (queda hasta usarlo o borrarlo a mano)</span>
      </label>
      ${!draft.efectoPermanente ? `<div class="f2">
        <div class="f"><label>${CAMPO_LABEL.efectoTurnos}</label><input data-c="efectoTurnos" type="number" step="any" value="${esc(draft.efectoTurnos??0)}"></div>
        <div class="f"><label>${CAMPO_LABEL.efectoHpTurno}</label><input data-c="efectoHpTurno" type="number" step="any" value="${esc(draft.efectoHpTurno??0)}"></div>
      </div>` : `<div class="f"><label>${CAMPO_LABEL.efectoHpTurno}</label><input data-c="efectoHpTurno" type="number" step="any" value="${esc(draft.efectoHpTurno??0)}"></div>`}
      ${num(draft.efectoEscudo) > 0 || num(draft.efectoStacks) > 1 ? `<div class="f2">
        ${num(draft.efectoEscudo) > 0 ? `<div class="f"><label>${CAMPO_LABEL.efectoEscudo}</label><input data-c="efectoEscudo" type="number" step="any" value="${esc(draft.efectoEscudo)}"></div>` : ''}
        ${num(draft.efectoStacks) > 1 ? `<div class="f"><label>${CAMPO_LABEL.efectoStacks}</label><input data-c="efectoStacks" type="number" step="any" value="${esc(draft.efectoStacks)}"></div>` : ''}
      </div>` : ''}
      <div class="f"><label>${CAMPO_LABEL.efectoDetalle}</label><textarea data-c="efectoDetalle" rows="2" placeholder="Qué hace el estado, tal como lo va a leer el jugador. Si lo dejás vacío se usa el detalle del ítem.">${esc(draft.efectoDetalle??'')}</textarea></div>
      <div class="f"><label>Modificadores de atributo (opcional)</label>
        <div class="efectomods">${(draft.efectoMods||[]).map((m,i)=>`
        <div class="modrow">
          <select data-em="${i}" data-emk="stat">
            <option value="">— elegir stat —</option>
            ${statOptions(m.stat)}
          </select>
          <input data-em="${i}" data-emk="val" type="number" step="any" value="${esc(m.val)}">
          <button class="mini" data-rmefectomod="${i}">×</button>
        </div>`).join('')}</div>
        <button type="button" class="iconbtn iconbtn-add" data-ed="addefectomod">+ Modificador de atributo</button>
        <div class="hint" style="margin-top:6px">Cada modificador suma o resta a un atributo mientras el estado esté activo: uno principal (Fuerza, Destreza, Agilidad…) o uno secundario (PdG, Evasión, Defensa, No2, SP…). Ej.: +2 Fuerza durante los turnos que dure, o −1 PdG.</div>
      </div>
      <div class="hint" style="margin:-4px 0 8px">Si le ponés nombre, al consumir este ítem se activa (o refresca) ese estado en Estados alterados. Con "No vence" tildado, el estado queda ahí hasta que lo borres vos manualmente.</div>`;
    }
    // Sección "Estado alterado al equipar" (ítems no consumibles y armas).
    function htmlEstadoAlEquipar(draft){
      const tieneEstadoEquipo = (draft.equipoEstadoNombre || '').trim() || editing.estadoEquipoAbierto;
      return `<div class="f">
      <label>Estado alterado al equipar</label>
      ${tieneEstadoEquipo ? `
        <input data-c="equipoEstadoNombre" placeholder="ej. Regeneración" value="${esc(draft.equipoEstadoNombre??'')}">
        <div class="f"><label>HP por turno (mientras esté puesto)</label><input data-c="equipoEstadoHpTurno" type="number" step="any" value="${esc(draft.equipoEstadoHpTurno??0)}" style="margin-top:6px"></div>
        <textarea data-c="equipoEstadoDetalle" rows="2" placeholder="Qué hace el estado. Si lo dejás vacío se usa el detalle del ítem." style="margin-top:6px">${esc(draft.equipoEstadoDetalle??'')}</textarea>
        <button type="button" class="mini" data-ed="rmestadoequipo" style="margin-top:6px">Quitar estado alterado</button>
        <div class="hint" style="margin-top:6px">Se activa solo al equipar el ítem y se va al sacártelo — no cuenta turnos, dura lo que dure puesto.</div>
      ` : `<button type="button" class="iconbtn iconbtn-add" data-ed="addestadoequipo">+ Estado alterado</button>`}
    </div>`;
    }

    function htmlPasoHabilidad(info){
      const {draft} = editing;
      const etiqueta = (texto, extra) => `<span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${texto}</span>${extra || ''}`;
      let html = '';

      if(info.id === 'auto'){
        const m = modoHab(draft);
        const EXPLICA = {
          manual: 'El botón se llama <b>Anunciar</b>: publica la descripción en la Mesa y la mesa se ocupa de todo lo demás (costos, tiradas y efectos, a mano). No cobra ni tira nada.',
          semi: 'Al tocar <b>Ejecutar</b> la ficha <b>cobra sola el costo</b> (Nitros, SP y HP, si tiene) y <b>tira la tirada inicial</b> si la tiene (por lo general, la PdG). Publica la descripción en la Mesa; los efectos se resuelven a mano.',
          auto: 'Al tocar <b>Ejecutar</b> se abre la <b>Ejecución paso a paso</b>, a la vista de toda la mesa: cobra el costo, elegís el objetivo en el mapa, cada involucrado tira en su momento, se ven los resultados y se aplican los efectos. Si es solo sobre vos y no tira nada (como Blindaje), se aplica directo con un anuncio.',
        };
        html += `<div class="modos-hab">${Object.entries(MODOS_HAB).map(([k, v]) => `
        <button type="button" class="opcion-btn modo-hab-btn ${m === k ? 'activa' : ''}" data-hab-modo="${k}">
          <b>${v.icono} ${v.nombre}</b><span>${EXPLICA[k]}</span>
        </button>`).join('')}</div>
      ${m === null ? '<div class="hint" style="margin-top:8px">Elegí una para seguir.</div>' : ''}`;
      }
      if(info.id === 'ejecucion'){
        const c = FichaBotonera.dueloDe(draft);
        html += `<div class="hint" style="margin:6px 0 10px">${c ? `Configurada: <b>${esc(resumenEjecucionHab(c))}</b>.` : 'Todavía <b>no está configurada</b>: sin esto, al ejecutarla solo cobra el costo y tira la tirada inicial (como la semiautomática).'}</div>
      <button type="button" class="btn primary" data-hab-ejecucion="1" style="width:100%">✨ ${c ? 'Cambiar' : 'Armar'} la ejecución paso a paso</button>
      <div class="hint" style="margin:14px 0 0">¿La habilidad coloca una trampa? Tildalo acá: al ejecutarla se cobra el costo, se anuncia en la Mesa (sin decir dónde) y elegís la casilla en el mapa.</div>`;
        html += trampaHtml(draft);
        html += invocaHtml(draft);
      }
      if(info.id === 'anterior'){
        html += `<div class="hint" style="margin:0 0 10px">Tiene: <b>${esc(habLegado(draft).join(' · '))}</b>.</div>`;
        html += `<div class="f"><label>Vida (HP) que cura</label>
        <input data-c="curaHp" type="number" step="1" min="0" value="${esc(num(draft.curaHp))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">Se suma sola a tu vida al ejecutarla, sin pasar del máximo. 0 = no cura.</div></div>`;
        html += htmlEstadoAlUsar('habilidades', draft);
        html += trampaHtml(draft);
      }
      if(info.id === 'que'){
        html += `<div class="f"><label>Nombre</label><input data-c="nombre" value="${esc(draft.nombre)}" placeholder="ej. Golpe certero" data-hab-enter="1"></div>
      <div class="f"><label>Descripción</label><textarea data-c="detalle" rows="4" placeholder="ej. Un golpe preciso que ignora la mitad de la Defensa del rival.">${esc(draft.detalle)}</textarea></div>`;
      }
      if(info.id === 'costo'){
        // Nitros: un número fijo, X (se elige al usarla) o lo que cueste un ataque con el arma que se elija al ejecutarla.
        const modo = FichaHabilidades.nitrosAtaque(draft) ? 'ataque' : (FichaHabilidades.nitrosVariable(draft) ? 'x' : 'num');
        const opcion = (valor, texto) => `<button type="button" class="opcion-btn ${modo === valor ? 'activa' : ''}" data-nitros-modo="${valor}">${texto}</button>`;
        html += `<div class="f"><label>SP que gasta</label><input data-c="costo" value="${esc(draft.costo ?? '')}" placeholder="ej. 3 · o X si varía" data-hab-enter="1"></div>
      <div class="f"><label>Nitros (No2) que gasta</label>
        <div class="opcion-fila">
          ${opcion('num', 'Un número')}${opcion('x', 'X (lo elijo al usarla)')}${opcion('ataque', 'Lo mismo que un ataque')}
        </div>
        ${modo === 'num' ? `<input data-c="nitrosCosto" type="number" step="1" min="0" value="${esc(num(draft.nitrosCosto ?? FichaCalculo.IT2.nitrosHabilidad))}" data-hab-enter="1" style="margin-top:6px;max-width:120px">` : ''}
        <div class="hint" style="margin-top:5px">${modo === 'ataque'
          ? `Para habilidades que incluyen un ataque: cuesta lo mismo que atacar con el arma que elijas al ejecutarla (Tipo ÷ 2 el primer ataque del turno con esa arma, Tipo completo después) y cuenta como ese ataque. Hoy: ${esc(costoAtaqueTxt(S()))}.`
          : modo === 'x' ? 'Al ejecutarla te pregunta cuántos Nitros gastar.' : 'Siempre gasta esa cantidad.'}</div>
      </div>
      <div class="f"><label>Vida (HP) que gasta</label>
        <input data-c="hpCosto" type="number" step="1" min="0" value="${esc(num(draft.hpCosto))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">Se descuenta sola al ejecutarla. No te deja usarla si te dejaría en 0: tenés que tener más vida que el costo. 0 = no gasta.</div>
      </div>
      `;
      }
      if(info.id === 'tiradaEj'){
        const opcionStat = s => `<option value="${s.id}" ${draft.tiradaStat === s.id ? 'selected' : ''}>${esc(s.label)} · ${esc(s.full)}</option>`;
        html += `<div class="f"><label>Tirada al ejecutar: stat</label>
        <select data-c="tiradaStat">
          <option value="">— no tira un stat —</option>
          <optgroup label="Principales">${FichaCalculo.ATTR_LIST.map(opcionStat).join('')}</optgroup>
          <optgroup label="Secundarios">${FichaBotonera.statsConTirada().map(opcionStat).join('')}</optgroup>
        </select></div>`;
      }
      if(info.id === 'tiradaEf'){
        html += `<div class="f"><label>Tirada de efecto: fórmula de dados (opcional)</label><input data-c="tiradaExtra" value="${esc(draft.tiradaExtra ?? '')}" placeholder="ej. 2d6+3 o 1d20" data-hab-enter="1"></div>
      <div class="hint" style="margin-top:6px">${draft.tiradaStat ? 'Al ejecutar se tira ' + esc(STAT_LABEL()[draft.tiradaStat] || draft.tiradaStat) + ' y esta fórmula queda en el botón 🎲 de la tarjeta.' : 'No elegiste un stat: Ejecutar va a tirar esta fórmula directamente (sin botón 🎲 aparte).'}</div>`;
      }
      if(info.id === 'efecto'){
        html += htmlEstadoAlUsar('habilidades', draft);
        html += trampaHtml(draft);
      }
      if(info.id === 'origen'){
        const conJob = draft.job !== false;
        html += `<label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" data-c="job" ${conJob ? 'checked' : ''} style="width:auto" data-hab-redibujar="1">
        ${etiqueta("La compré con puntos de Job")}
      </label>` +
          (conJob ? `<div class="f"><label>¿Cuántos puntos de Job te costó?</label><input data-c="jobCosto" type="number" step="1" min="0" value="${fmt(FichaLupa.jobCostoDe(draft))}" data-hab-enter="1" style="max-width:120px">
        <div class="hint" style="margin-top:5px">De clase prefabricada: 1. Custom: 2. Te quedan ${fmt(jobResto(S()))} de Job${editing.id ? " (contando esta)" : ""}.</div></div>` : `<div class="f"><label>¿De dónde salió?</label><input data-c="origen" value="${esc(draft.origen ?? '')}" placeholder="ej. Regalo de un hechicero, raza, objeto…" data-hab-enter="1"></div>`) +
          campoImagenHtml(draft);
      }
      if(info.id === 'listo'){
        const fila = (titulo, valor) => `<div class="resumen-fila"><span>${titulo}</span><b>${valor}</b></div>`;
        const modo = modoHab(draft) || 'semi', auto = modo === 'semi';
        const costoSp = String(draft.costo ?? '').trim();
        const tiradaEj = draft.tiradaStat ? (STAT_LABEL()[draft.tiradaStat] || draft.tiradaStat) : (String(draft.tiradaExtra || '').trim() || 'no tira'), tiradaEf = draft.tiradaStat && String(draft.tiradaExtra || '').trim() ? String(draft.tiradaExtra).trim() + ' (botón 🎲)' : 'sin tirada de efecto';
        html += `<div class="resumen-hab">
      <div class="resumen-nombre">${esc(draft.nombre || '(sin nombre)')}</div>
      <div class="resumen-desc">${draft.detalle ? esc(draft.detalle) : '<span style="color:var(--muted)">(sin descripción)</span>'}</div>
      ${fila('Ejecución', `${MODOS_HAB[modo].icono} ${MODOS_HAB[modo].nombre} (${MODOS_HAB[modo].corto})`)}
      ${modo === 'auto' ? fila('Paso a paso', esc(FichaBotonera.dueloDe(draft) ? resumenEjecucionHab(FichaBotonera.dueloDe(draft)) : 'sin configurar')) : ''}
      ${habLegado(draft).length ? fila('Del sistema anterior', esc(habLegado(draft).join(' · '))) : ''}
      ${auto ? `${fila('SP', esc(costoSp || 'no gasta'))}
      ${fila("No2", FichaHabilidades.nitrosAtaque(draft) ? "como un ataque (elegís el arma al usarla)" : FichaHabilidades.nitrosVariable(draft) ? "X (lo elegís al usarla)" : fmt(num(draft.nitrosCosto ?? FichaCalculo.IT2.nitrosHabilidad)))}
      ${fila('HP', num(draft.hpCosto) > 0 ? fmt(num(draft.hpCosto)) : 'no gasta')}
      ${fila('Al ejecutar', esc(tiradaEj))}
      ${fila('Efecto', esc(tiradaEf))}
      ` : ''}
      ${fila("Origen", esc(draft.job !== false ? `Puntos de Job (${fmt(FichaLupa.jobCostoDe(draft))})` : (draft.origen || "otro")))}
    </div>`;
      }

      return html;
    }
    // La ventana paso a paso de una habilidad (la común: pestañas que saltan, Guardar al editar, «✔ Crear» al final).
    function abrirHabilidadPaso(){
      const ed = editing;
      ed.inicial = JSON.stringify(ed.draft);
      ed.pap = PasoAPaso.abrir({
        titulo: ed.id ? 'Editar habilidad' : 'Nueva habilidad', crear: !ed.id,
        contenedor: lugar(),
        z: 55,   // encima de las ventanas de la ficha (50) y debajo de las que se abren desde acá (la lista de estados, 60)
        pasos: () => pasosHabilidad(ed.draft).map(p => ({id: p.id, nombre: p.corto, ayuda: `<b>${p.titulo}</b> ${p.ayuda}`, html: () => htmlPasoHabilidad(p)})),
        // Lo primero: cómo se ejecuta; y con nombre ya se puede saltar a cualquier paso.
        puedeIr: i => i > 0 && modoHab(ed.draft) === null ? 'Primero elegí cómo se ejecuta' : i > 1 && !(ed.draft.nombre || '').trim() ? 'Primero ponele un nombre' : '',
        alClic: e => clic(e), alInput: e => cambio(e), alTecla: e => teclas(e),
        alCambio: e => { cambio(e); redibujarTrasCambio(e); cambioImagen(e); },
        confirmarCancelar: () => JSON.stringify(ed.draft) === ed.inicial ? '' : (ed.id ? '¿Descartar los cambios de esta habilidad?' : '¿Cancelar? La habilidad que estás armando se descarta.'),
        alGuardar: () => { guardar(); }, alCrear: () => { guardar(); },
        alCancelar: () => cerrar(),
        extras: ed.id ? [{id: 'eliminar', texto: 'Eliminar', alClic: () => eliminar()}] : [],
      });
    }

    function dibujar(){ if(editing && editing.pap) editing.pap.redibujar(); }

    // El formulario de una entrada (todo lo que no es habilidad), por pasos: arma solo los bloques del paso (`bloques`: nombres de campo
    // o de bloque — 'categoria', 'mano', 'defensa', 'estadoAlUsar', 'arma', 'precioVenta', 'mods', 'estadoEquipar', 'preset').
    function htmlFormulario(key, draft, bloques){
      const en = b => bloques.includes(b);
      const sc = SCHEMA[key];
      const FLAGS = ['equipado','activo','permanente','popup','job','consumible','mitadPdgEva','armaduraRota','armaDeRango'];
      const ESPECIALES = ['imagen','categoria','tipoItem','tipoDado','danoFijo','precioVentaAuto','manoPreferida'];
      const cortos = sc.campos.filter(c => c!=='detalle' && !ESPECIALES.includes(c) && !FLAGS.includes(c));
      const flags = sc.campos.filter(c => FLAGS.includes(c));
      const esArma = ES_ARMA(draft.tipoItem);
      const CATEGORIAS = FichaEquipo.CATEGORIAS;

      let html = '';
      if(en('nombre')) html += `<div class="f"><label>${CAMPO_LABEL.nombre}</label><input data-c="nombre" value="${esc(draft.nombre)}"></div>`;
      if(key === 'efectos' && en('preset')){
        const personalizados = S().efectosPersonalizados || [];
        const yaGuardado = personalizados.some(p => p.nombre === draft.nombre);
        html += `<div class="f">
      <button type="button" class="mini" data-ed="efecto-preset-guardar">${yaGuardado ? 'Actualizar' : 'Guardar'} como preset personalizado</button>
      ${yaGuardado ? `<button type="button" class="mini danger" data-ed="efecto-preset-borrar" style="margin-left:6px">Borrar preset "${esc(draft.nombre)}"</button>` : ''}
      <div class="hint" style="margin-top:5px">Guarda esta configuración (turnos, stacks, HP por turno, modificadores, etc.) para poder elegirla de nuevo junto a los demás presets.</div>
    </div>`;
      }
      if(sc.campos.includes('tipoItem') && en('categoria')){
        const catActual = CATEGORIAS.find(c => c.id === draft.tipoItem);
        html += `<div class="f"><label>${CAMPO_LABEL.tipoItem}</label>
      <button type="button" class="btn preset-abrir" data-ed="tipoitem">${esc(catActual && catActual.id ? catActual.label : '— elegir categoría —')}</button></div>`;
        const slotDef = key !== 'catalogo' ? FichaEquipo.SLOT_DEFS.find(sd => sd.cats.includes(draft.tipoItem)) : null;
        if(slotDef){
          const slots = FichaEquipo.slots(S());
          const usado = slots.find(s => s.id === slotDef.id)?.usado || 0;
          const sobre = usado > slotDef.max;
          html += `<div class="hint" style="margin:-4px 0 8px${sobre?';color:var(--danger)':''}">${esc(slotDef.label)}: ${fmt(usado)} / ${fmt(slotDef.max)} ocupados${sobre?' — te pasaste':''}</div>`;
        }
      }
      if((draft.tipoItem === 'arma_1m' || draft.tipoItem === 'escudo_1m') && en('mano')){
        html += `<div class="f"><label>${CAMPO_LABEL.manoPreferida}</label>
      <select data-c="manoPreferida">
        <option value="" ${!draft.manoPreferida?'selected':''}>Automática</option>
        <option value="1" ${String(draft.manoPreferida)==='1'?'selected':''}>Mano 1</option>
        <option value="2" ${String(draft.manoPreferida)==='2'?'selected':''}>Mano 2</option>
      </select>
      <div class="hint" style="margin-top:5px">Define en qué mano aparece dentro de "Efectos de equipo" cuando tenés dos cosas equipadas.</div>
    </div>`;
      }

      const resto = cortos.filter(c => {
        if(c==='nombre') return false;
        if(c==='curahp') return false;
        // Los campos del estado alterado van juntos en su propia sección (más abajo).
        if(['efectoNombre','efectoTurnos','efectoHpTurno','efectoEscudo','efectoStacks','efectoDetalle','curaspPct'].includes(c)) return false;
        if(c==='forzarNitros') return false;
        if(c==='ranuras' && draft.equipado) return false;
        if(['unidades','cargaMax','cargaActual'].includes(c) && !draft.consumible) return false;
        return en(c);
      });
      const esDefensivo = CATEGORIAS.find(c => c.id === draft.tipoItem)?.defensivo === true && en('defensa');
      if(resto.length || esDefensivo){
        html += `<div class="f2">`
          + resto.map(c => `<div class="f"><label>${CAMPO_LABEL[c]}</label>
      <input data-c="${c}" ${CAMPO_NUM.includes(c)?'type="number" step="any"':''} value="${esc(draft[c]??'')}"></div>`).join('')
          + (esDefensivo ? `<div class="f"><label>Defensa</label><input data-defmod="def" type="number" step="any" value="${getModVal(draft,'def')}"></div>` : '')
          + `</div>`;
      }
      if(esDefensivo){
        html += `<div class="f">
      <label>Resistencia a críticos</label>
      <div class="defres-grid">
        ${FichaBotonera.TIPOS_IDS.map(id => {
          const d = FichaCalculo.EXTRA.find(e => e.id === id);
          return `<div class="defres-cell">
            <label>${esc(d.label)}</label>
            <input data-defmod="${id}" type="number" step="any" value="${getModVal(draft, id)}">
          </div>`;
        }).join('')}
      </div>
    </div>`;
      }
      if(sc.campos.includes('curahp') && draft.consumible && en('curahp')){
        html += `<div class="f"><label>${CAMPO_LABEL.curahp}</label>
      <input data-c="curahp" type="number" step="any" value="${esc(draft.curahp??0)}"></div>`;
      }
      if(sc.campos.includes('curaspPct') && draft.consumible && en('curaspPct')){
        html += `<div class="f"><label>${CAMPO_LABEL.curaspPct}</label>
      <input data-c="curaspPct" type="number" step="any" min="0" max="100" value="${esc(draft.curaspPct??0)}"></div>`;
      }
      if(sc.campos.includes('efectoNombre') && draft.consumible && en('estadoAlUsar')) html += htmlEstadoAlUsar(key, draft);
      if(esArma && en('arma') && (sc.campos.includes('tipoDado') || sc.campos.includes('danoFijo'))){
        html += `<div class="f2">
      <div class="f"><label>${CAMPO_LABEL.tipoDado}</label>
        <select data-c="tipoDado">
          ${DADOS_ARMA.map(d => `<option value="${d}" ${(num(draft.tipoDado)||8)===d?'selected':''}>d${d}${d===12?' (explosivos/modernas)':''}</option>`).join('')}
        </select></div>
      <div class="f"><label>${CAMPO_LABEL.danoFijo}</label><input data-c="danoFijo" type="number" step="any" value="${esc(draft.danoFijo??0)}"></div>
      <div class="f"><label>${CAMPO_LABEL.danoAmplificado}</label><input data-c="danoAmplificado" type="number" step="1" min="0" value="${esc(draft.danoAmplificado??0)}"></div>
    </div>
    <div class="hint" data-ed="dano-hint" style="margin:-4px 0 8px">Daño: ${FichaCombate.armaDanoTxt(draft)} (peso × d${num(draft.tipoDado)||8}${num(draft.danoAmplificado)?` + ${num(draft.danoAmplificado)} dado${num(draft.danoAmplificado)>1?'s':''} por daño amplificado`:''}, más el fijo)</div>`;
      }
      if(sc.campos.includes('precioVentaAuto') && en('precioVenta')){
        html += `<div class="f"><label>Precio de venta (mitad de compra)</label>
      <div style="font-family:'Space Mono',monospace;font-weight:700;color:var(--brass);padding:5px 7px">${fmt(FichaTienda.precioVenta(draft))}</div>
    </div>`;
      }
      const FLAGS_OCULTOS = ['mitadPdgEva','armaduraRota'];
      flags.filter(c => !FLAGS_OCULTOS.includes(c) && en(c)).forEach(c => {
        const on = (c==='activo' || c==='job') ? draft[c] !== false : !!draft[c];
        html += `<label class="f" style="display:flex;align-items:center;gap:8px;cursor:pointer">
      <input type="checkbox" data-c="${c}" ${on?'checked':''} style="width:auto">
      <span style="font-family:'Space Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)">${CAMPO_LABEL[c]}</span></label>`;
      });
      if(sc.campos.includes('detalle') && en('detalle'))
        html += `<div class="f"><label>${key === 'efectos' || key === 'pasivas' || key === 'sociales' ? 'Qué hace (en palabras)' : 'Detalle'}</label><textarea data-c="detalle">${esc(draft.detalle)}</textarea></div>`;

      if(sc.mods && en('mods')){
        const esEstado = key === "efectos";
        html += `<div class="f"><label>${esEstado ? "Modificadores de atributo (opcional)" : "Modificadores"}</label>
      <div class="mods">${(draft.mods||[]).map((m,i)=>{
        if(esDefensivo && (m.stat === 'def' || FichaBotonera.TIPOS_IDS.includes(m.stat))) return '';
        return `
        <div class="modrow">
          <select data-m="${i}" data-mk="stat">
            <option value="">— elegir stat —</option>
            ${statOptions(m.stat)}
          </select>
          <input data-m="${i}" data-mk="val" type="number" step="any" value="${esc(m.val)}">
          <button class="mini" data-rmmod="${i}">×</button>
        </div>`;
      }).join('')}</div>
      <button class="iconbtn iconbtn-add" data-ed="addmod">${esEstado ? "+ Modificador de atributo" : "+ Modificador"}</button>
      <div class="hint" style="margin-top:6px">${esEstado
        ? "Cada modificador suma o resta a un atributo mientras el estado esté activo: uno principal (Fuerza, Destreza, Agilidad…) o uno secundario (PdG, Evasión, Defensa, No2, SP…). Ej.: +2 Fuerza durante los turnos que dure, o −1 PdG."
        : "Se suman al stat mientras el ítem esté equipado o el efecto activo."}</div>
    </div>`;
      }
      if(sc.campos.includes('tipoItem') && !draft.consumible && en('estadoEquipar')) html += htmlEstadoAlEquipar(draft);
      if(sc.campos.includes('imagen') && en('imagen')) html += campoImagenHtml(draft);
      return `<div class="fe-paso">${html}</div>`;
    }

    // Los pasos del formulario de cada tipo de entrada (2026-10-02, tanda 6 de docs/plan-paso-a-paso.md): {id, corto, titulo, ayuda,
    // bloques}. El último es siempre Resumen.
    function pasosFormulario(key, draft){
      const esItem = key === 'inventario' || key === 'cinturon' || key === 'catalogo';
      const P = (id, corto, titulo, ayuda, bloques) => ({id, corto, titulo, ayuda, bloques});
      const lista = key === 'pasivas' ? [
        P('que', 'Qué es', '¿Qué es?', 'El nombre y qué hace, en palabras: es lo que se lee en la ficha.', ['nombre', 'detalle', 'imagen']),
        P('numeros', 'Números', '¿Qué suma?', 'Los bonos que da mientras la tengas, la vida que recupera en cada Mantenimiento y cuántas veces la compraste (los efectos y el costo se multiplican).', ['mods', 'regenHp', 'compras']),
        P('job', 'Cómo se consiguió', '¿Cómo se consiguió?', 'Con puntos de Job (cuenta para el presupuesto del nivel) o de otra forma: un premio, la historia, un objeto.', ['job', 'jobCosto', 'origen']),
      ] : key === 'sociales' ? [
        P('que', 'Qué es', '¿Qué talento es?', 'Una habilidad social o de conocimiento (Persuadir, Historia, Trampas…). Su dado sale del nivel: se sube con «+ Nivel» en la lista.', ['nombre', 'detalle', 'imagen']),
      ] : key === 'efectos' ? [
        P('que', 'Qué es', '¿Qué estado es?', 'El nombre y qué le pasa a quien lo tiene, en palabras.', ['nombre', 'detalle', 'imagen']),
        P('dura', 'Duración', '¿Cuánto dura?', 'Cada ⟳ Mantenimiento descuenta un turno. Permanente: no vence solo. Inactivo: queda en la lista sin hacer efecto.', ['turnos', 'permanente', 'activo', 'popup']),
        P('vida', 'Vida', '¿Toca la vida?', 'HP por turno: negativo daña (veneno), positivo cura (regeneración); se multiplica por los stacks. El escudo es una barra aparte que absorbe el daño antes que la vida.', ['hpturno', 'stacks', 'stacksturno', 'escudoMagico']),
        P('numeros', 'Números', '¿Cambia algún número?', 'Suma o resta a un atributo o a un stat mientras dure (+2 Fuerza, −1 PdG…).', ['mods']),
      ] : esItem ? [
        P('que', 'Qué es', '¿Qué es?', 'El nombre, la categoría y qué hace, en palabras.', ['nombre', 'categoria', 'detalle', 'imagen']),
        ...(draft.consumible ? [
          P('uso', 'Al usarlo', '¿Qué pasa al usarlo?', 'Cuántas unidades y cargas tiene, cuánto cura o daña, el estado que deja y una tirada propia (opcional).', ['consumible', 'unidades', 'cargaMax', 'cargaActual', 'curahp', 'curaspPct', 'estadoAlUsar', 'tiradaExtra']),
        ] : [
          P('uso', 'Equipado', '¿Cómo se usa?', 'Si está equipado, en qué mano, el daño si es un arma y el estado que da mientras está puesto.', ['consumible', 'equipado', 'ranuras', 'mano', 'arma', 'armaDeRango', 'defensa', 'tiradaExtra', 'estadoEquipar']),
          P('bonos', 'Bonos', '¿Qué suma?', 'Los bonos que da mientras está equipado.', ['mods']),
        ]),
        P('precio', 'Peso y precio', 'Peso y precio', 'Lo que pesa (ocupa lugar en la mochila) y lo que cuesta; se vende a la mitad.', ['peso', 'precioCompra', 'precioVenta']),
      ] : [P('todo', 'Datos', 'Datos', '', SCHEMA[key].campos.concat(['mods']))];
      return lista.concat([P('resumen', 'Resumen', 'Así queda.', key === 'efectos' && !editing.id ? 'Al tocar «✔ Activar» se le pone a este personaje.' : '', key === 'efectos' ? ['preset'] : [])]);
    }
    // Resumen de lo cargado, en una tarjeta.
    function resumenFormulario(key, draft){
      const fila = (t, v) => v === '' || v === null || v === undefined ? '' : `<div class="resumen-fila"><span>${t}</span><b>${v}</b></div>`;
      const mods = (draft.mods || []).filter(m => m && m.stat && num(m.val)).map(m => `${num(m.val) > 0 ? '+' : ''}${fmt(num(m.val))} ${esc((FichaCalculo.STAT_LABEL || {})[m.stat] || m.stat)}`).join(' · ');
      let h = fila('Nombre', esc(draft.nombre || 'Sin nombre'));
      if(key === 'pasivas') h += fila('Suma', mods || '—') + (num(draft.regenHp) ? fila('Vida por Mantenimiento', '+' + fmt(num(draft.regenHp))) : '') + fila('Compras', fmt(num(draft.compras) || 1))
        + fila('Se consiguió', draft.job !== false ? `con Job (${fmt(num(draft.jobCosto))})` : esc(draft.origen || 'de otra forma'));
      else if(key === 'efectos') h += fila('Dura', draft.permanente ? 'no vence' : `${fmt(num(draft.turnos))} turno(s)`) + (num(draft.hpturno) ? fila('HP por turno', fmt(num(draft.hpturno)) + (num(draft.stacks) > 1 ? ` × ${fmt(num(draft.stacks))} stacks` : '')) : '')
        + (num(draft.escudoMagico) ? fila('Escudo', fmt(num(draft.escudoMagico)) + ' HP') : '') + (mods ? fila('Números', mods) : '') + (draft.activo === false ? fila('Activo', 'no') : '');
      else if(key === 'inventario' || key === 'cinturon' || key === 'catalogo'){
        const cat = FichaEquipo.CATEGORIAS.find(c => c.id === draft.tipoItem);
        h += fila('Categoría', esc(cat ? cat.label : '—')) + fila('Peso', fmt(num(draft.peso))) + fila('Precio', fmt(num(draft.precioCompra)))
          + (draft.consumible ? fila('Unidades', fmt(num(draft.unidades) || 1)) + (num(draft.curahp) ? fila('HP al usarlo', fmt(num(draft.curahp))) : '') + (draft.efectoNombre ? fila('Deja', esc(draft.efectoNombre)) : '') : '')
          + (mods ? fila('Bonos', mods) : '');
      }
      if((draft.detalle || '').trim()) h += `<p class="hint" style="margin-top:10px">${esc(draft.detalle)}</p>`;
      return `<div class="resumen-hab">${h}</div>`;
    }
    function abrirFormularioPaso(){
      const ed = editing, sc = SCHEMA[ed.key];
      const esItem = ed.key === 'inventario' || ed.key === 'cinturon' || ed.key === 'catalogo';
      const tit = sc.titulo.toLowerCase();
      ed.inicial = JSON.stringify(ed.draft);
      ed.pap = PasoAPaso.abrir({
        titulo: ed.id ? `Editar ${tit}${ed.draft.nombre ? ' · ' + ed.draft.nombre : ''}` : `${ed.key === 'pasivas' ? 'Nueva' : 'Nuevo'} ${tit}`, crear: !ed.id,
        contenedor: lugar(), z: 55,
        textoCrear: ed.key === 'efectos' ? '✔ Activar el estado' : '✔ Crear',
        pasos: () => pasosFormulario(ed.key, ed.draft).map(p => ({id: p.id, nombre: p.corto, ayuda: `<b>${p.titulo}</b> ${p.ayuda}`,
          html: () => p.id === 'resumen' ? resumenFormulario(ed.key, ed.draft) + htmlFormulario(ed.key, ed.draft, p.bloques) : htmlFormulario(ed.key, ed.draft, p.bloques),
          alMontar: (c, a) => { const i = a.cuerpo.querySelector('input:not([type=checkbox]):not([type=file]),textarea'); if(i && p.id === 'que') setTimeout(() => i.focus(), 30); }})),
        alClic: e => clic(e), alInput: e => cambio(e),
        alCambio: e => { cambio(e); cambioImagen(e); },
        alTecla: e => {
          const t = e.composedPath ? e.composedPath()[0] : e.target;
          if(e.key !== 'Enter' || !t || t.tagName !== 'INPUT') return;
          e.preventDefault();
          const n = pasosFormulario(ed.key, ed.draft).length;
          if(ed.pap.paso() < n - 1) ed.pap.irA(ed.pap.paso() + 1);
        },
        confirmarCancelar: () => JSON.stringify(ed.draft) === ed.inicial ? '' : (ed.id ? '¿Descartar los cambios?' : '¿Cancelar? Lo que estás armando se descarta.'),
        alGuardar: () => { guardar(); }, alCrear: () => { guardar(); },
        alCancelar: () => cerrar(),
        extras: [
          ...(esItem ? [{id: 'catalogo', texto: '⬆ Subir al catálogo', alClic: () => { if(editing === ed) subirAlCatalogo(S(), ed.draft, ed.key, {toast, alSubir: ctx.alSubirCatalogo}); }}] : []),
          ...(ed.id ? [{id: 'eliminar', texto: 'Eliminar', alClic: () => eliminar()}] : []),
        ],
      });
    }

    function abrir(key, id, equipadoPreset, opciones){
      const sc = SCHEMA[key];
      const op = opciones || {};
      const item = borrador(op.draft || (id ? S()[key].find(x=>x.id===id) : null), equipadoPreset);
      // Ítems de inventario y catálogo (menos consumibles): asistente paso a paso.
      if(!op.formulario && (key === 'inventario' || key === 'catalogo') && item.tipoItem !== 'consumibles'){
        abrirAsistenteItem(key, id, {equipadoPreset, draft: op.draft});
        return;
      }
      editing = {key, id, draft: structuredClone(item), paso: 0};
      // Una habilidad nueva arranca sin respuesta a "¿automatizarla?": es lo primero que se pregunta. Las que ya existen (sin el
      // dato) cuentan como automatizadas.
      if(key === 'habilidades' && !id && !op.draft){ editing.draft.automatizada = null; editing.draft.modo = null; editing.draft.jobCosto = HAB_JOB_CUSTOM; }
      if(key === 'habilidades') abrirHabilidadPaso();
      else abrirFormularioPaso();
    }
    function cerrar(){
      if(editing && editing.pap){ const pap = editing.pap; editing.pap = null; pap.cerrar(); }
      editing = null; if(ctx.alCerrar) ctx.alCerrar();
    }

    // Pasos del asistente abierto (habilidades), o null si es el formulario común.
    function pasosDelEditor(){ return editing && editing.key === 'habilidades' ? pasosHabilidad(editing.draft) : null; }
    function irAPaso(n){
      if(editing && editing.pap) editing.pap.irA(n);   // lo que no se puede todavía lo avisa la ventana (puedeIr)
    }

    // La categoría elegida: un ítem nuevo que deja de ser consumible sigue en el asistente de ítems.
    function aplicarTipoItem(id){
      if(!editing) return;
      editing.draft.tipoItem = id;
      if(!editing.id && id !== 'consumibles' && (editing.key === 'inventario' || editing.key === 'catalogo')){
        const {key, draft} = editing;
        cerrar();
        abrirAsistenteItem(key, null, {draft});
        return;
      }
      dibujar();
    }
    // El estado elegido de la lista para "estado al usar/consumir": sus cantidades quedan en la habilidad o el ítem.
    function cargarEstadoAlUsar(r){
      const d = editing.draft, p = r.armado;
      d.efectoNombre = r.nombre;
      d.efectoTurnos = p.turnos ?? 0;
      d.efectoHpTurno = p.hpturno ?? 0;
      d.efectoPermanente = !!p.permanente;
      d.efectoEscudo = num(p.escudoMagico);
      d.efectoStacks = num(p.stacks) > 1 ? num(p.stacks) : 1;
      if(r.estandar && (p.mods || []).some(m => m && m.stat)) d.efectoMods = structuredClone(p.mods.filter(m => m && m.stat));
      if(r.detalle && !(d.efectoDetalle || '').trim()) d.efectoDetalle = r.detalle;
      dibujar();
    }

    function cambio(e){
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if(!editing || !t || !t.dataset) return;
      if(t.dataset.tr){ trampaGuardarCampo(t); return; }
      if(t.dataset.invoca){ if(t.value) editing.draft.invoca = {invId: t.value}; else delete editing.draft.invoca; return; }
      if(t.dataset.c){
        const c = t.dataset.c;
        editing.draft[c] = t.type === "checkbox" ? t.checked : (CAMPO_NUM.includes(c) ? (t.value===""?"":num(t.value)) : t.value);
        // Nitros de una habilidad: un número o X (lo elegís al usarla).
        if(c === "nitrosCosto") editing.draft[c] = esCostoVariable(t.value) ? "X" : (t.value.trim() === "" ? "" : num(t.value));
        if(c === "tiradaStat") editing.pdgAuto = false;  // lo eligió a mano
        if(['tipoItem','equipado','consumible','efectoPermanente'].includes(c)){ dibujar(); return; }
        if(['peso','tipoDado','danoFijo','danoAmplificado'].includes(c)){
          const hint = q('[data-ed="dano-hint"]');
          const da = num(editing.draft.danoAmplificado);
          if(hint) hint.textContent = `Daño: ${FichaCombate.armaDanoTxt(editing.draft)} (peso × d${num(editing.draft.tipoDado)||8}${da?` + ${da} dado${da>1?'s':''} por daño amplificado`:''}, más el fijo)`;
        }
      }
      if(t.dataset.defmod){
        setModVal(editing.draft, t.dataset.defmod, num(t.value));
        return;
      }
      if(t.dataset.m !== undefined){
        const i = +t.dataset.m, k = t.dataset.mk;
        editing.draft.mods[i][k] = k==='val' ? num(t.value) : t.value;
      }
      if(t.dataset.em !== undefined){
        const i = +t.dataset.em, k = t.dataset.emk;
        editing.draft.efectoMods[i][k] = k==='val' ? num(t.value) : t.value;
      }
    }
    async function cambioImagen(e){
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if(!t || !t.dataset || t.dataset.ed !== 'itempick-input' || !editing) return;
      const file = t.files[0]; if(!file) return;
      try{
        editing.draft.imagen = await imagenADatos(file, 480, 0.85);
        dibujar();
      }catch(err){
        toast('No se pudo cargar esa imagen');
      }
    }
    function clic(e){
      if(!editing) return;
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      const el = t && t.closest ? t : null;
      if(!el) return;
      // El paso a paso de una habilidad.
      if(pasosDelEditor()){
        const modoNitros = el.closest("[data-nitros-modo]");
        if(modoNitros){
          const m = modoNitros.dataset.nitrosModo;
          const d = editing.draft, IT2 = FichaCalculo.IT2;
          d.nitrosCosto = m === "ataque" ? "ATAQUE" : m === "x" ? "X" : ((FichaHabilidades.nitrosAtaque(d) || FichaHabilidades.nitrosVariable(d)) ? IT2.nitrosHabilidad : num(d.nitrosCosto ?? IT2.nitrosHabilidad));
          // Costo de ataque: la tirada por defecto es PdG (si no eligió otra). Si después cambia de opción, se saca el PdG que se
          // había puesto solo.
          if(m === "ataque" && !d.tiradaStat){ d.tiradaStat = "pdg"; editing.pdgAuto = true; }
          else if(m !== "ataque" && editing.pdgAuto && d.tiradaStat === "pdg"){ d.tiradaStat = ""; editing.pdgAuto = false; }
          dibujar();
          return;
        }
        const modoBtn = el.closest('[data-hab-modo]');
        if(modoBtn){
          editing.draft.modo = modoBtn.dataset.habModo;
          editing.draft.automatizada = editing.draft.modo !== 'manual';
          dibujar();
          return;
        }
        if(el.closest('[data-hab-ejecucion]')){ abrirEjecucionHab(editing.draft, ctx.elegirEstadoDuelo, () => dibujar()); return; }
      }
      const b = el.closest('button'); if(!b) return;
      const a = b.dataset.ed;
      if(a === 'addmod'){ editing.draft.mods = editing.draft.mods||[]; editing.draft.mods.push({stat:'', val:0}); dibujar(); }
      if(b.dataset.rmmod !== undefined){ editing.draft.mods.splice(+b.dataset.rmmod,1); dibujar(); }
      if(a === 'trampa-pre'){ trampaPreconstruidas(); return; }
      if(a === 'trampa-elegir'){ trampaElegir(); return; }
      if(a === 'trampa-asistente'){ trampaAbrirAsistente(); return; }
      if(a === 'addefectomod'){ editing.draft.efectoMods = editing.draft.efectoMods||[]; editing.draft.efectoMods.push({stat:'', val:0}); dibujar(); }
      if(b.dataset.rmefectomod !== undefined){ editing.draft.efectoMods.splice(+b.dataset.rmefectomod,1); dibujar(); }
      if(a === 'addestadoequipo'){ editing.estadoEquipoAbierto = true; dibujar(); }
      if(a === 'rmestadoequipo'){
        editing.draft.equipoEstadoNombre = ''; editing.draft.equipoEstadoHpTurno = 0; editing.draft.equipoEstadoDetalle = '';
        editing.estadoEquipoAbierto = false;
        dibujar();
      }
      if(a === 'itempick'){ q('[data-ed="itempick-input"]').click(); }
      if(a === 'itempick-remove'){ editing.draft.imagen = ''; dibujar(); }
      if(a === 'tipoitem'){
        const ed = editing;
        Promise.resolve(ctx.elegirTipoItem(ed.draft.tipoItem)).then(id => { if(id && editing === ed) aplicarTipoItem(id); });
        return;
      }
      if(a === 'estado-preset'){
        const ed = editing;
        Promise.resolve(ctx.elegirEstadoItem()).then(r => { if(r && editing === ed) cargarEstadoAlUsar(r); });
        return;
      }
      if(a === 'efecto-preset-guardar'){
        const d = editing.draft;
        if(!d.nombre.trim()){ toast('Ponéle nombre al estado antes de guardarlo como preset'); return; }
        const preset = {
          nombre: d.nombre, imagen: d.imagen || '', turnos: d.turnos, stacks: d.stacks,
          hpturno: d.hpturno, stacksturno: d.stacksturno, permanente: !!d.permanente,
          forzarNitros: d.forzarNitros, mitadPdgEva: !!d.mitadPdgEva,
          armaduraRota: !!d.armaduraRota,
          mods: structuredClone(d.mods || []), detalle: d.detalle || '',
        };
        const P = S();
        P.efectosPersonalizados = P.efectosPersonalizados || [];
        const idx = P.efectosPersonalizados.findIndex(p => p.nombre === preset.nombre);
        if(idx >= 0) P.efectosPersonalizados[idx] = preset; else P.efectosPersonalizados.push(preset);
        toast(`Preset "${preset.nombre}" guardado`);
        dibujar();
      }
      if(a === 'efecto-preset-borrar'){
        if(!confirmar(`¿Borrar el preset "${editing.draft.nombre}"?\n\nEsto no borra el estado activo, solo el preset guardado para reutilizar.`)) return;
        const P = S();
        P.efectosPersonalizados = (P.efectosPersonalizados || []).filter(p => p.nombre !== editing.draft.nombre);
        toast('Preset borrado');
        dibujar();
      }
    }
    function teclas(e){
      const pasos = pasosDelEditor();
      if(!pasos) return;
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if(e.key === 'Enter' && t && t.matches && t.matches('[data-hab-enter]')){
        e.preventDefault();
        t.dispatchEvent(new Event('change', {bubbles: true}));
        const ahora = editing.pap ? editing.pap.paso() : 0;
        if(ahora < pasos.length - 1) irAPaso(ahora + 1);
      }
    }
    function redibujarTrasCambio(e){
      // Después de que cambio() actualice el borrador.
      const t = e.composedPath ? e.composedPath()[0] : e.target;
      if(pasosDelEditor() && t && t.matches && t.matches("[data-hab-redibujar]")) setTimeout(dibujar, 0);
    }

    function guardar(){
      if(!editing) return;
      const P = S();
      const {key, id, draft} = editing;
      if(!draft.nombre.trim()) draft.nombre = 'Sin nombre';
      // Un estado nuevo desde el formulario completo: la misma regla que el "+ Estado" (inmunidades, acumular o renovar).
      if(key === 'efectos' && !id){
        cerrar();
        agregarEstadoConAviso(P.efectos, draft, '', toast, {resFuego: FichaCalculo.calcular(P).final.resfuego,
          alDisparar: hp => { FichaAcciones.fijarHp(P, num(P.hp) + hp); FichaAcciones.revisarAnkh(P); FichaAcciones.revisarMuerte(P); }});
        ctx.alCambiar(['efectos']);
        return;
      }
      if(key === 'inventario' && draft.tipoItem === 'consumibles' && draft.equipado){
        // Los consumibles no van a "Equipo": si se marcan como equipados, pasan al cinturón.
        // Al cinturón, las unidades que entren (1 ranura = 1 unidad, 2026-10-04); el resto queda en la mochila.
        if(id) P.inventario = P.inventario.filter(x => x.id !== id);
        draft.equipado = false;
        P.inventario.push(draft);
        const r = FichaEquipo.alCinturon(P, draft);
        cerrar();
        ctx.alCambiar(['inventario', 'cinturon']);
        toast(FichaEquipo.textoAlCinturon(P, draft, r));
        return;
      }
      if(id){ const i = P[key].findIndex(x=>x.id===id); P[key][i] = draft; }
      else P[key].push(draft);
      cerrar();
      ctx.alCambiar([key]);
    }
    function eliminar(){
      if(!editing) return;
      const P = S();
      const {key, id} = editing;
      const it = P[key].find(x=>x.id===id);
      if(it && !confirmar(`¿Eliminar "${it.nombre}"? No se puede deshacer.`)) return;
      P[key] = P[key].filter(x=>x.id!==id);
      cerrar();
      ctx.alCambiar([key]);
    }

    /* ---------- ↻ Actualizar desde el catálogo (2026-10-07, pedido del dueño) ----------
       Lo que un personaje compró es una copia: si después cambia el ítem del catálogo (las armas especiales rehechas), la copia sigue vieja.
       Se reconoce por `catId` (lo deja la tienda desde hoy) o, si no, por el nombre (y la calidad, si hay más de uno). Se pisa todo menos lo
       propio de esa copia: su id, si está equipado, las unidades, la carga, la mano y si está a mano. → el ítem del catálogo o null. */
    const PROPIO_DE_LA_COPIA = ['id', 'equipado', 'unidades', 'cargaActual', 'activo', 'manoPreferida', 'aMano', 'dur', 'reservado', 'reservadoPara'];
    function delCatalogo(it){
      const cat = (S().catalogo || []).filter(c => c && !c.archivo);
      if(it.catId){ const x = cat.find(c => c.id === it.catId); if(x) return x; }
      const mismos = cat.filter(c => c.nombre === it.nombre);
      return mismos.find(c => c.tier === it.tier) || mismos[0] || null;
    }
    const sinLoPropio = o => { const c = structuredClone(o || {}); PROPIO_DE_LA_COPIA.concat(['catId', 'precioCompra']).forEach(k => delete c[k]); return JSON.stringify(c, Object.keys(c).sort()); };
    function difiereDelCatalogo(it){ const c = it && !it.consumible ? delCatalogo(it) : null; return c && sinLoPropio(c) !== sinLoPropio(it) ? c : null; }
    function actualizarDesdeCatalogo(key, id){
      const Q = S(), i = Q[key].findIndex(x => x.id === id), it = Q[key][i], c = it ? difiereDelCatalogo(it) : null;
      if(!c) return false;
      if(!confirmar(`¿Actualizar «${it.nombre}» con la versión del catálogo?

Ahora: ${it.detalle || '—'}

Catálogo: ${c.detalle || '—'}`)) return false;
      const nuevo = structuredClone(c);
      PROPIO_DE_LA_COPIA.forEach(k => { if(it[k] !== undefined) nuevo[k] = it[k]; else delete nuevo[k]; });
      nuevo.catId = c.id;
      Q[key][i] = nuevo;
      return true;
    }

    /* ---------- Ítems: asistente paso a paso (comun/asistente-item.js) ----------
       Crear o editar cualquier ítem de inventario o del catálogo (menos consumibles) va por el asistente compartido, con los
       números de este personaje. El resumen deja volver al formulario común. */
    function abrirAsistenteItem(key, id, op){
      op = op || {};
      const P = S();
      const original = id ? P[key].find(x => x.id === id) : null;
      const base = structuredClone(op.draft || original || {
        id: uid(), nombre: '', tipoItem: '', peso: 0, ranuras: 1, detalle: '', mods: [], imagen: '',
        equipado: op.equipadoPreset !== undefined ? op.equipadoPreset : true, activo: true, unidades: 1, consumible: false,
        precioCompra: 0, tipoDado: 8, danoFijo: 0, danoAmplificado: 0, armaDeRango: false, manoPreferida: '', efectosGolpe: [],
        equipoEstadoNombre: '', equipoEstadoHpTurno: 0, equipoEstadoDetalle: '',
      });
      if(!base.id) base.id = uid();
      const enInventario = key === 'inventario';
      AsistenteItem.abrir({
        contexto: 'ficha',
        nuevo: !original,
        titulo: original ? `Editar ${original.nombre}` : key === 'catalogo' ? 'Ítem nuevo del catálogo' : 'Ítem nuevo',
        draft: base,
        stats: FichaCalculo.MOD_TARGETS.map(x => ({id: x.id, label: x.label})),
        portador: () => portador(S(), base.id),
        ejemplos: (tipoItem, t) => (S().catalogo || []).filter(it => ES_ARMA(it.tipoItem) && num(it.tipoDado) === t).map(it => it.nombre),
        tiers: Object.keys(FichaEquipo.TIER_COLOR),
        conImagen: true,
        imagenADatos: file => imagenADatos(file, 480, 0.85),
        conEstadoEquipar: true,
        elegirEstado: ctx.elegirEstadoDuelo,   // el «+ Estado» de la Ejecución ✨ de un arma especial
        conPrecio: true,
        conLugar: enInventario,
        conRanuras: !enInventario,
        conMano: enInventario,
        textoGuardar: original ? 'Guardar' : 'Crear',
        botones: [
          ...(enInventario ? [{texto: '⬆ Subir al catálogo', accion: d => subirAlCatalogo(S(), AsistenteItem.fusionar(base, d), 'inventario', {toast, alSubir: ctx.alSubirCatalogo})}] : []),
          ...(enInventario && original && difiereDelCatalogo(original) ? [{texto: '↻ Actualizar desde el catálogo', accion: () => {
            if(!actualizarDesdeCatalogo(key, id)) return;
            AsistenteItem.cerrar(); ctx.alCambiar([key]); toast(`↻ ${original.nombre}: actualizado con la versión del catálogo`);
          }}] : []),
          ...(original ? [{texto: 'Eliminar', accion: () => {
            if(!confirmar(`¿Eliminar "${original.nombre}"? No se puede deshacer.`)) return;
            const Q = S();
            Q[key] = Q[key].filter(x => x.id !== id);
            AsistenteItem.cerrar();
            ctx.alCambiar([key]);
          }}] : []),
        ],
        onFormulario: d => abrir(key, id, undefined, {formulario: true, draft: {...base, ...d}}),
        onConsumible: d => abrir(key, id, undefined, {formulario: true, draft: {...base, ...d, tipoItem: 'consumibles', consumible: true}}),
        onGuardar: d => {
          const Q = S();
          const item = {...AsistenteItem.fusionar(base, d), consumible: false};
          if(!ES_ARMA(item.tipoItem)) ['tipoDado', 'danoFijo', 'danoAmplificado', 'armaDeRango', 'efectosGolpe'].forEach(k => delete item[k]);
          const i = Q[key].findIndex(x => x.id === item.id);
          if(i >= 0) Q[key][i] = item; else Q[key].push(item);
          ctx.alCambiar([key]);
          toast(`${item.nombre} ${original ? 'guardado' : 'creado'}`);
          return true;
        },
      });
    }

    return {abrir, cerrar, dibujar, irAPaso, abrirAsistenteItem, aplicarTipoItem, difiereDelCatalogo, actualizarDesdeCatalogo,
      get estado(){ return editing; }, set estado(v){ editing = v; }};
  }

  // Lo que cuesta en Job una habilidad custom nueva (la de "Habilidad custom" de la ficha).
  const HAB_JOB_CUSTOM = 2;

  return {SCHEMA, CAMPO_LABEL, CAMPO_NUM, borrador, getModVal, setModVal, slugItemCatalogo, itemComoEntradaDeCatalogo,
    PASOS_HAB, MODOS_HAB, habLegado, pasosHabilidad,
    statOptions, agregarEstadoConAviso, resumenEjecucionHab, abrirEjecucionHab, tipoItemHtml, subirAlCatalogo, imagenADatos, portador,
    jobResto, costoAtaqueTxt, trampaEstadosLista, TRAMPA_DANO_RE, HAB_JOB_CUSTOM, crear};
})();
