/* =========================================================
   EMBEBIDO — una herramienta dentro del mapa (paso 4, etapa 1 de docs/plan-paso4.md, 2026-09-30)
   La ficha (?modo=botonera) y GM Tools (?modo=acciones|finalizar|botin) corren dentro de un marco del mapa. Antes cada una
   escondía TODO menos una lista fija de ventanas: cada cartel nuevo que no estaba en la lista desaparecía (así se perdió el
   «¿es su turno?» del Flash). Ahora es al revés: se esconde solo LA PÁGINA (lo que cada herramienta declara) y las piezas
   comunes que el mapa ya muestra por su cuenta (Mesa flotante, menú ☰, historial, cuadro del duelo, dados 3D); cualquier
   otra ventana o cartel, de hoy o futuro, se ve.
   Además mira la página y le avisa al mapa cuando algo se abre o se cierra ('embebido-abierto' / 'embebido-cerrado', solo
   en los cambios): el mapa muestra la capa del marco (encima del duelo si hay uno abierto) o la saca, para que no quede un
   marco transparente tapando el mapa.
   Uso (lo antes posible, apenas se sabe que corre dentro del mapa):
     Embebido.iniciar({clase: 'modo-botonera', pagina: ['.wrap', '#dock-izq'], noCuenta: ['#polilla-flotante']});
   `clase`: la que la herramienta pone en <html> cuando está embebida; `pagina`: selectores de SU página (hijos de <body>);
   `noCuenta`: cosas suyas que se ven pero no son una ventana abierta (un botón flotante que dura mientras dura un estado): si
   contaran, el marco quedaría tapando el mapa.
   ========================================================= */
const Embebido = (() => {
  // Lo que ponen los archivos comunes y el mapa ya tiene: dentro del marco no se muestra nunca.
  const COMUNES = ['#mesa', '#alerta-ojo', '#menu-sitio-boton', '#menu-sitio', '#historial-boton', '#historial-panel',
    '#duelo-fondo', '#duelo-avisos', '[id^="dados3d-capa-"]', '#dados-afortunado'];
  // Lo que nunca cuenta como "algo abierto" (aunque se vea): avisos al pie y ayudas que viven dentro de otra ventana.
  const NO_CUENTA = ['.toast', '#lupa-pop', '#bt-ayuda-pop', '.ef-tip'];
  let cfg = null, abierto = false, pendiente = 0;

  const enIframe = () => { try{ return window.parent !== window; }catch(e){ return true; } };
  const activo = () => !!cfg && document.documentElement.classList.contains(cfg.clase);

  function estilos(){
    if(document.getElementById('embebido-css')) return;
    const s = document.createElement('style');
    s.id = 'embebido-css';
    const ocultar = [...cfg.pagina, ...COMUNES].map(sel => `html.${cfg.clase} body > ${sel}`).join(',\n');
    s.textContent = `html.${cfg.clase}, html.${cfg.clase} body{background:transparent!important;min-height:0}\n${ocultar}{display:none!important}`;
    (document.head || document.documentElement).appendChild(s);
  }

  // ¿Hay algo a la vista? Un hijo de <body> que no sea la página, una pieza común ni un aviso, y que se vea de verdad.
  const oculto = el => [...cfg.pagina, ...COMUNES, ...NO_CUENTA, ...cfg.noCuenta].some(sel => { try{ return el.matches(sel); }catch(e){ return false; } });
  function hayAlgoAbierto(){
    if(!document.body) return false;
    return [...document.body.children].some(el => {
      if(/^(SCRIPT|STYLE|LINK|TEMPLATE)$/.test(el.tagName) || oculto(el)) return false;
      const s = getComputedStyle(el);
      if(s.display === 'none' || s.visibility === 'hidden' || el.hidden) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }
  function revisar(){
    pendiente = 0;
    const ahora = hayAlgoAbierto();
    if(ahora === abierto) return;
    abierto = ahora;
    if(enIframe()) window.parent.postMessage({tipo: ahora ? 'embebido-abierto' : 'embebido-cerrado'}, location.origin);
  }
  function programar(){ if(!pendiente) pendiente = setTimeout(revisar, 60); }

  function iniciar(o){
    cfg = {clase: o.clase, pagina: o.pagina || [], noCuenta: o.noCuenta || []};
    if(!activo()) return false;
    estilos();
    const mirar = () => {
      new MutationObserver(programar).observe(document.body, {childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'hidden', 'open']});
      programar();
    };
    if(document.body) mirar(); else document.addEventListener('DOMContentLoaded', mirar);
    return true;
  }
  // Para pruebas y para quien quiera saberlo sin esperar el aviso.
  return {iniciar, hayAlgoAbierto: () => !!cfg && hayAlgoAbierto(), COMUNES};
})();
