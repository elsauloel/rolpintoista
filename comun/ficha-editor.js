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
    escudoMagico:'Escudo especial — HP de una barra secundaria que absorbe daño antes que el HP real; se recarga entera en cada Mantenimiento mientras el estado siga activo (dejalo en 0 si no aplica)',
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

  return {SCHEMA, CAMPO_LABEL, CAMPO_NUM, borrador, getModVal, setModVal, slugItemCatalogo, itemComoEntradaDeCatalogo,
    PASOS_HAB, MODOS_HAB, habLegado, pasosHabilidad};
})();
