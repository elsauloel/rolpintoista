/* Catálogo base de HABILIDADES PARA CREEPS (nombres generales, no atados a un creep puntual).
   Se abre desde gm-tools ("+ Habilidad" de un creep → biblioteca de habilidades) y se filtra por
   función (daño, defensa, buff, debuff, curación, control, movilidad, invocación, área), mecánica del juego que usa (sigilo, trampas, terreno y formas, niebla y visión, iniciativa, aura, estados alterados, orientación, percepción, movimiento, botín, jefe), a quién apunta (sí mismo, un enemigo, zona, aliados, terreno), velocidad
   (rápida = cooldown 2 o 3; lenta = cooldown 4 a 6, arranca el combate en cooldown), raza/tipo de criatura,
   rol ideal y si está toda automatizada o queda algo a mano.

   Cada entrada guarda la "receta" ({sp, cd, lenta}); al elegirla se calcula con el NIVEL del creep
   (daño 1d6/2d6/3d6 + nivel, cura y bonos según el nivel) usando armarHab de comun/creeps-base.js,
   así la misma habilidad sirve para un creep de nivel 1 o de nivel 5.
   Regla del proyecto: lo que se puede automatizar va automatizado (costo en No2, cooldown, daño, cura,
   bonos a sí mismo); lo que le pasa a otros queda escrito y se resuelve a mano. Todas son un punto de
   partida: se editan como cualquier habilidad.
   Requiere que comun/creeps-base.js se cargue antes (expone window.CreepsBaseUtil). */
