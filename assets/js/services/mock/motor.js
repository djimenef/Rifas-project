// Motor de reglas de negocio compartido por los servicios mock (README §7.3–§7.10).
// Aquí vive la lógica; las pantallas nunca la repiten.
import { ErrorDominio } from '../../domain/errores.js';
import {
  TRANSICIONES, ESTADOS_SOLO_ENLACE, ESTADOS_CONFIRMADOS, ESTADOS_COMPROMISO, ESTADOS_CON_GANADOR,
  calcularMeta, calcularUmbral, calcularMaximo,
} from '../../domain/rifa.js';
import { enmascararDni } from '../../domain/usuario.js';
import { apodosRellenoMock } from '../../mocks/catalogos.js';
import { leerSesion } from '../../session.js';
import { alIniciarOperacion } from './db.js';
import { sha256 } from '../../lib/hash.js';
import { codigoOpcion, listaOpcionesCsv } from '../../domain/sorteo.js';
import { nuevoId } from '../../lib/ids.js';

export const ahora = () => new Date().toISOString();
export const sumarDias = (iso, dias) => new Date(new Date(iso).getTime() + dias * 864e5).toISOString();

// ---------------------------------------------------------------------------
// Sesión y permisos
// ---------------------------------------------------------------------------

export function usuarioActual(db) {
  const sesion = leerSesion();
  return sesion ? db.usuarios.find(u => u.id === sesion.usuarioId) ?? null : null;
}

export function exigirSesion(db) {
  const u = usuarioActual(db);
  if (!u) throw new ErrorDominio('SIN_SESION');
  return u;
}

export function exigirParticipante(db) {
  const u = exigirSesion(db);
  if (u.rol !== 'PARTICIPANTE') throw new ErrorDominio('NO_AUTORIZADO');
  return u;
}

export function exigirAdmin(db) {
  const u = exigirSesion(db);
  if (u.rol !== 'ADMIN') throw new ErrorDominio('NO_AUTORIZADO');
  return u;
}

/** Usuario sin datos sensibles (sin contraseña ni DNI completo). */
export function vistaUsuario(u) {
  const { contrasena, dni, ...resto } = u;
  return { ...resto, dniEnmascarado: enmascararDni(dni) };
}

// ---------------------------------------------------------------------------
// Billetera: el saldo SIEMPRE es la suma de los movimientos (invariante 4)
// ---------------------------------------------------------------------------

export function saldo(db, usuarioId) {
  let disponible = 0, retenido = 0;
  for (const m of db.movimientos) {
    if (m.usuarioId === usuarioId) { disponible += m.deltaDisponible; retenido += m.deltaRetenido; }
  }
  return { disponible, retenido };
}

export function siguienteOperacion(db) {
  db.secuencias.operacion += 1;
  return 'OP-' + String(db.secuencias.operacion).padStart(6, '0');
}

/** Registra un movimiento inmutable y verifica que ningún saldo quede negativo (invariante 3). */
export function registrarMovimiento(db, datos) {
  const m = {
    id: nuevoId('mov'), numeroOperacion: siguienteOperacion(db), fecha: ahora(),
    rifaId: null, referencia: null, motivo: null, deltaDisponible: 0, deltaRetenido: 0, ...datos,
  };
  db.movimientos.push(m);
  const s = saldo(db, m.usuarioId);
  if (s.disponible < 0) throw new ErrorDominio('SALDO_INSUFICIENTE');
  if (s.retenido < 0) throw new ErrorDominio('CUADRE');
  return m;
}

/** Retenido = suma de compromisos activos (invariante 17). Si no cuadra, la operación se revierte. */
export function verificarCuadre(db, usuarioId) {
  const s = saldo(db, usuarioId);
  const comprometido = db.compromisos
    .filter(c => c.usuarioId === usuarioId && c.estado === 'ACTIVO')
    .reduce((total, c) => total + c.cantidad, 0);
  if (s.disponible < 0 || s.retenido < 0 || s.retenido !== comprometido) throw new ErrorDominio('CUADRE');
}

// ---------------------------------------------------------------------------
// Idempotencia (README §7.10, invariante 18)
// ---------------------------------------------------------------------------

