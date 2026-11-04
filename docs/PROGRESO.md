# Bitácora del proyecto (PROGRESO)

> **Lee esto al empezar cada sesión** (después de `git pull`). Al terminar un paso, actualízalo en el mismo commit y haz push.
> Plan de trabajo: [`PROMPT-FASE0.md`](../PROMPT-FASE0.md) · Reglas: [`CLAUDE.md`](../CLAUDE.md) · Especificación: [`README.md`](../README.md)

## Estado actual

| | |
|---|---|
| **Paso actual** | **Fase 0 completa y fusionada en `main`** (Pasos 0 a 8; los Pasos 5 a 8 entraron con los PR #8 a #11). Siguiente: cerrar los pendientes y las dudas abiertas de abajo y planificar la Fase 1. |
| **Rama en curso** | Ninguna con trabajo abierto: todo está en `main`. Este cierre va en `docs/cierre-fase0`. Las ramas de los Pasos 5 a 8 ya están fusionadas y se pueden borrar. |
| **Revisión** | Sin PR pendientes de la Fase 0 (salvo el de este cierre). Las ramas de los Pasos 5 a 8 se apilaron una sobre otra porque el PR #8 tardó en fusionarse; se fusionaron en orden el 03/11/2026. |
| **Para continuar** | `git pull` en `main` → resolver los pendientes anotados → decidir las dudas abiertas → plan de la Fase 1 (backend real, ver README §9). |
| **Última actualización** | 2026-11-03 (cierre de la Fase 0: **59/59 pruebas**, **35/35 pantallas** en `dev/rutas/`, todo en `main`) |

> **Excepción temporal (23/10/2026):** el PR #4 (Fase 0, Pasos 0–3) se fusionó en `main` **sin la revisión del compañero**, por acuerdo del equipo. David puede revisar la Fase 0 directamente en `main`. A partir del Paso 4 vuelve la regla normal: todo PR lo revisa la otra persona.

## Hecho

| Paso | Qué se hizo | Commit |
|------|-------------|--------|
| — | Aviso "¡IMPORTANTE SI GANAS!" en crear cuenta (fusionado en `main` local) | `3a8c293` |
| Docs | Especificación, reglas y plan de Fase 0; contradicciones del README resueltas | `a3bd9e3` |
| 1 | Tokens de diseño y componentes base (sin cambio visual: verificado con 0 diferencias) | `d178933` |
| 1 | Colores naranja y azul de estados de rifa | `a017ac5` |
| — | `.gitignore` con el archivo de workspace | `4a1afee` |
| 2 | Dominio, datos falsos y servicios mock (con pruebas) | `30c0906` |
| 2 | Registro de compra, envío y entrega; contraste de badges | `d6983a7` |
| — | CSS/JS separados por pantalla y organización de carpetas | `d6cb3b7` |
| — | Layout del panel de administración (documentado) | `eeff41f` |
| 3 | Rutas, layout, sesión simulada, protección de rutas y panel de demo | `8a453c2` |
| 3 | Login y registro conectados a AuthService | `6936cb8` |
| 3 | Inicio con textos y datos del modelo nuevo | `89ed564` |
| Ajustes | Chances, nombres de estados, precio referencial y recarga libre | `66f0cac` |
| Docs | Flujo de equipo, esta bitácora, diagramas y propuesta | `2f6c9dd` |
| Merge | PR #4 "Fase 0: especificación, base de diseño, dominio, estructura y navegación (Pasos 0–3)" fusionado en `main` | `896d494` |
| Docs | Traspaso del Paso 4 a David | `dfa1a81` |
| 4 | Listado de rifas con búsqueda y filtros; tarjeta de rifa compartida (`components/tarjeta-rifa.js`) | `5971e26` |
| 4 | Detalle de rifa por estado y modal Poner Chances / Comprar opciones | `051f309` |
| 4 | Cómo funciona y enlace del header | `b1c8f72` |
| 4 | Verificar cuenta | `9764a37` |
| 4 | Mi billetera e historial | `06aa93e` |
| 4 | Recargar Chances | `14a28c3` |
| 4 | Mis rifas | `2f92ec3` |
| 4 | Admin: Rifas (listado, detalle, nueva) y Cola de revisión; arreglo de margen lateral de `.pagina` | `6c7d725` |
| 4 | Cierre del Paso 4: esta bitácora | (incluido en el PR #5) |
| Merge | PR #5 "Paso 4: pantallas P1" fusionado en `main` | `d25e450` |
| Ajustes | Servidor local sin caché (`dev/servidor.py`) | `e92444e` |
| Ajustes | Estados visibles, Chances bloqueadas, tiempo extra, cancelar con motivo / por fuerza mayor, productos reales | `6a06451` |
| Ajustes | Inicio: logo, carrusel de destacadas, Rifas confirmadas (cuenta regresiva) y Rifas armándose con fotos; /rifas por categoría | `85f6c74` |
| Docs | Ciclo de vida de la rifa, flujo de Chances y diagramas | `98cfd20` |
| Ajustes | Panel admin sin "sorteo" en textos visibles | `850881d` |
| Ajustes | Sorteo con opciones mezcladas al azar (reproducible) | `c062e0e` |
| Ajustes | Código por opción, lista pública anónima (CSV), Mis tickets y "Rifa en vivo" | `147425b` |
| Docs | Diagramas en Mermaid: índice `docs/diagramas/README.md`, mapa de pantallas, opciones y transparencia, capas y modelo de datos del README; extensión recomendada en `.vscode/extensions.json` | `574e52a` |
| Merge | PR #7 "Ajustes de Inicio y estados" fusionado en `main` | `2b1c8ad` |
| 5 | Servicios: recuperar contraseña, cambiar apodo y Libro de Reclamaciones (`ReclamosService`) | `0ef3739` |
| 5 | Público: ganadores, preguntas frecuentes, legales, Libro de Reclamaciones, recuperar y perfil | `c887c70` |
| 5 | Admin: dashboard, sorteos, rifar, compras y entregas, productos, categorías y usuarios | `04fd88d` |
| 5 | Cierre del Paso 5: esta bitácora, inventario del README y doble punto tras la hora en textos de fecha | `f15c201` |
| 6 | Proponer rifa, Mis rifas propuestas y Admin · Propuestas (validar, reemplazar o rechazar link; aprobar o descartar); esta bitácora | `f31b6f9` |
| 7 | README §7 dividido en `docs/semantica/` (con índice) y `docs/pantallas/inventario.md`; referencias actualizadas; esta bitácora | `7846d4f` |
| 8 | Verificación final: página `dev/rutas/` (revisa todas las rutas y enlaces), arreglo de 1 px de desborde en Inicio a 360 px, flujo completo recorrido; esta bitácora | `c17454f` |
| Merge | PR #8 "Paso 5: pantallas P2" fusionado en `main` | `ebd8859` |
| Merge | PR #9 Paso 6 (propuestas) fusionado en `main` | `54a5080` |
| Merge | PR #10 Paso 7 (documentación semántica) fusionado en `main` | `6004323` |
| Merge | PR #11 Paso 8 (verificación final) fusionado en `main` · **Fase 0 completa** | `c93e46d` |
| Docs | Cierre de la Fase 0: esta bitácora | el commit que agregó esta fila |

Verificación al cierre del Paso 4: **50/50 pruebas** en `dev/pruebas/`; flujos revisados en Chrome a 1280 px y 360 px (visitante → login → regresa con el modal abierto → poner Chances; saldo insuficiente → recargar → volver; recarga con éxito y rechazo; verificar con código incorrecto y correcto; admin: aporte simulado → rifa confirmada → cerrar → aprobar y programar; crear borrador).

Verificación al cierre del Paso 5: **59/59 pruebas** en `dev/pruebas/`; todas las rutas del mapa cargan sin errores de JavaScript con el rol que piden (solo Proponer rifa, Mis propuestas y Admin · Propuestas siguen "En construcción", son P3); pantallas P2 sin desborde horizontal a 360 px; flujo admin revisado en Chrome a 1280 px: Sorteos → Rifar ahora (confirmación → resultado con semilla, posición y ganador) → Registrar compra y entrega.

Verificación al cierre del Paso 6: **59/59 pruebas** en `dev/pruebas/` (los servicios de propuestas ya tenían sus pruebas desde el Paso 2); las 3 pantallas sin desborde horizontal a 360 px y 768 px; flujos revisados en Chrome a 1280 px: link acortado → aviso "Link en revisión" → enviado en Validando producto; límite de propuestas activas; link confiable → título y precio leídos → mínimo del autor y saldo insuficiente → Rifa Sugerida con enlace para copiar; admin: reemplazar link (rechaza tienda no confiable) → aprobar propuesta (rechaza margen inválido) → rechazar sin motivo y con motivo → lista vacía.

### Paso 8: verificación final

1. **Compilar / lint:** no aplica (sitio estático, sin herramientas instaladas). En su lugar se revisaron las reglas del proyecto: ningún HTML del sitio tiene CSS ni JS en línea y cada uno carga un solo script; las pantallas solo importan datos desde `services/index.js` (el panel de demo y `dev/pruebas` importan `db.js` solo para restaurar los datos); sin colores sueltos fuera de los tokens (salvo la máscara `#000` de Inicio, que no es un color visible).
2. **Todas las rutas:** nueva página **`/dev/rutas/`** que abre cada una de las 34 rutas del mapa (más el detalle de Admin · Rifas) con el rol que pide, a 1280 px y a 360 px, y revisa errores de JavaScript, secciones con error, "En construcción", "Sin acceso" y desborde horizontal; luego comprueba que los enlaces internos respondan. Resultado: **35/35 pantallas sin problemas · 33 enlaces internos, 0 rotos.**
3. **Flujo del Objetivo, de punta a punta, con clics en las pantallas:** visitante entra por el enlace de una Rifa Armándose (sin montos visibles) → "Poner Chances" lleva a crear cuenta con `?volver=` → verificar con 123456 → vuelve al detalle con el modal abierto y saldo insuficiente → Recargar 20 Chances → vuelve al modal → confirma 10 Chances → billetera: 10 disponibles y 10 retenidas en esa rifa → admin simula aporte → **Rifa Confirmada** → Mis rifas / Mis tickets: 10 opciones con número y código → admin cierra (**Rifa Cerrada**), aprueba y anuncia la fecha, comprueba la huella y rifa (**Rifa Realizada**, ganador) → registra compra, envío y entrega (rechaza la entrega sin DNI verificado ni evidencia) → el público ve **Premio Entregado** con transparencia y sin datos internos del premio.
4. **360 px y 1280 px:** incluido en la revisión de rutas. Se encontró y arregló **1 px de desborde en Inicio a 360 px**: los semicírculos del ticket sobresalen 17 px y el margen móvil es de 16 px; `.hero` recorta en el borde (que coincide con el de la pantalla), así que Inicio se ve igual.
5. Pruebas de reglas: **59/59.**

### Paso 7: documentación semántica

- **`docs/semantica/`**: `00-glosario` (§7.1–§7.3), `01-identidad`, `02-billetera` (§7.7, §7.10, ciclo de las Chances, recargas), `03-rifas` (§7.4, §7.9, §7.11, §7.13), `04-sorteo` (§7.8), `05-propuestas`, `06-administracion` (§7.12, cancelar una rifa) y un `README.md` con el índice y dónde quedó cada sección. **Se conservan los números §7.x**, así que las referencias del código siguen valiendo. Las tablas de acciones (§7.5) y eventos (§7.6) se repartieron fila por fila según el dominio.
- **Sin pérdida de contenido:** un script comprobó que cada línea de la antigua §7 está en algún archivo nuevo.
- **Defecto corregido:** en la tabla de estados de §7.4, la fila `ARMANDO` había quedado reemplazada por filas del glosario ("Estados visibles", "Rifa Armándose"… "Rifar"). Esas filas pasaron al glosario (la de "Rifa Armándose" se unió con la que ya existía) y se restauró la fila `ARMANDO` con lo que dicen §7.5 y §7.13: *Rifa Armándose · pública, junta Chances hacia su meta · acepta Chances como compromiso · Disponible → Retenido*. **Revisar que esté bien.**
- **README §7** quedó como resumen con enlaces; §6 enlaza al inventario. `CLAUDE.md` (fuentes de verdad) y los diagramas apuntan a `docs/semantica/`.
- **`docs/pantallas/inventario.md`**: todas las pantallas construidas con ruta real, acceso y estados (incluye las páginas `dev/`). Las capturas siguen yendo en cada PR.
- Verificación: 59/59 pruebas; 0 enlaces rotos en los documentos tocados; los 9 diagramas Mermaid de los archivos tocados se procesan sin errores (Mermaid 11).

### Paso 6: qué se construyó

| Pantalla | Ruta | Estados |
|----------|------|---------|
| Proponer rifa | `/crear-rifa` | Pegar link → leído (imagen de referencia, título y precio, tienda confiable) · **Link en revisión** (acortado, tienda desconocida o sin datos: se envía sin Chances) · errores por campo (link, categoría, nombre, precio fuera de rango, mínimo del autor, saldo) · límite de propuestas activas · cuenta sin verificar · enviado (Rifa Sugerida con enlace para copiar, o Validando producto) |
| Mis rifas propuestas | `/mis-propuestas` | Rifa Sugerida (privada, enlace para copiar, avance hacia el apoyo mínimo en %, personas que faltan y tiempo restante) · Validando producto (link o moderación) · pública (Armándose / Confirmada) · no se armó · descartada con motivo · vacío |
| Admin · Propuestas | `/admin/propuestas/?estado=&q=` | Tabla con filtro (link en revisión · en moderación) y búsqueda · **Validar link**: aprobar, **reemplazar** por un link equivalente de tienda confiable o rechazar con motivo · **Moderar**: aprobar fijando el margen (→ Rifa Armándose) o descartar con motivo · vacío. "Ver detalle" abre Admin · Rifas, que ahora también tiene estas dos acciones |

**Decisiones del Paso 6**
- La rama del Paso 6 sale de la del Paso 5 (apilada) porque el PR #8 sigue abierto; su PR se abre después del merge del #8.
- La "imagen" leída del link es el ícono de referencia del mock (la lectura simulada no trae foto); en la Fase 1 será la foto real.
- El participante ve su avance hacia el apoyo mínimo **solo en % y personas**: el umbral, la meta y el margen siguen siendo internos.
- Compartir enlace pasó a `components/compartir.js` (lo usan el detalle de rifa, Proponer rifa y Mis propuestas). Los modales de validar link y moderar viven en `components/admin-rifas.js`. Nuevo token `--size-thumb`.

### Paso 5: qué se construyó

| Pantalla | Ruta | Estados |
|----------|------|---------|
| Ganadores | `/ganadores` | Lista con premio, apodo del ganador y estado de entrega (comprando, en camino, entregado) · vacío |
| Preguntas frecuentes | `/preguntas-frecuentes` | Acordeón (el mismo de Inicio, ahora en `components.css`) |
| Legales | `/legal/terminos` · `/legal/privacidad` · `/legal/reglamento` | Texto largo en borrador con los puntos pendientes marcados |
| Libro de Reclamaciones | `/libro-de-reclamaciones` | Formulario con errores por campo · enviado (hoja numerada, plazo de 15 días hábiles) |
| Recuperar contraseña | `/recuperar` | Solicitar · enlace enviado · nueva contraseña (enlace de un solo uso) |
| Perfil | `/perfil` | Datos con DNI enmascarado · editar apodo · cuenta sin verificar |
| Admin · Dashboard | `/admin` | Recaudado, Chances retenidas, rifas por estado y pendientes del equipo |
| Admin · Sorteos | `/admin/sorteos/?vista=` | Por rifar · realizadas · búsqueda · vacío |
| Admin · Rifar | `/admin/sorteo/?codigo=` | Lista congelada con huella comprobable · Rifa en vivo · confirmación · resultado verificable |
| Admin · Compras y entregas | `/admin/entregas` y `/admin/entrega/?codigo=` | Listado · compra (datos, comprobante, producto equivalente) · envío · entrega con DNI verificado y evidencia (§7.12) |
| Admin · Productos | `/admin/productos` | Listado · editar título y precio (el precio solo antes de que la rifa sea pública) · crear lleva a Nueva rifa |
| Admin · Categorías | `/admin/categorias` | Crear · editar · activar/desactivar |
| Admin · Usuarios | `/admin/usuarios` | Listado con filtros · detalle con movimientos · ajuste de saldo con motivo |

**Decisiones del Paso 5**
- El header ya lleva "Preguntas" a `/preguntas-frecuentes` también desde Inicio (pendiente del Paso 4 resuelto).
- Rifar y Compra y entrega usan `?codigo=` (`/admin/sorteo/`, `/admin/entrega/`), no rutas anidadas; el README §6 quedó así.
- En la Fase 0 se puede rifar antes de la fecha anunciada, con un aviso, para la demostración.
- Nuevo contrato `services/interfaces/reclamos` y `components/formulario.js` (errores por campo compartidos).

### Paso 4: qué se construyó

| Pantalla | Ruta | Estados |
|----------|------|---------|
| Listado de rifas | `/rifas/?q=&estado=&categoria=` | Con resultados · vacío · sin resultados con filtros · cargando · error. Nunca muestra rifas solo por enlace. |
| Detalle de rifa | `/r/?slug=` | Una variante por estado · visitante (lleva a login/registro y vuelve con `?accion=poner\|comprar`) · participante con sus Chances, opciones y retiro · admin (enlace al panel) · compartir · transparencia (hash, semilla, ganador) · seguimiento del premio · no encontrada |
| Modal Poner Chances / Comprar opciones | dentro del detalle | Selector · saldo insuficiente con Recargar (vuelve al modal) · máximo por persona alcanzado · confirmación con saldo antes y después · éxito (con aviso si la rifa se armó) · error. También modal de retiro. |
| Cómo funciona | `/como-funciona` | Seis pasos y casos (no se arma, cancelada, comunidad, lo que no mostramos) |
| Verificar cuenta | `/verificar/?volver=` | Ingresar código · incorrecto · reenviar (espera de 30 s) · verificada · ya verificada |
| Mi billetera | `/billetera` | Disponible, retenidas y en qué rifas · sin retenidas · sin movimientos |
| Mi historial | `/billetera/historial/?tipo=&rifa=` | Movimientos con rifa y n.º de operación · filtro por tipo y rifa · vacío |
| Recargar | `/billetera/recargar/?cantidad=&volver=` | Atajos y monto libre 5–500 con aviso · medio de pago simulado · procesando · éxito · rechazado |
| Mis rifas | `/mis-rifas/?pestana=` | Pestañas Armando · Abiertas · Finalizadas con contador · vacío por pestaña y general |
| Admin · Rifas | `/admin/rifas/?q=&estado=` y `?codigo=` | Tabla con filtros y acciones por fila · detalle con datos internos, configuración, link, fechas e historial · acciones por estado |
| Admin · Nueva rifa | `/admin/rifas/nueva` | Formulario con configuración por defecto (§7.9) y meta calculada · errores por campo |
| Admin · Cola de revisión | `/admin/revision` | Rifas cerradas o en revisión · aprobar y programar · cancelar con motivo · vacía |

**Decisiones del Paso 4**
- Al volver del login o de recargar, el detalle abre el modal con `?accion=poner` o `?accion=comprar` (luego se quita de la URL).
- El selector del modal permite pasar del saldo para mostrar "saldo insuficiente"; si lo que limita es el máximo por persona o el tope, el selector no deja pasarlo.
- Los estilos de la tarjeta de rifa, los atajos de recarga y el resumen pasaron de `inicio.css` a `components.css` sin cambios (Inicio se ve igual).
- Las acciones del panel que simulan procesos automáticos (aporte, vencer ventana, cerrar) se marcan con "Demo".
- Recargar tiene una casilla "Simular pago rechazado (solo demo)" para mostrar el estado rechazado.

## Sigue

1. **Cerrar los pendientes anotados** (abajo), en especial confirmar la fila `ARMANDO` restaurada en `docs/semantica/03-rifas.md` (§7.4).
2. **Decidir las dudas abiertas** antes de la Fase 1.
3. **Planificar la Fase 1** (backend real, README §9) y los pendientes de producción: Google Client ID, backend del inicio de sesión y contraseña en el registro.
4. Opcional: borrar en GitHub las ramas ya fusionadas de los Pasos 5 a 8.

### Pendientes anotados
- ~~**Header con sesión a 360 px**~~ **Resuelto:** en la revisión del Paso 8 (360 px con barra de desplazamiento visible, el caso más estrecho) ninguna pantalla con sesión desborda.
- **Toast detrás del modal:** el aviso "¡Listo!" queda detrás del fondo del modal abierto; el modal ya muestra el éxito, así que no se pierde información.
- **Textos legales:** son borradores; necesitan revisión legal antes de cualquier lanzamiento.
- **Denuncias de propuestas:** README §6 #27 menciona "denuncias" en Moderar propuestas, pero no hay contrato ni regla definida (quién denuncia, qué efecto tiene). No se construyó; definir antes de implementarlo.
- **`paginas/en-construccion.js`** ya no lo usa ninguna pantalla. Se conserva (no se borran archivos sin preguntar); decidir si se elimina.
- **Fila `ARMANDO` de §7.4:** se restauró al separar la semántica (Paso 7); la otra persona del equipo debe confirmar que está bien.
- **Capturas de los PR #9 a #11:** no se adjuntaron (las capturas de Chrome no respondían); se pueden tomar desde `dev/rutas/` o a mano.

## Traspaso: cómo arrancar el Paso 4 (David)

**Si todavía no tienes el proyecto:**
```bash
git clone https://github.com/djimenef/Rifas-project.git
cd Rifas-project
git config user.name "Tu nombre"
git config user.email "tu-correo@ejemplo.com"
git switch feature/paso4-pantallas-p1
```

**Si ya lo tienes:**
```bash
git switch main
git pull
git fetch origin
git switch feature/paso4-pantallas-p1
git pull
```

**Levantar y comprobar:**
```bash
python dev/servidor.py
```
- Sitio: http://localhost:8000
- Pruebas de reglas: http://localhost:8000/dev/pruebas/ → deben salir **50 de 50** en verde antes de empezar.
- Catálogo de componentes: http://localhost:8000/dev/componentes/
- Botón **🛠 Demo** (abajo a la izquierda): cambiar entre visitante, participante y admin, forzar cargando/vacío/error y reiniciar datos.
- Credenciales: ver la tabla al final de este archivo (`lucia@dalechance.pe` / `demo123`, `admin@dalechance.pe` / `admin123`, código `123456`).

**Lo que conviene leer antes de construir:** `CLAUDE.md` (reglas, vocabulario visible, organización de carpetas, panel de admin), `PROMPT-FASE0.md` (Paso 4 y mapa de rutas), README §6 (inventario y tarjeta de rifa), §7 (reglas) y §7.12 (compra y entrega), y `assets/js/lib/rutas.js` (todas las rutas ya existen como "En construcción").

## Decisiones tomadas (resumen)

**Diseño**
- Las 3 pantallas originales (inicio, login, registro) son la referencia visual. No se cambia ningún color, tipografía, radio, sombra ni espaciado existente; todo lo nuevo sale de los tokens.
- El logo mantiene "Chance" en blanco aunque en modo claro casi no se vea (decisión explícita).
- Colores de estado: naranja = mezcla de `--error` y `--gold`; azul = celeste de la tarjeta "Plata" con texto `#1d1a16`. Badges ajustados para contraste ≥ 4.5:1 (ENTREGADA queda en 4.3:1 en modo claro). Los badges "Bloqueado/Participas" originales no se tocaron.
- Barra de avance: `--error` → `--gold` → `--accent`.

**Estructura y técnica**
- Sitio estático con módulos ES; se levanta con `python dev/servidor.py` (servidor sin caché). Sin dependencias.
- Cada pantalla en su carpeta con `index.html`; CSS y JS propios en `assets/css/paginas/` y `assets/js/paginas/`. Nada de CSS/JS dentro de los HTML.
- **Excepción:** login y registro son archivos sueltos (`iniciar-sesion.html`, `crear-cuenta.html`) y así se enlazan, también en `?volver=`.
- Nombres en español, minúsculas y con guiones. En el código se dice "puntos" y `precioTienda`.
- Las pantallas solo importan datos desde `assets/js/services/index.js`.
- En la Fase 1 el frontend se moverá a `web/` y el backend irá en `api/`.

**Producto y textos**
- La moneda visible se llama **Chance/Chances**, en femenino. "Chance" se usa solo para la moneda.
- Estados visibles: **Rifa Armándose**, **Rifa Sugerida**, **Rifa Descartada**.
- Precio: **"Precio referencial: S/ X"**.
- Recarga: atajos 5/10/15/20 + **monto libre de 5 a 500** por recarga (configurable por admin).
- El público nunca ve meta, margen, Chances reunidas ni opciones vendidas: solo personas y % de avance. El máximo por persona tampoco se expone en la vista pública.
- Las propuestas en moderación (`PROPUESTA`) se ven por enlace; las de link en revisión solo las ven su autor y los admins.
- Rango de precio para proponer: S/ 50 a S/ 10,000 (provisional).
- Mis rifas: pestañas Armando (Calentando, En moderación, Armando) · Abiertas (Abierta, Cerrada, En revisión, Programada) · Finalizadas (el resto).
- Google se simula iniciando sesión como la participante de demo.
- Tiempo abierta por defecto: 3 días. Umbral de propuestas: 20 % de la meta y 10 personas. Margen: 35 %. PS5 de ejemplo: S/ 2,200, meta 2,970.
- **Compra del premio:** se hace fuera de la web; aquí solo se registran compra (fecha, tienda, monto, comprobante, a nombre del ganador), envío (recojo o courier) y entrega (DNI físico verificado y evidencia). Solo los admins ven esos datos; el público ve estado y fecha.
- Aviso en el registro: "¡IMPORTANTE SI GANAS!" (solo con tu propio DNI; el premio se compra a nombre del ganador).

**Estados visibles y tiempo extra (README §7.13)**
- Público: **Rifa Sugerida** (solo por enlace; quien la crea es responsable de juntar el mínimo) → **Rifa Armándose** (< 100 %) → **Rifa Confirmada** (≥ 100 %, sigue abierta) → **Rifa Cerrada** (por rifar) → **Rifa Realizada** (ya hay ganador) → **Premio Entregado**. **Validando producto** es el estado de validez; **Rifa Descartada** agrupa no armadas, canceladas y propuestas descartadas.
- Los estados internos se mantienen; solo cambia cómo se muestran.
- **Tiempo extra:** con 5 minutos o menos, cada 5 personas distintas que pongan Chances suman 5 minutos al tiempo que quedaba; al agotarse, pasa sola a Rifa Cerrada.
- **Mis tickets** (`/mis-rifas/tickets/?codigo=`) ya está hecha: cada opción con número y código alfanumérico (solo la ve su dueño), descarga de la lista pública y "Verificar mis opciones". La lista pública (CSV `opcion,codigo`) es anónima y se publica desde Rifa Cerrada; la huella es su SHA-256. El acto público se llama **"Rifa en vivo"**. El **ganador** se publica con su **apodo**; el resto de la lista sigue sin dueños.
- **No se usa "sortear/sorteo"** en textos visibles. "Sorteo" es solo el acto técnico de elegir al ganador: cada Chance es una opción, la lista se mezcla al azar (Fisher–Yates, reproducible con semilla + huella) y se elige una posición (`domain/sorteo.js`).
- **Foto en las tarjetas:** desenfocada hasta Rifa Armándose y nítida desde Rifa Confirmada. Inicio muestra primero "Rifas confirmadas" (las 3 que se cierran antes, foto nítida y cuenta regresiva) y luego hasta 6 rifas armándose (primero las que tienen foto), cada una con "Ver más…" hacia `/rifas`, que agrupa por categoría cuando no hay filtro de categoría.
- **Productos de ejemplo reales** (foto, precio y descripción de la tienda): iPhone 17 Pro Max, PS5 Pro, adidas Megaride S4, TV LG QNED 85", RTX 5060 Ti, Ryzen 5 9600X, combo proyector + parlante (armándose); Galaxy Tab S10 FE, Lenovo LOQ, Galaxy S26 Ultra (confirmadas). Categorías nuevas: Tablets, Cómputo, Audio y video.
- **Chances bloqueadas:** desde la Rifa Sugerida no se pueden retirar; vuelven solo si la rifa se descarta. Al confirmarse quedan como opciones de ganar para siempre.
- **Una Rifa Confirmada siempre se rifa:** si el producto cambia, se entrega uno equivalente; solo se cancela por fuerza mayor legal (reembolso total).

**Inicio (ajustes visuales)**
- Logo a 2.1rem (+50 %) en escritorio; en celular se mantiene 1.4rem. Título "Tú eliges qué se Rifa."
- Ticket de Inicio = carrusel de rifas destacadas (orden fijado en los datos; criterio pendiente), base blanca, foto del producto y descripción en el detalle.
- Servidor de desarrollo sin caché: `python dev/servidor.py`.

**Panel de administración**
- Layout propio: menú lateral fijo (Dashboard, Rifas, Revisión, Sorteos, Compras y entregas, Productos, Categorías, Usuarios, Propuestas), tablas con filtros y búsqueda, acciones por fila y detalle; "Modo administrador" y "Ver sitio"; en móvil, menú desplegable. Misma paleta.

**Trabajo en equipo**
- `main` protegida: solo cambia por Pull Request revisado por el otro.
- Una rama por paso, creada desde `main` actualizado; una sola persona por rama a la vez.
- Siempre `git pull` antes de empezar. Nunca force push.

## Dudas abiertas

- Decisiones pendientes del README §13: #5 vencimiento, #8 qué pasa con lo recaudado sobre la meta, #9 plazo para reclamar, #15 beneficio para creadores, #23 límite diario de recarga (recomendado S/ 500).
- Rango de precio definitivo para proponer rifas (hoy S/ 50–10,000).
- Validación legal (Ministerio del Interior / MINCETUR) antes de cualquier lanzamiento.

## Cómo levantar el proyecto

```bash
git pull
python dev/servidor.py
```

Abrir http://localhost:8000. Los módulos ES **no funcionan con doble clic** en el HTML (`file://`).

- Catálogo de componentes: http://localhost:8000/dev/componentes/
- Pruebas de reglas: http://localhost:8000/dev/pruebas/ (deben salir todas en verde)
- Panel de demo: botón **🛠 Demo** abajo a la izquierda (cambiar de rol, forzar cargando/vacío/error, reiniciar datos).

## Credenciales de demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Participante (Lucía) | `lucia@dalechance.pe` | `demo123` |
| Administradora (Ana) | `admin@dalechance.pe` | `admin123` |
| Creadora verificada (Valeria) | `vale@dalechance.pe` | `demo123` |
| Participante sin movimientos (Carlos) | `carlos@dalechance.pe` | `demo123` |

Código de verificación de cuenta: `123456`.
