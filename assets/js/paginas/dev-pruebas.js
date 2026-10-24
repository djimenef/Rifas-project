// Pruebas de reglas de negocio (desarrollo).
import { authService, billeteraService, rifasService, adminService, nuevaClaveIdempotencia } from '../services/index.js';
import { reiniciarDatos, configurarLatencia, leerAhora } from '../services/mock/db.js';
import { ESTADOS_RIFA } from '../domain/rifa.js';
import { TIPOS_MOVIMIENTO } from '../domain/billetera.js';
import { esCodigoRifaValido } from '../lib/ids.js';
import { sha256 } from '../lib/hash.js';

const resultados = [];
const lista = document.getElementById('lista');
const registrar = (nombre, ok, detalle = '') => {
  resultados.push({ nombre, ok, detalle });
  const li = document.createElement('li');
  li.className = ok ? 'ok' : 'falla';
  li.textContent = nombre + (ok ? '' : ` — ${detalle}`);
  lista.appendChild(li);
};
const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
async function prueba(nombre, fn) {
  try { await fn(); registrar(nombre, true); } catch (e) { registrar(nombre, false, e.message); }
}
function esperar(cond, msg) { if (!cond) throw new Error(msg); }
async function esperarError(promesa, codigo) {
  try { await promesa; } catch (e) {
    if (e.codigo === codigo) return e;
    throw new Error(`se esperaba ${codigo} y llegó ${e.codigo ?? e.message}`);
  }
  throw new Error(`se esperaba ${codigo} y no hubo error`);
}
const clave = nuevaClaveIdempotencia;
const entrar = (u, c = 'demo123') => authService.iniciarSesion(u, c);
const rifaPorCodigo = codigo => leerAhora(db => db.rifas.find(r => r.codigo === codigo));
const PS5 = 'r-ps5', TV = 'r-tv';

configurarLatencia(0);
reiniciarDatos();
await authService.cerrarSesion();

// --- Utilidades ---
await prueba('SHA-256 coincide con crypto.subtle', async () => {
  for (const texto of ['abc', '', 'ñandú · DaleChance', 'x'.repeat(1000)]) {
    const ref = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)))].map(b => b.toString(16).padStart(2, '0')).join('');
    esperar(sha256(texto) === ref, `difiere para "${texto.slice(0, 10)}"`);
  }
});

// --- Datos de ejemplo ---
await prueba('Datos: al menos una rifa por cada estado y 6 categorías', async () => {
  const estados = leerAhora(db => db.rifas.map(r => r.estado));
  const faltan = ESTADOS_RIFA.filter(e => !estados.includes(e));
  esperar(!faltan.length, 'faltan ' + faltan.join(', '));
  esperar(leerAhora(db => db.categorias.length) >= 6, 'faltan categorías');
});
await prueba('Datos: códigos únicos y sin caracteres confusos', async () => {
  const codigos = leerAhora(db => db.rifas.map(r => r.codigo));
  esperar(codigos.every(esCodigoRifaValido), 'código inválido: ' + codigos.filter(c => !esCodigoRifaValido(c)));
  esperar(new Set(codigos).size === codigos.length, 'códigos repetidos');
});
await prueba('Datos: confirmadas con opciones vendidas ≥ meta', async () => {
  const malas = leerAhora(db => db.rifas.filter(r => ['ABIERTA', 'CERRADA', 'EN_REVISION', 'PROGRAMADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA'].includes(r.estado) && r.siguienteTicket - 1 < r.meta).map(r => r.codigo));
  esperar(!malas.length, malas.join(', '));
});

