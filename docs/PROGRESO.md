# Bitácora del proyecto (PROGRESO)

> **Lee esto al empezar cada sesión** (después de `git pull`). Al terminar un paso, actualízalo en el mismo commit y haz push.
> Plan de trabajo: [`PROMPT-FASE0.md`](../PROMPT-FASE0.md) · Reglas: [`CLAUDE.md`](../CLAUDE.md) · Especificación: [`README.md`](../README.md)

## Estado actual

| | |
|---|---|
| **Paso actual** | Pasos 0 a 3 terminados y fusionados en `main` (PR #4). **Siguiente: Paso 4 (pantallas P1)**, todavía no empezado. |
| **Responsable del Paso 4** | **David** |
| **Rama del Paso 4** | `feature/paso4-pantallas-p1` (creada desde `main` actualizado, ya publicada en GitHub) |
| **Revisión** | Al terminar el Paso 4, David abre un Pull Request hacia `main` y lo revisa el otro integrante del equipo. |
| **Última actualización** | 2026-10-23 |

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
| Docs | Traspaso del Paso 4 a David | el commit que agregó esta fila |

Verificación al cierre: **50/50 pruebas** en `dev/pruebas/` y 12/12 flujos de navegación revisados en Chrome.

## Sigue

1. **Paso 4 — Pantallas P1** (ver `PROMPT-FASE0.md`), a cargo de **David** en `feature/paso4-pantallas-p1`: listado de rifas, detalle por estado, modal Poner Chances / Comprar opciones, Cómo funciona, Verificar cuenta, Billetera, Historial, Recargar, Mis rifas y Admin (Rifas y Cola de revisión).
2. Al terminar: `docs/PROGRESO.md` actualizado en el mismo commit, `dev/pruebas/` en verde, push y **Pull Request hacia `main`** con la plantilla. Lo revisa el otro integrante del equipo.

### Pendientes anotados para el Paso 4
- **Header de Inicio:** hoy "Cómo funciona" y "Preguntas" bajan a `#como-funciona` y `#faq` de la misma página porque sus páginas están en construcción. Cuando se construyan `/como-funciona` y `/preguntas-frecuentes`, cambiarlo en `assets/js/components/header.js` (buscar `PENDIENTE`).
- **Recargar (`/billetera/recargar`):** atajos 5/10/15/20 + monto libre de 5 a 500 con el mismo comportamiento que Inicio. Leer `?cantidad=` (lo manda Inicio) y usar `billeteraService.opcionesRecarga()`.
- **Verificar (`/verificar`):** el registro ya llega aquí con `?volver=`; el código de demo es `123456`.

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
python -m http.server 8000
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
- Sitio estático con módulos ES; se levanta con `python -m http.server 8000`. Sin dependencias.
- Cada pantalla en su carpeta con `index.html`; CSS y JS propios en `assets/css/paginas/` y `assets/js/paginas/`. Nada de CSS/JS dentro de los HTML.
- **Excepción:** login y registro son archivos sueltos (`iniciar-sesion.html`, `crear-cuenta.html`) y así se enlazan, también en `?volver=`.
- Nombres en español, minúsculas y con guiones. En el código se dice "puntos" y `precioTienda`.
- Las pantallas solo importan datos desde `assets/js/services/index.js`.
- En la Fase 1 el frontend se moverá a `web/` y el backend irá en `api/`.

**Producto y textos**
- La moneda visible se llama **Chance/Chances**, en femenino. "Chance" se usa solo para la moneda.
- Estados visibles: **Armando Rifa**, **Calentando Rifa**, **No se armó la Rifa**.
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

**Panel de administración**
- Layout propio: menú lateral fijo (Dashboard, Rifas, Revisión, Sorteos, Compras y entregas, Productos, Categorías, Usuarios, Propuestas), tablas con filtros y búsqueda, acciones por fila y detalle; "Modo administrador" y "Ver sitio"; en móvil, menú desplegable. Misma paleta.

**Trabajo en equipo**
- `main` protegida: solo cambia por Pull Request revisado por el otro.
- Una rama por paso, creada desde `main` actualizado; una sola persona por rama a la vez.
- Siempre `git pull` antes de empezar. Nunca force push.

## Dudas abiertas

- Decisiones pendientes del README §13: #2 límite al retiro de Chances, #5 vencimiento, #8 qué pasa con lo recaudado sobre la meta, #9 plazo para reclamar, #15 beneficio para creadores, #23 límite diario de recarga (recomendado S/ 500).
- Rango de precio definitivo para proponer rifas (hoy S/ 50–10,000).
- Validación legal (Ministerio del Interior / MINCETUR) antes de cualquier lanzamiento.

## Cómo levantar el proyecto

```bash
git pull
python -m http.server 8000
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
