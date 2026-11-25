/* comun/zona-detalle.js — 🔍 «Ver detalle» de lo que está puesto en el mapa (2026-11-20, dueño: «invoqué el Muro de fuego y después, cuando
   quería recordar bien qué hacía, tenía que ir a la ficha del personaje que lo invocó… me gustaría que al seleccionarlo, arriba, donde aparece el
   título, a la derecha, aparezca un botoncito que diga "ver detalle"»; «siempre primero el detalle de cuánto daño hace y en qué contexto, y
   después todo lo demás»).
   Lo puro: arma la tarjeta desde los DATOS del elemento (los mismos campos que lee el motor de zonas, vtt-hexgrid/js/08), sin texto escrito a mano
   por zona. Lo que el elemento no guarda se dice «a mano» (no se inventa). Qué se le muestra a cada pantalla (quién la puso, si está escondido; la
   descripción de la habilidad) lo decide el mapa (vtt-hexgrid/js/127-zona-detalle.js) y llega en `ctx`.
   ZonaDetalle.tiene(el) → ¿hay algo que contar? (zona, trampa, fuego, nube, portal, acelerador)
   ZonaDetalle.armar(el, ctx) → {icono, titulo, esencial, filas: [{k, v, aMano}], descripcion}
   ZonaDetalle.html(m, {glosario, cargando}) → la tarjeta en HTML, con los términos del glosario marcados una sola vez (2026-11-22)
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

  /* 🔥 Qué frena el daño de una zona (2026-11-23, dueño: «en el Muro de fuego, si bien no se resiste, el daño sí lo frena la resistencia al fuego»).
     La MISMA cuenta que hace el mapa al aplicarlo (vtt-hexgrid/js/08 `zonaResolverBanner` → el cuadro del duelo, js/13 `dueloAplicarDano`): sin
     «ignora la Defensa», la Defensa; si la ignora, la Defensa especial (salvo el daño directo, y las zonas del GM sin elemento, que van directo);
     siempre la resistencia a su elemento; y la Suela gruesa si es SOLO del piso (`altura` 'piso'; desde el 2026-11-25, «piso y aire» no). → {defensa: 'Defensa' | 'Defensa especial' | '',
     directo, elemento, res (el nombre: «resistencia al fuego»), suela}. */
  const RES_NOMBRE = {fuego: 'al fuego', hielo: 'al hielo', rayo: 'eléctrica', toxico: 'a lo tóxico', acido: 'al ácido', luz: 'a la luz', siniestro: 'a lo siniestro'};
  const resNombre = elem => elem ? `resistencia ${RES_NOMBRE[elem] || 'a ' + elem}` : '';
  function frenoDe(el, o){
    o = o || {};
    const elem = o.elemento || '';
    const defensa = !el.zonaIgnoraDef ? 'Defensa' : (!el.zonaDirecto && (el.zonaCasteadorRef || elem)) ? 'Defensa especial' : '';
    return {defensa, directo: !!el.zonaIgnoraDef && !defensa, elemento: elem, res: resNombre(elem), suela: o.altura === 'piso'};
  }
  /* Lo corto, para el cartel y el renglón de «Empieza tu turno»: «lo frena su resistencia al fuego» / «lo frenan su Defensa especial y su resistencia
     al hielo». o = {elemento, res (la de quien lo recibe, si se puede mostrar: un personaje), suela (la Suela gruesa de quien lo recibe, si la tiene),
     sinNumero (P297: la pantalla es del bando rival de quien lo recibe: «lo frena su resistencia al fuego (es resistente)», «es inmune al fuego»)}.
     Con resistencia 99 o más, «es inmune al fuego». '' si no lo frena nada (sin contar escudos ni Invulnerable). */
  const INMUNE_A = {fuego: 'al fuego', hielo: 'al hielo', rayo: 'a lo eléctrico', toxico: 'a lo tóxico', acido: 'al ácido', luz: 'a la luz', siniestro: 'a lo siniestro'};
  function frenoCorto(el, o){
    o = o || {};
    const f = frenoDe(el, {elemento: o.elemento});
    const hayRes = o.res !== undefined && o.res !== null && o.res !== '' && Number.isFinite(Number(o.res)), res = Number(o.res);
    // 🔥 (P297, 2026-11-23) `o.sinNumero`: lo ve el bando rival de quien lo recibe — «es resistente», «es inmune», «es vulnerable», sin cuánto.
    const sinN = !!o.sinNumero;
    if(f.res && hayRes && res >= 99) return sinN ? `es inmune ${INMUNE_A[f.elemento] || 'a ese daño'}` : `es inmune ${INMUNE_A[f.elemento] || 'a ese daño'}: su ${f.res} es ${res}`;
    const resTxt = !hayRes || res === 0 ? '' : sinN ? (res < 0 ? ' (es vulnerable: le entra de más)' : ' (es resistente)') : (res < 0 ? ` −${-res}, vulnerable: le entra de más` : ` ${res}`);
    // 🔥 (P300, dueño, 2026-11-23, opción a) Con resistencia 0 a ese elemento (y se sabe), no la nombra: «le entra 1d4 de daño de fuego». Sin el número
    // (una invocación, o un creep que los jugadores no descubrieron), como antes: se nombra sin cuánto.
    const sinRes = hayRes && res === 0;
    const cosas = [f.defensa ? `su ${f.defensa}` : '', f.res && !sinRes ? `su ${f.res}${resTxt}` : '',
      Number(o.suela) > 0 ? `su Suela gruesa ${Math.round(Number(o.suela))}` : ''].filter(Boolean);
    if(!cosas.length) return '';
    return `${cosas.length === 1 ? 'lo frena' : 'lo frenan'} ${cosas.length === 1 ? cosas[0] : cosas.slice(0, -1).join(', ') + ' y ' + cosas[cosas.length - 1]}`;
  }

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
    // 🌋 Una vez por paso (2026-11-25, el Chorro de lava): al entrar, por cada paso adentro y al empezar su turno adentro.
    if(!paso && sp.porPaso){
      const mant = el.zonaEnMantenimiento !== false, turno = !!sp.alEmpezar && mant;
      return {corto: `al entrar, en cada paso que dan adentro${turno ? ' y al empezar su turno adentro' : mant ? ' y, mientras sigan adentro, cada vez que se pasa de ronda' : ''}`,
        largo: [el.zonaInmediata ? 'Al aparecer (a los que ya estaban adentro)' : '', 'En cada paso que se da adentro (entrando o caminando por ella): una vez por paso',
          turno ? 'Al empezar su turno adentro (con orden de turnos; sin orden de turnos, cada vez que se pasa de ronda)' : mant ? 'Mientras se siga adentro, cada vez que se pasa de ronda (el Mantenimiento)' : 'Quedarse quieto adentro NO la vuelve a disparar'].filter(Boolean).join('. ') + '.'};
    }
    if(paso) return {corto: 'en cada paso que dan adentro', largo: 'En cada paso que se da adentro (entrando o caminando por ella). Quedarse quieto no la dispara.'};
    const entra = el.zonaCadaPaso || el.trampa ? 'al entrar o cruzarla' : 'al entrar';
    const mant = el.zonaEnMantenimiento !== false;
    // 🔥 «Al empezar su turno adentro» (P259, 2026-11-21: el Muro de fuego): con orden de turnos, en el turno de cada uno; sin orden, al pasar de ronda.
    if(sp.alEmpezar && mant) return {corto: `${entra} y al empezar su turno adentro`,
      largo: [el.trampa ? 'Al detonar la trampa (a los que están adentro)' : '', el.zonaInmediata ? 'Al aparecer (a los que ya estaban adentro)' : '', el.zonaCadaPaso || el.trampa ? 'Al entrar, aunque solo se la cruce de paso' : 'Al entrar (terminando el movimiento adentro)',
        'Al empezar su turno adentro (con orden de turnos; sin orden de turnos, cada vez que se pasa de ronda)', 'Moverse por adentro no la vuelve a disparar',
        // 💤 (P295, 2026-11-25) La nube de estado de una trampa (el Gas adormecedor y el somnífero): quien ya lo tiene vuelve a tirar al empezar su turno.
        el.trampa && sp.nombre && !el.zonaDano && !el.zonaDanoDif ? `Quien ya tiene ${sp.nombre} vuelve a tirar al empezar su turno adentro: si no resiste, ${sp.nombre} vuelve a contar sus turnos desde ahí (no se suma)` : ''].filter(Boolean).join('. ') + '.'};
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

  // `quien`: cómo se nombra a quien lo puso ('quien la puso' en una zona; 'quien lo clavó' en un tótem o un estandarte).
  function filaAutor(el, ctx, filas, quien){
    quien = quien || 'quien la puso';
    const a = ctx.autor || {};
    const hab = ctx.habilidad || '';
    let v;
    if(a.escondido) v = `Alguien (${quien} no está a la vista).`;
    else if(a.nombre) v = a.nombre;
    else v = '';
    if(v) filas.push({k: 'De quién es', v});
    else filas.push({k: 'De quién es', v: `La zona no guarda quién la puso (${A_MANO}).`, aMano: true});
    if(ctx.habilidadOculta) filas.push({k: 'Con qué se puso', v: `No se sabe: ${quien} no está a la vista.`});
    else if(hab) filas.push({k: 'Con qué se puso', v: hab});
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

  /* 🔥 El texto del cartel de una zona SIN tirada para resistir (vtt-hexgrid/js/08, `renderZonaBanner`; 2026-11-21, visto en el mapa con el Muro de
     fuego: decía «No hay nada que tirar: se aplica lo que deja la zona» y después quien la puso tiraba 3d4 de daño). Dice qué entra y, si el daño
     tiene dados, quién lo tira. o = {estadoTexto(spec), quienTira (nombre de quien tira el daño; '' si no se nombra; null = el daño sale solo, sin cuadro)}. */
  function sinTiradaTexto(el, o){
    o = o || {};
    const sp = json(el.zonaEstado), est = estadoTxt(sp, o), pct = pctDe(sp);
    const tipoD = String(el.zonaDanoTipo || '').toLowerCase().replace(/^de\s+/, '');
    const danoTipo = !tipoD ? '' : /^(t[oó]xico|arcano|f[ií]sico|[aá]cido|siniestro|sagrado|m[aá]gico|directo|el[eé]ctrico)/.test(tipoD) ? ` ${tipoD}` : ` de ${tipoD}`;
    const freno = el.zonaDano && !el.zonaDanoDif ? frenoCorto(el, o) : '';   // 🔥 (2026-11-23) lo que lo frena: no se esquiva, pero no entra entero
    const dano = el.zonaDano && !el.zonaDanoDif ? `${el.zonaDano} de daño${danoTipo}${freno ? ` (${freno})` : ''}` : '';
    const que = [dano, est ? `${pct ? `${pct} % de chance de ` : ''}${est}` : ''].filter(Boolean).join(' y ');
    if(!que) return 'No hay nada que tirar para esquivarla: se aplica lo que deja la zona.';
    const tira = dano && /d/i.test(String(el.zonaDano)) && o.quienTira !== null ? (o.quienTira ? ` El daño lo tira ${o.quienTira}.` : ' El daño se tira en el cuadro del duelo.') : '';
    return `No hay tirada para esquivarla: le entra ${que}.${tira}`;
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
      else if(esencial && !/a mano/.test(esencial) && !(el.zonaLuz && !sp.nombre && !dano) && !(sup === 'agua' && !sp.nombre)) filas.push({k: 'Tirada para evitarla', v: dano ? 'No tiene: no se puede esquivar (lo que frena el daño, más abajo).' : 'No tiene: entra directo.'});
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
      // 🔥 (2026-11-23) la misma cuenta que el mapa al aplicarlo (frenoDe): la resistencia a su elemento siempre; la Suela gruesa, solo en lo que es solo del piso (2026-11-25).
      const fr = [], f = frenoDe(el, {elemento: elem, altura: ctx.altura});
      if(f.defensa === 'Defensa') fr.push('Le resta la Defensa.');
      else if(f.defensa) fr.push('La Defensa común no; la Defensa especial sí.');
      else if(el.zonaDirecto) fr.push('No lo frenan la Defensa ni la Defensa especial (va directo).');
      else fr.push(elem ? 'No lo frenan la Defensa ni la Defensa especial (va directo).' : 'Nada: va directo a la vida.');
      if(elem) fr.push(`Sí le resta la ${f.res} de quien lo recibe (con 99 o más, es inmune; si es negativa, entra de más).`);
      // Sin la Suela gruesa (dueño, 2026-11-24): «Ver detalle» dice las reglas generales, no cada caso específico de una pieza.
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
    const filas = [];
    // 🔥 El terreno incendiado primero: el mapa le suma los campos de una zona (P295, 2026-11-25), pero se cuenta como lo que es.
    if(el.fuego && !el.trampa){
      const d = Math.round(Number(el.fuegoDano)) || 5;
      filas.push({k: 'Fuego amigo', v: 'SÍ. Quema a cualquiera que lo pise: personajes, invocaciones y creeps.'});
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      filas.push({k: 'Cuándo se dispara', v: 'Al entrar (también si solo lo cruza) y al empezar su turno adentro. Sin orden de turnos, cada vez que se pasa de ronda (el Mantenimiento).'});
      filas.push({k: 'Tirada para evitarla', v: 'No tiene: entra directo.'});
      filas.push({k: 'Qué frena el daño', v: 'Nada: va directo a la vida (ni la Defensa ni la Defensa especial). Es del piso y del aire: también quema a quien vuela o levita, y la Suela gruesa no lo frena.'});
      return {icono: '🔥', titulo: 'Terreno en llamas', esencial: `${d} de daño de fuego a cualquiera: al entrar y al empezar su turno adentro.`, filas, descripcion: '', descripcionNo: ''};
    }
    if(el.zona) return armarZona(el, ctx);
    if(el.niebla){
      filas.push({k: 'Fuego amigo', v: 'No aplica: no le pega a nadie. Tapa la vista para todos por igual.'});
      filaAutor(el, ctx, filas); filaQueda(el, ctx, filas);
      filas.push({k: 'Cuándo se dispara', v: 'No se dispara: vale mientras esté puesta.'});
      filas.push({k: 'Estado que deja', v: 'Ninguno. (Si la habilidad que la puso además deja a alguien en Sigilo o le permite moverse, eso no queda guardado en la nube.)'});
      return {icono: '☁', titulo: (!ctx.habilidadOculta && ctx.habilidad) || 'Nube', esencial: 'No hace daño: tapa la vista. Quien está adentro no se ve desde afuera (solo lo ve quien está pegado), y no se puede ver a través de ella.', filas, descripcion: filaDescripcion(ctx), descripcionNo: ctx.descripcionNo || ''};
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

  /* 🚩🤐 «Ver detalle» de un tótem o un estandarte (P259 (4), dueño, 2026-11-22): son tokens (un creep quieto, vtt-hexgrid/js/73), no zonas, pero la
     tarjeta es la misma. e = {radio, pdg, dano, silencio}; ctx = {autor: {nombre, corto, escondido}, habilidad, habilidadOculta, vida ('12 / 20' | '60 %' | ''),
     bando: 'creep' | 'pj' (de qué lado está el tótem), nombre (el del token)}. → el mismo modelo que armar(). */
  function armarInerte(e, ctx){
    ctx = ctx || {};
    if(!e || !(Number(e.radio) > 0)) return null;
    const r = Math.round(Number(e.radio)), filas = [], sil = !!e.silencio;
    const aliados = ctx.bando === 'pj' ? 'los personajes y sus invocaciones' : 'los creeps';
    const rivales = ctx.bando === 'pj' ? 'los creeps' : 'los personajes y sus invocaciones';
    const area = `a ${r} casilla${s(r)} o menos (diámetro ${2 * r + 1})`;
    const quien = ctx.autor && ctx.autor.escondido ? 'quien lo clavó' : (ctx.autor && (ctx.autor.corto || ctx.autor.nombre)) || 'quien lo clavó';   // (corto: sin el «(creep)» de la fila)
    const esencial = sil ? `Los rivales de ${quien} (${rivales}) ${area} no pueden usar habilidades que cuestan SP, mientras siga en pie.`
      : `Los aliados de ${quien} (${aliados}) ${area} suman +${Math.round(Number(e.pdg) || 0)} a la Probabilidad de Golpe y +${Math.round(Number(e.dano) || 0)} al daño, mientras siga en pie.`;
    filas.push({k: 'A quién afecta', v: sil ? `Solo a los rivales de ${quien} (${rivales}) que estén adentro del aura. A sus aliados, no.`
      : `Solo a los aliados de ${quien} (${aliados}) que estén adentro del aura (él incluido). A los rivales, no. Si hay varios estandartes, vale el mejor (no se suman).`});
    filaAutor({}, ctx, filas, 'quien lo clavó');
    filas.push({k: 'Cuánto dura', v: 'No tiene turnos contados: queda hasta que lo rompan (al llegar a 0 de vida se va del mapa). Si quien lo clavó clava otro igual, el anterior se va.'});
    filas.push({k: 'Cuándo vale', v: sil ? 'Todo el tiempo, mientras esté en pie: el mapa avisa al querer usar una habilidad que cuesta SP adentro del aura (y deja seguir si la mesa lo decide).'
      : 'Todo el tiempo, mientras esté en pie: el bonus se suma solo al atacar desde adentro del aura (el cuadro del duelo lo muestra «🚩 bajo el estandarte»).'});
    filas.push({k: 'Cómo se rompe', v: `Se le pega como a cualquier rival: no esquiva (Evasión 1), no tiene Defensa ni resistencias${ctx.vida ? ` · Vida: ${ctx.vida}` : ''}. No actúa ni entra al orden de turnos.`});
    return {icono: sil ? '🤐' : '🚩', titulo: (ctx.autor && ctx.autor.escondido ? '' : ctx.nombre) || (sil ? 'Tótem de silencio' : 'Estandarte de guerra'), esencial, filas, descripcion: '', descripcionNo: ''};
  }

  /* 🪧 El nombre del token de un tótem o un estandarte (P281, dueño, 2026-11-22: «correcto, sacale el nombre del creep»): el de la habilidad con que se
     clavó («Tótem de silencio», «Estandarte de guerra»), sin «de <creep>». `actual`: el nombre que tiene hoy; los clavados antes se llamaban «Tótem de
     silencio de <creep>» / «Estandarte de <creep>» y, con `deNombre` (quien lo clavó), se reconocen y pasan al nombre nuevo. Otro nombre queda como está
     (uno que le puso el GM a mano, por ejemplo). Sin `actual`: el nombre para uno nuevo. */
  function nombreInerte(silencio, habilidad, actual, deNombre){
    const limpio = String(habilidad || '').trim().slice(0, 60) || (silencio ? 'Tótem de silencio' : 'Estandarte de guerra');
    if(actual === undefined || actual === null) return limpio;
    const quien = String(deNombre || '').replace(/\s*\((auditar|copia|refuerzo)\)\s*$/i, '');
    const viejo = quien ? `${silencio ? 'Tótem de silencio' : 'Estandarte'} de ${quien}`.slice(0, 60) : '';
    return viejo && String(actual) === viejo ? limpio : String(actual);
  }
  // Su nota (la 🪪, que ven todos): tampoco nombra a quien lo clavó. Con `actual` y `deNombre`: la nota vieja («… de <creep>: …») pasa a la nueva; otra, igual.
  function notasInerte(silencio, radio, actual, deNombre){
    const r = Math.max(1, Math.round(Number(radio)) || 3);
    const nueva = silencio ? `Tótem de silencio: los rivales de quien lo clavó a ${r} casillas o menos no pueden usar habilidades que cuestan SP mientras siga en pie.`
      : `Estandarte de guerra: los aliados de quien lo clavó a ${r} casillas o menos pegan mejor mientras siga en pie.`;
    if(actual === undefined || actual === null) return nueva;
    const viejo = `${silencio ? 'Tótem de silencio' : 'Estandarte de guerra'} de ${String(deNombre || '')}:`;
    return deNombre && String(actual).startsWith(viejo) ? nueva : String(actual);
  }

  /* 📖 La tarjeta en HTML, con el glosario al pasar el mouse (2026-11-22, dueño: «en el menú de "Ver detalle" de las trampas y las zonas… le agregaría
     el glosario con hover. Por ejemplo… dice que quedás expuesto, pero ni yo me acuerdo el detalle de expuesto»). Los términos que tienen entrada en
     comun/glosario.js (estados, resistencias, PdG, Defensa, Evasión, fuego amigo, Mantenimiento…) se marcan UNA vez en toda la tarjeta (la primera en que
     aparecen: lo destacado, después cada fila —también su título, como «Fuego amigo»— y al final la descripción). Sin Glosario, el texto escapado.
     m = lo que devuelve armar() / armarInerte(); o = {glosario (el objeto Glosario), cargando (la descripción se está buscando)}. */
  function html(m, o){
    o = o || {};
    if(!m) return '';
    const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
    const G = o.glosario && typeof o.glosario.marcar === 'function' ? o.glosario : null;
    const usados = new Set();
    const mk = t => (G ? G.marcar(t, {usados, basicos: true}) : esc(t));
    const esencial = mk(m.esencial);   // (primero lo destacado: ahí va la primera marca de cada término)
    // (los nombres no se marcan: «Con qué se puso: Tótem de silencio» no es el estado Silencio, ni un creep que se llame como un término)
    const SOLO_NOMBRE = ['De quién es', 'Con qué se puso'];
    const filas = (m.filas || []).map(f => `<div class="zd-fila${f.aMano ? ' zd-amano' : ''}"><b>${mk(f.k)}</b><span>${SOLO_NOMBRE.includes(f.k) ? esc(f.v) : mk(f.v)}</span></div>`).join('');
    const tituloDesc = '<b>📜 Descripción de la habilidad</b>';
    const desc = m.descripcion ? `<div class="zd-desc">${tituloDesc}<div>${mk(m.descripcion)}</div></div>`
      : m.descripcionNo ? `<div class="zd-desc zd-amano">${tituloDesc}<div>${esc(m.descripcionNo)}</div></div>`
      : o.cargando ? `<div class="zd-desc zd-amano">${tituloDesc}<div>Buscándola…</div></div>` : '';
    return `<div class="zd-cab"><b>${esc(m.icono)} ${esc(m.titulo)}</b><button type="button" class="zd-cerrar" title="Cerrar (Esc)" aria-label="Cerrar">✕</button></div>` +
      `<div class="zd-esencial"><span class="zd-ico">${esc(m.icono)}</span><span>${esencial}</span></div>` +
      `<div class="zd-filas">${filas}</div>${desc}` +
      `<div class="zd-pie">Sale de los datos de lo que está puesto en el mapa. «${A_MANO}» = ese dato no está guardado ahí.</div>`;
  }

  return {tiene, armar, armarInerte, nombreInerte, notasInerte, cuandoEtiqueta, sinTiradaTexto, frenoDe, frenoCorto, html, A_MANO};
})();
if(typeof module !== 'undefined' && module.exports) module.exports = ZonaDetalle;
