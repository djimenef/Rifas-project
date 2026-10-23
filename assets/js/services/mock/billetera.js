// BilleteraService — implementación mock (Fase 0).
import { operacion } from './db.js';
import { exigirParticipante, saldo, registrarMovimiento, conIdempotencia, verificarCuadre, refRifa, ahora } from './motor.js';
import { ErrorDominio } from '../../domain/errores.js';
import { MEDIOS_PAGO, TIPOS_MOVIMIENTO, ETIQUETA_MOVIMIENTO } from '../../domain/billetera.js';
import { nuevoId } from '../../lib/ids.js';

const masReciente = (a, b) => b.fecha.localeCompare(a.fecha) || b.numeroOperacion.localeCompare(a.numeroOperacion);

/** @type {import('../interfaces/billetera.js').BilleteraService} */
export const billeteraServiceMock = {
  obtener() {
    return operacion(db => {
      const u = exigirParticipante(db);
      const retenidoPorRifa = db.compromisos
        .filter(c => c.usuarioId === u.id && c.estado === 'ACTIVO')
        .map(c => {
          const { id, ...ref } = refRifa(db.rifas.find(r => r.id === c.rifaId));
          return { rifaId: c.rifaId, ...ref, puntos: c.cantidad };
        });
      return { ...saldo(db, u.id), retenidoPorRifa };
    });
  },

  historial(filtro = {}) {
    return operacion(db => {
      const u = exigirParticipante(db);
      if (filtro.tipo && !TIPOS_MOVIMIENTO.includes(filtro.tipo)) throw new ErrorDominio('VALIDACION');
      return db.movimientos
        .filter(m => m.usuarioId === u.id)
        .filter(m => !filtro.rifaId || m.rifaId === filtro.rifaId)
        .filter(m => !filtro.tipo || m.tipo === filtro.tipo)
        .sort(masReciente)
        .map(m => {
          const r = m.rifaId ? db.rifas.find(x => x.id === m.rifaId) : null;
          const { id, ...ref } = r ? refRifa(r) : {};
          return { ...m, etiqueta: ETIQUETA_MOVIMIENTO[m.tipo], ...(r ? { rifa: ref } : {}) };
        });
    });
  },

  listarPaquetes() {
    return operacion(db => db.paquetes.filter(p => p.activo).sort((a, b) => a.puntos - b.puntos));
  },

  recargar(paqueteId, { medioPago, claveIdempotencia, simularRechazo = false } = {}) {
    return operacion(db => {
      const u = exigirParticipante(db);
      return conIdempotencia(db, u.id, 'RECARGA', claveIdempotencia, () => {
        const paquete = db.paquetes.find(p => p.id === paqueteId);
        if (!paquete?.activo) throw new ErrorDominio('PAQUETE_INACTIVO');
        if (!MEDIOS_PAGO.includes(medioPago)) throw new ErrorDominio('VALIDACION', { campos: { medioPago: 'Elige un medio de pago.' } });
        if (simularRechazo) throw new ErrorDominio('PAGO_RECHAZADO');

        const antes = saldo(db, u.id);
        const recarga = {
          id: nuevoId('rc'), usuarioId: u.id, paqueteId, monto: paquete.precio, puntos: paquete.puntos,
          medioPago, estado: 'APROBADA', referencia: 'PSP-' + Date.now().toString().slice(-8), fecha: ahora(),
        };
        db.recargas.push(recarga);
        const m = registrarMovimiento(db, { usuarioId: u.id, tipo: 'RECARGA', deltaDisponible: paquete.puntos, referencia: recarga.id });
        verificarCuadre(db, u.id);
        const despues = saldo(db, u.id);
        return {
          numeroOperacion: m.numeroOperacion, tipo: 'RECARGA', cantidad: paquete.puntos,
          disponibleAntes: antes.disponible, disponibleDespues: despues.disponible,
          retenidoAntes: antes.retenido, retenidoDespues: despues.retenido,
          fecha: m.fecha, claveIdempotencia,
        };
      });
    });
  },
};
