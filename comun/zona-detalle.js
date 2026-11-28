/* comun/zona-detalle.js — 🔍 «Ver detalle» de lo que está puesto en el mapa (2026-11-20, dueño: «invoqué el Muro de fuego y después, cuando
   quería recordar bien qué hacía, tenía que ir a la ficha del personaje que lo invocó… me gustaría que al seleccionarlo, arriba, donde aparece el
   título, a la derecha, aparezca un botoncito que diga "ver detalle"»; «siempre primero el detalle de cuánto daño hace y en qué contexto, y
   después todo lo demás»).
   Lo puro: arma la tarjeta desde los DATOS del elemento (los mismos campos que lee el motor de zonas, vtt-hexgrid/js/08), sin texto escrito a mano
   por zona. Lo que el elemento no guarda se dice «a mano» (no se inventa). Qué se le muestra a cada pantalla (quién la puso, si está escondido; la
   descripción de la habilidad) lo decide el mapa (vtt-hexgrid/js/127-zona-detalle.js) y llega en `ctx`.
   ZonaDetalle.tiene(el) → ¿hay algo que contar? (zona, trampa, fuego, nube, portal, acelerador)
   ZonaDetalle.armar(el, ctx) → {icono, titulo, esencial, filas: [{k, v, aMano}], descripcion}
   ZonaDetalle.turnosQuedan(el, {mant, enOrden}) → {quedan, porTurnos} | null (⏳ la cuenta de lo que le queda); relojTexto(q); relojLugar(celdas, o) (la casilla; ya no la usa el mapa);
     relojVertice(celdas, o) (⏳ sobre un vértice, P384); turnosCambio(n, mant) → {turnos, venceMant} | null (poner / cambiar / quitar la duración);
     relojMuestra(q) (sin cero), relojQuien(el, porDefecto) / relojDeParse / relojDeTxt (quién cuenta: `relojModo`, `relojDe`), turnoBaja(el, o) (empieza
     su turno), rondaAlDia(el, mant), RELOJ_SIN «⏳ –» y relojSinPuede(el) (sin contador), relojComoTxt(el, o) (2026-11-28, «sin cero»)
   ZonaDetalle.entraDesdeAfuera(celdas, desde) → ¿un movimiento que termina adentro de la zona cuenta como ENTRAR? (💨 las zonas con duelo por token)
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
    else if(q === 0) filas.push({k: 'Cuánto le queda', v: 'Se está yendo: se va después de su efecto de esta ronda.'});   // (⏳ sin cero, 2026-11-28)
    else filas.push({k: 'Cuánto le queda', v: `${q} turno${s(q)}${ctx.quedanDe ? ` (${ctx.quedanDe})` : ' (baja uno al empezar cada ronda)'}; cuando le tocaría llegar a 0, se va.`});
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

  /* ⏳ Cuántos turnos le quedan a lo puesto en el mapa (2026-11-28, dueño: «que las zonas que están en el mapa por un tiempo determinado muestren un
     iconito con un reloj de arena que muestre cuántos turnos les queda»). LA cuenta de todo el mapa (el ⏳ del lienzo, el cartel de la casilla, el cartel
     de arriba y «Ver detalle»), la misma con la que el mapa la borra (vtt-hexgrid/js/07):
     - sin `venceMant` (o sin Mantenimiento conocido) → null: no vence, no lleva reloj;
     - quien cuenta (relojQuien) NO está en el orden de turnos (`o.enOrden` falso) o no guarda `turnos` → lo que falta de Mantenimientos (`venceMant` −
       el actual): se borra cuando se pasa de ronda ese número de veces (elementosVencidosBarrer);
     - quien cuenta SÍ está en el orden → solo sus `turnos` (bajan uno al empezar SU turno, zonasDelQueLaTiro; 2026-11-28, dueño: «que el timer cuente
       el inicio del turno de quien lo coloca… y que no haya cero»): ya no se va antes por llegar a `venceMant` (P380, revisada).
     «Sin cero»: con 0 la zona se está yendo (espera su último efecto de la ronda, si tiene): `relojMuestra` dice que no se dibuja.
     o = {mant (el número de Mantenimiento actual), enOrden}. → {quedan, porTurnos} (porTurnos: el número son turnos de quien cuenta). */
  function turnosQuedan(el, o){
    o = o || {};
    if(!el || el.venceMant === null || el.venceMant === undefined || o.mant === null || o.mant === undefined) return null;
    const vm = Math.round(Number(el.venceMant)), mant = Math.round(Number(o.mant));
    if(!Number.isFinite(vm) || !Number.isFinite(mant)) return null;
    const t = Math.round(Number(el.turnos)) || 0;
    if(t > 0 && o.enOrden) return {quedan: t, porTurnos: true};
    return {quedan: Math.max(0, vm - mant), porTurnos: false};
  }
  // ¿Se dibuja el número? Sin cero: con 0 se está yendo.
  const relojMuestra = q => !!(q && Math.round(Number(q.quedan)) > 0);
  /* ⏳ Quién cuenta el reloj (2026-11-28, dueño: «si el GM pone un área, una forma, y le pone un timer, puede elegir si el contador baja de número al
     principio de cada ronda o al principio del turno del token jugador/usuario/creep que venga al caso»). `relojModo: 'ronda'` → nadie (por rondas);
     `relojDe: "fichaId|pj|creep"` → ese token; si no, quien la puso (`porDefecto`: la zona o el portal de una habilidad, la trampa de alguien).
     → {ref, tipo} | null. */
  function relojDeParse(s){
    const [ref, tipo] = String(s || '').split('|');
    return ref ? {ref, tipo: tipo === 'creep' ? 'creep' : 'pj'} : null;
  }
  const relojDeTxt = c => c && c.ref ? `${String(c.ref).slice(0, 90)}|${c.tipo === 'creep' ? 'creep' : 'pj'}` : '';
  function relojQuien(el, porDefecto){
    if(!el || el.relojModo === 'ronda') return null;
    return relojDeParse(el.relojDe) || porDefecto || null;
  }
  /* ⏳ Empieza el turno de quien cuenta: un turno menos. → {accion: 'bajar', cambios: {turnos, venceMant}} (venceMant al día: si quien cuenta deja el
     orden de turnos, sigue por rondas con lo que le quedaba) | {accion: 'esperar', cambios: {venceMant}} (llegó a 0 justo después de pasar de ronda y
     todavía tiene que hacer su efecto de esa ronda a los que siguen adentro: se borran los `turnos` —las reglas no aceptan 0— y la borra el GM cuando lo
     resolvieron) | {accion: 'borrar'} | null (no tiene turnos). o = {mant (el Mantenimiento actual), esperaEfecto (¿le falta su efecto de la ronda?)}. */
  function turnoBaja(el, o){
    o = o || {};
    const t = Math.round(Number(el && el.turnos)) || 0;
    if(t <= 0) return null;
    const mant = Math.round(Number(o.mant)) || 0, quedan = t - 1;
    if(quedan > 0) return {accion: 'bajar', cambios: {turnos: quedan, venceMant: mant + quedan}};
    return o.esperaEfecto ? {accion: 'esperar', cambios: {venceMant: mant}} : {accion: 'borrar'};
  }
  /* ⏳ Pasó de ronda y lo cuenta la ronda (nadie en el orden): sus `turnos` al día con lo que le queda, así si después cuenta los turnos de alguien
     (empieza el combate, lo eligió el GM) arranca de ahí. → {turnos} | null (nada que cambiar; con 0 se va: no se escribe). */
  function rondaAlDia(el, mant){
    if(!el || el.venceMant === null || el.venceMant === undefined) return null;
    const t = Math.round(Number(el.turnos)) || 0, q = Math.round(Number(el.venceMant)) - (Math.round(Number(mant)) || 0);
    return t > 0 && q >= 1 && q < t ? {turnos: q} : null;
  }
  // El texto del reloj sin contador (solo para quien lo puede configurar): «⏳ –».
  const RELOJ_SIN = '⏳ –';
  /* ¿Lleva «⏳ –»? Lo que todavía no tiene contador y se le puede poner (no la Colisión, un arma en el piso ni lo sólido: paredes, rocas, columnas,
     que casi siempre quedan para siempre; a esas se les pone desde el ⚙). La pantalla decide si puede (el GM o quien lo puso). */
  const relojSinPuede = el => !!el && (el.venceMant === null || el.venceMant === undefined) && !el.colision && !el.arma && !el.solido;
  /* La frase de cómo baja, para el ⚙ y «Ver detalle». o = {quien: 'Fulano' | '', tuyo (es mi personaje)}. */
  function relojComoTxt(el, o){
    o = o || {};
    if(!el || el.relojModo === 'ronda' || !o.quien) return 'baja uno al empezar cada ronda';
    return o.tuyo ? 'baja uno al empezar tu turno' : `baja uno al empezar el turno de ${o.quien}`;
  }
  // El texto del relojito: «⏳ 3».
  const relojTexto = q => `⏳ ${Math.max(0, Math.round(Number(q)) || 0)}`;
  /* Dónde va el relojito (2026-11-28): la casilla de la zona más cerca de su centro que no tenga un token a la vista ni el dibujo propio del elemento
     (la ficha de la trampa, el 🌀, el número del fuego); si están todas ocupadas, en la del medio pero corrido a la esquina de arriba a la derecha
     (`corrido`), para no tapar el token. o = {centro(c) → {x, y}, ocupada(c) → bool}. → {celda, corrido} (null sin casillas). */
  function relojLugar(celdas, o){
    if(!celdas || !celdas.length) return null;
    const pts = celdas.map(c => ({c, p: o.centro(c)}));
    const mx = pts.reduce((a, x) => a + x.p.x, 0) / pts.length, my = pts.reduce((a, x) => a + x.p.y, 0) / pts.length;
    const d = x => (x.p.x - mx) * (x.p.x - mx) + (x.p.y - my) * (x.p.y - my);
    pts.sort((a, b) => d(a) - d(b) || a.c.col - b.c.col || a.c.fila - b.c.fila);
    const libre = pts.find(x => !o.ocupada(x.c));
    return libre ? {celda: libre.c, corrido: false} : {celda: pts[0].c, corrido: true};
  }

  /* 💨 Entrar desde afuera (cola 2026-11-28, dueño, «la B»: los Pedos Tóxicos se disparaban en cada paso adentro de la nube). Una zona con duelo
     por token se resiste al ENTRAR (venir de una casilla fuera de la zona) y en su tanda (el Mantenimiento o el empezar del turno); caminar adentro no
     la dispara. Se mira la casilla de la que salió el movimiento (`desde`): si ya era de la zona, no es una entrada (aunque el camino haya salido y
     vuelto a entrar en el mismo movimiento, P381). Sin `desde` (teletransporte, la zona que aparece encima), cuenta. */
  function entraDesdeAfuera(celdas, desde){
    if(!desde) return true;
    return !(celdas || []).some(c => c && c.col === desde.col && c.fila === desde.fila);
  }

  /* ⏳ Dónde va el relojito, sobre un VÉRTICE (2026-11-28, dueño: «si está en el centro va a haber muchos casos en los que el contador lo tape un
     token… quizás en algún vértice en el perímetro de la zona puede ser mejor, porque un token inclusive lo permitiría dejar a la vista, o cualquier
     vértice dentro de la zona también»; P384). Un vértice es donde se juntan tres casillas; es del perímetro si alguna de esas tres queda fuera de la
     zona. Está «tapado» si hay un token (o el dibujo propio del elemento: la ficha de la trampa, el 🌀, el número del fuego) en alguna de sus tres
     casillas, o sea, a un radio de casilla o menos. Elige, en este orden: libre y del perímetro · libre de adentro · el que tenga menos tapados (del
     perímetro primero); entre esos, el de más arriba (y a la derecha). Estable: si `o.previo` (el vértice de antes) sigue en la zona y no quedó
     peor que el mejor (libre del perímetro, o libre si no hay ninguno del perímetro libre, o ninguno libre), se queda ahí.
     o = {esquinas(c) → [{x, y}] (los 6 de la casilla), obstaculos: [{x, y}] (centros de tokens e íconos), radio (el de una casilla), previo: {x, y}}.
     → {x, y, perimetro, tapados} | null (sin casillas). */
  function relojVertice(celdas, o){
    if(!celdas || !celdas.length) return null;
    o = o || {};
    const radio = Number(o.radio) || 1, lim2 = (radio * 1.05) * (radio * 1.05), clave = p => Math.round(p.x * 10) + ',' + Math.round(p.y * 10);
    const vs = new Map();
    celdas.forEach(c => (o.esquinas(c) || []).forEach(p => {
      const k = clave(p), v = vs.get(k);
      if(v) v.n++; else vs.set(k, {x: p.x, y: p.y, n: 1});
    }));
    const obs = o.obstaculos || [];
    const lista = [...vs.values()].map(v => ({x: v.x, y: v.y, perimetro: v.n < 3,
      tapados: obs.reduce((a, t) => a + ((t.x - v.x) * (t.x - v.x) + (t.y - v.y) * (t.y - v.y) <= lim2 ? 1 : 0), 0)}));
    const clase = v => v.tapados > 0 ? 2 : v.perimetro ? 0 : 1;
    lista.sort((a, b) => (clase(a) - clase(b)) || ((b.perimetro ? 1 : 0) - (a.perimetro ? 1 : 0)) || (a.tapados - b.tapados) || (a.y - b.y) || (b.x - a.x));
    const mejor = lista[0];
    if(o.previo){
      const kp = clave(o.previo), prev = lista.find(v => clave(v) === kp);
      if(prev && clase(prev) === clase(mejor) && (clase(prev) < 2 || prev.tapados <= mejor.tapados)) return prev;
    }
    return mejor;
  }
  /* ⏳ Ponerle, cambiarle o quitarle la duración a lo que ya está puesto (2026-11-28, dueño: «poder programarle contador a las formas colocadas
     manualmente»): N turnos desde ahora, con la misma cuenta que al colocarla (`turnos` = N y `venceMant` = el Mantenimiento actual + N: sin orden de
     turnos baja uno cada vez que se pasa de ronda; con quien la puso en el orden, con sus turnos). 0, vacío o algo que no es número = sin límite
     (→ null: se borran los dos campos). Tope 99 (las reglas). */
  function turnosCambio(n, mant){
    const t = Math.min(99, Math.max(0, Math.round(Number(n)) || 0));
    if(!t) return null;
    return {turnos: t, venceMant: (Math.round(Number(mant)) || 0) + t};
  }

  return {tiene, armar, entraDesdeAfuera, armarInerte, nombreInerte, notasInerte, cuandoEtiqueta, sinTiradaTexto, frenoDe, frenoCorto, html, turnosQuedan, relojTexto, relojLugar, relojVertice, turnosCambio,
    relojMuestra, relojQuien, relojDeParse, relojDeTxt, turnoBaja, rondaAlDia, RELOJ_SIN, relojSinPuede, relojComoTxt, A_MANO};

})();
if(typeof module !== 'undefined' && module.exports) module.exports = ZonaDetalle;
