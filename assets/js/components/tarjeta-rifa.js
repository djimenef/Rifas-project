import { url } from '../lib/rutas.js';
import { esc } from '../lib/html.js';
import { soles, fechaHora, tiempoRestante } from '../lib/formato.js';
import { barraAvance } from './barra-avance.js';
import { badgeEstado } from './badge.js';

// Tarjeta de rifa (README §6, "Componente clave"). Es la misma tarjeta de la página de inicio;
// en los listados agrega tiempo restante, las Chances del participante y el ID en letra pequeña.
// Nunca muestra meta, margen ni Chances reunidas: solo personas y % de avance (invariante 12).

/** Texto variable del badge: fecha del sorteo o apodo del ganador. */
export const datosBadge = rifa => ({
  fecha: rifa.fechaSorteo ? fechaHora(rifa.fechaSorteo) : undefined,
  apodo: rifa.ganadorApodo,
});

/** Badge de estado de una rifa pública, con su texto variable. */
export const badgeRifa = rifa => badgeEstado(rifa.estado, datosBadge(rifa));

/** Línea de tiempo corta según el estado: "quedan 4 d", "Cierra el 25 oct, 8:00 p. m."… */
export function lineaTiempo(rifa) {
  if (['ARMANDO', 'CAPTANDO'].includes(rifa.estado) && rifa.fechaLimiteArmado) return `⏳ ${tiempoRestante(rifa.fechaLimiteArmado)}`;
  if (rifa.estado === 'ABIERTA' && rifa.fechaCierre) return `⏳ Cierra el ${fechaHora(rifa.fechaCierre)}`;
  return '';
}

/**
 * @param {import('../domain/rifa.js').Rifa} rifa vista pública
 * @param {{ detalle?: boolean, mio?: string, pie?: string }} [opciones]
 *   detalle: agrega tiempo restante e ID · mio: texto de "tus Chances aquí" · pie: HTML de acciones extra
 * @returns {string} HTML de la tarjeta
 */
export function tarjetaRifa(rifa, { detalle = false, mio = '', pie = '' } = {}) {
  const tiempo = detalle ? lineaTiempo(rifa) : '';
  return `
  <article class="draw">
    <div class="draw-img" aria-hidden="true">${rifa.producto.emoji}</div>
    <div class="draw-body">
      <h3><a href="${url('rifa', { slug: rifa.slug })}">${esc(rifa.producto.nombre)}</a></h3>
      <p>${esc(rifa.categoria)} · Precio referencial: ${soles(rifa.producto.precioTienda)}</p>
      ${tiempo ? `<p class="draw-tiempo">${esc(tiempo)}</p>` : ''}
      ${barraAvance(rifa.progreso)}
      ${mio ? `<p class="draw-mio">${esc(mio)}</p>` : ''}
      ${pie ? `<div class="draw-pie">${pie}</div>` : ''}
      <div class="req"><span>👥 ${rifa.participantes} personas</span>${detalle ? badgeRifa(rifa) : badgeEstado(rifa.estado)}</div>
      ${detalle ? `<p class="draw-id">ID: ${esc(rifa.codigo)}</p>` : ''}
    </div>
  </article>`;
}