/** Si la clave ya se usó, devuelve el mismo resultado sin volver a aplicar la operación. */
export function conIdempotencia(db, usuarioId, operacionNombre, clave, fn) {
  if (!clave) throw new ErrorDominio('DATOS_INCOMPLETOS', { mensaje: 'Falta la clave de idempotencia.' });
  const llave = `${usuarioId}:${clave}`;
  const previo = db.idempotencia[llave];
  if (previo) {
    if (previo.operacion !== operacionNombre) throw new ErrorDominio('DATOS_INCOMPLETOS', { mensaje: 'Clave de idempotencia reutilizada en otra operación.' });
    return previo.resultado;
  }
  const resultado = fn();
  db.idempotencia[llave] = { operacion: operacionNombre, resultado, fecha: ahora() };
  return resultado;
}

// ---------------------------------------------------------------------------
// Rifas: datos derivados
// ---------------------------------------------------------------------------

export function buscarRifa(db, id) {
  const r = db.rifas.find(x => x.id === id);
  if (!r) throw new ErrorDominio('NO_ENCONTRADA');
  return r;
}

const compromisosDe = (db, rifaId) => db.compromisos.filter(c => c.rifaId === rifaId);
export const compromisosActivos = (db, rifaId) => compromisosDe(db, rifaId).filter(c => c.estado === 'ACTIVO');
export const ticketsDe = (db, rifaId) => db.tickets.filter(t => t.rifaId === rifaId);

export function compromisoActivo(db, rifaId, usuarioId) {
  return compromisosActivos(db, rifaId).find(c => c.usuarioId === usuarioId) ?? null;
}

/** Participantes = relleno + usuarios reales con puntos retenidos, capturados o tickets. */
export function participantes(db, rifa) {
  if (rifa.participantesAlCierre != null) return rifa.participantesAlCierre;
  const reales = new Set([
    ...compromisosDe(db, rifa.id).filter(c => c.estado !== 'LIBERADO').map(c => c.usuarioId),
    ...ticketsDe(db, rifa.id).map(t => t.usuarioId),
  ]);
  return rifa.participantesExternos + reales.size;
}

/** Puntos retenidos en la rifa mientras se arma (interno, nunca público). */
export function puntosReunidos(db, rifa) {
  if (rifa.puntosAlCierre != null) return rifa.puntosAlCierre;
  return rifa.puntosExternos + compromisosActivos(db, rifa.id).reduce((t, c) => t + c.cantidad, 0);
}

export const opcionesVendidas = rifa => rifa.siguienteTicket - 1;
export const maxPorParticipante = rifa => calcularMaximo(rifa.meta, rifa.config.maxPorParticipantePct);
export const umbral = rifa => calcularUmbral(rifa.meta, rifa.config.umbralPct);
export const puntosMinAutor = rifa => Math.ceil(rifa.meta * rifa.config.puntosMinAutorPct / 100);

/** Avance 0–100 %. Nunca llega a 100 antes de cubrir la meta. */
export function progreso(db, rifa) {
  if (ESTADOS_CONFIRMADOS.includes(rifa.estado)) return 100;
  if (rifa.estado === 'CANCELADA' && opcionesVendidas(rifa) > 0) return 100;
  return Math.min(100, Math.floor(puntosReunidos(db, rifa) / rifa.meta * 100));
}

// ---------------------------------------------------------------------------
// Rifas: vistas
// ---------------------------------------------------------------------------

export function apodoDeTicket(db, rifa, numero) {
  const real = db.tickets.find(t => t.rifaId === rifa.id && t.numero === numero);
  if (real) return db.usuarios.find(u => u.id === real.usuarioId)?.apodo ?? '—';
  if (rifa.apodosFijos[numero]) return rifa.apodosFijos[numero];
  const semilla = [...rifa.codigo].reduce((a, c) => a + c.charCodeAt(0), 0);
  return apodosRellenoMock[(numero * 7919 + semilla) % apodosRellenoMock.length];
}

/**
 * Sal secreta de la rifa para los códigos de sus opciones. Nunca sale del servidor.
 * En la Fase 0 se deriva del id; en la Fase 1 será un valor aleatorio guardado al crear la rifa.
 */
const salOpciones = rifa => (rifa.salOpciones ??= sha256(`sal:${rifa.id}:${rifa.codigo}`));

/** Código alfanumérico de cada opción (README §7.8). */
export const codigosOpciones = (rifa, numeros) => numeros.map(numero => ({ numero, codigo: codigoOpcion(salOpciones(rifa), numero) }));

