# Sondeo de mecánicas: dónde vive cada una (armas · equipo · creeps)

> Pedido del dueño (2026-09-25): "que tanto las armas, como las armaduras, como los creeps sean **ejemplo de la diversidad de mecánicas** que tiene el juego para ofrecer. Hacer un sondeo de todas las mecánicas posibles y buscarles la vuelta para que tengan alguna representación en distintos espacios del juego." Además: resistencias a tipos de daño mágico (equivalentes a las fuentes que haya) y, después, **rework de las skills de los creeps** coordinado con el equipo.
> Inventario de partida: [`guia-de-diseno.md`](guia-de-diseno.md) §2. Este documento es una **hoja de trabajo**: el asistente propone, el dueño ajusta. La columna de creeps está **por verificar** contra `comun/skills-creep-base.js` y `comun/creeps-base.js` cuando llegue ese rework.
> Leyenda: ✅ ya tiene representación · 🟡 poca o solo en un lugar · ⬜ vacío (oportunidad) · ✋ hoy se aplica a mano · ⚙ ya automatizado.

## 1. Matriz de mecánicas (primer sondeo)
| Mecánica | Armas | Armas mágicas / hechizos | Equipo (defensa) | Creeps y sus skills | Notas / ideas |
|---|---|---|---|---|---|
| **Crítico** (frecuente / potente / resistencia) | ✅ T4–T6 | ⬜ no critica (regla) | ✅ Res. por slots (P114) | 🟡 ¿creeps críticos? | Solo lo físico critica. Creeps con "ojo crítico" o "piel dura" (Res.). |
| **Sangrado** (acumulable) | ✅ cortantes | ⬜ | ⬜ | ✅ probable | Equipo: "Coagulación extrema" como efecto al equipar. |
| **Veneno / Veneno severo** | ✅ habilitado | ⬜ | ⬜ | ✅ probable | Equipo: resistencia a veneno (inmunidad ya cableada a 6 ítems). |
| **Rompe armadura / Armadura rota** | ✅ hachas | ⬜ | 🟡 Óleo reparador | ✅ probable | Equipo que **impide** Armadura rota (aleación) o la cura al equipar. |
| **Demora / Aturdir / Stun** (iniciativa) | ✅ contundentes | ✅ Reloj de arena, Pausa | 🟡 Res. a CC | ✅ probable | Equipo: "Firmeza" (no bajás en la tabla). Creeps: "Grito que retrasa". |
| **Lisiado / Rengo / Inmovilizado** | ✅ punzantes | ✅ Bastón de la pausa | ⬜ | ✅ probable | Botas que anulan Rengo; creeps araña que inmovilizan. |
| **Fuego / terreno incendiado** | ✅ Prende fuego | ✅ Vara de la pira | ⬜ **Res. fuego** | 🟡 | Creeps de fuego, trampas de fuego. |
| **Escarcha acumulable / hielo** | ⬜ | ✅ Estalactita, Vara del deshielo | ⬜ **Res. hielo** | 🟡 | Criaturas de hielo, aura de frío. |
| **Parálisis / rayo en cadena** | ⬜ | ✅ Cetro cíclico | ⬜ **Res. rayo** | 🟡 | Mecánica nueva: pocos creeps la usan todavía. |
| **Daño arcano (directo a la vida)** | ⬜ | ✅ armas de daño | ⬜ **Res. arcana** | 🟡 | Ver §2: cuánta resistencia hace falta. |
| **Excedente de vida / Drena vida** | ✅ Drena vida | ✅ Rayo cíclico | ⬜ | 🟡 | Creeps vampiro; equipo "Cáliz". |
| **Escudo especial / Barrera** | ⬜ | ⬜ | 🟡 | 🟡 | Escudos "con barrera" (se recarga por turno). |
| **Regeneración / Invulnerable** | ⬜ | ⬜ | ⬜ (efecto al equipar) | 🟡 | Amuletos y anillos que dan estado al equipar. |
| **Sigilo / visión / niebla / detección** | ⬜ | ✅ Bruma, Lente | ⬜ | 🟡 | Capas de sigilo; creeps con olfato/visión térmica. |
| **Teleport / portales** | ⬜ | ✅ Dintel, Trueque, Ancla | ⬜ | ⬜ | Creeps que "saltan" o abren portales (mecánica ya en el mapa). |
| **Terreno y formas** (muro, línea, cono, flor) | ⬜ | ✅ Sendero, Muro, Marea | ⬜ | 🟡 | Creeps que dejan terreno (baba, brasas). |
| **Trampas** (colocar / desarmar) | ⬜ | ⬜ | ⬜ | ✅ Tramperos | La palabra "trampa" solo para colocar. Ítems que colocan: kits del catálogo. |
| **Iniciativa** (subir/bajar, tabla) | ⬜ | ✅ | ⬜ | ⬜ | Creeps rápidos que actúan dos veces; "Iniciativa" en equipo ya existe. |
| **Empujar / atraer / colisión** | ⬜ | ✅ Marea | ⬜ | ⬜ | Creeps embestidores. |
| **Sobrepeso / peso** | ✅ | ✅ (báculos) | ✅ | ⬜ | Creeps grandes que rompen el peso del grupo (ya hay Crg.Max). |
| **Nitros (No2)** como costo | ✅ (por Tipo/peso) | ✅ | 🟡 (bonos) | ✅ | Recurso muy preciado: ítems que **regalan** No2 son legendarios. |
| **Marcas y ventajas** (Marca del cazador, Afortunado) | ⬜ | ✅ Varita de la marca | ⬜ | ⬜ | |
| **Copiar / repetir** (Ecualizador, Eco) | ⬜ | ✅ | ⬜ | ⬜ | Creeps "espejo". |
| **Estados a otros** (dar un buff / debuff) | ⬜ | ✅ | ⬜ | 🟡 | Auras de creep (ya hay auras en el mapa). |
| **Sagrado / sombra / ácido** (candidatos) | ⬜ | ⬜ | ⬜ | ⬜ | Elementos futuros: ácido corroe Defensa, sagrado contra no-muertos, sombra baja visión. |

