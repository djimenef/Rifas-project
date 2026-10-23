// Datos falsos: rifas. Al menos una por cada estado de README §7.4.
// Las fechas son relativas al momento en que se crean los datos (t(dias, horas)).
// "Externos" = participantes de relleno; los participantes reales (Lucía, Valeria) se suman desde participaciones.js.
import { CONFIG_POR_DEFECTO, ESTADOS_SOLO_ENLACE, calcularMeta } from '../domain/rifa.js';

const LINK = 'https://www.tienda-ejemplo.pe/producto/';

function rifa(t, d) {
  const config = { ...CONFIG_POR_DEFECTO, ...d.config };
  const link = d.link ?? LINK + d.slug;
  const ticketsExternos = d.ticketsExternos ?? 0;
  return {
    id: d.id, codigo: d.codigo, slug: d.slug, categoriaId: d.categoriaId,
    producto: { nombre: d.nombre, emoji: d.emoji, imagen: null, precioTienda: d.precio, linkOriginal: link, linkCompra: link, estadoLink: d.estadoLink ?? 'VALIDO' },
    autor: d.autor ?? { tipo: 'ADMIN', usuarioId: 'u-admin' },
    codigoAutor: d.codigoAutor ?? null,
    estado: d.estado,
    visibilidad: ESTADOS_SOLO_ENLACE.includes(d.estado) ? 'SOLO_ENLACE' : 'LISTADA',
    config,
    meta: calcularMeta(d.precio, config.margenPct),
    puntosExternos: d.puntosExternos ?? 0,
    participantesExternos: d.participantesExternos ?? 0,
    ticketsExternos,
    siguienteTicket: ticketsExternos + (d.ticketsReales ?? 0) + 1,
    puntosAlCierre: d.puntosAlCierre ?? null,
    participantesAlCierre: d.participantesAlCierre ?? null,
    fechas: { creada: t(-20), ...d.fechas },
    apodosFijos: d.apodosFijos ?? {},
    ganador: d.ganador ?? null,
    sorteo: d.sorteo ?? null,
    hashLista: null,                 // se calcula al primer uso (motor.asegurarHash)
    registros: d.registros ?? {},       // compra, envío y entrega del premio (solo admins)
    motivo: d.motivo ?? null,
    historial: [{ desde: null, hacia: d.estado, actor: 'DATOS_DE_EJEMPLO', motivo: null, fecha: t(-1) }],
  };
}

// Registros internos de compra, envío y entrega (README §7.12). Personas ficticias.
const compra = (t, dias, d) => ({
  fecha: t(dias), esEquivalente: false, justificacion: null, archivoComprobante: `comprobante-${d.numeroComprobante}.pdf`,
  registradoPor: 'equipo_dc', registradoEl: t(dias), ...d,
});
const envio = (t, dias, d) => ({ courier: null, codigoSeguimiento: null, registradoPor: 'equipo_dc', registradoEl: t(dias), ...d });

