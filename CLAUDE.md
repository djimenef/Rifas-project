# CLAUDE.md — Reglas del proyecto para Claude Code

> Claude Code carga este archivo automáticamente en cada sesión. Es corto a propósito: las reglas viven aquí; la especificación completa vive en `README.md`.

## Proyecto

Plataforma web de rifas a demanda (Perú, soles). Los participantes se registran con DNI, recargan **Chances** (1 Chance = S/ 1 = 1 opción de ganar) y ponen Chances en rifas que se confirman solo si se arma el pozo ("Armando Rifa").

**Etapa actual: Fase 0 — mockups navegables.** Solo interfaz con datos falsos. Nada de backend.

## Fuentes de verdad (en este orden)

1. **Pantallas ya construidas en el repo** (inicio, login, registro): fuente de verdad **visual**.
2. **`README.md`**: fuente de verdad **funcional**. Sección 6 = inventario de pantallas; sección 7 = semántica (estados, acciones, reglas); sección 8 = tipos y datos de ejemplo.
3. **`PROMPT-FASE0.md`**: plan de trabajo paso a paso de la Fase 0.

Si algo no está definido en estas fuentes, **pregunta** antes de inventar. Si encuentras una contradicción entre ellas, detente y repórtala.

## Reglas obligatorias

- **No cambies el stack** existente (framework, librería de estilos, gestor de paquetes). No instales dependencias nuevas sin pedir permiso y explicar por qué.
- **No modifiques el aspecto** de las 3 pantallas existentes. Puedes refactorizarlas para extraer componentes y tokens, pero deben verse idénticas antes y después.
- **Todo color, tipografía, espaciado y radio sale de los tokens de diseño.** Nada de valores sueltos.
- **Las pantallas nunca importan mocks directamente:** consumen servicios (`services/interfaces` + `services/mock`).
- **La lógica de negocio va en los servicios mock**, no en los componentes. Los mocks deben aplicar las reglas de `README.md` §7 (saldo insuficiente, estados que no aceptan puntos, etc.).
- **El público nunca ve montos del pozo, meta ni margen**: solo cantidad de personas y barra de % (rojo → verde).
- Textos de interfaz en **español de Perú** usando el glosario de `README.md` §7.1.
- **Vocabulario visible:** la moneda se llama **Chance/Chances** y va en femenino ("35 Chances", "Tus Chances quedan retenidas", "¿Cuántas Chances quieres?"). "Chance" se usa **solo** para la moneda. Estados: **Armando Rifa**, **Calentando Rifa**, **No se armó la Rifa**; frases como "si la rifa se arma". Precio: **"Precio referencial: S/ X"**. En el código y nombres internos se mantiene "puntos" y `precioTienda`.
- **Recargas:** atajos de 5, 10, 15 y 20 + monto libre de 5 a 500 (aviso junto al campo fuera de rango).
- Mobile-first: probar a 360 px, 768 px y 1280 px.
- Accesibilidad: `label` en inputs, foco visible, contraste suficiente, navegable con teclado.
- Nunca borres archivos existentes sin preguntar.

## Flujo de trabajo

