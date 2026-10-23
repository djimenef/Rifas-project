// Listado de rifas (/rifas): búsqueda y filtros por estado y categoría.
// Solo muestra rifas listadas: RifasService.listar nunca devuelve las que van por enlace (invariante 19).
// Los filtros viven en la URL (?q=&estado=&categoria=) para que el listado filtrado se pueda compartir.
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { tarjetaRifa } from '../components/tarjeta-rifa.js';
import { NOMBRE_ESTADO } from '../components/badge.js';
import { cargarSeccion } from '../components/estados.js';

/** Estados que aparecen en el listado público, en el orden del ciclo de vida. */
const ESTADOS_FILTRO = ['ARMANDO', 'ABIERTA', 'CERRADA', 'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA', 'NO_SE_ARMO', 'CANCELADA'];

const form = document.getElementById('filtros');
const busqueda = document.getElementById('busqueda');
const filtroEstado = document.getElementById('filtro-estado');
const filtroCategoria = document.getElementById('filtro-categoria');
const total = document.getElementById('total');
const listado = document.getElementById('listado');

filtroEstado.insertAdjacentHTML('beforeend', ESTADOS_FILTRO.map(e => `<option value="${e}">${esc(NOMBRE_ESTADO[e])}</option>`).join(''));
busqueda.value = parametro('q') ?? '';
filtroEstado.value = ESTADOS_FILTRO.includes(parametro('estado')) ? parametro('estado') : '';

await listo;

try {
  const categorias = await rifasService.listarCategorias();
  filtroCategoria.insertAdjacentHTML('beforeend', categorias.map(c => `<option value="${esc(c.id)}">${c.icono} ${esc(c.nombre)}</option>`).join(''));
  filtroCategoria.value = categorias.some(c => c.id === parametro('categoria')) ? parametro('categoria') : '';
} catch { /* sin categorías, el filtro queda en "Todas" */ }

const hayFiltros = () => !!(busqueda.value.trim() || filtroEstado.value || filtroCategoria.value);

function cargar() {
  const filtro = { busqueda: busqueda.value.trim(), estados: filtroEstado.value ? [filtroEstado.value] : [], categoriaId: filtroCategoria.value };
  const query = new URLSearchParams(Object.entries({ q: filtro.busqueda, estado: filtroEstado.value, categoria: filtro.categoriaId }).filter(([, v]) => v));
  history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
  total.textContent = '';
  cargarSeccion(listado, {
    textoCargando: 'Cargando rifas…',
    cargar: () => rifasService.listar(filtro),
    vacio: hayFiltros()
      ? { icono: '🔍', titulo: 'No encontramos rifas con esos filtros', texto: 'Prueba con otra búsqueda, estado o categoría.', accion: { texto: 'Ver todas las rifas', href: url('rifas') } }
      : { titulo: 'Todavía no hay rifas', texto: 'Vuelve pronto: publicamos rifas nuevas cada semana.' },
    mostrar: rifas => {
      total.textContent = `${rifas.length} ${rifas.length === 1 ? 'rifa' : 'rifas'}`;
      listado.innerHTML = `<div class="listado-rifas"><div class="draws">${rifas.map(r => tarjetaRifa(r, { detalle: true })).join('')}</div></div>`;
    },
  });
}

let espera;
busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
filtroEstado.addEventListener('change', cargar);
filtroCategoria.addEventListener('change', cargar);
form.addEventListener('submit', e => { e.preventDefault(); clearTimeout(espera); cargar(); });

cargar();
