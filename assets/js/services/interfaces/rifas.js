// Contrato de rifas para participantes y visitantes. Lo implementan services/mock (Fase 0) y services/http (Fase 1).

/**
 * @typedef {import('../../domain/rifa.js').Rifa} Rifa
 * @typedef {import('../../domain/rifa.js').EstadoRifa} EstadoRifa
 * @typedef {import('../../domain/rifa.js').Categoria} Categoria
 * @typedef {import('../../domain/rifa.js').Participacion} Participacion
 * @typedef {import('../../domain/rifa.js').NuevaPropuesta} NuevaPropuesta
 * @typedef {import('../../domain/billetera.js').Comprobante} Comprobante
 */

/**
 * @typedef {object} RifasService
 * @property {(filtro?: { estados?: EstadoRifa[], categoriaId?: string, busqueda?: string }) => Promise<Rifa[]>} listar
 *   Solo rifas listadas: nunca las que van por enlace (CAPTANDO, PROPUESTA, REVISION_LINK) ni BORRADOR/DESCARTADA.
 * @property {(slug: string) => Promise<Rifa>} obtenerPorSlug   Vista pública por enlace, sin sesión. Error: NO_ENCONTRADA.
 * @property {(codigo: string) => Promise<Rifa>} obtenerPorCodigo
 * @property {() => Promise<Categoria[]>} listarCategorias
 * @property {(rifaId: string) => Promise<Participacion>} miParticipacion   Puntos retenidos, tickets y cuánto más puedo poner.
 * @property {(rifaId: string, opciones: number, claveIdempotencia: string) => Promise<Comprobante>} comprometer
 *   Poner puntos (CAPTANDO o ARMANDO). Si con esto se cubre la meta, la rifa se confirma.
 *   Errores: SIN_SESION, SALDO_INSUFICIENTE, ESTADO_NO_ACEPTA_PUNTOS, LINK_EN_REVISION, BAJO_MINIMO, SUPERA_MAXIMO.
 * @property {(rifaId: string) => Promise<Comprobante>} retirarCompromiso
 *   Errores: RETIRO_NO_PERMITIDO, SIN_COMPROMISO.
 * @property {(rifaId: string, opciones: number, claveIdempotencia: string) => Promise<Comprobante>} comprar
 *   Compra directa en una rifa ABIERTA. Errores: SALDO_INSUFICIENTE, ESTADO_NO_ACEPTA_PUNTOS, SUPERA_MAXIMO, TOPE_ALCANZADO.
 * @property {() => Promise<{ grupo: 'ARMANDO'|'ABIERTAS'|'FINALIZADAS', rifa: Rifa, retenido: number, tickets: number[] }[]>} misRifas
 * @property {(codigo: string) => Promise<{ rifa: Rifa, retenido: number, tickets: number[] }>} misTickets
 * @property {() => Promise<Rifa[]>} ganadores   Rifas sorteadas, más reciente primero.
 * @property {(link: string) => Promise<{ nombre: string|null, precio: number|null, emoji: string, tiendaConfiable: boolean, motivoRevision: string|null }>} leerLink
 *   Fase 2: lectura (simulada) del título, imagen y precio desde el link.
 * @property {(datos: NuevaPropuesta) => Promise<Rifa>} proponer
 *   Fase 2: nace en CAPTANDO (link confiable) o en REVISION_LINK.
 *   Errores: CUENTA_NO_VERIFICADA, LIMITE_PROPUESTAS, CATEGORIA_INVALIDA, LINK_INVALIDO, PRECIO_FUERA_DE_RANGO, BAJO_MINIMO.
 * @property {() => Promise<{ rifa: Rifa, avanceUmbral: number, faltanParticipantes: number, codigoAutor: string }[]>} misPropuestas
 */

export const METODOS_RIFAS = Object.freeze([
  'listar', 'obtenerPorSlug', 'obtenerPorCodigo', 'listarCategorias', 'miParticipacion',
  'comprometer', 'retirarCompromiso', 'comprar', 'misRifas', 'misTickets', 'ganadores',
  'leerLink', 'proponer', 'misPropuestas',
]);
