// RifasService — implementación mock (Fase 0). Aplica las reglas de README §7.3, §7.5 y §7.10.
import { operacion } from './db.js';
import {
  usuarioActual, exigirSesion, exigirParticipante, buscarRifa, vistaPublica, saldo, registrarMovimiento,
  verificarCuadre, conIdempotencia, compromisoActivo, ticketsDe, maxPorParticipante, puntosReunidos,
  participantes, umbral, puntosMinAutor, emitirTickets, evaluarAvance, cerrarRifa, cambiarEstado,
  congelarAvance, liberarCompromisos, opcionesVendidas, refRifa, ahora, sumarDias,
} from './motor.js';
import { ErrorDominio } from '../../domain/errores.js';
import {
  ESTADOS_COMPROMISO, ESTADOS_COMPRA, ESTADOS_SOLO_AUTOR, GRUPOS_MIS_RIFAS, ESTADOS_CON_GANADOR,
  CONFIG_POR_DEFECTO, LIMITE_PROPUESTAS, RANGO_PRECIO_PROPUESTA, calcularMeta,
} from '../../domain/rifa.js';
import { acortadoresMock, productosLeiblesMock } from '../../mocks/catalogos.js';
import { generarCodigoRifa, slugificar, nuevoId } from '../../lib/ids.js';

/** Orden del listado público: primero lo que recibe puntos. */
const ORDEN_LISTADO = ['ARMANDO', 'ABIERTA', 'PROGRAMADA', 'EN_REVISION', 'CERRADA', 'SORTEADA', 'COMPRANDO', 'EN_CAMINO', 'ENTREGADA', 'NO_SE_ARMO', 'CANCELADA'];

const normalizar = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** ¿Puede este usuario ver la rifa? BORRADOR, REVISION_LINK y DESCARTADA solo las ven su autor y los admins. */
function puedeVer(usuario, rifa) {
  if (!ESTADOS_SOLO_AUTOR.includes(rifa.estado)) return true;
  return !!usuario && (usuario.rol === 'ADMIN' || usuario.id === rifa.autor.usuarioId);
}

function rifaVisible(db, rifa) {
  if (!rifa || !puedeVer(usuarioActual(db), rifa)) throw new ErrorDominio('NO_ENCONTRADA');
  return rifa;
}

function validarCantidad(rifa, n) {
  if (!Number.isInteger(n) || n <= 0) throw new ErrorDominio('CANTIDAD_INVALIDA');
  if (n < rifa.config.minPorParticipante) throw new ErrorDominio('BAJO_MINIMO', { datos: { minimo: rifa.config.minPorParticipante } });
}

const misTicketsEn = (db, rifaId, usuarioId) => ticketsDe(db, rifaId).filter(t => t.usuarioId === usuarioId).map(t => t.numero).sort((a, b) => a - b);

function comprobante(db, { mov, tipo, cantidad, antes, usuarioId, rifa, clave, extra = {} }) {
  const despues = saldo(db, usuarioId);
  return {
    numeroOperacion: mov.numeroOperacion, tipo, cantidad,
    disponibleAntes: antes.disponible, disponibleDespues: despues.disponible,
    retenidoAntes: antes.retenido, retenidoDespues: despues.retenido,
    fecha: mov.fecha, claveIdempotencia: clave ?? null, rifa: refRifa(rifa), ...extra,
  };
}

/** Verifica el cuadre de todos los participantes reales (la confirmación de una rifa toca a varios). */
function verificarCuadreTodos(db) {
  for (const u of db.usuarios) verificarCuadre(db, u.id);
}

