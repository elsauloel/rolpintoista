/* =========================================================
   GUÍA DE DISEÑO (2026-09-25, pedido del dueño)
   Una guía educativa, visual y paso a paso para diseñar skills, armas y otras piezas del juego: "quiero diseñar un arma / una skill
   de asalto" → se abre una grilla con las posibilidades de ese espacio de diseño, cada una con su explicación. Se abre desde el ☰ del
   sitio ("📐 Guía de diseño"), en el mapa y en las herramientas del GM: GuiaDiseno.abrir() (o GuiaDiseno.abrir('skill'|'arma'|'estados'|'mapa')).

   IMPORTANTE (esencia del proyecto): TODO lo de acá son **guías orientativas, no reglas estrictas**. Un punzón con knockdown se puede, solo
   que va a ser raro. Cada familia tiene una mecánica "de casa" (🏠) y las demás son posibles pero excepcionales (✨).
   Los datos están abajo (DATOS) y espejan docs/guia-de-diseno.md y docs/clases-borrador.md: al sumar o cambiar una mecánica, tocar los tres.
   No depende de Firebase ni de la partida.
   ========================================================= */
const GuiaDiseno = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));

  // Estado de cada mecánica en el juego.
  const EST = {
    auto: ['⚙', 'Ya automatizado en las herramientas'],
    mano: ['✋', 'Existe como recordatorio: se resuelve a mano en la mesa'],
    falta: ['🔲', 'Todavía no existe: idea de diseño por construir'],
  };

  /* ---------- Datos ----------
     Mecánica: {n: nombre, d: qué hace, ej: 'ejemplos existentes', e: 'auto'|'mano'|'falta', casa: ['quién la tiene de casa']} */
  const CLASES = [
    {id: 'warrior', ico: '⚔️', n: 'Warrior', resumen: 'Guerrero cuerpo a cuerpo: potencia el ataque, carga y defiende con Parry.',
      idea: 'El Warrior vive del ataque físico: pega más fuerte, se lanza contra el enemigo y sabe defenderse activamente. Sus skills suelen gastar No2 y sumarse a un ataque con el arma.',
      m: [
        {n: 'Potenciar el ataque', d: 'Más daño o más precisión en una tirada: dados extra, bonos fijos a PdG, Parry, Bloqueo o Daño.', ej: 'Amplificar daño, Arte de la guerra', e: 'auto'},
        {n: 'Cargas y saltos', d: 'Avanzar contra el enemigo pagando No2 por casillero y rematar con un ataque; saltos con onda.', ej: 'Carga, Cañón Vasco', e: 'auto'},
        {n: 'Daño en área cuerpo a cuerpo', d: 'Un ataque que golpea a todos los objetivos adyacentes.', ej: 'Remolino', e: 'mano'},
        {n: 'Defensa activa', d: 'Reaccionar a los golpes: Parry (Flash), Contraataque con ataque de oportunidad, Defensa que sube por cada enemigo cerca.', ej: 'Parry, Contraataque, Estoicismo', e: 'mano'},
        {n: 'Ráfagas de ataques', d: 'Bolsa de No2 para encadenar ataques idénticos en el mismo turno.', ej: 'Sacadito (a definir)', e: 'falta'},
      ]},
    {id: 'asalto', ico: '🗡️', n: 'Asalto', resumen: 'Golpea rápido y desde las sombras: sigilo, espalda, críticos, heridas y venenos.',
      idea: 'El Asalto gana por sorpresa y velocidad: entra en sigilo, golpea por la espalda, busca críticos y deja heridas o venenos. Se mueve mucho y aguanta poco.',
      m: [
        {n: 'Movimiento agresivo', d: 'Avanzar atravesando enemigos o correr varias casillas por pocos No2.', ej: 'Dash, Sprint', e: 'mano'},
        {n: 'Sigilo y emboscada', d: 'Entrar en sigilo, golpear por la espalda o por sorpresa con bonos grandes al daño.', ej: 'Invi, Backstab, Degollar', e: 'auto'},
        {n: 'Heridas y lisiaduras', d: 'Dejar al rival Sangrado o Lisiado, más fuerte si el golpe es crítico ("Critical Matters").', ej: 'Tajear, Lisiar', e: 'auto'},
        {n: 'Venenos', d: 'Mejorar el arma con veneno: daño extra o stacks de Veneno.', ej: 'Envenenar arma', e: 'mano'},
        {n: 'Críticos', d: 'Subir la probabilidad o el efecto del crítico y sacar recursos de él.', ej: 'Robar SP (2 SP por crítico)', e: 'mano'},
        {n: 'Evasión y huida', d: 'Bonos a esquivar y a desengancharse de un combate.', ej: 'Tronco de huida', e: 'mano'},
      ]},
    {id: 'tanque', ico: '🛡️', n: 'Tanque', resumen: 'Aguanta el daño, protege y controla el espacio.',
      idea: 'El Tanque absorbe: escudos, curación propia, resistencias temporales y espinas. También empuja o derriba (Sentado) y obliga a los enemigos a mirarlo.',
      m: [
        {n: 'Escudos y absorción', d: 'Una barra de HP extra que absorbe el próximo daño (Barrera / Escudo especial).', ej: 'Blindaje', e: 'auto'},
        {n: 'Devolver daño', d: 'Estado que hace daño a quien lo golpea cuerpo a cuerpo.', ej: 'Aura de espinas', e: 'auto'},
        {n: 'Curación propia', d: 'Curarse un número fijo pagando SP y No2.', ej: 'Recuperación', e: 'auto'},
        {n: 'Control con el cuerpo', d: 'Ondas y embestidas que empujan o dejan Sentado al rival.', ej: 'Shockwave, Sonic Boom, Takle', e: 'auto'},
        {n: 'Resistencias temporales', d: 'Subir Defensa y resistencias por unos turnos.', ej: 'Piel resistente', e: 'auto'},
        {n: 'Provocar y proteger', d: 'Obligar a los enemigos a atacarte o desviar a tu cuerpo el daño de un aliado.', ej: 'Taunt, Miti-Miti (a definir)', e: 'falta'},
      ]},
    {id: 'mago', ico: '🔮', n: 'Mago', resumen: 'Hechizos con Especial: daño mágico, áreas, control y armaduras arcanas.',
      idea: 'El Mago lanza hechizos (PG y Daño con Especial) pagando SP. Sus opciones van del daño puro y el área al control mental y la defensa mágica.',
      m: [
        {n: 'Proyectiles y rayos', d: 'Ataques mágicos a distancia. Ojo: no hay defensa mágica, así que el daño mágico va directo a la vida (los que usan el Especial como daño tienen que ser muy caros). La alternativa: usar el Especial para la potencia pero con daño físico, que la armadura sí reduce (ej. estalactita de hielo).', ej: 'Chispazo, Rayo mágico, Ráfaga arcana', e: 'mano'},
        {n: 'Áreas', d: 'Explosiones y lluvias de proyectiles en una flor del mapa.', ej: 'Orbe arcano, Tormenta arcana', e: 'mano'},
        {n: 'Elementos', d: 'Modificar un hechizo de daño para darle un elemento (fuego, hielo…).', ej: 'Carga Elemental', e: 'mano'},
        {n: 'Defensa mágica', d: 'Una armadura que reduce el daño recibido.', ej: 'Armadura Mágica', e: 'mano'},
        {n: 'Control', d: 'Mover objetos o dominar la voluntad de otro (tirada enfrentada).', ej: 'Telekinesis, Control Mental', e: 'mano'},
        {n: 'De contacto', d: 'Hechizos que piden tocar al objetivo.', ej: 'Toque mágico', e: 'mano'},
        {n: 'Portales y teleport', d: 'Invocar dos puntos de teletransporte dentro del rango de casteo, por unos turnos, que solo usan los aliados.', ej: 'Invocar portal', e: 'auto'},
      ]},
    {id: 'shooter', ico: '🏹', n: 'Shooter', resumen: 'Ataque a distancia: apuntar, cadencia, críticos y varios blancos.',
      idea: 'El Shooter prepara el disparo (apuntar, enfocar), dispara seguido (cadencia y repetición) y busca críticos o atravesar varios objetivos.',
      m: [
        {n: 'Preparar el disparo', d: 'Gastar No2 o SP para sumar precisión, crítico o daño en el próximo ataque a distancia.', ej: 'Apuntar, Enfocado', e: 'mano'},
        {n: 'Cadencia', d: 'Reducir el cooldown o repetir el mismo ataque varias veces.', ej: 'Acelerado, Repetición', e: 'falta'},
        {n: 'Críticos a distancia', d: 'Ataques que solo funcionan si son críticos, con daño muy alto.', ej: 'Headshot', e: 'mano'},
        {n: 'Varios blancos', d: 'Proyectiles que atraviesan o disparos que apuntan a más de un objetivo.', ej: 'Proyectil perforante, Disparo múltiple', e: 'mano'},
        {n: 'Marcar', d: 'Designar un objetivo que queda marcado hasta que muera o se cambie.', ej: 'Marcar', e: 'falta'},
        {n: 'Trayectorias y reacción', d: 'Curvar el disparo o usar el ataque a distancia como respuesta instantánea.', ej: 'Tiro con comba, Parry a distancia', e: 'mano'},
      ]},
    {id: 'support', ico: '✨', n: 'Support', resumen: 'Potencia a los aliados: bonos, curación, escudos y movilidad.',
      idea: 'El Support mejora al grupo: suma bonos a tiradas, cura, da escudos, mueve aliados y reparte recursos (SP).',
      m: [
        {n: 'Buffs a aliados', d: 'Bonos a tiradas o a atributos por unos turnos.', ej: 'Empower, Blessing, Adrenalina', e: 'mano'},
        {n: 'Curación', d: 'Curar HP o transferir SP entre aliados.', ej: 'Heal, Transferir SP', e: 'mano'},
        {n: 'Escudos y armadura temporal', d: 'Absorber daño o dar Defensa y resistencias por poco tiempo (Flash).', ej: 'Shield, Endurecimiento', e: 'mano'},
        {n: 'Movilidad aliada', d: 'Marcar casillas que dan No2 extra a quien las pisa.', ej: 'Acelerador', e: 'falta'},
        {n: 'Repetir tiradas', d: 'Dejar que un aliado vuelva a tirar.', ej: 'Re-roll', e: 'falta'},
        {n: 'Daño sagrado', d: 'Un ataque inesquivable de daño "holy".', ej: 'Smite', e: 'mano'},
      ]},
    {id: 'debuffer', ico: '☠️', n: 'Debuffer', resumen: 'Maldice y debilita: estados en contra, venenos y sangre.',
      idea: 'El Debuffer usa Maldiciones (Especial contra Res. Mental) para arruinarle el turno al rival: le baja tiradas, lo confunde, lo envenena o le drena la vida.',
      m: [
        {n: 'Maldiciones de tiradas', d: 'Bajar todas las tiradas del rival o cansarlo por unos turnos.', ej: 'Maldición debilitante, extenuante, tormentosa', e: 'mano'},
        {n: 'Controlar decisiones', d: 'Obligar a repetir una tirada o hacer que el rival actúe al azar.', ej: 'Enyetar, Confusión', e: 'mano'},
        {n: 'Venenos y áreas', d: 'Aplicar stacks de Veneno, sobre uno o en un área.', ej: 'Veneno, Nube tóxica', e: 'auto'},
        {n: 'Sangre y vida', d: 'Gastar HP propio para dañar, drenar la vida del rival o transferirla. Drenar puede dejarte con más HP que tu máximo: para eso está el estado Excedente de vida.', ej: 'Drenar vida, Balas de sangre, Transfusión', e: 'auto'},
      ]},
  ];

  const ARMA_BASE = [
    {n: 'Tipo (las caras del dado)', d: 'Define cuánto puede pegar cada dado: Tipo 4 = d4, 6 = d6, 8 = d8, 10 = d10, 12 = d12.'},
    {n: 'Peso (la cantidad de dados)', d: 'Cuántos dados tira: "T6 P2" es 2d6. El Peso también cuenta para la carga que llevás (Sobrepeso).'},
    {n: 'Empuñadura', d: 'Una mano o dos manos (y qué se puede llevar en la otra).'},
    {n: 'Rango o Alcance', d: 'Un arma de rango tiene su propio Rango (Destreza); una cuerpo a cuerpo puede sumar Alcance para pegar a más de un casillero.'},
    {n: 'Bonos', d: 'Números que suma o resta a tus atributos mientras la llevás (PdG, Daño, Parry…).'},
    {n: 'Efectos al golpear', d: 'Estados que puede dejar en el golpeado, a veces con probabilidad (50 % = moneda, 25 % = d4…).'},
    {n: 'Estado al equipar', d: 'Un estado que se activa solo cuando la equipás.'},
  ];
  const FAMILIAS = [
    {id: 'hacha', ico: '🪓', n: 'Hachas', resumen: 'Cortantes pesadas que abren la armadura.', dado: 'Tipo 8 (cortante pesado), orientativo', casa: 'Rompe armadura'},
    {id: 'contundente', ico: '🔨', n: 'Contundentes', resumen: 'Mazas y martillos: golpes que aturden y desordenan.', dado: 'Tipo 8–10 (contundente liviano / pesado)', casa: 'Knockdown (bajar en la iniciativa)'},
    {id: 'punzante', ico: '🔱', n: 'Punzantes', resumen: 'Lanzas, dagas y estoques: precisión que lisia.', dado: 'Tipo 4 (perforante)', casa: 'Lisiado'},
    {id: 'cortante', ico: '🗡️', n: 'Cortantes', resumen: 'Espadas y sables: cortes que sangran.', dado: 'Tipo 6', casa: 'Sangrado'},
    {id: 'explosivo', ico: '💣', n: 'Explosivos', resumen: 'Daño en área de alto riesgo.', dado: 'Tipo 12', casa: 'por definir'},
    {id: 'rango', ico: '🏹', n: 'De rango', resumen: 'Arcos, ballestas y armas de fuego: pegan de lejos.', dado: 'según el arma', casa: 'por definir'},
  ];
  // Efectos de arma, con TRES niveles por familia (aclaración del dueño, 2026-09-25):
  //   casa = le da identidad a la familia (🏠); comp = habilitado por contexto / compartido con otras familias (🤝, ej. Envenenar en todo lo que tiene filo);
  //   el resto es una excepción que va contra el concepto (✨, ej. un martillo que envenena: se puede, pero es raro).
  //   peso = relevancia del efecto en combate (1 a 5, PROVISORIO): la idea es usarlo después para calcular calidad y precio de un arma.
  const EFECTOS_ARMA = [
    {n: 'Rompe armadura', d: 'Quita Defensa al golpeado (estado Armadura rota, se acumula de a 1 y se puede reparar).', e: 'auto', casa: ['hacha'], comp: ['contundente'], peso: 4},
    {n: 'Knockdown (a la fila de atrás)', d: 'Baja al golpeado al fondo de la iniciativa. Con probabilidad si querés (ej. "Knockdown 1" = siempre 1 lugar).', e: 'falta', casa: ['contundente'], comp: ['explosivo'], peso: 4},
    {n: 'Aturdir', d: 'Deja al rival sin acciones (Stun: sin No2 por 2 turnos).', e: 'auto', casa: ['contundente'], comp: ['explosivo'], peso: 5},
    {n: 'Lisiado', d: 'PdG y Parry a la mitad por unos turnos.', e: 'auto', casa: ['punzante'], comp: ['cortante'], peso: 3},
    {n: 'Sangrado', d: 'Pierde HP por turno; reaplicarlo suma +1 de daño por turno.', e: 'auto', casa: ['cortante'], comp: ['punzante', 'hacha'], peso: 3},
    {n: 'Envenenar', d: 'Veneno: pierde 1 HP por stack cada turno.', e: 'auto', casa: [], comp: ['hacha', 'cortante', 'punzante', 'rango'], peso: 3},
    {n: 'Derribar', d: 'El objetivo cae al suelo (queda Sentado: Evasión a la mitad, no ataca hasta levantarse).', e: 'mano', casa: [], comp: ['contundente', 'hacha', 'explosivo'], peso: 2},
    {n: 'Agarrar', d: 'Inmoviliza al objetivo agarrado.', e: 'mano', casa: [], comp: ['punzante'], peso: 3},
    {n: 'Prende fuego', d: 'Daño de fuego por turnos (elemental: va directo a la vida).', e: 'mano', casa: [], comp: ['explosivo', 'rango'], peso: 3},
    {n: 'Drena vida', d: 'Te cura parte del daño que hacés (puede dejarte con Excedente de vida).', e: 'mano', casa: [], comp: ['cortante', 'punzante'], peso: 4},
  ];
  const ESTADOS = [
    ['Veneno', 'debuff', 'Pierde 1 HP por stack cada turno.'], ['Sangrado', 'debuff', 'Pierde HP por turno; se acumula.'],
    ['Armadura rota', 'debuff', '−1 Defensa por acumulación.'], ['Lisiado', 'debuff', 'PdG y Parry a la mitad.'],
    ['Pajaritos', 'debuff', 'PdG y Evasión a la mitad.'], ['Inmovilizado', 'debuff', 'Movimiento en 0.'],
    ['Rengo', 'debuff', 'Movimiento a la mitad.'], ['Stun', 'debuff', 'Sin No2 unos turnos.'],
    ['Cansado', 'debuff', 'No2 máximos a 2/3.'], ['Exhausto', 'debuff', 'No2 máximos a 1/3.'],
    ['Escarcha', 'debuff', '−1 a los No2 máximos.'], ['Sentado', 'debuff', 'Evasión a la mitad; no ataca.'],
    ['Regeneración', 'buff', 'Recupera HP por turno.'], ['Hypeado', 'buff', 'Bonos por emoción (ver el manual).'],
    ['Invulnerable', 'buff', 'Los golpes no hacen nada.'], ['Inmunidad a CC', 'buff', 'Ignora los controles.'],
    ['Espinas', 'buff', 'Daña a quien lo golpea.'], ['Barrera / Escudo especial', 'buff', 'Barra de HP extra que se recarga.'],
    ['Excedente de vida', 'buff', 'HP sobre el máximo, sin tope ni recarga.'], ['Afortunado', 'buff', 'Tira dos veces y elige la mejor.'],
    ['Sangre pura', 'buff', 'Inmunidad a ciertos estados de sangre.'], ['Coagulación extrema', 'buff', 'Resiste el Sangrado.'],
    ['Blindado', 'buff', 'Defensa extra por un tiempo.'], ['Sigilo', 'buff', 'No te ven; te delata el cono de un rival.'],
  ];
  const MAPA = [
    {n: 'Trampas', d: 'Ocultas hasta que un rival las pisa. Con daño (respeta o ignora la Defensa), estado, tirada para evitarla, fuego amigo del efecto (lo físico daña a todos en el área, lo mágico distingue) y teleport.', e: 'auto', ej: 'Terreno y Formas → Trampa'},
    {n: 'Formas y terreno', d: 'Nubes, humo, charcos, muros: con color o imagen, Sólidas o transitables, con turnos que duran y la Colisión del mapa.', e: 'auto', ej: 'Terreno y Formas'},
    {n: 'Sigilo', d: 'Entrar en sigilo, cono de detección y zona de alerta; activar una trampa lo rompe.', e: 'auto', ej: 'Estado Sigilo'},
    {n: 'Niebla y visión', d: 'Doble niebla, campo de visión que gira con el frente y Sólidos que tapan la vista. Falta que estados o equipo cambien el radio.', e: 'mano', ej: '🌫 Niebla, 👁'},
    {n: 'Iniciativa', d: 'Orden de turnos que el GM mueve a mano. Falta que skills, buffs y armas la muevan solos (bajar al fondo, subir).', e: 'falta', ej: 'Tabla de iniciativa'},
    {n: 'Movimiento', d: 'Movimiento con No2, giro gratis, Mover libre y teleport. Falta empujar y atraer.', e: 'mano', ej: 'Mover, 🦶'},
  ];

  /* ---------- Interfaz ---------- */
  function estilos(){
    if(document.getElementById('gd-css')) return;
    const s = document.createElement('style');
    s.id = 'gd-css';
    s.textContent = `
#gd-fondo{position:fixed;inset:0;z-index:99980;background:rgba(0,0,0,.66);display:flex;align-items:center;justify-content:center;padding:14px}
#gd-caja{width:min(940px,100%);height:min(720px,calc(100vh - 28px));display:flex;flex-direction:column;background:#1A1418;border:1px solid #C98545;border-radius:6px;
  box-shadow:0 16px 40px rgba(0,0,0,.7);font-family:"Space Grotesk",system-ui,sans-serif;color:#EDE3D2;text-align:left}
#gd-caja header{display:flex;align-items:center;gap:10px;padding:12px 16px;border-bottom:1px solid #2A2126}
#gd-caja header b{font-size:16px;color:#E0A458}
#gd-caja .gd-mig{flex:1;font-size:12.5px;color:#9A867E;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#gd-caja .gd-mig a{color:#C98545;cursor:pointer;text-decoration:none}#gd-caja .gd-mig a:hover{text-decoration:underline}
#gd-caja .gd-x{background:none;border:1px solid #3B2E34;border-radius:3px;color:#9A867E;cursor:pointer;padding:4px 10px;font:inherit}
#gd-caja .gd-x:hover{color:#E0A458;border-color:#C98545}
#gd-caja .gd-cuerpo{flex:1;overflow:auto;padding:14px 18px 20px}
#gd-caja h2{margin:0 0 4px;font-size:20px;color:#E0A458}
#gd-caja p{margin:0 0 10px;line-height:1.5;color:#CDBFB4;font-size:14px}
#gd-caja .gd-aviso{border-left:3px solid #C98545;background:rgba(201,133,69,.10);padding:8px 12px;border-radius:0 4px 4px 0;font-size:13px;margin:8px 0 14px}
#gd-caja .gd-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin:8px 0 16px}
#gd-caja .gd-card{display:flex;flex-direction:column;gap:5px;text-align:left;background:rgba(255,255,255,.035);border:1px solid #3B2E34;border-radius:6px;padding:11px 12px;color:#EDE3D2;font:inherit}
#gd-caja button.gd-card{cursor:pointer}
#gd-caja button.gd-card:hover{border-color:#E0A458;background:rgba(224,164,88,.10)}
#gd-caja .gd-card .ico{font-size:26px;line-height:1}
#gd-caja .gd-card b{font-size:15px}
#gd-caja .gd-card small{color:#B7A79E;font-size:12.5px;line-height:1.4}
#gd-caja .gd-card .ej{color:#8FAFA0;font-size:12px}
#gd-caja .gd-card.buff{border-color:#3D6B57}#gd-caja .gd-card.debuff{border-color:#7A3B3B}
#gd-caja .gd-chip{display:inline-block;font-size:11px;padding:1px 7px;border-radius:9px;border:1px solid #3B2E34;color:#B7A79E;margin-right:4px}
#gd-caja .gd-chip.casa{border-color:#C98545;color:#E0A458}#gd-caja .gd-chip.exc{border-color:#6E5A8A;color:#B7A6D6}#gd-caja .gd-chip.comp{border-color:#4F8A78;color:#8FD1BC}#gd-caja .gd-peso{font-size:11.5px;color:#9A867E}
#gd-caja .gd-filtros{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
#gd-caja .gd-filtros button{background:none;border:1px solid #3B2E34;border-radius:14px;color:#B7A79E;padding:3px 11px;cursor:pointer;font:inherit;font-size:12.5px}
#gd-caja .gd-filtros button.on{border-color:#E0A458;color:#E0A458;background:rgba(224,164,88,.12)}
#gd-caja h3{margin:14px 0 4px;font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:#9A867E}
#gd-caja .gd-leyenda{font-size:12px;color:#9A867E;margin-top:8px}`;
    document.head.appendChild(s);
  }

  const chipEst = e => e && EST[e] ? `<span class="gd-chip" title="${esc(EST[e][1])}">${EST[e][0]} ${e === 'auto' ? 'automático' : e === 'mano' ? 'a mano' : 'por construir'}</span>` : '';
  const AVISO = '<div class="gd-aviso">📐 Todo esto son <b>guías orientativas, no reglas estrictas</b>. Podés salirte cuando quieras: un punzón con Knockdown se puede, solo que va a ser raro. Cada efecto tiene tres niveles según la familia: <b>🏠 de casa</b> (le da identidad), <b>🤝 habilitado</b> (se comparte por contexto: por ejemplo Envenenar sirve en todo lo que tiene filo) y <b>✨ excepcional</b> (va contra el concepto: un martillo que envenena se puede, pero es raro).</div>';

  function abrir(seccion){
    estilos();
    const previo = document.getElementById('gd-fondo'); if(previo) previo.remove();
    const fondo = document.createElement('div');
    fondo.id = 'gd-fondo';
    document.body.appendChild(fondo);
    let ruta = [];   // [{p: pagina, x: dato}]
    let filtroEfecto = '';

    const cerrar = () => { fondo.remove(); document.removeEventListener('keydown', teclas, true); };
    const teclas = e => { if(e.key === 'Escape'){ e.stopPropagation(); if(ruta.length > 1) ruta.pop(), dibujar(); else cerrar(); } };
    document.addEventListener('keydown', teclas, true);

    const TIT = {inicio: 'Guía de diseño', skill: 'Diseñar una skill', clase: '', arma: 'Diseñar un arma', familia: '', efectosArma: 'Efectos para un arma', estados: 'Estados alterados', mapa: 'Mecánicas del mapa'};
    const nombreDe = r => r.p === 'clase' ? CLASES.find(c => c.id === r.x).n : r.p === 'familia' ? FAMILIAS.find(f => f.id === r.x).n : TIT[r.p];

    function pagina(r){
      if(r.p === 'inicio') return `<h2>¿Qué querés diseñar?</h2>
        <p>Elegí un espacio de diseño y te muestro, con ejemplos, todo lo que se puede hacer ahí. Vas de lo general a lo particular y siempre podés volver.</p>${AVISO}
        <div class="gd-grid">
          <button class="gd-card" data-ir="skill"><span class="ico">✨</span><b>Una skill</b><small>Elegí la clase (Warrior, Asalto, Tanque, Mago, Shooter, Support, Debuffer) y mirá su abanico de mecánicas.</small></button>
          <button class="gd-card" data-ir="arma"><span class="ico">⚔️</span><b>Un arma</b><small>Qué define a un arma, qué familia tiene qué efecto "de casa" y todos los efectos que se le pueden sumar.</small></button>
          <button class="gd-card" data-ir="estados"><span class="ico">🌀</span><b>Un estado alterado</b><small>Todos los buffs y debuffs que ya existen: para no inventar lo que ya está.</small></button>
          <button class="gd-card" data-ir="mapa"><span class="ico">🗺️</span><b>Algo del mapa</b><small>Trampas, terreno, sigilo, niebla, iniciativa y movimiento.</small></button>
        </div><div class="gd-leyenda">Etiquetas: ⚙ automático · ✋ a mano en la mesa · 🔲 por construir (idea de diseño)</div>`;
      if(r.p === 'skill') return `<h2>Diseñar una skill: ¿de qué clase?</h2>
        <p>La clase le da <b>sabor</b> a la skill: cada una tiene sus propias formas de jugar. Al elegirla ves las mecánicas de esa clase, con skills existentes como ejemplo. Recordá que cualquier jugador puede tomar skills de cualquier clase.</p>${AVISO}
        <div class="gd-grid">${CLASES.map(c => `<button class="gd-card" data-ir="clase:${c.id}"><span class="ico">${c.ico}</span><b>${esc(c.n)}</b><small>${esc(c.resumen)}</small></button>`).join('')}</div>`;
      if(r.p === 'clase'){
        const c = CLASES.find(x => x.id === r.x);
        return `<h2>${c.ico} ${esc(c.n)}</h2><p>${esc(c.idea)}</p>${AVISO}<h3>Mecánicas que juegan con este concepto</h3>
          <div class="gd-grid">${c.m.map(m => `<div class="gd-card"><b>${esc(m.n)}</b><small>${esc(m.d)}</small><span class="ej">Ej.: ${esc(m.ej)}</span><span>${chipEst(m.e)}</span></div>`).join('')}</div>
          <div class="gd-leyenda">Estas son las mecánicas <b>de casa</b> de la clase. Una skill de otra clase puede usarlas, pero será la excepción. Skills concretas y sus costos: <code>docs/clases-borrador.md</code>.</div>`;
      }
      if(r.p === 'arma') return `<h2>Diseñar un arma</h2><p>Primero, <b>qué define a un arma</b>; después, de qué familia es y qué efectos suele tener.</p>${AVISO}
        <h3>1 · Qué define a un arma</h3><div class="gd-grid">${ARMA_BASE.map(b => `<div class="gd-card"><b>${esc(b.n)}</b><small>${esc(b.d)}</small></div>`).join('')}</div>
        <h3>2 · ¿De qué familia es?</h3><div class="gd-grid">${FAMILIAS.map(f => `<button class="gd-card" data-ir="familia:${f.id}"><span class="ico">${f.ico}</span><b>${esc(f.n)}</b><small>${esc(f.resumen)}</small><span><span class="gd-chip casa">🏠 ${esc(f.casa)}</span></span></button>`).join('')}</div>
        <h3>3 · ¿Qué otros efectos puede tener?</h3><div class="gd-grid"><button class="gd-card" data-ir="efectosArma"><span class="ico">🎁</span><b>Ver todos los efectos</b><small>La grilla completa de efectos al golpear, con cuáles son de casa de cada familia.</small></button></div>`;
      if(r.p === 'familia'){
        const f = FAMILIAS.find(x => x.id === r.x);
        const casa = EFECTOS_ARMA.filter(e => e.casa.includes(f.id)), comp = EFECTOS_ARMA.filter(e => !e.casa.includes(f.id) && e.comp.includes(f.id)), otras = EFECTOS_ARMA.filter(e => !e.casa.includes(f.id) && !e.comp.includes(f.id));
        return `<h2>${f.ico} ${esc(f.n)}</h2><p>${esc(f.resumen)} Dado orientativo: <b>${esc(f.dado)}</b>.</p>${AVISO}
          <h3>🏠 Efecto de casa</h3>${casa.length ? `<div class="gd-grid">${casa.map(carta(f.id)).join('')}</div>` : '<p>Todavía sin definir: se decide entre todos. Podés usar cualquiera de los de abajo.</p>'}
          <h3>🤝 Efectos habilitados por contexto (compartidos con otras familias)</h3>${comp.length ? `<div class="gd-grid">${comp.map(carta(f.id)).join('')}</div>` : '<p>Ninguno por ahora.</p>'}
          <h3>✨ Excepcionales (van contra el concepto de esta familia)</h3><div class="gd-grid">${otras.map(carta(f.id)).join('')}</div>`;
      }
      if(r.p === 'efectosArma'){
        const lista = filtroEfecto ? EFECTOS_ARMA.filter(e => e.casa.includes(filtroEfecto) || e.comp.includes(filtroEfecto)) : EFECTOS_ARMA;
        return `<h2>🎁 Efectos para un arma</h2><p>Todo lo que un arma puede dejar en el golpeado. Filtrá por familia para ver cuáles son de casa (🏠) o están habilitados en ella (🤝). El <b>peso</b> mide cuánto pesa el efecto en combate: servirá para calcular la calidad y el precio de un arma (por ahora son valores provisorios).</p>${AVISO}
          <div class="gd-filtros"><button data-filtro="" class="${!filtroEfecto ? 'on' : ''}">Todos</button>${FAMILIAS.filter(f => EFECTOS_ARMA.some(e => e.casa.includes(f.id) || e.comp.includes(f.id))).map(f => `<button data-filtro="${f.id}" class="${filtroEfecto === f.id ? 'on' : ''}">${f.ico} ${esc(f.n)}</button>`).join('')}</div>
          <div class="gd-grid">${lista.map(carta(filtroEfecto)).join('')}</div>
          <div class="gd-leyenda">Los efectos de arma se <b>recuerdan y se tiran</b> en la Mesa; aplicarlos sobre el rival sigue siendo a mano, a propósito.</div>`;
      }
      if(r.p === 'estados') return `<h2>🌀 Estados alterados</h2><p>Los que ya existen en el juego. Antes de inventar uno nuevo, mirá si alguno hace lo que buscás (y para crear uno de cero hay un asistente paso a paso en "+ Estado").</p>${AVISO}
        <h3>En contra (debuffs)</h3><div class="gd-grid">${ESTADOS.filter(x => x[1] === 'debuff').map(x => `<div class="gd-card debuff"><b>${esc(x[0])}</b><small>${esc(x[2])}</small></div>`).join('')}</div>
        <h3>A favor (buffs)</h3><div class="gd-grid">${ESTADOS.filter(x => x[1] === 'buff').map(x => `<div class="gd-card buff"><b>${esc(x[0])}</b><small>${esc(x[2])}</small></div>`).join('')}</div>`;
      if(r.p === 'mapa') return `<h2>🗺️ Mecánicas del mapa</h2><p>Lo que se puede jugar sobre el mapa, para pensar skills, equipos y trampas que lo usen.</p>${AVISO}
        <div class="gd-grid">${MAPA.map(m => `<div class="gd-card"><b>${esc(m.n)}</b><small>${esc(m.d)}</small><span class="ej">${esc(m.ej)}</span><span>${chipEst(m.e)}</span></div>`).join('')}</div>`;
      return '';
    }
    // Carta de efecto de arma. `fam` = familia que se está mirando (para marcar de casa / excepcional).
    const estrellas = p => '★'.repeat(p) + '☆'.repeat(5 - p);
    const carta = fam => e => {
      const nom = id => esc(FAMILIAS.find(f => f.id === id).n);
      const marca = !fam
        ? e.casa.map(id => `<span class="gd-chip casa">🏠 ${nom(id)}</span>`).join('') + e.comp.map(id => `<span class="gd-chip comp">🤝 ${nom(id)}</span>`).join('') || '<span class="gd-chip">libre</span>'
        : e.casa.includes(fam) ? '<span class="gd-chip casa">🏠 de casa</span>' : e.comp.includes(fam) ? '<span class="gd-chip comp">🤝 habilitado</span>' : '<span class="gd-chip exc">✨ excepcional aquí</span>';
      return `<div class="gd-card"><b>${esc(e.n)}</b><small>${esc(e.d)}</small><span>${marca}${chipEst(e.e)}</span><span class="gd-peso" title="Relevancia del efecto en combate (provisorio); servirá para calcular calidad y precio del arma">⚖ peso ${estrellas(e.peso)}</span></div>`;
    };

    function dibujar(){
      const r = ruta[ruta.length - 1];
      const mig = ruta.map((x, i) => i === ruta.length - 1 ? esc(nombreDe(x)) : `<a data-nivel="${i}">${esc(nombreDe(x))}</a>`).join(' › ');
      fondo.innerHTML = `<div id="gd-caja" role="dialog" aria-modal="true"><header><b>📐 Guía de diseño</b><span class="gd-mig">${mig}</span>
        ${ruta.length > 1 ? '<button class="gd-x" data-atras="1">◀ Volver</button>' : ''}<button class="gd-x" data-cerrar="1">✕</button></header>
        <div class="gd-cuerpo">${pagina(r)}</div></div>`;
    }
    const ir = t => { const [p, x] = t.split(':'); ruta.push({p, x}); if(p === 'efectosArma') filtroEfecto = ''; dibujar(); const c = fondo.querySelector('.gd-cuerpo'); if(c) c.scrollTop = 0; };
    fondo.addEventListener('mousedown', e => { if(e.target === fondo) cerrar(); });
    fondo.addEventListener('click', e => {
      const b = e.target.closest('[data-ir],[data-atras],[data-cerrar],[data-nivel],[data-filtro]'); if(!b) return;
      const d = b.dataset;
      if(d.cerrar) cerrar();
      else if(d.atras){ ruta.pop(); dibujar(); }
      else if(d.nivel !== undefined){ ruta = ruta.slice(0, +d.nivel + 1); dibujar(); }
      else if(d.filtro !== undefined){ filtroEfecto = d.filtro; dibujar(); }
      else if(d.ir) ir(d.ir);
    });
    ruta = [{p: 'inicio'}];
    if(seccion && ['skill', 'arma', 'estados', 'mapa'].includes(seccion)) ruta.push({p: seccion});
    dibujar();
  }
  return {abrir};
})();
