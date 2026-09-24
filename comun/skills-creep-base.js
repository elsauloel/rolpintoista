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
  const RO = {m: 'melee', t: 'tanque', e: 'emboscador', r: 'rango', g: 'mágico', a: 'apoyo', x: 'debuffer'};
  const FN = {D: 'daño', T: 'defensa', B: 'buff', X: 'debuff', C: 'curación', K: 'control', M: 'movilidad', I: 'invocación', A: 'área'};
  const aT = (detalle, dano) => ({detalle, no2: 'ATAQUE', dano});
  const zO = (detalle, no2, dano) => ({detalle, no2, dano});
  const tA = (detalle, no2) => ({detalle, no2});
  const bU = (detalle, no2, mods, turnos) => ({detalle, no2, efecto: {mods, turnos}});
  const cU = (detalle, no2, k) => ({detalle, no2, cura: k});
  const dC = (detalle, no2, dano, k) => ({detalle, no2, dano, cura: k});
  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Estado del juego sobre sí mismo (preset de GM Tools: Sigilo, Invulnerable, Espinas…). turnos 0 = hasta que se lo saquen.
  const eS = (detalle, no2, nombre, polaridad, turnos, extra) => ({detalle, no2, efecto: {mods: (extra && extra.mods) || {}, turnos, nombre, polaridad, hp: (extra && extra.hp) || 0}});
  // Trampa: el daño ({T} en la descripción) escala con el nivel; se coloca con Terreno y Formas → Trampa.
  const tR = (detalle, no2, codigo) => ({detalle, no2, trampa: codigo});
  const tS = (detalle, no2) => ({detalle, no2, colocar: true});   // trampa sin daño (alarma, red, humo…)
  const lista = [];

  // fn: función (D T B X C K M I A); mec: mecánicas del juego que usa, separadas por coma (sigilo, trampas, terreno…);
  // el objetivo (sí mismo / un enemigo / zona / aliados / terreno) se deduce de la descripción salvo que se pase en mec.
  function H(nombre, fn, razas, roles, cd, spBase, mec){
    const sp = {nombre, ...spBase};
    if(sp.magico === undefined && roles.includes('g')) sp.magico = true;   // rol mágico: pega con PdG.Mg
    const lenta = cd >= 4;
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
      etiquetas: [...new Set([...etiquetas, lenta ? 'lenta' : 'rápida', ...razasTxt, ...rolesTxt, ...objTags, ...mecPuras, aMano ? 'con parte a mano' : 'toda automatizada'])],
      detalle: sp.detalle.replace(/\{T\}/g, '(daño según el nivel)'), datos: {sp, cd, lenta},
    });
  }

  /* ================= DAÑO CUERPO A CUERPO ================= */
  H('Golpe fuerte', 'D', '*', 'mt', 2, aT('Un golpe cargado con todo el peso.', 'M'));
  H('Tajo veloz', 'D', '*', 'me', 2, aT('Un corte rápido y certero.', 'L'));
  H('Estocada', 'D', 'hd', 'me', 2, aT('Una punzada directa al punto débil.', 'L'));
  H('Golpe aplastante', 'D', '*', 'mt', 4, zO('Un golpe devastador que casi no se puede esquivar.', 3, 'H'));
  H('Embestida', 'DK', 'b', 'mt', 3, zO('Carga con todo el cuerpo y empuja al objetivo un casillero (a mano).', 3, 'M'));
  H('Zarpazo', 'D', 'b', 'me', 2, aT('Un zarpazo salvaje.', 'L'));
  H('Mordisco feroz', 'D', 'b', 'me', 2, aT('Una mordida profunda.', 'M'));
  H('Mordisco venenoso', 'DX', 'b', 'ex', 3, zO('Muerde y, si golpea, tirá 1d4: con 1 el objetivo queda Envenenado (a mano).', 2, 'L'));
  H('Cornada', 'D', 'b', 'mt', 2, aT('Embiste con los cuernos.', 'M'));
  H('Coletazo', 'DA', 'bc', 'mt', 3, zO('Un giro de cola que golpea a los adyacentes (a mano).', 3, 'M'));
  H('Golpe doble', 'D', '*', 'me', 3, zO('Dos ataques seguidos: se tira el daño dos veces (a mano la segunda).', 3, 'M'));
  H('Remate', 'D', '*', 'me', 4, zO('Un golpe de gracia contra alguien herido: si el objetivo tiene menos de la mitad de HP, +1 dado (a mano).', 3, 'M'));
  H('Puñalada trapera', 'D', 'hd', 'e', 4, zO('Ataca desde un flanco o por la espalda: si el objetivo no lo vio, el daño se duplica (a mano).', 3, 'M'));
  H('Corte profundo', 'DX', 'hd', 'me', 3, zO('Una herida abierta: el objetivo queda Sangrando 3 turnos (a mano).', 2, 'L'));
  H('Golpe de escudo', 'DK', 'hdc', 'mt', 3, zO('Golpea con el escudo: el objetivo pierde 1 No2 (a mano).', 2, 'L'));
  H('Barrido', 'DA', '*', 'mt', 3, zO('Un gran arco que golpea a los adyacentes (a mano).', 3, 'M'));
  H('Torbellino de acero', 'DA', 'hd', 'm', 5, zO('Gira sobre sí mismo golpeando a todos los adyacentes (a mano).', 4, 'H'));
  H('Pisotón', 'DAK', 'bc', 'mt', 4, zO('Una pisada que sacude el suelo: los adyacentes caen al piso (a mano).', 3, 'M'));
  H('Golpe de pomo', 'DK', 'hd', 'mx', 2, aT('Un golpe seco en la cabeza: si el objetivo falla Fuerza queda Pajarito hasta el final de su turno (a mano).', 'L'));
  H('Ataque de furia', 'D', '*', 'm', 5, zO('Ataca sin pensar en la defensa: daño enorme.', 4, 'H'));
  H('Tackle', 'DK', 'hdb', 'mt', 3, zO('Se lanza contra el objetivo y lo derriba (a mano).', 2, 'L'));
  H('Zarpazo desgarrador', 'DX', 'b', 'me', 3, zO('Garras que abren la carne: el objetivo queda Sangrando (a mano).', 2, 'M'));
  H('Golpe de gracia', 'D', '*', 'm', 6, zO('El golpe más fuerte que sabe dar; nadie sigue igual después.', 4, 'H'));
  H('Ráfaga de golpes', 'D', 'hd', 'me', 3, zO('Una lluvia de golpes rápidos (tirá el daño dos veces, a mano la segunda).', 3, 'L'));
  H('Golpe cargado', 'D', '*', 'mt', 4, zO('Junta fuerzas todo un turno y descarga un golpe brutal.', 2, 'H'));
  H('Aplastar', 'D', 'c', 'mt', 3, zO('Aplasta con un brazo de piedra o metal.', 3, 'M'));
  H('Puño de roca', 'D', 'ce', 'mt', 2, aT('Un puñetazo que rompe huesos.', 'M'));
  H('Aliento gélido', 'DA', 'e', 'rg', 4, zO('Un soplido helado en cono: enfría a los golpeados (a mano).', 3, 'M'));

  /* ================= DAÑO A DISTANCIA / MÁGICO ================= */
  H('Disparo certero', 'D', 'hd', 'r', 2, aT('Un tiro apuntado con calma.', 'M'));
  H('Tiro rápido', 'D', 'hd', 'r', 2, aT('Dispara sin apuntar demasiado.', 'L'));
  H('Lluvia de flechas', 'DA', 'hd', 'r', 4, zO('Dispara al cielo y las flechas caen en flor de 1 (a mano).', 3, 'M'));
  H('Tiro a la cabeza', 'D', 'hd', 'r', 5, zO('Un solo tiro perfecto, lento de preparar.', 3, 'H'));
  H('Escupitajo ácido', 'DX', 'ba', 'r', 3, zO('Escupe ácido: el objetivo pierde 1 punto de Defensa 2 turnos (a mano).', 2, 'L'));
  H('Proyectil', 'D', '*', 'r', 2, aT('Lanza lo que tenga a mano.', 'L'));
  H('Lanzar piedra', 'D', 'bcd', 'r', 2, aT('Arroja una roca enorme.', 'M'));
  H('Chispa', 'D', 'eag', 'rg', 2, aT('Una chispa de energía pura.', 'L'));
  H('Bola de fuego', 'DA', 'ega', 'g', 4, zO('Una explosión en flor de 1 (a mano).', 3, 'M'));
  H('Rayo', 'D', 'ega', 'g', 3, zO('Un rayo que atraviesa la armadura.', 3, 'M'));
  H('Misil arcano', 'D', 'hdga', 'g', 2, aT('Un proyectil mágico que no falla.', 'M'));
  H('Descarga eléctrica', 'DK', 'ea', 'g', 3, zO('Una descarga que deja al objetivo sin aliento: pierde 1 No2 (a mano).', 2, 'M'));
  H('Llamarada', 'DA', 'e', 'g', 4, zO('Una lengua de fuego en línea (a mano).', 3, 'M'));
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
  H('Segundo aliento', 'C', 'hd', 'tm', 6, cU('Una bocanada de energía: recupera mucha vida.', 3, 6));
  H('Inamovible', 'T', 'ce', 't', 4, bU('Nada lo mueve: +3 de Defensa y +2 Res.Mg 3 turnos.', 2, {def: 3, resmg: 2}, 3));
  H('Escudo de energía', 'T', 'cag', 'tg', 4, bU('Una barrera lo rodea: +3 de Defensa y +3 Res.Mg 2 turnos.', 2, {def: 3, resmg: 3}, 2));
  H('Resistencia mágica', 'T', '*', 'tg', 3, bU('Se cubre contra hechizos: +4 Res.Mg 3 turnos.', 2, {resmg: 4}, 3));
  H('Dura cabeza', 'T', 'bdc', 't', 2, bU('Encoge el cuello y aguanta: +2 de Defensa 2 turnos.', 1, {def: 2}, 2));
  H('Provocar', 'TX', '*', 't', 3, tA('Se burla y obliga al objetivo a atacarlo a él el próximo turno (a mano).', 1));
  H('Rugido desafiante', 'TX', 'bd', 't', 4, tA('Ruge y los enemigos cercanos prefieren atacarlo (a mano).', 2));
  H('Interponerse', 'T', 'hdc', 't', 3, bU('Se pone en el camino de un golpe (a mano): +3 de Defensa 1 turno.', 1, {def: 3}, 1));
  H('Rebotar', 'T', 'c', 't', 4, bU('Su coraza devuelve golpes: +4 de Defensa 2 turnos y quien lo golpea sufre 1d4 (a mano).', 2, {def: 4}, 2));
  H('Vigor', 'TC', 'bp', 't', 4, dC('Ataca y se alimenta de la pelea.', 3, 'L', 2));
  H('Postura del roble', 'T', 'p', 't', 5, bU('Raíces que lo sostienen: +4 de Defensa y +2 Res.Mg 4 turnos.', 3, {def: 4, resmg: 2}, 4));
  H('Armadura de hueso', 'T', 'm', 't', 3, bU('Los huesos se cierran sobre él: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Carne muerta', 'T', 'm', 't', 4, bU('No siente dolor: +3 de Defensa y +2 Res.Mg 3 turnos.', 2, {def: 3, resmg: 2}, 3));
  H('Manto helado', 'T', 'e', 't', 3, bU('Una capa de hielo lo cubre: +3 de Defensa 3 turnos.', 2, {def: 3}, 3));
  H('Endurecer', 'T', 'c', 't', 2, bU('Sus juntas se traban: +2 de Defensa 2 turnos.', 1, {def: 2}, 2));

  /* ================= BUFF (sobre sí mismo) ================= */
  H('Furia', 'B', '*', 'm', 3, bU('Se enfurece: +3 de Daño 3 turnos.', 2, {dmg: 3}, 3));
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
  H('Campo de fuerza', 'B', 'ca', 'g', 3, bU('Se envuelve en energía: +2 de Defensa y +2 Res.Mg 3 turnos.', 2, {def: 2, resmg: 2}, 3));
  H('Amplificar magia', 'B', 'ega', 'g', 3, bU('Carga su magia: +4 de Daño 2 turnos.', 2, {dmg: 4}, 2));
  H('Coraje', 'B', 'hd', 'ma', 2, bU('Se llena de valor: +2 Res.Mg y +1 de Daño 3 turnos.', 1, {resmg: 2, dmg: 1}, 3));
  H('Modo turbo', 'B', 'c', 'm', 4, bU('Sobrecalienta sus motores: +3 No2 y +2 de Daño 2 turnos.', 3, {nitros: 3, dmg: 2}, 2));
  H('Camuflaje', 'B', 'bpd', 'e', 3, bU('Se mimetiza con el entorno: +3 de Evasión 3 turnos.', 1, {eva: 3}, 3));
  H('Rabia ancestral', 'B', 'em', 'm', 5, bU('Una furia antigua lo posee: +5 de Daño y −2 de Defensa 3 turnos.', 3, {dmg: 5, def: -2}, 3));
  H('Preparar emboscada', 'B', 'hdb', 'e', 4, bU('Se esconde para el próximo golpe: +4 de Daño 2 turnos.', 2, {dmg: 4}, 2));
  H('Fortalecerse', 'B', '*', 'mt', 3, bU('Aprieta los músculos: +1 de Daño y +2 de Defensa 3 turnos.', 2, {dmg: 1, def: 2}, 3));
  H('Ojo avizor', 'B', 'bhd', 'r', 3, bU('Se concentra en el blanco: +3 de Daño 3 turnos.', 2, {dmg: 3}, 3));
  H('Ritual', 'B', 'dhm', 'g', 5, bU('Un ritual corto: +4 de Daño y +3 Res.Mg 3 turnos.', 3, {dmg: 4, resmg: 3}, 3));

  /* ================= APOYO (aliados: a mano) ================= */
  H('Aullido de manada', 'BA', 'b', 'a', 3, tA('Un aullido que anima a los aliados: +2 de Daño 2 turnos a los aliados cercanos (a mano).', 2));
  H('Grito de ánimo', 'B', 'hd', 'a', 3, tA('Anima a un aliado: +2 de Daño 2 turnos (a mano).', 1));
  H('Curación menor', 'C', 'hdap', 'a', 2, tA('Cura a un aliado adyacente 1d6 de vida (a mano).', 1));
  H('Curación mayor', 'C', 'hdap', 'a', 5, tA('Cura a un aliado 3d6 de vida (a mano).', 3));
  H('Bendición', 'B', 'hd', 'a', 4, tA('Bendice a un aliado: +1 de Daño y +2 de Defensa 3 turnos (a mano).', 2));
  H('Escudar aliado', 'T', 'hdc', 'at', 3, tA('Un aliado adyacente gana +3 de Defensa 2 turnos (a mano).', 2));
  H('Orden de ataque', 'B', 'hd', 'a', 3, tA('Un aliado puede atacar sin gastar No2 este turno (a mano).', 2));
  H('Formación', 'BT', 'hdc', 'a', 4, tA('Los aliados adyacentes ganan +2 de Defensa 3 turnos (a mano).', 2));
  H('Canto revitalizante', 'C', 'ad', 'a', 4, tA('Los aliados cercanos recuperan 1d6 de vida (a mano).', 3));
  H('Polen sanador', 'C', 'p', 'a', 4, tA('Esparce polen curativo: los aliados en flor de 1 recuperan 1d6 (a mano).', 3));
  H('Compartir fuerza', 'BC', 'a', 'a', 4, tA('Cede parte de su vitalidad: un aliado recupera 2d6 de vida y el creep pierde 1d6 (a mano).', 2));
  H('Redoble de tambores', 'B', 'd', 'a', 3, tA('Un ritmo de guerra: los aliados cercanos ganan +1 No2 este turno (a mano).', 2));
  H('Señal de retirada', 'M', 'hd', 'a', 3, tA('Ordena replegarse: los aliados cercanos se mueven 2 casilleros gratis (a mano).', 2));
  H('Resurgir', 'C', 'pm', 'at', 6, cU('Al borde de caer, se aferra a la vida y recupera vida.', 3, 7));
  H('Alarma', 'B', 'bhd', 'a', 2, tA('Da la alarma: los aliados cercanos se ponen en guardia (a mano).', 1));

  /* ================= DEBUFF (sobre otros: a mano) ================= */
  H('Debilitar', 'X', 'hdga', 'x', 3, tA('Maldice al objetivo: −2 de Daño 3 turnos (a mano).', 2));
  H('Maldición', 'X', 'dmga', 'gx', 4, tA('El objetivo pierde 2 de Res.Mg y 1 de Defensa 3 turnos (a mano).', 2));
  H('Ceguera', 'X', 'hdea', 'x', 3, tA('Lanza polvo o luz: el objetivo pierde 3 de Evasión 2 turnos (a mano).', 2));
  H('Ralentizar', 'X', 'hdea', 'x', 3, tA('El objetivo pierde 2 No2 en su próximo turno (a mano).', 2));
  H('Miedo', 'XK', 'bdma', 'x', 4, tA('Si el objetivo falla Res.Mt huye de él 2 turnos (a mano).', 2));
  H('Intimidar', 'X', 'bhd', 'x', 2, tA('Una mirada amenazante: el objetivo pierde 1 de Daño 2 turnos (a mano).', 1));
  H('Romper armadura', 'X', 'hdbc', 'mx', 3, tA('Un golpe a las juntas: el objetivo pierde 2 de Defensa 3 turnos (a mano).', 2));
  H('Veneno', 'X', 'bpdh', 'x', 3, tA('Envenena al objetivo: pierde 1d4 de vida por turno 3 turnos (a mano).', 2));
  H('Pudrición', 'X', 'pm', 'x', 4, tA('El objetivo queda podrido: −2 de Defensa y −1 de Daño 3 turnos (a mano).', 2));
  H('Confusión', 'XK', 'a', 'gx', 4, tA('Si el objetivo falla Res.Mt ataca a otro al azar 1 turno (a mano).', 3));
  H('Susurros', 'X', 'ma', 'gx', 3, tA('Voces en su cabeza: el objetivo pierde 2 de Res.Mt 3 turnos (a mano).', 2));
  H('Drenar energía', 'X', 'ma', 'x', 4, tA('El objetivo pierde 2 No2 en su próximo turno y el creep gana 1 (a mano).', 2));
  H('Marca de presa', 'X', 'b', 'ex', 3, tA('Marca al objetivo: recibe +2 de daño de los ataques del creep 3 turnos (a mano).', 2));
  H('Desarmar', 'XK', 'hd', 'mx', 4, tA('Golpea la mano del objetivo: suelta el arma y tarda 1 No2 en recogerla (a mano).', 2));
  H('Hacer tropezar', 'XK', '*', 'ex', 2, tA('Le mete el pie: el objetivo cae al piso si falla Agilidad (a mano).', 1));
  H('Tela de araña', 'XK', 'b', 'x', 4, tA('Lanza tela pegajosa: el objetivo queda Inmovilizado 1 turno si falla Fuerza (a mano).', 2));
  H('Nube de esporas', 'XA', 'p', 'x', 4, tA('Suelta esporas en flor de 1: quienes las respiran pierden 1 de Daño 2 turnos (a mano).', 2));
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
  H('Salto', 'M', 'bd', 'e', 2, tA('Salta 2 casilleros por encima de lo que haya en medio (a mano).', 1));
  H('Retirada táctica', 'M', 'hd', 'r', 3, tA('Se aleja 2 casilleros sin provocar (a mano).', 1));
  H('Teletransporte corto', 'M', 'ega', 'g', 4, tA('Aparece en un casillero libre a 3 casilleros de distancia (a mano).', 2));
  H('Volar en picada', 'DM', 'b', 'e', 4, zO('Cae desde arriba sobre el objetivo (a mano el movimiento).', 3, 'M'));
  H('Excavar', 'M', 'b', 'e', 4, tA('Se entierra y aparece 3 casilleros más allá (a mano).', 2));
  H('Trepar', 'M', 'bp', 'e', 2, tA('Sube por una pared o un árbol sin costo extra (a mano).', 1));
  H('Trampa de raíces', 'K', 'p', 'x', 4, tA('Raíces que atrapan: el objetivo queda Inmovilizado 1 turno si falla Fuerza (a mano).', 2));
  H('Red', 'K', 'hd', 'x', 4, tA('Lanza una red: el objetivo queda Inmovilizado 1 turno si falla Agilidad (a mano).', 2));
  H('Congelar', 'K', 'e', 'gx', 5, tA('Encierra al objetivo en hielo: pierde su próximo turno si falla Res.Mt (a mano).', 3));
  H('Aturdir', 'K', 'hdb', 'mx', 5, tA('Golpe en la sien: el objetivo queda Stun 1 turno si falla Res.Mt (a mano).', 3));
  H('Agarrón', 'K', 'bpc', 'mt', 3, tA('Agarra al objetivo: no puede alejarse mientras el creep no se mueva (a mano).', 2));
  H('Empujón', 'K', '*', 'mt', 2, tA('Empuja al objetivo un casillero (a mano).', 1));
  H('Arrastrar', 'K', 'bpc', 'x', 3, tA('Jala al objetivo hacia el creep hasta 2 casilleros (a mano).', 2));
  H('Onda de choque', 'AK', 'ce', 'g', 5, zO('Una onda que empuja a los adyacentes un casillero (a mano).', 4, 'M'));
  H('Grito atronador', 'AK', 'bd', 'x', 5, zO('Un grito que aturde a los adyacentes: pierden 1 No2 (a mano).', 3, 'L'));
  H('Pared de fuego', 'KA', 'e', 'g', 5, tA('Crea una línea de fuego de 3 casilleros que quema a quien la cruce (a mano).', 3));
  H('Terreno difícil', 'K', 'pe', 'x', 4, tA('Convierte una flor de 1 en terreno que cuesta doble moverse (a mano).', 2));
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
  H('Barril explosivo', 'I', 'hd', 'r', 4, tA('Coloca un barril que explota si lo golpean, en flor de 1 (a mano).', 2));

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
  H('Explosión final', 'DA', 'cea', 'g', 6, zO('Se hace estallar: daño en flor de 1 (a mano) y el creep queda inconsciente.', 4, 'H'));

  /* ================= EXTRAS PARA TRIBUS Y BOSS ================= */
  H('Lluvia de piedras', 'DA', 'ce', 'rg', 5, zO('Piedras del techo caen en flor de 1 (a mano).', 3, 'M'));
  H('Tormenta de arena', 'XA', 'e', 'x', 5, tA('Una nube de arena en flor de 2: todos los de adentro pierden 2 de Evasión 2 turnos (a mano).', 3));
  H('Niebla', 'B', 'ea', 'e', 4, bU('Se cubre de niebla: +3 de Evasión 3 turnos.', 2, {eva: 3}, 3));
  H('Reflejo de espejo', 'T', 'ca', 'tg', 4, bU('Refleja lo mágico: +5 Res.Mg 2 turnos.', 2, {resmg: 5}, 2));
  H('Hambre insaciable', 'B', 'bm', 'm', 4, bU('Cuanto más pelea más quiere: +2 de Daño y +1 No2 3 turnos.', 2, {dmg: 2, nitros: 1}, 3));
  H('Pacto oscuro', 'B', 'dhm', 'g', 5, bU('Firma un pacto: +5 de Daño y −3 Res.Mg 3 turnos.', 3, {dmg: 5, resmg: -3}, 3));
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
  H('Velo de sombras', 'B', 'ma', 'ge', 4, eS('Las sombras lo envuelven: sigilo y −1 Res.Mg mientras dure (la magia lo nota).', 2, 'Sigilo', 'buff', 0, {mods: {resmg: -1}}), 'sigilo');
  H('Ataque desde las sombras', 'D', 'hdb', 'e', 4, zO('Golpe de emboscada: ideal si está en sigilo. Si el objetivo no lo detectó, el daño se duplica (a mano) y al golpear pierde el sigilo (a mano).', 3, 'H'), 'sigilo');
  H('Puñalada por la espalda', 'D', 'hd', 'e', 4, zO('Ataca al objetivo desde su punto ciego (el lado opuesto a donde mira): +1 dado de daño (a mano).', 3, 'M'), 'sigilo,orientación');
  H('Cazador invisible', 'DB', 'ba', 'e', 5, zO('Entra en sigilo y ataca en el mismo turno (a mano el sigilo); si el objetivo no lo vio, +4 de daño (a mano).', 4, 'M'), 'sigilo');
  H('Ojo de lince', 'B', 'bhd', 'r', 3, bU('Afina la vista: +3 de Daño y ve mejor lo escondido (a mano: +1 dado a las tiradas de percepción) 3 turnos.', 1, {dmg: 3}, 3), 'percepción');
  H('Olfatear presa', 'X', 'b', 'x', 3, tA('Huele a sus presas: el GM revela a los personajes en sigilo dentro de 3 casilleros del creep (a mano, con 👁 Revelar lo oculto).', 2), 'sigilo,percepción');
  H('Sentido sísmico', 'X', 'bce', 'x', 4, tA('Siente las pisadas en el suelo: los personajes en sigilo que se muevan a 4 casilleros pierden el sigilo (a mano).', 2), 'sigilo,percepción');
  H('Polvo revelador', 'X', 'hdea', 'x', 3, tA('Arroja polvo: si el objetivo está en sigilo lo pierde y queda con −2 de Evasión 2 turnos (a mano).', 2), 'sigilo');
  H('Chillido delator', 'X', 'b', 'x', 3, tA('Un chillido que delata: un personaje en sigilo dentro de 3 casilleros pierde el sigilo (a mano).', 1), 'sigilo');
  H('Luz reveladora', 'X', 'eag', 'gx', 4, tA('Un destello ilumina una flor de 2: cualquiera en sigilo dentro pierde el sigilo (a mano).', 3), 'sigilo,niebla y visión');
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
  H('Mina de contacto', 'DA', 'hdc', 'rx', 4, tR('Entierra una mina: explota en una flor de 1 con daño {T}.', 3, 'H'), 'trampas,terreno');
  H('Campo minado', 'DA', 'hdc', 'rx', 6, tR('Siembra 3 minas en casillas cercanas: cada una hace {T} a quien la pise.', 4, 'M'), 'trampas,terreno');
  H('Trampa de veneno', 'DX', 'hdb', 'x', 3, tR('Una trampa con dardos envenenados: daño {T} y el que la pise queda Envenenado (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de fuego', 'DA', 'hde', 'gx', 4, tR('Un pozo de brea y chispa: daño {T} en flor de 1 y deja el suelo ardiendo (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de hielo', 'DK', 'e', 'gx', 4, tR('Una placa de hielo: daño {T} y el que la pise pierde 1 No2 en su próximo turno (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de red', 'K', 'hdb', 'x', 3, tS('Una red escondida: quien la pisa queda Inmovilizado 1 turno (a mano); sin daño.', 2), 'trampas,terreno');
  H('Alambre tenso', 'DK', 'hd', 'ex', 3, tR('Un alambre tenso en una casilla: daño {T} y quien lo cruza cae al piso (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de alarma', 'X', 'hdb', 'ax', 2, tS('Deja una alarma en una casilla: al pisarla suena en la Mesa y los creeps cercanos se ponen en guardia (a mano). Es una trampa sin daño.', 1), 'trampas,terreno');
  H('Trampa sonora', 'DK', 'hdc', 'x', 3, tR('Un petardo enorme: daño {T} y los adyacentes quedan Pajaritos hasta el final de su turno (a mano).', 2, 'L'), 'trampas,terreno');
  H('Trampa de runas', 'DA', 'hdma', 'g', 5, tR('Grava una runa en el piso: explota en flor de 1 con daño mágico {T}.', 3, 'H'), 'trampas,terreno');
  H('Cepo de alma', 'DX', 'ma', 'gx', 5, tR('Un cepo espectral: daño {T} y el que lo pise pierde 2 No2 en su próximo turno (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de ácido', 'DX', 'ba', 'x', 4, tR('Un charco de ácido tapado: daño {T} y el que lo pise pierde 1 de Defensa 3 turnos (a mano).', 3, 'M'), 'trampas,terreno');
  H('Zarzal traicionero', 'DK', 'p', 'x', 3, tR('Un matorral de espinas escondido: daño {T} y queda Rengo (a mano).', 2, 'L'), 'trampas,terreno');
  H('Telaraña oculta', 'K', 'b', 'x', 3, tS('Hilos casi invisibles: quien los toca queda Inmovilizado 1 turno (a mano), sin daño.', 2), 'trampas,terreno');
  H('Descarga oculta', 'DK', 'ca', 'x', 4, tR('Una placa eléctrica: daño {T} y el que la pise pierde 1 No2 (a mano).', 3, 'M'), 'trampas,terreno');
  H('Trampa de humo', 'X', 'hd', 'ex', 3, tS('Un frasco que al pisarlo suelta humo en flor de 1: los de adentro pierden 2 de Evasión y no ven (a mano). Trampa sin daño.', 2), 'trampas,niebla y visión');
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
  H('Cortina de humo', 'X', 'hd', 'ex', 3, tA('Suelta humo en flor de 1 (elemento transitable, color gris): los de adentro no se ven desde afuera (a mano).', 2), 'terreno y formas,niebla y visión,terreno');
  H('Charco de brea', 'K', 'ba', 'x', 3, tA('Un charco pegajoso en flor de 1: cada casillero que se pise cuesta 1 No2 más (a mano, Terreno y Formas).', 2), 'terreno y formas,terreno');
  H('Zona en llamas', 'DA', 'e', 'g', 4, tA('Prende fuego una flor de 1 (elemento naranja): quien termine el turno adentro recibe 1d6 (a mano).', 3), 'terreno y formas,terreno');
  H('Hielo resbaloso', 'K', 'e', 'gx', 3, tA('Congela una flor de 1: quien la cruce se resbala y pierde 1 No2 (a mano).', 2), 'terreno y formas,terreno');
  H('Pantano', 'K', 'pb', 'x', 4, tA('Convierte una flor de 2 en barro: costo doble de movimiento (a mano).', 3), 'terreno y formas,terreno');
  H('Maleza alta', 'B', 'p', 'e', 3, tA('Hace crecer maleza en una flor de 1: quien esté adentro puede esconderse (sigilo) más fácil (a mano).', 2), 'terreno y formas,sigilo,terreno');
  H('Grieta en el suelo', 'K', 'ce', 'gt', 5, tA('Abre una grieta de 3 casilleros en línea, terreno Sólido que se tiene que rodear (a mano).', 3), 'terreno y formas,terreno');
  H('Zona sagrada', 'BC', 'hdea', 'a', 5, tA('Consagra una flor de 1: los aliados adentro recuperan 1d4 HP por turno mientras estén ahí (a mano).', 3), 'terreno y formas,terreno');
  H('Nube tóxica', 'DX', 'bpa', 'x', 4, tA('Una nube en flor de 1: quien esté adentro al final de su turno queda Envenenado (a mano).', 3), 'terreno y formas,terreno');
  H('Tormenta de arena en zona', 'X', 'e', 'x', 5, tA('Arena en flor de 2: los de adentro pierden 2 de Evasión y su visión se reduce a 1 casillero (a mano).', 3), 'terreno y formas,niebla y visión,terreno');
  H('Círculo de protección', 'T', 'hdm', 'at', 5, tA('Un círculo en flor de 1: los aliados adentro ganan +2 de Defensa mientras se queden (a mano).', 3), 'terreno y formas,terreno');
  H('Árbol caído', 'K', 'p', 'tx', 4, tA('Derriba un árbol en línea de 3 casilleros: elemento Sólido que bloquea el paso (a mano).', 3), 'terreno y formas,terreno');
  H('Marea de lodo', 'K', 'e', 'gx', 5, tA('Una ola de lodo: empuja a los de una línea de 3 casilleros un casillero (a mano) y deja barro.', 3), 'terreno y formas,terreno');

  /* ================= NIEBLA Y VISIÓN ================= */
  H('Manto de oscuridad', 'X', 'am', 'gx', 5, tA('Oscurece una flor de 2 alrededor del creep: el GM tapa a mano esa zona con la herramienta 🌫 Niebla y los jugadores no ven lo de adentro.', 3), 'niebla y visión,terreno');
  H('Destello cegador', 'XK', 'ea', 'gx', 4, tA('Un fogonazo: los que lo miran pierden 3 de Evasión y su visión 2 turnos (a mano).', 2), 'niebla y visión');
  H('Visión nocturna', 'B', 'bdm', 'r', 3, bU('Ve en la oscuridad: +2 de Daño y ignora la penalización de la niebla 3 turnos (a mano lo segundo).', 1, {dmg: 2}, 3), 'niebla y visión');
  H('Ojo lejano', 'B', 'ag', 'g', 4, tA('Ve lo que hay a 6 casilleros: el GM destapa a mano una flor de 2 con la herramienta 🌫 Niebla para el creep (a mano).', 2), 'niebla y visión,percepción');
  H('Niebla de guerra propia', 'X', 'ea', 'gx', 6, tA('Una bruma que cubre 4 casilleros: los jugadores pierden la visión compartida 2 turnos (a mano, tapando con 🌫 Niebla).', 4), 'niebla y visión,terreno');
  H('Exploración', 'B', 'bhd', 'e', 3, bU('Se adelanta a explorar: +2 No2 este turno (a mano: el GM destapa un radio de 3 a su alrededor).', 1, {nitros: 2}, 1), 'niebla y visión,percepción');

  /* ================= INICIATIVA ================= */
  H('Adelantarse', 'B', 'hdb', 'e', 4, tA('Se adelanta al enemigo: sube 5 puntos su iniciativa en el orden de turnos (a mano, valor editable).', 1), 'iniciativa');
  H('Retrasar al rival', 'X', 'hdea', 'x', 4, tA('Lo distrae o lo entorpece: baja 3 puntos la iniciativa del objetivo en el orden de turnos (a mano).', 2), 'iniciativa');
  H('Reflejos de gato', 'B', 'b', 'e', 3, bU('Reacciona a la primera: +2 No2 y +1 de Evasión 2 turnos (a mano: sube 2 puntos de iniciativa).', 1, {nitros: 2, eva: 1}, 2), 'iniciativa');
  H('Golpe de mano', 'DB', 'hd', 'me', 3, zO('Ataca antes de que empiece la pelea de verdad: sube 3 puntos de iniciativa este combate (a mano).', 2, 'M'), 'iniciativa');
  H('Emboscada de manada', 'B', 'b', 'a', 5, tA('La manada salta a la vez: todos sus aliados cercanos suben 3 puntos de iniciativa (a mano).', 3), 'iniciativa');
  H('Pausa forzada', 'XK', 'ma', 'gx', 5, tA('Congela el tiempo un instante: el objetivo salta al final del orden de turnos (a mano).', 3), 'iniciativa');

  /* ================= AURAS ================= */
  // El token tiene aura visual (⚙ del HUD: radio, forma y color); el efecto sobre otros queda a mano.
  H('Aura de miedo', 'XA', 'mba', 'x', 4, tA('Aura de radio 2 (⚙ del token, color violeta): los personajes adentro pierden 1 de Daño mientras estén en el aura (a mano).', 2), 'aura,zona o área');
  H('Aura de veneno', 'XA', 'pb', 'x', 4, tA('Aura de radio 1 (⚙ del token, color verde): quien termina el turno adentro pierde 1 HP (a mano).', 2), 'aura,zona o área');
  H('Aura sanadora', 'CA', 'pea', 'a', 4, tA('Aura de radio 2 (⚙ del token, color verde claro): los aliados adentro recuperan 1d4 HP por turno (a mano).', 3), 'aura,zona o área');
  H('Aura de calor', 'DA', 'e', 'mg', 4, tA('Aura de radio 1 (⚙ del token, color naranja): quien termina el turno adentro recibe 1d4 (a mano).', 2), 'aura,zona o área');
  H('Aura gélida', 'XA', 'em', 'x', 4, tA('Aura de radio 1 (⚙ del token, color celeste): los de adentro pierden 1 No2 por turno (a mano).', 2), 'aura,zona o área');
  H('Aura de mando', 'BA', 'hd', 'a', 4, tA('Aura de radio 2 (⚙ del token, color dorado): los aliados adentro ganan +1 de Daño (a mano).', 2), 'aura,zona o área,jefe');
  H('Aura de protección', 'TA', 'hdc', 'at', 4, tA('Aura de radio 1 (⚙ del token, color azul): los aliados adentro ganan +2 de Defensa (a mano).', 2), 'aura,zona o área');
  H('Aura de silencio', 'XA', 'ma', 'gx', 5, tA('Aura de radio 2 (⚙ del token, color gris): en el aura no se puede usar sigilo (a mano).', 3), 'aura,sigilo,zona o área');
  H('Aura de corrupción', 'XA', 'ma', 'gx', 5, tA('Aura de radio 1 (⚙ del token, color púrpura): los de adentro pierden 2 Res.Mg (a mano).', 3), 'aura,zona o área');

  /* ================= ESTADOS ALTERADOS SOBRE SÍ MISMO (todo automatizado) ================= */
  H('Inmunidad total', 'T', 'ce', 't', 6, eS('Nada lo daña ni lo debilita un momento.', 3, 'Invulnerable', 'buff', 1), 'jefe');
  H('Voluntad de hierro', 'T', '*', 't', 5, eS('Ignora todo lo que quiera controlarlo: no lo aturden ni lo agotan.', 2, 'Inmunidad a CC', 'buff', 3), 'jefe');
  H('Espinas defensivas', 'T', 'bpc', 't', 4, eS('Sus púas devuelven el 50% del daño de los golpes cuerpo a cuerpo (se cobra a mano).', 2, 'Espinas', 'buff', 3));
  H('Escudo arcano', 'T', 'ga', 'tg', 4, eS('Una barrera de energía absorbe daño de cualquier fuente.', 2, 'Escudo especial', 'buff', 3));
  H('Suerte del bribón', 'B', 'hdb', 'e', 4, eS('Todas sus tiradas de PdG, Parry y Evasión se hacen dos veces y queda la mejor.', 2, 'Afortunado', 'buff', 2));
  H('Sangre inmune', 'T', 'mpc', 't', 4, eS('Ningún veneno le hace efecto.', 1, 'Sangre pura', 'buff', 3));
  H('Coagulación rápida', 'T', 'bhd', 't', 4, eS('Sus heridas cierran al instante: inmune al sangrado.', 1, 'Coagulación extrema', 'buff', 3));
  H('Coraza blindada', 'T', 'cd', 't', 4, eS('Ningún golpe crítico lo atraviesa.', 2, 'Blindado', 'buff', 3));
  H('Regeneración rápida', 'C', 'bpm', 'tm', 5, eS('Sus heridas se cierran solas: recupera vida cada turno.', 2, 'Regeneración', 'buff', 3, {hp: 3}));
  H('Adrenalina', 'B', 'hdb', 'me', 3, eS('Un torrente de energía: +1 No2 máximo.', 1, 'Hypeado', 'buff', 3));
  H('Frenesí de curación', 'CB', 'bm', 'm', 6, eS('Recupera vida por turno y ataca más rápido: +1 No2.', 3, 'Regeneración', 'buff', 3, {hp: 2, mods: {nitros: 1}}));
  H('Escudo de espinas', 'TD', 'p', 'tm', 5, eS('Espinas y una barrera de savia: devuelve daño y gana +2 de Defensa.', 3, 'Espinas', 'buff', 3, {mods: {def: 2}}));

  /* ================= ESTADOS ALTERADOS SOBRE OTROS (a mano: se aplica el preset con + Estado) ================= */
  H('Sembrar veneno', 'X', 'bpdh', 'x', 3, tA('Aplicale al objetivo el estado Veneno (preset de + Estado): pierde 1 HP por stack cada turno, hasta 4 stacks (a mano).', 2), 'estados alterados');
  H('Herida sangrante', 'X', 'bhd', 'mx', 3, tA('Aplicale al objetivo el estado Sangrado: pierde 2 HP por turno hasta que se cure (a mano).', 2), 'estados alterados');
  H('Aturdir con estruendo', 'K', 'bcd', 'x', 5, tA('Aplicale al objetivo el estado Stun: se queda sin No2 este turno (a mano).', 3), 'estados alterados');
  H('Agotar', 'X', 'ma', 'x', 4, tA('Aplicale al objetivo Exhausto: como mucho 1 No2 por turno 3 turnos (a mano).', 2), 'estados alterados');
  H('Cansar', 'X', '*', 'x', 3, tA('Aplicale al objetivo Cansado: pierde un tercio de sus No2 máximos 3 turnos (a mano).', 1), 'estados alterados');
  H('Lisiar', 'X', 'bhd', 'mx', 4, tA('Aplicale al objetivo Lisiado: su PdG y Parry a la mitad 3 turnos (a mano).', 2), 'estados alterados');
  H('Clavar al suelo', 'K', 'hdb', 'x', 4, tA('Aplicale al objetivo Inmovilizado: su movimiento queda en 0 3 turnos (a mano).', 2), 'estados alterados');
  H('Romper la rodilla', 'K', 'hdb', 'mx', 3, tA('Aplicale al objetivo Rengo: su movimiento a la mitad 3 turnos (a mano).', 2), 'estados alterados');
  H('Nublar la mente', 'X', 'ma', 'gx', 3, tA('Aplicale al objetivo Pajaritos: PdG y Evasión a la mitad 3 turnos (a mano).', 2), 'estados alterados');
  H('Corroer el metal', 'X', 'ca', 'x', 4, tA('Aplicale al objetivo Armadura rota: −1 Defensa por acumulación, permanente hasta repararla (a mano).', 2), 'estados alterados');
  H('Disolver la armadura', 'X', 'ca', 'x', 6, tA('Aplicale al objetivo Armadura rota (se acumula si ya la tiene) hasta repararla (a mano).', 4), 'estados alterados');
  H('Toxina severa', 'X', 'bp', 'x', 5, tA('Aplicale al objetivo Veneno severo: pierde 1 HP el primer turno y 1 más con cada mantenimiento, sin caducar (a mano).', 3), 'estados alterados');
  H('Golpe que sangra', 'DX', 'hd', 'me', 3, zO('Daño y aplicale al objetivo Sangrado (a mano).', 3, 'M'), 'estados alterados');
  H('Mordisco que lisia', 'DX', 'b', 'me', 3, zO('Muerde una pierna: daño y aplicale al objetivo Rengo (a mano).', 2, 'L'), 'estados alterados');
  H('Disparo a la rodilla', 'DX', 'hd', 'r', 3, zO('Tira a una pierna: daño y aplicale al objetivo Rengo (a mano).', 2, 'L'), 'estados alterados');
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

  window.HABILIDADES_CREEP_BASE = lista;

  // Arma la habilidad de un creep del nivel dado a partir de una entrada de la biblioteca.
  // Una versión editada y propuesta a la biblioteca (`datos.habilidad`) ya viene calculada: se copia tal cual, sin escalar con el nivel.
  window.armarHabilidadDeCreep = function(datos, nivel){
    if(datos && datos.habilidad) return structuredClone(datos.habilidad);
    const n = Math.max(1, Math.min(20, Math.round(Number(nivel) || 1)));
    return U.armarHab(datos.sp, n, datos.cd, !!datos.lenta);
  };
})();
