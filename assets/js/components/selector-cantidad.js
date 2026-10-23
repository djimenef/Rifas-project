import { esc } from '../lib/html.js';

// Selector de cantidad (− N +) con el mismo aspecto que el de la página de inicio.

/**
 * @param {{ valor?: number, min?: number, max?: number, unidad?: string, etiqueta?: string }} [opciones]
 * @returns {string} HTML del selector
 */
export function selectorCantidad({ valor = 1, min = 1, max = 999, unidad = 'puntos', etiqueta = 'Cantidad' } = {}) {
  return `
    <div class="qty" data-min="${min}" data-max="${max}">
      <button type="button" data-paso="-1" aria-label="Quitar uno">−</button>
      <input type="number" value="${valor}" min="${min}" max="${max}" aria-label="${esc(etiqueta)}">
      <button type="button" data-paso="1" aria-label="Agregar uno">+</button>
      <span class="qty-unidad">${esc(unidad)}</span>
    </div>`;
}

/**
 * Activa un selector ya dibujado.
 * @param {HTMLElement} el contenedor .qty
 * @param {(valor: number) => void} [alCambiar]
 * @returns {{ valor: () => number, fijar: (n: number) => void }}
 */
export function montarSelectorCantidad(el, alCambiar) {
  const input = el.querySelector('input');
  const [menos, mas] = el.querySelectorAll('button');
  const min = Number(el.dataset.min), max = Number(el.dataset.max);

  const fijar = n => {
    const v = Math.max(min, Math.min(max, Math.round(Number(n)) || min));
    input.value = v;
    menos.disabled = v <= min;
    mas.disabled = v >= max;
    alCambiar?.(v);
  };
  el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => fijar(Number(input.value) + Number(b.dataset.paso))));
  input.addEventListener('change', () => fijar(input.value));
  fijar(input.value);
  return { valor: () => Number(input.value), fijar };
}