/** Lista congelada de opciones en CSV: número y código, sin datos de quién es cada una (README §7.8). */
export const snapshot = (db, rifa) => listaOpcionesCsv(opcionesVendidas(rifa), salOpciones(rifa));

/** Calcula y guarda la huella de la lista si la rifa ya cerró. */
export function asegurarHash(db, rifa) {
  if (!rifa.hashLista && opcionesVendidas(rifa) > 0 && !['ABIERTA', ...ESTADOS_COMPROMISO].includes(rifa.estado)) {
    rifa.hashLista = sha256(snapshot(db, rifa));
  }
  return rifa.hashLista;
}

/** Vista PÚBLICA: sin margen, meta, puntos reunidos ni opciones vendidas (invariante 12). */
export function vistaPublica(db, rifa) {
  const categoria = db.categorias.find(c => c.id === rifa.categoriaId);
  const autor = rifa.autor.tipo === 'ADMIN' ? null : db.usuarios.find(u => u.id === rifa.autor.usuarioId);
  const v = {
    id: rifa.id, codigo: rifa.codigo, slug: rifa.slug,
    categoria: categoria?.nombre ?? '—', categoriaId: rifa.categoriaId,
    producto: {
      nombre: rifa.producto.nombre, imagen: rifa.producto.imagen, emoji: rifa.producto.emoji, descripcion: rifa.producto.descripcion ?? null,
      precioTienda: rifa.producto.precioTienda, linkTienda: rifa.producto.linkCompra,
    },
    estado: rifa.estado, visibilidad: rifa.visibilidad,
    progreso: progreso(db, rifa), participantes: participantes(db, rifa),
  };
  if (autor) v.autorApodo = autor.apodo;
  if (rifa.fechas.limiteArmado && rifa.estado === 'ARMANDO') v.fechaLimiteArmado = rifa.fechas.limiteArmado;
  if (rifa.fechas.limiteCaptacion && rifa.estado === 'CAPTANDO') v.fechaLimiteArmado = rifa.fechas.limiteCaptacion;
  if (rifa.fechas.cierre) v.fechaCierre = rifa.fechas.cierre;
  if (rifa.extension?.minutosExtra) v.minutosExtra = rifa.extension.minutosExtra;
  if (rifa.fechas.sorteo) v.fechaSorteo = rifa.fechas.sorteo;
  const hash = asegurarHash(db, rifa);
  if (hash) v.hashLista = hash;
  if (ESTADOS_CON_GANADOR.includes(rifa.estado) && rifa.ganador) {
    v.ganadorApodo = rifa.ganador.apodo;
    v.sorteo = { ...rifa.sorteo };
  }
  const { compra, envio, entrega } = rifa.registros;
  if (compra) v.entrega = { compradoEl: compra.fecha, ...(envio ? { enviadoEl: envio.registradoEl } : {}), ...(entrega ? { entregadoEl: entrega.fecha } : {}) };
  if (rifa.motivo) v.motivo = rifa.motivo;
  return v;
}

/** Vista de ADMINISTRACIÓN: la pública más los datos internos. */
export function vistaAdmin(db, rifa) {
  return {
    ...vistaPublica(db, rifa),
    meta: rifa.meta, margenPct: rifa.config.margenPct, margen: rifa.meta - rifa.producto.precioTienda,
    puntosReunidos: puntosReunidos(db, rifa), opcionesVendidas: opcionesVendidas(rifa),
    umbral: umbral(rifa), maxPorParticipante: maxPorParticipante(rifa), config: { ...rifa.config },
    autor: { ...rifa.autor }, codigoAutor: rifa.codigoAutor,
    linkOriginal: rifa.producto.linkOriginal, linkCompra: rifa.producto.linkCompra, estadoLink: rifa.producto.estadoLink,
    fechas: { ...rifa.fechas }, historial: rifa.historial.map(h => ({ ...h })),
    registros: structuredClone(rifa.registros), ganadorUsuarioId: rifa.ganador?.usuarioId ?? null,
  };
}

// ---------------------------------------------------------------------------
// Rifas: cambios de estado y sus efectos sobre los puntos
// ---------------------------------------------------------------------------

