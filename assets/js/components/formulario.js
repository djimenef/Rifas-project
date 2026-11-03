// Errores por campo de un formulario: los mensajes vienen de los servicios (ErrorDominio con `campos`)
// y se muestran junto a cada campo, con aria-invalid y aria-describedby.
// Para grupos de opciones (radio), el mensaje va al final de su <fieldset>.

function partes(form, nombre) {
  const campo = form.elements[nombre];
  if (!campo) return null;
  const grupo = campo instanceof RadioNodeList;
  const controles = grupo ? [...campo] : [campo];
  const contenedor = grupo ? controles[0]?.closest('fieldset') : (campo.closest('label') ?? campo.parentElement);
  return contenedor ? { controles, contenedor } : null;
}

/** Quita el error de un campo. */
export function limpiarError(form, nombre) {
  const p = partes(form, nombre);
  if (!p) return;
  p.controles.forEach(c => { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); });
  p.contenedor.querySelector(`#error-${nombre}`)?.remove();
}

/** Quita todos los errores del formulario. */
export function limpiarErrores(form) {
  new Set([...form.elements].map(c => c.name).filter(Boolean)).forEach(n => limpiarError(form, n));
}

/**
 * Muestra el mensaje junto al campo. Devuelve false si el formulario no tiene ese campo.
 * @param {HTMLFormElement} form @param {string} nombre @param {string} mensaje
 */
export function mostrarError(form, nombre, mensaje) {
  const p = partes(form, nombre);
  if (!p) return false;
  limpiarError(form, nombre);
  const span = document.createElement('span');
  span.className = 'field-error';
  span.id = `error-${nombre}`;
  span.textContent = mensaje;
  p.contenedor.appendChild(span);
  p.controles.forEach(c => { c.setAttribute('aria-invalid', 'true'); c.setAttribute('aria-describedby', span.id); });
  return true;
}

/**
 * Muestra los errores de un ErrorDominio y lleva el foco al primer campo con error.
 * @returns {boolean} true si al menos un error quedó junto a su campo
 */
export function mostrarErrores(form, campos = {}) {
  const mostrados = Object.entries(campos).filter(([n, m]) => mostrarError(form, n, m)).map(([n]) => n);
  const primero = mostrados[0] && form.elements[mostrados[0]];
  (primero instanceof RadioNodeList ? primero[0] : primero)?.focus();
  return mostrados.length > 0;
}

/** Limpia el error de un campo apenas la persona lo cambia. */
export function limpiarAlEscribir(form) {
  const limpiar = e => { if (e.target.name) limpiarError(form, e.target.name); };
  form.addEventListener('input', limpiar);
  form.addEventListener('change', limpiar);
}