export const rifasMock = t => [
  // --- Armando Rifa ---
  rifa(t, { id: 'r-ps5', codigo: 'RF-7K3Q9XM2', slug: 'ps5-slim', categoriaId: 'cat-consolas', nombre: 'PlayStation 5 Slim', emoji: '🎮', precio: 2200,
    estado: 'ARMANDO', puntosExternos: 1921, participantesExternos: 147, fechas: { publicada: t(-1, -4), limiteArmado: t(6, 4) } }),
  rifa(t, { id: 'r-zapas-urbanas', codigo: 'RF-5WQ8H3TK', slug: 'zapatillas-urbanas-blancas', categoriaId: 'cat-zapatillas', nombre: 'Zapatillas urbanas blancas', emoji: '👟', precio: 450,
    estado: 'ARMANDO', puntosExternos: 590, participantesExternos: 64, fechas: { publicada: t(-4), limiteArmado: t(3) } }),
  rifa(t, { id: 'r-polera', codigo: 'RF-2NV7C4XS', slug: 'polera-oversize', categoriaId: 'cat-ropa', nombre: 'Polera oversize de algodón', emoji: '👕', precio: 129,
    estado: 'ARMANDO', puntosExternos: 52, participantesExternos: 18, fechas: { publicada: t(-5), limiteArmado: t(2) } }),

  // --- ¡Va! y siguientes ---
  rifa(t, { id: 'r-tv', codigo: 'RF-4TW8N6PA', slug: 'tv-55', categoriaId: 'cat-tvs', nombre: 'Smart TV 55" 4K', emoji: '📺', precio: 1599,
    estado: 'ABIERTA', ticketsExternos: 2205, ticketsReales: 10, participantesExternos: 311,
    fechas: { publicada: t(-7), confirmada: t(-1), cierre: t(2, 6) } }),
  rifa(t, { id: 'r-switch', codigo: 'RF-6CN2VX8J', slug: 'nintendo-switch-oled', categoriaId: 'cat-consolas', nombre: 'Nintendo Switch OLED', emoji: '🎮', precio: 1499,
    estado: 'CERRADA', ticketsExternos: 2100, participantesExternos: 260, fechas: { publicada: t(-9), confirmada: t(-3), cierre: t(0, -1) } }),
  rifa(t, { id: 'r-tv65', codigo: 'RF-3QY7KD5H', slug: 'tv-65', categoriaId: 'cat-tvs', nombre: 'Smart TV 65" QLED', emoji: '📺', precio: 2899,
    estado: 'EN_REVISION', ticketsExternos: 3960, participantesExternos: 410, fechas: { publicada: t(-11), confirmada: t(-4), cierre: t(-1) } }),
  rifa(t, { id: 'r-iphone', codigo: 'RF-9HC2V5RD', slug: 'iphone-16', categoriaId: 'cat-celulares', nombre: 'iPhone 16 128 GB', emoji: '📱', precio: 3799,
    estado: 'PROGRAMADA', ticketsExternos: 5210, participantesExternos: 540, fechas: { publicada: t(-12), confirmada: t(-5), cierre: t(-2), sorteo: t(6, 3) } }),
  rifa(t, { id: 'r-zapas-running', codigo: 'RF-3MZ7Q8RB', slug: 'zapatillas-running', categoriaId: 'cat-zapatillas', nombre: 'Zapatillas running', emoji: '👟', precio: 599,
    estado: 'SORTEADA', ticketsExternos: 830, participantesExternos: 96, apodosFijos: { 412: 'lucho_23' },
    ganador: { apodo: 'lucho_23', ticket: 412, usuarioId: null },
    sorteo: { semilla: '9f3c2a71b8d04e65', ticketGanador: 412, fecha: t(-2) },
    fechas: { publicada: t(-14), confirmada: t(-9), cierre: t(-6), sorteo: t(-2) } }),
  rifa(t, { id: 'r-galaxy', codigo: 'RF-8WM3RA6T', slug: 'galaxy-s24', categoriaId: 'cat-celulares', nombre: 'Samsung Galaxy S24', emoji: '📱', precio: 2799,
    estado: 'COMPRANDO', ticketsExternos: 3820, participantesExternos: 470, apodosFijos: { 1777: 'mafer.pe' },
    ganador: { apodo: 'mafer.pe', ticket: 1777, usuarioId: null },
    sorteo: { semilla: '41ad7e09c3b25f18', ticketGanador: 1777, fecha: t(-4) },
    registros: {
      compra: compra(t, -2, { tienda: 'Tienda de ejemplo', productoComprado: 'Samsung Galaxy S24 256 GB', montoPagado: 2799, numeroComprobante: 'B001-004512', aNombreDe: { nombres: 'María Fernanda', apellidos: 'Peña Rivas', dni: '46339871' } }),
    },
    fechas: { publicada: t(-18), confirmada: t(-11), cierre: t(-8), sorteo: t(-4) } }),
  rifa(t, { id: 'r-watch', codigo: 'RF-5GH8ZN2C', slug: 'apple-watch-se', categoriaId: 'cat-relojes', nombre: 'Apple Watch SE', emoji: '⌚', precio: 1099,
    estado: 'EN_CAMINO', ticketsExternos: 1500, participantesExternos: 180, apodosFijos: { 903: 'jorge_rv' },
    ganador: { apodo: 'jorge_rv', ticket: 903, usuarioId: null },
    sorteo: { semilla: 'c07e5b1d92fa3864', ticketGanador: 903, fecha: t(-7) },
    registros: {
      compra: compra(t, -5, { tienda: 'Tienda de ejemplo', productoComprado: 'Apple Watch SE 40 mm', montoPagado: 1099, numeroComprobante: 'B001-004377', aNombreDe: { nombres: 'Jorge', apellidos: 'Ramos Vílchez', dni: '44120985' } }),
      envio: envio(t, -1, { modalidad: 'COURIER', courier: 'Courier de ejemplo', codigoSeguimiento: 'CE-55120938', fechaEstimada: t(2) }),
    },
    fechas: { publicada: t(-22), confirmada: t(-15), cierre: t(-12), sorteo: t(-7) } }),
  rifa(t, { id: 'r-jordan', codigo: 'RF-2PB6TW9K', slug: 'zapatillas-jordan', categoriaId: 'cat-zapatillas', nombre: 'Zapatillas Jordan retro', emoji: '👟', precio: 799,
    estado: 'ENTREGADA', ticketsExternos: 1102, participantesExternos: 150, apodosFijos: { 77: 'kathy_m' },
    ganador: { apodo: 'kathy_m', ticket: 77, usuarioId: null },
    sorteo: { semilla: '5b8e2f4a6c1d9073', ticketGanador: 77, fecha: t(-15) },
    registros: {
      compra: compra(t, -12, { tienda: 'Tienda de ejemplo', productoComprado: 'Zapatillas Jordan retro talla 38', montoPagado: 799, numeroComprobante: 'B001-003958', aNombreDe: { nombres: 'Katherine', apellidos: 'Mendoza Ccori', dni: '48761203' } }),
      envio: envio(t, -10, { modalidad: 'RECOJO', fechaEstimada: t(-8) }),
      entrega: { fecha: t(-8), recibidoPor: 'Katherine Mendoza Ccori', dniVerificado: true, archivoEvidencia: 'entrega-jordan.jpg', observaciones: 'Recogió en la oficina con su DNI físico.', registradoPor: 'equipo_dc', registradoEl: t(-8) },
    },
    fechas: { publicada: t(-30), confirmada: t(-24), cierre: t(-21), sorteo: t(-15) } }),

  // --- Finalizadas sin sorteo ---
  rifa(t, { id: 'r-reloj', codigo: 'RF-6YF4K2TE', slug: 'reloj-smart', categoriaId: 'cat-relojes', nombre: 'Smartwatch deportivo', emoji: '⌚', precio: 899,
    estado: 'NO_SE_ARMO', puntosAlCierre: 498, participantesAlCierre: 37, fechas: { publicada: t(-8), limiteArmado: t(-1) } }),
  rifa(t, { id: 'r-xbox', codigo: 'RF-7VJ3NC8Q', slug: 'xbox-series-x', categoriaId: 'cat-consolas', nombre: 'Xbox Series X', emoji: '🎮', precio: 2499,
    estado: 'CANCELADA', ticketsExternos: 3375, ticketsReales: 5, participantesExternos: 289,
    motivo: 'Durante la revisión se detectaron compras con indicios de fraude. Se reembolsaron todos los puntos.',
    fechas: { publicada: t(-20), confirmada: t(-14), cierre: t(-5), cancelada: t(-3) } }),

  // --- Fase 2: propuestas ---
  rifa(t, { id: 'r-zapas-creador', codigo: 'RF-8PX5D3HN', slug: 'zapas-edicion-creador', categoriaId: 'cat-zapatillas', nombre: 'Zapatillas edición limitada', emoji: '👟', precio: 899,
    estado: 'CAPTANDO', autor: { tipo: 'CREADOR', usuarioId: 'u-vale' }, codigoAutor: 'VALE-MODA',
    puntosExternos: 133, participantesExternos: 8, fechas: { creada: t(-6), limiteCaptacion: t(5) } }),
  rifa(t, { id: 'r-polo-creador', codigo: 'RF-4KX9M2PE', slug: 'polo-edicion-limitada', categoriaId: 'cat-ropa', nombre: 'Polo edición limitada', emoji: '👕', precio: 189,
    estado: 'PROPUESTA', autor: { tipo: 'CREADOR', usuarioId: 'u-vale' }, codigoAutor: 'VALE-MODA',
    puntosExternos: 57, participantesExternos: 10, fechas: { creada: t(-10) } }),
  rifa(t, { id: 'r-casaca', codigo: 'RF-7HD3QT5W', slug: 'casaca-cortavientos', categoriaId: 'cat-ropa', nombre: 'Casaca cortavientos', emoji: '🧥', precio: 249,
    estado: 'REVISION_LINK', autor: { tipo: 'PARTICIPANTE', usuarioId: 'u-lucia' }, codigoAutor: 'LUCIA-Q',
    link: 'https://bit.ly/3casaca', estadoLink: 'EN_REVISION', fechas: { creada: t(-1) } }),
  rifa(t, { id: 'r-chaqueta', codigo: 'RF-4ZT8QH3N', slug: 'chaqueta-cuero', categoriaId: 'cat-ropa', nombre: 'Chaqueta de cuero', emoji: '🧥', precio: 1200,
    estado: 'DESCARTADA', autor: { tipo: 'CREADOR', usuarioId: 'u-vale' }, codigoAutor: 'VALE-MODA',
    puntosAlCierre: 17, participantesAlCierre: 1, motivo: 'El precio no coincide con el del link de la tienda.',
    fechas: { creada: t(-14), descartada: t(-11) } }),

  // --- Borrador del admin ---
  rifa(t, { id: 'r-reloj-clasico', codigo: 'RF-9RT4BW6M', slug: 'reloj-clasico-acero', categoriaId: 'cat-relojes', nombre: 'Reloj clásico de acero', emoji: '⌚', precio: 650,
    estado: 'BORRADOR' }),
];