/** Cambia de estado validando la transición y dejando registro (invariante 14). */
export function cambiarEstado(rifa, nuevo, { actor = 'SISTEMA', motivo = null } = {}) {
  if (!(TRANSICIONES[rifa.estado] ?? []).includes(nuevo)) {
    throw new ErrorDominio('TRANSICION_INVALIDA', { datos: { desde: rifa.estado, hacia: nuevo } });
  }
  rifa.historial.push({ desde: rifa.estado, hacia: nuevo, actor, motivo, fecha: ahora() });
  rifa.estado = nuevo;
  rifa.visibilidad = ESTADOS_SOLO_ENLACE.includes(nuevo) ? 'SOLO_ENLACE' : 'LISTADA';
}

export function emitirTickets(db, rifa, usuarioId, cantidad) {
  const numeros = [];
  for (let i = 0; i < cantidad; i++) {
    const numero = rifa.siguienteTicket++;
    db.tickets.push({ rifaId: rifa.id, usuarioId, numero });
    numeros.push(numero);
  }
  return numeros;
}

/** Meta cubierta: captura TODOS los compromisos en una sola operación y abre la rifa (§7.5 "Confirmar rifa"). */
export function confirmarRifa(db, rifa) {
  rifa.ticketsExternos += rifa.puntosExternos;
  rifa.siguienteTicket += rifa.puntosExternos;    // los puntos de relleno pasan a ser tickets
  for (const c of compromisosActivos(db, rifa.id)) {
    registrarMovimiento(db, { usuarioId: c.usuarioId, tipo: 'CAPTURA', deltaRetenido: -c.cantidad, rifaId: rifa.id });
    emitirTickets(db, rifa, c.usuarioId, c.cantidad);
    c.estado = 'CAPTURADO';
  }
  rifa.puntosExternos = 0;
  cambiarEstado(rifa, 'ABIERTA', { motivo: 'Meta cubierta' });
  rifa.fechas.confirmada = ahora();
  rifa.fechas.cierre = sumarDias(rifa.fechas.confirmada, rifa.config.tiempoAbiertaDias);
}

/** Devuelve al disponible todos los puntos retenidos de la rifa (invariante 9). */
export function liberarCompromisos(db, rifa, motivo) {
  for (const c of compromisosActivos(db, rifa.id)) {
    registrarMovimiento(db, { usuarioId: c.usuarioId, tipo: 'LIBERACION', deltaDisponible: c.cantidad, deltaRetenido: -c.cantidad, rifaId: rifa.id, motivo });
    c.estado = 'LIBERADO';
  }
}

/** Reembolsa íntegramente los puntos ya consumidos en la rifa (invariante 15). */
export function reembolsarTickets(db, rifa, motivo) {
  const porUsuario = new Map();
  for (const t of ticketsDe(db, rifa.id)) porUsuario.set(t.usuarioId, (porUsuario.get(t.usuarioId) ?? 0) + 1);
  for (const [usuarioId, cantidad] of porUsuario) {
    registrarMovimiento(db, { usuarioId, tipo: 'REEMBOLSO', deltaDisponible: cantidad, rifaId: rifa.id, motivo });
  }
}

/** Congela participantes y puntos al terminar sin armarse (para mostrar el avance final). */
export function congelarAvance(db, rifa) {
  rifa.puntosAlCierre = puntosReunidos(db, rifa);
  rifa.participantesAlCierre = participantes(db, rifa);
}

/** Ventana vencida sin meta (o sin umbral en captación): NO_SE_ARMO y liberación. */
export function declararNoArmada(db, rifa, actor = 'SISTEMA') {
  if (!ESTADOS_COMPROMISO.includes(rifa.estado)) throw new ErrorDominio('TRANSICION_INVALIDA');
  congelarAvance(db, rifa);
  liberarCompromisos(db, rifa, 'Rifa Descartada: no llegó al 100 % a tiempo.');
  cambiarEstado(rifa, 'NO_SE_ARMO', { actor, motivo: 'Venció la ventana sin cubrir la meta' });
}

/** Cierre: lista congelada y huella publicada; pasa directo a revisión (README §9.4). */
export function cerrarRifa(db, rifa, actor = 'SISTEMA') {
  cambiarEstado(rifa, 'CERRADA', { actor, motivo: 'Se agotó el tiempo: Rifa Cerrada, por rifar' });
  rifa.fechas.cierre = ahora();
  asegurarHash(db, rifa);
  cambiarEstado(rifa, 'EN_REVISION', { actor: 'SISTEMA', motivo: 'Revisión posterior al cierre' });
}

