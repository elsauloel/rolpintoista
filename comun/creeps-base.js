/* Catálogo base de creeps por ESCENARIO (auditar todos: son un primer borrador).
   Cuatro escenarios × niveles 1 a 5 × 3 creeps = 60, más la tribu de goblins del bosque (10) 20 DEBUFFERS (uno por escenario y nivel) y 30 HUMANOS de seis facciones con equipo del catálogo (cada uno con nombre propio inspirado en el creep que lo lleva). Todos traen sus recompensas: tipo de criatura, jefe, oro base, arma natural y trofeo (los que tienen arma natural sueltan un trofeo en vez del arma). Cada uno trae dos habilidades:
   una RÁPIDA (cooldown 2) y una LENTA (cooldown 3 a 6, según lo poderosa) que arranca el
   combate con el cooldown ya activo (cdArranca). Lo que se puede automatizar en un creep va
   automatizado: costo en No2 (o "lo de un ataque"), tirada de daño, estados con bonos a sí
   mismo (Defensa, Dmg, No2, Evasión, Res.Mg) y cura de HP. Lo que le pasa a otros (empujar,
   Pajaritos, perder No2…) queda escrito en la descripción para resolverlo a mano.
   Se ofrece en gm-tools ("+ Creep" → biblioteca) junto con lo que apruebe el dueño del
   proyecto; ver comun/biblioteca.js (opción `base`).

   Cuenta de atributos: 33 + 3 por nivel sobre 1 (igual que el presupuesto de gm-tools), repartidos
   según el rol; HP = Con × 5. */

