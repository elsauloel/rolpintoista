# Herramientas (scripts de Python)

## El catálogo de ítems (desde el 2026-09-29)

El catálogo de fábrica es **`comun/catalogo.js`** (`CATALOGO_BASE`, un ítem por renglón): la única copia, que cargan la
ficha, GM Tools, el generador de tiendas y el editor de catálogo. Se edita con **`datos/catalogo-editor.html`** (💾 Guardar
en el proyecto: escribe directo el archivo en la rama `nueva-version`) o desde una conversación. Lo que suben jugadores y GM
desde el juego vive en Firebase (`biblioteca_items`), no acá. Ver `docs/plan-subida-unificada.md` (paso 5).

Se retiraron (quedan en el historial del repositorio): el Excel `assets/catalogo.xlsx`, `datos/catalogo.json`,
`importar.py`, `importar_json.py`, `leer_excel.py`, `generar_excel.py`, `analizar_catalogo.py` y `catalogo_items.json`.
Ya no hace falta correr nada para que un cambio del catálogo llegue a las herramientas.

## Qué hay

- **catalogo_comun.py** — leer y escribir el catálogo: `leer_catalogo()`, `guardar_catalogo(items)` (mismo formato que el
  editor, conserva la cabecera) y `normalizar_item(it)` (un ítem de trabajo en la forma del catálogo).
- **calculadora_armas.py** — puntaje y precio de armas; auditoría de armas (`datos/auditoria-armas-datos.json`).
- **reajuste_defensa.py** — reparto de resistencias a crítico por slot y tier; auditoría de defensa.
- **calculadora_defensa.py** (2026-10-04) — presupuesto por pieza: puntos de cada bono (`COSTO`), bolsa por parte y calidad (`BOLSA`), precio
  sugerido y el máximo equipable contra la curva por nivel (`resumen`, `pieza NOMBRE`, `equipos`, `lista [PARTE]`).
- **buscar_duplicados.py** — ítems idénticos con distinto nombre.
- **variaciones_armas.py**, **generar_trampas_consumibles.py** — ítems del rework en archivos aparte (`datos/*-nuevos.json`,
  `datos/trampas-consumibles.json`).
- **publicar_nuevos.py** — publica esos ítems del rework en `comun/catalogo.js` (idempotente: rehace los `nuevo-`).
- **generar_equipo_creeps.py** — arma la tabla de equipo de los creeps humanos en `comun/creeps-base.js` a partir del catálogo.
- **detectar_efectos.py** — marca los ítems cuyo Detalle promete una mecánica que no está implementada
  (`python herramientas/detectar_efectos.py`).
- **compilar_manual.py** — compila el manual (`manual-usuario/notas/` → `datos/manual.json`).
- **balance_combate.py** (2026-10-09) — daño esperado por turno de cada clase y familia de arma (las palancas son opciones; ver docs/balance-combate.md).
- **simular_peleas.py** (2026-10-10) — peleas completas 1 vs 1 y 2 vs 2 entre arquetipos con armas del catálogo real; escribe docs/balance-peleas.md.
- **palancas_peleas.py** (2026-10-10) — prueba palancas de balance con esas peleas (sin cambiar reglas) y agrega la tabla al informe.
- **rutas.py** — rutas del proyecto.
- **simulador-encuentro.html** (2026-10-22, no es Python: una página) — simula un encuentro completo «en el aire» entre los personajes
  reales de una partida y creeps de esa partida, con el motor de reglas de verdad (`comun/ficha-*.js`, `comun/creep-*.js`,
  `comun/combatiente.js`, `comun/critico.js`): iniciativa, turnos, No2 y SP, duelos (PdG contra Evasión o Parry, Bloqueo, crítico,
  Perfora), habilidades dirigidas, de área y de onda, zonas (los Pedos Tóxicos), estados, pociones. Se abre por `http://localhost:…`
  (hace `fetch` de los datos) y se maneja desde la consola: `await Sim.cargar()`, `Sim.narrar(enc)` (una pelea contada paso a paso),
  `Sim.lote({clave: enc…}, n)` (muchas, en segundo plano; `Sim.LOTE.resultados`), y para armar variantes `Sim.nivelar`, `Sim.ponerArma`,
  `Sim.ponerEquipo`, `Sim.ponerHab`. Los datos de la partida van en `herramientas/sim-datos/*.json` (exportados a mano de Firebase; **no se
  suben al repo**: `.gitignore`). Las posiciones son una línea (1-D), la IA es simple y varias mecánicas del mapa no se simulan (ver el
  reporte `docs/reporte-encuentro-origen-2026-10-22.md`).

## Sobre los efectos escritos en Detalle

Nada entiende lenguaje natural: si un ítem describe un efecto nuevo, queda como texto. `detectar_efectos.py` avisa cuáles
quedaron sin mecánica, para revisarlos a mano. Los efectos que actúan sobre el rival al golpear (Rompe armadura, Sangrado…)
son intencionalmente manuales.
