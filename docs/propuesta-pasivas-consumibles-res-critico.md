# Propuesta: pasivas y consumibles para la Resistencia a crítico

Parte del [plan](plan-resistencia-critico.md). Fecha: 2026-11-05.

> **✅ Cargado (dueño, 2026-11-05).** Pasivas: **Callo de batalla**, **Mañas de sobreviviente** y una nueva, **Contra las cuerdas** (dueño: «una que si
> estás en menos de un cuarto de tu HP máximo, tenés más 2 a resistencia a todos los críticos»; 1 Job; se suma a Mañas: bajo ¼, +3). Las dos de la vida
> las suma solo el duelo (`Combatiente.resCritPorVida`, stats `rescritmitad` / `rescritcuarto`). **Ojo crítico** sin el «⚠ a revisar». Consumibles:
> **Grasa de carpincho** (5 turnos, no hasta el fin del combate), **Ungüento del herrero** (repara **1 punto** de Armadura rota de la pieza puesta más
> dañada —Defensa y durabilidad— y +1 T4 por 3 turnos; en un creep saca 1 stack; `reparaArmRota`), **Pergamino de Temple** / **mayor** / **grupal**
> y **Aceite del punto débil**. **No**: Aguante, Ensañado, Tiza de sastre. **Pendientes de respuesta**: Ojo para las grietas («¿no existe ya una
> pasiva de +1 frecuente a secas?» → sí, Ojo crítico) y Cuero duro. El Punto débil en el cuadro del crítico se dibuja con 💢 (el ícono del estado).
> Probado en «Claude · pruebas» con Prueba Uno: Ungüento (Armadura rota 2 → 1, durabilidad 4 → 5) y Grasa (estados de 3 y 5 turnos), Res. T4 6/15
> de vida 2 → 4, Res. T8 con 3 de vida 3 y con la vida llena 0.
Pedido del dueño: «si no existe ninguna pasiva ni ningún consumible que interactúe con la resistencia del crítico, de paso ya diseñaría alguno».

## Lo que ya hay
- **Pasivas:** ninguna da Resistencia a crítico. Sí existe **Ojo crítico** (1 Job, Crítico frecuente +1, marcada «⚠ a revisar»): con la regla
  nueva vale ≈ 1½ de daño en Tipo 4 y ½ en Tipo 10, parecido a Golpe fuerte (+1 daño). Se puede sacar el ⚠.
- **Consumibles:** ninguno da Resistencia a crítico. Existe el **Pergamino de Blindaje** (Raro, 125: el grupo inmune a críticos 3 turnos), que
  no cambia con la regla nueva.
- **Cómo se automatiza:** una pasiva o un consumible puede poner un **estado** con bonos (`tipo1`…`tipo4` = Res. crítico Tipo 4/6/8/10, `crit` =
  Crítico frecuente): eso ya anda solo. Lo condicional (según la vida, según el estado del rival, «el primer crítico») pide programar algo chico.

Pesos usados (en Defensa +1): Res. T4 = 1 · T6 = ½ · T8 = ¼ · T10 = ¼ · «+1 a todos» = 2. Crítico frecuente +1 ≈ 1½ de daño (Tipo 4).
Precios de referencia: Pergamino grupal de +1 a un stat por 3 turnos = Común 60; Pergamino de +1 hasta el fin del combate = Buena 60, +2 = Raro 120.
Pasivas: Piel curtida (+1 Defensa) = 1 Job.

## Pasivas

| Pasiva | Qué hace | Job | Automático | Peso |
|---|---|---|---|---|
| **Callo de batalla** | +1 Res. crítico Tipo 4 («de tanto ligarla, ya ni se mosquea»). | 1 | ⚙ ya anda (bono fijo) | 1 |
| **Cuero duro** | +1 Res. crítico Tipo 6 y +1 Tipo 8. | 1 | ⚙ ya anda (bono fijo) | ¾ |
| **Mañas de sobreviviente** | Con la vida a la mitad o menos: +1 Res. crítico contra todos los Tipos. | 1 | ⚙ a programar (el mapa ya sabe la vida); mientras, ✋ | ≈ 1 (2 × la mitad del tiempo) |
| **Ojo para las grietas** | Contra un rival con Armadura rota: Crítico frecuente +1. | 1 | ⚙ a programar en el duelo (ya sabe los estados del rival) | ≈ 1 |
| **Aguante** | El primer crítico que recibís en cada combate baja un escalón (×3 → ×2; un ×2 entra como golpe normal, con la Defensa). | 2 | ⚙ a programar (se apoya en lo del Pergamino de Blindaje) | ≈ 2 |
| **Ensañado** | Cuando hacés un crítico, el rival queda con **Punto débil** 1 turno (lo aprovechan tus aliados). | 2 | ⚙ a programar (efecto al hacer crítico) | ≈ 1½–2 |

## Consumibles

| Consumible | Qué hace | Tier · precio | Automático | Peso |
|---|---|---|---|---|
| **Grasa de carpincho** | Te untás: +1 Res. crítico Tipo 4 y Tipo 6 hasta el fin del combate. | Común · 45 | ⚙ ya anda (estado que se va al «Finalizar combate») | 1½ |
| **Ungüento del herrero** | Saca toda la Armadura rota y da +1 Res. crítico Tipo 4 por 3 turnos. | Común · 35 | ⚙ ya anda (saca un estado, pone otro) | ≈ 1½ |
| **Pergamino grupal de Temple** | A vos y a tu grupo: +1 Res. crítico contra todos los Tipos, 3 turnos. | Buena · 90 | ⚙ ya anda (como los otros pergaminos grupales) | 2 por cabeza |
| **Pergamino de Temple** / **mayor** | +1 (mayor: +2) Res. crítico contra todos los Tipos, hasta el fin del combate. | Buena · 90 / Raro · 170 | ⚙ ya anda | 2 / 4 |
| **Aceite del punto débil** | Untás el arma: Crítico frecuente +1 durante 3 turnos. | Buena · 50 | ⚙ ya anda (estado con `crit`, como el Arma ácida) | ≈ 1½ por golpe |
| **Tiza de sastre** | Le marcás las costuras a un rival al lado (1 No2): queda con **Punto débil** 2 turnos. | Buena · 60 | ⚙ si se usa como las bombas (consumible sobre otro); si no, ✋ el GM le pone el estado | ≈ 2 |

## Preguntas
1. ¿Cuáles te cierran? (las que «ya andan» se cargan enseguida; las «a programar» llevan un trabajo chico cada una).
2. Las que hay que programar (Mañas de sobreviviente, Ojo para las grietas, Aguante, Ensañado): ¿se programan ya, o se cargan primero como
   «✋ A mano» y se automatizan después?
3. ¿Sacamos el «⚠ a revisar» de **Ojo crítico**?