// --- Visitante ---
await prueba('Visitante: el listado excluye rifas solo por enlace, borradores y descartadas', async () => {
  const rifas = await rifasService.listar();
  const prohibidos = ['CAPTANDO', 'PROPUESTA', 'REVISION_LINK', 'BORRADOR', 'DESCARTADA'];
  esperar(rifas.length > 0 && rifas.every(r => !prohibidos.includes(r.estado) && r.visibilidad === 'LISTADA'), 'se colaron estados no listables');
});
await prueba('Visitante: filtros por estado, categoría y búsqueda', async () => {
  const armando = await rifasService.listar({ estados: ['ARMANDO'] });
  esperar(armando.length === 10 && armando.every(r => r.estado === 'ARMANDO'), 'filtro de estado: ' + armando.length);
  const zapas = await rifasService.listar({ categoriaId: 'cat-zapatillas' });
  esperar(zapas.length && zapas.every(r => r.categoriaId === 'cat-zapatillas'), 'filtro de categoría');
  const busq = await rifasService.listar({ busqueda: 'playstation' });
  esperar(busq.length === 1 && busq[0].slug === 'ps5-slim', 'búsqueda');
});
await prueba('Visitante: la vista pública nunca expone meta, margen, puntos reunidos ni opciones vendidas', async () => {
  const todas = [...await rifasService.listar(), await rifasService.obtenerPorSlug('zapas-edicion-creador')];
  const prohibidas = ['meta', 'margen', 'margenPct', 'puntosReunidos', 'opcionesVendidas', 'puntosExternos', 'config', 'maxOpcionesPorUsuario'];
  for (const r of todas) esperar(!prohibidas.some(k => k in r), `${r.codigo} expone ${prohibidas.filter(k => k in r)}`);
  esperar(todas.every(r => Number.isInteger(r.progreso) && r.progreso >= 0 && r.progreso <= 100), 'progreso fuera de 0–100');
});
await prueba('Textos visibles: badges con los nombres nuevos y errores en "Chances"', async () => {
  const { badgeEstado } = await import('../components/badge.js');
  const casos = { CAPTANDO: 'Rifa Sugerida', ARMANDO: 'Rifa Armándose', ABIERTA: 'Rifa Confirmada', CERRADA: 'Rifa Cerrada', EN_REVISION: 'Rifa Cerrada',
    PROGRAMADA: 'Rifa Cerrada', SORTEADA: 'Rifa Realizada', COMPRANDO: 'Rifa Realizada', ENTREGADA: 'Premio Entregado', NO_SE_ARMO: 'Rifa Descartada', CANCELADA: 'Rifa Descartada' };
  for (const [estado, texto] of Object.entries(casos)) esperar(badgeEstado(estado, { fecha: '5 nov', apodo: 'x' }).includes(texto), `${estado} debía decir ${texto}`);
  esperar(!Object.keys(casos).some(e => /sorte/i.test(badgeEstado(e, { fecha: '5 nov', apodo: 'x' }))), 'un badge dice "sorteo"');
  const { MENSAJES_ERROR } = await import('../domain/errores.js');
  const conPuntos = Object.values(MENSAJES_ERROR).filter(m => /\bpuntos?\b/i.test(m));
  esperar(!conPuntos.length, conPuntos.join(' | '));
});
await prueba('Visitante: rifas destacadas del carrusel en su orden y sin datos internos', async () => {
  const d = await rifasService.destacadas();
  esperar(igual(d.map(r => r.slug), ['iphone-17-pro-max-256gb', 'ps5-pro-digital', 'zapatillas-adidas-megaride-s4']), d.map(r => r.slug).join(','));
  esperar(d.every(r => r.producto.imagen && r.producto.descripcion), 'faltan foto o descripción');
  esperar(d[0].producto.descripcion.startsWith('Color: Deep Blue'), 'la descripción debe empezar con color o modelo');
  esperar(d.every(r => r.visibilidad === 'LISTADA' && !('meta' in r) && !('destacada' in r)), 'datos internos o rifa no listada');
});
await prueba('Visitante: PS5 muestra 148 personas y 65 %', async () => {
  const r = await rifasService.obtenerPorSlug('ps5-slim');
  esperar(r.participantes === 148 && r.progreso === 65, `${r.participantes} personas, ${r.progreso} %`);
});
await prueba('Visitante: rifa CAPTANDO se abre por enlace; borrador y link en revisión no', async () => {
  esperar((await rifasService.obtenerPorSlug('zapas-edicion-creador')).estado === 'CAPTANDO', 'captando');
  await esperarError(rifasService.obtenerPorSlug('reloj-clasico-acero'), 'NO_ENCONTRADA');
  await esperarError(rifasService.obtenerPorSlug('casaca-cortavientos'), 'NO_ENCONTRADA');
});
await prueba('Visitante: no puede poner puntos (SIN_SESION)', async () => {
  await esperarError(rifasService.comprometer(PS5, 5, clave()), 'SIN_SESION');
});

// --- Participante: billetera ---
await entrar('lucia@dalechance.pe');
await prueba('Billetera de Lucía: 35 disponibles, 10 retenidos en la PS5', async () => {
  const b = await billeteraService.obtener();
  esperar(b.disponible === 35 && b.retenido === 10, `${b.disponible}/${b.retenido}`);
  esperar(igual(b.retenidoPorRifa.map(x => [x.slug, x.puntos]), [['ps5-slim', 10]]), 'retenido por rifa');
});
await prueba('Historial: incluye los 8 tipos de movimiento y filtra por rifa y tipo', async () => {
  const h = await billeteraService.historial();
  const faltan = TIPOS_MOVIMIENTO.filter(t => !h.some(m => m.tipo === t));
  esperar(!faltan.length, 'faltan ' + faltan.join(', '));
  esperar(h[0].fecha >= h[h.length - 1].fecha, 'orden');
  esperar((await billeteraService.historial({ rifaId: TV })).every(m => m.rifaId === TV), 'filtro por rifa');
  esperar((await billeteraService.historial({ tipo: 'RECARGA' })).every(m => m.tipo === 'RECARGA'), 'filtro por tipo');
});
await prueba('Opciones de recarga (sin sesión): atajos 5/10/15/20 y límites 5–500', async () => {
  await authService.cerrarSesion();
  const o = await billeteraService.opcionesRecarga();
  esperar(igual(o.paquetes.map(p => p.puntos), [5, 10, 15, 20]) && o.minimo === 5 && o.maximo === 500, JSON.stringify(o));
  await entrar('lucia@dalechance.pe');
});
await prueba('Paquetes de recarga: 5, 10, 15 y 20', async () => {
  esperar(igual((await billeteraService.listarPaquetes()).map(p => p.puntos), [5, 10, 15, 20]), 'paquetes');
});

