# Hoja de ruta: rework del catálogo (2026-09-25)

> Tarea grande e importante que se va a hacer **paso a paso**. Esta hoja junta lo decidido, lo que falta y el orden. Las reglas y los números salen de la
> conversación con el dueño y están en [`guia-de-diseno.md`](guia-de-diseno.md) (criterios y tablas) y en [`preguntas-abiertas.md`](preguntas-abiertas.md)
> (P112–P116). Regla de trabajo: **el asistente propone en tandas, el dueño audita** (y lo revisa con su grupo). Nada se carga en el catálogo sin auditar.
> Recordar: el catálogo vive en `datos/catalogo.json` (se edita con `datos/catalogo-editor.html`, nunca a mano; sincroniza por GitHub contra `main`,
> ver [`../datos/CLAUDE.md`](../datos/CLAUDE.md)) y **sigue sin imágenes**.

## Fases
| # | Fase | Estado |
|---|---|---|
| 0 | **Parámetros de diseño** (criterios generales, crítico, escasez de resistencias, familias de arma, magia) | 🟢 En marcha: la mayor parte dictada, ver "Decidido" |
| 1 | **Armas no mágicas, elemento por elemento**: Tipo y Peso con costo en Nitros → empuñadura y mano izquierda → Rango/Alcance → bonos → efectos al golpear por familia → crítico frecuente/potente → estado al equipar → tier/calidad/precio | 🟢 **Arrancó (2026-09-25):** hoja de trabajo en [`rework-armas.md`](rework-armas.md) |
| 2 | **Equipo defensivo** (después de las armas; ojo: equiparar en frecuencia la Resistencia a crítico con las armas de crítico mejorado): Defensa, resistencias a crítico por slots (P114), resistencias elementales, anillos (mágicos, uno por mano, escasos y caros) | 🟡 slots aprobados; auditoría en curso, ver [`rework-defensa.md`](rework-defensa.md) y [`sondeo-mecanicas.md`](sondeo-mecanicas.md) |
| 3 | **Magia**: armas de daño y de efecto, paralelismos con las físicas usando matemática (daño en función de Nitros, SP, peso); tipos de daño arcano/fuego/hielo/rayo (P116). El dueño pidió ayuda para pensar los paralelismos | 🔲 Después de la fase 1 |
| 3b | **Equipo defensivo Común para casters** (dueño, 2026-10-05): cuando estén las armas especiales Comunes, volver a todos los equipables defensivos Común e imaginar efectos y mecánicas pensadas para un caster, costearlos y sumarlos. Ejemplo, un clásico del grupo: el **Sombrero humectante** (cabeza, sin Defensa, +1 a la regeneración de SP) | 🔲 Después de las armas especiales Comunes |
| 4 | **Motor de calidad, tier y precio** (P112): relevancia de cada elemento (tabla en la guía §0b), peso de los efectos, fórmula | 🔲 |
| 5 | **Crítico nuevo en el código** (ficha y mapa): PdG − Evasión ≥ rango, niveles, N − Resistencia d20, doble/triple/cuádruple daño; nuevos estados Crítico frecuente/potente, Parálisis, Escarcha acumulable | 🔲 (cambio grande, en pasos chicos) |
| 6 | **Generar el catálogo por grupos** (sets e ítems imaginados en tandas) y **auditar** con el dueño | 🔲 |
| 7 | **Migrar** lo aprobado al catálogo (`herramientas/`, editor, sincronía con `main`), revisar el manual y la Guía de diseño (`comun/guia-diseno.js`) | 🔲 |
| 8 | **Ampliación del catálogo** (dueño, 2026-10-05): cuando el equipo básico esté consolidado y lo esencial del sistema cerrado, el dueño va a pedirlo. Ahí se retoman las ideas que quedaron para después (lista abajo, «Para la ampliación del catálogo») | 🔲 Después de lo básico |

