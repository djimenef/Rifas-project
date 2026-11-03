// Admin · Productos (/admin/productos): el producto de cada rifa, con su precio referencial, tienda y link.
// Listado con filtro por categoría y búsqueda · crear (va a Nueva rifa) · editar título y precio.
// Cada rifa tiene su propio producto (README §7.11): el título se puede corregir siempre; el precio solo antes
// de que la rifa sea pública, porque de él sale la meta (lo valida AdminService.actualizarProducto).
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin, modalAccion } from '../components/admin-rifas.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

/** Estados en los que el precio todavía se puede corregir (la meta no cambia con la rifa ya pública). */
const PRECIO_EDITABLE = ['BORRADOR', 'REVISION_LINK', 'CAPTANDO', 'PROPUESTA'];
const ESTADO_LINK = { VALIDO: 'Válido', EN_REVISION: 'En revisión', REEMPLAZADO: 'Reemplazado' };
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tienda = link => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return '—'; } };

function fila(r) {
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">${r.producto.emoji}</span>
        <div><span class="tabla-nombre">${esc(r.producto.nombre)}</span><small>${esc(r.categoria)}</small></div></div></td>
      <td class="num">${soles(r.producto.precioTienda)}</td>
      <td><span class="texto-mono">${esc(tienda(r.linkCompra))}</span></td>
      <td>${esc(ESTADO_LINK[r.estadoLink] ?? r.estadoLink)}</td>
      <td><a class="enlace" href="${url('adminRifas', { codigo: r.codigo })}">${esc(r.codigo)}</a><br>${badgeAdmin(r)}</td>
      <td><div class="tabla-acciones">
        <button type="button" class="btn btn-ghost btn-sm" data-editar="${esc(r.id)}">Editar</button>
      </div></td>
    </tr>`;
}

function editar(r, alTerminar) {
  const precioEditable = PRECIO_EDITABLE.includes(r.estado);
  modalAccion({
    titulo: 'Editar producto',
    contenido: `
      <p class="modal-texto">Corrige el título leído del link si trae texto de más (códigos, emojis, palabras de marketing).</p>
      <label>Título visible<input type="text" name="nombre" value="${esc(r.producto.nombre)}" maxlength="120" required></label>
      <label>Precio referencial (S/)<input type="text" name="precioTienda" inputmode="decimal" value="${r.producto.precioTienda}"${precioEditable ? '' : ' disabled'}>
        ${precioEditable ? '<span class="field-hint">Al cambiarlo se recalcula la meta.</span>'
          : '<span class="field-hint">La rifa ya es pública: el precio y la meta no cambian. Si el producto cambió de precio, se entrega uno equivalente.</span>'}</label>
      <p class="modal-nota">Link de compra: <span class="texto-mono">${esc(r.linkCompra)}</span></p>`,
    textoBoton: 'Guardar cambios',
    enviar: async dialog => {
      const nombre = dialog.querySelector('[name="nombre"]').value;
      const cambios = { nombre };
      if (precioEditable) {
        const precio = dialog.querySelector('[name="precioTienda"]').value.replace(',', '.');
        if (Number(precio) !== r.producto.precioTienda) cambios.precioTienda = precio.trim() === '' ? NaN : Number(precio);
      }
      await adminService.actualizarProducto(r.id, cambios);
      return 'Producto actualizado.';
    },
    alTerminar,
  });
}

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Productos</h1>
        <p class="pagina-sub">El producto de cada rifa: título visible, precio referencial y tienda. El público ve el producto, no necesariamente la tienda.</p>
      </div>
      <a class="btn btn-primary" href="${url('adminRifaNueva')}">+ Nuevo producto</a>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar productos">
      <label>Buscar<input type="search" id="busqueda" placeholder="Producto, tienda o código" autocomplete="off"></label>
      <label>Categoría<select id="categoria"><option value="">Todas las categorías</option></select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const categoria = pagina.querySelector('#categoria');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), categoria: categoria.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    cargarSeccion(tabla, {
      textoCargando: 'Cargando productos…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        return (await adminService.listarRifas())
          .filter(r => !categoria.value || r.categoriaId === categoria.value)
          .filter(r => !q || [r.producto.nombre, r.codigo, tienda(r.linkCompra)].some(t => normalizar(t).includes(q)))
          .sort((a, b) => a.producto.nombre.localeCompare(b.producto.nombre, 'es'));
      },
      vacio: { icono: '🛍️', titulo: 'No hay productos con esos filtros', texto: 'Prueba con otra categoría o búsqueda.' },
      mostrar: rifas => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${rifas.length} ${rifas.length === 1 ? 'producto' : 'productos'}</caption>
              <thead><tr>
                <th scope="col">Producto</th><th scope="col" class="num">Precio referencial</th><th scope="col">Tienda</th>
                <th scope="col">Link</th><th scope="col">Rifa</th><th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${rifas.map(fila).join('')}</tbody>
            </table>
          </div>`;
        tabla.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => editar(rifas.find(r => r.id === b.dataset.editar), cargar)));
      },
    });
  };

  adminService.listarCategorias().then(categorias => {
    categoria.insertAdjacentHTML('beforeend', categorias.map(c => `<option value="${esc(c.id)}">${c.icono} ${esc(c.nombre)}</option>`).join(''));
    categoria.value = categorias.some(c => c.id === parametro('categoria')) ? parametro('categoria') : '';
  }).catch(() => {}).finally(cargar);

  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  categoria.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
}

if (permitido) listado();
