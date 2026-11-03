// Admin · Propuestas (/admin/propuestas): propuestas de participantes y creadores que esperan al equipo (Fase 2).
// - Link en revisión (REVISION_LINK): validar, reemplazar por un link equivalente de tienda confiable o rechazar.
// - En moderación (PROPUESTA): alcanzaron el umbral de visibilidad; aprobar fijando el margen o descartar con motivo.
// Listado con filtro por estado y búsqueda, acciones por fila y detalle en Admin · Rifas (?codigo=).
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos, fechaHora } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin, modalValidarLink, modalModerar } from '../components/admin-rifas.js';

const pagina = document.getElementById('pagina');
const { permitido } = await listo;

const FILTROS = [
  { valor: '', texto: 'Todas las propuestas' },
  { valor: 'REVISION_LINK', texto: 'Link en revisión' },
  { valor: 'PROPUESTA', texto: 'En moderación (alcanzaron el umbral)' },
];
const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const tienda = link => { try { return new URL(link).hostname.replace(/^www\./, ''); } catch { return '—'; } };
const autor = r => `${esc(r.autorApodo ?? '—')}<small>${r.autor.tipo === 'CREADOR' ? 'Creador verificado' : 'Participante'}${r.codigoAutor ? ` · ${esc(r.codigoAutor)}` : ''}</small>`;

function apoyo(r) {
  if (r.estado === 'REVISION_LINK') return '<span class="admin-nota">Sin Chances: no recibe hasta validar el link</span>';
  return `${puntos(r.puntosReunidos)} / ${puntos(r.umbral)}<small>${r.participantes.toLocaleString('es-PE')} / ${r.config.umbralMinParticipantes} personas</small>`;
}

function fila(r) {
  const accion = r.estado === 'REVISION_LINK'
    ? `<button type="button" class="btn btn-primary btn-sm" data-validar="${esc(r.id)}">Validar link</button>`
    : `<button type="button" class="btn btn-primary btn-sm" data-moderar="${esc(r.id)}">Moderar</button>`;
  return `
    <tr>
      <td><div class="tabla-rifa"><span aria-hidden="true">${r.producto.emoji}</span>
        <div><a href="${url('adminRifas', { codigo: r.codigo })}">${esc(r.producto.nombre)}</a><small>${esc(r.codigo)} · ${esc(r.categoria)}</small></div></div></td>
      <td><div class="tabla-celda">${autor(r)}</div></td>
      <td><div class="tabla-celda">${badgeAdmin(r)}<small>${r.estado === 'PROPUESTA' ? 'En moderación' : 'Link en revisión'}</small></div></td>
      <td class="num">${soles(r.producto.precioTienda)}</td>
      <td><div class="tabla-celda"><span class="texto-mono">${esc(tienda(r.linkOriginal))}</span>
        <small>${r.estado === 'REVISION_LINK' ? esc(motivoRevision(r)) : 'Tienda confiable'}</small></div></td>
      <td class="num"><div class="tabla-celda">${apoyo(r)}</div></td>
      <td><div class="tabla-acciones">
        ${accion}
        <a class="btn btn-ghost btn-sm" href="${url('adminRifas', { codigo: r.codigo })}">Ver detalle</a>
      </div></td>
    </tr>`;
}

/** Motivo con que la propuesta entró a revisión (queda en el primer registro de su historial). */
const motivoRevision = r => r.historial.find(h => h.hacia === 'REVISION_LINK')?.motivo ?? 'Link por validar';

function listado() {
  pagina.innerHTML = `
    <div class="admin-titulo">
      <div>
        <h1 class="pagina-titulo">Propuestas</h1>
        <p class="pagina-sub">Rifas sugeridas por participantes y creadores. Valida los links dudosos y modera las que juntaron el apoyo mínimo para pasar al portal.</p>
      </div>
    </div>
    <form class="filtros admin-filtros" id="filtros" role="search" aria-label="Filtrar propuestas">
      <label>Buscar<input type="search" id="busqueda" placeholder="Producto, autor o código (RF-…)" autocomplete="off"></label>
      <label>Estado<select id="filtro-estado">${FILTROS.map(f => `<option value="${f.valor}">${esc(f.texto)}</option>`).join('')}</select></label>
    </form>
    <div id="tabla"></div>`;

  const busqueda = pagina.querySelector('#busqueda');
  const estado = pagina.querySelector('#filtro-estado');
  const tabla = pagina.querySelector('#tabla');
  busqueda.value = parametro('q') ?? '';
  estado.value = FILTROS.some(f => f.valor === parametro('estado')) ? parametro('estado') : '';

  const cargar = () => {
    const query = new URLSearchParams(Object.entries({ q: busqueda.value.trim(), estado: estado.value }).filter(([, v]) => v));
    history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
    const filtrado = !!(busqueda.value.trim() || estado.value);
    cargarSeccion(tabla, {
      textoCargando: 'Cargando propuestas…',
      cargar: async () => {
        const q = normalizar(busqueda.value.trim());
        return (await adminService.listarPropuestas())
          .filter(r => !estado.value || r.estado === estado.value)
          .filter(r => !q || [r.producto.nombre, r.codigo, r.autorApodo, r.codigoAutor].some(t => normalizar(t).includes(q)))
          // Primero las que ya juntaron el apoyo (moderación), luego los links; las más antiguas arriba.
          .sort((a, b) => (a.estado === 'PROPUESTA' ? 0 : 1) - (b.estado === 'PROPUESTA' ? 0 : 1) || a.fechas.creada.localeCompare(b.fechas.creada));
      },
      vacio: filtrado
        ? { icono: '🔍', titulo: 'No hay propuestas con esos filtros', texto: 'Prueba con otro estado o búsqueda.' }
        : { icono: '✅', titulo: 'No hay propuestas pendientes', texto: 'Cuando alguien proponga una rifa con un link dudoso, o una Rifa Sugerida junte el apoyo mínimo, aparecerá aquí.', accion: { texto: 'Ver todas las rifas', href: url('adminRifas') } },
      mostrar: rifas => {
        tabla.innerHTML = `
          <div class="tabla-scroll">
            <table class="tabla">
              <caption>${rifas.length} ${rifas.length === 1 ? 'propuesta' : 'propuestas'} · la más antigua desde el ${esc(fechaHora(rifas.map(r => r.fechas.creada).sort()[0]))}</caption>
              <thead><tr>
                <th scope="col">Propuesta</th><th scope="col">Autor</th><th scope="col">Estado</th><th scope="col" class="num">Precio referencial</th>
                <th scope="col">Link</th><th scope="col" class="num">Apoyo / umbral</th><th scope="col"><span class="sr-solo">Acciones</span></th>
              </tr></thead>
              <tbody>${rifas.map(fila).join('')}</tbody>
            </table>
          </div>
          <p class="admin-nota">El umbral de visibilidad exige Chances y un mínimo de personas (configuración de cada rifa). Al alcanzarlo, la Rifa Sugerida deja de recibir Chances y espera la moderación.</p>`;
        const buscar = id => rifas.find(r => r.id === id);
        tabla.querySelectorAll('[data-validar]').forEach(b => b.addEventListener('click', () => modalValidarLink(buscar(b.dataset.validar), cargar)));
        tabla.querySelectorAll('[data-moderar]').forEach(b => b.addEventListener('click', () => modalModerar(buscar(b.dataset.moderar), cargar)));
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
