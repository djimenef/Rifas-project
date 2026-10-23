# Arquitectura

Las pantallas nunca saben de dónde vienen los datos: siempre pasan por los servicios. En la Fase 0 los servicios son simulados (mock); en la Fase 1 se reemplazan por servicios que llaman a la API, sin tocar las pantallas (README §3).

```mermaid
flowchart TB
    subgraph PANTALLAS["Pantallas (HTML + assets/js/paginas)"]
        P1["Inicio, login, registro"]
        P2["Rifas, detalle, billetera…"]
        P3["Panel de administración"]
    end

    L["layout.js<br/>sesión · protección de rutas · header/footer · panel de demo"]
    C["components/<br/>badge · barra de avance · modal · tabs · estados · toast"]
    S["services/index.js<br/>único punto de acceso"]
    I["services/interfaces<br/>auth · billetera · rifas · admin"]
    D["domain/<br/>tipos y reglas puras"]

    subgraph FASE0["Fase 0 · hoy"]
        M["services/mock<br/>motor.js = reglas de negocio"]
        DB["db.js<br/>localStorage · latencia · operaciones atómicas"]
        MK["mocks/<br/>datos de ejemplo"]
    end

    subgraph FASE1["Fase 1 · después"]
        H["services/http"]
        API["api/<br/>NestJS o Laravel"]
        BD[("PostgreSQL<br/>ledger de movimientos")]
        EXT["Pasarela de pago · RENIEC · correo/WhatsApp"]
    end

    PANTALLAS --> L
    PANTALLAS --> C
    PANTALLAS --> S
    S -. "cumple" .-> I
    S --> M
    M --> D
    M --> DB
    DB --> MK
    S -. "Fase 1: se cambia la implementación" .-> H
    H --> API
    API --> BD
    API --> EXT
```

## Capas

| Capa | Qué es | Dónde vive |
|------|--------|------------|
| Visual | Cómo se ve: pantallas y componentes, con datos falsos | `assets/`, carpetas de cada pantalla (en Fase 1: `web/`) |
| Semántica | Qué significa: entidades, estados, acciones y reglas | README §7 y `docs/semantica/` |
| Funcional | Cómo funciona de verdad: API, base de datos, pagos | `api/` (Fase 1) |
