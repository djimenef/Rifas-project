// Admin · Categorías (/admin/categorias): listado con filtro por estado y búsqueda · crear · editar · activar o desactivar.
// Una categoría inactiva no aparece en los filtros públicos; sus rifas siguen existiendo.
// Las reglas (nombre obligatorio y único) las aplica AdminService.guardarCategoria.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { cargarSeccion } from '../components/estados.js';
import { modalAccion } from '../components/admin-rifas.js';
import { mostrarToast } from '../components/toast.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function fila(c) {
  return `
    <tr>
      <td class="num">${c.orden}</td>
      <td><div class="tabla-rifa"><span aria-hidden="true">${esc(c.icono)}</span><div><span class="tabla-nombre">${esc(c.nombre)}</span></div></div></td>
      <td>${c.activa ? '<span class="badge badge-estado" data-estado="CONFIRMADA">Activa</span>' : '<span class="badge">Inactiva</span>'}</td>
      <td class="num"><a class="enlace" href="${url('adminProductos', { categoria: c.id })}">${c.rifas}</a></td>
      <td><div class="tabla-acciones">
        <button type="button" class="btn btn-ghost btn-sm" data-editar="${esc(c.id)}">Editar</button>
        <button type="button" class="btn btn-ghost btn-sm" data-alternar="${esc(c.id)}">${c.activa ? 'Desactivar' : 'Activar'}</button>
      </div></td>
    </tr>`;
}

/** Crear (sin categoría) o editar. */
function formulario(c, total, alTerminar) {
  modalAccion({
    titulo: c ? 'Editar categoría' : 'Nueva categoría',
    contenido: `
      <div class="two">
        <label>Nombre<input type="text" name="nombre" value="${esc(c?.nombre ?? '')}" maxlength="40" required></label>
        <label>Ícono<input type="text" name="icono" value="${esc(c?.icono ?? '🎁')}" maxlength="4" required>
          <span class="field-hint">Un emoji.</span></label>
      </div>
      <label>Orden en los filtros<input type="text" class="campo-numero" name="orden" inputmode="numeric" value="${c?.orden ?? total + 1}"></label>
      <label class="check"><input type="checkbox" name="activa"${c?.activa === false ? '' : ' checked'}> Activa (aparece en los filtros públicos)</label>`,
    textoBoton: c ? 'Guardar cambios' : 'Crear categoría',
    enviar: async dialog => {
      const valor = n => dialog.querySelector(`[name="${n}"]`);
      const orden = Number(valor('orden').value);
      const guardada = await adminService.guardarCategoria({
        ...(c ? { id: c.id } : {}),
        nombre: valor('nombre').value, icono: valor('icono').value.trim() || '🎁',
        orden: Number.isInteger(orden) && orden > 0 ? orden : (c?.orden ?? total + 1), activa: valor('activa').checked,
      });
      return c ? `Categoría ${guardada.nombre} actualizada.` : `Categoría ${guardada.nombre} creada.`;
    },
    alTerminar,
  });
}

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Categorías</h1>
        <p class="pagina-sub">Agrupan las rifas en el listado público y en sus filtros, en el orden indicado.</p>
      </div>
      <button type="button" class="btn btn-primary" id="nueva">+ Nueva categoría</button>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar categorías">
      <label>Buscar<input type="search" id="busqueda" placeholder="Nombre" autocomplete="off"></label>
      <label>Estado<select id="estado"><option value="">Todas</option><option value="activas">Activas</option><option value="inactivas">Inactivas</option></select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const estado = pagina.querySelector('#estado');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  estado.value = ['activas', 'inactivas'].includes(parametro('estado')) ? parametro('estado') : '';
  let total = 0;

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), estado: estado.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    cargarSeccion(tabla, {
      textoCargando: 'Cargando categorías…',
      cargar: async () => {
        const [categorias, rifas] = await Promise.all([adminService.listarCategorias(), adminService.listarRifas()]);
        total = categorias.length;
        const q = normalizar(busqueda.value.trim());
        return categorias
          .map(c => ({ ...c, rifas: rifas.filter(r => r.categoriaId === c.id).length }))
          .filter(c => !estado.value || (estado.value === 'activas') === c.activa)
          .filter(c => !q || normalizar(c.nombre).includes(q));
      },
      vacio: { icono: '🗂️', titulo: 'No hay categorías con esos filtros', texto: 'Prueba con otra búsqueda o crea una nueva.' },
      mostrar: categorias => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${categorias.length} ${categorias.length === 1 ? 'categoría' : 'categorías'}</caption>
              <thead><tr>
                <th scope="col" class="num">Orden</th><th scope="col">Categoría</th><th scope="col">Estado</th>
                <th scope="col" class="num">Rifas</th><th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${categorias.map(fila).join('')}</tbody>
            </table>
          </div>`;
        const buscar = id => categorias.find(c => c.id === id);
        tabla.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => formulario(buscar(b.dataset.editar), total, cargar)));
        tabla.querySelectorAll('[data-alternar]').forEach(b => b.addEventListener('click', async () => {
          const { rifas, ...c } = buscar(b.dataset.alternar);
          b.disabled = true;
          try {
            await adminService.guardarCategoria({ ...c, activa: !c.activa });
            mostrarToast(`${c.nombre}: ${c.activa ? 'desactivada' : 'activada'}.`);
            cargar();
          } catch (e) {
            b.disabled = false;
            mostrarToast(e.message, { tipo: 'error' });
          }
        }));
      },
    });
  };

  pagina.querySelector('#nueva').addEventListener('click', () => formulario(null, total, cargar));
  let espera;
  busqueda.addEventListener('input', () => { clearTimeout(espera); espera = setTimeout(cargar, 300); });
  estado.addEventListener('change', cargar);
  pagina.querySelector('#filtros').addEventListener('submit', e => { e.preventDefault(); cargar(); });
  cargar();
}

if (permitido) listado();
