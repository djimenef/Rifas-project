# PROMPT-FASE0.md — Plan de trabajo para Claude Code

> **Cómo usarlo:** en la terminal del proyecto, abre Claude Code y escribe:
> `Lee CLAUDE.md, README.md y PROMPT-FASE0.md. Ejecuta el Paso 0 y espera mi aprobación.`
> Después, avanza paso por paso: `Continúa con el Paso 1`, `Continúa con el Paso 2`, etc.

---

## Objetivo

Construir **todas las interfaces** del inventario de `README.md` §6 como **mockups navegables**, conectadas entre sí, con datos falsos y con el mismo estilo visual de las 3 pantallas que ya existen (inicio, login, registro). Al final debe poder recorrerse el flujo completo con clics:

> visitante entra por un enlace de rifa → se registra → verifica su cuenta → recarga puntos → pone puntos en una rifa "Armando la Chance" → ve sus puntos retenidos → la rifa "va" → ve sus tickets → ve el sorteo y al ganador.

Sin backend, sin base de datos, sin pagos reales, sin llamadas a APIs externas.

---

## Paso 0 — Reconocimiento (solo lectura, no modifiques nada)

1. Lista la estructura del proyecto y lee `package.json` (o equivalente) si existe.
2. Identifica el **stack**: ¿HTML/CSS/JS estático, React, Next.js, Vue, Astro, otro? ¿Qué librería de estilos? ¿Hay router?
3. Ubica las 3 pantallas existentes y anota:
   - Archivos que las componen.
   - Paleta de colores, tipografías, tamaños, espaciados, radios, sombras.
   - Componentes que se repiten (botones, inputs, header, footer, tarjetas).
   - Cómo navegan hoy entre sí (si lo hacen).
4. Detecta los comandos para levantar, compilar y revisar el proyecto, y complétalos en la tabla de `CLAUDE.md`.
5. **Entrégame un plan** que incluya:
   - Stack detectado y cómo vas a aplicar la estructura de `README.md` §5 a ese stack (usa la tabla "Adaptación según el stack" de abajo).
   - Lista de tokens y componentes que vas a extraer.
   - Cualquier contradicción o duda que encuentres.
6. **Detente y espera mi aprobación.**

### Adaptación según el stack

| Si el proyecto es… | Rutas | Navegación | Datos falsos | Estado de sesión simulada |
|--------------------|-------|------------|--------------|---------------------------|
| **HTML/CSS/JS estático** | Un `.html` por pantalla, en carpetas que imiten la ruta (`/rifas/index.html`, `/r/index.html?slug=…`) | `<a href>` y un `nav.js` común | Módulos JS en `assets/js/mocks/` | `localStorage` envuelto en try/catch, en `assets/js/session.js` |
| **React (Vite) / Vue** | Router del framework (instalar solo si falta y con mi permiso) | `<Link>` / `router-link` | `src/mocks` + `src/services/mock` | Contexto/store `SessionProvider` |
| **Next.js / Nuxt / Astro** | Rutas por carpeta del framework | `<Link>` del framework | `src/mocks` + `src/services/mock` | Contexto/store `SessionProvider` |

En cualquier caso, respeta la **separación por capas** de `README.md` §3: pantallas → servicios (interfaz) → implementación mock → datos falsos.

---

## Paso 1 — Rama y base de diseño

1. Crea la rama `feature/fase0-mockups`.
2. Extrae los **tokens de diseño** de las pantallas existentes (colores, tipografía, espaciado, radios, sombras). Agrega solo los que falten para lo nuevo:
   - Colores de estado de rifa (ver tabla de estados abajo).
   - Gradiente de la barra de avance: rojo (0 %) → naranja → amarillo → verde (100 %).
3. Extrae a componentes reutilizables lo que ya existe: botón, input, tarjeta, header, footer.
4. Crea los componentes base nuevos: `Badge` (estado de rifa), `BarraAvance` (0–100 % con gradiente), `Modal`, `SelectorCantidad` (− N +), `Tabs`, `EstadoVacio`, `EstadoError`, `Cargando`, `Toast`.
5. Verifica que las 3 pantallas existentes **se ven idénticas** a antes.
6. Commit: `refactor(ui): tokens de diseño y componentes base`.

