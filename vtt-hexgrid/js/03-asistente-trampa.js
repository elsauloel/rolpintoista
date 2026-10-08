// js/03-asistente-trampa.js — tramo 3 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): asistente paso a paso para crear una trampa propia.
/* ---------- Asistente paso a paso para crear una trampa propia ---------- */
const TRAMPA_TIPOS = [
  {id: 'dano', nombre: '💥 Daño directo', ayuda: 'Hiere a quien la pisa: foso, cuchillas, dardos…', dano: true, forma: 'flor', tam: 1, color: '#8A8A8A'},
  {id: 'veneno', nombre: '☠️ Veneno o gas', ayuda: 'Una nube que envenena o adormece a los de adentro.', dano: false, estado: 'Veneno', forma: 'flor', tam: 2, color: '#4C9A2A'},
  {id: 'explosiva', nombre: '🧨 Explosiva', ayuda: 'Estalla en un área y daña a todos los de adentro (aliados incluidos).', dano: true, forma: 'flor', tam: 2, color: '#D9531E', amiga: true},
  {id: 'inmoviliza', nombre: '🪤 Atrapa', ayuda: 'Deja a quien la pisa sin poder moverse: oso, red, arena…', dano: false, estado: 'Inmovilizado', forma: 'flor', tam: 1, color: '#B5A642'},
  {id: 'debuff', nombre: '🌀 Debilita', ayuda: 'Un debuff: Rengo, Pajaritos, Lisiado, Cansado…', dano: false, estado: 'Pajaritos', forma: 'flor', tam: 1, color: '#7A5FD0'},
  {id: 'control', nombre: '🧠 Controla', ayuda: 'Stun, confusión, agotamiento: le quita el control de sus acciones.', dano: false, estado: 'Stun', forma: 'flor', tam: 1, color: '#B784E0'},
  {id: 'alarma', nombre: '🔔 Alarma', ayuda: 'No hiere: avisa. Alerta a los enemigos cercanos.', dano: false, estado: '', forma: 'linea', tam: 3, color: '#C0A060'},
  {id: 'otra', nombre: '✨ Otra cosa', ayuda: 'Algo distinto: lo describís vos.', dano: false, estado: '', forma: 'flor', tam: 1, color: '#3F6FB0'},
];
const TRAMPA_ESTADOS = [
  ['', 'Ninguno'], ['Veneno', 'Veneno (1 de daño por stack por turno)'], ['Sangrado', 'Sangrado (2 HP por turno hasta curarse)'],
  ['Inmovilizado', 'Inmovilizado'], ['Rengo', 'Rengo (moverse cuesta 2 No2)'], ['Pajaritos', 'Pajaritos (PdG y Evasión a la mitad)'],
  ['Lisiado', 'Lisiado (PdG y Parry a la mitad)'], ['Stun', 'Stun (sin No2, 2 turnos; Evasión falla directo)'], ['Exhausto', 'Exhausto (No2 máximo a un tercio, redondeado abajo)'],
  ['Cansado', 'Cansado (pierde un tercio de sus No2 máximos)'], ['Sentado', 'Sentado (Evasión a la mitad, sin dodge roll; pararse cuesta 1 No2)'], ['Confusión', 'Confusión (1d4 antes de cada acción)'],
];
const TRAMPA_SALVACIONES = ['', 'Evasión', 'Fuerza', 'Res.CC', 'Res.Esp', 'Res.Mt'];
const TRAMPA_PASOS = ['Qué clase es', 'Qué hace', 'Forma y tamaño', 'Nombre y aspecto', 'Resumen'];
let wt = null;   // estado del asistente

function trampaDanoTexto(w){
  if(!w.dano) return '';
  const fijo = Math.round(num(w.fijo));
  return `${Math.max(1, Math.round(num(w.dados)) || 1)}d${w.caras}${fijo ? (fijo > 0 ? '+' : '') + fijo : ''}`;
}
// El texto que se guarda en la trampa (máximo 200 caracteres, el tope del mapa).
function trampaDetalleArmado(w){
  const partes = [];
  const d = trampaDanoTexto(w);
  if(d) partes.push(`${d} de daño${w.tipoId === 'explosiva' ? ' explosivo' : ''} (automático)`);
  if(w.estado){
    const est = TRAMPA_ESTADOS.find(x => x[0] === w.estado);
    let t = est ? est[1] : w.estado;
    const turnos = Math.round(num(w.turnos));
    if(w.estado === 'Veneno' && Math.round(num(w.stacks)) > 0) t = `${Math.round(num(w.stacks))} stacks de Veneno (1 de daño por stack por turno)`;
    else if(turnos > 0) t += ` ${turnos} turno${turnos === 1 ? '' : 's'}`;
    partes.push(t + ' (a mano)');
  }
  if(w.salvacion && num(w.dificultad) > 0) partes.push(`${w.salvacion} contra ${Math.round(num(w.dificultad))} lo evita (a mano)`);
  if((w.extra || '').trim()) partes.push(w.extra.trim());
  const txt = partes.join('. ');
  return txt ? (/[.!?]$/.test(txt) ? txt : txt + '.') : '';
}

