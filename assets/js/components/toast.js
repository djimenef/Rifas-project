// Mensajes breves en la parte inferior ("¡Listo! Pusiste 5 Chances", "Enlace copiado").

let contenedor;

/**
 * @param {string} texto
 * @param {{ tipo?: 'ok' | 'error', duracion?: number }} [opciones]
 */
export function mostrarToast(texto, { tipo = 'ok', duracion = 3500 } = {}) {
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'toasts';
    contenedor.setAttribute('aria-live', 'polite');
    document.body.appendChild(contenedor);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
  const icono = document.createElement('span');
  icono.className = 'toast-icono';
  icono.setAttribute('aria-hidden', 'true');
  icono.textContent = tipo === 'error' ? '!' : '✓';
  toast.append(icono, texto);
  contenedor.appendChild(toast);
  setTimeout(() => toast.remove(), duracion);
}
