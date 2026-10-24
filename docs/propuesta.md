# DaleChance — Propuesta del proyecto

*Documento para socios, compañeros e inversionistas. Versión de octubre de 2026.*

---

## 1. Resumen

**DaleChance** es una plataforma web peruana de rifas de productos en la que **la comunidad decide qué se rifa**. Cada persona compra solo las **Chances** que quiere (1 Chance = S/ 1 = 1 opción de ganar) y las pone en la rifa que le interesa. Una rifa solo se realiza si junta suficiente apoyo: si lo logra, pasa a **Rifa Confirmada** y se rifa con un proceso transparente y verificable; si no lo logra, todas las Chances vuelven completas a la billetera de cada participante. El premio se entrega siempre: el producto rifado o uno equivalente de igual o mayor valor.

## 2. Problema y oportunidad

En el Perú ya existe interés por plataformas de premios. Hoy las más conocidas están asociadas a creadores de contenido, como **No Hay Sin Suerte** (de Jorge Luna) y **P. Chu Joy**. Estas plataformas funcionan con una **suscripción mensual fija** y **los premios los decide la plataforma**.

Eso deja necesidades sin atender:

- Quien quiere participar **una sola vez**, o por un premio concreto, igual tiene que pagar una suscripción.
- El participante **no elige** qué se rifa.
- Si un premio no le interesa, igual está pagando por él.

La oportunidad es un modelo **a demanda**, sin suscripción, donde la gente pone su dinero solo en lo que quiere ganar.

## 3. Nuestra propuesta de valor

| | Plataformas por suscripción | DaleChance |
|---|---|---|
| Forma de pago | Suscripción mensual fija | **Sin suscripción**: pagas solo las Chances que quieres |
| Qué se rifa | Lo decide la plataforma | **Rifas a demanda**: la comunidad elige con sus Chances |
| Si no se completa | — | **Las Chances vuelven íntegras** a la billetera |
| Transparencia | Variable | **Lista de participantes congelada** con una huella digital pública **antes** de rifar |
| Premio | Producto anunciado | **Entrega garantizada** del premio rifado o uno equivalente de igual o mayor valor |

En resumen: el participante tiene **control** (elige y paga solo lo que quiere), **seguridad** (no pierde su dinero si la rifa no se arma) y **confianza** (cómo se elige al ganador se puede verificar y el premio se entrega).

## 4. Cómo funciona para el participante

1. **Se registra con su DNI.** Solo mayores de 18 años y solo con su propio documento: el premio se compra a nombre del ganador y se entrega presentando el DNI físico.
2. **Recarga Chances.** 1 Chance = S/ 1 = 1 opción de ganar. Puede elegir un monto rápido (5, 10, 15 o 20) o cualquier cantidad de 5 a 500.
3. **Pone Chances en una "Rifa Armándose".** Mientras la rifa no llega al 100 %, sus Chances quedan **retenidas y bloqueadas**: no se gastan ni se pueden retirar.
4. **Si la rifa llega al 100 %, pasa a "Rifa Confirmada".** Las Chances se convierten en opciones de ganar, asociadas a la rifa para siempre: una Rifa Confirmada **siempre se rifa**. Sigue abierta un tiempo para que otros se unan.
5. **Rifa Cerrada y Rifa Realizada.** Cuando se agota el tiempo (con tiempo extra si en los últimos 5 minutos se siguen uniendo personas), se congela la lista de participantes y se publica su huella digital; luego se rifa en vivo y cualquiera puede verificar cómo se eligió al ganador.
6. **Compra y entrega.** La empresa compra el premio a nombre del ganador y lo entrega con verificación del DNI.

Si la rifa **no llega al 100 %** en el plazo, queda como **Rifa Descartada** y las Chances vuelven completas a la billetera para usarlas en otra rifa.

**Estados que ve el participante:** Rifa Sugerida *(Fase 2)* → Rifa Armándose → Rifa Confirmada → Rifa Cerrada (por rifar) → Rifa Realizada → Premio Entregado; o Rifa Descartada. Diagramas: [`docs/diagramas/ciclo-de-vida-rifa.md`](diagramas/ciclo-de-vida-rifa.md).

## 5. Públicos

- **Participantes:** personas mayores de 18 años en el Perú que quieren ganar productos concretos (zapatillas, ropa, relojes, consolas, televisores, celulares) pagando poco y solo por lo que les interesa.
- **Creadores de contenido** *(Fase 2)*: pueden **proponer rifas** que nacen **privadas**, solo accesibles por su enlace. Las comparten con su comunidad y la rifa solo se hace **pública** cuando junta **apoyo real** (Chances puestas por personas reales). Así se evita llenar la plataforma de rifas que nunca se arman, y se premia a quien tiene una comunidad activa.

## 6. Modelo de negocio