/** Lectura simulada del link (README §7.11). En la Fase 1 se leerá la página real. */
function leer(db, link) {
  let url;
  try { url = new URL(String(link ?? '').trim()); } catch { throw new ErrorDominio('LINK_INVALIDO'); }
  if (!['http:', 'https:'].includes(url.protocol)) throw new ErrorDominio('LINK_INVALIDO');
  const host = url.hostname.replace(/^www\./, '');
  const base = { nombre: null, precio: null, emoji: '🎁', tiendaConfiable: false, motivoRevision: null };
  if (acortadoresMock.includes(host)) return { ...base, motivoRevision: 'Es un link acortado.' };
  const tienda = db.tiendas.find(t => t.activa && (host === t.dominio || host.endsWith('.' + t.dominio)));
  if (!tienda) return { ...base, motivoRevision: 'La tienda no está en la lista de tiendas confiables.' };
  const conocido = productosLeiblesMock[url.origin + url.pathname];
  if (conocido) return { ...base, ...conocido, tiendaConfiable: true };
  const ultimo = url.pathname.split('/').filter(Boolean).pop();
  if (!ultimo) return { ...base, tiendaConfiable: true, motivoRevision: 'No se pudo leer el producto desde el link.' };
  const nombre = decodeURIComponent(ultimo).replace(/[-_]+/g, ' ').replace(/\.\w+$/, '').trim();
  return { ...base, nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1), tiendaConfiable: true };
}

export function codigoUnico(db) {
  let codigo;
  do { codigo = generarCodigoRifa(); } while (db.rifas.some(r => r.codigo === codigo));
  return codigo;
}

export function slugUnico(db, nombre) {
  const base = slugificar(nombre) || 'rifa';
  let slug = base, n = 2;
  while (db.rifas.some(r => r.slug === slug)) slug = `${base}-${n++}`;
  return slug;
}

