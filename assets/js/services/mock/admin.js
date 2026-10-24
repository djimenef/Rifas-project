// AdminService — implementación mock (Fase 0). Todas las operaciones exigen rol ADMIN.
import { operacion } from './db.js';
import {
  exigirAdmin, buscarRifa, vistaAdmin, vistaUsuario, saldo, registrarMovimiento, verificarCuadre,
  cambiarEstado, liberarCompromisos, reembolsarTickets, congelarAvance, declararNoArmada, cerrarRifa,
  evaluarAvance, fijarMargen, asegurarHash, apodoDeTicket, opcionesVendidas, ahora, sumarDias, registrarActividadCierre,
} from './motor.js';
import { codigoUnico, slugUnico } from './rifas.js';
import { ErrorDominio } from '../../domain/errores.js';
import { ESTADOS_RIFA, ESTADOS_COMPROMISO, ESTADOS_CONFIRMADOS, CONFIG_POR_DEFECTO, MODALIDADES_ENVIO, calcularMeta } from '../../domain/rifa.js';
import { esDniValido } from '../../domain/usuario.js';
import { sortearOpciones } from '../../domain/sorteo.js';
import { nuevoId } from '../../lib/ids.js';

const exigirTexto = (valor, codigo = 'MOTIVO_OBLIGATORIO') => {
  const texto = String(valor ?? '').trim();
  if (!texto) throw new ErrorDominio(codigo);
  return texto;
};

const texto = valor => String(valor ?? '').trim();
const fechaIso = valor => {
  const f = new Date(valor);
  return valor && !Number.isNaN(f.getTime()) ? f.toISOString() : null;
};

/** El premio se compra a nombre del ganador: sus datos salen de su cuenta (o los ingresa el admin si es un participante de relleno). */
function titularDelPremio(db, rifa, ingresado, campos) {
  const u = rifa.ganador?.usuarioId ? db.usuarios.find(x => x.id === rifa.ganador.usuarioId) : null;
  if (u) return { nombres: u.nombres, apellidos: u.apellidos, dni: u.dni };
  const t = { nombres: texto(ingresado?.nombres), apellidos: texto(ingresado?.apellidos), dni: texto(ingresado?.dni) };
  if (!t.nombres || !t.apellidos || !esDniValido(t.dni)) campos.aNombreDe = 'Indica nombres, apellidos y DNI del ganador.';
  return t;
}

const sinErrores = campos => {
  if (Object.keys(campos).length) throw new ErrorDominio('VALIDACION', { campos });
};

const exigirEstado = (rifa, ...estados) => {
  if (!estados.includes(rifa.estado)) throw new ErrorDominio('TRANSICION_INVALIDA', { datos: { estado: rifa.estado } });
};

function esLinkConfiable(db, link) {
  try {
    const host = new URL(link).hostname.replace(/^www\./, '');
    return db.tiendas.some(t => t.activa && (host === t.dominio || host.endsWith('.' + t.dominio)));
  } catch {
    return false;
  }
}

/** Ejecuta una acción de admin sobre una rifa y devuelve su vista de administración. */
const sobreRifa = (rifaId, fn) => operacion(db => {
  const admin = exigirAdmin(db);
  const rifa = buscarRifa(db, rifaId);
  fn(db, rifa, admin);
  for (const u of db.usuarios) verificarCuadre(db, u.id);
  return vistaAdmin(db, rifa);
});

