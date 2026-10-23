# Flujo de trabajo del equipo

Cómo avanza el proyecto: los pasos de [`PROMPT-FASE0.md`](../../PROMPT-FASE0.md), las ramas, los Pull Requests y el traspaso entre las dos personas del equipo. Las reglas completas están en [`CLAUDE.md`](../../CLAUDE.md) y en el README §12.

## Pipeline de pasos de la Fase 0

```mermaid
flowchart LR
    P0["Paso 0<br/>Reconocimiento"] --> P1["Paso 1<br/>Tokens y componentes"]
    P1 --> P2["Paso 2<br/>Dominio, datos y servicios mock"]
    P2 --> P3["Paso 3<br/>Navegación y layout"]
    P3 --> PR1{{"PR Pasos 0–3<br/>revisión y merge"}}
    PR1 --> P4["Paso 4<br/>Pantallas P1"]
    P4 --> P5["Paso 5<br/>Pantallas P2"]
    P5 --> P6["Paso 6<br/>Pantallas P3 (Fase 2)"]
    P6 --> P7["Paso 7<br/>Documentación semántica"]
    P7 --> P8["Paso 8<br/>Verificación final"]
    P8 --> F1(["Fase 1<br/>MVP funcional"])
```

Cada paso (o grupo de pantallas) va en su propia rama y entra a `main` por un Pull Request.

## Ciclo de una rama

```mermaid
flowchart TD
    A["git pull en main<br/>leer docs/PROGRESO.md"] --> B["Crear rama desde main<br/>feature/pasoN-…"]
    B --> C["Trabajar con Claude Code<br/>un commit por pantalla o grupo"]
    C --> D{"¿Paso terminado?"}
    D -- "No, cambio de turno" --> E["Traspaso:<br/>commit + push + PROGRESO.md"]
    E --> F["La otra persona:<br/>git pull y sigue en la misma rama"]
    F --> C
    D -- "Sí" --> G["Pruebas de dev/pruebas en verde<br/>PROGRESO.md actualizado<br/>push"]
    G --> H["Abrir Pull Request hacia main<br/>con la plantilla"]
    H --> I{"Revisión de la<br/>otra persona"}
    I -- "Pide cambios" --> C
    I -- "Aprueba" --> J["Merge a main"]
    J --> A
```

## Traspaso entre personas

```mermaid
sequenceDiagram
    actor A as Persona A
    participant G as GitHub
    actor B as Persona B
    A->>G: git pull · crea feature/paso4-pantallas-p1
    A->>A: trabaja con su Claude Code
    A->>G: commit + docs/PROGRESO.md + push
    Note over A,B: Una sola persona por rama a la vez
    B->>G: git pull · git switch feature/paso4-pantallas-p1
    B->>B: lee docs/PROGRESO.md y continúa
    B->>G: commit + PROGRESO.md + push
    B->>G: abre Pull Request hacia main
    A->>G: revisa y aprueba
    A->>G: merge a main (nunca force push)
```
