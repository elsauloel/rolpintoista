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
  const ROL_COLOR = {rango: '#3E8E7E', tanque: '#5B7FA6', warrior: '#B34A3A', hibrido: '#A0522D', liviano: '#8B5A2B', mago: '#D9662B', support: '#4CB86A', debuffer: '#7A3E9D'};
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

  // ---- La tanda del 2026-11-03 (nivel 1 aprobado por el dueño; detalle y porqués en docs/creeps-humanoides.md). Atrib: Con · Fue · Agi · Des · Esp.
  // Los de Especial más alto juegan con SP (regla de arriba); los físicos, con turnos de espera.
  esencial({linea: 'T2', nombre: 'Muralla con púas', rol: 'tanque', rolTxt: 'tanque', nivel: 1, atrib: [12, 7, 5, 6, 3],   // nivel 1 rehecho (Agi ≥ 5)
    equipo: ['Hacha con garfio', 'Puerta de granero', 'Coraza de cuero hervido'],
    habilidades: ['Coraza de púas', 'Aguante'], consumibles: ['Poción de Cuero Duro'],
    estrategia: 'Tanque. Castiga al que le pega: púas, aguante y un hachazo con garfio. No persigue: se planta.'});
  esencial({linea: 'M2', nombre: 'Mago de escarcha', rol: 'mago', rolTxt: 'mágico', nivel: 1, atrib: [8, 2, 5, 6, 12],
    equipo: ['Varita de la ventisca', 'Escudo de cuero mojado', 'Capa de viajero', 'Anillo de escarcha'],
    habilidades: ['Dardo helado', 'Hálito polar'], consumibles: ['Poción de SP menor'],
    estrategia: 'Mago de control. No quema: frena. Encierra, empuja, deja el piso congelado y llena de Escarcha al grupo.'});
  esencial({linea: 'M3', nombre: 'Mago del rayo', rol: 'mago', rolTxt: 'mágico', nivel: 1, atrib: [8, 2, 5, 6, 12],
    equipo: ['Varita de chispa eléctrica', 'Escudo de escamas de lagarto', 'Chaleco de cuero', 'Anillo de chispa'],
    habilidades: ['Centella', 'Zap'], consumibles: ['Poción de SP menor'],
    estrategia: 'Mago del rayo. El rayo salta entre los que se juntan y paraliza: corta turnos.'});
  esencial({linea: 'M4', nombre: 'Arcano', rol: 'mago', rolTxt: 'mágico', nivel: 1, atrib: [8, 2, 6, 5, 12],
    equipo: ['Varita del gancho', 'Brújula del baqueano', 'Chaleco de cuero', 'Zapatillas de lona'],
    habilidades: ['Parpadeo', 'Nova arcana'], consumibles: ['Poción de SP menor'],
    estrategia: 'Mago de control y movilidad. Decide dónde está cada uno: aparece, empuja con la Nova, atrae con el gancho y se va.'});
  esencial({linea: 'H1', nombre: 'Embestidor', rol: 'hibrido', rolTxt: 'melee', nivel: 1, atrib: [10, 8, 6, 7, 2],
    equipo: ['Hacha de verdugo de pueblo', 'Chaleco de cuero', 'Anillo de Paso Fantasma'],
    habilidades: ['Carga que derriba', 'Takle'], consumibles: ['Pergamino grupal de Paso Fantasma'],
    estrategia: 'Híbrido. Cruza el campo y se lleva puesto a uno: derriba y empuja, le rompe la línea al grupo y llega a los de atrás.'});
  esencial({linea: 'H2', nombre: 'Saltador', rol: 'hibrido', rolTxt: 'melee', nivel: 1, atrib: [9, 9, 6, 7, 2],
    equipo: ['Hacha de vikingo', 'Rodela tachonada', 'Chaleco de cuero', 'Botas de cuero de vaca'],
    habilidades: ['Salto', 'Golpe fuerte'], consumibles: ['Poción de Cuero Duro'],
    estrategia: 'Híbrido. Salta por encima de la primera línea y cae entre los de atrás; ahí se planta y pega.'});
  esencial({linea: 'W2', nombre: 'Berserker', rol: 'warrior', rolTxt: 'melee', nivel: 1, atrib: [9, 8, 6, 8, 2],   // dos armas (el ataque con la segunda, pendiente de programar en creeps)
    equipo: ['Sable del tahúr', 'Facón de paisano', 'Chaleco de cuero', 'Botas de cuero de vaca'],
    habilidades: ['Golpe desesperado', 'Furia'], consumibles: ['Poción de Regeneración menor'],
    estrategia: 'Warrior. Cuanto más herido, más peligroso: sable y facón, busca el crítico y no se cuida.'});
  esencial({linea: 'L2', nombre: 'Envenenador', rol: 'liviano', rolTxt: 'asalto', nivel: 1, atrib: [7, 5, 9, 10, 2],
    equipo: ['Daga ritual', 'Chaleco de cuero', 'Guantes de agarre'],
    habilidades: ['Estocada', 'Hoja envenenada'], consumibles: ['Óleo venenoso'],
    estrategia: 'Choque liviano. Pega con una daga untada, acumula veneno y se aleja.'});
  esencial({linea: 'L3', nombre: 'Asesino de las sombras', rol: 'liviano', rolTxt: 'asalto', nivel: 1, atrib: [6, 5, 9, 11, 2],
    equipo: ['Punzón de hielo', 'Chaleco de cuero', 'Botas de suela de goma'],
    habilidades: ['Ojo de asesino', 'Bomba de humo'], consumibles: ['Pergamino grupal de Paso Fantasma'],
    estrategia: 'Choque liviano. Desaparece, aparece por la espalda y busca el crítico: va al golpe único.'});
  esencial({linea: 'L4', nombre: 'Hostigador con trampas', rol: 'liviano', rolTxt: 'asalto', nivel: 1, atrib: [7, 6, 8, 10, 2],   // (2026-11-03, dueño: «ya terminamos el L4»)
    equipo: ['Cortaplumas', 'Chaleco de cuero', 'Calzas de cuero flexible'],
    habilidades: ['Cordón oculto', 'Hit and run'], consumibles: ['Red de caza'],
    estrategia: 'Choque liviano. Pica, se va y te hace pisar algo: tiende un cordón, pega y se aleja por arriba; el que lo persigue tropieza.'});
  esencial({linea: 'R2', nombre: 'Hostigador a distancia', rol: 'rango', rolTxt: 'rango', nivel: 1, atrib: [7, 5, 9, 10, 2],
    equipo: ['Arco de tiro ligero', 'Chaleco de cuero', 'Escarpines de fieltro'],
    habilidades: ['Tiro certero', 'Disparo y repliegue'], consumibles: ['Flecha silbadora'],
    estrategia: 'Rango. Se reacomoda y dispara: nunca está donde lo dejaste. Hay que ir a buscarlo.'});
  esencial({linea: 'S2', nombre: 'Abanderado', rol: 'support', rolTxt: 'apoyo', nivel: 1, atrib: [10, 7, 6, 7, 3],
    equipo: ['Lanza corta', 'Estandarte del muro', 'Chaleco de cuero', 'Botas de caña alta de estanciero'],
    habilidades: ['Potencia', '¡A la carga!'], consumibles: ['Pergamino grupal de Furia de Combate'],
    estrategia: 'Support. El soldado de la bandera: no cura, hace pegar más a los suyos y pelea con lanza al lado del grupo.'});
  esencial({linea: 'S3', nombre: 'Armero', rol: 'support', rolTxt: 'apoyo', nivel: 1, atrib: [10, 8, 6, 6, 3],
    equipo: ['Hacha del herrero de pueblo', 'Chaleco de cuero', 'Cofia de anillas sueltas'],
    habilidades: ['Bendecir el arma', 'Arma elemental'], consumibles: ['Pergamino grupal de Furia de Combate'],
    estrategia: 'Support. El herrero del grupo: les mejora las armas a los suyos (bendición, elemento) y pelea al lado.'});
  esencial({linea: 'S4', nombre: 'Protector', rol: 'support', rolTxt: 'apoyo', nivel: 1, atrib: [9, 2, 6, 4, 12],
    equipo: ['Varita de los pilares', 'Escudo de madera forrado en lienzo', 'Chaleco de cuero', 'Escarpines de piel de cururú'],
    habilidades: ['Potencia', 'Arrojo'], consumibles: ['Poción de HP'],
    estrategia: 'Support. Juega en el turno de los demás: escudo y +3 a la defensa en el momento justo; con los pilares tapa al que dispara.'});
  esencial({linea: 'D2', nombre: 'Tóxico', rol: 'debuffer', rolTxt: 'debuffer', nivel: 1, atrib: [8, 2, 6, 5, 12],
    equipo: ['Varita de miasma', 'Piedra bezoar', 'Chaleco de cuero', 'Escarpines de piel de cururú'],
    habilidades: ['Espina tóxica', 'Nube tóxica'], consumibles: ['Polvo de adormidera'],
    estrategia: 'Debuffer. Envenena el aire: el grupo se tiene que mover o se pudre adentro.'});
  esencial({linea: 'D3', nombre: 'Ladrón de fuerzas', rol: 'debuffer', rolTxt: 'debuffer', nivel: 1, atrib: [8, 2, 7, 4, 12],
    equipo: ['Varita arcana', 'Grimorio gastado', 'Chaleco de cuero', 'Vincha de cuero de mula ánima'],
    habilidades: ['Escalofrío', 'Robar el aliento'], consumibles: ['Gas adormecedor'],
    estrategia: 'Debuffer. Le saca al rival lo que necesita para pelear (nitros, puntería) y se queda con parte.'});
  esencial({linea: 'D4', nombre: 'Control mental y ceguera', rol: 'debuffer', rolTxt: 'debuffer', nivel: 1, atrib: [9, 2, 6, 4, 12],
    equipo: ['Varita del destello', 'Botella con un diablito', 'Chaleco de cuero', 'Capucha de lana del culto'],
    habilidades: ['Punzada mental', 'Cegar'], consumibles: ['Polvo de adormidera'],
    estrategia: 'Debuffer. Te saca el control: te ciega, te abre la mente y te confunde. Con daño, para que no lo ignoren.'});

  esencial({linea: 'T3', nombre: 'Guardaespaldas', rol: 'tanque', rolTxt: 'tanque', nivel: 1, atrib: [12, 5, 6, 7, 3],   // (2026-11-03, dueño: «me gusta, sí»)
    equipo: ['Espada del comisario', 'Escudo de hierro macizo', 'Coraza de cuero hervido', 'Capucha de lana del culto'],
    habilidades: ['Provocar', 'Escudo humano'], consumibles: ['Poción de Cuero Duro'],
    estrategia: 'Tanque. Cuida a los suyos: marca a un protegido y se come la mitad de lo que le pegan; provoca al que va por él.'});
  esencial({linea: 'L5', nombre: 'Duelista', rol: 'liviano', rolTxt: 'asalto', nivel: 1, atrib: [7, 5, 8, 11, 2],   // (2026-11-03, dueño: «me parece bien»)
    equipo: ['Sable del club de barrio', 'Broquel de esgrima', 'Chaleco de cuero', 'Escarpines de fieltro'],
    habilidades: ['Finta', 'Golpe a la rodilla'], consumibles: ['Óleo venenoso'],
    estrategia: 'Choque liviano. El esgrimista del mano a mano: lo frena con la rodilla, lo apura con Fintas que no se paran y ataja todo.'});

  esencial({linea: 'W3', nombre: 'Martillero', rol: 'warrior', rolTxt: 'melee', nivel: 1, atrib: [8, 10, 6, 7, 2],   // (2026-11-03, dueño: «sí»)
    equipo: ['Martillo del herrero de pueblo', 'Escudo de cuero endurecido', 'Chaleco de cuero', 'Botas de cuero de vaca'],
    habilidades: ['Puño de roca', 'Pisotón'], consumibles: ['Pergamino grupal de Furia de Combate'],
    estrategia: 'Warrior. Golpes que atontan y derriban: te deja sin turno con Demora y Pajaritos; si lo rodean, Pisotón.'});

  esencial({linea: 'R3', nombre: 'Trabador', rol: 'rango', rolTxt: 'rango', nivel: 1, atrib: [8, 6, 6, 11, 2],   // (2026-11-03, dueño: «vamos a probarlo con la ballesta»)
    equipo: ['Ballesta del baqueano', 'Chaleco de cuero', 'Botas de cuero de vaca'],
    habilidades: ['Tiro certero', 'Tiro a la rodilla'], consumibles: ['Virote de red'],
    estrategia: 'Rango. Frena y clava: no busca matar, busca que no te muevas; te deja rengo para que sus aliados te alcancen.'});

  if(faltan.length) console.warn('Creeps esenciales: no se encontró', faltan.join(', '));
  window.CREEPS_ESENCIALES_FALTAN = faltan;
})();
