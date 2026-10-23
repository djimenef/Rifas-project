// Mi historial de Chances (/billetera/historial): movimientos con filtro por tipo y por rifa (?tipo=&rifa=).
import { listo } from '../layout.js';
import { billeteraService } from '../services/index.js';
import { url, parametro } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { puntos, fechaHora } from '../lib/formato.js';
import { cargarSeccion } from '../components/estados.js';
import { TIPOS_MOVIMIENTO, ETIQUETA_MOVIMIENTO } from '../domain/billetera.js';

const filtroTipo = document.getElementById('filtro-tipo');
const filtroRifa = document.getElementById('filtro-rifa');
const lista = document.getElementById('movimientos');
document.getElementById('volver-billetera').href = url('billetera');

filtroTipo.insertAdjacentHTML('beforeend', TIPOS_MOVIMIENTO.map(t => `<option value="${t}">${esc(ETIQUETA_MOVIMIENTO[t])}</option>`).join(''));
filtroTipo.value = TIPOS_MOVIMIENTO.includes(parametro('tipo')) ? parametro('tipo') : '';

const { permitido } = await listo;

const conSigno = n => (n > 0 ? '+' : n < 0 ? '−' : '') + puntos(Math.abs(n));

function movimiento(m) {
  const principal = m.deltaDisponible !== 0 ? m.deltaDisponible : m.deltaRetenido;
  const deDisponible = m.deltaDisponible !== 0;
  return `
    <li class="mov">
      <p class="mov-tipo">${esc(m.etiqueta)}</p>
      <div class="mov-montos">
        <span class="mov-monto ${principal > 0 ? 'positivo' : 'negativo'}">${conSigno(principal)}</span>
        ${deDisponible && m.deltaRetenido !== 0 ? `<span class="mov-retenido">Retenidas: ${conSigno(m.deltaRetenido)}</span>` : ''}
        ${!deDisponible ? '<span class="mov-retenido">de tus retenidas</span>' : ''}
      </div>
      <p class="mov-info">
        ${esc(fechaHora(m.fecha))}
        ${m.rifa ? ` · <a href="${url('rifa', { slug: m.rifa.slug })}">${esc(m.rifa.nombre)}</a>` : ''}
        ${m.motivo ? ` · ${esc(m.motivo)}` : ''}
        <br><span class="mov-op">Operación ${esc(m.numeroOperacion)}</span>
      </p>
    </li>`;
}

function cargar() {
  const query = new URLSearchParams(Object.entries({ tipo: filtroTipo.value, rifa: filtroRifa.value }).filter(([, v]) => v));
  history.replaceState(null, '', location.pathname + (query.size ? '?' + query : ''));
  const hayFiltros = !!(filtroTipo.value || filtroRifa.value);
  cargarSeccion(lista, {
    textoCargando: 'Cargando movimientos…',
    cargar: () => billeteraService.historial({ tipo: filtroTipo.value || undefined, rifaId: filtroRifa.value || undefined }),
    vacio: hayFiltros
      ? { icono: '🔍', titulo: 'No hay movimientos con esos filtros', texto: 'Prueba con otro tipo de movimiento o con otra rifa.' }
      : { icono: '🧾', titulo: 'Todavía no tienes movimientos', texto: 'Cuando recargues o pongas Chances en una rifa, lo verás aquí.', accion: { texto: 'Recargar Chances', href: url('recargar') } },
    mostrar: movs => { lista.innerHTML = `<ul class="movimientos">${movs.map(movimiento).join('')}</ul>`; },
  });
}

if (permitido) {
  // Las rifas del filtro salen del historial completo: solo las que tienen movimientos.
  try {
    const todos = await billeteraService.historial();
    const rifas = new Map(todos.filter(m => m.rifa).map(m => [m.rifaId, m.rifa.nombre]));
    filtroRifa.insertAdjacentHTML('beforeend', [...rifas].map(([id, nombre]) => `<option value="${esc(id)}">${esc(nombre)}</option>`).join(''));
    filtroRifa.value = rifas.has(parametro('rifa')) ? parametro('rifa') : '';
  } catch { /* el listado mostrará su propio error */ }
  filtroTipo.addEventListener('change', cargar);
  filtroRifa.addEventListener('change', cargar);
  cargar();
}
