# Glosario, entidades e invariantes

> Parte de la **semántica funcional** (capa 2): [índice](README.md) · [README §7](../../README.md#7-semántica-funcional-definición-abstracta). Los números de sección (§7.x) se conservan del README para que las referencias del código y los documentos sigan valiendo.

Base común de todos los dominios: el vocabulario, las entidades y las reglas que nunca se rompen. Las invariantes conservan su número porque el código y los demás documentos las citan así ("invariante 11").

## 7.1 Glosario

| Término | Significado |
|---------|-------------|
| **Visitante** | Persona sin sesión. Puede ver rifas y su información, pero no poner puntos. |
| **Participante** | Persona mayor de edad registrada con documento de identidad. |
| **Creador** *(Fase 2)* | Participante habilitado para proponer rifas y compartirlas con su comunidad. |
| **Administrador** | Persona del equipo que gestiona categorías, rifas, revisiones, rifas realizadas y entregas. |
| **Intención de rifa** | Rifa que aún no se confirma: está reuniendo puntos hacia su meta. |
| **Chance** | **Moneda visible** de la plataforma: 1 Chance = S/ 1 = 1 opción de ganar. Siempre en femenino: "la Chance", "35 Chances", "Tus Chances quedan retenidas". "Chance" se usa **solo** para la moneda. |
| **Rifa Armándose** | Nombre visible de la etapa en que una rifa pública junta Chances hacia su meta: todavía no llega al 100 % de lo que necesita recaudar. |
| **Precio referencial** | Precio del producto según el link de la tienda. En pantalla: "Precio referencial: S/ X". |
| **Margen** | Monto interno que la plataforma suma al precio del producto para formar la meta. No es público. |
| **Enlace de rifa** | URL pública y compartible de una rifa (`/r/slug`). |
| **Categoría** | Agrupación de rifas: zapatillas, ropa, relojes, consolas, TVs, etc. |
| **Punto** | Nombre **interno** (código y especificación) de la Chance. 1 punto = S/ 1. En pantalla siempre se muestra como "Chance". |
| **Opción / ticket** | Una participación en una rifa. Cuesta 1 Chance: 10 Chances puestas = 10 opciones de ganar, cada una con su número. |
| **Rifa / sorteo** | **Rifa** es el hecho en general (la rifa se arma, se confirma, se cierra, se rifa). **Sorteo** es solo el acto técnico de elegir al ganador al azar entre todas las opciones (§7.8). En los textos visibles se dice "se rifa", **"Rifa en vivo"** o "cómo se eligió al ganador". |
| **Saldo disponible** | Puntos libres para usar. |
| **Saldo retenido** | Puntos comprometidos en rifas aún no confirmadas. Bloqueados pero no gastados. |
| **Compromiso** | Puntos que un participante pone en una rifa que aún se está armando. Quedan retenidos. |
| **Meta** | Número de opciones necesarias para confirmar una rifa = precio del producto + margen. |
| **Ventana de armado** | Plazo para alcanzar la meta. Por defecto 7 días. |
| **Captura** | Conversión de un compromiso en tickets reales; los puntos retenidos se consumen. |
| **Liberación** | Devolución de puntos retenidos al saldo disponible. |
| **Snapshot** | Lista congelada de todos los tickets de una rifa al cerrarse. |
| **Propuesta** *(Fase 2)* | Rifa creada por un participante o creador. |
| **Rifa Sugerida** *(Fase 2)* | Etapa privada de una propuesta: solo accesible por su enlace, no aparece en listados ni buscador. El autor capta apoyo con su comunidad. |
| **Umbral de visibilidad** *(Fase 2)* | Apoyo mínimo (puntos puestos y/o participantes) que una propuesta debe juntar en privado para pasar a la etapa pública de armado. |
| **Rifa no listada** | Rifa que existe y se puede abrir por enlace, pero no aparece en el listado general ni en el buscador. |
| **Clave de idempotencia** | Identificador único de cada intento de poner puntos o comprar; evita que un doble clic o un reintento descuente dos veces. |
| **Estados visibles** | Lo que ve el público: **Rifa Sugerida** → **Rifa Armándose** → **Rifa Confirmada** → **Rifa Cerrada** (por rifar) → **Rifa Realizada** → **Premio Entregado**; o **Rifa Descartada**. Además, **Validando producto** es el estado de validez (link, existencia y precio del producto). Ver §7.13. |
| **Rifa Confirmada** | Rifa que llegó al 100 %: sigue abierta un tiempo (con tiempo extra al final) para que más personas se unan. |
| **Rifa Cerrada** | Se agotó el tiempo; nadie puede poner más Chances. Es una rifa **por rifar**. |
| **Rifa Realizada** | Ya se eligió al ganador. Sigue así mientras se compra y se envía el premio. |
| **Rifa Descartada** | No llegó al 100 % a tiempo, se canceló por cualquier motivo o su propuesta no pasó la validación. Todas las Chances vuelven. |
| **"Rifar"** | En los textos visibles no se usa "sortear" ni "sorteo": se dice "se rifa", "Rifa Realizada", "cómo se eligió al ganador". |

## 7.2 Entidades

| Entidad | Atributos esenciales | Identificada por |
|---------|---------------------|------------------|
| **Participante** | documento, nombres, fecha de nacimiento, correo, celular, apodo público, estado | Documento (único) |
| **Billetera** | saldo disponible, saldo retenido | Pertenece a un participante (1 a 1) |
| **Movimiento** | tipo, variación en disponible, variación en retenido, referencia (rifa/pago/compromiso), fecha | Inmutable, nunca se edita ni se borra |
| **Paquete de recarga** | precio, puntos que otorga, activo (atajos rápidos: 5, 10, 15 y 20) | — |
| **Recarga** | paquete, monto, medio de pago, estado | Referencia de la pasarela (única) |
| **Categoría** | nombre, ícono, orden, activa | Nombre único |
| **Producto** | nombre (título extraído del link), imágenes, **descripción** (resumen tomado del link; empieza con el color o modelo específico; vacía si no se pudo leer), **link original**, **link de compra** (el que usa la plataforma, puede ser reemplazado por un admin), estado del link, precio según la tienda, categoría | — |
| **Tienda confiable** | dominio, nombre, activa | Dominio único. Lista que mantienen los admins |
| **Rifa** | producto, autor (admin, participante o creador), estado, meta, margen (interno), opciones comprometidas, opciones vendidas, número de participantes, configuración (§7.9), fechas | **Código** alfanumérico único y visible (ej. `RF-7K3Q9XM2`) + **slug** para su enlace |
| **Compromiso** | rifa, participante, cantidad de opciones, estado | — |
| **Ticket** | rifa, participante, número correlativo | Número único dentro de su rifa |
| **Sorteo** | rifa, snapshot, huella (hash), semilla, ticket ganador, posición en la lista mezclada | Uno por rifa |
| **Ganador** | sorteo, participante, estado de entrega, evidencia | — |
| **Enlace de autor** *(Fase 2)* | rifa, autor, código de atribución, visitas, registros y puntos generados | Código único |

## 7.3 Invariantes (reglas que nunca se rompen)

1. Un documento de identidad tiene **una sola** cuenta.
2. Solo participantes **mayores de 18 años** pueden registrarse.
3. El saldo disponible y el saldo retenido **nunca son negativos**.
4. El saldo de una billetera **siempre** es igual a la suma de sus movimientos. Ningún saldo se modifica sin un movimiento que lo explique.
5. Los movimientos son **inmutables**: un error se corrige con un movimiento compensatorio, no editando el original.
6. Un participante **no puede comprometer ni comprar** más opciones que su saldo disponible.
7. Cada ticket tiene un número **único** dentro de su rifa.
8. Una rifa solo se puede rifar (elegir ganador) **una vez**, y solo después de estar cerrada y con su snapshot publicado.
9. Si una rifa no se arma, se descarta o se cancela, **todos** los puntos retenidos o consumidos en ella vuelven a disponible.
10. Solo se aceptan puntos en rifas en estado **Captando** o **Armando** (como compromiso) o **Abierta** (como compra directa).
11. El premio solo se entrega al **titular del documento** de la cuenta ganadora.
12. El **margen**, la **meta** y los **puntos reunidos** de una rifa nunca se exponen al público ni en la API pública; el público solo ve la cantidad de personas y el porcentaje de avance.
13. Cualquier visitante puede **ver** una rifa por su enlace; solo un participante con sesión puede **poner puntos**.
14. Todo cambio de estado de una rifa queda registrado (quién, cuándo, por qué).
15. Si una rifa se cancela **después** de haber consumido puntos (solo posible por fuerza mayor legal, invariante 24), esos puntos se reembolsan íntegramente.
16. **Cada punto está en un solo lugar a la vez:** libre en la billetera, retenido en **una** rifa o consumido en **una** rifa. Nunca en dos.
17. El saldo retenido de un participante es **exactamente** la suma de sus compromisos activos en todas las rifas.
18. Una misma operación (identificada por su clave de idempotencia) se aplica **una sola vez**, aunque llegue repetida.
19. Una rifa en **Captando** nunca aparece en el listado general ni en el buscador; solo se accede por su enlace.
20. Toda rifa sorteada termina con la **entrega de un premio** al ganador: el producto indicado o uno equivalente de igual o mayor valor.
21. Una rifa con link en revisión **no acepta puntos**.
22. El código (ID) de cada rifa es único, no cambia nunca y no usa caracteres confusos (0/O, 1/I/L).
23. **Las Chances puestas quedan bloqueadas:** desde la Rifa Sugerida hasta que la rifa se confirma o se descarta, no se pueden retirar. Si la rifa no llega al 100 % (se descarta), vuelven todas; si llega, se vuelven opciones de ganar y quedan asociadas a la rifa para siempre.
24. **Una Rifa Confirmada siempre se rifa** con quienes pusieron sus Chances. Si el producto cambió de precio o ya no existe, se entrega uno equivalente de igual o mayor valor (§7.11). Solo se cancela por **fuerza mayor legal**, con reembolso total.
