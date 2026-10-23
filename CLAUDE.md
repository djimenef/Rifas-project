# CLAUDE.md — Reglas del proyecto para Claude Code

> Claude Code carga este archivo automáticamente en cada sesión. Es corto a propósito: las reglas viven aquí; la especificación completa vive en `README.md`.

## Proyecto

Plataforma web de rifas a demanda (Perú, soles). Los participantes se registran con DNI, recargan puntos (1 punto = S/ 1 = 1 opción) y ponen puntos en rifas que se confirman solo si se arma el pozo ("Armando la Chance").

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
- Mobile-first: probar a 360 px, 768 px y 1280 px.
- Accesibilidad: `label` en inputs, foco visible, contraste suficiente, navegable con teclado.
- Nunca borres archivos existentes sin preguntar.

## Flujo de trabajo

- Trabaja en la rama `feature/fase0-mockups` (créala desde la rama principal si no existe).
- **Un commit por paso** del plan, con [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat(rifas): mockup de detalle de rifa`, `refactor(ui): extraer tokens de diseño`, `docs(semantica): estados de rifa`.
- No hagas `push` ni abras PRs sin que te lo pida.
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
│   │   ├── components.css        componentes reutilizables
│   │   └── paginas/<pantalla>.css   estilos propios de cada pantalla
│   └── js/
│       ├── layout.js             dibuja el header y el footer comunes
│       ├── session.js            sesión simulada (localStorage)
│       ├── components/           un módulo por componente (badge, barra-avance, modal…)
│       ├── paginas/<pantalla>.js lógica de presentación de cada pantalla
│       ├── domain/               tipos (JSDoc) y reglas puras del negocio
│       ├── services/
│       │   ├── index.js          ÚNICO punto que importan las pantallas
│       │   ├── interfaces/       contratos (auth, billetera, rifas, admin)
│       │   └── mock/             implementación Fase 0 (motor.js = reglas, db.js = persistencia)
│       ├── mocks/                datos falsos; solo los lee services/mock
│       └── lib/                  utilidades (formato, ids, hash, rutas, html)
├── docs/                         documentación (Paso 7)
├── README.md · CLAUDE.md · PROMPT-FASE0.md
└── .gitignore
```

**Reglas**
- Lo compartido vive en `assets/`. Cada pantalla vive en su carpeta con su `index.html`, que imita la ruta (`/billetera/historial` → `billetera/historial/index.html`).
- **Nada de CSS ni JS dentro de los HTML**: ni `<style>`, ni `<script>` en línea, ni atributos `style="…"`. El HTML de una pantalla solo tiene estructura y enlaza `tokens.css`, `base.css`, `components.css`, `paginas/<pantalla>.css` y **un solo** script: `paginas/<pantalla>.js` (que importa `layout.js` si la pantalla lleva header y footer).
- El nombre `<pantalla>` es la ruta con guiones: `billetera-historial.css`, `admin-rifas.js`. Las páginas de `dev/` usan el prefijo `dev-`.
- Las pantallas importan datos **solo** desde `services/index.js`; nunca desde `services/mock/` ni `mocks/`.
- **Excepción por decisión del proyecto:** login y registro se quedan como archivos sueltos en la raíz, `iniciar-sesion.html` y `crear-cuenta.html`, y con esos nombres se enlazan (también en `?volver=`). Sus estilos y scripts siguen la regla: `paginas/iniciar-sesion.*` y `paginas/crear-cuenta.*`.

**Convención de nombres**
- Carpetas y archivos en **español**, **minúsculas** y con **guiones**: `barra-avance.js`, `crear-cuenta.html`, `billetera/historial/`.
- Términos técnicos genéricos en inglés cuando no hay uno mejor (`services`, `mock`, `index`, `lib`, `assets`, `dev`).
- En el código: funciones y variables en español con camelCase (`montarHeader`, `puntosReunidos`), constantes en MAYÚSCULAS (`ESTADOS_RIFA`).

**Credenciales de demo:** `lucia@dalechance.pe` / `demo123` (participante) · `admin@dalechance.pe` / `admin123` (admin) · `vale@dalechance.pe` / `demo123` (creadora) · código de verificación `123456`.
