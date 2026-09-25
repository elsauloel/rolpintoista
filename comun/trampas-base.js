/* Catálogo base de trampas para el mapa (vtt-hexgrid/mapa.html → 📚 Catálogo de trampas).
   TRAMPAS_BASE tiene el formato de las entradas `base` de comun/biblioteca.js:
   {poolId, nombre, nivel, etiquetas, detalle (lo que se lee en la biblioteca), datos (lo que se carga en el mapa)}.

   (Trampas creadas automáticamente: TODAS requieren auditar. Las cifras —daño, dificultades, duraciones— son una
   propuesta, no una regla.)

   `datos` es una trampa de las que guarda el mapa: {nombre, detalle, amiga, tipo, tamano, color, alfa, dano}.
   `dano` es la tirada que el mapa hace SOLA al dispararse y aplica a quien la activa (con su Defensa); en un área
   también a los creeps si quien mueve es el GM. Todo lo demás (estados, tiradas para evitarla, efectos raros)
   se resuelve a mano y se aclara en el detalle. Límites del mapa: nombre hasta 40 caracteres y detalle hasta 200.
   Daño por nivel (guía): 1 → 1d6, 2 → 2d6, 3 → 3d6, 4 → 4d6, 5 → 5d6. Dificultad guía: 6 + 2 por nivel. */
