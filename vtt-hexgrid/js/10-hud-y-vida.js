// js/10-hud-y-vida.js — tramo 10 de 14 del script de mapa.html (paso 5, nivel A: mismo código, en el mismo orden): HUD del token, vida y daño, rayo en cadena, creeps privados.
/* ---------- Controles flotantes del token (HUD) ----------
   Al seleccionar un token aparecen encima, como en Roll20: tres círculos
   con Vida (rojo), SP (azul) y No2 (verde) que se pueden editar con un
   clic, un botón de estados alterados, el engranaje (barras y aura) y el
   rayo (Botonera de la ficha o Acciones del creep). Todo se guarda donde
   corresponde: la ficha, el creep o el propio token. */

let hudGlobo = '';      // '' | 'estados' | 'ajustes'
let hudEditando = '';   // 'hp' | 'sp' | 'no2'
let hudNivel = 'vital'; // 'vital' (clic izquierdo: lo del combate) | 'resto' (clic derecho: lo demás)
function hudPonerNivel(n){
  if(hudNivel === n) return;
  hudNivel = n; hudGlobo = ''; hudEditando = '';
  pedirDibujo();
}

function hudCerrar(){
  hudGlobo = '';
  hudEditando = '';
}

// Valores que se muestran en los círculos.
function hudDatos(t){
  const v = vinculo(t);
  const r = (v && v.resumen) || {};
  const sc = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : null;
  const n = valoresNo2(t);
  const invocacion = !!(v && v.invocacion);
  const secreto = t.tipo === 'creep' && !soyGM;  // los jugadores no ven números de creeps
  const hp = secreto ? null : (t.tipo === 'creep' ? (sc ? num(sc.hp) : null) : num(r.hp));
  const {sp, spMax} = spDeResumen(r);
  const conSp = t.tipo === 'pj' && !invocacion && spMax > 0;
  return {
    hp, hpMax: t.tipo === 'creep' ? (sc ? num(sc.hpMax) : null) : num(r.hpMax),
    sp: conSp ? sp : null, spMax: conSp ? spMax : null,
    no2: secreto ? null : (n ? n.valor : null), no2Max: secreto ? null : (n ? n.max : null),
    def: t.tipo === 'creep' ? (sc ? creepDefensaMapa(sc) : null) : (r.def === undefined ? null : num(r.def)),
    estados: (v && v.resumen && v.resumen.estados) || [],
    notas: (v && v.notas) || '',
    armaNombre: (v && v.armaNombre) || '',
    armaNatural: !!(v && v.armaNatural),
    equipoNombres: (v && v.equipoNombres) || [],
  };
}

function hudHtml(t){
  const d = hudDatos(t);
  const puede = puedoCambiarVida(t);
  const circulo = (clave, valor, color) => {
    if(valor === null || valor === undefined) return '';
    if(hudEditando === clave && puede){
      return `<input class="hud-in" data-hud-in="${clave}" style="border-color:${color}" inputmode="decimal" placeholder="${fmt(valor)}" title="Escribí el valor, o +5 / -3, y apretá Enter">`;
    }
    return `<button type="button" class="hud-circulo" data-hud-valor="${clave}" style="border-color:${color}" ${puede ? '' : 'disabled'} title="${puede ? 'Clic para cambiar' : 'Solo lo cambia su dueño'}">${fmt(valor)}</button>`;
  };
  const icono = (clave, simbolo, titulo, activo) =>
    `<button type="button" class="hud-circulo icono${activo ? ' abierto' : ''}" data-hud-boton="${clave}" title="${titulo}">${simbolo}</button>`;

  const fichaDeToken = t.tipo === 'pj' && t.fichaId ? t.fichaId.split(SEP_INVOCACION)[0] : '';
  // Una invocación la maneja el mismo dueño que su personaje: mismo ⚡
  // (Botonera propia) que un PJ, ya no queda afuera.
  const propio = fichaDeToken && ((!soyGM && vinculo(t) && vinculo(t).duenoUid === fbUsuario.uid) || controloFicha(fichaDeToken));
  const conRayo = propio || (soyGM && t.tipo === 'creep' && t.fichaId && creepsPub.has(t.fichaId));

  // Con 🦶 Mover libre prendido el HUD se limpia: solo queda el pie, en rojo, para que
  // se note que el modo está activo (y el ↻ para girar, que no cuesta No2).
  const libreActivo = !!moverLibre && moverLibre === seleccion && puedoMoverLibre(t);
  if(libreActivo){
    return '<div class="hud-anillo">' +
      '<button type="button" class="hud-circulo icono abierto libre-activo" data-hud-boton="libre" title="Mover libre ACTIVO: tocá para apagarlo (M, Esc o clic derecho)">🦶</button>' +
      '</div><div class="hud-rotar" data-hud-rotar="1" title="Arrastrá para rotar el frente (la línea de color del marco). Girar no gasta No2">↻</div>';
  }
  // Los botones se acomodan en ronda alrededor del token (ver hudUbicar). Dos niveles (dueño, 2026-10-06): al seleccionarlo, lo inmediato
  // del combate (vida, SP, No2, estados, Botonera); con el ⋯, todo lo demás; el ↩ vuelve. (El clic derecho sigue siendo ping y cancelar.)
  if(hudNivel === 'resto') return '<div class="hud-anillo">' +
    (t.tipo === 'creep' ? icono('tarjeta', '🪪', 'Ver tarjeta: imagen, equipo y nota', hudGlobo === 'tarjeta') : '') +
    (fichaDeToken ? icono('ficha', '📜', 'Abrir la ficha en otra pestaña') : '') +
    (soyGM && t.tipo === 'creep' && t.fichaId && creepsPub.has(t.fichaId) ? icono('ficha', '📜', 'Ver la ficha del creep (la misma ventana «Ver» de GM Tools)') : '') +
    ((puedoMover(t) || soyGM) ? icono("ajustes", "⚙", "Barras, aura y edición del token", hudGlobo === "ajustes") : "") +
    (puedoMoverLibre(t) ? icono('libre', '🦶', 'Mover libre (atajo: M): llevarlo a otra casilla sin gastar No2 ni dejar estela', !!moverLibre && moverLibre === seleccion) : '') +
    (soyGM ? icono('oculto', t.oculto ? '🙈' : '👁', t.oculto ? 'Oculto: mostrarlo a los jugadores' : 'Ocultarlo (armarlo antes de que entre en la partida)', t.oculto) : '') +
    (propio && !t.fichaId.includes(SEP_INVOCACION) ? icono('equipo', '🛡', 'Equipo y mochila: ver lo que llevás puesto y cambiarlo') : '') +
    '<button type="button" class="hud-circulo icono hud-nivel" data-hud-nivel="vital" title="Volver a lo del combate: vida, SP, No2, estados y Botonera">↩</button>' +
    '</div>' +
    (puedoMoverLibre(t) ? '<div class="hud-rotar" data-hud-rotar="1" title="Arrastrá para rotar el frente (la línea de color del marco). Girar no gasta No2">↻</div>' : '') +
    (hudGlobo === 'tarjeta' && t.tipo === 'creep' ? '<div class="hud-globos">' + hudTarjetaHtml(t, d) + '</div>'
      : hudGlobo === 'ajustes' && (puedoMover(t) || soyGM) ? '<div class="hud-globos">' + hudAjustesHtml(t, d) + '</div>' : '');
  let html = '<div class="hud-anillo">' +
    circulo('hp', d.hp, HP_COLOR) + circulo('sp', d.sp, SP_COLOR) + circulo('no2', d.no2, NO2_COLOR) +
    icono('estados', '◎', 'Estados alterados', hudGlobo === 'estados') +
    (conRayo ? icono('rayo', '⚡', propio ? 'Abrir la Botonera (atajo: B, la de tu personaje principal)' : 'Abrir las Acciones del creep') : '') +
    '<button type="button" class="hud-circulo icono hud-nivel" data-hud-nivel="resto" title="Más: ficha, tarjeta, ajustes, mover libre, equipo…">⋯</button>' +
    '</div>' +
    (puedoMoverLibre(t) ? '<div class="hud-rotar" data-hud-rotar="1" title="Arrastrá para rotar el frente (la línea de color del marco). Girar no gasta No2">↻</div>' : '');
  let globo = '';
  if(hudGlobo === 'estados') globo = hudEstadosHtml(t, d.estados, puedoCambiarEstados(t));
  if(hudGlobo === 'hp' && puede) globo = hudHpHtml(t, d);
  return html + (globo ? '<div class="hud-globos">' + globo + '</div>' : '');
}

/* ---------- Vida desde el círculo rojo: recibir daño o cambiar HP directo ----------
   Un clic en el círculo rojo abre un mini menú con dos opciones que se
   cambian ahí mismo: 1) "Recibe daño" (por defecto): se escribe el daño del
   golpe y se le resta la Defensa; 2) "HP directo": el número de siempre
   (valor, +5, -3) sin tener en cuenta la Defensa. */
let hpRayo = false;   // ⚡ Rayo en cadena en "Recibe daño" (P118): daño directo y salta a los rivales cercanos
let hpCritMult = 1;   // multiplicador de crítico de "Recibe daño" (1 = sin crítico; 2 doble daño, 3 triple, 4 cuádruple). Un crítico multiplica TODO el daño y NO resta la Defensa (Comun/critico.js).
let hpModo = 'danio';   // 'danio' | 'directo' (vuelve a 'danio' cada vez que se abre)

function creepDefensaMapa(sc){ return CreepCalculo.defensaEfectiva(sc); }   // comun/creep-calculo.js

// Defensa especial (Paso 3 de las reglas de casteo, docs/reglas-casteo.md):
// stat general y fijo, sin atributo (base a mano, sc.armadmg, 0 por
// defecto). A diferencia de Defensa, sus bonos de equipo NO se hornean en
// la base al equipar (gm-tools los deja en it.mods): se suman acá en vivo,
// igual que gm-tools.html (creepModTotal). Se resta al daño de casteo que
// ignora la Defensa (mismo lugar donde antes se usaba 0 a secas).
function creepArmadmgMapa(sc){ return CreepCalculo.armadmgEfectiva(sc); }

// Golpe − Defensa, con Invulnerable y Escudo mágico (mismas reglas que gm-tools
// con los creeps). Modifica el escudo de `efectos`: pasar una copia para solo mirar.
function resolverGolpe(golpe, defensa, efectos){
  const activos = (efectos || []).filter(e => e && e.activo !== false);
  if(activos.some(e => e.invulnerable)) return {recibido: 0, invulnerable: true, defensa, absorbido: 0};
  let recibido = Math.max(0, golpe - defensa);
  let absorbido = 0;
  const ab = Combatiente.absorberPct(activos, recibido);   // Armadura arcana: se queda con el 50 % de lo que llega, hasta 10 (2026-10-10)
  recibido = ab.recibido; absorbido += ab.tomado;
  const capas = activos.filter(e => (e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) && num(e.escudoMagicoActual ?? e.escudoMagico) > 0)
    .sort((a, b) => (a.excedenteVida ? 1 : 0) - (b.excedenteVida ? 1 : 0));   // primero los escudos, al final la vida extra
  capas.forEach(c => {
    if(recibido <= 0) return;
    const actual = num(c.escudoMagicoActual ?? c.escudoMagico), tomado = Math.min(recibido, actual);
    c.escudoMagicoActual = actual - tomado;
    if(c.excedenteVida) c.escudoMagico = c.escudoMagicoActual;   // valor neto: no hay máximo
    absorbido += tomado; recibido -= tomado;
  });
  return {recibido, absorbido, defensa, ...(ab.tomado ? {arcano: ab.tomado} : {})};
}

function leerGolpe(texto){
  const crudo = String(texto || '').trim().replace(',', '.');
  return /^\d+(?:\.\d+)?$/.test(crudo) ? parseFloat(crudo) : null;
}

function golpeTexto(nombre, golpe, r, previo, nuevo){
  const extra = [];
  if(r.arcano) extra.push(`la Armadura arcana absorbió ${fmt(r.arcano)}`);
  if(num(r.absorbido) - num(r.arcano) > 0) extra.push(`Vida extra absorbió ${fmt(num(r.absorbido) - num(r.arcano))}`);
  const suf = extra.length ? ` · ${extra.join(' · ')}` : '';
  if(r.invulnerable) return `${nombre}: Invulnerable, el golpe de ${fmt(golpe)} no hizo nada`;
  if(r.recibido <= 0 && !r.absorbido) return `${nombre}: golpe de ${fmt(golpe)} · Defensa ${fmt(r.defensa)} lo frenó entero`;
  return `${nombre}: ${fmt(golpe)} − Defensa ${fmt(r.defensa)} → ${fmt(r.recibido)} de daño (${fmt(previo)} → ${fmt(nuevo)} HP)${suf}`;
}

