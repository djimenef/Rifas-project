# Ciclo de vida de una rifa

Lo que ve el público (estados visibles), cómo se mueven las Chances, el tiempo extra y las dos formas de cancelar.
La especificación completa está en el README §7.4, §7.5 y §7.13.

## 1. Estados visibles

```mermaid
stateDiagram-v2
    direction TB
    state "💡 Rifa Sugerida" as SUG
    state "🔎 Validando producto" as VAL1
    state "🔎 Validando producto" as VAL2
    state "🍀 Rifa Armándose" as ARM
    state "🟢 Rifa Confirmada" as CONF
    state "⏳ Rifa Cerrada (por rifar)" as CER
    state "🏆 Rifa Realizada" as REA
    state "✅ Premio Entregado" as ENT
    state "⚫ Rifa Descartada" as DES

    [*] --> ARM: Fase 1 · el admin la crea y publica
    [*] --> SUG: Fase 2 · un participante o creador la sugiere
    [*] --> VAL1: Fase 2 · link no confiable
    VAL1 --> SUG: link validado o reemplazado
    SUG --> VAL2: junta el mínimo (20 % y 10 personas)
    VAL2 --> ARM: producto y precio aprobados
    ARM --> CONF: llega al 100 %
    CONF --> CONF: tiempo extra (+5 min cada 5 personas en los últimos 5 min)
    CONF --> CER: se agota el tiempo
    CER --> REA: se rifa y se elige al ganador
    REA --> ENT: se compra y se entrega el premio

    VAL1 --> DES: link rechazado
    SUG --> DES: no junta el mínimo a tiempo o se cancela con motivo
    VAL2 --> DES: propuesta rechazada
    ARM --> DES: no llega al 100 % a tiempo o se cancela con motivo
    CONF --> DES: solo fuerza mayor legal
    CER --> DES: solo fuerza mayor legal

    ENT --> [*]
    DES --> [*]
```

| Estado visible | Qué significa | ¿Recibe Chances? | Qué pasa con las Chances |
|----------------|---------------|------------------|--------------------------|
| 💡 **Rifa Sugerida** *(Fase 2)* | La sugiere un participante o creador; **quien la crea es responsable** de juntar el mínimo. Solo por enlace. | Sí | Quedan retenidas y bloqueadas |
| 🔎 **Validando producto** | El equipo revisa que el link sea confiable, que el producto exista y que el precio sea coherente. | No | Siguen retenidas |
| 🍀 **Rifa Armándose** | Visible en el portal; menos del 100 % de lo que necesita. | Sí | Quedan retenidas y bloqueadas |
| 🟢 **Rifa Confirmada** | Llegó al 100 %. Sigue abierta un tiempo, con tiempo extra al final. | Sí (compra directa) | Son opciones de ganar, para siempre |
| ⏳ **Rifa Cerrada** (por rifar) | Se agotó el tiempo. Lista congelada y huella publicada; se valida y se anuncia la fecha. | No | Son opciones de ganar |
| 🏆 **Rifa Realizada** | Ya se eligió al ganador; se compra y se envía el premio. | No | — |
| ✅ **Premio Entregado** | El premio llegó al titular del DNI ganador. | No | — |
| ⚫ **Rifa Descartada** | No llegó al 100 %, se canceló o la propuesta no pasó la validación. | No | Vuelven todas (o se reembolsan si fue fuerza mayor) |

## 2. Ciclo de las Chances

```mermaid
flowchart LR
    REC(["Recarga<br/>atajo 5/10/15/20 o monto libre 5–500"]) --> DISP["Disponible<br/>en tu billetera"]
    DISP -- "pones Chances en una<br/>Rifa Sugerida o Armándose" --> RET["🔒 Retenida y bloqueada<br/>no se gasta · no se puede retirar"]
    RET -- "la rifa llega al 100 %<br/>(Rifa Confirmada)" --> OPC["🎟️ Opción de ganar<br/>asociada a la rifa para siempre"]
    RET -- "la rifa se descarta<br/>(no llegó al 100 % o se canceló)" --> DISP
    DISP -- "pones Chances en una<br/>Rifa Confirmada" --> OPC
    OPC -- "la rifa siempre se rifa" --> FIN(["Participa en la elección del ganador"])
    OPC -. "solo fuerza mayor legal:<br/>reembolso íntegro" .-> DISP
```

## 3. Tiempo extra al final de una Rifa Confirmada

```mermaid
flowchart TD
    A["Alguien pone Chances en una<br/>🟢 Rifa Confirmada"] --> B{"¿Faltan 5 minutos<br/>o menos?"}
    B -- "No" --> N["Sin cambios en el tiempo"]
    B -- "Sí" --> C["Se cuenta a esa persona<br/>(solo una vez en la ventana)"]
    C --> D{"¿Ya son 5 personas<br/>distintas?"}
    D -- "No" --> N
    D -- "Sí" --> E["+5 minutos al tiempo que quedaba<br/>y el conteo vuelve a 0"]
    E --> A
    T(["Se agota el tiempo"]) --> F["⏳ Rifa Cerrada · por rifar<br/>nadie puede poner más Chances"]
```

*Ejemplo:* faltan 3 minutos y se unen 5 personas → ahora faltan 8 minutos. Las siguientes 5 personas suman otros 5 minutos, y así sucesivamente hasta que el tiempo se agote.

## 4. Cancelar una rifa

```mermaid
flowchart TD
    A{"¿La rifa ya llegó<br/>al 100 %?"}
    A -- "No: Sugerida o Armándose" --> B["<b>Cancelar con motivo</b><br/>motivo obligatorio"]
    B --> C["⚫ Rifa Descartada<br/>todas las Chances retenidas vuelven"]
    A -- "Sí: Confirmada o Cerrada" --> D{"¿Es fuerza mayor legal?"}
    D -- "No: el producto cambió de precio o ya no existe" --> E["No se cancela: se rifa igual y se entrega<br/>un premio equivalente de igual o mayor valor"]
    D -- "Sí" --> F["<b>Cancelar por fuerza mayor</b><br/>marca obligatoria + motivo"]
    F --> G["⚫ Rifa Descartada<br/>reembolso íntegro de Chances y opciones"]
```

## 5. Estados internos

Cada estado interno se muestra al público con su estado visible.

| Estado visible | Estados internos |
|----------------|------------------|
| Rifa Sugerida | `CAPTANDO` |
| Validando producto | `REVISION_LINK`, `PROPUESTA` |
| Rifa Armándose | `ARMANDO` |
| Rifa Confirmada | `ABIERTA` |
| Rifa Cerrada | `CERRADA`, `EN_REVISION`, `PROGRAMADA` |
| Rifa Realizada | `SORTEADA`, `COMPRANDO`, `EN_CAMINO` |
| Premio Entregado | `ENTREGADA` |
| Rifa Descartada | `NO_SE_ARMO`, `CANCELADA`, `DESCARTADA` |
| *(no visible)* | `BORRADOR` |

El diagrama de estados internos, con todas sus transiciones, está en el README §7.4.
