// Contrato de la billetera. Lo implementan services/mock (Fase 0) y services/http (Fase 1).

/**
 * @typedef {import('../../domain/billetera.js').BilleteraDetalle} BilleteraDetalle
 * @typedef {import('../../domain/billetera.js').Movimiento} Movimiento
 * @typedef {import('../../domain/billetera.js').TipoMovimiento} TipoMovimiento
 * @typedef {import('../../domain/billetera.js').PaqueteRecarga} PaqueteRecarga
 * @typedef {import('../../domain/billetera.js').MedioPago} MedioPago
 * @typedef {import('../../domain/billetera.js').Comprobante} Comprobante
 */

/**
 * @typedef {object} BilleteraService
 * @property {() => Promise<BilleteraDetalle>} obtener   Disponible, retenido y en qué rifas está retenido.
 * @property {(filtro?: { rifaId?: string, tipo?: TipoMovimiento }) => Promise<Movimiento[]>} historial
 *   Más reciente primero.
 * @property {() => Promise<PaqueteRecarga[]>} listarPaquetes   Solo los activos (5, 10, 15 y 20 puntos).
 * @property {(paqueteId: string, opciones: { medioPago: MedioPago, claveIdempotencia: string, simularRechazo?: boolean }) => Promise<Comprobante>} recargar
 *   `simularRechazo` existe solo en la Fase 0 para mostrar el estado "rechazado".
 *   Errores: PAQUETE_INACTIVO, PAGO_RECHAZADO (no se descuenta nada).
 */

export const METODOS_BILLETERA = Object.freeze(['obtener', 'historial', 'listarPaquetes', 'recargar']);
