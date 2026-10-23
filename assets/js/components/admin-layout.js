import { url, SECCIONES_ADMIN } from '../lib/rutas.js';

// Layout del panel de administración: menú lateral fijo; en móvil, menú desplegable.

/**
 * Envuelve el <main> de la página con el menú lateral del panel.
 * @param {HTMLElement} main
 * @param {string} seccionActual
 */
export function montarAdmin(main, seccionActual) {
  const actual = SECCIONES_ADMIN.find(s => s.seccion === seccionActual) ?? SECCIONES_ADMIN[0];
  const cuerpo = document.createElement('div');
  cuerpo.className = 'admin-cuerpo';
  cuerpo.innerHTML = `
    <aside class="admin-menu">
      <button type="button" class="btn btn-ghost admin-menu-boton" aria-expanded="false" aria-controls="admin-secciones">
        <span aria-hidden="true">☰</span> ${actual.icono} ${actual.texto}
      </button>
      <nav id="admin-secciones" aria-label="Secciones del panel">
        <ul>
          ${SECCIONES_ADMIN.map(s => `<li><a href="${url(s.id)}"${s.seccion === actual.seccion ? ' aria-current="page"' : ''}><span aria-hidden="true">${s.icono}</span>${s.texto}</a></li>`).join('\n          ')}
        </ul>
      </nav>
    </aside>`;
  main.replaceWith(cuerpo);
  main.classList.add('admin-contenido');
  cuerpo.appendChild(main);

  const boton = cuerpo.querySelector('.admin-menu-boton');
  const menu = cuerpo.querySelector('.admin-menu');
  boton.addEventListener('click', () => {
    const abierto = menu.toggleAttribute('data-abierto');
    boton.setAttribute('aria-expanded', abierto);
  });
}
