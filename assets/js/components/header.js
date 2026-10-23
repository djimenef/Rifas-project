import { url, rutaActual } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos } from '../lib/formato.js';
import { authService, billeteraService } from '../services/index.js';

// Header común. Variantes según el layout de la ruta y la sesión:
//   'publico' sin sesión   → Rifas, Cómo funciona, Ganadores, Preguntas + menú "Participar"
//   'publico' participante → Rifas, Mis rifas, saldo (→ billetera), Recargar + menú de usuario
//   'publico' admin        → Rifas, Cómo funciona, Panel de administración + menú de usuario
//   'volver'               → logo + "← Volver al inicio" (login y registro)
//   'admin'                → panel de gestión: "Modo administrador", "Ver sitio" + menú de usuario

const logo = href => `<a href="${href}" class="logo">Dale<span>Chance</span></a>`;

function menuParticipar(idRuta) {
  const volver = idRuta && idRuta !== 'inicio' ? rutaActual() : undefined;
  return `
      <div class="join">
        <button type="button" class="btn btn-primary btn-sm" id="join-btn" aria-haspopup="true" aria-expanded="false" aria-controls="join-menu">Participar</button>
        <div class="join-menu" id="join-menu" hidden>
          <a href="${url('login', { volver })}" class="btn btn-ghost">Iniciar sesión</a>
          <a href="${url('registro', { volver })}" class="btn btn-primary">Crear cuenta</a>
        </div>
      </div>`;
}

function menuUsuario(usuario, enPanel = false) {
  const opciones = usuario.rol === 'ADMIN'
    ? (enPanel ? [['inicio', 'Ver sitio']] : [['admin', 'Panel de administración']])
    : [['billetera', 'Mi billetera'], ['historial', 'Mi historial'], ['misRifas', 'Mis rifas'], ['misPropuestas', 'Mis propuestas'], ['perfil', 'Perfil']];
  return `
      <div class="join">
        <button type="button" class="btn btn-ghost btn-sm" id="usuario-btn" aria-haspopup="true" aria-expanded="false" aria-controls="usuario-menu"
          aria-label="Menú de ${esc(usuario.apodo)}"><span class="usuario-icono" aria-hidden="true">👤</span><span class="usuario-apodo">${esc(usuario.apodo)}</span><span aria-hidden="true">▾</span></button>
        <div class="join-menu menu-usuario" id="usuario-menu" hidden>
          ${enPanel ? '' : `<a class="solo-movil" href="${url('rifas')}">Rifas</a>`}
          ${opciones.map(([id, texto]) => `<a href="${url(id)}">${texto}</a>`).join('\n          ')}
          <button type="button" data-cerrar-sesion>Cerrar sesión</button>
        </div>
      </div>`;
}

function headerPublico(usuario, idRuta) {
  // PENDIENTE (docs/PROGRESO.md): en Inicio, "Cómo funciona" y "Preguntas" bajan a su sección mientras
  // sus páginas estén en construcción. Al construirlas en el Paso 4, usar url('comoFunciona') y url('preguntas') también aquí.
  const enInicio = idRuta === 'inicio';
  const comoFunciona = enInicio ? '#como-funciona' : url('comoFunciona');
  const preguntas = enInicio ? '#faq' : url('preguntas');
  let enlaces;
  if (!usuario) {
    enlaces = `
      <a href="${url('rifas')}">Rifas</a>
      <a href="${comoFunciona}">Cómo funciona</a>
      <a href="${url('ganadores')}">Ganadores</a>
      <a href="${preguntas}">Preguntas</a>${menuParticipar(idRuta)}`;
  } else if (usuario.rol === 'ADMIN') {
    enlaces = `
      <a href="${url('rifas')}">Rifas</a>
      <a href="${comoFunciona}">Cómo funciona</a>
      <a href="${url('admin')}" class="btn btn-ghost btn-sm solo-escritorio">Panel de administración</a>${menuUsuario(usuario)}`;
  } else {
    enlaces = `
      <a href="${url('rifas')}">Rifas</a>
      <a href="${url('misRifas')}">Mis rifas</a>
      <a href="${url('billetera')}" class="btn btn-ghost btn-sm saldo" aria-label="Saldo disponible"><span><span data-saldo>…</span> <span class="saldo-unidad">Chances</span></span></a>
      <a href="${url('recargar')}" class="btn btn-primary btn-sm solo-escritorio">Recargar</a>${menuUsuario(usuario)}`;
  }
  return `
  <div class="wrap nav">
    ${logo(url('inicio'))}
    <nav class="nav-links">${enlaces}
    </nav>
  </div>
`;
}

function headerVolver() {
  return `
  <div class="wrap nav">
    ${logo(url('inicio'))}
    <a href="${url('inicio')}" class="back">← Volver al inicio</a>
  </div>
`;
}

function headerAdmin(usuario) {
  return `
  <div class="admin-wrap nav">
    <div class="admin-marca">
      ${logo(url('admin'))}
      <span class="admin-modo">Modo <span class="admin-modo-largo">administrador</span><span class="admin-modo-corto">admin</span></span>
    </div>
    <nav class="nav-links">
      <a href="${url('inicio')}" class="btn btn-ghost btn-sm solo-escritorio">Ver sitio</a>${menuUsuario(usuario, true)}
    </nav>
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

/** Vuelve a leer el saldo disponible y lo muestra en el header (llamar después de poner puntos o recargar). */
export async function actualizarSaldo() {
  const chip = document.querySelector('.saldo');
  if (!chip) return;
  try {
    const { disponible } = await billeteraService.obtener();
    chip.querySelector('[data-saldo]').textContent = disponible.toLocaleString('es-PE');
    chip.querySelector('.saldo-unidad').textContent = disponible === 1 ? 'Chance' : 'Chances';
    chip.setAttribute('aria-label', `Saldo disponible: ${puntos(disponible)}. Ver mi billetera`);
  } catch {
    chip.querySelector('[data-saldo]').textContent = '—';
  }
}

/**
 * @param {HTMLElement} header elemento <header> vacío donde se dibuja
 * @param {{ layout: 'publico'|'volver'|'admin', usuario: object|null, idRuta?: string }} opciones
 */
export function montarHeader(header, { layout, usuario, idRuta }) {
  header.innerHTML = layout === 'volver' ? headerVolver()
    : layout === 'admin' ? headerAdmin(usuario)
    : headerPublico(usuario, idRuta);
  if (layout === 'admin') header.classList.add('admin-header');
  activarMenu(header, 'join-btn', 'join-menu');
  activarMenu(header, 'usuario-btn', 'usuario-menu');
  header.querySelector('[data-cerrar-sesion]')?.addEventListener('click', async () => {
    await authService.cerrarSesion();
    location.href = url('inicio');
  });
  if (usuario?.rol === 'PARTICIPANTE' && layout === 'publico') actualizarSaldo();
}
