/* Catálogo base de ARMAS NATURALES para creeps (P94): garras, colmillos, aguijones, tentáculos, puños, aliento…
   Nombres generales, para cualquier criatura que tenga esa parte del cuerpo (nada de "garra de topo").
   Se abre desde gm-tools ("🐾 Arma natural" en la ficha del creep o en el paso del arma del asistente) y se filtra por
   parte del cuerpo, efecto, alcance, potencia y tipo de daño.

   Cada entrada guarda la receta ({familia, potencia, rango, mods, efectos, detalle}); al elegirla, `armarArmaNatural(datos, nivel)`
   la calcula con el NIVEL del creep (misma escala que las armas de comun/creeps-base.js: dado 4/6/6/8/10, dados 1/1/2/2/2,
   daño fijo nivel÷2) y la potencia la corre un escalón (−2 al dado si es ligera, +2 si es pesada; entre d4 y d12).
   Los efectos van en `armaEfectos`: al tirar el Daño se recuerdan resaltados en la Mesa y, si tienen porcentaje, se tiran
   en un pop-up (comun/efectos-golpe.js). Aplicarlos sobre el rival sigue siendo a mano, a propósito.
   Todas marcan al creep como `armaNatural` (al morir suelta un trofeo, nadie la equipa). Son un punto de partida: se editan. */