// ignoraDef: daño directo (un crítico, una trampa que ignora la Defensa, casteo…):
// no se le resta la Defensa. restaIgnorando (opcional, Paso 3 del casteo): en vez
// de nada, se le resta ESTO (la Defensa especial) — solo lo usa el daño de casteo
// que ignora la Defensa (dueloAplicarDano); todo lo demás (críticos, trampas,
// fuego, Rayo en cadena) sigue ignorando la Defensa entera, sin cambios.
// restaExtra (2026-10-04): lo que se resta además (la resistencia al elemento del daño), con o sin Defensa.
/* La Defensa extra de una pieza (torso blando, 2026-10-06): contra el primer golpe que recibe en el turno (`defprimer`; la marca vive en lo que vacía
   el Mantenimiento) y contra armas a distancia (`defdist`, con `o.distancia`). Solo cuando la Defensa cuenta (no en un crítico ni en lo que la ignora). */
/* La Coraza del guardián (2026-10-06, dueño: automática): un aliado AL LADO (a 1 casillero, del mismo bando: creeps con creeps; personajes e
   invocaciones entre sí) con `guardian` le suma esa Defensa a quien recibe el golpe, solo cuando la Defensa cuenta. No se acumulan: vale el mayor.
   Cada vez que entra, la Crónica lo cuenta a todos y a quien maneja al protegido le aparece un aviso chico (momento con `datos.chico`). */
function guardianValor(x){
  if(!x || !x.fichaId) return 0;
  if(x.tipo === 'creep'){ const sc = creepPrivadoDe(x.fichaId); return sc ? Math.max(0, num(CreepCalculo.modTotal(sc, 'guardian'))) : 0; }
  const ri = resumenDeInv(x);
  if(ri) return Math.max(0, num(ri.guardian));
  const f = fichasPub.get(x.fichaId);
  return Math.max(0, num(f && f.resumen && f.resumen.guardian));
}
function guardianDe(t){
  if(!t || t.col === undefined || t.fila === undefined) return null;
  const bando = x => x.tipo === 'creep' ? 'creep' : 'pj';
  let mejor = null;
  tokens.forEach(x => {
    if(!x || x === t || !x.fichaId || x.fichaId === t.fichaId || bando(x) !== bando(t) || x.col === undefined) return;
    if(distanciaHex({col: t.col, fila: t.fila}, {col: x.col, fila: x.fila}) > 1) return;
    const val = guardianValor(x);
    if(val > 0 && (!mejor || val > mejor.val)) mejor = {val, nombre: nombreDe(x)};
  });
  return mejor;
}
function guardianAviso(t, g){
  if(!g || typeof momentoAbrir !== 'function') return;
  const nom = nombreDe(t);
  momentoAbrir({tipo: 'guardian', icono: '🛡', titulo: `${g.nombre} protege a ${nom}`, resultado: `+${g.val} Defensa contra el golpe, por estar al lado de su guardián.`,
    estado: 'listo', datos: {...(t.tipo !== 'creep' && t.duenoUid ? {paraUid: t.duenoUid} : {}), chico: true, aviso: true}});
}
const defExtra = (ignoraDef, primero, valor, o) => ignoraDef ? 0 : (primero ? Math.max(0, num(valor('defprimer'))) : 0) + (o && o.distancia ? Math.max(0, num(valor('defdist'))) : 0);
async function danioCreep(t, texto, ignoraDef, restaIgnorando, restaExtra, o){
  const golpe = leerGolpe(texto);
  if(golpe === null) throw new Error(ERROR_TIPEO);
  const guarda = ignoraDef ? null : guardianDe(t);   // la Coraza del guardián de un aliado al lado
  const muro = ignoraDef ? null : muroDe(t);   // Muro de escudos (js/26): un aliado con escudo al lado
  const res = await modificarCreep(t.fichaId, sc => {
    const primero = !num((sc.usosEspecial || {})._golpe);
    sc.usosEspecial = {...(sc.usosEspecial || {}), _golpe: 1};   // (se vacía en su Mantenimiento)
    const extra = defExtra(ignoraDef, primero, st => CreepCalculo.modTotal(sc, st), o) + (guarda ? guarda.val : 0) + (muro ? muro.val : 0);
    const r = resolverGolpe(golpe, (ignoraDef ? num(restaIgnorando || 0) : creepDefensaMapa(sc) + extra) + num(restaExtra || 0), sc.estados);
    const previo = num(sc.hp);
    sc.hp = Math.max(0, previo - r.recibido);
    return {r, previo, nuevo: sc.hp};
  });
  toast(golpeTexto(nombreDe(t), golpe, res.r, res.previo, res.nuevo));
  if(guarda && golpe > 0) guardianAviso(t, guarda);
  if(muro && golpe > 0) muroAviso(t, muro);
  await cosechaSiMuere(t, res);
  return res;
}

/* La cosecha (2026-10-07, Varita de la cosecha): si alguien cae con la marca «Cosecha de X», X recupera 2 SP y 2 de vida (un creep, solo la
   vida: no usa SP). Lo hace el mapa del GM, como el resto del daño. */
async function cosechaSiMuere(t, res){
  try{
    if(!soyGM || !res || !(num(res.previo) > 0) || num(res.nuevo) > 0) return;
    const marca = (((vinculo(t) || {}).resumen || {}).estados || []).find(e => e && e.activo !== false && /^Cosecha de /.test(String(e.nombre || '')));
    if(!marca) return;
    const quien = String(marca.nombre).replace(/^Cosecha de /, '').trim();
    const ct = [...tokens.values()].find(x => x.fichaId && nombreDe(x) === quien);
    if(!ct){ mesaLinea(`🌾 Cosecha: ${nombreDe(t)} cayó marcado; ${quien} recupera 2 SP y 2 de vida (a mano: su token no está en el mapa)`); return; }
    const esInv = ct.tipo === 'pj' && String(ct.fichaId).includes(SEP_INVOCACION);
    const rc = esInv ? await dueloCurarInv(ct, 2) : await dueloCurar(ct, 2);
    const vida = Math.max(0, num(rc && rc.nuevo) - num(rc && rc.previo));
    let sp = '';
    if(ct.tipo === 'pj' && !esInv){
      const base = fbDb.doc(fbRutaCampana(`fichas/${ct.fichaId}`)), parteRef = base.collection('partes').doc('general');
      const vuelve = await fbDb.runTransaction(async tx => {
        const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
        if(!parte.exists || !ficha.exists) return 0;
        const datos = JSON.parse(parte.data().json || '{}'), rs = ficha.data().resumen || {};
        const n = Math.min(2, Math.max(0, num(datos.spGastado)));
        if(!n) return 0;
        datos.spGastado = num(datos.spGastado) - n;
        tx.set(parteRef, {json: JSON.stringify(datos), actualizado: firebase.firestore.FieldValue.serverTimestamp()});
        tx.update(base, {'resumen.sp': num(rs.sp) + n});
        return n;
      });
      sp = vuelve ? `${vida ? ' y' : ''} ${vuelve} SP` : '';
    }
    mesaLinea(`🌾 Cosecha: ${nombreDe(t)} cayó marcado; ${quien} recupera ${vida ? vida + ' de vida' : ''}${sp}${!vida && !sp ? 'nada (ya estaba lleno)' : ''}`);
  }catch(err){ console.error('No se pudo aplicar la cosecha:', err); }
}

