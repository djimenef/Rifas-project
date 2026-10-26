# Opciones, lista pública y elección del ganador

Cómo una Chance se convierte en una opción, cómo se publica la lista sin revelar de quién es cada opción, cómo cada persona verifica las suyas y cómo se elige al ganador. Especificación: README §7.8. Código: [`assets/js/domain/sorteo.js`](../../assets/js/domain/sorteo.js).

## 1. De Chance a opción

```mermaid
flowchart LR
    CH["1 Chance puesta<br/>en una rifa"] -- "la rifa llega al 100 %<br/>(o compra directa en Rifa Confirmada)" --> OP["1 opción"]
    OP --> NUM["Número correlativo<br/>#2152"]
    OP --> COD["Código alfanumérico<br/>BC8T-43KD"]
    SAL[("Sal secreta<br/>de la rifa")] -. "genera" .-> COD
    COD -- "solo lo ve su dueño" --> TIK["Mis tickets"]
```

- 10 Chances = 10 opciones = 10 números y 10 códigos, todos asignados a la misma persona.
- El código usa letras y números sin caracteres confusos (sin 0/O, 1/I/L) y no se puede adivinar.

## 2. Publicación, verificación y elección del ganador

```mermaid
sequenceDiagram
    autonumber
    actor P as Participante
    participant W as DaleChance
    actor T as Cualquier persona
    actor A as Administrador

    P->>W: Pone Chances (la rifa se confirma)
    W-->>P: Cada Chance pasa a ser una opción con número y código
    Note over W: Se agota el tiempo → Rifa Cerrada
    W->>W: Congela la lista: CSV "opcion,codigo" sin datos de quién es cada una
    W->>W: Huella = SHA-256 del CSV, publicada antes de rifar
    T->>W: Descarga la lista (detalle de la rifa)
    T->>T: Calcula la huella del archivo y la compara con la publicada
    P->>W: Mis tickets → "Verificar mis opciones"
    W-->>P: ✅ La huella coincide y sus códigos están en la lista
    A->>W: Rifa en vivo (fecha anunciada)
    W->>W: Semilla aleatoria → mezcla todas las opciones (Fisher–Yates) → elige 1 posición
    W-->>T: Publica semilla, opción ganadora, posición y apodo del ganador
    T->>T: Con la huella y la semilla, repite la mezcla y obtiene el mismo ganador
```

## 3. Cómo se elige al ganador

```mermaid
flowchart TD
    L["Lista congelada<br/>opciones 1…N"] --> H["Huella SHA-256<br/>publicada antes de rifar"]
    H --> S["Semilla aleatoria<br/>(en la Fase 1: fuente verificable)"]
    S --> M["Mezcla al azar (Fisher–Yates)<br/>paso i: SHA-256(semilla : huella : i)"]
    M --> E["Se elige 1 posición<br/>SHA-256(semilla : huella : ganador) mod N"]
    E --> G(["Opción ganadora → su dueño<br/>se publica con su apodo"])
```

## Qué ve cada quien

| Dato | Público | Participante | Administrador |
|------|---------|--------------|---------------|
| Lista de opciones (número y código) | ✅ desde Rifa Cerrada | ✅ | ✅ |
| De quién es cada opción | ❌ | Solo las suyas | ✅ |
| Huella de la lista | ✅ | ✅ | ✅ |
| Semilla, opción ganadora y posición | ✅ al rifar | ✅ | ✅ |
| Apodo del ganador | ✅ al rifar | ✅ | ✅ |
| Sal secreta de la rifa | ❌ | ❌ | ❌ (solo el sistema) |