(function(){
  const TIPO_ARMA = [4, 6, 6, 8, 10];
  const PESO_ARMA = [1, 1, 2, 2, 2];
  const PROB = {100: [1, 1], 75: [4, 3], 50: [2, 1], 33: [3, 1], 25: [4, 1], 20: [5, 1], 10: [10, 1]};
  const ef = (nombre, p, detalle, dado) => ({nombre, caras: PROB[p][0], exitos: PROB[p][1], dado: dado || '', detalle});
  // Efectos reutilizables (mismos nombres que los del catálogo de ítems).
  const E = {
    veneno: p => ef('Envenenar', p, 'Aplicale Veneno al objetivo (recordatorio: aplicarlo a mano).'),
    venenoSevero: p => ef('Veneno severo', p, 'Aplicale Veneno severo al objetivo: 1 de daño el primer turno y 1 más con cada mantenimiento (a mano).'),
    sangrado: p => ef('Sangrado', p, 'Aplicale Sangrado al objetivo (recordatorio: aplicarlo a mano).'),
    rompe: p => ef('Rompe armadura', p, 'Si entra, la armadura del objetivo se rompe (recordatorio: aplicarlo a mano).'),
    arruina: p => ef('Arruina armadura', p, 'Aplicale el estado Armadura rota al objetivo (suma un stack, a mano).'),
    aturdir: p => ef('Aturdir', p, 'Si entra, el objetivo queda Stun: sin No2 este turno (a mano).'),
    derribar: p => ef('Derribar', p, 'Si entra, el objetivo cae al suelo (recordatorio: aplicarlo a mano).'),
    lisiar: p => ef('Lisiado', p, 'Aplicale Lisiado al objetivo: PdG y Parry a la mitad (a mano).'),
    rengo: p => ef('Dejar rengo', p, 'Aplicale Rengo al objetivo: su movimiento a la mitad (a mano).'),
    pajaritos: p => ef('Pajaritos', p, 'Aplicale Pajaritos al objetivo: PdG y Evasión a la mitad (a mano).'),
    inmov: p => ef('Inmovilizar', p, 'Aplicale Inmovilizado al objetivo: su movimiento queda en 0 (a mano).'),
    agarrar: p => ef('Agarrar', p, 'El objetivo queda agarrado: no puede alejarse mientras el creep no se mueva (a mano).'),
    empuje: p => ef('Empuje', p, 'Empuja al objetivo 1 casillero (a mano).'),
    drena: p => ef('Drena vida', p, 'El creep se cura tanto HP como el daño que hizo (a mano).'),
    fuego: p => ef('Prende fuego', p, 'Prende fuego al objetivo: 1d8 de daño por cada stack de fuego (a mano).', '1d8'),
    ignora: p => ef('Ignora armadura', p, 'Si entra, el golpe ignora la Defensa del objetivo.'),
    ign1: p => ef('Ignora 1 de Res. crítico', p, 'Al calcular el crítico, el objetivo tiene 1 menos de resistencia.'),
    ceguera: p => ef('Ceguera', p, 'El objetivo pierde 3 de Evasión 2 turnos (a mano).'),
  };

  const lista = [];
  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  // familia = parte del cuerpo; potencia −1 ligera / 0 media / 1 pesada; rango true = a distancia; danio = tipo de daño.
  function N(nombre, familia, potencia, rango, danio, efectos, detalle, mods){
    const efTags = efectos.map(e => e.nombre);
    lista.push({
      poolId: 'arma-nat-' + slug(nombre), nombre,
      etiquetas: [...new Set([familia, potencia < 0 ? 'ligera' : potencia > 0 ? 'pesada' : 'media', rango ? 'a distancia' : 'cuerpo a cuerpo', danio, ...(efTags.length ? efTags : ['sin efecto'])])],
      detalle: `${detalle}${efectos.length ? ' Al golpear: ' + efTags.join(', ') + '.' : ''}`,
      datos: {nombre, familia, potencia, rango, mods: mods || [], efectos, detalle},
    });
  }
  const M = (stat, val) => ({stat, val});

  /* ---- Garras ---- */
  N('Garras afiladas', 'garras', 0, false, 'cortante', [], 'Zarpazos que abren la carne.');
  N('Garras desgarradoras', 'garras', 0, false, 'cortante', [E.sangrado(50)], 'Garras curvas que rasgan y dejan heridas abiertas.');
  N('Garras envenenadas', 'garras', 0, false, 'cortante', [E.veneno(50)], 'Garras con una toxina en las puntas.');
  N('Garras de hierro', 'garras', 1, false, 'cortante', [E.rompe(25)], 'Garras tan duras que abollan la armadura.');
  N('Zarpas pesadas', 'garras', 1, false, 'contundente', [E.derribar(25)], 'Un manotazo enorme que tira al suelo.');
  N('Garras veloces', 'garras', -1, false, 'cortante', [], 'Zarpazos rapidísimos, poco daño pero difíciles de seguir.', [M('nitros', 1)]);
  N('Garras de escarcha', 'garras', 0, false, 'elemental', [E.lisiar(25)], 'Garras cubiertas de hielo que entumecen lo que tocan.');
  N('Garras espectrales', 'garras', 0, false, 'mágico', [E.ignora(50)], 'Atraviesan la armadura como si no existiera.');

  /* ---- Colmillos y mandíbulas ---- */
  N('Colmillos afilados', 'colmillos', 0, false, 'perforante', [], 'Una mordida profunda.');
  N('Colmillos venenosos', 'colmillos', 0, false, 'perforante', [E.veneno(50)], 'Colmillos huecos que inyectan veneno.');
  N('Mordisco de presa', 'colmillos', 0, false, 'perforante', [E.agarrar(25)], 'Muerde y no suelta.');
  N('Colmillos sedientos', 'colmillos', 0, false, 'perforante', [E.drena(50)], 'Se alimenta de lo que muerde.');
  N('Mandíbula trituradora', 'colmillos', 1, false, 'contundente', [E.rompe(25), E.ign1(100)], 'Una mandíbula que quiebra huesos y armaduras.');
  N('Dientes de sierra', 'colmillos', 0, false, 'cortante', [E.sangrado(50)], 'Dientes en hilera que desgarran al morder.');
  N('Mordisco contagioso', 'colmillos', -1, false, 'perforante', [E.venenoSevero(25)], 'Una mordida sucia que se infecta.');
  N('Colmillos helados', 'colmillos', 0, false, 'elemental', [E.lisiar(25)], 'Dientes de hielo que dejan la carne dura.');

  /* ---- Aguijones y púas ---- */
  N('Aguijón venenoso', 'aguijón', -1, false, 'perforante', [E.veneno(75)], 'Un pinchazo pequeño con mucho veneno.');
  N('Aguijón paralizante', 'aguijón', -1, false, 'perforante', [E.aturdir(25)], 'Su toxina traba los músculos.');
  N('Aguijón corrosivo', 'aguijón', 0, false, 'ácido', [E.rompe(50)], 'Un aguijón que carcome el metal.');
  N('Aguijón de cola', 'aguijón', 0, false, 'perforante', [E.veneno(50), E.derribar(10)], 'Un latigazo de cola con aguijón al final.');
  N('Púas defensivas', 'espinas', 0, false, 'perforante', [E.sangrado(33)], 'Espinas que se clavan al golpear.');
  N('Espinas de cristal', 'espinas', 0, false, 'perforante', [E.rompe(25), E.sangrado(25)], 'Astillas de cristal que cortan y astillan.');

  /* ---- Cuernos, cabezazos y cola ---- */
  N('Cuernos', 'cuernos', 0, false, 'perforante', [E.empuje(25)], 'Embiste con los cuernos.');
  N('Cornada aplastante', 'cuernos', 1, false, 'contundente', [E.derribar(33)], 'Una cornada con todo el peso del cuerpo.');
  N('Cabezazo', 'cuernos', 0, false, 'contundente', [E.pajaritos(25)], 'Un golpe de frente que deja atontado.');
  N('Cola espinosa', 'cola', 0, false, 'perforante', [E.sangrado(25)], 'Un latigazo de cola llena de espinas.');
  N('Látigo de cola', 'cola', 0, false, 'contundente', [E.derribar(25)], 'Una cola larga que barre los pies.');
  N('Coletazo pesado', 'cola', 1, false, 'contundente', [E.empuje(25)], 'Un golpe de cola que arroja lejos.');
  N('Golpe de ala', 'alas', -1, false, 'contundente', [E.empuje(25)], 'Un aletazo que desestabiliza.');
  N('Coz', 'patas', 0, false, 'contundente', [E.derribar(25)], 'Una patada que tira al suelo.');

  /* ---- Puños, brazos y golpes ---- */
  N('Puños de piedra', 'puños', 1, false, 'contundente', [], 'Puñetazos que rompen huesos.');
  N('Brazos como troncos', 'puños', 1, false, 'contundente', [E.aturdir(20)], 'Un golpe de brazo que zumba el cráneo.');
  N('Golpe de roca', 'puños', 1, false, 'contundente', [E.rompe(25)], 'Un puño de roca que abolla lo que toca.');
  N('Puño ígneo', 'puños', 0, false, 'elemental', [E.fuego(25)], 'Un puño en llamas.');
  N('Puño helado', 'puños', 0, false, 'elemental', [E.lisiar(25)], 'Un puño de hielo que entumece.');
  N('Aplastamiento', 'puños', 1, false, 'contundente', [E.derribar(50)], 'Cae con todo el peso sobre el objetivo.');
  N('Martillo de piedra', 'puños', 1, false, 'contundente', [E.aturdir(25)], 'Un brazo convertido en martillo.');
  N('Cuchillas de metal', 'puños', 0, false, 'cortante', [E.sangrado(33), E.ignora(25)], 'Cuchillas en los brazos que cortan hasta el metal.');

  /* ---- Tentáculos, zarcillos y pinzas ---- */
  N('Tentáculos', 'tentáculos', 0, false, 'contundente', [E.agarrar(25)], 'Se enroscan y aprietan.');
  N('Tentáculos ácidos', 'tentáculos', 0, false, 'ácido', [E.rompe(50)], 'Mucosidad que corroe la armadura.');
  N('Tentáculos venenosos', 'tentáculos', 0, false, 'perforante', [E.veneno(50)], 'Ventosas con veneno.');
  N('Zarcillos', 'tentáculos', -1, false, 'contundente', [E.inmov(33)], 'Lianas que se enredan en las piernas.');
  N('Pinzas', 'pinzas', 0, false, 'cortante', [E.agarrar(33)], 'Pinzas que atrapan y aprietan.');
  N('Pinzas cortantes', 'pinzas', 0, false, 'cortante', [E.lisiar(25)], 'Pinzas que cortan tendones.');
  N('Pico afilado', 'pico', 0, false, 'perforante', [E.ign1(100)], 'Picotazos precisos a los puntos débiles.');
  N('Pico perforante', 'pico', 0, false, 'perforante', [E.ignora(25)], 'Un pico que atraviesa la armadura.');
  N('Enjambre', 'enjambre', -1, false, 'perforante', [E.sangrado(50)], 'Cientos de picaduras a la vez.');
  N('Toque helado', 'toque', -1, false, 'elemental', [E.drena(50)], 'Un roce que congela la sangre.');
  N('Toque marchitante', 'toque', -1, false, 'mágico', [E.drena(50), E.lisiar(10)], 'Marchita lo que toca.');
  N('Descarga por contacto', 'toque', 0, false, 'elemental', [E.aturdir(25)], 'Una descarga eléctrica al tocar.');
  N('Roce corrosivo', 'toque', -1, false, 'ácido', [E.arruina(10)], 'Un roce que arruina cualquier armadura.');
  N('Lengua pegajosa', 'lengua', 0, false, 'contundente', [E.agarrar(25)], 'Una lengua que atrapa y trae hacia la boca.');

  /* ---- A distancia: aliento, escupitajos, proyectiles y energía ---- */
  N('Aliento de fuego', 'aliento', 0, true, 'elemental', [E.fuego(33)], 'Una bocanada de llamas.');
  N('Aliento gélido', 'aliento', 0, true, 'elemental', [E.lisiar(33)], 'Un soplido que entumece.');
  N('Aliento tóxico', 'aliento', 0, true, 'ácido', [E.veneno(50)], 'Un gas verde que envenena.');
  N('Escupitajo ácido', 'escupitajo', 0, true, 'ácido', [E.rompe(50)], 'Un chorro de ácido.');
  N('Escupitajo de veneno', 'escupitajo', -1, true, 'perforante', [E.veneno(50)], 'Una gota de veneno con buena puntería.');
  N('Chorro cegador', 'escupitajo', -1, true, 'ácido', [E.ceguera(50)], 'Un chorro a los ojos.');
  N('Espinas lanzadas', 'espinas', 0, true, 'perforante', [E.sangrado(33)], 'Dispara espinas hacia adelante.');
  N('Hilo pegajoso', 'hilo', -1, true, 'contundente', [E.inmov(25)], 'Un hilo de seda que se pega.');
  N('Rayo de energía', 'energía', 0, true, 'mágico', [E.pajaritos(25)], 'Un rayo que atonta.');
  N('Pulso psíquico', 'energía', 0, true, 'mágico', [E.ignora(50)], 'Una onda mental que ignora la armadura.');
  N('Rugido sónico', 'energía', -1, true, 'mágico', [E.aturdir(25), E.pajaritos(10)], 'Un grito que retumba en la cabeza.');
  N('Descarga eléctrica', 'energía', 0, true, 'elemental', [E.aturdir(25)], 'Un arco eléctrico a distancia.');
  N('Lanzar piedras', 'proyectil', 0, true, 'contundente', [], 'Arroja rocas o escombros.');
  N('Bola de fuego', 'energía', 1, true, 'elemental', [E.fuego(33)], 'Una bola de fuego que estalla al impactar.');

  window.ARMAS_NATURALES_BASE = lista;

  // Calcula el arma natural de un creep del nivel dado a partir de una entrada del catálogo.
  window.armarArmaNatural = function(datos, nivel){
    const n = Math.max(1, Math.round(Number(nivel) || 1));
    const i = Math.min(n, 5) - 1;
    const tipo = Math.max(4, Math.min(12, TIPO_ARMA[i] + 2 * (datos.potencia || 0)));
    return {
      armaNombre: datos.nombre, armaNatural: true, armaTipo: tipo, armaPeso: PESO_ARMA[i], armaFijo: Math.floor(n / 2), armaAmplificado: 0,
      armaDeRango: !!datos.rango, armaManos: 'arma_1m', armaDetalle: datos.detalle,
      armaMods: structuredClone(datos.mods || []), armaEfectos: structuredClone(datos.efectos || []),
    };
  };
})();
