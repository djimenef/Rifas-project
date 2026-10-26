// Admin · Cola de revisión (/admin/revision): rifas CERRADAS o EN_REVISION.
// Aprobar y anunciar la fecha → PROGRAMADA (y sale de la cola) · Cancelar por fuerza mayor → CANCELADA con reembolso total.
import { listo } from '../layout.js';
import { adminService } from '../services/index.js';
import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, puntos, opciones, fechaHora } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { badgeAdmin, modalProgramar, modalCancelarFuerzaMayor } from '../components/admin-rifas.js';

const cola = document.getElementById('cola');
const { permitido } = await listo;

const fila = (dt, dd) => `<div><dt>${esc(dt)}</dt><dd>${dd}</dd></div>`;

function item(r) {
  const cubre = r.opcionesVendidas >= r.meta;
  return `
    <article class="card cola-item" aria-labelledby="cola-${esc(r.id)}">
      <div>
        <h2 id="cola-${esc(r.id)}">${r.producto.emoji} <a class="enlace" href="${url('adminRifas', { codigo: r.codigo })}">${esc(r.producto.nombre)}</a> ${badgeAdmin(r)}</h2>
        <dl class="datos">
          ${fila('Código', esc(r.codigo))}
          ${r.fechas?.cierre ? fila('Cerrada el', esc(fechaHora(r.fechas.cierre))) : ''}
          ${fila('Personas', r.participantes.toLocaleString('es-PE'))}
          ${fila('Opciones vendidas / meta', `${opciones(r.opcionesVendidas)} / ${puntos(r.meta)} ${cubre ? '✓' : '⚠️'}`)}
          ${fila('Precio referencial', soles(r.producto.precioTienda))}
          ${r.hashLista ? fila('Huella de la lista', `<span class="texto-mono">${esc(r.hashLista)}</span>`) : ''}
        </dl>
        <p class="admin-nota">Antes de aprobar, verifica:</p>
        <ul class="cola-checklist">
          <li>El producto sigue disponible al precio esperado. Si no, se entregará uno equivalente de igual o mayor valor (la rifa no se cancela).</li>
          <li>La recaudación cuadra con las opciones vendidas.</li>
          <li>No hay indicios de fraude ni compras sospechosas.</li>
        </ul>
      </div>
      <div class="admin-acciones">
        <button type="button" class="btn btn-primary" data-programar="${esc(r.id)}">Aprobar y anunciar la fecha</button>
        <button type="button" class="btn btn-ghost" data-cancelar="${esc(r.id)}">Cancelar por fuerza mayor</button>
      </div>
    </article>`;
}

function cargar() {
  cargarSeccion(cola, {
    textoCargando: 'Cargando la cola…',
    cargar: () => adminService.colaRevision(),
    vacio: { icono: '✅', titulo: 'No hay rifas por revisar', texto: 'Cuando una rifa abierta se cierre, aparecerá aquí.', accion: { texto: 'Ver todas las rifas', href: url('adminRifas') } },
    mostrar: rifas => {
      cola.innerHTML = `<div class="cola">${rifas.map(item).join('')}</div>`;
      const buscar = id => rifas.find(r => r.id === id);
      cola.querySelectorAll('[data-programar]').forEach(b => b.addEventListener('click', () => modalProgramar(buscar(b.dataset.programar), cargar)));
      cola.querySelectorAll('[data-cancelar]').forEach(b => b.addEventListener('click', () => modalCancelarFuerzaMayor(buscar(b.dataset.cancelar), cargar)));
    },
  });
}

if (permitido) cargar();
