# CLAUDE.md — Reglas del proyecto para Claude Code

> Claude Code carga este archivo automáticamente en cada sesión. Es corto a propósito: las reglas viven aquí; la especificación completa vive en `README.md`.

## Proyecto

Plataforma web de rifas a demanda (Perú, soles). Los participantes se registran con DNI, recargan puntos (1 punto = S/ 1 = 1 opción) y ponen puntos en rifas que se confirman solo si se arma el pozo ("Armando la Chance").

**Etapa actual: Fase 0 — mockups navegables.** Solo interfaz con datos falsos. Nada de backend.

## Fuentes de verdad (en este orden)

1. **Pantallas ya construidas en el repo** (inicio, login, registro): fuente de verdad **visual**.
2. **`README.md`**: fuente de verdad **funcional**. Sección 6 = inventario de pantallas; sección 7 = semántica (estados, acciones, reglas); sección 8 = tipos y datos de ejemplo.
3. **`PROMPT-FASE0.md`**: plan de trabajo paso a paso de la Fase 0.

Si algo no está definido en estas fuentes, **pregunta** antes de inventar. Si encuentras una contradicción entre ellas, detente y repórtala.

## Reglas obligatorias

- **No cambies el stack** existente (framework, librería de estilos, gestor de paquetes). No instales dependencias nuevas sin pedir permiso y explicar por qué.
- **No modifiques el aspecto** de las 3 pantallas existentes. Puedes refactorizarlas para extraer componentes y tokens, pero deben verse idénticas antes y después.
- **Todo color, tipografía, espaciado y radio sale de los tokens de diseño.** Nada de valores sueltos.
- **Las pantallas nunca importan mocks directamente:** consumen servicios (`services/interfaces` + `services/mock`).
- **La lógica de negocio va en los servicios mock**, no en los componentes. Los mocks deben aplicar las reglas de `README.md` §7 (saldo insuficiente, estados que no aceptan puntos, etc.).
- **El público nunca ve montos del pozo, meta ni margen**: solo cantidad de personas y barra de % (rojo → verde).
- Textos de interfaz en **español de Perú** usando el glosario de `README.md` §7.1.
- Mobile-first: probar a 360 px, 768 px y 1280 px.
- Accesibilidad: `label` en inputs, foco visible, contraste suficiente, navegable con teclado.
- Nunca borres archivos existentes sin preguntar.

## Flujo de trabajo

- Trabaja en la rama `feature/fase0-mockups` (créala desde la rama principal si no existe).
- **Un commit por paso** del plan, con [Conventional Commits](https://www.conventionalcommits.org/es/):
  `feat(rifas): mockup de detalle de rifa`, `refactor(ui): extraer tokens de diseño`, `docs(semantica): estados de rifa`.
- No hagas `push` ni abras PRs sin que te lo pida.
- Al terminar cada paso, resume en 3–5 líneas qué hiciste y qué sigue.

## Comandos del proyecto

> Completar cuando Claude Code los detecte en el Paso 0 de `PROMPT-FASE0.md`.

| Acción | Comando |
|--------|---------|
| Levantar en desarrollo | _por definir_ |
| Compilar | _por definir_ |
| Lint / formato | _por definir_ |
