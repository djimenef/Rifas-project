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
 *   Poner puntos (CAPTANDO o ARMANDO). Quedan retenidos y NO se pueden retirar: solo vuelven si la rifa se descarta.
 *   Si con esto se cubre la meta, la rifa se confirma.
 *   Errores: SIN_SESION, SALDO_INSUFICIENTE, ESTADO_NO_ACEPTA_PUNTOS, LINK_EN_REVISION, BAJO_MINIMO, SUPERA_MAXIMO.
 * @property {(rifaId: string, opciones: number, claveIdempotencia: string) => Promise<Comprobante>} comprar
 *   Compra directa en una rifa ABIERTA. Errores: SALDO_INSUFICIENTE, ESTADO_NO_ACEPTA_PUNTOS, SUPERA_MAXIMO, TOPE_ALCANZADO.
 * @property {() => Promise<{ grupo: 'ARMANDO'|'ABIERTAS'|'FINALIZADAS', rifa: Rifa, retenido: number, tickets: number[] }[]>} misRifas
 * @property {(codigo: string) => Promise<{ rifa: Rifa, retenido: number, tickets: number[], opciones: { numero: number, codigo: string }[], listaDisponible: boolean }>} misTickets
 *   Mis opciones en una rifa, cada una con su número y su código alfanumérico (solo los ve su dueño).
 * @property {(codigo: string) => Promise<{ csv: string, huella: string, total: number, nombreArchivo: string }>} listaOpciones
 *   Lista pública de opciones (número y código, sin dueños) desde Rifa Cerrada; su SHA-256 es la huella publicada.
 *   Error: LISTA_NO_DISPONIBLE (la rifa aún no se cierra).
 * @property {() => Promise<Rifa[]>} destacadas   Rifas del carrusel de Inicio, en su orden. Solo rifas listadas.
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
  'comprometer', 'comprar', 'misRifas', 'misTickets', 'listaOpciones', 'destacadas', 'ganadores',
  'leerLink', 'proponer', 'misPropuestas',
]);