(function(){
  const COLOR = {minas: '#B87333', bosque: '#3E9B5B', montañas: '#6F8FAF', templo: '#9B5FD0',
    bandidos: '#8B5A2B', 'bárbaros': '#B34A3A', 'guardia de la ciudad': '#5B7FA6', 'piratas espaciales': '#2E8B8B', cultistas: '#7A3E9D', mercenarios: '#A08A45'};
  const ESCENARIO_TXT = {minas: 'minas', bosque: 'bosque', montañas: 'montañas', templo: 'templo alienígena'};
  // Reparto de atributos por rol: [Con, Fue, Agi, Des, Esp]
  const PESOS = {
    brutal: [.26, .30, .14, .16, .14], tanque: [.36, .26, .10, .12, .16], rapido: [.16, .18, .30, .24, .12],
    rango: [.18, .10, .24, .32, .16], mago: [.20, .08, .16, .16, .40], apoyo: [.24, .10, .16, .14, .36],
    debuffer: [.22, .08, .18, .14, .38],
  };
  const ROL_TXT = {brutal: 'melee', tanque: 'tanque', rapido: 'asalto', rango: 'rango', mago: 'mágico', apoyo: 'apoyo', debuffer: 'debuffer'};
  const TIPO_ARMA = [4, 6, 6, 8, 10];   // por nivel 1..5
  const PESO_ARMA = [1, 1, 2, 2, 2];

  function repartir(total, pesos){
    const v = pesos.map(p => Math.max(1, Math.floor(total * p)));
    let resto = total - v.reduce((a, b) => a + b, 0);
    const orden = pesos.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]).map(x => x[1]);
    for(let k = 0; resto > 0; k++, resto--) v[orden[k % orden.length]]++;
    return v;
  }
  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ---- habilidades (se resuelven con el nivel del creep) ----
  const at = (nombre, detalle, dano) => ({nombre, detalle, no2: 'ATAQUE', dano});            // ataque: cuesta lo de un ataque
  const zo = (nombre, detalle, no2, dano) => ({nombre, detalle, no2, dano});                  // especial con tirada de daño
  const ta = (nombre, detalle, no2) => ({nombre, detalle, no2});                                // solo anuncio (efectos a mano)
  const bu = (nombre, detalle, no2, mods, turnos) => ({nombre, detalle, no2, efecto: {mods, turnos}});   // estado sobre sí mismo
  const cu = (nombre, detalle, no2, k) => ({nombre, detalle, no2, cura: k});
  const es = (nombre, detalle, no2, estado, polaridad, turnos, extra) => ({nombre, detalle, no2, efecto: {mods: (extra && extra.mods) || {}, turnos, nombre: estado, polaridad, hp: (extra && extra.hp) || 0}});   // estado del juego sobre sí mismo (Sigilo, Invulnerable…)
  const tr = (nombre, detalle, no2, codigo) => ({nombre, detalle, no2, trampa: codigo});
  const ts = (nombre, detalle, no2) => ({nombre, detalle, no2, colocar: true});   // trampa sin daño (alarma, red…)   // trampa: {T} en la descripción = su daño según el nivel
  const mecEtiquetas = (...sps) => { const t = []; sps.forEach(x => { if(x.trampa || /trampa/i.test(x.detalle)) t.push('trampas'); if(x.efecto && x.efecto.nombre === 'Sigilo') t.push('sigilo'); }); return [...new Set(t)]; };
  const dc = (nombre, detalle, no2, dano, k) => ({nombre, detalle, no2, dano, cura: k});   // tira daño y se cura k × nivel                  // cura k × nivel

  function danoTxt(d, n){ return d === 'L' ? `1d6+${n}` : d === 'M' ? `2d6+${n}` : `3d6+${n + 1}`; }
  const MOD_TXT = {def: 'Defensa', dmg: 'Daño', nitros: 'No2', eva: 'Evasión', resmg: 'Res.Mg', resm: 'Res.Mt'};
  // Frases de la descripción que la herramienta NO resuelve sola (efectos sobre otros, movimiento, geometría del área).
  const MANUAL_RE = /a mano|casilla|flor de|cono|línea|empuj|salta|se mueve|ignora|todos|adyacent|aliado|el objetivo|los golpeados|los afectados|los que|quedan|queda /i;
  const sinEtiqueta = t => t.replace(/\s*\(a mano\)/g, '').replace(/\(a mano,\s*/g, '(').replace(/,\s*a mano\)/g, ')').replace(/\s+/g, ' ').trim();
  // La descripción queda lista para usar: qué hace, qué está automatizado (con los números) y qué se resuelve a mano.
  // {T} en la descripción = el daño de la trampa según el nivel.
  const textoHab = (sp, n) => sp.detalle.replace(/\{T\}/g, sp.trampa ? danoTxt(sp.trampa, n) : '');
  // Opciones de la trampa que coloca la habilidad, deducidas de la descripción: área "flor de 1" y cuántas pone.
  const opcionesTrampa = sp => ({
    radio: /flor de 1/i.test(sp.detalle) ? 1 : 0,
    cant: /3 minas|3 trampas/i.test(sp.detalle) ? 3 : /dos trampas|2 trampas/i.test(sp.detalle) ? 2 : 1,
  });
  /* Estados que la habilidad (o la trampa) deja sobre OTRO, con el nombre de la habilidad como clave.
     A('Veneno') usa el preset; A('Debilitado', 3, {dmg: -2}) es un estado propio de 3 turnos; el 4º valor son HP por turno.
     Al usar la habilidad, gm-tools deja elegir a quién le pegó y se lo aplica solo; una trampa se lo aplica a quien la pisa. */
  const A = (nombre, turnos, mods, hp) => {
    const o = {nombre};
    if(turnos !== undefined) o.turnos = turnos;
    if(mods && Object.keys(mods).length) o.mods = Object.keys(mods).map(stat => ({stat, val: mods[stat]}));
    if(hp) o.hp = hp;
    return o;
  };
  const APLICA = {
    'Debilitar': A('Debilitado', 3, {dmg: -2}), 'Maldición': A('Maldito', 3, {resmg: -2, def: -1}), 'Ceguera': A('Cegado', 2, {eva: -3}),
    'Ralentizar': A('Ralentizado', 1, {nitros: -2}), 'Intimidar': A('Intimidado', 2, {dmg: -1}), 'Romper armadura': A('Armadura dañada', 3, {def: -2}),
    'Veneno': A('Veneno'), 'Pudrición': A('Podrido', 3, {def: -2, dmg: -1}), 'Susurros': A('Susurros', 3, {resm: -2}),
    'Drenar energía': A('Drenado', 1, {nitros: -2}), 'Red': A('Inmovilizado', 1), 'Trampa de raíces': A('Inmovilizado', 2),
    'Hechizo de lentitud': A('Lentitud', 2, {nitros: -1}), 'Quemadura': A('Quemado', 2, {}, -2), 'Escarcha': A('Escarcha', 1, {nitros: -2}),
    'Oxidar': A('Oxidado', 3, {dmg: -2}), 'Desmoralizar': A('Desmoralizado', 2, {resm: -2, dmg: -1}), 'Polvo revelador': A('Cegado', 2, {eva: -2}),
    'Escupitajo ácido': A('Corroído', 2, {def: -1}), 'Lanza de hielo': A('Escarcha', 1, {nitros: -1}), 'Descarga eléctrica': A('Descarga', 1, {nitros: -1}),
    'Golpe de escudo': A('Golpe de escudo', 1, {nitros: -1}), 'Dardo venenoso': A('Veneno'), 'Mordisco venenoso': A('Veneno'),
    'Corte profundo': A('Sangrado'), 'Zarpazo desgarrador': A('Sangrado'), 'Golpe que sangra': A('Sangrado'), 'Herida sangrante': A('Sangrado'),
    'Sembrar veneno': A('Veneno'), 'Aturdir con estruendo': A('Stun'), 'Aturdir': A('Stun'), 'Congelar': A('Stun'), 'Hipnosis': A('Stun', 1),
    'Agotar': A('Exhausto'), 'Cansar': A('Cansado'), 'Lisiar': A('Lisiado'), 'Clavar al suelo': A('Inmovilizado'), 'Romper la rodilla': A('Rengo'),
    'Mordisco que lisia': A('Rengo'), 'Disparo a la rodilla': A('Rengo'), 'Nublar la mente': A('Pajaritos'), 'Golpe atontador': A('Pajaritos'),
    'Golpe de pomo': A('Pajaritos', 1), 'Corroer el metal': A('Armadura rota'), 'Disolver la armadura': A('Armadura rota'), 'Toxina severa': A('Veneno severo'),
    // trampas
    'Cepo': A('Inmovilizado', 2), 'Trampa de veneno': A('Veneno'), 'Trampa de hielo': A('Escarcha', 1, {nitros: -1}), 'Trampa de red': A('Inmovilizado', 1),
    'Trampa sonora': A('Pajaritos', 1), 'Cepo de alma': A('Drenado', 1, {nitros: -2}), 'Trampa de ácido': A('Corroído', 3, {def: -1}),
    'Zarzal traicionero': A('Rengo'), 'Telaraña oculta': A('Inmovilizado', 1), 'Descarga oculta': A('Descarga', 1, {nitros: -1}), 'Trampa de humo': A('Cegado', 2, {eva: -2}),
    // trampas de creeps concretos
    'Cepo del emboscado': A('Inmovilizado', 2), 'Lazo de caza': A('Rengo'), 'Cepo de dientes': A('Rengo'), 'Cepo en el camino': A('Inmovilizado', 2),
    'Trampa de dardos envenenados': A('Veneno'), 'Red de cazador': A('Inmovilizado', 1),
  };
  const aplicaDe = sp => sp.aplica || APLICA[sp.nombre] || null;
  // Frases de la descripción: las que se resuelven solas y las que quedan a mano. Con un estado automático sobre otro (o una
  // trampa que se coloca sola) solo queda a mano lo que la descripción marca con "(a mano)" y sea movimiento, área o algo que el
  // programa no maneja; el "(a mano)" de un estado que ahora se aplica solo se descarta.
  function frasesDe(sp, n){
    const ap = aplicaDe(sp), solo = !!ap || sp.trampa !== undefined || !!sp.colocar;
    const REAL = /empuj|casillero|salta|se aleja|al piso|derrib|huye|sigilo|revela|repite|suelta|roba|no puede|invoc|entran|llegan|jala|arrastr|vuelve|gana|ganan|sube|baja/i;
    let frases = textoHab(sp, n).split(/(?<=[.!?])\s+/);
    if(ap) frases = frases.map(f => REAL.test(f) ? f : f.replace(/\s*\(a mano\)/g, '').replace(/\(a mano,\s*/g, '(').replace(/,\s*a mano\)/g, ')')).map(f => f.replace(/(A|a)plic[aá]le/g, (m, c) => c + 'plica'));
    const esManual = f => solo ? /a mano/i.test(f) : MANUAL_RE.test(f);
    return {propias: frases.filter(f => !esManual(f)).map(sinEtiqueta), manual: frases.filter(f => esManual(f)).map(sinEtiqueta)};
  }
  const hayManual = sp => frasesDe(sp, 1).manual.length > 0;
  const textoAplica = ap => {
    const mods = (ap.mods || []).map(m => `${m.val > 0 ? '+' : ''}${m.val} ${MOD_TXT[m.stat] || m.stat}`);
    const extra = [ap.turnos ? `${ap.turnos} turno${ap.turnos === 1 ? '' : 's'}` : '', ...mods, ap.hp ? `${ap.hp > 0 ? '+' : ''}${ap.hp} HP por turno` : ''].filter(Boolean);
    return ap.nombre + (extra.length ? ` (${extra.join(', ')})` : '');
  };
  function armarDetalle(sp, n, cd, lenta){
    const auto = [sp.no2 === 'ATAQUE' ? 'cuesta lo mismo que un ataque y cuenta como uno' : `cuesta ${sp.no2} No2`,
      `cooldown ${cd}${lenta ? ' (habilidad lenta: el combate arranca con el cooldown activo)' : ''}`];
    if(sp.dano) auto.push(`tira ${danoTxt(sp.dano, n)} de daño`);
    if(sp.cura) auto.push(`se cura ${sp.cura * n} HP sin pasar de su máximo`);
    if(sp.efecto){
      const ef = sp.efecto, mods = ef.mods || {};
      const m = Object.keys(mods).map(k => `${mods[k] > 0 ? '+' : ''}${mods[k]} ${MOD_TXT[k] || k}`).join(', ');
      const dur = ef.turnos ? ` durante ${ef.turnos} turno${ef.turnos === 1 ? '' : 's'}` : ' hasta que se lo saquen';
      const hp = ef.hp ? `; ${ef.hp > 0 ? 'recupera' : 'pierde'} ${Math.abs(ef.hp)} HP por turno` : '';
      auto.push(ef.nombre ? `queda con el estado ${ef.nombre}${m ? ' (' + m + ')' : ''}${dur}${hp}` : `se aplica a sí mismo ${m}${dur}`);
    }
    if(sp.trampa !== undefined || sp.colocar){
      const o = opcionesTrampa(sp);
      auto.push(`al usarla, coloca sola ${o.cant > 1 ? o.cant + ' trampas ocultas' : 'la trampa oculta'} al lado de su token en el mapa que ve el GM${o.radio ? ' (área: flor de ' + o.radio + ')' : ''}${sp.trampa ? `; cuando alguien la pisa, el mapa tira ${danoTxt(sp.trampa, n)} y se lo aplica solo` : ''}; los jugadores no la ven hasta que se dispara y la habilidad no se anuncia en la Mesa`);
    }
    const ap = aplicaDe(sp);
    if(ap){
      const trampa = sp.trampa !== undefined || sp.colocar;
      auto.push(trampa ? `cuando alguien pisa la trampa, le aplica solo el estado ${textoAplica(ap)}` : `al usarla te deja elegir a quién le pegó (o "nadie" si falló) y le aplica solo el estado ${textoAplica(ap)} (si es un personaje, su ficha lo recibe sola)`);
    }
    const cierra = t => /[.!?]$/.test(t) ? t : t + '.';
    const {propias, manual} = frasesDe(sp, n);
    return `${propias.length ? propias.map(cierra).join(' ') + ' ' : ''}⚙ Automatizado: ${auto.join('; ')}. ✋ A mano: ${manual.length ? manual.map(cierra).join(' ') : 'nada, todo está automatizado.'}`;
  }
  // ¿La habilidad pega con magia (PdG.Mg) o con el cuerpo (PdG)? sp.magico lo dice si se sabe (rol mágico de la biblioteca de
  // skills de creep); si no, se adivina por palabras del nombre y la descripción. Es solo el punto de partida: se edita.
  const MAGICA_RE = /m[aá]gic|hechiz|arcan|conjur|rel[aá]mpago|rayo|bola de fuego|llamarada|escarcha|hielo|descarga el[eé]ctrica|misil|maldici|sagrad|espectral|ps[ií]quic|[ií]gne|flama|fuego/i;
  const esHabMagica = (nombre, detalle) => MAGICA_RE.test(String(nombre || '') + ' ' + String(detalle || ''));
  function armarHab(sp, n, cd, lenta){
    const h = {nombre: sp.nombre, detalle: armarDetalle(sp, n, cd, lenta), cd, cdActual: lenta ? cd : 0, costo: '', nitrosCosto: sp.no2};
    if(lenta) h.cdArranca = true;
    // Con daño: Ejecutar tira primero la probabilidad de golpe (PdG o PdG.Mg) y el daño queda para el botón 🎲 aparte (2026-09-24).
    if(sp.dano){
      h.tiradaExtra = danoTxt(sp.dano, n);
      h.tiradaStat = (sp.magico !== undefined ? sp.magico : esHabMagica(sp.nombre, sp.detalle)) ? 'pdgmg' : 'pdg';
    }
    if(sp.cura) h.curaHp = sp.cura * n;
    if(sp.trampa !== undefined || sp.colocar){
      const o = opcionesTrampa(sp);
      h.trampaColocar = {nombre: sp.nombre, detalle: sinEtiqueta(textoHab(sp, n)).slice(0, 200), dano: sp.trampa ? danoTxt(sp.trampa, n) : '', radio: o.radio, cant: o.cant};
      if(aplicaDe(sp)) h.trampaColocar.estado = aplicaDe(sp);
    }else if(aplicaDe(sp)){
      h.estadoObjetivo = aplicaDe(sp);   // gm-tools deja elegir a quién le pegó y se lo aplica
    }
    if(sp.efecto){
      h.efectoNombre = sp.efecto.nombre || sp.nombre; h.efectoTurnos = sp.efecto.turnos; h.efectoStacks = 1; h.efectoPolaridad = sp.efecto.polaridad || 'buff';
      if(sp.efecto.hp) h.efectoHpTurno = sp.efecto.hp;
      h.efectoDetalle = sinEtiqueta(textoHab(sp, n));
      h.efectoMods = Object.keys(sp.efecto.mods || {}).map(stat => ({stat, val: sp.efecto.mods[stat]}));
    }
    return h;
  }

  /* ---- Recompensas (oro, arma natural, trofeo) ---- */
  // Jefes: dejan el doble de oro y de trofeo.
  const JEFES = new Set(['Reina de los kobolds', 'Rey de la tribu goblin', 'Sumo Sacerdote del Vacío', 'Reina de las hadas oscuras',
    'Gigante de escarcha', 'Dragón de ceniza joven', 'Titán de granito', 'Hidra de zarzas', 'Avatar de la Estrella Negra', 'Ent ancestral',
    'Coloso de mineral', 'Jefe de la banda', 'Jefe de guerra bárbaro', 'Capitán de la guardia', 'Capitán pirata', 'Sumo profeta del culto',
    'Cazarrecompensas legendario', 'Patriarca cabruno']);
  // Armas que aunque el creep sea "natural" son un objeto (se sueltan como ítem).
  const ARMAS_OBJETO = new Set(['Alabarda de granito', 'Lanza de obsidiana', 'Ballesta fantasma', 'Báculo de luz']);
  const TIPOS_NATURALES = new Set(['bestia', 'planta', 'elemental', 'alienígena', 'constructo', 'no-muerto']);
  // Nombre del trofeo de cada creep con arma natural (el valor sale solo del nivel: 16/30/50/75/110, jefes el doble).
  const TROFEOS = {
    'Rata de socavón': 'Dientes de rata de socavón', 'Luciérnaga de gas': 'Glándula de metano', 'Topo excavador': 'Garra de topo excavador',
    'Escarabajo de cobre': 'Mandíbula de escarabajo de cobre', 'Araña de cavernas': 'Colmillo de araña de cavernas', 'Gusano de roca': 'Diente de gusano de roca',
    'Devorador de vetas': 'Diente de diamante', 'Lobo gris': 'Colmillo de lobo gris', 'Jabalí colmilludo': 'Colmillo de jabalí', 'Sapo venenoso': 'Lengua de sapo venenoso',
    'Oso pardo furioso': 'Zarpa de oso pardo', 'Huargo alfa': 'Colmillo de huargo alfa', 'Hidra de zarzas': 'Cabeza espinosa de hidra', 'Cabra montés': 'Cuerno de cabra montés',
    'Águila de risco': 'Garra de águila de risco', 'Yeti joven': 'Garra helada de yeti', 'Arpía de tormenta': 'Garra eléctrica de arpía', 'Wyvern joven': 'Aguijón de wyvern',
    'Dragón de ceniza joven': 'Escama de ceniza', 'Cuervo de mal agüero': 'Pico de cuervo de mal agüero', 'Arpía cantora': 'Garra de arpía cantora',
    'Musgo carnívoro': 'Zarcillo de musgo carnívoro', 'Ent joven': 'Astilla de ent joven', 'Ent ancestral': 'Rama de ent ancestral', 'Hongo de galería': 'Sombrero de hongo de galería',
    'Reina de las esporas': 'Corona de micelio', 'Enredadera parasitaria': 'Zarcillo parasitario',
    'Vigía de cristal': 'Esquirla de cristal del vigía', 'Nube de sílice': 'Puñado de sílice', 'Espectro de la ventisca': 'Copo de escarcha eterna',
    'Enjambre de esporas': 'Saco de esporas alienígenas', 'Cría rasgadora': 'Garra quitinosa de cría', 'Pulpo de vacío': 'Tentáculo de pulpo de vacío',
    'Devorador de mentes': 'Tentáculo de devorador de mentes', 'Avatar de la Estrella Negra': 'Fragmento de la Estrella Negra', 'Abominación fusionada': 'Extremidad de abominación',
    'Larva psíquica': 'Mandíbula translúcida de larva', 'Parásito de aura': 'Tentáculo de parásito de aura', 'Ojo flotante del templo': 'Iris del templo', 'Oráculo disonante': 'Eco cristalizado del oráculo',
    'Golem de escoria': 'Puño de escoria fría', 'Coloso de mineral': 'Fragmento de mineral del coloso', 'Ídolo parpadeante': 'Astilla de ídolo parpadeante', 'Roca viva': 'Trozo de roca viva',
    'Titán de granito': 'Núcleo de granito del titán', 'Golem de meteorito': 'Puño de meteorito', 'Centinela biomecánico': 'Núcleo de plasma del centinela',
    'Espectro del capataz': 'Jirón helado del capataz', 'Espíritu del bosque podrido': 'Raíz del bosque podrido', 'Wendigo del paso': 'Garra de wendigo',
  };
  // Oro base: humanos 15/40/75/120/175 (5n²+10n); humanoides la mitad a múltiplos de 5; jefes el doble; el resto 0.
  function oroBase(tipo, n, jefe){
    const humano = 5 * n * n + 10 * n;
    const v = tipo === 'humano' ? humano : tipo === 'humanoide' ? Math.floor(humano / 2 / 5 + 0.5) * 5 : 0;
    return jefe ? v * 2 : v;
  }
  function recompensas(nombre, n, tipo, arma){
    const jefe = JEFES.has(nombre);
    const natural = TIPOS_NATURALES.has(tipo) && !ARMAS_OBJETO.has(arma);
    return {tipoCriatura: tipo, tipoCriaturaOtro: '', jefe, oroBase: oroBase(tipo, n, jefe), armaNatural: natural,
      trofeoEspecial: {nombre: natural ? (TROFEOS[nombre] || '') : '', precio: 0}};
  }

  const lista = [];
  function cr(esc, n, nombre, rol, tipo, arma, rapida, lenta, notas, extras){
    const total = 33 + 3 * (n - 1);
    const [con, fue, agl, des, esp] = repartir(total, PESOS[rol]);
    const rango = rol === 'rango' || rol === 'mago';
    const hpMax = con * 5;
    const defensa = rol === 'tanque' ? 3 + n : rol === 'brutal' ? 1 + Math.floor(n / 2) : rol === 'rapido' ? Math.floor(n / 2) : rol === 'apoyo' ? 1 : rol === 'rango' ? 1 : 0;
    const [spL, cdL] = lenta;
    const datos = {
      nombre: nombre + ' (auditar)', nivel: n, color: COLOR[esc], hp: hpMax, hpMax, spd: 5, ataquesTurno: 0,
      con, fue, agl, des, esp,
      armaTipo: TIPO_ARMA[n - 1], armaPeso: PESO_ARMA[n - 1], armaFijo: Math.floor(n / 2), armaAmplificado: 0,
      armaDeRango: rango, armaNombre: arma, armaDetalle: '', armaMods: [], armaEfectos: [], armaManos: 'arma_1m',
      defensa, armaduraTipo: '', equipo: [], crit: [0, 0, 0, 0, 0],
      habilidades: [armarHab(rapida, n, 2, false), armarHab(spL, n, cdL, true)],
      estados: [], notas: notas || '', escalaTipos: 2, imagen: '',
      ...recompensas(nombre, n, tipo, arma),
    };
    lista.push({
      poolId: 'creep-' + esc + '-' + n + '-' + slug(nombre), nombre: nombre + ' (auditar)', nivel: n,
      etiquetas: [ESCENARIO_TXT[esc], 'nivel ' + n, ROL_TXT[rol], tipo, ...(extras || []), ...mecEtiquetas(rapida, spL), 'auditar'],
      detalle: `${notas || ''} Rápida: ${rapida.nombre}. Lenta: ${spL.nombre} (CD ${cdL}).`.trim(), datos,
    });
  }

  /* ---- Humanos: equipo tomado del catálogo (tabla ITEMS) ---- */
  const ITEMS = {"Punzón del ladronzuelo": {"nombre": "Punzón del ladronzuelo", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [], "detalle": "Arma de una mano, Tipo 4: 1 dado de daño +1 fijo."}, "Sable mellado del camino real": {"nombre": "Sable mellado del camino real", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "ini", "val": 1}], "efectosGolpe": [], "detalle": "iniciativa +1"}, "Casaca curtida de salteador": {"nombre": "Casaca curtida de salteador", "tier": "Común", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 4}, {"stat": "tipo1", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 4: +1. Defensa +4."}, "Ballesta del arbusto": {"nombre": "Ballesta del arbusto", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": true, "mods": [{"stat": "rng", "val": 3}], "efectosGolpe": [], "detalle": "Arma de una mano a distancia, Tipo 6. Rango +3."}, "Capucha de emboscada": {"nombre": "Capucha de emboscada", "tier": "Común", "tipoItem": "cabeza", "tipoDado": 0, "peso": 0, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 2}, {"stat": "tipo1", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 4: +1. Defensa +2."}, "Daga de la viuda verde": {"nombre": "Daga de la viuda verde", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [{"nombre": "Ignora 1 de Res. crítico", "caras": 1, "exitos": 1, "dado": "", "detalle": "Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}], "detalle": "Ignora 1 punto de resistencia al crítico"}, "Chaleco de escamas del envenenador": {"nombre": "Chaleco de escamas del envenenador", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 3}, {"stat": "tipo2", "val": 2}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +2. Resistencia a críticos tipos 8: +1."}, "Espada del Jefe de los Mil Caminos": {"nombre": "Espada del Jefe de los Mil Caminos", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 2}], "efectosGolpe": [], "detalle": "pdg +2"}, "Gambesón de mando del jefe bandido": {"nombre": "Gambesón de mando del jefe bandido", "tier": "Raro", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 3, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 7}, {"stat": "tipo1", "val": 2}, {"stat": "tipo2", "val": 2}, {"stat": "rescc", "val": 2}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipos 4 y 6: +2. Resistencia a CC +2."}, "Honda del cazador de jabalíes": {"nombre": "Honda del cazador de jabalíes", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": true, "mods": [{"stat": "rng", "val": 3}], "efectosGolpe": [], "detalle": "Arma de una mano a distancia, Tipo 4. Rango +3."}, "Hacha del clan": {"nombre": "Hacha del clan", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 8, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [{"nombre": "Rompe armadura", "caras": 1, "exitos": 1, "dado": "", "detalle": "Aplicale el estado Armadura rota al objetivo."}], "detalle": "Rompe armadura."}, "Coraza de cuero del clan": {"nombre": "Coraza de cuero del clan", "tier": "Común", "tipoItem": "armadura_rigida", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 4}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos Tipo 4 y 6"}, "Bastón del trueno": {"nombre": "Bastón del trueno", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 10, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "rng", "val": 1}], "efectosGolpe": [], "detalle": "alcance +1"}, "Túnica de nubarrón": {"nombre": "Túnica de nubarrón", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 0, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 2}, {"stat": "bonos", "val": 2}], "efectosGolpe": [], "detalle": "Bonos +2"}, "Hacha de la furia roja": {"nombre": "Hacha de la furia roja", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 8, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "bloqueo", "val": 1}], "efectosGolpe": [{"nombre": "Rompe armadura", "caras": 1, "exitos": 1, "dado": "", "detalle": "Aplicale el estado Armadura rota al objetivo."}], "detalle": "Rompe armadura. +1 al bloqueo"}, "Pieles del berserker": {"nombre": "Pieles del berserker", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 3}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos Tipo 4 y 6."}, "Hacha del Jefe de Guerra": {"nombre": "Hacha del Jefe de Guerra", "tier": "Raro", "tipoItem": "arma_1m", "tipoDado": 8, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "rng", "val": 1}], "efectosGolpe": [{"nombre": "Rompe armadura", "caras": 1, "exitos": 1, "dado": "", "detalle": "Aplicale el estado Armadura rota al objetivo."}], "detalle": "alcance +1. Rompe armadura. "}, "Cota de escamas del jefe de guerra": {"nombre": "Cota de escamas del jefe de guerra", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 3}, {"stat": "tipo2", "val": 2}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +2. Resistencia a críticos tipos 8: +1."}, "Espada de recluta de la guardia": {"nombre": "Espada de recluta de la guardia", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [], "detalle": "Arma de una mano, Tipo 6: 2 dados de daño."}, "Lanza de guardia de puerta": {"nombre": "Lanza de guardia de puerta", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "rng", "val": 1}], "efectosGolpe": [], "detalle": "alcance +1"}, "Coraza de puerta": {"nombre": "Coraza de puerta", "tier": "Común", "tipoItem": "armadura_rigida", "tipoDado": 0, "peso": 4, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 7}, {"stat": "eva", "val": -1}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 4 y 6: +1. evasión -1"}, "Ballesta de almenara": {"nombre": "Ballesta de almenara", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": true, "mods": [{"stat": "rng", "val": 3}], "efectosGolpe": [], "detalle": "Arma de una mano a distancia, Tipo 6. Rango +3."}, "Casco de muralla": {"nombre": "Casco de muralla", "tier": "Común", "tipoItem": "cabeza", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 3}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +1."}, "Sable del sargento": {"nombre": "Sable del sargento", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 1}], "efectosGolpe": [], "detalle": "pdg +1"}, "Media armadura de sargento": {"nombre": "Media armadura de sargento", "tier": "Buena Calidad", "tipoItem": "armadura_rigida", "tipoDado": 0, "peso": 3, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 5}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipos 4, 6 y 8: +1."}, "Sable de mando del capitán": {"nombre": "Sable de mando del capitán", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 1}, {"stat": "parry", "val": 1}], "efectosGolpe": [], "detalle": "pdg +1, parry +1"}, "Coraza del capitán de la ciudad": {"nombre": "Coraza del capitán de la ciudad", "tier": "Raro", "tipoItem": "armadura_rigida", "tipoDado": 0, "peso": 6, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 10}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}, {"stat": "tipo3", "val": 1}, {"stat": "tipo4", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos tipo 4, 6, 8 y 10."}, "Cuchillo del grumete polizón": {"nombre": "Cuchillo del grumete polizón", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [], "detalle": "Arma de una mano, Tipo 4: 1 dado de daño."}, "Sable de abordaje": {"nombre": "Sable de abordaje", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "ini", "val": 1}], "efectosGolpe": [], "detalle": "iniciativa +1"}, "Campera de marinero espacial": {"nombre": "Campera de marinero espacial", "tier": "Común", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 3}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +1."}, "Arcabuz de cubierta": {"nombre": "Arcabuz de cubierta", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": true, "mods": [{"stat": "rng", "val": 3}], "efectosGolpe": [], "detalle": "Arma de una mano a distancia, Tipo 6. Rango +3."}, "Casco de artillero pintado a mano": {"nombre": "Casco de artillero pintado a mano", "tier": "Común", "tipoItem": "cabeza", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 4}, {"stat": "eva", "val": -1}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +1. Evasión -1"}, "Cimitarra del contramaestre": {"nombre": "Cimitarra del contramaestre", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "parry", "val": 2}], "efectosGolpe": [], "detalle": "Parry +2"}, "Cota de malla de contramaestre": {"nombre": "Cota de malla de contramaestre", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 5}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos Tipo 4, 6 y 8."}, "Espada bastarda del Espectro": {"nombre": "Espada bastarda del Espectro", "tier": "Raro", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 2, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "parry", "val": 1}, {"stat": "bloqueo", "val": 1}], "efectosGolpe": [], "detalle": "parry+1, bloqueo+1"}, "Gambesón del capitán del Espectro": {"nombre": "Gambesón del capitán del Espectro", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 4}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos tipo 6"}, "Estileto ritual del acólito": {"nombre": "Estileto ritual del acólito", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "crit", "val": 1}], "efectosGolpe": [], "detalle": "crítico +1"}, "Hoz ceremonial": {"nombre": "Hoz ceremonial", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [{"nombre": "Sangrado", "caras": 2, "exitos": 1, "dado": "", "detalle": "Aplicale Sangrado al objetivo."}], "detalle": "sangrado 50%"}, "Capucha de lana del culto": {"nombre": "Capucha de lana del culto", "tier": "Común", "tipoItem": "cabeza", "tipoDado": 0, "peso": 0, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 1}], "efectosGolpe": [], "detalle": "Defensa +1."}, "Báculo del inquisidor": {"nombre": "Báculo del inquisidor", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 10, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "bloqueo", "val": 1}, {"stat": "rng", "val": 1}], "efectosGolpe": [], "detalle": "alcance +1, bloqueo +1"}, "Pasamontañas de inquisidor": {"nombre": "Pasamontañas de inquisidor", "tier": "Común", "tipoItem": "cabeza", "tipoDado": 0, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 2}, {"stat": "tipo1", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 4: +1."}, "Daga del sacrificio": {"nombre": "Daga del sacrificio", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 4, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 1}], "efectosGolpe": [], "detalle": "pdg +1"}, "Túnica del sacerdote oscuro": {"nombre": "Túnica del sacerdote oscuro", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 0, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 1}], "efectosGolpe": [], "detalle": "Regeneración +2. Cualquier efecto de sanación que ejecute sana +5"}, "Báculo del Sumo Profeta": {"nombre": "Báculo del Sumo Profeta", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 10, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "bloqueo", "val": 1}, {"stat": "rng", "val": 1}], "efectosGolpe": [], "detalle": "alcance +1, bloqueo +1"}, "Capuz del Sumo Profeta": {"nombre": "Capuz del Sumo Profeta", "tier": "Raro", "tipoItem": "cabeza", "tipoDado": 0, "peso": 0, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 2}, {"stat": "esp", "val": 1}, {"stat": "rangocasteo", "val": 1}], "efectosGolpe": [], "detalle": "Especial +1. Rango de casteo +1."}, "Espada de alquiler oxidada": {"nombre": "Espada de alquiler oxidada", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [{"nombre": "Envenenar", "caras": 2, "exitos": 1, "dado": "", "detalle": "Aplicale Veneno al objetivo."}], "detalle": "envenena x 50% de chances"}, "Espada de taberna": {"nombre": "Espada de taberna", "tier": "Común", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 1, "danoAmplificado": 0, "armaDeRango": false, "mods": [], "efectosGolpe": [], "detalle": "Arma de una mano, Tipo 6: 1 dado de daño +1 fijo."}, "Escudo de taberna": {"nombre": "Escudo de taberna", "tier": "Común", "tipoItem": "escudo_1m", "tipoDado": 0, "peso": 4, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 5}, {"stat": "tipo2", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipo 6: +1."}, "Arco del rastreador": {"nombre": "Arco del rastreador", "tier": "Común", "tipoItem": "arma_2m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": true, "mods": [{"stat": "rng", "val": 4}], "efectosGolpe": [], "detalle": "Arma de dos manos a distancia, Tipo 6. Rango +4."}, "Grebas del rastreador": {"nombre": "Grebas del rastreador", "tier": "Buena Calidad", "tipoItem": "piernas", "tipoDado": 0, "peso": 3, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 5}, {"stat": "tipo2", "val": 1}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Resistencia a críticos tipos 6 y 8: +1."}, "Espada del veterano de mil batallas": {"nombre": "Espada del veterano de mil batallas", "tier": "Buena Calidad", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 1, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 2}], "efectosGolpe": [], "detalle": "pdg +2"}, "Escudo abollado del veterano": {"nombre": "Escudo abollado del veterano", "tier": "Buena Calidad", "tipoItem": "escudo_1m", "tipoDado": 0, "peso": 4, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 7}, {"stat": "bloqueo", "val": 2}], "efectosGolpe": [], "detalle": "bloqueo +2"}, "Katana del cazarrecompensas": {"nombre": "Katana del cazarrecompensas", "tier": "Raro", "tipoItem": "arma_1m", "tipoDado": 6, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "pdg", "val": 2}, {"stat": "crit", "val": 1}], "efectosGolpe": [], "detalle": "pdg+2, crítico +1"}, "Cota del cazarrecompensas": {"nombre": "Cota del cazarrecompensas", "tier": "Buena Calidad", "tipoItem": "armadura_blanda", "tipoDado": 0, "peso": 2, "danoFijo": 0, "danoAmplificado": 0, "armaDeRango": false, "mods": [{"stat": "def", "val": 5}, {"stat": "tipo1", "val": 1}, {"stat": "tipo2", "val": 1}, {"stat": "tipo3", "val": 1}], "efectosGolpe": [], "detalle": "Reduce críticos Tipo 4, 6 y 8."}};
  const TIPO_A_CRIT = {tipo1: 0, tipo2: 1, tipo3: 2, tipo4: 3, tipo5: 4};
  function hu(fac, n, nombre, rol, armaN, piezaN, rapida, lenta, notas){
    const [con, fue, agl, des, esp] = repartir(33 + 3 * (n - 1), PESOS[rol]);
    const A = ITEMS[armaN], P = piezaN ? ITEMS[piezaN] : null;
    const defP = P ? P.mods.filter(m => m.stat === 'def').reduce((a, m) => a + m.val, 0) : 0;
    const modsP = P ? P.mods.filter(m => m.stat !== 'def') : [];
    const crit = [0, 0, 0, 0, 0];
    modsP.forEach(m => { if(TIPO_A_CRIT[m.stat] !== undefined) crit[TIPO_A_CRIT[m.stat]] += m.val; });
    const hpMax = con * 5;
    const [spL, cdL] = lenta;
    const datos = {
      nombre: nombre + ' (auditar)', nivel: n, color: COLOR[fac], hp: hpMax, hpMax, spd: 5, ataquesTurno: 0,
      con, fue, agl, des, esp,
      armaTipo: A.tipoDado, armaPeso: A.peso, armaFijo: A.danoFijo, armaAmplificado: A.danoAmplificado,
      armaDeRango: A.armaDeRango, armaNombre: A.nombre, armaDetalle: A.detalle, armaMods: structuredClone(A.mods),
      armaEfectos: structuredClone(A.efectosGolpe), armaManos: A.tipoItem,
      defensa: defP, armaduraTipo: P ? P.nombre : '',
      equipo: P ? [{id: 'eq-' + slug(nombre), nombre: P.nombre, tipoItem: P.tipoItem, def: defP, mods: structuredClone(modsP), detalle: P.detalle}] : [],
      crit,
      habilidades: [armarHab(rapida, n, 2, false), armarHab(spL, n, cdL, true)],
      estados: [], notas: notas || '', escalaTipos: 2, imagen: '',
      ...recompensas(nombre, n, 'humano', A.nombre),
    };
    const equipoTxt = `${A.nombre} (${A.tier})${P ? ' + ' + P.nombre + ' (' + P.tier + ')' : ''}`;
    lista.push({
      poolId: 'creep-' + slug(fac) + '-' + n + '-' + slug(nombre), nombre: nombre + ' (auditar)', nivel: n,
      etiquetas: [fac, 'nivel ' + n, ROL_TXT[rol], 'humano', ...mecEtiquetas(rapida, spL), 'auditar'],
      detalle: `${notas || ''} Equipo: ${equipoTxt}. Rápida: ${rapida.nombre}. Lenta: ${spL.nombre} (CD ${cdL}).`.trim(), datos,
    });
  }

  /* ================= MINAS ================= */
  cr('minas', 1, 'Rata de socavón', 'rapido', 'bestia', 'Dientes de rata',
    at('Mordisco infectado', 'Si golpea, tirá 1d4: con 1 el objetivo queda Envenenado (a mano).', 'L'),
    [ta('Plaga en la galería', 'Chilla y llama a la manada: entran 2 ratas más este turno (a mano).', 2), 3],
    'Roedor enorme de las galerías, ataca en manada.');
  cr('minas', 1, 'Minero poseído', 'brutal', 'humanoide', 'Pico oxidado',
    at('Picada', 'Golpe pesado de pico.', 'M'),
    [bu('Furia del filón', 'Se enfurece: +2 al daño 3 turnos.', 2, {dmg: 2}, 3), 3],
    'Un trabajador que ya no recuerda por qué sigue picando.');
  cr('minas', 1, 'Luciérnaga de gas', 'rango', 'bestia', 'Chispa de metano',
    at('Chispa', 'Chispazo de gas a distancia.', 'L'),
    [ta('Nube de metano', 'Gas en flor de 1: los que lo respiran quedan Pajaritos hasta el final de su turno (a mano).', 2), 4],
    'Insecto que flota entre los túneles y vuelve el aire inflamable.');

  cr('minas', 2, 'Topo excavador', 'rapido', 'bestia', 'Garras de excavación',
    at('Zarpazo desde el suelo', 'Emboscada: si el objetivo no lo vio venir, +2 al PdG (a mano).', 'M'),
    [bu('Túnel', 'Se hunde y reaparece a hasta 6 casillas; +3 Evasión hasta su siguiente turno.', 2, {eva: 3}, 1), 4],
    'Sale del suelo cuando menos se lo espera.');
  cr('minas', 2, 'Kobold dinamitero', 'rango', 'humanoide', 'Cartucho de dinamita',
    at('Cartucho', 'Lanza un cartucho de dinamita.', 'M'),
    [tr('Cartucho enterrado', 'Entierra un cartucho con mecha en una casilla: al pisarlo explota en flor de 1 con {T}.', 3, 'H'), 5],
    'Pequeño, cobarde y con demasiada dinamita.');
  cr('minas', 2, 'Escarabajo de cobre', 'tanque', 'bestia', 'Mandíbulas de cobre',
    bu('Caparazón', '+3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [at('Embestida blindada', 'Carga y golpea; el objetivo queda empujado 1 casilla (a mano).', 'M'), 4],
    'Blindado como una moneda de cobre gigante.');

  cr('minas', 3, 'Golem de escoria', 'tanque', 'constructo', 'Puños de escoria',
    bu('Piel de escoria', 'Endurece: +4 Defensa hasta el final de su próximo turno.', 1, {def: 4}, 2),
    [zo('Estallido de escoria', 'Onda de calor: daño a todos los adyacentes.', 3, 'H'), 5],
    'Restos de fundición que aprendieron a caminar.');
  cr('minas', 3, 'Espectro del capataz', 'mago', 'no-muerto', 'Toque helado',
    ta('Silbato del capataz', 'Ordena "¡a trabajar!": un aliado adyacente gana +2 al daño este turno (a mano).', 1),
    [zo('Látigo espectral', 'Latigazo que drena: daño y el objetivo pierde 1 No2 (a mano).', 3, 'M'), 4],
    'Sigue dando órdenes mucho después de morir.');
  cr('minas', 3, 'Araña de cavernas', 'rango', 'bestia', 'Colmillos',
    at('Escupitajo de seda', 'Ataque a distancia; el objetivo queda Inmovilizado 1 turno si falla Fuerza (a mano).', 'M'),
    [zo('Picadura paralizante', 'Veneno: daño y Stun (sin No2) hasta su próximo turno si falla Res.Mt (a mano).', 3, 'H'), 5],
    'Teje redes en los techos de las cuevas.');

  cr('minas', 4, 'Gusano de roca', 'brutal', 'bestia', 'Boca de piedra',
    at('Embestida perforante', 'Ignora 2 de Defensa del objetivo (a mano).', 'M'),
    [zo('Temblor', 'Sacude el suelo: daño en flor de 2 y los golpeados quedan Sentados (a mano).', 3, 'H'), 5],
    'Devora roca y todo lo que hay adentro.');
  cr('minas', 4, 'Zapador demente', 'rango', 'humanoide', 'Detonador',
    at('Granada', 'Granada de mano.', 'M'),
    [tr('Campo minado', 'Siembra 3 minas en casillas cercanas: cada una hace {T} a quien la pise.', 4, 'M'), 6],
    'Perdió la razón (y varios dedos) entre las cargas.');
  cr('minas', 4, 'Vigía de cristal', 'mago', 'elemental', 'Rayo de cristal',
    at('Refracción', 'Rayo que ignora armadura (a mano).', 'M'),
    [bu('Facetas de cristal', 'Se cubre de cristal: +5 Defensa y +5 Res.Mg 2 turnos.', 2, {def: 5, resmg: 5}, 2), 4],
    'Un cristal de la veta que despertó y vigila la galería.');

  cr('minas', 5, 'Coloso de mineral', 'tanque', 'constructo', 'Martillo de mineral',
    at('Martillazo', 'Golpe demoledor; rompe armadura (aplicar Armadura rota a mano).', 'H'),
    [zo('Derrumbe', 'Provoca un derrumbe en flor de 2: daño enorme y los golpeados quedan Sentados (a mano).', 3, 'H'), 6],
    'Mineral vivo del tamaño de una casa: el jefe de la mina.');
  cr('minas', 5, 'Devorador de vetas', 'rapido', 'bestia', 'Dientes de diamante',
    at('Mordida de diamante', 'Ignora parte de la armadura (a mano).', 'H'),
    [zo('Emboscada de la veta', 'Sale del suelo junto a un objetivo: ataque con +3 PdG y el objetivo pierde 2 No2 (a mano).', 2, 'H'), 5],
    'Se mueve por la roca como un pez por el agua.');
  cr('minas', 5, 'Reina de los kobolds', 'apoyo', 'humanoide', 'Cetro de mina',
    bu('Grito de la reina', 'Ella gana +2 Defensa y +2 al daño; los kobolds aliados también (a mano).', 1, {def: 2, dmg: 2}, 2),
    [cu('Banquete de cristales', 'Se cura tragando cristales de las paredes.', 2, 6), 5],
    'Gobierna cientos de kobolds desde un trono de mineral.');

  /* ================= BOSQUES ================= */
  cr('bosque', 1, 'Lobo gris', 'rapido', 'bestia', 'Colmillos',
    at('Mordisco', 'Si hay otro lobo adyacente al objetivo, +2 al PdG (a mano).', 'L'),
    [bu('Aullido de manada', 'Aúlla: +2 al daño hasta el final de su turno.', 1, {dmg: 2}, 2), 4],
    'Caza en manada: solo es peligroso cuando no está solo.');
  cr('bosque', 1, 'Duende ladrón', 'rapido', 'humanoide', 'Daga mellada',
    at('Puñalada por la espalda', 'Si flanquea al objetivo, +2 de daño (a mano).', 'L'),
    [ta('Manos largas', 'Roba un ítem del cinturón del objetivo (a mano) y se aleja 3 casillas.', 2), 4],
    'Pequeño, rápido y con muy pocos escrúpulos.');
  cr('bosque', 1, 'Musgo carnívoro', 'tanque', 'planta', 'Zarcillos',
    at('Zarcillo agarrador', 'El objetivo queda Inmovilizado si falla Fuerza (a mano).', 'L'),
    [cu('Fotosíntesis voraz', 'Absorbe luz y se cura.', 2, 3), 4],
    'Parece una alfombra de musgo hasta que te pisa.');

  cr('bosque', 2, 'Jabalí colmilludo', 'brutal', 'bestia', 'Colmillos curvos',
    at('Embestida', 'Se mueve 3 casillas en línea recta y ataca con +2 de daño.', 'M'),
    [bu('Furia de jabalí', 'Ignora el dolor: +3 Defensa 2 turnos.', 2, {def: 3}, 2), 4],
    'Enorme, terco y siempre de mal humor.');
  cr('bosque', 2, 'Arquero silvano', 'rango', 'humanoide', 'Arco largo',
    at('Flecha certera', 'Daño de rango, +2 al PdG (a mano).', 'M'),
    [zo('Lluvia de flechas', 'Daño en flor de 1 a distancia.', 3, 'H'), 5],
    'Guardián de los senderos que nadie vio nunca.');
  cr('bosque', 2, 'Sapo venenoso', 'rapido', 'bestia', 'Lengua pegajosa',
    at('Lengüetazo', 'Ataque a distancia corta; el objetivo queda Envenenado (a mano).', 'M'),
    [ta('Nube de esporas ponzoñosas', 'Veneno en flor de 1: los afectados reciben Veneno (1 de daño por turno) durante 3 turnos (a mano).', 2), 4],
    'Colorido, gordo y letal al tacto.');

  cr('bosque', 3, 'Ent joven', 'tanque', 'planta', 'Puño de tronco',
    bu('Corteza', '+4 Defensa 2 turnos.', 1, {def: 4}, 2),
    [zo('Raíces estranguladoras', 'Raíces en flor de 1: daño e Inmovilizados si fallan Fuerza (a mano).', 3, 'H'), 5],
    'Un árbol que se cansó de estar quieto.');
  cr('bosque', 3, 'Bruja del pantano', 'mago', 'humanoide', 'Bastón de espinos',
    at('Maldición de moho', 'Daño mágico; el objetivo queda Pajaritos 1 turno si falla Res.Mt (a mano).', 'M'),
    [zo('Caldero burbujeante', 'Niebla en flor de 2: daño y Envenenado (a mano).', 3, 'H'), 5],
    'Vive en una choza que camina sobre patas de pollo (quizás).');
  cr('bosque', 3, 'Oso pardo furioso', 'brutal', 'bestia', 'Zarpas',
    at('Zarpazo doble', 'Dos ataques seguidos con la mitad del daño cada uno (a mano).', 'M'),
    [zo('Abrazo del oso', 'Agarra: daño enorme y el objetivo queda Inmovilizado hasta que se libere (a mano).', 3, 'H'), 5],
    'Se despertó demasiado temprano del invierno.');

  cr('bosque', 4, 'Druida corrupto', 'apoyo', 'humanoide', 'Vara podrida',
    cu('Savia oscura', 'Se cura con savia corrompida (y a un aliado adyacente, a mano).', 1, 4),
    [zo('Plaga de langostas', 'Enjambre en flor de 2: daño y −2 al PdG hasta su siguiente turno (a mano).', 3, 'H'), 5],
    'Protegía el bosque hasta que el bosque le respondió.');
  cr('bosque', 4, 'Cazador espectral', 'rango', 'no-muerto', 'Ballesta fantasma',
    at('Virote espectral', 'Ignora obstáculos livianos; daño de rango.', 'M'),
    [zo('Marca del cazador', 'Marca a un objetivo: los ataques contra él tienen +3 al PdG hasta su siguiente turno (a mano); tirá el daño ahora.', 2, 'M'), 4],
    'Sigue cazando la misma presa desde hace doscientos años.');
  cr('bosque', 4, 'Huargo alfa', 'brutal', 'bestia', 'Colmillos de alfa',
    at('Mordida desgarradora', 'Sangrado (aplicar a mano).', 'H'),
    [bu('Aullido del alfa', 'Llama a la manada: +3 al daño y +2 No2 hasta el final del turno.', 2, {dmg: 3, nitros: 2}, 1), 5],
    'El lobo más grande de todos los lobos.');

  cr('bosque', 5, 'Ent ancestral', 'tanque', 'planta', 'Rama ancestral',
    bu('Corteza milenaria', '+6 Defensa y +3 Res.Mg 2 turnos.', 1, {def: 6, resmg: 3}, 2),
    [zo('Marea de raíces', 'El suelo se llena de raíces en flor de 3: daño enorme e Inmovilizados (a mano).', 3, 'H'), 6],
    'El árbol más viejo del bosque, y no está contento.');
  cr('bosque', 5, 'Hidra de zarzas', 'brutal', 'bestia', 'Cabezas de espinas',
    at('Mordiscos múltiples', 'Ataca con tres cabezas: tirá el daño 3 veces (a mano).', 'H'),
    [cu('Regeneración de cabezas', 'Le crece una cabeza nueva: se cura.', 2, 8), 5],
    'Cada cabeza cortada se convierte en dos enredaderas.');
  cr('bosque', 5, 'Reina de las hadas oscuras', 'mago', 'humanoide', 'Cetro de escarcha',
    at('Encanto helado', 'Daño mágico; el objetivo pierde 1 No2 (a mano).', 'H'),
    [zo('Baile de las sombras', 'Ilusión en flor de 2: los golpeados atacan a un aliado si fallan Res.Mt (a mano).', 3, 'H'), 6],
    'Belleza cruel: el bosque baila cuando ella lo ordena.');

  /* ---- Tribu de goblins del bosque (2 por nivel; etiquetas 'goblin' y 'tribu goblin') ---- */
  const TG = ['goblin', 'tribu goblin'];
  cr('bosque', 1, 'Goblin recolector', 'rapido', 'humanoide', 'Cuchillo de hongo',
    at('Tajo furtivo', 'Si el objetivo ya fue atacado este turno, +2 al daño (a mano).', 'L'),
    [tr('Trampa de raíces', 'Deja una trampa de raíces en una casilla adyacente: {T} al primero que la pise, que además queda Inmovilizado (a mano).', 2, 'L'), 4],
    'Sale a juntar hongos, ramas y todo lo que no esté clavado.', TG);
  cr('bosque', 1, 'Goblin lancero', 'brutal', 'humanoide', 'Lanza de punta de hueso',
    at('Lanzazo', 'Ataque con lanza; llega a 2 casillas.', 'L'),
    [bu('Grito de la tribu', 'Chilla para darse ánimo: +2 al daño 2 turnos.', 2, {dmg: 2}, 2), 4],
    'Pelea mejor cuando lo miran los demás.', TG);
  cr('bosque', 2, 'Goblin hondero', 'rango', 'humanoide', 'Honda de cuero',
    at('Piedrazo', 'Piedra lanzada con honda.', 'M'),
    [zo('Ráfaga de piedras', 'Varias piedras seguidas: tirá el daño 2 veces (a mano).', 3, 'H'), 5],
    'Puntería tramposa y una bolsa llena de guijarros.', TG);
  cr('bosque', 2, 'Goblin tamborilero', 'apoyo', 'humanoide', 'Palillos de hueso',
    bu('Ritmo de guerra', '+2 No2 para él hasta el final del turno (y los goblins cercanos, a mano).', 1, {nitros: 2}, 1),
    [zo('Tambor ensordecedor', 'Onda de sonido en flor de 1: daño y Pajaritos hasta el final de su turno (a mano).', 3, 'M'), 4],
    'Marca el paso de la tribu con un tambor de tronco hueco.', TG);
  cr('bosque', 3, 'Goblin jinete de lobo', 'rapido', 'humanoide', 'Lanza corta',
    at('Carga montada', 'Se mueve 4 casillas en línea recta y ataca con +3 de daño.', 'M'),
    [zo('Presa doble', 'Jinete y lobo atacan juntos: tirá el daño 2 veces (a mano).', 3, 'H'), 5],
    'Un goblin enorme para su tamaño, montado en un lobo que no lo quiere.', TG);
  cr('bosque', 3, 'Chamán de hongos goblin', 'mago', 'humanoide', 'Bastón de hongos',
    at('Esporas alucinógenas', 'Daño mágico; el objetivo queda Pajaritos 1 turno si falla Res.Mt (a mano).', 'M'),
    [cu('Sopa de la tribu', 'Cocina un caldo curativo y se cura.', 2, 5), 5],
    'Sus hongos curan, alucinan o matan: depende del día.', TG);
  cr('bosque', 4, 'Capitán goblin', 'brutal', 'humanoide', 'Hacha de guerra goblin',
    at('Tajo de capitán', 'Golpe pesado.', 'H'),
    [bu('¡A mí la tribu!', 'Reúne a los suyos: +3 Defensa y +3 al daño 2 turnos.', 2, {def: 3, dmg: 3}, 2), 5],
    'Sobrevivió a tres jefes de tribu y por eso manda.', TG);
  cr('bosque', 4, 'Goblin lanzabombas', 'rango', 'humanoide', 'Tarro de savia explosiva',
    at('Bomba de savia', 'Bomba pegajosa; el objetivo pierde 1 No2 (a mano).', 'M'),
    [zo('Bomba de esporas', 'Explosión en flor de 2: daño y Envenenados (a mano).', 3, 'H'), 5],
    'Inventor de la tribu: casi siempre falla, casi siempre estalla.', TG);
  cr('bosque', 5, 'Rey de la tribu goblin', 'brutal', 'humanoide', 'Cetro de huesos',
    at('Golpe del rey', 'Golpe demoledor.', 'H'),
    [bu('Corona de huesos', 'Se envalentona: +4 Defensa y +4 al daño 2 turnos.', 2, {def: 4, dmg: 4}, 2), 6],
    'Gobierna cientos de goblins desde un trono de raíces y calaveras.', TG);
  cr('bosque', 5, 'Chamán ancestral goblin', 'mago', 'humanoide', 'Hongo viejo',
    at('Rayo del hongo viejo', 'Daño mágico.', 'H'),
    [zo('Ritual del hongo', 'Hongos en flor de 3: daño enorme y alucinaciones (Pajaritos) (a mano).', 3, 'H'), 6],
    'El goblin más viejo del bosque y el que más sabe.', TG);

  /* ================= MONTAÑAS ================= */
  cr('montañas', 1, 'Cabra montés', 'rapido', 'bestia', 'Cuernos',
    at('Cornada', 'Empuja 1 casilla al objetivo (a mano).', 'L'),
    [bu('Salto de risco', 'Salta 4 casillas sobre obstáculos: +3 Evasión 1 turno.', 2, {eva: 3}, 1), 4],
    'Salta de roca en roca sin mirar dónde cae.');
  cr('montañas', 1, 'Bandido de paso', 'brutal', 'humanoide', 'Espada de mercenario',
    at('Tajo', 'Golpe de espada.', 'L'),
    [ta('¡La bolsa o la vida!', 'Intimida: un objetivo pierde 1 No2 si falla Res.Mt (a mano).', 2), 4],
    'Espera a los viajeros en el paso y cobra peaje.');
  cr('montañas', 1, 'Águila de risco', 'rango', 'bestia', 'Garras',
    at('Picado', 'Ataca desde el aire; +2 al PdG si viene de altura (a mano).', 'L'),
    [ta('Chillido ensordecedor', 'Chillido en flor de 1: los golpeados quedan Pajaritos 1 turno (a mano).', 2), 4],
    'Vigila los desfiladeros desde las corrientes de aire.');

  cr('montañas', 2, 'Yeti joven', 'brutal', 'bestia', 'Puños de hielo',
    at('Puñetazo helado', 'Ralentiza: el objetivo pierde 1 No2 (a mano).', 'M'),
    [zo('Avalancha', 'Arroja nieve en flor de 1: daño y Sentados si fallan Fuerza (a mano).', 3, 'H'), 5],
    'Todavía no sabe cuánta fuerza tiene.');
  cr('montañas', 2, 'Ballestero de ruta', 'rango', 'humanoide', 'Ballesta pesada',
    at('Virote pesado', 'Daño de rango.', 'M'),
    [at('Tiro de gracia', 'Ignora armadura ligera; +3 al daño si el objetivo tiene menos de la mitad de su HP (a mano).', 'H'), 5],
    'Guarda una torre de peaje y dispara antes de preguntar.');
  cr('montañas', 2, 'Roca viva', 'tanque', 'constructo', 'Puño de piedra',
    bu('Endurecer', '+4 Defensa hasta su siguiente turno.', 1, {def: 4}, 1),
    [zo('Desprendimiento', 'Suelta piedras: daño a los adyacentes.', 3, 'H'), 5],
    'Una roca que decidió que ya era hora de moverse.');

  cr('montañas', 3, 'Troll de la nieve', 'brutal', 'humanoide', 'Garrote de hielo',
    at('Garrotazo', 'Golpe pesado.', 'M'),
    [cu('Regeneración troll', 'Se cura.', 2, 6), 5],
    'Vive en cuevas heladas y odia el sol.');
  cr('montañas', 3, 'Arpía de tormenta', 'mago', 'bestia', 'Garras eléctricas',
    at('Rayo de tormenta', 'Daño mágico eléctrico.', 'M'),
    [zo('Cadena de relámpagos', 'Salta entre 3 objetivos cercanos: tirá el daño para cada uno (a mano).', 3, 'H'), 5],
    'Vuela dentro de la tormenta y la hace suya.');
  cr('montañas', 3, 'Guardia de piedra', 'tanque', 'constructo', 'Alabarda de granito',
    bu('Postura de guardia', '+3 Defensa; toma el ataque dirigido a un aliado adyacente (a mano).', 1, {def: 3}, 1),
    [at('Alabardazo demoledor', 'Empuja 2 casillas y rompe armadura (a mano).', 'H'), 5],
    'Estatua de un paso de montaña que nunca perdonó una deuda.');

  cr('montañas', 4, 'Ogro de cumbre', 'brutal', 'humanoide', 'Maza de tronco',
    at('Machacar', 'Golpe pesado.', 'H'),
    [bu('Grito de guerra ogro', 'Ruge: +3 al daño; los enemigos cercanos quedan Pajaritos 1 turno (a mano).', 2, {dmg: 3}, 2), 4],
    'Tan grande que casi no le entra la cueva.');
  cr('montañas', 4, 'Chamán del viento', 'apoyo', 'humanoide', 'Bastón de plumas',
    bu('Brisa veloz', '+2 No2 para él (y un aliado adyacente, a mano) hasta su siguiente turno.', 1, {nitros: 2}, 1),
    [zo('Vendaval', 'Empuja a todos en un cono de 3 casillas y hace daño.', 3, 'H'), 5],
    'Conversa con el viento, que le responde con furia.');
  cr('montañas', 4, 'Wyvern joven', 'rapido', 'bestia', 'Aguijón',
    at('Picadura venenosa', 'Envenenado (aplicar a mano).', 'M'),
    [zo('Ataque en picada', 'Vuela y golpea: daño enorme, luego se aleja 4 casillas.', 3, 'H'), 5],
    'Pariente lejano de los dragones, con peor humor.');

  cr('montañas', 5, 'Gigante de escarcha', 'brutal', 'humanoide', 'Garrote helado',
    at('Puñetazo glacial', 'Congela: el objetivo pierde 2 No2 (a mano).', 'H'),
    [zo('Tormenta de hielo', 'Hielo en flor de 3: daño y los golpeados quedan Sentados (a mano).', 3, 'H'), 6],
    'Reina sobre el glaciar más alto de la cordillera.');
  cr('montañas', 5, 'Dragón de ceniza joven', 'mago', 'bestia', 'Aliento de ceniza',
    at('Mordisco ardiente', 'Daño de fuego.', 'H'),
    [zo('Aliento de ceniza', 'Cono de fuego de 4 casillas: daño enorme.', 3, 'H'), 6],
    'Joven, orgulloso y con una cueva que defender.');
  cr('montañas', 5, 'Titán de granito', 'tanque', 'constructo', 'Puños de titán',
    bu('Piel de granito', '+6 Defensa y +4 Res.Mg 2 turnos.', 1, {def: 6, resmg: 4}, 2),
    [zo('Terremoto', 'Sacude la montaña: daño en flor de 3 y los golpeados caen Sentados (a mano).', 3, 'H'), 6],
    'La montaña misma, harta de que la escalen.');

  /* ================= TEMPLO ANTIGUO (influencia alienígena) ================= */
  cr('templo', 1, 'Acólito atrofiado', 'apoyo', 'humanoide', 'Daga de meteorito',
    at('Puñalada reptante', 'Daño con una daga de metal que no es de este mundo.', 'L'),
    [ta('Susurro estelar', 'Susurra: el objetivo tira Res.Mt; si falla, pierde 1 No2 (a mano).', 2), 4],
    'Sirvió al templo tanto tiempo que ya no es del todo humano.');
  cr('templo', 1, 'Enjambre de esporas', 'rango', 'alienígena', 'Esporas',
    at('Nube de esporas', 'Daño de rango sobre un objetivo.', 'L'),
    [zo('Floración', 'Explota en flor de 1: daño y alucinaciones (Pajaritos) 1 turno (a mano).', 2, 'M'), 4],
    'Una colonia de hongos de origen desconocido.');
  cr('templo', 1, 'Ídolo parpadeante', 'tanque', 'constructo', 'Golpe del ídolo',
    bu('Parpadeo', '+3 Evasión y +2 Defensa hasta su siguiente turno.', 1, {eva: 3, def: 2}, 1),
    [zo('Pulso de vacío', 'Onda alienígena: daño en flor de 1.', 3, 'M'), 4],
    'Una estatua que aparece y desaparece entre las columnas.');

  cr('templo', 2, 'Sacerdote susurrante', 'mago', 'humanoide', 'Bastón de antena',
    at('Dardo mental', 'Daño mágico que ignora armadura (a mano).', 'M'),
    [zo('Coro de susurros', 'Susurros en flor de 2: los golpeados tiran Res.Mt o quedan Pajaritos (a mano).', 3, 'H'), 5],
    'Escucha una voz en las paredes y la repite en voz alta.');
  cr('templo', 2, 'Cría rasgadora', 'rapido', 'alienígena', 'Garras quitinosas',
    at('Rasgadura', 'Sangrado (aplicar a mano).', 'M'),
    [ta('Chillido de cría', 'Llama refuerzos: entra 1 cría más al combate este turno (a mano).', 2), 4],
    'Nació hace una semana y ya rasga armaduras.');
  cr('templo', 2, 'Guardián de obsidiana', 'tanque', 'constructo', 'Lanza de obsidiana',
    bu('Escudo de obsidiana', '+4 Defensa hasta su siguiente turno.', 1, {def: 4}, 1),
    [at('Lanzada ritual', 'Empuja 2 casillas al objetivo (a mano).', 'H'), 5],
    'Vigila una puerta que nadie recuerda cómo abrir.');

  cr('templo', 3, 'Pulpo de vacío', 'brutal', 'alienígena', 'Tentáculos',
    at('Tentáculo atrapador', 'Agarra: Inmovilizado si falla Fuerza (a mano).', 'M'),
    [zo('Nube de tinta cósmica', 'Tinta en flor de 2: daño y los golpeados no ven más allá de 1 casilla durante 2 turnos (a mano).', 3, 'H'), 5],
    'Flota en una cámara inundada de algo que no es agua.');
  cr('templo', 3, 'Cultista de la Antena', 'apoyo', 'humanoide', 'Bastón-antena',
    bu('Sintonía', '+2 al daño para él (y sus aliados, a mano) hasta el final del turno.', 1, {dmg: 2}, 1),
    [cu('Transfusión estelar', 'Se cura con energía alienígena.', 2, 5), 5],
    'Cree que la antena del techo le habla. Tiene razón.');
  cr('templo', 3, 'Centinela biomecánico', 'rango', 'constructo', 'Cañón de plasma',
    at('Disparo de plasma', 'Daño de rango que ignora 2 de Defensa (a mano).', 'M'),
    [zo('Barrido láser', 'Línea de 5 casillas: daño a todos en la línea.', 3, 'H'), 5],
    'Mitad máquina, mitad algo que no debería moverse.');

  cr('templo', 4, 'Devorador de mentes', 'mago', 'alienígena', 'Tentáculo psíquico',
    at('Succión mental', 'Daño mental; recupera la mitad como HP (a mano).', 'M'),
    [zo('Grito psíquico', 'Cono de 3: los golpeados quedan Stun si fallan Res.Mt (a mano).', 3, 'H'), 6],
    'Se alimenta de recuerdos; empieza por los más queridos.');
  cr('templo', 4, 'Golem de meteorito', 'tanque', 'constructo', 'Puños de meteorito',
    bu('Coraza estelar', '+5 Defensa y +5 Res.Mg 2 turnos.', 1, {def: 5, resmg: 5}, 2),
    [zo('Impacto de meteorito', 'Cae desde el cielo en flor de 2: daño enorme.', 3, 'H'), 6],
    'Una roca caída del cielo que se puso de pie.');
  cr('templo', 4, 'Heraldo estelar', 'apoyo', 'alienígena', 'Báculo de luz',
    bu('Halo de luz', '+3 Evasión y +1 No2 hasta su siguiente turno.', 1, {eva: 3, nitros: 1}, 1),
    [zo('Nova estelar', 'Explosión de luz en flor de 2: daño y ciega (−3 al PdG) 1 turno (a mano).', 3, 'H'), 5],
    'Anuncia con luz lo que viene detrás de él.');

  cr('templo', 5, 'Avatar de la Estrella Negra', 'mago', 'alienígena', 'Toque del vacío',
    at('Toque del vacío', 'Daño de vacío que ignora Defensa (a mano).', 'H'),
    [zo('Colapso gravitatorio', 'Atrae a todos a 3 casillas hacia él y hace daño; los adyacentes quedan Sentados (a mano).', 3, 'H'), 6],
    'Una presencia de otro cielo, con forma prestada.');
  cr('templo', 5, 'Abominación fusionada', 'brutal', 'alienígena', 'Extremidades fusionadas',
    at('Golpe múltiple', 'Ataca con varias extremidades: tirá el daño 2 veces (a mano).', 'H'),
    [cu('Mutación', 'Se regenera y muta: se cura.', 2, 8), 5],
    'Lo que quedó de los cultistas después del ritual.');
  cr('templo', 5, 'Sumo Sacerdote del Vacío', 'apoyo', 'humanoide', 'Cetro del Vacío',
    bu('Bendición del Vacío', '+4 Defensa y +3 al daño para él (y aliados, a mano) 2 turnos.', 1, {def: 4, dmg: 3}, 2),
    [zo('Ritual de invocación', 'Invoca 1d4 esporas alienígenas al combate (a mano) y daña a todos los cercanos.', 3, 'H'), 6],
    'El último que entendió el lenguaje del templo.');

  /* ================= DEBUFFERS (rol 'debuffer': debilitan, maldicen y envenenan; no pegan fuerte) =================
     Sus maldiciones enfrentan Especial contra Res. Mental del objetivo (a mano, como las de la clase Debuffer).
     Lo que le pasa a otros queda escrito en la descripción; se automatiza lo que le pasa a él mismo. */
  // Minas
  cr('minas', 1, 'Hongo de galería', 'debuffer', 'planta', 'Sombrero venenoso',
    ta('Esporas ciegas', 'Esporas en la cara: el objetivo tira con -1 a la PdG hasta el final de su próximo turno si falla Res.Mt (a mano).', 1),
    [ta('Moho pegajoso', 'Deja el suelo pegajoso en flor de 1: los que lo pisen quedan Rengos 2 turnos (a mano).', 2), 3],
    'Crece donde hay humedad y hace toser a todos los que pasan.');
  cr('minas', 2, 'Kobold maldiciente', 'debuffer', 'humanoide', 'Pico de juguete',
    ta('Maldición del pico roto', 'Especial contra Res.Mt: el objetivo queda Lisiado 2 turnos (a mano).', 1),
    [ta('Mal de mina', 'Especial contra Res.Mt: el objetivo queda Cansado (pierde un tercio de sus No2 máx.) 2 turnos (a mano).', 2), 4],
    'Susurra insultos en un idioma que no existe, y funcionan.');
  cr('minas', 3, 'Nube de sílice', 'debuffer', 'elemental', 'Tormenta de polvo',
    ta('Polvo en los ojos', 'Nube en flor de 1: los afectados quedan Pajaritos hasta el final de su próximo turno (a mano).', 1),
    [zo('Silicosis', 'Aire irrespirable: daño y 3 stacks de Veneno al objetivo (a mano).', 2, 'M'), 4],
    'Polvo que aprendió a odiar a los pulmones.');
  cr('minas', 4, 'Chamán de las galerías', 'debuffer', 'humanoide', 'Cetro de hueso de rata',
    ta('Mal de ojo', 'Especial contra Res.Mt: el objetivo repite su próxima tirada y se queda con el valor más bajo (a mano).', 1),
    [ta('Derrumbe mental', 'Especial contra Res.Mt: Confusión 2 turnos; antes de actuar, el objetivo tira 1d4 (1 el chamán elige el objetivo, 2 pierde la acción, 3 al azar, 4 normal) (a mano).', 3), 5],
    'Dice que la montaña le habla, y a veces acierta.');
  cr('minas', 5, 'Reina de las esporas', 'debuffer', 'planta', 'Corona de micelio',
    ta('Esporas alucinógenas', 'Nube en flor de 2: Confusión a los afectados 2 turnos (a mano, 1d4 por acción).', 2),
    [zo('Micelio hambriento', 'Raíces en el suelo: el objetivo queda Inmovilizado 1 turno y recibe 3 stacks de Veneno (a mano).', 3, 'H'), 6],
    'Cuarenta hectáreas de hongo que decidieron ser una sola persona.');
  // Bosque
  cr('bosque', 1, 'Sapo venenoso', 'debuffer', 'bestia', 'Lengua pegajosa',
    ta('Lengua pegajosa', 'Atrapa al objetivo: queda Rengo 2 turnos si falla Fuerza (a mano).', 1),
    [ta('Baba tóxica', 'Al golpearlo cuerpo a cuerpo, el atacante recibe 2 stacks de Veneno (a mano). Dura hasta su próximo turno.', 1), 3],
    'Colorido, gordo y muy poco simpático.');
  cr('bosque', 2, 'Hada rencorosa', 'debuffer', 'humanoide', 'Aguja de zarza',
    ta('Polvo de picazón', 'Especial contra Res.Mt: el objetivo tira con -1 en todo 2 turnos (Maldición debilitante) (a mano).', 1),
    [ta('Sueño pesado', 'Especial contra Res.Mt: el objetivo queda Exhausto (1 No2 máx.) 1 turno (a mano).', 2), 4],
    'Diminuta, brillante y con memoria eterna para los agravios.');
  cr('bosque', 3, 'Bruja de los pantanos', 'debuffer', 'humanoide', 'Cucharón de caldero',
    ta('Maldición extenuante', 'Especial contra Res.Mt: todas las acciones del objetivo cuestan +1 No2 durante 1 turno (a mano).', 2),
    [zo('Niebla venenosa', 'Nube en flor de 2: daño y 3 stacks de Veneno a quien esté adentro en el Mantenimiento (a mano).', 3, 'M'), 5],
    'Vive en un caldero más grande que su casa.');
  cr('bosque', 4, 'Enredadera parasitaria', 'debuffer', 'planta', 'Zarcillos',
    ta('Zarcillos', 'Atrapa a un objetivo a hasta 3 casillas: Inmovilizado 2 turnos si falla Fuerza (a mano).', 2),
    [dc('Savia drenante', 'Drena la vida del atrapado: daño, y ella se cura una cantidad fija.', 2, 'L', 4), 5],
    'Lo que parece un arbusto ya te está mirando.');
  cr('bosque', 5, 'Espíritu del bosque podrido', 'debuffer', 'no-muerto', 'Raíces muertas',
    ta('Maldición tormentosa', 'Especial contra Res.Mt: por cada acción, el objetivo recibe daño igual a su No2 - 1, 3 turnos (a mano).', 3),
    [zo('Plaga', 'Aplica Veneno severo (empieza en 1 y sube 1 por mantenimiento) al objetivo (a mano) y daña.', 3, 'H'), 6],
    'El bosque enfermo que ya no perdona.');
  // Montañas
  cr('montañas', 1, 'Cuervo de mal agüero', 'debuffer', 'bestia', 'Pico afilado',
    ta('Graznido', 'El objetivo tira con -1 a la PdG hasta el final de su próximo turno si falla Res.Mt (a mano).', 1),
    [ta('Presagio', 'Marca a un objetivo: la próxima vez que falle una tirada, pierde 1 No2 (a mano).', 2), 3],
    'Nadie sabe si trae mala suerte o solo la anuncia.');
  cr('montañas', 2, 'Espectro de la ventisca', 'debuffer', 'elemental', 'Frío cortante',
    ta('Aliento helado', 'Cono de 3 al frente: los afectados quedan Cansados (pierden un tercio de sus No2 máx.) 2 turnos (a mano).', 1),
    [ta('Escarcha', 'Especial contra Res.Mt: el objetivo queda Rengo y con -1 Defensa 2 turnos (a mano).', 2), 4],
    'Un frío que camina.');
  cr('montañas', 3, 'Arpía cantora', 'debuffer', 'bestia', 'Garras de arpía',
    ta('Canto confuso', 'Especial contra Res.Mt: Confusión 1 turno; antes de actuar, el objetivo tira 1d4 (1 la arpía elige el objetivo, 2 pierde la acción, 3 al azar, 4 normal) (a mano).', 2),
    [ta('Chillido', 'Grito en flor de 1: los afectados quedan Pajaritos hasta el final de su próximo turno (a mano).', 2), 4],
    'Su voz es preciosa, y ese es el problema.');
  cr('montañas', 4, 'Bruja de la nevada', 'debuffer', 'humanoide', 'Bastón de carámbano',
    ta('Maldición debilitante', 'Especial contra Res.Mt: -1 a todas las tiradas del objetivo 2 turnos, acumulable (a mano).', 2),
    [zo('Tormenta de hielo', 'Granizo en flor de 2: daño y los golpeados quedan Inmovilizados 1 turno si fallan Fuerza (a mano).', 3, 'H'), 5],
    'Camina sobre la nieve sin dejar huellas.');
  cr('montañas', 5, 'Wendigo del paso', 'debuffer', 'no-muerto', 'Garras de hambre',
    ta('Hambre helada', 'Especial contra Res.Mt: el objetivo queda Exhausto (1 No2 máx.) 2 turnos (a mano).', 3),
    [dc('Susurro helado', 'Drena a un objetivo con Especial contra Res.Mt: daño, y él se cura una cantidad fija.', 3, 'M', 5), 6],
    'Lo que dejó de ser humano en una nevada hace siglos.');
  // Templo antiguo con influencia alienígena
  cr('templo', 1, 'Larva psíquica', 'debuffer', 'alienígena', 'Mandíbulas translúcidas',
    ta('Zumbido mental', 'El objetivo tira con -1 en todo hasta el final de su próximo turno si falla Res.Mt (a mano).', 1),
    [ta('Eco mental', 'Repite en la cabeza del objetivo lo último que hizo: pierde 1 No2 (a mano).', 2), 3],
    'Se mete en la cabeza y no se va.');
  cr('templo', 2, 'Parásito de aura', 'debuffer', 'alienígena', 'Tentáculo fino',
    ta('Succión de energía', 'Especial contra Res.Mt: el objetivo pierde 1d4 SP y el parásito no se cura (a mano).', 1),
    [ta('Fiebre alienígena', 'Especial contra Res.Mt: el objetivo queda Cansado (pierde un tercio de sus No2 máx.) 2 turnos (a mano).', 2), 4],
    'Se alimenta de lo que los demás no saben que tienen.');
  cr('templo', 3, 'Acólito telepático', 'debuffer', 'humanoide', 'Bastón de cristal',
    ta('Intrusión mental', 'Especial contra Res.Mt: Confusión 1 turno; antes de actuar, el objetivo tira 1d4 (1 el acólito elige el objetivo, 2 pierde la acción, 3 al azar, 4 normal) (a mano).', 2),
    [ta('Silencio del templo', 'Especial contra Res.Mt: el objetivo no puede usar habilidades con SP 1 turno (a mano).', 3), 5],
    'Habla sin abrir la boca y escucha lo que no dijiste.');
  cr('templo', 4, 'Ojo flotante del templo', 'debuffer', 'alienígena', 'Mirada del abismo',
    ta('Mirada paralizante', 'Especial contra Res.Mt: el objetivo queda Stun (sin No2) hasta su próximo turno (a mano).', 3),
    [ta('Maldición del vacío', 'Especial contra Res.Mt: -2 a todas las tiradas del objetivo 2 turnos (a mano).', 3), 5],
    'Un ojo sin cuerpo que no parpadea nunca.');
  cr('templo', 5, 'Oráculo disonante', 'debuffer', 'alienígena', 'Voz de otro cielo',
    ta('Control mental', 'Especial contra Especial + Res.Mt: controla al objetivo un turno (nada que lo dañe a sí mismo); gasta 1 No2 por cada No2 que use el controlado (a mano).', 3),
    [ta('Colapso', 'Especial contra Res.Mt: el objetivo queda Stun y luego Exhausto un turno (a mano).', 4), 6],
    'Dice cosas verdaderas en el orden equivocado.');

  /* ================= HUMANOS (seis facciones; equipo real del catálogo) =================
     Equipo por nivel (cada arma o pieza cuenta como un ítem): nivel 1 = 1 Común; nivel 2 = 2 Comunes;
     nivel 3 = 1 Común + 1 Buena Calidad; nivel 4 = 2 Buena Calidad; nivel 5 = 1 Buena Calidad + 1 Raro.
     El arma sale del catálogo (Tipo, peso, bonos y efectos al golpear) y la pieza de defensa suma su Defensa y sus
     resistencias a crítico al creep. */
  // Bandidos
  hu('bandidos', 1, 'Ladronzuelo de callejón', 'rapido', 'Punzón del ladronzuelo', null,
    at('Puñalada rastrera', 'Si flanquea al objetivo (un aliado suyo adyacente a él), +2 al daño (a mano).', 'L'),
    [ta('Bolsillo ajeno', 'Roba un ítem chico del cinturón del objetivo y se aleja 3 casillas (a mano).', 2), 3],
    'Roba lo que puede y corre antes de que lo miren.');
  hu('bandidos', 2, 'Salteador de caminos', 'brutal', 'Sable mellado del camino real', 'Casaca curtida de salteador',
    at('Tajo de camino', 'Golpe de sable.', 'M'),
    [bu('Grito de asalto', 'Se lanza al ataque: +2 al daño 2 turnos.', 2, {dmg: 2}, 2), 4],
    'Espera en la curva del camino con cara de pocos amigos.');
  hu('bandidos', 3, 'Ballestero emboscado', 'rango', 'Ballesta del arbusto', 'Capucha de emboscada',
    at('Virote desde el arbusto', 'Ataque a distancia; si el objetivo no lo vio, +2 al PdG (a mano).', 'M'),
    [tr('Cepo del emboscado', 'Deja un cepo oculto en el camino: {T} al que lo pise, que queda Inmovilizado (a mano).', 2, 'L'), 4],
    'Silencioso, paciente y con un pésimo sentido del humor.');
  hu('bandidos', 4, 'Envenenador de la banda', 'debuffer', 'Daga de la viuda verde', 'Chaleco de escamas del envenenador',
    at('Daga envenenada', 'Daño y 2 stacks de Veneno al objetivo (a mano).', 'M'),
    [zo('Frasco de gas', 'Lanza un frasco en flor de 1: daño; los afectados quedan Pajaritos 1 turno si fallan Res.Mt (a mano).', 3, 'M'), 5],
    'Sabe de venenos más que de modales.');
  hu('bandidos', 5, 'Jefe de la banda', 'brutal', 'Espada del Jefe de los Mil Caminos', 'Gambesón de mando del jefe bandido',
    at('Tajo del jefe', 'Golpe pesado.', 'H'),
    [bu('¡A mí, muchachos!', 'Reúne a la banda: +3 Defensa y +3 al daño 2 turnos (los bandidos cercanos también, a mano).', 2, {def: 3, dmg: 3}, 2), 5],
    'Manda porque sobrevivió a todos los que antes mandaban.');
  // Bárbaros
  hu('bárbaros', 1, 'Cazador bárbaro', 'rango', 'Honda del cazador de jabalíes', null,
    at('Piedra certera', 'Piedra lanzada con honda.', 'L'),
    [tr('Lazo de caza', 'Deja un lazo escondido: {T} al que lo pise, que queda Rengo (a mano).', 1, 'L'), 3],
    'Persigue jabalíes y huye de los inviernos.');
  hu('bárbaros', 2, 'Guerrero de clan', 'brutal', 'Hacha del clan', 'Coraza de cuero del clan',
    at('Hachazo', 'Golpe de hacha.', 'M'),
    [bu('Cantar de guerra', 'Entona el canto del clan: +2 Defensa y +2 al daño 2 turnos.', 2, {def: 2, dmg: 2}, 2), 4],
    'Pelea por su clan y por la última cerveza.');
  hu('bárbaros', 3, 'Chamán de la tormenta', 'mago', 'Bastón del trueno', 'Túnica de nubarrón',
    at('Chispa de tormenta', 'Daño mágico eléctrico.', 'M'),
    [zo('Rayo del cielo', 'Un rayo cae en flor de 1: daño; los golpeados quedan Pajaritos 1 turno si fallan Res.Mt (a mano).', 3, 'H'), 5],
    'Habla con las nubes, y las nubes contestan.');
  hu('bárbaros', 4, 'Berserker', 'brutal', 'Hacha de la furia roja', 'Pieles del berserker',
    at('Hachazo salvaje', 'Golpe descontrolado.', 'H'),
    [bu('Furia berserker', 'Pierde el control: +4 al daño, +2 No2 y -2 Defensa este turno.', 2, {dmg: 4, nitros: 2, def: -2}, 1), 5],
    'Cuando se enoja, ya no distingue entre amigos y enemigos.');
  hu('bárbaros', 5, 'Jefe de guerra bárbaro', 'tanque', 'Hacha del Jefe de Guerra', 'Cota de escamas del jefe de guerra',
    at('Golpe del jefe', 'Golpe demoledor.', 'H'),
    [bu('Rugido de guerra', 'Ruge: +3 Defensa y +4 al daño 2 turnos; los enemigos cercanos tiran Res.Mt o quedan Pajaritos 1 turno (a mano).', 2, {def: 3, dmg: 4}, 2), 6],
    'Sus cicatrices cuentan una historia más larga que la de la tribu.');
  // Guardia de la ciudad
  hu('guardia de la ciudad', 1, 'Recluta de la guardia', 'tanque', 'Espada de recluta de la guardia', null,
    at('Estocada de instrucción', 'Golpe torpe pero firme.', 'L'),
    [bu('Formación cerrada', 'Se planta: +2 Defensa hasta su próximo turno.', 1, {def: 2}, 1), 3],
    'Tiene el uniforme grande y el coraje justo.');
  hu('guardia de la ciudad', 2, 'Guardia de puerta', 'tanque', 'Lanza de guardia de puerta', 'Coraza de puerta',
    at('Pinchazo de lanza', 'Ataque con lanza; llega a 2 casillas.', 'M'),
    [bu('¡Alto en nombre de la ley!', 'Se pone en guardia: +3 Defensa 2 turnos.', 1, {def: 3}, 2), 4],
    'Pide papeles a todo el que pasa, incluso a los que no tienen.');
  hu('guardia de la ciudad', 3, 'Ballestero de muralla', 'rango', 'Ballesta de almenara', 'Casco de muralla',
    at('Saeta', 'Disparo de ballesta.', 'M'),
    [zo('Descarga de la muralla', 'Dispara dos veces seguidas: tirá el daño 2 veces (a mano).', 3, 'H'), 5],
    'Vigila desde arriba y no falla dos veces.');
  hu('guardia de la ciudad', 4, 'Sargento de la guardia', 'apoyo', 'Sable del sargento', 'Media armadura de sargento',
    at('Tajo del sargento', 'Golpe de sable militar.', 'M'),
    [bu('Orden de carga', 'Da la orden: +3 al daño 2 turnos (los guardias cercanos también, a mano).', 1, {dmg: 3}, 2), 4],
    'Grita tan fuerte que se lo oye desde la otra punta de la ciudad.');
  hu('guardia de la ciudad', 5, 'Capitán de la guardia', 'tanque', 'Sable de mando del capitán', 'Coraza del capitán de la ciudad',
    at('Espadazo de mando', 'Golpe firme.', 'H'),
    [bu('Escudo de la ciudad', 'Ordena cerrar filas: +4 Defensa y +3 Res.Mg 2 turnos (los guardias cercanos también, a mano).', 2, {def: 4, resmg: 3}, 2), 5],
    'La ley, en persona y con armadura.');
  // Piratas espaciales
  hu('piratas espaciales', 1, 'Grumete polizón', 'rapido', 'Cuchillo del grumete polizón', null,
    at('Puñalada de cubierta', 'Ataque rápido.', 'L'),
    [bu('Escurrirse', 'Se desliza entre las piernas de todos: +3 Evasión hasta su siguiente turno.', 1, {eva: 3}, 1), 3],
    'Se coló en la nave por el hambre y se quedó por la aventura.');
  hu('piratas espaciales', 2, 'Marinero con sable', 'brutal', 'Sable de abordaje', 'Campera de marinero espacial',
    at('Sablazo', 'Golpe de sable.', 'M'),
    [cu('Trago de ron', 'Un trago de ron de contrabando y se siente mejor.', 1, 3), 4],
    'Navega por estrellas que no figuran en ningún mapa.');
  hu('piratas espaciales', 3, 'Artillero de cubierta', 'rango', 'Arcabuz de cubierta', 'Casco de artillero pintado a mano',
    at('Disparo de mosquete', 'Daño de rango.', 'M'),
    [zo('Andanada de cañón', 'Cañonazo en flor de 1: daño a todos los adyacentes al punto (a mano elegir el punto).', 3, 'H'), 5],
    'Ama los cañones y sospecha de todo lo que no explota.');
  hu('piratas espaciales', 4, 'Contramaestre', 'brutal', 'Cimitarra del contramaestre', 'Cota de malla de contramaestre',
    at('Latigazo de cabo', 'Golpe con el cabo; el objetivo pierde 1 No2 (a mano).', 'M'),
    [bu('¡Todos a estribor!', 'Grita órdenes: +2 No2 y +2 al daño este turno (los piratas cercanos también, a mano).', 1, {nitros: 2, dmg: 2}, 1), 4],
    'Sin él la nave se iría a pique en una hora.');
  hu('piratas espaciales', 5, 'Capitán pirata', 'brutal', 'Espada bastarda del Espectro', 'Gambesón del capitán del Espectro',
    at('Estocada del capitán', 'Golpe de espada bastarda.', 'H'),
    [zo('Cañonazo del Espectro', 'Ordena disparar los cañones de su nave: daño en flor de 2 (a mano elegir el punto).', 3, 'H'), 6],
    'Su nave es rápida, su fama es larga y su paciencia es corta.');
  // Cultistas
  hu('cultistas', 1, 'Acólito de capucha', 'apoyo', 'Estileto ritual del acólito', null,
    at('Puñalada ritual', 'Daño con una daga ritual.', 'L'),
    [cu('Ofrenda de sangre', 'Se corta la palma y se cura con el poder del culto.', 2, 2), 3],
    'Recién entró al culto y todavía cree en todo.');
  hu('cultistas', 2, 'Cultista encapuchado', 'debuffer', 'Hoz ceremonial', 'Capucha de lana del culto',
    at('Hoz ceremonial', 'Golpe de hoz.', 'M'),
    [ta('Cántico debilitante', 'Especial contra Res.Mt: el objetivo tira con -1 a todo 2 turnos (a mano).', 2), 4],
    'Canta en un idioma inventado y muy convincente.');
  hu('cultistas', 3, 'Inquisidor del culto', 'mago', 'Báculo del inquisidor', 'Pasamontañas de inquisidor',
    at('Llama purificadora', 'Daño mágico de fuego.', 'M'),
    [zo('Sentencia', 'Daño mágico; el objetivo queda Lisiado 2 turnos si falla Res.Mt (a mano).', 3, 'H'), 5],
    'Persigue herejes que todavía no sabían que lo eran.');
  hu('cultistas', 4, 'Sacerdote oscuro', 'debuffer', 'Daga del sacrificio', 'Túnica del sacerdote oscuro',
    at('Daga del sacrificio', 'Daño y Sangrado al objetivo (aplicar Sangrado a mano).', 'M'),
    [dc('Comunión oscura', 'Drena a un objetivo con Especial contra Res.Mt: daño y él se cura una cantidad fija (el HP que pierde el objetivo es solo el daño de la tirada).', 3, 'M', 4), 5],
    'Sus sermones duran horas y siempre terminan mal.');
  hu('cultistas', 5, 'Sumo profeta del culto', 'mago', 'Báculo del Sumo Profeta', 'Capuz del Sumo Profeta',
    at('Visión abrasadora', 'Daño mágico.', 'H'),
    [bu('Bendición del culto', 'Se envuelve en luz oscura: +4 Defensa, +4 Res.Mg y +3 al daño 2 turnos (los cultistas cercanos también, a mano).', 2, {def: 4, resmg: 4, dmg: 3}, 2), 6],
    'Vio el final del mundo y le pareció una buena noticia.');
  // Mercenarios
  hu('mercenarios', 1, 'Espada de alquiler novata', 'brutal', 'Espada de alquiler oxidada', null,
    at('Tajo por encargo', 'Golpe de espada.', 'L'),
    [bu('Pago por adelantado', 'Se motiva: +2 al daño 2 turnos.', 1, {dmg: 2}, 2), 3],
    'Todavía no cobró su primer trabajo.');
  hu('mercenarios', 2, 'Mercenario de taberna', 'brutal', 'Espada de taberna', 'Escudo de taberna',
    at('Golpe de taberna', 'Golpe firme.', 'M'),
    [bu('Guardia de escudo', 'Levanta el escudo: +3 Defensa 2 turnos.', 1, {def: 3}, 2), 4],
    'Lo contratan para peleas y lo despiden por las cuentas.');
  hu('mercenarios', 3, 'Rastreador a sueldo', 'rango', 'Arco del rastreador', 'Grebas del rastreador',
    at('Flecha de rastreo', 'Daño de rango.', 'M'),
    [zo('Marca del contrato', 'Marca a un objetivo: +3 al PdG contra él hasta su próximo turno (a mano); tirá el daño ahora.', 2, 'M'), 4],
    'Encuentra a cualquiera si el pago es bueno.');
  hu('mercenarios', 4, 'Veterano de mil batallas', 'tanque', 'Espada del veterano de mil batallas', 'Escudo abollado del veterano',
    at('Tajo veterano', 'Golpe experto.', 'H'),
    [bu('Piel curtida de mil batallas', 'Aguanta el dolor: +4 Defensa 2 turnos.', 1, {def: 4}, 2), 5],
    'Ya vio todo y ninguna de las cosas le gustó.');
  hu('mercenarios', 5, 'Cazarrecompensas legendario', 'rapido', 'Katana del cazarrecompensas', 'Cota del cazarrecompensas',
    at('Corte de katana', 'Golpe rápido y limpio.', 'H'),
    [zo('Captura', 'Ataque de captura: daño; el objetivo queda Inmovilizado 1 turno si falla Fuerza (a mano).', 3, 'H'), 5],
    'Nunca volvió con las manos vacías, ni una sola vez.');


  /* ================= TRAMPEROS Y SIGILOSOS (usan las mecánicas de trampas y sigilo) ================= */
  cr('bosque', 2, 'Trampero silvano', 'rapido', 'humanoide', 'Cuchillo de desollar',
    at('Puñalada de trampero', 'Un tajo rápido.', 'L'),
    [tr('Cepo de dientes', 'Deja un cepo de dientes en una casilla: {T} al que lo pise, que queda Rengo (a mano).', 2, 'M'), 4],
    'Vive de lo que cae en sus cepos, sean ciervos o viajeros.');
  cr('bosque', 3, 'Cazador furtivo', 'rango', 'humanoide', 'Arco corto',
    at('Flecha desde el follaje', 'Flecha a distancia; +2 al daño si el objetivo no lo vio (a mano).', 'M'),
    [es('Entre el follaje', 'Se esconde entre el follaje y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Caza de noche y no deja huellas.');
  cr('minas', 3, 'Kobold artificiero', 'rango', 'humanoide', 'Ballesta de bolsillo',
    at('Virote con mecha', 'Un virote con un cartucho atado.', 'M'),
    [tr('Mina de mecha', 'Entierra una mina con mecha lenta: al pisarla explota con {T} en flor de 1.', 3, 'H'), 5],
    'El mejor amigo de los derrumbes.');
  cr('montañas', 3, 'Cazador de las cumbres', 'rapido', 'humanoide', 'Lanza corta',
    at('Lanzazo', 'Una estocada rápida.', 'M'),
    [tr('Foso con estacas', 'Cava un foso tapado con nieve: {T} de caída al que lo pise (a mano).', 3, 'H'), 5],
    'Nunca persigue: espera a que la presa caiga sola.');
  cr('templo', 2, 'Vigía sombrío', 'rapido', 'humanoide', 'Daga de meteorito',
    at('Corte silencioso', 'Un tajo desde las sombras.', 'L'),
    [es('Sombras del templo', 'Se funde con las sombras del templo y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Se mueve sin hacer ruido entre las ruinas.');
  cr('templo', 4, 'Guardián de sellos', 'mago', 'humanoide', 'Bastón de runas',
    at('Chispa del sello', 'Un chispazo rúnico.', 'M'),
    [tr('Sello explosivo', 'Graba un sello en el piso: al pisarlo explota en flor de 1 con {T} mágico.', 3, 'H'), 5],
    'Protege lo que nadie quiere ya.');

  hu('bandidos', 2, 'Trampero de caminos', 'rapido', 'Punzón del ladronzuelo', 'Casaca curtida de salteador',
    at('Puñalada de trampero', 'Un tajo rápido.', 'L'),
    [tr('Cepo en el camino', 'Deja un cepo escondido: {T} al que lo pise, que queda Inmovilizado (a mano).', 2, 'L'), 4],
    'Prepara la ruta antes de que llegue la caravana.');
  hu('bandidos', 3, 'Sicario de las sombras', 'rapido', 'Ballesta del arbusto', 'Capucha de emboscada',
    at('Virote desde la sombra', 'Ataque a distancia; +2 al daño si el objetivo no lo vio (a mano).', 'M'),
    [es('Pegado a la pared', 'Se pega a la pared y nadie lo ve.', 2, 'Sigilo', 'buff', 0), 3],
    'Nunca se lo ve entrar ni salir.');
  hu('bandidos', 4, 'Saboteador de la banda', 'debuffer', 'Daga de la viuda verde', 'Chaleco de escamas del envenenador',
    at('Daga sucia', 'Daño y 1 stack de Veneno al objetivo (a mano).', 'M'),
    [tr('Trampa de dardos envenenados', 'Deja una trampa de dardos: {T} y el que la pise queda Envenenado (a mano).', 3, 'M'), 5],
    'Arregla el camino para que nadie llegue entero.');
  hu('bárbaros', 2, 'Cazador de fosos', 'brutal', 'Hacha del clan', 'Coraza de cuero del clan',
    at('Hachazo', 'Un golpe pesado.', 'M'),
    [tr('Foso con estacas', 'Cava un foso tapado: {T} de caída al que lo pise (a mano).', 3, 'H'), 5],
    'Caza mamuts con hoyos.');
  hu('guardia de la ciudad', 2, 'Vigía de patrulla', 'apoyo', 'Lanza de guardia de puerta', 'Coraza de puerta',
    at('Lanzazo de vigía', 'Una estocada.', 'M'),
    [ts('Alarma de patrulla', 'Deja una alarma en una casilla: al pisarla suena en la Mesa y los guardias se ponen en guardia (a mano). Es una trampa sin daño.', 1), 3],
    'Cuelga campanitas de cada cuerda.');
  hu('piratas espaciales', 3, 'Minador de cubierta', 'rango', 'Arcabuz de cubierta', 'Casco de artillero pintado a mano',
    at('Tiro de arcabuz', 'Un disparo a distancia.', 'M'),
    [tr('Mina magnética', 'Pega una mina al piso de la cubierta: explota en flor de 1 con {T} a quien la pise.', 3, 'H'), 5],
    'Llena la nave enemiga de sorpresas.');
  hu('cultistas', 3, 'Guardián de runas', 'mago', 'Báculo del inquisidor', 'Pasamontañas de inquisidor',
    at('Chispa ritual', 'Un chispazo.', 'M'),
    [tr('Runa explosiva', 'Graba una runa en el piso: explota en flor de 1 con {T} mágico.', 3, 'H'), 5],
    'Sus runas esperan pacientes.');
  hu('mercenarios', 3, 'Trampero a sueldo', 'rango', 'Arco del rastreador', 'Grebas del rastreador',
    at('Flecha de trampero', 'Una flecha a distancia.', 'M'),
    [tr('Red de cazador', 'Una red en el camino: {T} por el tirón y quien la pise queda Inmovilizado 1 turno (a mano).', 2, 'L'), 4],
    'Cobra por presa viva.');

  /* ================= TRIBUS Y CLANES (2026-09-21): más variedad de kobolds, goblins y hombres cabra =================
     Cada uno con un rol distinto y mecánicas del juego distintas: sigilo, trampas (con y sin daño), estados propios
     (Espinas, Regeneración, Blindado, Escudo especial, Inmunidad a CC, Hypeado, Afortunado) y estados sobre otros que se
     aplican solos (Veneno, Quemado, Rengo, Cegado, Pajaritos, Inmovilizado, Stun, Armadura rota, Maldito…). */
  // Un ataque o habilidad que además deja un estado sobre el objetivo (se aplica solo al usarla, o al pisar la trampa).
  const ap = (sp, estado) => ({...sp, aplica: estado});

  /* ---- Kobolds de las minas abandonadas (14: 3 / 3 / 3 / 3 / 2 por nivel; se suman a los que ya había) ---- */
  const KB = ['kobold', 'tribu kobold'];
  cr('minas', 1, 'Kobold rascador', 'rapido', 'humanoide', 'Cuchillo de rascar',
    at('Rasguño cobarde', 'Un tajo rápido y a esconderse.', 'L'),
    [es('Por la grieta', 'Se cuela en una grieta de la pared y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Vive en las paredes y solo sale cuando nadie mira.', KB);
  cr('minas', 1, 'Kobold farolero', 'apoyo', 'humanoide', 'Farol de aceite',
    ap(zo('Aceite hirviendo', 'Salpica aceite caliente del farol: daño y el objetivo queda Quemado 2 turnos.', 1, 'L'), A('Quemado', 2, {}, -2)),
    [ap(ta('Destello de farol', 'Levanta el farol con un fogonazo: el objetivo queda Cegado (-3 Evasión) 2 turnos.', 2), A('Cegado', 2, {eva: -3})), 4],
    'Guía a los suyos por las galerías con una luz que quema.', KB);
  cr('minas', 1, 'Kobold escudero de barril', 'tanque', 'humanoide', 'Palo con clavos',
    bu('Tapa de barril', 'Se cubre con una tapa de barril: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Bien agachado', 'Se hace una bolita bajo la tapa: ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3), 4],
    'Más tapa que kobold.', KB);

  cr('minas', 2, 'Kobold picador', 'brutal', 'humanoide', 'Pico de mina',
    at('Picotazo', 'Un golpe de pico.', 'M'),
    [ap(zo('Pico en la rodilla', 'Pico bajo: daño y el objetivo queda Rengo.', 2, 'M'), A('Rengo')), 4],
    'Pica primero a las piernas, porque es lo que alcanza.', KB);
  cr('minas', 2, 'Kobold curandero de hongos', 'apoyo', 'humanoide', 'Cuchara de palo',
    cu('Hongo curativo', 'Se come un hongo de galería y se cura.', 1, 3),
    [es('Caldo de la tribu', 'Un caldo espeso: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 2}), 4],
    'Su sopa cura casi todo y sabe a pies.', KB);
  cr('minas', 2, 'Kobold campanero', 'rapido', 'humanoide', 'Cuchillo de cocina',
    at('Cuchillada', 'Un tajo rápido.', 'L'),
    [ts('Cordel de campanas', 'Tiende un cordel con latas en una casilla: al pisarlo suena en la Mesa y los kobolds se ponen en guardia (a mano). Es una trampa sin daño.', 1), 3],
    'Nadie se acerca a la madriguera sin que suene.', KB);

  cr('minas', 3, 'Kobold corredor de túneles', 'rapido', 'humanoide', 'Estoque de aguja',
    at('Estocada corta', 'Una estocada rápida.', 'M'),
    [es('Carrera loca', 'Un torrente de energía: +1 No2 máximo.', 1, 'Hypeado', 'buff', 3), 4],
    'Conoce cada atajo y jamás se queda quieto.', KB);
  cr('minas', 3, 'Kobold coraza de cristal', 'tanque', 'humanoide', 'Martillo de herrero',
    at('Martillazo', 'Un golpe pesado.', 'M'),
    [es('Piel de mineral', 'Se incrusta cristales en la piel: devuelve daño en cuerpo a cuerpo (se cobra a mano) y gana +2 Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 2}}), 5],
    'Se pegó cristales por todos lados y ahora nadie se le acerca.', KB);
  cr('minas', 3, 'Kobold hechicero de la llama', 'mago', 'humanoide', 'Vara de escamas',
    at('Llamarada', 'Fuego mágico a distancia.', 'M'),
    [ap(zo('Bola de fuego draconiana', 'Explosión en flor de 1: daño y los golpeados quedan Quemados 2 turnos.', 3, 'H'), A('Quemado', 2, {}, -2)), 5],
    'Jura descender de un dragón y nadie se lo discute.', KB);

  cr('minas', 4, 'Kobold tejedor de redes', 'rango', 'humanoide', 'Red con plomos',
    ap(at('Red pesada', 'Lanza una red con plomos: daño y el objetivo queda Inmovilizado 1 turno.', 'M'), A('Inmovilizado', 1)),
    [ap(ts('Red del techo', 'Cuelga una red oculta del techo en una casilla: al pisarla, el que cae queda Inmovilizado 1 turno. Es una trampa sin daño.', 2), A('Inmovilizado', 1)), 4],
    'Caza murciélagos, ratas y, ahora, aventureros.', KB);
  cr('minas', 4, 'Kobold capataz de la mina', 'brutal', 'humanoide', 'Látigo de cuero',
    at('Latigazo de capataz', 'Un latigazo seco.', 'M'),
    [bu('¡A picar, gusanos!', 'Azuza a los suyos: él gana +3 Daño y +1 No2 2 turnos (los kobolds cercanos también, a mano).', 2, {dmg: 3, nitros: 1}, 2), 5],
    'Manda con un látigo y con un chillido que se oye en toda la galería.', KB);
  cr('minas', 4, 'Kobold devoto del dragón', 'apoyo', 'humanoide', 'Cetro de escama',
    bu('Escamas de fe', 'Reza a su dragón: +3 Res.Mg hasta el final de su turno.', 1, {resmg: 3}, 1),
    [es('Bendición escamosa', 'Una barrera mágica en forma de escamas absorbe daño de cualquier fuente.', 3, 'Escudo especial', 'buff', 3), 5],
    'Reza tan fuerte que a veces le contestan.', KB);

  cr('minas', 5, 'Kobold guardia real', 'tanque', 'humanoide', 'Alabarda de cobre',
    at('Golpe de escolta', 'Un golpe pesado con la alabarda.', 'H'),
    [es('Guardia de la reina', 'Se planta frente a su reina: no lo aturden ni lo agotan.', 2, 'Inmunidad a CC', 'buff', 3), 5],
    'Solo se separa de la reina para ir a comer.', KB);
  cr('minas', 5, 'Kobold llameante', 'brutal', 'humanoide', 'Garras al rojo',
    ap(at('Zarpazo de brasa', 'Garras al rojo: daño y el objetivo queda Quemado 2 turnos.', 'H'), A('Quemado', 2, {}, -2)),
    [zo('Aliento de dragón', 'Vomita fuego en un cono de 3 casillas: daño enorme a todos los que estén en el cono (a mano).', 3, 'H'), 6],
    'Un kobold que se tragó una brasa del dragón y no se le fue nunca.', KB);

  /* ---- Más goblins del bosque (10: 2 por nivel; se suman a los que ya había) ---- */
  cr('bosque', 1, 'Goblin cazador de ranas', 'rango', 'humanoide', 'Cerbatana',
    ap(at('Dardo pegajoso', 'Un dardo con resina de rana: daño y el objetivo queda Ralentizado (-2 No2) 1 turno.', 'L'), A('Ralentizado', 1, {nitros: -2})),
    [es('Entre los helechos', 'Se mete entre los helechos y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Pasa el día acuclillado esperando que alguien pase.', TG);
  cr('bosque', 1, 'Goblin portaescudo', 'tanque', 'humanoide', 'Garrote de raíz',
    bu('Escudo de corteza', 'Se tapa con una corteza: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Corteza espinosa', 'Su escudo de corteza tiene espinas: devuelve daño en cuerpo a cuerpo (se cobra a mano).', 2, 'Espinas', 'buff', 3), 4],
    'Lo peor que puede hacerle es pegarle.', TG);

  cr('bosque', 2, 'Goblin envenenador de puntas', 'debuffer', 'humanoide', 'Puñal de espina',
    ap(at('Punta untada', 'Una puñalada con veneno de hongo: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [ap(tr('Zarzal envenenado', 'Siembra zarzas venenosas en una casilla: {T} al que las pise, que queda Envenenado.', 3, 'M'), A('Veneno')), 5],
    'Sus armas nunca se limpian, a propósito.', TG);
  cr('bosque', 2, 'Goblin sisador', 'rapido', 'humanoide', 'Daga chica',
    at('Manotazo', 'Un golpe rápido y una mano larga.', 'L'),
    [bu('Sale corriendo', 'Le roba un objeto barato al objetivo y escapa (el robo, a mano): +4 Evasión hasta su próximo turno.', 2, {eva: 4}, 1), 4],
    'Todo lo que brilla es suyo, incluso lo que no brilla.', TG);

  cr('bosque', 3, 'Goblin apicultor', 'debuffer', 'humanoide', 'Panal en honda',
    at('Panal lanzado', 'Lanza un panal enojado.', 'M'),
    [ap(zo('Enjambre', 'Nube de avispas en flor de 1: daño y los afectados quedan Pajaritos hasta el final de su próximo turno.', 3, 'M'), A('Pajaritos', 1)), 4],
    'Las avispas lo quieren; a los demás, no.', TG);
  cr('bosque', 3, 'Goblin arquero de copa', 'rango', 'humanoide', 'Arco de rama',
    at('Flecha desde la copa', 'Una flecha larga desde lo alto.', 'M'),
    [es('Ojo de cazador', 'Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2), 4],
    'Vive en los árboles y solo baja a buscar flechas.', TG);

  cr('bosque', 4, 'Goblin quiebrahuesos', 'brutal', 'humanoide', 'Maza de tronco',
    ap(at('Mazazo', 'Un mazazo brutal: daño y la armadura del objetivo queda Rota.', 'H'), A('Armadura rota')),
    [es('Piel de sapo', 'Su piel gruesa cierra las heridas solas: inmune al sangrado.', 1, 'Coagulación extrema', 'buff', 3), 4],
    'Le encanta el sonido que hacen las armaduras al romperse.', TG);
  cr('bosque', 4, 'Goblin sembrador de zarzas', 'rapido', 'humanoide', 'Hoz de mano',
    at('Hozazo', 'Un tajo rápido con la hoz.', 'M'),
    [ap(tr('Zarzal traicionero', 'Deja un zarzal oculto en una casilla: {T} al que lo pise, que queda Rengo.', 3, 'M'), A('Rengo')), 5],
    'Donde él pasa, el bosque se llena de espinas.', TG);

  cr('bosque', 5, 'Goblin guardia de huesos', 'tanque', 'humanoide', 'Escudo de costillas',
    ap(at('Golpe de escudo de hueso', 'Un golpe pesado con el escudo: daño y el objetivo pierde 1 No2 un turno.', 'H'), A('Golpe de escudo', 1, {nitros: -1})),
    [es('Huesos que se sueldan', 'Sus huesos se sueldan solos: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 3}), 5],
    'Protege al rey con una armadura que fue de su abuelo.', TG);
  cr('bosque', 5, 'Goblin bruja del pantano', 'debuffer', 'humanoide', 'Cucharón de caldero',
    at('Rayo pantanoso', 'Un rayo verde de barro.', 'H'),
    [ap(zo('Maldición del pantano', 'Niebla verde en flor de 2: daño y los afectados quedan Malditos (-2 Res.Mg, -1 Defensa) 3 turnos.', 3, 'H'), A('Maldito', 3, {resmg: -2, def: -1})), 6],
    'Cocina maldiciones con lo que encuentra en el fondo del pantano.', TG);

  /* ---- Hombres cabra de las montañas (raza nueva: 14, de nivel 1 a 5; etiquetas 'hombre cabra' y 'clan cabruno') ---- */
  const HC = ['hombre cabra', 'clan cabruno'];
  cr('montañas', 1, 'Hombre cabra escalador', 'rapido', 'humanoide', 'Lanza de pastor',
    at('Cornada corta', 'Un cabezazo rápido: empuja 1 casilla al objetivo (a mano).', 'L'),
    [bu('Paso de cabra', 'Salta 4 casillas sobre obstáculos (a mano): +3 Evasión hasta su próximo turno.', 2, {eva: 3}, 1), 4],
    'Sube por paredes donde otros ni siquiera pisarían.', HC);
  cr('montañas', 1, 'Hombre cabra pastor con honda', 'rango', 'humanoide', 'Honda de pastor',
    at('Piedra de pastor', 'Una piedra lanzada con honda.', 'L'),
    [ap(ta('Silbido de pastor', 'Un silbido agudo que taladra los oídos: el objetivo queda Pajaritos hasta el final de su próximo turno.', 2), A('Pajaritos', 1)), 4],
    'Cuida su rebaño con puntería y con muy mal carácter.', HC);
  cr('montañas', 1, 'Hombre cabra cornudo', 'brutal', 'humanoide', 'Cuernos con puntas',
    at('Cabezazo', 'Embiste con los cuernos.', 'L'),
    [zo('Embestida de tres pasos', 'Carga en línea recta hasta 3 casillas: daño y empuja 2 casillas al objetivo (a mano).', 2, 'M'), 4],
    'Discute con la cabeza, siempre con la cabeza.', HC);

  cr('montañas', 2, 'Hombre cabra flautista', 'apoyo', 'humanoide', 'Flauta de hueso',
    bu('Marcha brava', 'Toca una marcha: él gana +2 Daño y +1 No2 hasta el final de su turno (los del clan cercanos también, a mano).', 1, {dmg: 2, nitros: 1}, 1),
    [ap(ta('Canción de cuna', 'Una nana lenta y dulce: el objetivo queda Stun hasta el final de su próximo turno.', 3), A('Stun', 1)), 5],
    'Toca lo que el clan necesita: ánimo o sueño.', HC);
  cr('montañas', 2, 'Hombre cabra guardián del risco', 'tanque', 'humanoide', 'Escudo de piedra',
    ap(at('Golpe de escudo', 'Un golpe con el escudo de piedra: daño y el objetivo pierde 1 No2 un turno.', 'M'), A('Golpe de escudo', 1, {nitros: -1})),
    [es('Pies firmes', 'Se planta en el sendero: no lo aturden ni lo agotan.', 2, 'Inmunidad a CC', 'buff', 3), 5],
    'Nadie pasó por su sendero sin que él quisiera.', HC);
  cr('montañas', 2, 'Hombre cabra derrumbador', 'rango', 'humanoide', 'Honda de peñascos',
    at('Peñasco lanzado', 'Una piedra grande lanzada con honda.', 'M'),
    [tr('Peñasco colgado', 'Deja un peñasco en equilibrio sobre una casilla: cae con {T} a quien pase por debajo.', 3, 'H'), 5],
    'Le encanta que las piedras se caigan solas, con ayuda.', HC);

  cr('montañas', 3, 'Hombre cabra vigía de cumbre', 'rango', 'humanoide', 'Arco largo de cuerno',
    at('Flecha del vigía', 'Una flecha larga y certera.', 'M'),
    [ap(zo('Flecha de humo', 'Flecha con humo: daño y el objetivo queda Cegado (-2 Evasión) 2 turnos.', 2, 'M'), A('Cegado', 2, {eva: -2})), 4],
    'Ve todo el valle desde arriba y avisa con un balido.', HC);
  cr('montañas', 3, 'Hombre cabra forjador', 'brutal', 'humanoide', 'Martillo de forja',
    ap(at('Martillo caliente', 'Un martillazo al rojo: daño y el objetivo queda Quemado 2 turnos.', 'M'), A('Quemado', 2, {}, -2)),
    [bu('Forjado en fuego', 'Se templa con el calor de la forja: +3 Defensa y +3 Daño 2 turnos.', 2, {def: 3, dmg: 3}, 2), 5],
    'Golpea el metal igual que a los invitados.', HC);
  cr('montañas', 3, 'Hombre cabra chamán del viento', 'mago', 'humanoide', 'Bastón con cuernos',
    at('Ráfaga cortante', 'Viento afilado como una cuchilla.', 'M'),
    [zo('Vendaval', 'Viento huracanado en flor de 2: daño y empuja 2 casillas a los golpeados (a mano).', 3, 'H'), 5],
    'Habla con el viento y a veces el viento le hace caso.', HC);

  cr('montañas', 4, 'Hombre cabra ariete', 'tanque', 'humanoide', 'Casco de hierro con cuernos',
    at('Embestida', 'Carga con la cabeza: daño y empuja 1 casilla al objetivo (a mano).', 'M'),
    [ap(zo('Choque de ariete', 'Un cabezazo con todo el cuerpo: daño y el objetivo queda Stun hasta el final de su próximo turno.', 3, 'H'), A('Stun', 1)), 6],
    'Ya derribó tres puertas, dos murallas y una montaña chica.', HC);
  cr('montañas', 4, 'Hombre cabra curandero de las cumbres', 'apoyo', 'humanoide', 'Cayado de espino',
    cu('Té de cumbres', 'Bebe una infusión de hierbas de altura y se cura.', 1, 5),
    [es('Bendición de la montaña', 'Un aire puro le cierra las heridas: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 3}), 5],
    'Recolecta hierbas que solo crecen donde nadie llega.', HC);
  cr('montañas', 4, 'Hombre cabra acechador de nieve', 'rapido', 'humanoide', 'Cuchillo de hielo',
    at('Cornada por la espalda', 'Un ataque rápido; +3 al daño si el objetivo no lo vio (a mano).', 'H'),
    [es('Ventisca a su favor', 'Se pierde entre la ventisca y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Se pinta de blanco y espera a que pase alguien.', HC);

  cr('montañas', 5, 'Patriarca cabruno', 'brutal', 'humanoide', 'Cetro de cuernos',
    at('Cornada del patriarca', 'Un golpe demoledor.', 'H'),
    [zo('Alud', 'Hace caer un alud en flor de 3: daño enorme y los golpeados quedan Sentados (a mano).', 3, 'H'), 6],
    'El más viejo, el más terco y el que decide todo en el clan.', HC);
  cr('montañas', 5, 'Hombre cabra oráculo de las cumbres', 'debuffer', 'humanoide', 'Bastón de tormenta',
    at('Rayo de tormenta', 'Un rayo desde las nubes.', 'H'),
    [ap(ta('Maldición del oráculo', 'Ve el peor futuro de un enemigo y se lo dice: queda Maldito (-2 Res.Mg, -1 Defensa) 3 turnos.', 3), A('Maldito', 3, {resmg: -2, def: -1})), 5],
    'Sus profecías casi siempre acaban mal, para el que las escucha.', HC);
  cr('montañas', 5, 'Hombre cabra francotirador', 'rango', 'humanoide', 'Arco de cuerno de carnero',
    at('Flecha certera', 'Un disparo perfecto.', 'H'),
    [tr('Alud en el paso', 'Deja una carga de rocas lista en el sendero: al pisarla se desata un alud en flor de 1 con {T}.', 4, 'H'), 6],
    'Nunca falla; a veces solo avisa.', HC);

  /* ================= AMPLIACIÓN DE FACCIONES (2026-09-26, pedido del dueño): goblins del bosque, kobolds y una colmena de insectos =================
     Regla: en cada facción hay al menos DOS opciones de cada rol (y tres en los roles que estaban flojos). Los atributos salen de cr(): 33 + 3 por nivel sobre 1
     (verificable con CreepsBaseUtil.verificarPresupuesto()). Todos quedan como «(auditar)». */

  /* ---- Goblins del bosque (+12): apoyo (había 1), mágico, tanque, debuffer, melee y asalto ---- */
  cr('bosque', 1, 'Goblin cocinero de sopa', 'apoyo', 'humanoide', 'Cucharón de hierro',
    cu('Probar la sopa', 'Prueba su propio caldo y se cura.', 1, 3),
    [es('Sopa de la tribu', 'Reparte un caldo caliente: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 2}), 4],
    'Su sopa lleva de todo y nadie pregunta de qué.', TG);
  cr('bosque', 2, 'Goblin portaestandarte', 'apoyo', 'humanoide', 'Estandarte de trapos',
    bu('¡Por la tribu!', 'Agita el estandarte: +2 Daño hasta el final de su turno (los goblins cercanos también, a mano).', 1, {dmg: 2}, 1),
    [es('Grito de guerra', 'Un aullido que los pone a todos de pie: +1 No2 máximo.', 2, 'Hypeado', 'buff', 3), 4],
    'Donde va el trapo, va la tribu.', TG);
  cr('bosque', 4, 'Goblin curandero de la ciénaga', 'apoyo', 'humanoide', 'Cayado de musgo',
    cu('Emplasto de musgo', 'Se aplica un emplasto de la ciénaga y se cura.', 1, 4),
    [es('Barro medicinal', 'Se unta barro curativo: recupera vida cada turno y gana +2 Defensa.', 2, 'Regeneración', 'buff', 3, {hp: 3, mods: {def: 2}}), 5],
    'Cura cualquier cosa, menos el olor.', TG);
  cr('bosque', 1, 'Goblin aprendiz de brujo', 'mago', 'humanoide', 'Varita de rama',
    at('Chispa', 'Un destello de magia torpe.', 'L'),
    [zo('Chispazo descontrolado', 'Un estallido en flor de 1: daño a los de adentro (algún goblin también, a mano).', 2, 'M'), 4],
    'Todavía no sabe qué hace la mitad de sus hechizos.', TG);
  cr('bosque', 2, 'Goblin adivino de huesos', 'mago', 'humanoide', 'Bastón de huesos',
    at('Rayo de huesos', 'Una descarga de energía verde.', 'M'),
    [ap(ta('Mala suerte', 'Tira los huesos y augura desgracia: el objetivo queda Maldito (-2 Res.Mg, -1 Defensa) 3 turnos.', 2), A('Maldito', 3, {resmg: -2, def: -1})), 4],
    'Siempre acierta, sobre todo cuando predice cosas malas.', TG);
  cr('bosque', 4, 'Goblin invocador de luciérnagas', 'mago', 'humanoide', 'Farol de vidrio',
    at('Luciérnaga ardiente', 'Una luciérnaga que estalla al chocar.', 'M'),
    [ap(ta('Nube de luciérnagas', 'Una nube de luces: los cercanos quedan Cegados (-3 Evasión) 2 turnos.', 3), A('Cegado', 2, {eva: -3})), 5],
    'Vive de noche y ve mejor que nadie.', TG);
  cr('bosque', 2, 'Goblin barricada', 'tanque', 'humanoide', 'Tablón claveteado',
    bu('Levantar el tablón', 'Se cubre con un tablón: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Firme como un árbol', 'Clava los pies en la tierra: ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3), 4],
    'Se planta en el camino y ahí se queda.', TG);
  cr('bosque', 3, 'Goblin coraza de tortuga', 'tanque', 'humanoide', 'Maza de piedra',
    bu('Meterse en el caparazón', 'Se encierra en su caparazón: +4 Defensa hasta el final de su turno.', 1, {def: 4}, 1),
    [es('Carapacho espinoso', 'Se cubre de espinas: devuelve daño en cuerpo a cuerpo (se cobra a mano) y gana +2 Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 2}}), 5],
    'Se pasó a la vida lenta y a la armadura de caparazón.', TG);
  cr('bosque', 1, 'Goblin escupidor de ají', 'debuffer', 'humanoide', 'Cuchillo de leña',
    ap(at('Escupitajo de ají', 'Escupe ají picante: daño y el objetivo queda Cegado (-2 Evasión) 2 turnos.', 'L'), A('Cegado', 2, {eva: -2})),
    [ap(ta('Polvo de picante', 'Tira polvo picante en la cara: el objetivo queda Cegado (-3 Evasión) 2 turnos.', 1), A('Cegado', 2, {eva: -3})), 4],
    'Todas sus armas pican.', TG);
  cr('bosque', 2, 'Goblin leñador', 'brutal', 'humanoide', 'Hacha de leñador',
    at('Hachazo', 'Un hachazo de leñador.', 'M'),
    [ap(zo('Tronco al hombro', 'Un golpe desde arriba: daño y el objetivo queda con Armadura rota.', 2, 'M'), A('Armadura rota')), 4],
    'Tala árboles y, cuando puede, otras cosas.', TG);
  cr('bosque', 3, 'Goblin cazador de jabalíes', 'brutal', 'humanoide', 'Lanza de caza',
    at('Lanzazo', 'Una estocada larga.', 'M'),
    [ap(zo('Herida de jabalí', 'Un lanzazo profundo: daño y el objetivo queda Sangrando.', 2, 'M'), A('Sangrado')), 4],
    'Le tiene más miedo al jabalí que al aventurero, y por eso ataca primero.', TG);
  cr('bosque', 5, 'Goblin sombra del bosque', 'rapido', 'humanoide', 'Puñal de corteza',
    at('Puñalada por la espalda', 'Un ataque rápido; +3 al daño si el objetivo no lo vio (a mano).', 'H'),
    [es('Entre las hojas', 'Se funde con el follaje y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Solo se ve cuando ya es tarde.', TG);

  /* ---- Kobolds de las minas (+6): debuffer (había 1) y mágico (había 1) ---- */
  cr('minas', 1, 'Kobold soltador de murciélagos', 'debuffer', 'humanoide', 'Bolsa de murciélagos',
    ap(at('Murciélago en la cara', 'Le suelta un murciélago: daño y el objetivo queda Cegado (-2 Evasión) 2 turnos.', 'L'), A('Cegado', 2, {eva: -2})),
    [ap(ta('Cortina de murciélagos', 'Suelta toda la bolsa: los cercanos quedan Pajaritos hasta el final de su próximo turno.', 2), A('Pajaritos', 1)), 4],
    'Los murciélagos lo quieren: le deben plata.', KB);
  cr('minas', 3, 'Kobold envenenador de galerías', 'debuffer', 'humanoide', 'Aguja de veneno',
    ap(at('Aguja untada', 'Un pinchazo con veneno: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [ap(tr('Pozo de estacas untadas', 'Deja una trampa de estacas venenosas en una casilla: {T} al que la pise, que queda Envenenado.', 3, 'M'), A('Veneno')), 5],
    'Sus galerías tienen más trampas que salidas.', KB);
  cr('minas', 4, 'Kobold susurrador', 'debuffer', 'humanoide', 'Vara de eco',
    at('Eco doloroso', 'Un grito que rebota en la roca.', 'M'),
    [ap(ta('Susurros de la mina', 'Le susurra dudas al objetivo: queda con Susurros (-2 Res.Mt) 3 turnos.', 3), A('Susurros', 3, {resm: -2})), 5],
    'Nadie sabe qué les dice; todos vuelven distintos.', KB);
  cr('minas', 1, 'Kobold aprendiz de dragón', 'mago', 'humanoide', 'Vara de escamas chica',
    at('Chispa de dragón', 'Un chispazo de fuego mágico.', 'L'),
    [zo('Bocanada de humo', 'Una nube de humo caliente en flor de 1: daño a los de adentro.', 2, 'M'), 4],
    'Todavía tose más humo del que escupe.', KB);
  cr('minas', 2, 'Kobold del cristal resonante', 'mago', 'humanoide', 'Cristal que vibra',
    at('Rayo de cristal', 'Un rayo de luz que sale del cristal.', 'M'),
    [bu('Foco de cristal', 'Se concentra en el cristal: +2 Daño y +1 No2 durante 2 turnos.', 2, {dmg: 2, nitros: 1}, 2), 5],
    'Vive cerca del cristal más grande de la mina y se le nota.', KB);
  cr('minas', 4, 'Kobold ígneo de las profundidades', 'mago', 'humanoide', 'Bastón de lava',
    at('Chorro de lava', 'Lava mágica a distancia.', 'M'),
    [ap(zo('Erupción', 'Una erupción en flor de 1: daño y los golpeados quedan Quemados 2 turnos.', 3, 'H'), A('Quemado', 2, {}, -2)), 5],
    'Bajó tanto que salió del otro lado, hecho de fuego.', KB);

  /* ---- Kobolds de las cumbres (kobolds de montaña, +14): al menos dos de cada rol ---- */
  const KM = ['kobold', 'tribu kobold', 'kobold de montaña'];
  cr('montañas', 2, 'Kobold picacumbres', 'brutal', 'humanoide', 'Piolet',
    at('Piolazo', 'Un golpe de piolet.', 'M'),
    [ap(zo('Piolet en la rodilla', 'Un piolazo bajo: daño y el objetivo queda Rengo.', 2, 'M'), A('Rengo')), 4],
    'Trepa las paredes con el mismo piolet con el que pega.', KM);
  cr('montañas', 4, 'Kobold guerrero de escarcha', 'brutal', 'humanoide', 'Hacha de hielo',
    at('Hachazo helado', 'Un hachazo con filo de hielo.', 'M'),
    [ap(zo('Golpe congelante', 'Un golpe que enfría hasta los huesos: daño y el objetivo queda con Escarcha (-1 No2) 1 turno.', 3, 'M'), A('Escarcha', 1, {nitros: -1})), 5],
    'Los kobolds del hielo también saben pelear.', KM);
  cr('montañas', 2, 'Kobold escudo de roca', 'tanque', 'humanoide', 'Martillo de piedra',
    bu('Pared de piedra', 'Se cubre con una losa: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Piel de granito', 'Se endurece como una roca: ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3), 4],
    'Más peñasco que kobold.', KM);
  cr('montañas', 5, 'Kobold guardián del glaciar', 'tanque', 'humanoide', 'Maza de hielo azul',
    bu('Muro de hielo', 'Levanta una pared helada: +5 Defensa hasta el final de su turno.', 2, {def: 5}, 1),
    [es('Coraza de hielo', 'Una armadura de escarcha con púas: devuelve daño en cuerpo a cuerpo (se cobra a mano) y gana +3 Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 3}}), 5],
    'Lleva siglos guardando un glaciar que nadie quiere.', KM);
  cr('montañas', 3, 'Kobold saltarrocas', 'rapido', 'humanoide', 'Cuchillos gemelos',
    at('Doble cuchillada', 'Dos tajos rápidos seguidos.', 'M'),
    [bu('Salto entre riscos', 'Salta de risco en risco: +4 Evasión hasta su próximo turno.', 2, {eva: 4}, 1), 3],
    'Nunca toca el suelo si puede evitarlo.', KM);
  cr('montañas', 5, 'Kobold acechador de nieve', 'rapido', 'humanoide', 'Puñal de escarcha',
    at('Puñalada en la ventisca', 'Un ataque rápido; +3 al daño si el objetivo no lo vio (a mano).', 'H'),
    [es('Ventisca a su favor', 'Se pierde entre la nieve y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 3],
    'Blanco sobre blanco, hasta que pincha.', KM);
  cr('montañas', 1, 'Kobold hondero de riscos', 'rango', 'humanoide', 'Honda de cuero',
    at('Piedra lanzada', 'Una piedra bien puesta.', 'L'),
    [ap(zo('Lluvia de piedras', 'Hace caer piedras en flor de 1: daño y los golpeados quedan Pajaritos hasta el final de su próximo turno.', 2, 'M'), A('Pajaritos', 1)), 4],
    'Siempre tiene una piedra más.', KM);
  cr('montañas', 4, 'Kobold arquero del viento', 'rango', 'humanoide', 'Arco de cuerno',
    at('Flecha con viento', 'Una flecha que aprovecha la ráfaga.', 'M'),
    [es('Ojo de águila', 'Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2), 4],
    'Dispara desde donde nadie puede llegar.', KM);
  cr('montañas', 2, 'Kobold curandero de nieve', 'apoyo', 'humanoide', 'Cucharón de madera',
    cu('Té de nieve', 'Toma una infusión caliente y se cura.', 1, 3),
    [es('Sopa de altura', 'Un caldo espeso de altura: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 2}), 4],
    'Sus infusiones huelen a pino y a lana mojada.', KM);
  cr('montañas', 5, 'Kobold anciano de la cumbre', 'apoyo', 'humanoide', 'Cayado de hielo',
    cu('Té de las nevadas', 'Bebe su infusión más vieja y se cura.', 1, 5),
    [es('Aullido de la montaña', 'Un aullido que pone a todos de pie: +1 No2 máximo.', 2, 'Hypeado', 'buff', 3), 5],
    'Lleva más años que la nieve que lo cubre.', KM);
  cr('montañas', 1, 'Kobold soplanieve', 'debuffer', 'humanoide', 'Fuelle roto',
    ap(at('Soplo de nieve', 'Sopla nieve en los ojos: daño y el objetivo queda Cegado (-2 Evasión) 2 turnos.', 'L'), A('Cegado', 2, {eva: -2})),
    [ap(ta('Ventisquero', 'Levanta una nube de nieve: el objetivo queda Cegado (-3 Evasión) 2 turnos.', 1), A('Cegado', 2, {eva: -3})), 4],
    'Nadie sabe de dónde saca tanta nieve.', KM);
  cr('montañas', 3, 'Kobold tejedor de ventiscas', 'debuffer', 'humanoide', 'Bastón de trapos',
    at('Golpe de viento', 'Una ráfaga que golpea.', 'M'),
    [ap(ta('Ventisca', 'Envuelve al objetivo en una ventisca: queda Cegado (-3 Evasión) 2 turnos.', 3), A('Cegado', 2, {eva: -3})), 5],
    'Amarra el viento en nudos y lo suelta cuando le conviene.', KM);
  cr('montañas', 3, 'Kobold chamán de la tormenta', 'mago', 'humanoide', 'Vara de cobre',
    at('Rayito', 'Un rayo chico desde la vara.', 'M'),
    [ap(zo('Trueno', 'Un trueno en flor de 1: daño y los golpeados quedan Pajaritos hasta el final de su próximo turno.', 3, 'H'), A('Pajaritos', 1)), 5],
    'Cuando truena, siempre está cerca.', KM);
  cr('montañas', 5, 'Kobold vidente del hielo', 'mago', 'humanoide', 'Esfera de cristal helado',
    at('Rayo de escarcha', 'Un rayo helado desde la esfera.', 'H'),
    [ap(zo('Congelar el aire', 'Congela el aire en flor de 2: daño y los golpeados quedan con Escarcha (-1 No2) 1 turno.', 3, 'H'), A('Escarcha', 1, {nitros: -1})), 6],
    'Ve el futuro congelado y por eso nunca cambia.', KM);

  /* ---- Colmena: un universo de insectos y bichos (30): cuatro o cinco de cada rol, de nivel 1 a 5 ---- */
  const IN = ['insecto', 'colmena'];
  Object.assign(TROFEOS, {'Hormiga soldado': 'Mandíbula de hormiga', 'Escarabajo cornudo': 'Cuerno de escarabajo', 'Mantis religiosa': 'Garra de mantis', 'Escarabajo Hércules': 'Cuerno de Hércules',
    'Escarabajo pelotero': 'Bola de estiércol dura', 'Cucaracha acorazada': 'Élitro de cucaracha', 'Ciempiés blindado': 'Placa de ciempiés', 'Escarabajo titán': 'Coraza de titán',
    'Grillo saltarín': 'Pata de grillo', 'Libélula veloz': 'Ala de libélula', 'Avispa cazadora': 'Aguijón de avispa', 'Avispón gigante': 'Aguijón de avispón',
    'Hormiga escupidora': 'Glándula de ácido', 'Abeja lanzadora': 'Aguijón de abeja', 'Escarabajo bombardero': 'Glándula de bombardero', 'Escorpión de cola larga': 'Aguijón de escorpión',
    'Luciérnaga chispeante': 'Luz de luciérnaga', 'Polilla de polvo hipnótico': 'Polvo hipnótico', 'Cigarra de tormenta': 'Timbal de cigarra', 'Mantis oracular': 'Ojo de mantis',
    'Abeja obrera': 'Panal pequeño', 'Hormiga cuidadora': 'Huevo de hormiga', 'Abeja curandera de miel': 'Miel curativa', 'Zángano de la reina': 'Ala de zángano',
    'Mosquito chupasangre': 'Trompa de mosquito', 'Mosca de la peste': 'Ala de mosca', 'Araña tejedora': 'Seda de araña', 'Termita corroedora': 'Mandíbula de termita', 'Avispa parásita': 'Larva parásita'});

  // melee
  cr('bosque', 1, 'Hormiga soldado', 'brutal', 'bestia', 'Mandíbulas de hormiga',
    at('Mordisco de hormiga', 'Una mordida fuerte.', 'L'),
    [bu('Cerrar filas', 'Se pone a la par de sus hermanas: +2 Daño hasta el final de su turno (las demás hormigas cercanas también, a mano).', 1, {dmg: 2}, 1), 4],
    'Nunca pelea sola: siempre hay otras cuarenta detrás.', IN);
  cr('bosque', 2, 'Escarabajo cornudo', 'brutal', 'bestia', 'Cuerno de escarabajo',
    at('Cornada', 'Un golpe de cuerno.', 'M'),
    [ap(zo('Embestida de cuerno', 'Carga con el cuerno: daño y el objetivo queda Rengo.', 2, 'M'), A('Rengo')), 4],
    'Levanta troncos de veinte veces su peso, y también aventureros.', IN);
  cr('bosque', 3, 'Mantis religiosa', 'brutal', 'bestia', 'Garras segadoras',
    at('Zarpazo', 'Un tajo rápido con las patas delanteras.', 'M'),
    [ap(zo('Segadora', 'Dos tajos a la vez: daño y el objetivo queda Sangrando.', 2, 'M'), A('Sangrado')), 4],
    'Reza mientras acecha, y después no.', IN);
  cr('bosque', 5, 'Escarabajo Hércules', 'brutal', 'bestia', 'Cuerno de Hércules',
    at('Cornada demoledora', 'Un golpe enorme de cuerno.', 'H'),
    [ap(zo('Lanzamiento', 'Levanta al objetivo con el cuerno y lo tira: daño y queda Stun hasta el final de su próximo turno.', 3, 'H'), A('Stun', 1)), 6],
    'El bicho más fuerte del bosque, si se mide por lo que levanta.', IN);
  // tanque
  cr('bosque', 1, 'Escarabajo pelotero', 'tanque', 'bestia', 'Bola de estiércol',
    bu('Rodar la bola', 'Se protege detrás de su bola: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Bola de estiércol dura', 'Se cubre con una bola seca: ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3), 4],
    'Se toma su trabajo muy en serio y su bola, más.', IN);
  cr('bosque', 2, 'Cucaracha acorazada', 'tanque', 'bestia', 'Élitros afilados',
    bu('Cerrar los élitros', 'Cierra las alas duras sobre el cuerpo: +4 Defensa hasta el final de su turno.', 1, {def: 4}, 1),
    [es('Sobrevive a todo', 'Nada la detiene: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 2}), 4],
    'Dicen que sobrevivirá a los aventureros, a la campaña y a la tienda.', IN);
  cr('bosque', 4, 'Ciempiés blindado', 'tanque', 'bestia', 'Pinzas de ciempiés',
    bu('Enrollarse', 'Se enrolla sobre sí mismo: +5 Defensa hasta el final de su turno.', 2, {def: 5}, 1),
    [es('Cien patas, cien púas', 'Se eriza con cien púas: devuelve daño en cuerpo a cuerpo (se cobra a mano) y gana +2 Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 2}}), 5],
    'Cada segmento es una armadura.', IN);
  cr('bosque', 5, 'Escarabajo titán', 'tanque', 'bestia', 'Mandíbulas de titán',
    bu('Coraza de titán', 'Cierra su caparazón: +6 Defensa hasta el final de su turno.', 2, {def: 6}, 1),
    [es('Inmune al miedo', 'Nada lo mueve: inmune a controles.', 3, 'Inmunidad a CC', 'buff', 3), 6],
    'Las flechas rebotan y las espadas se doblan.', IN);
  // asalto
  cr('bosque', 1, 'Grillo saltarín', 'rapido', 'bestia', 'Patas traseras',
    at('Patada', 'Una patada corta.', 'L'),
    [bu('Salto', 'Salta lejos: +4 Evasión hasta su próximo turno.', 1, {eva: 4}, 1), 3],
    'Nunca está donde lo golpean.', IN);
  cr('bosque', 2, 'Libélula veloz', 'rapido', 'bestia', 'Pinzas de libélula',
    at('Picada', 'Cae en picada con las pinzas.', 'M'),
    [es('Vuelo veloz', 'Un torrente de energía: +1 No2 máximo.', 1, 'Hypeado', 'buff', 3), 4],
    'Vuela en zigzag y no se deja ver quieta.', IN);
  cr('bosque', 3, 'Avispa cazadora', 'rapido', 'bestia', 'Aguijón de avispa',
    ap(at('Picadura', 'Un aguijonazo rápido: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [bu('Pasada rasante', 'Se aleja de un salto: +4 Evasión hasta su próximo turno.', 2, {eva: 4}, 1), 3],
    'No caza por hambre, sino para el nido.', IN);
  cr('bosque', 5, 'Avispón gigante', 'rapido', 'bestia', 'Aguijón de avispón',
    ap(at('Aguijonazo feroz', 'Un aguijonazo enorme: daño y el objetivo queda Envenenado.', 'H'), A('Veneno')),
    [ap(zo('Enjambre de avispones', 'Llama a su nido: nube en flor de 1 con daño y los golpeados quedan Pajaritos hasta el final de su próximo turno.', 3, 'H'), A('Pajaritos', 1)), 5],
    'Un solo avispón; todo un enjambre de problemas.', IN);
  // rango
  cr('bosque', 1, 'Hormiga escupidora', 'rango', 'bestia', 'Ácido fórmico',
    ap(at('Escupitajo de ácido', 'Un chorro de ácido fórmico: daño y el objetivo queda Corroído (-1 Defensa) 2 turnos.', 'L'), A('Corroído', 2, {def: -1})),
    [ap(ts('Rastro de ácido', 'Deja un charco de ácido oculto: quien lo pise queda Corroído. Es una trampa sin daño.', 1), A('Corroído', 2, {def: -1})), 4],
    'Escupe a los que pisan su hormiguero.', IN);
  cr('bosque', 2, 'Abeja lanzadora', 'rango', 'bestia', 'Aguijones sueltos',
    at('Aguijón lanzado', 'Lanza un aguijón.', 'M'),
    [es('Zumbido concentrado', 'Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2), 4],
    'Sabe que el aguijón solo se usa una vez, y lo aprovecha.', IN);
  cr('bosque', 3, 'Escarabajo bombardero', 'rango', 'bestia', 'Gas caliente',
    at('Bomba de gas', 'Un chorro de gas hirviente.', 'M'),
    [ap(zo('Descarga explosiva', 'Un estallido de gas caliente en flor de 1: daño y los golpeados quedan Quemados 2 turnos.', 3, 'M'), A('Quemado', 2, {}, -2)), 4],
    'Combina dos químicos en el abdomen y dispara.', IN);
  cr('bosque', 4, 'Escorpión de cola larga', 'rango', 'bestia', 'Aguijón de cola',
    ap(at('Cola arrojada', 'Lanza el aguijón de la cola: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [ap(tr('Nido de arena', 'Entierra un nido de aguijones en una casilla: {T} al que lo pise, que queda Envenenado.', 3, 'M'), A('Veneno')), 5],
    'Pica primero y pregunta después.', IN);
  // mágico
  cr('bosque', 1, 'Luciérnaga chispeante', 'mago', 'bestia', 'Luz de luciérnaga',
    at('Chispa de luz', 'Un chispazo de luz.', 'L'),
    [ap(ta('Destello cegador', 'Un destello brutal: el objetivo queda Cegado (-3 Evasión) 2 turnos.', 1), A('Cegado', 2, {eva: -3})), 4],
    'De noche, encandila; de día, se duerme.', IN);
  cr('bosque', 3, 'Polilla de polvo hipnótico', 'mago', 'bestia', 'Polvo de alas',
    at('Polvo de alas', 'Una nube de polvo que raspa.', 'M'),
    [ap(zo('Polvo hipnótico', 'Sacude las alas: daño en flor de 1 y los golpeados quedan Stun 1 turno.', 3, 'M'), A('Stun', 1)), 5],
    'Sus alas tienen dibujos que mareaban antes de que cayera el polvo.', IN);
  cr('bosque', 4, 'Cigarra de tormenta', 'mago', 'bestia', 'Timbal de cigarra',
    at('Chillido eléctrico', 'Un chillido que descarga electricidad.', 'M'),
    [ap(zo('Descarga en el timbal', 'Un chillido en flor de 2: daño y los golpeados quedan con Descarga (-1 No2) 1 turno.', 3, 'H'), A('Descarga', 1, {nitros: -1})), 5],
    'Canta antes de la tormenta y la tormenta obedece.', IN);
  cr('bosque', 5, 'Mantis oracular', 'mago', 'bestia', 'Garras de mantis',
    at('Rayo del oráculo', 'Un rayo azul desde los ojos.', 'H'),
    [ap(ta('Ve tu final', 'Predice el final del objetivo: queda Maldito (-2 Res.Mg, -1 Defensa) 3 turnos.', 3), A('Maldito', 3, {resmg: -2, def: -1})), 5],
    'Reza y ve, en ese orden.', IN);
  // apoyo
  cr('bosque', 1, 'Abeja obrera', 'apoyo', 'bestia', 'Aguijón de abeja',
    cu('Miel del panal', 'Prueba un poco de miel y se cura.', 1, 3),
    [bu('Zumbido de trabajo', 'Se pone a trabajar más rápido: +1 No2 hasta el final de su turno.', 1, {nitros: 1}, 1), 4],
    'Trabaja mucho y queja poco, sobre todo poco.', IN);
  cr('bosque', 2, 'Hormiga cuidadora', 'apoyo', 'bestia', 'Mandíbulas cuidadoras',
    cu('Lamer las heridas', 'Se lame las heridas y se cura.', 1, 3),
    [es('Cuidar el hormiguero', 'Se pone a cuidar: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 2}), 4],
    'Cuida a las hermanas y las cría.', IN);
  cr('bosque', 4, 'Abeja curandera de miel', 'apoyo', 'bestia', 'Aguijón dulce',
    cu('Miel curativa', 'Se unta con miel curativa y se cura.', 1, 4),
    [es('Panal reparador', 'Una miel espesa que cierra las heridas: recupera vida cada turno y gana +2 Defensa.', 2, 'Regeneración', 'buff', 3, {hp: 3, mods: {def: 2}}), 5],
    'Sus panales curan lo que tocan.', IN);
  cr('bosque', 5, 'Zángano de la reina', 'apoyo', 'bestia', 'Zumbido de mando',
    cu('Beber jalea', 'Bebe jalea real y se cura.', 1, 5),
    [es('Orden de la reina', 'Transmite el mandato de la reina: +1 No2 máximo.', 2, 'Hypeado', 'buff', 3), 5],
    'No hace nada, y todos lo obedecen.', IN);
  // debuffer
  cr('bosque', 1, 'Mosquito chupasangre', 'debuffer', 'bestia', 'Trompa de mosquito',
    ap(at('Picadura', 'Una picadura que drena.', 'L'), A('Sangrado')),
    [ap(ta('Zumbido insoportable', 'Un zumbido que no deja concentrarse: el objetivo queda con Susurros (-2 Res.Mt) 2 turnos.', 1), A('Susurros', 2, {resm: -2})), 4],
    'No mata: molesta.', IN);
  cr('bosque', 2, 'Mosca de la peste', 'debuffer', 'bestia', 'Patas sucias',
    ap(at('Contagio', 'Un roce contagioso: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [ap(ta('Peste', 'Contagia una peste: el objetivo queda Podrido (-2 Defensa, -1 Daño) 3 turnos.', 2), A('Podrido', 3, {def: -2, dmg: -1})), 4],
    'Donde se posa, algo se pudre.', IN);
  cr('bosque', 3, 'Araña tejedora', 'debuffer', 'bestia', 'Colmillos de araña',
    ap(at('Mordisco de tejedora', 'Un mordisco con veneno: daño y el objetivo queda Envenenado.', 'M'), A('Veneno')),
    [ap(ts('Telaraña oculta', 'Extiende una telaraña oculta en una casilla: quien la pise queda Inmovilizado 1 turno. Es una trampa sin daño.', 2), A('Inmovilizado', 1)), 5],
    'Teje por encargo y cobra en presas.', IN);
  cr('bosque', 4, 'Termita corroedora', 'debuffer', 'bestia', 'Mandíbulas de termita',
    ap(at('Roer la armadura', 'Roe el metal: daño y el objetivo queda con Armadura rota.', 'M'), A('Armadura rota')),
    [ap(ta('Devorar madera', 'Devora todo lo de madera del objetivo: queda Oxidado (-2 Daño) 3 turnos.', 3), A('Oxidado', 3, {dmg: -2})), 5],
    'No descansa hasta que lo que mordió se rompe.', IN);
  cr('bosque', 5, 'Avispa parásita', 'debuffer', 'bestia', 'Ovipositor',
    ap(at('Inyectar larva', 'Inyecta una larva: daño y el objetivo queda Envenenado.', 'H'), A('Veneno severo')),
    [ap(ta('Larva voraz', 'La larva le come las fuerzas: el objetivo queda Exhausto.', 3), A('Exhausto')), 5],
    'Pone sus huevos en lo que aún respira.', IN);

  /* ================= ELEMENTALES (tanda 1 del rework de creeps, 2026-09-26): fuego, hielo y rayo =================
     Tres facciones de 7 (una por rol). Cada elemento tiene su mecánica firma (fuego: Quemado y terreno incendiado; hielo: Escarcha acumulable;
     rayo: Descarga y Parálisis). Desde el nivel 3 llevan además una TERCERA habilidad (su mecánica firma). Las pasivas por familia se suman
     al final para todos los creeps (ver aplicarProgresion). */
  COLOR.fuego = '#E25822'; COLOR.hielo = '#7FB3D5'; COLOR.rayo = '#E6D84A';
  ESCENARIO_TXT.fuego = 'volcán'; ESCENARIO_TXT.hielo = 'glaciar'; ESCENARIO_TXT.rayo = 'tormenta';
  const EF = ['elemental', 'fuego'], EH = ['elemental', 'hielo'], ER = ['elemental', 'rayo'];
  // Tercera habilidad (n ≥ 3): se suma al último creep cargado. cd: cooldown; la lenta arranca en cooldown.
  function tercera(sp, cd){
    const c = lista[lista.length - 1], n = c.nivel, h = armarHab(sp, n, cd, cd >= 4);
    c.datos.habilidades.push(h);
    c.detalle = c.detalle.replace(/ Rápida:/, ' Tercera: ' + sp.nombre + ' (CD ' + cd + ').' + ' Rápida:');
    c.etiquetas = [...new Set([...c.etiquetas, ...mecEtiquetas(sp)])];
  }
  const RASTRO = () => tercera(zo('Rastro de llamas', 'Deja fuego por las casillas por donde pasa: terreno incendiado 3 turnos (a mano, con Terreno y Formas → Fuego). Daña al que entra.', 2, 'M'), 4);
  const ESCARCHA3 = () => tercera(ap(zo('Escarcha acumulada', 'Una ola de frío: daño y el objetivo suma otro stack de Escarcha (−1 No2 máx. por stack, acumulable).', 2, 'M'), A('Escarcha', 2, {nitros: -1})), 4);
  const ESTATICA3 = () => tercera(ap(zo('Estática', 'Un chispazo que enreda los músculos: daño y 15 % de Parálisis (PdG, Parry y Evasión a la mitad) 2 turnos (la tirada del porcentaje, a mano).', 2, 'M'), A('Parálisis', 2)), 4);

  Object.assign(TROFEOS, {'Chispa ígnea': 'Chispa viva', 'Llama viva': 'Llama embotellada', 'Salamandra de brasas': 'Escama de brasa', 'Brasero errante': 'Carbón eterno', 'Mago de ceniza': 'Ceniza mágica', 'Arquero de magma': 'Roca de magma', 'Fénix menor': 'Pluma de fénix', 'Duende de escarcha': 'Cristal de escarcha', 'Golem de hielo': 'Núcleo de hielo', 'Oso de nieve': 'Piel blanca', 'Susurro de nieve': 'Copo eterno', 'Bruja de las nevadas': 'Vara de hielo', 'Arquero de carámbanos': 'Carámbano perpetuo', 'Anciano de la glaciación': 'Corazón helado', 'Chispita eléctrica': 'Chispa embotellada', 'Golem de cobre': 'Bobina de cobre', 'Coraza pararrayos': 'Pararrayos', 'Nube de estática': 'Estática embotellada', 'Chamán del rayo': 'Rayo en frasco', 'Arquero de tormenta': 'Trueno enjaulado', 'Espíritu de la tormenta': 'Nube en frasco'});
  // --- Fuego ---
  cr('fuego', 1, 'Chispa ígnea', 'rapido', 'elemental', 'Chisporroteo',
    at('Chispazo', 'Una chispa que quema.', 'L'),
    [bu('Rastro de chispas', 'Se mueve dejando chispas: +4 Evasión hasta su próximo turno.', 1, {eva: 4}, 1), 3],
    'Una llamita que corre y no quiere que la apaguen.', EF);
  cr('fuego', 2, 'Llama viva', 'brutal', 'elemental', 'Puños de fuego',
    at('Puñetazo ardiente', 'Un golpe de fuego vivo.', 'M'),
    [ap(zo('Abrazo de fuego', 'Un golpe que prende: daño y el objetivo queda Quemado 2 turnos.', 2, 'M'), A('Quemado', 2, {}, -2)), 4],
    'Fuego que pelea como si tuviera brazos.', EF);
  cr('fuego', 2, 'Salamandra de brasas', 'tanque', 'elemental', 'Cola de brasas',
    bu('Piel de brasas', 'Se cubre de brasas: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Calor abrasador', 'Quema a quien la toca: devuelve daño en cuerpo a cuerpo (se cobra a mano).', 2, 'Espinas', 'buff', 3), 4],
    'Duerme sobre carbones y despierta de mal humor.', EF);
  cr('fuego', 3, 'Brasero errante', 'debuffer', 'elemental', 'Carbón candente',
    ap(at('Carbón lanzado', 'Lanza un carbón: daño y el objetivo queda Quemado 2 turnos.', 'M'), A('Quemado', 2, {}, -2)),
    [ap(ta('Humo asfixiante', 'Una nube de humo: los cercanos quedan Cegados (-2 Evasión) 2 turnos.', 2), A('Cegado', 2, {eva: -2})), 4],
    'Un brasero que aprendió a caminar y a molestar.', EF); RASTRO();
  cr('fuego', 3, 'Mago de ceniza', 'mago', 'elemental', 'Bastón de carbón',
    at('Bola de brasas', 'Un proyectil de brasas.', 'M'),
    [ap(zo('Bola de fuego', 'Explosión en flor de 1: daño y los golpeados quedan Quemados 2 turnos; deja terreno incendiado (a mano).', 3, 'H'), A('Quemado', 2, {}, -2)), 5],
    'Sus hechizos huelen a chamusquina.', EF); RASTRO();
  cr('fuego', 4, 'Arquero de magma', 'rango', 'elemental', 'Arco de lava',
    at('Flecha de magma', 'Una flecha de roca fundida.', 'M'),
    [ap(zo('Lluvia de fuego', 'Flechas ardientes en flor de 2: daño y los golpeados quedan Quemados 2 turnos.', 3, 'H'), A('Quemado', 2, {}, -2)), 5],
    'Dispara desde el borde del cráter y no falla.', EF); RASTRO();
  cr('fuego', 5, 'Fénix menor', 'apoyo', 'elemental', 'Pico de brasa',
    cu('Renacer parcial', 'Se cura con su propio fuego.', 1, 5),
    [es('Llama de renacimiento', 'Un fuego que cura: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 3}), 5],
    'Nunca muere del todo.', EF); RASTRO();

  // --- Hielo ---
  cr('hielo', 1, 'Duende de escarcha', 'rapido', 'elemental', 'Pellizco helado',
    at('Pellizco helado', 'Un pellizco frío.', 'L'),
    [bu('Deslizarse', 'Se desliza sobre el hielo: +4 Evasión hasta su próximo turno.', 1, {eva: 4}, 1), 3],
    'Un duendecillo de cristal que se ríe cuando alguien resbala.', EH);
  cr('hielo', 2, 'Golem de hielo', 'brutal', 'elemental', 'Puños de hielo',
    at('Puñetazo helado', 'Un golpe de hielo macizo.', 'M'),
    [ap(zo('Golpe congelante', 'Un golpe que enfría hasta los huesos: daño y el objetivo queda con Escarcha (−1 No2 máx.) 2 turnos.', 2, 'M'), A('Escarcha', 2, {nitros: -1})), 4],
    'Un bloque que aprendió a pegar.', EH);
  cr('hielo', 2, 'Oso de nieve', 'tanque', 'elemental', 'Zarpas de hielo',
    bu('Pelaje espeso', 'Se eriza: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Piel de escarcha', 'Cristales de hielo por todo el cuerpo: devuelve daño en cuerpo a cuerpo (se cobra a mano).', 2, 'Espinas', 'buff', 3), 4],
    'Blanco, pesado y con hambre.', EH);
  cr('hielo', 3, 'Susurro de nieve', 'debuffer', 'elemental', 'Aliento gélido',
    at('Aliento gélido', 'Una bocanada de frío.', 'M'),
    [ap(ta('Ventisca', 'Levanta una ventisca: los cercanos quedan Cegados (-3 Evasión) 2 turnos.', 3), A('Cegado', 2, {eva: -3})), 5],
    'Se oye antes de verse, y no se oye nada.', EH); ESCARCHA3();
  cr('hielo', 3, 'Bruja de las nevadas', 'mago', 'elemental', 'Vara de cristal helado',
    at('Lanza de hielo', 'Una lanza de hielo.', 'M'),
    [ap(zo('Aliento helado', 'Cono de 3: daño y los golpeados suman un stack de Escarcha (−1 No2 máx., acumulable).', 3, 'H'), A('Escarcha', 2, {nitros: -1})), 5],
    'Cuando sonríe, hace frío.', EH); ESCARCHA3();
  cr('hielo', 4, 'Arquero de carámbanos', 'rango', 'elemental', 'Arco de hielo',
    at('Carámbano', 'Una flecha de hielo.', 'M'),
    [es('Ojo helado', 'Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2), 4],
    'Sus flechas se derriten donde caen, pero antes duelen.', EH); ESCARCHA3();
  cr('hielo', 5, 'Anciano de la glaciación', 'apoyo', 'elemental', 'Cayado de glaciar',
    cu('Manto de nieve', 'Se envuelve en nieve fresca y se cura.', 1, 5),
    [es('Aliento del invierno', 'Un frío que conserva: recupera vida cada turno y gana +2 Defensa.', 2, 'Regeneración', 'buff', 3, {hp: 3, mods: {def: 2}}), 5],
    'Recuerda la última glaciación, como si hubiera estado.', EH); ESCARCHA3();

  // --- Rayo ---
  cr('rayo', 1, 'Chispita eléctrica', 'rapido', 'elemental', 'Chispa',
    at('Chispa', 'Un chispazo eléctrico.', 'L'),
    [bu('Salto de chispa', 'Salta de un lado a otro: +4 Evasión hasta su próximo turno.', 1, {eva: 4}, 1), 3],
    'Nunca se queda quieta y a veces prende el pelo.', ER);
  cr('rayo', 2, 'Golem de cobre', 'brutal', 'elemental', 'Puños de cobre',
    at('Puñetazo de cobre', 'Un golpe de metal.', 'M'),
    [ap(zo('Golpe conductor', 'Un golpe que descarga: daño y el objetivo queda con Descarga (−1 No2) 1 turno.', 2, 'M'), A('Descarga', 1, {nitros: -1})), 4],
    'Todo en él conduce, menos la paciencia.', ER);
  cr('rayo', 2, 'Coraza pararrayos', 'tanque', 'elemental', 'Antena',
    bu('Atraer el rayo', 'Se ilumina y se carga: +3 Defensa hasta el final de su turno.', 1, {def: 3}, 1),
    [es('Jaula de Faraday', 'Una jaula de cables que lo aísla: ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3), 4],
    'Un poste que pasa la tormenta sin inmutarse.', ER);
  cr('rayo', 3, 'Nube de estática', 'debuffer', 'elemental', 'Chispas sueltas',
    ap(at('Chispazo de estática', 'Una descarga: daño y el objetivo queda con Descarga (−1 No2) 1 turno.', 'M'), A('Descarga', 1, {nitros: -1})),
    [ap(ta('Estática pegajosa', 'Todos los cercanos quedan con la ropa erizada: Pajaritos hasta el final de su próximo turno.', 2), A('Pajaritos', 1)), 4],
    'Flota, cruje y despeina.', ER); ESTATICA3();
  cr('rayo', 3, 'Chamán del rayo', 'mago', 'elemental', 'Vara de cobre',
    at('Rayo corto', 'Un rayo corto.', 'M'),
    [zo('Descarga en cadena', 'Un rayo que salta hasta 3 objetivos con la mitad del daño en cada salto; 15 % de Parálisis por salto (la cadena y la tirada, a mano).', 3, 'H'), 5],
    'Siempre está cerca cuando cae un rayo.', ER); ESTATICA3();
  cr('rayo', 4, 'Arquero de tormenta', 'rango', 'elemental', 'Arco de cables',
    at('Flecha de rayo', 'Una flecha cargada.', 'M'),
    [es('Ojo de la tormenta', 'Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2), 4],
    'Cada flecha lleva un trueno adentro.', ER); ESTATICA3();
  cr('rayo', 5, 'Espíritu de la tormenta', 'apoyo', 'elemental', 'Nube negra',
    cu('Absorber el rayo', 'Absorbe un rayo y se cura.', 1, 5),
    [es('Tormenta protectora', 'Una tormenta que lo cuida: +1 No2 máximo.', 2, 'Hypeado', 'buff', 3), 5],
    'La tormenta que vuelve cada vez que alguien lo lastima.', ER); ESTATICA3();

  /* ================= PASIVAS POR FAMILIA (rework de creeps, 2026-09-26; opción A del dueño) =================
     Los creeps de nivel 3 en adelante traen pasivas propias de su familia, ya cargadas como estados permanentes (`pasiva: true`) que el GM
     puede sacar o cambiar como cualquier estado. Tabla: nivel 3 → 1 pasiva · nivel 4 → 1 (otra) · nivel 5 → 2 · jefe → +1. La elegida sale
     del nombre del creep (siempre la misma), y las hay de tres por familia. */
  const P = (nombre, mods, detalle, hp) => ({nombre, polaridad: 'buff', turnos: 0, stacks: 1, hpTurno: hp || 0, permanente: true, pasiva: true,
    mods: Object.keys(mods || {}).map(stat => ({stat, val: mods[stat]})), detalle: 'Pasiva de familia. ' + detalle});
  const PASIVAS_FAMILIA = {
    bestia: [P('Piel gruesa', {def: 1}, '+1 Defensa.'), P('Instinto de manada', {dmg: 1}, '+1 Daño.'), P('Reflejos de presa', {eva: 1}, '+1 Evasión.')],
    humano: [P('Entrenamiento', {pdg: 1}, '+1 PdG.'), P('Curtido', {def: 1}, '+1 Defensa.'), P('Sangre fría', {resm: 1}, '+1 Res.Mt.')],
    humanoide: [P('Astucia', {eva: 1}, '+1 Evasión.'), P('Tozudez', {resm: 1}, '+1 Res.Mt.'), P('Mala leche', {dmg: 1}, '+1 Daño.')],
    planta: [P('Corteza', {def: 1}, '+1 Defensa.'), P('Savia', {}, 'Recupera 1 HP por turno.', 1), P('Raíces profundas', {resm: 1}, '+1 Res.Mt.')],
    elemental: [P('Núcleo estable', {def: 1}, '+1 Defensa.'), P('Poder desbordante', {dmg: 1}, '+1 Daño.'), P('Aura elemental', {resmg: 1}, '+1 Res.Mg.')],
    'no-muerto': [P('Huesos duros', {def: 1}, '+1 Defensa.'), P('Frío sepulcral', {resm: 1}, '+1 Res.Mt.'), P('Sed de sangre', {dmg: 1}, '+1 Daño.')],
    constructo: [P('Blindaje', {def: 1}, '+1 Defensa.'), P('Sin nervios', {resm: 1}, '+1 Res.Mt.'), P('Mecanismo preciso', {pdg: 1}, '+1 PdG.')],
    'alienígena': [P('Mente ajena', {resmg: 1}, '+1 Res.Mg.'), P('Fisiología rara', {eva: 1}, '+1 Evasión.'), P('Adaptación', {def: 1}, '+1 Defensa.')],
  };
  function aplicarProgresion(){
    lista.forEach(c => {
      const d = c.datos, opciones = PASIVAS_FAMILIA[d.tipoCriatura];
      if(!opciones || c.nivel < 3) return;
      const h = [...c.nombre].reduce((a, ch) => a + ch.charCodeAt(0), 0) % opciones.length;
      const idx = c.nivel === 3 ? [h] : c.nivel === 4 ? [(h + 1) % opciones.length] : [h, (h + 1) % opciones.length];
      if(d.jefe) idx.push((h + 2) % opciones.length);
      [...new Set(idx)].forEach(i => {
        if((d.estados || []).some(e => e.pasiva && e.nombre === opciones[i].nombre)) return;
        (d.estados = d.estados || []).push(structuredClone(opciones[i]));
      });
      const nombres = (d.estados || []).filter(e => e.pasiva).map(e => e.nombre);
      if(nombres.length){ c.detalle = c.detalle + ' Pasivas: ' + nombres.join(', ') + '.'; c.etiquetas = [...new Set([...c.etiquetas, 'con pasivas'])]; }
    });
  }
  aplicarProgresion();

  /*EQUIPO_CREEP:INICIO*/
  /* ================= EQUIPO Y DEFENSA DE LOS CREEPS (rework de creeps, 2026-09-26) — generado por herramientas/generar_equipo_creeps.py =================
     EQUIPO (humanos y humanoides), escala por nivel: N1 arma y defensa Comunes · N2 un arma y 2 defensivos (Común + la mitad con uno de Buena) · N3 1–2 armas y 2–3 defensivos (Buena) ·
     N4 1–2 armas y 3 (Buena/Raro) · N5 1–2 armas y 3–5 (Raro/Excepcional) · jefe: +1 tier y +1 ítem. Las armas conservan el NOMBRE temático del creep pero tienen EXACTAMENTE los valores de un
     ítem del catálogo (mismo Tipo de dado que ya tenían); los lanzadores llevan un arma simple y su foco mágico aparte.
     DEFENSA: un HUMANO tiene la de su equipo; un HUMANOIDE tiene defensa natural (la mitad del objetivo) y además su equipo; lo que NO es humano tiene defensa natural. Objetivo por nivel
     [1, 2,5, 4, 6, 8] × factor del rol (tanque 1,7 · melee 1,1 · asalto 0,8 · rango 0,8 · apoyo 0,8 · debuffer 0,7 · mágico 0,6); el jefe suma 2. */
  const EQUIPO_CREEP = {"arma":{"m4":{"Raro":[{"n":"Aguijón de esgrima","t":"arma_1m","k":"Raro","p":2,"det":"parry +2, pdg +1","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1},{"stat":"parry","val":2}],"e":[]},{"n":"Estoque de duelista","t":"arma_1m","k":"Raro","p":1,"det":"Ingora 2 de resistencia al crítico","d":4,"f":2,"r":false,"m":[],"e":[{"nombre":"Ignora 2 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 2 menos de resistencia."}]},{"n":"Estoque de esgrima","t":"arma_1m","k":"Raro","p":2,"det":"Alcance +1 · Crít. potente +3 · Crít. frecuente +1","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":1},{"stat":"critpot","val":3},{"stat":"crit","val":1}],"e":[]},{"n":"Lanza de lisiar","t":"arma_2m","k":"Raro","p":3,"det":"Alcance +2 · Crít. potente +3 · 33 % de dejar Lisiado 3 turnos","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":2},{"stat":"critpot","val":3}],"e":[{"nombre":"Lisiado","caras":6,"exitos":2,"dado":"","detalle":"33 % de dejar Lisiado 3 turnos."}]},{"n":"Lanza militar","t":"arma_1m","k":"Raro","p":2,"det":"alcance +1","d":4,"f":2,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Puñal aserrado","t":"arma_1m","k":"Raro","p":2,"det":"Rompe armadura.","d":4,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Puñal envenenado","t":"arma_1m","k":"Raro","p":2,"det":"+1 de daño fijo · Crít. potente +3 · Cada golpe deja 3 stacks de Veneno (1 HP por stack por turno)","d":4,"f":1,"r":false,"m":[{"stat":"critpot","val":3}],"e":[{"nombre":"Envenenar","caras":1,"exitos":1,"dado":"","detalle":"Cada golpe deja 3 stacks de Veneno (1 HP por stack por turno)."}]},{"n":"Rompemalla","t":"arma_1m","k":"Raro","p":2,"det":"50% chance de Romper armadura.","d":4,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":2,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]}],"Excepcional":[{"n":"Aguijón de la Reina Avispa","t":"arma_1m","k":"Excepcional","p":2,"det":"+2 de daño fijo · Crít. potente +4 · Crít. frecuente +1 · Veneno severo por 4 turnos en cada golpe","d":4,"f":2,"r":false,"m":[{"stat":"critpot","val":4},{"stat":"crit","val":1}],"e":[{"nombre":"Envenenar","caras":1,"exitos":1,"dado":"","detalle":"Veneno severo por 4 turnos en cada golpe."}]},{"n":"Báculo mágico","t":"arma_1m","k":"Excepcional","p":2,"det":"+2 a Especial, +5 a Rango de Casteo, +2 Bonos.","d":4,"f":0,"r":false,"m":[{"stat":"esp","val":2},{"stat":"rangocasteo","val":5},{"stat":"bonos","val":2}],"e":[]},{"n":"Colmillo dientes de sable","t":"arma_1m","k":"Excepcional","p":2,"det":"Deja sangrando x2hp","d":4,"f":1,"r":false,"m":[],"e":[{"nombre":"Sangrado","caras":1,"exitos":1,"dado":"","detalle":"Sangrado de 2 HP por turno."}]},{"n":"Lanza del alba","t":"arma_2m","k":"Excepcional","p":4,"det":"Alcance +2 · PdG +1 · Crít. potente +2 · Crít. frecuente +1 · 50 % de dejar Lisiado 3 turnos","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":2},{"stat":"pdg","val":1},{"stat":"critpot","val":2},{"stat":"crit","val":1}],"e":[{"nombre":"Lisiado","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar Lisiado 3 turnos."}]},{"n":"Puñal de Dorne","t":"arma_1m","k":"Excepcional","p":2,"det":"Veneno stock 4","d":4,"f":2,"r":false,"m":[],"e":[{"nombre":"Envenenar","caras":1,"exitos":1,"dado":"","detalle":"Veneno de 4 stacks."}]}],"Buena Calidad":[{"n":"Aguja de acupunturista","t":"arma_1m","k":"Buena Calidad","p":1,"det":"+2 de daño fijo · PdG +1 · 33 % de dejar Sangrado","d":4,"f":2,"r":false,"m":[{"stat":"pdg","val":1}],"e":[{"nombre":"Sangrado","caras":6,"exitos":2,"dado":"","detalle":"33 % de dejar Sangrado."}]},{"n":"Daga de Capitán","t":"arma_1m","k":"Buena Calidad","p":1,"det":"pdg +1","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1}],"e":[]},{"n":"Daga de duelo","t":"arma_1m","k":"Buena Calidad","p":2,"det":"PdG +1 · Crít. potente +2","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1},{"stat":"critpot","val":2}],"e":[]},{"n":"Daga de la viuda verde","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Ignora 1 punto de resistencia al crítico","d":4,"f":1,"r":false,"m":[],"e":[{"nombre":"Ignora 1 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}]},{"n":"Daga del sacrificio","t":"arma_1m","k":"Buena Calidad","p":1,"det":"pdg +1","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1}],"e":[]},{"n":"Estilete de competencia","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Crítico frecuente +1","d":4,"f":0,"r":false,"m":[{"stat":"crit","val":1}],"e":[]},{"n":"Estoque","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Modificador: +1 a iniciativa","d":4,"f":0,"r":false,"m":[{"stat":"ini","val":1}],"e":[]},{"n":"Lanza de leva","t":"arma_2m","k":"Buena Calidad","p":3,"det":"Alcance +1 · 25 % de dejar Lisiado 3 turnos","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[{"nombre":"Lisiado","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar Lisiado 3 turnos."}]}],"Común":[{"n":"Cuchillo de cazador","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 4: 1 dado de daño.","d":4,"f":0,"r":false,"m":[],"e":[]},{"n":"Cuchillo de cocina reconvertido","t":"arma_1m","k":"Común","p":1,"det":"PdG +1","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1}],"e":[]},{"n":"Daga","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 4: 1 dado de daño +1 fijo.","d":4,"f":1,"r":false,"m":[],"e":[]},{"n":"Estileto común","t":"arma_1m","k":"Común","p":1,"det":"crítico +1","d":4,"f":0,"r":false,"m":[{"stat":"crit","val":1}],"e":[]},{"n":"Horquilla","t":"arma_1m","k":"Común","p":1,"det":"alcance +1","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Lanza corta","t":"arma_1m","k":"Común","p":2,"det":"alcance +1","d":4,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Lezna de zapatero","t":"arma_1m","k":"Común","p":1,"det":"PdG +1 · 25 % de dejar Lisiado 3 turnos (pincha donde duele)","d":4,"f":0,"r":false,"m":[{"stat":"pdg","val":1}],"e":[{"nombre":"Lisiado","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar Lisiado 3 turnos (pincha donde duele)."}]},{"n":"Pica Hielos","t":"arma_1m","k":"Común","p":2,"det":"Arma de una mano, Tipo 4: 2 dados de daño.","d":4,"f":0,"r":false,"m":[],"e":[]}]},"m8":{"Raro":[{"n":"Alabarda de guardia","t":"arma_2m","k":"Raro","p":2,"det":"Arma de dos manos, Tipo 8. Alcance +1. Puede Derribar (25%).","d":8,"f":1,"r":false,"m":[{"stat":"rng","val":1}],"e":[{"nombre":"Derribar","caras":4,"exitos":1,"dado":"","detalle":"Si entra, el objetivo cae al suelo (recordatorio: aplicarlo a mano)."}]},{"n":"Hacha arrojadiza","t":"arma_1m","k":"Raro","p":2,"det":"Alcance +2 · 50 % de dejar Sangrado","d":8,"f":0,"r":false,"m":[{"stat":"rng","val":2}],"e":[{"nombre":"Sangrado","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar Sangrado."}]},{"n":"Hacha danesa","t":"arma_1m","k":"Raro","p":2,"det":"alcance +1. Rompe armadura. ","d":8,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha de doble filo","t":"arma_1m","k":"Raro","p":3,"det":"Rompe armadura. Ignora 1 resistencia al crítico","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."},{"nombre":"Ignora 1 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}]},{"n":"Hacha de guerra pesada","t":"arma_1m","k":"Raro","p":2,"det":"Arruina armadura","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Arruina armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo (suma 1 stack)."}]},{"n":"Hacha del Caudillo","t":"arma_1m","k":"Raro","p":2,"det":"Bloqueo +1 · Cada golpe deja 1 stack de Armadura rota","d":8,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Cada golpe deja 1 stack de Armadura rota."}]},{"n":"Hacha del Jefe de Guerra","t":"arma_1m","k":"Raro","p":2,"det":"alcance +1. Rompe armadura. ","d":8,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Sagaris","t":"arma_1m","k":"Raro","p":2,"det":"Rompe armadura. Sangrado.","d":8,"f":1,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."},{"nombre":"Sangrado","caras":1,"exitos":1,"dado":"","detalle":"Aplicale Sangrado al objetivo."}]}],"Buena Calidad":[{"n":"Espadón de batalla","t":"arma_2m","k":"Buena Calidad","p":2,"det":"Arma de dos manos, Tipo 8.","d":8,"f":1,"r":false,"m":[],"e":[]},{"n":"Hacha con pico","t":"arma_1m","k":"Buena Calidad","p":2,"det":"ignora 1 de resistencia al crítico","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Ignora 1 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}]},{"n":"Hacha de abordaje","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Bloqueo +1 · Alcance +1","d":8,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"rng","val":1}],"e":[]},{"n":"Hacha de batalla","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Rompe armadura. +1 al bloqueo","d":8,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha de guerra","t":"arma_1m","k":"Buena Calidad","p":2,"det":"25 % de dejar 1 stack de Armadura rota","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar 1 stack de Armadura rota."}]},{"n":"Hacha de guerra ligera","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Arma de una mano, Tipo 8: 2 dados de daño +1 fijo.","d":8,"f":1,"r":false,"m":[],"e":[]},{"n":"Hacha de la furia roja","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Rompe armadura. +1 al bloqueo","d":8,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha dentada","t":"arma_1m","k":"Buena Calidad","p":2,"det":"50% de dejar sangrando","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Sangrado","caras":2,"exitos":1,"dado":"","detalle":"Aplicale Sangrado al objetivo."}]}],"Excepcional":[{"n":"Gran hacha de doble filo","t":"arma_2m","k":"Excepcional","p":4,"det":"Bloqueo +2 · Cada golpe deja 1 stack de Armadura rota","d":8,"f":0,"r":false,"m":[{"stat":"bloqueo","val":2}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Cada golpe deja 1 stack de Armadura rota."}]},{"n":"Hacha de guardia real","t":"arma_1m","k":"Excepcional","p":2,"det":"parry +2, bloqueo +3","d":8,"f":1,"r":false,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":3}],"e":[]},{"n":"Hacha de madera mística","t":"arma_1m","k":"Excepcional","p":2,"det":"Rompe armadura. Drena 50% del daño.","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."},{"nombre":"Drena vida","caras":1,"exitos":1,"dado":"","detalle":"Te curás la mitad del daño que hiciste."}]},{"n":"Hacha del Cazador de Armaduras","t":"arma_1m","k":"Excepcional","p":3,"det":"+2 de daño fijo · Bloqueo +2 · Alcance +1 · Cada golpe deja 2 stacks de Armadura rota","d":8,"f":2,"r":false,"m":[{"stat":"bloqueo","val":2},{"stat":"rng","val":1}],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Cada golpe deja 2 stacks de Armadura rota."}]},{"n":"Hacha filo de diamante","t":"arma_1m","k":"Excepcional","p":3,"det":"Crítico aumentado. Arruina armadura.","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Arruina armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo (suma 2 stacks)."}]}],"Común":[{"n":"Hacha","t":"arma_1m","k":"Común","p":1,"det":"Rompe armadura.","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha de constructor","t":"arma_1m","k":"Común","p":2,"det":"Rompe armadura","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha de leñador","t":"arma_1m","k":"Común","p":2,"det":"Arma de una mano, Tipo 8: 2 dados de daño.","d":8,"f":0,"r":false,"m":[],"e":[]},{"n":"Hacha del clan","t":"arma_1m","k":"Común","p":1,"det":"Rompe armadura.","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Hacha oxidada","t":"arma_1m","k":"Común","p":1,"det":"50% de chances de envenenar","d":8,"f":0,"r":false,"m":[],"e":[{"nombre":"Envenenar","caras":2,"exitos":1,"dado":"","detalle":"Aplicale Veneno al objetivo."}]},{"n":"Hachuela","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 8: 1 dado de daño.","d":8,"f":0,"r":false,"m":[],"e":[]},{"n":"Lanza de caza","t":"arma_2m","k":"Común","p":1,"det":"Arma de dos manos, Tipo 8. Alcance +1.","d":8,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Tomahawk","t":"arma_1m","k":"Común","p":1,"det":"alcance +1","d":8,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[]}]},"m12":{"Común":[{"n":"Almádena de cantero","t":"arma_2m","k":"Común","p":1,"det":"Sin bonos ni efectos.","d":12,"f":0,"r":false,"m":[],"e":[]},{"n":"Pico de demolición","t":"arma_2m","k":"Común","p":1,"det":"+1 de daño fijo","d":12,"f":1,"r":false,"m":[],"e":[]}],"Excepcional":[{"n":"Espadón colosal del asedio","t":"arma_2m","k":"Excepcional","p":3,"det":"Parry +1","d":12,"f":0,"r":false,"m":[{"stat":"parry","val":1}],"e":[]},{"n":"Martillo del Titán","t":"arma_2m","k":"Excepcional","p":3,"det":"Arma de dos manos, Tipo 12. Puede Aturdir (25%).","d":12,"f":0,"r":false,"m":[],"e":[{"nombre":"Aturdir","caras":4,"exitos":1,"dado":"","detalle":"Si entra, el objetivo queda Aturdido hasta su próximo turno."}]}],"Raro":[{"n":"Hacha de derribo","t":"arma_2m","k":"Raro","p":2,"det":"Bloqueo +1 · 25 % de derribar al golpeado (cae al suelo)","d":12,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Derribar","caras":4,"exitos":1,"dado":"","detalle":"25 % de derribar al golpeado (cae al suelo)."}]}],"Buena Calidad":[{"n":"Mazo de demolición","t":"arma_2m","k":"Buena Calidad","p":1,"det":"+1 de daño fijo · Bloqueo +1","d":12,"f":1,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[]}]},"r6":{"Buena Calidad":[{"n":"Arcabuz de cubierta","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Arma de una mano a distancia, Tipo 6. Rango +3.","d":6,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Arco de cuerno","t":"arma_2m","k":"Buena Calidad","p":2,"det":"Alcance +4","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":4}],"e":[]},{"n":"Arco largo de tejo","t":"arma_2m","k":"Buena Calidad","p":2,"det":"Arma de dos manos a distancia, Tipo 6. Rango +5.","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":5}],"e":[]},{"n":"Ballesta de almenara","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Arma de una mano a distancia, Tipo 6. Rango +3.","d":6,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Ballesta de mano","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Arma de una mano a distancia, Tipo 6. Rango +3.","d":6,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Ballesta de repetición","t":"arma_1m","k":"Buena Calidad","p":1,"det":"+2 de daño fijo · Alcance +4","d":6,"f":2,"r":true,"m":[{"stat":"rng","val":4}],"e":[]},{"n":"Ballesta del arbusto","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Arma de una mano a distancia, Tipo 6. Rango +3.","d":6,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[]}],"Excepcional":[{"n":"Arco compuesto élfico","t":"arma_2m","k":"Excepcional","p":3,"det":"Arma de dos manos a distancia, Tipo 6. Rango +7. PdG +2.","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":7},{"stat":"pdg","val":2}],"e":[]},{"n":"Arco de fuego del centinela","t":"arma_2m","k":"Excepcional","p":3,"det":"Alcance +6 · PdG +1 · 33 % de dejar terreno incendiado en la casilla del golpeado","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":6},{"stat":"pdg","val":1}],"e":[{"nombre":"Prende fuego","caras":6,"exitos":2,"dado":"","detalle":"33 % de dejar terreno incendiado en la casilla del golpeado."}]}],"Común":[{"n":"Arco corto","t":"arma_2m","k":"Común","p":1,"det":"Arma de dos manos a distancia, Tipo 6. Rango +4.","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":4}],"e":[]},{"n":"Arco de rama","t":"arma_2m","k":"Común","p":1,"det":"Alcance +3","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Arco del rastreador","t":"arma_2m","k":"Común","p":1,"det":"Arma de dos manos a distancia, Tipo 6. Rango +4.","d":6,"f":0,"r":true,"m":[{"stat":"rng","val":4}],"e":[]}],"Raro":[{"n":"Arco del cazador de víboras","t":"arma_2m","k":"Raro","p":2,"det":"+1 de daño fijo · Alcance +5 · 50 % de dejar Veneno (2 stacks)","d":6,"f":1,"r":true,"m":[{"stat":"rng","val":5}],"e":[{"nombre":"Envenenar","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar Veneno (2 stacks)."}]}]},"r8":{"Buena Calidad":[{"n":"Arcabuz de mecha","t":"arma_1m","k":"Buena Calidad","p":1,"det":"+1 de daño fijo · Alcance +4","d":8,"f":1,"r":true,"m":[{"stat":"rng","val":4}],"e":[]}],"Raro":[{"n":"Ballesta de asedio","t":"arma_2m","k":"Raro","p":2,"det":"Alcance +5 · 50 % de dejar 1 stack de Armadura rota","d":8,"f":0,"r":true,"m":[{"stat":"rng","val":5}],"e":[{"nombre":"Rompe armadura","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar 1 stack de Armadura rota."}]},{"n":"Ballesta pesada","t":"arma_2m","k":"Raro","p":2,"det":"Arma de dos manos a distancia, Tipo 8. Rango +5. Puede Romper armadura (25%).","d":8,"f":2,"r":true,"m":[{"stat":"rng","val":5}],"e":[{"nombre":"Rompe armadura","caras":4,"exitos":1,"dado":"","detalle":"Si entra, la armadura del objetivo se rompe (recordatorio: aplicarlo a mano)."}]},{"n":"Pistola de chispa","t":"arma_1m","k":"Raro","p":2,"det":"Arma de una mano a distancia, Tipo 8. Rango +4. El disparo hace ruido: alerta a los que estén cerca.","d":8,"f":0,"r":true,"m":[{"stat":"rng","val":4}],"e":[{"nombre":"Estruendo","caras":1,"exitos":1,"dado":"","detalle":"El disparo se oye a la redonda: avisale al GM para que los cercanos se alerten."}]},{"n":"Trabuco del contrabandista","t":"arma_1m","k":"Raro","p":1,"det":"+2 de daño fijo · Alcance +4 · PdG +1 · 25 % de derribar al golpeado (cae al suelo)","d":8,"f":2,"r":true,"m":[{"stat":"rng","val":4},{"stat":"pdg","val":1}],"e":[{"nombre":"Derribar","caras":4,"exitos":1,"dado":"","detalle":"25 % de derribar al golpeado (cae al suelo)."}]}],"Excepcional":[{"n":"Pistola de duelo de plata","t":"arma_1m","k":"Excepcional","p":2,"det":"Arma de una mano a distancia, Tipo 8. Rango +5. Crítico frecuente +1.","d":8,"f":2,"r":true,"m":[{"stat":"rng","val":5},{"stat":"crit","val":1}],"e":[]}]},"m10":{"Común":[{"n":"Bastón de monje","t":"arma_1m","k":"Común","p":1,"det":"alcance +1","d":10,"f":1,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Bastón del trueno","t":"arma_1m","k":"Común","p":1,"det":"alcance +1","d":10,"f":1,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Cachiporra","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 10: 1 dado de daño.","d":10,"f":0,"r":false,"m":[],"e":[]},{"n":"Garrote","t":"arma_1m","k":"Común","p":2,"det":"Arma de una mano, Tipo 10: 2 dados de daño.","d":10,"f":0,"r":false,"m":[],"e":[]},{"n":"Martillo de bola","t":"arma_1m","k":"Común","p":2,"det":"bloqueo +1","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[]},{"n":"Maza","t":"arma_1m","k":"Común","p":2,"det":"Daño amplificado.","d":10,"f":0,"r":false,"m":[],"e":[]},{"n":"Maza de hierro","t":"arma_1m","k":"Común","p":1,"det":"bloqueo +1","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[]},{"n":"Porra de guardia","t":"arma_1m","k":"Común","p":1,"det":"Bloqueo +1 · 25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Demora","caras":4,"exitos":1,"dado":"","detalle":"25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)."}]}],"Excepcional":[{"n":"Báculo Shao Lin","t":"arma_1m","k":"Excepcional","p":2,"det":"parry+2, bloqueo +1, alcance +1","d":10,"f":1,"r":false,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":1},{"stat":"rng","val":1}],"e":[]},{"n":"Guadaña del segador","t":"arma_2m","k":"Excepcional","p":3,"det":"Arma de dos manos, Tipo 10. Crítico frecuente +1. Provoca Sangrado (50%).","d":10,"f":0,"r":false,"m":[{"stat":"crit","val":1}],"e":[{"nombre":"Sangrado","caras":2,"exitos":1,"dado":"","detalle":"Aplicale Sangrado al objetivo (recordatorio: aplicarlo a mano)."}]},{"n":"Martillo de guerra a dos manos","t":"arma_2m","k":"Excepcional","p":4,"det":"Bloqueo +2 · 25 % de dejar Aturdido (Stun: sin Nitros 2 turnos y toda Evasión sale 1)","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":2}],"e":[{"nombre":"Aturdir","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar Aturdido (Stun: sin Nitros 2 turnos y toda Evasión sale 1)."}]},{"n":"Martillo de guerra rúnico","t":"arma_1m","k":"Excepcional","p":3,"det":"Deja en pajaritos","d":10,"f":1,"r":false,"m":[],"e":[{"nombre":"Pajaritos","caras":1,"exitos":1,"dado":"","detalle":"El objetivo queda aturdido (pajaritos)."}]},{"n":"Maza del Peñasco","t":"arma_1m","k":"Excepcional","p":3,"det":"+2 de daño fijo · Bloqueo +2 · Parry +1 · 50 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)","d":10,"f":2,"r":false,"m":[{"stat":"bloqueo","val":2},{"stat":"parry","val":1}],"e":[{"nombre":"Demora","caras":2,"exitos":1,"dado":"","detalle":"50 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)."}]},{"n":"Rompefilas","t":"arma_1m","k":"Excepcional","p":4,"det":"Expulsa 2 casilleros para atrás + FUERZA vs CONST. Si choca contra algo, daño directo igual a la diferencia","d":10,"f":0,"r":false,"m":[],"e":[{"nombre":"Empuje","caras":1,"exitos":1,"dado":"","detalle":"Lo empuja 2 casilleros (FUE vs CON). Si choca contra algo, daño directo igual a la diferencia."}]}],"Buena Calidad":[{"n":"Báculo de batalla","t":"arma_1m","k":"Buena Calidad","p":2,"det":"alcance +1, bloqueo +1","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"rng","val":1}],"e":[]},{"n":"Báculo del Sumo Profeta","t":"arma_1m","k":"Buena Calidad","p":2,"det":"alcance +1, bloqueo +1","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"rng","val":1}],"e":[]},{"n":"Báculo del inquisidor","t":"arma_1m","k":"Buena Calidad","p":2,"det":"alcance +1, bloqueo +1","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"rng","val":1}],"e":[]},{"n":"Estrella del alba","t":"arma_1m","k":"Buena Calidad","p":1,"det":"+1 de daño fijo · 33 % de dejar 1 stack de Armadura rota","d":10,"f":1,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":6,"exitos":2,"dado":"","detalle":"33 % de dejar 1 stack de Armadura rota."}]},{"n":"Martillo de cabeza plana","t":"arma_1m","k":"Buena Calidad","p":2,"det":"bloqueo +2","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":2}],"e":[]},{"n":"Martillo de herrero","t":"arma_1m","k":"Buena Calidad","p":1,"det":"+1 de daño fijo · Bloqueo +1 · Parry +1 · 25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)","d":10,"f":1,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"parry","val":1}],"e":[{"nombre":"Demora","caras":4,"exitos":1,"dado":"","detalle":"25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)."}]},{"n":"Martillo ergonómico","t":"arma_1m","k":"Buena Calidad","p":1,"det":"bloqueo +3","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":3}],"e":[]},{"n":"Maza de guardia","t":"arma_1m","k":"Buena Calidad","p":3,"det":"Arma de una mano, Tipo 10: 3 dados de daño.","d":10,"f":0,"r":false,"m":[],"e":[]}],"Raro":[{"n":"Cachiporra reforzada","t":"arma_1m","k":"Raro","p":2,"det":"+2 de daño fijo · Bloqueo +1 · 25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)","d":10,"f":2,"r":false,"m":[{"stat":"bloqueo","val":1}],"e":[{"nombre":"Demora","caras":4,"exitos":1,"dado":"","detalle":"25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)."}]},{"n":"Hacha de batalla a dos manos","t":"arma_2m","k":"Raro","p":3,"det":"Arma de dos manos, Tipo 10.","d":10,"f":0,"r":false,"m":[],"e":[]},{"n":"Lucero del alba","t":"arma_1m","k":"Raro","p":2,"det":"Ignora 1 de res al crítico, alcance +1","d":10,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[{"nombre":"Ignora 1 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}]},{"n":"Mangual","t":"arma_1m","k":"Raro","p":2,"det":"Alcance +1.","d":10,"f":1,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Mangual","t":"arma_1m","k":"Raro","p":4,"det":"alcance +1","d":10,"f":0,"r":false,"m":[{"stat":"rng","val":1}],"e":[]},{"n":"Martillo de sargento","t":"arma_1m","k":"Raro","p":4,"det":"Arma de una mano, Tipo 10: 4 dados de daño. Parry +1.","d":10,"f":0,"r":false,"m":[{"stat":"parry","val":1}],"e":[]},{"n":"Martillo del sargento mayor","t":"arma_1m","k":"Raro","p":2,"det":"Bloqueo +1 · Parry +1 · 17 % de dejar Aturdido (Stun: sin Nitros 2 turnos y toda Evasión sale 1)","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":1},{"stat":"parry","val":1}],"e":[{"nombre":"Aturdir","caras":6,"exitos":1,"dado":"","detalle":"17 % de dejar Aturdido (Stun: sin Nitros 2 turnos y toda Evasión sale 1)."}]},{"n":"Maza de acero","t":"arma_1m","k":"Raro","p":3,"det":"Bloqueo +3","d":10,"f":0,"r":false,"m":[{"stat":"bloqueo","val":3}],"e":[]}]},"m6":{"Común":[{"n":"Bastón ferrado","t":"arma_2m","k":"Común","p":1,"det":"Arma de dos manos, Tipo 6. Parry +1.","d":6,"f":1,"r":false,"m":[{"stat":"parry","val":1}],"e":[]},{"n":"Espada ancha","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 6: 1 dado de daño +1 fijo.","d":6,"f":1,"r":false,"m":[],"e":[]},{"n":"Espada corta de instrucción","t":"arma_1m","k":"Común","p":2,"det":"Arma de una mano, Tipo 6: 2 dados de daño.","d":6,"f":0,"r":false,"m":[],"e":[]},{"n":"Espada de alquiler oxidada","t":"arma_1m","k":"Común","p":1,"det":"envenena x 50% de chances","d":6,"f":0,"r":false,"m":[],"e":[{"nombre":"Envenenar","caras":2,"exitos":1,"dado":"","detalle":"Aplicale Veneno al objetivo."}]},{"n":"Espada de taberna","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano, Tipo 6: 1 dado de daño +1 fijo.","d":6,"f":1,"r":false,"m":[],"e":[]},{"n":"Hoz ceremonial","t":"arma_1m","k":"Común","p":1,"det":"sangrado 50%","d":6,"f":0,"r":false,"m":[],"e":[{"nombre":"Sangrado","caras":2,"exitos":1,"dado":"","detalle":"Aplicale Sangrado al objetivo."}]},{"n":"Machete de chacarero","t":"arma_1m","k":"Común","p":1,"det":"+1 de daño fijo · Iniciativa +1","d":6,"f":1,"r":false,"m":[{"stat":"ini","val":1}],"e":[]},{"n":"Sable de abordaje","t":"arma_1m","k":"Común","p":1,"det":"iniciativa +1","d":6,"f":0,"r":false,"m":[{"stat":"ini","val":1}],"e":[]}],"Buena Calidad":[{"n":"Cimitarra de guardia","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Parry +2","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2}],"e":[]},{"n":"Cimitarra del contramaestre","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Parry +2","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2}],"e":[]},{"n":"Espada de la guardia","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Parry +1 · Crít. frecuente +1","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":1},{"stat":"crit","val":1}],"e":[]},{"n":"Espada del Jefe de los Mil Caminos","t":"arma_1m","k":"Buena Calidad","p":1,"det":"pdg +2","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":2}],"e":[]},{"n":"Espada larga","t":"arma_1m","k":"Buena Calidad","p":1,"det":"pdg +2","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":2}],"e":[]},{"n":"Falchion","t":"arma_1m","k":"Buena Calidad","p":2,"det":"Ingora 1 de resistencia al crítico","d":6,"f":0,"r":false,"m":[],"e":[{"nombre":"Ignora 1 de Res. crítico","caras":1,"exitos":1,"dado":"","detalle":"Al calcular el crítico, el objetivo tiene 1 menos de resistencia."}]},{"n":"Sable de caballería","t":"arma_1m","k":"Buena Calidad","p":1,"det":"pdg +1, parry +1","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":1},{"stat":"parry","val":1}],"e":[]},{"n":"Sable del sargento","t":"arma_1m","k":"Buena Calidad","p":2,"det":"pdg +1","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":1}],"e":[]}],"Raro":[{"n":"Cuchilla de carnicero","t":"arma_1m","k":"Raro","p":2,"det":"Rompe armadura","d":6,"f":0,"r":false,"m":[],"e":[{"nombre":"Rompe armadura","caras":1,"exitos":1,"dado":"","detalle":"Aplicale el estado Armadura rota al objetivo."}]},{"n":"Espada bastarda","t":"arma_1m","k":"Raro","p":2,"det":"parry+1, bloqueo+1","d":6,"f":1,"r":false,"m":[{"stat":"parry","val":1},{"stat":"bloqueo","val":1}],"e":[]},{"n":"Espada bastarda del Espectro","t":"arma_1m","k":"Raro","p":2,"det":"parry+1, bloqueo+1","d":6,"f":1,"r":false,"m":[{"stat":"parry","val":1},{"stat":"bloqueo","val":1}],"e":[]},{"n":"Espada vampírica menor","t":"arma_1m","k":"Raro","p":2,"det":"Parry +1 · Recupera el 25 % del daño hecho (no pasa el máximo de HP)","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":1}],"e":[{"nombre":"Drena vida","caras":1,"exitos":1,"dado":"","detalle":"Recupera el 25 % del daño hecho (no pasa el máximo de HP)."}]},{"n":"Katana","t":"arma_1m","k":"Raro","p":2,"det":"pdg+2, crítico +1","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":2},{"stat":"crit","val":1}],"e":[]},{"n":"Katana de maestro","t":"arma_1m","k":"Raro","p":2,"det":"Parry +2 · Iniciativa +1 · Crít. frecuente +1 · 50 % de dejar Sangrado","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2},{"stat":"ini","val":1},{"stat":"crit","val":1}],"e":[{"nombre":"Sangrado","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar Sangrado."}]},{"n":"Katana del cazarrecompensas","t":"arma_1m","k":"Raro","p":2,"det":"pdg+2, crítico +1","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":2},{"stat":"crit","val":1}],"e":[]},{"n":"Mandoble","t":"arma_1m","k":"Raro","p":2,"det":"Parry+2, bloqueo+1","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":1}],"e":[]}],"Excepcional":[{"n":"Espada larga de Dorne","t":"arma_1m","k":"Excepcional","p":2,"det":"pdg+2, envenena","d":6,"f":0,"r":false,"m":[{"stat":"pdg","val":2}],"e":[{"nombre":"Envenenar","caras":1,"exitos":1,"dado":"","detalle":"Aplicale Veneno al objetivo."}]},{"n":"Espadón","t":"arma_1m","k":"Excepcional","p":4,"det":"parry +2, bloqueo +3","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":3}],"e":[]},{"n":"Espadón de acero de Toledo","t":"arma_2m","k":"Excepcional","p":4,"det":"Parry +2 · Crít. frecuente +2 · Cada golpe deja Sangrado","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2},{"stat":"crit","val":2}],"e":[{"nombre":"Sangrado","caras":1,"exitos":1,"dado":"","detalle":"Cada golpe deja Sangrado."}]},{"n":"Flamberge","t":"arma_1m","k":"Excepcional","p":1,"det":"sangrado, +1 pdg","d":6,"f":2,"r":false,"m":[{"stat":"pdg","val":1}],"e":[{"nombre":"Sangrado","caras":1,"exitos":1,"dado":"","detalle":"Aplicale Sangrado al objetivo."}]},{"n":"Gladius","t":"arma_1m","k":"Excepcional","p":3,"det":"parry +2, bloqueo +2","d":6,"f":0,"r":false,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":2}],"e":[]},{"n":"Katana del viento","t":"arma_1m","k":"Excepcional","p":3,"det":"Iniciativa +2 · Parry +2 · Crít. frecuente +2 · 50 % de dejar Lisiado 3 turnos","d":6,"f":0,"r":false,"m":[{"stat":"ini","val":2},{"stat":"parry","val":2},{"stat":"crit","val":2}],"e":[{"nombre":"Lisiado","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar Lisiado 3 turnos."}]}]},"r12":{"Raro":[{"n":"Bombarda portátil","t":"arma_2m","k":"Raro","p":1,"det":"+1 de daño fijo · Alcance +5 · 25 % de dejar terreno incendiado en la casilla del golpeado","d":12,"f":1,"r":true,"m":[{"stat":"rng","val":5}],"e":[{"nombre":"Prende fuego","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar terreno incendiado en la casilla del golpeado."}]},{"n":"Lanzabombas","t":"arma_2m","k":"Raro","p":1,"det":"+1 de daño fijo · Alcance +4 · 25 % de derribar al golpeado (cae al suelo)","d":12,"f":1,"r":true,"m":[{"stat":"rng","val":4}],"e":[{"nombre":"Derribar","caras":4,"exitos":1,"dado":"","detalle":"25 % de derribar al golpeado (cae al suelo)."}]},{"n":"Lanzallamas","t":"arma_2m","k":"Raro","p":4,"det":"Lanzallamas basico a dos manos, Rango 4. Prende fuego. 1d8 por stack de fuego.","d":12,"f":0,"r":true,"m":[],"e":[{"nombre":"Prende fuego","caras":1,"exitos":1,"dado":"1d8","detalle":"Prende fuego al objetivo: 1d8 por cada stack de fuego."}]}],"Excepcional":[{"n":"Cañón de campaña de mano","t":"arma_2m","k":"Excepcional","p":2,"det":"Alcance +5 · 25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)","d":12,"f":0,"r":true,"m":[{"stat":"rng","val":5}],"e":[{"nombre":"Demora","caras":4,"exitos":1,"dado":"","detalle":"25 % de bajar al golpeado 1 lugar en la tabla de iniciativa (definitivo)."}]},{"n":"Lanzallamas de asalto","t":"arma_2m","k":"Excepcional","p":2,"det":"+1 de daño fijo · Alcance +3 · 50 % de dejar terreno incendiado en la casilla del golpeado","d":12,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[{"nombre":"Prende fuego","caras":2,"exitos":1,"dado":"","detalle":"50 % de dejar terreno incendiado en la casilla del golpeado."}]}],"Buena Calidad":[{"n":"Cañón de mano","t":"arma_1m","k":"Buena Calidad","p":1,"det":"Alcance +3","d":12,"f":0,"r":true,"m":[{"stat":"rng","val":3}],"e":[]}]},"r4":{"Común":[{"n":"Cerbatana","t":"arma_1m","k":"Común","p":1,"det":"Alcance +3 · 25 % de dejar Veneno (2 stacks)","d":4,"f":0,"r":true,"m":[{"stat":"rng","val":3}],"e":[{"nombre":"Envenenar","caras":4,"exitos":1,"dado":"","detalle":"25 % de dejar Veneno (2 stacks)."}]},{"n":"Honda de cuero","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano a distancia, Tipo 4. Rango +3.","d":4,"f":0,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Honda de pastor","t":"arma_1m","k":"Común","p":1,"det":"+1 de daño fijo · Alcance +3","d":4,"f":1,"r":true,"m":[{"stat":"rng","val":3}],"e":[]},{"n":"Honda del cazador de jabalíes","t":"arma_1m","k":"Común","p":1,"det":"Arma de una mano a distancia, Tipo 4. Rango +3.","d":4,"f":0,"r":true,"m":[{"stat":"rng","val":3}],"e":[]}]},"r10":{"Excepcional":[{"n":"Rifle de cerrojo del cazador","t":"arma_2m","k":"Excepcional","p":2,"det":"Alcance +6 · PdG +2","d":10,"f":0,"r":true,"m":[{"stat":"rng","val":6},{"stat":"pdg","val":2}],"e":[]}]}},"def":{"escudo":{"Raro":[{"n":"Broquel de acero","t":"escudo_1m","k":"Raro","p":2,"det":"Parry +3, resistencia a críticos tipo 4 y 6","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"parry","val":3}]},{"n":"Escudo de torre","t":"escudo_1m","k":"Raro","p":6,"det":"parry +1, bloqueo +3","def":9,"m":[{"stat":"parry","val":1},{"stat":"bloqueo","val":3}]},{"n":"Escudo pavés","t":"escudo_1m","k":"Raro","p":4,"det":"Resistencia a críticos tipo 8: +1. Bloqueo +1, Resistencia crit tipo 10 y 12","def":7,"m":[{"stat":"bloqueo","val":1},{"stat":"tipo3","val":1}]},{"n":"Escudo triangular","t":"escudo_1m","k":"Raro","p":4,"det":"Resistencia a críticos tipo 6 y 8: +1.","def":8,"m":[{"stat":"bloqueo","val":2},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Égida menor","t":"escudo_1m","k":"Raro","p":3,"det":"Resistencia a críticos tipo 4, 6 y 8: +1","def":6,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]}],"Común":[{"n":"Broquel de bronce","t":"escudo_1m","k":"Común","p":1,"det":"parry +1","def":3,"m":[{"stat":"parry","val":1}]},{"n":"Escudo de asalto","t":"escudo_1m","k":"Común","p":4,"det":"bloqueo +2","def":4,"m":[{"stat":"bloqueo","val":2}]},{"n":"Escudo de cuero endurecido","t":"escudo_1m","k":"Común","p":3,"det":"Resistencia a críticos tipo 4 y 6","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Escudo de madera","t":"escudo_1m","k":"Común","p":4,"det":"Resistencia a críticos tipo 6: +1.","def":5,"m":[{"stat":"tipo2","val":1}]},{"n":"Escudo pequeño","t":"escudo_1m","k":"Común","p":4,"det":"Resistencia a críticos tipo 6: +1. Resistencia +1 a tipos 6, 8 y 10","def":4,"m":[{"stat":"tipo2","val":1}]},{"n":"Rodela de cuero","t":"escudo_1m","k":"Común","p":1,"det":"Resistencia a críticos tipo 4","def":3,"m":[{"stat":"tipo1","val":1}]},{"n":"Rodela de madera","t":"escudo_1m","k":"Común","p":3,"det":"Resistencia a críticos tipo 6: +1.","def":4,"m":[{"stat":"tipo2","val":1}]},{"n":"Rodela de tablas","t":"escudo_1m","k":"Común","p":2,"det":"Defensa +3 · Res. crítico Tipo 4 +1 · Bloqueo +1","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"bloqueo","val":1}]}],"Buena Calidad":[{"n":"Broquel de hierro","t":"escudo_1m","k":"Buena Calidad","p":2,"det":"parry +2, resistencia a críticos tipo 6","def":4,"m":[{"stat":"tipo2","val":1},{"stat":"parry","val":2}]},{"n":"Escudo abollado del veterano","t":"escudo_1m","k":"Buena Calidad","p":4,"det":"bloqueo +2","def":7,"m":[{"stat":"bloqueo","val":2}]},{"n":"Escudo de acero laminado","t":"escudo_1m","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipo 8: +1.","def":7,"m":[{"stat":"tipo3","val":1}]},{"n":"Escudo de escamas","t":"escudo_1m","k":"Buena Calidad","p":4,"det":"Resistencia a críticos tipo 8: +1.","def":6,"m":[{"stat":"tipo3","val":1}]},{"n":"Escudo grande","t":"escudo_1m","k":"Buena Calidad","p":4,"det":"bloqueo +2","def":7,"m":[{"stat":"bloqueo","val":2}]},{"n":"Escudo romano","t":"escudo_1m","k":"Buena Calidad","p":6,"det":"bloqueo +3","def":10,"m":[{"stat":"bloqueo","val":3}]},{"n":"Escudo triangular","t":"escudo_1m","k":"Buena Calidad","p":3,"det":"bloqueo +2","def":6,"m":[{"stat":"bloqueo","val":2}]}],"Excepcional":[{"n":"Broquel de titanio","t":"escudo_1m","k":"Excepcional","p":2,"det":"Parry +3, bloqueo +1, resistencia a críticos tipo 4 y 6","def":7,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"parry","val":3},{"stat":"bloqueo","val":1}]},{"n":"Broquel del Rompeolas","t":"escudo_1m","k":"Excepcional","p":3,"det":"Defensa +6 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 8 +1 · Bloqueo +2 · Parry +1","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo3","val":1},{"stat":"bloqueo","val":2},{"stat":"parry","val":1}]},{"n":"Rodela de cobra","t":"escudo_1m","k":"Excepcional","p":2,"det":"parry +2, bloqueo +1. Si bloquea con exito, +2 a pg en próximo ataque","def":4,"m":[{"stat":"parry","val":2},{"stat":"bloqueo","val":1}]},{"n":"Égida de Gladiador","t":"escudo_1m","k":"Excepcional","p":3,"det":"bloqueo +4, +1 a resistencia de los críticos tipo 4, 6, 8 y 10","def":8,"m":[{"stat":"bloqueo","val":4},{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1}]}]},"pies":{"Común":[{"n":"Alpargatas de yute","t":"pies","k":"Común","p":0,"det":"Movimiento +1.","def":1,"m":[{"stat":"mov","val":1}]},{"n":"Botas de cuero","t":"pies","k":"Común","p":2,"det":"Defensa +6.","def":6,"m":[]},{"n":"Botas de lona de recluta","t":"pies","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":2,"m":[{"stat":"tipo2","val":1}]},{"n":"Botas de suela claveteada","t":"pies","k":"Común","p":1,"det":"Resistencia a críticos tipo 4 y 6: +1.","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Botines de soldado raso","t":"pies","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":2,"m":[{"stat":"tipo2","val":1}]},{"n":"Escarpines de fieltro","t":"pies","k":"Común","p":0,"det":"Evasión +1.","def":1,"m":[{"stat":"eva","val":1}]},{"n":"Sabatones de hojalata","t":"pies","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":3,"m":[{"stat":"tipo2","val":1}]},{"n":"alpargatas de cuero","t":"pies","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":3,"m":[{"stat":"tipo2","val":1}]}],"Buena Calidad":[{"n":"Borceguíes de punta de acero","t":"pies","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipo 8: +1.","def":4,"m":[{"stat":"tipo3","val":1}]},{"n":"Botas de cabalgata","t":"pies","k":"Buena Calidad","p":1,"det":"Resistencia a críticos tipo 8: +1. Defensa +5. Movimiento +1.","def":5,"m":[{"stat":"tipo3","val":1},{"stat":"mov","val":1}]},{"n":"Botas de marcha reforzadas","t":"pies","k":"Buena Calidad","p":1,"det":"Resistencia a críticos tipos 4: +1. HP máximo +10","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"hpmax","val":10}]},{"n":"Botas de placas del guardia de avanzada","t":"pies","k":"Buena Calidad","p":3,"det":"Reduce críticos 6 y 8","def":7,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Botines tachonados de correo","t":"pies","k":"Buena Calidad","p":1,"det":"Resistencia a críticos tipos 6: +1. Iniciativa +1.","def":4,"m":[{"stat":"tipo2","val":1},{"stat":"ini","val":1}]},{"n":"Sabatones de escamas","t":"pies","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipo 6: +2. Resistencia a críticos tipos 4 y 8: +1.","def":2,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]},{"n":"Sabatón","t":"pies","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipo 6 y 8: +1. -1 Movimiento.","def":6,"m":[{"stat":"mov","val":-1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Soquetes de paso ligero","t":"pies","k":"Buena Calidad","p":1,"det":"Evasión +2","def":2,"m":[{"stat":"eva","val":2}]}],"Raro":[{"n":"Botas con espolones de gallo de riña","t":"pies","k":"Raro","p":1,"det":"Resistencia a críticos tipo 4: +2. Resistencia a críticos tipo 6: +1. Iniciativa +2. PdG +1.","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1},{"stat":"ini","val":2},{"stat":"pdg","val":1}]},{"n":"Botas de cuero de rinoceronte","t":"pies","k":"Raro","p":2,"det":"Resistencia a críticos tipos 4, 6 y 8: +1. Movimiento -1.","def":6,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"mov","val":-1}]},{"n":"Botas de hierro del coloso menor","t":"pies","k":"Raro","p":3,"det":"Resistencia a críticos tipo 4 y 6: +2. Resistencia a críticos tipo 8: +1. Hp máximo: +10.","def":8,"m":[{"stat":"hpmax","val":10},{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]},{"n":"Botas de hierro pesadas","t":"pies","k":"Raro","p":4,"det":"Resistencia a críticos tipo 10: +1.","def":10,"m":[{"stat":"tipo4","val":1}]},{"n":"Botas del mensajero veloz","t":"pies","k":"Raro","p":1,"det":"Movimiento +2. Iniciativa +2.","def":3,"m":[{"stat":"mov","val":2},{"stat":"ini","val":2}]},{"n":"Mocasines del rastreador silencioso","t":"pies","k":"Raro","p":1,"det":"Evasión +2. Iniciativa +1.","def":2,"m":[{"stat":"eva","val":2},{"stat":"ini","val":1}]},{"n":"Polainas de malla","t":"pies","k":"Raro","p":1,"det":"Reduce críticos tipo 4 y 6","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Sabatones de acero de meteorito","t":"pies","k":"Raro","p":1,"det":"Resistencia a críticos tipos 8: +1. Resistencia mental +1. Resistencia a CC +1.","def":4,"m":[{"stat":"tipo3","val":1},{"stat":"resm","val":1},{"stat":"rescc","val":1}]}],"Excepcional":[{"n":"Botas de pezuña de yastay","t":"pies","k":"Excepcional","p":2,"det":"Resistencia a críticos tipos 4: +3. Movimiento +2. Resistencia a CC +1. Evasión +1.","def":6,"m":[{"stat":"tipo1","val":3},{"stat":"mov","val":2},{"stat":"eva","val":1},{"stat":"rescc","val":1}]},{"n":"Botas de piel de chupacabras","t":"pies","k":"Excepcional","p":2,"det":"Resistencia a críticos tipos 4 y 6: +1. Movimiento +1. Evasión +2. Habilita sigilo durante la noche y en espacios poco iluminados","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"mov","val":1},{"stat":"eva","val":2}]},{"n":"Botas de unicornio","t":"pies","k":"Excepcional","p":1,"det":"Resistencia a críticos tipos 4 y 6: +2. Movimiento +3. Evasión +1. Resistencia mental +2. Resistencia mágica +1.","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"mov","val":3},{"stat":"eva","val":1},{"stat":"resm","val":2},{"stat":"resmg","val":1}]},{"n":"Botas del Caminante de Viento","t":"pies","k":"Excepcional","p":1,"det":"Defensa +3 · Res. crítico Tipo 4 +1 · Movimiento +1 · Evasión +1","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"mov","val":1},{"stat":"eva","val":1}]},{"n":"Botas del pomberito","t":"pies","k":"Excepcional","p":1,"det":"Agilidad +1. Evasión +3. Iniciativa +3.","def":5,"m":[{"stat":"eva","val":3},{"stat":"ini","val":3},{"stat":"agl","val":1}]},{"n":"Mercury threads","t":"pies","k":"Excepcional","p":1,"det":"bonos máximos +1 , +1 Res.M y +1 Res.CC.","def":3,"m":[{"stat":"bonos","val":1},{"stat":"rescc","val":1},{"stat":"resmg","val":1}]},{"n":"Sabatones de caparazón de tatú carreta","t":"pies","k":"Excepcional","p":2,"det":"Resistencia a críticos tipo 8: +1. Constitución +1. Resistencia a CC +2.","def":7,"m":[{"stat":"tipo3","val":1},{"stat":"con","val":1},{"stat":"rescc","val":2}]},{"n":"Sabatones de hueso de troll","t":"pies","k":"Excepcional","p":3,"det":"Resistencia a críticos tipo 4: +2. Resistencia a críticos tipos 10, 6 y 8: +1. Movimiento -1. Regeneración +5 HP por turno.","def":10,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1},{"stat":"mov","val":-1}]}]},"cabeza":{"Raro":[{"n":"Antifaz del ave nocturna","t":"cabeza","k":"Raro","p":0,"det":"Defensa +2 · Evasión +1 · Visión +2","def":2,"m":[{"stat":"eva","val":1},{"stat":"vision","val":2}]},{"n":"Capucha de las sombras silentes","t":"cabeza","k":"Raro","p":1,"det":"Ignora 1 punto de resistencia a crítico del objetivo al atacar sorprendiendo.","def":5,"m":[{"stat":"eva","val":1}]},{"n":"Capuz del Sumo Profeta","t":"cabeza","k":"Raro","p":0,"det":"Especial +1. Rango de casteo +1.","def":2,"m":[{"stat":"esp","val":1},{"stat":"rangocasteo","val":1}]},{"n":"Casco de acero de meteorito","t":"cabeza","k":"Raro","p":2,"det":"Resistencia a críticos tipo 4, 6 y 8: +1.","def":7,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Diadema del canalizador","t":"cabeza","k":"Raro","p":0,"det":"Pdg. Mg.: +3. Bonos +2.  Rango Cast.: +2.","def":1,"m":[{"stat":"bonos","val":2},{"stat":"rangocasteo","val":2},{"stat":"pdgmg","val":3}]},{"n":"Gran yelmo del torneo","t":"cabeza","k":"Raro","p":4,"det":"Resistencia a críticos tipo 4 y 6: +2. Resistencia a críticos tipo 8: +1. Evasión -1. Pdg -1.","def":8,"m":[{"stat":"eva","val":-1},{"stat":"pdg","val":-1},{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]},{"n":"Turbante de seda cruda","t":"cabeza","k":"Raro","p":0,"det":"Especial +1.","def":2,"m":[{"stat":"esp","val":1}]},{"n":"Yelmo con cresta de comandante","t":"cabeza","k":"Raro","p":4,"det":"Resistencia a críticos tipos 4: +1.","def":9,"m":[{"stat":"tipo1","val":1}]}],"Común":[{"n":"Bacinete de recluta","t":"cabeza","k":"Común","p":2,"det":"Resistencia a críticos tipos 4: +2.","def":4,"m":[{"stat":"tipo1","val":2}]},{"n":"Capucha de cuero acolchada","t":"cabeza","k":"Común","p":0,"det":"Resistencia a críticos tipo 4: +1. Defensa +2.","def":2,"m":[{"stat":"tipo1","val":1}]},{"n":"Capucha de lana del culto","t":"cabeza","k":"Común","p":0,"det":"Defensa +1.","def":1,"m":[]},{"n":"Casco de artillero pintado a mano","t":"cabeza","k":"Común","p":2,"det":"Resistencia a críticos tipo 6: +1. Evasión -1","def":4,"m":[{"stat":"eva","val":-1},{"stat":"tipo2","val":1}]},{"n":"Casco de muralla","t":"cabeza","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":3,"m":[{"stat":"tipo2","val":1}]},{"n":"Gafas de aviador","t":"cabeza","k":"Común","p":0,"det":"Defensa +1 · Visión +1","def":1,"m":[{"stat":"vision","val":1}]},{"n":"Gorro de fieltro de feria","t":"cabeza","k":"Común","p":0,"det":"Resistencia a críticos tipo 6: +1.","def":1,"m":[{"stat":"tipo2","val":1}]},{"n":"Sombrero de paja trenzada","t":"cabeza","k":"Común","p":0,"det":"Bonos +1.","def":1,"m":[{"stat":"bonos","val":1}]}],"Buena Calidad":[{"n":"Capucha acolchada de sastre","t":"cabeza","k":"Buena Calidad","p":1,"det":"Resistencia a CC +2","def":3,"m":[{"stat":"rescc","val":2}]},{"n":"Capuz de cuero curtido","t":"cabeza","k":"Buena Calidad","p":1,"det":"Resistencia a críticos tipos 4 y 6: +1.","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Casco de escamas superpuestas","t":"cabeza","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipos 4, 6 y 8: +1.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Monóculo del cartógrafo","t":"cabeza","k":"Buena Calidad","p":0,"det":"Defensa +1 · Visión +1 · Especial +1","def":1,"m":[{"stat":"vision","val":1},{"stat":"esp","val":1}]},{"n":"Yelmo abierto de sargento","t":"cabeza","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipos 4 y 8: +1. PdG +1.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo3","val":1},{"stat":"pdg","val":1}]},{"n":"Yelmo completo","t":"cabeza","k":"Buena Calidad","p":4,"det":"Resistencia a críticos tipo 8: +1.","def":6,"m":[{"stat":"tipo3","val":1}]},{"n":"Yelmo de nasal","t":"cabeza","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipo 4, 6 y 8: +1. PdG -1","def":4,"m":[{"stat":"pdg","val":-1},{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Yelmo de visera","t":"cabeza","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipos 4 y 6: +1.","def":6,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]}],"Excepcional":[{"n":"Capucha de crin de chupacabras","t":"cabeza","k":"Excepcional","p":0,"det":"Iniciativa +1. Resistencia mental +2. Hp Máximo: +20. Evasión +2","def":4,"m":[{"stat":"eva","val":2},{"stat":"ini","val":1},{"stat":"resm","val":2},{"stat":"hpmax","val":20}]},{"n":"Capuz de lana de yacumama","t":"cabeza","k":"Excepcional","p":1,"det":"Resistencia a críticos tipo 6: +2. Resistencia a críticos tipo 8: +1. Especial +1. Rango de casteo +2.","def":5,"m":[{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"esp","val":1},{"stat":"rangocasteo","val":2}]},{"n":"Casco de madreperla","t":"cabeza","k":"Excepcional","p":1,"det":"Especial +1. Evasión +2. Resistencia mágica +3.","def":4,"m":[{"stat":"eva","val":2},{"stat":"esp","val":1},{"stat":"resmg","val":3}]},{"n":"Casco de ojos de águila","t":"cabeza","k":"Excepcional","p":3,"det":"Defensa +6 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 10 +1 · PdG +1 · Visión +3","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo4","val":1},{"stat":"pdg","val":1},{"stat":"vision","val":3}]},{"n":"Máscara de diablada boliviana","t":"cabeza","k":"Excepcional","p":1,"det":"Especial +1. Acciones +1. Bonos +3. Resistencia mágica +4.","def":3,"m":[{"stat":"bonos","val":3},{"stat":"esp","val":1},{"stat":"accionesmax","val":1},{"stat":"resmg","val":4}]},{"n":"Tocado de plumas de quetzal","t":"cabeza","k":"Excepcional","p":0,"det":"Agilidad +1. Evasión +2. Iniciativa +2.","def":2,"m":[{"stat":"eva","val":2},{"stat":"ini","val":2},{"stat":"agl","val":1}]},{"n":"Yelmo de asta de unicornio","t":"cabeza","k":"Excepcional","p":2,"det":"Resistencia a críticos tipos 4: +3. Resistencia mental +3. Rango de casteo +2. Daño mágico +5","def":8,"m":[{"stat":"tipo1","val":3},{"stat":"resm","val":3},{"stat":"rangocasteo","val":2}]},{"n":"Yelmo de caparazón de peuchen","t":"cabeza","k":"Excepcional","p":2,"det":"Resistencia a críticos tipo 4 y 6: +2. Resistencia a críticos tipo 8: +1. Resistencia mental +2.","def":8,"m":[{"stat":"resm","val":2},{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]}]},"torso":{"Buena Calidad":[{"n":"Armadura compuesta","t":"armadura_rigida","k":"Buena Calidad","p":4,"det":"Resistencia a críticos tipo 8: +1.","def":8,"m":[{"stat":"tipo3","val":1}]},{"n":"Camiseta de cuero flexible","t":"armadura_blanda","k":"Buena Calidad","p":1,"det":"Defensa +5.","def":5,"m":[]},{"n":"Chaleco de escamas del envenenador","t":"armadura_blanda","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipo 6: +2. Resistencia a críticos tipos 8: +1.","def":3,"m":[{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]},{"n":"Cota de escamas de cuero","t":"armadura_blanda","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipo 6: +2. Resistencia a críticos tipos 8: +1.","def":3,"m":[{"stat":"tipo2","val":2},{"stat":"tipo3","val":1}]},{"n":"Cota de malla de contramaestre","t":"armadura_blanda","k":"Buena Calidad","p":2,"det":"Reduce críticos Tipo 4, 6 y 8.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Delantal de boticario","t":"armadura_blanda","k":"Buena Calidad","p":1,"det":"Defensa +2 · Ranuras de cinturón +1","def":2,"m":[{"stat":"capcinturon","val":1}]},{"n":"Media armadura de escudero","t":"armadura_rigida","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipos 4, 6 y 8: +1.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Túnica de acólito","t":"armadura_blanda","k":"Buena Calidad","p":0,"det":"Bonos +2","def":2,"m":[{"stat":"bonos","val":2}]}],"Raro":[{"n":"Armadura compuesta revestida de acero","t":"armadura_rigida","k":"Raro","p":4,"det":"Reduce críticos tipo 8 y 10","def":10,"m":[{"stat":"tipo3","val":1},{"stat":"tipo4","val":1}]},{"n":"Chaleco de Kevlar","t":"armadura_blanda","k":"Raro","p":1,"det":"Resistencia a críticos tipo 6: +1., resistencia a críticos tipo 4: +2","def":4,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1}]},{"n":"Coleto de piel de jabalí","t":"armadura_blanda","k":"Raro","p":3,"det":"Defensa +6 · Res. crítico Tipo 4 +2 · Evasión +1","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"eva","val":1}]},{"n":"Coraza de placas","t":"armadura_rigida","k":"Raro","p":5,"det":"Defensa +9 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 6 +1 · Res. crítico Tipo 8 +1 · Evasión -1","def":9,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"eva","val":-1}]},{"n":"Cota de malla de aluminio reforzado","t":"armadura_blanda","k":"Raro","p":1,"det":"Reduce críticos Tipo 4, 6 y 8.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Cota de placas","t":"armadura_rigida","k":"Raro","p":4,"det":"Reduce críticos Tipo 4, 6, 8 y 10.","def":9,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1}]},{"n":"Gambesón del veterano de frontera","t":"armadura_blanda","k":"Raro","p":3,"det":"Resistencia a críticos tipos 4 y 6: +2. Resistencia a CC +2.","def":7,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"rescc","val":2}]},{"n":"Peto rúnico","t":"armadura_rigida","k":"Raro","p":3,"det":"Resistencia a críticos tipos 4 y 6: +2. Resistencia a críticos tipo 8: +1. Especial +1. Rango de casteo +1. Evasión -1.","def":7,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"eva","val":-1},{"stat":"esp","val":1},{"stat":"rangocasteo","val":1}]}],"Común":[{"n":"Armadura con tachas","t":"armadura_blanda","k":"Común","p":2,"det":"Reduce críticos Tipo 4 y 6.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Armadura de cuero rígido","t":"armadura_rigida","k":"Común","p":1,"det":"Reduce críticos Tipo 4 y 6","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Armadura pesada de hierro","t":"armadura_rigida","k":"Común","p":4,"det":"Defensa +10.","def":10,"m":[]},{"n":"Campera de cuero de motociclista con tachas","t":"armadura_blanda","k":"Común","p":2,"det":"Resistencia a críticos tipo 6: +1.","def":3,"m":[{"stat":"tipo2","val":1}]},{"n":"Coraza de cuero del clan","t":"armadura_rigida","k":"Común","p":1,"det":"Reduce críticos Tipo 4 y 6","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Coraza de puerta","t":"armadura_rigida","k":"Común","p":4,"det":"Resistencia a críticos tipo 4 y 6: +1. evasión -1","def":7,"m":[{"stat":"eva","val":-1},{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Jubón de cuero curtido","t":"armadura_blanda","k":"Común","p":2,"det":"Defensa +3 · Res. crítico Tipo 4 +1","def":3,"m":[{"stat":"tipo1","val":1}]},{"n":"Peto de cuero curtido","t":"armadura_blanda","k":"Común","p":1,"det":"Resistencia a críticos tipo 4: +1. Defensa +4.","def":4,"m":[{"stat":"tipo1","val":1}]}],"Excepcional":[{"n":"Armadura de placas de campeón","t":"armadura_rigida","k":"Excepcional","p":5,"det":"Defensa +11 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 6 +2 · Res. crítico Tipo 8 +1 · Iniciativa -1","def":11,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"ini","val":-1}]},{"n":"Camisa de pelo de unicornio","t":"armadura_blanda","k":"Excepcional","p":0,"det":"resistencia mental +5, resistencia mágica +5, resistencia a cc +5","def":3,"m":[{"stat":"resm","val":5},{"stat":"rescc","val":5},{"stat":"resmg","val":5}]},{"n":"Capa de seda de araña","t":"armadura_blanda","k":"Excepcional","p":1,"det":"Defensa +5 · Res. crítico Tipo 4 +2 · Evasión +2","def":5,"m":[{"stat":"tipo1","val":2},{"stat":"eva","val":2}]},{"n":"Coraza de escama de Quetzalcóatl","t":"armadura_rigida","k":"Excepcional","p":3,"det":"Resistencia a críticos tipos 4: +2. Tipo 6 y 8: +1. Movimiento +1. Resistencia mental +2. Rango de casteo +2.","def":9,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"mov","val":1},{"stat":"resm","val":2},{"stat":"rangocasteo","val":2}]},{"n":"Coraza de placa de anquilosaurio","t":"armadura_rigida","k":"Excepcional","p":4,"det":"Resistencia a críticos tipos 8 y 10: +1. Resistencia a críticos tipos 4: +3. Resistencia a críticos tipos 6: +2. Constitución +1. Movimiento -1. Evasión -1.","def":11,"m":[{"stat":"tipo1","val":3},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1},{"stat":"mov","val":-1},{"stat":"eva","val":-1},{"stat":"con","val":1}]},{"n":"Coraza de titanio","t":"armadura_rigida","k":"Excepcional","p":4,"det":"Resistencia a críticos tipos 4 y 6: +2. Resistencia a críticos tipos 8 y 10: +1. Armadura indestructible.","def":10,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1}]},{"n":"Cota de malla de titanio","t":"armadura_blanda","k":"Excepcional","p":1,"det":"Reduce críticos Tipo 4, 6 y 8.","def":7,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Gabardina del contrabandista","t":"armadura_blanda","k":"Excepcional","p":2,"det":"Defensa +5 · Res. crítico Tipo 4 +2 · Evasión +1 · Ranuras de cinturón +3","def":5,"m":[{"stat":"tipo1","val":2},{"stat":"eva","val":1},{"stat":"capcinturon","val":3}]}]},"piernas":{"Común":[{"n":"Bombachas de campo","t":"piernas","k":"Común","p":0,"det":"Movimiento +1.","def":2,"m":[{"stat":"mov","val":1}]},{"n":"Calzas de cuero flexible","t":"piernas","k":"Común","p":1,"det":"Resistencia a críticos tipo 4: +1. Defensa +2.","def":2,"m":[{"stat":"tipo1","val":1}]},{"n":"Canilleras de arquero de fútbol amateur","t":"piernas","k":"Común","p":1,"det":"Resistencia a críticos tipo 6: +1.","def":1,"m":[{"stat":"tipo2","val":1}]},{"n":"Grebas de anillas cosidas","t":"piernas","k":"Común","p":2,"det":"Resistencia a críticos tipos 4 y 6: +1. Movimiento -1.","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"mov","val":-1}]},{"n":"Grebas de cuero","t":"piernas","k":"Común","p":1,"det":"Defensa +2 · Res. crítico Tipo 4 +1","def":2,"m":[{"stat":"tipo1","val":1}]},{"n":"Jogging de gimnasia con rayas laterales","t":"piernas","k":"Común","p":0,"det":"Defensa +2. Movimiento +1.","def":2,"m":[{"stat":"mov","val":1}]},{"n":"Pantalón de lienzo basto","t":"piernas","k":"Común","p":0,"det":"Evasión +1","def":1,"m":[{"stat":"eva","val":1}]},{"n":"Polainas de cuero remendado","t":"piernas","k":"Común","p":1,"det":"Resistencia a críticos tipo 4: +1.","def":2,"m":[{"stat":"tipo1","val":1}]}],"Raro":[{"n":"Bombachas del arriero incansable","t":"piernas","k":"Raro","p":1,"det":"Constitución +1. Movimiento +1. Resistencia a CC +1.","def":5,"m":[{"stat":"mov","val":1},{"stat":"con","val":1},{"stat":"rescc","val":1}]},{"n":"Calzas de seda","t":"piernas","k":"Raro","p":0,"det":"Agilidad +1. Evasión +2. Iniciativa +3","def":4,"m":[{"stat":"eva","val":2},{"stat":"ini","val":3},{"stat":"agl","val":1}]},{"n":"Calzas del corredor de tormentas","t":"piernas","k":"Raro","p":0,"det":"Evasión +2.","def":3,"m":[{"stat":"eva","val":2}]},{"n":"Calzas del runner","t":"piernas","k":"Raro","p":1,"det":"Movimiento +2. Evasión +1. Resistencia a CC +1. inmune al agotamiento o exhausto","def":1,"m":[{"stat":"mov","val":2},{"stat":"eva","val":1},{"stat":"rescc","val":1}]},{"n":"Grebas del guardia de puente","t":"piernas","k":"Raro","p":3,"det":"Resistencia a críticos tipos 4: +2.  Tipo 6: +1. Inmunidad a restricciones de movimiento.","def":7,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1}]},{"n":"Pantalón de cuero de rinoceronte","t":"piernas","k":"Raro","p":2,"det":"Resistencia a críticos tipos 4 y 6: +2. Resistencia a críticos tipo 8: +1. Constitución +1.","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"con","val":1}]},{"n":"Pantalón de lino trenzado","t":"piernas","k":"Raro","p":0,"det":"Movimiento +1. Evasión +1.","def":2,"m":[{"stat":"mov","val":1},{"stat":"eva","val":1}]},{"n":"Perneras de acero de meteorito","t":"piernas","k":"Raro","p":2,"det":"Resistencia a críticos tipos 4 y 6: +2. Resistencia a críticos tipo 8: +1. Resistencia mental +1.","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"resm","val":1}]}],"Buena Calidad":[{"n":"Calzas de bordado rúnico","t":"piernas","k":"Buena Calidad","p":1,"det":"Daño mágico +3","def":3,"m":[]},{"n":"Calzas de cuero de vaca","t":"piernas","k":"Buena Calidad","p":1,"det":"Resistencia a críticos tipos 4 y 6: +1.","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Grebas","t":"piernas","k":"Buena Calidad","p":2,"det":"Reduce críticos Tipo 4 y 6.","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Grebas de acero templado","t":"piernas","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipos 6 y 8: +1.","def":5,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Grebas del rastreador","t":"piernas","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipos 6 y 8: +1.","def":5,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Pantalón reforzado de cazador","t":"piernas","k":"Buena Calidad","p":2,"det":"Reduce críticos tipo 4","def":4,"m":[{"stat":"tipo1","val":1}]},{"n":"Perneras articuladas","t":"piernas","k":"Buena Calidad","p":3,"det":"Resistencia a críticos tipo 8: +1.","def":7,"m":[{"stat":"tipo3","val":1}]},{"n":"Perneras de malla","t":"piernas","k":"Buena Calidad","p":2,"det":"Defensa +4 · Res. crítico Tipo 4 +1 · Res. crítico Tipo 6 +1","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]}],"Excepcional":[{"n":"Calzas de piel de chupacabras","t":"piernas","k":"Excepcional","p":1,"det":"Resistencia a críticos tipos 4 y 6: +2. Constitución +1. Movimiento +1. Regeneración +1 HP por turno.","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"mov","val":1},{"stat":"con","val":1}]},{"n":"Calzas de piel de troll","t":"piernas","k":"Excepcional","p":1,"det":"Constitución +1. Regeneración +3 HP por turno.","def":5,"m":[{"stat":"con","val":1}]},{"n":"Grebas de casco de unicornio","t":"piernas","k":"Excepcional","p":1,"det":"Resistencia a críticos tipo 4: +2. Resistencia a críticos tipo 8: +1. Agilidad +1. Movimiento +2. Resistencia mental +2.","def":8,"m":[{"stat":"mov","val":2},{"stat":"agl","val":1},{"stat":"resm","val":2},{"stat":"tipo1","val":2},{"stat":"tipo3","val":1}]},{"n":"Grebas de escamas de dragón menor","t":"piernas","k":"Excepcional","p":2,"det":"Defensa +6 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 6 +2","def":6,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2}]},{"n":"Grebas de piel de hipogrifo","t":"piernas","k":"Excepcional","p":2,"det":"Resistencia a críticos tipo 4: +3. Resistencia a críticos tipos 6: +2. Resistencia a críticos tipo 8: +1. Agilidad +1. Movimiento +1.","def":9,"m":[{"stat":"tipo1","val":3},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"mov","val":1},{"stat":"agl","val":1}]},{"n":"Miriñaque","t":"piernas","k":"Excepcional","p":1,"det":"Evasión +3. Especial +2. Resistencia a cc +2","def":4,"m":[{"stat":"eva","val":3},{"stat":"esp","val":2},{"stat":"rescc","val":2}]},{"n":"Pantalón de lana de yastay","t":"piernas","k":"Excepcional","p":0,"det":"Resistencia a críticos tipo 6: +2. Resistencia a críticos tipo 8: +1. Constitución +1. Movimiento +2. Resistencia a CC +2.","def":6,"m":[{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"mov","val":2},{"stat":"con","val":1},{"stat":"rescc","val":2}]},{"n":"Perneras de hueso de coloso menor","t":"piernas","k":"Excepcional","p":5,"det":"Resistencia a críticos tipos 4, 6, 8 y 10: +1. Movimiento -1.","def":15,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1},{"stat":"mov","val":-1}]}]},"manos":{"Buena Calidad":[{"n":"Guanteletes","t":"manos","k":"Buena Calidad","p":2,"det":"Reduce críticos Tipo 4, 6 y 8.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Guanteletes de acero templado","t":"manos","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipos 4 y 8: +1. Parry +1.","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo3","val":1},{"stat":"parry","val":1}]},{"n":"Guantes de cuero Tachonado","t":"manos","k":"Buena Calidad","p":1,"det":"Reduce críticos Tipo 6 y 8.","def":4,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Guantes de cuero reforzado","t":"manos","k":"Buena Calidad","p":1,"det":"Reduce críticos Tipo 4 y 6.","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Guantes de escalador encerados","t":"manos","k":"Buena Calidad","p":0,"det":"Buen agarre para trepar y colgar de un acantilado.","def":2,"m":[]},{"n":"Manoplas de cota","t":"manos","k":"Buena Calidad","p":1,"det":"Defensa +3 · Res. crítico Tipo 4 +1 · Res. crítico Tipo 6 +1","def":3,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Manoplas de escamas","t":"manos","k":"Buena Calidad","p":2,"det":"Reduce críticos Tipo 6 y 8.","def":5,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Manoplas mixtas de guardia","t":"manos","k":"Buena Calidad","p":2,"det":"Resistencia a críticos tipos 4, 6 y 8: +1. PdG +1.","def":5,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"pdg","val":1}]}],"Raro":[{"n":"Guanteletes de combate","t":"manos","k":"Raro","p":3,"det":"Resistencia a críticos tipo 4, 6 y 8: +1.","def":6,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Guanteletes del duelista","t":"manos","k":"Raro","p":2,"det":"Defensa +3 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 6 +1 · Parry +1","def":3,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":1},{"stat":"parry","val":1}]},{"n":"Guanteletes del herrero real","t":"manos","k":"Raro","p":3,"det":"Reduce críticos Tipo 4, 6 y 8.","def":8,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]},{"n":"Guantes de duelista","t":"manos","k":"Raro","p":0,"det":"parry +2","def":2,"m":[{"stat":"parry","val":2}]},{"n":"Guantes de prestidigitador","t":"manos","k":"Raro","p":0,"det":"Defensa +2 · Res. crítico Tipo 4 +1 · Des +1 · Ranuras de cinturón +1","def":2,"m":[{"stat":"tipo1","val":1},{"stat":"des","val":1},{"stat":"capcinturon","val":1}]},{"n":"Guantes del sanador errante","t":"manos","k":"Raro","p":0,"det":"Al curar a un aliado, el portador también recibe 5 HP instantáneos.","def":4,"m":[]},{"n":"Guantes finos de señor","t":"manos","k":"Raro","p":0,"det":"Dan aspecto de señor fino. No dejan huellas. +1 a todas las tiradas de interacción social","def":1,"m":[]},{"n":"Manoplas laminadas","t":"manos","k":"Raro","p":3,"det":"Resistencia a críticos tipo 6 y 8: +1.","def":6,"m":[{"stat":"tipo2","val":1},{"stat":"tipo3","val":1}]}],"Excepcional":[{"n":"Guanteletes de garra de lobizón","t":"manos","k":"Excepcional","p":2,"det":"Resistencia a críticos tipos 4: +3 Resistencia a críticos tipos 6: +2. Resistencia a críticos tipos 8: +1.  PdG +2. Crítico frecuente +2.","def":8,"m":[{"stat":"tipo1","val":3},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"pdg","val":2},{"stat":"crit","val":2}]},{"n":"Guantes de piel de curupí","t":"manos","k":"Excepcional","p":1,"det":"Resistencia a críticos tipos 4 y 6: +2. Destreza +1. PdG +2.","def":4,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"pdg","val":2},{"stat":"des","val":1}]},{"n":"Guantes de piel de troll","t":"manos","k":"Excepcional","p":1,"det":"Otorga regeneración de +3hp x mantenimiento.","def":4,"m":[]},{"n":"Manoplas de hueso de espinosaurio","t":"manos","k":"Excepcional","p":4,"det":"Resistencia a críticos tipo 10: +1. Resistencia a críticos tipos 4 y 6: +2. Resistencia a críticos tipo 8: +1. Fuerza +1. Movimiento -1.","def":10,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1},{"stat":"mov","val":-1},{"stat":"fue","val":1}]},{"n":"Manoplas del Desollador","t":"manos","k":"Excepcional","p":2,"det":"Defensa +4 · Res. crítico Tipo 4 +2 · Res. crítico Tipo 6 +2 · PdG +1","def":4,"m":[{"stat":"tipo1","val":2},{"stat":"tipo2","val":2},{"stat":"pdg","val":1}]}],"Común":[{"n":"Guantes de crupier","t":"manos","k":"Común","p":0,"det":"Bonos +2","def":0,"m":[{"stat":"bonos","val":2}]},{"n":"Guantes de cuerina","t":"manos","k":"Común","p":0,"det":"pdg +1","def":0,"m":[{"stat":"pdg","val":1}]},{"n":"Guantes de cuero de blando","t":"manos","k":"Común","p":1,"det":"Reduce críticos Tipo 4.","def":2,"m":[{"stat":"tipo1","val":1}]},{"n":"Guantes de horno de cocina industrial","t":"manos","k":"Común","p":2,"det":"Reduce críticos Tipo 4 y 6. Reduce en 1 el daño de fuego.","def":4,"m":[{"stat":"tipo1","val":1},{"stat":"tipo2","val":1}]},{"n":"Guantes de tela acolchada","t":"manos","k":"Común","p":0,"det":"Resistencia a críticos tipo 6: +1. Defensa +2.","def":2,"m":[{"stat":"tipo2","val":1}]},{"n":"Guantes de trabajo reforzados","t":"manos","k":"Común","p":1,"det":"Defensa +1 · Res. crítico Tipo 4 +1","def":1,"m":[{"stat":"tipo1","val":1}]},{"n":"Manoplas de trabajo de fragua","t":"manos","k":"Común","p":1,"det":"Reduce en 1 el daño de fuego.","def":3,"m":[]},{"n":"Mitones de abuela","t":"manos","k":"Común","p":0,"det":"Defensa +1. SP +1.","def":1,"m":[{"stat":"bonos","val":1}]}]}}};
  const TIERS_EQ = ['Común', 'Buena Calidad', 'Raro', 'Excepcional'];
  const ROLES_EQ = ['melee', 'tanque', 'asalto', 'rango', 'mágico', 'apoyo', 'debuffer'];
  const DEF_NIVEL = [1, 2.5, 4, 6, 8];
  const DEF_ROL = {tanque: 1.7, melee: 1.1, asalto: 0.8, rango: 0.8, apoyo: 0.8, debuffer: 0.7, 'mágico': 0.6};
  const hashEq = (s, sal) => [...(s + '|' + sal)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const pctEq = (nombre, sal) => hashEq(nombre, sal) % 100;
  const subeTier = (t, n) => TIERS_EQ[Math.min(TIERS_EQ.length - 1, Math.max(0, TIERS_EQ.indexOf(t) + n))];
  const rolDe = c => c.etiquetas.find(e => ROLES_EQ.includes(e)) || 'melee';
  const objetivoDef = c => Math.max(0, DEF_NIVEL[Math.min(5, Math.max(1, c.nivel)) - 1] * (DEF_ROL[rolDe(c)] || 1) + (c.datos.jefe ? 2 : 0));
  function escalaEquipo(c){
    const n = c.nivel, nom = c.nombre, jefe = !!c.datos.jefe, r = sal => pctEq(nom, sal);
    let armas, defs;
    if(n === 1){ armas = ['Común']; defs = ['Común']; }
    else if(n === 2){ armas = ['Común']; defs = ['Común', r('d2') < 50 ? 'Buena Calidad' : 'Común']; }
    else if(n === 3){ armas = ['Buena Calidad', ...(r('a3') < 50 ? ['Común'] : [])]; defs = ['Buena Calidad', 'Común', ...(r('d3') < 34 ? ['Buena Calidad'] : [])]; }
    else if(n === 4){ armas = [r('a4') < 50 ? 'Raro' : 'Buena Calidad', r('b4') < 50 ? 'Buena Calidad' : 'Común']; defs = ['Buena Calidad', 'Buena Calidad', r('d4') < 50 ? 'Raro' : 'Buena Calidad']; }
    else { armas = [r('a5') < 34 ? 'Excepcional' : 'Raro', 'Buena Calidad']; defs = ['Raro', 'Raro', r('d5') < 34 ? 'Excepcional' : 'Raro', ...(r('e5') < 50 ? ['Buena Calidad'] : [])]; }
    if(jefe){ armas = armas.map(t => subeTier(t, 1)); defs = [...defs.map(t => subeTier(t, 1)), subeTier(defs[defs.length - 1], 1)]; }
    return {armas, defs};
  }
  // Pieza del tier pedido (o de uno más bajo si no hay). Con `objetivo` (defensa): la más cercana; sin él, una fija por creep.
  function piezaEq(lista, tier, sal, nombre, objetivo){
    for(let i = TIERS_EQ.indexOf(tier); i >= 0; i--){
      let l = lista && lista[TIERS_EQ[i]];
      if(!(l && l.length)) continue;
      if(objetivo !== undefined){
        const mejor = Math.min(...l.map(x => Math.abs((x.def || 0) - objetivo)));
        l = l.filter(x => Math.abs((x.def || 0) - objetivo) === mejor);
      }
      return l[hashEq(nombre, sal) % l.length];
    }
    return null;
  }
  const critIx = {tipo1: 0, tipo2: 1, tipo3: 2, tipo4: 3, tipo5: 4};
  function aplicarEquipo(){
    lista.forEach(c => {
      const d = c.datos, tipo = d.tipoCriatura, rol = rolDe(c), obj = objetivoDef(c);
      // ---- no humanos: defensa natural y nada más ----
      if(tipo !== 'humano' && tipo !== 'humanoide'){ d.defensa = Math.round(obj); return; }
      const lanzador = rol === 'mágico' || rol === 'apoyo' || rol === 'debuffer';
      const {armas, defs} = escalaEquipo(c);
      const notas = [];
      // ---- arma principal: valores EXACTOS de un ítem del catálogo (mismo Tipo y mismo alcance), con el nombre temático (los lanzadores: arma simple + foco aparte) ----
      const focoOriginal = d.armaNombre, eraRango = !!d.armaDeRango;
      const grupoArma = EQUIPO_CREEP.arma[(eraRango ? 'r' : 'm') + d.armaTipo];
      const principal = piezaEq(grupoArma, armas[0], 'arma', c.nombre);
      d.equipo = [];
      if(principal){
        d.armaNombre = lanzador ? principal.n : focoOriginal;
        d.armaPeso = principal.p; d.armaFijo = principal.f; d.armaDeRango = principal.r; d.armaMods = structuredClone(principal.m || []);
        d.armaEfectos = structuredClone(principal.e || []); d.armaManos = principal.t;
        d.armaDetalle = lanzador ? (principal.det || '') : `Equivale a «${principal.n}» (${principal.k}), con exactamente sus valores. ${principal.det || ''}`.trim();
        notas.push(lanzador ? `${principal.n} (${principal.k})` : `${focoOriginal} [= ${principal.n}] (${principal.k})`);
        if(lanzador) d.equipo.push({id: 'foco-' + slug(c.nombre), nombre: focoOriginal, tipoItem: 'arma_1m', def: 0, mods: [], detalle: 'Foco mágico temático: de acá salen los hechizos de sus habilidades (segundo plano; sin daño propio).'});
      }else notas.push(d.armaNombre);
      // ---- segunda arma (nivel 3+): catálogo, con una mano libre ----
      const dosManos = /2m/.test(d.armaManos || '');
      if(!lanzador && !dosManos && armas.length > 1 && c.nivel >= 3 && !d.armaDeRango){
        const seg = piezaEq(EQUIPO_CREEP.arma['m' + (d.armaTipo <= 6 ? 4 : d.armaTipo === 8 ? 6 : 8)] || grupoArma, armas[1], 'arma2', c.nombre);
        if(seg){ d.equipo.push({id: 'eq2-' + slug(c.nombre), nombre: seg.n, tipoItem: seg.t, def: 0, mods: structuredClone(seg.m || []), detalle: '2.ª arma. ' + (seg.det || '')}); notas.push(`${seg.n} (${seg.k})`); }
      }
      // ---- defensivos: torso primero (rígido salvo lanzadores, asalto y rango), luego cabeza, piernas, manos, pies y —con una mano libre— escudo. Lo que traía antes se reemplaza por la escala. ----
      const orden = ['torso', 'cabeza', 'piernas', 'manos', 'pies'];
      if(!dosManos && !d.armaDeRango && !lanzador && (rol === 'tanque' || pctEq(c.nombre, 'esc') < 25)) orden.splice(1, 0, 'escudo');
      const objEquipo = tipo === 'humano' ? obj : Math.max(0, obj - Math.floor(obj / 2));   // el humano viste toda su defensa; el humanoide, la mitad (la otra es natural)
      let sumDef = 0; const crit = [0, 0, 0, 0, 0]; let torsoNombre = '';
      const cantidad = defs.length;
      let usadas = 0;
      for(let i = 0; i < orden.length && usadas < cantidad; i++){
        const slot = orden[i], lst = EQUIPO_CREEP.def[slot];
        const porPieza = Math.max(0, (objEquipo - sumDef) / (cantidad - usadas));
        let p = piezaEq(lst, defs[usadas], 'def' + slot, c.nombre, porPieza);
        if(!p) continue;
        if(slot === 'torso' && p.t === 'armadura_rigida' && (lanzador || rol === 'asalto' || rol === 'rango')){
          const blandas = {}; TIERS_EQ.forEach(t => { blandas[t] = ((lst || {})[t] || []).filter(x => x.t === 'armadura_blanda'); });
          p = piezaEq(blandas, p.k, 'blanda', c.nombre, porPieza) || p;
        }
        usadas++;
        d.equipo.push({id: 'eq-' + slot + '-' + slug(c.nombre), nombre: p.n, tipoItem: p.t, def: p.def || 0, mods: structuredClone(p.m || []), detalle: p.det || ''});
        sumDef += p.def || 0; if(slot === 'torso') torsoNombre = p.n;
        (p.m || []).forEach(m => { const ix = critIx[m.stat]; if(ix !== undefined) crit[ix] += m.val; });
        notas.push(`${p.n} (${p.k})`);
      }
      d.crit = crit.map(v => Math.min(3, v));
      const natural = tipo === 'humano' ? 0 : Math.floor(obj / 2);
      d.defensa = natural + sumDef;
      d.armaduraTipo = torsoNombre;
      c.detalle = c.detalle.replace(/ Equipo: [^.]*\./, '') + ' Equipo: ' + notas.join(', ') + '.' + (natural ? ` Defensa natural ${natural} + equipo ${sumDef}.` : '');
      c.etiquetas = [...new Set([...c.etiquetas, 'con equipo'])];
    });
  }
  aplicarEquipo();
/*EQUIPO_CREEP:FIN*/

  window.CREEPS_BASE = lista;
  // Revisa que cada creep de la lista tenga TODOS los puntos de atributo de su nivel (33 + 3 por nivel sobre 1, repartidos entre Con, Fue, Agi, Des y Esp)
  // y HP = Con × 5. Devuelve los que no cumplen: [{nombre, nivel, suma, meta, hp, hpEsperado}]. Se corre desde la consola: CreepsBaseUtil.verificarPresupuesto().
  function verificarPresupuesto(creeps){
    return (creeps || window.CREEPS_BASE || []).map(c => {
      const d = c.datos || c, nivel = Number(c.nivel || d.nivel) || 1;
      const suma = ['con', 'fue', 'agl', 'des', 'esp'].reduce((a, k) => a + (Number(d[k]) || 0), 0), meta = 33 + 3 * (nivel - 1);
      return {nombre: c.nombre || d.nombre, nivel, suma, meta, hp: Number(d.hp) || 0, hpEsperado: (Number(d.con) || 0) * 5};
    }).filter(x => x.suma !== x.meta || x.hp !== x.hpEsperado);
  }
  window.CreepsBaseUtil = {verificarPresupuesto, armarHab, armarDetalle, esHabMagica, MANUAL_RE, esTrampa: sp => sp.trampa !== undefined || !!sp.colocar, aplicaDe, hayManual, APLICA};
})();
