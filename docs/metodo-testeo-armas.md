# Método: ronda de testeo de un tipo de arma y un tier

> Pedido del dueño (2026-10-11): «eso mismo que hiciste recién con las ballestas, anotalo como método para cuando te pida testear un tipo y un
> tier». Cuando diga «toca testear *tal tipo* en *tal calidad*», se sigue esto. La lista de lo que falta testear está en `pendientes.md`
> («🧪 Rondas de testeo por tipo y tier»). El ejemplo completo es el de las ballestas Comunes: `revision-ballestas.md`.

## 1. Inventario
- Listar del catálogo (`comun/catalogo.js`) las armas de ese tipo y esa calidad que se venden (sin `archivo` ni `soloBotin`): nombre, dados, daño
  fijo, Perfora, Recarga si tiene, bonos, efectos al golpear y rasgos.
- Contar cuántas hay y compararlo con las demás familias de esa calidad (referencia 2026-10-11: ~24 Comunes y ~19 Buenas por familia).

## 2. La pelea simulada (lo que mide)
- **Herramienta:** `herramientas/combate_ballestas.py` (peleas de varias rondas contra el mismo blanco). Hoy sirve para ballestas; para otro tipo
  hay que generalizarla (ver «Falta» abajo). Reglas: las de `balance_combate.py` (tiradas, crítico, Defensa, No2 por turno = Agilidad, costo de
  cada ataque) más lo que se acumula ronda a ronda.
- **Nivel según la calidad:** Común → nivel 1 · Buena → nivel 3 · Rara → nivel 5 (lo que mide la herramienta; más arriba, a criterio).
- **4 rondas**, unas 800 peleas por casilla (subir si los números saltan mucho).
- **Atacantes:** Shooter, Asalto, «MonoDes» (casi todo a Destreza: el que más puede romper un arma de crítico), Mago y Warrior; si el tipo es de una
  clase en particular, esa clase primero.
- **Blancos:** liviano, medio y pesado de la curva de ese nivel, y los de las mecánicas condicionales (un pesado **Sentado** para Remate, una
  **bestia** para Matabestias, etc.).
- **Qué se mira:** el daño total con el arma ÷ el de su mejor arma cuerpo a cuerpo de la misma calidad, en las mismas rondas (100 % = lo mismo).
  Banda buscada: **74–106 % contra el blanco medio** para la clase que la usa. Además: contra el pesado, si le hace algo; si le sirve a una clase
  sin Destreza (el Mago); y lo que deja en el blanco (por ejemplo, la Defensa que le queda al pesado con Rompe armadura).
- **Qué cuenta la pelea:** Perfora, Crítico frecuente / potente, Emboscada, Remate, Tensar, Llega cargada, Doble cuerda, Tiro rápido, ahorro de No2,
  Rompe armadura (%, doble, seguro con crítico), Sangrado y Veneno que se acumulan, Matabestias. **No cuenta** (avisar en el informe): Lisiado,
  Rengo, Demora, Derribar, Afinidad (sin munición especial), alcance y distancia, Parry y Bloqueo del defensor, Atraviesa escudos.

## 3. Buscar lo que rompe
- **Rompe:** la clase que la usa pasa de ~130 % contra el medio, o una mecánica condicional pasa de ~150 % en su caso (contra un Sentado, una bestia…).
- **Floja:** queda muy por debajo de la banda sin una mecánica que lo compense, o no le hace nada a nadie contra el pesado (decirlo: puede ser a
  propósito, como las ballestas «de tirador» sin Perfora).
- **Mellizas:** dos que quedaron iguales (mismo daño y misma mecánica).
- **Mecánicas mal cobradas:** si una mecánica rinde mucho más de lo que la cobra la calculadora (pasó con Tensar), corregir su valor en
  `herramientas/calculadora_armas.py` y anotar la medida en el comentario.

## 4. Proponer, medir y cargar
- Para cada una que rompe o floja: **mover una perilla por vez** (daño fijo, Perfora, el número de la mecánica, el %), volver a medirla y quedarse
  con la que entra en la banda y en su calidad (`calculadora_armas.py`).
- **Mostrarle al dueño una tabla**: la que rompe, por qué, y el ajuste con su número nuevo. Lo que es una decisión de diseño (por ejemplo, una
  mecánica que rinde mucho en equipo) se plantea aparte, con opciones.
- **Con su OK:** cargar en `comun/catalogo.js` (precio con `precio_libre`; el texto corto con `ItemCorto.armaEsencial` desde el navegador, para que
  quede igual que en el juego), subir la versión (`?v=`) del catálogo y de `vtt-hexgrid/js/11` y `12` en `mapa.html`, correr `comun/pruebas.html`
  (todo en verde) y subir.
- **Anotar** en la hoja de esa revisión (como `revision-ballestas.md`): qué se midió, qué rompía, qué se cambió y lo que quedó para mirar.

## Falta (para usarlo con cualquier tipo)
- `combate_ballestas.py` es solo para ballestas (Recarga, munición). Para cuerpo a cuerpo y arcos hay que generalizarlo: el costo de ataque normal
  (Tipo ÷ 2 y después el Tipo), la Fuerza (entera cuerpo a cuerpo, la mitad en el arco) y los efectos de cada familia. La planilla medida
  (`tabla_ballestas.py`) también se puede hacer por familia (está pendiente para los arcos).
