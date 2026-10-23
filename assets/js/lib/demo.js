// Estado de pantalla forzado desde el panel de demo (solo Fase 0): 'cargando' · 'vacio' · 'error'.
// Se guarda por página en sessionStorage, así que se limpia al cerrar la pestaña.

const CLAVE = 'dalechance.demo.estados';

function leer() {
  try { return JSON.parse(sessionStorage.getItem(CLAVE) ?? '{}'); } catch { return {}; }
}

/** @returns {'cargando'|'vacio'|'error'|null} */
export const estadoForzado = (pagina = location.pathname) => leer()[pagina] ?? null;

/** @param {'cargando'|'vacio'|'error'|null} estado null = normal */
export function forzarEstado(estado, pagina = location.pathname) {
  const todos = leer();
  if (estado) todos[pagina] = estado; else delete todos[pagina];
  try { sessionStorage.setItem(CLAVE, JSON.stringify(todos)); } catch { /* sin almacenamiento */ }
}
