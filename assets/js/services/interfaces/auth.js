// Contrato de autenticación. Lo implementan services/mock (Fase 0) y services/http (Fase 1).

/**
 * @typedef {import('../../domain/usuario.js').Usuario} Usuario
 * @typedef {import('../../domain/usuario.js').Sesion} Sesion
 * @typedef {import('../../domain/usuario.js').DatosRegistro} DatosRegistro
 */

/**
 * @typedef {object} AuthService
 * @property {(datos: DatosRegistro) => Promise<Sesion>} registrar
 *   Crea la cuenta (billetera en 0) e inicia sesión. Queda pendiente de verificación.
 *   Errores: VALIDACION (con `campos`), DNI_REGISTRADO, CORREO_REGISTRADO, APODO_EN_USO, MENOR_DE_EDAD.
 * @property {(usuario: string, contrasena: string) => Promise<Sesion>} iniciarSesion
 *   `usuario` es el correo o el DNI. Error: CREDENCIALES_INVALIDAS.
 * @property {() => Promise<Sesion>} iniciarSesionConGoogle
 * @property {() => Promise<void>} cerrarSesion
 * @property {(codigo: string) => Promise<Usuario>} verificarCodigo   Error: CODIGO_INCORRECTO.
 * @property {() => Promise<{ enviadoA: string }>} reenviarCodigo
 * @property {() => Promise<Sesion|null>} sesionActual   Sin latencia: se usa para dibujar el header.
 * @property {(correo: string) => Promise<void>} solicitarRecuperacion
 *   Responde igual exista o no la cuenta (no revela qué correos están registrados).
 *   Si la cuenta existe, "envía" un enlace con un token para crear una contraseña nueva.
 * @property {(token: string, contrasena: string, confirmacionContrasena: string) => Promise<void>} restablecerContrasena
 *   Errores: ENLACE_INVALIDO (no existe, ya se usó o venció), VALIDACION (con `campos`).
 * @property {(apodo: string) => Promise<Usuario>} cambiarApodo
 *   Errores: SIN_SESION, VALIDACION (con `campos`), APODO_EN_USO.
 */

export const METODOS_AUTH = Object.freeze([
  'registrar', 'iniciarSesion', 'iniciarSesionConGoogle', 'cerrarSesion',
  'verificarCodigo', 'reenviarCodigo', 'sesionActual', 'solicitarRecuperacion', 'restablecerContrasena', 'cambiarApodo',
]);
