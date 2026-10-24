// Dominio: rifas. Refleja README §7.2, §7.4, §7.9 y §8.

/** @typedef {'BORRADOR'|'REVISION_LINK'|'CAPTANDO'|'PROPUESTA'|'ARMANDO'|'NO_SE_ARMO'|'ABIERTA'|'CERRADA'|'EN_REVISION'|'PROGRAMADA'|'SORTEADA'|'COMPRANDO'|'EN_CAMINO'|'ENTREGADA'|'CANCELADA'|'DESCARTADA'} EstadoRifa */
/** @typedef {'LISTADA'|'SOLO_ENLACE'} Visibilidad */
/** @typedef {'ADMIN'|'PARTICIPANTE'|'CREADOR'} TipoAutor */

export const ESTADOS_RIFA = Object.freeze([
  'BORRADOR', 'REVISION_LINK', 'CAPTANDO', 'PROPUESTA', 'ARMANDO', 'NO_SE_ARMO', 'ABIERTA', 'CERRADA',
  'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA', 'CANCELADA', 'DESCARTADA',
]);

/**
 * Estados en los que se ponen puntos como compromiso (quedan retenidos). Invariante 10.
 * Las Chances retenidas quedan BLOQUEADAS: no se pueden retirar. Solo vuelven si la rifa se descarta;
 * si se confirma, se vuelven opciones de ganar y quedan asociadas a la rifa para siempre (invariantes 23 y 24).
 */
export const ESTADOS_COMPROMISO = Object.freeze(['CAPTANDO', 'ARMANDO']);
/** Estados en los que se compran opciones directamente. Invariante 10. */
export const ESTADOS_COMPRA = Object.freeze(['ABIERTA']);
/** Se abren solo por enlace; nunca aparecen en el listado ni en el buscador. Invariante 19. */
export const ESTADOS_SOLO_ENLACE = Object.freeze(['REVISION_LINK', 'CAPTANDO', 'PROPUESTA']);
/** Solo los ven su autor y los administradores (README §6). */
export const ESTADOS_SOLO_AUTOR = Object.freeze(['BORRADOR', 'REVISION_LINK', 'DESCARTADA']);
/** Ya alcanzaron la meta: el avance público es 100 %. Una Rifa Confirmada SIEMPRE se rifa (solo se cancela por fuerza mayor legal). */
export const ESTADOS_CONFIRMADOS = Object.freeze(['ABIERTA', 'CERRADA', 'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA']);
/** Tienen ganador. */
export const ESTADOS_CON_GANADOR = Object.freeze(['SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA']);

/**
 * Estados VISIBLES para el público. Cada uno agrupa uno o más estados internos (README §7.4 y §7.13).
 * Los internos se mantienen porque el equipo los necesita para validar, revisar, comprar y entregar.
 * En los textos visibles no se usa "sortear/sorteo": se dice "rifar" y "Rifa Realizada".
 */
export const ESTADOS_VISIBLES = Object.freeze({
  SUGERIDA: { nombre: 'Rifa Sugerida', internos: ['CAPTANDO'] },
  VALIDANDO: { nombre: 'Validando producto', internos: ['REVISION_LINK', 'PROPUESTA'] },
  ARMANDOSE: { nombre: 'Rifa Armándose', internos: ['ARMANDO'] },
  CONFIRMADA: { nombre: 'Rifa Confirmada', internos: ['ABIERTA'] },
  CERRADA: { nombre: 'Rifa Cerrada', internos: ['CERRADA', 'EN_REVISION', 'PROGRAMADA'] },
  REALIZADA: { nombre: 'Rifa Realizada', internos: ['SORTEADA', 'COMPRANDO', 'EN_CAMINO'] },
  ENTREGADA: { nombre: 'Premio Entregado', internos: ['ENTREGADA'] },
  DESCARTADA: { nombre: 'Rifa Descartada', internos: ['NO_SE_ARMO', 'CANCELADA', 'DESCARTADA'] },
});

/** @param {EstadoRifa} estado @returns {keyof typeof ESTADOS_VISIBLES | null} (BORRADOR no es visible) */
export const estadoVisible = estado =>
  Object.keys(ESTADOS_VISIBLES).find(k => ESTADOS_VISIBLES[k].internos.includes(estado)) ?? null;

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
  CAPTANDO: ['PROPUESTA', 'NO_SE_ARMO', 'DESCARTADA', 'CANCELADA'],
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
 *   minPorParticipante: number, maxPorParticipantePct: number,
 *   umbralPct: number, umbralMinParticipantes: number, ventanaCaptacionDias: number, puntosMinAutorPct: number,
 *   ventanaFinalMin: number, personasPorExtension: number, minutosPorExtension: number,
 * }} ConfiguracionRifa
 */
export const CONFIG_POR_DEFECTO = Object.freeze({
  margenPct: 35,
  ventanaArmadoDias: 7,
  tiempoAbiertaDias: 3,
  topeTickets: null,
  minPorParticipante: 1,
  maxPorParticipantePct: 20,
  umbralPct: 20,
  umbralMinParticipantes: 10,
  ventanaCaptacionDias: 7,
  puntosMinAutorPct: 1,
  // Tiempo extra al final de una Rifa Confirmada (README §7.13)
  ventanaFinalMin: 5,          // se activa cuando faltan 5 minutos o menos
  personasPorExtension: 5,     // cada 5 personas distintas (no tickets) que pongan Chances en esa ventana…
  minutosPorExtension: 5,      // …suman 5 minutos al tiempo que quedaba
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
 * Producto en la vista pública.
 * - `imagen`: foto referencial (ruta desde la raíz del sitio o URL). Si no hay, se usa `emoji` como marcador visual.
 * - `descripcion`: resumen tomado de la tienda; empieza con el color o modelo específico. null si no se pudo leer.
 * @typedef {{ nombre: string, imagen: string|null, emoji: string, descripcion: string|null, precioTienda: number, linkTienda: string }} ProductoPublico
 */

/**
 * Vista PÚBLICA de una rifa: nunca incluye margen, meta, puntos reunidos ni opciones vendidas (invariante 12).
 * @typedef {{
 *   id: string, codigo: string, slug: string, categoria: string, categoriaId: string,
 *   producto: ProductoPublico, estado: EstadoRifa, visibilidad: Visibilidad,
 *   progreso: number, participantes: number,
 *   fechaLimiteArmado?: string, fechaCierre?: string, fechaSorteo?: string, minutosExtra?: number,
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
 * @typedef {{ retenido: number, tickets: number[], maxPuedoPoner: number }} Participacion
 */

/**
 * @typedef {{ link: string, nombre: string, precioTienda: number, categoriaId: string, emoji?: string, puntosAutor: number }} NuevaPropuesta
 */
