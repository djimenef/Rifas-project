// Dibuja el header y el footer comunes en cada página.
// Uso en el HTML:
//   <header data-layout="header" data-variante="inicio"></header>
//   <footer data-layout="footer"></footer>
//   <script type="module" src=".../assets/js/layout.js"></script>
import { montarHeader } from './components/header.js';
import { montarFooter } from './components/footer.js';

const header = document.querySelector('[data-layout="header"]');
if (header) montarHeader(header, header.dataset.variante);

const footer = document.querySelector('[data-layout="footer"]');
if (footer) montarFooter(footer);
