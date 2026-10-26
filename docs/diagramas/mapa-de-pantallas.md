# Mapa de pantallas

Todas las pantallas del sitio y cómo se llega de una a otra. La fuente de verdad de rutas, nombres y accesos es [`assets/js/lib/rutas.js`](../../assets/js/lib/rutas.js); el inventario completo está en el README §6.

**Leyenda:** verde = ya construida · gris punteado = "En construcción" (Pasos 5 y 6).

## 1. Sitio público y cuenta

```mermaid
flowchart LR
    subgraph PUB["Público (sin sesión)"]
        INI["Inicio<br/>/"]
        RIF["Rifas<br/>/rifas · buscar, filtrar, por categoría"]
        DET["Detalle de rifa<br/>/r/?slug="]
        COMO["Cómo funciona"]
        GAN["Ganadores"]
        FAQ["Preguntas frecuentes"]
        LEG["Términos · Privacidad · Reglamento<br/>Libro de Reclamaciones"]
    end

    subgraph AUTH["Cuenta"]
        LOG["Iniciar sesión<br/>iniciar-sesion.html"]
        REG["Crear cuenta<br/>crear-cuenta.html"]
        VER["Verificar cuenta"]
        REC["Recuperar contraseña"]
    end

    subgraph USR["Participante (con sesión)"]
        BIL["Mi billetera"]
        HIS["Mi historial"]
        RCG["Recargar Chances"]
        MIS["Mis rifas<br/>Armando · Abiertas · Finalizadas"]
        TIK["Mis tickets<br/>opciones con número y código · verificar lista"]
        PER["Perfil"]
        PRO["Proponer rifa · Mis propuestas<br/>(Fase 2)"]
    end

    INI -- "Ver más… / Ver rifas" --> RIF
    INI -- "carrusel · tarjeta" --> DET
    RIF --> DET
    INI --> COMO
    INI --> GAN
    INI --> FAQ
    DET -- "Poner Chances (sin sesión)" --> LOG
    LOG <--> REG
    LOG --> REC
    REG --> VER
    VER -- "vuelve con ?volver=" --> DET
    DET -- "saldo insuficiente" --> RCG
    RCG -- "vuelve al modal" --> DET
    BIL --> HIS
    BIL --> RCG
    MIS -- "Ver mis tickets" --> TIK
    DET -- "Ver mis tickets" --> TIK
    TIK -- "Descargar lista (CSV)" --> DET

    classDef hecha fill:#d8f5e6,stroke:#0f7a4b,color:#1a1a1a
    classDef pendiente fill:#f2f2f2,stroke:#9a9a9a,color:#555,stroke-dasharray:4 3
    class INI,RIF,DET,COMO,LOG,REG,VER,BIL,HIS,RCG,MIS,TIK hecha
    class GAN,FAQ,LEG,REC,PER,PRO pendiente
```

## 2. Panel de administración

El menú lateral sigue el orden fijado en `CLAUDE.md`.

```mermaid
flowchart LR
    MENU(["Menú lateral del panel"])
    MENU --> DASH["Dashboard<br/>/admin"]
    MENU --> ARIF["Rifas<br/>listado y detalle por estado"]
    MENU --> AREV["Revisión<br/>aprobar y anunciar la fecha"]
    MENU --> ASOR["Sorteos<br/>rifas por rifar"]
    MENU --> AENT["Compras y entregas"]
    MENU --> APRD["Productos"]
    MENU --> ACAT["Categorías"]
    MENU --> AUSU["Usuarios"]
    MENU --> APRP["Propuestas (Fase 2)"]

    ARIF --> ANUE["Nueva rifa"]
    ARIF -- "Rifa Cerrada" --> AREV
    AREV -- "fecha anunciada" --> ASOR
    ASOR --> AUNO["Rifar (elegir ganador)<br/>?codigo="]
    AUNO -- "Rifa Realizada" --> AENT
    AENT --> AREG["Compra y entrega<br/>?codigo="]

    classDef hecha fill:#d8f5e6,stroke:#0f7a4b,color:#1a1a1a
    classDef pendiente fill:#f2f2f2,stroke:#9a9a9a,color:#555,stroke-dasharray:4 3
    class ARIF,ANUE,AREV hecha
    class DASH,ASOR,AUNO,AENT,AREG,APRD,ACAT,AUSU,APRP pendiente
```
