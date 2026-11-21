/* comun/zona-detalle.js — 🔍 «Ver detalle» de lo que está puesto en el mapa (2026-11-20, dueño: «invoqué el Muro de fuego y después, cuando
   quería recordar bien qué hacía, tenía que ir a la ficha del personaje que lo invocó… me gustaría que al seleccionarlo, arriba, donde aparece el
   título, a la derecha, aparezca un botoncito que diga "ver detalle"»; «siempre primero el detalle de cuánto daño hace y en qué contexto, y
   después todo lo demás»).
   Lo puro: arma la tarjeta desde los DATOS del elemento (los mismos campos que lee el motor de zonas, vtt-hexgrid/js/08), sin texto escrito a mano
   por zona. Lo que el elemento no guarda se dice «a mano» (no se inventa). Qué se le muestra a cada pantalla (quién la puso, si está escondido; la
   descripción de la habilidad) lo decide el mapa (vtt-hexgrid/js/127-zona-detalle.js) y llega en `ctx`.
   ZonaDetalle.tiene(el) → ¿hay algo que contar? (zona, trampa, fuego, nube, portal, acelerador)
   ZonaDetalle.armar(el, ctx) → {icono, titulo, esencial, filas: [{k, v, aMano}], descripcion}
     ctx = {statLabel(id), estadoTexto(spec), elemento (del daño: 'fuego'…), elementoNombre ('fuego'), elementoRes ('al fuego'), quedan, quedanDe ('turnos de X' | ''), sinVencer,
            autor: {nombre, escondido, sinDato}, habilidad, descripcion, descripcionNo (por qué no se muestra), altura, cura: {cura, pulsos},
            superficie, magica (trampa), sola (trampa: afecta solo a quien la pisa), salva (trampa), rivalesTxt} */
