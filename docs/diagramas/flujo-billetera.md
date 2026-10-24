# Flujo de la billetera

Dónde está cada Chance en todo momento (README §7.7 y §7.10). Cada flecha es un **movimiento** inmutable del historial; el saldo siempre es la suma de los movimientos.

```mermaid
flowchart LR
    PAGO(["Pago aprobado<br/>atajo 5/10/15/20 o monto libre 5–500"])
    D["Disponible"]
    R["Retenido<br/>en una rifa que se está armando"]
    C["Consumido<br/>opciones / tickets"]
    FUERA(["Fuera de la billetera"])

    PAGO -- "RECARGA +N" --> D
    D -- "RETENCION<br/>poner Chances" --> R
    R -- "LIBERACION<br/>no se armó · descartada · cancelada antes de confirmarse" --> D
    R -- "CAPTURA<br/>la rifa se armó" --> C
    D -- "COMPRA_DIRECTA<br/>rifa abierta" --> C
    C -- "REEMBOLSO<br/>solo fuerza mayor legal" --> D
    D -- "AJUSTE ±N<br/>admin, con motivo" --> D
    D -- "VENCIMIENTO<br/>si se aplica" --> FUERA
```

## Reglas que nunca se rompen

- Disponible y retenido **nunca** son negativos.
- Una Chance está en **un solo lugar** a la vez: disponible, retenida en una rifa o consumida en una rifa.
- Retenido = suma de los compromisos activos.
- Poner Chances o comprar lleva una **clave de idempotencia**: si la operación llega dos veces, se aplica una sola vez.
- Las Chances retenidas **no se pueden retirar**: vuelven solo si la rifa no se arma o se descarta.
- Una vez confirmada, la rifa **siempre se rifa**: las Chances quedan como opciones de ganar (solo hay reembolso por fuerza mayor legal).

## Ejemplo: Lucía (datos de demo)

```mermaid
flowchart TD
    A["Recargas: 20 + 20 + 15 = 55"] --> B["Ajuste +2 y vencimiento −2"]
    B --> C["Xbox: compra 5 → cancelada → reembolso 5"]
    C --> D["Smartwatch: retiene 5 → no se armó → liberación 5"]
    D --> E["TV: retiene 8 → se armó → captura 8 · compra 2 más"]
    E --> F["PS5: retiene 10"]
    F --> G["Saldo final: 35 disponibles · 10 retenidas en la PS5"]
```
