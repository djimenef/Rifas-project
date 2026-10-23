import { ruta } from '../lib/rutas.js';

// Header común. Variantes:
//   'inicio' → navegación de la página de inicio + menú "Participar"
//   'volver' → logo + "← Volver al inicio" (login y registro)
// La variante con sesión (saldo, Mis rifas, Recargar, menú de usuario) se agrega en el Paso 3.

function headerInicio() {
  return `
  <div class="wrap nav">
    <a href="#" class="logo">Dale<span>Chance</span></a>
    <nav class="nav-links">
      <a href="#como-funciona">Cómo funciona</a>
      <a href="#sorteos">Sorteos</a>
      <a href="#comprar">Comprar</a>
      <a href="#faq">Preguntas</a>
      <div class="join">
        <button type="button" class="btn btn-primary btn-sm" id="join-btn" aria-haspopup="true" aria-expanded="false" aria-controls="join-menu">Participar</button>
        <div class="join-menu" id="join-menu" hidden>
          <a href="${ruta('iniciar-sesion.html')}" class="btn btn-ghost">Iniciar sesión</a>
          <a href="${ruta('crear-cuenta.html')}" class="btn btn-primary">Crear cuenta</a>
        </div>
      </div>
    </nav>
  </div>
`;
}

function headerVolver() {
  return `
  <div class="wrap nav">
    <a href="${ruta('index.html')}" class="logo">Dale<span>Chance</span></a>
    <a href="${ruta('index.html')}" class="back">← Volver al inicio</a>
  </div>
`;
}

// Mini pop-up: se abre con el botón, se cierra al hacer clic fuera o con Esc.
function activarMenu(header, botonId, menuId) {
  const boton = header.querySelector('#' + botonId);
  const menu = header.querySelector('#' + menuId);
  if (!boton || !menu) return;
  const abrir = abierto => {
    menu.hidden = !abierto;
    boton.setAttribute('aria-expanded', abierto);
  };
  boton.addEventListener('click', e => { e.stopPropagation(); abrir(menu.hidden); });
  document.addEventListener('click', e => { if (!menu.contains(e.target)) abrir(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') abrir(false); });
}

/** @param {HTMLElement} header elemento <header> vacío donde se dibuja */
export function montarHeader(header, variante = 'inicio') {
  header.innerHTML = variante === 'volver' ? headerVolver() : headerInicio();
  activarMenu(header, 'join-btn', 'join-menu');
}
