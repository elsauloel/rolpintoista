/* =========================================================
   ⭐ EL POOL ESENCIAL DE CREEPS (2026-11-03; diseño del dueño del 2026-11-02, docs/creeps-humanoides.md)
   «Un pool de creeps genéricos… de cada rol una variedad, nivel 1 a 5, con un equipo acorde… todos humanoides, para poder crear creeps
   rápidamente y cambiarles el nombre de acuerdo a su circunstancia.» Cada línea es una estrategia dentro de su rol; se diseñan de a uno, a fondo,
   y entran acá cuando el dueño los aprueba. Se suman al final de CREEPS_BASE con `pool: 'esencial'` (la biblioteca de GM Tools los separa en la
   pestaña «⭐ Pool esencial»; lo demás de fábrica es el «🗺 Pool de campaña»).

   Se arman con lo de fábrica: el equipo sale del catálogo (comun/catalogo.js, por nombre) y las habilidades del pool de habilidades de creep
   (comun/skills-creep-base.js, las auditadas, con su costo y cooldown). Por eso este archivo va DESPUÉS de catalogo.js, skills-creep-base.js,
   creep-calculo.js y creeps-base.js. Si una pieza no está, se avisa en la consola y el creep sale sin ella.
   ========================================================= */
(function(){
  if(typeof window.CREEPS_BASE === 'undefined') window.CREEPS_BASE = [];
  const CAT = () => (typeof CATALOGO_BASE !== 'undefined' ? CATALOGO_BASE : []);
  const HABS = () => (typeof HABILIDADES_CREEP_BASE !== 'undefined' ? HABILIDADES_CREEP_BASE : []);
  const slug = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const faltan = [];
  const item = nombre => {
    const it = CAT().find(x => x && x.nombre === nombre && !x.archivo);
    if(!it) faltan.push(nombre);
    return it || null;
  };
  // Una pieza para el equipo del creep, puesta (equipado: true).
  function pieza(nombre, k){
    const it = item(nombre);
    if(!it) return null;
    const o = typeof CreepCalculo !== 'undefined' && CreepCalculo.itemParaCreep ? CreepCalculo.itemParaCreep(it) : structuredClone(it);
    return {...o, id: 'ese-' + k + '-' + slug(nombre), equipado: true};
  }
  // Un consumible para el cinturón (como CreepAcciones.alCinturon).
  function consumible(nombre, k){
    const it = item(nombre);
    if(!it) return null;
    const c = structuredClone(it);
    delete c.imagen; delete c._bib; delete c.equipado;
    return {...c, id: 'ese-' + k + '-' + slug(nombre), consumible: true, unidades: 1, cargaActual: Math.max(1, Number(it.cargaMax) || 1)};
  }
  // La habilidad de fábrica por nombre (la auditada), armada para el nivel.
  function hab(nombre, n){
    const e = HABS().find(x => x && x.nombre === nombre && x.datos && x.datos.sp && x.datos.sp.auditada) || HABS().find(x => x && x.nombre === nombre);
    if(!e){ faltan.push('habilidad: ' + nombre); return null; }
    return typeof armarHabilidadDeCreep === 'function' ? armarHabilidadDeCreep(e.datos, n) : null;
  }
  const ROL_COLOR = {rango: '#3E8E7E', tanque: '#5B7FA6', warrior: '#B34A3A', liviano: '#8B5A2B', mago: '#D9662B', support: '#4CB86A', debuffer: '#7A3E9D'};
  // Oro de un humano (como los de fábrica: 5n² + 10n).
  const oroHumano = n => 5 * n * n + 10 * n;

  function esencial(c){
    const n = c.nivel, k = slug(c.nombre);
    const [con, fue, agl, des, esp] = c.atrib;
    const hp = con * 5;
    // 💧 Modo SP (dueño, 2026-11-03: «todos los que son con énfasis en especial van a trabajar con SP en vez de con cooldown»): el Especial es su
    // atributo más alto (magos, debuffers, el Sanador). Los demás, con turnos de espera. `c.modoSP` lo fuerza para un lado o el otro.
    const modoSP = c.modoSP !== undefined ? !!c.modoSP : esp >= Math.max(con, fue, agl, des);
    const datos = {
      nombre: c.nombre, nivel: n, color: ROL_COLOR[c.rol] || '#888888', hp, hpMax: hp, spd: 5, ataquesTurno: 0,
      con, fue, agl, des, esp, defensa: 0, armaduraTipo: '', crit: [0, 0, 0, 0, 0], equipoVivo: 1,
      equipo: c.equipo.map(x => pieza(x, k)).filter(Boolean),
      cinturon: c.consumibles.map(x => consumible(x, k)).filter(Boolean),
      habilidades: c.habilidades.map(h => hab(h, n)).filter(Boolean),
      estados: [], pasivas: [], notas: c.estrategia, escalaTipos: 2, imagen: '',
      tipoCriatura: 'humano', tipoCriaturaOtro: '', jefe: false, oroBase: oroHumano(n), armaNatural: false, trofeoEspecial: {nombre: '', precio: 0},
      pool: 'esencial', linea: c.linea, ...(modoSP ? {modoSP: true} : {}),
    };
    window.CREEPS_BASE.push({
      poolId: 'esencial-' + c.linea.toLowerCase() + '-' + n + '-' + k, nombre: c.nombre, nivel: n, pool: 'esencial',
      etiquetas: ['esencial', c.rolTxt, 'nivel ' + n, 'humano'],
      detalle: `${c.estrategia} Habilidades: ${c.habilidades.join(' · ')}${modoSP ? ' (con SP)' : ''}. Consumible: ${c.consumibles.join(' y ')}.`, datos,
    });
  }

  // ---- Nivel 1 (aprobados por el dueño el 2026-11-02; detalle y porqués en docs/creeps-humanoides.md) ----
  // Atributos en el orden Con · Fue · Agi · Des · Esp (suman 33).
  esencial({linea: 'T1', nombre: 'Escudero', rol: 'tanque', rolTxt: 'tanque', nivel: 1, atrib: [12, 5, 5, 7, 4],   // Con Fue Agi Des Esp (dueño, 2026-11-03)
    equipo: ['Hacha de piedra', 'Escudo de caparazón de tortuga gigante', 'Peto de hierro', 'Cofia de anillas sueltas'],
    habilidades: ['Provocar', 'Piel de hierro'], consumibles: ['Poción de Cuero Duro', 'Poción de Piel de Cristal'],
    estrategia: 'Tanque. Se planta adelante, provoca al que más pega y aguanta; con el hacha le rompe la armadura al que lo ignora.'});
  esencial({linea: 'M1', nombre: 'Piromante', rol: 'mago', rolTxt: 'mágico', nivel: 1, atrib: [7, 2, 5, 5, 14],
    equipo: ['Varita de la bola de fuego', 'Botella con un diablito', 'Campera de cuero con tachas', 'Gorro de piel de salamandra'],
    habilidades: ['Lengua de fuego', 'Muro de fuego'], consumibles: ['Poción de SP menor'],
    estrategia: 'Mago de fuego. Controla el terreno: levanta un muro de llamas que corta el paso y quema de a uno a los que se acercan.'});
  esencial({linea: 'L1', nombre: 'Sangrador', rol: 'liviano', rolTxt: 'asalto', nivel: 1, atrib: [6, 6, 10, 8, 3],
    equipo: ['Cuchilla del frigorífico', 'Chaleco de cuero', 'Zapatillas de lona'],
    habilidades: ['Golpe que sangra', 'Sal en la herida'], consumibles: ['Óleo venenoso'],
    estrategia: 'Choque liviano. Abre heridas y vuelve para agrandarlas: crece cuanto más dura la pelea. Frágil y esquivo.'});
  esencial({linea: 'S1', nombre: 'Sanador', rol: 'support', rolTxt: 'apoyo', nivel: 1, atrib: [8, 3, 6, 4, 12],
    equipo: ['Varita de cura', 'Orbe de luz', 'Peto de cuero de lampalagua', 'Botas de caña alta de estanciero'],
    habilidades: ['Sanar', 'Purificar'], consumibles: ['Pergamino de Regeneración menor'],
    estrategia: 'Support. Mantiene vivos a los suyos: cura, limpia estados y estira la pelea. Conviene acompañarlo de un tanque.'});
  esencial({linea: 'W1', nombre: 'Hachero', rol: 'warrior', rolTxt: 'melee', nivel: 1, atrib: [7, 9, 6, 7, 4],   // (2026-11-03, dueño: «fue 9, con 7, agi 6, des 7, esp 4»)
    equipo: ['Hacha', 'Cota de malla de hierro', 'Cofia de anillas sueltas'],
    habilidades: ['Golpe fuerte', 'Romper armadura'], consumibles: ['Pergamino grupal de Furia de Combate'],
    estrategia: 'Warrior. Le rompe la armadura al que más se defiende y después lo castiga. Su punto débil: la magia.'});
  esencial({linea: 'D1', nombre: 'Maldito', rol: 'debuffer', rolTxt: 'debuffer', nivel: 1, atrib: [8, 2, 6, 4, 13],
    equipo: ['Varita del susurro', 'Atrapasueños', 'Casaca curtida de salteador', 'Capucha de lana del culto'],
    habilidades: ['Maldición de la coraza', 'Aguja siniestra'], consumibles: ['Runa de debilidad'],
    estrategia: 'Debuffer. Les baja las defensas a los rivales para que todos los suyos peguen más; la varita no se esquiva y puede silenciar.'});

  esencial({linea: 'R1', nombre: 'Tirador de precisión', rol: 'rango', rolTxt: 'rango', nivel: 1, atrib: [7, 5, 7, 11, 3],   // (aprobado 2026-11-03)
    equipo: ['Arco de la espera', 'Chaleco de cuero', 'Botas de cuero de vaca'],
    habilidades: ['Tiro certero', 'Tiro a la cabeza'], consumibles: ['Flecha perforante'],
    estrategia: 'Francotirador. Se queda lejos, apunta y cada disparo busca el crítico o pasar la armadura; si le llegan encima, se aleja y vuelve a disparar.'});

  if(faltan.length) console.warn('Creeps esenciales: no se encontró', faltan.join(', '));
  window.CREEPS_ESENCIALES_FALTAN = faltan;
})();