/** @type {import('../interfaces/admin.js').AdminService} */
export const adminServiceMock = {
  dashboard() {
    return operacion(db => {
      exigirAdmin(db);
      const rifasPorEstado = Object.fromEntries(ESTADOS_RIFA.map(e => [e, db.rifas.filter(r => r.estado === e).length]));
      const retenidoReales = db.usuarios.reduce((t, u) => t + saldo(db, u.id).retenido, 0);
      const retenidoRelleno = db.rifas.filter(r => [...ESTADOS_COMPROMISO, 'PROPUESTA'].includes(r.estado)).reduce((t, r) => t + r.puntosExternos, 0);
      return {
        recaudado: db.recargas.filter(r => r.estado === 'APROBADA').reduce((t, r) => t + r.monto, 0),
        retenidoTotal: retenidoReales + retenidoRelleno,
        rifasPorEstado,
      };
    });
  },

  listarRifas(filtro = {}) {
    return operacion(db => {
      exigirAdmin(db);
      return db.rifas.filter(r => !filtro.estado || r.estado === filtro.estado).map(r => vistaAdmin(db, r));
    });
  },

  obtenerRifa(rifaId) {
    return operacion(db => {
      exigirAdmin(db);
      return vistaAdmin(db, buscarRifa(db, rifaId));
    });
  },

  crearRifa(datos) {
    return operacion(db => {
      const admin = exigirAdmin(db);
      const campos = {};
      const nombre = String(datos.nombre ?? '').trim();
      const precio = Number(datos.precioTienda);
      if (!nombre) campos.nombre = 'Indica el nombre del producto.';
      if (!Number.isFinite(precio) || precio <= 0) campos.precioTienda = 'Indica el precio según la tienda.';
      try { new URL(datos.link); } catch { campos.link = 'Pega un link válido.'; }
      if (!db.categorias.some(c => c.id === datos.categoriaId)) campos.categoriaId = 'Elige una categoría.';
      if (Object.keys(campos).length) throw new ErrorDominio('VALIDACION', { campos });

      const config = { ...CONFIG_POR_DEFECTO, ...datos.config };
      const rifa = {
        id: nuevoId('r'), codigo: codigoUnico(db), slug: slugUnico(db, nombre), categoriaId: datos.categoriaId,
        producto: { nombre, emoji: datos.emoji ?? '🎁', imagen: null, precioTienda: precio, linkOriginal: datos.link, linkCompra: datos.link, estadoLink: 'VALIDO' },
        autor: { tipo: 'ADMIN', usuarioId: admin.id }, codigoAutor: null,
        estado: 'BORRADOR', visibilidad: 'LISTADA', config, meta: calcularMeta(precio, config.margenPct),
        puntosExternos: 0, participantesExternos: 0, ticketsExternos: 0, siguienteTicket: 1,
        puntosAlCierre: null, participantesAlCierre: null, fechas: { creada: ahora() },
        apodosFijos: {}, ganador: null, sorteo: null, hashLista: null, registros: {}, motivo: null,
        historial: [{ desde: null, hacia: 'BORRADOR', actor: admin.apodo, motivo: null, fecha: ahora() }],
      };
      db.rifas.push(rifa);
      return vistaAdmin(db, rifa);
    });
  },

  publicarRifa(rifaId) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      cambiarEstado(rifa, 'ARMANDO', { actor: admin.apodo });
      rifa.fechas.publicada = ahora();
      rifa.fechas.limiteArmado = sumarDias(rifa.fechas.publicada, rifa.config.ventanaArmadoDias);
    });
  },

  colaRevision() {
    return operacion(db => {
      exigirAdmin(db);
      return db.rifas.filter(r => ['CERRADA', 'EN_REVISION'].includes(r.estado)).map(r => vistaAdmin(db, r));
    });
  },

  aprobarYProgramar(rifaId, fechaSorteo) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'CERRADA', 'EN_REVISION');
      const fecha = new Date(fechaSorteo);
      if (Number.isNaN(fecha.getTime()) || fecha.getTime() <= Date.now()) {
        throw new ErrorDominio('VALIDACION', { campos: { fechaSorteo: 'Elige una fecha y hora futuras.' } });
      }
      if (rifa.estado === 'CERRADA') cambiarEstado(rifa, 'EN_REVISION', { actor: admin.apodo });
      asegurarHash(db, rifa);
      cambiarEstado(rifa, 'PROGRAMADA', { actor: admin.apodo, motivo: 'Revisión aprobada' });
      rifa.fechas.sorteo = fecha.toISOString();
    });
  },

  // Una Rifa Confirmada siempre se rifa: si el producto cambió o ya no existe, se entrega uno equivalente (§7.11).
  // Solo se puede cancelar por fuerza mayor legal, con reembolso total.
  cancelarRifa(rifaId, motivo, { fuerzaMayorLegal = false } = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      const texto = exigirTexto(motivo);
      if (ESTADOS_CONFIRMADOS.includes(rifa.estado) && !fuerzaMayorLegal) throw new ErrorDominio('RIFA_CONFIRMADA_NO_SE_CANCELA');
      if (ESTADOS_COMPROMISO.includes(rifa.estado)) congelarAvance(db, rifa);
      liberarCompromisos(db, rifa, 'Rifa cancelada.');
      reembolsarTickets(db, rifa, 'Rifa cancelada.');
      cambiarEstado(rifa, 'CANCELADA', { actor: admin.apodo, motivo: texto });
      rifa.motivo = texto;
      rifa.fechas.cancelada = ahora();
    });
  },

  sortear(rifaId, { ticketGanador } = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'PROGRAMADA');
      const hash = asegurarHash(db, rifa);
      const total = opcionesVendidas(rifa);
      // Semilla aleatoria; con ella y la huella publicada antes de rifar se mezclan las opciones y se elige una (README §7.8).
      const semilla = [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, '0')).join('');
      const { mezcla, posicion } = sortearOpciones(total, semilla, hash);
      let ticket = mezcla[posicion - 1];
      if (ticketGanador !== undefined) {   // solo para el panel de demo y las pruebas
        if (!Number.isInteger(ticketGanador) || ticketGanador < 1 || ticketGanador > total) throw new ErrorDominio('VALIDACION');
        ticket = ticketGanador;
      }
      const real = db.tickets.find(t => t.rifaId === rifa.id && t.numero === ticket);
      rifa.ganador = { apodo: apodoDeTicket(db, rifa, ticket), ticket, usuarioId: real?.usuarioId ?? null };
      rifa.sorteo = { semilla, ticketGanador: ticket, posicion: mezcla.indexOf(ticket) + 1, totalOpciones: total, fecha: ahora() };
      cambiarEstado(rifa, 'SORTEADA', { actor: admin.apodo });
    });
  },

  // La compra se hace fuera de la web: aquí solo se registra (README §7.12).
  registrarCompra(rifaId, datos = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'SORTEADA');
      const campos = {};
      const r = {
        fecha: fechaIso(datos.fecha), tienda: texto(datos.tienda),
        productoComprado: texto(datos.productoComprado) || rifa.producto.nombre,
        esEquivalente: datos.esEquivalente === true, justificacion: texto(datos.justificacion) || null,
        montoPagado: Number(datos.montoPagado), numeroComprobante: texto(datos.numeroComprobante),
        archivoComprobante: texto(datos.archivoComprobante),
      };
      if (!r.fecha) campos.fecha = 'Indica la fecha de compra.';
      if (!r.tienda) campos.tienda = 'Indica la tienda.';
      if (r.esEquivalente && !r.justificacion) campos.justificacion = 'Explica por qué es equivalente (igual o mayor valor).';
      if (!Number.isFinite(r.montoPagado) || r.montoPagado <= 0) campos.montoPagado = 'Indica el monto pagado.';
      if (!r.numeroComprobante) campos.numeroComprobante = 'Indica el número de boleta o factura.';
      if (!r.archivoComprobante) campos.archivoComprobante = 'Adjunta la foto o PDF del comprobante.';
      const aNombreDe = titularDelPremio(db, rifa, datos.aNombreDe, campos);
      sinErrores(campos);
      if (!r.esEquivalente) r.justificacion = null;
      cambiarEstado(rifa, 'COMPRANDO', { actor: admin.apodo });
      rifa.registros.compra = { ...r, aNombreDe, registradoPor: admin.apodo, registradoEl: ahora() };
    });
  },

  registrarEnvio(rifaId, datos = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'COMPRANDO');
      const campos = {};
      const r = {
        modalidad: datos.modalidad, courier: texto(datos.courier) || null,
        codigoSeguimiento: texto(datos.codigoSeguimiento) || null, fechaEstimada: fechaIso(datos.fechaEstimada),
      };
      if (!MODALIDADES_ENVIO.includes(r.modalidad)) campos.modalidad = 'Elige recojo en tienda o courier.';
      if (r.modalidad === 'COURIER' && !r.courier) campos.courier = 'Indica el courier.';
      if (r.modalidad === 'COURIER' && !r.codigoSeguimiento) campos.codigoSeguimiento = 'Indica el código de seguimiento.';
      if (!r.fechaEstimada) campos.fechaEstimada = 'Indica la fecha estimada.';
      sinErrores(campos);
      if (r.modalidad === 'RECOJO') { r.courier = null; r.codigoSeguimiento = null; }
      cambiarEstado(rifa, 'EN_CAMINO', { actor: admin.apodo });
      rifa.registros.envio = { ...r, registradoPor: admin.apodo, registradoEl: ahora() };
    });
  },

  registrarEntrega(rifaId, datos = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'EN_CAMINO');
      const campos = {};
      const r = {
        fecha: fechaIso(datos.fecha), recibidoPor: texto(datos.recibidoPor), dniVerificado: datos.dniVerificado === true,
        archivoEvidencia: texto(datos.archivoEvidencia), observaciones: texto(datos.observaciones) || null,
      };
      if (!r.fecha) campos.fecha = 'Indica la fecha de entrega.';
      if (!r.recibidoPor) campos.recibidoPor = 'Indica quién recibió el premio.';
      if (!r.dniVerificado) campos.dniVerificado = 'Verifica el DNI físico del ganador antes de entregar.';   // invariante 11
      if (!r.archivoEvidencia) campos.archivoEvidencia = 'Adjunta la foto o el acta de entrega.';
      sinErrores(campos);
      cambiarEstado(rifa, 'ENTREGADA', { actor: admin.apodo });
      rifa.registros.entrega = { ...r, registradoPor: admin.apodo, registradoEl: ahora() };
    });
  },

  validarLink(rifaId, { accion, nuevoLink, motivo } = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'REVISION_LINK');
      if (accion === 'RECHAZAR') {
        const texto = exigirTexto(motivo);
        cambiarEstado(rifa, 'DESCARTADA', { actor: admin.apodo, motivo: texto });
        rifa.motivo = texto;
        return;
      }
      if (accion === 'REEMPLAZAR') {
        if (!esLinkConfiable(db, nuevoLink)) throw new ErrorDominio('LINK_INVALIDO', { mensaje: 'El link de reemplazo debe ser de una tienda confiable.' });
        rifa.producto.linkCompra = nuevoLink;        // el original se conserva en linkOriginal
        rifa.producto.estadoLink = 'REEMPLAZADO';
      } else if (accion === 'APROBAR') {
        rifa.producto.estadoLink = 'VALIDO';
      } else {
        throw new ErrorDominio('VALIDACION');
      }
      cambiarEstado(rifa, 'CAPTANDO', { actor: admin.apodo, motivo: accion === 'REEMPLAZAR' ? 'Link reemplazado' : 'Link validado' });
      rifa.fechas.limiteCaptacion = sumarDias(ahora(), rifa.config.ventanaCaptacionDias);
    });
  },

  moderarPropuesta(rifaId, { accion, margenPct, motivo } = {}) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'PROPUESTA');
      if (accion === 'RECHAZAR') {
        const texto = exigirTexto(motivo);
        congelarAvance(db, rifa);
        liberarCompromisos(db, rifa, 'Propuesta descartada.');
        cambiarEstado(rifa, 'DESCARTADA', { actor: admin.apodo, motivo: texto });
        rifa.motivo = texto;
        return;
      }
      if (accion !== 'APROBAR') throw new ErrorDominio('VALIDACION');
      if (margenPct !== undefined) {
        if (!Number.isFinite(margenPct) || margenPct < 0 || margenPct > 100) throw new ErrorDominio('VALIDACION', { campos: { margenPct: 'El margen debe estar entre 0 y 100 %.' } });
        fijarMargen(rifa, margenPct);
      }
      cambiarEstado(rifa, 'ARMANDO', { actor: admin.apodo, motivo: 'Propuesta aprobada' });   // conserva sus compromisos
      rifa.fechas.publicada = ahora();
      rifa.fechas.limiteArmado = sumarDias(rifa.fechas.publicada, rifa.config.ventanaArmadoDias);
      evaluarAvance(db, rifa);
    });
  },

  listarPropuestas() {
    return operacion(db => {
      exigirAdmin(db);
      return db.rifas.filter(r => ['REVISION_LINK', 'PROPUESTA'].includes(r.estado)).map(r => vistaAdmin(db, r));
    });
  },

  actualizarProducto(rifaId, cambios = {}) {
    return sobreRifa(rifaId, (db, rifa) => {
      if (cambios.nombre !== undefined) rifa.producto.nombre = exigirTexto(cambios.nombre, 'DATOS_INCOMPLETOS');
      if (cambios.precioTienda !== undefined) {
        exigirEstado(rifa, 'BORRADOR', 'REVISION_LINK', 'CAPTANDO', 'PROPUESTA');   // la meta no cambia con la rifa ya pública
        const precio = Number(cambios.precioTienda);
        if (!Number.isFinite(precio) || precio <= 0) throw new ErrorDominio('VALIDACION', { campos: { precioTienda: 'Precio no válido.' } });
        rifa.producto.precioTienda = precio;
        fijarMargen(rifa, rifa.config.margenPct);
      }
    });
  },

  listarUsuarios() {
    return operacion(db => {
      exigirAdmin(db);
      return db.usuarios.map(u => ({ ...vistaUsuario(u), ...saldo(db, u.id) }));
    });
  },

  obtenerUsuario(usuarioId) {
    return operacion(db => {
      exigirAdmin(db);
      const u = db.usuarios.find(x => x.id === usuarioId);
      if (!u) throw new ErrorDominio('NO_ENCONTRADA');
      const movimientos = db.movimientos.filter(m => m.usuarioId === u.id).sort((a, b) => b.fecha.localeCompare(a.fecha));
      return { usuario: vistaUsuario(u), billetera: saldo(db, u.id), movimientos };
    });
  },

  ajustarSaldo(usuarioId, puntos, motivo) {
    return operacion(db => {
      const admin = exigirAdmin(db);
      const texto = exigirTexto(motivo);
      if (!Number.isInteger(puntos) || puntos === 0) throw new ErrorDominio('CANTIDAD_INVALIDA');
      const u = db.usuarios.find(x => x.id === usuarioId && x.rol === 'PARTICIPANTE');
      if (!u) throw new ErrorDominio('NO_ENCONTRADA');
      const m = registrarMovimiento(db, { usuarioId: u.id, tipo: 'AJUSTE', deltaDisponible: puntos, motivo: texto, referencia: `admin:${admin.id}` });
      verificarCuadre(db, u.id);
      return m;
    });
  },

  listarCategorias() {
    return operacion(db => {
      exigirAdmin(db);
      return [...db.categorias].sort((a, b) => a.orden - b.orden);
    });
  },

  guardarCategoria(categoria) {
    return operacion(db => {
      exigirAdmin(db);
      const nombre = String(categoria.nombre ?? '').trim();
      if (!nombre) throw new ErrorDominio('VALIDACION', { campos: { nombre: 'Indica el nombre.' } });
      const repetida = db.categorias.find(c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== categoria.id);
      if (repetida) throw new ErrorDominio('VALIDACION', { campos: { nombre: 'Ya existe una categoría con ese nombre.' } });
      let c = categoria.id ? db.categorias.find(x => x.id === categoria.id) : null;
      if (categoria.id && !c) throw new ErrorDominio('NO_ENCONTRADA');
      if (!c) {
        c = { id: nuevoId('cat'), icono: '🎁', orden: db.categorias.length + 1, activa: true };
        db.categorias.push(c);
      }
      Object.assign(c, { ...categoria, id: c.id, nombre });
      return c;
    });
  },

  // --- Simulación de procesos automáticos (solo Fase 0) ---

  simularAporteExterno(rifaId, puntos, personas = 1) {
    return sobreRifa(rifaId, (db, rifa) => {
      if (!Number.isInteger(puntos) || puntos <= 0 || !Number.isInteger(personas) || personas < 0) throw new ErrorDominio('CANTIDAD_INVALIDA');
      if (ESTADOS_COMPROMISO.includes(rifa.estado)) {
        rifa.puntosExternos += puntos;
        rifa.participantesExternos += personas;
        evaluarAvance(db, rifa);
      } else if (rifa.estado === 'ABIERTA') {
        const tope = rifa.config.topeTickets;
        const n = tope != null ? Math.min(puntos, tope - opcionesVendidas(rifa)) : puntos;
        rifa.ticketsExternos += n;
        rifa.siguienteTicket += n;
        rifa.participantesExternos += personas;
        for (let i = 0; i < personas; i++) registrarActividadCierre(db, rifa, nuevoId('persona'));   // cada una cuenta para el tiempo extra
        if (tope != null && opcionesVendidas(rifa) >= tope) cerrarRifa(db, rifa);
      } else {
        throw new ErrorDominio('ESTADO_NO_ACEPTA_PUNTOS');
      }
    });
  },

  /** Fija cuántos minutos le quedan a una Rifa Confirmada (para probar el tiempo extra y el cierre automático). */
  simularTiempoRestante(rifaId, minutos) {
    return sobreRifa(rifaId, (db, rifa) => {
      exigirEstado(rifa, 'ABIERTA');
      if (!Number.isFinite(minutos)) throw new ErrorDominio('CANTIDAD_INVALIDA');
      rifa.fechas.cierre = new Date(Date.now() + minutos * 60000).toISOString();
      rifa.extension = { personas: [], minutosExtra: rifa.extension?.minutosExtra ?? 0 };
    });
  },

  vencerVentana(rifaId) {
    return sobreRifa(rifaId, (db, rifa, admin) => declararNoArmada(db, rifa, admin.apodo));
  },

  cerrarRifa(rifaId) {
    return sobreRifa(rifaId, (db, rifa, admin) => {
      exigirEstado(rifa, 'ABIERTA');
      cerrarRifa(db, rifa, admin.apodo);
    });
  },
};