// --- Poner puntos ---
await prueba('Poner 5 puntos en la PS5: disponible 30, retenido 15', async () => {
  const c = await rifasService.comprometer(PS5, 5, clave());
  esperar(c.disponibleAntes === 35 && c.disponibleDespues === 30 && c.retenidoDespues === 15, JSON.stringify(c));
  esperar(c.numeroOperacion.startsWith('OP-'), 'número de operación');
});
await prueba('Idempotencia: repetir la misma clave no descuenta dos veces', async () => {
  const k = clave();
  const a = await rifasService.comprometer(PS5, 2, k);
  const b = await rifasService.comprometer(PS5, 2, k);
  esperar(a.numeroOperacion === b.numeroOperacion, 'comprobantes distintos');
  const bil = await billeteraService.obtener();
  esperar(bil.disponible === 28 && bil.retenido === 17, `${bil.disponible}/${bil.retenido}`);
});
await prueba('Saldo insuficiente: rechaza y no cambia nada', async () => {
  const e = await esperarError(rifasService.comprometer(PS5, 100, clave()), 'SALDO_INSUFICIENTE');
  esperar(e.datos.faltan === 72, 'faltan ' + e.datos.faltan);
  const b = await billeteraService.obtener();
  esperar(b.disponible === 28, 'cambió el saldo');
});
await prueba('Cantidad inválida (0, negativa o decimal)', async () => {
  for (const n of [0, -3, 1.5]) await esperarError(rifasService.comprometer(PS5, n, clave()), 'CANTIDAD_INVALIDA');
});
await prueba('Estados que no aceptan puntos: ABIERTA (como compromiso), PROGRAMADA y NO_SE_ARMO', async () => {
  await esperarError(rifasService.comprometer(TV, 1, clave()), 'ESTADO_NO_ACEPTA_PUNTOS');
  await esperarError(rifasService.comprometer('r-iphone', 1, clave()), 'ESTADO_NO_ACEPTA_PUNTOS');
  await esperarError(rifasService.comprar('r-reloj', 1, clave()), 'ESTADO_NO_ACEPTA_PUNTOS');
  await esperarError(rifasService.comprar(PS5, 1, clave()), 'ESTADO_NO_ACEPTA_PUNTOS');
});
await prueba('Link en revisión: no acepta puntos (LINK_EN_REVISION)', async () => {
  await esperarError(rifasService.comprometer('r-casaca', 1, clave()), 'LINK_EN_REVISION');
});
await prueba('Comprar 3 opciones en la TV abierta: emite tickets correlativos', async () => {
  const c = await rifasService.comprar(TV, 3, clave());
  esperar(igual(c.tickets, [2216, 2217, 2218]), 'tickets ' + c.tickets);
  const p = await rifasService.miParticipacion(TV);
  esperar(p.tickets.length === 13 && p.retenido === 0, JSON.stringify(p));
});
await prueba('Chances bloqueadas: no existe forma de retirarlas; siguen retenidas en la PS5', async () => {
  esperar(typeof rifasService.retirarCompromiso === 'undefined', 'RifasService no debe permitir retirar Chances');
  const p = await rifasService.miParticipacion(PS5);
  esperar(p.retenido === 17 && !('puedeRetirar' in p), JSON.stringify(p));
  const b = await billeteraService.obtener();
  esperar(b.disponible === 25 && b.retenido === 17, `${b.disponible}/${b.retenido}`);
});

