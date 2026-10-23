// Layout común de todas las pantallas:
// 1. lee la sesión y aplica la protección de la ruta (README §6 y PROMPT-FASE0 Paso 3);
// 2. dibuja el header y el footer (o el panel de administración);
// 3. agrega el panel de demo (solo Fase 0).
// Cada pantalla indica su ruta en <body data-ruta="…"> y espera `listo` antes de dibujar su contenido:
//   const { permitido, usuario } = await listo;
import { RUTAS, url, rutaActual, destinoVolver } from './lib/rutas.js';
import { esc } from './lib/html.js';
import { authService } from './services/index.js';
import { montarHeader } from './components/header.js';
import { montarFooter } from './components/footer.js';
import { montarAdmin } from './components/admin-layout.js';
import { montarPanelDemo } from './components/panel-demo.js';

const idRuta = document.body.dataset.ruta;
const info = RUTAS[idRuta] ?? { nombre: document.title, acceso: 'publico' };

/** @returns {'ok'|'login'|'sin-acceso'|'ya-con-sesion'} */
function verificarAcceso(acceso, usuario) {
  if (acceso === 'publico') return 'ok';
  if (acceso === 'sin-sesion') return usuario ? 'ya-con-sesion' : 'ok';
  if (!usuario) return 'login';
  if (acceso === 'participante') return usuario.rol === 'PARTICIPANTE' ? 'ok' : 'sin-acceso';
  if (acceso === 'admin') return usuario.rol === 'ADMIN' ? 'ok' : 'sin-acceso';
  return 'ok';   // 'sesion'
}

const redirigir = destino => {
  location.replace(destino);
  return new Promise(() => {});    // la página no sigue dibujándose
};

function sinAcceso(usuario) {
  const texto = usuario.rol === 'ADMIN'
    ? 'Esta sección es para participantes. Como administrador, gestiona la plataforma desde el panel.'
    : 'Esta sección es solo para el equipo de administración.';
  const destino = usuario.rol === 'ADMIN' ? ['admin', 'Ir al panel'] : ['inicio', 'Volver al inicio'];
  return `
    <div class="wrap pagina">
      <div class="estado estado-error" role="alert">
        <span class="estado-icono" aria-hidden="true">🔒</span>
        <h3>No tienes acceso</h3>
        <p>${esc(texto)}</p>
        <a class="btn btn-primary" href="${url(destino[0])}">${destino[1]}</a>
      </div>
    </div>`;
}

async function montar() {
  const sesion = await authService.sesionActual();
  const usuario = sesion?.usuario ?? null;
  const acceso = verificarAcceso(info.acceso, usuario);

  if (acceso === 'login') return redirigir(url('login', { volver: rutaActual() }));
  if (acceso === 'ya-con-sesion') return redirigir(destinoVolver(usuario.rol === 'ADMIN' ? url('admin') : url('rifas')));

  const layout = acceso === 'ok' ? (info.layout ?? 'publico') : 'publico';
  const header = document.querySelector('[data-layout="header"]');
  const footer = document.querySelector('[data-layout="footer"]');
  const main = document.querySelector('main');

  if (header) montarHeader(header, { layout, usuario, idRuta });
  if (layout === 'admin') {
    footer?.remove();
    montarAdmin(main, info.seccion);
  } else if (footer) {
    montarFooter(footer);
  }
  montarPanelDemo(usuario);

  if (acceso === 'sin-acceso') {
    main.innerHTML = sinAcceso(usuario);
    return { sesion, usuario, permitido: false, ruta: info, idRuta };
  }
  return { sesion, usuario, permitido: true, ruta: info, idRuta };
}

/** Se resuelve cuando el layout está listo y la ruta fue autorizada. */
export const listo = montar();
