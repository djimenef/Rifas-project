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
 * @property {() => Promise<import('../../domain/billetera.js').OpcionesRecarga>} opcionesRecarga
 *   Pública (sin sesión): atajos activos y límites mínimo/máximo por recarga.
 * @property {() => Promise<PaqueteRecarga[]>} listarPaquetes   Solo los activos (atajos de 5, 10, 15 y 20).
 * @property {(paqueteOCantidad: string|number, opciones: { medioPago: MedioPago, claveIdempotencia: string, simularRechazo?: boolean }) => Promise<Comprobante>} recargar
 *   Recibe el id de un paquete (atajo) o una cantidad libre de puntos dentro de los límites (5 a 500 por defecto).
 *   `simularRechazo` existe solo en la Fase 0 para mostrar el estado "rechazado".
 *   Errores: PAQUETE_INACTIVO, CANTIDAD_INVALIDA, RECARGA_FUERA_DE_RANGO, PAGO_RECHAZADO (no se descuenta nada).
 */

export const METODOS_BILLETERA = Object.freeze(['obtener', 'historial', 'opcionesRecarga', 'listarPaquetes', 'recargar']);
