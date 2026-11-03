// Admin · Compras y entregas (/admin/entregas): rifas realizadas y en qué va su premio.
// Filtro por estado (?estado=) y búsqueda; cada fila lleva al registro de compra, envío y entrega (README §7.12).
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { fechaHora } from '../lib/formato.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';
import { ESTADOS_CON_GANADOR } from '../domain/rifa.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

/** Siguiente registro que toca en cada estado. */
const SIGUIENTE = { SORTEADA: 'Registrar compra', COMPRANDO: 'Registrar envío', EN_CAMINO: 'Registrar entrega' };
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function ultimoPaso(r) {
  const { compra, envio, entrega } = r.registros ?? {};
  if (entrega) return `Entregado el ${fechaHora(entrega.fecha)}`;
  if (envio) return `${envio.modalidad === 'RECOJO' ? 'Recojo en tienda' : `Courier ${envio.courier}`} · llega el ${fechaHora(envio.fechaEstimada)}`;
  if (compra) return `Comprado el ${fechaHora(compra.fecha)} en ${compra.tienda}`;
  return r.sorteo?.fecha ? `Se rifó el ${fechaHora(r.sorteo.fecha)}` : '—';
}

function fila(r) {
  const siguiente = SIGUIENTE[r.estado];
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">${r.producto.emoji}</span>
        <div><a href="${url('adminEntrega', { codigo: r.codigo })}">${esc(r.producto.nombre)}</a><small>${esc(r.codigo)} · ${esc(r.categoria)}</small></div></div></td>
      <td><span class="badge">${esc(NOMBRE_ESTADO[r.estado])}</span></td>
      <td>${esc(r.ganadorApodo ?? '—')}</td>
      <td>${esc(ultimoPaso(r))}</td>
      <td><div class="tabla-acciones">
        <a class="btn ${siguiente ? 'btn-primary' : 'btn-ghost'} btn-sm" href="${url('adminEntrega', { codigo: r.codigo })}">${siguiente ?? 'Ver registro'}</a>
      </div></td>
    </tr>`;
}

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Compras y entregas</h1>
        <p class="pagina-sub">La compra del premio se hace fuera de la plataforma, a nombre del ganador. Aquí se registra cada paso: compra, envío y entrega con DNI verificado.</p>
      </div>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar premios">
      <label>Buscar<input type="search" id="busqueda" placeholder="Nombre, código o ganador" autocomplete="off"></label>
      <label>Estado<select id="filtro-estado"><option value="">Pendientes (sin entregar)</option>
        ${ESTADOS_CON_GANADOR.map(e => `<option value="${e}">${esc(NOMBRE_ESTADO[e])}</option>`).join('')}
        <option value="TODAS">Todas</option></select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const estado = pagina.querySelector('#filtro-estado');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  estado.value = [...ESTADOS_CON_GANADOR, 'TODAS'].includes(parametro('estado')) ? parametro('estado') : '';

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), estado: estado.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    const estados = estado.value === 'TODAS' ? ESTADOS_CON_GANADOR
      : estado.value ? [estado.value] : ESTADOS_CON_GANADOR.filter(e => e !== 'ENTREGADA');
    cargarSeccion(tabla, {
      textoCargando: 'Cargando premios…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        return (await adminService.listarRifas())
          .filter(r => estados.includes(r.estado))
          .filter(r => !q || [r.producto.nombre, r.codigo, r.ganadorApodo].some(t => normalizar(t).includes(q)))
          .sort((a, b) => ESTADOS_CON_GANADOR.indexOf(a.estado) - ESTADOS_CON_GANADOR.indexOf(b.estado));
      },
      vacio: { icono: '📦', titulo: 'No hay premios con esos filtros', texto: 'Cuando se elija al ganador de una rifa, su premio aparecerá aquí.' },
      mostrar: rifas => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${rifas.length} ${rifas.length === 1 ? 'premio' : 'premios'}</caption>
              <thead><tr>
                <th scope="col">Rifa</th><th scope="col">Estado</th><th scope="col">Ganador</th><th scope="col">Último paso</th>
                <th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${rifas.map(fila).join('')}</tbody>
            </table>
          </div>`;
      },
    });
  };

  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  estado.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
  cargar();
}

if (permitido) listado();