async function danioPj(t, texto, ignoraDef, restaIgnorando, restaExtra, o){
  const golpe = leerGolpe(texto);
  if(golpe === null) throw new Error(ERROR_TIPEO);
  const guarda = ignoraDef ? null : guardianDe(t);   // la Coraza del guardián de un aliado al lado
  const muro = ignoraDef ? null : muroDe(t);   // Muro de escudos (js/26): un aliado con escudo al lado
  const base = fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}`));
  const parteRef = base.collection('partes').doc('general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  const res = await fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const rs = ficha.data().resumen || {};
    if(rs.def === undefined) throw new Error('SIN_DEF');
    const primero = !num((datos.ataquesArma || {})._golpe);
    datos.ataquesArma = {...(datos.ataquesArma || {}), _golpe: 1};   // (el Mantenimiento la vacía)
    const extra = defExtra(ignoraDef, primero, st => rs[st], o) + (guarda ? guarda.val : 0) + (muro ? muro.val : 0);
    const r = resolverGolpe(golpe, (ignoraDef ? num(restaIgnorando || 0) : num(rs.def) + extra) + num(restaExtra || 0), datos.efectos);
    const previo = num(datos.hp);
    datos.hp = Math.max(0, previo - r.recibido);
    // Orbe de absorción (js/26): el daño mágico o elemental que llegó a la vida devuelve SP, una vez por turno.
    let absorbe = 0;
    if(o && o.magico && r.recibido > 0 && num(rs.orbeAbsorcion) > 0 && !num(datos.ataquesArma._absorbe)){
      absorbe = Math.min(num(rs.orbeAbsorcion), Math.max(0, num(datos.spGastado)));
      datos.ataquesArma._absorbe = 1;
      datos.spGastado = num(datos.spGastado) - absorbe;
    }
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.hp': datos.hp, ...(absorbe ? {'resumen.sp': num(rs.sp) + absorbe} : {})});
    return {r, previo, nuevo: datos.hp, absorbe};
  });
  toast(golpeTexto(nombreDe(t), golpe, res.r, res.previo, res.nuevo));
  if(guarda && golpe > 0) guardianAviso(t, guarda);
  if(muro && golpe > 0) muroAviso(t, muro);
  if(res.absorbe) mesaLinea(`🔮 Orbe de absorción: ${nombreDe(t)} recupera ${res.absorbe} SP del daño mágico`);
  await cosechaSiMuere(t, res);
  return res;
}

/* Paso 4, etapa 4e (2026-10-01): el daño que recibe una INVOCACIÓN (token «fichaId~invId») — antes el duelo lo dejaba a mano.
   Su Defensa sale de sus datos con la misma regla que la ficha (comun/inv-calculo.js) y se escribe en la parte `invocaciones` del
   personaje con una transacción, como la vida desde el token (cambiarVidaPj): HP, escudos que absorbieron y el resumen público. */
async function invDeToken(t){
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const parte = await fbDb.doc(fbRutaCampana(`fichas/${fichaId}/partes/invocaciones`)).get();
  if(!parte.exists) return null;
  return (JSON.parse(parte.data().json || '{}').invocaciones || []).find(i => i && i.id === invId) || null;
}
const defensasDeInv = inv => { const x = InvCalculo.migrar(structuredClone(inv)); return {def: InvCalculo.defensaEfectiva(x), armadmg: Math.max(0, num(InvCalculo.statValor(x, 'armadmg')))}; };
async function danioInv(t, texto, ignoraDef, restaIgnorando, restaExtra, o){
  const golpe = leerGolpe(texto);
  if(golpe === null) throw new Error(ERROR_TIPEO);
  const guarda = ignoraDef ? null : guardianDe(t);   // la Coraza del guardián de un aliado al lado
  const muro = ignoraDef ? null : muroDe(t);   // Muro de escudos (js/26): un aliado con escudo al lado
  const [fichaId, invId] = String(t.fichaId).split(SEP_INVOCACION);
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const parteRef = base.collection('partes').doc('invocaciones');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  const res = await fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const inv = (datos.invocaciones || []).find(i => i && i.id === invId);
    if(!inv) throw new Error('La invocación ya no existe');
    if(!Array.isArray(inv.estados)) inv.estados = [];
    const primero = !num(inv.golpeTurno);
    inv.golpeTurno = 1;   // (el Mantenimiento la vacía)
    const extra = defExtra(ignoraDef, primero, st => FichaResumen.invModTotal(inv, st), o) + (guarda ? guarda.val : 0) + (muro ? muro.val : 0);
    const r = resolverGolpe(golpe, (ignoraDef ? num(restaIgnorando || 0) : defensasDeInv(inv).def + extra) + num(restaExtra || 0), inv.estados);
    const previo = num(inv.hp);
    inv.hp = Math.max(0, previo - r.recibido);
    const rs = ficha.data().resumen || {};
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.invocaciones': (rs.invocaciones || []).map(i => i.id === invId ? {...i, hp: inv.hp} : i)});
    return {r, previo, nuevo: inv.hp};
  });
  toast(golpeTexto(nombreDe(t), golpe, res.r, res.previo, res.nuevo));
  if(guarda && golpe > 0) guardianAviso(t, guarda);
  if(muro && golpe > 0) muroAviso(t, muro);
  await cosechaSiMuere(t, res);
  return res;
}

/* La resistencia de un token a un elemento y su Defensa especial (2026-10-04), para restarlas al daño mágico o elemental: personaje (su resumen),
   creep (su parte privada, solo el GM), invocación (sus datos). → {res, armadmg}; con `inv` ya leída, sin volver a leerla. */
async function resistenciasDe(t, el, inv){
  if(!t) return {res: 0, armadmg: 0};
  if(t.tipo === 'creep'){ const sc = creepPrivadoDe(t.fichaId); return {res: sc && el ? CreepCalculo.resElemental(sc, el) : 0, armadmg: sc ? creepArmadmgMapa(sc) : 0}; }
  if(String(t.fichaId || '').includes(SEP_INVOCACION)){
    try{
      await bnCargarPiezas();
      const i = inv || await invDeToken(t);
      if(!i) return {res: 0, armadmg: 0};
      const x = InvCalculo.migrar(structuredClone(i));
      return {res: el ? num(InvCalculo.statValor(x, 'res' + el)) : 0, armadmg: Math.max(0, num(InvCalculo.statValor(x, 'armadmg')))};
    }catch(err){ return {res: 0, armadmg: 0}; }
  }
  const f = fichasPub.get(t.fichaId), r = (f && f.resumen) || {};
  return {res: el ? num(r['res' + el]) : 0, armadmg: Math.max(0, num(r.armadmg))};   // negativa = vulnerable (2026-10-06)
}

function hudHpHtml(t, d){
  const danio = hpModo === 'danio';
  const def = d.def === null || d.def === undefined ? null : d.def;
  return `<div class="hud-globo hud-hp">
    <h3>Vida · ${esc(nombreDe(t))}</h3>
    <div class="hud-hp-modos">
      <button type="button" class="hud-mini${danio ? ' activo' : ''}" data-hud-hpmodo="danio">1 · Recibe daño</button>
      <button type="button" class="hud-mini${danio ? '' : ' activo'}" data-hud-hpmodo="directo">2 · HP directo</button>
    </div>
    <div class="hud-hp-expl">${danio
      ? (def === null
        ? 'No conozco su Defensa todavía (la ficha la publica al guardarse). Usá <b>2 · HP directo</b>.'
        : hpRayo ? '<b>⚡ Relámpago</b>: daño eléctrico <b>directo a la vida</b> (no se resta la Defensa) y <b>salta</b> a otros del mismo bando hasta 3 casillas de distancia, una vez por objetivo, con la mitad del daño en cada salto (hacia abajo: con 1 ya no salta).'
        : hpCritMult > 1 ? `<b>Crítico (×${hpCritMult})</b>: el daño se multiplica y <b>NO se resta la Defensa</b> (${fmt(def)}); lo que pasa baja su HP.`
        : `Escribí el <b>daño del golpe</b>. Se le resta la Defensa (<b>${fmt(def)}</b>) y lo que pasa baja su HP.`)
      : 'Cambia el HP <b>sin tener en cuenta la Defensa</b>. Un número lo fija; +5 cura y −3 baja directo.'}</div>
    ${danio ? `<div class="hud-crit-fila" title="Si el golpe fue crítico, elegí el multiplicador que dio el d20: el daño se multiplica y NO se resta la Defensa">
      ${[[1, 'Normal', 'Sin crítico'], [2, '×2', 'Doble daño'], [3, '×3', 'Triple daño'], [4, '×4', 'Cuádruple daño']].map(([k, r, t2]) => `<button type="button" class="hud-mini${hpCritMult === k ? ' activo' : ''}" data-hud-critmult="${k}" title="${t2}">${r}</button>`).join('')}
      ${typeof Critico !== 'undefined' ? '<button type="button" class="hud-mini calc" data-hud-critcalc="1" title="Calculadora de crítico: PdG, Evasión, d20…">🎯</button>' : ''}
    </div>` : ''}
    ${danio ? `<div class="hud-crit-fila"><button type="button" class="hud-mini${hpRayo ? ' activo' : ''}" data-hud-rayo="1" title="Relámpago: daño eléctrico directo a la vida (no se resta la Defensa) que salta a otros del mismo bando hasta 3 casillas de distancia, una sola vez por objetivo, con la mitad del daño en cada salto (redondeado hacia arriba)">⚡ Relámpago en cadena</button></div>` : ''}
    <input class="hud-hp-in" data-hud-hp-in inputmode="decimal" autocomplete="off" placeholder="${danio ? 'daño del golpe' : 'valor, +5 o −3'}">
    <div class="hud-hp-prev" data-hud-hp-prev></div>
    <div class="hud-hp-pie">Enter aplica · Esc cierra</div>
  </div>`;
}

// Lo que va a pasar, en vivo mientras se escribe (sin tocar nada todavía).
function hudHpPrevia(t, d, texto){
  const crudo = String(texto || '').trim();
  if(!crudo) return '';
  const hp = num(d.hp);
  if(hpModo === 'directo'){
    const nuevo = leerValorVital(crudo, hp);
    if(nuevo === null) return 'Escribí un número, o +5 / −3';
    const tope = num(d.hpMax) > 0 ? Math.min(num(d.hpMax), nuevo) : nuevo;
    return `HP ${fmt(hp)} → ${fmt(Math.max(0, tope))}`;
  }
  if(/^[+\-−]/.test(crudo)) return 'Para curar o ajustar sin Defensa, usá 2 · HP directo';
  const golpe = leerGolpe(crudo);
  if(golpe === null) return 'Escribí el daño del golpe (un número)';
  if(d.def === null || d.def === undefined) return '—';
  const sc = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : null;
  if(hpRayo){   // rayo: directo a la vida + cadena
    const sc0 = t.tipo === 'creep' ? creepPrivadoDe(t.fichaId) : null;
    const r0 = resolverGolpe(golpe, 0, sc0 ? structuredClone(sc0.estados || []) : []);
    if(r0.invulnerable) return 'Invulnerable: no recibe daño';
    const cad = rayoCadena(seleccion, golpe);
    return `⚡ ${fmt(golpe)} directo → HP ${fmt(hp)} → ${fmt(Math.max(0, hp - r0.recibido))}` + (cad.length > 1 ? ` · salta a ${cad.slice(1).map(c => `${nombreDe(c.t)} ${c.dano}`).join(' → ')}` : ' · no hay a quién saltar');
  }
  if(hpCritMult > 1){   // crítico: todo el daño × multiplicador, sin restar la Defensa
    const total = golpe * hpCritMult;
    const rc = resolverGolpe(total, 0, sc ? structuredClone(sc.estados || []) : []);
    if(rc.invulnerable) return 'Invulnerable: no recibe daño';
    return `${fmt(golpe)} × ${hpCritMult} = ${fmt(total)} (ignora la Defensa)${rc.absorbido ? ` (escudo −${fmt(rc.absorbido)})` : ''} → HP ${fmt(hp)} → ${fmt(Math.max(0, hp - rc.recibido))}`;
  }
  const r = resolverGolpe(golpe, num(d.def), sc ? structuredClone(sc.estados || []) : []);
  if(r.invulnerable) return 'Invulnerable: no recibe daño';
  const nuevo = Math.max(0, hp - r.recibido);
  return `${fmt(golpe)} − Def ${fmt(num(d.def))} = ${fmt(Math.max(0, golpe - num(d.def)))}${r.absorbido ? ` (escudo −${fmt(r.absorbido)})` : ''} → HP ${fmt(hp)} → ${fmt(nuevo)}`;
}

/* ---------- Rayo en cadena (2026-09-25, regla del dueño, P118) ----------
   El rayo salta a otros personajes: hasta 3 casillas de distancia del último golpeado, UNA sola vez por objetivo, y cada salto hace la MITAD del
   daño del anterior, redondeada hacia abajo (dueño, 2026-10-07: «salta tantas veces como le permita el número»: 8 → 4 → 2 → 1; el salto que
   llega con 1 es el último). Salta a los del mismo bando que el primer golpeado (los rivales de quien lanza el rayo: si golpeó a un
   creep, salta a creeps; si a un personaje, a personajes) y siempre al más cercano. Daño mágico: directo a la vida. */
const RAYO_SALTO_MAX = 3;
function rayoCadena(idInicial, dano){
  const t0 = tokens.get(idInicial);
  if(!t0) return [];
  const cadena = [{id: idInicial, t: t0, dano: Math.max(0, Math.ceil(num(dano)))}];
  const usados = new Set([idInicial]);
  let actual = t0, d = cadena[0].dano;
  for(let i = 0; i < 12; i++){
    let mejor = null, mejorDist = Infinity;
    tokens.forEach((x, id) => {
      if(usados.has(id) || x.tipo !== t0.tipo || !x.fichaId || (x.oculto && !soyGM)) return;
      const dist = distanciaHex({col: actual.col, fila: actual.fila}, {col: x.col, fila: x.fila});
      if(dist <= RAYO_SALTO_MAX && dist < mejorDist){ mejor = {id, x}; mejorDist = dist; }
    });
    if(!mejor || d <= 1) break;
    d = Math.floor(d / 2);
    usados.add(mejor.id);
    cadena.push({id: mejor.id, t: mejor.x, dano: d});
    actual = mejor.x;
  }
  return cadena;
}
// Aplica los saltos que este cliente puede (el GM, todos; un jugador, los suyos) y avisa en la Mesa lo demás para hacerlo a mano.
async function rayoCadenaAplicar(cadena){
  const saltos = cadena.slice(1);
  if(!saltos.length) return;
  const hechos = [], manual = [];
  for(const s of saltos){
    const nombre = s.t.oculto ? 'Alguien' : nombreDe(s.t);
    let ok = false;
    try{
      if(s.t.tipo === 'creep' && s.t.fichaId && soyGM){ await danioCreep(s.t, String(s.dano), true, 0, 0, {magico: true}); ok = true; }
      // Personajes e invocaciones: el GM también (como el daño del duelo, que su mapa aplica a cualquiera); antes solo los propios (2026-10-05).
      else if(s.t.tipo === 'pj' && s.t.fichaId && (soyGM || puedoMover(s.t))){
        if(String(s.t.fichaId).includes(SEP_INVOCACION)) await danioInv(s.t, String(s.dano), true, 0, 0, {magico: true}); else await danioPj(s.t, String(s.dano), true, 0, 0, {magico: true});
        ok = true;
      }
    }catch(err){ console.error('No se pudo aplicar el salto del rayo:', err); }
    (ok ? hechos : manual).push(`${nombre}: ${s.dano}`);
  }
  alertaRojaAnonima('⚡ Relámpago en cadena', `Saltó a ${saltos.length} más (la mitad del daño en cada salto, redondeada hacia abajo). ${hechos.length ? 'Aplicado solo: ' + hechos.join(' · ') + '. ' : ''}${manual.length ? 'Aplicalo a mano: ' + manual.join(' · ') + ' (directo a la vida).' : ''}`);
}

async function hudHpAplicar(t, texto){
  if(!String(texto).trim()) return;
  try{
    if(hpModo === 'directo'){
      hudGlobo = '';
      await hudAplicar('hp', texto);
      return;
    }
    if(/^[+\-−]/.test(String(texto).trim())){ toast('Para curar o ajustar sin Defensa, usá 2 · HP directo'); return; }
    const idTok = seleccion, antes = vitalActual(t, 'hp');
    const golpe = leerGolpe(texto);
    const crit = hpCritMult > 1 && golpe !== null;   // crítico: daño × multiplicador y directo (sin Defensa)
    const txtDanio = crit ? String(golpe * hpCritMult) : texto;
    const directo = crit || (hpRayo && golpe !== null);   // el rayo también va directo a la vida
    if(t.tipo === 'creep') await danioCreep(t, txtDanio, directo); else await danioPj(t, txtDanio, directo);
    if(hpRayo && golpe !== null) rayoCadenaAplicar(rayoCadena(idTok, golpe));   // salta a los cercanos (no espera: se avisa en la Mesa)
    vitalRegistrar(idTok, 'hp', antes);   // (Ctrl+Z devuelve el HP; un escudo que absorbió el golpe no se recarga)
    hudGlobo = '';
  }catch(err){
    console.error('No se pudo aplicar el daño:', err);
    toast(err.message === ERROR_TIPEO ? 'Escribí el daño del golpe (un número)'
      : err.message === 'SIN_DEF' ? 'Su ficha todavía no publicó la Defensa: usá 2 · HP directo'
      : err.code === 'permission-denied' ? 'No podés cambiar eso' : 'No se pudo aplicar: ' + err.message);
  }finally{
    pedirDibujo();
  }
}

function hudEstadosHtml(t, estados, puede){
  // El + abre el selector de estados de la ficha (o de gm-tools en creeps),
  // dentro del mapa, con sus presets y su mecánica.
  const agregar = puede && puedeAgregarEstado(t)
    ? '<div class="hud-globo-acciones"><button type="button" class="hud-mini" data-hud-estado-nuevo="1">+ Estado</button></div>' : '';
  if(!estados.length) return '<div class="hud-globo"><h3>Estados alterados</h3><span style="color:var(--muted)">Ninguno activo.</span>' + agregar + '</div>';
  return '<div class="hud-globo"><h3>Estados alterados</h3>' + estados.map((e, i) => {
    const turnos = e.permanente ? "∞" : (num(e.turnos) ? fmt(num(e.turnos)) + "t" : "—");
    const det = String(e.detalle || "").trim();
    return `<div class="hud-estado">
      <span style="width:9px;height:9px;border-radius:50%;background:${ESTADO_COLOR[e.polaridad] || ESTADO_COLOR['']};flex:none"></span>
      <span class="nom${det ? " con-tip" : ""}" tabindex="${det ? 0 : -1}" title="${esc(det || e.nombre)}">${esc(e.nombre)}</span>
      ${det ? `<span class="estado-tip"><b>${esc(e.nombre)}</b>${esc(det)}</span>` : ""}
      <span class="turnos">${turnos}</span>` +
      (e.armaduraRota && (puede || t.tipo !== 'creep')
        ? (puede && !e.derivado
          ? `<button type="button" class="hud-mini" data-hud-armrota="${i}:-1" title="Un punto menos de armadura rota (al llegar a 0, se repara)">−</button><button type="button" class="hud-mini" data-hud-armrota="${i}:set" title="Escribir cuántos puntos de armadura rota (número, +N, -N; 0 la repara)">×${fmt(num(e.stacks) || 1)}</button><button type="button" class="hud-mini" data-hud-armrota="${i}:1" title="Un punto más de armadura rota">+</button>`
          : `<span class="turnos" title="Puntos de armadura rota">×${fmt(num(e.stacks) || 1)}</span>`) : '') +
      (e.escudo !== undefined && (puede || t.tipo !== 'creep')
        ? (puede && !e.derivado
          ? `<button type="button" class="hud-mini" data-hud-escudo="${i}:-1" title="Un punto menos">−</button><button type="button" class="hud-mini" data-hud-escudo="${i}:set" title="Escribir el valor (número, +N, -N${e.excedente ? '' : '; «max N» cambia el máximo'})">${e.excedente ? '❤+' + fmt(num(e.escudo)) + (e.tope ? '/' + fmt(num(e.tope)) : '') : '🛡' + fmt(num(e.escudo)) + '/' + fmt(num(e.escudoMax))}</button><button type="button" class="hud-mini" data-hud-escudo="${i}:1" title="Uno más">+</button>`
          : `<span class="turnos" title="${e.excedente ? 'Vida extra' : 'Escudo actual / máximo'}">${e.excedente ? '❤+' + fmt(num(e.escudo)) + (e.tope ? '/' + fmt(num(e.tope)) : '') : '🛡' + fmt(num(e.escudo)) + '/' + fmt(num(e.escudoMax))}</span>`) : '') +
      (puede && !e.permanente && !e.derivado ? `<button type="button" class="hud-mini" data-hud-turnos="${i}:-1" title="Un turno menos">−</button>
        <button type="button" class="hud-mini" data-hud-turnos="${i}:1" title="Un turno más">+</button>` : '') +
      (puede && !e.derivado ? `<button type="button" class="hud-mini peligro" data-hud-quitar="${i}" title="Sacar este estado">✕</button>` : '') +
      (puede && !e.derivado && puedeAgregarEstado(t) ? `<button type="button" class="hud-mini" data-hud-estado-editar="${i}" title="Editar este estado">⚙</button>` : '') +
      (e.derivado ? '<span title="Viene de una pasiva: se saca quitando la pasiva" style="color:var(--muted)">✦</span>' : '') +
    '</div>';
  }).join('') + agregar + '</div>';
}

// Tarjeta del creep (🪪): imagen más grande, equipo (solo nombres, sin
// def/mods/detalle) y la nota narrativa, para que cualquier jugador la
// abra desde el token sin tener que preguntarle al GM. Todo de solo
// lectura — para editar sigue siendo GM Tools.
function hudTarjetaHtml(t, d){
  const v = vinculo(t);
  const mini = v && (v.tarjeta || v.miniatura);   // la tarjeta usa una imagen más grande (400 px) si el GM ya la publicó
  const img = mini
    ? `<img src="${esc(mini)}" alt="" style="width:100%;aspect-ratio:1;object-fit:cover;border-radius:var(--r);border:1px solid var(--line);display:block;margin-bottom:10px">`
    : '';
  // El arma primero (también la natural, marcada), después cada pieza de equipo (2026-10-09).
  const arma = d.armaNombre
    ? `<span class="arma" title="${d.armaNatural ? 'Arma natural: es parte de su cuerpo' : 'Su arma'}">🗡 ${esc(d.armaNombre)}${d.armaNatural ? ' <i>(natural)</i>' : ''}</span>`
    : '';
  const equipo = (arma || (d.equipoNombres && d.equipoNombres.length))
    ? `<div class="hud-tarjeta-equipo">${arma}${(d.equipoNombres || []).map(n => `<span>${esc(n)}</span>`).join('')}</div>`
    : '<span style="color:var(--muted)">Sin equipo.</span>';
  const estados = d.estados.length
    ? d.estados.map(e => {
        const turnos = e.permanente ? '∞' : (num(e.turnos) ? fmt(num(e.turnos)) + 't' : '—');
        return `<div class="hud-estado">
          <span style="width:9px;height:9px;border-radius:50%;background:${ESTADO_COLOR[e.polaridad] || ESTADO_COLOR['']};flex:none"></span>
          <span class="nom">${esc(e.nombre)}</span><span class="turnos">${turnos}</span>
        </div>`;
      }).join('')
    : '<span style="color:var(--muted)">Ninguno activo.</span>';
  const nota = String(d.notas || '').trim();
  return '<div class="hud-globo hud-tarjeta">' +
    `<h3>${esc(t.nombre || '?')}</h3>` + img +
    '<div class="hud-seccion" style="padding-top:0;border-top:none"><h3>Equipo</h3>' + equipo + '</div>' +
    '<div class="hud-seccion"><h3>Estados alterados</h3>' + estados + '</div>' +
    (nota ? '<div class="hud-seccion"><h3>Nota</h3><p class="hud-tarjeta-nota">' + esc(nota) + '</p></div>' : '') +
  '</div>';
}

function hudAjustesHtml(t, d){
  const barras = barrasDe(t);
  const aura = t.aura || {};
  const puede = puedoMover(t);
  const check = (clave, texto, color, si) =>
    `<label class="hud-chip" style="--chip:${color}" title="Mostrar la barra de ${texto} debajo del token">` +
    `<input type="checkbox" data-hud-barra="${clave}"${si ? ' checked' : ''}><span class="muestra"></span>${texto}</label>`;
  // Caja "actual / máximo" debajo de cada barra: el actual se edita ahí
  // mismo (mismo mecanismo que tocar el círculo del anillo); el máximo es
  // de lectura, sale de la ficha (fórmula) o del creep.
  // El máximo del SP de un personaje también se edita acá (a mano, sin tocar la fórmula de la ficha): número, +N / -N o "auto".
  const recurso = (clave, valor, maximo, maxEditable) => {
    if(valor === null || valor === undefined) return '<div class="hud-recurso vacio">—</div>';
    const maxHtml = maxEditable && maximo !== null && maximo !== undefined
      ? `<span class="hud-recurso-max">/</span><input type="text" inputmode="decimal" class="hud-recurso-actual" style="width:44px" data-hud-recurso-max="${clave}" value="${fmt(maximo)}" title="Máximo: escribí el valor nuevo, +N / -N, o «auto» para volver al cálculo de la ficha, y apretá Enter">`
      : `<span class="hud-recurso-max">/ ${maximo === null || maximo === undefined ? '—' : fmt(maximo)}</span>`;
    return `<div class="hud-recurso">` +
      `<input type="text" inputmode="decimal" class="hud-recurso-actual" data-hud-recurso="${clave}" value="${fmt(valor)}" title="Escribí el valor, o +5 / -3, y apretá Enter">` +
      maxHtml +
    '</div>';
  };
  const seccion = (titulo, cuerpo) => `<div class="hud-seccion"><h3>${titulo}</h3>${cuerpo}</div>`;
  // Los tokens sin ficha ni creep (NPC, objetos) pueden llevar su propia
  // imagen; los vinculados usan la miniatura de su ficha o creep.
  const imagenHtml = (!puede || vinculo(t)) ? '' : seccion('Imagen',
    '<div style="display:flex;align-items:center;gap:10px">' +
      (t.imagen ? `<img src="${esc(t.imagen)}" alt="" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid ${esc(t.color || '#9A867E')}">` : '') +
      '<div class="hud-acciones" style="margin:0;flex:1">' +
        `<button type="button" class="hud-mini" data-hud-imagen="1">${t.imagen ? 'Cambiar' : 'Elegir imagen'}</button>` +
        (t.imagen ? '<button type="button" class="hud-mini peligro" data-hud-imagen-no="1">Quitar</button>' : '') +
      '</div>' +
    '</div>');
  // Nombre, color, vínculo y dueño se editan en el panel del costado.
  const editarHtml = (puede || soyGM)
    ? '<div class="hud-pie"><button type="button" class="hud-mini" data-hud-editar="1">✎ Editar token</button></div>'
    : '';
  if(!puede) return '<div class="hud-globo">' + seccion('Token', '') + editarHtml + '</div>';
  return '<div class="hud-globo">' +
    seccion('Barras',
      '<div class="hud-barras">' +
        check('hp', 'Vida', HP_COLOR, barras.hp) +
        check('sp', 'SP', SP_COLOR, barras.sp) +
        check('no2', 'No2', NO2_COLOR, barras.no2) +
      '</div>' +
      '<div class="hud-recursos">' +
        recurso('hp', d.hp, d.hpMax) +
        recurso('sp', d.sp, d.spMax, t.tipo === 'pj' && !String(t.fichaId || '').includes(SEP_INVOCACION)) +
        recurso('no2', d.no2, d.no2Max) +
      '</div>') +
    seccion('Aura',
      '<div class="hud-rejilla">' +
        '<label for="hud-aura-radio">Anillos</label>' +
        `<input id="hud-aura-radio" type="number" min="0" max="30" step="1" inputmode="numeric" value="${Math.round(num(aura.radio))}" data-hud-aura="radio" title="1 = su casilla y las 6 de alrededor (diámetro 3); 2 = 19 casillas (diámetro 5); 0 = sin aura">` +
        '<label for="hud-aura-color">Color</label>' +
        `<input id="hud-aura-color" type="color" value="${/^#[0-9a-fA-F]{6}$/.test(aura.color || '') ? aura.color : '#E0A458'}" data-hud-aura="color">` +
        '<label for="hud-aura-forma">Forma</label>' +
        '<select id="hud-aura-forma" data-hud-aura="forma" style="grid-column:span 3">' +
          `<option value="hex"${aura.forma === 'circulo' ? '' : ' selected'}>Hexágonos</option>` +
          `<option value="circulo"${aura.forma === 'circulo' ? ' selected' : ''}>Círculo</option>` +
        '</select>' +
      '</div>' +
      '<div class="hud-acciones">' +
        (aura.radio ? '<button type="button" class="hud-mini peligro" data-hud-aura-no="1">Quitar</button>' : '') +
        '<button type="button" class="hud-mini" data-hud-aura-ok="1">Guardar aura</button>' +
      '</div>' +
      '<p class="hud-ayuda">Anillos alrededor del token: 1 = su casilla y las 6 de alrededor (diámetro 3), 2 = 19 casillas (diámetro 5). La ven todos.</p>') +
    imagenHtml +
    editarHtml +
    '</div>';
}