---

## Paso 2 — Dominio, datos falsos y servicios

1. Crea los **tipos de dominio** a partir de `README.md` §7 y §8: `EstadoRifa`, `Rifa`, `Billetera`, `Movimiento`, `TipoMovimiento`, `Compromiso`, `Ticket`, `PaqueteRecarga`, `Usuario`, `Categoria`, `Comprobante`.
2. Crea los **datos falsos** cubriendo **al menos una rifa por cada estado** de `README.md` §7.4, varias categorías (Zapatillas, Ropa, Relojes, Consolas, TVs, Celulares), un usuario participante y uno administrador, una billetera con saldo disponible y retenido, y un historial con todos los tipos de movimiento.
3. Crea las **interfaces de servicio** y su **implementación mock**:
   - `AuthService`: registrar, iniciar sesión, cerrar sesión, verificar código, sesión actual.
   - `BilleteraService`: obtener (con retenido por rifa), historial con filtros, recargar.
   - `RifasService`: listar (filtros por estado, categoría, búsqueda), obtener por slug o por código, comprometer, retirar compromiso, comprar, proponer.
   - `AdminService`: listar rifas por estado, crear, publicar, aprobar/cancelar revisión, sortear, registrar compra y entrega, validar o reemplazar link, ajustar saldo.
4. Los servicios mock deben:
   - Responder con un pequeño retraso (300–600 ms) para que se vean los estados de carga.
   - **Aplicar las reglas** de `README.md` §7.3 y §7.5: rechazar si el saldo no alcanza, si la rifa no acepta puntos en su estado, si se pasa el máximo por persona, si el link está en revisión.
   - Simular la **clave de idempotencia** (§7.10): repetir la misma clave no descuenta dos veces.
   - Mantener el estado **en memoria** durante la sesión del navegador (y en `localStorage` solo si el stack es estático).
   - Si al poner puntos se llega al 100 % de la meta, cambiar la rifa a `ABIERTA` y convertir compromisos en tickets.
5. Commit: `feat(dominio): tipos, datos falsos y servicios mock`.

---

## Paso 3 — Navegación y layout

1. Implementa el **mapa de rutas** completo (tabla de abajo). Las pantallas que aún no existan muestran un marcador "En construcción" con el nombre de la pantalla, para que **ningún enlace quede roto**.
2. **Header** con dos variantes:
   - Sin sesión: logo → `/`, Rifas, Cómo funciona, botones Iniciar sesión / Crear cuenta.
   - Con sesión: logo, Rifas, Mis rifas, **saldo visible** (disponible) que lleva a `/billetera`, botón Recargar, menú de usuario (Perfil, Mi historial, Cerrar sesión). Si el usuario es admin, enlace a `/admin`.
3. **Footer** con: Cómo funciona, Preguntas frecuentes, Términos, Privacidad, Reglamento, Libro de Reclamaciones.
4. **Protección de rutas simulada:**
   - Rutas de usuario y admin sin sesión → redirigen a `/login?volver=<ruta original>`.
   - Tras iniciar sesión o crear cuenta → regresa a `volver` (o a `/rifas` si no hay).
   - Rutas `/admin/*` con usuario no admin → página "No tienes acceso".
5. **Panel de demo** (solo en Fase 0): un botón flotante discreto que permita cambiar entre *visitante / participante / admin* y forzar el estado de la pantalla actual (*cargando / vacío / error*). Así se revisan todos los estados sin tocar código.
6. Conecta las 3 pantallas existentes al nuevo layout y rutas (login y registro deben respetar `volver`).
7. Commit: `feat(navegacion): rutas, layout, sesión simulada y panel de demo`.

---

## Paso 4 — Pantallas P1

Construye cada pantalla con **todos sus estados** (columna "Estados" de `README.md` §6) y con las conexiones de la tabla "Flujos" de abajo. Un commit por pantalla o por grupo pequeño.

