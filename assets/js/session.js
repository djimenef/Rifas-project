// Sesión simulada de la Fase 0, guardada en localStorage.
// Si el navegador bloquea el almacenamiento, la sesión vive solo en memoria (se pierde al cambiar de página).

const CLAVE = 'dalechance.sesion';
let enMemoria = null;

/** @returns {{ usuarioId: string, inicio: string } | null} */
export function leerSesion() {
  try {
    const valor = localStorage.getItem(CLAVE);
    return valor ? JSON.parse(valor) : enMemoria;
  } catch {
    return enMemoria;
  }
}

export function guardarSesion(usuarioId) {
  enMemoria = { usuarioId, inicio: new Date().toISOString() };
  try { localStorage.setItem(CLAVE, JSON.stringify(enMemoria)); } catch { /* sin almacenamiento: queda en memoria */ }
}

export function borrarSesion() {
  enMemoria = null;
  try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
}
