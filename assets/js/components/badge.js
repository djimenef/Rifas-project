import { esc } from '../lib/html.js';

// Etiqueta visible de cada estado de rifa (README §6 y PROMPT-FASE0 "Estados de rifa y su presentación").
// BORRADOR y DESCARTADA no tienen badge público.
const ESTADOS = {
  REVISION_LINK: () => '🔎 Link en revisión',
  CAPTANDO: () => '🔥 Calentando la Chance · 🔒',
  PROPUESTA: () => '📝 En moderación',
  ARMANDO: () => '🍀 Armando la Chance',
  ABIERTA: () => '🟢 ¡Va! Rifa confirmada',
  CERRADA: () => '⚪ Cerrada',
  EN_REVISION: () => '🟠 En revisión',
  PROGRAMADA: d => `📅 Sorteo el ${d.fecha ?? '—'}`,
  SORTEADA: d => `🏆 Ganador: ${d.apodo ?? '—'}`,
  COMPRANDO: () => '🛒 Comprando el premio',
  EN_CAMINO: () => '🚚 En camino',
  ENTREGADA: () => '✅ Entregada',
  NO_SE_ARMO: () => '⚫ No se armó la Chance',
  CANCELADA: () => '🔴 Cancelada',
};

/**
 * @param {string} estado uno de EstadoRifa
 * @param {{ fecha?: string, apodo?: string }} [datos] texto variable de PROGRAMADA y SORTEADA
 * @returns {string} HTML del badge, o '' si el estado no se muestra al público
 */
export function badgeEstado(estado, datos = {}) {
  const texto = ESTADOS[estado];
  if (!texto) return '';
  return `<span class="badge badge-estado" data-estado="${esc(estado)}">${esc(texto(datos))}</span>`;
}

export const ESTADOS_CON_BADGE = Object.keys(ESTADOS);
