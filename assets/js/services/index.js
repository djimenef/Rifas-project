// Punto único de acceso a los servicios. Las pantallas importan SOLO desde aquí,
// nunca desde services/mock ni desde mocks/ (README §3).
// En la Fase 1 basta con cambiar estas cuatro líneas por las implementaciones de services/http.
import { authServiceMock } from './mock/auth.js';
import { billeteraServiceMock } from './mock/billetera.js';
import { rifasServiceMock } from './mock/rifas.js';
import { adminServiceMock } from './mock/admin.js';
import { METODOS_AUTH } from './interfaces/auth.js';
import { METODOS_BILLETERA } from './interfaces/billetera.js';
import { METODOS_RIFAS } from './interfaces/rifas.js';
import { METODOS_ADMIN } from './interfaces/admin.js';

/** Falla al cargar si una implementación no cumple su interfaz. */
function implementa(nombre, servicio, metodos) {
  const faltan = metodos.filter(m => typeof servicio[m] !== 'function');
  if (faltan.length) throw new Error(`${nombre} no implementa: ${faltan.join(', ')}`);
  return servicio;
}

/** @type {import('./interfaces/auth.js').AuthService} */
export const authService = implementa('AuthService', authServiceMock, METODOS_AUTH);
/** @type {import('./interfaces/billetera.js').BilleteraService} */
export const billeteraService = implementa('BilleteraService', billeteraServiceMock, METODOS_BILLETERA);
/** @type {import('./interfaces/rifas.js').RifasService} */
export const rifasService = implementa('RifasService', rifasServiceMock, METODOS_RIFAS);
/** @type {import('./interfaces/admin.js').AdminService} */
export const adminService = implementa('AdminService', adminServiceMock, METODOS_ADMIN);

export { ErrorDominio } from '../domain/errores.js';
export { nuevaClaveIdempotencia } from '../lib/ids.js';
