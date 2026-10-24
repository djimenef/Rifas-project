# Recorrido del usuario

De visitante a ganador, y qué hace el equipo de administración en cada etapa.

```mermaid
sequenceDiagram
    autonumber
    actor V as Visitante / Participante
    participant W as DaleChance (web)
    actor A as Administrador

    A->>W: Crea la rifa (precio referencial + 35 % de margen interno) y la publica
    V->>W: Abre el enlace de una 🍀 Rifa Armándose
    W-->>V: Ve foto, precio referencial, personas y % de avance
    V->>W: Toca "Poner Chances"
    W-->>V: Le pide iniciar sesión o crear cuenta y luego vuelve a la misma rifa
    V->>W: Se registra con su DNI (mayor de 18) y verifica su cuenta
    V->>W: Recarga Chances (atajo 5/10/15/20 o monto libre de 5 a 500)
    V->>W: Pone Chances en la rifa
    W-->>V: Sus Chances quedan retenidas y bloqueadas (no se pueden retirar)
    alt La rifa llega al 100 % a tiempo
        W-->>V: 🟢 Rifa Confirmada: sus Chances ya son opciones de ganar, para siempre
        Note over W: Sigue abierta un tiempo. Tiempo extra: con 5 min o menos, cada 5 personas suman 5 min
        W->>W: Se agota el tiempo: ⏳ Rifa Cerrada (por rifar), lista congelada y huella publicada
        A->>W: Valida producto, precio y recaudación, y anuncia la fecha en que se rifa
        A->>W: Se rifa en vivo
        W-->>V: 🏆 Rifa Realizada: ganador público y verificable
        A->>A: Compra el premio fuera de la web, a nombre del ganador (si el producto cambió, uno equivalente)
        A->>W: Registra la compra, el envío y la entrega con DNI físico verificado
        W-->>V: ✅ Premio Entregado (con las fechas de cada paso)
    else No llega al 100 % a tiempo
        W-->>V: ⚫ Rifa Descartada: sus Chances vuelven completas a la billetera
    end
```

## Responsabilidades por etapa

| Etapa | Participante | Administrador |
|-------|--------------|---------------|
| Antes | — | Crea y publica la rifa (o valida rifas sugeridas en la Fase 2) |
| 💡 Rifa Sugerida *(Fase 2)* | Quien la sugiere comparte el enlace para juntar el mínimo | Valida el link y el producto |
| 🍀 Rifa Armándose | Pone Chances (quedan bloqueadas hasta que la rifa se confirme o se descarte) y comparte el enlace | Monitorea el avance; puede **cancelar con motivo** |
| 🟢 Rifa Confirmada | Pone más Chances (opciones de ganar); en los últimos 5 minutos su participación puede dar tiempo extra | Solo puede **cancelar por fuerza mayor legal** |
| ⏳ Rifa Cerrada | Espera la fecha en que se rifa | Valida, publica la fecha y la huella de la lista |
| 🏆 Rifa Realizada | Ve el ganador y cómo se eligió | Rifa en vivo; compra el premio fuera de la web |
| ✅ Premio Entregado | El ganador presenta su DNI físico | Registra envío y entrega con evidencia |