(function(){
  const U = window.CreepsBaseUtil;
  if(!U) return;
  const RZ = {'*': 'cualquiera', b: 'bestia', h: 'humano', d: 'humanoide', p: 'planta', e: 'elemental', m: 'no-muerto', c: 'constructo', a: 'alienígena'};
  const RO = {m: 'melee', t: 'tanque', e: 'asalto', r: 'rango', g: 'mágico', a: 'apoyo', x: 'debuffer'};
  const FN = {D: 'daño', T: 'defensa', B: 'buff', X: 'debuff', C: 'curación', K: 'control', M: 'movilidad', I: 'invocación', A: 'área'};
  const aT = (detalle, dano) => ({detalle, no2: 'ATAQUE', dano});
  const zO = (detalle, no2, dano) => ({detalle, no2, dano});
  const RG = [{nombre: 'Rengo', turnos: 2, detalle: 'Rengo 2 turnos: moverse le cuesta 2 No2 por casillero.'}];   // el Rengo de los golpes a las piernas (2026-10-21)
  const SGF = [{nombre: 'Sangrado', turnos: 3, stacks: 3, detalle: 'Sangrado fuerte: 3 de daño por turno durante 3 turnos (se acumula; con crítico, permanente).'}];   // la versión fuerte
  const AR = n => [{nombre: 'Armadura rota', stacks: n, detalle: n > 1 ? 'Armadura rota doble: 2 acumulaciones.' : 'Armadura rota: 1 acumulación.'}];   // romper armadura (2026-10-21)
  const AR_NOTA = 'Alcanza con que el golpe pegue (también un crítico), aunque la armadura frene todo el daño. A un personaje le cae en una pieza equipada al azar (pierde Defensa y durabilidad hasta repararla); a un creep, −1 Defensa por acumulación.';
  const SG = [{nombre: 'Sangrado', turnos: 2, detalle: 'Sangrado: 2 de daño por turno durante 2 turnos (se acumula; con crítico, permanente).'}];   // el Sangrado de los golpes que sangran (2026-10-21)
  const tA = (detalle, no2) => ({detalle, no2});
  // Un ataque con su arma, con arreglos (`arma`: los de la Ejecución ✨ — dados, pdg, fijo, perfora, critBono…), que va al duelo como un ataque.
  const aA = (detalle, arma, ataqueTxt, spCosto, efectos, extra) => ({detalle, no2: 'ATAQUE', ataqueTxt, auditada: true, ...(spCosto !== undefined ? {spCosto} : {}),
    duelo: {modo: 'arma', objetivo: 'enemigo', x: 'nitros', arma: {pdg: 0, dados: 0, fijo: 0, ...arma}, efectos: efectos || [], ...(extra || {})}});   // `extra`: más datos de la Ejecución (la carrera de la Cornada)
  const bU = (detalle, no2, mods, turnos) => ({detalle, no2, efecto: {mods, turnos}});
  const cU = (detalle, no2, k) => ({detalle, no2, cura: k});
  const dC = (detalle, no2, dano, k) => ({detalle, no2, dano, cura: k});
  // 🔥 Arma elemental (2026-10-21, el Support): le pone a un aliado (o a sí mismo) el estado de su elemento, 3 turnos; es su acción de ataque del turno.
  const aE = (estado, que) => ({detalle: `Le encanta el arma a un aliado dentro de su Rango (o la propia): durante 3 turnos de ese aliado, cada golpe con arma que pega suma +1d4 de daño ${que}. Es daño directo: solo lo frena la resistencia a ese elemento. Si ya tenía otra arma elemental, esta la reemplaza. Es su acción de ataque del turno.`,
    no2: 2, spCosto: 2, auditada: true, cuentaComoAtaque: true, ataqueTxt: `${estado} a un aliado (o a sí mismo) 3 turnos: +1d4 ${que.split(/[,(]| y /)[0].trim()} por golpe`,
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', dano: false, efectos: [{nombre: estado}]}});
  // 🌀 Barrido y Coletazo (2026-10-21, choque pesado): la onda alrededor (el Remolino del Warrior, sin moverse): su PdG una vez contra la Evasión de
  // cada uno, el daño de su arma (dados + Dmg) a quien no le gana; sin dodge roll. Lo de un ataque y 2 SP, o cooldown 3; es su ataque del turno.
  // (Sin `cuentaComoAtaque`: cobrar «lo de un ataque» ya lo cuenta como su ataque del turno; con las dos, contaba dos. Probado en el mapa, 2026-10-21.)
  const oB = (detalle, ataqueTxt, efectos) => ({detalle, no2: 'ATAQUE', spCosto: 2, auditada: true, ataqueTxt,
    duelo: {objetivo: 'onda', radio: 1, tira: 'pdg', contra: ['eva'], dano: true, danoArma: true, tipoDano: 'fisico', ignoraDano: false, efectos: efectos || []}});
  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Estado del juego sobre sí mismo (preset de GM Tools: Sigilo, Invulnerable, Espinas…). turnos 0 = hasta que se lo saquen.
  const eS = (detalle, no2, nombre, polaridad, turnos, extra) => ({detalle, no2, efecto: {mods: (extra && extra.mods) || {}, turnos, nombre, polaridad, hp: (extra && extra.hp) || 0}});
  // Trampa: el daño ({T} en la descripción) escala con el nivel; se coloca con Terreno y Formas → Trampa.
  const tR = (detalle, no2, codigo) => ({detalle, no2, trampa: codigo});
  const tS = (detalle, no2) => ({detalle, no2, colocar: true});   // trampa sin daño (alarma, red, humo…)
  const lista = [];
  // 🧭 El rol en la batalla y el grupo de mecánica de las auditadas (dueño, 2026-10-21: «que el editor te diga qué rol cumple y te muestre los skills
  // agrupados por mecánica»; los grupos son los de docs/diseno-roles-creep.md). Se suman a las etiquetas para filtrar la biblioteca.
  const MECANICA = {
    'Golpe fuerte': ['choque pesado', 'más daño'], 'Puño de roca': ['choque pesado', 'más daño'], 'Cornada': ['choque pesado', 'empujar'],
    'Mordisco feroz': ['choque pesado', 'atrapar'], 'Agarrón': ['choque pesado', 'atrapar'], 'Abrazo aplastante': ['choque pesado', 'atrapar'],
    'Aguante': ['choque pesado', 'guardia'],
    'Tajo veloz': ['choque liviano', 'golpe preciso'], 'Estocada': ['choque liviano', 'golpe preciso'], 'Zarpazo': ['choque liviano', 'golpe preciso'],
    'Golpe que sangra': ['choque liviano', 'sangrado'], 'Zarpazo desgarrador': ['choque liviano', 'sangrado'], 'Corte profundo': ['choque liviano', 'sangrado'],
    'Colmillos que perforan': ['choque liviano', 'sangrado'], 'Tajo brutal': ['choque liviano', 'sangrado'], 'Desgarro': ['choque liviano', 'sangrado'],
    'Corte certero': ['choque liviano', 'sangrado'], 'Zarpa certera': ['choque liviano', 'sangrado'], 'Tajo de carnicero': ['choque liviano', 'sangrado'],
    'Destripar': ['choque liviano', 'sangrado'],
    'Golpe a la rodilla': ['choque liviano', 'trabar'], 'Tarascón al tobillo': ['choque liviano', 'trabar'], 'Tiro a la rodilla': ['rango', 'trabar'], 'Mantener a raya': ['rango', 'mantener a raya'], 'Flecha que atraviesa': ['rango', 'atravesar'], 'Disparo y repliegue': ['rango', 'disparar y replegarse'], 'Nube tóxica': ['debuffer', 'nube tóxica'], 'Empuje': ['support', 'empower'], 'Sanguijuela': ['debuffer', 'sanguijuela'], 'Luz para los suyos': ['support', 'luz para los suyos'], 'Finta': ['choque liviano', 'finta'], 'Dash': ['choque liviano', 'dash'], 'Aguja siniestra': ['debuffer', 'punto débil'], 'Parpadeo': ['mago', 'parpadeo'], 'Tiro que derriba': ['rango', 'tiro que derriba'], 'Ojo de asesino': ['choque liviano', 'buscar el crítico'], 'Pisotón': ['choque pesado', 'aturdir'], 'Tirar la bronca': ['support', 'provocar para un aliado'], 'Nova arcana': ['mago', 'nova arcana'], 'Ráfaga de viento': ['mago', 'ráfaga de viento'], 'Tiro al arma': ['rango', 'tiro al arma'], 'Tiro certero': ['rango', 'tiro certero'], 'Tormenta arcana': ['mago', 'tormenta arcana'], 'Cascotazo': ['mago', 'proyectil de piedra'], 'Abanico': ['rango', 'abanico'], 'Smite': ['support', 'smite'], 'Prisión de hielo': ['mago', 'prisión de hielo'], 'Degollar': ['choque liviano', 'todo al ataque'], 'Clavar a la pared': ['rango', 'clavar a la pared'], 'Maldición debilitante': ['debuffer', 'debilitar'], 'Maldición tormentosa': ['debuffer', 'atormentar'], 'Robar el aliento': ['debuffer', 'drenar no2'], 'Envión': ['support', 'envión'], '¡Al frente!': ['support', 'llevar al lado de un rival'], 'Bomba de humo': ['choque liviano', 'desaparecer en la pelea'], 'Golpe desesperado': ['choque liviano', 'golpe desesperado'], 'Takle': ['choque pesado', 'takle'], 'Furia': ['choque pesado', 'furia'], 'Ráfaga encadenada': ['rango', 'disparos encadenados'], 'Extenuar': ['debuffer', 'extenuar'], 'Cegar': ['debuffer', 'cegar'], 'Hoja envenenada': ['choque liviano', 'veneno'], 'Mordisco infectado': ['choque liviano', 'veneno'], 'Grito de pánico': ['debuffer', 'grito de pánico'],
    // ⚔🛡 La tanda del Choque pesado (2026-10-27): 10 warrior · 10 tanque · 10 ambiguas.
    'Golpe brutal': ['choque pesado', 'golpe brutal'], 'Arte de la guerra': ['choque pesado', 'arte de la guerra'], 'Contraataque': ['choque pesado', 'contraataque'],
    'Golpe que sigue': ['choque pesado', 'golpe que sigue'], 'Provocar': ['choque pesado', 'provocar'], 'Piel de hierro': ['choque pesado', 'piel de piedra'],
    'Blindaje': ['choque pesado', 'blindaje'], 'Segundo aliento': ['choque pesado', 'segundo aliento'], 'Escudo humano': ['choque pesado', 'proteger a un aliado'],
    'Interponerse': ['choque pesado', 'interponerse'], 'Golpe de escudo': ['choque pesado', 'derribar'], 'Carga que derriba': ['choque pesado', 'carga que derriba'],
    'Sonic Boom': ['choque pesado', 'sonic boom'], 'Arrastrar': ['choque pesado', 'arrastrar'],
    'Red': ['hunter', 'trabar'], 'Tela de araña': ['hunter', 'trabar'],
    'Hit and run': ['choque liviano', 'golpear y alejarse'],
    'Salto': ['choque liviano', 'salto'], 'Salto aplastante': ['choque pesado', 'salto'], 'Vigilancia': ['rango', 'vigilancia'], 'Bola de fuego': ['mago', 'daño en área'], 'Confusión': ['debuffer', 'control mental'],
    'Arma ígnea': ['support', 'arma elemental'], 'Arma helada': ['support', 'arma elemental'], 'Arma eléctrica': ['support', 'arma elemental'],
    'Arma ácida': ['support', 'arma elemental'], 'Arma venenosa': ['support', 'arma elemental'], '¡A la carga!': ['support', 'grito de guerra'], 'Arenga': ['support', 'grito de guerra'], 'Sanar': ['support', 'curar'], 'Oleada sanadora': ['support', 'curar'], 'Bálsamo': ['support', 'curar'], 'Círculo de sanación': ['support', 'curar'], 'Aura sanadora': ['support', 'curar'],
    'Barrido': ['choque pesado', 'barrido'], 'Coletazo': ['choque pesado', 'barrido'],
    'Tiro a la cabeza': ['rango', 'tiro apuntado'], 'Desarmar': ['choque pesado', 'desarmar'], 'El que avisa no traiciona': ['choque pesado', 'golpe anunciado'], 'Sal en la herida': ['choque liviano', 'abrir la herida'], 'Remate': ['choque pesado', 'remate'], 'Ir por el herido': ['choque pesado', 'remate'], 'Morder la herida': ['choque liviano', 'abrir la herida'], 'Patotear': ['choque liviano', 'manada'], 'Jauría': ['choque liviano', 'manada'], 'Zarpazo erguido': ['choque pesado', 'golpe anunciado'], 'Mal de ojo': ['debuffer', 'maleficio'], 'Disparo señalador': ['rango', 'señalar'], 'Ráfaga de cortes': ['choque liviano', 'ráfaga'], 'Ráfaga de zarpazos': ['choque liviano', 'ráfaga'],
    'Romper armadura': ['choque pesado', 'romper armadura'], 'Arrancar la coraza': ['choque pesado', 'romper armadura'],
    'Golpe demoledor': ['choque pesado', 'romper armadura'], 'Mandíbula trituradora': ['choque pesado', 'romper armadura'], 'Cadena de rayos': ['mago', 'rayo en cadena'], 'Zap': ['mago', 'rayo paralizante'], 'Lluvia de escarcha': ['mago', 'lluvia de escarcha'], 'Andanada arcana': ['mago', 'andanada arcana'], 'Misil arcano': ['mago', 'misil elemental'], 'Lengua de fuego': ['mago', 'misil elemental'], 'Dardo helado': ['mago', 'misil elemental'], 'Centella': ['mago', 'misil elemental'], 'Mancha corrosiva': ['mago', 'misil elemental'], 'Ponzoña': ['mago', 'misil elemental'], 'Misil elemental': ['mago', 'misil elemental'], 'Portal trampa': ['mago', 'portal trampa'], 'Tótem de silencio': ['debuffer', 'palabra de silencio'], 'Redoble de tambores': ['support', 'redoble de tambores'], 'Frenesí inducido': ['support', 'frenesí inducido'], 'Purificar': ['support', 'limpiar estados'], 'Levitar': ['support', 'levitar'], 'Hálito polar': ['mago', 'cono de frío'], 'Muro de fuego': ['mago', 'muro de fuego'], 'Descarga arcana': ['mago', 'descarga cargada'], 'Maldición de la coraza': ['debuffer', 'bajar la armadura'], 'Maldición de la sequía': ['debuffer', 'cortar la regeneración'], 'Aguja del desamparo': ['debuffer', 'exponer'], 'Disipar': ['debuffer', 'disipar'], 'Señalar la presa': ['support', 'señalar la presa'], 'Lanza de luz': ['mago', 'línea que atraviesa'], 'Corroer': ['debuffer', 'corroer'], 'Escupitajo ácido': ['debuffer', 'corroer'], 'Armas perforantes': ['support', 'armas perforantes'], 'Estandarte de guerra': ['support', 'estandarte'], 'Meteoro': ['mago', 'área anunciada'], 'Coraza de púas': ['support', 'devolver el daño'], 'Bendecir el arma': ['support', 'bendecir el arma'], 'Ojo certero': ['support', 'ojo certero'], 'Velo espejado': ['support', 'devolver el daño'],
    'Puñalada por la espalda': ['choque liviano', 'por la espalda'], 'Mordida a traición': ['choque liviano', 'por la espalda'], 'Puñalada trapera': ['choque liviano', 'por la espalda'],
  };

  // fn: función (D T B X C K M I A); mec: mecánicas del juego que usa, separadas por coma (sigilo, trampas, terreno…);
  // el objetivo (sí mismo / un enemigo / zona / aliados / terreno) se deduce de la descripción salvo que se pase en mec.
  function H(nombre, fn, razas, roles, cd, spBase, mec){
    const sp = {nombre, ...spBase};
    if(sp.magico === undefined && roles.includes('g')) sp.magico = true;   // rol mágico: pega con PdG.Esp
    const lenta = cd >= 4 || sp.arrancaEnCooldown === true;   // (2026-10-24, el Meteoro: «cooldown 3, pero que empiece activado, tipo lento»)
    const frases = sp.detalle.split(/(?<=[.!?])\s+/);
    const aMano = U.hayManual(sp);
    const etiquetas = [...fn].map(c => FN[c]).filter(Boolean), razasTxt = [...razas].map(c => RZ[c]).filter(Boolean), rolesTxt = [...roles].map(c => RO[c]).filter(Boolean);
    const mecTags = mec ? mec.split(',').map(t => t.trim()).filter(Boolean) : [];
    const OBJ = ['a sí mismo', 'un enemigo', 'zona o área', 'aliados', 'terreno'];
    const objTags = mecTags.filter(t => OBJ.includes(t)), mecPuras = mecTags.filter(t => !OBJ.includes(t));
    if(!objTags.length){
      if(sp.efecto && !/aliado|objetivo/i.test(sp.detalle) || sp.cura) objTags.push('a sí mismo');
      if(/aliado/i.test(sp.detalle)) objTags.push('aliados');
      if(sp.dano || /objetivo|enemigo|el que |quien /i.test(sp.detalle)) objTags.push('un enemigo');
      if(fn.includes('A') || /flor de|en flor|cono|línea|adyacentes/i.test(sp.detalle)) objTags.push('zona o área');
      if(!objTags.length) objTags.push('a sí mismo');
    }
    if(sp.efecto && sp.efecto.nombre && !mecPuras.includes('estados alterados')) mecPuras.push('estados alterados');
    if(U.aplicaDe(sp) && !mecPuras.includes('estados alterados')) mecPuras.push('estados alterados');
    if(fn.includes('I')) mecPuras.push('invocación');
    lista.push({
      poolId: 'hab-' + slug(nombre) + '-' + lista.length, nombre,
      etiquetas: [...new Set([...etiquetas, lenta ? 'lenta' : 'rápida', ...razasTxt, ...rolesTxt, ...objTags, ...mecPuras, aMano ? 'con parte a mano' : 'toda automatizada',
        sp.auditada ? 'auditada' : 'sin auditar', ...(MECANICA[nombre] || [])])],   // ✅ la auditoría de 2026-10-20 (docs/auditoria-skills-creep.md): para filtrar
      detalle: sp.detalle.replace(/\{T\}/g, '(daño según el nivel)'), datos: {sp, cd, lenta},
    });
  }

  /* ================= DAÑO CUERPO A CUERPO ================= */
  // Auditada (dueño, 2026-10-20): como el Amplificar daño del Warrior con X = 1 — +1 dado del Tipo de su arma, 1 SP (o cooldown 2).
  H('Golpe fuerte', 'D', '*', 'mt', 2, aA('Un golpe cargado con todo el peso: un ataque con su arma que suma +1 dado del Tipo de su arma al daño.', {dados: 1},
    'va al duelo como un ataque (PdG contra Evasión o Parry, Bloqueo y crítico) con +1 dado del Tipo de su arma', 1));
  // Auditada (dueño, 2026-10-20, «la versión más afilada»): como la Carga del Warrior con X = 2, sin la carrera, más Crítico frecuente +1 (como
  // el Tajear del Asalto) — +2 PdG, +2 al daño y Crítico frecuente +1; 3 SP (o cooldown 3).
  H('Tajo veloz', 'D', '*', 'me', 3, aA('Un corte rápido y certero: un ataque con su arma con +2 a la Probabilidad de Golpe, +2 al daño y Crítico frecuente +1.', {pdg: 2, fijo: 2, critBono: 1},
    'va al duelo como un ataque (PdG contra Evasión o Parry, Bloqueo y crítico) con +2 PdG, +2 al daño y Crítico frecuente +1', 3));
  // Auditada (dueño, 2026-10-21): Perfora 2 y +1 al daño, 2 SP (o cooldown 2) — la que atraviesa armadura.
  H('Estocada', 'D', 'hd', 'me', 2, aA('Una punzada directa al punto débil: un ataque con su arma con Perfora 2 (2 puntos del daño pasan siempre la Defensa) y +1 al daño.', {perfora: 2, fijo: 1},
    'va al duelo como un ataque (PdG contra Evasión o Parry, Bloqueo y crítico) con Perfora 2 y +1 al daño', 2));
  H('Golpe aplastante', 'D', '*', 'mt', 4, zO('Un golpe devastador que casi no se puede esquivar.', 3, 'H'));
  H('Embestida', 'DK', 'b', 'mt', 3, zO('Carga con todo el cuerpo y empuja al objetivo un casillero (a mano).', 3, 'M'));
  // Auditada (dueño, 2026-10-21): salvaje — Crítico potente +2 y +1 al daño, 2 SP (o cooldown 2), como el Lisiar del Asalto sin la Lesión.
  H('Zarpazo', 'D', 'b', 'me', 2, aA('Un zarpazo salvaje: un ataque con su arma con Crítico potente +2 (si sale el crítico, multiplica más) y +1 al daño.', {critpotBono: 2, fijo: 1},
    'va al duelo como un ataque (PdG contra Evasión o Parry, Bloqueo y crítico) con Crítico potente +2 y +1 al daño', 2));
  // Auditada (dueño, 2026-10-21): la que no suelta — si pega, el mordido y la bestia quedan trabados; al empezar su turno el mordido tira Fuerza contra
  // la Fuerza de la bestia (gratis) y, si no se suelta, el mordisco le vuelve a hacer daño; la bestia lo suelta al empezar su siguiente turno (js/54).
  H('Mordisco feroz', 'D', 'b', 'me', 3, aA('Una mordida profunda que no suelta: un ataque con su arma con +1 dado del Tipo de su arma. Si pega, el objetivo queda Mordido (no se mueve, y la bestia tampoco): al empezar su turno tira Fuerza contra la Fuerza de la bestia, gratis; si no se suelta, el mordisco le vuelve a hacer el mismo daño. La bestia lo suelta al empezar su siguiente turno.',
    {dados: 1}, 'va al duelo como un ataque con +1 dado del Tipo de su arma; si pega, deja Mordido (se suelta con Fuerza contra su Fuerza; si no, recibe el daño otra vez)', 3,
    [{nombre: 'Mordido', soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'fue', no2: 0, alEmpezar: true, danoFalla: 'golpe'}}]));
  H('Mordisco venenoso', 'DX', 'b', 'ex', 3, zO('Muerde y, si golpea, tirá 1d4: con 1 el objetivo queda Envenenado (a mano).', 2, 'L'));
  // Auditada (dueño, 2026-10-21): la que empuja y toma carrera — al lado, +1 PdG, +1 al daño y empuja 1; si se ejecuta de lejos, corre en línea recta
  // hasta quedar al lado (1 No2 por casillero) y suma +1 a todo eso por cada casillero que corrió (vtt-hexgrid/js/55).
  H('Cornada', 'D', 'b', 'mt', 2, aA('Embiste con los cuernos: un ataque con su arma con +1 a la Probabilidad de Golpe y +1 al daño; si pega, lo empuja 1 casilla lejos de la bestia. Si la ejecuta de lejos, toma carrera: corre en línea recta hasta quedar al lado (1 No2 por casillero) y suma +1 a la Probabilidad de Golpe, +1 al daño y +1 casilla de empuje por cada casillero que corrió.',
    {pdg: 1, fijo: 1}, 'va al duelo como un ataque con +1 PdG y +1 al daño (más 1 de cada por casillero de carrera); si pega, lo empuja', 2,
    [{nombre: 'Empujón', empuja: 1, detalle: 'Lo empuja 1 casilla, lejos de la bestia.'}], {embestida: true}));
  // 🦎 Auditada (dueño, 2026-10-21; choque pesado, «barrido»): el Barrido de las bestias, y además empuja 1.
  H('Coletazo', 'DA', 'bc', 'mt', 3, oB('Da un giro con la cola y le pega a todos los rivales que tiene al lado (la flor de diámetro 3, 7 casillas, a su alrededor; él no se cuenta). A cada uno que no le gana le hace el daño de su arma (sus dados más su Dmg), menos su Defensa, y lo empuja 1 casillero lejos de él; si choca contra algo, recibe además el daño de colisión. Tira su Probabilidad de Golpe una sola vez, contra la Evasión de cada uno; quien gana su Evasión no recibe nada (sin dodge roll). Cuenta como su ataque del turno.',
    'su PdG, una vez, contra la Evasión de cada uno al lado; el daño de su arma y empuja 1 a quien no le gana',
    [{nombre: 'Empujón', empuja: 1, detalle: 'Lo empuja 1 casilla, lejos de la bestia.'}]));
  H('Golpe doble', 'D', '*', 'me', 3, zO('Dos ataques seguidos: se tira el daño dos veces (a mano la segunda).', 3, 'M'));
  // 🗡 Auditada (dueño, 2026-10-23; choque pesado, «remate», escalonado): un ataque con su arma; si el objetivo tiene la mitad de la vida o menos,
  // +2 dados del Tipo de su arma; un cuarto o menos, +3. Lo de un ataque y 2 SP, o cooldown 3. La vida la mira el mapa al elegir el objetivo (js/69).
  // Original: «Un golpe de gracia contra alguien herido: si el objetivo tiene menos de la mitad de HP, +1 dado (a mano).»
  [['Remate', 'hd', 'Un golpe de gracia contra alguien herido'], ['Ir por el herido', 'b', 'Huele la debilidad y va por ella']].forEach(([nombre, razas, como]) =>
    H(nombre, 'D', razas, 'me', 3, aA(`${como}: un ataque con su arma. Si el objetivo tiene la mitad de la vida o menos, suma +2 dados del Tipo de su arma; si tiene un cuarto o menos, +3. Si está más sano, va como un ataque común.`,
      {}, 'va al duelo como un ataque: +2 dados si el objetivo tiene la mitad de la vida o menos, +3 si tiene un cuarto o menos', 2, [], {remate: true})));
  // 🗡 Auditada (dueño, 2026-10-21; choque liviano, «por la espalda»): la versión fuerte de la Puñalada por la espalda.
  H('Puñalada trapera', 'D', 'hd', 'e', 4, aA('Un ataque con su arma desde el punto ciego del objetivo (su espalda): suma +1 dado de su arma al daño y Crítico frecuente +1, además del +1 a la Probabilidad de Golpe de todo ataque por la espalda. Si además viene en sigilo (el objetivo no lo vio venir), el daño de su arma se duplica (el doble de dados) en lugar del +1 dado. Si no está en la espalda, avisa y deja atacar igual, sin el bono.',
    {}, 'un ataque con su arma; por la espalda +1 dado y Crítico frecuente +1; en sigilo, el doble de dados', 4, [], {punalada: 'trapera'}));
  // 🩸 Las cuatro variantes del Sangrado (dueño, 2026-10-21: «un golpe simple que solamente añade sangrado; uno que añade perfora y sangrado; uno que
  // añade daño y sangrado; uno que añade crítico frecuente y sangrado»), cada una en versión de humanoide y de bestia («hacé todas»).
  // ☠ Auditadas (dueño, 2026-10-25; choque liviano, «veneno»: la propuesta de Claude con «2 perfora en vez de +1 dado»): un ataque con su arma con
  // Perfora 2; si pega, Veneno 3 stacks (1 de daño por stack al empezar cada turno, y baja uno: 3 + 2 + 1). Humanoide y bestia, como el Sangrado.
  // Costo de Claude: el ataque y 2 SP, o cooldown 3. (El viejo Golpe envenenado, a mano, queda como estaba.)
  const VN = [{nombre: 'Veneno', stacks: 3, detalle: 'Veneno 3: al empezar cada uno de sus turnos, 1 de daño por stack, y baja un stack (3 + 2 + 1).'}];
  H('Hoja envenenada', 'DX', 'hd', 'me', 3, aA('Una hoja untada en veneno: un ataque con su arma con Perfora 2 (2 puntos del daño pasan siempre la Defensa); si pega, deja Veneno 3 (al empezar cada uno de sus turnos, 1 de daño por stack, y baja un stack: 3, 2 y 1).',
    {perfora: 2}, 'va al duelo como un ataque con Perfora 2; si pega, Veneno 3', 2, VN));
  // 🐀 La de las bestias (dueño, 2026-10-25: el Colmillo venenoso y el Mordisco infectado de la Rata eran «muy parecidos para que haya cargadas dos»;
  // y después: «quise decir de los dos el más poderoso, y de nombre Mordisco infectado»): queda la versión fuerte (la que era el Colmillo venenoso: la
  // pareja de la Hoja) con el nombre de la Rata; sale de la lista de «El origen» y en la partida las ratas pasan a tenerla.
  H('Mordisco infectado', 'DX', 'b', 'me', 3, aA('Una mordida con los dientes sucios: un ataque con su arma con Perfora 2 (2 puntos del daño pasan siempre la Defensa); si pega, deja Veneno 3 (al empezar cada uno de sus turnos, 1 de daño por stack, y baja un stack: 3, 2 y 1).',
    {perfora: 2}, 'va al duelo como un ataque con Perfora 2; si pega, Veneno 3', 2, VN));
  H('Corte profundo', 'DX', 'hd', 'me', 3, aA('Una herida abierta que llega hondo: un ataque con su arma con Perfora 1 (1 punto del daño pasa siempre la Defensa); si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {perfora: 1}, 'va al duelo como un ataque con Perfora 1 (1 punto del daño pasa siempre la Defensa); si pega, Sangrado', 2, SG));
  H('Tajo brutal', 'DX', 'hd', 'me', 3, aA('Un tajo con todo el peso: un ataque con su arma con +2 al daño; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; si pega, Sangrado', 2, SG));
  H('Corte certero', 'DX', 'hd', 'me', 3, aA('Un corte buscando la arteria: un ataque con su arma con Crítico frecuente +1; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {critBono: 1}, 'va al duelo como un ataque con Crítico frecuente +1; si pega, Sangrado', 2, SG));
  // 🩸 La versión fuerte (dueño, 2026-10-21: «una versión fuerte, que salga más cara… con el sangrado como eje identitario, 4 SP»; elegida la B).
  H('Tajo de carnicero', 'DX', 'hd', 'me', 4, aA('Un tajo de carnicero que abre de lado a lado: un ataque con su arma con Perfora 1 (1 punto del daño pasa siempre la Defensa) y Crítico frecuente +1; si pega, deja un Sangrado fuerte (3 de daño por turno durante 3 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {perfora: 1, critBono: 1}, 'va al duelo como un ataque con Perfora 1 y Crítico frecuente +1; si pega, Sangrado fuerte (3 por turno, 3 turnos)', 4, SGF));
  // (Golpe de escudo, la vieja a mano: la reemplaza la de la tanda del Choque pesado, 2026-10-27.)
  // 🌀 Auditada (dueño, 2026-10-21; choque pesado, «barrido»): castiga a quien lo rodea. El daño se tira en cada duelo de la cascada (dueño: «así como está»).
  H('Barrido', 'DA', 'hd', 'mt', 3, oB('Gira con su arma y le pega a todos los rivales que tiene al lado (la flor de diámetro 3, 7 casillas, a su alrededor; él no se cuenta). A cada uno que no le gana le hace el daño de su arma (sus dados más su Dmg), menos su Defensa. Tira su Probabilidad de Golpe una sola vez, contra la Evasión de cada uno; quien gana su Evasión no recibe nada (sin dodge roll). Cuenta como su ataque del turno.',
    'su PdG, una vez, contra la Evasión de cada uno al lado; el daño de su arma a quien no le gana'));
  H('Torbellino de acero', 'DA', 'hd', 'm', 5, zO('Gira sobre sí mismo golpeando a todos los adyacentes (a mano).', 4, 'H'));
  // 🦶 Auditada (dueño, 2026-10-26; Choque pesado, «pisotón» y «aturdir», el Shockwave del Tanque, un escalón arriba): FLASH (el botón ✨ del GM; en turno ajeno,
  // el doble). Una onda alrededor: su Fuerza contra cada rival pegado, que elige cómo defenderse: Res.CC (si gana, nada) o Evasión (si gana, el dodge roll:
  // salir de al lado; `dodgeConEva`). Al que no se salva: el daño es la diferencia (físico, directo: «el temblor sacude por dentro, la armadura no lo
  // frena») y Pajaritos 2 turnos. Costo de Claude: 3 SP (el del Shockwave), o cooldown 3.
  H('Pisotón', 'DAK', '*', 'mt', 3, {detalle: 'FLASH (se puede usar en cualquier momento; en turno ajeno cuesta el doble). Pisa tan fuerte que sacude el suelo alrededor: tira su Fuerza contra cada rival pegado a él, que elige cómo defenderse: con su Resistencia al control (si gana, no le pasa nada) o con su Evasión (si gana, tiene que salir de al lado con el dodge roll). Al que no se salva: tanto daño como lo que le ganó la Fuerza (físico, directo: el temblor sacude por dentro y la armadura no lo frena) y queda en Pajaritos 2 turnos.',
    no2: 0, spCosto: 3, flash: true, auditada: true, ataqueTxt: 'Flash: onda alrededor; su Fuerza contra la Res.CC o la Evasión de cada rival pegado; la diferencia de daño (directo) y Pajaritos 2 turnos',
    duelo: {objetivo: 'onda', radio: 1, tira: 'fue', contra: ['rescc', 'eva'], dodgeConEva: true, dano: true, danoDiferencia: true, tipoDano: 'fisico', ignoraDano: true, danoDirecto: true,
      efectos: [{nombre: 'Pajaritos', turnos: 2}]}});
  // 💥 Auditada (dueño, 2026-10-26; Choque pesado, el Takle del Tanque para creeps: «el tackle por definición no usa el arma… el desplazamiento sin coste
  // de nitros y un efecto bastante similar. El costo… 2 nitros y 3 SP»): Flash; corre hasta 2 casillas, gratis y sin oportunidad, hasta quedar pegado
  // (js/55, `corre`) y lo embiste: su Constitución +2 contra la Constitución; si gana, pierde 3 No2, lo empuja 2 y se le corta el turno: al final del orden
  // (si ya era el último, pierde el turno: js/04 alFinalDelOrden). 2 No2 y 3 SP (en turno ajeno, el SP al doble), o cooldown 3.
  H('Takle', 'K', '*', 'mt', 3, {detalle: 'Flash. Corre hasta 2 casillas (gratis, sin ataques de oportunidad) hasta quedar pegado a un rival y se le tira encima con todo el cuerpo, sin arma: su Constitución +2 contra la Constitución del objetivo. Si gana, el objetivo pierde 3 No2, sale empujado 2 casillas (si choca contra algo, el daño de colisión de siempre) y se le corta el turno: pasa al final del orden de turnos. Si ya era el último, pierde el turno.',
    no2: 2, spCosto: 3, flash: true, auditada: true, ataqueTxt: 'Flash: corre hasta 2 y embiste — su Con +2 contra la Con; pierde 3 No2, empujado 2 y al final del orden',
    duelo: {objetivo: 'enemigo', alcance: 'fijo', alcanceN: 3, salto: 2, corre: true, tira: 'con', tiraBono: 2, contra: ['con'], dano: false, efectos: [
      {nombre: 'Pierde No2', no2: 3}, {nombre: 'Empujón', empuja: 2, detalle: 'Lo empuja 2 casillas, lejos de quien lo embiste.'},
      {nombre: 'Al final del orden', detalle: 'Se le corta el turno y pasa al final del orden de turnos; si ya era el último, pierde el turno.'}]}});
  /* ================= ⚔🛡 LA TANDA DEL CHOQUE PESADO (dueño, 2026-10-27; docs/diseno-roles-creep.md, «Tanda Choque pesado 10 · 10 · 10») =================
     «Podemos agarrar las habilidades de clase del Warrior y del tanque y ya adaptarlas todas a este grupo… 10 claras de tanque, 10 claras de Warrior y
     10 ambiguas». Cada una un escalón arriba de la de clase. Lo que hace el mapa: vtt-hexgrid/js/78 (Interponerse, Golpe que sigue, Arrastrar, el
     derribo de la Carga) y js/55 (la carrera). */
  // ⚔ Golpe brutal (de clase, un escalón arriba; dueño: «+1 frecuente, +2 potente, +3 al daño»): queda en Guardia baja (−2 Evasión) hasta su próximo turno.
  H('Golpe brutal', 'D', '*', 'm', 2, {...aA('Se juega todo en un golpe: un ataque con su arma con Crítico frecuente +1, Crítico potente +2 y +3 al daño. A cambio, queda en Guardia baja (−2 a la Evasión) hasta su próximo turno.',
    {critBono: 1, critpotBono: 2, fijo: 3}, 'va al duelo como un ataque con Crítico frecuente +1, Crítico potente +2 y +3 al daño; queda en Guardia baja (−2 Evasión) hasta su próximo turno', 2, []),
    efecto: {nombre: 'Guardia baja', turnos: 1, mods: {eva: -2}, polaridad: 'debuff', detalle: 'Guardia baja: se jugó todo en el golpe — −2 a la Evasión hasta su próximo turno.'}});
  // ⚔ Arte de la guerra (de clase: «+2 fijo a una tirada de PG, Parry, Bloqueo o Daño»; dueño: «está bien el más 3, está bien el flash, pero que no sea
  // después de ver los dados»): el Flash del duelo, que se marca antes de tirar (comun/creep-duelo.js flashOpciones).
  H('Arte de la guerra', 'B', 'hd', 'm', 2, {detalle: 'FLASH (en turno ajeno cuesta el doble). Antes de tirar, elige una tirada suya del duelo —la Probabilidad de Golpe, el Parry, el Bloqueo o el daño, atacando o defendiendo— y le suma +3 fijo.',
    no2: 0, spCosto: 2, auditada: true, ataqueTxt: 'Flash en el duelo, antes de tirar: +3 fijo a su PdG, Parry, Bloqueo o daño',
    duelo: {modo: 'flash', flash: {en: ['pdg', 'parry', 'bloqueo', 'dano'], bono: 3}}});
  // ⚔ Contraataque (de clase; dueño: «que no ataque gratis sin nitros, que gaste los nitros de un primer ataque»): al ganar la Evasión o el Parry, el duelo
  // pregunta «¿Contraataca?» (comun/creep-duelo.js); +1 PdG (CreepAcciones.bonoEspecial). Flash: su SP o su cooldown, al doble (es en turno ajeno).
  H('Contraataque', 'D', '*', 'm', 2, {detalle: 'FLASH (en el turno de otro: cuesta el doble). Si gana la Evasión o el Parry contra un ataque cuerpo a cuerpo, le contesta al que lo atacó: un ataque con su arma con +1 a la Probabilidad de Golpe, que paga lo de un primer ataque y no cuenta como su ataque del turno. El duelo lo pregunta solo («¿Contraataca?»).',
    no2: 0, spCosto: 2, auditada: true, contraEsquiva: true, ataqueTxt: 'al ganar la Evasión o el Parry: un contraataque con +1 PdG (lo de un primer ataque)'});
  // ⚔ Golpe que sigue ✦ (A5; dueño: «vamos así»): si lo deja en 0, otro rival pegado (vtt-hexgrid/js/78).
  H('Golpe que sigue', 'D', '*', 'm', 2, aA('Un golpe pesado que no se detiene: un ataque con su arma con +2 al daño. Si deja al rival en 0, ataca enseguida a otro rival pegado a él, pagando lo de un primer ataque (ese segundo golpe no vuelve a seguir).',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; si lo deja en 0, sigue contra otro rival pegado (lo de un primer ataque)', 2, [], {sigue: true}));
  // 🛡 Provocar (el Taunt, un escalón arriba; dueño: «PdG especial más nivel contra resistencia mental… el de creep además suma 2 de defensa y 2 de defensa
  // especial»): el Provocado de Tirar la bronca (con quién provoca, vtt-hexgrid/js/13) y Desafiante para él (js/13: el efecto va a quien provoca).
  H('Provocar', 'K', '*', 't', 2, {detalle: 'Se le planta a un rival dentro de su Rango y lo llama: tira su Probabilidad de Golpe especial + su nivel contra la Resistencia mental del rival. Si gana, el rival queda Provocado por él 2 turnos (su turno es para ir contra él: atacarlo o usarle una habilidad hostil; si no llega, acercarse) y el creep queda Desafiante: +2 a la Defensa y +2 a la Defensa especial, 2 turnos.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'PdG.Esp + su nivel contra la Res.Mt; Provocado 2 turnos, y él Desafiante (+2 Defensa y +2 Def. especial)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', tiraBonoNivel: true, contra: ['resm'], alcance: 'rango', dano: false, efectos: [{nombre: 'Provocado', turnos: 2},
      {nombre: 'Desafiante', turnos: 2, polaridad: 'buff', detalle: 'Para quien provoca: +2 a la Defensa y +2 a la Defensa especial, 2 turnos.'}]}}, 'estados alterados');
  // 🛡 Piel de hierro (Piel resistente + Temple, un escalón arriba; dueño: «va así»).
  H('Piel de hierro', 'T', '*', 't', 3, {detalle: 'Endurece el cuerpo como el hierro: +6 a la Defensa, +6 a la Defensa especial y +1 a la Resistencia a crítico de todo Tipo, 2 turnos.',
    no2: 1, spCosto: 4, auditada: true, ataqueTxt: 'sobre sí: +6 Defensa, +6 Def. especial y +1 a la Resistencia a crítico de todo Tipo, 2 turnos',
    efecto: {nombre: 'Piel de hierro', turnos: 2, mods: {def: 6, armadmg: 6, tipo1: 1, tipo2: 1, tipo3: 1, tipo4: 1, tipo5: 1}, detalle: 'Piel de hierro: +6 a la Defensa, +6 a la Defensa especial y +1 a la Resistencia a crítico de todo Tipo, 2 turnos.'}});
  // 🛡 Blindaje (de clase, un escalón arriba; dueño: «está bien que sea más poderosa, pero solamente contra sí mismo»): Flash, absorbe 12.
  H('Blindaje', 'T', '*', 't', 2, {detalle: 'FLASH (en turno ajeno cuesta el doble). Solo sobre sí: un blindaje que absorbe 12 de daño de la próxima fuente de daño (si hace más, el resto entra normal).',
    no2: 0, spCosto: 1, flash: true, auditada: true, ataqueTxt: 'Flash: sobre sí, absorbe 12 de la próxima fuente de daño',
    duelo: {objetivo: 'uno mismo', tira: '', contra: [], efectos: [{nombre: 'Barrera', turnos: 2, escudo: 12, polaridad: 'buff', detalle: 'Blindaje: absorbe 12 de daño de la próxima fuente de daño, como una barra de HP secundaria (🛡). Si la fuente hace más, el resto entra normal.'}]}});
  // 🛡 Segundo aliento (la Recuperación, un escalón arriba; dueño: «que cueste 3 SP y que quite cualquier debuff»): una vez por combate.
  H('Segundo aliento', 'C', '*', 't', 3, {detalle: 'Respira hondo y se recompone: se cura 6 + su Constitución y se saca un debuff, el que elija. Una vez por combate.',
    no2: 2, spCosto: 3, auditada: true, curaMasCon: 6, quitaDebuff: true, unaVez: true, ataqueTxt: 'se cura 6 + su Constitución y se saca un debuff a elección; una vez por combate'});
  // 🛡 Escudo humano (el Miti-Miti, un escalón arriba; dueño: «va así. Igual puede combinar con un escudo de vida extra… de 5 HP»): el reparto, js/10.
  H('Escudo humano', 'T', 'hdc', 't', 3, {detalle: 'Marca a un aliado a 3 casillas o menos como protegido, 2 turnos: de cada golpe o área que lo daña, el creep se lleva la mitad (redondeada para arriba), directo a su vida (sin su Defensa: ya pasó la del aliado). Si se alejan a más de 3 casillas, no reparte. Además, al usarla gana 5 de Vida extra, lo primero que se gasta de lo que le llega.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'un aliado a 3 o menos, protegido 2 turnos: él se lleva la mitad de su daño; y 5 de Vida extra',
    efecto: {nombre: 'Vida extra', escudo: 5, detalle: 'Escudo humano: 5 de Vida extra, lo primero que se gasta de lo que le llega.'},
    duelo: {objetivo: 'aliado', tira: '', contra: [], alcance: 'fijo', alcanceN: 3, efectos: [{nombre: 'Miti-Miti', turnos: 2, polaridad: 'buff', detalle: 'Protegido por el Escudo humano: la mitad de su daño se la lleva el creep, 2 turnos.'}]}});
  // 🛡 Interponerse ✦ (F31; dueño: «está bien, hagámoslo así»): el botón ✨ del GM cuando atacan a un aliado (vtt-hexgrid/js/78).
  H('Interponerse', 'TM', 'hdc', 't', 3, {detalle: 'FLASH (en el turno de otro: cuesta el doble). Cuando atacan a un aliado a 2 casillas o menos, antes de que el aliado elija cómo defenderse, salta a su lado (gratis: sin No2 ni ataques de oportunidad) y el golpe va contra él, con +2 a la Defensa contra ese golpe. Se usa con el botón ✨ del GM, que aparece cuando hay un aliado atacado a su alcance.',
    no2: 0, spCosto: 2, flash: true, auditada: true, interponerse: {distancia: 2}, ataqueTxt: 'Flash: salta al lado de un aliado atacado (a 2 o menos) y se come el golpe, con +2 a la Defensa'});
  // ⚖ Golpe de escudo (D22 Derribar; dueño: «como si el escudo fuera un arma contundente… y si pasa, hace el efecto»): pega con el escudo (comun/creep-acciones.js
  // ataqueDeHab, comun/creep-duelo.js formulaDano); Sentado y Demora 1 si el golpe hizo daño.
  H('Golpe de escudo', 'DK', 'hdc', 'mt', 2, aA('Pega con el escudo como si fuera un arma contundente (necesita un escudo puesto): su Probabilidad de Golpe (la Destreza) contra la Evasión del rival, sin Parry. Si pega: 1d10 + el peso del escudo + su Dmg contra la Defensa del rival; lo que pasa es daño y, si pasó algo, el rival queda Sentado y con Demora 1 (baja un lugar en el orden de turnos).',
    {}, 'pega con el escudo: PdG contra la Evasión; 1d10 + el peso del escudo + su Dmg; si hace daño, Sentado y Demora 1', 2,
    [{nombre: 'Sentado', requiereDano: true, detalle: 'Si el golpe hizo daño: queda Sentado.'}, {nombre: 'Demora', stacks: 1, requiereDano: true, detalle: 'Si el golpe hizo daño: baja 1 lugar en el orden de turnos.'}], {escudoGolpe: true}));
  // ⚖ Carga que derriba (la Carga, un escalón arriba; dueño: «va así»): la carrera de hasta 4 (vtt-hexgrid/js/55) y el derribo desde 3 (js/78).
  H('Carga que derriba', 'DKM', 'hd', 'mt', 2, aA('Toma carrera y se le tira encima: corre hasta 4 casillas en línea recta hasta quedar pegado (paga los No2 del movimiento) y ataca con su arma con +1 a la Probabilidad de Golpe y +1 al daño por cada casilla que corrió. Si pega y corrió 3 o más, tira su Fuerza + las casillas contra la Resistencia al control del rival: si gana, el rival queda Sentado.',
    {}, 'corre hasta 4 en línea recta (sus No2) y ataca con +X PdG y +X al daño (X = casillas); desde 3, Fuerza + X contra la Res.CC: Sentado', 2, [], {embestida: true, cargaDerriba: 4}));
  // ⚖ Sonic Boom (de clase, un escalón arriba; dueño: «ok»): el cono de la clase con Fuerza +2 y la diferencia de daño (directo).
  H('Sonic Boom', 'DAK', '*', 'mt', 3, {detalle: 'FLASH (en turno ajeno cuesta el doble). Golpea el piso y una onda de choque sale en cono al frente: su Fuerza + 2 contra la Constitución de cada rival del cono. Al que pierde le saca 1 + la diferencia en No2 y le hace la diferencia de daño (físico, directo); si se queda sin No2, queda Sentado.',
    no2: 1, spCosto: 3, flash: true, auditada: true, ataqueTxt: 'Flash: cono al frente; Fuerza +2 contra la Constitución; pierde 1 + la diferencia en No2, la diferencia de daño directo y, en 0 No2, Sentado',
    duelo: {objetivo: 'cono', tira: 'fue', tiraBono: 2, contra: ['con'], dano: true, danoDiferencia: true, tipoDano: 'fisico', ignoraDano: true, danoDirecto: true, efectos: [{no2: 1, no2Dif: true, no2Sentado: true}]}});
  // ⚖ Arrastrar (C16; dueño: «va así»): un ataque con su arma a 3 o menos; si pega, lo trae (vtt-hexgrid/js/78). (El enganche y el golpe van en una sola
  // tirada: su Probabilidad de Golpe +2 contra la Evasión o el Parry.)
  H('Arrastrar', 'DK', 'hdc', 'mt', 2, aA('Le tira un gancho, una cadena o una soga a un rival a 3 casillas o menos: un ataque con su arma con +2 a la Probabilidad de Golpe. Si pega, lo arrastra hasta dejarlo pegado a él (no camina: no gasta No2 ni da ataques de oportunidad; las trampas del camino sí lo tocan) y le hace el daño del golpe.',
    {pdg: 2}, 'un ataque a 3 casillas o menos con +2 PdG; si pega, lo trae hasta quedar pegado (las trampas del camino lo tocan)', 2, [], {alcance: 'fijo', alcanceN: 3, arrastra: 3}));
  // (Golpe de pomo: quitado de la biblioteca en la auditoría, dueño 2026-10-21.)
  H('Ataque de furia', 'D', '*', 'm', 5, zO('Ataca sin pensar en la defensa: daño enorme.', 4, 'H'));
  // (Tackle, el viejo a mano: lo reemplaza el Takle, 2026-10-26.)
  // 🩸 Las cuatro variantes del Sangrado (dueño, 2026-10-21: «un golpe simple que solamente añade sangrado; uno que añade perfora y sangrado; uno que
  // añade daño y sangrado; uno que añade crítico frecuente y sangrado»), cada una en versión de humanoide y de bestia («hacé todas»).
  H('Zarpazo desgarrador', 'DX', 'b', 'me', 2, aA('Garras que abren la carne: un ataque con su arma; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {}, 'va al duelo como un ataque; si pega, Sangrado', 1, SG));
  H('Colmillos que perforan', 'DX', 'b', 'me', 3, aA('Colmillos que se hunden hondo: un ataque con su arma con Perfora 1 (1 punto del daño pasa siempre la Defensa); si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {perfora: 1}, 'va al duelo como un ataque con Perfora 1 (1 punto del daño pasa siempre la Defensa); si pega, Sangrado', 2, SG));
  // 🩸 Auditada (dueño, 2026-10-21; choque liviano, «abrir la herida»: «si no está sangrando, provoca sangrado; y si está sangrando, hace más daño y
  // amplifica el sangrado»): si ya sangra, +2 dados; si pega, Sangrado (si ya sangraba, +1 al daño por turno). Lo de un ataque y 2 SP, o cooldown 3.
  // El bono lo mira el mapa al elegir el objetivo (js/64).
  [['Sal en la herida', 'hd', 'Va directo a donde duele'], ['Morder la herida', 'b', 'Huele la sangre y muerde ahí']].forEach(([nombre, razas, como]) =>
    H(nombre, 'DX', razas, 'me', 3, aA(`${como}: un ataque con su arma. Si el objetivo no sangra, si pega lo hace sangrar (Sangrado: 2 de daño por turno durante 2 turnos; con un golpe crítico, queda permanente). Si ya sangra, suma +2 dados del Tipo de su arma y, si pega, el sangrado sube (+1 al daño por turno).`,
      {}, 'va al duelo como un ataque (+2 dados si el objetivo ya sangra); si pega, Sangrado (o le sube el que tenía)', 2, SG, {abrirHerida: true})));
  // 👊 Auditada (dueño, 2026-10-21; choque liviano, «manada»): +1 dado del Tipo de su arma por cada aliado suyo pegado al objetivo, hasta +3. Lo de un
  // ataque y 2 SP, o cooldown 3. Los aliados los cuenta el mapa al elegir el objetivo (js/65).
  [['Patotear', 'hd', 'Todos contra uno'], ['Jauría', 'b', 'Cazan en jauría']].forEach(([nombre, razas, como]) =>
    H(nombre, 'D', razas, 'me', 3, aA(`${como}: un ataque con su arma que suma +1 dado del Tipo de su arma por cada aliado suyo que también esté pegado al objetivo (hasta +3). Él no se cuenta; tampoco un aliado caído o bajo tierra. Sin aliados al lado, va como un ataque común.`,
      {}, 'va al duelo como un ataque: +1 dado por cada aliado pegado al objetivo (hasta +3)', 2, [], {manada: 3})));
  H('Desgarro', 'DX', 'b', 'me', 3, aA('Arranca un pedazo de carne: un ataque con su arma con +2 al daño; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; si pega, Sangrado', 2, SG));
  H('Zarpa certera', 'DX', 'b', 'me', 3, aA('Un zarpazo directo a la yugular: un ataque con su arma con Crítico frecuente +1; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {critBono: 1}, 'va al duelo como un ataque con Crítico frecuente +1; si pega, Sangrado', 2, SG));
  // 🩸 La versión fuerte (dueño, 2026-10-21: «una versión fuerte, que salga más cara… con el sangrado como eje identitario, 4 SP»; elegida la B).
  H('Destripar', 'DX', 'b', 'me', 4, aA('Garras y dientes que destripan: un ataque con su arma con Perfora 1 (1 punto del daño pasa siempre la Defensa) y Crítico frecuente +1; si pega, deja un Sangrado fuerte (3 de daño por turno durante 3 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {perfora: 1, critBono: 1}, 'va al duelo como un ataque con Perfora 1 y Crítico frecuente +1; si pega, Sangrado fuerte (3 por turno, 3 turnos)', 4, SGF));
  H('Golpe de gracia', 'D', '*', 'm', 6, zO('El golpe más fuerte que sabe dar; nadie sigue igual después.', 4, 'H'));
  // 🗡 Auditadas (dueño, 2026-10-21; choque liviano, «ráfaga de cortes», la opción del golpe que vale por tres): +2 dados, los efectos del arma ×3 y la Perfora en cada corte.
  H('Ráfaga de cortes', 'D', 'hd', 'me', 3, aA('Tres cortes seguidos en un solo ataque con su arma: si pega, suma +2 dados de su arma (los otros dos cortes; la Defensa se resta una sola vez). Los efectos al golpear de su arma se tiran tres veces, uno por corte, y su Perfora vale en cada corte (con Perfora 1, pasan al menos 3).',
    {dados: 2}, 'un ataque con su arma con +2 dados; los efectos del arma ×3 y la Perfora en cada corte', 3, [], {rafaga: 3}));
  H('Ráfaga de zarpazos', 'D', 'b', 'me', 3, aA('Tres zarpazos seguidos en un solo ataque con su arma: si pega, suma +2 dados de su arma (los otros dos zarpazos; la Defensa se resta una sola vez). Los efectos al golpear de su arma se tiran tres veces, uno por zarpazo, y su Perfora vale en cada corte (con Perfora 1, pasan al menos 3).',
    {dados: 2}, 'un ataque con su arma con +2 dados; los efectos del arma ×3 y la Perfora en cada corte', 3, [], {rafaga: 3}));
  H('Ráfaga de golpes', 'D', 'hd', 'me', 3, zO('Una lluvia de golpes rápidos (tirá el daño dos veces, a mano la segunda).', 3, 'L'));
  // 🪓 Auditada (dueño, 2026-10-21; choque pesado, «golpe que se anuncia»; antes «Golpe cargado»: «Junta fuerzas todo un turno y descarga un golpe
  // brutal»): un turno lo carga a la vista de todos (a quién apunta), al siguiente lo descarga; si el objetivo pegado se aleja, sale de oportunidad.
  [['El que avisa no traiciona', 'hd', 'Levanta el arma bien alto mirando a un rival', 'levanta el arma'], ['Zarpazo erguido', 'b', 'Se para en dos patas mirando a un rival, con la garra en alto', 'se para en dos patas']].forEach(([nombre, razas, como, verbo]) =>
    H(nombre, 'DK', razas, 'mt', 3, {detalle: `${como}: este turno no ataca (es su ataque del turno) y queda Golpe anunciado; la Mesa y la Crónica dicen a quién apunta. En su próximo turno (puede caminar antes) descarga un ataque con su arma con +3 dados del Tipo de su arma, que no se puede parrear (solo esquivar) y, si pega, lo empuja 2 casillas; cuesta los No2 de un ataque y 3 SP más (en modo cooldown, +3 turnos de cooldown). Si su objetivo está pegado y se aleja, se lo come de oportunidad: los No2 de una oportunidad y los 3 SP. Si mientras lo carga le entran 10 de daño o más (sumando los golpes), se le cae; si no ataca en su turno, se pierde.`,
      no2: 1, spCosto: 1, auditada: true, cuentaComoAtaque: true, efecto: {nombre: 'Golpe anunciado'},
      golpeAnunciado: {verbo, spGolpe: 3, detalleGolpe: 'El golpe anunciado: +3 dados del Tipo de su arma, no se puede parrear y, si pega, empuja 2 casillas.',
        duelo: {modo: 'arma', objetivo: 'enemigo', x: 'nitros', arma: {pdg: 0, dados: 3, fijo: 0, sinParry: true}, efectos: [{nombre: 'Empujón', empuja: 2, detalle: 'Lo empuja 2 casillas, lejos de quien pega.'}]}}}));
  H('Aplastar', 'D', 'c', 'mt', 3, zO('Aplasta con un brazo de piedra o metal.', 3, 'M'));
  // Auditada (dueño, 2026-10-21: «que sume daño y demora», «+2 al daño»): +2 al daño y, si pega, Demora (baja 1 lugar en el orden de turnos).
  H('Puño de roca', 'D', 'ce', 'mt', 2, aA('Un puñetazo que rompe huesos: un ataque con su arma con +2 al daño; si pega, el golpe lo atonta y queda con Demora (baja 1 lugar en el orden de turnos).',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; si pega, Demora (baja 1 lugar en el orden de turnos)', 2,
    [{nombre: 'Demora', detalle: 'Baja 1 lugar en el orden de turnos.'}]));

  /* ================= DAÑO A DISTANCIA / MÁGICO ================= */
  H('Disparo certero', 'D', 'hd', 'r', 2, aT('Un tiro apuntado con calma.', 'M'));
  H('Tiro rápido', 'D', 'hd', 'r', 2, aT('Dispara sin apuntar demasiado.', 'L'));
  H('Lluvia de flechas', 'DA', 'hd', 'r', 4, zO('Dispara al cielo y las flechas caen en flor de diámetro 3 (7 casillas) (a mano).', 3, 'M'));
  // 🎯 Auditada (dueño, 2026-10-21; rango, «tiro apuntado»): un turno apunta (es su ataque del turno) y el próximo disparo va mejor; si le hacen daño, lo pierde.
  // 🎯 Auditada (dueño, 2026-10-21; rango, «señalar para todos»): un disparo que, si pega, deja al objetivo Presa (Evasión −1 y +2 al daño de todos sus
  // rivales; dueño: «menos uno la evasión en vez de más uno la probabilidad de golpe») y Marcado, 2 turnos.
  H('Disparo señalador', 'DX', 'hd', 'r', 3, aA('Un disparo con su arma que señala a la presa: si pega, además del daño, el objetivo queda Presa 2 turnos (su Evasión baja 1 y todo el que lo ataca le hace +2 de daño) y Marcado (no se puede esconder y se lo ve aunque haya niebla).',
    {}, 'un ataque con su arma; si pega, Presa (Evasión −1, +2 al daño de todos) y Marcado 2 turnos', 2,
    [{nombre: 'Presa', turnos: 2}, {nombre: 'Marcado', turnos: 2}]));
  H('Tiro a la cabeza', 'B', 'hd', 'r', 3, {detalle: 'Apunta con calma: este turno no dispara (es su ataque del turno) y queda Apuntando a la cabeza. Su próximo disparo con un arma a distancia, en este turno o más adelante, suma +2 a la Probabilidad de Golpe, Crítico frecuente +1 y Crítico potente +1; se gasta al disparar. Si antes le hacen daño (que le llegue a la vida), pierde la puntería.',
    no2: 1, spCosto: 2, auditada: true, cuentaComoAtaque: true, efecto: {nombre: 'Apuntando a la cabeza'}, anuncio: '{nombre} apunta con calma…'});
  // (El Escupitajo ácido pasó a ser la versión bestia de Corroer, 2026-10-25: más abajo, junto a ella.)
  H('Proyectil', 'D', '*', 'r', 2, aT('Lanza lo que tenga a mano.', 'L'));
  H('Lanzar piedra', 'D', 'bcd', 'r', 2, aT('Arroja una roca enorme.', 'M'));
  H('Chispa', 'D', 'eag', 'rg', 2, aT('Una chispa de energía pura.', 'L'));
  // 🔥 Auditada (dueño, 2026-10-21; el Mago): 2d6 + ¼ de su Efecto especial de fuego en flor de diámetro 3, Quemadura; cuesta tanto SP como su Especial
  // (uno sí, uno no: P216) o cooldown 2, y 4 No2. Simulada: con ¼ del Ef.Esp, ~8 por objetivo contra equipo común (½ era demasiado).
  H('Bola de fuego', 'DA', 'ega', 'g', 2, {detalle: 'Una explosión de fuego en flor de diámetro 3 (7 casillas), con el centro dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión de cada uno (quien gana tiene dodge roll para salir del área). Daño: 2d6 más un cuarto de su Efecto especial, de fuego (lo frenan la Defensa especial y la resistencia al fuego), y deja Quemadura.',
    no2: 4, spCosto: 'esp', auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión de cada uno en el área; 2d6 + ¼ de su Ef.Esp de fuego y Quemadura',
    duelo: {objetivo: 'area', tira: 'pdgmg', contra: ['eva'], radio: 1, centroAlcance: 'rango', dano: true, danoFormula: '2d6', danoSumaEsp: 0.25, tipoDano: 'fuego',
      efectos: [{nombre: 'Quemadura'}]}});
  H('Rayo', 'D', 'ega', 'g', 3, zO('Un rayo que atraviesa la armadura.', 3, 'M'));
  // ⚡ Auditada (dueño, 2026-10-21; el Mago): un rayo dirigido que salta (la regla general del rayo: la mitad de lo que entró, sin repetir, hasta llegar a 1)
  // y 20 % de Parálisis al primero; 2d4 sin el Efecto especial (P216 en pausa). 3 No2 y 3 SP, o cooldown 3.
  H('Cadena de rayos', 'D', 'ega', 'g', 3, {detalle: 'Lanza un rayo a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo. Si pega: 2d4 de daño eléctrico (lo frenan la Defensa especial y la resistencia eléctrica) y 20 % de Parálisis 1 turno. Lo que le entró salta al rival más cercano (4 casillas o menos) con la mitad, sin repetir, hasta llegar a 1; en un charco, corre por el agua.',
    no2: 3, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; 2d4 eléctrico que salta (la mitad cada vez) y 20 % de Parálisis',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d4', tipoDano: 'eléctrico', cadena: {saltos: 99, rango: 4},
      efectos: [{nombre: 'Parálisis', turnos: 1, caras: 10, exitos: 2}]}});
  // ⚡ Auditada (dueño, 2026-10-25; el Mago, «rayo paralizante»: «uno que se llame Zap. Un dado de 4 de daño directo eléctrico con salto. El primero
  // parálisis seguro. Si hay un segundo salto, 50 % de parálisis. Si hay un tercer salto, 25 %»): el salto de siempre (la mitad de lo que entró: 4 → 2 → 1),
  // `cadena.paralisis` = el % de cada salto (js/13 dueloCadena). No se esquiva (dueño, el mismo día): el daño entra
  // siempre y su PdG.Esp contra la Res.Esp decide solo la Parálisis (`danoSiempre`, comun/duelo.js). El costo lo propuso Claude.
  H('Zap', 'DK', 'ega', 'g', 3, {detalle: 'Un chispazo a un rival dentro de su Rango que no se esquiva: 1d4 de daño eléctrico directo (no lo frenan la Defensa ni la Defensa especial; sí la resistencia eléctrica) y Parálisis 1 turno, salvo que el objetivo la resista: su Resistencia especial contra la Probabilidad de Golpe especial del que lo lanza. Lo que le entró salta al rival más cercano (4 casillas o menos) con la mitad, sin repetir, hasta llegar a 1: al primero que alcanza, 50 % de Parálisis; al segundo, 25 %. En el agua, el doble de chance.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'no se esquiva: 1d4 eléctrico directo; Parálisis si gana su PdG.Esp contra la Res.Esp; salta (la mitad) con 50 % y 25 % de Parálisis',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], danoSiempre: true, alcance: 'rango', dano: true, danoFormula: '1d4', danoDirecto: true, tipoDano: 'eléctrico', cadena: {saltos: 99, rango: 4, paralisis: [50, 25]},
      efectos: [{nombre: 'Parálisis', turnos: 1}]}});
  // ❄ Auditada (dueño, 2026-10-23; el Mago, «un cono de frío… hálito polar»): reemplaza al viejo Aliento gélido (a mano). El cono de 16 casillas de
  // siempre (el de Sonic Boom). Con dodge roll (dueño, 2026-10-24: «tirar solo Evasión no tiene sentido; sí o sí con dodge roll: cómo se esquiva un aliento,
  // hay que salir de la superficie»): quien gana la Evasión gana el derecho a salir del cono moviéndose; si sigue adentro, le pega. Pega menos que la Bola de fuego: 2d4 de hielo + ¼ de su Efecto especial
  // (dueño, 2026-10-24: «con Ef») y Escarcha (−1 a los No2 máximos, 2 turnos). Suma el Ef.Esp → cuesta su Especial en SP (P216), o cooldown 3; 3 No2.
  H('Hálito polar', 'DA', 'ega', 'g', 3, {detalle: 'Exhala un aliento helado en cono al frente (16 casillas): tira su Probabilidad de Golpe especial una vez contra la Evasión de cada rival del cono; quien le gana tiene un dodge roll: si sale del cono moviéndose, se salva; si sigue adentro, le pega igual. Al que no le gana (o no sale): 2d4 más un cuarto de su Efecto especial, de hielo (lo frenan la Defensa especial y la resistencia al hielo) y Escarcha (−1 a sus No2 máximos, 2 turnos).',
    no2: 3, spCosto: 'esp', auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión de cada rival del cono; 2d4 + ¼ de su Ef.Esp de hielo y Escarcha',
    duelo: {objetivo: 'cono', ondaDodge: true, tira: 'pdgmg', contra: ['eva'], dano: true, danoFormula: '2d4', danoSumaEsp: 0.25, tipoDano: 'hielo', efectos: [{nombre: 'Escarcha'}]}});
  // ✨ Auditada (dueño, 2026-10-25; el Mago, «daño concentrado», Andanada arcana: «sale» a la propuesta de Claude): los misiles de la Varita de misiles
  // (`reparte`: de a uno, cada uno con su duelo; el próximo, a quien elija), 3 de 1d6 arcano + ¼ de su Ef.Esp cada uno. Suma el Ef.Esp → su Especial
  // en SP (P216), 3 No2, o cooldown 3.
  H('Andanada arcana', 'D', 'ega', 'g', 3, {detalle: 'Tres misiles arcanos, de a uno, a rivales dentro de su Rango: cada uno tira su Probabilidad de Golpe especial contra la Evasión del objetivo y, si pega, hace 1d6 más un cuarto de su Efecto especial de daño arcano (lo frena la Defensa especial). Cuando termina un misil, elige a quién va el siguiente (puede ser el mismo).',
    no2: 3, spCosto: 'esp', auditada: true, ataqueTxt: '3 misiles, de a uno: su PdG.Esp contra la Evasión de cada objetivo; 1d6 + ¼ de su Ef.Esp arcano cada uno',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '3d6', danoSumaEsp: 0.25, tipoDano: 'arcano', reparte: {cada: '1d6', total: 3}, efectos: []}});
  // 🌨 Auditada (dueño, 2026-10-25; el Mago, «una lluvia de escarcha que haga daño de hielo y que deje el piso congelado durante 2 turnos y después deje el
  // charco por tiempo indeterminado»; comparada con la Varita de la ventisca, que el mismo día pasó a 2d4): el área de la Bola de fuego, de diámetro 5
  // (radio 2), con el suelo congelado de la varita (`zonaQueda` con `superficie: 'hielo'`, vtt-hexgrid/js/50: al irse queda el charco, que no vence).
  // Suma el Ef.Esp → su Especial en SP (P216), 4 No2 como la Bola de fuego, o cooldown 3 (dueño: «sí» a la propuesta completa de Claude).
  H('Lluvia de escarcha', 'DA', 'ega', 'g', 3, {detalle: 'Una lluvia de escarcha en un área de diámetro 5 (19 casillas), con el centro dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión de cada uno (quien gana tiene dodge roll para salir del área; también a sus aliados). Daño: 2d4 más un cuarto de su Efecto especial, de hielo (lo frenan la Defensa especial y la resistencia al hielo). El suelo queda congelado 2 turnos: quien está parado cuando aparece, y después por cada paso que da sobre el hielo, tira Agilidad contra su Efecto especial o resbala y queda Sentado. Al derretirse queda un charco de agua que no se va (el rayo pega más y paraliza más fácil a quien está parado ahí; el fuego lo seca).',
    no2: 4, spCosto: 'esp', auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión de cada uno en un área de diámetro 5; 2d4 + ¼ de su Ef.Esp de hielo; suelo congelado 2 turnos y después charco',
    duelo: {objetivo: 'area', tira: 'pdgmg', contra: ['eva'], radio: 2, centroAlcance: 'rango', dano: true, danoFormula: '2d4', danoSumaEsp: 0.25, tipoDano: 'hielo',
      zonaQueda: {turnos: 2, nombre: 'suelo congelado', estado: {nombre: 'Sentado', tiraPaso: true, superficie: 'hielo'}, contra: 'agl', tira: 'dmgesp', color: '#9FD3E8', altura: 'piso', enMantenimiento: false, inmediata: true},
      efectos: []}});
  // 🌩 Auditada (dueño, 2026-10-26; Mago, la Tormenta arcana de clase para creeps, el 19 del rol: «el costo en SP y No2 que sea igual que el original, el
  // efecto mejorado está bien»): un área de diámetro 5 con el centro en su Rango; 1d20 proyectiles de 1d4+1 (la de clase, 1d4) al azar entre todos los de
  // adentro, aliados incluidos; solo el dodge roll (js/44). 5 No2 y 15 SP, como el original; cooldown 4 (de Claude).
  H('Tormenta arcana', 'DA', 'ega', 'g', 4, {detalle: 'Marca el centro de un área de diámetro 5 (19 casillas) dentro de su Rango y cae una lluvia de 1d20 proyectiles arcanos: cada uno cae al azar sobre alguien que esté adentro, rivales y aliados (él no). No hay tirada: cada uno puede salir del área con un dodge roll; quien sigue adentro recibe 1d4+1 por cada proyectil que le tocó, directo a la vida (ni Defensa ni Defensa especial).',
    no2: 5, spCosto: 15, auditada: true, ataqueTxt: '1d20 proyectiles de 1d4+1 arcano directo, al azar entre los de un área de diámetro 5 (aliados incluidos); solo el dodge roll',
    duelo: {objetivo: 'area', radio: 2, alcance: 'rango', fuegoAmigo: true, tormenta: {proyectiles: '1d20', cada: '1d4+1'}, tira: '', contra: [], dano: true, danoFormula: '1d4+1', tipoDano: 'arcano', ignoraDano: true, danoDirecto: true, efectos: []}});
  // 🪨 Auditada (dueño, 2026-10-26; Mago, «proyectil de piedra», el 20 del rol: «el siguiente cascotazo. 2d6 + ef esp, como daño físico. Tira PdG vs Eva.
  // Demora 2»): un cascote a un rival en su Rango; su PdG contra la Evasión; 2d6 + su Ef.Esp físico (lo frena la Defensa), critica como un arma de Tipo 10
  // (de la propuesta), y Demora 2 (baja 2 lugares en el orden de turnos: js/13 dueloDemora). Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  H('Cascotazo', 'DK', 'ega', 'g', 3, {detalle: 'Le tira un cascote a un rival dentro de su Rango: tira su Probabilidad de Golpe contra la Evasión. Si pega: 2d6 más su Efecto especial de daño físico (lo frena la Defensa), con crítico como un arma de Tipo 10, y Demora 2: baja 2 lugares en el orden de turnos.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG contra la Evasión; 2d6 + su Ef.Esp físico (critica como Tipo 10) y Demora 2',
    duelo: {objetivo: 'enemigo', alcance: 'rango', tira: 'pdg', contra: ['eva'], dano: true, danoFormula: '2d6', danoSumaEsp: true, tipoDano: 'fisico', ignoraDano: false, critTipo: 10,
      efectos: [{nombre: 'Demora', stacks: 2, detalle: 'Baja 2 lugares en el orden de turnos.'}]}});
  // ☄ Auditada (dueño, 2026-10-24; el Mago, «área anunciada»: «se esquiva con dodge roll; se anuncia como una sombra, viene del cielo»; ajuste del mismo día:
  // «cooldown 3, pero que empiece activado el cooldown, tipo lento; 4d6 físicos, 2d6 de fuego directo; de nombre, Meteoro»): marca un área (diámetro 5)
  // dentro de su Rango —una sombra que todos ven— y al empezar su próximo turno cae: a todos los que sigan adentro (aliados incluidos, menos él), un dodge
  // roll sin tirada previa (como la Tormenta arcana); quien no sale recibe 4d6 físicos (los frena la Defensa) y 2d6 de fuego (directo, menos la resistencia
  // al fuego). Si el mago cae antes, la sombra se disipa. Lo hace el mapa (vtt-hexgrid/js/74). Es su ataque del turno. 2 No2 y 5 SP (propuesta de Claude).
  H('Meteoro', 'DA', 'ega', 'g', 3, {detalle: 'Señala un punto dentro de su Rango: una sombra (diámetro 5) cubre el suelo a la vista de todos y algo cae del cielo. Al empezar su próximo turno, el meteoro cae: todos los que sigan adentro (también sus aliados) tienen un dodge roll para salir; quien sigue adentro recibe 4d6 de daño físico (lo frena la Defensa) y 2d6 de fuego (directo, menos la resistencia al fuego). Es su ataque del turno. Si él cae antes, la sombra se disipa.',
    no2: 2, spCosto: 5, arrancaEnCooldown: true, auditada: true, cuentaComoAtaque: true, ataqueTxt: 'una sombra en su Rango; en su próximo turno cae: dodge roll, 4d6 físico + 2d6 de fuego directo',
    meteoro: {radio: 2, fisico: '4d6', fuego: '2d6'}});
  // ✨ Auditada (dueño, 2026-10-25; el Mago, «Lanza de luz»: una línea que atraviesa a todos, «y que además deje un estado de −2 a la resistencia especial»,
  // 2 turnos; «el largo tiene que ser todo el largo del rango»): una línea recta tan larga como su Rango, desde él hacia donde apunte (la de la Varita láser: le pega a todos los de la línea, también a sus aliados);
  // tira su PdG.Esp una sola vez y cada uno se defiende con su Evasión; al que no esquiva, 3d6 arcano (lo frena la Defensa especial) y Deslumbrado 2 turnos
  // (Res.Esp −2). 2 No2 y 4 SP, o cooldown 3 (costo y daño propuestos por Claude).
  H('Lanza de luz', 'DA', '*', 'g', 3, {detalle: 'Dispara una lanza de luz en línea recta, tan larga como su Rango, desde él hacia donde apunte, y atraviesa a todos los que estén en la línea (también a sus aliados). Tira su Probabilidad de Golpe especial una sola vez y cada uno se defiende con su Evasión; al que no la esquiva le hace 3d6 de daño arcano (lo frena la Defensa especial) y lo deja Deslumbrado 2 turnos: su Resistencia especial baja 2.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'una línea tan larga como su Rango: su PdG.Esp contra la Evasión de cada uno; 3d6 arcano y Deslumbrado (Res.Esp −2) 2 turnos',
    duelo: {objetivo: 'linea', largo: 'rango', tira: 'pdgmg', contra: ['eva'], dano: true, danoFormula: '3d6', tipoDano: 'arcano', efectos: [{nombre: 'Deslumbrado'}]}});
  // 🎆 Auditadas (dueño, 2026-10-25; el Mago, «un misil elemental, uno por cada uno de los tipos de daño, que sea un ataque mágico súper claro, que esté
  // atado a la identidad de cada uno de los elementos y que se sienta»; «un skill por cada elemento y un skill que sea misil elemental que te deje elegir
  // pero que cueste un nitro más y 2 SP más»; los nombres distintos, «el eléctrico, Centella»; y después: Lengua de fuego, Dardo helado y Mancha corrosiva). La base, de Claude: un misil a un
  // rival en su Rango, su PdG.Esp contra la Evasión, 2d6 + ¼ de su Ef.Esp del elemento; 2 No2 y su Especial en SP (P216), o cooldown 2.
  // El Misil arcano reemplaza al viejo (a mano).
  // 🌀 Auditada (dueño, 2026-10-25; el Mago, control, de las varitas: «vamos con el portal, pero sin daño; que al llegar queden con algún estado»;
  // «Expuesto está bien»): la trampa de la Varita de la trampa portal (oculta, 1 casilla; el GM marca la que lo dispara y adónde lleva, a 4 o menos:
  // vtt-hexgrid/js/13 trampaDeHabilidad), Res.Esp contra su Ef.Esp para aferrarse; si no, viaja y llega Expuesto (hasta su próximo turno). Se detecta con
  // Percepción contra su Ef.Esp. Costo propuesto por Claude: 2 No2 y 3 SP, o cooldown 3.
  // 🐛 Auditada (dueño, 2026-10-26; el Mago, de las varitas: «la sanguijuela funciona así»; corregido el mismo día: «la probabilidad de golpe especial
  // contra la evasión»): tira su Probabilidad de Golpe especial contra la Evasión para
  // lanzarle una sanguijuela al cuerpo; si pega, 2d6 de daño siniestro (la identidad: Herida sombría) y se cura la mitad de lo que entró (`drena`, como la
  // Varita sanguijuela); queda la Sanguijuela pegada 4 turnos (no se cura mientras esté) y se la arranca al empezar su turno con Fuerza contra el Ef.Esp
  // del mago (el `soltar` de la Red). Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  // (Pasó del Mago al Debuffer el mismo día, dueño: «movemos la sanguijuela al debuffer».)
  H('Sanguijuela', 'DX', 'hdega', 'x', 3, {detalle: 'Le lanza una sanguijuela al cuerpo a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo. Si pega, le hace 2d6 de daño siniestro (lo frena la Defensa especial y la Res. siniestro) y el mago se cura la mitad de lo que entró. La sanguijuela queda pegada 4 turnos: mientras esté, el objetivo no se cura con nada. Al empezar su turno puede arrancársela, gratis, con Fuerza contra el Efecto especial del mago.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; 2d6 siniestro, se cura la mitad y queda la Sanguijuela pegada (no se cura; Fuerza para arrancarla)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d6', tipoDano: 'siniestro', drena: true, drenaPct: 50,
      efectos: [{nombre: 'Sanguijuela', turnos: 4, soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'dmgesp', alEmpezar: true}}]}});
  // 🌬 Auditada (dueño, 2026-10-26; el Mago, «control elemental», Ráfaga de viento: «la siguiente va a ser la ráfaga de viento, pero que empuje por lo menos
  // tres»): el cono al frente (el del Hálito polar), su PdG.Esp contra la Evasión de cada rival; al que no esquiva, 1d6 arcano (poco: es control), lo empuja
  // 3 (el Empujón, con su choque) y queda Sentado. Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  H('Ráfaga de viento', 'DK', 'ega', 'g', 3, {detalle: 'Suelta una ráfaga de viento en cono al frente (16 casillas): tira su Probabilidad de Golpe especial contra la Evasión de cada rival del cono. Al que no la esquiva, 1d6 de daño arcano (lo frena la Defensa especial), lo empuja 3 casillas lejos del mago (si choca contra algo, el daño de colisión de siempre) y queda Sentado (levantarse le cuesta No2). No afecta a sus aliados.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'cono al frente: su PdG.Esp contra la Evasión de cada rival; 1d6 arcano, lo empuja 3 y queda Sentado',
    duelo: {objetivo: 'cono', tira: 'pdgmg', contra: ['eva'], dano: true, danoFormula: '1d6', tipoDano: 'arcano',
      efectos: [{nombre: 'Empujón', empuja: 3, detalle: 'Lo empuja 3 casillas, lejos del mago.'}, {nombre: 'Sentado'}]}});
  // 💥 Auditada (dueño, 2026-10-26; el Mago, «áreas y terreno», Nova arcana: «vamos con la nova, como ya decimos»): la onda alrededor (la del Barrido) con
  // su PdG.Esp contra la Evasión de cada rival pegado; al que no esquiva, 2d6 arcano y lo empuja 2 (el Empujón, con su choque). Costo de Claude: 2 No2 y
  // 3 SP, o cooldown 3.
  H('Nova arcana', 'DK', 'ega', 'g', 3, {detalle: 'Estalla en energía arcana alrededor suyo: tira su Probabilidad de Golpe especial contra la Evasión de cada rival de las 6 casillas de al lado. Al que no lo esquiva, 2d6 de daño arcano (lo frena la Defensa especial) y lo empuja 2 casillas lejos del mago (si choca contra algo, el daño de colisión de siempre). No afecta a sus aliados.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'onda alrededor: su PdG.Esp contra la Evasión de cada rival pegado; 2d6 arcano y lo empuja 2',
    duelo: {objetivo: 'onda', radio: 1, tira: 'pdgmg', contra: ['eva'], dano: true, danoFormula: '2d6', tipoDano: 'arcano',
      efectos: [{nombre: 'Empujón', empuja: 2, detalle: 'Lo empuja 2 casillas, lejos del mago.'}]}});
  // ✨ Auditada (dueño, 2026-10-26; el Mago, «el cuerpo del mago», Parpadeo: «vamos con el parpadeo»): Flash (el botón ✨ del GM; en turno ajeno, el doble):
  // se teletransporta hasta 3 casillas, a una libre, sin ataques de oportunidad (blinkDeHabilidad, vtt-hexgrid/js/13). Costo de Claude: 2 SP, o cooldown 2.
  H('Parpadeo', 'B', 'hdega', 'g', 2, {detalle: 'FLASH (se puede usar en cualquier momento; en turno ajeno cuesta el doble). Se teletransporta hasta 3 casillas, a una casilla libre, sin dar ataques de oportunidad: el mago que se zafa cuando lo acorralan.',
    no2: 0, spCosto: 2, flash: true, auditada: true, ataqueTxt: 'Flash: se teletransporta hasta 3 casillas, sin ataques de oportunidad', blink: {distancia: 3, soloYo: true}});
  // 🧊 Auditada (dueño, 2026-10-26; el Mago, «control elemental»: «la próxima ronda hacemos la prisión de hielo»): su PdG.Esp contra la Evasión de un rival
  // en su Rango; si pega, 2d4 de hielo e Inmovilizado (encerrado en hielo) hasta 2 turnos, que se suelta al empezar su turno con Fuerza contra el Ef.Esp
  // del mago (el `soltar` de la Red, con la ayuda de un aliado pegado). Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  H('Prisión de hielo', 'DK', 'ega', 'g', 3, {detalle: 'Encierra a un rival en hielo, dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo. Si pega, 2d4 de daño de hielo (lo frenan la Defensa especial y la Res. hielo) y queda Inmovilizado, encerrado en hielo, hasta 2 turnos. Al empezar su turno puede romperlo, gratis, con Fuerza contra el Efecto especial del mago; un aliado pegado puede ayudarlo.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; 2d4 de hielo e Inmovilizado hasta 2 turnos (Fuerza contra su Ef.Esp para romperlo)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d4', tipoDano: 'hielo',
      efectos: [{nombre: 'Inmovilizado', turnos: 2, soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'dmgesp', alEmpezar: true, ayuda: true}}]}});
  H('Portal trampa', 'K', 'hdega', 'g', 3, {detalle: 'Deja un portal oculto en una casilla dentro de su Rango y elige adónde lleva (a 4 casillas o menos). Al que lo pisa, el portal se lo lleva ahí, salvo que gane su Resistencia especial contra el Efecto especial del mago (se aferra al suelo); llega Expuesto hasta que empieza su próximo turno: su Evasión a la mitad y sin poder reaccionar con nada que cueste No2. Se detecta con Percepción contra su Efecto especial.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'un portal oculto que lleva a quien lo pisa a 4 casillas o menos; llega Expuesto',
    trampaColocar: {nombre: 'Portal', tipo: 'flor', tamano: 0, color: '#5B4BC4', alfa: 45, efecto: {area: 'pisador'}, detectarStat: 'dmgesp', portal: {rango: 4, fijo: true},
      salvacion: {stat: 'resmg', etq: 'Res.Esp', dif: 7, que: 'efecto', logra: 'se aferra al suelo y el portal no lo lleva', difStat: 'dmgesp'}, estado: {nombre: 'Expuesto'}}});
  const MIS_BASE = {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d6', danoSumaEsp: 0.25};
  const MISILES = [
    {clave: 'arcano', nombre: 'Misil arcano', icono: '✨', que: 'arcano directo: no lo frena la Defensa especial',
      detalle: 'Un misil de magia pura a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 más un cuarto de su Efecto especial de daño arcano directo (no lo frena la Defensa especial).',
      duelo: {...MIS_BASE, tipoDano: 'arcano', danoDirecto: true, efectos: []}},
    {clave: 'fuego', nombre: 'Lengua de fuego', icono: '🔥', que: 'fuego y Quemadura',
      detalle: 'Una lengua de fuego a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 más un cuarto de su Efecto especial de daño de fuego (lo frenan la Defensa especial y la resistencia al fuego) y lo deja con Quemadura.',
      duelo: {...MIS_BASE, tipoDano: 'fuego', efectos: [{nombre: 'Quemadura'}]}},
    {clave: 'hielo', nombre: 'Dardo helado', icono: '❄', que: 'hielo y Escarcha: 1, y una más cada 5 de daño',
      detalle: 'Un dardo helado a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 más un cuarto de su Efecto especial de daño de hielo (lo frenan la Defensa especial y la resistencia al hielo) y Escarcha: 1, y una más cada 5 de daño que entra.',
      duelo: {...MIS_BASE, tipoDano: 'hielo', porDano: {estado: 'Escarcha', cada: 5, mas1: true}, efectos: []}},
    {clave: 'rayo', nombre: 'Centella', icono: '⚡', que: 'no se esquiva; 1d6 eléctrico que salta, y 50 % de Parálisis si no la resiste',
      detalle: 'Una centella a un rival dentro de su Rango que no se esquiva: 1d6 más un cuarto de su Efecto especial de daño eléctrico (lo frenan la Defensa especial y la resistencia eléctrica), que salta al rival más cercano (4 casillas o menos) con la mitad de lo que entró, sin repetir, hasta llegar a 1. Su Probabilidad de Golpe especial contra la Resistencia especial del objetivo decide la Parálisis: si gana, 50 % de Parálisis 1 turno.',
      duelo: {...MIS_BASE, contra: ['resmg'], danoSiempre: true, danoFormula: '1d6', tipoDano: 'eléctrico', cadena: {saltos: 99, rango: 4}, efectos: [{nombre: 'Parálisis', turnos: 1, caras: 2, exitos: 1}]}},
    {clave: 'acido', nombre: 'Mancha corrosiva', icono: '🧪', que: 'ácido y Armadura rota: 1, y una más cada 5 de daño',
      detalle: 'Una mancha corrosiva a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 más un cuarto de su Efecto especial de daño ácido (lo frenan la Defensa especial y la resistencia al ácido) y le rompe la armadura: Armadura rota 1, y una más cada 5 de daño que entra.',
      duelo: {...MIS_BASE, tipoDano: 'ácido', porDano: {estado: 'Armadura rota', cada: 5, mas1: true}, efectos: []}},
    {clave: 'toxico', nombre: 'Ponzoña', icono: '☠', que: 'tóxico y Veneno: 2 stacks, y uno más cada 5 de daño',
      detalle: 'Una ponzoña a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 más un cuarto de su Efecto especial de daño tóxico (lo frenan la Defensa especial y la resistencia al tóxico) y Veneno: 2 stacks, y uno más cada 5 de daño que entra.',
      duelo: {...MIS_BASE, tipoDano: 'tóxico', porDano: {estado: 'Veneno', cada: 5, mas1: true, base: 2}, efectos: []}},
  ];
  MISILES.forEach(m => H(m.nombre, 'D', 'hdega', 'g', 2, {detalle: m.detalle, no2: 2, spCosto: 'esp', auditada: true, ataqueTxt: `${m.icono} un misil: ${m.que}`, duelo: m.duelo}));
  // El Misil elemental: elige el elemento al lanzarlo (`variantes`, vtt-hexgrid/js/12); 1 No2 y 2 SP más. Sin elegir (fuera del mapa), el arcano.
  H('Misil elemental', 'D', 'hdega', 'g', 2, {detalle: 'Un misil del elemento que elija al lanzarlo: ✨ arcano (directo), 🔥 fuego (Quemadura), ❄ hielo (Escarcha), ⚡ eléctrico (no se esquiva, salta y puede paralizar), 🧪 ácido (Armadura rota) o ☠ tóxico (Veneno). Hace lo mismo que el misil de ese elemento (Misil arcano, Lengua de fuego, Dardo helado, Centella, Mancha corrosiva o Ponzoña), pero cuesta 1 No2 y 2 SP más.',
    no2: 3, spCosto: 'esp+2', auditada: true, ataqueTxt: 'un misil del elemento que elija (arcano, fuego, hielo, eléctrico, ácido o tóxico)', duelo: MISILES[0].duelo,
    variantes: MISILES.map(m => ({clave: m.clave, nombre: m.nombre, icono: m.icono, que: m.que, duelo: m.duelo}))});
  H('Descarga eléctrica', 'DK', 'ea', 'g', 3, zO('Una descarga que deja al objetivo sin aliento: pierde 1 No2 (a mano).', 2, 'M'));
  // 🔥 Auditada (dueño, 2026-10-24; el Mago, «muro de fuego»): reemplaza a la vieja Llamarada (a mano). La zona en línea de la Varita del muro de fuego
  // (`zonaForma: 'linea'`), con el largo a elegir al lanzarla (dueño: «un mínimo de 3, que se pueda ampliar por un costo adicional en SP, y cada 2
  // casilleros también un nitro; uno castea, te pregunta de qué largo, te confirma el costo y se ejecuta»): `largoVariable` (vtt-hexgrid/js/12, muroLargo).
  // Daño fijo (sin el Ef.Esp: su costo ya sube con el largo): 3d4 de fuego DIRECTO (dueño, 2026-10-24: «1d6 me parece muy poco, sobre todo si se reduce
  // con Def.Esp; lo haría de daño directo, 3d4»: no lo frena la Defensa especial, sí la resistencia al fuego) y Quemadura, al cruzarla (cada paso
  // adentro) y al empezar el turno adentro.
  // Costo (dueño, 2026-10-24: «el costo inicial en No2, 1 No2 por 4 casilleros, y cada casillero adicional +1 No2 y +1 SP»): 4 casillas, 1 No2 y 3 SP (o
  // cooldown 3); cada casilla de más +1 No2 y +1 SP (en modo cooldown, +1 al cooldown cada 2); hasta 8.
  // ⚡ Auditada (dueño, 2026-10-24: «vamos con el rayo cargado» —el nombre, Descarga arcana, el mismo día—, con la añadidura de que si el creep lo empieza a cargar estando cubierto por la niebla, se
  // revela su ubicación: una luz recubre al creep, como si quedara marcado»; idea 3 del Mago): el golpe anunciado (vtt-hexgrid/js/63) con un hechizo. Un
  // turno junta energía (es su ataque del turno: 1 No2 y 2 SP) y queda con Carga arcana (Marcado mientras tanto; 10 de daño se lo cortan); en su próximo turno,
  // al apretar Atacar, lo descarga: su PdG.Esp contra la Evasión, 4d6 arcano (dueño, el mismo día: «si no va a tener ningún efecto vinculado al eléctrico,
  // que el daño sea arcano») (2 No2 y 3 SP). Números propuestos por Claude.
  H('Descarga arcana', 'DK', 'ega', 'g', 3, {detalle: 'Junta energía mirando a un rival: este turno no ataca (es su ataque del turno) y queda con Carga arcana — una luz lo recubre: brilla y se lo ve aunque esté en la niebla, como Marcado; la Mesa y la Crónica dicen a quién apunta. En su próximo turno, al atacar, la descarga: su Probabilidad de Golpe especial contra la Evasión, 4d6 de daño arcano (lo frena la Defensa especial). Cargarlo cuesta 1 No2 y 2 SP; descargarlo, 2 No2 y 3 SP. Si mientras lo carga le entran 10 de daño o más, se le corta.',
    no2: 1, spCosto: 2, auditada: true, cuentaComoAtaque: true, efecto: {nombre: 'Carga arcana'},
    golpeAnunciado: {verbo: 'junta energía', icono: '⚡', spGolpe: 3, no2Golpe: 2, anuncio: 'Una luz lo recubre: se lo ve aunque esté en la niebla. En su próximo turno la descarga (4d6 arcano, su PdG.Esp contra la Evasión). Si le entran 10 de daño o más antes, se le corta.',
      detalleGolpe: 'Su PdG.Esp contra la Evasión; 4d6 de daño arcano.',
      duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '4d6', tipoDano: 'arcano'}}});
  H('Muro de fuego', 'DA', 'ega', 'g', 3, {detalle: 'Levanta un muro de llamas en línea, que empieza dentro de su Rango: 4 casillas o más (hasta 8: cada casilla de más cuesta 1 No2 y 1 SP más), durante 3 turnos. Quien lo cruza o empieza su turno adentro recibe 3d4 de daño de fuego directo (no lo frena la Defensa especial; sí la resistencia al fuego) y queda con Quemadura.',
    no2: 1, spCosto: 3, auditada: true, largoVariable: {min: 4, max: 8, sp: 1, no2: 1}, ataqueTxt: 'muro de fuego en línea (4 casillas o más), 3 turnos: 3d4 de fuego directo y Quemadura a quien lo cruza o se queda',
    duelo: {objetivo: 'zona', tira: '', contra: [], dano: true, danoFormula: '3d4', danoDirecto: true, tipoDano: 'fuego', zonaTurnos: 3, zonaForma: 'linea', zonaLargo: 4, zonaAltura: 'ambos',
      zonaColor: '#E8632B', zonaAlcance: 'rango', zonaCadaPaso: true, zonaEstado: {nombre: 'Quemadura'}}}, 'terreno y formas');
  H('Lanza de hielo', 'DX', 'e', 'g', 3, zO('Un carámbano que ralentiza: el objetivo pierde 1 No2 (a mano).', 2, 'M'));
  H('Dardo venenoso', 'DX', 'hdp', 'r', 2, aT('Un dardo cubierto de veneno: tirá 1d4, con 1 el objetivo queda Envenenado (a mano).', 'L'));
  H('Explosión psíquica', 'D', 'a', 'g', 4, zO('Un pulso mental que ignora la armadura.', 3, 'H'));
  H('Rayo de vacío', 'D', 'am', 'g', 5, zO('Un rayo oscuro que consume lo que toca.', 4, 'H'));
  H('Espinas lanzadas', 'DA', 'p', 'r', 3, zO('Dispara espinas hacia adelante en cono (a mano).', 3, 'M'));
  H('Disparo de energía', 'D', 'ca', 'r', 2, aT('Un rayo de energía concentrada.', 'M'));
  H('Toque helado', 'D', 'm', 'g', 2, aT('Un toque que congela la sangre.', 'L'));

  /* ================= TANQUE / DEFENSA ================= */
  H('Guardia alta', 'T', 'hdc', 't', 2, bU('Se cubre bien: +2 de Defensa 2 turnos.', 1, {def: 2}, 2));
  H('Postura defensiva', 'T', '*', 't', 3, bU('Se planta firme: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Piel de piedra', 'T', 'ceb', 't', 4, bU('Su piel se endurece: +4 de Defensa 3 turnos.', 2, {def: 4}, 3));
  H('Caparazón', 'T', 'bc', 't', 3, bU('Se cierra en su coraza: +4 de Defensa y −1 No2 (a mano) 2 turnos.', 1, {def: 4}, 2));
  H('Corteza de árbol', 'T', 'p', 't', 3, bU('La corteza lo protege: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Muro de escudos', 'T', 'hd', 't', 5, bU('Se atrinchera detrás de su escudo: +5 de Defensa 3 turnos.', 3, {def: 5}, 3));
  H('Aguantar', 'TC', '*', 't', 3, cU('Aprieta los dientes y recupera fuerzas.', 2, 3));
  H('Regeneración', 'C', 'bpe', 't', 5, cU('Su cuerpo se cierra solo: recupera vida.', 3, 5));
  // (Segundo aliento, la vieja a mano: la reemplaza la de la tanda del Choque pesado, 2026-10-27.)
  H('Inamovible', 'T', 'ce', 't', 4, bU('Nada lo mueve: +3 de Defensa y +2 Res.Esp 3 turnos.', 2, {def: 3, resmg: 2}, 3));
  H('Escudo de energía', 'T', 'cag', 'tg', 4, bU('Una barrera lo rodea: +3 de Defensa y +3 Res.Esp 2 turnos.', 2, {def: 3, resmg: 3}, 2));
  H('Resistencia especial', 'T', '*', 'tg', 3, bU('Se cubre contra hechizos: +4 Res.Esp 3 turnos.', 2, {resmg: 4}, 3));
  H('Dura cabeza', 'T', 'bdc', 't', 2, bU('Encoge el cuello y aguanta: +2 de Defensa 2 turnos.', 1, {def: 2}, 2));
  // (Provocar, la vieja a mano: la reemplaza la de la tanda del Choque pesado, 2026-10-27.)
  H('Rugido desafiante', 'TX', 'bd', 't', 4, tA('Ruge y los enemigos cercanos prefieren atacarlo (a mano).', 2));
  // (Interponerse, la vieja a mano: la reemplaza la de la tanda del Choque pesado, 2026-10-27.)
  H('Rebotar', 'T', 'c', 't', 4, bU('Su coraza devuelve golpes: +4 de Defensa 2 turnos y quien lo golpea sufre 1d4 (a mano).', 2, {def: 4}, 2));
  H('Vigor', 'TC', 'bp', 't', 4, dC('Ataca y se alimenta de la pelea.', 3, 'L', 2));
  H('Postura del roble', 'T', 'p', 't', 5, bU('Raíces que lo sostienen: +4 de Defensa y +2 Res.Esp 4 turnos.', 3, {def: 4, resmg: 2}, 4));
  H('Armadura de hueso', 'T', 'm', 't', 3, bU('Los huesos se cierran sobre él: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Carne muerta', 'T', 'm', 't', 4, bU('No siente dolor: +3 de Defensa y +2 Res.Esp 3 turnos.', 2, {def: 3, resmg: 2}, 3));
  H('Manto helado', 'T', 'e', 't', 3, bU('Una capa de hielo lo cubre: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Endurecer', 'T', 'c', 't', 2, bU('Sus juntas se traban: +2 de Defensa 2 turnos.', 1, {def: 2}, 2));

  /* ================= BUFF (sobre sí mismo) ================= */
  // 😡 Auditada (dueño, 2026-10-26; Choque pesado, «furia», reemplaza a la vieja de +3 de daño): Enfurecido —+3 PdG y +4 al daño, −2 Evasión y −2 Defensa—
  // el turno en que la usa y 2 turnos completos más. 2 No2 y 2 SP, o cooldown 3.
  H('Furia', 'B', '*', 'm', 3, {detalle: 'Se enfurece: +3 a la Probabilidad de Golpe y +4 al daño, pero −2 a la Evasión y −2 a la Defensa, durante el turno en que la usa y sus próximos 2 turnos completos.',
    no2: 2, spCosto: 2, auditada: true, ataqueTxt: 'Enfurecido: +3 PdG y +4 al daño, −2 Evasión y −2 Defensa, este turno y 2 completos más',
    duelo: {objetivo: 'uno mismo', tira: '', contra: [], efectos: [{nombre: 'Enfurecido'}]}});
  H('Grito de guerra', 'B', 'hd', 'ma', 3, bU('Grita y se anima: +2 de Daño y +1 No2 3 turnos.', 2, {dmg: 2, nitros: 1}, 3));
  H('Frenesí', 'B', 'b', 'me', 4, bU('Se vuelve loco de hambre: +4 de Daño y −2 de Defensa 3 turnos.', 2, {dmg: 4, def: -2}, 3));
  H('Concentración', 'B', '*', 'r', 2, bU('Respira hondo antes de tirar: +2 de Daño 2 turnos.', 1, {dmg: 2}, 2));
  H('Reflejos', 'B', '*', 'e', 2, bU('Se pone en guardia: +3 de Evasión 2 turnos.', 1, {eva: 3}, 2));
  H('Paso ligero', 'BM', '*', 'e', 3, bU('Se vuelve ágil: +2 No2 y +2 de Evasión 3 turnos.', 2, {nitros: 2, eva: 2}, 3));
  H('Sombras', 'B', 'hdam', 'e', 4, bU('Se funde con la oscuridad: +4 de Evasión 3 turnos.', 2, {eva: 4}, 3));
  H('Velocidad sobrenatural', 'BM', 'ea', 'e', 4, bU('Se mueve más rápido que el ojo: +3 No2 2 turnos.', 2, {nitros: 3}, 2));
  H('Afilar', 'B', 'hd', 'me', 2, bU('Afila su arma: +2 de Daño 3 turnos.', 1, {dmg: 2}, 3));
  H('Sed de sangre', 'B', 'bdm', 'm', 4, bU('Huele sangre: +3 de Daño y +1 No2 3 turnos.', 2, {dmg: 3, nitros: 1}, 3));
  H('Instinto', 'B', 'b', 'e', 2, bU('Sigue el instinto: +2 de Evasión y +1 de Daño 2 turnos.', 1, {eva: 2, dmg: 1}, 2));
  H('Campo de fuerza', 'B', 'ca', 'g', 3, bU('Se envuelve en energía: +2 de Defensa y +2 Res.Esp 3 turnos.', 2, {def: 2, resmg: 2}, 3));
  H('Amplificar magia', 'B', 'ega', 'g', 3, bU('Carga su magia: +4 de Daño 2 turnos.', 2, {dmg: 4}, 2));
  H('Coraje', 'B', 'hd', 'ma', 2, bU('Se llena de valor: +2 Res.Esp y +1 de Daño 3 turnos.', 1, {resmg: 2, dmg: 1}, 3));
  H('Modo turbo', 'B', 'c', 'm', 4, bU('Sobrecalienta sus motores: +3 No2 y +2 de Daño 2 turnos.', 3, {nitros: 3, dmg: 2}, 2));
  H('Camuflaje', 'B', 'bpd', 'e', 3, bU('Se mimetiza con el entorno: +3 de Evasión 3 turnos.', 1, {eva: 3}, 3));
  H('Rabia ancestral', 'B', 'em', 'm', 5, bU('Una furia antigua lo posee: +5 de Daño y −2 de Defensa 3 turnos.', 3, {dmg: 5, def: -2}, 3));
  H('Preparar emboscada', 'B', 'hdb', 'e', 4, bU('Se esconde para el próximo golpe: +4 de Daño 2 turnos.', 2, {dmg: 4}, 2));
  H('Fortalecerse', 'B', '*', 'mt', 3, bU('Aprieta los músculos: +1 de Daño y +2 de Defensa 3 turnos.', 2, {dmg: 1, def: 2}, 3));
  H('Ojo avizor', 'B', 'bhd', 'r', 3, bU('Se concentra en el blanco: +3 de Daño 3 turnos.', 2, {dmg: 3}, 3));
  H('Ritual', 'B', 'dhm', 'g', 5, bU('Un ritual corto: +4 de Daño y +3 Res.Esp 3 turnos.', 3, {dmg: 4, resmg: 3}, 3));

  /* ================= APOYO (aliados: a mano) ================= */
  // 📣 Auditadas (dueño, 2026-10-23; Support, «grito de guerra»): la síntesis de los cuatro gritos de los creeps de «El origen» (Aullido de la manada,
  // ¡Por el amo!, ¡A laburar!, Marca del amo) y de los dos de fábrica a mano (Aullido de manada, Grito de ánimo), en dos: una ofensiva fuerte y corta
  // y una pareja (Bendecido) más larga. A sus aliados a 4 casillas o menos, no a él; no se apilan (otro grito igual renueva los turnos).
  H('¡A la carga!', 'BA', '*', 'a', 3, {detalle: 'Un grito que lanza a los suyos al ataque: sus aliados a 4 casillas o menos (no él) quedan con ¡A la carga! 2 turnos: +2 a la Probabilidad de Golpe, a la PdG.Esp, al daño y al Efecto especial. No se apila: otro grito igual renueva los turnos.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: '¡A la carga! a sus aliados a 4 o menos, 2 turnos: +2 a todo lo ofensivo',
    duelo: {objetivo: 'onda', radio: 4, aliados: true, tira: '', contra: [], efectos: [{nombre: '¡A la carga!', polaridad: 'buff', turnos: 2,
      mods: [{stat: 'pdg', val: 2}, {stat: 'pdgmg', val: 2}, {stat: 'dmg', val: 2}, {stat: 'dmgesp', val: 2}], detalle: '¡A la carga!: +2 a la PdG, a la PdG.Esp, al daño y al Efecto especial.'}]}});
  // 🥁 Auditada (dueño, 2026-10-25; el Support, «más acciones», Redoble de tambores: +No2 a los aliados cercanos; «y que si tiene algún aliado alrededor
  // que trabaje con cooldown en lugar de SP, que le reduzca en uno el valor de todos los cooldowns que estén activos»; «sumale en uno el rango»): la onda
  // de los gritos, radio 4 (diámetro 9), a sus aliados (no a él): Redoble (+2 No2 su próximo turno) y −1 a los cooldowns activos (`bajaCd`, js/13).
  // Costo propuesto por Claude: 2 No2 y 3 SP, o cooldown 3.
  // 🔥 Auditada (dueño, 2026-10-25; el Support, «apuestas», Frenesí inducido: «misma penalidad, pero +3 a la probabilidad de golpe, +5 al daño»; «bien» a
  // la cura de 1d6 que propuso Claude, para que se sienta; y «mientras dura, que se cure un d6 cada turno completo»): a él o a un aliado en su Rango, sin
  // tirada: Frenético 2 turnos completos, que cura 4 al ponerlo y al empezar cada uno de sus turnos (dueño: «que cure 4, para no tirar un dado»).
  // Costo propuesto por Claude: 1 No2 y 3 SP, o cooldown 3.
  H('Frenesí inducido', 'B', '*', 'a', 3, {detalle: 'Le enciende la sangre a un aliado (o a sí mismo) dentro de su Rango: queda Frenético durante sus próximos 2 turnos completos (el turno en que se lo da no cuenta): +3 a la Probabilidad de Golpe (también la especial) y +5 al daño, pero −2 a la Evasión y −2 a la Defensa; y se cura 4 en el momento y otra vez al empezar cada uno de sus turnos.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'a él o a un aliado en su Rango: Frenético 2 turnos (+3 PdG, +5 al daño, −2 Evasión, −2 Defensa) y cura 4 ahora y en cada turno',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Frenético'}]}});
  // 🪶 Auditada (dueño, 2026-10-25; el Support, idea del dueño a partir de las Zapatillas de levitación: «Levitar»; «+3, que el primer casillero no le
  // cueste nitros y que esté flotando todo el tiempo»): a él o a un aliado en su Rango, sin tirada, Levitando 2 turnos completos. Costo de Claude.
  H('Levitar', 'B', '*', 'a', 3, {detalle: 'Hace flotar a un aliado (o a sí mismo) dentro de su Rango durante sus próximos 2 turnos completos (el turno en que se lo da no cuenta): no toca el piso (no lo frena el terreno, no pisa trampas, no lo tocan las zonas del suelo), +3 a la Evasión y el primer casillero que mueve en cada turno no le cuesta No2.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'a él o a un aliado en su Rango: Levitando 2 turnos (flota, +3 Evasión, el primer casillero gratis)',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Levitando'}]}});
  // ✨ Auditada (dueño, 2026-10-25; el Support, «limpiar estados de un aliado», Purificar: «vamos con esa, me parece bien»): la purga de la Varita de la
  // purga (le saca el estado malo más reciente, js/13) y cura 5 fijos (sin dado, como el Frenético), a él o a un aliado en su Rango. Costo de Claude.
  // Flash (dueño, el mismo día: «que Purificar tenga flash»): se usa cuando sea, como Bendecir el arma; en turno ajeno cuesta el doble.
  H('Purificar', 'C', '*', 'a', 3, {detalle: 'FLASH (se puede usar en cualquier momento; en turno ajeno cuesta el doble). Limpia a un aliado (o a sí mismo) dentro de su Rango: le saca su estado malo más reciente y lo cura 5 de vida (sin pasar su máximo). Sobre alguien caído no cura.',
    no2: 0, spCosto: 2, flash: true, auditada: true, ataqueTxt: 'Flash: a él o a un aliado en su Rango, le saca el estado malo más reciente y cura 5',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{purga: true}, {cura: 5}]}});
  // 😤 Auditada (dueño, 2026-10-26; el Support, idea del dueño: «elija algún aliado y hay algún efecto en área alrededor de ese aliado… tienen que tirar
  // resistencia mental para no ser provocados por el aliado»; «3 casilleros… un SP más»; el nombre: «Tirar la bronca»): elige un aliado en su Rango (o a sí
  // mismo); los rivales a 3 casillas o menos de él tiran Res.Mt contra el Ef.Esp del creep; si no resisten, Provocados por ese aliado 2 turnos (el Anuncio
  // al empezar su turno y el aliado que brilla: vtt-hexgrid/js/77). Sin daño. 2 No2 y 4 SP, o cooldown 3.
  H('Tirar la bronca', 'K', '*', 'a', 3, {detalle: 'Le tira encima la bronca de los rivales a un aliado dentro de su Rango (o a sí mismo): cada rival a 3 casillas o menos de ese aliado tira su Resistencia mental contra el Efecto especial del creep; si no la resiste, queda Provocado por ese aliado 2 turnos: su turno es para ir contra él (atacarlo o usar contra él una habilidad hostil; si no llega, acercarse). Al empezar su turno se le anuncia, y el aliado brilla.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'a los rivales a 3 de un aliado: Res.Mt contra su Ef.Esp; Provocados por ese aliado 2 turnos',
    provocarAliado: {radio: 3, turnos: 2},
    duelo: {objetivo: 'area', radio: 3, tira: 'dmgesp', contra: ['resm'], dano: false, efectos: [{nombre: 'Provocado', turnos: 2}]}}, 'estados alterados');
  // ☀ Auditada (dueño, 2026-10-26; el Support, el Smite de la clase —«Rayo de daño holy inesquivable que causa 1d4 de daño»—: «vamos con Smite»): un rayo de
  // luz que no se esquiva (`danoSiempre`, como el Zap): 2d4 de luz directo (solo la Res. luz; ×1,5 a no-muertos y demonios) y, si no lo resiste con su
  // Res.Esp contra el Ef.Esp del creep, Marcado (la identidad de la luz; resistido, no: vtt-hexgrid/js/13). Costo de Claude: 1 No2 y 2 SP, o cooldown 2.
  H('Smite', 'D', '*', 'a', 2, {detalle: 'Un rayo de luz sagrada a un rival dentro de su Rango, que no se esquiva: 2d4 de daño de luz directo (no lo frenan la Defensa ni la Defensa especial; sí la Res. luz; a no-muertos y demonios, ×1,5). Si no lo resiste con su Resistencia especial contra el Efecto especial del creep, además queda Marcado hasta su próximo turno.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'no se esquiva: 2d4 de luz directo; Marcado si no lo resiste (Res.Esp contra su Ef.Esp)',
    duelo: {objetivo: 'enemigo', tira: 'dmgesp', contra: ['resmg'], danoSiempre: true, alcance: 'rango', dano: true, danoFormula: '2d4', danoDirecto: true, tipoDano: 'luz', efectos: []}});
  // ☀ Auditada (dueño, 2026-10-26; el Support, «luz para los suyos», con la luz como su elemento: «me parece bien, pero que haga un dado de 8 directo… y que
  // si pega quedan marcados por 2 turnos»): una zona de luz de diámetro 5 en su Rango, 2 turnos, que ilumina y revela lo oculto (`zonaLuz`, como las luces de
  // las varitas); a cada rival que está adentro cuando aparece o entra, la zona tira el Ef.Esp del creep contra su Res.Esp: si no resiste, 1d8 de luz directo
  // (solo lo frena la Res. luz; ×1,5 a no-muertos y demonios) y Marcado 2 turnos. Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  H('Luz para los suyos', 'BA', '*', 'a', 3, {detalle: 'Un destello en una casilla dentro de su Rango: un fogonazo de diámetro 5 (19 casillas) que no queda en el mapa. Todo lo oculto de adentro queda a la vista: los rivales quedan Marcados 2 turnos, sin tirada (salen del sigilo y se los sigue viendo aunque vuelva la niebla), y las trampas escondidas de los rivales quedan descubiertas. Además, a cada rival de adentro el destello le tira el Efecto especial del creep contra su Resistencia especial: si no resiste, 1d8 de daño de luz directo (solo lo frena la Res. luz; a no-muertos y demonios, ×1,5). Un destello no se esquiva corriendo. No afecta a sus aliados.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'un destello de diámetro 5 en su Rango: a los rivales, Marcado 2 turnos sin tirada y sus trampas a la vista; Ef.Esp contra Res.Esp, 1d8 de luz directo',
    duelo: {objetivo: 'area', radio: 2, alcance: 'rango', tira: 'dmgesp', contra: ['resmg'], sinDodge: true, dano: true, danoFormula: '1d8', danoDirecto: true, tipoDano: 'luz',
      destello: {nombre: 'Marcado', turnos: 2}}}, 'sigilo,niebla y visión');   // (2026-10-26, dueño: «un destello, ¡fum!, que sucede y no queda como área»; antes era una zona de 2 turnos)
  // 💪 Auditada (dueño, 2026-10-26; el Support, «Empujón de creep»: «vamos con Empower»): el Empower de la clase para creeps. Flash (el botón ✨ del GM,
  // vtt-hexgrid/js/71; en turno ajeno, el doble): a él o a un aliado en su Rango, el estado Empower (+3 a su próxima tirada, la que sea; otro antes de
  // tirar suma +3 más). La tirada que lo usa lo gasta (CreepAcciones.gastarUnaTirada). No gasta su ataque. Costo el de la clase: 2 SP, o cooldown 2.
  H('Empuje', 'B', '*', 'a', 2, {detalle: 'FLASH (se puede usar en cualquier momento; en turno ajeno cuesta el doble). A un aliado (o a sí mismo) dentro de su Rango: Empower, +3 a su próxima tirada, la que sea (ataque, defensa, daño, resistencia). Otro Empuje antes de que tire suma +3 más. Esa tirada lo gasta.',
    no2: 0, spCosto: 2, flash: true, auditada: true, ataqueTxt: 'Flash: a él o a un aliado en su Rango, +3 a su próxima tirada (Empower)',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Empower'}]}});
  H('Redoble de tambores', 'BA', '*', 'a', 3, {detalle: 'Un redoble que empuja a los suyos: sus aliados a 4 casillas o menos (no él) suman +2 No2 en su próximo turno (Redoble) y, los que trabajan con cooldown (no con SP), bajan en 1 cada cooldown que tengan activo.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'a sus aliados a 4 o menos: +2 No2 su próximo turno y −1 a sus cooldowns activos',
    duelo: {objetivo: 'onda', radio: 4, aliados: true, tira: '', contra: [], efectos: [{nombre: 'Redoble'}, {nombre: 'Baja cooldowns', bajaCd: 1}]}});
  H('Arenga', 'BA', '*', 'a', 3, {detalle: 'Una arenga que levanta el ánimo de los suyos: sus aliados a 4 casillas o menos (no él) quedan Bendecidos 3 turnos: +1 a todo, para atacar y para defenderse (PdG, Evasión, Parry, Bloqueo, daño, resistencias). No se apila: otra Arenga renueva los turnos.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'Bendecido a sus aliados a 4 o menos, 3 turnos: +1 a todo',
    duelo: {objetivo: 'onda', radio: 4, aliados: true, tira: '', contra: [], efectos: [{nombre: 'Bendecido', polaridad: 'buff', turnos: 3}]}});
  // 💚 Auditadas (dueño, 2026-10-23; Support, «curar»): la síntesis de las curaciones de los creeps de «El origen» (Savia que cierra heridas, Esporas
  // curativas, Regeneración) y de las de fábrica a mano (Curación menor y mayor, Canto revitalizante, Polen sanador, Zona sagrada, Aura sanadora), que
  // salieron del pool. Sanar es el Heal de los personajes (1d6+4); la zona y el aura curan 4 fijos por pulso, sin dados (dueño), al ponerlas y al
  // empezar cada turno de quien las creó, 4 veces (vtt-hexgrid/js/70). Oleada sanadora: el Sanar a todos sus aliados de una flor de 7, más cara.
  H('Sanar', 'C', '*', 'a', 2, {detalle: 'Cierra las heridas de un aliado (o las propias): él o un aliado dentro de su Rango se cura 1d6+4 de vida (sin pasar su máximo). Sobre alguien caído no hace nada.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'cura 1d6+4 a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{cura: '1d6+4'}]}});
  H('Oleada sanadora', 'CA', '*', 'a', 4, {detalle: 'Una oleada que cierra las heridas de todos: elige una flor de diámetro 3 (7 casillas) dentro de su Rango y cada uno de sus aliados adentro (él incluido) se cura 1d6+4, como con Sanar. Sobre alguien caído no hace nada.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'cura 1d6+4 a cada aliado de una flor de 7 en su Rango',
    duelo: {objetivo: 'area', radio: 1, aliados: true, tira: '', contra: [], alcance: 'rango', efectos: [{cura: '1d6+4'}]}});
  H('Bálsamo', 'C', '*', 'a', 3, {detalle: 'Un bálsamo que sigue curando: él o un aliado dentro de su Rango recupera 4 de vida al empezar cada uno de sus próximos 3 turnos (Regeneración). Sobre alguien caído no levanta.',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'Regeneración 4 por turno, 3 turnos, a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Regeneración', turnos: 3, hp: 4}]}});
  H('Círculo de sanación', 'CA', '*', 'a', 4, {detalle: 'Marca en el piso un círculo que cura: una zona de diámetro 5 (19 casillas) dentro de su Rango, que dura 4 turnos. Al ponerla y al empezar cada uno de sus turnos (4 veces en total) cura 4 de vida a todos sus aliados que estén adentro (él incluido), sin tirar dados.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'zona de diámetro 5: cura 4 a todos sus aliados adentro, 4 veces (al ponerla y al empezar sus turnos)',
    duelo: {objetivo: 'zona', radio: 2, zonaTurnos: 4, zonaAlcance: 'rango', zonaColor: '#7CD992', tira: '', contra: [], dano: false, zonaEstado: {cura: '4', pulsos: 4}}}, 'terreno y formas');
  H('Aura sanadora', 'CA', '*', 'a', 4, {detalle: 'Se rodea de un aura que cura: durante 4 turnos, al activarla y al empezar cada uno de sus turnos (4 veces en total) cura 4 de vida a todos sus aliados a 5 casillas o menos (diámetro 11), él incluido, sin tirar dados. El aura se mueve con él.',
    no2: 3, spCosto: 5, auditada: true, ataqueTxt: 'aura de diámetro 11: cura 4 a todos sus aliados cerca, 4 veces (al activarla y al empezar sus turnos)',
    duelo: {objetivo: 'uno mismo', tira: '', contra: [], efectos: [{nombre: 'Aura sanadora', polaridad: 'buff', turnos: 4, detalle: 'Aura sanadora: al empezar cada uno de sus turnos, 4 de vida a sus aliados a 5 casillas o menos (vtt-hexgrid/js/70).'}]}}, 'aura');
  // 🌵🪞 Auditadas (dueño, 2026-10-24: «un buff que le da a un aliado Espinas y otro que le da Espejo», concepto «devolver el daño» del Support): los
  // presets de siempre, ya automatizados en el duelo (vtt-hexgrid/js/13: dueloEspinas / dueloEspejo), a él o a un aliado en su Rango, como el Bálsamo.
  // Costos propuestos por Claude: 1 No2 y 2 SP, o cooldown 3; 3 turnos.
  H('Coraza de púas', 'B', '*', 'a', 3, {detalle: 'Le cubre la piel de púas a un aliado (o a sí mismo) dentro de su Rango: durante 3 turnos, cada ataque cuerpo a cuerpo que recibe le devuelve al atacante un cuarto del golpe (antes de la Defensa, redondeado para arriba), directo a la vida (Espinas).',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'Espinas 3 turnos a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Espinas', turnos: 3}]}});
  H('Velo espejado', 'B', '*', 'a', 3, {detalle: 'Envuelve a un aliado (o a sí mismo) dentro de su Rango en un velo que refleja la magia: durante 3 turnos, cada ataque de daño especial que recibe (varita, báculo, habilidad o el daño elemental de un arma, a cualquier distancia) le devuelve al que lo tiró un cuarto de ese daño (redondeado para arriba), directo a la vida (Espejo).',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'Espejo 3 turnos a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Espejo', turnos: 3}]}});
  // ✨ Auditada (dueño, 2026-10-24: «vamos con bendecir el arma, que tenga flash»; concepto 2 del Support): Flash — en turno ajeno cuesta el doble
  // (vtt-hexgrid/js/12) — y sin No2 (un Flash no cobra No2, P136). El estado Arma bendecida: la carga del próximo ataque con arma, +1 dado del Tipo
  // de su arma (Combatiente.sumarCargas `dados`). Costos propuestos por Claude: 2 SP o cooldown 2.
  // 🎯 Auditada (dueño, 2026-10-24: «ojo certero, +2 al crítico potente, +2 al crítico frecuente durante 2 turnos; que el afectado inicie y termine 2 turnos
  // completos con ese efecto»; concepto 5 del Support): a él o a un aliado en su Rango, sin tirada. Costo propuesto por Claude: 1 No2 y 3 SP, o cooldown 3.
  // 🎯 Auditada (dueño, 2026-10-25; el Support, «señalar la presa»: «menos 2 a Evasión y más 4 al daño»): su PdG.Esp contra la Res.Esp de un rival en su
  // Rango; si gana, Presa señalada 2 turnos (−2 Evasión; todo el que lo ataca le hace +4 de daño: js/13 presaContra). La versión del Support del Disparo
  // señalador, sin disparo. Y Marcado los mismos 2 turnos (dueño, el mismo día: «que quede como marca visible, que no se pueda ocultar y que se vea a
  // pesar de la niebla de guerra»). 1 No2 y 2 SP, o cooldown 3 (costo propuesto por Claude).
  H('Señalar la presa', 'X', '*', 'a', 3, {detalle: 'Señala a un rival dentro de su Rango para que todos vayan por él: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo; si gana, queda como Presa señalada 2 turnos: su Evasión baja 2 y todo el que lo ataca le hace +4 de daño. Y queda Marcado esos mismos 2 turnos: brilla, se lo ve aunque vuelva la niebla y no puede esconderse (si estaba en sigilo, sale).',
    no2: 1, spCosto: 2, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; si gana, Presa señalada y Marcado 2 turnos (−2 Evasión, +4 al daño de todos, no se esconde)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: false, efectos: [{nombre: 'Presa señalada'}, {nombre: 'Marcado', turnos: 2}]}});
  // 🛡 Auditada (dueño, 2026-10-25; el Support, «Armas perforantes»: «un skill de support trabaja sobre aliados: que le otorgue a un aliado un estado que le hace
  // perforar 3 de defensa y 3 de defensa especial durante X»): a él o a un aliado en su Rango, Armas perforantes 3 turnos completos (dueño, el mismo día:
  // el nombre y «que dure 3 turnos, porque al poder fallar prefiero que dure un turno más»; costo propuesto por Claude, como Ojo certero).
  H('Armas perforantes', 'B', '*', 'a', 3, {detalle: 'Le enseña a un aliado (o a sí mismo) dentro de su Rango por dónde entrar: queda con Armas perforantes durante sus próximos 3 turnos completos (el turno en que se lo da no cuenta): en cada golpe que da, 3 puntos de daño pasan siempre la Defensa del rival y 3 pasan siempre su Defensa especial.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'Armas perforantes (Perfora 3 contra la Defensa y 3 contra la Defensa especial), 3 turnos completos, a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Armas perforantes'}]}});
  H('Ojo certero', 'B', '*', 'a', 3, {detalle: 'Le afina la puntería a un aliado (o a sí mismo) dentro de su Rango: Crítico frecuente +2 y Crítico potente +2 durante sus próximos 2 turnos completos (el turno en que se lo da no cuenta).',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'Crítico frecuente +2 y Crítico potente +2, 2 turnos completos, a él o a un aliado en su Rango',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Ojo certero'}]}});
  // 💨 Auditada (dueño, 2026-10-26; Support: «un poco como el Shield. Otorga un escudo de 10 de HP que absorbe daño. Del tipo vida extra. Y además, sube en
  // uno en la tabla de iniciativas. Y tiene flash»; «dura hasta que se gaste. El escudo reemplaza, no se suma. Y el nombre envión me gusta»): Flash; a él o a
  // un aliado en su Rango, el estado Envión (10 que se gastan) y sube 1 lugar en el orden (js/13 dueloAdelanto). 3 SP (6 en turno ajeno), o cooldown 3.
  H('Envión', 'B', '*', 'a', 3, {detalle: 'Flash. Le da un envión a un aliado (o a sí mismo) dentro de su Rango: un escudo que absorbe 10 de daño, hasta gastarse (otro Envión lo deja otra vez en 10, no se suma), y sube 1 lugar en el orden de turnos (no pasa por encima del que tiene el turno; si ya jugó esta ronda, le sirve para la próxima).',
    no2: 0, spCosto: 3, flash: true, auditada: true, ataqueTxt: 'Flash: a él o a un aliado, un escudo de 10 (hasta gastarse) y sube 1 lugar en el orden de turnos',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Envión'}, {nombre: 'Sube en el orden', stacks: 1, detalle: 'Sube 1 lugar en el orden de turnos.'}]}});
  // 🎯 Auditada (dueño, 2026-10-26; Support, «llevarlo al lado de un rival» ✦: «4 está bien… que sea siempre al lado de un rival y que dé más 2 a la
  // probabilidad de golpe y más 2 a la evasión hasta el final de su próximo turno»): a un aliado en su Rango (no él), lo teletransporta a una casilla libre
  // pegada a un rival, a 4 o menos (el blink, js/13 `alFrente`); al llegar, Al frente. 2 No2 y 3 SP, o cooldown 3; no es Flash.
  H('¡Al frente!', 'BM', '*', 'a', 3, {detalle: 'Manda a un aliado al frente: a un aliado dentro de su Rango (no a sí mismo) lo teletransporta a una casilla libre pegada a un rival, a 4 casillas o menos de donde estaba (no camina: no da ataques de oportunidad ni pisa nada en el camino; lo de la casilla de llegada sí lo toca). Al llegar: +2 a la Probabilidad de Golpe y +2 a la Evasión hasta el final de su próximo turno.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'un aliado en su Rango aparece pegado a un rival (a 4 o menos): +2 PdG y +2 Evasión hasta el final de su próximo turno',
    blink: {distancia: 4, alFrente: true, estado: 'Al frente'}});
  // 🚩 Auditada (dueño, 2026-10-24; el Support, «Estandarte de guerra»: «+3 a la probabilidad de golpe, +5 al daño, 10 por nivel de HP, sin ningún tipo de
  // defensa ni resistencia»; «permanente hasta que se rompa»; «el diámetro tiene que ser de 7»; «en cualquier lugar dentro de su rango»; «con cooldown, que
  // sea de 4 pero disponible desde el inicio del combate»): clava un estandarte en una casilla libre dentro de su Rango; sus
  // aliados a 3 casillas o menos (diámetro 7) suman +3 al PdG (y al PdG.Esp) y +5 al daño mientras siga en pie. El estandarte es un token propio (un creep
  // quieto de su bando, sin ataques): se le pega como a cualquier rival; con 0 de vida se rompe y se va. Uno por creep: clavar otro saca el anterior. Lo
  // hace el mapa (vtt-hexgrid/js/73). Costo propuesto por Claude: 2 No2 y 4 SP, o cooldown 4.
  H('Estandarte de guerra', 'B', '*', 'a', 4, {detalle: 'Clava un estandarte de guerra en una casilla libre dentro de su Rango. Mientras siga en pie, sus aliados a 3 casillas o menos (diámetro 7, él incluido) suman +3 a su Probabilidad de Golpe (también la especial) y +5 al daño. El estandarte tiene 10 de vida por nivel del creep y ninguna defensa ni resistencia (no esquiva): se le pega como a cualquier rival y, al romperse, el bonus se termina. Uno por creep: si clava otro, el anterior se va.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'clava un estandarte: aliados a 3 casillas, +3 PdG y +5 al daño hasta que lo rompan',
    disponibleAlInicio: true, estandarte: {radio: 3, pdg: 3, dano: 5, vidaPorNivel: 10}});   // cooldown 4, pero no arranca el combate en cooldown (dueño)
  H('Bendecir el arma', 'B', '*', 'a', 2, {detalle: 'FLASH (se puede usar en cualquier momento; en turno ajeno cuesta el doble). Bendice el arma de un aliado (o la propia) dentro de su Rango: su próximo ataque con arma suma un dado más del Tipo de su arma al daño (Arma bendecida; si no ataca, se va a los 2 turnos).',
    no2: 0, spCosto: 2, flash: true, auditada: true, ataqueTxt: 'Flash: el próximo ataque con arma de él o de un aliado en su Rango suma +1 dado del Tipo de su arma',
    duelo: {objetivo: 'aliado', conmigo: true, tira: '', contra: [], alcance: 'rango', efectos: [{nombre: 'Arma bendecida'}]}});
  H('Bendición', 'B', 'hd', 'a', 4, tA('Bendice a un aliado: +1 de Daño y +2 de Defensa 3 turnos (a mano).', 2));
  H('Escudar aliado', 'T', 'hdc', 'at', 3, tA('Un aliado adyacente gana +3 de Defensa 2 turnos (a mano).', 2));
  H('Orden de ataque', 'B', 'hd', 'a', 3, tA('Un aliado puede atacar sin gastar No2 este turno (a mano).', 2));
  H('Formación', 'BT', 'hdc', 'a', 4, tA('Los aliados adyacentes ganan +2 de Defensa 3 turnos (a mano).', 2));
  H('Compartir fuerza', 'BC', 'a', 'a', 4, tA('Cede parte de su vitalidad: un aliado recupera 2d6 de vida y el creep pierde 1d6 (a mano).', 2));
  H('Redoble de tambores', 'B', 'd', 'a', 3, tA('Un ritmo de guerra: los aliados cercanos ganan +1 No2 este turno (a mano).', 2));
  H('Señal de retirada', 'M', 'hd', 'a', 3, tA('Ordena replegarse: los aliados cercanos se mueven 2 casilleros gratis (a mano).', 2));
  H('Resurgir', 'C', 'pm', 'at', 6, cU('Al borde de caer, se aferra a la vida y recupera vida.', 3, 7));
  H('Alarma', 'B', 'bhd', 'a', 2, tA('Da la alarma: los aliados cercanos se ponen en guardia (a mano).', 1));

  /* ================= DEBUFF (sobre otros: a mano) ================= */
  // 🎯 Auditada (dueño, 2026-10-26; el Debuffer, el Punto débil de la clase: «que sea algo que se llame aguja siniestra. Es un D6 que se esquiva con evasión,
  // pero es daño directo, no se resiste con defensa mágica y da esta debilidad»): su PdG.Esp contra la Evasión de un rival en su Rango; si pega, 1d6 siniestro
  // directo (no lo frena la Defensa especial; sí la Res. siniestro; la identidad: Herida sombría) y Punto débil 2 turnos (−1 a todas las resistencias a
  // crítico). Costo de Claude, como la Aguja del desamparo: 2 No2 y 3 SP, o cooldown 3.
  H('Aguja siniestra', 'X', '*', 'x', 3, {detalle: 'Le clava una aguja de sombra a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo. Si pega, 1d6 de daño siniestro directo (no lo frena la Defensa especial; sí la Res. siniestro; si entra, Herida sombría: no se cura hasta el final de su próximo turno) y queda con Punto débil 2 turnos: −1 a su Resistencia a crítico contra todos los Tipos, así que los críticos le entran más fácil.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; 1d6 siniestro directo y Punto débil 2 turnos (−1 a las resistencias a crítico)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '1d6', danoDirecto: true, tipoDano: 'siniestro', efectos: [{nombre: 'Punto débil'}]}});
  // 🌑 Auditada (dueño, 2026-10-26; el Debuffer, «debilitar», la Maldición debilitante de la clase: «vamos con la maldición debilitante»): reemplaza a la
  // vieja Debilitar (a mano; también sacada de `APLICA` en creeps-base.js). Su PdG.Esp contra la Res.Esp de un rival en su Rango; si gana, 1d6 siniestro
  // (el elemento del Debuffer: deja Herida sombría), Debilitado 2 turnos (−1 a todas sus tiradas, acumulable) y Lento 2 turnos. Costo de Claude.
  H('Maldición debilitante', 'X', '*', 'x', 3, {detalle: 'Le echa una maldición que lo debilita a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo. Si gana, 1d6 de daño siniestro (lo frenan la Defensa especial y la Res. siniestro; si entra, Herida sombría: no se cura hasta el final de su próximo turno), queda Debilitado 2 turnos (−1 a todas sus tiradas; otra vez, −1 más) y Lento 2 turnos (el primer casillero que mueve en cada turno le cuesta el doble de No2).',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; 1d6 siniestro, Debilitado 2 turnos (−1 a todo, acumulable) y Lento 2 turnos',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: true, danoFormula: '1d6', tipoDano: 'siniestro',
      efectos: [{nombre: 'Debilitado'}, {nombre: 'Lento', turnos: 2}]}});
  // ⛈ Auditada (dueño, 2026-10-26; Debuffer, la Maldición tormentosa de clase para creeps, el 19 del rol: «vamos con la maldición tormentosa»): su PdG.Esp
  // contra la Res.Esp de un rival en su Rango; Atormentado 3 turnos (acumulable) y, un escalón arriba de la de clase, 1d6 siniestro. Costo de Claude: 2 No2
  // y 5 SP (el SP del original), o cooldown 3.
  H('Maldición tormentosa', 'DX', '*', 'x', 3, {detalle: 'Le echa una maldición tormentosa a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo. Si gana, 1d6 de daño siniestro (lo frenan la Defensa especial y la Res. siniestro) y queda Atormentado 3 turnos: cada acción que le cuesta No2 le saca vida al pagarla (lo que costó menos 1) y pierde 1 de vida cada 2 casillas que se mueve. Acumulable: otra vez, +1 a cada cosa y vuelve a durar 3 turnos.',
    no2: 2, spCosto: 5, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; 1d6 siniestro y Atormentado 3 turnos (cada acción con No2 le saca vida; moverse también)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: true, danoFormula: '1d6', tipoDano: 'siniestro',
      efectos: [{nombre: 'Atormentado', polaridad: 'debuff'}]}});
  // 😮‍💨 Auditada (dueño, 2026-10-26; Debuffer, «drenar No2», el 20 del rol: «vamos con robar el aliento»; «va sin tope»): su PdG.Esp contra la Res.Esp
  // de un rival en su Rango; 1d6 siniestro y pierde 2 No2 + la diferencia entre las tiradas, sin tope (nunca baja de 0); en 0, Sentado (el «Pierde No2»
  // del Sonic Boom, js/13). Costo de Claude: 2 No2 y 3 SP, o cooldown 3.
  H('Robar el aliento', 'DX', '*', 'x', 3, {detalle: 'Le roba el aliento a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo. Si gana, 1d6 de daño siniestro (lo frenan la Defensa especial y la Res. siniestro) y pierde 2 No2 más la diferencia entre las tiradas (nunca baja de 0); si se queda sin No2, cae Sentado.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; 1d6 siniestro y pierde 2 No2 + la diferencia (en 0, Sentado)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: true, danoFormula: '1d6', tipoDano: 'siniestro',
      efectos: [{nombre: 'Pierde No2', no2: 2, no2Dif: true, no2Sentado: true}]}});
  // 🛡💀 Auditada (dueño, 2026-10-24; el Debuffer, «Maldición de la coraza»): reemplaza a la vieja Maldición (a mano). Su PdG.Esp contra la Res.Esp
  // de un rival en su Rango; si gana, Coraza maldita (−2 Defensa y −2 Defensa especial, 3 turnos): todos le pegan más. 2 No2 y 3 SP, o cooldown 3.
  H('Maldición de la coraza', 'X', '*', 'gx', 3, {detalle: 'Le maldice la armadura a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo; si gana, queda con Coraza maldita (−2 a su Defensa y −2 a su Defensa especial durante 3 turnos, contra todos).',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; si gana, −2 Defensa y −2 Defensa especial 3 turnos',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: false, efectos: [{nombre: 'Coraza maldita'}]}});
  // 🏜 Auditada (dueño, 2026-10-24: «una maldición que anule regeneración de HP y SP»; «se resiste con Resistencia Especial; sólo corta las regeneraciones
  // propias, no las externas»): su PdG.Esp contra la Res.Esp de un rival en su Rango; si gana, Sequía 3 turnos. Costo como la Maldición de la coraza.
  H('Maldición de la sequía', 'X', '*', 'gx', 3, {detalle: 'Lo seca por dentro: tira su Probabilidad de Golpe especial contra la Resistencia especial de un rival dentro de su Rango; si gana, queda con Sequía 3 turnos: no recupera vida ni SP por sí mismo al empezar el turno (sus pasivas de regeneración, la de su equipo, su SP Regen). Lo que le dan otros (una cura, la Regeneración de un aliado) entra igual.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; si gana, Sequía 3 turnos (no recupera vida ni SP propios)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: false, efectos: [{nombre: 'Sequía'}]}});
  // 🪡 Auditada (dueño, 2026-10-24; el Debuffer, «Exponer», con una vuelta: «un proyectil mágico que si pega deja expuesto; un poquito de daño con un
  // poquito de debuff»; «un dado de 6 de daño directo, se esquiva con evasión»): su PdG.Esp contra la Evasión de un rival en su Rango; si pega, 1d6 arcano
  // directo (no lo frena la Defensa especial) y Expuesto hasta que empiece el próximo turno del objetivo. Prepara el golpe de los demás. Daño fijo (no suma
  // el Ef.Esp, P216): costo como la Maldición de la coraza.
  H('Aguja del desamparo', 'DX', '*', 'gx', 3, {detalle: 'Le clava una aguja de energía a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 1d6 de daño arcano directo (no lo frena la Defensa especial) y lo deja Expuesto hasta que empiece su próximo turno: su Evasión vale la mitad y no puede reaccionar con nada que cueste No2 (ni Parry, ni Bloqueo, ni ataque de oportunidad, ni dodge roll). Abre la puerta para que los demás le peguen.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; si pega, 1d6 arcano directo y Expuesto hasta su próximo turno',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '1d6', danoDirecto: true, tipoDano: 'arcano', efectos: [{nombre: 'Expuesto'}]}});
  // 🧿 Auditada (dueño, 2026-10-25; el Debuffer, «Disipar»: «el usuario de disipar elige cuál quitar»): su PdG.Esp contra la Res.Esp de un rival en su
  // Rango; si gana, le saca UNO de sus estados buenos, el que elija quien lo usa (el GM, para un creep: js/13). No toca lo que sale solo del equipo o de
  // las pasivas. Costo como la Maldición de la coraza (propuesta de Claude).
  // 🤐 Auditada (dueño, 2026-10-25; el Debuffer, «palabra de silencio»: «más que palabra de silencio, un skill tipo el estandarte, pero al revés. Un tótem
  // de silencio… que en un área de diámetro 7 no permita utilizar ningún skill que cueste SP. Aliados no, solo a rivales, con 10 por nivel del caster»):
  // el token del Estandarte de guerra (vtt-hexgrid/js/73) con `estandarte.silencio`; a sus rivales en el aura, Combatiente.preguntaSilencio les avisa
  // (y deja seguir, como el estado Silencio). Costo y cooldown propuestos por Claude, los del Estandarte: 2 No2 y 4 SP, o cooldown 4 desde el arranque.
  H('Tótem de silencio', 'K', '*', 'x', 4, {detalle: 'Clava un tótem de silencio en una casilla libre dentro de su Rango. Mientras siga en pie, sus rivales a 3 casillas o menos (diámetro 7) no pueden usar habilidades que cuestan SP (se les avisa; la mesa puede dejarlos igual). A sus aliados no los toca. El tótem tiene 10 de vida por nivel del creep y ninguna defensa ni resistencia (no esquiva): se le pega como a cualquier rival y, al romperse, el silencio se termina. Uno por creep: si clava otro, el anterior se va.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'clava un tótem: sus rivales a 3 casillas no pueden usar habilidades que cuestan SP hasta que lo rompan',
    disponibleAlInicio: true, estandarte: {radio: 3, silencio: true, vidaPorNivel: 10}});   // cooldown 4, pero no arranca el combate en cooldown (como el Estandarte)
  H('Disipar', 'X', '*', 'gx', 3, {detalle: 'Deshace la magia que protege a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo; si gana, le saca uno de sus estados buenos (un escudo, una bendición, un arma encantada…), el que elija quien lo usa. Lo que da su equipo o sus pasivas no se puede sacar.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; si gana, le saca un estado bueno a elección',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: false, efectos: [{nombre: 'Disipar', disipar: true}]}});
  // 🧪 Auditada (dueño, 2026-10-25; el Debuffer, «Corroer»: «un ataque de daño ácido que rompe armadura»): su PdG.Esp contra la Evasión de un rival en su
  // Rango; si pega, 2d6 de ácido (lo frenan la Defensa especial y la resistencia al ácido) y la regla del ácido de siempre (la Carga Elemental, el Arma
  // ácida): Armadura rota 1, y una más por cada 5 de daño que entra. Daño y costo propuestos por Claude: como la Aguja del desamparo.
  H('Corroer', 'DX', 'hdpemc', 'gx', 3, {detalle: 'Le arroja ácido a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 de daño ácido (lo frenan la Defensa especial y la resistencia al ácido) y le carcome la armadura: Armadura rota 1, y una más por cada 5 de daño que le entra.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; si pega, 2d6 ácido y Armadura rota (1, y una más cada 5 de daño que entra)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d6', tipoDano: 'ácido', porDano: {estado: 'Armadura rota', cada: 5, mas1: true}}});
  // 🧪 La versión bestia de Corroer (dueño, 2026-10-25: «el Escupitajo ácido puede ser el nombre para la versión no humanoide/bestia»): la misma mecánica
  // y los mismos números. Reemplaza al viejo Escupitajo ácido (a mano: «pierde 1 punto de Defensa 2 turnos»).
  H('Escupitajo ácido', 'DX', 'ba', 'xr', 3, {detalle: 'Le escupe ácido a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Evasión del objetivo; si pega, 2d6 de daño ácido (lo frenan la Defensa especial y la resistencia al ácido) y le carcome la armadura: Armadura rota 1, y una más por cada 5 de daño que le entra.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Evasión; si pega, 2d6 ácido y Armadura rota (1, y una más cada 5 de daño que entra)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['eva'], alcance: 'rango', dano: true, danoFormula: '2d6', tipoDano: 'ácido', porDano: {estado: 'Armadura rota', cada: 5, mas1: true}}});
  // 👁 Auditada (dueño, 2026-10-25; el Debuffer, «los sentidos», Cegar: «vamos con esa»): reemplaza a la vieja Ceguera (a mano; también sacada de `APLICA`
  // en creeps-base.js). Su PdG.Esp contra la Res.Esp; si gana, 2d4 arcano y Ceguera 1 turno (fuerte: por eso 1). Costo propuesto por Claude.
  H('Cegar', 'X', 'hdea', 'x', 3, {detalle: 'Le tira polvo o un fogonazo a los ojos a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo. Si gana, 2d4 de daño arcano (lo frena la Defensa especial) y queda con Ceguera 1 turno: ve solo a 2 casillas y su Probabilidad de Golpe (también la especial) vale la mitad.',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; 2d4 arcano y Ceguera 1 turno',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: true, danoFormula: '2d4', tipoDano: 'arcano', efectos: [{nombre: 'Ceguera', turnos: 1}]}});
  H('Ralentizar', 'X', 'hdea', 'x', 3, tA('El objetivo pierde 2 No2 en su próximo turno (a mano).', 2));
  // 😱 Auditada (dueño, 2026-10-25; el Debuffer, «control mental», Grito de pánico: «que sea tres casillas alrededor, y que sea daño arcano»): la onda de
  // los gritos (radio 3, a sus rivales, no a él), su PdG.Esp contra la Res.Mt de cada uno (es miedo: va contra la mente; no se esquiva); al que pierde,
  // 1d6 arcano y Miedo hasta su próximo turno (el preset). Costo propuesto por Claude: 2 No2 y 4 SP, o cooldown 3.
  H('Grito de pánico', 'XA', '*', 'x', 3, {detalle: 'Un grito que hiela la sangre: a sus rivales a 3 casillas o menos (no a sus aliados) les tira su Probabilidad de Golpe especial contra la Resistencia mental de cada uno. Al que pierde, 1d6 de daño arcano (lo frena la Defensa especial) y queda con Miedo hasta que empieza su próximo turno: cada casillero que se mueve hacia él le cuesta 2 No2, y todo lo que haga contra él va con −1 a la probabilidad de golpe y −1 al daño.',
    no2: 2, spCosto: 4, auditada: true, ataqueTxt: 'onda de 3 casillas: su PdG.Esp contra la Res.Mt de cada rival; 1d6 arcano y Miedo',
    duelo: {objetivo: 'onda', radio: 3, tira: 'pdgmg', contra: ['resm'], dano: true, danoFormula: '1d6', tipoDano: 'arcano', efectos: [{nombre: 'Miedo'}]}});
  H('Miedo', 'XK', 'bdma', 'x', 4, tA('Si el objetivo falla Res.Mt huye de él 2 turnos (a mano).', 2));
  H('Intimidar', 'X', 'bhd', 'x', 2, tA('Una mirada amenazante: el objetivo pierde 1 de Daño 2 turnos (a mano).', 1));
  // 🔨 Auditadas (dueño, 2026-10-21; choque pesado, «partir la armadura»): la común y la fuerte, cada una con su versión de bestia.
  // 🤺 Auditada (dueño, 2026-10-21; choque pesado, «desarmar»): Flash en el paso del Bloqueo (atacando o defendiendo). 3 SP (6 en turno ajeno) o
  // cooldown 3. Desde el 2026-10-22 (dueño): no se declara en el turno; se elige en el Bloqueo que sigue a un Parry ganado; defendiendo, solo si
  // paró con el arma, no con el escudo. Le puede sacar al otro un arma o un escudo. Una bestia también desarma (lo natural no se le cae). Se elige
  // adentro del paso 3 del duelo (comun/duelo.js, vtt-hexgrid/js/62).
  H('Desarmar', 'K', '*', 'mt', 3, {detalle: 'FLASH. Le saca al otro lo que tiene en la mano —un arma o un escudo—, que sale volando 2 casillas (a una libre a la que llegue volando: lo sólido la frena, las personas no; si no hay, al anillo de adentro o de afuera) y queda en el piso. No se declara en el turno: la ocasión se da solo cuando hay un Parry y el Parry gana, en el paso del Bloqueo. Atacando, en vez de la Fuerza del golpe; defendiendo, en vez de bloquear, y solo si paró con el arma (no con el escudo). Una bestia también puede, con sus garras o colmillos. La tirada es la misma; si gana, eso reemplaza el resultado de siempre (sin la mitad del daño, sin contraataque); si pierde, lo de siempre. Lo natural no se cae. En turno ajeno cuesta el doble. ⚙ Automatizado: el botón «🤺 Desarmar» aparece adentro del paso 3 del duelo, al lado de la tirada.',
    no2: 0, spCosto: 3, auditada: true, desarmar: true, ataqueTxt: 'en el Bloqueo: si gana, el otro pierde lo que tiene en la mano (vuela 2 casillas)'});
  H('Romper armadura', 'DX', 'hdc', 'mt', 3, aA(`Un golpe a las juntas: un ataque con su arma que, si pega, deja Armadura rota 1. ${AR_NOTA}`,
    {}, 'un ataque con su arma; si pega, Armadura rota 1', 2, AR(1)));
  H('Arrancar la coraza', 'DX', 'b', 'mt', 3, aA(`Clava garras o colmillos en la armadura y tira: un ataque con su arma que, si pega, deja Armadura rota 1. ${AR_NOTA}`,
    {}, 'un ataque con su arma; si pega, Armadura rota 1', 2, AR(1)));
  H('Golpe demoledor', 'DX', 'hdc', 'mt', 4, aA(`Un golpe con todo el peso: un ataque con su arma con +1 dado de su arma que, si pega, deja Armadura rota doble (2 acumulaciones). ${AR_NOTA}`,
    {dados: 1}, 'un ataque con su arma con +1 dado; si pega, Armadura rota doble', 4, AR(2)));
  H('Mandíbula trituradora', 'DX', 'b', 'mt', 4, aA(`Muerde y tritura la armadura: un ataque con su arma con +1 dado de su arma que, si pega, deja Armadura rota doble (2 acumulaciones). ${AR_NOTA}`,
    {dados: 1}, 'un ataque con su arma con +1 dado; si pega, Armadura rota doble', 4, AR(2)));
  H('Veneno', 'X', 'bpdh', 'x', 3, tA('Envenena al objetivo: pierde 1d4 de vida por turno 3 turnos (a mano).', 2));
  H('Pudrición', 'X', 'pm', 'x', 4, tA('El objetivo queda podrido: −2 de Defensa y −1 de Daño 3 turnos (a mano).', 2));
  // 😵 Auditada (dueño, 2026-10-21; el Debuffer, control mental): su PdG.Esp contra la Res.Mt de un rival en su Rango; si gana, Confusión 1 turno (el mapa la
  // tira: js/20). 2 No2 y 3 SP, o cooldown 4.
  // 🔥❄⚡🧪☠ Auditadas (dueño, 2026-10-21; el Support, «arma elemental»): +1d4 del elemento por golpe 3 turnos y lo de cada elemento (lo de la Carga
  // Elemental); 2 No2 y 2 SP, o cooldown 3. Una por elemento: cada creep support lleva la suya. Sirven igual con armas naturales.
  H('Arma ígnea', 'B', '*', 'a', 3, aE('Arma ígnea', 'de fuego, ×1,5 (para arriba)'));
  H('Arma helada', 'B', '*', 'a', 3, aE('Arma helada', 'de hielo y deja Escarcha 1 (una más cada 5 de daño de hielo que entra)'));
  H('Arma eléctrica', 'B', '*', 'a', 3, aE('Arma eléctrica', 'eléctrico, que salta al rival más cercano (4 casillas o menos) con la mitad de lo que entró, y 20 % de Parálisis 1 turno al golpeado'));
  H('Arma ácida', 'B', '*', 'a', 3, aE('Arma ácida', 'de ácido y deja Armadura rota 1 (una más cada 5 de daño de ácido que entra)'));
  H('Arma venenosa', 'B', '*', 'a', 3, aE('Arma venenosa', 'tóxico y deja Veneno: 1 stack cada 3 de daño tóxico que entra (mínimo 1)'));
  // 🧿 Auditada (dueño, 2026-10-21; el Debuffer, «maleficios»): el Enyetar de los personajes, para creeps, con Flash (en turno ajeno, el doble) y el botón
  // 🧿 del GM (vtt-hexgrid/js/60). Los números, los del Enyetar: 5 SP (sin No2) o cooldown 3.
  H('Mal de ojo', 'X', '*', 'gx', 3, {detalle: 'FLASH. Después de que un personaje tira (a la vista, dentro de su Rango), le echa el mal de ojo: tira su Probabilidad de Golpe especial contra la Resistencia especial del personaje; si gana, esa tirada se repite y se queda con la más baja, y el duelo se vuelve a resolver. Una vez por tirada. En turno ajeno cuesta el doble. El GM la usa desde el botón 🧿 (arriba, o al costado del duelo abierto).',
    no2: 0, spCosto: 5, auditada: true, malDeOjo: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; si gana, esa tirada se repite y queda la peor',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: false, efectos: [{nombre: 'Mal de ojo', polaridad: 'debuff'}]}});
  H('Confusión', 'XK', '*', 'gx', 4, {detalle: 'Le enreda la mente: tira su Probabilidad de Golpe especial contra la Resistencia mental de un rival dentro de su Rango; si gana, queda Confundido 1 turno (antes de su primera acción tira 1d4: 1 decide el GM, 2 pierde el turno, 3 actúa contra un objetivo al azar, 4 actúa normal).',
    no2: 2, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Mt del objetivo; si gana, Confusión 1 turno',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resm'], alcance: 'rango', dano: false, efectos: [{nombre: 'Confusión', turnos: 1}]}});
  H('Susurros', 'X', 'ma', 'gx', 3, tA('Voces en su cabeza: el objetivo pierde 2 de Res.Mt 3 turnos (a mano).', 2));
  H('Drenar energía', 'X', 'ma', 'x', 4, tA('El objetivo pierde 2 No2 en su próximo turno y el creep gana 1 (a mano).', 2));
  H('Marca de presa', 'X', 'b', 'ex', 3, tA('Marca al objetivo: recibe +2 de daño de los ataques del creep 3 turnos (a mano).', 2));
  H('Desarmar', 'XK', 'hd', 'mx', 4, tA('Golpea la mano del objetivo: suelta el arma y tarda 1 No2 en recogerla (a mano).', 2));
  H('Hacer tropezar', 'XK', '*', 'ex', 2, tA('Le mete el pie: el objetivo cae al piso si falla Agilidad (a mano).', 1));
  // 🕸 Las redes (dueño, 2026-10-21: «las redes sí me interesan… alguna criatura puede escupir una red»): como la Red Nerubian, desde el creep.
  H('Tela de araña', 'XK', 'b', 'x', 4, {detalle: 'Escupe tela pegajosa: tira su Probabilidad de Golpe contra la Evasión del objetivo, dentro de su Rango; si gana, el objetivo queda Inmovilizado (hasta 3 turnos). Al empezar su turno tira Fuerza contra el Efecto especial de la criatura, gratis: si llega, se suelta. Un aliado pegado puede ayudarlo: al tirar para zafarse se le pregunta y, si se suma, las dos Fuerzas se suman (1 No2 cada uno); o en su propio turno, solo (1 No2, su Fuerza).', no2: 2, auditada: true, spCosto: 3, ataqueTxt: 'su Probabilidad de Golpe contra la Evasión; si gana, Inmovilizado (se suelta con Fuerza al empezar su turno)', duelo: {objetivo: 'enemigo', tira: 'pdg', contra: ['eva'], alcance: 'rango', dano: false, efectos: [{nombre: 'Inmovilizado', turnos: 3, soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'dmgesp', no2: 1, alEmpezar: true, ayuda: true, visual: 'telarana'}}]}});
  H('Nube de esporas', 'XA', 'p', 'x', 4, tA('Suelta esporas en flor de diámetro 3 (7 casillas): quienes las respiran pierden 1 de Daño 2 turnos (a mano).', 2));
  H('Rugido aturdidor', 'XK', 'b', 'x', 4, tA('Un rugido ensordecedor: los adyacentes quedan Pajaritos hasta el final de su turno (a mano).', 3));
  H('Hechizo de lentitud', 'X', 'dega', 'gx', 3, tA('Los pies del objetivo pesan: pierde 1 No2 por turno 2 turnos (a mano).', 2));
  H('Quemadura', 'X', 'e', 'gx', 3, tA('El objetivo arde: pierde 1d4 de vida por turno 2 turnos (a mano).', 2));
  H('Escarcha', 'X', 'e', 'gx', 3, tA('Congela las piernas del objetivo: −2 No2 su próximo turno (a mano).', 2));
  H('Oxidar', 'X', 'ca', 'x', 3, tA('Un chorro corrosivo: el arma del objetivo hace −2 de daño 3 turnos (a mano).', 2));
  H('Desmoralizar', 'X', 'hdm', 'x', 3, tA('Palabras crueles: el objetivo pierde 2 de Res.Mt y 1 de Daño 2 turnos (a mano).', 2));
  H('Contagio', 'X', 'bm', 'x', 5, tA('Una enfermedad sucia: el objetivo pierde 1 de Con mientras dure el combate (a mano).', 3));
  H('Robar suerte', 'X', 'am', 'x', 4, tA('El objetivo repite su próxima tirada exitosa y toma la peor (a mano).', 2));

  /* ================= CONTROL / MOVILIDAD ================= */
  H('Cargar', 'M', 'b', 'me', 2, tA('Corre hacia un enemigo hasta 3 casilleros en línea recta (a mano).', 1));
  // (El «Salto» viejo, solo de movimiento y a mano, lo reemplaza el Salto auditado: 2026-10-21.)
  H('Retirada táctica', 'M', 'hd', 'r', 3, tA('Se aleja 2 casilleros sin provocar (a mano).', 1));
  H('Teletransporte corto', 'M', 'ega', 'g', 4, tA('Aparece en un casillero libre a 3 casilleros de distancia (a mano).', 2));
  H('Volar en picada', 'DM', 'b', 'e', 4, zO('Cae desde arriba sobre el objetivo (a mano el movimiento).', 3, 'M'));
  H('Excavar', 'M', 'b', 'e', 4, tA('Se entierra y aparece 3 casilleros más allá (a mano).', 2));
  H('Trepar', 'M', 'bp', 'e', 2, tA('Sube por una pared o un árbol sin costo extra (a mano).', 1));
  // Trampa de verdad (2026-09-24): deja una trampa oculta al lado del token y quien la pisa queda Inmovilizado (APLICA en creeps-base.js).
  H('Trampa de raíces', 'K', 'p', 'x', 4, tS('Deja una trampa de raíces en una casilla adyacente: quien la pise queda Inmovilizado 2 turnos.', 2), 'trampas');
  // 🕸 Las redes (dueño, 2026-10-21: «las redes sí me interesan… alguna criatura puede escupir una red»): como la Red Nerubian, desde el creep.
  H('Red', 'K', 'hd', 'x', 4, {detalle: 'Lanza una red: tira su Probabilidad de Golpe contra la Evasión del objetivo, dentro de su Rango; si gana, el objetivo queda Inmovilizado (hasta 3 turnos). Al empezar su turno tira Fuerza contra la Destreza de quien la lanzó, gratis: si llega, se suelta. Un aliado pegado puede ayudarlo: al tirar para zafarse se le pregunta y, si se suma, las dos Fuerzas se suman (1 No2 cada uno); o en su propio turno, solo (1 No2, su Fuerza).', no2: 2, auditada: true, spCosto: 3, ataqueTxt: 'su Probabilidad de Golpe contra la Evasión; si gana, Inmovilizado (se suelta con Fuerza al empezar su turno)', duelo: {objetivo: 'enemigo', tira: 'pdg', contra: ['eva'], alcance: 'rango', dano: false, efectos: [{nombre: 'Inmovilizado', turnos: 3, soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'des', no2: 1, alEmpezar: true, ayuda: true, visual: 'red'}}]}});
  H('Congelar', 'K', 'e', 'gx', 5, tA('Encierra al objetivo en hielo: pierde su próximo turno si falla Res.Mt (a mano).', 3));
  H('Aturdir', 'K', 'hdb', 'mx', 5, tA('Golpe en la sien: el objetivo queda Stun 1 turno si falla Res.Mt (a mano).', 3));
  // 💨 Hit and run (dueño, 2026-10-21, «picar y alejarse»; el choque liviano, una sola para bestias y humanoides): pega y se aleja hasta 2 casilleros,
  // gratis (sin No2) y sin oportunidad.
  H('Hit and run', 'DM', '*', 'e', 3, aA('Pica y se aleja: un ataque con su arma; pegue o no, después se aleja hasta 2 casilleros, gratis (sin No2) y sin dar ataque de oportunidad.',
    {}, 'va al duelo como un ataque; después, el cartel para alejarse hasta 2 casilleros gratis y sin ataque de oportunidad', 2, [], {alejarse: 2}));
  // 🗡 Auditada (dueño, 2026-10-26; Choque liviano, «apuestas», el Degollar del Asalto: «vamos con Degollar»): un ataque con su arma con +4 PdG, +7 al
  // daño, Crítico frecuente +1 y potente +1; pegue o no, termina su turno y pasa al final del orden (`terminaTurno`, vtt-hexgrid/js/04) y queda Expuesto
  // hasta su próximo turno (el `efecto` sobre sí, al usarla). Costo de Claude: el ataque y 4 SP, o cooldown 4.
  H('Degollar', 'D', 'hd', 'e', 4, {...aA('Un tajo devastador: un ataque con su arma con +4 a la Probabilidad de Golpe, +7 al daño, Crítico frecuente +1 y Crítico potente +1. Pegue o no, termina su turno y pasa al final del orden de turnos, y queda Expuesto hasta que empieza su próximo turno: su Evasión a la mitad y sin poder reaccionar con nada que cueste No2.',
    {pdg: 4, fijo: 7, critBono: 1, critpotBono: 1}, 'va al duelo como un ataque con +4 PdG, +7 al daño y +1 a los dos críticos; termina su turno, pasa al final del orden y queda Expuesto', 4, [], {terminaTurno: true}),
    efecto: {nombre: 'Expuesto', turnos: 1, polaridad: 'debuff'}});
  // 💨 Auditada (dueño, 2026-10-26; Choque liviano, el Dash del Asalto: «el costo de nitros de ataque solo se cobra si el dash incluye un ataque… +2 al daño
  // al golpe… que atraviese un solo objetivo… si el ataque del dash es parreado o bloqueado con éxito, se interrumpe el movimiento: se queda en el casillero
  // anterior al objetivo»; el mismo día: «el parry se tira de manera defensiva… cambiarle el +2 al daño por un +2 a la probabilidad de golpe… y +1 al bloqueo»): el
  // camino y el golpe los hace el mapa (`dash`, vtt-hexgrid/js/76); el golpe, +2 PdG y +1 a la Fuerza del golpe (contra el Bloqueo). 1 No2 (+ lo de un ataque si
  // le pega a alguien) y 3 SP, o cooldown 3.
  H('Dash', 'DM', 'hd', 'e', 3, {detalle: 'Avanza 3 casillas en línea recta, gratis y sin dar ataques de oportunidad. Puede atravesar a un rival: avanza una casilla más y le pega al pasar (un ataque con su arma con +2 a la Probabilidad de Golpe y +1 a la Fuerza del golpe contra el Bloqueo; cuesta lo de un ataque). Si el rival lo para con Parry o lo bloquea, el Dash se corta: se queda en la casilla de antes de él. Lo frenan los Sólidos, las paredes y un segundo token.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'avanza 3 en línea recta; atraviesa a un rival y le pega con +2 PdG y +1 a la Fuerza del golpe, y sigue una casilla más (si lo para, se queda antes)',
    dash: {casillas: 3},
    duelo: {modo: 'arma', objetivo: 'enemigo', x: 'nitros', arma: {pdg: 2, dados: 0, fijo: 0, fuerza: 1}, efectos: []}});
  // 🤺 Auditada (dueño, 2026-10-26; Choque liviano, «finta»: la propuesta de Claude, «y además ponerle +1 al crítico frecuente y +1 al potente»): un ataque
  // con su arma con +2 al daño, Crítico frecuente +1 y potente +1, que no se puede parar (`sinParry`: ni Parry ni, por eso, Bloqueo; solo esquivar). Para
  // humanoides. Costo de Claude: el ataque y 2 SP, o cooldown 2.
  H('Finta', 'D', 'hd', 'e', 2, aA('Amaga para un lado y pega por el otro: un ataque con su arma con +2 al daño, Crítico frecuente +1 y Crítico potente +1, que no se puede parar: el rival no puede usar Parry (ni, por eso, Bloqueo) contra este golpe; solo le queda esquivarlo.',
    {fijo: 2, critBono: 1, critpotBono: 1, sinParry: true}, 'va al duelo como un ataque con +2 al daño y +1 a los dos críticos, que no se puede parar', 2, []));
  // 👁 Auditada (dueño, 2026-10-26; Choque liviano, «buscar el crítico», el Ojo de asesino del Asalto: «al del creep le sumaría lo mismo que al del asalto»;
  // «no es un estado… es algo que se le suma a un ataque»): un ataque con su arma con +1 PdG, +2 al daño, Crítico frecuente +1 y potente +1. Costo el de la
  // clase: el ataque y 2 SP, o cooldown 2.
  H('Ojo de asesino', 'D', '*', 'e', 2, aA('Fija la mirada en el punto débil y pega: un ataque con su arma con +1 a la Probabilidad de Golpe, +2 al daño, Crítico frecuente +1 y Crítico potente +1.',
    {pdg: 1, fijo: 2, critBono: 1, critpotBono: 1}, 'va al duelo como un ataque con +1 PdG, +2 al daño y +1 a los dos críticos', 2, []));
  // 💨 Auditada (dueño, 2026-10-26; Choque liviano, «desaparecer en la pelea»: «me gusta mucho al punto de que la pondría en la clase también. Que se mueva
  // hasta 3 casillas gratis»; «3 SP y 3 nitros»): la niebla a sus pies (diámetro 3, 1 turno), Sigilo aunque lo vean y hasta 3 casillas gratis sin
  // oportunidad (vtt-hexgrid/js/57 bombaDeHumo). Cooldown 3.
  H('Bomba de humo', 'M', 'hd', 'e', 3, {detalle: 'Revienta una bomba de humo a sus pies: una nube de diámetro 3 (7 casillas) por 1 turno, que tapa la vista desde afuera; entra en Sigilo aunque lo estén mirando (el que está pegado, adentro del humo, lo sigue viendo y lo descubre); y se mueve hasta 3 casillas gratis, sin ataques de oportunidad. El combo: en el próximo turno, la puñalada por la espalda.',
    no2: 3, spCosto: 3, auditada: true, ataqueTxt: 'humo de diámetro 3 a sus pies (1 turno), Sigilo y hasta 3 casillas gratis sin oportunidad', bombaHumo: {radio: 1, turnos: 1, mover: 3}}, 'sigilo,niebla y visión');
  // 😤 Auditada (dueño, 2026-10-26; Choque liviano, «golpe desesperado», apuestas ✦): un ataque con su arma que crece cuanto menos vida le queda (vtt-hexgrid/js/69):
  // con más de la mitad, +1 a los dos críticos y +1 al daño; con la mitad o menos, +2, +2 y +3; con un cuarto o menos, además +2 PdG. Lo de un ataque y 3 SP,
  // o cooldown 2.
  H('Golpe desesperado', 'D', '*', 'e', 2, aA('Un golpe con lo que le queda: un ataque con su arma que pega más cuanto menos vida tiene. Con más de la mitad de la vida: +1 a Crítico frecuente y a Crítico potente y +1 al daño. Con la mitad o menos: +2 a los dos críticos y +3 al daño. Con un cuarto o menos: además +2 a la Probabilidad de Golpe.',
    {}, 'va al duelo como un ataque; según su vida, +1/+1/+1, +2/+2/+3 o, con un cuarto o menos, además +2 PdG', 3, [], {desesperado: true}));
  // 🦘 El Salto (dueño, 2026-10-21): salta hasta 3 casilleros (por encima de hasta 2) y cae al lado del objetivo, sin No2 ni ataque de oportunidad.
  H('Salto', 'DM', '*', 'e', 3, aA('Salta por encima de lo que haya (un salto de 1,5 metros de altura) y cae sobre el objetivo: se desplaza hasta 3 casilleros (salteando hasta 2) hasta quedar al lado, sin No2 ni ataque de oportunidad, y ataca con su arma con +1 a la Probabilidad de Golpe y Crítico frecuente +1. Saltar algo con colisión lo decide la mesa.',
    {pdg: 1, critBono: 1}, 'salta hasta quedar al lado (el mapa) y va al duelo como un ataque con +1 PdG y Crítico frecuente +1', 2, [], {salto: 3}));
  H('Salto aplastante', 'DMK', '*', 'mt', 4, aA('Salta y cae con todo el peso (un salto de 1,5 metros de altura): se desplaza hasta 3 casilleros (salteando hasta 2) hasta quedar al lado del objetivo, sin No2 ni ataque de oportunidad. Al caer, los rivales pegados tiran Res.CC contra su Fuerza: quien no llega queda Sentado. Después ataca con su arma con +2 al daño. Saltar algo con colisión lo decide la mesa.',
    {fijo: 2}, 'salta hasta quedar al lado; los de al lado tiran Res.CC contra su Fuerza o quedan Sentados (el mapa); va al duelo como un ataque con +2 al daño', 3,
    [], {salto: 3, aplasta: true}));
  // 👁 Vigilancia (dueño, 2026-10-21; el rango, una sola para bestias y humanoides): 1 No2 y 2 SP (o cooldown 3); es su ataque del turno. Hasta su próximo turno,
  // el primer rival que se mueva dentro del alcance de su arma, a la vista y con línea de tiro, recibe un disparo (vtt-hexgrid/js/58).
  H('Vigilancia', 'BK', '*', 'r', 3, {detalle: 'Se queda atento con el arma lista (es su ataque del turno): hasta que empiece su próximo turno, el primer rival que se mueva dentro del alcance de su arma, a la vista y con línea de tiro libre, se frena ahí y recibe un disparo con +2 a la Probabilidad de Golpe (un duelo normal, que paga los No2 de un ataque). Quien ya estaba adentro, solo si se mueve. Un solo disparo; si lo deja pasar, sigue vigilando.',
    no2: 1, spCosto: 2, auditada: true, efecto: {nombre: 'Vigilancia'}, anuncio: '{nombre} se pone en vigilancia.'});
  // 🛡 Aguante (dueño, 2026-10-21; uno solo para bestias y humanoides): 1 No2 y 1 SP (o cooldown 3); +2 Defensa y +2 Defensa especial hasta su próximo
  // turno; su próximo ataque suma +1 dado del Tipo de su arma por cada golpe que recibió (1 SP por dado; en modo cooldown, +1 turno de cooldown por dado).
  H('Aguante', 'BT', '*', 'mt', 3, {detalle: 'Se planta y se la banca: +2 a la Defensa y +2 a la Defensa especial hasta que empiece su próximo turno, y cuenta cada golpe que le pega. En su próximo turno, al atacar, su ataque suma +1 dado del Tipo de su arma por cada golpe recibido, hasta su nivel + 1 dados (1 SP por dado; en modo cooldown, +1 turno de cooldown por dado), más los No2 del ataque.',
    no2: 1, spCosto: 1, auditada: true, efecto: {nombre: 'Aguante', mods: {def: 2, armadmg: 2}}, anuncio: '{nombre} se pone en modo aguante.'});
  // 🤼 Los agarres de las bestias (dueño, 2026-10-21: «con y sin daño»): como el Mordisco feroz (vtt-hexgrid/js/54), con «Agarrado».
  H('Agarrón', 'K', 'bpc', 'mt', 3, {detalle: 'Agarra al objetivo sin lastimarlo: tira su Probabilidad de Golpe contra la Evasión; si gana, el objetivo queda Agarrado (no se mueve, y quien lo agarra tampoco). Al empezar su turno tira Fuerza contra la Fuerza de quien lo agarra, gratis; lo suelta al empezar el siguiente turno de quien lo agarró.', no2: 2, auditada: true, spCosto: 2, ataqueTxt: 'su Probabilidad de Golpe contra la Evasión; si gana, Agarrado (se suelta con Fuerza contra su Fuerza)', duelo: {objetivo: 'enemigo', tira: 'pdg', contra: ['eva'], alcance: 1, dano: false, efectos: [{nombre: 'Agarrado', soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'fue', no2: 0, alEmpezar: true}}]}});
  H('Abrazo aplastante', 'DK', 'b', 'mt', 3, aA('Lo atrapa entre los brazos y aprieta: un ataque con su arma; si pega, el objetivo queda Agarrado (no se mueve, y la bestia tampoco). Al empezar su turno tira Fuerza contra la Fuerza de la bestia, gratis; si no se suelta, el apretón le vuelve a hacer el mismo daño. La bestia lo suelta al empezar su siguiente turno.',
    {}, 'va al duelo como un ataque; si pega, deja Agarrado (se suelta con Fuerza contra su Fuerza; si no, recibe el daño otra vez)', 3,
    [{nombre: 'Agarrado', soltar: {stat: 'fue', etq: 'Fuerza', difStat: 'fue', no2: 0, alEmpezar: true, danoFalla: 'golpe'}}]));
  H('Empujón', 'K', '*', 'mt', 2, tA('Empuja al objetivo un casillero (a mano).', 1));
  // (Arrastrar, la vieja a mano: la reemplaza la de la tanda del Choque pesado, 2026-10-27.)
  H('Onda de choque', 'AK', 'ce', 'g', 5, zO('Una onda que empuja a los adyacentes un casillero (a mano).', 4, 'M'));
  H('Grito atronador', 'AK', 'bd', 'x', 5, zO('Un grito que aturde a los adyacentes: pierden 1 No2 (a mano).', 3, 'L'));
  H('Pared de fuego', 'KA', 'e', 'g', 5, tA('Crea una línea de fuego de 3 casilleros que quema a quien la cruce (a mano).', 3));
  H('Terreno difícil', 'K', 'pe', 'x', 4, tA('Convierte una flor de diámetro 3 (7 casillas) en terreno que cuesta doble moverse (a mano).', 2));
  H('Silenciar', 'K', 'ha', 'gx', 4, tA('El objetivo no puede usar habilidades 1 turno si falla Res.Mt (a mano).', 3));
  H('Hipnosis', 'K', 'ma', 'gx', 5, tA('El objetivo queda con la mirada perdida y no se mueve 1 turno si falla Res.Mt (a mano).', 3));

  /* ================= INVOCACIÓN ================= */
  H('Llamar a la manada', 'I', 'b', 'a', 5, tA('Entran 2 bestias más de nivel bajo al combate (a mano).', 3));
  H('Pedir refuerzos', 'I', 'hd', 'a', 6, tA('Llegan 2 aliados de nivel bajo al combate (a mano).', 3));
  H('Levantar muertos', 'I', 'm', 'g', 6, tA('Levanta un esqueleto de nivel bajo que pelea 3 turnos (a mano).', 3));
  H('Enjambre', 'I', 'b', 'x', 4, tA('Un enjambre de bichos aparece y ataca a un objetivo cercano (a mano).', 2));
  H('Brotes', 'I', 'p', 'a', 5, tA('Brotan 2 plantas pequeñas que estorban a los enemigos (a mano).', 3));
  H('Invocar espíritu', 'I', 'ema', 'g', 6, tA('Llama a un espíritu menor que pelea 3 turnos (a mano).', 3));
  H('Clon de sombra', 'I', 'ha', 'e', 5, tA('Crea una copia ilusoria que distrae: el primer ataque contra el creep falla (a mano).', 3));
  H('Barril explosivo', 'I', 'hd', 'r', 4, tA('Coloca un barril que explota si lo golpean, en flor de diámetro 3 (7 casillas) (a mano).', 2));

  /* ================= MIXTAS: DAÑO + CURA / DAÑO + EFECTO ================= */
  H('Mordisco vampírico', 'DC', 'bm', 'me', 3, dC('Muerde y se cura con la sangre.', 2, 'M', 2));
  H('Drenar vida', 'DC', 'ma', 'g', 4, dC('Absorbe vida del objetivo.', 3, 'M', 3));
  H('Toque vampírico', 'DC', 'm', 'g', 2, dC('Un roce que le roba fuerzas.', 1, 'L', 1));
  H('Golpe vigorizante', 'DC', 'hd', 'mt', 3, dC('Golpea y se recupera con la adrenalina.', 2, 'M', 2));
  H('Devorar', 'DC', 'b', 'm', 5, dC('Arranca un bocado enorme y lo traga.', 3, 'H', 3));
  H('Rayo solar', 'DC', 'pe', 'g', 4, dC('Absorbe luz y la devuelve como rayo.', 3, 'M', 2));
  H('Golpe brutal y guardia', 'DT', 'hd', 'mt', 3, zO('Golpea y se cubre: +2 de Defensa este turno (a mano).', 2, 'M'));
  H('Ataque y retirada', 'DM', 'hd', 'e', 3, zO('Golpea y se aleja 2 casilleros (a mano).', 2, 'L'));
  H('Golpe envenenado', 'DX', 'hd', 'ex', 3, zO('Golpe con hoja envenenada: el objetivo queda Envenenado si falla Constitución (a mano).', 2, 'L'));
  H('Descarga de espinas', 'DX', 'p', 'r', 3, zO('Espinas con un veneno suave: el objetivo pierde 1 de Defensa 2 turnos (a mano).', 2, 'L'));
  H('Golpe glacial', 'DX', 'e', 'mg', 3, zO('Un golpe de hielo: el objetivo pierde 1 No2 en su próximo turno (a mano).', 2, 'M'));
  H('Toque abrasador', 'DX', 'e', 'mg', 3, zO('Toque de fuego: el objetivo arde 2 turnos (a mano).', 2, 'M'));
  H('Zarpa oxidante', 'DX', 'ca', 'mx', 3, zO('Una garra corrosiva: el objetivo pierde 1 de Defensa 3 turnos (a mano).', 2, 'L'));
  H('Latigazo', 'DK', 'p', 'r', 2, zO('Un látigo de lianas que jala al objetivo un casillero (a mano).', 1, 'L'));
  H('Pisoteo múltiple', 'DA', 'bc', 'm', 4, zO('Pisotea a todos los adyacentes (a mano).', 3, 'L'));
  H('Disparo perforante', 'D', 'hdc', 'r', 3, zO('Una bala que atraviesa la armadura.', 2, 'M'));
  H('Ráfaga', 'D', 'hdc', 'r', 4, zO('Un chorro de disparos.', 3, 'H'));
  H('Golpe sísmico', 'DA', 'ce', 'mt', 5, zO('Golpea el suelo y hace temblar a los adyacentes (a mano).', 4, 'H'));
  H('Mirada petrificante', 'K', 'ba', 'gx', 6, tA('Si el objetivo falla Res.Mt queda inmóvil 1 turno (a mano).', 3));
  H('Explosión final', 'DA', 'cea', 'g', 6, zO('Se hace estallar: daño en flor de diámetro 3 (7 casillas) (a mano) y el creep queda inconsciente.', 4, 'H'));

  /* ================= EXTRAS PARA TRIBUS Y BOSS ================= */
  H('Lluvia de piedras', 'DA', 'ce', 'rg', 5, zO('Piedras del techo caen en flor de diámetro 3 (7 casillas) (a mano).', 3, 'M'));
  H('Tormenta de arena', 'XA', 'e', 'x', 5, tA('Una nube de arena en flor de diámetro 5 (19 casillas): todos los de adentro pierden 2 de Evasión 2 turnos (a mano).', 3));
  H('Niebla', 'B', 'ea', 'e', 4, bU('Se cubre de niebla: +3 de Evasión 3 turnos.', 2, {eva: 3}, 3));
  H('Reflejo de espejo', 'T', 'ca', 'tg', 4, bU('Refleja lo mágico: +5 Res.Esp 2 turnos.', 2, {resmg: 5}, 2));
  H('Hambre insaciable', 'B', 'bm', 'm', 4, bU('Cuanto más pelea más quiere: +2 de Daño y +1 No2 3 turnos.', 2, {dmg: 2, nitros: 1}, 3));
  H('Pacto oscuro', 'B', 'dhm', 'g', 5, bU('Firma un pacto: +5 de Daño y −3 Res.Esp 3 turnos.', 3, {dmg: 5, resmg: -3}, 3));
  H('Pelaje erizado', 'BT', 'b', 'mt', 2, bU('Se eriza y parece enorme: +1 de Daño y +1 de Defensa 3 turnos.', 1, {dmg: 1, def: 1}, 3));
  H('Vuelo rasante', 'BM', 'b', 'e', 3, bU('Vuela bajo: +3 de Evasión y +1 No2 2 turnos.', 2, {eva: 3, nitros: 1}, 2));
  H('Reserva de energía', 'B', 'ca', 'g', 3, bU('Una carga extra: +2 No2 2 turnos.', 1, {nitros: 2}, 2));
  H('Despertar de la piedra', 'BT', 'ce', 'mt', 5, bU('Se despierta del todo: +3 de Daño y +3 de Defensa 3 turnos.', 3, {dmg: 3, def: 3}, 3));

  /* ================= SIGILO ================= */
  // Entrar en sigilo es automático (estado Sigilo: el mapa lo esconde, lo dibuja tenue y le da cono y zona de alerta a quien lo detecta).
  H('Fundirse en las sombras', 'B', 'hdam', 'e', 3, eS('Se esconde en la oscuridad y desaparece de la vista.', 2, 'Sigilo', 'buff', 0), 'sigilo');
  H('Camuflaje natural', 'B', 'bp', 'e', 4, eS('Su piel o su corteza copia lo que tiene alrededor.', 2, 'Sigilo', 'buff', 0), 'sigilo');
  H('Desaparecer', 'B', 'hdam', 'e', 5, eS('Un truco rápido y ya no está: entra en sigilo casi sin esfuerzo.', 1, 'Sigilo', 'buff', 0), 'sigilo');
  H('Reptar entre la maleza', 'B', 'bp', 'e', 3, eS('Se arrastra entre la vegetación: entra en sigilo y sus pasos son más seguros.', 2, 'Sigilo', 'buff', 0, {mods: {eva: 1}}), 'sigilo');
  H('Velo de sombras', 'B', 'ma', 'ge', 4, eS('Las sombras lo envuelven: sigilo y −1 Res.Esp mientras dure (la magia lo nota).', 2, 'Sigilo', 'buff', 0, {mods: {resmg: -1}}), 'sigilo');
  H('Ataque desde las sombras', 'D', 'hdb', 'e', 4, zO('Golpe de emboscada: ideal si está en sigilo. Si el objetivo no lo detectó, el daño se duplica (a mano) y al golpear pierde el sigilo (a mano).', 3, 'H'), 'sigilo');
  // 🗡 Auditadas (dueño, 2026-10-21; choque liviano, «por la espalda»): a la espalda se llega en sigilo, con Paso ligero o con el objetivo flanqueado (si no,
  // el objetivo se da vuelta: vtt-hexgrid/js/49). La de bestia, la misma: Mordida a traición.
  H('Puñalada por la espalda', 'D', 'hd', 'e', 3, aA('Un ataque con su arma desde el punto ciego del objetivo (su espalda): suma +1 dado de su arma al daño y Crítico frecuente +1, además del +1 a la Probabilidad de Golpe de todo ataque por la espalda. A la espalda se llega en sigilo, con Paso ligero o con el objetivo flanqueado (si no, el objetivo se da vuelta). Si no está en la espalda, avisa y deja atacar igual, sin el bono.',
    {}, 'un ataque con su arma; por la espalda, +1 dado y Crítico frecuente +1', 2, [], {punalada: 'espalda'}), 'sigilo,orientación');
  H('Mordida a traición', 'D', 'b', 'e', 3, aA('Muerde desde el punto ciego del objetivo (su espalda): un ataque con su arma que suma +1 dado de su arma al daño y Crítico frecuente +1, además del +1 a la Probabilidad de Golpe de todo ataque por la espalda. A la espalda se llega en sigilo, con Paso ligero o con el objetivo flanqueado (si no, el objetivo se da vuelta). Si no está en la espalda, avisa y deja atacar igual, sin el bono.',
    {}, 'un ataque con su arma; por la espalda, +1 dado y Crítico frecuente +1', 2, [], {punalada: 'espalda'}), 'sigilo,orientación');
  H('Cazador invisible', 'DB', 'ba', 'e', 5, zO('Entra en sigilo y ataca en el mismo turno (a mano el sigilo); si el objetivo no lo vio, +4 de daño (a mano).', 4, 'M'), 'sigilo');
  H('Ojo de lince', 'B', 'bhd', 'r', 3, bU('Afina la vista: +3 de Daño y ve mejor lo escondido (a mano: +1 dado a las tiradas de percepción) 3 turnos.', 1, {dmg: 3}, 3), 'percepción');
  H('Olfatear presa', 'X', 'b', 'x', 3, tA('Huele a sus presas: el GM revela a los personajes en sigilo dentro de 3 casilleros del creep (a mano, con 👁 Revelar lo oculto).', 2), 'sigilo,percepción');
  H('Sentido sísmico', 'X', 'bce', 'x', 4, tA('Siente las pisadas en el suelo: los personajes en sigilo que se muevan a 4 casilleros pierden el sigilo (a mano).', 2), 'sigilo,percepción');
  H('Polvo revelador', 'X', 'hdea', 'x', 3, tA('Arroja polvo: si el objetivo está en sigilo lo pierde y queda con −2 de Evasión 2 turnos (a mano).', 2), 'sigilo');
  H('Chillido delator', 'X', 'b', 'x', 3, tA('Un chillido que delata: un personaje en sigilo dentro de 3 casilleros pierde el sigilo (a mano).', 1), 'sigilo');
  H('Luz reveladora', 'X', 'eag', 'gx', 4, tA('Un destello ilumina una flor de diámetro 5 (19 casillas): cualquiera en sigilo dentro pierde el sigilo (a mano).', 3), 'sigilo,niebla y visión');
  H('Vigilar en todas direcciones', 'B', 'bdca', 'r', 4, tA('Sin punto ciego 3 turnos: nadie puede aprovechar su espalda (a mano).', 2), 'orientación,percepción');
  H('Ojos en la nuca', 'B', 'hd', 'et', 3, tA('Este turno no cuenta el punto ciego: no se puede atacar desde atrás con ventaja (a mano).', 1), 'orientación');
  H('Sigilo compartido', 'B', 'hdb', 'a', 5, tA('Esconde a un aliado cercano: pasa a estar en sigilo (a mano).', 3), 'sigilo');
  H('Disfraz', 'B', 'hda', 'e', 5, tA('Se disfraza de aliado o de civil: los personajes no lo detectan hasta que ataque o hable (a mano).', 2), 'sigilo');
  H('Silencio profundo', 'B', 'hdm', 'e', 4, tA('Sus pasos no hacen ruido: los pasos que dé en zona de alerta no piden tirada de detección este turno (a mano).', 2), 'sigilo');
  H('Espejismo', 'BI', 'ea', 'g', 5, tA('Deja una imagen falsa: el GM pone una marca "?" (última posición vista) en otra casilla y el creep entra en sigilo (a mano).', 3), 'sigilo,niebla y visión');
  H('Hacerse el muerto', 'B', 'bhd', 'e', 6, eS('Se queda quieto como si estuviera caído: se hace pasar por muerto (a mano) y entra en sigilo.', 1, 'Sigilo', 'buff', 0), 'sigilo');
  H('Emboscador paciente', 'B', 'bhd', 'e', 4, eS('Espera sin moverse: sigilo y +3 de Daño para su próximo golpe.', 2, 'Sigilo', 'buff', 0, {mods: {dmg: 3}}), 'sigilo');
  H('Salto sorpresa', 'DM', 'bd', 'e', 4, zO('Sale de su escondite y salta hasta 3 casilleros sobre el objetivo (a mano el movimiento).', 3, 'M'), 'sigilo');

  /* ================= TRAMPAS (se colocan con Terreno y Formas → Trampa) ================= */
  // La habilidad cobra No2 y cooldown sola; el daño de la trampa lo tira y aplica el mapa cuando alguien la pisa (campo "daño automático").
  H('Trampa de púas', 'D', 'hdb', 'ex', 3, tR('Deja una trampa oculta de púas en una casilla: daño {T} a quien la pise.', 2, 'M'), 'trampas,terreno');
  H('Cepo', 'DK', 'hd', 'ex', 3, tR('Deja un cepo en una casilla: daño {T} y el que lo pise queda Inmovilizado (a mano).', 2, 'L'), 'trampas,terreno');
  H('Foso oculto', 'D', 'hdb', 'ex', 4, tR('Cava un foso tapado en una casilla: daño {T} de caída.', 3, 'H'), 'trampas,terreno');
  H('Mina de contacto', 'DA', 'hdc', 'rx', 4, tR('Entierra una mina: explota en una flor de diámetro 3 (7 casillas) con daño {T}.', 3, 'H'), 'trampas,terreno');
  H('Campo minado', 'DA', 'hdc', 'rx', 6, tR('Siembra 3 minas en casillas cercanas: cada una hace {T} a quien la pise.', 4, 'M'), 'trampas,terreno');
  H('Trampa de veneno', 'DX', 'hdb', 'x', 3, tR('Una trampa con dardos envenenados: daño {T} y el que la pise queda Envenenado (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de fuego', 'DA', 'hde', 'gx', 4, tR('Un pozo de brea y chispa: daño {T} en flor de diámetro 3 (7 casillas) y deja el suelo ardiendo (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de hielo', 'DK', 'e', 'gx', 4, tR('Una placa de hielo: daño {T} y el que la pise pierde 1 No2 en su próximo turno (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de red', 'K', 'hdb', 'x', 3, tS('Una red escondida: quien la pisa queda Inmovilizado 1 turno (a mano); sin daño.', 2), 'trampas,terreno');
  H('Alambre tenso', 'DK', 'hd', 'ex', 3, tR('Un alambre tenso en una casilla: daño {T} y quien lo cruza cae al piso (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de alarma', 'X', 'hdb', 'ax', 2, tS('Deja una alarma en una casilla: al pisarla suena en la Mesa y los creeps cercanos se ponen en guardia (a mano). Es una trampa sin daño.', 1), 'trampas,terreno');
  H('Trampa sonora', 'DK', 'hdc', 'x', 3, tR('Un petardo enorme: daño {T} y los adyacentes quedan Pajaritos hasta el final de su turno (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de runas', 'DA', 'hdma', 'g', 5, tR('Grava una runa en el piso: explota en flor de diámetro 3 (7 casillas) con daño mágico {T}.', 3, 'H'), 'trampas,terreno');
  H('Cepo de alma', 'DX', 'ma', 'gx', 5, tR('Un cepo espectral: daño {T} y el que lo pise pierde 2 No2 en su próximo turno (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de ácido', 'DX', 'ba', 'x', 4, tR('Un charco de ácido tapado: daño {T} y el que lo pise pierde 1 de Defensa 3 turnos (a mano).', 3, 'M'), 'trampas,terreno');
  H('Zarzal traicionero', 'DK', 'p', 'x', 3, tR('Un matorral de espinas escondido: daño {T} y queda Rengo (a mano).', 2, 'L'), 'trampas,terreno');
  H('Telaraña oculta', 'K', 'b', 'x', 3, tS('Hilos casi invisibles: quien los toca queda Inmovilizado 1 turno (a mano), sin daño.', 2), 'trampas,terreno');
  H('Descarga oculta', 'DK', 'ca', 'x', 4, tR('Una placa eléctrica: daño {T} y el que la pise pierde 1 No2 (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de humo', 'X', 'hd', 'ex', 3, tS('Un frasco que al pisarlo suelta humo en flor de diámetro 3 (7 casillas): los de adentro pierden 2 de Evasión y no ven (a mano). Trampa sin daño.', 2), 'trampas,niebla y visión');
  H('Cebo', 'X', 'hdb', 'x', 3, tS('Deja un cebo (comida, oro brillante): los personajes deben pasar una tirada de Res.Mt o irán hacia él (a mano). Es una trampa sin daño.', 2), 'trampas');
  H('Trampa doble', 'DK', 'hd', 'x', 5, tR('Dos trampas juntas en casillas vecinas: daño {T} cada una.', 4, 'M'), 'trampas,terreno');
  H('Cazador de trampas', 'B', 'hdb', 'ex', 3, tA('Detecta trampas: el GM revela las trampas armadas en 4 casilleros alrededor del creep (a mano).', 1), 'trampas,percepción');
  H('Desarmar trampa', 'B', 'hd', 'ex', 2, tA('Desarma una trampa adyacente: se borra sin dispararla (a mano).', 1), 'trampas');
  H('Rearmar trampa', 'B', 'hd', 'ex', 3, tA('Rearma una trampa ya disparada en su casilla: vuelve a estar oculta (a mano, tocá el ⚙ de esa trampa).', 1), 'trampas');
  H('Empujar a la trampa', 'DK', 'bcd', 'mt', 3, zO('Empuja al objetivo un casillero hacia una trampa o un peligro (a mano); si lo pisa se dispara sola.', 2, 'L'), 'trampas');
  H('Ingeniero de trampas', 'B', 'hd', 'ex', 6, tR('Prepara un perímetro: deja 3 trampas ocultas en casillas cercanas, cada una con daño {T}.', 4, 'L'), 'trampas,terreno');

  /* ================= TERRENO Y FORMAS (elementos del mapa) ================= */
  H('Muro de tierra', 'K', 'e', 'gt', 4, tA('Levanta una línea de 3 casilleros de muro Sólido: bloquea el paso y la vista (Terreno y Formas, Sólido, a mano).', 3), 'terreno y formas,terreno');
  H('Muro de hielo', 'K', 'e', 'g', 5, tA('Una pared de hielo Sólido de 3 casilleros; dura 3 turnos, después se borra (a mano).', 3), 'terreno y formas,terreno');
  H('Barricada', 'KT', 'hd', 'ta', 4, tA('Arma una barricada Sólida de 2 casilleros que frena el paso (a mano).', 2), 'terreno y formas,terreno');
  H('Cortina de humo', 'X', 'hd', 'ex', 3, tA('Suelta humo en flor de diámetro 3 (7 casillas) (elemento transitable, color gris): los de adentro no se ven desde afuera (a mano).', 2), 'terreno y formas,niebla y visión,terreno');
  H('Charco de brea', 'K', 'ba', 'x', 3, tA('Un charco pegajoso en flor de diámetro 3 (7 casillas): cada casillero que se pise cuesta 1 No2 más (a mano, Terreno y Formas).', 2), 'terreno y formas,terreno');
  H('Zona en llamas', 'DA', 'e', 'g', 4, tA('Prende fuego una flor de diámetro 3 (7 casillas) (elemento naranja): quien termine el turno adentro recibe 1d6 (a mano).', 3), 'terreno y formas,terreno');
  H('Hielo resbaloso', 'K', 'e', 'gx', 3, tA('Congela una flor de diámetro 3 (7 casillas): quien la cruce se resbala y pierde 1 No2 (a mano).', 2), 'terreno y formas,terreno');
  H('Pantano', 'K', 'pb', 'x', 4, tA('Convierte una flor de diámetro 5 (19 casillas) en barro: costo doble de movimiento (a mano).', 3), 'terreno y formas,terreno');
  H('Maleza alta', 'B', 'p', 'e', 3, tA('Hace crecer maleza en una flor de diámetro 3 (7 casillas): quien esté adentro puede esconderse (sigilo) más fácil (a mano).', 2), 'terreno y formas,sigilo,terreno');
  H('Grieta en el suelo', 'K', 'ce', 'gt', 5, tA('Abre una grieta de 3 casilleros en línea, terreno Sólido que se tiene que rodear (a mano).', 3), 'terreno y formas,terreno');
  // ☠ Auditada (dueño, 2026-10-26; el Debuffer, «nube tóxica», de las varitas: «va como decís»): la Nube tóxica del Debuffer de los jugadores para
  // creeps, con 1d4 tóxico directo para que se sienta. Reemplaza a la vieja (a mano). Flor de diámetro 3 en su Rango, 3 turnos, solo a sus rivales: la
  // zona tira su Ef.Esp en cada exposición contra la Res.Esp (como la Varita de miasma y los Pedos Tóxicos); quien no resiste, 1d4 tóxico directo y
  // Veneno 3 (una vez envenenado, ya no se le vuelve a tirar). Costo el de la clase: 1 No2 y 3 SP, o cooldown 3.
  H('Nube tóxica', 'DX', 'bpahd', 'x', 3, {detalle: 'Deja una nube tóxica de diámetro 3 (7 casillas) en una casilla dentro de su Rango, durante 4 turnos. A cada rival que está adentro cuando aparece, o que entra, la nube le tira el Efecto especial del creep contra su Resistencia especial: si no resiste, recibe 2d4 de daño tóxico directo (solo lo frena la resistencia al tóxico) y queda con Veneno 3. Al envenenado que sigue adentro al pasar de ronda, o que vuelve a entrar, la nube no le tira: su Veneno vuelve a 3 stacks. Quien la resistió (o ya no está envenenado) y sigue adentro, vuelve a tirar en cada ronda. No afecta a sus aliados.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'nube tóxica de diámetro 3, 4 turnos: Ef.Esp contra Res.Esp; 2d4 tóxico directo y Veneno 3; adentro, el Veneno vuelve a 3',
    duelo: {objetivo: 'zona', radio: 1, tira: 'dmgesp', contra: ['resmg'], dano: true, danoFormula: '2d4', danoDirecto: true, tipoDano: 'toxico', zonaTurnos: 4,
      zonaAlcance: 'rango', zonaInmediata: true, zonaEstado: {nombre: 'Veneno', stacks: 3, unaVez: true, resetea: true}}}, 'terreno y formas,terreno');   // (unaVez + resetea: envenenado, la nube no le tira; quedarse adentro le vuelve el Veneno a 3 — dueño, 2026-10-26)
  H('Tormenta de arena en zona', 'X', 'e', 'x', 5, tA('Arena en flor de diámetro 5 (19 casillas): los de adentro pierden 2 de Evasión y su visión se reduce a 1 casillero (a mano).', 3), 'terreno y formas,niebla y visión,terreno');
  H('Círculo de protección', 'T', 'hdm', 'at', 5, tA('Un círculo en flor de diámetro 3 (7 casillas): los aliados adentro ganan +2 de Defensa mientras se queden (a mano).', 3), 'terreno y formas,terreno');
  H('Árbol caído', 'K', 'p', 'tx', 4, tA('Derriba un árbol en línea de 3 casilleros: elemento Sólido que bloquea el paso (a mano).', 3), 'terreno y formas,terreno');
  H('Marea de lodo', 'K', 'e', 'gx', 5, tA('Una ola de lodo: empuja a los de una línea de 3 casilleros un casillero (a mano) y deja barro.', 3), 'terreno y formas,terreno');

  /* ================= NIEBLA Y VISIÓN ================= */
  H('Manto de oscuridad', 'X', 'am', 'gx', 5, tA('Oscurece una flor de diámetro 5 (19 casillas) alrededor del creep: el GM tapa a mano esa zona con la herramienta 🌫 Niebla y los jugadores no ven lo de adentro.', 3), 'niebla y visión,terreno');
  H('Destello cegador', 'XK', 'ea', 'gx', 4, tA('Un fogonazo: los que lo miran pierden 3 de Evasión y su visión 2 turnos (a mano).', 2), 'niebla y visión');
  H('Visión nocturna', 'B', 'bdm', 'r', 3, bU('Ve en la oscuridad: +2 de Daño y ignora la penalización de la niebla 3 turnos (a mano lo segundo).', 1, {dmg: 2}, 3), 'niebla y visión');
  H('Ojo lejano', 'B', 'ag', 'g', 4, tA('Ve lo que hay a 6 casilleros: el GM destapa a mano una flor de diámetro 5 (19 casillas) con la herramienta 🌫 Niebla para el creep (a mano).', 2), 'niebla y visión,percepción');
  H('Niebla de guerra propia', 'X', 'ea', 'gx', 6, tA('Una bruma que cubre 4 casilleros: los jugadores pierden la visión compartida 2 turnos (a mano, tapando con 🌫 Niebla).', 4), 'niebla y visión,terreno');
  H('Exploración', 'B', 'bhd', 'e', 3, bU('Se adelanta a explorar: +2 No2 este turno (a mano: el GM destapa un área de diámetro 7 a su alrededor).', 1, {nitros: 2}, 1), 'niebla y visión,percepción');

  /* ================= INICIATIVA ================= */
  H('Adelantarse', 'B', 'hdb', 'e', 4, tA('Se adelanta al enemigo: sube 5 puntos su iniciativa en el orden de turnos (a mano, valor editable).', 1), 'iniciativa');
  H('Retrasar al rival', 'X', 'hdea', 'x', 4, tA('Lo distrae o lo entorpece: baja 3 puntos la iniciativa del objetivo en el orden de turnos (a mano).', 2), 'iniciativa');
  H('Reflejos de gato', 'B', 'b', 'e', 3, bU('Reacciona a la primera: +2 No2 y +1 de Evasión 2 turnos (a mano: sube 2 puntos de iniciativa).', 1, {nitros: 2, eva: 1}, 2), 'iniciativa');
  H('Golpe de mano', 'DB', 'hd', 'me', 3, zO('Ataca antes de que empiece la pelea de verdad: sube 3 puntos de iniciativa este combate (a mano).', 2, 'M'), 'iniciativa');
  H('Emboscada de manada', 'B', 'b', 'a', 5, tA('La manada salta a la vez: todos sus aliados cercanos suben 3 puntos de iniciativa (a mano).', 3), 'iniciativa');
  H('Pausa forzada', 'XK', 'ma', 'gx', 5, tA('Congela el tiempo un instante: el objetivo salta al final del orden de turnos (a mano).', 3), 'iniciativa');

  /* ================= AURAS ================= */
  // El token tiene aura visual (⚙ del HUD: radio, forma y color); el efecto sobre otros queda a mano.
  H('Aura de miedo', 'XA', 'mba', 'x', 4, tA('Aura de diámetro 5, 19 casillas (⚙ del token, color violeta): los personajes adentro pierden 1 de Daño mientras estén en el aura (a mano).', 2), 'aura,zona o área');
  H('Aura de veneno', 'XA', 'pb', 'x', 4, tA('Aura de diámetro 3, 7 casillas (⚙ del token, color verde): quien termina el turno adentro pierde 1 HP (a mano).', 2), 'aura,zona o área');
  H('Aura de calor', 'DA', 'e', 'mg', 4, tA('Aura de diámetro 3, 7 casillas (⚙ del token, color naranja): quien termina el turno adentro recibe 1d4 (a mano).', 2), 'aura,zona o área');
  H('Aura gélida', 'XA', 'em', 'x', 4, tA('Aura de diámetro 3, 7 casillas (⚙ del token, color celeste): los de adentro pierden 1 No2 por turno (a mano).', 2), 'aura,zona o área');
  H('Aura de mando', 'BA', 'hd', 'a', 4, tA('Aura de diámetro 5, 19 casillas (⚙ del token, color dorado): los aliados adentro ganan +1 de Daño (a mano).', 2), 'aura,zona o área,jefe');
  H('Aura de protección', 'TA', 'hdc', 'at', 4, tA('Aura de diámetro 3, 7 casillas (⚙ del token, color azul): los aliados adentro ganan +2 de Defensa (a mano).', 2), 'aura,zona o área');
  H('Aura de silencio', 'XA', 'ma', 'gx', 5, tA('Aura de diámetro 5, 19 casillas (⚙ del token, color gris): en el aura no se puede usar sigilo (a mano).', 3), 'aura,sigilo,zona o área');
  H('Aura de corrupción', 'XA', 'ma', 'gx', 5, tA('Aura de diámetro 3, 7 casillas (⚙ del token, color púrpura): los de adentro pierden 2 Res.Esp (a mano).', 3), 'aura,zona o área');

  /* ================= ESTADOS ALTERADOS SOBRE SÍ MISMO (todo automatizado) ================= */
  H('Inmunidad total', 'T', 'ce', 't', 6, eS('Nada lo daña ni lo debilita un momento.', 3, 'Invulnerable', 'buff', 1), 'jefe');
  H('Voluntad de hierro', 'T', '*', 't', 5, eS('Ignora todo lo que quiera controlarlo: no lo aturden ni lo agotan.', 2, 'Inmunidad a CC', 'buff', 3), 'jefe');
  H('Espinas defensivas', 'T', 'bpc', 't', 4, eS('Sus púas devuelven el 50% del daño de los golpes cuerpo a cuerpo (se cobra a mano).', 2, 'Espinas', 'buff', 3));
  H('Escudo arcano', 'T', 'ga', 'tg', 4, eS('Una barrera de energía absorbe daño de cualquier fuente.', 2, 'Vida extra', 'buff', 3));
  H('Suerte del bribón', 'B', 'hdb', 'e', 4, eS('Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2));
  H('Sangre inmune', 'T', 'mpc', 't', 4, eS('Ningún veneno le hace efecto.', 1, 'Sangre pura', 'buff', 3));
  H('Coagulación rápida', 'T', 'bhd', 't', 4, eS('Sus heridas cierran al instante: inmune al sangrado.', 1, 'Coagulación', 'buff', 3));
  H('Coraza blindada', 'T', 'cd', 't', 4, eS('Ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3));
  H('Regeneración rápida', 'C', 'bpm', 'tm', 5, eS('Sus heridas se cierran solas: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 3}));
  H('Adrenalina', 'B', 'hdb', 'me', 3, eS('Un torrente de energía: +1 No2 máximo.', 1, 'Hypeado', 'buff', 3));
  H('Frenesí de curación', 'CB', 'bm', 'm', 6, eS('Recupera vida por turno y ataca más rápido: +1 No2.', 3, 'Regeneración', 'buff', 3, {hp: 2, mods: {nitros: 1}}));
  H('Escudo de espinas', 'TD', 'p', 'tm', 5, eS('Espinas y una barrera de savia: devuelve daño y gana +2 de Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 2}}));

  /* ================= ESTADOS ALTERADOS SOBRE OTROS (a mano: se aplica el preset con + Estado) ================= */
  H('Sembrar veneno', 'X', 'bpdh', 'x', 3, tA('Aplicale al objetivo el estado Veneno (preset de + Estado): pierde 1 HP por stack cada turno, hasta 4 stacks (a mano).', 2), 'estados alterados');
  H('Herida sangrante', 'X', 'bhd', 'mx', 3, tA('Aplicale al objetivo el estado Sangrado: pierde 2 HP por turno hasta que se cure (a mano).', 2), 'estados alterados');
  H('Aturdir con estruendo', 'K', 'bcd', 'x', 5, tA('Aplicale al objetivo el estado Stun: se queda sin No2 este turno (a mano).', 3), 'estados alterados');
  // 🥵 Auditada (dueño, 2026-10-25; el Debuffer, «extenuar»: «está bien»): su PdG.Esp contra la Res.Esp de un rival en su Rango; si gana, Extenuado
  // 2 turnos (el preset: +1 No2 a todo lo que cuesta No2, y al moverse 1 más cada 2 casillas). Costo propuesto por Claude: 1 No2 y 3 SP, o cooldown 3.
  // Y 2d4 arcano (dueño, el mismo día: «sumémosle algo de daño… que cada acción tenga peso; que todo haga un poquito de más, que hacer una habilidad se sienta»).
  H('Extenuar', 'X', '*', 'x', 3, {detalle: 'Le carga el cuerpo a un rival dentro de su Rango: tira su Probabilidad de Golpe especial contra la Resistencia especial del objetivo. Si gana, 2d4 de daño arcano (lo frena la Defensa especial) y queda Extenuado 2 turnos: todo lo que cuesta No2 (atacar, habilidades, Parry, consumir…) le cuesta 1 más, y al moverse, 1 No2 más cada 2 casillas.',
    no2: 1, spCosto: 3, auditada: true, ataqueTxt: 'su PdG.Esp contra la Res.Esp; 2d4 arcano y Extenuado 2 turnos (+1 No2 a todo)',
    duelo: {objetivo: 'enemigo', tira: 'pdgmg', contra: ['resmg'], alcance: 'rango', dano: true, danoFormula: '2d4', tipoDano: 'arcano', efectos: [{nombre: 'Extenuado', turnos: 2}]}});
  H('Agotar', 'X', 'ma', 'x', 4, tA('Aplicale al objetivo Exhausto: como mucho 1 No2 por turno 3 turnos (a mano).', 2), 'estados alterados');
  H('Cansar', 'X', '*', 'x', 3, tA('Aplicale al objetivo Cansado: pierde un tercio de sus No2 máximos 3 turnos (a mano).', 1), 'estados alterados');
  H('Lisiar', 'X', 'bhd', 'mx', 4, tA('Aplicale al objetivo Lisiado: su PdG y Parry a la mitad 3 turnos (a mano).', 2), 'estados alterados');
  H('Clavar al suelo', 'K', 'hdb', 'x', 4, tA('Aplicale al objetivo Inmovilizado: su movimiento queda en 0 3 turnos (a mano).', 2), 'estados alterados');
  // 🦵 El Rengo (dueño, 2026-10-21, con sus nombres: «golpe a la rodilla», «tarascón al tobillo», «tiro a la rodilla»): un ataque con su arma que, si pega, deja Rengo 2 turnos.
  H('Golpe a la rodilla', 'DK', 'hd', 'mx', 3, aA('Un golpe seco a la rodilla: un ataque con su arma; si pega, queda Rengo 2 turnos (moverse le cuesta 2 No2 por casillero).',
    {}, 'va al duelo como un ataque; si pega, Rengo 2 turnos', 2, RG), 'estados alterados');
  H('Nublar la mente', 'X', 'ma', 'gx', 3, tA('Aplicale al objetivo Pajaritos: PdG y Evasión a la mitad 3 turnos (a mano).', 2), 'estados alterados');
  H('Corroer el metal', 'X', 'ca', 'x', 4, tA('Aplicale al objetivo Armadura rota: −1 Defensa por acumulación, permanente hasta repararla (a mano).', 2), 'estados alterados');
  H('Disolver la armadura', 'X', 'ca', 'x', 6, tA('Aplicale al objetivo Armadura rota (se acumula si ya la tiene) hasta repararla (a mano).', 4), 'estados alterados');
  H('Toxina severa', 'X', 'bp', 'x', 5, tA('Aplicale al objetivo Veneno severo: pierde 1 HP el primer turno y 1 más con cada mantenimiento, sin caducar (a mano).', 3), 'estados alterados');
  H('Golpe que sangra', 'DX', 'hd', 'me', 2, aA('Un golpe que abre la carne: un ataque con su arma; si pega, deja Sangrado (2 de daño por turno durante 2 turnos; se acumula y, con un golpe crítico, queda permanente).',
    {}, 'va al duelo como un ataque; si pega, Sangrado', 1, SG), 'estados alterados');
  H('Tarascón al tobillo', 'DK', 'b', 'me', 3, aA('Un tarascón al tobillo: un ataque con su arma; si pega, queda Rengo 2 turnos (moverse le cuesta 2 No2 por casillero).',
    {}, 'va al duelo como un ataque; si pega, Rengo 2 turnos', 2, RG), 'estados alterados');
  // 🔁 Auditada (dueño, 2026-10-25; Rango, la Repetición del Shooter para creeps: «sí» a la propuesta de Claude): queda Repitiendo con 3 disparos
  // (el preset del Shooter; el mapa la cuenta: vtt-hexgrid/js/35): con su arma a distancia al mismo blanco, el 2.º +1 PdG y +1 dado, el 3.º +2 y +2;
  // cada disparo paga sus No2; cambiar de blanco o de arma la corta y se termina al empezar su próximo turno. No es su ataque: 3 SP, o cooldown 3.
  H('Ráfaga encadenada', 'B', 'hd', 'r', 3, {detalle: 'Se prepara para encadenar disparos: sus próximos 3 disparos con un arma a distancia al mismo blanco, en este turno, van cada vez mejor: el 2.º suma +1 a la Probabilidad de Golpe y un dado más del arma, el 3.º +2 y dos dados más. Cada disparo paga sus No2 como siempre. Si cambia de blanco o de arma se corta, y se termina al empezar su próximo turno. Prepararla no gasta su ataque.',
    no2: 0, spCosto: 3, auditada: true, ataqueTxt: 'queda encadenando 3 disparos al mismo blanco: el 2.º +1 PdG y +1 dado, el 3.º +2 y +2', efecto: {nombre: 'Repitiendo', stacks: 3, turnos: 1}});
  // 🏹 Auditada (dueño, 2026-10-25; Rango, «volumen de fuego», el equivalente para creeps del Proyectil perforante del Shooter: «vamos con la que
  // atraviesa»): un disparo con su arma con +2 al daño (para que se sienta) que, pegue o no al primero, sigue derecho y le pega al primero que haya
  // detrás en su Rango, contra la misma tirada (`perforante`, vtt-hexgrid/js/42). Costo el del Shooter: el ataque y 2 SP, o cooldown 3.
  // 💨 Auditada (dueño, 2026-10-26; Rango, «distancia y movimiento»: «el de repliegue»): el Hit and run del arquero. Un disparo con su arma con +2 al daño
  // (para que se sienta) y, pegue o no, se aleja hasta 2 casilleros gratis y sin ataque de oportunidad (`alejarse`, vtt-hexgrid/js/57). Costo de Claude:
  // el ataque y 2 SP, o cooldown 3.
  H('Disparo y repliegue', 'DM', 'hd', 'r', 3, aA('Dispara y se repliega: un ataque con su arma con +2 al daño; pegue o no, después se aleja hasta 2 casilleros, gratis (sin No2) y sin dar ataque de oportunidad.',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; después, el cartel para alejarse hasta 2 casilleros gratis y sin ataque de oportunidad', 2, [], {alejarse: 2}));
  H('Flecha que atraviesa', 'D', 'hd', 'r', 3, aA('Un disparo que atraviesa: un ataque con su arma a distancia con +2 al daño; pegue o no al primero, sigue derecho por la misma línea y le pega al primero que haya detrás dentro de su Rango (aliado incluido; un Sólido o una pared lo frenan). El segundo se defiende contra la misma tirada y recibe el daño entero, sin los efectos especiales.',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; sigue de largo y le pega al de atrás', 2, [], {perforante: true}));
  // 🏹 Auditada (dueño, 2026-10-25; Rango, «mantener a raya»: «bueno para mantener distancia, que es su fuerte»; «y que además sume algo de daño»): un
  // disparo con su arma con +2 al daño; si pega, lo empuja 2 casillas (el Empujón de la Cornada, con su colisión) y queda Lento 2 turnos. Distinta del
  // Tiro a la rodilla (Rengo, sin empujar). El +2 lo propuso Claude; el dueño, el mismo día: «un casillero más de tirar para atrás y un SP más de costo»
  // (empuja 2, el ataque y 3 SP, o cooldown 3).
  // 🏹 Auditada (dueño, 2026-10-26; Rango, «tiro que derriba»: «empuja uno para atrás y queda sentado. Puede hacer el daño normal, no tiene daño adicional»):
  // un disparo con su arma; si pega, lo empuja 1 (el Empujón, con su choque) y queda Sentado. Costo de Claude: el ataque y 2 SP, o cooldown 3.
  H('Tiro que derriba', 'DK', 'hd', 'r', 3, aA('Un disparo que lo tira al piso: un ataque con su arma; si pega, lo empuja 1 casilla lejos del tirador (si choca contra algo, el daño de colisión de siempre) y queda Sentado (levantarse le cuesta No2).',
    {}, 'va al duelo como un ataque; si pega, lo empuja 1 y queda Sentado', 2,
    [{nombre: 'Empujón', empuja: 1, detalle: 'Lo empuja 1 casilla, lejos del tirador.'}, {nombre: 'Sentado'}]), 'estados alterados');
  // 🎯 Auditada (dueño, 2026-10-26; Rango, «tiro al arma»: «vamos con tiro al arma, pero que en vez de más 2 al daño, de más 2 a la probabilidad de golpe»):
  // un disparo con +2 PdG; si pega, el arma (o lo que tenga en la mano) se le escapa y sale volando 2 casillas, con la ruleta del Desarmar (el Desarmado
  // con `vuela`, como la Expelliarmus: vtt-hexgrid/js/62). Costo de Claude: el ataque y 3 SP, o cooldown 3.
  H('Tiro al arma', 'DK', 'hd', 'r', 3, aA('Un disparo a la mano: un ataque con su arma con +2 a la Probabilidad de Golpe. Si pega, lo que tiene en la mano (un arma o un escudo) se le escapa y sale volando 2 casillas, a una al azar (la ruleta del Desarmar); queda sin arma hasta que la levante (1 No2, estando encima o al lado).',
    {pdg: 2}, 'va al duelo como un ataque con +2 PdG; si pega, el arma sale volando 2 casillas', 3,
    [{nombre: 'Desarmado', vuela: 2, detalle: 'Lo que tiene en la mano sale volando 2 casillas.'}]), 'estados alterados');
  // 🎯 Auditada (dueño, 2026-10-26; Rango, «tiro certero», el 19 del rol: «vamos al tiro certero»): un disparo que busca el hueco de la armadura: +1 PdG,
  // Perfora 3 (3 puntos del daño pasan la Defensa siempre) e ignora 2 de la Resistencia a crítico. Costo de Claude: el ataque y 2 SP, o cooldown 2.
  H('Tiro certero', 'D', 'hd', 'r', 2, aA('Un disparo que busca el hueco de la armadura: un ataque con su arma con +1 a la Probabilidad de Golpe y Perfora 3 (3 puntos del daño pasan la Defensa siempre); además ignora 2 de la Resistencia a crítico del objetivo.',
    {pdg: 1, perfora: 3, ignoraResistCrit: 2}, 'va al duelo como un ataque con +1 PdG, Perfora 3 e ignora 2 de Resistencia a crítico', 2, []));
  // 🏹 Auditada (dueño, 2026-10-26; Rango, «abanico», el 20 del rol): un abanico de flechas en el cono al frente (el de la detección, 16 casillas): su PdG
  // una vez contra la Evasión de cada rival del cono y el daño de su arma a los que pega, sin dodge roll (como todo cono). Lo de un ataque y 3 SP, o cooldown 3.
  H('Abanico', 'DA', 'hd', 'r', 3, {detalle: 'Suelta un abanico de flechas hacia donde mira, en cono al frente (16 casillas): tira su Probabilidad de Golpe una sola vez contra la Evasión de cada rival del cono y, a los que les gana, les hace el daño de su arma (lo frena la Defensa). Un cono no se esquiva corriendo. No afecta a sus aliados.',
    no2: 'ATAQUE', spCosto: 3, auditada: true, ataqueTxt: 'su PdG contra la Evasión de cada rival del cono al frente; el daño de su arma',
    duelo: {objetivo: 'cono', tira: 'pdg', contra: ['eva'], dano: true, danoArma: true, tipoDano: 'fisico', ignoraDano: false, efectos: []}});
  // 📌 Auditada (dueño, 2026-10-26; Rango, «clavar a la pared»: «que además desplace para atrás hasta tres casilleros… si hay un objeto sólido, se choca
  // contra el mismo y queda inmovilizado por tres turnos. Puede tirar fuerza contra; la dificultad va a ser la tirada de probabilidad de golpe… en lugar de
  // más daño, +3 a la probabilidad de golpe»): un disparo con +3 PdG; si pega, lo empuja 3 (el Empujón, con su colisión) y, si choca contra algo sólido
  // (no contra otro token), Inmovilizado 3 turnos, que se suelta con Fuerza contra ese PdG (`clava`, vtt-hexgrid/js/13). Costo de Claude: el ataque y 3 SP,
  // o cooldown 3.
  H('Clavar a la pared', 'DK', 'hd', 'r', 3, aA('Un disparo que lo clava: un ataque con su arma con +3 a la Probabilidad de Golpe. Si pega, lo empuja hasta 3 casillas lejos del tirador; si en el camino choca contra algo sólido (una pared, un Sólido, la colisión del mapa), recibe el daño de colisión de siempre y queda clavado: Inmovilizado 3 turnos. Al empezar su turno puede soltarse, gratis, con Fuerza contra el PdG con que le pegaron; un aliado pegado puede ayudarlo. Contra otro token, solo el choque.',
    {pdg: 3}, 'va al duelo como un ataque con +3 PdG; si pega, lo empuja 3 y, si choca contra algo sólido, Inmovilizado 3 turnos (Fuerza contra su PdG)', 3,
    [{nombre: 'Empujón', empuja: 3, clava: {turnos: 3}, detalle: 'Lo empuja 3 casillas, lejos del tirador; si choca contra algo sólido, queda clavado (Inmovilizado 3 turnos).'}]), 'estados alterados');
  H('Mantener a raya', 'DK', 'hd', 'r', 3, aA('Un disparo para que no se acerque: un ataque con su arma con +2 al daño; si pega, lo empuja 2 casillas lejos del tirador (si choca contra algo, el daño de colisión de siempre) y queda Lento 2 turnos (el primer casillero que mueve en cada turno le cuesta el doble de No2).',
    {fijo: 2}, 'va al duelo como un ataque con +2 al daño; si pega, lo empuja 2 y queda Lento 2 turnos', 3,
    [{nombre: 'Empujón', empuja: 2, detalle: 'Lo empuja 2 casillas, lejos del tirador.'}, {nombre: 'Lento', turnos: 2, detalle: 'Lento 2 turnos: el primer casillero que mueve en cada turno le cuesta el doble de No2.'}]), 'estados alterados');
  H('Tiro a la rodilla', 'DK', 'hd', 'r', 3, aA('Un tiro bajo, a la rodilla: un ataque con su arma; si pega, queda Rengo 2 turnos (moverse le cuesta 2 No2 por casillero).',
    {}, 'va al duelo como un ataque; si pega, Rengo 2 turnos', 2, RG), 'estados alterados');
  H('Golpe atontador', 'DK', 'hdb', 'm', 4, zO('Un golpe en la cabeza: daño y aplicale al objetivo Pajaritos (a mano).', 3, 'M'), 'estados alterados');

  /* ================= ORIENTACIÓN, MOVIMIENTO EN EL MAPA Y ROBO ================= */
  H('Vuelta veloz', 'M', 'hdb', 'e', 2, tA('Gira hasta 180° sin gastar No2 este turno (a mano; girar en combate cuesta 1 No2 por 60°).', 1), 'orientación');
  H('Golpe por los flancos', 'D', 'hd', 'e', 3, zO('Ataca a un objetivo desde un costado: +2 de daño (a mano).', 2, 'M'), 'orientación');
  H('Guardia trasera', 'T', 'hdc', 'tx', 3, bU('Cubre su espalda: +2 de Defensa 2 turnos y no se lo puede atacar por el punto ciego (a mano).', 1, {def: 2}, 2), 'orientación');
  H('Carrera libre', 'M', 'bd', 'e', 4, tA('Este turno se mueve gratis (sin gastar No2) hasta 4 casilleros (a mano con 🦶 Mover libre).', 2), 'movimiento');
  H('Paso lateral', 'M', 'hdb', 'e', 2, bU('Esquiva con un paso lateral: +3 de Evasión 1 turno.', 1, {eva: 3}, 1), 'movimiento');
  H('Salto sobre obstáculos', 'M', 'bd', 'e', 3, tA('Salta sobre un elemento sólido de 1 casillero de ancho (a mano, ignora ese muro).', 2), 'movimiento,terreno y formas');
  H('Atravesar', 'M', 'ma', 'e', 5, tA('Pasa por encima de un elemento sólido como si no estuviera (a mano).', 3), 'movimiento,terreno y formas');
  H('Carterista', 'X', 'hd', 'ex', 3, tA('Le roba al personaje 1d6 de DDE del bolsillo (a mano, el jugador tacha esos DDE).', 1), 'botín');
  H('Robar objeto', 'X', 'hd', 'ex', 5, tA('Roba un ítem suelto de la mochila del objetivo (el jugador elige cuál, a mano).', 3), 'botín');
  H('Saqueo', 'B', 'hd', 'ma', 4, tA('Al terminar el combate el creep suelta el doble de oro (a mano, ajustá en el reporte de Finalizar combate).', 1), 'botín');
  H('Devorar cadáver', 'C', 'bm', 'm', 4, cU('Se alimenta de un caído: recupera vida (a mano: sacá el trofeo de ese caído del botín).', 2, 4), 'botín');

  /* ================= JEFE (protecciones) ================= */
  H('Presencia de jefe', 'T', '*', 't', 6, eS('Su presencia lo protege: no lo controlan ni lo aturden.', 2, 'Inmunidad a CC', 'buff', 2), 'jefe');
  H('Segunda fase', 'C', '*', 'tm', 6, cU('Al llegar a media vida se recompone y recupera vida (a mano: pasa a una segunda fase con nuevas habilidades).', 3, 8), 'jefe');
  H('Grito del jefe', 'BA', 'bdma', 'a', 5, tA('Los aliados cercanos ganan +2 de Daño y +2 de Defensa 2 turnos (a mano) y el jefe queda con Inmunidad a CC.', 3), 'jefe');
  H('Reforzar guardaespaldas', 'I', 'hd', 'a', 6, tA('Llegan 2 guardaespaldas de nivel bajo a defender al jefe (a mano).', 3), 'jefe');
  H('Furia del jefe', 'B', '*', 'm', 6, bU('Llega al límite: +5 de Daño y +2 No2 3 turnos.', 3, {dmg: 5, nitros: 2}, 3), 'jefe');
  H('Rugido de jefe', 'XA', 'bd', 'x', 6, zO('Un grito que sacude a todos: daño a los adyacentes (a mano) y quedan Pajaritos hasta el final de su turno (a mano).', 4, 'M'), 'jefe,estados alterados');

  /* ================= HABILIDADES DE LOS CREEPS DEL REWORK (2026-09-27, pedido del dueño) =================
     Cada habilidad que diseñamos para un creep del rework (elementales y cripta) también se ofrece suelta acá, con sus filtros, para poder
     usarla al armar cualquier creep. Salen de `CreepsBaseUtil.habsDeCreeps` (una sola fuente: el creep y el buscador usan la misma receta).
     Si dos creeps comparten una habilidad (mismo nombre), es una sola entrada con las razas y roles de todos. */
  (function(){
    const RAZA_DE = {'elemental': 'e', 'no-muerto': 'm', 'bestia': 'b', 'humano': 'h', 'humanoide': 'd', 'planta': 'p', 'constructo': 'c', 'alienígena': 'a'};
    const ROL_DE = {brutal: 'm', tanque: 't', rapido: 'e', rango: 'r', mago: 'g', apoyo: 'a', debuffer: 'x'};
    const FAMILIA = {fuego: 'fuego', hielo: 'hielo', rayo: 'rayo', cripta: 'cripta'};
    const CONTROL = /^(Stun|Miedo|Inmovilizado|Parálisis|Paralisis|Exhausto)$/;
    const existentes = new Set(lista.map(h => h.nombre));
    const unicas = new Map();
    (U.habsDeCreeps || []).forEach(({sp, cd, creep}) => {
      const u = unicas.get(sp.nombre) || {sp, cd, razas: new Set(), roles: new Set(), fams: new Set()};
      if(RAZA_DE[creep.tipo]) u.razas.add(RAZA_DE[creep.tipo]);
      if(ROL_DE[creep.rol]) u.roles.add(ROL_DE[creep.rol]);
      if(FAMILIA[creep.esc]) u.fams.add(FAMILIA[creep.esc]);
      unicas.set(sp.nombre, u);
    });
    unicas.forEach((u, nombre) => {
      if(existentes.has(nombre)) return;   // ya está en el catálogo general
      const {sp} = u, ap = U.aplicaDe(sp), ef = sp.efecto || {};
      let fn = '';
      if(sp.dano) fn += 'D';
      if(sp.cura) fn += 'C';
      if(ef.nombre || (ef.mods && Object.keys(ef.mods).length)) fn += (ef.polaridad === 'debuff') ? 'X' : (ef.mods && ef.mods.def) || ef.excK ? 'TB' : 'B';
      if(ap) fn += 'X' + (CONTROL.test(ap.nombre) ? 'K' : '');
      if(/flor de|cono|línea|adyacentes|todos los|zona/i.test(sp.detalle)) fn += 'A';
      if(!fn) fn = 'B';
      const {nombre: _n, ...spBase} = sp;
      const mec = [...u.fams].join(',');
      H(nombre, [...new Set(fn)].join(''), [...u.razas].join('') || '*', [...u.roles].join('') || 'm', u.cd, spBase, mec);
    });
  })();

  /* ================= HABILIDADES DE LOS CREEPS DE «EL ORIGEN DE LAS ESPECIES» (2026-10-23, dueño: «pasarlas a la de fábrica y señalarlas como
     por auditar») =================
     Las 60 que tenían los creeps de esa partida (53 desde que los gritos y las curaciones se sintetizaron en las de Support, 2026-10-23) (goblins, kobolds, lobos, ratas, el ocultista…), copiadas tal cual estaban (ya armadas para el
     nivel de su creep: no se reescalan, `datos.habilidad`), con su rol y su concepto de docs/diseno-roles-creep.md. Todas «sin auditar» hasta que el
     dueño las audite (entonces pasan a una receta `H(...)` como las demás). Las que se llaman igual que una de fábrica llevan «(El origen)».
     Una por renglón: {rol, concepto, etiquetas, creeps (de quién salió), nivel, habilidad}. */
  // (2026-10-25, dueño: «emprolijá»): sacados el Mordisco que lisia —idéntico al Mordisco brutal del mismo Lobo gris— y el Corte profundo viejo —el
  // Ladronzuelo usa el Corte profundo de fábrica—. En la partida se cambiaron también en los creeps. Y el Mordisco infectado pasó a ser de fábrica (arriba).
  const ORIGEN = [
    {"rol":"choque liviano","concepto":"por la espalda","etiquetas":["sin auditar","de El origen","choque liviano","por la espalda","humanoide"],"creeps":["Ladronzuelo del monte"],"nivel":1,"habilidad":{"nombre":"Puñalada rastrera","detalle":"⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; tira 1d6+1 de daño. ✋ A mano: Si flanquea al objetivo (un aliado suyo adyacente a él), +2 al daño.","cd":2,"costo":"","nitrosCosto":"ATAQUE","tiradaExtra":"1d6+1","tiradaStat":"pdg"}},
    {"rol":"choque liviano","concepto":"robar","etiquetas":["sin auditar","de El origen","choque liviano","robar","humanoide"],"creeps":["Ladron del monte","Ladronzuelo del monte"],"nivel":1,"habilidad":{"nombre":"Bolsillo ajeno","detalle":"⚙ Automatizado: cuesta 2 No2; cooldown 3 (habilidad lenta: el combate arranca con el cooldown activo). ✋ A mano: Roba un ítem chico del cinturón del objetivo y se aleja 3 casillas.","cd":3,"costo":"","nitrosCosto":2,"cdArranca":true}},
    {"rol":"choque liviano","concepto":"sigilo","etiquetas":["sin auditar","de El origen","choque liviano","sigilo","humanoide"],"creeps":["Ladron del monte","Ladronzuelo del monte"],"nivel":1,"habilidad":{"nombre":"Desaparecer (El origen)","detalle":"Un truco rápido y ya no está: entra en sigilo casi sin esfuerzo. ⚙ Automatizado: cuesta 1 No2; cooldown 5 (habilidad lenta: el combate arranca con el cooldown activo); queda con el estado Sigilo hasta que se lo saquen. ✋ A mano: nada, todo está automatizado.","cd":4,"costo":"","nitrosCosto":1,"cdArranca":false,"efectoNombre":"Sigilo","efectoTurnos":0,"efectoStacks":1,"efectoPolaridad":"buff","efectoDetalle":"Un truco rápido y ya no está: entra en sigilo casi sin esfuerzo.","efectoMods":[],"tiradaExtra":"","tiradaStat":"","efectoHpTurno":0}},
    {"rol":"choque liviano","concepto":"varios golpes","etiquetas":["sin auditar","de El origen","choque liviano","varios golpes","humanoide"],"creeps":["Goblin marcado"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Tajo frenético","nitrosCosto":"ATAQUE","cd":2,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0,"dadoExtra":"1d4"},"efectos":[]},"detalle":"Tira hozazos sin pensar. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un ataque con su hoz, +1d4 de daño (la hoz ya puede dejar Sangrado). ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"aguantar el daño","etiquetas":["sin auditar","de El origen","choque pesado","aguantar el daño","humanoide"],"creeps":["Goblin marcado"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"No siente el dolor","nitrosCosto":1,"cd":4,"duelo":{"objetivo":"aliado","conmigo":true,"tira":"","contra":[],"alcance":"fijo","alcanceN":0,"efectos":[{"nombre":"Vida extra","turnos":2,"escudo":10,"polaridad":"buff"}]},"detalle":"Aprieta los dientes y sigue: los próximos 10 de daño, vengan de donde vengan, no le bajan la vida (Vida extra 10, 2 turnos). ⚙ Automatizado: cuesta 1 No2; cooldown 4 (lenta: arranca con el cooldown activo); a sí mismo: Vida extra 10 por 2 turnos (lo que se gasta no vuelve). ✋ A mano: nada."}},
    {"rol":"rango","concepto":"área a distancia","etiquetas":["sin auditar","de El origen","rango","área a distancia","humanoide"],"creeps":["Kobold boom boom"],"nivel":2,"habilidad":{"nombre":"Cartucho","detalle":"Lanza un cartucho de dinamita que explota. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; elegís el centro dentro de su Rango y explota en una flor de diámetro 3 (7 casillas), aliados incluidos; tira su PdG una sola vez contra la Evasión de cada uno: 2d6+2 de fuego (lo frena la Defensa especial y la Res. fuego); quien gana la Evasión tiene dodge roll para salir. ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":"ATAQUE","tiradaExtra":"2d6+2","tiradaStat":"pdg","modo":"auto","duelo":{"objetivo":"area","radio":1,"alcance":"rango","tira":"pdg","contra":["eva"],"dano":true,"tipoDano":"fuego","fuegoAmigo":true,"efectos":[]}}},
    {"rol":"hunter","concepto":"trampas","etiquetas":["sin auditar","de El origen","rango","hunter","trampas","humanoide"],"creeps":["Kobold boom boom"],"nivel":2,"habilidad":{"nombre":"Cartucho enterrado","detalle":"Entierra un cartucho con mecha en una casilla: al pisarlo explota en una flor de diámetro 3 (7 casillas) con 3d6+3 directo a la vida, a todos los de adentro (aliados incluidos). ⚙ Automatizado: cuesta 3 No2; cooldown 3 (habilidad lenta: el combate arranca con el cooldown activo; la primera la deja puesta el GM antes de empezar); el GM elige la casilla con un clic; queda oculta a los jugadores (detectarla: dificultad = su Destreza); al pisarla, 💥 explota en el mapa y el anuncio pide tirar y aplicar el daño. ✋ A mano: nada.","cd":3,"costo":"","nitrosCosto":3,"cdArranca":true,"trampaColocar":{"nombre":"Cartucho enterrado","detalle":"Un cartucho con mecha enterrado: al pisarlo explota en una flor de diámetro 3 (7 casillas).","tipo":"flor","tamano":0,"efecto":{"area":"flor","radio":1},"dano":"3d6+3","ignoraDef":true,"amiga":true,"detectarStat":"fijo","elemento":"","cant":1,"detectar":6,"explota":true},"modo":"auto","duelo":null}},
    {"rol":"choque pesado","concepto":"carga que derriba","etiquetas":["sin auditar","de El origen","choque pesado","carga que derriba","humanoide"],"creeps":["Goblin jinete de lobo"],"nivel":2,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Carga montada","nitrosCosto":"ATAQUE","cd":3,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":1,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0,"dadoExtra":"1d6"},"efectos":[{"nombre":"Sentado"}]},"detalle":"Se lanza al galope con la lanza baja. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 3 (arranca disponible: así abre la pelea); va al duelo como un ataque con su lanza, +1 PdG y +1d6 de daño; si pega, queda Sentado. ✋ A mano: que llegue corriendo (la mesa decide si venía con envión)."}},
    {"rol":"mago","concepto":"fuego con quemadura","etiquetas":["sin auditar","de El origen","mago","fuego con quemadura","humanoide"],"creeps":["Kobold farolero"],"nivel":1,"habilidad":{"nombre":"Aceite hirviendo","detalle":"Salpica aceite caliente del farol: daño de fuego y el objetivo queda con Quemadura. ⚙ Automatizado: cuesta 1 No2; cooldown 2; elegís al objetivo a 2 casillas o menos; tira PdG.Esp contra su Evasión; si pega, 1d6+1 de fuego (lo frenan la Defensa especial y la Res. fuego) y Quemadura (2 de daño por turno, 3 turnos). ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":1,"tiradaExtra":"1d6+1","tiradaStat":"pdgmg","modo":"auto","duelo":{"objetivo":"enemigo","alcance":"fijo","alcanceN":2,"tira":"pdgmg","contra":["eva"],"dano":true,"tipoDano":"fuego","efectos":[{"nombre":"Quemadura"}]}}},
    {"rol":"debuffer","concepto":"ceguera","etiquetas":["sin auditar","de El origen","debuffer","ceguera","humanoide"],"creeps":["Kobold farolero"],"nivel":1,"habilidad":{"nombre":"Destello de farol","detalle":"Levanta el farol con un fogonazo: los que tiene adelante quedan con Ceguera. ⚙ Automatizado: cuesta 2 No2; cooldown 4 (habilidad lenta: el combate arranca con el cooldown activo); un cono al frente del kobold; tira su PdG.Esp una vez contra la Evasión de cada uno (si mira para otro lado a tiempo, se salva); los que pierden quedan con Ceguera 2 turnos (ven solo 1 casilla y −2 PdG). ✋ A mano: nada.","cd":4,"costo":"","nitrosCosto":2,"cdArranca":true,"modo":"auto","tiradaStat":"pdgmg","tiradaExtra":"","duelo":{"objetivo":"cono","tira":"pdgmg","contra":["eva"],"dano":false,"efectos":[{"nombre":"Ceguera","turnos":2}]}}},
    {"rol":"mago","concepto":"proyectil","etiquetas":["sin auditar","de El origen","mago","proyectil","cualquiera"],"creeps":["Chamán Goblin"],"nivel":2,"habilidad":{"nombre":"Proyectil mágico","costo":"","nitrosCosto":2,"cd":0,"detalle":"1d6 de daño directo a la vida.\nPdG vs Ev. para pegar","tiradaExtra":"","tiradaStat":"pdgmg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"cdArranca":false}},
    {"rol":"hunter","concepto":"trampas","etiquetas":["sin auditar","de El origen","rango","hunter","trampas","cualquiera"],"creeps":["Chamán Goblin"],"nivel":2,"habilidad":{"nombre":"Trampa de púas (El origen)","detalle":"Deja una trampa oculta de púas en una casilla: daño 2d6+2 a quien la pise. ⚙ Automatizado: cuesta 2 No2; cooldown 3; al usarla, coloca sola la trampa oculta al lado de su token en el mapa que ve el GM; cuando alguien la pisa, el mapa tira 2d6+2 y se lo aplica solo; los jugadores no la ven hasta que se dispara y la habilidad no se anuncia en la Mesa. ✋ A mano: nada, todo está automatizado.","cd":3,"costo":"","nitrosCosto":2,"trampaColocar":{"nombre":"Trampa de púas","detalle":"Deja una trampa oculta de púas en una casilla: daño 2d6+2 a quien la pise.","dano":"2d6+2","radio":0,"cant":1}}},
    {"rol":"rango","concepto":"tiro apuntado","etiquetas":["sin auditar","de El origen","rango","tiro apuntado","humanoide"],"creeps":["Goblin hondero","Kobold hondero"],"nivel":1,"habilidad":{"nombre":"Piedrazo a la cabeza","modo":"auto","nitrosCosto":"ATAQUE","costo":"","cd":3,"tiradaStat":"pdg","tiradaExtra":"","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Pajaritos","turnos":1}]},"detalle":"Le apunta a la cabeza desde lejos. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 3; va al duelo como un ataque con su honda (PdG contra la defensa que elija); si pega, Pajaritos 1 turno (aunque la armadura frene el daño). ✋ A mano: nada."}},
    {"rol":"rango","concepto":"área a distancia","etiquetas":["sin auditar","de El origen","rango","área a distancia","humanoide"],"creeps":["Goblin hondero"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"pdg","tiradaExtra":"2d6","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Lluvia de piedras (El origen)","nitrosCosto":5,"cd":4,"duelo":{"objetivo":"area","tira":"pdg","contra":["eva"],"dano":true,"tipoDano":"fisico","ignoraDano":false,"radio":1,"alcance":"rango","efectos":[{"nombre":"Demora"}],"fuegoAmigo":false},"detalle":"Revolea un puñado de piedras sobre un grupo: 2d6 de daño a cada uno que no la esquiva (se le resta la Defensa) y pierde un lugar en el orden de turnos (Demora). ⚙ Automatizado: cuesta 5 No2; cooldown 4 (lenta: el combate arranca con el cooldown activo); una flor de diámetro 3 (7 casillas) donde quiera dentro de su alcance; tira su PdG una vez contra la Evasión de cada uno (el que gana puede salir con un dodge roll); 2d6 de daño físico, menos la Defensa, y la Demora; no les pega a sus aliados. ✋ A mano: nada.","efectoPermanente":false,"automatizada":true}},
    {"rol":"choque liviano","concepto":"trabar","etiquetas":["sin auditar","de El origen","choque liviano","trabar","bestia"],"creeps":["Lobo gris"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Mordisco brutal","nitrosCosto":"ATAQUE","cd":2,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Rengo","turnos":1}]},"detalle":"Va a los tobillos. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un ataque con sus colmillos; si pega, Rengo 1 turno. ✋ A mano: nada.","efectoPermanente":false,"automatizada":true}},
    {"rol":"choque pesado","concepto":"más daño","etiquetas":["sin auditar","de El origen","choque pesado","más daño","bestia"],"creeps":["Lobo gris"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Mordisco furioso","nitrosCosto":"ATAQUE","cd":3,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0,"dadoExtra":"1d4"},"efectos":[]},"detalle":"Muerde y sacude. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 3 (lenta: arranca con el cooldown activo); va al duelo como un ataque con sus colmillos, +1d4 de daño. ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"más daño","etiquetas":["sin auditar","de El origen","choque pesado","más daño","humanoide"],"creeps":["Kobold Rabioso"],"nivel":1,"habilidad":{"nombre":"Picada","detalle":"Golpe pesado de pico: un ataque con su arma que suma +1d6 al daño. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un ataque (PdG contra Evasión o Parry, Bloqueo, crítico) con +1d6 de daño. ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":"ATAQUE","tiradaExtra":"2d6+1","tiradaStat":"pdg","modo":"auto","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0,"dadoExtra":"1d6"},"efectos":[]}}},
    {"rol":"choque pesado","concepto":"furia","etiquetas":["sin auditar","de El origen","choque pesado","furia","humanoide"],"creeps":["Kobold Rabioso"],"nivel":1,"habilidad":{"nombre":"Furia del filón","detalle":"Se enfurece: pega más seguido y más fuerte (+1 PdG y +2 al daño) por 2 turnos. ⚙ Automatizado: cuesta 2 No2; cooldown 3 (lenta: el combate arranca con el cooldown activo); se aplica a sí mismo +1 PdG y +2 Daño durante 2 turnos. ✋ A mano: nada.","cd":3,"costo":"","nitrosCosto":2,"cdArranca":true,"efectoNombre":"Furia del filón","efectoTurnos":2,"efectoStacks":1,"efectoPolaridad":"buff","efectoDetalle":"Se enfurece: +1 PdG y +2 al daño 2 turnos.","efectoMods":[{"stat":"pdg","val":1},{"stat":"dmg","val":2}]}},
    {"rol":"choque pesado","concepto":"pisotón","etiquetas":["sin auditar","de El origen","choque pesado","pisotón","humanoide"],"creeps":["Capataz kobold"],"nivel":3,"habilidad":{"nombre":"Golpe al piso","modo":"auto","nitrosCosto":"ATAQUE","costo":"","cd":2,"tiradaStat":"pdg","tiradaExtra":"","duelo":{"objetivo":"area","radio":1,"centroAlcance":1,"tira":"pdg","contra":["eva"],"dano":true,"tipoDano":"fisico","danoArma":true,"efectos":[{"nombre":"Sentado"}]},"detalle":"Descarga el garrote contra el piso y la onda tumba a los que están cerca. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; elegís una casilla pegada a él (si hay alguien, le pega a ese) y la onda alcanza a esa casilla y a las 6 de alrededor (flor de diámetro 3), solo a los rivales; tira su PdG una sola vez contra la Evasión de cada uno: el daño de su garrote (Tipo 10), que frena la Defensa; a quien le pega, lo deja Sentado; quien gana la Evasión tiene dodge roll para salir. ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"segundo aliento","etiquetas":["sin auditar","de El origen","choque pesado","segundo aliento","humanoide"],"creeps":["Capataz kobold"],"nivel":3,"habilidad":{"nombre":"Trago de grapa","modo":"semi","nitrosCosto":1,"costo":"","cd":4,"tiradaStat":"","tiradaExtra":"","efectoNombre":"Grapa del capataz","efectoTurnos":3,"efectoPolaridad":"buff","efectoMods":[{"stat":"pdg","val":2},{"stat":"dmg","val":2}],"efectoDetalle":"Probabilidad de Golpe +2 y Daño +2 mientras dure (3 turnos).","detalle":"Se manda un trago de la petaca de grapa: le raspa la garganta y sale con más ganas. ⚙ Automatizado: cuesta 1 No2 (lo mismo que tomar algo del cinturón); cooldown 4; se pone «Grapa del capataz» 3 turnos: +2 a la Probabilidad de Golpe y +2 al Daño. ✋ A mano: nada."}},
    {"rol":"jefe","concepto":"refuerzos","etiquetas":["sin auditar","de El origen","jefe","refuerzos","bestia"],"creeps":["Rata de alcantarilla"],"nivel":1,"habilidad":{"nombre":"Plaga en la galería","detalle":"Mal herida, chilla y llama a la manada: aparecen 2 ratas más donde el GM elija. Solo con menos de la mitad de la vida. ⚙ Automatizado: cuesta 2 No2; sin cooldown: la única condición es tener menos del 50 % de la vida (si tiene más, avisa y pregunta); al ejecutarla, el GM elige en el mapa (un clic por cada una) dónde aparece cada rata: son copias recién llegadas (vida llena, sin estados y sin esta habilidad: no llaman a más) y entran al orden de turnos detrás de la que chilló. ✋ A mano: nada.","cd":0,"costo":"","nitrosCosto":2,"cdArranca":false,"refuerzos":{"cant":2},"modo":"auto","automatizada":true,"soloVidaMenos":50}},
    {"rol":"debuffer","concepto":"maleficio","etiquetas":["sin auditar","de El origen","debuffer","maleficio","humanoide"],"creeps":["Kobold maldiciente"],"nivel":2,"habilidad":{"nombre":"Mal de ojo (El origen)","detalle":"Le echa el mal de ojo: el objetivo queda Debilitado 2 turnos (−1 a todas sus tiradas: ataque, defensas, daño, resistencias). ⚙ Automatizado: cuesta 1 No2; cooldown 2; elegís al objetivo en su Rango; tira PdG.Esp contra su Res.Esp y, si gana, le aplica Debilitado 2 turnos. ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":1,"modo":"auto","tiradaStat":"pdgmg","tiradaExtra":"","duelo":{"objetivo":"enemigo","tira":"pdgmg","contra":["resmg"],"dano":false,"efectos":[{"nombre":"Debilitado","turnos":2}]}}},
    {"rol":"debuffer","concepto":"maleficio","etiquetas":["sin auditar","de El origen","debuffer","maleficio","humanoide"],"creeps":["Kobold maldiciente"],"nivel":2,"habilidad":{"modo":"auto","nombre":"Maldición de la sangre","costo":"","nitrosCosto":2,"cd":3,"cdArranca":false,"tiradaStat":"pdgmg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"duelo":{"objetivo":"enemigo","tira":"pdgmg","contra":["resmg"],"dano":false,"efectos":[{"nombre":"Maldito","turnos":2}]},"detalle":"Le maldice la magia: por 2 turnos, cada punto de SP que gaste le saca 1 de vida, directo, en el momento de pagar (antes de que salga el efecto; puede dejarlo caído). ⚙ Automatizado: cuesta 2 No2; cooldown 3; elegís al objetivo en su Rango; tira PdG.Esp contra su Res.Esp y, si gana, le aplica Maldito 2 turnos (antes de pagar SP le avisa cuánta vida le va a bajar, con Aceptar o Cancelar; al pagar, la vida se descuenta sola). ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"guardia","etiquetas":["sin auditar","de El origen","choque pesado","guardia","humanoide"],"creeps":["Kobold escudero de barril"],"nivel":1,"habilidad":{"nombre":"Tapa de barril","detalle":"Se cubre con una tapa de barril: +3 Defensa, +3 Armadura mágica y +1 a la resistencia a todos los críticos hasta que empieza su próximo turno. ⚙ Automatizado: cuesta 1 No2; cooldown 2; se aplica a sí mismo +3 Defensa, +3 Armadura mágica y +1 de resistencia a crítico (Tipos 4 a 12) durante 1 turno (lo cubre de los golpes de la ronda). ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":1,"efectoNombre":"Tapa de barril","efectoTurnos":1,"efectoStacks":1,"efectoPolaridad":"buff","efectoDetalle":"Detrás de la tapa: +3 Defensa, +3 Armadura mágica y +1 a la resistencia a todos los críticos hasta que empieza su próximo turno.","efectoMods":[{"stat":"def","val":3},{"stat":"armadmg","val":3},{"stat":"tipo1","val":1},{"stat":"tipo2","val":1},{"stat":"tipo3","val":1},{"stat":"tipo4","val":1},{"stat":"tipo5","val":1}]}},
    {"rol":"choque pesado","concepto":"provocar","etiquetas":["sin auditar","de El origen","choque pesado","provocar","humanoide"],"creeps":["Kobold escudero de barril"],"nivel":1,"habilidad":{"modo":"auto","nombre":"¡Tu vieeeja!","costo":"","nitrosCosto":1,"cd":3,"cdArranca":false,"tiradaStat":"pdgmg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"duelo":{"objetivo":"enemigo","tira":"pdgmg","tiraBono":1,"contra":["resm"],"alcance":"rango","efectos":[{"nombre":"Provocado","turnos":2}]},"detalle":"Golpea la tapa con el palo y le grita a un rival dentro de su Rango: si gana, el rival queda Provocado 2 turnos y tiene que ir contra el escudero (atacarlo o usar contra él una habilidad hostil; si no llega, acercarse). Es el Taunt del Tanque: tira PdG.Esp +1 contra la Res.Mt del rival. ⚙ Automatizado: cuesta 1 No2; cooldown 3; si gana, le pone Provocado 2 turnos. ✋ A mano: respetar la provocación (lo hace el jugador o el GM)."}},
    {"rol":"debuffer","concepto":"veneno","etiquetas":["sin auditar","de El origen","debuffer","veneno","cualquiera"],"creeps":["Chamán Goblin"],"nivel":2,"habilidad":{"nombre":"Veneno (El origen)","costo":"","nitrosCosto":1,"cd":2,"detalle":"Aplica 3 stacks de veneno.","tiradaExtra":"","tiradaStat":"pdgmg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[]}},
    {"rol":"hunter","concepto":"trampas","etiquetas":["sin auditar","de El origen","rango","hunter","trampas","cualquiera"],"creeps":["Chamán Goblin"],"nivel":2,"habilidad":{"nombre":"Trampa de raíces (El origen)","detalle":"Deja una trampa de raíces en una casilla adyacente: quien la pise queda Inmovilizado 2 turnos. ⚙ Automatizado: cuesta 2 No2; cooldown 4 (habilidad lenta: el combate arranca con el cooldown activo); al usarla, coloca sola la trampa oculta al lado de su token en el mapa que ve el GM; los jugadores no la ven hasta que se dispara y la habilidad no se anuncia en la Mesa; cuando alguien pisa la trampa, le aplica solo el estado Inmovilizado (2 turnos). ✋ A mano: nada, todo está automatizado.","cd":4,"costo":"","nitrosCosto":2,"cdArranca":true,"trampaColocar":{"nombre":"Trampa de raíces","detalle":"Deja una trampa de raíces en una casilla adyacente: quien la pise queda Inmovilizado 2 turnos.","dano":"","radio":0,"cant":1,"estado":{"nombre":"Inmovilizado","turnos":2}}}},
    {"rol":"choque pesado","concepto":"perforar","etiquetas":["sin auditar","de El origen","choque pesado","perforar","humanoide"],"creeps":["Goblin de choque"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Ensartar y sostener","nitrosCosto":"ATAQUE","cd":2,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":2},"efectos":[{"nombre":"Lento","turnos":1}]},"detalle":"Le clava la lanza y lo frena: Perfora 2 (2 puntos del golpe pasan siempre la armadura) y, si pega, queda Lento. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un ataque con su lanza (llega a 2 casilleros) con Perfora 2; si pega, Lento 1 turno. ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"cubrir al de al lado","etiquetas":["sin auditar","de El origen","choque pesado","cubrir al de al lado","humanoide"],"creeps":["Goblin de choque","Goblin portaestandarte"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Pared de escudos","nitrosCosto":1,"cd":3,"duelo":{"objetivo":"aliado","conmigo":true,"tira":"","contra":[],"alcance":"fijo","alcanceN":1,"efectos":[{"nombre":"Endurecido","polaridad":"buff"}]},"detalle":"Levanta el escudo para cubrirse o cubrir al de al lado. ⚙ Automatizado: cuesta 1 No2; cooldown 3 (lenta: arranca con el cooldown activo); a sí mismo o a un aliado pegado: Endurecido. ✋ A mano: nada."}},
    {"rol":"rango","concepto":"atravesar armadura","etiquetas":["sin auditar","de El origen","rango","atravesar armadura","humanoide"],"creeps":["Kobold ballestero","Kobold ballestero de ojo fino"],"nivel":2,"habilidad":{"nombre":"Virote a las juntas","modo":"auto","nitrosCosto":"ATAQUE","cd":2,"tiradaStat":"pdg","tiradaExtra":"","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":2},"efectos":[{"nombre":"Armadura rota"}]},"detalle":"Apunta a las uniones de la armadura. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un disparo con su ballesta, con Perfora 2 (2 puntos del golpe pasan siempre la Defensa); si pega, Armadura rota segura (sin tirar). ✋ A mano: nada."}},
    {"rol":"rango","concepto":"crítico","etiquetas":["sin auditar","de El origen","rango","crítico","humanoide"],"creeps":["Kobold ballestero de ojo fino"],"nivel":2,"habilidad":{"nombre":"Ojo entrecerrado","modo":"auto","costo":"","nitrosCosto":1,"cd":3,"cdArranca":false,"efectoNombre":"Ojo entrecerrado","efectoTurnos":2,"efectoStacks":1,"efectoPolaridad":"buff","efectoDetalle":"Apunta con calma: Crítico frecuente +1 durante 2 turnos.","efectoMods":[{"stat":"crit","val":1}],"detalle":"Entrecierra un ojo y apunta con calma: sus disparos hacen crítico más seguido (Crítico frecuente +1) por 2 turnos. ⚙ Automatizado: cuesta 1 No2; cooldown 3; no cuenta como ataque (la usa y dispara en el mismo turno); se aplica a sí mismo Crítico frecuente +1 durante 2 turnos. ✋ A mano: nada."}},
    {"rol":"choque pesado","concepto":"más daño","etiquetas":["sin auditar","de El origen","choque pesado","más daño","cualquiera"],"creeps":["Goblin del bosque 1","Goblin del bosque 2","Goblin del bosque 3"],"nivel":1,"habilidad":{"nombre":"Garrotazo","costo":"","nitrosCosto":"ATAQUE","cd":3,"detalle":"Golpe extra fuerte. +1 dado de arma como daño adicional. \n50% de chances de dejar en pajaritos.","tiradaExtra":"","tiradaStat":"pdg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[]}},
    {"rol":"choque pesado","concepto":"pisotón","etiquetas":["sin auditar","de El origen","choque pesado","pisotón","cualquiera"],"creeps":["Goblin del bosque 1","Goblin del bosque 2","Goblin del bosque 3"],"nivel":1,"habilidad":{"nombre":"Caida de culo","costo":"","nitrosCosto":1,"cd":1,"detalle":"Se tira de culo al suelo y hace una onda expansiva en flor que hace daño igual a FUE vs CON y tira un casillero para atrás al rival. 50% de dejar sentado.","tiradaExtra":"","tiradaStat":"fue","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[]}},
    {"rol":"rango","concepto":"flecha con veneno","etiquetas":["sin auditar","de El origen","rango","flecha con veneno","humanoide"],"creeps":["Goblin arquero del claro"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Flecha untada","nitrosCosto":"ATAQUE","cd":2,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Veneno","stacks":3}]},"detalle":"La punta viene untada con algo verde que le dio el ocultista: si pega, deja Veneno ×3, aunque la armadura pare la flecha. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un disparo con su arco; si pega, Veneno ×3 (entra aunque no haga daño). ✋ A mano: nada."}},
    {"rol":"rango","concepto":"tiro apuntado","etiquetas":["sin auditar","de El origen","rango","tiro apuntado","humanoide"],"creeps":["Goblin arquero del claro"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Tiro certero","nitrosCosto":"ATAQUE","cd":3,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":2,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":1,"critpotBono":0,"perfora":0},"efectos":[]},"detalle":"Se toma su tiempo y apunta bien. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 3 (lenta: arranca con el cooldown activo); va al duelo como un disparo con su arco, +2 PdG y +1 al Crítico frecuente. ✋ A mano: nada."}},
    {"rol":"choque liviano","concepto":"varios golpes","etiquetas":["sin auditar","de El origen","choque liviano","varios golpes","humanoide"],"creeps":["Ladron del monte"],"nivel":1,"habilidad":{"nombre":"Golpe doble (El origen)","detalle":"Dos cuchilladas rápidas en el mismo movimiento. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un ataque con su arma que tira dos veces el daño del cuchillo (1d4+1 y 1d4+1) e ignora 1 de Resistencia a crítico; si viene en sigilo y por la espalda, +2 de daño. ✋ A mano: nada.","cd":2,"costo":"","nitrosCosto":"ATAQUE","tiradaExtra":"","cdArranca":false,"tiradaStat":"pdg","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"modo":"auto","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":1,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":1,"critBono":0,"critpotBono":0,"perfora":0,"dadoExtra":"1d4","espaldaFijo":2},"efectos":[]}}},
    {"rol":"choque liviano","concepto":"bajo tierra","etiquetas":["sin auditar","de El origen","choque liviano","bajo tierra","humanoide"],"creeps":["Kobold tunelero"],"nivel":2,"habilidad":{"nombre":"Excavar (El origen)","modo":"auto","nitrosCosto":1,"costo":"","cd":2,"tiradaStat":"","tiradaExtra":"","excavar":true,"duelo":{"objetivo":"uno mismo","tira":"","contra":[],"efectos":[]},"detalle":"Se mete en la tierra. ⚙ Automatizado: cuesta 1 No2; cooldown 2; el token queda bajo tierra: en su casilla se ve un pozo, el token no se ve y nadie lo puede elegir de objetivo (ni le llega un área, un salto eléctrico ni un ataque de oportunidad) hasta que salga con la Puñalada desde abajo. ✋ A mano: nada."}},
    {"rol":"choque liviano","concepto":"bajo tierra","etiquetas":["sin auditar","de El origen","choque liviano","bajo tierra","humanoide"],"creeps":["Kobold tunelero"],"nivel":2,"habilidad":{"nombre":"Puñalada desde abajo","modo":"auto","nitrosCosto":"ATAQUE","costo":"","cd":2,"tiradaStat":"pdg","tiradaExtra":"","emerger":{"distancia":4,"pdg":3},"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":1,"critpotBono":0,"perfora":0,"dadoExtra":"1d6"},"efectos":[{"nombre":"Rengo","turnos":1}],"critico":{"efectos":[{"nombre":"Rengo","turnos":2},{"nombre":"Lisiado","turnos":1}]}},"detalle":"Sale de la tierra y apuñala de abajo para arriba, a las piernas. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; si está bajo tierra, primero elegís por dónde sale (una casilla libre a 4 o menos del pozo) y después a quién le pega, con +3 a la Probabilidad de Golpe por salir de abajo; va al duelo como un ataque con su arma, +1d6 de daño y +1 al crítico; si pega, Rengo 1 turno; si es crítico, Rengo 2 turnos y Lisiado 1 turno. Si no está bajo tierra, avisa y se puede usar igual como un ataque común (sin el +3). ✋ A mano: nada."}},
    {"rol":"hunter","concepto":"domador","etiquetas":["sin auditar","de El origen","rango","hunter","domador","humanoide"],"creeps":["Goblin domador"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"¡Azuzar!","nitrosCosto":1,"cd":3,"duelo":{"objetivo":"aliado","conmigo":false,"tira":"","contra":[],"alcance":"fijo","alcanceN":4,"efectos":[{"nombre":"Azuzado","turnos":2,"polaridad":"buff","mods":[{"stat":"pdg","val":2},{"stat":"dmg","val":2}],"detalle":"Azuzado: +2 a la PdG y +2 de daño."}]},"detalle":"Le grita a un lobo (o a otro aliado) para que muerda con ganas: queda Azuzado, +2 a la PdG y +2 de daño por 2 turnos. ⚙ Automatizado: cuesta 1 No2; cooldown 3; a un aliado a 4 casilleros o menos: Azuzado (+2 PdG, +2 daño, 2 turnos). ✋ A mano: nada."}},
    {"rol":"hunter","concepto":"domador","etiquetas":["sin auditar","de El origen","rango","hunter","domador","humanoide"],"creeps":["Goblin domador"],"nivel":1,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"pdg","tiradaExtra":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Chasquido","nitrosCosto":"ATAQUE","cd":3,"duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Miedo","turnos":1}]},"detalle":"Hace restallar el rebenque al lado de la cara. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 3 (lenta: arranca con el cooldown activo); va al duelo como un ataque con su rebenque; si pega, Miedo 1 turno. ✋ A mano: lo que hace el Miedo, como dice el estado."}},
    {"rol":"rango","concepto":"empujar a distancia","etiquetas":["sin auditar","de El origen","rango","empujar a distancia","humanoide"],"creeps":["Kobold hondero"],"nivel":1,"habilidad":{"nombre":"Piedra pesada","modo":"auto","nitrosCosto":2,"cd":3,"tiradaStat":"pdg","tiradaExtra":"","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Demora"}]},"detalle":"Una piedra grande al pecho: el golpe lo hace trastabillar y pierde su lugar. ⚙ Automatizado: cuesta 2 No2; cooldown 3; va al duelo como un tiro con su honda; si pega, Demora: el objetivo baja 1 lugar en el orden de turnos. ✋ A mano: nada."}},
    {"rol":"support","concepto":"arma elemental","etiquetas":["sin auditar","de El origen","support","arma elemental","humanoide"],"creeps":["Kobold hongero"],"nivel":3,"habilidad":{"nombre":"Untar veneno","modo":"auto","nitrosCosto":2,"costo":"","cd":3,"tiradaStat":"","tiradaExtra":"","duelo":{"objetivo":"aliado","conmigo":true,"tira":"","contra":[],"alcance":"fijo","alcanceN":2,"efectos":[{"nombre":"Arma envenenada","polaridad":"buff"}]},"detalle":"Le unta el arma a un aliado con jugo de hongo venenoso. ⚙ Automatizado: cuesta 2 No2; cooldown 3; elegís un aliado a 2 casillas o menos (o él mismo) y le pone «Arma envenenada»: sus próximos 2 golpes con arma hacen +3 de daño y Veneno ×3. ✋ A mano: nada."}},
    {"rol":"hunter","concepto":"trampas","etiquetas":["sin auditar","de El origen","rango","hunter","trampas","humanoide"],"creeps":["Kobold hongero"],"nivel":3,"habilidad":{"nombre":"Pedo de lobo","modo":"auto","nitrosCosto":2,"costo":"","cd":3,"tiradaStat":"","tiradaExtra":"","trampaColocar":{"nombre":"Pedo de lobo","detalle":"Un hongo esponjoso que, al pisarlo, revienta y libera una nube de esporas.","tipo":"flor","tamano":0,"efecto":{"area":"flor","radio":1},"estado":"Pajaritos","estadoTurnos":2,"amiga":true,"detectarStat":"dmgesp","cant":1,"salvacion":{"stat":"rescc","etq":"Res.CC","dif":9,"que":"efecto"}},"detalle":"Esconde en una casilla un pedo de lobo: un hongo redondo y esponjoso que, al pisarlo, revienta y libera una nube de esporas. ⚙ Automatizado: cuesta 2 No2; cooldown 3; coloca una trampa (la dificultad para verla sale de su Efecto especial); al pisarla, una nube de esporas en una flor de diámetro 3 (7 casillas, aliados incluidos): quien no se resiste (Res.CC contra 9, su Efecto especial) queda Pajaritos 2 turnos (PdG y Evasión a la mitad). ✋ A mano: nada."}},
    {"rol":"mago","concepto":"proyectil","etiquetas":["sin auditar","de El origen","mago","proyectil","humanoide"],"creeps":["Chamán goblin"],"nivel":2,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdgmg","tiradaExtra":"1d6+2","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Espina de sombra","nitrosCosto":2,"cd":2,"duelo":{"objetivo":"enemigo","alcance":"rango","tira":"pdgmg","contra":["eva"],"dano":true,"tipoDano":"arcano","efectos":[]},"detalle":"Escupe una espina negra que no la para ninguna armadura. ⚙ Automatizado: cuesta 2 No2; cooldown 2; tira PdG.Esp contra la Evasión; si pega, 1d6+2 de daño arcano (directo: no lo frena la Defensa). ✋ A mano: nada."}},
    {"rol":"debuffer","concepto":"inmovilizar","etiquetas":["sin auditar","de El origen","debuffer","inmovilizar","humanoide"],"creeps":["Chamán goblin"],"nivel":2,"habilidad":{"nombre":"Trampa de sombra","detalle":"Teje una red de sombra en una casilla a 3 o menos: el que la pisa queda Inmovilizado 1 turno, sin daño. Casi no se ve (Percepción contra su Ef.Esp), y soltarse cuesta: Fuerza contra 6 (1 No2). ⚙ Automatizado: cuesta 2 No2; cooldown 3; el GM elige la casilla en el mapa (hasta 3 casilleros; avisa si queda más lejos) y la trampa queda oculta, sin anunciarse en la Mesa; se detecta con Percepción contra su Ef.Esp (Percepción aumentada o Pisada atenta); al pisarla, Inmovilizado 1 turno; 🔓 soltarse: Fuerza contra 6, 1 No2. ✋ A mano: nada.","cd":3,"costo":"","nitrosCosto":2,"trampaColocar":{"nombre":"Trampa de sombra","detalle":"Una red de sombra: quien la pisa queda Inmovilizado 1 turno; sin daño. 🔓 Soltarse: Fuerza contra 6 (1 No2).","dano":"","radio":0,"cant":1,"color":"#5B3C88","estado":{"nombre":"Inmovilizado","turnos":1},"alcance":3,"detectarStat":"dmgesp","soltar":{"stat":"fue","etq":"Fuerza","dif":6,"no2":1}},"cdArranca":false,"tiradaExtra":"","tiradaStat":"","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"modo":"auto"}},
    {"rol":"mago","concepto":"daño en área","etiquetas":["sin auditar","de El origen","mago","daño en área","humanoide"],"creeps":["Chamán del cristal"],"nivel":2,"habilidad":{"nombre":"Granizo de cristal","modo":"auto","nitrosCosto":3,"costo":"","cd":3,"tiradaStat":"pdgmg","tiradaExtra":"1d6+2","duelo":{"objetivo":"area","radio":1,"alcance":"rango","tira":"pdgmg","contra":["eva"],"dano":true,"tipoDano":"hielo","fuegoAmigo":true,"efectos":[],"porDano":{"estado":"Escarcha","desde":5,"tope":1}},"detalle":"Hace caer un granizo de cristal helado. ⚙ Automatizado: cuesta 3 No2; cooldown 3; elegís el centro dentro de su Rango y cae en una flor de diámetro 3 (7 casillas), aliados incluidos; tira su PdG.Esp una sola vez contra la Evasión de cada uno: 1d6+2 de hielo (lo frena la Armadura mágica y la Res. hielo); a quien le entran 5 o más de daño le deja 1 de Escarcha; quien gana la Evasión tiene dodge roll para salir. ✋ A mano: nada."}},
    {"rol":"support","concepto":"escudo a un aliado","etiquetas":["sin auditar","de El origen","support","escudo a un aliado","humanoide"],"creeps":["Chamán del cristal"],"nivel":2,"habilidad":{"nombre":"Cristal protector","modo":"auto","nitrosCosto":1,"cd":2,"tiradaStat":"","tiradaExtra":"","duelo":{"objetivo":"aliado","conmigo":true,"tira":"","contra":[],"alcance":"fijo","alcanceN":4,"efectos":[{"nombre":"Endurecido","polaridad":"buff"}]},"detalle":"Recubre a un aliado (o a sí mismo) con una costra de cristal. ⚙ Automatizado: cuesta 1 No2; cooldown 2; elige un aliado a 4 casillas o menos (o a sí mismo) y le pone Endurecido: +3 de Defensa, +3 de Armadura mágica y +1 a la resistencia a crítico, por 2 turnos. ✋ A mano: nada."}},
    {"rol":"rango","concepto":"trabar","etiquetas":["sin auditar","de El origen","rango","trabar","humanoide"],"creeps":["Kobold ballestero"],"nivel":2,"habilidad":{"nombre":"Virote al pie","modo":"auto","nitrosCosto":"ATAQUE","costo":"","cd":2,"tiradaStat":"pdg","tiradaExtra":"","duelo":{"modo":"arma","objetivo":"enemigo","x":"nitros","arma":{"pdg":0,"pdgPorX":0,"dadosPorX":0,"fijo":0,"fijoPorX":0,"sinParry":false,"ignoraResistCrit":0,"critBono":0,"critpotBono":0,"perfora":0},"efectos":[{"nombre":"Lento","turnos":2}]},"detalle":"Un virote al pie para que no lo alcancen. ⚙ Automatizado: cuesta lo mismo que un ataque y cuenta como uno; cooldown 2; va al duelo como un disparo con su ballesta; si pega, Lento 2 turnos (el primer casillero que se mueve en cada turno cuesta el doble), aunque la armadura pare el daño. ✋ A mano: nada."}},
    {"rol":"debuffer","concepto":"inmovilizar","etiquetas":["sin auditar","de El origen","debuffer","inmovilizar","humano"],"creeps":["El ocultista"],"nivel":3,"habilidad":{"modo":"auto","costo":"","cdArranca":false,"tiradaStat":"pdgmg","tiradaExtra":"1d4","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Grilletes de sombra","nitrosCosto":2,"cd":3,"duelo":{"objetivo":"enemigo","alcance":"rango","tira":"pdgmg","contra":["resmg"],"efectos":[{"nombre":"Inmovilizado","turnos":1}],"dano":true,"tipoDano":"arcano"},"detalle":"Las sombras de los árboles le agarran los pies y aprietan: si gana, 1d4 de daño arcano y queda Inmovilizado 1 turno. ⚙ Automatizado: cuesta 2 No2; cooldown 3; tira PdG.Esp contra la Res.Esp del objetivo; si gana, 1d4 de daño arcano (no lo frena la Defensa) e Inmovilizado 1 turno. ✋ A mano: nada."}},
    {"rol":"mago","concepto":"daño en área","etiquetas":["sin auditar","de El origen","mago","daño en área","humano"],"creeps":["El ocultista"],"nivel":3,"habilidad":{"modo":"auto","costo":"","cdArranca":true,"tiradaStat":"pdgmg","tiradaExtra":"2d6+2","efectoNombre":"","efectoTurnos":0,"efectoStacks":1,"efectoHpTurno":0,"efectoDetalle":"","efectoPolaridad":"otro","efectoMods":[],"nombre":"Estallido de sombras","nitrosCosto":2,"cd":4,"duelo":{"objetivo":"area","radio":1,"alcance":"rango","tira":"pdgmg","contra":["eva"],"dano":true,"tipoDano":"arcano","fuegoAmigo":false,"efectos":[]},"detalle":"Revienta una bola de oscuridad sobre un grupo: 2d6+2 de daño arcano a cada uno que no la esquiva, y la armadura no lo frena. ⚙ Automatizado: cuesta 2 No2; cooldown 4 (lenta: arranca con el cooldown activo); una flor de diámetro 3 (7 casillas) donde quiera dentro de su alcance; tira PdG.Esp una vez contra la Evasión de cada uno (el que gana puede salir con un dodge roll); 2d6+2 de daño arcano (directo); no les pega a sus aliados. ✋ A mano: nada."}},
  ];
  ORIGEN.forEach(o => lista.push({poolId: 'hab-origen-' + slug(o.habilidad.nombre), nombre: o.habilidad.nombre, etiquetas: o.etiquetas,
    detalle: String(o.habilidad.detalle || '') + ` (De «El origen»: ${o.creeps.join(', ')}, nivel ${o.nivel}.)`, datos: {habilidad: o.habilidad}, rol: o.rol, concepto: o.concepto}));

  /* 📦 El catálogo y el archivo (2026-10-26, dueño: «vamos a dejar estos skills de creep como los que son los de base. Todos los viejos los archivamos, ya no
     cuentan. Cuando una persona quiere crear un creep y quiere ver los skills prediseñados, tiene que ver estos»): las auditadas son el catálogo
     (HABILIDADES_CREEP_CATALOGO); las demás (las de fábrica sin auditar y las de «El origen») quedan archivadas (HABILIDADES_CREEP_ARCHIVO, con la
     etiqueta «archivada»). HABILIDADES_CREEP_BASE sigue con todas (las buscan por nombre las pruebas, la auditoría y el simulador). */
  lista.forEach(e => { if(!e.etiquetas.includes('auditada')){ e.archivada = true; if(!e.etiquetas.includes('archivada')) e.etiquetas.push('archivada'); } });
  window.HABILIDADES_CREEP_BASE = lista;
  window.HABILIDADES_CREEP_CATALOGO = lista.filter(e => !e.archivada);
  window.HABILIDADES_CREEP_ARCHIVO = lista.filter(e => e.archivada);

  // Arma la habilidad de un creep del nivel dado a partir de una entrada de la biblioteca.
  // Una versión editada y propuesta a la biblioteca (`datos.habilidad`) ya viene calculada: se copia tal cual, sin escalar con el nivel.
  window.armarHabilidadDeCreep = function(datos, nivel){
    if(datos && datos.habilidad) return structuredClone(datos.habilidad);
    const n = Math.max(1, Math.min(20, Math.round(Number(nivel) || 1)));
    return U.armarHab(datos.sp, n, datos.cd, !!datos.lenta);
  };
})();
