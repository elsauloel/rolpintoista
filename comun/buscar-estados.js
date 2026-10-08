/* =========================================================
   BUSCAR-ESTADOS — el buscador de la lista de estados alterados (2026-10-08, pedido del dueño: «un buscador por nombre, y palabras
   clave tipo regen»). Una caja arriba de la lista que filtra las tarjetas mientras se escribe: por el nombre del estado, por lo que dice
   su descripción y por palabras clave (PALABRAS: «regen», «escudo», «dot», «control», «cc»…). Sin acentos ni mayúsculas; con varias
   palabras, tienen que estar todas. Los grupos (Buffs, Debuffs, Otros, Mis presets) sin ninguna tarjeta a la vista se esconden.
   La usan las tres listas: la ficha (#presets-body), GM Tools (#presets-creep-body) y el selector común del mapa (selector-estados.js).
   BuscarEstados.conectar(contenedor): pone la caja al principio del contenedor (ya dibujado) y la deja con el foco.
   Las tarjetas: .preset-card / .preset-btn (ficha, GM Tools) o .se-btn (el mapa); su nombre, .preset-nombre / .se-nombre.
   ========================================================= */
const BuscarEstados = (() => {
  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  // Palabras clave por estado (además de su nombre y su descripción). Si se suma un estado con un nombre que no dice lo que hace, va acá.
  const PALABRAS = {
    'Regeneración': 'regen cura curar curación vida hp sana por turno',
    'Veneno': 'dot daño por turno toxico poison', 'Veneno severo': 'dot daño por turno toxico poison',
    'Sangrado': 'dot daño por turno bleed sangre', 'Quemadura': 'dot daño por turno fuego burn',
    'Escarcha': 'hielo frio no2 nitros', 'Armadura rota': 'defensa rompe armadura',
    'Pajaritos': 'control cc mareo aturdido mitad', 'Stun': 'control cc aturdido aturdir paralizado',
    'Inmovilizado': 'control cc atrapado quieto mover', 'Rengo': 'control cc mover lento', 'Lento': 'control mover paso',
    'Lisiado': 'control cc mitad', 'Parálisis': 'control cc paralizado', 'Sentado': 'control derribado suelo caido',
    'Confusión': 'control confundido', 'Miedo': 'control asustado', 'Provocado': 'taunt control', 'Silencio': 'control sin habilidades mudo',
    'Desarmado': 'control arma suelta', 'Ceguera': 'control ciego vista', 'Cansado': 'no2 nitros fatiga', 'Exhausto': 'no2 nitros fatiga',
    'Hypeado': 'no2 nitros buff', 'Invulnerable': 'inmune inmunidad sin daño', 'Inmunidad a CC': 'inmune inmunidad control cc',
    'Titilando': 'inmune invulnerable revivido', 'Espinas': 'devuelve refleja daño', 'Espejo': 'devuelve refleja daño especial',
    'Vida extra': 'escudo shield absorbe excedente hp', 'Barrera': 'escudo shield absorbe', 'Blindado': 'defensa escudo armadura',
    'Afortunado': 'suerte ventaja dos veces', 'Sigilo': 'oculto invisible stealth esconderse', 'Marcado': 'visible brillo revelado',
    'Crítico frecuente': 'crit critico', 'Crítico potente': 'crit critico', 'Sangre pura': 'inmune veneno', 'Coagulación extrema': 'inmune sangrado',
    'Inamovible': 'empujon empuje no se mueve', 'Mareo de invocación': 'invocacion espera',
  };
  const CSS = `.be-caja{display:flex;gap:8px;align-items:center;margin:2px 0 10px}
.be-caja input{flex:1;min-width:0;padding:7px 10px;border-radius:5px;border:1px solid #5A4650;background:rgba(0,0,0,.25);color:inherit;font:inherit;font-size:13px}
.be-caja input:focus{outline:none;border-color:#E0A458}
.be-vacio{font-size:12px;opacity:.75;margin:8px 0}`;
  function estilos(){
    if(document.getElementById('be-css')) return;
    const s = document.createElement('style'); s.id = 'be-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  const TARJETA = '.preset-card, .preset-btn, .se-btn';
  const GRUPO = '.preset-grupo, .se-grupo';
  const textoDe = el => {
    const nom = (el.querySelector('.preset-nombre, .se-nombre') || {}).textContent || '';
    return norm(`${el.textContent} ${PALABRAS[nom.trim()] || ''}`);
  };
  function filtrar(cont, q){
    const palabras = norm(q).split(/\s+/).filter(Boolean);
    let alguna = false;
    cont.querySelectorAll(TARJETA).forEach(el => {
      const ve = !palabras.length || palabras.every(p => (el._beTexto || (el._beTexto = textoDe(el))).includes(p));
      el.style.display = ve ? '' : 'none';
      if(ve) alguna = true;
    });
    // Un grupo sin tarjetas a la vista (el título y su grilla, que viene justo después) se esconde.
    cont.querySelectorAll(GRUPO).forEach(g => {
      const grid = g.nextElementSibling;
      const hay = !!grid && [...grid.querySelectorAll(TARJETA)].some(el => el.style.display !== 'none');
      g.style.display = hay ? '' : 'none';
      if(grid) grid.style.display = hay ? '' : 'none';
    });
    const v = cont.querySelector('.be-vacio');
    if(v) v.hidden = alguna || !palabras.length;
  }
  function conectar(cont){
    if(!cont) return;
    estilos();
    const viejo = cont.querySelector('.be-caja');
    if(viejo) viejo.remove();
    const caja = document.createElement('div');
    caja.className = 'be-caja';
    caja.innerHTML = '<input type="search" placeholder="🔎 Buscar por nombre o palabra clave (regen, escudo, veneno, control…)" aria-label="Buscar un estado">';
    const vacio = document.createElement('div');
    vacio.className = 'be-vacio'; vacio.hidden = true; vacio.textContent = 'Ningún estado coincide con la búsqueda.';
    cont.prepend(vacio);
    cont.prepend(caja);
    const input = caja.querySelector('input');
    input.addEventListener('input', () => filtrar(cont, input.value));
    // Escape con texto escrito: borra la búsqueda (no cierra la ventana).
    input.addEventListener('keydown', e => { if(e.key === 'Escape' && input.value){ e.preventDefault(); e.stopPropagation(); input.value = ''; filtrar(cont, ''); } });
    setTimeout(() => { try{ input.focus({preventScroll: true}); }catch(err){} }, 30);
  }
  return {conectar, filtrar, norm, PALABRAS};
})();
