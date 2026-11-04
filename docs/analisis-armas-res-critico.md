# Armas y la Resistencia a crítico nueva: análisis general

Paso 5 del [plan](plan-resistencia-critico.md) (después del equipo). **Solo análisis: no se cambió nada.** Fecha: 2026-11-04.

## La cuenta del crítico hoy (`comun/critico.js`)
rango = Tipo del arma − Crítico frecuente + Resistencia del defensor (− lo que el arma ignore), **mínimo 2**. Nivel = (PdG − Evasión) ÷ rango.

## «Ignora N» y «Crítico frecuente» (pregunta del dueño: «¿es más o menos lo mismo?, ¿se puede reemplazar?»)
- **Contra alguien con resistencia, son exactamente lo mismo**: cada punto de Ignora le saca un punto al rango, igual que el frecuente.
- **Contra alguien sin resistencia (o con menos que N), Ignora no hace nada; el frecuente sí.** O sea, Ignora es un frecuente que solo sirve
  contra blindados.
- **Detalle por el mínimo de 2:** en un arma Tipo 4, del 3.er punto de frecuente en adelante ya no baja el rango contra alguien sin resistencia
  (4 − 3 = 1 → queda en 2): **esos puntos de más ya funcionan como Ignora**. En Tipo 6, desde el 5.º.
- Por eso, **sí se puede reemplazar**: «Ignora N» → «Crítico frecuente +N». Es una mejora chica para el arma (gana crítico también contra
  gente sin resistencia) y simplifica las reglas (una cosa menos para explicar y automatizar).

## Qué hay en el catálogo
- **Armas (sin archivados):** Común 156 · Buena 88 · Raro 77 · Excepcional 19 (más las varitas, que no critean por Tipo).
- **Crítico frecuente:** casi solo en Tipo 4 y 6 y desde Buena (Común: 3 armas de Tipo 6; Buena: 5; Raro: 6; Excepcional: 5). Tipo 8: una sola
  (Buena); Tipo 10: ninguna. Encaja con «las armas grandes casi sin crítico».
- **Crítico potente:** 9 Comunes (Tipo 4 y 6), 6 Buenas, 10 Raras, 9 Excepcionales.
- **Ignora N:** **9 armas, ninguna Común ni Buena** (5 Raras, 4 Excepcionales; todas Tipo 4 salvo la Katana, Tipo 6), **2 armas naturales** de
  invocaciones/creeps (Mandíbula trituradora, Pico afilado: Ignora 1) y **1 habilidad de creep** (Golpe doble de El origen: Ignora 2).

## Cómo cambió el valor de cada cosa
- **Crítico frecuente: vale más que antes.** Antes un punto de resistencia borraba un nivel entero y el frecuente casi no lo compensaba; ahora lo
  compensa punto por punto. Contra un rival equipado (que con el equipo nuevo junta 2–4 de Res. T4) el frecuente es lo que te devuelve el crítico.
- **Crítico potente: igual que antes** (no lo toca la resistencia: solo importa cuando ya hay crítico). Vale un poco menos contra blindados porque
  hay menos críticos.
- **Ignora N: vale bastante menos** (antes borraba niveles enteros de resistencia; ahora es «frecuente solo contra blindados»).

## Pasos propuestos (de a uno, como con el equipo)
1. **Ignora N → Crítico frecuente +N** — ✅ **hecho (2026-11-04; dueño: «vamos a reemplazar ignora por crítico frecuente, así lo mantenemos
   más simple»)**. Se suma al frecuente que ya tenía el arma:
   | Arma / habilidad | Tier | Frecuente nuevo |
   |---|---|---|
   | Estoque de duelista (T4) | Raro | +1 |
   | Katana (T6) | Raro | +1 |
   | Rompemalla (T4) | Raro | +1 |
   | Misericordia (T4) | Raro | +1 |
   | Aguja de la vigilia eterna (T4) | Raro | +2 (tenía +1) |
   | Perforacotas (T4) | Excepcional | +1 |
   | Estoque del campeón (T4) | Excepcional | +2 |
   | Misericordia del verdugo (T4) | Excepcional | +2 |
   | Aguja de los mil años (T4) | Excepcional | **+3** (tenía +1): el 3.er punto funciona como el viejo Ignora (rango mínimo 2) |
   | Arco perforante, Ballesta La Viuda, ⚠️ Facón de Martín Fierro | archivados | +1, +2, +5 (tenía +4) |
   | Flecha de aguja | Buena (consumible) | +1 (con Crítico potente +1) |
   | Capucha de las sombras silentes | Raro (cabeza) | «Crítico frecuente +1 al atacar sorprendiendo» (era Ignora 1, a mano) |
   | Mandíbula trituradora, Pico afilado | armas naturales | +1 |
   | Tiro certero (creep) | habilidad | +2 |
   | Golpe doble (plantilla de El origen) · Backstab (clase) | habilidades | +1 |
   Además: las copias del Estoque de duelista, la Katana y la Capucha en el equipo de los creeps (`comun/creeps-base.js`), el glosario (Res. crítico
   explica la regla nueva) y los asistentes (ya no ofrecen «Ignora»; un arma vieja que lo tenga lo muestra para ponerlo en 0, y una habilidad vieja lo
   pasa sola al Crítico frecuente al editarla). El duelo sigue leyendo `ignoraResistCrit` para las copias viejas que ya están en las partidas
   (El origen no se tocó). Prueba nueva en `comun/pruebas.html`: nada de fábrica usa Ignora.
2. **Medir el frecuente y el potente** con la regla nueva (como se hizo con la resistencia: cuánto valen contra Defensa +1 / PdG +1), para saber si
   las armas con frecuente quedaron caras o baratas. → **Medido:** [medicion-critico-frecuente.md](medicion-critico-frecuente.md) (Frecuente +1 ≈ +1½ de daño en Tipo 4, +1¼ en 6, +1 en 8, +½ en 10; Potente +1 ≈ ¼; las armas que los tienen quedaron caras).
3. **Revisar las armas Comunes y Buenas de Tipo 4 y 6 con frecuente o potente** con esos pesos (son pocas: ~20).
4. Raras y Excepcionales, aparte (como con el equipo).
