// Ganadores (/ganadores): rifas realizadas, más reciente primero. Lista · vacío.
// Muestra el apodo del ganador, la opción ganadora y en qué va el premio (solo fechas: el detalle es interno).
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, recurso } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { fechaLarga } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeRifa } from '../components/tarjeta-rifa.js';

const seccion = document.getElementById('ganadores');
const { permitido } = await listo;

/** En qué va el premio, solo con fechas (README §7.12). */
function premio(r) {
  const e = r.entrega ?? {};
  if (e.entregadoEl) return `Premio entregado el ${fechaLarga(e.entregadoEl)}`;
  if (e.enviadoEl) return 'Premio en camino';
  if (e.compradoEl) return `Premio comprado el ${fechaLarga(e.compradoEl)}`;
  return 'Comprando el premio a nombre del ganador';
}

function tarjeta(r) {
  return `
    <article class="card ganador">
      ${r.producto.imagen
        ? `<div class="ganador-img"><img src="${esc(recurso(r.producto.imagen))}" alt="" loading="lazy"></div>`
        : `<div class="ganador-img" aria-hidden="true"><span>${r.producto.emoji}</span></div>`}
      <div class="ganador-cuerpo">
        <p class="ganador-categoria">${esc(r.categoria)}</p>
        <h2><a href="${url('rifa', { slug: r.slug })}">${esc(r.producto.nombre)}</a></h2>
        <p class="ganador-apodo"><span aria-hidden="true">🏆</span> <b>${esc(r.ganadorApodo)}</b></p>
        <dl class="datos">
          ${r.sorteo ? `<div><dt>Se rifó el</dt><dd>${esc(fechaLarga(r.sorteo.fecha))}</dd></div>
          <div><dt>Opción ganadora</dt><dd>#${r.sorteo.ticketGanador.toLocaleString('es-PE')}</dd></div>` : ''}
          <div><dt>Personas</dt><dd>${r.participantes.toLocaleString('es-PE')}</dd></div>
        </dl>
        <p class="ganador-premio">${esc(premio(r))}</p>
        <div class="ganador-pie">
          ${badgeRifa({ ...r, ganadorApodo: undefined })}
          <a class="enlace" href="${url('rifa', { slug: r.slug })}#transparencia">Ver cómo se eligió al ganador</a>
        </div>
        <p class="ganador-id">ID: ${esc(r.codigo)}</p>
      </div>
    </article>`;
}

if (permitido) {
  cargarSeccion(seccion, {
    textoCargando: 'Cargando ganadores…',
    cargar: () => rifasService.ganadores(),
    vacio: {
      icono: '🏆', titulo: 'Todavía no hay ganadores',
      texto: 'Cuando se realice la primera rifa, aquí verás quién ganó y cómo se eligió.',
      accion: { texto: 'Ver rifas', href: url('rifas') },
    },
    mostrar: rifas => {
      seccion.innerHTML = `
        <p class="filtros-total">${rifas.length} ${rifas.length === 1 ? 'rifa realizada' : 'rifas realizadas'}</p>
        <div class="ganadores">${rifas.map(tarjeta).join('')}</div>`;
    },
  });
}