- **Al iniciar cada sesión:** `git pull` y leer [`docs/PROGRESO.md`](docs/PROGRESO.md) (paso actual, qué sigue, decisiones y pendientes).
- **`main` está protegida:** solo cambia por Pull Request revisado por la otra persona del equipo. Nunca hagas commit ni push directo a `main`.
- **Una rama por paso** o grupo de pantallas, creada desde `main` actualizado: `feature/paso4-pantallas-p1`, `feature/paso5-pantallas-p2`, `feature/paso6-pantallas-p3`, `docs/<tema>`, `fix/<descripcion>`.
- **Una sola persona por rama a la vez.** El traspaso es: commit + push + `docs/PROGRESO.md` actualizado. Quien sigue hace `git pull` antes de tocar nada.
- **Nunca** `git push --force` ni reescribir historia ya publicada.
- **Un commit por paso** (o por pantalla o grupo pequeño) con [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat(rifas): mockup de detalle de rifa`, `refactor(ui): extraer tokens de diseño`, `docs(semantica): estados de rifa`.
- **Al terminar un paso:** actualizar `docs/PROGRESO.md` **en el mismo commit**, correr `dev/pruebas/` (todo en verde) y hacer `push` de la rama.
- Los Pull Requests hacia `main` se abren cuando el usuario lo pida, con la plantilla de `.github/pull_request_template.md`. Nunca los fusiones tú: los revisa la otra persona.
- Al terminar cada paso, resume en 3–5 líneas qué hiciste y qué sigue.

## Comandos del proyecto

Stack: HTML, CSS y JavaScript estáticos con módulos ES, sin dependencias. Los módulos ES **no funcionan abriendo el archivo con doble clic** (`file://`): siempre usar el servidor local.

| Acción | Comando |
|--------|---------|
| Levantar en desarrollo | `python -m http.server 8000` → abrir http://localhost:8000 |
| Compilar | No aplica (sitio estático, sin build) |
| Lint / formato | No hay configurado (Node no está instalado; no se instalan herramientas sin permiso) |

Catálogo de componentes: http://localhost:8000/dev/componentes/
Pruebas de reglas de negocio (servicios mock): http://localhost:8000/dev/pruebas/ — al terminar restauran los datos de ejemplo.

## Panel de administración (`/admin/*`)

Regla desde el Paso 3 en adelante:

- **Layout propio de panel de gestión**, distinto al del sitio público.
- **Menú lateral fijo** con estas secciones, en este orden: Dashboard (`/admin`) · Rifas (`/admin/rifas`) · Revisión (`/admin/revision`) · Sorteos (`/admin/sorteos`) · Compras y entregas (`/admin/entregas`) · Productos (`/admin/productos`) · Categorías (`/admin/categorias`) · Usuarios (`/admin/usuarios`) · Propuestas (`/admin/propuestas`). La sección actual se marca como activa.
- **Header del panel:** logo, la etiqueta "Modo administrador", un enlace "Ver sitio" que vuelve a la web pública (`/`) y el menú de usuario (Cerrar sesión).
- **Listados en tablas** con filtros por estado y búsqueda, **acciones por fila** y **vista de detalle**.
- **Siempre con la misma paleta, tipografía, radios y botones** de las pantallas existentes, todo desde los tokens. No se inventan colores.
- **En móvil**, el menú lateral se convierte en un **menú desplegable**.

## Organización de carpetas

```
/
├── index.html                    Inicio (/)
├── iniciar-sesion.html           Login (/login)     ← excepción: archivo suelto
├── crear-cuenta.html             Registro (/registro) ← excepción: archivo suelto
├── rifas/index.html              cada pantalla nueva: su carpeta con su index.html
├── r/index.html                  (rutas dinámicas con ?slug=… o ?codigo=…)
├── billetera/index.html · billetera/historial/index.html · billetera/recargar/index.html
├── admin/index.html · admin/rifas/index.html · …
├── dev/                          páginas internas de desarrollo (no son del sitio público)
│   ├── componentes/index.html    catálogo de componentes
│   └── pruebas/index.html        pruebas de reglas de negocio
├── assets/                       TODO lo compartido
│   ├── css/
│   │   ├── tokens.css            colores, tipografía, espaciado, radios, sombras
│   │   ├── base.css              reset, contenedor, header, footer, botones
│   │   ├── components.css        componentes reutilizables (incluye el panel de demo)
│   │   ├── admin.css             layout del panel de administración (solo páginas /admin)
│   │   └── paginas/<pantalla>.css   estilos propios de cada pantalla
│   └── js/
│       ├── layout.js             protege la ruta, dibuja header/footer o el panel admin y el panel de demo
│       ├── session.js            sesión simulada (localStorage)
│       ├── components/           un módulo por componente (badge, barra-avance, modal…)
│       ├── paginas/<pantalla>.js lógica de presentación de cada pantalla
│       ├── domain/               tipos (JSDoc) y reglas puras del negocio
│       ├── services/
│       │   ├── index.js          ÚNICO punto que importan las pantallas
│       │   ├── interfaces/       contratos (auth, billetera, rifas, admin)
│       │   └── mock/             implementación Fase 0 (motor.js = reglas, db.js = persistencia)
│       ├── mocks/                datos falsos; solo los lee services/mock
│       └── lib/                  utilidades: rutas.js (MAPA DE RUTAS y acceso), formato, ids, hash, html, demo
├── docs/                         PROGRESO.md (bitácora), propuesta.md, diagramas/ (Mermaid) y, en el Paso 7, semantica/
├── .github/pull_request_template.md
├── README.md · CLAUDE.md · PROMPT-FASE0.md
└── .gitignore
```

**Reglas**
- Lo compartido vive en `assets/`. Cada pantalla vive en su carpeta con su `index.html`, que imita la ruta (`/billetera/historial` → `billetera/historial/index.html`).
- **Nada de CSS ni JS dentro de los HTML**: ni `<style>`, ni `<script>` en línea, ni atributos `style="…"`. El HTML de una pantalla solo tiene estructura y enlaza `tokens.css`, `base.css`, `components.css`, `paginas/<pantalla>.css` y **un solo** script: `paginas/<pantalla>.js` (que importa `layout.js` si la pantalla lleva header y footer).
- El nombre `<pantalla>` es la ruta con guiones: `billetera-historial.css`, `admin-rifas.js`. Las páginas de `dev/` usan el prefijo `dev-`.
- Las pantallas importan datos **solo** desde `services/index.js`; nunca desde `services/mock/` ni `mocks/`.
- **Excepción por decisión del proyecto:** login y registro se quedan como archivos sueltos en la raíz, `iniciar-sesion.html` y `crear-cuenta.html`, y con esos nombres se enlazan (también en `?volver=`). Sus estilos y scripts siguen la regla: `paginas/iniciar-sesion.*` y `paginas/crear-cuenta.*`.

**Cómo se arma una pantalla**
- `<body data-ruta="<id>">`, donde `<id>` es la clave de la ruta en `assets/js/lib/rutas.js` (ahí se define su archivo, nombre, acceso y layout).
- Estructura mínima: `<header data-layout="header"></header>`, `<main></main>`, `<footer data-layout="footer"></footer>`.
- El script de la pantalla empieza con `const { permitido, usuario } = await listo;` (importado de `layout.js`) y solo dibuja si `permitido`.
- Las secciones que cargan datos usan `cargarSeccion()` (`components/estados.js`): muestra cargando, vacío o error y respeta el estado forzado desde el panel de demo.
- Enlaces internos siempre con `url('<id>', { parametros })`, nunca rutas escritas a mano en el JS.
- Mientras no se construye, una pantalla usa `paginas/en-construccion.js` (marcador "En construcción").

**Convención de nombres**
- Carpetas y archivos en **español**, **minúsculas** y con **guiones**: `barra-avance.js`, `crear-cuenta.html`, `billetera/historial/`.
- Términos técnicos genéricos en inglés cuando no hay uno mejor (`services`, `mock`, `index`, `lib`, `assets`, `dev`).
- En el código: funciones y variables en español con camelCase (`montarHeader`, `puntosReunidos`), constantes en MAYÚSCULAS (`ESTADOS_RIFA`).

**Credenciales de demo:** `lucia@dalechance.pe` / `demo123` (participante) · `admin@dalechance.pe` / `admin123` (admin) · `vale@dalechance.pe` / `demo123` (creadora) · código de verificación `123456`.
