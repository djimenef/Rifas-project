// Admin · Sorteos (/admin/sorteos): rifas con fecha para rifar y rifas ya realizadas.
// Filtro (?vista=por-rifar|realizadas) y búsqueda; cada fila lleva a Rifar (elegir ganador).
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { opciones, fechaHora } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin } from '../components/admin-rifas.js';
import { ESTADOS_CON_GANADOR } from '../domain/rifa.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const VISTAS = {
  'por-rifar': { texto: 'Por rifar', estados: ['PROGRAMADA'] },
  realizadas: { texto: 'Realizadas', estados: ESTADOS_CON_GANADOR },
};
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function fila(r) {
  const realizada = ESTADOS_CON_GANADOR.includes(r.estado);
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">${r.producto.emoji}</span>
        <div><a href="${url('adminSorteo', { codigo: r.codigo })}">${esc(r.producto.nombre)}</a><small>${esc(r.codigo)} · ${esc(r.categoria)}</small></div></div></td>
      <td>${badgeAdmin(r)}</td>
      <td>${esc(realizada ? (r.sorteo?.fecha ? fechaHora(r.sorteo.fecha) : '—') : (r.fechaSorteo ? fechaHora(r.fechaSorteo) : '—'))}</td>
      <td class="num">${opciones(r.opcionesVendidas)}</td>
      <td>${realizada ? `${esc(r.ganadorApodo ?? '—')} <small class="admin-nota">#${r.sorteo?.ticketGanador ?? '—'}</small>` : '—'}</td>
      <td><div class="tabla-acciones">
        <a class="btn ${realizada ? 'btn-ghost' : 'btn-primary'} btn-sm" href="${url('adminSorteo', { codigo: r.codigo })}">${realizada ? 'Ver resultado' : 'Rifar'}</a>
      </div></td>
    </tr>`;
}

function listado() {
  const vistaInicial = VISTAS[parametro('vista')] ? parametro('vista') : 'por-rifar';
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Sorteos</h1>
        <p class="pagina-sub">Rifas cerradas con fecha anunciada, listas para la Rifa en vivo, y rifas ya realizadas con su resultado verificable.</p>
      </div>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar sorteos">
      <label>Buscar<input type="search" id="busqueda" placeholder="Nombre, código o ganador" autocomplete="off"></label>
      <label>Mostrar<select id="vista">${Object.entries(VISTAS).map(([k, v]) => `<option value="${k}">${esc(v.texto)}</option>`).join('')}</select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const vista = pagina.querySelector('#vista');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  vista.value = vistaInicial;

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ vista: vista.value, q: busqueda.value.trim() }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + '?' + query);
    const realizadas = vista.value === 'realizadas';
    cargarSeccion(tabla, {
      textoCargando: 'Cargando…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        const rifas = (await adminService.listarRifas()).filter(r => VISTAS[vista.value].estados.includes(r.estado));
        return rifas
          .filter(r => !q || [r.producto.nombre, r.codigo, r.ganadorApodo].some(t => normalizar(t).includes(q)))
          .sort((a, b) => realizadas
            ? (b.sorteo?.fecha ?? '').localeCompare(a.sorteo?.fecha ?? '')
            : (a.fechaSorteo ?? '').localeCompare(b.fechaSorteo ?? ''));
      },
      vacio: realizadas
        ? { icono: '🏆', titulo: 'Todavía no hay rifas realizadas', texto: 'Cuando elijas al ganador de una rifa, aparecerá aquí.' }
        : { icono: '📅', titulo: 'No hay rifas por rifar', texto: 'Aprueba una rifa cerrada en la cola de revisión para anunciar su fecha.', accion: { texto: 'Ir a la cola de revisión', href: url('adminRevision') } },
      mostrar: rifas => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${rifas.length} ${rifas.length === 1 ? 'rifa' : 'rifas'}</caption>
              <thead><tr>
                <th scope="col">Rifa</th><th scope="col">Estado</th><th scope="col">${realizadas ? 'Se rifó' : 'Se rifa'}</th>
                <th scope="col" class="num">Opciones</th><th scope="col">Ganador</th><th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${rifas.map(fila).join('')}</tbody>
            </table>
          </div>`;
      },
    });
  };

  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  vista.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
  cargar();
}

if (permitido) listado();
