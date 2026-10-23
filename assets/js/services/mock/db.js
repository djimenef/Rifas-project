// Almacén de los servicios mock.
// - Persiste en localStorage (el sitio es estático y cada pantalla es una página distinta).
//   Si el almacenamiento no está disponible, el estado vive solo en memoria.
// - Simula la latencia de red (300–600 ms) para que se vean los estados de carga.
// - Cada operación es atómica: si falla, el estado vuelve a como estaba (README §7.10).
import { crearSemilla, VERSION_DATOS } from '../../mocks/semilla.js';

const CLAVE = 'dalechance.datos';
let estado = null;
let latencia = { min: 300, max: 600 };

function leerAlmacen() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const datos = crudo ? JSON.parse(crudo) : null;
    return datos?.version === VERSION_DATOS ? datos : null;
  } catch {
    return null;
  }
}

function escribirAlmacen() {
  try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch { /* sin almacenamiento: queda en memoria */ }
}

/** Estado actual (relee el almacén para ver cambios hechos en otra pestaña). */
function cargar() {
  estado = leerAlmacen() ?? estado ?? crearSemilla();
  return estado;
}

const esperar = () => new Promise(r => setTimeout(r, latencia.min + Math.random() * (latencia.max - latencia.min)));

/**
 * Ejecuta una lectura o una operación sobre los datos, con latencia simulada.
 * Devuelve una copia del resultado para que las pantallas no modifiquen los datos por accidente.
 * @template T @param {(db: object) => T} fn @returns {Promise<T>}
 */
export async function operacion(fn) {
  await esperar();
  const db = cargar();
  const respaldo = structuredClone(db);
  try {
    const resultado = fn(db);
    escribirAlmacen();
    return resultado === undefined ? undefined : structuredClone(resultado);
  } catch (error) {
    estado = respaldo;          // o se hace todo, o no se hace nada
    throw error;
  }
}

/** Lectura inmediata, sin latencia (p. ej. la sesión actual para dibujar el header). */
export function leerAhora(fn) {
  return structuredClone(fn(cargar()));
}

/** Vuelve a los datos de ejemplo iniciales (panel de demo y pruebas). */
export function reiniciarDatos() {
  estado = crearSemilla();
  escribirAlmacen();
}

/** Cambia la latencia simulada (las pruebas la ponen en 0). */
export function configurarLatencia(min, max = min) {
  latencia = { min, max };
}