// Cartel fijo arriba a la derecha con el nombre del token y su dueño (el
// jugador, o "GM" en un creep/NPC): no se achica con el zoom, para
// leerlo igual con la grilla chiquita.
// Cartel fijo del elemento (Terreno/Formas) seleccionado: si es sólido o transitable,
// bien visible. Se actualiza al dibujar (solo toca el DOM si cambia).
let etiquetaElementoTexto = null;
function actualizarEtiquetaElemento(){
  const el = $('#elemento-etiqueta');
  const e = elementoSeleccionado ? elementos.get(elementoSeleccionado) : null;
  if(!e || !fbMiembro || creando || !puedeVerElemento(e)){
    if(etiquetaElementoTexto !== ''){ el.hidden = true; etiquetaElementoTexto = ''; }
    return;
  }
  const forma = e.tipo === 'linea' ? 'Línea' : e.tipo === 'libre' ? 'Forma libre' : 'Flor';
  // Una trampa, una zona o un portal dicen qué son (2026-10-04, dueño: «debe ser claro lo que es el objeto al seleccionarlo»).
  const especial = elementoQueEs(e);
  if(especial){
    const clave = 'especial|' + especial;
    if(clave === etiquetaElementoTexto) return;
    etiquetaElementoTexto = clave;
    el.className = 'especial';
    el.innerHTML = especial;
    el.hidden = false;
    return;
  }
  const estado = e.solido
    ? '<span class="es-solido">🧱 SÓLIDO · bloquea el paso</span>'
    : '<span class="es-libre">🚶 TRANSITABLE · se puede pisar</span>';
  const extra = (e.invisible ? ' · <span>👁 invisible para jugadores</span>' : '') + (e.fijado ? ' · <span>📌 fijado</span>' : '');
  const dueno = nombreMiembro(e.duenoUid);
  const html = `<b>${forma}</b> <span>${esc(/^\(/.test(dueno) ? dueno : `(${dueno})`)}</span> · ${estado}${extra}`;
  const clase = e.solido ? 'solido' : 'libre';
  const clave = clase + '|' + html;
  if(clave === etiquetaElementoTexto) return;
  etiquetaElementoTexto = clave;
  el.className = clase;
  el.innerHTML = html;
  el.hidden = false;
}

