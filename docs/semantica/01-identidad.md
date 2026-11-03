# Identidad: usuario, registro y verificación

> Parte de la **semántica funcional** (capa 2): [índice](README.md) · [README §7](../../README.md#7-semántica-funcional-definición-abstracta). Los números de sección (§7.x) se conservan del README para que las referencias del código y los documentos sigan valiendo.

Quién puede participar y cómo entra. Entidad **Participante** e invariantes 1, 2, 11 y 13 en [00-glosario.md](00-glosario.md).

## 7.5 Acciones (comandos) y sus efectos (fragmento)

Cada acción tiene un **actor**, una **condición previa** y un **resultado**. Esta tabla es la que se implementará en la Fase 1 y la que los servicios mock simulan en la Fase 0.

| Acción | Actor | Condición previa | Resultado |
|--------|-------|------------------|-----------|
| Registrarse | Visitante | Documento no registrado, mayor de edad | Participante creado con billetera en 0 |
| Verificar contacto | Participante | Código válido | Correo/celular verificado |

## 7.6 Eventos que el sistema comunica al participante (fragmento)

| Evento | Canal sugerido |
|--------|----------------|
| Cuenta creada / contacto verificado | Correo |
