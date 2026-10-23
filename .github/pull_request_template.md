## Qué cubre este PR

- **Paso de `PROMPT-FASE0.md`:** <!-- p. ej. Paso 4 — Pantallas P1 -->
- **Pantallas o módulos:** <!-- p. ej. /rifas, /r/[slug], modal Poner Chances -->
- **Secciones del README que implementa:** <!-- p. ej. §6 #2 y #3, §7.5 -->

## Resumen de cambios

<!-- 3 a 5 líneas: qué se hizo y por qué. Decisiones nuevas, si las hay. -->

## Capturas

| Pantalla | Móvil (360 px) | Escritorio (1280 px) |
|----------|----------------|----------------------|
| <!-- nombre --> | <!-- arrastra la imagen aquí --> | <!-- arrastra la imagen aquí --> |

## Checklist de "terminado" (README §4.4)

- [ ] Coincide visualmente con las pantallas de referencia (usa tokens y componentes compartidos).
- [ ] Funciona en 360 px, 768 px y 1280 px de ancho.
- [ ] Muestra todos sus estados (cargando, vacío, error y los de negocio del inventario §6).
- [ ] Consume datos solo a través de `assets/js/services/index.js`, nunca importando mocks.
- [ ] Los tipos usados están en `assets/js/domain/` y coinciden con la semántica (§7).
- [ ] Textos en español de Perú con el vocabulario visible: **Chances** (femenino), **Armando Rifa**, **Precio referencial**.
- [ ] Nada de CSS ni JS dentro de los HTML.
- [ ] Capturas de móvil y escritorio en este PR.

## Pruebas

- [ ] `http://localhost:8000/dev/pruebas/` → **todas en verde** (indica cuántas: __ de __).
- [ ] Recorrí las pantallas con el panel de demo como visitante, participante y admin.
- [ ] `docs/PROGRESO.md` actualizado en este PR.

## Para quien revisa

<!-- Qué mirar con más atención, cómo probarlo, dudas abiertas. -->