// Qué es un elemento especial, para el cartel de arriba: el nombre, de quién es, en qué estado está y qué hace. '' si es una forma común.
function elementoQueEs(e){
  const dueno = nombreMiembro(e.duenoUid), de = esc(/^\(/.test(dueno) ? dueno : `(${dueno})`);
  const corto = txt => { const t = String(txt).replace(/\s*⚙[\s\S]*$/, '').trim();
    if(t.length <= 480 && !/[^.!?…)]$/.test(t)) return t;
    if(t.length <= 480){ const p = t.lastIndexOf('. '); return p > 40 ? t.slice(0, p + 1) : t; }   // una trampa vieja, guardada cortada: hasta la última frase entera
    const c = t.slice(0, 480); return c.slice(0, Math.max(c.lastIndexOf('. ') + 1, 200)) + ' …'; };
  const det = txt => txt ? `<div class="que-hace">${esc(corto(txt))}</div>` : '';
  // 🗡 El arma en el piso (2026-10-07, js/27): su nombre, de quién era y cómo se levanta (el cartel de arriba a la derecha, como un token).
  if(e.arma){
    const [ref, tipo] = String(e.armaDe || '').split('|'), t = [...tokens.values()].find(x => x.fichaId === ref && (x.tipo === 'creep' ? 'creep' : 'pj') === tipo);
    return `<b>🗡️ ${esc(e.armaNombre || 'Arma')}</b>${t ? ` <span>(se le cayó a ${esc(nombreDe(t))})</span>` : ''}<div class="que-hace">En el piso: la levanta cualquiera que esté encima o al lado, por 1 No2, desde su Botonera.</div>`;
  }
  if(e.zona){
    const t = num(e.turnos) > 0 && mantenimientoNumero !== null ? Math.max(0, num(e.venceMant) - Math.round(num(mantenimientoNumero))) : 0;
    return `<b>🌫 ZONA · ${esc(e.zonaNombre || 'Efecto persistente')}</b> <span>${de}</span>${t ? ` · <span>quedan ${t} turno${t === 1 ? '' : 's'}</span>` : ''}` +
      ` · <span class="es-libre">la sufre quien entra y quien sigue adentro en el Mantenimiento</span>`;
  }
  if(e.portal) return `<b>🌀 PORTAL</b> <span>${de}</span> · <span class="es-libre">lo usan los aliados de quien lo abrió: lleva al otro portal</span>`;
  if(e.trampa){
    const estado = e.disparada ? '<span class="es-solido">💥 DETONADA</span>' : '<span class="es-trampa">⚠ ARMADA · la disparan los rivales de quien la puso (los aliados no)</span>';
    return `<b>🪤 TRAMPA · ${esc(e.trampaNombre || 'sin nombre')}</b> <span>${de}</span> · ${estado}${det(e.trampaDetalle)}`;
  }
  return '';
}

function actualizarEtiquetaToken(){
  const el = $('#token-etiqueta');
  const t = seleccion ? tokens.get(seleccion) : null;
  if(!t || !fbMiembro || creando){ el.hidden = true; return; }
  const dueno = t.tipo === 'creep' ? 'GM' : nombreMiembro(t.duenoUid);
  el.innerHTML = `<b>${esc(nombreDe(t))}</b> <span>(${esc(dueno)})</span>`;
  el.hidden = false;
}

// Dibuja el HUD y lo acomoda sobre el token seleccionado.
function hudUbicar(){
  actualizarEtiquetaToken();
  actualizarEtiquetaElemento();
  actualizarAvisoColocacion();
  actualizarAvisoLentes();
  const hud = $('#hud');
  const t = seleccion ? tokens.get(seleccion) : null;
  if(!t || !fbMiembro || creando){ hud.hidden = true; return; }
  const d = disposicion.find(x => x.id === seleccion);
  const vis = visibles.get(seleccion) || (d ? {x: d.x, y: d.y} : hexCentro(t.col, t.fila));
  const radio = (d ? d.radio : HEX * 0.68) * vista.zoom;
  const px = vis.x * vista.zoom + vista.x, py = vis.y * vista.zoom + vista.y;
  const firma = JSON.stringify([seleccion, hudNivel, hudGlobo, hudEditando, hpModo, hudDatos(t), barrasDe(t), t.aura || null, (t.imagen || '').length, soyGM, !!t.oculto, moverLibre === seleccion]);
  if(hud.dataset.firma !== firma){
    hud.dataset.firma = firma;
    hud.innerHTML = hudHtml(t);
    hudConectar(t);
  }
  hud.hidden = false;
  hud.style.left = Math.round(px) + 'px';
  hud.style.top = Math.round(py) + 'px';
  hudAcomodarAnillo(radio);
  hudAcomodarRotar(t, radio);
}

// Ubica el handle de rotación en el lado del frente, un poco más afuera
// que el anillo. Se llama sola (sin depender de la firma) para que se
// mueva en cada cuadro, tanto al arrastrarlo como cuando llega un cambio
// de otra pantalla.
function hudAcomodarRotar(t, radioToken){
  const handle = $('#hud').querySelector('.hud-rotar');
  if(!handle) return;
  const ang = (90 + num(t.rotacion || 0)) * Math.PI / 180;
  const r = radioToken + 28;
  handle.style.left = Math.round(Math.cos(ang) * r) + 'px';
  handle.style.top = Math.round(Math.sin(ang) * r) + 'px';
}

// Reparte los botones en ronda alrededor del token, dejando un hueco abajo
// (ahí van las barras y el nombre). El radio crece con el zoom y con la
// cantidad de botones, para que no se pisen.
function hudAcomodarAnillo(radioToken){
  const hud = $('#hud');
  const botones = [...hud.querySelectorAll('.hud-anillo > *')];
  if(!botones.length) return;
  const ARCO = 300;              // grados que ocupa la ronda (60 libres abajo)
  const paso = botones.length > 1 ? ARCO / (botones.length - 1) : 0;
  const minRadio = botones.length > 1 ? 21 / Math.sin(Math.min(Math.PI / 2, paso * Math.PI / 360)) : 0;
  // Como en Roll20: la ronda va por fuera de las casillas vecinas (un casillero
  // y medio), así se ve lo que hay alrededor del token.
  const afuera = Math.min(ANCHO_CASILLA * vista.zoom * 1.5 + 6, 200);
  const r = Math.max(radioToken + 34, afuera, minRadio, 52);
  botones.forEach((b, i) => {
    const ang = (-90 - ARCO / 2 + paso * i) * Math.PI / 180;
    b.style.left = Math.round(Math.cos(ang) * r) + 'px';
    b.style.top = Math.round(Math.sin(ang) * r) + 'px';
  });
  const globos = hud.querySelector('.hud-globos');
  if(globos) hudAcomodarGlobo(globos, r);
}

// El panel que se abre (estados o ajustes) va al costado del anillo, sin
// tapar el token: a la derecha, o a la izquierda si no entra. Siempre dentro
// del mapa y, si es más alto que la pantalla, con scroll.
// Los globos del HUD (vida, estados, ajustes) se pueden ARRASTRAR desde su título y dejar donde mejor convenga (2026-09-25, pedido del dueño):
// queda en esa posición de la pantalla (no sigue al token) y se recuerda por navegador. Doble clic en el título: vuelve a acomodarse solo.
let globoPos = null;   // {x, y} respecto de la caja del mapa, o null = automático
try{ const g = JSON.parse(localStorage.getItem('hud-globo-pos') || 'null'); if(g && Number.isFinite(g.x) && Number.isFinite(g.y)) globoPos = {x: g.x, y: g.y}; }catch(e){}
function hudGloboGuardarPos(){ try{ if(globoPos) localStorage.setItem('hud-globo-pos', JSON.stringify(globoPos)); else localStorage.removeItem('hud-globo-pos'); }catch(e){} }
document.addEventListener('pointerdown', e => {
  const h3 = e.target.closest && e.target.closest('#hud .hud-globo h3');
  if(!h3 || e.button !== 0) return;
  const globos = h3.closest('.hud-globos'), caja = $('#lienzo-caja');
  if(!globos || !caja) return;
  e.preventDefault(); e.stopPropagation();
  const cr = caja.getBoundingClientRect(), gr = globos.getBoundingClientRect();
  const dx = e.clientX - gr.left, dy = e.clientY - gr.top;
  const mover = ev => {
    const w = globos.offsetWidth, h = globos.offsetHeight;
    globoPos = {x: Math.max(0, Math.min(ev.clientX - dx - cr.left, cr.width - w)), y: Math.max(0, Math.min(ev.clientY - dy - cr.top, cr.height - h))};
    pedirDibujo();
  };
  const soltar = () => { removeEventListener('pointermove', mover); removeEventListener('pointerup', soltar); hudGloboGuardarPos(); };
  addEventListener('pointermove', mover); addEventListener('pointerup', soltar);
}, true);
document.addEventListener('dblclick', e => {
  if(e.target.closest && e.target.closest('#hud .hud-globo h3')){ globoPos = null; hudGloboGuardarPos(); pedirDibujo(); }
});
function hudAcomodarGlobo(globos, r){
  const caja = $('#lienzo-caja').getBoundingClientRect();
  const hud = $('#hud').getBoundingClientRect();
  const px = hud.left - caja.left, py = hud.top - caja.top;   // centro del token
  const margen = 8;
  // Con la Botonera abierta (ocupa la mitad izquierda del mapa) el globo se acomoda solo en la mitad libre, sin quedar tapado ni cortado.
  const capaBot = $('#botonera-capa');
  const minX = capaBot && !capaBot.hidden && !botonera.completa && botoneraEnMitad() ? Math.round(caja.width / 2) + margen : margen;
  globos.style.maxHeight = Math.max(120, caja.height - margen * 2) + 'px';
  const w = globos.offsetWidth, h = globos.offsetHeight;
  const lado = r + 26;
  let x, y;
  if(px + lado + w <= caja.width - margen || px - lado - w >= minX){
    x = px + lado + w <= caja.width - margen ? px + lado : px - lado - w;
    y = py - h / 2;
  }else{
    // No entra a ningún costado (pantalla angosta): abajo o arriba del anillo.
    x = px - w / 2;
    y = py + lado;
    if(y + h > caja.height - margen) y = py - lado - h;
  }
  x = Math.max(minX, Math.min(x, caja.width - w - margen));
  y = Math.max(margen, Math.min(y, caja.height - h - margen));
  if(globoPos){ x = Math.max(0, Math.min(globoPos.x, caja.width - w)); y = Math.max(0, Math.min(globoPos.y, caja.height - h)); }   // lo puso el usuario a mano
  globos.style.left = Math.round(x - px) + 'px';
  globos.style.top = Math.round(y - py) + 'px';
}

