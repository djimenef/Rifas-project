// Contrato del Libro de Reclamaciones (Código de Protección y Defensa del Consumidor). Lo implementan services/mock (Fase 0) y services/http (Fase 1).

/**
 * @typedef {import('../../domain/reclamo.js').DatosReclamo} DatosReclamo
 * @typedef {import('../../domain/reclamo.js').HojaReclamo} HojaReclamo
 */

/**
 * @typedef {object} ReclamosService
 * @property {(datos: DatosReclamo) => Promise<HojaReclamo>} registrar
 *   No exige sesión. Devuelve la hoja con su número correlativo y la fecha límite de respuesta.
 *   Error: VALIDACION (con `campos`).
 */

export const METODOS_RECLAMOS = Object.freeze(['registrar']);