/** @type {import('../interfaces/rifas.js').RifasService} */
export const rifasServiceMock = {
  listar(filtro = {}) {
    return operacion(db => {
      const busqueda = normalizar(filtro.busqueda);
      return db.rifas
        .filter(r => r.visibilidad === 'LISTADA' && ORDEN_LISTADO.includes(r.estado))   // invariante 19
        .filter(r => !filtro.estados?.length || filtro.estados.includes(r.estado))
        .filter(r => !filtro.categoriaId || r.categoriaId === filtro.categoriaId)
        .filter(r => !busqueda || normalizar(r.producto.nombre).includes(busqueda))
        .map(r => vistaPublica(db, r))
        .sort((a, b) => ORDEN_LISTADO.indexOf(a.estado) - ORDEN_LISTADO.indexOf(b.estado) || b.progreso - a.progreso);
    });
  },

  obtenerPorSlug(slug) {
    return operacion(db => vistaPublica(db, rifaVisible(db, db.rifas.find(r => r.slug === slug))));
  },

  obtenerPorCodigo(codigo) {
    const c = String(codigo ?? '').trim().toUpperCase();
    return operacion(db => vistaPublica(db, rifaVisible(db, db.rifas.find(r => r.codigo === c))));
  },

  listarCategorias() {
    return operacion(db => db.categorias.filter(c => c.activa).sort((a, b) => a.orden - b.orden));
  },

  miParticipacion(rifaId) {
    return operacion(db => {
      const u = exigirParticipante(db);
      const rifa = rifaVisible(db, buscarRifa(db, rifaId));
      const retenido = compromisoActivo(db, rifa.id, u.id)?.cantidad ?? 0;
      const tickets = misTicketsEn(db, rifa.id, u.id);
      const aceptaPuntos = [...ESTADOS_COMPROMISO, ...ESTADOS_COMPRA].includes(rifa.estado);
      const restanteMaximo = maxPorParticipante(rifa) - retenido - tickets.length;
      const restanteTope = rifa.estado === 'ABIERTA' && rifa.config.topeTickets != null ? rifa.config.topeTickets - opcionesVendidas(rifa) : Infinity;
      return {
        retenido, tickets,
        maxPuedoPoner: aceptaPuntos ? Math.max(0, Math.min(saldo(db, u.id).disponible, restanteMaximo, restanteTope)) : 0,
        puedeRetirar: ESTADOS_COMPROMISO.includes(rifa.estado) && rifa.config.permiteRetiro && retenido > 0,
      };
    });
  },

  comprometer(rifaId, n, claveIdempotencia) {
    return operacion(db => {
      const u = exigirParticipante(db);
      return conIdempotencia(db, u.id, `COMPROMISO:${rifaId}`, claveIdempotencia, () => {
        const rifa = rifaVisible(db, buscarRifa(db, rifaId));
        if (rifa.estado === 'REVISION_LINK') throw new ErrorDominio('LINK_EN_REVISION');          // invariante 21
        if (!ESTADOS_COMPROMISO.includes(rifa.estado)) throw new ErrorDominio('ESTADO_NO_ACEPTA_PUNTOS', { datos: { estado: rifa.estado } });
        validarCantidad(rifa, n);
        const existente = compromisoActivo(db, rifa.id, u.id);
        const usado = existente?.cantidad ?? 0;
        if (usado + n > maxPorParticipante(rifa)) {
          throw new ErrorDominio('SUPERA_MAXIMO', { datos: { puedesPoner: Math.max(0, maxPorParticipante(rifa) - usado) } });
        }
        const antes = saldo(db, u.id);
        if (n > antes.disponible) throw new ErrorDominio('SALDO_INSUFICIENTE', { datos: { disponible: antes.disponible, faltan: n - antes.disponible } });

        const mov = registrarMovimiento(db, { usuarioId: u.id, tipo: 'RETENCION', deltaDisponible: -n, deltaRetenido: n, rifaId: rifa.id });
        if (existente) existente.cantidad += n;
        else db.compromisos.push({ id: 'cmp-' + mov.id, rifaId: rifa.id, usuarioId: u.id, cantidad: n, estado: 'ACTIVO', fecha: mov.fecha });

        const efecto = evaluarAvance(db, rifa);       // ¿se cubrió la meta o el umbral?
        verificarCuadreTodos(db);
        return comprobante(db, {
          mov, tipo: 'COMPROMISO', cantidad: n, antes, usuarioId: u.id, rifa, clave: claveIdempotencia,
          extra: {
            rifaConfirmada: efecto === 'CONFIRMADA',
            pasoAModeracion: efecto === 'A_MODERACION',
            ...(efecto === 'CONFIRMADA' ? { tickets: misTicketsEn(db, rifa.id, u.id) } : {}),
          },
        });
      });
    });
  },

  retirarCompromiso(rifaId) {
    return operacion(db => {
      const u = exigirParticipante(db);
      const rifa = rifaVisible(db, buscarRifa(db, rifaId));
      if (!ESTADOS_COMPROMISO.includes(rifa.estado) || !rifa.config.permiteRetiro) throw new ErrorDominio('RETIRO_NO_PERMITIDO');
      const c = compromisoActivo(db, rifa.id, u.id);
      if (!c) throw new ErrorDominio('SIN_COMPROMISO');

      const antes = saldo(db, u.id);
      const mov = registrarMovimiento(db, { usuarioId: u.id, tipo: 'LIBERACION', deltaDisponible: c.cantidad, deltaRetenido: -c.cantidad, rifaId: rifa.id, motivo: 'Retiraste tus puntos.' });
      c.estado = 'LIBERADO';

      // Decisión #21: si el autor retira sus puntos mínimos, la propuesta se cae.
      if (rifa.estado === 'CAPTANDO' && rifa.autor.usuarioId === u.id) {
        congelarAvance(db, rifa);
        liberarCompromisos(db, rifa, 'El autor retiró su propuesta.');
        cambiarEstado(rifa, 'DESCARTADA', { actor: u.apodo, motivo: 'El autor retiró sus puntos mínimos' });
        rifa.motivo = 'El autor retiró su propuesta. Se devolvieron todos los puntos.';
      }
      verificarCuadreTodos(db);
      return comprobante(db, { mov, tipo: 'RETIRO', cantidad: c.cantidad, antes, usuarioId: u.id, rifa });
    });
  },

  comprar(rifaId, n, claveIdempotencia) {
    return operacion(db => {
      const u = exigirParticipante(db);
      return conIdempotencia(db, u.id, `COMPRA:${rifaId}`, claveIdempotencia, () => {
        const rifa = rifaVisible(db, buscarRifa(db, rifaId));
        if (!ESTADOS_COMPRA.includes(rifa.estado)) throw new ErrorDominio('ESTADO_NO_ACEPTA_PUNTOS', { datos: { estado: rifa.estado } });
        validarCantidad(rifa, n);
        const mios = misTicketsEn(db, rifa.id, u.id).length;
        if (mios + n > maxPorParticipante(rifa)) {
          throw new ErrorDominio('SUPERA_MAXIMO', { datos: { puedesPoner: Math.max(0, maxPorParticipante(rifa) - mios) } });
        }
        const tope = rifa.config.topeTickets;
        if (tope != null && opcionesVendidas(rifa) + n > tope) {
          throw new ErrorDominio('TOPE_ALCANZADO', { datos: { quedan: Math.max(0, tope - opcionesVendidas(rifa)) } });
        }
        const antes = saldo(db, u.id);
        if (n > antes.disponible) throw new ErrorDominio('SALDO_INSUFICIENTE', { datos: { disponible: antes.disponible, faltan: n - antes.disponible } });

        const mov = registrarMovimiento(db, { usuarioId: u.id, tipo: 'COMPRA_DIRECTA', deltaDisponible: -n, rifaId: rifa.id });
        const tickets = emitirTickets(db, rifa, u.id, n);
        if (tope != null && opcionesVendidas(rifa) >= tope) cerrarRifa(db, rifa);   // tope alcanzado → se cierra
        verificarCuadreTodos(db);
        return comprobante(db, { mov, tipo: 'COMPRA', cantidad: n, antes, usuarioId: u.id, rifa, clave: claveIdempotencia, extra: { tickets } });
      });
    });
  },

  misRifas() {
    return operacion(db => {
      const u = exigirParticipante(db);
      const grupoDe = estado => Object.keys(GRUPOS_MIS_RIFAS).find(g => GRUPOS_MIS_RIFAS[g].includes(estado));
      return db.rifas
        .map(rifa => {
          const propios = db.compromisos.filter(c => c.rifaId === rifa.id && c.usuarioId === u.id);
          const tickets = misTicketsEn(db, rifa.id, u.id);
          const retenido = propios.find(c => c.estado === 'ACTIVO')?.cantidad ?? 0;
          // Si retiró sus puntos de una rifa que sigue armándose, ya no la mostramos.
          const participa = retenido > 0 || tickets.length > 0 || (propios.length > 0 && !ESTADOS_COMPROMISO.includes(rifa.estado));
          const ultima = propios.map(c => c.fecha).sort().pop() ?? '';
          return participa ? { grupo: grupoDe(rifa.estado), rifa: vistaPublica(db, rifa), retenido, tickets, ultima } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.ultima.localeCompare(a.ultima))
        .map(({ ultima, ...x }) => x);
    });
  },

  misTickets(codigo) {
    return operacion(db => {
      const u = exigirParticipante(db);
      const rifa = rifaVisible(db, db.rifas.find(r => r.codigo === String(codigo ?? '').trim().toUpperCase()));
      return {
        rifa: vistaPublica(db, rifa),
        retenido: compromisoActivo(db, rifa.id, u.id)?.cantidad ?? 0,
        tickets: misTicketsEn(db, rifa.id, u.id),
      };
    });
  },

  ganadores() {
    return operacion(db => db.rifas
      .filter(r => ESTADOS_CON_GANADOR.includes(r.estado) && r.ganador)
      .sort((a, b) => (b.sorteo?.fecha ?? '').localeCompare(a.sorteo?.fecha ?? ''))
      .map(r => vistaPublica(db, r)));
  },

  leerLink(link) {
    return operacion(db => {
      exigirSesion(db);
      return leer(db, link);
    });
  },

  proponer(datos) {
    return operacion(db => {
      const u = exigirParticipante(db);
      if (u.estado !== 'ACTIVO') throw new ErrorDominio('CUENTA_NO_VERIFICADA');
      const activas = db.rifas.filter(r => r.autor.usuarioId === u.id && ['REVISION_LINK', 'CAPTANDO', 'PROPUESTA'].includes(r.estado)).length;
      const limite = u.creadorVerificado ? LIMITE_PROPUESTAS.creadorVerificado : LIMITE_PROPUESTAS.participante;
      if (activas >= limite) throw new ErrorDominio('LIMITE_PROPUESTAS', { datos: { limite } });
      if (!db.categorias.some(c => c.id === datos.categoriaId && c.activa)) throw new ErrorDominio('CATEGORIA_INVALIDA');
      const lectura = leer(db, datos.link);
      const nombre = String(datos.nombre ?? lectura.nombre ?? '').trim();
      if (!nombre) throw new ErrorDominio('DATOS_INCOMPLETOS', { campos: { nombre: 'Indica el nombre del producto.' } });
      const precio = Number(datos.precioTienda);
      if (!Number.isFinite(precio) || precio < RANGO_PRECIO_PROPUESTA.min || precio > RANGO_PRECIO_PROPUESTA.max) {
        throw new ErrorDominio('PRECIO_FUERA_DE_RANGO', { datos: { ...RANGO_PRECIO_PROPUESTA } });
      }

      const confiable = lectura.tiendaConfiable && !lectura.motivoRevision;
      const config = { ...CONFIG_POR_DEFECTO };
      const link = String(datos.link).trim();
      const rifa = {
        id: nuevoId('r'), codigo: codigoUnico(db), slug: slugUnico(db, nombre), categoriaId: datos.categoriaId,
        producto: { nombre, emoji: datos.emoji ?? lectura.emoji, imagen: null, precioTienda: precio, linkOriginal: link, linkCompra: link, estadoLink: confiable ? 'VALIDO' : 'EN_REVISION' },
        autor: { tipo: u.creadorVerificado ? 'CREADOR' : 'PARTICIPANTE', usuarioId: u.id },
        codigoAutor: u.apodo.toUpperCase().replace(/[^A-Z0-9]+/g, '-'),
        estado: confiable ? 'CAPTANDO' : 'REVISION_LINK', visibilidad: 'SOLO_ENLACE',
        config, meta: calcularMeta(precio, config.margenPct),
        puntosExternos: 0, participantesExternos: 0, ticketsExternos: 0, siguienteTicket: 1,
        puntosAlCierre: null, participantesAlCierre: null,
        fechas: { creada: ahora(), ...(confiable ? { limiteCaptacion: sumarDias(ahora(), config.ventanaCaptacionDias) } : {}) },
        apodosFijos: {}, ganador: null, sorteo: null, hashLista: null, registros: {}, motivo: null,
        historial: [{ desde: null, hacia: confiable ? 'CAPTANDO' : 'REVISION_LINK', actor: u.apodo, motivo: lectura.motivoRevision, fecha: ahora() }],
      };

      if (confiable) {
        // El autor pone puntos propios (mínimo 1 % de la meta).
        const minimo = puntosMinAutor(rifa);
        const n = Number(datos.puntosAutor);
        if (!Number.isInteger(n) || n < minimo) throw new ErrorDominio('BAJO_MINIMO', { mensaje: `Debes poner al menos ${minimo} puntos propios.`, datos: { minimo } });
        if (n > saldo(db, u.id).disponible) throw new ErrorDominio('SALDO_INSUFICIENTE', { datos: { disponible: saldo(db, u.id).disponible } });
        db.rifas.push(rifa);
        const mov = registrarMovimiento(db, { usuarioId: u.id, tipo: 'RETENCION', deltaDisponible: -n, deltaRetenido: n, rifaId: rifa.id });
        db.compromisos.push({ id: 'cmp-' + mov.id, rifaId: rifa.id, usuarioId: u.id, cantidad: n, estado: 'ACTIVO', fecha: mov.fecha });
        evaluarAvance(db, rifa);
      } else {
        db.rifas.push(rifa);   // en revisión no recibe puntos hasta que un admin valide el link
      }
      verificarCuadreTodos(db);
      return vistaPublica(db, rifa);
    });
  },

  misPropuestas() {
    return operacion(db => {
      const u = exigirParticipante(db);
      return db.rifas
        .filter(r => r.autor.usuarioId === u.id)
        .sort((a, b) => b.fechas.creada.localeCompare(a.fechas.creada))
        .map(r => ({
          rifa: vistaPublica(db, r),
          avanceUmbral: r.estado === 'CAPTANDO' ? Math.min(100, Math.floor(puntosReunidos(db, r) / umbral(r) * 100))
            : r.estado === 'REVISION_LINK' ? 0 : 100,
          faltanParticipantes: r.estado === 'CAPTANDO' ? Math.max(0, r.config.umbralMinParticipantes - participantes(db, r)) : 0,
          codigoAutor: r.codigoAutor,
        }));
    });
  },
};
