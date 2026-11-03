// AuthService — implementación mock (Fase 0).
import { operacion, leerAhora } from './db.js';
import { usuarioActual, exigirSesion, vistaUsuario, ahora } from './motor.js';
import { ErrorDominio } from '../../domain/errores.js';
import {
  EDAD_MINIMA, LARGO_MIN_CONTRASENA, edad, esDniValido, esCelularValido, esCorreoValido, esApodoValido,
} from '../../domain/usuario.js';
import { CODIGO_VERIFICACION_DEMO, TOKEN_RECUPERACION_DEMO } from '../../mocks/usuarios.js';
import { guardarSesion, borrarSesion } from '../../session.js';
import { nuevoId } from '../../lib/ids.js';

const sesionDe = u => ({ usuario: vistaUsuario(u) });
const mismoTexto = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();

function validarRegistro(d) {
  const campos = {};
  if (!d.nombres) campos.nombres = 'Ingresa tus nombres.';
  if (!d.apellidos) campos.apellidos = 'Ingresa tus apellidos.';
  if (!esDniValido(d.dni)) campos.dni = 'El DNI debe tener 8 dígitos.';
  if (Number.isNaN(edad(d.fechaNacimiento))) campos.fechaNacimiento = 'Ingresa tu fecha de nacimiento.';
  if (!esCelularValido(d.celular)) campos.celular = 'El celular debe tener 9 dígitos y empezar con 9.';
  if (!esCorreoValido(d.correo)) campos.correo = 'Ingresa un correo válido.';
  if (!esApodoValido(d.apodo)) campos.apodo = 'Usa de 3 a 20 caracteres: letras, números, punto o guion bajo.';
  if (d.contrasena.length < LARGO_MIN_CONTRASENA) campos.contrasena = `La contraseña debe tener al menos ${LARGO_MIN_CONTRASENA} caracteres.`;
  if (d.confirmacionContrasena !== undefined && d.confirmacionContrasena !== d.contrasena) campos.confirmacionContrasena = 'Las contraseñas no coinciden.';
  if (!d.aceptaTerminos) campos.aceptaTerminos = 'Debes aceptar los términos y condiciones.';
  if (Object.keys(campos).length) throw new ErrorDominio('VALIDACION', { campos });
}