// --- Tiempo extra al final de una Rifa Confirmada (README §7.13) ---
await prueba('Tiempo extra: faltando 3 min, 5 personas distintas suman 5 min; 4 no alcanzan; se repite', async () => {
  await entrar('admin@dalechance.pe', 'admin123');
  await adminService.simularTiempoRestante(TV, 3);
  const minutos = r => Math.round((Date.parse(r.fechaCierre) - Date.now()) / 60000);
  let r = await adminService.simularAporteExterno(TV, 4, 4);
  esperar(minutos(r) === 3 && !r.minutosExtra, `con 4 personas: ${minutos(r)} min`);
  await entrar('lucia@dalechance.pe');
  const c = await rifasService.comprar(TV, 1, clave());                       // Lucía es la 5.ª persona
  esperar(c.tiempoExtra === true, 'la compra debía activar el tiempo extra');
  r = await rifasService.obtenerPorSlug('tv-55');
  esperar(minutos(r) === 8 && r.minutosExtra === 5, `tras 5 personas: ${minutos(r)} min, extra ${r.minutosExtra}`);
  await entrar('admin@dalechance.pe', 'admin123');
  r = await adminService.simularAporteExterno(TV, 5, 5);                        // fuera de la ventana (quedan 8 min): no suma
  esperar(minutos(r) === 8, `fuera de los últimos 5 min no debía sumar: ${minutos(r)}`);
  await adminService.simularTiempoRestante(TV, 2);
  r = await adminService.simularAporteExterno(TV, 5, 5);
  esperar(minutos(r) === 7 && r.minutosExtra === 10, `segunda extensión: ${minutos(r)} min, extra ${r.minutosExtra}`);
  await adminService.simularTiempoRestante(TV, 60 * 24);                       // deja la TV abierta para las pruebas siguientes
});
await prueba('Cierre automático: al agotarse el tiempo la Rifa Confirmada pasa a Rifa Cerrada (por rifar)', async () => {
  let r = await adminService.simularAporteExterno('r-megaride', 196, 20);
  esperar(r.estado === 'ABIERTA', 'la Megaride debía confirmarse: ' + r.estado);
  await adminService.simularTiempoRestante('r-megaride', -1);
  const pub = await rifasService.obtenerPorSlug('zapatillas-adidas-megaride-s4');
  esperar(['CERRADA', 'EN_REVISION'].includes(pub.estado) && pub.hashLista, 'estado ' + pub.estado);
  await esperarError(adminService.simularAporteExterno('r-megaride', 1, 1), 'ESTADO_NO_ACEPTA_PUNTOS');
  await entrar('lucia@dalechance.pe');
});

// --- Ajuste de saldo y máximo por persona ---
await entrar('admin@dalechance.pe', 'admin123');
await prueba('Admin: ajuste de saldo exige motivo y queda en el historial', async () => {
  await esperarError(adminService.ajustarSaldo('u-lucia', 700, ''), 'MOTIVO_OBLIGATORIO');
  const m = await adminService.ajustarSaldo('u-lucia', 700, 'Saldo para pruebas');
  esperar(m.tipo === 'AJUSTE' && m.deltaDisponible === 700, JSON.stringify(m));
});
await entrar('lucia@dalechance.pe');
await prueba('Máximo por persona: 20 % de la meta (PS5: 594; Lucía ya tiene 17 retenidas → puede 577)', async () => {
  const e = await esperarError(rifasService.comprometer(PS5, 578, clave()), 'SUPERA_MAXIMO');
  esperar(e.datos.puedesPoner === 577, 'puedesPoner ' + e.datos.puedesPoner);
  const p = await rifasService.miParticipacion(PS5);
  esperar(p.maxPuedoPoner === 577, 'maxPuedoPoner ' + p.maxPuedoPoner);
});

