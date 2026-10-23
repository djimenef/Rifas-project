// Dominio: rifas. Refleja README §7.2, §7.4, §7.9 y §8.

/** @typedef {'BORRADOR'|'REVISION_LINK'|'CAPTANDO'|'PROPUESTA'|'ARMANDO'|'NO_SE_ARMO'|'ABIERTA'|'CERRADA'|'EN_REVISION'|'PROGRAMADA'|'SORTEADA'|'COMPRANDO'|'EN_CAMINO'|'ENTREGADA'|'CANCELADA'|'DESCARTADA'} EstadoRifa */
/** @typedef {'LISTADA'|'SOLO_ENLACE'} Visibilidad */
/** @typedef {'ADMIN'|'PARTICIPANTE'|'CREADOR'} TipoAutor */

export const ESTADOS_RIFA = Object.freeze([
  'BORRADOR', 'REVISION_LINK', 'CAPTANDO', 'PROPUESTA', 'ARMANDO', 'NO_SE_ARMO', 'ABIERTA', 'CERRADA',
  'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA', 'CANCELADA', 'DESCARTADA',
]);

/** Estados en los que se ponen puntos como compromiso (quedan retenidos). Invariante 10. */
export const ESTADOS_COMPROMISO = Object.freeze(['CAPTANDO', 'ARMANDO']);
/** Estados en los que se compran opciones directamente. Invariante 10. */
export const ESTADOS_COMPRA = Object.freeze(['ABIERTA']);
/** Se abren solo por enlace; nunca aparecen en el listado ni en el buscador. Invariante 19. */
export const ESTADOS_SOLO_ENLACE = Object.freeze(['REVISION_LINK', 'CAPTANDO', 'PROPUESTA']);
/** Solo los ven su autor y los administradores (README §6). */
export const ESTADOS_SOLO_AUTOR = Object.freeze(['BORRADOR', 'REVISION_LINK', 'DESCARTADA']);
/** Ya alcanzaron la meta: el avance público es 100 %. */
export const ESTADOS_CONFIRMADOS = Object.freeze(['ABIERTA', 'CERRADA', 'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA']);
/** Tienen ganador. */
export const ESTADOS_CON_GANADOR = Object.freeze(['SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA']);

/** Pestañas de "Mis rifas". */
export const GRUPOS_MIS_RIFAS = Object.freeze({
  ARMANDO: ['CAPTANDO', 'PROPUESTA', 'ARMANDO'],
  ABIERTAS: ['ABIERTA', 'CERRADA', 'EN_REVISION', 'PROGRAMADA'],
  FINALIZADAS: ['SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA', 'NO_SE_ARMO', 'CANCELADA', 'DESCARTADA'],
});

/** Transiciones permitidas (README §7.4). CANCELADA también cubre "fuerza mayor". */
export const TRANSICIONES = Object.freeze({
  BORRADOR: ['ARMANDO'],
  REVISION_LINK: ['CAPTANDO', 'DESCARTADA'],
  CAPTANDO: ['PROPUESTA', 'NO_SE_ARMO', 'DESCARTADA'],
  PROPUESTA: ['ARMANDO', 'DESCARTADA'],
  ARMANDO: ['ABIERTA', 'NO_SE_ARMO', 'CANCELADA'],
  ABIERTA: ['CERRADA', 'CANCELADA'],
  CERRADA: ['EN_REVISION', 'CANCELADA'],
  EN_REVISION: ['PROGRAMADA', 'CANCELADA'],
  PROGRAMADA: ['SORTEADA', 'CANCELADA'],
  SORTEADA: ['COMPRANDO'],
  COMPRANDO: ['EN_CAMINO'],
  EN_CAMINO: ['ENTREGADA'],
  NO_SE_ARMO: [],
  ENTREGADA: [],
  CANCELADA: [],
  DESCARTADA: [],
});

/**
 * Configuración por rifa (README §7.9). Solo la cambian los administradores.
 * @typedef {{
 *   margenPct: number, ventanaArmadoDias: number, tiempoAbiertaDias: number, topeTickets: number|null,
 *   minPorParticipante: number, maxPorParticipantePct: number, permiteRetiro: boolean,
 *   umbralPct: number, umbralMinParticipantes: number, ventanaCaptacionDias: number, puntosMinAutorPct: number,
 * }} ConfiguracionRifa
 */
export const CONFIG_POR_DEFECTO = Object.freeze({
  margenPct: 35,
  ventanaArmadoDias: 7,
  tiempoAbiertaDias: 3,
  topeTickets: null,
  minPorParticipante: 1,
  maxPorParticipantePct: 20,
  permiteRetiro: true,
  umbralPct: 20,
  umbralMinParticipantes: 10,
  ventanaCaptacionDias: 7,
  puntosMinAutorPct: 1,
});