/** @type {import('../interfaces/auth.js').AuthService} */
export const authServiceMock = {
  registrar(datos) {
    return operacion(db => {
      const d = {
        ...datos,
        nombres: (datos.nombres ?? '').trim(), apellidos: (datos.apellidos ?? '').trim(),
        dni: (datos.dni ?? '').trim(), celular: (datos.celular ?? '').trim(),
        correo: (datos.correo ?? '').trim().toLowerCase(), apodo: (datos.apodo ?? '').trim(),
        contrasena: datos.contrasena ?? '',
      };
      validarRegistro(d);
      if (edad(d.fechaNacimiento) < EDAD_MINIMA) {
        throw new ErrorDominio('MENOR_DE_EDAD', { campos: { fechaNacimiento: 'Debes ser mayor de 18 años.' } });
      }
      if (db.usuarios.some(u => u.dni === d.dni)) throw new ErrorDominio('DNI_REGISTRADO', { campos: { dni: 'Ya existe una cuenta con este DNI.' } });
      if (db.usuarios.some(u => mismoTexto(u.correo, d.correo))) throw new ErrorDominio('CORREO_REGISTRADO', { campos: { correo: 'Ya existe una cuenta con este correo.' } });
      if (db.usuarios.some(u => mismoTexto(u.apodo, d.apodo))) throw new ErrorDominio('APODO_EN_USO', { campos: { apodo: 'Ese apodo ya está en uso.' } });

      const u = {
        id: nuevoId('u'), dni: d.dni, nombres: d.nombres, apellidos: d.apellidos, fechaNacimiento: d.fechaNacimiento,
        correo: d.correo, celular: d.celular, apodo: d.apodo, rol: 'PARTICIPANTE', estado: 'PENDIENTE_VERIFICACION',
        creadorVerificado: false, contrasena: d.contrasena,
      };
      db.usuarios.push(u);              // billetera en 0: aún no tiene movimientos
      guardarSesion(u.id);
      return sesionDe(u);
    });
  },

  iniciarSesion(usuario, contrasena) {
    return operacion(db => {
      const id = String(usuario ?? '').trim();
      const u = db.usuarios.find(x => mismoTexto(x.correo, id) || x.dni === id);
      if (!u || u.contrasena !== contrasena) throw new ErrorDominio('CREDENCIALES_INVALIDAS');
      if (u.estado === 'BLOQUEADO') throw new ErrorDominio('NO_AUTORIZADO', { mensaje: 'Tu cuenta está bloqueada. Escríbenos para ayudarte.' });
      guardarSesion(u.id);
      return sesionDe(u);
    });
  },

  // Fase 0: no hay Google real. Simula que la cuenta de Google pertenece a la participante de demo.
  iniciarSesionConGoogle() {
    return operacion(db => {
      const u = db.usuarios.find(x => x.id === 'u-lucia');
      guardarSesion(u.id);
      return sesionDe(u);
    });
  },

  cerrarSesion() {
    return operacion(() => { borrarSesion(); });
  },

  verificarCodigo(codigo) {
    return operacion(db => {
      const u = exigirSesion(db);
      if (String(codigo ?? '').trim() !== CODIGO_VERIFICACION_DEMO) throw new ErrorDominio('CODIGO_INCORRECTO');
      if (u.estado === 'PENDIENTE_VERIFICACION') u.estado = 'ACTIVO';
      return vistaUsuario(u);
    });
  },

  reenviarCodigo() {
    return operacion(db => {
      const u = exigirSesion(db);
      const [nombre, dominio] = u.correo.split('@');
      return { enviadoA: `${nombre[0]}***@${dominio} y al ${u.celular.slice(0, 1)}****${u.celular.slice(-4)}` };
    });
  },

  sesionActual() {
    return Promise.resolve(leerAhora(db => {
      const u = usuarioActual(db);
      return u ? sesionDe(u) : null;
    }));
  },

  solicitarRecuperacion(correo) {
    return operacion(db => {
      const c = (correo ?? '').trim();
      if (!esCorreoValido(c)) throw new ErrorDominio('VALIDACION', { campos: { correo: 'Ingresa un correo válido.' } });
      // Misma respuesta exista o no la cuenta. Fase 0: el enlace "enviado" siempre lleva el token de demo.
      const u = db.usuarios.find(x => mismoTexto(x.correo, c));
      if (u) db.recuperaciones.push({ token: TOKEN_RECUPERACION_DEMO, usuarioId: u.id, fecha: ahora(), vence: new Date(Date.now() + 3600000).toISOString(), usado: false });
    });
  },

  restablecerContrasena(token, contrasena, confirmacionContrasena) {
    return operacion(db => {
      const r = db.recuperaciones.findLast(x => x.token === String(token ?? '').trim() && !x.usado && x.vence > ahora());
      if (!r) throw new ErrorDominio('ENLACE_INVALIDO');
      const campos = {};
      if ((contrasena ?? '').length < LARGO_MIN_CONTRASENA) campos.contrasena = `La contraseña debe tener al menos ${LARGO_MIN_CONTRASENA} caracteres.`;
      if (confirmacionContrasena !== contrasena) campos.confirmacionContrasena = 'Las contraseñas no coinciden.';
      if (Object.keys(campos).length) throw new ErrorDominio('VALIDACION', { campos });
      db.usuarios.find(u => u.id === r.usuarioId).contrasena = contrasena;
      r.usado = true;
    });
  },

  cambiarApodo(apodo) {
    return operacion(db => {
      const u = exigirSesion(db);
      const nuevo = String(apodo ?? '').trim();
      if (!esApodoValido(nuevo)) throw new ErrorDominio('VALIDACION', { campos: { apodo: 'Usa de 3 a 20 caracteres: letras, números, punto o guion bajo.' } });
      if (db.usuarios.some(x => x.id !== u.id && mismoTexto(x.apodo, nuevo))) throw new ErrorDominio('APODO_EN_USO', { campos: { apodo: 'Ese apodo ya está en uso.' } });
      u.apodo = nuevo;
      return vistaUsuario(u);
    });
  },
};
