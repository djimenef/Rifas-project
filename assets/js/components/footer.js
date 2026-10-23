import { url } from '../lib/rutas.js';

// Footer común: ayuda, legales y Libro de Reclamaciones.

/** @param {HTMLElement} footer elemento <footer> vacío donde se dibuja */
export function montarFooter(footer) {
  const enlaces = [
    ['comoFunciona', 'Cómo funciona'], ['preguntas', 'Preguntas frecuentes'], ['terminos', 'Términos'],
    ['privacidad', 'Privacidad'], ['reglamento', 'Reglamento'], ['reclamaciones', 'Libro de Reclamaciones'],
  ];
  footer.innerHTML = `
  <div class="wrap">
    <span>© 2026 DaleChance · Perú</span>
    <nav class="footer-links" aria-label="Ayuda y legales">
      ${enlaces.map(([id, texto]) => `<a href="${url(id)}">${texto}</a>`).join('\n      ')}
    </nav>
  </div>
`;
}