function hudConectar(t){
  const hud = $('#hud');
  hud.querySelectorAll('[data-hud-valor]').forEach(b => b.onclick = () => {
    // Vida: mini menu (recibir dano / HP directo). Las invocaciones siguen con el campo simple.
    if(b.dataset.hudValor === 'hp' && !(t.fichaId || '').includes(SEP_INVOCACION)){
      if(hudGlobo === 'hp'){ hudGlobo = ''; } else { hudGlobo = 'hp'; hpModo = 'danio'; hpCritMult = 1; hpRayo = false; }
      hudEditando = ''; pedirDibujo();
      return;
    }
    hudEditando = b.dataset.hudValor; hudGlobo = ''; pedirDibujo();
    setTimeout(() => { const i = hud.querySelector('[data-hud-in]'); if(i) i.focus(); }, 30);
  });
  // Mini menú de la vida: modos, campo con vista previa y Enter/Esc.
  hud.querySelectorAll('[data-hud-hpmodo]').forEach(b => b.onclick = () => { hpModo = b.dataset.hudHpmodo; pedirDibujo(); });
  hud.querySelectorAll('[data-hud-rayo]').forEach(b => b.onclick = () => { hpRayo = !hpRayo; if(hpRayo) hpCritMult = 1; pedirDibujo(); });
  hud.querySelectorAll('[data-hud-critmult]').forEach(b => b.onclick = () => { hpCritMult = Math.max(1, Math.min(4, num(b.dataset.hudCritmult))); pedirDibujo(); });
  hud.querySelectorAll('[data-hud-critcalc]').forEach(b => b.onclick = () => { if(typeof Critico !== 'undefined') Critico.abrir({defensor: seleccion || ''}); });
  const campoHp = hud.querySelector('[data-hud-hp-in]');
  if(campoHp){
    const dHp = hudDatos(t);
    const previa = hud.querySelector('[data-hud-hp-prev]');
    campoHp.oninput = () => { previa.textContent = hudHpPrevia(t, dHp, campoHp.value); };
    campoHp.onkeydown = e => {
      if(e.key === 'Enter'){ e.preventDefault(); hudHpAplicar(t, campoHp.value); }
      if(e.key === 'Escape'){ e.stopPropagation(); hudGlobo = ''; pedirDibujo(); }
    };
    setTimeout(() => campoHp.focus(), 30);
  }
  const campo = hud.querySelector('[data-hud-in]');
  if(campo){
    campo.onkeydown = e => {
      if(e.key === 'Enter'){ e.preventDefault(); hudAplicar(campo.dataset.hudIn, campo.value); }
      if(e.key === 'Escape'){ hudEditando = ''; pedirDibujo(); }
    };
    campo.onblur = () => { hudEditando = ''; pedirDibujo(); };
  }
  hud.querySelectorAll('[data-hud-nivel]').forEach(b => b.onclick = () => hudPonerNivel(b.dataset.hudNivel));
  hud.querySelectorAll('[data-hud-boton]').forEach(b => b.onclick = () => {
    const clave = b.dataset.hudBoton;
    if(clave === 'ficha'){ abrirFichaDeToken(t); return; }
    if(clave === 'libre'){ activarMoverLibre(seleccion); return; }
    if(clave === 'oculto'){ editarToken(seleccion, {oculto: !t.oculto, ...(!t.oculto && t.revelado ? {revelado: false} : {})}); return; }   // ocultarlo lo vuelve a esconder del todo (js/29)
    if(clave === 'equipo'){ abrirEquipoMapa(t.fichaId.split(SEP_INVOCACION)[0]); return; }   // el mapa (js/11, A4)
    if(clave === 'rayo'){
      const fichaDeToken = t.tipo === 'pj' && t.fichaId ? t.fichaId.split(SEP_INVOCACION)[0] : '';
      const invDeToken = t.tipo === 'pj' && t.fichaId && t.fichaId.includes(SEP_INVOCACION) ? t.fichaId.split(SEP_INVOCACION)[1] : '';
      if(fichaDeToken) abrirBotonera(fichaDeToken, undefined, invDeToken); else abrirAcciones(t.fichaId);
      return;
    }
    hudGlobo = hudGlobo === clave ? '' : clave;
    hudEditando = '';
    if(hudGlobo === 'estados') estadosPrecargar(t);   // así «+ Estado» abre enseguida
    pedirDibujo();
  });
  const nuevoEstado = hud.querySelector('[data-hud-estado-nuevo]');
  if(nuevoEstado) nuevoEstado.onclick = () => abrirEstadoNuevo(t);
  // Descripción del estado: se muestra al pasar el mouse (o con Tab) y se
  // ubica a mano, para que no la recorte el scroll del globo ni el borde
  // del mapa.
  hud.querySelectorAll('.hud-estado .nom.con-tip').forEach(nom => {
    const tip = nom.parentElement.querySelector('.estado-tip');
    if(!tip) return;
    const mostrar = () => {
      tip.classList.add('visible');
      const caja = $('#lienzo-caja').getBoundingClientRect();
      const r = nom.getBoundingClientRect();
      const margen = 8;
      const ancho = tip.offsetWidth, alto = tip.offsetHeight;
      let x = r.left;
      x = Math.max(caja.left + margen, Math.min(x, caja.right - ancho - margen));
      let y = r.top - alto - 6;                       // arriba del renglón
      if(y < caja.top + margen) y = r.bottom + 6;     // no entra: abajo
      y = Math.max(caja.top + margen, Math.min(y, caja.bottom - alto - margen));
      tip.style.left = Math.round(x) + 'px';
      tip.style.top = Math.round(y) + 'px';
    };
    const esconder = () => tip.classList.remove('visible');
    nom.onmouseenter = mostrar;
    nom.onfocus = mostrar;
    nom.onmouseleave = esconder;
    nom.onblur = esconder;
  });
  hud.querySelectorAll('[data-hud-estado-editar]').forEach(b => b.onclick = () => {
    const v = vinculo(t);
    const e = ((v && v.resumen && v.resumen.estados) || [])[num(b.dataset.hudEstadoEditar)];
    if(e) abrirEditarEstado(t, e.nombre);
  });
  hud.querySelectorAll('[data-hud-quitar]').forEach(b => b.onclick = () => hudEstadoCambiar(t, num(b.dataset.hudQuitar), 'quitar'));
  hud.querySelectorAll('[data-hud-armrota]').forEach(b => b.onclick = () => {
    const [i, acc] = b.dataset.hudArmrota.split(':');
    const v = vinculo(t);
    const e = ((v && v.resumen && v.resumen.estados) || [])[num(i)];
    if(!e) return;
    const stacks = Math.max(1, num(e.stacks) || 1);
    const txt = acc === 'set' ? prompt(`${e.nombre}: ×${fmt(stacks)}
Escribí cuántos puntos de armadura rota, +N o -N (0 la repara)`, fmt(stacks)) : (num(acc) > 0 ? '+' : '') + acc;
    if(txt === null) return;
    hudEstadoCambiar(t, num(i), 'armadura', txt);
  });
  hud.querySelectorAll('[data-hud-escudo]').forEach(b => b.onclick = () => {
    const [i, acc] = b.dataset.hudEscudo.split(':');
    const v = vinculo(t);
    const e = ((v && v.resumen && v.resumen.estados) || [])[num(i)];
    if(!e) return;
    const txt = acc === 'set' ? prompt(e.excedente ? `${e.nombre}: ${fmt(num(e.escudo))}\nEscribí el valor nuevo, +N o -N (sin tope)` : `${e.nombre}: ${fmt(num(e.escudo))}/${fmt(num(e.escudoMax))}\nEscribí el valor nuevo, +N o -N (para cambiar el máximo: max 12)`, fmt(num(e.escudo))) : (num(acc) > 0 ? '+' : '') + acc;
    if(txt === null) return;
    hudEstadoCambiar(t, num(i), 'escudo', txt);
  });
  hud.querySelectorAll('[data-hud-turnos]').forEach(b => b.onclick = () => {
    const [i, delta] = b.dataset.hudTurnos.split(':');
    hudEstadoCambiar(t, num(i), 'turnos', num(delta));
  });
  hud.querySelectorAll('[data-hud-barra]').forEach(c => c.onchange = () => {
    const barras = {...barrasDe(t)};
    barras[c.dataset.hudBarra] = c.checked;
    editarToken(seleccion, {barras});
  });
  // Caja "actual / máximo": Enter guarda (mismo camino que el círculo del
  // anillo), Escape o perder el foco sin guardar vuelve al valor de antes.
  hud.querySelectorAll('[data-hud-recurso]').forEach(inp => {
    inp.onkeydown = e => {
      if(e.key === 'Enter'){ e.preventDefault(); hudAplicar(inp.dataset.hudRecurso, inp.value); }
      if(e.key === 'Escape'){ inp.value = inp.defaultValue; inp.blur(); }
    };
    inp.onblur = () => { inp.value = inp.defaultValue; };
  });
  hud.querySelectorAll('[data-hud-recurso-max]').forEach(inp => {
    inp.onkeydown = e => {
      if(e.key === 'Enter'){ e.preventDefault(); hudAplicarMax(inp.dataset.hudRecursoMax, inp.value); }
      if(e.key === 'Escape'){ inp.value = inp.defaultValue; inp.blur(); }
    };
    inp.onblur = () => { inp.value = inp.defaultValue; };
  });
  const handleRotar = hud.querySelector('[data-hud-rotar]');
  if(handleRotar) handleRotar.onpointerdown = e => {
    e.preventDefault();
    handleRotar.setPointerCapture(e.pointerId);
    const centro = handleRotar.parentElement.getBoundingClientRect();
    const d = disposicion.find(x => x.id === seleccion);
    const tokIni = tokens.get(seleccion);
    rotando = {id: seleccion, cx: centro.left, cy: centro.top, radio: (d ? d.radio : HEX * 0.68) * vista.zoom, inicial: num(tokIni && tokIni.rotacion || 0), seq0: nieblaSeq, pend0: new Set(nieblaPendientes)};
  };
  if(handleRotar) handleRotar.onpointermove = e => {
    if(!rotando || rotando.id !== seleccion) return;
    const dx = e.clientX - rotando.cx, dy = e.clientY - rotando.cy;
    if(Math.hypot(dx, dy) < 6) return;
    // 0° = frente abajo, sentido horario (mismo criterio que rota la imagen).
    let ang = Math.atan2(-dx, dy) * 180 / Math.PI;
    ang = (((Math.round(ang / 60) * 60) % 360) + 360) % 360;
    const tok = tokens.get(rotando.id);
    if(tok && tok.rotacion !== ang){
      tok.rotacion = ang;
      hudAcomodarRotar(tok, rotando.radio);
      pedirDibujo();
    }
  };
  if(handleRotar) handleRotar.onpointerup = async e => {
    if(!rotando) return;
    const id = rotando.id, inicial = rotando.inicial, seq0 = rotando.seq0, pend0 = rotando.pend0;
    const tok = tokens.get(id);
    rotando = null;
    handleRotar.releasePointerCapture(e.pointerId);
    if(!tok) return;
    const fin = num(tok.rotacion || 0);
    // Girar cuesta No2 en combate: COSTO_GIRO_NO2 por cada giro de 60° (a debatir, P14)…
    let dif = Math.abs(fin - inicial) % 360;
    if(dif > 180) dif = 360 - dif;
    let costo = Math.round(dif / 60) * COSTO_GIRO_NO2;
    // Con 🦶 Mover libre prendido girar tampoco gasta No2, y el GM no cobra el giro
    // de un personaje de un jugador (no puede tocar su ficha): ahí no se gasta ni el giro gratis.
    const giroSinCosto = moverLibre === id || (soyGM && tok.tipo === 'pj');
    // …salvo el primero después de moverse: elegir hacia dónde queda mirando es gratis.
    let usoGratis = false, cobrado = 0;
    if(costo > 0 && !giroSinCosto && giroLibre.has(id)){
      giroLibre.delete(id);
      usoGratis = true;
      costo = 0;
      toast('Elegiste hacia dónde mirás (gratis). Desde ahora, cada giro cuesta 1 No2 por giro de 60°.');
    }
    if(costo > 0 && !giroSinCosto && costoMoverDe(tok) && costo > costoMoverDe(tok).disponibles){
      tok.rotacion = inicial; pedirDibujo();
      toast(`No te alcanzan los No2 para girar: cuesta ${fmt(costo)} y tenés ${fmt(Math.max(0, costoMoverDe(tok).disponibles))}. Con Mover libre (🦶) girar es gratis.`);
      return;
    }
    if(costo > 0 && !giroSinCosto && costoMoverDe(tok)){
      try{
        const esCreep = tok.tipo === 'creep';
        const quedan = esCreep ? await gastarNitrosCreep(tok.fichaId, costo) : await gastarNitros(tok.fichaId, costo);
        cobrado = costo;
        toast(`Giro: −${fmt(costo)} No2 · ${esCreep ? 'le quedan' : 'te quedan'} ${fmt(quedan)}${quedan < 0 ? ' ⚠ se pasó de los No2' : ''}`);
      }catch(err){
        console.error('No se pudo cobrar el giro:', err);
        tok.rotacion = inicial; pedirDibujo();
        toast('No se pudo cobrar el giro, así que no giró');
        return;
      }
    }
    if(fin !== inicial) deshacerRegistrar({tipo: 'giro', id, fichaId: tok.fichaId, esCreep: tok.tipo === 'creep', costo: cobrado, rotacion: inicial, gratis: usoGratis, seq0, pend0});
    editarToken(id, {rotacion: fin});
  };
  const botonEditar = hud.querySelector("[data-hud-editar]");
  if(botonEditar) botonEditar.onclick = () => { const id = seleccion; hudCerrar(); abrirEditarToken(id); };
  const botonImagen = hud.querySelector("[data-hud-imagen]");
  if(botonImagen) botonImagen.onclick = () => elegirImagenToken(seleccion);
  const quitarImagen = hud.querySelector('[data-hud-imagen-no]');
  if(quitarImagen) quitarImagen.onclick = () => editarToken(seleccion, {imagen: firebase.firestore.FieldValue.delete()});
  const guardarAura = () => {
    const radio = Math.min(30, Math.max(0, Math.round(num(hud.querySelector('[data-hud-aura="radio"]').value))));
    const color = hud.querySelector('[data-hud-aura="color"]').value;
    const forma = hud.querySelector('[data-hud-aura="forma"]').value === 'circulo' ? 'circulo' : 'hex';
    editarToken(seleccion, {aura: radio > 0 ? {radio, forma, color} : firebase.firestore.FieldValue.delete()});
  };
  const campoRadio = hud.querySelector('[data-hud-aura="radio"]');
  // Solo números naturales: se descartan comas, puntos y signos al tipear.
  if(campoRadio) campoRadio.oninput = () => {
    const limpio = campoRadio.value.replace(/[^0-9]/g, '');
    if(limpio !== campoRadio.value) campoRadio.value = limpio;
  };
  if(campoRadio) campoRadio.onkeydown = e => { if(e.key === 'Enter'){ e.preventDefault(); guardarAura(); } };
  const ok = hud.querySelector('[data-hud-aura-ok]');
  if(ok) ok.onclick = guardarAura;
  const quitar = hud.querySelector('[data-hud-aura-no]');
  if(quitar) quitar.onclick = () => {
    hud.querySelector('[data-hud-aura="radio"]').value = '0';
    guardarAura();
  };
}

