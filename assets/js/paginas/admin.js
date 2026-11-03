// Admin · Dashboard (/admin): recaudado, Chances retenidas, rifas por estado y lo que necesita atención.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, enlazarRutas } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos } from '../lib/formato.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';
import { ESTADOS_VISIBLES } from '../domain/rifa.js';

const seccion = document.getElementById('dashboard');
const { permitido } = await listo;

const suma = (porEstado, estados) => estados.reduce((t, e) => t + (porEstado[e] ?? 0), 0);

/** Tareas del equipo: cada una lleva a la sección donde se resuelve. */
const PENDIENTES = [
  { estados: ['CERRADA', 'EN_REVISION'], icono: '🔎', texto: 'Rifas cerradas por revisar', ruta: 'adminRevision' },
  { estados: ['PROGRAMADA'], icono: '🎲', texto: 'Rifas con fecha para rifar', ruta: 'adminSorteos' },
  { estados: ['SORTEADA', 'COMPRANDO', 'EN_CAMINO'], icono: '📦', texto: 'Premios por comprar o entregar', ruta: 'adminEntregas' },
  { estados: ['REVISION_LINK', 'PROPUESTA'], icono: '📝', texto: 'Propuestas por validar', ruta: 'adminPropuestas' },
  { estados: ['BORRADOR'], icono: '✏️', texto: 'Borradores sin publicar', ruta: 'adminRifas', parametros: { estado: 'BORRADOR' } },
];

function dibujar(d) {
  const r = d.rifasPorEstado;
  const tarjetas = [
    ['Recaudado en recargas', soles(d.recaudado), 'Recargas aprobadas.'],
    ['Chances retenidas', puntos(d.retenidoTotal), 'En rifas que se están armando o sugeridas.'],
    ['Rifas armándose', r.ARMANDO ?? 0, 'Reciben Chances ahora.'],
    ['Rifas confirmadas', r.ABIERTA ?? 0, 'Abiertas, con tiempo para unirse.'],
  ];
  const pendientes = PENDIENTES.map(p => ({ ...p, total: suma(r, p.estados) }));
  seccion.innerHTML = `
    <div class="dash-cifras">
      ${tarjetas.map(([t, v, n]) => `
      <div class="card dash-cifra">
        <small>${esc(t)}</small>
        <b>${esc(String(v))}</b>
        <p>${esc(n)}</p>
      </div>`).join('')}
    </div>

    <div class="admin-detalle">
      <section class="card" aria-labelledby="pendientes-titulo">
        <h2 id="pendientes-titulo">Necesita tu atención</h2>
        <ul class="dash-pendientes">
          ${pendientes.map(p => `
          <li><a href="${url(p.ruta, p.parametros)}"${p.total ? '' : ' class="dash-cero"'}>
            <span><span aria-hidden="true">${p.icono}</span> ${esc(p.texto)}</span><b>${p.total}</b>
          </a></li>`).join('')}
        </ul>
      </section>

      <section class="card" aria-labelledby="estados-titulo">
        <h2 id="estados-titulo">Rifas por estado</h2>
        <p class="admin-nota">Agrupadas como las ve el público. Haz clic en un estado interno para ver sus rifas.</p>
        <dl class="datos dash-estados">
          ${Object.values(ESTADOS_VISIBLES).map(v => `
          <div><dt>${esc(v.nombre)}</dt><dd>${suma(r, v.internos)}</dd></div>
          ${v.internos.length > 1 ? v.internos.map(e => `
          <div class="dash-interno"><dt><a class="enlace" href="${url('adminRifas', { estado: e })}">${esc(NOMBRE_ESTADO[e])}</a></dt><dd>${r[e] ?? 0}</dd></div>`).join('') : ''}`).join('')}
          <div><dt><a class="enlace" href="${url('adminRifas', { estado: 'BORRADOR' })}">${esc(NOMBRE_ESTADO.BORRADOR)}</a></dt><dd>${r.BORRADOR ?? 0}</dd></div>
        </dl>
      </section>
    </div>`;
}

if (permitido) {
  enlazarRutas();
  cargarSeccion(seccion, {
    textoCargando: 'Cargando el resumen…',
    cargar: () => adminService.dashboard(),
    esVacio: () => false,
    mostrar: dibujar,
  });
}