// --- La rifa se arma ---
await prueba('Cubrir la meta: la rifa pasa a ABIERTA y los puntos retenidos se vuelven tickets', async () => {
  const c = await rifasService.comprometer('r-zapas-urbanas', 18, clave());
  esperar(c.rifaConfirmada === true, 'no se confirmó');
  esperar(c.tickets.length === 18 && c.tickets[0] === 591, 'tickets ' + c.tickets.slice(0, 3));
  esperar(c.retenidoDespues === c.retenidoAntes, 'el retenido debía volver a su valor (retención + captura)');
  const r = await rifasService.obtenerPorSlug('zapatillas-urbanas-blancas');
  esperar(r.estado === 'ABIERTA' && r.progreso === 100 && r.fechaCierre, JSON.stringify(r));
  const h = await billeteraService.historial({ rifaId: 'r-zapas-urbanas' });
  esperar(igual(h.map(m => m.tipo).sort(), ['CAPTURA', 'RETENCION']), 'movimientos ' + h.map(m => m.tipo));
});
await prueba('Rifa Sugerida: al llegar al umbral (20 % de la meta y 10 personas) pasa a moderación', async () => {
  const c = await rifasService.comprometer('r-zapas-creador', 97, clave());
  esperar(c.pasoAModeracion === true, JSON.stringify(c));
  const r = await rifasService.obtenerPorSlug('zapas-edicion-creador');
  esperar(r.estado === 'PROPUESTA' && r.participantes === 10, `${r.estado} ${r.participantes}`);
  await esperarError(rifasService.comprometer('r-zapas-creador', 1, clave()), 'ESTADO_NO_ACEPTA_PUNTOS');
});
await prueba('Mis rifas: agrupa en Armando, Abiertas y Finalizadas', async () => {
  const m = await rifasService.misRifas();
  const grupos = Object.fromEntries(['ARMANDO', 'ABIERTAS', 'FINALIZADAS'].map(g => [g, m.filter(x => x.grupo === g).map(x => x.rifa.slug).sort()]));
  esperar(igual(grupos.ARMANDO, ['ps5-slim', 'zapas-edicion-creador']), 'armando ' + grupos.ARMANDO);
  esperar(igual(grupos.ABIERTAS, ['tv-55', 'zapatillas-urbanas-blancas']), 'abiertas ' + grupos.ABIERTAS);
  esperar(igual(grupos.FINALIZADAS, ['reloj-smart', 'xbox-series-x']), 'finalizadas ' + grupos.FINALIZADAS);
});
await prueba('Recarga con monto libre: 37 se acepta; 4, 501 y 2.5 se rechazan', async () => {
  const antes = (await billeteraService.obtener()).disponible;
  const c = await billeteraService.recargar(37, { medioPago: 'TARJETA', claveIdempotencia: clave() });
  esperar(c.cantidad === 37 && c.disponibleDespues === antes + 37, JSON.stringify(c));
  const e1 = await esperarError(billeteraService.recargar(4, { medioPago: 'TARJETA', claveIdempotencia: clave() }), 'RECARGA_FUERA_DE_RANGO');
  esperar(e1.message === 'Mínimo 5 Chances', e1.message);
  const e2 = await esperarError(billeteraService.recargar(501, { medioPago: 'TARJETA', claveIdempotencia: clave() }), 'RECARGA_FUERA_DE_RANGO');
  esperar(e2.message === 'Máximo 500 Chances por recarga', e2.message);
  await esperarError(billeteraService.recargar(2.5, { medioPago: 'TARJETA', claveIdempotencia: clave() }), 'CANTIDAD_INVALIDA');
  esperar((await billeteraService.obtener()).disponible === antes + 37, 'los rechazos cambiaron el saldo');
});
await prueba('Recarga aprobada suma puntos; rechazada no cambia nada', async () => {
  const antes = (await billeteraService.obtener()).disponible;
  const c = await billeteraService.recargar('p20', { medioPago: 'YAPE', claveIdempotencia: clave() });
  esperar(c.disponibleDespues === antes + 20, 'aprobada');
  await esperarError(billeteraService.recargar('p10', { medioPago: 'TARJETA', claveIdempotencia: clave(), simularRechazo: true }), 'PAGO_RECHAZADO');
  esperar((await billeteraService.obtener()).disponible === antes + 20, 'el rechazo cambió el saldo');
});

// --- Propuestas (Fase 2) ---
await prueba('Proponer con link acortado: nace en REVISION_LINK sin puntos; máximo 2 propuestas activas', async () => {
  const antes = await billeteraService.obtener();
  const r = await rifasService.proponer({ link: 'https://bit.ly/abc', nombre: 'Gorra bordada', precioTienda: 120, categoriaId: 'cat-ropa' });
  esperar(r.estado === 'REVISION_LINK', r.estado);
  esperar(igual(await billeteraService.obtener(), antes), 'cambió el saldo');
  await esperarError(rifasService.proponer({ link: 'https://bit.ly/def', nombre: 'Otra', precioTienda: 120, categoriaId: 'cat-ropa' }), 'LIMITE_PROPUESTAS');
});
await entrar('vale@dalechance.pe');
await prueba('Proponer: link de tienda confiable nace en CAPTANDO con los puntos del autor', async () => {
  const r = await rifasService.proponer({ link: 'https://www.falabella.com.pe/producto/audifonos-inalambricos-anc', precioTienda: 499, categoriaId: 'cat-celulares', puntosAutor: 7 });
  esperar(r.estado === 'CAPTANDO' && r.visibilidad === 'SOLO_ENLACE' && r.producto.nombre.startsWith('Audífonos'), JSON.stringify(r));
  await esperarError(rifasService.proponer({ link: 'https://bit.ly/x', nombre: 'Polo', precioTienda: 10, categoriaId: 'cat-ropa' }), 'PRECIO_FUERA_DE_RANGO');
  const r2 = await rifasService.proponer({ link: 'https://bit.ly/x', nombre: 'Polo', precioTienda: 90, categoriaId: 'cat-ropa' });
  esperar(r2.estado === 'REVISION_LINK', r2.estado);
  const listado = await rifasService.listar();
  esperar(!listado.some(x => x.id === r.id || x.id === r2.id), 'una propuesta apareció en el listado');
});
await prueba('Proponer: exige los puntos mínimos del autor (1 % de la meta)', async () => {
  await esperarError(rifasService.proponer({ link: 'https://www.ripley.com.pe/producto/casaca-impermeable-outdoor', precioTienda: 329, categoriaId: 'cat-ropa', puntosAutor: 1 }), 'BAJO_MINIMO');
});
await prueba('Rifa Sugerida que no junta el mínimo: se descarta y las Chances del autor vuelven', async () => {
  const r = (await rifasService.misPropuestas()).find(p => p.rifa.slug.startsWith('audifonos'));
  const antes = await billeteraService.obtener();
  await entrar('admin@dalechance.pe', 'admin123');
  await adminService.vencerVentana(r.rifa.id);
  await entrar('vale@dalechance.pe');
  const despues = await billeteraService.obtener();
  const estado = (await rifasService.misPropuestas()).find(p => p.rifa.id === r.rifa.id).rifa.estado;
  esperar(estado === 'NO_SE_ARMO' && despues.disponible === antes.disponible + 7 && despues.retenido === antes.retenido - 7, `${estado} ${antes.disponible}→${despues.disponible}`);
});

