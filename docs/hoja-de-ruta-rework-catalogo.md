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
| 1 | **Armas no mágicas, elemento por elemento**: Tipo y Peso con costo en Nitros → empuñadura y mano izquierda → Rango/Alcance → bonos → efectos al golpear por familia → crítico frecuente/potente → estado al equipar → tier/calidad/precio | 🔲 Próximo |
| 2 | **Equipo defensivo**: Defensa, resistencias a crítico por slots (P114), resistencias elementales, anillos (mágicos, uno por mano, escasos y caros) | 🔲 |
| 3 | **Magia**: armas de daño y de efecto, paralelismos con las físicas usando matemática (daño en función de Nitros, SP, peso); tipos de daño arcano/fuego/hielo/rayo (P116). El dueño pidió ayuda para pensar los paralelismos | 🔲 Después de la fase 1 |
| 4 | **Motor de calidad, tier y precio** (P112): relevancia de cada elemento (tabla en la guía §0b), peso de los efectos, fórmula | 🔲 |
| 5 | **Crítico nuevo en el código** (ficha y mapa): PdG − Evasión ≥ rango, niveles, N − Resistencia d20, doble/triple/cuádruple daño; nuevos estados Crítico frecuente/potente, Parálisis, Escarcha acumulable | 🔲 (cambio grande, en pasos chicos) |
| 6 | **Generar el catálogo por grupos** (sets e ítems imaginados en tandas) y **auditar** con el dueño | 🔲 |
| 7 | **Migrar** lo aprobado al catálogo (`herramientas/`, editor, sincronía con `main`), revisar el manual y la Guía de diseño (`comun/guia-diseno.js`) | 🔲 |

## Decidido hasta ahora (resumen; el detalle está en las preguntas)
- **Nitros = recurso muy preciado**; peso = relevancia intermedia; SP barato para magos (regulador de la magia); la magia no tiene defensa: daño mágico directo a la vida y, por eso, caro (guía §0).
- **Crítico (P113/P115):** PdG − Evasión ≥ rango (= Tipo) → N = diferencia ÷ rango; Resistencia resta niveles; N − R d20 y vale el mejor; multiplicador **doble/triple/cuádruple daño** (7+/17+/20) sobre todo el daño; menos de 7 solo ignora armadura; **frecuente** baja el rango (mín. 2), **potente** baja los umbrales (1 a 1, 1 a 2, 1 a 3; piso 1). Universo: Tipo 4 más frecuente, Tipo 6 más potente, ambos con las dos.
- **Familias de arma (guía §1):** hachas → Rompe armadura, contundentes → Knockdown, punzantes → Lisiado, cortantes → Sangrado; efectos en tres niveles (casa / habilitado / excepcional).
- **Resistencia a crítico (P114):** más escasa cuanto más alto el Tipo, regulada por slots (Tipo 10 solo cascos; Tipo 8 dos slots; Tipo 6 tres; Tipo 4 más).
- **Armas mágicas (P116):** de daño y de efecto; varita básica 1d4 por 1 Nitro (calidad baja), buena calidad 1d6 por 1 Nitro; efectos de arma 1–3 SP; elementos: arcano, fuego (área + terreno incendiado), hielo (Escarcha acumulable), rayo (Parálisis); fuego y hielo se cancelan.
- **Chispazo** ya rebalanceado (SP 1, No2 1, 1d6; a auditar).

## Pendiente de definir (para las próximas conversaciones)
- Slots exactos por Tipo de resistencia a crítico; el Tipo 12.
- Fórmula de calidad/tier/precio y la tabla de relevancias (varias filas "por definir").
- Todo el diseño de armas no mágicas por elemento (fase 1).
- Efecto de casa de las familias explosivos y de rango; nombre definitivo del efecto de iniciativa (Knockdown).
- Detalles de Escarcha acumulable y de fuego/hielo (cuánto por stack, cómo se cancelan).
- Skills nuevas (Punto débil, Temple aprobadas; Ojo de asesino, Golpe brutal, Marca del cazador a revisar) y las skills de Mago con daño mágico por revisar (Rayo Mágico, Orbe, Tormenta, Ráfaga).
