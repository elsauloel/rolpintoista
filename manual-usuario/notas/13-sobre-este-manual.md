+++
capitulo: Sobre este manual
icono: 📝
resumen: Cómo se mantiene, cómo completarlo y qué cambió con las iteraciones del sistema.
+++

+++
titulo: Cómo completar y mantener este manual
alias: [Mantener el manual, Editar el manual, Contribuir al manual, Escribir una nota]
tags: [manual]
estado: confirmado
+++
Este manual está pensado para **crecer de a poco**. Se escribió a partir de todo lo conversado hasta hoy; lo que no estaba claro quedó **abierto a propósito** (recuadros violetas ❓) para que el dueño del sistema lo vaya completando.

## Dónde ver lo que falta
El botón **📌 Pendientes** del manual junta en una sola pantalla:
- todas las **preguntas abiertas** (agrupadas por capítulo),
- las notas en **borrador** o **pendientes**,
- los **enlaces a notas que todavía no existen**.

## Cómo se edita
El manual es un conjunto de archivos de texto en `manual-usuario/notas/`, uno por capítulo (`01-empezar.md`, `02-mundo.md`…). Adentro hay **varias notas**; cada una empieza con una cabecera entre líneas `+++`:

```
  +++
titulo: Nitros (No2)
alias: [No2, Nitro, Nitros]
tags: [recursos, combate]
estado: confirmado
  +++
Texto de la nota…
```

- **`alias`**: otros nombres con los que se encuentra y se enlaza (el buscador y los `[[enlaces]]` los usan).
- **`estado`**: `confirmado`, `borrador` o `pendiente`.
- **`tags`**: etiquetas del árbol lateral.

## Escritura
| Para… | Escribí |
|---|---|
| Enlazar a otra nota | `[[Nombre de la nota]]` |
| Enlazar con otro texto | `[[Nombre de la nota\|texto que se ve]]` |
| Enlazar a una sección | `[[Nota#Sección]]` |
| Una pregunta abierta | `> [!question] Título` y debajo la pregunta |
| Un consejo / advertencia / ejemplo | `> [!tip]`, `> [!warning]`, `> [!example]` |

Si el nombre de la nota **no existe**, el enlace queda gris con lápiz ✎: es una nota por escribir, y aparece en Pendientes.

## Publicar los cambios
Después de editar, se corre `herramientas/compilar_manual.py` (arma `datos/manual.json`), y se sube el resultado. El manual publicado lee ese archivo.

> [!tip] Se puede abrir con Obsidian
> Los archivos usan la misma sintaxis (`[[enlaces]]`, `> [!callouts]`) que Obsidian, salvo la cabecera `+++`, que es propia de este sistema.

+++
titulo: Historial de versiones
alias: [Iteraciones, Iteración 2, Bonos, Acciones, Cambios del sistema, Versión vieja]
tags: [manual]
estado: borrador
+++
Cambios importantes del sistema, para entender material viejo:

| Cambio | Antes | Ahora |
|---|---|---|
| **Iteración 2** (2026-09-04) | **Bonos** y **Acciones** por turno | [[SP]] (Special Power) y [[Nitros (No2)]] |
| **Movimiento** | Un stat aparte | Se paga con [[Nitros (No2)\|Nitros]] |
| **Inteligencia → Especial** (2026-09-18) | El atributo se llamaba "Inteligencia" | Se llama [[Especial]]; "Inteligencia" ahora es el presupuesto para [[Inteligencia y habilidades sociales\|habilidades sociales]] |
| **Escala de Tipos** | Tipos 2, 4, 6, 8, 10 | Tipos **4, 6, 8, 10, 12** ([[Daño y Tipo de arma]]) |
| **Piezas de defensa** | Cascos/guantes/piernas/botas blandos y rígidos | Una sola categoría plana por ranura; solo el torso distingue blanda/rígida |
| **Skill de clase** | 1 de tu clase, 2 de otra, 3 custom | **1** de clase (cualquiera), **2** custom ([[Puntos de Job]]) |
| **Wildcards** | Contador diario para repetir tiradas | De vuelta en la ficha (2026-09-22) como contador libre, sin mecánica todavía (ver [[Tiradas y dados]]) |
| **Sync de datos** | Subir/Bajar datos por GitHub | Todo en vivo, se guarda solo |

## La campaña vieja
"Piratas en el espacio" se jugaba con la versión anterior del sistema. Quedó archivada: ver [[Piratas en el espacio]].
