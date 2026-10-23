// Marcador "En construcción" para las pantallas que se construyen en los Pasos 4 a 6.
// Respeta la protección de la ruta y el estado forzado desde el panel de demo.
import { listo } from '../layout.js';
import { cargarSeccion, enConstruccion } from '../components/estados.js';
import { esc } from '../lib/html.js';

const { permitido, ruta } = await listo;

if (permitido) {
  const main = document.querySelector('main');
  main.innerHTML = `
    <div class="wrap pagina">
      <h1 class="pagina-titulo">${esc(ruta.nombre)}</h1>
      <p class="pagina-sub">Esta pantalla ya tiene su ruta y su acceso; el contenido llega en un próximo paso.</p>
      <div id="seccion"></div>
    </div>`;
  const seccion = main.querySelector('#seccion');
  cargarSeccion(seccion, {
    cargar: async () => true,
    esVacio: () => false,
    mostrar: () => { seccion.innerHTML = enConstruccion({ nombre: ruta.nombre, ruta: '/' + ruta.archivo }); },
    vacio: { icono: '🗂️', titulo: 'Sin resultados', texto: 'Así se verá esta pantalla cuando no tenga datos.' },
  });
}
