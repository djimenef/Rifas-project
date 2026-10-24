// Errores de negocio. Las pantallas muestran `mensaje` y deciden según `codigo`.

export const MENSAJES_ERROR = Object.freeze({
  SIN_SESION: 'Inicia sesión para continuar.',
  NO_AUTORIZADO: 'No tienes acceso a esta acción.',
  NO_ENCONTRADA: 'No encontramos lo que buscas.',
  LISTA_NO_DISPONIBLE: 'La lista de opciones se publica cuando la rifa se cierra.',
  VALIDACION: 'Revisa los datos ingresados.',
  DNI_REGISTRADO: 'Ya existe una cuenta con este DNI.',
  CORREO_REGISTRADO: 'Ya existe una cuenta con este correo.',
  APODO_EN_USO: 'Ese apodo ya está en uso. Prueba con otro.',
  MENOR_DE_EDAD: 'Debes ser mayor de 18 años para registrarte.',
  CREDENCIALES_INVALIDAS: 'El correo, DNI o contraseña no son correctos.',
  CODIGO_INCORRECTO: 'El código no es correcto. Revísalo e inténtalo de nuevo.',
  CUENTA_NO_VERIFICADA: 'Primero verifica tu cuenta.',
  SALDO_INSUFICIENTE: 'No tienes Chances suficientes. Recarga para continuar.',
  ESTADO_NO_ACEPTA_PUNTOS: 'Esta rifa no está recibiendo Chances en este momento.',
  LINK_EN_REVISION: 'Esta rifa está en revisión y todavía no recibe Chances.',
  CANTIDAD_INVALIDA: 'Ingresa una cantidad válida.',
  BAJO_MINIMO: 'La cantidad es menor al mínimo permitido.',
  SUPERA_MAXIMO: 'Superas el máximo de Chances por persona en esta rifa.',
  TOPE_ALCANZADO: 'Ya no quedan suficientes opciones en esta rifa.',
  PAGO_RECHAZADO: 'Tu pago fue rechazado. No se descontó nada. Inténtalo con otro medio de pago.',
  PAQUETE_INACTIVO: 'Ese paquete de recarga no está disponible.',
  RECARGA_FUERA_DE_RANGO: 'La cantidad a recargar está fuera del rango permitido.',
  TRANSICION_INVALIDA: 'La rifa no puede pasar a ese estado.',
  RIFA_CONFIRMADA_NO_SE_CANCELA: 'Una Rifa Confirmada siempre se rifa. Si el producto cambió o ya no existe, se entrega uno equivalente de igual o mayor valor. Solo se cancela por fuerza mayor legal.',
  MOTIVO_OBLIGATORIO: 'Indica el motivo.',
  DATOS_INCOMPLETOS: 'Faltan datos obligatorios.',
  LIMITE_PROPUESTAS: 'Alcanzaste el máximo de propuestas activas.',
  CATEGORIA_INVALIDA: 'Elige una categoría válida.',
  LINK_INVALIDO: 'El link del producto no es válido.',
  PRECIO_FUERA_DE_RANGO: 'El precio está fuera del rango permitido.',
  CUADRE: 'Error interno de cuadre de saldos. La operación se canceló.',
});

export class ErrorDominio extends Error {
  /**
   * @param {keyof typeof MENSAJES_ERROR} codigo
   * @param {{ mensaje?: string, campos?: Record<string, string>, datos?: object }} [extra]
   *   campos: errores por campo de formulario · datos: información adicional (p. ej. cuántos puntos faltan)
   */
  constructor(codigo, { mensaje, campos, datos } = {}) {
    super(mensaje ?? MENSAJES_ERROR[codigo] ?? codigo);
    this.name = 'ErrorDominio';
    this.codigo = codigo;
    this.campos = campos;
    this.datos = datos;
  }
}
