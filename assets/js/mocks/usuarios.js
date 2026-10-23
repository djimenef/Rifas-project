// Datos falsos: usuarios. Personas ficticias; las contraseñas son solo para la demo.
// Credenciales de demo:
//   participante → lucia@dalechance.pe / demo123
//   administrador → admin@dalechance.pe / admin123
//   creador verificado → vale@dalechance.pe / demo123
//   participante sin movimientos → carlos@dalechance.pe / demo123

export const CODIGO_VERIFICACION_DEMO = '123456';

export const usuariosMock = [
  {
    id: 'u-lucia', dni: '45871236', nombres: 'Lucía', apellidos: 'Quispe Ramos', fechaNacimiento: '1996-04-12',
    correo: 'lucia@dalechance.pe', celular: '987654321', apodo: 'lucia_q', rol: 'PARTICIPANTE', estado: 'ACTIVO',
    creadorVerificado: false, contrasena: 'demo123',
  },
  {
    id: 'u-admin', dni: '40112233', nombres: 'Ana', apellidos: 'Salazar Vega', fechaNacimiento: '1990-09-03',
    correo: 'admin@dalechance.pe', celular: '912345678', apodo: 'equipo_dc', rol: 'ADMIN', estado: 'ACTIVO',
    creadorVerificado: false, contrasena: 'admin123',
  },
  {
    id: 'u-vale', dni: '47223344', nombres: 'Valeria', apellidos: 'Torres Medina', fechaNacimiento: '1999-01-25',
    correo: 'vale@dalechance.pe', celular: '956781234', apodo: 'vale_moda', rol: 'PARTICIPANTE', estado: 'ACTIVO',
    creadorVerificado: true, contrasena: 'demo123',
  },
  {
    id: 'u-carlos', dni: '72345678', nombres: 'Carlos', apellidos: 'Rojas Huamán', fechaNacimiento: '2001-11-30',
    correo: 'carlos@dalechance.pe', celular: '934567812', apodo: 'carlos_r', rol: 'PARTICIPANTE', estado: 'ACTIVO',
    creadorVerificado: false, contrasena: 'demo123',
  },
];
