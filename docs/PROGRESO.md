# Bitácora del proyecto (PROGRESO)

> **Lee esto al empezar cada sesión** (después de `git pull`). Al terminar un paso, actualízalo en el mismo commit y haz push.
> Plan de trabajo: [`PROMPT-FASE0.md`](../PROMPT-FASE0.md) · Reglas: [`CLAUDE.md`](../CLAUDE.md) · Especificación: [`README.md`](../README.md)

## Estado actual

| | |
|---|---|
| **Paso actual** | Paso 4 (pantallas P1) **fusionado en `main`** (PR #5). Ajustes de Inicio, estados y opciones en `feature/ajustes-inicio-y-estados`, **pendiente de Pull Request** hacia `main`. Siguiente: **Paso 5 (pantallas P2)**. |
| **Rama en curso** | `feature/ajustes-inicio-y-estados` (publicada en GitHub; trabajada por elagrioagrio). No hay cambios sin subir. |
| **Revisión** | Se abre el PR hacia `main` y lo revisa **David**. Después del merge, el Paso 5 empieza en una rama nueva desde `main` actualizado (`feature/paso5-pantallas-p2`). |
| **Para continuar (David)** | `git pull` en `main` → revisar el PR de esta rama → merge → crear `feature/paso5-pantallas-p2`. Si hay que seguir en esta misma rama antes del merge: `git switch feature/ajustes-inicio-y-estados` + `git pull` (una sola persona por rama a la vez). |
| **Última actualización** | 2026-10-23 (ajustes de Inicio, estados y opciones: **56/56 pruebas**) |

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
| 4 | Cierre del Paso 4: esta bitácora | el commit que agregó esta fila |
| Merge | PR #5 "Paso 4: pantallas P1" fusionado en `main` | `d25e450` |
| Ajustes | Servidor local sin caché (`dev/servidor.py`) | `e92444e` |
| Ajustes | Estados visibles, Chances bloqueadas, tiempo extra, cancelar con motivo / por fuerza mayor, productos reales | `6a06451` |
| Ajustes | Inicio: logo, carrusel de destacadas, Rifas confirmadas (cuenta regresiva) y Rifas armándose con fotos; /rifas por categoría | `85f6c74` |
| Docs | Ciclo de vida de la rifa, flujo de Chances y diagramas | `98cfd20` |
| Ajustes | Panel admin sin "sorteo" en textos visibles | `850881d` |
| Ajustes | Sorteo con opciones mezcladas al azar (reproducible) | `c062e0e` |
| Ajustes | Código por opción, lista pública anónima (CSV), Mis tickets y "Rifa en vivo" | `147425b` |

Verificación al cierre del Paso 4: **50/50 pruebas** en `dev/pruebas/`; flujos revisados en Chrome a 1280 px y 360 px (visitante → login → regresa con el modal abierto → poner Chances; saldo insuficiente → recargar → volver; recarga con éxito y rechazo; verificar con código incorrecto y correcto; admin: aporte simulado → rifa confirmada → cerrar → aprobar y programar; crear borrador).

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

1. **Pull Request del Paso 4** hacia `main` con la plantilla; lo revisa el otro integrante del equipo.
2. **Paso 5 — Pantallas P2** (ver `PROMPT-FASE0.md`) en una rama nueva `feature/paso5-pantallas-p2` creada desde `main` actualizado.

### Pendientes anotados para el Paso 5
- **Header de Inicio:** "Preguntas" todavía baja a `#faq` de la misma página porque `/preguntas-frecuentes` está en construcción. Al construirla, cambiarlo en `assets/js/components/header.js` (buscar `PENDIENTE`). "Cómo funciona" ya va a su página.
- **Enlaces que ya apuntan a pantallas P2:** "Rifar (elegir ganador)" (`/admin/sorteo/?codigo=`) y "Registrar compra y entrega" (`/admin/entrega/?codigo=`) muestran "En construcción" hasta el Paso 5.
- **Header con sesión a 360 px:** con barra de desplazamiento visible, el header de participante desborda unos 5 px (saldo + botón de usuario). En móviles reales la barra no ocupa espacio; revisar si hace falta ajustarlo.
- **Toast detrás del modal:** el aviso "¡Listo!" queda detrás del fondo del modal abierto; el modal ya muestra el éxito, así que no se pierde información.

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
