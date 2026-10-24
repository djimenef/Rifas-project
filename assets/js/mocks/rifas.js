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
    producto: {
      nombre: d.nombre, emoji: d.emoji, imagen: d.imagen ?? null, descripcion: d.descripcion ?? null,
      precioTienda: d.precio, linkOriginal: link, linkCompra: link, estadoLink: d.estadoLink ?? 'VALIDO',
    },
    autor: d.autor ?? { tipo: 'ADMIN', usuarioId: 'u-admin' },
    codigoAutor: d.codigoAutor ?? null,
    destacada: d.destacada ?? null,   // orden en el carrusel de Inicio (null = no destacada). Más adelante lo fija un admin.
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
  // --- Rifa Armándose ---
  rifa(t, { id: 'r-ps5', codigo: 'RF-7K3Q9XM2', slug: 'ps5-slim', categoriaId: 'cat-consolas', nombre: 'PlayStation 5 Slim', emoji: '🎮', precio: 2200,
    estado: 'ARMANDO', puntosExternos: 1921, participantesExternos: 147, fechas: { publicada: t(-1, -4), limiteArmado: t(6, 4) } }),
  rifa(t, { id: 'r-zapas-urbanas', codigo: 'RF-5WQ8H3TK', slug: 'zapatillas-urbanas-blancas', categoriaId: 'cat-zapatillas', nombre: 'Zapatillas urbanas blancas', emoji: '👟', precio: 450,
    estado: 'ARMANDO', puntosExternos: 590, participantesExternos: 64, fechas: { publicada: t(-4), limiteArmado: t(3) } }),
  rifa(t, { id: 'r-polera', codigo: 'RF-2NV7C4XS', slug: 'polera-oversize', categoriaId: 'cat-ropa', nombre: 'Polera oversize de algodón', emoji: '👕', precio: 129,
    estado: 'ARMANDO', puntosExternos: 52, participantesExternos: 18, fechas: { publicada: t(-5), limiteArmado: t(2) } }),

  // --- Destacadas del carrusel de Inicio: productos reales de referencia (precio, foto y descripción tomados de la tienda) ---
  rifa(t, { id: 'r-iphone17', codigo: 'RF-3HK7WQ9P', slug: 'iphone-17-pro-max-256gb', categoriaId: 'cat-celulares',
    nombre: 'iPhone 17 Pro Max 256 GB', emoji: '📱', precio: 5099, destacada: 1,
    imagen: 'assets/img/productos/iphone-17-pro-max.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/155301902/iphone-17-pro-max-256gb-esim-deep-blue/155301903',
    descripcion: 'Color: Deep Blue · Capacidad: 256 GB · Versión eSIM (equipo importado: se registra en el operador). '
      + 'Pantalla OLED LTPO de 6.9" a 120 Hz, chip A19 Pro con 12 GB de RAM, triple cámara trasera de 48 MP con '
      + 'estabilización óptica y zoom óptico 4x, batería de 5088 mAh con carga rápida inalámbrica, parlantes estéreo, '
      + 'resistencia al polvo y al agua y llamadas de emergencia por satélite. Garantía de 1 año con Apple internacional.',
    estado: 'ARMANDO', puntosExternos: 2616, participantesExternos: 203, fechas: { publicada: t(-2), limiteArmado: t(5, 6) } }),
  rifa(t, { id: 'r-ps5pro', codigo: 'RF-6TZ4MNC8', slug: 'ps5-pro-digital', categoriaId: 'cat-consolas',
    nombre: 'Consola PS5 Pro Digital', emoji: '🎮', precio: 4599, destacada: 2,
    imagen: 'assets/img/productos/ps5-pro-digital.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/20704179/consola-ps5-pro-digital/20704179',
    descripcion: 'Modelo: PS5 Pro, edición digital (sin lector de discos) · Almacenamiento: SSD de 2 TB. '
      + 'Mejora los juegos con trazado de rayos avanzado y escalado de imagen con inteligencia artificial (PSSR). '
      + 'Conectividad Wi-Fi y Ethernet. Incluye la consola, un control inalámbrico DualSense, 2 pies de soporte horizontal, '
      + "cable HDMI, cable de alimentación y el juego ASTRO's PLAYROOM preinstalado. Garantía de 1 año.",
    estado: 'ARMANDO', puntosExternos: 4409, participantesExternos: 287, fechas: { publicada: t(-3), limiteArmado: t(4) } }),
  rifa(t, { id: 'r-megaride', codigo: 'RF-9BD2XR5V', slug: 'zapatillas-adidas-megaride-s4', categoriaId: 'cat-zapatillas',
    nombre: 'Zapatillas adidas Megaride S4', emoji: '👟', precio: 317, destacada: 3,
    imagen: 'assets/img/productos/adidas-megaride-s4.jpg',
    link: 'https://www.adidas.pe/zapatillas-megaride-s4/KJ8863.html',
    descripcion: 'Color: Negro (Core Black / Iron Metallic) · Modelo: Megaride S4, código KJ8863. '
      + 'Zapatillas urbanas con exterior textil que da estructura y protección, forro textil suave y suela que aporta '
      + 'una tracción fiable. Amarre de pasadores para regular el ajuste y mediasuela con amortiguación para la comodidad '
      + 'del día a día. Detalles de las 3 Tiras y del logo Badge of Sport.',
    estado: 'ARMANDO', puntosExternos: 232, participantesExternos: 41, fechas: { publicada: t(-1), limiteArmado: t(2, 12) } }),

  // --- Más productos reales de referencia (Rifa Armándose) ---
  rifa(t, { id: 'r-qned85', codigo: 'RF-8MDN4KQW', slug: 'tv-lg-qned-85', categoriaId: 'cat-tvs',
    nombre: 'Smart TV LG QNED Mini LED 85" 4K', emoji: '📺', precio: 4399,
    imagen: 'assets/img/productos/tv-lg-qned-85.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/80080403/qned-miniled-4k-ai-85-qned80b/80080403',
    descripcion: 'Modelo: 85QNED80BSG (2026) · Color: Negro. Smart TV LG QNED evo Mini LED de 85" con resolución 4K '
      + '(3840 x 2160), procesador α7 AI Processor 4K Gen9 y sistema webOS. Wi-Fi y Bluetooth, 3 puertos HDMI y 1 USB, '
      + 'sonido de 20 W RMS. Incluye el control AI Magic Remote. Garantía de 2 años.',
    estado: 'ARMANDO', puntosExternos: 2436, participantesExternos: 166, fechas: { publicada: t(-2), limiteArmado: t(5) } }),
  rifa(t, { id: 'r-rtx5060ti', codigo: 'RF-2GVR6TNP', slug: 'tarjeta-video-rtx-5060-ti', categoriaId: 'cat-computo',
    nombre: 'Tarjeta de video MSI RTX 5060 Ti 8 GB', emoji: '🖥️', precio: 2000,
    imagen: 'assets/img/productos/gpu-rtx-5060-ti.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/157061769/tarjeta-de-video-msi-rtx-5060ti-8gb-shadow-2x-oc-plus-gddr7',
    descripcion: 'Modelo: MSI GeForce RTX 5060 Ti 8G Shadow 2X OC Plus. 8 GB de memoria GDDR7 (128 bits, 28 Gbps), '
      + '4608 núcleos CUDA y reloj boost de 2602 MHz. Interfaz PCIe 5.0, doble ventilador y consumo de 180 W '
      + '(fuente recomendada de 600 W, 1 conector de 8 pines). Salidas: 1 HDMI y 3 DisplayPort, hasta 4 monitores. Garantía de 1 año.',
    estado: 'ARMANDO', puntosExternos: 2106, participantesExternos: 139, fechas: { publicada: t(-3), limiteArmado: t(3, 8) } }),
  rifa(t, { id: 'r-ryzen5', codigo: 'RF-9ZCA5HRT', slug: 'procesador-amd-ryzen-5-9600x', categoriaId: 'cat-computo',
    nombre: 'Procesador AMD Ryzen 5 9600X', emoji: '🖥️', precio: 930,
    imagen: 'assets/img/productos/ryzen-5-9600x.webp',
    link: 'https://www.impacto.com.pe/producto/procesador-amd-ryzen-5-9600x-3-9ghz-hasta-5-4ghz-38mb-100-100001405wof-am5-6-nucleos-radeon-graphics',
    descripcion: 'Modelo: AMD Ryzen 5 9600X (100-100001405WOF). Procesador de escritorio de la serie 9000, arquitectura Zen 5 '
      + 'de 4 nm, 6 núcleos y 12 hilos, de 3.9 GHz hasta 5.4 GHz en modo turbo y 38 MB de caché. Socket AM5, compatible '
      + 'con DDR5 y PCIe 5.0, gráficos Radeon integrados y consumo de 65 W. No incluye disipador.',
    estado: 'ARMANDO', puntosExternos: 653, participantesExternos: 71, fechas: { publicada: t(-2), limiteArmado: t(4) } }),
  rifa(t, { id: 'r-proyector', codigo: 'RF-6PMX2JHB', slug: 'combo-proyector-magcubic-parlante-xiaomi', categoriaId: 'cat-audio-video',
    nombre: 'Combo proyector MagCubic + parlante Xiaomi', emoji: '📽️', precio: 1289,
    imagen: 'assets/img/productos/combo-proyector-parlante.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/155467087/combo-proyector-magcubic-hy450c-parlante-xiaomi-sound-party-ns7/155467088',
    descripcion: 'Modelo: proyector MagCubic HY450C + parlante Xiaomi Sound Party NS7. Proyector Full HD 1080p (compatible con 4K), '
      + '900 lúmenes ANSI, Android integrado, autoenfoque y corrección trapezoidal automática, tiro corto y proyección de hasta 200". '
      + 'Parlante portátil de 50 W con Bluetooth 5.4, resistencia IP67 y hasta 26 horas de batería. Garantía del proveedor: 3 meses.',
    estado: 'ARMANDO', puntosExternos: 400, participantesExternos: 37, fechas: { publicada: t(-1), limiteArmado: t(6) } }),

  // --- Rifa Confirmada y siguientes ---
  rifa(t, { id: 'r-tab-s10fe', codigo: 'RF-5PTB7HXC', slug: 'tablet-samsung-galaxy-tab-s10-fe', categoriaId: 'cat-tablets',
    nombre: 'Samsung Galaxy Tab S10 FE 128 GB', emoji: '📲', precio: 1729,
    imagen: 'assets/img/productos/tablet-galaxy-tab-s10-fe.jpg',
    link: 'https://www.promart.pe/tablet-samsung-galaxy-tab-s10-fe-128gb-8gb-ram-gris-1001155353/p',
    descripcion: 'Color: Gris · Capacidad: 128 GB con 8 GB de RAM. Pantalla de 10.9" (2304 x 1440) a 90 Hz, procesador Exynos 1580, '
      + 'cámaras de 13 MP (trasera) y 12 MP (frontal), batería de 8,000 mAh con carga rápida de hasta 45 W, Wi-Fi 6E, '
      + 'resistencia IP68 y lector de huellas. Incluye S Pen. Almacenamiento ampliable con microSD.',
    estado: 'ABIERTA', ticketsExternos: 2480, participantesExternos: 262,
    fechas: { publicada: t(-6), confirmada: t(-1), cierre: t(1, 8) } }),
  rifa(t, { id: 'r-loq', codigo: 'RF-7XKQ3WMD', slug: 'laptop-gamer-lenovo-loq', categoriaId: 'cat-computo',
    nombre: 'Laptop gamer Lenovo LOQ i7 RTX 3050', emoji: '💻', precio: 4799,
    imagen: 'assets/img/productos/laptop-lenovo-loq.jpg',
    link: 'https://www.falabella.com.pe/falabella-pe/product/883600136/loq/883600136',
    descripcion: 'Color: Luna Grey · Modelo: Lenovo LOQ. Procesador Intel Core i7-13650HX (14 núcleos, hasta 4.9 GHz), '
      + 'tarjeta gráfica NVIDIA GeForce RTX 3050 de 6 GB, 16 GB de RAM y SSD de 512 GB. Pantalla IPS Full HD de 15.6" a 144 Hz, '
      + 'Wi-Fi, Bluetooth, Ethernet, 4 puertos USB y 1 HDMI, parlantes estéreo con Nahimic Audio. Windows 11 Home. Garantía de 1 año.',
    estado: 'ABIERTA', ticketsExternos: 6720, participantesExternos: 405,
    fechas: { publicada: t(-8), confirmada: t(-2), cierre: t(3) } }),
  rifa(t, { id: 'r-s26ultra', codigo: 'RF-3SVU8KYE', slug: 'samsung-galaxy-s26-ultra-256gb', categoriaId: 'cat-celulares',
    nombre: 'Samsung Galaxy S26 Ultra 256 GB', emoji: '📱', precio: 7999,
    imagen: 'assets/img/productos/galaxy-s26-ultra.jpg',
    link: 'https://www.lacuracao.pe/samsung-s26-ultra-12gb-256gb-black-35505903samsung26ultra2904202606585269326.html',
    descripcion: 'Color: Black · Capacidad: 256 GB con 12 GB de RAM. Pantalla AMOLED de 6.9" con Privacy Display, procesador '
      + 'Snapdragon 8 Elite Gen 5, cámara principal de 200 MP (f/1.4) y S Pen integrado. Marco de Armor Aluminum 2 (7.9 mm, 214 g), '
      + 'batería de 5000 mAh con carga rápida de 60 W. Equipo importado: se registra en el operador.',
    estado: 'ABIERTA', ticketsExternos: 11250, participantesExternos: 688,
    fechas: { publicada: t(-5), confirmada: t(0, -6), cierre: t(0, 20) } }),
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