1. Listado de rifas `/rifas` (filtros por estado y categoría, búsqueda; **no** muestra rifas `SOLO_ENLACE`).
2. Detalle público `/r/[slug]` con **una variante por estado** y la tarjeta definida en `README.md` §6 (título del producto, precio en tienda, personas, barra %, ID en letra pequeña, compartir).
3. Modal **Poner puntos / Comprar opciones** con pantalla de confirmación (saldo antes y después), saldo insuficiente → botón "Recargar" que vuelve al modal.
4. Cómo funciona `/como-funciona`.
5. Verificar cuenta `/verificar`.
6. Mi billetera `/billetera` (disponible, retenido y en qué rifas).
7. Mi historial de puntos `/billetera/historial`.
8. Recargar `/billetera/recargar` (paquetes 5/10/15/20, medio de pago simulado, procesando, éxito, rechazado).
9. Mis rifas `/mis-rifas` (pestañas Armando · Abiertas · Finalizadas).
10. Admin: Rifas `/admin/rifas` y Cola de revisión `/admin/revision`.

Al terminar el Paso 4, el **flujo completo del Objetivo** debe poder recorrerse con clics.

---

## Paso 5 — Pantallas P2

Ganadores, Preguntas frecuentes, Legales, Libro de Reclamaciones, Recuperar contraseña, Mis tickets en una rifa, Perfil, Admin: Dashboard, Productos, Ejecutar sorteo, Compra y entrega, Categorías, Usuarios.

---

## Paso 6 — Pantallas P3 (Fase 2, solo maqueta)

Proponer rifa (pegar link → mostrar título, imagen y precio "leídos" del mock; link sospechoso → aviso de "Link en revisión"), Mis rifas propuestas (con enlace para compartir y avance hacia el umbral), Admin: Moderar propuestas (validar o **reemplazar** link).

---

## Paso 7 — Documentación semántica

Divide `README.md` §7 en los archivos de `docs/semantica/` indicados en `README.md` §5, sin perder contenido. En `README.md` deja el resumen y enlaces a esos archivos. Crea `docs/pantallas/inventario.md` con la lista de pantallas construidas, su ruta y sus estados.

Commit: `docs(semantica): separar semántica funcional por dominio`.

---

## Paso 8 — Verificación final

1. Compila / ejecuta lint sin errores.
2. Recorre **todas las rutas** de la tabla y confirma que ninguna está rota (si el stack lo permite, con un script que revise los enlaces).
3. Recorre el flujo del Objetivo de punta a punta.
4. Revisa cada pantalla a 360 px y 1280 px.
5. Entrégame un resumen con: pantallas terminadas, pendientes, decisiones que tomaste y dudas abiertas.

---

## Mapa de rutas

| Ruta | Pantalla | Acceso |
|------|----------|--------|
| `/` | Inicio (existente) | Público |
| `/rifas` | Listado de rifas | Público |
| `/r/[slug]` | Detalle de rifa (enlace compartible) | Público |
| `/ganadores` | Ganadores | Público |
| `/como-funciona` | Cómo funciona | Público |
| `/preguntas-frecuentes` | FAQ | Público |
| `/legal/terminos` · `/legal/privacidad` · `/legal/reglamento` | Legales | Público |
| `/libro-de-reclamaciones` | Libro de Reclamaciones | Público |
| `/login` | Iniciar sesión (existente) | Solo sin sesión |
| `/registro` | Crear cuenta (existente) | Solo sin sesión |
| `/verificar` | Verificar correo/celular | Recién registrado |
| `/recuperar` | Recuperar contraseña | Solo sin sesión |
| `/billetera` | Mi billetera | Participante |
| `/billetera/historial` | Mi historial de puntos | Participante |
| `/billetera/recargar` | Recargar puntos | Participante |
| `/mis-rifas` | Mis rifas | Participante |
| `/mis-rifas/[codigo]` | Mis tickets en una rifa | Participante |
| `/perfil` | Perfil | Participante |
| `/crear-rifa` | Proponer rifa (F2) | Participante |
| `/mis-propuestas` | Mis rifas propuestas (F2) | Participante |
| `/admin` | Dashboard | Admin |
| `/admin/rifas` · `/admin/rifas/nueva` | Rifas | Admin |
| `/admin/revision` | Cola de revisión | Admin |
| `/admin/rifas/[codigo]/sorteo` | Ejecutar sorteo | Admin |
| `/admin/rifas/[codigo]/entrega` | Compra y entrega | Admin |
| `/admin/productos` | Productos | Admin |
| `/admin/categorias` | Categorías | Admin |
| `/admin/usuarios` | Usuarios | Admin |
| `/admin/propuestas` | Moderar propuestas (F2) | Admin |

