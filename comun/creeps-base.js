/* Catálogo base de creeps por ESCENARIO (auditar todos: son un primer borrador).
   Cuatro escenarios × niveles 1 a 5 × 3 creeps = 60, más la tribu de goblins del bosque (10) y 20 DEBUFFERS (uno por escenario y nivel). Cada uno trae dos habilidades:
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
  const COLOR = {minas: '#B87333', bosque: '#3E9B5B', montañas: '#6F8FAF', templo: '#9B5FD0'};
  const ESCENARIO_TXT = {minas: 'minas', bosque: 'bosque', montañas: 'montañas', templo: 'templo alienígena'};
  // Reparto de atributos por rol: [Con, Fue, Agi, Des, Esp]
  const PESOS = {
    brutal: [.26, .30, .14, .16, .14], tanque: [.36, .26, .10, .12, .16], rapido: [.16, .18, .30, .24, .12],
    rango: [.18, .10, .24, .32, .16], mago: [.20, .08, .16, .16, .40], apoyo: [.24, .10, .16, .14, .36],
    debuffer: [.22, .08, .18, .14, .38],
  };
  const ROL_TXT = {brutal: 'melee', tanque: 'tanque', rapido: 'emboscador', rango: 'rango', mago: 'mágico', apoyo: 'apoyo', debuffer: 'debuffer'};
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
  const cu = (nombre, detalle, no2, k) => ({nombre, detalle, no2, cura: k});                  // cura k × nivel

  function danoTxt(d, n){ return d === 'L' ? `1d6+${n}` : d === 'M' ? `2d6+${n}` : `3d6+${n + 1}`; }
  function armarHab(sp, n, cd, lenta){
    const h = {nombre: sp.nombre, detalle: sp.detalle, cd, cdActual: lenta ? cd : 0, costo: '', nitrosCosto: sp.no2};
    if(lenta) h.cdArranca = true;
    if(sp.dano) h.tiradaExtra = danoTxt(sp.dano, n);
    if(sp.cura) h.curaHp = sp.cura * n;
    if(sp.efecto){
      h.efectoNombre = sp.nombre; h.efectoTurnos = sp.efecto.turnos; h.efectoStacks = 1; h.efectoPolaridad = 'buff';
      h.efectoDetalle = sp.detalle;
      h.efectoMods = Object.keys(sp.efecto.mods).map(stat => ({stat, val: sp.efecto.mods[stat]}));
    }
    return h;
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
    };
    lista.push({
      poolId: 'creep-' + esc + '-' + n + '-' + slug(nombre), nombre: nombre + ' (auditar)', nivel: n,
      etiquetas: [ESCENARIO_TXT[esc], 'nivel ' + n, ROL_TXT[rol], tipo, ...(extras || []), 'auditar'],
      detalle: `${notas || ''} Rápida: ${rapida.nombre}. Lenta: ${spL.nombre} (CD ${cdL}).`.trim(), datos,
    });
  }

  /* ================= MINAS ================= */
  cr('minas', 1, 'Rata de socavón', 'rapido', 'bestia', 'Dientes de rata',
    at('Mordisco infectado', 'Si golpea, tirá 1d4: con 1 el objetivo queda Envenenado (a mano).', 'L'),
    [zo('Plaga en la galería', 'Chilla y llama a la manada: entran 2 ratas más este turno (a mano).', 2, 'L'), 3],
    'Roedor enorme de las galerías, ataca en manada.');
  cr('minas', 1, 'Minero poseído', 'brutal', 'humanoide', 'Pico oxidado',
    at('Picada', 'Golpe pesado de pico.', 'M'),
    [bu('Furia del filón', 'Se enfurece: +2 al daño 3 turnos.', 2, {dmg: 2}, 3), 3],
    'Un trabajador que ya no recuerda por qué sigue picando.');
  cr('minas', 1, 'Luciérnaga de gas', 'rango', 'bestia', 'Chispa de metano',
    at('Chispa', 'Chispazo de gas a distancia.', 'L'),
    [zo('Nube de metano', 'Gas en flor de 1: los que lo respiran quedan Pajaritos hasta el final de su turno (a mano).', 2, 'L'), 4],
    'Insecto que flota entre los túneles y vuelve el aire inflamable.');

  cr('minas', 2, 'Topo excavador', 'rapido', 'bestia', 'Garras de excavación',
    at('Zarpazo desde el suelo', 'Emboscada: si el objetivo no lo vio venir, +2 al PdG (a mano).', 'M'),
    [bu('Túnel', 'Se hunde y reaparece a hasta 6 casillas; +3 Evasión hasta su siguiente turno.', 2, {eva: 3}, 1), 4],
    'Sale del suelo cuando menos se lo espera.');
  cr('minas', 2, 'Kobold dinamitero', 'rango', 'humanoide', 'Cartucho de dinamita',
    at('Cartucho', 'Lanza un cartucho de dinamita.', 'M'),
    [zo('Voladura', 'Explosión en flor de 1: daña a todos los adyacentes al punto (no a él).', 3, 'H'), 5],
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
    [zo('Cadena de dinamitas', 'Tres explosiones seguidas: tirá el daño 3 veces, en casillas a elección.', 3, 'H'), 6],
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
    [cu('Banquete de cristales', 'Se cura tragando cristales.', 2, 6), 5],
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
    [zo('Nube de esporas ponzoñosas', 'Veneno en flor de 1: 1 de daño por turno durante 3 turnos (a mano).', 2, 'L'), 4],
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
    [ta('Trampa de raíces', 'Deja una trampa de raíces en una casilla adyacente: el primero que la pise queda Inmovilizado (a mano).', 2), 4],
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
    [zo('Chillido ensordecedor', 'Chillido en flor de 1: los golpeados quedan Pajaritos 1 turno (a mano).', 2, 'L'), 4],
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
    [ta('Mal de mina', 'Especial contra Res.Mt: el objetivo queda Cansado (-1 No2 máx.) 2 turnos (a mano).', 2), 4],
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
    [cu('Savia drenante', 'Drena la vida del atrapado: se cura y el objetivo pierde lo mismo (a mano).', 2, 4), 5],
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
    ta('Aliento helado', 'Cono de 3 al frente: los afectados quedan Cansados (-1 No2 máx.) 2 turnos (a mano).', 1),
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
    [cu('Susurro helado', 'Drena a un objetivo con Especial contra Res.Mt: daño y se cura lo mismo (a mano).', 3, 5), 6],
    'Lo que dejó de ser humano en una nevada hace siglos.');
  // Templo antiguo con influencia alienígena
  cr('templo', 1, 'Larva psíquica', 'debuffer', 'alienígena', 'Mandíbulas translúcidas',
    ta('Zumbido mental', 'El objetivo tira con -1 en todo hasta el final de su próximo turno si falla Res.Mt (a mano).', 1),
    [ta('Eco mental', 'Repite en la cabeza del objetivo lo último que hizo: pierde 1 No2 (a mano).', 2), 3],
    'Se mete en la cabeza y no se va.');
  cr('templo', 2, 'Parásito de aura', 'debuffer', 'alienígena', 'Tentáculo fino',
    ta('Succión de energía', 'Especial contra Res.Mt: el objetivo pierde 1d4 SP y el parásito no se cura (a mano).', 1),
    [ta('Fiebre alienígena', 'Especial contra Res.Mt: el objetivo queda Cansado (-1 No2 máx.) 2 turnos (a mano).', 2), 4],
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

  window.CREEPS_BASE = lista;
})();
