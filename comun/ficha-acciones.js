/* =========================================================
   FICHA-ACCIONES — botones de la Botonera que cambian al personaje (paso 4, etapa 3c de docs/plan-paso4-etapa3.md,
   2026-10-01)
   Lo que hacen (cobrar No2, poner o sacar un estado) es lo mismo en la ficha y en la Botonera nueva del mapa; lo que se ve
   (el cartel de "no te alcanzan los Nitros", el aviso, redibujar) lo pone cada pantalla con `ui`:
     ui = {presets (los estados estándar, forma ficha: estadosPresetFicha()), toast(texto),
           avisarSinNitros(costo, accion, continuar) (el cartel con Cancelar / "Realizar de cualquier modo"),
           cambio(lista) (qué cambió: 'efectos', 'nitros' — para redibujar y guardar)}
   Copiado tal cual de la ficha (js/02 y js/09), con `S` como parámetro. Necesita ficha-calculo.js, ficha-habilidades.js y
   ficha-botonera.js antes; gastoNitrosForzado usa la sesión de Firebase de la página (fbDb, fbUsuario, fbMiembro).
   ========================================================= */
const FichaAcciones = (() => {
  const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  function fmt(n){ return Number.isInteger(n) ? n : Math.round(n*100)/100; }
  const uid = () => Math.random().toString(36).slice(2,9);
  const IT2 = () => FichaCalculo.IT2;

  // Publica la línea roja y devuelve cuántos Nitros descontar (los que haya, nunca de más). (js/09)
  function gastoNitrosForzado(S, costo, hizo){
    const disp = Math.max(0, num(S.nitros));
    if(typeof fbDb !== 'undefined' && fbDb && fbUsuario && fbMiembro){
      const nombre = ((S.meta && S.meta.nombre) || '').trim() || fbMiembro.nombre;
      fbDb.collection(fbRutaCampana('tiradas')).add({
        uid: fbUsuario.uid, jugador: fbMiembro.nombre, quien: '',
        origen: `⚠ ${nombre} ${hizo} sin Nitros suficientes`, formula: `Costaba ${fmt(costo)} No2 y tenía ${fmt(disp)}`,
        rolls: [], mod: 0, total: 0, desde: 'alerta-roja',
        cuando: firebase.firestore.FieldValue.serverTimestamp(),
      }).catch(err => console.error('No se pudo publicar la alerta de Nitros:', err));
    }
    return Math.min(costo, disp);
  }

  /* ---------- Sigilo: entrar y salir con un botón (js/02) ----------
     Quien tiene la habilidad "Sigilo" ve en la Botonera un botón directo, sin
     pasar por "+ Estado". Entrar cuesta IT2.nitrosSigilo (1 No2, a revisar) y
     aplica el estado alterado "Sigilo" sobre uno mismo (el mapa lo lee de ahí);
     salir es gratis. No se avisa en la Mesa: el sigilo no se anuncia. */
  function alternarSigilo(S, forzar, ui){
    const actual = FichaBotonera.efectoSigilo(S);
    if(actual){
      S.efectos = S.efectos.filter(e => e !== actual);
      ui.cambio(['efectos']);
      ui.toast('Saliste del sigilo');
      return;
    }
    const costo = num(IT2().nitrosSigilo);
    if(num(S.nitros) < costo && !forzar){
      ui.avisarSinNitros(costo, 'entrar en sigilo', () => alternarSigilo(S, true, ui));
      return;
    }
    const preset = ui.presets.find(p => p.nombre === 'Sigilo');
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, 'entró en sigilo') : costo);
    S.efectos.push({id: uid(), nombre: 'Sigilo', imagen: '', turnos: 0, stacks: 1, hpturno: 0, stacksturno: 0,
      permanente: true, activo: true, popup: false, detalle: (preset && preset.detalle) || '', mods: [], ...FichaHabilidades.flagsDePreset(ui.presets, 'Sigilo')});
    ui.cambio(['efectos', 'nitros']);
    ui.toast(`Entraste en sigilo${costo ? ` · -${fmt(costo)} No2` : ''}`);
  }

  /* ---------- Sentado: levantarse cuesta 1 No2 (js/02) ----------
     El estado Sentado no vence solo; el botón "Levantarse" de la Botonera lo saca y cobra IT2.nitrosLevantarse. */
  function levantarse(S, forzar, ui){
    const actual = FichaBotonera.efectoSentado(S);
    if(!actual) return;
    const costo = num(IT2().nitrosLevantarse);
    if(num(S.nitros) < costo && !forzar){
      ui.avisarSinNitros(costo, 'levantarte', () => levantarse(S, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, 'se levantó') : costo);
    S.efectos = S.efectos.filter(e => e !== actual);
    ui.cambio(['efectos', 'nitros']);
    ui.toast(`Te levantaste${costo ? ` · -${fmt(costo)} No2` : ''}`);
  }

  /* ---------- La vida: Ankh y estado de muerte (js/02) ----------
     Lo que cambia en el personaje; lo que se ve (el campo de HP, el cartel de "Inconsciente", el aviso) lo pone cada pantalla. */
  // Usa un Ankh: gasta una unidad y revive con el 25 % del HP máximo. Devuelve el nombre del ítem (o null).
  function aplicarRevivirConAnkh(S, key, id){
    const it = S[key].find(x => x.id === id);
    if(!it) return null;
    it.unidades = num(it.unidades) - 1;
    purgarSiAgotado(S, key, it.id);
    const cc = FichaCalculo.calcular(S);
    const hpmaxAnkh = Number.isNaN(cc.final.hpmax) ? 0 : cc.final.hpmax;
    S.hp = Math.max(1, Math.floor(hpmaxAnkh * 0.25));
    return it.nombre;
  }
  // Toda baja de HP pasa por acá: nunca baja de 0 ni pasa del máximo. Devuelve el HP que quedó.
  function fijarHp(S, valor){
    const c = FichaCalculo.calcular(S);
    const hpmax = Number.isNaN(c.final.hpmax) ? 0 : c.final.hpmax;
    const tope = hpmax > 0 ? hpmax : Math.max(0, num(valor));
    S.hp = Math.max(0, Math.min(tope, num(valor)));
    return S.hp;
  }
  // Si el HP llega a 0 y hay un Ankh de Reencarnación en el cinturón, se activa solo (en la mochila no). Devuelve su nombre si se activó.
  function revisarAnkh(S){
    if(num(S.hp) > 0) return null;
    if(S.muerto && S.muerto.definitivo) return null; // muerte definitiva: ya no hay vuelta atrás
    const idx = S.cinturon.findIndex(i => i.nombre === 'Ankh de Reencarnación' && num(i.unidades) > 0);
    if(idx < 0) return null;
    return aplicarRevivirConAnkh(S, 'cinturon', S.cinturon[idx].id);
  }
  // Con HP > 0 deja de estar inconsciente; con 0, queda inconsciente (5 turnos para morir). Devuelve {vivo, revivio} o {vivo: false, cayo}.
  function revisarMuerte(S){
    if(!S.muerto) S.muerto = {activo:false, turnos:5, definitivo:false};
    if(num(S.hp) > 0){
      if(S.muerto.activo){
        S.muerto = {activo:false, turnos:5, definitivo:false};
        return {vivo: true, revivio: true};
      }
      return {vivo: true, revivio: false};
    }
    if(!S.muerto.activo && !S.muerto.definitivo){
      S.muerto.activo = true;
      S.muerto.turnos = 5;
      return {vivo: false, cayo: true};
    }
    return {vivo: false, cayo: false};
  }

  /* ---------- Consumir un ítem (js/06, el botón Consumir; js/02 y js/09) ---------- */
  function purgarSiAgotado(S, key, id){
    const it = S[key].find(x=>x.id===id);
    if(it && it.consumible && num(it.unidades) <= 0){
      S[key] = S[key].filter(x=>x.id!==id);
      return true;
    }
    return false;
  }
  function restaurarSpDeConsumo(S, it){
    const pct = num(it.curaspPct);
    if(pct <= 0) return 0;
    const restaurar = Math.ceil(FichaBotonera.spMaximo(S) * Math.min(pct, 100) / 100);
    S.spGastado = Math.max(0, num(S.spGastado) - restaurar);
    return restaurar;
  }
  // Oleo reparador: quita Armadura rota si está activa (es permanente, no vence sola). Devuelve cuántas se quitaron.
  function repararArmadura(S){
    const antes = S.efectos.length;
    S.efectos = S.efectos.filter(e => e.nombre !== 'Armadura rota');
    return antes - S.efectos.length;
  }
  // El estado del sistema anterior que deja el consumible (comun/ficha-habilidades.js); avisa si una inmunidad lo bloqueó.
  function efectoDeConsumo(S, it, presets, toast){
    const r = FichaHabilidades.aplicarEfectoDeConsumo(S, it, presets);
    if(!r) return null;
    if(!r.ok){ toast(`Inmune ahora mismo${r.motivo === 'inmune' ? '' : ` (${r.motivo})`} — ${r.nombre} no hizo efecto`); return null; }
    return r.estado;
  }
  // Las tiradas propias del ítem (su stat con su bono, y su fórmula), armadas sin publicar: [{origen, r} | {error}].
  // La ficha usa las suyas (tirarExtraDeItem, con el cartel de sobrepeso si el stat es la Evasión); el mapa, estas.
  function tiradasDeItem(S, it){
    const out = [];
    const stat = it.tiradaStat;
    if(stat && (FichaCalculo.ATTR_LIST.some(a => a.id === stat) || FichaBotonera.statsConTirada().some(s => s.id === stat))){
      const nombre = `${it.nombre} · ${FichaCalculo.STAT_LABEL[stat]}`, valor = FichaCalculo.calcular(S).final[stat] + num(it.tiradaBono);
      if(!formulaParaValor(valor)) out.push({error: `${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`});
      else out.push({origen: nombre, r: Combatiente.tirarStat(valor, S.efectos, stat, {extra: undefined})});
    }
    const formula = (it.tiradaExtra || '').trim();
    if(formula){
      const r = tirarDados(formula);
      if(r) out.push({origen: it.nombre, r});
    }
    return out;
  }
  /* Consumir (el botón Consumir de la Botonera, la mochila o el cinturón). id: el del ítem (mochila o cinturón).
     ui, además de lo de siempre: fijarHp(valor) (y lo que la pantalla muestre de la vida), efecto(it) (el estado que deja, o
     null), tirarExtra(it) (sus tiradas), colocarTrampa(it) (async → true si se colocó; una trampa consumible no se gasta si
     no). cambio(lista) recibe 'inventario' o 'cinturon', 'efectos' si hubo estado o reparación, 'vitals' y 'nitros'. */
  const consumiendoTrampa = new Set();
  async function consumir(S, id, forzar, ui){
    { const enM = S.inventario.find(x => x.id === id); if(enM && enM.enMesa){ ui.toast('Está ofrecido en la mesa común: retiralo primero'); return; } }
    let it = S.inventario.find(x=>x.id===id);
    let key = 'inventario';
    if(!it){ it = S.cinturon.find(x=>x.id===id); key = 'cinturon'; }
    if(it && num(it.unidades) > 0){
      const costoNitros = FichaBotonera.costoConsumirNitros(key);
      let gastoNitros = costoNitros;
      if(costoNitros > num(S.nitros)){
        if(!forzar){
          ui.avisarSinNitros(costoNitros, `consumir ${it.nombre} ${key === 'cinturon' ? 'del cinturón' : 'de la mochila'}`, () => consumir(S, id, true, ui));
          return;
        }
        gastoNitros = gastoNitrosForzado(S, costoNitros, `consumió ${it.nombre}`);
      }
      // Trampa consumible (2026-09-25): al usarla se coloca sola junto a tu token; si no se puede, no se gasta.
      if(it.trampaDatos){
        if(consumiendoTrampa.has(id)) return;
        consumiendoTrampa.add(id);
        let ok = false;
        try{ ok = await ui.colocarTrampa(it); }finally{ consumiendoTrampa.delete(id); }
        if(!ok) return;
      }
      S.nitros = num(S.nitros) - gastoNitros;

      const cargaMax = Math.max(1, num(it.cargaMax) || 1);
      let carga = num(it.cargaActual ?? cargaMax);
      if(carga <= 0) carga = cargaMax;
      carga -= 1;
      let gastoUnidad = false;
      if(carga <= 0){
        it.unidades = num(it.unidades) - 1;
        carga = cargaMax;
        gastoUnidad = true;
      }
      it.cargaActual = carga;
      purgarSiAgotado(S, key, id);

      // Solo se toca el HP si el ítem efectivamente cura o daña: si no,
      // el clamp contra hpmax lo bajaría igual (con la ficha recién
      // abierta hpmax es 0 y eso mataba al personaje de una).
      if(num(it.curahp)){
        ui.fijarHp(num(S.hp) + num(it.curahp));
      }
      const efecto = ui.efecto(it);
      ui.tirarExtra(it);
      const spRestaurado = restaurarSpDeConsumo(S, it);
      const reparados = it.nombre === 'Oleo reparador' ? repararArmadura(S) : 0;
      ui.cambio([key, ...(efecto || reparados ? ['efectos'] : []), 'vitals', 'nitros']);
      const partes = [];
      if(it.curahp) partes.push(`${num(it.curahp)>=0?'+':''}${fmt(num(it.curahp))} HP`);
      if(spRestaurado) partes.push(`+${fmt(spRestaurado)} SP`);
      partes.push(`-${costoNitros} No2`);
      if(cargaMax > 1) partes.push(gastoUnidad ? 'última carga usada' : `carga ${carga}/${cargaMax}`);
      if(efecto) partes.push(`${efecto.nombre}${efecto.permanente ? '' : ` (${fmt(efecto.turnos)} turnos)`}`);
      if(reparados) partes.push(reparados > 1 ? 'armadura reparada por completo' : 'armadura reparada');
      ui.toast(`${it.nombre}: ${partes.join(' · ')}`);
    }
  }

  /* ---------- Combate suelto: tiradas de la Botonera fuera del duelo (paso 3c-4a; js/03, js/11 y js/02) ----------
     ui, además de toast / avisarSinNitros: registrarTirada(origen, r) (publicarla), preguntarSobrepeso({nombre, valor, extra,
     sobre}) (el cartel; la pantalla después llama a sobrepesoPagar y tirarValorStat), cambio(lista) ('nitros', 'refresh',
     'botonera', en ese orden), getParry() / setParry(id) (el arma o escudo del último Parry, que espera su Bloqueo: lo guarda
     cada pantalla), elegirArma(tipo, armas) (el cartel "¿Con qué arma?": 'parry' | 'bloqueo' | 'fuerza' | 'dano'; la pantalla
     llama a armaElegida) y efectosAlPegar(arma) (los efectos al golpear, comun/efectos-golpe.js). */
  // Tirar un stat: Afortunado, mitades y Evasión mínimo 1 (Combatiente.tirarStat); la Evasión con sobrepeso pregunta antes.
  function tirarValorStat(S, nombre, valor, statId, extra, sobrepeso, sobre, ui){
    const f = formulaParaValor(valor);
    if(!f){ ui.toast(`${nombre}: ${fmt(num(valor))} no se puede tirar con dados reales`); return; }
    if(statId === 'eva' && !sobrepeso){
      const s = FichaCalculo.calcular(S).sobrecarga;
      if(s > 0){
        ui.preguntarSobrepeso({nombre, valor, extra, sobre: s});
        return;
      }
    }
    if(sobrepeso === 'penal') extra = num(extra) - num(sobre);
    // La tirada en sí (Afortunado, mitades, Evasión mínimo 1) es la del motor común: comun/combatiente.js.
    const r = Combatiente.tirarStat(valor, S.efectos, statId, {extra});
    if(sobrepeso === 'penal') r.estados.push({n: 'Sobrepeso', p: 'debuff'});
    else if(sobrepeso === 'pagado') r.estados.push({n: 'Sobrepeso (pagó 1 No2)', p: 'otro'});
    ui.registrarTirada(nombre, r);
  }
  // El cartel de sobrepeso, "Pagar 1 No2": devuelve false si no alcanzan (y no cierra el cartel).
  function sobrepesoPagar(S, ui){
    if(num(S.nitros) < 1){ ui.toast('No tenés Nitros para pagar: tirá con la penalidad o cancelá'); return false; }
    S.nitros = num(S.nitros) - 1;
    ui.cambio(['nitros', 'refresh']);
    return true;
  }
  // Parry: siempre 1 No2 (Combatiente.costoParry); queda esperando su Bloqueo con esa misma arma o escudo.
  function parryConArma(S, arma, forzar, ui){
    const costo = Combatiente.costoParry();
    const con = arma ? ' con ' + arma.nombre : '';
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `hacer Parry${con}`, () => parryConArma(S, arma, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `hizo Parry${con}`) : costo);
    ui.cambio(['nitros']);
    ui.setParry(arma ? arma.id : null);   // queda esperando su Bloqueo (si ganás el Parry)
    tirarValorStat(S, arma ? `Parry · ${arma.nombre}` : 'Parry', FichaCombate.statParaArma(S, 'parry', arma), 'parry', undefined, undefined, undefined, ui);
    ui.toast(`Parry${con}: −${fmt(costo)} No2 · te quedan ${fmt(num(S.nitros))}${arma ? ' · si lo ganás, tirá el Bloqueo' : ''}`);
    ui.cambio(['refresh', 'botonera']);
  }
  // Bloqueo: tu Bloqueo (de Fuerza) MÁS el peso del arma o escudo; esa suma es el dado.
  function bloqueoConArma(S, arma, ui){
    tirarValorStat(S, arma ? `Bloqueo · ${arma.nombre}` : 'Bloqueo', FichaCombate.bloqueoValor(S, arma), 'bloqueo', undefined, undefined, undefined, ui);
  }
  // Fuerza del golpe: tu Fuerza + el peso de tu arma; esa suma es el dado (contra el Bloqueo del defensor). Sin costo.
  function fuerzaGolpeValorConArma(S, arma){
    return FichaCombate.statParaArma(S, 'fue', arma) + (arma ? num(arma.peso) : 0);
  }
  function fuerzaGolpeConArma(S, arma, ui){
    tirarValorStat(S, arma ? `Fuerza del golpe · ${arma.nombre}` : 'Fuerza del golpe', fuerzaGolpeValorConArma(S, arma), 'fue', undefined, undefined, undefined, ui);
  }
  // Botones Parry, Bloqueo y Fuerza del golpe: con dos o más armas equipadas se elige con cuál.
  function elegirArmaDefensa(S, tipo, ui){
    // El Bloqueo solo existe después de un Parry, y es con la misma arma o escudo (regla del dueño, 2026-09-30).
    if(tipo === 'bloqueo'){
      const pendiente = ui.getParry();
      const armaDelParry = pendiente ? S.inventario.find(x => x.id === pendiente && x.equipado) : null;
      ui.setParry(null);
      if(armaDelParry) bloqueoConArma(S, armaDelParry, ui);
      else ui.toast(Combatiente.BLOQUEO_SOLO_TRAS_PARRY);
      ui.cambio(['botonera']);
      return;
    }
    // Parry: con un arma o un escudo (regla del dueño, 2026-09-30); la Fuerza del golpe, con un arma que pega.
    const armas = tipo === 'fuerza' ? FichaCombate.armasEquipadasConDano(S) : FichaCombate.armasYEscudosParaParry(S);
    if(tipo !== 'fuerza' && !armas.length){ ui.toast(Combatiente.SIN_ARMA_DEFENSA); return; }
    if(armas.length <= 1){ armaElegida(S, tipo, armas.length ? armas[0].item : null, ui); return; }
    ui.elegirArma(tipo, armas);
  }
  // Lo elegido en "¿Con qué arma?".
  function armaElegida(S, tipo, arma, ui){
    if(tipo === 'dano'){ if(arma) tirarDanoDeArma(S, arma, ui); return; }
    if(tipo === 'parry') parryConArma(S, arma, false, ui); else if(tipo === 'fuerza') fuerzaGolpeConArma(S, arma, ui); else bloqueoConArma(S, arma, ui);
  }
  // Daño del arma (con lo que suma el stat Daño) y sus efectos al golpear.
  function tirarDanoDeArma(S, it, ui){
    const dmg = FichaCalculo.calcular(S).final.dmg;
    const r = tirarDados(FichaCombate.armaDanoTxt(it, dmg));
    if(!r) return;
    ui.registrarTirada(it.nombre, r);
    ui.efectosAlPegar(it);
  }
  function pedirArmaYTirar(S, ui){
    const armas = FichaCombate.armasEquipadasConDano(S);
    if(!armas.length){ ui.toast('No tenés ningún arma equipada con daño para tirar'); return; }
    if(armas.length === 1){ tirarDanoDeArma(S, armas[0].item, ui); return; }
    ui.elegirArma('dano', armas);
  }

  /* ---------- Atacar (paso 3c-4b; js/11) ----------
     Lo que hace el ataque suelto (sin objetivo) o el que el duelo le pide al atacante: cobrar los No2 y tirar el PdG.
     Ataque normal: el primero del turno con esa arma cuesta Tipo ÷ 2, los siguientes el Tipo completo (cuenta como ataque).
     Ataque de oportunidad y Contraataque (regla a prueba, P139): SIEMPRE Tipo ÷ 2 y NO suman al conteo de ataques. */
  function atacarConArma(S, arma, forzar, ui){
    ui.setParry(null);
    const costo = FichaCombate.costoAtaque(S, arma);
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `atacar${arma ? ' con ' + arma.nombre : ''}`, () => atacarConArma(S, arma, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `atacó${arma ? ' con ' + arma.nombre : ''}`) : costo);
    const primero = FichaCombate.registrarAtaque(S, arma);   // cuenta el ataque con esa arma (comun/ficha-combate.js)
    ui.cambio(['nitros']);
    tirarValorStat(S, arma ? `PdG · ${arma.nombre}` : 'PdG', FichaCombate.pdgParaArma(S, arma).valor, 'pdg', undefined, undefined, undefined, ui);
    const tipo = FichaCombate.tipoAtaque(arma);
    const impar = primero && tipo % 2 !== 0;
    ui.toast(`${arma ? arma.nombre : 'Sin arma ⚠ (Tipo provisorio)'}: -${fmt(costo)} No2 · ${primero ? 'primer ataque con esta arma' : `ataque ${FichaCombate.ataquesConArma(S, arma)} con esta arma`}${impar ? ' · ⚠ Tipo impar, redondeo provisorio' : ''}`);
  }
  const NOMBRE_ATAQUE_ESPECIAL = {oportunidad: 'Ataque de oportunidad', contra: 'Contraataque'};
  function ataqueEspecialConArma(S, arma, tipo, forzar, ui){
    const costo = FichaCombate.costoAtaqueEspecial(arma), nombre = NOMBRE_ATAQUE_ESPECIAL[tipo] || 'Ataque';
    const con = arma ? ' con ' + arma.nombre : '';
    if(costo > num(S.nitros) && !forzar){
      ui.avisarSinNitros(costo, `hacer un ${nombre.toLowerCase()}${con}`, () => ataqueEspecialConArma(S, arma, tipo, true, ui));
      return;
    }
    S.nitros = num(S.nitros) - (forzar && costo > num(S.nitros) ? gastoNitrosForzado(S, costo, `hizo un ${nombre.toLowerCase()}${con}`) : costo);
    ui.cambio(['nitros']);
    // Solo el contraataque suma el «PdG en contraataque» de la propia arma (los tipos 6 lo traen: +1 a +3, mucho menos valioso que un PdG normal porque es circunstancial);
    // y solo el ataque de oportunidad suma el «PdG en oportunidad» (los tipos 4, mismo criterio).
    const bonoContra = tipo === 'contra' ? FichaCombate.statParaArma(S, 'pdgcontra', arma) : tipo === 'oportunidad' ? FichaCombate.statParaArma(S, 'pdgopor', arma) : 0;
    tirarValorStat(S, `${nombre} · PdG${arma ? ' · ' + arma.nombre : ''}`, FichaCombate.pdgParaArma(S, arma).valor + (Number.isNaN(bonoContra) ? 0 : bonoContra), 'pdg', undefined, undefined, undefined, ui);
    ui.toast(`${nombre}${con}: −${fmt(costo)} No2 (lo de un primer ataque)${bonoContra > 0 ? ` · PdG +${fmt(bonoContra)} por ${tipo === 'contra' ? 'contraataque' : 'oportunidad'}` : ''} · te quedan ${fmt(num(S.nitros))}`);
    ui.cambio(['refresh']);
  }

  return {gastoNitrosForzado, alternarSigilo, levantarse,
    atacarConArma, ataqueEspecialConArma, NOMBRE_ATAQUE_ESPECIAL,
    tirarValorStat, sobrepesoPagar, parryConArma, bloqueoConArma, fuerzaGolpeValorConArma, fuerzaGolpeConArma, elegirArmaDefensa, armaElegida, tirarDanoDeArma, pedirArmaYTirar,
    aplicarRevivirConAnkh, fijarHp, revisarAnkh, revisarMuerte,
    purgarSiAgotado, restaurarSpDeConsumo, repararArmadura, efectoDeConsumo, tiradasDeItem, consumir};
})();
