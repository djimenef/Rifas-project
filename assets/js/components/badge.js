import { esc } from '../lib/html.js';
import { ESTADOS_VISIBLES, estadoVisible } from '../domain/rifa.js';

// Badge del estado VISIBLE de una rifa (README §7.13). Recibe el estado interno y muestra su grupo:
// Rifa Sugerida · Validando producto · Rifa Armándose · Rifa Confirmada · Rifa Cerrada (por rifar)
// · Rifa Realizada · Premio Entregado · Rifa Descartada. BORRADOR no tiene badge público.
// En textos visibles no se usa "sortear/sorteo".
const TEXTOS = {
  SUGERIDA: () => '💡 Rifa Sugerida · 🔒',
  VALIDANDO: () => '🔎 Validando producto',
  ARMANDOSE: () => '🍀 Rifa Armándose',
  CONFIRMADA: () => '🟢 Rifa Confirmada',
  CERRADA: d => (d.fecha ? `📅 Rifa Cerrada · se rifa el ${d.fecha}` : '⏳ Rifa Cerrada · Por rifar'),
  REALIZADA: d => `🏆 Rifa Realizada${d.apodo ? ` · Ganador: ${d.apodo}` : ''}`,
  ENTREGADA: () => '✅ Premio Entregado',
  DESCARTADA: () => '⚫ Rifa Descartada',
};

/**
 * @param {string} estado estado interno (EstadoRifa)
 * @param {{ fecha?: string, apodo?: string }} [datos] fecha en que se rifa (PROGRAMADA) y apodo del ganador
 * @returns {string} HTML del badge, o '' si el estado no se muestra al público
 */
export function badgeEstado(estado, datos = {}) {
  const visible = estadoVisible(estado);
  if (!visible) return '';
  return `<span class="badge badge-estado" data-estado="${esc(visible)}">${esc(TEXTOS[visible](datos))}</span>`;
}

/** Un estado interno de ejemplo por cada estado visible (catálogo de componentes). */
export const ESTADOS_CON_BADGE = Object.values(ESTADOS_VISIBLES).map(v => v.internos[0]);

/** Nombre visible de cada grupo (filtros públicos). */
export const NOMBRE_VISIBLE = Object.freeze(Object.fromEntries(Object.entries(ESTADOS_VISIBLES).map(([k, v]) => [k, v.nombre])));

/** Nombre de cada estado INTERNO, para el panel de administración (tablas, historial y filtros). */
export const NOMBRE_ESTADO = Object.freeze({
  BORRADOR: 'Borrador',
  REVISION_LINK: 'Validando producto · link en revisión',
  CAPTANDO: 'Rifa Sugerida',
  PROPUESTA: 'Validando producto · en moderación',
  ARMANDO: 'Rifa Armándose',
  ABIERTA: 'Rifa Confirmada',
  CERRADA: 'Rifa Cerrada · recién cerrada',
  EN_REVISION: 'Rifa Cerrada · en revisión',
  PROGRAMADA: 'Rifa Cerrada · fecha para rifar',
  SORTEADA: 'Rifa Realizada · ganador elegido',
  COMPRANDO: 'Rifa Realizada · comprando el premio',
  EN_CAMINO: 'Rifa Realizada · premio en camino',
  ENTREGADA: 'Premio Entregado',
  NO_SE_ARMO: 'Rifa Descartada · no se armó',
  CANCELADA: 'Rifa Descartada · cancelada',
  DESCARTADA: 'Rifa Descartada · propuesta descartada',
});