(function(){
  const slug = t => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const AVISO = '(Trampa creada automáticamente: requiere auditar.)';
  const lista = [];
  // tr(nombre, nivel, etiquetas, forma, tamaño, color, daño automático ('' si no hace), qué hace (≤200), fuego amigo?, ignora la Defensa?, estado automático {nombre, turnos}?)
  // ignoraDef: el daño automático va DIRECTO a la vida (fuego, hielo, electricidad y explosiones, 2026-09-24); si no, se le resta la Defensa como a un golpe (lo físico).
  // Criterio del dueño (2026-09-25): "fuego amigo" = el EFECTO también alcanza a los aliados que estén en el área. Lo físico y lo explosivo
  // (púas, cuchillas, derrumbes, gases, minas…) sí; lo mágico (arcano, relámpago, runas) distingue aliados de rivales. Los aliados NUNCA disparan una trampa.
  const FISICAS = new Set(['Trampa de oso', 'Foso con estacas', 'Red de caza', 'Brea pegajosa', 'Aceite resbaladizo', 'Dardos envenenados', 'Cuchillas de guadaña', 'Cable de alarma',
    'Arena movediza', 'Derrumbe', 'Nube de veneno', 'Gas somnífero', 'Bomba de esporas', 'Mina explosiva', 'Barril de pólvora']);
  function tr(nombre, nivel, etiquetas, tipo, tamano, color, dano, detalle, amiga, ignoraDef, estado){
    amiga = amiga || FISICAS.has(nombre);
    const auto = dano
      ? `tira ${dano} de daño y se lo aplica a quien la activa (${ignoraDef ? 'directo a la vida: ignora su Defensa' : 'restando su Defensa'})${tamano > 1 && tipo === 'flor' ? '; en el área, también a los creeps si mueve el GM, y a los demás se les avisa en la Mesa' : ''}`
      : 'solo avisa en la Mesa cuando se dispara';
    lista.push({
      poolId: 'trampa-' + slug(nombre), nombre, nivel,
      etiquetas: [...etiquetas, 'nivel ' + nivel, 'auditar'],
      detalle: `${AVISO} ${detalle}${amiga ? ' Fuego amigo: su efecto también alcanza a los aliados que estén en el área.' : ''} ⚙ Automático: ${auto}${estado ? `; deja el estado ${estado.nombre} (los turnos los elegís al colocarla)` : ''}. ✋ A mano: estados, tiradas para evitarla y todo lo demás que dice el texto.`,
      datos: {nombre, detalle, amiga: !!amiga, tipo, tamano, color, alfa: 45, dano, ...(ignoraDef ? {ignoraDef: true} : {}), ...(estado ? {estado: estado.nombre, estadoTurnos: estado.turnos} : {})},
    });
  }

  // ---- Mecánicas clásicas ----
  tr('Trampa de oso', 2, ['daño', 'inmoviliza', 'mecánica'], 'flor', 1, '#8A8A8A', '2d6',
    '2d6 de daño (automático) e Inmovilizado (a mano). Para liberarse: 2 No2 y Fuerza contra 8.');
  tr('Foso con estacas', 3, ['daño', 'mecánica'], 'flor', 1, '#5C4033', '3d6',
    '3d6 de daño (automático) y queda Sentado (a mano; pararse cuesta 1 No2). Evasión contra 12 evita la caída.');
  tr('Red de caza', 1, ['inmoviliza', 'mecánica'], 'flor', 1, '#B5A642', '',
    'Cae una red: Inmovilizado 2 turnos (a mano). Se libera con 2 No2 y Fuerza contra 8.');
  tr('Brea pegajosa', 1, ['debuff', 'mecánica'], 'flor', 2, '#3A2A20', '',
    'Suelo de brea: Rengo (moverse cuesta 2 No2) 3 turnos a quien lo pise (a mano). No hay tirada.');
  tr('Aceite resbaladizo', 1, ['debuff', 'mecánica'], 'flor', 2, '#C9B037', '',
    'Queda Sentado y con -2 Evasión hasta su próximo turno (a mano). Evasión contra 8 para no caer.');
  tr('Dardos envenenados', 2, ['daño', 'veneno', 'mecánica'], 'linea', 3, '#6B8E23', '1d6',
    '1d6 de daño (automático) y 3 stacks de Veneno (a mano; 1 de daño por stack por turno). Evasión contra 10 los esquiva.');
  tr('Cuchillas de guadaña', 5, ['daño', 'mecánica'], 'linea', 5, '#B0B0B0', '5d6',
    '5d6 de daño (automático) y Sangrado (a mano; 2 HP por turno hasta curarse). Evasión contra 16 lo evita.');
  tr('Cable de alarma', 1, ['alarma', 'mecánica'], 'linea', 3, '#C0A060', '',
    'Cuerda con cascabeles: al tocarla suena. Los enemigos a 8 casillas se alertan y el que la activó sale del sigilo (a mano).');
  tr('Arena movediza', 2, ['inmoviliza', 'natural'], 'flor', 2, '#B08D57', '',
    'Inmovilizado (a mano): salir cuesta 3 No2 (2 si gana Fuerza contra 8).');
  tr('Derrumbe', 4, ['daño', 'explosiva', 'natural'], 'flor', 2, '#6E6E6E', '4d6',
    'Cae el techo: 4d6 de daño (automático) y Sentados (a mano). Evasión contra 14 reduce el daño a la mitad.', true);

  // ---- Veneno y gases ----
  tr('Nube de veneno', 3, ['veneno', 'área', 'mecánica'], 'flor', 2, '#4C9A2A', '',
    'Gas venenoso en flor de 2: 2 stacks de Veneno (1 de daño por stack por turno) a todos los de adentro (a mano). Res.CC contra 12 lo evita.');
  tr('Gas somnífero', 2, ['veneno', 'control', 'área'], 'flor', 2, '#8FBC8F', '',
    'Nube adormecedora en flor de 2: Exhausto (1 No2 como mucho) 2 turnos (a mano). Res.CC contra 10 lo evita.');
  tr('Bomba de esporas', 4, ['veneno', 'explosiva', 'área'], 'flor', 3, '#A0522D', '2d6',
    'Estalla en flor de 3: 2d6 de daño (automático) y 3 stacks de Veneno (a mano). Res.CC contra 14 evita el veneno.', true, true);

  // ---- Explosivas ----
  tr('Mina explosiva', 3, ['explosiva', 'daño', 'área'], 'flor', 2, '#D9531E', '3d6',
    'Estalla en flor de 2: 3d6 de daño explosivo (automático) a todos los de adentro. Evasión contra 12 reduce el daño a la mitad (a mano).', true, true);
  tr('Barril de pólvora', 4, ['explosiva', 'daño', 'área'], 'flor', 3, '#7A3B1C', '4d6',
    'Explota en flor de 3: 4d6 de daño explosivo (automático) y Pajaritos hasta el final de su turno (a mano). Evasión contra 14: mitad.', true, true);
  tr('Llamarada', 2, ['daño', 'fuego'], 'flor', 1, '#E25822', '2d6',
    '2d6 de daño de fuego (automático) y quemadura: 1 de daño por turno durante 3 turnos (a mano). Evasión contra 10 evita la quemadura.', false, true);

  // ---- Mágicas y con efectos creativos ----
  tr('Runa de silencio', 3, ['debuff', 'mágica'], 'flor', 1, '#7A5FD0', '',
    'Apaga la magia: no puede usar habilidades con SP durante 1 turno (a mano). Res.Mt contra 12 lo evita.');
  tr('Runa de debilidad', 2, ['debuff', 'mágica'], 'flor', 1, '#8E6BBF', '',
    'Maldición debilitante: -2 a todas las tiradas 2 turnos (a mano). Res.Mt contra 10 lo evita.');
  tr('Niebla de confusión', 3, ['control', 'mágica', 'área'], 'flor', 2, '#B784E0', '',
    'Confusión 2 turnos (a mano): antes de cada acción tira 1d4 (1 elige el GM, 2 pierde la acción, 3 al azar, 4 normal). Res.Mt contra 12 la evita.');
  tr('Trampa de escarcha', 3, ['daño', 'debuff', 'mágica'], 'flor', 1, '#7FB3D5', '2d6',
    'Hielo repentino: 2d6 de daño directo y Escarcha (−1 No2 máx.) por los turnos que elijas al colocarla (automático). Res.Mg contra 12 la evita (a mano).', false, true, {nombre: 'Escarcha', turnos: 2});
  tr('Descarga eléctrica', 3, ['daño', 'control', 'mágica'], 'flor', 1, '#E6D84A', '3d6',
    '3d6 de daño eléctrico (automático) y Stun (sin No2) 1 turno (a mano). Res.CC contra 12 evita el Stun.', false, true);
  tr('Succión arcana', 3, ['debuff', 'mágica'], 'flor', 1, '#5B7FA6', '',
    'Drena 2d6 de SP a quien la pise (a mano): la mitad si supera Res.Mt contra 12. No hace daño.');
  tr('Espejo de discordia', 4, ['control', 'mágica'], 'flor', 1, '#C9A3EA', '',
    'Pajaritos 2 turnos y ve a sus aliados como enemigos hasta su próximo turno (a mano). Res.Mt contra 14 lo evita.');
  tr('Portal cósmico', 5, ['control', 'mágica'], 'flor', 2, '#9B5FD0', '',
    'Teletransporta a quien lo pise a un punto al azar a 10 casillas (elige el GM) y lo deja Pajaritos 1 turno (a mano). Res.Mt contra 16 lo evita.');

  window.TRAMPAS_BASE = lista;
})();