function abrirAsistenteTrampa(){
  wt = {paso: 0, tipoId: '', dano: false, dados: 2, caras: 6, fijo: 0, estado: '', turnos: 2, stacks: 2, salvacion: '', dificultad: 10, extra: '',
    forma: 'flor', tam: 1, nombre: '', color: '#3F6FB0', alfa: 45, amiga: false, detalleFinal: null};
  let capa = document.getElementById('scrim-asistente-trampa');
  if(!capa){
    capa = document.createElement('div');
    capa.className = 'scrim';
    capa.id = 'scrim-asistente-trampa';
    capa.style.zIndex = '95';
    capa.innerHTML = '<div class="modal" style="max-width:640px"><header><h3 id="wt-titulo">Crear una trampa</h3><button class="iconbtn" id="wt-x">Cancelar</button></header><div class="body" id="wt-cuerpo"></div><footer id="wt-pie"></footer></div>';
    document.body.appendChild(capa);
    capa.addEventListener('mousedown', e => { if(e.target === capa) cerrarAsistenteTrampa(); });
    capa.addEventListener('click', clicAsistenteTrampa);
    capa.addEventListener('input', entradaAsistenteTrampa);
    capa.addEventListener('change', entradaAsistenteTrampa);
  }
  pintarAsistenteTrampa();
  capa.classList.add('open');
}
function cerrarAsistenteTrampa(){
  const capa = document.getElementById('scrim-asistente-trampa');
  if(capa) capa.classList.remove('open');
  wt = null;
}
function trampaResumenGuardable(){
  const detalle = (wt.detalleFinal !== null ? wt.detalleFinal : trampaDetalleArmado(wt)).trim().slice(0, 200);
  return {nombre: wt.nombre.trim().slice(0, 40), detalle, amiga: !!wt.amiga, tipo: wt.forma, tamano: Math.max(1, Math.min(TAMANO_ELEMENTO_MAX, Math.round(num(wt.tam)) || 1)),
    color: wt.color, alfa: Number(wt.alfa), dano: wt.dano ? trampaDanoTexto(wt) : ''};
}
function pintarAsistenteTrampa(){
  const w = wt;
  if(!w) return;
  const cuerpo = document.getElementById('wt-cuerpo'), pie = document.getElementById('wt-pie');
  document.getElementById('wt-titulo').textContent = `Crear una trampa · paso ${w.paso + 1} de ${TRAMPA_PASOS.length}: ${TRAMPA_PASOS[w.paso]}`;
  const campo = (etiqueta, html, ayuda) => `<div class="f" style="margin-bottom:12px"><label>${etiqueta}</label>${html}${ayuda ? `<div class="hint" style="margin-top:4px">${ayuda}</div>` : ''}</div>`;
  let h = '';
  if(w.paso === 0){
    h = `<p class="hint" style="margin:0 0 10px">Elegí la clase que más se parezca a tu idea. Después ajustás todo.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px">${TRAMPA_TIPOS.map(t => `<button type="button" class="btn${w.tipoId === t.id ? ' primary' : ''}" data-wt-tipo="${t.id}" style="text-align:left;white-space:normal"><b>${t.nombre}</b><br><small>${t.ayuda}</small></button>`).join('')}</div>`;
  }else if(w.paso === 1){
    h = campo('¿Hace daño?', `<label class="tk-lapiz-check" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-wt-campo="dano"${w.dano ? ' checked' : ''}> Sí: se tira solo y se descuenta de la vida de quien la activa (restando su Defensa)</label>`)
      + (w.dano ? campo('Cuánto daño', `<div style="display:flex;gap:6px;align-items:center"><input type="number" min="1" max="20" data-wt-campo="dados" value="${esc(w.dados)}" style="width:70px"> d <select data-wt-campo="caras">${[4, 6, 8, 10, 12].map(c => `<option value="${c}"${num(w.caras) === c ? ' selected' : ''}>${c}</option>`).join('')}</select> + <input type="number" data-wt-campo="fijo" value="${esc(w.fijo)}" style="width:70px"></div>`, `Guía: nivel 1 → 1d6, 2 → 2d6, 3 → 3d6, 4 → 4d6, 5 → 5d6. Ahora: <b>${trampaDanoTexto(w)}</b>.`) : '')
      + campo('¿Aplica un estado?', `<select data-wt-campo="estado">${TRAMPA_ESTADOS.map(e => `<option value="${e[0]}"${w.estado === e[0] ? ' selected' : ''}>${e[1]}</option>`).join('')}</select>`, 'El estado se anota en la Mesa: <b>aplicarlo lo hace la mesa a mano</b> (la herramienta todavía no lo puede poner sola sobre otros).')
      + (w.estado ? (w.estado === 'Veneno'
          ? campo('Stacks de veneno', `<input type="number" min="1" max="10" data-wt-campo="stacks" value="${esc(w.stacks)}" style="width:90px">`)
          : campo('Duración (turnos)', `<input type="number" min="0" max="10" data-wt-campo="turnos" value="${esc(w.turnos)}" style="width:90px">`)) : '')
      + campo('¿Se puede evitar con una tirada?', `<div style="display:flex;gap:6px;align-items:center"><select data-wt-campo="salvacion">${TRAMPA_SALVACIONES.map(s => `<option value="${s}"${w.salvacion === s ? ' selected' : ''}>${s || 'No, no hay tirada'}</option>`).join('')}</select>${w.salvacion ? ` contra <input type="number" min="1" max="30" data-wt-campo="dificultad" value="${esc(w.dificultad)}" style="width:80px">` : ''}</div>`, 'Guía: dificultad 6 + 2 por nivel de la trampa. La tirada se resuelve a mano.')
      + campo('Algo más (opcional)', `<input type="text" maxlength="90" data-wt-campo="extra" value="${esc(w.extra)}" placeholder="ej. suena una alarma que alerta a 8 casillas">`);
  }else if(w.paso === 2){
    h = campo('Forma', `<select data-wt-campo="forma"><option value="flor"${w.forma === 'flor' ? ' selected' : ''}>Flor: un centro y su alrededor</option><option value="linea"${w.forma === 'linea' ? ' selected' : ''}>Línea</option><option value="libre"${w.forma === 'libre' ? ' selected' : ''}>Forma libre (pintar casilleros)</option></select>`)
      + (w.forma === 'libre' ? '' : campo(w.forma === 'flor' ? 'Radio' : 'Largo', `<input type="number" min="1" max="${TAMANO_ELEMENTO_MAX}" data-wt-campo="tam" value="${esc(w.tam)}" style="width:90px">`,
          w.forma === 'flor' ? '1 = una sola casilla. 2 = la casilla y su primer anillo, y así.' : 'Cuántas casillas de largo.'))
      + '<p class="hint">En el mapa, después de elegir "Cargar para colocarla", hacés clic donde va y arrastrás hasta el tamaño; se ajusta a lo de acá.</p>';
  }else if(w.paso === 3){
    h = campo('Nombre', `<input type="text" maxlength="40" data-wt-campo="nombre" value="${esc(w.nombre)}" placeholder="ej. Trampa de oso">`, 'Es lo que sale en la Mesa cuando se dispara (hasta 40 letras).')
      + campo('Color', `<div class="tk-lapiz-colores">${COLORES.map(c => `<button type="button" class="tk-color${c === w.color ? ' elegido' : ''}" data-wt-color="${c}" style="background:${c}" title="${c}"></button>`).join('')}</div>`)
      + campo('Transparencia', `<input type="range" min="0" max="100" step="5" data-wt-campo="alfa" value="${esc(w.alfa)}">`)
      + campo('Fuego amigo', `<label class="tk-lapiz-check" style="display:flex;gap:8px;align-items:center"><input type="checkbox" data-wt-campo="amiga"${w.amiga ? ' checked' : ''}> Sí: también la disparan tus aliados (y vos)</label>`, 'No: solo la disparan tus rivales. Las minas y derrumbes suelen ser "sí".');
  }else{
    const g = trampaResumenGuardable();
    h = `<p class="hint" style="margin:0 0 10px">Revisá el texto que se va a ver en la Mesa cuando alguien la active. Podés corregirlo.</p>
      ${campo('Nombre', `<b>${esc(g.nombre || '(sin nombre)')}</b> · ${g.tipo === 'flor' ? 'flor' : g.tipo} ${g.tipo === 'libre' ? '' : 'de ' + g.tamano} · ${g.amiga ? 'fuego amigo' : 'solo rivales'}`)}
      ${campo('Qué hace (máx. 200 letras)', `<textarea rows="4" maxlength="200" data-wt-campo="detalleFinal" style="width:100%">${esc(g.detalle)}</textarea>`, `<b>⚙ Automático:</b> ${g.dano ? `tira ${esc(g.dano)} de daño y se lo aplica a quien la activa (en un área, también a los creeps si sos GM; a los demás jugadores se les avisa en la Mesa)` : 'solo avisa en la Mesa cuando se dispara'}. <b>✋ A mano:</b> estados, tiradas para evitarla y cualquier otro efecto del texto.`)}`;
  }
  cuerpo.innerHTML = h;
  const ultimo = w.paso === TRAMPA_PASOS.length - 1;
  const bloqueado = (w.paso === 0 && !w.tipoId) || (w.paso === 3 && !w.nombre.trim());
  pie.innerHTML = `<button type="button" class="btn ghost" data-wt-nav="atras"${w.paso === 0 ? ' disabled' : ''}>← Atrás</button>
    ${ultimo ? `<button type="button" class="btn" data-wt-fin="guardar">💾 Guardar como recurrente</button><button type="button" class="btn primary" data-wt-fin="colocar">Cargar para colocarla</button>`
      : `<button type="button" class="btn primary" data-wt-nav="sig"${bloqueado ? ' disabled' : ''}>Siguiente →</button>`}`;
}
function clicAsistenteTrampa(e){
  if(!wt) return;
  if(e.target.closest('#wt-x')){ cerrarAsistenteTrampa(); return; }
  const tipo = e.target.closest('[data-wt-tipo]');
  if(tipo){
    const t = TRAMPA_TIPOS.find(x => x.id === tipo.dataset.wtTipo);
    Object.assign(wt, {tipoId: t.id, dano: !!t.dano, estado: t.estado || '', forma: t.forma, tam: t.tam, color: t.color, amiga: !!t.amiga, detalleFinal: null});
    pintarAsistenteTrampa();
    return;
  }
  const color = e.target.closest('[data-wt-color]');
  if(color){ wt.color = color.dataset.wtColor; pintarAsistenteTrampa(); return; }
  const nav = e.target.closest('[data-wt-nav]');
  if(nav && !nav.disabled){
    if(nav.dataset.wtNav === 'sig'){ wt.detalleFinal = null; wt.paso = Math.min(TRAMPA_PASOS.length - 1, wt.paso + 1); }
    else wt.paso = Math.max(0, wt.paso - 1);
    pintarAsistenteTrampa();
    return;
  }
  const fin = e.target.closest('[data-wt-fin]');
  if(fin){
    const g = trampaResumenGuardable();
    if(!g.nombre){ toast('Falta el nombre de la trampa'); return; }
    if(fin.dataset.wtFin === 'guardar'){
      guardarTrampaRecurrente(g);
      toast(`Trampa "${g.nombre}" guardada: la encontrás en "Trampas guardadas"`);
    }
    cerrarAsistenteTrampa();
    if(fin.dataset.wtFin === 'colocar') cargarTrampaEnPanel(g);
  }
}
function entradaAsistenteTrampa(e){
  if(!wt) return;
  const c = e.target.dataset && e.target.dataset.wtCampo;
  if(!c) return;
  wt[c] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  const sig = document.querySelector('#wt-pie [data-wt-nav="sig"]');
  if(sig && wt.paso === 3) sig.disabled = !wt.nombre.trim();   // el nombre habilita "Siguiente" sin redibujar
  // Lo que cambia otras partes de la pantalla se vuelve a dibujar (solo al confirmar el cambio, para no perder el foco al tipear).
  if(e.type === 'change' && ['dano', 'estado', 'salvacion', 'forma', 'caras', 'dados', 'fijo'].includes(c)) pintarAsistenteTrampa();
}

