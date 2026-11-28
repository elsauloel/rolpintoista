# Plan: trabajo remoto (Firebase Hosting, vistas previas, emulador)

> **✅ Lo básico, hecho (2026-10-31, dueño: «guiame paso a paso para pasar el proyecto full online para no depender de tener la compu prendida»):**
> sesiones de **Claude Code en la nube** sobre este repo, manejadas desde la app del celular, publicando como siempre por GitHub Pages (no hizo
> falta Firebase Hosting). Se autorizó la app de Claude en GitHub, se abrió la red del entorno «Predeterminado» (el sitio, gstatic y Firebase) y la
> memoria de Claude pasó al repo ([`memoria-claude.md`](memoria-claude.md); el `CLAUDE.md` raíz dice qué hacer en la nube y en la compu). Lo
> que sigue sin resolver desde la nube: probar en el mapa (no hay Chrome con las cuentas del dueño) y leer las partidas. Las etapas 2 y 3 de abajo
> (vistas previas y emulador con navegador headless) son la mejora para eso, si algún día hace falta.
>
> **Estado anterior: guardado, sin empezar** (2026-10-12). El dueño lo compartió para que quede: **no arrancar hasta que lo pida**.
> Cuando lo pida, guiarlo **de a un paso y sin jerga** (la etapa 1 la hace él desde la compu, con sus sesiones de Firebase y
> GitHub). El texto de abajo es el que redactó el asistente en otra conversación y el dueño pidió guardar tal cual. Lo que ya
> se sabe para empezar (Node.js no instalado en la compu, vistas previas por pull request y no por rama, la dirección nueva y
> lo guardado en el navegador, publicar las reglas de Firestore desde el repo) está en [`pendientes.md`](pendientes.md), en
> «🚀 Publicar con Firebase Hosting desde GitHub».
>
> Ojo con la etapa 4: las reglas de trabajo de abajo **todavía no rigen**; se pasan al `CLAUDE.md` recién cuando se haga esa
> etapa. Mientras tanto, se sigue como hasta ahora (todo a `nueva-version`, publicado por GitHub Pages).

## Flujo de trabajo remoto (objetivo)

Quiero poder trabajar en este proyecto sin depender de que mi computadora esté encendida, pidiendo cambios desde el teléfono con Claude Code en la nube.

### Etapas (en orden, cada una funciona sola)
1. **Deploy automático:** configurar Firebase Hosting con GitHub Actions (`firebase init hosting:github`). Cada push a la rama principal publica solo. Esta etapa se hace una vez desde la compu (necesita mis sesiones de Firebase y GitHub).
2. **Vistas previas:** los cambios grandes van a una rama aparte; cada rama/PR genera un link de preview en Firebase para probarlo antes de publicar.
3. **Emulador de Firebase:** configurar Firebase Local Emulator Suite (Hosting, Firestore/Realtime DB, Auth) para testear sin tocar datos reales del grupo.
4. **Actualizar este CLAUDE.md** con las reglas de abajo.

### Reglas de trabajo
- Cambios chicos (textos, estilos, datos): directo a la rama principal.
- Cambios grandes (mecánicas, sincronización, estructura): rama aparte + preview + mi OK antes de mergear.
- Nunca subir claves privadas, service accounts ni archivos .env al repo.
- Todo lo que el proyecto necesite tiene que estar en GitHub; lo que solo exista en mi compu no está disponible en la nube.

### Testeo
- **Con la compu prendida:** testeo como hasta ahora, con dos sesiones de Chrome abiertas (máster y jugador), simulando la partida con capturas de pantalla.
- **En la nube:** usar el navegador headless (Playwright/Chromium) con **dos contextos separados** simulando dos sesiones. Correr contra el **emulador**, no contra producción. Simular la partida, sacar capturas, revisarlas para detectar errores (ej.: un personaje que debería aparecer y no aparece) y mandarme las capturas relevantes.
- Login en la nube: usar cuentas de prueba del emulador (el login con Google no funciona en headless).
- Si se testea contra Firebase real, la red del entorno cloud tiene que permitir los dominios de Firebase/Google; si la sincronización falla, verificar primero la red antes de asumir un bug.

### Costos y plan de Firebase
- Hoy en plan gratuito (Spark). Si me quedo corto, pasar a Blaze (pago por uso): incluye la misma cuota gratis y solo cobra el excedente. Para un grupo chico el costo esperado es US$0–1 por mes.
- Lo primero que podría agotarse es el tráfico de Hosting (360 MB/día) si las imágenes son pesadas → **optimizar mapas e imágenes (WebP, comprimidos).**
- Riesgo real: un bug en bucle (ej.: un listener que escribe y se vuelve a disparar) que genere millones de lecturas/escrituras. Revisar siempre que los listeners no escriban sobre lo mismo que escuchan, y probar en el emulador antes de publicar.
- Si se activa Blaze: configurar desde el día uno una **alerta de presupuesto de US$5** (avisos al 50/90/100%). Ojo: el presupuesto de Google Cloud avisa, no corta el gasto.
