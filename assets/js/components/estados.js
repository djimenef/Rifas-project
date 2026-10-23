import { esc } from '../lib/html.js';
import { estadoForzado } from '../lib/demo.js';

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

/**
 * Marcador de una pantalla que todavía no se construye (para que ningún enlace quede roto).
 * @param {{ nombre: string, ruta: string }} pantalla
 */
export function enConstruccion({ nombre, ruta }) {
  return `
    <div class="estado" role="status">
      <span class="estado-icono" aria-hidden="true">🚧</span>
      <h3>En construcción</h3>
      <p>La pantalla <b>${esc(nombre)}</b> (<code>${esc(ruta)}</code>) se construye en un próximo paso.</p>
    </div>`;
}

/**
 * Carga una sección mostrando sus estados: cargando → contenido, vacío o error (con reintentar).
 * Respeta el estado forzado desde el panel de demo.
 * @template T
 * @param {HTMLElement} el contenedor de la sección
 * @param {{
 *   cargar: () => Promise<T>,
 *   mostrar: (datos: T) => void,
 *   esVacio?: (datos: T) => boolean,
 *   vacio?: Parameters<typeof estadoVacio>[0],
 *   error?: Parameters<typeof estadoError>[0],
 *   textoCargando?: string,
 * }} opciones
 */
export async function cargarSeccion(el, opciones) {
  const { cargar, mostrar, esVacio = d => Array.isArray(d) && d.length === 0, vacio = { titulo: 'No hay nada por aquí todavía' }, error = {}, textoCargando } = opciones;
  const forzado = estadoForzado();
  el.setAttribute('aria-busy', 'true');
  el.innerHTML = cargando({ texto: textoCargando });
  if (forzado === 'cargando') return;
  try {
    if (forzado === 'error') throw new Error('Error simulado desde el panel de demo.');
    const datos = forzado === 'vacio' ? null : await cargar();
    el.removeAttribute('aria-busy');
    if (forzado === 'vacio' || esVacio(datos)) el.innerHTML = estadoVacio(vacio);
    else mostrar(datos);
  } catch (e) {
    el.removeAttribute('aria-busy');
    el.innerHTML = estadoError({ ...error, texto: error.texto ?? e.message });
    el.querySelector('[data-reintentar]')?.addEventListener('click', () => cargarSeccion(el, opciones));
  }
}
