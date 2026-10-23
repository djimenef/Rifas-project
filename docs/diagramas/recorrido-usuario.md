# Recorrido del usuario

De visitante a ganador, y qué hace el equipo de administración en cada etapa.

```mermaid
sequenceDiagram
    autonumber
    actor V as Visitante / Participante
    participant W as DaleChance (web)
    actor A as Administrador

    A->>W: Crea la rifa (precio referencial + 35 % de margen interno) y la publica
    V->>W: Abre el enlace de una rifa "Armando Rifa"
    W-->>V: Ve foto, precio referencial, personas y % de avance
    V->>W: Toca "Poner Chances"
    W-->>V: Le pide iniciar sesión o crear cuenta y luego vuelve a la misma rifa
    V->>W: Se registra con su DNI (mayor de 18) y verifica su cuenta
    V->>W: Recarga Chances (atajo 5/10/15/20 o monto libre de 5 a 500)
    V->>W: Pone Chances en la rifa
    W-->>V: Sus Chances quedan retenidas (no se gastan)
    alt La rifa junta su meta a tiempo
        W-->>V: ¡La rifa va! Sus Chances se vuelven opciones de ganar
        Note over W: Sigue abierta unos días para comprar más opciones
        W->>W: Cierre: lista de tickets congelada y huella (hash) publicada
        A->>W: Revisa (producto, precio, recaudación, fraude) y programa el sorteo
        A->>W: Ejecuta el sorteo
        W-->>V: Resultado público y verificable
        A->>A: Compra el premio fuera de la web, a nombre del ganador
        A->>W: Registra la compra (comprobante), el envío y la entrega con DNI físico verificado
        W-->>V: Ve "Comprando", "En camino" y "Entregada" con sus fechas
    else No junta la meta
        W-->>V: No se armó la Rifa: sus Chances vuelven completas a la billetera
    end
```

## Responsabilidades por etapa

| Etapa | Participante | Administrador |
|-------|--------------|---------------|
| Antes | — | Crea y publica la rifa (o modera propuestas en la Fase 2) |
| Armando Rifa | Pone Chances, comparte el enlace, puede retirar sus Chances | Monitorea el avance |
| ¡Va! (abierta) | Compra más opciones | — |
| Cerrada / En revisión | Espera | Revisa y programa el sorteo, o cancela con motivo (reembolso) |
| Sorteo | Ve el resultado | Ejecuta el sorteo verificable |
| Compra y entrega | Presenta su DNI físico | Compra fuera de la web y registra compra, envío y entrega |
