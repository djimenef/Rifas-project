# Diagramas

Todos los diagramas están escritos en [Mermaid](https://mermaid.js.org/): texto dentro de bloques ```` ```mermaid ```` que se dibuja como diagrama.

## Cómo verlos

- **En VS Code:** instala la extensión **Markdown Preview Mermaid Support** (`bierner.markdown-mermaid`). El repositorio la recomienda en `.vscode/extensions.json`, así que VS Code te la ofrece al abrir el proyecto. Luego abre el `.md` y usa **Open Preview** (`Ctrl+Shift+V`) o **Open Preview to the Side** (`Ctrl+K V`).
- **En GitHub:** se dibujan solos al abrir el archivo.

## Índice

| Diagrama | Qué muestra |
|----------|-------------|
| [Ciclo de vida de la rifa](ciclo-de-vida-rifa.md) | Estados visibles, ciclo de las Chances, tiempo extra, cómo cancelar y la tabla de estados internos |
| [Opciones y transparencia](opciones-y-transparencia.md) | De Chance a opción (número y código), lista pública anónima, verificación y elección del ganador |
| [Flujo de la billetera](flujo-billetera.md) | Disponible, retenido y consumido; movimientos del ledger |
| [Recorrido del usuario](recorrido-usuario.md) | De abrir un enlace a recibir el premio, y quién hace qué en cada etapa |
| [Mapa de pantallas](mapa-de-pantallas.md) | Todas las pantallas, cómo se navega entre ellas y cuáles ya están construidas |
| [Arquitectura](arquitectura.md) | Pantallas → servicios → motor de reglas; qué cambia en la Fase 1 |
| [Flujo de trabajo del equipo](flujo-de-trabajo.md) | Pasos de la Fase 0, ramas, traspasos y Pull Requests |

El modelo de datos (diagrama entidad-relación) está en el README §9.2 y las tres capas del proyecto en el README §3.

## Al escribir uno nuevo

- Un tema por archivo, con un párrafo que diga qué muestra y dónde está la especificación.
- Textos en español, con los nombres visibles de los estados ("Rifa Confirmada") y sin "sortear/sorteo" en lo que ve el público.
- Comprueba que se dibuja en la vista previa antes de hacer commit, y agrégalo a este índice.
