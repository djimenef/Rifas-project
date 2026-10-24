// Listado de rifas (/rifas): búsqueda y filtros por estado y categoría.
// Solo muestra rifas listadas: RifasService.listar nunca devuelve las que van por enlace (invariante 19).
// Los filtros viven en la URL (?q=&estado=&categoria=) para que el listado filtrado se pueda compartir.
import { listo } from '../layout.js';
import { rifasService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { tarjetaRifa } from '../components/tarjeta-rifa.js';
import { NOMBRE_VISIBLE } from '../components/badge.js';
import { ESTADOS_VISIBLES } from '../domain/rifa.js';
import { cargarSeccion } from '../components/estados.js';

/** Estados visibles que aparecen en el listado público, en el orden del ciclo de vida (cada uno agrupa estados internos). */
const ESTADOS_FILTRO = ['ARMANDOSE', 'CONFIRMADA', 'CERRADA', 'REALIZADA', 'ENTREGADA', 'DESCARTADA'];

const form = document.getElementById('filtros');
const busqueda = document.getElementById('busqueda');
const filtroEstado = document.getElementById('filtro-estado');
const filtroCategoria = document.getElementById('filtro-categoria');
const total = document.getElementById('total');
const listado = document.getElementById('listado');

filtroEstado.insertAdjacentHTML('beforeend', ESTADOS_FILTRO.map(e => `<option value="${e}">${esc(NOMBRE_VISIBLE[e])}</option>`).join(''));
busqueda.value = parametro('q') ?? '';
filtroEstado.value = ESTADOS_FILTRO.includes(parametro('estado')) ? parametro('estado') : '';

await listo;

let categorias = [];
try {
  categorias = await rifasService.listarCategorias();
  filtroCategoria.insertAdjacentHTML('beforeend', categorias.map(c => `<option value="${esc(c.id)}">${c.icono} ${esc(c.nombre)}</option>`).join(''));
  filtroCategoria.value = categorias.some(c => c.id === parametro('categoria')) ? parametro('categoria') : '';
} catch { /* sin categorías, el filtro queda en "Todas" */ }

const hayFiltros = () => !!(busqueda.value.trim() || filtroEstado.value || filtroCategoria.value);

const grilla = rifas => `<div class="draws">${rifas.map(r => tarjetaRifa(r, { detalle: true })).join('')}</div>`;

/** Sin categoría elegida, el listado se agrupa por categoría (en el orden del catálogo). */
function porCategoria(rifas) {
  const orden = id => { const i = categorias.findIndex(c => c.id === id); return i < 0 ? categorias.length : i; };
  const grupos = Map.groupBy(rifas.toSorted((a, b) => orden(a.categoriaId) - orden(b.categoriaId)), r => r.categoriaId);
  return [...grupos].map(([id, lista]) => {
    const c = categorias.find(x => x.id === id);
    return `
    <section class="grupo-categoria" aria-labelledby="cat-${esc(id)}">
      <h2 class="grupo-titulo" id="cat-${esc(id)}">${c ? `${c.icono} ${esc(c.nombre)}` : esc(lista[0].categoria)} <span>${lista.length}</span></h2>
      ${grilla(lista)}
    </section>`;
  }).join('');
}

function cargar() {
  const filtro = { busqueda: busqueda.value.trim(), estados: filtroEstado.value ? ESTADOS_VISIBLES[filtroEstado.value].internos : [], categoriaId: filtroCategoria.value };
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
      listado.innerHTML = `<div class="listado-rifas">${filtro.categoriaId ? grilla(rifas) : porCategoria(rifas)}</div>`;
    },
  });
}

let espera;
busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
filtroEstado.addEventListener('change', cargar);
filtroCategoria.addEventListener('change', cargar);
form.addEventListener('submit', e => { e.preventDefault(); clearTimeout(espera); cargar(); });

cargar();