// Alerta roja en la Mesa cuando un personaje en sigilo hace algo que se sale de lo
// normal (Mover libre, gastar más No2 de los que tiene): que no se "chispotee" una
// regla sin que la mesa se entere. Solo avisa; no impide nada.
// Línea roja SIN nombres ni datos del sigilo: solo avisa que hace falta una tirada, para que
// nadie sepa quién ni por qué (tiene que tirar percepción y, si falla, misterio).
async function alertaRojaAnonima(origen, detalle){
  if(!fbDb || !fbUsuario || !fbMiembro) return;
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen, formula: detalle || '', rolls: [], mod: 0, total: 0,
      desde: 'alerta-roja', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo publicar la alerta:', err); }
}
async function sigiloAlertaRoja(t, que, detalle){
  if(!t || !fbDb || !fbUsuario || !fbMiembro || !enSigilo(t)) return;
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
      origen: `⚠ ${nombreDe(t)} (en sigilo) ${que}`, formula: detalle || '', rolls: [], mod: 0, total: 0,
      desde: 'alerta-roja', cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){ console.error('No se pudo publicar la alerta de sigilo:', err); }
}
// Al soltar un token en sigilo (mientras ÉL se mueve): corta la ruta en la primera casilla
// que cae en un cono rival (detección inmediata) y cuenta los pasos que da dentro de cada
// zona de alerta: corresponde una tirada de percepción por paso, que se anuncia en rojo en la
// Mesa. NO se interrumpe el movimiento por la zona de alerta: el oculto ve las zonas y decide
// cuándo entrar, así que sabe lo que hace (decidido 2026-09-19, escenario 1).
function sigiloEvaluarRuta(t, a){
  const rivales = rivalesDe(t).map(zonasClaves);
  if(!rivales.length) return;
  const ruta = a.ruta;
  let corte = -1;
  for(let i = 1; i < ruta.length && corte < 0; i++){
    const k = nbPack(ruta[i].col, ruta[i].fila);
    if(rivales.some(z => z.cono.has(k))) corte = i;
  }
  const fin = corte >= 0 ? corte : ruta.length - 1;
  const avisos = [];
  rivales.forEach(z => {
    let pasos = 0;
    for(let i = 1; i <= fin; i++) if(z.alerta.has(nbPack(ruta[i].col, ruta[i].fila))) pasos++;
    if(pasos > 0) avisos.push({rival: z.nombre, pasos});
  });
  if(corte >= 0) ruta.length = corte + 1;
  if(avisos.length) sigiloAvisosPendientes.set(a.id, avisos);
}
function sigiloPublicarAvisos(id){
  const avisos = sigiloAvisosPendientes.get(id);
  sigiloAvisosPendientes.delete(id);
  const t = tokens.get(id);
  if(!avisos || !t) return;
  // Uno por rival que ve la zona; sin decir quién se mueve ni que está en sigilo.
  avisos.forEach(av => alertaRojaAnonima(av.pasos === 1
    ? '⚠ Hace falta una tirada de percepción'
    : `⚠ Hacen falta ${av.pasos} tiradas de percepción`));
}
async function romperSigilo(id, detector, motivo, sinMomento){   // motivo (opcional): otra causa que no sea que lo detecten (una trampa); sinMomento: ya lo cuenta otro momento (P146)
  const t = tokens.get(id);
  const e = t && estadoDe(t);
  const idx = e ? e.estados.findIndex(s => String((s && s.nombre) || '').trim().toLowerCase() === 'sigilo') : -1;
  if(idx < 0) return;
  sigiloRompiendo.add(id);
  try{
    await hudEstadoCambiar(t, idx, 'quitar');
    sigiloAviso(`🕶 ${nombreDe(t)} perdió el sigilo`, motivo || `Lo detectó ${detector}: entró en su cono de detección`);
    if(!sinMomento) momentoAbrir({tipo: 'sigilo', icono: '🕶', titulo: `¡${nombreDe(t)} quedó al descubierto!`, resultado: motivo || `Lo detectó ${detector}`, estado: 'listo'});   // P146 (js/16)
  }finally{ setTimeout(() => sigiloRompiendo.delete(id), 3000); }
}
// Cada vez que algo se movió o cambió de sigilo: si un token en sigilo que puedo
// manejar (mi personaje; el GM, sus creeps) quedó dentro de un cono rival, pierde el sigilo.
function sigiloRevisar(){
  if(!fbUsuario) return;
  const firma = [...tokens.entries()].map(([id, t]) => `${id}:${t.col},${t.fila},${t.rotacion || 0},${t.oculto ? 1 : 0},${enSigilo(t) ? 1 : 0}`).join('|') + '#' + solidosFirma();
  if(firma === sigiloFirmaRev) return;
  sigiloFirmaRev = firma;
  tokens.forEach((t, id) => {
    if(sigiloRompiendo.has(id) || !puedoCambiarVida(t) || !enSigilo(t)) return;
    const k = nbPack(t.col, t.fila);
    const det = rivalesDe(t).map(zonasClaves).find(z => z.cono.has(k));
    if(det) romperSigilo(id, det.nombre);
  });
}

