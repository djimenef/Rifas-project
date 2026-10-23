// Footer común. Los enlaces a las páginas legales y al Libro de Reclamaciones se agregan en el Paso 3.

/** @param {HTMLElement} footer elemento <footer> vacío donde se dibuja */
export function montarFooter(footer) {
  footer.innerHTML = `
  <div class="wrap">
    <span>© 2026 DaleChance · Perú</span>
    <span>Términos · Privacidad · Contacto</span>
  </div>
`;
}
