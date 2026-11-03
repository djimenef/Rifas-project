# Inventario de pantallas (Fase 0)

Pantallas construidas como mockups navegables, con su ruta, quién puede entrar y los estados que muestran. Cada ruta está definida en [`assets/js/lib/rutas.js`](../../assets/js/lib/rutas.js) (archivo, acceso y layout); la especificación de cada pantalla está en el [README §6](../../README.md#6-inventario-de-pantallas-a-maquetar) y su semántica en [`docs/semantica/`](../semantica/README.md). El mapa de navegación está en [`docs/diagramas/mapa-de-pantallas.md`](../diagramas/mapa-de-pantallas.md).

**Estados comunes:** toda sección que carga datos muestra **cargando**, **vacío** y **error con Reintentar** (`components/estados.js`), y se pueden forzar desde el **panel de demo** (botón "Demo", abajo a la izquierda). Las rutas protegidas llevan a iniciar sesión y regresan a la misma pantalla con `?volver=`; con el rol equivocado se muestra "Sin acceso".

**Acceso:** Público · Sin sesión (redirige si ya hay sesión) · Sesión (cualquier usuario con sesión) · Participante · Admin.

## Públicas

| Pantalla | Ruta | Acceso | Estados |
|----------|------|--------|---------|
| Inicio | `/` | Público | Carrusel de destacadas · Rifas confirmadas (las 3 que cierran antes, con cuenta regresiva) · Rifas armándose · "Ver más…" hacia `/rifas` filtrado |
| Listado de rifas | `/rifas/?q=&estado=&categoria=` | Público | Con resultados · filtros por estado visible y categoría · búsqueda · vacío · sin resultados con filtros. Nunca muestra rifas que van solo por enlace |
| Detalle de rifa | `/r/?slug=` | Público | Una variante por estado visible · visitante (lleva a iniciar sesión y vuelve con `?accion=poner` o `?accion=comprar`) · participante con sus Chances y opciones · admin (enlace al panel) · compartir · lista pública de opciones (CSV) y huella · Rifa en vivo · cómo se eligió al ganador · seguimiento del premio (solo fechas) · no encontrada |
| Modal Poner Chances / Comprar opciones | dentro del detalle | Participante | Selector · saldo insuficiente con Recargar (vuelve al modal) · máximo por persona · confirmación con saldo antes y después · éxito (avisa si con tus Chances la rifa se armó) · error |
| Ganadores | `/ganadores` | Público | Lista con premio, apodo y estado de entrega (comprando, en camino, entregado) · vacío |
| Cómo funciona | `/como-funciona` | Público | Pasos de las Chances, estados de la rifa y cómo se elige al ganador |
| Preguntas frecuentes | `/preguntas-frecuentes` | Público | Acordeón |
| Términos · Privacidad · Reglamento | `/legal/terminos` · `/legal/privacidad` · `/legal/reglamento` | Público | Texto largo en borrador con los puntos pendientes marcados |
| Libro de Reclamaciones | `/libro-de-reclamaciones` | Público | Formulario con errores por campo · datos completados desde la cuenta si hay sesión · enviado (hoja numerada, plazo de respuesta) |

## Autenticación

| Pantalla | Ruta | Acceso | Estados |
|----------|------|--------|---------|
| Iniciar sesión | `/iniciar-sesion.html` | Sin sesión | Formulario · credenciales incorrectas · vuelve a `?volver=` |
| Crear cuenta | `/crear-cuenta.html` | Sin sesión | Errores por campo · DNI o correo ya registrado · menor de edad · lleva a verificar |
| Verificar cuenta | `/verificar/?volver=` | Sesión | Ingresar código · incorrecto · reenviar (espera de 30 s) · verificada · ya verificada |
| Recuperar contraseña | `/recuperar` | Sin sesión | Solicitar · enlace enviado · nueva contraseña (enlace de un solo uso) · enlace inválido |

## Participante

| Pantalla | Ruta | Acceso | Estados |
|----------|------|--------|---------|
| Mi billetera | `/billetera` | Participante | Disponible, retenidas y en qué rifas · sin retenidas · sin movimientos |
| Mi historial de puntos | `/billetera/historial/?tipo=&rifa=` | Participante | Movimientos con rifa y n.º de operación · filtro por tipo y rifa · vacío |
| Recargar Chances | `/billetera/recargar/?cantidad=&volver=` | Participante | Atajos 5/10/15/20 y monto libre 5–500 con aviso junto al campo · medio de pago simulado · procesando · éxito · rechazado |
| Mis rifas | `/mis-rifas/?pestana=` | Participante | Pestañas Armando · Abiertas · Finalizadas con contador · vacío por pestaña y general |
| Mis tickets en una rifa | `/mis-rifas/tickets/?codigo=` | Participante | Opciones con número y código · Chances retenidas · descargar la lista pública (CSV) · verificar mis opciones · lista aún no disponible |
| Perfil | `/perfil` | Participante | Datos con DNI enmascarado · editar apodo (apodo en uso) · cuenta sin verificar · insignia de creador verificado |
| Proponer rifa *(F2)* | `/crear-rifa` | Participante | Pegar link → leído (imagen de referencia, título, precio, tienda confiable) · **Link en revisión** (se envía sin Chances) · errores por campo (link, categoría, nombre, precio fuera de rango, mínimo del autor, saldo) · límite de propuestas activas · cuenta sin verificar · enviado (Rifa Sugerida con enlace, o Validando producto) |
| Mis rifas propuestas *(F2)* | `/mis-propuestas` | Participante | Rifa Sugerida (privada, enlace para copiar, avance hacia el apoyo mínimo en %, personas que faltan, tiempo restante) · Validando producto · pública · no se armó · descartada con motivo · vacío |

## Administración (`/admin/*`, layout de panel)

| Pantalla | Ruta | Acceso | Estados |
|----------|------|--------|---------|
| Dashboard | `/admin` | Admin | Recaudado · Chances retenidas · rifas por estado · pendientes del equipo con enlace a cada sección |
| Rifas | `/admin/rifas/?q=&estado=` | Admin | Tabla con filtros y acciones por fila (publicar, ver detalle) · vacío |
| Detalle de rifa (admin) | `/admin/rifas/?codigo=` | Admin | Datos internos (margen, meta, reunido, umbral) · configuración · producto y link · fechas · historial de estados · acciones por estado (publicar, validar link, moderar, simulaciones "Demo", cancelar con motivo o por fuerza mayor, ir a revisión, rifar, registrar compra y entrega) · no encontrada |
| Nueva rifa | `/admin/rifas/nueva` | Admin | Formulario con configuración por defecto (§7.9) y meta calculada · errores por campo |
| Cola de revisión | `/admin/revision` | Admin | Rifas cerradas o en revisión con lista de verificación · aprobar y anunciar la fecha · cancelar por fuerza mayor · vacía |
| Sorteos | `/admin/sorteos/?vista=` | Admin | Por rifar · realizadas · búsqueda · vacío |
| Rifar (elegir ganador) | `/admin/sorteo/?codigo=` | Admin | Lista congelada con huella comprobable · Rifa en vivo · confirmación · resultado verificable (semilla, posición, ganador) |
| Compras y entregas | `/admin/entregas/?estado=&q=` | Admin | Rifas realizadas con el siguiente registro pendiente · filtro por estado y búsqueda · vacío |
| Compra y entrega | `/admin/entrega/?codigo=` | Admin | Compra (datos, comprobante, producto equivalente con justificación) · envío (recojo o courier) · entrega con DNI verificado y evidencia (§7.12) |
| Productos | `/admin/productos/?q=&categoria=` | Admin | Listado · editar título y precio (el precio solo antes de que la rifa sea pública) · crear lleva a Nueva rifa |
| Categorías | `/admin/categorias` | Admin | Crear · editar · activar/desactivar |
| Usuarios | `/admin/usuarios` | Admin | Listado con filtros · detalle con movimientos · ajuste de saldo con motivo |
| Propuestas *(F2)* | `/admin/propuestas/?estado=&q=` | Admin | Tabla con filtro (link en revisión · en moderación) y búsqueda · validar link (aprobar, reemplazar, rechazar con motivo) · moderar (aprobar fijando el margen, descartar con motivo) · vacío. **Pendiente:** denuncias (sin regla definida) |

## Páginas internas de desarrollo (`/dev/*`, no son del sitio público)

| Página | Ruta | Para qué |
|--------|------|----------|
| Catálogo de componentes | `/dev/componentes/` | Componentes compartidos en todos sus estados |
| Pruebas de reglas de negocio | `/dev/pruebas/` | Ejecuta los servicios mock contra las reglas de la semántica; al terminar restaura los datos de ejemplo |
| Revisión de rutas | `/dev/rutas/` | Abre cada ruta con su rol a 1280 px y 360 px; revisa errores de JavaScript, secciones con error, "En construcción", desborde horizontal y enlaces internos rotos; al terminar restaura los datos y cierra la sesión |

## Capturas

Las capturas a 360 px y 1280 px van en cada Pull Request (plantilla `.github/pull_request_template.md`); no se guardan en el repositorio para no inflarlo.
