import { esc } from '../lib/html.js';

// Pestañas accesibles (role="tablist"): clic o flechas ← → / Inicio / Fin.

/**
 * @param {string} id prefijo único para los ids de pestañas y paneles
 * @param {{ id: string, texto: string, contenido: string }[]} pestanas contenido = HTML del panel
 * @param {string} [activa] id de la pestaña abierta al inicio (por defecto, la primera)
 * @returns {string} HTML
 */
export function tabs(id, pestanas, activa = pestanas[0]?.id) {
  const botones = pestanas.map(p => `
      <button type="button" class="tab" role="tab" id="${id}-tab-${p.id}" aria-controls="${id}-panel-${p.id}"
        aria-selected="${p.id === activa}" tabindex="${p.id === activa ? 0 : -1}">${esc(p.texto)}</button>`).join('');
  const paneles = pestanas.map(p => `
    <div class="tab-panel" role="tabpanel" id="${id}-panel-${p.id}" aria-labelledby="${id}-tab-${p.id}" tabindex="0"${p.id === activa ? '' : ' hidden'}>${p.contenido}</div>`).join('');
  return `<div data-tabs><div class="tabs" role="tablist">${botones}</div>${paneles}</div>`;
}

/**
 * @param {HTMLElement} el contenedor [data-tabs]
 * @param {(idPestana: string) => void} [alCambiar]
 */
export function montarTabs(el, alCambiar) {
  const botones = [...el.querySelectorAll('[role="tab"]')];
  const seleccionar = boton => {
    botones.forEach(b => {
      const activo = b === boton;
      b.setAttribute('aria-selected', activo);
      b.tabIndex = activo ? 0 : -1;
      el.querySelector('#' + b.getAttribute('aria-controls')).hidden = !activo;
    });
    alCambiar?.(boton.id.split('-tab-')[1]);
  };
  botones.forEach((b, i) => {
    b.addEventListener('click', () => seleccionar(b));
    b.addEventListener('keydown', e => {
      const destino = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: botones.length - 1 }[e.key];
      if (destino === undefined) return;
      e.preventDefault();
      const siguiente = botones[(destino + botones.length) % botones.length];
      siguiente.focus();
      seleccionar(siguiente);
    });
  });
}
