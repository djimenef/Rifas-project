// Dominio: participantes, administradores y sesión. Refleja README §7.1, §7.2 y §7.3.

/** @typedef {'PARTICIPANTE'|'ADMIN'} Rol */
/** @typedef {'PENDIENTE_VERIFICACION'|'ACTIVO'|'BLOQUEADO'} EstadoUsuario */

/**
 * Usuario tal como lo ven las pantallas: nunca incluye la contraseña ni el DNI completo.
 * @typedef {{
 *   id: string, nombres: string, apellidos: string, apodo: string, correo: string, celular: string,
 *   dniEnmascarado: string, fechaNacimiento: string, rol: Rol, estado: EstadoUsuario, creadorVerificado: boolean,
 * }} Usuario
 */

/** @typedef {{ usuario: Usuario }} Sesion */

/**
 * Datos del formulario de registro.
 * @typedef {{
 *   nombres: string, apellidos: string, dni: string, fechaNacimiento: string, celular: string,
 *   correo: string, apodo: string, contrasena: string, confirmacionContrasena?: string, aceptaTerminos: boolean,
 * }} DatosRegistro
 */

export const EDAD_MINIMA = 18;
export const LARGO_MIN_CONTRASENA = 6;

export const esDniValido = dni => /^[0-9]{8}$/.test(dni ?? '');
export const esCelularValido = cel => /^9[0-9]{8}$/.test(cel ?? '');
export const esCorreoValido = correo => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo ?? '');
export const esApodoValido = apodo => /^[a-z0-9._]{3,20}$/i.test(apodo ?? '');

/** Edad cumplida a la fecha `hoy` (invariante 2). */
export function edad(fechaNacimiento, hoy = new Date()) {
  const n = new Date(fechaNacimiento + 'T00:00:00');
  if (Number.isNaN(n.getTime())) return NaN;
  let anios = hoy.getFullYear() - n.getFullYear();
  const aunNoCumple = hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate());
  return aunNoCumple ? anios - 1 : anios;
}

/** "****5678": el público y las pantallas nunca ven el DNI completo. */
export const enmascararDni = dni => '****' + String(dni).slice(-4);