**Lectura rápida:** hoy las armas físicas ya cubren crítico, sangrado, veneno, rompe armadura, demora y lisiado. Las armas mágicas (borrador) cubren forma, portales, visibilidad e iniciativa. **Lo que menos representación tiene es el equipo defensivo** (casi todo es Defensa y Res. crítico) y **los creeps con mecánicas nuevas** (Parálisis, Escarcha, portales, terreno). Ahí está el mayor espacio para ampliar.

## 2. Resistencias a tipos de daño mágico (propuesta, sin responder)
El dueño pidió resistencias que sean **más o menos equivalentes a las fuentes de daño mágico** que existan. Hoy las fuentes son **arcano, fuego, hielo y rayo** (candidatos: ácido, veneno, sagrado, sombra). Recordatorio: **no hay "defensa mágica" general** (el daño mágico va directo a la vida y por eso es caro) y **la Res. Mg es resistencia a efectos**. Lo que se propone acá es una **resistencia por elemento**, opcional, del equipo:
- **Res. fuego / hielo / rayo / arcano N:** resta **N puntos al daño** de ese elemento por golpe (piso 0) y baja **10 % × N** la probabilidad del estado que ese elemento aplica (Prende fuego, Escarcha, Parálisis; el arcano no tiene estado). Ojo con la regla de fuego y hielo (se cancelan): una pieza "de fuego" podría dar Res. fuego + vulnerabilidad al hielo (trade-off).
- **Escasez por slot** (equivalente a P114): **arcano casi nadie la da** (es el elemento "puro", el más peligroso): solo anillos y amuletos legendarios; **fuego / hielo / rayo** las dan piezas temáticas de 1 o 2 slots cada una (fuego: botas y torso; hielo: manos y capa; rayo: casco y cinturón) y con tope +1 (Raro) a +3 (Legendario).
- **Regla de equivalencia:** si hay N fuentes de daño de un elemento en el catálogo (armas, hechizos, creeps), tiene que haber **una cantidad comparable de piezas de resistencia** a ese elemento; se cuenta en la auditoría.
**Preguntas:** (1) ¿Te cierra "resta N al daño + baja la chance del estado"? (2) ¿El arcano casi sin resistencia (solo legendarias)? (3) ¿Sumamos ya ácido/sagrado/sombra como elementos, o después? (4) ¿Vulnerabilidades (resistencia negativa) como trade-off de piezas temáticas?

## 3. Cómo seguimos (propuesta)
1. **Equipo:** cerrar la auditoría de slots de Resistencia a crítico (`datos/auditoria-defensa.html`), y **ampliar el equipo con las mecánicas de la matriz** (estados al equipar, Res. elementales, sigilo, terreno…). Los ítems nuevos van a `datos/defensa-nuevos.json`.
2. **Sondeo de creeps:** relevar los 173 creeps base y sus 321 habilidades y marcar en esta matriz qué mecánicas ya tienen; los ⬜ son los huecos a llenar.
3. **Rework de las skills de creep:** para cada familia de creep, elegir 2–3 mecánicas de la matriz como identidad y coordinarlas con el equipo que suelta (armas y armaduras del mismo "mundo").
4. **Después:** cupo mínimo de armas mágicas en el generador de tiendas, y más armas mágicas.