async function hudAplicar(clave, texto){
  const t = seleccion ? tokens.get(seleccion) : null;
  if(!t || !puedoCambiarVida(t) || !String(texto).trim()){ hudEditando = ''; pedirDibujo(); return; }
  const idTok = seleccion, antes = vitalActual(t, clave);
  // Subirle la vida a un caído (2026-10-06, dueño: una cura no levanta a un inconsciente): avisa y deja seguir — a mano, lo decide la mesa;
  // si sigue, queda de pie (sin Titilando: eso es de los efectos que reviven).
  let levantar = false;
  if(clave === 'hp' && antes !== null && antes !== undefined && num(antes) <= 0){
    const nuevo = leerValorVital(texto, num(antes));
    if(nuevo !== null && nuevo > 0){
      if(!(await AvisoCombate.preguntar(`${nombreDe(t)} ${Combatiente.CAIDO_TXT}: para eso está ✚ Revivir (o un Ankh).\n\n¿Cambiarle la vida igual, a mano? (Lo decide la mesa.)`, {icono: '💔', titulo: 'Está caído', si: 'Sí, cambiarla'}))){ hudEditando = ''; pedirDibujo(); return; }
      levantar = true;
    }
  }
  try{
    if(clave === 'no2') await cambiarNitros(t, texto);
    else if(t.tipo === 'creep') await cambiarVidaCreep(t.fichaId, texto);
    else await cambiarVidaPj(t, clave, texto, levantar);
    vitalRegistrar(idTok, clave, antes);
  }catch(err){
    console.error('No se pudo cambiar el valor:', err);
    toast(err.message === ERROR_TIPEO ? 'Escribí un número, o +5 / -3'
      : esCuotaAgotada(err) ? CUOTA_AGOTADA_TXT
      : err.code === 'permission-denied' ? 'No podés cambiar eso' : 'No se pudo guardar: ' + err.message);
  }finally{
    hudEditando = '';
    pedirDibujo();
  }
}

// SP máximo a mano desde el HUD (2026-09-24, pedido de los jugadores): se guarda como un ajuste `meta.spMaxExtra` sobre el máximo que
// calcula la ficha (Especial × 3 + bonos), así "auto" (o el mismo valor calculado) lo deja como estaba. El SP que ya se gastó se
// conserva: subir el máximo suma SP disponible, bajarlo lo resta (sin quedar por debajo de 0).
async function hudAplicarMax(clave, texto){
  const t = seleccion ? tokens.get(seleccion) : null;
  if(!t || clave !== 'sp' || t.tipo !== 'pj' || !puedoCambiarVida(t) || !String(texto).trim()){ pedirDibujo(); return; }
  try{
    await cambiarSpMaxPj(t, texto);
  }catch(err){
    console.error('No se pudo cambiar el SP máximo:', err);
    toast(err.message === ERROR_TIPEO ? 'Escribí un número, +5 / -3 o «auto»'
      : esCuotaAgotada(err) ? CUOTA_AGOTADA_TXT
      : err.code === 'permission-denied' ? 'No podés cambiar eso' : 'No se pudo guardar: ' + err.message);
  }finally{
    pedirDibujo();
  }
}
async function cambiarSpMaxPj(t, texto){
  const fichaId = t.fichaId.split(SEP_INVOCACION)[0];
  const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
  const parteRef = base.collection('partes').doc('general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  await fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const r = ficha.data().resumen || {};
    if(r.spMax === undefined) throw new Error('abrí tu ficha una vez para que se actualice');
    const spMax = num(r.spMax);
    datos.meta = datos.meta || {};
    const extraViejo = num(datos.meta.spMaxExtra);
    const calculado = spMax - extraViejo;   // lo que da la fórmula de la ficha
    const crudo = String(texto).trim().toLowerCase();
    let nuevoMax;
    if(crudo === 'auto') nuevoMax = calculado;
    else{
      const v = leerValorVital(texto, spMax);
      if(v === null) throw new Error(ERROR_TIPEO);
      nuevoMax = v;
    }
    nuevoMax = Math.max(1, Math.round(nuevoMax * 100) / 100);
    datos.meta.spMaxExtra = nuevoMax - calculado === 0 ? 0 : nuevoMax - calculado;
    const gastado = Math.min(nuevoMax, Math.max(0, num(datos.spGastado)));
    datos.spGastado = gastado;
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {actualizado: ts, 'resumen.spMax': nuevoMax, 'resumen.sp': nuevoMax - gastado});
  });
}

// No2 desde el HUD (los PJ en su ficha, los creeps en su parte privada).
async function cambiarNitros(t, texto){
  if(t.tipo === 'creep'){
    await modificarCreep(t.fichaId, sc => {
      const nuevo = leerValorVital(texto, num(sc.nitros));
      if(nuevo === null) throw new Error(ERROR_TIPEO);
      sc.nitros = Math.max(0, nuevo);
    });
    return;
  }
  const base = fbDb.doc(fbRutaCampana(`fichas/${t.fichaId}`));
  const parteRef = base.collection('partes').doc('general');
  const ts = firebase.firestore.FieldValue.serverTimestamp();
  await fbDb.runTransaction(async tx => {
    const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
    if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
    const datos = JSON.parse(parte.data().json || '{}');
    const r = ficha.data().resumen || {};
    const actual = datos.nitros === null || datos.nitros === undefined ? num(r.nitros) : num(datos.nitros);
    const nuevo = leerValorVital(texto, actual);
    if(nuevo === null) throw new Error(ERROR_TIPEO);
    datos.nitros = Math.max(0, nuevo);
    tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
    tx.update(base, {'resumen.nitros': datos.nitros, actualizado: ts});
  });
}

function puedeAgregarEstado(t){
  if(!t || !t.fichaId) return false;
  return t.tipo === 'creep' ? soyGM : true;
}

// Abre el selector de estados de la herramienta que corresponde.
function abrirFichaDeToken(t){
  // Ficha lite (2026-10-02, js/15): un creep vinculado (el GM), y un personaje o una invocación mío — o cualquiera, siendo GM (dueño, 2026-10-05:
  // «que ese botón siempre muestre la ficha lite; desde la lite se puede ir a la completa») — abren encima del mapa lo esencial del combate.
  // La de otro jugador, para un jugador, se abre en otra pestaña como antes.
  if(t.tipo === 'creep' && t.fichaId && soyGM){ abrirFichaLite({tipo: 'creep', creepId: t.fichaId}); return; }
  const fichaId = t.tipo === 'pj' && t.fichaId ? t.fichaId.split(SEP_INVOCACION)[0] : '';
  if(!fichaId) return;
  const invId = t.fichaId.includes(SEP_INVOCACION) ? t.fichaId.split(SEP_INVOCACION)[1] : '';
  if(fbUsuario && (t.duenoUid === fbUsuario.uid || controloFicha(fichaId) || soyGM)){
    abrirFichaLite(invId ? {tipo: 'inv', fichaId, invId} : {tipo: 'pj', fichaId});
    return;
  }
  const url = '../ficha-personaje/ficha.html?partida=' + encodeURIComponent(FB_CAMPANA) + '#' + encodeURIComponent(fichaId);
  window.open(url, '_blank', 'noopener');
}

/* "+ Estado" de un token (2026-10-02, hoja de ruta A3): lo hace el mapa con el selector común (comun/selector-estados.js) — los presets
   con sus preguntas, los "Mis presets" del personaje y "Crear estado nuevo (paso a paso)" — y lo aplica con la regla común
   (Combatiente.agregarEstado: inmunidades, acumular, renovar). Un personaje o una invocación se guardan con editarPersonajeMapa (js/11);
   un creep, con modificarCreep. Antes abría la ficha o GM Tools escondidas en el marco. */
const SE_PIEZAS = ['../comun/estado-preguntas.js?v=20261009zl', '../comun/asistente-estado.js?v=20261008p', '../comun/buscar-estados.js?v=20261008p', '../comun/selector-estados.js?v=20261008m'];
const idEstadoNuevo = () => Math.random().toString(36).slice(2, 9);
// Los stats que ofrece el asistente de estados y sus nombres, como en GM Tools (un creep) y en la ficha (un personaje o invocación).
const SE_STATS_CREEP = {def: ['Def', 'Defensa'], dmg: ['Dmg', 'Daño'], pdg: ['PdG', 'Probabilidad de golpe'], eva: ['Eva', 'Evasión'], parry: ['Parry', 'Parry'],
  nitros: ['No2', 'Nitros'], con: ['Con', 'Constitución'], fue: ['Fue', 'Fuerza'], agl: ['Agi', 'Agilidad'], des: ['Des', 'Destreza'], esp: ['Esp', 'Especial'],
  resm: ['Res.Mt', 'Resistencia mental'], resmg: ['Res.Esp', 'Resistencia especial'], rescc: ['Res.CC', 'Resistencia a CC'], ini: ['Iniciativa', 'Iniciativa'],
  crit: ['Crítico frecuente', 'Crítico frecuente (baja el rango del crítico)'], critpot: ['Crítico potente', 'Crítico potente (baja los umbrales del d20)']};
const seStatsFicha = () => FichaCalculo.MOD_TARGETS.filter(s => !['sp', 'spregen', 'crgmax', 'capcinturon', 'capmochila', 'luz', 'veoculto'].includes(s.id))
  .map(s => ({id: s.id, label: FichaCalculo.STAT_LABEL[s.id] || s.id, full: FichaCalculo.STAT_FULL[s.id] || ''}));
/* «+ Estado» rápido (2026-10-04, dueño: «tarda mucho en abrirse el menú»): antes cargaba las piezas y leía la ficha COMPLETA del personaje
   (≈2 s) antes de mostrar nada. Ahora, al abrir el globo de estados (◎ o E) se adelantan las piezas y los "Mis presets" del personaje (una sola
   parte de la ficha, `partes/efectos`); al tocar «+ Estado» el menú aparece enseguida, y la ficha completa se lee recién al elegir el estado. */
