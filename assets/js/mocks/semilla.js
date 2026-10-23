// Arma el estado inicial completo de los datos falsos, con fechas relativas a `ahora`.
import { categoriasMock, paquetesRecargaMock, tiendasConfiablesMock } from './catalogos.js';
import { LIMITES_RECARGA_POR_DEFECTO } from '../domain/billetera.js';
import { usuariosMock } from './usuarios.js';
import { rifasMock } from './rifas.js';
import { recargasMock, movimientosMock, compromisosMock, ticketsMock } from './participaciones.js';

export const VERSION_DATOS = 2;   // súbela si cambia la forma de los datos: el navegador vuelve a los de ejemplo

/** @param {number} ahora milisegundos */
export function crearSemilla(ahora = Date.now()) {
  const t = (dias, horas = 0) => new Date(ahora + dias * 864e5 + horas * 36e5).toISOString();
  return {
    version: VERSION_DATOS,
    creado: t(0),
    usuarios: structuredClone(usuariosMock),
    categorias: structuredClone(categoriasMock),
    paquetes: structuredClone(paquetesRecargaMock),
    configuracion: { recarga: { ...LIMITES_RECARGA_POR_DEFECTO } },
    tiendas: structuredClone(tiendasConfiablesMock),
    rifas: rifasMock(t),
    recargas: recargasMock(t),
    movimientos: movimientosMock(t),
    compromisos: compromisosMock(t),
    tickets: ticketsMock(),
    idempotencia: {},
    secuencias: { operacion: 500 },
  };
}