> Adapta la sintaxis de rutas dinámicas al stack (por ejemplo, `?slug=` en HTML estático).

## Flujos (conexiones entre pantallas)

| Desde | Acción | Hacia |
|-------|--------|-------|
| Inicio | "Ver rifas" / tarjeta destacada | `/rifas` / `/r/[slug]` |
| Listado | Clic en tarjeta | `/r/[slug]` |
| Detalle (visitante) | "Poner puntos" o "Comprar opciones" | `/login?volver=/r/[slug]` (con enlace a `/registro?volver=…`) |
| Login / Registro | Éxito | `volver` → detalle con el modal ya abierto |
| Registro | Éxito | `/verificar` → luego `volver` o `/rifas` |
| Detalle (participante) | "Poner puntos" | Modal → confirmación → éxito (toast + saldo del header actualizado) |
| Modal | Saldo insuficiente → "Recargar" | `/billetera/recargar?volver=/r/[slug]` → tras éxito regresa al detalle |
| Detalle | "Compartir" | Copia el enlace y muestra toast |
| Header | Saldo | `/billetera` |
| Billetera | "Ver historial" / "Recargar" / rifa con puntos retenidos | `/billetera/historial` / `/billetera/recargar` / `/r/[slug]` |
| Historial | Movimiento con rifa | `/r/[slug]` |
| Mis rifas | Tarjeta | `/mis-rifas/[codigo]` (tickets) con enlace a `/r/[slug]` |
| Detalle (sorteada) | "Ver sorteo" | Sección de transparencia (hash, ganador) en el mismo detalle |
| Admin rifas | Rifa | Detalle admin con acciones según estado (publicar, revisar, sortear, entrega) |
| Cola de revisión | "Aprobar y programar" | Rifa pasa a `PROGRAMADA` y vuelve a la cola |
| Footer | Enlaces legales | `/legal/*`, `/libro-de-reclamaciones` |

## Estados de rifa y su presentación

| Estado | Badge | Color | Visible en listado |
|--------|-------|-------|--------------------|
| `REVISION_LINK` | 🔎 Link en revisión | Gris | No |
| `CAPTANDO` | 🔥 Calentando la Chance · 🔒 | Naranja | No (solo por enlace) |
| `PROPUESTA` | 📝 En moderación | Gris | No |
| `ARMANDO` | 🍀 Armando la Chance | Amarillo | Sí |
| `ABIERTA` | 🟢 ¡Va! Rifa confirmada | Verde | Sí |
| `CERRADA` | ⚪ Cerrada | Gris claro | Sí |
| `EN_REVISION` | 🟠 En revisión | Naranja | Sí |
| `PROGRAMADA` | 📅 Sorteo el *fecha* | Azul | Sí |
| `SORTEADA` | 🏆 Ganador: *apodo* | Dorado | Sí |
| `COMPRANDO` | 🛒 Comprando el premio | Azul | Sí |
| `EN_CAMINO` | 🚚 En camino | Azul | Sí |
| `ENTREGADA` | ✅ Entregada | Verde oscuro | Sí |
| `NO_SE_ARMO` | ⚫ No se armó la Chance | Gris oscuro | Sí (en "Finalizadas") |
| `CANCELADA` | 🔴 Cancelada | Rojo | Sí (en "Finalizadas") |
| `BORRADOR` · `DESCARTADA` | — | — | No |

> Usa los colores de la paleta existente que más se acerquen; los nombres de color son orientativos.

## Lo que NO debes hacer

- No crear backend, base de datos ni autenticación real.
- No llamar a servicios externos (RENIEC, pasarelas de pago, Random.org, lectura real de links de tiendas).
- No mostrar al público montos del pozo, meta ni margen.
- No cambiar el aspecto de las pantallas existentes.
- No instalar dependencias sin permiso.
- No avanzar al siguiente paso sin que te lo pida.