const sePrecarga = new Map();   // fichaId → Promise de sus "Mis presets"
async function leerPropiosFicha(fichaId){
  try{ const d = await fbDb.doc(fbRutaCampana(`fichas/${fichaId}/partes/efectos`)).get(); return d.exists ? (JSON.parse(d.data().json || '{}').efectosPersonalizados || []) : []; }
  catch(err){ return []; }
}
function estadosPrecargar(t){
  if(!t || !puedoCambiarEstados(t)) return;
  (async () => { await bnCargarPiezas(); await cargarPiezas(SE_PIEZAS); if(t.tipo === 'creep') await acCargarPiezas(); })().catch(() => {});
  if(t.tipo === 'pj' && t.fichaId){ const id = t.fichaId.split(SEP_INVOCACION)[0]; if(!sePrecarga.has(id)) sePrecarga.set(id, leerPropiosFicha(id)); }
}
async function abrirEstadoNuevo(t){
  if(!puedeAgregarEstado(t) || !puedoCambiarEstados(t)) return;
  try{ await bnCargarPiezas(); await cargarPiezas(SE_PIEZAS); if(t.tipo === 'creep') await acCargarPiezas(); }
  catch(err){ console.error(err); toast('No se pudo abrir el selector de estados'); return; }
  if(t.tipo === 'creep') return abrirEstadoNuevoCreep(t);
  const [fichaId, invId] = t.fichaId.split(SEP_INVOCACION);
  const propios = await (sePrecarga.get(fichaId) || leerPropiosFicha(fichaId));
  sePrecarga.delete(fichaId);   // la próxima vez se vuelven a leer (pueden haber cambiado)
  const rs = (fichasPub.get(fichaId) || {}).resumen || {};
  const invPub = invId ? (rs.invocaciones || []).find(x => x && x.id === invId) : null;
  const elegido = await SelectorEstados.abrir({
    titulo: 'Estado alterado', para: invPub ? invPub.nombre : nombreDe(t),
    presets: estadosPresetFicha(), propios,
    cfgPreguntas: {hp: 'hpturno', statLabel: id => FichaCalculo.STAT_LABEL[id] || id},
    stats: seStatsFicha(),
    armarDeAsistente: res => ({nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpturno: res.hp, stacksturno: 0,
      escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, popup: false, ...res.flags, ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})}),
  });
  if(!elegido) return;
  // Recién ahora se abre la ficha para escribir el estado (y el preset nuevo, si se pidió guardarlo).
  await editarPersonajeMapa(fichaId, async S => {
    const inv = invId ? (S.invocaciones || []).find(x => x && x.id === invId) : null;
    if(invId && !inv){ toast('Esa invocación ya no está'); return false; }
    const {preset, guardar} = elegido;
    if(guardar){
      S.efectosPersonalizados = S.efectosPersonalizados || [];
      const i = S.efectosPersonalizados.findIndex(p => p.nombre === preset.nombre);
      if(i >= 0) S.efectosPersonalizados[i] = preset; else S.efectosPersonalizados.push(preset);
    }
    const lista = inv ? (inv.estados = inv.estados || []) : (S.efectos = S.efectos || []);
    const nuevo = inv ? SelectorEstados.estadoInvocacion(preset, idEstadoNuevo()) : SelectorEstados.estadoPersonaje(preset, idEstadoNuevo());
    const r = Combatiente.agregarEstado(lista, nuevo);
    const quien = inv ? inv.nombre : ((S.meta && S.meta.nombre) || '');
    if(!r.ok){ toast(`🛡 ${quien}: inmune ahora mismo (${r.motivo}) — ${nuevo.nombre} no se pudo aplicar`); return guardar; }
    if(r.que === 'yaLoTiene'){ toast(`${quien}: ${nuevo.nombre} ya lo tiene, no se acumula`); return guardar; }
    if(inv && InvCalculo.modsAfectanHp(r.estado.mods)) InvCalculo.actualizarHpMaxPorCon(inv);
    // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
    const dis = Combatiente.dispararAlAplicar(r, lista, {hp: 'hpturno', resFuego: num(inv ? InvCalculo.statValor(inv, 'resfuego') : FichaCalculo.calcular(S).final.resfuego), hpActual: inv ? inv.hp : S.hp});
    if(dis.hp){ if(inv) inv.hp = Math.max(0, Math.min(num(inv.hpMax) || Infinity, num(inv.hp) + dis.hp)); else mantFijarHp(S, num(S.hp) + dis.hp); }
    toast(`${quien}: ${SelectorEstados.textoAgregado(r, 'hpturno')}${dis.hp ? ` · ya ${dis.hp < 0 ? 'sacó' : 'curó'} ${fmt(Math.abs(dis.hp))} HP` : ''}`);
    return true;
  });
}
async function abrirEstadoNuevoCreep(t){
  const sc0 = creepPrivadoDe(t.fichaId);
  await PresetsGM.listo();
  const elegido = await SelectorEstados.abrir({
    titulo: 'Estado alterado', para: (sc0 && sc0.nombre) || nombreDe(t),
    presets: estadosPresetCreep(), propios: PresetsGM.lista(),   // los "Mis presets" del GM, en la partida (comun/presets-gm.js, B-7b)
    cfgPreguntas: {hp: 'hpTurno', statLabel: id => (SE_STATS_CREEP[id] && SE_STATS_CREEP[id][0]) || id},
    stats: Object.entries(SE_STATS_CREEP).map(([id, [label, full]]) => ({id, label, full})),
    armarDeAsistente: res => ({nombre: res.nombre, polaridad: res.polaridad, turnos: res.turnos, permanente: res.permanente, stacks: 1, hpTurno: res.hp, stacksTurno: 0,
      escudoMagico: res.escudo, mods: res.mods, detalle: res.detalle, ...res.flags, ...(res.forzarNitros !== undefined ? {forzarNitros: res.forzarNitros} : {})}),
  });
  if(!elegido) return;
  if(elegido.guardar) acGuardarPresetGM(elegido.preset);
  let r = null, nombre = '';
  try{
    await modificarCreep(t.fichaId, crudo => {
      const sc = CreepCalculo.normalizar(crudo);
      nombre = sc.nombre;
      r = Combatiente.agregarEstado(sc.estados, SelectorEstados.estadoCreep(elegido.preset, idEstadoNuevo(), CreepAcciones.FLAGS_ESTADO), {jefe: sc.jefe});
      if(r.ok && CreepCalculo.modsAfectanHp(r.estado.mods)) CreepCalculo.actualizarHpMaxPorCon(sc);
      // Lo que se dispara (veneno, regeneración…) pega apenas se lo ponen (2026-10-06, P161).
      const dis = Combatiente.dispararAlAplicar(r, sc.estados, {hp: 'hpTurno', resFuego: CreepCalculo.resElemental(sc, 'fuego'), hpActual: sc.hp});
      if(dis.hp){ sc.hp = Math.max(0, Math.min(num(sc.hpMax) || Infinity, num(sc.hp) + dis.hp)); r.disparo = dis; }
    });
  }catch(err){ console.error('No se pudo poner el estado al creep:', err); toast('No se pudo poner el estado — mirá la consola'); return; }
  if(!r) return;
  if(!r.ok){ toast(`${nombre}: inmune ahora mismo (${r.motivo}) — ${elegido.preset.nombre} no se pudo aplicar`); return; }
  if(r.que === 'yaLoTiene'){ toast(`${nombre}: ${elegido.preset.nombre} ya lo tiene, no se acumula`); return; }
  toast(`${nombre}: ${SelectorEstados.textoAgregado(r, 'hpTurno')}${r.disparo ? ` · ya ${r.disparo.hp < 0 ? 'sacó' : 'curó'} ${fmt(Math.abs(r.disparo.hp))} HP` : ''}`);
}

// ⚙ de un estado: abre su editor en la ficha o en gm-tools (se busca por
// nombre, porque el resumen no guarda el id del estado). Las invocaciones
// no tienen editor individual de estado: solo reabre su Botonera (el
// estado se saca con × ahí mismo).
function abrirEditarEstado(t, nombre){
  if(!puedeAgregarEstado(t)) return;
  if(t.tipo === 'creep') abrirEditarEstadoCreepMapa(t.fichaId, nombre);   // el editor común en el mapa (js/12, A6c)
  else{
    const invId = t.fichaId.includes(SEP_INVOCACION) ? t.fichaId.split(SEP_INVOCACION)[1] : '';
    // Personaje: el editor común en el mapa (js/11, A6b). Una invocación no tiene editor de estado individual (como en la ficha):
    // se abre su Botonera, donde se le sacan.
    if(invId) abrirBotonera(t.fichaId.split(SEP_INVOCACION)[0], undefined, invId);
    else abrirEditarEstadoMapa(t.fichaId, nombre);
  }
}

// Estados alterados desde el HUD: sacar uno o cambiarle los turnos.
// Vida extra / Vida extra: el texto puede ser un número, +N / -N o «max N» (comun/combatiente.js, igual que ficha y gm-tools).
function escudoParsear(txt, actual, max){ return Combatiente.escudoParsear(txt, actual, max); }
async function hudEstadoCambiar(t, indice, accion, delta){
  const v = vinculo(t);
  const lista = (v && v.resumen && v.resumen.estados) || [];
  const objetivo = lista[indice];
  if(!objetivo || !puedoCambiarEstados(t)) return;
  const tocar = arr => {
    const i = arr.findIndex(e => e && e.nombre === objetivo.nombre && e.activo !== false);
    if(i < 0) throw new Error('Ese estado ya no está');
    if(accion === 'quitar') arr.splice(i, 1);
    else if(accion === 'armadura'){
      // Armadura rota: -1 de Defensa por punto (stacks). Al llegar a 0 se repara (el estado se saca), igual que en la ficha.
      const e = arr[i], actual = Math.max(1, num(e.stacks) || 1);
      const n = leerValorVital(delta, actual);
      if(n === null) throw new Error('escribí un número, +N o -N');
      if(Math.round(n) <= 0) arr.splice(i, 1); else e.stacks = Math.round(n);
    }
    else if(accion === 'escudo'){
      const e = arr[i], neto = !!e.excedenteVida, actual = num(e.escudoMagicoActual ?? e.escudoMagico);
      const n = escudoParsear(delta, actual, neto ? null : num(e.escudoMagico));
      if(!n) throw new Error(neto ? 'escribí un número, +N o -N' : 'escribí un número, +N, -N o "max N"');
      e.escudoMagico = neto ? n.actual : n.max; e.escudoMagicoActual = n.actual;
    }
    else arr[i].turnos = Math.max(0, num(arr[i].turnos) + delta);
    return arr;
  };
  try{
    if(t.tipo === 'creep'){
      await modificarCreep(t.fichaId, sc => { sc.estados = tocar(Array.isArray(sc.estados) ? sc.estados : []); });
    }else{
      const [fichaId, invId] = t.fichaId.split(SEP_INVOCACION);
      const base = fbDb.doc(fbRutaCampana(`fichas/${fichaId}`));
      const parteRef = base.collection('partes').doc(invId ? 'invocaciones' : 'efectos');
      const ts = firebase.firestore.FieldValue.serverTimestamp();
      await fbDb.runTransaction(async tx => {
        const [parte, ficha] = await Promise.all([tx.get(parteRef), tx.get(base)]);
        if(!parte.exists || !ficha.exists) throw new Error('La ficha todavía no se guardó en la mesa');
        const datos = JSON.parse(parte.data().json || '{}');
        const cambios = {actualizado: ts};
        if(invId){
          const r = ficha.data().resumen || {};
          const inv = (datos.invocaciones || []).find(i => i && i.id === invId);
          if(!inv) throw new Error('La invocación ya no existe');
          inv.estados = tocar(Array.isArray(inv.estados) ? inv.estados : []);
          const resumenEstados = inv.estados.filter(e => e && e.activo !== false && e.nombre).slice(0, 30).map(e => ({
            nombre: String(e.nombre).slice(0, 60), turnos: num(e.turnos), permanente: !!e.permanente, ...(e.invulnerable ? {invulnerable: true} : {}), ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
            polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
            detalle: String(e.detalle || '').slice(0, 200),
          }));
          cambios['resumen.invocaciones'] = (r.invocaciones || []).map(i => i.id === invId ? {...i, estados: resumenEstados} : i);
        }else{
          datos.efectos = tocar(Array.isArray(datos.efectos) ? datos.efectos : []);
          cambios['resumen.estados'] = datos.efectos.filter(e => e && e.activo !== false && e.nombre).slice(0, 30).map(e => ({
            nombre: String(e.nombre).slice(0, 60), turnos: num(e.turnos), permanente: !!e.permanente, ...(e.invulnerable ? {invulnerable: true} : {}), ...((e.escudoMagicoActual !== undefined || num(e.escudoMagico) > 0) ? {escudo: num(e.escudoMagicoActual ?? e.escudoMagico), ...(e.excedenteVida ? {excedente: true, ...(e.excedenteTope ? {tope: num(e.excedenteTope)} : {})} : {escudoMax: num(e.escudoMagico)})} : {}), ...(e.armaduraRota ? {armaduraRota: true, stacks: Math.max(1, num(e.stacks) || 1)} : {}),
            polaridad: e.polaridad === 'buff' || e.polaridad === 'debuff' ? e.polaridad : '',
            detalle: String(e.detalle || '').slice(0, 200),
          }));
        }
        tx.set(parteRef, {json: JSON.stringify(datos), actualizado: ts});
        tx.update(base, cambios);
      });
    }
  }catch(err){
    console.error('No se pudo cambiar el estado:', err);
    toast(esCuotaAgotada(err) ? CUOTA_AGOTADA_TXT : err.code === 'permission-denied' ? 'No podés cambiar eso' : 'No se pudo cambiar el estado: ' + err.message);
  }
}