/** Revisa los umbrales después de que entran puntos: meta (ARMANDO) o umbral de visibilidad (CAPTANDO). */
export function evaluarAvance(db, rifa) {
  if (rifa.estado === 'ARMANDO' && puntosReunidos(db, rifa) >= rifa.meta) {
    confirmarRifa(db, rifa);
    return 'CONFIRMADA';
  }
  if (rifa.estado === 'CAPTANDO' && puntosReunidos(db, rifa) >= umbral(rifa)
      && participantes(db, rifa) >= rifa.config.umbralMinParticipantes) {
    cambiarEstado(rifa, 'PROPUESTA', { motivo: 'Alcanzó el umbral de visibilidad' });
    return 'A_MODERACION';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Relojes: tiempo extra al final de una Rifa Confirmada y vencimientos (README §7.13 y §9.4)
// ---------------------------------------------------------------------------

/**
 * Registra que una persona puso Chances en una Rifa Confirmada. Si faltan `ventanaFinalMin` minutos o menos,
 * cada `personasPorExtension` personas DISTINTAS (no tickets) dentro de esa ventana suman `minutosPorExtension`
 * minutos al tiempo que quedaba. Se repite mientras sigan llegando personas, hasta que el tiempo se agote.
 * @returns {boolean} true si se agregó tiempo extra
 */
export function registrarActividadCierre(db, rifa, personaId) {
  if (rifa.estado !== 'ABIERTA' || !rifa.fechas.cierre) return false;
  const { ventanaFinalMin, personasPorExtension, minutosPorExtension } = rifa.config;
  const ahoraMs = Date.now();
  const cierreMs = Date.parse(rifa.fechas.cierre);
  const ventanaMs = ventanaFinalMin * 60000;
  if (cierreMs <= ahoraMs || cierreMs - ahoraMs > ventanaMs) return false;   // solo en los últimos minutos

  const ext = rifa.extension ?? (rifa.extension = { personas: [], minutosExtra: 0 });
  ext.personas = ext.personas.filter(p => ahoraMs - Date.parse(p.fecha) <= ventanaMs);
  if (!ext.personas.some(p => p.id === personaId)) ext.personas.push({ id: personaId, fecha: ahora() });
  if (ext.personas.length < personasPorExtension) return false;

  rifa.fechas.cierre = new Date(cierreMs + minutosPorExtension * 60000).toISOString();
  ext.minutosExtra += minutosPorExtension;
  ext.personas = [];   // las siguientes personas cuentan para la próxima extensión
  rifa.historial.push({ desde: 'ABIERTA', hacia: 'ABIERTA', actor: 'SISTEMA', motivo: `Tiempo extra: +${minutosPorExtension} min (${personasPorExtension} personas en los últimos ${ventanaFinalMin} min)`, fecha: ahora() });
  return true;
}

/** Cierra las Rifas Confirmadas cuyo tiempo se agotó y descarta las que no se armaron a tiempo. */
export function procesarVencimientos(db) {
  const ahoraMs = Date.now();
  for (const rifa of db.rifas) {
    if (rifa.estado === 'ABIERTA' && rifa.fechas.cierre && Date.parse(rifa.fechas.cierre) <= ahoraMs) {
      cerrarRifa(db, rifa, 'SISTEMA');
    } else if (rifa.estado === 'ARMANDO' && rifa.fechas.limiteArmado && Date.parse(rifa.fechas.limiteArmado) <= ahoraMs) {
      declararNoArmada(db, rifa);
    } else if (rifa.estado === 'CAPTANDO' && rifa.fechas.limiteCaptacion && Date.parse(rifa.fechas.limiteCaptacion) <= ahoraMs) {
      declararNoArmada(db, rifa);
    }
  }
}
alIniciarOperacion(procesarVencimientos);

/** Recalcula la meta con un margen nuevo (solo admins, antes de abrirse). */
export function fijarMargen(rifa, margenPct) {
  rifa.config.margenPct = margenPct;
  rifa.meta = calcularMeta(rifa.producto.precioTienda, margenPct);
}

/** Referencia corta a la rifa para comprobantes e historial. */
export const refRifa = rifa => ({ id: rifa.id, codigo: rifa.codigo, slug: rifa.slug, nombre: rifa.producto.nombre });
