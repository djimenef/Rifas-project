import { esc } from '../lib/html.js';

// Estados genéricos de una pantalla o sección: vacío, error y cargando.

/**
 * @param {{ icono?: string, titulo: string, texto?: string, accion?: { texto: string, href: string } }} o
 */
export function estadoVacio({ icono = '🍀', titulo, texto = '', accion } = {}) {
  return `
    <div class="estado" role="status">
      <span class="estado-icono" aria-hidden="true">${icono}</span>
      <h3>${esc(titulo)}</h3>
      ${texto ? `<p>${esc(texto)}</p>` : ''}
      ${accion ? `<a class="btn btn-primary" href="${esc(accion.href)}">${esc(accion.texto)}</a>` : ''}
    </div>`;
}

/**
 * El botón de reintento lleva data-reintentar; la pantalla decide qué hacer al pulsarlo.
 * @param {{ titulo?: string, texto?: string, reintentar?: string | false }} [o]
 */
export function estadoError({ titulo = 'Algo salió mal', texto = 'No pudimos cargar la información. Inténtalo de nuevo.', reintentar = 'Reintentar' } = {}) {
  return `
    <div class="estado estado-error" role="alert">
      <span class="estado-icono" aria-hidden="true">!</span>
      <h3>${esc(titulo)}</h3>
      <p>${esc(texto)}</p>
      ${reintentar ? `<button type="button" class="btn btn-ghost" data-reintentar>${esc(reintentar)}</button>` : ''}
    </div>`;
}

/**
 * @param {{ texto?: string, filas?: number }} [o]
 */
export function cargando({ texto = 'Cargando…', filas = 3 } = {}) {
  return `
    <div class="cargando" role="status" aria-live="polite" aria-busy="true">
      <span class="cargando-texto"><span class="spinner" aria-hidden="true"></span>${esc(texto)}</span>
      ${'<span class="skeleton" aria-hidden="true"></span>'.repeat(filas)}
    </div>`;
}
