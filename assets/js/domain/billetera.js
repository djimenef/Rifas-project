// Dominio: billetera, movimientos y recargas. Refleja README §7.2, §7.7 y §7.10.

/** @typedef {'RECARGA'|'RETENCION'|'LIBERACION'|'CAPTURA'|'COMPRA_DIRECTA'|'REEMBOLSO'|'AJUSTE'|'VENCIMIENTO'} TipoMovimiento */

export const TIPOS_MOVIMIENTO = Object.freeze([
  'RECARGA', 'RETENCION', 'LIBERACION', 'CAPTURA', 'COMPRA_DIRECTA', 'REEMBOLSO', 'AJUSTE', 'VENCIMIENTO',
]);

/** Texto visible de cada tipo de movimiento (glosario §7.1). */
export const ETIQUETA_MOVIMIENTO = Object.freeze({
  RECARGA: 'Recarga',
  RETENCION: 'Puntos puestos (retenidos)',
  LIBERACION: 'Puntos liberados',
  CAPTURA: 'Puntos usados (se armó la Chance)',
  COMPRA_DIRECTA: 'Compra de opciones',
  REEMBOLSO: 'Reembolso',
  AJUSTE: 'Ajuste',
  VENCIMIENTO: 'Puntos vencidos',
});

/** @typedef {{ disponible: number, retenido: number }} Billetera */

/**
 * Billetera con el detalle de en qué rifas están los puntos retenidos.
 * @typedef {Billetera & { retenidoPorRifa: { rifaId: string, codigo: string, slug: string, nombre: string, puntos: number }[] }} BilleteraDetalle
 */

/**
 * Movimiento inmutable del historial (invariantes 4 y 5).
 * @typedef {{
 *   id: string, numeroOperacion: string, usuarioId: string, tipo: TipoMovimiento,
 *   deltaDisponible: number, deltaRetenido: number, rifaId: string|null, motivo: string|null, fecha: string,
 *   rifa?: { codigo: string, slug: string, nombre: string },
 * }} Movimiento
 */

/** @typedef {'TARJETA'|'YAPE'} MedioPago */
export const MEDIOS_PAGO = Object.freeze(['TARJETA', 'YAPE']);

/** @typedef {{ id: string, precio: number, puntos: number, activo: boolean }} PaqueteRecarga */

/**
 * @typedef {{ id: string, usuarioId: string, paqueteId: string, monto: number, puntos: number,
 *   medioPago: MedioPago, estado: 'PENDIENTE'|'APROBADA'|'RECHAZADA', referencia: string, fecha: string }} Recarga
 */

/**
 * Comprobante de una operación con puntos (§7.10, paso 7).
 * @typedef {{
 *   numeroOperacion: string, tipo: 'COMPROMISO'|'COMPRA'|'RETIRO'|'RECARGA', cantidad: number,
 *   disponibleAntes: number, disponibleDespues: number, retenidoAntes: number, retenidoDespues: number,
 *   fecha: string, claveIdempotencia: string|null,
 *   rifa?: { id: string, codigo: string, slug: string, nombre: string },
 *   rifaConfirmada?: boolean, tickets?: number[],
 * }} Comprobante
 */
