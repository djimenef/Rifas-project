// Contrato de administración. Todas las operaciones exigen rol ADMIN (error NO_AUTORIZADO).

/**
 * @typedef {import('../../domain/rifa.js').RifaAdmin} RifaAdmin
 * @typedef {import('../../domain/rifa.js').EstadoRifa} EstadoRifa
 * @typedef {import('../../domain/rifa.js').Categoria} Categoria
 * @typedef {import('../../domain/rifa.js').ConfiguracionRifa} ConfiguracionRifa
 * @typedef {import('../../domain/usuario.js').Usuario} Usuario
 * @typedef {import('../../domain/billetera.js').Billetera} Billetera
 * @typedef {import('../../domain/billetera.js').Movimiento} Movimiento
 */

/**
 * @typedef {object} AdminService
 * @property {() => Promise<{ recaudado: number, retenidoTotal: number, rifasPorEstado: Record<EstadoRifa, number> }>} dashboard
 * @property {(filtro?: { estado?: EstadoRifa }) => Promise<RifaAdmin[]>} listarRifas
 * @property {(rifaId: string) => Promise<RifaAdmin>} obtenerRifa
 * @property {(datos: { nombre: string, precioTienda: number, link: string, categoriaId: string, emoji?: string, config?: Partial<ConfiguracionRifa> }) => Promise<RifaAdmin>} crearRifa
 *   Nace en BORRADOR.
 * @property {(rifaId: string) => Promise<RifaAdmin>} publicarRifa   BORRADOR → ARMANDO; empieza la ventana de armado.
 * @property {() => Promise<RifaAdmin[]>} colaRevision   Rifas CERRADAS o EN_REVISION.
 * @property {(rifaId: string, fechaSorteo: string) => Promise<RifaAdmin>} aprobarYProgramar   → PROGRAMADA con hash público.
 * @property {(rifaId: string, motivo: string) => Promise<RifaAdmin>} cancelarRifa
 *   Libera lo retenido y reembolsa lo consumido. Error: MOTIVO_OBLIGATORIO.
 * @property {(rifaId: string, opciones?: { ticketGanador?: number }) => Promise<RifaAdmin>} sortear
 *   `ticketGanador` existe solo en la Fase 0 para poder mostrar "Ganaste".
 * @property {(rifaId: string, comprobante: string) => Promise<RifaAdmin>} registrarCompra   SORTEADA → COMPRANDO.
 * @property {(rifaId: string, detalle: string) => Promise<RifaAdmin>} registrarEnvio   COMPRANDO → EN_CAMINO.
 * @property {(rifaId: string, evidencia: string) => Promise<RifaAdmin>} registrarEntrega   EN_CAMINO → ENTREGADA.
 * @property {(rifaId: string, decision: { accion: 'APROBAR'|'REEMPLAZAR'|'RECHAZAR', nuevoLink?: string, motivo?: string }) => Promise<RifaAdmin>} validarLink
 * @property {(rifaId: string, decision: { accion: 'APROBAR'|'RECHAZAR', margenPct?: number, motivo?: string }) => Promise<RifaAdmin>} moderarPropuesta
 * @property {() => Promise<RifaAdmin[]>} listarPropuestas   REVISION_LINK y PROPUESTA.
 * @property {(rifaId: string, cambios: { nombre?: string, precioTienda?: number }) => Promise<RifaAdmin>} actualizarProducto
 *   Corrige el título leído del link o el precio (solo antes de abrirse).
 * @property {() => Promise<(Usuario & Billetera)[]>} listarUsuarios
 * @property {(usuarioId: string) => Promise<{ usuario: Usuario, billetera: Billetera, movimientos: Movimiento[] }>} obtenerUsuario
 * @property {(usuarioId: string, puntos: number, motivo: string) => Promise<Movimiento>} ajustarSaldo
 * @property {() => Promise<Categoria[]>} listarCategorias   Incluye las inactivas.
 * @property {(categoria: Partial<Categoria> & { nombre: string }) => Promise<Categoria>} guardarCategoria
 *
 * Simulación de procesos automáticos (solo Fase 0; en la Fase 1 los ejecuta el servidor):
 * @property {(rifaId: string, puntos: number, personas: number) => Promise<RifaAdmin>} simularAporteExterno
 *   Simula que otras personas ponen puntos o compran opciones.
 * @property {(rifaId: string) => Promise<RifaAdmin>} vencerVentana   ARMANDO/CAPTANDO → NO_SE_ARMO.
 * @property {(rifaId: string) => Promise<RifaAdmin>} cerrarRifa   ABIERTA → CERRADA → EN_REVISION.
 */

export const METODOS_ADMIN = Object.freeze([
  'dashboard', 'listarRifas', 'obtenerRifa', 'crearRifa', 'publicarRifa', 'colaRevision', 'aprobarYProgramar',
  'cancelarRifa', 'sortear', 'registrarCompra', 'registrarEnvio', 'registrarEntrega', 'validarLink',
  'moderarPropuesta', 'listarPropuestas', 'actualizarProducto', 'listarUsuarios', 'obtenerUsuario',
  'ajustarSaldo', 'listarCategorias', 'guardarCategoria', 'simularAporteExterno', 'vencerVentana', 'cerrarRifa',
]);
