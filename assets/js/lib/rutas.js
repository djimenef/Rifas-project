// Resuelve rutas internas desde la raíz del sitio, sin importar en qué carpeta esté la página.
// Funciona igual en http://localhost:8000/ y si el sitio se publica en una subcarpeta.
const RAIZ = new URL('../../../', import.meta.url);

/** @param {string} destino ruta relativa a la raíz, p. ej. 'rifas/' o 'iniciar-sesion.html' */
export function ruta(destino = '') {
  const url = new URL(destino, RAIZ);
  return url.pathname + url.search + url.hash;
}