- Cada rifa tiene una **meta** = **precio referencial del producto + 35 % de margen interno**.
- **Ejemplo:** una PlayStation 5 de **S/ 2,200** tiene un margen de **S/ 770** y una meta de **2,970 Chances**.
- El público **nunca ve** la meta ni el margen: solo ve **cuántas personas** participan y el **porcentaje de avance**. Así no se desanima a nadie con montos grandes.
- Para que una propuesta de un creador (Fase 2) pase a ser pública, debe juntar el **20 % de la meta** y al menos **10 personas**. En el ejemplo de la PS5: 594 Chances.
- **Lo recaudado por encima de la meta** (cuando la rifa sigue abierta y entran más Chances): **decisión pendiente**. Las opciones son margen adicional de la plataforma, un fondo para próximas rifas o un premio adicional.
- El ingreso de la plataforma sale del margen de las rifas que se completan. Las rifas que no se completan no generan ingreso, pero tampoco costo de premio, y el dinero queda en la billetera del participante para otra rifa.

## 7. Fases

| Fase | Qué incluye | Estado |
|------|-------------|--------|
| **Fase 0 · Prototipo navegable** | Todas las pantallas del producto con datos de ejemplo, para validar la experiencia antes de construir | **En curso** |
| **Fase 1 · Producto mínimo** | Plataforma funcional con pagos reales, billetera, rifas creadas por el equipo, elección verificable del ganador, compra y entrega del premio, panel de administración y obligaciones legales | Siguiente |
| **Fase 2 · Comunidad** | Rifas propuestas por usuarios y creadores, etapa privada y moderación, enlaces con atribución para creadores, más medios de pago | Después |
| **Fase 3 · Escala** | Aplicación móvil, rifas transmitidas en vivo dentro de la plataforma, programa de referidos, reportes avanzados | Futuro |

## 8. Metas e indicadores

Proponemos medir estos indicadores desde el primer día. **Los valores objetivo están por definir** con datos reales de la Fase 1.

| Indicador | Qué nos dice | Meta |
|-----------|--------------|------|
| Rifas armadas vs. no armadas | Si elegimos bien los productos y precios | Por definir |
| Tiempo promedio de armado | Qué tan rápido la comunidad completa una rifa | Por definir |
| Participantes por rifa | Alcance de cada rifa | Por definir |
| Recarga promedio | Cuánto pone cada persona por vez | Por definir |
| Recompra | Cuántas personas vuelven a recargar | Por definir |
| Rifas propuestas que se vuelven públicas *(Fase 2)* | Calidad de las propuestas de creadores | Por definir |
| Tiempo entre Rifa Realizada y Premio Entregado | Cumplimiento operativo | Por definir |

## 9. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| **Legal:** las rifas con pago probablemente son una actividad regulada en el Perú | Validar con un abogado, **antes de lanzar**, la autorización ante el **Ministerio del Interior** y/o el encuadre ante **MINCETUR**; empresa formal, comprobantes electrónicos, Libro de Reclamaciones, protección de datos personales y constatación notarial de cada rifa |
| **Operativo:** comprar y entregar cada premio a tiempo | Revisión de cada rifa antes de rifarla; registro de compra, envío y entrega con evidencia; compromiso de entregar un premio equivalente de igual o mayor valor si el producto cambia de precio o se agota |
| **Fraude y doble uso de Chances** | Una cuenta por DNI; cada Chance está en un solo lugar a la vez; protección contra cobros duplicados; revisión de indicios de fraude antes de rifar |
| **Lavado de activos** | Límites por recarga (de 5 a 500 Chances) y límite diario propuesto de S/ 500 por usuario; monitoreo de patrones inusuales; las Chances no se pueden retirar como dinero |
| **Reputación** | Rifas verificables por cualquiera, reembolso completo si una rifa no se arma o se cancela, entrega con evidencia y atención de reclamos |

## 10. Próximos pasos inmediatos

1. **Terminar el prototipo navegable** (Fase 0) con todas las pantallas del recorrido: rifas, detalle, billetera, recarga, mis rifas y panel de administración.
2. **Mostrar el prototipo** a un grupo pequeño de posibles participantes y creadores para validar la experiencia y el lenguaje ("Chances", "Rifa Armándose").
3. **Consulta legal** sobre la autorización de rifas antes de cualquier lanzamiento.
4. **Definir las decisiones pendientes:** uso de lo recaudado sobre la meta, límite diario de recarga, vencimiento de Chances, plazo para reclamar el premio.
5. **Elegir proveedores** para la Fase 1: pasarela de pago (tarjeta y Yape), facturación electrónica y validación de DNI.
6. **Planificar la Fase 1** (producto mínimo) con presupuesto y calendario.

---

*Este documento no es asesoría legal ni financiera.*
