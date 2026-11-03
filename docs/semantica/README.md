# Semántica funcional (capa 2)

Qué **significa** cada cosa del sistema, sin hablar de tecnología: el contrato entre diseño, negocio y desarrollo. Los tipos de `assets/js/domain/` y las reglas de los servicios mock (`assets/js/services/mock/`) deben reflejar exactamente lo que se define aquí.

Este contenido era la sección 7 del [`README.md`](../../README.md). Se dividió por dominio **conservando los números de sección** (§7.1 … §7.13), porque el código y los documentos los citan así.

| Archivo | Dominio | Secciones |
|---------|---------|-----------|
| [00-glosario.md](00-glosario.md) | Base común | §7.1 Glosario · §7.2 Entidades · §7.3 Invariantes (numeradas) |
| [01-identidad.md](01-identidad.md) | Usuario, registro, verificación | Acciones y eventos de identidad |
| [02-billetera.md](02-billetera.md) | Saldos, movimientos, garantías | §7.7 Movimientos · §7.10 No duplicidad · ciclo de las Chances (§7.13) · parámetros de recarga (§7.9) · acciones y eventos |
| [03-rifas.md](03-rifas.md) | Estados, transiciones, reglas | §7.4 Ciclo de vida · §7.13 Estados visibles y tiempo extra · §7.9 Configuración por rifa y ejemplo de meta · §7.11 Producto y link · acciones y eventos |
| [04-sorteo.md](04-sorteo.md) | Lista congelada, selección, ganador | §7.8 Transparencia · acciones y eventos |
| [05-propuestas.md](05-propuestas.md) | Fase 2: captación privada y moderación | Acciones de propuestas |
| [06-administracion.md](06-administracion.md) | Equipo de administración | Acciones del panel · cancelar una rifa (§7.13) · §7.12 Compra, envío y entrega · eventos |

**Dónde quedó cada sección del README**

| Sección | Archivo |
|---------|---------|
| §7.1 Glosario · §7.2 Entidades · §7.3 Invariantes | [00-glosario.md](00-glosario.md) |
| §7.4 Ciclo de vida de una rifa | [03-rifas.md](03-rifas.md) |
| §7.5 Acciones (comandos) | repartida: cada archivo tiene las filas de su dominio |
| §7.6 Eventos al participante | repartida: cada archivo tiene las filas de su dominio |
| §7.7 Movimientos de billetera | [02-billetera.md](02-billetera.md) |
| §7.8 Transparencia al elegir al ganador | [04-sorteo.md](04-sorteo.md) |
| §7.9 Configuración por rifa | [03-rifas.md](03-rifas.md) (la de recargas, en [02-billetera.md](02-billetera.md)) |
| §7.10 Garantía de no duplicidad | [02-billetera.md](02-billetera.md) |
| §7.11 Producto, link y garantía de entrega | [03-rifas.md](03-rifas.md) |
| §7.12 Compra, envío y entrega del premio | [06-administracion.md](06-administracion.md) |
| §7.13 Estados visibles y tiempo extra | [03-rifas.md](03-rifas.md) (ciclo de las Chances en [02-billetera.md](02-billetera.md); cancelar una rifa en [06-administracion.md](06-administracion.md)) |

Los diagramas en Mermaid viven en [`docs/diagramas/`](../diagramas/README.md).
