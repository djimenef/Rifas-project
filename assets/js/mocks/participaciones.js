// Datos falsos: recargas, movimientos, compromisos y tickets de los participantes reales.
// Los movimientos cuadran: la billetera de cada usuario es exactamente la suma de sus movimientos (invariante 4)
// y su retenido es la suma de sus compromisos activos (invariante 17).
//   Lucía:   disponible 35 · retenido 10 (en la PS5) · usa los 8 tipos de movimiento
//   Valeria: disponible 24 · retenido 16 (en sus dos propuestas)
//   Carlos:  sin movimientos (sirve para ver estados vacíos)

export const recargasMock = t => [
  { id: 'rc-1', usuarioId: 'u-lucia', paqueteId: 'p20', monto: 20, puntos: 20, medioPago: 'TARJETA', estado: 'APROBADA', referencia: 'PSP-88120431', fecha: t(-30) },
  { id: 'rc-2', usuarioId: 'u-lucia', paqueteId: 'p20', monto: 20, puntos: 20, medioPago: 'YAPE', estado: 'APROBADA', referencia: 'PSP-88120977', fecha: t(-25) },
  { id: 'rc-3', usuarioId: 'u-lucia', paqueteId: 'p10', monto: 10, puntos: 10, medioPago: 'YAPE', estado: 'RECHAZADA', referencia: 'PSP-88124410', fecha: t(-2, -1) },
  { id: 'rc-4', usuarioId: 'u-lucia', paqueteId: 'p15', monto: 15, puntos: 15, medioPago: 'TARJETA', estado: 'APROBADA', referencia: 'PSP-88124415', fecha: t(-2) },
  { id: 'rc-5', usuarioId: 'u-vale', paqueteId: 'p20', monto: 20, puntos: 20, medioPago: 'TARJETA', estado: 'APROBADA', referencia: 'PSP-88119002', fecha: t(-16) },
  { id: 'rc-6', usuarioId: 'u-vale', paqueteId: 'p20', monto: 20, puntos: 20, medioPago: 'YAPE', estado: 'APROBADA', referencia: 'PSP-88119140', fecha: t(-15) },
];

const mov = (n, usuarioId, tipo, deltaDisponible, deltaRetenido, fecha, extra = {}) => ({
  id: `mov-${n}`, numeroOperacion: 'OP-' + String(n).padStart(6, '0'), usuarioId, tipo,
  deltaDisponible, deltaRetenido, rifaId: null, referencia: null, motivo: null, fecha, ...extra,
});

export const movimientosMock = t => [
  // Lucía
  mov(101, 'u-lucia', 'RECARGA', 20, 0, t(-30), { referencia: 'rc-1' }),
  mov(102, 'u-lucia', 'RECARGA', 20, 0, t(-25), { referencia: 'rc-2' }),
  mov(103, 'u-lucia', 'AJUSTE', 2, 0, t(-20), { motivo: 'Bonificación por demora en la acreditación de una recarga.' }),
  mov(104, 'u-lucia', 'COMPRA_DIRECTA', -5, 0, t(-12), { rifaId: 'r-xbox' }),
  mov(105, 'u-lucia', 'RETENCION', -5, 5, t(-9), { rifaId: 'r-reloj' }),
  mov(106, 'u-lucia', 'RETENCION', -8, 8, t(-8), { rifaId: 'r-tv' }),
  mov(107, 'u-lucia', 'VENCIMIENTO', -2, 0, t(-4), { motivo: 'Venció la bonificación sin usar.' }),
  mov(108, 'u-lucia', 'REEMBOLSO', 5, 0, t(-3), { rifaId: 'r-xbox', motivo: 'Rifa cancelada.' }),
  mov(109, 'u-lucia', 'RECARGA', 15, 0, t(-2), { referencia: 'rc-4' }),
  mov(110, 'u-lucia', 'RETENCION', -10, 10, t(-1, -6), { rifaId: 'r-ps5' }),
  mov(111, 'u-lucia', 'LIBERACION', 5, -5, t(-1), { rifaId: 'r-reloj', motivo: 'No se armó la Rifa.' }),
  mov(112, 'u-lucia', 'CAPTURA', 0, -8, t(-1), { rifaId: 'r-tv' }),
  mov(113, 'u-lucia', 'COMPRA_DIRECTA', -2, 0, t(0, -12), { rifaId: 'r-tv' }),
  // Valeria
  mov(114, 'u-vale', 'RECARGA', 20, 0, t(-16), { referencia: 'rc-5' }),
  mov(115, 'u-vale', 'RECARGA', 20, 0, t(-15), { referencia: 'rc-6' }),
  mov(116, 'u-vale', 'RETENCION', -17, 17, t(-14), { rifaId: 'r-chaqueta' }),
  mov(117, 'u-vale', 'LIBERACION', 17, -17, t(-11), { rifaId: 'r-chaqueta', motivo: 'Propuesta descartada.' }),
  mov(118, 'u-vale', 'RETENCION', -3, 3, t(-10), { rifaId: 'r-polo-creador' }),
  mov(119, 'u-vale', 'RETENCION', -13, 13, t(-6), { rifaId: 'r-zapas-creador' }),
];

export const compromisosMock = t => [
  { id: 'cmp-1', rifaId: 'r-ps5', usuarioId: 'u-lucia', cantidad: 10, estado: 'ACTIVO', fecha: t(-1, -6) },
  { id: 'cmp-2', rifaId: 'r-reloj', usuarioId: 'u-lucia', cantidad: 5, estado: 'LIBERADO', fecha: t(-9) },
  { id: 'cmp-3', rifaId: 'r-tv', usuarioId: 'u-lucia', cantidad: 8, estado: 'CAPTURADO', fecha: t(-8) },
  { id: 'cmp-4', rifaId: 'r-chaqueta', usuarioId: 'u-vale', cantidad: 17, estado: 'LIBERADO', fecha: t(-14) },
  { id: 'cmp-5', rifaId: 'r-polo-creador', usuarioId: 'u-vale', cantidad: 3, estado: 'ACTIVO', fecha: t(-10) },
  { id: 'cmp-6', rifaId: 'r-zapas-creador', usuarioId: 'u-vale', cantidad: 13, estado: 'ACTIVO', fecha: t(-6) },
];

const rango = (desde, hasta) => Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

export const ticketsMock = () => [
  // TV 55": 8 por la captura (2152–2159) y 2 comprados después (2200–2201)
  ...[...rango(2152, 2159), 2200, 2201].map(numero => ({ rifaId: 'r-tv', usuarioId: 'u-lucia', numero })),
  // Xbox (cancelada y reembolsada)
  ...rango(1801, 1805).map(numero => ({ rifaId: 'r-xbox', usuarioId: 'u-lucia', numero })),
];