## Decidido hasta ahora (resumen; el detalle está en las preguntas)
- **Nitros = recurso muy preciado**; peso = relevancia intermedia; SP barato para magos (regulador de la magia); la magia no tiene defensa: daño mágico directo a la vida y, por eso, caro (guía §0).
- **Crítico (P113/P115):** PdG − Evasión ≥ rango (= Tipo) → N = diferencia ÷ rango; Resistencia resta niveles; N − R d20 y vale el mejor; multiplicador **doble/triple/cuádruple daño** (7+/17+/20) sobre todo el daño; menos de 7 solo ignora armadura; **frecuente** baja el rango (mín. 2), **potente** baja los umbrales (1 a 1, 1 a 2, 1 a 3; piso 1). Universo: Tipo 4 más frecuente, Tipo 6 más potente, ambos con las dos.
- **Familias de arma (guía §1):** hachas → Rompe armadura, contundentes → Demora (ex Knockdown), punzantes → Lisiado, cortantes → Sangrado; efectos en tres niveles (casa / habilitado / excepcional).
- **Resistencia a crítico (P114):** más escasa cuanto más alto el Tipo, regulada por slots (Tipo 10 solo cascos; Tipo 8 dos slots; Tipo 6 tres; Tipo 4 más).
- **Armas mágicas (P116):** de daño y de efecto; varita básica 1d4 por 1 Nitro (calidad baja), buena calidad 1d6 por 1 Nitro; efectos de arma 1–3 SP; elementos: arcano, fuego (área + terreno incendiado), hielo (Escarcha acumulable), rayo (Parálisis); fuego y hielo se cancelan.
- **Chispazo** ya rebalanceado (SP 1, No2 1, 1d6; a auditar).

- **Armas híbridas (P117):** físicas de tier alto con efectos y daño mágico por elemento; raras como mínimo.

## Pendiente de definir (para las próximas conversaciones)
- Slots exactos por Tipo de resistencia a crítico; el Tipo 12.
- Fórmula de calidad/tier/precio y la tabla de relevancias (varias filas "por definir").
- Todo el diseño de armas no mágicas por elemento (fase 1).
- Efecto de casa de las familias explosivos y de rango; nombre definitivo del efecto de iniciativa (Knockdown).
- Detalles de Escarcha acumulable y de fuego/hielo (cuánto por stack, cómo se cancelan).
- Skills nuevas (Punto débil, Temple aprobadas; Ojo de asesino, Golpe brutal, Marca del cazador a revisar) y las skills de Mago con daño mágico por revisar (Rayo Mágico, Orbe, Tormenta, Ráfaga).

## Para la ampliación del catálogo (se retoma cuando el dueño lo pida)
Ideas que salieron mientras se trabajaba lo básico y quedaron para después, a propósito («de lo básico a lo complejo»). Al terminar lo esencial,
el dueño va a pedir pasarlas todas a ese momento.
- **Armas especiales (mágicas) más allá de las varitas, los báculos y los orbes** (2026-10-05, `rework-armas.md`): **grimorios** (vinculados a los
  pergaminos), **instrumentos** (flauta, campana, tambor), **guantes o brazales rúnicos**, **dagas rituales y demás armas híbridas** (físicas con
  efecto especial), y las Excepcionales y Legendarias de las armas especiales.
- **Guantes mágicos** y demás piezas de equipo con efectos especiales.
- **Botas Raras que dejan levitar** (ignoran el terreno y las trampas).
- **Hechizos (no armas)**: Miedo, Sueño, intercambiar lugar, mover a un aliado, señuelo (un token falso que atrae ataques).
- **Armas de rango con «grappling hook»** (atraer al rival), cuando toque su rework.
- **Daño que crece si se repite sobre el mismo objetivo** (armas especiales).
- **Armas especiales, lo que quedó para después** (2026-10-05): **combos entre elementos** (aceite + fuego, hielo apaga fuego, viento agranda la nube,
  tóxico + fuego explota) · **defensa del portador en báculos híbridos** (+Bloqueo y +Parry, espinas mágicas, reflejar un proyectil, escudo al castear,
  absorber un hechizo como SP) · **reacción en turno ajeno** (escudo o contrahechizo cuando te atacan, a costo doble como el Flash) · **marca de cosecha**:
  deja una marca X turnos y, si el marcado muere con ella, recuperás SP.
- **Ataque de oportunidad mágico como habilidad pasiva** (2026-10-05, atendible).
- **Pergaminos con efectos fuera de combate** (2026-10-05): ilusión, abrir cerraduras, encender fuego, levantar objetos a distancia, cambiar la voz o la
  cara, hablar con animales, detectar magia o tesoros.
- Lo que está en `pendientes.md` como «a futuro» del inventario: solicitar un ítem de otro jugador, baúles móviles, kit de herramientas.