// --- Administración: ciclo completo ---
await entrar('admin@dalechance.pe', 'admin123');
await prueba('Permisos: un participante no puede usar AdminService', async () => {
  await entrar('lucia@dalechance.pe');
  await esperarError(adminService.dashboard(), 'NO_AUTORIZADO');
  await entrar('admin@dalechance.pe', 'admin123');
});
await prueba('Admin: la vista interna sí incluye meta y margen (PS5: meta 2,970, margen 770)', async () => {
  const r = await adminService.obtenerRifa(PS5);
  esperar(r.meta === 2970 && r.margen === 770 && r.maxPorParticipante === 594 && r.umbral === 594, JSON.stringify({ meta: r.meta, margen: r.margen }));
});
await prueba('Admin: crear → publicar → aportes → ABIERTA → cerrar → revisión → programar → sortear → comprar → enviar → entregar', async () => {
  const nueva = await adminService.crearRifa({ nombre: 'Parlante bluetooth', precioTienda: 200, link: 'https://www.tienda-ejemplo.pe/producto/parlante', categoriaId: 'cat-celulares', emoji: '🔊' });
  esperar(nueva.estado === 'BORRADOR' && nueva.meta === 270 && esCodigoRifaValido(nueva.codigo), JSON.stringify(nueva));
  let r = await adminService.publicarRifa(nueva.id);
  esperar(r.estado === 'ARMANDO' && r.fechaLimiteArmado, 'publicar');
  r = await adminService.simularAporteExterno(nueva.id, 270, 40);
  esperar(r.estado === 'ABIERTA' && r.opcionesVendidas === 270, `aportes: ${r.estado} ${r.opcionesVendidas}`);
  r = await adminService.cerrarRifa(nueva.id);
  esperar(r.estado === 'EN_REVISION' && /^[0-9a-f]{64}$/.test(r.hashLista), 'cerrar');
  await esperarError(adminService.aprobarYProgramar(nueva.id, '2020-01-01T00:00:00Z'), 'VALIDACION');
  r = await adminService.aprobarYProgramar(nueva.id, new Date(Date.now() + 864e5).toISOString());
  esperar(r.estado === 'PROGRAMADA' && r.fechaSorteo, 'programar');
  r = await adminService.sortear(nueva.id);
  esperar(r.estado === 'SORTEADA' && r.sorteo.ticketGanador >= 1 && r.sorteo.ticketGanador <= 270 && r.ganadorApodo, 'sortear');
  const ec = await esperarError(adminService.registrarCompra(nueva.id, { fecha: new Date().toISOString(), tienda: 'Tienda', esEquivalente: true }), 'VALIDACION');
  esperar(['justificacion', 'montoPagado', 'numeroComprobante', 'archivoComprobante', 'aNombreDe'].every(k => ec.campos[k]), 'campos ' + Object.keys(ec.campos));
  r = await adminService.registrarCompra(nueva.id, { fecha: new Date().toISOString(), tienda: 'Tienda', montoPagado: 200, numeroComprobante: 'B001-1', archivoComprobante: 'boleta.pdf', aNombreDe: { nombres: 'Ana', apellidos: 'Paz', dni: '41234567' } });
  await esperarError(adminService.registrarEnvio(nueva.id, { modalidad: 'COURIER', fechaEstimada: new Date().toISOString() }), 'VALIDACION');
  r = await adminService.registrarEnvio(nueva.id, { modalidad: 'COURIER', courier: 'Courier', codigoSeguimiento: 'X1', fechaEstimada: new Date().toISOString() });
  const ee = await esperarError(adminService.registrarEntrega(nueva.id, { fecha: new Date().toISOString(), recibidoPor: 'Ana Paz', archivoEvidencia: 'foto.jpg' }), 'VALIDACION');
  esperar(ee.campos.dniVerificado, 'debía exigir el DNI verificado');
  r = await adminService.registrarEntrega(nueva.id, { fecha: new Date().toISOString(), recibidoPor: 'Ana Paz', dniVerificado: true, archivoEvidencia: 'foto.jpg' });
  esperar(r.registros.compra.numeroComprobante === 'B001-1' && r.registros.entrega.dniVerificado, 'registros');
  const pub = await rifasService.obtenerPorSlug(nueva.slug);
  esperar(pub.entrega.compradoEl && pub.entrega.entregadoEl && !('registros' in pub) && !JSON.stringify(pub).includes('B001-1') && !JSON.stringify(pub).includes('41234567'), 'el público ve datos internos');
  esperar(r.estado === 'ENTREGADA' && r.historial.length >= 9, `${r.estado}, ${r.historial.length} cambios`);
  await esperarError(adminService.sortear(nueva.id), 'TRANSICION_INVALIDA');
});
await prueba('Sorteo verificable: el hash publicado coincide con la lista de tickets', async () => {
  const r = await adminService.obtenerRifa('r-iphone');
  const lista = leerAhora(db => db.rifas.find(x => x.id === 'r-iphone'));
  esperar(r.hashLista && r.hashLista === lista.hashLista, 'hash');
});
await prueba('Sortear la TV a favor de Lucía: el ganador es su apodo', async () => {
  await adminService.cerrarRifa(TV);
  await adminService.aprobarYProgramar(TV, new Date(Date.now() + 36e5).toISOString());
  const r = await adminService.sortear(TV, { ticketGanador: 2152 });
  esperar(r.ganadorApodo === 'lucia_q', r.ganadorApodo);
  const c = await adminService.registrarCompra(TV, { fecha: new Date().toISOString(), tienda: 'Tienda', montoPagado: 1599, numeroComprobante: 'B001-9', archivoComprobante: 'b.pdf' });
  esperar(c.registros.compra.aNombreDe.dni === '45871236', 'debía comprarse a nombre de la titular de la cuenta');
  esperar((await rifasService.ganadores()).some(g => g.id === TV), 'no figura en ganadores');
});
await prueba('Cancelar una rifa armándose: libera los puntos retenidos', async () => {
  await entrar('lucia@dalechance.pe');
  await rifasService.comprometer('r-polera', 5, clave());
  const antes = await billeteraService.obtener();
  await entrar('admin@dalechance.pe', 'admin123');
  await esperarError(adminService.cancelarRifa('r-polera', '  '), 'MOTIVO_OBLIGATORIO');
  await adminService.cancelarRifa('r-polera', 'El proveedor dejó de vender el producto.');
  await entrar('lucia@dalechance.pe');
  const despues = await billeteraService.obtener();
  esperar(despues.retenido === antes.retenido - 5 && despues.disponible === antes.disponible + 5, `${antes.disponible}/${antes.retenido} → ${despues.disponible}/${despues.retenido}`);
});
await prueba('Rifa Confirmada: no se cancela por un problema del producto; solo por fuerza mayor legal, con reembolso íntegro', async () => {
  const antes = await billeteraService.obtener();
  await entrar('admin@dalechance.pe', 'admin123');
  await esperarError(adminService.cancelarRifa('r-zapas-urbanas', 'El producto subió de precio.'), 'RIFA_CONFIRMADA_NO_SE_CANCELA');
  await adminService.cancelarRifa('r-zapas-urbanas', 'Orden de la autoridad competente.', { fuerzaMayorLegal: true });
  await entrar('lucia@dalechance.pe');
  const despues = await billeteraService.obtener();
  esperar(despues.disponible === antes.disponible + 18, `${antes.disponible} → ${despues.disponible}`);
});
await prueba('Vencer la ventana de la PS5: Rifa Descartada con avance congelado (1,941 de 2,970 → 65 %)', async () => {
  await rifasService.comprometer(PS5, 3, clave());
  await entrar('admin@dalechance.pe', 'admin123');
  const r = await adminService.vencerVentana(PS5);
  esperar(r.estado === 'NO_SE_ARMO' && r.progreso === 65 && r.participantes === 148, `${r.estado} ${r.progreso} ${r.participantes}`);
});
await prueba('Moderar: aprobar la propuesta la publica en ARMANDO conservando sus compromisos', async () => {
  const r = await adminService.moderarPropuesta('r-polo-creador', { accion: 'APROBAR' });
  esperar(r.estado === 'ARMANDO' && r.visibilidad === 'LISTADA' && r.puntosReunidos === 60, `${r.estado} ${r.puntosReunidos}`);
});
await prueba('Validar link: reemplazar por uno de tienda confiable lo pasa a CAPTANDO', async () => {
  await esperarError(adminService.validarLink('r-casaca', { accion: 'REEMPLAZAR', nuevoLink: 'https://otra.com/x' }), 'LINK_INVALIDO');
  const r = await adminService.validarLink('r-casaca', { accion: 'REEMPLAZAR', nuevoLink: 'https://www.ripley.com.pe/producto/casaca' });
  esperar(r.estado === 'CAPTANDO' && r.linkOriginal === 'https://bit.ly/3casaca' && r.estadoLink === 'REEMPLAZADO', JSON.stringify(r));
});
await prueba('Cancelar con motivo una Rifa Sugerida (antes de confirmarse): pasa a Rifa Descartada', async () => {
  const r = await adminService.cancelarRifa('r-casaca', 'El producto ya no existe en ninguna tienda confiable.');
  esperar(r.estado === 'CANCELADA' && r.visibilidad === 'LISTADA', r.estado);
});
await prueba('Invariantes: saldos = suma de movimientos y retenido = compromisos activos, para todos', async () => {
  const malos = leerAhora(db => db.usuarios.filter(u => {
    const movs = db.movimientos.filter(m => m.usuarioId === u.id);
    const ret = movs.reduce((t, m) => t + m.deltaRetenido, 0), disp = movs.reduce((t, m) => t + m.deltaDisponible, 0);
    const comp = db.compromisos.filter(c => c.usuarioId === u.id && c.estado === 'ACTIVO').reduce((t, c) => t + c.cantidad, 0);
    return disp < 0 || ret < 0 || ret !== comp;
  }).map(u => u.id));
  esperar(!malos.length, malos.join(', '));
});

