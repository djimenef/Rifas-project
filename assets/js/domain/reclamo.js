// Dominio: Libro de Reclamaciones virtual (README §10, Código de Protección y Defensa del Consumidor).

/** RECLAMO: disconformidad con el servicio · QUEJA: malestar con la atención, sin relación con el servicio. */
export const TIPOS_RECLAMO = Object.freeze(['RECLAMO', 'QUEJA']);
export const TIPOS_BIEN = Object.freeze(['PRODUCTO', 'SERVICIO']);
/** Plazo de respuesta, en días hábiles. */
export const PLAZO_RESPUESTA_DIAS_HABILES = 15;

/**
 * @typedef {{
 *   nombres: string, apellidos: string, tipoDocumento: 'DNI'|'CE', numeroDocumento: string, domicilio: string,
 *   celular: string, correo: string, esMenor: boolean, apoderado?: string,
 *   tipoBien: 'PRODUCTO'|'SERVICIO', montoReclamado?: number|null, descripcionBien: string, codigoRifa?: string,
 *   tipo: 'RECLAMO'|'QUEJA', detalle: string, pedido: string, aceptaRespuestaCorreo: boolean,
 * }} DatosReclamo
 */

/** @typedef {{ numero: string, fecha: string, respuestaHasta: string, enviadoA: string, tipo: 'RECLAMO'|'QUEJA' }} HojaReclamo */

/** Suma días hábiles (lunes a viernes; sin feriados en la Fase 0). */
export function sumarDiasHabiles(iso, dias) {
  const f = new Date(iso);
  let n = 0;
  while (n < dias) {
    f.setDate(f.getDate() + 1);
    if (f.getDay() !== 0 && f.getDay() !== 6) n++;
  }
  return f.toISOString();
}