/** Propuestas activas por autor (README §7.9). */
export const LIMITE_PROPUESTAS = Object.freeze({ participante: 2, creadorVerificado: 5 });
/** Rango de precio aceptado al proponer. PENDIENTE de definir por negocio; valores provisionales. */
export const RANGO_PRECIO_PROPUESTA = Object.freeze({ min: 50, max: 10000 });

/** Meta = precio + margen, en puntos (1 punto = S/ 1). */
export const calcularMeta = (precio, margenPct) => Math.ceil(precio * (1 + margenPct / 100));
/** Umbral de visibilidad de una propuesta, en puntos. */
export const calcularUmbral = (meta, umbralPct) => Math.ceil(meta * umbralPct / 100);
/** Máximo de puntos por participante, en puntos. */
export const calcularMaximo = (meta, maxPct) => Math.floor(meta * maxPct / 100);

/**
 * @typedef {{ id: string, nombre: string, icono: string, orden: number, activa: boolean }} Categoria
 */

/**
 * Producto en la vista pública. `emoji` es un marcador visual solo para la Fase 0 (no hay imágenes reales).
 * @typedef {{ nombre: string, imagen: string|null, emoji: string, precioTienda: number, linkTienda: string }} ProductoPublico
 */

/**
 * Vista PÚBLICA de una rifa: nunca incluye margen, meta, puntos reunidos ni opciones vendidas (invariante 12).
 * @typedef {{
 *   id: string, codigo: string, slug: string, categoria: string, categoriaId: string,
 *   producto: ProductoPublico, estado: EstadoRifa, visibilidad: Visibilidad,
 *   progreso: number, participantes: number, permiteRetiro: boolean,
 *   fechaLimiteArmado?: string, fechaCierre?: string, fechaSorteo?: string,
 *   hashLista?: string, ganadorApodo?: string,
 *   sorteo?: { semilla: string, ticketGanador: number, fecha: string },
 *   entrega?: { compradoEl?: string, enviadoEl?: string, entregadoEl?: string },   // solo fechas: el detalle es interno
 *   motivo?: string, autorApodo?: string,
 * }} Rifa
 */

/**
 * Vista de ADMINISTRACIÓN: la pública más los datos internos.
 * @typedef {Rifa & {
 *   meta: number, margenPct: number, margen: number, puntosReunidos: number, opcionesVendidas: number,
 *   umbral: number, maxPorParticipante: number, config: ConfiguracionRifa,
 *   autor: { tipo: TipoAutor, usuarioId: string|null },
 *   linkOriginal: string, linkCompra: string, estadoLink: 'VALIDO'|'EN_REVISION'|'REEMPLAZADO',
 *   registros: RegistrosPremio, ganadorUsuarioId: string|null,
 *   historial: { desde: EstadoRifa|null, hacia: EstadoRifa, actor: string, motivo: string|null, fecha: string }[],
 * }} RifaAdmin
 */

// --- Compra, envío y entrega del premio (README §7.12) ---
// La compra se hace FUERA de la web; aquí solo se registra para gestión y control interno.
// Estos registros solo los ven los administradores. El público ve el estado y la fecha.

export const MODALIDADES_ENVIO = Object.freeze(['RECOJO', 'COURIER']);

/** @typedef {{ nombres: string, apellidos: string, dni: string }} TitularPremio */

/**
 * @typedef {{
 *   fecha: string, tienda: string, productoComprado: string, esEquivalente: boolean, justificacion: string|null,
 *   montoPagado: number, numeroComprobante: string, archivoComprobante: string,
 *   aNombreDe: TitularPremio, registradoPor: string, registradoEl: string,
 * }} RegistroCompra
 */

/**
 * @typedef {{
 *   modalidad: 'RECOJO'|'COURIER', courier: string|null, codigoSeguimiento: string|null, fechaEstimada: string,
 *   registradoPor: string, registradoEl: string,
 * }} RegistroEnvio
 */

/**
 * `dniVerificado` debe ser true: el premio solo se entrega al titular del DNI de la cuenta ganadora (invariante 11).
 * @typedef {{
 *   fecha: string, recibidoPor: string, dniVerificado: true, archivoEvidencia: string, observaciones: string|null,
 *   registradoPor: string, registradoEl: string,
 * }} RegistroEntrega
 */

/** @typedef {{ compra?: RegistroCompra, envio?: RegistroEnvio, entrega?: RegistroEntrega }} RegistrosPremio */

/** @typedef {'ACTIVO'|'CAPTURADO'|'LIBERADO'} EstadoCompromiso */
/** @typedef {{ id: string, rifaId: string, usuarioId: string, cantidad: number, estado: EstadoCompromiso, fecha: string }} Compromiso */
/** @typedef {{ rifaId: string, usuarioId: string, numero: number }} Ticket */

/**
 * Lo que un participante tiene en una rifa.
 * @typedef {{ retenido: number, tickets: number[], maxPuedoPoner: number, puedeRetirar: boolean }} Participacion
 */

/**
 * @typedef {{ link: string, nombre: string, precioTienda: number, categoriaId: string, emoji?: string, puntosAutor: number }} NuevaPropuesta
 */
