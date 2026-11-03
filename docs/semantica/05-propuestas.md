# Propuestas (Fase 2): captación privada y moderación

> Parte de la **semántica funcional** (capa 2): [índice](README.md) · [README §7](../../README.md#7-semántica-funcional-definición-abstracta). Los números de sección (§7.x) se conservan del README para que las referencias del código y los documentos sigan valiendo.

Rifas sugeridas por participantes y creadores: nacen privadas (**Rifa Sugerida**, solo por enlace), juntan el apoyo mínimo (umbral de visibilidad) y el equipo las valida antes de pasar a **Rifa Armándose**. Los estados `REVISION_LINK`, `CAPTANDO` y `PROPUESTA` están en [03-rifas.md](03-rifas.md) (§7.4); la validación y el reemplazo del link, en §7.11 del mismo archivo; el umbral y los límites, en §7.9. Entidad **Enlace de autor** e invariantes 19 y 21 en [00-glosario.md](00-glosario.md).

## 7.5 Acciones (comandos) y sus efectos (fragmento)

Cada acción tiene un **actor**, una **condición previa** y un **resultado**. Esta tabla es la que se implementará en la Fase 1 y la que los servicios mock simulan en la Fase 0.

| Acción | Actor | Condición previa | Resultado |
|--------|-------|------------------|-----------|
| Proponer rifa *(F2)* | Participante o creador | Cuenta verificada, límite de propuestas activas no superado, pasa el filtro automático (categoría permitida, link válido, precio dentro de rango) | Si el link es de tienda confiable: rifa en CAPTANDO, no listada, con enlace, ID y código de autor; el autor pone puntos propios (mínimo configurable). Si no: REVISION_LINK |
| Validar link *(F2)* | Admin | Rifa en REVISION_LINK | Aprobado tal cual, o **reemplazado** por un link equivalente de tienda confiable → CAPTANDO · Rechazado → DESCARTADA |
| Pasar a moderación *(F2)* | Sistema | Rifa en CAPTANDO y umbral de visibilidad alcanzado | Rifa en PROPUESTA; avisa a los admins |
| Moderar propuesta *(F2)* | Admin | Rifa en PROPUESTA | Aprobada: se fija margen y meta → ARMANDO (pública), conserva sus compromisos · Rechazada: DESCARTADA con motivo y liberación de puntos |
| Declarar no armada en captación *(F2)* | Sistema | Rifa en CAPTANDO y ventana de captación vencida | Liberación de compromisos, rifa NO_SE_ARMO |
