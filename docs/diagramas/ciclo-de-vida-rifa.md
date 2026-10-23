# Ciclo de vida de una rifa

Máquina de estados del README §7.4, con los nombres visibles actuales. Entre paréntesis, el estado interno.

```mermaid
stateDiagram-v2
    direction TB

    state "Borrador (BORRADOR)" as BORRADOR
    state "Link en revisión (REVISION_LINK)" as REVISION_LINK
    state "Calentando Rifa · solo por enlace (CAPTANDO)" as CAPTANDO
    state "En moderación (PROPUESTA)" as PROPUESTA
    state "Armando Rifa (ARMANDO)" as ARMANDO
    state "No se armó la Rifa (NO_SE_ARMO)" as NO_SE_ARMO
    state "¡Va! Rifa confirmada (ABIERTA)" as ABIERTA
    state "Cerrada (CERRADA)" as CERRADA
    state "En revisión (EN_REVISION)" as EN_REVISION
    state "Sorteo programado (PROGRAMADA)" as PROGRAMADA
    state "Sorteada (SORTEADA)" as SORTEADA
    state "Comprando el premio (COMPRANDO)" as COMPRANDO
    state "En camino (EN_CAMINO)" as EN_CAMINO
    state "Entregada (ENTREGADA)" as ENTREGADA
    state "Cancelada (CANCELADA)" as CANCELADA
    state "Descartada (DESCARTADA)" as DESCARTADA

    [*] --> BORRADOR: Fase 1 · admin crea
    [*] --> CAPTANDO: Fase 2 · propuesta con link confiable
    [*] --> REVISION_LINK: Fase 2 · link no confiable

    REVISION_LINK --> CAPTANDO: admin valida o reemplaza el link
    REVISION_LINK --> DESCARTADA: admin rechaza

    CAPTANDO --> PROPUESTA: umbral alcanzado (20 % de la meta y 10 personas)
    CAPTANDO --> NO_SE_ARMO: venció la ventana de captación
    CAPTANDO --> DESCARTADA: el autor retira sus Chances
    PROPUESTA --> ARMANDO: admin aprueba y fija el margen
    PROPUESTA --> DESCARTADA: admin rechaza

    BORRADOR --> ARMANDO: admin publica

    ARMANDO --> ABIERTA: meta cubierta
    ARMANDO --> NO_SE_ARMO: venció la ventana sin meta
    ARMANDO --> CANCELADA: fuerza mayor

    ABIERTA --> CERRADA: fecha de cierre o tope de tickets
    CERRADA --> EN_REVISION: lista congelada y hash
    EN_REVISION --> PROGRAMADA: revisión aprobada
    EN_REVISION --> CANCELADA: problema detectado
    PROGRAMADA --> SORTEADA: sorteo
    SORTEADA --> COMPRANDO: compra registrada
    COMPRANDO --> EN_CAMINO: envío registrado
    EN_CAMINO --> ENTREGADA: entrega con DNI verificado

    NO_SE_ARMO --> [*]
    DESCARTADA --> [*]
    CANCELADA --> [*]
    ENTREGADA --> [*]
```

## Qué pasa con las Chances en cada estado

| Estado | ¿Acepta Chances? | Efecto en la billetera |
|--------|------------------|------------------------|
| Calentando Rifa / Armando Rifa | Sí, como compromiso | Disponible → Retenido |
| ¡Va! Rifa confirmada | Sí, como compra directa | Retenido → Consumido · Disponible → Consumido |
| No se armó la Rifa / Descartada | No | Retenido → Disponible (liberación) |
| Cancelada | No | Retenido → Disponible y Consumido → Disponible (reembolso) |
| Resto | No | — |

La compra del premio se hace fuera de la web; COMPRANDO, EN_CAMINO y ENTREGADA solo registran cada paso (README §7.12).