// Marca "?" atenuada de la última posición vista de un token (niebla y sigilo).
function dibujarFantasma(col, fila, color, z){
  const c = hexCentro(col, fila);
  trazarPuntos(verticesHex(c.x, c.y, HEX * 0.68));
  ctx.fillStyle = colorConAlfa(color || '#9A867E', 0.35); ctx.fill();
  ctx.setLineDash([5 / z, 4 / z]);
  ctx.strokeStyle = 'rgba(237,227,210,.75)'; ctx.lineWidth = 2 / z; ctx.stroke();
  ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = `700 ${HEX * 0.7}px "Space Grotesk", system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(237,227,210,.85)';
  ctx.fillText('?', c.x, c.y + HEX * 0.04);
}
// Sigilo: un rival que se escondió a la vista deja su última posición conocida
// marcada SIGILO_MARCA_TURNOS turnos (los que pasa el Mantenimiento). Es de cada
// navegador: se anota mientras se lo ve y nace cuando desaparece por el sigilo.
const SIGILO_MARCA_TURNOS = 2;
const sigiloUltimaVista = new Map();   // tokenId -> {col, fila}: dónde lo vi antes de esconderse
const sigiloFantasmas = new Map();     // tokenId -> {col, fila, hasta}
// ¿Es un token que YO no veo por estar en sigilo? (jugador: los creeps; GM: los
// personajes, salvo con su 👁).
function ocultoPorSigiloParaMi(t){
  if(!enSigilo(t)) return false;
  return soyGM ? (t.tipo === 'pj' && !ojoRevelando) : (t.tipo === 'creep' && !reveladaCasilla(t));   // «Ve lo oculto» de un aliado lo deja ver
}
function sigiloFantasmasActualizar(){
  tokens.forEach((t, id) => {
    if(t.oculto || !(soyGM ? t.tipo === 'pj' : t.tipo === 'creep')) return;
    if(enSigilo(t)){
      const u = sigiloUltimaVista.get(id);
      if(u && !sigiloFantasmas.has(id) && ocultoPorSigiloParaMi(t)){
        sigiloFantasmas.set(id, {col: u.col, fila: u.fila, hasta: (mantenimientoNumero || 0) + SIGILO_MARCA_TURNOS});
      }
    }else{
      if(tokenVisiblePorNiebla(t)) sigiloUltimaVista.set(id, {col: t.col, fila: t.fila});
      sigiloFantasmas.delete(id);
    }
  });
  [...sigiloFantasmas.keys(), ...sigiloUltimaVista.keys()].forEach(id => {
    if(!tokens.has(id)){ sigiloFantasmas.delete(id); sigiloUltimaVista.delete(id); }
  });
}

// El GM no ve a los personajes en sigilo, salvo apretando el ojo 👁: al
// prenderlo se avisa a todos los jugadores (línea roja en la Mesa y un
// destello con un ojo, ver `mesaAlertaOjo` en comun/mesa.js). Se apaga solo
// al recargar.
let ojoRevelando = false;
function renderOjo(){
  const b = $('#btn-ojo');
  $('#btn-ojo-menu').classList.toggle('revelando', ojoRevelando);
  b.classList.toggle('primary', ojoRevelando);
  b.textContent = ojoRevelando ? '👁 Ocultar de nuevo' : '👁 Revelar lo oculto';
}
$('#btn-ojo').onclick = async () => {
  if(!soyGM) return;
  ojoRevelando = !ojoRevelando;
  renderOjo(); renderIniciativa(); pedirDibujo();
  if(!ojoRevelando){
    toast('Volvés a no ver lo oculto');
    // También se avisa a la mesa (línea común, sin el destello del ojo): lo oculto vuelve a estarlo.
    sigiloAviso('👁 El GM dejó de revelar lo oculto', 'Vuelve la visión normal: lo que estaba en sigilo vuelve a estar oculto');
    return;
  }
  try{
    await fbDb.collection(fbRutaCampana('tiradas')).add({
      uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: 'GM',
      origen: 'El GM está revelando lo oculto', formula: 'Todo lo que estaba en sigilo se ve ahora',
      rolls: [], mod: 0, total: 0, desde: 'alerta',
      cuando: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }catch(err){
    console.error('No se pudo avisar a los jugadores:', err);
    ojoRevelando = false; renderOjo(); pedirDibujo();
    toast('No se pudo avisar a los jugadores, así que no se reveló nada');
  }
};
// El jugador con un personaje suyo en sigilo ve el mapa con un tinte violáceo.
function yoEnSigilo(){
  if(soyGM || !fbUsuario) return false;
  for(const t of tokens.values()){
    if(t.tipo === 'pj' && t.duenoUid === fbUsuario.uid && !(t.fichaId && t.fichaId.includes(SEP_INVOCACION)) && enSigilo(t)) return true;
  }
  return false;
}
// ¿A mí me interesa el sigilo ajeno ahora mismo? Jugador: tiene un personaje suyo en sigilo.
// GM: tiene algún creep en sigilo. Mismo criterio que antes usaba zonasParaVer().
function huboAlguienEnSigilo(){
  return soyGM ? [...tokens.values()].some(t => t.tipo === 'creep' && enSigilo(t)) : yoEnSigilo();
}
// Entrar en sigilo prende el modo lentes solo (2026-09-22, a pedido del dueño): antes se
// dibujaban TODAS las zonas de los rivales de una, apenas alguien entraba en sigilo — ahora
// hace falta tocar un token (o el 👁 de "ver todas") para verlas, como con 👓 Ver conos normal.
let sigiloPropioPrevio = false;
// Los primeros segundos después de cargar no cuentan como "alguien entró en sigilo" (2026-10-02: con F5, el GM con un creep en sigilo veía
// los lentes prenderse solos): ahí solo se toma nota de cómo está.
const autoLentesDesde = Date.now() + 8000;
function revisarAutoLentes(){
  const ahora = huboAlguienEnSigilo();
  if(Date.now() < autoLentesDesde){ sigiloPropioPrevio = ahora; return; }
  if(ahora && !sigiloPropioPrevio && !verZonas){
    verZonas = true;
    try{ localStorage.setItem('mapa-ver-zonas', '1'); }catch(e){}
    renderBotonZonas(); actualizarAvisoLentes();
  }
  sigiloPropioPrevio = ahora;
}

// ¿Puedo ver la estela (el rastro de movimiento) de este token? (2026-09-24, pedido del dueño): un token oculto por el GM
// no deja rastro para los jugadores, y uno en sigilo solo lo dejan a la vista del propio usuario y sus aliados (los demás
// personajes; nunca los creeps). El GM ve el rastro de sus creeps siempre; el de un personaje en sigilo, solo con el 👁.
// Se decide al DIBUJAR (no al recibir la ruta), así un token que entra en sigilo justo después de moverse también pierde
// su estela apenas se sabe.
function estelaVisibleDe(t){
  if(!t) return true;
  if(t.oculto && !soyGM) return false;
  if(enSigilo(t)) return soyGM ? (t.tipo === 'creep' || ojoRevelando) : t.tipo === 'pj';
  return true;
}

// Aliados (personajes jugadores e invocaciones) se ven siempre; el resto,
// solo dentro del campo de visión.
function tokenVisiblePorNiebla(t){
  if(tapadoPorNiebla(t)) return false;   // adentro de la niebla de una varita (2026-10-05)
  if(!t.oculto && marcado(t)) return true;   // Marcado (dueño, 2026-10-05): aunque vuelva la niebla de guerra, se lo sigue viendo
  if(!soyGM && t.tipo === 'creep' && enSigilo(t) && !reveladaCasilla(t)) return false;   // creep en sigilo: los jugadores no lo ven (salvo que un aliado vea lo oculto ahí)
  if(soyGM && !ojoRevelando && t.tipo === 'pj' && enSigilo(t)) return false;   // personaje en sigilo: el GM no lo ve sin el 👁
  if(!nieblaAplica() || t.tipo === 'pj') return true;
  return nieblaVista.has(nbPack(t.col, t.fila));
}

// Casillas (offsets en cubo) que ve un token según hacia dónde mira:
// radio VISION_RADIO menos la cuña de atrás. Una por cada uno de los 6 frentes.
const visionOffsets = [];
function offsetsVision(k, R){
  R = R || VISION_RADIO;
  const clave = k + ':' + R;
  if(visionOffsets[clave]) return visionOffsets[clave];
  const rot = k * 60 * Math.PI / 180;
  const bx = Math.sin(rot), by = -Math.cos(rot);   // "atrás" (el frente es (-sin, cos); 0° = abajo)
  const base = hexCentro(0, 0);
  const res = [];
  for(let dq = -R; dq <= R; dq++){
    for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++){
      const p = hexCentro(cuboACol(dq, dr), cuboAFila(dq, dr));
      const vx = p.x - base.x, vy = p.y - base.y, largo = Math.hypot(vx, vy);
      if(largo > 0){
        const ang = Math.acos(Math.max(-1, Math.min(1, (vx * bx + vy * by) / largo))) * 180 / Math.PI;
        if(ang < VISION_CUNA_CIEGA - 1) continue;   // punto ciego (las diagonales traseras sí se ven)
      }
      res.push({dq, dr});
    }
  }
  return (visionOffsets[clave] = res);
}
// Luz que lleva un token (stat «Luz portada» de su ficha: farol, bengala, lámpara) y radio en que ve lo oculto (stat «Ve lo oculto»).
function statPjDe(t, campo){
  if(!t || t.tipo !== 'pj') return 0;
  const v = vinculo(t), r = v && v.resumen;
  return r && Number.isFinite(r[campo]) && r[campo] > 0 ? Math.min(30, Math.round(r[campo])) : 0;
}
const luzPortadaDe = t => statPjDe(t, 'luz'), veOcultoDe = t => statPjDe(t, 'veoculto');
// Ceguera (2026-10-07, la Varita del eclipse): un personaje ciego ve solo la casilla de alrededor, para todos lados, y ni su propia luz.
function ciegoDe(t){
  if(!t || t.tipo !== 'pj') return false;
  const v = vinculo(t), r = v && v.resumen;
  return !!(r && (r.estados || []).some(e => e && (e.ceguera || String(e.nombre || '').trim() === 'Ceguera')));
}
const offsetsDisco = [];   // flor completa de radio R (la luz que se lleva encima ilumina para todos lados, sin punto ciego)
function celdasDisco(R){
  if(offsetsDisco[R]) return offsetsDisco[R];
  const res = [];
  for(let dq = -R; dq <= R; dq++) for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++) res.push({dq, dr});
  return (offsetsDisco[R] = res);
}
// Radio de visión de un token: la luz de la escena + lo que suman sus ítems y pasivas (Visión de la ficha: base 6, ej. Ojo avizor +1).
function radioVisionDe(t){
  let bonus = 0;
  if(t && t.tipo === 'pj'){
    const v = vinculo(t), r = v && v.resumen;
    if(r && Number.isFinite(r.vision) && r.vision > 0) bonus = r.vision - VISION_RADIO;
  }
  return Math.max(1, Math.min(30, luzEscena + bonus));
}
function celdasVisionDe(t, ignorarSolidos){
  const k = ((Math.round(num(t.rotacion || 0) / 60) % 6) + 6) % 6;
  const c0 = hexACubo({col: t.col, fila: t.fila});
  const solidos0 = ignorarSolidos ? new Set() : solidosSet();
  const origen = {col: t.col, fila: t.fila};
  // La niebla de una varita (2026-10-05): desde afuera tapa como un Sólido; desde adentro se ve a 1.
  const nb = nieblaSet(), enNiebla = nb.has(nbPack(t.col, t.fila));
  const solidos = nb.size && !enNiebla ? new Set([...solidos0, ...nb]) : solidos0;
  const res = [], ciego = ciegoDe(t);
  (ciego ? celdasDisco(1) : offsetsVision(k, enNiebla ? 1 : radioVisionDe(t))).forEach(o => {
    const col = cuboACol(c0.q + o.dq, c0.r + o.dr), fila = cuboAFila(c0.q + o.dq, c0.r + o.dr);
    // Los elementos Sólidos tapan la vista: no se ve lo que queda detrás.
    if(solidos.size && !lineaLibre(origen, {col, fila}, solidos)) return;
    res.push(nbPack(col, fila));
  });
  // Las luces del piso (luz flotante): se ven desde donde no las tape un Sólido, aunque estén lejos.
  const lp = ciego ? null : luzPisoSet();
  if(lp && lp.size) lp.forEach(k => { const c = nbUnpack(k); if(!res.includes(k) && (!solidos.size || lineaLibre(origen, c, solidos))) res.push(k); });
  // Luz portada: un disco completo alrededor (sin punto ciego), también tapado por los Sólidos.
  const luz = ciego ? 0 : luzPortadaDe(t);
  if(luz > 0){
    const vistas = new Set(res);
    celdasDisco(enNiebla ? Math.min(1, luz) : luz).forEach(o => {
      const col = cuboACol(c0.q + o.dq, c0.r + o.dr), fila = cuboAFila(c0.q + o.dq, c0.r + o.dr);
      if(solidos.size && !lineaLibre(origen, {col, fila}, solidos)) return;
      vistas.add(nbPack(col, fila));
    });
    return [...vistas];
  }
  return res;
}
/* Las luces del piso (2026-10-08, Varita de la luz flotante): una zona con `zonaLuz` ilumina sus casillas para todos (se las ve desde lejos si nada
   tapa la vista) y, mientras dura, deja ver lo oculto que tiene adentro (trampas escondidas, creeps en sigilo). Al apagarse vuelve a quedar oculto:
   no se «descubre» para siempre. */
let luzPisoCache = {firma: null, set: new Set()};
function luzPisoSet(){
  let f = '';
  elementos.forEach((el, id) => { if(el.zona && el.zonaLuz) f += `${id}:${el.origen.col},${el.origen.fila};`; });
  if(f === luzPisoCache.firma) return luzPisoCache.set;
  const set = new Set();
  elementos.forEach(el => { if(el.zona && el.zonaLuz) celdasDeElemento(el).forEach(c => set.add(nbPack(c.col, c.fila))); });
  luzPisoCache = {firma: f, set};
  return set;
}
const iluminadaPorLuz = el => { const s = luzPisoSet(); return !!s.size && celdasDeElemento(el).some(c => s.has(nbPack(c.col, c.fila))); };
// Lo oculto que ven los personajes con «Ve lo oculto» (radio) dentro de su campo de visión: creeps en sigilo y trampas escondidas.
let revelaFirma = '', reveladas = new Set();
function revelarActualizar(){
  const firma = [...tokens.entries()].filter(([, t]) => veOcultoDe(t) > 0 && !t.oculto).map(([id, t]) => `${id}:${t.col},${t.fila},${t.rotacion || 0},${veOcultoDe(t)},${luzPortadaDe(t)},${radioVisionDe(t)}`).join('|') + '#' + solidosSet().size;
  if(firma === revelaFirma) return;
  revelaFirma = firma;
  reveladas = new Set();
  tokens.forEach(t => {
    const R = veOcultoDe(t);
    if(!R || t.oculto) return;
    if(soyGM ? t.tipo !== 'creep' : t.tipo === 'creep') return;   // cada bando descubre con la visión de sus propios tokens
    celdasVisionDe(t).forEach(k => { if(distanciaHex({col: t.col, fila: t.fila}, nbUnpack(k)) <= R) reveladas.add(k); });
  });
  if(!reveladas.size) return;
  elementos.forEach((el, id) => {
    if(el.trampa && !el.disparada && !trampasVistas.has(id) && celdasDeElemento(el).some(c => reveladas.has(nbPack(c.col, c.fila)))) descubrirTrampa(id);
  });
}
const reveladaCasilla = t => reveladas.has(nbPack(t.col, t.fila)) || luzPisoSet().has(nbPack(t.col, t.fila));   // (o la alumbra una luz del piso)

// ¿Este token descubre niebla? Los personajes sí; sus invocaciones también,
// mientras estén invocadas y vivas.
function daVision(t){
  if(t.tipo !== 'pj' || t.oculto) return false;
  if(t.fichaId && t.fichaId.includes(SEP_INVOCACION)){
    const e = estadoDe(t);
    return !!e && !e.dormida && !e.muerto;
  }
  return true;
}
// Recalcula lo que se ve ahora (y las últimas posiciones vistas) cuando algo
// se movió, y suma lo nuevo a lo descubierto. Se llama al empezar a dibujar.
function nieblaActualizar(){
  if(!nieblaActiva){
    if(nieblaVista.size || nieblaFantasmas.size || nieblaFirma){ nieblaVista = new Set(); nieblaFantasmas.clear(); nieblaFirma = ''; }
    return;
  }
  const firma = [...tokens.entries()].map(([id, t]) => `${id}:${t.col},${t.fila},${t.rotacion || 0},${t.oculto ? 1 : 0},${t.tipo},${enSigilo(t) ? 1 : 0},${daVision(t) ? radioVisionDe(t) + '/' + luzPortadaDe(t) : 0}`).join('|') + '#' + solidosFirma() + '#' + nieblaSet().size;
  if(firma === nieblaFirma) return;
  nieblaFirma = firma;
  const vista = new Set();
  tokens.forEach(t => {
    if(!daVision(t)) return;
    const suyas = soyGM || (fbUsuario && t.duenoUid === fbUsuario.uid);
    celdasVisionDe(t).forEach(k => {
      vista.add(k);
      if(suyas && !nieblaDescubierta.has(k)) nieblaPendientes.add(k);
    });
  });
  nieblaVista = vista;
  // Última posición vista de lo que no es aliado: se anota mientras se ve.
  tokens.forEach((t, id) => {
    if(t.tipo === 'pj' || t.oculto || enSigilo(t)) return;   // en sigilo no se sigue su rastro
    if(vista.has(nbPack(t.col, t.fila))) nieblaFantasmas.set(id, {col: t.col, fila: t.fila});
  });
  nieblaFantasmas.forEach((f, id) => {
    const t = tokens.get(id);
    // Ya no existe o quedó oculto, o esa casilla se ve y no está ahí: se olvida.
    if(!t || t.oculto || (vista.has(nbPack(f.col, f.fila)) && !(t.col === f.col && t.fila === f.fila))) nieblaFantasmas.delete(id);
  });
  nieblaProgramarGuardado();
}

function nieblaProgramarGuardado(){
  if(!nieblaPendientes.size || nieblaTimer) return;
  nieblaTimer = setTimeout(async () => {
    nieblaTimer = null;
    const lista = [...nieblaPendientes].filter(k => !nieblaDescubierta.has(k));
    nieblaPendientes.clear();
    if(!lista.length || !nieblaActiva) return;
    lista.forEach(k => nieblaDescubierta.add(k));   // se ve enseguida; el snapshot lo confirma
    nieblaLog.push({seq: ++nieblaSeq, celdas: lista});
    if(nieblaLog.length > 40) nieblaLog.shift();
    pedirDibujo();
    try{
      await fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({descubiertas: firebase.firestore.FieldValue.arrayUnion(...lista)}, {merge: true});
    }catch(err){
      console.error('No se pudo guardar lo descubierto:', err);
      toast(err.code === 'permission-denied' ? 'No se pudo: faltan publicar las reglas nuevas de Firestore' : 'No se pudo guardar la niebla');
    }
  }, 400);
}

function escucharNiebla(){
  cortarNiebla = fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).onSnapshot(doc => {
    const d = doc.exists ? doc.data() : {};
    nieblaActiva = d.activa === true;
    luzEscena = Number.isFinite(d.luz) ? Math.max(LUZ_MIN, Math.min(LUZ_MAX, Math.round(d.luz))) : VISION_RADIO;
    const antes = nieblaDescubierta.size;
    nieblaDescubierta = new Set(Array.isArray(d.descubiertas) ? d.descubiertas.map(Number) : []);
    // Restablecer la niebla (todo lo descubierto se vacía): también desaparecen
    // las marcas de "última posición vista" de personajes y creeps, en todas las pantallas.
    if(antes > 0 && nieblaDescubierta.size === 0){
      nieblaFantasmas.clear();
      sigiloFantasmas.clear();
      sigiloUltimaVista.clear();
    }
    nieblaFirma = '';
    renderNiebla();
    pedirDibujo();
  }, err => console.error('Error escuchando la niebla:', err));
}

function renderNiebla(){
  const b = $('#btn-niebla'), j = $('#btn-niebla-jugador');
  $('#ojo-caja').hidden = !(soyGM && fbMiembro);   // el menú del ojo es del GM
  b.classList.toggle('primary', nieblaActiva);
  b.textContent = nieblaActiva ? '🌫 Niebla: sí' : '🌫 Niebla: no';
  b.title = nieblaActiva ? 'Apagar la niebla de guerra en este mapa' : 'Prender la niebla de guerra en este mapa';
  j.hidden = !nieblaActiva;   // solo tiene sentido con la niebla prendida
  j.classList.toggle('primary', nieblaComoJugador);
  j.title = nieblaComoJugador ? 'Volver a verlo todo' : 'Ver el mapa como lo ven los jugadores';
  $('#btn-ojo-menu').classList.toggle('activo', nieblaActiva || nieblaComoJugador || visionCreepsActiva);
  renderLuz();
  const vc = $('#btn-vision-creeps');
  vc.classList.toggle('primary', visionCreepsActiva);
  vc.title = visionCreepsActiva ? 'Volver a verlo todo (apagar la visión de los creeps)' : 'Ver lo que ven los creeps: una niebla semitransparente sobre lo que ningún creep alcanza a ver, y en naranja lo que verían si los objetos sólidos no les taparan la vista';
}
// Luz de la escena (GM): el radio de visión base de este mapa, guardado en el mismo doc de la niebla (`luz`).
function renderLuz(){
  const sel = $('#luz-preset'), num_ = $('#luz-num');
  if(!sel || !num_) return;
  sel.value = LUZ_PRESETS.some(p => p[0] === luzEscena) ? String(luzEscena) : '';
  if(document.activeElement !== num_) num_.value = luzEscena;
}
async function fijarLuz(v){
  if(!soyGM) return;
  v = Math.max(LUZ_MIN, Math.min(LUZ_MAX, Math.round(Number(v))));
  if(!Number.isFinite(v)) return;
  try{ await fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({luz: v, actualizado: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true}); }
  catch(err){ console.error('No se pudo cambiar la luz:', err); toast('No se pudo cambiar la luz de la escena'); }
}
$('#ojo-luz').addEventListener('click', e => e.stopPropagation());   // no cierra el menú al tocar la luz
$('#luz-preset').onchange = e => { if(e.target.value) fijarLuz(e.target.value); else $('#luz-num').focus(); };
$('#luz-num').onchange = e => fijarLuz(e.target.value);
$('#btn-niebla').onclick = async () => {
  if(!soyGM) return;
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({activa: !nieblaActiva, actualizado: firebase.firestore.FieldValue.serverTimestamp()}, {merge: true});
  }catch(err){ console.error('No se pudo cambiar la niebla:', err); toast('No se pudo cambiar la niebla'); }
};
// Menú del ojo (GM): se abre hacia abajo con el botón cuadrado; se cierra al elegir algo, al tocar afuera o con Esc.
function abrirMenuOjo(abrir){
  $('#ojo-menu').hidden = !abrir;
  $('#btn-ojo-menu').setAttribute('aria-expanded', abrir ? 'true' : 'false');
}
$('#btn-ojo-menu').onclick = () => abrirMenuOjo($('#ojo-menu').hidden);
$('#ojo-menu').addEventListener('click', e => { if(e.target.closest('button')) abrirMenuOjo(false); });
document.addEventListener('pointerdown', e => {
  if(!$('#ojo-menu').hidden && !e.target.closest('#ojo-caja')) abrirMenuOjo(false);
});
document.addEventListener('keydown', e => { if(e.key === 'Escape' && !$('#ojo-menu').hidden) abrirMenuOjo(false); });
$('#btn-niebla-reiniciar').onclick = () => nieblaReiniciar();
$('#btn-vision-creeps').onclick = () => {
  visionCreepsActiva = !visionCreepsActiva;
  try{ localStorage.setItem('vision-creeps', visionCreepsActiva ? '1' : ''); }catch(e){}
  renderNiebla(); pedirDibujo();
};

// Visión de los creeps (solo GM): lo que ve cada creep con el mismo cono de visión que los personajes (celdasVisionDe: radio y punto
// ciego, y los sólidos tapan la vista). `vistas` = casillas que algún creep alcanza a ver; `tapadas` = las que verían si no hubiera
// sólidos (y ahora no ven). Se recalcula solo si se mueve o gira un creep, o cambian los sólidos.
let visionCreepsCache = {firma: '', vistas: new Set(), tapadas: new Set()};
function visionCreepsCalcular(){
  const creeps = [...tokens.entries()].filter(([, t]) => t.tipo === 'creep');
  const firma = creeps.map(([id, t]) => `${id}:${t.col},${t.fila},${t.rotacion || 0}`).join('|') + '#' + solidosFirma();
  if(firma !== visionCreepsCache.firma){
    const vistas = new Set(), sinSolidos = new Set();
    creeps.forEach(([, t]) => {
      celdasVisionDe(t).forEach(k => vistas.add(k));
      celdasVisionDe(t, true).forEach(k => sinSolidos.add(k));
    });
    const tapadas = new Set();
    sinSolidos.forEach(k => { if(!vistas.has(k)) tapadas.add(k); });
    visionCreepsCache = {firma, vistas, tapadas};
  }
  return visionCreepsCache;
}
$('#btn-niebla-jugador').onclick = () => {
  nieblaComoJugador = !nieblaComoJugador;
  try{ localStorage.setItem('niebla-como-jugador', nieblaComoJugador ? '1' : ''); }catch(e){}
  renderNiebla(); pedirDibujo();
};

// GM: destapar o tapar a mano con un pincel (herramienta 🌫 de la caja de
// herramientas) y reiniciar todo lo descubierto.
let nieblaModo = 'destapar';   // 'destapar' | 'tapar'
let nieblaPincelRadio = 1;
let pincelNiebla = null;       // {celdas:Set} mientras se pinta
function nieblaPintar(px, py){
  const m = pantallaAMundo(px, py);
  const c0 = hexACubo(mundoAHex(m.x, m.y));
  const R = nieblaPincelRadio;
  for(let dq = -R; dq <= R; dq++){
    for(let dr = Math.max(-R, -dq - R); dr <= Math.min(R, -dq + R); dr++){
      const k = nbPack(cuboACol(c0.q + dq, c0.r + dr), cuboAFila(c0.q + dq, c0.r + dr));
      pincelNiebla.celdas.add(k);
      if(nieblaModo === 'destapar') nieblaDescubierta.add(k); else nieblaDescubierta.delete(k);
    }
  }
  pedirDibujo();
}
async function nieblaGuardarPincel(){
  const p = pincelNiebla;
  pincelNiebla = null;
  if(!p || !p.celdas.size) return;
  const F = firebase.firestore.FieldValue;
  const lista = [...p.celdas];
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({descubiertas: nieblaModo === 'destapar' ? F.arrayUnion(...lista) : F.arrayRemove(...lista)}, {merge: true});
  }catch(err){ console.error('No se pudo guardar el pincel de niebla:', err); toast('No se pudo guardar la niebla'); }
}
async function nieblaReiniciar(){
  if(!soyGM || !confirm('¿Volver a tapar todo lo descubierto de este mapa?')) return;
  try{
    await fbDb.doc(fbRutaCampana(rutaMapaEstado('niebla'))).set({descubiertas: []}, {merge: true});
  }catch(err){ console.error('No se pudo reiniciar la niebla:', err); toast('No se pudo reiniciar la niebla'); }
}