const ZonaDetalle = (() => {
  const A_MANO = 'a mano';
  const s = n => (n === 1 ? '' : 's');
  const may = t => (t ? t.charAt(0).toUpperCase() + t.slice(1) : t);
  const json = t => { try{ const o = JSON.parse(t || '{}'); return o && typeof o === 'object' ? o : {}; }catch(e){ return {}; } };
  const pctDe = sp => { const p = Math.round(Number(sp && sp.pct)); return p > 0 && p < 100 ? p : 0; };
  const ICONOS = {fuego: '🔥', hielo: '❄', rayo: '⚡', toxico: '☠', acido: '🧪', luz: '☀', siniestro: '🌑'};

  function tiene(el){
    return !!(el && (el.zona || el.trampa || el.fuego || el.niebla || el.portal || el.townPortal || el.acelerador));
  }

  // El estado que deja, con sus turnos y su chance, en palabras. '' si no deja ninguno.
  function estadoTxt(sp, ctx){
    if(!sp || !sp.nombre) return '';
    const base = typeof ctx.estadoTexto === 'function' ? ctx.estadoTexto(sp) : sp.nombre + (Number(sp.turnos) > 0 ? ` (${sp.turnos} turno${s(Number(sp.turnos))})` : '');
    return base;
  }
  // A quién le pega una zona. El motor: nunca a quien la creó; con «fuego amigo» a todos los demás; si no, solo a sus rivales.
  function rivalesDe(el, ctx){
    if(ctx.rivalesTxt) return ctx.rivalesTxt;
    return el.zonaCasteadorTipo === 'creep' ? 'los personajes (y sus invocaciones)' : 'los creeps';
  }
  // Cuándo se dispara una zona, corto (para la frase de arriba) y largo (para la fila).
  function cuandoZona(el, sp, ctx){
    const paso = !!(sp.tiraPaso);
    if(paso) return {corto: 'en cada paso que dan adentro', largo: 'En cada paso que se da adentro (entrando o caminando por ella). Quedarse quieto no la dispara.'};
    const entra = el.zonaCadaPaso || el.trampa ? 'al entrar o cruzarla' : 'al entrar';
    const mant = el.zonaEnMantenimiento !== false;
    const largo = [el.trampa ? 'Al detonar la trampa (a los que están adentro)' : '', el.zonaInmediata ? 'Al aparecer (a los que ya estaban adentro)' : '',
      el.zonaCadaPaso || el.trampa ? 'Al entrar, aunque solo se la cruce de paso' : 'Al entrar (terminando el movimiento adentro)',
      mant ? 'Mientras se siga adentro, cada vez que se pasa de ronda (el Mantenimiento)' : 'Quedarse quieto adentro NO la vuelve a disparar',
      'Moverse por adentro no la vuelve a disparar'].filter(Boolean).join('. ') + '.';
    return {corto: mant ? `${entra} y, mientras sigan adentro, cada vez que se pasa de ronda` : entra, largo};
  }

  /* La frase corta del cartel de arriba de una zona (vtt-hexgrid/js/10, `etiquetaElemento`): cuándo afecta, con la misma lógica que la fila
     «Cuándo se dispara» de la tarjeta (2026-11-21, visto en el mapa: el cartel decía siempre «la sufre quien entra y quien sigue adentro en el
     Mantenimiento», también para el hielo de una varita —que solo se dispara al caminar—, una zona de curación o una que solo importa al entrar). */
  function cuandoEtiqueta(el, ctx){
    ctx = ctx || {};
    const sp = json(el.zonaEstado), sup = typeof sp.superficie === 'string' ? sp.superficie : '';
    if(ctx.cura) return 'cura a los aliados de quien la puso que estén adentro, en cada pulso';
    if(sup === 'agua' && !sp.nombre) return 'no hace daño por sí sola: a quien está parado acá, el rayo le pega más';
    if(el.zonaLuz && !sp.nombre && !el.zonaDano && !el.zonaDanoDif) return 'ilumina: deja ver lo que hay adentro';
    // Lo demás sale de la MISMA cuenta que la tarjeta (cuandoZona): así el cartel y «Ver detalle» no pueden decir cosas distintas.
    const c = cuandoZona(el, sp, ctx).corto;
    return `se dispara ${c}${sp.tiraPaso ? ' (quedarse quieto no la dispara)' : el.zonaEnMantenimiento === false ? ' (quedarse quieto adentro no la vuelve a disparar)' : ''}`;
  }

  function filaAutor(el, ctx, filas){
    const a = ctx.autor || {};
    const hab = ctx.habilidad || '';
    let v;
    if(a.escondido) v = 'No se sabe: quien la puso no está a la vista.';
    else if(a.nombre) v = a.nombre;
    else v = '';
    if(v) filas.push({k: 'De quién es', v});
    else filas.push({k: 'De quién es', v: `La zona no guarda quién la puso (${A_MANO}).`, aMano: true});
    if(hab) filas.push({k: 'Con qué se puso', v: hab});
    else filas.push({k: 'Con qué se puso', v: `No lo guarda (${A_MANO}).`, aMano: true});
  }
  function filaQueda(el, ctx, filas){
    const q = Number.isFinite(ctx.quedan) ? Math.max(0, Math.round(ctx.quedan)) : null;
    if(q === null) filas.push({k: 'Cuánto le queda', v: 'No tiene turnos contados: queda hasta que alguien la saque.'});
    else filas.push({k: 'Cuánto le queda', v: `${q} turno${s(q)}${ctx.quedanDe ? ` (${ctx.quedanDe})` : ' (cuenta cada vez que se pasa de ronda)'}${q === 0 ? ': se va después de su efecto de esta ronda' : ''}.`});
  }
  function filaDescripcion(ctx){
    if(ctx.descripcion) return String(ctx.descripcion).replace(/\s*⚙[\s\S]*$/, '').replace(/\s+/g, ' ').trim();   // (lo técnico, «⚙ Automatizado…», no: va en el Ver de la habilidad)
    return '';
  }

  function armarZona(el, ctx){
    const sp = json(el.zonaEstado), filas = [];
    const lbl = id => (typeof ctx.statLabel === 'function' && ctx.statLabel(id)) || id;
    const nombre = el.zonaNombre || 'Efecto persistente';
    const sup = typeof sp.superficie === 'string' ? sp.superficie : '';
    const cura = ctx.cura || null;
    const elem = ctx.elemento || '';
    let icono = ICONOS[elem] || '🌫', esencial;
    const rivales = rivalesDe(el, ctx);
    const quienes = el.zonaAmiga ? 'a cualquiera' : `a ${rivales}`;
    const cuando = cuandoZona(el, sp, ctx);
    const est = estadoTxt(sp, ctx), pct = pctDe(sp);
    const tipoD = String(el.zonaDanoTipo || '').toLowerCase().replace(/^de\s+/, '');
    const danoTipo = !tipoD ? '' : /^(t[oó]xico|arcano|f[ií]sico|[aá]cido|siniestro|sagrado|m[aá]gico|directo|el[eé]ctrico)/.test(tipoD) ? ` ${tipoD}` : ` de ${tipoD}`;
    const dano = el.zonaDanoDif ? `daño${danoTipo} igual a la diferencia entre las dos tiradas${el.zonaDano ? ` + ${el.zonaDano}` : ''}` : el.zonaDano ? `${el.zonaDano} de daño${danoTipo}` : '';

    if(cura){
      icono = '💚';
      esencial = `Cura ${cura.cura} de vida a los aliados de quien la puso que estén adentro, en cada pulso (${cura.pulsos} pulso${s(cura.pulsos)}: el primero al ponerla y después al empezar cada turno de quien la puso).`;
    }else if(sup === 'agua' && !sp.nombre){
      icono = '💧';
      esencial = 'No hace daño por sí sola: a quien está parado acá, el rayo le pega ×1,5 y la Parálisis le entra con el doble de chance (salvo que vuele o levite).';
    }else if(el.zonaLuz && !sp.nombre && !dano){
      icono = '💡';
      esencial = 'Ilumina: deja ver lo que hay adentro (también las trampas y lo que está escondido). No hace daño.';
    }else{
      if(sup === 'hielo') icono = '🧊';
      const efecto = [dano, est ? `${pct ? `${pct} % de chance de ` : ''}${est}` : ''].filter(Boolean).join(' y ');
      const tabla = sp.porTirada && el.zonaTiraExtra ? `un efecto según una tirada de ${el.zonaTiraExtra}` : '';
      const que = [efecto, tabla].filter(Boolean).join(', más ');
      if(que) esencial = `${may(que)} ${quienes}: ${cuando.corto}${el.zonaResistStat ? ` (si no la resisten con ${lbl(el.zonaResistStat)})` : ''}.`;
      else if(sp.revela) esencial = `Deja a la vista ${quienes}: ${cuando.corto}. No hace daño.`;
      else esencial = `Esta zona no guarda ningún daño ni estado: su efecto se resuelve ${A_MANO}.`;
    }

    // Fuego amigo.
    if(cura) filas.push({k: 'Fuego amigo', v: 'No aplica: solo cura a los aliados de quien la puso.'});
    else if(el.zonaAmiga) filas.push({k: 'Fuego amigo', v: 'SÍ. Le pega a cualquiera que entre: también a los aliados de quien la puso. A quien la puso, no.'});
    else filas.push({k: 'Fuego amigo', v: `NO. Solo le pega a ${rivales}. Los aliados de quien la puso, y él mismo, pasan sin que les haga nada.`});
    filaAutor(el, ctx, filas);
    filaQueda(el, ctx, filas);
    if(!cura && !(sup === 'agua' && !sp.nombre)) filas.push({k: 'Cuándo se dispara', v: cuando.largo});
    // Tirada para evitarla.
    if(!cura){
      if(sp.duelo && el.zonaResistStat) filas.push({k: 'Tirada para evitarla', v: `Un duelo en el cuadro de siempre: ${lbl(el.zonaTiraStat || 'dmgesp')} de quien la puso contra ${lbl(el.zonaResistStat)} de quien está adentro. Cada uno tira lo suyo.`});
      else if(el.zonaResistStat && el.zonaTiraStat && Number.isFinite(el.zonaTiraValor)) filas.push({k: 'Tirada para evitarla',
        v: `Quien entra tira ${lbl(el.zonaResistStat)}; la zona tira ${lbl(el.zonaTiraStat)} (${el.zonaTiraValor}, el de quien la puso al ponerla), una tirada nueva cada vez. Hay que superarla: el empate lo gana la zona. Quien resiste no recibe nada.`});
      else if(el.zonaResistStat && Number.isFinite(el.zonaResistValor)) filas.push({k: 'Tirada para evitarla',
        v: `Quien entra tira ${lbl(el.zonaResistStat)} y tiene que llegar a ${el.zonaResistValor}. Quien resiste no recibe nada.`});
      else if(esencial && !/a mano/.test(esencial) && !(el.zonaLuz && !sp.nombre && !dano) && !(sup === 'agua' && !sp.nombre)) filas.push({k: 'Tirada para evitarla', v: 'No tiene: entra directo.'});
    }
    // El estado que deja.
    if(est){
      const extra = [pct ? `Chance: ${pct} % (se tira a la vista).` : 'Entra siempre (sin chance aparte).',
        sp.sumaUno || sp.resetea ? `Si ya lo tiene, cada vez que se dispara le suma 1 stack en vez de tirar de nuevo.` : sp.unaVez ? 'Una vez que lo tiene, la zona ya no le vuelve a tirar.' : '',
        sp.renuevaPaso ? 'A quien ya lo tiene, cada paso adentro se lo renueva.' : ''].filter(Boolean).join(' ');
      filas.push({k: 'Estado que deja', v: `${est}. ${extra}`});
    }else if(!cura && esencial && !/a mano/.test(esencial) && dano) filas.push({k: 'Estado que deja', v: 'Ninguno guardado en la zona.'});
    if(sp.porTirada && el.zonaTiraExtra) filas.push({k: 'Tirada extra', v: `Si el daño entra, quien la puso tira ${el.zonaTiraExtra} y lo que sale decide un efecto más${ctx.porTiradaTxt ? `: ${ctx.porTiradaTxt}` : ''}.`});
    // Qué frena el daño.
    if(dano){
      const fr = [];
      if(!el.zonaIgnoraDef) fr.push('Le resta la Defensa.');
      else if(el.zonaDirecto) fr.push('No lo frenan la Defensa ni la Defensa especial (va directo).');
      else if(el.zonaCasteadorRef || elem) fr.push('La Defensa común no; la Defensa especial sí.');
      else fr.push('Nada: va directo a la vida.');
      if(elem) fr.push(`Sí le resta la resistencia ${ctx.elementoRes || 'a ' + elem}.`);
      if(ctx.altura === 'piso') fr.push('También la Suela gruesa.');
      if(el.zonaDano && /d/i.test(el.zonaDano)) fr.push('El daño lo tira quien la puso (o el GM por él).');
      filas.push({k: 'Qué frena el daño', v: fr.join(' ')});
    }
    if(ctx.altura === 'piso') filas.push({k: 'Altura', v: 'Es del piso: a quien vuela o levita no lo toca.'});
    else if(ctx.altura === 'ambos') filas.push({k: 'Altura', v: 'Piso y aire: también le pega a quien vuela o levita.'});
    if(el.zonaNota) filas.push({k: 'Nota de la zona', v: String(el.zonaNota)});
    return {icono, titulo: nombre, esencial, filas, descripcion: filaDescripcion(ctx), descripcionNo: ctx.descripcionNo || ''};
  }

  function armarTrampa(el, ctx){
    const e = json(el.trampaEstado), filas = [];
    const lbl = id => (typeof ctx.statLabel === 'function' && ctx.statLabel(id)) || id;
    const nombre = el.trampaNombre || 'Trampa sin nombre';
    const elem = ctx.elemento || e.elemento || '';
    const sola = ctx.sola !== undefined ? !!ctx.sola : true;
    const est = estadoTxt(e, ctx), pct = pctDe(e);
    const dano = el.trampaDano ? `${el.trampaDano} de daño${elem ? ` de ${ctx.elementoNombre || elem}` : ''}` : '';
    const efecto = [dano, est ? `${pct ? `${pct} % de chance de ` : ''}${est}` : '', el.trampaDestino ? 'lo teletransporta a otro punto' : (e.portal ? `lo lleva por un portal a otra casilla${Number(e.portal.rango) > 0 ? ` (hasta ${Number(e.portal.rango)} de distancia)` : ''}` : '')].filter(Boolean).join(' y ');
    const aQuien = sola ? 'a quien la pisa' : 'a todos los que estén en su área';
    let esencial;
    if(el.disparada) esencial = `Ya se disparó: como trampa no hace nada más${el.zona ? ' (lo que dejó puesto se cuenta abajo)' : ''}.`;
    else if(efecto) esencial = `${may(efecto)} ${aQuien}, cuando la pisa un rival de quien la puso.`;
    else esencial = `Se dispara cuando la pisa un rival de quien la puso; su efecto no está cargado en la trampa: se resuelve ${A_MANO}.`;
    if(!sola) filas.push({k: 'Fuego amigo', v: el.fuegoAmigo ? 'SÍ. Solo la disparan los rivales de quien la puso, pero al dispararse le pega a todos los que estén en su área, aliados incluidos.'
      : 'NO. La disparan los rivales de quien la puso y solo les pega a ellos (y a quien la pisó).'});
    else filas.push({k: 'Fuego amigo', v: 'NO. Los aliados de quien la puso no la disparan: pasan por encima sin que les haga nada.'});
    filaAutor(el, ctx, filas);
    filas.push({k: 'Cuándo se dispara', v: `Al pisarla un rival de quien la puso (corta su movimiento ahí).${e.disparo === 'centro' || e.dc ? ' Solo si pisa la casilla del centro: las demás no la activan, aunque el efecto las alcanza.' : ''} Es de un solo uso.`});
    const sv = ctx.salva || (e.salva && e.salva.stat ? e.salva : null);
    if(sv) filas.push({k: 'Tirada para evitarla', v: `Quien la pisa tira ${sv.etq || lbl(sv.stat)} y tiene que llegar a ${sv.dif}. Si llega, ${sv.que === 'mitad' ? 'recibe la mitad del daño' : sv.que === 'efecto' ? 'recibe el daño pero no el estado' : 'no le pasa nada'}${sv.logra ? ` (${sv.logra})` : ''}.`});
    else if(!el.disparada) filas.push({k: 'Tirada para evitarla', v: efecto ? 'No tiene: entra directo.' : `No está cargada en la trampa (${A_MANO}).`, aMano: !efecto});
    if(est) filas.push({k: 'Estado que deja', v: `${est}. ${pct ? `Chance: ${pct} %.` : 'Entra siempre (sin chance aparte).'}${e.requiereDano ? ' Solo si el daño pasó la Defensa.' : ''}`});
    if(dano) filas.push({k: 'Qué frena el daño', v: `${el.trampaIgnoraDef ? 'La Defensa no (va directo a la vida)' : 'La Defensa'}${elem ? `, y la resistencia ${ctx.elementoRes || 'a ' + elem}` : ''}.`});
    filas.push({k: 'Tipo', v: ctx.magica ? '✨ Mágica: se desarma o se disipa con el Efecto especial.' : '⚙ Mecánica: se desarma con la Destreza.'});
    if(Number.isFinite(ctx.quedan)) filaQueda(el, ctx, filas);
    return {icono: el.disparada ? '💥' : '🪤', titulo: nombre, esencial, filas, descripcion: String(el.trampaDetalle || '').replace(/\s+/g, ' ').trim(), descripcionNo: ''};
  }

  function armar(el, ctx){
    ctx = ctx || {};
    if(!el) return null;
    if(el.trampa){
      const t = armarTrampa(el, ctx);
      // La zona que dejó al dispararse (efecto persistente): se cuenta debajo, con sus propios datos.
      if(el.zona && el.disparada){
        const z = armarZona(el, ctx);
        t.esencial = `Ya se disparó. Dejó una zona: ${z.esencial.charAt(0).toLowerCase() + z.esencial.slice(1)}`;
        t.icono = z.icono === '🌫' ? '💥' : z.icono;
        t.filas = [...z.filas.filter(f => f.k !== 'Con qué se puso' && f.k !== 'De quién es'), ...t.filas.filter(f => f.k === 'De quién es' || f.k === 'Tipo')];
      }
      return t;
    }
    if(el.zona) return armarZona(el, ctx);
    const filas = [];
    if(el.fuego){
      const d = Math.round(Number(el.fuegoDano)) || 5;
      filas.push({k: 'Fuego amigo', v: 'SÍ. Quema a cualquiera que lo pise: personajes, invocaciones y creeps.'});
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      filas.push({k: 'Cuándo se dispara', v: 'Al entrar (cada vez que se entra viniendo de afuera) y, mientras se siga adentro, cada vez que se pasa de ronda (el Mantenimiento).'});
      filas.push({k: 'Tirada para evitarla', v: 'No tiene: entra directo.'});
      filas.push({k: 'Qué frena el daño', v: 'La Defensa no (va directo a la vida). Es del piso: a quien vuela o levita no lo toca.'});
      return {icono: '🔥', titulo: 'Terreno en llamas', esencial: `${d} de daño de fuego a cualquiera: al entrar y, mientras siga adentro, cada vez que se pasa de ronda.`, filas, descripcion: '', descripcionNo: ''};
    }
    if(el.niebla){
      filas.push({k: 'Fuego amigo', v: 'No aplica: no le pega a nadie. Tapa la vista para todos por igual.'});
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      filas.push({k: 'Cuándo se dispara', v: 'No se dispara: vale mientras esté puesta.'});
      filas.push({k: 'Estado que deja', v: 'Ninguno. (Si la habilidad que la puso además deja a alguien en Sigilo o le permite moverse, eso no queda guardado en la nube.)'});
      return {icono: '☁', titulo: ctx.habilidad || 'Nube', esencial: 'No hace daño: tapa la vista. Quien está adentro no se ve desde afuera (solo lo ve quien está pegado), y no se puede ver a través de ella.', filas, descripcion: filaDescripcion(ctx), descripcionNo: ctx.descripcionNo || ''};
    }
    if(el.portal || el.townPortal){
      filas.push({k: 'Fuego amigo', v: 'No aplica: no hace daño.'});
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      return {icono: '🌀', titulo: el.townPortal ? 'Town portal' : 'Portal', esencial: el.townPortal ? 'No hace daño: al pisarlo, lleva al pueblo.' : 'No hace daño: a los aliados de quien lo abrió, al pisarlo, los pasa al otro portal (gratis). Los rivales pasan de largo.', filas, descripcion: '', descripcionNo: ''};
    }
    if(el.acelerador){
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      return {icono: '⏩', titulo: 'Acelerador', esencial: `No hace daño: quien empieza su turno acá recibe ${Math.round(Number(el.acelerador))} No2 extra.`, filas, descripcion: '', descripcionNo: ''};
    }
    return null;
  }

  return {tiene, armar, cuandoEtiqueta, A_MANO};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = ZonaDetalle;
