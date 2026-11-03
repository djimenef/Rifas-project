# Rifas-project — Plataforma de Rifas a Demanda

> **Estado del proyecto:** 🟡 Fase 0 · Mockups (en desarrollo inicial)
> **Mercado:** Perú · **Moneda:** Soles (S/)
> **Este documento es la introducción oficial del repositorio.** Explica qué estamos construyendo, cómo se trabaja en esta etapa y dónde vive cada definición.
>
> 📄 **[Propuesta del proyecto](docs/propuesta.md)** — resumen de negocio para socios e inversionistas.
> 📍 **[Bitácora (PROGRESO)](docs/PROGRESO.md)** — en qué paso estamos, qué sigue y decisiones tomadas.
> 🗺️ **Diagramas:** [flujo de trabajo](docs/diagramas/flujo-de-trabajo.md) · [ciclo de vida de una rifa](docs/diagramas/ciclo-de-vida-rifa.md) · [billetera](docs/diagramas/flujo-billetera.md) · [recorrido del usuario](docs/diagramas/recorrido-usuario.md) · [arquitectura](docs/diagramas/arquitectura.md)

---

## Índice

1. [Qué es este proyecto](#1-qué-es-este-proyecto)
2. [Estado actual del repositorio](#2-estado-actual-del-repositorio)
3. [Cómo trabajamos: tres capas](#3-cómo-trabajamos-tres-capas)
4. [Instrucciones de desarrollo para la Fase 0 (mockups)](#4-instrucciones-de-desarrollo-para-la-fase-0-mockups)
5. [Estructura del repositorio](#5-estructura-del-repositorio)
6. [Inventario de pantallas a maquetar](#6-inventario-de-pantallas-a-maquetar)
7. [Semántica funcional (definición abstracta)](#7-semántica-funcional-definición-abstracta)
8. [Datos de ejemplo para los mockups](#8-datos-de-ejemplo-para-los-mockups)
9. [Referencia técnica para la fase funcional](#9-referencia-técnica-para-la-fase-funcional)
10. [Cumplimiento legal](#10-cumplimiento-legal)
11. [Roadmap](#11-roadmap)
12. [Convenciones del equipo](#12-convenciones-del-equipo)
13. [Decisiones pendientes](#13-decisiones-pendientes)

---

## 1. Qué es este proyecto

Plataforma web donde los usuarios se registran con su **DNI**, **recargan saldo en puntos** y usan esos puntos para **comprar opciones (tickets) en rifas de productos**.

- **1 punto = S/ 1.00 = 1 opción** en una rifa. En pantalla, el punto se llama **Chance** ("1 Chance = S/ 1 = 1 opción de ganar").
- Recargas: atajos rápidos de **5, 10, 15 y 20 Chances** o un **monto libre de 5 a 500 Chances** por recarga (límites configurables por un admin, §7.9).
- Cada rifa nace como una **intención**: muestra la foto del producto, su **precio referencial** (según el link de la tienda) y cuánta gente ya participa.
- Cada rifa tiene una **meta** = precio del producto + **margen interno** de la plataforma. El margen nunca se muestra al público.
- **Ciclo de vida visible** (detalle en §7.4 y §7.13): **Rifa Sugerida** *(Fase 2, solo por enlace)* → **Rifa Armándose** (menos del 100 %) → **Rifa Confirmada** (llegó al 100 %) → **Rifa Cerrada** (por rifar) → **Rifa Realizada** (ya hay ganador) → **Premio Entregado**. Si no llega al 100 % a tiempo, **Rifa Descartada**.
- Las Chances que se ponen mientras la rifa no llega al 100 % quedan **retenidas y bloqueadas**: no se gastan y **no se pueden retirar**. Si la rifa se descarta, vuelven todas; si llega al 100 %, se convierten en **opciones de ganar** y quedan asociadas a la rifa para siempre.
- Una **Rifa Confirmada** sigue abierta un tiempo para que más personas se unan, con **tiempo extra**: si faltan 5 minutos o menos, cada 5 personas distintas que pongan Chances suman 5 minutos. Al agotarse el tiempo pasa a **Rifa Cerrada**.
- **Una Rifa Confirmada siempre se rifa.** Si el producto cambió de precio o ya no existe, se entrega uno equivalente de igual o mayor valor. Solo se cancela por fuerza mayor legal, con reembolso total.
- Después de cerrar, el equipo **valida** que todo esté en orden, anuncia la fecha, **se rifa en vivo** (Rifa Realizada), **compra** el premio a nombre del ganador fuera de la web y lo **entrega** (Premio Entregado).
- Cada rifa tiene un **enlace público compartible**: cualquiera puede verla sin iniciar sesión; el login se pide recién al momento de poner puntos.

### Fases de negocio

| Fase | Quién crea las rifas |
|------|----------------------|
| **Fase 1** | Solo los administradores. |
| **Fase 2** | Cualquier participante o **creador de contenido** puede proponer una rifa (link del producto, foto, precio). La propuesta nace **privada, solo accesible por su enlace**, y su autor debe juntar un apoyo mínimo real (puntos puestos) antes de que la rifa aparezca en el listado público. |

El motor de rifas es **el mismo** en ambas fases; la Fase 2 solo agrega la etapa privada de captación (**Rifa Sugerida**) y la moderación.

> **Por qué la etapa privada:** si cualquiera pudiera publicar rifas directamente en el listado, se llenaría de miles de rifas que nunca se arman. Exigir que el autor junte primero un apoyo mínimo con su propia comunidad filtra las propuestas sin tracción y premia a quien tiene audiencia (por eso los creadores de contenido tienen ventaja).

---

## 2. Estado actual del repositorio

Ya existen en el repositorio, como mockup (solo interfaz, sin lógica):

| Pantalla | Estado | Rol en el proyecto |
|----------|--------|--------------------|
| Página de inicio (`index.html`) | ✅ Mockup construido | **Referencia visual principal** |
| Inicio de sesión (`iniciar-sesion.html`) | ✅ Mockup construido | Referencia de formularios |
| Creación de cuenta (`crear-cuenta.html`) | ✅ Mockup construido | Referencia de formularios multi-campo |

Stack actual: **HTML, CSS y JavaScript estáticos**, sin framework.

> **Regla de oro:** estas tres pantallas son la **fuente de verdad visual** del proyecto. Todo mockup nuevo debe verse como si lo hubiera diseñado la misma persona, el mismo día.

### Archivos para trabajar con Claude Code

| Archivo | Para qué sirve |
|---------|----------------|
| `CLAUDE.md` | Reglas del proyecto. Claude Code lo carga solo en cada sesión. |
| `README.md` | Este documento: especificación funcional completa (qué se construye y cómo funciona). |
| `PROMPT-FASE0.md` | Plan paso a paso para que Claude Code construya todos los mockups conectados. |
| `docs/PROGRESO.md` | Bitácora compartida del equipo: paso actual, hecho, pendiente y decisiones. Se lee al empezar y se actualiza al terminar cada paso. |
| `docs/diagramas/` | Diagramas en Mermaid (ciclo de vida, opciones y transparencia, billetera, recorrido, mapa de pantallas, arquitectura). Índice y cómo verlos en [`docs/diagramas/README.md`](docs/diagramas/README.md). En VS Code: extensión **Markdown Preview Mermaid Support** (recomendada en `.vscode/extensions.json`) y `Ctrl+Shift+V`. |

Para empezar, en la terminal del proyecto: `claude` y luego
`Lee CLAUDE.md, README.md y PROMPT-FASE0.md. Ejecuta el Paso 0 y espera mi aprobación.`

---

## 3. Cómo trabajamos: tres capas

El proyecto avanza separando **cómo se ve**, **qué significa** y **cómo funciona**. Cada capa se completa sin depender de la siguiente.

```mermaid
flowchart TB
    C1["<b>Capa 1 · Visual</b> — Fase 0, ahora<br/>Mockups navegables con datos falsos, sin backend<br/>Vive en: pantallas + assets/ · datos en assets/js/mocks"]
    C2["<b>Capa 2 · Semántica</b> — en paralelo a la Fase 0<br/>Entidades, estados, acciones y reglas que nunca se rompen<br/>Agnóstica de tecnología · vive en docs/semantica/"]
    C3["<b>Capa 3 · Funcional</b> — Fase 1, después<br/>API, base de datos, pagos y procesos automáticos<br/>Se construye traduciendo la Capa 2 a código · README §9"]
    C1 -- "se apoya en" --> C2
    C2 -- "se traduce a" --> C3
```

**El puente entre capas son los servicios con interfaz.** En la Fase 0, cada pantalla obtiene sus datos de un servicio *mock* que respeta exactamente la misma interfaz que tendrá el servicio real. Cuando llegue la Fase 1, se cambia la implementación del servicio y las pantallas no se tocan.

```mermaid
flowchart LR
    P["Pantalla<br/>assets/js/paginas"] --> S["services/index.js"]
    S --> I["RifasService<br/>(interfaz)"]
    I --> M["Mock<br/>Fase 0 · hoy"]
    I -.-> H["HTTP<br/>Fase 1"]
```

---

## 4. Instrucciones de desarrollo para la Fase 0 (mockups)

> Estas instrucciones aplican a cualquier persona o agente de IA que construya pantallas en esta fase.

### 4.1 Antes de escribir código

1. **Revisa las tres pantallas existentes** (inicio, login, registro) y extrae de ellas:
   - Paleta de colores, tipografías, tamaños y pesos.
   - Espaciados, radios de borde, sombras.
   - Estilo de botones (primario, secundario, deshabilitado), inputs, mensajes de error, tarjetas.
   - Comportamiento responsive (cómo cambian en móvil).
2. **Consolida eso en tokens de diseño** (`src/styles/tokens`) si aún no existen. Ninguna pantalla nueva usa colores ni medidas "sueltas"; todo sale de los tokens.
3. **Extrae a `components/ui`** los elementos repetidos que ya existan en las pantallas actuales (botón, input, tarjeta, header, footer) antes de crear pantallas nuevas. No dupliques.
4. **Mantén el stack ya usado en el repositorio.** No cambies de framework, librería de estilos ni gestor de paquetes. Si algo falta (por ejemplo, un router), propón la alternativa en un PR aparte.

### 4.2 Qué SÍ se hace en la Fase 0

- Pantallas completas, navegables entre sí, con **datos falsos tipados** desde `src/mocks`.
- Todos los **estados visuales** de cada pantalla: cargando, vacío, error, éxito y los estados de negocio (por ejemplo, una rifa en cada uno de sus estados).
- Interacciones simuladas: un botón "Comprometer 5 opciones" actualiza el saldo mostrado **en memoria** y muestra el mensaje de éxito.
- Diseño **mobile-first** y accesible (contraste, `label` en inputs, foco visible, navegación con teclado).
- Textos en español de Perú, con el vocabulario del glosario (sección 7.1).

### 4.3 Qué NO se hace en la Fase 0

- No hay backend, base de datos, autenticación real ni pagos reales.
- No se llama a ninguna API externa (RENIEC, pasarelas, Random.org).
- No se escribe lógica de negocio dentro de componentes visuales: si una regla aparece (por ejemplo, "no se puede comprometer más del saldo disponible"), se implementa en el **servicio mock** y se documenta en `docs/semantica`.

### 4.4 Definición de "terminado" para una pantalla mockup

- [ ] Coincide visualmente con las pantallas de referencia (usa tokens y `components/ui`).
- [ ] Funciona en 360 px, 768 px y 1280 px de ancho.
- [ ] Muestra todos sus estados (ver inventario, sección 6).
- [ ] Consume datos solo a través de un servicio (`services/`), nunca importando el mock directamente en el componente.
- [ ] Los tipos de datos usados están en `src/domain` y coinciden con la semántica (sección 7).
- [ ] Tiene captura de pantalla (móvil y escritorio) en el PR.

---

## 5. Estructura del repositorio

Estructura propuesta. Las carpetas marcadas con *(Fase 1)* se crean cuando empiece la implementación funcional.

```
/
├── README.md                     ← este documento
├── CLAUDE.md                     ← reglas para Claude Code
├── PROMPT-FASE0.md               ← plan de construcción de mockups
├── docs/
│   ├── propuesta.md              ← propuesta de negocio (no técnica)
│   ├── PROGRESO.md               ← bitácora del equipo
│   ├── diagramas/                (Mermaid: flujo de trabajo, ciclo de vida, billetera, recorrido, arquitectura)
│   ├── semantica/                ← CAPA 2: definición abstracta (README.md = índice)
│   │   ├── 00-glosario.md
│   │   ├── 01-identidad.md       (usuario, registro, verificación)
│   │   ├── 02-billetera.md       (saldos, movimientos, invariantes)
│   │   ├── 03-rifas.md           (estados, transiciones, reglas)
│   │   ├── 04-sorteo.md          (snapshot, selección, ganador)
│   │   ├── 05-propuestas.md      (Fase 2: captación privada y moderación)
│   │   └── 06-administracion.md
│   ├── pantallas/
│   │   └── inventario.md         (lista de pantallas, estados, capturas)
│   ├── tecnica/                  ← CAPA 3: se completa en Fase 1
│   │   ├── modelo-datos.md
│   │   ├── contratos-api.md
│   │   └── procesos-automaticos.md
│   ├── legal/
│   │   └── cumplimiento.md
│   └── decisiones/               (ADR: un archivo por decisión importante)
│       └── 0001-billetera-con-ledger.md
│
├── web/                          ← CAPA 1: frontend (mockups ahora, real después)
│   ├── public/
│   └── src/
│       ├── app/ o pages/     rutas (según el framework actual)
│       ├── components/
│       │   ├── ui/           botón, input, tarjeta, modal, badge, barra de progreso
│       │   └── layout/       header, footer, contenedores, menú móvil
│       ├── features/         una carpeta por dominio
│       │   ├── auth/         login, registro, verificación
│       │   ├── billetera/    saldo, recarga, historial
│       │   ├── rifas/        listado, detalle, compromiso, compra
│       │   ├── sorteos/      ganadores, transparencia
│       │   ├── perfil/
│       │   ├── admin/
│       │   └── propuestas/   (Fase 2)
│       ├── domain/           tipos y enums derivados de docs/semantica
│       ├── services/
│       │   ├── interfaces/   contratos (RifasService, BilleteraService…)
│       │   ├── mock/         implementación Fase 0
│       │   └── http/         implementación Fase 1
│       ├── mocks/            datos falsos (JSON / TS)
│       ├── hooks/
│       ├── lib/              utilidades (formato de moneda, fechas)
│       └── styles/
│           └── tokens        colores, tipografía, espaciado
├── api/                          ← CAPA 3: backend (Fase 1)
│
└── .github/
    ├── pull_request_template.md
    └── ISSUE_TEMPLATE/
```

> **Fase 0 (estado actual):** el sitio es HTML, CSS y JavaScript estáticos y vive en la raíz del repositorio, con todo lo compartido en `assets/` (ver "Organización de carpetas" en `CLAUDE.md`).
> **Fase 1:** el frontend se moverá a `web/` y el backend irá en `api/`. Las pantallas no cambian: solo se reemplaza `services/mock` por `services/http`.

> Si el repositorio actual no es un monorepo, `web/src` equivale a la carpeta `src/` existente. No es obligatorio mover lo que ya está construido: basta con que lo nuevo siga esta organización y lo existente se migre gradualmente.

---

## 6. Inventario de pantallas a maquetar

**Prioridad:** P1 = necesaria para demostrar el flujo completo · P2 = complementaria · P3 = Fase 2.

> Lo que ya está construido, con sus rutas reales, acceso y estados: [`docs/pantallas/inventario.md`](docs/pantallas/inventario.md).

### Públicas

| # | Pantalla | Ruta sugerida | Estados a mostrar | Prioridad |
|---|----------|---------------|-------------------|-----------|
| 1 | Inicio | `/` | ✅ existe | — |
| 2 | Listado de rifas | `/rifas` | Con resultados · vacío · filtro por estado · filtro por categoría | P1 |
| 3 | Detalle público de rifa (enlace compartible) | `/r/[slug]` | Una variante por estado (§7.4) · visitante sin sesión · botón "Comprar opciones" que lleva a login/registro y **regresa a la misma rifa** · botón compartir | P1 |
| 4 | Ganadores | `/ganadores` | Lista · vacío | P2 (hecha) |
| 5 | Cómo funciona | `/como-funciona` | Explicación paso a paso de Chances, estados de la rifa y cómo se elige al ganador | P1 |
| 6 | Preguntas frecuentes | `/preguntas-frecuentes` | Acordeón | P2 (hecha) |
| 7 | Términos, privacidad, reglamento | `/legal/*` | Texto largo | P2 (hecha) |
| 8 | Libro de Reclamaciones | `/libro-de-reclamaciones` | Formulario · enviado | P2 (hecha) |

### Autenticación

| # | Pantalla | Ruta sugerida | Estados | Prioridad |
|---|----------|---------------|---------|-----------|
| 9 | Inicio de sesión | `/login` | ✅ existe · agregar estado de error | — |
| 10 | Crear cuenta | `/registro` | ✅ existe · agregar errores por campo, DNI ya registrado, menor de edad | — |
| 11 | Verificar correo / celular | `/verificar` | Ingresar código · código incorrecto · reenviar | P1 |
| 12 | Recuperar contraseña | `/recuperar` | Solicitar · enlace enviado · nueva contraseña | P2 (hecha) |

### Usuario (con sesión)

| # | Pantalla | Ruta sugerida | Estados | Prioridad |
|---|----------|---------------|---------|-----------|
| 13 | Mi billetera | `/billetera` | Saldo disponible + retenido (con detalle de en qué rifas está retenido) · sin movimientos | P1 |
| 13b | Mi historial de puntos | `/billetera/historial` | Lista de movimientos (recargas, puntos puestos, liberados, usados, reembolsos) · filtro por rifa y tipo · vacío | P1 |
| 14 | Recargar Chances | `/billetera/recargar` | Atajos 5/10/15/20 o monto libre de 5 a 500 (aviso junto al campo si sale del rango) · medio de pago · procesando · éxito · rechazado | P1 |
| 15 | Comprometer / comprar opciones | Modal desde detalle | Selector de cantidad · saldo insuficiente · confirmación · éxito | P1 |
| 16 | Mis rifas | `/mis-rifas` | Pestañas: Armando · Abiertas · Finalizadas · vacío | P1 |
| 17 | Mis tickets en una rifa | `/mis-rifas/[codigo]` | Opciones con número y código · Chances retenidas · descargar la lista pública (CSV) y verificar mis opciones | P2 (hecha) |
| 18 | Perfil | `/perfil` | Datos (DNI enmascarado) · editar apodo | P2 (hecha) |
| 19 | Proponer rifa | `/crear-rifa` | Formulario: link del producto, foto/referencia, precio según la tienda, categoría · link en revisión · enviado | P3 (hecha) |
| 20 | Mis rifas propuestas | `/mis-propuestas` | Calentando (privada, con enlace para compartir y avance hacia el umbral) · armando (pública) · no se armó · descartada | P3 (hecha) |

### Administración

| # | Pantalla | Ruta sugerida | Estados | Prioridad |
|---|----------|---------------|---------|-----------|
| 21 | Dashboard | `/admin` | Recaudado · retenido total · rifas por estado | P2 (hecha) |
| 22 | Productos | `/admin/productos` | Listado · crear (va a Nueva rifa) · editar título y precio | P2 (hecha) |
| 23 | Rifas | `/admin/rifas` | Listado por estado · crear · publicar · configuración por rifa (§7.9) | P1 |
| 24 | Cola de revisión | `/admin/revision` | Rifas cerradas por revisar · aprobar y anunciar la fecha en que se rifa · cancelar por fuerza mayor | P1 |
| 25 | Rifar (elegir ganador) | `/admin/sorteo/?codigo=` | Snapshot + hash · ejecutar · resultado | P2 (hecha) |
| 25b | Compra y entrega | `/admin/entrega/?codigo=` | Registrar compra (datos y comprobante) · envío · entrega con DNI verificado y evidencia (§7.12) | P2 (hecha) |
| 25c | Categorías | `/admin/categorias` | Listado · crear/editar | P2 (hecha) |
| 26 | Usuarios | `/admin/usuarios` | Listado · detalle · ajuste de saldo con motivo | P2 (hecha) |
| 27 | Moderar propuestas | `/admin/propuestas` | Links en revisión (validar, reemplazar o rechazar) · propuestas que alcanzaron el umbral · aprobar (pasa a pública) · descartar con motivo · denuncias (pendiente de definir) | P3 (hecha, sin denuncias) |

### Componente clave: tarjeta de rifa

Debe existir en `components/` con una variante visual por estado:

```
┌─────────────────────────────────────┐
│  [Foto del producto]                │
│  Consolas · PlayStation 5 Slim      │
│  Precio referencial: S/ 2,200       │
│  🍀 Rifa Armándose · quedan 4 d       │
│  👥 148 personas                    │
│  🟥🟧🟨🟩░░░░░░  65 %                 │
│  Tus Chances aquí: 10 (retenidas)   │
│  [ − ]  5  [ + ]   Poner Chances    │
│  Tus Chances quedan retenidas y     │
│  solo se usan si la rifa se arma.   │
│                       [Compartir ↗] │
│  ID: RF-7K3Q9XM2  (letra pequeña)   │
└─────────────────────────────────────┘
```

Reglas visuales de la tarjeta:
- **Foto del producto:** hasta **Rifa Armándose** se muestra **desenfocada** (token `--blur-fondo`); desde **Rifa Confirmada** en adelante, **nítida**. Las rifas descartadas la siguen mostrando desenfocada. Sin foto, se usa el ícono de la categoría con la misma regla.
- **Rifa Confirmada en Inicio:** la tarjeta agrega la cuenta regresiva (días, horas, min, seg) hasta el cierre, junto a la barra en 100 %. Inicio muestra primero **Rifas confirmadas** (las 3 que se cierran antes) y luego **Rifas armándose**, cada sección con su "Ver más…" hacia `/rifas` filtrado por estado.
- **Título** = nombre del producto obtenido automáticamente del link (ver §7.11).
- **Personas:** se muestra la cantidad de participantes ("148 personas"), **nunca** montos ni puntos reunidos, para no desanimar.
- **Barra de avance del pozo** en porcentaje (0–100 %), con color que pasa de **rojo** (inicio) a **verde** (100 %). Al llegar a 100 % pasa a **Rifa Confirmada**.
- **ID de rifa** alfanumérico visible en letra pequeña debajo de la tarjeta y en el detalle.

| Estado visible | Badge | Estados internos | Acción principal |
|----------------|-------|------------------|------------------|
| Rifa Sugerida *(F2)* | 💡 Rifa Sugerida · 🔒 solo por enlace | `CAPTANDO` | Poner Chances · compartir (no aparece en el portal ni en el buscador) |
| Validando producto *(F2)* | 🔎 Validando producto | `REVISION_LINK`, `PROPUESTA` | — (no recibe Chances nuevas) |
| Rifa Armándose | 🍀 Rifa Armándose | `ARMANDO` | Poner Chances (quedan bloqueadas: no se pueden retirar) |
| Rifa Confirmada | 🟢 Rifa Confirmada | `ABIERTA` | Poner Chances (compra directa de opciones) · tiempo extra (§7.13) |
| Rifa Cerrada | ⏳ Rifa Cerrada · Por rifar / 📅 Rifa Cerrada · se rifa el *fecha* | `CERRADA`, `EN_REVISION`, `PROGRAMADA` | Ver participantes · ver hash |
| Rifa Realizada | 🏆 Rifa Realizada · Ganador: *apodo* | `SORTEADA`, `COMPRANDO`, `EN_CAMINO` | Ver cómo se eligió al ganador (el seguimiento del premio muestra solo fechas) |
| Premio Entregado | ✅ Premio Entregado | `ENTREGADA` | — (muestra la fecha de entrega; la evidencia es interna) |
| Rifa Descartada | ⚫ Rifa Descartada | `NO_SE_ARMO`, `CANCELADA`, `DESCARTADA` | — (Chances devueltas) |

---

## 7. Semántica funcional (definición abstracta)

> Define **qué significa** cada cosa del sistema, sin hablar de tecnología. Es el contrato entre diseño, negocio y desarrollo. El contenido completo vive en [`docs/semantica/`](docs/semantica/README.md), dividido por dominio; **los números de sección (§7.1 … §7.13) se conservan** allí, así que las referencias "README §7.x" del código y los documentos siguen valiendo. Los tipos de `assets/js/domain/` deben reflejar exactamente lo que se define ahí.

| Archivo | Qué define | Secciones |
|---------|------------|-----------|
| [00-glosario.md](docs/semantica/00-glosario.md) | Vocabulario, entidades y las 24 invariantes (reglas que nunca se rompen) | §7.1 · §7.2 · §7.3 |
| [01-identidad.md](docs/semantica/01-identidad.md) | Registro y verificación | acciones y eventos |
| [02-billetera.md](docs/semantica/02-billetera.md) | Saldos, movimientos, ciclo de las Chances, no duplicidad, recargas | §7.7 · §7.10 · parte de §7.9 y §7.13 |
| [03-rifas.md](docs/semantica/03-rifas.md) | Ciclo de vida, estados visibles, tiempo extra, configuración por rifa, producto y link | §7.4 · §7.9 · §7.11 · §7.13 |
| [04-sorteo.md](docs/semantica/04-sorteo.md) | Lista congelada, huella, mezcla y elección del ganador | §7.8 |
| [05-propuestas.md](docs/semantica/05-propuestas.md) | Fase 2: Rifa Sugerida, umbral y moderación | acciones |
| [06-administracion.md](docs/semantica/06-administracion.md) | Revisión, cancelación, compra, envío y entrega del premio | §7.12 · parte de §7.13 |

Las tablas de **acciones** (§7.5) y **eventos** (§7.6) se repartieron: cada archivo tiene las filas de su dominio. El [índice de `docs/semantica/`](docs/semantica/README.md) dice dónde quedó cada sección.

**Lo esencial en una línea por tema:**

- **Moneda:** 1 Chance = S/ 1 = 1 opción de ganar. En el código se llama "punto".
- **Estados visibles** (§7.13): Rifa Sugerida → Validando producto → Rifa Armándose → Rifa Confirmada → Rifa Cerrada (por rifar) → Rifa Realizada → Premio Entregado; o Rifa Descartada. Cada uno agrupa estados internos (§7.4).
- **Chances retenidas:** se ponen en una rifa que se arma y quedan bloqueadas; si la rifa llega al 100 % se vuelven opciones, si se descarta vuelven completas (invariantes 9, 16, 17, 23).
- **Una Rifa Confirmada siempre se rifa:** solo se cancela por fuerza mayor legal, con reembolso total (invariante 24).
- **Lo que el público nunca ve:** margen, meta ni puntos reunidos; solo personas y % de avance (invariante 12).
- **Transparencia:** lista de opciones congelada, huella SHA-256 publicada antes de rifar y semilla verificable (§7.8).
- **Premio:** se compra fuera de la web a nombre del ganador y se entrega al titular del DNI (§7.11, §7.12).

## 8. Datos de ejemplo para los mockups

Los mocks viven en `web/src/mocks/` (en la Fase 0, `assets/js/mocks/`) y deben cubrir **todos los estados**. Ejemplo mínimo:

```ts
// src/domain/rifa.ts
export type EstadoRifa =
  | 'BORRADOR' | 'REVISION_LINK' | 'CAPTANDO' | 'PROPUESTA' | 'ARMANDO' | 'NO_SE_ARMO' | 'ABIERTA' | 'CERRADA'
  | 'EN_REVISION' | 'PROGRAMADA' | 'SORTEADA' | 'COMPRANDO' | 'EN_CAMINO'
  | 'ENTREGADA' | 'CANCELADA' | 'DESCARTADA';

// Vista PÚBLICA de una rifa: nunca incluye el margen
export interface Rifa {
  id: string;
  codigo: string;               // ID visible, ej. 'RF-7K3Q9XM2'
  slug: string;                 // para el enlace /r/[slug]
  categoria: string;
  producto: { nombre: string; imagen: string; precioTienda: number; linkTienda: string };
  estado: EstadoRifa;
  visibilidad: 'LISTADA' | 'SOLO_ENLACE';   // CAPTANDO, REVISION_LINK y PROPUESTA son SOLO_ENLACE
  progreso: number;             // 0 a 100: % de avance del pozo (no revela montos)
  participantes: number;
  opcionesVendidas: number;
  maxOpcionesPorUsuario?: number;
  fechaLimiteArmado?: string;   // ISO 8601
  fechaCierre?: string;
  fechaSorteo?: string;
  ganadorApodo?: string;
}

// src/domain/billetera.ts
export interface Billetera { disponible: number; retenido: number }
```

```ts
// src/mocks/rifas.ts
import type { Rifa } from '@/domain/rifa';

const p = (nombre: string, img: string, precio: number) =>
  ({ nombre, imagen: `/mock/${img}.webp`, precioTienda: precio, linkTienda: 'https://tienda.example/producto' });

export const rifasMock: Rifa[] = [
  { id: 'r1', codigo: 'RF-7K3Q9XM2', slug: 'ps5-slim', categoria: 'Consolas', producto: p('PlayStation 5 Slim', 'ps5', 2200),
    estado: 'ARMANDO', visibilidad: 'LISTADA', progreso: 65, participantes: 148, opcionesVendidas: 0,
    maxOpcionesPorUsuario: 594, fechaLimiteArmado: '2026-10-29T23:59:00-05:00' },
  { id: 'r2', codigo: 'RF-4TW8N6PA', slug: 'tv-55', categoria: 'TVs', producto: p('Smart TV 55"', 'tv', 1599),
    estado: 'ABIERTA', visibilidad: 'LISTADA', progreso: 100, participantes: 312, opcionesVendidas: 2015,
    fechaCierre: '2026-11-02T20:00:00-05:00' },
  { id: 'r3', codigo: 'RF-9HC2V5LD', slug: 'iphone-16', categoria: 'Celulares', producto: p('iPhone 16', 'iphone', 3799),
    estado: 'PROGRAMADA', visibilidad: 'LISTADA', progreso: 100, participantes: 540, opcionesVendidas: 4620,
    fechaSorteo: '2026-11-05T20:30:00-05:00' },
  { id: 'r4', codigo: 'RF-3MZ7Q8RB', slug: 'zapatillas-running', categoria: 'Zapatillas', producto: p('Zapatillas running', 'zapas', 599),
    estado: 'SORTEADA', visibilidad: 'LISTADA', progreso: 100, participantes: 96, opcionesVendidas: 780,
    ganadorApodo: 'lucho_23' },
  { id: 'r5', codigo: 'RF-6YF4K2TE', slug: 'reloj-smart', categoria: 'Relojes', producto: p('Smartwatch', 'reloj', 899),
    estado: 'NO_SE_ARMO', visibilidad: 'LISTADA', progreso: 41, participantes: 37, opcionesVendidas: 0 },
  { id: 'r6', codigo: 'RF-8PX5D3HN', slug: 'zapas-edicion-creador', categoria: 'Zapatillas', producto: p('Zapatillas edición limitada', 'zapas2', 899),
    estado: 'CAPTANDO', visibilidad: 'SOLO_ENLACE', progreso: 12, participantes: 9, opcionesVendidas: 0,
    fechaLimiteArmado: '2026-10-28T23:59:00-05:00' },
];

// Saldo + detalle de dónde están retenidos los puntos
export const billeteraMock = {
  disponible: 35,
  retenido: 10,
  retenidoPorRifa: [{ rifaId: 'r1', puntos: 10 }],
};
export const paquetesRecargaMock = [
  { id: 'p5', precio: 5, puntos: 5 }, { id: 'p10', precio: 10, puntos: 10 },
  { id: 'p15', precio: 15, puntos: 15 }, { id: 'p20', precio: 20, puntos: 20 },
];
```

```ts
// src/services/interfaces/RifasService.ts
export interface RifasService {
  listar(filtro?: { estados?: EstadoRifa[] }): Promise<Rifa[]>;
  obtener(id: string): Promise<Rifa>;
  obtenerPorSlug(slug: string): Promise<Rifa>;   // vista pública, sin sesión
  // claveIdempotencia: generada al abrir la confirmación; repetirla no descuenta dos veces
  comprometer(rifaId: string, opciones: number, claveIdempotencia: string): Promise<Comprobante>;
  comprar(rifaId: string, opciones: number, claveIdempotencia: string): Promise<Comprobante>;
  proponer(datos: NuevaPropuesta): Promise<Rifa>;   // Fase 2: nace en CAPTANDO
}

// src/services/interfaces/BilleteraService.ts
export interface BilleteraService {
  obtener(): Promise<Billetera & { retenidoPorRifa: { rifaId: string; puntos: number }[] }>;
  historial(filtro?: { rifaId?: string; tipo?: TipoMovimiento }): Promise<Movimiento[]>;
  recargar(paqueteId: string): Promise<void>;
}
```

> La implementación mock aplica las mismas reglas de la sección 7.5 (por ejemplo, rechaza un compromiso mayor al saldo disponible) para que los mockups muestren los errores reales que verá el usuario.

---

## 9. Referencia técnica para la fase funcional

> Propuesta para la Fase 1. No se implementa todavía; sirve para que los mockups y los tipos ya apunten en la dirección correcta. El detalle irá en `docs/tecnica/`.

### 9.1 Stack recomendado

| Capa | Recomendado | Alternativa |
|------|-------------|-------------|
| Frontend | Mantener el del repositorio (sugerido: Next.js + Tailwind) | — |
| Backend | NestJS (TypeScript) | Laravel (PHP) |
| Base de datos | PostgreSQL | MySQL 8 |
| Jobs / colas | Redis + BullMQ | Laravel Queues |
| Pagos | Culqi (tarjeta), Mercado Pago o PayU (Yape) | Niubiz, Izipay |
| Facturación | Nubefact u otro OSE autorizado por SUNAT | — |
| Validación de DNI | API RENIEC vía proveedor autorizado | Revisión manual |
| Email / WhatsApp | Resend o Amazon SES · WhatsApp Business API | Brevo |
| Archivos | Cloudflare R2 o S3 | Azure Blob |
| Monitoreo | Sentry | — |

### 9.2 Modelo de datos (resumen)

```mermaid
erDiagram
    users ||--|| wallets : "tiene"
    wallets ||--o{ wallet_movements : "ledger inmutable"
    users ||--o{ payments : "paga"
    payments ||--|| invoices : "comprobante"
    products ||--o{ raffles : "se rifa en"
    raffles ||--o{ pledges : "compromisos (Chances retenidas)"
    raffles ||--o{ tickets : "opciones (número + código)"
    users ||--o{ pledges : "pone"
    users ||--o{ tickets : "es dueño"
    raffles ||--o| draws : "sorteo"
    draws ||--|| winners : "ganador"
    raffles ||--o{ raffle_status_history : "historial de estados"
    raffles ||--o| author_links : "código de atribución (Fase 2)"
```

Además: `idempotency_keys` (operación, usuario, resultado) · `complaints` (Libro de Reclamaciones) · `audit_logs` · `terms_acceptances` · `recharge_packages`.

Puntos técnicos obligatorios:
- Toda operación de billetera dentro de una transacción con bloqueo de fila (`SELECT … FOR UPDATE`).
- Restricciones `CHECK (disponible >= 0)` y `CHECK (retenido >= 0)`.
- Webhooks de pago idempotentes (referencia de la pasarela como clave única).
- La aprobación de una rifa captura **todos** los compromisos en una sola transacción.

### 9.3 Endpoints principales

| Método | Ruta | Acción semántica (§7.5) |
|--------|------|-------------------------|
| POST | `/auth/register` · `/auth/login` · `/auth/verify` | Registrarse · iniciar sesión · verificar contacto |
| GET | `/wallet` · `/wallet/movements` | Ver billetera |
| POST | `/recharges` · `/webhooks/{pasarela}` | Recargar puntos |
| GET | `/raffles` · `/raffles/{id}` | Listar / ver rifas |
| POST | `/raffles/{id}/pledges` (cabecera `Idempotency-Key`) | Poner puntos |
| POST | `/raffles/{id}/tickets` (cabecera `Idempotency-Key`) | Comprar opciones |
| POST | `/admin/raffles` · `/admin/raffles/{id}/publish` | Crear · publicar rifa |
| GET | `/r/{slug}` | Ver rifa por enlace (incluye no listadas) |
| POST | `/admin/raffles/{id}/review/approve` · `/review/cancel` | Aprobar revisión y anunciar la fecha · cancelar por fuerza mayor (reembolso) |
| POST | `/admin/raffles/{id}/close` · `/draw` · `/deliver` | Cerrar · rifar (elegir ganador) · registrar entrega |
| POST | `/admin/wallets/{userId}/adjust` | Ajustar saldo |
| POST | `/proposals` · `/admin/proposals/{id}/approve` · `/reject` | Proponer rifa · moderar propuesta (F2) |

### 9.4 Procesos automáticos

| Proceso | Frecuencia | Acción |
|---------|------------|--------|
| Declarar no armadas | Cada 5 min | ARMANDO o CAPTANDO con ventana vencida → NO_SE_ARMO + liberación |
| Pasar a moderación | Cada 5 min | CAPTANDO con umbral alcanzado → PROPUESTA + aviso a admins |
| Cerrar rifas abiertas | Cada 1 min | ABIERTA con tiempo vencido (incluido el tiempo extra) → CERRADA + snapshot → EN_REVISION |
| Tiempo extra | En cada compra | Rifa ABIERTA a 5 min o menos del cierre: cada 5 personas distintas → cierre + 5 min (§7.13) |
| Alerta de revisión | Cada hora | Aviso si una rifa lleva más de 48 h en revisión |
| Alerta de entrega | Diario | Aviso si una rifa lleva demasiado tiempo en COMPRANDO o EN_CAMINO |
| Recordatorios | Diario | "A tu rifa le faltan X opciones", "quedan 24 h" |
| Plazo del ganador | Cada hora | Sin respuesta en 72 h → regla de suplente |
| Conciliar billeteras | Diario | Saldo = suma de movimientos; alerta si difiere |
| Conciliar pagos | Diario | Revisar pagos pendientes con la pasarela |

### 9.5 Seguridad

- Contraseñas con Argon2 o bcrypt; 2FA obligatorio para administradores.
- Nunca se guardan datos de tarjeta, solo tokens de la pasarela.
- Verificación de firma en todos los webhooks y límite de peticiones en login, códigos, recargas y compras.
- Documento y datos personales cifrados en reposo; el público solo ve apodos.
- Toda acción administrativa crítica queda en auditoría.

---

## 10. Cumplimiento legal

> ⚠️ Un modelo donde se paga para obtener opciones en una rifa es, muy probablemente, una actividad regulada en Perú. **Validar con un abogado antes de lanzar.** Esta sección lista lo que hay que revisar; no es asesoría legal.

- Autorización de rifas/sorteos ante el **Ministerio del Interior** y/o encuadre bajo la normativa de juegos de azar (**MINCETUR**); determinar si se requiere permiso por cada rifa.
- Empresa constituida, RUC y comprobante electrónico por cada recarga.
- Tratamiento tributario de los puntos (¿ingreso al recargar o al consumir?) y de los premios.
- **Ley 29733** de Protección de Datos Personales: registro del banco de datos, política de privacidad, derechos ARCO.
- **Código de Protección al Consumidor:** Libro de Reclamaciones virtual, términos claros, política de puntos (no retirables, vencimiento, devolución si la rifa se cancela).
- Mayoría de edad obligatoria y mensajes de juego responsable (límites de recarga configurables).
- Constatación notarial de cada rifa realizada.
- Términos y Reglamento deben decir que se entrega **el premio rifado o uno equivalente de igual o mayor valor**, no necesariamente el producto exacto del link original.
- Prevención de lavado de activos: límites de recarga y monitoreo de patrones inusuales.

---

## 11. Roadmap

### Fase 0 — Mockups y semántica ⬅️ **estamos aquí**
- [x] Mockup de inicio
- [x] Mockup de inicio de sesión
- [x] Mockup de creación de cuenta
- [x] Tokens de diseño y `components/ui` extraídos de las pantallas existentes
- [x] Tipos de dominio (`src/domain`) y servicios mock (`src/services/mock`)
- [x] Mockups P1 del inventario (sección 6)
- [x] Mockups P2 del inventario
- [ ] Documentos de `docs/semantica/` completos y revisados por negocio
- [ ] Demo navegable del flujo completo: registro → recarga → comprometer → rifa abierta → ganador

### Fase 1 — Funcional (MVP)
- [ ] Backend, base de datos y autenticación real
- [ ] Billetera con ledger y recargas con una pasarela
- [ ] Motor de estados de rifas con compromisos, captura y liberación
- [ ] Compra directa, tiempo extra, cierre y elección verificable del ganador
- [ ] Boletas electrónicas, Libro de Reclamaciones, legales
- [ ] Panel de administración y auditoría
- [ ] Reemplazar servicios mock por servicios HTTP

### Fase 2 — Comunidad
- [ ] Propuestas de rifas con etapa privada (Rifa Sugerida), umbral de visibilidad y moderación
- [ ] Enlaces de autor con atribución para creadores de contenido
- [ ] Notificaciones de progreso
- [ ] Segundo medio de pago (Yape)

### Fase 3 — Escala
- [ ] App móvil o PWA, transmisión en vivo de las rifas, referidos, reportes avanzados

---

## 12. Convenciones del equipo

**Flujo de trabajo en equipo** (dos personas, cada una con su propio Claude Code). Diagrama: [`docs/diagramas/flujo-de-trabajo.md`](docs/diagramas/flujo-de-trabajo.md).

- **Antes de empezar:** `git pull` y leer [`docs/PROGRESO.md`](docs/PROGRESO.md).
- **`main` protegida:** siempre desplegable; solo cambia por **Pull Request revisado por la otra persona**.
- **Una rama por paso** o grupo de pantallas, creada desde `main` actualizado: `feature/paso4-pantallas-p1`, `feature/paso5-pantallas-p2`, … También `fix/<descripcion>` y `docs/<tema>`.
- **Una sola persona por rama a la vez.** El traspaso es: commit + push + `docs/PROGRESO.md` actualizado.
- **Nunca force push.**
- Al terminar un paso: `docs/PROGRESO.md` actualizado en el mismo commit, pruebas de `dev/pruebas/` en verde y push.

**Commits** — [Conventional Commits](https://www.conventionalcommits.org/es/):
```
feat(rifas): mockup de detalle de rifa en estado ARMANDO
fix(registro): validación visual de DNI de 8 dígitos
docs(semantica): estados y transiciones de rifa
```

**Pull requests**
- Uno por paso o por grupo de pantallas, con la plantilla [`.github/pull_request_template.md`](.github/pull_request_template.md).
- Incluir capturas en móvil y escritorio.
- Pruebas de `dev/pruebas/` en verde.
- Lo revisa y lo fusiona la otra persona, nunca quien lo abrió.
- Enlazar la sección del inventario o de la semántica que implementa.
- Si el PR introduce una regla de negocio nueva, debe actualizar también `docs/semantica/`.

**Decisiones de arquitectura (ADR)**
- Toda decisión importante se registra en `docs/decisiones/NNNN-titulo.md` con: contexto, decisión, alternativas consideradas y consecuencias.

**Idioma**
- Interfaz y documentación en español.
- Código: nombres de dominio en español (`Rifa`, `Billetera`, `comprometer`) para que coincidan con la semántica; términos técnicos genéricos en inglés (`service`, `hook`, `utils`).

---

## 13. Decisiones pendientes

| # | Pregunta | Recomendación |
|---|----------|---------------|
| 1 | ~~¿Se aceptan compromisos durante EN_REVISIÓN?~~ | **Resuelto:** la revisión es después del cierre; ya no aplica |
| 2 | ~~¿El retiro de puntos en armado tiene algún límite?~~ | **Resuelto:** no hay retiro. Las Chances quedan bloqueadas hasta que la rifa se confirma o se descarta (invariante 23) |
| 3 | ~~¿La meta es el precio exacto o precio + margen?~~ | **Resuelto:** precio + margen interno, no visible |
| 4 | ¿Los puntos son retirables a dinero? | No |
| 5 | ¿Los puntos vencen? | Sí, tras 12 meses sin actividad, con aviso previo |
| 6 | ~~¿Cuánto dura una rifa abierta?~~ | **Resuelto:** configurable por rifa, por defecto 3 días (§7.9) |
| 7 | ¿Tope de opciones por participante por rifa? | Sí, por ejemplo 20 % de la meta |
| 8 | ¿Qué pasa con lo recaudado por encima de la meta? | Definir: margen de la plataforma, fondo para próximas rifas o premio adicional |
| 9 | ¿Plazo para que el ganador reclame? | 72 h para responder, 30 días para recoger |
| 10 | ~~¿Nombre comercial definitivo?~~ | **Resuelto:** DaleChance (el repositorio sigue llamándose Rifas-project) |
| 11 | Al cubrirse la meta, ¿la rifa se confirma sola o pasa antes por una verificación rápida del admin (que el producto siga disponible al mismo precio)? | Se confirma sola; la verificación de precio se hace en la revisión posterior al cierre |
| 12 | ~~¿Qué ve el público del avance?~~ | **Resuelto:** cantidad de personas + barra de avance en % (rojo → verde); nunca montos |
| 13 | ~~¿Qué "mínimo" debe pasar una propuesta antes de ser pública?~~ | **Resuelto:** 20 % de la meta total (precio + 35 % de margen), medido en puntos |
| 14 | Si la meta se cubre antes de los 7 días, ¿se confirma en ese momento o espera al final de la ventana? | En ese momento |
| 15 | ¿Los creadores reciben algo por las rifas que traen (comisión, puntos)? | Medir desde el inicio con el código de autor; definir beneficio después |
| 16 | ~~¿Qué pasa si el producto subió de precio o ya no existe?~~ | **Resuelto:** la plataforma garantiza la entrega de un premio equivalente o de mayor valor (§7.11); no está obligada al producto exacto del link |
| 17 | ¿El ganador puede elegir recibir el valor en lugar del producto? | No (simplifica lo legal y lo operativo) |
| 18 | ¿Una propuesta en etapa privada se modera antes de recibir puntos o solo al alcanzar el umbral? | Filtro automático al crearla + moderación humana al alcanzar el umbral (los puntos solo están retenidos, el riesgo es bajo) |
| 19 | ¿Se permite buscar una propuesta privada por su nombre exacto o código? | No en el buscador general; solo por enlace o código que comparte su autor |
| 20 | ¿Cómo se distingue a un "creador verificado" de un participante normal? | Verificación manual por admin (redes sociales, audiencia); le da más propuestas activas y una insignia |
| 21 | ~~Si el autor de una propuesta retira sus propios puntos, ¿la propuesta se cae?~~ | **Resuelto:** no aplica; nadie puede retirar Chances (invariante 23) |
| 22 | ~~¿El umbral exige además un mínimo de participantes?~~ | **Resuelto:** sí, 10 participantes, para que una sola persona con mucho saldo no lo cubra |
| 23 | ¿Límite diario de recarga por usuario? | S/ 500 al día por usuario, por prevención de lavado de activos (§10) |
