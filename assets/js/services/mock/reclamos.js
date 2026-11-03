// ReclamosService — implementación mock (Fase 0). Guarda la hoja de reclamación; en la Fase 1 además se envía por correo.
import { operacion } from './db.js';
import { ahora } from './motor.js';
import { ErrorDominio } from '../../domain/errores.js';
import { esDniValido, esCelularValido, esCorreoValido } from '../../domain/usuario.js';
import { TIPOS_RECLAMO, TIPOS_BIEN, PLAZO_RESPUESTA_DIAS_HABILES, sumarDiasHabiles } from '../../domain/reclamo.js';

const texto = v => String(v ?? '').trim();

/** @type {import('../interfaces/reclamos.js').ReclamosService} */
export const reclamosServiceMock = {
  registrar(datos = {}) {
    return operacion(db => {
      const d = {
        nombres: texto(datos.nombres), apellidos: texto(datos.apellidos), tipoDocumento: datos.tipoDocumento === 'CE' ? 'CE' : 'DNI',
        numeroDocumento: texto(datos.numeroDocumento), domicilio: texto(datos.domicilio), celular: texto(datos.celular),
        correo: texto(datos.correo).toLowerCase(), esMenor: datos.esMenor === true, apoderado: texto(datos.apoderado) || null,
        tipoBien: datos.tipoBien, descripcionBien: texto(datos.descripcionBien), codigoRifa: texto(datos.codigoRifa).toUpperCase() || null,
        montoReclamado: texto(datos.montoReclamado) === '' ? null : Number(datos.montoReclamado),
        tipo: datos.tipo, detalle: texto(datos.detalle), pedido: texto(datos.pedido), aceptaRespuestaCorreo: datos.aceptaRespuestaCorreo === true,
      };
      const campos = {};
      if (!d.nombres) campos.nombres = 'Ingresa tus nombres.';
      if (!d.apellidos) campos.apellidos = 'Ingresa tus apellidos.';
      if (d.tipoDocumento === 'DNI' ? !esDniValido(d.numeroDocumento) : !/^[0-9]{9,12}$/.test(d.numeroDocumento)) {
        campos.numeroDocumento = d.tipoDocumento === 'DNI' ? 'El DNI debe tener 8 dígitos.' : 'El carné de extranjería debe tener de 9 a 12 dígitos.';
      }
      if (!d.domicilio) campos.domicilio = 'Ingresa tu domicilio.';
      if (!esCelularValido(d.celular)) campos.celular = 'El celular debe tener 9 dígitos y empezar con 9.';
      if (!esCorreoValido(d.correo)) campos.correo = 'Ingresa un correo válido.';
      if (d.esMenor && !d.apoderado) campos.apoderado = 'Indica el nombre de tu padre, madre o apoderado.';
      if (!TIPOS_BIEN.includes(d.tipoBien)) campos.tipoBien = 'Elige producto o servicio.';
      if (d.montoReclamado !== null && (!Number.isFinite(d.montoReclamado) || d.montoReclamado < 0)) campos.montoReclamado = 'Ingresa un monto válido o déjalo en blanco.';
      if (!d.descripcionBien) campos.descripcionBien = 'Describe el producto o servicio.';
      if (!TIPOS_RECLAMO.includes(d.tipo)) campos.tipo = 'Elige reclamo o queja.';
      if (!d.detalle) campos.detalle = 'Cuéntanos qué pasó.';
      if (!d.pedido) campos.pedido = 'Indica qué solicitas.';
      if (!d.aceptaRespuestaCorreo) campos.aceptaRespuestaCorreo = 'Necesitamos tu correo para enviarte la respuesta.';
      if (Object.keys(campos).length) throw new ErrorDominio('VALIDACION', { campos });

      db.secuencias.reclamo += 1;
      const fecha = ahora();
      const hoja = {
        numero: `LR-${new Date(fecha).getFullYear()}-${String(db.secuencias.reclamo).padStart(6, '0')}`,
        fecha, respuestaHasta: sumarDiasHabiles(fecha, PLAZO_RESPUESTA_DIAS_HABILES), enviadoA: d.correo, tipo: d.tipo,
      };
      db.reclamos.push({ ...d, ...hoja });
      return hoja;
    });
  },
};
