// Dominio: billetera, movimientos y recargas. Refleja README §7.2, §7.7 y §7.10.

/** @typedef {'RECARGA'|'RETENCION'|'LIBERACION'|'CAPTURA'|'COMPRA_DIRECTA'|'REEMBOLSO'|'AJUSTE'|'VENCIMIENTO'} TipoMovimiento */

export const TIPOS_MOVIMIENTO = Object.freeze([
  'RECARGA', 'RETENCION', 'LIBERACION', 'CAPTURA', 'COMPRA_DIRECTA', 'REEMBOLSO', 'AJUSTE', 'VENCIMIENTO',
]);

/** Texto visible de cada tipo de movimiento (glosario §7.1: en pantalla, los puntos se llaman "Chances"). */
export const ETIQUETA_MOVIMIENTO = Object.freeze({
  RECARGA: 'Recarga',
  RETENCION: 'Chances puestas (retenidas)',
  LIBERACION: 'Chances liberadas',
  CAPTURA: 'Chances usadas (la rifa se armó)',
  COMPRA_DIRECTA: 'Compra de opciones',
  REEMBOLSO: 'Reembolso',
  AJUSTE: 'Ajuste',
  VENCIMIENTO: 'Chances vencidas',
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

/** Atajos de recarga: 5, 10, 15 y 20. Además se puede recargar cualquier cantidad entera dentro de los límites. */
/** @typedef {{ id: string, precio: number, puntos: number, activo: boolean }} PaqueteRecarga */

/** Límites por recarga, en puntos ("Chances"). Valores por defecto: los puede cambiar un admin (README §7.9). */
export const LIMITES_RECARGA_POR_DEFECTO = Object.freeze({ minimo: 5, maximo: 500 });

/** @typedef {{ paquetes: PaqueteRecarga[], minimo: number, maximo: number }} OpcionesRecarga */

/**
 * paqueteId es null cuando se recarga un monto libre.
 * @typedef {{ id: string, usuarioId: string, paqueteId: string|null, monto: number, puntos: number,
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