// --- Autenticación ---
await authService.cerrarSesion();
await prueba('Registro: valida campos, menor de edad, DNI y correo repetidos', async () => {
  const base = { nombres: 'Rosa', apellidos: 'Paz', dni: '41234567', fechaNacimiento: '1995-05-05', celular: '987000111', correo: 'rosa@correo.pe', apodo: 'rosa_p', contrasena: 'secreto1', confirmacionContrasena: 'secreto1', aceptaTerminos: true };
  const e = await esperarError(authService.registrar({ ...base, dni: '123', confirmacionContrasena: 'otra' }), 'VALIDACION');
  esperar(e.campos.dni && e.campos.confirmacionContrasena, JSON.stringify(e.campos));
  const hoy = new Date();
  const menor = `${hoy.getFullYear() - 17}-01-01`;
  await esperarError(authService.registrar({ ...base, fechaNacimiento: menor }), 'MENOR_DE_EDAD');
  await esperarError(authService.registrar({ ...base, dni: '45871236' }), 'DNI_REGISTRADO');
  await esperarError(authService.registrar({ ...base, correo: 'LUCIA@dalechance.pe' }), 'CORREO_REGISTRADO');
  const s = await authService.registrar(base);
  esperar(s.usuario.estado === 'PENDIENTE_VERIFICACION' && s.usuario.dniEnmascarado === '****4567' && !('dni' in s.usuario) && !('contrasena' in s.usuario), JSON.stringify(s));
  const b = await billeteraService.obtener();
  esperar(b.disponible === 0 && b.retenido === 0, 'billetera inicial');
});
await prueba('Verificar cuenta: código incorrecto y correcto', async () => {
  await esperarError(authService.verificarCodigo('000000'), 'CODIGO_INCORRECTO');
  const u = await authService.verificarCodigo('123456');
  esperar(u.estado === 'ACTIVO', u.estado);
});
await prueba('Login: por DNI o correo; credenciales inválidas', async () => {
  await esperarError(authService.iniciarSesion('lucia@dalechance.pe', 'mala'), 'CREDENCIALES_INVALIDAS');
  const s = await authService.iniciarSesion('45871236', 'demo123');
  esperar(s.usuario.apodo === 'lucia_q', 'login por DNI');
  esperar((await authService.sesionActual()).usuario.id === 'u-lucia', 'sesión actual');
  await authService.cerrarSesion();
  esperar((await authService.sesionActual()) === null, 'cerrar sesión');
});
await prueba('Google (simulado): inicia sesión sin scripts externos', async () => {
  const s = await authService.iniciarSesionConGoogle();
  esperar(s.usuario.id === 'u-lucia', 'google');
  await authService.cerrarSesion();
});

// --- Restaurar ---
reiniciarDatos();
const fallas = resultados.filter(r => !r.ok).length;
document.getElementById('resumen').textContent = `${resultados.length - fallas} de ${resultados.length} pruebas correctas`;
document.getElementById('resultado').textContent = JSON.stringify({ total: resultados.length, fallas, detalle: resultados.filter(r => !r.ok) });
